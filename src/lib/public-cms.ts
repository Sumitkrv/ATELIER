import { cache } from "react";
import { cookies, draftMode, headers } from "next/headers";
import {
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
import { ADMIN_SESSION_COOKIE, requireAdminRequest } from "@/lib/admin-auth";
import { DEFAULT_HOMEPAGE_CONTENT, type HomepageContentConfig } from "@/lib/homepage-content";
import type { PageContentDocument } from "@/types/models";

export const isPrivatePreview = cache(async () => {
  if (!(await draftMode()).isEnabled || !(await cookies()).has(ADMIN_SESSION_COOKIE)) return false;
  const result = await requireAdminRequest(new Request("http://localhost/preview-check", { headers: await headers() }));
  return result.ok;
});

export const getPublicCategories = cache(async () => (await isPrivatePreview()) ? listStoredCategories() : getPublishedCmsCollection<Awaited<ReturnType<typeof listStoredCategories>>[number]>("categories"));
export const getPublicDesigns = cache(async () => {
  const [preview, categories] = await Promise.all([isPrivatePreview(), getPublicCategories()]);
  const designs = preview ? (await listStoredDesigns()).map(item => ({ ...item, published: true })) : await getPublishedCmsCollection<Awaited<ReturnType<typeof listStoredDesigns>>[number]>("designs");
  return designs.flatMap(design => {
    const category = categories.find(item => item.id === design.categoryId && item.isActive);
    return category ? [{ ...design, categorySlug: category.slug, categoryLabel: category.name, categorySlotNumber: category.slotNumber, categoryCode: category.slotCode }] : [];
  });
});
export const getPublicProjects = cache(async () => (await isPrivatePreview()) ? (await listStoredProjects()).map(item => ({ ...item, published: true })) : getPublishedCmsCollection<Awaited<ReturnType<typeof listStoredProjects>>[number]>("projects"));
export const getPublicBlogs = cache(async () => (await isPrivatePreview()) ? (await listStoredBlogs()).map(item => ({ ...item, published: true })) : getPublishedCmsCollection<Awaited<ReturnType<typeof listStoredBlogs>>[number]>("blogs"));
export const getPublicPages = cache(async () => (await isPrivatePreview()) ? listStoredPageContents() : getPublishedCmsCollection<PageContentDocument>("pages"));
export const getPublicSiteSettings = cache(async () => (await isPrivatePreview()) ? getStoredSiteSettings() : getPublishedCmsSiteSettings());

export const getPublicHomeContent = cache(async (): Promise<HomepageContentConfig> => {
  if (!(await isPrivatePreview())) return getPublishedCmsHomePageContent();
  const home = (await listStoredPageContents()).find(item => item.pageKey === "home") as (PageContentDocument & { homepage?: Partial<HomepageContentConfig> }) | undefined;
  const content = structuredClone(DEFAULT_HOMEPAGE_CONTENT);
  if (!home) return content;
  for (const key of Object.keys(content) as Array<keyof HomepageContentConfig>) {
    if (home.homepage?.[key]) Object.assign(content[key], home.homepage[key]);
  }
  return { ...content, hero: { ...content.hero, headlineLine1: home.hero.heading, headlineLine2: home.hero.highlightedText || "", subheading: home.hero.subheading, videoUrl: home.hero.videoAsset?.secureUrl || "", posterUrl: home.hero.posterImage?.secureUrl || "", primaryCtaLabel: home.hero.primaryCta.label, primaryCtaHref: home.hero.primaryCta.href, secondaryCtaLabel: home.hero.secondaryCta.label, secondaryCtaHref: home.hero.secondaryCta.href } };
});
