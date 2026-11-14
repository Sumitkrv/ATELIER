import fs from "fs/promises";
import path from "path";
import { ATELIER_BRAND, ATELIER_CONTACTS } from "@/lib/brand";
import {
  CatalogueCategoryRecord,
  CatalogueDesignItem,
  DESIGN_CATEGORY_RECORDS,
  DEVELOPMENT_FIXTURE_DESIGNS,
  EXPLORE_DESIGNS_HERO_CONTENT,
} from "@/lib/designs-catalogue";
import {
  DEVELOPMENT_PROJECT_FIXTURES,
  PortfolioProjectRecord,
  PROJECTS_PAGE_CONTENT,
} from "@/lib/projects-catalogue";
import {
  ABOUT_PAGE_CONTENT,
  BlogArticleRecord,
  BLOGS_PAGE_CONTENT,
  DEVELOPMENT_BLOG_FIXTURES,
  PROCESS_PAGE_CONTENT,
} from "@/lib/blogs-catalogue";
import { PageContentDocument, SiteSettingsDocument } from "@/types/models";

// shortcut: file-backed JSON collections in web/.data for zero-dependency local CMS; swap readOrSeedJson/writeJson to MongoDB driver when MONGODB_URI is provisioned.
const runtimeRoot = (): string => process["cwd"]();
const DATA_DIR = path.join(runtimeRoot(), ".data");

async function readOrSeedJson<T>(
  fileName: string,
  seedFactory: () => T
): Promise<T> {
  const filePath = path.join(DATA_DIR, fileName);
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    const seeded = seedFactory();
    await writeJson(fileName, seeded);
    return seeded;
  }
}

async function writeJson<T>(fileName: string, value: T): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const filePath = path.join(DATA_DIR, fileName);
  const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(value, null, 2), "utf8");
  await fs.rename(tmpPath, filePath);
}

/* ============================================================================
   1. CATEGORIES (.data/categories.json)
============================================================================ */

export async function listStoredCategories(): Promise<
  CatalogueCategoryRecord[]
