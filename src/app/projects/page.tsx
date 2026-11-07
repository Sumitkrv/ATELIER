"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PublicShell } from "@/components/layout/PublicShell";
import { Container } from "@/components/layout/Container";
import { ProjectMediaModal } from "@/components/projects/ProjectMediaModal";
import {
  ScrollPortraitWall,
  mapPortfolioProjectToWallItem,
} from "@/components/ui/scroll-portrait-wall";
import {
  DEVELOPMENT_PROJECT_FIXTURES,
  filterPortfolioProjects,
  PortfolioProjectRecord,
  PROJECTS_HERO_SLIDES,
  PROJECTS_PAGE_CONTENT,
} from "@/lib/projects-catalogue";
import { ATELIER_SURFACES, buildWhatsAppUrl } from "@/lib/brand";
import { cn } from "@/lib/cn";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HardHat,
  Image as ImageIcon,
  Layers,
  MapPin,
  MessageCircle,
  PenTool,
  Printer,
  RotateCcw,
  Sparkles,
} from "lucide-react";

const STUDIO_APPROACH_PILLARS = [
  {
    label: "Design & Visualization",
    icon: PenTool,
  },
  {
    label: "Material & Surface Planning",
    icon: Layers,
  },
  {
    label: "Precision 3D Printing",
    icon: Printer,
  },
  {
    label: "On-site Execution",
    icon: HardHat,
  },
] as const;

