"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { CatalogueDesignItem } from "@/lib/designs-catalogue";
import { atelierImages } from "@/lib/asset-registry";
import {
  drawPerspectiveWarpedArtwork,
  QuadCorners,
  SAMPLE_ROOM_ELEVATIONS,
  SampleRoomElevation,
} from "@/components/visualizer/InteractiveWallVisualizerModal";
import { cn } from "@/lib/cn";
import {
  ArrowUpRight,
  Camera,
  Check,
  Image as ImageIcon,
  LayoutGrid,
} from "lucide-react";

export type HeroPreviewMode = "camera" | "photo" | "room";

const PHONE_WALL_CORNERS: QuadCorners = [
  { x: 0.18, y: 0.2 },
  { x: 0.82, y: 0.2 },
  { x: 0.82, y: 0.56 },
  { x: 0.18, y: 0.56 },
];

function useLoadedArtworkImage(src: string): HTMLImageElement | null {
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (!cancelled) {
        setImgEl(img);
      }
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return imgEl;
}

interface LaptopWallPreviewProps {
  selectedDesign: CatalogueDesignItem;
  displayTitle: string;
  activeRoom: SampleRoomElevation;
  comparisonMode: "before" | "after";
  onComparisonChange: (mode: "before" | "after") => void;
  onOpenStudioWithRoom: (roomId: string) => void;
}

