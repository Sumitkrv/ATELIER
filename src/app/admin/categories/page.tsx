"use client";
/* eslint-disable @next/next/no-img-element */

import { AdminPublishingControls } from "@/components/admin/AdminPublishingControls";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  AdminStatusBadge,
  adminTextareaClass,
} from "@/components/admin/AdminUiPrimitives";
import {
  CatalogueCategoryRecord,
  CatalogueDesignItem,
} from "@/lib/designs-catalogue";
import { Check, Pencil, Search, X } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CatalogueCategoryRecord[]>([]);
  const [designs, setDesigns] = useState<CatalogueDesignItem[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    id: "",
    name: "",
    slug: "",
    description: "",
    coverImageUrl: "",
    displayOrder: 1,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = useCallback(() => {
    Promise.all([
      fetch("/api/admin/cms?collection=categories", { cache: "no-store" }).then(
        (res) => res.json()
      ),
      fetch("/api/admin/cms?collection=designs", { cache: "no-store" }).then(
        (res) => res.json()
      ),
    ])
      .then(([catJson, desJson]) => {
        if (catJson?.ok) {
          setCategories(catJson.categories || []);
          setAuthenticated(Boolean(catJson.authenticated));
        }
        if (desJson?.ok) {
          setDesigns(desJson.designs || []);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const countBySlot = useMemo(() => {
    const map = new Map<number, number>();
    for (const d of designs) {
      map.set(
        d.categorySlotNumber,
        (map.get(d.categorySlotNumber) || 0) + 1
      );
    }
    return map;
  }, [designs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [categories, search]);

  const startEdit = (cat: CatalogueCategoryRecord) => {
    setEditingId(cat.id);
    setFeedback(null);
    setDraft({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      coverImageUrl: cat.coverImage?.secureUrl || "",
      displayOrder: cat.displayOrder,
      isActive: cat.isActive,
    });
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection: "categories", ...draft }),
      });
      if (!res.ok) { const json = await res.json(); setFeedback(json.error || "Could not save category."); return; }
      if (res.ok) {
        setEditingId(null);
        setFeedback(`Updated "${draft.name}" category configuration.`);
        await loadData();
      }
    } catch { setFeedback("Network error. Your changes were not saved."); } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminAuthBanner authenticated={authenticated} />

      <AdminPageHeader
        eyebrow="Catalogue Taxonomy"
        title={`Categories (${categories.length})`}
        description="Manage category names, display order, cover visuals, and visibility."
        actions={<button type="button" onClick={() => setCreating(true)} className={adminButtonClass("primary")}>Add category</button>}
      />

      {creating && <form className={`${adminCardClass} space-y-3 p-5`} onSubmit={async e => {
        e.preventDefault(); setSaving(true);
        try {
          const response = await fetch("/api/admin/cms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ collection: "categories", name: newName, description: "", isActive: true, displayOrder: categories.length + 1 }) });
          const json = await response.json(); if (!response.ok || !json.ok) throw new Error(json.error || "Could not add category.");
          setCreating(false); setNewName(""); setFeedback("Category added. Edit it below to add a description and image."); loadData();
        } catch (error) { setFeedback(error instanceof Error ? error.message : "Could not add category."); } finally { setSaving(false); }
      }}><label className={adminLabelClass}>Category name<input required maxLength={120} value={newName} onChange={e => setNewName(e.target.value)} className={adminInputClass}/></label><div className="flex gap-2"><button type="submit" disabled={saving} className={adminButtonClass("primary")}>Create category</button><button type="button" onClick={() => setCreating(false)} className={adminButtonClass("secondary")}>Cancel</button></div></form>}

      {feedback ? (
        <div
          role="status"
          className="rounded-2xl border border-[#C9DBC9] bg-[#E9F0EA]/70 px-4 py-3 font-sans text-xs font-medium text-[#264E32]"
        >
          {feedback}
        </div>
      ) : null}

      <div className={`${adminCardClass} p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#746B64]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter categories by name or URL slug…"
            className={`${adminInputClass} pl-10 h-10`}
          />
        </div>
        <span className="font-sans text-xs text-[#746B64] admin-tabular">
          {filtered.length} of {categories.length} slots displayed
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((cat) => {
          const isEditing = editingId === cat.id;
          const designCount = countBySlot.get(cat.slotNumber) || 0;

          return (
            <div key={cat.id} className={`${adminCardClass} p-5 sm:p-6`}>
              {isEditing ? (
                <form onSubmit={saveEdit} className="space-y-5">
                  <div className="flex items-center justify-between border-b border-[#E8DED3] pb-3.5">
                    <div>
                      <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9B1C1C]">
                        Slot #{cat.slotNumber} ({cat.slotCode})
                      </p>
                      <h2 className="mt-0.5 font-serif text-2xl font-normal text-[#1A1A1A]">
                        Edit {cat.name}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      aria-label="Cancel category editing"
                      className="p-2 rounded-xl border border-[#DFD0C0] text-[#746B64] hover:text-[#1A1A1A] hover:bg-[#FAF6F0] cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className={adminLabelClass}>Category Name *</label>
                      <input
                        type="text"
                        required
                        value={draft.name}
                        onChange={(e) =>
                          setDraft({ ...draft, name: e.target.value })
                        }
                        className={adminInputClass}
                      />
                    </div>
                    <div>
                      <label className={adminLabelClass}>URL Slug *</label>
                      <input
                        type="text"
                        required
                        value={draft.slug}
                        onChange={(e) =>
                          setDraft({ ...draft, slug: e.target.value })
                        }
                        className={`${adminInputClass} font-mono text-xs`}
                      />
                    </div>
                    <div>
                      <label className={adminLabelClass}>Display Order</label>
                      <input
                        type="number"
                        value={draft.displayOrder}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            displayOrder: Number(e.target.value),
                          })
                        }
                        className={`${adminInputClass} admin-tabular`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={adminLabelClass}>Description</label>
                    <textarea
                      rows={2}
                      value={draft.description}
                      onChange={(e) =>
                        setDraft({ ...draft, description: e.target.value })
                      }
                      className={adminTextareaClass}
                    />
                  </div>

                  <AdminImageUploadField
                    label="Category Cover Artwork"
                    value={draft.coverImageUrl}
                    onChange={(url) =>
                      setDraft({ ...draft, coverImageUrl: url })
                    }
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-[#E8DED3]">
                    <label className="inline-flex cursor-pointer items-center gap-2 font-sans text-sm text-[#1A1A1A]">
                      <input
                        type="checkbox"
                        checked={draft.isActive}
                        onChange={(e) =>
                          setDraft({ ...draft, isActive: e.target.checked })
                        }
                        className="w-4 h-4 accent-[#9B1C1C]"
                      />
                      <span>Visible on Public Website</span>
                    </label>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className={adminButtonClass("secondary", "sm")}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className={adminButtonClass("primary", "sm")}
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>{saving ? "Saving…" : "Save Slot"}</span>
                      </button>
                    </div>
                  </div>
                  <AdminPublishingControls collection="categories" id={cat.id} route="/explore-designs" onChange={loadData}/>
                  <button type="button" disabled={saving || designCount > 0} title={designCount ? "Move all designs to another category first" : "Delete empty category"} className={adminButtonClass("secondary")} onClick={async () => {
                    if (!window.confirm(`Delete category ${cat.name}?`)) return;
                    try {
                      const response = await fetch(`/api/admin/cms?collection=categories&id=${encodeURIComponent(cat.id)}`, { method: "DELETE" });
                      const json = await response.json(); if (!response.ok || !json.ok) throw new Error(json.error || "Could not delete category.");
                      setFeedback("Category deleted."); setEditingId(null); loadData();
                    } catch (error) { setFeedback(error instanceof Error ? error.message : "Could not delete category."); }
                  }}>Delete empty category</button>
                </form>
              ) : (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    {cat.coverImage?.secureUrl ? (
                      <img
                        src={cat.coverImage.secureUrl}
                        alt={cat.name}
                        className="h-16 w-24 shrink-0 rounded-xl border border-[#DFD0C0] object-cover bg-[#F2EAE1]"
                      />
                    ) : null}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-[#9B1C1C]">
                          #{cat.slotNumber}
                        </span>
                        <h2 className="font-serif text-2xl font-normal text-[#1A1A1A]">
                          {cat.name}
                        </h2>
                        <AdminStatusBadge
                          tone={cat.isActive ? "active" : "hidden"}
                        >
                          {cat.isActive ? "Active" : "Hidden"}
                        </AdminStatusBadge>
                        <AdminStatusBadge tone="neutral">
                          <span className="admin-tabular">
                            {designCount}{" "}
                            {designCount === 1 ? "design" : "designs"}
                          </span>
                        </AdminStatusBadge>
                      </div>
                      <p className="mt-1 font-sans text-xs text-[#746B64] line-clamp-1">
                        {cat.description}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-[#746B64]/80">
                        /{cat.slug} • Order {cat.displayOrder}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!authenticated}
                    onClick={() => startEdit(cat)}
                    className={adminButtonClass("secondary", "sm", "shrink-0")}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Edit Category</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
