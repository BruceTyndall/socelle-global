import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

export interface Plan {
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
  created_at: string;
}

export interface PlansResult {
  /** All active subscription plans, sorted by sort_order */
  plans: Plan[];
  /** Whether plans are still loading */
  isLoading: boolean;
}

/**
 * Fetch all active subscription plans from the subscription_plans table.
 * Used by the pricing page and upgrade modals.
 * Migrated to TanStack Query v5 (V2-TECH-04).
 */
export function useSubscriptionPlans(): PlansResult {
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['subscription_plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.warn('[useSubscriptionPlans] fetch error:', error.message);
        return [];
      }
      return (data as Plan[]) ?? [];
    },
  });

  return { plans, isLoading };
}
