/**
 * Unit tests for the 9 retention metric formulas.
 * All functions are pure — no Firestore mocking required.
 *
 * Test ID mapping:
 *   M-01  computeDaysSinceLastOpen
 *   M-02  computeCumulativeLeakage
 *   M-03  computeCumulativeRecovered
 *   M-04  computeLastRecoveryAmount
 *   M-05  computeWeeklyRecoveryRate
 *   M-06  computeFillProbabilityScore
 *   M-07  computeDaysUntilRenewal
 *   M-08  computeSyncStalenessDays
 *   M-09  computeInactivityTier
 */

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import {
  computeDaysSinceLastOpen,
  computeCumulativeLeakage,
  computeCumulativeRecovered,
  computeLastRecoveryAmount,
  computeWeeklyRecoveryRate,
  computeFillProbabilityScore,
  computeDaysUntilRenewal,
  computeSyncStalenessDays,
  computeInactivityTier,
} from "../retentionMetrics.js";

// ── Fixed "now" for deterministic tests ──────────────────────────────────────
const NOW_ISO = "2025-06-15T10:00:00.000Z";
const NOW_MS = new Date(NOW_ISO).getTime();

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW_ISO));
});

afterAll(() => {
  vi.useRealTimers();
});

// ─────────────────────────────────────────────────────────────
// M-01: computeDaysSinceLastOpen
// ─────────────────────────────────────────────────────────────

describe("M-01: computeDaysSinceLastOpen", () => {
  it("returns 999 when lastOpenAt is null", () => {
    expect(computeDaysSinceLastOpen(null)).toBe(999);
  });

  it("returns 999 when lastOpenAt is undefined", () => {
    expect(computeDaysSinceLastOpen(undefined)).toBe(999);
  });

  it("returns ~3 days when last opened 3 days ago", () => {
    const threeDaysAgo = new Date(NOW_MS - 3 * 24 * 60 * 60 * 1000).toISOString();
    const result = computeDaysSinceLastOpen(threeDaysAgo);
    expect(result).toBeCloseTo(3, 1);
  });

  it("returns ~0 when last opened just now", () => {
    expect(computeDaysSinceLastOpen(NOW_ISO)).toBeCloseTo(0, 1);
  });
});

// ─────────────────────────────────────────────────────────────
// M-02: computeCumulativeLeakage
// ─────────────────────────────────────────────────────────────

describe("M-02: computeCumulativeLeakage", () => {
  it("returns 0 for empty array", () => {
    expect(computeCumulativeLeakage([])).toBe(0);
  });

  it("sums all leakage values", () => {
    expect(computeCumulativeLeakage([100, 200, 50])).toBe(350);
  });

  it("handles null/undefined values gracefully", () => {
    // @ts-expect-error: testing edge case with null
    expect(computeCumulativeLeakage([100, null, 50])).toBe(150);
  });
});

// ─────────────────────────────────────────────────────────────
// M-03: computeCumulativeRecovered
// ─────────────────────────────────────────────────────────────