> {
  const list = await readOrSeedJson<CatalogueCategoryRecord[]>(
    "categories.json",
    () => [...DESIGN_CATEGORY_RECORDS]
  );
  return [...list].sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function upsertStoredCategory(
  input: Partial<CatalogueCategoryRecord> & { id: string }
): Promise<CatalogueCategoryRecord | null> {
  const list = await listStoredCategories();
  const idx = list.findIndex((c) => c.id === input.id);
  if (idx === -1) return null;
  const nowIso = new Date().toISOString();
  const current = list[idx];
  const next: CatalogueCategoryRecord = {
    ...current,
    name: input.name?.trim() || current.name,
    shortTitle: input.name?.trim() || current.shortTitle,
    slug: input.slug?.trim() || current.slug,
    description:
      input.description !== undefined
        ? input.description.trim()
        : current.description,
    coverImage:
      input.coverImage !== undefined ? input.coverImage : current.coverImage,
    displayOrder:
      typeof input.displayOrder === "number"
        ? input.displayOrder
        : current.displayOrder,
    isActive:
      typeof input.isActive === "boolean" ? input.isActive : current.isActive,
    isConfigured: true,
    updatedAt: nowIso,
  };
  list[idx] = next;
  await writeJson("categories.json", list);
  return next;
}

/* ============================================================================
   2. DESIGNS (.data/designs.json)
============================================================================ */

export async function listStoredDesigns(): Promise<CatalogueDesignItem[]> {
  const list = await readOrSeedJson<CatalogueDesignItem[]>(
    "designs.json",
    () => [...DEVELOPMENT_FIXTURE_DESIGNS]
  );
  return [...list].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function upsertStoredDesign(
  item: CatalogueDesignItem
): Promise<CatalogueDesignItem> {
  const list = await listStoredDesigns();
  const idx = list.findIndex((d) => d.id === item.id);
  if (idx >= 0) {
    list[idx] = item;
  } else {
    list.unshift(item);
  }
  await writeJson("designs.json", list);
  return item;
}

export async function deleteStoredDesign(id: string): Promise<boolean> {
  const list = await listStoredDesigns();
  const next = list.filter((d) => d.id !== id);
  if (next.length === list.length) return false;
  await writeJson("designs.json", next);
  return true;
}

/* ============================================================================
   3. PROJECTS (.data/projects.json)
============================================================================ */

export async function listStoredProjects(): Promise<PortfolioProjectRecord[]> {
  const list = await readOrSeedJson<PortfolioProjectRecord[]>(
    "projects.json",
    () => [...DEVELOPMENT_PROJECT_FIXTURES]
  );
  return [...list].sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function findStoredProjectBySlug(
  slugOrId: string
): Promise<PortfolioProjectRecord | null> {
  const key = slugOrId.trim().toLowerCase();
  const list = await listStoredProjects();
  return (
    list.find(
      (p) => p.slug.toLowerCase() === key || p.id.toLowerCase() === key
    ) ?? null
  );
}

export async function upsertStoredProject(
  item: PortfolioProjectRecord
): Promise<PortfolioProjectRecord> {
  const list = await listStoredProjects();
  const idx = list.findIndex((p) => p.id === item.id);
  if (idx >= 0) {
    list[idx] = item;
  } else {
    list.unshift(item);
  }
  await writeJson("projects.json", list);
  return item;
}

export async function deleteStoredProject(id: string): Promise<boolean> {
  const list = await listStoredProjects();
  const next = list.filter((p) => p.id !== id);
  if (next.length === list.length) return false;
  await writeJson("projects.json", next);
  return true;
}

/* ============================================================================
   4. BLOG POSTS (.data/blogs.json)
============================================================================ */

export async function listStoredBlogs(): Promise<BlogArticleRecord[]> {
  return readOrSeedJson<BlogArticleRecord[]>("blogs.json", () => [
    ...DEVELOPMENT_BLOG_FIXTURES,
  ]);
}

export async function findStoredBlogBySlug(
  slugOrId: string
): Promise<BlogArticleRecord | null> {
  const key = slugOrId.trim().toLowerCase();
  const list = await listStoredBlogs();
  return (
    list.find(
      (b) => b.slug.toLowerCase() === key || b.id.toLowerCase() === key
    ) ?? null
  );
}

export async function upsertStoredBlog(
  item: BlogArticleRecord
): Promise<BlogArticleRecord> {
  const list = await listStoredBlogs();
  const idx = list.findIndex((b) => b.id === item.id);
  if (idx >= 0) {
    list[idx] = item;
  } else {
    list.unshift(item);
  }
  await writeJson("blogs.json", list);
  return item;
}

export async function deleteStoredBlog(id: string): Promise<boolean> {
  const list = await listStoredBlogs();
  const next = list.filter((b) => b.id !== id);
  if (next.length === list.length) return false;
  await writeJson("blogs.json", next);
  return true;
}

/* ============================================================================
   5. PAGE CONTENTS (.data/page-contents.json)
============================================================================ */

function buildDefaultPageContents(): PageContentDocument[] {
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

export async function listStoredPageContents(): Promise<PageContentDocument[]> {
  const stored = await readOrSeedJson<PageContentDocument[]>(
    "page-contents.json",
    buildDefaultPageContents
  );
  const defaults = buildDefaultPageContents();
  const missing = defaults.filter(
    (def) => !stored.some((item) => item.pageKey === def.pageKey)
  );
  if (missing.length === 0) return stored;
  const merged = [...stored, ...missing];
  await writeJson("page-contents.json", merged);
  return merged;
}

export async function upsertStoredPageContent(
  doc: PageContentDocument
): Promise<PageContentDocument> {
  const list = await listStoredPageContents();
  const idx = list.findIndex(
    (item) => item.pageKey === doc.pageKey || item.id === doc.id
  );
  const nextDoc: PageContentDocument = {
    ...doc,
    updatedAt: new Date().toISOString(),
  };
  if (idx >= 0) {
    list[idx] = nextDoc;
  } else {
    list.push(nextDoc);
  }
  await writeJson("page-contents.json", list);
  return nextDoc;
}

/* ============================================================================
   6. SITE SETTINGS (.data/site-settings.json)
============================================================================ */

function buildDefaultSiteSettings(): SiteSettingsDocument {
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

export async function getStoredSiteSettings(): Promise<SiteSettingsDocument> {
  return readOrSeedJson<SiteSettingsDocument>(
    "site-settings.json",
    buildDefaultSiteSettings
  );
}

export async function saveStoredSiteSettings(
  patch: Partial<SiteSettingsDocument>
): Promise<SiteSettingsDocument> {
  const current = await getStoredSiteSettings();
  const next: SiteSettingsDocument = {
    ...current,
    ...patch,
    singletonKey: "global",
    contact: {
      ...current.contact,
      ...(patch.contact || {}),
    },
    socialLinks: {
      ...current.socialLinks,
      ...(patch.socialLinks || {}),
    },
    visualizer: {
      ...current.visualizer,
      ...(patch.visualizer || {}),
    },
    defaultSeo: {
      ...current.defaultSeo,
      ...(patch.defaultSeo || {}),
    },
    updatedAt: new Date().toISOString(),
  };
  await writeJson("site-settings.json", next);
  return next;
}

