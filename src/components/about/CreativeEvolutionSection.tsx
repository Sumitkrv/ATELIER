"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { ABOUT_PAGE_CONTENT } from "@/lib/blogs-catalogue";
import { cn } from "@/lib/cn";

const EDITORIAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export type EvolutionPillar = {
  id: number;
  code: string;
  title: string;
  titleLines: readonly [string, string];
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

function ArchVisionIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className={cn("h-6 w-6 text-[#9B1C1C]", className)}
    >
      <path
        d="M7.25 22.5V13.1C7.25 9.18 10.27 6 14 6C17.73 6 20.75 9.18 20.75 13.1V22.5"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 22.5V13.35C10.5 11.28 12.07 9.6 14 9.6C15.93 9.6 17.5 11.28 17.5 13.35V22.5"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PrintableSurfacesIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className={cn("h-6 w-6 text-[#9B1C1C]", className)}
    >
      <path
        d="M14 5.75L22.75 10.25L14 14.75L5.25 10.25L14 5.75Z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
      <path
        d="M5.25 14.25L14 18.75L22.75 14.25"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.25 18.25L14 22.75L22.75 18.25"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DesignCategoriesIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className={cn("h-6 w-6 text-[#9B1C1C]", className)}
    >
      <rect
        x="6"
        y="6"
        width="6.8"
        height="6.8"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.65"
      />
      <rect
        x="15.2"
        y="6"
        width="6.8"
        height="6.8"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.65"
      />
      <rect
        x="6"
        y="15.2"
        width="6.8"
        height="6.8"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.65"
      />
      <rect
        x="15.2"
        y="15.2"
        width="6.8"
        height="6.8"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.65"
      />
    </svg>
  );
}

function WallVisualizerIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className={cn("h-6 w-6 text-[#9B1C1C]", className)}
    >
      <rect
        x="5.25"
        y="6.75"
        width="17.5"
        height="14.5"
        rx="2.25"
        stroke="currentColor"
        strokeWidth="1.65"
      />
      <circle cx="18.15" cy="11.15" r="1.45" fill="currentColor" />
      <path
        d="M6.75 19.25L12.1 13.85L16.15 17.65L18.85 15.2L21.75 18.25"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BespokeSpacesIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className={cn("h-6 w-6 text-[#9B1C1C]", className)}
    >
      <path
        d="M8.25 13.75V9.85C8.25 8.14 9.64 6.75 11.35 6.75H16.65C18.36 6.75 19.75 8.14 19.75 9.85V13.75"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 13.5C6 12.4 6.9 11.5 8 11.5C9.1 11.5 10 12.4 10 13.5V16.5H18V13.5C18 12.4 18.9 11.5 20 11.5C21.1 11.5 22 12.4 22 13.5V18C22 19.1 21.1 20 20 20H8C6.9 20 6 19.1 6 18V13.5Z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
      <path
        d="M8.75 20V22.25M19.25 20V22.25"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
    </svg>
  );
}

const EVOLUTION_PILLARS: ReadonlyArray<EvolutionPillar> = [
  {
    id: 1,
    code: "01",
    title: "Architectural Vision",
    titleLines: ["Architectural", "Vision"],
    description: "Studio founded in Mumbai around expressive wall art.",
    icon: ArchVisionIcon,
  },
  {
    id: 2,
    code: "02",
    title: "6 Printable Surfaces",
    titleLines: ["6 Printable", "Surfaces"],
    description: "Expanded to walls, tiles, plywood, blinds, metals & glass.",
    icon: PrintableSurfacesIcon,
  },
  {
    id: 3,
    code: "03",
    title: "13 Design Categories",
    titleLines: ["13 Design", "Categories"],
    description:
      "Curated botanical, textured, architectural & mineral collections.",
    icon: DesignCategoriesIcon,
  },
  {
    id: 4,
    code: "04",
    title: "Wall Visualizer",
    titleLines: ["Wall", "Visualizer"],
    description: "Interactive room preview for confident scale & placement.",
    icon: WallVisualizerIcon,
  },
  {
    id: 5,
    code: "05",
    title: "Bespoke Spaces",
    titleLines: ["Bespoke", "Spaces"],
    description:
      "Continuing to craft expressive residential & commercial walls.",
    icon: BespokeSpacesIcon,
  },
];

