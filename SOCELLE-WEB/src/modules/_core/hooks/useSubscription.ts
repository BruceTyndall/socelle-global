import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/auth';

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_monthly: number;
  price_annual: number;
  modules_included: string[];
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  trial_days: number;
  features: Record<string, boolean | string> | null;
}

export interface SubscriptionResult {
  /** Current plan details (null if no subscription) */
  plan: SubscriptionPlan | null;
  /** Subscription status */
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'none';
  /** Module keys included in the current plan */
  modulesIncluded: string[];
  /** Billing cycle */
  billingCycle: 'monthly' | 'annual' | null;
  /** When the current billing period ends */
  currentPeriodEnd: Date | null;
  /** Whether the user is in a trial period */
  isTrialing: boolean;
  /** Whether payment is past due */
  isPastDue: boolean;
  /** Loading state */
  isLoading: boolean;
}

/**
 * Hook for the current user's subscription state.
 * Reads from account_subscriptions joined with subscription_plans.
 * Migrated to TanStack Query v5 (V2-TECH-04).
 */
export function useSubscription(): SubscriptionResult {
  const { user, profile } = useAuth();
  const accountId = profile?.business_id ?? profile?.brand_id ?? user?.id ?? null;

  const { data, isLoading } = useQuery({
    queryKey: ['account_subscription', accountId],
    queryFn: async () => {
      const { data: row, error } = await supabase
        .from('account_subscriptions')
        .select(`
          id,
          status,
          billing_cycle,
          current_period_end,
          trial_ends_at,
          plan:subscription_plans (
            id, name, slug, description,
            price_monthly, price_annual,
            modules_included, is_featured, is_active,
            sort_order, trial_days, features
          )
        `)
        .eq('account_id', accountId!)
        .in('status', ['active', 'trialing', 'past_due'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('[useSubscription] fetch error:', error.message);
        return null;
      }

      if (!row) return null;

      const planData = Array.isArray(row.plan) ? row.plan[0] : row.plan;
      return {
        plan: (planData as SubscriptionPlan) ?? null,
        status: row.status as SubscriptionResult['status'],
        billingCycle: row.billing_cycle as 'monthly' | 'annual' | null,
        currentPeriodEnd: row.current_period_end ? new Date(row.current_period_end) : null,
      };
    },
    enabled: !!accountId,
  });

  return useMemo(() => ({
    plan: data?.plan ?? null,
    status: data?.status ?? 'none',
    modulesIncluded: data?.plan?.modules_included ?? [],
    billingCycle: data?.billingCycle ?? null,
    currentPeriodEnd: data?.currentPeriodEnd ?? null,
    isTrialing: data?.status === 'trialing',
    isPastDue: data?.status === 'past_due',
    isLoading,
  }), [data, isLoading]);
}
