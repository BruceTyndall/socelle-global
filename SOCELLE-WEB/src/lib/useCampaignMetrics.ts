import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

// ── WO-OVERHAUL-15: Marketing Platform — Campaign Metrics hook ───────
// Table: campaign_metrics
// isLive flag drives DEMO badge.

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
  const [metrics, setMetrics] = useState<CampaignMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchMetrics() {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured || !campaignId) {
        setMetrics([]);
        setIsLive(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error: queryError } = await supabase
          .from('campaign_metrics')
          .select('*')
          .eq('campaign_id', campaignId)
          .order('recorded_at', { ascending: true });

        if (cancelled) return;

        if (queryError || !data) {
          setMetrics([]);
          setIsLive(false);
          if (queryError) setError(queryError.message);
        } else {
          setMetrics(data as CampaignMetrics[]);
          setIsLive(true);
        }
      } catch {
        if (!cancelled) {
          setMetrics([]);
          setIsLive(false);
          setError('Failed to fetch campaign metrics');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchMetrics();
    return () => { cancelled = true; };
  }, [campaignId]);

  const summary = metrics.length > 0 ? {
    totalSends: metrics.reduce((s, m) => s + m.sends, 0),
    totalOpens: metrics.reduce((s, m) => s + m.opens, 0),
    totalClicks: metrics.reduce((s, m) => s + m.clicks, 0),
    totalConversions: metrics.reduce((s, m) => s + m.conversions, 0),
    totalRevenue: metrics.reduce((s, m) => s + m.revenue, 0),
    avgOpenRate: metrics.reduce((s, m) => s + m.open_rate, 0) / metrics.length,
    avgClickRate: metrics.reduce((s, m) => s + m.click_rate, 0) / metrics.length,
  } : null;

  return { metrics, summary, isLive, loading, error };
}
