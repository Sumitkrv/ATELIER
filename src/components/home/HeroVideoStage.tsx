"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { DEFAULT_HOMEPAGE_CONTENT } from "@/lib/homepage-content";
import { ArrowDown, ArrowRight } from "lucide-react";

interface HeroVideoStageProps {
  videoUrl?: string;
  posterUrl?: string;
  headlineLine1?: string;
  headlineLine2?: string;
  subheading?: string;
}

const HERO_MATERIAL_STRIP = [
  "WALLS",
  "TILES",
  "PLYWOOD",
  "OFFICE BLINDS",
  "METALS",
  "GLASS",
] as const;

/**
 * Responsive object-position classes tuned separately for mobile, tablet, and desktop
 * so `object-cover` preserves the 16:9 aspect ratio without stretching while keeping the
 * vertical 3D wall-printing machine and mural in frame and the left editorial copy legible.
 */
const HERO_MEDIA_FRAMING_CLASSES =
  "h-full w-full object-cover object-[67%_42%] sm:object-[65%_44%] md:object-[63%_42%] lg:object-[58%_40%] xl:object-[54%_42%]";

/**
 * SECTION 01 — CINEMATIC 3D WALL PRINTING VIDEO HERO
 * Starts directly beneath the sticky navbar (`--header-height`), showcases a realistic
 * vertical 3D wall-printing machine actively printing an architectural mural onto a wall,
 * and pairs left-aligned editorial typography with a restrained bottom material strip.
 */
