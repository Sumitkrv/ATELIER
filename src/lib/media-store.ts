import crypto from "node:crypto";
import { getDb } from "@/lib/mongodb";
import type { MediaAssetDocument } from "@/types/models";

export interface ManagedMediaAsset extends MediaAssetDocument {
  originalFilename: string;
  uploadedBy: string;
  deletionState?: "deleting";
}

const CONTENT_COLLECTIONS = ["categories", "designs", "projects", "blogs", "pages", "site_settings"];
export async function mediaReferences(asset: { secureUrl: string; publicId: string }) {
  const db = await getDb();
  const references: Array<{ collection: string; id: string; published: boolean }> = [];
  for (const name of CONTENT_COLLECTIONS) {
    const cursor = db.collection(name).find({}, { projection: { id: 1, draft: 1, published: 1 } });
    for await (const doc of cursor) {
      const hasReference = (value: unknown) => {
        const serialized = JSON.stringify(value ?? null);
        return serialized.includes(asset.secureUrl) || serialized.includes(`"${asset.publicId}"`);
      };
      if (hasReference(doc.draft) || hasReference(doc.published)) {
        references.push({ collection: name, id: String(doc.id), published: hasReference(doc.published) });
      }
    }
  }
  return references;
}

export function cloudinaryCredentials() {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !apiKey || !secret || !/^[a-zA-Z0-9_-]+$/.test(cloud)) {
    throw new Error("Cloud media storage is not configured. Contact the site administrator.");
  }
  return { cloud, apiKey, secret };
}
export function signCloudinary(params: Record<string, string>, secret: string) {
  return crypto.createHash("sha256").update(Object.entries(params).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join("&") + secret).digest("hex");
}
export function detectUploadType(bytes: Buffer, mime: string): "image" | "video" | null {
  if (mime === "image/jpeg" && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image";
  if (mime === "image/png" && bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return "image";
  if (mime === "image/webp" && bytes.toString("ascii",0,4) === "RIFF" && bytes.toString("ascii",8,12) === "WEBP") return "image";
  if (mime === "image/avif" && bytes.toString("ascii",4,8) === "ftyp" && /avif|avis/.test(bytes.toString("ascii",8,32))) return "image";
  if (mime === "video/mp4" && bytes.toString("ascii",4,8) === "ftyp" && /isom|mp4|avc1|M4V/.test(bytes.toString("ascii",8,40))) return "video";
  if (mime === "video/webm" && bytes.subarray(0,4).equals(Buffer.from([26,69,223,163]))) return "video";
  return null;
}
export async function destroyCloudAsset(publicId: string, resourceType: "image" | "video") {
  const { cloud, apiKey, secret } = cloudinaryCredentials();
  const params = { public_id: publicId, timestamp: String(Math.floor(Date.now()/1000)), invalidate: "true" };
  const form = new URLSearchParams({ ...params, api_key: apiKey, signature: signCloudinary(params, secret) });
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/${resourceType}/destroy`, { method: "POST", body: form, signal: AbortSignal.timeout(20000) });
  const result = await response.json();
  if (!response.ok || !["ok", "not found"].includes(result.result)) throw new Error("Cloud asset could not be deleted. Please retry.");
}
export async function logMediaAction(actor: string, action: string, id: string) {
  const db = await getDb();
  await db.collection("audit_logs").insertOne({ id: crypto.randomUUID(), actor, action, target: { collection: "media_assets", id }, createdAt: new Date().toISOString() });
}
