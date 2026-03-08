import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

// ── WO-OVERHAUL-14: Sales Platform — Deal Activities Hook ─────────────────
// Data source: deal_activities table (LIVE when DB-connected)
// Migrated to TanStack Query v5 (V2-TECH-04).

export interface DealActivity {
  id: string;
  deal_id: string;
  activity_type: string; // call, email, meeting, note
  description: string;
  performed_by: string | null;
  performed_at: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface NewDealActivity {
  deal_id: string;
  activity_type: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export function useDealActivities(dealId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = ['deal_activities', dealId];

  const { data: activities = [], isLoading: loading, error: queryError, refetch: reload } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deal_activities')
        .select('*')
        .eq('deal_id', dealId!)
        .order('performed_at', { ascending: false });
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('does not exist') || error.code === '42P01') return [];
        throw new Error(error.message);
      }
      return (data ?? []) as DealActivity[];
    },
    enabled: !!dealId,
  });

  const addMut = useMutation({
    mutationFn: async (activity: NewDealActivity) => {
      const { data, error } = await supabase
        .from('deal_activities')
        .insert([{ ...activity, performed_at: new Date().toISOString() }])
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as DealActivity;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('deal_activities').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const addActivity = async (activity: NewDealActivity) => addMut.mutateAsync(activity);
  const deleteActivity = async (id: string) => deleteMut.mutateAsync(id);

  const isLive = activities.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  return { activities, loading, error, isLive, reload, addActivity, deleteActivity };
}
