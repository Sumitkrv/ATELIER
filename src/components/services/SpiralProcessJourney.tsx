"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  MessageSquare,
  Image as ImageIcon,
  Printer,
  HardHat,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/layout/Container";

export interface SpiralStepItem {
  number: string;
  title: string;
  shortSummary: string;
  detailDescription: string;
  deliverable: string;
  durationNote: string;
  icon: "consultation" | "visualization" | "printing" | "installation";
  /** Desktop staircase position classes (percentage offsets from bottom-left to top-right) */
  desktopPositionClass: string;
}

const SPIRAL_STEPS: SpiralStepItem[] = [
  {
    number: "01",
    title: "Consultation",
    shortSummary: "Understand your space, style and surface.",
    detailDescription:
      "We begin by reviewing your wall dimensions, substrate condition (plaster, tile, plywood, blind fabric, metal, or glass), ambient lighting, and interior palette.",
    deliverable: "Substrate feasibility & scale brief",
    durationNote: "Stage 01 • Studio Discovery",
    icon: "consultation",
    desktopPositionClass: "lg:bottom-[6%] lg:left-[4%]",
  },
  {
    number: "02",
    title: "Design & Visualization",
    shortSummary: "Create or adapt artwork with realistic previews.",
    detailDescription:
      "Select from 13 curated design categories or commission bespoke artwork. We map the composition directly onto your room photo for architectural sign-off.",
    deliverable: "Scaled room elevation & colour proof",
    durationNote: "Stage 02 • Visual Sign-Off",
    icon: "visualization",
    desktopPositionClass: "lg:bottom-[26%] lg:left-[23%]",
  },
  {
    number: "03",
    title: "Printing & Preparation",
    shortSummary: "High-resolution, durable surface printing.",
    detailDescription:
      "Our studio calibrates ink density, white-ink underlays, and surface adhesion primers so tonal gradients and fine linework transfer crisply onto your chosen substrate.",
    deliverable: "Calibrated print pass & surface prep",
    durationNote: "Stage 03 • Precision Production",
    icon: "printing",
    desktopPositionClass: "lg:bottom-[47%] lg:left-[45%]",
  },
  {
    number: "04",
    title: "On-site Installation",
    shortSummary: "Professional execution with a refined finish.",
    detailDescription:
      "Our technical team sets up the vertical track or flatbed surface rig on site, executes the print pass with zero mess, and conducts a final architectural walkthrough.",
    deliverable: "Completed wall story & care handover",
    durationNote: "Stage 04 • Architectural Handover",
    icon: "installation",
    desktopPositionClass: "lg:bottom-[69%] lg:left-[66%]",
  },
];

function StepIcon({ type, active }: { type: SpiralStepItem["icon"]; active: boolean }) {
  const cls = `h-4 w-4 transition-colors ${active ? "text-[#9E1B24]" : "text-[#8C6A4F]"}`;
  switch (type) {
    case "consultation":
      return <MessageSquare className={cls} />;
    case "visualization":
      return <ImageIcon className={cls} />;
    case "printing":
      return <Printer className={cls} />;
    case "installation":
      return <HardHat className={cls} />;
  }
}

