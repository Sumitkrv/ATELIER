"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Layers,
  Compass,
  Building2,
  Gem,
  PenTool,
  Eye,
  ShieldCheck,
  Headphones,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Box,
} from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";
import { Container } from "@/components/layout/Container";
import { SurfaceShowroom3D } from "@/components/services/SurfaceShowroom3D";
import { TabletVisualizerShowcase } from "@/components/services/TabletVisualizerShowcase";
import {
  SERVICES_PAGE_CONTENT,
  DEVELOPMENT_PROJECT_FIXTURES,
} from "@/lib/projects-catalogue";
import {
  ATELIER_WHATSAPP_NUMBERS,
  buildWhatsAppUrl,
} from "@/lib/brand";

interface CoreServiceItem {
  id: string;
  number: string;
  title: string;
  shortDescription: string;
  sculpturalObjectImage: string;
  objectAlt: string;
  detailedOverview: string;
  idealSubstrates: string[];
  deliverables: string[];
  ctaLabel: string;
  ctaHref: string;
}

const CORE_SERVICES: CoreServiceItem[] = [
  {
    id: "direct-to-surface-3d-printing",
    number: "01",
    title: "Direct-to-Surface 3D Printing",
    shortDescription:
      "High-definition artwork printed directly on prepared surfaces.",
    sculpturalObjectImage: "/images/atelier/service-obj-01-printing.jpg",
    objectAlt:
      "Sculptural stepped architectural pyramid block representing multi-layer direct-to-surface 3D printing",
    detailedOverview:
      "Using precision vertical wall-printing rigs and flatbed UV-cured ink passes, we print directly onto prepared architectural substrates without vinyl seams, peeling edges, or wallpaper joints.",
    idealSubstrates: ["Walls", "Tiles", "Plywood", "Metals", "Glass"],
    deliverables: [
      "On-site substrate readiness inspection",
      "Multi-pass UV-cured tactile or matte ink application",
      "Seamless edge-to-edge architectural registration",
    ],
    ctaLabel: "Enquire About Surface Printing",
    ctaHref: "/contact?intent=services&service=direct-3d-printing",
  },
  {
    id: "architectural-murals",
    number: "02",
    title: "Architectural Murals",
    shortDescription: "Large-scale, space-defining murals for interiors.",
    sculpturalObjectImage: "/images/atelier/service-obj-02-murals.jpg",
    objectAlt:
      "Sculpted botanical lotus relief medallion representing bespoke architectural murals",
    detailedOverview:
      "Statement feature walls crafted for double-height living rooms, hotel lobbies, executive boardrooms, and dining sanctuaries—scaled proportionally to ceiling height, furniture lines, and natural daylight.",
    idealSubstrates: ["Walls", "Tiles", "Plywood"],
    deliverables: [
      "Full-elevation architectural scale composition",
      "Daylight & warm-LED colour tone calibration",
      "Mockup preview mapped to your room photograph",
    ],
    ctaLabel: "Commission a Feature Mural",
    ctaHref: "/contact?intent=services&service=architectural-murals",
  },
  {
    id: "conceptual-wall-art",
    number: "03",
    title: "Conceptual Wall Art",
    shortDescription:
      "Bespoke compositions tailored to your space and theme.",
    sculpturalObjectImage: "/images/atelier/service-obj-03-conceptual.jpg",
    objectAlt:
      "Sculpted organic wave relief forms representing conceptual wall art",
    detailedOverview:
      "Curated storytelling compositions developed around your interior architecture, material moodboard, and spatial identity—ranging from quiet travertine geometry to expressive botanical studies.",
    idealSubstrates: ["Walls", "Glass", "Office Blinds", "Metals"],
    deliverables: [
      "Bespoke concept direction with studio founders",
      "Curated palette matching stone, timber & upholstery",
      "Multi-panel or continuous wall narrative layout",
    ],
    ctaLabel: "Discuss a Concept Direction",
    ctaHref: "/contact?intent=services&service=conceptual-wall-art",
  },
  {
    id: "design-customization",
    number: "04",
    title: "Design Customization",
    shortDescription:
      "Scale, crop, tone and placement configured to your surface.",
    sculpturalObjectImage: "/images/atelier/service-obj-04-customization.jpg",
    objectAlt:
      "Unfurled architectural scroll representing bespoke artwork scale and tone customization",
    detailedOverview:
      "Every artwork in our 13-category catalogue can be adapted to your exact wall width, architectural niches, door frames, and furniture clearances—with custom colourway adjustments before printing.",
    idealSubstrates: [
      "Walls",
      "Tiles",
      "Plywood",
      "Office Blinds",
      "Metals",
      "Glass",
    ],
    deliverables: [
      "Custom dimension cropping & aspect-ratio re-composition",
      "Pigment & background warmth tuning",
      "Obstacle mapping around switches, arches & cabinetry",
    ],
    ctaLabel: "Customize a Catalogue Design",
    ctaHref: "/explore-designs",
  },
];

