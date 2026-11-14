import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { MongoMemoryServer } from "mongodb-memory-server";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { MongoClient } from "mongodb";
import { getDb } from "../src/lib/mongodb";
import { buildDefaultPageContents, saveCmsRecord, transitionCmsRecord, listCmsDrafts, getPublishedCmsCollection, listContentVersions, publishDueContent, deleteCmsRecord, getPublishedCmsHomePageContent } from "../src/lib/cms-store";
import { signAdminSessionToken, persistAdminSession, requireAdminRequest, revokeAdminSession } from "../src/lib/admin-auth";
import { GET as overview } from "../src/app/api/admin/cms/route";
import { GET as enquiries, POST as submitEnquiry } from "../src/app/api/enquiries/route";
import { GET as cron } from "../src/app/api/internal/publish/route";
import { POST as login } from "../src/app/api/admin/auth/route";
import { safeUrl } from "../src/lib/cms-validation";
import { sendEnquiryNotification } from "../src/lib/enquiry-email";
import { mediaReferences } from "../src/lib/media-store";
let mongo:MongoMemoryServer;
let token:string;
const request=(url:string,body?:unknown,cookie?:string)=>new Request(`http://localhost:3000${url}`,{method:body===undefined?"GET":"POST",headers:{"Content-Type":"application/json",...(cookie?{cookie:`atelier_admin_session=${cookie}`}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
before(async()=>{
 mongo=await MongoMemoryServer.create();process.env.MONGODB_URI=mongo.getUri();process.env.MONGODB_DB_NAME="atelier_test";process.env.ADMIN_AUTH_SECRET=randomBytes(32).toString("hex");process.env.INITIAL_ADMIN_EMAIL="admin@example.test";process.env.INITIAL_ADMIN_PASSWORD="test-only-password";
 token=signAdminSessionToken("admin@example.test");await persistAdminSession(token);
});
after(async()=>{await (await(globalThis as typeof globalThis&{atelierMongo?:Promise<MongoClient>}).atelierMongo)?.close();await mongo?.stop();});
test("private enquiry listing, admin overview, cron and mutations reject anonymous requests",async()=>{
 for(const endpoint of [enquiries,overview,cron]){const result=await endpoint(request("/api/test"));assert.equal(result.status,401);assert.match(result.headers.get("cache-control")||"",/no-store/);assert.equal((await result.json()).ok,false);}
 const auth=await requireAdminRequest(request("/api/admin/cms",{},undefined));assert.equal(auth.ok,false);
});
test("login creates HTTP-only server session; logout revokes copied cookie",async()=>{
 const response=await login(request("/api/admin/auth",{email:"admin@example.test",password:"test-only-password"}));assert.equal(response.status,200);assert.match(response.headers.get("set-cookie")||"",/HttpOnly/);
 const copied=signAdminSessionToken("admin@example.test");await persistAdminSession(copied);assert.equal((await requireAdminRequest(request("/api/admin/cms",undefined,copied))).ok,true);await revokeAdminSession(request("/api/admin/auth",undefined,copied));assert.equal((await requireAdminRequest(request("/api/admin/cms",undefined,copied))).ok,false);
 const forged=new Request("http://localhost:3000/api/admin/cms",{method:"POST",headers:{cookie:`atelier_admin_session=${token}`,origin:"https://attacker.test"}});const auth=await requireAdminRequest(forged);assert.equal(auth.ok,false);if(!auth.ok)assert.equal(auth.response.status,403);
});
test("draft saves stay private; publish, update, rollback, unpublish and conflict control work",async()=>{
 const initial=buildDefaultPageContents()[0];initial.hero.heading="First published headline";
 const draft=await saveCmsRecord("pages",initial,"test");assert.equal((await getPublishedCmsCollection("pages")).length,0);
 await transitionCmsRecord("pages",initial.id,"publish","test");assert.equal((await getPublishedCmsHomePageContent()).hero.headlineLine1,"First published headline");
 const rows=await listCmsDrafts<typeof draft>("pages");await saveCmsRecord("pages",{...rows[0],hero:{...initial.hero,heading:"Private edited headline"}},"test");assert.equal((await getPublishedCmsHomePageContent()).hero.headlineLine1,"First published headline");
 await assert.rejects(saveCmsRecord("pages",rows[0],"test"),/changed/);
 const versions=await listContentVersions("pages",initial.id);assert.ok(versions.length>=2);await transitionCmsRecord("pages",initial.id,"restore","test",{versionId:versions.at(-1)!.id});
 await transitionCmsRecord("pages",initial.id,"unpublish","test");assert.equal((await getPublishedCmsCollection("pages")).length,0);
});
test("scheduled snapshot publishes once using durable server state",async()=>{
 const page=buildDefaultPageContents()[1];await saveCmsRecord("pages",page,"test");await transitionCmsRecord("pages",page.id,"schedule","test",{publishAt:new Date(Date.now()+60_000).toISOString()});assert.equal((await getPublishedCmsCollection("pages")).length,0);
 await(await getDb()).collection("pages").updateOne({id:page.id},{$set:{publishAt:new Date(Date.now()-1_000).toISOString()}});assert.equal(await publishDueContent(),1);assert.equal(await publishDueContent(),0);assert.equal((await getPublishedCmsCollection("pages")).length,1);
});
test("valid public enquiry persists without email credentials; only reference returned; duplicates reuse record",async()=>{
 const body={fullName:"Private Test Customer",email:"customer@example.test",message:"Please contact me about a custom printed wall.",sourcePage:"/contact",honeypot:""};
 const result=await submitEnquiry(request("/api/enquiries",body));assert.equal(result.status,201);const data=await result.json();assert.ok(data.referenceCode);assert.equal(data.email,undefined);assert.equal(data.enquiry,undefined);
 const repeat=await submitEnquiry(request("/api/enquiries",body));assert.equal((await repeat.json()).deduplicated,true);
 const row=await(await getDb()).collection("enquiries").findOne({email:body.email});assert.ok(row);assert.equal(row.emailStatus,"failed");assert.equal(await(await getDb()).collection("enquiries").countDocuments(),1);
 const invalid=await submitEnquiry(request("/api/enquiries",{...body,email:"invalid"}));assert.equal(invalid.status,400);
 const spam=await submitEnquiry(request("/api/enquiries",{...body,honeypot:"bot"}));assert.equal(spam.status,400);
});
test("Resend accepted state and retry deduplication use mocked provider, never mark delivered",async()=>{
 const db=await getDb();const row=await db.collection("enquiries").findOne({});assert.ok(row);await db.collection("enquiries").updateOne({id:row.id},{$set:{emailStatus:"pending",emailAttempts:0}});
 process.env.RESEND_API_KEY="test-key";process.env.RESEND_FROM_EMAIL="studio@example.test";process.env.ADMIN_NOTIFICATION_EMAIL="owner@example.test";
 const original=globalThis.fetch;let attempts=0;
 globalThis.fetch=async(_input,init)=>{attempts++;assert.ok(new Headers(init?.headers).get("Idempotency-Key"));return Response.json({id:"test-email-id"});};
 try{await sendEnquiryNotification(row.id);await sendEnquiryNotification(row.id);const saved=await db.collection("enquiries").findOne({id:row.id});assert.equal(saved?.emailStatus,"sent");assert.equal(attempts,1);}finally{globalThis.fetch=original;delete process.env.RESEND_API_KEY;}
});
test("unsafe URLs are rejected and media reference survives draft/public changes",async()=>{
 for(const url of ["javascript:alert(1)","//evil.test/x","data:image/svg+xml,bad","/\\evil.test","https://safe.test\u0000"])assert.equal(safeUrl.safeParse(url).success,false,url);
 const page=buildDefaultPageContents()[2];page.hero.posterImage={publicId:"test-media",secureUrl:"https://res.cloudinary.com/test/image/upload/asset.jpg",resourceType:"image",altText:"Test"};await saveCmsRecord("pages",page,"test");assert.ok((await mediaReferences(page.hero.posterImage)).length);
 await(await getDb()).collection("media_assets").insertOne({id:"test-media",secureUrl:page.hero.posterImage.secureUrl,deletionState:"deleting"});await assert.rejects(transitionCmsRecord("pages",page.id,"publish","test"),/being removed/);await deleteCmsRecord("pages",page.id,"test");
});
test("migration reruns do not duplicate or publish fixture data and source stays unchanged",async()=>{
 const migrationDb="atelier_migration_test";const dir=await mkdtemp(path.join(tmpdir(),"atelier-migration-"));
 // Exercise the repository's actual explicit migration twice against isolated MongoDB.
 const source=path.resolve(".data/designs.json");let beforeText:string;try{beforeText=await readFile(source,"utf8");}catch{return;}
 for(let i=0;i<2;i++){
  const result=spawnSync(process.execPath,["--import","tsx","scripts/migrate-cms.ts","--apply"],{cwd:process.cwd(),env:{...process.env,MONGODB_DB_NAME:migrationDb},encoding:"utf8"});assert.equal(result.status,0,result.stderr||result.stdout);
 }
 const client=new MongoClient(process.env.MONGODB_URI!);await client.connect();const db=client.db(migrationDb);assert.equal(await db.collection("designs").countDocuments(),39);assert.equal(await db.collection("designs").countDocuments({published:{$ne:null}}),0);assert.equal(await readFile(source,"utf8"),beforeText);await client.close();await rm(dir,{recursive:true,force:true});
});
