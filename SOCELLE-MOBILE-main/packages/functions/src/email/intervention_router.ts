/**
 * Intervention router — called by evaluateInactivityTiers.
 * Routes each user to the correct tier-based push/email intervention.
 *
 * Tier 0 (0-3 days): Active — no intervention
 * Tier 1 (4-7 days): Drifting — push only (handled by decision_engine re-engagement mode)
 * Tier 2 (8-14 days): Inactive — value-memory push + in-app banner hint
 * Tier 3 (15-29 days): At-risk — account summary email, suppress other pushes
 * Tier 4 (30+ days, active sub): Silent churn — renewal awareness or account health email
 * Tier 5 (cancelled): Lapsed — handled by resurrection_engine
 */

import { Timestamp, FieldValue } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { sendEmail } from "./sendgrid_client.js";
import {
  tier2ValueMemory,
  tier3AccountSummary,
  tier4RenewalAwareness,
  tier4AccountHealth,
} from "./templates.js";
import { sendPushNotification } from "../notifications/fcm_sender.js";
import { buildValueMemoryCopy } from "../notifications/framing.js";
import type { UserDocument } from "../../../shared/src/index.js";
import { getDb } from "../lib/firebase.js";

interface InterventionUser {
  userId: string;
  user: UserDocument & {
    email?: string;
    display_name?: string;
    inactivity_tier?: number;
    last_intervention_at?: string | null;
    last_recovery_amount?: number;
    subscription_renewal_date?: string;
    stats?: {
      total_leakage_all_time: number;
      recovered_revenue_self_reported: number;
      current_week_leakage: number;
    };
  };
}

/** Hours required between interventions per tier */
const INTERVENTION_COOLDOWN_HOURS: Record<number, number> = {
  2: 168, // 1 per week
  3: 168, // 1 per week
  4: 336, // 1 per 2 weeks (for account health; renewal awareness has its own check)
};

function hoursSince(isoDate: string | null | undefined): number {
  if (!isoDate) return Infinity;
  return (Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60);
}

function getDaysUntilRenewal(renewalDateIso: string | undefined): number {
  if (!renewalDateIso) return Infinity;
  const renewalMs = new Date(renewalDateIso).getTime();
  return (renewalMs - Date.now()) / (1000 * 60 * 60 * 24);
}

async function getOpenGapCount(userId: string): Promise<number> {
  const db = getDb();
  try {
    const now = new Date();
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const snapshot = await db
      .collection("gaps")
      .where("user_id", "==", userId)
      .where("status", "==", "open")
      .where("start_time", ">=", now.toISOString())
      .where("start_time", "<", weekEnd.toISOString())
      .count()
      .get();
    return snapshot.data().count;
  } catch {
    return 0;
  }
}

async function markInterventionSent(userId: string): Promise<void> {
  const db = getDb();
  await db.doc(`users/${userId}`).update({
    last_intervention_at: new Date().toISOString(),
  });
}

/** Tier 2: value-memory push notification */
async function sendTier2Push(userId: string, user: InterventionUser["user"]): Promise<void> {
  const lastRecovery = user.last_recovery_amount ?? 0;
  const openGapCount = await getOpenGapCount(userId);

  const copy = buildValueMemoryCopy(lastRecovery, openGapCount);
  await sendPushNotification(userId, {
    title: copy.title,
    body: copy.body,
    data: { type: "inactivity_tier2", tier: "2" },
  });
  logger.info("Tier 2 value-memory push sent", { userId });
}

/** Tier 3: account summary email */
async function sendTier3Email(userId: string, user: InterventionUser["user"]): Promise<void> {
  const email = user.email;
  if (!email) {
    logger.warn("Tier 3 email skipped — no email on user", { userId });
    return;
  }

  const openGaps = await getOpenGapCount(userId);
  const template = tier3AccountSummary({
    name: user.display_name ?? "there",
    totalLeakage: user.stats?.total_leakage_all_time ?? 0,
    recovered: user.stats?.recovered_revenue_self_reported ?? 0,
    openGaps,
    renewalDate: user.subscription_renewal_date
      ? new Date(user.subscription_renewal_date).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : undefined,
  });

  await sendEmail({ to: email, ...template });
  logger.info("Tier 3 account summary email sent", { userId });
}