function EvolutionEnvironment() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Warm Ivory Plaster Surface */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #FAF6F0 0%, #F9F3EB 58%, #F6EEE4 100%)",
        }}
      />

      {/* Soft Upper-Left Sunlit Plaster Ambient Wash */}
      <div
        className="absolute top-0 left-0 hidden h-[300px] w-[32%] opacity-28 md:block"
        style={{
          background:
            "radial-gradient(90% 86% at 12% 16%, rgba(214,196,174,0.58) 0%, rgba(235,223,208,0.3) 50%, transparent 94%), linear-gradient(130deg, rgba(255,253,249,0.72) 0%, rgba(224,209,190,0.3) 46%, transparent 88%)",
        }}
      />

      {/* Sculpted Warm Plaster Curves Along Upper-Right & Lower-Right Edges */}
      <svg
        viewBox="0 0 1600 520"
        fill="none"
        preserveAspectRatio="none"
        className="h-full w-full opacity-90"
      >
        <defs>
          <linearGradient id="evoPlasterUpperRight" x1="1" y1="0" x2="0.2" y2="0.9">
            <stop offset="0%" stopColor="#EFE3D3" stopOpacity="0.68" />
            <stop offset="65%" stopColor="#F5ECE0" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#FAF6F0" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="evoPlasterLowerRight" x1="1" y1="0.2" x2="0.35" y2="1">
            <stop offset="0%" stopColor="#EADBC8" stopOpacity="0.58" />
            <stop offset="100%" stopColor="#FAF6F0" stopOpacity="0.06" />
          </linearGradient>
        </defs>

        <path
          d="M 1035 520 C 1075 268, 1235 44, 1465 36 C 1532 34, 1582 54, 1620 88 L 1620 520 Z"
          fill="url(#evoPlasterUpperRight)"
        />
        <path
          d="M 1035 520 C 1075 268, 1235 44, 1465 36 C 1532 34, 1582 54, 1620 88"
          stroke="#E4D6C5"
          strokeWidth="1.2"
        />

        <path
          d="M 1255 520 C 1345 436, 1472 392, 1620 326 L 1620 520 Z"
          fill="url(#evoPlasterLowerRight)"
        />
        <path
          d="M 1255 520 C 1345 436, 1472 392, 1620 326"
          stroke="#DFD0BE"
          strokeWidth="1.2"
        />
      </svg>
    </div>
  );
}

function ArchitecturalAlcove({
  imageUrl,
  revealVisible,
  className,
}: {
  imageUrl: string;
  revealVisible: boolean;
  className?: string;
}) {
  return (
    <motion.div
      initial={false}
      animate={revealVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      transition={{ duration: 0.68, ease: EDITORIAL_EASE }}
      className={cn("relative select-none", className)}
    >
      <div className="relative mx-auto w-[94px] sm:w-[112px] md:mx-0 md:w-[126px] lg:w-[140px] xl:w-[156px]">
        <Image
          src={imageUrl}
          alt="Recessed warm ivory plaster architectural arch alcove with concealed cove lighting, rounded limestone plinth, and beige ceramic vase holding burgundy berry branches"
          width={376}
          height={1044}
          sizes="(min-width: 1280px) 160px, (min-width: 768px) 144px, 128px"
          quality={92}
          className="h-auto w-full object-contain drop-shadow-[0_16px_24px_rgba(74,48,28,0.14)]"
        />

        {/* Soft Travertine Plinth Floor Contact Shadow */}
        <div
          aria-hidden="true"
          className="pointer-events-none mx-auto -mt-1.5 h-3 w-[92%] rounded-full blur-md"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(66, 44, 26, 0.22) 0%, rgba(66, 44, 26, 0) 74%)",
          }}
        />
      </div>
    </motion.div>
  );
}

function EditorialIntroduction({
  eyebrow,
  supportingText,
  revealVisible,
}: {
  eyebrow: string;
  supportingText: string;
  revealVisible: boolean;
}) {
  return (
    <motion.div
      initial={false}
      animate={revealVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.62, delay: 0.08, ease: EDITORIAL_EASE }}
      className="min-w-0"
    >
      <div className="inline-flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="h-[1.5px] w-6 shrink-0 bg-[#9B1C1C]"
        />
        <span className="text-[10.5px] font-bold tracking-[0.2em] text-[#9B1C1C] uppercase">
          {eyebrow}
        </span>
      </div>

      <h2
        id="creative-evolution-heading"
        className="mt-2.5 font-serif text-[clamp(2.1rem,2.65vw,2.65rem)] font-normal leading-[1.06] tracking-[-0.022em] text-[#1A1A1A]"
      >
        <span className="block sm:whitespace-nowrap">A Growing</span>{" "}
        <span className="mt-0.5 block sm:whitespace-nowrap">
          <em className="font-serif italic font-normal text-[#9B1C1C]">
            Wall Story.
          </em>
        </span>
      </h2>

      <p className="mt-3.5 max-w-[34ch] text-[13.5px] leading-[1.62] text-[#574E47] xl:max-w-[29ch] xl:text-[13px]">
        {supportingText}
      </p>
    </motion.div>
  );
}

