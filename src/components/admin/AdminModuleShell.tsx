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

export function AdminModuleShell({
  moduleTitle,
  moduleCode,
  mongoCollection,
  summary,
  capabilities,
}: AdminModuleShellProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#9B1C1C]/30 bg-[#FFFDF9] p-5 text-[#1A1A1A]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#9B1C1C]/10 text-[#9B1C1C]">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9B1C1C]">
                Write Operations Protected
              </span>
              <p className="mt-1 font-sans text-xs leading-relaxed text-[#746B64]">
                Mutations for <code className="font-mono text-[#1A1A1A]">{mongoCollection}</code> require an active administrator session.
              </p>
            </div>
          </div>

          <Link
            href="/admin/login"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#DFD0C0] bg-[#FAF6F0] px-4 py-2 font-sans text-xs font-medium text-[#1A1A1A] transition-colors hover:border-[#9B1C1C]/40"
          >
            <KeyRound className="h-3.5 w-3.5 text-[#9B1C1C]" />
            <span>Session Status</span>
          </Link>
        </div>
      </div>

      <div className="rounded-[20px] border border-[#DFD0C0] bg-[#FFFDF9] p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8DED3] pb-5">
          <div>
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9B1C1C]">
              {moduleCode} • ATELIER Studio CMS
            </span>
            <h1 className="mt-1 font-serif text-3xl font-normal text-[#1A1A1A] sm:text-4xl">
              {moduleTitle}
            </h1>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#DFD0C0] bg-[#FAF6F0] px-3.5 py-1.5 font-sans text-xs text-[#574F49]">
            <Database className="h-3.5 w-3.5 text-[#9B1C1C]" />
            <span>{mongoCollection}</span>
          </div>
        </div>

        <p className="mt-4 max-w-3xl font-sans text-sm leading-relaxed text-[#746B64]">
          {summary}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {capabilities.map((cap) => (
            <div
              key={cap.title}
              className="flex flex-col justify-between rounded-2xl border border-[#E8DED3] bg-[#FAF6F0] p-5"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-xl font-normal text-[#1A1A1A]">
                    {cap.title}
                  </h2>
                  <Lock className="h-3.5 w-3.5 text-[#9B1C1C]" />
                </div>
                <p className="mt-2 font-sans text-xs leading-relaxed text-[#746B64]">
                  {cap.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E8DED3]">
                <span className="block font-sans text-[10px] font-semibold uppercase tracking-wider text-[#9B1C1C]">
                  Schema Fields
                </span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {cap.schemaFields.map((field) => (
                    <code
                      key={field}
                      className="rounded-md bg-[#FFFDF9] border border-[#DFD0C0] px-2 py-0.5 font-mono text-[11px] text-[#574F49]"
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
