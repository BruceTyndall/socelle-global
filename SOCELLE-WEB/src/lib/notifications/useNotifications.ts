// ── useNotifications Hook ──────────────────────────────────────────
// Build 3: DB-backed notification center + preference ledger.
// Data source: notifications + notification_preferences.

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../supabase';
import { useAuth } from '../auth';
import type {
  Notification,
  NotificationChannel,
  NotificationPreferences,
  NotificationType,
} from './types';
import { DEFAULT_PREFERENCES } from './types';

interface NotificationRow {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  body: string;
  action_url: string | null;
  read: boolean;
  sent_at: string;
  created_at: string;
}

interface NotificationPreferenceRow {
  user_id: string;
  business_id: string | null;
  intelligence_alerts: boolean;
  reorder_reminders: boolean;
  campaign_notifications: boolean;
  education_updates: boolean;
  enrichment_updates: boolean;
  system_notifications: boolean;
  email_frequency: NotificationPreferences['email_frequency'];
}

interface CreateNotificationInput {
  type: NotificationType;
  channel?: NotificationChannel;
  title: string;
  body: string;
  actionUrl?: string;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  isLive: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  preferences: NotificationPreferences;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  createNotification: (input: CreateNotificationInput) => Promise<void>;
  refresh: () => Promise<void>;
}

function mapNotificationRow(row: NotificationRow): Notification {
  return {
    id: row.id,
    type: row.type,
    channel: row.channel,
    title: row.title,
    body: row.body,
    actionUrl: row.action_url ?? undefined,
    read: row.read,
    sentAt: row.sent_at,
    createdAt: row.created_at,
  };
}

function mapPreferencesRow(row: NotificationPreferenceRow): NotificationPreferences {
  return {
    intelligence_alerts: row.intelligence_alerts,
    reorder_reminders: row.reorder_reminders,
    campaign_notifications: row.campaign_notifications,
    education_updates: row.education_updates,
    enrichment_updates: row.enrichment_updates,
    system_notifications: row.system_notifications,
    email_frequency: row.email_frequency,
  };
}

export function useNotifications(): UseNotificationsReturn {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  const notificationsQuery = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id || !isSupabaseConfigured) return [] as Notification[];
      const { data, error } = await supabase
        .from('notifications')
        .select('id, type, channel, title, body, action_url, read, sent_at, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) {
        if (error.code === '42P01') return [] as Notification[];
        throw new Error(error.message);
      }

      return ((data ?? []) as NotificationRow[]).map(mapNotificationRow);
    },
    enabled: isSupabaseConfigured && !!user?.id,
  });

  const preferencesQuery = useQuery({
    queryKey: ['notification_preferences', user?.id, profile?.business_id],
    queryFn: async () => {
      if (!user?.id || !isSupabaseConfigured) return DEFAULT_PREFERENCES;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select(
          'user_id, business_id, intelligence_alerts, reorder_reminders, campaign_notifications, education_updates, enrichment_updates, system_notifications, email_frequency',
        )
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        if (error.code === '42P01') return DEFAULT_PREFERENCES;
        throw new Error(error.message);
      }

      if (data) return mapPreferencesRow(data as NotificationPreferenceRow);

      const payload = {
        user_id: user.id,
        business_id: profile?.business_id ?? null,
        ...DEFAULT_PREFERENCES,
      };

      const { data: inserted, error: insertError } = await supabase
        .from('notification_preferences')
        .insert(payload)
        .select(
          'user_id, business_id, intelligence_alerts, reorder_reminders, campaign_notifications, education_updates, enrichment_updates, system_notifications, email_frequency',
        )
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      return mapPreferencesRow(inserted as NotificationPreferenceRow);
    },
    enabled: isSupabaseConfigured && !!user?.id,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id || !isSupabaseConfigured) return;
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !isSupabaseConfigured) return;
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (prefs: Partial<NotificationPreferences>) => {
      if (!user?.id || !isSupabaseConfigured) return;
      const payload = {
        user_id: user.id,
        business_id: profile?.business_id ?? null,
        ...prefs,
      };

      const { error } = await supabase
        .from('notification_preferences')
        .upsert(payload, { onConflict: 'user_id' });
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['notification_preferences', user?.id, profile?.business_id],
      });
    },
  });

  const createNotificationMutation = useMutation({
    mutationFn: async (input: CreateNotificationInput) => {
      if (!user?.id || !isSupabaseConfigured) return;
      const { error } = await supabase.from('notifications').insert({
        user_id: user.id,
        business_id: profile?.business_id ?? null,
        type: input.type,
        channel: input.channel ?? 'in_app',
        title: input.title,
        body: input.body,
        action_url: input.actionUrl ?? null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  const notifications = notificationsQuery.data ?? [];
  const preferences = preferencesQuery.data ?? DEFAULT_PREFERENCES;
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  const loading =
    notificationsQuery.isLoading ||
    preferencesQuery.isLoading ||
    markAsReadMutation.isPending ||
    markAllAsReadMutation.isPending ||
    updatePreferencesMutation.isPending ||
    createNotificationMutation.isPending;

  const error =
    (notificationsQuery.error instanceof Error
      ? notificationsQuery.error.message
      : null) ||
    (preferencesQuery.error instanceof Error
      ? preferencesQuery.error.message
      : null) ||
    (markAsReadMutation.error instanceof Error
      ? markAsReadMutation.error.message
      : null) ||
    (markAllAsReadMutation.error instanceof Error
      ? markAllAsReadMutation.error.message
      : null) ||
    (updatePreferencesMutation.error instanceof Error
      ? updatePreferencesMutation.error.message
      : null) ||
    (createNotificationMutation.error instanceof Error
      ? createNotificationMutation.error.message
      : null);

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] }),
      queryClient.invalidateQueries({
        queryKey: ['notification_preferences', user?.id, profile?.business_id],
      }),
    ]);
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    isLive:
      isSupabaseConfigured &&
      !!user?.id &&
      notificationsQuery.error == null &&
      preferencesQuery.error == null,
    markAsRead: async (id: string) => markAsReadMutation.mutateAsync(id),
    markAllAsRead: async () => markAllAsReadMutation.mutateAsync(),
    preferences,
    updatePreferences: async (prefs: Partial<NotificationPreferences>) =>
      updatePreferencesMutation.mutateAsync(prefs),
    createNotification: async (input: CreateNotificationInput) =>
      createNotificationMutation.mutateAsync(input),
    refresh,
  };
}
