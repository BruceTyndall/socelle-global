export type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type IntentionalReason = "lunch" | "buffer" | "personal" | "other";

export interface TimeBlock {
  start: Date;
  end: Date;
}

export interface WorkingDayConfig {
  enabled: boolean;
  start: string | null;
  end: string | null;
}

export type WorkingHours = Record<DayKey, WorkingDayConfig>;

export interface CalendarEvent {
  start: Date;
  end: Date;
  allDay?: boolean;
}

export interface GapCandidate {
  start: Date;
  end: Date;
  durationMinutes: number;
  bookableSlots: number;
  leakageValue: number;
  dayOfWeek: DayKey;
  intentional: boolean;
  intentionalReason?: IntentionalReason | null;
}

export interface IntentionalRule {
  dayOfWeek: DayKey;
  approxStartMinutes: number;
  approxEndMinutes: number;
  reason?: IntentionalReason;
}

export interface GapEngineInput {
  analysisStart: Date;
  analysisEnd: Date;
  workingHours: WorkingHours;
  events: CalendarEvent[];
  slotDurationMinutes: number;
  avgBookingValue: number;
  intentionalRules?: IntentionalRule[];
  /** IANA timezone e.g. "America/New_York". Defaults to "UTC" if omitted. */
  timezone?: string;
}

const DAY_KEYS: DayKey[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday"
];

function startOfDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0)
  );
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function minutesToDate(dayStart: Date, minutes: number): Date {
  return new Date(dayStart.getTime() + minutes * 60_000);
}

function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function getDayKey(date: Date): DayKey {
  return DAY_KEYS[date.getUTCDay()] as DayKey;
}

/**
 * Returns the IANA day key ("monday" etc.) for a UTC Date as seen in the
 * given timezone. Fixes the edge case where UTC midnight and local midnight
 * fall on different calendar days.
 */
function getDayKeyInTimezone(date: Date, timezone: string): DayKey {
  const localDayName = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long"
  })
    .format(date)
    .toLowerCase();
  return localDayName as DayKey;
}

/**
 * Converts a naive "HH:MM" local time on a given UTC day to a UTC Date.
 * Uses Node's built-in Intl API — no external timezone packages required.
 *
 * Strategy: build a trial UTC instant that treats the local HH:MM as UTC,
 * then measure how much the timezone drifts from that trial and correct once.
 * Single-pass; handles DST correctly for working-hours granularity.
 */
function localHHMMtoUTC(dayUTC: Date, hhMM: string, timezone: string): Date {
  const localDateStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(dayUTC); // "YYYY-MM-DD"

  const [h, m] = hhMM.split(":").map(Number);
  const trial = new Date(
    `${localDateStr}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00Z`
  );

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(trial);

  const rH = Number(parts.find((p) => p.type === "hour")!.value) % 24;
  const rM = Number(parts.find((p) => p.type === "minute")!.value);

  const driftMs = (rH * 60 + rM - (h * 60 + m)) * 60_000;
  return new Date(trial.getTime() - driftMs);
}

function getOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): TimeBlock | null {
  const start = new Date(Math.max(aStart.getTime(), bStart.getTime()));
  const end = new Date(Math.min(aEnd.getTime(), bEnd.getTime()));
  return start < end ? { start, end } : null;
}

function normalizeIntentionalReason(value: unknown): IntentionalReason | null {
  if (value === "lunch" || value === "buffer" || value === "personal" || value === "other") {
    return value;
  }
  return null;
}

function matchIntentionalRule(
  dayOfWeek: DayKey,
  gapStartMinutes: number,
  gapEndMinutes: number,
  rules: IntentionalRule[],
  toleranceMinutes = 30
): IntentionalRule | null {
  for (const rule of rules) {
    if (rule.dayOfWeek !== dayOfWeek) {
      continue;
    }

    const startClose = Math.abs(rule.approxStartMinutes - gapStartMinutes) <= toleranceMinutes;
    const endClose = Math.abs(rule.approxEndMinutes - gapEndMinutes) <= toleranceMinutes;

    if (startClose && endClose) {
      return rule;
    }
  }

  return null;
}

export function mergeBusyBlocks(blocks: TimeBlock[]): TimeBlock[] {
  if (blocks.length <= 1) {
    return blocks.map((block) => ({ ...block }));
  }

  const sorted = [...blocks].sort((a, b) => a.start.getTime() - b.start.getTime());
  const merged: TimeBlock[] = [{ ...sorted[0] }];

  for (const block of sorted.slice(1)) {
    const last = merged[merged.length - 1];
    if (block.start.getTime() <= last.end.getTime()) {
      if (block.end.getTime() > last.end.getTime()) {
        last.end = block.end;
      }
      continue;
    }

    merged.push({ ...block });
  }

  return merged;
}