export default function ProjectsPage() {
  // Live API-backed project records (preserving MongoDB /api/projects contract)
  const [projectsData, setProjectsData] = useState<
    ReadonlyArray<PortfolioProjectRecord>
  >(DEVELOPMENT_PROJECT_FIXTURES);

  useEffect(() => {
    let active = true;
    fetch("/api/projects")
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!active || !payload) return;
        const clientList = Array.isArray(payload.approvedClientProjects)
          ? (payload.approvedClientProjects as PortfolioProjectRecord[])
          : [];
        const fixtureList = Array.isArray(payload.developmentFixtures)
          ? (payload.developmentFixtures as PortfolioProjectRecord[])
          : [];
        if (clientList.length > 0) {
          setProjectsData([...clientList, ...fixtureList]);
        }
      })
      .catch(() => {
        // Fallback to canonical studio studies
      });
    return () => {
      active = false;
    };
  }, []);

  // Section 01: Hero Carousel State
  const [heroSlideIndex, setHeroSlideIndex] = useState<number>(0);
  const totalHeroSlides = PROJECTS_HERO_SLIDES.length;
  const activeHeroSlide =
    PROJECTS_HERO_SLIDES[heroSlideIndex] ?? PROJECTS_HERO_SLIDES[0];

  const handlePrevHeroSlide = useCallback(() => {
    setHeroSlideIndex((prev) => (prev - 1 + totalHeroSlides) % totalHeroSlides);
  }, [totalHeroSlides]);

  const handleNextHeroSlide = useCallback(() => {
    setHeroSlideIndex((prev) => (prev + 1) % totalHeroSlides);
  }, [totalHeroSlides]);

  // Section 02: Layered Exhibition State
  const exhibitionProjects = useMemo(
    () => projectsData.filter((p) => p.published),
    [projectsData]
  );
  const [activeExhibitionIdx, setActiveExhibitionIdx] = useState<number>(0);

  const handlePrevExhibition = useCallback(() => {
    if (exhibitionProjects.length <= 1) return;
    setActiveExhibitionIdx(
      (prev) =>
        (prev - 1 + exhibitionProjects.length) % exhibitionProjects.length
    );
  }, [exhibitionProjects.length]);

  const handleNextExhibition = useCallback(() => {
    if (exhibitionProjects.length <= 1) return;
    setActiveExhibitionIdx((prev) => (prev + 1) % exhibitionProjects.length);
  }, [exhibitionProjects.length]);

  // Compute the 4 visible ordered panels for the overlapping 3D exhibition stack
  const layeredExhibitionPanels = useMemo(() => {
    if (exhibitionProjects.length === 0) return [];
    const count = Math.min(4, exhibitionProjects.length);
    const result: Array<{
      project: PortfolioProjectRecord;
      originalIndex: number;
      depthOrder: number;
    }> = [];
    for (let d = 0; d < count; d++) {
      const idx = (activeExhibitionIdx + d) % exhibitionProjects.length;
      result.push({
        project: exhibitionProjects[idx],
        originalIndex: idx,
        depthOrder: d,
      });
    }
    return result;
  }, [exhibitionProjects, activeExhibitionIdx]);

  // Section 04: Portfolio Filters (Surface + Space)
  const [activeSurfaceFilter, setActiveSurfaceFilter] = useState<string>("all");
  const [activeSpaceFilter, setActiveSpaceFilter] = useState<string>("all");

  const filteredProjects = useMemo(
    () =>
      filterPortfolioProjects(
        projectsData,
        activeSurfaceFilter,
        activeSpaceFilter
      ),
    [projectsData, activeSurfaceFilter, activeSpaceFilter]
  );

  const wallProjects = useMemo(
    () =>
      filteredProjects.map((project, index) =>
        mapPortfolioProjectToWallItem(project, index)
      ),
    [filteredProjects]
  );

  const activeSurfaceLabel = useMemo(() => {
    if (activeSurfaceFilter === "all") return "All Surfaces";
    const found = ATELIER_SURFACES.find((s) => s.id === activeSurfaceFilter);
    return found ? found.name : "All Surfaces";
  }, [activeSurfaceFilter]);

  // Section 05: Signature Editorial Case Study + Selectable Plate Index
  const signatureProject = useMemo(
    () =>
      projectsData.find((p) => p.featured && p.published) ??
      projectsData[0] ??
      null,
    [projectsData]
  );
  const [signatureMediaIdx, setSignatureMediaIdx] = useState<number>(0);

  // Media Lightbox Modal
  const [lightboxState, setLightboxState] = useState<{
    project: PortfolioProjectRecord;
    mediaIndex: number;
    mode: "images" | "video";
  } | null>(null);

  const handleResetFilters = () => {
    setActiveSurfaceFilter("all");
    setActiveSpaceFilter("all");
  };

  const hasActiveFilters =
    activeSurfaceFilter !== "all" || activeSpaceFilter !== "all";

  return (
    <PublicShell>
      {/* =====================================================================
          SECTION 01 — CINEMATIC CREAM ARCHITECTURAL HERO (Section 06)
          Warm cream gallery atmosphere with right-side architectural room stage,
          smooth gradient blend, vertical 01-04 slide rail & caption controls.
      ===================================================================== */}
      <section
        aria-labelledby="projects-hero-heading"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            handlePrevHeroSlide();
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            handleNextHeroSlide();
          }
        }}
        className="relative overflow-hidden border-b border-[#DDD2C5]/80 bg-[#F7F3ED] text-[#211D1A] lg:flex lg:min-h-[clamp(620px,calc(100svh-var(--navbar-height,74px)),820px)] lg:items-center"
      >
        {/* Left Editorial Column inside Shared Container (First in DOM for semantic mobile-first order) */}
        <Container className="relative z-10 w-full">
          <div className="flex flex-col justify-between pt-8 pb-6 sm:pt-11 sm:pb-8 lg:max-w-[490px] lg:py-12 xl:max-w-[505px]">
            <div>
              <div className="inline-flex items-center gap-3">
                <span className="h-[1.5px] w-7 bg-[#9B1C1C]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9B1C1C]">
                  {PROJECTS_PAGE_CONTENT.hero.eyebrow}
                </span>
              </div>

              <h1
                id="projects-hero-heading"
                className="mt-4 font-serif text-[clamp(2.35rem,4.2vw,3.75rem)] font-semibold leading-[1.04] tracking-[-0.02em] text-[#211D1A]"
              >
                Real Spaces,
                <br />
                Lasting{" "}
                <em className="font-serif italic font-semibold text-[#9B1C1C]">
                  Impressions
                </em>
                .
              </h1>

              <p className="mt-4 max-w-[430px] text-[14.5px] leading-[1.65] text-[#6F665E]">
                {PROJECTS_PAGE_CONTENT.hero.supportingText}
              </p>

              {/* Hero CTAs */}
              <div className="mt-7 flex flex-col gap-3 min-[430px]:flex-row min-[430px]:flex-wrap min-[430px]:items-center min-[430px]:gap-3.5">
                <a
                  href="#portfolio-gallery"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#9B1C1C] px-6 py-3.5 text-[13px] font-medium text-[#FAF9F6] shadow-md transition-all duration-200 hover:bg-[#73171B]"
                >
                  <span>Explore Projects</span>
                  <ArrowRight className="h-4 w-4" />
                </a>

                <a
                  href="#featured-exhibition"
                  className="inline-flex items-center justify-center gap-2.5 rounded-lg border border-[#DDD2C5] bg-[#FBF8F3] px-5 py-3.5 text-[13px] font-medium text-[#211D1A] shadow-2xs transition-colors hover:border-[#9B1C1C] hover:text-[#9B1C1C]"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#9B1C1C]" />
                  <span>Explore Featured Work</span>
                </a>
              </div>
            </div>

            {/* Honest Studio Capability & Scope Indicators (No Fabricated Installation Counts) */}
            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[#DDD2C5] pt-5 sm:grid-cols-4 lg:mt-10 lg:pt-6">
              <div className="border-r border-[#DDD2C5] pr-3">
                <p className="font-serif text-2xl font-semibold text-[#211D1A] sm:text-[26px]">
                  06
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-[#6F665E]">
                  Printable
                  <br />
                  Surfaces
                </p>
              </div>
              <div className="border-r border-[#DDD2C5] pr-3">
                <p className="font-serif text-2xl font-semibold text-[#211D1A] sm:text-[26px]">
                  13
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-[#6F665E]">
                  Curated Design
                  <br />
                  Categories
                </p>
              </div>
              <div className="border-r border-[#DDD2C5] pr-3">
                <p className="font-serif text-2xl font-semibold text-[#211D1A] sm:text-[26px]">
                  3D
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-[#6F665E]">
                  Direct-to-Surface
                  <br />
                  Wall Printing
                </p>
              </div>
              <div>
                <p className="font-serif text-2xl font-semibold text-[#211D1A] sm:text-[26px]">
                  100%
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-[#6F665E]">
                  Custom
                  <br />
                  Proportioned
                </p>
              </div>
            </div>
          </div>
        </Container>

        {/* Right Full-Bleed Architectural Interior Stage (Native 1376/768 below editorial on Mobile/Tablet; 73-75% right stage on Desktop so full Crane mural, sofa, coffee table & floor are framed) */}
        <div className="relative w-full lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-[73%] xl:w-[75%]">
          <div className="relative aspect-[1376/768] min-h-[235px] w-full overflow-hidden lg:aspect-auto lg:h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={activeHeroSlide.imageUrl}
              src={activeHeroSlide.imageUrl}
              alt={activeHeroSlide.imageAlt}
              className="h-full w-full object-cover object-[66%_86%] transition-opacity duration-700 lg:object-[70%_88%] xl:object-[68%_88%]"
            />

            {/* Seamless Multi-Stop Warm Cream Gradient Blend on Left & Top */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 hidden w-60 bg-gradient-to-r from-[#F7F3ED] via-[#F7F3ED]/90 via-38% to-transparent lg:block xl:w-72"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#F7F3ED] via-[#F7F3ED]/45 to-transparent lg:hidden"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 hidden w-20 bg-gradient-to-l from-black/30 to-transparent lg:block"
            />
            {/* Soft warm bottom edge transition into Featured Exhibition section */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#F2EBE2]/40 to-transparent"
            />
          </div>

          {/* Far-Right Vertical Slide Number Rail (01 / 02 / 03 / 04) on Desktop */}
          <div
            role="tablist"
            aria-label="Hero showcase slides"
            className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-end gap-4 lg:flex xl:right-6"
          >
            <div className="relative flex flex-col items-end gap-4 rounded-2xl border border-[#DDD2C5]/85 bg-[#FBF8F3]/92 px-3 py-3 shadow-md backdrop-blur-xs">
              {PROJECTS_HERO_SLIDES.map((slide, idx) => {
                const isCurrent = idx === heroSlideIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={isCurrent}
                    aria-label={`Slide ${slide.slideNumber}: ${slide.title}`}
                    onClick={() => setHeroSlideIndex(idx)}
                    className="group relative flex cursor-pointer items-center gap-2.5 text-right focus-visible:outline-2 focus-visible:outline-[#9B1C1C]"
                  >
                    <span
                      className={cn(
                        "h-[2px] transition-all duration-300",
                        isCurrent
                          ? "w-4 bg-[#9B1C1C]"
                          : "w-1.5 bg-[#6F665E]/40 group-hover:w-3 group-hover:bg-[#9B1C1C]"
                      )}
                    />
                    <span
                      className={cn(
                        "font-sans text-xs tracking-wider transition-colors",
                        isCurrent
                          ? "font-bold text-[#9B1C1C]"
                          : "font-medium text-[#6F665E] group-hover:text-[#211D1A]"
                      )}
                    >
                      {slide.slideNumber}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Warm Ivory Project Caption & Controls — Below photo on Mobile/Tablet so furniture is never covered; compact floating card on Desktop */}
          <div className="relative z-20 border-t border-[#DDD2C5]/80 bg-[#FBF8F3] px-4 py-3 text-[#211D1A] sm:px-6 lg:absolute lg:bottom-5 lg:right-6 lg:left-auto lg:min-w-[380px] lg:max-w-[440px] lg:rounded-xl lg:border lg:border-[#DDD2C5] lg:bg-[#FBF8F3]/95 lg:px-4.5 lg:py-3 lg:shadow-[0_16px_36px_rgba(33,29,26,0.15)] lg:backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/projects/${activeHeroSlide.projectSlug}`}
                    className="font-serif text-base font-semibold leading-snug text-[#211D1A] hover:text-[#9B1C1C] sm:text-lg"
                  >
                    {activeHeroSlide.title}
                  </Link>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-[#6F665E]">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0 text-[#9B1C1C]" />
                    <span>{activeHeroSlide.locationOrContext}</span>
                  </span>
                  <span className="text-[#DDD2C5]">|</span>
                  <span>{activeHeroSlide.spaceCategory}</span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {/* Mobile/Tablet 01-04 slide indicators */}
                <div
                  role="tablist"
                  aria-label="Select project slide"
                  className="mr-1 flex items-center gap-1.5 lg:hidden"
                >
                  {PROJECTS_HERO_SLIDES.map((slide, idx) => {
                    const isCurrent = idx === heroSlideIndex;
                    return (
                      <button
                        key={slide.id}
                        type="button"
                        role="tab"
                        aria-selected={isCurrent}
                        aria-label={`Slide ${slide.slideNumber}`}
                        onClick={() => setHeroSlideIndex(idx)}
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider transition-colors",
                          isCurrent
                            ? "bg-[#9B1C1C] text-[#FAF9F6]"
                            : "bg-[#F2EBE2] text-[#6F665E] hover:text-[#211D1A]"
                        )}
                      >
                        {slide.slideNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handlePrevHeroSlide}
                  aria-label="Previous hero project slide"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#DDD2C5] bg-[#F2EBE2] text-[#211D1A] transition-colors hover:border-[#9B1C1C] hover:bg-[#9B1C1C] hover:text-[#FAF9F6]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextHeroSlide}
                  aria-label="Next hero project slide"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#DDD2C5] bg-[#F2EBE2] text-[#211D1A] transition-colors hover:border-[#9B1C1C] hover:bg-[#9B1C1C] hover:text-[#FAF9F6]"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 02 — IMMERSIVE LAYERED PROJECT EXHIBITION (Section 07)
          Signature overlapping perspective-inspired gallery in warm secondary cream
          paired with left editorial intro and right "Our Approach" column.
      ===================================================================== */}
      <section
        id="featured-exhibition"
        aria-labelledby="featured-exhibition-heading"
        className="relative overflow-hidden border-b border-[#DDD2C5] bg-[#F2EBE2] py-14 text-[#211D1A] sm:py-20"
      >
        {/* Subtle warm ambient radial glow behind the exhibition stage */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#9B1C1C]/[0.05] blur-[120px]"
        />

        <Container className="relative z-10">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-6">
            {/* Left Editorial Introduction (Cols 1-3) */}
            <div className="lg:col-span-3 lg:pr-2">
              <div className="inline-flex items-center gap-2.5">
                <span className="h-[1.5px] w-6 bg-[#9B1C1C]" />
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#9B1C1C]">
                  FEATURED WORK
                </span>
              </div>

              <h2
                id="featured-exhibition-heading"
                className="mt-3 font-serif text-3xl font-semibold leading-[1.08] text-[#211D1A] sm:text-4xl"
              >
                Spaces Worth
                <br />
                Remembering
              </h2>

              <p className="mt-3.5 text-[13.5px] leading-relaxed text-[#6F665E]">
                A closer look at our signature wall and multi-surface
                transformations—layered across residential, commercial, and
                hospitality settings.
              </p>

              {/* Exhibition Navigation Controls */}
              <div className="mt-6 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handlePrevExhibition}
                  aria-label="Previous featured project panel"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#DDD2C5] bg-[#FBF8F3] text-[#211D1A] shadow-2xs transition-colors hover:border-[#9B1C1C] hover:bg-[#9B1C1C] hover:text-[#FAF9F6]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextExhibition}
                  aria-label="Next featured project panel"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#DDD2C5] bg-[#FBF8F3] text-[#211D1A] shadow-2xs transition-colors hover:border-[#9B1C1C] hover:bg-[#9B1C1C] hover:text-[#FAF9F6]"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <span className="ml-1 font-mono text-xs font-semibold text-[#6F665E]">
                  0{activeExhibitionIdx + 1} / 0{exhibitionProjects.length}
                </span>
              </div>

              <div className="mt-6">
                <a
                  href="#portfolio-gallery"
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#9B1C1C] transition-colors hover:text-[#211D1A]"
                >
                  <span>View All Projects</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Center Interactive Layered Exhibition Stage (Cols 4-9) */}
            <div className="lg:col-span-6">
              {/* Desktop Overlapping Perspective Gallery */}
              <div className="relative hidden h-[390px] w-full items-center select-none lg:flex">
                {layeredExhibitionPanels.map(
                  ({ project, originalIndex, depthOrder }) => {
                    const isFront = depthOrder === 0;
                    // Progressive cascading offsets from left to right matching the approved reference
                    const leftOffsets = ["0%", "34%", "56%", "74%"];
                    const heights = ["335px", "295px", "262px", "232px"];
                    const widths = ["44%", "33%", "28%", "24%"];
                    const zIndexes = [40, 30, 20, 10];
                    const opacities = [1, 0.9, 0.78, 0.62];

                    const imgUrl =
                      project.exhibitionImage || project.coverImage.secureUrl;

                    return (
                      <div
                        key={project.id}
                        style={{
                          left: leftOffsets[depthOrder] ?? "0%",
                          height: heights[depthOrder] ?? "260px",
                          width: widths[depthOrder] ?? "30%",
                          zIndex: zIndexes[depthOrder] ?? 10,
                          opacity: opacities[depthOrder] ?? 0.7,
                          transform: isFront
                            ? "perspective(1100px) rotateY(-4deg) translateZ(0px)"
                            : `perspective(1100px) rotateY(-10deg) translateZ(-${depthOrder * 20}px)`,
                        }}
                        onClick={() => {
                          if (!isFront) {
                            setActiveExhibitionIdx(originalIndex);
                          }
                        }}
                        className={cn(
                          "group absolute top-3 flex flex-col justify-end overflow-visible rounded-2xl transition-all duration-500 ease-out",
                          isFront ? "cursor-default" : "cursor-pointer hover:-translate-y-1.5"
                        )}
                      >
                        {/* Main Exhibition Panel Card */}
                        <div
                          className={cn(
                            "relative h-full w-full overflow-hidden rounded-2xl bg-[#261C18] shadow-[0_24px_48px_rgba(0,0,0,0.65)] transition-all duration-500",
                            isFront
                              ? "border-2 border-[#E6D5C3]/65 ring-1 ring-white/15"
                              : "border border-white/15 hover:border-[#E6D5C3]/45"
                          )}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imgUrl}
                            alt={project.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />

                          {/* Bottom Dark Gradient Overlay */}
                          <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#120D0B]/95 via-[#120D0B]/30 to-transparent"
                          />

                          {/* Top Surface Pill on Active Card */}
                          {isFront && (
                            <div className="absolute left-3.5 top-3.5 flex items-center gap-1.5">
                              <span className="rounded-full bg-[#991D20]/90 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#F8F3ED] backdrop-blur-xs">
                                {project.surfaceName}
                              </span>
                              <span className="rounded-full border border-white/20 bg-black/45 px-2.5 py-0.5 text-[10px] text-[#EDE4DA] backdrop-blur-xs">
                                {project.recordClassification ||
                                  "Studio Surface Study"}
                              </span>
                            </div>
                          )}

                          {/* Bottom Caption & Action */}
                          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3.5 sm:p-4">
                            <div className="min-w-0">
                              <h3
                                className={cn(
                                  "truncate font-serif font-semibold text-[#F8F3ED]",
                                  isFront ? "text-xl" : "text-base"
                                )}
                              >
                                {project.shortTitle || project.title}
                              </h3>
                              <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-[#D9C8B5]/80">
                                <MapPin className="h-3 w-3 shrink-0 text-[#C56E52]" />
                                <span className="truncate">
                                  {project.surfaceName} • Mumbai Studio
                                </span>
                              </p>
                            </div>

                            {isFront ? (
                              <Link
                                href={`/projects/${project.slug}`}
                                aria-label={`View ${project.title}`}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/10 text-[#F8F3ED] backdrop-blur-xs transition-colors hover:border-[#991D20] hover:bg-[#991D20]"
                              >
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            ) : (
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/30 text-[#F8F3ED]">
                                <ArrowRight className="h-3 w-3" />
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Subtle Architectural Floor Reflection Beneath Each Panel */}
                        <div
                          aria-hidden="true"
                          className="pointer-events-none mt-1.5 h-8 w-full overflow-hidden rounded-t-2xl opacity-25 blur-[1px]"
                          style={{
                            transform: "scaleY(-1)",
                            maskImage:
                              "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.65) 100%)",
                            WebkitMaskImage:
                              "linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.65) 100%)",
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imgUrl}
                            alt=""
                            className="h-28 w-full object-cover object-bottom"
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              {/* Mobile & Tablet Swipeable Exhibition Carousel (< lg) */}
              <div className="flex gap-4 overflow-x-auto pb-3 pt-1 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {exhibitionProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.slug}`}
                    className="group relative aspect-[4/4.3] w-[265px] shrink-0 overflow-hidden rounded-2xl border border-[#E6D5C3]/35 bg-[#261C18] shadow-xl sm:w-[300px]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        project.exhibitionImage || project.coverImage.secureUrl
                      }
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#120D0B]/95 via-[#120D0B]/25 to-transparent" />
                    <div className="absolute left-3.5 top-3.5">
                      <span className="rounded-full bg-[#991D20] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#F8F3ED]">
                        {project.surfaceName}
                      </span>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
                      <div>
                        <h3 className="font-serif text-xl font-semibold text-[#F8F3ED]">
                          {project.shortTitle || project.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-[#D9C8B5]/80">
                          {project.recordClassification ||
                            "Studio Surface Study"}
                        </p>
                      </div>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/10 text-[#F8F3ED]">
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right "Our Approach — From Vision to Real Walls" Column (Cols 10-12) */}
            <div className="border-t border-[#DDD2C5] pt-8 lg:col-span-3 lg:border-t-0 lg:border-l lg:pl-7 lg:pt-0">
              <div className="inline-flex items-center gap-2">
                <span className="h-[1.5px] w-5 bg-[#9B1C1C]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9B1C1C]">
                  OUR APPROACH
                </span>
              </div>

              <h3 className="mt-2.5 font-serif text-2xl font-semibold leading-[1.12] text-[#211D1A] sm:text-[1.75rem]">
                From Vision
                <br />
                to Real Walls
              </h3>

              <ul className="mt-5 space-y-3.5">
                {STUDIO_APPROACH_PILLARS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.label} className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#DDD2C5] bg-[#FBF8F3] text-[#9B1C1C] shadow-2xs">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="text-[13px] font-medium text-[#211D1A]">
                        • {item.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* =====================================================================
          SECTION 04 — CURATED PROJECT PORTFOLIO WITH FUNCTIONAL FILTERS (Section 09)
          Warm ivory background + editorial asymmetric magazine layout where
          imagery occupies 85-100% of each frame with rich dark gradient overlays.
      ===================================================================== */}
      <section
        id="portfolio-gallery"
        aria-labelledby="portfolio-gallery-heading"
        className="bg-[#F8F3ED] py-14 text-[#201C1A] sm:py-20"
      >
        <Container>
          {/* Portfolio Header & Functional Filter Bar */}
          <div className="flex flex-col justify-between gap-6 border-b border-[#DED5CB] pb-8 lg:flex-row lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2.5">
                <span className="h-[1.5px] w-6 bg-[#991D20]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#991D20]">
                  THE PORTFOLIO
                </span>
              </div>

              <h2
                id="portfolio-gallery-heading"
                className="mt-2.5 font-serif text-3xl font-semibold leading-[1.08] text-[#201C1A] sm:text-4xl lg:text-[2.65rem]"
              >
                A Collection of
                <br />
                Remarkable Spaces
              </h2>

              <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-[#6E655E]">
                Discover the architectural spaces, surfaces, and artistic
                directions explored through our studio surface studies and
                installations.
              </p>
            </div>

            {/* Primary Surface Filter Pills */}
            <div className="flex flex-col items-start gap-3 lg:items-end">
              <div
                role="tablist"
                aria-label="Filter projects by printing surface"
                className="flex flex-wrap items-center gap-2"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeSurfaceFilter === "all"}
                  onClick={() => setActiveSurfaceFilter("all")}
                  className={cn(
                    "cursor-pointer rounded-lg px-4 py-2 text-[12.5px] font-medium transition-all",
                    activeSurfaceFilter === "all"
                      ? "bg-[#201C1A] text-[#F8F3ED] shadow-xs"
                      : "border border-[#DED5CB] bg-[#FDF8F3] text-[#201C1A] hover:border-[#991D20] hover:text-[#991D20]"
                  )}
                >
                  All Surfaces
                </button>

                {ATELIER_SURFACES.map((surface) => {
                  const isSelected = activeSurfaceFilter === surface.id;
                  return (
                    <button
                      key={surface.id}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setActiveSurfaceFilter(surface.id)}
                      className={cn(
                        "cursor-pointer rounded-lg px-3.5 py-2 text-[12.5px] font-medium transition-all",
                        isSelected
                          ? "bg-[#991D20] text-[#F8F3ED] shadow-xs"
                          : "border border-[#DED5CB] bg-[#FDF8F3] text-[#201C1A] hover:border-[#991D20] hover:text-[#991D20]"
                      )}
                    >
                      {surface.name}
                    </button>
                  );
                })}
              </div>

              {/* Active Space Filter Pill / Reset */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {activeSpaceFilter !== "all" && (
                    <span className="rounded-full bg-[#EDE4DA] px-3 py-1 font-medium text-[#201C1A]">
                      Space: {activeSpaceFilter}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex cursor-pointer items-center gap-1 font-medium text-[#991D20] hover:underline"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Show all 6 surface studies</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* THE LIVING GALLERY — GSAP ScrollPortraitWall ("THE WALLS WE TRANSFORM") */}
          <ScrollPortraitWall
            titleLine1="THE WALLS"
            titleLine2="WE TRANSFORM"
            subtitle="ARCHITECTURAL ART • CURATED SURFACES • ATELIER WALL STORY"
            hint="SCROLL TO EXPLORE"
            projects={wallProjects}
            columns={3}
            activeSurfaceLabel={activeSurfaceLabel}
            onOpenProjectMedia={(project) =>
              setLightboxState({
                project,
                mediaIndex: 0,
                mode: "images",
              })
            }
            onResetFilters={handleResetFilters}
            showEndingTransition
          />
        </Container>
      </section>

      {/* =====================================================================
          SECTION 05 — SIGNATURE EDITORIAL CASE STUDY (Section 10)
          Architectural magazine spread on warm cream with interactive
          real gallery thumbnail selector & direct case study link.
      ===================================================================== */}
      {signatureProject && (
        <section
          aria-labelledby="signature-case-study-heading"
          className="border-y border-[#DED5CB] bg-[#FDF8F3] py-14 text-[#201C1A] sm:py-20"
        >
          <Container>
            <div className="mb-10 flex flex-col justify-between gap-4 border-b border-[#DED5CB] pb-6 sm:flex-row sm:items-end">
              <div>
                <div className="inline-flex items-center gap-2.5">
                  <span className="h-[1.5px] w-6 bg-[#991D20]" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#991D20]">
                    SIGNATURE PROJECT
                  </span>
                </div>
                <h2
                  id="signature-case-study-heading"
                  className="mt-2 font-serif text-3xl font-semibold text-[#201C1A] sm:text-4xl"
                >
                  The Story Behind the Surface
                </h2>
              </div>

              <span className="inline-flex items-center gap-2 self-start rounded-full border border-[#D9C8B5] bg-[#F8F3ED] px-3.5 py-1.5 text-xs font-medium text-[#5E554F] sm:self-auto">
                <Sparkles className="h-3.5 w-3.5 text-[#991D20]" />
                <span>
                  {signatureProject.recordClassification ||
                    "Studio Surface Study"}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
              {/* Left Column: Large Preview + Selectable Gallery Plates (7 Cols) */}
              <div className="lg:col-span-7">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-[#DED5CB] bg-[#201C1A] shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      (
                        signatureProject.galleryMedia[signatureMediaIdx] ??
                        signatureProject.coverImage
                      ).secureUrl
                    }
                    alt={
                      (
                        signatureProject.galleryMedia[signatureMediaIdx] ??
                        signatureProject.coverImage
                      ).altText
                    }
                    className="h-full w-full object-cover transition-all duration-500"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setLightboxState({
                        project: signatureProject,
                        mediaIndex: signatureMediaIdx,
                        mode: "images",
                      })
                    }
                    className="absolute bottom-4 right-4 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/25 bg-[#201C1A]/85 px-3.5 py-2 text-xs font-medium text-[#F8F3ED] backdrop-blur-xs transition-colors hover:border-[#991D20] hover:bg-[#991D20]"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>
                      Inspect Plate 0{signatureMediaIdx + 1} in Fullscreen
                    </span>
                  </button>
                </div>

                {/* Selectable Real Gallery Thumbnails */}
                {signatureProject.galleryMedia.length > 1 && (
                  <div className="mt-3.5 grid grid-cols-4 gap-3">
                    {signatureProject.galleryMedia.map((media, idx) => {
                      const isActiveThumb = idx === signatureMediaIdx;
                      return (
                        <button
                          key={media.publicId}
                          type="button"
                          onClick={() => setSignatureMediaIdx(idx)}
                          aria-label={`Select plate 0${idx + 1} for ${signatureProject.title}`}
                          aria-pressed={isActiveThumb}
                          className={cn(
                            "group relative aspect-[16/10] cursor-pointer overflow-hidden rounded-xl border transition-all",
                            isActiveThumb
                              ? "border-2 border-[#991D20] shadow-sm"
                              : "border-[#DED5CB] opacity-75 hover:opacity-100"
                          )}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={media.secureUrl}
                            alt={media.altText}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Editorial Project Narrative & Metadata (5 Cols) */}
              <div className="flex flex-col justify-between lg:col-span-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#991D20]">
                    <span>Surface: {signatureProject.surfaceName}</span>
                    <span>•</span>
                    <span>
                      {signatureProject.spaceCategory || "Residential"}
                    </span>
                  </div>

                  <h3 className="mt-2.5 font-serif text-3xl font-semibold leading-tight text-[#201C1A] sm:text-4xl">
                    {signatureProject.title}
                  </h3>

                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#756C65]">
                    <MapPin className="h-3.5 w-3.5 text-[#991D20]" />
                    <span>{signatureProject.locationNote}</span>
                  </p>

                  <p className="mt-5 text-[14.5px] leading-relaxed text-[#201C1A]/90">
                    {signatureProject.summary}
                  </p>

                  <p className="mt-3 text-[13.5px] leading-relaxed text-[#5E554F]">
                    {signatureProject.description}
                  </p>

                  {signatureProject.artisticDirection && (
                    <div className="mt-5 rounded-xl border border-[#DED5CB] bg-[#F8F3ED] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#991D20]">
                        Artistic Direction
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-[#201C1A]">
                        {signatureProject.artisticDirection}
                      </p>
                    </div>
                  )}

                  <ul className="mt-5 space-y-2 text-xs text-[#5E554F]">
                    {signatureProject.architecturalNotes.map((note) => (
                      <li key={note} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#991D20]" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-[#DED5CB] pt-5">
                  <Link
                    href={`/projects/${signatureProject.slug}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#991D20] px-6 py-3 text-[13px] font-medium text-[#F8F3ED] transition-colors hover:bg-[#73171B]"
                  >
                    <span>View Full Case Study</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    href={`/contact?project=${encodeURIComponent(
                      signatureProject.slug
                    )}&title=${encodeURIComponent(
                      signatureProject.title
                    )}&surface=${encodeURIComponent(
                      signatureProject.surfaceName
                    )}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#D9C8B5] bg-[#F8F3ED] px-4 py-3 text-[13px] font-medium text-[#201C1A] transition-colors hover:border-[#991D20] hover:text-[#991D20]"
                  >
                    <span>Enquire Similar</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* =====================================================================
          SECTION 10 — LUXURY PROJECT ENQUIRY CTA (Section 15)
          Warm cream / blush closing banner matching the Atelier design system.
      ===================================================================== */}
      <section
        aria-label="Start your custom wall project"
        className="relative overflow-hidden border-t border-[#DDD2C5] bg-gradient-to-r from-[#FBF8F3] via-[#F6EAE6] to-[#EBE3D8] py-14 text-[#211D1A] sm:py-18"
      >
        <Container className="relative z-10">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            {/* Left Headline */}
            <div className="lg:col-span-5">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#9B1C1C]">
                LET&apos;S CREATE SOMETHING REMARKABLE
              </p>
              <h2 className="mt-2 font-serif text-3xl font-semibold leading-[1.08] text-[#211D1A] sm:text-4xl lg:text-[2.6rem]">
                Your Space Deserves
                <br />
                Its Own{" "}
                <em className="font-serif italic font-normal text-[#9B1C1C]">
                  Wall Story.
                </em>
              </h2>
            </div>

            {/* Center Description */}
            <div className="lg:col-span-4 lg:border-l lg:border-[#DDD2C5] lg:pl-7">
              <p className="text-[13.5px] leading-relaxed text-[#6F665E]">
                Tell us about your space, preferred surface, and creative
                vision. Our Mumbai studio will help you explore a tailored
                wall-art solution.
              </p>
            </div>

            {/* Right CTAs */}
            <div className="flex flex-wrap items-center gap-3 lg:col-span-3 lg:justify-end">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg bg-[#9B1C1C] px-5 py-3.5 text-[13px] font-semibold text-[#FAF9F6] shadow-md transition-colors hover:bg-[#73171B]"
              >
                <span>Start Your Project</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href={buildWhatsAppUrl(
                  "918017463132",
                  "Hello ATELIER — WALL STORY, I would like to discuss a 3D wall printing project for my space."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[#DDD2C5] bg-[#FBF8F3] px-4 py-3 text-[12.5px] font-medium text-[#211D1A] shadow-2xs transition-colors hover:border-[#9B1C1C] hover:bg-[#F6EAE6]"
              >
                <MessageCircle className="h-4 w-4 text-[#9B1C1C]" />
                <span>WhatsApp Our Studio</span>
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* Fullscreen Project Media Lightbox Modal */}
      <ProjectMediaModal
        project={lightboxState?.project ?? null}
        initialMediaIndex={lightboxState?.mediaIndex ?? 0}
        initialMode={lightboxState?.mode ?? "images"}
        onClose={() => setLightboxState(null)}
      />
    </PublicShell>
  );
}
