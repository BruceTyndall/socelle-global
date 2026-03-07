import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';

// ── B2B Reseller Platform Hooks ─────────────────────────────────────────────
// Data sources: reseller_accounts, reseller_clients, white_label_config, reseller_revenue
// isLive pattern: true when DB tables exist and return data, false otherwise (DEMO)

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

// ── useResellerAccount ──────────────────────────────────────────────────────

export function useResellerAccount(userId?: string) {
  const [account, setAccount] = useState<ResellerAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('reseller_accounts')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (err) throw err;
      setAccount(data);
      setIsLive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message.toLowerCase() : '';
      if (msg.includes('does not exist') || (err as { code?: string })?.code === '42P01') {
        setIsLive(false);
        setAccount(null);
      } else {
        setError('Failed to load reseller account.');
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  return { account, loading, error, isLive, reload: load };
}

// ── useResellerClients ──────────────────────────────────────────────────────

export function useResellerClients(resellerId?: string) {
  const [clients, setClients] = useState<ResellerClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    if (!resellerId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('reseller_clients')
        .select('*')
        .eq('reseller_id', resellerId)
        .order('created_at', { ascending: false });
      if (err) throw err;
      setClients(data ?? []);
      setIsLive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message.toLowerCase() : '';
      if (msg.includes('does not exist') || (err as { code?: string })?.code === '42P01') {
        setIsLive(false);
        setClients([]);
      } else {
        setError('Failed to load reseller clients.');
      }
    } finally {
      setLoading(false);
    }
  }, [resellerId]);

  const addClient = useCallback(async (client: { client_name: string; client_email: string; company_name?: string }) => {
    if (!resellerId) return;
    const { error: err } = await supabase
      .from('reseller_clients')
      .insert({ ...client, reseller_id: resellerId, status: 'pending' });
    if (err) throw err;
    await load();
  }, [resellerId, load]);

  useEffect(() => { load(); }, [load]);

  return { clients, loading, error, isLive, reload: load, addClient };
}

// ── useWhiteLabelConfig ─────────────────────────────────────────────────────

export function useWhiteLabelConfig(resellerId?: string) {
  const [config, setConfig] = useState<WhiteLabelConfigRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    if (!resellerId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('white_label_config')
        .select('*')
        .eq('reseller_id', resellerId)
        .maybeSingle();
      if (err) throw err;
      setConfig(data);
      setIsLive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message.toLowerCase() : '';
      if (msg.includes('does not exist') || (err as { code?: string })?.code === '42P01') {
        setIsLive(false);
        setConfig(null);
      } else {
        setError('Failed to load white-label config.');
      }
    } finally {
      setLoading(false);
    }
  }, [resellerId]);

  const saveConfig = useCallback(async (updates: Partial<WhiteLabelConfigRow>) => {
    if (!resellerId) return;
    if (config?.id) {
      const { error: err } = await supabase
        .from('white_label_config')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', config.id);
      if (err) throw err;
    } else {
      const { error: err } = await supabase
        .from('white_label_config')
        .insert({ ...updates, reseller_id: resellerId });
      if (err) throw err;
    }
    await load();
  }, [resellerId, config, load]);

  useEffect(() => { load(); }, [load]);

  return { config, loading, error, isLive, reload: load, saveConfig };
}

// ── useResellerRevenue ──────────────────────────────────────────────────────

export function useResellerRevenue(resellerId?: string) {
  const [revenue, setRevenue] = useState<ResellerRevenueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    if (!resellerId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('reseller_revenue')
        .select('*')
        .eq('reseller_id', resellerId)
        .order('created_at', { ascending: false })
        .limit(200);
      if (err) throw err;
      setRevenue(data ?? []);
      setIsLive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message.toLowerCase() : '';
      if (msg.includes('does not exist') || (err as { code?: string })?.code === '42P01') {
        setIsLive(false);
        setRevenue([]);
      } else {
        setError('Failed to load reseller revenue.');
      }
    } finally {
      setLoading(false);
    }
  }, [resellerId]);

  useEffect(() => { load(); }, [load]);

  // Derived stats
  const totalRevenue = revenue.reduce((sum, r) => sum + r.amount, 0);
  const totalCommission = revenue.reduce((sum, r) => sum + r.commission_amount, 0);
  const pendingPayout = revenue
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.commission_amount, 0);

  return { revenue, loading, error, isLive, reload: load, totalRevenue, totalCommission, pendingPayout };
}

// ── useAllResellerAccounts (Admin) ──────────────────────────────────────────

export function useAllResellerAccounts() {
  const [accounts, setAccounts] = useState<ResellerAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('reseller_accounts')
        .select('*')
        .order('created_at', { ascending: false });
      if (err) throw err;
      setAccounts(data ?? []);
      setIsLive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message.toLowerCase() : '';
      if (msg.includes('does not exist') || (err as { code?: string })?.code === '42P01') {
        setIsLive(false);
        setAccounts([]);
      } else {
        setError('Failed to load reseller accounts.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAccountStatus = useCallback(async (accountId: string, status: ResellerAccount['status']) => {
    const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (status === 'approved') updates.approved_at = new Date().toISOString();
    const { error: err } = await supabase
      .from('reseller_accounts')
      .update(updates)
      .eq('id', accountId);
    if (err) throw err;
    await load();
  }, [load]);

  const updateCommissionRate = useCallback(async (accountId: string, rate: number) => {
    const { error: err } = await supabase
      .from('reseller_accounts')
      .update({ commission_rate: rate, updated_at: new Date().toISOString() })
      .eq('id', accountId);
    if (err) throw err;
    await load();
  }, [load]);

  useEffect(() => { load(); }, [load]);

  return { accounts, loading, error, isLive, reload: load, updateAccountStatus, updateCommissionRate };
}
