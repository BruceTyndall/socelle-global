/**
 * Scheduled email functions — Tier 4 retention.
 *
 * 1. tier4RenewalAwarenessJob — daily at 09:00 UTC
 *    Sends renewal reminder 7 days before charge to inactive users.
 *    Classified TRANSACTIONAL — bypasses emailOptOut.
 *
 * 2. tier4AccountHealthJob — weekly (Monday at 09:00 UTC)
 *    Sends re-engagement email to users inactive 30+ days with active subscription.
 *    Classified MARKETING — respects emailOptOut.
 */

import { FieldValue } from "firebase-admin/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";
import { sendRenderedEmail, TEMPLATE_IDS } from "./email.js";
import {
  tier4RenewalAwareness,
  tier4AccountHealth,
} from "./email/templates.js";
import { getDb } from "./lib/firebase.js";

/**
 * Monthly subscription price displayed in renewal-awareness emails.
 * Kept as a named constant so the value is easy to update in one place
 * if the plan price changes.
 */
const PLAN_MONTHLY_PRICE_USD = 29;

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function daysSince(isoDate: string | null | undefined): number {
  if (!isoDate) return 0;
  return (Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24);
}

function daysUntil(isoDate: string | null | undefined): number | null {
  if (!isoDate) return null;
  return (new Date(isoDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
}

async function getOpenGapCount(userId: string): Promise<number> {
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
      .count()
      .get();
    return snap.data().count;
  } catch {
    return 0;
  }
}

// ─────────────────────────────────────────────────────────────
// Task 1.1 — Tier 4 Renewal Awareness Email
// Daily at 09:00 UTC
// ─────────────────────────────────────────────────────────────

export const tier4RenewalAwarenessJob = onSchedule(
  {
    schedule: "0 9 * * *",  // daily 09:00 UTC
    timeZone: "UTC",
    region: "us-central1",
    secrets: ["POSTMARK_API_KEY"],
  },
  async () => {
    const db = getDb();
    const now = new Date();

    // Query active subscribers with inactivity_tier >= 2
    // (only send to users who haven't been opening the app)
    const usersSnap = await db
      .collection("users")
      .where("subscription_status", "==", "active")
      .where("inactivity_tier", ">=", 2)
      .get();

    logger.info(`tier4RenewalAwarenessJob: evaluating ${usersSnap.size} users`);
    let sent = 0;
    let skipped = 0;

    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id;
      const user = userDoc.data();

      if (!user.email) { skipped++; continue; }
      if (!user.subscription_renewal_date) { skipped++; continue; }

      const daysUntilRenewal = daysUntil(user.subscription_renewal_date);
      if (daysUntilRenewal === null || daysUntilRenewal < 6.5 || daysUntilRenewal > 7.5) {
        // Only fire exactly at 7-day mark (±0.5 day window for scheduling drift)
        skipped++;
        continue;
      }

      // ── Idempotency: one email per renewal cycle ───────────────────────
      const renewalDateKey = new Date(user.subscription_renewal_date)
        .toISOString()
        .slice(0, 10); // "YYYY-MM-DD"
      const idempotencyKey = `${userId}_renewal_${renewalDateKey}`;

      const daysSinceOpen = Math.round(daysSince(user.last_open_at));
      const openGapCount = await getOpenGapCount(userId);
      const leakageUsd = user.stats?.current_week_leakage ?? 0;

      const template = tier4RenewalAwareness({
        name: user.display_name ?? "there",
        renewalDate: new Date(user.subscription_renewal_date).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        amount: (user.subscription_amount as number | undefined) ?? PLAN_MONTHLY_PRICE_USD,
        gapCount: openGapCount,
        estimatedLeakage: leakageUsd,
      });

      try {
        await sendRenderedEmail({
          userId,
          to: user.email,
          templateId: TEMPLATE_IDS.tier4RenewalAwareness,
          template,
          emailType: "transactional", // billing notice — bypasses emailOptOut
          idempotencyKey,
          meta: {
            daysSinceOpen,
            daysUntilRenewal: Math.round(daysUntilRenewal!),
            inactivityTier: user.inactivity_tier ?? 0,
          },
        });
        sent++;
      } catch (err) {
        logger.error("tier4RenewalAwarenessJob: send error", { userId, err });
      }
    }

    logger.info("tier4RenewalAwarenessJob: done", { sent, skipped });
  }
);

// ─────────────────────────────────────────────────────────────
// Task 1.2 — Tier 4 Account Health Email (Silent Churn)
// Weekly — Monday 09:00 UTC
// ─────────────────────────────────────────────────────────────

export const tier4AccountHealthJob = onSchedule(
  {
    schedule: "0 9 * * 1",  // Monday 09:00 UTC
    timeZone: "UTC",
    region: "us-central1",
    secrets: ["POSTMARK_API_KEY"],
  },
  async () => {
    const db = getDb();
    // Query active subscribers inactive 30+ days
    const usersSnap = await db
      .collection("users")
      .where("subscription_status", "==", "active")
      .get();

    logger.info(`tier4AccountHealthJob: evaluating ${usersSnap.size} users`);
    let sent = 0;
    let skipped = 0;

    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id;
      const user = userDoc.data();

      if (!user.email) { skipped++; continue; }

      const daysSinceOpen = daysSince(user.last_open_at);
      if (daysSinceOpen < 30) { skipped++; continue; }

      // ── Cooldown: no account_health in last 14 days ────────────────────
      const notifSnap = await db.doc(`notification_state/${userId}`).get();
      const notifState = notifSnap.data() ?? {};
      const lastHealthAt = notifState.last_account_health_email_at;
      if (lastHealthAt && daysSince(lastHealthAt) < 14) { skipped++; continue; }

      // ── No renewal awareness email in last 7 days ──────────────────────
      const lastRenewalAt = notifState.last_renewal_email_at;
      if (lastRenewalAt && daysSince(lastRenewalAt) < 7) { skipped++; continue; }

      // ── Select variant: stale sync vs. has gaps ────────────────────────
      const syncStalenessDays = daysSince(user.stats?.last_sync_at);
      const openGapCount = await getOpenGapCount(userId);

      const template = tier4AccountHealth({
        name: user.display_name ?? "there",
        daysSinceOpen: Math.round(daysSinceOpen),
        openGapCount,
        // Pass staleness for variant selection inside template
        syncStalenessDays: Math.round(syncStalenessDays),
      } as Parameters<typeof tier4AccountHealth>[0]);

      try {
        await sendRenderedEmail({
          userId,
          to: user.email,
          templateId: TEMPLATE_IDS.tier4AccountHealth,
          template,
          emailType: "marketing", // respects emailOptOut
          meta: {
            daysSinceOpen: Math.round(daysSinceOpen),
            syncStalenessDays: Math.round(syncStalenessDays),
          },
        });

        // Record send time for cooldown enforcement
        await db.doc(`notification_state/${userId}`).set(
          { last_account_health_email_at: new Date().toISOString() },
          { merge: true }
        );

        sent++;
      } catch (err) {
        logger.error("tier4AccountHealthJob: send error", { userId, err });
      }
    }

    logger.info("tier4AccountHealthJob: done", { sent, skipped });
  }
);
