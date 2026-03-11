/**
 * PaywallGate — Web Subscription Gate
 *
 * Implements the formal access function from the Convergence Roadmap:
 *
 *   Gate(u) = {
 *     allow   if S_u = active/trialing           (Pro subscriber)
 *     allow   if S_u = free ∧ G_u < G_max        (free tier, under limit)
 *     paywall if S_u = free ∧ G_u ≥ G_max        (free tier, limit hit)
 *   }
 *
 *   where G_max = 3 gap analyses per calendar month
 *
 * Usage:
 *   Wrap any AI-powered feature (plan wizard, protocol matches, retail attach)
 *   with <PaywallGate feature="gap_analysis"> ... </PaywallGate>
 *
 *   <PaywallGate feature="gap_analysis">
 *     <PlanWizard />
 *   </PaywallGate>
 *
 *   For features that are always gated (no free tier):
 *   <PaywallGate feature="retail_attach">
 *     <RetailAttachView />
 *   </PaywallGate>
 */

import { ReactNode, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useSubscription } from '../lib/useSubscription';
import { useTier, type Tier } from '../hooks/useTier';
import { PAYMENT_BYPASS } from '../lib/paymentBypass';
import { Button } from './ui/Button';

// ── Constants ──────────────────────────────────────────────────────────────────

/** Free-tier monthly cap. Architect spec: G_max = 3. */
const G_MAX = 3;

/** Features that consume a free-tier gap analysis credit. */
const GAP_ANALYSIS_FEATURES = [
  'gap_analysis',
  'plan_wizard',
  'protocol_matches',
] as const;

/** Features that are Pro-only with no free tier at all. */
const PRO_ONLY_FEATURES = [
  'retail_attach',
  'activation_assets',
  'opening_order',
] as const;

type Feature =
  | (typeof GAP_ANALYSIS_FEATURES)[number]
  | (typeof PRO_ONLY_FEATURES)[number]
  | string;

// ── Types ──────────────────────────────────────────────────────────────────────

interface PaywallGateProps {
  /** The feature being gated. Determines which rule applies. */
  feature: Feature;

  /** Content to render when access is granted. */
  children: ReactNode;

  /**
   * Optional custom paywall UI. If not provided, the default upgrade card
   * is shown.
   */
  fallback?: ReactNode;

  /**
   * Required tier for this gate. When set, uses the tier-based system
   * from useTier() instead of the binary isPro check.
   */
  requiredTier?: Tier;

  /**
   * If true, the gate checks access but always renders children.
   * Useful for "soft" gates that disable vs. hide the feature.
   */
  softGate?: boolean;

  /** Called when the gate allows access (useful for analytics). */
  onAllow?: () => void;

  /** Called when the gate blocks access (useful for analytics). */
  onBlock?: (reason: 'no_subscription' | 'limit_reached' | 'pro_only') => void;
}

// ── Hook: gap analysis count ───────────────────────────────────────────────────

function useMonthlyGapCount(userId: string | null) {
  const { data: count = 0, isLoading: loading } = useQuery({
    queryKey: ['monthly-gap-count', userId],
    queryFn: async () => {
      if (!userId) return 0;

      // Count plans created this calendar month — each plan = 1 gap analysis
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const { count: c, error } = await supabase
        .from('plans')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', monthStart.toISOString());

      if (error) {
        console.warn('PaywallGate: gap count fetch error', error.message);
        return 0;
      }
      return c ?? 0;
    },
    enabled: !!userId,
  });

  return { count, loading };
}

// ── Component ──────────────────────────────────────────────────────────────────

