import React from "react";
import Link from "next/link";
import { PublicShell } from "@/components/layout/PublicShell";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { HeroVideoStage } from "@/components/home/HeroVideoStage";
import { AtelierServicesScrollExperience } from "@/components/sections/AtelierServicesScrollExperience";
import { AtelierTumbleGallery } from "@/components/home/atelier-tumble-gallery";
import { PhilosophySection } from "@/components/home/PhilosophySection";
import { InteractiveSurfacesGallery } from "@/components/home/InteractiveSurfacesGallery";
import { WhyAtelierSection } from "@/components/home/WhyAtelierSection";
import {
  FadeUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/Reveal";
import { DEFAULT_HOMEPAGE_CONTENT } from "@/lib/homepage-content";
import {
  ATELIER_BRAND,
  ATELIER_CONTACTS,
  buildWhatsAppUrl,
} from "@/lib/brand";
import {
  ArrowRight,
  FolderKanban,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
} from "lucide-react";

interface EditorialHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  headingId?: string;
  dark?: boolean;
}

function EditorialSectionHeader({
  eyebrow,
  title,
  description,
  headingId,
  dark = false,
}: EditorialHeaderProps) {
  return (
    <div className="max-w-2xl">
      <div className="inline-flex items-center gap-3">
        <span aria-hidden="true" className="h-[1.5px] w-7 bg-brand-crimson" />
        <span
          className={`text-xs font-semibold uppercase tracking-[0.22em] ${
            dark ? "text-brand-beige/90" : "text-brand-crimson"
          }`}
        >
          {eyebrow}
        </span>
      </div>
      <h2
        id={headingId}
        className={`mt-3.5 font-serif text-3xl font-medium leading-[1.12] tracking-[-0.01em] sm:text-4xl lg:text-[44px] ${
          dark ? "text-brand-offwhite" : "text-brand-charcoal"
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-4 text-sm leading-relaxed sm:text-base ${
            dark ? "text-brand-beige/80" : "text-brand-muted"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

export default function HomePage() {
  const content = DEFAULT_HOMEPAGE_CONTENT;

  return (
    <PublicShell>
      {/* =====================================================================
          SECTION 01 — CINEMATIC FULLSCREEN HERO
      ===================================================================== */}
      <HeroVideoStage
        videoUrl={content.hero.videoUrl}
        posterUrl={content.hero.posterUrl}
        headlineLine1={content.hero.headlineLine1}
        headlineLine2={content.hero.headlineLine2}
        subheading={content.hero.subheading}
      />

      {/* =====================================================================
          SECTION 01B — CINEMATIC 3D SERVICES SCROLL EXPERIENCE
          ("FROM BLANK WALLS TO LIVING ART" — GSAP ScrollTrigger + Swiper + 3x2 Showcase)
      ===================================================================== */}
      <AtelierServicesScrollExperience />

      {/* =====================================================================
          SECTION 02 — INTRODUCTION / THE ATELIER PHILOSOPHY
      ===================================================================== */}
      <PhilosophySection />

      {/* =====================================================================
          SECTION 03 — EXPLORE OUR WALL ART COLLECTION (3D TUMBLE DECK)
      ===================================================================== */}
      <AtelierTumbleGallery />

      {/* =====================================================================
          SECTION 04 — THE ART OF WALL PRINTING (COMPACT 43% / 57% EDITORIAL SPREAD)
      ===================================================================== */}
      <section
        id="art-of-wall-printing"
        aria-labelledby="art-of-printing-heading"
        className="border-b border-brand-stone/35 bg-brand-beige py-10 sm:py-12 lg:py-16 xl:py-[70px]"
      >
        <Container>
          <div className="grid grid-cols-1 items-stretch gap-7 sm:gap-8 lg:grid-cols-[minmax(0,43fr)_minmax(0,57fr)] lg:gap-10 xl:gap-12">
            {/* Left Column (~43%): Editorial Header, Condensed Copy, Learn More CTA & Landscape Mural Photo */}
            <FadeUp className="flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="h-[1.5px] w-6 bg-brand-crimson"
                  />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-crimson">
                    {content.wallPrintingArt.sectionLabel}
                  </span>
                </div>

                <h2
                  id="art-of-printing-heading"
                  className="mt-2 font-serif text-[26px] font-medium leading-[1.1] tracking-[-0.015em] text-brand-charcoal min-[430px]:text-[28px] sm:text-[34px] lg:text-[36px] xl:text-[38px]"
                >
                  {content.wallPrintingArt.heading}
                </h2>

                <p className="mt-2 text-[13.5px] leading-[1.55] text-brand-muted sm:text-[14px]">
                  Unlike pasted paper or vinyl sheets that seam and lift over
                  time, ATELIER — WALL STORY prints directly onto your vertical
                  surface—adapting seamlessly to the room&apos;s architecture and
                  substrate texture.
                </p>

                <div className="mt-3.5">
                  <Button
                    href={content.wallPrintingArt.ctaHref}
                    variant="primary"
                    size="sm"
                    className="w-full min-[430px]:w-auto"
                  >
                    <span>{content.wallPrintingArt.ctaLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Compact Landscape Architectural Mural Photograph (230–270px on desktop) */}
              <div className="group relative mt-4 h-[210px] w-full overflow-hidden rounded-xl border border-brand-stone/45 bg-brand-charcoal shadow-editorial sm:h-[234px] lg:h-[240px] xl:h-[248px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/atelier/artwork-terracotta-wave.jpg"
                  alt="Direct-to-surface 3D wall printing terracotta relief installation"
                  className="h-full w-full object-cover object-[50%_42%] transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
                <div className="absolute left-3.5 top-3.5 rounded-full border border-white/15 bg-brand-charcoal/80 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-brand-beige backdrop-blur-xs">
                  Direct-to-Wall Relief Printing
                </div>
              </div>
            </FadeUp>

            {/* Right Column (~57%): 2x2 Grid of 4 Compact Discipline Cards */}
            <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-[18px]">
              {content.wallPrintingArt.pillars.map((pillar) => (
                <StaggerItem key={pillar.code} className="h-full">
                  <Link
                    href={content.wallPrintingArt.ctaHref}
                    className="group flex h-full min-h-[205px] flex-col justify-between rounded-xl border border-brand-stone/45 bg-brand-offwhite p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-crimson/60 hover:shadow-[0_14px_30px_-16px_rgba(31,23,20,0.14)] sm:min-h-[225px] lg:min-h-[228px]"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-brand-stone/35 pb-2.5">
                        <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-crimson">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-crimson" />
                          <span>Discipline {pillar.code}</span>
                        </span>
                        <Sparkles className="h-3.5 w-3.5 text-brand-crimson/75 transition-transform duration-300 group-hover:scale-110" />
                      </div>

                      <h3 className="mt-3 font-serif text-[20px] font-medium leading-[1.2] text-brand-charcoal transition-colors group-hover:text-brand-crimson xl:text-[21px]">
                        {pillar.title}
                      </h3>

                      <p className="mt-1.5 text-[13px] leading-[1.52] text-brand-muted sm:text-[13.5px]">
                        {pillar.description}
                      </p>
                    </div>

                    <div className="mt-3 border-t border-brand-stone/30 pt-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-brand-muted">
                          Application Scope
                        </span>
                        <ArrowRight className="h-3 w-3 text-brand-crimson/70 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </div>
                      <p className="mt-0.5 truncate text-[11.5px] font-medium text-brand-charcoal">
                        {pillar.surfaceNote}
                      </p>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </Container>
      </section>

      {/* =====================================================================
          SECTION 05 — SURFACES WE TRANSFORM
      ===================================================================== */}
      <section
        aria-labelledby="surfaces-transform-heading"
        className="border-b border-[#DDD2C5] bg-[#F7F3ED] py-16 text-[#211D1A] sm:py-22"
      >
        <Container>
          <FadeUp className="mb-12 flex flex-col justify-between gap-6 border-b border-[#DDD2C5] pb-10 lg:flex-row lg:items-end">
            <EditorialSectionHeader
              eyebrow="Surfaces We Transform"
              title="Six Architectural Substrates. Direct 3D Printing."
              description="Beyond interior walls, ATELIER — WALL STORY prints directly onto tiles, plywood, office blinds, metals, and glass. Select a substrate below to inspect applications and technical notes."
              headingId="surfaces-transform-heading"
            />
            <div className="shrink-0">
              <Button href="/services" variant="outline" size="md">
                <span>View Surface Specifications</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </FadeUp>

          <InteractiveSurfacesGallery />
        </Container>
      </section>

      {/* =====================================================================
          SECTION 06 — SELECTED PROJECTS
      ===================================================================== */}
      <section
        aria-labelledby="selected-projects-heading"
        className="border-b border-brand-stone/35 bg-brand-offwhite py-20 sm:py-28"
      >
        <Container>
          <FadeUp className="flex flex-col justify-between gap-6 border-b border-brand-stone/35 pb-10 lg:flex-row lg:items-end">
            <EditorialSectionHeader
              eyebrow={content.selectedProjects.sectionLabel}
              title={content.selectedProjects.heading}
              description={content.selectedProjects.supportingText}
              headingId="selected-projects-heading"
            />
            <div className="shrink-0">
              <Button
                href={content.selectedProjects.ctaHref}
                variant="primary"
                size="md"
              >
                <span>{content.selectedProjects.ctaLabel}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </FadeUp>

          <StaggerContainer className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Slot 01 — Featured Wide Architectural Frame */}
            <StaggerItem className="lg:col-span-7">
              <div className="group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-[#DDD2C5] bg-[#FBF8F3] shadow-[0_14px_34px_rgba(33,29,26,0.05)]">
                <div className="relative aspect-[16/10] overflow-hidden bg-[#EBE3D8]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/atelier/hero-botanical-living.jpg"
                    alt="Sunlit residential living room botanical mural showcase"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                  <div className="absolute left-4 top-4 rounded-full border border-[#DDD2C5] bg-[#FBF8F3]/95 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#211D1A] shadow-xs">
                    Residential &amp; Hospitality Elevations
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-brand-crimson">
                      <span>Curated Surface Study</span>
                      <span>•</span>
                      <span>Direct-to-Wall &amp; Multi-Surface</span>
                    </div>
                    <h3 className="mt-2 font-serif text-2xl font-medium text-brand-charcoal">
                      Panoramic Botanical &amp; Architectural Wall Installations
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                      Explore how full-height murals, warm limestone arches, and
                      sculpted plaster compositions transform residential living
                      spaces, dining rooms, and commercial lobbies across
                      Mumbai.
                    </p>
                  </div>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-brand-stone/35 pt-4">
                    <span className="text-xs text-brand-muted">
                      Walls • Tiles • Plywood • Office Blinds • Metals • Glass
                    </span>
                    <Link
                      href="/projects"
                      className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-brand-crimson hover:text-brand-charcoal"
                    >
                      <span>Explore Portfolio Studies</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </StaggerItem>

            {/* Slot 02 — Vertical Architectural Frame */}
            <StaggerItem className="lg:col-span-5">
              <div className="flex h-full flex-col justify-between rounded-2xl border border-[#DDD2C5] bg-[#F2EBE2] p-7 text-[#211D1A] shadow-[0_14px_34px_rgba(33,29,26,0.05)] sm:p-8">
                <div>
                  <div className="flex items-center justify-between border-b border-[#DDD2C5] pb-4">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9B1C1C]">
                      Multi-Surface Portfolio
                    </span>
                    <FolderKanban className="h-4 w-4 text-[#9B1C1C]" />
                  </div>

                  <div className="mt-5 relative aspect-[16/9] overflow-hidden rounded-xl border border-[#DDD2C5] bg-[#EBE3D8]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/atelier/surface-glass-interior.jpg"
                      alt="Custom printed architectural glass partition"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <h3 className="mt-5 font-serif text-2xl font-medium text-[#211D1A] sm:text-3xl">
                    Tailored to Your Architecture &amp; Material Palette
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-[#6F665E]">
                    Every commission is proportioned to your room&apos;s exact
                    dimensions and lighting—whether printing on plastered
                    interior walls, ceramic tile elevations, bespoke timber
                    millwork, office blinds, brushed metal, or glass partitions.
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-3 border-t border-[#DDD2C5] pt-5">
                  <Button href="/projects" variant="primary" size="md">
                    <span>View All Projects</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button href="/contact" variant="outline" size="md">
                    <span>Discuss Your Space</span>
                  </Button>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </Container>
      </section>

      {/* =====================================================================
          SECTION 09 — WHY ATELIER
      ===================================================================== */}
      <WhyAtelierSection />

      {/* =====================================================================
          SECTION 10 — PREMIUM CONTACT CTA
      ===================================================================== */}
      <section
        aria-labelledby="contact-cta-heading"
        className="border-b border-[#DDD2C5] bg-gradient-to-br from-[#FBF8F3] via-[#F6EAE6] to-[#EBE3D8] py-16 text-[#211D1A] sm:py-24"
      >
        <Container>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <FadeUp className="lg:col-span-7">
              <div className="inline-flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-[1.5px] w-7 bg-[#9B1C1C]"
                />
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9B1C1C]">
                  {content.contactCtaSection.sectionLabel}
                </span>
              </div>

              <h2
                id="contact-cta-heading"
                className="mt-4 font-serif text-4xl font-medium leading-[1.08] tracking-[-0.01em] text-[#211D1A] sm:text-5xl lg:text-6xl"
              >
                <span className="block">
                  {content.contactCtaSection.headlineLine1}
                </span>
                <span className="mt-1 block italic font-normal text-[#9B1C1C]">
                  {content.contactCtaSection.headlineLine2}
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-[#6F665E] sm:text-lg">
                {content.contactCtaSection.supportingText}
              </p>

              {/* Primary Contact Us + Dual Verified WhatsApp Actions */}
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Button
                  href={content.contactCtaSection.primaryCtaHref}
                  variant="primary"
                  size="lg"
                >
                  <span>{content.contactCtaSection.primaryCtaLabel}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <a
                  href={buildWhatsAppUrl(
                    "918017463132",
                    "Hello ATELIER — WALL STORY, I would like to discuss a 3D wall printing project."
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-[#DDD2C5] bg-[#FBF8F3] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#211D1A] shadow-xs transition-colors hover:border-[#9B1C1C] hover:bg-[#F6EAE6]"
                >
                  <MessageCircle className="h-4 w-4 text-[#9B1C1C]" />
                  <span>WhatsApp +91 80174 63132</span>
                </a>

                <a
                  href={buildWhatsAppUrl(
                    "918697170746",
                    "Hello ATELIER — WALL STORY, I would like to discuss a 3D wall printing project."
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-[#DDD2C5] bg-[#FBF8F3] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#211D1A] shadow-xs transition-colors hover:border-[#9B1C1C] hover:bg-[#F6EAE6]"
                >
                  <MessageCircle className="h-4 w-4 text-[#9B1C1C]" />
                  <span>WhatsApp +91 86971 70746</span>
                </a>
              </div>
            </FadeUp>

            {/* Right Column: Direct Verified Mumbai Studio Contact Card */}
            <FadeUp delay={0.12} className="lg:col-span-5">
              <div className="rounded-2xl border border-[#DDD2C5] bg-[#FBF8F3] p-7 shadow-[0_18px_45px_rgba(33,29,26,0.07)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9B1C1C]">
                  Direct Studio Contacts
                </p>

                <div className="mt-5 space-y-5 divide-y divide-[#DDD2C5]">
                  {ATELIER_CONTACTS.map((person) => (
                    <div key={person.name} className="pt-4 first:pt-0">
                      <p className="font-serif text-xl font-medium text-[#211D1A]">
                        {person.name}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {person.phones.map((phone) => (
                          <a
                            key={phone.telHref}
                            href={phone.telHref}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#DDD2C5] bg-[#F2EBE2] px-3 py-1.5 text-xs font-medium text-[#211D1A] transition-colors hover:border-[#9B1C1C] hover:bg-[#F6EAE6]"
                          >
                            <Phone className="h-3.5 w-3.5 text-[#9B1C1C]" />
                            <span>{phone.display}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-[#DDD2C5] pt-5">
                  <div className="flex items-start gap-2.5 text-xs leading-relaxed text-[#6F665E]">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#9B1C1C]" />
                    <span>{ATELIER_BRAND.address.full}</span>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </Container>
      </section>
    </PublicShell>
  );
}
