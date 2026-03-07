import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';

// ── B2B Prospects Hook ──────────────────────────────────────────────────
// Data source: b2b_prospects, b2b_prospect_touchpoints (LIVE when DB-connected)

export interface B2bProspect {
  id: string;
  business_id: string;
  company_name: string;
  company_type: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  city: string | null;
  state: string | null;
  status: string;
  source: string | null;
  estimated_value: number | null;
  notes: string | null;
  next_follow_up: string | null;
  invited_to_platform: boolean;
  invited_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface B2bTouchpoint {
  id: string;
  prospect_id: string;
  type: string;
  subject: string | null;
  notes: string | null;
  occurred_at: string;
  created_by: string | null;
  created_at: string;
}

export interface NewProspect {
  business_id: string;
  company_name: string;
  company_type?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  city?: string;
  state?: string;
  status?: string;
  source?: string;
  estimated_value?: number;
  notes?: string;
  next_follow_up?: string;
}

export interface NewTouchpoint {
  prospect_id: string;
  type: string;
  subject?: string;
  notes?: string;
  occurred_at?: string;
  created_by?: string;
}

export function useProspects(businessId?: string) {
  const [prospects, setProspects] = useState<B2bProspect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbErr } = await supabase
        .from('b2b_prospects')
        .select('*')
        .eq('business_id', businessId)
        .order('updated_at', { ascending: false });
      if (dbErr) throw dbErr;
      setProspects(data ?? []);
      setIsLive(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load prospects');
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => { load(); }, [load]);

  const createProspect = useCallback(async (prospect: NewProspect) => {
    const { data, error: dbErr } = await supabase
      .from('b2b_prospects')
      .insert(prospect)
      .select()
      .single();
    if (dbErr) throw dbErr;
    await load();
    return data as B2bProspect;
  }, [load]);

  const updateProspect = useCallback(async (id: string, updates: Partial<NewProspect>) => {
    const { error: dbErr } = await supabase
      .from('b2b_prospects')
      .update(updates)
      .eq('id', id);
    if (dbErr) throw dbErr;
    await load();
  }, [load]);

  const deleteProspect = useCallback(async (id: string) => {
    const { error: dbErr } = await supabase
      .from('b2b_prospects')
      .delete()
      .eq('id', id);
    if (dbErr) throw dbErr;
    await load();
  }, [load]);

  const markInvited = useCallback(async (id: string) => {
    const { error: dbErr } = await supabase
      .from('b2b_prospects')
      .update({ invited_to_platform: true, invited_at: new Date().toISOString() })
      .eq('id', id);
    if (dbErr) throw dbErr;
    await load();
  }, [load]);

  return { prospects, loading, error, isLive, reload: load, createProspect, updateProspect, deleteProspect, markInvited };
}

export function useProspectDetail(prospectId?: string) {
  const [prospect, setProspect] = useState<B2bProspect | null>(null);
  const [touchpoints, setTouchpoints] = useState<B2bTouchpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    if (!prospectId) return;
    setLoading(true);
    setError(null);
    try {
      const [pRes, tRes] = await Promise.all([
        supabase.from('b2b_prospects').select('*').eq('id', prospectId).single(),
        supabase.from('b2b_prospect_touchpoints').select('*').eq('prospect_id', prospectId).order('occurred_at', { ascending: false }),
      ]);
      if (pRes.error) throw pRes.error;
      setProspect(pRes.data as B2bProspect);
      setTouchpoints((tRes.data ?? []) as B2bTouchpoint[]);
      setIsLive(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load prospect');
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [prospectId]);

  useEffect(() => { load(); }, [load]);

  const addTouchpoint = useCallback(async (tp: NewTouchpoint) => {
    const { error: dbErr } = await supabase
      .from('b2b_prospect_touchpoints')
      .insert(tp);
    if (dbErr) throw dbErr;
    await load();
  }, [load]);

  return { prospect, touchpoints, loading, error, isLive, reload: load, addTouchpoint };
}
