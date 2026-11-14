import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogArticleDetailClient } from "@/components/blogs/BlogArticleDetailClient";
import { getPublicBlogs, isPrivatePreview } from "@/lib/public-cms";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = (await getPublicBlogs()).find(item => item.slug === slug);
  if (!article) return { title: "Article Not Found", robots: { index: false } };
  return { title: article.seo.metaTitle || article.title, description: article.seo.metaDescription || article.excerpt, alternates: { canonical: `/blogs/${article.slug}` }, openGraph: { title: article.seo.metaTitle || article.title, description: article.seo.metaDescription || article.excerpt, url: `/blogs/${article.slug}`, type: "article", ...(article.publishedIso ? { publishedTime: article.publishedIso } : {}), images: [{ url: article.seo.ogImageUrl || article.coverImage.secureUrl, alt: article.coverImage.altText }] }, robots: (await isPrivatePreview()) ? { index: false, follow: false } : undefined };
}
export default async function BlogArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const articles = await getPublicBlogs();
  const article = articles.find(item => item.slug === slug);
  if (!article) notFound();
  return <BlogArticleDetailClient article={article} relatedArticles={articles.filter(item => item.id !== article.id).slice(0, 3)} />;
}
