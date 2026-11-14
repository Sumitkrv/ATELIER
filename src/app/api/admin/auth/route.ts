import { z } from "zod";
import { buildClearSessionCookieHeader, buildSessionCookieHeader, getActiveAdminSession, persistAdminSession, revokeAdminSession, signAdminSessionToken, verifyAdminCredentials } from "@/lib/admin-auth";
import { checkSameOrigin, enforceRateLimit, privateJson, readJsonBody, requestErrorResponse } from "@/lib/request-security";
import { getEnvironmentReadiness } from "@/lib/env";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const session = await getActiveAdminSession(request);
    return privateJson({ ok: true, authenticated: Boolean(session), session: session ? { email: session.email, role: session.role, exp: session.exp } : null, ...(session ? { readiness: getEnvironmentReadiness() } : {}) });
  } catch (error) { return requestErrorResponse(error); }
}
export async function POST(request: Request) {
  try {
    checkSameOrigin(request);
    const parsed = z.object({ email: z.string().trim().email().max(254), password: z.string().min(1).max(1024) }).safeParse(await readJsonBody(request, 4096));
    if (!parsed.success) return privateJson({ ok: false, error: "Please enter a valid email and password." }, 400);
    await enforceRateLimit(request, "admin-login", 10, 15 * 60 * 1000);
    const verified = verifyAdminCredentials(parsed.data.email, parsed.data.password);
    if (!verified.ok) return privateJson({ ok: false, error: verified.error }, 401);
    const token = signAdminSessionToken(verified.email);
    await persistAdminSession(token);
    const response = privateJson({ ok: true, authenticated: true, session: { email: verified.email, role: "super_admin" } });
    response.headers.set("Set-Cookie", buildSessionCookieHeader(token));
    return response;
  } catch (error) { return requestErrorResponse(error); }
}
export async function DELETE(request: Request) {
  try {
    checkSameOrigin(request);
    await revokeAdminSession(request);
    const response = privateJson({ ok: true, authenticated: false });
    response.headers.set("Set-Cookie", buildClearSessionCookieHeader());
    return response;
  } catch (error) { return requestErrorResponse(error); }
}
