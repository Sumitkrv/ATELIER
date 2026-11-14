"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Box, CheckCircle2, X } from "lucide-react";
import { ATELIER_SURFACES } from "@/lib/brand";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/cn";

interface CoreDisciplineItem {
  id: string;
  number: string;
  title: string;
  shortDescription: string;
  sculpturalImage: string;
  objectAlt: string;
  detailedOverview: string;
  idealSubstrates: ReadonlyArray<string>;
  deliverables: ReadonlyArray<string>;
  ctaLabel: string;
  ctaHref: string;
}

const EDITORIAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const CORE_DISCIPLINES: ReadonlyArray<CoreDisciplineItem> = [
  {
    id: "direct-to-surface-3d-printing",
    number: "01",
    title: "Direct-to-Surface 3D Printing",
    shortDescription:
      "High-definition artwork printed directly on prepared surfaces.",
    sculpturalImage: "/images/atelier/service-obj-01-printing.jpg",
    objectAlt:
      "Three stepped honed travertine and warm limestone architectural slabs representing multi-layer direct-to-surface 3D printing",
    detailedOverview:
      "Using precision vertical wall-printing rigs and flatbed UV-cured ink passes, we print directly onto prepared architectural substrates without vinyl seams, peeling edges, or wallpaper joints.",
    idealSubstrates: ["Walls", "Tiles", "Plywood", "Metals", "Glass"],
    deliverables: [
      "On-site substrate readiness inspection",
      "Multi-pass UV-cured tactile or matte ink application",
      "Seamless edge-to-edge architectural registration",
    ],
    ctaLabel: "Enquire About Surface Printing",
    ctaHref:
      "/contact?surface=Walls&title=Direct-to-Surface+3D+Printing+Enquiry&category=Discipline+01+%E2%80%A2+Studio+Specification&interest=Direct-to-Surface+3D+Printing",
  },
  {
    id: "architectural-murals",
    number: "02",
    title: "Architectural Murals",
    shortDescription: "Large-scale, space-defining murals for interiors.",
    sculpturalImage: "/images/atelier/service-obj-02-murals.jpg",
    objectAlt:
      "Sculpted bas-relief botanical lotus palm motif carved in warm cream plaster representing bespoke architectural murals",
    detailedOverview:
      "Statement feature walls crafted for double-height living rooms, hotel lobbies, executive boardrooms, and dining sanctuaries — scaled proportionally to ceiling height, furniture lines, and natural daylight.",
    idealSubstrates: ["Walls", "Tiles", "Plywood"],
    deliverables: [
      "Full-elevation architectural scale composition",
      "Daylight & warm-LED colour tone calibration",
      "Mockup preview mapped to your room photograph",
    ],
    ctaLabel: "Commission a Feature Mural",
    ctaHref:
      "/contact?surface=Walls&title=Architectural+Murals+Commission&category=Discipline+02+%E2%80%A2+Studio+Specification&interest=Architectural+Murals",
  },
  {
    id: "conceptual-wall-art",
    number: "03",
    title: "Conceptual Wall Art",
    shortDescription:
      "Bespoke compositions tailored to your space and theme.",
    sculpturalImage: "/images/atelier/service-obj-03-conceptual.jpg",
    objectAlt:
      "Flowing S-curved sculptural limestone wave ridges representing conceptual architectural wall art",
    detailedOverview:
      "Curated storytelling compositions developed around your interior architecture, material moodboard, and spatial identity — ranging from quiet travertine geometry to expressive botanical studies.",
    idealSubstrates: ["Walls", "Glass", "Office Blinds", "Metals"],
    deliverables: [
      "Bespoke concept direction with studio founders",
      "Curated palette matching stone, timber & upholstery",
      "Multi-panel or continuous wall narrative layout",
    ],
    ctaLabel: "Discuss a Concept Direction",
    ctaHref:
      "/contact?surface=Walls&title=Conceptual+Wall+Art+Consultation&category=Discipline+03+%E2%80%A2+Studio+Specification&interest=Conceptual+Wall+Art",
  },
  {
    id: "design-customization",
    number: "04",
    title: "Design Customization",
    shortDescription:
      "Scale, crop, tone and placement configured to your surface.",
    sculpturalImage: "/images/atelier/service-obj-04-customization.jpg",
    objectAlt:
      "Unfurled tactile architectural parchment and canvas-plaster roll representing custom artwork scale and tone configuration",
    detailedOverview:
      "Every artwork in our 13-category catalogue can be adapted to your exact wall width, architectural niches, door frames, and furniture clearances — with custom colourway adjustments before printing.",
    idealSubstrates: [
      "Walls",
      "Tiles",
      "Plywood",
      "Office Blinds",
      "Metals",
      "Glass",
    ],
    deliverables: [
      "Custom dimension cropping & aspect-ratio re-composition",
      "Pigment & background warmth tuning",
      "Obstacle mapping around switches, arches & cabinetry",
    ],
    ctaLabel: "Customize a Catalogue Design",
    ctaHref: "/explore-designs",
  },
];

