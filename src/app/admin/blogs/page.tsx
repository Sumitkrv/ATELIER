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
  BLOG_DRAFT_CATEGORIES,
  BlogArticleRecord,
} from "@/lib/blogs-catalogue";
import {
  Clock,
  ExternalLink,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";

const EMPTY_BLOG = {
  ...EMPTY_RECORD_DETAILS,
  id: "",
  title: "",
  slug: "",
  categorySlug: BLOG_DRAFT_CATEGORIES[0].slug,
  categoryName: BLOG_DRAFT_CATEGORIES[0].name,
  excerpt: "",
  content: "",
  imageUrl: "",
  tags: "wall art, 3d printing, mumbai",
  featured: false,
  published: false,
};

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogArticleRecord[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [form, setForm] = useState(EMPTY_BLOG);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] =
    useState<BlogArticleRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadBlogs = useCallback(() => {
    fetch("/api/admin/cms?collection=blogs", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok) {
          setBlogs(data.blogs || []);
          setAuthenticated(Boolean(data.authenticated));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  const openEdit = (b: BlogArticleRecord) => {
    const joinedBody = b.sections
      .flatMap((s) => s.paragraphs)
      .join("\n\n");
    setForm({
      ...readRecordDetails(b),
      id: b.id,
      title: b.title,
      slug: b.slug,
      categorySlug: b.categorySlug,
      categoryName: b.categoryName,
      excerpt: b.excerpt,
      content: joinedBody,
      imageUrl: b.coverImage.secureUrl,
      tags: b.tags.join(", "),
      featured: b.featured,
      published: b.published,
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
        body: JSON.stringify({ collection: "blogs", ...form }),
      });
      if (!res.ok) {
        const json = await res.json();
        setFeedback(json.error || "Could not save changes.");
        return;
      }
      if (res.ok) {
        setShowEditor(false);
        setFeedback(`Saved article "${form.title || "Untitled"}".`);
        await loadBlogs();
      }
    } catch {
      setFeedback("Network error. Your changes were not saved.");
    } finally {
      setSaving(false);
    }
  };

  const quickToggle = async (
    b: BlogArticleRecord,
    patch: { featured?: boolean; published?: boolean }
  ) => {
    const res = await fetch("/api/admin/cms", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collection: "blogs", id: b.id, ...patch }),
    });
    if (res.ok) await loadBlogs();
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/cms?collection=blogs&id=${encodeURIComponent(pendingDelete.id)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setFeedback(`Deleted article "${pendingDelete.title}".`);
        setPendingDelete(null);
        await loadBlogs();
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
        eyebrow="Studio Journal CMS"
        title={`Journal Articles (${blogs.length})`}
        description="Author, edit, draft, and publish studio essays directly to /blogs."
        actions={
          <button
            type="button"
            disabled={!authenticated}
            onClick={() => {
              setForm(EMPTY_BLOG);
              setShowEditor(true);
              setFeedback(null);
            }}
            className={adminButtonClass("primary")}
          >
            <Plus className="h-4 w-4" />
            <span>Write Article</span>
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
                {form.id ? "Edit Editorial Piece" : "New Studio Essay"}
              </p>
              <h2 className="mt-1 font-serif text-2xl font-normal text-[#1A1A1A]">
                {form.id ? form.title || "Update Article" : "Write Journal Article"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => { if (window.confirm("Close the editor? Unsaved changes will be lost.")) setShowEditor(false); }}
              aria-label="Close article editor"
              className="p-2 rounded-xl border border-[#DFD0C0] text-[#746B64] hover:text-[#1A1A1A] hover:bg-[#FAF6F0] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className={adminLabelClass}>Article Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Direct 3D Printing on Architectural Plaster"
                className={adminInputClass}
              />
            </div>
            <div>
              <label className={adminLabelClass}>Category</label>
              <select
                value={form.categorySlug}
                onChange={(e) => {
                  const cat = BLOG_DRAFT_CATEGORIES.find(
                    (c) => c.slug === e.target.value
                  );
                  setForm({
                    ...form,
                    categorySlug: e.target.value,
                    categoryName: cat?.name || "Wall Art",
                  });
                }}
                className={adminSelectClass}
              >
                {BLOG_DRAFT_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <AdminImageUploadField
            label="Cover Editorial Image"
            value={form.imageUrl}
            onChange={(url) => setForm({ ...form, imageUrl: url })}
          />

          <div>
            <label className={adminLabelClass}>Excerpt / Deck</label>
            <textarea
              rows={2}
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              className={adminTextareaClass}
            />
          </div>

          <div>
            <label className={adminLabelClass}>
              Article Body (separate paragraphs with a blank line)
            </label>
            <textarea
              rows={6}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className={adminTextareaClass}
            />
          </div>

          <AdminRecordDetails value={form} onChange={details => setForm({ ...form, ...details })} gallery={false} />
          <AdminPublishingControls collection="blogs" id={form.id} route={`/blogs/${form.slug}`} onChange={loadBlogs} />
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
                <span>Publish Immediately</span>
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
                {saving ? "Saving…" : "Save Article"}
              </button>
            </div>
          </div>
        </form>
      ) : null}

      <div className={`${adminCardClass} divide-y divide-[#E8DED3] overflow-hidden`}>
        {blogs.map((b) => (
          <div
            key={b.id}
            className="p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between hover:bg-[#FAF6F0]/60 transition-colors"
          >
            <div className="flex items-center gap-4 min-w-0">
              <img
                src={b.coverImage.secureUrl}
                alt={b.title}
                loading="lazy"
                className="h-16 w-24 shrink-0 rounded-xl border border-[#DFD0C0] object-cover bg-[#F2EAE1]"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#1A1A1A] truncate">
                    {b.title}
                  </h2>
                  <AdminStatusBadge
                    tone={b.published ? "published" : "draft"}
                  >
                    {b.published ? "Published" : "Draft"}
                  </AdminStatusBadge>
                  {b.featured ? (
                    <AdminStatusBadge tone="featured">Featured</AdminStatusBadge>
                  ) : null}
                </div>
                <p className="mt-1 font-sans text-xs text-[#746B64] line-clamp-1">
                  {b.excerpt}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 font-sans text-[11px] text-[#746B64]">
                  <span className="font-medium text-[#9B1C1C]">
                    {b.categoryName}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 admin-tabular">
                    <Clock className="w-3 h-3" />
                    {b.readingTimeMinutes} min read
                  </span>
                  <span>•</span>
                  <span className="font-mono">/blogs/{b.slug}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/blogs/${b.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Open public article"
                aria-label={`Open ${b.title}`}
                className="p-2 rounded-xl border border-[#DFD0C0] bg-[#FFFDF9] text-[#746B64] hover:text-[#1A1A1A]"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                disabled={!authenticated}
                onClick={() => quickToggle(b, { featured: !b.featured })}
                aria-label="Toggle Featured"
                className={`p-2 rounded-xl border cursor-pointer disabled:opacity-40 ${
                  b.featured
                    ? "border-[#9B1C1C]/35 bg-[#9B1C1C]/10 text-[#9B1C1C]"
                    : "border-[#DFD0C0] bg-[#FAF6F0] text-[#746B64]"
                }`}
              >
                <Star className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                disabled={!authenticated}
                onClick={() => quickToggle(b, { published: !b.published })}
                aria-label="Toggle Visibility"
                className={`p-2 rounded-xl border cursor-pointer disabled:opacity-40 ${
                  b.published
                    ? "border-[#C9DBC9] bg-[#E9F0EA]/70 text-[#264E32]"
                    : "border-[#DFD0C0] bg-[#FAF6F0] text-[#746B64]"
                }`}
              >
                {b.published ? (
                  <Eye className="h-3.5 w-3.5" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                type="button"
                disabled={!authenticated}
                onClick={() => openEdit(b)}
                className={adminButtonClass("secondary", "sm")}
              >
                <Pencil className="h-3 w-3" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                disabled={!authenticated}
                onClick={() => setPendingDelete(b)}
                aria-label={`Delete ${b.title}`}
                className="p-2 rounded-xl border border-[#DFD0C0] bg-[#FFFDF9] text-[#9B1C1C] hover:bg-[#9B1C1C] hover:text-[#FFFDF9] cursor-pointer disabled:opacity-40"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AdminConfirmModal
        open={Boolean(pendingDelete)}
        title="Delete Journal Article"
        description={
          pendingDelete
            ? `Are you sure you want to delete "${pendingDelete.title}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete Article"
        busy={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
