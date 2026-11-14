import fs from "fs/promises";
import path from "path";
import { EnquiryDocument, EnquiryStatus } from "@/types/models";

export interface StoredEnquiryRecord extends EnquiryDocument {
  referenceCode: string;
  selectedDesignId?: string | null;
  selectedProjectId?: string | null;
  selectedDesignReference?: string | null;
  resolvedCategoryCode?: string | null;
  resolvedSurfaceName?: string | null;
}

const runtimeRoot = (): string => process["cwd"]();
const DATA_DIR = path.join(runtimeRoot(), ".data");
const ENQUIRIES_FILE = path.join(DATA_DIR, "enquiries.json");

async function ensureStoreFile(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(ENQUIRIES_FILE);
  } catch {
    await fs.writeFile(ENQUIRIES_FILE, JSON.stringify([], null, 2), "utf8");
  }
}

export async function listStoredEnquiries(): Promise<StoredEnquiryRecord[]> {
  try {
    await ensureStoreFile();
    const raw = await fs.readFile(ENQUIRIES_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as StoredEnquiryRecord[];
  } catch {
    return [];
  }
}

export async function saveEnquiryRecord(
  record: StoredEnquiryRecord
): Promise<{ record: StoredEnquiryRecord; deduplicated: boolean }> {
  await ensureStoreFile();
  const existing = await listStoredEnquiries();

  const nowMs = Date.now();
  const duplicate = existing.find((item) => {
    const createdMs = new Date(item.createdAt).getTime();
    const withinWindow = Math.abs(nowMs - createdMs) < 2 * 60 * 1000;
    return (
      withinWindow &&
      item.email.toLowerCase() === record.email.toLowerCase() &&
      item.phone.trim() === record.phone.trim() &&
      item.message.trim() === record.message.trim()
    );
  });

  if (duplicate) {
    return { record: duplicate, deduplicated: true };
  }

  const updated = [record, ...existing];
  await fs.writeFile(ENQUIRIES_FILE, JSON.stringify(updated, null, 2), "utf8");
  return { record, deduplicated: false };
}

export async function updateEnquiryRecord(
  id: string,
  patch: {
    status?: EnquiryStatus;
    note?: string;
    authorName?: string;
  }
): Promise<StoredEnquiryRecord | null> {
  await ensureStoreFile();
  const existing = await listStoredEnquiries();
  const idx = existing.findIndex((item) => item.id === id);
  if (idx === -1) return null;

  const current = existing[idx];
  const nowIso = new Date().toISOString();
  const nextNotes = patch.note?.trim()
    ? [
        ...(current.adminNotes || []),
        {
          note: patch.note.trim(),
          authorName: patch.authorName || "Studio Admin",
          createdAt: nowIso,
        },
      ]
    : current.adminNotes || [];

  const updatedItem: StoredEnquiryRecord = {
    ...current,
    status: patch.status ?? current.status,
    adminNotes: nextNotes,
    updatedAt: nowIso,
  };

  const nextList = [...existing];
  nextList[idx] = updatedItem;
  await fs.writeFile(ENQUIRIES_FILE, JSON.stringify(nextList, null, 2), "utf8");
  return updatedItem;
}

export async function deleteEnquiryRecord(id: string): Promise<boolean> {
  await ensureStoreFile();
  const existing = await listStoredEnquiries();
  const nextList = existing.filter((item) => item.id !== id);
  if (nextList.length === existing.length) return false;
  await fs.writeFile(ENQUIRIES_FILE, JSON.stringify(nextList, null, 2), "utf8");
  return true;
}
