/**
 * useDataFeedStats — W13-05
 * Provides data_feeds table statistics for intelligence surfaces.
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

export function useDataFeedStats(): UseDataFeedStatsReturn {
  const { data, isLoading: loading } = useQuery({
    queryKey: ['data_feed_stats'],
    queryFn: async (): Promise<FeedStatsResult> => {
      const [{ data: feedData, error }, { data: confidenceRows, error: confidenceError }] = await Promise.all([
        supabase
          .from('data_feeds')
          .select('id, is_enabled, category, feed_type, signal_count, last_fetched_at, last_error'),
        supabase
          .from('market_signals')
          .select('confidence_score')
          .eq('active', true)
          .not('confidence_score', 'is', null)
          .limit(5000),
      ]);

      if (error || !feedData) throw new Error(error?.message ?? 'Failed to fetch feed stats');

      const totalFeeds = feedData.length;
      const enabledFeeds = feedData.filter((f) => f.is_enabled).length;
      const totalSignals = feedData.reduce((sum, f) => sum + (f.signal_count || 0), 0);

      const feedsByCategory: Record<string, number> = {};
      const feedsByType: Record<string, number> = {};

      for (const feed of feedData) {
        feedsByCategory[feed.category] = (feedsByCategory[feed.category] || 0) + 1;
        feedsByType[feed.feed_type] = (feedsByType[feed.feed_type] || 0) + 1;
      }

      const fetchedDates = feedData
        .filter((f) => f.last_fetched_at)
        .map((f) => new Date(f.last_fetched_at).getTime());
      const lastOrchestratorRun =
        fetchedDates.length > 0
          ? new Date(Math.max(...fetchedDates)).toISOString()
          : null;

      const feedsWithErrors = feedData.filter((f) => f.last_error).length;
      const feedsNeverFetched = feedData.filter((f) => !f.last_fetched_at).length;
      const avgConfidence =
        confidenceError || !confidenceRows || confidenceRows.length === 0
          ? null
          : confidenceRows.reduce((sum, row) => sum + Number(row.confidence_score ?? 0), 0) /
            confidenceRows.length;

      return {
        stats: {
          totalFeeds,
          enabledFeeds,
          totalSignals,
          feedsByCategory,
          feedsByType,
          lastOrchestratorRun,
          feedsWithErrors,
          feedsNeverFetched,
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
