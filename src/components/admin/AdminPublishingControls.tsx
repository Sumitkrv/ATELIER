"use client";
import { useEffect, useState } from "react";
import { adminButtonClass, adminInputClass } from "./AdminUiPrimitives";

interface Version { id: string; createdAt: string; actor?: string; action?: string; }
export function AdminPublishingControls({ collection, id, route, onChange }: {
  collection: string; id: string; route?: string; onChange: () => unknown;
}) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [publishAt, setPublishAt] = useState("");
  const [versions, setVersions] = useState<Version[] | null>(null);
  async function action(name: string, versionId?: string) {
    if (name === "restore" && !window.confirm("Restore this revision as a draft? Publish it when ready.")) return;
    setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/admin/cms", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ collection, id, action: name, ...(name === "schedule" && publishAt ? { publishAt: new Date(publishAt).toISOString() } : {}), versionId }) });
      const json = await response.json(); if (!response.ok || !json.ok) throw new Error(json.error || "Could not update publication.");
      setNotice(name === "schedule" ? "Publication scheduled." : name === "restore" ? "Revision restored as a draft." : "Publication updated.");
      await onChange();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Publication failed."); }
    finally { setBusy(false); }
  }
  async function history() {
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/cms?collection=versions&targetCollection=${encodeURIComponent(collection)}&id=${encodeURIComponent(id)}`, { cache: "no-store" });
      const json = await response.json(); if (!response.ok || !json.ok) throw new Error(json.error || "Could not load revisions.");
      setVersions(json.versions || []);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not load revisions."); } finally { setBusy(false); }
  }
  if (!id) return <p className="text-xs text-[#746B64]">Save this item as a draft to preview, schedule, or publish it.</p>;
  return <div className="space-y-3 rounded-2xl border border-[#DFD0C0] bg-[#FAF6F0] p-4">
    <p className="text-xs font-semibold uppercase tracking-wider text-[#9B1C1C]">Publishing</p>
    <p className="text-xs text-[#746B64]">Save your changes before using these controls. Publishing makes the saved draft visible to visitors.</p>
    <div className="flex flex-wrap gap-2">
      {route && <a href={`/api/admin/preview?path=${encodeURIComponent(route)}`} target="_blank" rel="noreferrer" className={adminButtonClass("secondary", "sm")}>Preview saved draft</a>}
      <button type="button" disabled={busy} onClick={() => void action("publish")} className={adminButtonClass("primary", "sm")}>Publish saved draft</button>
      <button type="button" disabled={busy} onClick={() => void action("unpublish")} className={adminButtonClass("secondary", "sm")}>Unpublish</button>
      <button type="button" disabled={busy} onClick={() => void action("archive")} className={adminButtonClass("secondary", "sm")}>Archive</button>
      <button type="button" disabled={busy} onClick={() => void history()} className={adminButtonClass("secondary", "sm")}>Version history</button>
    </div>
    <div className="flex flex-wrap gap-2"><label className="flex-1 text-xs text-[#746B64]">Schedule in your local time<input type="datetime-local" aria-label="Publication date and time" value={publishAt} onChange={e => setPublishAt(e.target.value)} className={adminInputClass}/></label><button type="button" disabled={busy || !publishAt} onClick={() => void action("schedule")} className={adminButtonClass("secondary", "sm")}>Schedule saved draft</button></div>
    {notice && <p role="status" className="text-xs">{notice}</p>}
    {versions && <div className="max-h-48 space-y-2 overflow-y-auto">{!versions.length ? <p className="text-xs">No previous revisions.</p> : versions.map(version => <div key={version.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-[#DFD0C0] pt-2 text-xs"><span>{new Date(version.createdAt).toLocaleString()} · {version.action || "Saved"}</span><button type="button" disabled={busy} onClick={() => void action("restore", version.id)} className={adminButtonClass("secondary", "sm")}>Restore as draft</button></div>)}</div>}
  </div>;
}

export function AdminUnsavedChanges({ dirty }: { dirty: boolean }) {
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  return dirty ? <p role="status" className="text-xs text-[#9B1C1C]">Unsaved changes</p> : null;
}
