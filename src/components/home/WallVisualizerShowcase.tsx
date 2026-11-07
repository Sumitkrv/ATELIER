"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { DEFAULT_HOMEPAGE_CONTENT } from "@/lib/homepage-content";
import {
  buildVisualizerBridgeHref,
  stageDesignForWallVisualizer,
} from "@/lib/visualizer-bridge";
import { ATELIER_BRAND } from "@/lib/brand";
import { Camera, CheckCircle2, Scan, SlidersHorizontal } from "lucide-react";

const SAMPLE_PREVIEW_PRESETS = [
  {
    id: "atelier-botanical-study",
    slug: "category-2-featured-design",
    title: "Botanical Canopy Mural",
    slotNumber: 1,
    imageUrl: "/images/atelier/wall-preview-after.jpg",
    mode: "mural" as const,
  },
  {
    id: "atelier-terracotta-study",
    slug: "category-1-featured-design",
    title: "Terracotta Wave Relief",
    slotNumber: 3,
    imageUrl: "/images/atelier/artwork-terracotta-wave.jpg",
    mode: "mural" as const,
  },
  {
    id: "atelier-arch-study",
    slug: "category-3-featured-design",
    title: "Arch Series – Limestone",
    slotNumber: 4,
    imageUrl: "/images/atelier/artwork-arch-limestone.jpg",
    mode: "mural" as const,
  },
];

/**
 * SECTION 07 — PREVIEW ART IN YOUR SPACE
 * Interactive Before/After wall comparison + working bridge to
 * the existing `Wall-Priyanka` visualizer application via `/visualizer`.
 */
