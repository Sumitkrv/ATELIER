"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ATELIER_SURFACES, buildWhatsAppUrl } from "@/lib/brand";
import { cn } from "@/lib/cn";
import { ArrowRight, ArrowUpRight, MessageCircle } from "lucide-react";

const SURFACE_VISUAL_MAP: Record<string, string> = {
  walls: "/images/atelier/artwork-terracotta-wave.jpg",
  tiles: "/images/atelier/surface-tiles-interior.jpg",
  plywood: "/images/atelier/surface-plywood-metal-interior.jpg",
  "office-blinds": "/images/atelier/surface-office-blinds-interior.jpg",
  metals: "/images/atelier/surface-metals-brushed-bronze.jpg",
  glass: "/images/atelier/surface-glass-interior.jpg",
};

/**
 * SECTION 05 — SURFACES WE TRANSFORM
 * Interactive editorial split gallery presenting the 6 confirmed printing substrates:
 * 1. Walls  2. Tiles  3. Plywood  4. Office Blinds  5. Metals  6. Glass
 */
export function InteractiveSurfacesGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSurface = ATELIER_SURFACES[activeIndex] ?? ATELIER_SURFACES[0];
  const activeImage =
    SURFACE_VISUAL_MAP[activeSurface.id] ??
    "/images/atelier/artwork-terracotta-wave.jpg";

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
      {/* Left Interactive Material Ledger (6 Surfaces) */}
      <div
        role="tablist"
        aria-label="Six supported 3D printing surfaces"
        className="flex flex-col justify-between divide-y divide-[#DDD2C5] overflow-hidden rounded-2xl border border-[#DDD2C5] bg-[#FBF8F3] shadow-[0_14px_34px_rgba(33,29,26,0.05)] lg:col-span-6"
      >
        {ATELIER_SURFACES.map((surface, idx) => {
          const isSelected = idx === activeIndex;
          return (
            <button
              key={surface.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setActiveIndex(idx)}
              onMouseEnter={() => setActiveIndex(idx)}
              className={cn(
                "group relative flex w-full cursor-pointer flex-col gap-2 py-5 px-4 text-left transition-colors duration-200 sm:px-6",
                isSelected
                  ? "bg-[#F6EAE6] text-[#211D1A]"
                  : "bg-[#FBF8F3] text-[#211D1A] hover:bg-[#F2EBE2]"
              )}
            >
              {/* Active Crimson Progress Bar */}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-y-0 left-0 w-[3.5px] bg-[#9B1C1C] transition-transform duration-300 origin-top",
                  isSelected ? "scale-y-100" : "scale-y-0"
                )}
              />

              <div className="flex items-baseline justify-between gap-4">
                <div className="flex items-baseline gap-4">
                  <span
                    className={cn(
                      "text-xs font-semibold tracking-[0.2em]",
                      isSelected ? "text-[#9B1C1C]" : "text-[#6F665E]"
                    )}
                  >
                    0{idx + 1}
                  </span>
                  <span className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-[#211D1A]">
                    {surface.name}
                  </span>
                </div>

                <span
                  className={cn(
                    "text-[11px] uppercase tracking-wider",
                    isSelected ? "font-medium text-[#9B1C1C]" : "text-[#6F665E]"
                  )}
                >
                  {surface.shortLabel}
                </span>
              </div>

              {isSelected && (
                <p className="pl-8 text-xs sm:text-sm leading-relaxed text-[#6F665E]">
                  {surface.summary}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Right Interactive Material Stage (Active Surface Photorealistic Showcase) */}
      <div className="lg:col-span-6 flex">
        <div className="flex w-full flex-col justify-between rounded-2xl border border-[#DDD2C5] bg-[#FBF8F3] p-6 shadow-[0_18px_45px_rgba(33,29,26,0.07)] sm:p-8">
          {/* Top Specimen Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DDD2C5] pb-4">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9B1C1C]">
              {activeSurface.code} • {activeSurface.name}
            </span>
            <span className="rounded-full border border-[#DDD2C5] bg-[#F2EBE2] px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-[#211D1A]">
              Direct Surface Printing
            </span>
          </div>

          {/* Photorealistic Surface Interior Stage */}
          <div className="my-6 relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-[#DDD2C5] bg-[#EBE3D8]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={activeImage}
              src={activeImage}
              alt={`3D Printing on ${activeSurface.name}`}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
              <span className="rounded-full bg-[#9B1C1C] px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-[#FBF8F3]">
                Direct 3D Print Substrate
              </span>
              <span className="rounded-full border border-[#DDD2C5]/80 bg-[#FBF8F3]/95 px-2.5 py-0.5 text-xs font-medium text-[#211D1A] shadow-sm">
                0{activeIndex + 1} / 06
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-5">
              <h3 className="font-serif text-3xl sm:text-4xl font-medium text-brand-offwhite">
                3D Printing on {activeSurface.name}
              </h3>
              <p className="mt-1 text-xs text-brand-beige/90">
                {activeSurface.shortLabel}
              </p>
            </div>
          </div>

          {/* Specimen Specifications */}
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="rounded-xl border border-[#DDD2C5] bg-[#F2EBE2] p-4">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#9B1C1C]">
                Architectural Applications
              </span>
              <p className="mt-1 text-[#211D1A]">
                {activeSurface.applications}
              </p>
            </div>

            <div className="rounded-xl border border-[#DDD2C5] bg-[#F2EBE2] p-4">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#6F665E]">
                Surface &amp; Print Characteristic
              </span>
              <p className="mt-1 text-[#6F665E]">
                {activeSurface.technicalNote}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#DDD2C5] pt-5">
            <Link
              href={`/services#${activeSurface.id}`}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#211D1A] transition-colors hover:text-[#9B1C1C]"
            >
              <span>{activeSurface.name} Specifications</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#9B1C1C]" />
            </Link>

            <div className="flex items-center gap-2.5">
              <a
                href={buildWhatsAppUrl(
                  undefined,
                  `Hello ATELIER — WALL STORY, I would like to enquire about 3D printing on ${activeSurface.name}.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#DDD2C5] bg-[#F2EBE2] px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-[#211D1A] transition-colors hover:border-[#9B1C1C] hover:bg-[#F6EAE6]"
              >
                <MessageCircle className="h-3.5 w-3.5 text-[#9B1C1C]" />
                <span>WhatsApp</span>
              </a>
              <Link
                href={`/contact?interest=${encodeURIComponent(
                  `3D Wall Printing — ${activeSurface.name}`
                )}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#9B1C1C] px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-[#FBF8F3] transition-colors hover:bg-brand-crimson-dark"
              >
                <span>Enquire</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
