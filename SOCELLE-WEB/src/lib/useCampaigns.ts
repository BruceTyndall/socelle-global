import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

// ── WO-OVERHAUL-15: Marketing Platform — Campaign hooks ──────────────
// Tables: campaigns, campaign_content
// isLive flag drives DEMO badge. ZERO cold email — all campaigns opt-in only.

export type CampaignType = 'email' | 'sms' | 'push' | 'in_app' | 'social';
export type CampaignStatusType = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'archived';

export interface MarketingCampaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatusType;
  subject: string | null;
  preview_text: string | null;
  body: Record<string, unknown> | null;
  audience_segment_id: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UseCampaignsReturn {
  campaigns: MarketingCampaign[];
  isLive: boolean;
  loading: boolean;
  error: string | null;
  createCampaign: (campaign: Omit<MarketingCampaign, 'id' | 'created_at' | 'updated_at'>) => Promise<MarketingCampaign | null>;
  updateCampaign: (id: string, updates: Partial<MarketingCampaign>) => Promise<boolean>;
  refetch: () => void;
}

export function useCampaigns(): UseCampaignsReturn {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchCampaigns() {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        setCampaigns([]);
        setIsLive(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error: queryError } = await supabase
          .from('campaigns')
          .select('*')
          .order('created_at', { ascending: false });

        if (cancelled) return;

        if (queryError || !data) {
          setCampaigns([]);
          setIsLive(false);
          if (queryError) setError(queryError.message);
        } else {
          setCampaigns(data as MarketingCampaign[]);
          setIsLive(true);
        }
      } catch {
        if (!cancelled) {
          setCampaigns([]);
          setIsLive(false);
          setError('Failed to fetch campaigns');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCampaigns();
    return () => { cancelled = true; };
  }, [tick]);

  const createCampaign = useCallback(async (campaign: Omit<MarketingCampaign, 'id' | 'created_at' | 'updated_at'>): Promise<MarketingCampaign | null> => {
    if (!isSupabaseConfigured) return null;
    const { data, error: insertError } = await supabase
      .from('campaigns')
      .insert(campaign)
      .select()
      .single();
    if (insertError) { setError(insertError.message); return null; }
    refetch();
    return data as MarketingCampaign;
  }, [refetch]);

  const updateCampaign = useCallback(async (id: string, updates: Partial<MarketingCampaign>): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    const { error: updateError } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id);
    if (updateError) { setError(updateError.message); return false; }
    refetch();
    return true;
  }, [refetch]);

  return { campaigns, isLive, loading, error, createCampaign, updateCampaign, refetch };
}
