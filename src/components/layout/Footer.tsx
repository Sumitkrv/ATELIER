"use client";
import React from "react";
import { useSiteSettings } from "@/components/layout/PublicContentProvider";
import Link from "next/link";
import {
  ATELIER_BRAND,
  ATELIER_SURFACES,
  buildWhatsAppUrl,
} from "@/lib/brand";
import { Container } from "@/components/layout/Container";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { MapPin, MessageCircle, Phone } from "lucide-react";

/**
 * Luxury Minimal Architectural Footer (Section 31)
 * Matches the approved Explore Designs — Design 02 reference layout:
 * - Warm charcoal (#201C1A) background
 * - Official white ATELIER logo + compact brand description
 * - Explore & Studio navigation columns
 * - Surfaces We Print On column
 * - Verified Get in Touch column (Saikat Ray, Triparna Bardhan, WhatsApp, Oshiwara Mumbai address)
 * - No public Admin CMS link or technical diagnostics
 */
export function Footer() {
  const settings = useSiteSettings();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#201C1A] text-[#FDF8F3]">
      <Container className="py-10 sm:py-16">
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:gap-10 lg:grid-cols-12">
          {/* Column 1: Brand Logo & Tagline */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-3">
            <Link
              href="/"
              aria-label={`${ATELIER_BRAND.name} — Home`}
              className="inline-block"
            >
              <BrandLogo variant="white" size="md" />
            </Link>
            <p className="mt-4 max-w-xs text-xs leading-relaxed text-[#EDE4DA]/75 sm:text-sm">
              {settings?.footerText || settings?.tagline || ATELIER_BRAND.brandStory}
            </p>
          </div>

          {/* Column 2: Explore */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#FDF8F3]">
              Explore
            </h3>
            <ul className="mt-3 space-y-1.5 text-xs text-[#EDE4DA]/80 sm:mt-3.5 sm:space-y-2 sm:text-sm">
              <li>
                <Link
                  href="/"
                  className="inline-flex min-h-9 items-center gap-2 transition-colors hover:text-[#FDF8F3]"
                >
                  <span className="h-1 w-1 rounded-full bg-[#991D20]" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/explore-designs"
                  className="inline-flex min-h-9 items-center gap-2 transition-colors hover:text-[#FDF8F3]"
                >
                  <span className="h-1 w-1 rounded-full bg-[#991D20]" />
                  <span>Explore Designs</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="inline-flex min-h-9 items-center gap-2 transition-colors hover:text-[#FDF8F3]"
                >
                  <span className="h-1 w-1 rounded-full bg-[#991D20]" />
                  <span>Our Projects</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="inline-flex min-h-9 items-center gap-2 transition-colors hover:text-[#FDF8F3]"
                >
                  <span className="h-1 w-1 rounded-full bg-[#991D20]" />
                  <span>Services</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Studio */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#FDF8F3]">
              Studio
            </h3>
            <ul className="mt-3 space-y-1.5 text-xs text-[#EDE4DA]/80 sm:mt-3.5 sm:space-y-2 sm:text-sm">
              <li>
                <Link
                  href="/about"
                  className="inline-flex min-h-9 items-center gap-2 transition-colors hover:text-[#FDF8F3]"
                >
                  <span className="h-1 w-1 rounded-full bg-[#991D20]" />
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/process"
                  className="inline-flex min-h-9 items-center gap-2 transition-colors hover:text-[#FDF8F3]"
                >
                  <span className="h-1 w-1 rounded-full bg-[#991D20]" />
                  <span>Our Process</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/blogs"
                  className="inline-flex min-h-9 items-center gap-2 transition-colors hover:text-[#FDF8F3]"
                >
                  <span className="h-1 w-1 rounded-full bg-[#991D20]" />
                  <span>Journal</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="inline-flex min-h-9 items-center gap-2 transition-colors hover:text-[#FDF8F3]"
                >
                  <span className="h-1 w-1 rounded-full bg-[#991D20]" />
                  <span>Contact Us</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Surfaces We Print On */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#FDF8F3]">
              Surfaces We Print On
            </h3>
            <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-[#EDE4DA]/80 sm:mt-3.5 sm:grid-cols-1 sm:gap-y-2 sm:text-sm lg:grid-cols-1">
              {ATELIER_SURFACES.map((surface) => (
                <li key={surface.id}>
                  <Link
                    href={`/services#${surface.id}`}
                    className="inline-flex min-h-9 items-center gap-2 transition-colors hover:text-[#FDF8F3]"
                  >
                    <span className="h-1 w-1 rounded-full bg-[#991D20]" />
                    <span>{surface.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Get in Touch */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#FDF8F3]">
              Get in Touch
            </h3>
            <ul className="mt-3 grid gap-2.5 text-xs text-[#EDE4DA]/85 sm:mt-3.5 sm:gap-3">
              {settings?.contact.primaryPhone && <li className="flex items-start gap-2"><Phone className="mt-2 h-3.5 w-3.5 shrink-0 text-[#991D20]" /><a className="inline-flex min-h-9 items-center" href={`tel:${settings.contact.primaryPhone.replace(/[^+\d]/g, "")}`}>{settings.contact.primaryPhone}</a></li>}
              {settings?.contact.whatsappNumber && <li className="flex items-start gap-2"><MessageCircle className="mt-2 h-3.5 w-3.5 shrink-0 text-[#991D20]" /><a className="inline-flex min-h-9 items-center" href={buildWhatsAppUrl(settings.contact.whatsappNumber.replace(/\D/g, ""))} target="_blank" rel="noopener noreferrer">WhatsApp · {settings.contact.whatsappNumber}</a></li>}
              {settings?.contact.email && <li><a className="break-all" href={`mailto:${settings.contact.email}`}>{settings.contact.email}</a></li>}
              {settings?.contact.workingHours && <li>{settings.contact.workingHours}</li>}
              {settings && Object.entries(settings.socialLinks).filter(([, href]) => href).map(([name, href]) => <li key={name}><a className="capitalize underline underline-offset-4" href={href} target="_blank" rel="noopener noreferrer">{name}</a></li>)}
              <li className="flex items-start gap-2 pt-1">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#991D20]" />
                <span className="leading-relaxed text-[#EDE4DA]/75">
                  {settings?.contact.studioAddress || ATELIER_BRAND.address.full}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs text-[#EDE4DA]/60 sm:mt-10 sm:flex-row sm:gap-4">
          <p className="text-center sm:text-left">
            {settings?.copyrightText || `© ${currentYear} ${settings?.brandName || ATELIER_BRAND.name}. All rights reserved.`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link href="/visualizer" className="hover:text-[#FDF8F3]">
              Wall Visualizer
            </Link>
            <span>|</span>
            <Link href="/contact" className="hover:text-[#FDF8F3]">
              Enquire Now
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
