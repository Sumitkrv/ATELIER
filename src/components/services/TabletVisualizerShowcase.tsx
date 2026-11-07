"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Box,
  Upload,
  Image as ImageIcon,
  LayoutGrid,
  Maximize2,
  Eye,
  ChevronsLeftRight,
  ArrowRight,
} from "lucide-react";
import { Container } from "@/components/layout/Container";

interface VisualizerPreset {
  id: string;
  title: string;
  category: string;
  beforeImage: string;
  afterImage: string;
  designSlug: string;
}

const VISUALIZER_PRESETS: VisualizerPreset[] = [
  {
    id: "lotus",
    title: "Lotus Atelier Study",
    category: "Botanical • Walls & Glass",
    beforeImage: "/images/atelier/wall-preview-before.jpg",
    afterImage: "/images/atelier/artwork-lotus-atelier.jpg",
    designSlug: "lotus-atelier-study",
  },
  {
    id: "botanical",
    title: "Botanical Canopy",
    category: "Botanical • Walls & Tiles",
    beforeImage: "/images/atelier/wall-preview-before.jpg",
    afterImage: "/images/atelier/wall-preview-after.jpg",
    designSlug: "botanical-canopy",
  },
  {
    id: "terracotta",
    title: "Terracotta Wave Relief",
    category: "Textured • Walls & Plywood",
    beforeImage: "/images/atelier/wall-preview-before.jpg",
    afterImage: "/images/atelier/artwork-terracotta-wave.jpg",
    designSlug: "terracotta-wave-relief",
  },
];

const CAPABILITY_ROWS = [
  {
    icon: ImageIcon,
    title: "Use Your Room Photo",
    subtitle: "Upload a phone or architectural photo of your wall.",
  },
  {
    icon: LayoutGrid,
    title: "Choose from 13+ Design Categories",
    subtitle: "Botanical, Textured, Architectural, Mineral, Abstract & more.",
  },
  {
    icon: Maximize2,
    title: "Adjust Scale & Position",
    subtitle: "Align perspective corners, crop proportions, and surface scale.",
  },
  {
    icon: Eye,
    title: "Get a Realistic Preview",
    subtitle: "Inspect before-and-after impact prior to studio production.",
  },
];

