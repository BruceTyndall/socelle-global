import { describe, expect, it } from "vitest";
import {
  computeGaps,
  dailyLeakage,
  mergeBusyBlocks,
  monthToDateLeakage,
  rolling30DayLeakage,
  weeklyLeakage,
  type WorkingHours
} from "../src/index";

const baseWorkingHours: WorkingHours = {
  monday: { enabled: true, start: "09:00", end: "17:00" },
  tuesday: { enabled: true, start: "09:00", end: "17:00" },
  wednesday: { enabled: true, start: "09:00", end: "17:00" },
  thursday: { enabled: true, start: "09:00", end: "17:00" },
  friday: { enabled: true, start: "09:00", end: "17:00" },
  saturday: { enabled: false, start: null, end: null },
  sunday: { enabled: false, start: null, end: null }
};

describe("mergeBusyBlocks", () => {
  it("merges overlapping and adjacent blocks", () => {
    const merged = mergeBusyBlocks([
      {
        start: new Date("2026-02-16T10:00:00.000Z"),
        end: new Date("2026-02-16T11:00:00.000Z")
      },
      {
        start: new Date("2026-02-16T11:00:00.000Z"),
        end: new Date("2026-02-16T12:00:00.000Z")
      },
      {
        start: new Date("2026-02-16T12:30:00.000Z"),
        end: new Date("2026-02-16T13:00:00.000Z")
      }
    ]);

    expect(merged).toHaveLength(2);
    expect(merged[0].start.toISOString()).toBe("2026-02-16T10:00:00.000Z");
    expect(merged[0].end.toISOString()).toBe("2026-02-16T12:00:00.000Z");
  });
});

