import { NextResponse } from "next/server";
import {
  buildClearSessionCookieHeader,
  buildSessionCookieHeader,
  readAdminSessionFromRequest,
  signAdminSessionToken,
  verifyAdminCredentials,
} from "@/lib/admin-auth";
import { getEnvironmentReadiness } from "@/lib/env";

export async function GET(request: Request) {
  const session = readAdminSessionFromRequest(request);
  const readiness = getEnvironmentReadiness();
  const isDev = process.env.NODE_ENV !== "production";

  return NextResponse.json({
    ok: true,
    authenticated: Boolean(session),
    session: session
      ? {
          email: session.email,
          role: session.role,
          exp: session.exp,
        }
      : null,
    readiness,
    devEmailHint: isDev
      ? process.env.INITIAL_ADMIN_EMAIL?.trim() || null
      : null,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email.trim() || !password) {
      return NextResponse.json(
        { ok: false, error: "Please enter both email and password." },
        { status: 400 }
      );
    }

    const verified = verifyAdminCredentials(email, password);
    if (!verified.ok) {
      return NextResponse.json(
        { ok: false, error: verified.error },
        { status: 401 }
      );
    }

    const token = signAdminSessionToken(verified.email);
    const response = NextResponse.json({
      ok: true,
      authenticated: true,
      session: {
        email: verified.email,
        role: "super_admin",
      },
    });
    response.headers.set("Set-Cookie", buildSessionCookieHeader(token));
    return response;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to process sign-in request." },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true, authenticated: false });
  response.headers.set("Set-Cookie", buildClearSessionCookieHeader());
  return response;
}

