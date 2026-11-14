"use client";

import React, { Suspense, useCallback, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PublicShell } from "@/components/layout/PublicShell";
import { Container } from "@/components/layout/Container";
import {
  ATELIER_BRAND,
  ATELIER_SURFACES,
  ATELIER_WHATSAPP_NUMBERS,
  buildWhatsAppUrl,
} from "@/lib/brand";
import { findDesignBySlugOrId } from "@/lib/designs-catalogue";
import { findProjectBySlugOrId } from "@/lib/projects-catalogue";
import { enquirySubmissionSchema } from "@/types/models";
import { ContactHeroAndCapabilities } from "@/components/contact/ContactHeroAndCapabilities";
import {
  PrefilledContextCard,
  ProjectEnquiryFormCard,
  SubmissionNoticeState,
} from "@/components/contact/ProjectEnquiryFormCard";
import {
  ContactClosingCta,
  StudioInformationSidebar,
} from "@/components/contact/StudioSidebarAndClosingCta";

function ContactEnquiryWorkspace() {
  const searchParams = useSearchParams();
  const formSectionRef = useRef<HTMLElement | null>(null);
  const fullNameInputRef = useRef<HTMLInputElement | null>(null);

  const prefilledDesignSlug = searchParams.get("design") || "";
  const prefilledProjectSlug = searchParams.get("project") || "";
  const prefilledDesignTitle = searchParams.get("title") || "";
  const prefilledCategory = searchParams.get("category") || "";
  const prefilledSurface = searchParams.get("surface") || "";
  const prefilledInterestParam = searchParams.get("interest") || "";
  const prefilledModeParam = searchParams.get("mode") || "";
  const prefilledDimensionsParam = searchParams.get("dimensions") || "";

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
      const raw = prefilledInterestParam.trim();
      const match = ATELIER_SURFACES.find(
        (s) => s.name.toLowerCase() === raw.toLowerCase()
      );
      if (match) return match.name;
      if (raw.toLowerCase().includes("custom")) return "Custom Wall Art";
      return raw;
    }
    return "Walls";
  }, [
    prefilledSurface,
    matchedPortfolioProject,
    matchedCatalogueDesign,
    prefilledInterestParam,
  ]);

  const defaultReferenceValue = useMemo(() => {
    const modeSuffix =
      prefilledModeParam === "pattern"
        ? " (Repeating Pattern)"
        : prefilledModeParam === "mural"
          ? " (Full-Wall Mural)"
          : "";
    const dimSuffix = prefilledDimensionsParam.trim()
      ? ` — Wall: ${prefilledDimensionsParam.trim()}`
      : "";
    if (matchedPortfolioProject) {
      return `${matchedPortfolioProject.title} (${matchedPortfolioProject.locationNote})${dimSuffix}`;
    }
    if (matchedCatalogueDesign) {
      return `${matchedCatalogueDesign.title} — ${matchedCatalogueDesign.categoryLabel}${modeSuffix}${dimSuffix}`;
    }
    if (resolvedDesignOrProjectTitle) {
      return `${resolvedDesignOrProjectTitle}${modeSuffix}${dimSuffix}`;
    }
    return "";
  }, [
    matchedPortfolioProject,
    matchedCatalogueDesign,
    resolvedDesignOrProjectTitle,
    prefilledModeParam,
    prefilledDimensionsParam,
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
  const [submissionNotice, setSubmissionNotice] =
    useState<SubmissionNoticeState | null>(null);

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

  const dynamicWhatsAppMessage = useMemo(() => {
    const lines: string[] = [
      "Hello ATELIER — WALL STORY, I would like to enquire about a wall or surface printing project.",
    ];
    if (fullName.trim()) {
      lines.push(`Name: ${fullName.trim()}`);
    }
    if (phone.trim()) {
      lines.push(`Phone: ${phone.trim()}`);
    }
    if (email.trim()) {
      lines.push(`Email: ${email.trim()}`);
    }
    if (selectedSurface.trim()) {
      lines.push(`Service Interest: ${selectedSurface.trim()}`);
    }
    if (selectedDesignReference.trim()) {
      lines.push(`Selected Design / Project: ${selectedDesignReference.trim()}`);
    }
    if (message.trim()) {
      lines.push(`Project Details: ${message.trim()}`);
    }
    return lines.join("\n");
  }, [
    fullName,
    phone,
    email,
    selectedSurface,
    selectedDesignReference,
    message,
  ]);

  const studioWhatsAppHref = useMemo(
    () =>
      buildWhatsAppUrl(ATELIER_WHATSAPP_NUMBERS[0].digits, dynamicWhatsAppMessage),
    [dynamicWhatsAppMessage]
  );

  const prefilledContext = useMemo<PrefilledContextCard | null>(() => {
    if (
      !matchedCatalogueDesign &&
      !matchedPortfolioProject &&
      !resolvedDesignOrProjectTitle
    ) {
      return null;
    }
    return {
      kindLabel: matchedPortfolioProject
        ? "Selected Portfolio Project"
        : "Selected Collection Artwork",
      title: resolvedDesignOrProjectTitle,
      subtitle: resolvedContextSubtitle,
      thumbnailUrl: (
        matchedCatalogueDesign?.coverImage ?? matchedPortfolioProject?.coverImage
      )?.secureUrl,
      backHref: matchedPortfolioProject
        ? `/projects/${matchedPortfolioProject.slug}`
        : matchedCatalogueDesign
          ? `/explore-designs?category=${matchedCatalogueDesign.categorySlug}&design=${matchedCatalogueDesign.slug}`
          : "/explore-designs",
      backLabel: matchedPortfolioProject ? "View Project" : "View Design",
    };
  }, [
    matchedCatalogueDesign,
    matchedPortfolioProject,
    resolvedDesignOrProjectTitle,
    resolvedContextSubtitle,
  ]);

  const handleScrollToForm = useCallback(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    formSectionRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
    window.setTimeout(
      () => {
        fullNameInputRef.current?.focus();
      },
      prefersReducedMotion ? 50 : 420
    );
  }, []);

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
          "Please enter your full name, a valid email address, a valid phone number, and your project message.",
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
    <div className="bg-[#FAF6F0] text-[#1A1A1A]">
      {/* PART A & B — PREMIUM ARCHITECTURAL HERO + STUDIO CAPABILITY STRIP */}
      <ContactHeroAndCapabilities
        onScrollToForm={handleScrollToForm}
        studioWhatsAppHref={studioWhatsAppHref}
      />

      {/* PART C, D, E, F, G, H — MAIN TWO-COLUMN ENQUIRY & STUDIO AREA */}
      <section
        id="project-enquiry-form"
        ref={formSectionRef}
        aria-labelledby="project-enquiry-heading"
        className="py-10 sm:py-12 lg:py-14"
      >
        <Container className="lg:px-6 xl:px-10">
          <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,0.56fr)_minmax(0,0.44fr)] lg:gap-8 xl:gap-9">
            <div className="contact-cap-item">
              <ProjectEnquiryFormCard
                fullNameInputRef={fullNameInputRef}
                fullName={fullName}
                onFullNameChange={setFullName}
                email={email}
                onEmailChange={setEmail}
                phone={phone}
                onPhoneChange={setPhone}
                selectedSurface={selectedSurface}
                onSurfaceChange={(val) => {
                  setUserEditedSurface(true);
                  setSelectedSurface(val);
                }}
                selectedDesignReference={selectedDesignReference}
                onDesignReferenceChange={(val) => {
                  setUserEditedReference(true);
                  setSelectedDesignReference(val);
                }}
                message={message}
                onMessageChange={setMessage}
                consentGiven={consentGiven}
                onConsentChange={setConsentGiven}
                honeypot={honeypot}
                onHoneypotChange={setHoneypot}
                fieldErrors={fieldErrors}
                submissionNotice={submissionNotice}
                isSubmitting={isSubmitting}
                isDuplicateSubmission={isDuplicateSubmission}
                onSubmit={handleSubmit}
                whatsAppEnquiryHref={studioWhatsAppHref}
                prefilledContext={prefilledContext}
              />
            </div>

            <StudioInformationSidebar
              dynamicWhatsAppMessage={dynamicWhatsAppMessage}
            />
          </div>
        </Container>
      </section>

      {/* PART I — COMPACT CLOSING EDITORIAL CALL TO ACTION */}
      <ContactClosingCta
        onScrollToForm={handleScrollToForm}
        studioWhatsAppHref={studioWhatsAppHref}
      />
    </div>
  );
}

export default function ContactPage() {
  return (
    <PublicShell>
      <Suspense
        fallback={
          <div className="bg-[#FAF6F0] py-28 text-center font-serif text-2xl text-[#1A1A1A]">
            Loading {ATELIER_BRAND.name} Studio Contact…
          </div>
        }
      >
        <ContactEnquiryWorkspace />
      </Suspense>
    </PublicShell>
  );
}
