import crypto from "crypto";
import { NextResponse } from "next/server";

export const ADMIN_SESSION_COOKIE = "atelier_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface AdminSessionPayload {
  email: string;
  role: "super_admin";
  iat: number;
  exp: number;
}

function getAuthSecret(): string | null {
  const secret = process.env.ADMIN_AUTH_SECRET?.trim();
  if (!secret || secret.length < 16) return null;
  return secret;
}

function safeEqual(a: string, b: string): boolean {
  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

export function verifyAdminCredentials(
  email: string,
  password: string
): { ok: true; email: string } | { ok: false; error: string } {
  const secret = getAuthSecret();
  const expectedEmail = process.env.INITIAL_ADMIN_EMAIL?.trim();
  const expectedPassword = process.env.INITIAL_ADMIN_PASSWORD;

  if (!secret || !expectedEmail || !expectedPassword) {
    return {
      ok: false,
      error:
        "ADMIN_AUTH_SECRET, INITIAL_ADMIN_EMAIL, and INITIAL_ADMIN_PASSWORD must be configured in .env.local.",
    };
  }

  const normalizedInputEmail = email.trim().toLowerCase();
  const normalizedExpectedEmail = expectedEmail.toLowerCase();

  const emailMatch = safeEqual(normalizedInputEmail, normalizedExpectedEmail);
  const passwordMatch = safeEqual(password, expectedPassword);

  if (!emailMatch || !passwordMatch) {
    return { ok: false, error: "Invalid administrator email or password." };
  }

  return { ok: true, email: expectedEmail };
}

export function signAdminSessionToken(email: string): string {
  const secret = getAuthSecret();
  if (!secret) {
    throw new Error("ADMIN_AUTH_SECRET is not configured.");
  }
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminSessionPayload = {
    email,
    role: "super_admin",
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  const signature = crypto
    .createHmac("sha256", secret)
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${signature}`;
}

export function verifyAdminSessionToken(
  token: string | undefined | null
): AdminSessionPayload | null {
  if (!token) return null;
  const secret = getAuthSecret();
  if (!secret) return null;

  const dotIdx = token.indexOf(".");
  if (dotIdx <= 0) return null;
  const encoded = token.slice(0, dotIdx);
  const signature = token.slice(dotIdx + 1);

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(encoded)
    .digest("base64url");

  if (!safeEqual(signature, expectedSig)) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    ) as AdminSessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (!parsed.email || typeof parsed.exp !== "number" || parsed.exp <= now) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function readAdminSessionFromRequest(
  request: Request
): AdminSessionPayload | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`));
  if (!match) return null;
  const rawValue = decodeURIComponent(
    match.slice(ADMIN_SESSION_COOKIE.length + 1)
  );
  return verifyAdminSessionToken(rawValue);
}

export function requireAdminRequest(
  request: Request
):
  | { ok: true; session: AdminSessionPayload }
  | { ok: false; response: NextResponse } {
  const session = readAdminSessionFromRequest(request);
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          ok: false,
          error:
            "Unauthorized. Please sign in at /admin/login to modify CMS records.",
        },
        { status: 401 }
      ),
    };
  }
  return { ok: true, session };
}

export function buildSessionCookieHeader(token: string): string {
  const securePart = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${securePart}`;
}

export function buildClearSessionCookieHeader(): string {
  return `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

