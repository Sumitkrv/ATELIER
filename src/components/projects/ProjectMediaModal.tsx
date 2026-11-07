"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PortfolioProjectRecord } from "@/lib/projects-catalogue";
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
  MessageCircle,
  ZoomIn,
  ZoomOut,
  X,
} from "lucide-react";

interface ProjectMediaModalProps {
  project: PortfolioProjectRecord | null;
  initialMediaIndex?: number;
  initialMode?: "images" | "video";
  onClose: () => void;
}

export function ProjectMediaModal({
  project,
  initialMediaIndex = 0,
  initialMode = "images",
  onClose,
}: ProjectMediaModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const [activeMediaIndex, setActiveMediaIndex] =
    useState<number>(initialMediaIndex);
  const [viewMode, setViewMode] = useState<"images" | "video">(initialMode);
  const [zoomed, setZoomed] = useState(false);
  const [imageError, setImageError] = useState(false);

  const totalImages = project ? project.galleryMedia.length : 0;

  const handlePrevImage = useCallback(() => {
    if (!project || totalImages <= 1) return;
    setViewMode("images");
    setZoomed(false);
    setImageError(false);
    setActiveMediaIndex((prev) => (prev - 1 + totalImages) % totalImages);
  }, [project, totalImages]);

  const handleNextImage = useCallback(() => {
    if (!project || totalImages <= 1) return;
    setViewMode("images");
    setZoomed(false);
    setImageError(false);
    setActiveMediaIndex((prev) => (prev + 1) % totalImages);
  }, [project, totalImages]);

  // Body scroll lock & focus management
  useEffect(() => {
    if (!project) return;

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
  }, [project]);

  // Keyboard navigation & focus trap
  useEffect(() => {
    if (!project) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (zoomed) {
          setZoomed(false);
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
  }, [project, zoomed, viewMode, handlePrevImage, handleNextImage, onClose]);

  if (!project) return null;

  const currentMedia =
    project.galleryMedia[activeMediaIndex] ?? project.coverImage;
  const hasVideo = Boolean(project.videoAsset);
  const hasLiveVideoStream = Boolean(
    project.videoAsset?.secureUrl &&
      project.videoAsset.secureUrl.trim().length > 0
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-media-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-charcoal/88 p-3 sm:p-6 backdrop-blur-md"
    >
      <div
        ref={modalRef}
        className="flex max-h-[92dvh] w-full max-w-[1140px] flex-col overflow-hidden rounded-2xl border border-white/15 bg-brand-offwhite text-brand-charcoal shadow-2xl"
      >
        {/* Top Modal Header */}
        <div className="flex items-center justify-between gap-4 border-b border-white/12 bg-brand-charcoal px-5 py-3.5 text-brand-offwhite sm:px-7">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full bg-brand-crimson px-3 py-0.5 font-mono text-[10px] font-medium uppercase tracking-widest text-brand-offwhite">
              Surface: {project.surfaceName}
            </span>
            <h3
              id="project-media-modal-title"
              className="font-serif text-lg font-medium text-brand-offwhite sm:text-xl"
            >
              {project.title}
            </h3>
            <span className="rounded-full border border-white/15 bg-white/8 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-brand-beige">
              {project.recordClassification || "Studio Surface Study"}
            </span>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close project media viewer"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm border border-white/15 bg-white/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-brand-offwhite transition-colors hover:border-brand-crimson hover:bg-brand-crimson focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-crimson"
          >
            <X className="h-4 w-4" />
            <span>Close</span>
          </button>
        </div>

        {/* Media Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-brand-charcoal px-5 py-2.5 text-brand-offwhite sm:px-7">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode("images")}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-sm px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-brand-crimson",
                viewMode === "images"
                  ? "bg-brand-crimson text-brand-offwhite"
                  : "bg-white/8 text-brand-beige/80 hover:bg-white/15"
              )}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>
                Gallery ({activeMediaIndex + 1}/{totalImages})
              </span>
            </button>

            {hasVideo && (
              <button
                type="button"
                onClick={() => setViewMode("video")}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-sm px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors focus-visible:outline-2 focus-visible:outline-brand-crimson",
                  viewMode === "video"
                    ? "bg-brand-crimson text-brand-offwhite"
                    : "bg-white/8 text-brand-beige/80 hover:bg-white/15"
                )}
              >
                <Film className="h-3.5 w-3.5" />
                <span>Execution Video</span>
              </button>
            )}
          </div>

          {viewMode === "images" && (
            <button
              type="button"
              onClick={() => setZoomed((prev) => !prev)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm border border-white/15 bg-white/5 px-3 py-1 font-mono text-[11px] text-brand-offwhite hover:border-brand-crimson focus-visible:outline-2 focus-visible:outline-brand-crimson"
            >
              {zoomed ? (
                <>
                  <ZoomOut className="h-3.5 w-3.5 text-brand-crimson" />
                  <span>Reset Zoom</span>
                </>
              ) : (
                <>
                  <ZoomIn className="h-3.5 w-3.5 text-brand-crimson" />
                  <span>Zoom 1.8×</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Viewport Stage */}
        <div className="relative flex min-h-[320px] flex-1 items-center justify-center overflow-auto bg-obsidian-950 p-4 sm:min-h-[440px] sm:p-6">
          {viewMode === "images" ? (
            <>
              {imageError ? (
                <div className="mx-auto max-w-sm rounded-sm border border-white/15 bg-brand-charcoal p-6 text-center text-brand-offwhite">
                  <AlertTriangle className="mx-auto h-6 w-6 text-brand-crimson" />
                  <p className="mt-2 font-serif text-lg">
                    Media Asset Unavailable
                  </p>
                  <p className="mt-1 text-xs text-brand-beige/75">
                    Select another thumbnail below to continue inspecting this
                    project.
                  </p>
                </div>
              ) : (
                <div
                  onClick={() => setZoomed((prev) => !prev)}
                  className={cn(
                    "transition-transform duration-300",
                    zoomed ? "scale-[1.8] cursor-zoom-out" : "cursor-zoom-in"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={currentMedia.secureUrl}
                    src={currentMedia.secureUrl}
                    alt={currentMedia.altText}
                    onError={() => setImageError(true)}
                    className="max-h-[56dvh] w-auto max-w-full rounded-sm border border-white/10 object-contain shadow-2xl"
                  />
                </div>
              )}

              {totalImages > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    aria-label="Previous project image"
                    className="absolute left-3 top-1/2 z-20 -translate-y-1/2 cursor-pointer rounded-sm border border-white/20 bg-brand-charcoal/85 p-2.5 text-brand-offwhite hover:border-brand-crimson hover:bg-brand-crimson focus-visible:outline-2 focus-visible:outline-brand-crimson"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    aria-label="Next project image"
                    className="absolute right-3 top-1/2 z-20 -translate-y-1/2 cursor-pointer rounded-sm border border-white/20 bg-brand-charcoal/85 p-2.5 text-brand-offwhite hover:border-brand-crimson hover:bg-brand-crimson focus-visible:outline-2 focus-visible:outline-brand-crimson"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="w-full max-w-2xl">
              {hasLiveVideoStream ? (
                <video
                  src={project.videoAsset?.secureUrl}
                  poster={
                    project.videoAsset?.posterUrl || project.coverImage.secureUrl
                  }
                  controls
                  playsInline
                  preload="metadata"
                  className="aspect-video w-full rounded-sm border border-white/15 bg-black object-contain"
                />
              ) : (
                <div className="rounded-sm border border-white/15 bg-brand-charcoal p-6 text-brand-offwhite">
                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-brand-crimson">
                    <Film className="h-4 w-4" />
                    <span>Optional Execution Video Slot</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-brand-beige/85">
                    This portfolio record supports an optional on-site 3D wall
                    printing video reel. Upload an MP4/WebM reel in{" "}
                    <code className="font-mono text-xs">/admin/projects</code>{" "}
                    to enable native video playback here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Thumbnails + Footer Actions */}
        <div className="border-t border-brand-stone/40 bg-brand-offwhite px-5 py-4 sm:px-7">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            {/* Thumbnails */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {project.galleryMedia.map((media, idx) => {
                const isSelected =
                  viewMode === "images" && idx === activeMediaIndex;
                return (
                  <button
                    key={media.publicId}
                    type="button"
                    onClick={() => {
                      setViewMode("images");
                      setActiveMediaIndex(idx);
                      setZoomed(false);
                      setImageError(false);
                    }}
                    aria-label={`Select project image ${idx + 1}`}
                    className={cn(
                      "relative h-12 w-18 shrink-0 cursor-pointer overflow-hidden rounded-sm border transition-all focus-visible:outline-2 focus-visible:outline-brand-crimson",
                      isSelected
                        ? "border-brand-crimson ring-1 ring-brand-crimson"
                        : "border-brand-stone/50 opacity-70 hover:opacity-100"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={media.secureUrl}
                      alt={media.altText}
                      className="h-full w-full object-cover"
                    />
                  </button>
                );
              })}
            </div>

            {/* Enquiry & Detail Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href={`/projects/${project.slug}`}
                onClick={onClose}
                className="inline-flex items-center gap-1.5 rounded-sm border border-brand-charcoal/25 bg-brand-beige/55 px-4 py-2.5 font-sans text-xs font-medium uppercase tracking-wider text-brand-charcoal hover:border-brand-crimson hover:text-brand-crimson"
              >
                <span>Open Case Study</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-brand-crimson" />
              </Link>

              <Button
                href={`/contact?project=${encodeURIComponent(
                  project.slug
                )}&title=${encodeURIComponent(
                  project.title
                )}&surface=${encodeURIComponent(project.surfaceName)}`}
                variant="primary"
                size="sm"
              >
                <span>Enquire About Similar Work</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>

              <a
                href={buildWhatsAppUrl(
                  "918017463132",
                  `Hello ATELIER — WALL STORY, I would like to enquire about similar work to "${project.title}" (${project.surfaceName}).`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-sm border border-brand-charcoal/25 bg-brand-offwhite px-3.5 py-2 font-mono text-[11px] uppercase tracking-wider text-brand-charcoal hover:border-brand-crimson hover:text-brand-crimson"
              >
                <MessageCircle className="h-3.5 w-3.5 text-brand-crimson" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

