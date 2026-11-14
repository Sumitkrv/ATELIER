import type { Filter } from "mongodb";
import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/admin-auth";
import { getDb } from "@/lib/mongodb";
import { destroyCloudAsset, logMediaAction, mediaReferences, type ManagedMediaAsset } from "@/lib/media-store";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };
export async function GET(request: Request) {
  const auth = await requireAdminRequest(request); if (!auth.ok) return auth.response;
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const query = searchParams.get("q")?.trim().slice(0,100);
    const type = searchParams.get("type");
    const filter: Filter<ManagedMediaAsset> = { ...(type === "image" || type === "video" ? { resourceType: type } : {}), ...(query ? { $or: ["altText", "originalFilename"].map(key => ({ [key]: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } })) } : {}) };
    const db = await getDb();
    const collection = db.collection<ManagedMediaAsset>("media_assets");
    const [records, total] = await Promise.all([collection.find(filter, { projection: { _id: 0, uploadedBy: 0 } }).sort({ createdAt: -1 }).skip((page-1)*60).limit(60).toArray(), collection.countDocuments(filter)]);
    const assets = await Promise.all(records.map(async asset => ({ ...asset, references: await mediaReferences(asset) })));
    return NextResponse.json({ ok: true, assets, total, page, pageSize: 60 }, { headers });
  } catch { return NextResponse.json({ ok: false, error: "Media library is unavailable." }, { status: 503, headers }); }
}
export async function PATCH(request: Request) {
  const auth = await requireAdminRequest(request); if (!auth.ok) return auth.response;
  try {
    const body = await request.json();
    if (typeof body.id !== "string" || typeof body.altText !== "string" || body.altText.length > 500) return NextResponse.json({ ok: false, error: "Provide an asset and alt text under 500 characters." }, { status: 400, headers });
    const db = await getDb();
    const result = await db.collection("media_assets").updateOne({ id: body.id, deletionState: { $exists: false } }, { $set: { altText: body.altText.trim(), updatedAt: new Date().toISOString() } });
    return NextResponse.json({ ok: !!result.matchedCount }, { status: result.matchedCount ? 200 : 404, headers });
  } catch { return NextResponse.json({ ok: false, error: "Could not update asset." }, { status: 503, headers }); }
}
export async function DELETE(request: Request) {
  const auth = await requireAdminRequest(request); if (!auth.ok) return auth.response;
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "Choose an asset." }, { status: 400, headers });
    const db = await getDb();
    const collection = db.collection<ManagedMediaAsset>("media_assets");
    const asset = await collection.findOne({ id });
    if (!asset) return NextResponse.json({ ok: false, error: "Asset not found." }, { status: 404, headers });
    const references = await mediaReferences(asset);
    if (references.length) return NextResponse.json({ ok: false, error: "This asset is used by saved or published content. Replace it there before deleting.", references }, { status: 409, headers });
    await collection.updateOne({ id }, { $set: { deletionState: "deleting" } });
    try {
      if ((await mediaReferences(asset)).length) throw new Error("Asset is now referenced.");
      await destroyCloudAsset(asset.publicId, asset.resourceType);
      await collection.deleteOne({ id });
    } catch { await collection.updateOne({ id }, { $unset: { deletionState: "" } }); throw new Error("Could not safely delete this asset."); }
    await logMediaAction(auth.session.email, "media.delete", id);
    return NextResponse.json({ ok: true }, { headers });
  } catch { return NextResponse.json({ ok: false, error: "Could not delete asset. It may be in use or cloud storage may be unavailable." }, { status: 503, headers }); }
}
