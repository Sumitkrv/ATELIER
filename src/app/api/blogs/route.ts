import { NextResponse } from "next/server";
import { getPublicBlogs } from "@/lib/public-cms";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const items = await getPublicBlogs();
    return NextResponse.json({
      status: "ok",
      articles: items,
      publishedClientArticles: items.filter(item => !item.isEditorialFixture),
      editorialDraftFixtures: process.env.NODE_ENV === "development"
        ? items.filter(item => item.isEditorialFixture)
        : [],
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Content is temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
