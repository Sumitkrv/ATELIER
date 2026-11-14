"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, MapPin, MessageCircle, Phone } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { ABOUT_PAGE_CONTENT } from "@/lib/blogs-catalogue";
import {
  ATELIER_BRAND,
  ATELIER_CONTACTS,
  BrandContactPerson,
  buildWhatsAppUrl,
} from "@/lib/brand";

const EDITORIAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const GOOGLE_MAPS_DIRECTIONS_URL =
  "https://www.google.com/maps/search/?api=1&query=%23410%2C+Reliable+Business+Centre%2C+Anand+Nagar%2C+Oshiwara%2C+Andheri+West%2C+Mumbai+400102";

function BullseyeTargetIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5 text-[#9B1C1C]"
    >
      <circle
        cx="12"
        cy="12"
        r="8.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="12"
        cy="12"
        r="4.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

function PeopleEnvironment() {
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
            "linear-gradient(180deg, #FBF7F1 0%, #FAF5ED 64%, #F7F0E6 100%)",
        }}
      />

      {/* Soft Upper-Left Botanical Leaf Shadow */}
      <div
        className="absolute top-0 left-0 hidden h-[240px] w-[26%] opacity-26 lg:block"
        style={{
          background:
            "radial-gradient(90% 86% at 10% 14%, rgba(214,196,174,0.55) 0%, rgba(235,223,208,0.28) 48%, transparent 92%), linear-gradient(128deg, rgba(255,253,249,0.68) 0%, rgba(224,209,190,0.3) 44%, transparent 86%)",
        }}
      />

      {/* Subtle Section-Clipped Architectural Curve */}
      <svg
        viewBox="0 0 1450 540"
        fill="none"
        preserveAspectRatio="none"
        className="h-full w-full opacity-65"
      >
        <path
          d="M 1480 430 C 1340 420, 1245 468, 1180 540"
          stroke="#E2D5C5"
          strokeWidth="1.15"
        />
      </svg>
    </div>
  );
}

