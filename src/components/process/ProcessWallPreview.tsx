"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Box,
  ChevronsLeftRight,
  CheckCircle2,
  Compass,
} from "lucide-react";
import { Container } from "@/components/layout/Container";

export function ProcessWallPreview() {
  const [sliderPosition, setSliderPosition] = useState<number>(52);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const updateSliderFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(8, Math.min(92, Math.round(pct))));
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateSliderFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateSliderFromClientX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore if not captured
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setSliderPosition((prev) => Math.max(8, prev - 5));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setSliderPosition((prev) => Math.min(92, prev + 5));
    }
  };

  return (
    <section
      id="process-wall-preview"
      aria-labelledby="process-wall-preview-heading"
      className="relative overflow-hidden border-b border-[#DDD2C5] bg-[#F2EBE2] py-16 text-[#211D1A] lg:py-22"
    >
      <Container className="relative z-10">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Column (7 cols): Large Realistic Before / After Architectural Interior Preview */}
          <div className="lg:col-span-7">
            <div className="rounded-[26px] border border-[#DDD2C5] bg-[#FBF8F3] p-2.5 shadow-[0_22px_50px_rgba(33,29,26,0.09)] sm:p-3.5">
              <div
                ref={containerRef}
                role="slider"
                tabIndex={0}
                aria-label="Before and after wall mural comparison slider"
                aria-valuemin={8}
                aria-valuemax={92}
                aria-valuenow={sliderPosition}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onKeyDown={handleKeyDown}
                className="relative aspect-[16/10] w-full cursor-ew-resize overflow-hidden rounded-[20px] select-none focus:ring-2 focus:ring-[#9B1C1C] focus:outline-none"
              >
                {/* AFTER Layer (same viewpoint with botanical mural) */}
                <img
                  src="/images/atelier/wall-preview-after.jpg"
                  alt="After: Sunlit architectural living room wall transformed with a bespoke botanical mural"
                  draggable={false}
                  className="h-full w-full object-cover object-center"
                />

                {/* BEFORE Layer (same viewpoint bare wall, clipped from left to sliderPosition%) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                  }}
                >
                  <img
                    src="/images/atelier/wall-preview-before.jpg"
                    alt="Before: Sunlit bare neutral living room wall prior to mural printing"
                    draggable={false}
                    className="h-full w-full object-cover object-center"
                  />
                </div>

                {/* Before & After Badges */}
                <span className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-full border border-[#DDD2C5] bg-[#FBF8F3]/95 px-3.5 py-1 text-[11px] font-bold tracking-[0.06em] text-[#211D1A] shadow-md">
                  Before
                </span>
                <span className="pointer-events-none absolute right-4 bottom-4 z-10 rounded-full border border-[#DDD2C5] bg-[#FBF8F3]/95 px-3.5 py-1 text-[11px] font-bold tracking-[0.06em] text-[#211D1A] shadow-md">
                  After
                </span>

                {/* Vertical Divider & Drag Handle */}
                <div
                  className="pointer-events-none absolute inset-y-0 z-20 w-[2px] bg-white/95 shadow-[0_0_14px_rgba(0,0,0,0.4)]"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#DDD2C5] bg-[#FBF8F3] text-[#211D1A] shadow-[0_8px_22px_rgba(33,29,26,0.2)]">
                    <ChevronsLeftRight className="h-4 w-4 text-[#9B1C1C]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Headline, Copy, Feature Highlights & CTAs */}
          <div className="lg:col-span-5">
            <div className="mb-3 flex items-center gap-3">
              <span className="h-[1.5px] w-7 bg-[#9B1C1C]" />
              <span className="text-[11px] font-bold tracking-[0.22em] text-[#9B1C1C] uppercase">
                VISUALIZE BEFORE YOU PRINT
              </span>
            </div>

            <h2
              id="process-wall-preview-heading"
              className="font-serif text-[clamp(2.15rem,3.5vw,3.15rem)] leading-[1.06] font-normal tracking-[-0.02em] text-[#211D1A]"
            >
              See It Before It{" "}
              <span className="italic text-[#9B1C1C]">Becomes Reality.</span>
            </h2>

            <p className="mt-4 text-[14.5px] leading-[1.68] text-[#6F665E]">
              Try your selected artwork in your own space with our interactive
              wall visualizer — upload a room photograph, map your wall corners,
              and evaluate scale before production.
            </p>

            {/* Feature Highlights */}
            <ul className="mt-6 space-y-2.5 border-t border-[#DDD2C5] pt-5">
              {[
                "Preview any artwork from our 13 curated design categories",
                "Test both full-wall Mural Mode and repeating Pattern Mode",
                "Adjust wall perspective, scale, and positioning in real time",
              ].map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2.5 text-[13px] text-[#211D1A]"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#9B1C1C]" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/visualizer"
                className="inline-flex items-center gap-2 rounded-full bg-[#9B1C1C] px-5 py-3 text-[12px] font-bold tracking-[0.12em] text-[#FAF9F6] uppercase shadow-md transition-all hover:bg-[#73171B]"
              >
                <Box className="h-4 w-4" />
                <span>TRY THE WALL VISUALIZER</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              <Link
                href="/explore-designs"
                className="inline-flex items-center gap-2 rounded-full border border-[#DDD2C5] bg-[#FBF8F3] px-5 py-3 text-[12px] font-bold tracking-[0.12em] text-[#211D1A] uppercase shadow-2xs transition-all hover:border-[#9B1C1C] hover:bg-[#F6EAE6]"
              >
                <Compass className="h-4 w-4 text-[#9B1C1C]" />
                <span>EXPLORE DESIGNS</span>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

