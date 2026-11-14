import type { MetadataRoute } from "next";
import { getPublishedCmsCollection } from "@/lib/cms-store";
import { siteOrigin } from "@/lib/public-seo";
import type { PortfolioProjectRecord } from "@/lib/projects-catalogue";
import type { BlogArticleRecord } from "@/lib/blogs-catalogue";
import type { PageContentDocument } from "@/types/models";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, articles, pages] = await Promise.all([getPublishedCmsCollection<PortfolioProjectRecord>("projects"), getPublishedCmsCollection<BlogArticleRecord>("blogs"), getPublishedCmsCollection<PageContentDocument>("pages")]);
  const noIndex = new Set(pages.filter(page => page.seo?.noIndex).map(page => page.pageKey));
  const paths = ["home", "explore-designs", "projects", "services", "about", "process", "blogs", "visualizer", "contact"] as PageContentDocument["pageKey"][];
  return [...paths.filter(path => !noIndex.has(path)).map(path => ({ url: `${siteOrigin()}${path === "home" ? "/" : `/${path}`}`, changeFrequency: "weekly" as const })), ...projects.map(project => ({ url: `${siteOrigin()}/projects/${encodeURIComponent(project.slug)}`, lastModified: project.updatedAt })), ...articles.map(article => ({ url: `${siteOrigin()}/blogs/${encodeURIComponent(article.slug)}`, ...(article.publishedIso ? { lastModified: article.publishedIso } : {}) }))];
}
