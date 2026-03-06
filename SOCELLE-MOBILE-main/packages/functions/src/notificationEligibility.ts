/**
 * Notification Eligibility Enforcement Layer
 *
 * Called before EVERY notification send (push or email).
 * Enforces 15 rules in order. First rule to fail short-circuits the rest.
 *
 * Test IDs T-01 through T-15 map to rules 1–15 below.
 */

import { logger } from "firebase-functions";
import { getDb } from "./lib/firebase.js";

export interface EligibilityResult {
  eligible: boolean;
  /** Rule tag that suppressed the notification (e.g. "T-04: …"), or "" when eligible. */
  reason: string;
}

interface EligibilityContext {
  userId: string;
  channel: "push" | "email";
  emailType?: "transactional" | "marketing";
  /** Optional gap data — required for rules 9+10 */
  gap?: {
    fillProbabilityScore: number | null;
    slotValueUsd: number;
  };
}

/** Cached user data shape for eligibility checks */
interface UserEligibilityData {
  subscription_status?: string;
  cancelled_at?: string | null;
  notifications_enabled?: boolean;
  email_opt_out?: boolean;
  inactivity_tier?: number;
  timezone?: string;
  late_evening_alerts_opt_in?: boolean;
  settings?: { timezone?: string; avgBookingValue?: number };
}

/** Cached notification state shape */
interface NotifStateData {
  consecutive_dismissed?: number;
  daily_count?: number;
  daily_count_date?: string;
  last_sent_at?: string | null;
  reduced_frequency_mode?: boolean;
}

function daysSince(isoDate: string | null | undefined): number {
  if (!isoDate) return 0;
  return (Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60 * 24);
}

function hoursSince(isoDate: string | null | undefined): number {
  if (!isoDate) return Infinity;
  return (Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60);
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Get local hour for a timezone string (e.g., "America/New_York") */
function getLocalHour(timezone: string): number {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: timezone,
    });
    return parseInt(formatter.format(now), 10);
  } catch {
    // Fallback to UTC if timezone is invalid
    return new Date().getUTCHours();
  }
}

/**
 * Main eligibility check. Call this before every notification send.
 *
 * @param ctx - Channel + optional gap data
 * @returns { eligible: boolean, reason?: string }
 */
