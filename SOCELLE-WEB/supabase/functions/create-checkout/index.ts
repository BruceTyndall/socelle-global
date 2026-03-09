/**
 * create-checkout — Supabase Edge Function
 *
 * Creates a Stripe Checkout Session for provider subscription.
 * Requires STRIPE_SECRET_KEY set as Supabase secret:
 *   supabase secrets set STRIPE_SECRET_KEY=sk_test_...
 *
 * Called from frontend: supabase.functions.invoke('create-checkout', { body: { plan_id, return_url } })
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { enforceEdgeFunctionEnabled } from '../_shared/edgeControl.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STRIPE_API = 'https://api.stripe.com/v1';

async function stripeRequest(path: string, body: Record<string, string>, apiKey: string) {
  const res = await fetch(`${STRIPE_API}${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body).toString(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || `Stripe error: ${res.status}`);
  }
  return data;
}

async function stripeGet(path: string, apiKey: string) {
  const res = await fetch(`${STRIPE_API}${path}`, {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || `Stripe error: ${res.status}`);
  }
  return data;
}

serve(async (req) => {
  const edgeControlResponse = await enforceEdgeFunctionEnabled('create-checkout', req);
  if (edgeControlResponse) return edgeControlResponse;
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    // Authenticate the user via Supabase JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Use anon key + user JWT to get the user
    const supabaseUser = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { action, plan_id = 'pro_monthly', return_url } = body;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // ── Billing portal branch ──────────────────────────────────────
    if (action === 'portal') {
      const { data: sub } = await supabaseAdmin
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing', 'past_due'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!sub?.stripe_customer_id) {
        return new Response(JSON.stringify({ error: 'No active subscription found' }), {
          status: 404,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      const baseUrl = return_url || Deno.env.get('APP_URL') || 'http://localhost:5173';
      const portalSession = await stripeRequest('/billing_portal/sessions', {
        customer: sub.stripe_customer_id,
        return_url: `${baseUrl}/portal/account`,
      }, stripeKey);

      return new Response(
        JSON.stringify({ url: portalSession.url }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // ── Checkout session branch (default) ─────────────────────────
    // Get plan details from DB
    const { data: plan, error: planError } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .eq('id', plan_id)
      .single();

    if (planError || !plan) {
      return new Response(JSON.stringify({ error: 'Plan not found' }), {
        status: 404,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // Check if user already has a Stripe customer ID
    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    let customerId = existingSub?.stripe_customer_id;

    // Create Stripe customer if needed
    if (!customerId) {
      const customer = await stripeRequest('/customers', {
        email: user.email || '',
        'metadata[supabase_user_id]': user.id,
        'metadata[plan_id]': plan_id,
      }, stripeKey);
      customerId = customer.id;
    }

    // If plan has a stripe_price_id, use it; otherwise create a price on the fly
    let priceId = plan.stripe_price_id;

    if (!priceId) {
      // Create a Stripe Price (one-time setup; you should pre-create these in Stripe dashboard)
      // For MVP, we create inline
      const price = await stripeRequest('/prices', {
        'unit_amount': String(plan.price_cents),
        'currency': 'usd',
        'recurring[interval]': plan.interval,
        'product_data[name]': plan.name,
        'product_data[metadata[plan_id]]': plan_id,
      }, stripeKey);
      priceId = price.id;

      // Store the price ID back for future use
      await supabaseAdmin
        .from('subscription_plans')
        .update({ stripe_price_id: priceId })
        .eq('id', plan_id);
    }

    // Create Checkout Session
    const baseUrl = return_url || Deno.env.get('APP_URL') || 'http://localhost:5173';
    const session = await stripeRequest('/checkout/sessions', {
      'customer': customerId,
      'mode': 'subscription',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      'success_url': `${baseUrl}/portal?subscription=success`,
      'cancel_url': `${baseUrl}/portal?subscription=canceled`,
      'subscription_data[metadata[supabase_user_id]]': user.id,
      'subscription_data[metadata[plan_id]]': plan_id,
      'allow_promotion_codes': 'true',
    }, stripeKey);

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('create-checkout error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  }
});
