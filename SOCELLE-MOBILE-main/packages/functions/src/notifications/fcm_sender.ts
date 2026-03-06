import { getDb } from "../lib/firebase.js";
import { getApp } from "firebase-admin/app";
import { logger } from "firebase-functions";
import { FieldValue } from "firebase-admin/firestore";
import type { NotificationFrame } from "./framing.js";
import { createNotificationDispatcher } from "@debvai/platform-notifications-ts";

export interface PushPayload {
  title: string;
  body: string;
  tier?: string;
  frame?: NotificationFrame;
  data?: Record<string, string>;
}

/**
 * Send an FCM push notification to a user.
 * Loads the token from `fcm_tokens/{userId}` and sends via platform dispatcher.
 * Updates `notification_state/{userId}` after a successful send.
 */
export async function sendPushNotification(
  userId: string,
  payload: PushPayload
): Promise<boolean> {
  const db = getDb();

  // Load FCM token — product-specific Firestore storage
  const tokenDoc = await db.collection("fcm_tokens").doc(userId).get();
  if (!tokenDoc.exists) {
    logger.info("sendPushNotification: no FCM token for user", { userId });
    return false;
  }

  const token = tokenDoc.data()?.token as string | undefined;
  if (!token) {
    logger.warn("sendPushNotification: FCM token empty for user", { userId });
    return false;
  }

  try {
    // Delegate dispatch to platform notification dispatcher.
    const dispatcher = createNotificationDispatcher(getApp());
    const result = await dispatcher.dispatch(
      [token],
      {
        title: payload.title,
        body: payload.body,
        data: {
          tier: payload.tier ?? "unknown",
          frame: payload.frame ?? "dollar",
          ...(payload.data ?? {}),
        },
      },
    );

    // Handle stale tokens identified by platform dispatcher.
    if (result.staleTokens.length > 0) {
      await db.collection("fcm_tokens").doc(userId).delete();
      logger.info("sendPushNotification: cleaned up invalid token", {
        userId,
      });
      return false;
    }

    // Check if dispatch failed (non-stale failure)
    if (result.successCount === 0) {
      logger.error("sendPushNotification: send failed", {
        userId,
        failureCount: result.failureCount,
      });
      return false;
    }

    // Product-specific post-send side effect: update notification_state
    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

    await db
      .collection("notification_state")
      .doc(userId)
      .set(
        {
          last_sent_at: new Date().toISOString(),
          consecutive_dismissed: 0, // reset on successful send
          daily_count_date: today,
          daily_count: FieldValue.increment(1),
          framing_rotation_index: nextFramingIndex(
            tokenDoc.data()?.framing_rotation_index ?? 0
          ),
        },
        { merge: true }
      );

    logger.info("sendPushNotification: sent", {
      userId,
      tier: payload.tier,
      frame: payload.frame,
    });

    return true;
  } catch (error: unknown) {
    logger.error("sendPushNotification: send failed", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

function nextFramingIndex(current: number): number {
  return (current + 1) % 4;
}

/**
 * Record that a notification was dismissed (called via a callable function).
 * Increments consecutive_dismissed; enters reduced-frequency mode at 3.
 */
export async function recordNotificationDismissed(userId: string): Promise<void> {
  const db = getDb();
  const stateRef = db.collection("notification_state").doc(userId);
  const snap = await stateRef.get();
  const consecutive = ((snap.data()?.consecutive_dismissed as number) ?? 0) + 1;

  const update: Record<string, unknown> = {
    consecutive_dismissed: consecutive,
    last_dismiss_at: new Date().toISOString(),
  };

  // At 3 consecutive dismissals → enter reduced-frequency mode for 5 days
  if (consecutive >= 3 && !snap.data()?.reduced_frequency_until) {
    const until = new Date();
    until.setDate(until.getDate() + 5);
    update.reduced_frequency_until = until.toISOString();
    logger.info("recordNotificationDismissed: entering reduced mode", {
      userId,
      consecutive,
    });
  }

  await stateRef.set(update, { merge: true });
}
