"use client";

import * as React from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  ArrowRight,
  ArrowUpRight,
  Eye,
  Layers,
  MapPin,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/cn";
import type { PortfolioProjectRecord } from "@/lib/projects-catalogue";
import type { MediaAssetRef } from "@/types/models";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export type ArchitecturalAspectVariant =
  | "portrait"
  | "square"
  | "landscape"
  | "widescreen";

export interface ScrollPortraitProjectItem {
  id: string;
  title: string;
  slug: string;
  featuredImage: string;
  imageAlt: string;
  surfaceId: string;
  surfaceType: string;
  projectType: string;
  spaceCategory?: string;
  shortDescription: string;
  locationNote: string;
  galleryImages: ReadonlyArray<MediaAssetRef>;
  isPublished: boolean;
  isFeatured: boolean;
  projectStatus: string;
  aspectVariant: ArchitecturalAspectVariant;
  rawProject: PortfolioProjectRecord;
}

export interface ScrollPortraitWallProps {
  /** Primary sticky center gallery heading (rendered on two sculptural lines by default). */
  titleLine1?: string;
  titleLine2?: string;
  /** Subtitle line below the sticky center heading. */
  subtitle?: string;
  /** Scroll cue displayed at the top of the gallery that fades as the visitor scrolls. */
  hint?: string;
  /** Typed architectural project items to scatter across the gallery wall. */
  projects: ReadonlyArray<ScrollPortraitProjectItem>;
  /** Desired column count on desktop screens (auto-adapts to 2 on tablet and 1 on mobile). */
  columns?: number;
  /** Currently active surface filter label for live status badge. */
  activeSurfaceLabel?: string;
  /** Callback when the user clicks the quick-view gallery plates button on a project card. */
  onOpenProjectMedia?: (project: PortfolioProjectRecord) => void;
  /** Callback to reset filters when the filtered state is empty. */
  onResetFilters?: () => void;
  /** Whether to render the gallery ending transition block at the bottom of the wall. */
  showEndingTransition?: boolean;
  className?: string;
}

const ASPECT_CYCLE: ReadonlyArray<ArchitecturalAspectVariant> = [
  "landscape",
  "portrait",
  "widescreen",
  "square",
  "portrait",
  "landscape",
];

const ASPECT_CLASS_MAP: Record<ArchitecturalAspectVariant, string> = {
  portrait: "aspect-[4/5]",
  square: "aspect-square",
  landscape: "aspect-[4/3]",
  widescreen: "aspect-[16/10]",
};

/**
 * Adapts a canonical CMS/catalogue `PortfolioProjectRecord` into the typed
 * `ScrollPortraitProjectItem` model used by `ScrollPortraitWall`.
 */
export function mapPortfolioProjectToWallItem(
  project: PortfolioProjectRecord,
  index: number
): ScrollPortraitProjectItem {
  const cover = project.coverImage;
  let aspectVariant: ArchitecturalAspectVariant =
    ASPECT_CYCLE[index % ASPECT_CYCLE.length];

  if (cover && cover.width && cover.height) {
    const ratio = cover.width / cover.height;
    if (ratio >= 1.55 && index % 2 === 0) {
      aspectVariant = "widescreen";
    } else if (ratio < 0.95) {
      aspectVariant = "portrait";
    }
  }

  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    featuredImage: cover?.secureUrl || "/images/atelier/artwork-lotus-atelier.jpg",
    imageAlt:
      cover?.altText ||
      `${project.title} — ${project.surfaceName} architectural study by ATELIER — WALL STORY`,
    surfaceId: project.surfaceId,
    surfaceType: project.surfaceName,
    projectType: project.projectType,
    spaceCategory: project.spaceCategory,
    shortDescription: project.summary,
    locationNote: project.locationNote,
    galleryImages: project.galleryMedia,
    isPublished: project.published,
    isFeatured: project.featured,
    projectStatus: project.recordClassification || "Studio Surface Study",
    aspectVariant,
    rawProject: project,
  };
}

/**
 * Deterministic asymmetric placement so SSR and client renders match (zero Math.random):
 * Distributes projects across rows with intentional negative space so each architectural
 * photograph hangs like a distinct artwork in an exhibition.
 */
