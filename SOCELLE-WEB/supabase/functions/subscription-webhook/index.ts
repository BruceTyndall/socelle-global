// Edge Function: subscription-webhook
// Handles Stripe webhook events for subscription lifecycle
// Authority: docs/command/SOCELLE_ENTITLEMENTS_PACKAGING.md

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';
import { enforceEdgeFunctionEnabled } from '../_shared/edgeControl.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  const edgeControlResponse = await enforceEdgeFunctionEnabled('subscription-webhook', req);
  if (edgeControlResponse) return edgeControlResponse;
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!stripeKey || !webhookSecret) {
    return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
  });

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Verify webhook signature
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Signature verification failed';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    switch (event.type) {
      // ── SUBSCRIPTION CREATED ──
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;
        if (!userId) break;

        const planSlug = subscription.metadata?.plan_slug;
        const addonSlug = subscription.metadata?.addon_slug;

        if (addonSlug) {
          // Addon subscription
          const { data: addon } = await supabase
            .from('studio_addons')
            .select('id')
            .eq('slug', addonSlug)
            .single();
          if (addon) {
            await supabase
              .from('user_addons')
              .upsert({
                user_id: userId,
                addon_id: addon.id,
                status: subscription.status,
                stripe_subscription_id: subscription.id,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              }, { onConflict: 'user_id,addon_id' });
          }
        } else if (planSlug) {
          // Plan subscription
          const { data: plan } = await supabase
            .from('subscription_plans')
            .select('id')
            .eq('slug', planSlug)
            .single();
          if (plan) {
            await supabase
              .from('subscriptions')
              .upsert({
                user_id: userId,
                plan_id: plan.id,
                status: subscription.status,
                stripe_subscription_id: subscription.id,
                stripe_customer_id: subscription.customer as string,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              }, { onConflict: 'user_id' });
          }
        }
        break;
      }

      // ── SUBSCRIPTION UPDATED ──
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;
        if (!userId) break;

        const addonSlug = subscription.metadata?.addon_slug;

        if (addonSlug) {
          await supabase
            .from('user_addons')
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);
        } else {
          await supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              cancel_at_period_end: subscription.cancel_at_period_end,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);
        }
        break;
      }

      // ── SUBSCRIPTION DELETED ──
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const addonSlug = subscription.metadata?.addon_slug;

        if (addonSlug) {
          await supabase
            .from('user_addons')
            .update({
              status: 'canceled',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);
        } else {
          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);
        }
        break;
      }

      // ── PAYMENT SUCCEEDED ──
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        if (!subscriptionId) break;

        // Fetch the subscription to get updated period
        const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);

        // Update subscriptions table
        const { data: subRow } = await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            current_period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionId)
          .select()
          .single();

        // If not in subscriptions, check user_addons
        if (!subRow) {
          await supabase
            .from('user_addons')
            .update({
              status: 'active',
              current_period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
              current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId);
        }
        break;
      }

      // ── PAYMENT FAILED ──
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        if (!subscriptionId) break;

        // Mark as past_due in subscriptions
        const { data: subRow } = await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionId)
          .select()
          .single();

        // If not in subscriptions, check user_addons
        if (!subRow) {
          await supabase
            .from('user_addons')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId);
        }
        break;
      }

      default:
        // Unhandled event type — log and acknowledge
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook processing failed';
    console.error('Webhook error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
