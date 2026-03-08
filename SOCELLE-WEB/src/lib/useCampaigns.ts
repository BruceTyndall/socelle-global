import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from './supabase';

// ── WO-OVERHAUL-15: Marketing Platform — Campaign hooks ──────────────
// Tables: campaigns, campaign_content
// isLive flag drives DEMO badge. ZERO cold email — all campaigns opt-in only.
// Migrated to TanStack Query v5 (V2-TECH-04).

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
  const queryClient = useQueryClient();

  const { data: campaigns = [], isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as MarketingCampaign[];
    },
    enabled: isSupabaseConfigured,
  });

  const createMut = useMutation({
    mutationFn: async (campaign: Omit<MarketingCampaign, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('campaigns').insert(campaign).select().single();
      if (error) throw new Error(error.message);
      return data as MarketingCampaign;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['campaigns'] }); },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MarketingCampaign> }) => {
      const { error } = await supabase.from('campaigns').update(updates).eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['campaigns'] }); },
  });

  const createCampaign = async (campaign: Omit<MarketingCampaign, 'id' | 'created_at' | 'updated_at'>): Promise<MarketingCampaign | null> => {
    if (!isSupabaseConfigured) return null;
    try { return await createMut.mutateAsync(campaign); } catch { return null; }
  };

  const updateCampaign = async (id: string, updates: Partial<MarketingCampaign>): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    try { await updateMut.mutateAsync({ id, updates }); return true; } catch { return false; }
  };

  const isLive = campaigns.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  return { campaigns, isLive, loading, error, createCampaign, updateCampaign, refetch };
}
