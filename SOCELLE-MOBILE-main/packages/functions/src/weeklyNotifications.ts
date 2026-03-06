/**
 * Weekly Monday morning push — timezone-correct delivery.
 *
 * Target: 7:45–8:15 AM local time for each user on Monday mornings.
 * Strategy: Run every 30 minutes Monday 07:30–08:30 UTC, query users
 * whose UTC offset maps to 07:45–08:15 local time in that 30-min bucket.
 *
 * 3 copy variants:
 *   A — user has open gaps this week (shows leakage estimate)
 *   B — no leakage detected last week (positive re-engagement)
 *   C — no sync data yet (prompt to sync)
 *
 * Idempotency key: ${userId}_weekly_push_${isoWeekString}
 * Suppressed if: inactivityTier >= 3, daysUntilRenewal <= 2
 */

import { FieldValue } from "firebase-admin/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";
import { sendPushNotification } from "./notifications/fcm_sender.js";
import { checkNotificationEligibility } from "./notificationEligibility.js";
import { writeEvent } from "./events.js";
import { getDb } from "./lib/firebase.js";

// ─────────────────────────────────────────────────────────────
// ISO week string helpers
// ─────────────────────────────────────────────────────────────

function getIsoWeekString(date: Date): string {
  // Returns "YYYY-Www" e.g. "2025-W03"
  const d = new Date(date.getTime());
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const year = d.getUTCFullYear();
  const week = Math.ceil(
    ((d.getTime() - Date.UTC(year, 0, 1)) / 86400000 + 1) / 7
  );
  return `${year}-W${String(week).padStart(2, "0")}`;
}

// ─────────────────────────────────────────────────────────────
// Copy variants
// ─────────────────────────────────────────────────────────────

interface WeeklyCopy {
  title: string;
  body: string;
  variant: "A" | "B" | "C";
}

function buildWeeklyCopy(
  openGapCount: number,
  leakageUsd: number,
  hasSyncData: boolean
): WeeklyCopy {
  if (!hasSyncData) {
    return {
      title: "New week, new revenue",
      body: "Connect your calendar to see this week's open slots.",
      variant: "C",
    };
  }

  if (openGapCount > 0) {
    const fmt = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
    return {
      title: `${openGapCount} open ${openGapCount === 1 ? "slot" : "slots"} this week`,
      body: `That's ${fmt.format(leakageUsd)} in potential revenue. Start the week strong.`,
      variant: "A",
    };
  }

  return {
    title: "Clean slate this week",
    body: "No detected gaps — keep your momentum going.",
    variant: "B",
  };
}

// ─────────────────────────────────────────────────────────────
// UTC offset buckets → local hour range check
// ─────────────────────────────────────────────────────────────

/**
 * Given UTC offset in minutes (e.g. -300 for EST, 330 for IST),
 * returns the local hour for a given UTC time.
 */
function localHour(utcDate: Date, utcOffsetMinutes: number): number {
  const localMs = utcDate.getTime() + utcOffsetMinutes * 60 * 1000;
  return new Date(localMs).getUTCHours();
}

/**
 * Returns the UTC offset range (in minutes) for users whose local time
 * is between 07:45 and 08:15 at the current UTC time.
 *
 * Local time = UTC + offset.
 * For local time to be 07:45–08:15:
 *   offset = 07:45 - UTC_time  to  08:15 - UTC_time
 */
function getTargetOffsetRange(
  utcNow: Date
): { minOffsetMinutes: number; maxOffsetMinutes: number } {
  const utcTotalMinutes = utcNow.getUTCHours() * 60 + utcNow.getUTCMinutes();
  const targetStartMinutes = 7 * 60 + 45; // 07:45 local
  const targetEndMinutes = 8 * 60 + 15;   // 08:15 local

  // offset = targetLocal - utcNow (in minutes)
  let minOffset = targetStartMinutes - utcTotalMinutes;
  let maxOffset = targetEndMinutes - utcTotalMinutes;

  // Normalise to [-720, 840] range
  if (minOffset < -720) minOffset += 1440;
  if (maxOffset > 840) maxOffset -= 1440;

  return { minOffsetMinutes: minOffset, maxOffsetMinutes: maxOffset };
}

// ─────────────────────────────────────────────────────────────
// Open gap count helper
// ─────────────────────────────────────────────────────────────

async function getWeeklyGapSummary(
  userId: string
): Promise<{ openGapCount: number; leakageUsd: number }> {
  const db = getDb();
  try {
    const now = new Date();
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const snap = await db
      .collection("gaps")
      .where("user_id", "==", userId)
      .where("status", "==", "open")
      .where("start_time", ">=", now.toISOString())
      .where("start_time", "<", weekEnd.toISOString())
      .get();

    let leakageUsd = 0;
    snap.docs.forEach((doc) => {
      leakageUsd += (doc.data().leakage_value as number) ?? 0;
    });

    return { openGapCount: snap.size, leakageUsd };
  } catch {
    return { openGapCount: 0, leakageUsd: 0 };
  }
}

