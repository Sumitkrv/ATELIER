"use client";
/* eslint-disable @next/next/no-img-element */

import React from "react";
import Link from "next/link";
import { ArrowRight, Compass, MessageCircle, Sparkles } from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";
import { Container } from "@/components/layout/Container";
import { SculpturalStudioStory } from "@/components/about/SculpturalStudioStory";
import { StudioPeopleAndJourney } from "@/components/about/StudioPeopleAndJourney";
import { ABOUT_PAGE_CONTENT } from "@/lib/blogs-catalogue";
import { ATELIER_WHATSAPP_NUMBERS, buildWhatsAppUrl } from "@/lib/brand";

export default function AboutPage() {
  const content = ABOUT_PAGE_CONTENT;

  const whatsappHref = buildWhatsAppUrl(
    ATELIER_WHATSAPP_NUMBERS[0].digits,
    "Hello ATELIER — WALL STORY, I would like to connect with your Mumbai studio regarding a custom wall or surface art project."
  );

  return (
    <PublicShell>
      <div className="min-h-screen bg-[#F8F3ED] text-[#201C1A]">
        {/* ================================================================
            SECTION 01 — CINEMATIC ARCHITECTURAL HERO
            ================================================================ */}
        <section
          aria-labelledby="about-hero-heading"
          className="relative overflow-hidden border-b border-[#DED5CB] bg-gradient-to-br from-[#FDF8F3] via-[#F8F3ED] to-[#EDE4DA] py-8 sm:py-10 lg:flex lg:min-h-[clamp(620px,calc(100svh-var(--navbar-height,74px)),840px)] lg:items-center lg:py-12"
        >
          {/* Sculptural plaster contour arcs */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-28 -left-24 h-[440px] w-[440px] rounded-full border border-[#DED5CB]/75 bg-gradient-to-br from-white/50 to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-16 left-1/4 h-[520px] w-[520px] rounded-full border border-[#E4D9CC]/50"
          />

          <Container className="relative z-10 w-full">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-8 xl:gap-10">
              {/* Left Column: Editorial Typography & CTAs (5 cols) */}
              <div className="lg:col-span-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="h-[1.5px] w-7 bg-[#9B1C1C]" />
                  <span className="text-[11px] font-bold tracking-[0.22em] text-[#9B1C1C] uppercase">
                    {content.hero.eyebrow}
                  </span>
                </div>

                <h1
                  id="about-hero-heading"
                  className="font-serif text-[clamp(2.5rem,4.4vw,3.9rem)] leading-[1.04] font-normal tracking-[-0.02em] text-[#201C1A]"
                >
                  {content.hero.headlineLine1} <br />
                  Has a <span className="italic text-[#9B1C1C]">Story.</span>
                </h1>

                <p className="mt-4 max-w-[42ch] text-[15px] leading-[1.68] text-[#5C534C]">
                  {content.hero.supportingText}
                </p>

                {/* Primary & Secondary CTAs */}
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <a
                    href="#studio-story"
                    className="inline-flex items-center gap-2 rounded-full bg-[#9B1C1C] px-5 py-3 text-[12px] font-bold tracking-[0.12em] text-white uppercase shadow-[0_10px_24px_rgba(155,28,28,0.28)] transition-all hover:bg-[#73171B]"
                  >
                    <span>Our Story</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>

                  <Link
                    href="/projects"
                    className="inline-flex items-center gap-2 rounded-full border border-[#D4C5B3] bg-[#FDF8F3] px-5 py-3 text-[12px] font-bold tracking-[0.12em] text-[#201C1A] uppercase shadow-2xs transition-all hover:border-[#9B1C1C] hover:text-[#9B1C1C]"
                  >
                    <Compass className="h-3.5 w-3.5 text-[#9B1C1C]" />
                    <span>Explore Our Work</span>
                  </Link>
                </div>

                {/* Verified Studio Location Note */}
                <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[#DED5CB] pt-5 text-[12px] text-[#6E645D]">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#201C1A]">
                    <Sparkles className="h-3.5 w-3.5 text-[#9B1C1C]" />
                    Oshiwara, Andheri West, Mumbai
                  </span>
                  <span aria-hidden="true" className="text-[#D0C3B4]">
                    •
                  </span>
                  <span>3D Wall Printing &amp; Multi-Surface Art</span>
                </div>
              </div>

              {/* Right Column: Sculptural Arch & Botanical Lotus Mural Composition (7 cols, full uncropped 1376/768 aspect ratio) */}
              <div className="lg:col-span-7">
                <div className="group relative overflow-hidden rounded-t-[36px] rounded-b-[24px] border border-[#D9C8B5] bg-[#FDF8F3] shadow-[0_24px_58px_rgba(32,24,18,0.13)] sm:rounded-t-[44px] sm:rounded-b-[28px]">
                  <div className="relative aspect-[1376/768] w-full overflow-hidden bg-[#EDE4DA]">
                    <img
                      src={content.hero.heroImageUrl}
                      alt="Sculptural cream plaster archway and luxury living room featuring a bespoke blush lotus and sage botanical mural"
                      className="h-full w-full object-cover object-[50%_80%] transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  </div>

                  {/* Dedicated Warm Ivory Architectural Caption Bar below photo so furniture & floor are never cropped */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-[#DED5CB] bg-[#FDF8F3] px-4 py-3 text-[#201C1A] sm:px-5 sm:py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#9B1C1C]" />
                      <span className="text-[11.5px] font-medium tracking-wide text-[#2B2420] sm:text-xs">
                        Lotus Archway Salon • Studio Architectural Concept
                      </span>
                    </div>
                    <Link
                      href="/explore-designs"
                      className="text-[11px] font-semibold tracking-[0.08em] text-[#9B1C1C] uppercase transition-colors hover:text-[#201C1A]"
                    >
                      Browse 13 Categories →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* ================================================================
            SECTIONS 02, 03, 04 — SCULPTURAL STUDIO STORY, PHILOSOPHY &
            DARK ARCHITECTURAL ADVANTAGE RIBBON
            ================================================================ */}
        <SculpturalStudioStory />

        {/* ================================================================
            SECTIONS 05, 06, 07 — THE PEOPLE & STUDIO BEHIND ATELIER,
            OUR CREATIVE EVOLUTION & BEYOND THE WALL
            ================================================================ */}
        <StudioPeopleAndJourney />

        {/* ================================================================
            SECTION 08 — LUXURY CREAM CONVERSION SECTION
            ("Let's Create a Wall Story Together.")
            ================================================================ */}
        <section
          aria-labelledby="about-final-cta-heading"
          className="relative overflow-hidden border-t border-[#DDD2C5] bg-gradient-to-r from-[#FBF8F3] via-[#F6EAE6] to-[#EBE3D8] py-14 text-[#211D1A] lg:py-16"
        >
          <Container className="relative z-10">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              {/* Left: Large Editorial Headline (5 cols) */}
              <div className="lg:col-span-5">
                <div className="mb-2 flex items-center gap-2.5">
                  <span className="h-[1.5px] w-6 bg-[#9B1C1C]" />
                  <span className="text-[10.5px] font-bold tracking-[0.22em] text-[#9B1C1C] uppercase">
                    {content.finalCta.eyebrow}
                  </span>
                </div>
                <h2
                  id="about-final-cta-heading"
                  className="font-serif text-[clamp(2rem,3.3vw,2.95rem)] leading-[1.08] font-normal text-[#211D1A]"
                >
                  Let&apos;s Create a <br />
                  <span className="italic text-[#9B1C1C]">
                    Wall Story Together.
                  </span>
                </h2>
              </div>

              {/* Center: Supporting Description (3.5 cols -> 4 cols) */}
              <div className="border-[#DDD2C5] lg:col-span-4 lg:border-l lg:pl-6">
                <p className="max-w-[38ch] text-[14px] leading-[1.65] text-[#6F665E]">
                  {content.finalCta.supportingText}
                </p>
              </div>

              {/* Right: Primary & Secondary CTAs (3 cols) */}
              <div className="flex flex-col gap-2.5 sm:flex-row lg:col-span-3 lg:flex-col lg:items-stretch">
                <Link
                  href={content.finalCta.primaryCtaHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#9B1C1C] px-5 py-3 text-[12px] font-bold tracking-[0.1em] text-[#FAF9F6] uppercase shadow-md transition-all hover:bg-[#73171B]"
                >
                  <span>{content.finalCta.primaryCtaLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#DDD2C5] bg-[#FBF8F3] px-5 py-3 text-[12px] font-bold tracking-[0.1em] text-[#211D1A] uppercase shadow-2xs transition-all hover:border-[#9B1C1C] hover:bg-[#F6EAE6]"
                >
                  <MessageCircle className="h-4 w-4 text-[#9B1C1C]" />
                  <span>{content.finalCta.secondaryCtaLabel}</span>
                </a>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </PublicShell>
  );
}
