"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";
import "swiper/css/effect-fade";

import {
  ATELIER_SCROLL_EDITORIAL_CLOSING,
  ATELIER_SCROLL_SERVICES,
  AtelierScrollServiceItem,
  buildServiceContactQuoteHref,
  buildServiceWhatsAppEnquiryUrl,
} from "@/lib/services-scroll-data";
import {
  ArrowDown,
  ArrowUpRight,
  CheckCircle2,
  Layers,
  MessageCircle,
  Sparkles,
  X,
} from "lucide-react";

interface RelativeBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

function clamp01(value: number): number {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

function mapRange01(value: number, inMin: number, inMax: number): number {
  if (inMax <= inMin) return 0;
  return clamp01((value - inMin) / (inMax - inMin));
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/* ============================================================================
   SUBCOMPONENT 1: BACKGROUND SLIDESHOW (SWIPER + EFFECTFADE + AUTOPLAY)
============================================================================ */

interface ServicesBackgroundProps {
  reducedMotion: boolean;
  backgroundRef: React.RefObject<HTMLDivElement | null>;
  onSwiperInit: (swiper: SwiperInstance) => void;
}

function ServicesBackground({
  reducedMotion,
  backgroundRef,
  onSwiperInit,
}: ServicesBackgroundProps) {
  return (
    <div
      ref={backgroundRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={1400}
        loop
        allowTouchMove={false}
        autoplay={
          reducedMotion
            ? false
            : {
                delay: 3800,
                disableOnInteraction: false,
              }
        }
        onSwiper={onSwiperInit}
        className="h-full w-full"
      >
        {ATELIER_SCROLL_SERVICES.map((service) => (
          <SwiperSlide key={service.id} className="h-full w-full">
            <div className="relative h-full w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={service.image}
                alt=""
                className="h-full w-full object-cover object-center opacity-35 scale-105"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Warm Cream & Beige Cinematic Atmospheric Layer */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 24%, rgba(252, 246, 239, 0.84) 0%, rgba(243, 228, 213, 0.94) 62%, rgba(243, 228, 213, 0.98) 100%)",
        }}
      />

      {/* Subtle Maroon & Muted Gold Architectural Framing Lines */}
      <div className="absolute inset-x-6 top-6 bottom-6 border border-[#681A27]/15 sm:inset-x-10 sm:top-8 sm:bottom-8" />
      <div className="absolute left-6 top-6 h-12 w-12 border-l-2 border-t-2 border-[#681A27]/45 sm:left-10 sm:top-8" />
      <div className="absolute right-6 bottom-6 h-12 w-12 border-r-2 border-b-2 border-[#681A27]/45 sm:right-10 sm:bottom-8" />
    </div>
  );
}

/* ============================================================================
   SUBCOMPONENT 2: PHASE 1 CINEMATIC INTRO ("EVERY SURFACE HAS A STORY.")
============================================================================ */

interface ServicesIntroProps {
  introRef: React.RefObject<HTMLDivElement | null>;
}

function ServicesIntro({ introRef }: ServicesIntroProps) {
  return (
    <div
      ref={introRef}
      className="relative z-20 mx-auto flex max-w-4xl flex-col items-center px-6 pt-8 text-center sm:pt-10"
    >
      <div className="inline-flex items-center gap-3 rounded-sm border border-[#681A27]/25 bg-[#FCF6EF]/90 px-4 py-1.5 shadow-2xs">
        <span className="h-1.5 w-1.5 rounded-full bg-[#681A27]" />
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.26em] text-[#681A27]">
          WHAT WE CREATE
        </span>
      </div>

      <h2
        id="atelier-services-scroll-heading"
        className="mt-5 font-serif text-4xl font-light leading-[1.08] tracking-[-0.01em] text-[#32191B] sm:text-6xl lg:text-[68px]"
      >
        Every Surface Has a Story.
      </h2>

      <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#32191B]/80 sm:text-lg">
        Transforming ordinary spaces into extraordinary expressions of art.
      </p>

      <div className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#791B2C]">
        <span>Scroll to Unfold Six Printing Surfaces</span>
        <ArrowDown className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}

/* ============================================================================
   SUBCOMPONENT 3: EDITORIAL STATEMENT WITH 6 INLINE IMAGE CHIP PLACEHOLDERS
============================================================================ */

interface ServicesEditorialStatementProps {
  statementContainerRef: React.RefObject<HTMLDivElement | null>;
  onSelectService: (service: AtelierScrollServiceItem) => void;
  interactiveReady: boolean;
}

function ServicesEditorialStatement({
  statementContainerRef,
  onSelectService,
  interactiveReady,
}: ServicesEditorialStatementProps) {
  return (
    <div
      ref={statementContainerRef}
      className="relative z-20 mx-auto flex max-w-5xl flex-col items-center justify-center px-6 text-center"
    >
      <div className="mb-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[#681A27]">
        <Sparkles className="h-3.5 w-3.5 text-[#791B2C]" />
        <span>From Blank Walls to Living Art • Six Architectural Surfaces</span>
      </div>

      <p className="font-serif text-2xl font-light leading-[1.45] tracking-[-0.01em] text-[#32191B] sm:text-4xl lg:text-[42px] lg:leading-[1.38]">
        {ATELIER_SCROLL_SERVICES.map((service, idx) => (
          <React.Fragment key={service.id}>
            <span
              data-phrase-index={idx}
              className="inline-block align-middle transition-colors"
            >
              {idx > 0 ? " " : ""}
              {service.editorialLeadPhrase}{" "}
            </span>

            {/* Target Inline Artwork Chip Placeholder [IMAGE 1..6] */}
            <span
              data-chip-slot={idx}
              onClick={() => {
                if (interactiveReady) {
                  onSelectService(service);
                }
              }}
              role={interactiveReady ? "button" : undefined}
              tabIndex={interactiveReady ? 0 : -1}
              onKeyDown={(e) => {
                if (
                  interactiveReady &&
                  (e.key === "Enter" || e.key === " ")
                ) {
                  e.preventDefault();
                  onSelectService(service);
                }
              }}
              aria-label={`Inspect ${service.title} details`}
              className={`relative mx-1.5 inline-flex h-[38px] w-[68px] translate-y-[-2px] items-center justify-center overflow-hidden rounded-sm align-middle sm:h-[48px] sm:w-[88px] lg:h-[54px] lg:w-[98px] ${
                interactiveReady
                  ? "cursor-pointer"
                  : "pointer-events-none"
              }`}
            />
          </React.Fragment>
        ))}

        <span
          data-phrase-index={ATELIER_SCROLL_SERVICES.length}
          className="inline-block align-middle text-[#681A27]"
        >
          {" "}
          {ATELIER_SCROLL_EDITORIAL_CLOSING}
        </span>
      </p>
    </div>
  );
}

/* ============================================================================
   SUBCOMPONENT 4: PHASE 4 REVEAL & CALL TO ACTION
============================================================================ */

interface ServicesRevealCTAProps {
  revealCtaRef: React.RefObject<HTMLDivElement | null>;
  onExploreServicesClick: () => void;
}

function ServicesRevealCTA({
  revealCtaRef,
  onExploreServicesClick,
}: ServicesRevealCTAProps) {
  return (
    <div
      ref={revealCtaRef}
      className="relative z-20 mx-auto mt-7 flex max-w-2xl flex-col items-center px-6 text-center sm:mt-9"
    >
      <div className="h-[1.5px] w-14 bg-[#681A27]/45" />
      <h3 className="mt-4 font-serif text-2xl font-light text-[#32191B] sm:text-3xl">
        Art Beyond Ordinary Surfaces.
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[#32191B]/80 sm:text-base">
        Discover how we turn your spaces into personal works of art.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onExploreServicesClick}
          className="inline-flex cursor-pointer items-center gap-2.5 rounded-sm bg-[#681A27] px-6 py-3 font-mono text-xs font-medium uppercase tracking-[0.2em] text-[#FCF6EF] shadow-md transition-colors hover:bg-[#791B2C]"
        >
          <span>Explore Our Services</span>
          <ArrowDown className="h-4 w-4" />
        </button>

        <Link
          href="/services"
          className="inline-flex items-center gap-2 rounded-sm border border-[#32191B]/25 bg-[#FCF6EF]/90 px-5 py-3 font-mono text-xs font-medium uppercase tracking-[0.18em] text-[#32191B] transition-colors hover:border-[#681A27] hover:text-[#681A27]"
        >
          <span>Full Services Page</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

/* ============================================================================
   SUBCOMPONENT 5: ACCESSIBLE SERVICE DETAIL MODAL & ENQUIRY SYSTEM
============================================================================ */

interface ServiceDetailModalProps {
  service: AtelierScrollServiceItem | null;
  onClose: () => void;
}

function ServiceDetailModal({ service, onClose }: ServiceDetailModalProps) {
  const titleId = useId();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!service) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [service, onClose]);

  if (!service) return null;

  const gallery = service.galleryImages;
  const activeImage = gallery[activeImageIndex] || {
    url: service.image,
    alt: service.imageAlt,
    caption: service.title,
  };

  const quoteHref = buildServiceContactQuoteHref(service);
  const whatsappUrl = buildServiceWhatsAppEnquiryUrl(service.title);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[140] flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-[#32191B]/80 backdrop-blur-xs"
      />

      {/* Modal Container */}
      <div className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-sm border border-[#C8A88B]/40 bg-[#FCF6EF] text-[#32191B] shadow-2xl">
        {/* Sticky Top Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#32191B]/12 bg-[#FCF6EF]/95 px-6 py-4 backdrop-blur-xs">
          <div className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.2em] text-[#681A27]">
            <span>Service {service.indexLabel} of 06</span>
            <span>•</span>
            <span>Atelier Wall Story</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close service details"
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-sm border border-[#32191B]/20 bg-[#F3E4D5] text-[#32191B] transition-colors hover:border-[#681A27] hover:text-[#681A27]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-12">
          {/* Left Column: Main Artwork & Gallery Thumbnails */}
          <div className="lg:col-span-6 space-y-3">
            <div className="overflow-hidden rounded-sm border border-[#32191B]/15 bg-[#32191B]">
              <div className="aspect-[4/3] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeImage.url}
                  alt={activeImage.alt}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="border-t border-[#FCF6EF]/15 bg-[#32191B] px-4 py-2.5 font-mono text-[11px] text-[#F3E4D5]">
                {activeImage.caption}
              </div>
            </div>

            {gallery.length > 1 && (
              <div className="grid grid-cols-3 gap-2.5">
                {gallery.map((img, idx) => (
                  <button
                    key={img.url + idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`cursor-pointer overflow-hidden rounded-sm border transition-all ${
                      activeImageIndex === idx
                        ? "border-[#681A27] ring-1 ring-[#681A27]"
                        : "border-[#32191B]/15 opacity-75 hover:opacity-100"
                    }`}
                  >
                    <div className="aspect-[16/10] bg-[#32191B]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.alt}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Service Overview, Surface, Use Cases & Enquiry CTAs */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#791B2C]">
                Direct Surface Printing Capability
              </span>
              <h2
                id={titleId}
                className="mt-1.5 font-serif text-3xl font-light text-[#32191B] sm:text-4xl"
              >
                {service.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#32191B]/85 sm:text-base">
                {service.fullDescription}
              </p>

              {/* Supported Surface Box */}
              <div className="mt-5 rounded-sm border border-[#681A27]/25 bg-[#F3E4D5]/65 p-4">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#681A27]">
                  <Layers className="h-3.5 w-3.5" />
                  <span>Available Printing Surface</span>
                </div>
                <p className="mt-1 font-serif text-lg font-normal text-[#32191B]">
                  {service.supportedSurface}
                </p>
              </div>

              {/* Typical Use Cases */}
              <div className="mt-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#32191B]/70">
                  Typical Interior &amp; Architectural Applications
                </p>
                <ul className="mt-2.5 space-y-2">
                  {service.suitableApplications.map((app) => (
                    <li
                      key={app}
                      className="flex items-start gap-2.5 text-xs leading-relaxed text-[#32191B]/85 sm:text-sm"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#681A27]" />
                      <span>{app}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Section 08: Functional Enquiry CTAs (Request a Quote + Dynamic WhatsApp) */}
            <div className="space-y-3 border-t border-[#32191B]/12 pt-5">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={quoteHref}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-sm bg-[#681A27] px-5 py-3.5 font-mono text-xs font-medium uppercase tracking-[0.18em] text-[#FCF6EF] transition-colors hover:bg-[#791B2C]"
                >
                  <span>Request a Quote</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-sm border border-[#681A27]/35 bg-[#F3E4D5] px-5 py-3.5 font-mono text-xs font-medium uppercase tracking-[0.16em] text-[#32191B] transition-colors hover:border-[#681A27] hover:text-[#681A27]"
                >
                  <MessageCircle className="h-4 w-4 text-[#681A27]" />
                  <span>WhatsApp Quotation</span>
                </a>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#32191B]/65">
                <span>
                  Prefills <strong>{service.title}</strong> in our Mumbai studio
                  enquiry workflow.
                </span>
                <Link
                  href="/services"
                  className="font-mono uppercase tracking-wider text-[#681A27] underline underline-offset-4"
                >
                  All Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   MAIN COMPONENT: ATELIER SERVICES SCROLL EXPERIENCE
   (Adapts HomeHeroLandingScrollAnimation for Atelier Wall Story)
============================================================================ */

export function AtelierServicesScrollExperience() {
  const sectionWrapperRef = useRef<HTMLElement | null>(null);
  const pinnedStageRef = useRef<HTMLDivElement | null>(null);
  const backgroundRef = useRef<HTMLDivElement | null>(null);
  const swiperInstanceRef = useRef<SwiperInstance | null>(null);
  const introRef = useRef<HTMLDivElement | null>(null);
  const statementWrapRef = useRef<HTMLDivElement | null>(null);
  const revealCtaRef = useRef<HTMLDivElement | null>(null);
  const progressFillRef = useRef<HTMLDivElement | null>(null);

  // 6 Slot Anchor Refs (Bottom Strip, Center 3D Stage) & 6 Floating Artwork Plates
  const bottomSlotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const centerSlotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const floatingCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const floatingCaptionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [selectedService, setSelectedService] =
    useState<AtelierScrollServiceItem | null>(null);
  const [selectedServiceModalKey, setSelectedServiceModalKey] = useState(0);
  const [isDesktopAnimated, setIsDesktopAnimated] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [chipsInteractive, setChipsInteractive] = useState(false);
  const chipsInteractiveRef = useRef(false);

  const handleOpenServiceModal = useCallback(
    (service: AtelierScrollServiceItem) => {
      setSelectedService(service);
      setSelectedServiceModalKey((k) => k + 1);
    },
    []
  );

  const handleScrollToShowcase = useCallback(() => {
    const nextSection = document.getElementById("atelier-philosophy");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Detect desktop viewport (>= 1024px) & prefers-reduced-motion safely on client
  useEffect(() => {
    if (typeof window === "undefined") return;

    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopMq = window.matchMedia("(min-width: 1024px)");

    const updateFlags = () => {
      const rm = motionMq.matches;
      const desk = desktopMq.matches && !rm;
      setReducedMotion(rm);
      setIsDesktopAnimated(desk);
    };

    updateFlags();
    motionMq.addEventListener("change", updateFlags);
    desktopMq.addEventListener("change", updateFlags);

    return () => {
      motionMq.removeEventListener("change", updateFlags);
      desktopMq.removeEventListener("change", updateFlags);
    };
  }, []);

  // Scoped GSAP + ScrollTrigger Engine (Desktop Pinned Image-to-Text Experience)
  useEffect(() => {
    if (!isDesktopAnimated) return;
    const pinnedStage = pinnedStageRef.current;
    if (!pinnedStage) return;

    gsap.registerPlugin(ScrollTrigger);

    let bottomBoxes: RelativeBox[] = [];
    let centerBoxes: RelativeBox[] = [];
    let chipBoxes: RelativeBox[] = [];
    let phraseEls: HTMLElement[] = [];

    const measureRelativeBox = (
      el: HTMLElement | null,
      stageRect: DOMRect
    ): RelativeBox => {
      if (!el) {
        return { x: 0, y: 0, width: 120, height: 80 };
      }
      const rect = el.getBoundingClientRect();
      return {
        x: rect.left - stageRect.left,
        y: rect.top - stageRect.top,
        width: rect.width,
        height: rect.height,
      };
    };

    const cacheAllCoordinates = () => {
      const stageEl = pinnedStageRef.current;
      if (!stageEl) return;

      // Temporarily reset statementWrapRef transform so [data-chip-slot] boxes
      // are measured at their final resting (translateY = 0) position rather than +28px offset.
      const statementEl = statementWrapRef.current;
      const prevStatementTransform = statementEl ? statementEl.style.transform : "";
      if (statementEl) {
        statementEl.style.transform = "translate3d(0px, 0px, 0px)";
      }

      const stageRect = stageEl.getBoundingClientRect();
      const chipNodeList =
        stageEl.querySelectorAll<HTMLElement>("[data-chip-slot]");
      const phraseNodeList =
        stageEl.querySelectorAll<HTMLElement>("[data-phrase-index]");
      phraseEls = Array.from(phraseNodeList);

      bottomBoxes = ATELIER_SCROLL_SERVICES.map((_, i) =>
        measureRelativeBox(bottomSlotRefs.current[i], stageRect)
      );
      centerBoxes = ATELIER_SCROLL_SERVICES.map((_, i) =>
        measureRelativeBox(centerSlotRefs.current[i], stageRect)
      );
      chipBoxes = ATELIER_SCROLL_SERVICES.map((_, i) =>
        measureRelativeBox(chipNodeList[i] || null, stageRect)
      );

      if (statementEl) {
        statementEl.style.transform = prevStatementTransform;
      }
    };

    const renderScrollProgress = (progress: number) => {
      if (
        bottomBoxes.length < ATELIER_SCROLL_SERVICES.length ||
        centerBoxes.length < ATELIER_SCROLL_SERVICES.length ||
        chipBoxes.length < ATELIER_SCROLL_SERVICES.length
      ) {
        cacheAllCoordinates();
      }

      // Progress bar indicator
      if (progressFillRef.current) {
        progressFillRef.current.style.transform = `scaleX(${progress.toFixed(
          4
        )})`;
      }

      // Pause Swiper autoplay once background fades back during scroll
      if (swiperInstanceRef.current?.autoplay) {
        if (progress > 0.35 && swiperInstanceRef.current.autoplay.running) {
          swiperInstanceRef.current.autoplay.stop();
        } else if (
          progress <= 0.35 &&
          !swiperInstanceRef.current.autoplay.running &&
          !reducedMotion
        ) {
          swiperInstanceRef.current.autoplay.start();
        }
      }

      // Enable clicking on inline text chips once transformation settles
      const nextInteractive = progress >= 0.82;
      if (nextInteractive !== chipsInteractiveRef.current) {
        chipsInteractiveRef.current = nextInteractive;
        setChipsInteractive(nextInteractive);
      }

      // 1. Intro Header (0.00 -> 0.32: Gently moves upward and fades out)
      const introExitT = easeInOutCubic(mapRange01(progress, 0.14, 0.36));
      if (introRef.current) {
        const introY = lerp(0, -72, introExitT);
        const introOpacity = lerp(1, 0, introExitT);
        introRef.current.style.transform = `translate3d(0px, ${introY.toFixed(
          1
        )}px, 0px)`;
        introRef.current.style.opacity = introOpacity.toFixed(3);
        introRef.current.style.pointerEvents =
          introOpacity < 0.15 ? "none" : "auto";
      }

      // 2. Editorial Statement Container & Ordered Phrase Reveal (0.58 -> 0.85)
      const statementBlockOpacity = easeInOutCubic(
        mapRange01(progress, 0.56, 0.68)
      );
      if (statementWrapRef.current) {
        const statementY = lerp(28, 0, statementBlockOpacity);
        statementWrapRef.current.style.opacity =
          statementBlockOpacity.toFixed(3);
        statementWrapRef.current.style.transform = `translate3d(0px, ${statementY.toFixed(
          1
        )}px, 0px)`;
      }

      const totalPhrases = ATELIER_SCROLL_SERVICES.length + 1;
      for (let pIdx = 0; pIdx < totalPhrases; pIdx++) {
        const phraseEl = phraseEls[pIdx];
        if (!phraseEl) continue;
        const startP = 0.6 + (pIdx / totalPhrases) * 0.16;
        const endP = startP + 0.09;
        const phraseT = easeInOutCubic(mapRange01(progress, startP, endP));
        const phraseY = lerp(18, 0, phraseT);
        phraseEl.style.opacity = phraseT.toFixed(3);
        phraseEl.style.transform = `translate3d(0px, ${phraseY.toFixed(
          1
        )}px, 0px)`;
      }

      // 3. Final Reveal & Call to Action (0.84 -> 0.98)
      const ctaT = easeInOutCubic(mapRange01(progress, 0.84, 0.97));
      if (revealCtaRef.current) {
        const ctaY = lerp(26, 0, ctaT);
        revealCtaRef.current.style.opacity = ctaT.toFixed(3);
        revealCtaRef.current.style.transform = `translate3d(0px, ${ctaY.toFixed(
          1
        )}px, 0px)`;
        revealCtaRef.current.style.pointerEvents =
          ctaT > 0.6 ? "auto" : "none";
      }

      // 4. Six Floating 3D Service Artwork Thumbnails (Phases 1 -> 2 -> 3 -> 4)
      for (let i = 0; i < ATELIER_SCROLL_SERVICES.length; i++) {
        const cardEl = floatingCardRefs.current[i];
        if (!cardEl) continue;
        const service = ATELIER_SCROLL_SERVICES[i];
        const bBox = bottomBoxes[i];
        const cBox = centerBoxes[i];
        const tBox = chipBoxes[i];
        if (!bBox || !cBox || !tBox) continue;

        const staggerOffset = i * 0.014;

        let x = bBox.x;
        let y = bBox.y;
        let width = bBox.width;
        let height = bBox.height;
        let rotateZ = service.stageTransform.initialRotateZ;
        let rotateY = 0;
        let rotateX = 0;
        let borderRadius = 4;
        let captionOpacity = 1;

        if (progress <= 0.2) {
          // PHASE 1 (0.00 - 0.20): Bottom Thumbnail Strip Reveal & Subtle Elevation
          const p1 = easeInOutCubic(mapRange01(progress, 0, 0.2));
          y = lerp(bBox.y + 14, bBox.y - 6, p1);
          rotateZ = lerp(
            service.stageTransform.initialRotateZ,
            service.stageTransform.initialRotateZ * 0.65,
            p1
          );
          rotateX = lerp(6, 2, p1);
          captionOpacity = 1;
        } else if (progress <= 0.45) {
          // PHASE 2 (0.20 - 0.45): Thumbnails Move & Reorganize into Center Stage
          const p2 = easeInOutCubic(
            mapRange01(progress, 0.2 + staggerOffset, 0.44 + staggerOffset)
          );
          x = lerp(bBox.x, cBox.x, p2);
          y = lerp(bBox.y - 6, cBox.y, p2);
          width = lerp(bBox.width, cBox.width, p2);
          height = lerp(bBox.height, cBox.height, p2);
          rotateZ = lerp(
            service.stageTransform.initialRotateZ * 0.65,
            service.stageTransform.initialRotateZ * 0.3,
            p2
          );
          rotateY = lerp(0, service.stageTransform.midRotateY, p2);
          rotateX = lerp(2, 4, p2);
          captionOpacity = 1;
        } else if (progress <= 0.64) {
          // PHASE 3 (0.45 - 0.64): Center Alignment & Dimensional Scale Preparation
          const p3 = easeInOutCubic(mapRange01(progress, 0.45, 0.64));
          const scaleFactor = lerp(1, 1.05, Math.sin(p3 * Math.PI));
          width = cBox.width * scaleFactor;
          height = cBox.height * scaleFactor;
          x = cBox.x - (width - cBox.width) * 0.5;
          y = cBox.y - (height - cBox.height) * 0.5;
          rotateZ = lerp(service.stageTransform.initialRotateZ * 0.3, 0, p3);
          rotateY = lerp(service.stageTransform.midRotateY, 0, p3);
          rotateX = lerp(4, 0, p3);
          captionOpacity = lerp(1, 0, mapRange01(progress, 0.54, 0.64));
        } else {
          // PHASE 4 & 5 (0.64 - 1.00): Artwork Images Fly into Inline Editorial Placeholders
          const p4 = easeInOutCubic(
            mapRange01(progress, 0.64 + staggerOffset, 0.84 + staggerOffset)
          );
          x = lerp(cBox.x, tBox.x, p4);
          y = lerp(cBox.y, tBox.y, p4);
          width = lerp(cBox.width, tBox.width, p4);
          height = lerp(cBox.height, tBox.height, p4);
          rotateZ = 0;
          rotateY = 0;
          rotateX = 0;
          borderRadius = lerp(4, 3, p4);
          captionOpacity = 0;
        }

        cardEl.style.width = `${width.toFixed(1)}px`;
        cardEl.style.height = `${height.toFixed(1)}px`;
        cardEl.style.borderRadius = `${borderRadius.toFixed(1)}px`;
        cardEl.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(
          1
        )}px, 0px) perspective(900px) rotateX(${rotateX.toFixed(
          2
        )}deg) rotateY(${rotateY.toFixed(2)}deg) rotateZ(${rotateZ.toFixed(
          2
        )}deg)`;

        const capEl = floatingCaptionRefs.current[i];
        if (capEl) {
          capEl.style.opacity = captionOpacity.toFixed(2);
        }
      }
    };

    // Scoped GSAP context — NEVER kills global triggers outside this section
    const ctx = gsap.context(() => {
      cacheAllCoordinates();
      renderScrollProgress(0);

      ScrollTrigger.create({
        trigger: pinnedStage,
        start: "top top",
        end: "+=290%", // Polished ~2.9 viewport heights on desktop
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefreshInit: () => {
          cacheAllCoordinates();
        },
        onRefresh: (self) => {
          cacheAllCoordinates();
          renderScrollProgress(self.progress);
        },
        onUpdate: (self) => {
          renderScrollProgress(self.progress);
        },
      });
    }, sectionWrapperRef);

    const resizeObserver = new ResizeObserver(() => {
      cacheAllCoordinates();
      ScrollTrigger.refresh();
    });
    resizeObserver.observe(pinnedStage);

    return () => {
      resizeObserver.disconnect();
      ctx.revert();
    };
  }, [isDesktopAnimated, reducedMotion]);

  return (
    <section
      ref={sectionWrapperRef}
      id="atelier-services-experience"
      aria-labelledby="atelier-services-scroll-heading"
      className="relative overflow-x-clip border-b border-[#32191B]/15 bg-[#F3E4D5] text-[#32191B]"
    >
      {/* =====================================================================
          PART A — DESKTOP PINNED GSAP SCROLL-STORY STAGE (>= 1024px)
      ===================================================================== */}
      {isDesktopAnimated ? (
        <div
          ref={pinnedStageRef}
          className="relative flex h-screen w-full flex-col justify-between overflow-hidden bg-[#F3E4D5] pt-[var(--header-height,74px)] select-none"
        >
          {/* Top Subtle Scroll Progress Line (positioned directly below sticky header) */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-[var(--header-height,74px)] z-40 h-1 bg-[#32191B]/10"
          >
            <div
              ref={progressFillRef}
              className="h-full w-full origin-left scale-x-0 bg-[#681A27]"
            />
          </div>

          {/* 1. Background Swiper Fade Slideshow */}
          <ServicesBackground
            reducedMotion={reducedMotion}
            backgroundRef={backgroundRef}
            onSwiperInit={(swiper) => {
              swiperInstanceRef.current = swiper;
            }}
          />

          {/* 2. Phase 1 Cinematic Intro Header */}
          <ServicesIntro introRef={introRef} />

          {/* 3. Center Stage: Invisible Measurement Grid for Phases 2–3 + Editorial Statement for Phases 4–5 */}
          <div className="relative z-20 my-auto flex w-full flex-col items-center justify-center px-8">
            {/* Hidden 3x2 Center Stage Slot Anchors (Used for Phase 2 & 3 Coordinate Interpolation) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 mx-auto grid w-full max-w-4xl grid-cols-3 gap-6 px-6 opacity-0"
            >
              {ATELIER_SCROLL_SERVICES.map((service, idx) => (
                <div
                  key={service.id}
                  ref={(el) => {
                    centerSlotRefs.current[idx] = el;
                  }}
                  className="aspect-[16/10] w-full rounded-sm"
                />
              ))}
            </div>

            {/* Phase 3 & 4 Editorial Statement with 6 Inline Placeholders */}
            <ServicesEditorialStatement
              statementContainerRef={statementWrapRef}
              onSelectService={handleOpenServiceModal}
              interactiveReady={chipsInteractive}
            />

            {/* Phase 4 Reveal & Call to Action */}
            <ServicesRevealCTA
              revealCtaRef={revealCtaRef}
              onExploreServicesClick={handleScrollToShowcase}
            />
          </div>

          {/* 4. Bottom Strip Measurement Slot Anchors (Phase 1 Initial Positions) */}
          <div
            aria-hidden="true"
            className="pointer-events-none relative z-10 mx-auto mb-8 grid w-full max-w-6xl grid-cols-6 gap-4 px-8 opacity-0"
          >
            {ATELIER_SCROLL_SERVICES.map((service, idx) => (
              <div
                key={service.id}
                ref={(el) => {
                  bottomSlotRefs.current[idx] = el;
                }}
                className="aspect-[4/3] w-full rounded-sm"
              />
            ))}
          </div>

          {/* 5. Scoped Floating 3D Artwork Layer (Owned by Section — Never Leaks Outside) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
          >
            {ATELIER_SCROLL_SERVICES.map((service, idx) => (
              <div
                key={service.id}
                ref={(el) => {
                  floatingCardRefs.current[idx] = el;
                }}
                className=" absolute left-0 top-0 overflow-hidden border border-[#681A27]/45 bg-[#32191B] shadow-[0_18px_38px_-12px_rgba(50,25,27,0.38)] will-change-transform"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={service.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-1 border border-[#FCF6EF]/25" />
                <div
                  ref={(el) => {
                    floatingCaptionRefs.current[idx] = el;
                  }}
                  className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#32191B]/95 via-[#32191B]/70 to-transparent px-2.5 py-2 transition-opacity"
                >
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#C8A88B]">
                    {service.indexLabel}
                  </p>
                  <p className="truncate font-serif text-xs font-normal text-[#FCF6EF]">
                    {service.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* =====================================================================
           PART B — ADAPTED TABLET, MOBILE & REDUCED-MOTION EXPERIENCE
           (Section 10: Preserves cinematic reveal, editorial chips, and 6
           services without broken scroll pinning or excessive scroll height)
        ===================================================================== */
        <div className="relative overflow-hidden bg-[#F3E4D5] py-16 sm:py-20">
          {/* Background Accent Frame */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-4 border border-[#681A27]/15 sm:inset-6"
          />

          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
            <div className="inline-flex items-center gap-2.5 rounded-sm border border-[#681A27]/25 bg-[#FCF6EF] px-3.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#681A27]" />
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-[#681A27]">
                WHAT WE CREATE
              </span>
            </div>

            <h2
              id="atelier-services-scroll-heading"
              className="mt-4 font-serif text-4xl font-light leading-[1.1] text-[#32191B] sm:text-5xl"
            >
              Every Surface Has a Story.
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#32191B]/80 sm:text-base">
              Transforming ordinary spaces into extraordinary expressions of
              art.
            </p>

            {/* Mobile/Tablet 6-Thumbnail Visual Strip */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {ATELIER_SCROLL_SERVICES.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleOpenServiceModal(service)}
                  className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-sm border border-[#681A27]/30 bg-[#32191B] text-left shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={service.image}
                    alt={service.imageAlt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#32191B]/95 via-[#32191B]/65 to-transparent p-2.5">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-[#C8A88B]">
                      {service.indexLabel}
                    </span>
                    <p className="font-serif text-sm font-light text-[#FCF6EF]">
                      {service.title}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Mobile/Tablet Editorial Statement with Embedded Artwork Chips */}
            <div className="mt-10 rounded-sm border border-[#681A27]/20 bg-[#FCF6EF]/90 p-6 shadow-xs sm:p-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#681A27]">
                From Blank Walls to Living Art
              </p>
              <p className="mt-3 font-serif text-xl font-light leading-[1.6] text-[#32191B] sm:text-2xl">
                {ATELIER_SCROLL_SERVICES.map((service, idx) => (
                  <React.Fragment key={service.id}>
                    <span>
                      {idx > 0 ? " " : ""}
                      {service.editorialLeadPhrase}{" "}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenServiceModal(service)}
                      aria-label={`Inspect ${service.title}`}
                      className="mx-1 inline-flex h-7 w-12 translate-y-[-2px] cursor-pointer overflow-hidden rounded-xs border border-[#681A27]/45 align-middle shadow-2xs sm:h-8 sm:w-14"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={service.image}
                        alt={service.title}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  </React.Fragment>
                ))}{" "}
                <span className="text-[#681A27]">
                  {ATELIER_SCROLL_EDITORIAL_CLOSING}
                </span>
              </p>

              <div className="mt-6 border-t border-[#32191B]/10 pt-5">
                <h3 className="font-serif text-2xl font-light text-[#32191B]">
                  Art Beyond Ordinary Surfaces.
                </h3>
                <p className="mt-1 text-xs text-[#32191B]/75 sm:text-sm">
                  Discover how we turn your spaces into personal works of art.
                </p>
                <button
                  type="button"
                  onClick={handleScrollToShowcase}
                  className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-sm bg-[#681A27] px-5 py-2.5 font-mono text-xs uppercase tracking-[0.18em] text-[#FCF6EF]"
                >
                  <span>Explore Our Services</span>
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accessible Service Detail Modal */}
      <ServiceDetailModal
        key={selectedServiceModalKey}
        service={selectedService}
        onClose={() => setSelectedService(null)}
      />
    </section>
  );
}

export default AtelierServicesScrollExperience;
