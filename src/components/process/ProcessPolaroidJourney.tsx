"use client";

import React, { useCallback, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import {
  PolaroidLineCarousel,
  PolaroidLineCarouselHandle,
} from "@/components/ui/polaroid-line-carousel";
import { cn } from "@/lib/cn";

export interface PolaroidProcessStage {
  stepNumber: number;
  code: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: ReadonlyArray<string>;
  image: string;
  imageAlt: string;
  ctaLabel: string;
  ctaHref: string;
}

export const ATELIER_POLAROID_PROCESS_STAGES: ReadonlyArray<PolaroidProcessStage> =
  [
    {
      stepNumber: 1,
      code: "01",
      title: "Consultation",
      subtitle: "Understanding Your Space & Vision",
      description:
        "Every wall story begins with a conversation. We understand your space, architectural surfaces, dimensions, preferences, and the artistic direction you envision.",
      highlights: [
        "Discuss space and architectural requirements",
        "Identify the relevant printing substrate",
        "Understand design preferences and project dimensions",
      ],
      image: "/images/atelier/process-stage-01-consultation.jpg",
      imageAlt:
        "Premium architectural design studio table showing material samples, texture boards, sketches, and consultation notes",
      ctaLabel: "Start Your Consultation",
      ctaHref: "/contact?intent=consultation&stage=01",
    },
    {
      stepNumber: 2,
      code: "02",
      title: "Design Exploration",
      subtitle: "Discovering Your Artistic Direction",
      description:
        "Explore our curated wall art collections or collaborate with the studio to discover a bespoke mural or conceptual artwork suited to your space.",
      highlights: [
        "Explore all 13 curated design categories",
        "Discover compositions, colours, and mural styles",
        "Shortlist artwork suitable for your interiors",
      ],
      image: "/images/atelier/artwork-lotus-atelier.jpg",
      imageAlt:
        "Elegant sunlit living room featuring a sophisticated lotus and sage botanical mural in Atelier's architectural style",
      ctaLabel: "Explore Wall Designs",
      ctaHref: "/explore-designs",
    },
    {
      stepNumber: 3,
      code: "03",
      title: "Customization",
      subtitle: "Making the Design Yours",
      description:
        "Your selected artwork is refined to complement your room's dimensions, proportions, architectural elements, and desired visual atmosphere.",
      highlights: [
        "Fine-tune artwork scale and placement",
        "Explore design variations and composition",
        "Preview selected artwork on your wall",
      ],
      image: "/images/atelier/wall-preview-after.jpg",
      imageAlt:
        "Sunlit living room wall showing a custom-proportioned botanical mural tailored to the surrounding architecture and furnishings",
      ctaLabel: "Preview on Your Wall",
      ctaHref: "/visualizer",
    },
    {
      stepNumber: 4,
      code: "04",
      title: "Design Approval",
      subtitle: "Perfecting Every Detail",
      description:
        "Before printing begins, we review the final composition, artwork proportions, and surface preparation requirements to ensure clarity and confidence.",
      highlights: [
        "Review final artwork composition",
        "Confirm dimensions and visual alignment",
        "Approve artwork before execution",
      ],
      image: "/images/atelier/process-stage-04-approval.jpg",
      imageAlt:
        "High-end architectural presentation setup on travertine featuring printed design proofs, material samples, and brass scale ruler",
      ctaLabel: "Discuss Your Design",
      ctaHref: "/contact?intent=design-approval&stage=04",
    },
    {
      stepNumber: 5,
      code: "05",
      title: "Printing & Installation",
      subtitle: "Bringing Your Wall Story to Life",
      description:
        "Our team brings the approved artwork to life through precision direct-to-surface printing, followed by finishing checks and a final walkthrough.",
      highlights: [
        "Prepare and verify the surface",
        "Execute precision 3D wall printing",
        "Inspect the final artwork and finish",
      ],
      image: "/images/atelier/process-stage-05-execution.jpg",
      imageAlt:
        "Sunlit double-height architectural interior featuring a completed direct-to-surface 3D relief mural of sandstone arches and botanicals",
      ctaLabel: "Start Your Wall Story",
      ctaHref: "/contact",
    },
  ];

export interface ProcessPolaroidJourneyProps {
  activeIndex: number;
  onSelectStage: (index: number) => void;
}

export function ProcessPolaroidJourney({
  activeIndex,
  onSelectStage,
}: ProcessPolaroidJourneyProps) {
  const carouselRef = useRef<PolaroidLineCarouselHandle | null>(null);
  const stages = ATELIER_POLAROID_PROCESS_STAGES;
  const totalCount = stages.length;
  const safeIndex =
    ((activeIndex % totalCount) + totalCount) % totalCount;
  const activeStage = stages[safeIndex] ?? stages[0];
  const progressPercent = Math.round(((safeIndex + 1) / totalCount) * 100);
  const totalCode = String(totalCount).padStart(2, "0");

  const handleStageChange = useCallback(
    (nextIndex: number) => {
      const wrapped = ((nextIndex % totalCount) + totalCount) % totalCount;
      onSelectStage(wrapped);
    },
    [onSelectStage, totalCount]
  );

  const handlePrevStage = useCallback(() => {
    if (carouselRef.current) {
      carouselRef.current.prev();
    } else {
      handleStageChange(safeIndex - 1);
    }
  }, [handleStageChange, safeIndex]);

  const handleNextStage = useCallback(() => {
    if (carouselRef.current) {
      carouselRef.current.next();
    } else {
      handleStageChange(safeIndex + 1);
    }
  }, [handleStageChange, safeIndex]);

  const handleDirectSelect = useCallback(
    (idx: number) => {
      if (carouselRef.current) {
        carouselRef.current.goTo(idx);
      } else {
        handleStageChange(idx);
      }
    },
    [handleStageChange]
  );

  return (
    <section
      id="process-journey"
      aria-labelledby="polaroid-journey-heading"
      className="relative overflow-hidden border-b border-[#DED5CB] bg-[#FAF9F6] py-16 lg:py-22"
    >
      <div id="stage-explorer" className="sr-only" aria-hidden="true" />
      {/* Subtle Architectural Radial Warmth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 right-1/4 h-96 w-96 rounded-full bg-[#E8E2D9]/65 blur-3xl"
      />

      <Container className="relative z-10">
        {/* ================================================================
            ZONE A — SECTION INTRODUCTION & DYNAMIC PROGRESS INDICATOR
            ================================================================ */}
        <div className="mb-8 flex flex-col justify-between gap-6 border-b border-[#DED5CB] pb-7 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-3">
              <span className="h-[1.5px] w-7 bg-[#9B1C1C]" />
              <span className="text-[11px] font-bold tracking-[0.22em] text-[#9B1C1C] uppercase">
                THE ART BEHIND EVERY WALL
              </span>
            </div>

            <h2
              id="polaroid-journey-heading"
              className="mt-3 font-serif text-[clamp(2rem,3.6vw,3.35rem)] leading-[1.06] font-normal tracking-[-0.02em] text-[#1A1A1A]"
            >
              Five Stages.{" "}
              <span className="italic text-[#9B1C1C]">
                One Beautiful Transformation.
              </span>
            </h2>

            <p className="mt-3 max-w-xl text-[15px] leading-[1.66] text-[#5C534C]">
              From the first conversation to the final printed detail, explore
              the thoughtful journey behind every ATELIER wall story.
            </p>
          </div>

          {/* Live Dynamic Progress Indicator: "02 / 05 — DESIGN EXPLORATION" */}
          <div className="flex flex-col items-start gap-2.5 lg:items-end">
            <div
              aria-live="polite"
              className="inline-flex items-center gap-2 rounded-full border border-[#DED5CB] bg-[#F5F0E9] px-4 py-1.5 font-mono text-[11.5px] font-bold tracking-[0.16em] text-[#1A1A1A] uppercase shadow-2xs"
            >
              <span className="text-[#9B1C1C]">
                {activeStage.code} / {totalCode}
              </span>
              <span className="text-[#B8ACA0]">—</span>
              <span>{activeStage.title}</span>
            </div>

            {/* Smooth Crimson Progress Bar */}
            <div
              aria-hidden="true"
              className="h-1.5 w-full min-w-[220px] overflow-hidden rounded-full bg-[#E8E2D9] sm:w-64"
            >
              <div
                className="h-full rounded-full bg-[#9B1C1C] transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Quick Stage Selector Pills (01..05) */}
            <div
              role="tablist"
              aria-label="Select process stage"
              className="flex flex-wrap items-center gap-1.5 pt-0.5"
            >
              {stages.map((stage, idx) => {
                const isSelected = idx === safeIndex;
                return (
                  <button
                    key={stage.code}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    aria-label={`Stage ${stage.code}: ${stage.title}`}
                    onClick={() => handleDirectSelect(idx)}
                    className={cn(
                      "cursor-pointer rounded-full px-2.5 py-1 font-mono text-[10.5px] font-bold tracking-[0.14em] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]",
                      isSelected
                        ? "bg-[#9B1C1C] text-[#FAF9F6] shadow-xs"
                        : "border border-[#DED5CB] bg-[#FAF9F6] text-[#5C534C] hover:border-[#9B1C1C] hover:text-[#9B1C1C]"
                    )}
                  >
                    {stage.code}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================================================================
            UNIFIED STUDIO EXHIBITION FRAME (ZONE B CAROUSEL + ZONE C PANEL)
            ================================================================ */}
        <div className="overflow-hidden rounded-[30px] border border-[#DED5CB] bg-[#F5F0E9] p-3 shadow-[0_24px_60px_-20px_rgba(26,20,16,0.12)] sm:p-5 lg:p-6">
          {/* ZONE B — HANGING POLAROID CAROUSEL */}
          <PolaroidLineCarousel
            ref={carouselRef}
            slides={stages.map((stage) => ({
              image: stage.image,
              title: stage.title,
              caption: stage.subtitle,
              alt: stage.imageAlt,
              badge: `STAGE ${stage.code}`,
            }))}
            activeIndex={safeIndex}
            height="clamp(390px, 54svh, 490px)"
            cardWidth={295}
            sag={42}
            swing={0.85}
            autoplay={6500}
            string="#9A8067"
            background="#F3EDE5"
            ink="#1A1A1A"
            accentColor="#9B1C1C"
            onChange={handleStageChange}
            ariaLabel="Explore Atelier's five-stage creative process"
          />

          {/* ZONE C — SELECTED STAGE EDITORIAL INFORMATION PANEL */}
          <div
            key={activeStage.code}
            role="tabpanel"
            aria-label={`Stage ${activeStage.code}: ${activeStage.title}`}
            className="mt-4 rounded-[24px] border border-[#DED5CB] bg-[#FAF9F6] p-6 shadow-[0_14px_34px_-16px_rgba(26,20,16,0.08)] transition-all duration-300 sm:p-7 lg:mt-5 lg:p-8"
          >
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
              {/* Left Column (6 cols): Stage Number, Heading, Subtitle & Description */}
              <div className="lg:col-span-6">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#9B1C1C]/12 px-3.5 py-1 font-mono text-[10.5px] font-bold tracking-[0.2em] text-[#9B1C1C] uppercase">
                    <Sparkles className="h-3 w-3" />
                    <span>
                      STAGE {activeStage.code} OF {totalCode}
                    </span>
                  </span>

                  <span className="text-[11px] font-bold tracking-[0.16em] text-[#756C65] uppercase">
                    • {activeStage.subtitle}
                  </span>
                </div>

                <h3 className="mt-3.5 font-serif text-[clamp(1.9rem,3vw,2.75rem)] leading-[1.08] font-normal tracking-[-0.015em] text-[#1A1A1A]">
                  {activeStage.title}
                </h3>

                <p className="mt-3.5 max-w-[54ch] text-[15px] leading-[1.7] text-[#4E4640]">
                  {activeStage.description}
                </p>
              </div>

              {/* Right Column (6 cols): Three Key Highlights + Contextual Action + Prev/Next */}
              <div className="flex flex-col justify-between rounded-2xl border border-[#E5DDD3] bg-[#F5F0E9]/85 p-5 sm:p-6 lg:col-span-6">
                <div>
                  <p className="text-[10.5px] font-bold tracking-[0.2em] text-[#9B1C1C] uppercase">
                    KEY STAGE HIGHLIGHTS
                  </p>

                  <ul className="mt-3.5 space-y-2.5">
                    {activeStage.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="flex items-start gap-2.5 text-[13.5px] leading-[1.55] text-[#1A1A1A]"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#9B1C1C]" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Contextual Action CTA + Previous/Next Controls */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#DED5CB] pt-4">
                  <Link
                    href={activeStage.ctaHref}
                    className="group inline-flex h-11 items-center gap-2 rounded-xl bg-[#9B1C1C] px-5 text-[12px] font-semibold tracking-[0.14em] text-[#FAF9F6] uppercase shadow-[0_8px_20px_-6px_rgba(155,28,28,0.45)] transition-all duration-200 hover:bg-[#7F1616] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
                  >
                    <span>{activeStage.ctaLabel}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>

                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrevStage}
                      aria-label="Previous process stage"
                      className="inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-xl border border-[#D4C5B4] bg-[#FAF9F6] px-3.5 text-[11.5px] font-semibold tracking-[0.12em] text-[#1A1A1A] uppercase transition-colors hover:border-[#9B1C1C] hover:text-[#9B1C1C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Prev</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextStage}
                      aria-label="Next process stage"
                      className="inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-xl border border-[#1A1A1A] bg-[#1A1A1A] px-4 text-[11.5px] font-semibold tracking-[0.12em] text-[#FAF9F6] uppercase transition-colors hover:border-[#9B1C1C] hover:bg-[#9B1C1C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
                    >
                      <span>Next</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default ProcessPolaroidJourney;