function PeopleIntro({
  eyebrow,
  supportingText,
}: {
  eyebrow: string;
  supportingText: string;
}) {
  return (
    <div>
      <div className="inline-flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="h-[1.5px] w-6 shrink-0 bg-[#9B1C1C]"
        />
        <span className="text-[10.5px] font-bold tracking-[0.2em] text-[#9B1C1C] uppercase">
          {eyebrow}
        </span>
      </div>

      <h2
        id="people-behind-atelier-heading"
        className="mt-2.5 font-serif text-[clamp(2.1rem,2.75vw,2.65rem)] font-normal leading-[1.06] tracking-[-0.022em] text-[#1A1A1A]"
      >
        <span className="block sm:whitespace-nowrap">The People</span>{" "}
        <span className="mt-0.5 block sm:whitespace-nowrap">
          Behind{" "}
          <em className="font-serif italic font-normal text-[#9B1C1C]">
            ATELIER.
          </em>
        </span>
      </h2>

      <p className="mt-3.5 max-w-[38ch] text-[13.5px] leading-[1.64] text-[#5C534C] sm:text-[13.75px]">
        {supportingText}
      </p>
    </div>
  );
}

function MissionCard({
  heading,
  description,
}: {
  heading: string;
  description: string;
}) {
  return (
    <div className="mt-5 rounded-[20px] border border-[#DFD0C0] bg-[#FFFDF9] p-4 shadow-[0_12px_28px_-18px_rgba(34,24,16,0.12)] md:mt-0 xl:mt-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#EAE0D3] bg-[#F6EFE6]">
          <BullseyeTargetIcon />
        </span>

        <div className="min-w-0">
          <h3 className="text-[10.5px] font-bold tracking-[0.18em] text-[#9B1C1C] uppercase">
            {heading}
          </h3>
          <p className="mt-1.5 text-[12px] leading-[1.55] text-[#5C534C]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function StudioRepresentativeCard({
  person,
  workspace,
  index,
  revealVisible,
}: {
  person: BrandContactPerson;
  workspace: {
    imageUrl: string;
    shortRole: string;
    alt: string;
  };
  index: number;
  revealVisible: boolean;
}) {
  const primaryPhone = person.phones[0];
  const whatsappPhone = person.phones.find(
    (phone) => phone.isWhatsApp && phone.whatsappDigits
  );

  const enquiryHref = `/contact?interest=${encodeURIComponent(
    "Custom Multi-Surface Consultation"
  )}&title=${encodeURIComponent(`Consultation — ${person.name}`)}`;

  return (
    <motion.article
      initial={false}
      animate={revealVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      transition={{
        duration: 0.54,
        delay: 0.08 + index * 0.07,
        ease: EDITORIAL_EASE,
      }}
      className="group flex h-full flex-col justify-between rounded-[22px] border border-[#DFD0C0] bg-[#FFFDF9] p-3.5 shadow-[0_14px_32px_-18px_rgba(34,24,16,0.13)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#CBB59D] hover:shadow-[0_20px_38px_-15px_rgba(34,24,16,0.2)]"
    >
      <div>
        <div className="relative aspect-[4/3.05] w-full overflow-hidden rounded-[16px] bg-[#EAE0D3]">
          <Image
            src={workspace.imageUrl}
            alt={workspace.alt}
            fill
            sizes="(min-width: 1280px) 280px, (min-width: 768px) 44vw, 90vw"
            quality={92}
            className="object-cover object-[50%_28%] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        </div>

        <div className="mt-3.5 px-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-serif text-[21px] font-semibold leading-[1.15] text-[#1A1A1A] transition-colors duration-300 group-hover:text-[#9B1C1C] 2xl:text-[22px]">
                {person.name}
              </h3>
              <p className="mt-1 text-[10px] font-bold leading-[1.4] tracking-[0.13em] text-[#9B1C1C] uppercase">
                {workspace.shortRole}
              </p>
            </div>

            <Link
              href={enquiryHref}
              aria-label={`Start a studio consultation enquiry with ${person.name}`}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#DFD0C0] bg-[#FAF6F0] text-[#9B1C1C] transition-all duration-300 hover:border-[#9B1C1C] hover:bg-[#9B1C1C] hover:text-[#FFFDF9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-[#EAE0D3] px-0.5 pt-3">
        <div className="flex items-center justify-between gap-1.5">
          {primaryPhone && (
            <a
              href={primaryPhone.telHref}
              className="inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] font-semibold tabular-nums text-[#1A1A1A] transition-colors hover:text-[#9B1C1C] 2xl:text-[11.5px]"
            >
              <Phone className="h-3 w-3 shrink-0 text-[#9B1C1C]" />
              <span>{primaryPhone.display}</span>
            </a>
          )}

          {whatsappPhone?.whatsappDigits && (
            <a
              href={buildWhatsAppUrl(
                whatsappPhone.whatsappDigits,
                `Hello ${person.name}, I would like to discuss a wall or surface printing project with ATELIER — WALL STORY.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#ECCEC9] bg-[#F8ECEA] px-2.5 py-1 text-[10.5px] font-bold whitespace-nowrap text-[#9B1C1C] transition-all duration-200 hover:border-[#9B1C1C] hover:bg-[#9B1C1C] hover:text-[#FFFDF9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
            >
              <MessageCircle className="h-2.5 w-2.5 shrink-0" />
              <span>WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function MumbaiStudioCard({
  eyebrow,
  conceptImageUrl,
  conceptAlt,
  revealVisible,
}: {
  eyebrow: string;
  conceptImageUrl: string;
  conceptAlt: string;
  revealVisible: boolean;
}) {
  return (
    <motion.div
      initial={false}
      animate={revealVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      transition={{ duration: 0.58, delay: 0.22, ease: EDITORIAL_EASE }}
      className="md:col-span-2 xl:col-span-1"
    >
      <div className="group flex h-full flex-col justify-between rounded-[24px] border border-[#DFD0C0] bg-[#FFFDF9] p-4.5 shadow-[0_16px_36px_-18px_rgba(34,24,16,0.13)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#CBB59D] hover:shadow-[0_22px_42px_-16px_rgba(34,24,16,0.19)] sm:p-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.18em] text-[#9B1C1C] uppercase">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#9B1C1C]" />
            <span>{eyebrow}</span>
          </div>

          <address className="mt-2 text-[13.25px] font-medium leading-[1.52] not-italic text-[#1A1A1A] sm:text-[13.5px]">
            {ATELIER_BRAND.address.line1},
            <br />
            Oshiwara, Andheri West, Mumbai — 400102
          </address>
        </div>

        <div className="relative mt-3.5 aspect-[16/9.6] min-h-[205px] w-full flex-1 overflow-hidden rounded-[16px] bg-[#E8DFD3] xl:aspect-auto">
          <Image
            src={conceptImageUrl}
            alt={conceptAlt}
            fill
            sizes="(min-width: 1280px) 450px, (min-width: 768px) 92vw, 92vw"
            quality={92}
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.025]"
          />

          <a
            href={GOOGLE_MAPS_DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Mumbai studio directions in Google Maps"
            title="Open studio directions in Google Maps"
            className="absolute right-3 bottom-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/65 bg-[#1A1A1A]/60 text-[#FFFDF9] shadow-sm backdrop-blur-xs transition-all duration-300 hover:scale-105 hover:border-[#9B1C1C] hover:bg-[#9B1C1C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export function PeopleSection() {
  const prefersReducedMotion = useReducedMotion();
  const { peopleBehindStudio, missionAndVision } = ABOUT_PAGE_CONTENT;
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
      id="people-and-studio"
      aria-labelledby="people-behind-atelier-heading"
      className="relative isolate overflow-hidden border-b border-[#DED5CB] bg-[#FAF6F0] py-11 text-[#1A1A1A] sm:py-12 xl:py-13"
    >
      <PeopleEnvironment />

      <Container className="lg:px-6 xl:px-10">
        <div className="grid grid-cols-1 items-stretch gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-[minmax(0,0.248fr)_minmax(0,0.208fr)_minmax(0,0.208fr)_minmax(0,0.336fr)] xl:gap-5 2xl:gap-6">
          {/* Left Column (26% on Desktop; 2-Col Split Header on Tablet): Intro + Mission Card */}
          <motion.div
            initial={false}
            animate={
              revealVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }
            }
            transition={{ duration: 0.52, ease: EDITORIAL_EASE }}
            className="flex flex-col justify-between md:col-span-2 md:grid md:grid-cols-2 md:items-center md:gap-6 xl:col-span-1 xl:flex xl:flex-col xl:items-stretch xl:gap-0"
          >
            <PeopleIntro
              eyebrow={peopleBehindStudio.eyebrow}
              supportingText={peopleBehindStudio.supportingText}
            />

            <MissionCard
              heading={missionAndVision.mission.label}
              description={missionAndVision.mission.body}
            />
          </motion.div>

          {/* Center-Left & Center-Right (~20.5% each on Desktop): Saikat Ray & Triparna Bardhan */}
          {ATELIER_CONTACTS.map((person, idx) => {
            const workspace =
              peopleBehindStudio.representativeWorkspaces[idx] ??
              peopleBehindStudio.representativeWorkspaces[0];

            return (
              <StudioRepresentativeCard
                key={person.name}
                person={person}
                workspace={workspace}
                index={idx}
                revealVisible={revealVisible}
              />
            );
          })}

          {/* Right Column (~34% on Desktop): Our Mumbai Studio Card */}
          <MumbaiStudioCard
            eyebrow={peopleBehindStudio.mumbaiStudio.eyebrow}
            conceptImageUrl={peopleBehindStudio.mumbaiStudio.conceptImageUrl}
            conceptAlt={peopleBehindStudio.mumbaiStudio.conceptAlt}
            revealVisible={revealVisible}
          />
        </div>
      </Container>
    </section>
  );
}
