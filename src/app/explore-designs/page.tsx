"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PublicShell } from "@/components/layout/PublicShell";
import { Container } from "@/components/layout/Container";
import { FadeUp } from "@/components/motion/Reveal";
import { AtelierCategoryExplorer } from "@/components/designs/AtelierCategoryExplorer";
import { CategoryDesignsPopupModal } from "@/components/designs/CategoryDesignsPopupModal";
import { DesignPreviewModal } from "@/components/designs/DesignPreviewModal";
import { TabletVisualizerShowcase } from "@/components/services/TabletVisualizerShowcase";
import {
  AtelierVaultCategoryItem,
  buildAtelierVaultCategories,
  CatalogueCategoryRecord,
  CatalogueDesignItem,
  DESIGN_CATEGORY_RECORDS,
  DEVELOPMENT_FIXTURE_DESIGNS,
  EXPLORE_DESIGNS_HERO_CONTENT,
  findDesignBySlugOrId,
  resolveCategoryFromQuery,
} from "@/lib/designs-catalogue";
import {
  buildVisualizerBridgeHref,
  stageDesignForWallVisualizer,
} from "@/lib/visualizer-bridge";
import {
  ArrowRight,
  Layers,
  PenTool,
  Play,
  Printer,
} from "lucide-react";

function ExploreDesignsWorkspace() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Resolve initial category from ?category=cat-01 or ?slot=1
  const resolvedCategoryFromUrl = useMemo(
    () =>
      resolveCategoryFromQuery({
        categoryParam: searchParams.get("category"),
        slotParam: searchParams.get("slot"),
      }),
    [searchParams]
  );

  const initialDesignParam = searchParams.get("design") || "";
  const urlCategorySlug = resolvedCategoryFromUrl
    ? resolvedCategoryFromUrl.slug
    : "all";

  const [activeCategorySlug, setActiveCategorySlug] =
    useState<string>(urlCategorySlug);
  const [popupCategorySlug, setPopupCategorySlug] = useState<string | null>(
    urlCategorySlug !== "all" ? urlCategorySlug : null
  );
  const [prevUrlCategorySlug, setPrevUrlCategorySlug] =
    useState<string>(urlCategorySlug);

  if (urlCategorySlug !== prevUrlCategorySlug) {
    setPrevUrlCategorySlug(urlCategorySlug);
    setActiveCategorySlug(urlCategorySlug);
    setPopupCategorySlug(urlCategorySlug !== "all" ? urlCategorySlug : null);
  }

  // Live CMS / API synchronized categories & designs (initialized from canonical registry for zero layout shift)
  const [catalogueCategories, setCatalogueCategories] = useState<
    ReadonlyArray<CatalogueCategoryRecord>
  >(DESIGN_CATEGORY_RECORDS);
  const [catalogueDesigns, setCatalogueDesigns] = useState<
    ReadonlyArray<CatalogueDesignItem>
  >(DEVELOPMENT_FIXTURE_DESIGNS);
  const [cmsErrorMessage, setCmsErrorMessage] = useState<string | null>(null);

  const syncCatalogueFromApi = useCallback(async () => {
    try {
      setCmsErrorMessage(null);
      const res = await fetch("/api/designs", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data?.categories) && data.categories.length > 0) {
        setCatalogueCategories(data.categories);
      }
      const combinedDesigns: CatalogueDesignItem[] = [
        ...(Array.isArray(data?.approvedClientDesigns)
          ? data.approvedClientDesigns
          : []),
        ...(Array.isArray(data?.developmentFixtures)
          ? data.developmentFixtures
          : []),
      ];
      if (combinedDesigns.length > 0) {
        setCatalogueDesigns(combinedDesigns);
      }
    } catch {
      setCmsErrorMessage(
        "Live CMS sync temporarily unavailable — displaying verified studio catalogue."
      );
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/designs", { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        if (cancelled) return;
        if (Array.isArray(data?.categories) && data.categories.length > 0) {
          setCatalogueCategories(data.categories);
        }
        const combinedDesigns: CatalogueDesignItem[] = [
          ...(Array.isArray(data?.approvedClientDesigns)
            ? data.approvedClientDesigns
            : []),
          ...(Array.isArray(data?.developmentFixtures)
            ? data.developmentFixtures
            : []),
        ];
        if (combinedDesigns.length > 0) {
          setCatalogueDesigns(combinedDesigns);
        }
        setCmsErrorMessage(null);
      } catch {
        if (!cancelled) {
          setCmsErrorMessage(
            "Live CMS sync temporarily unavailable — displaying verified studio catalogue."
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const vaultCategories = useMemo(
    () => buildAtelierVaultCategories(catalogueCategories, catalogueDesigns),
    [catalogueCategories, catalogueDesigns]
  );

  const [selectedDesign, setSelectedDesign] =
    useState<CatalogueDesignItem | null>(() =>
      initialDesignParam
        ? findDesignBySlugOrId(initialDesignParam, DEVELOPMENT_FIXTURE_DESIGNS)
        : null
    );
  const [prevDesignParam, setPrevDesignParam] =
    useState<string>(initialDesignParam);

  if (initialDesignParam !== prevDesignParam) {
    setPrevDesignParam(initialDesignParam);
    setSelectedDesign(
      initialDesignParam
        ? findDesignBySlugOrId(initialDesignParam, catalogueDesigns)
        : null
    );
  }

  // Helper to update shareable URL query parameters without full page reload
  const syncUrlParams = useCallback(
    (
      next: {
        categorySlug?: string;
        designSlug?: string | null;
      },
      usePushHistory = false
    ) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("slot");

      const cat =
        next.categorySlug !== undefined
          ? next.categorySlug
          : activeCategorySlug;
      if (cat && cat !== "all") {
        params.set("category", cat);
      } else {
        params.delete("category");
      }

      if (next.designSlug !== undefined) {
        if (next.designSlug) {
          params.set("design", next.designSlug);
        } else {
          params.delete("design");
        }
      }

      const qs = params.toString();
      const targetUrl = qs ? `${pathname}?${qs}` : pathname;
      if (usePushHistory) {
        router.push(targetUrl, { scroll: false });
      } else {
        router.replace(targetUrl, { scroll: false });
      }
    },
    [activeCategorySlug, pathname, router, searchParams]
  );

  const handleSelectCategoryFromVault = useCallback(
    (slug: string) => {
      const nextSlug = slug || "all";
      setActiveCategorySlug(nextSlug);
      setPopupCategorySlug(nextSlug !== "all" ? nextSlug : null);
      syncUrlParams({ categorySlug: nextSlug }, true);
    },
    [syncUrlParams]
  );

  const handleCloseCategoryPopup = useCallback(() => {
    setPopupCategorySlug(null);
    setActiveCategorySlug("all");
    syncUrlParams({ categorySlug: "all" });
  }, [syncUrlParams]);

  const handleSwitchPopupCategory = useCallback(
    (cat: AtelierVaultCategoryItem) => {
      setActiveCategorySlug(cat.slug);
      setPopupCategorySlug(cat.slug);
      syncUrlParams({ categorySlug: cat.slug });
    },
    [syncUrlParams]
  );

  const handleInspectDesign = useCallback(
    (design: CatalogueDesignItem) => {
      setSelectedDesign(design);
      syncUrlParams({ designSlug: design.slug });
    },
    [syncUrlParams]
  );

  const activePopupCategory = useMemo(() => {
    if (!popupCategorySlug || popupCategorySlug === "all") return null;
    return (
      vaultCategories.find(
        (c) => c.slug.toLowerCase() === popupCategorySlug.toLowerCase()
      ) ?? null
    );
  }, [popupCategorySlug, vaultCategories]);

  const handleClosePreview = () => {
    setSelectedDesign(null);
    syncUrlParams({ designSlug: null });
  };

  const handlePreviewOnWall = async (design: CatalogueDesignItem) => {
    await stageDesignForWallVisualizer({
      id: design.id,
      name: design.title,
      category: `${design.categoryCode} (${design.categoryLabel})`,
      dataUrl: design.visualizerConfig.textureUrl,
      width: design.visualizerConfig.width,
      height: design.visualizerConfig.height,
      mimeType: design.visualizerConfig.mimeType,
      defaultMode: design.visualizerConfig.defaultMode,
      description: design.summary,
    });
    const href = buildVisualizerBridgeHref({
      designSlug: design.slug,
      designTitle: design.title,
      categorySlot: design.categorySlotNumber,
      mode: "camera",
    });
    router.push(href);
  };

  const handleScrollToCollection = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const target = document.getElementById("atelier-art-vault");
      if (!target) return;
      e.preventDefault();
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    },
    []
  );

  return (
    <PublicShell>
      {/* 01. SPLIT-SCREEN BOTANICAL GALLERY HERO (Section 06) */}
      <section
        aria-label="Explore Wall Art Designs Hero"
        className="relative overflow-hidden border-b border-[#DDD2C5]/80 bg-[#F5EFE6] lg:flex lg:min-h-[clamp(620px,calc(100svh-var(--navbar-height,74px)),860px)] lg:items-center"
      >
        {/* Subtle warm ambient light behind editorial typography */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-[#FAF9F6]/70 blur-3xl"
        />

        {/* 1 & 2. LEFT EDITORIAL CONTENT (First in DOM for semantic mobile-first order: Heading -> CTAs -> Image) */}
        <Container className="relative z-10 w-full">
          <FadeUp className="flex flex-col justify-center pt-7 pb-6 sm:pt-10 sm:pb-8 lg:w-[43%] lg:max-w-[500px] lg:py-12 xl:w-[41%] xl:max-w-[520px]">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-3">
              <span className="h-[1.5px] w-7 bg-[#9B1C1C]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9B1C1C]">
                {EXPLORE_DESIGNS_HERO_CONTENT.eyebrow}
              </span>
            </div>

            {/* Editorial Serif Heading — balanced 3-line hierarchy, "Every Space" kept intact on its own line */}
            <h1 className="mt-4 font-serif text-[clamp(2.05rem,3.95vw,3.85rem)] min-[360px]:text-[clamp(2.25rem,3.95vw,3.85rem)] font-semibold leading-[1.06] tracking-[-0.02em] text-[#1A1A1A]">
              <span className="block whitespace-nowrap">Explore Wall Art</span>
              <span className="block">Designs for</span>
              <em className="block font-serif italic font-semibold text-[#9B1C1C] whitespace-nowrap">
                Every Space
              </em>
            </h1>

            {/* Description */}
            <p className="mt-4 max-w-[430px] text-[15px] leading-[1.68] text-[#4E4640] sm:text-[15.5px]">
              {EXPLORE_DESIGNS_HERO_CONTENT.description}
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="mt-7 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap min-[420px]:items-center min-[420px]:gap-3.5">
              <a
                href="#atelier-art-vault"
                onClick={handleScrollToCollection}
                className="group inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#9B1C1C] px-6 text-[13.5px] font-medium tracking-[0.01em] text-[#FAF9F6] shadow-[0_8px_22px_-8px_rgba(155,28,28,0.5)] transition-all duration-200 hover:bg-[#7F1616] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C] min-[420px]:w-auto"
              >
                <span>{EXPLORE_DESIGNS_HERO_CONTENT.primaryCtaLabel}</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>

              <Link
                href="/visualizer"
                className="group inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-[#D4C5B4] bg-[#FAF9F6]/90 px-5 text-[13.5px] font-medium tracking-[0.01em] text-[#1A1A1A] shadow-2xs backdrop-blur-xs transition-all duration-200 hover:border-[#9B1C1C] hover:bg-[#FAF9F6] hover:text-[#9B1C1C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C] min-[420px]:w-auto"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#9B1C1C]/40 bg-[#9B1C1C]/[0.06] text-[#9B1C1C] transition-colors duration-200 group-hover:border-[#9B1C1C] group-hover:bg-[#9B1C1C] group-hover:text-[#FAF9F6]">
                  <Play className="h-2.5 w-2.5 translate-x-[0.5px] fill-current" />
                </span>
                <span>{EXPLORE_DESIGNS_HERO_CONTENT.secondaryCtaLabel}</span>
              </Link>
            </div>
          </FadeUp>
        </Container>

        {/* 3. RIGHT ARCHITECTURAL PHOTOGRAPHY (66–68% on Desktop for full vertical & horizontal room framing, full native aspect below CTAs on Mobile/Tablet) */}
        <div className="relative w-full aspect-[1145/768] min-h-[250px] overflow-hidden lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:h-full lg:w-[66%] xl:w-[68%]">
          <Image
            src={EXPLORE_DESIGNS_HERO_CONTENT.heroImage}
            alt={EXPLORE_DESIGNS_HERO_CONTENT.heroImageAlt}
            width={1145}
            height={768}
            priority
            quality={92}
            sizes="(max-width: 1023px) 100vw, 68vw"
            className="h-full w-full object-cover object-[54%_82%] lg:object-[58%_88%] xl:object-[56%_88%]"
          />

          {/* Desktop left-to-right feather blend — transitions warm cream editorial canvas into the room interior */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-36 bg-gradient-to-r from-[#F5EFE6] via-[#F5EFE6]/82 via-42% to-transparent lg:block xl:w-48"
          />

          {/* Mobile/Tablet top feather blend from editorial copy into room photography */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#F5EFE6] via-[#F5EFE6]/45 to-transparent sm:h-10 lg:hidden"
          />

          {/* Soft warm cream bottom edge transition into "13 Worlds of Wall Art" */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#F7F3ED]/45 to-transparent"
          />
        </div>
      </section>

      {/* 02. THE ATELIER ART VAULT — 13 WORLDS OF WALL ART (Interactive ZoomSlider) */}
      <AtelierCategoryExplorer
        categories={vaultCategories}
        activeCategorySlug={activeCategorySlug}
        onSelectCategorySlug={handleSelectCategoryFromVault}
        errorMessage={cmsErrorMessage}
        onRetry={syncCatalogueFromApi}
        isModalOpen={Boolean(activePopupCategory || selectedDesign)}
      />

      {/* 03. INTERACTIVE WALL VISUALIZER SHOWCASE — "See It on Your Wall." */}
      <TabletVisualizerShowcase />

      {/* 04. CUSTOM WALL ART COMMISSION SECTION — "Need Something Unique?" (Section 12) */}
      <section className="bg-[#F8F3ED] py-12 sm:py-16">
        <Container>
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            {/* Heading */}
            <div className="lg:col-span-3">
              <div className="inline-flex items-center gap-2.5">
                <span className="h-[1.5px] w-6 bg-[#991D20]" />
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#991D20]">
                  CUSTOM WALL ART
                </span>
              </div>
              <h2 className="mt-2 font-serif text-3xl font-medium leading-[1.12] text-[#201C1A] sm:text-4xl">
                Need Something
                <br />
                Unique?
              </h2>
            </div>

            {/* Description */}
            <div className="lg:col-span-3 lg:border-l lg:border-[#DED5CB] lg:pl-6">
              <p className="text-[13.5px] leading-relaxed text-[#5E554F]">
                Commission a bespoke wall artwork tailored to your space,
                materials, and design vision.
              </p>
            </div>

            {/* Three Process Pillars */}
            <div className="grid grid-cols-3 gap-4 text-center lg:col-span-3">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#991D20]/25 bg-[#FDF8F3] text-[#991D20]">
                  <PenTool className="h-4 w-4" />
                </div>
                <span className="mt-2 text-[11.5px] font-semibold leading-tight text-[#201C1A]">
                  Concept
                  <br />
                  Development
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#991D20]/25 bg-[#FDF8F3] text-[#991D20]">
                  <Layers className="h-4 w-4" />
                </div>
                <span className="mt-2 text-[11.5px] font-semibold leading-tight text-[#201C1A]">
                  Artwork
                  <br />
                  Customization
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#991D20]/25 bg-[#FDF8F3] text-[#991D20]">
                  <Printer className="h-4 w-4" />
                </div>
                <span className="mt-2 text-[11.5px] font-semibold leading-tight text-[#201C1A]">
                  Print &amp;
                  <br />
                  Installation
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex lg:col-span-3 lg:justify-end">
              <Link
                href="/contact?interest=Custom+Wall+Art+Commission"
                className="inline-flex items-center gap-2 rounded-xl bg-[#991D20] px-6 py-3.5 text-[13px] font-medium text-[#F8F3ED] shadow-sm transition-colors hover:bg-[#73171B]"
              >
                <span>Start a Custom Enquiry</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Category Designs Popup Cards Modal */}
      <CategoryDesignsPopupModal
        category={activePopupCategory}
        categories={vaultCategories}
        allDesigns={catalogueDesigns}
        onClose={handleCloseCategoryPopup}
        onSelectCategory={handleSwitchPopupCategory}
        onInspectDesign={handleInspectDesign}
        onPreviewOnWall={handlePreviewOnWall}
      />

      {/* Artwork Quick View Modal (Section 10) */}
      <DesignPreviewModal
        design={selectedDesign}
        onClose={handleClosePreview}
        onPreviewOnWall={handlePreviewOnWall}
      />
    </PublicShell>
  );
}

export default function ExploreDesignsPage() {
  return (
    <Suspense
      fallback={
        <PublicShell>
          <div className="min-h-[70vh] bg-[#F8F3ED] py-20 text-center text-sm text-[#756C65]">
            Loading Atelier Collection…
          </div>
        </PublicShell>
      }
    >
      <ExploreDesignsWorkspace />
    </Suspense>
  );
}
