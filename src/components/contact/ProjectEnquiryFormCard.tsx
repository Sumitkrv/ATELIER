"use client";

import React from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Send,
  Sparkles,
} from "lucide-react";
import { ATELIER_BRAND } from "@/lib/brand";
import { cn } from "@/lib/cn";
import { WhatsAppOutlineIcon } from "./ContactHeroAndCapabilities";

export const SERVICE_INTEREST_OPTIONS: ReadonlyArray<{
  value: string;
  label: string;
}> = [
  {
    value: "Walls",
    label: "Walls — 3D Wall Printing & Murals",
  },
  {
    value: "Tiles",
    label: "Tiles — Ceramic & Stone Tile Printing",
  },
  {
    value: "Plywood",
    label: "Plywood — Timber, Veneer & Millwork",
  },
  {
    value: "Office Blinds",
    label: "Office Blinds — Roller & Window Blinds",
  },
  {
    value: "Metals",
    label: "Metals — Brushed & Coated Metal",
  },
  {
    value: "Glass",
    label: "Glass — Partitions & Glazing",
  },
  {
    value: "Custom Wall Art",
    label: "Custom Wall Art — Bespoke Mural",
  },
  {
    value: "Not Sure Yet",
    label: "Not Sure Yet — Help Me Choose",
  },
];

export interface SubmissionNoticeState {
  type: "success" | "error";
  title: string;
  detail: string;
  referenceCode?: string | null;
}

export interface PrefilledContextCard {
  kindLabel: string;
  title: string;
  subtitle: string;
  thumbnailUrl?: string;
  backHref: string;
  backLabel: string;
}

interface ProjectEnquiryFormCardProps {
  fullNameInputRef: React.RefObject<HTMLInputElement | null>;
  fullName: string;
  onFullNameChange: (val: string) => void;
  email: string;
  onEmailChange: (val: string) => void;
  phone: string;
  onPhoneChange: (val: string) => void;
  selectedSurface: string;
  onSurfaceChange: (val: string) => void;
  selectedDesignReference: string;
  onDesignReferenceChange: (val: string) => void;
  message: string;
  onMessageChange: (val: string) => void;
  consentGiven: boolean;
  onConsentChange: (checked: boolean) => void;
  honeypot: string;
  onHoneypotChange: (val: string) => void;
  fieldErrors: Record<string, string>;
  submissionNotice: SubmissionNoticeState | null;
  isSubmitting: boolean;
  isDuplicateSubmission: boolean;
  onSubmit: (e: React.FormEvent) => void;
  whatsAppEnquiryHref: string;
  prefilledContext: PrefilledContextCard | null;
}