function buildLayout(count: number, cols: number): number[][] {
  if (count <= 0) return [];
  if (cols <= 1) {
    return Array.from({ length: count }, (_, idx) => [idx]);
  }

  // Single filtered project on multi-column screen: place in first column of a balanced row
  if (count === 1) {
    const singleRow = new Array<number>(cols).fill(-1);
    singleRow[0] = 0;
    return [singleRow];
  }

  const rows: number[][] = [];
  let i = 0;
  let r = 0;

  while (i < count) {
    const row = new Array<number>(cols).fill(-1);
    const a = (r * 2 + (r % 2)) % cols;
    row[a] = i++;

    // Every third row holds a second artwork in an asymmetric companion column
    if (r % 3 === 0 && i < count && cols >= 2) {
      let b = (a + 2) % cols;
      if (b === a) b = (a + 1) % cols;
      row[b] = i++;
    }

    rows.push(row);
    r++;
  }

  return rows;
}

/**
 * Responsive column count hook.
 * Starts from `desired` so SSR markup matches initial client hydration,
 * then updates cleanly on viewport changes.
 */
function useResponsiveColumns(desired: number): {
  cols: number;
  isMobile: boolean;
} {
  const [cols, setCols] = React.useState(desired);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const sm = window.matchMedia("(min-width: 640px)");
    const lg = window.matchMedia("(min-width: 1024px)");

    const update = () => {
      if (lg.matches) {
        setCols(desired);
        setIsMobile(false);
      } else if (sm.matches) {
        setCols(Math.min(desired, 2));
        setIsMobile(false);
      } else {
        setCols(1);
        setIsMobile(true);
      }
    };

    update();
    sm.addEventListener("change", update);
    lg.addEventListener("change", update);
    return () => {
      sm.removeEventListener("change", update);
      lg.removeEventListener("change", update);
    };
  }, [desired]);

  return { cols, isMobile };
}

