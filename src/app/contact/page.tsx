"use client";

import React, { Suspense, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PublicShell } from "@/components/layout/PublicShell";
import { Container } from "@/components/layout/Container";
import {
  ATELIER_BRAND,
  ATELIER_SURFACES,
  ATELIER_WHATSAPP_NUMBERS,
  buildWhatsAppUrl,
} from "@/lib/brand";
import { ATELIER_ASSET_REGISTRY } from "@/lib/asset-registry";
import { findDesignBySlugOrId } from "@/lib/designs-catalogue";
import { findProjectBySlugOrId } from "@/lib/projects-catalogue";
import { enquirySubmissionSchema } from "@/types/models";
import { cn } from "@/lib/cn";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Box,
  CheckCircle2,
  ChevronDown,
  Layers,
  MapPin,
  MessageCircle,
  MessageSquare,
  Navigation,
  Phone,
  Send,
  Sparkles,
  User,
  Zap,
} from "lucide-react";

const GOOGLE_MAPS_DIRECTIONS_URL =
  "https://www.google.com/maps/search/?api=1&query=%23410%2C+Reliable+Business+Centre%2C+Anand+Nagar%2C+Oshiwara%2C+Andheri+West%2C+Mumbai+400102";

const SERVICE_DROPDOWN_OPTIONS: ReadonlyArray<{
  surfaceName: string;
  value: string;
  label: string;
}> = [
  {
    surfaceName: "Walls",
    value: "Walls",
    label: "Walls — Direct 3D Wall Printing & Murals",
  },
  {
    surfaceName: "Tiles",
    value: "Tiles",
    label: "Tiles — Ceramic, Vitrified & Stone Tile Printing",
  },
  {
    surfaceName: "Plywood",
    value: "Plywood",
    label: "Plywood — Timber, Veneer & Millwork Printing",
  },
  {
    surfaceName: "Office Blinds",
    value: "Office Blinds",
    label: "Office Blinds — Commercial Roller & Window Blinds",
  },
  {
    surfaceName: "Metals",
    value: "Metals",
    label: "Metals — Brushed & Coated Architectural Metal",
  },
  {
    surfaceName: "Glass",
    value: "Glass",
    label: "Glass — Architectural Partitions & Glazing Art",
  },
  {
    surfaceName: "Custom",
    value: "Custom Multi-Surface Consultation",
    label: "Bespoke Mural / Multi-Surface Consultation",
  },
];

const STUDIO_BENEFITS: ReadonlyArray<{
  title: string;
  description: string;
  icon: "consultation" | "surfaces" | "artwork" | "support";
}> = [
  {
    title: "Design Consultation",
    description: "Discuss your space, surfaces, and creative ideas.",
    icon: "consultation",
  },
  {
    title: "Multi-Surface Expertise",
    description: "Walls, tiles, plywood, blinds, metals, and glass.",
    icon: "surfaces",
  },
  {
    title: "Custom Artwork Solutions",
    description: "From curated designs to bespoke visual stories.",
    icon: "artwork",
  },
  {
    title: "Mumbai Studio Support",
    description: "Work directly with our local team in Oshiwara.",
    icon: "support",
  },
];

function BenefitIcon({
  type,
}: {
  type: "consultation" | "surfaces" | "artwork" | "support";
}) {
  switch (type) {
    case "consultation":
      return <MessageSquare className="h-6 w-6 stroke-[1.6] text-[#921A1E]" />;
    case "surfaces":
      return <Layers className="h-6 w-6 stroke-[1.6] text-[#921A1E]" />;
    case "artwork":
      return <Box className="h-6 w-6 stroke-[1.6] text-[#921A1E]" />;
    case "support":
      return <Zap className="h-6 w-6 stroke-[1.6] text-[#921A1E]" />;
  }
}

