"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Box, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/cn";

export type MaterialId =
  | "walls"
  | "tiles"
  | "plywood"
  | "office-blinds"
  | "metals"
  | "glass";

export interface Material {
  id: MaterialId;
  code: string;
  name: string;
  shortDescription: string;
  description: string;
  sampleImage: string;
  sampleAlt: string;
  sampleObjectPosition?: string;
  detailImage: string;
  detailAlt: string;
  detailObjectPosition?: string;
  applications: ReadonlyArray<string>;
  advantages: ReadonlyArray<string>;
  consultationHref: string;
  projectUrl: string;
  edgeStyle: string;
}

const EDITORIAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const MATERIAL_UNIVERSE_ITEMS: ReadonlyArray<Material> = [
  {
    id: "walls",
    code: "01",
    name: "Walls",
    shortDescription: "Large-format wall art with seamless detail.",
    description:
      "Expressive murals and continuous artwork printed directly onto suitable prepared plaster, gypsum, or painted interior walls without wallpaper seams.",
    sampleImage: "/images/atelier/slab-01-walls-relief.jpg",
    sampleAlt:
      "Sculptural warm cream lime-plaster architectural wall relief sample",
    sampleObjectPosition: "object-center",
    detailImage: "/images/atelier/slab-01-walls.jpg",
    detailAlt:
      "Close-up of botanical relief artwork on warm textured interior plaster wall",
    detailObjectPosition: "object-center",
    applications: [
      "Living Rooms",
      "Double-Height Lobbies",
      "Feature Corridors",
      "Hospitality Suites",
    ],
    advantages: [
      "Seamless direct-to-wall print registration",
      "Preserves natural plaster and surface character",
      "Tailored scale and palette, subject to wall assessment",
    ],
    consultationHref:
      "/contact?surface=Walls&title=Walls+Surface+Consultation&category=Material+Universe&interest=Walls",
    projectUrl: "/projects/walls-architectural-elevation-study",
    edgeStyle:
      "linear-gradient(180deg, #F3EBDD 0%, #D9C9B4 52%, #B8A58E 100%)",
  },
  {
    id: "tiles",
    code: "02",
    name: "Tiles",
    shortDescription: "Artistic prints on ceramic surfaces.",
    description:
      "Curated motifs, artisanal borders, and full-elevation compositions printed across suitable prepared ceramic, porcelain, and stone-look tile grids.",
    sampleImage: "/images/atelier/slab-02-tiles.jpg",
    sampleAlt:
      "Handcrafted cream and terracotta geometric floral ceramic tile sample",
    sampleObjectPosition: "object-center",
    detailImage: "/images/atelier/services/services-material-tiles-closeup.webp",
    detailAlt:
      "Glazed ceramic sample tile printed with a terracotta and sage pattern beside blank tiles",
    detailObjectPosition: "object-center",
    applications: [
      "Café & Dining Walls",
      "Boutique Washrooms",
      "Reception Backdrops",
      "Courtyard Niches",
    ],
    advantages: [
      "Tile-by-tile alignment across multi-panel grids",
      "Crisp botanical, geometric, and artisanal detail",
      "Configured to glaze finish after substrate evaluation",
    ],
    consultationHref:
      "/contact?surface=Tiles&title=Tiles+Surface+Consultation&category=Material+Universe&interest=Tiles",
    projectUrl: "/projects/tiles-architectural-elevation-study",
    edgeStyle:
      "linear-gradient(180deg, #EAD7C3 0%, #C7A487 54%, #9E7B5F 100%)",
  },
  {
    id: "plywood",
    code: "03",
    name: "Plywood",
    shortDescription: "Bespoke prints on plywood and millwork.",
    description:
      "Precision artwork printed on suitable prepared plywood, ideal for wall panelling, millwork, cabinetry, and bespoke interiors.",
    sampleImage: "/images/atelier/slab-03-plywood.jpg",
    sampleAlt:
      "Sculpted wave laminated hardwood and birch plywood architectural sample",
    sampleObjectPosition: "object-center",
    detailImage: "/images/atelier/detail-03-plywood-boards.jpg",
    detailAlt:
      "Macro studio close-up of stacked multi-ply birch and oak plywood boards showing crisp layered wood edges",
    detailObjectPosition: "object-center",
    applications: [
      "Wall Panelling",
      "Cabinetry",
      "Feature Walls",
      "Reception Areas",
    ],
    advantages: [
      "Rich, natural wood character",
      "High-detail printing possibilities",
      "Custom sizing and finishes, subject to material assessment",
    ],
    consultationHref:
      "/contact?surface=Plywood&title=Plywood+Surface+Consultation&category=Material+Universe&interest=Plywood",
    projectUrl: "/projects/plywood-architectural-elevation-study",
    edgeStyle:
      "linear-gradient(180deg, #E3BE92 0%, #B88352 50%, #7F4F2B 100%)",
  },
  {
    id: "office-blinds",
    code: "04",
    name: "Office Blinds",
    shortDescription: "Printed roller blinds for workspaces.",
    description:
      "Calm panoramic landscapes, architectural graphics, and brand narratives printed onto suitable flat-weave roller blinds for contemporary workspaces.",
    sampleImage: "/images/atelier/slab-04-office-blinds.jpg",
    sampleAlt:
      "Printed misty mountain landscape across woven architectural office roller blinds",
    sampleObjectPosition: "object-[center_45%]",
    detailImage: "/images/atelier/services/services-material-blinds-closeup.webp",
    detailAlt:
      "Partially unrolled roller-blind fabric sample printed with a soft sand-and-taupe horizon gradient",
    detailObjectPosition: "object-center",
    applications: [
      "Boardrooms",
      "Executive Cabins",
      "Studio Windows",
      "Client Lounges",
    ],
    advantages: [
      "Turns functional daylight blinds into calm visual art",
      "Continuous panoramic alignment across adjacent drops",
      "Tailored to blind weave following fabric sample check",
    ],
    consultationHref:
      "/contact?surface=Office+Blinds&title=Office+Blinds+Consultation&category=Material+Universe&interest=Office+Blinds",
    projectUrl: "/projects/office-blinds-architectural-elevation-study",
    edgeStyle:
      "linear-gradient(180deg, #EBE4D8 0%, #C7BCB0 55%, #9B9083 100%)",
  },
  {
    id: "metals",
    code: "05",
    name: "Metals",
    shortDescription: "Refined prints on architectural metals.",
    description:
      "Fine-line geometry, tonal compositions, and bespoke graphic accents printed on suitable prepared brushed aluminium, brass-toned, and coated metal panels.",
    sampleImage: "/images/atelier/slab-05-metals.jpg",
    sampleAlt:
      "Brushed champagne bronze and brass architectural metal sample with curved etched linework",
    sampleObjectPosition: "object-center",
    detailImage: "/images/atelier/services/services-material-metals-closeup.webp",
    detailAlt:
      "Brushed aluminium sample plate printed with fine charcoal and burgundy line art under raking light",
    detailObjectPosition: "object-center",
    applications: [
      "Lift Lobbies",
      "Architectural Screens",
      "Signage Walls",
      "Lounge Panelling",
    ],
    advantages: [
      "Refined interplay between artwork and metallic sheen",
      "Crisp architectural linework and tonal subtlety",
      "Prepared per metal finish and primer assessment",
    ],
    consultationHref:
      "/contact?surface=Metals&title=Metals+Surface+Consultation&category=Material+Universe&interest=Metals",
    projectUrl: "/projects/metals-architectural-elevation-study",
    edgeStyle:
      "linear-gradient(180deg, #F6E4C8 0%, #C59B68 50%, #7F5D35 100%)",
  },
  {
    id: "glass",
    code: "06",
    name: "Glass",
    shortDescription: "Elegant prints for glass partitions and panels.",
    description:
      "Translucent botanical studies, frosted privacy gradients, and architectural motifs printed on suitable interior glass partitions and feature panels.",
    sampleImage: "/images/atelier/slab-06-glass.jpg",
    sampleAlt:
      "Frosted translucent architectural glass panel sample with delicate sage botanical print",
    sampleObjectPosition: "object-center",
    detailImage: "/images/atelier/services/services-material-glass-closeup.webp",
    detailAlt:
      "Glass sample pane printed with a frosted botanical motif, daylight casting its printed shadow on the bench",
    detailObjectPosition: "object-center",
    applications: [
      "Glass Partitions",
      "Meeting Suites",
      "Entrance Vestibules",
      "Feature Panels",
    ],
    advantages: [
      "Balances visual privacy with natural daylight flow",
      "Layered translucent or frosted visual character",
      "Custom panel registration, subject to glass specification",
    ],
    consultationHref:
      "/contact?surface=Glass&title=Glass+Surface+Consultation&category=Material+Universe&interest=Glass",
    projectUrl: "/projects/glass-architectural-elevation-study",
    edgeStyle:
      "linear-gradient(180deg, rgba(239,247,241,0.96) 0%, rgba(169,194,176,0.9) 52%, rgba(120,148,128,0.94) 100%)",
  },
];

