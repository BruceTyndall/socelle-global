/**
 * Server-side event writer.
 *
 * All Cloud Functions call writeEvent() to log analytics events.
 * Events are written to users/{userId}/events/{eventId}.
 *
 * Rules:
 * - No PII in meta (no emails, names, phone numbers, addresses)
 * - sessionId UUID lives in memory only — never persisted server-side
 * - All timestamps via FieldValue.serverTimestamp()
 */

import { FieldValue } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { getDb } from "./lib/firebase.js";

export type EventMeta = Record<string, string | number | boolean | null>;

/**
 * Write an analytics event for a user.
 *
 * @param userId  Firestore user document ID
 * @param eventName  Snake-case event name (e.g. "notification_sent")
 * @param meta  Non-PII metadata to attach to the event
 */
export async function writeEvent(
  userId: string,
  eventName: string,
  meta: EventMeta = {}
): Promise<void> {
  const db = getDb();
  try {
    await db.collection(`users/${userId}/events`).add({
      event: eventName,
      ...meta,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    // Non-fatal — log and continue. Never throw from an event write.
    logger.error("writeEvent: failed", { userId, eventName, err });
  }
}

// ─────────────────────────────────────────────────────────────
// Typed event helpers
// Callers use these instead of raw writeEvent() for type safety.
// ─────────────────────────────────────────────────────────────

export function writeNotificationSentEvent(
  userId: string,
  meta: {
    channel: "push" | "email";
    templateId?: string;
    tier?: number;
    gapId?: string;
    suppressReason?: string;
  }
): Promise<void> {
  return writeEvent(userId, "notification_sent", meta as EventMeta);
}

export function writeEmailSentEvent(
  userId: string,
  meta: {
    templateId: string;
    emailType: "transactional" | "marketing";
    idempotencyKey?: string;
  }
): Promise<void> {
  return writeEvent(userId, "email_sent", meta as EventMeta);
}

export function writeEmailFailedEvent(
  userId: string,
  meta: {
    templateId: string;
    emailType: "transactional" | "marketing";
    error: string;
  }
): Promise<void> {
  return writeEvent(userId, "email_failed", meta as EventMeta);
}

export function writeCancelConfirmedEvent(
  userId: string,
  meta: {
    reason: string;
    routedTo: string;
  }
): Promise<void> {
  return writeEvent(userId, "cancel_confirmed", meta as EventMeta);
}

export function writeCalendarDataDeletedEvent(userId: string): Promise<void> {
  return writeEvent(userId, "calendar_data_deleted", {});
}

export function writeSubscriptionStateChangedEvent(
  userId: string,
  meta: {
    from: string;
    to: string;
    reason?: string;
  }
): Promise<void> {
  return writeEvent(userId, "subscription_state_changed", meta as EventMeta);
}