function ContactEnquiryWorkspace() {
  const searchParams = useSearchParams();
  const formSectionRef = useRef<HTMLDivElement | null>(null);
  const fullNameInputRef = useRef<HTMLInputElement | null>(null);

  const prefilledDesignSlug = searchParams.get("design") || "";
  const prefilledProjectSlug = searchParams.get("project") || "";
  const prefilledDesignTitle = searchParams.get("title") || "";
  const prefilledCategory = searchParams.get("category") || "";
  const prefilledSurface = searchParams.get("surface") || "";
  const prefilledInterestParam = searchParams.get("interest") || "";

  const matchedCatalogueDesign = useMemo(
    () => findDesignBySlugOrId(prefilledDesignSlug),
    [prefilledDesignSlug]
  );

  const matchedPortfolioProject = useMemo(
    () => findProjectBySlugOrId(prefilledProjectSlug),
    [prefilledProjectSlug]
  );

  const resolvedDesignOrProjectTitle =
    matchedCatalogueDesign?.title ||
    matchedPortfolioProject?.title ||
    prefilledDesignTitle.trim() ||
    "";

  const resolvedContextSubtitle = matchedCatalogueDesign
    ? `${matchedCatalogueDesign.categoryLabel} Collection • ${matchedCatalogueDesign.compatibleSurfaces.join(", ")}`
    : matchedPortfolioProject
      ? `${matchedPortfolioProject.projectType} • ${matchedPortfolioProject.surfaceName}`
      : prefilledCategory
        ? prefilledCategory
        : prefilledSurface
          ? `Surface: ${prefilledSurface}`
          : "";

  // Determine initial surface / service interest
  const defaultSurfaceInterest = useMemo(() => {
    if (prefilledSurface.trim()) {
      const match = ATELIER_SURFACES.find(
        (s) => s.name.toLowerCase() === prefilledSurface.trim().toLowerCase()
      );
      if (match) return match.name;
    }
    if (matchedPortfolioProject?.surfaceName) {
      const match = ATELIER_SURFACES.find(
        (s) =>
          s.name.toLowerCase() ===
          matchedPortfolioProject.surfaceName.toLowerCase()
      );
      if (match) return match.name;
    }
    if (matchedCatalogueDesign?.compatibleSurfaces?.[0]) {
      return matchedCatalogueDesign.compatibleSurfaces[0];
    }
    if (prefilledInterestParam.trim()) {
      return prefilledInterestParam.trim();
    }
    return "Walls";
  }, [
    prefilledSurface,
    matchedPortfolioProject,
    matchedCatalogueDesign,
    prefilledInterestParam,
  ]);

  const defaultReferenceValue = useMemo(() => {
    if (matchedPortfolioProject) {
      return `${matchedPortfolioProject.title} (${matchedPortfolioProject.locationNote})`;
    }
    if (matchedCatalogueDesign) {
      return `${matchedCatalogueDesign.title} — ${matchedCatalogueDesign.categoryLabel}`;
    }
    if (resolvedDesignOrProjectTitle) {
      return resolvedDesignOrProjectTitle;
    }
    return "";
  }, [
    matchedPortfolioProject,
    matchedCatalogueDesign,
    resolvedDesignOrProjectTitle,
  ]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedSurface, setSelectedSurface] = useState<string>(
    defaultSurfaceInterest
  );
  const [userEditedSurface, setUserEditedSurface] = useState(false);

  const [selectedDesignReference, setSelectedDesignReference] = useState(
    defaultReferenceValue
  );
  const [userEditedReference, setUserEditedReference] = useState(false);

  const [message, setMessage] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  // Sync URL query param prefills safely without overwriting manual user edits
  const currentQueryKey = `${prefilledDesignSlug}|${prefilledProjectSlug}|${prefilledInterestParam}|${prefilledSurface}|${prefilledDesignTitle}`;
  const [prevQueryKey, setPrevQueryKey] = useState(currentQueryKey);
  if (currentQueryKey !== prevQueryKey) {
    setPrevQueryKey(currentQueryKey);
    if (!userEditedSurface && defaultSurfaceInterest) {
      setSelectedSurface(defaultSurfaceInterest);
    }
    if (!userEditedReference && defaultReferenceValue) {
      setSelectedDesignReference(defaultReferenceValue);
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmittedSignature, setLastSubmittedSignature] = useState<
    string | null
  >(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submissionNotice, setSubmissionNotice] = useState<{
    type: "success" | "error";
    title: string;
    detail: string;
    referenceCode?: string | null;
  } | null>(null);

  const formattedServiceInterest = useMemo(() => {
    if (!selectedSurface.trim()) return "";
    const knownSurface = ATELIER_SURFACES.find(
      (s) => s.name.toLowerCase() === selectedSurface.trim().toLowerCase()
    );
    if (knownSurface) {
      return `3D Printing on ${knownSurface.name}`;
    }
    return selectedSurface.trim();
  }, [selectedSurface]);

  const currentPayloadSignature = JSON.stringify({
    fullName: fullName.trim(),
    email: email.trim(),
    phone: phone.trim(),
    serviceInterest: formattedServiceInterest,
    selectedDesignReference: selectedDesignReference.trim(),
    message: message.trim(),
  });

  const isDuplicateSubmission =
    lastSubmittedSignature !== null &&
    lastSubmittedSignature === currentPayloadSignature;

  // Build structured WhatsApp message containing only user-provided fields (Section 11)
  const dynamicWhatsAppMessage = useMemo(() => {
    const lines: string[] = [
      "Hello ATELIER — WALL STORY, I would like to enquire about a wall/surface printing project.",
    ];
    if (fullName.trim()) {
      lines.push(`Name: ${fullName.trim()}`);
    }
    if (selectedSurface.trim()) {
      lines.push(`Surface: ${selectedSurface.trim()}`);
    }
    if (selectedDesignReference.trim()) {
      lines.push(`Selected Design: ${selectedDesignReference.trim()}`);
    }
    if (message.trim()) {
      lines.push(`Project Details: ${message.trim()}`);
    }
    return lines.join("\n");
  }, [fullName, selectedSurface, selectedDesignReference, message]);

  const handleScrollToForm = () => {
    formSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    window.setTimeout(() => {
      fullNameInputRef.current?.focus();
    }, 450);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (isDuplicateSubmission) {
      setSubmissionNotice({
        type: "error",
        title: "Enquiry Already Received",
        detail:
          "This exact brief has already been submitted in your current session. Update any detail above if you wish to send a revised note.",
      });
      return;
    }

    setFieldErrors({});
    setSubmissionNotice(null);

    const payload = {
      fullName,
      email,
      phone,
      serviceInterest: formattedServiceInterest || undefined,
      serviceOrDesignInterest: formattedServiceInterest || undefined,
      selectedDesignSlug:
        matchedCatalogueDesign?.slug || prefilledDesignSlug || undefined,
      selectedProjectSlug:
        matchedPortfolioProject?.slug || prefilledProjectSlug || undefined,
      selectedDesignReference: selectedDesignReference.trim() || undefined,
      message,
      consentGiven,
      sourcePage: "/contact",
      honeypot,
    };

    const parsed = enquirySubmissionSchema.safeParse(payload);

    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] || "form");
        if (!nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      setSubmissionNotice({
        type: "error",
        title: "Please review the highlighted fields",
        detail:
          "Please enter your full name, a valid email address, your phone number, and your project message.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
        }
        setSubmissionNotice({
          type: "error",
          title: data.error || "Unable to submit your enquiry",
          detail:
            "Please check the highlighted fields and try again, or reach our Mumbai studio via WhatsApp.",
        });
        return;
      }

      setLastSubmittedSignature(currentPayloadSignature);

      setSubmissionNotice({
        type: "success",
        title: "Thank you. Your enquiry has been received.",
        detail:
          data.message ||
          "Our Mumbai studio team in Oshiwara, Andheri West will review your brief and contact you shortly.",
        referenceCode: data.referenceCode || null,
      });
    } catch {
      setSubmissionNotice({
        type: "error",
        title: "Connection Interrupted",
        detail:
          "We could not complete your request right now. Your entered details have been preserved—please try submitting again or message our studio on WhatsApp.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#EFE5D8] text-[#1D1816]">
      {/* =====================================================================
          SECTION 02 — CINEMATIC SCULPTURAL HERO
          Matches approved reference (`media_1793897072682_9c57d53b.jpg`)
         ===================================================================== */}
      <section className="relative overflow-hidden bg-[#E9DDD0] pt-11 pb-18 sm:pt-14 sm:pb-24 lg:min-h-[430px] lg:pt-16 lg:pb-28">
        {/* Full-Width Sculptural Arch & Lotus Mural Interior Photograph */}
        <div className="pointer-events-none absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ATELIER_ASSET_REGISTRY.aboutHeroLotusArch.url}
            alt="Sunlit architectural living space with a sculptural plaster archway and bespoke lotus botanical wall mural by ATELIER — WALL STORY"
            className="h-full w-full object-cover object-[50%_16%] sm:object-[50%_18%] lg:object-[50%_20%]"
          />
          {/* Left-side warm plaster editorial readability gradient */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#F6EFE6]/96 via-[#F3EAE0]/88 to-[#F3EAE0]/45 lg:from-[#F6EFE6]/94 lg:via-[#F2E8DC]/58 lg:to-transparent"
          />
        </div>

        <Container className="relative z-10">
          <div className="max-w-[540px] py-2 sm:py-4 lg:py-6">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-[1.5px] w-7 bg-[#9A2125]"
              />
              <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9A2125]">
                ATELIER — WALL STORY • CONTACT US
              </span>
            </div>

            {/* Three-Line Editorial Serif Headline */}
            <h1 className="mt-4 font-serif text-4xl font-normal leading-[1.06] tracking-[-0.015em] text-[#1D1816] sm:text-5xl lg:text-[62px]">
              <span className="block">Let’s Create</span>
              <span className="block">Something</span>
              <span className="mt-0.5 block font-serif italic text-[#8E1B20]">
                Remarkable.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="mt-5 max-w-[440px] font-sans text-[15px] leading-[1.68] text-[#4A413B] sm:text-base">
              Tell us about your space, your ideas, and the wall story you want
              to create. Our Mumbai studio will get in touch with you soon.
            </p>
          </div>
        </Container>

        {/* Sculptural Flowing Plaster Wave Divider at Base of Hero */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 overflow-hidden leading-none"
        >
          <svg
            viewBox="0 0 1440 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="h-10 w-full sm:h-16 lg:h-20"
          >
            <path
              d="M0 36C240 -10 520 92 860 64C1120 42 1310 8 1440 24V96H0V36Z"
              fill="#EFE5D8"
            />
          </svg>
        </div>
      </section>

      {/* =====================================================================
          SECTIONS 03–06 — MAIN ENQUIRY FORM & MUMBAI STUDIO SIDEBAR
          Content-driven card heights (`items-start`) with zero blank space
         ===================================================================== */}
      <section
        id="project-enquiry-form"
        ref={formSectionRef}
        className="relative z-20 -mt-4 pb-14 sm:-mt-8 sm:pb-20"
      >
        <Container>
          <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-12 lg:gap-8">
            {/* ===============================================================
                LEFT COLUMN (7 COLS): PREMIUM PROJECT ENQUIRY FORM CARD
               =============================================================== */}
            <div className="rounded-[26px] border border-[#E4D9CA] bg-[#FAF6F0] p-6 shadow-[0_24px_60px_rgba(28,20,16,0.08)] sm:p-9 lg:col-span-7 lg:p-10">
              {/* Eyebrow & Required Indicator */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-[#921A1E]">
                  PROJECT &amp; SURFACE ENQUIRY
                </span>
                <span className="font-sans text-[11px] text-[#7A6F66]">
                  * Required fields
                </span>
              </div>

              {/* Form Heading */}
              <h2 className="mt-2 font-serif text-3xl font-normal leading-tight text-[#1D1816] sm:text-4xl">
                Share Your Wall or Surface Brief
              </h2>

              {/* Form Description */}
              <p className="mt-2.5 text-sm leading-[1.65] text-[#554B44] sm:text-[15px]">
                Enquire about direct 3D printing on walls, tiles, plywood,
                office blinds, metals, or glass — or reference a specific
                artwork from our design collection.
              </p>

              {/* Automatic Selected Artwork / Project Context Banner (Section 20) */}
              {(matchedCatalogueDesign ||
                matchedPortfolioProject ||
                resolvedDesignOrProjectTitle) && (
                <div className="mt-5 flex flex-col justify-between gap-3.5 rounded-2xl border border-[#DFC5C0] bg-[#F4EAE2] p-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3.5">
                    {(matchedCatalogueDesign || matchedPortfolioProject) && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={
                          (
                            matchedCatalogueDesign?.coverImage ??
                            matchedPortfolioProject?.coverImage
                          )?.secureUrl
                        }
                        alt={
                          resolvedDesignOrProjectTitle ||
                          "Selected ATELIER reference"
                        }
                        className="h-14 w-18 shrink-0 rounded-xl border border-[#DECFC0] object-cover"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#921A1E]">
                        <Sparkles className="h-3 w-3" />
                        <span>
                          {matchedPortfolioProject
                            ? "Selected Portfolio Project"
                            : "Selected Collection Artwork"}
                        </span>
                      </div>
                      <p className="mt-0.5 font-serif text-lg font-medium text-[#1D1816]">
                        {resolvedDesignOrProjectTitle}
                      </p>
                      {resolvedContextSubtitle && (
                        <p className="text-xs text-[#695E55]">
                          {resolvedContextSubtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <Link
                    href={
                      matchedPortfolioProject
                        ? `/projects/${matchedPortfolioProject.slug}`
                        : matchedCatalogueDesign
                          ? `/explore-designs?category=${matchedCatalogueDesign.categorySlug}&design=${matchedCatalogueDesign.slug}`
                          : "/explore-designs"
                    }
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#D8C9B8] bg-[#FAF6F0] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8E1B20] transition-colors hover:border-[#921A1E]"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    <span>
                      {matchedPortfolioProject
                        ? "View Project"
                        : "View Design"}
                    </span>
                  </Link>
                </div>
              )}

              {/* Field 1 — Quick-Select Service / Surface Interest Pills */}
              <div className="mt-6">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6E635A]">
                  QUICK-SELECT SERVICE / SURFACE INTEREST (OPTIONAL):
                </span>
                <div
                  role="group"
                  aria-label="Quick-select surface interest"
                  className="mt-2.5 flex flex-wrap gap-2"
                >
                  {ATELIER_SURFACES.map((surface) => {
                    const isSelected =
                      selectedSurface.trim().toLowerCase() ===
                      surface.name.toLowerCase();
                    return (
                      <button
                        key={surface.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => {
                          setUserEditedSurface(true);
                          setSelectedSurface(isSelected ? "" : surface.name);
                        }}
                        className={cn(
                          "cursor-pointer rounded-xl border px-4 py-2 text-xs font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#921A1E]",
                          isSelected
                            ? "border-[#921A1E] bg-[#921A1E] font-semibold text-[#FAF6F0] shadow-xs"
                            : "border-[#DDD0C0] bg-[#F5EFE6] text-[#2B2420] hover:border-[#921A1E] hover:text-[#921A1E]"
                        )}
                      >
                        {surface.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submission Status Banner (Customer-Friendly, Zero Technical Jargon) */}
              {submissionNotice && (
                <div
                  role="status"
                  aria-live="polite"
                  className={cn(
                    "mt-6 rounded-2xl border p-4 text-xs leading-relaxed sm:text-sm",
                    submissionNotice.type === "error"
                      ? "border-[#D68F8C] bg-[#FDF1F0] text-[#7D181C]"
                      : "border-emerald-700/30 bg-[#F1F8F4] text-[#1D3528]"
                  )}
                >
                  <div className="flex items-center justify-between gap-2 font-semibold">
                    <div className="flex items-center gap-2">
                      {submissionNotice.type === "error" ? (
                        <AlertCircle className="h-4 w-4 shrink-0 text-[#921A1E]" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
                      )}
                      <span>{submissionNotice.title}</span>
                    </div>
                    {submissionNotice.referenceCode && (
                      <span className="rounded-full bg-emerald-800/10 px-3 py-0.5 text-[11px] font-semibold tracking-wider text-emerald-900">
                        Ref: {submissionNotice.referenceCode}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 opacity-90">{submissionNotice.detail}</p>
                </div>
              )}

              {/* Main Project Enquiry Form */}
              <form
                onSubmit={handleSubmit}
                noValidate
                className="mt-6 space-y-5"
              >
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
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                {/* Row 1: Full Name + Email Address */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="enquiry-fullName"
                      className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#1D1816]"
                    >
                      FULL NAME *
                    </label>
                    <input
                      ref={fullNameInputRef}
                      id="enquiry-fullName"
                      type="text"
                      required
                      aria-invalid={Boolean(fieldErrors.fullName)}
                      aria-describedby={
                        fieldErrors.fullName ? "err-fullName" : undefined
                      }
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className={cn(
                        "mt-1.5 w-full rounded-xl border bg-[#F5EFE6] px-4 py-3 text-sm text-[#1D1816] placeholder:text-[#8C8076] transition-colors focus:border-[#921A1E] focus:bg-[#FAF6F0] focus:outline-none",
                        fieldErrors.fullName
                          ? "border-[#921A1E]"
                          : "border-[#DFD2C3]"
                      )}
                    />
                    {fieldErrors.fullName && (
                      <p
                        id="err-fullName"
                        className="mt-1 text-xs text-[#921A1E]"
                      >
                        {fieldErrors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="enquiry-email"
                      className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#1D1816]"
                    >
                      EMAIL ADDRESS *
                    </label>
                    <input
                      id="enquiry-email"
                      type="email"
                      required
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={
                        fieldErrors.email ? "err-email" : undefined
                      }
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={cn(
                        "mt-1.5 w-full rounded-xl border bg-[#F5EFE6] px-4 py-3 text-sm text-[#1D1816] placeholder:text-[#8C8076] transition-colors focus:border-[#921A1E] focus:bg-[#FAF6F0] focus:outline-none",
                        fieldErrors.email
                          ? "border-[#921A1E]"
                          : "border-[#DFD2C3]"
                      )}
                    />
                    {fieldErrors.email && (
                      <p id="err-email" className="mt-1 text-xs text-[#921A1E]">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 2: Phone Number + Service Interest Dropdown */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="enquiry-phone"
                      className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#1D1816]"
                    >
                      PHONE NUMBER *
                    </label>
                    <input
                      id="enquiry-phone"
                      type="tel"
                      required
                      aria-invalid={Boolean(fieldErrors.phone)}
                      aria-describedby={
                        fieldErrors.phone ? "err-phone" : undefined
                      }
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91..."
                      className={cn(
                        "mt-1.5 w-full rounded-xl border bg-[#F5EFE6] px-4 py-3 text-sm text-[#1D1816] placeholder:text-[#8C8076] transition-colors focus:border-[#921A1E] focus:bg-[#FAF6F0] focus:outline-none",
                        fieldErrors.phone
                          ? "border-[#921A1E]"
                          : "border-[#DFD2C3]"
                      )}
                    />
                    {fieldErrors.phone && (
                      <p id="err-phone" className="mt-1 text-xs text-[#921A1E]">
                        {fieldErrors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="enquiry-interest"
                      className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#1D1816]"
                    >
                      SERVICE INTEREST (OPTIONAL)
                    </label>
                    <div className="relative mt-1.5">
                      <select
                        id="enquiry-interest"
                        value={selectedSurface}
                        onChange={(e) => {
                          setUserEditedSurface(true);
                          setSelectedSurface(e.target.value);
                        }}
                        className="w-full appearance-none rounded-xl border border-[#DFD2C3] bg-[#F5EFE6] px-4 py-3 pr-10 text-sm text-[#1D1816] transition-colors focus:border-[#921A1E] focus:bg-[#FAF6F0] focus:outline-none"
                      >
                        <option value="">Select a service or surface</option>
                        {SERVICE_DROPDOWN_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                        {selectedSurface &&
                          !SERVICE_DROPDOWN_OPTIONS.some(
                            (o) =>
                              o.value.toLowerCase() ===
                              selectedSurface.toLowerCase()
                          ) && (
                            <option value={selectedSurface}>
                              {selectedSurface}
                            </option>
                          )}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6E635A]" />
                    </div>
                  </div>
                </div>

                {/* Row 3: Selected Design or Project */}
                <div>
                  <label
                    htmlFor="enquiry-design-ref"
                    className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#1D1816]"
                  >
                    SELECTED DESIGN OR PROJECT (OPTIONAL)
                  </label>
                  <input
                    id="enquiry-design-ref"
                    type="text"
                    value={selectedDesignReference}
                    onChange={(e) => {
                      setUserEditedReference(true);
                      setSelectedDesignReference(e.target.value);
                    }}
                    placeholder="Design name, project reference, or a link (if any)"
                    className="mt-1.5 w-full rounded-xl border border-[#DFD2C3] bg-[#F5EFE6] px-4 py-3 text-sm text-[#1D1816] placeholder:text-[#8C8076] transition-colors focus:border-[#921A1E] focus:bg-[#FAF6F0] focus:outline-none"
                  />
                </div>

                {/* Row 4: Message */}
                <div>
                  <label
                    htmlFor="enquiry-message"
                    className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#1D1816]"
                  >
                    MESSAGE *
                  </label>
                  <textarea
                    id="enquiry-message"
                    rows={4}
                    required
                    aria-invalid={Boolean(fieldErrors.message)}
                    aria-describedby={
                      fieldErrors.message ? "err-message" : undefined
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your wall or surface dimensions, substrate type (walls, tiles, plywood, office blinds, metals, or glass), location, and creative ideas..."
                    className={cn(
                      "mt-1.5 w-full rounded-xl border bg-[#F5EFE6] px-4 py-3 text-sm leading-relaxed text-[#1D1816] placeholder:text-[#8C8076] transition-colors focus:border-[#921A1E] focus:bg-[#FAF6F0] focus:outline-none",
                      fieldErrors.message
                        ? "border-[#921A1E]"
                        : "border-[#DFD2C3]"
                    )}
                  />
                  {fieldErrors.message && (
                    <p
                      id="err-message"
                      className="mt-1 text-xs text-[#921A1E]"
                    >
                      {fieldErrors.message}
                    </p>
                  )}
                </div>

                {/* Row 5: Consent Checkbox */}
                <div className="flex items-start gap-2.5 pt-0.5">
                  <input
                    id="enquiry-consent"
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-0.5 h-4 w-4 cursor-pointer rounded border-[#C9B9A6] accent-[#921A1E]"
                  />
                  <label
                    htmlFor="enquiry-consent"
                    className="cursor-pointer text-xs leading-relaxed text-[#5A5048]"
                  >
                    I consent to {ATELIER_BRAND.name} contacting me via phone,
                    WhatsApp, or email regarding my enquiry. (Optional)
                  </label>
                </div>

                {/* Row 6: Primary Submit Button & Secondary Send via WhatsApp Button */}
                <div className="grid grid-cols-1 gap-3.5 pt-2 sm:grid-cols-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || isDuplicateSubmission}
                    className="inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-[#921A1E] px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#FAF6F0] shadow-[0_12px_28px_rgba(146,26,30,0.24)] transition-all hover:bg-[#771418] disabled:cursor-not-allowed disabled:opacity-65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#921A1E]"
                  >
                    <Send className="h-4 w-4" />
                    <span>
                      {isSubmitting
                        ? "Submitting Enquiry…"
                        : isDuplicateSubmission
                          ? "Enquiry Received"
                          : "Submit Enquiry"}
                    </span>
                  </button>

                  <a
                    href={buildWhatsAppUrl(
                      ATELIER_WHATSAPP_NUMBERS[0].digits,
                      dynamicWhatsAppMessage
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-[#D8CBB8] bg-[#F5EFE6] px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#1D1816] transition-all hover:border-[#921A1E] hover:text-[#921A1E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#921A1E]"
                  >
                    <MessageCircle className="h-4 w-4 text-[#921A1E]" />
                    <span>Send via WhatsApp</span>
                  </a>
                </div>
              </form>
            </div>

            {/* ===============================================================
                RIGHT COLUMN (5 COLS): STUDIO CONTACTS, LOCATION & INTERIOR FEATURE
               =============================================================== */}
            <div className="space-y-6 lg:col-span-5">
              {/* SECTION 04 — OFFICIAL STUDIO CONTACTS CARD */}
              <div className="rounded-[24px] border border-[#E4D9CA] bg-[#FAF6F0] p-6 shadow-[0_18px_45px_rgba(28,20,16,0.06)] sm:p-7">
                <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-[#921A1E]">
                  OFFICIAL STUDIO CONTACTS
                </span>
                <h3 className="mt-1.5 font-serif text-2xl font-normal leading-tight text-[#1D1816] sm:text-[26px]">
                  Speak Directly with Our Mumbai Team
                </h3>

                <div className="mt-5 space-y-3.5">
                  {/* Contact 01: Saikat Ray */}
                  <div className="rounded-2xl border border-[#E6DBD0] bg-[#F5EFE6] p-4 transition-colors hover:border-[#D6C4B0]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E4C9C6] bg-[#F6E4E1] text-[#921A1E]">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-serif text-lg font-medium leading-tight text-[#1D1816]">
                            Saikat Ray
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-[#3D352E]">
                            <a
                              href="tel:+918591971675"
                              className="inline-flex items-center gap-1 transition-colors hover:text-[#921A1E]"
                            >
                              <Phone className="h-3 w-3 text-[#921A1E]" />
                              <span>+91 85919 71675</span>
                            </a>
                            <span
                              aria-hidden="true"
                              className="text-[#C5B6A5]"
                            >
                              |
                            </span>
                            <a
                              href="tel:+918017463132"
                              className="inline-flex items-center gap-1 transition-colors hover:text-[#921A1E]"
                            >
                              <Phone className="h-3 w-3 text-[#921A1E]" />
                              <span>+91 80174 63132</span>
                            </a>
                          </div>
                        </div>
                      </div>

                      <a
                        href={buildWhatsAppUrl(
                          "918017463132",
                          dynamicWhatsAppMessage
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="WhatsApp Saikat Ray at +91 80174 63132"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5A3A0] bg-[#FAF6F0] px-3 py-1.5 text-[11px] font-semibold text-[#921A1E] transition-colors hover:bg-[#921A1E] hover:text-[#FAF6F0]"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* Contact 02: Triparna Bardhan */}
                  <div className="rounded-2xl border border-[#E6DBD0] bg-[#F5EFE6] p-4 transition-colors hover:border-[#D6C4B0]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E4C9C6] bg-[#F6E4E1] text-[#921A1E]">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-serif text-lg font-medium leading-tight text-[#1D1816]">
                            Triparna Bardhan
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-medium text-[#3D352E]">
                            <a
                              href="tel:+918697170746"
                              className="inline-flex items-center gap-1 transition-colors hover:text-[#921A1E]"
                            >
                              <Phone className="h-3 w-3 text-[#921A1E]" />
                              <span>+91 86971 70746</span>
                            </a>
                          </div>
                        </div>
                      </div>

                      <a
                        href={buildWhatsAppUrl(
                          "918697170746",
                          dynamicWhatsAppMessage
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="WhatsApp Triparna Bardhan at +91 86971 70746"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5A3A0] bg-[#FAF6F0] px-3 py-1.5 text-[11px] font-semibold text-[#921A1E] transition-colors hover:bg-[#921A1E] hover:text-[#FAF6F0]"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 05 — MUMBAI STUDIO LOCATION CARD */}
              <div className="rounded-[24px] border border-[#E4D9CA] bg-[#FAF6F0] p-6 shadow-[0_18px_45px_rgba(28,20,16,0.06)] sm:p-7">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#921A1E]">
                  <MapPin className="h-4 w-4 text-[#921A1E]" />
                  <span>MUMBAI STUDIO LOCATION</span>
                </div>

                <h3 className="mt-1.5 font-serif text-2xl font-normal leading-tight text-[#1D1816] sm:text-[26px]">
                  Oshiwara, Andheri West
                </h3>

                <address className="mt-2.5 not-italic text-sm leading-[1.65] text-[#4E443C]">
                  {ATELIER_BRAND.address.line1},
                  <br />
                  {ATELIER_BRAND.address.line2},
                  <br />
                  Andheri West, Mumbai – 400102
                </address>

                <div className="mt-5">
                  <a
                    href={GOOGLE_MAPS_DIRECTIONS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#D8CBB8] bg-[#F5EFE6] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#1D1816] transition-colors hover:border-[#921A1E] hover:text-[#921A1E]"
                  >
                    <Navigation className="h-3.5 w-3.5 text-[#921A1E]" />
                    <span>Open Directions in Google Maps</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* SECTION 06 — ARCHITECTURAL IMAGE FEATURE CARD */}
              <div className="overflow-hidden rounded-[24px] border border-[#E4D9CA] bg-[#FAF6F0] p-2.5 shadow-[0_18px_45px_rgba(28,20,16,0.06)]">
                <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-[18px] bg-[#241B18]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ATELIER_ASSET_REGISTRY.contactStudioDiningMural.url}
                    alt={
                      ATELIER_ASSET_REGISTRY.contactStudioDiningMural.altText
                    }
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1A1311]/75 via-[#1A1311]/20 to-transparent p-4">
                    <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E8CFC8]">
                      ATELIER — WALL STORY • ARCHITECTURAL SURFACE STUDY
                    </p>
                    <p className="mt-0.5 font-serif text-base text-[#FAF6F0]">
                      Bespoke Lotus Mural &amp; Multi-Surface Consultation
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =====================================================================
          SECTION 07 — STUDIO BENEFITS STRIP (FOUR BALANCED COLUMNS)
         ===================================================================== */}
      <section className="border-t border-[#E2D6C5] bg-[#F4ECE1] py-12 sm:py-14">
        <Container>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-[#DED1C0]">
            {STUDIO_BENEFITS.map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center px-6 text-center"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5E1DE]/70">
                  <BenefitIcon type={item.icon} />
                </div>
                <h3 className="mt-3.5 font-serif text-xl font-medium text-[#1D1816]">
                  {item.title}
                </h3>
                <p className="mt-1.5 max-w-[230px] text-xs leading-relaxed text-[#5D524A] sm:text-[13px]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* =====================================================================
          SECTION 08 — SCULPTURAL CREAM CTA BANNER
         ===================================================================== */}
      <section className="relative overflow-hidden border-t border-[#DDD2C5] bg-gradient-to-r from-[#FBF8F3] via-[#F6EAE6] to-[#EBE3D8] text-[#211D1A]">
        <Container className="relative z-10 py-12 sm:py-16">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            {/* Heading */}
            <div className="lg:col-span-4">
              <h2 className="font-serif text-3xl font-normal leading-[1.1] text-[#211D1A] sm:text-4xl lg:text-[44px]">
                Have a Design
                <span className="block italic text-[#9B1C1C]">in Mind?</span>
              </h2>
            </div>

            {/* Description with Subtle Vertical Divider on Desktop */}
            <div className="border-[#DDD2C5] lg:col-span-5 lg:border-l lg:pl-8">
              <p className="max-w-md text-sm leading-[1.7] text-[#6F665E] sm:text-[15px]">
                Share your idea, reference, or space details, and let’s explore
                the right wall-art solution for your project.
              </p>
            </div>

            {/* Stacked Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-3 lg:flex-col">
              <button
                type="button"
                onClick={handleScrollToForm}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#9B1C1C] px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#FAF9F6] shadow-md transition-colors hover:bg-[#73171B]"
              >
                <span>Start a Project Enquiry</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <a
                href={buildWhatsAppUrl(
                  ATELIER_WHATSAPP_NUMBERS[0].digits,
                  dynamicWhatsAppMessage
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DDD2C5] bg-[#FBF8F3] px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#211D1A] shadow-2xs transition-colors hover:border-[#9B1C1C] hover:bg-[#F6EAE6]"
              >
                <MessageCircle className="h-3.5 w-3.5 text-[#9B1C1C]" />
                <span>WhatsApp Our Studio</span>
              </a>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

export default function ContactPage() {
  return (
    <PublicShell>
      <Suspense
        fallback={
          <div className="py-36 text-center font-serif text-2xl text-[#1D1816]">
            Loading {ATELIER_BRAND.name} Studio Contact…
          </div>
        }
      >
        <ContactEnquiryWorkspace />
      </Suspense>
    </PublicShell>
  );
}
