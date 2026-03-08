import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

// ── B2B Reseller Platform Hooks ─────────────────────────────────────────────
// Data sources: reseller_accounts, reseller_clients, white_label_config, reseller_revenue
// isLive pattern: true when DB tables exist and return data, false otherwise (DEMO)
// Migrated to TanStack Query v5 (V2-TECH-04).

// ── Types ───────────────────────────────────────────────────────────────────

export interface ResellerAccount {
  id: string;
  user_id: string;
  company_name: string;
  contact_email: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  commission_rate: number;
  tier: string | null;
  applied_at: string;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResellerClient {
  id: string;
  reseller_id: string;
  client_name: string;
  client_email: string;
  company_name: string | null;
  status: 'active' | 'pending' | 'churned';
  enrolled_at: string;
  last_activity_at: string | null;
  total_purchases: number;
  total_revenue: number;
  created_at: string;
  updated_at: string;
}

export interface WhiteLabelConfigRow {
  id: string;
  reseller_id: string;
  app_name: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  custom_domain: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResellerRevenueRow {
  id: string;
  reseller_id: string;
  client_id: string | null;
  amount: number;
  commission_amount: number;
  status: 'pending' | 'paid' | 'failed';
  period_start: string | null;
  period_end: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

// ── Helper for 42P01 handling ──────────────────────────────────────────────

function isTableNotFound(err: unknown): boolean {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes('does not exist')) return true;
  }
  if (typeof err === 'object' && err !== null && 'code' in err) {
    return (err as { code: string }).code === '42P01';
  }
  return false;
}

// ── useResellerAccount ──────────────────────────────────────────────────────

export function useResellerAccount(userId?: string) {
  const queryKey = ['reseller_account', userId];

  const { data, isLoading: loading, error: queryError } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data: row, error } = await supabase
        .from('reseller_accounts')
        .select('*')
        .eq('user_id', userId!)
        .maybeSingle();
      if (error) {
        if (isTableNotFound(error)) return { account: null, isLive: false };
        throw new Error(error.message);
      }
      return { account: row as ResellerAccount | null, isLive: true };
    },
    enabled: !!userId,
  });

  const account = data?.account ?? null;
  const isLive = data?.isLive ?? false;
  const error = queryError instanceof Error ? queryError.message : null;

  return { account, loading, error, isLive, reload: () => {} };
}

// ── useResellerClients ──────────────────────────────────────────────────────

