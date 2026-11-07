import { NextResponse } from "next/server";
import { getEnvironmentReadiness } from "@/lib/env";
import {
  BLOG_DRAFT_CATEGORIES,
  DEVELOPMENT_BLOG_FIXTURES,
} from "@/lib/blogs-catalogue";

/**
 * GET /api/blogs
 * Safe data-access boundary for Page 07 — Blogs (`/blogs` & `/blogs/[slug]`).
 * Returns proposed configurable blog categories, verified published articles (`[]` until
 * MongoDB is connected and client publishes articles via `/admin/blogs`), and
 * explicitly flagged editorial draft fixtures for UI, search, filter, and SEO QA.
 */
export async function GET() {
  const readiness = getEnvironmentReadiness();

  return NextResponse.json({
    status: "ok",
    readiness: {
      mongodbConfigured: readiness.mongodbConfigured,
      cloudinaryConfigured: readiness.cloudinaryConfigured,
    },
    categories: BLOG_DRAFT_CATEGORIES,
    publishedClientArticles: [],
    editorialDraftFixtures: DEVELOPMENT_BLOG_FIXTURES,
  });
}

