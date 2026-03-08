/**
 * useSubscription — Subscription state hook
 *
 * Reads the user's subscription from Supabase and exposes:
 *   - isPro: boolean (active or trialing)
 *   - subscription: full record
 *   - loading: boolean
 *   - startCheckout: redirect to Stripe Checkout
 *   - manageBilling: redirect to Stripe Customer Portal
 *
 * Migrated to TanStack Query v5 (V2-TECH-04).
 * NOTE: Retains Supabase Realtime subscription via useEffect for live updates.
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';
import { useAuth } from './auth';
import { PAYMENT_BYPASS } from './paymentBypass';

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive';
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export function useSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [realtimeUpdate, setRealtimeUpdate] = useState<Subscription | null>(null);

  const queryKey = ['subscription', user?.id];

  const { data: fetchedSubscription = null, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user!.id)
        .in('status', ['active', 'trialing', 'past_due', 'canceled'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('Subscription fetch error:', error.message);
        return null;
      }
      return data as Subscription | null;
    },
    enabled: !PAYMENT_BYPASS && !!user,
  });

  // Use realtime update if available, otherwise use fetched data
  const subscription = realtimeUpdate ?? fetchedSubscription;
  const loading = PAYMENT_BYPASS ? false : isLoading;

  // Listen for realtime changes
  useEffect(() => {
    if (PAYMENT_BYPASS || !user) return;

    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            setRealtimeUpdate(payload.new as Subscription);
            queryClient.invalidateQueries({ queryKey });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, queryKey]);

  const isPro = PAYMENT_BYPASS || (subscription?.status === 'active' || subscription?.status === 'trialing');
  const isPastDue = subscription?.status === 'past_due';

  const PRO_GATED_FEATURES = [
    'protocol_matches',
    'gap_detail',
    'retail_attach',
    'activation_assets',
  ] as const;

  const canAccess = useCallback((feature: string): boolean => {
    if ((PRO_GATED_FEATURES as readonly string[]).includes(feature)) return isPro;
    return true;
  }, [isPro]); // eslint-disable-line react-hooks/exhaustive-deps

  const isCanceled = subscription?.status === 'canceled' && !!subscription?.current_period_end &&
    new Date(subscription.current_period_end) > new Date();

  const startCheckout = useCallback(async (planId = 'pro_monthly') => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          plan_id: planId,
          return_url: window.location.origin,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      throw err;
    }
  }, []);

  const manageBilling = useCallback(async () => {
    if (subscription?.stripe_customer_id) {
      try {
        const { data } = await supabase.functions.invoke('create-checkout', {
          body: {
            action: 'portal',
            return_url: window.location.origin,
          },
        });
        if (data?.url) {
          window.location.href = data.url;
        }
      } catch (err) {
        console.error('Billing portal error:', err);
      }
    }
  }, [subscription]);

  return {
    subscription,
    isPro,
    isPastDue,
    isCanceled,
    loading,
    canAccess,
    startCheckout,
    manageBilling,
  };
}
