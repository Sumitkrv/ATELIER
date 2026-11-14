import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { getDb } from "@/lib/mongodb";
import { privateJson, RequestError, requestErrorResponse } from "@/lib/request-security";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    const secret = process.env.RESEND_WEBHOOK_SECRET;
    if (!secret?.startsWith("whsec_")) return privateJson({ ok: false, error: "Webhook verification is not configured." }, 503);
    const id = request.headers.get("svix-id");
    const timestamp = request.headers.get("svix-timestamp");
    const signatures = request.headers.get("svix-signature");
    if (!id || !timestamp || !signatures || !/^\d+$/.test(timestamp) || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) throw new RequestError("Invalid webhook signature.", 401);
    const reader = request.body?.getReader();
    if (!reader) throw new RequestError("Missing webhook body.");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 32768) { await reader.cancel(); throw new RequestError("Webhook is too large.", 413); }
      chunks.push(value);
    }
    const raw = Buffer.concat(chunks).toString("utf8");
    const expected = createHmac("sha256", Buffer.from(secret.slice(6), "base64")).update(`${id}.${timestamp}.${raw}`).digest();
    const valid = signatures.split(" ").some(entry => {
      const [version, signature] = entry.split(",");
      if (version !== "v1" || !signature) return false;
      const actual = Buffer.from(signature, "base64");
      return actual.length === expected.length && timingSafeEqual(expected, actual);
    });
    if (!valid) throw new RequestError("Invalid webhook signature.", 401);
    const parsed = z.object({ type: z.string(), created_at: z.string().datetime({ offset: true }), data: z.object({ email_id: z.string().min(1).max(100) }) }).safeParse(JSON.parse(raw));
    if (!parsed.success) throw new RequestError("Invalid webhook event.");
    const { type, created_at, data } = parsed.data;
    const state = type === "email.delivered" ? "delivered" : ["email.failed", "email.bounced", "email.complained"].includes(type) ? "failed" : null;
    if (!state) return privateJson({ ok: true });
    const db = await getDb();
    const events = db.collection("email_events");
    await events.createIndex({ providerEventId: 1 }, { unique: true });
    if (await events.findOne({ providerEventId: id })) return privateJson({ ok: true });
    const update = await db.collection("enquiries").updateOne({ emailProviderId: data.email_id, $or: [{ emailEventAt: { $exists: false } }, { emailEventAt: { $lte: created_at } }] }, { $set: { emailStatus: state, emailEventAt: created_at, emailLastError: state === "failed" ? "The email provider reported a delivery failure." : null } });
    // A webhook can race the send response; let the provider retry after the provider ID is committed.
    if (!update.matchedCount && !await db.collection("enquiries").findOne({ emailProviderId: data.email_id })) return privateJson({ ok: false, error: "Notification record is not ready." }, 503);
    try { await events.insertOne({ providerEventId: id, type, providerEmailId: data.email_id, createdAt: created_at }); }
    catch (error) { if (!(typeof error === "object" && error && "code" in error && error.code === 11000)) throw error; }
    return privateJson({ ok: true });
  } catch (error) { return requestErrorResponse(error); }
}
