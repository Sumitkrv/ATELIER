import { NextResponse, type NextRequest } from "next/server";
import { getActiveAdminSession } from "@/lib/admin-auth";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "private, no-store");
  if (request.nextUrl.pathname === "/admin/login") return response;
  try {
    if (await getActiveAdminSession(request)) return response;
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  } catch {
    return new NextResponse("The administration service is temporarily unavailable. Please try again shortly.", { status: 503, headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" } });
  }
}
export const config = { matcher: ["/admin/:path*"] };