describe("computeGaps core", () => {
  it("finds gaps and computes bookable slots and leakage", () => {
    const gaps = computeGaps({
      analysisStart: new Date("2026-02-16T00:00:00.000Z"),
      analysisEnd: new Date("2026-02-16T23:59:59.000Z"),
      workingHours: baseWorkingHours,
      events: [
        {
          start: new Date("2026-02-16T10:00:00.000Z"),
          end: new Date("2026-02-16T12:00:00.000Z")
        },
        {
          start: new Date("2026-02-16T13:00:00.000Z"),
          end: new Date("2026-02-16T14:00:00.000Z")
        }
      ],
      slotDurationMinutes: 60,
      avgBookingValue: 85
    });

    // 9-10, 12-13, 14-17 => 1 + 1 + 3 slots = 5
    expect(gaps).toHaveLength(3);
    expect(gaps.reduce((sum, g) => sum + g.bookableSlots, 0)).toBe(5);
    expect(weeklyLeakage(gaps)).toBe(5 * 85);
  });

  it("clips events outside working hours", () => {
    const gaps = computeGaps({
      analysisStart: new Date("2026-02-16T00:00:00.000Z"),
      analysisEnd: new Date("2026-02-16T23:59:59.000Z"),
      workingHours: baseWorkingHours,
      events: [
        {
          start: new Date("2026-02-16T07:00:00.000Z"),
          end: new Date("2026-02-16T10:00:00.000Z")
        },
        {
          start: new Date("2026-02-16T16:00:00.000Z"),
          end: new Date("2026-02-16T20:00:00.000Z")
        }
      ],
      slotDurationMinutes: 60,
      avgBookingValue: 100
    });

    // Busy should be clipped to 9-10 and 16-17, leaving 10-16 gap only.
    expect(gaps).toHaveLength(1);
    expect(gaps[0].bookableSlots).toBe(6);
    expect(gaps[0].leakageValue).toBe(600);
  });

  it("ignores gaps smaller than slot duration", () => {
    const gaps = computeGaps({
      analysisStart: new Date("2026-02-16T00:00:00.000Z"),
      analysisEnd: new Date("2026-02-16T23:59:59.000Z"),
      workingHours: baseWorkingHours,
      events: [
        {
          start: new Date("2026-02-16T09:00:00.000Z"),
          end: new Date("2026-02-16T09:55:00.000Z")
        },
        {
          start: new Date("2026-02-16T10:00:00.000Z"),
          end: new Date("2026-02-16T17:00:00.000Z")
        }
      ],
      slotDurationMinutes: 60,
      avgBookingValue: 80
    });

    expect(gaps).toHaveLength(0);
  });

  it("treats all-day events as fully busy", () => {
    const gaps = computeGaps({
      analysisStart: new Date("2026-02-16T00:00:00.000Z"),
      analysisEnd: new Date("2026-02-16T23:59:59.000Z"),
      workingHours: baseWorkingHours,
      events: [
        {
          start: new Date("2026-02-16T00:00:00.000Z"),
          end: new Date("2026-02-16T23:59:59.000Z"),
          allDay: true
        }
      ],
      slotDurationMinutes: 60,
      avgBookingValue: 100
    });

    expect(gaps).toHaveLength(0);
  });

  it("does not block unrelated days for single-day all-day events", () => {
    const gaps = computeGaps({
      analysisStart: new Date("2026-02-16T00:00:00.000Z"),
      analysisEnd: new Date("2026-02-17T23:59:59.000Z"),
      workingHours: baseWorkingHours,
      events: [
        {
          start: new Date("2026-02-17T00:00:00.000Z"),
          end: new Date("2026-02-18T00:00:00.000Z"),
          allDay: true
        }
      ],
      slotDurationMinutes: 60,
      avgBookingValue: 100
    });

    expect(gaps).toHaveLength(1);
    expect(gaps[0].dayOfWeek).toBe("monday");
    expect(gaps[0].bookableSlots).toBe(8);
    expect(gaps[0].leakageValue).toBe(800);
  });

  it("returns full-day gap when no events exist", () => {
    const gaps = computeGaps({
      analysisStart: new Date("2026-02-16T00:00:00.000Z"),
      analysisEnd: new Date("2026-02-16T23:59:59.000Z"),
      workingHours: baseWorkingHours,
      events: [],
      slotDurationMinutes: 60,
      avgBookingValue: 90
    });

    expect(gaps).toHaveLength(1);
    expect(gaps[0].bookableSlots).toBe(8);
    expect(gaps[0].leakageValue).toBe(720);
  });

  it("marks intentional gaps and excludes them from leakage", () => {
    const gaps = computeGaps({
      analysisStart: new Date("2026-02-16T00:00:00.000Z"),
      analysisEnd: new Date("2026-02-16T23:59:59.000Z"),
      workingHours: baseWorkingHours,
      events: [
        {
          start: new Date("2026-02-16T09:00:00.000Z"),
          end: new Date("2026-02-16T12:00:00.000Z")
        },
        {
          start: new Date("2026-02-16T13:00:00.000Z"),
          end: new Date("2026-02-16T17:00:00.000Z")
        }
      ],
      slotDurationMinutes: 60,
      avgBookingValue: 100,
      intentionalRules: [
        {
          dayOfWeek: "monday",
          approxStartMinutes: 12 * 60,
          approxEndMinutes: 13 * 60,
          reason: "lunch"
        }
      ]
    });

    expect(gaps).toHaveLength(1);
    expect(gaps[0].intentional).toBe(true);
    expect(gaps[0].intentionalReason).toBe("lunch");
    expect(gaps[0].leakageValue).toBe(0);
    expect(weeklyLeakage(gaps)).toBe(0);
  });
});

describe("leakage aggregations", () => {
  it("calculates daily, rolling 30-day, and month-to-date leakage", () => {
    const gaps = computeGaps({
      analysisStart: new Date("2026-02-02T00:00:00.000Z"),
      analysisEnd: new Date("2026-02-04T23:59:59.000Z"),
      workingHours: baseWorkingHours,
      events: [
        {
          start: new Date("2026-02-02T10:00:00.000Z"),
          end: new Date("2026-02-02T17:00:00.000Z")
        },
        {
          start: new Date("2026-02-03T09:00:00.000Z"),
          end: new Date("2026-02-03T17:00:00.000Z")
        },
        {
          start: new Date("2026-02-04T12:00:00.000Z"),
          end: new Date("2026-02-04T17:00:00.000Z")
        }
      ],
      slotDurationMinutes: 60,
      avgBookingValue: 50
    });

    const dayOne = dailyLeakage(gaps, new Date("2026-02-02T12:00:00.000Z"));
    expect(dayOne).toBe(50); // only 9-10

    const rolling = rolling30DayLeakage(gaps, new Date("2026-02-20T00:00:00.000Z"));
    const mtd = monthToDateLeakage(gaps, new Date("2026-02-20T00:00:00.000Z"));

    expect(rolling).toBe(200);
    expect(mtd).toBe(200);
  });
});