function findSurfaceIdByName(name: string): string | null {
  const match = ATELIER_SURFACES.find(
    (s) => s.name.toLowerCase() === name.trim().toLowerCase()
  );
  return match?.id ?? null;
}

/**
 * SECTION 03 — OUR EXPERTISE ("Where Art Meets Architectural Precision")
 * Interactive four-discipline architectural showcase paired with a synchronized
 * studio specification drawer, tactile sculptural photography, and live substrate links.
 */
export function CoreExpertiseShowcase() {
  const prefersReducedMotion = useReducedMotion();
  const [selectedDiscipline, setSelectedDiscipline] =
    useState<CoreDisciplineItem | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const scrollTimerRef = useRef<number | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Section-level reveal prevents elements from remaining hidden during mobile scroll jumps
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const revealIfReached = () => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.98) {
        setIsRevealed(true);
        return true;
      }
      return false;
    };

    if (revealIfReached()) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.01, rootMargin: "0px 0px 40px 0px" }
    );
    observer.observe(el);

    const onScroll = () => {
      if (revealIfReached()) {
        window.removeEventListener("scroll", onScroll);
        observer.disconnect();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current !== null) {
        window.clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  const ensurePanelVisibleIfNeeded = useCallback(() => {
    if (typeof window === "undefined") return;
    if (scrollTimerRef.current !== null) {
      window.clearTimeout(scrollTimerRef.current);
    }

    scrollTimerRef.current = window.setTimeout(() => {
      const panelEl = panelRef.current;
      if (!panelEl) return;

      const rect = panelEl.getBoundingClientRect();
      const headerEl = document.querySelector("header");
      const navbarHeight = headerEl
        ? Math.round(headerEl.getBoundingClientRect().height)
        : 74;
      const viewportHeight = window.innerHeight;

      // Do not force-scroll when the revealed panel already fits comfortably in view
      if (rect.top >= navbarHeight + 8 && rect.bottom <= viewportHeight - 16) {
        return;
      }

      const rm =
        Boolean(prefersReducedMotion) ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const availableHeight = viewportHeight - navbarHeight - 32;
      let targetScrollTop: number | null = null;

      if (window.innerWidth < 768 || rect.height > availableHeight) {
        // Mobile or tall panel: align top of panel cleanly below sticky navbar
        if (rect.top > viewportHeight - 96 || rect.top < navbarHeight + 8) {
          targetScrollTop = window.scrollY + rect.top - navbarHeight - 16;
        }
      } else if (rect.bottom > viewportHeight - 16) {
        // Desktop/tablet when panel extends past bottom fold: nudge just enough to reveal panel
        targetScrollTop =
          window.scrollY + (rect.bottom - viewportHeight) + 24;
      }

      if (targetScrollTop !== null) {
        window.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: rm ? "auto" : "smooth",
        });
      }
    }, 120);
  }, [prefersReducedMotion]);

  const handleToggleDiscipline = useCallback(
    (discipline: CoreDisciplineItem) => {
      setSelectedDiscipline((prev) => {
        if (prev?.id === discipline.id) {
          return null;
        }
        return discipline;
      });
      if (selectedDiscipline?.id !== discipline.id) {
        ensurePanelVisibleIfNeeded();
      }
    },
    [ensurePanelVisibleIfNeeded, selectedDiscipline?.id]
  );

  const handleClosePanel = useCallback(() => {
    const activeIdx = selectedDiscipline
      ? CORE_DISCIPLINES.findIndex((d) => d.id === selectedDiscipline.id)
      : -1;
    setSelectedDiscipline(null);
    if (activeIdx >= 0) {
      tabRefs.current[activeIdx]?.focus({ preventScroll: true });
    }
  }, [selectedDiscipline]);

  const handleCardKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
      if (e.key === "Escape" && selectedDiscipline) {
        e.preventDefault();
        setSelectedDiscipline(null);
        return;
      }

      let nextIdx: number | null = null;
      if (e.key === "ArrowRight") {
        nextIdx = (idx + 1) % CORE_DISCIPLINES.length;
      } else if (e.key === "ArrowLeft") {
        nextIdx = (idx - 1 + CORE_DISCIPLINES.length) % CORE_DISCIPLINES.length;
      } else if (e.key === "Home") {
        nextIdx = 0;
      } else if (e.key === "End") {
        nextIdx = CORE_DISCIPLINES.length - 1;
      }
      if (nextIdx !== null) {
        e.preventDefault();
        const nextItem = CORE_DISCIPLINES[nextIdx];
        if (nextItem) {
          tabRefs.current[nextIdx]?.focus();
          if (selectedDiscipline !== null) {
            setSelectedDiscipline(nextItem);
          }
        }
      }
    },
    [selectedDiscipline]
  );

  const handleJumpToSurface = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, surfaceId: string) => {
      const showroomEl = document.getElementById("service-spectrum");
      if (!showroomEl) return;
      e.preventDefault();
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `#${surfaceId}`);
        window.dispatchEvent(new HashChangeEvent("hashchange"));
        const rm = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        showroomEl.scrollIntoView({
          behavior: rm ? "auto" : "smooth",
          block: "start",
        });
      }
    },
    []
  );

  const revealVisible = Boolean(prefersReducedMotion || isRevealed);

  return (
    <section
      ref={sectionRef}
      id="core-expertise"
      aria-labelledby="core-expertise-heading"
      className="relative isolate overflow-hidden border-b border-[#E3D8CA] bg-[#F8F2EA] py-12 text-[#1A1A1A] sm:py-14 lg:py-16"
    >
      {/* Subtle Sunlit Plaster Window-Ray Atmosphere (Upper Left, Matching Reference) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div
          className="absolute top-0 left-0 hidden h-[360px] w-[44%] opacity-40 lg:block"
          style={{
            background:
              "radial-gradient(88% 85% at 14% 18%, rgba(214,196,174,0.62) 0%, rgba(235,223,208,0.34) 48%, transparent 92%), linear-gradient(128deg, rgba(255,253,249,0.72) 0%, rgba(226,211,192,0.36) 44%, transparent 86%)",
          }}
        />
      </div>

      <Container>
        {/* ===================================================================
            EDITORIAL HEADER: LEFT DISPLAY SERIF + RIGHT DIVIDED DESCRIPTION
        =================================================================== */}
        <div className="mb-8 grid grid-cols-1 items-end gap-5 lg:mb-9 lg:grid-cols-[minmax(0,1fr)_minmax(270px,330px)] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(310px,380px)] xl:gap-8">
          <div>
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={
                revealVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }
              }
              transition={{ duration: 0.45, ease: EDITORIAL_EASE }}
              className="inline-flex items-center gap-3"
            >
              <span
                aria-hidden="true"
                className="h-[1.5px] w-7 shrink-0 bg-[#9B1C1C]"
              />
              <span className="text-[11px] font-semibold tracking-[0.22em] text-[#9B1C1C] uppercase">
                OUR EXPERTISE
              </span>
            </motion.div>

            <motion.h2
              id="core-expertise-heading"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={
                revealVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }
              }
              transition={{
                duration: 0.56,
                delay: 0.05,
                ease: EDITORIAL_EASE,
              }}
              className="mt-2.5 font-serif text-[2rem] font-normal leading-[1.08] tracking-[-0.02em] text-[#1A1A1A] sm:text-[2.35rem] lg:text-[2.15rem] xl:text-[2.8rem]"
            >
              Where Art Meets{" "}
              <em className="font-serif italic font-normal text-[#9B1C1C]">
                Architectural Precision
              </em>
            </motion.h2>
          </div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={
              revealVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
            }
            transition={{ duration: 0.52, delay: 0.1, ease: EDITORIAL_EASE }}
            className="lg:border-l lg:border-[#DDD3C6] lg:pl-6 xl:pl-7"
          >
            <p className="max-w-[44ch] text-[13.5px] leading-[1.6] text-[#6F6964] lg:text-[13px] xl:text-[13.5px]">
              A focused studio of architectural surface disciplines, crafted to
              bring artistic expression, material innovation, and precision
              execution to your space.
            </p>
          </motion.div>
        </div>

        {/* ===================================================================
            FOUR SCULPTURAL DISCIPLINE CARDS
        =================================================================== */}
        <div
          role="group"
          aria-label="Core studio surface disciplines"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-3.5 xl:gap-4.5"
        >
          {CORE_DISCIPLINES.map((discipline, idx) => {
            const isSelected = selectedDiscipline?.id === discipline.id;
            return (
              <motion.div
                key={discipline.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                animate={
                  revealVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }
                }
                transition={{
                  duration: 0.5,
                  delay: 0.08 + idx * 0.05,
                  ease: EDITORIAL_EASE,
                }}
                className="flex"
              >
                <button
                  ref={(el) => {
                    tabRefs.current[idx] = el;
                  }}
                  type="button"
                  id={`discipline-tab-${discipline.id}`}
                  aria-expanded={isSelected}
                  aria-controls="discipline-spec-panel"
                  onClick={() => handleToggleDiscipline(discipline)}
                  onKeyDown={(e) => handleCardKeyDown(e, idx)}
                  className={cn(
                    "group relative flex w-full cursor-pointer flex-col justify-between rounded-2xl bg-[#FAF9F6] p-4 text-left transition-all duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9B1C1C] lg:p-3.5 xl:p-4.5",
                    isSelected
                      ? "-translate-y-0.5 shadow-[0_18px_38px_-18px_rgba(155,28,28,0.22)] ring-[1.5px] ring-[#9B1C1C]"
                      : "shadow-[0_10px_28px_-18px_rgba(26,22,18,0.1)] ring-1 ring-[#E4DBD0] hover:-translate-y-1 hover:ring-[#9B1C1C]/45"
                  )}
                >
                  <div>
                    {/* Sculptural 3D Still-Life Thumbnail + Crisp Top-Right Number */}
                    <div className="relative mb-3.5 aspect-[16/9] w-full overflow-hidden rounded-xl bg-[#EFE6DA]">
                      <Image
                        src={discipline.sculpturalImage}
                        alt={discipline.objectAlt}
                        fill
                        loading="eager"
                        sizes="(min-width: 1024px) 24vw, (min-width: 640px) 46vw, 92vw"
                        quality={92}
                        className="object-cover object-left transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                      {/* Gentle Cream Corner Halo for Number Readability */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background:
                            "radial-gradient(circle at 92% 16%, rgba(248,242,234,0.85) 0%, rgba(248,242,234,0) 42%)",
                        }}
                      />
                      <span
                        className={cn(
                          "absolute top-2.5 right-3 text-[12px] font-bold tracking-[0.06em] transition-colors duration-300",
                          isSelected
                            ? "text-[#9B1C1C]"
                            : "text-[#6F6964] group-hover:text-[#9B1C1C]"
                        )}
                      >
                        {discipline.number}
                      </span>
                    </div>

                    {/* Title & Circular Arrow Action Indicator */}
                    <div className="flex items-center justify-between gap-2.5 xl:gap-3">
                      <h3 className="text-balance font-serif text-[19px] font-normal leading-[1.18] tracking-[-0.01em] text-[#1A1A1A] lg:text-[17px] xl:text-[20px]">
                        {discipline.title}
                      </h3>
                      <span
                        aria-hidden="true"
                        className={cn(
                          "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 lg:h-7 lg:w-7 xl:h-8 xl:w-8",
                          isSelected
                            ? "bg-[#9B1C1C] text-[#FAF9F6] shadow-[0_6px_14px_-4px_rgba(155,28,28,0.45)]"
                            : "border border-[#DDD3C6] bg-[#FAF9F6] text-[#9B1C1C] group-hover:border-[#9B1C1C] group-hover:bg-[#9B1C1C]/8"
                        )}
                      >
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </span>
                    </div>

                    {/* Concise Discipline Summary */}
                    <p className="mt-2 text-[12.5px] leading-[1.55] text-[#6F6964] lg:text-[12px] xl:text-[12.5px]">
                      {discipline.shortDescription}
                    </p>
                  </div>

                  {/* Divided Metadata Footer (Matching Reference Layout) */}
                  <div className="mt-4 flex items-center justify-between gap-1.5 whitespace-nowrap border-t border-[#EAE2D7] pt-3 text-[9.5px] font-bold tracking-[0.09em] uppercase sm:text-[10px] sm:tracking-[0.11em] lg:text-[8px] lg:tracking-[0.035em] xl:text-[10px] xl:tracking-[0.11em]">
                    <span className="text-[#6F6964]">
                      {discipline.idealSubstrates.length} SUBSTRATES
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-3 w-px shrink-0 bg-[#DFD6CA]"
                    />
                    {isSelected ? (
                      <span className="text-[#9B1C1C]">
                        ACTIVE SPECIFICATION
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#6F6964] transition-colors duration-300 group-hover:text-[#9B1C1C]">
                        <span>INSPECT</span>
                        <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </span>
                    )}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* ===================================================================
            EXPANDABLE DISCIPLINE STUDIO SPECIFICATION PANEL
        =================================================================== */}
        <AnimatePresence initial={false}>
          {selectedDiscipline ? (
            <motion.div
              key="discipline-spec-panel-shell"
              ref={panelRef}
              id="discipline-spec-panel"
              role="region"
              aria-labelledby={`discipline-tab-${selectedDiscipline.id}`}
              initial={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 0, y: 24, scale: 0.97 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 16, scale: 0.98 }
              }
              transition={{
                duration: prefersReducedMotion ? 0.12 : 0.4,
                ease: EDITORIAL_EASE,
              }}
              className="relative mt-5 origin-top rounded-2xl bg-[#FAF9F6] p-5 pt-11 shadow-[0_18px_42px_-20px_rgba(26,22,18,0.12)] ring-1 ring-[#E4DBD0] sm:p-6 lg:mt-6 lg:p-5 xl:p-7"
            >
              {/* Top-Right Close Button */}
              <button
                type="button"
                onClick={handleClosePanel}
                aria-label={`Close ${selectedDiscipline.title} specification panel`}
                className="absolute top-3 right-3 z-20 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[#E4DBD0] bg-[#FAF9F6] text-[#6F6964] transition-all duration-200 hover:border-[#9B1C1C]/50 hover:bg-[#F5ECE2] hover:text-[#9B1C1C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C] sm:top-3.5 sm:right-3.5"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </button>

              <div className="grid grid-cols-1 items-center gap-5 sm:grid-cols-[156px_minmax(0,1fr)] lg:grid-cols-[132px_minmax(0,1.35fr)_minmax(0,0.95fr)_auto] lg:gap-4.5 xl:grid-cols-[184px_minmax(0,1.3fr)_minmax(0,0.95fr)_auto] xl:gap-7">
                {/* ZONE 1: Left Square Sculptural Object Preview (Pre-mounted for Instant Crossfade) */}
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-[#EFE6DA] ring-1 ring-[#E6DDD1] sm:aspect-square sm:w-[156px] lg:w-[132px] xl:w-[184px]">
                  {CORE_DISCIPLINES.map((item) => {
                    const active = item.id === selectedDiscipline.id;
                    return (
                      <div
                        key={item.id}
                        aria-hidden={!active}
                        className={cn(
                          "absolute inset-0 transition-opacity duration-350 ease-out",
                          active
                            ? "z-10 opacity-100"
                            : "pointer-events-none z-0 opacity-0"
                        )}
                      >
                        <Image
                          src={item.sculpturalImage}
                          alt={item.objectAlt}
                          fill
                          loading="eager"
                          sizes="200px"
                          quality={92}
                          className="object-cover object-[24%_50%]"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* ZONE 2: Discipline Specification Copy & Interactive Substrate Pills */}
                <motion.div
                  key={`spec-copy-${selectedDiscipline.id}`}
                  initial={
                    prefersReducedMotion ? false : { opacity: 0.15, y: 5 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, ease: EDITORIAL_EASE }}
                >
                  <span className="inline-flex items-center whitespace-nowrap rounded-full bg-[#F5E4E2] px-3 py-1 text-[10px] font-bold tracking-[0.14em] text-[#9B1C1C] uppercase lg:px-2.5 lg:text-[9px] lg:tracking-[0.1em] xl:px-3 xl:text-[10px] xl:tracking-[0.15em]">
                    DISCIPLINE {selectedDiscipline.number} • STUDIO
                    SPECIFICATION
                  </span>

                  <h3 className="mt-2.5 font-serif text-[1.5rem] font-normal leading-[1.15] tracking-[-0.015em] text-[#1A1A1A] sm:text-[1.68rem] lg:text-[1.42rem] xl:text-[1.8rem]">
                    {selectedDiscipline.title}
                  </h3>

                  <p className="mt-2 text-[13.5px] leading-[1.62] text-[#6F6964] lg:text-[12.5px] xl:text-[13.5px]">
                    {selectedDiscipline.detailedOverview}
                  </p>

                  <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                    {selectedDiscipline.idealSubstrates.map((substrate) => {
                      const surfaceId = findSurfaceIdByName(substrate);
                      if (surfaceId) {
                        return (
                          <a
                            key={substrate}
                            href={`#${surfaceId}`}
                            onClick={(e) => handleJumpToSurface(e, surfaceId)}
                            className="rounded-full border border-[#E4DBD0] bg-[#F6EFE6] px-3 py-1 text-[11.5px] font-medium text-[#1A1A1A] transition-colors duration-200 hover:border-[#9B1C1C]/55 hover:text-[#9B1C1C] lg:px-2.5 lg:text-[11px] xl:px-3 xl:text-[11.5px]"
                          >
                            {substrate}
                          </a>
                        );
                      }
                      return (
                        <span
                          key={substrate}
                          className="rounded-full border border-[#E4DBD0] bg-[#F6EFE6] px-3 py-1 text-[11.5px] font-medium text-[#1A1A1A] lg:px-2.5 lg:text-[11px] xl:px-3 xl:text-[11.5px]"
                        >
                          {substrate}
                        </span>
                      );
                    })}
                  </div>
                </motion.div>

                {/* ZONE 3: Included Studio Deliverables (Vertical Divider on Desktop) */}
                <motion.div
                  key={`spec-deliv-${selectedDiscipline.id}`}
                  initial={
                    prefersReducedMotion ? false : { opacity: 0.15, y: 5 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, ease: EDITORIAL_EASE }}
                  className="border-t border-[#EAE2D7] pt-4 sm:col-span-2 lg:col-span-1 lg:border-t-0 lg:border-l lg:border-[#E6DDD1] lg:pt-0 lg:pl-4.5 xl:pl-7"
                >
                  <p className="text-[10.5px] font-bold tracking-[0.16em] text-[#6F6964] uppercase lg:text-[9.5px] lg:tracking-[0.12em] xl:text-[10.5px] xl:tracking-[0.16em]">
                    INCLUDED STUDIO DELIVERABLES
                  </p>
                  <ul className="mt-3 space-y-2.5">
                    {selectedDiscipline.deliverables.map((deliverable) => (
                      <li
                        key={deliverable}
                        className="flex items-start gap-2.5 text-[12.5px] font-medium leading-[1.45] text-[#1A1A1A] lg:text-[12px] xl:text-[12.5px]"
                      >
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#9B1C1C]"
                          strokeWidth={1.75}
                        />
                        <span>{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* ZONE 4: Primary & Secondary Action Pills */}
                <div className="flex flex-col gap-2.5 sm:col-span-2 sm:flex-row lg:col-span-1 lg:min-w-[202px] lg:flex-col lg:items-stretch xl:min-w-[242px]">
                  <Link
                    href={selectedDiscipline.ctaHref}
                    className="group inline-flex min-h-[42px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#9B1C1C] px-5 py-2.5 text-[12.5px] font-medium text-[#FAF9F6] shadow-[0_10px_24px_-8px_rgba(155,28,28,0.42)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#7D1515] lg:px-4 lg:text-[11.5px] xl:px-5 xl:text-[12.5px]"
                  >
                    <span>{selectedDiscipline.ctaLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </Link>

                  <Link
                    href="/visualizer"
                    className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#DDD3C6] bg-[#FAF9F6] px-5 py-2.5 text-[12.5px] font-medium text-[#1A1A1A] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#9B1C1C]/55 hover:text-[#9B1C1C] lg:px-4 lg:text-[11.5px] xl:px-5 xl:text-[12.5px]"
                  >
                    <Box
                      className="h-3.5 w-3.5 shrink-0 text-[#1A1A1A]"
                      strokeWidth={1.7}
                    />
                    <span>Test in Wall Visualizer</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Container>
    </section>
  );
}
