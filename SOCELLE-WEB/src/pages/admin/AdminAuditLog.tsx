// ── AdminAuditLog — V2-HUBS-05: Audit Log ─────────────────────────────────
// Data source: audit_events table (DEMO fallback if table missing — 42P01)
// Authority: build_tracker.md WO V2-HUBS-05

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ClipboardList,
  Search,
  Download,
  RefreshCw,
  ShieldAlert,
  Filter,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { exportToCsv } from '../../lib/csvExport';

// ── Types ─────────────────────────────────────────────────────────────────

interface AuditEvent {
  id: string;
  timestamp: string;
  user_email: string;
  action: string;
  target: string;
  details: string;
}

const ACTION_TYPES = [
  'All',
  'user.role_change',
  'user.deactivate',
  'user.reactivate',
  'feed.create',
  'feed.delete',
  'feed.toggle',
  'settings.update',
  'cms.publish',
  'cms.unpublish',
  'export.csv',
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────

function isMissingTableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as Record<string, unknown>;
  const code = typeof e.code === 'string' ? e.code : '';
  const message = typeof e.message === 'string' ? e.message.toLowerCase() : '';
  return code === '42P01' || message.includes('does not exist');
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function actionBadgeClasses(action: string): string {
  if (action.includes('delete') || action.includes('deactivate'))
    return 'bg-[#8E6464]/10 text-[#8E6464]';
  if (action.includes('create') || action.includes('publish') || action.includes('reactivate'))
    return 'bg-[#5F8A72]/10 text-[#5F8A72]';
  if (action.includes('update') || action.includes('change') || action.includes('toggle'))
    return 'bg-[#A97A4C]/10 text-[#A97A4C]';
  return 'bg-[#6E879B]/10 text-[#6E879B]';
}

// ── DEMO data ─────────────────────────────────────────────────────────────

function generateDemoEvents(): AuditEvent[] {
  const now = Date.now();
  return [
    {
      id: 'demo-1',
      timestamp: new Date(now - 12 * 60000).toISOString(),
      user_email: 'admin@socelle.com',
      action: 'user.role_change',
      target: 'user:jane@example.com',
      details: 'Changed role from user to business_user',
    },
    {
      id: 'demo-2',
      timestamp: new Date(now - 45 * 60000).toISOString(),
      user_email: 'admin@socelle.com',
      action: 'feed.create',
      target: 'feed:beauty-independent-rss',
      details: 'Created new RSS feed: Beauty Independent',
    },
    {
      id: 'demo-3',
      timestamp: new Date(now - 2 * 3600000).toISOString(),
      user_email: 'admin@socelle.com',
      action: 'cms.publish',
      target: 'post:spring-trends-2026',
      details: 'Published blog post: Spring Trends 2026',
    },
    {
      id: 'demo-4',
      timestamp: new Date(now - 5 * 3600000).toISOString(),
      user_email: 'platform@socelle.com',
      action: 'settings.update',
      target: 'setting:maintenance_mode',
      details: 'Set MAINTENANCE_MODE to false',
    },
    {
      id: 'demo-5',
      timestamp: new Date(now - 8 * 3600000).toISOString(),
      user_email: 'admin@socelle.com',
      action: 'user.deactivate',
      target: 'user:test-user@example.com',
      details: 'Deactivated user account',
    },
    {
      id: 'demo-6',
      timestamp: new Date(now - 24 * 3600000).toISOString(),
      user_email: 'admin@socelle.com',
      action: 'export.csv',
      target: 'export:users_list',
      details: 'Exported 142 user records to CSV',
    },
    {
      id: 'demo-7',
      timestamp: new Date(now - 36 * 3600000).toISOString(),
      user_email: 'admin@socelle.com',
      action: 'feed.toggle',
      target: 'feed:cosmetics-business-rss',
      details: 'Disabled feed: Cosmetics Business',
    },
    {
      id: 'demo-8',
      timestamp: new Date(now - 48 * 3600000).toISOString(),
      user_email: 'platform@socelle.com',
      action: 'cms.unpublish',
      target: 'page:about-old',
      details: 'Unpublished page: About (old version)',
    },
    {
      id: 'demo-9',
      timestamp: new Date(now - 72 * 3600000).toISOString(),
      user_email: 'admin@socelle.com',
      action: 'user.reactivate',
      target: 'user:provider@example.com',
      details: 'Reactivated provider account',
    },
    {
      id: 'demo-10',
      timestamp: new Date(now - 96 * 3600000).toISOString(),
      user_email: 'admin@socelle.com',
      action: 'feed.delete',
      target: 'feed:deprecated-api',
      details: 'Deleted deprecated API feed',
    },
  ];
}

// ── Data fetching ─────────────────────────────────────────────────────────

async function fetchAuditEvents(): Promise<{ events: AuditEvent[]; isDemo: boolean }> {
  const { data, error } = await supabase
    .from('audit_events')
    .select('id, timestamp, user_email, action, target, details')
    .order('timestamp', { ascending: false })
    .limit(200);

  if (error && isMissingTableError(error)) {
    return { events: generateDemoEvents(), isDemo: true };
  }
  if (error) {
    throw error;
  }
  if (!data || data.length === 0) {
    return { events: generateDemoEvents(), isDemo: true };
  }
  return { events: data as AuditEvent[], isDemo: false };
}

// ── Component ─────────────────────────────────────────────────────────────

export default function AdminAuditLog() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  const {
    data,
    isLoading,
    isError,
    error: errorObj,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'audit-log'],
    queryFn: fetchAuditEvents,
    staleTime: 30_000,
  });

  const events = data?.events ?? [];
  const isDemo = data?.isDemo ?? true;

  // ── Filtering ───────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let result = events;

    if (actionFilter !== 'All') {
      result = result.filter((e) => e.action === actionFilter);
    }

    const q = search.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (e) =>
          e.user_email.toLowerCase().includes(q) ||
          e.action.toLowerCase().includes(q) ||
          e.target.toLowerCase().includes(q) ||
          e.details.toLowerCase().includes(q)
      );
    }

    return result;
  }, [events, search, actionFilter]);

  // ── CSV Export ──────────────────────────────────────────────────────

  const handleExport = () => {
    exportToCsv(
      filtered.map((e) => ({
        timestamp: e.timestamp,
        user: e.user_email,
        action: e.action,
        target: e.target,
        details: e.details,
      })),
      'socelle_audit_log',
      [
        { key: 'timestamp', label: 'Timestamp' },
        { key: 'user', label: 'User' },
        { key: 'action', label: 'Action' },
        { key: 'target', label: 'Target' },
        { key: 'details', label: 'Details' },
      ]
    );
  };

  // ── Error state ─────────────────────────────────────────────────────

  if (isError) {
    const message =
      errorObj instanceof Error ? errorObj.message : 'Failed to load audit log.';
    return (
      <div className="py-16 text-center">
        <ShieldAlert className="w-12 h-12 text-[#8E6464] mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-graphite font-sans">Audit Log Unavailable</h3>
        <p className="text-sm text-graphite/60 mt-1 max-w-md mx-auto font-sans">{message}</p>
        <button
          onClick={() => void refetch()}
          className="mt-4 px-4 py-2 border border-accent text-accent font-medium rounded-lg hover:bg-accent-soft transition-colors font-sans text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Loading state ───────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="h-8 w-48 bg-accent-soft rounded" />
            <div className="h-4 w-64 bg-accent-soft rounded mt-2" />
          </div>
          <div className="h-10 w-32 bg-accent-soft rounded-lg" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 flex-1 bg-accent-soft rounded-lg" />
          <div className="h-10 w-48 bg-accent-soft rounded-lg" />
        </div>
        <div className="bg-white border border-accent-soft rounded-xl p-5">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-14 bg-accent-soft rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Main view ───────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-graphite font-sans">Audit Log</h1>
            <p className="text-graphite/60 font-sans mt-1 text-sm">
              {filtered.length} event{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
          {isDemo && (
            <span className="text-[10px] font-semibold bg-[#A97A4C]/10 text-[#A97A4C] px-2 py-0.5 rounded-full">
              DEMO
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-accent-soft text-graphite hover:bg-accent-soft font-sans text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-accent-soft text-graphite hover:bg-accent-soft font-sans text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* DEMO banner */}
      {isDemo && (
        <div className="bg-[#A97A4C]/10 text-[#A97A4C] text-xs font-medium px-4 py-2 rounded-lg text-center font-sans">
          DEMO -- audit_events table not yet created. Showing sample data for layout preview.
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user, action, target, or details..."
            className="w-full pl-10 pr-4 py-2.5 border border-accent-soft rounded-lg text-sm text-graphite bg-white placeholder:text-graphite/40 focus:outline-none focus:ring-2 focus:ring-accent/30 font-sans"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/40" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 border border-accent-soft rounded-lg text-sm text-graphite bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-accent/30 font-sans"
          >
            {ACTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t === 'All' ? 'All actions' : t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-accent-soft rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-accent-soft bg-[#F6F3EF]">
                <th className="text-left px-4 py-3 font-medium text-graphite/70 font-sans">Timestamp</th>
                <th className="text-left px-4 py-3 font-medium text-graphite/70 font-sans">User</th>
                <th className="text-left px-4 py-3 font-medium text-graphite/70 font-sans">Action</th>
                <th className="text-left px-4 py-3 font-medium text-graphite/70 font-sans">Target</th>
                <th className="text-left px-4 py-3 font-medium text-graphite/70 font-sans">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-accent-soft">
              {filtered.map((event) => (
                <tr key={event.id} className="hover:bg-[#F6F3EF]/50 transition-colors">
                  <td className="px-4 py-3 font-sans text-graphite/60 text-xs whitespace-nowrap">
                    <span title={event.timestamp}>{timeAgo(event.timestamp)}</span>
                  </td>
                  <td className="px-4 py-3 font-sans text-graphite text-xs truncate max-w-[180px]">
                    {event.user_email}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${actionBadgeClasses(event.action)}`}
                    >
                      {event.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans text-graphite/70 text-xs font-mono truncate max-w-[200px]">
                    {event.target}
                  </td>
                  <td className="px-4 py-3 font-sans text-graphite/60 text-xs truncate max-w-[280px]">
                    {event.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* No results from filter */}
        {filtered.length === 0 && (
          <div className="py-10 text-center">
            <ClipboardList className="w-8 h-8 text-graphite/30 mx-auto mb-2" />
            <p className="text-sm text-graphite/60 font-sans">
              No audit events match your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
