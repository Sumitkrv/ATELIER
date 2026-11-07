import React from "react";
import { AdminModuleShell } from "@/components/admin/AdminModuleShell";

export default function AdminBlogsPage() {
  return (
    <AdminModuleShell
      moduleCode="MODULE 06"
      moduleTitle="Blog & Editorial Management"
      mongoCollection="blog_posts"
      summary="Author, edit, draft, and publish studio articles with Cloudinary cover images, categories, rich editorial content, and per-article SEO metadata."
      capabilities={[
        {
          title: "Article Authoring & Publishing Controls",
          description:
            "Create articles, switch between `draft` and `published` states, and highlight featured posts on /blogs.",
          schemaFields: [
            "title",
            "slug",
            "excerpt",
            "content",
            "status ('draft' | 'published')",
            "isFeatured",
            "publishedAt",
          ],
        },
        {
          title: "Cover Imagery & SEO Metadata",
          description:
            "Attach Cloudinary cover images, assign categories/tags, and configure custom meta titles, descriptions, and OpenGraph images.",
          schemaFields: [
            "coverImage",
            "category",
            "tags[]",
            "seo.metaTitle",
            "seo.metaDescription",
            "seo.ogImageUrl",
          ],
        },
      ]}
    />
  );
}

