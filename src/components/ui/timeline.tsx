"use client";
/* eslint-disable @next/next/no-img-element */

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ArrowUpRight, Compass, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onStoreChange: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(REDUCED_MOTION_QUERY).matches === true;
}

function getServerReducedMotionSnapshot(): boolean {
  return false;
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot
  );
}

export interface TimelineItem {
  id: string;
  stageNumber: string;
  title: string;
  subtitle: string;
  description: string;
  studioLabel: string;
  imageUrl: string;
  imageAlt: string;
  position?: "top" | "bottom";
  ctaLabel?: string;
  ctaHref?: string;
}

export interface TimelineProps {
  title?: string;
  periodLabel?: string;
  textColor?: string;
  mutedTextColor?: string;
  activeColor?: string;
  backgroundColor?: string;
  imageUrl?: string;
  imageAlt?: string;
  duration?: number;
  scrollDuration?: number;
  items?: ReadonlyArray<TimelineItem>;
  onActiveStageChange?: (index: number) => void;
  className?: string;
}

export const ATELIER_PROCESS_TIMELINE_ITEMS: ReadonlyArray<TimelineItem> = [
  {
    id: "stage-01-consultation",
    stageNumber: "01",
    title: "Consultation",
    subtitle: "Understanding Your Space",
    description:
      "We begin by understanding your space, preferred printing surface, dimensions, aesthetic direction, and creative vision.",
    studioLabel: "STUDIO BRIEF & SURFACE ASSESSMENT",
    imageUrl: "/images/atelier/process-stage-01-consultation.jpg",
    imageAlt:
      "Atelier consultation desk with material swatches, travertine, ceramic tile, plywood samples, and elevation notes",
    position: "top",
  },
  {
    id: "stage-02-exploration",
    stageNumber: "02",
    title: "Design Exploration",
    subtitle: "Finding Your Artistic Direction",
    description:
      "Explore our curated design catalogue or discuss a bespoke artwork created around your architectural space.",
    studioLabel: "13 CURATED WORLDS & BESPOKE ART",
    imageUrl: "/images/atelier/about-story-sketchbook.jpg",
    imageAlt:
      "Open linen-bound artist sketchbook on honed travertine showing botanical and terracotta wall mural studies",
    position: "bottom",
    ctaLabel: "EXPLORE DESIGNS",
    ctaHref: "/explore-designs",
  },
  {
    id: "stage-03-customization",
    stageNumber: "03",
    title: "Customization & Wall Preview",
    subtitle: "See Your Vision Take Shape",
    description:
      "Refine the artwork's scale, composition, colors, and placement. Preview selected designs on your own wall before proceeding.",
    studioLabel: "PROPORTIONING & LIVE WALL PREVIEW",
    imageUrl: "/images/atelier/wall-preview-after.jpg",
    imageAlt:
      "Live wall preview showing a custom-proportioned botanical mural mapped onto a sunlit living room elevation",
    position: "top",
    ctaLabel: "PREVIEW ON YOUR WALL",
    ctaHref: "/visualizer",
  },
  {
    id: "stage-04-approval",
    stageNumber: "04",
    title: "Design Approval",
    subtitle: "Perfecting Every Detail",
    description:
      "Review the final artwork composition, positioning, and surface preparation requirements before execution.",
    studioLabel: "FINAL ELEVATION PROOF & SIGN-OFF",
    imageUrl: "/images/atelier/process-stage-04-approval.jpg",
    imageAlt:
      "Final architectural design approval sheet with mural scale proof, pigment swatches, and brass ruler",
    position: "bottom",
  },
  {
    id: "stage-05-printing",
    stageNumber: "05",
    title: "On-Site 3D Printing",
    subtitle: "Your Wall Story Comes to Life",
    description:
      "Once the artwork and surface are ready, our team prints the design directly onto the selected architectural surface.",
    studioLabel: "DIRECT-TO-SURFACE EXECUTION",
    imageUrl: "/images/atelier/process-stage-05-execution.jpg",
    imageAlt:
      "Completed direct-to-surface 3D architectural wall mural in a sunlit double-height interior space",
    position: "top",
  },
];

