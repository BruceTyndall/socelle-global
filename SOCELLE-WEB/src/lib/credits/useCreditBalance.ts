import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';

// ── V2-HUBS-12: Credit Economy — Credit Balance Hook ─────────────────────
// Data source: credit_ledger (LIVE when DB-connected)
// Falls back to DEMO data with isLive=false when table does not exist.
// Migrated to TanStack Query v5.

export interface CreditTransaction {
  id: string;
  action: string;
  credits_deducted: number;
  signal_id: string | null;
  created_at: string;
}

export interface CreditBalance {
  remaining: number;
  used_this_month: number;
  allocated: number;
  tier: string;
}

const TIER_ALLOCATIONS: Record<string, number> = {
  free: 0,
  starter: 500,
  pro: 2500,
  enterprise: 10000,
};

const DEMO_TRANSACTIONS: CreditTransaction[] = [
  { id: 'demo-1', action: 'Explain Signal', credits_deducted: 5, signal_id: 'sig-001', created_at: '2026-03-08T14:22:00Z' },
  { id: 'demo-2', action: 'Generate Brief', credits_deducted: 25, signal_id: 'sig-002', created_at: '2026-03-08T11:05:00Z' },
  { id: 'demo-3', action: 'Menu Optimization', credits_deducted: 50, signal_id: null, created_at: '2026-03-07T16:30:00Z' },
  { id: 'demo-4', action: 'Gap Analysis', credits_deducted: 30, signal_id: 'sig-003', created_at: '2026-03-07T09:15:00Z' },
  { id: 'demo-5', action: 'Explain Signal', credits_deducted: 5, signal_id: 'sig-004', created_at: '2026-03-06T18:42:00Z' },
  { id: 'demo-6', action: 'Search', credits_deducted: 2, signal_id: null, created_at: '2026-03-06T10:20:00Z' },
  { id: 'demo-7', action: 'Generate Brief', credits_deducted: 25, signal_id: 'sig-005', created_at: '2026-03-05T15:11:00Z' },
  { id: 'demo-8', action: 'R&D Scout', credits_deducted: 40, signal_id: null, created_at: '2026-03-05T08:55:00Z' },
  { id: 'demo-9', action: 'Competitive Benchmark', credits_deducted: 20, signal_id: 'sig-006', created_at: '2026-03-04T13:30:00Z' },
  { id: 'demo-10', action: 'Explain Signal', credits_deducted: 5, signal_id: 'sig-007', created_at: '2026-03-04T07:00:00Z' },
];

const DEMO_BALANCE: CreditBalance = {
  remaining: 2293,
  used_this_month: 207,
  allocated: 2500,
  tier: 'pro',
};

export function useCreditBalance() {
  const { data, isLoading: loading, error: queryError, refetch: reload } = useQuery({
    queryKey: ['credit_balance'],
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from('credit_ledger')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('does not exist') || error.code === '42P01') {
          return { transactions: DEMO_TRANSACTIONS, balance: DEMO_BALANCE, isLive: false };
        }
        throw new Error(error.message);
      }

      const transactions = (rows ?? []) as CreditTransaction[];
      const now = new Date();
      const mtdStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const usedThisMonth = transactions
        .filter((t) => new Date(t.created_at) >= mtdStart)
        .reduce((s, t) => s + t.credits_deducted, 0);

      // Tier detection would come from user profile; default to pro for now
      const tier = 'pro';
      const allocated = TIER_ALLOCATIONS[tier] ?? 0;

      const balance: CreditBalance = {
        remaining: allocated - usedThisMonth,
        used_this_month: usedThisMonth,
        allocated,
        tier,
      };

      return { transactions, balance, isLive: true };
    },
  });

  return {
    balance: data?.balance ?? DEMO_BALANCE,
    transactions: data?.transactions ?? DEMO_TRANSACTIONS,
    isLive: data?.isLive ?? false,
    loading,
    error: queryError instanceof Error ? queryError.message : null,
    reload,
    tierAllocations: TIER_ALLOCATIONS,
  };
}
