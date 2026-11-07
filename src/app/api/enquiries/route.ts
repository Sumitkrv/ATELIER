import { NextResponse } from "next/server";
import { enquirySubmissionSchema } from "@/types/models";
import { getEnvironmentReadiness } from "@/lib/env";
import { findDesignBySlugOrId } from "@/lib/designs-catalogue";
import { findProjectBySlugOrId } from "@/lib/projects-catalogue";
import {
  listStoredEnquiries,
  saveEnquiryRecord,
  StoredEnquiryRecord,
} from "@/lib/enquiries-store";

const MAX_PAYLOAD_BYTES = 16 * 1024; // 16 KB payload limit
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 8;

const rateLimitStore = new Map<
  string,
  { count: number; resetAtTimestamp: number }
>();

function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "anonymous";
  }
  return request.headers.get("x-real-ip") || "local-client";
}

function checkRateLimit(clientKey: string): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const existing = rateLimitStore.get(clientKey);

  if (!existing || now >= existing.resetAtTimestamp) {
    rateLimitStore.set(clientKey, {
      count: 1,
      resetAtTimestamp: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((existing.resetAtTimestamp - now) / 1000)
    );
    return { allowed: false, retryAfterSeconds };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * GET /api/enquiries
 * Returns persisted enquiries for the Admin CMS Enquiry CRM Inbox (`/admin/enquiries`).
 */
export async function GET() {
  try {
    const enquiries = await listStoredEnquiries();
    const readiness = getEnvironmentReadiness();
    return NextResponse.json({
      ok: true,
      count: enquiries.length,
      storageMode: readiness.mongodbConfigured
        ? "mongodb_configured"
        : "local_persistent_collection",
      enquiries,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to read enquiries collection.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/enquiries
 * Validates customer, design-specific, and project-specific enquiries from `/contact`,
 * `/explore-designs`, `/projects`, and `/services`, and persists them to the `enquiries` store.
 */
export async function POST(request: Request) {
  try {
    // 1. Rate-limiting check
    const clientKey = getClientIdentifier(request);
    const rateStatus = checkRateLimit(clientKey);
    if (!rateStatus.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: `Too many enquiry submissions. Please wait ${rateStatus.retryAfterSeconds} seconds before trying again.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateStatus.retryAfterSeconds),
          },
        }
      );
    }

    // 2. Payload size limit check
    const rawBody = await request.text();
    if (rawBody.length > MAX_PAYLOAD_BYTES) {
      return NextResponse.json(
        {
          ok: false,
          error: "Enquiry payload exceeds the 16 KB maximum size limit.",
        },
        { status: 413 }
      );
    }

    const body = JSON.parse(rawBody);

    // 3. Honeypot spam protection check
    if (
      typeof body?.honeypot === "string" &&
      body.honeypot.trim().length > 0
    ) {
      return NextResponse.json(
        {
          ok: false,
          spamBlocked: true,
          error: "Submission rejected by automated spam protection.",
        },
        { status: 400 }
      );
    }

    // 4. Zod schema validation
    const parsed = enquirySubmissionSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] || "form");
        if (!fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      return NextResponse.json(
        {
          ok: false,
          error: "Validation failed. Please check the highlighted fields.",
          fieldErrors,
        },
        { status: 400 }
      );
    }

    // 5. Server-side resolution of Design / Project slugs
    const matchedDesign =
      findDesignBySlugOrId(parsed.data.selectedDesignSlug) ||
      findDesignBySlugOrId(parsed.data.selectedDesignReference);

    const matchedProject =
      findProjectBySlugOrId(parsed.data.selectedProjectSlug) ||
      findProjectBySlugOrId(parsed.data.selectedDesignReference);

    const resolvedServiceInterest =
      parsed.data.serviceInterest?.trim() ||
      parsed.data.serviceOrDesignInterest?.trim() ||
      (matchedProject
        ? `3D Printing on ${matchedProject.surfaceName}`
        : matchedDesign
          ? `3D Wall Printing — ${matchedDesign.title}`
          : "General 3D Wall Printing Enquiry");

    const nowIso = new Date().toISOString();
    const readiness = getEnvironmentReadiness();

    // 6. Email notification gate (disabled until admin@atelierwallstory.com is created & verified)
    const emailVerifiedFlag =
      process.env.ENQUIRY_EMAIL_VERIFIED === "true" &&
      readiness.emailConfigured;
    const emailSent = false;

    const timestampSuffix = String(Date.now()).slice(-5);
    const referenceCode = `AWS-${new Date().getFullYear()}-${timestampSuffix}`;

    const enquiryRecord: StoredEnquiryRecord = {
      id: `enq-${Date.now()}`,
      referenceCode,
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      interestType: matchedProject
        ? "custom_project"
        : matchedDesign
          ? "design"
          : parsed.data.serviceInterest
            ? "service"
            : "general",
      serviceInterest: resolvedServiceInterest,
      serviceOrDesignInterest: resolvedServiceInterest,
      selectedDesignId: matchedDesign?.id || null,
      selectedDesignSlug:
        matchedDesign?.slug || parsed.data.selectedDesignSlug || null,
      selectedDesignTitle: matchedDesign?.title || null,
      selectedProjectId: matchedProject?.id || null,
      selectedProjectSlug:
        matchedProject?.slug || parsed.data.selectedProjectSlug || null,
      selectedProjectTitle: matchedProject?.title || null,
      selectedDesignReference:
        parsed.data.selectedDesignReference ||
        matchedDesign?.title ||
        matchedProject?.title ||
        null,
      resolvedCategoryCode: matchedDesign?.categoryCode || null,
      resolvedSurfaceName: matchedProject?.surfaceName || null,
      message: parsed.data.message,
      consentGiven: Boolean(parsed.data.consentGiven),
      status: "New",
      adminNotes: [],
      sourcePage: parsed.data.sourcePage || "/contact",
      emailSent,
      emailNotificationSent: emailSent,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const { record: savedRecord, deduplicated } =
      await saveEnquiryRecord(enquiryRecord);

    const databaseStatus = readiness.mongodbConfigured
      ? "mongodb_persisted"
      : "local_collection_persisted";

    return NextResponse.json({
      ok: true,
      persistedToDatabase: true,
      deduplicated,
      referenceCode: savedRecord.referenceCode,
      databaseStatus,
      emailSent,
      emailNotificationSent: emailSent,
      emailConfigurationStatus: emailVerifiedFlag
        ? "ready"
        : "gated_awaiting_verified_mailbox",
      message:
        "Thank you. Your enquiry has been received by our Mumbai studio team in Oshiwara, Andheri West. We will get in touch with you shortly.",
      enquirySummary: savedRecord,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to process your enquiry right now. Please try again.",
      },
      { status: 400 }
    );
  }
}
