import { NextResponse } from "next/server";
import { getEnvironmentReadiness } from "@/lib/env";

export async function GET() {
  const readiness = getEnvironmentReadiness();

  return NextResponse.json({
    status: "ok",
    phase: "Phase 01 — Foundation, Reference Analysis & Design System",
    publicPagesCount: 8,
    designCategorySlotsCount: 13,
    adminModulesCount: 8,
    readiness,
  });
}

