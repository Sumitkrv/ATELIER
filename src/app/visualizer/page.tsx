"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PublicShell } from "@/components/layout/PublicShell";
import { Container } from "@/components/layout/Container";
import { InteractiveWallVisualizerModal } from "@/components/visualizer/InteractiveWallVisualizerModal";
import {
  CatalogueDesignItem,
  DESIGN_CATEGORY_RECORDS,
  DEVELOPMENT_FIXTURE_DESIGNS,
  findDesignBySlugOrId,
} from "@/lib/designs-catalogue";
import {
  readStagedDesignFromSession,
  stageDesignForWallVisualizer,
  WallVisionAssetPayload,
} from "@/lib/visualizer-bridge";
import { ATELIER_ASSET_REGISTRY } from "@/lib/asset-registry";
import { cn } from "@/lib/cn";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Image as ImageIcon,
  Maximize2,
  Scan,
  Sparkles,
  X,
} from "lucide-react";

const DEFAULT_BOTANICAL_DESIGN: CatalogueDesignItem =
  DEVELOPMENT_FIXTURE_DESIGNS.find((d) => d.id === "design-slot-1") ||
  DEVELOPMENT_FIXTURE_DESIGNS[0];

const PREVIEW_STEPS: ReadonlyArray<{
  step: string;
  title: string;
  description: string;
}> = [
  {
    step: "01",
    title: "Choose Mode",
    description:
      "Select Live Camera View on your smartphone or Upload Room Photo on desktop.",
  },
  {
    step: "02",
    title: "Map Four Wall Corners",
    description:
      "Drag the four corner pins (TL, TR, BR, BL) to match your wall’s real perspective.",
  },
  {
    step: "03",
    title: "Adjust Mural or Pattern",
    description:
      "Refine scale, wall-plaster blend opacity, ambient exposure, and orientation.",
  },
  {
    step: "04",
    title: "Compare Before & After",
    description:
      "Toggle between your bare room elevation and the mapped ATELIER surface artwork.",
  },
  {
    step: "05",
    title: "Save or Enquire",
    description:
      "Export a high-resolution snapshot or share your selection with our Mumbai studio.",
  },
];

function formatVisualizerDisplayTitle(design: CatalogueDesignItem): string {
  if (
    design.id === "design-slot-1" &&
    design.title.toLowerCase() === "botanical canopy"
  ) {
    return "Botanical Canopy Wall Mural";
  }
  return design.title;
}

function formatCollectionSlotLabel(slotNumber: number): string {
  const padded = String(slotNumber).padStart(2, "0");
  return `Category ${padded}`;
}

function VisualizerExperienceWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawDesignParam =
    searchParams.get("design") || searchParams.get("id") || "";
  const rawTitleParam = searchParams.get("title") || "";
  const rawSlotParam = searchParams.get("slot") || "";
  const rawCategoryParam = searchParams.get("category") || "";
  const rawModeParam = searchParams.get("mode");

  const externalVisualizerBase =
    process.env.NEXT_PUBLIC_WALL_VISUALIZER_URL ||
    "http://localhost:3001/visualizer";

  // Resolve initial design from URL params -> sessionStorage -> default Botanical Canopy Wall Mural
  const resolution = useMemo<{
    design: CatalogueDesignItem;
    wasInvalidQuery: boolean;
    customTitleOverride: string | null;
  }>(() => {
    if (rawDesignParam.trim().length > 0) {
      const matched = findDesignBySlugOrId(
        rawDesignParam,
        DEVELOPMENT_FIXTURE_DESIGNS
      );
      if (matched) {
        return {
          design: matched,
          wasInvalidQuery: false,
          customTitleOverride: rawTitleParam.trim() || null,
        };
      }

      // Check if sessionStorage has a staged asset matching this slug
      const sessionAsset = readStagedDesignFromSession();
      if (sessionAsset && sessionAsset.id === rawDesignParam) {
        const fromSessionCatalogue = findDesignBySlugOrId(
          sessionAsset.id,
          DEVELOPMENT_FIXTURE_DESIGNS
        );
        if (fromSessionCatalogue) {
          return {
            design: fromSessionCatalogue,
            wasInvalidQuery: false,
            customTitleOverride: sessionAsset.name,
          };
        }
      }

      // If an unrecognised design slug was passed without a title override, flag recovery state
      if (!rawTitleParam.trim()) {
        return {
          design: DEFAULT_BOTANICAL_DESIGN,
          wasInvalidQuery: true,
          customTitleOverride: null,
        };
      }
    }

    // Try sessionStorage if user arrived directly on /visualizer
    const sessionStaged = readStagedDesignFromSession();
    if (sessionStaged) {
      const matchedFromSession =
        findDesignBySlugOrId(sessionStaged.id, DEVELOPMENT_FIXTURE_DESIGNS) ||
        findDesignBySlugOrId(sessionStaged.name, DEVELOPMENT_FIXTURE_DESIGNS);
      if (matchedFromSession) {
        return {
          design: matchedFromSession,
          wasInvalidQuery: false,
          customTitleOverride: null,
        };
      }
    }

    return {
      design: DEFAULT_BOTANICAL_DESIGN,
      wasInvalidQuery: false,
      customTitleOverride: rawTitleParam.trim() || null,
    };
  }, [rawDesignParam, rawTitleParam]);

  const [selectedDesign, setSelectedDesign] = useState<CatalogueDesignItem>(
    resolution.design
  );
  const [prevResolvedId, setPrevResolvedId] = useState<string>(
    resolution.design.id
  );
  if (resolution.design.id !== prevResolvedId) {
    setPrevResolvedId(resolution.design.id);
    setSelectedDesign(resolution.design);
  }

  const [dismissedInvalidNotice, setDismissedInvalidNotice] =
    useState<boolean>(false);

  // Active mode: 'camera' (default) or 'photo'
  const urlMode: "camera" | "photo" =
    rawModeParam === "photo" ? "photo" : "camera";
  const [preferredMode, setPreferredMode] = useState<"camera" | "photo">(
    urlMode
  );
  const [prevUrlMode, setPrevUrlMode] = useState<"camera" | "photo">(urlMode);
  if (urlMode !== prevUrlMode) {
    setPrevUrlMode(urlMode);
    setPreferredMode(urlMode);
  }

  // Interactive Wall Visualizer Modal State
  const [studioModalOpen, setStudioModalOpen] = useState<boolean>(false);
  const [studioLaunchMode, setStudioLaunchMode] = useState<"camera" | "photo">(
    "camera"
  );

  // Artwork Lightbox Modal State
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [previewImgError, setPreviewImgError] = useState<boolean>(false);
  const [guideExpanded, setGuideExpanded] = useState<boolean>(false);

  const lightboxCloseBtnRef = useRef<HTMLButtonElement | null>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  // Compute human-friendly display strings matching the approved reference image
  const displayTitle = useMemo(() => {
    if (
      resolution.customTitleOverride &&
      selectedDesign.id === resolution.design.id
    ) {
      return resolution.customTitleOverride;
    }
    return formatVisualizerDisplayTitle(selectedDesign);
  }, [
    resolution.customTitleOverride,
    resolution.design.id,
    selectedDesign,
  ]);

  const collectionDisplay = useMemo(() => {
    if (rawCategoryParam.trim()) {
      const matchingCat = DESIGN_CATEGORY_RECORDS.find(
        (c) =>
          c.slug.toLowerCase() === rawCategoryParam.trim().toLowerCase() ||
          c.name.toLowerCase() === rawCategoryParam.trim().toLowerCase()
      );
      if (matchingCat) {
        return formatCollectionSlotLabel(matchingCat.slotNumber);
      }
    }
    if (rawSlotParam.trim() && Number.isInteger(Number(rawSlotParam))) {
      return formatCollectionSlotLabel(Number(rawSlotParam));
    }
    return formatCollectionSlotLabel(selectedDesign.categorySlotNumber);
  }, [rawCategoryParam, rawSlotParam, selectedDesign.categorySlotNumber]);

  const applicationModeDisplay =
    selectedDesign.visualizerConfig.defaultMode === "pattern"
      ? "Pattern"
      : "Mural";

  // For Botanical Canopy Wall Mural, use the signature sunlit botanical living room preview shown in the reference
  const previewImageUrl = useMemo(() => {
    if (previewImgError) {
      return "/images/atelier/hero-botanical-living.jpg";
    }
    if (selectedDesign.id === "design-slot-1") {
      return "/images/atelier/hero-botanical-living.jpg";
    }
    return (
      selectedDesign.coverImage.secureUrl ||
      "/images/atelier/hero-botanical-living.jpg"
    );
  }, [previewImgError, selectedDesign]);

  // Stage active design into sessionStorage & IndexedDB whenever it changes
  const stagedPayload = useMemo<WallVisionAssetPayload>(
    () => ({
      id: selectedDesign.slug,
      name: displayTitle,
      category: collectionDisplay,
      dataUrl:
        selectedDesign.visualizerConfig.textureUrl ||
        selectedDesign.coverImage.secureUrl,
      width: selectedDesign.visualizerConfig.width || 1600,
      height: selectedDesign.visualizerConfig.height || 1000,
      mimeType: selectedDesign.visualizerConfig.mimeType || "image/jpeg",
      defaultMode: selectedDesign.visualizerConfig.defaultMode,
      description: selectedDesign.summary,
    }),
    [selectedDesign, displayTitle, collectionDisplay]
  );

  useEffect(() => {
    stageDesignForWallVisualizer(stagedPayload).catch(() => {});
  }, [stagedPayload]);

  // Handle launching the interactive visualizer in either 'camera' or 'photo' mode
  const handleLaunchVisualizer = useCallback(
    (mode: "camera" | "photo") => {
      setPreferredMode(mode);
      setStudioLaunchMode(mode);
      stageDesignForWallVisualizer(stagedPayload).catch(() => {});
      setStudioModalOpen(true);
    },
    [stagedPayload]
  );

  // Handle selecting another artwork from the curated studio strip
  const handleSelectDesign = useCallback(
    (design: CatalogueDesignItem) => {
      setSelectedDesign(design);
      setPreviewImgError(false);
      setDismissedInvalidNotice(true);
      const params = new URLSearchParams(searchParams.toString());
      params.set("design", design.slug);
      params.set("title", formatVisualizerDisplayTitle(design));
      params.set("slot", String(design.categorySlotNumber));
      router.replace(`/visualizer?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Lightbox keyboard handling
  useEffect(() => {
    if (!lightboxOpen) return;
    const timer = window.setTimeout(() => {
      lightboxCloseBtnRef.current?.focus();
    }, 20);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
        lastTriggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxOpen]);

  const showInvalidQueryBanner =
    resolution.wasInvalidQuery && !dismissedInvalidNotice;

  return (
    <>
      {/* =====================================================================
          MAIN SCULPTURAL HERO + TWO-PANEL WALL VISUALIZER STAGE
          Matches approved reference image (`media_1793896255212_1b80dfd4.jpg`)
         ===================================================================== */}
      <section className="relative overflow-hidden bg-[#F7F3ED] pt-10 pb-16 sm:pt-12 sm:pb-20 lg:pt-14 lg:pb-24">
        {/* Full-Bleed Sculptural Plaster Arch Background in Warm Cream */}
        <div className="pointer-events-none absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ATELIER_ASSET_REGISTRY.visualizerHeroBurgundyAlcove.url}
            alt={ATELIER_ASSET_REGISTRY.visualizerHeroBurgundyAlcove.altText}
            className="h-full w-full object-cover object-left-top opacity-25"
          />
          {/* Warm cream & soft beige architectural plaster wash */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-[#F7F3ED]/92 via-[#F2EBE2]/88 to-[#EBE3D8]/92"
          />
          {/* Bottom warm cream grounding transition */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#F7F3ED] via-[#F7F3ED]/65 to-transparent"
          />
        </div>

        <Container className="relative z-10">
          {/* Top Sculptural Editorial Header (Left-Aligned over Cream Plaster) */}
          <div className="max-w-[650px]">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-[1.5px] w-7 bg-[#9A2125]"
              />
              <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9A2125]">
                ATELIER — WALL STORY • INTERACTIVE WALL PREVIEW
              </span>
            </div>

            {/* Two-Line Editorial Serif Headline */}
            <h1 className="mt-4 font-serif text-4xl font-normal leading-[1.08] tracking-[-0.015em] text-[#1D1816] sm:text-5xl lg:text-[56px]">
              <span className="block">Preview Your Selected Design</span>
              <span className="mt-1 block text-[#8C1B1F]">
                Directly on Your Wall
              </span>
            </h1>

            {/* Supporting Description */}
            <p className="mt-5 max-w-[540px] font-sans text-[15px] leading-[1.68] text-[#4A413B] sm:text-base">
              Map your room wall corners using your smartphone camera or an
              uploaded room photo to experience how your chosen Atelier artwork
              transforms your space in real time.
            </p>

            {/* Segmented Mode Switcher Pill Bar */}
            <div
              role="group"
              aria-label="Select Wall Visualizer Preview Mode"
              className="mt-7 inline-flex max-w-full flex-wrap items-center rounded-2xl border border-[#DFD2C3] bg-[#FAF6F0]/95 p-1.5 shadow-[0_10px_28px_rgba(32,24,20,0.08)] backdrop-blur-md min-[380px]:rounded-full"
            >
              <button
                type="button"
                onClick={() => setPreferredMode("camera")}
                onDoubleClick={() => handleLaunchVisualizer("camera")}
                aria-pressed={preferredMode === "camera"}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-medium transition-all min-[400px]:gap-2 min-[400px]:px-4 min-[400px]:text-xs sm:px-5",
                  preferredMode === "camera"
                    ? "bg-[#F3E6E4] font-semibold text-[#8C1B1F] shadow-xs"
                    : "text-[#3B332E] hover:text-[#8C1B1F]"
                )}
              >
                <Camera className="h-3.5 w-3.5 shrink-0 text-[#921A1E]" />
                <span>Live Camera View</span>
              </button>

              <span
                aria-hidden="true"
                className="mx-1 hidden h-4 w-px bg-[#DFD2C3] min-[380px]:block"
              />

              <button
                type="button"
                onClick={() => setPreferredMode("photo")}
                onDoubleClick={() => handleLaunchVisualizer("photo")}
                aria-pressed={preferredMode === "photo"}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-medium transition-all min-[400px]:gap-2 min-[400px]:px-4 min-[400px]:text-xs sm:px-5",
                  preferredMode === "photo"
                    ? "bg-[#F3E6E4] font-semibold text-[#8C1B1F] shadow-xs"
                    : "text-[#3B332E] hover:text-[#8C1B1F]"
                )}
              >
                <ImageIcon className="h-3.5 w-3.5 shrink-0 text-[#921A1E]" />
                <span>Upload Room Photo</span>
              </button>
            </div>
          </div>

          {/* Optional Invalid Slug Recovery Notice */}
          {showInvalidQueryBanner && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D9B8B4] bg-[#FAF6F0]/95 px-5 py-3.5 text-xs text-[#2B221E] shadow-sm">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-[#921A1E]" />
                <span>
                  The requested artwork link could not be matched. We have
                  loaded <strong>{displayTitle}</strong> so you can begin
                  previewing immediately, or choose another design below.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDismissedInvalidNotice(true)}
                className="cursor-pointer font-semibold uppercase tracking-wider text-[#921A1E] hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* =================================================================
              TWO-PANEL LAUNCHER & ARTWORK PREVIEW GRID
             ================================================================= */}
          <div className="mt-10 grid grid-cols-1 items-stretch gap-7 lg:mt-12 lg:grid-cols-12">
            {/* LEFT PANEL: Selected Artwork Control Card */}
            <div className="flex flex-col justify-between rounded-[26px] border border-[#E6DBD0] bg-[#FAF6F0]/98 p-6 shadow-[0_26px_65px_rgba(28,20,16,0.10)] backdrop-blur-md sm:p-9 lg:col-span-7 lg:p-10">
              <div>
                {/* Status Pill Badge */}
                <div className="inline-flex items-center gap-2 rounded-full bg-[#F5E1DE] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8E1C20]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#921A1E]" />
                  <span>Artwork Ready for Live Wall Preview</span>
                </div>

                {/* Selected Artwork Title */}
                <h2 className="mt-4 font-serif text-3xl font-normal leading-[1.12] text-[#1D1816] sm:text-4xl lg:text-[42px]">
                  {displayTitle}
                </h2>

                {/* Supporting Description */}
                <p className="mt-3 max-w-2xl text-sm leading-[1.68] text-[#554B44] sm:text-[15px]">
                  Your selected artwork has been prepared for our interactive
                  Wall Visualizer. Choose whether you would like to use your
                  live camera or upload a photograph of your room elevation
                  below.
                </p>

                {/* 2x2 Artwork Metadata Box */}
                <div className="mt-6 rounded-2xl border border-[#E4D9CA] bg-[#F3ECE1] px-5 py-4 text-xs text-[#2B2420] sm:text-[13px]">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:divide-x sm:divide-[#DFD3C2]">
                    <div className="space-y-2.5 sm:pr-5">
                      <div>
                        <span className="text-[#786D63]">Selected Design:</span>{" "}
                        <strong className="font-semibold text-[#1D1816]">
                          {displayTitle}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#786D63]">Collection:</span>{" "}
                        <strong className="font-semibold text-[#1D1816]">
                          {collectionDisplay}
                        </strong>
                      </div>
                    </div>

                    <div className="space-y-2.5 border-t border-[#DFD3C2] pt-2.5 sm:border-t-0 sm:pt-0 sm:pl-6">
                      <div>
                        <span className="text-[#786D63]">
                          Application Mode:
                        </span>{" "}
                        <strong className="font-semibold text-[#1D1816]">
                          {applicationModeDisplay}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#786D63]">
                          Recommended View:
                        </span>{" "}
                        <strong className="font-semibold text-[#1D1816]">
                          {preferredMode === "photo"
                            ? "Uploaded Room Photo"
                            : "Live Smartphone Camera"}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Visualizer Launch Buttons */}
                <div className="mt-7 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => handleLaunchVisualizer("camera")}
                    className="inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-[#921A1E] px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#FAF6F0] shadow-[0_12px_28px_rgba(146,26,30,0.26)] transition-all hover:bg-[#771418] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#921A1E] sm:text-xs"
                  >
                    <Camera className="h-4 w-4 shrink-0" />
                    <span>Open Live Camera Visualizer</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-85" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLaunchVisualizer("photo")}
                    className="inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-[#D5C7B6] bg-[#FAF6F0] px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1E1916] transition-all hover:border-[#921A1E] hover:bg-[#F5EDE2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#921A1E] sm:text-xs"
                  >
                    <ImageIcon className="h-4 w-4 shrink-0 text-[#921A1E]" />
                    <span>Open Room Photo Mode</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-75" />
                  </button>
                </div>
              </div>

              {/* Bottom Secondary Actions Row */}
              <div className="mt-7 flex flex-wrap items-center justify-between gap-3.5 border-t border-[#E6DBD0] pt-6">
                <Link
                  href={`/contact?design=${encodeURIComponent(
                    selectedDesign.slug
                  )}&title=${encodeURIComponent(
                    displayTitle
                  )}&category=${encodeURIComponent(
                    selectedDesign.categoryLabel
                  )}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1B1715] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#FAF6F0] transition-colors hover:bg-[#312A26] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#921A1E]"
                >
                  <span>Enquire About This Design</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>

                <Link
                  href="/explore-designs"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#DDD0C0] bg-[#F5EFE6] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#2B2420] transition-colors hover:border-[#921A1E] hover:text-[#921A1E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#921A1E]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to All 13 Categories</span>
                </Link>
              </div>
            </div>

            {/* RIGHT PANEL: Warm Ivory Selected Artwork Preview Card */}
            <div className="flex flex-col justify-between rounded-[26px] border border-[#DDD2C5] bg-[#FBF8F3] p-6 text-[#211D1A] shadow-[0_24px_60px_rgba(33,29,26,0.09)] sm:p-8 lg:col-span-5">
              <div>
                {/* Eyebrow */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9B1C1C]">
                    <Scan className="h-3.5 w-3.5 text-[#9B1C1C]" />
                    <span>Selected Artwork Preview</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      lastTriggerRef.current = e.currentTarget;
                      setLightboxOpen(true);
                    }}
                    aria-label={`Inspect ${displayTitle} in full resolution`}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#DDD2C5] bg-[#F2EBE2] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[#211D1A] transition-colors hover:border-[#9B1C1C] hover:bg-[#F6EAE6]"
                  >
                    <Maximize2 className="h-3 w-3 text-[#9B1C1C]" />
                    <span>Expand</span>
                  </button>
                </div>

                {/* Selected Artwork Title */}
                <h3 className="mt-2 font-serif text-2xl font-normal leading-tight text-[#211D1A] sm:text-[28px]">
                  {displayTitle}
                </h3>

                {/* Large Rounded Landscape Artwork Preview Image */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    lastTriggerRef.current = e.currentTarget;
                    setLightboxOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      lastTriggerRef.current = e.currentTarget;
                      setLightboxOpen(true);
                    }
                  }}
                  aria-label={`Click to enlarge ${displayTitle} room preview`}
                  className="group relative mt-4 aspect-[16/10] w-full cursor-zoom-in overflow-hidden rounded-2xl border border-[#DDD2C5] bg-[#EBE3D8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewImageUrl}
                    alt={`${displayTitle} — architectural interior wall preview`}
                    onError={() => setPreviewImgError(true)}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>

                {/* Instructional Caption */}
                <p className="mt-4 text-xs leading-[1.68] text-[#6F665E] sm:text-[13px]">
                  Map the four corners of your wall inside the visualizer to
                  adjust scale, alignment, and perspective—and export a snapshot
                  to share with our Mumbai studio team.
                </p>
              </div>
            </div>
          </div>

          {/* =================================================================
              SECONDARY STUDIO DOCK: QUICK ARTWORK SWITCHER & 5-STEP HELPER
             ================================================================= */}
          <div className="mt-10 rounded-2xl border border-[#DFD2C2] bg-[#FAF6F0]/90 px-5 py-4 shadow-xs backdrop-blur-sm sm:px-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Quick Curated Design Selector Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8C1B1F]">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Switch Artwork:</span>
                </span>
                {DEVELOPMENT_FIXTURE_DESIGNS.slice(0, 6).map((item) => {
                  const isSelected = item.id === selectedDesign.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectDesign(item)}
                      className={cn(
                        "cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-all",
                        isSelected
                          ? "border-[#921A1E] bg-[#921A1E] text-[#FAF6F0]"
                          : "border-[#DDD0C0] bg-[#F5EFE6] text-[#2B2420] hover:border-[#921A1E]"
                      )}
                    >
                      {item.title}
                    </button>
                  );
                })}
              </div>

              {/* Collapsible 5-Step How-To-Preview Toggle */}
              <button
                type="button"
                onClick={() => setGuideExpanded((v) => !v)}
                aria-expanded={guideExpanded}
                className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#554B44] transition-colors hover:text-[#921A1E]"
              >
                <span>How Wall Mapping Works (5 Steps)</span>
                {guideExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>

            {guideExpanded && (
              <div className="mt-5 grid grid-cols-1 gap-3 border-t border-[#E5D9C9] pt-5 sm:grid-cols-2 lg:grid-cols-5">
                {PREVIEW_STEPS.map((item) => (
                  <div
                    key={item.step}
                    className="rounded-xl border border-[#E5D9C9] bg-[#F4ECE1] p-3.5"
                  >
                    <span className="font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-[#921A1E]">
                      Step {item.step}
                    </span>
                    <h4 className="mt-1 font-serif text-base font-medium text-[#1D1816]">
                      {item.title}
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-[#554B44]">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* =====================================================================
          INTERACTIVE 4-CORNER WALL VISUALIZER STUDIO MODAL
         ===================================================================== */}
      <InteractiveWallVisualizerModal
        isOpen={studioModalOpen}
        initialMode={studioLaunchMode}
        selectedDesign={selectedDesign}
        externalVisualizerUrl={externalVisualizerBase}
        onSelectDesign={handleSelectDesign}
        onClose={() => setStudioModalOpen(false)}
      />

      {/* =====================================================================
          HIGH-RESOLUTION ARTWORK PREVIEW LIGHTBOX MODAL
         ===================================================================== */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${displayTitle} High-Resolution Preview`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setLightboxOpen(false);
              lastTriggerRef.current?.focus();
            }
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#140F0D]/90 p-4 backdrop-blur-md"
        >
          <div className="relative max-h-[90dvh] w-full max-w-5xl overflow-hidden rounded-3xl border border-white/15 bg-[#230B0E] p-4 text-[#FAF6F0] shadow-2xl sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D99B96]">
                  {collectionDisplay} • {selectedDesign.categoryLabel}
                </p>
                <h3 className="font-serif text-2xl text-[#FAF6F0]">
                  {displayTitle}
                </h3>
              </div>
              <button
                ref={lightboxCloseBtnRef}
                type="button"
                onClick={() => {
                  setLightboxOpen(false);
                  lastTriggerRef.current?.focus();
                }}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#FAF6F0] hover:bg-[#921A1E]"
              >
                <X className="h-4 w-4" />
                <span>Close</span>
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImageUrl}
                alt={displayTitle}
                className="max-h-[70dvh] w-full object-contain"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-[#DFCFC3]/85">
                Compatible Substrates:{" "}
                <strong>{selectedDesign.compatibleSurfaces.join(" • ")}</strong>
              </p>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setLightboxOpen(false);
                    handleLaunchVisualizer(preferredMode);
                  }}
                  className="cursor-pointer rounded-full bg-[#921A1E] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#771418]"
                >
                  Launch 4-Corner Wall Studio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function VisualizerBridgePage() {
  return (
    <PublicShell>
      <Suspense
        fallback={
          <div className="py-36 text-center font-serif text-2xl text-[#1D1816]">
            Preparing ATELIER — WALL STORY Wall Preview…
          </div>
        }
      >
        <VisualizerExperienceWorkspace />
      </Suspense>
    </PublicShell>
  );
}
