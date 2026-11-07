"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PortfolioProjectRecord } from "@/lib/projects-catalogue";
import { ATELIER_BRAND, buildWhatsAppUrl } from "@/lib/brand";
import { Container } from "@/components/layout/Container";
import { ProjectMediaModal } from "@/components/projects/ProjectMediaModal";
import { cn } from "@/lib/cn";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Eye,
  Film,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

interface ProjectDetailClientProps {
  project: PortfolioProjectRecord;
  relatedProjects: ReadonlyArray<PortfolioProjectRecord>;
}

export function ProjectDetailClient({
  project,
  relatedProjects,
}: ProjectDetailClientProps) {
  const [activeHeroPlateIdx, setActiveHeroPlateIdx] = useState(0);
  const [revealPercent, setRevealPercent] = useState(65);
  const [lightboxState, setLightboxState] = useState<{
    mediaIndex: number;
    mode: "images" | "video";
  } | null>(null);

  const hasLiveVideoStream = Boolean(
    project.videoAsset?.secureUrl &&
      project.videoAsset.secureUrl.trim().length > 0
  );

  const activePlate =
    project.galleryMedia[activeHeroPlateIdx] ?? project.coverImage;

  return (
    <>
      {/* =====================================================================
          01. CINEMATIC CREAM PROJECT DETAIL HERO
      ===================================================================== */}
      <section
        aria-labelledby="project-detail-heading"
        className="border-b border-[#DDD2C5] bg-[#F7F3ED] py-10 text-[#211D1A] sm:py-14"
      >
        <Container>
          {/* Breadcrumb & Classification Row */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6F665E] transition-colors hover:text-[#9B1C1C]"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-[#9B1C1C]" />
              <span>Back to Our Projects</span>
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#9B1C1C] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#FAF9F6]">
                Surface: {project.surfaceName}
              </span>
              {project.spaceCategory && (
                <span className="rounded-full border border-[#DDD2C5] bg-[#FBF8F3] px-3 py-1 text-[11px] font-medium text-[#211D1A]">
                  {project.spaceCategory}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DDD2C5] bg-[#F2EBE2] px-3 py-1 text-[11px] text-[#6F665E]">
                <Sparkles className="h-3 w-3 text-[#9B1C1C]" />
                <span>
                  {project.recordClassification || "Studio Surface Study"}
                </span>
              </span>
            </div>
          </div>

          {/* Title & Primary Enquiry Action */}
          <div className="grid grid-cols-1 items-end gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9B1C1C]">
                {project.projectType}
              </p>
              <h1
                id="project-detail-heading"
                className="mt-2 font-serif text-3xl font-semibold leading-[1.06] tracking-[-0.015em] text-[#211D1A] sm:text-5xl lg:text-[3.35rem]"
              >
                {project.title}
              </h1>
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#6F665E]">
                <MapPin className="h-3.5 w-3.5 text-[#9B1C1C]" />
                <span>{project.locationNote}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
              <Link
                href={`/contact?project=${encodeURIComponent(
                  project.slug
                )}&title=${encodeURIComponent(
                  project.title
                )}&surface=${encodeURIComponent(project.surfaceName)}`}
                className="inline-flex items-center gap-2 rounded-lg bg-[#9B1C1C] px-6 py-3.5 text-[13px] font-medium text-[#FAF9F6] shadow-md transition-colors hover:bg-[#73171B]"
              >
                <span>Enquire About Similar Work</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Large Cover Image Stage */}
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[#DDD2C5] bg-[#EBE3D8] shadow-[0_24px_60px_rgba(33,29,26,0.10)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activePlate.secureUrl}
              alt={activePlate.altText}
              className="h-full w-full object-cover transition-all duration-500"
            />

            <div className="absolute bottom-4 right-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setLightboxState({
                    mediaIndex: activeHeroPlateIdx,
                    mode: "images",
                  })
                }
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#DDD2C5] bg-[#FBF8F3]/95 px-4 py-2.5 text-xs font-semibold text-[#211D1A] shadow-md backdrop-blur-md transition-colors hover:border-[#9B1C1C] hover:bg-[#9B1C1C] hover:text-[#FAF9F6]"
              >
                <Eye className="h-4 w-4" />
                <span>
                  Open Fullscreen Viewer ({project.galleryMedia.length} Plates)
                </span>
              </button>

              {hasLiveVideoStream && (
                <button
                  type="button"
                  onClick={() =>
                    setLightboxState({ mediaIndex: 0, mode: "video" })
                  }
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#DDD2C5] bg-[#FBF8F3]/95 px-4 py-2.5 text-xs font-semibold text-[#211D1A] shadow-md backdrop-blur-md transition-colors hover:border-[#9B1C1C] hover:bg-[#9B1C1C] hover:text-[#FAF9F6]"
                >
                  <Film className="h-4 w-4 text-[#9B1C1C]" />
                  <span>Watch Reel</span>
                </button>
              )}
            </div>
          </div>

          {/* Selectable Thumbnail Strip */}
          {project.galleryMedia.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-2 pb-1 sm:flex sm:gap-3 sm:overflow-x-auto">
              {project.galleryMedia.map((media, idx) => {
                const isSelected = idx === activeHeroPlateIdx;
                return (
                  <button
                    key={media.publicId}
                    type="button"
                    onClick={() => setActiveHeroPlateIdx(idx)}
                    aria-label={`Select view 0${idx + 1}`}
                    aria-pressed={isSelected}
                    className={cn(
                      "relative aspect-[16/10] w-full shrink-0 cursor-pointer overflow-hidden rounded-xl border transition-all sm:w-36",
                      isSelected
                        ? "border-2 border-[#9B1C1C] shadow-md"
                        : "border-[#DDD2C5] opacity-75 hover:opacity-100"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={media.secureUrl}
                      alt={media.altText}
                      className="h-full w-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </Container>
      </section>

      {/* =====================================================================
          02. WARM IVORY ARCHITECTURAL NARRATIVE & MULTI-PLATE GALLERY
      ===================================================================== */}
      <section className="border-b border-[#DED5CB] bg-[#F8F3ED] py-14 text-[#201C1A] sm:py-20">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Left Column: Narrative & Architectural Notes (5 Cols) */}
            <div className="space-y-6 lg:col-span-5">
              <div>
                <div className="inline-flex items-center gap-2.5">
                  <span className="h-[1.5px] w-6 bg-[#991D20]" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#991D20]">
                    ARCHITECTURAL OVERVIEW
                  </span>
                </div>
                <h2 className="mt-2.5 font-serif text-3xl font-semibold text-[#201C1A]">
                  3D Printing on {project.surfaceName}
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-[#201C1A]/90">
                  {project.summary}
                </p>
                <p className="mt-3 text-[13.5px] leading-relaxed text-[#5E554F]">
                  {project.description}
                </p>
              </div>

              {project.artisticDirection && (
                <div className="rounded-xl border border-[#DED5CB] bg-[#FDF8F3] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#991D20]">
                    Artistic Direction
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#201C1A]">
                    {project.artisticDirection}
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-[#DED5CB] bg-[#FDF8F3] p-6 shadow-2xs">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#991D20]">
                  Materials &amp; Printing Specifications
                </p>
                <ul className="mt-4 space-y-2.5 text-xs leading-relaxed text-[#201C1A] sm:text-[13px]">
                  {project.architecturalNotes.map((note) => (
                    <li key={note} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#991D20]" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap gap-2.5 border-t border-[#DED5CB] pt-4">
                  <Link
                    href={`/services#${project.surfaceId}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#D9C8B5] bg-[#F8F3ED] px-4 py-2 text-xs font-medium text-[#201C1A] transition-colors hover:border-[#991D20] hover:text-[#991D20]"
                  >
                    <span>{project.surfaceName} Service Specs</span>
                  </Link>
                  <Link
                    href="/explore-designs"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#201C1A] px-4 py-2 text-xs font-medium text-[#F8F3ED] transition-colors hover:bg-[#991D20]"
                  >
                    <span>Explore 13 Design Categories</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Project Multi-Image Gallery (7 Cols) */}
            <div className="lg:col-span-7">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#991D20]">
                  Project Gallery ({project.galleryMedia.length} Plates)
                </span>
                <span className="text-xs text-[#756C65]">
                  Click any plate to inspect in fullscreen viewer
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {project.galleryMedia.map((media, idx) => (
                  <button
                    key={media.publicId}
                    type="button"
                    onClick={() =>
                      setLightboxState({ mediaIndex: idx, mode: "images" })
                    }
                    className="group relative aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-2xl border border-[#DED5CB] bg-[#201C1A] text-left shadow-xs transition-all hover:shadow-md focus-visible:outline-2 focus-visible:outline-[#991D20]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={media.secureUrl}
                      alt={media.altText}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-[#1B1310]/85 px-4 py-2.5 text-xs text-[#F8F3ED] backdrop-blur-xs">
                      <span className="font-medium uppercase tracking-wider">
                        Plate 0{idx + 1}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#D9C8B5]">
                        <ImageIcon className="h-3.5 w-3.5 text-[#D2605E]" />
                        <span>Enlarge</span>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =====================================================================
          03. BEFORE / AFTER SUBSTRATE TRANSFORMATION STUDY (Warm Cream)
      ===================================================================== */}
      <section className="border-b border-[#DDD2C5] bg-[#F2EBE2] py-14 text-[#211D1A] sm:py-20">
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
            {/* Before / After Slider */}
            <div className="lg:col-span-7">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9B1C1C]">
                INTERACTIVE BEFORE / AFTER STUDY
              </span>
              <h2 className="mt-2 font-serif text-3xl font-semibold text-[#211D1A]">
                Substrate Transformation Preview
              </h2>

              <div className="mt-5 rounded-2xl border border-[#DDD2C5] bg-[#FBF8F3] p-4 shadow-[0_18px_45px_rgba(33,29,26,0.07)] sm:p-6">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-medium text-[#6F665E]">
                    BEFORE: {project.beforeAfterMedia.beforeLabel}
                  </span>
                  <span className="font-semibold text-[#9B1C1C]">
                    AFTER: {revealPercent}% Revealed
                  </span>
                </div>

                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-[#DDD2C5] bg-[#EBE3D8]">
                  {/* Bare Substrate Layer */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/atelier/wall-preview-before.jpg"
                    alt={`Prepared ${project.surfaceName} substrate before printing`}
                    className="h-full w-full object-cover"
                  />

                  {/* Clipped Printed Layer */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{
                      clipPath: `inset(0 ${100 - revealPercent}% 0 0)`,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.beforeAfterMedia.afterImageUrl}
                      alt={project.beforeAfterMedia.afterLabel}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 w-[2px] bg-white shadow-md"
                    style={{ left: `${revealPercent}%` }}
                  />
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <label
                    htmlFor="project-before-after-slider"
                    className="inline-flex items-center gap-2 text-xs font-medium text-[#6F665E]"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5 text-[#9B1C1C]" />
                    <span>
                      Compare Bare vs. Printed {project.surfaceName}:
                    </span>
                  </label>
                  <input
                    id="project-before-after-slider"
                    type="range"
                    min={5}
                    max={95}
                    value={revealPercent}
                    onChange={(e) => setRevealPercent(Number(e.target.value))}
                    className="w-full cursor-pointer accent-[#9B1C1C] sm:w-64"
                  />
                </div>
              </div>
            </div>

            {/* Commission Card */}
            <div className="space-y-6 lg:col-span-5">
              <div className="rounded-2xl border border-[#DDD2C5] bg-[#FBF8F3] p-6 shadow-[0_18px_45px_rgba(33,29,26,0.07)] sm:p-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9B1C1C]">
                  INSPIRED BY THIS {project.surfaceName.toUpperCase()} STUDY?
                </p>
                <h3 className="mt-2 font-serif text-3xl font-semibold text-[#211D1A]">
                  Commission a Tailored Wall Story for Your Space
                </h3>
                <p className="mt-3 text-[13.5px] leading-relaxed text-[#6F665E]">
                  Our Mumbai studio will adapt scale, tonal balance, and surface
                  preparation for your exact wall, tile, timber, blind, metal,
                  or glass elevation.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/contact?project=${encodeURIComponent(
                      project.slug
                    )}&title=${encodeURIComponent(
                      project.title
                    )}&surface=${encodeURIComponent(project.surfaceName)}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#9B1C1C] px-5 py-3 text-xs font-semibold text-[#FAF9F6] transition-colors hover:bg-[#73171B]"
                  >
                    <span>Start Project Enquiry</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <a
                    href={buildWhatsAppUrl(
                      "918017463132",
                      `Hello ATELIER — WALL STORY, I would like to enquire about a project similar to "${project.title}" (${project.surfaceName}).`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#DDD2C5] bg-[#F2EBE2] px-4 py-3 text-xs font-medium text-[#211D1A] transition-colors hover:border-[#9B1C1C] hover:bg-[#F6EAE6]"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-[#9B1C1C]" />
                    <span>WhatsApp Studio</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =====================================================================
          04. RELATED PROJECTS ACROSS OTHER CONFIRMED SURFACES
      ===================================================================== */}
      <section
        aria-labelledby="related-projects-heading"
        className="bg-[#FDF8F3] py-14 text-[#201C1A] sm:py-20"
      >
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#DED5CB] pb-6">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#991D20]">
                EXPLORE OTHER SUBSTRATES
              </span>
              <h2
                id="related-projects-heading"
                className="mt-2 font-serif text-3xl font-semibold text-[#201C1A]"
              >
                Related Surface Case Studies
              </h2>
            </div>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#991D20] hover:underline"
            >
              <span>View All {ATELIER_BRAND.name} Projects</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {relatedProjects.map((rel) => (
              <article
                key={rel.id}
                className="group relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-2xl border border-[#DED5CB] bg-[#201C1A] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <Link
                  href={`/projects/${rel.slug}`}
                  className="absolute inset-0 block h-full w-full"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={rel.coverImage.secureUrl}
                    alt={rel.coverImage.altText}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#140E0C]/95 via-[#140E0C]/35 to-transparent" />
                </Link>

                <div className="relative z-10 flex items-center justify-between p-4">
                  <span className="rounded-full bg-[#991D20] px-3 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-[#F8F3ED]">
                    {rel.surfaceName}
                  </span>
                </div>

                <div className="relative z-10 flex items-end justify-between gap-3 p-5">
                  <div>
                    <p className="text-[10.5px] font-semibold uppercase tracking-wider text-[#D9A796]">
                      {rel.projectType}
                    </p>
                    <h3 className="mt-1 font-serif text-xl font-semibold text-[#F8F3ED]">
                      <Link href={`/projects/${rel.slug}`}>{rel.title}</Link>
                    </h3>
                  </div>

                  <Link
                    href={`/projects/${rel.slug}`}
                    aria-label={`View ${rel.title}`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-[#F8F3ED] transition-colors group-hover:border-[#991D20] group-hover:bg-[#991D20]"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* Fullscreen Media Viewer */}
      <ProjectMediaModal
        project={lightboxState ? project : null}
        initialMediaIndex={lightboxState?.mediaIndex ?? 0}
        initialMode={lightboxState?.mode ?? "images"}
        onClose={() => setLightboxState(null)}
      />
    </>
  );
}
