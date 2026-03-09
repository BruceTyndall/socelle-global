import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Download,
  ExternalLink,
  FileText,
  RefreshCw,
  Rss,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { exportToCsv } from '../../lib/csvExport';

// -- Types --------------------------------------------------------------------

interface KpiData {
  feedsEnabled: number;
  feedRuns24h: number;
  feedFailures24h: number;
  feedErrorRate24h: number;
  usersTotal: number;
  usersActive24h: number;
  aiSpend24hUsd: number;
  aiSpend30dUsd: number;
  aiRequests24h: number;
  aiFailures24h: number;
  aiErrorRate24h: number;
  overallErrorRate24h: number;
}

interface IncidentItem {
  id: string;
  source: 'feed' | 'ai';
  name: string;
  message: string;
  occurred_at: string;
  severity: 'warn' | 'error';
}

interface FeedStatus {
  id: string;
  name: string;
  last_run_at: string | null;
  last_error: string | null;
  is_enabled: boolean;
}

// -- Helpers ------------------------------------------------------------------

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

function percent(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Number(((numerator / denominator) * 100).toFixed(1));
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

// -- Data fetching -------------------------------------------------------------

async function fetchKpis(): Promise<KpiData> {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    feedsEnabledRes,
    feedRuns24hRes,
    feedFailures24hRes,
    usersTotalRes,
    usersActive24hRes,
    aiLedger24hRes,
    aiLedger30dRes,
    aiRequests24hRes,
    aiBlocked24hRes,
    aiRateLimited24hRes,
  ] = await Promise.all([
    supabase.from('data_feeds').select('id', { count: 'exact', head: true }).eq('is_enabled', true),
    supabase.from('feed_run_log').select('id', { count: 'exact', head: true }).gte('started_at', twentyFourHoursAgo),
    supabase.from('feed_run_log').select('id', { count: 'exact', head: true }).gte('started_at', twentyFourHoursAgo).eq('status', 'error'),
    supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('user_profiles').select('id', { count: 'exact', head: true }).gte('updated_at', twentyFourHoursAgo),
    supabase.from('ai_credit_ledger').select('amount_usd').gte('created_at', twentyFourHoursAgo),
    supabase.from('ai_credit_ledger').select('amount_usd').gte('created_at', thirtyDaysAgo),
    supabase.from('audit_logs').select('id', { count: 'exact', head: true }).eq('action', 'ai.request').gte('created_at', twentyFourHoursAgo),
    supabase.from('audit_logs').select('id', { count: 'exact', head: true }).eq('action', 'ai.blocked').gte('created_at', twentyFourHoursAgo),
    supabase.from('audit_logs').select('id', { count: 'exact', head: true }).eq('action', 'ai.rate_limited').gte('created_at', twentyFourHoursAgo),
  ]);

  const feedsEnabled = safeCount(feedsEnabledRes);
  const feedRuns24h = safeCount(feedRuns24hRes);
  const feedFailures24h = safeCount(feedFailures24hRes);
  const usersTotal = safeCount(usersTotalRes);
  const usersActive24h = safeCount(usersActive24hRes);

  const aiSpend24hUsd = ((aiLedger24hRes.data ?? []) as Array<{ amount_usd: number | null }>)
    .reduce((sum, row) => sum + Math.max(0, Number(row.amount_usd ?? 0)), 0);
  const aiSpend30dUsd = ((aiLedger30dRes.data ?? []) as Array<{ amount_usd: number | null }>)
    .reduce((sum, row) => sum + Math.max(0, Number(row.amount_usd ?? 0)), 0);

  const aiRequests24h = safeCount(aiRequests24hRes);
  const aiFailures24h = safeCount(aiBlocked24hRes) + safeCount(aiRateLimited24hRes);

  const feedErrorRate24h = percent(feedFailures24h, feedRuns24h);
  const aiErrorRate24h = percent(aiFailures24h, aiRequests24h + aiFailures24h);
  const overallErrorRate24h = percent(
    feedFailures24h + aiFailures24h,
    feedRuns24h + aiRequests24h + aiFailures24h,
  );

  return {
    feedsEnabled,
    feedRuns24h,
    feedFailures24h,
    feedErrorRate24h,
    usersTotal,
    usersActive24h,
    aiSpend24hUsd,
    aiSpend30dUsd,
    aiRequests24h,
    aiFailures24h,
    aiErrorRate24h,
    overallErrorRate24h,
  };
}

