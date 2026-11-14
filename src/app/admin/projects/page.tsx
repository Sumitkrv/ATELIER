"use client";
/* eslint-disable @next/next/no-img-element */

import { AdminPublishingControls, AdminUnsavedChanges } from "@/components/admin/AdminPublishingControls";
import { AdminRecordDetails, EMPTY_RECORD_DETAILS, readRecordDetails } from "@/components/admin/AdminRecordDetails";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
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
  PortfolioProjectRecord,
  ProjectSpaceCategory,
} from "@/lib/projects-catalogue";
import { ATELIER_SURFACES } from "@/lib/brand";
import {
  ExternalLink,
  Eye,
  EyeOff,
  MapPin,
  Pencil,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";

const SPACE_CATEGORIES: ProjectSpaceCategory[] = [
  "Residential",
  "Commercial",
  "Hospitality",
  "Office",
  "Retail",
  "Institutional",
];

const EMPTY_PROJECT = {
  ...EMPTY_RECORD_DETAILS,
  id: "",
  title: "",
  slug: "",
  spaceCategory: "Residential" as ProjectSpaceCategory,
  surfaceName: "Walls",
  locationNote: "Mumbai",
  summary: "",
  description: "",
  imageUrl: "",
  featured: true,
  published: false,
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<PortfolioProjectRecord[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [form, setForm] = useState(EMPTY_PROJECT);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] =
    useState<PortfolioProjectRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadProjects = useCallback(() => {
    fetch("/api/admin/cms?collection=projects", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok) {
          setProjects(data.projects || []);
          setAuthenticated(Boolean(data.authenticated));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const openEdit = (p: PortfolioProjectRecord) => {
    setForm({
      ...readRecordDetails(p),
      id: p.id,
      title: p.title,
      slug: p.slug,
      spaceCategory: p.spaceCategory || "Residential",
      surfaceName: p.surfaceName,
      locationNote: p.locationNote,
      summary: p.summary,
      description: p.description,
      imageUrl: p.coverImage.secureUrl,
      featured: p.featured,
      published: p.published,
    });
    setShowEditor(true);
    setFeedback(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection: "projects", ...form }),
      });
      if (!res.ok) {
        const json = await res.json();
        setFeedback(json.error || "Could not save changes.");
        return;
      }
      if (res.ok) {
        setShowEditor(false);
        setFeedback(`Saved "${form.title || "Project"}" case study.`);
        await loadProjects();
      }
    } catch {
      setFeedback("Network error. Your changes were not saved.");
    } finally {
      setSaving(false);
    }
  };

  const quickToggle = async (
    p: PortfolioProjectRecord,
    patch: { featured?: boolean; published?: boolean }
  ) => {
    const res = await fetch("/api/admin/cms", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collection: "projects", id: p.id, ...patch }),
    });
    if (res.ok) await loadProjects();
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/cms?collection=projects&id=${encodeURIComponent(pendingDelete.id)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setFeedback(`Removed project "${pendingDelete.title}".`);
        setPendingDelete(null);
        await loadProjects();
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
        eyebrow="Portfolio Installations"
        title={`Projects (${projects.length})`}
        description="Published installations appear on /projects and their individual architectural case-study pages."
        actions={
          <button
            type="button"
            disabled={!authenticated}
            onClick={() => {
              setForm(EMPTY_PROJECT);
              setShowEditor(true);
              setFeedback(null);
            }}
            className={adminButtonClass("primary")}
          >
            <Plus className="h-4 w-4" />
            <span>Add Project</span>
          </button>
        }
      />

      {feedback ? (
        <div
          role="status"
          className="rounded-2xl border border-[#C9DBC9] bg-[#E9F0EA]/70 px-4 py-3 font-sans text-xs font-medium text-[#264E32]"
        >
          {feedback}
        </div>
      ) : null}

      {showEditor ? (
        <form
          onSubmit={handleSave}
          className={`${adminCardClass} p-6 sm:p-8 space-y-5`}
        >
          <div className="flex items-center justify-between border-b border-[#E8DED3] pb-4">
            <div>
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9B1C1C]">
                {form.id ? "Edit Case Study" : "New Case Study"}
              </p>
              <h2 className="mt-1 font-serif text-2xl font-normal text-[#1A1A1A]">
                {form.id ? form.title || "Update Project" : "Create Portfolio Project"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => { if (window.confirm("Close the editor? Unsaved changes will be lost.")) setShowEditor(false); }}
              aria-label="Close project editor"
              className="p-2 rounded-xl border border-[#DFD0C0] text-[#746B64] hover:text-[#1A1A1A] hover:bg-[#FAF6F0] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={adminLabelClass}>Project Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Pali Hill Venetian Villa"
                className={adminInputClass}
              />
            </div>
            <div>
              <label className={adminLabelClass}>URL Slug (auto if blank)</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className={`${adminInputClass} font-mono text-xs`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={adminLabelClass}>Surface Substrate</label>
              <select
                value={form.surfaceName}
                onChange={(e) =>
                  setForm({ ...form, surfaceName: e.target.value })
                }
                className={adminSelectClass}
              >
                {ATELIER_SURFACES.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={adminLabelClass}>Space Category</label>
              <select
                value={form.spaceCategory}
                onChange={(e) =>
                  setForm({
                    ...form,
                    spaceCategory: e.target.value as ProjectSpaceCategory,
                  })
                }
                className={adminSelectClass}
              >
                {SPACE_CATEGORIES.map((sc) => (
                  <option key={sc} value={sc}>
                    {sc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={adminLabelClass}>Location Note</label>
              <input
                type="text"
                value={form.locationNote}
                onChange={(e) =>
                  setForm({ ...form, locationNote: e.target.value })
                }
                className={adminInputClass}
              />
            </div>
          </div>

          <div>
            <label className={adminLabelClass}>Project Summary *</label>
            <input
              type="text"
              required
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              className={adminInputClass}
            />
          </div>

          <div>
            <label className={adminLabelClass}>Architectural Narrative</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className={adminTextareaClass}
            />
          </div>

          <AdminImageUploadField
            label="Installation Cover Photograph"
            value={form.imageUrl}
            onChange={(url) => setForm({ ...form, imageUrl: url })}
          />

          <AdminRecordDetails value={form} onChange={details => setForm({ ...form, ...details })} project />
          <AdminPublishingControls collection="projects" id={form.id} route={`/projects/${form.slug}`} onChange={loadProjects} />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-[#E8DED3]">
            <div className="flex flex-wrap gap-6 font-sans text-sm text-[#1A1A1A]">
              <label className="inline-flex cursor-pointer items-center gap-2">
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

              <label className="inline-flex cursor-pointer items-center gap-2">
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

            <div className="flex items-center gap-2.5">
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
                {saving ? "Saving…" : "Save Project"}
              </button>
            </div>
          </div>
        </form>
      ) : null}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((p) => (
          <article
            key={p.id}
            className="group rounded-[20px] border border-[#DFD0C0] bg-[#FFFDF9] overflow-hidden flex flex-col shadow-[0_6px_22px_rgba(32,28,26,0.04)] transition-colors hover:border-[#9B1C1C]/45"
          >
            <div className="relative aspect-[16/10] bg-[#F2EAE1] overflow-hidden">
              <img
                src={p.coverImage.secureUrl}
                alt={p.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                <AdminStatusBadge tone={p.published ? "published" : "hidden"}>
                  {p.published ? "Published" : "Hidden"}
                </AdminStatusBadge>
                {p.featured ? (
                  <AdminStatusBadge tone="featured">Featured</AdminStatusBadge>
                ) : null}
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap font-sans text-xs text-[#9B1C1C] font-medium">
                  <span>{p.surfaceName}</span>
                  <span className="text-[#DFD0C0]">•</span>
                  <span className="text-[#746B64]">{p.spaceCategory}</span>
                </div>
                <h2 className="mt-1.5 font-serif text-2xl font-normal text-[#1A1A1A]">
                  {p.title}
                </h2>
                <p className="mt-1.5 font-sans text-xs text-[#746B64] line-clamp-2">
                  {p.summary}
                </p>
                <p className="mt-2 inline-flex items-center gap-1.5 font-sans text-xs text-[#746B64]">
                  <MapPin className="w-3.5 h-3.5 text-[#9B1C1C]" />
                  <span>{p.locationNote}</span>
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3.5 border-t border-[#E8DED3]">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={!authenticated}
                    onClick={() => quickToggle(p, { featured: !p.featured })}
                    aria-label="Toggle Featured"
                    className={`p-2 rounded-xl border cursor-pointer disabled:opacity-40 ${
                      p.featured
                        ? "border-[#9B1C1C]/35 bg-[#9B1C1C]/10 text-[#9B1C1C]"
                        : "border-[#DFD0C0] bg-[#FAF6F0] text-[#746B64]"
                    }`}
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={!authenticated}
                    onClick={() => quickToggle(p, { published: !p.published })}
                    aria-label="Toggle Visibility"
                    className={`p-2 rounded-xl border cursor-pointer disabled:opacity-40 ${
                      p.published
                        ? "border-[#C9DBC9] bg-[#E9F0EA]/70 text-[#264E32]"
                        : "border-[#DFD0C0] bg-[#FAF6F0] text-[#746B64]"
                    }`}
                  >
                    {p.published ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/projects/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Preview public case study"
                    aria-label={`Preview ${p.title}`}
                    className="p-2 rounded-xl border border-[#DFD0C0] bg-[#FFFDF9] text-[#746B64] hover:text-[#1A1A1A]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    type="button"
                    disabled={!authenticated}
                    onClick={() => openEdit(p)}
                    className={adminButtonClass("secondary", "sm")}
                  >
                    <Pencil className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    disabled={!authenticated}
                    onClick={() => setPendingDelete(p)}
                    aria-label={`Delete ${p.title}`}
                    className="p-2 rounded-xl border border-[#DFD0C0] bg-[#FFFDF9] text-[#9B1C1C] hover:bg-[#9B1C1C] hover:text-[#FFFDF9] cursor-pointer disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <AdminConfirmModal
        open={Boolean(pendingDelete)}
        title="Delete Portfolio Project"
        description={
          pendingDelete
            ? `Are you sure you want to remove "${pendingDelete.title}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete Project"
        busy={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
