/* ═══════════════════════════════════════════════════════════════
   ApiStatusRibbon — INTEL-FLOW-01
   Shows active APIs + data feeds feeding the Intelligence Hub.
   Compact pill ribbon (showDetailed=false) or grid cards (showDetailed=true).
   Pearl Mineral V2 tokens only — no hardcoded hex, no pro-*
   Fake-live compliance: animate-ping ONLY on status=pass AND last active < 10 min
   ═══════════════════════════════════════════════════════════════ */

import { useQuery } from '@tanstack/react-query';
import { Activity, AlertCircle, Clock, HelpCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

// ── Types ──────────────────────────────────────────────────────────────────────

interface ApiSource {
  id: string;
  name: string;
  category: string;
  is_active: boolean;
  last_test_status: 'pass' | 'fail' | 'timeout' | 'untested' | null;
  last_test_latency_ms: number | null;
  last_tested_at: string | null;
}

interface FeedSource {
  id: string;
  name: string;
  feed_type: string | null;
  category: string | null;
  is_enabled: boolean;
  last_fetched_at: string | null;
  signal_count: number | null;
}

type SourceStatus = 'pass' | 'fail' | 'timeout' | 'untested';

interface NormalizedSource {
  id: string;
  name: string;
  category: string;
  status: SourceStatus;
  latencyMs: number | null;
  signalCount: number | null;
  lastActiveAt: string | null;
  sourceType: 'api' | 'feed';
}

export interface ApiStatusRibbonProps {
  showDetailed?: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/** animate-ping compliance: ONLY when status=pass AND last active < 10 min */
function isRecentlyActive(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return Date.now() - new Date(dateStr).getTime() < 10 * 60 * 1000;
}

function getDotStyle(
  status: SourceStatus,
  lastActiveAt: string | null,
): { dotClass: string; showPing: boolean } {
  // FAKE-LIVE-01: animate-ping is ONLY allowed when status=pass AND recently active
  const recent = status === 'pass' && isRecentlyActive(lastActiveAt);
  switch (status) {
    case 'pass':
      return { dotClass: 'bg-signal-up', showPing: recent };
    case 'timeout':
      return { dotClass: 'bg-signal-warn', showPing: false };
    case 'fail':
      return { dotClass: 'bg-signal-down', showPing: false };
    default:
      return { dotClass: 'bg-graphite/30', showPing: false };
  }
}

function normalizeApis(apis: ApiSource[]): NormalizedSource[] {
  return apis.map((a) => ({
    id: `api-${a.id}`,
    name: a.name,
    category: a.category,
    status: (a.last_test_status ?? 'untested') as SourceStatus,
    latencyMs: a.last_test_latency_ms,
    signalCount: null,
    lastActiveAt: a.last_tested_at,
    sourceType: 'api' as const,
  }));
}

function normalizeFeeds(feeds: FeedSource[]): NormalizedSource[] {
  return feeds.map((f) => ({
    id: `feed-${f.id}`,
    name: f.name,
    category: f.category ?? 'Feed',
    status: (f.last_fetched_at ? 'pass' : 'untested') as SourceStatus,
    latencyMs: null,
    signalCount: f.signal_count,
    lastActiveAt: f.last_fetched_at,
    sourceType: 'feed' as const,
  }));
}

// ── SourcePill — compact ribbon item ──────────────────────────────────────────

function SourcePill({ source }: { source: NormalizedSource }) {
  const { dotClass, showPing } = getDotStyle(source.status, source.lastActiveAt);

  const metric =
    source.sourceType === 'api' && source.latencyMs != null
      ? `${source.latencyMs}ms`
      : source.signalCount != null
        ? `${source.signalCount}`
        : null;

  const tooltip = [
    source.name,
    source.category,
    `Last active: ${timeAgo(source.lastActiveAt)}`,
    source.latencyMs != null ? `${source.latencyMs}ms latency` : '',
    source.signalCount != null ? `${source.signalCount} signals` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div
      className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white border border-graphite/8 hover:border-accent/30 transition-colors shrink-0 cursor-default select-none"
      title={tooltip}
      role="status"
      aria-label={`${source.name}: ${source.status}`}
    >
      {/* Status dot — animate-ping ONLY on pass + recently active */}
      <div className="relative flex-shrink-0 w-2 h-2">
        <span className={`block w-2 h-2 rounded-full ${dotClass}`} />
        {showPing && (
          <span
            className={`absolute inset-0 w-2 h-2 rounded-full ${dotClass} animate-ping opacity-75`}
            aria-hidden
          />
        )}
      </div>

      {/* Name (truncated at 18 chars) */}
      <span className="text-xs font-medium text-graphite font-sans whitespace-nowrap">
        {source.name.length > 18 ? `${source.name.slice(0, 18)}\u2026` : source.name}
      </span>

      {/* Secondary metric */}
      {metric !== null && (
        <span className="text-[10px] text-graphite/45 font-sans tabular-nums">{metric}</span>
      )}
    </div>
  );
}

// ── StatusBadge — detailed card status pill ───────────────────────────────────

function StatusBadge({ status }: { status: SourceStatus }) {
  const map: Record<SourceStatus, { label: string; cls: string; Icon: typeof Activity }> = {
    pass:     { label: 'Active',   cls: 'bg-signal-up/10 text-signal-up',     Icon: Activity     },
    timeout:  { label: 'Slow',     cls: 'bg-signal-warn/10 text-signal-warn', Icon: Clock        },
    fail:     { label: 'Error',    cls: 'bg-signal-down/10 text-signal-down', Icon: AlertCircle  },
    untested: { label: 'Untested', cls: 'bg-graphite/8 text-graphite/45',     Icon: HelpCircle   },
  };
  const { label, cls, Icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      <Icon className="w-2.5 h-2.5" aria-hidden />
      {label}
    </span>
  );
}

// ── DetailedCard — expanded grid card ────────────────────────────────────────

function DetailedCard({ source }: { source: NormalizedSource }) {
  const { dotClass, showPing } = getDotStyle(source.status, source.lastActiveAt);

  return (
    <div className="bg-white rounded-xl border border-graphite/8 p-4 space-y-3 hover:border-accent/20 transition-colors">
      {/* Header row: name + category badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Status dot */}
          <div className="relative flex-shrink-0 w-2.5 h-2.5 mt-0.5">
            <span className={`block w-2.5 h-2.5 rounded-full ${dotClass}`} />
            {showPing && (
              <span
                className={`absolute inset-0 rounded-full ${dotClass} animate-ping opacity-75`}
                aria-hidden
              />
            )}
          </div>
          <span className="text-sm font-semibold text-graphite font-sans truncate">
            {source.name}
          </span>
        </div>
        <span className="text-[10px] font-medium bg-accent-soft text-accent px-1.5 py-0.5 rounded-full shrink-0 whitespace-nowrap">
          {source.category}
        </span>
      </div>

      {/* Status pill */}
      <StatusBadge status={source.status} />

      {/* Last active */}
      <p className="text-xs text-graphite/50 font-sans flex items-center gap-1">
        <Clock className="w-3 h-3 text-graphite/30 flex-shrink-0" aria-hidden />
        Last active {timeAgo(source.lastActiveAt)}
      </p>

      {/* Metric + type row */}
      <div className="flex items-center justify-between text-xs font-sans">
        {source.sourceType === 'api' && source.latencyMs != null ? (
          <span className="text-graphite/60">
            <span className="font-semibold text-graphite tabular-nums">{source.latencyMs}</span>
            <span className="ml-0.5">ms</span>
          </span>
        ) : source.signalCount != null ? (
          <span className="text-graphite/60">
            <span className="font-semibold text-graphite tabular-nums">{source.signalCount}</span>
            <span className="ml-0.5">signals</span>
          </span>
        ) : (
          <span className="text-graphite/30">—</span>
        )}
        <span className="text-[10px] text-graphite/30 uppercase tracking-wide">
          {source.sourceType === 'api' ? 'API' : 'Feed'}
        </span>
      </div>

      {/* Sparkline placeholder — reserved for Phase 2 chart integration */}
      <div className="h-8 bg-graphite/[0.04] rounded-md" aria-hidden />
    </div>
  );
}

// ── ApiStatusRibbon ───────────────────────────────────────────────────────────

export default function ApiStatusRibbon({ showDetailed = false }: ApiStatusRibbonProps) {
  const enabled = isSupabaseConfigured;

  const { data: apis = [] } = useQuery<ApiSource[]>({
    queryKey: ['intelligence-api-sources'],
    queryFn: async () => {
      const { data } = await supabase
        .from('api_registry')
        .select('id, name, category, is_active, last_test_status, last_test_latency_ms, last_tested_at')
        .eq('is_active', true)
        .order('category');
      return (data ?? []) as ApiSource[];
    },
    enabled,
    staleTime: 2 * 60 * 1000,
  });

  const { data: feeds = [] } = useQuery<FeedSource[]>({
    queryKey: ['intelligence-feed-sources'],
    queryFn: async () => {
      const { data } = await supabase
        .from('data_feeds')
        .select('id, name, feed_type, category, is_enabled, last_fetched_at, signal_count')
        .eq('is_enabled', true)
        .order('signal_count', { ascending: false })
        .limit(12);
      return (data ?? []) as FeedSource[];
    },
    enabled,
    staleTime: 60_000,
    refetchInterval: 2 * 60 * 1000,
  });

  const allSources: NormalizedSource[] = [
    ...normalizeApis(apis),
    ...normalizeFeeds(feeds),
  ];

  if (allSources.length === 0) return null;

  // ── Compact ribbon ────────────────────────────────────────────────
  if (!showDetailed) {
    return (
      <div
        className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide"
        aria-label="Live data sources"
        role="list"
      >
        <span className="text-xs font-medium text-graphite/60 font-sans shrink-0 uppercase tracking-wider">
          Live Sources
        </span>
        {allSources.map((source) => (
          <div key={source.id} role="listitem">
            <SourcePill source={source} />
          </div>
        ))}
      </div>
    );
  }

  // ── Detailed card grid ────────────────────────────────────────────
  const activeCount = allSources.filter((s) => s.status === 'pass').length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-graphite font-sans">Data Sources</h3>
        <span className="text-xs text-graphite/45 font-sans tabular-nums">
          {activeCount} of {allSources.length} active
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3" aria-label="Data source status cards">
        {allSources.map((source) => (
          <DetailedCard key={source.id} source={source} />
        ))}
      </div>
    </div>
  );
}