export function WallVisualizerShowcase() {
  const router = useRouter();
  const [revealPercent, setRevealPercent] = useState(55);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);

  const activePreset =
    SAMPLE_PREVIEW_PRESETS[selectedPresetIndex] ?? SAMPLE_PREVIEW_PRESETS[0];

  const handleLaunchVisualizerWithPreset = async () => {
    await stageDesignForWallVisualizer({
      id: activePreset.id,
      name: activePreset.title,
      category: `Category 0${activePreset.slotNumber}`,
      dataUrl: activePreset.imageUrl,
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
      defaultMode: activePreset.mode,
      description: `Staged from ${ATELIER_BRAND.name} Homepage Preview`,
    });

    router.push(
      buildVisualizerBridgeHref({
        designSlug: activePreset.slug,
        designTitle: activePreset.title,
        categorySlot: activePreset.slotNumber,
        mode: "camera",
      })
    );
  };

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
      {/* Left Column: Heading, Narrative & Visualizer Actions */}
      <div className="lg:col-span-5">
        <div className="mb-3 inline-flex items-center gap-3">
          <span
            aria-hidden="true"
            className="h-[1.5px] w-7 bg-[#9B1C1C]"
          />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9B1C1C]">
            {DEFAULT_HOMEPAGE_CONTENT.visualizerSection.sectionLabel}
          </span>
        </div>

        <h2 className="font-serif text-4xl sm:text-5xl font-medium leading-[1.08] tracking-tight text-[#211D1A]">
          {DEFAULT_HOMEPAGE_CONTENT.visualizerSection.heading}
        </h2>

        <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#6F665E]">
          {DEFAULT_HOMEPAGE_CONTENT.visualizerSection.supportingText}
        </p>

        {/* Preset Selector */}
        <div className="mt-6">
          <span className="block text-[11px] font-semibold uppercase tracking-widest text-[#6F665E]">
            Select Artwork to Preview in Room Context:
          </span>
          <div className="mt-2.5 flex flex-col gap-2">
            {SAMPLE_PREVIEW_PRESETS.map((preset, idx) => {
              const isSelected = idx === selectedPresetIndex;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPresetIndex(idx)}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-2.5 text-left text-xs transition-colors ${
                    isSelected
                      ? "border-[#9B1C1C] bg-[#F6EAE6] text-[#211D1A] shadow-xs"
                      : "border-[#DDD2C5] bg-[#FBF8F3] text-[#6F665E] hover:border-[#9B1C1C]/45 hover:text-[#211D1A]"
                  }`}
                >
                  <span className="font-medium">{preset.title}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9B1C1C]">
                    {preset.mode}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <ul className="mt-6 space-y-2 text-xs text-[#211D1A]">
          <li className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#9B1C1C]" />
            <span>
              4-Corner Guided Wall Mapping (Smartphone Camera or Room Photo)
            </span>
          </li>
          <li className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#9B1C1C]" />
            <span>
              Perspective-Accurate Mural &amp; Pattern Scaling with Snapshot Export
            </span>
          </li>
        </ul>

        <div className="mt-8 flex flex-wrap gap-3.5">
          <button
            type="button"
            onClick={handleLaunchVisualizerWithPreset}
            className="inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-[#9B1C1C] px-6 py-3.5 text-xs font-medium uppercase tracking-[0.16em] text-[#FBF8F3] transition-colors hover:bg-brand-crimson-dark"
          >
            <Camera className="h-4 w-4" />
            <span>
              {DEFAULT_HOMEPAGE_CONTENT.visualizerSection.primaryCtaLabel}
            </span>
          </button>

          <Button
            href={DEFAULT_HOMEPAGE_CONTENT.visualizerSection.secondaryCtaHref}
            variant="outline"
            size="lg"
          >
            <Scan className="h-4 w-4 text-[#9B1C1C]" />
            <span>
              {DEFAULT_HOMEPAGE_CONTENT.visualizerSection.secondaryCtaLabel}
            </span>
          </Button>
        </div>
      </div>

      {/* Right Column: Interactive Before / After Wall Comparison Stage */}
      <div className="lg:col-span-7">
        <div className="rounded-2xl border border-[#DDD2C5] bg-[#FBF8F3] p-4 shadow-[0_18px_45px_rgba(33,29,26,0.07)] sm:p-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-medium text-[#6F665E]">
              BEFORE: Prepared Interior Wall
            </span>
            <span className="font-semibold text-[#9B1C1C]">
              AFTER: {activePreset.title} ({revealPercent}%)
            </span>
          </div>

          {/* Interactive Comparison Frame */}
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-[#DDD2C5] bg-[#EBE3D8]">
            {/* Layer A (Base): AFTER — Printed Wall Artwork */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activePreset.imageUrl}
              alt={`3D Wall Print Preview: ${activePreset.title}`}
              className="h-full w-full object-cover"
            />

            {/* Layer B (Clipped): BEFORE — Bare Architectural Wall */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                clipPath: `inset(0 ${revealPercent}% 0 0)`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/atelier/wall-preview-before.jpg"
                alt="Prepared living room wall before 3D printing"
                className="h-full w-full object-cover"
              />
            </div>

            <span className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-[#DDD2C5] bg-[#FBF8F3]/95 px-3 py-1 text-[11px] font-semibold text-[#211D1A] shadow-sm">
              Before
            </span>
            <span className="pointer-events-none absolute bottom-3 right-3 rounded-full border border-[#DDD2C5] bg-[#FBF8F3]/95 px-3 py-1 text-[11px] font-semibold text-[#211D1A] shadow-sm">
              After
            </span>

            {/* Vertical Divider Line */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 w-[2px] bg-white shadow-[0_0_12px_rgba(0,0,0,0.45)]"
              style={{ left: `${100 - revealPercent}%` }}
            />
          </div>

          {/* Accessible Range Slider Control */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label
              htmlFor="wall-comparison-slider"
              className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#6F665E]"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#9B1C1C]" />
              <span>Drag to Compare Before &amp; After:</span>
            </label>
            <input
              id="wall-comparison-slider"
              type="range"
              min={5}
              max={95}
              value={revealPercent}
              onChange={(e) => setRevealPercent(Number(e.target.value))}
              aria-label="Compare bare wall before printing and after 3D wall printing"
              className="w-full sm:w-64 accent-brand-crimson cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
