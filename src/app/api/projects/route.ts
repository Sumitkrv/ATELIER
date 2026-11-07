import { NextResponse } from "next/server";
import { getEnvironmentReadiness } from "@/lib/env";
import { DEVELOPMENT_PROJECT_FIXTURES } from "@/lib/projects-catalogue";

/**
 * GET /api/projects
 * Safe data-access boundary for Page 03 — Our Projects (`/projects` & `/our-projects`).
 * Returns verified client projects (`[]` until MongoDB is connected and client uploads
 * real completed installations via `/admin/projects`) alongside explicitly labeled
 * development fixtures for portfolio UI, media viewer, and detail-route QA.
 */
export async function GET() {
  const readiness = getEnvironmentReadiness();

  return NextResponse.json({
    status: "ok",
    readiness: {
      mongodbConfigured: readiness.mongodbConfigured,
      cloudinaryConfigured: readiness.cloudinaryConfigured,
    },
    approvedClientProjects: [],
    developmentFixtures: DEVELOPMENT_PROJECT_FIXTURES,
  });
}

