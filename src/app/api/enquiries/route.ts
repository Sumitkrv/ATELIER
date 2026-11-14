import { randomUUID } from "node:crypto";
import { enquirySubmissionSchema } from "@/types/models";
import { saveEnquiryRecord, type StoredEnquiryRecord } from "@/lib/enquiries-store";
import { checkSameOrigin, enforceRateLimit, privateJson, readJsonBody, RequestError, requestErrorResponse } from "@/lib/request-security";
import { sendEnquiryNotification } from "@/lib/enquiry-email";
// Compatibility for existing authenticated clients; private management lives in its own handler.
export { GET, PATCH, DELETE } from "@/app/api/admin/enquiries/route";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const clean = (value: string) => value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
export async function POST(request: Request) {
  try {
    checkSameOrigin(request);
    const body = await readJsonBody(request, 16 * 1024);
    if (body && typeof body === "object" && "honeypot" in body && body.honeypot) throw new RequestError("Submission rejected by spam protection.");
    const parsed = enquirySubmissionSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0] || "form")] ||= issue.message;
      return privateJson({ ok: false, error: "Please check the highlighted fields.", fieldErrors }, 400);
    }
    await enforceRateLimit(request, "public-enquiry", 8, 60000);
    const data = parsed.data;
    const interest = clean(data.serviceInterest || data.serviceOrDesignInterest || "General 3D Wall Printing Enquiry");
    const now = new Date().toISOString();
    const id = randomUUID();
    const record: StoredEnquiryRecord = {
      id: `enq-${id}`, referenceCode: `AWS-${new Date().getFullYear()}-${id.slice(0, 8).toUpperCase()}`,
      fullName: clean(data.fullName), email: clean(data.email).toLowerCase(), phone: clean(data.phone || ""),
      interestType: data.selectedProjectSlug ? "custom_project" : data.selectedDesignSlug ? "design" : data.serviceInterest ? "service" : "general",
      serviceInterest: interest, serviceOrDesignInterest: interest,
      selectedDesignSlug: data.selectedDesignSlug ? clean(data.selectedDesignSlug) : null,
      selectedProjectSlug: data.selectedProjectSlug ? clean(data.selectedProjectSlug) : null,
      selectedDesignReference: data.selectedDesignReference ? clean(data.selectedDesignReference) : null,
      message: clean(data.message), consentGiven: data.consentGiven === true,
      sourcePage: data.sourcePage?.startsWith("/") && !data.sourcePage.startsWith("//") ? clean(data.sourcePage) : "/contact",
      status: "New", adminNotes: [], assignedOwner: null, followUpAt: null,
      emailStatus: "pending", emailAttempts: 0, emailSent: false, emailNotificationSent: false,
      createdAt: now, updatedAt: now,
    };
    const { record: saved, deduplicated } = await saveEnquiryRecord(record);
    // Persistence has succeeded. Delivery failure must never turn a saved enquiry into an error.
    if (!deduplicated) await sendEnquiryNotification(saved.id).catch(() => undefined);
    return privateJson({ ok: true, referenceCode: saved.referenceCode, deduplicated, message: "Thank you. Our studio has received your enquiry and will get in touch shortly." }, 201);
  } catch (error) { return requestErrorResponse(error, "Unable to submit your enquiry right now. Please try again."); }
}
