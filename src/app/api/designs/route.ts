import { NextResponse } from "next/server";
import { getEnvironmentReadiness } from "@/lib/env";
import {
  listStoredCategories,
  listStoredDesigns,
  listStoredPageContents,
} from "@/lib/cms-store";

export async function GET() {
  const readiness = getEnvironmentReadiness();
  const [categories, designs, pageContents] = await Promise.all([
    listStoredCategories(),
    listStoredDesigns(),
    listStoredPageContents(),
  ]);

  const activeCategories = categories.filter((c) => c.isActive);
  const publishedDesigns = designs.filter((d) => d.published);
  const visualizerPageContent =
    pageContents.find((p) => p.pageKey === "visualizer") ?? null;

  return NextResponse.json({
    status: "ok",
    totalCategorySlots: categories.length,
    officialCategoryNamesPendingClient: false,
    readiness: {
      mongodbConfigured: readiness.mongodbConfigured,
      localCmsEnabled: readiness.localCmsEnabled,
      cloudinaryConfigured: readiness.cloudinaryConfigured,
      visualizerUrl: readiness.visualizerUrl,
    },
    categories: activeCategories,
    approvedClientDesigns: publishedDesigns,
    developmentFixtures: [],
    visualizerPageContent,
  });
}
