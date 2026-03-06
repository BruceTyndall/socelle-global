import { describe, expect, it } from "vitest";
import { runCalendarSync } from "../src/sync/orchestrator";
import type { CalendarSyncAdapter } from "../src/sync/adapters";

const workingHours = {
  monday: { enabled: true, start: "09:00", end: "17:00" },
  tuesday: { enabled: true, start: "09:00", end: "17:00" },
  wednesday: { enabled: true, start: "09:00", end: "17:00" },
  thursday: { enabled: true, start: "09:00", end: "17:00" },
  friday: { enabled: true, start: "09:00", end: "17:00" },
  saturday: { enabled: false, start: null, end: null },
  sunday: { enabled: false, start: null, end: null }
} as const;

describe("runCalendarSync", () => {
  it("returns normalized gaps and totals from adapter events", async () => {
    const adapter: CalendarSyncAdapter = {
      fetchEvents: async () => [
        {
          start: new Date("2026-02-16T10:00:00.000Z"),
          end: new Date("2026-02-16T11:00:00.000Z")
        },
        {
          start: new Date("2026-02-16T13:00:00.000Z"),
          end: new Date("2026-02-16T14:00:00.000Z")
        }
      ]
    };

    const result = await runCalendarSync(
      {
        userId: "uid_1",
        startIso: "2026-02-16T00:00:00.000Z",
        endIso: "2026-02-16T23:59:59.000Z",
        slotDurationMinutes: 60,
        avgBookingValue: 100,
        workingHours
      },
      { adapter }
    );

    expect(result.ok).toBe(true);
    expect(result.events).toHaveLength(2);
    expect(result.totals.gapCount).toBe(3);
    expect(result.totals.totalBookableSlots).toBe(6);
    expect(result.totals.weeklyLeakage).toBe(600);
  });

  it("computes totals from the first week only when sync range spans two weeks", async () => {
    const mondayOnlyWorkingHours = {
      monday: { enabled: true, start: "09:00", end: "17:00" },
      tuesday: { enabled: false, start: null, end: null },
      wednesday: { enabled: false, start: null, end: null },
      thursday: { enabled: false, start: null, end: null },
      friday: { enabled: false, start: null, end: null },
      saturday: { enabled: false, start: null, end: null },
      sunday: { enabled: false, start: null, end: null }
    } as const;

    const adapter: CalendarSyncAdapter = {
      fetchEvents: async () => [
        {
          start: new Date("2026-02-16T09:00:00.000Z"),
          end: new Date("2026-02-16T17:00:00.000Z")
        }
      ]
    };

    const result = await runCalendarSync(
      {
        userId: "uid_2",
        startIso: "2026-02-16T00:00:00.000Z",
        endIso: "2026-03-01T23:59:59.000Z",
        slotDurationMinutes: 60,
        avgBookingValue: 100,
        workingHours: mondayOnlyWorkingHours
      },
      { adapter }
    );

    // Second Monday (2026-02-23) is open and appears in gaps payload,
    // but totals should represent the current week only.
    expect(result.gaps).toHaveLength(1);
    expect(result.totals.gapCount).toBe(0);
    expect(result.totals.totalBookableSlots).toBe(0);
    expect(result.totals.weeklyLeakage).toBe(0);
  });
});