async function fetchRecentIncidents(): Promise<IncidentItem[]> {
  const [feedErrorRes, aiIncidentRes] = await Promise.all([
    supabase
      .from('data_feeds')
      .select('id, name, last_error, updated_at')
      .not('last_error', 'is', null)
      .neq('last_error', '')
      .order('updated_at', { ascending: false })
      .limit(6),
    supabase
      .from('audit_logs')
      .select('id, action, details, created_at')
      .in('action', ['ai.blocked', 'ai.rate_limited'])
      .order('created_at', { ascending: false })
      .limit(6),
  ]);

  if (feedErrorRes.error && !isMissingTableError(feedErrorRes.error)) {
    throw feedErrorRes.error;
  }
  if (aiIncidentRes.error && !isMissingTableError(aiIncidentRes.error)) {
    throw aiIncidentRes.error;
  }

  const feedItems: IncidentItem[] = ((feedErrorRes.data ?? []) as Array<{
    id: string;
    name: string;
    last_error: string;
    updated_at: string;
  }>).map((row) => ({
    id: `feed-${row.id}`,
    source: 'feed',
    name: row.name,
    message: row.last_error,
    occurred_at: row.updated_at,
    severity: 'error',
  }));

  const aiItems: IncidentItem[] = ((aiIncidentRes.data ?? []) as Array<{
    id: string;
    action: string;
    details: Record<string, unknown> | null;
    created_at: string;
  }>).map((row) => {
    const reason = typeof row.details?.reason === 'string' ? row.details.reason : row.action;
    return {
      id: `ai-${row.id}`,
      source: 'ai',
      name: row.action,
      message: reason,
      occurred_at: row.created_at,
      severity: row.action === 'ai.rate_limited' ? 'warn' : 'error',
    };
  });

  return [...feedItems, ...aiItems]
    .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
    .slice(0, 8);
}

async function fetchFeedStatuses(): Promise<FeedStatus[]> {
  const { data, error } = await supabase
    .from('data_feeds')
    .select('id, name, is_enabled, last_run_at, last_error')
    .eq('is_enabled', true)
    .order('last_run_at', { ascending: false })
    .limit(10);

  if (error && !isMissingTableError(error)) {
    throw error;
  }
  return (data ?? []) as FeedStatus[];
}

// -- Component -----------------------------------------------------------------

