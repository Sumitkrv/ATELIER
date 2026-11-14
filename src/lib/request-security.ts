import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export class RequestError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export const PRIVATE_HEADERS = { "Cache-Control": "private, no-store, max-age=0", "Vary": "Cookie", "X-Content-Type-Options": "nosniff" };
export function privateJson(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: PRIVATE_HEADERS });
}

export function checkSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  const site = request.headers.get("sec-fetch-site");
  if (site === "cross-site") throw new RequestError("Cross-site requests are not allowed.", 403);
  if (origin) {
    let actual: string;
    try { actual = new URL(origin).origin; } catch { throw new RequestError("Invalid request origin.", 403); }
    const allowed = new Set([new URL(request.url).origin]);
    // Explicit origin is useful behind a trusted reverse proxy; never derive it from arbitrary headers.
    if (process.env.APP_URL) {
      try { allowed.add(new URL(process.env.APP_URL).origin); } catch { /* invalid configuration is not allowed */ }
    }
    if (!allowed.has(actual)) throw new RequestError("Cross-site requests are not allowed.", 403);
  }
}

export async function readJsonBody(request: Request, maxBytes = 64 * 1024): Promise<unknown> {
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    throw new RequestError("Content-Type must be application/json.", 415);
  }
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > maxBytes) throw new RequestError("Request body is too large.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError("A JSON request body is required.");
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > maxBytes) { await reader.cancel(); throw new RequestError("Request body is too large.", 413); }
    chunks.push(value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new RequestError("Request body must be valid JSON."); }
}

const localLimits = new Map<string, { count: number; expires: number }>();
export async function enforceRateLimit(request: Request, scope: string, limit: number, windowMs: number): Promise<void> {
  // Only trust platform-provided IP headers on that platform. Otherwise use one shared bucket.
  const address = process.env.VERCEL ? request.headers.get("x-vercel-forwarded-for") || "unknown" : "shared-client";
  const hash = createHash("sha256").update(`${scope}:${address}`).digest("hex");
  const start = Math.floor(Date.now() / windowMs) * windowMs;
  const key = `${hash}:${start}`;
  if (localLimits.size > 10000) for (const [k, value] of localLimits) if (value.expires < Date.now()) localLimits.delete(k);
  const local = localLimits.get(key) || { count: 0, expires: start + windowMs };
  local.count += 1;
  localLimits.set(key, local);
  if (local.count > limit) throw new RequestError("Too many requests. Please try again later.", 429);
  const db = await getDb();
  const collection = db.collection("rate_limits");
  await Promise.all([collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }), collection.createIndex({ key: 1 }, { unique: true })]);
  const result = await collection.findOneAndUpdate(
    { key },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(start + windowMs) } },
    { upsert: true, returnDocument: "after" }
  );
  if ((result?.count || 0) > limit) throw new RequestError("Too many requests. Please try again later.", 429);
}

export function requestErrorResponse(error: unknown, fallback = "The service is temporarily unavailable. Please try again.") {
  const status = error instanceof RequestError ? error.status : 503;
  const response = privateJson({ ok: false, error: error instanceof RequestError ? error.message : fallback }, status);
  if (status === 429) response.headers.set("Retry-After", "60");
  return response;
}
