"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ATELIER_SURFACES } from "@/lib/brand";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/cn";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Home,
  Layers,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";

type ShowroomSpaceType = "Residential" | "Office" | "Hospitality" | "Retail";

interface SurfaceShowroomItem {
  id: string;
  code: string;
  name: string;
  shortLabel: string;
  slabTextureUrl: string;
  applicationImageUrl: string;
  summary: string;
  applications: string;
  technicalNote: string;
  caseStudySlug: string;
  spaceRecommendations: Record<ShowroomSpaceType, string>;
}

const SHOWROOM_SURFACES: ReadonlyArray<SurfaceShowroomItem> = [
  {
    id: "walls",
    code: "SURF-01",
    name: "Walls",
    shortLabel: "Interior Plaster & Primed Walls",
    slabTextureUrl: "/images/atelier/cat-01-botanical.jpg",
    applicationImageUrl: "/images/atelier/artwork-lotus-atelier.jpg",
    summary:
      "Direct vertical 3D printing onto prepared plaster, gypsum, and primed interior walls without wallpaper seams or vinyl edges.",
    applications:
      "Living rooms, double-height foyers, bedrooms, hotel lobbies & reception feature walls",
    technicalNote:
      "Eliminates roll repeats and peeling joints; artwork bonds directly with the prepared wall texture.",
    caseStudySlug: "walls-architectural-elevation-study",
    spaceRecommendations: {
      Residential:
        "Ideal for statement living room walls, master bedroom headboards, and sunlit dining elevations.",
      Office:
        "Transforms reception walls, executive boardrooms, and collaborative studio corridors.",
      Hospitality:
        "Creates seamless floor-to-ceiling murals in boutique hotel lobbies, lounges, and fine dining rooms.",
      Retail:
        "Delivers high-impact brand storytelling and sculptural backdrops behind flagship display zones.",
    },
  },
  {
    id: "tiles",
    code: "SURF-02",
    name: "Tiles",
    shortLabel: "Ceramic, Vitrified & Stone Tiles",
    slabTextureUrl: "/images/atelier/surface-tiles-interior.jpg",
    applicationImageUrl: "/images/atelier/surface-tiles-interior.jpg",
    summary:
      "Continuous graphic and botanical printing across ceramic, porcelain, vitrified, and natural stone tile elevations.",
    applications:
      "Spa feature walls, culinary backsplashes, tiled dining rooms & boutique hospitality washrooms",
    technicalNote:
      "Maintains crisp visual continuity across individual tile faces and grouted joints.",
    caseStudySlug: "tiles-architectural-elevation-study",
    spaceRecommendations: {
      Residential:
        "Perfect for kitchen backsplashes, Mediterranean patio walls, and luxury bath/spa zones.",
      Office:
        "Elevates executive pantry walls, tiled breakout cafés, and washroom foyers.",
      Hospitality:
        "Signature Mediterranean frescoes and mineral motifs across restaurant and spa tile walls.",
      Retail:
        "Custom decorative tile backdrops for perfumery, wellness, and lifestyle boutiques.",
    },
  },
  {
    id: "plywood",
    code: "SURF-03",
    name: "Plywood",
    shortLabel: "Birch Timber, Veneer & Millwork",
    slabTextureUrl: "/images/atelier/cat-02-geometric.jpg",
    applicationImageUrl: "/images/atelier/project-retail-terracotta-arch.jpg",
    summary:
      "Precision artwork printed directly onto birch plywood, engineered wood panels, and custom cabinetry facades.",
    applications:
      "Custom cabinetry, architectural wall panelling, acoustic timber slats & studio partitions",
    technicalNote:
      "Allows natural wood grain character to harmonize with warm terracotta, botanical, or geometric inks.",
    caseStudySlug: "plywood-architectural-elevation-study",
    spaceRecommendations: {
      Residential:
        "Adds bespoke graphic detail to wardrobe shutters, study millwork, and warm timber feature walls.",
      Office:
        "Custom-printed timber acoustic panels and architectural credenzas for modern workspaces.",
      Hospitality:
        "Warm sculptural relief graphics across lounge panelling, bar fronts, and reception desks.",
      Retail:
        "Bespoke printed plywood display plinths, shelving backdrops, and fitting room portals.",
    },
  },
  {
    id: "office-blinds",
    code: "SURF-04",
    name: "Office Blinds",
    shortLabel: "Commercial Window Roller Blinds",
    slabTextureUrl: "/images/atelier/surface-office-blinds-interior.jpg",
    applicationImageUrl: "/images/atelier/surface-office-blinds-interior.jpg",
    summary:
      "Turn drawn commercial roller blinds into continuous panoramic murals across multi-window bays.",
    applications:
      "Executive boardrooms, glazed corner offices, design studios & hospitality window bays",
    technicalNote:
      "Custom-aligned across adjacent blind drops so the horizon or motif flows uninterrupted.",
    caseStudySlug: "office-blinds-architectural-elevation-study",
    spaceRecommendations: {
      Residential:
        "Serene botanical or misty mountain horizons on study and sunroom roller shades.",
      Office:
        "Replaces blank corporate roller blinds with calm panoramic artwork during presentations.",
      Hospitality:
        "Daylight-filtering graphic blinds for sunlit café windows and private dining suites.",
      Retail:
        "Street-facing window blinds that double as refined architectural displays when drawn.",
    },
  },
  {
    id: "metals",
    code: "SURF-05",
    name: "Metals",
    shortLabel: "Brushed Bronze, Aluminum & Steel",
    slabTextureUrl: "/images/atelier/surface-metals-brushed-bronze.jpg",
    applicationImageUrl: "/images/atelier/surface-metals-brushed-bronze.jpg",
    summary:
      "Fine geometric, mineral, and conceptual compositions printed directly onto flat metallic cladding sheets.",
    applications:
      "Elevator lobbies, commercial feature columns, metallic signage & modern studio partitions",
    technicalNote:
      "Pairs metallic satin reflectivity with crisp line art and rich tonal contrast.",
    caseStudySlug: "metals-architectural-elevation-study",
    spaceRecommendations: {
      Residential:
        "Subtle geometric line studies on brushed bronze fireplace surrounds and bar accents.",
      Office:
        "Contemporary metallic cladding panels for corporate lift lobbies and reception cores.",
      Hospitality:
        "Luminous brushed bronze and champagne-gold art panels for luxury lounge interiors.",
      Retail:
        "High-precision graphic printing on anodized aluminum and brass display fixtures.",
    },
  },
  {
    id: "glass",
    code: "SURF-06",
    name: "Glass",
    shortLabel: "Partitions, Sliding Doors & Glazing",
    slabTextureUrl: "/images/atelier/surface-glass-interior.jpg",
    applicationImageUrl: "/images/atelier/surface-glass-interior.jpg",
    summary:
      "Translucent botanical and geometric privacy artwork printed directly onto interior glass partitions.",
    applications:
      "Glass meeting cabins, studio dividers, sliding glass doors & decorative interior glazing",
    technicalNote:
      "Balances visual privacy with natural daylight transmission across glazed rooms.",
    caseStudySlug: "glass-architectural-elevation-study",
    spaceRecommendations: {
      Residential:
        "Frosted botanical art on walk-in wardrobe glass doors, shower screens, and study dividers.",
      Office:
        "Refined acoustic glass cabin partitions that replace generic vinyl manifestation strips.",
      Hospitality:
        "Decorative glazed screens separating dining zones, lounges, and private suites.",
      Retail:
        "Layered translucent window and vitrine graphics that create spatial depth.",
    },
  },
];

