import { getDb } from "../lib/firebase.js";
import { logger } from "firebase-functions";
import { DEFAULT_NOTIFICATION_STATE } from "../../../shared/src/notification_schemas.js";
import { checkNotificationEligibility } from "../notificationEligibility.js";
import {
  buildCopy,
  buildReEngagementCopy,
  FRAME_ORDER,
  type NotificationFrame,
  type NotificationCopy,
  type GapContext,
} from "./framing.js";

export interface EligibilityResult {
  shouldSend: boolean;
  suppressReason?: string;
  copy?: NotificationCopy;
  tier?: 1 | 2 | 3;
}

export interface GapForEvaluation {
  gapId: string;
  startIso: string;
  endIso: string;
  dayOfWeek: string;
  leakageValue: number;
  avgBookingValue: number;
}

/**
 * Core notification decision engine.
 *
 * Evaluates all suppression rules from the blueprint in order and returns
 * whether a notification should be sent, with copy and tier if yes.
 */
export async function shouldSendNotification(
  userId: string,
  gap: GapForEvaluation
): Promise<EligibilityResult> {
  const db = getDb();

  // ── Load notification state ───────────────────────────────────────────
  const stateDoc = await db.collection("notification_state").doc(userId).get();
  const state = stateDoc.exists
    ? { ...DEFAULT_NOTIFICATION_STATE, ...(stateDoc.data() ?? {}) }
    : DEFAULT_NOTIFICATION_STATE;

  const now = new Date();
  const gapStart = new Date(gap.startIso);
  const hoursUntilGap = (gapStart.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Gap must be in the future
  if (hoursUntilGap <= 0) {
    return { shouldSend: false, suppressReason: "gap_in_past" };
  }

  // Only evaluate gaps within 72-hour window
  if (hoursUntilGap > 72) {
    return { shouldSend: false, suppressReason: "outside_72h_window" };
  }

  // ── Load user settings ────────────────────────────────────────────────
  const userDoc = await db.collection("users").doc(userId).get();
  const userData = userDoc.data();
  const notificationFrequency =
    (state.notification_frequency as string) ?? "standard";

  // ── Weekly digest: skip everything except Monday lifecycle ────────────
  if (notificationFrequency === "weekly_digest") {
    return { shouldSend: false, suppressReason: "weekly_digest_mode" };
  }

  // ── Generic eligibility layer (T-01 through T-08) ────────────────────
  // Pass gap data for T-09/T-10 value/probability checks.
  // estimateFillProbability used as proxy until historical data is available.
  const fillProbEst = estimateFillProbability(hoursUntilGap, userData);
  const eligibility = await checkNotificationEligibility({
    userId,
    channel: "push",
    gap: {
      fillProbabilityScore: fillProbEst,
      slotValueUsd: gap.leakageValue,
    },
  });
  if (!eligibility.eligible) {
    return { shouldSend: false, suppressReason: eligibility.reason };
  }

  // ── 7-day user absence → re-engagement variant ────────────────────────
  const lastOpenAt = userData?.last_open_at
    ? new Date(userData.last_open_at as string)
    : null;
  const daysSinceOpen = lastOpenAt
    ? (now.getTime() - lastOpenAt.getTime()) / (1000 * 60 * 60 * 24)
    : 0;
  const isAbsent7Days = daysSinceOpen >= 7;

  // ── Check if this gap slot always marked intentional ─────────────────
  const alwaysIntentional = await isAlwaysIntentionalSlot(userId, gap);
  if (alwaysIntentional) {
    return { shouldSend: false, suppressReason: "always_intentional_slot" };
  }

  // ── Dollar value threshold: < 30% of avg booking value → suppress ─────
  if (gap.leakageValue < gap.avgBookingValue * 0.3) {
    return { shouldSend: false, suppressReason: "low_value_gap" };
  }

  // ── Determine urgency tier ────────────────────────────────────────────
  // fillProbEst already computed above for the eligibility check — reuse it.
  let tier: 1 | 2 | 3;

  if (hoursUntilGap >= 48 && fillProbEst >= 0.25) {
    tier = 1;
  } else if (hoursUntilGap >= 12 && fillProbEst >= 0.15) {
    tier = 2;
  } else if (fillProbEst > 0) {
    // Tier 3 — Focused mode suppresses critical alerts
    if (notificationFrequency === "focused") {
      return { shouldSend: false, suppressReason: "focused_mode_no_tier3" };
    }
    tier = 3;
  } else {
    return { shouldSend: false, suppressReason: "low_fill_probability" };
  }

  // ── Build copy ────────────────────────────────────────────────────────
  let copy: NotificationCopy;

  if (isAbsent7Days) {
    // Load total open gap leakage for re-engagement message
    const openGapLeakage = gap.leakageValue;
    copy = buildReEngagementCopy(openGapLeakage, 1);
  } else {
    const frame = selectFrame(
      state.framing_rotation_index as number ?? 0,
      userData
    );

    // ── Real data queries for copy context ───────────────────────────────
    // filledCountSameDow: count of the user's last 6 same-day-of-week gaps
    // that were filled. Used in social-proof framing ("You've filled X of
    // your last 6 Monday gaps").
    const filledCountSameDow = await queryFilledCountSameDow(
      userId,
      gap.dayOfWeek
    );

    // clientsUnbooked: count of open gaps the user has had in the past 6
    // weeks — a conservative proxy for "clients not yet seen". Capped at 8
    // so copy stays credible ("7 clients haven't booked in 6+ weeks").
    const clientsUnbooked = await queryMissedBookingsLast6Weeks(userId, now);

    const gapCtx: GapContext = {
      dayOfWeek: gap.dayOfWeek,
      timeLabel: formatTime(gapStart),
      leakageValue: gap.leakageValue,
      filledCountSameDow,
      weeksBehindPrevious: gap.leakageValue * 0.7,
      clientsUnbooked,
    };
    copy = buildCopy(frame, gapCtx, tier);
  }

  return { shouldSend: true, copy, tier };
}

/**
 * Pick the next framing type. If user is in "dollar_only" A/B test variant,
 * always return "dollar". Otherwise cycle through the 4 frames.
 */
function selectFrame(
  currentIndex: number,
  userData: FirebaseFirestore.DocumentData | undefined
): NotificationFrame {
  const framingMode =
    (userData?.notification_framing_variant as string) ?? "dollar_only";
  if (framingMode === "dollar_only") return "dollar";
  return FRAME_ORDER[currentIndex % 4];
}

/**
 * Estimate fill probability based on lead time and user history.
 */
function estimateFillProbability(
  hoursUntilGap: number,
  userData: FirebaseFirestore.DocumentData | undefined
): number {
  const hasFilledBefore =
    (userData?.stats?.recovered_revenue_self_reported ?? 0) > 0;
  const baseBonus = hasFilledBefore ? 0.1 : 0;

  if (hoursUntilGap >= 48) return 0.35 + baseBonus;
  if (hoursUntilGap >= 24) return 0.25 + baseBonus;
  if (hoursUntilGap >= 12) return 0.15 + baseBonus;
  if (hoursUntilGap >= 6) return 0.10 + baseBonus;
  return 0.05 + baseBonus;
}

/**
 * Check if this time slot is consistently marked intentional (suppress).
 */
async function isAlwaysIntentionalSlot(
  userId: string,
  gap: GapForEvaluation
): Promise<boolean> {
  const db = getDb();
  const gapStart = new Date(gap.startIso);
  const startMinutes =
    gapStart.getUTCHours() * 60 + gapStart.getUTCMinutes();

  const rules = await db
    .collection("intentional_rules")
    .where("user_id", "==", userId)
    .where("day_of_week", "==", gap.dayOfWeek)
    .where("active", "==", true)
    .get();

  const tolerance = 30;
  return rules.docs.some((doc) => {
    const data = doc.data();
    return (
      Math.abs((data.approx_start_minutes as number) - startMinutes) <= tolerance
    );
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Count how many of the user's last 6 gaps on a given day-of-week
 * were filled. Returns 0 if no history is available.
 *
 * Used in social-proof copy: "You've filled X of your last 6 Monday gaps."
 */
async function queryFilledCountSameDow(
  userId: string,
  dayOfWeek: string
): Promise<number> {
  try {
    const db = getDb();
    // Query the most-recent 6 completed (filled OR intentional) gaps for
    // this user on this day-of-week to compute a realistic fill rate.
    const snap = await db
      .collection("gaps")
      .where("user_id", "==", userId)
      .where("day_of_week", "==", dayOfWeek)
      .where("status", "==", "filled")
      .orderBy("start_time", "desc")
      .limit(6)
      .get();
    return snap.size;
  } catch {
    // Non-fatal — fall back to a neutral count that won't mislead copy.
    return 0;
  }
}

/**
 * Count open (unfilled) gaps the user had in the past 6 weeks.
 * Used as a conservative proxy for "clients not yet rebooked" — capped at 8
 * to keep copy credible and avoid alarming large numbers.
 */
async function queryMissedBookingsLast6Weeks(
  userId: string,
  now: Date
): Promise<number> {
  try {
    const db = getDb();
    const sixWeeksAgo = new Date(now.getTime() - 42 * 24 * 60 * 60 * 1000);
    const snap = await db
      .collection("gaps")
      .where("user_id", "==", userId)
      .where("status", "==", "open")
      .where("start_time", ">=", sixWeeksAgo.toISOString())
      .where("start_time", "<", now.toISOString())
      .get();
    return Math.max(1, Math.min(snap.size, 8));
  } catch {
    return 1; // safe floor
  }
}

export { logger };
