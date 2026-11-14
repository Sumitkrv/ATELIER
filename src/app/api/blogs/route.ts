import { NextResponse } from "next/server";
import { getEnvironmentReadiness } from "@/lib/env";
import { BLOG_DRAFT_CATEGORIES } from "@/lib/blogs-catalogue";
import { listStoredBlogs } from "@/lib/cms-store";

export async function GET() {
  const readiness = getEnvironmentReadiness();
  const blogs = await listStoredBlogs();
  const publishedArticles = blogs.filter((b) => b.published);

  return NextResponse.json({
    status: "ok",
    readiness: {
      mongodbConfigured: readiness.mongodbConfigured,
      localCmsEnabled: readiness.localCmsEnabled,
      cloudinaryConfigured: readiness.cloudinaryConfigured,
    },
    categories: BLOG_DRAFT_CATEGORIES,
    articles: publishedArticles,
    publishedClientArticles: publishedArticles,
    editorialDraftFixtures: [],
  });
}
