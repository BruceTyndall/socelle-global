/**
 * Unit tests for the notification eligibility layer.
 * T-01 through T-15 — one test per rule plus edge cases.
 *
 * Firestore and firebase-functions are mocked so no emulator is required.
 */

import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";

// ── Mock firebase-admin/firestore ──────────────────────────────────────────
const mockUserGet = vi.fn();
const mockNotifGet = vi.fn();

vi.mock("firebase-admin/firestore", () => {
  return {
    getFirestore: vi.fn(() => ({
      doc: vi.fn((path: string) => ({
        get: path.startsWith("users/") && !path.includes("notification_state")
          ? mockUserGet
          : mockNotifGet,
      })),
    })),
    FieldValue: { serverTimestamp: vi.fn() },
  };
});

// ── Mock firebase-functions ────────────────────────────────────────────────
vi.mock("firebase-functions", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Import after mocks
import { checkNotificationEligibility } from "../notificationEligibility.js";

// ── Fixed "now" for deterministic time-based tests ────────────────────────
// Set to 14:00 UTC (not quiet hours) on a Tuesday
const NOW_ISO = "2025-06-17T14:00:00.000Z"; // 2PM UTC, 10AM EST

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW_ISO));
  vi.clearAllMocks();
});

afterAll(() => {
  vi.useRealTimers();
});

// ── Helpers ────────────────────────────────────────────────────────────────

function mockUser(overrides: Record<string, unknown> = {}) {
  mockUserGet.mockResolvedValue({
    exists: true,
    data: () => ({
      subscription_status: "active",
      notifications_enabled: true,
      email_opt_out: false,
      inactivity_tier: 0,
      settings: { timezone: "America/New_York", avgBookingValue: 100 },
      ...overrides,
    }),
  });
}

function mockNotifState(overrides: Record<string, unknown> = {}) {
  mockNotifGet.mockResolvedValue({
    exists: true,
    data: () => ({
      consecutive_dismissed: 0,
      daily_count: 0,
      daily_count_date: "",
      last_sent_at: null,
      ...overrides,
    }),
  });
}

const defaultGap = { fillProbabilityScore: 0.4, slotValueUsd: 80 };

// ─────────────────────────────────────────────────────────────
// T-01: Cancelled > 90 days → suppress all
// ─────────────────────────────────────────────────────────────

describe("T-01: cancelled over 90 days", () => {
  it("suppresses push when cancelled > 90 days ago", async () => {
    const cancelledAt = new Date(Date.now() - 91 * 24 * 60 * 60 * 1000).toISOString();
    mockUser({ subscription_status: "cancelled", cancelled_at: cancelledAt });
    mockNotifState();

    const result = await checkNotificationEligibility({
      userId: "u1",
      channel: "push",
    });

    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("T-01");
  });

  it("allows push when cancelled <= 90 days ago (resurrection window)", async () => {
    const cancelledAt = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    mockUser({ subscription_status: "cancelled", cancelled_at: cancelledAt });
    mockNotifState();

    // T-02 won't fire because notifications_enabled = true
    // T-04 could fire if inactivity_tier >= 3, but we set it to 0 here
    const result = await checkNotificationEligibility({
      userId: "u1",
      channel: "push",
    });
    // Should reach T-09/T-10 checks or pass through
    expect(result.reason).not.toContain("T-01");
  });
});

// ─────────────────────────────────────────────────────────────
// T-02: notifications_enabled = false → suppress push
// ─────────────────────────────────────────────────────────────

describe("T-02: notifications disabled on device", () => {
  it("suppresses push when notifications_enabled = false", async () => {
    mockUser({ notifications_enabled: false });
    mockNotifState();

    const result = await checkNotificationEligibility({
      userId: "u1",
      channel: "push",
    });

    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("T-02");
  });

  it("does NOT suppress email when notifications_enabled = false", async () => {
    mockUser({ notifications_enabled: false });
    mockNotifState();

    const result = await checkNotificationEligibility({
      userId: "u1",
      channel: "email",
      emailType: "transactional",
    });
    // Email should not be blocked by T-02
    expect(result.reason).not.toContain("T-02");
  });
});

// ─────────────────────────────────────────────────────────────
// T-03: email_opt_out + marketing → suppress email
// ─────────────────────────────────────────────────────────────

describe("T-03: email opt-out for marketing", () => {
  it("suppresses marketing email when user opted out", async () => {
    mockUser({ email_opt_out: true });
    mockNotifState();

    const result = await checkNotificationEligibility({
      userId: "u1",
      channel: "email",
      emailType: "marketing",
    });

    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("T-03");
  });

  it("does NOT suppress transactional email even with opt-out", async () => {
    mockUser({ email_opt_out: true });
    mockNotifState();

    const result = await checkNotificationEligibility({
      userId: "u1",
      channel: "email",
      emailType: "transactional",
    });

    expect(result.reason).not.toContain("T-03");
  });
});

// ─────────────────────────────────────────────────────────────
// T-04: inactivityTier >= 3 → suppress push
// ─────────────────────────────────────────────────────────────

