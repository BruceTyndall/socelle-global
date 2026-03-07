/* ═══════════════════════════════════════════════════════════════
   usePlatformStats — W12-31
   Multi-table COUNT queries for public page stat surfaces.
   Follows useIntelligence() canonical pattern: isLive + mock fallback.
   ═══════════════════════════════════════════════════════════════ */
import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

export interface PlatformStats {
  brandsCount: number;
  operatorsCount: number;
  signalsCount: number;
  protocolsCount: number;
  jobsCount: number;
  eventsCount: number;
  dataSourcesCount: number;
}

export interface UsePlatformStatsReturn {
  stats: PlatformStats;
  loading: boolean;
  isLive: boolean;
}

const EMPTY_STATS: PlatformStats = {
  brandsCount: 0,
  operatorsCount: 0,
  signalsCount: 0,
  protocolsCount: 0,
  jobsCount: 0,
  eventsCount: 0,
  dataSourcesCount: 0,
};

export function usePlatformStats(): UsePlatformStatsReturn {
  const [stats, setStats] = useState<PlatformStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      setLoading(true);

      if (!isSupabaseConfigured) {
        setStats(EMPTY_STATS);
        setIsLive(false);
        setLoading(false);
        return;
      }

      try {
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD for events.date

        const [brands, signals, protocols, jobs, events, operators, dataSources] = await Promise.all([
          supabase.from('brands').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('market_signals').select('*', { count: 'exact', head: true }).eq('active', true),
          supabase.from('canonical_protocols').select('*', { count: 'exact', head: true }),
          supabase.from('job_postings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'active').gte('date', today),
          supabase.from('access_requests').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
          supabase.from('data_feeds').select('*', { count: 'exact', head: true }),
        ]);

        if (cancelled) return;

        const countOrNull = (result: { error: unknown; count: number | null }) =>
          result.error ? null : (result.count ?? 0);

        const liveCounts = {
          brandsCount: countOrNull(brands),
          signalsCount: countOrNull(signals),
          protocolsCount: countOrNull(protocols),
          jobsCount: countOrNull(jobs),
          eventsCount: countOrNull(events),
          operatorsCount: countOrNull(operators),
          dataSourcesCount: countOrNull(dataSources),
        };

        const hasAnyLiveSource = Object.values(liveCounts).some((v) => v !== null);

        setStats({
          brandsCount: liveCounts.brandsCount ?? 0,
          signalsCount: liveCounts.signalsCount ?? 0,
          protocolsCount: liveCounts.protocolsCount ?? 0,
          jobsCount: liveCounts.jobsCount ?? 0,
          eventsCount: liveCounts.eventsCount ?? 0,
          operatorsCount: liveCounts.operatorsCount ?? 0,
          dataSourcesCount: liveCounts.dataSourcesCount ?? 0,
        });
        setIsLive(hasAnyLiveSource);
      } catch {
        if (!cancelled) {
          setStats(EMPTY_STATS);
          setIsLive(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStats();
    return () => { cancelled = true; };
  }, []);

  return { stats, loading, isLive };
}
