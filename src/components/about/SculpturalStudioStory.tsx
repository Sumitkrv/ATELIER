"use client";
/* eslint-disable @next/next/no-img-element */

import React from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Layers, Grid, Users } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { ABOUT_PAGE_CONTENT } from "@/lib/blogs-catalogue";

function PhilosophySvgIcon({
  type,
}: {
  type: "petal" | "layers" | "cube" | "infinity";
}) {
  switch (type) {
    case "petal":
      return (
        <svg
          viewBox="0 0 36 36"
          fill="none"
          className="h-8 w-8 text-[#9B1C1C] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105"
          aria-hidden="true"
        >
          <path
            d="M18 6C13 11 11 17 18 26C25 17 23 11 18 6Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18 26C11 24 7 19 8 13C13 14 16 18 18 26Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18 26C25 24 29 19 28 13C23 14 20 18 18 26Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18 26V31"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "layers":
      return (
        <svg
          viewBox="0 0 36 36"
          fill="none"
          className="h-8 w-8 text-[#9B1C1C] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105"
          aria-hidden="true"
        >
          <path
            d="M18 7L30 13.5L18 20L6 13.5L18 7Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M6 18.5L18 25L30 18.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 23.5L18 30L30 23.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "cube":
      return (
        <svg
          viewBox="0 0 36 36"
          fill="none"
          className="h-8 w-8 text-[#9B1C1C] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105"
          aria-hidden="true"
        >
          <path
            d="M18 6L29 12.2V24.8L18 31L7 24.8V12.2L18 6Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M7 12.2L18 18.5L29 12.2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M18 18.5V31"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "infinity":
      return (
        <svg
          viewBox="0 0 36 36"
          fill="none"
          className="h-8 w-8 text-[#9B1C1C] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105"
          aria-hidden="true"
        >
          <path
            d="M18 18C15.2 14.2 12.5 12.5 9.8 12.5C6.8 12.5 4.5 14.9 4.5 18C4.5 21.1 6.8 23.5 9.8 23.5C12.5 23.5 15.2 21.8 18 18ZM18 18C20.8 21.8 23.5 23.5 26.2 23.5C29.2 23.5 31.5 21.1 31.5 18C31.5 14.9 29.2 12.5 26.2 12.5C23.5 12.5 20.8 14.2 18 18Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

export function SculpturalStudioStory() {
  const { studioStory, philosophy, advantageRibbon } = ABOUT_PAGE_CONTENT;

  return (
    <>
      {/* =====================================================================
          SECTION 02 — SCULPTURAL STUDIO STORY
          Asymmetric 3-part composition: Archway Left + Story Center + Sketchbook Right
          ===================================================================== */}
      <section
        id="studio-story"
        aria-labelledby="studio-story-heading"
        className="relative overflow-hidden bg-gradient-to-b from-[#EDE4DA] via-[#F4ECE2] to-[#F8F3ED] pt-14 pb-16 lg:pt-18 lg:pb-22"
      >
        {/* Subtle curved architectural top transition line */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-[#E5D8C8]/65 to-transparent"
        />

        <Container className="relative z-10">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-8">
            {/* Left Column (3.5 cols -> 4 cols on lg): Sculptural Archway Photo */}
            <div className="lg:col-span-4">
              <div className="relative mx-auto max-w-[340px] lg:max-w-none">
                <div className="overflow-hidden rounded-t-[180px] rounded-b-[24px] border border-[#D9C8B5] bg-[#241B18] shadow-[0_24px_55px_rgba(32,24,18,0.14)]">
                  <div className="aspect-[4/4.6] w-full">
                    <img
                      src={studioStory.archVisualUrl}
                      alt="Sunlit sculptural cream plaster archway with ceramic botanical vessel"
                      className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Center Column (4 cols): Studio Story Editorial Copy */}
            <div className="lg:col-span-4 lg:px-2">
              <div className="mb-3 flex items-center gap-3">
                <span className="h-[1.5px] w-7 bg-[#9B1C1C]" />
                <span className="text-[11px] font-bold tracking-[0.22em] text-[#9B1C1C] uppercase">
                  {studioStory.eyebrow}
                </span>
              </div>

              <h2
                id="studio-story-heading"
                className="font-serif text-[clamp(2rem,3.3vw,2.85rem)] leading-[1.08] font-normal tracking-[-0.02em] text-[#201C1A]"
              >
                {studioStory.headlineLine1} <br />
                <span className="italic text-[#73171B]">
                  {studioStory.headlineLine2}
                </span>
              </h2>

              <p className="mt-4 text-[14.5px] leading-[1.68] text-[#5C534C]">
                {studioStory.paragraph1}
              </p>

              <p className="mt-3 text-[13.5px] leading-[1.68] text-[#6E645D]">
                {studioStory.paragraph2}
              </p>

              <div className="mt-6">
                <Link
                  href={studioStory.ctaHref}
                  className="inline-flex items-center gap-2 rounded-full border border-[#D4C3B0] bg-[#FDF8F3] px-5 py-2.5 text-[12px] font-bold tracking-[0.1em] text-[#201C1A] uppercase shadow-2xs transition-all hover:border-[#9B1C1C] hover:text-[#9B1C1C]"
                >
                  <span>{studioStory.ctaLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#9B1C1C]" />
                </Link>
              </div>
            </div>

            {/* Right Column (4 cols): Tactile Sketchbook & Material Study */}
            <div className="lg:col-span-4">
              <div
                className="relative mx-auto max-w-[400px] lg:max-w-none"
                style={{ perspective: "1100px" }}
              >
                <div className="group overflow-hidden rounded-[24px] border border-[#D9C8B5] bg-[#FDF8F3] p-2.5 shadow-[0_22px_50px_rgba(32,24,18,0.12)] transition-transform duration-500 hover:-translate-y-1">
                  <div className="overflow-hidden rounded-[18px]">
                    <div className="aspect-[4/3.1] w-full">
                      <img
                        src={studioStory.sketchbookVisualUrl}
                        alt="Open architectural sketchbook showing botanical lotus line drawing and warm terracotta pigment waves"
                        className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between px-2 py-1 text-[11px] text-[#6E645D]">
                    <span className="font-semibold text-[#201C1A]">
                      Studio Concept Notebook
                    </span>
                    <span className="text-[#9B1C1C]">
                      Line, Tone &amp; Surface Relief
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =====================================================================
          SECTION 03 — OUR PHILOSOPHY (4 HORIZONTAL DESIGN PRINCIPLES)
          ===================================================================== */}
      <section
        aria-labelledby="about-philosophy-heading"
        className="relative bg-[#F8F3ED] pt-8 pb-16 lg:pt-10 lg:pb-20"
      >
        <Container>
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:items-center">
            {/* Left Heading (3.5 cols -> 3 cols on lg) */}
            <div className="lg:col-span-3">
              <div className="mb-2.5 flex items-center gap-3">
                <span className="h-[1.5px] w-7 bg-[#9B1C1C]" />
                <span className="text-[11px] font-bold tracking-[0.22em] text-[#9B1C1C] uppercase">
                  {philosophy.eyebrow}
                </span>
              </div>

              <h2
                id="about-philosophy-heading"
                className="font-serif text-[clamp(1.9rem,3vw,2.65rem)] leading-[1.08] font-normal tracking-[-0.02em] text-[#201C1A]"
              >
                The Principles <br />
                That <span className="italic text-[#73171B]">Guide Us.</span>
              </h2>
            </div>

            {/* Right 4 Principles Row (9 cols) */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-9 lg:grid-cols-4 lg:divide-x lg:divide-[#DED5CB]">
              {philosophy.themes.map((item) => (
                <article
                  key={item.code}
                  className="group flex flex-col items-start lg:px-5 first:lg:pl-0 last:lg:pr-0"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E5DACE] bg-[#FDF8F3] shadow-2xs transition-colors group-hover:border-[#9B1C1C]/40">
                    <PhilosophySvgIcon type={item.icon} />
                  </div>
                  <h3 className="font-serif text-[18.5px] leading-snug font-semibold text-[#201C1A] transition-colors group-hover:text-[#9B1C1C]">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[12.5px] leading-[1.55] text-[#6E645D]">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* =====================================================================
          SECTION 04 — THE ATELIER ADVANTAGE (WARM ARCHITECTURAL RIBBON)
          ===================================================================== */}
      <section
        aria-label="The ATELIER Advantage"
        className="relative overflow-hidden border-y border-[#DDD2C5] bg-[#EBE3D8] py-10 text-[#211D1A] lg:py-12"
      >
        <Container className="relative z-10">
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
            {/* Ribbon Eyebrow (2.5 cols -> 3 cols) */}
            <div className="lg:col-span-3">
              <div className="flex items-center gap-2.5">
                <span className="h-[1.5px] w-6 bg-[#9B1C1C]" />
                <span className="text-[11px] font-bold tracking-[0.22em] text-[#9B1C1C] uppercase">
                  {advantageRibbon.eyebrow}
                </span>
              </div>
            </div>

            {/* 4 Verified Studio Pillars (9 cols) */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-9 lg:grid-cols-4 lg:divide-x lg:divide-[#DDD2C5]">
              {advantageRibbon.items.map((item, idx) => {
                const Icon =
                  idx === 0
                    ? MapPin
                    : idx === 1
                      ? Layers
                      : idx === 2
                        ? Grid
                        : Users;
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 lg:px-4 first:lg:pl-0 last:lg:pr-0"
                  >
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#DDD2C5] bg-[#FBF8F3] text-[#9B1C1C] shadow-2xs">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-serif text-[17px] leading-snug font-medium text-[#211D1A]">
                        {item.title}
                      </h3>
                      <p className="mt-0.5 text-[11.5px] leading-[1.45] text-[#6F665E]">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

