import { NextResponse } from "next/server";
import { getEnvironmentReadiness } from "@/lib/env";
import { ATELIER_SURFACES } from "@/lib/brand";
import { SERVICES_PAGE_CONTENT } from "@/lib/projects-catalogue";

/**
 * GET /api/services
 * Safe data-access boundary for Page 04 — Services (`/services`).
 * Returns the confirmed service (`3D Wall Printing`), the 6 confirmed application
 * surfaces (`Walls`, `Tiles`, `Plywood`, `Office Blinds`, `Metals`, `Glass`),
 * provisional process stages, and grounded service FAQs.
 */
export async function GET() {
  const readiness = getEnvironmentReadiness();

  return NextResponse.json({
    status: "ok",
    readiness: {
      mongodbConfigured: readiness.mongodbConfigured,
      cloudinaryConfigured: readiness.cloudinaryConfigured,
    },
    signatureService: SERVICES_PAGE_CONTENT.signatureService,
    surfaceApplications: ATELIER_SURFACES.map((surface, idx) => ({
      id: surface.id,
      code: surface.code,
      name: surface.name,
      shortLabel: surface.shortLabel,
      description: surface.summary,
      applications: surface.applications,
      technicalNote: surface.technicalNote,
      order: idx + 1,
      visible: true,
    })),
    faqs: SERVICES_PAGE_CONTENT.faqs,
  });
}