const SPACE_SELECTOR_OPTIONS: ReadonlyArray<{
  id: ShowroomSpaceType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "Residential", label: "Residential", icon: Home },
  { id: "Office", label: "Office", icon: Building2 },
  { id: "Hospitality", label: "Hospitality", icon: UtensilsCrossed },
  { id: "Retail", label: "Retail", icon: ShoppingBag },
];

export function SurfaceShowroom3D() {
  const [activeSurfaceId, setActiveSurfaceId] = useState<string>("walls");
  const [activeSpaceType, setActiveSpaceType] =
    useState<ShowroomSpaceType>("Residential");

  // Support hash deep-linking (#walls, #tiles, #plywood, #office-blinds, #metals, #glass)
  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace("#", "").trim().toLowerCase();
      if (hash && SHOWROOM_SURFACES.some((s) => s.id === hash)) {
        setActiveSurfaceId(hash);
      }
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const activeSurface =
    SHOWROOM_SURFACES.find((s) => s.id === activeSurfaceId) ??
    SHOWROOM_SURFACES[0];

  return (
    <section
      id="service-spectrum"
      aria-labelledby="material-showroom-heading"
      className="relative overflow-hidden border-b border-[#E3D7C7] bg-[#F7F1E8] py-14 lg:py-18"
    >
      {/* Zero-height flow anchor targets so #walls..#glass deep links always scroll cleanly with header offset */}
      <div aria-hidden="true" className="pointer-events-none h-0 overflow-hidden">
        {ATELIER_SURFACES.map((s) => (
          <div key={s.id} id={s.id} className="h-0 w-0" />
        ))}
      </div>

      <Container>
        <div className="space-y-10">

      {/* Top Row: Left Editorial Intro + Right 6-Slab 3D Pedestal Showroom */}
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
        {/* Left Editorial Column (4 Cols) */}
        <div className="lg:col-span-4">
          <div className="inline-flex items-center gap-2.5">
            <span className="h-[1.5px] w-6 bg-[#991D20]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#991D20]">
              OUR MATERIAL UNIVERSE
            </span>
          </div>

          <h2
            id="material-showroom-heading"
            className="mt-2.5 font-serif text-3xl font-semibold leading-[1.08] text-[#201C1A] sm:text-4xl lg:text-[2.65rem]"
          >
            One Vision.
            <br />
            Six Extraordinary
            <br />
            Surfaces.
          </h2>

          <p className="mt-3.5 max-w-sm text-[14px] leading-relaxed text-[#5E554F]">
            A complete studio service — from creative direction to on-site 3D
            printing across six architectural substrates, each offering a
            distinct tactile character.
          </p>

          <p className="mt-4 text-xs font-medium text-[#991D20]">
            Select any 3D material slab to inspect specifications &amp; space
            applications →
          </p>
        </div>

        {/* Right 6-Surface 3D Sculptural Pedestal Stage (8 Cols) */}
        <div className="lg:col-span-8">
          <div className="relative pt-4 pb-8">
            {/* Six 3D Angled Material Slabs */}
            <div
              role="tablist"
              aria-label="Select a printable architectural surface"
              className="relative z-20 flex items-end justify-start gap-3 overflow-x-auto px-3 pb-4 pt-4 sm:justify-center sm:gap-3.5 lg:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {SHOWROOM_SURFACES.map((surface, idx) => {
                const isSelected = surface.id === activeSurfaceId;
                // Subtle progressive height steps so the slabs form a sculptural architectural wave
                const heightClasses = [
                  "h-[225px] sm:h-[245px]",
                  "h-[220px] sm:h-[238px]",
                  "h-[214px] sm:h-[230px]",
                  "h-[210px] sm:h-[224px]",
                  "h-[205px] sm:h-[218px]",
                  "h-[200px] sm:h-[212px]",
                ];

                return (
                  <button
                    key={surface.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActiveSurfaceId(surface.id)}
                    style={{
                      transform: isSelected
                        ? "perspective(950px) rotateY(-12deg) translateY(-12px) scale(1.03)"
                        : "perspective(950px) rotateY(-17deg) translateY(0px)",
                    }}
                    className={cn(
                      "group relative w-[112px] shrink-0 cursor-pointer rounded-xl text-left transition-all duration-300 ease-out focus-visible:outline-2 focus-visible:outline-[#991D20] sm:w-[118px] xl:w-[126px]",
                      heightClasses[idx] ?? "h-[220px]"
                    )}
                  >
                    {/* Physical 3D Slab Right & Top Edge Thickness */}
                    <div
                      aria-hidden="true"
                      className={cn(
                        "pointer-events-none absolute -right-[6px] top-[3px] bottom-[-3px] w-[8px] rounded-r-xl transition-colors duration-300",
                        isSelected
                          ? "bg-gradient-to-b from-[#991D20] to-[#5E1113]"
                          : "bg-gradient-to-b from-[#C7B299] via-[#9E8872] to-[#6E5D4F] group-hover:from-[#991D20]"
                      )}
                    />

                    {/* Main Slab Face */}
                    <div
                      className={cn(
                        "relative h-full w-full overflow-hidden rounded-xl bg-[#2A201C] shadow-[12px_18px_26px_-6px_rgba(32,28,26,0.45)] transition-all duration-300",
                        isSelected
                          ? "ring-2 ring-[#991D20]"
                          : "border border-white/35 group-hover:border-[#991D20]/60"
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={surface.slabTextureUrl}
                        alt={`${surface.name} 3D architectural material sample`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Specular Diagonal Sheen + Bottom Vignette */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#140E0C]/90 via-transparent to-white/18"
                      />

                      {/* Slab Label & Arrow */}
                      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-1 p-3">
                        <span className="font-serif text-[16px] font-semibold leading-tight text-[#F8F3ED] drop-shadow-xs">
                          {surface.name}
                        </span>
                        <ArrowRight
                          className={cn(
                            "h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5",
                            isSelected ? "text-[#F3D7CE]" : "text-[#EDE4DA]/80"
                          )}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sculptural Curved Beige Pedestal Base with Warm Rim Glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none relative z-10 mx-auto -mt-5 h-14 w-[98%] rounded-[50%] border-b-[5px] border-[#DFC3A3] bg-gradient-to-b from-[#EFE6DA] via-[#E4D6C5] to-[#CEBCA6] shadow-[0_18px_38px_-6px_rgba(165,115,70,0.32),inset_0_2px_8px_rgba(255,255,255,0.85)]"
            >
              {/* Warm LED Under-Pedestal Halo */}
              <div className="absolute -bottom-2.5 inset-x-8 h-3 rounded-full bg-[#E8B478]/45 blur-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Surface & Space Application Selector Drawer ("Find Your Ideal Application") */}
      <div className="rounded-2xl border border-[#DED5CB] bg-[#FDF8F3] p-5 shadow-xs sm:p-7">
        {/* Top Selector Controls Bar */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#DED5CB] pb-5 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-[#991D20]">
              1. Surface:
            </span>
            {SHOWROOM_SURFACES.map((surface) => {
              const isSelected = surface.id === activeSurfaceId;
              return (
                <button
                  key={surface.id}
                  type="button"
                  onClick={() => setActiveSurfaceId(surface.id)}
                  className={cn(
                    "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                    isSelected
                      ? "bg-[#991D20] text-[#F8F3ED] shadow-2xs"
                      : "border border-[#DED5CB] bg-[#F8F3ED] text-[#201C1A] hover:border-[#991D20] hover:text-[#991D20]"
                  )}
                >
                  {surface.name}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-[#756C65]">
              2. Space Type:
            </span>
            {SPACE_SELECTOR_OPTIONS.map((space) => {
              const Icon = space.icon;
              const isSelected = activeSpaceType === space.id;
              return (
                <button
                  key={space.id}
                  type="button"
                  onClick={() => setActiveSpaceType(space.id)}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                    isSelected
                      ? "bg-[#201C1A] text-[#F8F3ED]"
                      : "border border-[#DED5CB] bg-[#F8F3ED] text-[#201C1A] hover:border-[#991D20]"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 text-[#991D20]" />
                  <span>{space.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Connected Surface + Space Application Detail Body */}
        <div className="mt-6 grid grid-cols-1 items-center gap-7 lg:grid-cols-12">
          {/* Application Image Preview (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-[#DED5CB] bg-[#201C1A]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={activeSurface.applicationImageUrl}
                src={activeSurface.applicationImageUrl}
                alt={`${activeSurface.name} application in ${activeSpaceType} setting`}
                className="h-full w-full object-cover transition-all duration-500"
              />
              <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-[#991D20] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#F8F3ED]">
                  {activeSurface.code} • {activeSurface.name}
                </span>
                <span className="rounded-full bg-[#201C1A]/85 px-2.5 py-0.5 text-[10px] font-medium text-[#EDE4DA] backdrop-blur-xs">
                  {activeSpaceType} Application Concept
                </span>
              </div>
            </div>
          </div>

          {/* Specifications & Actions (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#991D20]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{activeSurface.shortLabel}</span>
            </div>

            <h3 className="mt-1.5 font-serif text-2xl font-semibold text-[#201C1A] sm:text-3xl">
              3D Printing on {activeSurface.name} for {activeSpaceType} Spaces
            </h3>

            <p className="mt-2.5 text-[13.5px] leading-relaxed text-[#4E4640]">
              {activeSurface.summary}
            </p>

            {/* Space-Specific Recommendation Callout */}
            <div className="mt-4 rounded-xl border border-[#E2D8CC] bg-[#F8F3ED] p-3.5">
              <p className="flex items-start gap-2 text-xs leading-relaxed text-[#201C1A]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#991D20]" />
                <span>
                  <strong>{activeSpaceType} Guidance:</strong>{" "}
                  {activeSurface.spaceRecommendations[activeSpaceType]}
                </span>
              </p>
              <p className="mt-1.5 pl-6 text-[11.5px] text-[#6E655E]">
                <strong>Typical Applications:</strong>{" "}
                {activeSurface.applications}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href={`/contact?interest=${encodeURIComponent(
                  `3D Printing on ${activeSurface.name} (${activeSpaceType})`
                )}&surface=${encodeURIComponent(activeSurface.name)}`}
                className="inline-flex items-center gap-2 rounded-lg bg-[#991D20] px-5 py-2.5 text-xs font-medium text-[#F8F3ED] transition-colors hover:bg-[#73171B]"
              >
                <span>Request {activeSurface.name} Consultation</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>

              <Link
                href={`/projects/${activeSurface.caseStudySlug}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D9C8B5] bg-[#F8F3ED] px-4 py-2.5 text-xs font-medium text-[#201C1A] transition-colors hover:border-[#991D20] hover:text-[#991D20]"
              >
                <Layers className="h-3.5 w-3.5 text-[#991D20]" />
                <span>View {activeSurface.name} Studio Study</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
        </div>
      </Container>
    </section>
  );
}

