"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  Layers,
  MoveHorizontal,
  RefreshCw,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import {
  ZoomSliderComp,
  type ZoomSliderControlHandle,
  type ZoomSliderItem,
} from "@/components/ui/zoom-slider";
import {
  ATELIER_ART_VAULT_CONTENT,
  type AtelierVaultCategoryItem,
} from "@/lib/designs-catalogue";
import { cn } from "@/lib/cn";

export interface CategoryExplorerControlsProps {
  activeIndex: number;
  totalCount: number;
  onPrev: () => void;
  onNext: () => void;
  activeCategorySlug: string;
  onResetCategory: () => void;
}

export function CategoryExplorerControls({
  activeIndex,
  totalCount,
  onPrev,
  onNext,
  activeCategorySlug,
  onResetCategory,
}: CategoryExplorerControlsProps) {
  const currentNumber = String(activeIndex + 1).padStart(2, "0");
  const totalNumber = String(totalCount).padStart(2, "0");
  const progressPct =
    totalCount > 0 ? Math.round(((activeIndex + 1) / totalCount) * 100) : 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 lg:justify-end">
      {/* Drag-to-explore instruction pill */}
      <div className="inline-flex items-center gap-2 rounded-full border border-[#DDD2C5] bg-[#FBF8F3] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[#6F665E] shadow-2xs">
        <MoveHorizontal className="h-3.5 w-3.5 text-[#9B1C1C]" />
        <span>{ATELIER_ART_VAULT_CONTENT.subheading}</span>
      </div>

      {/* Counter + Minimal Progress Line + Prev/Next Arrows */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-3">
          <span
            aria-label={`Category ${activeIndex + 1} of ${totalCount}`}
            className="font-mono text-xs font-semibold tracking-[0.2em] text-[#211D1A]"
          >
            {currentNumber} <span className="text-[#6F665E]/50">/</span>{" "}
            <span className="text-[#9B1C1C]">{totalNumber}</span>
          </span>

          <div
            aria-hidden="true"
            className="h-[2px] w-20 overflow-hidden rounded-full bg-[#DDD2C5] sm:w-28"
          >
            <div
              className="h-full bg-[#9B1C1C] transition-all duration-300 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous category in ZoomSlider"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#DDD2C5] bg-[#FBF8F3] text-[#211D1A] shadow-2xs transition-all duration-200 hover:border-[#9B1C1C] hover:bg-[#9B1C1C] hover:text-[#FAF9F6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next category in ZoomSlider"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#DDD2C5] bg-[#FBF8F3] text-[#211D1A] shadow-2xs transition-all duration-200 hover:border-[#9B1C1C] hover:bg-[#9B1C1C] hover:text-[#FAF9F6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {activeCategorySlug !== "all" && (
          <button
            type="button"
            onClick={onResetCategory}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#9B1C1C]/40 bg-[#F6EAE6] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9B1C1C] transition-colors hover:bg-[#9B1C1C] hover:text-[#FAF9F6]"
          >
            <RotateCcw className="h-3 w-3" />
            <span>All 13</span>
          </button>
        )}
      </div>
    </div>
  );
}

export interface CategoryActiveDetailsProps {
  category: AtelierVaultCategoryItem;
  totalCount: number;
  isCurrentlyFiltered: boolean;
  onViewDesigns: (category: AtelierVaultCategoryItem) => void;
  onShowAllDesigns: () => void;
}