export function TabletVisualizerShowcase() {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [activePresetIndex, setActivePresetIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activePreset =
    VISUALIZER_PRESETS[activePresetIndex] ?? VISUALIZER_PRESETS[0];

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
      id="wall-visualizer-preview"
      className="relative overflow-hidden border-b border-[#E3D7C7] bg-[#F7F1E8] py-14 lg:py-20"
    >
      <Container>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Editorial Intro & CTAs (3.5 cols -> 4 cols on lg) */}
          <div className="lg:col-span-4">
            <div className="mb-3 flex items-center gap-3">
              <span className="h-[1.5px] w-7 bg-[#9E1B24]" />
              <span className="text-[11px] font-bold tracking-[0.22em] text-[#9E1B24] uppercase">
                INTERACTIVE WALL PREVIEW
              </span>
            </div>

            <h2 className="font-serif text-[clamp(2.1rem,3.5vw,3.1rem)] leading-[1.06] font-normal tracking-[-0.02em] text-[#1D1815]">
              See It on <br className="hidden sm:inline" />
              <span className="italic text-[#9E1B24]">Your Wall.</span>
            </h2>

            <p className="mt-3.5 max-w-[36ch] text-[14px] leading-[1.68] text-[#5F544C]">
              Preview your chosen design in your own space with our interactive
              wall visualizer — map your wall, adjust scale, and inspect how it
              looks in real time.
            </p>

            {/* Preset Artwork Switcher */}
            <div className="mt-5">
              <p className="text-[10.5px] font-bold tracking-[0.16em] text-[#7D6E61] uppercase">
                Test Live Tablet Artwork:
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {VISUALIZER_PRESETS.map((preset, idx) => {
                  const active = idx === activePresetIndex;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setActivePresetIndex(idx)}
                      className={`rounded-full border px-3 py-1 text-[11.5px] font-semibold transition-all ${
                        active
                          ? "border-[#9E1B24] bg-[#9E1B24]/10 text-[#9E1B24]"
                          : "border-[#DDD0BF] bg-[#FAF6F0] text-[#5F544C] hover:border-[#BFA88E]"
                      }`}
                    >
                      {preset.title}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary & Secondary CTAs */}
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <Link
                href={`/visualizer?design=${activePreset.designSlug}`}
                className="inline-flex items-center gap-2 rounded-full bg-[#9E1B24] px-5 py-2.5 text-[12.5px] font-semibold text-white shadow-[0_8px_22px_rgba(158,27,36,0.28)] transition-all hover:bg-[#7F141C]"
              >
                <Box className="h-3.5 w-3.5" />
                Open Wall Visualizer
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/visualizer?mode=photo"
                className="inline-flex items-center gap-2 rounded-full border border-[#D4C4B0] bg-[#FAF6F0] px-4 py-2.5 text-[12.5px] font-semibold text-[#1D1815] transition-all hover:border-[#9E1B24] hover:text-[#9E1B24]"
              >
                <Upload className="h-3.5 w-3.5 text-[#9E1B24]" />
                Upload Your Space
              </Link>
            </div>
          </div>

          {/* Center Column: Realistic Architectural Tablet Frame with Interactive Before/After Slider (5 cols) */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-[540px]">
              {/* Soft warm pedestal glow beneath tablet */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-5 left-1/2 h-10 w-[88%] -translate-x-1/2 rounded-full bg-[#241B15]/25 blur-xl"
              />

              {/* Outer Dark-Bezel Architectural Tablet Hardware Frame */}
              <div className="relative rounded-[28px] border-[3px] border-[#3B332E] bg-[#161311] p-2.5 shadow-[0_26px_60px_rgba(24,18,14,0.28)] sm:rounded-[32px] sm:p-3.5">
                {/* Tablet Top Camera Sensor Dot */}
                <div
                  aria-hidden="true"
                  className="absolute top-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#3A322D]"
                />

                {/* Interactive Screen Viewport */}
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
                  className="relative aspect-[16/10.5] w-full cursor-ew-resize overflow-hidden rounded-[20px] select-none focus:ring-2 focus:ring-[#9E1B24] focus:outline-none"
                >
                  {/* AFTER Layer (Full width underneath) */}
                  <img
                    src={activePreset.afterImage}
                    alt={`After: ${activePreset.title} printed on architectural living room wall`}
                    draggable={false}
                    className="h-full w-full object-cover object-center"
                  />

                  {/* BEFORE Layer (Clipped from left to sliderPosition%) */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{
                      clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                    }}
                  >
                    <img
                      src={activePreset.beforeImage}
                      alt="Before: Bare sunlit architectural living room wall"
                      draggable={false}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  {/* Top-Left "Before" Pill */}
                  <span className="pointer-events-none absolute top-3.5 left-3.5 z-10 rounded-full bg-[#FAF6F0]/92 px-3 py-1 text-[11px] font-bold tracking-[0.04em] text-[#1D1815] shadow-md backdrop-blur-xs">
                    Before
                  </span>

                  {/* Top-Right "After" Pill */}
                  <span className="pointer-events-none absolute top-3.5 right-3.5 z-10 rounded-full bg-[#FAF6F0]/92 px-3 py-1 text-[11px] font-bold tracking-[0.04em] text-[#1D1815] shadow-md backdrop-blur-xs">
                    After
                  </span>

                  {/* Vertical Divider Line + Circular Drag Handle */}
                  <div
                    className="pointer-events-none absolute inset-y-0 z-20 w-[2px] bg-white/95 shadow-[0_0_12px_rgba(0,0,0,0.45)]"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#E5D8C7] bg-white text-[#1D1815] shadow-[0_6px_18px_rgba(0,0,0,0.32)]">
                      <ChevronsLeftRight className="h-4 w-4 text-[#9E1B24]" />
                    </div>
                  </div>

                  {/* Bottom Subtle Caption Bar inside Tablet */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center justify-between bg-gradient-to-t from-black/65 via-black/25 to-transparent px-4 pt-6 pb-2.5 text-white">
                    <span className="text-[11px] font-medium tracking-wide text-white/95">
                      {activePreset.title}
                    </span>
                    <span className="text-[10px] tracking-[0.12em] text-white/80 uppercase">
                      Drag to Compare
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Capability Rows (3 cols) */}
          <div className="lg:col-span-3">
            <div className="divide-y divide-[#E2D5C4] rounded-2xl border border-[#E2D5C4] bg-[#FAF6F0]/80 px-5 py-2 shadow-[0_12px_30px_rgba(29,24,21,0.04)]">
              {CAPABILITY_ROWS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-3.5 py-3.5"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E6DACB] bg-[#F4EDE2] text-[#9E1B24]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-[13.5px] font-semibold text-[#1D1815]">
                        {item.title}
                      </h3>
                      <p className="mt-0.5 text-[11.5px] leading-[1.45] text-[#6B5F56]">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