/** Tier 4: renewal awareness email (7 days before charge) */
async function sendTier4RenewalEmail(userId: string, user: InterventionUser["user"]): Promise<void> {
  const db = getDb();
  const email = user.email;
  if (!email) return;

  // Check if we already sent a renewal email this cycle
  const notifDoc = await db.doc(`notification_state/${userId}`).get();
  const lastRenewalEmailAt: string | null = notifDoc.data()?.last_renewal_email_at ?? null;
  if (lastRenewalEmailAt) {
    const daysSinceRenewalEmail = hoursSince(lastRenewalEmailAt) / 24;
    if (daysSinceRenewalEmail < 14) {
      logger.info("Tier 4 renewal email skipped — already sent this cycle", { userId });
      return;
    }
  }

  const gapCount = await getOpenGapCount(userId);
  const template = tier4RenewalAwareness({
    name: user.display_name ?? "there",
    renewalDate: new Date(user.subscription_renewal_date!).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    }),
    amount: 29, // Default plan price — would come from subscription in production
    gapCount,
    estimatedLeakage: user.stats?.current_week_leakage ?? 0,
  });

  await sendEmail({ to: email, ...template });
  await db.doc(`notification_state/${userId}`).set(
    { last_renewal_email_at: new Date().toISOString() },
    { merge: true }
  );
  logger.info("Tier 4 renewal awareness email sent", { userId });
}

/** Tier 4: account health email (infrequent, for long-absent subscribers) */
async function sendTier4HealthEmail(userId: string, user: InterventionUser["user"]): Promise<void> {
  const email = user.email;
  if (!email) return;

  const daysSinceOpen = Math.round(hoursSince(user.last_open_at) / 24);
  const openGapCount = await getOpenGapCount(userId);

  const template = tier4AccountHealth({
    name: user.display_name ?? "there",
    daysSinceOpen,
    openGapCount,
  });

  await sendEmail({ to: email, ...template });
  logger.info("Tier 4 account health email sent", { userId, daysSinceOpen });
}

/** Main routing function — call this from evaluateInactivityTiers for each user */
export async function routeIntervention({ userId, user }: InterventionUser): Promise<void> {
  const tier = user.inactivity_tier ?? 0;

  // Tier 0 and 1 — no email intervention (tier 1 handled by decision_engine re-engagement)
  if (tier <= 1) return;

  const cooldownHours = INTERVENTION_COOLDOWN_HOURS[tier];
  const hoursSinceIntervention = hoursSince(user.last_intervention_at);

  try {
    if (tier === 2) {
      if (hoursSinceIntervention < cooldownHours) {
        logger.info("Tier 2 intervention skipped — cooldown active", { userId, hoursSinceIntervention });
        return;
      }
      // Only send value-memory push if they've had a recovery before
      if ((user.last_recovery_amount ?? 0) > 0) {
        await sendTier2Push(userId, user);
      }
      await markInterventionSent(userId);
      return;
    }

    if (tier === 3) {
      if (hoursSinceIntervention < cooldownHours) {
        logger.info("Tier 3 intervention skipped — cooldown active", { userId, hoursSinceIntervention });
        return;
      }
      await sendTier3Email(userId, user);
      await markInterventionSent(userId);
      return;
    }

    if (tier === 4) {
      const daysUntilRenewal = getDaysUntilRenewal(user.subscription_renewal_date);

      if (daysUntilRenewal <= 7) {
        // Renewal awareness takes priority
        await sendTier4RenewalEmail(userId, user);
        // Don't reset last_intervention_at — account health should still fire on its own cycle
        return;
      }

      if (hoursSinceIntervention < INTERVENTION_COOLDOWN_HOURS[4]) {
        logger.info("Tier 4 account health skipped — cooldown active", { userId });
        return;
      }
      await sendTier4HealthEmail(userId, user);
      await markInterventionSent(userId);
      return;
    }

    // Tier 5 (lapsed/cancelled) — handled by resurrection_engine.ts
    logger.info("Tier 5 user skipped by intervention router — resurrection engine handles this", { userId });
  } catch (error) {
    logger.error("routeIntervention failed", {
      userId,
      tier,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