// Scroll windows (start%, end%) calibrated for 5 sequential milestones across the horizontal scroll
const FIVE_STAGE_WINDOWS: ReadonlyArray<readonly [number, number]> = [
  [3, 22],
  [19, 40],
  [36, 58],
  [53, 75],
  [70, 92],
];

export function Timeline({
  title = "From Vision to Wall.",
  periodLabel = "FIVE CONSIDERED STAGES — ONE SEAMLESS CREATIVE JOURNEY",
  textColor = "#FAF9F6",
  mutedTextColor = "rgba(232, 226, 217, 0.76)",
  activeColor = "#9B1C1C",
  backgroundColor = "#1A1A1A",
  imageUrl = "/images/atelier/process-hero-sculptural-arch.jpg",
  imageAlt = "Sculptural curved lime-plaster archway framing a luxury interior wall mural by Atelier Wall Story",
  duration,
  scrollDuration = 1.2,
  items = ATELIER_PROCESS_TIMELINE_ITEMS,
  onActiveStageChange,
  className,
}: TimelineProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const animDuration = Math.max(0.2, duration ?? scrollDuration);

  const [activeStageIdx, setActiveStageIdx] = useState<number>(0);
  const activeStageIdxRef = useRef<number>(0);
  const onActiveStageChangeRef = useRef(onActiveStageChange);
  useEffect(() => {
    onActiveStageChangeRef.current = onActiveStageChange;
  }, [onActiveStageChange]);

  const milestones = useMemo(
    () => (items && items.length > 0 ? items : ATELIER_PROCESS_TIMELINE_ITEMS),
    [items]
  );

  // GSAP ScrollTrigger Horizontal Track + Extending Crimson Progress Line + SplitText Stem/Title/Description Reveals
  useIsomorphicLayoutEffect(() => {
    const sectionEl = sectionRef.current;
    const viewportEl = viewportRef.current;
    const trackEl = trackRef.current;
    if (!sectionEl || !viewportEl || !trackEl) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // DESKTOP & TABLET (>= 768px): Sticky Horizontal ScrollTrigger Journey
      mm.add("(min-width: 768px)", () => {
        const getTravelDistance = () =>
          Math.max(0, trackEl.scrollWidth - viewportEl.clientWidth + 48);

        // 1. Horizontal track movement proportional to vertical scroll
        gsap.fromTo(
          trackEl,
          { x: 0 },
          {
            x: () => -getTravelDistance(),
            ease: "none",
            scrollTrigger: {
              trigger: sectionEl,
              start: "top top+=74",
              end: "bottom bottom",
              scrub: 0.6,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const count = milestones.length;
                const nextIdx = Math.min(
                  count - 1,
                  Math.max(0, Math.floor(self.progress * count))
                );
                if (nextIdx !== activeStageIdxRef.current) {
                  activeStageIdxRef.current = nextIdx;
                  setActiveStageIdx(nextIdx);
                  onActiveStageChangeRef.current?.(nextIdx);
                }
              },
            },
          }
        );

        // 2. Central crimson progress line extension
        if (prefersReducedMotion) {
          gsap.set(".journey-line", { width: "100%" });
        } else {
          gsap.fromTo(
            ".journey-line",
            { width: "0%" },
            {
              width: "100%",
              ease: "none",
              scrollTrigger: {
                trigger: sectionEl,
                start: "top top+=120",
                end: "92% bottom",
                scrub: 0.5,
              },
            }
          );
        }

        // 3. Per-milestone stems (.jl-*), dots (.jd-*), SplitText titles/descriptions, and 3D media cards
        if (prefersReducedMotion) {
          milestones.forEach((item) => {
            gsap.set(`.jl-${item.id}`, { scaleY: 1 });
            gsap.set(`.jd-${item.id}`, { scale: 1 });
            gsap.set(`.title-${item.id}`, {
              opacity: 1,
              clearProps: "transform",
            });
            gsap.set(`.description-${item.id}`, {
              opacity: 1,
              clearProps: "transform",
            });
            gsap.set(`.media-${item.id}`, {
              opacity: 1,
              clearProps: "transform",
            });
          });
          return;
        }

        const titleSplits: Record<string, SplitText> = {};
        const descSplits: Record<string, SplitText> = {};

        milestones.forEach((item, idx) => {
          const isUpper = (item.position ?? (idx % 2 === 0 ? "top" : "bottom")) === "top";
          gsap.set(`.jl-${item.id}`, {
            scaleY: 0,
            transformOrigin: isUpper ? "bottom bottom" : "top top",
          });
          gsap.set(`.jd-${item.id}`, { scale: 0 });
          gsap.set(`.title-${item.id}`, { opacity: 1 });
          gsap.set(`.description-${item.id}`, { opacity: 1 });
          gsap.set(`.media-${item.id}`, {
            opacity: 0.18,
            y: isUpper ? -14 : 14,
            scale: 0.95,
          });

          titleSplits[item.id] = new SplitText(`.title-${item.id}`, {
            type: " words, lines",
            mask: "lines",
          });
          descSplits[item.id] = new SplitText(`.description-${item.id}`, {
            type: "words, lines",
            mask: "lines",
          });

          const windowPair =
            FIVE_STAGE_WINDOWS[idx] ?? [
              Math.round((idx / milestones.length) * 80) + 4,
              Math.round(((idx + 1) / milestones.length) * 85) + 8,
            ];
          const [startPct, endPct] = windowPair;

          const titleLines = titleSplits[item.id]?.lines || [];
          const descLines = descSplits[item.id]?.lines || [];

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: sectionEl,
              start: `${startPct}% 45%`,
              end: `${endPct}% 55%`,
              scrub: true,
            },
          });

          tl.to(`.jl-${item.id}`, {
            scaleY: 1,
            duration: animDuration * 0.4,
          })
            .to(
              `.jd-${item.id}`,
              {
                scale: 1,
                duration: animDuration * 0.4,
              },
              "<"
            )
            .fromTo(
              titleLines,
              { y: 100 },
              {
                y: 0,
                delay: -0.8 * animDuration,
                duration: animDuration,
                stagger: 0.02,
                ease: "power2.out",
              }
            )
            .fromTo(
              descLines,
              { y: 100 },
              {
                y: 0,
                duration: animDuration,
                stagger: 0.02,
                ease: "power2.out",
              },
              "<"
            )
            .to(
              `.media-${item.id}`,
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: animDuration * 0.85,
                ease: "power2.out",
              },
              "<"
            );
        });

        return () => {
          Object.values(titleSplits).forEach((split) => split?.revert());
          Object.values(descSplits).forEach((split) => split?.revert());
        };
      });

      // MOBILE (< 768px): Clean scroll-triggered reveal on each vertical milestone without 800vw horizontal overflow
      mm.add("(max-width: 767px)", () => {
        gsap.set(trackEl, { clearProps: "transform" });
        if (prefersReducedMotion) return;

        milestones.forEach((item, idx) => {
          gsap.fromTo(
            `.mobile-stage-${item.id}`,
            { opacity: 0.25, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: "power2.out",
              scrollTrigger: {
                trigger: `.mobile-stage-${item.id}`,
                start: "top 85%",
                end: "top 45%",
                scrub: true,
                onEnter: () => {
                  activeStageIdxRef.current = idx;
                  setActiveStageIdx(idx);
                  onActiveStageChangeRef.current?.(idx);
                },
              },
            }
          );
        });
      });
    }, sectionEl);

    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      ctx.revert();
    };
  }, [animDuration, milestones, prefersReducedMotion]);

  const scrollToStagePercentage = (idx: number) => {
    const sectionEl = sectionRef.current;
    if (!sectionEl || typeof window === "undefined") return;

    if (window.innerWidth < 768) {
      const mobileCard = sectionEl.querySelector(
        `.mobile-stage-${milestones[idx]?.id}`
      );
      mobileCard?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const rect = sectionEl.getBoundingClientRect();
    const sectionTop = window.scrollY + rect.top - 74;
    const scrollableDistance = Math.max(
      0,
      sectionEl.offsetHeight - window.innerHeight
    );
    const ratio =
      milestones.length > 1 ? idx / (milestones.length - 1) : 0;
    const targetY = sectionTop + scrollableDistance * (0.08 + ratio * 0.82);
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      id="journey"
      aria-label="From Vision to Wall — 5-Stage Architectural Process Timeline"
      className={cn(
        "relative w-full md:h-[320vh] lg:h-[340vh]",
        className
      )}
      style={{ color: textColor, backgroundColor }}
    >
      {/* ===================================================================
          DESKTOP & TABLET STICKY HORIZONTAL TIMELINE STAGE (>= 768px)
          =================================================================== */}
      <div
        ref={viewportRef}
        className="sticky top-[var(--header-height,74px)] hidden h-[calc(100vh-var(--header-height,74px))] min-h-[620px] w-full flex-col justify-between overflow-hidden md:flex"
      >
        {/* Subtle Architectural Studio Ambient Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-[#9B1C1C]/12 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-10 bottom-0 h-80 w-80 rounded-full bg-[#E8E2D9]/[0.04] blur-3xl"
        />

        {/* Top Sticky Status Bar inside the Pinned Viewport */}
        <div className="relative z-20 flex items-center justify-between border-b border-[#E8E2D9]/12 px-8 py-4 lg:px-14">
          <div className="flex items-center gap-3">
            <span className="h-[1.5px] w-7 bg-[#9B1C1C]" />
            <span className="text-[11px] font-semibold tracking-[0.22em] text-[#D89B8C] uppercase">
              {periodLabel}
            </span>
          </div>

          {/* Interactive 01..05 Stage Jump Pills */}
          <div className="flex items-center gap-2">
            {milestones.map((item, idx) => {
              const isCurrent = idx === activeStageIdx;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToStagePercentage(idx)}
                  aria-label={`Jump to Stage ${item.stageNumber}: ${item.title}`}
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-[11px] transition-all",
                    isCurrent
                      ? "bg-[#9B1C1C] font-semibold text-[#FAF9F6] shadow-sm"
                      : "border border-[#E8E2D9]/15 bg-[#FAF9F6]/[0.04] text-[#E8E2D9]/70 hover:border-[#E8E2D9]/35 hover:text-[#FAF9F6]"
                  )}
                >
                  <span className="font-mono text-[10px]">
                    {item.stageNumber}
                  </span>
                  <span className="hidden xl:inline">{item.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Horizontal Scrolling Composition */}
        <div className="relative flex flex-1 items-center overflow-hidden">
          <div
            ref={trackRef}
            className="flex h-[540px] w-max items-center gap-12 px-8 lg:h-[580px] lg:gap-16 lg:px-14"
            style={{ willChange: "transform" }}
          >
            {/* Left Lead Editorial & Architectural Frame */}
            <div className="flex h-full w-[520px] shrink-0 items-center gap-8 lg:w-[600px]">
              {/* Framed Studio Arch Visual with Subtle 3D Depth */}
              <div className="group relative h-[84%] w-[260px] shrink-0 overflow-hidden rounded-2xl border border-[#E8E2D9]/20 bg-[#120E0D] shadow-[0_24px_60px_rgba(0,0,0,0.65)] lg:w-[300px]">
                <img
                  src={imageUrl}
                  alt={imageAlt}
                  draggable={false}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-4 bottom-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E8E2D9]/25 bg-black/55 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-[#E8E2D9] uppercase backdrop-blur-xs">
                    <Sparkles className="h-3 w-3 text-[#9B1C1C]" />
                    <span>THE ATELIER JOURNEY</span>
                  </span>
                </div>
              </div>

              {/* Lead Title above & Period Label below */}
              <div className="flex h-full flex-1 flex-col justify-between py-8">
                <div>
                  <span className="font-mono text-[11px] font-semibold tracking-[0.22em] text-[#D89B8C] uppercase">
                    01 — 05 SEQUENCE
                  </span>
                  <h2 className="mt-3 font-serif text-4xl leading-[1.02] font-normal tracking-[-0.02em] text-[#FAF9F6] lg:text-5xl">
                    {title}
                  </h2>
                </div>

                <div className="border-l-2 border-[#9B1C1C] pl-4">
                  <p
                    className="text-xs leading-relaxed tracking-[0.06em] uppercase"
                    style={{ color: mutedTextColor }}
                  >
                    Scroll to follow each stage from initial studio consultation
                    to on-site 3D printing.
                  </p>
                </div>
              </div>
            </div>

            {/* Five-Stage Alternating Horizontal Track */}
            <div className="relative h-full w-[2150px] shrink-0 lg:w-[2450px]">
              {/* Central Horizontal Crimson Progress Axis */}
              <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 items-center">
                <div
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: activeColor }}
                />
                <div className="relative h-[2px] flex-1 bg-[#E8E2D9]/15">
                  <div
                    className="journey-line h-full w-0 rounded-full shadow-[0_0_16px_rgba(155,28,28,0.85)]"
                    style={{ backgroundColor: activeColor }}
                  />
                </div>
                <div
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: activeColor }}
                />
              </div>

              {/* 5 Milestone Columns (Alternating Upper & Lower Rows) */}
              <div className="grid h-full w-full grid-cols-5">
                {milestones.map((item, idx) => {
                  const isUpper =
                    (item.position ?? (idx % 2 === 0 ? "top" : "bottom")) ===
                    "top";
                  const isActive = idx === activeStageIdx;

                  return (
                    <div
                      key={item.id}
                      className="relative h-full px-5 lg:px-7"
                    >
                      {isUpper ? (
                        /* UPPER MILESTONE (01, 03, 05) — sits in top 50%, stem grows UP from central axis */
                        <div className="relative flex h-1/2 w-full flex-col justify-between pb-6 pl-5">
                          {/* Vertical Stem & Milestone Dot on Left Edge */}
                          <div className="pointer-events-none absolute top-2 bottom-0 left-0 flex flex-col items-center">
                            <div
                              className={cn(
                                `jd-${item.id} h-3.5 w-3.5 shrink-0 rounded-full ring-4 ring-[#1A1A1A]`
                              )}
                              style={{ backgroundColor: activeColor }}
                            />
                            <div
                              className={`jl-${item.id} w-[1.5px] flex-1 origin-bottom rounded-full`}
                              style={{ backgroundColor: activeColor }}
                            />
                          </div>

                          {/* Top Editorial Content + Layered Stage Photograph */}
                          <div className="flex flex-col gap-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="inline-flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.2em] text-[#D89B8C] uppercase">
                                <span
                                  className={cn(
                                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-[#FAF9F6]",
                                    isActive
                                      ? "bg-[#9B1C1C]"
                                      : "border border-[#E8E2D9]/25 bg-[#FAF9F6]/10"
                                  )}
                                >
                                  {item.stageNumber}
                                </span>
                                <span>{item.studioLabel}</span>
                              </span>
                            </div>

                            <div className="grid grid-cols-12 items-start gap-4">
                              <div className="col-span-7">
                                <h3
                                  className={`title-${item.id} font-serif text-2xl leading-[1.08] font-medium text-[#FAF9F6] lg:text-[28px]`}
                                >
                                  {item.title}
                                </h3>
                                <p className="mt-1 text-[11px] font-semibold tracking-[0.16em] text-[#D89B8C] uppercase">
                                  {item.subtitle}
                                </p>
                                <p
                                  className={`description-${item.id} mt-2 text-[13px] leading-[1.52]`}
                                  style={{ color: mutedTextColor }}
                                >
                                  {item.description}
                                </p>

                                {item.ctaLabel && item.ctaHref && (
                                  <div className="mt-3">
                                    <Link
                                      href={item.ctaHref}
                                      className="inline-flex items-center gap-1.5 rounded-full border border-[#9B1C1C] bg-[#9B1C1C]/20 px-3.5 py-1.5 text-[10.5px] font-semibold tracking-[0.16em] text-[#FAF9F6] uppercase transition-all hover:bg-[#9B1C1C]"
                                    >
                                      <span>{item.ctaLabel}</span>
                                      <ArrowUpRight className="h-3.5 w-3.5" />
                                    </Link>
                                  </div>
                                )}
                              </div>

                              {/* Stage-Specific 3D Framed Image */}
                              <div
                                className={`media-${item.id} col-span-5 overflow-hidden rounded-xl border border-[#E8E2D9]/20 bg-[#120E0D] shadow-[0_16px_36px_rgba(0,0,0,0.55)]`}
                              >
                                <div className="aspect-[4/3] w-full overflow-hidden">
                                  <img
                                    src={item.imageUrl}
                                    alt={item.imageAlt}
                                    draggable={false}
                                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* LOWER MILESTONE (02, 04) — sits in bottom 50%, stem grows DOWN from central axis */
                        <div className="relative mt-[270px] flex h-1/2 w-full flex-col justify-end pt-6 pl-5 lg:mt-[290px]">
                          {/* Vertical Stem & Milestone Dot on Left Edge */}
                          <div className="pointer-events-none absolute top-0 bottom-2 left-0 flex flex-col items-center">
                            <div
                              className={`jl-${item.id} w-[1.5px] flex-1 origin-top rounded-full`}
                              style={{ backgroundColor: activeColor }}
                            />
                            <div
                              className={cn(
                                `jd-${item.id} h-3.5 w-3.5 shrink-0 rounded-full ring-4 ring-[#1A1A1A]`
                              )}
                              style={{ backgroundColor: activeColor }}
                            />
                          </div>

                          {/* Bottom Editorial Content + Layered Stage Photograph */}
                          <div className="flex flex-col gap-2.5 pb-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="inline-flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.2em] text-[#D89B8C] uppercase">
                                <span
                                  className={cn(
                                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-[#FAF9F6]",
                                    isActive
                                      ? "bg-[#9B1C1C]"
                                      : "border border-[#E8E2D9]/25 bg-[#FAF9F6]/10"
                                  )}
                                >
                                  {item.stageNumber}
                                </span>
                                <span>{item.studioLabel}</span>
                              </span>
                            </div>

                            <div className="grid grid-cols-12 items-start gap-4">
                              <div className="col-span-7">
                                <h3
                                  className={`title-${item.id} font-serif text-2xl leading-[1.08] font-medium text-[#FAF9F6] lg:text-[28px]`}
                                >
                                  {item.title}
                                </h3>
                                <p className="mt-1 text-[11px] font-semibold tracking-[0.16em] text-[#D89B8C] uppercase">
                                  {item.subtitle}
                                </p>
                                <p
                                  className={`description-${item.id} mt-2 text-[13px] leading-[1.52]`}
                                  style={{ color: mutedTextColor }}
                                >
                                  {item.description}
                                </p>

                                {item.ctaLabel && item.ctaHref && (
                                  <div className="mt-3">
                                    <Link
                                      href={item.ctaHref}
                                      className="inline-flex items-center gap-1.5 rounded-full border border-[#9B1C1C] bg-[#9B1C1C]/20 px-3.5 py-1.5 text-[10.5px] font-semibold tracking-[0.16em] text-[#FAF9F6] uppercase transition-all hover:bg-[#9B1C1C]"
                                    >
                                      <span>{item.ctaLabel}</span>
                                      <ArrowUpRight className="h-3.5 w-3.5" />
                                    </Link>
                                  </div>
                                )}
                              </div>

                              {/* Stage-Specific 3D Framed Image */}
                              <div
                                className={`media-${item.id} col-span-5 overflow-hidden rounded-xl border border-[#E8E2D9]/20 bg-[#120E0D] shadow-[0_16px_36px_rgba(0,0,0,0.55)]`}
                              >
                                <div className="aspect-[4/3] w-full overflow-hidden">
                                  <img
                                    src={item.imageUrl}
                                    alt={item.imageAlt}
                                    draggable={false}
                                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Progress Footer Bar inside Pinned Viewport */}
        <div className="relative z-20 flex items-center justify-between border-t border-[#E8E2D9]/12 px-8 py-3.5 text-xs text-[#E8E2D9]/70 lg:px-14">
          <div className="flex items-center gap-2.5">
            <Compass className="h-3.5 w-3.5 text-[#9B1C1C]" />
            <span>
              Active Milestone:{" "}
              <strong className="font-semibold text-[#FAF9F6]">
                {milestones[activeStageIdx]?.stageNumber} —{" "}
                {milestones[activeStageIdx]?.title}
              </strong>
            </span>
          </div>
          <span className="font-mono text-[11px] tracking-[0.18em] text-[#D89B8C] uppercase">
            STAGE 0{activeStageIdx + 1} / 0{milestones.length}
          </span>
        </div>
      </div>

      {/* ===================================================================
          MOBILE RESPONSIVE TIMELINE EXPERIENCE (< 768px) — Zero 800vw Overflow
          =================================================================== */}
      <div className="px-5 py-12 sm:px-8 md:hidden">
        <div className="border-b border-[#E8E2D9]/15 pb-6">
          <div className="flex items-center gap-2.5">
            <span className="h-[1.5px] w-6 bg-[#9B1C1C]" />
            <span className="text-[10.5px] font-semibold tracking-[0.2em] text-[#D89B8C] uppercase">
              {periodLabel}
            </span>
          </div>
          <h2 className="mt-2.5 font-serif text-3xl font-normal text-[#FAF9F6]">
            {title}
          </h2>
        </div>

        <div className="relative mt-8 space-y-8 before:absolute before:top-2 before:bottom-2 before:left-3.5 before:w-[2px] before:bg-[#9B1C1C]/60">
          {milestones.map((item) => (
            <div
              key={`mobile-${item.id}`}
              className={`mobile-stage-${item.id} relative pl-10`}
            >
              {/* Crimson Node Dot */}
              <div
                className="absolute top-1.5 left-1.5 h-4 w-4 rounded-full ring-4 ring-[#1A1A1A]"
                style={{ backgroundColor: activeColor }}
              />

              <div className="rounded-2xl border border-[#E8E2D9]/15 bg-[#221C1A] p-4 shadow-lg">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10.5px] font-bold tracking-[0.18em] text-[#D89B8C] uppercase">
                    {item.stageNumber} • {item.studioLabel}
                  </span>
                </div>

                <h3 className="mt-2 font-serif text-2xl font-medium text-[#FAF9F6]">
                  {item.title}
                </h3>
                <p className="mt-0.5 text-[11px] font-semibold tracking-[0.15em] text-[#D89B8C] uppercase">
                  {item.subtitle}
                </p>
                <p
                  className="mt-2 text-[13.5px] leading-relaxed"
                  style={{ color: mutedTextColor }}
                >
                  {item.description}
                </p>

                <div className="mt-3.5 overflow-hidden rounded-xl border border-[#E8E2D9]/15">
                  <img
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    className="aspect-[16/10] w-full object-cover"
                  />
                </div>

                {item.ctaLabel && item.ctaHref && (
                  <div className="mt-4">
                    <Link
                      href={item.ctaHref}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#9B1C1C] px-4 py-2 text-[11px] font-semibold tracking-[0.16em] text-[#FAF9F6] uppercase"
                    >
                      <span>{item.ctaLabel}</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Timeline;

