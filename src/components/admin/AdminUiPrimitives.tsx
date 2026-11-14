"use client";

import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

export const adminCardClass =
  "rounded-[20px] border border-[#DFD0C0] bg-[#FFFDF9] shadow-[0_6px_24px_rgba(32,28,26,0.04)]";

export const adminMutedCardClass =
  "rounded-2xl border border-[#E8DED3] bg-[#F2EAE1]/65";

export const adminLabelClass =
  "block font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#746B64] mb-2";

export const adminInputClass =
  "w-full h-11 rounded-xl border border-[#DFD0C0] bg-[#F6F1EA] px-4 font-sans text-sm text-[#1A1A1A] placeholder:text-[#746B64]/65 transition-colors hover:border-[#CDB8A4] focus:border-[#9B1C1C] focus:bg-[#FFFDF9] focus:outline-none";

export const adminSelectClass =
  "w-full h-11 rounded-xl border border-[#DFD0C0] bg-[#F6F1EA] px-3.5 font-sans text-sm text-[#1A1A1A] transition-colors hover:border-[#CDB8A4] focus:border-[#9B1C1C] focus:bg-[#FFFDF9] focus:outline-none";

export const adminTextareaClass =
  "w-full rounded-xl border border-[#DFD0C0] bg-[#F6F1EA] px-4 py-3 font-sans text-sm leading-relaxed text-[#1A1A1A] placeholder:text-[#746B64]/65 transition-colors hover:border-[#CDB8A4] focus:border-[#9B1C1C] focus:bg-[#FFFDF9] focus:outline-none";

export type AdminButtonVariant = "primary" | "secondary" | "destructive" | "ghost";
export type AdminButtonSize = "md" | "sm";

export function adminButtonClass(
  variant: AdminButtonVariant = "primary",
  size: AdminButtonSize = "md",
  extraClass = ""
): string {
  const base =
    "inline-flex items-center justify-center gap-2 font-sans font-medium rounded-xl transition-colors cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed whitespace-nowrap";
  const sizing =
    size === "sm"
      ? "min-h-[36px] px-3.5 py-1.5 text-xs"
      : "min-h-[44px] px-5 py-2.5 text-sm";

  const variants: Record<AdminButtonVariant, string> = {
    primary:
      "bg-[#9B1C1C] text-[#FFFDF9] hover:bg-[#801619] border border-transparent shadow-[0_4px_14px_rgba(155,28,28,0.18)]",
    secondary:
      "bg-[#FFFDF9] text-[#1A1A1A] border border-[#DFD0C0] hover:border-[#9B1C1C]/45 hover:bg-[#FAF6F0]",
    destructive:
      "bg-[#FFFDF9] text-[#9B1C1C] border border-[#9B1C1C]/35 hover:bg-[#9B1C1C] hover:text-[#FFFDF9]",
    ghost:
      "bg-transparent text-[#746B64] hover:text-[#1A1A1A] hover:bg-[#F2EAE1] border border-transparent",
  };

  return `${base} ${sizing} ${variants[variant]} ${extraClass}`.trim();
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between border-b border-[#E8DED3] pb-6">
      <div className="max-w-2xl">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9B1C1C]">
          {eyebrow}
        </p>
        <h1 className="mt-1.5 font-serif text-3xl sm:text-[34px] font-normal tracking-[-0.02em] text-[#1A1A1A] leading-[1.12]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 font-sans text-sm leading-relaxed text-[#746B64]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div>
      ) : null}
    </div>
  );
}

export type AdminBadgeTone =
  | "published"
  | "active"
  | "draft"
  | "hidden"
  | "featured"
  | "New"
  | "Contacted"
  | "Follow-up"
  | "Qualified"
  | "Converted"
  | "In Progress"
  | "Closed"
  | "neutral";

const BADGE_STYLES: Record<AdminBadgeTone, string> = {
  published: "bg-[#E9F0EA] text-[#264E32] border-[#C9DBC9]",
  active: "bg-[#E9F0EA] text-[#264E32] border-[#C9DBC9]",
  draft: "bg-[#F2EAE1] text-[#574F49] border-[#DFD0C0]",
  hidden: "bg-[#F2EAE1] text-[#574F49] border-[#DFD0C0]",
  featured: "bg-[#F9EDED] text-[#8F1919] border-[#E4BFBF]",
  New: "bg-[#F9EDED] text-[#8F1919] border-[#E4BFBF]",
  Contacted: "bg-[#F5EBDC] text-[#7A4E16] border-[#E4CFAF]",
  "Follow-up": "bg-[#F5EBDC] text-[#7A4E16] border-[#E4CFAF]",
  Qualified: "bg-[#EBF0F4] text-[#2C4B66] border-[#CBD7E1]",
  Converted: "bg-[#E9F0EA] text-[#264E32] border-[#C9DBC9]",
  "In Progress": "bg-[#EBF0F4] text-[#2C4B66] border-[#CBD7E1]",
  Closed: "bg-[#F2EAE1] text-[#746B64] border-[#DFD0C0]",
  neutral: "bg-[#F2EAE1] text-[#574F49] border-[#DFD0C0]",
};

export function AdminStatusBadge({
  tone,
  children,
}: {
  tone: AdminBadgeTone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border font-sans text-[11px] font-medium whitespace-nowrap ${BADGE_STYLES[tone]}`}
    >
      {children}
    </span>
  );
}

export function AdminConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-confirm-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-[#DFD0C0] bg-[#FFFDF9] p-6 shadow-[0_24px_60px_rgba(26,26,26,0.22)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#9B1C1C]/10 border border-[#9B1C1C]/20 flex items-center justify-center shrink-0 text-[#9B1C1C]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="admin-confirm-title"
                className="font-serif text-2xl font-normal text-[#1A1A1A]"
              >
                {title}
              </h2>
              <p className="mt-2 font-sans text-sm leading-relaxed text-[#746B64]">
                {description}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            aria-label="Close confirmation dialog"
            className="p-1.5 rounded-lg text-[#746B64] hover:text-[#1A1A1A] hover:bg-[#F2EAE1] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#E8DED3]">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className={adminButtonClass("secondary", "sm")}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={adminButtonClass("primary", "sm")}
          >
            {busy ? "Removing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