function isValidMaterialId(value: string): value is MaterialId {
  return MATERIAL_UNIVERSE_ITEMS.some((item) => item.id === value);
}

function PlayCircleGlyph({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#9B1C1C]/40 bg-[#FFFDF9] text-[#9B1C1C]",
        className
      )}
    >
      <svg viewBox="0 0 12 12" fill="currentColor" className="ml-0.5 h-2.5 w-2.5">
        <path d="M3.4 2.2a.55.55 0 0 1 .84-.47l5.2 3.8a.55.55 0 0 1 0 .94l-5.2 3.8a.55.55 0 0 1-.84-.47V2.2Z" />
      </svg>
    </span>
  );
}

/**
 * Custom architectural line icons matching the six plinth glyphs in the
 * studio design direction (burgundy #9B1C1C, crisp 1.65px stroke).
 */
function MaterialSurfaceIcon({
  id,
  className,
}: {
  id: MaterialId;
  className?: string;
}) {
  switch (id) {
    case "walls":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={className}
        >
          <path d="M10 2.75 17.25 6.5 10 10.25 2.75 6.5 10 2.75Z" />
          <path d="M2.75 10 10 13.75 17.25 10" />
          <path d="M2.75 13.5 10 17.25 17.25 13.5" />
        </svg>
      );
    case "tiles":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={className}
        >
          <rect x="3" y="3" width="14" height="14" rx="1.8" />
          <path d="M7.67 3v14M12.33 3v14M3 7.67h14M3 12.33h14" />
        </svg>
      );
    case "plywood":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={className}
        >
          <path d="M10 2.5 17.5 6.4 10 10.3 2.5 6.4 10 2.5Z" />
          <path d="M2.5 10 10 13.9 17.5 10" />
          <path d="M2.5 13.6 10 17.5 17.5 13.6" />
        </svg>
      );
    case "office-blinds":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={className}
        >
          <path d="M2.75 3.5h14.5" />
          <rect x="4.25" y="3.5" width="11.5" height="9.5" rx="1" />
          <path d="M4.25 7h11.5M4.25 10h11.5" />
          <path d="M10 13v3.25" />
          <circle cx="10" cy="17" r="0.9" fill="currentColor" />
        </svg>
      );
    case "metals":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={className}
        >
          <path d="M6.2 3.5h7.6l3.45 4.35L10 17 2.75 7.85 6.2 3.5Z" />
          <path d="M2.75 7.85h14.5" />
          <path d="M10 17 7.1 7.85 8.6 3.5M10 17l2.9-9.15L11.4 3.5" />
        </svg>
      );
    case "glass":
      return (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={className}
        >
          <rect x="3.25" y="3.25" width="13.5" height="13.5" rx="1.8" />
          <path d="M10 3.25v13.5M3.25 10h13.5" />
        </svg>
      );
  }
}