describe("M-03: computeCumulativeRecovered", () => {
  it("returns self-reported when higher", () => {
    expect(computeCumulativeRecovered(500, 300)).toBe(500);
  });

  it("returns verified when higher", () => {
    expect(computeCumulativeRecovered(200, 400)).toBe(400);
  });

  it("returns 0 when both are 0", () => {
    expect(computeCumulativeRecovered(0, 0)).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────
// M-04: computeLastRecoveryAmount
// ─────────────────────────────────────────────────────────────

describe("M-04: computeLastRecoveryAmount", () => {
  it("returns null for empty array", () => {
    expect(computeLastRecoveryAmount([])).toBeNull();
  });

  it("returns the most recent gap's leakage value", () => {
    const gaps = [
      { leakage_value: 100, filled_at: "2025-06-10T10:00:00Z" },
      { leakage_value: 250, filled_at: "2025-06-14T10:00:00Z" }, // most recent
      { leakage_value: 75,  filled_at: "2025-06-01T10:00:00Z" },
    ];
    expect(computeLastRecoveryAmount(gaps)).toBe(250);
  });

  it("handles gaps without filled_at (treats as epoch 0)", () => {
    const gaps = [
      { leakage_value: 150 },
      { leakage_value: 200, filled_at: "2025-06-14T10:00:00Z" },
    ];
    expect(computeLastRecoveryAmount(gaps)).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────
// M-05: computeWeeklyRecoveryRate
// ─────────────────────────────────────────────────────────────

describe("M-05: computeWeeklyRecoveryRate", () => {
  it("returns null when fewer than 3 gaps detected", () => {
    expect(computeWeeklyRecoveryRate(2, 1)).toBeNull();
  });

  it("returns null when detected = 0", () => {
    expect(computeWeeklyRecoveryRate(0, 0)).toBeNull();
  });

  it("returns correct rate when 3+ gaps detected", () => {
    expect(computeWeeklyRecoveryRate(5, 3)).toBeCloseTo(0.6);
  });

  it("returns 1.0 for 100% fill rate", () => {
    expect(computeWeeklyRecoveryRate(4, 4)).toBe(1.0);
  });

  it("returns 0.0 for 0% fill rate with 3+ gaps", () => {
    expect(computeWeeklyRecoveryRate(3, 0)).toBe(0.0);
  });
});

// ─────────────────────────────────────────────────────────────
// M-06: computeFillProbabilityScore
// ─────────────────────────────────────────────────────────────

describe("M-06: computeFillProbabilityScore", () => {
  it("returns null when fewer than 20 historical gaps", () => {
    const gaps = Array.from({ length: 19 }, (_, i) => ({
      day_of_week: "Monday",
      start_time: `2025-01-${String(i + 1).padStart(2, "0")}T10:00:00Z`,
      status: "filled",
    }));
    expect(computeFillProbabilityScore(gaps, "Monday", 10)).toBeNull();
  });

  it("returns null when bucket has fewer than 3 matches", () => {
    // 20 gaps total but only 2 match the target day+hour
    const gaps = [
      ...Array.from({ length: 18 }, (_, i) => ({
        day_of_week: "Tuesday",
        start_time: `2025-01-${String(i + 1).padStart(2, "0")}T10:00:00Z`,
        status: "filled",
      })),
      { day_of_week: "Monday", start_time: "2025-01-20T10:00:00Z", status: "filled" },
      { day_of_week: "Monday", start_time: "2025-01-21T10:00:00Z", status: "open" },
    ];
    expect(computeFillProbabilityScore(gaps, "Monday", 10)).toBeNull();
  });

  it("returns correct probability when data is sufficient", () => {
    // 20 gaps total, 5 matching Monday 10h, 3 filled
    const mondayGaps = [
      { day_of_week: "Monday", start_time: "2025-01-06T10:00:00Z", status: "filled" },
      { day_of_week: "Monday", start_time: "2025-01-13T10:00:00Z", status: "filled" },
      { day_of_week: "Monday", start_time: "2025-01-20T10:00:00Z", status: "filled" },
      { day_of_week: "Monday", start_time: "2025-01-27T10:00:00Z", status: "open" },
      { day_of_week: "Monday", start_time: "2025-02-03T10:00:00Z", status: "open" },
    ];
    const otherGaps = Array.from({ length: 15 }, (_, i) => ({
      day_of_week: "Tuesday",
      start_time: `2025-02-${String(i + 4).padStart(2, "0")}T14:00:00Z`,
      status: "filled",
    }));
    const result = computeFillProbabilityScore([...mondayGaps, ...otherGaps], "Monday", 10);
    expect(result).toBeCloseTo(0.6, 2); // 3 filled / 5 bucket gaps
  });
});

// ─────────────────────────────────────────────────────────────
// M-07: computeDaysUntilRenewal
// ─────────────────────────────────────────────────────────────

describe("M-07: computeDaysUntilRenewal", () => {
  it("returns null when no renewal date", () => {
    expect(computeDaysUntilRenewal(null)).toBeNull();
    expect(computeDaysUntilRenewal(undefined)).toBeNull();
  });

  it("returns ~7 days for a renewal 7 days away", () => {
    const sevenDaysOut = new Date(NOW_MS + 7 * 24 * 60 * 60 * 1000).toISOString();
    const result = computeDaysUntilRenewal(sevenDaysOut);
    expect(result).toBeCloseTo(7, 1);
  });

  it("returns negative for past renewal date", () => {
    const yesterday = new Date(NOW_MS - 1 * 24 * 60 * 60 * 1000).toISOString();
    expect(computeDaysUntilRenewal(yesterday)).toBeLessThan(0);
  });
});

// ─────────────────────────────────────────────────────────────
// M-08: computeSyncStalenessDays
// ─────────────────────────────────────────────────────────────

describe("M-08: computeSyncStalenessDays", () => {
  it("returns 999 when no last sync", () => {
    expect(computeSyncStalenessDays(null)).toBe(999);
    expect(computeSyncStalenessDays(undefined)).toBe(999);
  });

  it("returns ~2 when synced 2 days ago", () => {
    const twoDaysAgo = new Date(NOW_MS - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(computeSyncStalenessDays(twoDaysAgo)).toBeCloseTo(2, 1);
  });

  it("returns ~0 when just synced", () => {
    expect(computeSyncStalenessDays(NOW_ISO)).toBeCloseTo(0, 1);
  });
});

// ─────────────────────────────────────────────────────────────
// M-09: computeInactivityTier
// ─────────────────────────────────────────────────────────────

describe("M-09: computeInactivityTier", () => {
  it("returns 5 for cancelled users regardless of days", () => {
    expect(computeInactivityTier(0, "cancelled")).toBe(5);
    expect(computeInactivityTier(100, "cancelled")).toBe(5);
    expect(computeInactivityTier(0, "expired")).toBe(5);
  });

  it("returns 0 for ≤ 3 days inactive", () => {
    expect(computeInactivityTier(0, "active")).toBe(0);
    expect(computeInactivityTier(3, "active")).toBe(0);
  });

  it("returns 1 for 4–7 days inactive", () => {
    expect(computeInactivityTier(4, "active")).toBe(1);
    expect(computeInactivityTier(7, "active")).toBe(1);
  });

  it("returns 2 for 8–14 days inactive", () => {
    expect(computeInactivityTier(8, "active")).toBe(2);
    expect(computeInactivityTier(14, "active")).toBe(2);
  });

  it("returns 3 for 15–29 days inactive", () => {
    expect(computeInactivityTier(15, "active")).toBe(3);
    expect(computeInactivityTier(29, "active")).toBe(3);
  });

  it("returns 4 for 30+ days inactive (active subscription)", () => {
    expect(computeInactivityTier(30, "active")).toBe(4);
    expect(computeInactivityTier(90, "active")).toBe(4);
  });
});
