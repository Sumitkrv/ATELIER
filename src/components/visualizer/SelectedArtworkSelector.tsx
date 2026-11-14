"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { resolveArtworkSourcePixels } from "@/lib/artwork-source-crops";
import {
  CatalogueCategoryRecord,
  CatalogueDesignItem,
} from "@/lib/designs-catalogue";
import { cn } from "@/lib/cn";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  SquarePen,
  X,
} from "lucide-react";

interface ArtworkSwatchThumbnailProps {
  src: string;
  alt: string;
  className?: string;
}

export function ArtworkSwatchThumbnail({
  src,
  alt,
  className,
}: ArtworkSwatchThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const size = 160;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { sx, sy, sw, sh } = resolveArtworkSourcePixels(img);
      // Center-square crop within the resolved pure-artwork region
      const side = Math.min(sw, sh);
      const cx = sx + Math.round((sw - side) / 2);
      const cy = sy + Math.round((sh - side) / 2);
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, cx, cy, side, side, 0, 0, size, size);
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={alt}
      className={cn("block h-full w-full bg-[#EAE0D3] object-cover", className)}
    />
  );
}

interface CurrentlyPreviewingModuleProps {
  selectedDesign: CatalogueDesignItem;
  displayTitle: string;
  onOpenSelector: () => void;
}