describe("T-04: high inactivity tier suppresses push", () => {
  it("suppresses push at inactivityTier = 3", async () => {
    mockUser({ inactivity_tier: 3 });
    mockNotifState();

    const result = await checkNotificationEligibility({
      userId: "u1",
      channel: "push",
    });

    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("T-04");
  });

  it("suppresses push at inactivityTier = 5", async () => {
    mockUser({ inactivity_tier: 5 });
    mockNotifState();

    const result = await checkNotificationEligibility({
      userId: "u1",
      channel: "push",
    });

    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("T-04");
  });

  it("does NOT suppress push at inactivityTier = 2", async () => {
    mockUser({ inactivity_tier: 2 });
    mockNotifState();

    const result = await checkNotificationEligibility({
      userId: "u1",
      channel: "push",
    });

    expect(result.reason).not.toContain("T-04");
  });
});

// ─────────────────────────────────────────────────────────────
// T-05: Quiet hours 21:00–07:00 local time
// ─────────────────────────────────────────────────────────────

describe("T-05: quiet hours", () => {
  it("suppresses push at 22:00 local time (10PM)", async () => {
    // Set system time to 22:00 EST = 03:00 UTC next day
    vi.setSystemTime(new Date("2025-06-17T03:00:00.000Z")); // 11PM EST
    mockUser({ settings: { timezone: "America/New_York", avgBookingValue: 100 } });
    mockNotifState();

    const result = await checkNotificationEligibility({
      userId: "u1",
      channel: "push",
    });

    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("T-05");
  });

  it("allows push during daytime hours", async () => {
    // 2PM EST = 6PM UTC
    vi.setSystemTime(new Date("2025-06-17T18:00:00.000Z"));
    mockUser({ settings: { timezone: "America/New_York", avgBookingValue: 100 } });
    mockNotifState();

    const result = await checkNotificationEligibility({
      userId: "u1",
      channel: "push",
    });

    expect(result.reason).not.toContain("T-05");
  });

  it("bypasses quiet hours when user has late_evening_alerts_opt_in", async () => {
    vi.setSystemTime(new Date("2025-06-17T03:00:00.000Z")); // 11PM EST
    mockUser({
      settings: { timezone: "America/New_York", avgBookingValue: 100 },
      late_evening_alerts_opt_in: true,
    });
    mockNotifState();

    const result = await checkNotificationEligibility({
      userId: "u1",
      channel: "push",
    });

    expect(result.reason).not.toContain("T-05");
  });
});

// ─────────────────────────────────────────────────────────────
// T-06: consecutiveDismissed >= 3 → reduced mode max 1/day
// ─────────────────────────────────────────────────────────────

describe("T-06: consecutive dismissed notifications", () => {
  it("caps at 1 push/day in reduced mode", async () => {
    mockUser();
    mockNotifState({
      consecutive_dismissed: 3,
      daily_count: 1,
      daily_count_date: new Date(NOW_ISO).toISOString().slice(0, 10),
    });

    const result = await checkNotificationEligibility({
      userId: "u1",
      channel: "push",
    });

    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("T-06");
  });

  it("allows the first push of the day in reduced mode", async () => {
    mockUser();
    mockNotifState({
      consecutive_dismissed: 3,
      daily_count: 0,
      daily_count_date: new Date(NOW_ISO).toISOString().slice(0, 10),
    });

    const result = await checkNotificationEligibility({
      userId: "u1",
      channel: "push",
    });

    expect(result.reason).not.toContain("T-06");
  });
});

// ─────────────────────────────────────────────────────────────
// T-07: Push sent within last 6 hours → suppress (6h cooldown)
// ─────────────────────────────────────────────────────────────

describe("T-07: 6-hour cooldown", () => {
  it("suppresses push within 6-hour cooldown", async () => {
    const twoHoursAgo = new Date(
      new Date(NOW_ISO).getTime() - 2 * 60 * 60 * 1000
    ).toISOString();
    mockUser();
    mockNotifState({ last_sent_at: twoHoursAgo });

    const result = await checkNotificationEligibility({
      userId: "u1",
      channel: "push",
    });

    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("T-07");
  });

  it("allows push after cooldown expires", async () => {
    const sevenHoursAgo = new Date(
      new Date(NOW_ISO).getTime() - 7 * 60 * 60 * 1000
    ).toISOString();
    mockUser();
    mockNotifState({ last_sent_at: sevenHoursAgo });

    const result = await checkNotificationEligibility({
      userId: "u1",
      channel: "push",
    });

    expect(result.reason).not.toContain("T-07");
  });
});

// ─────────────────────────────────────────────────────────────
// T-08: Daily push count >= 2 → suppress
// ─────────────────────────────────────────────────────────────

