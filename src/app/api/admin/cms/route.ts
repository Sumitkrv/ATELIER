import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { requireAdminRequest } from "@/lib/admin-auth";
import { getDb, StorageUnavailableError } from "@/lib/mongodb";
import { CmsError, deleteCmsRecord, getStoredSiteSettings, listCmsDrafts, listStoredPageContents, listContentVersions, saveCmsRecord, transitionCmsRecord } from "@/lib/cms-store";
import type { CmsCollection } from "@/lib/cms-validation";
import { listStoredEnquiries } from "@/lib/enquiries-store";
import { computeReadingTimeMinutes } from "@/lib/blogs-catalogue";
import { getEnvironmentReadiness } from "@/lib/env";
import { privateJson, readJsonBody, RequestError } from "@/lib/request-security";
import type { Document } from "mongodb";

const collectionNames:Record<string,CmsCollection>={categories:"categories",designs:"designs",projects:"projects",blogs:"blogs",content:"pages",settings:"site_settings"};
const slug=(v:string)=>v.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
const strings=(v:unknown):string[]=>Array.isArray(v)?v.map(String):String(v||"").split(",").map(s=>s.trim()).filter(Boolean);
const media=(url:string,title:string,type:"image"|"video"="image")=>({publicId:"",secureUrl:url,resourceType:type,altText:title});
function errorResponse(e:unknown){
 if(e instanceof ZodError)return privateJson({ok:false,error:e.issues.map(i=>`${i.path.join(".")}: ${i.message}`).join("; ")},400);
 if(e instanceof CmsError)return privateJson({ok:false,error:e.message},e.statusCode);
 if(e instanceof RequestError)return privateJson({ok:false,error:e.message},e.status);
 if(e instanceof StorageUnavailableError)return privateJson({ok:false,error:e.message},503);
 if(e&&typeof e==="object"&&"code" in e&&e.code===11000)return privateJson({ok:false,error:"This slug or identifier is already in use."},409);
 return privateJson({ok:false,error:"Unable to access content storage. Please try again."},503);
}
export async function GET(request:Request){
 const auth=await requireAdminRequest(request);if(!auth.ok)return auth.response;
 try{
  const params=new URL(request.url).searchParams;const key=params.get("collection")||"overview";
  if(key==="versions"){const name=collectionNames[params.get("targetCollection")||""];if(!name)throw new CmsError("Choose a content type.");return privateJson({ok:true,versions:await listContentVersions(name,params.get("id")||"")});}
  if(key==="activity")return privateJson({ok:true,activity:await(await getDb()).collection("audit_logs").find({},{projection:{_id:0}}).sort({createdAt:-1}).limit(30).toArray()});
  if(key==="overview"){
   const db=await getDb(); const counts:Record<string,number>={};
   for(const name of ["designs","projects","blogs","categories"]){counts[`${name}Total`]=await db.collection(name).countDocuments({deletedAt:{$in:[null]}});counts[`${name}${name==="categories"?"Active":"Published"}`]=await db.collection(name).countDocuments({published:{$ne:null},deletedAt:{$in:[null]}});}
   const enquiries=await listStoredEnquiries();counts.enquiriesTotal=await db.collection("enquiries").countDocuments();counts.enquiriesOpen=await db.collection("enquiries").countDocuments({status:{$nin:["Closed","Converted"]}});counts.enquiriesNew=await db.collection("enquiries").countDocuments({status:{$in:["New","new"]}});counts.pendingFollowups=await db.collection("enquiries").countDocuments({followUpAt:{$lte:new Date().toISOString()},status:{$nin:["Closed","Converted"]}});
   return privateJson({ok:true,authenticated:true,session:{email:auth.session.email,role:auth.session.role},readiness:getEnvironmentReadiness(),counts,recentEnquiries:enquiries.slice(0,5),brandName:(await getStoredSiteSettings()).brandName,recentActivity:await db.collection("audit_logs").find({},{projection:{_id:0}}).sort({createdAt:-1}).limit(10).toArray()});
  }
  const name=collectionNames[key];if(!name)throw new CmsError("Unknown content type.");
  const docs=key==="content"?await listStoredPageContents():key==="settings"?[await getStoredSiteSettings()]:await listCmsDrafts<Document>(name);
  const q=(params.get("q")||"").toLowerCase();const filtered=docs.filter(d=>!q||JSON.stringify(d).toLowerCase().includes(q));
  const offset=Math.max(0,Number(params.get("offset"))||0);const limit=Math.max(1,Math.min(500,Number(params.get("limit"))||500));
  const result:Document={ok:true,authenticated:true,total:filtered.length,offset,limit,[key==="content"?"pages":key]:key==="settings"?docs[0]:filtered.slice(offset,offset+limit)};
  if(key==="designs")result.categories=await listCmsDrafts("categories");
  return privateJson(result);
 }catch(e){return errorResponse(e);}
}
async function buildRecord(name:CmsCollection,b:Document):Promise<Document>{
 const existing=(await listCmsDrafts<Document>(name)).find(d=>d.id===(b.id||b.page?.id||b.settings?.id));
 const now=new Date().toISOString();
 if(name==="pages")return {...b.page,id:`page-${b.page?.pageKey}`,revision:b.page?.revision};
 if(name==="site_settings"){
  const cur=await getStoredSiteSettings();const p=b.settings||{};
  return {...cur,...p,id:"site-settings-global",singletonKey:"global",contact:{...cur.contact,...p.contact},socialLinks:{...cur.socialLinks,...p.socialLinks},visualizer:{...cur.visualizer,...p.visualizer},defaultSeo:{...cur.defaultSeo,...p.defaultSeo}};
 }
 const title=String(b.title||b.name||existing?.title||"").trim();const recordSlug=slug(String(b.slug||existing?.slug||title));
 const base={...existing,id:b.id||crypto.randomUUID(),title,slug:recordSlug,createdAt:existing?.createdAt||now,updatedAt:now,revision:b.revision??existing?.revision};
 if(name==="categories")return {...existing,id:base.id,name:String(b.name||existing?.name||"").trim(),slug:recordSlug,slotNumber:b.slotNumber||existing?.slotNumber||(await listCmsDrafts(name)).length+1,slotCode:existing?.slotCode||`CAT-${crypto.randomUUID().slice(0,6)}`,shortTitle:String(b.name||existing?.name||""),description:b.description??existing?.description??"",coverImage:b.coverImageUrl!==undefined?(b.coverImageUrl?media(b.coverImageUrl,title):null):existing?.coverImage||null,displayOrder:Number(b.displayOrder??existing?.displayOrder??0),isActive:b.isActive??existing?.isActive??true,isConfigured:true,revision:base.revision};
 const imageUrl=String(b.imageUrl??existing?.coverImage?.secureUrl??"").trim();
 const galleries=b.galleryImageUrls!==undefined?strings(b.galleryImageUrls).map((url,i)=>media(url,`${title} ${i+1}`)):existing?.galleryMedia||[];
 const shared={...base,summary:b.summary??existing?.summary??"",description:b.description??existing?.description??"",coverImage:media(imageUrl,b.altText||existing?.coverImage?.altText||title),galleryMedia:galleries,videoAsset:b.videoUrl!==undefined?(b.videoUrl?media(b.videoUrl,title,"video"):null):existing?.videoAsset||null,featured:b.featured??existing?.featured??false,published:false,isDevelopmentFixture:false};
 if(name==="designs"){
  const cats=await listCmsDrafts<Document>("categories");const cat=cats.find(c=>c.id===b.categoryId||c.slotNumber===Number(b.categorySlotNumber))||cats.find(c=>c.id===existing?.categoryId);if(!cat)throw new CmsError("Create and select a category first.");
  return {...shared,categoryId:cat.id,categorySlug:cat.slug,categorySlotNumber:cat.slotNumber,categoryCode:cat.slotCode,categoryLabel:cat.name,tags:b.tags!==undefined?strings(b.tags):existing?.tags||[],compatibleSurfaces:b.compatibleSurfaces!==undefined?strings(b.compatibleSurfaces):existing?.compatibleSurfaces||["Walls"],dimensionsNote:b.dimensionsNote??existing?.dimensionsNote??"",aspectRatio:b.aspectRatio||existing?.aspectRatio||"landscape",sortOrder:Number(b.displayOrder??b.sortOrder??existing?.sortOrder??0),visualizerConfig:{defaultMode:b.defaultMode||existing?.visualizerConfig?.defaultMode||"mural",textureUrl:imageUrl,width:1600,height:1000,mimeType:"image/webp"},seo:{...existing?.seo,metaTitle:b.seoTitle??existing?.seo?.metaTitle??title,metaDescription:b.seoDescription??existing?.seo?.metaDescription??shared.summary}};
 }
 if(name==="projects")return {...shared,shortTitle:title,projectType:b.projectType||existing?.projectType||"Surface Installation",spaceCategory:b.spaceCategory||existing?.spaceCategory||"Residential",recordClassification:b.recordClassification||existing?.recordClassification||"Studio Surface Study",artisticDirection:b.artisticDirection??existing?.artisticDirection??"",surfaceName:b.surfaceName||existing?.surfaceName||"Walls",surfaceId:slug(b.surfaceName||existing?.surfaceName||"Walls"),locationNote:b.locationNote??existing?.locationNote??"",architecturalNotes:existing?.architecturalNotes||[],exhibitionImage:imageUrl,beforeAfterMedia:{beforeLabel:b.beforeLabel||existing?.beforeAfterMedia?.beforeLabel||"Before",afterLabel:b.afterLabel||existing?.beforeAfterMedia?.afterLabel||"After",beforeImageUrl:b.beforeImageUrl??existing?.beforeAfterMedia?.beforeImageUrl??"",afterImageUrl:b.afterImageUrl??existing?.beforeAfterMedia?.afterImageUrl??""},displayOrder:Number(b.displayOrder??existing?.displayOrder??0),seoTitle:b.seoTitle??existing?.seoTitle??title,seoDescription:b.seoDescription??existing?.seoDescription??shared.summary};
 const excerpt=b.excerpt??existing?.excerpt??"";const sections=b.content!==undefined?[{heading:b.sectionHeading??"",paragraphs:String(b.content).split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean)}]:existing?.sections||[];
 return {...base,categorySlug:slug(b.categorySlug||existing?.categorySlug||"journal"),categoryName:b.categoryName||existing?.categoryName||"Journal",excerpt,coverImage:shared.coverImage,sections,tags:b.tags!==undefined?strings(b.tags):existing?.tags||[],authorLabel:b.authorLabel||existing?.authorLabel||"ATELIER",publishedAtLabel:existing?.publishedAtLabel||"Draft",publishedIso:existing?.publishedIso||null,readingTimeMinutes:computeReadingTimeMinutes(sections,excerpt),displayOrder:Number(b.displayOrder??existing?.displayOrder??0),featured:shared.featured,published:false,isEditorialFixture:false,seo:{metaTitle:b.seoTitle??existing?.seo?.metaTitle??title,metaDescription:b.seoDescription??existing?.seo?.metaDescription??excerpt,ogImageUrl:imageUrl}};
}
async function mutate(request:Request){
 const auth=await requireAdminRequest(request);if(!auth.ok)return auth.response;
 try{
  const unknownBody=await readJsonBody(request,512_000);if(!unknownBody||typeof unknownBody!=="object"||Array.isArray(unknownBody))throw new CmsError("Invalid content payload.");const b=unknownBody as Document;const name=collectionNames[b.collection];if(!name)throw new CmsError("Unknown content type.");
  let saved;
  if(b.action)saved=await transitionCmsRecord(name,String(b.id||""),String(b.action),auth.session.email,{publishAt:b.publishAt,versionId:b.versionId,revision:b.revision});
  else {
   let body=b;
   if(request.method==="PATCH"){
    const prev=(await listCmsDrafts<Document>(name)).find(d=>d.id===b.id);if(!prev)throw new CmsError("Record not found.",404);
    // Toggling publication is an explicit lifecycle action, not a partial record overwrite.
    if(typeof b.published==="boolean" && b.featured===undefined && b.sortOrder===undefined)saved=await transitionCmsRecord(name,b.id,b.published?"publish":"unpublish",auth.session.email,{revision:b.revision});
    body={...prev,...b,imageUrl:prev.coverImage?.secureUrl};
   }
   if(!saved){const record=await buildRecord(name,body);saved=await saveCmsRecord(name,record,auth.session.email,b.published===true?"published":"draft");}
  }
  revalidatePath("/","layout");
  const key={categories:"category",designs:"design",projects:"project",blogs:"blog",content:"page",settings:"settings"}[b.collection as keyof typeof collectionNames]||"item";
  return privateJson({ok:true,[key]:saved,item:saved});
 }catch(e){return errorResponse(e);}
}
export const POST=mutate;export const PATCH=mutate;
export async function DELETE(request:Request){const auth=await requireAdminRequest(request);if(!auth.ok)return auth.response;try{const p=new URL(request.url).searchParams;const name=collectionNames[p.get("collection")||""];if(!name||!p.get("id"))throw new CmsError("Choose a record to delete.");const deleted=await deleteCmsRecord(name,p.get("id")!,auth.session.email);revalidatePath("/","layout");return privateJson({ok:deleted},deleted?200:404);}catch(e){return errorResponse(e);}}