export function LaptopWallPreview({
  selectedDesign,
  displayTitle,
  activeRoom,
  comparisonMode,
  onComparisonChange,
  onOpenStudioWithRoom,
}: LaptopWallPreviewProps) {
  const screenRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const artworkSrc =
    selectedDesign.visualizerConfig.textureUrl ||
    selectedDesign.coverImage.secureUrl;
  const artworkImgEl = useLoadedArtworkImage(artworkSrc);

  const paintPreviewCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const screen = screenRef.current;
    if (!canvas || !screen) return;

    const rect = screen.getBoundingClientRect();
    const dpr =
      typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    const w = Math.max(320, Math.round(rect.width * dpr));
    const h = Math.max(200, Math.round(rect.height * dpr));

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);

    if (comparisonMode === "before" || !artworkImgEl) return;

    drawPerspectiveWarpedArtwork({
      ctx,
      artworkImg: artworkImgEl,
      corners: activeRoom.defaultCorners,
      canvasWidth: w,
      canvasHeight: h,
      mode: selectedDesign.visualizerConfig.defaultMode,
      scale: 1,
      opacity: 0.9,
      brightness: 100,
      blendMultiply: true,
      flipHorizontal: false,
      rotationQuarterTurns: 0,
    });
  }, [activeRoom, artworkImgEl, comparisonMode, selectedDesign]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      paintPreviewCanvas();
    });
    return () => cancelAnimationFrame(raf);
  }, [paintPreviewCanvas]);

  useEffect(() => {
    const screen = screenRef.current;
    if (!screen || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      paintPreviewCanvas();
    });
    observer.observe(screen);
    return () => observer.disconnect();
  }, [paintPreviewCanvas]);

  const corners = activeRoom.defaultCorners;
  const polygonPoints = corners
    .map((pt) => `${(pt.x * 100).toFixed(2)},${(pt.y * 100).toFixed(2)}`)
    .join(" ");

  return (
    <div className="relative w-full select-none">
      {/* Upper Laptop Display Lid */}
      <div className="relative mx-auto w-[94%] rounded-t-[18px] bg-[#191615] p-[8px] shadow-[0_24px_48px_rgba(26,20,16,0.22)] ring-1 ring-white/10 sm:rounded-t-[22px] sm:p-[11px]">
        {/* Top Bezel Camera Dot */}
        <span
          aria-hidden="true"
          className="absolute top-[4px] left-1/2 h-[4px] w-[4px] -translate-x-1/2 rounded-full bg-[#3A3431] sm:top-[5px]"
        />

        {/* Interactive Screen Surface */}
        <div
          ref={screenRef}
          className="group relative aspect-[16/10] w-full overflow-hidden rounded-[10px] bg-[#E8DFD3] sm:rounded-[12px]"
        >
          {/* Base Sample Room Photograph */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeRoom.imageUrl}
            alt={`${activeRoom.name} sample interior previewing ${displayTitle}`}
            className="h-full w-full object-cover"
          />

          {/* Perspective-Warped Selected Artwork Canvas */}
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-300",
              comparisonMode === "after" ? "opacity-100" : "opacity-0"
            )}
          />

          {/* Subtle Architectural Glass Reflection Sheen */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,253,249,0.12)_0%,rgba(255,253,249,0.02)_36%,transparent_58%)]"
          />

          {/* Crisp White 4-Corner Perspective Alignment Quad & Handles */}
          <svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full"
          >
            <polygon
              points={polygonPoints}
              fill="none"
              stroke="#FFFDF9"
              strokeWidth="0.42"
              strokeOpacity="0.94"
            />
          </svg>

          {corners.map((pt, idx) => (
            <span
              key={idx}
              aria-hidden="true"
              style={{
                left: `${pt.x * 100}%`,
                top: `${pt.y * 100}%`,
              }}
              className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFFDF9] shadow-[0_2px_8px_rgba(20,15,12,0.42)] sm:h-3.5 sm:w-3.5"
            />
          ))}

          {/* Click-to-open Interactive Studio Hit Layer */}
          <button
            type="button"
            onClick={() => onOpenStudioWithRoom(activeRoom.id)}
            aria-label={`Open interactive 4-corner wall mapping studio with ${displayTitle} in ${activeRoom.name}`}
            className="absolute inset-0 z-10 cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#FFFDF9]"
          >
            <span className="pointer-events-none absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-[#1A1614]/58 px-2.5 py-1 text-[10px] font-medium tracking-[0.03em] text-[#FFFDF9] opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 sm:top-3 sm:right-3 sm:px-3 sm:text-[11px]">
              <span>Open 4-Corner Studio</span>
              <ArrowUpRight className="h-3 w-3" />
            </span>
          </button>

          {/* Bottom-Center Segmented Before / After Pill */}
          <div
            role="group"
            aria-label="Toggle sample wall preview before and after"
            className="absolute bottom-2.5 left-1/2 z-20 inline-flex -translate-x-1/2 items-center rounded-full bg-[#FFFDF9]/96 p-1 shadow-[0_10px_26px_rgba(24,18,14,0.22)] sm:bottom-3.5"
          >
            <button
              type="button"
              onClick={() => onComparisonChange("before")}
              aria-pressed={comparisonMode === "before"}
              className={cn(
                "cursor-pointer rounded-full px-3.5 py-1 text-[11px] font-medium transition-colors sm:px-4.5 sm:py-1.5 sm:text-xs",
                comparisonMode === "before"
                  ? "bg-[#9B1C1C] font-semibold text-[#FFFDF9]"
                  : "text-[#2A231F] hover:text-[#9B1C1C]"
              )}
            >
              Before
            </button>
            <button
              type="button"
              onClick={() => onComparisonChange("after")}
              aria-pressed={comparisonMode === "after"}
              className={cn(
                "cursor-pointer rounded-full px-3.5 py-1 text-[11px] font-medium transition-colors sm:px-4.5 sm:py-1.5 sm:text-xs",
                comparisonMode === "after"
                  ? "bg-[#9B1C1C] font-semibold text-[#FFFDF9]"
                  : "text-[#2A231F] hover:text-[#9B1C1C]"
              )}
            >
              After
            </button>
          </div>
        </div>
      </div>

      {/* Brushed Space-Gray/Silver Laptop Base Lip & Shelf Contact Shadow */}
      <div className="relative mx-auto h-[11px] w-full rounded-t-[2px] rounded-b-[10px] bg-gradient-to-r from-[#8D8986] via-[#D8D4CF] to-[#878380] shadow-[0_14px_26px_rgba(28,20,16,0.26)] sm:h-[14px]">
        <span
          aria-hidden="true"
          className="absolute top-0 left-1/2 h-[4px] w-16 -translate-x-1/2 rounded-b-md bg-[#6E6A67] sm:w-20"
        />
      </div>
    </div>
  );
}

interface MobileCameraMockupProps {
  selectedDesign: CatalogueDesignItem;
  displayTitle: string;
  onLaunchLiveCamera: () => void;
  className?: string;
}