function TimelineConnector({ revealVisible }: { revealVisible: boolean }) {
  return (
    <>
      {/* Desktop & Landscape-Tablet Smooth Cubic-Bézier Burgundy Wave (1024px+)
          Normalized to 5 equal columns with centers at x = 100, 300, 500, 700, 900 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 hidden h-[84px] lg:block"
      >
        <svg
          viewBox="0 0 1000 84"
          fill="none"
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
        >
          <motion.path
            d="M 100 42 C 172 28, 232 73, 300 73 C 368 73, 428 32, 500 32 C 572 32, 632 73, 700 73 C 768 73, 828 32, 900 40"
            stroke="#9B1C1C"
            strokeWidth="1.65"
            strokeOpacity="0.72"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={false}
            animate={
              revealVisible
                ? { pathLength: 1, opacity: 1 }
                : { pathLength: 0, opacity: 0.15 }
            }
            transition={{ duration: 1.08, delay: 0.14, ease: EDITORIAL_EASE }}
          />
        </svg>
      </div>

      {/* Mobile Continuous Vertical Burgundy Timeline Spine (< 768px) */}
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={
          revealVisible
            ? { scaleY: 1, opacity: 1 }
            : { scaleY: 0.15, opacity: 0.2 }
        }
        transition={{ duration: 0.95, delay: 0.12, ease: EDITORIAL_EASE }}
        style={{ transformOrigin: "top center" }}
        className="pointer-events-none absolute top-7 bottom-8 left-[26px] w-[1.5px] bg-gradient-to-b from-[#9B1C1C]/65 via-[#9B1C1C]/45 to-[#9B1C1C]/20 md:hidden"
      />
    </>
  );
}

