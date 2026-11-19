"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CatalogueDesignItem } from "@/lib/designs-catalogue";
import { atelierImages } from "@/lib/asset-registry";
import { PageContentDocument } from "@/types/models";
import { SampleRoomElevation } from "@/components/visualizer/InteractiveWallVisualizerModal";
import {
  HeroPreviewMode,
  LaptopWallPreview,
  MobileCameraMockup,
  PreviewModeSelector,
} from "@/components/visualizer/LaptopWallPreview";
import { CurrentlyPreviewingModule } from "@/components/visualizer/SelectedArtworkSelector";
import {
  AlertCircle,
  ArrowRight,
  Camera,
  Download,
  Image as ImageIcon,
  Layers,
  Sparkles,
  Target,
} from "lucide-react";

interface VisualizerHeroProps {
  selectedDesign: CatalogueDesignItem;
  displayTitle: string;
  heroContent?: PageContentDocument["hero"] | null;
  activeMode: HeroPreviewMode;
  activeRoom: SampleRoomElevation;
  comparisonMode: "before" | "after";
  roomPickerOpen: boolean;
  showInvalidQueryBanner: boolean;
  onDismissInvalidNotice: () => void;
  onComparisonChange: (mode: "before" | "after") => void;
  onLaunchLiveCamera: () => void;
  onLaunchUploadPhoto: () => void;
  onLaunchAutoFit: () => void;
  onToggleRoomPicker: () => void;
  onChooseSampleRoom: (room: SampleRoomElevation) => void;
  onOpenRoomInStudio: (roomId: string) => void;
  onOpenArtworkSelector: () => void;
}

const FEATURE_HIGHLIGHTS = [
  {
    icon: Target,
    title: "Perspective-Aligned Preview",
    subtitle: "See the artwork on your wall",
  },
  {
    icon: Layers,
    title: "Design in Context",
    subtitle: "Explore placement and scale",
  },
  {
    icon: Download,
    title: "Save & Share",
    subtitle: "Export your preview",
  },
] as const;