export function MobileCameraMockup({
  selectedDesign,
  displayTitle,
  onLaunchLiveCamera,
  className,
}: MobileCameraMockupProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const phoneCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const artworkSrc =
    selectedDesign.visualizerConfig.textureUrl ||
    selectedDesign.coverImage.secureUrl;
  const artworkImgEl = useLoadedArtworkImage(artworkSrc);

  const paintPhoneCanvas = useCallback(() => {
    const canvas = phoneCanvasRef.current;
    const frame = frameRef.current;
    if (!canvas || !frame) return;

    const rect = frame.getBoundingClientRect();
    const dpr =
      typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    const w = Math.max(140, Math.round(rect.width * dpr));
    const h = Math.max(260, Math.round(rect.height * dpr));

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);

    if (!artworkImgEl) return;

    drawPerspectiveWarpedArtwork({
      ctx,
      artworkImg: artworkImgEl,
      corners: PHONE_WALL_CORNERS,
      canvasWidth: w,
      canvasHeight: h,
      mode: selectedDesign.visualizerConfig.defaultMode,
      scale: 1,
      opacity: 0.9,
      brightness: 100,
      blendMultiply: true,
      flipHorizontal: false,
      rotationQuarterTurns: 0,
    });
  }, [artworkImgEl, selectedDesign]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      paintPhoneCanvas();
    });
    return () => cancelAnimationFrame(raf);
  }, [paintPhoneCanvas]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      paintPhoneCanvas();
    });
    ro.observe(frame);
    return () => ro.disconnect();
  }, [paintPhoneCanvas]);

  return (
    <button
      type="button"
      onClick={onLaunchLiveCamera}
      aria-label={`Launch Live Camera Wall Visualizer previewing ${displayTitle}`}
      className={cn(
        "group block cursor-pointer rounded-[24px] bg-[#141211] p-[5px] text-left shadow-[0_22px_44px_rgba(24,18,14,0.34)] ring-1 ring-white/15 transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C] sm:rounded-[28px] sm:p-[6px]",
        className
      )}
    >
      <div
        ref={frameRef}
        className="relative aspect-[9/18.6] w-full overflow-hidden rounded-[20px] bg-[#D9CEC0] sm:rounded-[23px]"
      >
        {/* Base Vertical Room Camera Feed */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={atelierImages.visualizer.phoneCameraWallPreview}
          alt={`Smartphone camera wall preview of ${displayTitle}`}
          className="h-full w-full object-cover"
        />

        {/* Dynamic Selected Artwork Mapped onto the Phone Camera Wall */}
        <canvas
          ref={phoneCanvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
        />

        {/* Subtle Top Status Bar & Dynamic Island */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-3 pt-1.5 text-[7.5px] font-semibold text-[#FFFDF9]"
        >
          <span>9:41</span>
          <span className="h-2.5 w-9 rounded-full bg-[#110F0E]" />
          <span className="h-1.5 w-3 rounded-[2px] border border-[#FFFDF9]/85" />
        </div>

        {/* Four Crisp White Perspective Boundary Reticles */}
        <svg
          aria-hidden="true"
          viewBox="0 0 100 186"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <path
            d="M16 46 V36 H26 M84 46 V36 H74 M16 102 V112 H26 M84 102 V112 H74"
            fill="none"
            stroke="#FFFDF9"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Bottom Camera Controls Band (PHOTO + White Capture Ring) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center justify-end bg-gradient-to-t from-black/80 via-black/48 to-transparent pt-4 pb-2.5"
        >
          <span className="mb-1 text-[6.5px] font-semibold uppercase tracking-[0.18em] text-[#E9C987]">
            PHOTO
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full border-[1.5px] border-[#FFFDF9]/92 bg-black/20 sm:h-8 sm:w-8">
            <span className="h-5 w-5 rounded-full bg-[#FFFDF9] transition-transform group-hover:scale-95 sm:h-6 sm:w-6" />
          </span>
        </div>
      </div>
    </button>
  );
}

interface PreviewModeSelectorProps {
  activeMode: HeroPreviewMode;
  activeRoom: SampleRoomElevation;
  roomPickerOpen: boolean;
  onSelectLiveCamera: () => void;
  onSelectUploadPhoto: () => void;
  onToggleRoomPicker: () => void;
  onChooseSampleRoom: (room: SampleRoomElevation) => void;
  onOpenRoomInStudio: (roomId: string) => void;
  className?: string;
}

export function PreviewModeSelector({
  activeMode,
  activeRoom,
  roomPickerOpen,
  onSelectLiveCamera,
  onSelectUploadPhoto,
  onToggleRoomPicker,
  onChooseSampleRoom,
  onOpenRoomInStudio,
  className,
}: PreviewModeSelectorProps) {
  return (
    <div className={cn("relative", className)}>
      <div
        role="group"
        aria-label="Visualizer launch modes"
        className="flex flex-row flex-wrap items-center gap-1.5 rounded-2xl border border-[#EDE3D6] bg-[#FFFDF9]/98 p-2 shadow-[0_18px_42px_rgba(32,24,18,0.14)] lg:w-[168px] lg:flex-col lg:items-stretch"
      >
        <button
          type="button"
          onClick={onSelectLiveCamera}
          aria-pressed={activeMode === "camera"}
          className={cn(
            "inline-flex flex-1 cursor-pointer items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C] sm:text-[13px]",
            activeMode === "camera"
              ? "bg-[#9B1C1C] font-semibold text-[#FFFDF9] shadow-[0_6px_16px_rgba(155,28,28,0.24)]"
              : "text-[#2A231F] hover:bg-[#F7F1E8]"
          )}
        >
          <Camera
            className={cn(
              "h-4 w-4 shrink-0",
              activeMode === "camera" ? "text-[#FFFDF9]" : "text-[#2A231F]"
            )}
          />
          <span>Live Camera</span>
        </button>

        <button
          type="button"
          onClick={onSelectUploadPhoto}
          aria-pressed={activeMode === "photo"}
          className={cn(
            "inline-flex flex-1 cursor-pointer items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C] sm:text-[13px]",
            activeMode === "photo"
              ? "bg-[#9B1C1C] font-semibold text-[#FFFDF9] shadow-[0_6px_16px_rgba(155,28,28,0.24)]"
              : "text-[#2A231F] hover:bg-[#F7F1E8]"
          )}
        >
          <ImageIcon
            className={cn(
              "h-4 w-4 shrink-0",
              activeMode === "photo" ? "text-[#FFFDF9]" : "text-[#2A231F]"
            )}
          />
          <span>Upload Photo</span>
        </button>

        <button
          type="button"
          onClick={onToggleRoomPicker}
          aria-expanded={roomPickerOpen}
          aria-pressed={activeMode === "room" || roomPickerOpen}
          className={cn(
            "inline-flex flex-1 cursor-pointer items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C] sm:text-[13px]",
            activeMode === "room" || roomPickerOpen
              ? "bg-[#9B1C1C] font-semibold text-[#FFFDF9] shadow-[0_6px_16px_rgba(155,28,28,0.24)]"
              : "text-[#2A231F] hover:bg-[#F7F1E8]"
          )}
        >
          <LayoutGrid
            className={cn(
              "h-4 w-4 shrink-0",
              activeMode === "room" || roomPickerOpen
                ? "text-[#FFFDF9]"
                : "text-[#2A231F]"
            )}
          />
          <span>Choose Room</span>
        </button>
      </div>

      {/* Real Sample-Room Picker Popover */}
      {roomPickerOpen && (
        <div
          role="region"
          aria-label="Select a studio sample room"
          className="mt-2 w-full rounded-2xl border border-[#E5D9CA] bg-[#FFFDF9] p-3 shadow-[0_20px_48px_rgba(28,20,16,0.18)] lg:absolute lg:top-full lg:left-0 lg:z-30 lg:w-[252px]"
        >
          <p className="px-1 text-[11px] font-semibold tracking-[0.06em] text-[#746B64]">
            Select Sample Interior
          </p>
          <div className="mt-2 space-y-1">
            {SAMPLE_ROOM_ELEVATIONS.map((room) => {
              const isSelected = room.id === activeRoom.id;
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => onChooseSampleRoom(room)}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs transition-colors focus-visible:outline-2 focus-visible:outline-[#9B1C1C]",
                    isSelected
                      ? "bg-[#F6E8E6] font-semibold text-[#9B1C1C]"
                      : "text-[#2A231F] hover:bg-[#F7F1E8]"
                  )}
                >
                  <span className="truncate">{room.name}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => onOpenRoomInStudio(activeRoom.id)}
            className="mt-2.5 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#9B1C1C] px-3 py-2 text-xs font-medium text-[#FFFDF9] transition-colors hover:bg-[#7D1616]"
          >
            <span>Open in 4-Corner Studio</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
