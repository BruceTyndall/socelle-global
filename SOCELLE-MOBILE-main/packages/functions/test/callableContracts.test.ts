import { describe, expect, it, vi } from "vitest";
import { HttpsError } from "firebase-functions/v2/https";

// ── Firebase stubs — prevent module-level getFirestore() from throwing ────────
vi.mock("firebase-admin/firestore", () => ({
  getFirestore: vi.fn(() => ({
    doc: vi.fn(() => ({
      get: vi.fn(async () => ({ exists: false, data: () => undefined })),
      set: vi.fn(async () => {}),
      update: vi.fn(async () => {}),
    })),
    collection: vi.fn(() => ({
      where: vi.fn().mockReturnThis(),
      get: vi.fn(async () => ({ docs: [], size: 0 })),
    })),
  })),
  FieldValue: {
    serverTimestamp: vi.fn(),
    arrayUnion: vi.fn(),
    increment: vi.fn(),
    delete: vi.fn(),
  },
  Timestamp: { now: vi.fn(() => ({ toDate: () => new Date() })) },
}));

vi.mock("firebase-functions", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock("firebase-functions/v2/scheduler", () => ({
  onSchedule: vi.fn((_opts: unknown, handler: unknown) => handler),
}));
import {
  handleUpdateGapStatusCallable,
  handleSyncCalendarEventsCallable,
  handleRevokeCalendarTokens,
  handleStoreCalendarTokens,
  handleSyncCalendarEvents
} from "../src/index";
import type { CalendarSyncAdapter } from "../src/sync/adapters.js";
import type { SyncPersistence } from "../src/sync/persistence.js";

const workingHours = {
  monday: { enabled: true, start: "09:00", end: "17:00" },
  tuesday: { enabled: true, start: "09:00", end: "17:00" },
  wednesday: { enabled: true, start: "09:00", end: "17:00" },
  thursday: { enabled: true, start: "09:00", end: "17:00" },
  friday: { enabled: true, start: "09:00", end: "17:00" },
  saturday: { enabled: false, start: null, end: null },
  sunday: { enabled: false, start: null, end: null }
} as const;

describe("callable contract validation", () => {
  it("accepts valid storeCalendarTokens payload", () => {
    const result = handleStoreCalendarTokens({
      calendarSource: "google",
      tokenPayload: { refreshToken: "ciphertext" }
    });

    expect(result).toEqual({ ok: true });
  });

  it("rejects invalid syncCalendarEvents payload", () => {
    expect(() =>
      handleSyncCalendarEvents({
        calendarSource: "google",
        startIso: "bad-date",
        endIso: "2026-02-18T00:00:00.000Z",
        slotDurationMinutes: 60,
        avgBookingValue: 85,
        workingHours
      })
    ).toThrow(HttpsError);
  });

  it("accepts valid revokeCalendarTokens payload", () => {
    const result = handleRevokeCalendarTokens({ calendarSource: "apple" });
    expect(result.ok).toBe(true);
  });

  it("runs sync orchestration for authenticated user", async () => {
    const adapter: CalendarSyncAdapter = {
      fetchEvents: async () => [
        {
          start: new Date("2026-02-16T10:00:00.000Z"),
          end: new Date("2026-02-16T12:00:00.000Z")
        }
      ]
    };

    const persistence: SyncPersistence = {
      replaceGapsInRange: async () => [],
      updateGapStatus: async () => {},
      listIntentionalRules: async () => [],
      upsertIntentionalRule: async () => {},
      updateUserSyncStats: async () => {}
    };

    const result = await handleSyncCalendarEventsCallable(
      {
        data: {
          calendarSource: "google",
          startIso: "2026-02-16T00:00:00.000Z",
          endIso: "2026-02-16T23:59:59.000Z",
          slotDurationMinutes: 60,
          avgBookingValue: 85,
          workingHours
        },
        auth: { uid: "uid_test", token: {} } as never
      } as never,
      adapter,
      persistence
    );

    expect(result.ok).toBe(true);
    expect(result.gaps.length).toBeGreaterThan(0);
    expect(result.totals.weeklyLeakage).toBeGreaterThan(0);
  });

  it("rejects sync orchestration without auth", async () => {
    const persistence: SyncPersistence = {
      replaceGapsInRange: async () => [],
      updateGapStatus: async () => {},
      listIntentionalRules: async () => [],
      upsertIntentionalRule: async () => {},
      updateUserSyncStats: async () => {}
    };

    await expect(
      handleSyncCalendarEventsCallable(
        {
          data: {
            calendarSource: "google",
            startIso: "2026-02-16T00:00:00.000Z",
            endIso: "2026-02-16T23:59:59.000Z",
            slotDurationMinutes: 60,
            avgBookingValue: 85,
            workingHours
          },
          auth: null
        } as never,
        undefined,
        persistence
      )
    ).rejects.toBeInstanceOf(HttpsError);
  });

  it("persists normalized gaps and sync stats after sync", async () => {
    const adapter: CalendarSyncAdapter = {
      fetchEvents: async () => [
        {
          start: new Date("2026-02-16T10:00:00.000Z"),
          end: new Date("2026-02-16T12:00:00.000Z")
        }
      ]
    };

    const calls: { gaps: number; stats: number } = { gaps: 0, stats: 0 };
    const persistence: SyncPersistence = {
      replaceGapsInRange: async ({ gaps }) => {
        calls.gaps = gaps.length;
        return [];
      },
      updateGapStatus: async () => {},
      listIntentionalRules: async () => [],
      upsertIntentionalRule: async () => {},
      updateUserSyncStats: async () => {
        calls.stats += 1;
      }
    };

    await handleSyncCalendarEventsCallable(
      {
        data: {
          calendarSource: "google",
          startIso: "2026-02-16T00:00:00.000Z",
          endIso: "2026-02-16T23:59:59.000Z",
          slotDurationMinutes: 60,
          avgBookingValue: 85,
          workingHours
        },
        auth: { uid: "uid_persist", token: {} } as never
      } as never,
      adapter,
      persistence
    );

    expect(calls.gaps).toBeGreaterThan(0);
    expect(calls.stats).toBe(1);
  });

  it("merges persisted status data into sync response totals", async () => {
    const adapter: CalendarSyncAdapter = {
      fetchEvents: async () => [
        {
          start: new Date("2026-02-16T10:00:00.000Z"),
          end: new Date("2026-02-16T12:00:00.000Z")
        }
      ]
    };

    const persistence: SyncPersistence = {
      replaceGapsInRange: async ({ gaps, userId }) =>
        gaps.map((gap, idx) => ({
          gapId: `${userId}_gap_${idx}`,
          startIso: gap.startIso,
          endIso: gap.endIso,
          status: idx === 0 ? "filled" : "open",
          intentionalReason: null
        })),
      updateGapStatus: async () => {},
      listIntentionalRules: async () => [],
      upsertIntentionalRule: async () => {},
      updateUserSyncStats: async () => {}
    };

    const result = await handleSyncCalendarEventsCallable(
      {
        data: {
          calendarSource: "google",
          startIso: "2026-02-16T00:00:00.000Z",
          endIso: "2026-02-16T23:59:59.000Z",
          slotDurationMinutes: 60,
          avgBookingValue: 85,
          workingHours
        },
        auth: { uid: "uid_merge", token: {} } as never
      } as never,
      adapter,
      persistence
    );

    const openGaps = result.gaps.filter((gap) => gap.status === "open");
    expect(result.gaps[0]?.gapId).toBe("uid_merge_gap_0");
    expect(result.gaps[0]?.status).toBe("filled");
    expect(result.totals.gapCount).toBe(openGaps.length);
    expect(result.totals.weeklyLeakage).toBe(
      openGaps.reduce((sum, gap) => sum + gap.leakageValue, 0)
    );
  });

  it("applies stored intentional rules during sync", async () => {
    const adapter: CalendarSyncAdapter = {
      fetchEvents: async () => []
    };

    const persistence: SyncPersistence = {
      replaceGapsInRange: async () => [],
      updateGapStatus: async () => {},
      listIntentionalRules: async () => [
        {
          dayOfWeek: "monday",
          approxStartMinutes: 9 * 60,
          approxEndMinutes: 17 * 60,
          reason: "lunch",
          active: true
        }
      ],
      upsertIntentionalRule: async () => {},
      updateUserSyncStats: async () => {}
    };

    const result = await handleSyncCalendarEventsCallable(
      {
        data: {
          calendarSource: "google",
          startIso: "2026-02-16T00:00:00.000Z",
          endIso: "2026-02-16T23:59:59.000Z",
          slotDurationMinutes: 60,
          avgBookingValue: 85,
          workingHours
        },
        auth: { uid: "uid_rules", token: {} } as never
      } as never,
      adapter,
      persistence
    );

    expect(result.gaps).toHaveLength(1);
    expect(result.gaps[0]?.intentional).toBe(true);
    expect(result.gaps[0]?.status).toBe("intentional");
    expect(result.gaps[0]?.intentionalReason).toBe("lunch");
    expect(result.totals.gapCount).toBe(0);
    expect(result.totals.weeklyLeakage).toBe(0);
  });

  it("updates a gap status for authenticated user", async () => {
    let call:
      | {
          userId: string;
          startIso: string;
          endIso: string;
          status: "open" | "filled" | "intentional";
          intentionalReason?: "lunch" | "buffer" | "personal" | "other" | null;
        }
      | undefined;
    let ruleCall:
      | {
          userId: string;
          dayOfWeek: string;
          approxStartMinutes: number;
          approxEndMinutes: number;
          reason: "lunch" | "buffer" | "personal" | "other";
        }
      | undefined;

    const persistence: SyncPersistence = {
      replaceGapsInRange: async () => [],
      updateGapStatus: async (params) => {
        call = params;
      },
      listIntentionalRules: async () => [],
      upsertIntentionalRule: async (params) => {
        ruleCall = params;
      },
      updateUserSyncStats: async () => {}
    };

    const result = await handleUpdateGapStatusCallable(
      {
        data: {
          startIso: "2026-02-16T09:00:00.000Z",
          endIso: "2026-02-16T10:00:00.000Z",
          status: "intentional",
          intentionalReason: "lunch"
        },
        auth: { uid: "uid_update", token: {} } as never
      } as never,
      persistence
    );

    expect(result.ok).toBe(true);
    expect(call?.userId).toBe("uid_update");
    expect(call?.status).toBe("intentional");
    expect(call?.intentionalReason).toBe("lunch");
    expect(ruleCall?.userId).toBe("uid_update");
    expect(ruleCall?.dayOfWeek).toBe("monday");
    expect(ruleCall?.approxStartMinutes).toBe(9 * 60);
    expect(ruleCall?.approxEndMinutes).toBe(10 * 60);
    expect(ruleCall?.reason).toBe("lunch");
  });

  it("rejects updateGapStatus without auth", async () => {
    const persistence: SyncPersistence = {
      replaceGapsInRange: async () => [],
      updateGapStatus: async () => {},
      listIntentionalRules: async () => [],
      upsertIntentionalRule: async () => {},
      updateUserSyncStats: async () => {}
    };

    await expect(
      handleUpdateGapStatusCallable(
        {
          data: {
            startIso: "2026-02-16T09:00:00.000Z",
            endIso: "2026-02-16T10:00:00.000Z",
            status: "open"
          },
          auth: null
        } as never,
        persistence
      )
    ).rejects.toBeInstanceOf(HttpsError);
  });

  it("rejects intentional status update without a reason", async () => {
    const persistence: SyncPersistence = {
      replaceGapsInRange: async () => [],
      updateGapStatus: async () => {},
      listIntentionalRules: async () => [],
      upsertIntentionalRule: async () => {},
      updateUserSyncStats: async () => {}
    };

    await expect(
      handleUpdateGapStatusCallable(
        {
          data: {
            startIso: "2026-02-16T09:00:00.000Z",
            endIso: "2026-02-16T10:00:00.000Z",
            status: "intentional"
          },
          auth: { uid: "uid_missing_reason", token: {} } as never
        } as never,
        persistence
      )
    ).rejects.toBeInstanceOf(HttpsError);
  });
});
