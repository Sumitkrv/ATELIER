"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Layers,
  PenTool,
  Eye,
  ShieldCheck,
  Headphones,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";
import { Container } from "@/components/layout/Container";
import { ServicesLivingCanvasHero } from "@/components/services/ServicesLivingCanvasHero";
import { MaterialUniverseSection } from "@/components/services/MaterialUniverseSection";
import { CoreExpertiseShowcase } from "@/components/services/CoreExpertiseShowcase";
import { DEVELOPMENT_PROJECT_FIXTURES } from "@/lib/projects-catalogue";
import {
  ATELIER_WHATSAPP_NUMBERS,
  buildWhatsAppUrl,
} from "@/lib/brand";

const WHY_CHOOSE_PILLARS = [
  {
    icon: PenTool,
    title: "Design-Led Approach",
  },
  {
    icon: Layers,
    title: "Multi-Surface Applications",
  },
  {
    icon: Eye,
    title: "Interactive Wall Visualization",
  },
  {
    icon: ShieldCheck,
    title: "Tailored Artwork",
  },
  {
    icon: Headphones,
    title: "Direct Studio Consultation",
  },
];

interface StudioSpaceStudyCard {
  id: string;
  spaceBadge: "Residential" | "Commercial" | "Hospitality";
  studyLabel: string;
  title: string;
  locationAndSurface: string;
  image: string;
  projectSlug: string;
}

const STUDIO_SPACE_STUDIES: StudioSpaceStudyCard[] = [
  {
    id: "lotus-residence-study",
    spaceBadge: "Residential",
    studyLabel: "Studio Surface Study",
    title: "The Lotus Residence",
    locationAndSurface: "Andheri West, Mumbai • Lime Plaster Wall",
    image: "/images/atelier/services/services-real-lotus-residence.webp",
    projectSlug:
      DEVELOPMENT_PROJECT_FIXTURES[0]?.slug ??
      "walls-architectural-elevation-study",
  },
  {
    id: "creative-office-workspace",
    spaceBadge: "Commercial",
    studyLabel: "Studio Surface Study",
    title: "Creative Office Workspace",
    locationAndSurface: "BKC, Mumbai • Acoustic Wall & Blinds",
    image: "/images/atelier/services/services-real-creative-office.webp",
    projectSlug:
      DEVELOPMENT_PROJECT_FIXTURES[1]?.slug ??
      "canvas-gallery-textured-study",
  },
  {
    id: "cafe-terra-installation",
    spaceBadge: "Hospitality",
    studyLabel: "Studio Surface Study",
    title: "Café Terra Installation",
    locationAndSurface: "Powai, Mumbai • Ceramic Tile & Plaster",
    image: "/images/atelier/services/services-real-cafe-terra.webp",
    projectSlug:
      DEVELOPMENT_PROJECT_FIXTURES[2]?.slug ??
      "tiles-ceramic-glaze-study",
  },
  {
    id: "retail-terracotta-arch",
    spaceBadge: "Hospitality",
    studyLabel: "Studio Surface Study",
    title: "Terracotta Arch Boutique",
    locationAndSurface: "Oshiwara, Mumbai • 3D Relief Wall",
    image: "/images/atelier/services/services-real-terracotta-boutique.webp",
    projectSlug:
      DEVELOPMENT_PROJECT_FIXTURES[4]?.slug ??
      "furniture-bespoke-cabinetry-study",
  },
  {
    id: "executive-boardroom-relief",
    spaceBadge: "Commercial",
    studyLabel: "Studio Surface Study",
    title: "Executive Boardroom Elevation",
    locationAndSurface: "Lower Parel, Mumbai • Plywood & Bronze",
    image: "/images/atelier/services/services-real-executive-boardroom.webp",
    projectSlug:
      DEVELOPMENT_PROJECT_FIXTURES[5]?.slug ??
      "blinds-workspace-window-study",
  },
];

