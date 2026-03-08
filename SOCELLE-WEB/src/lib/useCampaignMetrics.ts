import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from './supabase';

// ── WO-OVERHAUL-15: Marketing Platform — Campaign Metrics hook ───────
// Table: campaign_metrics
// isLive flag drives DEMO badge.
// Migrated to TanStack Query v5 (V2-TECH-04).

export interface CampaignMetrics {
  id: string;
  campaign_id: string;
  sends: number;
  opens: number;
  clicks: number;
  conversions: number;
  revenue: number;
  open_rate: number;
  click_rate: number;
  conversion_rate: number;
  recorded_at: string;
  created_at: string;
}

export interface UseCampaignMetricsReturn {
  metrics: CampaignMetrics[];
  summary: {
    totalSends: number;
    totalOpens: number;
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
    avgOpenRate: number;
    avgClickRate: number;
  } | null;
  isLive: boolean;
  loading: boolean;
  error: string | null;
}

export function useCampaignMetrics(campaignId: string | undefined): UseCampaignMetricsReturn {
  const { data: metrics = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['campaign_metrics', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_metrics')
        .select('*')
        .eq('campaign_id', campaignId!)
        .order('recorded_at', { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []) as CampaignMetrics[];
    },
    enabled: isSupabaseConfigured && !!campaignId,
  });

  const isLive = metrics.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  const summary = useMemo(() => {
    if (metrics.length === 0) return null;
    return {
      totalSends: metrics.reduce((s, m) => s + m.sends, 0),
      totalOpens: metrics.reduce((s, m) => s + m.opens, 0),
      totalClicks: metrics.reduce((s, m) => s + m.clicks, 0),
      totalConversions: metrics.reduce((s, m) => s + m.conversions, 0),
      totalRevenue: metrics.reduce((s, m) => s + m.revenue, 0),
      avgOpenRate: metrics.reduce((s, m) => s + m.open_rate, 0) / metrics.length,
      avgClickRate: metrics.reduce((s, m) => s + m.click_rate, 0) / metrics.length,
    };
  }, [metrics]);

  return { metrics, summary, isLive, loading, error };
}
