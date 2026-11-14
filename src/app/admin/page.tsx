"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminAuthBanner } from "@/components/admin/AdminChromeClient";
import {
  adminButtonClass,
  adminCardClass,
  AdminStatusBadge,
} from "@/components/admin/AdminUiPrimitives";
import { StoredEnquiryRecord } from "@/lib/enquiries-store";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Building2,
  ExternalLink,
  FileText,
  FolderKanban,
  MessageSquare,
  Palette,
  Settings,
} from "lucide-react";

interface OverviewData {
  authenticated: boolean;
  counts: {
    designsTotal: number;
    designsPublished: number;
    categoriesTotal: number;
    categoriesActive: number;
    projectsTotal: number;
    projectsPublished: number;
    blogsTotal: number;
    blogsPublished: number;
    enquiriesTotal: number;
    enquiriesOpen: number;
    enquiriesNew?: number;
    pendingFollowups?: number;
  };
  recentEnquiries: StoredEnquiryRecord[];
  recentActivity?: Array<{ id: string; actor: string; action: string; target: string | { collection: string; id: string }; createdAt: string }>;
}

const QUICK_WORKSPACES = [
  {
    title: "Pages & Content",
    description:
      "Update hero headlines, introductory copy, and call-to-action labels across website routes.",
    href: "/admin/content",
    cta: "Edit Pages",
    Icon: FileText,
  },
  {
    title: "Design Collection",
    description:
      "Manage wall murals and patterns, toggle featured items, and assign compatible surfaces.",
    href: "/admin/designs",
    cta: "Browse Designs",
    Icon: Palette,
  },
  {
    title: "Design Categories",
    description:
      "Configure category names, URL slugs, display order, active toggles, and cover visuals.",
    href: "/admin/categories",
    cta: "Edit Categories",
    Icon: FolderKanban,
  },
  {
    title: "Portfolio Projects",
    description:
      "Curate completed architectural installations across walls, tiles, timber, blinds, and glass.",
    href: "/admin/projects",
    cta: "Manage Projects",
    Icon: Building2,
  },
  {
    title: "Journal Stories",
    description:
      "Draft, edit, and publish studio essays, material guides, and interior design perspectives.",
    href: "/admin/blogs",
    cta: "Open Journal",
    Icon: BookOpen,
  },
  {
    title: "Site Settings & SEO",
    description:
      "Update studio identity, Mumbai contact numbers, WhatsApp, social links, and search defaults.",
    href: "/admin/settings",
    cta: "Studio Settings",
    Icon: Settings,
  },
];

