"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DEFAULT_HOMEPAGE_CONTENT,
  FeaturedSampleDesignItem,
} from "@/lib/homepage-content";
import { DESIGN_CATEGORY_RECORDS } from "@/lib/designs-catalogue";
import {
  buildVisualizerBridgeHref,
  stageDesignForWallVisualizer,
} from "@/lib/visualizer-bridge";
import { ATELIER_BRAND } from "@/lib/brand";
import { ArrowRight, ArrowUpRight, Scan } from "lucide-react";

/**
 * SECTION 03 — EXPLORE OUR WALL ART COLLECTION
 * Editorial asymmetrical gallery previewing selected compositions from the
 * studio catalogue, plus a direct visual category ribbon for all 13 categories.
 */
export function FeaturedCollectionGallery() {
  const router = useRouter();
  const { sampleItems } = DEFAULT_HOMEPAGE_CONTENT.collectionPreview;

  const handlePreviewDesignOnWall = async (item: FeaturedSampleDesignItem) => {
    await stageDesignForWallVisualizer({
      id: item.id,
      name: item.title,
      category: `${item.slotCode} (${item.surfaceTag})`,
      dataUrl: item.sampleImageUrl,
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
      defaultMode: item.defaultMode,
      description: `${ATELIER_BRAND.name} • ${item.caption}`,
    });

    router.push(
      buildVisualizerBridgeHref({
        designSlug: item.slug,
        designTitle: item.title,
        categorySlot: item.slotNumber,
        mode: "camera",
      })
    );
  };

  const primaryItem = sampleItems[0];
  const secondaryPair = sampleItems.slice(1, 3);
  const panoramicItem = sampleItems[3];

  return (
    <div className="space-y-12">
      {/* Asymmetrical Editorial Gallery Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Tall Feature Composition (5 Columns) */}
        {primaryItem && (
          <article className="group flex flex-col justify-between rounded-2xl border border-[#DED5CB] bg-[#FDF8F3] overflow-hidden shadow-sm lg:col-span-5">
            <div className="relative aspect-[4/4.2] w-full overflow-hidden bg-brand-charcoal">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={primaryItem.sampleImageUrl}
                alt={primaryItem.title}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                <span className="rounded-full bg-[#201C1A]/85 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-[#F8F3ED] backdrop-blur-xs">
                  {primaryItem.slotCode}
                </span>
                <span className="rounded-full bg-[#991D20] px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-[#F8F3ED]">
                  Featured Relief
                </span>
              </div>
            </div>

            <div className="p-6 flex flex-col justify-between flex-1">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#991D20]">
                  {primaryItem.surfaceTag}
                </p>
                <h3 className="mt-1.5 font-serif text-2xl font-semibold text-[#201C1A]">
                  {primaryItem.title}
                </h3>
                <p className="mt-1 text-xs text-[#756C65]">
                  {primaryItem.caption}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t border-[#DED5CB] pt-4">
                <button
                  type="button"
                  onClick={() => handlePreviewDesignOnWall(primaryItem)}
                  className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#991D20] px-4 py-2.5 text-xs font-medium text-[#F8F3ED] transition-colors hover:bg-[#73171B]"
                >
                  <Scan className="h-3.5 w-3.5" />
                  <span>Preview on Your Wall</span>
                </button>
                <Link
                  href="/explore-designs"
                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#DED5CB] bg-[#F8F3ED] px-3.5 py-2.5 text-xs font-medium text-[#201C1A] transition-colors hover:border-[#991D20] hover:text-[#991D20]"
                >
                  <span>Catalogue</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </article>
        )}

        {/* Right Asymmetrical Stack (7 Columns: 2 Studies + 1 Panoramic Study) */}
        <div className="grid grid-cols-1 gap-6 lg:col-span-7">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {secondaryPair.map((item) => (
              <article
                key={item.id}
                className="group flex flex-col justify-between rounded-2xl border border-[#DED5CB] bg-[#FDF8F3] overflow-hidden shadow-sm"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-charcoal">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.sampleImageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3.5">
                    <span className="rounded-full bg-[#201C1A]/85 px-2.5 py-0.5 text-[10px] font-medium uppercase text-[#F8F3ED] backdrop-blur-xs">
                      {item.slotCode}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#991D20]">
                      {item.surfaceTag}
                    </p>
                    <h3 className="mt-1 font-serif text-xl font-semibold text-[#201C1A]">
                      {item.title}
                    </h3>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#DED5CB] pt-3.5">
                    <button
                      type="button"
                      onClick={() => handlePreviewDesignOnWall(item)}
                      className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-[#991D20] hover:underline"
                    >
                      <Scan className="h-3.5 w-3.5" />
                      <span>Preview on Wall</span>
                    </button>
                    <Link
                      href="/explore-designs"
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#201C1A] hover:text-[#991D20]"
                    >
                      <span>Explore</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Bottom Panoramic Study */}
          {panoramicItem && (
            <article className="group grid grid-cols-1 overflow-hidden rounded-2xl border border-[#DED5CB] bg-[#FDF8F3] shadow-sm sm:grid-cols-12">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-charcoal sm:col-span-6 sm:aspect-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={panoramicItem.sampleImageUrl}
                  alt={panoramicItem.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <span className="absolute left-3.5 top-3.5 rounded-full bg-[#991D20] px-3 py-0.5 text-[10px] font-medium uppercase text-[#F8F3ED]">
                  {panoramicItem.slotCode}
                </span>
              </div>

              <div className="flex flex-col justify-between p-6 sm:col-span-6">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#991D20]">
                    {panoramicItem.surfaceTag}
                  </span>
                  <h3 className="mt-2 font-serif text-2xl font-semibold text-[#201C1A]">
                    {panoramicItem.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#756C65]">
                    Composed for wide architectural elevations with direct
                    handoff into our interactive Wall Visualizer.
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t border-[#DED5CB] pt-4">
                  <button
                    type="button"
                    onClick={() => handlePreviewDesignOnWall(panoramicItem)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#991D20] px-4 py-2 text-xs font-medium text-[#F8F3ED] transition-colors hover:bg-[#73171B]"
                  >
                    <Scan className="h-3.5 w-3.5" />
                    <span>Preview on Wall</span>
                  </button>
                  <Link
                    href="/explore-designs"
                    className="inline-flex items-center gap-1 rounded-lg border border-[#DED5CB] px-3.5 py-2 text-xs font-medium text-[#201C1A] hover:border-[#991D20] hover:text-[#991D20]"
                  >
                    <span>Browse Collection</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          )}
        </div>
      </div>

      {/* Unified 13-Category Catalogue Index Bar */}
      <div className="rounded-2xl border border-[#DED5CB] bg-[#FDF8F3] p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-[#DED5CB] pb-5">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#991D20]">
              13 Curated Design Categories
            </span>
            <h3 className="mt-1 font-serif text-2xl font-medium text-[#201C1A]">
              Explore by Design Style &amp; Surface Character
            </h3>
          </div>
          <Link
            href="/explore-designs"
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#991D20] hover:underline"
          >
            <span>Explore All 13 Categories</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {DESIGN_CATEGORY_RECORDS.map((cat) => (
            <Link
              key={cat.slug}
              href={`/explore-designs?category=${cat.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-[#DED5CB] bg-[#F8F3ED] p-1.5 transition-all hover:border-[#991D20] hover:shadow-sm"
            >
              <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-[#EDE4DA]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    cat.coverImage?.secureUrl ||
                    "/images/atelier/cat-01-botanical.jpg"
                  }
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <span className="mt-2 pb-1 text-center text-xs font-medium text-[#201C1A] group-hover:text-[#991D20]">
                {cat.shortTitle}
              </span>
            </Link>
          ))}

          <Link
            href="/explore-designs"
            className="flex flex-col items-center justify-center rounded-xl border border-[#991D20] bg-[#991D20] p-4 text-center text-[#F8F3ED] transition-colors hover:bg-[#73171B]"
          >
            <span className="text-[10px] uppercase tracking-wider text-[#EDE4DA]">
              ALL 13
            </span>
            <span className="mt-1 font-serif text-base font-medium">
              Full Collection →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
