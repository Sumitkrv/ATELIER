import crypto from "node:crypto";
import { getDb } from "@/lib/mongodb";
import { checkSameOrigin, privateJson, requestErrorResponse } from "@/lib/request-security";

export const ADMIN_SESSION_COOKIE = "atelier_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;
export interface AdminSessionPayload {
  email: string;
  role: "super_admin";
  sid: string;
  credentialVersion: string;
  iat: number;
  exp: number;
}
function getAuthSecret(): string | null {
  const secret = process.env.ADMIN_AUTH_SECRET?.trim();
  return secret && secret.length >= 32 ? secret : null;
}
function safeEqual(a: string, b: string): boolean {
  return crypto.timingSafeEqual(crypto.createHash("sha256").update(a).digest(), crypto.createHash("sha256").update(b).digest());
}
function credentialVersion() {
  return crypto.createHash("sha256").update(`${process.env.INITIAL_ADMIN_EMAIL?.toLowerCase()}:${process.env.INITIAL_ADMIN_PASSWORD_HASH || process.env.INITIAL_ADMIN_PASSWORD}`).digest("hex");
}
function passwordMatches(password: string): boolean {
  const stored = process.env.INITIAL_ADMIN_PASSWORD_HASH;
  if (stored) {
    const [algorithm, salt, hash] = stored.split(":");
    if (algorithm !== "scrypt" || !/^[a-f0-9]{32,128}$/i.test(salt || "") || !/^[a-f0-9]{128}$/i.test(hash || "")) return false;
    return safeEqual(crypto.scryptSync(password, Buffer.from(salt, "hex"), 64).toString("hex"), hash);
  }
  return Boolean(process.env.INITIAL_ADMIN_PASSWORD && safeEqual(password, process.env.INITIAL_ADMIN_PASSWORD));
}
export function verifyAdminCredentials(email: string, password: string): { ok: true; email: string } | { ok: false; error: string } {
  const expected = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  if (!getAuthSecret() || !expected || !(process.env.INITIAL_ADMIN_PASSWORD_HASH || process.env.INITIAL_ADMIN_PASSWORD)) return { ok: false, error: "Administrator sign-in is not configured. Please contact the site owner." };
  const matches = password.length <= 1024 && passwordMatches(password);
  if (!safeEqual(email.trim().toLowerCase(), expected) || !matches) return { ok: false, error: "Invalid administrator email or password." };
  return { ok: true, email: expected };
}
export function signAdminSessionToken(email: string): string {
  const secret = getAuthSecret();
  if (!secret) throw new Error("Administrator authentication is unavailable.");
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminSessionPayload = { email, role: "super_admin", sid: crypto.randomUUID(), credentialVersion: credentialVersion(), iat: now, exp: now + SESSION_TTL_SECONDS };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${crypto.createHmac("sha256", secret).update(encoded).digest("base64url")}`;
}
export function verifyAdminSessionToken(token: string | undefined | null): AdminSessionPayload | null {
  const secret = getAuthSecret();
  if (!token || token.length > 4096 || !secret) return null;
  const pieces = token.split(".");
  if (pieces.length !== 2) return null;
  const [encoded, signature] = pieces;
  if (!safeEqual(signature, crypto.createHmac("sha256", secret).update(encoded).digest("base64url"))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as AdminSessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (parsed.role !== "super_admin" || parsed.email !== process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase() || typeof parsed.sid !== "string" || !parsed.sid || parsed.credentialVersion !== credentialVersion() || !Number.isFinite(parsed.iat) || !Number.isFinite(parsed.exp) || parsed.iat > now + 30 || parsed.exp <= now || parsed.exp - parsed.iat > SESSION_TTL_SECONDS) return null;
    return parsed;
  } catch { return null; }
}
export function readAdminSessionFromRequest(request: Request): AdminSessionPayload | null {
  try {
    const cookie = (request.headers.get("cookie") || "").split(";").map(x => x.trim()).find(x => x.startsWith(`${ADMIN_SESSION_COOKIE}=`));
    return verifyAdminSessionToken(cookie ? decodeURIComponent(cookie.slice(ADMIN_SESSION_COOKIE.length + 1)) : null);
  } catch { return null; }
}
export async function persistAdminSession(token: string) {
  const session = verifyAdminSessionToken(token);
  if (!session) throw new Error("Invalid administrator session.");
  const db = await getDb();
  await db.collection("admin_sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await db.collection("admin_sessions").insertOne({ sid: session.sid, email: session.email, expiresAt: new Date(session.exp * 1000), createdAt: new Date() });
}
export async function getActiveAdminSession(request: Request): Promise<AdminSessionPayload | null> {
  const session = readAdminSessionFromRequest(request);
  if (!session) return null;
  const db = await getDb();
  return await db.collection("admin_sessions").findOne({ sid: session.sid, expiresAt: { $gt: new Date() } }) ? session : null;
}
export async function revokeAdminSession(request: Request) {
  const session = readAdminSessionFromRequest(request);
  if (session) await (await getDb()).collection("admin_sessions").deleteOne({ sid: session.sid });
}
export async function requireAdminRequest(request: Request) {
  try {
    const session = await getActiveAdminSession(request);
    if (!session) return { ok: false as const, response: privateJson({ ok: false, error: "Unauthorized. Please sign in at /admin/login." }, 401) };
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) checkSameOrigin(request);
    return { ok: true as const, session };
  } catch (error) { return { ok: false as const, response: requestErrorResponse(error) }; }
}
export function buildSessionCookieHeader(token: string): string {
  return `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}
export function buildClearSessionCookieHeader(): string {
  return `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}