export function CategoryActiveDetails({
  category,
  totalCount,
  isCurrentlyFiltered,
  onViewDesigns,
  onShowAllDesigns,
}: CategoryActiveDetailsProps) {
  const totalLabel = String(totalCount).padStart(2, "0");

  return (
    <div className="rounded-2xl border border-[#DDD2C5] bg-[#FBF8F3] p-5 shadow-[0_18px_45px_-20px_rgba(33,29,26,0.12)] sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Category Number, Title & Description */}
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#9B1C1C]/25 bg-[#F6EAE6] px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#9B1C1C]">
              <Sparkles className="h-3 w-3 text-[#9B1C1C]" />
              <span>
                CATEGORY {category.number} / {totalLabel}
              </span>
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DDD2C5] bg-[#F2EBE2] px-3 py-1 text-[11px] font-medium text-[#211D1A]">
              <Layers className="h-3 w-3 text-[#9B1C1C]" />
              <span>
                {category.artworkCount}{" "}
                {category.artworkCount === 1
                  ? "Published Design"
                  : "Published Designs"}
              </span>
            </span>

            {category.compatibleSurfaces.map((surface) => (
              <span
                key={surface}
                className="rounded-full border border-[#DDD2C5] bg-[#F7F3ED] px-2.5 py-0.5 text-[10.5px] text-[#6F665E]"
              >
                {surface}
              </span>
            ))}
          </div>

          <h3 className="mt-3 font-serif text-2xl font-medium tracking-[-0.01em] text-[#211D1A] sm:text-3xl">
            {category.title}
          </h3>

          <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#6F665E] sm:text-sm">
            {category.description}
          </p>
        </div>

        {/* Right: Primary VIEW DESIGNS Action */}
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onViewDesigns(category)}
            className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl bg-[#9B1C1C] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#FAF9F6] shadow-md transition-all duration-200 hover:bg-[#7F1616] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
          >
            <span>VIEW DESIGNS</span>
            <ArrowDownRight className="h-4 w-4" />
          </button>

          {isCurrentlyFiltered && (
            <button
              type="button"
              onClick={onShowAllDesigns}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#DDD2C5] bg-[#F2EBE2] px-4 py-3.5 text-xs font-medium text-[#211D1A] transition-colors hover:border-[#9B1C1C] hover:text-[#9B1C1C]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Show All 13 Categories</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export interface CategoryCatalogueBridgeProps {
  categories: ReadonlyArray<AtelierVaultCategoryItem>;
  focusedIndex: number;
  activeCategorySlug: string;
  onFocusAndFilterCategory: (
    category: AtelierVaultCategoryItem,
    index: number,
    scrollToCatalogue: boolean
  ) => void;
  onResetCategory: () => void;
}

export function CategoryCatalogueBridge({
  categories,
  focusedIndex,
  activeCategorySlug,
  onFocusAndFilterCategory,
  onResetCategory,
}: CategoryCatalogueBridgeProps) {
  const navRef = useRef<HTMLElement | null>(null);
  const chipRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Smoothly keep the active category chip centered inside the horizontal strip without scrolling the page vertically
  useEffect(() => {
    const navEl = navRef.current;
    const chipEl = chipRefs.current[focusedIndex];
    if (!navEl || !chipEl) return;
    const targetLeft =
      chipEl.offsetLeft - navEl.clientWidth / 2 + chipEl.clientWidth / 2;
    navEl.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: "smooth",
    });
  }, [focusedIndex]);

  return (
    <div className="relative mt-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-[#F7F3ED] to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-[#F7F3ED] to-transparent"
      />
      <nav
        ref={navRef}
        aria-label="13 Design Categories Quick Index"
        className="flex items-center gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <button
          type="button"
          onClick={onResetCategory}
          aria-pressed={activeCategorySlug === "all"}
          className={cn(
            "shrink-0 cursor-pointer rounded-full px-3.5 py-1.5 text-[11.5px] font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]",
            activeCategorySlug === "all"
              ? "bg-[#211D1A] text-[#FAF9F6] shadow-xs"
              : "border border-[#DDD2C5] bg-[#FBF8F3] text-[#6F665E] hover:border-[#9B1C1C]/45 hover:text-[#211D1A]"
          )}
        >
          All 13 Worlds
        </button>

        {categories.map((cat, idx) => {
          const isFiltered = activeCategorySlug === cat.slug;
          const isFocused = focusedIndex === idx;

          return (
            <button
              key={cat.id}
              ref={(el) => {
                chipRefs.current[idx] = el;
              }}
              type="button"
              onClick={() => onFocusAndFilterCategory(cat, idx, false)}
              onDoubleClick={() => onFocusAndFilterCategory(cat, idx, true)}
              aria-current={isFocused ? "true" : undefined}
              aria-pressed={isFiltered}
              className={cn(
                "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11.5px] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]",
                isFocused
                  ? "border border-[#9B1C1C] bg-[#9B1C1C] font-semibold text-[#FAF9F6] shadow-sm"
                  : isFiltered
                    ? "border border-[#9B1C1C]/50 bg-[#F6EAE6] font-medium text-[#9B1C1C]"
                    : "border border-[#DDD2C5] bg-[#FBF8F3] text-[#6F665E] hover:border-[#9B1C1C]/40 hover:text-[#211D1A]"
              )}
            >
              <span className="font-mono text-[10px] opacity-75">
                {cat.number}
              </span>
              <span>{cat.shortTitle}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export interface AtelierCategoryExplorerProps {
  categories: ReadonlyArray<AtelierVaultCategoryItem>;
  activeCategorySlug: string;
  onSelectCategorySlug: (
    slug: string,
    options?: { scrollToResults?: boolean }
  ) => void;
  isModalOpen?: boolean;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
}

export function AtelierCategoryExplorer({
  categories,
  activeCategorySlug,
  onSelectCategorySlug,
  isModalOpen = false,
  isLoading = false,
  errorMessage = null,
  onRetry,
}: AtelierCategoryExplorerProps) {
  const sliderRef = useRef<ZoomSliderControlHandle | null>(null);
  const categoriesRef = useRef<ReadonlyArray<AtelierVaultCategoryItem>>(categories);
  useEffect(() => {
    categoriesRef.current = categories;
  }, [categories]);

  const initialIndex = useMemo(() => {
    if (activeCategorySlug && activeCategorySlug !== "all") {
      const foundIdx = categories.findIndex(
        (c) => c.slug.toLowerCase() === activeCategorySlug.toLowerCase()
      );
      if (foundIdx >= 0) return foundIdx;
    }
    return 0;
  }, [activeCategorySlug, categories]);

  const [focusedIndex, setFocusedIndex] = useState<number>(initialIndex);
  const [prevExternalSlug, setPrevExternalSlug] =
    useState<string>(activeCategorySlug);

  if (activeCategorySlug !== prevExternalSlug) {
    setPrevExternalSlug(activeCategorySlug);
    if (activeCategorySlug !== "all") {
      const idx = categories.findIndex(
        (c) => c.slug.toLowerCase() === activeCategorySlug.toLowerCase()
      );
      if (idx >= 0) {
        setFocusedIndex(idx);
      }
    }
  }

  // Synchronize imperative slider position when activeCategorySlug changes externally (deep links, modal category switcher, or browser back/forward)
  useEffect(() => {
    if (activeCategorySlug && activeCategorySlug !== "all") {
      const idx = categoriesRef.current.findIndex(
        (c) => c.slug.toLowerCase() === activeCategorySlug.toLowerCase()
      );
      if (idx >= 0) {
        sliderRef.current?.goToIndex(idx);
      }
    }
  }, [activeCategorySlug]);

  const zoomSlides: ZoomSliderItem[] = useMemo(
    () =>
      categories.map((cat) => ({
        id: cat.id,
        slug: cat.slug,
        number: cat.number,
        src: cat.coverImage,
        fallbackSrc: cat.fallbackImage,
        alt: cat.altText,
        title: cat.title,
        desc: cat.description,
        slotNumber: cat.slotNumber,
        artworkCount: cat.artworkCount,
        compatibleSurfaces: cat.compatibleSurfaces,
      })),
    [categories]
  );

  const handleActiveIndexChange = useCallback(
    (index: number) => {
      setFocusedIndex(index);
    },
    []
  );

  const handleSlideClick = useCallback(
    (item: ZoomSliderItem, index: number) => {
      setFocusedIndex(index);
      if (item.slug) {
        onSelectCategorySlug(item.slug, { scrollToResults: true });
      }
    },
    [onSelectCategorySlug]
  );

  const handleResetCategory = useCallback(() => {
    onSelectCategorySlug("all", { scrollToResults: false });
  }, [onSelectCategorySlug]);

  return (
    <section
      id="atelier-art-vault"
      aria-labelledby="atelier-art-vault-heading"
      className="relative overflow-hidden border-b border-[#DDD2C5] bg-[#F7F3ED] py-10 text-[#211D1A] sm:py-13 lg:py-16"
    >
      {/* Subtle architectural radial warmth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-[#9B1C1C]/[0.05] blur-3xl"
      />

      <Container className="relative z-10">
        {/* Top Vault Editorial Header + Controls */}
        <div className="flex flex-col gap-5 border-b border-[#DDD2C5] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex flex-wrap items-center gap-3">
              <span className="h-[1.5px] w-7 bg-[#9B1C1C]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9B1C1C]">
                {ATELIER_ART_VAULT_CONTENT.eyebrow}
              </span>
              <span className="rounded-full border border-[#DDD2C5] bg-[#FBF8F3] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6F665E]">
                {ATELIER_ART_VAULT_CONTENT.vaultLabel}
              </span>
            </div>

            <h2
              id="atelier-art-vault-heading"
              className="mt-2.5 font-serif text-4xl font-medium leading-[1.06] tracking-[-0.02em] text-[#211D1A] sm:text-5xl lg:text-[3.35rem]"
            >
              {ATELIER_ART_VAULT_CONTENT.headline}
            </h2>

            <p className="mt-2.5 max-w-xl text-[14.5px] leading-relaxed text-[#6F665E] sm:text-[15px]">
              {ATELIER_ART_VAULT_CONTENT.supportingStatement}
            </p>
          </div>

          <CategoryExplorerControls
            activeIndex={focusedIndex}
            totalCount={categories.length}
            onPrev={() => sliderRef.current?.prev()}
            onNext={() => sliderRef.current?.next()}
            activeCategorySlug={activeCategorySlug}
            onResetCategory={handleResetCategory}
          />
        </div>

        {/* Optional CMS Sync Warning / Error Banner (Section 21) */}
        {errorMessage && (
          <div
            role="status"
            className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#9B1C1C]/35 bg-[#F6EAE6] px-4 py-3 text-xs text-[#211D1A]"
          >
            <span>{errorMessage}</span>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#DDD2C5] bg-[#FBF8F3] px-3 py-1 font-medium text-[#211D1A] hover:border-[#9B1C1C]"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}

        {/* Discrepancy note if fewer than 13 published categories are configured (Section 21) */}
        {!isLoading && categories.length > 0 && categories.length < 13 && (
          <div className="mt-4 rounded-xl border border-[#DDD2C5] bg-[#FBF8F3] px-4 py-2.5 text-xs text-[#6F665E]">
            Showing {categories.length} of 13 configured studio category slots
            currently marked active in CMS.
          </div>
        )}

        {/* Interactive 13-Category ZoomSlider Gallery */}
        <div className="mt-4">
          {isLoading ? (
            <div
              aria-busy="true"
              aria-label="Loading 13 Worlds of Wall Art gallery"
              className="flex h-[340px] w-full items-end gap-3 overflow-hidden rounded-2xl border border-[#DDD2C5] bg-[#F2EBE2] p-4 sm:h-[395px] lg:h-[450px]"
            >
              <div className="h-[25%] w-[8%] animate-pulse rounded-t-xl bg-[#DDD2C5]/60" />
              <div className="h-[45%] w-[15%] animate-pulse rounded-t-xl bg-[#DDD2C5]/70" />
              <div className="h-[68%] w-[26%] animate-pulse rounded-t-xl bg-[#DDD2C5]/80" />
              <div className="h-[82%] flex-1 animate-pulse rounded-t-xl bg-[#DDD2C5]" />
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-2xl border border-[#DDD2C5] bg-[#FBF8F3] p-12 text-center">
              <p className="font-serif text-2xl text-[#211D1A]">
                No published categories available
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-[#6F665E]">
                Categories can be configured and published from the Atelier CMS
                Category Registry.
              </p>
            </div>
          ) : (
            <ZoomSliderComp
              ref={sliderRef}
              sliderData={zoomSlides}
              title={ATELIER_ART_VAULT_CONTENT.headline}
              subheading={ATELIER_ART_VAULT_CONTENT.subheading}
              scaleOnHover
              textOnHover
              size={1}
              easeScrollPercentage={100}
              initialIndex={initialIndex}
              activeIndex={focusedIndex}
              selectedSlug={activeCategorySlug}
              autoPlay={!isModalOpen}
              autoPlayHoldMs={2000}
              inactivityResumeMs={3500}
              onActiveIndexChange={handleActiveIndexChange}
              onSelectItem={handleSlideClick}
            />
          )}
        </div>
      </Container>
    </section>
  );
}

export default AtelierCategoryExplorer;
