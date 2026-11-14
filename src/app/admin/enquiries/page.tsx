"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AdminAuthBanner } from "@/components/admin/AdminChromeClient";
import {
  adminButtonClass,
  adminCardClass,
  AdminConfirmModal,
  adminInputClass,
  AdminPageHeader,
  adminSelectClass,
  AdminStatusBadge,
} from "@/components/admin/AdminUiPrimitives";
import { StoredEnquiryRecord } from "@/lib/enquiries-store";
import { EnquiryStatus } from "@/types/models";
import {
  Inbox,
  Mail,
  MessageCircle,
  Phone,
  Search,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";

const PIPELINE_STATUSES: Array<"All" | EnquiryStatus> = [
  "All",
  "New",
  "Contacted",
  "In Progress",
  "Closed",
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<StoredEnquiryRecord[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"All" | EnquiryStatus>("All");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [pendingDelete, setPendingDelete] =
    useState<StoredEnquiryRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadAll = useCallback(() => {
    Promise.all([
      fetch("/api/enquiries", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/admin/auth", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([enqData, authData]) => {
        if (enqData?.ok && Array.isArray(enqData.enquiries)) {
          setEnquiries(enqData.enquiries);
        }
        setAuthenticated(Boolean(authData?.authenticated));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enquiries.filter((item) => {
      const normalizedStatus = item.status === "new" ? "New" : item.status;
      if (statusFilter !== "All" && normalizedStatus !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return (
        item.fullName.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        (item.referenceCode || "").toLowerCase().includes(q) ||
        (item.serviceOrDesignInterest || "").toLowerCase().includes(q)
      );
    });
  }, [enquiries, statusFilter, search]);

  const handleStatusChange = async (id: string, status: EnquiryStatus) => {
    const res = await fetch("/api/enquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) await loadAll();
  };

  const handleAddNote = async (id: string) => {
    const note = (noteDrafts[id] || "").trim();
    if (!note) return;
    const res = await fetch("/api/enquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, note }),
    });
    if (res.ok) {
      setNoteDrafts((prev) => ({ ...prev, [id]: "" }));
      await loadAll();
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/enquiries?id=${encodeURIComponent(pendingDelete.id)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setPendingDelete(null);
        await loadAll();
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminAuthBanner authenticated={authenticated} />

      <AdminPageHeader
        eyebrow="Customer Lead CRM"
        title={`Enquiry Inbox (${enquiries.length})`}
        description="Track client leads from Contact, Explore Designs, and the Wall Visualizer with status updates and internal follow-up notes."
      />

      {/* Filter & Search Bar */}
      <section className={`${adminCardClass} p-4 sm:p-5 space-y-4`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#746B64]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, email, phone, or code…"
              className={`${adminInputClass} pl-10 h-10`}
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {PIPELINE_STATUSES.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-full border font-sans text-xs font-medium cursor-pointer transition-colors ${
                  statusFilter === st
                    ? "border-[#9B1C1C] bg-[#9B1C1C] text-[#FFFDF9]"
                    : "border-[#DFD0C0] bg-[#FAF6F0] text-[#574F49] hover:border-[#9B1C1C]/45"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <div className={`${adminCardClass} p-12 text-center font-sans text-sm text-[#746B64]`}>
          Loading studio enquiries…
        </div>
      ) : filtered.length === 0 ? (
        <div className={`${adminCardClass} p-12 text-center`}>
          <Inbox className="w-8 h-8 text-[#746B64]/50 mx-auto" />
          <p className="mt-3 font-serif text-2xl text-[#1A1A1A]">
            No matching enquiries
          </p>
          <p className="mt-1 font-sans text-xs text-[#746B64]">
            Submissions from the Contact and Wall Visualizer pages appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Wide Desktop Crisp Table Overview */}
          <div className={`${adminCardClass} hidden xl:block overflow-x-auto`}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E8DED3] bg-[#FAF6F0]/75 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#746B64]">
                  <th className="py-3.5 px-5">Customer</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Interest</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DED3]">
                {filtered.map((item) => {
                  const phoneDigits = item.phone.replace(/\D/g, "");
                  const waHref = phoneDigits
                    ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(
                        `Hello ${item.fullName}, thank you for contacting ATELIER — WALL STORY (${item.referenceCode}).`
                      )}`
                    : null;
                  const normalizedStatus =
                    item.status === "new" ? "New" : item.status;
                  const isExpanded = expandedId === item.id;

                  return (
                    <React.Fragment key={item.id}>
                      <tr className="hover:bg-[#FAF6F0]/60 transition-colors">
                        <td className="py-4 px-5 align-top">
                          <p className="font-serif text-lg font-normal text-[#1A1A1A]">
                            {item.fullName}
                          </p>
                          <p className="mt-0.5 font-mono text-[11px] text-[#746B64]">
                            {item.referenceCode || item.id} • {item.sourcePage}
                          </p>
                        </td>

                        <td className="py-4 px-4 align-top font-sans text-xs text-[#574F49] space-y-1">
                          <a
                            href={`mailto:${item.email}`}
                            className="flex items-center gap-1.5 hover:text-[#9B1C1C]"
                          >
                            <Mail className="w-3.5 h-3.5 text-[#9B1C1C] shrink-0" />
                            <span>{item.email}</span>
                          </a>
                          <a
                            href={`tel:${item.phone}`}
                            className="flex items-center gap-1.5 hover:text-[#9B1C1C] admin-tabular"
                          >
                            <Phone className="w-3.5 h-3.5 text-[#9B1C1C] shrink-0" />
                            <span>{item.phone}</span>
                          </a>
                        </td>

                        <td className="py-4 px-4 align-top font-sans text-xs text-[#574F49] max-w-[220px]">
                          <p className="line-clamp-2">
                            {item.serviceOrDesignInterest ||
                              item.serviceInterest ||
                              "General Enquiry"}
                          </p>
                          {item.selectedDesignReference ? (
                            <p className="mt-0.5 text-[11px] text-[#9B1C1C]">
                              Ref: {item.selectedDesignReference}
                            </p>
                          ) : null}
                        </td>

                        <td className="py-4 px-4 align-top font-sans text-xs text-[#746B64] whitespace-nowrap admin-tabular">
                          {formatDate(item.createdAt)}
                        </td>

                        <td className="py-4 px-4 align-top">
                          <select
                            aria-label={`Status for ${item.fullName}`}
                            disabled={!authenticated}
                            value={normalizedStatus}
                            onChange={(e) =>
                              handleStatusChange(
                                item.id,
                                e.target.value as EnquiryStatus
                              )
                            }
                            className={`${adminSelectClass} h-9 w-36 min-w-[144px] text-xs bg-[#FFFDF9] disabled:opacity-65`}
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </td>

                        <td className="py-4 px-5 align-top text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {waHref ? (
                              <a
                                href={waHref}
                                target="_blank"
                                rel="noreferrer"
                                title="WhatsApp Reply"
                                className={adminButtonClass("secondary", "sm")}
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-[#9B1C1C]" />
                                <span>WhatsApp</span>
                              </a>
                            ) : null}
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedId(isExpanded ? null : item.id)
                              }
                              className={adminButtonClass("secondary", "sm")}
                            >
                              {isExpanded ? "Hide Brief" : "View Brief"}
                            </button>
                            <button
                              type="button"
                              disabled={!authenticated}
                              onClick={() => setPendingDelete(item)}
                              aria-label={`Delete enquiry from ${item.fullName}`}
                              className="p-2 rounded-xl border border-[#DFD0C0] bg-[#FFFDF9] text-[#9B1C1C] hover:bg-[#9B1C1C] hover:text-[#FFFDF9] cursor-pointer disabled:opacity-40 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isExpanded ? (
                        <tr className="bg-[#FAF6F0]/75">
                          <td colSpan={6} className="p-5">
                            <div className="space-y-3">
                              <div className="rounded-xl border border-[#E8DED3] bg-[#FFFDF9] p-4">
                                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#746B64]">
                                  Customer Message
                                </p>
                                <p className="mt-1.5 font-sans text-sm leading-relaxed text-[#1A1A1A]">
                                  {item.message}
                                </p>
                              </div>

                              {item.adminNotes && item.adminNotes.length > 0 ? (
                                <div className="space-y-1.5">
                                  {item.adminNotes.map((n, idx) => (
                                    <div
                                      key={`${item.id}-note-${idx}`}
                                      className="rounded-xl border border-[#E8DED3] bg-[#FFFDF9] px-3.5 py-2 font-sans text-xs text-[#574F49]"
                                    >
                                      <span className="font-medium text-[#9B1C1C]">
                                        {n.authorName} •{" "}
                                        {formatDate(n.createdAt)}:
                                      </span>{" "}
                                      {n.note}
                                    </div>
                                  ))}
                                </div>
                              ) : null}

                              {authenticated ? (
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={noteDrafts[item.id] || ""}
                                    onChange={(e) =>
                                      setNoteDrafts((prev) => ({
                                        ...prev,
                                        [item.id]: e.target.value,
                                      }))
                                    }
                                    placeholder="Add internal studio follow-up note…"
                                    className={`${adminInputClass} bg-[#FFFDF9] h-10`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleAddNote(item.id)}
                                    className={adminButtonClass("primary", "sm")}
                                  >
                                    <Send className="h-3.5 w-3.5" />
                                    <span>Save Note</span>
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Stacked Enquiry Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:hidden">
            {filtered.map((item) => {
              const phoneDigits = item.phone.replace(/\D/g, "");
              const waHref = phoneDigits
                ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(
                    `Hello ${item.fullName}, thank you for reaching out to ATELIER — WALL STORY (${item.referenceCode}).`
                  )}`
                : null;
              const normalizedStatus =
                item.status === "new" ? "New" : item.status;

              return (
                <div
                  key={item.id}
                  className={`${adminCardClass} p-5 space-y-3.5`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[11px] font-semibold text-[#9B1C1C]">
                        {item.referenceCode || item.id}
                      </span>
                      <h2 className="font-serif text-2xl font-normal text-[#1A1A1A]">
                        {item.fullName}
                      </h2>
                    </div>
                    <AdminStatusBadge tone={normalizedStatus}>
                      {normalizedStatus}
                    </AdminStatusBadge>
                  </div>

                  <div className="space-y-1.5 font-sans text-xs text-[#574F49]">
                    <a
                      href={`mailto:${item.email}`}
                      className="flex items-center gap-1.5"
                    >
                      <Mail className="h-3.5 w-3.5 text-[#9B1C1C]" />
                      {item.email}
                    </a>
                    <a
                      href={`tel:${item.phone}`}
                      className="flex items-center gap-1.5 admin-tabular"
                    >
                      <Phone className="h-3.5 w-3.5 text-[#9B1C1C]" />
                      {item.phone}
                    </a>
                    {item.serviceOrDesignInterest ? (
                      <p className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-[#9B1C1C]" />
                        {item.serviceOrDesignInterest}
                      </p>
                    ) : null}
                  </div>

                  <p className="rounded-xl border border-[#E8DED3] bg-[#FAF6F0] p-3 font-sans text-xs leading-relaxed text-[#1A1A1A]">
                    {item.message}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E8DED3]">
                    <select
                      aria-label={`Status for ${item.fullName}`}
                      disabled={!authenticated}
                      value={normalizedStatus}
                      onChange={(e) =>
                        handleStatusChange(
                          item.id,
                          e.target.value as EnquiryStatus
                        )
                      }
                      className={`${adminSelectClass} h-9 w-36 text-xs`}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed">Closed</option>
                    </select>

                    <div className="flex items-center gap-2">
                      {waHref ? (
                        <a
                          href={waHref}
                          target="_blank"
                          rel="noreferrer"
                          className={adminButtonClass("secondary", "sm")}
                        >
                          <MessageCircle className="h-3.5 w-3.5 text-[#9B1C1C]" />
                          <span>WhatsApp</span>
                        </a>
                      ) : null}
                      <button
                        type="button"
                        disabled={!authenticated}
                        onClick={() => setPendingDelete(item)}
                        aria-label={`Delete ${item.fullName}`}
                        className="p-2 rounded-xl border border-[#DFD0C0] text-[#9B1C1C] cursor-pointer disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AdminConfirmModal
        open={Boolean(pendingDelete)}
        title="Delete Enquiry"
        description={
          pendingDelete
            ? `Are you sure you want to delete enquiry ${pendingDelete.referenceCode} from ${pendingDelete.fullName}?`
            : ""
        }
        confirmLabel="Delete Enquiry"
        busy={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
