/**
 * useDataFeedStats — W13-05
 * Provides data_feeds table statistics for intelligence surfaces.
 * Follows useIntelligence() canonical pattern: isLive + mock fallback.
 *
 * Data label: LIVE when DB-connected, DEMO when fallback.
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
  loading: boolean;
  isLive: boolean;
}

const MOCK_STATS: DataFeedStats = {
  totalFeeds: 102,
  enabledFeeds: 0,
  totalSignals: 0,
  feedsByCategory: {
    trade_pub: 23,
    regulatory: 6,
    academic: 6,
    brand_news: 14,
    supplier: 9,
    government: 10,
    market_data: 7,
    social: 5,
    regional: 6,
    association: 6,
    press_release: 3,
    ingredients: 4,
    jobs: 2,
    events: 1,
  },
  feedsByType: { rss: 80, api: 18, scraper: 3, webhook: 1 },
  lastOrchestratorRun: null,
  feedsWithErrors: 0,
  feedsNeverFetched: 102,
};

export function useDataFeedStats(): UseDataFeedStatsReturn {
  const [stats, setStats] = useState<DataFeedStats>(MOCK_STATS);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      setLoading(true);

      if (!isSupabaseConfigured) {
        setStats(MOCK_STATS);
        setIsLive(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('data_feeds')
          .select('id, is_enabled, category, feed_type, signal_count, last_fetched_at, last_error');

        if (cancelled) return;

        if (error || !data) {
          // Table doesn't exist or query error — DEMO fallback
          setStats(MOCK_STATS);
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
        setIsLive(true);
      } catch {
        if (!cancelled) {
          setStats(MOCK_STATS);
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

  return { stats, loading, isLive };
}
