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

/* Mock fallback — matches current hardcoded values across public pages */
const MOCK_STATS: PlatformStats = {
  brandsCount: 120,
  operatorsCount: 500,
  signalsCount: 34,
  protocolsCount: 48,
  jobsCount: 12,
  eventsCount: 8,
  dataSourcesCount: 102,
};

export function usePlatformStats(): UsePlatformStatsReturn {
  const [stats, setStats] = useState<PlatformStats>(MOCK_STATS);
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

        // Use live data if any table returned a count > 0
        const hasData = [brands, signals, protocols, jobs, events, operators, dataSources]
          .some(r => !r.error && (r.count ?? 0) > 0);

        if (hasData) {
          setStats({
            brandsCount: brands.count ?? MOCK_STATS.brandsCount,
            signalsCount: signals.count ?? MOCK_STATS.signalsCount,
            protocolsCount: protocols.count ?? MOCK_STATS.protocolsCount,
            jobsCount: jobs.count ?? MOCK_STATS.jobsCount,
            eventsCount: events.count ?? MOCK_STATS.eventsCount,
            operatorsCount: operators.count ?? MOCK_STATS.operatorsCount,
            dataSourcesCount: dataSources.count ?? MOCK_STATS.dataSourcesCount,
          });
          setIsLive(true);
        } else {
          setStats(MOCK_STATS);
          setIsLive(false);
        }
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
    return () => { cancelled = true; };
  }, []);

  return { stats, loading, isLive };
}
