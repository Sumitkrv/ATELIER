import React, { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/layout/PublicShell";
import { BlogArticleDetailClient } from "@/components/blogs/BlogArticleDetailClient";
import {
  DEVELOPMENT_BLOG_FIXTURES,
  findBlogBySlugOrId,
} from "@/lib/blogs-catalogue";
import { findStoredBlogBySlug } from "@/lib/cms-store";

export async function generateStaticParams() {
  return DEVELOPMENT_BLOG_FIXTURES.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article =
    (await findStoredBlogBySlug(slug)) ?? findBlogBySlugOrId(slug);
  if (!article) {
    return {
      title: "Article Not Found | ATELIER — WALL STORY",
    };
  }
  return {
    title: article.seo.metaTitle || article.title,
    description: article.seo.metaDescription || article.excerpt,
    alternates: {
      canonical: `/blogs/${article.slug}`,
    },
    openGraph: {
      title: article.seo.metaTitle || article.title,
      description: article.seo.metaDescription || article.excerpt,
      url: `/blogs/${article.slug}`,
      type: "article",
      images: [
        {
          url: article.seo.ogImageUrl || article.coverImage.secureUrl,
          alt: article.coverImage.altText,
        },
      ],
    },
  };
}

async function BlogArticleDetailResolved({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article =
    (await findStoredBlogBySlug(slug)) ?? findBlogBySlugOrId(slug);

  if (!article) {
    notFound();
  }

  return <BlogArticleDetailClient article={article} />;
}

export default function BlogArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <PublicShell>
          <div className="min-h-[70svh] bg-[#FAF9F6]" />
        </PublicShell>
      }
    >
      <BlogArticleDetailResolved params={params} />
    </Suspense>
  );
}