/**
 * PART A BACKGROUND — Clean warm cream architectural gallery surface
 */
function ArchitecturalBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Base Warm Cream-to-Limestone Gallery Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #FAF6F0 0%, #F9F4EC 52%, #F3EBDF 76%, #FAF6F0 100%)",
        }}
      />

      {/* Subtle Gallery Pedestal Horizon Line Grounding the Six Ivory Plinths */}
      <div
        className="absolute inset-x-0 top-[56%] hidden h-[84px] xl:block"
        style={{
          background:
            "linear-gradient(180deg, rgba(226,213,197,0) 0%, rgba(223,208,192,0.28) 48%, rgba(250,246,240,0) 100%)",
        }}
      />
    </div>
  );
}

/**
 * PART A — Editorial Introduction Block (Upper-Left ~45%)
 */
function MaterialUniverseIntro({
  prefersReducedMotion,
  revealVisible,
  onExploreSurfaces,
}: {
  prefersReducedMotion: boolean | null;
  revealVisible: boolean;
  onExploreSurfaces: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <div className="relative z-10 max-w-[630px]">
      {/* Eyebrow */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
        animate={revealVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 0.45, ease: EDITORIAL_EASE }}
        className="inline-flex items-center gap-3"
      >
        <span
          aria-hidden="true"
          className="h-[1.5px] w-7 shrink-0 bg-[#9B1C1C]"
        />
        <span className="text-[11px] font-bold tracking-[0.22em] text-[#9B1C1C] uppercase">
          OUR MATERIAL UNIVERSE
        </span>
      </motion.div>

      {/* Main Serif Headline */}
      <motion.h2
        id="material-universe-heading"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
        animate={revealVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
        transition={{ duration: 0.56, delay: 0.05, ease: EDITORIAL_EASE }}
        className="mt-1.5 font-serif text-[clamp(1.95rem,3.15vw,2.9rem)] font-normal leading-[1.06] tracking-[-0.022em] text-[#1A1A1A]"
      >
        One Vision.
        <span className="block">
          Six Extraordinary{" "}
          <span className="italic text-[#9B1C1C]">Surfaces.</span>
        </span>
      </motion.h2>

      {/* Studio Description */}
      <motion.p
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={revealVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.54, delay: 0.11, ease: EDITORIAL_EASE }}
        className="mt-2 max-w-[54ch] text-[13.5px] leading-[1.56] text-[#5B524B] sm:text-[14px]"
      >
        A complete studio service — from creative direction to on-site 3D
        printing across six architectural substrates, each offering a distinct
        tactile character.
      </motion.p>

      {/* Intro Action Buttons */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={revealVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.54, delay: 0.16, ease: EDITORIAL_EASE }}
        className="mt-3.5 flex flex-wrap items-center gap-2.5 sm:gap-3"
      >
        <a
          href="#material-exhibits"
          onClick={onExploreSurfaces}
          className="group inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full bg-[#9B1C1C] px-5 py-2 text-[12.5px] font-semibold text-[#FAF9F6] shadow-[0_12px_24px_-8px_rgba(155,28,28,0.45)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#7F1616] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#9B1C1C]"
        >
          <span>Explore a Surface</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </a>

        <Link
          href="/process"
          className="group inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full border border-[#DFD0C0] bg-[#FFFDF9]/95 px-4.5 py-2 text-[12.5px] font-semibold text-[#1A1A1A] shadow-[0_6px_18px_-10px_rgba(32,22,14,0.12)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#9B1C1C]/45 hover:bg-[#FFFDF9] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#9B1C1C]"
        >
          <PlayCircleGlyph />
          <span>See the Process</span>
        </Link>
      </motion.div>
    </div>
  );
}

