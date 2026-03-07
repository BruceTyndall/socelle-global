/**
 * useDataFeedStats — W13-05
 * Provides data_feeds table statistics for intelligence surfaces.
 * Follows useIntelligence() canonical pattern: isLive + preview fallback.
 *
 * Data label: LIVE when DB-connected, PREVIEW when fallback.
 * Authority: build_tracker.md WO W13-05
 */
import { useState, useEffect } from 'react';
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

export function useDataFeedStats(): UseDataFeedStatsReturn {
  const [stats, setStats] = useState<DataFeedStats>(EMPTY_STATS);
  const [avgConfidence, setAvgConfidence] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      setLoading(true);

      if (!isSupabaseConfigured) {
        setStats(EMPTY_STATS);
        setAvgConfidence(null);
        setIsLive(false);
        setLoading(false);
        return;
      }

      try {
        const [{ data, error }, { data: confidenceRows, error: confidenceError }] = await Promise.all([
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

        if (cancelled) return;

        if (error || !data) {
          // Table doesn't exist or query error — preview empty state
          setStats(EMPTY_STATS);
          setAvgConfidence(null);
          setIsLive(false);
          setLoading(false);
          return;
        }

        const totalFeeds = data.length;
        const enabledFeeds = data.filter((f) => f.is_enabled).length;
        const totalSignals = data.reduce((sum, f) => sum + (f.signal_count || 0), 0);

        const feedsByCategory: Record<string, number> = {};
        const feedsByType: Record<string, number> = {};

        for (const feed of data) {
          feedsByCategory[feed.category] = (feedsByCategory[feed.category] || 0) + 1;
          feedsByType[feed.feed_type] = (feedsByType[feed.feed_type] || 0) + 1;
        }

        // Most recent fetch across all feeds = proxy for last orchestrator run
        const fetchedDates = data
          .filter((f) => f.last_fetched_at)
          .map((f) => new Date(f.last_fetched_at).getTime());
        const lastOrchestratorRun =
          fetchedDates.length > 0
            ? new Date(Math.max(...fetchedDates)).toISOString()
            : null;

        const feedsWithErrors = data.filter((f) => f.last_error).length;
        const feedsNeverFetched = data.filter((f) => !f.last_fetched_at).length;
        const avgConfidenceValue =
          confidenceError || !confidenceRows || confidenceRows.length === 0
            ? null
            : confidenceRows.reduce((sum, row) => sum + Number(row.confidence_score ?? 0), 0) /
              confidenceRows.length;

        setStats({
          totalFeeds,
          enabledFeeds,
          totalSignals,
          feedsByCategory,
          feedsByType,
          lastOrchestratorRun,
          feedsWithErrors,
          feedsNeverFetched,
        });
        setAvgConfidence(avgConfidenceValue);
        setIsLive(true);
      } catch {
        if (!cancelled) {
          setStats(EMPTY_STATS);
          setAvgConfidence(null);
          setIsLive(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

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
