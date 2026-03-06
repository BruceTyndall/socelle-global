/**
 * Resurrection emails + daily engine.
 *
 * Task 2.4 — Day 30 Resurrection Email
 * Scheduled daily — fires once 30 days after cancellation.
 *
 * CRITICAL: Uses ZERO personal calendar data after cancellation.
 * Uses cohort averages for the provider type only.
 *
 * Idempotency key: ${userId}_resurrection_${cancelledAtISODate}
 */

import { FieldValue } from "firebase-admin/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";
import { sendRenderedEmail, TEMPLATE_IDS } from "./email.js";
import { day30Resurrection, seasonalReEntry } from "./email/templates.js";
import { getDb } from "./lib/firebase.js";

// ─────────────────────────────────────────────────────────────
// Cohort averages by provider type (30-day window)
// These are static estimates — no personal data required.
// In production, these would be computed from anonymized aggregate data.
// ─────────────────────────────────────────────────────────────

interface CohortAverage {
  avgGaps: number;
  avgLeakageUsd: number;
}

function getCohortAverageGaps(providerType: string): CohortAverage {
  const cohorts: Record<string, CohortAverage> = {
    hair_stylist:    { avgGaps: 14, avgLeakageUsd: 980 },
    barber:          { avgGaps: 18, avgLeakageUsd: 720 },
    massage:         { avgGaps: 10, avgLeakageUsd: 1100 },
    esthetician:     { avgGaps: 12, avgLeakageUsd: 840 },
    nail_tech:       { avgGaps: 16, avgLeakageUsd: 640 },
    personal_trainer:{ avgGaps: 8,  avgLeakageUsd: 960 },
  };
  return cohorts[providerType] ?? { avgGaps: 12, avgLeakageUsd: 850 };
}

// ─────────────────────────────────────────────────────────────
// Seasonal re-entry windows
// ─────────────────────────────────────────────────────────────

function getCurrentSeason(): string | null {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  if (month === 1 || (month === 2) || (month === 3 && day <= 20)) {
    return "new_year";
  }
  if ((month === 3 && day >= 21) || month === 4 || month === 5 || (month === 6 && day <= 20)) {
    return "spring";
  }
  if ((month === 8 && day >= 15) || (month === 9 && day <= 15)) {
    return "back_to_school";
  }
  if (month === 11 || month === 12) {
    return "holiday";
  }
  return null; // outside seasonal window
}

function getSeasonLabel(season: string): string {
  const labels: Record<string, string> = {
    new_year: "New year",
    spring: "Spring",
    back_to_school: "Back-to-school",
    holiday: "Holiday",
  };
  return labels[season] ?? "This season";
}

// ─────────────────────────────────────────────────────────────
// Day 30 resurrection email (main task)
// ─────────────────────────────────────────────────────────────

async function sendDay30Resurrection(userId: string, user: Record<string, unknown>): Promise<void> {
  const db = getDb();
  if (!user.email) {
    logger.info("sendDay30Resurrection: no email", { userId });
    return;
  }

  // Idempotency: one email per cancellation event
  const cancelledAt = user.cancelled_at as string | null;
  const cancelledAtKey = cancelledAt
    ? new Date(cancelledAt).toISOString().slice(0, 10)
    : "unknown";
  const idempotencyKey = `${userId}_resurrection_${cancelledAtKey}`;

  // Check if already sent
  if (user.resurrection_day30_sent === true) {
    logger.info("sendDay30Resurrection: already sent", { userId });
    return;
  }

  // If user has resubscribed before Day 30, do not send
  if (user.subscription_status === "active" || user.subscription_status === "trial") {
    logger.info("sendDay30Resurrection: user resubscribed — skipped", { userId });
    return;
  }

  // Use cohort averages — ZERO personal calendar data
  const providerType = (user.settings as Record<string, unknown>)?.providerType as string | undefined;
  const cohort = getCohortAverageGaps(providerType ?? "hair_stylist");

  const template = day30Resurrection({
    name: user.display_name as string ?? "there",
    estimatedMissedValue: cohort.avgLeakageUsd,
    gapCount: cohort.avgGaps,
  });

  await sendRenderedEmail({
    userId,
    to: user.email as string,
    templateId: TEMPLATE_IDS.day30Resurrection,
    template,
    emailType: "marketing",
    idempotencyKey,
    meta: {
      cohortProviderType: providerType ?? "unknown",
      cohortAvgLeakage: cohort.avgLeakageUsd,
    },
  });

  // Mark as sent — prevents re-send
  await db.doc(`users/${userId}`).update({
    resurrection_day30_sent: true,
  });

  logger.info("sendDay30Resurrection: sent", { userId });
}

