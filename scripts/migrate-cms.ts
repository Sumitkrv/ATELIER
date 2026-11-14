/** Explicit, resumable migration. No implicit startup seeding; source files remain untouched. */
import { loadEnvConfig } from "@next/env";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { getDb } from "../src/lib/mongodb";
import { cmsSchemas, type CmsCollection } from "../src/lib/cms-validation";
import { buildDefaultPageContents, buildDefaultSiteSettings } from "../src/lib/cms-store";
import { DESIGN_CATEGORY_RECORDS } from "../src/lib/designs-catalogue";
import { enquirySubmissionSchema } from "../src/types/models";

loadEnvConfig(process.cwd());
const apply=process.argv.includes("--apply");
const initialize=process.argv.includes("--initialize");
const source=path.resolve(process.env.CMS_MIGRATION_SOURCE||".data");
const mapping:Record<string,CmsCollection|"enquiries">={"categories.json":"categories","designs.json":"designs","projects.json":"projects","blogs.json":"blogs","page-contents.json":"pages","site-settings.json":"site_settings","enquiries.json":"enquiries"};
async function run(){
 const sources:Array<{file:string;name:CmsCollection|"enquiries";raw:string;records:unknown[];backup:boolean}>=[];
 for(const [file,name] of Object.entries(mapping)){
  try{const raw=await fs.readFile(path.join(source,file),"utf8");const data=JSON.parse(raw);sources.push({file,name,raw,records:Array.isArray(data)?data:[data],backup:true});}
  catch(e){if((e as NodeJS.ErrnoException).code!=="ENOENT")throw new Error(`Cannot parse ${file}. Migration stopped before writes.`);}
 }
 if(initialize){for(const [file,name,records] of [["pages-initial.json","pages",buildDefaultPageContents()],["settings-initial.json","site_settings",[buildDefaultSiteSettings()]],["categories-initial.json","categories",[...DESIGN_CATEGORY_RECORDS]]] as const){sources.push({file,name,records:[...records],raw:JSON.stringify(records),backup:false});}}
 const errors:string[]=[];
 for(const source of sources){source.records=source.records.filter((record,index)=>{
  const valid=source.name==="enquiries"?enquirySubmissionSchema.safeParse(record):cmsSchemas[source.name].safeParse(record);
  if(!valid.success){errors.push(`${source.file} record ${index+1}: ${valid.error.issues.map(i=>`${i.path.join(".")} ${i.message}`).join("; ")}`);return false;}return true;
 });}
 if(errors.length){for(const error of errors)console.error(error);throw new Error("Invalid source records. No database writes performed. Correct records in a COPY of source, then use CMS_MIGRATION_SOURCE.");}
 console.log(JSON.stringify({mode:apply?"apply":"dry-run",collections:sources.map(s=>({file:s.file,collection:s.name,valid:s.records.length})),note:"All imports are drafts; publish approved content from the admin panel."},null,2));
 if(!apply)return;
 const backup=path.resolve(".backups",`cms-${new Date().toISOString().replace(/[:.]/g,"-")}`);await fs.mkdir(backup,{recursive:true,mode:0o700});
 for(const s of sources)if(s.backup)await fs.writeFile(path.join(backup,s.file),s.raw,{mode:0o600,flag:"wx"});
 const db=await getDb();const report=[];
 for(const s of sources){let inserted=0;let skipped=0;
  const c=db.collection(s.name);await c.createIndex({id:1},{unique:true});
  for(const record of s.records){const d=record as Record<string,unknown>;const id=String(d.id||`migration-${crypto.createHash("sha256").update(JSON.stringify(d)).digest("hex").slice(0,24)}`);const now=new Date().toISOString();
   const imported=s.name==="enquiries"?{...d,id,adminNotes:d.adminNotes||[],status:d.status||"New",createdAt:d.createdAt||now,updatedAt:now,emailStatus:d.emailSent?"sent":"failed",emailAttempts:5,emailLastError:"Imported enquiry. Historical delivery state has not been verified."}:{id,revision:1,status:"draft",draft:{...d,id,published:false},published:null,publishAt:null,scheduled:null,deletedAt:null,createdAt:d.createdAt||now,updatedAt:now};
   const result=await c.updateOne({id},{$setOnInsert:imported},{upsert:true});if(result.upsertedCount)inserted++;else skipped++;
   const found=await c.findOne({id});if(!found)throw new Error(`Verification failed for ${s.name}/${id}`);
   if(result.upsertedCount && s.name!=="enquiries" && JSON.stringify(found.draft)!==JSON.stringify((imported as {draft?:unknown}).draft))throw new Error(`Content verification failed for ${s.name}/${id}`);
  }report.push({collection:s.name,inserted,skipped,verified:s.records.length,total:await c.countDocuments()});
 }
 const result={backup,completedAt:new Date().toISOString(),report};await fs.writeFile(path.join(backup,"report.json"),JSON.stringify(result,null,2),{mode:0o600});console.log(JSON.stringify(result,null,2));
}
run().then(()=>process.exit(0)).catch(()=>{console.error("Migration stopped. Check validation output and database configuration. Existing records and local source files were preserved.");process.exit(1);});
