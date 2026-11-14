"use client";
/* eslint-disable @next/next/no-img-element */

import React from "react";
import Link from "next/link";
import { ArrowRight, Box, Compass } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { FadeUp } from "@/components/motion/Reveal";
import { PeopleSection } from "@/components/about/PeopleSection";
import { CreativeEvolutionSection } from "@/components/about/CreativeEvolutionSection";

export function StudioPeopleAndJourney() {
  return (
    <>
      <PeopleSection />

      {/* =====================================================================
          SECTION 06 — OUR CREATIVE EVOLUTION ("A GROWING WALL STORY.")
          Card-free luxury architectural editorial timeline with sculpted alcove
          ===================================================================== */}
      <CreativeEvolutionSection />

      {/* =====================================================================
          SECTION 07 — BEYOND THE WALL (CONCISE VISUALIZER & CATALOGUE TEASER)
          ===================================================================== */}
      <section
        aria-labelledby="beyond-the-wall-heading"
        className="border-b border-[#DED5CB] bg-[#F8F3ED] py-12 lg:py-16"
      >
        <Container className="lg:px-6 xl:px-10">
          <FadeUp className="grid grid-cols-1 items-center gap-8 rounded-[28px] border border-[#DED5CB] bg-[#FDF8F3] p-6 shadow-[0_16px_40px_rgba(32,24,18,0.05)] sm:p-8 lg:grid-cols-12">
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
                    src="/images/atelier/about-harmony-botanical-after.jpg"
                    alt="After: The same sunlit wall transformed with a bespoke botanical mural"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <div className="bg-[#F8F3ED] px-3 py-2 text-[11px] font-semibold text-[#9B1C1C]">
                    02 • Proportioned Mural Preview
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
        </Container>
      </section>
    </>
  );
}

