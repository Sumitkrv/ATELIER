"use client";

import React, { useEffect, useState } from "react";
import { AdminModuleShell } from "@/components/admin/AdminModuleShell";
import { StoredEnquiryRecord } from "@/lib/enquiries-store";
import { Clock, Inbox, Mail, Phone, Sparkles } from "lucide-react";

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<StoredEnquiryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [storageMode, setStorageMode] = useState<string>(
    "local_persistent_collection"
  );

  useEffect(() => {
    let active = true;
    fetch("/api/enquiries")
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data?.ok && Array.isArray(data.enquiries)) {
          setEnquiries(data.enquiries);
        }
        if (data?.storageMode) {
          setStorageMode(data.storageMode);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <AdminModuleShell
        moduleCode="MODULE 07"
        moduleTitle="Customer Enquiry & Lead CRM"
        mongoCollection="enquiries"
        summary="Manage customer enquiries submitted from /contact, /explore-designs, /projects, and the Wall Visualizer. Operational database & email gate diagnostics are surfaced here in the Admin CMS rather than on public customer pages."
        capabilities={[
          {
            title: "Lead Status Pipeline & Filtering",
            description:
              "Filter leads by status (`New`, `Contacted`, `In Progress`, `Closed`), date range, or selected design/service interest.",
            schemaFields: [
              "referenceCode",
              "status ('New' | 'Contacted' | 'In Progress' | 'Closed')",
              "fullName",
              "email",
              "phone",
              "serviceOrDesignInterest",
            ],
          },
          {
            title: "Design Attribution, Notes & Email Gate Diagnostics",
            description:
              "View which design or project generated the enquiry, append timestamped admin notes, and audit email notification readiness.",
            schemaFields: [
              "selectedDesignSlug",
              "selectedDesignTitle",
              "selectedProjectSlug",
              "sourcePage",
              "adminNotes[]",
              "emailNotificationSent",
              "createdAt",
            ],
          },
        ]}
      />

      {/* Live Persisted Enquiries Inbox Table */}
      <div className="rounded-sm border border-white/10 bg-obsidian-900 p-6 sm:p-8 text-brand-offwhite">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <Inbox className="h-5 w-5 text-brand-crimson" />
            <h2 className="font-serif text-2xl font-light">
              Received Customer Enquiries ({enquiries.length})
            </h2>
          </div>
          <span className="rounded-sm border border-white/15 bg-white/5 px-3 py-1 font-mono text-[11px] text-brand-beige/80">
            Storage Engine: {storageMode}
          </span>
        </div>

        {loading ? (
          <p className="py-8 text-sm text-brand-beige/70">
            Loading enquiries from server store…
          </p>
        ) : enquiries.length === 0 ? (
          <p className="py-8 text-sm text-brand-beige/70">
            No customer enquiries recorded yet. Submit a brief on{" "}
            <code className="font-mono text-brand-offwhite">/contact</code> to
            verify real-time persistence.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {enquiries.map((item) => (
              <div
                key={item.id}
                className="rounded-sm border border-white/10 bg-brand-charcoal p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="rounded-sm bg-brand-crimson px-2.5 py-0.5 font-mono text-[11px] font-medium text-brand-offwhite">
                      {item.referenceCode || item.id}
                    </span>
                    <span className="font-serif text-xl text-brand-offwhite">
                      {item.fullName}
                    </span>
                    <span className="rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] uppercase text-emerald-300">
                      {item.status}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs text-brand-beige/65">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-4 text-xs text-brand-beige/85">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-brand-crimson" />
                    {item.email}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-brand-crimson" />
                    {item.phone}
                  </span>
                  {item.serviceOrDesignInterest && (
                    <span className="inline-flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-brand-crimson" />
                      {item.serviceOrDesignInterest}
                    </span>
                  )}
                </div>

                {item.selectedDesignReference && (
                  <p className="mt-2 font-mono text-xs text-amber-200/90">
                    Reference: {item.selectedDesignReference}
                  </p>
                )}

                <p className="mt-3 rounded-sm border border-white/10 bg-black/25 p-3 text-xs leading-relaxed text-brand-offwhite/90">
                  {item.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