// ─────────────────────────────────────────────────────────────
// Per-user send logic
// ─────────────────────────────────────────────────────────────

async function sendWeeklyPush(
  userId: string,
  user: FirebaseFirestore.DocumentData,
  isoWeek: string
): Promise<boolean> {
  const db = getDb();
  // Idempotency: one push per user per ISO week
  const idempotencyKey = `${userId}_weekly_push_${isoWeek}`;
  const stateDoc = await db.collection("notification_state").doc(userId).get();
  const state = stateDoc.data() ?? {};

  if (state.last_weekly_push_week === isoWeek) {
    return false; // already sent this week
  }

  // Suppression: inactivity tier >= 3
  const inactivityTier = user.inactivity_tier as number ?? 0;
  if (inactivityTier >= 3) return false;

  // Suppression: renewal within 2 days (avoid noise before charge)
  const renewalDate = user.subscription_renewal_date as string | null;
  if (renewalDate) {
    const daysUntilRenewal =
      (new Date(renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysUntilRenewal <= 2) return false;
  }

  // Generic eligibility check
  const eligibility = await checkNotificationEligibility({
    userId,
    channel: "push",
  });
  if (!eligibility.eligible) return false;

  // Build copy
  const hasSyncData =
    !!(user.stats?.last_sync_at) || !!(user.stats?.current_week_leakage);
  const { openGapCount, leakageUsd } = await getWeeklyGapSummary(userId);
  const copy = buildWeeklyCopy(openGapCount, leakageUsd, hasSyncData);

  // Send
  const sent = await sendPushNotification(userId, {
    title: copy.title,
    body: copy.body,
    data: {
      type: "weekly_summary",
      variant: copy.variant,
      isoWeek,
    },
  });

  if (sent) {
    // Mark sent for idempotency
    await db
      .collection("notification_state")
      .doc(userId)
      .set({ last_weekly_push_week: isoWeek }, { merge: true });

    await writeEvent(userId, "notification_sent", {
      channel: "push",
      type: "weekly_push",
      variant: copy.variant,
      isoWeek,
    });
  }

  return sent;
}

// ─────────────────────────────────────────────────────────────
// Scheduled job — runs every 30 minutes Mon 07:30–08:30 UTC
// ─────────────────────────────────────────────────────────────

export const weeklyMondayPush = onSchedule(
  {
    // Mon 07:30, 08:00, 08:30 UTC — covers 07:45–08:15 local for any offset
    schedule: "30 7,8 * * 1",
    timeZone: "UTC",
    region: "us-central1",
  },
  async () => {
    const db = getDb();
    const now = new Date();
    const isoWeek = getIsoWeekString(now);

    // Calculate which UTC offset range corresponds to 07:45–08:15 local
    const { minOffsetMinutes, maxOffsetMinutes } = getTargetOffsetRange(now);

    logger.info("weeklyMondayPush: starting", {
      utcNow: now.toISOString(),
      isoWeek,
      targetOffsetRange: `[${minOffsetMinutes}, ${maxOffsetMinutes}]`,
    });

    // Query active subscribers
    const usersSnap = await db
      .collection("users")
      .where("subscription_status", "in", ["active", "trial"])
      .get();

    let sent = 0;
    let skipped = 0;

    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id;
      const user = userDoc.data();

      // Check if user's timezone offset falls in our target window
      const userTimezone = user.timezone as string | undefined;
      if (!userTimezone) { skipped++; continue; }

      try {
        // Compute UTC offset for user's timezone
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: userTimezone,
          timeZoneName: "shortOffset",
        });
        const parts = formatter.formatToParts(now);
        const offsetPart = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
        // Parse "GMT+5:30" or "GMT-8" style strings
        const offsetMatch = offsetPart.match(/GMT([+-])(\d+)(?::(\d+))?/);
        if (!offsetMatch) { skipped++; continue; }

        const sign = offsetMatch[1] === "+" ? 1 : -1;
        const hours = parseInt(offsetMatch[2], 10);
        const minutes = parseInt(offsetMatch[3] ?? "0", 10);
        const userOffsetMinutes = sign * (hours * 60 + minutes);

        if (
          userOffsetMinutes < minOffsetMinutes ||
          userOffsetMinutes > maxOffsetMinutes
        ) {
          skipped++;
          continue;
        }

        const wasSent = await sendWeeklyPush(userId, user, isoWeek);
        if (wasSent) sent++; else skipped++;
      } catch (err) {
        logger.error("weeklyMondayPush: error for user", { userId, err });
        skipped++;
      }
    }

    logger.info("weeklyMondayPush: done", { sent, skipped, isoWeek });
  }
);
