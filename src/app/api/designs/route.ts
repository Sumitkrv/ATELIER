import { NextResponse } from "next/server";
import { getPublicCategories, getPublicDesigns, getPublicPages } from "@/lib/public-cms";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const [categories, designs, pages] = await Promise.all([getPublicCategories(), getPublicDesigns(), getPublicPages()]);
    const activeCategories = categories.filter(category => category.isActive);
    const visibleIds = new Set(activeCategories.map(category => category.id));
    return NextResponse.json({ status: "ok", categories: activeCategories, totalCategorySlots: activeCategories.length, approvedClientDesigns: designs.filter(design => visibleIds.has(design.categoryId)), developmentFixtures: [], visualizerPageContent: pages.find(page => page.pageKey === "visualizer") || null }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "The design catalogue is temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