/**
 * PART B ITEM — Single Physical 3D Material Exhibit (Upper Sculptural Tablet + Lower Ivory Plinth)
 */
interface MaterialExhibitProps {
  material: Material;
  index: number;
  isSelected: boolean;
  prefersReducedMotion: boolean | null;
  revealVisible: boolean;
  buttonRef: (el: HTMLButtonElement | null) => void;
  onSelect: (id: MaterialId) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => void;
}

function MaterialExhibit({
  material,
  index,
  isSelected,
  prefersReducedMotion,
  revealVisible,
  buttonRef,
  onSelect,
  onKeyDown,
}: MaterialExhibitProps) {
  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
      animate={revealVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      transition={{
        duration: 0.52,
        delay: 0.12 + index * 0.055,
        ease: EDITORIAL_EASE,
      }}
      className="w-[198px] shrink-0 snap-center sm:w-[214px] xl:w-auto xl:shrink"
    >
      <button
        ref={buttonRef}
        type="button"
        role="tab"
        id={`material-tab-${material.id}`}
        aria-selected={isSelected}
        aria-controls="selected-material-panel"
        onClick={() => onSelect(material.id)}
        onKeyDown={(e) => onKeyDown(e, index)}
        className="group relative flex w-full cursor-pointer flex-col items-center text-left focus-visible:rounded-[20px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9B1C1C]"
      >
        {/* 1. UPPER SCULPTURAL 3D MATERIAL SAMPLE TABLET */}
        <div
          className="relative z-10 -mb-1.5 w-[82%] transition-transform duration-400 ease-out"
          style={{
            perspective: "920px",
          }}
        >
          <div
            className={cn(
              "relative aspect-[1.52/1] w-full transition-all duration-400 ease-out",
              prefersReducedMotion
                ? ""
                : isSelected
                  ? "-translate-y-2 scale-[1.045]"
                  : "group-hover:-translate-y-1.5 group-hover:scale-[1.02]"
            )}
            style={
              prefersReducedMotion
                ? undefined
                : {
                    transformStyle: "preserve-3d",
                  }
            }
          >
            {/* 3D Right Material Thickness Slab Bevel */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-[3px] -right-[5px] bottom-[3px] w-[6px] rounded-r-[8px] opacity-95 shadow-[2px_4px_10px_rgba(32,20,10,0.16)]"
              style={{ background: material.edgeStyle }}
            />

            {/* Main Front Architectural Sample Face */}
            <div
              className={cn(
                "relative h-full w-full overflow-hidden rounded-t-[13px] rounded-b-[4px] bg-[#E8DFD2] transition-shadow duration-400",
                isSelected
                  ? "ring-1 ring-[#9B1C1C]/35 shadow-[0_18px_28px_-10px_rgba(36,22,12,0.34),0_4px_10px_rgba(36,22,12,0.14)]"
                  : "ring-1 ring-[#C9B9A6]/75 shadow-[0_12px_20px_-10px_rgba(36,22,12,0.24)] group-hover:shadow-[0_16px_26px_-10px_rgba(36,22,12,0.3)]"
              )}
            >
              <Image
                src={material.sampleImage}
                alt={material.sampleAlt}
                fill
                loading="eager"
                sizes="(max-width: 1279px) 180px, 175px"
                quality={92}
                className={cn(
                  "object-cover transition-transform duration-500 ease-out",
                  material.sampleObjectPosition ?? "object-center",
                  !prefersReducedMotion &&
                    (isSelected
                      ? "scale-[1.04]"
                      : "group-hover:scale-[1.035]")
                )}
              />

              {/* Top Specular Bevel & Studio Daylight Sheen */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,252,246,0.34) 0%, rgba(255,252,246,0) 38%, rgba(28,18,10,0.14) 100%)",
                }}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-white/55"
              />
            </div>
          </div>

          {/* Grounding Contact Shadow Cast onto Top of Ivory Plinth */}
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none mx-auto block h-[7px] rounded-full bg-[#3A2616] blur-[4px] transition-all duration-400",
              isSelected
                ? "-mt-0.5 w-[86%] opacity-32"
                : "mt-0.5 w-[82%] opacity-24 group-hover:w-[85%] group-hover:opacity-28"
            )}
          />
        </div>

        {/* 2. LOWER IVORY ARCHITECTURAL PLINTH */}
        <div
          className={cn(
            "relative z-0 flex min-h-[80px] w-full flex-col justify-center rounded-[15px] px-3.5 pt-3 pb-2.5 transition-all duration-350 ease-out",
            isSelected
              ? "border-2 border-[#9B1C1C] bg-gradient-to-b from-[#FFFEFC] via-[#FDF7F2] to-[#F7ECE3] shadow-[0_16px_30px_-10px_rgba(155,28,28,0.25),0_4px_10px_rgba(155,28,28,0.10),inset_0_1.5px_0_#FFFFFF]"
              : "border border-[#E2D5C5] bg-gradient-to-b from-[#FFFDF9] via-[#FAF4EC] to-[#EFE5D7] shadow-[0_10px_22px_-12px_rgba(38,26,15,0.18),inset_0_1.5px_0_rgba(255,255,255,0.95),inset_0_-2.5px_0_rgba(212,196,176,0.42)] group-hover:border-[#C8B29B] group-hover:from-[#FFFEFC] group-hover:to-[#F4EBE0]"
          )}
        >
          {/* Subtle Active Corner Indicator Dot */}
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full transition-all duration-300",
              isSelected
                ? "scale-100 bg-[#9B1C1C] opacity-100"
                : "scale-50 bg-[#C8B29B] opacity-0 group-hover:opacity-55"
            )}
          />

          {/* Plinth Icon + Surface Title */}
          <div className="flex items-center gap-2">
            <MaterialSurfaceIcon
              id={material.id}
              className="h-[16px] w-[16px] shrink-0 text-[#9B1C1C]"
            />
            <span className="font-sans text-[14px] font-bold tracking-[-0.01em] text-[#1A1A1A] xl:text-[14.5px]">
              {material.name}
            </span>
          </div>

          {/* Concise 2-Line Material Summary */}
          <p
            className={cn(
              "mt-1 text-[11.5px] leading-[1.38] transition-colors duration-250",
              isSelected
                ? "font-medium text-[#3C342E]"
                : "text-[#6D645D] group-hover:text-[#4E4640]"
            )}
          >
            {material.shortDescription}
          </p>
        </div>
      </button>
    </motion.div>
  );
}

