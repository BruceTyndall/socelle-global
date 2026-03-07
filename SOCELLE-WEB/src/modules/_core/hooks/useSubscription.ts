import { useEffect, useState, useCallback } from 'react';
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
 */
export function useSubscription(): SubscriptionResult {
  const { user, profile } = useAuth();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [status, setStatus] = useState<SubscriptionResult['status']>('none');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual' | null>(null);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const accountId = profile?.business_id ?? profile?.brand_id ?? user?.id ?? null;

  const fetchSubscription = useCallback(async () => {
    if (!accountId) {
      setPlan(null);
      setStatus('none');
      setBillingCycle(null);
      setCurrentPeriodEnd(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
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
        .eq('account_id', accountId)
        .in('status', ['active', 'trialing', 'past_due'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('[useSubscription] fetch error:', error.message);
        setPlan(null);
        setStatus('none');
      } else if (data) {
        // Plan comes back as an object from the join
        const planData = Array.isArray(data.plan) ? data.plan[0] : data.plan;
        setPlan((planData as SubscriptionPlan) ?? null);
        setStatus(data.status as SubscriptionResult['status']);
        setBillingCycle(data.billing_cycle as 'monthly' | 'annual' | null);
        setCurrentPeriodEnd(data.current_period_end ? new Date(data.current_period_end) : null);
      } else {
        setPlan(null);
        setStatus('none');
        setBillingCycle(null);
        setCurrentPeriodEnd(null);
      }
    } catch (err) {
      console.warn('[useSubscription] unexpected error:', err);
      setPlan(null);
      setStatus('none');
    } finally {
      setIsLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    setIsLoading(true);
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    plan,
    status,
    modulesIncluded: plan?.modules_included ?? [],
    billingCycle,
    currentPeriodEnd,
    isTrialing: status === 'trialing',
    isPastDue: status === 'past_due',
    isLoading,
  };
}
