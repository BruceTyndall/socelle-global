import { useMemo, useState } from 'react';
import { Bell, Download, Filter, Loader2, RefreshCw } from 'lucide-react';
import type { Notification } from '../../lib/notifications/types';
import { exportToCsv } from '../../lib/csvExport';

interface NotificationLedgerPanelProps {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
  onMarkAsRead: (id: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  title?: string;
  description?: string;
}

type ChannelFilter = 'all' | 'in_app' | 'email';
type StatusFilter = 'all' | 'unread' | 'read';

const TYPE_LABELS: Record<Notification['type'], string> = {
  intelligence_alert: 'Intelligence',
  reorder_reminder: 'Reorder',
  campaign_launch: 'Campaign',
  education_new: 'Education',
  enrichment_update: 'Enrichment',
  system: 'System',
};

function formatDate(value: string): string {
  const date = new Date(value);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export default function NotificationLedgerPanel({
  notifications,
  loading,
  error,
  onRefresh,
  onMarkAsRead,
  onMarkAllAsRead,
  title = 'Notification Ledger',
  description = 'Transactional notification events with delivery channels and status',
}: NotificationLedgerPanelProps) {
  const [query, setQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  const filtered = useMemo(() => {
    return notifications.filter((notification) => {
      if (channelFilter !== 'all' && notification.channel !== channelFilter) return false;
      if (statusFilter === 'unread' && notification.read) return false;
      if (statusFilter === 'read' && !notification.read) return false;
      if (query.trim()) {
        const normalized = query.toLowerCase();
        const haystack = `${notification.title} ${notification.body} ${TYPE_LABELS[notification.type]}`.toLowerCase();
        if (!haystack.includes(normalized)) return false;
      }
      return true;
    });
  }, [notifications, channelFilter, statusFilter, query]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  const handleExport = () => {
    exportToCsv(
      filtered.map((notification) => ({
        title: notification.title,
        type: TYPE_LABELS[notification.type],
        channel: notification.channel,
        status: notification.read ? 'read' : 'unread',
        body: notification.body,
        sent_at: notification.sentAt,
        created_at: notification.createdAt,
      })),
      'notification_ledger',
    );
  };

  const handleMarkRead = async (id: string) => {
    setBusyId(id);
    try {
      await onMarkAsRead(id);
    } finally {
      setBusyId(null);
    }
  };

  const handleMarkAllRead = async () => {
    setBulkBusy(true);
    try {
      await onMarkAllAsRead();
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-accent-soft shadow-sm mb-6 overflow-hidden">
      <div className="px-6 py-4 border-b border-accent-soft">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-sans font-semibold text-graphite text-sm">{title}</h2>
            <p className="font-sans text-xs text-graphite/60 mt-0.5">{description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-accent-soft text-xs font-medium text-graphite hover:bg-accent-soft/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button
              onClick={() => {
                void onRefresh();
              }}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-accent-soft text-xs font-medium text-graphite hover:bg-accent-soft/40 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <button
              onClick={() => {
                void handleMarkAllRead();
              }}
              disabled={unreadCount === 0 || bulkBusy}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-graphite text-white text-xs font-medium hover:bg-graphite/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {bulkBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Mark all read
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-accent-soft/60 flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search notifications..."
            className="w-full h-9 px-3 rounded-lg border border-accent-soft text-sm font-sans text-graphite focus:outline-none focus:ring-2 focus:ring-graphite/20 focus:border-graphite"
          />
        </div>
        <div className="inline-flex items-center gap-1 text-xs text-graphite/60">
          <Filter className="w-3.5 h-3.5" />
          Filter
        </div>
        <select
          value={channelFilter}
          onChange={(event) => setChannelFilter(event.target.value as ChannelFilter)}
          className="h-9 px-3 rounded-lg border border-accent-soft text-xs font-sans text-graphite bg-white"
        >
          <option value="all">All channels</option>
          <option value="in_app">In-app</option>
          <option value="email">Email</option>
        </select>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          className="h-9 px-3 rounded-lg border border-accent-soft text-xs font-sans text-graphite bg-white"
        >
          <option value="all">All statuses</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
      </div>

      {error ? (
        <div className="px-6 py-6 flex items-center justify-between gap-3 bg-signal-down/5 border-t border-signal-down/20">
          <p className="text-sm font-sans text-signal-down">{error}</p>
          <button
            onClick={() => {
              void onRefresh();
            }}
            className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="px-6 py-5 space-y-2">
          {[1, 2, 3, 4].map((row) => (
            <div key={row} className="h-10 rounded-lg bg-accent-soft/20 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <Bell className="w-8 h-8 text-graphite/20 mx-auto mb-2" />
          <p className="text-sm font-sans text-graphite/60">No notifications found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="bg-accent-soft/40 text-graphite/60 text-left">
                <th className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider">Title</th>
                <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider">Type</th>
                <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider">Channel</th>
                <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider">Sent</th>
                <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-accent-soft/50">
              {filtered.map((notification) => (
                <tr key={notification.id} className={notification.read ? 'bg-white' : 'bg-accent-soft/10'}>
                  <td className="px-6 py-3">
                    <p className="font-medium text-graphite">{notification.title}</p>
                    <p className="text-xs text-graphite/60 mt-0.5 line-clamp-1">{notification.body}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-graphite/70">{TYPE_LABELS[notification.type]}</td>
                  <td className="px-4 py-3 text-xs text-graphite/70 uppercase">{notification.channel}</td>
                  <td className="px-4 py-3 text-xs text-graphite/70">{formatDate(notification.sentAt)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        notification.read
                          ? 'bg-accent-soft text-graphite/70'
                          : 'bg-signal-up/10 text-signal-up'
                      }`}
                    >
                      {notification.read ? 'READ' : 'UNREAD'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    {!notification.read ? (
                      <button
                        onClick={() => {
                          void handleMarkRead(notification.id);
                        }}
                        disabled={busyId === notification.id}
                        className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover disabled:opacity-40 transition-colors"
                      >
                        {busyId === notification.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : null}
                        Mark read
                      </button>
                    ) : (
                      <span className="text-xs text-graphite/40">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
