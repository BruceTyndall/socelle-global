import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAuth } from '../auth';

// ── PAY-WO-01: Credit Economy — Credit Balance Hook (corrected schema) ────────
// Data source: tenant_balances (credit_balance_usd) + ai_credit_ledger (LIVE)
// Real schema uses USD decimal, NOT integer credits.
// Falls back to DEMO when table is empty or user has no row.

export interface CreditTransaction {
  id: string;
  feature: string | null;
  amount_usd: number;         // negative = deduction, positive = top-up
  balance_after: number;
  provider: string;
  model: string;
  created_at: string;
}

export interface CreditBalance {
  /** Remaining USD balance (e.g. 87.34) */
  credit_balance_usd: number;
  lifetime_spent_usd: number;
  lifetime_requests: number;
  last_request_at: string | null;
  /** Formatted string for display (e.g. "$87.34") */
  display: string;
  /** Whether this balance is from live DB or demo fallback */
  isLive: boolean;
}

const DEMO_BALANCE: CreditBalance = {
  credit_balance_usd: 87.34,
  lifetime_spent_usd: 12.66,
  lifetime_requests: 47,
  last_request_at: '2026-03-08T14:22:00Z',
  display: '$87.34',
  isLive: false,
};

const DEMO_TRANSACTIONS: CreditTransaction[] = [
  { id: 'demo-1', feature: 'gap_analysis',     amount_usd: -0.0120, balance_after: 87.34, provider: 'openrouter', model: 'claude-3-5-sonnet', created_at: '2026-03-08T14:22:00Z' },
  { id: 'demo-2', feature: 'intelligence_brief',amount_usd: -0.0250, balance_after: 87.35, provider: 'openrouter', model: 'gpt-4o-mini',       created_at: '2026-03-08T11:05:00Z' },
  { id: 'demo-3', feature: 'menu_optimization', amount_usd: -0.0500, balance_after: 87.38, provider: 'openrouter', model: 'claude-3-5-sonnet', created_at: '2026-03-07T16:30:00Z' },
  { id: 'demo-4', feature: 'protocol_match',    amount_usd: -0.0300, balance_after: 87.43, provider: 'openrouter', model: 'gpt-4o-mini',       created_at: '2026-03-07T09:15:00Z' },
  { id: 'demo-5', feature: 'gap_analysis',      amount_usd: -0.0120, balance_after: 87.46, provider: 'openrouter', model: 'claude-3-5-sonnet', created_at: '2026-03-06T18:42:00Z' },
  { id: 'demo-6', feature: 'billing',           amount_usd:  5.0000, balance_after: 87.47, provider: 'stripe',     model: 'top_up',            created_at: '2026-03-06T10:20:00Z' },
];

function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function useCreditBalance() {
  const { user } = useAuth();

  const { data, isLoading: loading, error: queryError, refetch: reload } = useQuery({
    queryKey: ['credit_balance', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      // 1. Fetch current balance from tenant_balances
      const { data: balanceRow, error: balErr } = await supabase
        .from('tenant_balances')
        .select('credit_balance_usd, lifetime_spent_usd, lifetime_requests, last_request_at')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (balErr) {
        const msg = balErr.message.toLowerCase();
        if (msg.includes('does not exist') || balErr.code === '42P01') {
          return { balance: DEMO_BALANCE, transactions: DEMO_TRANSACTIONS };
        }
        throw new Error(balErr.message);
      }

      // 2. Fetch recent ledger rows for transaction history
      const { data: ledgerRows, error: ledErr } = await supabase
        .from('ai_credit_ledger')
        .select('id, feature, amount_usd, balance_after, provider, model, created_at')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (ledErr && ledErr.code !== '42P01') {
        // non-fatal — show balance even without ledger history
        console.warn('[useCreditBalance] ledger fetch error:', ledErr.message);
      }

      if (!balanceRow) {
        // No balance row yet — auto-provision will happen on first AI call
        return { balance: DEMO_BALANCE, transactions: DEMO_TRANSACTIONS };
      }

      const balance: CreditBalance = {
        credit_balance_usd: Number(balanceRow.credit_balance_usd),
        lifetime_spent_usd: Number(balanceRow.lifetime_spent_usd),
        lifetime_requests: balanceRow.lifetime_requests,
        last_request_at: balanceRow.last_request_at,
        display: formatUsd(Number(balanceRow.credit_balance_usd)),
        isLive: true,
      };

      const transactions: CreditTransaction[] = (ledgerRows ?? []).map((r) => ({
        id: r.id,
        feature: r.feature,
        amount_usd: Number(r.amount_usd),
        balance_after: Number(r.balance_after),
        provider: r.provider,
        model: r.model,
        created_at: r.created_at,
      }));

      return { balance, transactions };
    },
  });

  return {
    balance: data?.balance ?? DEMO_BALANCE,
    transactions: data?.transactions ?? DEMO_TRANSACTIONS,
    isLive: data?.balance?.isLive ?? false,
    loading,
    error: queryError instanceof Error ? queryError.message : null,
    reload,
  };
}
