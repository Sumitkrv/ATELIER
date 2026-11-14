import crypto from "node:crypto";
import type { Document } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { cmsSchemas, type CmsCollection } from "@/lib/cms-validation";
import { ATELIER_BRAND, ATELIER_CONTACTS } from "@/lib/brand";
import { type CatalogueCategoryRecord, type CatalogueDesignItem, EXPLORE_DESIGNS_HERO_CONTENT } from "@/lib/designs-catalogue";
import { type PortfolioProjectRecord, PROJECTS_PAGE_CONTENT } from "@/lib/projects-catalogue";
import { ABOUT_PAGE_CONTENT, type BlogArticleRecord, BLOGS_PAGE_CONTENT, PROCESS_PAGE_CONTENT } from "@/lib/blogs-catalogue";
import type { PageContentDocument, SiteSettingsDocument } from "@/types/models";
import { DEFAULT_HOMEPAGE_CONTENT, type HomepageContentConfig } from "@/lib/homepage-content";

export class CmsError extends Error {
  constructor(message: string, public statusCode = 400) { super(message); }
}
export type ContentStatus = "draft" | "scheduled" | "published" | "archived";
export interface CmsEnvelope extends Document {
  id: string; revision: number; status: ContentStatus; draft: Document;
  published: Document | null; scheduled?: Document | null; publishAt: string | null;
  createdAt: string; updatedAt: string; deletedAt?: string | null;
}
export function contentMediaUrls(...values:unknown[]):string[]{
  const urls=new Set<string>();
  const visit=(v:unknown)=>{if(typeof v==="string"&&(/^(https?:\/\/|\/)/.test(v)))urls.add(v);else if(v&&typeof v==="object")for(const child of Object.values(v))visit(child);};
  values.forEach(visit);return [...urls];
}
async function checkMediaAvailable(...values:unknown[]){
  const urls=contentMediaUrls(...values);if(!urls.length)return;
  if(await(await getDb()).collection("media_assets").findOne({secureUrl:{$in:urls},deletionState:"deleting"}))throw new CmsError("An image or video is being removed. Choose an available asset.",409);
}
let indexPromise: Promise<void> | undefined;
async function collection(name: CmsCollection) {
  const db = await getDb();
  if (!indexPromise) indexPromise = (async () => {
    for (const key of Object.keys(cmsSchemas) as CmsCollection[]) {
      const c = db.collection<CmsEnvelope>(key);
      await c.createIndex({id:1},{unique:true});
      await c.createIndex({"draft.slug":1},{unique:true,partialFilterExpression:{"draft.slug":{$type:"string"}}});
      await c.createIndex({"published.slug":1},{unique:true,partialFilterExpression:{"published.slug":{$type:"string"}}});
      await c.createIndex({status:1,publishAt:1});
      await c.createIndex({mediaUrls:1});
    }
    await db.collection("content_versions").createIndex({collection:1,targetId:1,createdAt:-1});
    await db.collection("audit_logs").createIndex({createdAt:-1});
  })().catch(e=>{indexPromise=undefined;throw e;});
  await indexPromise;
  return db.collection<CmsEnvelope>(name);
}
function editable<T>(row: CmsEnvelope): T {
  return {...row.draft,revision:row.revision,status:row.status,publishAt:row.publishAt,createdAt:row.createdAt,updatedAt:row.updatedAt} as T;
}
export async function listCmsDrafts<T>(name:CmsCollection,limit=500):Promise<T[]> {
  const rows=await (await collection(name)).find({deletedAt:{$in:[null]}}).sort({"draft.displayOrder":1,"draft.sortOrder":1,updatedAt:-1}).limit(Math.min(limit,1000)).toArray();
  return rows.map(row=>editable<T>(row));
}
export async function getPublishedCmsCollection<T>(name:Exclude<CmsCollection,"site_settings">):Promise<T[]> {
  const rows=await (await collection(name)).find({published:{$ne:null},deletedAt:{$in:[null]}}).sort({"published.displayOrder":1,"published.sortOrder":1}).limit(1000).toArray();
  return rows.map(row=>row.published as T);
}
export async function auditCms(actor:string,action:string,target:string) {
  await (await getDb()).collection("audit_logs").insertOne({id:crypto.randomUUID(),actor,action,target,createdAt:new Date().toISOString()});
}
export async function saveCmsRecord<T>(name:CmsCollection,input:T,actor="administrator",intent?:ContentStatus):Promise<T> {
  const parsed=cmsSchemas[name].parse(input) as Document;
  const c=await collection(name);
  const current=await c.findOne({id:parsed.id});
  if (current?.deletedAt) throw new CmsError("This record is archived. Restore a revision before editing.",409);
  if (parsed.revision && current && parsed.revision!==current.revision) throw new CmsError("This record changed in another session. Reload before saving.",409);
  const now=new Date().toISOString();
  const publish=intent==="published";
  if (publish) validatePublication(name,parsed);
  const draft:Document={...parsed,createdAt:current?.createdAt||now,updatedAt:now};
  delete draft.revision; delete draft.status; delete draft.publishAt;
  if ("published" in draft) draft.published=publish;
  const row:CmsEnvelope={id:parsed.id,revision:(current?.revision||0)+1,status:publish?"published":"draft",draft,published:publish?{...draft,published:true}:(current?.published||null),scheduled:null,publishAt:null,createdAt:current?.createdAt||now,updatedAt:now,deletedAt:null};
  row.mediaUrls=contentMediaUrls(row.draft,row.published);
  await checkMediaAvailable(row.draft,row.published);
  await recordHistory(name,current,actor,"save");
  try {
    if(current){const result=await c.replaceOne({id:row.id,revision:current.revision},row);if(!result.matchedCount)throw new CmsError("Concurrent update. Reload before saving.",409);}
    else await c.insertOne(row);
  } catch(e){if(e && typeof e==="object" && "code" in e && e.code===11000)throw new CmsError("A record already uses this slug or identifier.",409);throw e;}
  await auditCms(actor,publish?"publish":"save_draft",`${name}/${row.id}`);
  return editable<T>(row);
}
function validatePublication(name:CmsCollection,doc:Document) {
  if(["designs","projects","blogs"].includes(name) && !doc.coverImage?.secureUrl) throw new CmsError("Choose a cover image before publishing.");
  if(name==="blogs" && !doc.sections?.some((s:Document)=>s.paragraphs?.some((p:string)=>p.trim()))) throw new CmsError("Add article content before publishing.");
}
async function recordHistory(name:CmsCollection,current:CmsEnvelope|null,actor:string,action:string) {
  if(!current)return;
  await (await getDb()).collection("content_versions").insertOne({id:crypto.randomUUID(),collection:name,targetId:current.id,revision:current.revision,snapshot:current.draft,actor,action,createdAt:new Date().toISOString()});
}
export async function transitionCmsRecord(name:CmsCollection,id:string,action:string,actor:string,options:{publishAt?:string;versionId?:string;revision?:number}={}) {
  const c=await collection(name);const row=await c.findOne({id});if(!row)throw new CmsError("Record not found.",404);
  if(options.revision && options.revision!==row.revision)throw new CmsError("Record changed. Reload first.",409);
  const now=new Date().toISOString(); let draft={...row.draft};let published=row.published;let status:ContentStatus="draft";let publishAt:string|null=null;let scheduled:Document|null=null;
  if(action==="restore") {
    const version=await (await getDb()).collection("content_versions").findOne({id:options.versionId,collection:name,targetId:id});
    if(!version)throw new CmsError("Revision not found.",404);draft={...version.snapshot};
  } else if(action==="publish") {validatePublication(name,draft);status="published";published={...draft,published:true};}
  else if(action==="schedule") {validatePublication(name,draft);const date=new Date(options.publishAt||"");if(!Number.isFinite(date.getTime())||date.getTime()<=Date.now())throw new CmsError("Choose a future publication time.");publishAt=date.toISOString();scheduled={...draft,published:true};status="scheduled";}
  else if(action==="archive"||action==="unpublish") {published=null;status=action==="archive"?"archived":"draft";}
  else if(action!=="draft")throw new CmsError("Unsupported publishing action.");
  await checkMediaAvailable(draft,published,scheduled);
  await recordHistory(name,row,actor,action);
  const result=await c.findOneAndUpdate({id,revision:row.revision},{$set:{draft:{...draft,published:status==="published"},published,status,publishAt,scheduled,mediaUrls:contentMediaUrls(draft,published,scheduled),updatedAt:now,deletedAt:null},$inc:{revision:1}},{returnDocument:"after"});
  if(!result)throw new CmsError("Concurrent update. Reload first.",409);
  await auditCms(actor,action,`${name}/${id}`);return editable<Document>(result);
}
export async function listContentVersions(name:CmsCollection,id:string) {
  return (await getDb()).collection("content_versions").find({collection:name,targetId:id},{projection:{_id:0}}).sort({createdAt:-1}).limit(50).toArray();
}
export async function deleteCmsRecord(name:CmsCollection,id:string,actor="administrator") {
  if(name==="categories") {
    const count=await (await collection("designs")).countDocuments({deletedAt:{$in:[null]},$or:[{"draft.categoryId":id},{"published.categoryId":id}]});
    if(count)throw new CmsError("Move designs to another category before deleting this category.",409);
  }
  const c=await collection(name);const row=await c.findOne({id});if(!row)return false;
  await recordHistory(name,row,actor,"delete");
  const result=await c.updateOne({id,revision:row.revision},{$set:{status:"archived",published:null,scheduled:null,publishAt:null,deletedAt:new Date().toISOString()},$inc:{revision:1}});
  if(!result.modifiedCount)throw new CmsError("Concurrent update. Reload first.",409);
  await auditCms(actor,"delete",`${name}/${id}`);return true;
}
export async function publishDueContent(limit=100) {
  let published=0;
  for(const name of Object.keys(cmsSchemas) as CmsCollection[]){
    const c=await collection(name);const now=new Date().toISOString();
    const due=await c.find({status:"scheduled",publishAt:{$lte:now},scheduled:{$ne:null}}).limit(limit).toArray();
    for(const row of due){const snapshot=row.scheduled;if(!snapshot)continue;const result=await c.updateOne({id:row.id,revision:row.revision,status:"scheduled"},{$set:{published:snapshot,draft:snapshot,status:"published",publishAt:null,scheduled:null,updatedAt:now},$inc:{revision:1}});if(result.modifiedCount){published++;await auditCms("scheduled-task","publish",`${name}/${row.id}`);}}
  }return published;
}
export const listStoredCategories=()=>listCmsDrafts<CatalogueCategoryRecord>("categories");
export const listStoredDesigns=()=>listCmsDrafts<CatalogueDesignItem>("designs");
export const listStoredProjects=()=>listCmsDrafts<PortfolioProjectRecord>("projects");
export const listStoredBlogs=()=>listCmsDrafts<BlogArticleRecord>("blogs");
export const listStoredPageContents=async()=>{const rows=await listCmsDrafts<PageContentDocument>("pages");return [...rows,...buildDefaultPageContents().filter(d=>!rows.some(r=>r.pageKey===d.pageKey))];};
export const findStoredProjectBySlug=async(key:string)=>(await listStoredProjects()).find(p=>p.slug===key||p.id===key)||null;
export const findStoredBlogBySlug=async(key:string)=>(await listStoredBlogs()).find(p=>p.slug===key||p.id===key)||null;
export const upsertStoredCategory=async(input:Partial<CatalogueCategoryRecord>&{id:string})=>{const current=(await listStoredCategories()).find(c=>c.id===input.id);return saveCmsRecord("categories",{...current,...input});};
export const upsertStoredDesign=(item:CatalogueDesignItem)=>saveCmsRecord("designs",item);
export const upsertStoredProject=(item:PortfolioProjectRecord)=>saveCmsRecord("projects",item);
export const upsertStoredBlog=(item:BlogArticleRecord)=>saveCmsRecord("blogs",item);
export const upsertStoredPageContent=(item:PageContentDocument)=>saveCmsRecord("pages",item);
export const deleteStoredDesign=(id:string)=>deleteCmsRecord("designs",id);
export const deleteStoredProject=(id:string)=>deleteCmsRecord("projects",id);
export const deleteStoredBlog=(id:string)=>deleteCmsRecord("blogs",id);
export const getStoredSiteSettings=async()=>(await listCmsDrafts<SiteSettingsDocument>("site_settings"))[0]||buildDefaultSiteSettings();
export const saveStoredSiteSettings=async(patch:Partial<SiteSettingsDocument>)=>{const cur=await getStoredSiteSettings();return saveCmsRecord("site_settings",{...cur,...patch,contact:{...cur.contact,...patch.contact},socialLinks:{...cur.socialLinks,...patch.socialLinks},defaultSeo:{...cur.defaultSeo,...patch.defaultSeo},visualizer:{...cur.visualizer,...patch.visualizer}});};
export async function getPublishedCmsSiteSettings():Promise<SiteSettingsDocument>{
  const row=await (await collection("site_settings")).findOne({id:"site-settings-global",published:{$ne:null}});
  const settings=(row?.published||buildDefaultSiteSettings()) as SiteSettingsDocument;
  // Notification destinations are administrative configuration, never public content.
  const {enquiryNotifications: _private,...publicSettings}=settings;void _private;return publicSettings as SiteSettingsDocument;
}
export async function getPublishedCmsHomePageContent():Promise<HomepageContentConfig>{
  const home=(await getPublishedCmsCollection<PageContentDocument>("pages")).find(p=>p.pageKey==="home");
  if(!home)return {...DEFAULT_HOMEPAGE_CONTENT,collectionPreview:{...DEFAULT_HOMEPAGE_CONTENT.collectionPreview,sampleItems:[]}};
  const result={...DEFAULT_HOMEPAGE_CONTENT,...home.homepage};
  const hero=home.hero;
  return {...result,hero:{...result.hero,headlineLine1:hero.heading,headlineLine2:hero.highlightedText||"",subheading:hero.subheading,primaryCtaLabel:hero.primaryCta.label,primaryCtaHref:hero.primaryCta.href,secondaryCtaLabel:hero.secondaryCta.label,secondaryCtaHref:hero.secondaryCta.href,videoUrl:hero.videoAsset?.secureUrl||result.hero.videoUrl,posterUrl:hero.posterImage?.secureUrl||result.hero.posterUrl}};
}
export function buildDefaultPageContents(): PageContentDocument[] {
  const nowIso = new Date().toISOString();
  return [
    {
      id: "page-home",
      pageKey: "home",
      hero: {
        eyebrow: "ATELIER — WALL STORY • MUMBAI",
        heading: ATELIER_BRAND.editorialHeadline,
        highlightedText: "Surface Art",
        subheading: ATELIER_BRAND.factualDescription,
        videoAsset: null,
        posterImage: null,
        primaryCta: { label: "Explore Designs", href: "/explore-designs" },
        secondaryCta: { label: "Preview on Your Wall", href: "/visualizer" },
      },
      updatedAt: nowIso,
    },
    {
      id: "page-explore-designs",
      pageKey: "explore-designs",
      hero: {
        eyebrow: EXPLORE_DESIGNS_HERO_CONTENT.eyebrow,
        heading: EXPLORE_DESIGNS_HERO_CONTENT.headline,
        highlightedText: "Every Space",
        subheading: EXPLORE_DESIGNS_HERO_CONTENT.supportingText,
        videoAsset: null,
        posterImage: null,
        primaryCta: {
          label: EXPLORE_DESIGNS_HERO_CONTENT.primaryCtaLabel,
          href: "#collection",
        },
        secondaryCta: {
          label: EXPLORE_DESIGNS_HERO_CONTENT.secondaryCtaLabel,
          href: "/visualizer",
        },
      },
      updatedAt: nowIso,
    },
    {
      id: "page-projects",
      pageKey: "projects",
      hero: {
        eyebrow: PROJECTS_PAGE_CONTENT.hero.eyebrow,
        heading: `${PROJECTS_PAGE_CONTENT.hero.headlineLine1} ${PROJECTS_PAGE_CONTENT.hero.headlineLine2}`,
        highlightedText: PROJECTS_PAGE_CONTENT.hero.headlineLine2,
        subheading: PROJECTS_PAGE_CONTENT.hero.supportingText,
        videoAsset: null,
        posterImage: null,
        primaryCta: { label: "Browse Portfolio", href: "#portfolio" },
        secondaryCta: { label: "Start an Enquiry", href: "/contact" },
      },
      updatedAt: nowIso,
    },
    {
      id: "page-services",
      pageKey: "services",
      hero: {
        eyebrow: "MULTI-SURFACE 3D PRINTING",
        heading: "Direct-to-Surface Printing Across 6 Architectural Substrates",
        highlightedText: "6 Architectural Substrates",
        subheading:
          "Walls, tiles, plywood, office blinds, metals, and glass — executed with studio curation in Mumbai.",
        videoAsset: null,
        posterImage: null,
        primaryCta: { label: "Enquire About Your Surface", href: "/contact" },
        secondaryCta: { label: "Explore Designs", href: "/explore-designs" },
      },
      updatedAt: nowIso,
    },
    {
      id: "page-about",
      pageKey: "about",
      hero: {
        eyebrow: ABOUT_PAGE_CONTENT.hero.eyebrow,
        heading: `${ABOUT_PAGE_CONTENT.hero.headlineLine1} ${ABOUT_PAGE_CONTENT.hero.headlineLine2}`,
        highlightedText: ABOUT_PAGE_CONTENT.hero.headlineLine2,
        subheading: ABOUT_PAGE_CONTENT.hero.supportingText,
        videoAsset: null,
        posterImage: null,
        primaryCta: { label: "Our Process", href: "/process" },
        secondaryCta: { label: "Visit / Enquire", href: "/contact" },
      },
      updatedAt: nowIso,
    },
    {
      id: "page-process",
      pageKey: "process",
      hero: {
        eyebrow: PROCESS_PAGE_CONTENT.hero.eyebrow,
        heading: `${PROCESS_PAGE_CONTENT.hero.headlineLine1} ${PROCESS_PAGE_CONTENT.hero.headlineLine2}`,
        highlightedText: PROCESS_PAGE_CONTENT.hero.headlineLine2,
        subheading: PROCESS_PAGE_CONTENT.hero.supportingText,
        videoAsset: null,
        posterImage: null,
        primaryCta: { label: "Explore the Process", href: "#stages" },
        secondaryCta: { label: "Start Your Project", href: "/contact" },
      },
      processStages: PROCESS_PAGE_CONTENT.stages.map((stage) => ({
        stepNumber: stage.stepNumber,
        code: stage.code,
        title: stage.title,
        description: stage.description,
        deliverables: [...stage.highlights],
      })),
      updatedAt: nowIso,
    },
    {
      id: "page-blogs",
      pageKey: "blogs",
      hero: {
        eyebrow: BLOGS_PAGE_CONTENT.hero.eyebrow,
        heading: `${BLOGS_PAGE_CONTENT.hero.headlineLine1} ${BLOGS_PAGE_CONTENT.hero.headlineLine2}`,
        highlightedText: BLOGS_PAGE_CONTENT.hero.headlineLine2,
        subheading: BLOGS_PAGE_CONTENT.hero.supportingText,
        videoAsset: null,
        posterImage: null,
        primaryCta: { label: "Browse Journal", href: "#articles" },
        secondaryCta: { label: "Explore Designs", href: "/explore-designs" },
      },
      updatedAt: nowIso,
    },
    {
      id: "page-contact",
      pageKey: "contact",
      hero: {
        eyebrow: "ATELIER — WALL STORY",
        heading: "Let's Create Something Remarkable.",
        highlightedText: "Remarkable.",
        subheading:
          "Tell us about your space, surface, your ideas, and the wall story you want to create. Our Mumbai studio will get in touch with you soon.",
        videoAsset: null,
        posterImage: null,
        primaryCta: { label: "Start a Project Enquiry", href: "#enquiry-form" },
        secondaryCta: {
          label: "WhatsApp Our Studio",
          href: "https://wa.me/918017463132",
        },
      },
      updatedAt: nowIso,
    },
    {
      id: "page-visualizer",
      pageKey: "visualizer",
      hero: {
        eyebrow: "ATELIER — WALL STORY",
        heading: "Visualize the Design in Your Own Space.",
        highlightedText: "Own Space.",
        subheading:
          "See how our artwork transforms your wall in real time. Capture your space with your camera or upload a room photo, map the wall, and preview your selected design with accurate perspective.",
        videoAsset: null,
        posterImage: null,
        primaryCta: { label: "Start Live Preview", href: "#live-camera" },
        secondaryCta: { label: "Upload Room Photo", href: "#upload-photo" },
      },
      processStages: [
        {
          stepNumber: 1,
          code: "01",
          title: "Choose Mode",
          description:
            "Use Live Camera, upload a room photo, or select a sample room.",
          deliverables: [],
        },
        {
          stepNumber: 2,
          code: "02",
          title: "Map Your Wall",
          description:
            "Drag the four corner pins to match your wall's perspective.",
          deliverables: [],
        },
        {
          stepNumber: 3,
          code: "03",
          title: "Adjust the Design",
          description:
            "Refine scale, positioning, opacity, and orientation.",
          deliverables: [],
        },
        {
          stepNumber: 4,
          code: "04",
          title: "Compare & Review",
          description:
            "Toggle between your space and the mapped design to see the transformation.",
          deliverables: [],
        },
        {
          stepNumber: 5,
          code: "05",
          title: "Save or Enquire",
          description:
            "Download your preview or share it with our Mumbai studio.",
          deliverables: [],
        },
      ],
      updatedAt: nowIso,
    },
  ];
}


