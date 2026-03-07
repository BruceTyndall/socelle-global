/**
 * validate-discount — Supabase Edge Function
 * WO: WO-OVERHAUL-11
 *
 * Validates a discount code against the discount_codes table.
 * Public endpoint (no auth required) for cart UX.
 *
 * Accepts: { code, cart_subtotal_cents }
 * Returns: { valid, discount_amount_cents?, type?, message }
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { code, cart_subtotal_cents } = body;

    if (!code || typeof cart_subtotal_cents !== 'number') {
      return new Response(JSON.stringify({
        valid: false,
        message: 'Missing required fields: code, cart_subtotal_cents',
      }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // Look up the discount code (service_role bypasses RLS)
    const { data: discount, error } = await admin
      .from('discount_codes')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .single();

    if (error || !discount) {
      return new Response(JSON.stringify({
        valid: false,
        message: 'Discount code not found',
      }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // Check is_active
    if (!discount.is_active) {
      return new Response(JSON.stringify({
        valid: false,
        message: 'This discount code is no longer active',
      }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // Check expiry
    if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
      return new Response(JSON.stringify({
        valid: false,
        message: 'This discount code has expired',
      }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // Check max uses
    if (discount.maximum_uses && discount.current_uses >= discount.maximum_uses) {
      return new Response(JSON.stringify({
        valid: false,
        message: 'This discount code has reached its maximum number of uses',
      }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // Check minimum order
    if (discount.minimum_order_cents && cart_subtotal_cents < discount.minimum_order_cents) {
      const minOrder = (discount.minimum_order_cents / 100).toFixed(2);
      return new Response(JSON.stringify({
        valid: false,
        message: `Minimum order of $${minOrder} required for this discount code`,
      }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // Calculate discount amount
    let discountAmountCents = 0;

    switch (discount.type) {
      case 'percentage':
        if (discount.percentage) {
          discountAmountCents = Math.round(cart_subtotal_cents * discount.percentage / 100);
        }
        break;
      case 'fixed_amount':
        if (discount.value_cents) {
          discountAmountCents = Math.min(discount.value_cents, cart_subtotal_cents);
        }
        break;
      case 'free_shipping':
        discountAmountCents = 0; // Shipping discount applied at checkout
        break;
    }

    return new Response(JSON.stringify({
      valid: true,
      discount_amount_cents: discountAmountCents,
      type: discount.type,
      message: discount.type === 'free_shipping'
        ? 'Free shipping applied!'
        : discount.type === 'percentage'
          ? `${discount.percentage}% off applied!`
          : `$${(discountAmountCents / 100).toFixed(2)} off applied!`,
    }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('validate-discount error:', err);
    return new Response(
      JSON.stringify({ valid: false, message }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  }
});
