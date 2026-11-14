"use client";
import { adminInputClass, adminLabelClass, adminTextareaClass } from "./AdminUiPrimitives";
import { AdminImageUploadField } from "./AdminChromeClient";

export interface RecordDetails {
  galleryImageUrls: string[]; beforeImageUrl: string; afterImageUrl: string; videoUrl: string;
  displayOrder: number; seoTitle: string; seoDescription: string;
}
export const EMPTY_RECORD_DETAILS: RecordDetails = { galleryImageUrls: [], beforeImageUrl: "", afterImageUrl: "", videoUrl: "", displayOrder: 0, seoTitle: "", seoDescription: "" };
export function readRecordDetails(record: unknown): RecordDetails {
  const item = record as Record<string, unknown>;
  const images = (item.galleryMedia || item.galleryImages || []) as Array<{ secureUrl: string }>;
  const pair = (item.beforeAfterMedia || {}) as { beforeImageUrl?: string; afterImageUrl?: string };
  const seo = item.seo as { metaTitle?: string; metaDescription?: string } | undefined;
  const video = item.videoAsset as { secureUrl?: string } | undefined;
  return { galleryImageUrls: images.filter(media => media.secureUrl).map(media => media.secureUrl), beforeImageUrl: pair.beforeImageUrl || "", afterImageUrl: pair.afterImageUrl || "", videoUrl: video?.secureUrl || "", displayOrder: Number(item.displayOrder || item.sortOrder || 0), seoTitle: String(item.seoTitle || seo?.metaTitle || ""), seoDescription: String(item.seoDescription || seo?.metaDescription || "") };
}
export function AdminRecordDetails({ value, onChange, project = false, gallery = true }: { value: RecordDetails; onChange: (value: RecordDetails) => void; project?: boolean; gallery?: boolean }) {
  return <div className="space-y-4 border-t border-[#E8DED3] pt-4">
    {gallery && <div><label className={adminLabelClass}>Gallery images (one URL per line)</label><textarea rows={3} value={value.galleryImageUrls.join("\n")} onChange={e => onChange({ ...value, galleryImageUrls: e.target.value.split("\n") })} className={adminTextareaClass}/><p className="mt-1 text-xs text-[#746B64]">Upload images to the media library and paste their URLs here.</p></div>}
    {project && <div className="grid gap-4 sm:grid-cols-2"><AdminImageUploadField label="Before image (optional)" value={value.beforeImageUrl} onChange={url => onChange({ ...value, beforeImageUrl: url })}/><AdminImageUploadField label="After image (optional)" value={value.afterImageUrl} onChange={url => onChange({ ...value, afterImageUrl: url })}/><p className="text-xs text-[#746B64] sm:col-span-2">The comparison appears only when both images are supplied.</p></div>}
    {gallery && <div><label className={adminLabelClass}>Project / artwork video URL (optional)</label><input type="url" value={value.videoUrl} onChange={e => onChange({ ...value, videoUrl: e.target.value })} className={adminInputClass}/></div>}
    <div><label className={adminLabelClass}>Display order</label><input type="number" min={0} value={value.displayOrder} onChange={e => onChange({ ...value, displayOrder: Number(e.target.value) })} className={adminInputClass}/></div>
    <div className="grid gap-4 sm:grid-cols-2"><div><label className={adminLabelClass}>SEO title</label><input maxLength={160} value={value.seoTitle} onChange={e => onChange({ ...value, seoTitle: e.target.value })} className={adminInputClass}/></div><div><label className={adminLabelClass}>SEO description</label><textarea maxLength={320} rows={2} value={value.seoDescription} onChange={e => onChange({ ...value, seoDescription: e.target.value })} className={adminTextareaClass}/></div></div>
  </div>;
}
