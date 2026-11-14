import { getDb } from "@/lib/mongodb";
import type { StoredEnquiryRecord } from "@/lib/enquiries-store";

type EmailPayload = { from: string; to: string[]; reply_to: string; subject: string; text: string };
type NotificationRecord = StoredEnquiryRecord & { emailRequest?: EmailPayload; emailFirstAttemptAt?: string };

/** Resend acceptance is recorded as sent; only a verified delivery webhook can mark delivered. */
export async function sendEnquiryNotification(id: string): Promise<void> {
  const db = await getDb();
  const records = db.collection<NotificationRecord>("enquiries");
  const now = new Date();
  const record = await records.findOneAndUpdate({ id, emailStatus: { $in: ["pending", "failed"] }, emailProviderId: { $in: [null] }, $or: [{ emailLeaseUntil: { $exists: false } }, { emailLeaseUntil: null }, { emailLeaseUntil: { $lt: now.toISOString() } }], emailAttempts: { $lt: 5 } }, { $set: { emailLeaseUntil: new Date(now.getTime() + 60000).toISOString() } }, { returnDocument: "after" });
  if (!record) return;
  try {
    const settings = await db.collection("site_settings").findOne({ id: "site-settings-global" });
    const preferences = settings?.published?.enquiryNotifications;
    const to = preferences?.destinationEmail || process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ENQUIRY_NOTIFICATION_TO_EMAIL;
    const key = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    if (preferences?.enabled === false || !key || !from || !to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      await records.updateOne({ id }, { $set: { emailStatus: "failed", emailLastError: preferences?.enabled === false ? "Notifications are disabled in site settings." : "Email notification service is not configured.", emailLeaseUntil: null, emailRetryAt: new Date(now.getTime() + 60 * 60000).toISOString() } });
      return;
    }
    // Idempotency expires after 24h at the provider. Never retry an uncertain attempt beyond that window.
    if (record.emailFirstAttemptAt && now.getTime() - Date.parse(record.emailFirstAttemptAt) > 23 * 60 * 60000) {
      await records.updateOne({ id }, { $set: { emailStatus: "failed", emailAttempts: 5, emailLastError: "Automatic retry window expired. Check provider delivery before resending.", emailLeaseUntil: null, emailRetryAt: null } });
      return;
    }
    const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const adminUrl = new URL(`/admin/enquiries?enquiry=${encodeURIComponent(record.id)}`, baseUrl).toString();
    const payload: EmailPayload = record.emailRequest || {
      from, to: [to], reply_to: record.email,
      subject: `New ATELIER enquiry ${record.referenceCode}`,
      text: [`Name: ${record.fullName}`, `Email: ${record.email}`, `Phone: ${record.phone || "Not supplied"}`, `Interest: ${record.serviceOrDesignInterest}`, `Source: ${record.sourcePage}`, `Submitted: ${record.createdAt}`, "", record.message, "", `Manage enquiry: ${adminUrl}`].join("\n"),
    };
    const idempotencyKey = record.emailIdempotencyKey || `enquiry/${record.id}`;
    await records.updateOne({ id }, { $set: { emailRequest: payload, emailIdempotencyKey: idempotencyKey, emailFirstAttemptAt: record.emailFirstAttemptAt || now.toISOString(), emailAttemptedAt: now.toISOString() }, $inc: { emailAttempts: 1 } });
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey }, body: JSON.stringify(payload), signal: AbortSignal.timeout(15000) });
    const data = await response.json().catch(() => null) as { id?: string } | null;
    if (!response.ok || !data?.id) throw new Error(`Email provider returned HTTP ${response.status}.`);
    await records.updateOne({ id, emailStatus: { $ne: "delivered" } }, { $set: { emailStatus: "sent", emailProviderId: data.id, emailSent: true, emailNotificationSent: true, emailLastError: null, emailLeaseUntil: null, emailRetryAt: null } });
  } catch (error) {
    const attempts = (record.emailAttempts || 0) + 1;
    // Keep provider bodies, recipients, and credentials out of error logs and public responses.
    const message = error instanceof Error && /^Email provider returned HTTP \d+\.$/.test(error.message) ? error.message : "Notification could not be confirmed. A safe retry is queued.";
    await records.updateOne({ id, emailStatus: { $ne: "delivered" } }, { $set: { emailStatus: "failed", emailLastError: message, emailLeaseUntil: null, emailRetryAt: attempts < 5 ? new Date(Date.now() + Math.pow(4, attempts) * 60000).toISOString() : null } });
  }
}
export async function retryPendingEnquiryEmails(limit = 20) {
  const db = await getDb();
  const records = await db.collection<NotificationRecord>("enquiries").find({ emailStatus: { $in: ["pending", "failed"] }, emailAttempts: { $lt: 5 }, $or: [{ emailRetryAt: null }, { emailRetryAt: { $lte: new Date().toISOString() } }] }, { projection: { id: 1 } }).sort({ createdAt: 1 }).limit(Math.max(1, Math.min(limit, 100))).toArray();
  for (const record of records) await sendEnquiryNotification(record.id);
  return { processed: records.length };
}