export function HeroVideoStage({
  videoUrl = DEFAULT_HOMEPAGE_CONTENT.hero.videoUrl,
  posterUrl = DEFAULT_HOMEPAGE_CONTENT.hero.posterUrl,
  headlineLine1 = DEFAULT_HOMEPAGE_CONTENT.hero.headlineLine1,
  headlineLine2 = DEFAULT_HOMEPAGE_CONTENT.hero.headlineLine2,
  subheading = DEFAULT_HOMEPAGE_CONTENT.hero.subheading,
}: HeroVideoStageProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [saveDataEnabled, setSaveDataEnabled] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [posterFallbackUsed, setPosterFallbackUsed] = useState(false);

  useEffect(() => {
    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean };
    };
    if (nav.connection?.saveData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSaveDataEnabled(true);
    }
  }, []);

  const shouldRenderVideo = Boolean(
    videoUrl &&
      videoUrl.trim().length > 0 &&
      !videoError &&
      !prefersReducedMotion &&
      !saveDataEnabled
  );

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !shouldRenderVideo) return;

    el.defaultMuted = true;
    el.muted = true;

    const tryPlay = () => {
      const playPromise = el.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setVideoReady(true);
          })
          .catch(() => {
            // Browser policy or low-power mode blocked autoplay; poster remains seamlessly visible
          });
      }
    };

    if (el.readyState >= 2) {
      setVideoReady(true);
      tryPlay();
    } else {
      tryPlay();
    }
  }, [shouldRenderVideo]);

  const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];
  const resolvedPoster = posterFallbackUsed
    ? "/images/atelier/hero-poster-frame0.jpg"
    : posterUrl && !posterUrl.endsWith(".svg")
      ? posterUrl
      : "/images/atelier-wall-printing-poster.webp";

  return (
    <section
      id="atelier-hero"
      aria-label="ATELIER — WALL STORY 3D wall printing studio hero"
      className="relative flex h-[calc(100svh-var(--navbar-height,74px))] min-h-[540px] max-h-[820px] w-full flex-col justify-between overflow-hidden bg-[#1A1A1A] text-[#FAF9F6] sm:min-h-[600px] sm:max-h-[860px] lg:h-[calc(100dvh-var(--navbar-height,74px))] lg:min-h-[640px] lg:max-h-[880px]"
    >
      {/* Layer 1: Full-Bleed Vertical 3D Wall-Printing Machine Video & Poster Stage */}
      <div className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden bg-[#1A1A1A]">
        {/* Persistent Poster Layer prevents any black flash or layout shift before video playback */}
        <img
          src={resolvedPoster}
          alt="Vertical 3D wall-printing machine actively printing an architectural mural onto an interior wall at ATELIER — WALL STORY"
          fetchPriority="high"
          decoding="async"
          onError={() => {
            if (!posterFallbackUsed) {
              setPosterFallbackUsed(true);
            }
          }}
          className={HERO_MEDIA_FRAMING_CLASSES}
        />

        {shouldRenderVideo ? (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={resolvedPoster}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            controls={false}
            onLoadedData={() => setVideoReady(true)}
            onPlaying={() => setVideoReady(true)}
            onError={() => setVideoError(true)}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${HERO_MEDIA_FRAMING_CLASSES} ${
              videoReady ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : null}

        {/* Subtle Left-Side Dark Gradient for Headline Readability (keeps right-side printer clear) */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(96deg, rgba(20, 16, 14, 0.84) 0%, rgba(22, 18, 16, 0.65) 34%, rgba(24, 19, 17, 0.22) 56%, rgba(24, 19, 17, 0.04) 100%)",
          }}
        />

        {/* Subtle Top & Bottom Vignettes for Navbar Edge and Bottom Material Strip */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#1A1A1A]/35 to-transparent"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#1A1A1A]/85 via-[#1A1A1A]/35 to-transparent"
        />
      </div>

      {/* Layer 2: Left-Aligned Luxury Editorial Hero Content */}
      <Container className="relative z-10 my-auto pt-7 pb-5 sm:pt-10 sm:pb-7 lg:py-12">
        <div className="max-w-[640px]">
          {/* Two-Line Studio Eyebrow */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: easeOut }}
            className="mb-4 flex items-start gap-3.5 sm:mb-5"
          >
            <span
              aria-hidden="true"
              className="mt-2 h-[2px] w-8 shrink-0 bg-[#9B1C1C] sm:w-10"
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#FAF9F6] sm:text-xs">
                ATELIER — WALL STORY
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#E8E2D9]/82 sm:text-[11px]">
                3D WALL PRINTING STUDIO • MUMBAI
              </span>
            </div>
          </motion.div>

          {/* Editorial Serif Headline */}
          <motion.h1
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.08, ease: easeOut }}
            className="font-serif text-[2.25rem] font-medium leading-[1.03] tracking-[-0.015em] text-[#FAF9F6] min-[390px]:text-[2.55rem] sm:text-6xl lg:text-[66px] xl:text-[72px]"
          >
            <span className="block font-semibold tracking-[0.01em] text-[#FAF9F6]">
              {headlineLine1}
            </span>
            <span className="mt-1.5 block italic font-normal text-[#E8E2D9]">
              {headlineLine2}
            </span>
          </motion.h1>

          {/* Supporting Description */}
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease: easeOut }}
            className="mt-4 max-w-[520px] text-[14.5px] leading-[1.64] text-[#E8E2D9]/90 sm:mt-5 sm:text-[16.5px]"
          >
            {subheading}
          </motion.p>

          {/* Primary & Secondary Conversion CTAs */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease: easeOut }}
            className="mt-6 flex flex-col gap-3 min-[460px]:flex-row min-[460px]:flex-wrap min-[460px]:items-center sm:mt-8 sm:gap-4"
          >
            <Link
              href={DEFAULT_HOMEPAGE_CONTENT.hero.primaryCtaHref}
              className="group inline-flex min-h-[48px] w-full items-center justify-center gap-3 rounded-lg border border-[#9B1C1C] bg-[#9B1C1C] px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#FAF9F6] shadow-[0_14px_34px_-10px_rgba(155,28,28,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#7F1616] hover:bg-[#7F1616] min-[460px]:w-auto sm:px-7 sm:py-3.5"
            >
              <span>EXPLORE DESIGNS</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              href={DEFAULT_HOMEPAGE_CONTENT.hero.secondaryCtaHref}
              className="group inline-flex min-h-[48px] w-full items-center justify-center gap-3 rounded-lg border border-[#E8E2D9]/45 bg-[#1A1A1A]/55 px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#FAF9F6] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#FAF9F6] hover:bg-[#FAF9F6]/12 min-[460px]:w-auto sm:px-7 sm:py-3.5"
            >
              <span>PREVIEW ON YOUR WALL</span>
              <ArrowRight className="h-4 w-4 text-[#E8E2D9] transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#FAF9F6]" />
            </Link>
          </motion.div>
        </div>
      </Container>

      {/* Layer 3: Bottom Restrained Horizontal Material Strip & Subtle Scroll Indicator */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.55, delay: 0.16 }}
        className="relative z-10 border-t border-[#E8E2D9]/15 bg-[#1A1A1A]/60 backdrop-blur-xs"
      >
        <Container className="flex flex-col gap-2.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-3.5">
          {/* Restrained Horizontal Material Strip */}
          <div
            aria-label="Supported architectural printing surfaces"
            className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#E8E2D9]/88 sm:gap-x-3.5 sm:text-[11px]"
          >
            {HERO_MATERIAL_STRIP.map((surface, idx) => (
              <React.Fragment key={surface}>
                {idx > 0 ? (
                  <span
                    aria-hidden="true"
                    className="text-[#9B1C1C] select-none"
                  >
                    ·
                  </span>
                ) : null}
                <span className="transition-colors duration-200 hover:text-[#FAF9F6]">
                  {surface}
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* Subtle Scroll Indicator */}
          <a
            href="#atelier-services-experience"
            className="group inline-flex w-fit items-center gap-2.5 text-[10px] font-medium uppercase tracking-[0.22em] text-[#E8E2D9]/80 transition-colors hover:text-[#FAF9F6] sm:text-[11px]"
          >
            <span>Scroll to Explore</span>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#E8E2D9]/25 bg-[#FAF9F6]/5 transition-colors group-hover:border-[#9B1C1C] group-hover:bg-[#9B1C1C]/20">
              <ArrowDown className="h-3 w-3 text-[#FAF9F6] transition-transform duration-300 group-hover:translate-y-0.5" />
            </span>
          </a>
        </Container>
      </motion.div>
    </section>
  );
}
