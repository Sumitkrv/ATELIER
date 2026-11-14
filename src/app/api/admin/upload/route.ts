import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/admin-auth";
import { MediaAssetRef } from "@/types/models";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

function slugifyBaseName(name: string): string {
  const base = name.replace(/\.[^.]+$/, "");
  const clean = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return clean || "cms-upload";
}

export async function POST(request: Request) {
  const auth = requireAdminRequest(request);
  if (!auth.ok) return auth.response;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const altTextRaw = formData.get("altText");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Please select an image file to upload." },
        { status: 400 }
      );
    }

    const ext = ALLOWED_MIME_TO_EXT[file.type];
    if (!ext) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unsupported file format. Upload JPG, PNG, WebP, or AVIF.",
        },
        { status: 400 }
      );
    }

    if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Image file must be under 10 MB." },
        { status: 413 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const safeSlug = slugifyBaseName(file.name);
    const fileName = `${Date.now()}-${safeSlug}.${ext}`;
    const runtimeRoot = (): string => process["cwd"]();
    const uploadDir = path.join(runtimeRoot(), "public", "uploads", "cms");
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, fileName), bytes);

    const secureUrl = `/uploads/cms/${fileName}`;
    const media: MediaAssetRef = {
      publicId: `uploads/cms/${fileName}`,
      secureUrl,
      resourceType: "image",
      format: ext,
      altText:
        typeof altTextRaw === "string" && altTextRaw.trim()
          ? altTextRaw.trim()
          : safeSlug.replace(/-/g, " "),
    };

    return NextResponse.json({ ok: true, media });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Image upload failed." },
      { status: 500 }
    );
  }
}

