"use client";

import React, { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { atelierImages } from "@/lib/asset-registry";
import { ProcessStageItem } from "@/types/models";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

interface ProcessStepItem {
  number: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  overlayKind: "none" | "corners" | "adjust" | "compare" | "save";
}

const DEFAULT_PROCESS_STEPS: ReadonlyArray<ProcessStepItem> = [
  {
    number: "01",
    title: "Choose Mode",
    description:
      "Use Live Camera, upload a room photo, or select a sample room.",
    imageUrl: atelierImages.visualizer.processSteps.step01ChooseMode,
    imageAlt:
      "Smartphone displaying a room wall camera preview in front of a sunlit architectural interior",
    overlayKind: "none",
  },
  {
    number: "02",
    title: "Map Your Wall",
    description:
      "Drag the four corner pins to match your wall’s perspective.",
    imageUrl: atelierImages.visualizer.processSteps.step02MapYourWall,
    imageAlt:
      "Sunlit warm plaster interior wall with four white perspective corner markers",
    overlayKind: "corners",
  },
  {
    number: "03",
    title: "Adjust the Design",
    description:
      "Refine scale, positioning, opacity, and orientation.",
    imageUrl: atelierImages.visualizer.processSteps.step03AdjustDesign,
    imageAlt:
      "Selected botanical wall artwork framed with burgundy perspective adjustment guides",
    overlayKind: "adjust",
  },
  {
    number: "04",
    title: "Compare & Review",
    description:
      "Toggle between your space and the mapped design to see the transformation.",
    imageUrl: atelierImages.visualizer.processSteps.step04CompareReview,
    imageAlt:
      "Split comparison of the same cream plaster wall before and after applying a bespoke mural",
    overlayKind: "compare",
  },
  {
    number: "05",
    title: "Save or Enquire",
    description:
      "Download your preview or share it with our Mumbai studio.",
    imageUrl: atelierImages.visualizer.processSteps.step05SaveEnquire,
    imageAlt:
      "Completed botanical wall mural preview with an export download badge",
    overlayKind: "save",
  },
];

function StepOverlay({ kind }: { kind: ProcessStepItem["overlayKind"] }) {
  if (kind === "corners") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <polygon
          points="22,27 78,27 78,76 22,76"
          fill="none"
          stroke="#FFFDF9"
          strokeWidth="1"
          strokeOpacity="0.95"
        />
        <circle cx="22" cy="27" r="2.8" fill="#FFFDF9" />
        <circle cx="78" cy="27" r="2.8" fill="#FFFDF9" />
        <circle cx="78" cy="76" r="2.8" fill="#FFFDF9" />
        <circle cx="22" cy="76" r="2.8" fill="#FFFDF9" />
      </svg>
    );
  }

  if (kind === "adjust") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <polygon
          points="23,22 77,22 77,78 23,78"
          fill="none"
          stroke="#9B1C1C"
          strokeWidth="1.2"
        />
        <circle cx="23" cy="22" r="2.8" fill="#9B1C1C" />
        <circle cx="77" cy="22" r="2.8" fill="#9B1C1C" />
        <circle cx="77" cy="78" r="2.8" fill="#9B1C1C" />
        <circle cx="23" cy="78" r="2.8" fill="#9B1C1C" />
      </svg>
    );
  }

  if (kind === "compare") {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <span className="absolute inset-y-0 left-1/2 w-[1.5px] -translate-x-1/2 bg-[#FFFDF9]/94" />
        <span className="absolute top-1/2 left-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#FFFDF9] text-[#665C55] shadow-sm">
          <ChevronLeft className="h-2.5 w-2.5 -mr-0.5" />
          <ChevronRight className="h-2.5 w-2.5 -ml-0.5" />
        </span>
      </div>
    );
  }

  if (kind === "save") {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFFDF9]/96 text-[#9B1C1C] shadow-[0_10px_24px_rgba(28,20,16,0.18)]">
          <Download className="h-5 w-5 stroke-[1.9]" />
        </span>
      </div>
    );
  }

  return null;
}

interface VisualizerHowItWorksProps {
  cmsStages?: ReadonlyArray<ProcessStageItem> | null;
}

