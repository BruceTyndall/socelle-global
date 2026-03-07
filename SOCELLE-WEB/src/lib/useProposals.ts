import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';

// ── WO-OVERHAUL-14: Sales Platform — Proposals Hook ──────────────────────
// Data source: proposals table (LIVE when DB-connected)

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
  status: string; // draft, sent, viewed, accepted, rejected
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

export function useProposals(dealId?: string) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('proposals')
        .select('*')
        .order('created_at', { ascending: false });
      if (dealId) {
        query = query.eq('deal_id', dealId);
      }
      const { data, error: dbErr } = await query;
      if (dbErr) throw dbErr;
      setProposals((data ?? []).map(normalizeProposal));
      setIsLive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message.toLowerCase() : '';
      if (msg.includes('does not exist') || (err as { code?: string })?.code === '42P01') {
        setIsLive(false);
        setProposals([]);
      } else {
        setError('Failed to load proposals.');
      }
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  useEffect(() => { load(); }, [load]);

  const createProposal = useCallback(async (proposal: NewProposal) => {
    const { data, error: dbErr } = await supabase
      .from('proposals')
      .insert([{ ...proposal, status: 'draft' }])
      .select()
      .single();
    if (dbErr) throw dbErr;
    const p = normalizeProposal(data);
    setProposals((prev) => [p, ...prev]);
    return p;
  }, []);

  const updateProposal = useCallback(async (id: string, updates: Partial<Proposal>) => {
    const { data, error: dbErr } = await supabase
      .from('proposals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (dbErr) throw dbErr;
    const p = normalizeProposal(data);
    setProposals((prev) => prev.map((x) => (x.id === id ? p : x)));
    return p;
  }, []);

  return { proposals, loading, error, isLive, reload: load, createProposal, updateProposal };
}

export function useProposal(proposalId: string | undefined) {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    if (!proposalId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbErr } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', proposalId)
        .single();
      if (dbErr) throw dbErr;
      setProposal(normalizeProposal(data));
      setIsLive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message.toLowerCase() : '';
      if (msg.includes('does not exist') || (err as { code?: string })?.code === '42P01') {
        setIsLive(false);
      } else {
        setError('Failed to load proposal.');
      }
    } finally {
      setLoading(false);
    }
  }, [proposalId]);

  useEffect(() => { load(); }, [load]);

  return { proposal, loading, error, isLive, reload: load };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeProposal(raw: any): Proposal {
  return {
    ...raw,
    blocks: Array.isArray(raw.blocks) ? raw.blocks : [],
  };
}
