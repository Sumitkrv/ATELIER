import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/admin-auth";
import { getDb } from "@/lib/mongodb";
import { cloudinaryCredentials, detectUploadType, destroyCloudAsset, logMediaAction, signCloudinary, type ManagedMediaAsset } from "@/lib/media-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };
export async function POST(request: Request) {
  const auth = await requireAdminRequest(request);
  if (!auth.ok) return auth.response;
  try {
    // Keep uploads within Vercel's request-body limit. Larger video assets can be supplied as cloud URLs.
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 4 * 1024 * 1024) return NextResponse.json({ ok: false, error: "Upload must be under 4 MB." }, { status: 413, headers });
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.size || file.size > 4 * 1024 * 1024) return NextResponse.json({ ok: false, error: "Select an image or video under 4 MB." }, { status: 400, headers });
    const bytes = Buffer.from(await file.arrayBuffer());
    const resourceType = detectUploadType(bytes, file.type);
    if (!resourceType) return NextResponse.json({ ok: false, error: "File contents must match a supported JPG, PNG, WebP, AVIF, MP4, or WebM file." }, { status: 400, headers });
    const db = await getDb();
    const { cloud, apiKey, secret } = cloudinaryCredentials();
    const publicId = `atelier/cms/${crypto.randomUUID()}`;
    const params = { public_id: publicId, timestamp: String(Math.floor(Date.now()/1000)) };
    const upload = new FormData();
    upload.append("file", new Blob([bytes], { type: file.type }), "asset");
    for (const [key, value] of Object.entries({ ...params, api_key: apiKey, signature: signCloudinary(params, secret) })) upload.append(key, value);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/${resourceType}/upload`, { method: "POST", body: upload, signal: AbortSignal.timeout(60000) });
    const result = await response.json();
    if (!response.ok || typeof result.secure_url !== "string" || !result.secure_url.startsWith("https://res.cloudinary.com/")) throw new Error("Cloud upload failed. Please try again.");
    const now = new Date().toISOString();
    const media: ManagedMediaAsset = {
      id: crypto.randomUUID(), publicId: result.public_id, secureUrl: result.secure_url, resourceType,
      format: String(result.format || ""), width: Number(result.width || 0), height: Number(result.height || 0),
      durationSeconds: resourceType === "video" ? Number(result.duration || 0) : null,
      bytes: Number(result.bytes || file.size), altText: String(form.get("altText") || file.name.replace(/\.[^.]+$/, "")).trim().slice(0, 500),
      folder: "branding", originalFilename: file.name.replace(/[\x00-\x1f]/g, "").slice(0, 200), uploadedBy: auth.session.email, createdAt: now, updatedAt: now,
    };
    try { await db.collection<ManagedMediaAsset>("media_assets").insertOne(media); }
    catch { await destroyCloudAsset(media.publicId, resourceType); throw new Error("Could not save asset information. Upload was rolled back."); }
    await logMediaAction(auth.session.email, "media.upload", media.id);
    return NextResponse.json({ ok: true, media }, { headers });
  } catch (error) {
    const message = error instanceof Error && /not configured|Cloud upload|asset information/.test(error.message) ? error.message : "Media storage is unavailable. Please try again.";
    return NextResponse.json({ ok: false, error: message }, { status: 503, headers });
  }
}