function TimelineMilestone({
  pillar,
  index,
  totalCount,
  revealVisible,
}: {
  pillar: EvolutionPillar;
  index: number;
  totalCount: number;
  revealVisible: boolean;
}) {
  const IconComponent = pillar.icon;
  const isLast = index === totalCount - 1;
  // Pillars 01, 03, 05 sit above wave crests; Pillars 02 & 04 sit directly on wave troughs
  const hasCrestStem = index % 2 === 0;

  return (
    <motion.li
      initial={false}
      animate={revealVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{
        duration: 0.56,
        delay: 0.18 + index * 0.1,
        ease: EDITORIAL_EASE,
      }}
      className={cn(
        "group relative flex items-start gap-4 md:flex-col md:items-center md:gap-0 md:text-center",
        index >= 3 && "md:max-lg:pt-2"
      )}
    >
      {/* Circular Ivory Milestone Medallion + Small Solid Burgundy Node */}
      <div className="relative z-10 flex shrink-0 flex-col items-center">
        <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#FFFDF9] shadow-[0_10px_22px_-8px_rgba(62,38,20,0.18)] ring-1 ring-[#EAE0D3] transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_14px_26px_-8px_rgba(155,28,28,0.22)] group-hover:ring-[#9B1C1C]/55 lg:h-[62px] lg:w-[62px]">
          <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full ring-1 ring-inset ring-[#F2EAE0] transition-colors duration-300 group-hover:ring-[#9B1C1C]/25 lg:h-[52px] lg:w-[52px]">
            <IconComponent className="h-[21px] w-[21px] transition-transform duration-300 ease-out group-hover:scale-105 lg:h-6 lg:w-6" />
          </span>
        </div>

        {/* Subtle Vertical Connector Stem + Small Solid Burgundy Node (Desktop/Tablet) */}
        <div
          aria-hidden="true"
          className="hidden flex-col items-center md:flex"
        >
          <span
            className={cn(
              "h-2 w-px transition-colors duration-300",
              hasCrestStem
                ? "bg-[#9B1C1C]/35 group-hover:bg-[#9B1C1C]/70"
                : "md:max-lg:bg-[#9B1C1C]/35 lg:bg-transparent"
            )}
          />
          <span className="h-[7px] w-[7px] rounded-full bg-[#9B1C1C] ring-2 ring-[#FAF6F0] transition-transform duration-300 ease-out group-hover:scale-125" />
        </div>
      </div>

      {/* Milestone Text Block + Thin Vertical Hairline Separator Between Descriptions */}
      <div
        className={cn(
          "relative min-w-0 flex-1 pt-0.5 md:mt-3.5 md:w-full md:px-3 md:pt-0 lg:px-3 xl:px-2.5",
          index % 3 !== 2 &&
            !isLast &&
            "md:max-lg:after:pointer-events-none md:max-lg:after:absolute md:max-lg:after:top-1 md:max-lg:after:right-0 md:max-lg:after:bottom-1 md:max-lg:after:w-px md:max-lg:after:bg-[#E3D7C8]",
          !isLast &&
            "lg:after:pointer-events-none lg:after:absolute lg:after:top-1 lg:after:right-0 lg:after:bottom-1 lg:after:w-px lg:after:bg-[#E3D7C8]"
        )}
      >
        <div className="flex items-center gap-2 md:justify-center">
          {/* Mobile Small Burgundy Node */}
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#9B1C1C] md:hidden"
          />
          <span className="text-[10px] font-bold tracking-[0.18em] text-[#9B1C1C] uppercase">
            Pillar {pillar.code}
          </span>
        </div>

        <h3 className="mt-1.5 font-serif text-[18px] font-medium leading-[1.16] tracking-[-0.01em] text-[#1A1A1A] transition-colors duration-300 group-hover:text-[#9B1C1C] lg:text-[18.5px]">
          <span className="md:block">{pillar.titleLines[0]}</span>{" "}
          <span className="md:block">{pillar.titleLines[1]}</span>
        </h3>

        {/* Small Burgundy Accent Divider */}
        <span
          aria-hidden="true"
          className="mt-2.5 mb-2.5 block h-[1.5px] w-5.5 bg-[#9B1C1C]/75 transition-all duration-300 group-hover:w-7 group-hover:bg-[#9B1C1C] md:mx-auto"
        />

        <p className="max-w-[38ch] text-[13px] leading-[1.55] text-[#574E47] md:mx-auto md:max-w-[22ch] md:text-[12px] md:leading-[1.52]">
          {pillar.description}
        </p>
      </div>
    </motion.li>
  );
}

function FlowingTimeline({
  pillars,
  revealVisible,
}: {
  pillars: ReadonlyArray<EvolutionPillar>;
  revealVisible: boolean;
}) {
  return (
    <div className="relative min-w-0">
      <TimelineConnector revealVisible={revealVisible} />

      <ol className="relative z-10 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-3 md:gap-y-7 lg:grid-cols-5 lg:gap-0">
        {pillars.map((pillar, idx) => (
          <TimelineMilestone
            key={pillar.id}
            pillar={pillar}
            index={idx}
            totalCount={pillars.length}
            revealVisible={revealVisible}
          />
        ))}
      </ol>
    </div>
  );
}

export function CreativeEvolutionSection() {
  const prefersReducedMotion = useReducedMotion();
  const { creativeEvolution } = ABOUT_PAGE_CONTENT;
  const sectionRef = useRef<HTMLElement | null>(null);
  // Default visible for SSR & reduced-motion safety; scroll-triggered reveal on client
  const [isRevealed, setIsRevealed] = useState<boolean>(true);

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
      { threshold: 0.08, rootMargin: "0px 0px -20px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const revealVisible = Boolean(prefersReducedMotion || isRevealed);

  return (
    <section
      ref={sectionRef}
      id="our-journey"
      aria-labelledby="creative-evolution-heading"
      className="relative isolate scroll-mt-20 overflow-hidden border-b border-[#E3D7C8] bg-[#FAF6F0] py-10 text-[#1A1A1A] sm:py-11 lg:py-12 xl:py-11"
    >
      <EvolutionEnvironment />

      <Container className="lg:px-6 xl:px-10">
        <div className="grid grid-cols-1 items-center gap-7 md:gap-8 xl:grid-cols-[minmax(0,0.14fr)_minmax(0,0.22fr)_minmax(0,0.64fr)] xl:gap-6">
          {/* Mobile (< 768px): 1. Eyebrow + 2. Heading + 3. Description -> 4. Compact Alcove
              Tablet (768px–1279px): Alcove + Heading side-by-side above full-width Timeline
              Desktop (1280px+): [Alcove 14% | Heading 22% | Flowing 5-Pillar Timeline 64%] */}
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-7 xl:contents">
            <div className="order-2 md:order-1 xl:order-none">
              <ArchitecturalAlcove
                imageUrl={creativeEvolution.alcoveImageUrl}
                revealVisible={revealVisible}
              />
            </div>

            <div className="order-1 md:order-2 xl:order-none">
              <EditorialIntroduction
                eyebrow={creativeEvolution.eyebrow}
                supportingText={creativeEvolution.supportingText}
                revealVisible={revealVisible}
              />
            </div>
          </div>

          <FlowingTimeline
            pillars={EVOLUTION_PILLARS}
            revealVisible={revealVisible}
          />
        </div>
      </Container>
    </section>
  );
}
