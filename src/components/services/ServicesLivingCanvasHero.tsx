"use client";

import React, { useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  ChevronDown,
  Compass,
  Gem,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/layout/Container";

interface SpectrumItem {
  code: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
}

const SERVICE_SPECTRUM_ITEMS: ReadonlyArray<SpectrumItem> = [
  {
    code: "01",
    title: "6 Surfaces",
    subtitle: "Walls to Glass",
    icon: Layers,
  },
  {
    code: "02",
    title: "Concept to Installation",
    subtitle: "End-to-End Flow",
    icon: Compass,
  },
  {
    code: "03",
    title: "Homes to Commercial",
    subtitle: "All Interior Scales",
    icon: Building2,
  },
  {
    code: "04",
    title: "Studio Support",
    subtitle: "Mumbai Atelier",
    icon: Gem,
  },
];

const EDITORIAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function PlayTriangleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M3.25 2.15a.55.55 0 0 1 .85-.46l5.45 3.85a.55.55 0 0 1 0 .92L4.1 10.31a.55.55 0 0 1-.85-.46V2.15Z" />
    </svg>
  );
}

/**
 * SECTION 01 — THE LIVING CANVAS (SERVICES PAGE HERO)
 * Magazine-grade asymmetrical architectural hero pairing warm sunlit cream
 * editorial typography on the left (~43%) with a bespoke 3D botanical mural
 * luxury living room on the right, anchored by a floating Service Spectrum bar.
 */
