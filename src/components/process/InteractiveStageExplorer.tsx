"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import type { InteractiveProcessStage } from "@/lib/blogs-catalogue";

interface InteractiveStageExplorerProps {
  stages: ReadonlyArray<InteractiveProcessStage>;
  activeIndex: number;
  onSelectStage: (index: number) => void;
}

export function InteractiveStageExplorer({
  stages,
  activeIndex,
  onSelectStage,
}: InteractiveStageExplorerProps) {
  const navRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeStage = stages[activeIndex] ?? stages[0];
  const progressPercent = Math.round(((activeIndex + 1) / stages.length) * 100);
  const isFirstStage = activeIndex === 0;
  const isLastStage = activeIndex === stages.length - 1;

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    idx: number
  ) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      const next = (idx + 1) % stages.length;
      onSelectStage(next);
      navRefs.current[next]?.focus();
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = (idx - 1 + stages.length) % stages.length;
      onSelectStage(prev);
      navRefs.current[prev]?.focus();
    }
  };

  return (
    <section
      id="stage-explorer"
      aria-labelledby="stage-explorer-heading"
      className="relative border-b border-[#DED5CB] bg-[#F8F3ED] py-16 lg:py-22"
    >
      <Container>
        {/* Top Progress Header Bar */}
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-[#DED5CB] pb-6 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span className="h-[1.5px] w-7 bg-[#991D20]" />
              <span className="text-[11px] font-bold tracking-[0.22em] text-[#991D20] uppercase">
                INTERACTIVE STAGE EXPLORER
              </span>
            </div>
            <h2
              id="stage-explorer-heading"
              className="font-serif text-[clamp(1.85rem,3vw,2.65rem)] leading-[1.1] font-normal tracking-[-0.02em] text-[#201C1A]"
            >
              Inside Each Stage of{" "}
              <span className="italic text-[#991D20]">Your Commission</span>
            </h2>
          </div>

          {/* Premium Progress Indicator (Stage 0X/05 — XX%) */}
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <div className="flex items-center gap-2.5 text-[12px] font-bold tracking-[0.14em] text-[#201C1A] uppercase">
              <span>
                Stage 0{activeStage.stepNumber}/0{stages.length}
              </span>
              <span className="text-[#991D20]">— {progressPercent}%</span>
            </div>
            <div
              aria-hidden="true"
              className="h-1.5 w-48 overflow-hidden rounded-full bg-[#E5DACE]"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#73171B] to-[#991D20] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3-Column Interactive Explorer Card */}
        <div className="rounded-[28px] border border-[#DED5CB] bg-[#FDF8F3] p-5 shadow-[0_20px_50px_rgba(32,28,26,0.06)] sm:p-7 lg:p-9">
          <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
            {/* Left Column (3 cols): Compact Vertical Stage Navigation */}
            <div
              role="tablist"
              aria-label="Process stage navigation"
              className="flex flex-col justify-between gap-2.5 lg:col-span-3"
            >
              {stages.map((stage, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={stage.code}
                    ref={(el) => {
                      navRefs.current[idx] = el;
                    }}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => onSelectStage(idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className={`group flex w-full cursor-pointer items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#991D20] ${
                      isSelected
                        ? "border-[#73171B] bg-gradient-to-r from-[#73171B] to-[#991D20] text-white shadow-[0_12px_26px_rgba(115,23,27,0.24)]"
                        : "border-[#DED5CB] bg-[#F8F3ED] text-[#201C1A] hover:border-[#991D20]/60 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-[#EDE4DA] text-[#991D20] group-hover:bg-[#991D20]/15"
                        }`}
                      >
                        {stage.code}
                      </span>
                      <span className="font-serif text-[17px] leading-snug font-medium">
                        {stage.title}
                      </span>
                    </div>
                    <ArrowRight
                      className={`h-4 w-4 shrink-0 transition-transform ${
                        isSelected
                          ? "translate-x-0.5 text-[#F3D7B0]"
                          : "text-[#9C8E80] group-hover:translate-x-0.5 group-hover:text-[#991D20]"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Center Column (4.5 cols -> 5 cols on lg): Stage Headline, Description, Highlights & Prev/Next */}
            <div
              role="tabpanel"
              aria-label={`${activeStage.eyebrow} — ${activeStage.title}`}
              className="flex flex-col justify-between lg:col-span-5 lg:px-2"
            >
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#991D20]/10 px-3 py-1 text-[10.5px] font-bold tracking-[0.18em] text-[#991D20] uppercase">
                  <Sparkles className="h-3 w-3" />
                  {activeStage.eyebrow}
                </div>

                <h3 className="mt-3 font-serif text-[clamp(2rem,3vw,2.75rem)] leading-[1.08] font-normal text-[#201C1A]">
                  {activeStage.title}
                </h3>

                <p className="mt-2 text-[11.5px] font-bold tracking-[0.16em] text-[#991D20] uppercase">
                  {activeStage.subtitle}
                </p>

                <p className="mt-3.5 text-[14.5px] leading-[1.68] text-[#5C534C]">
                  {activeStage.description}
                </p>

                {/* Key Highlights Box */}
                <div className="mt-5 rounded-2xl border border-[#E3D8CA] bg-[#F8F3ED] p-4 sm:p-5">
                  <p className="text-[10.5px] font-bold tracking-[0.18em] text-[#73171B] uppercase">
                    Key Stage Highlights
                  </p>
                  <ul className="mt-3 space-y-2.5">
                    {activeStage.highlights.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-[13px] leading-[1.52] text-[#2E2824]"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#991D20]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Stage-Specific Action Link (e.g. EXPLORE DESIGNS or LAUNCH WALL VISUALIZER) */}
                {activeStage.ctaLabel && activeStage.ctaHref && (
                  <div className="mt-5">
                    <Link
                      href={activeStage.ctaHref}
                      className="inline-flex items-center gap-2 rounded-full border border-[#991D20]/35 bg-[#991D20]/8 px-4 py-2 text-[12px] font-bold tracking-[0.1em] text-[#991D20] uppercase transition-all hover:bg-[#991D20] hover:text-white"
                    >
                      <span>{activeStage.ctaLabel}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Previous / Next Stage Controls (Section 10 rules) */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#E3D8CA] pt-5">
                <button
                  type="button"
                  disabled={isFirstStage}
                  onClick={() => {
                    if (!isFirstStage) onSelectStage(activeIndex - 1);
                  }}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[11.5px] font-bold tracking-[0.12em] uppercase transition-all ${
                    isFirstStage
                      ? "cursor-not-allowed border-[#E5DDD3] bg-[#F3EDE4] text-[#B0A69C]"
                      : "cursor-pointer border-[#D5C6B4] bg-[#F8F3ED] text-[#201C1A] hover:border-[#991D20] hover:text-[#991D20]"
                  }`}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Previous Stage</span>
                </button>

                {!isLastStage ? (
                  <button
                    type="button"
                    onClick={() => onSelectStage(activeIndex + 1)}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#201C1A] px-5 py-2.5 text-[11.5px] font-bold tracking-[0.12em] text-white uppercase shadow-sm transition-all hover:bg-[#991D20]"
                  >
                    <span>Next Stage</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <Link
                    href="/contact?intent=process"
                    className="inline-flex items-center gap-2 rounded-full bg-[#991D20] px-5 py-2.5 text-[11.5px] font-bold tracking-[0.12em] text-white uppercase shadow-[0_8px_20px_rgba(153,29,32,0.28)] transition-all hover:bg-[#73171B]"
                  >
                    <span>Start Your Project</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Right Column (4 cols): Large Relevant Lifestyle Photograph */}
            <div className="lg:col-span-4">
              <div className="relative flex h-full min-h-[300px] flex-col justify-between overflow-hidden rounded-[22px] border border-[#DED5CB] bg-[#241B18] shadow-[0_18px_42px_rgba(32,24,18,0.14)]">
                <img
                  key={activeStage.imageUrl}
                  src={activeStage.imageUrl}
                  alt={activeStage.imageCaption}
                  className="h-full w-full object-cover object-center transition-all duration-700"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#201C1A]/90 via-[#201C1A]/20 to-transparent" />

                {/* Top Studio Stage Pill */}
                <div className="relative z-10 flex items-center justify-between p-4">
                  <span className="rounded-full border border-white/20 bg-black/45 px-3 py-1 text-[10.5px] font-semibold text-white/95 backdrop-blur-md">
                    Stage {activeStage.code} Visual Study
                  </span>
                </div>

                {/* Bottom Caption & Objects */}
                <div className="relative z-10 p-4 pt-12 text-white">
                  <p className="font-serif text-[16px] leading-snug text-[#FDF8F3]">
                    {activeStage.imageCaption}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {activeStage.miniatureObjects.map((obj) => (
                      <span
                        key={obj}
                        className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-xs"
                      >
                        {obj}
                      </span>
                    ))}
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

