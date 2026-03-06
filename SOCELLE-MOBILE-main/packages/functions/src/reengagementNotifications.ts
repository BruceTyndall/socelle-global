/**
 * Re-engagement push notifications.
 *
 * Task 2.1 — Tier 1 Re-entry Push
 * Firestore trigger: fires when users/{userId}.inactivity_tier transitions to 1.
 * Sends a gap-focused push (not "we missed you").
 *
 * 4 copy variants, round-robin (stored on user doc to prevent repeats).
 * Suppressed if app opened within 1 hour of trigger.
 * All quota/eligibility rules enforced via checkNotificationEligibility.
 */

import { FieldValue } from "firebase-admin/firestore";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions";
import { checkNotificationEligibility } from "./notificationEligibility.js";
import { sendPushNotification } from "./notifications/fcm_sender.js";
import { getDb } from "./lib/firebase.js";

type CopyVariant = "A" | "B" | "C" | "D";

function buildTier1Copy(
  variant: CopyVariant,
  ctx: {
    gapCount: number;
    leakageUsd: number;
    dayName?: string;
    slotValue?: number;
  }
): { title: string; body: string; variant: CopyVariant } {
  const s = ctx.gapCount !== 1 ? "s" : "";

  switch (variant) {
    case "A":
      return {
        title: `You have ${ctx.gapCount} gap${s} this week`,
        body: `Totaling $${ctx.leakageUsd.toFixed(0)}. Takes 30 seconds to check.`,
        variant: "A",
      };
    case "B":
      return {
        title: `${ctx.dayName ?? "This week"} has an open slot worth $${ctx.slotValue?.toFixed(0) ?? ctx.leakageUsd.toFixed(0)}`,
        body: "Still time to act.",
        variant: "B",
      };
    case "C":
      return {
        title: `Quick look: your schedule has ${ctx.gapCount} opening${s}`,
        body: "Open to see what's fillable this week.",
        variant: "C",
      };
    case "D":
    default:
      // Fallback variant — used when no gap data is available
      return {
        title: "Your week is loading",
        body: "Open the app to see what's open.",
        variant: "D",
      };
  }
}

function nextVariant(current: CopyVariant | null): CopyVariant {
  const order: CopyVariant[] = ["A", "B", "C", "D"];
  if (!current) return "A";
  const idx = order.indexOf(current);
  return order[(idx + 1) % order.length];
}

export const onInactivityTierUpdated = onDocumentWritten(
  "users/{userId}",
  async (event) => {
    const db = getDb();
    const userId = event.params.userId;
    const before = event.data?.before?.data() ?? {};
    const after = event.data?.after?.data() ?? {};

    const prevTier = before.inactivity_tier ?? 0;
    const newTier = after.inactivity_tier ?? 0;

    // Only fire on tier 1 transition (not on re-entry to same tier)
    if (newTier !== 1 || prevTier === 1) {
      return;
    }

    logger.info("onInactivityTierUpdated: tier→1 detected", { userId, prevTier });

    // ── Suppress if app opened within last 1 hour ─────────────────────────
    const lastOpenAt = after.last_open_at;
    if (lastOpenAt) {
      const hoursSinceOpen =
        (Date.now() - new Date(lastOpenAt as string).getTime()) / (1000 * 60 * 60);
      if (hoursSinceOpen < 1) {
        logger.info("onInactivityTierUpdated: suppressed — app opened recently", {
          userId,
          hoursSinceOpen,
        });
        return;
      }
    }

    // ── Generic eligibility check ─────────────────────────────────────────
    const eligibility = await checkNotificationEligibility({
      userId,
      channel: "push",
    });
    if (!eligibility.eligible) {
      logger.info("onInactivityTierUpdated: suppressed by eligibility", {
        userId,
        reason: eligibility.reason,
      });
      return;
    }

    // ── Load open gaps for copy context ──────────────────────────────────
    const now = new Date();
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const gapsSnap = await db
      .collection("gaps")
      .where("user_id", "==", userId)
      .where("status", "==", "open")
      .where("start_time", ">=", now.toISOString())
      .where("start_time", "<", weekEnd.toISOString())
      .orderBy("start_time")
      .get();

    const gaps = gapsSnap.docs.map((d) => d.data());
    const gapCount = gaps.length;
    const totalLeakage = gaps.reduce((s, g) => s + (g.leakage_value as number ?? 0), 0);
    const topGap = gaps[0];

    // ── Round-robin variant selection ─────────────────────────────────────
    const notifSnap = await db.doc(`notification_state/${userId}`).get();
    const lastVariant = (notifSnap.data()?.last_reengagement_variant ?? null) as CopyVariant | null;

    // Use D variant if no gap data
    let variant: CopyVariant;
    if (gapCount === 0) {
      variant = "D";
    } else {
      variant = nextVariant(lastVariant);
      // Skip D when we have gap data
      if (variant === "D") variant = nextVariant("D");
    }

    const copy = buildTier1Copy(variant, {
      gapCount,
      leakageUsd: totalLeakage,
      dayName: topGap?.day_of_week
        ? (topGap.day_of_week as string).charAt(0).toUpperCase() +
          (topGap.day_of_week as string).slice(1)
        : undefined,
      slotValue: topGap?.leakage_value as number | undefined,
    });

    // ── Send push ─────────────────────────────────────────────────────────
    const sent = await sendPushNotification(userId, {
      title: copy.title,
      body: copy.body,
      data: { type: "reengagement_tier1", variant: copy.variant ?? "" },
    });

    if (sent) {
      // Store variant for next round-robin + write event
      await db.doc(`notification_state/${userId}`).set(
        {
          last_reengagement_variant: copy.variant,
        },
        { merge: true }
      );
      await db.collection(`users/${userId}/events`).add({
        event: "notification_sent",
        channel: "push",
        type: "reengagement_tier1",
        bodyVariant: copy.variant,
        gapCount,
        createdAt: FieldValue.serverTimestamp(),
      });
      logger.info("onInactivityTierUpdated: push sent", {
        userId,
        variant: copy.variant,
      });
    }
  }
);
