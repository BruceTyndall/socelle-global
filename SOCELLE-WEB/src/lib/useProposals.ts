import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

// ── WO-OVERHAUL-14: Sales Platform — Proposals Hook ──────────────────────
// Data source: proposals table (LIVE when DB-connected)
// Migrated to TanStack Query v5 (V2-TECH-04).

export interface ProposalLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface ProposalBlock {
  type: 'cover' | 'about' | 'solution' | 'pricing' | 'terms' | 'signature';
  title: string;
  content: string;
  line_items?: ProposalLineItem[];
}

export interface Proposal {
  id: string;
  deal_id: string;
  title: string;
  status: string;
  blocks: ProposalBlock[];
  total_value: number;
  valid_until: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  signature_data: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewProposal {
  deal_id: string;
  title: string;
  blocks: ProposalBlock[];
  total_value: number;
  valid_until?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeProposal(raw: any): Proposal {
  return {
    ...raw,
    blocks: Array.isArray(raw.blocks) ? raw.blocks : [],
  };
}

export function useProposals(dealId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ['proposals', dealId];

  const { data: proposals = [], isLoading: loading, error: queryError, refetch: reload } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase.from('proposals').select('*').order('created_at', { ascending: false });
      if (dealId) query = query.eq('deal_id', dealId);
      const { data, error } = await query;
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('does not exist') || error.code === '42P01') return [];
        throw new Error(error.message);
      }
      return (data ?? []).map(normalizeProposal);
    },
  });

  const createMut = useMutation({
    mutationFn: async (proposal: NewProposal) => {
      const { data, error } = await supabase.from('proposals').insert([{ ...proposal, status: 'draft' }]).select().single();
      if (error) throw new Error(error.message);
      return normalizeProposal(data);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Proposal> }) => {
      const { data, error } = await supabase.from('proposals').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return normalizeProposal(data);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const createProposal = async (proposal: NewProposal) => createMut.mutateAsync(proposal);
  const updateProposal = async (id: string, updates: Partial<Proposal>) => updateMut.mutateAsync({ id, updates });

  const isLive = proposals.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  return { proposals, loading, error, isLive, reload, createProposal, updateProposal };
}

export function useProposal(proposalId: string | undefined) {
  const { data: proposal = null, isLoading: loading, error: queryError, refetch: reload } = useQuery({
    queryKey: ['proposal_detail', proposalId],
    queryFn: async () => {
      const { data, error } = await supabase.from('proposals').select('*').eq('id', proposalId!).single();
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('does not exist') || error.code === '42P01') return null;
        throw new Error(error.message);
      }
      return normalizeProposal(data);
    },
    enabled: !!proposalId,
  });

  const isLive = proposal !== null;
  const error = queryError instanceof Error ? queryError.message : null;

  return { proposal, loading, error, isLive, reload };
}
