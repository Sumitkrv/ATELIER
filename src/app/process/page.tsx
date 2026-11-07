"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Box,
  Compass,
  Layers,
  CheckCircle2,
  MessageCircle,
  PenTool,
  Play,
  Printer,
  Sparkles,
  Ruler,
  MapPin,
  Image as ImageIcon,
  Calendar,
} from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";
import { Container } from "@/components/layout/Container";
import { ProcessPolaroidJourney } from "@/components/process/ProcessPolaroidJourney";
import {
  ATELIER_CONTACTS,
  ATELIER_WHATSAPP_NUMBERS,
  buildWhatsAppUrl,
} from "@/lib/brand";
import { cn } from "@/lib/cn";

const HERO_PROCESS_MILESTONES = [
  {
    number: "01",
    label: "Consult",
    subtitle: "Understand your space and vision",
    icon: MessageCircle,
  },
  {
    number: "02",
    label: "Design",
    subtitle: "Curate artwork and compositions",
    icon: PenTool,
  },
  {
    number: "03",
    label: "Customize",
    subtitle: "Fine-tune materials, scale, and color",
    icon: Layers,
  },
  {
    number: "04",
    label: "Approve",
    subtitle: "Confirm final proof and surface prep",
    icon: CheckCircle2,
  },
  {
    number: "05",
    label: "Print",
    subtitle: "Direct-to-surface print with a refined finish",
    icon: Printer,
  },
] as const;

const CONSULTATION_CHECKLIST = [
  {
    icon: Layers,
    label: "Surface Type",
    detail: "Walls, Tiles, Plywood, Office Blinds, Metals, or Glass.",
  },
  {
    icon: Ruler,
    label: "Approximate Wall Dimensions",
    detail: "Rough width and height of the target elevation.",
  },
  {
    icon: MapPin,
    label: "Project Location",
    detail: "Neighbourhood or site address in Mumbai & beyond.",
  },
  {
    icon: ImageIcon,
    label: "Reference Images",
    detail: "A quick phone photo of your room or wall surface.",
  },
  {
    icon: Sparkles,
    label: "Preferred Design Style",
    detail: "Botanical, Textured, Architectural, Mineral, Abstract, or custom.",
  },
  {
    icon: Calendar,
    label: "Intended Project Timeline",
    detail: "When your interior space will be ready for printing.",
  },
] as const;

