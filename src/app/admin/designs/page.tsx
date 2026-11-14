"use client";
/* eslint-disable @next/next/no-img-element */

import { AdminPublishingControls, AdminUnsavedChanges } from "@/components/admin/AdminPublishingControls";
import { AdminRecordDetails, EMPTY_RECORD_DETAILS, readRecordDetails } from "@/components/admin/AdminRecordDetails";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AdminAuthBanner,
  AdminImageUploadField,
} from "@/components/admin/AdminChromeClient";
import {
  adminButtonClass,
  adminCardClass,
  AdminConfirmModal,
  adminInputClass,
  adminLabelClass,
  AdminPageHeader,
  adminSelectClass,
  AdminStatusBadge,
  adminTextareaClass,
} from "@/components/admin/AdminUiPrimitives";
import {
  CatalogueCategoryRecord,
  CatalogueDesignItem,
} from "@/lib/designs-catalogue";
import { ATELIER_SURFACES } from "@/lib/brand";
import {
  Eye,
  EyeOff,
  LayoutGrid,
  List,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";

const EMPTY_FORM = {
  ...EMPTY_RECORD_DETAILS,
  id: "",
  title: "",
  slug: "",
  categorySlotNumber: 1,
  summary: "",
  description: "",
  imageUrl: "",
  compatibleSurfaces: ["Walls"] as string[],
  defaultMode: "mural" as "mural" | "pattern",
  featured: false,
  published: false,
};

type StatusFilter = "all" | "published" | "hidden" | "featured";

export default function AdminDesignsPage() {
  const [designs, setDesigns] = useState<CatalogueDesignItem[]>([]);
  const [categories, setCategories] = useState<CatalogueCategoryRecord[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [showEditor, setShowEditor] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [pendingDelete, setPendingDelete] =
    useState<CatalogueDesignItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(() => {
    fetch("/api/admin/cms?collection=designs", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok) {
          setDesigns(data.designs || []);
          setCategories(data.categories || []);
          setAuthenticated(Boolean(data.authenticated));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return designs.filter((item) => {
      if (selectedSlot !== "all" && item.categorySlotNumber !== selectedSlot) {
        return false;
      }
      if (statusFilter === "published" && !item.published) return false;
      if (statusFilter === "hidden" && item.published) return false;
      if (statusFilter === "featured" && !item.featured) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q) ||
        item.compatibleSurfaces.join(" ").toLowerCase().includes(q)
      );
    });
  }, [designs, search, selectedSlot, statusFilter]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setShowEditor(true);
    setFeedback(null);
  };

  const openEdit = (d: CatalogueDesignItem) => {
    setForm({
      ...readRecordDetails(d),
      id: d.id,
      title: d.title,
      slug: d.slug,
      categorySlotNumber: d.categorySlotNumber,
      summary: d.summary,
      description: d.description,
      imageUrl: d.coverImage.secureUrl,
      compatibleSurfaces: [...d.compatibleSurfaces],
      defaultMode: d.visualizerConfig.defaultMode,
      featured: d.featured,
      published: d.published,
    });
    setShowEditor(true);
    setFeedback(null);
  };

  const toggleSurface = (surface: string) => {
    setForm((prev) => {
      const exists = prev.compatibleSurfaces.includes(surface);
      const next = exists
        ? prev.compatibleSurfaces.filter((s) => s !== surface)
        : [...prev.compatibleSurfaces, surface];
      return {
        ...prev,
        compatibleSurfaces: next.length > 0 ? next : ["Walls"],
      };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection: "designs", ...form }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setFeedback({
          type: "error",
          text: data?.error || "Unable to save design record.",
        });
        return;
      }
      setShowEditor(false);
      setFeedback({
        type: "success",
        text: `Saved "${form.title || "Design"}" to collection.`,
      });
      await loadData();
    } catch {
      setFeedback({ type: "error", text: "Network error. Your changes were not saved." });
    } finally {
      setSaving(false);
    }
  };

  const handleQuickToggle = async (
    item: CatalogueDesignItem,
    patch: { featured?: boolean; published?: boolean }
  ) => {
    const res = await fetch("/api/admin/cms", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collection: "designs", id: item.id, ...patch }),
    });
    if (res.ok) await loadData();
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/cms?collection=designs&id=${encodeURIComponent(pendingDelete.id)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setFeedback({
          type: "success",
          text: `Removed "${pendingDelete.title}" from the collection.`,
        });
        setPendingDelete(null);
        await loadData();
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminAuthBanner authenticated={authenticated} />
      <AdminUnsavedChanges dirty={showEditor} />

      <AdminPageHeader
        eyebrow="Artwork & Mural Collection"
        title={`Designs (${designs.length})`}
        description="Manage wall artworks across all categories, compatible print surfaces, visualizer defaults, and featured homepage visibility."
        actions={
          <button
            type="button"
            disabled={!authenticated}
            onClick={openCreate}
            className={adminButtonClass("primary")}
          >
            <Plus className="h-4 w-4" />
            <span>Add New Design</span>
          </button>
        }
      />

      {feedback ? (
        <div
          role={feedback.type === "error" ? "alert" : "status"}
          className={`rounded-2xl border px-4 py-3 font-sans text-xs font-medium ${
            feedback.type === "error"
              ? "border-[#9B1C1C]/30 bg-[#9B1C1C]/[0.07] text-[#9B1C1C]"
              : "border-[#C9DBC9] bg-[#E9F0EA]/70 text-[#264E32]"
          }`}
        >
          {feedback.text}
        </div>
      ) : null}

      {/* Slide-Down Create / Edit Editor Card */}
      {showEditor ? (
        <form
          onSubmit={handleSave}
          className={`${adminCardClass} p-6 sm:p-8 space-y-5`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-[#E8DED3]">
            <div>
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9B1C1C]">
                {form.id ? "Edit Artwork" : "New Collection Item"}
              </p>
              <h2 className="mt-1 font-serif text-2xl font-normal text-[#1A1A1A]">
                {form.id ? form.title || "Update Design" : "Create New Design"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => { if (window.confirm("Close the editor? Unsaved changes will be lost.")) setShowEditor(false); }}
              aria-label="Close design editor"
              className="p-2 rounded-xl border border-[#DFD0C0] text-[#746B64] hover:text-[#1A1A1A] hover:bg-[#FAF6F0] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={adminLabelClass}>Design Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Lotus Sanctuary Mural"
                className={adminInputClass}
              />
            </div>

            <div>
              <label className={adminLabelClass}>URL Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="auto-generated-from-title"
                className={adminInputClass}
              />
            </div>

            <div>
              <label className={adminLabelClass}>Category Slot *</label>
              <select
                value={form.categorySlotNumber}
                onChange={(e) =>
                  setForm({
                    ...form,
                    categorySlotNumber: Number(e.target.value),
                  })
                }
                className={adminSelectClass}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slotNumber}>
                    #{cat.slotNumber} — {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={adminLabelClass}>Short Summary *</label>
            <input
              type="text"
              required
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder="Concise one-line studio description"
              className={adminInputClass}
            />
          </div>

          <div>
            <label className={adminLabelClass}>Detailed Specification</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Material pairing notes, colour palette, and architectural context"
              className={adminTextareaClass}
            />
          </div>

          <AdminImageUploadField
            label="Cover Artwork Image"
            value={form.imageUrl}
            onChange={(url) => setForm({ ...form, imageUrl: url })}
          />

          <AdminRecordDetails value={form} onChange={details => setForm({ ...form, ...details })} />
          <AdminPublishingControls collection="designs" id={form.id} route={"/explore-designs"} onChange={loadData} />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 pt-2">
            <div>
              <span className={adminLabelClass}>Compatible Surfaces</span>
              <div className="flex flex-wrap gap-2">
                {ATELIER_SURFACES.map((surface) => {
                  const active = form.compatibleSurfaces.includes(
                    surface.name
                  );
                  return (
                    <button
                      key={surface.id}
                      type="button"
                      onClick={() => toggleSurface(surface.name)}
                      className={`px-3 py-1.5 rounded-full border font-sans text-xs font-medium cursor-pointer transition-colors ${
                        active
                          ? "border-[#9B1C1C] bg-[#9B1C1C] text-[#FFFDF9]"
                          : "border-[#DFD0C0] bg-[#FAF6F0] text-[#574F49] hover:border-[#9B1C1C]/45"
                      }`}
                    >
                      {surface.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-5">
              <div className="w-48">
                <label className={adminLabelClass}>Visualizer Mode</label>
                <select
                  value={form.defaultMode}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      defaultMode: e.target.value as "mural" | "pattern",
                    })
                  }
                  className={adminSelectClass}
                >
                  <option value="mural">Full-Wall Mural</option>
                  <option value="pattern">Repeating Pattern</option>
                </select>
              </div>

              <label className="inline-flex items-center gap-2 font-sans text-sm text-[#1A1A1A] cursor-pointer pb-2.5">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm({ ...form, featured: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#9B1C1C]"
                />
                <span>Featured</span>
              </label>

              <label className="inline-flex items-center gap-2 font-sans text-sm text-[#1A1A1A] cursor-pointer pb-2.5">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) =>
                    setForm({ ...form, published: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#9B1C1C]"
                />
                <span>Publish on save</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E8DED3]">
            <button
              type="button"
              onClick={() => { if (window.confirm("Close the editor? Unsaved changes will be lost.")) setShowEditor(false); }}
              className={adminButtonClass("secondary")}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={adminButtonClass("primary")}
            >
              {saving ? "Saving…" : "Save Design"}
            </button>
          </div>
        </form>
      ) : null}

      {/* Filter & View Switcher Toolbar */}
      <section className={`${adminCardClass} p-4 sm:p-5 space-y-4`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#746B64]" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search artworks by title, slug, surface, or category…"
                className={`${adminInputClass} pl-10 h-10`}
              />
            </div>

            <select
              aria-label="Filter by category"
              value={selectedSlot}
              onChange={(e) =>
                setSelectedSlot(
                  e.target.value === "all" ? "all" : Number(e.target.value)
                )
              }
              className={`${adminSelectClass} sm:w-64 h-10`}
            >
              <option value="all">All Categories ({designs.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slotNumber}>
                  #{c.slotNumber} — {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            <span className="font-sans text-xs text-[#746B64] admin-tabular mr-1">
              Showing {filtered.length} of {designs.length}
            </span>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              className={`p-2 rounded-xl border cursor-pointer transition-colors ${
                viewMode === "grid"
                  ? "border-[#9B1C1C] bg-[#9B1C1C]/10 text-[#9B1C1C]"
                  : "border-[#DFD0C0] bg-[#FFFDF9] text-[#746B64] hover:text-[#1A1A1A]"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-label="List view"
              className={`p-2 rounded-xl border cursor-pointer transition-colors ${
                viewMode === "list"
                  ? "border-[#9B1C1C] bg-[#9B1C1C]/10 text-[#9B1C1C]"
                  : "border-[#DFD0C0] bg-[#FFFDF9] text-[#746B64] hover:text-[#1A1A1A]"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "all", label: "All Artworks" },
              { id: "published", label: "Published" },
              { id: "hidden", label: "Hidden Drafts" },
              { id: "featured", label: "Featured" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full border font-sans text-xs font-medium cursor-pointer transition-colors ${
                statusFilter === tab.id
                  ? "border-[#9B1C1C] bg-[#9B1C1C] text-[#FFFDF9]"
                  : "border-[#DFD0C0] bg-[#FAF6F0] text-[#574F49] hover:border-[#9B1C1C]/45"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Collection Body */}
      {loading ? (
        <div className={`${adminCardClass} p-12 text-center font-sans text-sm text-[#746B64]`}>
          Loading design collection…
        </div>
      ) : filtered.length === 0 ? (
        <div className={`${adminCardClass} p-12 text-center`}>
          <p className="font-serif text-2xl text-[#1A1A1A]">
            No matching designs found
          </p>
          <p className="mt-1 font-sans text-xs text-[#746B64]">
            Try clearing your search or selecting another category filter.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="group rounded-[20px] border border-[#DFD0C0] bg-[#FFFDF9] overflow-hidden flex flex-col shadow-[0_6px_22px_rgba(32,28,26,0.04)] transition-colors hover:border-[#9B1C1C]/45"
            >
              <div className="relative aspect-[16/10] bg-[#F2EAE1] overflow-hidden">
                <img
                  src={item.coverImage.secureUrl}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <AdminStatusBadge
                    tone={item.published ? "published" : "hidden"}
                  >
                    {item.published ? "Published" : "Hidden"}
                  </AdminStatusBadge>
                  {item.featured ? (
                    <AdminStatusBadge tone="featured">Featured</AdminStatusBadge>
                  ) : null}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <p className="font-sans text-[11px] font-medium text-[#9B1C1C]">
                    {item.categoryLabel}
                  </p>
                  <h3 className="mt-1 font-serif text-xl font-normal text-[#1A1A1A] line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="mt-1 font-sans text-xs text-[#746B64] line-clamp-2">
                    {item.summary}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {item.compatibleSurfaces.slice(0, 3).map((surface) => (
                      <span
                        key={surface}
                        className="rounded-md bg-[#FAF6F0] border border-[#E8DED3] px-2 py-0.5 font-sans text-[10px] text-[#574F49]"
                      >
                        {surface}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#E8DED3]">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={!authenticated}
                        onClick={() =>
                          handleQuickToggle(item, { featured: !item.featured })
                        }
                        title={
                          item.featured ? "Remove featured" : "Mark as featured"
                        }
                        aria-label="Toggle Featured"
                        className={`p-2 rounded-xl border cursor-pointer disabled:opacity-40 transition-colors ${
                          item.featured
                            ? "border-[#9B1C1C]/35 bg-[#9B1C1C]/10 text-[#9B1C1C]"
                            : "border-[#DFD0C0] bg-[#FAF6F0] text-[#746B64] hover:text-[#1A1A1A]"
                        }`}
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={!authenticated}
                        onClick={() =>
                          handleQuickToggle(item, {
                            published: !item.published,
                          })
                        }
                        title={
                          item.published
                            ? "Hide from catalogue"
                            : "Publish to catalogue"
                        }
                        aria-label="Toggle Visibility"
                        className={`p-2 rounded-xl border cursor-pointer disabled:opacity-40 transition-colors ${
                          item.published
                            ? "border-[#C9DBC9] bg-[#E9F0EA]/70 text-[#264E32]"
                            : "border-[#DFD0C0] bg-[#FAF6F0] text-[#746B64]"
                        }`}
                      >
                        {item.published ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={!authenticated}
                        onClick={() => openEdit(item)}
                        className={adminButtonClass("secondary", "sm")}
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        disabled={!authenticated}
                        onClick={() => setPendingDelete(item)}
                        aria-label={`Delete ${item.title}`}
                        className="p-2 rounded-xl border border-[#DFD0C0] bg-[#FFFDF9] text-[#9B1C1C] hover:bg-[#9B1C1C] hover:text-[#FFFDF9] cursor-pointer disabled:opacity-40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className={`${adminCardClass} divide-y divide-[#E8DED3] overflow-hidden`}>
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between hover:bg-[#FAF6F0]/60 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={item.coverImage.secureUrl}
                  alt={item.title}
                  loading="lazy"
                  className="h-14 w-20 shrink-0 rounded-xl border border-[#DFD0C0] object-cover bg-[#F2EAE1]"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-serif text-xl font-normal text-[#1A1A1A] truncate">
                      {item.title}
                    </h3>
                    <AdminStatusBadge tone="neutral">
                      {item.categoryLabel}
                    </AdminStatusBadge>
                    <AdminStatusBadge
                      tone={item.published ? "published" : "hidden"}
                    >
                      {item.published ? "Published" : "Hidden"}
                    </AdminStatusBadge>
                    {item.featured ? (
                      <AdminStatusBadge tone="featured">Featured</AdminStatusBadge>
                    ) : null}
                  </div>
                  <p className="mt-0.5 truncate font-sans text-xs text-[#746B64]">
                    {item.compatibleSurfaces.join(", ")} • /designs/{item.slug}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled={!authenticated}
                  onClick={() =>
                    handleQuickToggle(item, { featured: !item.featured })
                  }
                  aria-label="Toggle Featured"
                  className={`p-2 rounded-xl border cursor-pointer disabled:opacity-40 ${
                    item.featured
                      ? "border-[#9B1C1C]/35 bg-[#9B1C1C]/10 text-[#9B1C1C]"
                      : "border-[#DFD0C0] bg-[#FAF6F0] text-[#746B64]"
                  }`}
                >
                  <Star className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={!authenticated}
                  onClick={() =>
                    handleQuickToggle(item, { published: !item.published })
                  }
                  aria-label="Toggle Published"
                  className={`p-2 rounded-xl border cursor-pointer disabled:opacity-40 ${
                    item.published
                      ? "border-[#C9DBC9] bg-[#E9F0EA]/70 text-[#264E32]"
                      : "border-[#DFD0C0] bg-[#FAF6F0] text-[#746B64]"
                  }`}
                >
                  {item.published ? (
                    <Eye className="h-3.5 w-3.5" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  disabled={!authenticated}
                  onClick={() => openEdit(item)}
                  className={adminButtonClass("secondary", "sm")}
                >
                  <Pencil className="h-3 w-3" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  disabled={!authenticated}
                  onClick={() => setPendingDelete(item)}
                  aria-label={`Delete ${item.title}`}
                  className="p-2 rounded-xl border border-[#DFD0C0] bg-[#FFFDF9] text-[#9B1C1C] hover:bg-[#9B1C1C] hover:text-[#FFFDF9] cursor-pointer disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminConfirmModal
        open={Boolean(pendingDelete)}
        title="Delete Design Artwork"
        description={
          pendingDelete
            ? `Are you sure you want to remove "${pendingDelete.title}" from the design catalogue? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete Design"
        busy={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
