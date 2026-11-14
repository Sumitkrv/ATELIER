"use client";

import { usePageContent } from "@/components/layout/PublicContentProvider";
import React, { useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { ABOUT_PAGE_CONTENT } from "@/lib/blogs-catalogue";

type ExpertiseIconType = "layers" | "craft" | "pin" | "frame";

interface ExpertiseStripItem {
  id: string;
  icon: ExpertiseIconType;
  title: string;
  subtitle: string;
}

interface StudioInfoStat {
  id: string;
  value: string;
  label: string;
}

const STUDIO_OVERLAY_ITEMS: ReadonlyArray<StudioInfoStat> = [
  {
    id: "mumbai-studio",
    value: "Mumbai",
    label: "Based Studio",
  },
  {
    id: "six-surfaces",
    value: "6",
    label: "Architectural Surfaces",
  },
  {
    id: "bespoke-wall-art",
    value: "Bespoke",
    label: "Wall Art",
  },
];

const HERO_EXPERTISE_ITEMS: ReadonlyArray<ExpertiseStripItem> = [
  {
    id: "multi-surface-expertise",
    icon: "layers",
    title: "Multi-Surface Expertise",
    subtitle: "Walls, Tiles, Plywood, Metals & More",
  },
  {
    id: "design-to-installation",
    icon: "craft",
    title: "Design to Installation",
    subtitle: "A Complete Studio Service",
  },
  {
    id: "mumbai-based-studio",
    icon: "pin",
    title: "Mumbai-Based Studio",
    subtitle: "Concept, Print & On-Site Execution",
  },
  {
    id: "bespoke-and-scalable",
    icon: "frame",
    title: "Bespoke & Scalable",
    subtitle: "For Homes, Offices & Commercial Spaces",
  },
];

function ExpertiseLineIcon({ type }: { type: ExpertiseIconType }) {
  switch (type) {
    case "layers":
      return (
        <svg
          viewBox="0 0 32 32"
          fill="none"
          aria-hidden="true"
          className="h-8 w-8 shrink-0 text-[#9B1C1C]"
        >
          <path
            d="M16 5.5L27.5 11.75L16 18L4.5 11.75L16 5.5Z"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.5 16.5L16 22.75L27.5 16.5"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.5 21.25L16 27.5L27.5 21.25"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "craft":
      return (
        <svg
          viewBox="0 0 32 32"
          fill="none"
          aria-hidden="true"
          className="h-8 w-8 shrink-0 text-[#9B1C1C]"
        >
          <path
            d="M8.8 5.2L26.8 23.2L23.2 26.8L5.2 8.8L8.8 5.2Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11.6 8L9.9 9.7M15.2 11.6L13.5 13.3M18.8 15.2L17.1 16.9M22.4 18.8L20.7 20.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M22.9 5.5L26.5 9.1L11.3 24.3L6.2 25.8L7.7 20.7L22.9 5.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20.3 8.1L23.9 11.7M7.7 20.7L11.3 24.3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );

    case "pin":
      return (
        <svg
          viewBox="0 0 32 32"
          fill="none"
          aria-hidden="true"
          className="h-8 w-8 shrink-0 text-[#9B1C1C]"
        >
          <path
            d="M16 27.5C16 27.5 25 19.6 25 13.2C25 8.23 20.97 4.2 16 4.2C11.03 4.2 7 8.23 7 13.2C7 19.6 16 27.5 16 27.5Z"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="16"
            cy="13.2"
            r="3.4"
            stroke="currentColor"
            strokeWidth="1.65"
          />
        </svg>
      );

    case "frame":
      return (
        <svg
          viewBox="0 0 32 32"
          fill="none"
          aria-hidden="true"
          className="h-8 w-8 shrink-0 text-[#9B1C1C]"
        >
          <rect
            x="4.5"
            y="6.5"
            width="23"
            height="19"
            rx="3.2"
            stroke="currentColor"
            strokeWidth="1.65"
          />
          <circle cx="11.2" cy="12.2" r="1.6" fill="currentColor" />
          <path
            d="M6.5 22.5L12.8 15.8L17.4 20.2L21.3 16.4L25.5 21.5"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

/**
 * Subtle warm sunlit leaf-shadow accent + fine architectural curves behind
 * the left editorial column, strictly clipped within `#about-hero`.
 */
function DecorativeArchitecturalLines() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Subtle Upper-Left Sunlit Plaster Ambient Wash */}
      <div
        className="absolute top-0 left-0 hidden h-[340px] w-[36%] opacity-34 lg:block"
        style={{
          background:
            "radial-gradient(92% 88% at 12% 16%, rgba(214,196,174,0.6) 0%, rgba(235,223,208,0.32) 50%, transparent 94%), linear-gradient(132deg, rgba(255,253,249,0.75) 0%, rgba(224,209,190,0.34) 46%, transparent 88%)",
        }}
      />

      {/* Delicate Warm Beige Architectural Curves */}
      <svg
        viewBox="0 0 1450 820"
        fill="none"
        preserveAspectRatio="xMinYMin slice"
        className="h-full w-full opacity-55 sm:opacity-75 lg:opacity-100"
      >
        <path
          d="M -36 595 C 42 636, 152 618, 224 532 C 282 462, 314 360, 356 266 C 412 142, 502 74, 622 68"
          stroke="#DFD0C0"
          strokeWidth="1.15"
          strokeOpacity="0.68"
        />
        <path
          d="M -48 28 C 28 46, 56 138, 30 232 C 14 288, -18 326, -56 344"
          stroke="#DFD0C0"
          strokeWidth="1.05"
          strokeOpacity="0.48"
        />
      </svg>
    </div>
  );
}

/**
 * Left editorial intro column (~36.5% width on desktop)
 */
function HeroContent({
  eyebrow,
  headlineLine1,
  supportingText,
  onScrollToStory,
}: {
  eyebrow: string;
  headlineLine1: string;
  supportingText: string;
  onScrollToStory: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <div className="min-w-0">
      {/* Eyebrow + Main Editorial Heading */}
      <div className="about-reveal-1">
        <div className="inline-flex items-center gap-3">
          <span
            aria-hidden="true"
            className="h-[1.5px] w-7 shrink-0 bg-[#9B1C1C]"
          />
          <span className="text-[11px] font-bold tracking-[0.22em] text-[#9B1C1C] uppercase sm:text-[11.5px]">
            {eyebrow}
          </span>
        </div>

        <h1
          id="about-hero-heading"
          className="mt-3.5 font-serif text-[clamp(2.55rem,4.75vw,5.1rem)] font-normal leading-[1.03] tracking-[-0.024em] text-[#1A1A1A] sm:mt-4"
        >
          <span className="block sm:whitespace-nowrap">{headlineLine1}</span>
          <span className="mt-0.5 block sm:whitespace-nowrap">
            Has a{" "}
            <em className="font-serif italic font-normal text-[#9B1C1C]">
              Story.
            </em>
          </span>
        </h1>
      </div>

      {/* Supporting Description */}
      <p className="about-reveal-2 mt-4 max-w-[44ch] text-[14.5px] leading-[1.65] text-[#665D56] sm:mt-5 sm:text-[15.25px] lg:text-[14.5px] xl:mt-5.5 xl:text-[15.25px]">
        {supportingText}
      </p>

      {/* CTA Buttons + Studio Location Metadata */}
      <div className="about-reveal-3">
        <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-7 sm:gap-3.5 xl:mt-8">
          <a
            href="#studio-story"
            onClick={onScrollToStory}
            className="group inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-[12px] bg-[#9B1C1C] px-6 py-3 text-[13.5px] font-semibold tracking-[0.01em] text-[#FFFDF9] shadow-[0_12px_26px_-8px_rgba(155,28,28,0.42)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#801616] hover:shadow-[0_16px_30px_-8px_rgba(155,28,28,0.5)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9B1C1C] max-[359px]:w-full"
          >
            <span>Our Story</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </a>

          <Link
            href="/projects"
            className="group inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-[12px] border border-[#DFD0C0] bg-[#FFFDF9] px-5.5 py-3 text-[13.5px] font-semibold tracking-[0.01em] text-[#1A1A1A] shadow-[0_4px_14px_-6px_rgba(26,22,18,0.08)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#9B1C1C]/55 hover:text-[#9B1C1C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9B1C1C] max-[359px]:w-full"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
              className="h-[18px] w-[18px] shrink-0 text-[#9B1C1C] transition-transform duration-300 group-hover:scale-105"
            >
              <circle
                cx="10"
                cy="10"
                r="8.25"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M8.5 7.15L13.15 10L8.5 12.85V7.15Z"
                fill="currentColor"
              />
            </svg>
            <span>See Our Work</span>
          </Link>
        </div>

        {/* Studio Location Row */}
        <div className="mt-6 flex flex-wrap items-center gap-x-2.5 gap-y-2 border-t border-[#E5DACB] pt-4 text-[12px] sm:mt-7 sm:gap-x-3 sm:pt-4.5 lg:gap-x-2.5 lg:text-[11.25px] xl:mt-7.5 xl:pt-5 2xl:gap-x-3.5 2xl:text-[12.25px]">
          <span className="inline-flex items-center gap-1.5 font-semibold text-[#1A1A1A]">
            <svg
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              className="h-3.5 w-3.5 shrink-0 text-[#9B1C1C]"
            >
              <path
                d="M8 14.5C8 14.5 13 10.1 13 6.3C13 3.54 10.76 1.3 8 1.3C5.24 1.3 3 3.54 3 6.3C3 10.1 8 14.5 8 14.5Z"
                fill="currentColor"
              />
              <circle cx="8" cy="6.2" r="1.75" fill="#FAF6F0" />
            </svg>
            <span>Oshiwara, Andheri West, Mumbai</span>
          </span>

          <span
            aria-hidden="true"
            className="hidden h-3.5 w-px shrink-0 bg-[#DFD0C0] sm:max-lg:inline-block xl:inline-block"
          />

          <span className="font-medium text-[#4A433E]">
            3D Wall Printing &amp; Multi-Surface Art
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact floating ivory studio panel positioned cleanly inside the bottom-right
 * of the hero photograph (and compactly inset on smaller viewports).
 */
function FloatingStudioInfo() {
  return (
    <div
      aria-label="Verified studio highlights"
      className="z-10 mt-3 rounded-[20px] border border-[#E5DACB] bg-[#FAF6F0]/96 px-3.5 py-3 shadow-[0_14px_32px_-12px_rgba(26,18,12,0.22)] backdrop-blur-xs sm:absolute sm:right-4 sm:bottom-4 sm:mt-0 sm:rounded-[24px] sm:px-5 sm:py-3 lg:right-5 lg:bottom-5 xl:right-6 xl:bottom-6 xl:rounded-[26px] xl:px-6 xl:py-3.5"
    >
      <dl className="grid grid-cols-3 items-center divide-x divide-[#DFD0C0] text-center">
        {STUDIO_OVERLAY_ITEMS.map((stat, idx) => (
          <div
            key={stat.id}
            className={
              idx === 0
                ? "pr-3 sm:pr-4 xl:pr-5"
                : idx === STUDIO_OVERLAY_ITEMS.length - 1
                  ? "pl-3 sm:pl-4 xl:pl-5"
                  : "px-3 sm:px-4 xl:px-5"
            }
          >
            <dt className="sr-only">{stat.label}</dt>
            <dd className="flex flex-col items-center">
              <span className="font-sans text-[14px] font-bold leading-tight tracking-[-0.01em] text-[#9B1C1C] sm:text-[15.5px] xl:text-[17px]">
                {stat.value}
              </span>
              <span className="mt-0.5 text-[10.5px] font-medium leading-snug text-[#2B2520] sm:whitespace-nowrap sm:text-[11px] xl:text-[11.5px]">
                {stat.label}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * Right dominant architectural photograph (~63.5% width on desktop) featuring
 * the sunlit contemporary dining room and bespoke Japanese crane & cherry-blossom mural.
 */
function HeroImage({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="min-w-0">
      <div className="group relative w-full">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[28px] bg-[#ECE3D8] shadow-[0_26px_60px_-20px_rgba(38,26,16,0.18)] ring-1 ring-[#DFD0C0]/80 sm:rounded-[40px] lg:aspect-auto lg:h-[clamp(450px,57svh,545px)] lg:rounded-[46px] xl:h-[clamp(485px,59svh,565px)] xl:rounded-[52px]">
          <div className="about-image-reveal relative h-full w-full">
            <Image
              src={imageUrl}
              alt="Sunlit luxury architectural dining room with a tall black-framed arched window, fluted walnut dining table, cream bouclé chairs, warm arched oak shelving, and a bespoke Japanese red-crowned crane and burgundy cherry blossom mural printed directly onto the warm ivory plaster wall"
              fill
              priority
              sizes="(min-width: 1536px) 920px, (min-width: 1024px) 62vw, 94vw"
              quality={92}
              className="object-cover object-[54%_48%] transition-transform duration-700 ease-out group-hover:scale-[1.015]"
            />
          </div>

          {/* Desktop & Tablet Floating Studio Info Panel Inside Image Container */}
          <div className="hidden sm:block">
            <FloatingStudioInfo />
          </div>
        </div>

        {/* Mobile (< 640px) Unobstructed Compact Studio Info Strip Directly Below Photo */}
        <div className="sm:hidden">
          <FloatingStudioInfo />
        </div>
      </div>
    </div>
  );
}

/**
 * Integrated four-column horizontal studio capability strip beneath the hero.
 */
function ExpertiseStrip() {
  return (
    <div
      aria-label="Atelier studio capabilities"
      className="about-strip-reveal mt-7 rounded-[22px] border border-[#E5DACB] bg-[#FFFDF9] px-5 py-4 shadow-[0_18px_42px_-22px_rgba(38,26,16,0.11)] sm:mt-8 sm:rounded-[24px] sm:px-7 sm:py-5 lg:mt-[clamp(26px,3.8svh,44px)] lg:px-6 lg:py-5 xl:px-7 xl:py-5.5"
    >
      <div className="grid grid-cols-1 divide-y divide-[#ECE3D8] sm:grid-cols-2 sm:gap-x-6 sm:gap-y-5 sm:divide-y-0 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-[#E6DCD0]">
        {HERO_EXPERTISE_ITEMS.map((item, idx) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 py-3.5 first:pt-0 last:pb-0 sm:gap-3.5 sm:py-0 ${
              idx === 0
                ? "lg:pr-4 xl:pr-5.5"
                : idx === HERO_EXPERTISE_ITEMS.length - 1
                  ? "lg:pl-4 xl:pl-5.5"
                  : "lg:px-4 xl:px-5.5"
            }`}
          >
            <ExpertiseLineIcon type={item.icon} />
            <div className="min-w-0">
              <h2 className="text-[13.5px] font-bold leading-[1.28] tracking-[-0.005em] text-[#1A1A1A] lg:text-[13px] xl:text-[14px]">
                {item.title}
              </h2>
              <p className="mt-0.5 text-[11.5px] leading-[1.42] text-[#746B64] lg:text-[11px] xl:text-[11.5px]">
                {item.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * SECTION 01 — ABOUT US LUXURY ARCHITECTURAL HERO
 * Asymmetrical 36.5% / 63.5% editorial hero pairing refined serif storytelling
 * with a sunlit Japanese crane & cherry-blossom dining room mural, compact
 * verified studio overlay, and four-pillar capability bar.
 */
export function AboutStudioHero() {
  const page = usePageContent("about");
  const hero = { ...ABOUT_PAGE_CONTENT.hero, ...(page ? { eyebrow: page.hero.eyebrow, headlineLine1: page.hero.heading, supportingText: page.hero.subheading, heroImageUrl: page.hero.posterImage?.secureUrl || ABOUT_PAGE_CONTENT.hero.heroImageUrl } : {}) };

  const handleScrollToStory = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const target = document.getElementById("studio-story");
      if (!target) return;
      e.preventDefault();
      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({
        behavior: prefersReduced ? "auto" : "smooth",
        block: "start",
      });
    },
    []
  );

  return (
    <section
      id="about-hero"
      aria-labelledby="about-hero-heading"
      className="relative isolate overflow-hidden border-b border-[#E5DACB] bg-[#FAF6F0] pt-6 pb-9 text-[#1A1A1A] sm:pt-8 sm:pb-11 lg:flex lg:min-h-[calc(100svh-var(--navbar-height,75px))] lg:flex-col lg:pt-6 lg:pb-8 xl:pt-8 xl:pb-9"
    >
      {/* Component-scoped GPU entrance animations (SSR-visible & respects prefers-reduced-motion) */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes aboutHeroFadeUp {
            from {
              opacity: 0;
              transform: translate3d(0, 14px, 0);
            }
            to {
              opacity: 1;
              transform: translate3d(0, 0, 0);
            }
          }
          @keyframes aboutHeroImageIn {
            from {
              opacity: 0;
              transform: scale(1.025);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          #about-hero .about-reveal-1 {
            animation: aboutHeroFadeUp 0.62s cubic-bezier(0.22, 1, 0.36, 1) 0.02s both;
          }
          #about-hero .about-reveal-2 {
            animation: aboutHeroFadeUp 0.62s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
          }
          #about-hero .about-reveal-3 {
            animation: aboutHeroFadeUp 0.62s cubic-bezier(0.22, 1, 0.36, 1) 0.18s both;
          }
          #about-hero .about-image-reveal {
            animation: aboutHeroImageIn 0.82s cubic-bezier(0.22, 1, 0.36, 1) 0.06s both;
          }
          #about-hero .about-strip-reveal {
            animation: aboutHeroFadeUp 0.66s cubic-bezier(0.22, 1, 0.36, 1) 0.24s both;
          }
        }
      `}</style>

      <DecorativeArchitecturalLines />

      <Container className="lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-6 xl:px-10">
        {/* Main Two-Column Hero (36.5% Left Typography / 63.5% Right Crane Mural Interior) */}
        <div className="grid grid-cols-1 items-center gap-7 sm:gap-8 lg:grid-cols-[minmax(0,0.365fr)_minmax(0,0.635fr)] lg:gap-8 xl:gap-11">
          <HeroContent
            eyebrow={hero.eyebrow}
            headlineLine1={hero.headlineLine1}
            supportingText={hero.supportingText}
            onScrollToStory={handleScrollToStory}
          />
          <HeroImage imageUrl={hero.heroImageUrl} />
        </div>

        {/* Bottom Four-Column Expertise Strip */}
        <ExpertiseStrip />
      </Container>
    </section>
  );
}
