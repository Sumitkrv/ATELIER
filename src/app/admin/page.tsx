import React from "react";
import Link from "next/link";
import { ADMIN_NAV_MODULES } from "@/lib/navigation";
import { getEnvironmentReadiness } from "@/lib/env";
import { ATELIER_BRAND } from "@/lib/brand";
import {
  ArrowUpRight,
  Database,
  FolderKanban,
  Grid,
  Inbox,
  KeyRound,
  Layers,
  Lock,
  ShieldCheck,
} from "lucide-react";

export default function AdminDashboardOverviewPage() {
  const readiness = getEnvironmentReadiness();

  const kpiSlots = [
    {
      label: "Total Designs",
      collection: "designs",
      value: readiness.mongodbConfigured ? "Connected" : "Awaiting DB",
      href: "/admin/designs",
      icon: Layers,
    },
    {
      label: "13 Design Categories",
      collection: "design_categories",
      value: "13 Slots Defined",
      href: "/admin/categories",
      icon: Grid,
    },
    {
      label: "Total Projects",
      collection: "projects",
      value: readiness.mongodbConfigured ? "Connected" : "Awaiting DB",
      href: "/admin/projects",
      icon: FolderKanban,
    },
    {
      label: "Customer Enquiries",
      collection: "enquiries",
      value: readiness.mongodbConfigured ? "Connected" : "Awaiting DB",
      href: "/admin/enquiries",
      icon: Inbox,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Security & Persistence Status Banner */}
      <div className="rounded-sm border border-brand-crimson/40 bg-obsidian-900 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-brand-crimson">
              Admin Module 01 • Dashboard Overview
            </span>
            <h1 className="mt-1 font-serif text-3xl font-light text-brand-offwhite sm:text-4xl">
              {ATELIER_BRAND.name} — CMS Command Center
            </h1>
            <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-brand-beige/75">
              Official brand assets, 3D wall printing surface specifications,
              and Mumbai contact records are integrated. All 8 CMS modules map
              to persistent MongoDB collections, and write mutations remain
              locked behind signed authentication and MongoDB connection
              credentials.
            </p>
          </div>

          <Link
            href="/admin/login"
            className="inline-flex shrink-0 items-center gap-2 rounded-sm bg-brand-crimson px-5 py-3 font-mono text-xs font-medium uppercase tracking-wider text-brand-offwhite transition-colors hover:bg-brand-crimson-dark"
          >
            <KeyRound className="h-4 w-4" />
            <span>Inspect Auth Gate</span>
          </Link>
        </div>

        {/* KPI Metric Slots */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiSlots.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Link
                key={kpi.label}
                href={kpi.href}
                className="group rounded-sm border border-white/10 bg-brand-charcoal p-5 transition-colors hover:border-brand-crimson"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-brand-beige/70">
                    {kpi.label}
                  </span>
                  <Icon className="h-4 w-4 text-brand-crimson" />
                </div>
                <p className="mt-3 font-serif text-2xl font-light text-brand-offwhite">
                  {kpi.value}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 font-mono text-[10px] text-brand-beige/80">
                  <span>db.{kpi.collection}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-brand-crimson" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* All 8 Admin Modules Directory */}
      <div className="rounded-sm border border-white/10 bg-obsidian-900 p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="font-serif text-2xl font-light text-brand-offwhite">
              CMS Module Architecture & MongoDB Collections
            </h2>
            <p className="mt-1 text-xs text-brand-beige/70">
              Every module persists directly to MongoDB—never ephemeral local
              browser state.
            </p>
          </div>
          <Database className="h-5 w-5 text-brand-crimson" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {ADMIN_NAV_MODULES.map((mod, idx) => (
            <Link
              key={mod.id}
              href={mod.href}
              className="group flex flex-col justify-between rounded-sm border border-white/10 bg-brand-charcoal p-5 transition-colors hover:border-brand-crimson"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-brand-crimson">
                    MODULE 0{idx + 1} • db.{mod.collectionName}
                  </span>
                  <Lock className="h-3.5 w-3.5 text-brand-beige/50 group-hover:text-brand-crimson" />
                </div>
                <h3 className="mt-2 font-serif text-xl font-light text-brand-offwhite">
                  {mod.label}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-brand-beige/70">
                  {mod.summary}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between font-mono text-[11px] text-brand-beige">
                <span>Inspect Module Schema</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-brand-crimson" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Authentication Integration Plan Summary */}
      <div className="rounded-sm border border-white/10 bg-obsidian-900 p-6 sm:p-8">
        <div className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-widest text-brand-crimson">
          <ShieldCheck className="h-4 w-4" />
          <span>Authentication & Session Security Plan</span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs leading-relaxed text-brand-beige/75">
          <div className="rounded-sm border border-white/10 bg-brand-charcoal p-4">
            <strong className="block text-brand-offwhite mb-1">
              1. Password & Credential Storage
            </strong>
            Admin credentials stored in{" "}
            <code className="font-mono">admin_users</code> with Argon2id/bcrypt
            password hashing and seeded from{" "}
            <code className="font-mono">INITIAL_ADMIN_EMAIL</code> /{" "}
            <code className="font-mono">INITIAL_ADMIN_PASSWORD</code>.
          </div>
          <div className="rounded-sm border border-white/10 bg-brand-charcoal p-4">
            <strong className="block text-brand-offwhite mb-1">
              2. Signed HttpOnly Session Cookies
            </strong>
            Cryptographically signed JWT/session tokens using{" "}
            <code className="font-mono">ADMIN_AUTH_SECRET</code> with{" "}
            <code className="font-mono">httpOnly</code>,{" "}
            <code className="font-mono">Secure</code>, and{" "}
            <code className="font-mono">SameSite=Lax</code> flags.
          </div>
          <div className="rounded-sm border border-white/10 bg-brand-charcoal p-4">
            <strong className="block text-brand-offwhite mb-1">
              3. Route & API Guard Enforcement
            </strong>
            Every <code className="font-mono">/admin/*</code> page and{" "}
            <code className="font-mono">/api/admin/*</code> endpoint verifies
            the session token and rejects unauthenticated requests with{" "}
            <code className="font-mono">401 Unauthorized</code>.
          </div>
        </div>
      </div>
    </div>
  );
}
