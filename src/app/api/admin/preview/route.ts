import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/admin-auth";
export async function GET(request: Request) {
  const auth = await requireAdminRequest(request);
  if (!auth.ok) return auth.response;
  const url = new URL(request.url);
  const path = url.searchParams.get("path") || "/";
  if (!/^\/(?:$|(?:about|services|process|contact|visualizer|explore-designs|projects|blogs)(?:[/?#]|$))/.test(path) || path.startsWith("//") || /[\\\r\n]/.test(path)) return NextResponse.json({ error: "Invalid preview path." }, { status: 400 });
  const mode = await draftMode();
  if (url.searchParams.get("exit") === "1") mode.disable(); else mode.enable();
  return NextResponse.redirect(new URL(path, request.url), { headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" } });
}
