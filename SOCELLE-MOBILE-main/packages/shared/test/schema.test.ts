import { describe, expect, it } from "vitest";
import {
  GapDocumentSchema,
  StoreCalendarTokensRequestSchema,
  SyncCalendarEventsRequestSchema,
  SyncCalendarEventsResponseSchema,
  UpdateGapStatusRequestSchema,
  UpdateGapStatusResponseSchema,
  UserDocumentSchema,
  UserSettingsSchema
} from "../src/index";

describe("UserSettingsSchema", () => {
  it("accepts a valid settings object", () => {
    const parsed = UserSettingsSchema.parse({
      avgBookingValue: 85,
      slotDurationMinutes: 60,
      timezone: "America/New_York",
      calendarSource: "google"
    });

    expect(parsed.slotDurationMinutes).toBe(60);
  });

  it("rejects negative booking values", () => {
    expect(() =>
      UserSettingsSchema.parse({
        avgBookingValue: -1,
        slotDurationMinutes: 60,
        timezone: "America/New_York",
        calendarSource: "google"
      })
    ).toThrow();
  });
});

describe("GapDocumentSchema", () => {
  it("accepts a valid gap payload", () => {
    const parsed = GapDocumentSchema.parse({
      user_id: "uid_123",
      date: "2026-02-18T00:00:00.000Z",
      start_time: "2026-02-18T14:00:00.000Z",
      end_time: "2026-02-18T15:00:00.000Z",
      duration_minutes: 60,
      bookable_slots: 1,
      leakage_value: 85,
      status: "open",
      week_key: "2026-W08"
    });

    expect(parsed.status).toBe("open");
  });
});

describe("UserDocumentSchema", () => {
  it("accepts valid user document payload", () => {
    const parsed = UserDocumentSchema.parse({
      subscription_status: "trial",
      onboarding_complete: true,
      settings: {
        avgBookingValue: 90,
        slotDurationMinutes: 60,
        timezone: "America/New_York",
        calendarSource: "google"
      }
    });

    expect(parsed.settings.calendarSource).toBe("google");
  });
});

describe("Callable request schemas", () => {
  it("accepts valid token store payload", () => {
    const parsed = StoreCalendarTokensRequestSchema.parse({
      calendarSource: "google",
      tokenPayload: { refreshToken: "ciphertext" }
    });
    expect(parsed.calendarSource).toBe("google");
  });

  it("rejects invalid sync date payload", () => {
    expect(() =>
      SyncCalendarEventsRequestSchema.parse({
        calendarSource: "google",
        startIso: "not-an-iso-date",
        endIso: "2026-02-18T00:00:00.000Z",
        slotDurationMinutes: 60,
        avgBookingValue: 85,
        workingHours: {
          monday: { enabled: true, start: "09:00", end: "17:00" },
          tuesday: { enabled: true, start: "09:00", end: "17:00" },
          wednesday: { enabled: true, start: "09:00", end: "17:00" },
          thursday: { enabled: true, start: "09:00", end: "17:00" },
          friday: { enabled: true, start: "09:00", end: "17:00" },
          saturday: { enabled: false, start: null, end: null },
          sunday: { enabled: false, start: null, end: null }
        }
      })
    ).toThrow();
  });

  it("accepts sync response payload", () => {
    const parsed = SyncCalendarEventsResponseSchema.parse({
      ok: true,
      events: [
        {
          startIso: "2026-02-16T10:00:00.000Z",
          endIso: "2026-02-16T12:00:00.000Z"
        }
      ],
      gaps: [
        {
          gapId: "uid_123_20260216T090000000Z_20260216T100000000Z",
          startIso: "2026-02-16T09:00:00.000Z",
          endIso: "2026-02-16T10:00:00.000Z",
          durationMinutes: 60,
          bookableSlots: 1,
          leakageValue: 85,
          dayOfWeek: "monday",
          intentional: false,
          status: "open",
          intentionalReason: null
        }
      ],
      totals: {
        gapCount: 1,
        totalBookableSlots: 1,
        weeklyLeakage: 85
      }
    });

    expect(parsed.ok).toBe(true);
  });

  it("accepts updateGapStatus payloads", () => {
    const request = UpdateGapStatusRequestSchema.parse({
      startIso: "2026-02-16T09:00:00.000Z",
      endIso: "2026-02-16T10:00:00.000Z",
      status: "intentional",
      intentionalReason: "lunch"
    });
    const response = UpdateGapStatusResponseSchema.parse({ ok: true });

    expect(request.status).toBe("intentional");
    expect(response.ok).toBe(true);
  });
});
