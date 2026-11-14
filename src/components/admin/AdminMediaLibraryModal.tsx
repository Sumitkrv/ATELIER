"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Copy,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Search,
  Upload,
  X,
} from "lucide-react";
import {
  ATELIER_ASSET_REGISTRY,
  atelierImages,
} from "@/lib/asset-registry";
import {
  adminButtonClass,
  adminInputClass,
  AdminStatusBadge,
} from "@/components/admin/AdminUiPrimitives";

export interface StudioMediaAsset {
  id: string;
  title: string;
  url: string;
  section: string;
  category:
    | "Designs"
    | "Projects"
    | "Journal"
    | "Surfaces"
    | "Visualizer"
    | "Studio"
    | "Uploads";
  dimensions?: string;
}

function classifyAssetCategory(url: string, section: string): StudioMediaAsset["category"] {
  const lower = `${url} ${section}`.toLowerCase();
  if (lower.includes("/designs/") || lower.includes("catalogue") || lower.includes("category") || lower.includes("artwork")) {
    return "Designs";
  }
  if (lower.includes("/projects/") || lower.includes("project")) {
    return "Projects";
  }
  if (lower.includes("/journal/") || lower.includes("blog")) {
    return "Journal";
  }
  if (lower.includes("/visualizer/")) {
    return "Visualizer";
  }
  if (
    lower.includes("substrate") ||
    lower.includes("surface") ||
    lower.includes("/services/services-material")
  ) {
    return "Surfaces";
  }
  return "Studio";
}

