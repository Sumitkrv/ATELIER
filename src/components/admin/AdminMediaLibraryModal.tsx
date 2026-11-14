"use client";
/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, Search, Upload, X } from "lucide-react";
import { adminButtonClass, adminInputClass } from "./AdminUiPrimitives";

interface Asset {
  id: string; secureUrl: string; originalFilename: string; altText: string;
  resourceType: "image" | "video"; format: string; bytes: number; width: number; height: number;
  references: { id: string; published: boolean }[];
}
export function AdminMediaLibraryModal({ open, onClose, onSelect, title = "Media Library" }: {
  open: boolean; onClose: () => void; onSelect?: (url: string) => void; title?: string;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [unused, setUnused] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Asset | null>(null);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/admin/media?page=${page}&type=${type}&q=${encodeURIComponent(search)}`, { cache: "no-store" });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.error || "Media could not be loaded.");
      setAssets(json.assets); setTotal(json.total);
    } catch (e) { setError(e instanceof Error ? e.message : "Media could not be loaded."); }
    finally { setLoading(false); }
  }, [page, type, search]);
  useEffect(() => { if (!open) return; const timer = setTimeout(() => void load(), 250); return () => clearTimeout(timer); }, [open, load]);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const controls = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select,a[href],[tabindex="0"]');
        const first = controls?.[0], last = controls?.[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); previous?.focus(); };
  }, [open, onClose]);
  async function upload(file: File) {
    setBusy(true); setError(""); setNotice("");
    try {
      const form = new FormData(); form.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body: form });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.error || "Upload failed.");
      setNotice("Media uploaded and saved."); await load();
      if (onSelect) { onSelect(json.media.secureUrl); onClose(); }
    } catch (e) { setError(e instanceof Error ? e.message : "Upload failed."); }
    finally { setBusy(false); }
  }
  async function saveAlt() {
    if (!editing) return; setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/media", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing.id, altText: editing.altText }) });
      const json = await response.json(); if (!response.ok || !json.ok) throw new Error(json.error || "Update failed.");
      setEditing(null); setNotice("Alt text saved."); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Update failed."); } finally { setBusy(false); }
  }
  async function remove(asset: Asset) {
    if (!window.confirm(`Delete ${asset.originalFilename}? This removes it from cloud storage permanently.`)) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/admin/media?id=${encodeURIComponent(asset.id)}`, { method: "DELETE" });
      const json = await response.json(); if (!response.ok || !json.ok) throw new Error(json.error || "Delete failed.");
      setNotice("Unused media deleted."); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Delete failed."); } finally { setBusy(false); }
  }
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 backdrop-blur-sm sm:p-6">
    <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="media-library-title" className="flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-[#DFD0C0] bg-[#FAF6F0] shadow-2xl">
      <div className="flex items-center justify-between gap-3 border-b border-[#E8DED3] p-5"><h2 id="media-library-title" className="font-serif text-2xl">{title}</h2><button type="button" onClick={onClose} aria-label="Close media library" className={adminButtonClass("secondary", "sm")}><X size={18}/></button></div>
      <div className="space-y-3 border-b border-[#E8DED3] p-4">
        <div className="flex flex-wrap items-center gap-3"><label className="relative min-w-40 flex-1"><Search className="absolute top-3 left-3" size={16}/><span className="sr-only">Search media</span><input className={`${adminInputClass} pl-9`} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search media..."/></label>
        <select aria-label="Media type" className={adminInputClass + " w-auto"} value={type} onChange={e => { setType(e.target.value); setPage(1); }}><option value="">All media</option><option value="image">Images</option><option value="video">Videos</option></select>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm" hidden onChange={e => { const file = e.target.files?.[0]; if (file) void upload(file); e.target.value = ""; }}/><button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className={adminButtonClass("primary", "sm")}><Upload size={16}/>{busy ? "Working…" : "Upload"}</button></div>
        <div className="flex flex-wrap justify-between gap-2 text-xs text-[#746B64]"><label><input type="checkbox" checked={unused} onChange={e => setUnused(e.target.checked)}/> Show unused on this page</label><span>JPG, PNG, WebP, AVIF, MP4 or WebM · up to 4 MB</span></div>
        {error && <p role="alert" className="text-sm text-[#9B1C1C]">{error}</p>}{notice && <p role="status" className="text-sm text-[#264E32]">{notice}</p>}
        {editing && <div className="flex flex-wrap gap-2"><input aria-label="Image alt text" value={editing.altText} maxLength={500} onChange={e => setEditing({ ...editing, altText: e.target.value })} className={`${adminInputClass} flex-1`}/><button type="button" disabled={busy} onClick={() => void saveAlt()} className={adminButtonClass("primary", "sm")}>Save alt text</button><button type="button" onClick={() => setEditing(null)} className={adminButtonClass("secondary", "sm")}>Cancel</button></div>}
      </div>
      <div className="overflow-y-auto p-4">{loading ? <p role="status" className="p-10 text-center">Loading media…</p> : !assets.length ? <p className="p-10 text-center">No uploaded media yet. Upload an image or video to get started.</p> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{assets.filter(asset => !unused || !asset.references.length).map(asset => <article key={asset.id} className="overflow-hidden rounded-2xl border border-[#DFD0C0] bg-[#FFFDF9]">
        {asset.resourceType === "video" ? <video src={asset.secureUrl} controls preload="metadata" className="aspect-video w-full bg-black object-contain"/> : <a href={asset.secureUrl} target="_blank" rel="noreferrer"><img src={asset.secureUrl} alt={asset.altText} loading="lazy" className="aspect-video w-full object-cover"/></a>}
        <div className="space-y-3 p-3"><p className="truncate text-sm font-medium">{asset.originalFilename}</p><p className="text-xs text-[#746B64]">{asset.width} × {asset.height} · {(asset.bytes/1024).toFixed(0)} KB · {asset.format}<br/>{asset.references.length ? `Used in ${asset.references.length} saved items` : "Unused"}</p>
        <div className="flex flex-wrap gap-2">{onSelect && <button type="button" onClick={() => { onSelect(asset.secureUrl); onClose(); }} className={adminButtonClass("primary", "sm")}>Use media</button>}<button type="button" onClick={async () => { try { await navigator.clipboard.writeText(asset.secureUrl); setNotice("URL copied."); } catch { setError("Could not copy the URL. Open the asset to copy its address."); } }} className={adminButtonClass("secondary", "sm")}><Copy size={13}/>URL</button><button type="button" onClick={() => setEditing(asset)} className={adminButtonClass("secondary", "sm")}>Alt text</button><button type="button" disabled={busy || !!asset.references.length} onClick={() => void remove(asset)} className={adminButtonClass("secondary", "sm")}>Delete</button></div></div>
      </article>)}</div>}</div>
      <div className="flex items-center justify-between border-t border-[#E8DED3] p-4 text-sm"><button type="button" disabled={page <= 1} onClick={() => setPage(page-1)} className={adminButtonClass("secondary", "sm")}>Previous</button><span>{total} assets · Page {page}</span><button type="button" disabled={page*60 >= total} onClick={() => setPage(page+1)} className={adminButtonClass("secondary", "sm")}>Next</button></div>
    </div>
  </div>;
}
