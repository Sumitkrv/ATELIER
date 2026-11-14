import { createHash } from "node:crypto";
import { getDb } from "@/lib/mongodb";
import type { Filter } from "mongodb";
import type { EnquiryDocument, EnquiryStatus } from "@/types/models";

export interface StoredEnquiryRecord extends EnquiryDocument {
  referenceCode: string;
  selectedDesignId?: string | null;
  selectedProjectId?: string | null;
  selectedDesignReference?: string | null;
  resolvedCategoryCode?: string | null;
  resolvedSurfaceName?: string | null;
  assignedOwner?: string | null;
  followUpAt?: string | null;
  emailStatus?: "pending" | "sent" | "delivered" | "failed";
  emailProviderId?: string | null;
  emailAttempts?: number;
  emailAttemptedAt?: string | null;
  emailRetryAt?: string | null;
  emailLastError?: string | null;
  emailLeaseUntil?: string | null;
  emailIdempotencyKey?: string;
  deduplicationKey?: string;
}
export const LEAD_STATUSES = ["New", "Contacted", "Follow-up", "Qualified", "Converted", "Closed", "In Progress"] as const;

async function collection() {
  const db = await getDb();
  const records = db.collection<StoredEnquiryRecord>("enquiries");
  await Promise.all([
    records.createIndex({ id: 1 }, { unique: true }),
    records.createIndex({ deduplicationKey: 1 }, { unique: true, sparse: true }),
    records.createIndex({ createdAt: -1 }), records.createIndex({ status: 1, followUpAt: 1 }),
    records.createIndex({ emailStatus: 1, emailRetryAt: 1 }),
  ]);
  return records;
}
export async function listStoredEnquiries(): Promise<StoredEnquiryRecord[]> {
  return (await collection()).find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(10000).toArray();
}
export interface EnquiryQuery { page?: number; limit?: number; search?: string; status?: string; sourcePage?: string; overdue?: boolean }
export function buildEnquiryFilter(query: EnquiryQuery): Filter<StoredEnquiryRecord> {
  const filter: Filter<StoredEnquiryRecord> = {};
  if (query.status && query.status !== "All") filter.status = query.status === "New" ? { $in: ["New", "new"] } : query.status as EnquiryStatus;
  if (query.sourcePage) filter.sourcePage = query.sourcePage;
  if (query.overdue) { filter.followUpAt = { $lte: new Date().toISOString(), $ne: null }; filter.status = { $nin: ["Closed", "Converted"] }; }
  const search = query.search?.trim().slice(0, 160);
  if (search) {
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = ["fullName", "email", "phone", "referenceCode", "serviceOrDesignInterest"].map(key => ({ [key]: regex }));
  }
  return filter;
}
export async function queryEnquiries(query: EnquiryQuery = {}) {
  const records = await collection();
  const page = Math.max(1, Math.min(query.page || 1, 100000));
  const limit = Math.max(1, Math.min(query.limit || 25, 100));
  const filter = buildEnquiryFilter(query);
  const [enquiries, total, statuses, sources, overdue] = await Promise.all([
    records.find(filter, { projection: { _id: 0 } }).sort({ createdAt: -1, id: 1 }).skip((page - 1) * limit).limit(limit).toArray(),
    records.countDocuments(filter),
    records.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }]).toArray(),
    records.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$sourcePage", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 100 }]).toArray(),
    records.countDocuments(buildEnquiryFilter({ overdue: true })),
  ]);
  return { enquiries, total, page, limit, pages: Math.max(1, Math.ceil(total / limit)), metrics: { statuses, sources, overdue } };
}
export async function saveEnquiryRecord(record: StoredEnquiryRecord): Promise<{ record: StoredEnquiryRecord; deduplicated: boolean }> {
  const records = await collection();
  const fingerprint = createHash("sha256").update(JSON.stringify([record.email.toLowerCase(), record.phone, record.message, Math.floor(Date.now() / 120000)])).digest("hex");
  const next = { ...record, deduplicationKey: fingerprint };
  try { await records.insertOne(next); return { record: next, deduplicated: false }; }
  catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === 11000) {
      const existing = await records.findOne({ deduplicationKey: fingerprint }, { projection: { _id: 0 } });
      if (existing) return { record: existing, deduplicated: true };
    }
    throw error;
  }
}
export async function updateEnquiryRecord(id: string, patch: { status?: EnquiryStatus; note?: string; authorName?: string; assignedOwner?: string | null; followUpAt?: string | null }): Promise<StoredEnquiryRecord | null> {
  const records = await collection();
  const now = new Date().toISOString();
  const fields: Record<string, unknown> = { updatedAt: now };
  for (const key of ["status", "assignedOwner", "followUpAt"] as const) if (patch[key] !== undefined) fields[key] = patch[key];
  const update = { $set: fields, ...(patch.note?.trim() ? { $push: { adminNotes: { note: patch.note.trim(), authorName: patch.authorName || "Studio Admin", createdAt: now } } } : {}) };
  const updated = await records.findOneAndUpdate({ id }, update, { returnDocument: "after", projection: { _id: 0 } });
  if (updated) await (await getDb()).collection("audit_logs").insertOne({ actor: patch.authorName || "Studio Admin", action: patch.assignedOwner !== undefined ? "lead.assigned" : "lead.updated", target: id, collection: "enquiries", createdAt: now });
  return updated;
}
export async function deleteEnquiryRecord(id: string, actor = "Studio Admin"): Promise<boolean> {
  const result = await (await collection()).deleteOne({ id });
  if (result.deletedCount) await (await getDb()).collection("audit_logs").insertOne({ actor, action: "lead.deleted", target: id, collection: "enquiries", createdAt: new Date().toISOString() });
  return result.deletedCount > 0;
}
