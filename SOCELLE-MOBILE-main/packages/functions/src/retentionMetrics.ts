/**
 * Derived Metrics Computation — runs every 6 hours.
 * Writes computed metrics to users/{userId}/metricsLatest.
 *
 * All 9 metrics must return null (not 0) when data is insufficient.
 */

import { Timestamp, FieldValue } from "firebase-admin/firestore";
import { getDb } from "./lib/firebase.js";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";

// db is intentionally NOT initialised at module level so that pure-function
// unit tests can import this file without Firebase Admin being configured.

export interface UserMetrics {
  daysSinceLastOpen: number;
  cumulativeDetectedLeakage: number;   // USD, all-time sum of leakage_value for all gaps
  cumulativeRecoveredUsd: number;      // USD, fill_source = slotforce action only
  lastRecoveryAmount: number | null;   // USD of most recent filled gap; null if never recovered
  weeklyRecoveryRate: number | null;   // filled/detected this week; null if < 3 gaps this week
  fillProbabilityScore: number | null; // 0.0–1.0; null if < 20 historical gaps
  daysUntilRenewal: number | null;     // null if no renewal date set
  syncStalenessDays: number;           // days since last_sync_at
  consecutiveDismissedNotifs: number;
  inactivityTier: 0 | 1 | 2 | 3 | 4 | 5;
  computedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────
// Metric formulas (exported for unit testing)
// ─────────────────────────────────────────────────────────────

/** Metric 1: Days since last app open */
export function computeDaysSinceLastOpen(lastOpenAt: string | null | undefined): number {
  if (!lastOpenAt) return 999; // never opened
  return (Date.now() - new Date(lastOpenAt).getTime()) / (1000 * 60 * 60 * 24);
}

/** Metric 2: Cumulative detected leakage (all-time sum of all gap leakage_value) */
export function computeCumulativeLeakage(gapLeakageValues: number[]): number {
  return gapLeakageValues.reduce((sum, v) => sum + (v ?? 0), 0);
}

/** Metric 3: Cumulative recovered USD (only from slotforce-action fills) */
export function computeCumulativeRecovered(
  recoveredRevenueSelfReported: number,
  recoveredRevenueVerified: number
): number {
  // Self-reported takes precedence; verified is a subset
  return Math.max(recoveredRevenueSelfReported, recoveredRevenueVerified);
}

/** Metric 4: Last recovery amount — null if user has never recovered */
export function computeLastRecoveryAmount(
  filledGaps: Array<{ leakage_value: number; filled_at?: string }>
): number | null {
  if (filledGaps.length === 0) return null;
  // Sort by filled_at descending
  const sorted = [...filledGaps].sort((a, b) => {
    const aMs = a.filled_at ? new Date(a.filled_at).getTime() : 0;
    const bMs = b.filled_at ? new Date(b.filled_at).getTime() : 0;
    return bMs - aMs;
  });
  return sorted[0].leakage_value;
}

/**
 * Metric 5: Weekly recovery rate — filled / detected this week.
 * Returns null if fewer than 3 gaps detected this week (insufficient data).
 */
export function computeWeeklyRecoveryRate(
  detectedThisWeek: number,
  filledThisWeek: number
): number | null {
  if (detectedThisWeek < 3) return null;
  return filledThisWeek / detectedThisWeek;
}

/**
 * Metric 6: Fill probability score — historical fill rate for same weekday+hour bucket.
 * Returns null if fewer than 20 historical gap records (confidence_unknown).
 */
export function computeFillProbabilityScore(
  allGaps: Array<{
    day_of_week: string;
    start_time: string;
    status: string;
  }>,
  targetDayOfWeek: string,
  targetHour: number
): number | null {
  if (allGaps.length < 20) return null;

  const HOUR_BUCKET_RADIUS = 1; // ±1 hour bucket

  const bucketGaps = allGaps.filter((g) => {
    if (g.day_of_week !== targetDayOfWeek) return false;
    const gapHour = new Date(g.start_time).getUTCHours();
    return Math.abs(gapHour - targetHour) <= HOUR_BUCKET_RADIUS;
  });

  if (bucketGaps.length < 3) return null; // not enough bucket data
  const filled = bucketGaps.filter((g) => g.status === "filled").length;
  return filled / bucketGaps.length;
}

/** Metric 7: Days until renewal — null if no renewal date */
export function computeDaysUntilRenewal(
  subscriptionRenewalDate: string | null | undefined
): number | null {
  if (!subscriptionRenewalDate) return null;
  const renewalMs = new Date(subscriptionRenewalDate).getTime();
  return (renewalMs - Date.now()) / (1000 * 60 * 60 * 24);
}

/** Metric 8: Sync staleness in days */
export function computeSyncStalenessDays(lastSyncAt: string | null | undefined): number {
  if (!lastSyncAt) return 999;
  return (Date.now() - new Date(lastSyncAt).getTime()) / (1000 * 60 * 60 * 24);
}

/** Metric 9: Inactivity tier */
export function computeInactivityTier(
  daysSinceLastOpen: number,
  subscriptionStatus: string
): 0 | 1 | 2 | 3 | 4 | 5 {
  if (subscriptionStatus === "cancelled" || subscriptionStatus === "expired") return 5;
  if (daysSinceLastOpen <= 3) return 0;
  if (daysSinceLastOpen <= 7) return 1;
  if (daysSinceLastOpen <= 14) return 2;
  if (daysSinceLastOpen <= 29) return 3;
  return 4;
}

// ─────────────────────────────────────────────────────────────
// Firestore data loading helpers
// ─────────────────────────────────────────────────────────────

async function loadGapsForUser(userId: string): Promise<
  Array<{
    leakage_value: number;
    status: string;
    start_time: string;
    end_time: string;
    day_of_week: string;
    filled_at?: string;
    week_key: string;
  }>
> {
  const db = getDb();
  const snap = await db
    .collection("gaps")
    .where("user_id", "==", userId)
    .get();

  return snap.docs.map((d) => d.data() as ReturnType<typeof loadGapsForUser> extends Promise<Array<infer T>> ? T : never);
}

function getCurrentWeekKey(): string {
  const now = new Date();
  // ISO week: YYYY-Www
  const jan4 = new Date(now.getFullYear(), 0, 4);
  const dayOfWeek = (now.getDay() + 6) % 7; // Mon=0
  const weekStart = new Date(now.getTime() - dayOfWeek * 86400000);
  const weekOfYear = Math.ceil(
    ((weekStart.getTime() - jan4.getTime()) / 86400000 + ((jan4.getDay() + 6) % 7) + 1) / 7
  );
  return `${now.getFullYear()}-W${String(weekOfYear).padStart(2, "0")}`;
}

// ─────────────────────────────────────────────────────────────
// Main computation function
// ─────────────────────────────────────────────────────────────

export async function computeMetricsForUser(userId: string): Promise<UserMetrics> {
  const db = getDb();
  const userSnap = await db.doc(`users/${userId}`).get();
  const user = userSnap.data() ?? {};

  const notifSnap = await db.doc(`notification_state/${userId}`).get();
  const notifState = notifSnap.data() ?? {};

  const gaps = await loadGapsForUser(userId);

  const currentWeekKey = getCurrentWeekKey();
  const thisWeekGaps = gaps.filter((g) => g.week_key === currentWeekKey);
  const filledGaps = gaps.filter((g) => g.status === "filled");
  const filledThisWeek = thisWeekGaps.filter((g) => g.status === "filled");

  const daysSinceLastOpen = computeDaysSinceLastOpen(user.last_open_at);
  const subscriptionStatus = user.subscription_status ?? "active";

  // Find the most recent open gap for fill probability
  const upcomingGap = gaps
    .filter((g) => g.status === "open" && new Date(g.start_time).getTime() > Date.now())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0];

