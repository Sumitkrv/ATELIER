"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AdminAuthBanner } from "@/components/admin/AdminChromeClient";
import { adminButtonClass, adminCardClass, AdminConfirmModal, adminInputClass, adminLabelClass, AdminPageHeader, adminSelectClass, AdminStatusBadge } from "@/components/admin/AdminUiPrimitives";
import type { StoredEnquiryRecord } from "@/lib/enquiries-store";
import { Download, Inbox, Mail, MessageCircle, Phone, RefreshCw, Search, Send, Trash2 } from "lucide-react";

const STATUSES = ["New", "Contacted", "Follow-up", "Qualified", "Converted", "Closed", "In Progress"];
type Metrics = { statuses: { _id: string; count: number }[]; sources: { _id: string; count: number }[]; overdue: number };
function formatDate(iso: string | null | undefined) {
  if (!iso) return "Not set";
  const value = new Date(iso);
  return Number.isNaN(value.getTime()) ? "Not set" : value.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}
function localDate(iso: string | null | undefined) {
  if (!iso) return "";
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) return "";
  return new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
function LeadCard({ item, nowMs, onUpdate, onDelete, initiallyExpanded }: { item: StoredEnquiryRecord; nowMs: number; onUpdate: (id: string, patch: Record<string, unknown>) => Promise<void>; onDelete: () => void; initiallyExpanded: boolean }) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const [note, setNote] = useState("");
  const [owner, setOwner] = useState(item.assignedOwner || "");
  const [followUp, setFollowUp] = useState(localDate(item.followUpAt));
  const [status, setStatus] = useState(item.status === "new" ? "New" : item.status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const overdue = Boolean(nowMs > 0 && item.followUpAt && new Date(item.followUpAt).getTime() < nowMs && !["Closed", "Converted"].includes(item.status));
  const digits = item.phone?.replace(/\D/g, "");
  const save = async (patch: Record<string, unknown>) => {
    setBusy(true); setError(null); setNotice(null);
    try { await onUpdate(item.id, patch); setNote(""); setNotice("Enquiry updated."); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to save. Please try again."); }
    finally { setBusy(false); }
  };
  return <article className={`${adminCardClass} overflow-hidden`}>
    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-2">
        <p className="font-mono text-[11px] text-[#9B1C1C]">{item.referenceCode || item.id} · {formatDate(item.createdAt)}</p>
        <h2 className="font-serif text-2xl text-[#1A1A1A]">{item.fullName}</h2>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#574F49]">
          <a href={`mailto:${item.email}`} className="inline-flex items-center gap-1 break-all"><Mail className="h-3.5 w-3.5 shrink-0" />{item.email}</a>
          {item.phone && <a href={`tel:${item.phone}`} className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{item.phone}</a>}
        </div>
        <p className="text-xs text-[#746B64]">{item.serviceOrDesignInterest} · {item.sourcePage}</p>
        {(item.assignedOwner || item.followUpAt) && <p className={`text-xs ${overdue ? "font-semibold text-[#9B1C1C]" : "text-[#746B64]"}`}>{item.assignedOwner && `Owner: ${item.assignedOwner} · `}{item.followUpAt && `${overdue ? "Overdue follow-up" : "Follow-up"}: ${formatDate(item.followUpAt)}`}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <AdminStatusBadge tone={item.status === "new" ? "New" : item.status}>{item.status === "new" ? "New" : item.status}</AdminStatusBadge>
        <button type="button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)} className={adminButtonClass("secondary", "sm")}>{expanded ? "Close details" : "View enquiry"}</button>
        <button type="button" aria-label={`Delete enquiry from ${item.fullName}`} onClick={onDelete} className="rounded-xl border border-[#DFD0C0] p-2 text-[#9B1C1C]"><Trash2 className="h-4 w-4" /></button>
      </div>
    </div>
    {expanded && <div className="space-y-5 border-t border-[#E8DED3] bg-[#FAF6F0]/70 p-5">
      <div className="rounded-xl border border-[#E8DED3] bg-[#FFFDF9] p-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#746B64]">Customer message</p>
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[#1A1A1A]">{item.message}</p>
        {item.selectedDesignReference && <p className="mt-2 text-xs text-[#9B1C1C]">Design reference: {item.selectedDesignReference}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={`mailto:${item.email}`} className={adminButtonClass("secondary", "sm")}><Mail className="h-3.5 w-3.5" />Reply by email</a>
          {digits && <a href={`https://wa.me/${digits}?text=${encodeURIComponent(`Hello ${item.fullName}, thank you for contacting ATELIER (${item.referenceCode}).`)}`} target="_blank" rel="noreferrer" className={adminButtonClass("secondary", "sm")}><MessageCircle className="h-3.5 w-3.5" />WhatsApp</a>}
        </div>
      </div>
      <form onSubmit={e => { e.preventDefault(); void save({ status, assignedOwner: owner.trim() || null, followUpAt: followUp ? new Date(followUp).toISOString() : null }); }} className="space-y-3">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className={adminLabelClass}>Lead status<select value={status} onChange={e => setStatus(e.target.value as typeof status)} className={`${adminSelectClass} mt-1.5`}>{STATUSES.map(value => <option key={value}>{value}</option>)}</select></label>
          <label className={adminLabelClass}>Assigned owner<input maxLength={120} value={owner} onChange={e => setOwner(e.target.value)} placeholder="Team member name" className={`${adminInputClass} mt-1.5`} /></label>
          <label className={adminLabelClass}>Follow-up date and time<input type="datetime-local" value={followUp} onChange={e => setFollowUp(e.target.value)} className={`${adminInputClass} mt-1.5`} /></label>
        </div>
        <button disabled={busy} className={adminButtonClass("primary", "sm")}>{busy ? "Saving…" : "Save lead details"}</button>
      </form>
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[#746B64]">Internal notes</h3>
        {(item.adminNotes || []).map((entry, index) => <div key={index} className="rounded-xl border border-[#E8DED3] bg-[#FFFDF9] p-3 text-xs text-[#574F49]"><p className="mb-1 font-medium text-[#9B1C1C]">{entry.authorName} · {formatDate(entry.createdAt)}</p><p className="whitespace-pre-wrap break-words">{entry.note}</p></div>)}
        <form onSubmit={e => { e.preventDefault(); if (note.trim()) void save({ note: note.trim() }); }} className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className={`${adminLabelClass} flex-1`}>Add a private note<textarea maxLength={3000} value={note} onChange={e => setNote(e.target.value)} rows={2} className={`${adminInputClass} mt-1.5 h-auto py-3`} /></label>
          <button disabled={busy || !note.trim()} className={adminButtonClass("primary", "sm")}><Send className="h-3.5 w-3.5" />Save note</button>
        </form>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E8DED3] pt-3 text-xs text-[#746B64]">
        <p>Notification: {item.emailStatus || (item.emailNotificationSent ? "sent" : "pending")} · Last updated {formatDate(item.updatedAt)}{item.emailLastError ? ` · ${item.emailLastError}` : ""}</p>
        {item.emailStatus === "failed" && <button type="button" disabled={busy || (item.emailAttempts || 0) >= 5 || Boolean(item.emailProviderId)} onClick={() => void save({ retryEmail: true })} className={adminButtonClass("secondary", "sm")}><RefreshCw className="h-3.5 w-3.5" />Retry notification</button>}
      </div>
      {error && <p role="alert" className="text-sm text-[#9B1C1C]">{error}</p>}
      {notice && <p role="status" className="text-sm text-[#264E32]">{notice}</p>}
    </div>}
  </article>;
}
export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<StoredEnquiryRecord[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [querySearch, setQuerySearch] = useState("");
  const [status, setStatus] = useState("All");
  const [source, setSource] = useState("");
  const [overdue, setOverdue] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [metrics, setMetrics] = useState<Metrics>({ statuses: [], sources: [], overdue: 0 });
  const [pendingDelete, setPendingDelete] = useState<StoredEnquiryRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [nowMs, setNowMs] = useState(0);
  const params = new URLSearchParams({ search: querySearch, status, source, overdue: String(overdue), page: String(page) });
  const query = params.toString();
  useEffect(() => { const timer = setTimeout(() => { setQuerySearch(search); setPage(1); }, 300); return () => clearTimeout(timer); }, [search]);
  const load = useCallback(async () => {
    await Promise.resolve();
    setLoading(true); setError(null);
    try {
      const response = await fetch(`/api/admin/enquiries?${query}`, { cache: "no-store" });
      const data = await response.json();
      setNowMs(Date.now());
      if (typeof window !== "undefined") setSelectedId(new URLSearchParams(window.location.search).get("enquiry") || "");
      setAuthenticated(response.status !== 401 && response.status !== 403);
      if (!response.ok || !data.ok) throw new Error(data.error || "Unable to load enquiries.");
      setEnquiries(data.enquiries); setTotal(data.total); setPages(data.pages); setMetrics(data.metrics);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to load enquiries."); }
    finally { setLoading(false); }
  }, [query]);
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/enquiries?${query}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (cancelled) return;
        setNowMs(Date.now());
        if (typeof window !== "undefined") setSelectedId(new URLSearchParams(window.location.search).get("enquiry") || "");
        setAuthenticated(response.status !== 401 && response.status !== 403);
        if (!response.ok || !data.ok) throw new Error(data.error || "Unable to load enquiries.");
        setEnquiries(data.enquiries); setTotal(data.total); setPages(data.pages); setMetrics(data.metrics); setError(null);
      })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load enquiries."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [query]);
  const update = async (id: string, patch: Record<string, unknown>) => {
    const response = await fetch("/api/admin/enquiries", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...patch }) });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || "Unable to save enquiry.");
    setEnquiries(items => items.map(item => item.id === id ? data.enquiry : item));
  };
  const remove = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/enquiries?id=${encodeURIComponent(pendingDelete.id)}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Unable to delete enquiry.");
      setPendingDelete(null); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to delete enquiry."); setPendingDelete(null); }
    finally { setDeleting(false); }
  };
  const newCount = metrics.statuses.filter(item => ["New", "new"].includes(item._id)).reduce((sum, item) => sum + item.count, 0);
  const converted = metrics.statuses.find(item => item._id === "Converted")?.count || 0;
  return <div className="space-y-6">
    <AdminAuthBanner authenticated={authenticated} />
    <AdminPageHeader eyebrow="Customer enquiries" title="Enquiry Inbox" description="Review project briefs, assign a team member, and keep every follow-up on track." />
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Matching enquiries", total], ["New leads", newCount], ["Overdue follow-ups", metrics.overdue], ["Converted", converted]].map(([label, value]) => <div key={label} className={`${adminCardClass} p-4`}><p className="text-xs text-[#746B64]">{label}</p><p className="mt-2 font-serif text-3xl text-[#1A1A1A]">{value}</p></div>)}</div>
    <section className={`${adminCardClass} space-y-4 p-4 sm:p-5`}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1"><span className="sr-only">Search enquiries</span><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#746B64]" /><input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, phone, or reference" className={`${adminInputClass} pl-10`} /></label>
        <a href={`/api/admin/enquiries?${query}&format=csv`} className={adminButtonClass("secondary", "sm")}><Download className="h-4 w-4" />Export matching leads</a>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <label className={adminLabelClass}>Status<select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className={`${adminSelectClass} mt-1.5 w-auto`}><option>All</option>{STATUSES.map(value => <option key={value}>{value}</option>)}</select></label>
        <label className={adminLabelClass}>Source page<select value={source} onChange={e => { setSource(e.target.value); setPage(1); }} className={`${adminSelectClass} mt-1.5 w-auto`}><option value="">All pages</option>{metrics.sources.map(value => <option key={value._id} value={value._id}>{value._id} ({value.count})</option>)}</select></label>
        <label className="flex min-h-10 items-center gap-2 text-xs text-[#574F49]"><input type="checkbox" checked={overdue} onChange={e => { setOverdue(e.target.checked); setPage(1); }} />Overdue follow-ups only</label>
        <button type="button" onClick={() => void load()} className={adminButtonClass("secondary", "sm")}><RefreshCw className="h-3.5 w-3.5" />Refresh</button>
      </div>
    </section>
    {error && <p role="alert" className="rounded-xl border border-[#9B1C1C]/30 p-4 text-sm text-[#9B1C1C]">{error}</p>}
    {loading ? <p role="status" className={`${adminCardClass} p-10 text-center text-sm text-[#746B64]`}>Loading enquiries…</p> : !error && enquiries.length === 0 ? <div className={`${adminCardClass} p-12 text-center`}><Inbox className="mx-auto h-8 w-8 text-[#746B64]" /><p className="mt-3 font-serif text-2xl">No matching enquiries</p><p className="mt-2 text-xs text-[#746B64]">Customer submissions will appear here. Try changing the filters.</p></div> : <div className="space-y-4">{enquiries.map(item => <LeadCard key={item.id} item={item} nowMs={nowMs} onUpdate={update} onDelete={() => setPendingDelete(item)} initiallyExpanded={selectedId === item.id} />)}</div>}
    <div className="flex items-center justify-between gap-3 text-xs text-[#746B64]"><p>Page {page} of {pages} · {total} matching enquiries</p><div className="flex gap-2"><button disabled={loading || page <= 1} onClick={() => setPage(value => value - 1)} className={adminButtonClass("secondary", "sm")}>Previous</button><button disabled={loading || page >= pages} onClick={() => setPage(value => value + 1)} className={adminButtonClass("secondary", "sm")}>Next</button></div></div>
    <AdminConfirmModal open={Boolean(pendingDelete)} title="Delete enquiry" description={pendingDelete ? `Permanently delete ${pendingDelete.referenceCode} from ${pendingDelete.fullName}, including its private notes?` : ""} confirmLabel="Delete enquiry" busy={deleting} onCancel={() => setPendingDelete(null)} onConfirm={remove} />
  </div>;
}