describe("T-08: daily push quota", () => {
  it("suppresses when daily count reaches 2", async () => {
    mockUser();
    mockNotifState({
      daily_count: 2,
      daily_count_date: new Date(NOW_ISO).toISOString().slice(0, 10),
    });

    const result = await checkNotificationEligibility({
      userId: "u1",
      channel: "push",
    });

    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("T-08");
  });

  it("resets daily count on a new day", async () => {
    mockUser();
    // count = 2 but for yesterday → should reset
    mockNotifState({
      daily_count: 2,
      daily_count_date: "2025-06-16", // yesterday
    });

    const result = await checkNotificationEligibility({
      userId: "u1",
      channel: "push",
    });

    expect(result.reason).not.toContain("T-08");
  });
});

// ─────────────────────────────────────────────────────────────
// T-09: fillProbabilityScore < 0.25 → suppress push
// ─────────────────────────────────────────────────────────────

describe("T-09: fill probability threshold", () => {
  it("suppresses when fillProbabilityScore < 0.25", async () => {
    mockUser();
    mockNotifState();

    const result = await checkNotificationEligibility({
      userId: "u1",
      channel: "push",
      gap: { fillProbabilityScore: 0.1, slotValueUsd: 80 },
    });

    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("T-09");
  });

  it("allows when fillProbabilityScore is null (< 20 gaps, confidence unknown)", async () => {
    mockUser();
    mockNotifState();

    const result = await checkNotificationEligibility({
      userId: "u1",
      channel: "push",
      gap: { fillProbabilityScore: null, slotValueUsd: 80 },
    });

    expect(result.reason).not.toContain("T-09");
  });

  it("allows when fillProbabilityScore >= 0.25", async () => {
    mockUser();
    mockNotifState();

    const result = await checkNotificationEligibility({
      userId: "u1",
      channel: "push",
      gap: { fillProbabilityScore: 0.3, slotValueUsd: 80 },
    });

    expect(result.reason).not.toContain("T-09");
  });
});

// ─────────────────────────────────────────────────────────────
// T-10: Slot value < 30% of avgBookingValue → suppress
// ─────────────────────────────────────────────────────────────

describe("T-10: slot value threshold", () => {
  it("suppresses when slotValue < 30% of avgBookingValue", async () => {
    // avgBookingValue = 100 → threshold = 30; slotValue = 20 → suppress
    mockUser({ settings: { timezone: "America/New_York", avgBookingValue: 100 } });
    mockNotifState();

    const result = await checkNotificationEligibility({
      userId: "u1",
      channel: "push",
      gap: { fillProbabilityScore: 0.5, slotValueUsd: 20 },
    });

    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("T-10");
  });

  it("allows when slotValue >= 30% of avgBookingValue", async () => {
    mockUser({ settings: { timezone: "America/New_York", avgBookingValue: 100 } });
    mockNotifState();

    const result = await checkNotificationEligibility({
      userId: "u1",
      channel: "push",
      gap: { fillProbabilityScore: 0.4, slotValueUsd: 35 },
    });

    expect(result.reason).not.toContain("T-10");
  });
});

// ─────────────────────────────────────────────────────────────
// T-11 through T-15: Additional edge cases
// ─────────────────────────────────────────────────────────────

describe("T-11: all rules pass → eligible", () => {
  it("returns eligible when no rules fire", async () => {
    mockUser();
    mockNotifState();

    const result = await checkNotificationEligibility({
      userId: "u1",
      channel: "push",
      gap: defaultGap,
    });

    expect(result.eligible).toBe(true);
    expect(result.reason).toBe(""); // empty string when all rules pass
  });
});

describe("T-12: email channel skips push-specific rules", () => {
  it("email is eligible even when inactivityTier = 4 (push would be suppressed)", async () => {
    mockUser({ inactivity_tier: 4 });
    mockNotifState();

    const result = await checkNotificationEligibility({
      userId: "u1",
      channel: "email",
      emailType: "transactional",
    });

    // T-04 suppresses push only
    expect(result.reason).not.toContain("T-04");
  });
});

describe("T-13: data load failure → ineligible", () => {
  it("returns ineligible with reason when Firestore read fails", async () => {
    mockUserGet.mockRejectedValue(new Error("Firestore unavailable"));
    mockNotifGet.mockRejectedValue(new Error("Firestore unavailable"));

    const result = await checkNotificationEligibility({
      userId: "u1",
      channel: "push",
    });

    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("data_load_error");
  });
});

describe("T-14: transactional email bypasses marketing opt-out", () => {
  it("transactional email is allowed even when email_opt_out = true", async () => {
    mockUser({ email_opt_out: true });
    mockNotifState();

    const result = await checkNotificationEligibility({
      userId: "u1",
      channel: "email",
      emailType: "transactional",
    });

    expect(result.eligible).toBe(true);
  });
});

describe("T-15: reduced_frequency_mode flag enforcement", () => {
  it("applies 1-push-per-day cap when reduced_frequency_mode is explicitly true", async () => {
    mockUser();
    mockNotifState({
      reduced_frequency_mode: true,
      daily_count: 1,
      daily_count_date: new Date(NOW_ISO).toISOString().slice(0, 10),
    });

    const result = await checkNotificationEligibility({
      userId: "u1",
      channel: "push",
    });

    expect(result.eligible).toBe(false);
    expect(result.reason).toContain("T-06");
  });
});
