import { NextResponse } from "next/server";
import { getEnvironmentReadiness } from "@/lib/env";
import {
  DESIGN_CATEGORY_RECORDS,
  DEVELOPMENT_FIXTURE_DESIGNS,
} from "@/lib/designs-catalogue";

/**
 * GET /api/designs
 * Safe data-access boundary for Page 02 — Explore Designs (`/explore-designs`).
 * Returns the 13 admin-configurable category records, verified client designs
 * (empty array until MongoDB is connected and client uploads approved designs),
 * and explicitly flagged development fixtures for pre-launch QA.
 */
export async function GET() {
  const readiness = getEnvironmentReadiness();

  return NextResponse.json({
    status: "ok",
    totalCategorySlots: 13,
    officialCategoryNamesPendingClient: true,
    readiness: {
      mongodbConfigured: readiness.mongodbConfigured,
      cloudinaryConfigured: readiness.cloudinaryConfigured,
      visualizerUrl: readiness.visualizerUrl,
    },
    categories: DESIGN_CATEGORY_RECORDS,
    approvedClientDesigns: [],
    developmentFixtures: DEVELOPMENT_FIXTURE_DESIGNS,
  });
}

