import { z } from "zod";

export const NotificationStateSchema = z
  .object({
    last_sent_at: z.string().datetime().nullable(),
    consecutive_dismissed: z.number().int().nonnegative(),
    reduced_frequency_until: z.string().datetime().nullable(),
    framing_rotation_index: z.number().int().min(0).max(3),
    re_engagement_mode: z.boolean(),
    daily_count: z.number().int().nonnegative(),
    daily_count_date: z.string(), // "YYYY-MM-DD"
    notification_frequency: z.enum(["standard", "focused", "weekly_digest"]),
    last_dismiss_at: z.string().datetime().nullable(),
    milestones_sent: z.array(z.string()).optional(), // ["firstRecovery", "fiveGapRecovery", ...]
  })
  .strict();

export const FcmTokenSchema = z
  .object({
    token: z.string().min(1),
    platform: z.enum(["ios", "android"]),
    updated_at: z.string().datetime(),
  })
  .strict();

export const InactivityInterventionSchema = z
  .object({
    tier: z.number().int().min(0).max(5),
    last_intervention_at: z.string().datetime().nullable(),
    resurrection_day30_sent: z.boolean().optional(),
    resurrection_seasonal_sent_season: z.string().nullable().optional(),
    cancellation_reason: z.string().nullable().optional(),
  })
  .strict();

export type NotificationState = z.infer<typeof NotificationStateSchema>;
export type FcmToken = z.infer<typeof FcmTokenSchema>;
export type InactivityIntervention = z.infer<typeof InactivityInterventionSchema>;

export const DEFAULT_NOTIFICATION_STATE: NotificationState = {
  last_sent_at: null,
  consecutive_dismissed: 0,
  reduced_frequency_until: null,
  framing_rotation_index: 0,
  re_engagement_mode: false,
  daily_count: 0,
  daily_count_date: "",
  notification_frequency: "standard",
  last_dismiss_at: null,
  milestones_sent: [],
};
