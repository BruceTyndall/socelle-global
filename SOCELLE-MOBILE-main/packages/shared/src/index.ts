import { z } from "zod";

const DayKeySchema = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
]);

export const WorkingDaySchema = z
  .object({
  enabled: z.boolean(),
  start: z.string().nullable(),
  end: z.string().nullable()
  })
  .strict();

export const WorkingHoursSchema = z
  .object({
    monday: WorkingDaySchema,
    tuesday: WorkingDaySchema,
    wednesday: WorkingDaySchema,
    thursday: WorkingDaySchema,
    friday: WorkingDaySchema,
    saturday: WorkingDaySchema,
    sunday: WorkingDaySchema
  })
  .strict();

export const UserSettingsSchema = z
  .object({
    avgBookingValue: z.number().nonnegative(),
    slotDurationMinutes: z.number().int().positive(),
    timezone: z.string().min(1),
    calendarSource: z.enum(["google", "apple"]),
    googleRefreshTokenCiphertext: z.string().min(1).optional(),
    googleRefreshTokenKid: z.string().min(1).optional(),
    googleTokenRotatedAt: z.string().datetime().optional(),
    googleTokenRevokedAt: z.string().datetime().nullable().optional(),
    workingHours: WorkingHoursSchema.optional()
  })
  .strict();

export const GapStatusSchema = z.enum(["open", "filled", "intentional"]);

export const GapDocumentSchema = z
  .object({
    user_id: z.string().min(1),
    date: z.string().datetime(),
    start_time: z.string().datetime(),
    end_time: z.string().datetime(),
    duration_minutes: z.number().int().nonnegative(),
    bookable_slots: z.number().int().nonnegative(),
    leakage_value: z.number().nonnegative(),
    status: GapStatusSchema,
    day_of_week: DayKeySchema.optional(),
    intentional_reason: z.enum(["lunch", "buffer", "personal", "other"]).nullable().optional(),
    fill_confidence: z.enum(["self_reported", "verified"]).nullable().optional(),
    source_calendar: z.enum(["google", "apple"]).optional(),
    week_key: z.string().min(1)
  })
  .strict();

export const WeeklyReportSchema = z
  .object({
    user_id: z.string().min(1),
    week_key: z.string().min(1),
    total_leakage: z.number().nonnegative(),
    total_gaps: z.number().int().nonnegative(),
    total_bookable_slots: z.number().int().nonnegative().optional(),
    recovered_revenue_self_reported: z.number().nonnegative(),
    recovered_revenue_verified: z.number().nonnegative(),
    data_freshness_hours: z.number().nonnegative().optional(),
    intentional_blocks: z.number().int().nonnegative().optional(),
    created_at: z.string().datetime().optional()
  })
  .strict();

export const IntentionalRuleSchema = z
  .object({
    user_id: z.string().min(1),
    day_of_week: DayKeySchema,
    approx_start_minutes: z.number().int().min(0).max(24 * 60),
    approx_end_minutes: z.number().int().min(0).max(24 * 60),
    reason: z.enum(["lunch", "buffer", "personal", "other"]),
    active: z.boolean()
  })
  .strict();

export const UserStatsSchema = z
  .object({
    recovered_revenue_self_reported: z.number().nonnegative(),
    recovered_revenue_verified: z.number().nonnegative(),
    total_leakage_all_time: z.number().nonnegative(),
    rolling_30d_leakage: z.number().nonnegative(),
    current_week_leakage: z.number().nonnegative(),
    last_sync_at: z.string().datetime().optional()
  })
  .strict();

export const UserDocumentSchema = z
  .object({
    email: z.string().email().optional(),
    display_name: z.string().min(1).optional(),
    subscription_status: z.enum(["trial", "active", "expired", "cancelled"]),
    subscription_plan: z.enum(["monthly", "annual"]).optional(),
    trial_end_date: z.string().datetime().optional(),
    subscription_renewal_date: z.string().datetime().optional(),
    onboarding_complete: z.boolean(),
    settings: UserSettingsSchema,
    stats: UserStatsSchema.optional(),
    // Retention & churn fields
    last_open_at: z.string().datetime().optional(),
    inactivity_tier: z.number().int().min(0).max(5).optional(),
    last_intervention_at: z.string().datetime().nullable().optional(),
    last_recovery_amount: z.number().nonnegative().optional(),
    resurrection_day30_sent: z.boolean().optional(),
    resurrection_seasonal_sent_season: z.string().nullable().optional(),
    cancellation_reason: z.string().nullable().optional(),
    // Notification frequency (mirrored from notification_state for easy querying)
    notification_frequency: z.enum(["standard", "focused", "weekly_digest"]).optional(),
  })
  .strict();

