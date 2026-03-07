import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';

// ── WO-OVERHAUL-14: Sales Platform — Deals Hook ──────────────────────────
// Data source: deals table (LIVE when DB-connected)

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
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('deals')
        .select('*')
        .order('updated_at', { ascending: false });
      if (pipelineId) {
        query = query.eq('pipeline_id', pipelineId);
      }
      const { data, error: dbErr } = await query;
      if (dbErr) throw dbErr;
      setDeals(data ?? []);
      setIsLive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message.toLowerCase() : '';
      if (msg.includes('does not exist') || (err as { code?: string })?.code === '42P01') {
        setIsLive(false);
        setDeals([]);
      } else {
        setError('Failed to load deals.');
      }
    } finally {
      setLoading(false);
    }
  }, [pipelineId]);

  useEffect(() => { load(); }, [load]);

  const createDeal = useCallback(async (deal: NewDeal) => {
    const { data, error: dbErr } = await supabase
      .from('deals')
      .insert([{ ...deal, status: 'open' }])
      .select()
      .single();
    if (dbErr) throw dbErr;
    setDeals((prev) => [data, ...prev]);
    return data as Deal;
  }, []);

  const updateDeal = useCallback(async (id: string, updates: Partial<Deal>) => {
    const { data, error: dbErr } = await supabase
      .from('deals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (dbErr) throw dbErr;
    setDeals((prev) => prev.map((d) => (d.id === id ? (data as Deal) : d)));
    return data as Deal;
  }, []);

  const moveDeal = useCallback(async (id: string, stageId: string) => {
    return updateDeal(id, { stage_id: stageId });
  }, [updateDeal]);

  return { deals, loading, error, isLive, reload: load, createDeal, updateDeal, moveDeal };
}

export function useDeal(dealId: string | undefined) {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    if (!dealId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbErr } = await supabase
        .from('deals')
        .select('*')
        .eq('id', dealId)
        .single();
      if (dbErr) throw dbErr;
      setDeal(data as Deal);
      setIsLive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message.toLowerCase() : '';
      if (msg.includes('does not exist') || (err as { code?: string })?.code === '42P01') {
        setIsLive(false);
      } else {
        setError('Failed to load deal.');
      }
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  useEffect(() => { load(); }, [load]);

  return { deal, loading, error, isLive, reload: load };
}
