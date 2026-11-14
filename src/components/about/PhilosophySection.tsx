"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { ABOUT_PAGE_CONTENT } from "@/lib/blogs-catalogue";
import { cn } from "@/lib/cn";

const EDITORIAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export type PhilosophyIconType = "petal" | "layers" | "cube" | "infinity";

export function PhilosophyLineIcon({
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
            strokeWidth="1.55"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 20.2C8.6 18.6 5.5 14.7 6.2 10.1C10.1 10.9 12.4 14 14 20.2Z"
            stroke="currentColor"
            strokeWidth="1.55"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 20.2C19.4 18.6 22.5 14.7 21.8 10.1C17.9 10.9 15.6 14 14 20.2Z"
            stroke="currentColor"
            strokeWidth="1.55"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 20.2V24"
            stroke="currentColor"
            strokeWidth="1.55"
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
            strokeWidth="1.55"
            strokeLinejoin="round"
          />
          <path
            d="M4.5 14.4L14 19.4L23.5 14.4"
            stroke="currentColor"
            strokeWidth="1.55"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.5 18.55L14 23.55L23.5 18.55"
            stroke="currentColor"
            strokeWidth="1.55"
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
            strokeWidth="1.55"
            strokeLinejoin="round"
          />
          <path
            d="M5.4 9.35L14 14.2L22.6 9.35"
            stroke="currentColor"
            strokeWidth="1.55"
            strokeLinejoin="round"
          />
          <path
            d="M14 14.2V23.9"
            stroke="currentColor"
            strokeWidth="1.55"
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
            strokeWidth="1.65"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

function PhilosophyEnvironment() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Warm Cream Plaster Base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #FAF6F0 0%, #F9F4EC 58%, #F6EFE6 100%)",
        }}
      />

      {/* Soft Upper-Left Botanical Leaf Shadow (Matches Reference) */}
      <div
        className="absolute top-0 left-0 hidden h-[270px] w-[30%] opacity-30 lg:block"
        style={{
          background:
            "radial-gradient(90% 88% at 10% 14%, rgba(214,196,174,0.58) 0%, rgba(235,223,208,0.3) 50%, transparent 94%), linear-gradient(130deg, rgba(255,253,249,0.7) 0%, rgba(224,209,190,0.32) 46%, transparent 88%)",
        }}
      />

      {/* Subtle Sculptural Plaster Relief Curves Along Left & Right Boundaries */}
      <svg
        viewBox="0 0 1450 520"
        fill="none"
        preserveAspectRatio="none"
        className="h-full w-full opacity-75"
      >
        <defs>
          <linearGradient id="philReliefLeft" x1="0" y1="0.4" x2="0.4" y2="1">
            <stop offset="0%" stopColor="#EFE6D9" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#FAF6F0" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="philReliefRight" x1="1" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor="#EFE6D9" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FAF6F0" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M -40 310 C 65 340, 145 430, 260 520 L -40 520 Z"
          fill="url(#philReliefLeft)"
        />
        <path
          d="M -30 308 C 72 338, 150 426, 264 520"
          stroke="#E2D5C5"
          strokeWidth="1.15"
          strokeOpacity="0.8"
        />
        <path
          d="M 1490 42 C 1320 52, 1210 146, 1140 278 C 1085 382, 1030 468, 955 520 L 1490 520 Z"
          fill="url(#philReliefRight)"
        />
        <path
          d="M 1490 42 C 1320 52, 1210 146, 1140 278 C 1085 382, 1030 468, 955 520"
          stroke="#E2D5C5"
          strokeWidth="1.15"
          strokeOpacity="0.75"
        />
      </svg>
    </div>
  );
}

function PhilosophyIntro({
  eyebrow,
  supportingText,
  ctaLabel,
  ctaHref,
  revealVisible,
}: {
  eyebrow: string;
  supportingText: string;
  ctaLabel: string;
  ctaHref: string;
  revealVisible: boolean;
}) {
  return (
    <motion.div
      initial={false}
      animate={revealVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.52, ease: EDITORIAL_EASE }}
      className="order-1 xl:py-8"
    >
      <div className="max-w-[460px] xl:max-w-none">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-3">
          <span
            aria-hidden="true"
            className="h-[1.5px] w-7 shrink-0 bg-[#9B1C1C]"
          />
          <span className="text-[11px] font-bold tracking-[0.22em] text-[#9B1C1C] uppercase">
            {eyebrow}
          </span>
        </div>

        {/* Heading */}
        <h2
          id="about-philosophy-heading"
          className="mt-2.5 font-serif text-[clamp(2.15rem,3.1vw,3.05rem)] font-normal leading-[1.06] tracking-[-0.022em] text-[#1A1A1A]"
        >
          <span className="block sm:whitespace-nowrap">The Principles</span>{" "}
          <span className="mt-0.5 block sm:whitespace-nowrap">
            That{" "}
            <em className="font-serif italic font-normal text-[#9B1C1C]">
              Guide Us.
            </em>
          </span>
        </h2>

        {/* Description */}
        <p className="mt-3.5 max-w-[36ch] text-[13.75px] leading-[1.64] text-[#5C534C] sm:text-[14px]">
          {supportingText}
        </p>

        {/* Primary CTA */}
        <div className="mt-5 sm:mt-6">
          <Link
            href={ctaHref}
            className="group inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#9B1C1C] px-5.5 py-2.5 text-[12.5px] font-semibold tracking-[0.01em] text-[#FFFDF9] shadow-[0_12px_24px_-8px_rgba(155,28,28,0.42)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#7F1616] hover:shadow-[0_16px_28px_-8px_rgba(155,28,28,0.5)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9B1C1C]"
          >
            <span>{ctaLabel}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function ArchitecturalArchVisual({
  imageUrl,
  revealVisible,
}: {
  imageUrl: string;
  revealVisible: boolean;
}) {
  return (
    <motion.div
      initial={false}
      animate={revealVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      transition={{ duration: 0.6, delay: 0.08, ease: EDITORIAL_EASE }}
      className="order-2 flex justify-center xl:self-end xl:pt-1"
    >
      <div className="relative w-full max-w-[285px] sm:max-w-[300px] xl:max-w-[310px]">
        {/* Pure Freestanding Arch Silhouette — Full Plinth Baseline Visible */}
        <div className="relative aspect-[620/936] w-full overflow-hidden rounded-t-full rounded-b-[8px] bg-[#EFE7DB] shadow-[0_22px_46px_-20px_rgba(40,28,18,0.22)] ring-1 ring-[#E2D6C6]/90">
          <Image
            src={imageUrl}
            alt="Sculptural warm plaster arch alcove featuring concealed cove lighting, fluted oak wood slats, a hand-painted sage and terracotta botanical mural, travertine plinth, and ceramic berry vase"
            fill
            sizes="(min-width: 1280px) 335px, (min-width: 768px) 320px, 84vw"
            quality={92}
            className="object-cover object-top"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-t-full ring-1 ring-inset ring-white/40"
          />
        </div>

        {/* Soft Architectural Baseline Contact Shadow */}
        <div
          aria-hidden="true"
          className="mx-auto -mt-1.5 h-3.5 w-[88%] rounded-full blur-md"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(44, 30, 18, 0.2) 0%, rgba(44, 30, 18, 0) 74%)",
          }}
        />
      </div>
    </motion.div>
  );
}

