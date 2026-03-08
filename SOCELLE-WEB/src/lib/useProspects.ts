import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

// ── B2B Prospects Hook ──────────────────────────────────────────────────
// Data source: b2b_prospects, b2b_prospect_touchpoints (LIVE when DB-connected)
// Migrated to TanStack Query v5 (V2-TECH-04).

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

export function useProspects(businessId?: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ['b2b_prospects', businessId];

  const { data: prospects = [], isLoading: loading, error: queryError, refetch: reload } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('b2b_prospects')
        .select('*')
        .eq('business_id', businessId!)
        .order('updated_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as B2bProspect[];
    },
    enabled: !!businessId,
  });

  const createMut = useMutation({
    mutationFn: async (prospect: NewProspect) => {
      const { data, error } = await supabase.from('b2b_prospects').insert(prospect).select().single();
      if (error) throw new Error(error.message);
      return data as B2bProspect;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<NewProspect> }) => {
      const { error } = await supabase.from('b2b_prospects').update(updates).eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('b2b_prospects').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const inviteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('b2b_prospects').update({ invited_to_platform: true, invited_at: new Date().toISOString() }).eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const createProspect = async (prospect: NewProspect) => createMut.mutateAsync(prospect);
  const updateProspect = async (id: string, updates: Partial<NewProspect>) => updateMut.mutateAsync({ id, updates });
  const deleteProspect = async (id: string) => deleteMut.mutateAsync(id);
  const markInvited = async (id: string) => inviteMut.mutateAsync(id);

  const isLive = prospects.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  return { prospects, loading, error, isLive, reload, createProspect, updateProspect, deleteProspect, markInvited };
}

export function useProspectDetail(prospectId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ['b2b_prospect_detail', prospectId];

  const { data, isLoading: loading, error: queryError, refetch: reload } = useQuery({
    queryKey,
    queryFn: async () => {
      const [pRes, tRes] = await Promise.all([
        supabase.from('b2b_prospects').select('*').eq('id', prospectId!).single(),
        supabase.from('b2b_prospect_touchpoints').select('*').eq('prospect_id', prospectId!).order('occurred_at', { ascending: false }),
      ]);
      if (pRes.error) throw new Error(pRes.error.message);
      return {
        prospect: pRes.data as B2bProspect,
        touchpoints: (tRes.data ?? []) as B2bTouchpoint[],
      };
    },
    enabled: !!prospectId,
  });

  const addMut = useMutation({
    mutationFn: async (tp: NewTouchpoint) => {
      const { error } = await supabase.from('b2b_prospect_touchpoints').insert(tp);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const prospect = data?.prospect ?? null;
  const touchpoints = data?.touchpoints ?? [];
  const isLive = prospect !== null;
  const error = queryError instanceof Error ? queryError.message : null;
  const addTouchpoint = async (tp: NewTouchpoint) => addMut.mutateAsync(tp);

  return { prospect, touchpoints, loading, error, isLive, reload, addTouchpoint };
}