/**
 * PART B — Horizontal Six-Exhibit Gallery Rail
 */
function MaterialShowcase({
  selectedId,
  prefersReducedMotion,
  revealVisible,
  onSelectMaterial,
}: {
  selectedId: MaterialId;
  prefersReducedMotion: boolean | null;
  revealVisible: boolean;
  onSelectMaterial: (id: MaterialId) => void;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Center active exhibit horizontally inside scrollable rail on < 1280px without scrolling window vertically
  const centerExhibitInRail = useCallback(
    (targetId: MaterialId, smooth: boolean) => {
      const rail = railRef.current;
      if (!rail || rail.scrollWidth <= rail.clientWidth + 4) return;
      const idx = MATERIAL_UNIVERSE_ITEMS.findIndex((m) => m.id === targetId);
      const btn = idx >= 0 ? tabRefs.current[idx] : null;
      if (!btn) return;
      const cardWrapper = btn.parentElement;
      if (!cardWrapper) return;
      const targetLeft =
        cardWrapper.offsetLeft -
        rail.clientWidth / 2 +
        cardWrapper.clientWidth / 2;
      rail.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: smooth && !prefersReducedMotion ? "smooth" : "auto",
      });
    },
    [prefersReducedMotion]
  );

  useEffect(() => {
    centerExhibitInRail(selectedId, false);
  }, [centerExhibitInRail, selectedId]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
      let nextIdx: number | null = null;
      if (e.key === "ArrowRight") {
        nextIdx = (idx + 1) % MATERIAL_UNIVERSE_ITEMS.length;
      } else if (e.key === "ArrowLeft") {
        nextIdx =
          (idx - 1 + MATERIAL_UNIVERSE_ITEMS.length) %
          MATERIAL_UNIVERSE_ITEMS.length;
      } else if (e.key === "Home") {
        nextIdx = 0;
      } else if (e.key === "End") {
        nextIdx = MATERIAL_UNIVERSE_ITEMS.length - 1;
      }
      if (nextIdx !== null) {
        e.preventDefault();
        const nextItem = MATERIAL_UNIVERSE_ITEMS[nextIdx];
        if (nextItem) {
          onSelectMaterial(nextItem.id);
          tabRefs.current[nextIdx]?.focus();
          centerExhibitInRail(nextItem.id, true);
        }
      }
    },
    [centerExhibitInRail, onSelectMaterial]
  );

  const handleStepSurface = useCallback(
    (dir: "prev" | "next") => {
      const curIdx = MATERIAL_UNIVERSE_ITEMS.findIndex(
        (m) => m.id === selectedId
      );
      const safeIdx = curIdx >= 0 ? curIdx : 2;
      const nextIdx =
        dir === "next"
          ? (safeIdx + 1) % MATERIAL_UNIVERSE_ITEMS.length
          : (safeIdx - 1 + MATERIAL_UNIVERSE_ITEMS.length) %
            MATERIAL_UNIVERSE_ITEMS.length;
      const nextItem = MATERIAL_UNIVERSE_ITEMS[nextIdx];
      if (nextItem) {
        onSelectMaterial(nextItem.id);
        centerExhibitInRail(nextItem.id, true);
      }
    },
    [centerExhibitInRail, onSelectMaterial, selectedId]
  );

  const activeIndex = Math.max(
    0,
    MATERIAL_UNIVERSE_ITEMS.findIndex((m) => m.id === selectedId)
  );

  return (
    <div
      id="material-exhibits"
      style={{ scrollMarginTop: "0px" }}
      className="relative z-10 mt-3.5 lg:mt-4"
    >
      {/* Horizontal Swipe Rail (< 1280px) -> Symmetrical 6-Column Gallery Row (>= 1280px) */}
      <div
        ref={railRef}
        role="tablist"
        aria-label="Six architectural printing substrates"
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-5 pt-3.5 pb-2.5 sm:-mx-8 sm:gap-4 sm:px-8 xl:mx-0 xl:grid xl:grid-cols-6 xl:gap-3.5 xl:overflow-visible xl:px-0 xl:pt-3 xl:pb-1.5"
      >
        {MATERIAL_UNIVERSE_ITEMS.map((material, index) => (
          <MaterialExhibit
            key={material.id}
            material={material}
            index={index}
            isSelected={material.id === selectedId}
            prefersReducedMotion={prefersReducedMotion}
            revealVisible={revealVisible}
            buttonRef={(el) => {
              tabRefs.current[index] = el;
            }}
            onSelect={(id) => {
              onSelectMaterial(id);
              centerExhibitInRail(id, true);
            }}
            onKeyDown={handleKeyDown}
          />
        ))}
      </div>

      {/* Compact Mobile & Tablet Gallery Rail Controls (< 1280px) */}
      <div className="mt-1 flex items-center justify-between px-0.5 xl:hidden">
        <span className="font-mono text-[10.5px] font-semibold tracking-[0.14em] text-[#746B64] uppercase">
          Surface 0{activeIndex + 1} / 06 • Swipe or Tap
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleStepSurface("prev")}
            aria-label="Select previous surface"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#DFD0C0] bg-[#FFFDF9] text-[#1A1A1A] shadow-2xs transition-colors hover:border-[#9B1C1C] hover:text-[#9B1C1C]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleStepSurface("next")}
            aria-label="Select next surface"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#DFD0C0] bg-[#FFFDF9] text-[#1A1A1A] shadow-2xs transition-colors hover:border-[#9B1C1C] hover:text-[#9B1C1C]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * PART C — Dynamic Selected Material Specification Panel
 */