export default function ServicesPage() {
  const [spaceFilter, setSpaceFilter] = useState<
    "All" | "Residential" | "Commercial" | "Hospitality"
  >("All");
  const [studyPageOffset, setStudyPageOffset] = useState<number>(0);
  const studiesTouchStartRef = useRef<{ x: number; y: number } | null>(null);

  const filteredStudies =
    spaceFilter === "All"
      ? STUDIO_SPACE_STUDIES
      : STUDIO_SPACE_STUDIES.filter((s) => s.spaceBadge === spaceFilter);

  const visibleStudies = filteredStudies.slice(0, 3);

  const handleCycleStudies = (dir: "prev" | "next") => {
    setStudyPageOffset((prev) =>
      dir === "next"
        ? (prev + 1) % STUDIO_SPACE_STUDIES.length
        : (prev - 1 + STUDIO_SPACE_STUDIES.length) %
        STUDIO_SPACE_STUDIES.length
    );
  };

  const rotatedStudies =
    spaceFilter === "All"
      ? [0, 1, 2].map(
        (i) =>
          STUDIO_SPACE_STUDIES[
          (studyPageOffset + i) % STUDIO_SPACE_STUDIES.length
          ]
      )
      : visibleStudies;

  const whatsappHref = buildWhatsAppUrl(
    ATELIER_WHATSAPP_NUMBERS[0].digits,
    "Hello ATELIER — WALL STORY, I would like to discuss a surface printing or custom wall mural project."
  );

  return (
    <PublicShell>
      <div className="min-h-screen bg-[#F7F1E8] text-[#1D1815]">
        {/* ================================================================
            SECTION 01 — THE LIVING CANVAS (CINEMATIC EDITORIAL HERO)
            ================================================================ */}
        <ServicesLivingCanvasHero />

        {/* ================================================================
            SECTION 02 — OUR MATERIAL UNIVERSE (SIX ARCHITECTURAL SURFACES)
            (Interactive 3D plinth showcase, dynamic surface panel & #walls..#glass anchors)
            ================================================================ */}
        <MaterialUniverseSection />

        {/* ================================================================
            SECTION 03 — OUR EXPERTISE (4 SCULPTURAL DISCIPLINES & SPEC DRAWER)
            ================================================================ */}
        <CoreExpertiseShowcase />

        {/* ================================================================
            SECTION 06 — FEATURED SURFACE APPLICATIONS / STUDIO STUDIES
            ================================================================ */}
        <section
          id="featured-case-studies"
          className="relative border-b border-[#E3D7C7] bg-[#F5EFE6] py-14 lg:py-18"
        >
          <Container>
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              {/* Left Editorial Column (3 cols) */}
              <div className="lg:col-span-3">
                <div className="mb-2.5 flex items-center gap-3">
                  <span className="h-[1.5px] w-7 bg-[#9E1B24]" />
                  <span className="text-[11px] font-bold tracking-[0.22em] text-[#9E1B24] uppercase">
                    SURFACES IN REAL SPACES
                  </span>
                </div>

                <h2 className="font-serif text-[clamp(2rem,3.1vw,2.75rem)] leading-[1.08] font-normal tracking-[-0.02em] text-[#1D1815]">
                  Real Spaces, <br />
                  <span className="italic text-[#9E1B24]">Real Impact.</span>
                </h2>

                <p className="mt-3 text-[13.5px] leading-[1.62] text-[#5F544C]">
                  A glimpse of our architectural wall and surface studies across
                  residential, commercial, and hospitality environments.
                </p>

                {/* Filter Pills */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(
                    [
                      "All",
                      "Residential",
                      "Commercial",
                      "Hospitality",
                    ] as const
                  ).map((tab) => {
                    const active = spaceFilter === tab;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setSpaceFilter(tab)}
                        className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-all ${active
                            ? "border-[#9E1B24] bg-[#9E1B24] text-white"
                            : "border-[#D8C9B6] bg-[#FAF6F0] text-[#5F544C] hover:border-[#9E1B24]"
                          }`}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <Link
                    href="/projects"
                    className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#9E1B24] hover:underline"
                  >
                    Explore All Projects
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right 3-Card Showcase + Carousel Arrows (9 cols) */}
              <div className="lg:col-span-9">
                <div className="flex items-center gap-3">
                  <div
                    style={{ touchAction: "pan-y" }}
                    onTouchStart={(e) => {
                      if (spaceFilter !== "All" || e.touches.length !== 1) return;
                      studiesTouchStartRef.current = {
                        x: e.touches[0].clientX,
                        y: e.touches[0].clientY,
                      };
                    }}
                    onTouchEnd={(e) => {
                      if (!studiesTouchStartRef.current || spaceFilter !== "All") {
                        studiesTouchStartRef.current = null;
                        return;
                      }
                      const touch = e.changedTouches[0];
                      if (!touch) return;
                      const dx = touch.clientX - studiesTouchStartRef.current.x;
                      const dy = touch.clientY - studiesTouchStartRef.current.y;
                      studiesTouchStartRef.current = null;
                      if (Math.abs(dx) >= 36 && Math.abs(dx) > Math.abs(dy) * 1.2) {
                        handleCycleStudies(dx < 0 ? "next" : "prev");
                      }
                    }}
                    className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3"
                  >
                    {rotatedStudies.map((study) => (
                      <Link
                        key={study.id}
                        href={`/projects/${study.projectSlug}`}
                        className="group relative aspect-[4/3] overflow-hidden rounded-[20px] border border-[#DACBB8] bg-[#241D18] shadow-[0_14px_34px_rgba(29,24,21,0.14)]"
                      >
                        <img
                          src={study.image}
                          alt={`${study.title} — ${study.locationAndSurface}`}
                          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105 group-active:scale-[1.03]"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                        {/* Top-left Space Badge + Honest Studio Study Pill */}
                        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                          <span className="rounded-full bg-[#FAF6F0]/95 px-2.5 py-0.5 text-[10.5px] font-bold text-[#1D1815] shadow-xs">
                            {study.spaceBadge}
                          </span>
                          <span className="rounded-full border border-white/25 bg-black/45 px-2 py-0.5 text-[9.5px] font-medium text-white/90 backdrop-blur-xs">
                            {study.studyLabel}
                          </span>
                        </div>

                        {/* Bottom Title, Location & Arrow Circle */}
                        <div className="absolute right-3.5 bottom-3 left-3.5 flex items-end justify-between gap-2 text-white">
                          <div>
                            <h3 className="font-serif text-[17px] leading-snug font-medium text-white">
                              {study.title}
                            </h3>
                            <p className="text-[11px] text-white/80">
                              {study.locationAndSurface}
                            </p>
                          </div>
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white backdrop-blur-xs transition-all group-hover:border-[#9E1B24] group-hover:bg-[#9E1B24]">
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Desktop Vertical Next/Prev Carousel Buttons */}
                  {spaceFilter === "All" && (
                    <div className="hidden flex-col gap-2 xl:flex">
                      <button
                        type="button"
                        onClick={() => handleCycleStudies("prev")}
                        aria-label="Previous space studies"
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#D4C4B0] bg-[#FAF6F0] text-[#1D1815] shadow-2xs transition-colors hover:border-[#9E1B24] hover:text-[#9E1B24]"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCycleStudies("next")}
                        aria-label="Next space studies"
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#D4C4B0] bg-[#FAF6F0] text-[#1D1815] shadow-2xs transition-colors hover:border-[#9E1B24] hover:text-[#9E1B24]"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile & Tablet Carousel Controls (< xl) so all 5 studies are accessible via tap or swipe */}
                {spaceFilter === "All" && (
                  <div className="mt-4 flex items-center justify-between border-t border-[#E2D5C4] pt-3 xl:hidden">
                    <span className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#6B5F56] uppercase">
                      Study 0{studyPageOffset + 1} / 0{STUDIO_SPACE_STUDIES.length} • Swipe or Tap
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCycleStudies("prev")}
                        aria-label="Previous space studies"
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#D4C4B0] bg-[#FAF6F0] text-[#1D1815] shadow-2xs transition-colors hover:border-[#9E1B24] hover:text-[#9E1B24]"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCycleStudies("next")}
                        aria-label="Next space studies"
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#D4C4B0] bg-[#FAF6F0] text-[#1D1815] shadow-2xs transition-colors hover:border-[#9E1B24] hover:text-[#9E1B24]"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Container>
        </section>

        {/* ================================================================
            SECTION 07 — WHY CHOOSE ATELIER? COMPACT 5-PILLAR STRIP
            ================================================================ */}
        <section className="border-b border-[#E3D7C7] bg-[#FAF6F0] py-10 lg:py-12">
          <Container>
            {/* Horizontal 5-Pillar Strip matching Reference Image */}
            <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
              <div className="lg:col-span-2">
                <h2 className="font-serif text-[24px] leading-[1.15] font-normal text-[#1D1815]">
                  Why Choose <br />
                  <span className="font-semibold text-[#1D1815]">ATELIER?</span>
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 lg:col-span-10 lg:divide-x lg:divide-[#E1D4C2]">
                {WHY_CHOOSE_PILLARS.map((pillar) => {
                  const Icon = pillar.icon;
                  return (
                    <div
                      key={pillar.title}
                      className="flex flex-col items-center px-3 text-center"
                    >
                      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full border border-[#E5D7C6] bg-[#F5EFE6] text-[#9E1B24]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="max-w-[16ch] text-[12px] leading-snug font-semibold text-[#1D1815]">
                        {pillar.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </Container>
        </section>

        {/* ================================================================
            SECTION 08 — BESPOKE CONSULTATION CTA BANNER
            ================================================================ */}
        <section className="relative overflow-hidden border-t border-[#DDD2C5] bg-gradient-to-r from-[#FBF8F3] via-[#F6EAE6] to-[#EBE3D8] py-11 text-[#211D1A] lg:py-13">
          <Container className="relative z-10">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              {/* Left Heading */}
              <div>
                <div className="mb-2 flex items-center gap-2.5">
                  <span className="h-[1.5px] w-6 bg-[#9B1C1C]" />
                  <span className="text-[10.5px] font-bold tracking-[0.22em] text-[#9B1C1C] uppercase">
                    LET&apos;S CREATE TOGETHER
                  </span>
                </div>
                <h2 className="font-serif text-[clamp(1.85rem,3.1vw,2.75rem)] leading-[1.1] font-normal text-[#211D1A]">
                  Let&apos;s Create Your Next{" "}
                  <span className="italic text-[#9B1C1C]">Wall Story.</span>
                </h2>
              </div>

              {/* Center Subcopy */}
              <div className="border-[#DDD2C5] lg:border-l lg:pl-6">
                <p className="max-w-[36ch] text-[13.5px] leading-[1.6] text-[#6F665E]">
                  Discuss your space, surface, and design vision with our Mumbai
                  studio.
                </p>
              </div>

              {/* Right CTAs */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/contact?intent=services"
                  className="inline-flex items-center gap-2 rounded-full bg-[#9B1C1C] px-5 py-2.5 text-[12.5px] font-bold text-[#FAF9F6] shadow-md transition-all hover:bg-[#73171B]"
                >
                  Start a Project Enquiry
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[#DDD2C5] bg-[#FBF8F3] px-4 py-2.5 text-[12.5px] font-semibold text-[#211D1A] shadow-2xs transition-all hover:border-[#9B1C1C] hover:bg-[#F6EAE6]"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-[#9B1C1C]" />
                  WhatsApp +91 80174 63132
                </a>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </PublicShell>
  );
}
