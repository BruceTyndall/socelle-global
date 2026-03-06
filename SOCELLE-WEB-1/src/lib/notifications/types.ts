// ── Notification System Types ──────────────────────────────────────
// WO-18: In-app notification types + email stubs

export type NotificationType =
  | 'intelligence_alert'
  | 'reorder_reminder'
  | 'campaign_launch'
  | 'education_new'
  | 'enrichment_update'
  | 'system';

export type NotificationChannel = 'email' | 'in_app';

export interface Notification {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  body: string;
  actionUrl?: string;
  read: boolean;
  sentAt: string;
  createdAt: string;
}

export type EmailFrequency = 'real_time' | 'daily' | 'weekly' | 'monthly';

export interface NotificationPreferences {
  intelligence_alerts: boolean;
  reorder_reminders: boolean;
  campaign_notifications: boolean;
  education_updates: boolean;
  enrichment_updates: boolean;
  system_notifications: boolean;
  email_frequency: EmailFrequency;
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  intelligence_alerts: true,
  reorder_reminders: true,
  campaign_notifications: true,
  education_updates: true,
  enrichment_updates: false,
  system_notifications: true,
  email_frequency: 'daily',
};
