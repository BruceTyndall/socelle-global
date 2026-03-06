import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";
import { getDb } from "../lib/firebase.js";
import { shouldSendNotification } from "./decision_engine.js";
import { sendPushNotification } from "./fcm_sender.js";

/**
 * Hourly scheduler that evaluates open gaps for all active users
 * and sends at most 1 push notification per user per run.
 *
 * Schedule: every hour
 */
export const scheduledGapNotificationChecker = onSchedule(
  {
    schedule: "every 1 hours",
    timeZone: "UTC",
    region: "us-central1",
    secrets: [
      "GOOGLE_TOKEN_ENCRYPTION_KEY_B64",
      "GOOGLE_OAUTH_CLIENT_ID",
      "GOOGLE_OAUTH_CLIENT_SECRET",
    ],
  },
  async () => {
    const db = getDb();
    const now = new Date();
    const windowEnd = new Date(now.getTime() + 72 * 60 * 60 * 1000); // +72h

    // Only evaluate users who have synced in the last 30 days and have FCM tokens
    const activeThreshold = new Date(
      now.getTime() - 30 * 24 * 60 * 60 * 1000
    );

    // Get all users with FCM tokens (they're set up for notifications)
    const fcmTokensSnap = await db.collection("fcm_tokens").get();
    const userIds = fcmTokensSnap.docs.map((d) => d.id);

    logger.info("scheduledGapNotificationChecker: evaluating users", {
      count: userIds.length,
    });

    let sentCount = 0;
    let suppressedCount = 0;

    for (const userId of userIds) {
      try {
        // Check if user has been active (last sync within 30 days)
        const userDoc = await db.collection("users").doc(userId).get();
        const lastSyncAt = userDoc.data()?.stats?.last_sync_at;
        if (!lastSyncAt) continue;

        const lastSync = new Date(
          lastSyncAt?.toDate ? lastSyncAt.toDate() : lastSyncAt
        );
        if (lastSync < activeThreshold) continue;

        // Load open gaps within 72h window
        const gaps = await db
          .collection("gaps")
          .where("user_id", "==", userId)
          .where("status", "==", "open")
          .where("start_time", ">=", now)
          .where("start_time", "<=", windowEnd)
          .orderBy("start_time", "asc")
          .get();

        if (gaps.empty) continue;

        const avgBookingValue =
          (userDoc.data()?.settings?.avgBookingValue as number) ?? 85;

        // Evaluate each gap; send for the first one that passes
        let sent = false;
        for (const gapDoc of gaps.docs) {
          if (sent) break;
          const data = gapDoc.data();

          const startIso = (
            data.start_time?.toDate
              ? data.start_time.toDate()
              : new Date(data.start_time as string)
          ).toISOString();

          const endIso = (
            data.end_time?.toDate
              ? data.end_time.toDate()
              : new Date(data.end_time as string)
          ).toISOString();

          const result = await shouldSendNotification(userId, {
            gapId: gapDoc.id,
            startIso,
            endIso,
            dayOfWeek: data.day_of_week as string,
            leakageValue: data.leakage_value as number,
            avgBookingValue,
          });

          if (result.shouldSend && result.copy) {
            const ok = await sendPushNotification(userId, {
              title: result.copy.title,
              body: result.copy.body,
              tier: String(result.tier),
              frame: result.copy.frame,
              data: { gapId: gapDoc.id },
            });

            if (ok) {
              sent = true;
              sentCount++;
              logger.info(
                "scheduledGapNotificationChecker: notification sent",
                { userId, tier: result.tier, gapId: gapDoc.id }
              );
            }
          } else {
            suppressedCount++;
            logger.debug(
              "scheduledGapNotificationChecker: suppressed",
              {
                userId,
                reason: result.suppressReason,
                gapId: gapDoc.id,
              }
            );
          }
        }
      } catch (error) {
        logger.error(
          "scheduledGapNotificationChecker: error processing user",
          {
            userId,
            error: error instanceof Error ? error.message : String(error),
          }
        );
      }
    }

    logger.info("scheduledGapNotificationChecker: complete", {
      sent: sentCount,
      suppressed: suppressedCount,
      total: userIds.length,
    });
  }
);
