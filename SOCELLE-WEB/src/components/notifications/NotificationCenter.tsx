// ── NotificationCenter ─────────────────────────────────────────────
// WO-18: Bell icon dropdown for portal headers
// Displays unread badge, notification list, and quick actions.

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  TrendingUp,
  Package,
  Megaphone,
  BookOpen,
  Settings,
  RefreshCw,
  Check,
} from 'lucide-react';
import { useNotifications } from '../../lib/notifications/useNotifications';
import type { NotificationType } from '../../lib/notifications/types';

const TYPE_ICONS: Record<NotificationType, typeof TrendingUp> = {
  intelligence_alert: TrendingUp,
  reorder_reminder: Package,
  campaign_launch: Megaphone,
  education_new: BookOpen,
  enrichment_update: RefreshCw,
  system: Settings,
};

const TYPE_COLORS: Record<NotificationType, string> = {
  intelligence_alert: 'text-blue-600 bg-blue-50',
  reorder_reminder: 'text-amber-600 bg-amber-50',
  campaign_launch: 'text-purple-600 bg-purple-50',
  education_new: 'text-green-600 bg-green-50',
  enrichment_update: 'text-cyan-600 bg-cyan-50',
  system: 'text-pro-warm-gray bg-pro-cream',
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface NotificationCenterProps {
  /** Route prefix for "View all" / "Preferences" links */
  preferencesUrl?: string;
}

export default function NotificationCenter({
  preferencesUrl = '/portal/notifications',
}: NotificationCenterProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  // Close on click outside
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, handleClickOutside]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open]);

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    markAsRead(notif.id);
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-lg text-pro-warm-gray hover:text-pro-charcoal hover:bg-pro-cream transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-[380px] max-h-[500px] bg-white rounded-xl shadow-xl border border-pro-stone flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-pro-stone flex-shrink-0">
            <h3 className="font-sans font-semibold text-sm text-pro-charcoal">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 text-xs font-medium text-pro-navy hover:text-pro-gold transition-colors font-sans"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="flex-1 overflow-y-auto divide-y divide-pro-stone/50">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="w-8 h-8 text-pro-stone mx-auto mb-2" />
                <p className="text-sm text-pro-warm-gray font-sans">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const Icon = TYPE_ICONS[notif.type];
                const colorClasses = TYPE_COLORS[notif.type];
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`w-full text-left px-4 py-3 hover:bg-pro-cream/50 transition-colors flex gap-3 ${
                      !notif.read ? 'border-l-[3px] border-l-pro-gold bg-pro-ivory/30' : 'border-l-[3px] border-l-transparent'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${colorClasses}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-sans leading-snug ${!notif.read ? 'font-semibold text-pro-charcoal' : 'font-medium text-pro-warm-gray'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-pro-warm-gray font-sans mt-0.5 line-clamp-2">
                        {notif.body}
                      </p>
                      <p className="text-[10px] text-pro-warm-gray/70 font-sans mt-1">
                        {timeAgo(notif.sentAt)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-pro-stone flex-shrink-0 bg-pro-ivory/30">
            <button
              onClick={() => {
                navigate(preferencesUrl);
                setOpen(false);
              }}
              className="text-xs font-medium text-pro-warm-gray hover:text-pro-charcoal transition-colors font-sans"
            >
              View all
            </button>
            <button
              onClick={() => {
                navigate(preferencesUrl);
                setOpen(false);
              }}
              className="flex items-center gap-1 text-xs font-medium text-pro-warm-gray hover:text-pro-charcoal transition-colors font-sans"
            >
              <Settings className="w-3.5 h-3.5" />
              Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
