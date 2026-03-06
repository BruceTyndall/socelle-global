/**
 * useSubscription — Subscription state hook
 *
 * Reads the user's subscription from Supabase and exposes:
 *   - isPro: boolean (active or trialing)
 *   - subscription: full record
 *   - loading: boolean
 *   - startCheckout: redirect to Stripe Checkout
 *   - manageBilling: redirect to Stripe Customer Portal
 */

import { useState, useEffect, useCallback } from 'react';
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
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(!PAYMENT_BYPASS);

  useEffect(() => {
    if (PAYMENT_BYPASS) {
      setLoading(false);
      return;
    }
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchSubscription() {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user!.id)
          .in('status', ['active', 'trialing', 'past_due', 'canceled'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!cancelled) {
          if (error) {
            console.warn('Subscription fetch error:', error.message);
            setSubscription(null);
          } else {
            setSubscription(data);
          }
        }
      } catch (err) {
        console.warn('Subscription fetch failed:', err);
        if (!cancelled) setSubscription(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSubscription();

    // Listen for realtime changes
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
            setSubscription(payload.new as Subscription);
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user]);

  const isPro = PAYMENT_BYPASS || (subscription?.status === 'active' || subscription?.status === 'trialing');
  const isPastDue = subscription?.status === 'past_due';

  // Features that require a Pro or Studio subscription
  const PRO_GATED_FEATURES = [
    'protocol_matches',
    'gap_detail',
    'retail_attach',
    'activation_assets',
  ] as const;

  const canAccess = useCallback((feature: string): boolean => {
    if ((PRO_GATED_FEATURES as readonly string[]).includes(feature)) return isPro;
    return true; // unknown features default open
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
    // For MVP, link directly to Stripe customer portal
    // In production, create a portal session via Edge Function
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
