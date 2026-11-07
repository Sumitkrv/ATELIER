import React from "react";
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
  const currentYear = 2026;

  return (
    <footer className="border-t border-white/10 bg-[#201C1A] text-[#FDF8F3]">
      <Container className="py-14 sm:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Column 1: Brand Logo & Tagline */}
          <div className="lg:col-span-3">
            <Link
              href="/"
              aria-label={`${ATELIER_BRAND.name} — Home`}
              className="inline-block"
            >
              <BrandLogo variant="white" size="md" />
            </Link>
            <p className="mt-4 max-w-xs text-xs leading-relaxed text-[#EDE4DA]/75 sm:text-sm">
              {ATELIER_BRAND.brandStory}
            </p>
          </div>

          {/* Column 2: Explore */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#FDF8F3]">
              Explore
            </h3>
            <ul className="mt-3.5 space-y-2 text-xs text-[#EDE4DA]/80 sm:text-sm">
              <li>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 transition-colors hover:text-[#FDF8F3]"
                >
                  <span className="h-1 w-1 rounded-full bg-[#991D20]" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/explore-designs"
                  className="inline-flex items-center gap-2 transition-colors hover:text-[#FDF8F3]"
                >
                  <span className="h-1 w-1 rounded-full bg-[#991D20]" />
                  <span>Explore Designs</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 transition-colors hover:text-[#FDF8F3]"
                >
                  <span className="h-1 w-1 rounded-full bg-[#991D20]" />
                  <span>Our Projects</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 transition-colors hover:text-[#FDF8F3]"
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
            <ul className="mt-3.5 space-y-2 text-xs text-[#EDE4DA]/80 sm:text-sm">
              <li>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 transition-colors hover:text-[#FDF8F3]"
                >
                  <span className="h-1 w-1 rounded-full bg-[#991D20]" />
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/process"
                  className="inline-flex items-center gap-2 transition-colors hover:text-[#FDF8F3]"
                >
                  <span className="h-1 w-1 rounded-full bg-[#991D20]" />
                  <span>Our Process</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/blogs"
                  className="inline-flex items-center gap-2 transition-colors hover:text-[#FDF8F3]"
                >
                  <span className="h-1 w-1 rounded-full bg-[#991D20]" />
                  <span>Journal</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 transition-colors hover:text-[#FDF8F3]"
                >
                  <span className="h-1 w-1 rounded-full bg-[#991D20]" />
                  <span>Contact Us</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Surfaces We Print On */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#FDF8F3]">
              Surfaces We Print On
            </h3>
            <ul className="mt-3.5 space-y-2 text-xs text-[#EDE4DA]/80 sm:text-sm">
              {ATELIER_SURFACES.map((surface) => (
                <li key={surface.id}>
                  <Link
                    href={`/services#${surface.id}`}
                    className="inline-flex items-center gap-2 transition-colors hover:text-[#FDF8F3]"
                  >
                    <span className="h-1 w-1 rounded-full bg-[#991D20]" />
                    <span>{surface.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Get in Touch */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#FDF8F3]">
              Get in Touch
            </h3>
            <ul className="mt-3.5 space-y-2.5 text-xs text-[#EDE4DA]/85">
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#991D20]" />
                <div>
                  <span className="font-semibold text-[#FDF8F3]">
                    Saikat Ray
                  </span>{" "}
                  <a
                    href="tel:+918591971675"
                    className="hover:text-[#FDF8F3] hover:underline"
                  >
                    +91 85919 71675
                  </a>{" "}
                  |{" "}
                  <a
                    href="tel:+918017463132"
                    className="hover:text-[#FDF8F3] hover:underline"
                  >
                    +91 80174 63132
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#991D20]" />
                <div>
                  <span className="font-semibold text-[#FDF8F3]">
                    Triparna Bardhan
                  </span>{" "}
                  <a
                    href="tel:+918697170746"
                    className="hover:text-[#FDF8F3] hover:underline"
                  >
                    +91 86971 70746
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MessageCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#991D20]" />
                <div>
                  <span className="font-semibold text-[#FDF8F3]">WhatsApp</span>{" "}
                  <a
                    href={buildWhatsAppUrl("918017463132")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#FDF8F3] hover:underline"
                  >
                    +91 80174 63132
                  </a>{" "}
                  |{" "}
                  <a
                    href={buildWhatsAppUrl("918697170746")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#FDF8F3] hover:underline"
                  >
                    +91 86971 70746
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2 pt-1">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#991D20]" />
                <span className="leading-relaxed text-[#EDE4DA]/75">
                  {ATELIER_BRAND.address.full}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-5 text-xs text-[#EDE4DA]/60 sm:flex-row">
          <p>
            © {currentYear} {ATELIER_BRAND.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
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
