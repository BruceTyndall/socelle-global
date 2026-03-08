import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

// ── WO-OVERHAUL-14: Sales Platform — Deals Hook ──────────────────────────
// Data source: deals table (LIVE when DB-connected)
// Migrated to TanStack Query v5 (V2-TECH-04).

export interface Deal {
  id: string;
  pipeline_id: string;
  stage_id: string;
  title: string;
  value: number;
  currency: string;
  contact_name: string | null;
  contact_email: string | null;
  company_name: string | null;
  probability: number;
  expected_close_date: string | null;
  owner_id: string | null;
  status: string;
  won_reason: string | null;
  lost_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewDeal {
  pipeline_id: string;
  stage_id: string;
  title: string;
  value: number;
  currency?: string;
  contact_name?: string;
  contact_email?: string;
  company_name?: string;
  probability?: number;
  expected_close_date?: string;
}

export function useDeals(pipelineId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ['deals', pipelineId];

  const { data: deals = [], isLoading: loading, error: queryError, refetch: reload } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from('deals')
        .select('*')
        .order('updated_at', { ascending: false });
      if (pipelineId) {
        query = query.eq('pipeline_id', pipelineId);
      }
      const { data, error } = await query;
      if (error) {
        // Table might not exist yet — graceful fallback
        const msg = error.message.toLowerCase();
        if (msg.includes('does not exist') || error.code === '42P01') return [];
        throw new Error(error.message);
      }
      return (data ?? []) as Deal[];
    },
  });

  const createMut = useMutation({
    mutationFn: async (deal: NewDeal) => {
      const { data, error } = await supabase
        .from('deals')
        .insert([{ ...deal, status: 'open' }])
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Deal;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Deal> }) => {
      const { data, error } = await supabase
        .from('deals')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Deal;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const createDeal = async (deal: NewDeal) => createMut.mutateAsync(deal);
  const updateDeal = async (id: string, updates: Partial<Deal>) => updateMut.mutateAsync({ id, updates });
  const moveDeal = async (id: string, stageId: string) => updateDeal(id, { stage_id: stageId });

  const isLive = deals.length > 0 || !!queryError;
  const error = queryError instanceof Error ? queryError.message : null;

  return { deals, loading, error, isLive, reload, createDeal, updateDeal, moveDeal };
}

export function useDeal(dealId: string | undefined) {
  const { data: deal = null, isLoading: loading, error: queryError, refetch: reload } = useQuery({
    queryKey: ['deal_detail', dealId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('id', dealId!)
        .single();
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('does not exist') || error.code === '42P01') return null;
        throw new Error(error.message);
      }
      return data as Deal;
    },
    enabled: !!dealId,
  });

  const isLive = deal !== null;
  const error = queryError instanceof Error ? queryError.message : null;

  return { deal, loading, error, isLive, reload };
}
