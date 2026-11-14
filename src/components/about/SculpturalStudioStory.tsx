"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { ABOUT_PAGE_CONTENT } from "@/lib/blogs-catalogue";
import { PhilosophySection } from "@/components/about/PhilosophySection";
import { cn } from "@/lib/cn";

const EDITORIAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type PhilosophyIconType = "petal" | "layers" | "cube" | "infinity";

function PhilosophyLineIcon({
  type,
  className,
}: {
  type: PhilosophyIconType;
  className?: string;
}) {
  switch (type) {
    case "petal":
      return (
        <svg
          viewBox="0 0 28 28"
          fill="none"
          aria-hidden="true"
          className={cn("h-6 w-6 text-[#9B1C1C]", className)}
        >
          <path
            d="M14 4.25C10.1 8.2 8.6 12.9 14 20.2C19.4 12.9 17.9 8.2 14 4.25Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 20.2C8.6 18.6 5.5 14.7 6.2 10.1C10.1 10.9 12.4 14 14 20.2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 20.2C19.4 18.6 22.5 14.7 21.8 10.1C17.9 10.9 15.6 14 14 20.2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 20.2V24"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "layers":
      return (
        <svg
          viewBox="0 0 28 28"
          fill="none"
          aria-hidden="true"
          className={cn("h-6 w-6 text-[#9B1C1C]", className)}
        >
          <path
            d="M14 5.25L23.5 10.25L14 15.25L4.5 10.25L14 5.25Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M4.5 14.4L14 19.4L23.5 14.4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.5 18.55L14 23.55L23.5 18.55"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "cube":
      return (
        <svg
          viewBox="0 0 28 28"
          fill="none"
          aria-hidden="true"
          className={cn("h-6 w-6 text-[#9B1C1C]", className)}
        >
          <path
            d="M14 4.5L22.6 9.35V19.05L14 23.9L5.4 19.05V9.35L14 4.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M5.4 9.35L14 14.2L22.6 9.35"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M14 14.2V23.9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "infinity":
      return (
        <svg
          viewBox="0 0 28 28"
          fill="none"
          aria-hidden="true"
          className={cn("h-6 w-6 text-[#9B1C1C]", className)}
        >
          <path
            d="M14 14C11.8 11.05 9.7 9.75 7.6 9.75C5.25 9.75 3.5 11.6 3.5 14C3.5 16.4 5.25 18.25 7.6 18.25C9.7 18.25 11.8 16.95 14 14ZM14 14C16.2 16.95 18.3 18.25 20.4 18.25C22.75 18.25 24.5 16.4 24.5 14C24.5 11.6 22.75 9.75 20.4 9.75C18.3 9.75 16.2 11.05 14 14Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

/**
 * Subtle section-clipped decorative architectural linework, plaster halo,
 * and warm morning sunlight gradients behind the three-part editorial spread.
 */
function DecorativeBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Warm Cream-to-Ivory Architectural Base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #FAF6F0 0%, #F9F3EB 54%, #F6EFE5 100%)",
        }}
      />

      {/* Soft Morning Sunlight Halo on Upper Left */}
      <div
        className="absolute -top-20 -left-20 h-[440px] w-[520px] rounded-full opacity-75"
        style={{
          background:
            "radial-gradient(circle, rgba(255,253,249,0.92) 0%, rgba(250,246,240,0) 72%)",
        }}
      />

      {/* Subtle Curved Plaster Relief Shadow Glow Near Right Edge */}
      <div
        className="absolute top-10 -right-24 hidden h-[420px] w-[420px] rounded-full opacity-45 lg:block"
        style={{
          background:
            "radial-gradient(circle, rgba(232,226,217,0.68) 0%, rgba(250,246,240,0) 70%)",
        }}
      />

      {/* Fine Architectural Compass Arcs (Upper-Right & Lower-Right, Matching Reference) */}
      <svg
        viewBox="0 0 1440 860"
        fill="none"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full opacity-55"
      >
        <path
          d="M1115 215C1195 92 1335 34 1490 58"
          stroke="#DFD0C0"
          strokeWidth="1.15"
        />
        <path
          d="M1168 242C1238 136 1356 88 1495 108"
          stroke="#E5D8C9"
          strokeWidth="1"
        />
        <path
          d="M1265 860C1322 770 1392 714 1480 688"
          stroke="#DFD0C0"
          strokeWidth="1.15"
        />
        <path
          d="M-40 690C45 660 128 666 205 708"
          stroke="#E6DACB"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

/**
 * LEFT COLUMN (~31.5% on Desktop): Tall Sculptural Plaster & Botanical Arch Installation
 */
function ArchitecturalArchVisual({
  imageUrl,
  prefersReducedMotion,
  revealVisible,
}: {
  imageUrl: string;
  prefersReducedMotion: boolean | null;
  revealVisible: boolean;
}) {
  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
      animate={revealVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      transition={{ duration: 0.64, ease: EDITORIAL_EASE }}
      className="order-2 md:order-2 md:col-span-1 xl:order-1 xl:col-span-1"
    >
      <div className="relative mx-auto w-full max-w-[400px] xl:mx-0 xl:max-w-[430px]">
        {/* Soft Grounding Floor Shadow Under Travertine Base */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-6 -bottom-3 left-6 h-8 rounded-full bg-[#3A281A]/12 blur-xl"
        />

        <div className="group relative overflow-hidden rounded-t-[36px] rounded-b-[24px] bg-[#EFE6DA] shadow-[0_24px_54px_-22px_rgba(36,24,14,0.18)] ring-1 ring-[#DFD0C0]/85 sm:rounded-t-[44px] sm:rounded-b-[26px]">
          <div className="relative aspect-[896/1140] w-full xl:h-[clamp(440px,50vw,505px)] xl:aspect-auto">
            <Image
              src={imageUrl}
              alt="Sculptural warm ivory lime-plaster architectural arch alcove with concealed warm LED cove lighting, sage and terracotta botanical wall mural, vertical fluted timber reveal, cantilevered travertine plinth, and terracotta ceramic vase holding dried berry branches"
              fill
              sizes="(min-width: 1280px) 430px, (min-width: 768px) 45vw, 92vw"
              quality={92}
              className="object-cover object-[50%_56%] transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />

            {/* Gentle Sunlit Ivory Edge Harmony Veil */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(250,246,240,0.16) 0%, rgba(250,246,240,0) 22%, rgba(250,246,240,0) 86%, rgba(250,246,240,0.18) 100%)",
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * CENTER COLUMN (~37.5% on Desktop): Editorial Studio Story Copy & Functional CTAs
 */
function StudioStoryContent({
  eyebrow,
  headlineLine1,
  headlineLine2,
  paragraph1,
  paragraph2,
  primaryCtaLabel,
  primaryCtaHref,
  prefersReducedMotion,
  revealVisible,
}: {
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  paragraph1: string;
  paragraph2: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  prefersReducedMotion: boolean | null;
  revealVisible: boolean;
}) {
  return (
    <div className="order-1 md:order-1 md:col-span-2 xl:order-2 xl:col-span-1 xl:px-2">
      <div className="max-w-[620px] xl:max-w-none">
        {/* Eyebrow */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={revealVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.48, delay: 0.04, ease: EDITORIAL_EASE }}
          className="inline-flex items-center gap-3"
        >
          <span
            aria-hidden="true"
            className="h-[1.5px] w-7 shrink-0 bg-[#9B1C1C]"
          />
          <span className="text-[11px] font-bold tracking-[0.22em] text-[#9B1C1C] uppercase">
            {eyebrow}
          </span>
        </motion.div>

        {/* Main Editorial Serif Heading */}
        <motion.h2
          id="studio-story-heading"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={revealVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.56, delay: 0.09, ease: EDITORIAL_EASE }}
          className="mt-2.5 font-serif text-[clamp(2.25rem,3.4vw,3.35rem)] font-normal leading-[1.06] tracking-[-0.022em] text-[#1A1A1A]"
        >
          <span className="block sm:whitespace-nowrap">{headlineLine1}</span>{" "}
          <span className="mt-0.5 block sm:whitespace-nowrap">
            <em className="font-serif italic font-normal text-[#9B1C1C]">
              {headlineLine2}
            </em>
          </span>
        </motion.h2>

        {/* Description 1 */}
        <motion.p
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={revealVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: 0.54, delay: 0.15, ease: EDITORIAL_EASE }}
          className="mt-4 max-w-[48ch] text-[14.5px] leading-[1.66] text-[#3D3630] sm:text-[15px] xl:text-[14.5px]"
        >
          {paragraph1}
        </motion.p>

        {/* Description 2 */}
        <motion.p
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={revealVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: 0.54, delay: 0.2, ease: EDITORIAL_EASE }}
          className="mt-3.5 max-w-[50ch] text-[14px] leading-[1.68] text-[#665D56] sm:text-[14.5px] xl:text-[14px]"
        >
          {paragraph2}
        </motion.p>

        {/* Functional CTAs */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={revealVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: 0.54, delay: 0.25, ease: EDITORIAL_EASE }}
          className="mt-6 flex flex-wrap items-center gap-3 sm:mt-7 sm:gap-3.5"
        >
          <Link
            href={primaryCtaHref}
            className="group inline-flex min-h-[46px] items-center justify-center gap-2.5 rounded-full bg-[#9B1C1C] px-6 py-3 text-[13px] font-semibold tracking-[0.01em] text-[#FFFDF9] shadow-[0_12px_26px_-8px_rgba(155,28,28,0.42)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#7F1616] hover:shadow-[0_16px_30px_-8px_rgba(155,28,28,0.5)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9B1C1C] max-[359px]:w-full"
          >
            <span>{primaryCtaLabel}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/process"
            className="group inline-flex min-h-[46px] items-center justify-center gap-2.5 rounded-full border border-[#DFD0C0] bg-[#FFFDF9] px-5.5 py-3 text-[13px] font-semibold tracking-[0.01em] text-[#1A1A1A] shadow-[0_6px_18px_-8px_rgba(26,20,14,0.1)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#9B1C1C]/55 hover:text-[#9B1C1C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9B1C1C] max-[359px]:w-full"
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
            <span>Explore Our Process</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * RIGHT COLUMN (~31% on Desktop): Framed Studio Concept Notebook Card
 */
function ConceptNotebookCard({
  imageUrl,
  prefersReducedMotion,
  revealVisible,
}: {
  imageUrl: string;
  prefersReducedMotion: boolean | null;
  revealVisible: boolean;
}) {
  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={revealVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.62, delay: 0.16, ease: EDITORIAL_EASE }}
      className="order-3 md:order-3 md:col-span-1 xl:order-3 xl:col-span-1 xl:translate-y-2"
    >
      <div className="mx-auto w-full max-w-[430px] xl:mx-0 xl:max-w-none">
        <div className="group rounded-[26px] border border-[#DFD0C0] bg-[#FFFDF9] p-3 shadow-[0_20px_48px_-20px_rgba(34,24,16,0.14)] transition-all duration-400 ease-out hover:shadow-[0_26px_56px_-18px_rgba(34,24,16,0.2)] sm:rounded-[28px] sm:p-3.5">
          <div className="relative aspect-[4/3.35] w-full overflow-hidden rounded-[19px] bg-[#EAE0D3] sm:rounded-[20px]">
            <Image
              src={imageUrl}
              alt="Open architectural studio concept notebook on a sunlit travertine table displaying a fine-line lotus botanical sketch on the left page and warm terracotta watercolor swatches on the right page beside a brass pen"
              fill
              sizes="(min-width: 1280px) 410px, (min-width: 768px) 45vw, 92vw"
              quality={92}
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.025]"
            />
          </div>

          {/* Caption Row */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1.5 pb-0.5 text-[11px] sm:px-2 sm:text-[11.5px] xl:text-[12px]">
            <span className="font-bold tracking-[-0.01em] text-[#1A1A1A]">
              Studio Concept Notebook
            </span>
            <span
              aria-hidden="true"
              className="hidden h-3 w-px shrink-0 bg-[#E3D6C7] xl:inline-block"
            />
            <span className="font-semibold text-[#9B1C1C]">
              Line, Tone &amp; Surface Relief
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * BOTTOM UNIFIED PHILOSOPHY STRIP: Concise four-item architectural strip
 * linking smoothly to the full "Our Philosophy" principles section below.
 */
function PhilosophyStrip({
  items,
  prefersReducedMotion,
  revealVisible,
  onSelectPrinciple,
}: {
  items: ReadonlyArray<{
    code: string;
    icon: PhilosophyIconType;
    title: string;
  }>;
  prefersReducedMotion: boolean | null;
  revealVisible: boolean;
  onSelectPrinciple: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
      animate={revealVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.6, delay: 0.28, ease: EDITORIAL_EASE }}
      aria-label="Studio philosophy highlights"
      className="mt-9 rounded-[26px] border border-[#DFD0C0] bg-[#FFFDF9]/94 px-4 py-4 shadow-[0_18px_42px_-22px_rgba(38,26,16,0.12)] backdrop-blur-xs sm:mt-10 sm:rounded-[30px] sm:px-6 sm:py-4.5 lg:mt-11 lg:rounded-full lg:px-8 lg:py-4.5"
    >
      <div className="grid grid-cols-1 gap-3.5 min-[360px]:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-[#E6DACB]">
        {items.map((item, idx) => (
          <a
            key={item.code}
            href="#our-philosophy"
            onClick={onSelectPrinciple}
            className={cn(
              "group flex items-center gap-3 py-1 transition-colors focus-visible:rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9B1C1C] sm:gap-3.5 lg:py-0.5",
              idx === 0
                ? "lg:pr-5 xl:pr-7"
                : idx === items.length - 1
                  ? "lg:pl-5 xl:pl-7"
                  : "lg:px-5 xl:px-7"
            )}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] border border-[#EAE0D3] bg-[#FAF6F0] transition-colors duration-300 group-hover:border-[#9B1C1C]/40 group-hover:bg-[#F7EFE6] sm:h-11 sm:w-11">
              <PhilosophyLineIcon
                type={item.icon}
                className="h-5 w-5 transition-transform duration-300 group-hover:scale-105 sm:h-[22px] sm:w-[22px]"
              />
            </span>
            <div className="min-w-0">
              <span className="block font-mono text-[9.5px] font-semibold tracking-[0.16em] text-[#9B1C1C] uppercase">
                 Principle {item.code}
              </span>
              <span className="mt-0.5 block font-serif text-[16.5px] font-semibold leading-[1.2] text-[#1A1A1A] transition-colors duration-300 group-hover:text-[#9B1C1C] sm:text-[18px] lg:text-[17px] xl:text-[19px]">
                {item.title}
              </span>
            </div>
          </a>
        ))}
      </div>
    </motion.div>
  );
}

export function StudioStorySection() {
  const prefersReducedMotion = useReducedMotion();
  const { studioStory, philosophy } = ABOUT_PAGE_CONTENT;
  const sectionRef = useRef<HTMLElement | null>(null);
  // Default visible so SSR and fast mobile scroll jumps never leave content hidden
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
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const handleScrollToPhilosophy = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const target = document.getElementById("our-philosophy");
      if (!target) return;
      e.preventDefault();
      const rm =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({
        behavior: rm ? "auto" : "smooth",
        block: "start",
      });
    },
    []
  );

  const revealVisible = Boolean(prefersReducedMotion || isRevealed);

  return (
    <section
      ref={sectionRef}
      id="studio-story"
      aria-labelledby="studio-story-heading"
      className="relative isolate overflow-hidden border-b border-[#E5DACB] bg-[#FAF6F0] py-12 text-[#1A1A1A] sm:py-14 lg:py-16 xl:py-18"
    >
      <DecorativeBackground />

      <Container className="lg:px-6 xl:px-10">
        {/* Main Three-Part Architectural Editorial Composition */}
        <div className="grid grid-cols-1 items-center gap-7 sm:gap-8 md:grid-cols-2 xl:grid-cols-[minmax(0,0.315fr)_minmax(0,0.375fr)_minmax(0,0.31fr)] xl:gap-10">
          <ArchitecturalArchVisual
            imageUrl={studioStory.archVisualUrl}
            prefersReducedMotion={prefersReducedMotion}
            revealVisible={revealVisible}
          />

          <StudioStoryContent
            eyebrow={studioStory.eyebrow}
            headlineLine1={studioStory.headlineLine1}
            headlineLine2={studioStory.headlineLine2}
            paragraph1={studioStory.paragraph1}
            paragraph2={studioStory.paragraph2}
            primaryCtaLabel={studioStory.ctaLabel}
            primaryCtaHref={studioStory.ctaHref}
            prefersReducedMotion={prefersReducedMotion}
            revealVisible={revealVisible}
          />

          <ConceptNotebookCard
            imageUrl={studioStory.sketchbookVisualUrl}
            prefersReducedMotion={prefersReducedMotion}
            revealVisible={revealVisible}
          />
        </div>

        {/* Bottom Unified Four-Item Philosophy Strip */}
        <PhilosophyStrip
          items={philosophy.themes}
          prefersReducedMotion={prefersReducedMotion}
          revealVisible={revealVisible}
          onSelectPrinciple={handleScrollToPhilosophy}
        />
      </Container>
    </section>
  );
}

/**
 * Exports both the Studio Story section and the redesigned
 * "Our Philosophy — The Principles That Guide Us." section right below it.
 */
export function SculpturalStudioStory() {
  return (
    <>
      <StudioStorySection />
      <PhilosophySection />
    </>
  );
}