export function CurrentlyPreviewingModule({
  selectedDesign,
  displayTitle,
  onOpenSelector,
}: CurrentlyPreviewingModuleProps) {
  const thumbSrc =
    selectedDesign.visualizerConfig.textureUrl ||
    selectedDesign.coverImage.secureUrl;

  return (
    <div className="flex items-center gap-3.5 sm:gap-4">
      <button
        type="button"
        onClick={onOpenSelector}
        aria-label={`Change currently previewing artwork (${displayTitle})`}
        className="h-15 w-15 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-[#DFD0C0] bg-[#EAE0D3] shadow-[0_6px_18px_rgba(32,24,18,0.08)] transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C] sm:h-16 sm:w-16"
      >
        <ArtworkSwatchThumbnail
          src={thumbSrc}
          alt={`${displayTitle} mural swatch`}
        />
      </button>

      <div className="min-w-0">
        <p className="font-sans text-xs font-medium text-[#746B64]">
          Currently Previewing
        </p>
        <p className="mt-0.5 truncate font-serif text-[19px] leading-tight font-normal text-[#1A1A1A] sm:text-[21px]">
          {displayTitle}
        </p>
        <button
          type="button"
          onClick={onOpenSelector}
          className="group mt-1 inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-[#9B1C1C] transition-colors hover:text-[#7D1616] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
        >
          <SquarePen className="h-3.5 w-3.5 shrink-0" />
          <span className="border-b border-[#9B1C1C]/45 pb-px group-hover:border-[#7D1616]">
            Change Artwork
          </span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

interface HorizontalSelectedArtworkBarProps {
  selectedDesign: CatalogueDesignItem;
  designs: ReadonlyArray<CatalogueDesignItem>;
  onSelectDesign: (design: CatalogueDesignItem) => void;
}

const FEATURED_PILL_ORDER = [
  "design-slot-1", // Botanical Canopy
  "design-slot-3", // Terracotta Wave Relief
  "design-slot-4", // Arch Series – Limestone
  "design-slot-7", // Mountain Silhouette
  "design-slot-8", // Lotus Atelier Study
  "design-slot-2", // Geometric Harmony
];

export function HorizontalSelectedArtworkBar({
  selectedDesign,
  designs,
  onSelectDesign,
}: HorizontalSelectedArtworkBarProps) {
  const scrollListRef = useRef<HTMLDivElement | null>(null);
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Order actual published designs so the signature 6 lead naturally, followed by all other published records
  const orderedDesigns = useMemo(() => {
    const priorityMap = new Map(
      FEATURED_PILL_ORDER.map((id, index) => [id, index])
    );
    return [...designs].sort((a, b) => {
      const pa = priorityMap.get(a.id);
      const pb = priorityMap.get(b.id);
      if (pa !== undefined && pb !== undefined) return pa - pb;
      if (pa !== undefined) return -1;
      if (pb !== undefined) return 1;
      return a.sortOrder - b.sortOrder;
    });
  }, [designs]);

  const activeIndex = useMemo(
    () => orderedDesigns.findIndex((d) => d.id === selectedDesign.id),
    [orderedDesigns, selectedDesign.id]
  );

  // Keep selected artwork pill scrolled into view inside the horizontal strip only
  useEffect(() => {
    const container = scrollListRef.current;
    const activeEl = pillRefs.current[selectedDesign.id];
    if (!container || !activeEl) return;
    if (activeIndex <= 0) {
      container.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    const targetLeft =
      activeEl.offsetLeft -
      container.clientWidth / 2 +
      activeEl.clientWidth / 2;
    container.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: "smooth",
    });
  }, [activeIndex, selectedDesign.id]);

  const handleStepSelection = (delta: -1 | 1) => {
    if (orderedDesigns.length === 0) return;
    const current = activeIndex >= 0 ? activeIndex : 0;
    const nextIdx =
      (current + delta + orderedDesigns.length) % orderedDesigns.length;
    onSelectDesign(orderedDesigns[nextIdx]);
  };

  return (
    <section
      aria-label="Selected Artwork Quick Selector"
      className="bg-[#FAF6F0] pt-2 pb-10 sm:pb-12"
    >
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-6 xl:px-10">
        <div className="flex items-center gap-3 rounded-2xl border border-[#E5D9CA] bg-[#FFFDF9] px-3.5 py-2.5 shadow-[0_10px_30px_rgba(32,24,18,0.05)] sm:gap-4 sm:px-5 sm:py-3">
          {/* Left Label */}
          <div className="flex shrink-0 items-center gap-2">
            <Sparkles
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-[#9B1C1C]"
            />
            <span className="hidden font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1A1A1A] sm:inline">
              SELECTED ARTWORK:
            </span>
            <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1A1A1A] sm:hidden">
              ARTWORK:
            </span>
          </div>

          {/* Middle Horizontally Scrollable Published Designs */}
          <div
            ref={scrollListRef}
            role="listbox"
            aria-label="Published ATELIER artworks"
            className="relative flex min-w-0 flex-1 items-center gap-2 overflow-x-auto scroll-smooth py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {orderedDesigns.map((design) => {
              const isSelected = design.id === selectedDesign.id;
              return (
                <button
                  key={design.id}
                  ref={(el) => {
                    pillRefs.current[design.id] = el;
                  }}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => onSelectDesign(design)}
                  className={cn(
                    "shrink-0 cursor-pointer rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]",
                    isSelected
                      ? "bg-[#9B1C1C] font-semibold text-[#FFFDF9] shadow-[0_6px_16px_rgba(155,28,28,0.22)]"
                      : "border border-[#E5D9CA] bg-[#F7F2EA] text-[#2A231F] hover:border-[#9B1C1C] hover:text-[#9B1C1C]"
                  )}
                >
                  {design.title}
                </button>
              );
            })}
          </div>

          {/* Right Previous / Next Controls */}
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleStepSelection(-1)}
              aria-label="Select previous artwork"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#E5D9CA] bg-[#FAF6F0] text-[#2A231F] transition-colors hover:border-[#9B1C1C] hover:text-[#9B1C1C] focus-visible:outline-2 focus-visible:outline-[#9B1C1C]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleStepSelection(1)}
              aria-label="Select next artwork"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#E5D9CA] bg-[#FAF6F0] text-[#2A231F] transition-colors hover:border-[#9B1C1C] hover:text-[#9B1C1C] focus-visible:outline-2 focus-visible:outline-[#9B1C1C]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

interface SelectedArtworkSelectorModalProps {
  isOpen: boolean;
  selectedDesign: CatalogueDesignItem;
  categories: ReadonlyArray<CatalogueCategoryRecord>;
  designs: ReadonlyArray<CatalogueDesignItem>;
  onSelectDesign: (design: CatalogueDesignItem) => void;
  onClose: () => void;
}