export function ScrollPortraitWall({
  titleLine1 = "THE WALLS",
  titleLine2 = "WE TRANSFORM",
  subtitle = "ARCHITECTURAL ART • CURATED SURFACES • ATELIER WALL STORY",
  hint = "SCROLL TO EXPLORE",
  projects,
  columns = 3,
  activeSurfaceLabel = "All Surfaces",
  onOpenProjectMedia,
  onResetFilters,
  showEndingTransition = true,
  className,
}: ScrollPortraitWallProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const galleryTrackRef = React.useRef<HTMLDivElement | null>(null);
  const hintRef = React.useRef<HTMLDivElement | null>(null);

  const [activeProjectIndex, setActiveProjectIndex] = React.useState(0);
  const [failedImageIds, setFailedImageIds] = React.useState<
    Record<string, boolean>
  >({});

  const { cols, isMobile } = useResponsiveColumns(Math.max(1, columns));

  const layout = React.useMemo(
    () => buildLayout(projects.length, cols),
    [projects.length, cols]
  );

  // Stable key representing current filtered project set so GSAP recalculates cleanly on filter changes
  const projectsFilterKey = React.useMemo(
    () => projects.map((p) => p.id).join("|"),
    [projects]
  );

  // Clamp active project index when filter reduces project count
  const safeActiveIndex =
    projects.length > 0
      ? Math.min(activeProjectIndex, projects.length - 1)
      : 0;
  const activeProject = projects[safeActiveIndex] ?? projects[0] ?? null;

  useGSAP(
    () => {
      const rootEl = rootRef.current;
      if (!rootEl || projects.length === 0) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const items = gsap.utils.toArray<HTMLElement>(".spw-item", rootEl);

      if (reduceMotion) {
        gsap.set(items, { scale: 1, autoAlpha: 1, clearProps: "transform" });
        if (hintRef.current) {
          gsap.set(hintRef.current, { autoAlpha: 1 });
        }
        return;
      }

      // 1. Fade out the scroll hint as the visitor scrolls into the gallery wall
      if (hintRef.current) {
        gsap.fromTo(
          hintRef.current,
          { autoAlpha: 1, y: 0 },
          {
            autoAlpha: 0,
            y: -18,
            ease: "none",
            scrollTrigger: {
              trigger: rootEl,
              start: "top 65%",
              end: "+=320",
              scrub: true,
            },
          }
        );
      }

      // 2. Mobile viewport (< 640px): gentle editorial reveal without trapping or hiding cards
      if (isMobile) {
        items.forEach((el) => {
          const itemIdxAttr = el.getAttribute("data-project-index");
          const parsedIdx = itemIdxAttr ? parseInt(itemIdxAttr, 10) : 0;

          gsap.fromTo(
            el,
            { scale: 0.94, autoAlpha: 0.35, y: 20 },
            {
              scale: 1,
              autoAlpha: 1,
              y: 0,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 92%",
                end: "top 55%",
                scrub: 0.4,
                onEnter: () => setActiveProjectIndex(parsedIdx),
                onEnterBack: () => setActiveProjectIndex(parsedIdx),
              },
            }
          );
        });

        ScrollTrigger.refresh();
        return;
      }

      // 3. Desktop & Tablet (>= 640px): Signature ScrollPortraitWall scrub animation
      // Each architectural project scales up from its deterministic transform origin
      // as it approaches the viewport, peaks near the center, and scales down as it exits.
      items.forEach((el) => {
        const itemIdxAttr = el.getAttribute("data-project-index");
        const parsedIdx = itemIdxAttr ? parseInt(itemIdxAttr, 10) : 0;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top bottom+=8%",
            end: "bottom top-=4%",
            scrub: 0.55,
            onToggle: (self) => {
              if (self.isActive) {
                setActiveProjectIndex(parsedIdx);
              }
            },
          },
        });

        tl.fromTo(
          el,
          { scale: 0.14, autoAlpha: 0.18 },
          {
            scale: 1,
            autoAlpha: 1,
            ease: "power2.out",
            duration: 0.44,
          }
        )
          .to(el, {
            scale: 1,
            autoAlpha: 1,
            ease: "none",
            duration: 0.16,
          })
          .to(el, {
            scale: 0.12,
            autoAlpha: 0.08,
            ease: "power2.in",
            duration: 0.4,
          });
      });

      ScrollTrigger.refresh();
    },
    {
      scope: rootRef,
      dependencies: [cols, isMobile, projectsFilterKey],
      revertOnUpdate: true,
    }
  );

  const handleImageError = React.useCallback((id: string) => {
    setFailedImageIds((prev) => ({ ...prev, [id]: true }));
  }, []);

  const handleImageLoad = React.useCallback(() => {
    ScrollTrigger.refresh();
  }, []);

  // Tasteful Empty State when no projects match the selected filter combination
  if (projects.length === 0) {
    return (
      <div
        ref={rootRef}
        className={cn(
          "mt-10 rounded-2xl border border-[#DED5CB] bg-[#FAF9F6] p-12 text-center shadow-2xs",
          className
        )}
      >
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#9B1C1C]/25 bg-[#F8F3ED] text-[#9B1C1C]">
          <Layers className="h-5 w-5" />
        </div>
        <h3 className="mt-4 font-serif text-2xl font-semibold text-[#1A1A1A] sm:text-3xl">
          No Architectural Studies Match This Filter
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#6E655E]">
          Reset the surface or space filter to explore all curated ATELIER —
          WALL STORY architectural surface studies.
        </p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#9B1C1C] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#FAF9F6] transition-colors hover:bg-[#7F1616]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Surface Filters</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      aria-label={`${titleLine1} ${titleLine2} — Architectural Portfolio Gallery`}
      className={cn(
        "relative mt-8 w-full overflow-x-clip rounded-3xl border border-[#DED5CB]/80 bg-[#FAF9F6] text-[#1A1A1A] shadow-[0_24px_60px_-28px_rgba(26,26,26,0.12)]",
        className
      )}
    >
      {/* Subtle Architectural Gallery Grid Hairlines & Warm Vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
      >
        <div
          className="absolute inset-0 opacity-75"
          style={{
            background:
              "radial-gradient(circle at 50% 35%, rgba(250, 249, 246, 0.96) 0%, rgba(232, 226, 217, 0.55) 100%)",
          }}
        />
        <div className="absolute inset-y-0 left-1/4 hidden w-px bg-[#1A1A1A]/[0.04] lg:block" />
        <div className="absolute inset-y-0 left-1/2 hidden w-px bg-[#1A1A1A]/[0.05] lg:block" />
        <div className="absolute inset-y-0 left-3/4 hidden w-px bg-[#1A1A1A]/[0.04] lg:block" />
      </div>

      {/* =====================================================================
          SCOPED SCROLL REGION: STICKY CENTER TYPOGRAPHY + SCATTERED WALL
      ===================================================================== */}
      <div
        ref={galleryTrackRef}
        className="relative px-4 pt-10 pb-12 sm:px-8 sm:pt-14 sm:pb-20 lg:px-12"
      >
        {/* Top Gallery Exhibition Bar (Surface Status + Live Counter) */}
        <div className="relative z-30 mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#1A1A1A]/10 pb-4 text-xs">
          <div className="inline-flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-[#9B1C1C]" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9B1C1C]">
              THE LIVING GALLERY • {activeSurfaceLabel.toUpperCase()}
            </span>
          </div>

          {/* Live Project Counter Indicator (Section 12: "01 / 06" + Active Project Name) */}
          {activeProject && (
            <div
              aria-live="polite"
              className="inline-flex items-center gap-3 rounded-full border border-[#1A1A1A]/12 bg-[#FAF9F6]/90 px-3.5 py-1.5 backdrop-blur-xs"
            >
              <span className="font-mono text-[11px] font-bold tracking-[0.18em] text-[#9B1C1C]">
                {String(safeActiveIndex + 1).padStart(2, "0")} /{" "}
                {String(projects.length).padStart(2, "0")}
              </span>
              <span aria-hidden="true" className="h-3 w-px bg-[#1A1A1A]/15" />
              <span className="max-w-[220px] truncate font-serif text-xs font-medium text-[#1A1A1A] sm:max-w-[320px]">
                {activeProject.title}
              </span>
              <span className="hidden rounded-sm bg-[#E8E2D9] px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-[#1A1A1A] sm:inline-block">
                {activeProject.surfaceType}
              </span>
            </div>
          )}
        </div>

        {/* Sticky Center Typography ("THE WALLS WE TRANSFORM")
            Remains centered inside the gallery scroll region without overlapping the navbar */}
        <div className="pointer-events-none sticky top-[calc(var(--header-height,74px)+18vh)] z-20 mx-auto flex max-w-4xl flex-col items-center py-4 text-center select-none">
          <h3 className="font-serif text-4xl font-semibold leading-[0.94] tracking-[-0.02em] text-[#1A1A1A] drop-shadow-[0_2px_18px_rgba(250,249,246,0.92)] sm:text-6xl md:text-7xl lg:text-[5.5rem]">
            <span className="block">{titleLine1}</span>
            <span className="mt-1 block italic font-normal text-[#1A1A1A]">
              {titleLine2}
            </span>
          </h3>

          <p className="mt-4 rounded-full border border-[#1A1A1A]/15 bg-[#FAF9F6]/92 px-4 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#1A1A1A] shadow-2xs backdrop-blur-xs sm:text-[11px]">
            {subtitle}
          </p>

          {/* Scroll Hint that Fades Away on Scroll */}
          <div
            ref={hintRef}
            className="mt-4 flex flex-col items-center gap-2 text-center"
          >
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.26em] text-[#9B1C1C]">
              {hint}
            </span>
            <span
              aria-hidden="true"
              className="h-8 w-px bg-gradient-to-b from-[#9B1C1C] to-transparent"
            />
          </div>
        </div>

        {/* ===================================================================
            THE SCATTERED ARCHITECTURAL PROJECT WALL
        =================================================================== */}
        <div
          className={cn(
            "relative z-10",
            isMobile
              ? "mt-6 mb-8 space-y-8"
              : "mt-4 mb-[12vh] space-y-12 lg:space-y-16"
          )}
        >
          {layout.map((row, rowIndex) => (
            <div
              key={`spw-row-${rowIndex}`}
              className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10"
            >
              {row.map((projectIdx, colIndex) => {
                // Intentionally empty architectural breathing cell on tablet/desktop
                if (projectIdx === -1) {
                  return (
                    <div
                      key={`empty-${rowIndex}-${colIndex}`}
                      aria-hidden="true"
                      className="hidden min-h-[260px] sm:block"
                    />
                  );
                }

                const project = projects[projectIdx];
                if (!project) return null;

                // Deterministic transform origin matching ScrollPortraitWall
                const origin =
                  colIndex < cols / 2 ? "right bottom" : "left bottom";
                const aspectClass =
                  ASPECT_CLASS_MAP[project.aspectVariant] || "aspect-[4/3]";
                const hasFailedImage = Boolean(failedImageIds[project.id]);

                // Vertical stagger offset on desktop so companion items in the same row feel organically hung
                const verticalOffsetClass =
                  !isMobile && colIndex % 2 === 1 ? "sm:mt-16 lg:mt-24" : "";

                return (
                  <div
                    key={project.id}
                    className={cn(" flex flex-col", verticalOffsetClass)}
                  >
                    <article
                      data-project-index={projectIdx}
                      style={{ transformOrigin: origin }}
                      className="spw-item group relative flex flex-col will-change-transform"
                    >
                      {/* Main Architectural Artwork Frame */}
                      <div
                        className={cn(
                          "relative w-full overflow-hidden rounded-xl border border-[#1A1A1A]/15 bg-[#1A1A1A] shadow-[0_22px_48px_-18px_rgba(26,26,26,0.32)] transition-shadow duration-500 group-hover:shadow-[0_28px_60px_-16px_rgba(155,28,28,0.28)]",
                          aspectClass
                        )}
                      >
                        <Link
                          href={`/projects/${project.slug}`}
                          aria-label={`${project.title} — ${project.surfaceType} (${project.projectStatus}). View project details.`}
                          className="relative block h-full w-full focus-visible:outline-none"
                        >
                          {hasFailedImage ? (
                            /* Deliberate Branded Fallback State (Section 10) */
                            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#231917] via-[#1A1A1A] to-[#3B1316] p-6 text-center text-[#FAF9F6]">
                              <Sparkles className="h-7 w-7 text-[#9B1C1C]" />
                              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#E8E2D9]/80">
                                {project.surfaceType} • {project.projectStatus}
                              </p>
                              <p className="mt-1.5 font-serif text-xl font-medium text-[#FAF9F6]">
                                {project.title}
                              </p>
                            </div>
                          ) : (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={project.featuredImage}
                              alt={project.imageAlt}
                              loading={projectIdx < 2 ? "eager" : "lazy"}
                              decoding="async"
                              draggable={false}
                              onLoad={handleImageLoad}
                              onError={() => handleImageError(project.id)}
                              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-focus-within:scale-105"
                            />
                          )}

                          {/* Top Surface & Classification Pill */}
                          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 bg-gradient-to-b from-[#1A1A1A]/75 via-[#1A1A1A]/25 to-transparent p-4">
                            <span className="inline-flex items-center gap-1.5 rounded-sm bg-[#9B1C1C] px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FAF9F6] shadow-2xs">
                              {project.surfaceType}
                            </span>

                            <span className="rounded-sm border border-white/20 bg-[#1A1A1A]/65 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#E8E2D9] backdrop-blur-xs">
                              {project.projectStatus}
                            </span>
                          </div>

                          {/* Desktop Hover & Keyboard Focus Overlay (Section 07) */}
                          <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#1A1A1A]/95 via-[#1A1A1A]/50 to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 sm:p-6">
                            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E8E2D9]/85">
                              {project.surfaceType.toUpperCase()} •{" "}
                              {project.projectStatus.toUpperCase()}
                            </p>

                            <div className="mt-1.5 flex items-end justify-between gap-3">
                              <div>
                                <h4 className="font-serif text-2xl font-medium leading-tight text-[#FAF9F6]">
                                  {project.title}
                                </h4>
                                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#E8E2D9]/80">
                                  {project.shortDescription}
                                </p>
                              </div>

                              {/* Circular Arrow Indicator */}
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#FAF9F6]/35 bg-[#9B1C1C] text-[#FAF9F6] shadow-md transition-transform duration-300 group-hover:scale-105">
                                <ArrowUpRight className="h-4 w-4" />
                              </span>
                            </div>

                            <div className="mt-3 flex items-center justify-between border-t border-white/15 pt-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FAF9F6]">
                              <span>VIEW PROJECT ↗</span>
                              <span className="inline-flex items-center gap-1 text-[#E8E2D9]/75">
                                <MapPin className="h-3 w-3 text-[#9B1C1C]" />
                                {project.locationNote}
                              </span>
                            </div>
                          </div>
                        </Link>

                        {/* Optional Quick-Inspect Plates Trigger */}
                        {onOpenProjectMedia &&
                          project.galleryImages.length > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenProjectMedia(project.rawProject);
                              }}
                              aria-label={`Inspect ${project.galleryImages.length} gallery plates for ${project.title}`}
                              className="absolute right-3 bottom-3 z-20 inline-flex cursor-pointer items-center gap-1.5 rounded-sm border border-white/25 bg-[#1A1A1A]/75 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[#FAF9F6] backdrop-blur-xs transition-colors hover:border-[#9B1C1C] hover:bg-[#9B1C1C] focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                            >
                              <Eye className="h-3 w-3" />
                              <span>{project.galleryImages.length} Plates</span>
                            </button>
                          )}
                      </div>

                      {/* Persistent Exhibition Placard Beneath Frame (Discoverable on Touch & Desktop) */}
                      <div className="mt-3 flex items-start justify-between gap-3 border-b border-[#1A1A1A]/12 pb-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9B1C1C]">
                            <span>
                              {String(projectIdx + 1).padStart(2, "0")}
                            </span>
                            <span>•</span>
                            <span>{project.surfaceType}</span>
                            <span className="text-[#1A1A1A]/45">•</span>
                            <span className="text-[#1A1A1A]/65">
                              {project.projectStatus}
                            </span>
                          </div>
                          <Link
                            href={`/projects/${project.slug}`}
                            className="mt-1 block truncate font-serif text-xl font-semibold text-[#1A1A1A] transition-colors hover:text-[#9B1C1C]"
                          >
                            {project.title}
                          </Link>
                        </div>

                        <Link
                          href={`/projects/${project.slug}`}
                          aria-label={`Open ${project.title}`}
                          className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-full border border-[#1A1A1A]/20 bg-[#E8E2D9]/65 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1A1A1A] transition-colors hover:border-[#9B1C1C] hover:bg-[#9B1C1C] hover:text-[#FAF9F6]"
                        >
                          <span>VIEW PROJECT</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================================
          SECTION 13 — GALLERY ENDING TRANSITION
          ("EVERY SURFACE HOLDS A POSSIBILITY.")
      ===================================================================== */}
      {showEndingTransition && (
        <div className="relative z-30 border-t border-[#1A1A1A]/12 bg-[#E8E2D9]/65 px-6 py-14 text-center sm:px-10 sm:py-18">
          <div className="mx-auto max-w-2xl">
            <div className="inline-flex items-center gap-2.5">
              <span aria-hidden="true" className="h-[1.5px] w-6 bg-[#9B1C1C]" />
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.24em] text-[#9B1C1C]">
                ATELIER WALL STORY • ARCHITECTURAL EXHIBITION
              </span>
              <span aria-hidden="true" className="h-[1.5px] w-6 bg-[#9B1C1C]" />
            </div>

            <h3 className="mt-4 font-serif text-3xl font-semibold tracking-[-0.01em] text-[#1A1A1A] sm:text-4xl lg:text-[2.75rem]">
              EVERY SURFACE HOLDS A POSSIBILITY.
            </h3>

            <p className="mx-auto mt-3.5 max-w-xl text-sm leading-relaxed text-[#1A1A1A]/75 sm:text-base">
              Discover how artwork, material, and architecture come together to
              create expressive spaces.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/explore-designs"
                className="inline-flex items-center gap-2 rounded-lg bg-[#9B1C1C] px-6 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#FAF9F6] shadow-sm transition-colors hover:bg-[#7F1616]"
              >
                <span>EXPLORE DESIGNS</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg border border-[#1A1A1A]/25 bg-[#FAF9F6] px-6 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#1A1A1A] transition-colors hover:border-[#9B1C1C] hover:text-[#9B1C1C]"
              >
                <span>DISCUSS YOUR PROJECT</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScrollPortraitWall;
