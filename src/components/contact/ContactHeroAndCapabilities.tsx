"use client";

import { usePageContent } from "@/components/layout/PublicContentProvider";
import React from "react";
import Image from "next/image";
import { ArrowRight, Box, Layers, MessageSquare, Send, Zap } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { ATELIER_ASSET_REGISTRY } from "@/lib/asset-registry";

export function WhatsAppOutlineIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </svg>
  );
}

const CAPABILITY_HIGHLIGHTS: ReadonlyArray<{
  id: string;
  title: string;
  description: string;
  icon: "consultation" | "surfaces" | "artwork" | "support";
}> = [
  {
    id: "design-consultation",
    title: "Design Consultation",
    description: "Discuss your space, surfaces, and creative ideas.",
    icon: "consultation",
  },
  {
    id: "multi-surface-expertise",
    title: "Multi-Surface Expertise",
    description: "Walls, tiles, plywood, blinds, metals, and glass.",
    icon: "surfaces",
  },
  {
    id: "custom-artwork-solutions",
    title: "Custom Artwork Solutions",
    description: "From curated designs to bespoke visual stories.",
    icon: "artwork",
  },
  {
    id: "mumbai-studio-support",
    title: "Mumbai Studio Support",
    description: "Work directly with our local team in Oshiwara.",
    icon: "support",
  },
];

function CapabilityIcon({
  type,
}: {
  type: "consultation" | "surfaces" | "artwork" | "support";
}) {
  switch (type) {
    case "consultation":
      return (
        <MessageSquare
          aria-hidden="true"
          className="h-[18px] w-[18px] stroke-[1.7] text-[#9B1C1C]"
        />
      );
    case "surfaces":
      return (
        <Layers
          aria-hidden="true"
          className="h-[18px] w-[18px] stroke-[1.7] text-[#9B1C1C]"
        />
      );
    case "artwork":
      return (
        <Box
          aria-hidden="true"
          className="h-[18px] w-[18px] stroke-[1.7] text-[#9B1C1C]"
        />
      );
    case "support":
      return (
        <Zap
          aria-hidden="true"
          className="h-[18px] w-[18px] stroke-[1.7] text-[#9B1C1C]"
        />
      );
  }
}

interface ContactHeroAndCapabilitiesProps {
  onScrollToForm: () => void;
  studioWhatsAppHref: string;
}

