/**
 * useDataFeedStats — W13-05
 * Provides feed-like stats for intelligence surfaces.
 * Follows useIntelligence() canonical pattern: isLive + preview fallback.
 *
 * Data label: LIVE when DB-connected, PREVIEW when fallback.
 * Authority: build_tracker.md WO W13-05
 * Migrated to TanStack Query v5 (V2-TECH-04).
 */
import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../supabase';

export interface DataFeedStats {
  totalFeeds: number;
  enabledFeeds: number;
  totalSignals: number;
  feedsByCategory: Record<string, number>;
  feedsByType: Record<string, number>;
  lastOrchestratorRun: string | null;
  feedsWithErrors: number;
  feedsNeverFetched: number;
}

export interface UseDataFeedStatsReturn {
  stats: DataFeedStats;
  totalFeeds: number;
  enabledFeeds: number;
  totalSignals: number;
  avgConfidence: number | null;
  lastOrchestratorRun: string | null;
  loading: boolean;
  isLive: boolean;
}

const EMPTY_STATS: DataFeedStats = {
  totalFeeds: 0,
  enabledFeeds: 0,
  totalSignals: 0,
  feedsByCategory: {},
  feedsByType: {},
  lastOrchestratorRun: null,
  feedsWithErrors: 0,
  feedsNeverFetched: 0,
};

interface FeedStatsResult {
  stats: DataFeedStats;
  avgConfidence: number | null;
}

interface SignalStatsRow {
  id: string;
  category: string | null;
  source: string | null;
  source_type: string | null;
  data_source: string | null;
  confidence_score: number | null;
  updated_at: string | null;
}

export function useDataFeedStats(): UseDataFeedStatsReturn {
  const { data, isLoading: loading } = useQuery({
    queryKey: ['data_feed_stats'],
    queryFn: async (): Promise<FeedStatsResult> => {
      const { data, error } = await supabase
        .from('market_signals')
        .select('id, category, source, source_type, data_source, confidence_score, updated_at')
        .eq('active', true)
        .order('updated_at', { ascending: false })
        .limit(5000);

      if (error) {
        console.warn('[useDataFeedStats] fetch error:', error.message);
        return { stats: EMPTY_STATS, avgConfidence: null };
      }

      const signalRows = (data ?? []) as SignalStatsRow[];
      const totalSignals = signalRows.length;
      const sourceKeys = new Set<string>();

      const feedsByCategory: Record<string, number> = {};
      const feedsByType: Record<string, number> = {};

      for (const row of signalRows) {
        const categoryKey = row.category ?? 'uncategorized';
        const sourceTypeKey = row.source_type ?? 'unknown';
        const sourceKey = row.data_source ?? row.source ?? row.source_type ?? null;

        feedsByCategory[categoryKey] = (feedsByCategory[categoryKey] || 0) + 1;
        feedsByType[sourceTypeKey] = (feedsByType[sourceTypeKey] || 0) + 1;
        if (sourceKey) sourceKeys.add(sourceKey);
      }

      const totalFeeds = sourceKeys.size;
      const enabledFeeds = totalFeeds;

      const fetchedDates = signalRows
        .filter((s) => s.updated_at)
        .map((s) => new Date(s.updated_at as string).getTime())
        .filter((ts) => Number.isFinite(ts));

      const lastOrchestratorRun =
        fetchedDates.length > 0
          ? new Date(Math.max(...fetchedDates)).toISOString()
          : null;

      const confidenceValues = signalRows
        .map((row) => row.confidence_score)
        .filter((v): v is number => typeof v === 'number' && Number.isFinite(v));

      const avgConfidence =
        confidenceValues.length === 0
          ? null
          : confidenceValues.reduce((sum, v) => sum + v, 0) / confidenceValues.length;

      return {
        stats: {
          totalFeeds,
          enabledFeeds,
          totalSignals,
          feedsByCategory,
          feedsByType,
          lastOrchestratorRun,
          feedsWithErrors: 0,
          feedsNeverFetched: 0,
        },
        avgConfidence,
      };
    },
    enabled: isSupabaseConfigured,
  });

  const stats = data?.stats ?? EMPTY_STATS;
  const avgConfidence = data?.avgConfidence ?? null;
  const isLive = !!data;

  return {
    stats,
    totalFeeds: stats.totalFeeds,
    enabledFeeds: stats.enabledFeeds,
    totalSignals: stats.totalSignals,
    avgConfidence,
    lastOrchestratorRun: stats.lastOrchestratorRun,
    loading,
    isLive,
  };
}
