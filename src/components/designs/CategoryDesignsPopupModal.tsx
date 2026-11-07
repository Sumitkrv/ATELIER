"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Box,
  ChevronLeft,
  ChevronRight,
  Eye,
  Layers,
  Sparkles,
  X,
} from "lucide-react";
import {
  type AtelierVaultCategoryItem,
  type CatalogueDesignItem,
} from "@/lib/designs-catalogue";

export interface CategoryDesignsPopupModalProps {
  category: AtelierVaultCategoryItem | null;
  categories: ReadonlyArray<AtelierVaultCategoryItem>;
  allDesigns: ReadonlyArray<CatalogueDesignItem>;
  onClose: () => void;
  onSelectCategory: (category: AtelierVaultCategoryItem) => void;
  onInspectDesign: (design: CatalogueDesignItem) => void;
  onPreviewOnWall: (design: CatalogueDesignItem) => void;
}

/**
 * Resolves published CMS/catalogue designs for the active category while
 * strictly deduplicating by ID, slug, and normalized title so accidental
 * duplicate entries never appear in the collection modal (Phase 6 & Phase 12).
 */
function buildCategoryPopupCards(
  category: AtelierVaultCategoryItem,
  allDesigns: ReadonlyArray<CatalogueDesignItem>
): CatalogueDesignItem[] {
  const directMatches = allDesigns.filter(
    (d) =>
      d.published &&
      (d.categorySlug.toLowerCase() === category.slug.toLowerCase() ||
        d.categoryId === category.id ||
        d.categorySlotNumber === category.slotNumber)
  );

  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const seenTitles = new Set<string>();
  const uniqueCards: CatalogueDesignItem[] = [];

  for (const item of directMatches) {
    const idKey = item.id.trim().toLowerCase();
    const slugKey = item.slug.trim().toLowerCase();
    const titleKey = item.title.trim().toLowerCase();

    if (
      seenIds.has(idKey) ||
      seenSlugs.has(slugKey) ||
      seenTitles.has(titleKey)
    ) {
      continue;
    }

    seenIds.add(idKey);
    seenSlugs.add(slugKey);
    seenTitles.add(titleKey);
    uniqueCards.push(item);
  }

  return uniqueCards.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function CategoryDesignsPopupModal({
  category,
  categories,
  allDesigns,
  onClose,
  onSelectCategory,
  onInspectDesign,
  onPreviewOnWall,
}: CategoryDesignsPopupModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const categoryStripRef = useRef<HTMLDivElement | null>(null);
  const chipRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const currentIdx = useMemo(() => {
    if (!category) return -1;
    return categories.findIndex((c) => c.slug === category.slug);
  }, [categories, category]);

  const handlePrevCategory = useCallback(() => {
    if (categories.length <= 1 || currentIdx < 0) return;
    const prevIdx = (currentIdx - 1 + categories.length) % categories.length;
    const target = categories[prevIdx];
    if (target) onSelectCategory(target);
  }, [categories, currentIdx, onSelectCategory]);

  const handleNextCategory = useCallback(() => {
    if (categories.length <= 1 || currentIdx < 0) return;
    const nextIdx = (currentIdx + 1) % categories.length;
    const target = categories[nextIdx];
    if (target) onSelectCategory(target);
  }, [categories, currentIdx, onSelectCategory]);

  const scrollCategoryStrip = useCallback((direction: -1 | 1) => {
    const strip = categoryStripRef.current;
    if (!strip) return;
    strip.scrollBy({
      left: direction * 240,
      behavior: "smooth",
    });
  }, []);

  // Auto-center active category chip inside the horizontal strip
  useEffect(() => {
    if (currentIdx < 0) return;
    const strip = categoryStripRef.current;
    const chip = chipRefs.current[currentIdx];
    if (!strip || !chip) return;
    const targetLeft =
      chip.offsetLeft - strip.clientWidth / 2 + chip.clientWidth / 2;
    strip.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: "smooth",
    });
  }, [currentIdx]);

  // Lock background scroll and restore focus when modal closes
  const isOpen = Boolean(category);
  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = window.setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 30);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = prevOverflow;
      if (
        previousFocusRef.current &&
        typeof previousFocusRef.current.focus === "function"
      ) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  // Escape key & Tab focus trapping
  useEffect(() => {
    if (!category) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not intercept keys if the higher-z-index DesignPreviewModal is open
      if (document.querySelector('[aria-labelledby="design-preview-modal-title"]')) {
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [category, onClose]);

  const popupCards = useMemo(() => {
    if (!category) return [];
    return buildCategoryPopupCards(category, allDesigns);
  }, [category, allDesigns]);

  if (!category) return null;

  const totalLabel = String(categories.length).padStart(2, "0");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-popup-modal-title"
      aria-describedby="category-popup-modal-desc"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[95] flex items-center justify-center bg-[#1A1A1A]/85 p-2.5 backdrop-blur-md sm:p-5 lg:p-6"
    >
      <div
        ref={modalRef}
        className="relative flex max-h-[92dvh] w-full max-w-[1220px] flex-col overflow-hidden rounded-2xl border border-[#E8E2D9]/20 bg-[#FAF9F6] text-[#1A1A1A] shadow-[0_32px_90px_-20px_rgba(0,0,0,0.85)] sm:rounded-3xl"
      >
        {/* Top Luxury Cream Studio Header */}
        <div className="border-b border-[#DDD2C5] bg-[#F7F3ED] px-5 py-5 text-[#211D1A] sm:px-8 sm:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#9B1C1C] px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#FAF9F6]">
                  <Sparkles className="h-3 w-3" />
                  <span>
                    CATEGORY {category.number} / {totalLabel}
                  </span>
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DDD2C5] bg-[#FBF8F3] px-3 py-1 text-[11px] font-medium text-[#211D1A]">
                  <Layers className="h-3 w-3 text-[#9B1C1C]" />
                  <span>
                    {popupCards.length}{" "}
                    {popupCards.length === 1
                      ? "Published Design"
                      : "Published Designs"}
                  </span>
                </span>

                {category.compatibleSurfaces.map((surface) => (
                  <span
                    key={surface}
                    className="rounded-full border border-[#DDD2C5] bg-[#F2EBE2] px-2.5 py-0.5 text-[10.5px] text-[#6F665E]"
                  >
                    {surface}
                  </span>
                ))}
              </div>

              <h2
                id="category-popup-modal-title"
                className="mt-3 font-serif text-2xl font-medium tracking-[-0.01em] text-[#211D1A] sm:text-3xl lg:text-4xl"
              >
                {category.title} Collection
              </h2>

              <p
                id="category-popup-modal-desc"
                className="mt-1.5 text-[13px] leading-relaxed text-[#6F665E] sm:text-sm"
              >
                {category.description}
              </p>
            </div>

            {/* Right Controls: Prev / Next Category + Close */}
            <div className="flex shrink-0 items-center justify-between gap-2.5 sm:justify-end">
              <div className="inline-flex items-center gap-1 rounded-full border border-[#DDD2C5] bg-[#FBF8F3] p-1">
                <button
                  type="button"
                  onClick={handlePrevCategory}
                  aria-label="Previous category"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#211D1A] transition-colors hover:bg-[#9B1C1C] hover:text-[#FAF9F6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-2.5 font-mono text-[11px] font-semibold tracking-[0.16em] text-[#211D1A]">
                  {category.number} / {totalLabel}
                </span>
                <button
                  type="button"
                  onClick={handleNextCategory}
                  aria-label="Next category"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#211D1A] transition-colors hover:bg-[#9B1C1C] hover:text-[#FAF9F6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                aria-label="Close category designs modal"
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#DDD2C5] bg-[#FBF8F3] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#211D1A] transition-colors hover:border-[#9B1C1C] hover:bg-[#9B1C1C] hover:text-[#FAF9F6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
              >
                <X className="h-4 w-4" />
                <span>Close</span>
              </button>
            </div>
          </div>

          {/* Horizontal 13-Category Switcher with Scroll Affordances & Edge Fades */}
          <div className="relative mt-4 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollCategoryStrip(-1)}
              aria-label="Scroll categories left"
              className="hidden h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#DDD2C5] bg-[#FBF8F3] text-[#6F665E] transition-colors hover:border-[#9B1C1C] hover:text-[#9B1C1C] sm:flex"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            <div className="relative min-w-0 flex-1">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 z-10 w-5 bg-gradient-to-r from-[#F7F3ED] to-transparent"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-0 z-10 w-5 bg-gradient-to-l from-[#F7F3ED] to-transparent"
              />
              <div
                ref={categoryStripRef}
                role="tablist"
                aria-label="Switch between the 13 Atelier design categories"
                className="flex items-center gap-1.5 overflow-x-auto px-2 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {categories.map((cat, idx) => {
                  const isCurrent = cat.slug === category.slug;
                  return (
                    <button
                      key={cat.id}
                      ref={(el) => {
                        chipRefs.current[idx] = el;
                      }}
                      type="button"
                      role="tab"
                      aria-selected={isCurrent}
                      onClick={() => onSelectCategory(cat)}
                      className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C] ${
                        isCurrent
                          ? "bg-[#9B1C1C] font-semibold text-[#FAF9F6] shadow-xs"
                          : "border border-[#DDD2C5] bg-[#FBF8F3] text-[#6F665E] hover:border-[#9B1C1C]/45 hover:text-[#211D1A]"
                      }`}
                    >
                      <span className="font-mono text-[9.5px] opacity-75">
                        {cat.number}
                      </span>
                      <span>{cat.shortTitle}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => scrollCategoryStrip(1)}
              aria-label="Scroll categories right"
              className="hidden h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#DDD2C5] bg-[#FBF8F3] text-[#6F665E] transition-colors hover:border-[#9B1C1C] hover:text-[#9B1C1C] sm:flex"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Popup Cards Grid Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 lg:p-8">
          {popupCards.length === 0 ? (
            <div className="rounded-2xl border border-[#E8E2D9] bg-white p-10 text-center">
              <p className="font-serif text-2xl text-[#1A1A1A]">
                New {category.title} editions are being curated
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-[#6F6862]">
                Contact our Mumbai studio to request custom {category.title}{" "}
                artwork samples calibrated for your space.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {popupCards.map((design) => (
                <article
                  key={design.id}
                  onClick={() => onInspectDesign(design)}
                  className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#E8E2D9] bg-white shadow-[0_10px_28px_-14px_rgba(26,26,26,0.1)] transition-all duration-300 hover:-translate-y-1 hover:border-[#9B1C1C]/45 hover:shadow-[0_20px_42px_-16px_rgba(26,26,26,0.18)]"
                >
                  {/* Card Artwork Image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#E8E2D9]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={design.coverImage.secureUrl}
                      alt={design.coverImage.altText}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fallback =
                          category.fallbackImage ||
                          "/images/atelier/hero-botanical-living.jpg";
                        if (target.src && !target.src.endsWith(fallback)) {
                          target.src = fallback;
                        }
                      }}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />

                    {/* Subtle hover inspect affordance */}
                    <span
                      aria-hidden="true"
                      className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#FAF9F6]/90 text-[#1A1A1A] shadow-sm transition-colors group-hover:bg-[#9B1C1C] group-hover:text-[#FAF9F6]"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {design.compatibleSurfaces.map((surface) => (
                          <span
                            key={surface}
                            className="rounded-md bg-[#F4EFE8] px-2 py-0.5 text-[10.5px] font-medium text-[#6F6862]"
                          >
                            {surface}
                          </span>
                        ))}
                      </div>

                      <h3 className="mt-2.5 font-serif text-[21px] font-semibold leading-snug text-[#1A1A1A] transition-colors group-hover:text-[#9B1C1C]">
                        {design.title}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[#6F6862]">
                        {design.summary}
                      </p>
                    </div>

                    {/* Card Action Buttons (pinned to bottom for uniform alignment) */}
                    <div className="mt-5 grid grid-cols-2 gap-2.5 border-t border-[#E8E2D9] pt-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onInspectDesign(design);
                        }}
                        className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#D9C8B5] bg-[#FAF9F6] px-3 py-2.5 text-xs font-semibold text-[#1A1A1A] transition-colors hover:border-[#9B1C1C] hover:text-[#9B1C1C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
                      >
                        <Eye className="h-3.5 w-3.5 text-[#9B1C1C]" />
                        <span>Full Details</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreviewOnWall(design);
                        }}
                        className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#9B1C1C] px-3 py-2.5 text-xs font-semibold text-[#FAF9F6] shadow-xs transition-colors hover:bg-[#7F1616] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
                      >
                        <Box className="h-3.5 w-3.5" />
                        <span>Wall Preview</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Bespoke Enquiry Footer */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-[#E8E2D9] bg-[#F2ECE3] px-5 py-4 sm:flex-row sm:px-8">
          <p className="text-center text-xs text-[#6F6862] sm:text-left sm:text-[13px]">
            Every{" "}
            <strong className="font-semibold text-[#1A1A1A]">
              {category.title}
            </strong>{" "}
            artwork is custom-scaled and calibrated for your exact architectural
            dimensions.
          </p>

          <Link
            href={`/contact?interest=${encodeURIComponent(
              `${category.title} Wall Art Collection`
            )}`}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#1A1A1A] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#FAF9F6] transition-colors hover:bg-[#9B1C1C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
          >
            <span>Enquire About {category.shortTitle}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
