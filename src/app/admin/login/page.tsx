"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ATELIER_BRAND } from "@/lib/brand";
import { KeyRound, Lock, ShieldAlert, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(
      "Authentication Gate Locked: Live admin sign-in requires MONGODB_URI, ADMIN_AUTH_SECRET, and INITIAL_ADMIN_EMAIL to be configured in .env.local. No hardcoded or client-side bypass credentials exist."
    );
  };

  return (
    <div className="mx-auto max-w-lg py-8">
      <div className="rounded-sm border border-brand-crimson/40 bg-obsidian-900 p-6 sm:p-8 shadow-2xl">
        <div className="mb-5 border-b border-white/10 pb-4">
          <BrandLogo variant="white" size="md" />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-brand-crimson/20 text-brand-crimson">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-brand-crimson">
              Protected Admin Access
            </span>
            <h1 className="font-serif text-2xl font-light text-brand-offwhite sm:text-3xl">
              {ATELIER_BRAND.shortName} Administrator Sign In
            </h1>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-brand-beige/75">
          Sign in with your verified {ATELIER_BRAND.name} administrator account.
          No default or hardcoded credentials are permitted in source code.
        </p>

        {statusMessage && (
          <div
            role="alert"
            className="mt-5 rounded-sm border border-amber-400/40 bg-amber-500/10 p-4 text-xs leading-relaxed text-amber-200"
          >
            <div className="flex items-center gap-2 font-semibold text-amber-300">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Environment Credentials Required</span>
            </div>
            <p className="mt-1">{statusMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="admin-email"
              className="block font-mono text-[11px] uppercase tracking-wider text-brand-beige"
            >
              Admin Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Verified admin email"
              className="mt-1.5 w-full rounded-sm border border-white/15 bg-brand-charcoal px-3.5 py-2.5 text-sm text-brand-offwhite placeholder:text-brand-beige/40 focus:border-brand-crimson focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block font-mono text-[11px] uppercase tracking-wider text-brand-beige"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="mt-1.5 w-full rounded-sm border border-white/15 bg-brand-charcoal px-3.5 py-2.5 text-sm text-brand-offwhite placeholder:text-brand-beige/40 focus:border-brand-crimson focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm bg-brand-crimson px-5 py-3 font-mono text-xs font-medium uppercase tracking-widest text-brand-offwhite transition-colors hover:bg-brand-crimson-dark"
          >
            <KeyRound className="h-4 w-4" />
            <span>Verify Admin Session</span>
          </button>
        </form>

        <div className="mt-6 border-t border-white/10 pt-4 flex items-center justify-between text-xs font-mono text-brand-beige/60">
          <Link href="/admin" className="hover:text-brand-offwhite">
            ← Back to CMS Overview
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1 hover:text-brand-offwhite"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Public Site</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
