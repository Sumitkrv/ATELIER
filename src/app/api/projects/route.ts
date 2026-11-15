import { NextResponse } from "next/server";
import { getPublicProjects } from "@/lib/public-cms";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const items = await getPublicProjects();
    return NextResponse.json({
      status: "ok",
      approvedClientProjects: items.filter(item => !item.isDevelopmentFixture),
      developmentFixtures: process.env.NODE_ENV === "development"
        ? items.filter(item => item.isDevelopmentFixture)
        : [],
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Content is temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
