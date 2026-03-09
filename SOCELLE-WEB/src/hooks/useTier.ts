/**
 * useTier — Subscription tier hook (V2-PLAT-05)
 *
 * Reads the current user's subscription tier from user_profiles via Supabase.
 * Falls back to 'free' when no subscription exists.
 * Uses 42P01 error fallback pattern (DEMO mode if table missing).
 * Migrated to TanStack Query v5.
 */

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

// ── Tier Definitions ────────────────────────────────────────────────────────────

export type Tier = 'free' | 'starter' | 'pro' | 'enterprise';

const TIER_RANK: Record<Tier, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  enterprise: 3,
};

/** Normalize legacy tier names to the canonical V1 set. */
function normalizeTier(raw: string | null | undefined): Tier {
  if (!raw) return 'free';
  const lower = raw.toLowerCase().trim();
  if (lower === 'enterprise') return 'enterprise';
  if (lower === 'pro') return 'pro';
  if (lower === 'starter') return 'starter';
  // Legacy alias: 'growth' maps to 'pro' per V1 pricing consolidation
  if (lower === 'growth') return 'pro';
  return 'free';
}

// ── Hook ─────────────────────────────────────────────────────────────────────────

export interface UseTierResult {
  /** Canonical tier name. */
  tier: Tier;
  /** Numeric rank (free=0, starter=1, pro=2, enterprise=3). */
  tierRank: number;
  /** True while the tier is being fetched. */
  isLoading: boolean;
  /** True when running in DEMO mode (table missing or Supabase unconfigured). */
  isDemo: boolean;
  /** Returns true if the user meets or exceeds the required tier. */
  meetsMinimumTier: (required: Tier) => boolean;
}

export function useTier(): UseTierResult {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const { data, isLoading } = useQuery({
    queryKey: ['user_tier', userId],
    queryFn: async () => {
      if (!userId) return { tier: 'free' as Tier, isDemo: false };

      // Try subscriptions table first (canonical source for tier)
      const { data: sub, error: subError } = await supabase
        .from('subscriptions')
        .select('plan_id, status')
        .eq('user_id', userId)
        .in('status', ['active', 'trialing'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subError) {
        const msg = subError.message.toLowerCase();
        if (msg.includes('does not exist') || subError.code === '42P01') {
          return { tier: 'pro' as Tier, isDemo: true };
        }
        // Non-fatal: fall through to profile lookup
      }

      if (sub?.plan_id) {
        return { tier: normalizeTier(sub.plan_id), isDemo: false };
      }

      // Fallback: check user_profiles for a tier field
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('subscription_tier')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        const msg = profileError.message.toLowerCase();
        if (msg.includes('does not exist') || profileError.code === '42P01') {
          return { tier: 'pro' as Tier, isDemo: true };
        }
      }

      const rawTier = (profile as Record<string, unknown> | null)?.subscription_tier;
      return {
        tier: normalizeTier(typeof rawTier === 'string' ? rawTier : null),
        isDemo: false,
      };
    },
    enabled: true,
    staleTime: 60_000,
    gcTime: 300_000,
  });

  const tier = data?.tier ?? 'free';
  const isDemo = data?.isDemo ?? false;
  const tierRank = TIER_RANK[tier];

  const meetsMinimumTier = useMemo(() => {
    return (required: Tier): boolean => {
      return TIER_RANK[tier] >= TIER_RANK[required];
    };
  }, [tier]);

  return { tier, tierRank, isLoading, isDemo, meetsMinimumTier };
}