export function ProjectEnquiryFormCard({
  fullNameInputRef,
  fullName,
  onFullNameChange,
  email,
  onEmailChange,
  phone,
  onPhoneChange,
  selectedSurface,
  onSurfaceChange,
  selectedDesignReference,
  onDesignReferenceChange,
  message,
  onMessageChange,
  consentGiven,
  onConsentChange,
  honeypot,
  onHoneypotChange,
  fieldErrors,
  submissionNotice,
  isSubmitting,
  isDuplicateSubmission,
  onSubmit,
  whatsAppEnquiryHref,
  prefilledContext,
}: ProjectEnquiryFormCardProps) {
  return (
    <div className="rounded-[24px] border border-[#DFD0C0] bg-[#FFFDF9] p-6 shadow-[0_20px_50px_-24px_rgba(32,22,14,0.12)] sm:p-8 lg:p-9">
      {/* Eyebrow & Required Note */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="h-[1.5px] w-6 shrink-0 bg-[#9B1C1C]"
          />
          <span className="font-sans text-[11px] font-bold tracking-[0.2em] text-[#9B1C1C] uppercase">
            PROJECT &amp; SURFACE ENQUIRY
          </span>
        </div>
        <span className="font-sans text-[11.5px] text-[#746B64]">
          * Required fields
        </span>
      </div>

      {/* Form Heading */}
      <h2
        id="project-enquiry-heading"
        className="mt-2.5 font-serif text-[28px] leading-[1.14] font-normal tracking-[-0.015em] text-[#1A1A1A] sm:text-[34px]"
      >
        Share Your Wall or Surface Brief
      </h2>

      {/* Form Description */}
      <p className="mt-2.5 text-[14px] leading-[1.64] text-[#5C534B] sm:text-[14.5px]">
        Enquire about direct 3D printing on walls, tiles, plywood, office
        blinds, metals, or glass — or reference a specific artwork from our
        design collection.
      </p>

      {/* URL Query Prefill Context Banner (When arriving from Explore Designs / Projects / Visualizer) */}
      {prefilledContext && (
        <div className="mt-5 flex flex-col justify-between gap-3.5 rounded-2xl border border-[#DFC7C1] bg-[#F7EFE8] p-3.5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3.5">
            {prefilledContext.thumbnailUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={prefilledContext.thumbnailUrl}
                alt={prefilledContext.title}
                className="h-13 w-17 shrink-0 rounded-xl border border-[#DFD0C0] object-cover"
              />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.16em] text-[#9B1C1C] uppercase">
                <Sparkles aria-hidden="true" className="h-3 w-3 shrink-0" />
                <span>{prefilledContext.kindLabel}</span>
              </div>
              <p className="mt-0.5 truncate font-serif text-[17px] font-medium text-[#1A1A1A]">
                {prefilledContext.title}
              </p>
              {prefilledContext.subtitle && (
                <p className="text-[12px] text-[#6D635B]">
                  {prefilledContext.subtitle}
                </p>
              )}
            </div>
          </div>

          <Link
            href={prefilledContext.backHref}
            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-[#D8C8B6] bg-[#FFFDF9] px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-[#9B1C1C] uppercase transition-colors hover:border-[#9B1C1C] sm:self-center"
          >
            <ArrowLeft aria-hidden="true" className="h-3 w-3" />
            <span>{prefilledContext.backLabel}</span>
          </Link>
        </div>
      )}

      {/* Server-Confirmed Submission Status Banner */}
      {submissionNotice && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "mt-5 rounded-2xl border p-4 text-[13px] leading-relaxed",
            submissionNotice.type === "error"
              ? "border-[#D68F8C] bg-[#FDF2F1] text-[#7D181C]"
              : "border-emerald-700/30 bg-[#F2F8F4] text-[#1D3528]"
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 font-semibold">
            <div className="flex items-center gap-2">
              {submissionNotice.type === "error" ? (
                <AlertCircle
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-[#9B1C1C]"
                />
              ) : (
                <CheckCircle2
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-emerald-700"
                />
              )}
              <span>{submissionNotice.title}</span>
            </div>
            {submissionNotice.referenceCode && (
              <span className="rounded-full bg-emerald-800/10 px-3 py-0.5 text-[11px] font-semibold tracking-wider text-emerald-900">
                Ref: {submissionNotice.referenceCode}
              </span>
            )}
          </div>
          <p className="mt-1.5 opacity-95">{submissionNotice.detail}</p>
        </div>
      )}

      {/* Project Enquiry Form */}
      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4.5">
        {/* Hidden Honeypot Anti-Spam Input */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden opacity-0"
        >
          <label htmlFor="enquiry-company-website">
            Company Website (Leave blank)
          </label>
          <input
            id="enquiry-company-website"
            name="company_website_honeypot"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => onHoneypotChange(e.target.value)}
          />
        </div>

        {/* Row 1: Full Name + Email Address */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="enquiry-fullName"
              className="block text-[11px] font-bold tracking-[0.13em] text-[#1A1A1A] uppercase"
            >
              FULL NAME <span className="text-[#9B1C1C]">*</span>
            </label>
            <input
              ref={fullNameInputRef}
              id="enquiry-fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              aria-invalid={Boolean(fieldErrors.fullName)}
              aria-describedby={
                fieldErrors.fullName ? "err-fullName" : undefined
              }
              value={fullName}
              onChange={(e) => onFullNameChange(e.target.value)}
              placeholder="Your full name"
              className={cn(
                "mt-1.5 h-11.5 w-full rounded-xl border bg-[#F6F1EA] px-4 text-[14px] text-[#1A1A1A] placeholder:text-[#7E736A] transition-[border-color,background-color] focus:border-[#9B1C1C] focus:bg-[#FFFDF9] focus:outline-none",
                fieldErrors.fullName ? "border-[#9B1C1C]" : "border-[#DFD0C0]"
              )}
            />
            {fieldErrors.fullName && (
              <p
                id="err-fullName"
                role="alert"
                className="mt-1.5 text-[12px] font-medium text-[#9B1C1C]"
              >
                {fieldErrors.fullName}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="enquiry-email"
              className="block text-[11px] font-bold tracking-[0.13em] text-[#1A1A1A] uppercase"
            >
              EMAIL ADDRESS <span className="text-[#9B1C1C]">*</span>
            </label>
            <input
              id="enquiry-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "err-email" : undefined}
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="you@example.com"
              className={cn(
                "mt-1.5 h-11.5 w-full rounded-xl border bg-[#F6F1EA] px-4 text-[14px] text-[#1A1A1A] placeholder:text-[#7E736A] transition-[border-color,background-color] focus:border-[#9B1C1C] focus:bg-[#FFFDF9] focus:outline-none",
                fieldErrors.email ? "border-[#9B1C1C]" : "border-[#DFD0C0]"
              )}
            />
            {fieldErrors.email && (
              <p
                id="err-email"
                role="alert"
                className="mt-1.5 text-[12px] font-medium text-[#9B1C1C]"
              >
                {fieldErrors.email}
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Phone Number + Service Interest */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="enquiry-phone"
              className="block text-[11px] font-bold tracking-[0.13em] text-[#1A1A1A] uppercase"
            >
              PHONE NUMBER <span className="text-[#9B1C1C]">*</span>
            </label>
            <input
              id="enquiry-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              aria-invalid={Boolean(fieldErrors.phone)}
              aria-describedby={fieldErrors.phone ? "err-phone" : undefined}
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="+91..."
              className={cn(
                "mt-1.5 h-11.5 w-full rounded-xl border bg-[#F6F1EA] px-4 text-[14px] text-[#1A1A1A] placeholder:text-[#7E736A] transition-[border-color,background-color] focus:border-[#9B1C1C] focus:bg-[#FFFDF9] focus:outline-none",
                fieldErrors.phone ? "border-[#9B1C1C]" : "border-[#DFD0C0]"
              )}
            />
            {fieldErrors.phone && (
              <p
                id="err-phone"
                role="alert"
                className="mt-1.5 text-[12px] font-medium text-[#9B1C1C]"
              >
                {fieldErrors.phone}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="enquiry-interest"
              className="block text-[11px] font-bold tracking-[0.13em] text-[#1A1A1A] uppercase"
            >
              SERVICE INTEREST (OPTIONAL)
            </label>
            <div className="relative mt-1.5">
              <select
                id="enquiry-interest"
                name="serviceInterest"
                value={selectedSurface}
                onChange={(e) => onSurfaceChange(e.target.value)}
                className="h-11.5 w-full appearance-none rounded-xl border border-[#DFD0C0] bg-[#F6F1EA] px-4 pr-10 text-[14px] text-[#1A1A1A] transition-[border-color,background-color] focus:border-[#9B1C1C] focus:bg-[#FFFDF9] focus:outline-none"
              >
                <option value="">Select a service or surface</option>
                {SERVICE_INTEREST_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
                {selectedSurface &&
                  !SERVICE_INTEREST_OPTIONS.some(
                    (o) =>
                      o.value.toLowerCase() === selectedSurface.toLowerCase()
                  ) && (
                    <option value={selectedSurface}>{selectedSurface}</option>
                  )}
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-[#6E635A]"
              />
            </div>
          </div>
        </div>

        {/* Row 3: Selected Design or Project */}
        <div>
          <label
            htmlFor="enquiry-design-ref"
            className="block text-[11px] font-bold tracking-[0.13em] text-[#1A1A1A] uppercase"
          >
            SELECTED DESIGN OR PROJECT (OPTIONAL)
          </label>
          <input
            id="enquiry-design-ref"
            name="selectedDesignReference"
            type="text"
            value={selectedDesignReference}
            onChange={(e) => onDesignReferenceChange(e.target.value)}
            placeholder="Design name, project reference, or a link (if any)"
            className="mt-1.5 h-11.5 w-full rounded-xl border border-[#DFD0C0] bg-[#F6F1EA] px-4 text-[14px] text-[#1A1A1A] placeholder:text-[#7E736A] transition-[border-color,background-color] focus:border-[#9B1C1C] focus:bg-[#FFFDF9] focus:outline-none"
          />
        </div>

        {/* Row 4: Message */}
        <div>
          <label
            htmlFor="enquiry-message"
            className="block text-[11px] font-bold tracking-[0.13em] text-[#1A1A1A] uppercase"
          >
            MESSAGE <span className="text-[#9B1C1C]">*</span>
          </label>
          <textarea
            id="enquiry-message"
            name="message"
            rows={4}
            required
            aria-invalid={Boolean(fieldErrors.message)}
            aria-describedby={fieldErrors.message ? "err-message" : undefined}
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Share your wall or surface dimensions, substrate type, location, and creative ideas..."
            className={cn(
              "mt-1.5 w-full rounded-xl border bg-[#F6F1EA] px-4 py-3 text-[14px] leading-relaxed text-[#1A1A1A] placeholder:text-[#7E736A] transition-[border-color,background-color] focus:border-[#9B1C1C] focus:bg-[#FFFDF9] focus:outline-none",
              fieldErrors.message ? "border-[#9B1C1C]" : "border-[#DFD0C0]"
            )}
          />
          {fieldErrors.message && (
            <p
              id="err-message"
              role="alert"
              className="mt-1.5 text-[12px] font-medium text-[#9B1C1C]"
            >
              {fieldErrors.message}
            </p>
          )}
        </div>

        {/* Row 5: Contact Consent */}
        <div className="flex items-start gap-2.5 pt-0.5">
          <input
            id="enquiry-consent"
            name="consentGiven"
            type="checkbox"
            checked={consentGiven}
            onChange={(e) => onConsentChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-[#C9B9A6] accent-[#9B1C1C]"
          />
          <label
            htmlFor="enquiry-consent"
            className="cursor-pointer text-[12.5px] leading-[1.52] text-[#5B524B]"
          >
            I consent to {ATELIER_BRAND.name} contacting me via phone, WhatsApp,
            or email regarding my enquiry. (Optional)
          </label>
        </div>

        {/* Row 6: Primary Submit Enquiry & Secondary Send via WhatsApp */}
        <div className="grid grid-cols-1 gap-3.5 pt-2 sm:grid-cols-2">
          <button
            type="submit"
            disabled={isSubmitting || isDuplicateSubmission}
            className="inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-[#9B1C1C] px-6 py-3.5 text-[13.5px] font-semibold tracking-[0.01em] text-[#FFFDF9] shadow-[0_12px_28px_-8px_rgba(155,28,28,0.44)] transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:bg-[#7F1616] disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
          >
            <Send aria-hidden="true" className="h-4 w-4" />
            <span>
              {isSubmitting
                ? "Submitting Enquiry…"
                : isDuplicateSubmission
                  ? "Enquiry Received"
                  : "Submit Enquiry"}
            </span>
          </button>

          <a
            href={whatsAppEnquiryHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-xl border border-[#DFD0C0] bg-[#FAF6F0] px-6 py-3.5 text-[13.5px] font-semibold tracking-[0.01em] text-[#1A1A1A] transition-[border-color,background-color,color,transform] duration-200 hover:-translate-y-0.5 hover:border-[#9B1C1C] hover:bg-[#FFFDF9] hover:text-[#9B1C1C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
          >
            <WhatsAppOutlineIcon className="h-4 w-4 text-[#9B1C1C]" />
            <span>Send via WhatsApp</span>
          </a>
        </div>
      </form>
    </div>
  );
}
