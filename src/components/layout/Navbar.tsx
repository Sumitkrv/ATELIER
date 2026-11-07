"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ATELIER_BRAND, buildWhatsAppUrl } from "@/lib/brand";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { cn } from "@/lib/cn";
import { ArrowRight, Box, Menu, Phone, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Explore Designs", href: "/explore-designs" },
  { label: "Our Projects", href: "/projects" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Process", href: "/process" },
  { label: "Journal", href: "/blogs" },
] as const;

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const headerBarRef = useRef<HTMLDivElement | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [scrolled, setScrolled] = useState(false);
  const useLightSurface = true;

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  // Dynamically measure the header bar height and sync --header-height CSS custom property
  useEffect(() => {
    const el = headerBarRef.current;
    if (!el || typeof window === "undefined") return;

    const syncHeaderHeight = () => {
      const h = Math.round(el.getBoundingClientRect().height);
      if (h > 0) {
        document.documentElement.style.setProperty(
          "--header-height",
          `${h}px`
        );
        document.documentElement.style.setProperty(
          "--navbar-height",
          `${h}px`
        );
      }
    };

    syncHeaderHeight();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(syncHeaderHeight);
      observer.observe(el);
      return () => observer.disconnect();
    } else {
      window.addEventListener("resize", syncHeaderHeight, { passive: true });
      return () => window.removeEventListener("resize", syncHeaderHeight);
    }
  }, []);

  // Ensure route transitions align scroll position cleanly
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      const targetId = decodeURIComponent(hash.slice(1));
      const timer = window.setTimeout(() => {
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 60);
      return () => window.clearTimeout(timer);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-[background-color,border-color,box-shadow] duration-300",
        useLightSurface
          ? scrolled
            ? "border-[#DED5CB] bg-[#F8F3ED]/98 text-[#201C1A] shadow-[0_6px_22px_rgba(32,28,26,0.07)] backdrop-blur-md"
            : "border-[#DED5CB] bg-[#F8F3ED]/98 text-[#201C1A] shadow-[0_2px_14px_rgba(32,28,26,0.04)] backdrop-blur-md"
          : "border-white/12 bg-[#201C1A]/92 text-[#FDF8F3] backdrop-blur-md"
      )}
    >
      <div
        ref={headerBarRef}
        className="mx-auto flex h-[74px] max-w-[1320px] items-center justify-between px-5 sm:px-8 lg:px-10"
      >
        {/* Official ATELIER Logo */}
        <Link
          href="/"
          aria-label={`${ATELIER_BRAND.name} — Home`}
          className="flex shrink-0 items-center py-1"
        >
          <BrandLogo
            variant={useLightSurface ? "primary" : "white"}
            size="md"
            priority
          />
        </Link>

        {/* Center Navigation */}
        <nav
          aria-label="Primary studio navigation"
          className="hidden lg:flex h-full items-center gap-4 xl:gap-7"
        >
          {NAV_LINKS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : item.href === "/projects"
                  ? pathname === "/projects" ||
                    pathname.startsWith("/projects/") ||
                    pathname === "/our-projects"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative inline-flex h-full items-center whitespace-nowrap text-[13px] xl:text-[13.5px] font-medium tracking-[0.01em] transition-colors",
                  useLightSurface
                    ? isActive
                      ? "font-semibold text-[#991D20]"
                      : "text-[#201C1A]/88 hover:text-[#991D20]"
                    : isActive
                      ? "font-semibold text-[#FDF8F3]"
                      : "text-[#EDE4DA]/88 hover:text-[#FDF8F3]"
                )}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-[2.5px] bg-[#991D20]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Wall Preview, WhatsApp & Enquire */}
        <div className="hidden sm:flex items-center gap-2 xl:gap-2.5">
          <Link
            href="/visualizer"
            className={cn(
              "inline-flex items-center gap-1.5 xl:gap-2 whitespace-nowrap rounded-lg border px-3 xl:px-4 py-2 text-[12.5px] xl:text-[13px] font-medium transition-colors",
              useLightSurface
                ? "border-[#D8C9B8] bg-[#FAF5EE] text-[#201C1A] hover:border-[#991D20] hover:text-[#991D20]"
                : "border-white/25 bg-white/10 text-[#FDF8F3] hover:border-white hover:bg-white/15"
            )}
          >
            <Box className="h-3.5 w-3.5 shrink-0 text-current" />
            <span>Wall Preview</span>
          </Link>

          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with ATELIER — WALL STORY on WhatsApp"
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
              useLightSurface
                ? "border-[#991D20]/35 bg-[#FAF5EE] text-[#991D20] hover:bg-[#991D20] hover:text-[#FDF8F3]"
                : "border-white/25 bg-white/10 text-[#FDF8F3] hover:border-[#991D20] hover:bg-[#991D20]"
            )}
          >
            <WhatsAppIcon className="h-4 w-4" />
          </a>

          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#991D20] px-5 py-2 text-[13px] font-medium text-[#FDF8F3] shadow-xs transition-colors hover:bg-[#73171B]"
          >
            <span>Enquire</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation-drawer"
          aria-label={
            mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          className={cn(
            "inline-flex cursor-pointer lg:hidden items-center justify-center rounded-md border p-2 transition-colors",
            useLightSurface
              ? "border-[#DED5CB] bg-[#FDF8F3] text-[#201C1A] hover:border-[#991D20]"
              : "border-white/20 bg-white/10 text-[#FDF8F3]"
          )}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Collapsible Mobile Navigation Drawer (Overlaying below the sticky 74px bar so it never shifts page flow) */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-var(--header-height,74px))] overflow-y-auto border-b border-t border-[#DED5CB] bg-[#F8F3ED] px-5 py-5 text-[#201C1A] shadow-2xl lg:hidden"
        >
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {NAV_LINKS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "border-[#991D20] bg-[#991D20]/8 text-[#991D20]"
                      : "border-[#DED5CB] bg-[#FDF8F3] text-[#201C1A] hover:border-[#991D20]/50"
                  )}
                >
                  <span>{item.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-60" />
                </Link>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2.5 border-t border-[#DED5CB] pt-4 sm:grid-cols-3">
            <Link
              href="/visualizer"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#DED5CB] bg-[#FDF8F3] px-4 py-2.5 text-xs font-medium text-[#201C1A]"
            >
              <Box className="h-4 w-4 text-[#991D20]" />
              <span>Wall Preview</span>
            </Link>
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#991D20]/35 bg-[#FDF8F3] px-4 py-2.5 text-xs font-medium text-[#991D20]"
            >
              <WhatsAppIcon className="h-4 w-4" />
              <span>WhatsApp</span>
            </a>
            <a
              href="tel:+918591971675"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#991D20] px-4 py-2.5 text-xs font-medium text-[#FDF8F3]"
            >
              <Phone className="h-4 w-4" />
              <span>Enquire / Call</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
