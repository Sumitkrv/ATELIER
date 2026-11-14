import type { Metadata } from "next";
import { getPublicPages, getPublicSiteSettings, isPrivatePreview } from "@/lib/public-cms";
import type { PageContentDocument } from "@/types/models";
export function siteOrigin() { return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""); }
export async function pageMetadata(key: PageContentDocument["pageKey"], title: string, description: string): Promise<Metadata> {
  const [pages, preview] = await Promise.all([getPublicPages(), isPrivatePreview()]);
  const page = pages.find(item => item.pageKey === key);
  const path = key === "home" ? "/" : `/${key}`;
  const resolvedTitle = page?.seo?.metaTitle || page?.hero.heading || title;
  const resolvedDescription = page?.seo?.metaDescription || page?.hero.subheading || description;
  return { title: resolvedTitle, description: resolvedDescription, alternates: { canonical: page?.seo?.canonicalUrl || path }, openGraph: { title: resolvedTitle, description: resolvedDescription, url: path, type: "website", ...(page?.seo?.ogImageUrl ? { images: [page.seo.ogImageUrl] } : {}) }, robots: preview || page?.seo?.noIndex ? { index: false, follow: false } : { index: true, follow: true } };
}
export async function siteMetadata(): Promise<Metadata> {
  const settings = await getPublicSiteSettings();
  const preview = await isPrivatePreview();
  return { ...(preview ? { robots: { index: false, follow: false } } : {}), metadataBase: new URL(siteOrigin()), title: { default: settings.defaultSeo.metaTitle || settings.brandName, template: `%s | ${settings.brandName}` }, description: settings.defaultSeo.metaDescription, ...(settings.favicon?.secureUrl ? { icons: { icon: settings.favicon.secureUrl, shortcut: settings.favicon.secureUrl } } : {}), openGraph: { siteName: settings.brandName, ...(settings.defaultSeo.ogImageUrl ? { images: [settings.defaultSeo.ogImageUrl] } : {}) } };
}