export function SpiralProcessJourney() {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const activeStep = SPIRAL_STEPS[activeIndex] ?? SPIRAL_STEPS[0];

  return (
    <section
      id="execution-flow"
      className="relative overflow-hidden border-b border-[#E3D7C7] bg-gradient-to-b from-[#F5EFE6] via-[#EFE6D8] to-[#F7F1E8] py-14 lg:py-20"
    >
      {/* Subtle architectural background curves */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 72% 45%, rgba(232,199,154,0.28), transparent 55%), radial-gradient(circle at 15% 80%, rgba(158,27,36,0.06), transparent 45%)",
        }}
      />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Editorial Intro (4 cols) */}
          <div className="lg:col-span-4">
            <div className="mb-3 flex items-center gap-3">
              <span className="h-[1.5px] w-7 bg-[#9E1B24]" />
              <span className="text-[11px] font-bold tracking-[0.22em] text-[#9E1B24] uppercase">
                THE JOURNEY • OUR PROCESS
              </span>
            </div>

            <h2 className="font-serif text-[clamp(2rem,3.4vw,3rem)] leading-[1.08] font-normal tracking-[-0.02em] text-[#1D1815]">
              From Imagination to{" "}
              <span className="italic text-[#9E1B24]">Installation.</span>
            </h2>

            <p className="mt-2 font-serif text-[15px] italic text-[#7A6858]">
              A Refined Execution Flow
            </p>

            <p className="mt-3.5 max-w-[36ch] text-[14px] leading-[1.68] text-[#5F544C]">
              A structured, collaborative journey from initial space assessment
              and wall visualization to precision on-site surface printing.
            </p>

            {/* Interactive Active Step Inspector Card */}
            <div className="mt-6 rounded-2xl border border-[#DFD2C0] bg-[#FAF6F0]/95 p-5 shadow-[0_14px_34px_rgba(32,23,16,0.06)]">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#9E1B24]/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] text-[#9E1B24] uppercase">
                  <Sparkles className="h-3 w-3" />
                  {activeStep.durationNote}
                </span>
                <div className="flex items-center gap-1">
                  {SPIRAL_STEPS.map((s, idx) => (
                    <button
                      key={s.number}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      aria-label={`Inspect process step ${s.number}: ${s.title}`}
                      className={`h-6 w-6 rounded-full text-[10px] font-bold transition-all ${
                        idx === activeIndex
                          ? "bg-[#9E1B24] text-white shadow-sm"
                          : "bg-[#EAE0D2] text-[#6E6259] hover:bg-[#DFD2C0]"
                      }`}
                    >
                      {s.number}
                    </button>
                  ))}
                </div>
              </div>

              <h3 className="mt-3 font-serif text-[19px] font-medium text-[#1D1815]">
                {activeStep.number}. {activeStep.title}
              </h3>
              <p className="mt-1.5 text-[12.5px] leading-[1.6] text-[#5F544C]">
                {activeStep.detailDescription}
              </p>

              <div className="mt-3.5 flex items-center gap-2 border-t border-[#E6DACB] pt-3 text-[11.5px] font-semibold text-[#3C322B]">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#9E1B24]" />
                <span>Deliverable: {activeStep.deliverable}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/process"
                className="inline-flex items-center gap-2 rounded-full border border-[#D4C4B0] bg-[#FAF6F0] px-5 py-2.5 text-[12.5px] font-semibold text-[#1D1815] shadow-xs transition-all hover:border-[#9E1B24] hover:text-[#9E1B24]"
              >
                Explore Detailed Process
                <ArrowRight className="h-3.5 w-3.5 text-[#9E1B24]" />
              </Link>
            </div>
          </div>

          {/* Right Column: Architectural Spiral Staircase Stage (8 cols) */}
          <div className="lg:col-span-8">
            <div className="relative overflow-hidden rounded-[28px] border border-[#DFD2C0] bg-[#E8DCCB] shadow-[0_24px_60px_rgba(32,24,18,0.12)]">
              {/* Background Architectural Spiral Staircase Image */}
              <div className="relative aspect-[16/10] w-full sm:aspect-[16/9] lg:h-[440px] lg:aspect-auto">
                <img
                  src="/images/atelier/services-spiral-staircase.jpg"
                  alt="Sculptural curved warm lime-plaster architectural staircase with ascending process steps"
                  className="h-full w-full object-cover object-center"
                />
                {/* Soft warm vignette so ascending cards pop with high contrast */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#F7F1E8]/75 via-[#F7F1E8]/20 to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#F5EFE6]/85 to-transparent" />

                {/* Desktop Ascending Staircase Cards (lg+) */}
                <div className="hidden lg:block">
                  {SPIRAL_STEPS.map((step, idx) => {
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={step.number}
                        type="button"
                        onClick={() => setActiveIndex(idx)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`group absolute z-20 w-[235px] rounded-2xl border p-3.5 text-left transition-all duration-300 ${
                          step.desktopPositionClass
                        } ${
                          isActive
                            ? "-translate-y-1.5 border-[#9E1B24]/60 bg-[#FAF6F0] shadow-[0_18px_38px_rgba(158,27,36,0.18)] ring-2 ring-[#9E1B24]/20"
                            : "border-[#E2D5C4] bg-[#FAF6F0]/95 shadow-[0_12px_28px_rgba(29,24,21,0.12)] hover:-translate-y-1 hover:bg-[#FAF6F0]"
                        }`}
                      >
                        {/* Crimson Step Number Badge floating at top-left corner */}
                        <span
                          className={`absolute -top-3 -left-3 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-md transition-transform ${
                            isActive
                              ? "scale-110 bg-[#9E1B24]"
                              : "bg-[#9E1B24]/90 group-hover:scale-105"
                          }`}
                        >
                          {step.number}
                        </span>

                        <div className="flex items-start gap-2.5 pl-1">
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#E5D8C7] bg-[#F3ECE1]">
                            <StepIcon type={step.icon} active={isActive} />
                          </div>
                          <div>
                            <h3 className="font-serif text-[14.5px] leading-snug font-semibold text-[#1D1815]">
                              {step.title}
                            </h3>
                            <p className="mt-0.5 text-[11px] leading-[1.45] text-[#6A5E55]">
                              {step.shortSummary}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile / Tablet Ascending Step Cards (<lg) */}
              <div className="grid grid-cols-1 gap-3 border-t border-[#DFD2C0] bg-[#FAF6F0] p-4 sm:grid-cols-2 lg:hidden">
                {SPIRAL_STEPS.map((step, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={step.number}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                        isActive
                          ? "border-[#9E1B24] bg-[#F7F1E8] shadow-sm"
                          : "border-[#E3D7C7] bg-white/80"
                      }`}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#9E1B24] text-[11px] font-bold text-white">
                        {step.number}
                      </span>
                      <div>
                        <h3 className="font-serif text-[15px] font-semibold text-[#1D1815]">
                          {step.title}
                        </h3>
                        <p className="mt-0.5 text-[12px] leading-[1.45] text-[#6A5E55]">
                          {step.shortSummary}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