export default function AdminDashboard() {
  const {
    data: kpis,
    isLoading: kpisLoading,
    isError: kpisError,
    error: kpisErrorObj,
    refetch: refetchKpis,
  } = useQuery({
    queryKey: ['admin', 'system-health-kpis'],
    queryFn: fetchKpis,
    staleTime: 60_000,
  });

  const {
    data: incidents = [],
    isLoading: incidentsLoading,
    refetch: refetchIncidents,
  } = useQuery({
    queryKey: ['admin', 'system-health-incidents'],
    queryFn: fetchRecentIncidents,
    staleTime: 60_000,
  });

  const {
    data: feedStatuses = [],
    isLoading: feedsLoading,
    refetch: refetchFeeds,
  } = useQuery({
    queryKey: ['admin', 'feed-statuses'],
    queryFn: fetchFeedStatuses,
    staleTime: 60_000,
  });

  const loading = kpisLoading || incidentsLoading || feedsLoading;

  const handleRefreshAll = () => {
    void refetchKpis();
    void refetchIncidents();
    void refetchFeeds();
  };

  const handleExportReport = () => {
    if (!kpis) return;
    const rows = [
      {
        metric: 'Enabled Feeds',
        value: kpis.feedsEnabled,
        detail: `${kpis.feedFailures24h}/${kpis.feedRuns24h} failures (24h)`,
      },
      {
        metric: 'Active Users (24h)',
        value: kpis.usersActive24h,
        detail: `${kpis.usersTotal} total users`,
      },
      {
        metric: 'AI Spend (24h)',
        value: Number(kpis.aiSpend24hUsd.toFixed(2)),
        detail: `$${kpis.aiSpend30dUsd.toFixed(2)} in last 30d`,
      },
      {
        metric: 'AI Error Rate (24h)',
        value: Number(kpis.aiErrorRate24h.toFixed(1)),
        detail: `${kpis.aiFailures24h}/${kpis.aiRequests24h + kpis.aiFailures24h} failed requests`,
      },
      {
        metric: 'Overall Error Rate (24h)',
        value: Number(kpis.overallErrorRate24h.toFixed(1)),
        detail: `Feeds + AI combined`,
      },
    ];

    exportToCsv(rows, 'socelle_system_health', [
      { key: 'metric', label: 'Metric' },
      { key: 'value', label: 'Value' },
      { key: 'detail', label: 'Detail' },
    ]);
  };

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

  if (loading && !kpis) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="h-8 w-64 bg-accent-soft rounded" />
            <div className="h-4 w-48 bg-accent-soft rounded mt-2" />
          </div>
          <div className="h-10 w-24 bg-accent-soft rounded-lg" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-accent-soft rounded-xl p-5">
              <div className="h-4 w-20 bg-accent-soft rounded mb-4" />
              <div className="h-8 w-16 bg-accent-soft rounded" />
              <div className="h-3 w-28 bg-accent-soft rounded mt-2" />
            </div>
          ))}
        </div>
        <div className="bg-white border border-accent-soft rounded-xl p-5">
          <div className="h-5 w-32 bg-accent-soft rounded mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-accent-soft rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (kpis && kpis.feedsEnabled === 0 && kpis.usersTotal === 0) {
    return (
      <div className="py-16 text-center">
        <Activity className="w-12 h-12 text-accent mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-graphite font-sans">Platform is Initializing</h3>
        <p className="text-sm text-graphite/60 mt-2 max-w-md mx-auto font-sans">
          No feeds or users found yet. Configure data feeds and invite users to start collecting health telemetry.
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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-graphite font-sans">System Health</h1>
          <p className="text-graphite/60 font-sans mt-1 text-sm">
            Live operational telemetry: feeds, AI cost, user activity, and error rates.
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={Rss}
          label="Feeds Enabled"
          value={kpis?.feedsEnabled ?? 0}
          sub={`${kpis?.feedFailures24h ?? 0}/${kpis?.feedRuns24h ?? 0} failures (24h)`}
          subTone={(kpis?.feedFailures24h ?? 0) > 0 ? 'warn' : 'neutral'}
        />
        <KpiCard
          icon={Users}
          label="Active Users (24h)"
          value={kpis?.usersActive24h ?? 0}
          sub={`${kpis?.usersTotal ?? 0} total users`}
          subTone="neutral"
        />
        <KpiCard
          icon={DollarSign}
          label="AI Spend (24h)"
          value={kpis?.aiSpend24hUsd ?? 0}
          valueLabel={`$${(kpis?.aiSpend24hUsd ?? 0).toFixed(2)}`}
          sub={`$${(kpis?.aiSpend30dUsd ?? 0).toFixed(2)} last 30d`}
          subTone="neutral"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Error Rate (24h)"
          value={kpis?.overallErrorRate24h ?? 0}
          valueLabel={`${(kpis?.overallErrorRate24h ?? 0).toFixed(1)}%`}
          sub={`AI ${(kpis?.aiErrorRate24h ?? 0).toFixed(1)}% | Feed ${(kpis?.feedErrorRate24h ?? 0).toFixed(1)}%`}
          subTone={(kpis?.overallErrorRate24h ?? 0) > 5 ? 'warn' : 'neutral'}
        />
      </div>

      <div className="bg-white border border-accent-soft rounded-xl p-5">
        <h2 className="text-base font-semibold text-graphite font-sans mb-3">Recent Incidents</h2>
        {incidents.length === 0 ? (
          <div className="flex items-center gap-2 py-3">
            <CheckCircle className="w-5 h-5 text-[#5F8A72]" />
            <span className="text-sm text-graphite/70 font-sans">No recent feed or AI incidents</span>
          </div>
        ) : (
          <div className="divide-y divide-accent-soft">
            {incidents.map((incident) => (
              <div key={incident.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <AlertTriangle
                      className={`w-4 h-4 mt-0.5 shrink-0 ${incident.severity === 'error' ? 'text-[#8E6464]' : 'text-[#A97A4C]'}`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-graphite font-sans truncate">
                        [{incident.source.toUpperCase()}] {incident.name}
                      </p>
                      <p className="text-xs text-graphite/60 font-sans mt-0.5 line-clamp-2">
                        {incident.message}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-graphite/40 font-sans whitespace-nowrap">
                    {timeAgo(incident.occurred_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
          <p className="text-sm text-graphite/60 font-sans py-3">No enabled feeds found.</p>
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

// -- KPI Card ------------------------------------------------------------------

function KpiCard({
  icon: Icon,
  label,
  value,
  valueLabel,
  sub,
  subTone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  valueLabel?: string;
  sub: string;
  subTone: 'neutral' | 'warn';
}) {
  return (
    <div className="bg-white border border-accent-soft rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-graphite/60 font-sans">{label}</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent-soft text-accent">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-3xl font-semibold text-graphite font-sans">
        {valueLabel ?? value.toLocaleString()}
      </p>
      <p className={`text-xs font-sans mt-1 ${subTone === 'warn' ? 'text-[#A97A4C]' : 'text-graphite/50'}`}>
        {sub}
      </p>
    </div>
  );
}
