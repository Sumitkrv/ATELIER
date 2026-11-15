import { cache } from "react";
import { cookies, draftMode, headers } from "next/headers";
import {
  buildDefaultPageContents,
  buildDefaultSiteSettings,
  getPublishedCmsCollection,
  getPublishedCmsHomePageContent,
  getPublishedCmsSiteSettings,
  getStoredSiteSettings,
  listStoredBlogs,
  listStoredCategories,
  listStoredDesigns,
  listStoredPageContents,
  listStoredProjects,
} from "@/lib/cms-store";
import {
  DEVELOPMENT_FIXTURE_DESIGNS,
  DESIGN_CATEGORY_RECORDS,
} from "@/lib/designs-catalogue";
import { StorageUnavailableError } from "@/lib/mongodb";
import { ADMIN_SESSION_COOKIE, requireAdminRequest } from "@/lib/admin-auth";
import { DEFAULT_HOMEPAGE_CONTENT, type HomepageContentConfig } from "@/lib/homepage-content";
import { DEVELOPMENT_BLOG_FIXTURES } from "@/lib/blogs-catalogue";
import { DEVELOPMENT_PROJECT_FIXTURES } from "@/lib/projects-catalogue";
import type { PageContentDocument } from "@/types/models";

function usePublicFallback<T>(section: string, error: unknown, fallback: T): T {
  if (!(error instanceof StorageUnavailableError)) throw error;
  console.warn(`[public-cms] Storage unavailable; serving default ${section}.`);
  return fallback;
}

export const isPrivatePreview = cache(async () => {
  if (!(await draftMode()).isEnabled || !(await cookies()).has(ADMIN_SESSION_COOKIE)) return false;
  const result = await requireAdminRequest(new Request("http://localhost/preview-check", { headers: await headers() }));
  return result.ok;
});

export const getPublicCategories = cache(async () => {
  try {
    const categories = (await isPrivatePreview())
      ? await listStoredCategories()
      : await getPublishedCmsCollection<Awaited<ReturnType<typeof listStoredCategories>>[number]>("categories");
    return categories.length ? categories : [...DESIGN_CATEGORY_RECORDS];
  } catch (error) {
    return usePublicFallback("categories", error, [...DESIGN_CATEGORY_RECORDS]);
  }
});
export const getPublicDesigns = cache(async () => {
  const localFixtures = [...DEVELOPMENT_FIXTURE_DESIGNS];
  try {
    const [preview, categories] = await Promise.all([isPrivatePreview(), getPublicCategories()]);
    const storedDesigns = preview
      ? (await listStoredDesigns()).map(item => ({ ...item, published: true }))
      : await getPublishedCmsCollection<Awaited<ReturnType<typeof listStoredDesigns>>[number]>("designs");
    const designs = storedDesigns.length ? storedDesigns : localFixtures;
    return designs.flatMap(design => {
      const category = categories.find(item => item.id === design.categoryId && item.isActive);
      return category ? [{ ...design, categorySlug: category.slug, categoryLabel: category.name, categorySlotNumber: category.slotNumber, categoryCode: category.slotCode }] : [];
    });
  } catch (error) {
    return usePublicFallback("designs", error, localFixtures);
  }
});
export const getPublicProjects = cache(async () => {
  const localFixtures = [...DEVELOPMENT_PROJECT_FIXTURES];
  try {
    const storedProjects = (await isPrivatePreview())
      ? (await listStoredProjects()).map(item => ({ ...item, published: true }))
      : await getPublishedCmsCollection<Awaited<ReturnType<typeof listStoredProjects>>[number]>("projects");
    return storedProjects.length ? storedProjects : localFixtures;
  } catch (error) {
    return usePublicFallback("projects", error, localFixtures);
  }
});
export const getPublicBlogs = cache(async () => {
  const localFixtures = [...DEVELOPMENT_BLOG_FIXTURES];
  try {
    const storedBlogs = (await isPrivatePreview())
      ? (await listStoredBlogs()).map(item => ({ ...item, published: true }))
      : await getPublishedCmsCollection<Awaited<ReturnType<typeof listStoredBlogs>>[number]>("blogs");
    return storedBlogs.length ? storedBlogs : localFixtures;
  } catch (error) {
    return usePublicFallback("blogs", error, localFixtures);
  }
});
export const getPublicPages = cache(async () => {
  try {
    const pages = (await isPrivatePreview())
      ? await listStoredPageContents()
      : await getPublishedCmsCollection<PageContentDocument>("pages");
    return [
      ...pages,
      ...buildDefaultPageContents().filter(
        page => !pages.some(publishedPage => publishedPage.pageKey === page.pageKey)
      ),
    ];
  } catch (error) {
    return usePublicFallback("pages", error, buildDefaultPageContents());
  }
});
export const getPublicSiteSettings = cache(async () => {
  try {
    return (await isPrivatePreview()) ? await getStoredSiteSettings() : await getPublishedCmsSiteSettings();
  } catch (error) {
    return usePublicFallback("site settings", error, buildDefaultSiteSettings());
  }
});

export const getPublicHomeContent = cache(async (): Promise<HomepageContentConfig> => {
  try {
    if (!(await isPrivatePreview())) return await getPublishedCmsHomePageContent();
    const home = (await listStoredPageContents()).find(item => item.pageKey === "home") as (PageContentDocument & { homepage?: Partial<HomepageContentConfig> }) | undefined;
    const content = structuredClone(DEFAULT_HOMEPAGE_CONTENT);
    if (!home) return content;
    for (const key of Object.keys(content) as Array<keyof HomepageContentConfig>) {
      if (home.homepage?.[key]) Object.assign(content[key], home.homepage[key]);
    }
    return { ...content, hero: { ...content.hero, headlineLine1: home.hero.heading, headlineLine2: home.hero.highlightedText || "", subheading: home.hero.subheading, videoUrl: home.hero.videoAsset?.secureUrl || "", posterUrl: home.hero.posterImage?.secureUrl || "", primaryCtaLabel: home.hero.primaryCta.label, primaryCtaHref: home.hero.primaryCta.href, secondaryCtaLabel: home.hero.secondaryCta.label, secondaryCtaHref: home.hero.secondaryCta.href } };
  } catch (error) {
    return usePublicFallback("homepage", error, structuredClone(DEFAULT_HOMEPAGE_CONTENT));
  }
});
