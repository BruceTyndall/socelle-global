import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

// ── CRM Segments Hook ───────────────────────────────────────────────────
// Data source: crm_segments table (LIVE when DB-connected)
// TanStack Query v5 pattern (V2-HUBS-06).

export interface CrmSegment {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  filter_rules: SegmentFilter;
  contact_count: number;
  created_at: string;
  updated_at: string;
}

export interface SegmentFilter {
  lifecycle_stages?: string[];
  types?: string[];
  tags?: string[];
  min_visits?: number;
  max_visits?: number;
  min_spend?: number;
  max_spend?: number;
  source?: string;
  has_email?: boolean;
}

export interface NewCrmSegment {
  business_id: string;
  name: string;
  description?: string;
  filter_rules: SegmentFilter;
}

export function useCrmSegments(businessId?: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ['crm_segments', businessId];

  const { data: segments = [], isLoading: loading, error: queryError, refetch: reload } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_segments')
        .select('*')
        .eq('business_id', businessId!)
        .order('updated_at', { ascending: false });
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('does not exist') || error.code === '42P01') return [];
        throw new Error(error.message);
      }
      return (data ?? []) as CrmSegment[];
    },
    enabled: !!businessId,
  });

  const createMut = useMutation({
    mutationFn: async (segment: NewCrmSegment) => {
      const { data, error } = await supabase
        .from('crm_segments')
        .insert({ ...segment, contact_count: 0 })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as CrmSegment;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<NewCrmSegment & { contact_count: number }> }) => {
      const { error } = await supabase
        .from('crm_segments')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('crm_segments').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const createSegment = async (segment: NewCrmSegment) => createMut.mutateAsync(segment);
  const updateSegment = async (id: string, updates: Partial<NewCrmSegment & { contact_count: number }>) => updateMut.mutateAsync({ id, updates });
  const deleteSegment = async (id: string) => deleteMut.mutateAsync(id);

  const isLive = segments.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  return { segments, loading, error, isLive, reload, createSegment, updateSegment, deleteSegment };
}
