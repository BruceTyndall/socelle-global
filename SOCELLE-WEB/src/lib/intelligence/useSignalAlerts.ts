// ── useSignalAlerts — INTEL-WO-10 ────────────────────────────────────────
// TanStack Query v5 hook for saved signal searches / alert preferences.
// CRUD: list, create, update, delete.
// All operations scoped to auth.uid() via RLS.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../supabase';
import { useAuth } from '../auth';

// ── Types ────────────────────────────────────────────────────────────────

export interface SignalAlertFilter {
  category?: string;
  direction?: 'up' | 'down' | 'stable' | 'all';
  confidence?: 'HIGH' | 'MODERATE' | 'LOW' | 'all';
  searchQuery?: string;
}

export interface SignalAlert {
  id: string;
  user_id: string;
  name: string;
  filter_criteria: SignalAlertFilter;
  notify_email: boolean;
  notify_in_app: boolean;
  last_notified_at: string | null;
  created_at: string;
  updated_at: string;
}

// ── Query key factory ────────────────────────────────────────────────────

const QUERY_KEY = (userId: string) => ['signal_alerts', userId] as const;

// ── Hook ─────────────────────────────────────────────────────────────────

export function useSignalAlerts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id ?? '';

  // ── List ──────────────────────────────────────────────────────────
  const {
    data: alerts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEY(userId),
    queryFn: async (): Promise<SignalAlert[]> => {
      const { data, error } = await supabase
        .from('signal_alerts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as SignalAlert[];
    },
    enabled: isSupabaseConfigured && !!userId,
  });

  // ── Create ────────────────────────────────────────────────────────
  const { mutateAsync: saveSearch, isPending: isSaving } = useMutation({
    mutationFn: async ({
      name,
      filters,
      notifyEmail = false,
      notifyInApp = true,
    }: {
      name: string;
      filters: SignalAlertFilter;
      notifyEmail?: boolean;
      notifyInApp?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('signal_alerts')
        .insert({
          user_id: userId,
          name,
          filter_criteria: filters,
          notify_email: notifyEmail,
          notify_in_app: notifyInApp,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as SignalAlert;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY(userId) });
    },
  });

  // ── Delete ────────────────────────────────────────────────────────
  const { mutateAsync: deleteAlert, isPending: isDeleting } = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase.from('signal_alerts').delete().eq('id', alertId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY(userId) });
    },
  });

  // ── Update notification prefs ─────────────────────────────────────
  const { mutateAsync: updateAlert } = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Pick<SignalAlert, 'name' | 'notify_email' | 'notify_in_app' | 'filter_criteria'>>;
    }) => {
      const { data, error } = await supabase
        .from('signal_alerts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as SignalAlert;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY(userId) });
    },
  });

  return {
    alerts,
    isLoading,
    error,
    refetch,
    saveSearch,
    isSaving,
    deleteAlert,
    isDeleting,
    updateAlert,
  };
}