export function PaywallGate({
  feature,
  children,
  fallback,
  requiredTier,
  softGate = false,
  onAllow,
  onBlock,
}: PaywallGateProps) {
  const { user, isAdmin } = useAuth();
  const { isPro, loading: subLoading, startCheckout } = useSubscription();
  const { meetsMinimumTier, isLoading: tierLoading } = useTier();
  const { count: gapCount, loading: countLoading } = useMonthlyGapCount(
    user?.id ?? null
  );

  // Admin bypasses all gates
  if (isAdmin) {
    onAllow?.();
    return <>{children}</>;
  }

  if (PAYMENT_BYPASS) {
    onAllow?.();
    return <>{children}</>;
  }

  const loading = subLoading || countLoading || tierLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Gate evaluation ──────────────────────────────────────────────────────────

  // If a required tier is specified, use tier-based check
  if (requiredTier && meetsMinimumTier(requiredTier)) {
    onAllow?.();
    return <>{children}</>;
  }

  // S_u = active/trialing → always allow (legacy binary check)
  if (!requiredTier && isPro) {
    onAllow?.();
    return <>{children}</>;
  }

  // Pro-only features — no free tier
  if ((PRO_ONLY_FEATURES as readonly string[]).includes(feature)) {
    if (!softGate) {
      onBlock?.('pro_only');
      return (
        <>{fallback ?? <UpgradeCard reason="pro_only" onUpgrade={startCheckout} />}</>
      );
    }
  }

  // Gap-analysis features — free tier with G_max cap
  if ((GAP_ANALYSIS_FEATURES as readonly string[]).includes(feature)) {
    const count = gapCount ?? 0;

    if (count >= G_MAX) {
      if (!softGate) {
        onBlock?.('limit_reached');
        return (
          <>
            {fallback ?? (
              <UpgradeCard
                reason="limit_reached"
                gapCount={count}
                gMax={G_MAX}
                onUpgrade={startCheckout}
              />
            )}
          </>
        );
      }
    }
  }

  onAllow?.();
  return <>{children}</>;
}

// ── Default paywall card UI ────────────────────────────────────────────────────

interface UpgradeCardProps {
  reason: 'pro_only' | 'limit_reached' | 'no_subscription';
  gapCount?: number;
  gMax?: number;
  onUpgrade: (planId?: string) => Promise<void>;
}

function UpgradeCard({ reason, gapCount, gMax, onUpgrade }: UpgradeCardProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await onUpgrade('pro_monthly');
    } finally {
      setLoading(false);
    }
  };

  const content = {
    limit_reached: {
      icon: '📊',
      headline: `You've used ${gapCount} of ${gMax} free analyses this month`,
      sub: 'Upgrade to Pro for unlimited gap analyses, protocol matching, and retail recommendations.',
      cta: 'Upgrade to Pro — $29/mo',
    },
    pro_only: {
      icon: '🚀',
      headline: 'Pro feature',
      sub: 'This feature requires an active Pro subscription. Access unlimited analyses, retail attach, and opening order generation.',
      cta: 'Start 7-Day Free Trial',
    },
    no_subscription: {
      icon: '🔒',
      headline: 'Subscription required',
      sub: 'Create a Pro account to access the full Socelle intelligence suite.',
      cta: 'Get Started',
    },
  }[reason];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center max-w-md mx-auto">
      <div className="text-5xl mb-4">{content.icon}</div>

      <h3 className="text-xl font-semibold text-graphite mb-3">
        {content.headline}
      </h3>

      <p className="text-graphite/60 text-sm leading-relaxed mb-6">
        {content.sub}
      </p>

      {reason === 'limit_reached' && gMax !== undefined && (
        <div className="w-full bg-graphite/60/20 rounded-full h-2 mb-6">
          <div
            className="bg-accent h-2 rounded-full transition-all"
            style={{ width: `${Math.min(100, ((gapCount ?? 0) / gMax) * 100)}%` }}
          />
        </div>
      )}

      <Button
        variant="primary"
        onClick={handleUpgrade}
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Redirecting…' : content.cta}
      </Button>

      <Link
        to="/pricing"
        className="block text-center text-xs font-medium text-accent hover:underline mt-3"
      >
        Compare all plans
      </Link>

      <p className="text-xs text-graphite/40 mt-2 text-center">
        Cancel anytime. No commitment.
      </p>
    </div>
  );
}

export default PaywallGate;