  const fillProbabilityScore = upcomingGap
    ? computeFillProbabilityScore(
        gaps,
        upcomingGap.day_of_week,
        new Date(upcomingGap.start_time).getHours()
      )
    : null;

  const metrics: UserMetrics = {
    daysSinceLastOpen: Math.floor(daysSinceLastOpen),
    cumulativeDetectedLeakage: computeCumulativeLeakage(gaps.map((g) => g.leakage_value)),
    cumulativeRecoveredUsd: computeCumulativeRecovered(
      user.stats?.recovered_revenue_self_reported ?? 0,
      user.stats?.recovered_revenue_verified ?? 0
    ),
    lastRecoveryAmount: computeLastRecoveryAmount(filledGaps),
    weeklyRecoveryRate: computeWeeklyRecoveryRate(thisWeekGaps.length, filledThisWeek.length),
    fillProbabilityScore,
    daysUntilRenewal: computeDaysUntilRenewal(user.subscription_renewal_date),
    syncStalenessDays: Math.floor(
      computeSyncStalenessDays(user.stats?.last_sync_at)
    ),
    consecutiveDismissedNotifs: notifState.consecutive_dismissed ?? 0,
    inactivityTier: computeInactivityTier(daysSinceLastOpen, subscriptionStatus),
    computedAt: Timestamp.now(),
  };

  return metrics;
}

// ─────────────────────────────────────────────────────────────
// Scheduled Cloud Function — runs every 6 hours
// ─────────────────────────────────────────────────────────────

export const computeRetentionMetrics = onSchedule(
  {
    schedule: "every 6 hours",
    timeZone: "UTC",
    region: "us-central1",
  },
  async () => {
    const db = getDb();
    // Load all users with a subscription (not expired > 90 days)
    const usersSnap = await db
      .collection("users")
      .where("subscription_status", "in", ["trial", "active", "cancelled"])
      .get();

    logger.info(`computeRetentionMetrics: processing ${usersSnap.size} users`);

    const BATCH_SIZE = 400;
    let processed = 0;
    let errors = 0;

    for (let i = 0; i < usersSnap.docs.length; i += BATCH_SIZE) {
      const batch = usersSnap.docs.slice(i, i + BATCH_SIZE);

      await Promise.allSettled(
        batch.map(async (userDoc) => {
          const userId = userDoc.id;
          try {
            const metrics = await computeMetricsForUser(userId);

            // Write to metricsLatest subcollection
            await db
              .doc(`users/${userId}/metricsLatest/current`)
              .set(metrics);

            // Also sync inactivity_tier back to main user doc for querying
            await db.doc(`users/${userId}`).update({
              inactivity_tier: metrics.inactivityTier,
            });

            processed++;
          } catch (err) {
            logger.error("computeRetentionMetrics: error for user", {
              userId,
              err,
            });
            errors++;
          }
        })
      );
    }

    logger.info(`computeRetentionMetrics: done`, { processed, errors });
  }
);
