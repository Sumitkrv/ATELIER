"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CatalogueDesignItem } from "@/lib/designs-catalogue";
import { buildWhatsAppUrl } from "@/lib/brand";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import {
  AlertTriangle,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Film,
  Image as ImageIcon,
  Maximize2,
  MessageCircle,
  Minimize2,
  Pause,
  Play,
  Scan,
  ZoomIn,
  ZoomOut,
  X,
} from "lucide-react";

interface DesignPreviewModalProps {
  design: CatalogueDesignItem | null;
  onClose: () => void;
  onPreviewOnWall: (design: CatalogueDesignItem) => void;
}

export function DesignPreviewModal({
  design,
  onClose,
  onPreviewOnWall,
}: DesignPreviewModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [prevDesignId, setPrevDesignId] = useState<string | null>(
    design?.id ?? null
  );
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"images" | "video">("images");
  const [zoomLevel, setZoomLevel] = useState<1 | 1.75 | 2.5>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  if ((design?.id ?? null) !== prevDesignId) {
    setPrevDesignId(design?.id ?? null);
    setActiveMediaIndex(0);
    setViewMode("images");
    setZoomLevel(1);
    setImageError(false);
    setImageLoading(false);
    setIsVideoPlaying(false);
  }

  const uniqueGalleryMedia = useMemo(() => {
    if (!design) return [];
    const candidates = [design.coverImage, ...design.galleryMedia];
    const seenUrls = new Set<string>();
    return candidates.filter((media) => {
      if (!media?.secureUrl) return false;
      const key = media.secureUrl.trim();
      if (seenUrls.has(key)) return false;
      seenUrls.add(key);
      return true;
    });
  }, [design]);

  const totalImages = uniqueGalleryMedia.length;

  const handleSelectImage = useCallback((nextIndex: number) => {
    setViewMode("images");
    setActiveMediaIndex(nextIndex);
    setZoomLevel(1);
    setImageError(false);
  }, []);

  const handlePrevImage = useCallback(() => {
    if (!design || totalImages <= 1) return;
    setViewMode("images");
    setZoomLevel(1);
    setImageError(false);
    setActiveMediaIndex((prev) => (prev - 1 + totalImages) % totalImages);
  }, [design, totalImages]);

  const handleNextImage = useCallback(() => {
    if (!design || totalImages <= 1) return;
    setViewMode("images");
    setZoomLevel(1);
    setImageError(false);
    setActiveMediaIndex((prev) => (prev + 1) % totalImages);
  }, [design, totalImages]);

  const handleCycleZoom = () => {
    setZoomLevel((prev) => {
      if (prev === 1) return 1.75;
      if (prev === 1.75) return 2.5;
      return 1;
    });
  };

  useEffect(() => {
    if (!design) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 20);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      if (
        previousFocusRef.current &&
        typeof previousFocusRef.current.focus === "function"
      ) {
        previousFocusRef.current.focus();
      }
    };
  }, [design]);

  useEffect(() => {
    if (!design) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (isFullscreen) {
          setIsFullscreen(false);
          setZoomLevel(1);
          return;
        }
        if (zoomLevel > 1) {
          setZoomLevel(1);
          return;
        }
        onClose();
        return;
      }

      if (e.key === "ArrowLeft" && viewMode === "images") {
        e.preventDefault();
        handlePrevImage();
        return;
      }

      if (e.key === "ArrowRight" && viewMode === "images") {
        e.preventDefault();
        handleNextImage();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    design,
    isFullscreen,
    zoomLevel,
    viewMode,
    handlePrevImage,
    handleNextImage,
    onClose,
  ]);

  if (!design) return null;

  const currentMedia =
    uniqueGalleryMedia[activeMediaIndex] ?? design.coverImage;
  const hasLiveVideoStream = Boolean(
    design.videoAsset?.secureUrl && design.videoAsset.secureUrl.trim().length > 0
  );

  const toggleVideoPlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => {});
      setIsVideoPlaying(true);
    } else {
      el.pause();
      setIsVideoPlaying(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="design-preview-modal-title"
      aria-describedby="design-preview-modal-desc"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#201C1A]/85 p-3 sm:p-6 backdrop-blur-md"
    >
      <div
        ref={modalRef}
        className={cn(
          "flex w-full flex-col overflow-hidden rounded-2xl border border-[#DED5CB] bg-[#FDF8F3] text-[#201C1A] shadow-2xl transition-all duration-200",
          isFullscreen
            ? "h-[96dvh] max-w-[96vw]"
            : "max-h-[92dvh] max-w-[1180px]"
        )}
      >
        {/* Top Modal Bar */}
        <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-[#201C1A] px-5 py-3.5 text-[#F8F3ED] sm:px-7">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full bg-[#991D20] px-3 py-0.5 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-[#F8F3ED]">
              {design.categoryLabel}
            </span>
            <span className="text-xs text-[#D9C8B5]">
              {design.compatibleSurfaces.join(" • ")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              aria-label={
                isFullscreen
                  ? "Exit fullscreen preview"
                  : "Expand preview to fullscreen"
              }
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] text-[#F8F3ED] transition-colors hover:border-[#991D20] hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#991D20]"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5 text-[#991D20]" />
                  <span className="hidden sm:inline">Standard View</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5 text-[#991D20]" />
                  <span className="hidden sm:inline">Fullscreen</span>
                </>
              )}
            </button>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close design preview"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-wider text-[#F8F3ED] transition-colors hover:border-[#991D20] hover:bg-[#991D20] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#991D20]"
            >
              <X className="h-4 w-4" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Main Split Body */}
        <div className="grid flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-12 lg:overflow-hidden">
          {/* Left Column: High-Resolution Artwork Stage + Zoom + Thumbnails */}
          <div
            className={cn(
              "flex flex-col justify-between bg-[#201C1A] text-[#F8F3ED]",
              isFullscreen ? "lg:col-span-8" : "lg:col-span-7"
            )}
          >
            {/* Media Mode Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-5 py-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode("images")}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#991D20]",
                    viewMode === "images"
                      ? "bg-[#991D20] text-[#F8F3ED]"
                      : "bg-white/8 text-[#EDE4DA]/80 hover:bg-white/15"
                  )}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>
                    Artwork Views ({activeMediaIndex + 1}/{totalImages})
                  </span>
                </button>

                {hasLiveVideoStream && (
                  <button
                    type="button"
                    onClick={() => setViewMode("video")}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#991D20]",
                      viewMode === "video"
                        ? "bg-[#991D20] text-[#F8F3ED]"
                        : "bg-white/8 text-[#EDE4DA]/80 hover:bg-white/15"
                    )}
                  >
                    <Film className="h-3.5 w-3.5" />
                    <span>Motion View</span>
                  </button>
                )}
              </div>

              {viewMode === "images" && (
                <div className="flex items-center gap-2">
                  {zoomLevel > 1 && (
                    <button
                      type="button"
                      onClick={() => setZoomLevel(1)}
                      aria-label="Reset zoom to 1x"
                      className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-[#EDE4DA] transition-colors hover:border-[#991D20] hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#991D20]"
                    >
                      <span>Reset</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCycleZoom}
                    aria-label={`Toggle artwork zoom (current ${zoomLevel}x)`}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-[#F8F3ED] transition-colors hover:border-[#991D20] hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#991D20]"
                  >
                    {zoomLevel > 1 ? (
                      <ZoomOut className="h-3.5 w-3.5 text-[#991D20]" />
                    ) : (
                      <ZoomIn className="h-3.5 w-3.5 text-[#991D20]" />
                    )}
                    <span>Zoom {zoomLevel}×</span>
                  </button>
                </div>
              )}
            </div>

            {/* Primary Viewport Stage */}
            <div className="relative flex min-h-[280px] flex-1 items-center justify-center overflow-auto bg-[#161311] p-4 sm:min-h-[420px] sm:p-6">
              {viewMode === "images" ? (
                <>
                  {imageLoading && (
                    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[#201C1A]/55 text-xs uppercase tracking-widest text-[#EDE4DA]">
                      Loading High-Resolution Artwork…
                    </div>
                  )}

                  {imageError ? (
                    <div className="mx-auto max-w-sm rounded-xl border border-white/15 bg-[#201C1A] p-6 text-center">
                      <AlertTriangle className="mx-auto h-6 w-6 text-[#991D20]" />
                      <p className="mt-2 font-serif text-lg text-[#F8F3ED]">
                        Artwork Preview Unavailable
                      </p>
                      <p className="mt-1 text-xs text-[#EDE4DA]/75">
                        The selected media asset could not be loaded. Please
                        select another thumbnail or launch the Wall Visualizer.
                      </p>
                    </div>
                  ) : (
                    <div
                      onClick={handleCycleZoom}
                      title="Click to cycle high-resolution zoom"
                      className={cn(
                        "relative flex items-center justify-center transition-transform duration-300",
                        zoomLevel > 1 ? "cursor-zoom-out" : "cursor-zoom-in"
                      )}
                      style={{
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: "center center",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        key={currentMedia.secureUrl}
                        src={currentMedia.secureUrl}
                        alt={currentMedia.altText}
                        onLoad={() => setImageLoading(false)}
                        onError={() => {
                          setImageLoading(false);
                          setImageError(true);
                        }}
                        className="max-h-[64dvh] w-auto max-w-full rounded-xl border border-white/10 object-contain shadow-2xl"
                      />
                    </div>
                  )}

                  {/* Previous / Next Overlay Controls */}
                  {totalImages > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrevImage();
                        }}
                        aria-label="Previous artwork image"
                        className="absolute left-3 top-1/2 z-20 -translate-y-1/2 cursor-pointer rounded-full border border-white/20 bg-[#201C1A]/85 p-2.5 text-[#F8F3ED] backdrop-blur-sm transition-colors hover:border-[#991D20] hover:bg-[#991D20] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#991D20]"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNextImage();
                        }}
                        aria-label="Next artwork image"
                        className="absolute right-3 top-1/2 z-20 -translate-y-1/2 cursor-pointer rounded-full border border-white/20 bg-[#201C1A]/85 p-2.5 text-[#F8F3ED] backdrop-blur-sm transition-colors hover:border-[#991D20] hover:bg-[#991D20] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#991D20]"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full max-w-2xl">
                  <div className="space-y-3">
                    <video
                      ref={videoRef}
                      src={design.videoAsset?.secureUrl}
                      poster={
                        design.videoAsset?.posterUrl ||
                        design.coverImage.secureUrl
                      }
                      controls
                      playsInline
                      preload="metadata"
                      onPlay={() => setIsVideoPlaying(true)}
                      onPause={() => setIsVideoPlaying(false)}
                      className="aspect-video w-full rounded-xl border border-white/15 bg-black object-contain"
                    />
                    <div className="flex items-center justify-between text-xs text-[#EDE4DA]/80">
                      <span className="text-[11px] uppercase tracking-wider">
                        Surface Detail Reel
                      </span>
                      <button
                        type="button"
                        onClick={toggleVideoPlay}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] text-[#F8F3ED] hover:border-[#991D20]"
                      >
                        {isVideoPlaying ? (
                          <>
                            <Pause className="h-3.5 w-3.5 text-[#991D20]" />
                            <span>Pause Video</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-3.5 w-3.5 text-[#991D20]" />
                            <span>Play Video</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Thumbnail Strip */}
            <div className="border-t border-white/10 bg-[#201C1A] px-5 py-3.5">
              <div className="flex items-center justify-between gap-2 pb-2">
                <span className="truncate text-[11.5px] text-[#EDE4DA]/80">
                  {currentMedia.altText}
                </span>
                <span className="hidden shrink-0 text-[11px] text-[#EDE4DA]/55 sm:inline">
                  Use ← / → keys to navigate • Click image to zoom
                </span>
              </div>

              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {uniqueGalleryMedia.map((media, idx) => {
                  const isActive =
                    viewMode === "images" && idx === activeMediaIndex;
                  return (
                    <button
                      key={`${media.publicId}-${idx}`}
                      type="button"
                      onClick={() => handleSelectImage(idx)}
                      aria-label={`View artwork image ${idx + 1} of ${totalImages}`}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "group relative h-14 w-22 shrink-0 cursor-pointer overflow-hidden rounded-lg border transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#991D20]",
                        isActive
                          ? "border-[#991D20] ring-1 ring-[#991D20]"
                          : "border-white/15 opacity-65 hover:opacity-100"
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={media.secureUrl}
                        alt={media.altText}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Metadata, Surfaces, Visualizer & Enquiry CTAs */}
          <div
            className={cn(
              "flex flex-col justify-between overflow-y-auto bg-[#FDF8F3] p-6 sm:p-8",
              isFullscreen ? "lg:col-span-4" : "lg:col-span-5"
            )}
          >
            <div className="space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#991D20]">
                  <span>{design.categoryLabel}</span>
                </div>

                <h2
                  id="design-preview-modal-title"
                  className="mt-2 font-serif text-3xl font-medium leading-tight text-[#201C1A] sm:text-4xl"
                >
                  {design.title}
                </h2>

                <p
                  id="design-preview-modal-desc"
                  className="mt-3 text-[15px] leading-relaxed text-[#201C1A]/90"
                >
                  {design.summary}
                </p>

                <p className="mt-3 text-[13.5px] leading-relaxed text-[#5E554F]">
                  {design.description}
                </p>
              </div>

              {/* Supported Application Substrates */}
              <div className="rounded-xl border border-[#DED5CB] bg-[#F8F3ED] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#991D20]">
                  Supported Surfaces
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {design.compatibleSurfaces.map((surface) => (
                    <span
                      key={surface}
                      className="rounded-full border border-[#DED5CB] bg-[#FDF8F3] px-3 py-1 text-xs font-medium text-[#201C1A]"
                    >
                      {surface}
                    </span>
                  ))}
                </div>
                <p className="mt-2.5 text-xs text-[#756C65]">
                  Dimensions & Scale: {design.dimensionsNote}
                </p>
              </div>

              {/* Tags */}
              <div>
                <span className="block text-[11px] font-medium uppercase tracking-widest text-[#756C65]">
                  Design Attributes
                </span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {design.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#EDE4DA] px-3 py-1 text-[11px] text-[#201C1A]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Stack: Preview on Wall + Enquire */}
            <div className="mt-8 space-y-3 border-t border-[#DED5CB] pt-6">
              <button
                type="button"
                onClick={() => onPreviewOnWall(design)}
                className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-[#991D20] px-6 py-3.5 text-xs font-medium uppercase tracking-[0.16em] text-[#F8F3ED] shadow-md transition-colors hover:bg-[#73171B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#991D20]"
              >
                <Scan className="h-4 w-4" />
                <span>Preview on Wall</span>
              </button>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <Button
                  href={`/contact?design=${encodeURIComponent(
                    design.slug
                  )}&title=${encodeURIComponent(
                    design.title
                  )}&category=${encodeURIComponent(design.categoryLabel)}`}
                  variant="secondary"
                  size="md"
                  className="w-full rounded-full"
                >
                  <span>Enquire</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Button>

                <a
                  href={buildWhatsAppUrl(
                    "918017463132",
                    `Hello ATELIER — WALL STORY, I would like to enquire about "${design.title}" (${design.categoryLabel}).`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#DED5CB] bg-[#F8F3ED] px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#201C1A] transition-colors hover:border-[#991D20] hover:text-[#991D20] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#991D20]"
                >
                  <MessageCircle className="h-4 w-4 text-[#991D20]" />
                  <span>WhatsApp Studio</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
