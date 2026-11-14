"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AdminAuthBanner,
  AdminImageUploadField,
} from "@/components/admin/AdminChromeClient";
import {
  adminButtonClass,
  adminCardClass,
  adminInputClass,
  adminLabelClass,
  AdminPageHeader,
  adminTextareaClass,
} from "@/components/admin/AdminUiPrimitives";
import { PageContentDocument } from "@/types/models";
import { Check, ExternalLink, FileText, Globe } from "lucide-react";

const PAGE_LABELS: Record<PageContentDocument["pageKey"], { label: string; route: string }> = {
  home: { label: "Home Flagship", route: "/" },
  "explore-designs": { label: "Explore Designs", route: "/explore-designs" },
  projects: { label: "Portfolio Projects", route: "/projects" },
  services: { label: "Surfaces & Services", route: "/services" },
  about: { label: "About Studio", route: "/about" },
  process: { label: "Execution Process", route: "/process" },
  visualizer: { label: "Wall Visualizer", route: "/visualizer" },
  blogs: { label: "Studio Journal", route: "/blogs" },
  contact: { label: "Contact Studio", route: "/contact" },
};

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

export default function AdminContentPage() {
  const [pages, setPages] = useState<PageContentDocument[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [activeKey, setActiveKey] =
    useState<PageContentDocument["pageKey"]>("home");
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const loadPages = useCallback(() => {
    fetch("/api/admin/cms?collection=content", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok) {
          setPages(data.pages || []);
          setAuthenticated(Boolean(data.authenticated));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  const activeDoc = pages.find((p) => p.pageKey === activeKey) || pages[0];
  const activeMeta = activeDoc
    ? PAGE_LABELS[activeDoc.pageKey] || {
        label: activeDoc.pageKey,
        route: `/${activeDoc.pageKey === "home" ? "" : activeDoc.pageKey}`,
      }
    : null;

  const updateActiveDoc = (
    updater: (doc: PageContentDocument) => PageContentDocument
  ) => {
    if (!activeDoc) return;
    setPages((prev) =>
      prev.map((item) =>
        item.pageKey === activeDoc.pageKey ? updater(item) : item
      )
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDoc) return;
    setSaving(true);
    setSavedNotice(null);
    setErrorNotice(null);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection: "content", page: activeDoc }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        setErrorNotice(json?.error || "Unable to save page content.");
        return;
      }
      setSavedNotice(
        `Saved "${activeMeta?.label || activeDoc.pageKey}" copy and media settings.`
      );
      await loadPages();
    } catch {
      setErrorNotice("Network error while saving page changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminAuthBanner authenticated={authenticated} />

      <AdminPageHeader
        eyebrow="Pages & Editorial Copy"
        title={`Page Content (${pages.length || 9} Pages)`}
        description="Choose any page route to update its hero typography, editorial subheading, poster artwork, process notes, and primary/secondary call-to-action links."
        actions={
          activeMeta ? (
            <Link
              href={activeMeta.route}
              target="_blank"
              rel="noopener noreferrer"
              className={adminButtonClass("secondary", "sm")}
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#746B64]" />
              <span>Preview {activeMeta.route}</span>
            </Link>
          ) : null
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Route List */}
        <aside className={`${adminCardClass} lg:col-span-4 p-4 space-y-2`}>
          <div className="px-2 pb-2 border-b border-[#E8DED3] flex items-center justify-between">
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[#746B64]">
              Website Routes
            </span>
            <Globe className="w-3.5 h-3.5 text-[#9B1C1C]" />
          </div>

          <div className="space-y-1.5 pt-1">
            {pages.map((p) => {
              const meta = PAGE_LABELS[p.pageKey] || {
                label: p.pageKey,
                route: `/${p.pageKey}`,
              };
              const isSelected = activeDoc?.pageKey === p.pageKey;

              return (
                <button
                  key={p.pageKey}
                  type="button"
                  onClick={() => {
                    setActiveKey(p.pageKey);
                    setSavedNotice(null);
                    setErrorNotice(null);
                  }}
                  className={`w-full text-left rounded-xl border px-3.5 py-3 transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "border-[#9B1C1C] bg-[#9B1C1C]/[0.07]"
                      : "border-transparent hover:border-[#DFD0C0] hover:bg-[#FAF6F0]"
                  }`}
                >
                  <div className="min-w-0">
                    <p
                      className={`font-sans text-sm font-medium truncate ${
                        isSelected ? "text-[#9B1C1C]" : "text-[#1A1A1A]"
                      }`}
                    >
                      {meta.label}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-[#746B64]">
                      {meta.route}
                    </p>
                  </div>
                  <span className="font-sans text-[11px] text-[#746B64] shrink-0 admin-tabular">
                    {formatDate(p.updatedAt)}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Page Editor */}
        <div className={`${adminCardClass} lg:col-span-8 p-6 sm:p-8`}>
          {activeDoc ? (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#E8DED3]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#9B1C1C]/10 border border-[#9B1C1C]/20 flex items-center justify-center text-[#9B1C1C]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl font-normal text-[#1A1A1A]">
                      {activeMeta?.label}
                    </h2>
                    <p className="font-mono text-xs text-[#746B64]">
                      Route: {activeMeta?.route}
                    </p>
                  </div>
                </div>
                <span className="font-sans text-xs text-[#746B64] admin-tabular">
                  Last saved: {formatDate(activeDoc.updatedAt)}
                </span>
              </div>

              {savedNotice ? (
                <div
                  role="status"
                  className="rounded-xl border border-[#C9DBC9] bg-[#E9F0EA]/70 px-4 py-3 font-sans text-xs font-medium text-[#264E32]"
                >
                  {savedNotice}
                </div>
              ) : null}

              {errorNotice ? (
                <div
                  role="alert"
                  className="rounded-xl border border-[#9B1C1C]/30 bg-[#9B1C1C]/[0.07] px-4 py-3 font-sans text-xs font-medium text-[#9B1C1C]"
                >
                  {errorNotice}
                </div>
              ) : null}

              {/* Hero Copy */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={adminLabelClass}>Hero Eyebrow</label>
                    <input
                      type="text"
                      disabled={!authenticated}
                      value={activeDoc.hero.eyebrow}
                      onChange={(e) =>
                        updateActiveDoc((doc) => ({
                          ...doc,
                          hero: { ...doc.hero, eyebrow: e.target.value },
                        }))
                      }
                      className={`${adminInputClass} disabled:opacity-60`}
                    />
                  </div>
                  <div>
                    <label className={adminLabelClass}>
                      Highlighted Accent Word
                    </label>
                    <input
                      type="text"
                      disabled={!authenticated}
                      value={activeDoc.hero.highlightedText || ""}
                      onChange={(e) =>
                        updateActiveDoc((doc) => ({
                          ...doc,
                          hero: { ...doc.hero, highlightedText: e.target.value },
                        }))
                      }
                      className={`${adminInputClass} disabled:opacity-60`}
                    />
                  </div>
                </div>

                <div>
                  <label className={adminLabelClass}>Main Headline</label>
                  <input
                    type="text"
                    disabled={!authenticated}
                    value={activeDoc.hero.heading}
                    onChange={(e) =>
                      updateActiveDoc((doc) => ({
                        ...doc,
                        hero: { ...doc.hero, heading: e.target.value },
                      }))
                    }
                    className={`${adminInputClass} disabled:opacity-60`}
                  />
                </div>

                <div>
                  <label className={adminLabelClass}>Supporting Subheading</label>
                  <textarea
                    rows={3}
                    disabled={!authenticated}
                    value={activeDoc.hero.subheading}
                    onChange={(e) =>
                      updateActiveDoc((doc) => ({
                        ...doc,
                        hero: { ...doc.hero, subheading: e.target.value },
                      }))
                    }
                    className={`${adminTextareaClass} disabled:opacity-60`}
                  />
                </div>

                <AdminImageUploadField
                  label="Hero Poster / Background Visual"
                  value={activeDoc.hero.posterImage?.secureUrl || ""}
                  disabled={!authenticated}
                  onChange={(url) =>
                    updateActiveDoc((doc) => ({
                      ...doc,
                      hero: {
                        ...doc.hero,
                        posterImage: url
                          ? {
                              publicId:
                                doc.hero.posterImage?.publicId ||
                                `page-${doc.pageKey}-poster`,
                              secureUrl: url,
                              resourceType: "image",
                              altText:
                                doc.hero.posterImage?.altText || doc.hero.heading,
                            }
                          : null,
                      },
                    }))
                  }
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
                <div className="rounded-2xl border border-[#E8DED3] bg-[#FAF6F0]/75 p-4 space-y-3">
                  <span className="block font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9B1C1C]">
                    Primary CTA
                  </span>
                  <div>
                    <label className={adminLabelClass}>Button Label</label>
                    <input
                      type="text"
                      disabled={!authenticated}
                      value={activeDoc.hero.primaryCta.label}
                      onChange={(e) =>
                        updateActiveDoc((doc) => ({
                          ...doc,
                          hero: {
                            ...doc.hero,
                            primaryCta: {
                              ...doc.hero.primaryCta,
                              label: e.target.value,
                            },
                          },
                        }))
                      }
                      className={`${adminInputClass} bg-[#FFFDF9] disabled:opacity-60`}
                    />
                  </div>
                  <div>
                    <label className={adminLabelClass}>Target Path</label>
                    <input
                      type="text"
                      disabled={!authenticated}
                      value={activeDoc.hero.primaryCta.href}
                      onChange={(e) =>
                        updateActiveDoc((doc) => ({
                          ...doc,
                          hero: {
                            ...doc.hero,
                            primaryCta: {
                              ...doc.hero.primaryCta,
                              href: e.target.value,
                            },
                          },
                        }))
                      }
                      className={`${adminInputClass} bg-[#FFFDF9] font-mono text-xs disabled:opacity-60`}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#E8DED3] bg-[#FAF6F0]/75 p-4 space-y-3">
                  <span className="block font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9B1C1C]">
                    Secondary CTA
                  </span>
                  <div>
                    <label className={adminLabelClass}>Button Label</label>
                    <input
                      type="text"
                      disabled={!authenticated}
                      value={activeDoc.hero.secondaryCta.label}
                      onChange={(e) =>
                        updateActiveDoc((doc) => ({
                          ...doc,
                          hero: {
                            ...doc.hero,
                            secondaryCta: {
                              ...doc.hero.secondaryCta,
                              label: e.target.value,
                            },
                          },
                        }))
                      }
                      className={`${adminInputClass} bg-[#FFFDF9] disabled:opacity-60`}
                    />
                  </div>
                  <div>
                    <label className={adminLabelClass}>Target Path</label>
                    <input
                      type="text"
                      disabled={!authenticated}
                      value={activeDoc.hero.secondaryCta.href}
                      onChange={(e) =>
                        updateActiveDoc((doc) => ({
                          ...doc,
                          hero: {
                            ...doc.hero,
                            secondaryCta: {
                              ...doc.hero.secondaryCta,
                              href: e.target.value,
                            },
                          },
                        }))
                      }
                      className={`${adminInputClass} bg-[#FFFDF9] font-mono text-xs disabled:opacity-60`}
                    />
                  </div>
                </div>
              </div>

              {/* Process Stages (if page defines them) */}
              {activeDoc.processStages && activeDoc.processStages.length > 0 ? (
                <div className="pt-4 border-t border-[#E8DED3] space-y-3">
                  <h3 className="font-serif text-xl font-normal text-[#1A1A1A]">
                    Process Stages ({activeDoc.processStages.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {activeDoc.processStages.map((stage, idx) => (
                      <div
                        key={stage.stepNumber || idx}
                        className="rounded-2xl border border-[#E8DED3] bg-[#FAF6F0]/75 p-4 space-y-2.5"
                      >
                        <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9B1C1C]">
                          Stage 0{stage.stepNumber}
                        </span>
                        <input
                          type="text"
                          disabled={!authenticated}
                          value={stage.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateActiveDoc((doc) => ({
                              ...doc,
                              processStages: doc.processStages?.map((s, i) =>
                                i === idx ? { ...s, title: val } : s
                              ),
                            }));
                          }}
                          className={`${adminInputClass} bg-[#FFFDF9] h-10 text-xs disabled:opacity-60`}
                        />
                        <textarea
                          rows={2}
                          disabled={!authenticated}
                          value={stage.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateActiveDoc((doc) => ({
                              ...doc,
                              processStages: doc.processStages?.map((s, i) =>
                                i === idx ? { ...s, description: val } : s
                              ),
                            }));
                          }}
                          className={`${adminTextareaClass} bg-[#FFFDF9] text-xs py-2 disabled:opacity-60`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* FAQs (if page defines them) */}
              {activeDoc.faqs && activeDoc.faqs.length > 0 ? (
                <div className="pt-4 border-t border-[#E8DED3] space-y-3">
                  <h3 className="font-serif text-xl font-normal text-[#1A1A1A]">
                    Page FAQs ({activeDoc.faqs.length})
                  </h3>
                  <div className="space-y-3">
                    {activeDoc.faqs.map((faq, idx) => (
                      <div
                        key={faq.id}
                        className="rounded-2xl border border-[#E8DED3] bg-[#FAF6F0]/75 p-4 space-y-2.5"
                      >
                        <input
                          type="text"
                          disabled={!authenticated}
                          value={faq.question}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateActiveDoc((doc) => ({
                              ...doc,
                              faqs: doc.faqs?.map((f, i) =>
                                i === idx ? { ...f, question: val } : f
                              ),
                            }));
                          }}
                          className={`${adminInputClass} bg-[#FFFDF9] h-10 text-xs font-medium disabled:opacity-60`}
                        />
                        <textarea
                          rows={2}
                          disabled={!authenticated}
                          value={faq.answer}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateActiveDoc((doc) => ({
                              ...doc,
                              faqs: doc.faqs?.map((f, i) =>
                                i === idx ? { ...f, answer: val } : f
                              ),
                            }));
                          }}
                          className={`${adminTextareaClass} bg-[#FFFDF9] text-xs py-2 disabled:opacity-60`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t border-[#E8DED3]">
                <button
                  type="submit"
                  disabled={!authenticated || saving}
                  className={adminButtonClass("primary")}
                >
                  <Check className="h-4 w-4" />
                  <span>{saving ? "Saving Changes…" : "Save Page Content"}</span>
                </button>
              </div>
            </form>
          ) : (
            <p className="py-12 text-center font-sans text-sm text-[#746B64]">
              Loading website page documents…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
