import { z } from "zod";
import { requireAdminRequest } from "@/lib/admin-auth";
import { buildEnquiryFilter, deleteEnquiryRecord, LEAD_STATUSES, queryEnquiries, updateEnquiryRecord, type StoredEnquiryRecord } from "@/lib/enquiries-store";
import { getDb } from "@/lib/mongodb";
import { PRIVATE_HEADERS, privateJson, readJsonBody, RequestError, requestErrorResponse } from "@/lib/request-security";
import { sendEnquiryNotification } from "@/lib/enquiry-email";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function queryFromUrl(url: URL) {
  return { page: Number(url.searchParams.get("page")) || 1, limit: Number(url.searchParams.get("limit")) || 25, search: url.searchParams.get("search") || "", status: url.searchParams.get("status") || "All", sourcePage: url.searchParams.get("source") || undefined, overdue: url.searchParams.get("overdue") === "true" };
}
export function csvCell(value: unknown) {
  let text = String(value ?? "").replace(/\u0000/g, "");
  if (/^[\s\u0000-\u001f]*[=+@\-]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
export async function GET(request: Request) {
  const auth = await requireAdminRequest(request);
  if (!auth.ok) return auth.response;
  try {
    const url = new URL(request.url);
    const query = queryFromUrl(url);
    if (url.searchParams.get("format") === "csv") {
      const records = await (await getDb()).collection<StoredEnquiryRecord>("enquiries").find(buildEnquiryFilter(query), { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(10000).toArray();
      const rows = [["Reference", "Name", "Email", "Phone", "Message", "Interest", "Source", "Status", "Owner", "Follow-up", "Submitted"]];
      for (const record of records) rows.push([record.referenceCode, record.fullName, record.email, record.phone, record.message, record.serviceOrDesignInterest, record.sourcePage, record.status, record.assignedOwner || "", record.followUpAt || "", record.createdAt]);
      return new Response("\uFEFF" + rows.map(row => row.map(csvCell).join(",")).join("\r\n"), { headers: { ...PRIVATE_HEADERS, "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="atelier-enquiries.csv"' } });
    }
    return privateJson({ ok: true, ...(await queryEnquiries(query)) });
  } catch (error) { return requestErrorResponse(error, "Unable to load enquiries. Please try again."); }
}
const updateSchema = z.object({ id: z.string().trim().min(1).max(100), status: z.enum(LEAD_STATUSES).optional(), note: z.string().trim().min(1).max(3000).optional(), assignedOwner: z.string().trim().max(120).nullable().optional(), followUpAt: z.string().datetime({ offset: true }).nullable().optional(), retryEmail: z.boolean().optional() }).strict();
export async function PATCH(request: Request) {
  const auth = await requireAdminRequest(request);
  if (!auth.ok) return auth.response;
  try {
    const parsed = updateSchema.safeParse(await readJsonBody(request, 8192));
    if (!parsed.success) throw new RequestError("Invalid enquiry update. Check the status, note, owner, and follow-up date.");
    const { id, retryEmail, ...patch } = parsed.data;
    if (retryEmail) await sendEnquiryNotification(id);
    const enquiry = await updateEnquiryRecord(id, { ...patch, authorName: auth.session.email });
    if (!enquiry) return privateJson({ ok: false, error: "Enquiry not found." }, 404);
    return privateJson({ ok: true, enquiry });
  } catch (error) { return requestErrorResponse(error); }
}
export async function DELETE(request: Request) {
  const auth = await requireAdminRequest(request);
  if (!auth.ok) return auth.response;
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id || id.length > 100) throw new RequestError("A valid enquiry identifier is required.");
    const deleted = await deleteEnquiryRecord(id, auth.session.email);
    return privateJson({ ok: deleted, ...(deleted ? {} : { error: "Enquiry not found." }) }, deleted ? 200 : 404);
  } catch (error) { return requestErrorResponse(error); }
}
