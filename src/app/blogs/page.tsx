"use client";
/* eslint-disable @next/next/no-img-element */

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PublicShell } from "@/components/layout/PublicShell";
import { Container } from "@/components/layout/Container";
import {
  BLOG_DRAFT_CATEGORIES,
  BlogArticleRecord,
  BLOGS_PAGE_CONTENT,
  DEVELOPMENT_BLOG_FIXTURES,
  filterBlogArticles,
} from "@/lib/blogs-catalogue";
import {
  ArrowRight,
  BookOpen,
  Clock,
  FolderOpen,
  RotateCcw,
  Search,
  X,
} from "lucide-react";

const INITIAL_GRID_PAGE_SIZE = 3;

function BlogsListingWorkspace() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlCategorySlug = searchParams.get("category") || "all";
  const initialQuery = searchParams.get("q") || "";

  const [activeCategory, setActiveCategory] =
    useState<string>(urlCategorySlug);
  const [prevUrlCategory, setPrevUrlCategory] =
    useState<string>(urlCategorySlug);

  if (urlCategorySlug !== prevUrlCategory) {
    setPrevUrlCategory(urlCategorySlug);
    setActiveCategory(urlCategorySlug);
  }

  const [searchInput, setSearchInput] = useState<string>(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState<string>(initialQuery);
  const [visibleGridCount, setVisibleGridCount] = useState<number>(
    INITIAL_GRID_PAGE_SIZE
  );
  const [liveDbArticles, setLiveDbArticles] =
    useState<ReadonlyArray<BlogArticleRecord> | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchInput);
    }, 180);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  // Fetch published articles from /api/blogs if available, falling back to approved studio journal essays
  useEffect(() => {
    let active = true;
    fetch("/api/blogs")
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!active || !payload) return;
        if (Array.isArray(payload.articles) && payload.articles.length > 0) {
          setLiveDbArticles(payload.articles);
        }
      })
      .catch(() => {
        // Use fallback DEVELOPMENT_BLOG_FIXTURES
      });
    return () => {
      active = false;
    };
  }, []);

  const syncUrl = useCallback(
    (next: { category?: string; query?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      const cat =
        next.category !== undefined ? next.category : activeCategory;
      if (cat && cat !== "all") {
        params.set("category", cat);
      } else {
        params.delete("category");
      }

      const q = next.query !== undefined ? next.query : debouncedQuery;
      if (q && q.trim().length > 0) {
        params.set("q", q.trim());
      } else {
        params.delete("q");
      }

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, activeCategory, debouncedQuery, pathname, router]
  );

  const activeSource = useMemo<ReadonlyArray<BlogArticleRecord>>(
    () =>
      liveDbArticles && liveDbArticles.length > 0
        ? liveDbArticles
        : DEVELOPMENT_BLOG_FIXTURES,
    [liveDbArticles]
  );

  const filteredArticles = useMemo(
    () =>
      filterBlogArticles(activeSource, {
        categorySlug: activeCategory,
        searchQuery: debouncedQuery,
      }),
    [activeSource, activeCategory, debouncedQuery]
  );

  const showFeaturedBanner =
    activeCategory === "all" &&
    debouncedQuery.trim().length === 0 &&
    filteredArticles.length > 0;

  // Deterministic featured article selection (respecting featured flag first)
  const featuredArticle = useMemo(() => {
    if (!showFeaturedBanner) return null;
    return (
      filteredArticles.find((a) => a.featured) ?? filteredArticles[0] ?? null
    );
  }, [filteredArticles, showFeaturedBanner]);

  // Dynamic exclusion so the featured story is never duplicated in the main grid
  const gridArticles = useMemo(() => {
    if (!featuredArticle) return filteredArticles;
    return filteredArticles.filter((a) => a.id !== featuredArticle.id);
  }, [filteredArticles, featuredArticle]);

  const visibleGridArticles = useMemo(
    () => gridArticles.slice(0, visibleGridCount),
    [gridArticles, visibleGridCount]
  );

  const remainingGridCount = Math.max(
    0,
    gridArticles.length - visibleGridArticles.length
  );
  const hasMoreGridArticles = remainingGridCount > 0;

  const handleResetFilters = () => {
    setActiveCategory("all");
    setSearchInput("");
    setDebouncedQuery("");
    setVisibleGridCount(INITIAL_GRID_PAGE_SIZE);
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-[#F8F3ED] text-[#1A1A1A]">
      {/* =====================================================================
          SECTION 01 — SCULPTURAL EDITORIAL HERO
          Flowing cream plaster wall curving into a deep burgundy alcove with
          natural venetian sunlight, ceramic botanical vase & identity panel
          ===================================================================== */}
      <section
        aria-labelledby="blogs-hero-heading"
        className="relative overflow-hidden bg-gradient-to-br from-[#FAF9F6] via-[#F4ECE1] to-[#E6DACB] pt-8 pb-16 sm:pt-10 lg:pt-12 lg:pb-22"
      >
        {/* Subtle sculptural curved plaster contour lines */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 h-[460px] w-[460px] rounded-full border border-[#DED5CB]/80 bg-gradient-to-br from-white/55 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-12 left-1/4 h-[540px] w-[540px] rounded-full border border-[#E2D6C5]/55"
        />

        <Container className="relative z-10">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-8">
            {/* Left Column (5 cols): Editorial Headline & Supporting Copy */}
            <div className="lg:col-span-5">
              <div className="mb-3.5 flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-[1.5px] w-8 bg-[#9B1C1C]"
                />
                <span className="text-[11px] font-bold tracking-[0.22em] text-[#9B1C1C] uppercase">
                  {BLOGS_PAGE_CONTENT.hero.eyebrow}
                </span>
              </div>

              <h1
                id="blogs-hero-heading"
                className="font-serif text-[clamp(2.65rem,4.7vw,4.35rem)] leading-[1.02] font-normal tracking-[-0.02em]"
              >
                <span className="block text-[#1A1A1A]">
                  {BLOGS_PAGE_CONTENT.hero.headlineLine1}
                </span>
                <span className="mt-1 block text-[#9B1C1C]">
                  {BLOGS_PAGE_CONTENT.hero.headlineLine2}
                </span>
              </h1>

              <p className="mt-4 max-w-[38ch] text-[15px] leading-[1.68] text-[#655B54] sm:text-[16px]">
                {BLOGS_PAGE_CONTENT.hero.supportingText}
              </p>
            </div>

            {/* Right Column (7 cols): Sculptural Burgundy Alcove, Botanical Vase & Translucent Journal Identity Panel */}
            <div className="lg:col-span-7">
              <div className="relative overflow-hidden rounded-tl-[110px] rounded-tr-[30px] rounded-b-[30px] border border-[#D9C8B5] bg-[#241B18] shadow-[0_26px_65px_rgba(36,27,24,0.16)]">
                <div className="relative aspect-[16/9.8] w-full">
                  <img
                    src="/images/atelier/journal-hero-burgundy-alcove.jpg"
                    alt="Sculpted ivory plaster wall curving into a deep burgundy architectural alcove with natural window shadows and a ceramic vase of dried blossoms"
                    className="h-full w-full object-cover object-center"
                  />
                  {/* Soft vignette for contrast */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#241B18]/45" />

                  {/* Floating Translucent Journal Identity Panel (Top-Right inside Alcove) */}
                  <div className="m-3 rounded-[22px] border border-[#E5DACE] bg-[#FAF9F6]/92 p-4 text-[#1A1A1A] shadow-[0_18px_42px_rgba(24,18,14,0.22)] backdrop-blur-md sm:absolute sm:top-6 sm:right-6 sm:bottom-auto sm:left-auto sm:m-0 sm:max-w-[320px] sm:p-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10.5px] font-bold tracking-[0.18em] text-[#9B1C1C] uppercase">
                        THE ATELIER JOURNAL
                      </span>
                      <span className="rounded-full bg-[#9B1C1C] px-2.5 py-0.5 text-[10px] font-bold tracking-[0.12em] text-white uppercase">
                        {activeSource.length}{" "}
                        {activeSource.length === 1 ? "Essay" : "Essays"}
                      </span>
                    </div>
                    <p className="mt-2.5 text-[12px] leading-[1.58] text-[#5C534C]">
                      Editorial notes from our Mumbai studio exploring
                      direct-to-wall 3D printing, architectural murals,
                      multi-surface substrates, and spatial visualization.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =====================================================================
          SECTION 02 — FLOATING JOURNAL SEARCH & FILTER PANEL
          Bridges the sculptural hero and the featured editorial story
          ===================================================================== */}
      <section
        aria-label="Journal search and category filters"
        className="relative z-20 -mt-8 pb-6 lg:-mt-10"
      >
        <Container>
          <div className="rounded-[26px] border border-[#DED5CB] bg-[#FAF9F6]/95 p-4 shadow-[0_20px_50px_rgba(26,26,26,0.08)] backdrop-blur-md sm:p-6">
            <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-12 lg:gap-6">
              {/* Left: Search Input (5 cols) */}
              <div className="lg:col-span-5">
                <div className="relative">
                  <label htmlFor="blog-search-input" className="sr-only">
                    Search stories, ideas, materials
                  </label>
                  <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#756C65]" />
                  <input
                    id="blog-search-input"
                    type="search"
                    value={searchInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchInput(val);
                      setVisibleGridCount(INITIAL_GRID_PAGE_SIZE);
                      syncUrl({ query: val });
                    }}
                    placeholder="Search stories, ideas, materials..."
                    className="w-full rounded-full border border-[#D9C8B5] bg-[#F8F3ED] py-2.5 pr-10 pl-10 text-[13px] text-[#1A1A1A] placeholder:text-[#8A7F75] focus:border-[#9B1C1C] focus:bg-white focus:outline-none"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput("");
                        setDebouncedQuery("");
                        syncUrl({ query: "" });
                      }}
                      aria-label="Clear article search"
                      className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer p-1 text-[#756C65] hover:text-[#9B1C1C]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Right: Category Pills (7 cols) */}
              <div className="lg:col-span-7 lg:border-l lg:border-[#E5DACE] lg:pl-6">
                <div
                  role="tablist"
                  aria-label="Filter articles by editorial category"
                  className="flex flex-wrap items-center gap-2"
                >
                  <span className="mr-1 text-[10.5px] font-bold tracking-[0.18em] text-[#756C65] uppercase">
                    CATEGORIES:
                  </span>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeCategory === "all"}
                    onClick={() => {
                      setActiveCategory("all");
                      setVisibleGridCount(INITIAL_GRID_PAGE_SIZE);
                      syncUrl({ category: "all" });
                    }}
                    className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[11px] font-bold tracking-[0.1em] uppercase transition-all focus-visible:outline-2 focus-visible:outline-[#9B1C1C] ${
                      activeCategory === "all"
                        ? "border-[#241B18] bg-[#241B18] text-white shadow-xs"
                        : "border-[#DED5CB] bg-[#F8F3ED] text-[#241B18] hover:border-[#9B1C1C]"
                    }`}
                  >
                    All Articles ({activeSource.length})
                  </button>

                  {BLOG_DRAFT_CATEGORIES.map((cat) => {
                    const isSelected = activeCategory === cat.slug;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        onClick={() => {
                          setActiveCategory(cat.slug);
                          setVisibleGridCount(INITIAL_GRID_PAGE_SIZE);
                          syncUrl({ category: cat.slug });
                        }}
                        className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[11px] font-bold tracking-[0.1em] uppercase transition-all focus-visible:outline-2 focus-visible:outline-[#9B1C1C] ${
                          isSelected
                            ? "border-[#9B1C1C] bg-[#9B1C1C] text-white shadow-xs"
                            : "border-[#DED5CB] bg-[#F8F3ED] text-[#241B18] hover:border-[#9B1C1C]"
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}

                  {(activeCategory !== "all" ||
                    debouncedQuery.trim().length > 0) && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="ml-auto inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#9B1C1C]/40 bg-[#9B1C1C]/10 px-3 py-1 text-[10.5px] font-bold tracking-[0.1em] text-[#9B1C1C] uppercase hover:bg-[#9B1C1C] hover:text-white"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Reset ({filteredArticles.length})</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =====================================================================
          SECTIONS 03 & 04 — FEATURED EDITORIAL STORY & 3-COLUMN ARTICLE GRID
          ===================================================================== */}
      <section aria-label="Featured story and curated journal collection" className="py-8 lg:py-12">
        <Container>
          {filteredArticles.length === 0 ? (
            <div className="rounded-[26px] border border-[#DED5CB] bg-[#FAF9F6] p-10 text-center shadow-sm sm:p-14">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#9B1C1C]/10 text-[#9B1C1C]">
                <FolderOpen className="h-6 w-6" />
              </div>
              <p className="mt-4 text-[11px] font-bold tracking-[0.2em] text-[#9B1C1C] uppercase">
                No Matching Stories
              </p>
              <h2 className="mt-2 font-serif text-3xl font-normal text-[#1A1A1A]">
                No journal entries matched your search or category filter
              </h2>
              <p className="mx-auto mt-2 max-w-md text-[13.5px] text-[#756C65]">
                Try clearing your search query or switching back to All Articles
                to browse the complete studio collection.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#9B1C1C] px-6 py-3 text-[12px] font-bold tracking-[0.14em] text-white uppercase shadow-sm hover:bg-[#73171B]"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset Search &amp; Filters</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-14">
              {/* =============================================================
                  SECTION 03 — THE FEATURED EDITORIAL STORY
                  ============================================================= */}
              {featuredArticle && (
                <article className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
                  {/* Left 58% (7 cols): Sculptural Arch-Corner Cover Photography */}
                  <div className="lg:col-span-7">
                    <Link
                      href={`/blogs/${featuredArticle.slug}`}
                      className="group relative block overflow-hidden rounded-tl-[96px] rounded-tr-[24px] rounded-b-[24px] border border-[#D9C8B5] bg-[#241B18] shadow-[0_24px_55px_rgba(36,27,24,0.14)]"
                    >
                      <div className="aspect-[16/10] w-full overflow-hidden">
                        <img
                          src={featuredArticle.coverImage.secureUrl}
                          alt={featuredArticle.coverImage.altText}
                          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                      </div>

                      {/* Top-Left Badges matching Design Reference */}
                      <div className="pointer-events-none absolute top-5 left-6 flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-[#9B1C1C] px-3 py-1 text-[10.5px] font-bold tracking-[0.14em] text-white uppercase shadow-sm">
                          FEATURED • {featuredArticle.categoryName}
                        </span>
                        <span className="rounded-md bg-[#241B18]/90 px-3 py-1 text-[10.5px] font-bold tracking-[0.14em] text-[#FAF9F6] uppercase backdrop-blur-xs">
                          STUDIO ESSAY
                        </span>
                      </div>
                    </Link>
                  </div>

                  {/* Right 42% (5 cols): Editorial Article Details */}
                  <div className="lg:col-span-5">
                    <div className="flex flex-wrap items-center gap-2.5 text-[11.5px] font-bold tracking-[0.14em] uppercase">
                      <span className="text-[#9B1C1C]">
                        {featuredArticle.categoryName}
                      </span>
                      <span className="text-[#C8B9A6]">•</span>
                      <span className="inline-flex items-center gap-1.5 font-medium text-[#756C65] normal-case">
                        <Clock className="h-3.5 w-3.5 text-[#9B1C1C]" />
                        <span>{featuredArticle.readingTimeMinutes} min read</span>
                      </span>
                    </div>

                    <h2 className="mt-3 font-serif text-[clamp(1.95rem,3.2vw,2.75rem)] leading-[1.12] font-normal tracking-[-0.015em] text-[#1A1A1A]">
                      <Link
                        href={`/blogs/${featuredArticle.slug}`}
                        className="transition-colors hover:text-[#9B1C1C]"
                      >
                        {featuredArticle.title}
                      </Link>
                    </h2>

                    <p className="mt-4 text-[14.5px] leading-[1.68] text-[#5C534C]">
                      {featuredArticle.excerpt}
                    </p>

                    <p className="mt-4 text-[12px] font-medium text-[#756C65]">
                      Status:{" "}
                      <span className="text-[#241B18]">
                        {featuredArticle.publishedAtLabel}
                      </span>
                    </p>

                    <div className="mt-6">
                      <Link
                        href={`/blogs/${featuredArticle.slug}`}
                        className="inline-flex items-center gap-2.5 rounded-xl bg-[#8A181C] px-5 py-3 text-[11.5px] font-bold tracking-[0.14em] text-white uppercase shadow-[0_10px_24px_rgba(138,24,28,0.28)] transition-all hover:bg-[#73171B]"
                      >
                        <BookOpen className="h-4 w-4" />
                        <span>Read Full Article</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              )}

              {/* =============================================================
                  SECTION 04 — THE CURATED ARTICLE COLLECTION (3-COLUMN GRID)
                  ============================================================= */}
              {visibleGridArticles.length > 0 && (
                <div>
                  <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
                    {visibleGridArticles.map((post, idx) => {
                      // Center card in the 3-column row gets a subtle magazine highlight border
                      const isCenterFeature = idx === 1;
                      return (
                        <article
                          key={post.id}
                          className={`group flex flex-col justify-between overflow-hidden rounded-[22px] border bg-[#FAF9F6] transition-all duration-300 hover:-translate-y-1.5 ${
                            isCenterFeature
                              ? "border-[#9B1C1C]/45 shadow-[0_20px_45px_rgba(115,23,27,0.1)] lg:-translate-y-2"
                              : "border-[#DED5CB] shadow-[0_14px_34px_rgba(26,26,26,0.06)] hover:border-[#9B1C1C]/45"
                          }`}
                        >
                          <div>
                            <Link
                              href={`/blogs/${post.slug}`}
                              className="relative block aspect-[16/10.5] overflow-hidden bg-[#241B18]"
                            >
                              <img
                                src={post.coverImage.secureUrl}
                                alt={post.coverImage.altText}
                                loading="lazy"
                                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                              />
                              <div className="absolute inset-x-3.5 top-3.5 flex items-center justify-between gap-2">
                                <span className="rounded-md bg-[#241B18]/90 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-white uppercase backdrop-blur-xs">
                                  {post.categoryName}
                                </span>
                                <span className="rounded-md bg-[#9B1C1C] px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-white uppercase">
                                  JOURNAL
                                </span>
                              </div>
                            </Link>

                            <div className="p-6">
                              <div className="flex items-center justify-between text-[11.5px] text-[#756C65]">
                                <span className="inline-flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5 text-[#9B1C1C]" />
                                  <span>{post.readingTimeMinutes} min read</span>
                                </span>
                                <span>Editorial Study</span>
                              </div>

                              <h3
                                className={`mt-2.5 font-serif text-[22px] leading-[1.22] font-normal transition-colors ${
                                  isCenterFeature
                                    ? "text-[#73171B] group-hover:text-[#9B1C1C]"
                                    : "text-[#1A1A1A] group-hover:text-[#9B1C1C]"
                                }`}
                              >
                                <Link href={`/blogs/${post.slug}`}>
                                  {post.title}
                                </Link>
                              </h3>

                              <p className="mt-2.5 line-clamp-3 text-[13px] leading-[1.6] text-[#6E645D]">
                                {post.excerpt}
                              </p>
                            </div>
                          </div>

                          <div className="px-6 pt-1 pb-5">
                            <Link
                              href={`/blogs/${post.slug}`}
                              className="inline-flex items-center gap-1.5 text-[11.5px] font-bold tracking-[0.14em] text-[#8A181C] uppercase transition-colors group-hover:text-[#1A1A1A]"
                            >
                              <span>Read Article</span>
                              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                            </Link>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </Container>
      </section>

      {/* =====================================================================
          SECTION 05 — SCULPTURAL EDITORIAL DIVIDER ("EDITOR'S NOTES")
          Curved warm cream architectural alcove + travertine still-life plinth
          ===================================================================== */}
      <section
        aria-labelledby="editors-notes-heading"
        className="relative overflow-hidden py-8 lg:py-10"
      >
        <Container>
          <div className="relative overflow-hidden rounded-tl-[64px] rounded-tr-[28px] rounded-b-[28px] border border-[#DDD2C5] bg-gradient-to-r from-[#FBF8F3] via-[#F6EAE6] to-[#EBE3D8] shadow-[0_18px_45px_rgba(33,29,26,0.08)]">
            <div className="grid grid-cols-1 items-center lg:grid-cols-12">
              {/* Left & Center (7.5 cols -> 7 cols): Warm Cream Curved Backdrop & Editorial Note */}
              <div className="p-7 text-[#211D1A] sm:p-9 lg:col-span-7 lg:p-11">
                <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
                  <div className="md:col-span-6">
                    <div className="mb-2 flex items-center gap-2.5">
                      <span className="h-[1.5px] w-5 bg-[#9B1C1C]" />
                      <span className="text-[10px] font-bold tracking-[0.22em] text-[#9B1C1C] uppercase">
                        EDITOR&apos;S NOTES
                      </span>
                      <span className="h-[1.5px] w-5 bg-[#9B1C1C]" />
                    </div>
                    <h2
                      id="editors-notes-heading"
                      className="font-serif text-[clamp(1.85rem,2.8vw,2.5rem)] leading-[1.1] font-normal italic text-[#211D1A]"
                    >
                      Curated Thoughts for <br />
                      <span className="text-[#9B1C1C]">Design-Led Spaces.</span>
                    </h2>
                  </div>

                  <div className="border-[#DDD2C5] md:col-span-6 md:border-l md:pl-6">
                    <p className="text-[13.5px] leading-[1.65] text-[#6F665E]">
                      Perspectives on materials, murals, interiors, and the
                      creative possibilities of architectural surfaces—crafted by
                      our studio in Oshiwara, Andheri West, Mumbai.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right (5 cols): Sculptural Travertine Plinth, Books & Brass Lamp Still Life */}
              <div className="relative h-full min-h-[210px] lg:col-span-5">
                <img
                  src="/images/atelier/journal-divider-still-life.jpg"
                  alt="Warm cream travertine plinth with stacked linen books, glowing brass dome lamp, and dried botanicals"
                  className="h-full w-full object-cover object-center"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-[#F6EAE6] to-transparent lg:block"
                />
              </div>
            </div>
          </div>

          {/* =================================================================
              SECTION 06 — LOAD MORE STORIES / PAGINATION CONTROL
              ================================================================= */}
          {hasMoreGridArticles && (
            <div className="mt-8 flex justify-center pb-4">
              <button
                type="button"
                onClick={() =>
                  setVisibleGridCount((prev) => prev + INITIAL_GRID_PAGE_SIZE)
                }
                className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl bg-[#9B1C1C] px-7 py-3.5 text-[11.5px] font-bold tracking-[0.16em] text-[#FAF9F6] uppercase shadow-md transition-all hover:bg-[#73171B]"
              >
                <span>
                  {remainingGridCount === 1
                    ? "View Last Story"
                    : `Load More Stories (${remainingGridCount})`}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </Container>
      </section>
    </div>
  );
}

export default function BlogsPage() {
  return (
    <PublicShell>
      <Suspense
        fallback={
          <div className="py-36 text-center font-serif text-2xl text-[#1A1A1A]">
            Loading ATELIER — WALL STORY Editorial Journal…
          </div>
        }
      >
        <BlogsListingWorkspace />
      </Suspense>
    </PublicShell>
  );
}
