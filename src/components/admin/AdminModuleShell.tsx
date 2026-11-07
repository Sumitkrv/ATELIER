import React from "react";
import Link from "next/link";
import { Database, Lock, ShieldAlert, KeyRound } from "lucide-react";

interface AdminModuleShellProps {
  moduleTitle: string;
  moduleCode: string;
  mongoCollection: string;
  summary: string;
  capabilities: ReadonlyArray<{
    title: string;
    description: string;
    schemaFields: string[];
  }>;
}

/**
 * Shared Protected Admin Module Shell for ATELIER — WALL STORY.
 * Enforces the security rule: "Do not mark fake local-state editing as working
 * database persistence. Never expose unsecured administrative mutations."
 */
export function AdminModuleShell({
  moduleTitle,
  moduleCode,
  mongoCollection,
  summary,
  capabilities,
}: AdminModuleShellProps) {
  return (
    <div className="space-y-6">
      {/* Security & Persistence Enforcement Notice */}
      <div className="rounded-sm border border-amber-500/35 bg-amber-500/10 p-5 text-brand-offwhite">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-amber-500/20 text-amber-300">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-medium uppercase tracking-wider text-amber-300">
                  Write Operations Locked — Authentication & MongoDB Gate Active
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-brand-beige/80">
                To prevent unauthenticated access or ephemeral local-state
                mutations that disappear on refresh, CRUD mutations for{" "}
                <code className="rounded-sm bg-white/10 px-1.5 py-0.5 font-mono text-brand-offwhite">
                  {mongoCollection}
                </code>{" "}
                unlock only after <code className="font-mono">MONGODB_URI</code>{" "}
                and <code className="font-mono">ADMIN_AUTH_SECRET</code> are
                configured and verified via signed admin session cookies.
              </p>
            </div>
          </div>

          <Link
            href="/admin/login"
            className="inline-flex shrink-0 items-center gap-2 rounded-sm border border-amber-400/40 bg-brand-charcoal px-4 py-2.5 font-mono text-xs font-medium uppercase tracking-wider text-amber-200 transition-colors hover:border-amber-300"
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Auth Gate Status</span>
          </Link>
        </div>
      </div>

      {/* Module Header */}
      <div className="rounded-sm border border-white/10 bg-obsidian-900 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-brand-crimson">
              {moduleCode} • ATELIER — WALL STORY Admin CMS
            </span>
            <h1 className="mt-1 font-serif text-3xl font-light text-brand-offwhite sm:text-4xl">
              {moduleTitle}
            </h1>
          </div>

          <div className="inline-flex items-center gap-2 rounded-sm border border-brand-crimson/40 bg-brand-charcoal px-3.5 py-2 font-mono text-xs text-brand-offwhite">
            <Database className="h-3.5 w-3.5 text-brand-crimson" />
            <span>Collection: {mongoCollection}</span>
          </div>
        </div>

        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-brand-beige/75">
          {summary}
        </p>

        {/* Capabilities & Persistent Schema Contract Grid */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {capabilities.map((cap) => (
            <div
              key={cap.title}
              className="flex flex-col justify-between rounded-sm border border-white/10 bg-brand-charcoal p-5"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-xl font-light text-brand-offwhite">
                    {cap.title}
                  </h2>
                  <Lock className="h-3.5 w-3.5 text-brand-crimson" />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-brand-beige/70">
                  {cap.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10">
                <span className="block font-mono text-[10px] uppercase tracking-wider text-brand-crimson">
                  Persisted Schema Fields:
                </span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {cap.schemaFields.map((field) => (
                    <code
                      key={field}
                      className="rounded-sm bg-white/5 px-2 py-0.5 font-mono text-[11px] text-brand-offwhite"
                    >
                      {field}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
