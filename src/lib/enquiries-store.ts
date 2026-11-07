import fs from "fs/promises";
import path from "path";
import { EnquiryDocument } from "@/types/models";

export interface StoredEnquiryRecord extends EnquiryDocument {
  referenceCode: string;
  selectedDesignId?: string | null;
  selectedProjectId?: string | null;
  selectedDesignReference?: string | null;
  resolvedCategoryCode?: string | null;
  resolvedSurfaceName?: string | null;
}

const DATA_DIR = path.join(process.cwd(), ".data");
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

  // Deduplicate identical customer + message submissions within 2 minutes
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

