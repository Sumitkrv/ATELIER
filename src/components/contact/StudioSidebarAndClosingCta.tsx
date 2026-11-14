"use client";

import React from "react";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Navigation,
  Phone,
  User,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import {
  ATELIER_BRAND,
  ATELIER_CONTACTS,
  buildWhatsAppUrl,
} from "@/lib/brand";
import { ATELIER_ASSET_REGISTRY } from "@/lib/asset-registry";
import { WhatsAppOutlineIcon } from "./ContactHeroAndCapabilities";

export const GOOGLE_MAPS_DIRECTIONS_URL =
  "https://www.google.com/maps/search/?api=1&query=%23410%2C+Reliable+Business+Centre%2C+Anand+Nagar%2C+Oshiwara%2C+Andheri+West%2C+Mumbai+400102";

interface StudioSidebarProps {
  dynamicWhatsAppMessage: string;
}

export function StudioInformationSidebar({
  dynamicWhatsAppMessage,
}: StudioSidebarProps) {
  return (
    <div className="space-y-5 sm:space-y-6">
      {/* ===================================================================
          PART F — MUMBAI STUDIO LOCATION CARD
          =================================================================== */}
      <div className="contact-cap-item relative overflow-hidden rounded-[24px] border border-[#DFD0C0] bg-[#FFFDF9] shadow-[0_18px_44px_-22px_rgba(32,22,14,0.11)]">
        {/* Decorative Right-Side Cove-Lit Plaster Arch & Trailing Botanical */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[43%] sm:block"
        >
          <Image
            src={ATELIER_ASSET_REGISTRY.contactLocationArchPlant.url}
            alt=""
            fill
            loading="lazy"
            quality={86}
            sizes="(min-width: 1024px) 240px, 280px"
            className="object-cover object-[58%_44%]"
          />
          <div className="absolute inset-y-0 left-0 w-[44%] bg-gradient-to-r from-[#FFFDF9] via-[#FFFDF9]/82 to-transparent" />
        </div>

        <div className="relative z-10 p-5.5 sm:max-w-[66%] sm:p-6.5 sm:pr-4">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.18em] text-[#9B1C1C] uppercase">
            <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            <span>MUMBAI STUDIO LOCATION</span>
          </div>

          <h3 className="mt-2 font-serif text-[25px] leading-[1.14] font-normal tracking-[-0.012em] text-[#1A1A1A] sm:text-[27px]">
            Oshiwara, Andheri West
          </h3>

          <address className="mt-2.5 text-[13.5px] leading-[1.6] text-[#5B524B] not-italic">
            {ATELIER_BRAND.address.line1},
            <br />
            Anand Nagar, Oshiwara,
            <br />
            Andheri West, Mumbai — 400102
          </address>

          <div className="mt-4.5">
            <a
              href={GOOGLE_MAPS_DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full border border-[#DFD0C0] bg-[#FAF6F0]/95 px-4.5 py-2 text-[12px] font-semibold tracking-[0.01em] text-[#1A1A1A] transition-[border-color,background-color,color] duration-200 hover:border-[#9B1C1C] hover:bg-[#FFFDF9] hover:text-[#9B1C1C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
            >
              <Navigation
                aria-hidden="true"
                className="h-3.5 w-3.5 shrink-0 text-[#9B1C1C]"
              />
              <span>Open Directions in Google Maps</span>
              <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            </a>
          </div>
        </div>
      </div>

      {/* ===================================================================
          PART G — OFFICIAL STUDIO CONTACTS CARD
          =================================================================== */}
      <div
        style={{ animationDelay: "0.08s" }}
        className="contact-cap-item rounded-[24px] border border-[#DFD0C0] bg-[#FFFDF9] p-5.5 shadow-[0_18px_44px_-22px_rgba(32,22,14,0.11)] sm:p-6"
      >
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.18em] text-[#9B1C1C] uppercase">
          <User aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          <span>OFFICIAL STUDIO CONTACTS</span>
        </div>

        <div className="mt-3.5 space-y-3">
          {ATELIER_CONTACTS.map((person) => {
            const whatsappPhone = person.phones.find((p) => p.isWhatsApp);
            return (
              <div
                key={person.name}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[#EAE0D3] bg-[#FAF6F0] px-4 py-3.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E8D5D0] bg-[#F6EAE6] text-[#9B1C1C]">
                    <User aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-serif text-[18px] leading-tight font-medium text-[#1A1A1A]">
                      {person.name}
                    </p>
                    <div className="mt-1 flex flex-col gap-y-0.5 text-[12px] font-medium text-[#463E38] xl:flex-row xl:flex-wrap xl:items-center xl:gap-x-2.5">
                      {person.phones.map((ph, pIdx) => (
                        <React.Fragment key={ph.telHref}>
                          {pIdx > 0 && (
                            <span
                              aria-hidden="true"
                              className="hidden text-[#C8B9A8] xl:inline"
                            >
                              •
                            </span>
                          )}
                          <a
                            href={ph.telHref}
                            className="inline-flex items-center gap-1 whitespace-nowrap transition-colors hover:text-[#9B1C1C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
                          >
                            <Phone
                              aria-hidden="true"
                              className="h-3 w-3 shrink-0 text-[#9B1C1C]"
                            />
                            <span>{ph.display}</span>
                          </a>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                {whatsappPhone?.whatsappDigits && (
                  <a
                    href={buildWhatsAppUrl(
                      whatsappPhone.whatsappDigits,
                      dynamicWhatsAppMessage
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`WhatsApp ${person.name} at ${whatsappPhone.display}`}
                    className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-full border border-[#DCBCB7] bg-[#FFFDF9] px-3.5 py-1.5 text-[11.5px] font-semibold text-[#9B1C1C] transition-[background-color,border-color,color] duration-200 hover:border-[#9B1C1C] hover:bg-[#9B1C1C] hover:text-[#FFFDF9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
                  >
                    <WhatsAppOutlineIcon className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===================================================================
          PART H — STUDIO CONSULTATION ARCHITECTURAL SHOWCASE IMAGE
          =================================================================== */}
      <div
        style={{ animationDelay: "0.14s" }}
        className="contact-cap-item overflow-hidden rounded-[24px] border border-[#DFD0C0] bg-[#FFFDF9] p-2 shadow-[0_18px_44px_-22px_rgba(32,22,14,0.12)]"
      >
        <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-[18px] bg-[#241B18]">
          <Image
            src={ATELIER_ASSET_REGISTRY.contactStudioDiningMural.url}
            alt={ATELIER_ASSET_REGISTRY.contactStudioDiningMural.altText}
            width={1376}
            height={768}
            loading="lazy"
            quality={88}
            sizes="(min-width: 1280px) 520px, (min-width: 1024px) 42vw, 94vw"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#16100E]/92 via-[#16100E]/52 to-transparent px-4.5 pt-12 pb-4">
            <p className="font-sans text-[10px] font-semibold tracking-[0.18em] text-[#EAD5CE] uppercase">
              ATELIER — WALL STORY • STUDIO SURFACE STUDY
            </p>
            <p className="mt-0.5 font-serif text-[17px] leading-snug text-[#FFFDF9] sm:text-[18px]">
              Bespoke Lotus Mural &amp; Multi-Surface Consultation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ContactClosingCtaProps {
  onScrollToForm: () => void;
  studioWhatsAppHref: string;
}

export function ContactClosingCta({
  onScrollToForm,
  studioWhatsAppHref,
}: ContactClosingCtaProps) {
  return (
    <section
      aria-labelledby="contact-closing-cta-heading"
      className="relative isolate overflow-hidden border-t border-[#E4D7C7] bg-[#F7F1E8] py-9 sm:py-11"
    >
      {/* Subtle Left Sunlit Botanical Shadow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 -z-10 hidden h-full w-[28%] opacity-28 lg:block"
        style={{
          background:
            "radial-gradient(90% 88% at 10% 45%, rgba(214,196,174,0.56) 0%, rgba(235,223,208,0.28) 50%, transparent 94%), linear-gradient(126deg, rgba(255,253,249,0.68) 0%, rgba(224,209,190,0.3) 48%, transparent 88%)",
        }}
      />

      {/* Subtle Right Architectural Plaster Curve */}
      <svg
        aria-hidden="true"
        viewBox="0 0 380 220"
        fill="none"
        className="pointer-events-none absolute right-0 bottom-0 -z-10 hidden h-full w-[320px] opacity-70 lg:block"
      >
        <path
          d="M380 18C268 24 176 92 142 220H380V18Z"
          fill="#EFE6DA"
          fillOpacity="0.65"
        />
        <path
          d="M380 18C268 24 176 92 142 220"
          stroke="#DFD0C0"
          strokeWidth="1.2"
        />
      </svg>

      <Container className="relative z-10 lg:px-6 xl:px-10">
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,0.31fr)_minmax(0,0.36fr)_auto] lg:gap-7 xl:gap-9">
          {/* Left Heading */}
          <div>
            <h2
              id="contact-closing-cta-heading"
              className="font-serif text-[32px] leading-[1.06] font-normal tracking-[-0.018em] text-[#1A1A1A] sm:text-[36px] xl:text-[40px]"
            >
              <span className="block sm:whitespace-nowrap">Have a Design</span>
              <em className="block font-serif italic font-normal text-[#9B1C1C]">
                in Mind?
              </em>
            </h2>
          </div>

          {/* Center Supporting Copy */}
          <div className="lg:border-l lg:border-[#DFD0C0] lg:pl-7">
            <p className="max-w-[44ch] text-[14px] leading-[1.64] text-[#5C534B] sm:text-[14.5px]">
              Share your idea, reference, or space details, and let’s explore
              the right wall-art solution for your project.
            </p>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-col gap-3 min-[440px]:flex-row min-[440px]:flex-wrap lg:justify-end">
            <button
              type="button"
              onClick={onScrollToForm}
              className="group inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-full bg-[#9B1C1C] px-5.5 py-2.5 text-[13px] font-semibold tracking-[0.01em] text-[#FFFDF9] shadow-[0_10px_24px_-8px_rgba(155,28,28,0.44)] transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:bg-[#7F1616] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
            >
              <span>Start a Project Enquiry</span>
              <ArrowRight
                aria-hidden="true"
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </button>

            <a
              href={studioWhatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[#DFD0C0] bg-[#FFFDF9] px-5 py-2.5 text-[13px] font-semibold tracking-[0.01em] text-[#1A1A1A] transition-[border-color,background-color,color,transform] duration-200 hover:-translate-y-0.5 hover:border-[#9B1C1C] hover:text-[#9B1C1C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
            >
              <WhatsAppOutlineIcon className="h-3.5 w-3.5 text-[#9B1C1C]" />
              <span>WhatsApp Our Studio</span>
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