function formatFilenameTitle(filename: string): string {
  return filename
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function flattenManifestUrls(
  node: unknown,
  prefix: string[] = [],
  out: Array<{ url: string; label: string }> = []
) {
  if (typeof node === "string") {
    out.push({ url: node, label: prefix.join(" › ") });
    return out;
  }
  if (node && typeof node === "object") {
    for (const [key, val] of Object.entries(node as Record<string, unknown>)) {
      flattenManifestUrls(val, [...prefix, key], out);
    }
  }
  return out;
}

function buildCuratedStudioAssets(): StudioMediaAsset[] {
  const byUrl = new Map<string, StudioMediaAsset>();

  for (const entry of Object.values(ATELIER_ASSET_REGISTRY)) {
    byUrl.set(entry.url, {
      id: entry.id,
      title: formatFilenameTitle(entry.filename),
      url: entry.url,
      section: entry.intendedSection,
      category: classifyAssetCategory(entry.url, entry.intendedSection),
      dimensions:
        "width" in entry && "height" in entry && entry.width && entry.height
          ? `${entry.width} × ${entry.height}`
          : undefined,
    });
  }

  for (const item of flattenManifestUrls(atelierImages)) {
    if (!byUrl.has(item.url)) {
      const filename = item.url.split("/").pop() || item.url;
      byUrl.set(item.url, {
        id: item.url,
        title: formatFilenameTitle(filename),
        url: item.url,
        section: item.label || "ATELIER Visual Library",
        category: classifyAssetCategory(item.url, item.label),
      });
    }
  }

  return Array.from(byUrl.values());
}

const CURATED_ASSETS = buildCuratedStudioAssets();

const FILTER_TABS: Array<StudioMediaAsset["category"] | "All"> = [
  "All",
  "Designs",
  "Projects",
  "Journal",
  "Surfaces",
  "Visualizer",
  "Studio",
  "Uploads",
];

export function AdminMediaLibraryModal({
  open,
  onClose,
  onSelect,
  title = "Studio Media Library",
}: {
  open: boolean;
  onClose: () => void;
  onSelect?: (url: string) => void;
  title?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<StudioMediaAsset["category"] | "All">("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [uploadedAssets, setUploadedAssets] = useState<StudioMediaAsset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const combinedAssets = useMemo(
    () => [...uploadedAssets, ...CURATED_ASSETS],
    [uploadedAssets]
  );

  const filteredAssets = useMemo(() => {
    const q = search.trim().toLowerCase();
    return combinedAssets.filter((asset) => {
      if (category !== "All" && asset.category !== category) return false;
      if (!q) return true;
      return (
        asset.title.toLowerCase().includes(q) ||
        asset.section.toLowerCase().includes(q) ||
        asset.url.toLowerCase().includes(q)
      );
    });
  }, [combinedAssets, search, category]);

  async function handleFileUpload(file: File) {
    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        media?: { secureUrl?: string; altText?: string };
      };
      if (!res.ok || !json.ok || !json.media?.secureUrl) {
        setUploadError(
          json.error || "Sign in as administrator to upload a new studio asset."
        );
        return;
      }

      const created: StudioMediaAsset = {
        id: `upload-${Date.now()}`,
        title: formatFilenameTitle(file.name),
        url: json.media.secureUrl,
        section: "Uploaded in this session",
        category: "Uploads",
      };
      setUploadedAssets((prev) => [created, ...prev]);
      setCategory("All");
      if (onSelect) {
        onSelect(created.url);
        onClose();
      }
    } catch {
      setUploadError("Upload could not be completed. Verify connection and file size.");
    } finally {
      setUploading(false);
    }
  }

  async function copyAssetUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      window.setTimeout(() => setCopiedUrl((curr) => (curr === url ? null : curr)), 2000);
    } catch {
      // Fallback ignored gracefully in non-clipboard contexts
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1A1A1A]/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="studio-media-library-title"
    >
      <div className="w-full max-w-5xl max-h-[90vh] flex flex-col rounded-[24px] border border-[#DFD0C0] bg-[#FAF6F0] shadow-[0_28px_80px_rgba(26,26,26,0.28)] overflow-hidden">
        {/* Top Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-5 bg-[#FFFDF9] border-b border-[#E8DED3]">
          <div>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9B1C1C]">
              ATELIER Visual Assets
            </p>
            <h2
              id="studio-media-library-title"
              className="mt-1 font-serif text-2xl sm:text-[28px] font-normal text-[#1A1A1A]"
            >
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFileUpload(file);
                e.currentTarget.value = "";
              }}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className={adminButtonClass("primary", "sm")}
            >
              <Upload className="w-3.5 h-3.5" />
              {uploading ? "Uploading..." : "Upload Image"}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Studio Media Library"
              className="p-2 rounded-xl border border-[#DFD0C0] bg-[#FFFDF9] text-[#746B64] hover:text-[#1A1A1A] hover:bg-[#FAF6F0] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="px-6 py-4 bg-[#FFFDF9]/80 border-b border-[#E8DED3] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#746B64] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search studio assets by name, route section, or URL..."
                className={`${adminInputClass} pl-10 h-10 bg-[#FAF6F0]`}
              />
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <span className="font-sans text-xs text-[#746B64] mr-2 admin-tabular">
                {filteredAssets.length} assets
              </span>
              <button
                type="button"
                aria-label="Grid view"
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                  viewMode === "grid"
                    ? "border-[#9B1C1C] bg-[#9B1C1C]/10 text-[#9B1C1C]"
                    : "border-[#DFD0C0] bg-[#FFFDF9] text-[#746B64] hover:text-[#1A1A1A]"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="List view"
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                  viewMode === "list"
                    ? "border-[#9B1C1C] bg-[#9B1C1C]/10 text-[#9B1C1C]"
                    : "border-[#DFD0C0] bg-[#FFFDF9] text-[#746B64] hover:text-[#1A1A1A]"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {FILTER_TABS.map((tab) => {
              const active = category === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setCategory(tab)}
                  className={`px-3 py-1 rounded-full border font-sans text-xs font-medium transition-colors cursor-pointer ${
                    active
                      ? "bg-[#9B1C1C] text-[#FFFDF9] border-[#9B1C1C]"
                      : "bg-[#FFFDF9] text-[#746B64] border-[#DFD0C0] hover:border-[#9B1C1C]/40 hover:text-[#1A1A1A]"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {uploadError ? (
            <div
              role="alert"
              className="rounded-xl border border-[#9B1C1C]/30 bg-[#9B1C1C]/8 px-3.5 py-2.5 font-sans text-xs text-[#9B1C1C]"
            >
              {uploadError}
            </div>
          ) : null}
        </div>

        {/* Scrollable Asset Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredAssets.length === 0 ? (
            <div className="rounded-2xl border border-[#DFD0C0] bg-[#FFFDF9] p-10 text-center">
              <ImageIcon className="w-8 h-8 text-[#746B64]/50 mx-auto" />
              <p className="mt-3 font-serif text-xl text-[#1A1A1A]">
                No matching visual assets
              </p>
              <p className="mt-1 font-sans text-xs text-[#746B64]">
                Try a different keyword or upload a new studio image.
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="group rounded-2xl border border-[#DFD0C0] bg-[#FFFDF9] overflow-hidden flex flex-col transition-colors hover:border-[#9B1C1C]/45"
                >
                  <div className="relative h-36 bg-[#F2EAE1] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.url}
                      alt={asset.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <AdminStatusBadge tone="neutral">{asset.category}</AdminStatusBadge>
                    </div>
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-sans text-xs font-semibold text-[#1A1A1A] truncate">
                        {asset.title}
                      </p>
                      <p className="mt-0.5 font-sans text-[11px] text-[#746B64] line-clamp-1">
                        {asset.section}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[#E8DED3]">
                      {onSelect ? (
                        <button
                          type="button"
                          onClick={() => {
                            onSelect(asset.url);
                            onClose();
                          }}
                          className={`${adminButtonClass("primary", "sm")} flex-1`}
                        >
                          Use Image
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => void copyAssetUrl(asset.url)}
                        className={adminButtonClass("secondary", "sm", onSelect ? "" : "flex-1")}
                        title={asset.url}
                      >
                        {copiedUrl === asset.url ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#264E32]" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            {onSelect ? "URL" : "Copy URL"}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#DFD0C0] bg-[#FFFDF9] divide-y divide-[#E8DED3] overflow-hidden">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF6F0]/70 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={asset.url}
                      alt={asset.title}
                      loading="lazy"
                      className="w-14 h-12 rounded-xl object-cover border border-[#DFD0C0] shrink-0 bg-[#F2EAE1]"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-sans text-sm font-medium text-[#1A1A1A] truncate">
                          {asset.title}
                        </p>
                        <AdminStatusBadge tone="neutral">{asset.category}</AdminStatusBadge>
                      </div>
                      <p className="mt-0.5 font-sans text-xs text-[#746B64] truncate">
                        {asset.url}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => void copyAssetUrl(asset.url)}
                      className={adminButtonClass("secondary", "sm")}
                    >
                      {copiedUrl === asset.url ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#264E32]" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy URL
                        </>
                      )}
                    </button>
                    {onSelect ? (
                      <button
                        type="button"
                        onClick={() => {
                          onSelect(asset.url);
                          onClose();
                        }}
                        className={adminButtonClass("primary", "sm")}
                      >
                        Select
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

