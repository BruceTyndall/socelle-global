import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  DollarSign,
  Download,
  ExternalLink,
  FileText,
  Rss,
  RefreshCw,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { exportToCsv } from '../../lib/csvExport';

// ── Types ─────────────────────────────────────────────────────────────────

interface KpiData {
  feedsActive: number;
  feedsFailing: number;
  usersTotal: number;
  usersNewThisMonth: number;
  signalsTotal: number;
  signalsFresh: number;
}

interface FeedError {
  id: string;
  name: string;
  last_error: string;
  updated_at: string;
}

interface FeedStatus {
  id: string;
  name: string;
  status: string;
  last_run_at: string | null;
  last_error: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function isMissingTableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as Record<string, unknown>;
  const code = typeof e.code === 'string' ? e.code : '';
  const message = typeof e.message === 'string' ? e.message.toLowerCase() : '';
  return code === '42P01' || message.includes('does not exist');
}

function safeCount(result: { count: number | null; error: unknown }): number {
  if (result.error && !isMissingTableError(result.error)) return 0;
  return result.count ?? 0;
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

function feedHealthLabel(feed: FeedStatus): 'healthy' | 'stale' | 'error' {
  if (feed.last_error) return 'error';
  if (!feed.last_run_at) return 'stale';
  const hoursSinceRun = (Date.now() - new Date(feed.last_run_at).getTime()) / 3600000;
  return hoursSinceRun > 12 ? 'stale' : 'healthy';
}

const healthBadgeClasses: Record<'healthy' | 'stale' | 'error', string> = {
  healthy: 'bg-[#5F8A72]/10 text-[#5F8A72]',
  stale: 'bg-[#A97A4C]/10 text-[#A97A4C]',
  error: 'bg-[#8E6464]/10 text-[#8E6464]',
};

// ── Data fetching ─────────────────────────────────────────────────────────

async function fetchKpis(): Promise<KpiData> {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  const [
    feedsActiveRes,
    feedsFailingRes,
    usersTotalRes,
    usersNewRes,
    signalsTotalRes,
    signalsFreshRes,
  ] = await Promise.all([
    supabase.from('data_feeds').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('data_feeds').select('id', { count: 'exact', head: true }).neq('last_error', '').not('last_error', 'is', null),
    supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('user_profiles').select('id', { count: 'exact', head: true }).gte('created_at', firstOfMonth),
    supabase.from('market_signals').select('id', { count: 'exact', head: true }),
    supabase.from('market_signals').select('id', { count: 'exact', head: true }).gte('updated_at', twentyFourHoursAgo),
  ]);

  return {
    feedsActive: safeCount(feedsActiveRes),
    feedsFailing: safeCount(feedsFailingRes),
    usersTotal: safeCount(usersTotalRes),
    usersNewThisMonth: safeCount(usersNewRes),
    signalsTotal: safeCount(signalsTotalRes),
    signalsFresh: safeCount(signalsFreshRes),
  };
}

async function fetchRecentErrors(): Promise<FeedError[]> {
  const { data, error } = await supabase
    .from('data_feeds')
    .select('id, name, last_error, updated_at')
    .not('last_error', 'is', null)
    .neq('last_error', '')
    .order('updated_at', { ascending: false })
    .limit(5);

  if (error && !isMissingTableError(error)) {
    throw error;
  }
  return (data ?? []) as FeedError[];
}

async function fetchFeedStatuses(): Promise<FeedStatus[]> {
  const { data, error } = await supabase
    .from('data_feeds')
    .select('id, name, status, last_run_at, last_error')
    .order('last_run_at', { ascending: false })
    .limit(10);

  if (error && !isMissingTableError(error)) {
    throw error;
  }
  return (data ?? []) as FeedStatus[];
}

// ── Component ─────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const {
    data: kpis,
    isLoading: kpisLoading,
    isError: kpisError,
    error: kpisErrorObj,
    refetch: refetchKpis,
  } = useQuery({ queryKey: ['admin', 'kpis'], queryFn: fetchKpis, staleTime: 60_000 });

  const {
    data: recentErrors = [],
    isLoading: errorsLoading,
    refetch: refetchErrors,
  } = useQuery({ queryKey: ['admin', 'recentErrors'], queryFn: fetchRecentErrors, staleTime: 60_000 });

  const {
    data: feedStatuses = [],
    isLoading: feedsLoading,
    refetch: refetchFeeds,
  } = useQuery({ queryKey: ['admin', 'feedStatuses'], queryFn: fetchFeedStatuses, staleTime: 60_000 });

  const loading = kpisLoading || errorsLoading || feedsLoading;

  const handleRefreshAll = () => {
    void refetchKpis();
    void refetchErrors();
    void refetchFeeds();
  };

  const handleExportReport = () => {
    if (!kpis) return;
    const rows = [
      { metric: 'Active Feeds', value: kpis.feedsActive, detail: `${kpis.feedsFailing} failing` },
      { metric: 'Total Users', value: kpis.usersTotal, detail: `${kpis.usersNewThisMonth} new this month` },
      { metric: 'Total Signals', value: kpis.signalsTotal, detail: `${kpis.signalsFresh} fresh (24h)` },
      { metric: 'Revenue', value: 0, detail: 'DEMO — Stripe not wired' },
    ];
    exportToCsv(rows, 'socelle_system_health', [
      { key: 'metric', label: 'Metric' },
      { key: 'value', label: 'Value' },
      { key: 'detail', label: 'Detail' },
    ]);
  };

  // ── Error state ───────────────────────────────────────────────────────

  if (kpisError) {
    const message =
      kpisErrorObj instanceof Error ? kpisErrorObj.message : 'Failed to load dashboard metrics.';
    return (
      <div className="py-16 text-center">
        <ShieldAlert className="w-12 h-12 text-[#8E6464] mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-graphite font-sans">Dashboard Unavailable</h3>
        <p className="text-sm text-graphite/60 mt-1 max-w-md mx-auto font-sans">{message}</p>
        <button
          onClick={handleRefreshAll}
          className="mt-4 px-4 py-2 border border-accent text-accent font-medium rounded-lg hover:bg-accent-soft transition-colors font-sans text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Loading state ─────────────────────────────────────────────────────

  if (loading && !kpis) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header skeleton */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="h-8 w-64 bg-accent-soft rounded" />
            <div className="h-4 w-48 bg-accent-soft rounded mt-2" />
          </div>
          <div className="h-10 w-24 bg-accent-soft rounded-lg" />
        </div>
        {/* KPI strip skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-accent-soft rounded-xl p-5">
              <div className="h-4 w-20 bg-accent-soft rounded mb-4" />
              <div className="h-8 w-16 bg-accent-soft rounded" />
              <div className="h-3 w-28 bg-accent-soft rounded mt-2" />
            </div>
          ))}
        </div>
        {/* Errors skeleton */}
        <div className="bg-white border border-accent-soft rounded-xl p-5">
          <div className="h-5 w-32 bg-accent-soft rounded mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-accent-soft rounded" />
            ))}
          </div>
        </div>
        {/* Quick actions skeleton */}
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-12 bg-accent-soft rounded-lg" />
          ))}
        </div>
        {/* Feed status skeleton */}
        <div className="bg-white border border-accent-soft rounded-xl p-5">
          <div className="h-5 w-40 bg-accent-soft rounded mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-accent-soft rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Empty state (no KPI data at all — platform initializing) ──────────

  if (kpis && kpis.feedsActive === 0 && kpis.usersTotal === 0 && kpis.signalsTotal === 0) {
    return (
      <div className="py-16 text-center">
        <Activity className="w-12 h-12 text-accent mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-graphite font-sans">Platform is Initializing</h3>
        <p className="text-sm text-graphite/60 mt-2 max-w-md mx-auto font-sans">
          No feeds, users, or signals found yet. Configure your data feeds and invite users to get started.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/admin/feeds"
            className="px-4 py-2 bg-accent text-white font-medium rounded-lg hover:bg-accent-hover transition-colors font-sans text-sm"
          >
            Configure Feeds
          </Link>
          <Link
            to="/admin/users"
            className="px-4 py-2 border border-accent text-accent font-medium rounded-lg hover:bg-accent-soft transition-colors font-sans text-sm"
          >
            Manage Users
          </Link>
        </div>
      </div>
    );
  }

  // ── Main dashboard ────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-graphite font-sans">System Health</h1>
          <p className="text-graphite/60 font-sans mt-1 text-sm">
            Platform health and operational metrics
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefreshAll}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-accent-soft text-graphite hover:bg-accent-soft disabled:opacity-60 font-sans text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={Rss}
          label="Feeds"
          value={kpis?.feedsActive ?? 0}
          sub={`${kpis?.feedsFailing ?? 0} failing`}
          subTone={kpis?.feedsFailing ? 'warn' : 'neutral'}
        />
        <KpiCard
          icon={Users}
          label="Users"
          value={kpis?.usersTotal ?? 0}
          sub={`${kpis?.usersNewThisMonth ?? 0} new this month`}
          subTone="neutral"
        />
        <KpiCard
          icon={Activity}
          label="Signals"
          value={kpis?.signalsTotal ?? 0}
          sub={`${kpis?.signalsFresh ?? 0} fresh (24h)`}
          subTone={kpis?.signalsFresh === 0 ? 'warn' : 'neutral'}
        />
        <KpiCard
          icon={DollarSign}
          label="Revenue"
          value={null}
          sub="Stripe not wired"
          subTone="neutral"
          demo
        />
      </div>

      {/* Recent Errors */}
      <div className="bg-white border border-accent-soft rounded-xl p-5">
        <h2 className="text-base font-semibold text-graphite font-sans mb-3">Recent Errors</h2>
        {recentErrors.length === 0 ? (
          <div className="flex items-center gap-2 py-3">
            <CheckCircle className="w-5 h-5 text-[#5F8A72]" />
            <span className="text-sm text-graphite/70 font-sans">All systems nominal</span>
          </div>
        ) : (
          <div className="divide-y divide-accent-soft">
            {recentErrors.map((err) => (
              <div key={err.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <AlertTriangle className="w-4 h-4 text-[#8E6464] mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-graphite font-sans truncate">
                        {err.name}
                      </p>
                      <p className="text-xs text-graphite/60 font-sans mt-0.5 line-clamp-2">
                        {err.last_error}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-graphite/40 font-sans whitespace-nowrap">
                    {timeAgo(err.updated_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <button
          type="button"
          onClick={handleRefreshAll}
          className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-accent-soft text-graphite hover:bg-accent-soft font-sans text-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh feeds
        </button>
        <Link
          to="/admin/users"
          className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-accent-soft text-graphite hover:bg-accent-soft font-sans text-sm transition-colors"
        >
          <Users className="w-4 h-4" />
          Manage users
        </Link>
        <Link
          to="/admin/feeds"
          className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-accent-soft text-graphite hover:bg-accent-soft font-sans text-sm transition-colors"
        >
          <Rss className="w-4 h-4" />
          View feeds
        </Link>
        <Link
          to="/admin/cms"
          className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-accent-soft text-graphite hover:bg-accent-soft font-sans text-sm transition-colors"
        >
          <FileText className="w-4 h-4" />
          CMS
        </Link>
        <Link
          to="/admin/market-signals"
          className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-accent-soft text-graphite hover:bg-accent-soft font-sans text-sm transition-colors"
        >
          <Activity className="w-4 h-4" />
          Market signals
        </Link>
        <button
          type="button"
          onClick={handleExportReport}
          disabled={!kpis}
          className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-accent-soft text-graphite hover:bg-accent-soft disabled:opacity-50 font-sans text-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          Export report
        </button>
      </div>

      {/* Feed Status Summary */}
      <div className="bg-white border border-accent-soft rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-graphite font-sans">Feed Status</h2>
          <Link
            to="/admin/feeds"
            className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover font-sans transition-colors"
          >
            View all
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
        {feedStatuses.length === 0 ? (
          <p className="text-sm text-graphite/60 font-sans py-3">No feeds configured yet.</p>
        ) : (
          <div className="divide-y divide-accent-soft">
            {feedStatuses.map((feed) => {
              const health = feedHealthLabel(feed);
              return (
                <div key={feed.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${healthBadgeClasses[health]}`}
                    >
                      {health}
                    </span>
                    <span className="text-sm text-graphite font-sans truncate">{feed.name}</span>
                  </div>
                  <span className="text-xs text-graphite/40 font-sans whitespace-nowrap">
                    {feed.last_run_at ? timeAgo(feed.last_run_at) : 'never'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  subTone,
  demo = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | null;
  sub: string;
  subTone: 'neutral' | 'warn';
  demo?: boolean;
}) {
  return (
    <div className="bg-white border border-accent-soft rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-graphite/60 font-sans">{label}</p>
        <div className="flex items-center gap-2">
          {demo && (
            <span className="text-[10px] font-semibold bg-[#A97A4C]/10 text-[#A97A4C] px-2 py-0.5 rounded-full">
              DEMO
            </span>
          )}
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent-soft text-accent">
            <Icon className="w-4 h-4" />
          </div>
        </div>
      </div>
      <p className="text-3xl font-semibold text-graphite font-sans">
        {value === null ? '--' : value.toLocaleString()}
      </p>
      <p className={`text-xs font-sans mt-1 ${subTone === 'warn' ? 'text-[#A97A4C]' : 'text-graphite/50'}`}>
        {sub}
      </p>
    </div>
  );
}
