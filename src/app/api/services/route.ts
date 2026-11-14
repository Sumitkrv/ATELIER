import { NextResponse } from "next/server";
import { ATELIER_SURFACES } from "@/lib/brand";
import { SERVICES_PAGE_CONTENT } from "@/lib/projects-catalogue";
import { getPublicPages } from "@/lib/public-cms";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const page = (await getPublicPages()).find(item => item.pageKey === "services");
    return NextResponse.json({ status: "ok", pageContent: page || null, signatureService: SERVICES_PAGE_CONTENT.signatureService, surfaceApplications: ATELIER_SURFACES.map((surface, index) => ({ id: surface.id, code: surface.code, name: surface.name, shortLabel: surface.shortLabel, description: surface.summary, applications: surface.applications, technicalNote: surface.technicalNote, order: index + 1, visible: true })), faqs: page?.faqs?.filter(item => item.isActive).sort((a,b) => a.order-b.order) || SERVICES_PAGE_CONTENT.faqs }, { headers: { "Cache-Control": "private, no-store" } });
  } catch { return NextResponse.json({ error: "Services are temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}
