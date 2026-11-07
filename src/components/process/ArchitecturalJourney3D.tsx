"use client";
/* eslint-disable @next/next/no-img-element */

import React from "react";
import {
  Compass,
  Palette,
  Sliders,
  FileCheck2,
  Sparkles,
  CheckCircle2,
  ArrowDownRight,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import type { InteractiveProcessStage } from "@/lib/blogs-catalogue";

interface ArchitecturalJourney3DProps {
  stages: ReadonlyArray<InteractiveProcessStage>;
  activeIndex: number;
  onSelectStage: (index: number, scrollToExplorer?: boolean) => void;
}

function StageArchIcon({ stepNumber, active }: { stepNumber: number; active: boolean }) {
  const cls = `h-4 w-4 transition-colors ${
    active ? "text-white" : "text-[#991D20]"
  }`;
  switch (stepNumber) {
    case 1:
      return <Compass className={cls} />;
    case 2:
      return <Palette className={cls} />;
    case 3:
      return <Sliders className={cls} />;
    case 4:
      return <FileCheck2 className={cls} />;
    default:
      return <Sparkles className={cls} />;
  }
}

export function ArchitecturalJourney3D({
  stages,
  activeIndex,
  onSelectStage,
}: ArchitecturalJourney3DProps) {
  const progressPercent = Math.round(((activeIndex + 1) / stages.length) * 100);

  return (
    <section
      id="five-stage-journey"
      aria-labelledby="journey-3d-heading"
      className="relative overflow-hidden border-b border-[#DED5CB] bg-gradient-to-b from-[#FDF8F3] via-[#F5ECE0] to-[#F8F3ED] py-16 lg:py-22"
    >
      {/* Ambient architectural lighting & contour rings */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 35%, rgba(232,199,154,0.32), transparent 62%), radial-gradient(circle at 18% 75%, rgba(153,29,32,0.06), transparent 45%), radial-gradient(circle at 82% 75%, rgba(153,29,32,0.06), transparent 45%)",
        }}
      />

      <Container className="relative z-10">
        {/* Section Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-3">
            <span className="h-[1.5px] w-7 bg-[#991D20]" />
            <span className="text-[11px] font-bold tracking-[0.24em] text-[#991D20] uppercase">
              THE PROCESS AT A GLANCE
            </span>
            <span className="h-[1.5px] w-7 bg-[#991D20]" />
          </div>

          <h2
            id="journey-3d-heading"
            className="mt-3 font-serif text-[clamp(2.2rem,3.6vw,3.25rem)] leading-[1.08] font-normal tracking-[-0.02em] text-[#201C1A]"
          >
            The 5-Stage{" "}
            <span className="italic text-[#991D20]">Architectural Journey</span>
          </h2>

          <p className="mt-3 text-[14.5px] leading-[1.68] text-[#6E645D]">
            A seamless flow from creative discussion to on-site execution,
            designed with care, precision, and architectural understanding.
          </p>
        </div>

        {/* ===================================================================
            SCULPTURAL 5-STAGE 3D EXHIBITION PROMENADE
            =================================================================== */}
        <div className="relative mt-12 lg:mt-16">
          {/* Desktop Illuminated Serpentine SVG Pathway connecting the 5 Arches */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-6 top-1/2 z-0 hidden -translate-y-1/2 lg:block"
          >
            <svg
              viewBox="0 0 1200 180"
              fill="none"
              className="h-[180px] w-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="atelierPathBase"
                  x1="0%"
                  y1="50%"
                  x2="100%"
                  y2="50%"
                >
                  <stop offset="0%" stopColor="#D9C8B5" stopOpacity="0.45" />
                  <stop offset="50%" stopColor="#CBB69D" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#D9C8B5" stopOpacity="0.45" />
                </linearGradient>
                <linearGradient
                  id="atelierPathGlow"
                  x1="0%"
                  y1="50%"
                  x2="100%"
                  y2="50%"
                >
                  <stop offset="0%" stopColor="#991D20" />
                  <stop offset="60%" stopColor="#C88B4B" />
                  <stop offset="100%" stopColor="#991D20" />
                </linearGradient>
                <filter
                  id="warmPathBlur"
                  x="-10%"
                  y="-30%"
                  width="120%"
                  height="160%"
                >
                  <feGaussianBlur stdDeviation="6" result="blur" />
                </filter>
              </defs>

              {/* Soft ambient warm LED glow under the serpentine path */}
              <path
                d="M 40 120 C 180 30, 320 30, 450 110 C 580 180, 680 180, 790 100 C 900 25, 1040 25, 1160 115"
                stroke="#E8C79A"
                strokeWidth="12"
                strokeLinecap="round"
                filter="url(#warmPathBlur)"
                opacity="0.65"
              />

              {/* Base architectural travertine track */}
              <path
                d="M 40 120 C 180 30, 320 30, 450 110 C 580 180, 680 180, 790 100 C 900 25, 1040 25, 1160 115"
                stroke="url(#atelierPathBase)"
                strokeWidth="3.5"
                strokeDasharray="6 6"
                strokeLinecap="round"
              />

              {/* Active illuminated progress path */}
              <path
                d="M 40 120 C 180 30, 320 30, 450 110 C 580 180, 680 180, 790 100 C 900 25, 1040 25, 1160 115"
                stroke="url(#atelierPathGlow)"
                strokeWidth="3.5"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray={100}
                strokeDashoffset={100 - progressPercent}
                className="transition-all duration-700 ease-out"
              />
            </svg>
          </div>

          {/* 5 Miniature 3D Arch Pavilions Grid (Swipeable on mobile, Serpentine 5-col on desktop) */}
          <div
            role="tablist"
            aria-label="The Five-Stage 3D Architectural Journey"
            className="relative z-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-5 lg:gap-5 lg:overflow-visible lg:pb-6"
          >
            {stages.map((stage, idx) => {
              const isSelected = idx === activeIndex;
              const isCompleted = idx <= activeIndex;
              // Serpentine vertical wave offset on desktop
              const waveOffsetClass =
                idx % 2 === 1 ? "lg:-translate-y-4" : "lg:translate-y-3";

              return (
                <div
                  key={stage.code}
                  className={`min-w-[265px] shrink-0 snap-center sm:min-w-[280px] lg:min-w-0 ${waveOffsetClass} transition-transform duration-500`}
                  style={{ perspective: "1200px" }}
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => onSelectStage(idx, false)}
                    className={`group relative flex h-full w-full cursor-pointer flex-col justify-between rounded-t-[110px] rounded-b-[26px] border p-4 pt-6 text-left transition-all duration-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#991D20] ${
                      isSelected
                        ? "-translate-y-2.5 border-[#991D20] bg-gradient-to-b from-[#FFFDF9] via-[#FAF3E8] to-[#F3E7D6] shadow-[0_28px_55px_rgba(115,23,27,0.18),0_0_0_1px_rgba(153,29,32,0.25)]"
                        : "border-[#DED5CB] bg-gradient-to-b from-[#FDFBF7]/95 via-[#F7EFE4]/90 to-[#EFE4D4]/90 shadow-[0_16px_36px_rgba(32,28,26,0.08)] hover:-translate-y-1.5 hover:border-[#C7B299] hover:shadow-[0_22px_44px_rgba(32,28,26,0.13)]"
                    }`}
                  >
                    {/* Top Recessed Warm LED Arch Rim Glow */}
                    <div
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-x-3 top-2 h-24 rounded-t-[100px] border transition-opacity duration-500 ${
                        isSelected
                          ? "border-[#E8B878]/80 bg-gradient-to-b from-[#F4D3A1]/40 to-transparent opacity-100"
                          : "border-[#E6D5BE]/60 bg-gradient-to-b from-[#F4DEC0]/25 to-transparent opacity-75 group-hover:opacity-100"
                      }`}
                    />

                    <div>
                      {/* Floating Stage Number Badge & Arch Icon */}
                      <div className="relative z-10 flex items-center justify-between px-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10.5px] font-bold tracking-[0.16em] uppercase shadow-xs transition-colors ${
                            isSelected
                              ? "bg-[#991D20] text-white"
                              : isCompleted
                                ? "bg-[#EDE0D0] text-[#73171B]"
                                : "bg-[#EFE6DA] text-[#756C65]"
                          }`}
                        >
                          Stage {stage.code}
                        </span>

                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
                            isSelected
                              ? "border-[#991D20] bg-[#991D20] shadow-[0_4px_12px_rgba(153,29,32,0.3)]"
                              : "border-[#DED5CB] bg-white/90 group-hover:border-[#991D20]"
                          }`}
                        >
                          <StageArchIcon
                            stepNumber={stage.stepNumber}
                            active={isSelected}
                          />
                        </span>
                      </div>

                      {/* 3D Miniature Exhibition Display Stage under the Arch */}
                      <div className="relative mt-3.5 overflow-hidden rounded-t-[76px] rounded-b-[18px] border border-[#DFD2C0] bg-[#241B18] shadow-[inset_0_2px_12px_rgba(0,0,0,0.28),0_10px_24px_rgba(32,24,18,0.14)]">
                        <div className="relative aspect-[4/3.4] w-full overflow-hidden">
                          <img
                            src={stage.imageUrl}
                            alt={`${stage.title} — 3D stage installation preview`}
                            className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-108"
                          />
                          {/* Warm museum spotlight gradient */}
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#201C1A]/85 via-[#201C1A]/15 to-transparent" />

                          {/* Miniature 3D Plinth Label inside the Arch Display */}
                          <div className="absolute right-2.5 bottom-2 left-2.5 flex items-center justify-between text-[10px] font-medium text-[#FDF8F3]/95">
                            <span className="truncate rounded-full bg-black/45 px-2.5 py-0.5 backdrop-blur-xs">
                              {stage.miniatureObjects[0]}
                            </span>
                            <span className="h-2 w-2 shrink-0 rounded-full bg-[#E8C79A] shadow-[0_0_8px_#E8C79A]" />
                          </div>
                        </div>
                      </div>

                      {/* Stage Title & Short Architectural Description */}
                      <div className="mt-4 px-1">
                        <h3 className="font-serif text-[20px] leading-[1.18] font-medium text-[#201C1A] group-hover:text-[#991D20]">
                          {stage.title}
                        </h3>
                        <p className="mt-1.5 text-[12px] leading-[1.52] text-[#6E645D]">
                          {stage.shortSummary}
                        </p>
                      </div>

                      {/* Miniature Studio Objects List inside the Pavilion */}
                      <div className="mt-3 space-y-1 border-t border-[#E5DACE] pt-2.5 px-1">
                        {stage.miniatureObjects.slice(1).map((obj) => (
                          <div
                            key={obj}
                            className="flex items-center gap-1.5 text-[10.5px] font-medium text-[#5A5048]"
                          >
                            <CheckCircle2 className="h-3 w-3 shrink-0 text-[#991D20]" />
                            <span className="truncate">{obj}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Illuminated Pedestal Plinth Indicator */}
                    <div className="mt-4 flex items-center justify-between rounded-xl border border-[#E4D8C8] bg-[#FAF5EE] px-3 py-2 text-[10.5px] font-bold tracking-[0.1em] uppercase">
                      <span
                        className={
                          isSelected ? "text-[#991D20]" : "text-[#756C65]"
                        }
                      >
                        {isSelected ? "Active Exhibition" : "Inspect Stage"}
                      </span>
                      <ArrowDownRight
                        className={`h-3.5 w-3.5 transition-transform ${
                          isSelected
                            ? "translate-x-0.5 translate-y-0.5 text-[#991D20]"
                            : "text-[#8C7D70] group-hover:translate-x-0.5"
                        }`}
                      />
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Sculptural Travertine Base Plinth Bar under the 5 Stages */}
          <div className="mt-4 flex flex-col items-center justify-between gap-3 rounded-2xl border border-[#DED5CB] bg-[#FAF5EE]/90 px-5 py-3.5 shadow-[0_12px_30px_rgba(32,24,18,0.06)] sm:flex-row">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#991D20]" />
              <span className="text-[12px] font-semibold text-[#201C1A]">
                Currently Viewing:{" "}
                <strong className="text-[#991D20]">
                  Stage {stages[activeIndex]?.code} —{" "}
                  {stages[activeIndex]?.title}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-2 sm:flex">
                <span className="text-[11px] font-semibold tracking-[0.14em] text-[#756C65] uppercase">
                  Journey Progress:
                </span>
                <span className="rounded-full bg-[#991D20]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#991D20]">
                  Stage 0{activeIndex + 1}/05 — {progressPercent}%
                </span>
              </div>
              <button
                type="button"
                onClick={() => onSelectStage(activeIndex, true)}
                className="text-[11.5px] font-bold tracking-[0.08em] text-[#991D20] uppercase hover:underline"
              >
                View Full Stage Details ↓
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