export function SelectedArtworkSelectorModal({
  isOpen,
  selectedDesign,
  categories,
  designs,
  onSelectDesign,
  onClose,
}: SelectedArtworkSelectorModalProps) {
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 30);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  const filteredDesigns = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return designs.filter((item) => {
      const matchesCategory =
        activeCategorySlug === "all" ||
        item.categoryId === activeCategorySlug ||
        `cat-${String(item.categorySlotNumber).padStart(2, "0")}` ===
          activeCategorySlug;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q) ||
        item.compatibleSurfaces.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [activeCategorySlug, designs, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose ATELIER Artwork to Visualize"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[95] flex items-center justify-center bg-[#1A1614]/65 p-3 backdrop-blur-xs sm:p-6"
    >
      <div className="flex max-h-[88dvh] w-full max-w-[980px] flex-col overflow-hidden rounded-2xl bg-[#FAF6F0] text-[#1A1A1A] shadow-[0_28px_68px_rgba(24,18,14,0.32)]">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5D9CA] bg-[#FFFDF9] px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-serif text-2xl font-normal text-[#1A1A1A] sm:text-[28px]">
              Select Artwork to Preview
            </h2>
            <p className="text-xs text-[#746B64]">
              Browse {designs.length} published artworks across all{" "}
              {categories.length} ATELIER design categories.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close artwork selector"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#DFD0C0] bg-[#FAF6F0] px-3.5 py-1.5 text-xs font-medium text-[#1A1A1A] transition-colors hover:border-[#9B1C1C] hover:text-[#9B1C1C] focus-visible:outline-2 focus-visible:outline-[#9B1C1C]"
          >
            <X className="h-4 w-4" />
            <span>Close</span>
          </button>
        </div>

        {/* Search & 13-Category Filter Bar */}
        <div className="border-b border-[#E5D9CA] bg-[#FAF6F0] px-5 py-3.5 sm:px-6">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#746B64]" />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by artwork title, category, or printable surface…"
              className="w-full rounded-xl border border-[#DFD0C0] bg-[#FFFDF9] py-2.5 pr-4 pl-10 text-sm text-[#1A1A1A] placeholder:text-[#746B64] focus:border-[#9B1C1C] focus:outline-none"
            />
          </div>

          <div
            role="tablist"
            aria-label="Filter designs by category"
            className="mt-3 flex gap-1.5 overflow-x-auto pb-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeCategorySlug === "all"}
              onClick={() => setActiveCategorySlug("all")}
              className={cn(
                "shrink-0 cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                activeCategorySlug === "all"
                  ? "bg-[#9B1C1C] text-[#FFFDF9]"
                  : "border border-[#DFD0C0] bg-[#FFFDF9] text-[#2A231F] hover:border-[#9B1C1C]"
              )}
            >
              All ({designs.length})
            </button>

            {categories.map((cat) => {
              const catCode = `cat-${String(cat.slotNumber).padStart(2, "0")}`;
              const isSelected =
                activeCategorySlug === cat.id || activeCategorySlug === catCode;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveCategorySlug(cat.id)}
                  className={cn(
                    "shrink-0 cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                    isSelected
                      ? "bg-[#9B1C1C] text-[#FFFDF9]"
                      : "border border-[#DFD0C0] bg-[#FFFDF9] text-[#2A231F] hover:border-[#9B1C1C]"
                  )}
                >
                  {cat.shortTitle || cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Designs Grid */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {filteredDesigns.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-serif text-xl text-[#1A1A1A]">
                No matching designs found
              </p>
              <p className="mt-1 text-xs text-[#746B64]">
                Clear your search filter or choose another ATELIER category.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategorySlug("all");
                }}
                className="mt-4 cursor-pointer rounded-full bg-[#9B1C1C] px-4 py-2 text-xs font-medium text-[#FFFDF9]"
              >
                Show All Artworks
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDesigns.map((design) => {
                const isCurrent = design.id === selectedDesign.id;
                const imgUrl =
                  design.visualizerConfig.textureUrl ||
                  design.coverImage.secureUrl;
                return (
                  <button
                    key={design.id}
                    type="button"
                    onClick={() => {
                      onSelectDesign(design);
                      onClose();
                    }}
                    className={cn(
                      "group flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-[#FFFDF9] text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]",
                      isCurrent
                        ? "border-[#9B1C1C] ring-1 ring-[#9B1C1C]"
                        : "border-[#E3D6C7] hover:border-[#9B1C1C]"
                    )}
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EAE0D3]">
                      <ArtworkSwatchThumbnail
                        src={imgUrl}
                        alt={design.title}
                        className="transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      {isCurrent && (
                        <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-[#9B1C1C] px-2.5 py-0.5 text-[10px] font-semibold text-[#FFFDF9]">
                          <Check className="h-3 w-3" />
                          <span>Selected</span>
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-between p-3.5">
                      <div>
                        <p className="text-[11px] font-medium text-[#9B1C1C]">
                          {design.categoryLabel}
                        </p>
                        <h3 className="mt-0.5 font-serif text-lg leading-snug font-normal text-[#1A1A1A]">
                          {design.title}
                        </h3>
                      </div>
                      <p className="mt-2 truncate text-[11px] text-[#746B64]">
                        {design.compatibleSurfaces.slice(0, 3).join(" • ")}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