export function VisualizerHowItWorks({
  cmsStages,
}: VisualizerHowItWorksProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const connectorPathRef = useRef<SVGPathElement | null>(null);

  const steps = useMemo<ReadonlyArray<ProcessStepItem>>(() => {
    if (!cmsStages || cmsStages.length === 0) return DEFAULT_PROCESS_STEPS;
    return DEFAULT_PROCESS_STEPS.map((base, idx) => {
      const override = cmsStages[idx];
      if (!override) return base;
      return {
        ...base,
        title: override.title?.trim() || base.title,
        description: override.description?.trim() || base.description,
      };
    });
  }, [cmsStages]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let hasPlayed = false;
    let tl: gsap.core.Timeline | null = null;

    const runSequence = () => {
      if (hasPlayed) return;
      hasPlayed = true;

      const heading = section.querySelector("[data-vis-heading]");
      const circles = section.querySelectorAll("[data-vis-circle]");
      const badges = section.querySelectorAll("[data-vis-badge]");
      const copies = section.querySelectorAll("[data-vis-copy]");
      const pathEl = connectorPathRef.current;

      tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        onComplete: () => {
          gsap.set([heading, circles, badges, copies].filter(Boolean), {
            clearProps: "transform,opacity",
          });
        },
      });

      if (heading) {
        tl.fromTo(
          heading,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.34 },
          0
        );
      }

      if (circles.length > 0) {
        tl.fromTo(
          circles[0],
          { opacity: 0, scale: 0.94 },
          { opacity: 1, scale: 1, duration: 0.28 },
          0.14
        );
      }

      if (pathEl) {
        const totalLen = pathEl.getTotalLength?.() || 1000;
        gsap.set(pathEl, {
          strokeDasharray: totalLen,
          strokeDashoffset: totalLen,
        });
        tl.to(
          pathEl,
          {
            strokeDashoffset: 0,
            duration: 0.72,
            ease: "power1.inOut",
          },
          0.24
        );
      }

      if (circles.length > 1) {
        tl.fromTo(
          Array.from(circles).slice(1),
          { opacity: 0, scale: 0.94 },
          { opacity: 1, scale: 1, duration: 0.3, stagger: 0.09 },
          0.3
        );
      }

      if (badges.length > 0) {
        tl.fromTo(
          badges,
          { opacity: 0, scale: 0.85 },
          { opacity: 1, scale: 1, duration: 0.24, stagger: 0.06 },
          0.42
        );
      }

      if (copies.length > 0) {
        tl.fromTo(
          copies,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.28, stagger: 0.06 },
          0.5
        );
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          runSequence();
          observer.disconnect();
        }
      },
      { threshold: 0.16 }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      tl?.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      aria-labelledby="visualizer-process-heading"
      className="relative overflow-x-clip border-t border-[#EAE0D3] bg-[#FAF6F0] pt-11 pb-8 sm:pt-14 sm:pb-10 lg:pt-14 lg:pb-9"
    >
      <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-6 xl:px-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-5 xl:gap-8">
          {/* Left Editorial Heading Block */}
          <div data-vis-heading className="lg:col-span-2 lg:pt-4">
            <div className="inline-flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="h-[1.5px] w-6 bg-[#9B1C1C]"
              />
              <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9B1C1C]">
                THE PROCESS
              </span>
            </div>

            <h2
              id="visualizer-process-heading"
              className="mt-3 font-serif text-[34px] font-normal leading-[1.08] tracking-[-0.02em] text-[#1A1A1A] sm:text-[40px] lg:text-[36px] xl:text-[42px]"
            >
              <span className="block">How It</span>
              <span className="block">Works</span>
              <em className="mt-0.5 block font-serif italic text-[#9B1C1C]">
                (5 Steps)
              </em>
            </h2>
          </div>

          {/* Right Five Circular Illustrated Steps + Flowing Sinusoidal Burgundy Line */}
          <div className="relative lg:col-span-10">
            {/* Single Flowing Burgundy Connector Wave Across the 5 Circular Illustrations on Desktop */}
            <svg
              aria-hidden="true"
              viewBox="0 0 1000 120"
              preserveAspectRatio="none"
              className="pointer-events-none absolute top-[46px] right-[9.2%] left-[9.2%] z-0 hidden h-[72px] w-[81.6%] lg:block xl:top-[50px]"
            >
              <path
                ref={connectorPathRef}
                d="M 0 64 Q 125 16, 250 64 T 500 64 T 750 64 T 1000 64"
                fill="none"
                stroke="#B45755"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>

            <ol className="relative z-10 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-4 xl:gap-5">
              {steps.map((step) => (
                <li
                  key={step.number}
                  className="flex flex-col items-center text-center"
                >
                  {/* Circular Architectural Illustration */}
                  <div
                    data-vis-circle
                    className="relative aspect-square w-[160px] overflow-hidden rounded-full border-[3px] border-[#FFFDF9] bg-[#ECE3D7] shadow-[0_12px_28px_rgba(32,24,18,0.10)] sm:w-[164px] lg:w-[144px] xl:w-[156px]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={step.imageUrl}
                      alt={step.imageAlt}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    <StepOverlay kind={step.overlayKind} />
                  </div>

                  {/* Small Circular Numbered Marker */}
                  <div
                    data-vis-badge
                    className="relative z-10 -mt-4 flex items-center justify-center"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5D9CA] bg-[#FFFDF9] font-sans text-xs font-semibold text-[#9B1C1C] shadow-[0_4px_12px_rgba(32,24,18,0.08)]">
                      {step.number}
                    </span>
                  </div>

                  {/* Burgundy Title & Concise Copy */}
                  <div data-vis-copy className="mt-2.5 flex flex-col items-center">
                    <h3 className="font-sans text-[14.5px] font-semibold tracking-[-0.01em] text-[#9B1C1C]">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 max-w-[23ch] font-sans text-xs leading-[1.58] text-[#5C524B]">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