export function ServicesLivingCanvasHero() {
  const prefersReducedMotion = useReducedMotion();

  const scrollToSection = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
      const el = document.getElementById(targetId);
      if (!el) return;
      e.preventDefault();
      const rm =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({
        behavior: rm ? "auto" : "smooth",
        block: "start",
      });
      if (typeof window !== "undefined" && window.history?.replaceState) {
        window.history.replaceState(null, "", `#${targetId}`);
      }
    },
    []
  );

  return (
    <section
      id="services-hero"
      aria-labelledby="services-hero-heading"
      className="relative isolate flex w-full flex-col justify-between overflow-hidden border-b border-[#E3D8CA] bg-[#F8F2EA] text-[#1A1A1A] lg:min-h-[clamp(690px,calc(100svh-var(--navbar-height,74px)),920px)]"
    >
      {/* =====================================================================
          DESKTOP BACKGROUND ARCHITECTURE (>= 1024px)
          Left sunlit Venetian plaster + Right edge-to-edge luxury botanical room
      ===================================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden lg:block"
      >
        {/* Left Zone: Subtle Warm Cream Sunlit Plaster Texture (Alpha-Feathered to Zero Seam) */}
        <div
          className="absolute inset-y-0 left-0 w-[44%] overflow-hidden"
          style={{
            WebkitMaskImage:
              "linear-gradient(90deg, #000 0%, rgba(0,0,0,0.76) 46%, transparent 96%)",
            maskImage:
              "linear-gradient(90deg, #000 0%, rgba(0,0,0,0.76) 46%, transparent 96%)",
          }}
        >
          <Image
            src="/images/atelier/services-plaster-sunlight.jpg"
            alt=""
            fill
            sizes="44vw"
            quality={75}
            className="object-cover object-left-top opacity-48"
          />
        </div>

        {/* Right Zone: Edge-to-Edge Botanical Mural & Living Room Masterpiece */}
        <motion.div
          initial={
            prefersReducedMotion ? false : { opacity: 0, x: 18, scale: 1.04 }
          }
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.95, ease: EDITORIAL_EASE }}
          className="absolute inset-y-0 right-0 w-[62%] xl:w-[61.5%]"
          style={{
            WebkitMaskImage:
              "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.24) 7%, rgba(0,0,0,0.78) 17%, #000 28%)",
            maskImage:
              "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.24) 7%, rgba(0,0,0,0.78) 17%, #000 28%)",
          }}
        >
          <Image
            src="/images/atelier/services-living-canvas-hero.jpg"
            alt="Sunlit luxury contemporary living room featuring an oversized sculptural terracotta and blush iris botanical 3D wall mural above a curved cream bouclé sofa and travertine coffee table"
            fill
            priority
            quality={92}
            sizes="(min-width: 1280px) 62vw, 64vw"
            className="object-cover object-[54%_44%] xl:object-[50%_45%]"
          />

          {/* Gentle Lower Honed-Stone Warmth so Floating Spectrum & Scroll Cue Anchor Cleanly */}
          <div
            className="absolute inset-x-0 bottom-0 h-24"
            style={{
              background:
                "linear-gradient(180deg, rgba(248,242,234,0) 0%, rgba(236,227,215,0.46) 100%)",
            }}
          />
        </motion.div>
      </div>

      {/* Subtle Warm Ambient Wash for Mobile & Tablet (< 1024px) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 lg:hidden"
        style={{
          background:
            "radial-gradient(circle at 12% 8%, rgba(255,252,248,0.9) 0%, rgba(248,242,234,1) 58%, rgba(238,229,218,0.75) 100%)",
        }}
      />

      {/* =====================================================================
          MAIN EDITORIAL STAGE (LEFT 43% COPY + MOBILE FULL-WIDTH MASTERPIECE)
      ===================================================================== */}
      <div className="relative z-10 flex flex-1 items-center pt-7 pb-5 sm:pt-9 sm:pb-6 lg:pt-10 lg:pb-6 xl:pt-12">
        <Container>
          <div className="grid grid-cols-1 items-center gap-7 lg:grid-cols-12 lg:gap-8">
            {/* Left Editorial Column (~44% on Desktop) */}
            <div className="lg:col-span-6 lg:max-w-[580px] xl:max-w-[620px]">
              {/* 1. Eyebrow */}
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.02, ease: EDITORIAL_EASE }}
                className="inline-flex items-center gap-3"
              >
                <span
                  aria-hidden="true"
                  className="h-[1.5px] w-7 shrink-0 bg-[#9B1C1C] sm:w-8"
                />
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9B1C1C] sm:text-[11.5px]">
                  OUR SERVICES
                </span>
              </motion.div>

              {/* 2. Editorial Display Heading */}
              <motion.h1
                id="services-hero-heading"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.68,
                  delay: 0.08,
                  ease: EDITORIAL_EASE,
                }}
                className="mt-4 font-serif text-[2.35rem] font-normal leading-[1.05] tracking-[-0.02em] text-[#1A1A1A] min-[390px]:text-[2.58rem] sm:mt-5 sm:text-[3.05rem] md:text-[3.4rem] lg:text-[3.45rem] lg:leading-[1.04] xl:text-[4.05rem] 2xl:text-[4.4rem]"
              >
                <span className="block lg:whitespace-nowrap">
                  Turn Any Surface
                </span>
                <span className="mt-1 block lg:whitespace-nowrap">
                  into a{" "}
                  <em className="font-serif italic font-normal text-[#9B1C1C]">
                    Living Canvas.
                  </em>
                </span>
              </motion.h1>

              {/* 3. Restrained Editorial Description */}
              <motion.p
                initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.62,
                  delay: 0.16,
                  ease: EDITORIAL_EASE,
                }}
                className="mt-4 max-w-[44ch] text-[14.5px] leading-[1.65] text-[#5B544E] sm:mt-5 sm:text-[15.5px] lg:max-w-[38ch] xl:max-w-[44ch] xl:text-[16px]"
              >
                Design, print and install expressive wall art directly on
                architectural surfaces — with precision, scale and studio-level
                craftsmanship.
              </motion.p>

              {/* 4. Primary & Secondary Action Buttons */}
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.24,
                  ease: EDITORIAL_EASE,
                }}
                className="mt-6 flex flex-col gap-3 min-[480px]:flex-row min-[480px]:flex-wrap min-[480px]:items-center sm:mt-7 sm:gap-3.5 lg:flex-nowrap"
              >
                <Link
                  href="/contact"
                  className="group inline-flex min-h-[48px] w-full shrink-0 items-center justify-center gap-2.5 whitespace-nowrap rounded-xl bg-[#9B1C1C] px-5 py-3 text-[13px] font-medium tracking-[0.01em] text-[#FAF9F6] shadow-[0_12px_28px_-8px_rgba(155,28,28,0.42)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#7D1515] hover:shadow-[0_16px_32px_-8px_rgba(125,21,21,0.48)] min-[480px]:w-auto xl:px-6 xl:text-[13.5px]"
                >
                  <span>Get a Custom Consultation</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
                </Link>

                <a
                  href="#featured-case-studies"
                  onClick={(e) => scrollToSection(e, "featured-case-studies")}
                  className="group inline-flex min-h-[48px] w-full shrink-0 items-center justify-center gap-2.5 whitespace-nowrap rounded-xl border border-[#DFD5C8] bg-[#FAF9F6]/95 px-4.5 py-3 text-[13px] font-medium tracking-[0.01em] text-[#1A1A1A] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#9B1C1C]/50 hover:bg-[#FFFDFB] min-[480px]:w-auto xl:px-5 xl:text-[13.5px]"
                >
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#9B1C1C]/80 text-[#9B1C1C] transition-colors duration-300 group-hover:bg-[#9B1C1C] group-hover:text-[#FAF9F6]">
                    <PlayTriangleIcon className="ml-0.5 h-2.5 w-2.5" />
                  </span>
                  <span>See Our Services in Action</span>
                </a>
              </motion.div>
            </div>

            {/* Mobile & Tablet Independently Composed Full-Width Architectural Masterpiece (< 1024px) */}
            <motion.div
              initial={
                prefersReducedMotion
                  ? false
                  : { opacity: 0, y: 16, scale: 1.02 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.78, delay: 0.2, ease: EDITORIAL_EASE }}
              className="lg:hidden"
            >
              <div className="relative overflow-hidden rounded-2xl bg-[#E8E2D9] shadow-[0_20px_46px_-18px_rgba(26,22,18,0.2)]">
                <div className="relative aspect-[850/660] w-full sm:aspect-[16/11]">
                  <Image
                    src="/images/atelier/services-living-canvas-hero.jpg"
                    alt="Sunlit luxury contemporary living room featuring an oversized sculptural terracotta and blush iris botanical 3D wall mural above a curved cream bouclé sofa and travertine coffee table"
                    fill
                    priority
                    quality={92}
                    sizes="100vw"
                    className="object-cover object-[52%_44%]"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </div>

      {/* =====================================================================
          FLOATING SERVICE SPECTRUM PANEL + REFINED SCROLL CUE
      ===================================================================== */}
      <div className="relative z-20 pb-5 sm:pb-6 lg:pt-2 lg:pb-6">
        <Container>
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.68, delay: 0.3, ease: EDITORIAL_EASE }}
            aria-label="The Atelier Service Spectrum"
            className="rounded-2xl bg-[#FAF9F6]/96 px-5 py-4 shadow-[0_20px_48px_-18px_rgba(28,22,18,0.15)] backdrop-blur-[6px] sm:px-6 sm:py-5 lg:px-6 lg:py-5 xl:px-8"
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.98fr_0.96fr_1.22fr_1.16fr_1.04fr] lg:items-center lg:gap-0">
              {/* Lead Title Block */}
              <div className="border-b border-[#E6DCD0] pb-3.5 lg:border-b-0 lg:pr-5 xl:pr-6 lg:pb-0">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#9B1C1C]">
                  THE ATELIER
                </p>
                <p className="mt-0.5 font-serif text-[23px] italic leading-[1.12] text-[#1A1A1A] sm:text-[25px] lg:whitespace-nowrap xl:text-[27px]">
                  Service Spectrum
                </p>
              </div>

              {/* Four Numbered Highlights (Responsive 2x2 Grid on Mobile/Tablet, Divided Horizontal Strip on Desktop) */}
              <div className="grid grid-cols-1 gap-3.5 min-[380px]:grid-cols-2 sm:grid-cols-4 lg:contents">
                {SERVICE_SPECTRUM_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.code}
                      className="flex items-start gap-3 lg:items-center lg:border-l lg:border-[#E2D8CC] lg:pl-4 lg:pr-3 xl:pl-6 xl:pr-4"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F4ECE1] text-[#9B1C1C] lg:mt-0"
                      >
                        <Icon className="h-[18px] w-[18px]" strokeWidth={1.65} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold leading-[1.28] text-[#1A1A1A] xl:text-[13.5px]">
                          <span className="whitespace-nowrap font-semibold text-[#9B1C1C]">
                            {item.code} —{" "}
                          </span>
                          <span>{item.title}</span>
                        </p>
                        <p className="mt-0.5 text-[11.5px] leading-[1.35] text-[#635C56] xl:text-[12px]">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Refined Architectural Scroll Cue Beneath Service Spectrum */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.42, ease: EDITORIAL_EASE }}
            className="mt-4 flex items-center justify-center gap-3 sm:mt-5"
          >
            <span
              aria-hidden="true"
              className="h-px w-16 bg-gradient-to-r from-transparent to-[#9B1C1C]/35 sm:w-28 lg:w-36"
            />
            <a
              href="#service-spectrum"
              onClick={(e) => scrollToSection(e, "service-spectrum")}
              aria-label="Scroll to explore our six architectural printing surfaces"
              className="group inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#FAF9F6]/92 text-[#9B1C1C] ring-1 ring-[#9B1C1C]/35 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#9B1C1C] hover:text-[#FAF9F6] hover:ring-[#9B1C1C]"
            >
              <ChevronDown className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-y-0.5" />
            </a>
            <span
              aria-hidden="true"
              className="h-px w-16 bg-gradient-to-l from-transparent to-[#9B1C1C]/35 sm:w-28 lg:w-36"
            />
          </motion.div>
        </Container>
      </div>
    </section>
  );
}
