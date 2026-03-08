import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';

// ── WO-OVERHAUL-14: Sales Platform — Commissions Hook ────────────────────
// Data source: commission_rules + commission_payouts (LIVE when DB-connected)
// Migrated to TanStack Query v5 (V2-TECH-04).

export interface CommissionRule {
  id: string;
  name: string;
  rate_type: string;
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
  status: string;
  paid_at: string | null;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
}

export function useCommissions() {
  const { data, isLoading: loading, error: queryError, refetch: reload } = useQuery({
    queryKey: ['commissions'],
    queryFn: async () => {
      const [rulesRes, payoutsRes] = await Promise.all([
        supabase.from('commission_rules').select('*').order('created_at', { ascending: false }),
        supabase.from('commission_payouts').select('*').order('created_at', { ascending: false }).limit(200),
      ]);

      if (rulesRes.error) {
        const msg = rulesRes.error.message.toLowerCase();
        if (msg.includes('does not exist') || rulesRes.error.code === '42P01') {
          return { rules: [] as CommissionRule[], payouts: [] as CommissionPayout[] };
        }
        throw new Error(rulesRes.error.message);
      }
      if (payoutsRes.error) throw new Error(payoutsRes.error.message);

      return {
        rules: (rulesRes.data ?? []) as CommissionRule[],
        payouts: (payoutsRes.data ?? []) as CommissionPayout[],
      };
    },
  });

  const rules = data?.rules ?? [];
  const payouts = data?.payouts ?? [];
  const isLive = !!data;
  const error = queryError instanceof Error ? queryError.message : null;

  return { rules, payouts, loading, error, isLive, reload };
}
