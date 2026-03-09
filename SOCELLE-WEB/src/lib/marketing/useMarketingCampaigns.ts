import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../supabase';

// ── V2-HUBS-08: Marketing Hub — Campaign CRUD hook ──────────────────
// Table: campaigns (space='marketing')
// TanStack Query v5. isLive pattern drives DEMO badge.
// ZERO cold email — all campaigns opt-in only.

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'completed' | 'paused' | 'archived';

export interface MarketingCampaign {
  id: string;
  name: string;
  type: string;
  status: CampaignStatus;
  subject: string | null;
  preview_text: string | null;
  body: Record<string, unknown> | null;
  audience_segment_id: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export type CampaignInsert = Omit<MarketingCampaign, 'id' | 'created_at' | 'updated_at'>;
export type CampaignUpdate = Partial<Omit<MarketingCampaign, 'id' | 'created_at' | 'updated_at'>>;

const QUERY_KEY = 'marketing_campaigns';

export function useMarketingCampaigns() {
  const queryClient = useQueryClient();

  // ── List ──────────────────────────────────────────────────────────
  const {
    data: campaigns = [],
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEY],
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

  const isLive = campaigns.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  // ── Create ────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async (input: CampaignInsert) => {
      const { data, error } = await supabase
        .from('campaigns')
        .insert(input)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as MarketingCampaign;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  // ── Update ────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: CampaignUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as MarketingCampaign;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  // ── Delete ────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('campaigns').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  // ── Convenience wrappers ──────────────────────────────────────────
  const createCampaign = async (input: CampaignInsert): Promise<MarketingCampaign | null> => {
    if (!isSupabaseConfigured) return null;
    try {
      return await createMutation.mutateAsync(input);
    } catch {
      return null;
    }
  };

  const updateCampaign = async (id: string, updates: CampaignUpdate): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    try {
      await updateMutation.mutateAsync({ id, ...updates });
      return true;
    } catch {
      return false;
    }
  };

  const deleteCampaign = async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    try {
      await deleteMutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };

  return {
    campaigns,
    isLive,
    isLoading,
    error,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    refetch,
  };
}