function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminDashboardOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [pagesCount, setPagesCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/admin/cms?collection=overview", { cache: "no-store" }).then((r) =>
        r.json()
      ),
      fetch("/api/admin/cms?collection=content", { cache: "no-store" }).then((r) =>
        r.json()
      ),
    ])
      .then(([overviewJson, contentJson]) => {
        if (!active) return;
        if (overviewJson?.ok) setData(overviewJson);
        else setLoadError(overviewJson?.error || "Dashboard is unavailable. Please refresh.");
        if (contentJson?.ok && Array.isArray(contentJson.pages)) {
          setPagesCount(contentJson.pages.length);
        }
      })
      .catch(() => { if (active) setLoadError("Could not load the dashboard. Please refresh."); })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const counts = data?.counts;

  const metrics = [
    { label: "New Enquiries", value: counts ? String(counts.enquiriesNew ?? 0) : "…", caption: "Waiting for first contact", href: "/admin/enquiries", Icon: MessageSquare },
    { label: "Due Follow-ups", value: counts ? String(counts.pendingFollowups ?? 0) : "…", caption: "Follow-up date reached", href: "/admin/enquiries", Icon: MessageSquare },
    {
      label: "Published Designs",
      value: counts ? `${counts.designsPublished}` : loading ? "…" : "—",
      caption: counts ? `${counts.designsTotal} total artworks` : "Loading count",
      href: "/admin/designs",
      Icon: Palette,
    },
    {
      label: "Categories",
      value: counts ? `${counts.categoriesActive}` : loading ? "…" : "—",
      caption: counts ? `${counts.categoriesTotal} total categories` : "Loading count",
      href: "/admin/categories",
      Icon: FolderKanban,
    },
    {
      label: "Portfolio Projects",
      value: counts ? `${counts.projectsPublished}` : loading ? "…" : "—",
      caption: counts ? `${counts.projectsTotal} total studies` : "Loading count",
      href: "/admin/projects",
      Icon: Building2,
    },
    {
      label: "Journal Articles",
      value: counts ? `${counts.blogsPublished}` : loading ? "…" : "—",
      caption: counts ? `${counts.blogsTotal} total stories` : "Loading count",
      href: "/admin/blogs",
      Icon: BookOpen,
    },
    {
      label: "Website Pages",
      value: pagesCount !== null ? `${pagesCount}` : loading ? "…" : "—",
      caption: "Editable routes",
      href: "/admin/content",
      Icon: FileText,
    },
    {
      label: "Open Enquiries",
      value: counts ? `${counts.enquiriesOpen}` : loading ? "…" : "—",
      caption: counts ? `${counts.enquiriesTotal} received total` : "Loading count",
      href: "/admin/enquiries",
      Icon: MessageSquare,
    },
  ];

  return (
    <div className="space-y-6">
      {data ? <AdminAuthBanner authenticated={data.authenticated} /> : null}
      {loadError && <p role="alert" className="rounded-xl border border-[#9B1C1C]/30 bg-[#FFFDF9] p-4 text-sm text-[#9B1C1C]">{loadError}</p>}

      {/* Editorial Studio Welcome Band */}
      <section className={`${adminCardClass} p-6 sm:p-8`}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between border-b border-[#E8DED3] pb-6">
          <div className="max-w-2xl">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9B1C1C]">
              ATELIER Studio Overview
            </p>
            <h1 className="mt-1.5 font-serif text-3xl sm:text-4xl font-normal tracking-[-0.02em] text-[#1A1A1A]">
              Your Creative Workspace.
            </h1>
            <p className="mt-2 font-sans text-sm leading-relaxed text-[#746B64]">
              Manage your wall design collection, architectural case studies,
              editorial journal, page copy, and studio client enquiries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href="/admin/content" className={adminButtonClass("primary")}>
              <span>Edit Website Content</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={adminButtonClass("secondary")}
            >
              <span>View Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#746B64]" />
            </Link>
          </div>
        </div>

        {/* 6 Crisp Ivory Metric Panels */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {metrics.map((metric) => {
            const Icon = metric.Icon;
            return (
              <Link
                key={metric.label}
                href={metric.href}
                className="group rounded-2xl border border-[#E8DED3] bg-[#FAF6F0]/75 p-4 transition-colors hover:border-[#9B1C1C]/45 hover:bg-[#FFFDF9]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-sans text-[11px] font-medium text-[#746B64]">
                    {metric.label}
                  </span>
                  <Icon className="w-4 h-4 text-[#9B1C1C] shrink-0" />
                </div>
                <p className="mt-3 font-serif text-3xl font-normal text-[#1A1A1A] admin-tabular">
                  {metric.value}
                </p>
                <div className="mt-3 pt-2.5 border-t border-[#E8DED3] flex items-center justify-between gap-2 font-sans text-[11px] text-[#746B64]">
                  <span className="truncate">{metric.caption}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#9B1C1C] shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={`${adminCardClass} p-6`}>
        <h2 className="font-serif text-2xl">Recent activity</h2>
        {!data?.recentActivity?.length ? <p className="mt-3 text-sm text-[#746B64]">{loading ? "Loading activity…" : "No content activity recorded yet."}</p> : <ul className="mt-3 divide-y divide-[#E8DED3]">{data.recentActivity.map(entry => <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-xs"><span><strong>{entry.action.replace(/[_\.]/g, " ")}</strong> · {typeof entry.target === "string" ? entry.target.split("/")[0].replace("site_settings", "settings").replace("pages", "page") : "media"} · {entry.actor}</span><time dateTime={entry.createdAt}>{new Date(entry.createdAt).toLocaleString()}</time></li>)}</ul>}
      </section>
      {/* Recent Enquiries + Quick Studio Workspaces */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Recent Client Enquiries */}
        <section className={`${adminCardClass} xl:col-span-5 p-6 flex flex-col`}>
          <div className="flex items-center justify-between gap-3 border-b border-[#E8DED3] pb-4">
            <div>
              <h2 className="font-serif text-2xl font-normal text-[#1A1A1A]">
                Recent Enquiries
              </h2>
              <p className="mt-0.5 font-sans text-xs text-[#746B64]">
                Latest submissions from project & contact pages.
              </p>
            </div>
            <Link
              href="/admin/enquiries"
              className="font-sans text-xs font-medium text-[#9B1C1C] hover:underline shrink-0"
            >
              View All →
            </Link>
          </div>

          <div className="mt-4 flex-1 space-y-3">
            {!data || data.recentEnquiries.length === 0 ? (
              <div className="rounded-2xl border border-[#E8DED3] bg-[#FAF6F0] p-6 text-center">
                <MessageSquare className="w-6 h-6 text-[#746B64]/50 mx-auto" />
                <p className="mt-2 font-sans text-xs text-[#746B64]">
                  No studio enquiries recorded yet.
                </p>
              </div>
            ) : (
              data.recentEnquiries.slice(0, 5).map((enq) => {
                const badgeStatus =
                  enq.status === "new" ? "New" : enq.status;
                return (
                  <Link
                    key={enq.id}
                    href="/admin/enquiries"
                    className="block rounded-2xl border border-[#E8DED3] bg-[#FAF6F0]/70 p-4 transition-colors hover:border-[#9B1C1C]/40 hover:bg-[#FFFDF9]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-sans text-sm font-semibold text-[#1A1A1A] truncate">
                          {enq.fullName}
                        </p>
                        <p className="mt-0.5 font-sans text-xs text-[#746B64] truncate">
                          {enq.email}
                        </p>
                      </div>
                      <AdminStatusBadge tone={badgeStatus}>
                        {badgeStatus}
                      </AdminStatusBadge>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] font-sans text-[#746B64]">
                      <span className="truncate">
                        {enq.serviceOrDesignInterest ||
                          enq.serviceInterest ||
                          enq.sourcePage ||
                          "Studio Enquiry"}
                      </span>
                      <span className="shrink-0 admin-tabular">
                        {formatDate(enq.createdAt)}
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        {/* Quick Studio Workspaces */}
        <section className={`${adminCardClass} xl:col-span-7 p-6`}>
          <div className="border-b border-[#E8DED3] pb-4">
            <h2 className="font-serif text-2xl font-normal text-[#1A1A1A]">
              Studio Modules
            </h2>
            <p className="mt-0.5 font-sans text-xs text-[#746B64]">
              Jump directly to any section of ATELIER — WALL STORY&apos;s CMS.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {QUICK_WORKSPACES.map((item) => {
              const Icon = item.Icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-2xl border border-[#E8DED3] bg-[#FAF6F0]/75 p-4 flex flex-col justify-between gap-4 transition-colors hover:border-[#9B1C1C]/45 hover:bg-[#FFFDF9]"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#9B1C1C]/10 border border-[#9B1C1C]/20 flex items-center justify-center shrink-0 text-[#9B1C1C]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-normal text-[#1A1A1A]">
                        {item.title}
                      </h3>
                      <p className="mt-1 font-sans text-xs leading-relaxed text-[#746B64]">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-[#9B1C1C]">
                    <span>{item.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