const HERO_HIGHLIGHTS = [
  {
    icon: Layers,
    title: "6 Surfaces",
    subtitle: "Walls to Glass",
  },
  {
    icon: Compass,
    title: "Concept to Installation",
    subtitle: "End-to-End Flow",
  },
  {
    icon: Building2,
    title: "Homes to Commercial",
    subtitle: "All Interior Scales",
  },
  {
    icon: Gem,
    title: "Studio Support",
    subtitle: "Mumbai Atelier",
  },
];

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
    image: "/images/atelier/artwork-lotus-atelier.jpg",
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
    image: "/images/atelier/artwork-geometric-harmony.jpg",
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
    image: "/images/atelier/artwork-botanical-canopy.jpg",
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
    image: "/images/atelier/project-retail-terracotta-arch.jpg",
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
    image: "/images/atelier/project-boardroom-relief-wall.jpg",
    projectSlug:
      DEVELOPMENT_PROJECT_FIXTURES[5]?.slug ??
      "blinds-workspace-window-study",
  },
];

export default function ServicesPage() {
  const [selectedCoreServiceId, setSelectedCoreServiceId] = useState<string>(
    CORE_SERVICES[0].id
  );
  const [spaceFilter, setSpaceFilter] = useState<
    "All" | "Residential" | "Commercial" | "Hospitality"
  >("All");
  const [studyPageOffset, setStudyPageOffset] = useState<number>(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const selectedCoreService =
    CORE_SERVICES.find((s) => s.id === selectedCoreServiceId) ??
    CORE_SERVICES[0];

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
            SECTION 01 — CINEMATIC SCULPTURAL HERO
            ================================================================ */}
        <section className="relative overflow-hidden border-b border-[#E3D7C7] bg-gradient-to-br from-[#FBF8F3] via-[#F6EFE4] to-[#EDE1D1] py-8 sm:py-10 lg:flex lg:min-h-[clamp(620px,calc(100svh-var(--navbar-height,74px)),840px)] lg:items-center lg:py-12">
          {/* Subtle architectural curved plaster background lines */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full border border-[#E2D4C3]/70 bg-gradient-to-br from-white/50 to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-16 left-1/4 h-[520px] w-[520px] rounded-full border border-[#E5D8C7]/50"
          />

          <Container className="relative z-10 w-full">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-8 xl:gap-10">
              {/* Left Column: Editorial Headline, CTAs & 4 Highlights (5 cols) */}
              <div className="lg:col-span-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="h-[1.5px] w-7 bg-[#9E1B24]" />
                  <span className="text-[11px] font-bold tracking-[0.22em] text-[#9E1B24] uppercase">
                    OUR SERVICES
                  </span>
                </div>

                <h1 className="font-serif text-[clamp(2.35rem,4.1vw,3.65rem)] leading-[1.06] font-normal tracking-[-0.02em] text-[#1D1815]">
                  Turn Any Surface <br />
                  into a{" "}
                  <span className="italic text-[#9E1B24]">Living Canvas.</span>
                </h1>

                <p className="mt-4 max-w-[44ch] text-[14.5px] leading-[1.68] text-[#5F544C]">
                  Design, print and install expressive wall art directly on
                  architectural surfaces — with precision, scale and
                  studio-level craftsmanship.
                </p>

                {/* Primary & Secondary CTAs */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    href="/contact?intent=services"
                    className="inline-flex items-center gap-2 rounded-full bg-[#9E1B24] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_10px_24px_rgba(158,27,36,0.26)] transition-all hover:bg-[#7F141C]"
                  >
                    Get a Custom Consultation
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <a
                    href="#service-spectrum"
                    className="inline-flex items-center gap-2 rounded-full border border-[#D5C5B2] bg-[#FAF6F0]/90 px-4 py-2.5 text-[13px] font-semibold text-[#1D1815] shadow-2xs transition-all hover:border-[#9E1B24] hover:text-[#9E1B24]"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#9E1B24]" />
                    Explore Our Services
                  </a>
                </div>

                {/* 4 Architectural Highlight Indicators */}
                <div className="mt-8 grid grid-cols-2 gap-3 border-t border-[#DFD2C0] pt-5 sm:grid-cols-4 lg:gap-2">
                  {HERO_HIGHLIGHTS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.title}
                        className="flex items-center gap-2.5"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E2D4C3] bg-[#FAF6F0] text-[#9E1B24] shadow-2xs">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[11.5px] leading-tight font-bold text-[#1D1815]">
                            {item.title}
                          </p>
                          <p className="text-[10px] leading-tight text-[#76685C]">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Sculptural Curved Oval Arch Framing Living Room Mural (7 cols, full uncropped 1376/768 aspect ratio) */}
              <div className="lg:col-span-7">
                <div className="group relative mx-auto overflow-hidden rounded-[26px] border border-[#DACBB8] bg-[#FBF8F3] shadow-[0_24px_58px_rgba(32,24,18,0.13)] sm:rounded-[30px]">
                  <div className="relative aspect-[1376/768] w-full overflow-hidden bg-[#E5D7C5]">
                    <img
                      src="/images/atelier/services-hero-sculptural-lotus.jpg"
                      alt="Sculptural curved lime-plaster oval arch framing a luxury living room with a bespoke blush lotus and sage botanical mural"
                      className="h-full w-full object-cover object-[50%_75%] transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  </div>

                  {/* Dedicated Warm Ivory Architectural Caption Bar below image so floor, sofa & arch base are never cropped */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-[#E3D7C7] bg-[#FBF8F3] px-4 py-3 text-[#1D1815] sm:px-5 sm:py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#9E1B24]" />
                      <span className="text-[11.5px] font-medium tracking-wide text-[#2B2420] sm:text-xs">
                        Lotus Atelier Relief Study • Direct-to-Wall Lime
                        Plaster
                      </span>
                    </div>
                    <Link
                      href="/visualizer?design=lotus-atelier-study"
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.04em] text-[#9E1B24] transition-colors hover:text-[#1D1815]"
                    >
                      <Box className="h-3.5 w-3.5" />
                      <span>Preview on Your Wall</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* ================================================================
            SECTION 02 — FLOATING SIX-SURFACE 3D MATERIAL SHOWROOM
            (Includes interactive Surface + Space selector & #walls..#glass anchors)
            ================================================================ */}
        <SurfaceShowroom3D />

        {/* ================================================================
            SECTION 03 — INTERACTIVE CORE SERVICES (4 SCULPTURAL OBJECT CARDS)
            ================================================================ */}
        <section
          id="core-expertise"
          className="relative border-b border-[#E3D7C7] bg-[#F7F1E8] py-14 lg:py-18"
        >
          <Container>
            {/* Section Header */}
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <div className="mb-2.5 flex items-center gap-3">
                  <span className="h-[1.5px] w-7 bg-[#9E1B24]" />
                  <span className="text-[11px] font-bold tracking-[0.22em] text-[#9E1B24] uppercase">
                    OUR EXPERTISE
                  </span>
                </div>
                <h2 className="font-serif text-[clamp(1.85rem,3vw,2.65rem)] leading-[1.1] font-normal tracking-[-0.02em] text-[#1D1815]">
                  Where Art Meets{" "}
                  <span className="italic text-[#9E1B24]">
                    Architectural Precision
                  </span>
                </h2>
              </div>
              <p className="max-w-[44ch] text-[13.5px] leading-[1.6] text-[#5F544C]">
                Select any of our four core studio disciplines below to inspect
                compatible substrates, deliverables, and commissioning options.
              </p>
            </div>

            {/* 4 Sculptural Object Cards Row (matching reference mockup) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {CORE_SERVICES.map((service) => {
                const isSelected = service.id === selectedCoreService.id;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setSelectedCoreServiceId(service.id)}
                    className={`group relative flex flex-col justify-between rounded-[22px] border p-5 text-left transition-all duration-300 ${
                      isSelected
                        ? "-translate-y-1 border-[#9E1B24]/65 bg-[#FAF6F0] shadow-[0_18px_40px_rgba(158,27,36,0.12)] ring-1 ring-[#9E1B24]/25"
                        : "border-[#E1D4C2] bg-[#FAF6F0]/85 shadow-[0_8px_24px_rgba(29,24,21,0.05)] hover:-translate-y-1 hover:border-[#CBB8A0] hover:bg-[#FAF6F0]"
                    }`}
                  >
                    {/* Top Sculptural 3D Object Thumbnail + Number Pill */}
                    <div>
                      <div className="relative mb-3 flex h-24 w-full items-center justify-between overflow-hidden rounded-xl bg-[#F6EFE6]">
                        <img
                          src={service.sculpturalObjectImage}
                          alt={service.objectAlt}
                          className="h-full w-auto max-w-[78%] object-contain object-left transition-transform duration-500 group-hover:scale-105"
                        />
                        <span
                          className={`mr-2 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-[0.12em] transition-colors ${
                            isSelected
                              ? "bg-[#9E1B24] text-white"
                              : "bg-[#EAE0D2] text-[#6E6259]"
                          }`}
                        >
                          {service.number}
                        </span>
                      </div>

                      {/* Title + Circular Arrow Action Button */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif text-[19px] leading-[1.2] font-medium text-[#1D1815]">
                          {service.title}
                        </h3>
                        <span
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all ${
                            isSelected
                              ? "border-[#9E1B24] bg-[#9E1B24] text-white"
                              : "border-[#D5C3B0] bg-white text-[#9E1B24] group-hover:border-[#9E1B24]"
                          }`}
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>

                      <p className="mt-2 text-[12.5px] leading-[1.55] text-[#655950]">
                        {service.shortDescription}
                      </p>
                    </div>

                    {/* Subtle bottom active bar */}
                    <div className="mt-4 flex items-center justify-between border-t border-[#EAE0D2] pt-2.5 text-[10.5px] font-semibold tracking-[0.08em] text-[#847466] uppercase">
                      <span>{service.idealSubstrates.length} Substrates</span>
                      <span
                        className={
                          isSelected ? "text-[#9E1B24]" : "text-[#847466]"
                        }
                      >
                        {isSelected ? "Active Specification" : "Inspect →"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Interactive Core Service Detail Drawer */}
            <div className="mt-6 rounded-[24px] border border-[#DFD2C0] bg-[#FAF6F0] p-6 shadow-[0_14px_36px_rgba(29,24,21,0.06)] lg:p-7">
              <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#9E1B24]/10 px-3 py-1 text-[10.5px] font-bold tracking-[0.14em] text-[#9E1B24] uppercase">
                    Discipline {selectedCoreService.number} • Studio
                    Specification
                  </span>
                  <h3 className="mt-2.5 font-serif text-[24px] leading-tight font-normal text-[#1D1815]">
                    {selectedCoreService.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-[1.65] text-[#5F544C]">
                    {selectedCoreService.detailedOverview}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {selectedCoreService.idealSubstrates.map((sub) => (
                      <span
                        key={sub}
                        className="rounded-full border border-[#DFD2C0] bg-[#F3ECE1] px-2.5 py-0.5 text-[11px] font-semibold text-[#3E342D]"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-4">
                  <p className="text-[11px] font-bold tracking-[0.16em] text-[#7D6E61] uppercase">
                    Included Studio Deliverables
                  </p>
                  <ul className="mt-2.5 space-y-2">
                    {selectedCoreService.deliverables.map((del) => (
                      <li
                        key={del}
                        className="flex items-start gap-2 text-[12.5px] leading-snug text-[#4E443C]"
                      >
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9E1B24]" />
                        <span>{del}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-2.5 lg:col-span-3 lg:items-end">
                  <Link
                    href={selectedCoreService.ctaHref}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#9E1B24] px-5 py-2.5 text-[12.5px] font-semibold text-white shadow-sm transition-all hover:bg-[#7F141C] lg:w-auto"
                  >
                    {selectedCoreService.ctaLabel}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href="/visualizer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#D5C3B0] bg-white px-4 py-2 text-[12px] font-semibold text-[#1D1815] transition-all hover:border-[#9E1B24] hover:text-[#9E1B24] lg:w-auto"
                  >
                    Test in Wall Visualizer
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* ================================================================
            SECTION 05 — INTERACTIVE WALL VISUALIZER SHOWCASE (TABLET SLIDER)
            ================================================================ */}
        <TabletVisualizerShowcase />

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
                        className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-all ${
                          active
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
                  <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
                    {rotatedStudies.map((study) => (
                      <Link
                        key={study.id}
                        href={`/projects/${study.projectSlug}`}
                        className="group relative aspect-[4/3] overflow-hidden rounded-[20px] border border-[#DACBB8] bg-[#241D18] shadow-[0_14px_34px_rgba(29,24,21,0.14)]"
                      >
                        <img
                          src={study.image}
                          alt={`${study.title} — ${study.locationAndSurface}`}
                          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
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

                  {/* Next/Prev Carousel Buttons matching Reference */}
                  {spaceFilter === "All" && (
                    <div className="hidden flex-col gap-2 xl:flex">
                      <button
                        type="button"
                        onClick={() => handleCycleStudies("prev")}
                        aria-label="Previous space studies"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D4C4B0] bg-[#FAF6F0] text-[#1D1815] shadow-2xs transition-colors hover:border-[#9E1B24] hover:text-[#9E1B24]"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCycleStudies("next")}
                        aria-label="Next space studies"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D4C4B0] bg-[#FAF6F0] text-[#1D1815] shadow-2xs transition-colors hover:border-[#9E1B24] hover:text-[#9E1B24]"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* ================================================================
            SECTION 07 — WHY CHOOSE ATELIER? COMPACT 5-PILLAR STRIP + FAQ
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

            {/* Collapsible Technical Surface FAQs */}
            <div className="mt-10 border-t border-[#E6DACB] pt-8">
              <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <span className="text-[10.5px] font-bold tracking-[0.2em] text-[#9E1B24] uppercase">
                    TECHNICAL CLARITY
                  </span>
                  <h3 className="font-serif text-[21px] font-normal text-[#1D1815]">
                    Frequently Asked Surface & Execution Questions
                  </h3>
                </div>
                <Link
                  href="/contact?intent=services"
                  className="text-[12px] font-semibold text-[#9E1B24] hover:underline"
                >
                  Have a specific substrate question? Ask our studio →
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {SERVICES_PAGE_CONTENT.faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={faq.question}
                      className="rounded-xl border border-[#E2D5C4] bg-[#F7F1E8]/75 transition-all"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenFaqIndex(isOpen ? null : idx)
                        }
                        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                      >
                        <span className="text-[13px] font-semibold text-[#1D1815]">
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-[#9E1B24] transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="border-t border-[#E6DACB] px-4 pt-2.5 pb-3.5 text-[12.5px] leading-[1.6] text-[#5F544C]">
                          {faq.answer}
                        </div>
                      )}
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