export function ContactHeroAndCapabilities({
  onScrollToForm,
  studioWhatsAppHref,
}: ContactHeroAndCapabilitiesProps) {
  const page = usePageContent("contact");
  return (
    <>
      {/* ===================================================================
          PART A — PREMIUM ARCHITECTURAL CONTACT HERO
          =================================================================== */}
      <section
        id="contact-hero"
        aria-labelledby="contact-hero-heading"
        className="relative isolate overflow-hidden border-b border-[#E5D9CA] bg-[#F7F1E8] pt-8 pb-8 sm:pt-10 sm:pb-10 md:py-12 lg:py-14 xl:py-16"
      >
        <style>{`
          @media (prefers-reduced-motion: no-preference) {
            @keyframes contactFadeUp {
              from {
                opacity: 0.01;
                transform: translate3d(0, 10px, 0);
              }
              to {
                opacity: 1;
                transform: translate3d(0, 0, 0);
              }
            }
            @keyframes contactHeroBgIn {
              from {
                opacity: 0.88;
                transform: scale(1.015);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
            #contact-hero .contact-hero-bg {
              animation: contactHeroBgIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
            }
            #contact-hero .contact-reveal-1 {
              animation: contactFadeUp 0.58s cubic-bezier(0.22, 1, 0.36, 1) 0.03s both;
            }
            #contact-hero .contact-reveal-2 {
              animation: contactFadeUp 0.58s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
            }
            #contact-hero .contact-reveal-3 {
              animation: contactFadeUp 0.58s cubic-bezier(0.22, 1, 0.36, 1) 0.17s both;
            }
            .contact-cap-item {
              animation: contactFadeUp 0.56s cubic-bezier(0.22, 1, 0.36, 1) both;
            }
          }
        `}</style>

        {/* Subtle Upper-Left Sunlit Plaster Ambient Wash */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 -z-10 hidden h-full w-[38%] opacity-30 md:block"
          style={{
            background:
              "radial-gradient(92% 88% at 12% 20%, rgba(214,196,174,0.6) 0%, rgba(235,223,208,0.32) 52%, transparent 95%), linear-gradient(128deg, rgba(255,253,249,0.72) 0%, rgba(224,209,190,0.32) 48%, transparent 88%)",
          }}
        />

        {/* Tablet & Desktop Right-Dominant Architectural Lotus Arch Scene */}
        <div
          aria-hidden="true"
          className="contact-hero-bg pointer-events-none absolute inset-y-0 right-0 -z-10 hidden md:block md:w-[66%] lg:w-[64%] xl:w-[62%]"
        >
          <Image
            src={page?.hero.posterImage?.secureUrl || ATELIER_ASSET_REGISTRY.contactHeroLotusArch.url}
            alt=""
            fill
            priority
            quality={92}
            sizes="(min-width: 1280px) 62vw, 66vw"
            className="object-cover object-[74%_44%] lg:object-[72%_42%]"
          />
          {/* Smooth Cream-to-Image Editorial Transition on Left (keeps vase & lotus crisp) */}
          <div className="absolute inset-y-0 left-0 w-[42%] bg-gradient-to-r from-[#F7F1E8] via-[#F7F1E8]/74 via-42% to-transparent lg:w-[34%]" />
        </div>

        <Container className="relative z-10 lg:px-6 xl:px-10">
          <div className="max-w-[540px] md:max-w-[490px] lg:max-w-[580px]">
            {/* 1. Eyebrow & Editorial Serif Heading */}
            <div className="contact-reveal-1">
              <div className="inline-flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-[1.5px] w-7 shrink-0 bg-[#9B1C1C]"
                />
                <span className="font-sans text-[11px] font-bold tracking-[0.22em] text-[#9B1C1C] uppercase">
                  {page?.hero.eyebrow || "ATELIER — WALL STORY"}
                </span>
              </div>

              <h1
                id="contact-hero-heading"
                className="mt-3.5 font-serif text-[clamp(2.2rem,3.95vw,3.65rem)] leading-[1.06] font-normal tracking-[-0.022em] text-[#1A1A1A] sm:mt-4"
              >
                <span className="block">{page?.hero.heading || "Let’s Create"}</span><em className="mt-0.5 block text-[#9B1C1C]">{page?.hero.highlightedText || "Something Remarkable."}</em>
              </h1>
            </div>

            {/* 2. Supporting Description */}
            <p className="contact-reveal-2 mt-4 max-w-[46ch] text-[14.5px] leading-[1.66] text-[#5B524B] sm:text-[15.25px]">
              {page?.hero.subheading || "Tell us about your space, surface, your ideas, and the wall story you want to create. Our Mumbai studio will get in touch with you soon."}
            </p>

            {/* 3. Hero CTA Buttons */}
            <div className="contact-reveal-3 mt-6 flex flex-col gap-3 min-[430px]:flex-row min-[430px]:flex-wrap min-[430px]:items-center sm:mt-7 sm:gap-3.5">
              <button
                type="button"
                onClick={onScrollToForm}
                className="group inline-flex min-h-[46px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-[#9B1C1C] px-6 py-2.5 text-[13px] font-semibold tracking-[0.01em] text-[#FFFDF9] shadow-[0_12px_26px_-8px_rgba(155,28,28,0.44)] transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:bg-[#7F1616] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#9B1C1C] min-[430px]:w-auto"
              >
                <Send aria-hidden="true" className="h-3.5 w-3.5" />
                <span>{page?.hero.primaryCta.label || "Start a Project Enquiry"}</span>
                <ArrowRight
                  aria-hidden="true"
                  className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </button>

              <a
                href={page?.hero.secondaryCta.href || studioWhatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full border border-[#DFD0C0] bg-[#FFFDF9]/95 px-5.5 py-2.5 text-[13px] font-semibold tracking-[0.01em] text-[#1A1A1A] shadow-[0_6px_18px_-8px_rgba(26,20,16,0.12)] transition-[border-color,background-color,color,transform] duration-200 hover:-translate-y-0.5 hover:border-[#9B1C1C]/65 hover:bg-[#FFFDF9] hover:text-[#9B1C1C] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#9B1C1C] min-[430px]:w-auto"
              >
                <WhatsAppOutlineIcon className="h-4 w-4 text-[#9B1C1C]" />
                <span>{page?.hero.secondaryCta.label || "WhatsApp Our Studio"}</span>
              </a>
            </div>
          </div>

          {/* 4. Mobile (< 768px) Architectural Lotus Arch Image Directly Below Buttons */}
          <div className="mt-6 overflow-hidden rounded-[20px] border border-[#DFD0C0] bg-[#EFE6DA] shadow-[0_16px_36px_-18px_rgba(32,22,14,0.18)] md:hidden">
            <div className="relative aspect-[16/10] w-full">
              <Image
                src={page?.hero.posterImage?.secureUrl || ATELIER_ASSET_REGISTRY.contactHeroLotusArch.url}
                alt={ATELIER_ASSET_REGISTRY.contactHeroLotusArch.altText}
                fill
                priority
                quality={88}
                sizes="94vw"
                className="object-cover object-[74%_42%]"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* ===================================================================
          PART B — STUDIO CAPABILITY STRIP (FOUR COMPACT HIGHLIGHTS)
          =================================================================== */}
      <section
        aria-label="Studio capabilities"
        className="border-b border-[#E5D9CA] bg-[#FAF6F0] py-5 sm:py-6"
      >
        <Container className="lg:px-6 xl:px-10">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-x-7 sm:gap-y-5 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-[#E3D6C6]">
            {CAPABILITY_HIGHLIGHTS.map((item, idx) => (
              <div
                key={item.id}
                style={{ animationDelay: `${0.06 + idx * 0.05}s` }}
                className={`contact-cap-item flex items-start gap-3.5 ${
                  idx === 0
                    ? "lg:pr-5 xl:pr-6"
                    : idx === CAPABILITY_HIGHLIGHTS.length - 1
                      ? "lg:pl-5 xl:pl-6"
                      : "lg:px-5 xl:px-6"
                }`}
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#EADAD3] bg-[#F6ECE6]">
                  <CapabilityIcon type={item.icon} />
                </span>
                <div className="min-w-0">
                  <h2 className="font-serif text-[17.5px] leading-[1.2] font-semibold tracking-[-0.01em] text-[#1A1A1A] xl:text-[18.5px]">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-[12.5px] leading-[1.45] text-[#746B64]">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
