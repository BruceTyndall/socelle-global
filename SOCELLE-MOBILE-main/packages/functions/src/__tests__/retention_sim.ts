/**
 * Retention simulation harness.
 *
 * Simulates 6 synthetic user profiles through the metric computation and
 * eligibility pipeline. Useful for:
 *   - Verifying that rules fire correctly for specific user states
 *   - Manual day-advance simulation to trace retention sequences
 *   - Debugging "why didn't X fire for this user?"
 *
 * Run:  npx tsx src/__tests__/retention_sim.ts
 *   or: npx ts-node --esm src/__tests__/retention_sim.ts
 */

import {
  computeDaysSinceLastOpen,
  computeInactivityTier,
  computeWeeklyRecoveryRate,
  computeFillProbabilityScore,
  computeSyncStalenessDays,
  computeDaysUntilRenewal,
  computeLastRecoveryAmount,
  type UserMetrics,
} from "../retentionMetrics.js";

// ─────────────────────────────────────────────────────────────
// Synthetic user profile type
// ─────────────────────────────────────────────────────────────

interface SimUserProfile {
  id: string;
  description: string;
  subscription_status: string;
  cancelled_at?: string | null;
  last_open_at?: string | null;
  notifications_enabled: boolean;
  email_opt_out: boolean;
  settings: { timezone: string; avgBookingValue: number };
  stats?: {
    recovered_revenue_self_reported?: number;
    recovered_revenue_verified?: number;
    last_sync_at?: string;
  };
  subscription_renewal_date?: string | null;
  inactivity_tier?: number;
  gaps?: Array<{
    leakage_value: number;
    status: string;
    start_time: string;
    day_of_week: string;
    filled_at?: string;
    week_key: string;
  }>;
  notification_state?: {
    consecutive_dismissed?: number;
    daily_count?: number;
    daily_count_date?: string;
    last_sent_at?: string | null;
  };
}

// ─────────────────────────────────────────────────────────────
// 6 Synthetic profiles
// ─────────────────────────────────────────────────────────────

function makeIso(daysAgo: number): string {
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
}

function makeIsoFuture(daysOut: number): string {
  return new Date(Date.now() + daysOut * 24 * 60 * 60 * 1000).toISOString();
}

const PROFILES: SimUserProfile[] = [
  {
    id: "new_engaged",
    description: "Signed up 2 days ago, opened app today, no gaps yet",
    subscription_status: "trial",
    last_open_at: makeIso(0),
    notifications_enabled: true,
    email_opt_out: false,
    settings: { timezone: "America/New_York", avgBookingValue: 120 },
    stats: { last_sync_at: makeIso(0) },
    subscription_renewal_date: makeIsoFuture(12),
    gaps: [],
    notification_state: { consecutive_dismissed: 0, daily_count: 0, last_sent_at: null },
  },

  {
    id: "drifting",
    description: "Active user, last opened 6 days ago, 2 open gaps this week",
    subscription_status: "active",
    last_open_at: makeIso(6),
    notifications_enabled: true,
    email_opt_out: false,
    settings: { timezone: "America/Chicago", avgBookingValue: 85 },
    stats: {
      recovered_revenue_self_reported: 340,
      last_sync_at: makeIso(6),
    },
    subscription_renewal_date: makeIsoFuture(22),
    gaps: [
      { leakage_value: 85, status: "open", start_time: makeIsoFuture(1), day_of_week: "Wednesday", week_key: "2025-W24" },
      { leakage_value: 85, status: "open", start_time: makeIsoFuture(3), day_of_week: "Friday", week_key: "2025-W24" },
    ],
    notification_state: { consecutive_dismissed: 1, daily_count: 0, last_sent_at: makeIso(0.5) },
  },

  {
    id: "silent_churner",
    description: "Active subscription but no opens in 35 days, stale sync",
    subscription_status: "active",
    last_open_at: makeIso(35),
    notifications_enabled: true,
    email_opt_out: false,
    settings: { timezone: "America/Los_Angeles", avgBookingValue: 100 },
    stats: {
      recovered_revenue_self_reported: 0,
      last_sync_at: makeIso(35),
    },
    subscription_renewal_date: makeIsoFuture(7),
    gaps: [],
    notification_state: { consecutive_dismissed: 4, daily_count: 0, last_sent_at: makeIso(2) },
  },

  {
    id: "recently_cancelled",
    description: "Cancelled 32 days ago — in Day 30 resurrection window",
    subscription_status: "cancelled",
    cancelled_at: makeIso(32),
    last_open_at: makeIso(32),
    notifications_enabled: false,
    email_opt_out: false,
    settings: { timezone: "America/New_York", avgBookingValue: 95 },
    gaps: [],
    notification_state: { consecutive_dismissed: 0, daily_count: 0, last_sent_at: null },
  },

  {
    id: "never_recovered",
    description: "Active trial, opened 2 days ago, has open gaps but never filled one",
    subscription_status: "trial",
    last_open_at: makeIso(2),
    notifications_enabled: true,
    email_opt_out: false,
    settings: { timezone: "America/Denver", avgBookingValue: 75 },
    stats: {
      recovered_revenue_self_reported: 0,
      last_sync_at: makeIso(1),
    },
    subscription_renewal_date: makeIsoFuture(5),
    gaps: [
      { leakage_value: 75, status: "open", start_time: makeIsoFuture(2), day_of_week: "Thursday", week_key: "2025-W24" },
    ],
    notification_state: { consecutive_dismissed: 0, daily_count: 0, last_sent_at: makeIso(8) },
  },

  {
    id: "stale_sync",
    description: "Active user, opened yesterday but sync is 10 days old",
    subscription_status: "active",
    last_open_at: makeIso(1),
    notifications_enabled: true,
    email_opt_out: false,
    settings: { timezone: "Europe/London", avgBookingValue: 90 },
    stats: {
      recovered_revenue_self_reported: 180,
      last_sync_at: makeIso(10),
    },
    subscription_renewal_date: makeIsoFuture(18),
    gaps: [],
    notification_state: { consecutive_dismissed: 0, daily_count: 1, last_sent_at: makeIso(10) },
  },
];

