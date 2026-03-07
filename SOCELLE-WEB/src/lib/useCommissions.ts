import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';

// ── WO-OVERHAUL-14: Sales Platform — Commissions Hook ────────────────────
// Data source: commission_rules + commission_payouts (LIVE when DB-connected)

export interface CommissionRule {
  id: string;
  name: string;
  rate_type: string; // percentage, flat
  rate_value: number;
  applies_to: string | null;
  min_deal_value: number | null;
  max_deal_value: number | null;
  is_active: boolean;
  created_at: string;
}

export interface CommissionPayout {
  id: string;
  deal_id: string;
  rule_id: string;
  amount: number;
  status: string; // pending, approved, paid
  paid_at: string | null;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
}

export function useCommissions() {
  const [rules, setRules] = useState<CommissionRule[]>([]);
  const [payouts, setPayouts] = useState<CommissionPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rulesRes, payoutsRes] = await Promise.all([
        supabase
          .from('commission_rules')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('commission_payouts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200),
      ]);
      if (rulesRes.error) throw rulesRes.error;
      if (payoutsRes.error) throw payoutsRes.error;
      setRules(rulesRes.data ?? []);
      setPayouts(payoutsRes.data ?? []);
      setIsLive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message.toLowerCase() : '';
      if (msg.includes('does not exist') || (err as { code?: string })?.code === '42P01') {
        setIsLive(false);
        setRules([]);
        setPayouts([]);
      } else {
        setError('Failed to load commissions.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { rules, payouts, loading, error, isLive, reload: load };
}