function PhilosophyCard({
  icon,
  title,
  description,
  index,
  revealVisible,
}: {
  icon: PhilosophyIconType;
  title: string;
  description: string;
  index: number;
  revealVisible: boolean;
}) {
  return (
    <motion.article
      initial={false}
      animate={revealVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{
        duration: 0.5,
        delay: 0.12 + index * 0.06,
        ease: EDITORIAL_EASE,
      }}
      className="group flex h-full items-start gap-3.5 rounded-[22px] border border-[#DFD0C0] bg-[#FFFDF9]/96 p-4.5 shadow-[0_12px_28px_-18px_rgba(34,24,16,0.14)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#CBB59D] hover:shadow-[0_18px_36px_-15px_rgba(34,24,16,0.2)] xl:gap-4 xl:px-5 xl:py-5"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] border border-[#EAE0D3] bg-[#F5EDE2] transition-colors duration-300 group-hover:border-[#9B1C1C]/35 group-hover:bg-[#F2E5D6]">
        <PhilosophyLineIcon
          type={icon}
          className="h-6 w-6 transition-transform duration-300 group-hover:scale-105"
        />
      </span>

      <div className="min-w-0">
        <h3 className="font-serif text-[19px] font-semibold leading-[1.18] text-[#1A1A1A] transition-colors duration-300 group-hover:text-[#9B1C1C] xl:text-[20px]">
          {title}
        </h3>
        <p className="mt-1.5 text-[12.5px] leading-[1.52] text-[#665D56] xl:text-[13px]">
          {description}
        </p>
      </div>
    </motion.article>
  );
}

function PhilosophyGrid({
  items,
  revealVisible,
}: {
  items: ReadonlyArray<{
    code: string;
    icon: PhilosophyIconType;
    title: string;
    description: string;
  }>;
  revealVisible: boolean;
}) {
  return (
    <div className="order-3 md:col-span-2 xl:col-span-1 xl:py-8">
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:gap-4">
        {items.map((item, idx) => (
          <PhilosophyCard
            key={item.code}
            icon={item.icon}
            title={item.title}
            description={item.description}
            index={idx}
            revealVisible={revealVisible}
          />
        ))}
      </div>
    </div>
  );
}

export function PhilosophySection() {
  const prefersReducedMotion = useReducedMotion();
  const { philosophy } = ABOUT_PAGE_CONTENT;
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(true);

  useEffect(() => {
    if (prefersReducedMotion || typeof window === "undefined") return;
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.94) {
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
      id="our-philosophy"
      aria-labelledby="about-philosophy-heading"
      className="relative isolate overflow-hidden border-b border-[#E3D7C8] bg-[#FAF6F0] py-11 text-[#1A1A1A] sm:py-12 xl:pt-8 xl:pb-3"
    >
      <PhilosophyEnvironment />

      <Container className="lg:px-6 xl:px-10">
        <div className="grid grid-cols-1 items-center gap-7 md:grid-cols-[minmax(0,1fr)_minmax(0,315px)] md:gap-8 xl:grid-cols-[minmax(0,0.225fr)_minmax(0,0.275fr)_minmax(0,0.50fr)] xl:gap-8">
          <PhilosophyIntro
            eyebrow={philosophy.eyebrow}
            supportingText={philosophy.supportingText}
            ctaLabel={philosophy.ctaLabel}
            ctaHref={philosophy.ctaHref}
            revealVisible={revealVisible}
          />

          <ArchitecturalArchVisual
            imageUrl={philosophy.archVisualUrl}
            revealVisible={revealVisible}
          />

          <PhilosophyGrid
            items={philosophy.themes}
            revealVisible={revealVisible}
          />
        </div>
      </Container>
    </section>
  );
}
