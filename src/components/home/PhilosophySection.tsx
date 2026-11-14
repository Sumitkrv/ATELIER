"use client";

import React, { useRef, useState } from "react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { FadeUp } from "@/components/motion/Reveal";
import { ATELIER_SURFACES } from "@/lib/brand";
import { DEFAULT_HOMEPAGE_CONTENT } from "@/lib/homepage-content";
import { cn } from "@/lib/cn";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const PHILOSOPHY_SURFACE_VISUALS: Record<
  string,
  {
    imageUrl: string;
    objectPosition: string;
    badge: string;
    kicker: string;
    caption: string;
  }
> = {
  walls: {
    imageUrl: "/images/atelier/home/home-philosophy-walls.webp",
    objectPosition: "object-center",
    badge: "Surface 01 • Direct-to-Wall Printing",
    kicker: "3D Printing on Walls — Interior & Feature Walls",
    caption:
      "Bespoke 3D wall printing, architectural murals, and conceptual wall art printed directly onto prepared interior wall surfaces without seams.",
  },
  tiles: {
    imageUrl: "/images/atelier/home/home-philosophy-tiles.webp",
    objectPosition: "object-center",
    badge: "Surface 02 • Ceramic & Stone Tiles",
    kicker: "3D Printing on Tiles — Ceramic, Vitrified & Stone",
    caption:
      "Precision UV-cured 3D artwork printed directly across ceramic, vitrified, and natural stone tile elevations with crisp grout-line registration.",
  },
  plywood: {
    imageUrl: "/images/atelier/home/home-philosophy-plywood.webp",
    objectPosition: "object-center",
    badge: "Surface 03 • Plywood & Timber Panels",
    kicker: "3D Printing on Plywood — Timber, Veneer & Millwork",
    caption:
      "Warm architectural graphics, botanical studies, and geometric reliefs printed directly onto birch plywood, veneers, and custom cabinetry.",
  },
  "office-blinds": {
    imageUrl: "/images/atelier/home/home-philosophy-blinds.webp",
    objectPosition: "object-center",
    badge: "Surface 04 • Bespoke Office Blinds",
    kicker: "3D Printing on Office Blinds — Roller & Architectural Shades",
    caption:
      "Continuous panoramic murals and subtle brand storytelling printed across architectural roller blinds for boardrooms and studios.",
  },
  metals: {
    imageUrl: "/images/atelier/home/home-philosophy-metals.webp",
    objectPosition: "object-center",
    badge: "Surface 05 • Brushed & Coated Metals",
    kicker: "3D Printing on Metals — Aluminum, Brass & Steel Panels",
    caption:
      "High-adhesion architectural line art and tonal surface compositions printed directly onto brushed bronze, aluminum, and steel cladding.",
  },
  glass: {
    imageUrl: "/images/atelier/home/home-philosophy-glass.webp",
    objectPosition: "object-center",
    badge: "Surface 06 • Architectural Glass",
    kicker: "3D Printing on Glass — Partitions & Feature Glazing",
    caption:
      "Translucent botanical privacy art, frosted gradients, and graphic partitions printed directly onto interior architectural glass.",
  },
};

