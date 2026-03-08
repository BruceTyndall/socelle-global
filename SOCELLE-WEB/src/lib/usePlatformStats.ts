/* ═══════════════════════════════════════════════════════════════
   usePlatformStats — W12-31
   Multi-table COUNT queries for public page stat surfaces.
   Follows useIntelligence() canonical pattern: isLive + empty fallback.
   Migrated to TanStack Query v5 (V2-TECH-04).
   ═══════════════════════════════════════════════════════════════ */
import { useQuery } from '@tanstack/react-query';
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
  const { data, isLoading: loading } = useQuery({
    queryKey: ['platform_stats'],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);

      const [brands, signals, protocols, jobs, events, operators, dataSources] = await Promise.all([
        supabase.from('brands').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('market_signals').select('*', { count: 'exact', head: true }).eq('active', true),
        supabase.from('canonical_protocols').select('*', { count: 'exact', head: true }),
        supabase.from('job_postings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'active').gte('date', today),
        supabase.from('access_requests').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('data_feeds').select('*', { count: 'exact', head: true }),
      ]);

      const countOrZero = (result: { error: unknown; count: number | null }) =>
        result.error ? 0 : (result.count ?? 0);

      return {
        brandsCount: countOrZero(brands),
        signalsCount: countOrZero(signals),
        protocolsCount: countOrZero(protocols),
        jobsCount: countOrZero(jobs),
        eventsCount: countOrZero(events),
        operatorsCount: countOrZero(operators),
        dataSourcesCount: countOrZero(dataSources),
      } satisfies PlatformStats;
    },
    enabled: isSupabaseConfigured,
    staleTime: 10 * 60 * 1000, // 10 min — counts don't need frequent refresh
  });

  const stats = data ?? EMPTY_STATS;
  const isLive = !!data;

  return { stats, loading, isLive };
}
