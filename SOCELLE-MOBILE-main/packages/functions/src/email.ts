/**
 * Canonical email module — Postmark provider.
 *
 * This is the single email gateway for all SLOTFORCE Cloud Functions.
 * All callers (scheduledEmails.ts, reengagementEmails.ts, etc.) use this module.
 *
 * - Transactional emails: bypass emailOptOut (renewal notices, billing, auth)
 * - Marketing emails: respect emailOptOut
 * - All sends write email_sent/email_failed events to Firestore
 * - Never throws — always catches and logs on failure
 */

import { FieldValue } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { isEmailEligible } from "./notificationEligibility.js";
import { getDb } from "./lib/firebase.js";

const POSTMARK_API_URL = "https://api.postmarkapp.com/email";
const FROM_EMAIL = "noreply@slotforce.app";
const FROM_NAME = "SLOTFORCE";

/** Template IDs — map to Postmark template aliases */
export const TEMPLATE_IDS = {
  // Retention
  tier2ValueMemory: "tier2-value-memory",
  tier3AccountSummary: "tier3-account-summary",
  tier4RenewalAwareness: "tier4-renewal-awareness",
  tier4AccountHealth: "tier4-account-health",
  // Resurrection
  day30Resurrection: "day30-resurrection",
  seasonalReEntry: "seasonal-reentry",
  productUpdateReEntry: "product-update-reentry",
  // Re-engagement
  reengagementVariantA: "reengagement-prior-recovery",
  reengagementVariantB: "reengagement-leakage",
  reengagementVariantC: "reengagement-stale-sync",
  // Cancellation
  cancellationConfirmation: "cancellation-confirmation",
} as const;

export type TemplateId = typeof TEMPLATE_IDS[keyof typeof TEMPLATE_IDS];

interface SendEmailParams {
  userId: string;
  to: string;
  templateId: TemplateId | string;
  subject: string;
  html: string;
  text: string;
  emailType: "transactional" | "marketing";
  /** Optional: meta to log on the event record */
  meta?: Record<string, string | number | boolean>;
}

/**
 * Send an email via Postmark.
 * Checks eligibility before sending. Writes Firestore event on success/failure.
 * Never throws.
 */
export async function sendEmail(params: SendEmailParams): Promise<void> {
  const db = getDb();
  const { userId, to, templateId, subject, html, text, emailType, meta = {} } = params;

  // ── Eligibility check ──────────────────────────────────────────────────────
  const eligible = await isEmailEligible(userId, emailType);
  if (!eligible) {
    logger.info("sendEmail: suppressed by eligibility check", {
      userId,
      templateId,
      emailType,
    });
    return;
  }

  // ── Idempotency guard — check for duplicate in-flight sends ────────────────
  // (callers are responsible for idempotency keys; this is a belt-and-suspenders check)
  if (meta.idempotencyKey) {
    try {
      const sentRef = db.collection(`users/${userId}/email_idempotency`).doc(
        String(meta.idempotencyKey)
      );
      const sentSnap = await sentRef.get();
      if (sentSnap.exists) {
        logger.info("sendEmail: idempotency key already sent — skipping", {
          userId,
          key: meta.idempotencyKey,
        });
        return;
      }
      // Mark before sending (optimistic — prevents duplicates on retry)
      await sentRef.set({ sentAt: FieldValue.serverTimestamp(), templateId });
    } catch {
      // Non-fatal — log and proceed
      logger.warn("sendEmail: idempotency check failed, proceeding", { userId });
    }
  }

  // ── Postmark API send ──────────────────────────────────────────────────────
  const apiKey = process.env.POSTMARK_API_KEY;
  if (!apiKey) {
    logger.warn("sendEmail: POSTMARK_API_KEY not set — skipping send in development", {
      userId,
      templateId,
    });
    // Still write a mock event so development flows can be traced
    await writeEmailEvent(userId, "email_skipped_no_api_key", {
      templateId,
      emailType,
    });
    return;
  }

  const payload = {
    From: `${FROM_NAME} <${FROM_EMAIL}>`,
    To: to,
    Subject: subject,
    HtmlBody: html,
    TextBody: text,
    ReplyTo: "support@slotforce.app",
    MessageStream: emailType === "transactional" ? "outbound" : "broadcast",
    Tag: templateId,
    TrackOpens: true,
    TrackLinks: "None" as const,
  };

  try {
    const response = await fetch(POSTMARK_API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Postmark API ${response.status}: ${errorBody}`);
    }

    const result = (await response.json()) as { MessageID?: string };
    logger.info("sendEmail: sent successfully", {
      userId,
      templateId,
      messageId: result.MessageID,
    });

    await writeEmailEvent(userId, "email_sent", {
      templateId,
      emailType,
      messageId: result.MessageID ?? "",
      ...meta,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error("sendEmail: send failed", { userId, templateId, error: errorMsg });

    await writeEmailEvent(userId, "email_failed", {
      templateId,
      emailType,
      error: errorMsg,
      ...meta,
    });
    // Do not throw — callers should not crash on email failure
  }
}

/** Write email event to Firestore. Internal use only. */
async function writeEmailEvent(
  userId: string,
  eventName: string,
  meta: Record<string, string | number | boolean>
): Promise<void> {
  const db = getDb();
  try {
    await db.collection(`users/${userId}/events`).add({
      event: eventName,
      ...meta,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    logger.error("sendEmail: failed to write event", { userId, eventName, err });
  }
}

// ─────────────────────────────────────────────────────────────
// Convenience wrappers for each template type
// Used by scheduledEmails.ts, reengagementEmails.ts, etc.
// Templates are imported from email/templates.ts which returns { subject, html, text }
// ─────────────────────────────────────────────────────────────

export type EmailTemplate = { subject: string; html: string; text: string };

/**
 * Send a rendered template. Template is built by caller from templates.ts.
 * This is the primary helper used by scheduledEmails.ts and friends.
 */
export async function sendRenderedEmail(params: {
  userId: string;
  to: string;
  templateId: TemplateId | string;
  template: EmailTemplate;
  emailType: "transactional" | "marketing";
  idempotencyKey?: string;
  meta?: Record<string, string | number | boolean>;
}): Promise<void> {
  await sendEmail({
    userId: params.userId,
    to: params.to,
    templateId: params.templateId,
    subject: params.template.subject,
    html: params.template.html,
    text: params.template.text,
    emailType: params.emailType,
    meta: {
      ...(params.meta ?? {}),
      ...(params.idempotencyKey ? { idempotencyKey: params.idempotencyKey } : {}),
    },
  });
}