function SelectedMaterialPanel({
  selectedMaterial,
  prefersReducedMotion,
  revealVisible,
}: {
  selectedMaterial: Material;
  prefersReducedMotion: boolean | null;
  revealVisible: boolean;
}) {
  return (
    <motion.div
      id="selected-material-panel"
      role="tabpanel"
      aria-labelledby={`material-tab-${selectedMaterial.id}`}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
      animate={revealVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      transition={{ duration: 0.54, delay: 0.24, ease: EDITORIAL_EASE }}
      className="relative z-10 mt-3 rounded-[22px] border border-[#DFD0C0] bg-[#FFFDF9] p-4.5 shadow-[0_20px_46px_-24px_rgba(38,26,16,0.14)] sm:p-5 lg:mt-3 lg:px-5 lg:py-4 xl:px-5.5 xl:py-4"
    >
      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[192px_minmax(0,1fr)] lg:grid-cols-[154px_minmax(0,1.46fr)_minmax(0,1fr)_auto] lg:gap-4 xl:grid-cols-[176px_minmax(0,1.5fr)_minmax(0,1fr)_auto] xl:gap-4.5">
        {/* ZONE 1: Photorealistic Material Close-Up (Pre-mounted for Zero-Flash Crossfade) */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[15px] bg-[#EDE3D5] ring-1 ring-[#E4D8C8] md:aspect-[4/3] md:w-[192px] lg:aspect-[1.22/1] lg:w-[154px] xl:aspect-[1.26/1] xl:w-[176px]">
          {MATERIAL_UNIVERSE_ITEMS.map((item) => {
            const active = item.id === selectedMaterial.id;
            return (
              <div
                key={item.id}
                aria-hidden={!active}
                className={cn(
                  "absolute inset-0 transition-opacity duration-350 ease-out",
                  active
                    ? "z-10 opacity-100"
                    : "pointer-events-none z-0 opacity-0"
                )}
              >
                <Image
                  src={item.detailImage}
                  alt={item.detailAlt}
                  fill
                  loading="eager"
                  sizes="(max-width: 767px) 92vw, 240px"
                  quality={92}
                  className={cn(
                    "object-cover",
                    item.detailObjectPosition ?? "object-center"
                  )}
                />
              </div>
            );
          })}
        </div>

        {/* ZONE 2: Material Heading, Verified Description & Four Application Chips */}
        <motion.div
          key={`material-details-${selectedMaterial.id}`}
          initial={prefersReducedMotion ? false : { opacity: 0.16, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, ease: EDITORIAL_EASE }}
        >
          <span className="inline-flex items-center rounded-full bg-[#F5E4E1] px-2.5 py-0.5 text-[9.5px] font-bold tracking-[0.16em] text-[#9B1C1C] uppercase">
            SELECTED SURFACE
          </span>

          <h3 className="mt-1 font-serif text-[1.55rem] font-normal leading-[1.08] tracking-[-0.018em] text-[#1A1A1A] sm:text-[1.7rem] lg:text-[1.5rem] xl:text-[1.75rem]">
            {selectedMaterial.name}
          </h3>

          <p className="mt-1 max-w-[54ch] text-[12.5px] leading-[1.5] text-[#5F564F] lg:text-[12px] xl:text-[12.5px]">
            {selectedMaterial.description}
          </p>

          {/* Four Application Chips */}
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {selectedMaterial.applications.map((chip) => (
              <span
                key={chip}
                className="whitespace-nowrap rounded-full border border-[#E5D9CA] bg-[#F7F1E8] px-2 py-0.5 text-[10.5px] font-medium text-[#2B2520]"
              >
                {chip}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ZONE 3: Key Advantages Column */}
        <motion.div
          key={`material-advantages-${selectedMaterial.id}`}
          initial={prefersReducedMotion ? false : { opacity: 0.16, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, ease: EDITORIAL_EASE }}
          className="border-t border-[#EAE0D3] pt-3.5 md:col-span-2 lg:col-span-1 lg:border-t-0 lg:border-l lg:border-[#E5DACB] lg:pt-0 lg:pl-4.5 xl:pl-5"
        >
          <p className="text-[10px] font-bold tracking-[0.16em] text-[#9B1C1C] uppercase">
            KEY ADVANTAGES
          </p>

          <ul className="mt-2 space-y-1.5">
            {selectedMaterial.advantages.map((advantage) => (
              <li
                key={advantage}
                className="flex items-start gap-2 text-[12px] font-medium leading-[1.38] text-[#1F1A17]"
              >
                <CheckCircle2
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9B1C1C]"
                  strokeWidth={1.85}
                />
                <span>{advantage}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* ZONE 4: Dynamic Surface Consultation & Studio Study CTAs */}
        <div className="flex flex-col gap-2 md:col-span-2 md:flex-row lg:col-span-1 lg:min-w-[210px] lg:flex-col lg:items-stretch xl:min-w-[238px]">
          <Link
            href={selectedMaterial.consultationHref}
            className="group inline-flex min-h-[40px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#9B1C1C] px-4.5 py-2 text-[12px] font-semibold text-[#FAF9F6] shadow-[0_10px_22px_-8px_rgba(155,28,28,0.42)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#7F1616] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#9B1C1C] lg:px-4 lg:text-[11.5px] xl:px-4.5 xl:text-[12px]"
          >
            <span>Request {selectedMaterial.name} Consultation</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>

          <Link
            href={selectedMaterial.projectUrl}
            className="inline-flex min-h-[40px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#DFD0C0] bg-[#FFFDF9] px-4.5 py-2 text-[12px] font-semibold text-[#1A1A1A] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#9B1C1C]/50 hover:bg-[#FAF5EE] hover:text-[#9B1C1C] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#9B1C1C] lg:px-4 lg:text-[11.5px] xl:px-4.5 xl:text-[12px]"
          >
            <Box className="h-3.5 w-3.5 shrink-0 text-[#1A1A1A]" strokeWidth={1.75} />
            <span>View {selectedMaterial.name} Studio Study</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * SECTION 02 — OUR MATERIAL UNIVERSE ("One Vision. Six Extraordinary Surfaces.")
 * Interactive 3D architectural surface showcase pairing an S-curve plaster &
 * botanical mural backdrop with six museum-plinth substrate samples and a
 * dynamic studio specification drawer.
 */
export function MaterialUniverseSection() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [selectedId, setSelectedId] = useState<MaterialId>("plywood");
  // Default visible so SSR and fast mobile scroll jumps never hide content
  const [isRevealed, setIsRevealed] = useState<boolean>(true);

  // Sync selected surface with URL hash (#walls, #tiles, #plywood, #office-blinds, #metals, #glass)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncFromHash = () => {
      const rawHash = decodeURIComponent(
        window.location.hash.replace(/^#/, "")
      ).toLowerCase();
      if (isValidMaterialId(rawHash)) {
        setSelectedId(rawHash);
      }
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  // Gentle viewport entrance reveal when section starts below the fold
  useEffect(() => {
    if (prefersReducedMotion || typeof window === "undefined") return;
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      return;
    }

    setIsRevealed(false);
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const handleSelectMaterial = useCallback((id: MaterialId) => {
    setSelectedId(id);
    if (typeof window !== "undefined" && window.history?.replaceState) {
      window.history.replaceState(null, "", `#${id}`);
    }
  }, []);

  const handleExploreSurfaces = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const isDesktop =
        typeof window !== "undefined" && window.innerWidth >= 1024;
      const target = isDesktop
        ? sectionRef.current
        : document.getElementById("material-exhibits");
      if (!target) return;
      e.preventDefault();
      const rm =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({
        behavior: rm ? "auto" : "smooth",
        block: "start",
      });
      if (isDesktop) {
        const activeTab = document.getElementById(`material-tab-${selectedId}`);
        activeTab?.focus({ preventScroll: true });
      }
    },
    [selectedId]
  );

  const selectedMaterial =
    MATERIAL_UNIVERSE_ITEMS.find((item) => item.id === selectedId) ??
    MATERIAL_UNIVERSE_ITEMS[2];

  const revealVisible = Boolean(prefersReducedMotion || isRevealed);

  return (
    <section
      ref={sectionRef}
      id="service-spectrum"
      aria-labelledby="material-universe-heading"
      style={{ scrollMarginTop: "-15px" }}
      className="relative isolate overflow-hidden border-b border-[#E3D7C7] bg-[#FAF6F0] py-8 text-[#1A1A1A] sm:py-10 lg:flex lg:min-h-[calc(100svh-var(--navbar-height,74px))] lg:flex-col lg:justify-center lg:py-5 xl:py-6"
    >
      {/* Semantic Hash Anchors for Deep-Linking (/services#walls .. /services#glass)
          html has scroll-padding-top: calc(var(--navbar-height) + 16px), so -15px lands flush below the sticky navbar */}
      {MATERIAL_UNIVERSE_ITEMS.map((item) => (
        <span
          key={item.id}
          id={item.id}
          aria-hidden="true"
          style={{ scrollMarginTop: "-15px" }}
          className="pointer-events-none absolute top-0 left-0 h-px w-px"
        />
      ))}

      {/* Clean Warm Cream Architectural Backdrop */}
      <ArchitecturalBackground />

      <Container>
        {/* PART A: Immersive Editorial Introduction */}
        <MaterialUniverseIntro
          prefersReducedMotion={prefersReducedMotion}
          revealVisible={revealVisible}
          onExploreSurfaces={handleExploreSurfaces}
        />

        {/* PART B: Six Interactive 3D Material Exhibits */}
        <MaterialShowcase
          selectedId={selectedMaterial.id}
          prefersReducedMotion={prefersReducedMotion}
          revealVisible={revealVisible}
          onSelectMaterial={handleSelectMaterial}
        />

        {/* PART C: Dynamic Selected Material Specification Panel */}
        <SelectedMaterialPanel
          selectedMaterial={selectedMaterial}
          prefersReducedMotion={prefersReducedMotion}
          revealVisible={revealVisible}
        />
      </Container>
    </section>
  );
}