// ─────────────────────────────────────────────────────────────
// Metric computation (pure, no Firestore)
// ─────────────────────────────────────────────────────────────

function computeMetricsLocal(
  profile: SimUserProfile,
  daysAdvanced = 0
): Partial<UserMetrics> & { daysSinceLastOpen: number } {
  const simulatedNowMs = Date.now() + daysAdvanced * 24 * 60 * 60 * 1000;
  const offsetNow = new Date(simulatedNowMs).toISOString();

  const daysSinceLastOpen = profile.last_open_at
    ? (simulatedNowMs - new Date(profile.last_open_at).getTime()) /
      (1000 * 60 * 60 * 24)
    : 999;

  const currentWeekKey = "2025-W24"; // fixed for simulation
  const thisWeekGaps = (profile.gaps ?? []).filter(
    (g) => g.week_key === currentWeekKey
  );
  const filledThisWeek = thisWeekGaps.filter((g) => g.status === "filled").length;
  const filledGaps = (profile.gaps ?? []).filter((g) => g.status === "filled");

  return {
    daysSinceLastOpen,
    cumulativeDetectedLeakage: (profile.gaps ?? []).reduce(
      (s, g) => s + g.leakage_value,
      0
    ),
    cumulativeRecoveredUsd:
      profile.stats?.recovered_revenue_self_reported ?? 0,
    lastRecoveryAmount: computeLastRecoveryAmount(filledGaps),
    weeklyRecoveryRate: computeWeeklyRecoveryRate(
      thisWeekGaps.length,
      filledThisWeek
    ),
    fillProbabilityScore: computeFillProbabilityScore(
      profile.gaps ?? [],
      "Monday",
      10
    ),
    daysUntilRenewal: computeDaysUntilRenewal(profile.subscription_renewal_date),
    syncStalenessDays: profile.stats?.last_sync_at
      ? (simulatedNowMs - new Date(profile.stats.last_sync_at).getTime()) /
        (1000 * 60 * 60 * 24)
      : 999,
    consecutiveDismissedNotifs:
      profile.notification_state?.consecutive_dismissed ?? 0,
    inactivityTier: computeInactivityTier(
      daysSinceLastOpen,
      profile.subscription_status
    ),
  };
}

// ─────────────────────────────────────────────────────────────
// Eligibility simulation (rule checks without Firestore)
// ─────────────────────────────────────────────────────────────

interface EligibilitySummary {
  channel: string;
  eligible: boolean;
  suppressedRules: string[];
  passedRules: string[];
}

