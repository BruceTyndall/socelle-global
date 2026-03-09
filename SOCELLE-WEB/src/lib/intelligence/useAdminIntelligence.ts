/**
 * useAdminIntelligence — live data hook for IntelligenceDashboard
 * Data sources: market_signals, businesses, brands, account_subscriptions,
 *               api_registry, data_feeds
 * Authority: INTEL-ADMIN-01
 */

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../supabase';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AdminMetrics {
  totalSignals: number;
  totalOperators: number;
  totalBrands: number;
  totalSubscriptions: number;
}

export interface AdminSignalRow {
  id: string;
  title: string;
  signal_type: string;
  confidence: number | null;
  direction: 'up' | 'down' | 'stable' | null;
  updated_at: string;
  source_name: string | null;
  tier_visibility: string | null;
  status: 'active' | 'draft' | 'archived' | null;
}

export interface ApiHealthRow {
  id: string;
  name: string;
  category: string;
  is_active: boolean;
  last_test_status: 'pass' | 'fail' | 'timeout' | 'untested' | null;
  last_tested_at: string | null;
  last_test_latency_ms: number | null;
}

export interface FeedHealthRow {
  id: string;
  name: string;
  is_enabled: boolean;
  last_fetched_at: string | null;
  last_error: string | null;
  signal_count: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function fetchMetrics(): Promise<AdminMetrics> {
  const [signalRes, operatorRes, brandRes, subRes] = await Promise.all([
    supabase.from('market_signals').select('*', { count: 'exact', head: true }),
    supabase.from('businesses').select('*', { count: 'exact', head: true }),
    supabase.from('brands').select('*', { count: 'exact', head: true }),
    supabase
      .from('account_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
  ]);

  if (signalRes.error) throw signalRes.error;
  if (operatorRes.error) throw operatorRes.error;
  if (brandRes.error) throw brandRes.error;
  // account_subscriptions may not exist yet — degrade gracefully
  const subCount = subRes.error ? 0 : (subRes.count ?? 0);

  return {
    totalSignals: signalRes.count ?? 0,
    totalOperators: operatorRes.count ?? 0,
    totalBrands: brandRes.count ?? 0,
    totalSubscriptions: subCount,
  };
}

async function fetchSignals(): Promise<AdminSignalRow[]> {
  const { data, error } = await supabase
    .from('market_signals')
    .select(
      'id, title, signal_type, confidence, direction, updated_at, source_name, tier_visibility, status'
    )
    .order('updated_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return (data ?? []) as AdminSignalRow[];
}

async function fetchApiHealth(): Promise<ApiHealthRow[]> {
  const { data, error } = await supabase
    .from('api_registry')
    .select(
      'id, name, category, is_active, last_test_status, last_tested_at, last_test_latency_ms'
    )
    .order('name');

  if (error) throw error;
  return (data ?? []) as ApiHealthRow[];
}

async function fetchFeedHealth(): Promise<FeedHealthRow[]> {
  const { data, error } = await supabase
    .from('data_feeds')
    .select('id, name, is_enabled, last_fetched_at, last_error, signal_count')
    .order('name');

  if (error) throw error;
  return (data ?? []) as FeedHealthRow[];
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAdminIntelligence() {
  const queryClient = useQueryClient();
  const enabled = isSupabaseConfigured;

  const metricsQuery = useQuery<AdminMetrics, Error>({
    queryKey: ['admin-intelligence-metrics'],
    queryFn: fetchMetrics,
    enabled,
    staleTime: 2 * 60 * 1000, // 2 min
  });

  const signalsQuery = useQuery<AdminSignalRow[], Error>({
    queryKey: ['admin-market-signals'],
    queryFn: fetchSignals,
    enabled,
    staleTime: 60 * 1000, // 1 min
  });

  const apiHealthQuery = useQuery<ApiHealthRow[], Error>({
    queryKey: ['admin-api-health'],
    queryFn: fetchApiHealth,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 min
  });

  const feedHealthQuery = useQuery<FeedHealthRow[], Error>({
    queryKey: ['admin-feed-health'],
    queryFn: fetchFeedHealth,
    enabled,
    staleTime: 60 * 1000, // 1 min
  });

  // Realtime: invalidate signal + metrics queries on new INSERT
  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel('admin-intelligence-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'market_signals' },
        () => {
          void queryClient.invalidateQueries({ queryKey: ['admin-market-signals'] });
          void queryClient.invalidateQueries({ queryKey: ['admin-intelligence-metrics'] });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, queryClient]);

  const isLoading =
    metricsQuery.isLoading ||
    signalsQuery.isLoading ||
    apiHealthQuery.isLoading ||
    feedHealthQuery.isLoading;

  const isLive =
    enabled &&
    !metricsQuery.isError &&
    !signalsQuery.isError &&
    (metricsQuery.data !== undefined || signalsQuery.data !== undefined);

  return {
    metrics: metricsQuery.data ?? null,
    metricsError: metricsQuery.error,
    signals: signalsQuery.data ?? [],
    signalsError: signalsQuery.error,
    apiHealth: apiHealthQuery.data ?? [],
    apiHealthError: apiHealthQuery.error,
    feedHealth: feedHealthQuery.data ?? [],
    feedHealthError: feedHealthQuery.error,
    isLoading,
    isLive,
    refetch: () => {
      void metricsQuery.refetch();
      void signalsQuery.refetch();
      void apiHealthQuery.refetch();
      void feedHealthQuery.refetch();
    },
  };
}
