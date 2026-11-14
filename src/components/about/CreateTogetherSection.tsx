"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { ABOUT_PAGE_CONTENT } from "@/lib/blogs-catalogue";
import { ATELIER_WHATSAPP_NUMBERS, buildWhatsAppUrl } from "@/lib/brand";

const EDITORIAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function CreateTogetherEnvironment() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Warm Cream Architectural Base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #F9F4EC 0%, #FAF5ED 48%, #F5EDE2 100%)",
        }}
      />

      {/* Gentle Sunlit Plaster Ambient Wash on Lower-Left */}
      <div
        className="absolute top-0 left-0 hidden h-full w-[26%] opacity-28 lg:block"
        style={{
          background:
            "radial-gradient(90% 88% at 10% 38%, rgba(214,196,174,0.56) 0%, rgba(235,223,208,0.28) 52%, transparent 94%), linear-gradient(125deg, rgba(255,253,249,0.68) 0%, rgba(224,209,190,0.3) 48%, transparent 88%)",
        }}
      />

      {/* Subtle Lower-Right Plaster Arch & Fluted Architectural Detail */}
      <svg
        viewBox="0 0 1600 240"
        fill="none"
        preserveAspectRatio="none"
        className="hidden h-full w-full opacity-80 xl:block"
      >
        <defs>
          <linearGradient id="ctaArchShade" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#EFE5D8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#E6D9C8" stopOpacity="0.32" />
          </linearGradient>
        </defs>
        <path
          d="M 1435 240 C 1435 128, 1502 52, 1605 44 L 1605 240 Z"
          fill="url(#ctaArchShade)"
        />
        <path
          d="M 1422 240 C 1422 118, 1495 36, 1605 28"
          stroke="#DFD0C0"
          strokeWidth="1.25"
        />
        <path
          d="M 1528 74 V 240 M 1544 64 V 240 M 1560 58 V 240 M 1576 54 V 240 M 1592 50 V 240"
          stroke="#DECFC0"
          strokeWidth="1"
          strokeOpacity="0.55"
        />
      </svg>
    </div>
  );
}

function CTAHeading({
  eyebrow,
  revealVisible,
}: {
  eyebrow: string;
  revealVisible: boolean;
}) {
  return (
    <motion.div
      initial={false}
      animate={revealVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      transition={{ duration: 0.5, ease: EDITORIAL_EASE }}
      className="border-l-2 border-[#9B1C1C] pl-4 sm:pl-5"
    >
      <span className="block text-[10.5px] font-bold tracking-[0.22em] text-[#9B1C1C] uppercase">
        {eyebrow}
      </span>

      <h2
        id="about-final-cta-heading"
        className="mt-2 font-serif text-[clamp(2rem,3.15vw,2.95rem)] font-normal leading-[1.06] tracking-[-0.022em] text-[#1A1A1A]"
      >
        <span className="block sm:whitespace-nowrap">Let&apos;s Create a</span>{" "}
        <span className="mt-0.5 block sm:whitespace-nowrap">
          <em className="font-serif italic font-normal text-[#9B1C1C]">
            Wall Story Together.
          </em>
        </span>
      </h2>
    </motion.div>
  );
}

function CTADescription({
  supportingText,
  revealVisible,
}: {
  supportingText: string;
  revealVisible: boolean;
}) {
  return (
    <motion.div
      initial={false}
      animate={revealVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      transition={{ duration: 0.52, delay: 0.06, ease: EDITORIAL_EASE }}
      className="xl:border-l xl:border-[#DFD0C0] xl:py-1.5 xl:pl-8"
    >
      <p className="max-w-[40ch] text-[14px] leading-[1.65] text-[#5C534C] sm:text-[14.5px]">
        {supportingText}
      </p>
    </motion.div>
  );
}

function CTAButtons({
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  whatsappHref,
  revealVisible,
}: {
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  whatsappHref: string;
  revealVisible: boolean;
}) {
  return (
    <motion.div
      initial={false}
      animate={revealVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      transition={{ duration: 0.54, delay: 0.12, ease: EDITORIAL_EASE }}
      className="flex flex-col gap-2.5 sm:flex-row xl:flex-col xl:items-stretch"
    >
      <Link
        href={primaryCtaHref}
        className="group inline-flex min-h-[46px] items-center justify-center gap-2.5 rounded-full bg-[#9B1C1C] px-6 py-3 text-[11.5px] font-bold tracking-[0.11em] text-[#FFFDF9] uppercase shadow-[0_12px_26px_-8px_rgba(155,28,28,0.42)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#7F1616] hover:shadow-[0_16px_30px_-8px_rgba(155,28,28,0.5)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9B1C1C]"
      >
        <span>{primaryCtaLabel}</span>
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
      </Link>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex min-h-[46px] items-center justify-center gap-2.5 rounded-full border border-[#DFD0C0] bg-[#FFFDF9] px-6 py-3 text-[11.5px] font-bold tracking-[0.11em] text-[#1A1A1A] uppercase shadow-[0_6px_18px_-8px_rgba(26,20,14,0.08)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#9B1C1C]/60 hover:text-[#9B1C1C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9B1C1C]"
      >
        <MessageCircle className="h-4 w-4 shrink-0 text-[#9B1C1C] transition-transform duration-300 group-hover:scale-105" />
        <span>{secondaryCtaLabel}</span>
      </a>
    </motion.div>
  );
}

export function CreateTogetherSection() {
  const prefersReducedMotion = useReducedMotion();
  const { finalCta } = ABOUT_PAGE_CONTENT;
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(true);

  const whatsappHref = buildWhatsAppUrl(
    ATELIER_WHATSAPP_NUMBERS[0].digits,
    "Hello ATELIER — WALL STORY, I would like to connect with your Mumbai studio regarding a custom wall or surface art project."
  );

  useEffect(() => {
    if (prefersReducedMotion || typeof window === "undefined") return;
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95) {
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
      { threshold: 0.1, rootMargin: "0px 0px -16px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const revealVisible = Boolean(prefersReducedMotion || isRevealed);

  return (
    <section
      ref={sectionRef}
      id="lets-create-together"
      aria-labelledby="about-final-cta-heading"
      className="relative isolate overflow-hidden border-t border-[#E3D7C8] bg-[#FAF6F0] py-9 text-[#1A1A1A] sm:py-10 xl:py-10"
    >
      <CreateTogetherEnvironment />

      <Container className="lg:px-6 xl:px-10">
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2 xl:grid-cols-[minmax(0,0.40fr)_minmax(0,0.33fr)_minmax(0,0.27fr)] xl:gap-8">
          <CTAHeading
            eyebrow={finalCta.eyebrow}
            revealVisible={revealVisible}
          />

          <CTADescription
            supportingText={finalCta.supportingText}
            revealVisible={revealVisible}
          />

          <div className="md:col-span-2 xl:col-span-1">
            <CTAButtons
              primaryCtaLabel={finalCta.primaryCtaLabel}
              primaryCtaHref={finalCta.primaryCtaHref}
              secondaryCtaLabel={finalCta.secondaryCtaLabel}
              whatsappHref={whatsappHref}
              revealVisible={revealVisible}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