function simulateEligibility(
  profile: SimUserProfile,
  metrics: ReturnType<typeof computeMetricsLocal>,
  options: { channel: "push" | "email"; emailType?: "transactional" | "marketing" }
): EligibilitySummary {
  const { channel, emailType = "marketing" } = options;
  const suppressedRules: string[] = [];
  const passedRules: string[] = [];

  const check = (ruleId: string, suppress: boolean) => {
    if (suppress) suppressedRules.push(ruleId);
    else passedRules.push(ruleId);
    return suppress;
  };

  const daysSinceCancel = profile.cancelled_at
    ? (Date.now() - new Date(profile.cancelled_at).getTime()) /
      (1000 * 60 * 60 * 24)
    : 0;

  if (check("T-01", profile.subscription_status === "cancelled" && daysSinceCancel > 90)) {
    return { channel, eligible: false, suppressedRules, passedRules };
  }
  if (check("T-02", channel === "push" && !profile.notifications_enabled)) {
    return { channel, eligible: false, suppressedRules, passedRules };
  }
  if (check("T-03", channel === "email" && emailType === "marketing" && profile.email_opt_out)) {
    return { channel, eligible: false, suppressedRules, passedRules };
  }
  if (check("T-04", channel === "push" && (metrics.inactivityTier ?? 0) >= 3)) {
    return { channel, eligible: false, suppressedRules, passedRules };
  }

  // T-05: quiet hours (simplified — assume daytime for sim)
  passedRules.push("T-05");

  // T-06: reduced mode
  const consecutiveDismissed = profile.notification_state?.consecutive_dismissed ?? 0;
  const isReducedMode = consecutiveDismissed >= 3;
  const dailyCount = profile.notification_state?.daily_count ?? 0;
  if (check("T-06", channel === "push" && isReducedMode && dailyCount >= 1)) {
    return { channel, eligible: false, suppressedRules, passedRules };
  }

  // T-07: 6h cooldown
  const lastSentAt = profile.notification_state?.last_sent_at;
  const hoursSinceLast = lastSentAt
    ? (Date.now() - new Date(lastSentAt).getTime()) / (1000 * 60 * 60)
    : Infinity;
  if (check("T-07", channel === "push" && hoursSinceLast < 6)) {
    return { channel, eligible: false, suppressedRules, passedRules };
  }

  // T-08: daily cap
  if (check("T-08", channel === "push" && dailyCount >= 2)) {
    return { channel, eligible: false, suppressedRules, passedRules };
  }

  // T-09: fill probability
  const fillProb = metrics.fillProbabilityScore ?? null;
  if (check("T-09", channel === "push" && fillProb !== null && fillProb < 0.25)) {
    return { channel, eligible: false, suppressedRules, passedRules };
  }

  // T-10: slot value
  passedRules.push("T-10"); // no gap data in sim

  return { channel, eligible: true, suppressedRules, passedRules };
}

// ─────────────────────────────────────────────────────────────
// Day-advance simulation
// ─────────────────────────────────────────────────────────────

export function simulateProfile(
  profile: SimUserProfile,
  daysAdvanced = 0
): void {
  const metrics = computeMetricsLocal(profile, daysAdvanced);

  console.log(`\n${"═".repeat(60)}`);
  console.log(`Profile: ${profile.id} (+${daysAdvanced}d)`);
  console.log(`  ${profile.description}`);
  console.log(`\n  Metrics:`);
  console.log(`    daysSinceLastOpen:       ${metrics.daysSinceLastOpen?.toFixed(1)}`);
  console.log(`    inactivityTier:          ${metrics.inactivityTier}`);
  console.log(`    syncStalenessDays:       ${metrics.syncStalenessDays?.toFixed(1)}`);
  console.log(`    daysUntilRenewal:        ${metrics.daysUntilRenewal?.toFixed(1) ?? "—"}`);
  console.log(`    cumulativeLeakage:       $${metrics.cumulativeDetectedLeakage}`);
  console.log(`    cumulativeRecovered:     $${metrics.cumulativeRecoveredUsd}`);
  console.log(`    lastRecoveryAmount:      ${metrics.lastRecoveryAmount != null ? "$" + metrics.lastRecoveryAmount : "—"}`);
  console.log(`    weeklyRecoveryRate:      ${metrics.weeklyRecoveryRate != null ? (metrics.weeklyRecoveryRate * 100).toFixed(0) + "%" : "—"}`);
  console.log(`    fillProbabilityScore:    ${metrics.fillProbabilityScore?.toFixed(2) ?? "—"}`);
  console.log(`    consecutiveDismissed:    ${metrics.consecutiveDismissedNotifs}`);

  const pushElig = simulateEligibility(profile, metrics, { channel: "push" });
  const emailElig = simulateEligibility(profile, metrics, {
    channel: "email",
    emailType: "marketing",
  });

  console.log(`\n  Push eligibility:   ${pushElig.eligible ? "✅ ELIGIBLE" : "🚫 SUPPRESSED"}`);
  if (!pushElig.eligible) {
    console.log(`    Blocked by:  ${pushElig.suppressedRules.at(-1)}`);
  }
  console.log(`  Email eligibility:  ${emailElig.eligible ? "✅ ELIGIBLE" : "🚫 SUPPRESSED"}`);
  if (!emailElig.eligible) {
    console.log(`    Blocked by:  ${emailElig.suppressedRules.at(-1)}`);
  }
}

// ─────────────────────────────────────────────────────────────
// Run when executed directly
// ─────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const daysAdvanced = parseInt(args[0] ?? "0", 10);

console.log(`\nSLOTFORCE Retention Simulation — Day +${daysAdvanced}\n`);
console.log(`Base time: ${new Date().toISOString()}`);

for (const profile of PROFILES) {
  simulateProfile(profile, daysAdvanced);
}

console.log(`\n${"═".repeat(60)}\nDone.\n`);

export { PROFILES, computeMetricsLocal, simulateEligibility };