export function VisualizerHero({
  selectedDesign,
  displayTitle,
  heroContent,
  activeMode,
  activeRoom,
  comparisonMode,
  roomPickerOpen,
  showInvalidQueryBanner,
  onDismissInvalidNotice,
  onComparisonChange,
  onLaunchLiveCamera,
  onLaunchUploadPhoto,
  onLaunchAutoFit,
  onToggleRoomPicker,
  onChooseSampleRoom,
  onOpenRoomInStudio,
  onOpenArtworkSelector,
}: VisualizerHeroProps) {
  const prefersReducedMotion = useReducedMotion();

  const eyebrow = heroContent?.eyebrow?.trim() || "ATELIER — WALL STORY";
  const subheading =
    heroContent?.subheading?.trim() ||
    "See how our artwork transforms your wall in real time. Capture your space with your camera or upload a room photo, map the wall, and preview your selected design with accurate perspective.";
  const primaryCtaLabel =
    heroContent?.primaryCta?.label?.trim() || "Start Live Preview";
  const secondaryCtaLabel =
    heroContent?.secondaryCta?.label?.trim() || "Upload Room Photo";

  // Split custom CMS heading around highlightedText if edited in Admin CMS; otherwise render canonical 2-line editorial heading
  const rawHeading = heroContent?.heading?.trim() || "";
  const rawHighlight = heroContent?.highlightedText?.trim() || "Own Space.";
  const useDefaultHeading =
    !rawHeading || rawHeading === "Visualize the Design in Your Own Space.";

  const motionProps = (delay = 0) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.5,
            delay,
            ease: [0.22, 1, 0.36, 1] as const,
          },
        };

  return (
    <section
      aria-labelledby="visualizer-hero-heading"
      className="relative overflow-x-clip bg-[#FAF6F0] pt-6 pb-10 sm:pt-9 sm:pb-12 lg:pt-10 lg:pb-11"
    >
      {/* Sunlit Venetian Plaster, Botanical Shadows & Limestone Display Shelf Set */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={atelierImages.visualizer.heroLimestoneSet}
          alt=""
          fetchPriority="high"
          className="hidden h-full w-full object-cover object-bottom lg:block"
        />
        {/* Soft cream veil over bottom-right limestone shelf so the 3 feature highlights stay high-contrast */}
        <div className="hidden lg:block lg:absolute lg:right-0 lg:bottom-0 lg:h-36 lg:w-[50%] lg:bg-gradient-to-l lg:from-[#FAF6F0] lg:via-[#FAF6F0]/95 lg:to-transparent" />
        {/* Gentle mobile/tablet sunlit plaster gradient without decorative prop clutter */}
        <div className="h-full w-full bg-[radial-gradient(ellipse_at_top_left,#F3E9DC_0%,#FAF6F0_62%)] lg:hidden" />
      </div>

      {/* Exact Shared Global Navbar Container Alignment */}
      <div className="relative z-10 mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-6 xl:px-10">
        {showInvalidQueryBanner && (
          <div
            role="status"
            className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D9B8B4] bg-[#FFFDF9] px-4 py-3 text-xs text-[#2B221E]"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-[#9B1C1C]" />
              <span>
                That design link was not recognized—loaded{" "}
                <strong>{displayTitle}</strong> so you can preview right away or
                switch artworks below.
              </span>
            </div>
            <button
              type="button"
              onClick={onDismissInvalidNotice}
              className="cursor-pointer font-semibold text-[#9B1C1C] hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Responsive Hero Grid:
            Mobile (<768px):
              1. Heading -> 2. Description -> 3. Selected artwork -> 4. Start Live Preview -> 5. Upload Room Photo
              -> 6. Laptop preview -> 7. Compact mobile mockup + Mode selector -> 8. Feature highlights
            Desktop (lg+):
              Left ~57% (cols 1-7): Floating Mode Selector + Laptop + Overlapping Smartphone resting on Limestone Shelf
              Right ~43% (cols 8-12): Eyebrow, Heading, Paragraph, Currently Previewing, CTAs, Feature Highlights */}
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-7 lg:gap-y-5 xl:gap-x-10">
          {/* BLOCK 1: Right Editorial Copy + Currently Previewing + Primary CTAs (Order 1 on Mobile) */}
          <motion.div
            {...motionProps(0.04)}
            className="order-1 lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:self-end"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-[1.5px] w-7 bg-[#9B1C1C]"
              />
              <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9B1C1C]">
                {eyebrow}
              </span>
            </div>

            {/* Editorial Serif Heading */}
            <h1
              id="visualizer-hero-heading"
              className="mt-3 font-serif text-[36px] font-normal leading-[1.08] tracking-[-0.02em] text-[#1A1A1A] sm:text-[44px] lg:text-[44px] xl:text-[50px]"
            >
              {useDefaultHeading ? (
                <>
                  <span className="block">Visualize the Design</span>
                  <span className="mt-0.5 block">
                    in Your{" "}
                    <em className="font-serif italic text-[#9B1C1C]">
                      Own Space.
                    </em>
                  </span>
                </>
              ) : rawHighlight && rawHeading.includes(rawHighlight) ? (
                <>
                  {rawHeading.slice(0, rawHeading.indexOf(rawHighlight))}
                  <em className="font-serif italic text-[#9B1C1C]">
                    {rawHighlight}
                  </em>
                  {rawHeading.slice(
                    rawHeading.indexOf(rawHighlight) + rawHighlight.length
                  )}
                </>
              ) : (
                rawHeading
              )}
            </h1>

            {/* Supporting Paragraph */}
            <p className="mt-3.5 max-w-[48ch] font-sans text-[14.5px] leading-[1.65] text-[#5C534C] sm:text-[15px]">
              {subheading}
            </p>

            {/* Currently Previewing Module — Directly Beneath Paragraph */}
            <div className="mt-5">
              <CurrentlyPreviewingModule
                selectedDesign={selectedDesign}
                displayTitle={displayTitle}
                onOpenSelector={onOpenArtworkSelector}
              />
            </div>

            {/* Hero Main Action Buttons */}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                type="button"
                onClick={onLaunchAutoFit}
                className="inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-full bg-[#9B1C1C] px-6 py-3.5 text-sm font-semibold text-[#FFFDF9] shadow-[0_12px_28px_rgba(155,28,28,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#7D1616] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
              >
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>Upload Wall &amp; Auto-Fit Design</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </button>

              <button
                type="button"
                onClick={onLaunchLiveCamera}
                className="inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-full border border-[#DFD0C0] bg-[#FFFDF9] px-6 py-3.5 text-sm font-medium text-[#1A1A1A] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#9B1C1C] hover:text-[#9B1C1C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
              >
                <Camera className="h-4 w-4 shrink-0" />
                <span>{primaryCtaLabel}</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </button>

              <button
                type="button"
                onClick={onLaunchUploadPhoto}
                className="inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-full border border-[#DFD0C0] bg-[#FFFDF9] px-6 py-3.5 text-sm font-medium text-[#1A1A1A] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#9B1C1C] hover:text-[#9B1C1C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
              >
                <ImageIcon className="h-4 w-4 shrink-0 text-[#9B1C1C]" />
                <span>{secondaryCtaLabel}</span>
              </button>
            </div>
          </motion.div>

          {/* BLOCK 2: Left Laptop + Overlapping Smartphone + Floating Mode Selector (Order 2 on Mobile) */}
          <motion.div
            {...motionProps(0)}
            className="relative order-2 lg:col-span-7 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:pt-3 lg:pb-1"
          >
            {/* Laptop + Tablet/Desktop Overlapping Smartphone Stage */}
            <div className="relative md:pr-9 lg:pr-10 lg:pl-14 xl:pr-11 xl:pl-18">
              <LaptopWallPreview
                selectedDesign={selectedDesign}
                displayTitle={displayTitle}
                activeRoom={activeRoom}
                comparisonMode={comparisonMode}
                onComparisonChange={onComparisonChange}
                onOpenStudioWithRoom={onOpenRoomInStudio}
              />

              {/* Tablet (768px+) & Desktop Overlapping Smartphone Mockup */}
              <motion.div
                {...(prefersReducedMotion
                  ? {}
                  : {
                      initial: { opacity: 0, x: 12, y: 8 },
                      animate: { opacity: 1, x: 0, y: 0 },
                      transition: {
                        duration: 0.55,
                        delay: 0.12,
                        ease: [0.22, 1, 0.36, 1] as const,
                      },
                    })}
                className="hidden md:block md:absolute md:right-1 md:-bottom-1.5 md:z-20 md:w-[112px] lg:right-0 lg:-bottom-1 lg:w-[122px] xl:w-[136px]"
              >
                <MobileCameraMockup
                  selectedDesign={selectedDesign}
                  displayTitle={displayTitle}
                  onLaunchLiveCamera={onLaunchLiveCamera}
                />
              </motion.div>
            </div>

            {/* Mobile (<768px) Non-Overlapping Compact Smartphone Preview Card */}
            <div className="mt-3.5 flex items-center gap-3.5 rounded-2xl border border-[#E5D9CA] bg-[#FFFDF9]/94 p-3 md:hidden">
              <MobileCameraMockup
                selectedDesign={selectedDesign}
                displayTitle={displayTitle}
                onLaunchLiveCamera={onLaunchLiveCamera}
                className="w-[74px] shrink-0"
              />
              <div className="min-w-0">
                <p className="font-serif text-lg leading-snug text-[#1A1A1A]">
                  Mobile Camera Preview
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-[#746B64]">
                  Tap to frame your room wall with your phone camera and preview{" "}
                  <strong className="font-medium text-[#1A1A1A]">
                    {displayTitle}
                  </strong>
                  .
                </p>
              </div>
            </div>

            {/* Floating Left-Side Mode Selector (Docked Left of Laptop on lg+, Compact Bar Below on <lg) */}
            <div className="mt-3.5 md:mt-5 lg:absolute lg:top-[16%] lg:left-0 lg:z-30 lg:mt-0 xl:left-2">
              <PreviewModeSelector
                activeMode={activeMode}
                activeRoom={activeRoom}
                roomPickerOpen={roomPickerOpen}
                onSelectLiveCamera={onLaunchLiveCamera}
                onSelectUploadPhoto={onLaunchUploadPhoto}
                onToggleRoomPicker={onToggleRoomPicker}
                onChooseSampleRoom={onChooseSampleRoom}
                onOpenRoomInStudio={onOpenRoomInStudio}
              />
            </div>
          </motion.div>

          {/* BLOCK 3: Three Compact Feature Highlights (Order 3 on Mobile, Right Column Row 2 on Desktop) */}
          <motion.div
            {...motionProps(0.14)}
            className="order-3 lg:col-span-5 lg:col-start-8 lg:row-start-2 lg:self-start"
          >
            <div className="grid grid-cols-1 gap-3 border-t border-[#E5D9CA] pt-4 min-[520px]:grid-cols-3 min-[520px]:gap-0 min-[520px]:divide-x min-[520px]:divide-[#DFD0C0]">
              {FEATURE_HIGHLIGHTS.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className={
                      index === 0
                        ? "flex items-start gap-2 min-[520px]:pr-3"
                        : index === 1
                          ? "flex items-start gap-2 min-[520px]:px-3"
                          : "flex items-start gap-2 min-[520px]:pl-3"
                    }
                  >
                    <Icon
                      aria-hidden="true"
                      className="mt-0.5 h-5 w-5 shrink-0 stroke-[1.6] text-[#9B1C1C]"
                    />
                    <div className="min-w-0">
                      <p className="text-[11.5px] font-semibold leading-snug text-[#1A1A1A]">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-snug text-[#746B64]">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