export function computeGaps(input: GapEngineInput): GapCandidate[] {
  const {
    analysisStart,
    analysisEnd,
    workingHours,
    events,
    slotDurationMinutes,
    avgBookingValue,
    intentionalRules = [],
    timezone
  } = input;

  if (slotDurationMinutes <= 0) {
    throw new Error("slotDurationMinutes must be > 0");
  }

  // Use timezone-aware helpers when a timezone is supplied, UTC fallback otherwise.
  const tz = timezone && timezone !== "UTC" ? timezone : null;

  const out: GapCandidate[] = [];
  let day = startOfDay(analysisStart);
  const finalDay = startOfDay(analysisEnd);

  while (day <= finalDay) {
    const dayKey = tz ? getDayKeyInTimezone(day, tz) : getDayKey(day);
    const config = workingHours[dayKey];

    if (config?.enabled && config.start && config.end) {
      const workingStart = tz
        ? localHHMMtoUTC(day, config.start, tz)
        : minutesToDate(day, hhmmToMinutes(config.start));
      const workingEnd = tz
        ? localHHMMtoUTC(day, config.end, tz)
        : minutesToDate(day, hhmmToMinutes(config.end));

      if (workingEnd > workingStart) {
        const busyBlocks: TimeBlock[] = [];

        for (const event of events) {
          const clipped = getOverlap(
            event.start,
            event.end,
            workingStart,
            workingEnd
          );

          if (clipped && clipped.end > clipped.start) {
            busyBlocks.push(clipped);
          }
        }

        const mergedBusy = mergeBusyBlocks(busyBlocks);

        const gapBlocks: TimeBlock[] = [];
        let cursor = workingStart;

        for (const block of mergedBusy) {
          if (block.start > cursor) {
            gapBlocks.push({ start: cursor, end: block.start });
          }
          if (block.end > cursor) {
            cursor = block.end;
          }
        }

        if (cursor < workingEnd) {
          gapBlocks.push({ start: cursor, end: workingEnd });
        }

        for (const gapBlock of gapBlocks) {
          const candidateStart = gapBlock.start;
          const candidateEnd = gapBlock.end;

          const durationMinutes = Math.floor(
            (candidateEnd.getTime() - candidateStart.getTime()) / 60_000
          );
          const bookableSlots = Math.floor(durationMinutes / slotDurationMinutes);

          if (bookableSlots < 1) {
            continue;
          }

          const startMinutes =
            candidateStart.getUTCHours() * 60 + candidateStart.getUTCMinutes();
          const endMinutes =
            candidateEnd.getUTCHours() * 60 + candidateEnd.getUTCMinutes();

          const matchedIntentionalRule = matchIntentionalRule(
            dayKey,
            startMinutes,
            endMinutes,
            intentionalRules
          );
          const intentional = matchedIntentionalRule !== null;
          const intentionalReason = intentional
            ? normalizeIntentionalReason(matchedIntentionalRule?.reason)
            : null;

          out.push({
            start: candidateStart,
            end: candidateEnd,
            durationMinutes,
            bookableSlots,
            leakageValue: intentional ? 0 : bookableSlots * avgBookingValue,
            dayOfWeek: dayKey,
            intentional,
            intentionalReason
          });
        }
      }
    }

    day = addDays(day, 1);
  }

  return out.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function dailyLeakage(gaps: GapCandidate[], day: Date): number {
  const dayStart = startOfDay(day).getTime();
  const nextDay = addDays(startOfDay(day), 1).getTime();
  return gaps
    .filter(
      (gap) =>
        !gap.intentional &&
        gap.start.getTime() >= dayStart &&
        gap.start.getTime() < nextDay
    )
    .reduce((sum, gap) => sum + gap.leakageValue, 0);
}

export function weeklyLeakage(gaps: GapCandidate[]): number {
  return gaps
    .filter((gap) => !gap.intentional)
    .reduce((sum, gap) => sum + gap.leakageValue, 0);
}

export function rolling30DayLeakage(gaps: GapCandidate[], now: Date): number {
  const threshold = now.getTime() - 30 * 24 * 60 * 60 * 1000;
  return gaps
    .filter((gap) => !gap.intentional && gap.start.getTime() >= threshold)
    .reduce((sum, gap) => sum + gap.leakageValue, 0);
}

export function monthToDateLeakage(gaps: GapCandidate[], now: Date): number {
  const monthStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
  const nextMonthStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1);
  return gaps
    .filter(
      (gap) =>
        !gap.intentional &&
        gap.start.getTime() >= monthStart &&
        gap.start.getTime() < nextMonthStart
    )
    .reduce((sum, gap) => sum + gap.leakageValue, 0);
}