export default function ProcessPage() {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const handleSelectStage = useCallback(
    (index: number, scrollToExplorer: boolean = false) => {
      setActiveIndex(index);
      if (scrollToExplorer && typeof window !== "undefined") {
        const el =
          document.getElementById("process-journey") ||
          document.getElementById("stage-explorer");
        if (el) {
          const prefersReducedMotion =
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          el.scrollIntoView({
            behavior: prefersReducedMotion ? "auto" : "smooth",
            block: "start",
          });
        }
      }
    },
    []
  );

  const handleExploreProcessClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const el =
        document.getElementById("process-journey") ||
        document.getElementById("stage-explorer");
      if (!el) return;
      e.preventDefault();
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    },
    []
  );

  const whatsappHref = buildWhatsAppUrl(
    ATELIER_WHATSAPP_NUMBERS[0].digits,
    "Hello ATELIER — WALL STORY, I would like to discuss the process for a wall or surface printing project."
  );

  return (
    <PublicShell>
      <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A]">
        {/* ================================================================
            SECTION 01 — LUXURY ARCHITECTURAL HERO ("FROM IDEA TO WALL")
            ================================================================ */}
        <section
          aria-labelledby="process-hero-heading"
          className="relative overflow-hidden border-b border-[#DED5CB] bg-[#F5EFE6] lg:flex lg:min-h-[clamp(640px,calc(100svh-var(--navbar-height,74px)),860px)] lg:flex-col lg:justify-between"
        >
          {/* Subtle architectural compass contour arcs in upper-left background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-28 left-[18%] hidden h-[540px] w-[540px] rounded-full border border-[#DFD4C6]/75 lg:block"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 left-[23%] hidden h-[430px] w-[430px] rounded-full border border-[#DFD4C6]/55 lg:block"
          />

          {/* Upper Split Stage: Left Editorial Copy + Right Uncropped Room Interior */}
          <div className="relative lg:flex lg:flex-1 lg:items-center">
            {/* 1–4. LEFT EDITORIAL CONTENT (First in DOM for semantic mobile-first order) */}
            <Container className="relative z-10 w-full">
              <div className="flex flex-col justify-center pt-8 pb-6 sm:pt-11 sm:pb-8 lg:w-[43%] lg:max-w-[500px] lg:py-10 xl:w-[41%] xl:max-w-[520px]">
                {/* Eyebrow */}
                <div className="inline-flex items-center gap-3">
                  <span className="h-[1.5px] w-7 bg-[#9B1C1C]" />
                  <span className="text-[11px] font-bold tracking-[0.22em] text-[#9B1C1C] uppercase">
                    THE ATELIER PROCESS
                  </span>
                </div>

                {/* Main Editorial Headline */}
                <h1
                  id="process-hero-heading"
                  className="mt-4 font-serif text-[clamp(2.05rem,4.45vw,4.25rem)] leading-[1.04] font-semibold tracking-[-0.02em] text-[#1A1A1A] min-[360px]:text-[clamp(2.3rem,4.45vw,4.25rem)] sm:text-[clamp(2.5rem,4.45vw,4.25rem)]"
                >
                  <span className="block whitespace-nowrap">
                    From Idea to Wall,
                  </span>
                  <span className="block whitespace-nowrap">A Thoughtful</span>
                  <em className="block font-serif italic font-semibold text-[#9B1C1C]">
                    Process.
                  </em>
                </h1>

                {/* Supporting Paragraph */}
                <p className="mt-4 max-w-[460px] text-[15px] leading-[1.68] text-[#4E4640] sm:text-[15.5px]">
                  From the first conversation to the final printed detail,
                  discover the thoughtful process behind every ATELIER wall
                  story.
                </p>

                {/* Primary & Secondary CTA Buttons */}
                <div className="mt-7 flex flex-col gap-3 min-[430px]:flex-row min-[430px]:flex-wrap min-[430px]:items-center min-[430px]:gap-3.5">
                  <a
                    href="#process-journey"
                    onClick={handleExploreProcessClick}
                    className="group inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#9B1C1C] px-6 text-[13.5px] font-medium tracking-[0.01em] text-[#FAF9F6] shadow-[0_10px_24px_-8px_rgba(155,28,28,0.5)] transition-all duration-200 hover:bg-[#7F1616] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C] min-[430px]:w-auto"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#FAF9F6]/45 text-[#FAF9F6]">
                      <Play className="h-2.5 w-2.5 translate-x-[0.5px] fill-current" />
                    </span>
                    <span>Explore the Process</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </a>

                  <Link
                    href="/contact?intent=process"
                    className="group inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-[#D4C5B4] bg-[#FAF9F6]/90 px-5 text-[13.5px] font-medium tracking-[0.01em] text-[#1A1A1A] shadow-2xs backdrop-blur-xs transition-all duration-200 hover:border-[#9B1C1C] hover:bg-[#FAF9F6] hover:text-[#9B1C1C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C] min-[430px]:w-auto"
                  >
                    <Box className="h-4 w-4 text-[#1A1A1A] transition-colors group-hover:text-[#9B1C1C]" />
                    <span>Start Your Project</span>
                  </Link>
                </div>
              </div>
            </Container>

            {/* 5. RIGHT ARCHITECTURAL INTERIOR PHOTOGRAPHY (Crisp 1357/708 room region above the 5-stage bar so sofa, coffee table & rug are never covered and bottom blur strip is clipped) */}
            <div className="relative w-full aspect-[1357/708] min-h-[235px] overflow-hidden lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:h-full lg:w-[70%] xl:w-[72%]">
              <Image
                src="/images/atelier/process-hero-idea-to-wall.jpg"
                alt="Sunlit luxury living room framed by a sculptural cream plaster archway featuring a bespoke terracotta, sandstone, and muted olive botanical arch mural behind a curved bouclé sofa"
                width={1357}
                height={868}
                priority
                unoptimized
                sizes="(max-width: 1023px) 100vw, 72vw"
                className="h-[122.6%] w-full max-w-none object-cover object-[64%_0%] lg:object-[66%_0%] xl:object-[64%_0%]"
              />

              {/* Seamless left-to-right warm ivory gradient blend into editorial canvas */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 hidden w-40 bg-gradient-to-r from-[#F5EFE6] via-[#F5EFE6]/84 via-45% to-transparent lg:block xl:w-52"
              />

              {/* Mobile/Tablet top feather blend from editorial copy into room photography */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#F5EFE6] via-[#F5EFE6]/45 to-transparent lg:hidden"
              />
            </div>
          </div>

          {/* 6. SIGNATURE FIVE-STAGE PROCESS BAR (Docked cleanly below the room stage so furniture & floor have full breathing room) */}
          <Container className="relative z-20 pb-6 pt-3 sm:pb-7 lg:pb-7 lg:pt-3">
            <nav
              aria-label="Five-stage process milestone shortcuts"
              className="rounded-[22px] border border-[#DFD4C6] bg-[#F6F0E7]/92 px-5 py-4 shadow-[0_18px_46px_-18px_rgba(26,20,16,0.16)] backdrop-blur-md sm:px-7 sm:py-5 lg:px-8 lg:py-5"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-3">
                {HERO_PROCESS_MILESTONES.map((milestone, idx) => {
                  const Icon = milestone.icon;
                  const isSelected = activeIndex === idx;
                  const isLast = idx === HERO_PROCESS_MILESTONES.length - 1;

                  return (
                    <div
                      key={milestone.number}
                      className="relative flex items-center"
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectStage(idx, true)}
                        aria-current={isSelected ? "step" : undefined}
                        aria-label={`Stage ${milestone.number} — ${milestone.label}: ${milestone.subtitle}`}
                        className="group flex w-full cursor-pointer items-center gap-3.5 rounded-xl py-1 text-left transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9B1C1C]"
                      >
                        {/* Circular Crimson Milestone Icon */}
                        <span
                          className={cn(
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-all duration-200",
                            isSelected
                              ? "border-[#9B1C1C] bg-[#FAF9F6] text-[#9B1C1C] shadow-[0_4px_12px_rgba(155,28,28,0.18)] ring-2 ring-[#9B1C1C]/15"
                              : "border-[#DED2C3] bg-[#FAF9F6]/90 text-[#9B1C1C] group-hover:border-[#9B1C1C]/65 group-hover:bg-[#FAF9F6]"
                          )}
                        >
                          <Icon className="h-4 w-4 stroke-[1.75]" />
                        </span>

                        {/* Milestone Number, Title & Subtitle */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-2">
                            <span className="font-sans text-[14.5px] font-bold tracking-[0.02em] text-[#9B1C1C]">
                              {milestone.number}
                            </span>
                            <span
                              className={cn(
                                "font-serif text-[20px] leading-tight font-semibold tracking-[-0.01em] transition-colors",
                                isSelected
                                  ? "text-[#1A1A1A] underline decoration-[#9B1C1C]/65 decoration-1 underline-offset-4"
                                  : "text-[#1A1A1A] group-hover:text-[#9B1C1C]"
                              )}
                            >
                              {milestone.label}
                            </span>
                          </div>

                          <p className="mt-1 max-w-[19ch] text-[12px] leading-[1.38] text-[#5C534C]">
                            {milestone.subtitle}
                          </p>
                        </div>
                      </button>

                      {/* Thin Horizontal Connecting Line between Milestones on Desktop */}
                      {!isLast && (
                        <span
                          aria-hidden="true"
                          className="pointer-events-none mx-2 hidden h-[1px] w-6 shrink-0 bg-[#D7C9B8] lg:block xl:w-8"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </nav>
          </Container>
        </section>

        {/* Hanging Polaroid Process Gallery (Synchronized with Hero Milestones) */}
        <ProcessPolaroidJourney
          activeIndex={activeIndex}
          onSelectStage={(idx) => handleSelectStage(idx, false)}
        />

        {/* Consultation Preparation Checklist */}
        <section
          aria-labelledby="consultation-prep-heading"
          className="border-b border-[#DED5CB] bg-[#F8F3ED] py-14 lg:py-18"
        >
          <Container>
            <div className="grid grid-cols-1 items-center gap-8 rounded-[28px] border border-[#DED5CB] bg-[#FAF9F6] p-6 shadow-[0_16px_40px_rgba(32,28,26,0.05)] sm:p-8 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-7">
                <div className="mb-2.5 flex items-center gap-3">
                  <span className="h-[1.5px] w-7 bg-[#9B1C1C]" />
                  <span className="text-[11px] font-bold tracking-[0.22em] text-[#9B1C1C] uppercase">
                    PREPARING FOR STAGE 01
                  </span>
                </div>

                <h2
                  id="consultation-prep-heading"
                  className="font-serif text-[clamp(1.9rem,3vw,2.65rem)] leading-[1.1] font-normal text-[#1A1A1A]"
                >
                  What to Share for Your{" "}
                  <span className="italic text-[#9B1C1C]">First Brief</span>
                </h2>

                <p className="mt-2.5 max-w-[52ch] text-[14px] leading-[1.65] text-[#655B54]">
                  Sharing a few simple details helps our Mumbai studio recommend
                  the right surface preparation, artwork scale, and execution
                  approach from our very first conversation.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  {CONSULTATION_CHECKLIST.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="flex items-start gap-3 rounded-xl border border-[#E5DACE] bg-[#F8F3ED] p-3.5"
                      >
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#9B1C1C]/10 text-[#9B1C1C]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-[13px] font-bold text-[#1A1A1A]">
                              {item.label}
                            </h3>
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#9B1C1C]" />
                          </div>
                          <p className="mt-0.5 text-[11.5px] leading-[1.45] text-[#6E645D]">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="relative overflow-hidden rounded-[22px] border border-[#DED5CB] bg-[#1A1A1A] shadow-md">
                  <div className="aspect-[4/3.2] w-full">
                    <img
                      src="/images/atelier/process-stage-01-consultation.jpg"
                      alt="Architectural consultation table with material swatches, sketches, and surface samples"
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="border-t border-[#DED5CB] bg-[#F8F3ED] px-4 py-3 text-[12px] text-[#5C534C]">
                    <strong className="font-semibold text-[#1A1A1A]">
                      Oshiwara Studio Desk:
                    </strong>{" "}
                    Reviewing wall plaster, ceramic tile, birch plywood, blind
                    fabric, metal, and glass samples alongside elevation briefs.
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* ================================================================
            SECTION 05 — START YOUR WALL STORY
            ("Your Space. Your Vision. Our Next Creation.")
            ================================================================ */}
        <section
          aria-labelledby="process-final-cta-heading"
          className="relative overflow-hidden border-t border-[#DDD2C5] bg-[#EBE3D8] py-16 text-[#211D1A] lg:py-20"
        >
          <Container className="relative z-10">
            <div className="grid grid-cols-1 items-center gap-8 rounded-[28px] border border-[#DDD2C5] bg-[#FBF8F3] p-8 shadow-[0_22px_50px_rgba(33,29,26,0.08)] sm:p-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="h-[1.5px] w-7 bg-[#9B1C1C]" />
                  <span className="text-[11px] font-bold tracking-[0.22em] text-[#9B1C1C] uppercase">
                    START YOUR WALL STORY
                  </span>
                </div>

                <h2
                  id="process-final-cta-heading"
                  className="font-serif text-[clamp(2rem,3.6vw,3.25rem)] leading-[1.06] font-normal text-[#211D1A]"
                >
                  Your Space. Your Vision.{" "}
                  <span className="italic text-[#9B1C1C]">
                    Our Next Creation.
                  </span>
                </h2>

                <p className="mt-3.5 max-w-[54ch] text-[15px] leading-[1.68] text-[#6F665E]">
                  Tell us about your wall, your preferred artwork, and the story
                  you want your space to express.
                </p>

                {/* Studio Contacts Pill Bar */}
                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-[#6F665E]">
                  {ATELIER_CONTACTS.map((person) => (
                    <div key={person.name} className="flex items-center gap-2">
                      <span className="font-semibold text-[#211D1A]">
                        {person.name}:
                      </span>
                      <span>
                        {person.phones.map((p) => p.display).join(" / ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Primary & Secondary CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 lg:col-span-5 lg:justify-end">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-[#9B1C1C] px-6 py-3.5 text-[12px] font-bold tracking-[0.16em] text-[#FAF9F6] uppercase shadow-md transition-all hover:bg-[#7F1616]"
                >
                  <span>START YOUR PROJECT</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <Link
                  href="/explore-designs"
                  className="inline-flex items-center gap-2 rounded-full border border-[#DDD2C5] bg-[#F2EBE2] px-6 py-3.5 text-[12px] font-bold tracking-[0.16em] text-[#211D1A] uppercase transition-all hover:border-[#9B1C1C] hover:bg-[#F6EAE6]"
                >
                  <Compass className="h-4 w-4 text-[#9B1C1C]" />
                  <span>EXPLORE DESIGNS</span>
                </Link>

                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[#DDD2C5] bg-[#FBF8F3] px-4 py-3 text-[11.5px] font-semibold tracking-[0.12em] text-[#211D1A] uppercase transition-colors hover:border-[#9B1C1C] hover:bg-[#F6EAE6]"
                >
                  <MessageCircle className="h-4 w-4 text-[#9B1C1C]" />
                  <span>WhatsApp Studio</span>
                </a>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </PublicShell>
  );
}