export async function checkNotificationEligibility(
  ctx: EligibilityContext
): Promise<EligibilityResult> {
  const db = getDb();
  const { userId, channel, emailType, gap } = ctx;

  // Load user doc and notification state in parallel
  let userData: UserEligibilityData = {};
  let notifState: NotifStateData = {};

  try {
    const [userSnap, notifSnap] = await Promise.all([
      db.doc(`users/${userId}`).get(),
      db.doc(`notification_state/${userId}`).get(),
    ]);

    userData = (userSnap.data() as UserEligibilityData) ?? {};
    notifState = (notifSnap.data() as NotifStateData) ?? {};
  } catch (err) {
    logger.error("checkNotificationEligibility: failed to load user data", {
      userId,
      err,
    });
    return { eligible: false, reason: "data_load_error" };
  }

  const subscriptionStatus = userData.subscription_status ?? "active";
  const inactivityTier = userData.inactivity_tier ?? 0;
  const avgBookingValue = userData.settings?.avgBookingValue ?? 85;
  const timezone = userData.settings?.timezone ?? userData.timezone ?? "America/New_York";

  // ─────────────────────────────────────────────────────────────
  // T-01: Cancelled > 90 days → suppress all channels
  // ─────────────────────────────────────────────────────────────
  if (subscriptionStatus === "cancelled") {
    const daysSinceCancel = daysSince(userData.cancelled_at);
    if (daysSinceCancel > 90) {
      return { eligible: false, reason: "T-01: cancelled_over_90_days" };
    }
    // Transactional billing emails can still send within 90 days
    if (channel === "email" && emailType === "transactional") {
      // Allow through — skip T-01 suppression for billing notices
    }
  }

  // ─────────────────────────────────────────────────────────────
  // T-02: Push + notificationsEnabled = false → suppress push
  // ─────────────────────────────────────────────────────────────
  if (channel === "push" && userData.notifications_enabled === false) {
    return { eligible: false, reason: "T-02: notifications_disabled_on_device" };
  }

  // ─────────────────────────────────────────────────────────────
  // T-03: Marketing email + user opted out → suppress
  // ─────────────────────────────────────────────────────────────
  if (
    channel === "email" &&
    emailType === "marketing" &&
    userData.email_opt_out === true
  ) {
    return { eligible: false, reason: "T-03: email_opt_out" };
  }

  // ─────────────────────────────────────────────────────────────
  // T-04: Push + inactivityTier >= 3 → suppress push (email only)
  // ─────────────────────────────────────────────────────────────
  if (channel === "push" && inactivityTier >= 3) {
    return {
      eligible: false,
      reason: `T-04: inactivity_tier_${inactivityTier}_push_suppressed`,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // T-05: Quiet hours 21:00–07:00 local time (push only)
  //       Bypass if user has opted in to late evening alerts
  // ─────────────────────────────────────────────────────────────
  if (channel === "push" && !userData.late_evening_alerts_opt_in) {
    const localHour = getLocalHour(timezone);
    if (localHour >= 21 || localHour < 7) {
      return { eligible: false, reason: `T-05: quiet_hours_local_${localHour}h` };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // T-06: consecutiveDismissedNotifs >= 3 → reduced-frequency mode
  //       In reduced mode: max 1 push/day
  // ─────────────────────────────────────────────────────────────
  const consecutiveDismissed = notifState.consecutive_dismissed ?? 0;
  const isReducedMode = consecutiveDismissed >= 3 || notifState.reduced_frequency_mode === true;

  if (channel === "push" && isReducedMode) {
    const dailyCount = notifState.daily_count ?? 0;
    const dailyCountDate = notifState.daily_count_date ?? "";
    const isToday = dailyCountDate === todayKey();
    if (isToday && dailyCount >= 1) {
      return {
        eligible: false,
        reason: `T-06: reduced_frequency_mode_daily_cap_reached`,
      };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // T-07: Push sent within last 6 hours → suppress
  // ─────────────────────────────────────────────────────────────
  if (channel === "push") {
    const hoursSinceLastSent = hoursSince(notifState.last_sent_at);
    if (hoursSinceLastSent < 6) {
      return {
        eligible: false,
        reason: `T-07: cooldown_active_${hoursSinceLastSent.toFixed(1)}h_since_last_push`,
      };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // T-08: Daily push count >= 2 → suppress
  // ─────────────────────────────────────────────────────────────
  if (channel === "push") {
    const dailyCount = notifState.daily_count ?? 0;
    const dailyCountDate = notifState.daily_count_date ?? "";
    const isToday = dailyCountDate === todayKey();
    if (isToday && dailyCount >= 2) {
      return {
        eligible: false,
        reason: `T-08: daily_quota_reached_${dailyCount}`,
      };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // T-09: fillProbabilityScore < 0.25 → suppress (push only)
  //       If score is null (< 20 historical gaps) → allow through
  // ─────────────────────────────────────────────────────────────
  if (channel === "push" && gap !== undefined) {
    if (
      gap.fillProbabilityScore !== null &&
      gap.fillProbabilityScore < 0.25
    ) {
      return {
        eligible: false,
        reason: `T-09: fill_probability_too_low_${gap.fillProbabilityScore.toFixed(2)}`,
      };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // T-10: Slot value < 30% of avgBookingValue → suppress (push only)
  // ─────────────────────────────────────────────────────────────
  if (channel === "push" && gap !== undefined) {
    const threshold = avgBookingValue * 0.3;
    if (gap.slotValueUsd < threshold) {
      return {
        eligible: false,
        reason: `T-10: slot_value_below_threshold_${gap.slotValueUsd.toFixed(0)}_threshold_${threshold.toFixed(0)}`,
      };
    }
  }

  return { eligible: true, reason: "" };
}

/**
 * Convenience: check push eligibility with gap context.
 * Returns true/false only — for use in tight loops where reason is not needed.
 */
export async function isPushEligible(
  userId: string,
  gap: { fillProbabilityScore: number | null; slotValueUsd: number }
): Promise<boolean> {
  const result = await checkNotificationEligibility({
    userId,
    channel: "push",
    gap,
  });
  if (!result.eligible) {
    logger.info("Push suppressed", { userId, reason: result.reason });
  }
  return result.eligible;
}

/**
 * Convenience: check email eligibility.
 */
export async function isEmailEligible(
  userId: string,
  emailType: "transactional" | "marketing"
): Promise<boolean> {
  const result = await checkNotificationEligibility({
    userId,
    channel: "email",
    emailType,
  });
  if (!result.eligible) {
    logger.info("Email suppressed", { userId, emailType, reason: result.reason });
  }
  return result.eligible;
}
