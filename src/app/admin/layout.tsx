import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ADMIN_NAV_MODULES } from "@/lib/navigation";
import { getEnvironmentReadiness } from "@/lib/env";
import { ATELIER_BRAND } from "@/lib/brand";
import { BrandLogo } from "@/components/ui/BrandLogo";
import {
  ArrowLeft,
  CheckCircle2,
  Database,
  KeyRound,
  Layers,
  Lock,
  XCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: `Admin CMS | ${ATELIER_BRAND.name}`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const readiness = getEnvironmentReadiness();

  return (
    <div className="min-h-screen bg-brand-charcoal text-brand-offwhite flex flex-col">
      {/* Top Security & Environment Telemetry Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-charcoal/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" aria-label={`${ATELIER_BRAND.name} Admin Home`}>
              <BrandLogo variant="white" size="sm" />
            </Link>
            <div className="hidden sm:block border-l border-white/15 pl-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-medium tracking-wider uppercase text-brand-offwhite">
                  Admin CMS
                </span>
                <span className="rounded-sm bg-brand-crimson px-2 py-0.5 font-mono text-[10px] uppercase text-brand-offwhite">
                  Protected Shell
                </span>
              </div>
              <p className="font-mono text-[10px] text-brand-beige/60">
                3D Wall Printing Studio • MongoDB + Cloudinary
              </p>
            </div>
          </div>

          {/* Environment Readiness Badges */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="inline-flex items-center gap-1 rounded-sm border border-white/10 bg-obsidian-900 px-2.5 py-1">
              <Database className="h-3 w-3 text-brand-crimson" />
              <span>MongoDB:</span>
              {readiness.mongodbConfigured ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-amber-400" />
              )}
            </span>

            <span className="inline-flex items-center gap-1 rounded-sm border border-white/10 bg-obsidian-900 px-2.5 py-1">
              <Lock className="h-3 w-3 text-brand-crimson" />
              <span>Auth Secret:</span>
              {readiness.adminAuthConfigured ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-amber-400" />
              )}
            </span>

            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 rounded-sm bg-brand-crimson px-3 py-1 text-brand-offwhite hover:bg-brand-crimson-dark"
            >
              <KeyRound className="h-3 w-3" />
              <span>Auth Gate</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-sm border border-white/15 bg-white/5 px-3 py-1 text-brand-offwhite hover:bg-white/15"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Public Website</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Workspace with Sidebar Navigation */}
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 px-4 py-6 sm:px-8 lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-72">
          <div className="sticky top-20 rounded-sm border border-white/10 bg-obsidian-900 p-4">
            <div className="mb-3 flex items-center justify-between px-2">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-brand-crimson">
                Admin Modules (08)
              </span>
              <Layers className="h-3.5 w-3.5 text-brand-crimson" />
            </div>

            <nav aria-label="Admin CMS navigation" className="space-y-1">
              {ADMIN_NAV_MODULES.map((mod) => (
                <Link
                  key={mod.id}
                  href={mod.href}
                  className="block rounded-sm border border-transparent px-3 py-2.5 transition-colors hover:border-brand-crimson/50 hover:bg-brand-charcoal"
                >
                  <span className="block text-xs font-medium text-brand-offwhite">
                    {mod.label}
                  </span>
                  <span className="block font-mono text-[10px] text-brand-beige/55">
                    db.{mod.collectionName}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Module Body */}
        <main id="main-content" className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