export function useResellerClients(resellerId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ['reseller_clients', resellerId];

  const { data, isLoading: loading, error: queryError } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from('reseller_clients')
        .select('*')
        .eq('reseller_id', resellerId!)
        .order('created_at', { ascending: false });
      if (error) {
        if (isTableNotFound(error)) return { clients: [] as ResellerClient[], isLive: false };
        throw new Error(error.message);
      }
      return { clients: (rows ?? []) as ResellerClient[], isLive: true };
    },
    enabled: !!resellerId,
  });

  const addClientMut = useMutation({
    mutationFn: async (client: { client_name: string; client_email: string; company_name?: string }) => {
      if (!resellerId) throw new Error('No reseller ID');
      const { error } = await supabase
        .from('reseller_clients')
        .insert({ ...client, reseller_id: resellerId, status: 'pending' });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const clients = data?.clients ?? [];
  const isLive = data?.isLive ?? false;
  const error = queryError instanceof Error ? queryError.message : null;
  const addClient = async (client: { client_name: string; client_email: string; company_name?: string }) => addClientMut.mutateAsync(client);

  return { clients, loading, error, isLive, reload: () => queryClient.invalidateQueries({ queryKey }), addClient };
}

// ── useWhiteLabelConfig ─────────────────────────────────────────────────────

export function useWhiteLabelConfig(resellerId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ['white_label_config', resellerId];

  const { data, isLoading: loading, error: queryError } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data: row, error } = await supabase
        .from('white_label_config')
        .select('*')
        .eq('reseller_id', resellerId!)
        .maybeSingle();
      if (error) {
        if (isTableNotFound(error)) return { config: null, isLive: false };
        throw new Error(error.message);
      }
      return { config: row as WhiteLabelConfigRow | null, isLive: true };
    },
    enabled: !!resellerId,
  });

  const saveMut = useMutation({
    mutationFn: async (updates: Partial<WhiteLabelConfigRow>) => {
      if (!resellerId) throw new Error('No reseller ID');
      const existing = data?.config;
      if (existing?.id) {
        const { error } = await supabase
          .from('white_label_config')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase
          .from('white_label_config')
          .insert({ ...updates, reseller_id: resellerId });
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const config = data?.config ?? null;
  const isLive = data?.isLive ?? false;
  const error = queryError instanceof Error ? queryError.message : null;
  const saveConfig = async (updates: Partial<WhiteLabelConfigRow>) => saveMut.mutateAsync(updates);

  return { config, loading, error, isLive, reload: () => queryClient.invalidateQueries({ queryKey }), saveConfig };
}

// ── useResellerRevenue ──────────────────────────────────────────────────────

export function useResellerRevenue(resellerId?: string) {
  const queryKey = ['reseller_revenue', resellerId];

  const { data, isLoading: loading, error: queryError } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from('reseller_revenue')
        .select('*')
        .eq('reseller_id', resellerId!)
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) {
        if (isTableNotFound(error)) return { revenue: [] as ResellerRevenueRow[], isLive: false };
        throw new Error(error.message);
      }
      return { revenue: (rows ?? []) as ResellerRevenueRow[], isLive: true };
    },
    enabled: !!resellerId,
  });

  const revenue = data?.revenue ?? [];
  const isLive = data?.isLive ?? false;
  const error = queryError instanceof Error ? queryError.message : null;

  const totalRevenue = useMemo(() => revenue.reduce((sum, r) => sum + r.amount, 0), [revenue]);
  const totalCommission = useMemo(() => revenue.reduce((sum, r) => sum + r.commission_amount, 0), [revenue]);
  const pendingPayout = useMemo(() => revenue
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.commission_amount, 0), [revenue]);

  return { revenue, loading, error, isLive, reload: () => {}, totalRevenue, totalCommission, pendingPayout };
}

// ── useAllResellerAccounts (Admin) ──────────────────────────────────────────

export function useAllResellerAccounts() {
  const queryClient = useQueryClient();
  const queryKey = ['all_reseller_accounts'];

  const { data, isLoading: loading, error: queryError } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from('reseller_accounts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        if (isTableNotFound(error)) return { accounts: [] as ResellerAccount[], isLive: false };
        throw new Error(error.message);
      }
      return { accounts: (rows ?? []) as ResellerAccount[], isLive: true };
    },
  });

  const updateStatusMut = useMutation({
    mutationFn: async ({ accountId, status }: { accountId: string; status: ResellerAccount['status'] }) => {
      const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
      if (status === 'approved') updates.approved_at = new Date().toISOString();
      const { error } = await supabase.from('reseller_accounts').update(updates).eq('id', accountId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const updateRateMut = useMutation({
    mutationFn: async ({ accountId, rate }: { accountId: string; rate: number }) => {
      const { error } = await supabase
        .from('reseller_accounts')
        .update({ commission_rate: rate, updated_at: new Date().toISOString() })
        .eq('id', accountId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const accounts = data?.accounts ?? [];
  const isLive = data?.isLive ?? false;
  const error = queryError instanceof Error ? queryError.message : null;
  const updateAccountStatus = async (accountId: string, status: ResellerAccount['status']) => updateStatusMut.mutateAsync({ accountId, status });
  const updateCommissionRate = async (accountId: string, rate: number) => updateRateMut.mutateAsync({ accountId, rate });

  return { accounts, loading, error, isLive, reload: () => queryClient.invalidateQueries({ queryKey }), updateAccountStatus, updateCommissionRate };
}
