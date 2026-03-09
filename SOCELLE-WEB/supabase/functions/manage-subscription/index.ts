// Edge Function: manage-subscription
// Handles subscription lifecycle: create, cancel, upgrade, downgrade, add/remove addons
// Authority: docs/command/SOCELLE_ENTITLEMENTS_PACKAGING.md

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';
import { enforceEdgeFunctionEnabled } from '../_shared/edgeControl.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ManageSubscriptionRequest {
  action: 'create' | 'cancel' | 'upgrade' | 'downgrade' | 'add_addon' | 'remove_addon';
  plan_slug?: string;
  addon_slug?: string;
  billing_cycle?: 'monthly' | 'annual';
}

serve(async (req: Request) => {
  const edgeControlResponse = await enforceEdgeFunctionEnabled('manage-subscription', req);
  if (edgeControlResponse) return edgeControlResponse;
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY not configured');

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    const supabaseClient = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    const body: ManageSubscriptionRequest = await req.json();
    const { action, plan_slug, addon_slug, billing_cycle = 'monthly' } = body;

    // Get or create Stripe customer
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .not('stripe_customer_id', 'is', null)
      .limit(1)
      .single();

    let stripeCustomerId = existingSub?.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      stripeCustomerId = customer.id;
    }

    // ── ACTION: CREATE ──
    if (action === 'create') {
      if (!plan_slug) throw new Error('plan_slug required for create');

      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('slug', plan_slug)
        .eq('is_active', true)
        .single();
      if (planError || !plan) throw new Error(`Plan not found: ${plan_slug}`);

      // Free plan — no Stripe needed
      if (plan.monthly_price_cents === 0 && plan.annual_price_cents === 0) {
        const { data: sub, error: subError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: user.id,
            plan_id: plan.id,
            status: 'active',
            billing_cycle,
            stripe_customer_id: stripeCustomerId,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' })
          .select()
          .single();
        if (subError) throw subError;

        return new Response(JSON.stringify({ subscription: sub }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Paid plan — create Stripe subscription
      const priceId = billing_cycle === 'annual'
        ? plan.stripe_annual_price_id
        : plan.stripe_monthly_price_id;
      if (!priceId) throw new Error(`Stripe price not configured for ${plan_slug} (${billing_cycle})`);

      const stripeSubscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: { supabase_user_id: user.id, plan_slug },
      });

      const { data: sub, error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_id: plan.id,
          status: stripeSubscription.status,
          billing_cycle,
          stripe_subscription_id: stripeSubscription.id,
          stripe_customer_id: stripeCustomerId,
          current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
        })
        .select()
        .single();
      if (subError) throw subError;

      const invoice = stripeSubscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = invoice?.payment_intent as Stripe.PaymentIntent;

      return new Response(JSON.stringify({
        subscription: sub,
        client_secret: paymentIntent?.client_secret,
        stripe_subscription_id: stripeSubscription.id,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── ACTION: CANCEL ──
    if (action === 'cancel') {
      const { data: currentSub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (!currentSub) throw new Error('No active subscription found');

      if (currentSub.stripe_subscription_id) {
        await stripe.subscriptions.update(currentSub.stripe_subscription_id, {
          cancel_at_period_end: true,
        });
      }

      const { data: updated, error: updateError } = await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentSub.id)
        .select()
        .single();
      if (updateError) throw updateError;

      return new Response(JSON.stringify({ subscription: updated }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── ACTION: UPGRADE / DOWNGRADE ──
    if (action === 'upgrade' || action === 'downgrade') {
      if (!plan_slug) throw new Error('plan_slug required for upgrade/downgrade');

      const { data: currentSub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (!currentSub?.stripe_subscription_id) throw new Error('No active Stripe subscription found');

      const { data: newPlan } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('slug', plan_slug)
        .eq('is_active', true)
        .single();
      if (!newPlan) throw new Error(`Plan not found: ${plan_slug}`);

      const cycle = billing_cycle || currentSub.billing_cycle || 'monthly';
      const newPriceId = cycle === 'annual'
        ? newPlan.stripe_annual_price_id
        : newPlan.stripe_monthly_price_id;
      if (!newPriceId) throw new Error(`Stripe price not configured for ${plan_slug} (${cycle})`);

      const stripeSub = await stripe.subscriptions.retrieve(currentSub.stripe_subscription_id);
      const updatedStripeSub = await stripe.subscriptions.update(currentSub.stripe_subscription_id, {
        items: [{
          id: stripeSub.items.data[0].id,
          price: newPriceId,
        }],
        proration_behavior: action === 'upgrade' ? 'always_invoice' : 'create_prorations',
        metadata: { plan_slug },
      });

      const { data: updated, error: updateError } = await supabase
        .from('subscriptions')
        .update({
          plan_id: newPlan.id,
          billing_cycle: cycle,
          current_period_start: new Date(updatedStripeSub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(updatedStripeSub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentSub.id)
        .select()
        .single();
      if (updateError) throw updateError;

      return new Response(JSON.stringify({ subscription: updated }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── ACTION: ADD_ADDON ──
    if (action === 'add_addon') {
      if (!addon_slug) throw new Error('addon_slug required for add_addon');

      const { data: addon } = await supabase
        .from('studio_addons')
        .select('*')
        .eq('slug', addon_slug)
        .eq('is_active', true)
        .single();
      if (!addon) throw new Error(`Add-on not found: ${addon_slug}`);

      const priceId = billing_cycle === 'annual'
        ? addon.stripe_annual_price_id
        : addon.stripe_monthly_price_id;
      if (!priceId) throw new Error(`Stripe price not configured for addon ${addon_slug}`);

      const stripeSubscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: { supabase_user_id: user.id, addon_slug },
      });

      const { data: userAddon, error: addonError } = await supabase
        .from('user_addons')
        .upsert({
          user_id: user.id,
          addon_id: addon.id,
          status: stripeSubscription.status,
          stripe_subscription_id: stripeSubscription.id,
          billing_cycle,
          current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
        }, { onConflict: 'user_id,addon_id' })
        .select()
        .single();
      if (addonError) throw addonError;

      const invoice = stripeSubscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = invoice?.payment_intent as Stripe.PaymentIntent;

      return new Response(JSON.stringify({
        user_addon: userAddon,
        client_secret: paymentIntent?.client_secret,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── ACTION: REMOVE_ADDON ──
    if (action === 'remove_addon') {
      if (!addon_slug) throw new Error('addon_slug required for remove_addon');

      const { data: userAddon } = await supabase
        .from('user_addons')
        .select('*, studio_addons!inner(slug)')
        .eq('user_id', user.id)
        .eq('studio_addons.slug', addon_slug)
        .eq('status', 'active')
        .single();
      if (!userAddon) throw new Error(`Active add-on not found: ${addon_slug}`);

      if (userAddon.stripe_subscription_id) {
        await stripe.subscriptions.update(userAddon.stripe_subscription_id, {
          cancel_at_period_end: true,
        });
      }

      const { data: updated, error: updateError } = await supabase
        .from('user_addons')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userAddon.id)
        .select()
        .single();
      if (updateError) throw updateError;

      return new Response(JSON.stringify({ user_addon: updated }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
