"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  MapPin,
  Monitor,
  type LucideIcon,
} from "lucide-react";
import { ATELIER_BRAND } from "@/lib/brand";
import { DEFAULT_HOMEPAGE_CONTENT } from "@/lib/homepage-content";

const ARCHITECTURAL_EASE: [number, number, number, number] = [
  0.22, 1, 0.36, 1,
];

interface WhyAtelierCardItem {
  numeral: string;
  title: string;
  microHeading: string;
  description: string;
  href: string;
  Icon: LucideIcon;
}

const WHY_ATELIER_CARDS: WhyAtelierCardItem[] = [
  {
    numeral: "I.",
    title: "Creative Wall Applications",
    microHeading:
      "DIRECT VERTICAL PRINTING TAILORED TO REAL ARCHITECTURAL SPACES.",
    description:
      "From double-height residential living walls to refined corporate reception elevations, every print is composed around spatial geometry rather than generic stock templates.",
    href: "/projects",
    Icon: Layers,
  },
  {
    numeral: "II.",
    title: "Design-Led Visual Expression",
    microHeading:
      "ART, TEXTURE, AND DETAIL CURATED WITH EDITORIAL RESTRAINT.",
    description:
      "Our unified 13-category catalogue and custom design service prioritize visual harmony with your interior architecture, furnishings, and lighting.",
    href: "/explore-designs",
    Icon: ImageIcon,
  },
  {
    numeral: "III.",
    title: "Multiple Supported Printing Surfaces",
    microHeading:
      "WALLS, TILES, PLYWOOD, OFFICE BLINDS, METALS, AND GLASS.",
    description:
      "Extend visual continuity beyond plastered walls onto ceramic tiles, bespoke timber millwork, roller blinds, brushed metal panels, and glass partitions.",
    href: "/services",
    Icon: LayoutGrid,
  },
  {
    numeral: "IV.",
    title: "Customized Design Exploration",
    microHeading:
      "INTERACTIVE WALL PREVIEW BEFORE YOU COMMIT TO PRINTING.",
    description:
      "Bridge directly from our design catalogue into the interactive Wall Visualizer to inspect perspective-accurate murals and repeating patterns on your own wall.",
    href: "/visualizer",
    Icon: Monitor,
  },
];

/**
 * SECTION 09 — WHY ATELIER
 * Luxury Architectural Editorial Showcase (43% Left Editorial + Mural + Floating Studio Card / 57% Right 2x2 Feature Grid)
 */