export function buildDefaultSiteSettings(): SiteSettingsDocument {
  return {
    id: "site-settings-global",
    singletonKey: "global",
    brandName: ATELIER_BRAND.name,
    tagline: ATELIER_BRAND.brandStory,
    logoLight: {
      publicId: "brand/atelier-logo-primary",
      secureUrl: "/brand/atelier-logo-primary.png",
      resourceType: "image",
      altText: `${ATELIER_BRAND.name} Logo`,
    },
    logoDark: {
      publicId: "brand/atelier-logo-white",
      secureUrl: "/brand/atelier-logo-white.png",
      resourceType: "image",
      altText: `${ATELIER_BRAND.name} White Logo`,
    },
    contact: {
      primaryPhone: ATELIER_CONTACTS[0]?.phones[0]?.display || "+91 85919 71675",
      whatsappNumber:
        ATELIER_CONTACTS[0]?.phones[1]?.display || "+91 80174 63132",
      email: ATELIER_BRAND.email.proposedAddress,
      studioAddress: ATELIER_BRAND.address.full,
      workingHours: "Mon – Sat • 10:30 AM – 7:30 PM IST (By Appointment)",
    },
    socialLinks: {
      instagram: "",
      facebook: "",
      linkedin: "",
      youtube: "",
      pinterest: "",
    },
    visualizer: {
      externalVisualizerUrl: "/visualizer",
      enableEmbeddedPreview: true,
    },
    defaultSeo: {
      metaTitle: `${ATELIER_BRAND.name} | 3D Wall Printing & Surface Art Mumbai`,
      metaDescription: ATELIER_BRAND.factualDescription,
      ogImageUrl: "/images/atelier/artwork-botanical-canopy.jpg",
    },
    updatedAt: new Date().toISOString(),
  };
}

