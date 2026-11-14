"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";
import { Container } from "@/components/layout/Container";
import { FadeUp } from "@/components/motion/Reveal";
import { AboutStudioHero } from "@/components/about/AboutStudioHero";
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
      <div className="min-h-screen bg-[#FAF6F0] text-[#1A1A1A]">
        {/* ================================================================
            SECTION 01 — ARCHITECTURAL STUDIO HERO & 4-COLUMN EXPERTISE STRIP
            ================================================================ */}
        <AboutStudioHero />

        {/* ================================================================
            SECTIONS 02 & 03 — SCULPTURAL STUDIO STORY & OUR PHILOSOPHY
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
          <Container className="relative z-10 lg:px-6 xl:px-10">
            <FadeUp className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
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
            </FadeUp>
          </Container>
        </section>
      </div>
    </PublicShell>
  );
}
