// ── useNotifications Hook ──────────────────────────────────────────
// WO-18: Local-state notification management (no Supabase)

import { useState, useCallback, useMemo } from 'react';
import type { Notification, NotificationPreferences } from './types';
import { DEFAULT_PREFERENCES } from './types';
import { MOCK_NOTIFICATIONS } from './mockNotifications';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  preferences: NotificationPreferences;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    // STUB: In production, persist to Supabase
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    // STUB: In production, batch update in Supabase
  }, []);

  const updatePreferences = useCallback((prefs: Partial<NotificationPreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...prefs };
      // STUB: In production, save to Supabase user_preferences
      // STUB: Email delivery not yet connected
      if (prefs.email_frequency) {
        // noop: email frequency stub — not yet wired to delivery service
      }
      return updated;
    });
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    preferences,
    updatePreferences,
  };
}
