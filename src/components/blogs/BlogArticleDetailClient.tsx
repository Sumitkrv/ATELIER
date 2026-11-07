"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState } from "react";
import Link from "next/link";
import { PublicShell } from "@/components/layout/PublicShell";
import { Container } from "@/components/layout/Container";
import {
  BlogArticleRecord,
  DEVELOPMENT_BLOG_FIXTURES,
} from "@/lib/blogs-catalogue";
import { ATELIER_BRAND, buildWhatsAppUrl } from "@/lib/brand";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Box,
  Check,
  ChevronRight,
  Clock,
  Copy,
  Compass,
  Quote,
  Share2,
  Sparkles,
  Tag,
} from "lucide-react";

interface BlogArticleDetailClientProps {
  article: BlogArticleRecord;
}

export function BlogArticleDetailClient({
  article,
}: BlogArticleDetailClientProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  const relatedArticles = DEVELOPMENT_BLOG_FIXTURES.filter(
    (item) => item.slug !== article.slug && item.published
  ).slice(0, 3);

  const handleCopyLink = async () => {
    try {
      const shareUrl =
        typeof window !== "undefined"
          ? window.location.href
          : `/blogs/${article.slug}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2400);
    } catch {
      setCopiedLink(false);
    }
  };

  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    articleSection: article.categoryName,
    image: [article.coverImage.secureUrl],
    publisher: {
      "@type": "Organization",
      name: ATELIER_BRAND.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: `${ATELIER_BRAND.address.line1}, ${ATELIER_BRAND.address.line2}`,
        addressLocality: "Mumbai",
        postalCode: "400102",
        addressCountry: "IN",
      },
    },
    ...(article.publishedIso ? { datePublished: article.publishedIso } : {}),
    ...(article.authorLabel
      ? {
          author: {
            "@type": "Person",
            name: article.authorLabel,
          },
        }
      : {}),
  };

  return (
    <PublicShell>
      {/* Structured Data (Article Schema) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />

      <div className="min-h-screen bg-[#F8F3ED] text-[#1A1A1A]">
        {/* ================================================================
            01 — SCULPTURAL EDITORIAL ARTICLE HERO HEADER
            ================================================================ */}
        <section className="relative overflow-hidden border-b border-[#DED5CB] bg-gradient-to-br from-[#FAF9F6] via-[#F5EDE2] to-[#E8DEC8] pt-8 pb-12 lg:pt-10 lg:pb-16">
          {/* Subtle sculptural plaster curve & burgundy ambient glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 h-[420px] w-[420px] rounded-full bg-gradient-to-bl from-[#73171B]/12 via-[#D9C8B5]/25 to-transparent blur-2xl"
          />

          <Container className="relative z-10">
            <div className="mx-auto max-w-4xl">
              {/* Editorial Breadcrumb */}
              <nav
                aria-label="Article breadcrumb"
                className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-[#756C65] uppercase"
              >
                <Link
                  href="/blogs"
                  className="inline-flex items-center gap-1.5 text-[#9B1C1C] transition-colors hover:text-[#1A1A1A]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>The Atelier Journal</span>
                </Link>
                <ChevronRight className="h-3.5 w-3.5 text-[#B8ACA0]" />
                <Link
                  href={`/blogs?category=${article.categorySlug}`}
                  className="transition-colors hover:text-[#9B1C1C]"
                >
                  {article.categoryName}
                </Link>
              </nav>

              {/* Category, Reading Time & Studio Essay Badges */}
              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <Link
                  href={`/blogs?category=${article.categorySlug}`}
                  className="rounded-full bg-[#9B1C1C] px-3.5 py-1 text-[10.5px] font-bold tracking-[0.16em] text-white uppercase transition-colors hover:bg-[#73171B]"
                >
                  {article.categoryName}
                </Link>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D9C8B5] bg-[#FAF9F6] px-3 py-1 text-[11px] font-semibold text-[#5C534C]">
                  <Clock className="h-3.5 w-3.5 text-[#9B1C1C]" />
                  <span>{article.readingTimeMinutes} min read</span>
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D9C8B5] bg-[#FAF9F6]/80 px-3 py-1 text-[11px] font-medium text-[#756C65]">
                  <Sparkles className="h-3.5 w-3.5 text-[#9B1C1C]" />
                  <span>{article.publishedAtLabel}</span>
                </span>
              </div>

              {/* Oversized Editorial Serif Title */}
              <h1 className="mt-5 font-serif text-[clamp(2.15rem,4vw,3.45rem)] leading-[1.08] font-normal tracking-[-0.02em] text-[#1A1A1A]">
                {article.title}
              </h1>

              {/* Lead Excerpt */}
              <p className="mt-4 max-w-3xl text-[16px] leading-[1.68] text-[#5C534C] sm:text-[17.5px]">
                {article.excerpt}
              </p>

              {/* Metadata & Share Controls Bar */}
              <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-[#DED5CB] pt-5">
                <div className="flex flex-wrap items-center gap-4 text-[11.5px] font-semibold tracking-[0.12em] text-[#756C65] uppercase">
                  <span>{ATELIER_BRAND.name} • Mumbai Studio</span>
                  {article.authorLabel && (
                    <span>By {article.authorLabel}</span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#D9C8B5] bg-[#FAF9F6] px-3.5 py-1.5 text-[11px] font-bold tracking-[0.1em] text-[#1A1A1A] uppercase transition-colors hover:border-[#9B1C1C] hover:text-[#9B1C1C]"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#9B1C1C]" />
                        <span>Link Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-[#9B1C1C]" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  <a
                    href={buildWhatsAppUrl(
                      undefined,
                      `Reading "${article.title}" on ${ATELIER_BRAND.name}: /blogs/${article.slug}`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#D9C8B5] bg-[#FAF9F6] px-3.5 py-1.5 text-[11px] font-bold tracking-[0.1em] text-[#1A1A1A] uppercase transition-colors hover:border-[#9B1C1C] hover:text-[#9B1C1C]"
                  >
                    <Share2 className="h-3.5 w-3.5 text-[#9B1C1C]" />
                    <span>Share via WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* ================================================================
            02 — MAIN ARTICLE BODY & SCULPTURAL COVER FIGURE
            ================================================================ */}
        <article className="py-12 lg:py-16">
          <Container>
            <div className="mx-auto max-w-4xl">
              {/* Sculptural Arch-Corner Cover Figure */}
              <figure className="overflow-hidden rounded-tl-[72px] rounded-tr-[24px] rounded-b-[24px] border border-[#D9C8B5] bg-[#241B18] shadow-[0_24px_55px_rgba(36,27,24,0.12)]">
                <div className="aspect-[16/9.5] w-full overflow-hidden">
                  <img
                    src={article.coverImage.secureUrl}
                    alt={article.coverImage.altText}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-[#DED5CB] bg-[#FAF9F6] px-5 py-3 text-[11.5px] text-[#6E645D]">
                  <span>{article.coverImage.altText}</span>
                  <span className="font-bold tracking-[0.14em] text-[#9B1C1C] uppercase">
                    {ATELIER_BRAND.name}
                  </span>
                </figcaption>
              </figure>

              {/* Readable Editorial Column (max-w-3xl centered) */}
              <div className="mx-auto mt-12 max-w-[68ch] space-y-12">
                {article.sections.map((section, idx) => (
                  <section key={idx} className="space-y-5">
                    <h2 className="font-serif text-[clamp(1.65rem,2.5vw,2.2rem)] leading-[1.18] font-normal text-[#1A1A1A]">
                      {section.heading}
                    </h2>

                    {section.paragraphs.map((paragraph, pIdx) => (
                      <p
                        key={pIdx}
                        className="text-[16px] leading-[1.78] text-[#3F3833] sm:text-[17px]"
                      >
                        {paragraph}
                      </p>
                    ))}

                    {/* Key Takeaways / Bullet List */}
                    {section.bullets && section.bullets.length > 0 && (
                      <ul className="my-6 space-y-3 rounded-[22px] border border-[#DED5CB] bg-[#FAF9F6] p-6 shadow-2xs">
                        {section.bullets.map((bullet, bIdx) => (
                          <li
                            key={bIdx}
                            className="flex items-start gap-3 text-[15px] leading-[1.6] text-[#241B18]"
                          >
                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#9B1C1C]" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Editorial Pull Quote */}
                    {section.blockquote && (
                      <blockquote className="my-8 rounded-[24px] border border-[#D9C8B5] bg-gradient-to-br from-[#FAF9F6] to-[#EFE6DA] p-7 shadow-[0_12px_30px_rgba(36,27,24,0.05)] sm:p-8">
                        <Quote className="h-6 w-6 text-[#9B1C1C]" />
                        <p className="mt-3 font-serif text-[22px] leading-[1.4] font-normal italic text-[#1A1A1A] sm:text-[25px]">
                          &ldquo;{section.blockquote.text}&rdquo;
                        </p>
                        {section.blockquote.attribution && (
                          <footer className="mt-3 text-[11px] font-bold tracking-[0.18em] text-[#73171B] uppercase">
                            — {section.blockquote.attribution}
                          </footer>
                        )}
                      </blockquote>
                    )}

                    {/* Inline Figure */}
                    {section.figure && (
                      <figure className="my-8 overflow-hidden rounded-[22px] border border-[#DED5CB] bg-[#FAF9F6] shadow-sm">
                        <div className="aspect-[16/10] overflow-hidden bg-[#241B18]">
                          <img
                            src={section.figure.imageUrl}
                            alt={section.figure.altText}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <figcaption className="border-t border-[#DED5CB] px-5 py-3 text-[12px] text-[#6E645D]">
                          {section.figure.caption}
                        </figcaption>
                      </figure>
                    )}
                  </section>
                ))}

                {/* Article Tags & Bottom Navigation Bar */}
                <div className="mt-12 flex flex-col justify-between gap-4 border-y border-[#DED5CB] py-6 sm:flex-row sm:items-center">
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-[#9B1C1C]" />
                    {article.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/blogs?q=${encodeURIComponent(tag)}`}
                        className="rounded-full border border-[#DED5CB] bg-[#FAF9F6] px-3 py-1 text-[11px] font-semibold text-[#5C534C] transition-colors hover:border-[#9B1C1C] hover:text-[#9B1C1C]"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>

                  <Link
                    href="/blogs"
                    className="inline-flex items-center gap-2 rounded-full border border-[#D9C8B5] bg-[#FAF9F6] px-4 py-2 text-[11.5px] font-bold tracking-[0.1em] text-[#1A1A1A] uppercase transition-colors hover:border-[#9B1C1C] hover:text-[#9B1C1C]"
                  >
                    <BookOpen className="h-3.5 w-3.5 text-[#9B1C1C]" />
                    <span>All Journal Stories</span>
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </article>

        {/* ================================================================
            03 — RELATED EDITORIAL PERSPECTIVES
            ================================================================ */}
        {relatedArticles.length > 0 && (
          <section className="border-t border-[#DED5CB] bg-[#EFE7DC] py-14 lg:py-18">
            <Container>
              <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <div className="mb-2 flex items-center gap-2.5">
                    <span className="h-[1.5px] w-6 bg-[#9B1C1C]" />
                    <span className="text-[11px] font-bold tracking-[0.22em] text-[#9B1C1C] uppercase">
                      CONTINUE READING
                    </span>
                  </div>
                  <h2 className="font-serif text-[clamp(1.85rem,3vw,2.6rem)] leading-[1.1] font-normal text-[#1A1A1A]">
                    Related Editorial{" "}
                    <span className="italic text-[#73171B]">Perspectives</span>
                  </h2>
                </div>
                <Link
                  href="/blogs"
                  className="inline-flex items-center gap-1.5 text-[12px] font-bold tracking-[0.12em] text-[#9B1C1C] uppercase hover:underline"
                >
                  <span>Back to Journal</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {relatedArticles.map((rel) => (
                  <article
                    key={rel.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-[22px] border border-[#DED5CB] bg-[#FAF9F6] shadow-[0_14px_34px_rgba(36,27,24,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#9B1C1C]/50"
                  >
                    <div>
                      <Link
                        href={`/blogs/${rel.slug}`}
                        className="relative block aspect-[16/10] overflow-hidden bg-[#241B18]"
                      >
                        <img
                          src={rel.coverImage.secureUrl}
                          alt={rel.coverImage.altText}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-x-3.5 top-3.5 flex items-center justify-between gap-2">
                          <span className="rounded-md bg-[#241B18]/90 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-white uppercase">
                            {rel.categoryName}
                          </span>
                          <span className="rounded-md bg-[#9B1C1C] px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-white uppercase">
                            Journal
                          </span>
                        </div>
                      </Link>

                      <div className="p-5">
                        <div className="flex items-center justify-between text-[11px] text-[#756C65]">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3 text-[#9B1C1C]" />
                            <span>{rel.readingTimeMinutes} min read</span>
                          </span>
                          <span>Editorial Study</span>
                        </div>

                        <h3 className="mt-2 font-serif text-[21px] leading-[1.22] font-normal text-[#1A1A1A] transition-colors group-hover:text-[#9B1C1C]">
                          <Link href={`/blogs/${rel.slug}`}>{rel.title}</Link>
                        </h3>

                        <p className="mt-2 line-clamp-2 text-[12.5px] leading-[1.58] text-[#6E645D]">
                          {rel.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-[#E6DDD2] px-5 py-3.5">
                      <Link
                        href={`/blogs/${rel.slug}`}
                        className="inline-flex items-center gap-1.5 text-[11.5px] font-bold tracking-[0.12em] text-[#9B1C1C] uppercase group-hover:text-[#1A1A1A]"
                      >
                        <span>Read Article</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* ================================================================
            04 — JOURNAL-TO-DESIGN & WALL VISUALIZER CONVERSION CTA
            ================================================================ */}
        <section className="relative overflow-hidden border-t border-[#DDD2C5] bg-gradient-to-r from-[#FBF8F3] via-[#F6EAE6] to-[#EBE3D8] py-14 text-[#211D1A] lg:py-16">
          <Container className="relative z-10">
            <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <div className="mb-2 flex items-center gap-2.5">
                  <span className="h-[1.5px] w-6 bg-[#9B1C1C]" />
                  <span className="text-[10.5px] font-bold tracking-[0.22em] text-[#9B1C1C] uppercase">
                    FROM EDITORIAL TO EXECUTION
                  </span>
                </div>
                <h2 className="font-serif text-[clamp(1.9rem,3.1vw,2.75rem)] leading-[1.1] font-normal text-[#211D1A]">
                  Explore Designs or Preview Art{" "}
                  <span className="italic text-[#9B1C1C]">on Your Wall.</span>
                </h2>
                <p className="mt-2.5 text-[14px] leading-[1.65] text-[#6F665E]">
                  Browse our unified 13-category artwork collection, test scale
                  in the interactive Wall Visualizer, or discuss your surface
                  with our Mumbai studio.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/explore-designs"
                  className="inline-flex items-center gap-2 rounded-full bg-[#9B1C1C] px-5 py-3 text-[12px] font-bold tracking-[0.12em] text-[#FAF9F6] uppercase shadow-md transition-all hover:bg-[#73171B]"
                >
                  <Compass className="h-4 w-4" />
                  <span>Explore Designs</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <Link
                  href="/visualizer"
                  className="inline-flex items-center gap-2 rounded-full border border-[#DDD2C5] bg-[#FBF8F3] px-5 py-3 text-[12px] font-bold tracking-[0.12em] text-[#211D1A] uppercase shadow-2xs transition-all hover:border-[#9B1C1C] hover:bg-[#F6EAE6]"
                >
                  <Box className="h-4 w-4 text-[#9B1C1C]" />
                  <span>Wall Preview</span>
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </PublicShell>
  );
}
