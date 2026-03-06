import {
  computeGaps,
  weeklyLeakage,
  type CalendarEvent,
  type IntentionalRule,
  type WorkingHours
} from "../../../gap_engine/src/index.js";
import { SyncCalendarEventsResponseSchema } from "../../../shared/src/index.js";
import type { CalendarSyncAdapter } from "./adapters.js";

export interface RunSyncParams {
  userId: string;
  startIso: string;
  endIso: string;
  slotDurationMinutes: number;
  avgBookingValue: number;
  workingHours: WorkingHours;
  intentionalRules?: IntentionalRule[];
  /// Pre-parsed Apple Calendar events from the mobile app.
  deviceEvents?: CalendarEvent[];
  /** IANA timezone e.g. "America/New_York". Defaults to "UTC" if omitted. */
  timezone?: string;
}

export interface RunSyncDeps {
  adapter: CalendarSyncAdapter;
}

function toEventPayload(event: CalendarEvent) {
  return {
    startIso: event.start.toISOString(),
    endIso: event.end.toISOString(),
    ...(event.allDay ? { allDay: true } : {})
  };
}

export async function runCalendarSync(params: RunSyncParams, deps: RunSyncDeps) {
  const start = new Date(params.startIso);
  const end = new Date(params.endIso);
  const currentWeekEnd = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);

  const events = await deps.adapter.fetchEvents({
    userId: params.userId,
    start,
    end,
    deviceEvents: params.deviceEvents
  });

  const gaps = computeGaps({
    analysisStart: start,
    analysisEnd: end,
    workingHours: params.workingHours,
    events,
    slotDurationMinutes: params.slotDurationMinutes,
    avgBookingValue: params.avgBookingValue,
    intentionalRules: params.intentionalRules,
    timezone: params.timezone
  });

  const currentWeekGaps = gaps.filter(
    (gap) => gap.start.getTime() >= start.getTime() && gap.start.getTime() < currentWeekEnd.getTime()
  );

  const normalized = {
    ok: true as const,
    events: events.map(toEventPayload),
    gaps: gaps.map((gap) => ({
      startIso: gap.start.toISOString(),
      endIso: gap.end.toISOString(),
      durationMinutes: gap.durationMinutes,
      bookableSlots: gap.bookableSlots,
      leakageValue: gap.leakageValue,
      dayOfWeek: gap.dayOfWeek,
      intentional: gap.intentional,
      ...(gap.intentionalReason ? { intentionalReason: gap.intentionalReason } : {})
    })),
    totals: {
      gapCount: currentWeekGaps.length,
      totalBookableSlots: currentWeekGaps.reduce(
        (sum, gap) => sum + gap.bookableSlots,
        0
      ),
      weeklyLeakage: weeklyLeakage(currentWeekGaps)
    }
  };

  return SyncCalendarEventsResponseSchema.parse(normalized);
}
