"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  MessageCircle,
  ArrowUpRight,
  ArrowRight,
  Box,
  Compass,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { ABOUT_PAGE_CONTENT } from "@/lib/blogs-catalogue";
import {
  ATELIER_BRAND,
  ATELIER_CONTACTS,
  buildWhatsAppUrl,
} from "@/lib/brand";

const REPRESENTATIVE_STUDIO_PLATES = [
  {
    imageUrl: "/images/atelier/studio-about-interior.jpg",
    plateCaption: "Atelier Material & Elevation Table",
  },
  {
    imageUrl: "/images/atelier/process-stage-01-consultation.jpg",
    plateCaption: "Surface Swatches & Design Coordination",
  },
];

export function StudioPeopleAndJourney() {
  const { creativeEvolution, missionAndVision } = ABOUT_PAGE_CONTENT;
  const [activePillarIndex, setActivePillarIndex] = useState<number>(4);

  return (
    <>
      {/* =====================================================================
          SECTION 05 — THE PEOPLE & STUDIO BEHIND ATELIER
          Verified contacts (Saikat Ray & Triparna Bardhan) + Mumbai Studio
          Strictly no fabricated biographies, no unverified founder titles,
          and no synthetic portraits misrepresented as real staff.
          ===================================================================== */}
      <section
        id="people-and-studio"
        aria-labelledby="people-behind-atelier-heading"
        className="relative border-b border-[#DED5CB] bg-[#F8F3ED] py-16 lg:py-22"
      >
        <Container>
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-8">
            {/* Left Column (3.5 cols -> 3 cols on lg): Introduction */}
            <div className="lg:col-span-3">
              <div className="mb-2.5 flex items-center gap-3">
                <span className="h-[1.5px] w-7 bg-[#9B1C1C]" />
                <span className="text-[11px] font-bold tracking-[0.2em] text-[#9B1C1C] uppercase">
                  THE PEOPLE BEHIND THE STUDIO
                </span>
              </div>

              <h2
                id="people-behind-atelier-heading"
                className="font-serif text-[clamp(1.95rem,3vw,2.65rem)] leading-[1.08] font-normal tracking-[-0.02em] text-[#201C1A]"
              >
                The People Behind{" "}
                <span className="italic text-[#73171B]">ATELIER.</span>
              </h2>

              <p className="mt-2 font-serif text-[15px] italic text-[#756C65]">
                A Multidisciplinary Studio in Mumbai.
              </p>

              <p className="mt-3.5 text-[13.5px] leading-[1.66] text-[#5C534C]">
                Connect directly with our studio representatives in Oshiwara,
                Andheri West, Mumbai for consultations, surface assessments, and
                custom wall-art commissions.
              </p>

              {/* Compact Mission & Vision Summary Pill */}
              <div className="mt-5 rounded-2xl border border-[#DED5CB] bg-[#FDF8F3] p-4">
                <span className="text-[10px] font-bold tracking-[0.18em] text-[#9B1C1C] uppercase">
                  {missionAndVision.mission.label}
                </span>
                <p className="mt-1.5 text-[12px] leading-[1.55] text-[#5C534C]">
                  {missionAndVision.mission.body}
                </p>
              </div>
            </div>

            {/* Center Column (5 cols): Verified Studio Representatives */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-5">
              {ATELIER_CONTACTS.map((person, idx) => {
                const studioPlate =
                  REPRESENTATIVE_STUDIO_PLATES[idx] ??
                  REPRESENTATIVE_STUDIO_PLATES[0];
                const whatsappPhone = person.phones.find(
                  (p) => p.isWhatsApp && p.whatsappDigits
                );

                return (
                  <article
                    key={person.name}
                    className="group flex flex-col justify-between overflow-hidden rounded-[22px] border border-[#DED5CB] bg-[#FDF8F3] p-3.5 shadow-[0_14px_34px_rgba(32,24,18,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#C8B59E]"
                  >
                    <div>
                      {/* Studio Material Study Visual (No synthetic staff portrait) */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[16px] bg-[#241B18]">
                        <img
                          src={studioPlate.imageUrl}
                          alt={studioPlate.plateCaption}
                          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#201C1A]/75 via-transparent to-transparent" />
                        <span className="absolute bottom-2.5 left-2.5 rounded-full bg-black/50 px-2.5 py-0.5 text-[9.5px] font-medium text-[#FDF8F3] backdrop-blur-xs">
                          {studioPlate.plateCaption}
                        </span>
                      </div>

                      {/* Representative Name & Verified Role */}
                      <div className="mt-3.5 px-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-serif text-[21px] leading-tight font-medium text-[#201C1A]">
                              {person.name}
                            </h3>
                            <p className="mt-1 text-[10px] font-bold tracking-[0.14em] text-[#9B1C1C] uppercase">
                              {person.role}
                            </p>
                          </div>

                          {whatsappPhone?.whatsappDigits && (
                            <a
                              href={buildWhatsAppUrl(
                                whatsappPhone.whatsappDigits,
                                `Hello ${person.name}, I would like to discuss a wall or surface printing project with ATELIER — WALL STORY.`
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`WhatsApp ${person.name}`}
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#D9C8B5] bg-[#F8F3ED] text-[#9B1C1C] transition-colors hover:border-[#9B1C1C] hover:bg-[#9B1C1C] hover:text-white"
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Direct Phone & WhatsApp Links */}
                    <div className="mt-4 space-y-1.5 border-t border-[#E6DCD0] pt-3 px-1">
                      {person.phones.map((phone) => (
                        <div
                          key={phone.display}
                          className="flex items-center justify-between text-[11.5px]"
                        >
                          <a
                            href={phone.telHref}
                            className="inline-flex items-center gap-1.5 font-medium text-[#201C1A] hover:text-[#9B1C1C]"
                          >
                            <Phone className="h-3 w-3 text-[#9B1C1C]" />
                            <span>{phone.display}</span>
                          </a>
                          {phone.isWhatsApp && phone.whatsappDigits && (
                            <a
                              href={buildWhatsAppUrl(phone.whatsappDigits)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-full bg-[#9B1C1C]/10 px-2 py-0.5 text-[10px] font-bold text-[#9B1C1C] hover:bg-[#9B1C1C] hover:text-white"
                            >
                              <MessageCircle className="h-2.5 w-2.5" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Right Column (4 cols): Our Mumbai Studio Address & Architectural Visual */}
            <div className="lg:col-span-4">
              <div className="rounded-[22px] border border-[#DED5CB] bg-[#FDF8F3] p-5 shadow-[0_14px_34px_rgba(32,24,18,0.06)]">
                <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] text-[#9B1C1C] uppercase">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>OUR MUMBAI STUDIO</span>
                </div>

                <address className="mt-2.5 text-[13.5px] leading-[1.6] font-normal not-italic text-[#201C1A]">
                  {ATELIER_BRAND.address.line1}, <br />
                  {ATELIER_BRAND.address.line2}, <br />
                  {ATELIER_BRAND.address.cityPin}
                </address>

                {/* Studio Consultation Concept Visual */}
                <div className="relative mt-4 overflow-hidden rounded-[16px] border border-[#D9C8B5] bg-[#241B18]">
                  <div className="aspect-[16/9.5] w-full">
                    <img
                      src="/images/atelier/process-hero-sculptural-arch.jpg"
                      alt="Architectural studio concept showcasing mural scale and warm interior lighting"
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#201C1A]/75 via-transparent to-transparent" />
                  <div className="absolute right-3 bottom-2.5 left-3 flex items-center justify-between text-white">
                    <span className="text-[11px] font-medium text-[#FDF8F3]">
                      Oshiwara, Andheri West • Studio Consultations
                    </span>
                    <Link
                      href="/contact?intent=about"
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white backdrop-blur-xs transition-colors hover:bg-[#9B1C1C]"
                      aria-label="Schedule a studio consultation"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =====================================================================
          SECTION 06 — OUR CREATIVE EVOLUTION ("A GROWING WALL STORY.")
          Flowing curved burgundy line with 5 verified studio capability pillars
          (Zero fabricated chronological years or invented milestones)
          ===================================================================== */}
      <section
        id="our-journey"
        aria-labelledby="creative-evolution-heading"
        className="relative overflow-hidden border-b border-[#DED5CB] bg-gradient-to-b from-[#EDE4DA] to-[#F8F3ED] py-14 lg:py-18"
      >
        <Container>
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            {/* Left Heading (3 cols) */}
            <div className="lg:col-span-3">
              <div className="mb-2.5 flex items-center gap-3">
                <span className="h-[1.5px] w-7 bg-[#9B1C1C]" />
                <span className="text-[11px] font-bold tracking-[0.22em] text-[#9B1C1C] uppercase">
                  {creativeEvolution.eyebrow}
                </span>
              </div>

              <h2
                id="creative-evolution-heading"
                className="font-serif text-[clamp(2rem,3.1vw,2.75rem)] leading-[1.08] font-normal tracking-[-0.02em] text-[#201C1A]"
              >
                A Growing <br />
                <span className="italic text-[#73171B]">Wall Story.</span>
              </h2>
            </div>

            {/* Right Flowing Curved Burgundy Evolution Wave (9 cols) */}
            <div className="relative lg:col-span-9">
              {/* Desktop Flowing Curved Burgundy Line */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-6 top-5 hidden lg:block"
              >
                <svg
                  viewBox="0 0 900 44"
                  fill="none"
                  className="h-11 w-full overflow-visible"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 20 26 C 140 4, 240 42, 360 22 C 480 4, 580 40, 700 20 C 780 8, 840 24, 880 20"
                    stroke="#9B1C1C"
                    strokeWidth="1.6"
                    strokeOpacity="0.55"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* 5 Capability Evolution Nodes */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
                {creativeEvolution.pillars.map((pillar, idx) => {
                  const isActive = idx === activePillarIndex;
                  return (
                    <button
                      key={pillar.code}
                      type="button"
                      onClick={() => setActivePillarIndex(idx)}
                      onMouseEnter={() => setActivePillarIndex(idx)}
                      className="group relative flex cursor-pointer flex-col items-start text-left lg:items-center lg:pt-2 lg:text-center"
                    >
                      {/* Timeline Node Dot */}
                      <span
                        className={`relative z-10 mb-3 flex h-6 w-6 items-center justify-center rounded-full border transition-all ${
                          isActive
                            ? "scale-110 border-[#9B1C1C] bg-[#FDF8F3] shadow-[0_0_0_4px_rgba(155,28,28,0.15)]"
                            : "border-[#9B1C1C]/50 bg-[#F8F3ED] group-hover:border-[#9B1C1C]"
                        }`}
                      >
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            isActive ? "bg-[#9B1C1C]" : "bg-[#201C1A]"
                          }`}
                        />
                      </span>

                      <span className="text-[10px] font-bold tracking-[0.18em] text-[#9B1C1C] uppercase">
                        Pillar {pillar.code}
                      </span>

                      <h3
                        className={`mt-1 font-serif text-[18px] leading-snug font-semibold transition-colors ${
                          isActive
                            ? "text-[#9B1C1C]"
                            : "text-[#201C1A] group-hover:text-[#9B1C1C]"
                        }`}
                      >
                        {pillar.label}
                      </h3>

                      <p
                        className={`mt-1 text-[12px] leading-[1.5] ${
                          isActive
                            ? "font-medium text-[#73171B]"
                            : "text-[#6E645D]"
                        }`}
                      >
                        {pillar.summary}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =====================================================================
          SECTION 07 — BEYOND THE WALL (CONCISE VISUALIZER & CATALOGUE TEASER)
          ===================================================================== */}
      <section
        aria-labelledby="beyond-the-wall-heading"
        className="border-b border-[#DED5CB] bg-[#F8F3ED] py-12 lg:py-16"
      >
        <Container>
          <div className="grid grid-cols-1 items-center gap-8 rounded-[28px] border border-[#DED5CB] bg-[#FDF8F3] p-6 shadow-[0_16px_40px_rgba(32,24,18,0.05)] sm:p-8 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <div className="mb-2.5 flex items-center gap-3">
                <span className="h-[1.5px] w-7 bg-[#9B1C1C]" />
                <span className="text-[11px] font-bold tracking-[0.22em] text-[#9B1C1C] uppercase">
                  SPATIAL HARMONY
                </span>
              </div>

              <h2
                id="beyond-the-wall-heading"
                className="font-serif text-[clamp(1.85rem,2.9vw,2.55rem)] leading-[1.08] font-normal text-[#201C1A]"
              >
                Beyond the Wall.{" "}
                <span className="italic text-[#73171B]">Into the Space.</span>
              </h2>

              <p className="mt-3 max-w-[48ch] text-[14px] leading-[1.65] text-[#5C534C]">
                Every mural and surface print is conceived to harmonize with
                your room&apos;s daylight, proportions, and material palette.
                Preview any design from our 13-category catalogue directly on a
                photograph of your own wall.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/visualizer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#9B1C1C] px-5 py-2.5 text-[12px] font-bold tracking-[0.1em] text-white uppercase shadow-sm transition-all hover:bg-[#73171B]"
                >
                  <Box className="h-3.5 w-3.5" />
                  <span>Discover Wall Preview</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <Link
                  href="/explore-designs"
                  className="inline-flex items-center gap-2 rounded-full border border-[#D4C3B0] bg-[#F8F3ED] px-4 py-2.5 text-[12px] font-bold tracking-[0.1em] text-[#201C1A] uppercase transition-all hover:border-[#9B1C1C] hover:text-[#9B1C1C]"
                >
                  <Compass className="h-3.5 w-3.5 text-[#9B1C1C]" />
                  <span>Explore Design Catalogue</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="overflow-hidden rounded-[18px] border border-[#D9C8B5] bg-[#241B18]">
                  <img
                    src="/images/atelier/wall-preview-before.jpg"
                    alt="Before: Sunlit bare architectural wall"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <div className="bg-[#F8F3ED] px-3 py-2 text-[11px] font-semibold text-[#5C534C]">
                    01 • Bare Architectural Wall
                  </div>
                </div>
                <div className="overflow-hidden rounded-[18px] border border-[#D9C8B5] bg-[#241B18]">
                  <img
                    src="/images/atelier/wall-preview-after.jpg"
                    alt="After: Wall transformed with bespoke botanical mural"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <div className="bg-[#F8F3ED] px-3 py-2 text-[11px] font-semibold text-[#9B1C1C]">
                    02 • Proportioned Mural Preview
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

