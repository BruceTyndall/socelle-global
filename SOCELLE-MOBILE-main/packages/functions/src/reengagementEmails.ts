/**
 * Re-engagement emails — Tiers 2 and 3.
 *
 * Task 2.2 — Tier 2 Value Memory Email (8–14 days inactive)
 * Task 2.3 — Tier 3 Account Summary Email (15–29 days inactive)
 *
 * Both are triggered by the daily inactivity tier evaluation.
 * Called from functions/src/index.ts inside evaluateInactivityTiers.
 * 14-day cooldown enforced on both.
 */

import { FieldValue } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { sendRenderedEmail, TEMPLATE_IDS } from "./email.js";
import {
  tier2ValueMemory,
  tier3AccountSummary,
} from "./email/templates.js";
import { getDb } from "./lib/firebase.js";

function daysSince(isoDate: string | null | undefined): number {
  if (!isoDate) return 999;
  return (Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24);
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
// Task 2.2 — Tier 2 Value Memory Email
// ─────────────────────────────────────────────────────────────

type Tier2Variant = "prior_recovery" | "leakage_only" | "stale_sync";

/**
 * Route and send the Tier 2 email for a user.
 * 14-day cooldown enforced by caller (evaluateInactivityTiers).
 */
export async function sendTier2Email(userId: string): Promise<void> {
  const db = getDb();
  const [userSnap, notifSnap] = await Promise.all([
    db.doc(`users/${userId}`).get(),
    db.doc(`notification_state/${userId}`).get(),
  ]);

  const user = userSnap.data() ?? {};
  const notifState = notifSnap.data() ?? {};

  if (!user.email) {
    logger.info("sendTier2Email: no email — skipped", { userId });
    return;
  }

  // 14-day cooldown
  const lastTier2At = notifState.last_tier2_email_at;
  if (lastTier2At && daysSince(lastTier2At) < 14) {
    logger.info("sendTier2Email: cooldown active", { userId });
    return;
  }

  const syncStalenessDays = daysSince(user.stats?.last_sync_at);
  const lastRecoveryAmount = user.last_recovery_amount ?? 0;
  const cumulativeLeakage = user.stats?.total_leakage_all_time ?? 0;
  const openGapCount = await getOpenGapCount(userId);

  // ── Routing: stale sync takes priority ───────────────────────────────
  let variant: Tier2Variant;
  let template: ReturnType<typeof tier2ValueMemory>;

  if (syncStalenessDays > 3) {
    variant = "stale_sync";
    // Use the generic tier2 template with stale sync copy
    template = tier2ValueMemory({
      name: user.display_name ?? "there",
      lastRecoveryAmount: 0,
      cumulativeLeakage,
      openGapCount,
      // Stale sync variant signals no last recovery to show
    });
    // Override subject/body for stale sync variant
    template = {
      subject: "Your calendar may not be connected correctly",
      html: buildStaleSyncHtml(user.display_name ?? "there"),
      text: buildStaleSyncText(user.display_name ?? "there"),
    };
  } else if (lastRecoveryAmount > 0) {
    variant = "prior_recovery";
    template = tier2ValueMemory({
      name: user.display_name ?? "there",
      lastRecoveryAmount,
      cumulativeLeakage,
      openGapCount,
    });
  } else if (cumulativeLeakage > 0) {
    variant = "leakage_only";
    template = tier2ValueMemory({
      name: user.display_name ?? "there",
      lastRecoveryAmount: 0,
      cumulativeLeakage,
      openGapCount,
    });
  } else {
    // No data — skip (no point in sending empty email)
    logger.info("sendTier2Email: no data to show — skipped", { userId });
    return;
  }

  await sendRenderedEmail({
    userId,
    to: user.email,
    templateId: TEMPLATE_IDS.tier2ValueMemory,
    template,
    emailType: "marketing",
    meta: { variant, syncStalenessDays: Math.round(syncStalenessDays) },
  });

  // Update cooldown timestamp + log bodyVariant
  await Promise.all([
    db.doc(`notification_state/${userId}`).set(
      { last_tier2_email_at: new Date().toISOString() },
      { merge: true }
    ),
    db.collection(`users/${userId}/events`).add({
      event: "email_sent",
      templateId: TEMPLATE_IDS.tier2ValueMemory,
      bodyVariant: variant,
      emailType: "marketing",
      createdAt: FieldValue.serverTimestamp(),
    }),
  ]);

  logger.info("sendTier2Email: sent", { userId, variant });
}

// ─────────────────────────────────────────────────────────────
// Task 2.3 — Tier 3 Account Summary Email
// ─────────────────────────────────────────────────────────────

/**
 * Route and send the Tier 3 account summary email.
 * Administrative tone — no urgency language.
 * While Tier 3: push is suppressed globally (enforced by eligibility layer T-04).
 * 14-day cooldown enforced by caller.
 */
export async function sendTier3Email(userId: string): Promise<void> {
  const db = getDb();
  const [userSnap, notifSnap] = await Promise.all([
    db.doc(`users/${userId}`).get(),
    db.doc(`notification_state/${userId}`).get(),
  ]);

  const user = userSnap.data() ?? {};
  const notifState = notifSnap.data() ?? {};

  if (!user.email) {
    logger.info("sendTier3Email: no email — skipped", { userId });
    return;
  }

  // 14-day cooldown
  const lastTier3At = notifState.last_tier3_email_at;
  if (lastTier3At && daysSince(lastTier3At) < 14) {
    logger.info("sendTier3Email: cooldown active", { userId });
    return;
  }

  const openGapCount = await getOpenGapCount(userId);

  // Calculate current gap value
  const openGapsSnap = await db
    .collection("gaps")
    .where("user_id", "==", userId)
    .where("status", "==", "open")
    .get();
  const openGapValue = openGapsSnap.docs.reduce(
    (s, d) => s + ((d.data().leakage_value as number) ?? 0),
    0
  );

  const template = tier3AccountSummary({
    name: user.display_name ?? "there",
    totalLeakage: user.stats?.total_leakage_all_time ?? 0,
    recovered: user.stats?.recovered_revenue_self_reported ?? 0,
    openGaps: openGapCount,
    renewalDate: user.subscription_renewal_date
      ? new Date(user.subscription_renewal_date).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : undefined,
  });

  await sendRenderedEmail({
    userId,
    to: user.email,
    templateId: TEMPLATE_IDS.tier3AccountSummary,
    template,
    emailType: "marketing",
    meta: { openGapCount, openGapValue: Math.round(openGapValue) },
  });

  // Update cooldown timestamp
  await Promise.all([
    db.doc(`notification_state/${userId}`).set(
      { last_tier3_email_at: new Date().toISOString() },
      { merge: true }
    ),
    db.collection(`users/${userId}/events`).add({
      event: "email_sent",
      templateId: TEMPLATE_IDS.tier3AccountSummary,
      emailType: "marketing",
      createdAt: FieldValue.serverTimestamp(),
    }),
  ]);

  logger.info("sendTier3Email: sent", { userId });
}

// ─────────────────────────────────────────────────────────────
// Stale sync email copy (inline — no separate template needed)
// ─────────────────────────────────────────────────────────────

function buildStaleSyncHtml(name: string): string {
  return `
<p>Hey ${name},</p>
<p>We're not detecting gaps we'd expect to see for a provider working your hours. This usually means a calendar sync issue.</p>
<p><a href="https://app.slotforce.app/settings?reconnect=true" style="color:#6C63FF">Check your calendar connection →</a></p>
<p>— The SLOTFORCE team</p>
  `.trim();
}

function buildStaleSyncText(name: string): string {
  return `Hey ${name},\n\nWe're not detecting gaps we'd expect to see. This usually means a calendar sync issue.\n\nCheck your connection: https://app.slotforce.app/settings?reconnect=true\n\n— The SLOTFORCE team`;
}