// ─────────────────────────────────────────────────────────────
// Seasonal re-entry email
// ─────────────────────────────────────────────────────────────

async function sendSeasonalReEntry(userId: string, user: Record<string, unknown>): Promise<void> {
  const db = getDb();
  if (!user.email) return;

  const season = getCurrentSeason();
  if (!season) return;

  const seasonKey = `${season}_${new Date().getFullYear()}`;

  // Already sent this season
  if (user.resurrection_seasonal_sent_season === seasonKey) {
    return;
  }

  // Only send if cancelled 30+ days ago
  const cancelledAt = user.cancelled_at as string | null;
  if (!cancelledAt) return;
  const daysSinceCancel =
    (Date.now() - new Date(cancelledAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCancel < 30) return;

  const providerType = (user.settings as Record<string, unknown>)?.providerType as string | undefined;

  const template = seasonalReEntry({
    name: user.display_name as string ?? "there",
    season: getSeasonLabel(season),
    providerType: providerType ?? "service",
  });

  await sendRenderedEmail({
    userId,
    to: user.email as string,
    templateId: TEMPLATE_IDS.seasonalReEntry,
    template,
    emailType: "marketing",
    idempotencyKey: `${userId}_seasonal_${seasonKey}`,
  });

  await db.doc(`users/${userId}`).update({
    resurrection_seasonal_sent_season: seasonKey,
  });

  logger.info("sendSeasonalReEntry: sent", { userId, season });
}

// ─────────────────────────────────────────────────────────────
// Scheduled resurrection engine — runs daily
// ─────────────────────────────────────────────────────────────

export const resurrectionEngine = onSchedule(
  {
    schedule: "0 10 * * *", // Daily 10:00 UTC
    timeZone: "UTC",
    region: "us-central1",
    secrets: ["POSTMARK_API_KEY"],
  },
  async () => {
    const db = getDb();
    // Load cancelled users
    const cancelledSnap = await db
      .collection("users")
      .where("subscription_status", "==", "cancelled")
      .get();

    logger.info(`resurrectionEngine: evaluating ${cancelledSnap.size} cancelled users`);

    let day30Sent = 0;
    let seasonalSent = 0;

    for (const userDoc of cancelledSnap.docs) {
      const userId = userDoc.id;
      const user = userDoc.data();

      const cancelledAt = user.cancelled_at as string | null;
      if (!cancelledAt) continue;

      const daysSinceCancel =
        (Date.now() - new Date(cancelledAt).getTime()) / (1000 * 60 * 60 * 24);

      // ── Day 30 resurrection ───────────────────────────────────────────────
      if (daysSinceCancel >= 29.5 && daysSinceCancel <= 30.5) {
        try {
          await sendDay30Resurrection(userId, user);
          day30Sent++;
        } catch (err) {
          logger.error("resurrectionEngine: day30 error", { userId, err });
        }
      }

      // ── Seasonal re-entry (30–90 days post-cancel) ────────────────────────
      if (daysSinceCancel >= 30 && daysSinceCancel <= 90) {
        try {
          await sendSeasonalReEntry(userId, user);
          seasonalSent++;
        } catch (err) {
          logger.error("resurrectionEngine: seasonal error", { userId, err });
        }
      }
    }

    logger.info("resurrectionEngine: done", { day30Sent, seasonalSent });
  }
);