export const StoreCalendarTokensRequestSchema = z
  .object({
    calendarSource: z.enum(["google", "apple"]),
    tokenPayload: z.record(z.unknown())
  })
  .strict();

export const StoreCalendarTokensResponseSchema = z
  .object({
    ok: z.literal(true)
  })
  .strict();

export const DeviceCalendarEventSchema = z
  .object({
    startIso: z.string().datetime(),
    endIso: z.string().datetime(),
    allDay: z.boolean().optional()
  })
  .strict();

export const SyncCalendarEventsRequestSchema = z
  .object({
    calendarSource: z.enum(["google", "apple"]),
    startIso: z.string().datetime(),
    endIso: z.string().datetime(),
    slotDurationMinutes: z.number().int().positive(),
    avgBookingValue: z.number().nonnegative(),
    timezone: z.string().min(1).optional(),
    workingHours: WorkingHoursSchema,
    intentionalRules: z
      .array(
        z
          .object({
            dayOfWeek: DayKeySchema,
            approxStartMinutes: z.number().int().min(0).max(24 * 60),
            approxEndMinutes: z.number().int().min(0).max(24 * 60)
          })
          .strict()
      )
      .optional(),
    /// Device-side calendar events — required when calendarSource is "apple".
    /// The mobile app reads EventKit events locally and includes them here.
    deviceEvents: z.array(DeviceCalendarEventSchema).optional()
  })
  .strict();

export const SyncCalendarEventSchema = z
  .object({
    startIso: z.string().datetime(),
    endIso: z.string().datetime(),
    allDay: z.boolean().optional()
  })
  .strict();

export const SyncCalendarGapSchema = z
  .object({
    gapId: z.string().min(1).optional(),
    startIso: z.string().datetime(),
    endIso: z.string().datetime(),
    durationMinutes: z.number().int().nonnegative(),
    bookableSlots: z.number().int().nonnegative(),
    leakageValue: z.number().nonnegative(),
    dayOfWeek: DayKeySchema,
    intentional: z.boolean(),
    status: GapStatusSchema.optional(),
    intentionalReason: z
      .enum(["lunch", "buffer", "personal", "other"])
      .nullable()
      .optional()
  })
  .strict();

export const SyncCalendarEventsResponseSchema = z
  .object({
    ok: z.literal(true),
    events: z.array(SyncCalendarEventSchema),
    gaps: z.array(SyncCalendarGapSchema),
    totals: z
      .object({
        gapCount: z.number().int().nonnegative(),
        totalBookableSlots: z.number().int().nonnegative(),
        weeklyLeakage: z.number().nonnegative()
      })
      .strict()
  })
  .strict();

export const RevokeCalendarTokensRequestSchema = z
  .object({
    calendarSource: z.enum(["google", "apple"])
  })
  .strict();

export const RevokeCalendarTokensResponseSchema = z
  .object({
    ok: z.literal(true)
  })
  .strict();

export const UpdateGapStatusRequestSchema = z
  .object({
    startIso: z.string().datetime(),
    endIso: z.string().datetime(),
    status: GapStatusSchema,
    intentionalReason: z
      .enum(["lunch", "buffer", "personal", "other"])
      .nullable()
      .optional()
  })
  .strict();

export const UpdateGapStatusResponseSchema = z
  .object({
    ok: z.literal(true)
  })
  .strict();

export type WorkingDay = z.infer<typeof WorkingDaySchema>;
export type UserSettings = z.infer<typeof UserSettingsSchema>;
export type GapDocument = z.infer<typeof GapDocumentSchema>;
export type WeeklyReport = z.infer<typeof WeeklyReportSchema>;
export type IntentionalRule = z.infer<typeof IntentionalRuleSchema>;
export type UserDocument = z.infer<typeof UserDocumentSchema>;
export type UserStats = z.infer<typeof UserStatsSchema>;