export function WhyAtelierSection() {
  const prefersReducedMotion = useReducedMotion();
  const { whyAtelierSection } = DEFAULT_HOMEPAGE_CONTENT;

  return (
    <section
      id="why-atelier"
      aria-labelledby="why-atelier-heading"
      className="relative scroll-mt-24 overflow-hidden border-b border-[#E8DDD1] bg-[#FAF9F6] py-14 sm:py-16 lg:py-20"
    >
      {/* Subtle warm radial atmosphere + architectural concentric line motif in top-right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(243,236,228,0.85),transparent_52%),radial-gradient(circle_at_88%_82%,rgba(232,226,217,0.55),transparent_50%)]"
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 420 420"
        fill="none"
        className="pointer-events-none absolute -right-24 -top-24 hidden h-[380px] w-[380px] text-[#E4D8CA]/65 lg:block"
      >
        <circle cx="320" cy="100" r="140" stroke="currentColor" strokeWidth="1" />
        <circle cx="320" cy="100" r="185" stroke="currentColor" strokeWidth="1" />
        <circle cx="320" cy="100" r="230" stroke="currentColor" strokeWidth="1" />
        <circle cx="320" cy="100" r="275" stroke="currentColor" strokeWidth="1" />
      </svg>

      <div className="relative mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-stretch gap-9 lg:grid-cols-[minmax(0,43fr)_minmax(0,57fr)] lg:gap-9 xl:gap-12">
          {/* =================================================================
              LEFT COLUMN (43% Desktop) — Editorial Header + Mural + Floating Card
          ================================================================= */}
          <div className="flex flex-col justify-between">
            {/* Editorial Eyebrow, Heading & Supporting Copy */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: ARCHITECTURAL_EASE }}
            >
              <div className="inline-flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-[1.5px] w-6 bg-[#9B1C1C]"
                />
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9B1C1C]">
                  {whyAtelierSection.sectionLabel}
                </span>
              </div>

              <h2
                id="why-atelier-heading"
                className="mt-3 font-serif text-[30px] font-normal leading-[1.12] tracking-[-0.015em] text-[#1A1A1A] sm:text-[36px] lg:text-[38px] xl:text-[43px]"
              >
                An Architectural Approach{" "}
                <span className="lg:block">
                  to Surface Art &amp; Wall Printing
                </span>
              </h2>

              <p className="mt-3.5 max-w-[495px] text-[14.5px] leading-[1.6] text-[#77716C] sm:text-[15.5px]">
                {whyAtelierSection.supportingText}
              </p>
            </motion.div>

            {/* Architectural Mural Image + Floating Mumbai Studio Location Card */}
            <div className="relative mt-6 sm:mt-7 sm:pb-7 lg:mt-7 lg:pb-6">
              <motion.div
                initial={
                  prefersReducedMotion
                    ? false
                    : { opacity: 0, y: 20, scale: 0.985 }
                }
                whileInView={
                  prefersReducedMotion
                    ? undefined
                    : { opacity: 1, y: 0, scale: 1 }
                }
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.7,
                  delay: 0.06,
                  ease: ARCHITECTURAL_EASE,
                }}
                className="group relative aspect-[16/10] w-full overflow-hidden rounded-[22px] border border-[#E8DDD1] bg-[#E8E2D9] shadow-[0_18px_40px_-16px_rgba(26,22,19,0.14)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/atelier/artwork-terracotta-wave.jpg"
                  alt="ATELIER — WALL STORY sculpted terracotta wave mural in a sunlit beige architectural living space"
                  className="h-full w-full object-cover object-[50%_36%] transition-transform duration-700 ease-out group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
                {/* Soft bottom vignette to anchor the floating studio card */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#1A1A1A]/20 via-transparent to-transparent"
                />
              </motion.div>

              {/* Floating Cream Contact Panel */}
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                whileInView={
                  prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
                }
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.62,
                  delay: 0.16,
                  ease: ARCHITECTURAL_EASE,
                }}
                className="relative z-10 mx-2.5 -mt-6 rounded-[18px] border border-[#E8DDD1] bg-[#FFFCF9]/96 p-4 shadow-[0_18px_42px_-12px_rgba(26,22,19,0.14)] backdrop-blur-md sm:absolute sm:inset-x-3.5 sm:bottom-0 sm:mx-0 sm:mt-0 sm:px-5 sm:py-4 lg:inset-x-4"
              >
                <div className="grid grid-cols-1 items-center gap-3.5 sm:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] sm:gap-4">
                  {/* Studio Location Details */}
                  <div>
                    <div className="flex items-center gap-1.5 text-[#9B1C1C]">
                      <MapPin
                        className="h-3.5 w-3.5 shrink-0 text-[#9B1C1C]"
                        strokeWidth={2}
                      />
                      <span className="text-[10.5px] font-bold uppercase tracking-[0.13em] text-[#9B1C1C]">
                        Mumbai Studio Location
                      </span>
                    </div>
                    <p className="mt-1.5 text-[12px] font-medium leading-[1.48] text-[#1A1A1A] sm:text-[12.5px]">
                      {ATELIER_BRAND.address.full}
                    </p>
                  </div>

                  {/* Dual Studio CTA Buttons */}
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/about"
                      className="inline-flex w-full items-center justify-center rounded-[8px] border border-[#DDD1C3] bg-[#FFFCF9] px-3.5 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1A1A1A] transition-all duration-200 hover:border-[#9B1C1C]/55 hover:bg-[#F3ECE4] hover:text-[#9B1C1C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
                    >
                      <span>Read Our Studio Story</span>
                    </Link>
                    <Link
                      href="/contact"
                      className="group/btn inline-flex w-full items-center justify-center gap-1.5 rounded-[8px] bg-[#9B1C1C] px-3.5 py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[#FAF9F6] shadow-[0_6px_16px_-4px_rgba(155,28,28,0.38)] transition-all duration-200 hover:bg-[#821616] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
                    >
                      <span>Schedule a Consultation</span>
                      <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* =================================================================
              RIGHT COLUMN (57% Desktop) — 2x2 Feature Cards Grid
          ================================================================= */}
          <motion.div
            initial={prefersReducedMotion ? false : "hidden"}
            whileInView={prefersReducedMotion ? undefined : "visible"}
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.08,
                },
              },
            }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-[22px]"
          >
            {WHY_ATELIER_CARDS.map((card) => {
              const IconComponent = card.Icon;
              return (
                <motion.div
                  key={card.numeral}
                  variants={{
                    hidden: { opacity: 0, y: 18 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.58,
                        ease: ARCHITECTURAL_EASE,
                      },
                    },
                  }}
                  className="h-full"
                >
                  <Link
                    href={card.href}
                    className="group flex h-full flex-col justify-between rounded-[22px] border border-[#E8DDD1] bg-[#FFFCF9] p-[26px] shadow-[0_10px_28px_-16px_rgba(26,22,19,0.06)] transition-all duration-300 ease-out hover:-translate-y-[5px] hover:border-[#9B1C1C]/45 hover:shadow-[0_20px_42px_-18px_rgba(155,28,28,0.14)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-[28px] xl:p-[30px]"
                  >
                    <div>
                      {/* Top Row: Circular Warm Beige Icon + Crimson Roman Numeral */}
                      <div className="flex items-center gap-3.5">
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E8DDD1]/85 bg-[#F3ECE4] text-[#9B1C1C] transition-transform duration-300 ease-out group-hover:scale-105 group-hover:-rotate-3 motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-hover:rotate-0">
                          <IconComponent className="h-5 w-5" strokeWidth={1.65} />
                        </span>
                        <span className="font-serif text-[20px] font-medium tracking-[0.04em] text-[#9B1C1C]">
                          {card.numeral}
                        </span>
                      </div>

                      {/* Serif Card Heading */}
                      <h3 className="mt-4 font-serif text-[21.5px] font-medium leading-[1.22] text-[#1A1A1A] transition-colors duration-300 group-hover:text-[#9B1C1C] xl:text-[23px]">
                        {card.title}
                      </h3>

                      {/* Crimson Uppercase Micro-Heading */}
                      <p className="mt-2.5 text-[10.5px] font-bold uppercase leading-[1.48] tracking-[0.11em] text-[#9B1C1C]">
                        {card.microHeading}
                      </p>

                      {/* Concise Descriptive Paragraph */}
                      <p className="mt-3.5 text-[13.5px] leading-[1.62] text-[#665F59] sm:text-[14px]">
                        {card.description}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