export function PhilosophySection() {
  const content = DEFAULT_HOMEPAGE_CONTENT;
  const [activeSurfaceId, setActiveSurfaceId] = useState<string | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);

  const cycleSurface = (dir: 1 | -1) => {
    const ids = ATELIER_SURFACES.map((s) => s.id);
    if (!ids.length) return;
    const currentIdx = activeSurfaceId ? ids.indexOf(activeSurfaceId) : -1;
    const nextIdx =
      currentIdx < 0
        ? dir > 0
          ? 0
          : ids.length - 1
        : (currentIdx + dir + ids.length) % ids.length;
    setActiveSurfaceId(ids[nextIdx]);
  };

  const activeVisual = activeSurfaceId
    ? PHILOSOPHY_SURFACE_VISUALS[activeSurfaceId]
    : null;

  const currentImageUrl =
    activeVisual?.imageUrl ?? content.philosophy.visualPlaceholderUrl;
  const currentObjectPosition =
    activeVisual?.objectPosition ?? "object-[54%_48%]";
  const currentBadge = activeVisual?.badge ?? "Atelier Wall Story • Mumbai";
  const currentKicker =
    activeVisual?.kicker ?? "Direct-to-Surface 3D Wall Printing";
  const currentCaption =
    activeVisual?.caption ?? content.philosophy.visualCaption;

  return (
    <section
      id="atelier-philosophy"
      aria-labelledby="philosophy-heading"
      className="border-b border-brand-stone/35 bg-brand-beige py-11 sm:py-14 lg:py-16 xl:py-[72px]"
    >
      <Container>
        <div className="grid grid-cols-1 items-center gap-8 sm:gap-10 lg:grid-cols-[minmax(0,46fr)_minmax(0,54fr)] lg:gap-12 xl:gap-14">
          {/* Left Column (46%): Interactive Architectural Studio & Surface Visual */}
          <FadeUp>
            <div className="relative">
              <div
                onTouchStart={(e) => {
                  if (!e.touches[0]) return;
                  swipeStartRef.current = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY,
                  };
                }}
                onTouchEnd={(e) => {
                  if (!swipeStartRef.current || !e.changedTouches[0]) return;
                  const dx =
                    e.changedTouches[0].clientX - swipeStartRef.current.x;
                  const dy =
                    e.changedTouches[0].clientY - swipeStartRef.current.y;
                  swipeStartRef.current = null;
                  if (Math.abs(dx) >= 38 && Math.abs(dx) > Math.abs(dy) * 1.2) {
                    cycleSurface(dx < 0 ? 1 : -1);
                  }
                }}
                style={{ touchAction: "pan-y" }}
                className="group relative h-[280px] w-full overflow-hidden rounded-2xl border border-[#DDD2C5] bg-[#EBE3D8] shadow-editorial min-[430px]:h-[320px] sm:h-[380px] lg:h-[495px] xl:h-[510px]"
              >
                {/* Preload all 6 surface images + studio image for instant zero-flicker switching */}
                {[
                  content.philosophy.visualPlaceholderUrl,
                  ...Object.values(PHILOSOPHY_SURFACE_VISUALS).map(
                    (v) => v.imageUrl
                  ),
                ].map((url) => {
                  const isCurrent = url === currentImageUrl;
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={url}
                      src={url}
                      alt={currentKicker}
                      className={cn(
                        "absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100",
                        currentObjectPosition,
                        isCurrent
                          ? "z-10 opacity-100"
                          : "pointer-events-none z-0 opacity-0"
                      )}
                    />
                  );
                })}

                {/* Subtle warm vignette for badge/caption contrast */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-brand-charcoal/65 via-transparent to-brand-charcoal/20"
                />

                {/* Top Studio / Surface Badge + Touch Prev/Next Switcher */}
                <div className="absolute inset-x-3.5 top-3.5 z-20 flex items-center justify-between gap-2 sm:inset-x-4 sm:top-4">
                  <div className="flex items-center gap-2 rounded-full border border-white/15 bg-brand-charcoal/85 px-3.5 py-1 text-[10px] font-medium uppercase tracking-wider text-brand-beige backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#9B1C1C]" />
                    <span>{currentBadge}</span>
                  </div>

                  <div className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-brand-charcoal/80 p-0.5 backdrop-blur-sm">
                    <button
                      type="button"
                      onClick={() => cycleSurface(-1)}
                      aria-label="Preview previous architectural surface"
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-brand-offwhite transition-colors hover:bg-brand-crimson"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => cycleSurface(1)}
                      aria-label="Preview next architectural surface"
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-brand-offwhite transition-colors hover:bg-brand-crimson"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom Caption Strip */}
                <div className="absolute inset-x-0 bottom-0 z-20 border-t border-white/12 bg-brand-charcoal/90 px-4 py-3 backdrop-blur-md sm:px-5 sm:py-3.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-crimson">
                    {currentKicker}
                  </p>
                  <p className="mt-0.5 text-[11.5px] leading-snug text-brand-beige/90 sm:text-xs">
                    {currentCaption}
                  </p>
                </div>
              </div>

              {/* Compact Architectural Crimson Corner Rule */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-2.5 -left-2.5 hidden h-16 w-16 rounded-bl-[18px] border-b border-l border-brand-crimson/70 sm:block"
              />
            </div>
          </FadeUp>

          {/* Right Column (54%): Compact Editorial Hierarchy, Interactive Surfaces & CTAs */}
          <FadeUp delay={0.08}>
            <div className="flex flex-col justify-center">
              {/* 1. Small Crimson Eyebrow */}
              <div className="inline-flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-[1.5px] w-7 bg-brand-crimson"
                />
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-crimson">
                  {content.philosophy.sectionLabel}
                </span>
              </div>

              {/* 2. Main Editorial Headline (36–42px on desktop) */}
              <h2
                id="philosophy-heading"
                className="mt-2.5 font-serif text-[clamp(1.75rem,2.65vw,2.55rem)] font-medium leading-[1.13] tracking-[-0.015em] text-brand-charcoal"
              >
                {content.philosophy.heading}
              </h2>

              {/* 3 & 4. Primary Introduction & Secondary Brand Description */}
              <div className="mt-4 space-y-2.5 border-l border-brand-crimson/70 pl-4 sm:pl-5">
                <p className="text-[15px] font-medium leading-[1.58] text-brand-charcoal sm:text-[15.5px]">
                  {content.philosophy.leadParagraph}
                </p>
                <p className="text-[14.5px] leading-[1.6] text-brand-muted sm:text-[15px]">
                  {content.philosophy.secondaryParagraph}
                </p>
              </div>

              {/* 5. Six Supported Architectural Printing Surfaces (Interactive Image Switcher) */}
              <div className="mt-5 rounded-xl border border-brand-stone/45 bg-brand-offwhite/95 px-4 py-3.5 shadow-2xs sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-brand-crimson">
                    Supported Architectural Printing Surfaces
                  </p>
                  <span className="text-[10px] font-medium text-[#6F665E]">
                    Tap or select to preview
                  </span>
                </div>

                <div
                  role="tablist"
                  aria-label="Preview supported architectural printing surfaces"
                  className="mt-2.5 flex flex-wrap gap-2"
                >
                  {ATELIER_SURFACES.map((surface) => {
                    const isSelected = activeSurfaceId === surface.id;
                    return (
                      <button
                        key={surface.id}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        onClick={() => setActiveSurfaceId(surface.id)}
                        className={cn(
                          "cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]",
                          isSelected
                            ? "border-[#9B1C1C] bg-[#9B1C1C] text-[#FAF9F6] shadow-xs"
                            : "border-brand-stone/55 bg-brand-beige/70 text-brand-charcoal hover:border-[#9B1C1C]/60 hover:bg-[#F6EAE6] hover:text-[#9B1C1C]"
                        )}
                      >
                        {surface.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6. Primary & Secondary CTA Buttons */}
              <div className="mt-5 flex flex-col gap-3 min-[430px]:flex-row min-[430px]:flex-wrap min-[430px]:items-center sm:mt-6 sm:gap-3.5">
                <Button
                  href={content.philosophy.ctaHref}
                  variant="primary"
                  size="md"
                  className="w-full min-[430px]:w-auto"
                >
                  <span>{content.philosophy.ctaLabel}</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Button>
                <Button
                  href="/services"
                  variant="outline"
                  size="md"
                  className="w-full min-[430px]:w-auto"
                >
                  <span>Explore 3D Wall Printing</span>
                </Button>
              </div>
            </div>
          </FadeUp>
        </div>
      </Container>
    </section>
  );
}

