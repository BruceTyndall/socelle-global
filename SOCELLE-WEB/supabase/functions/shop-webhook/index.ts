/**
 * shop-webhook — Supabase Edge Function
 * WO: WO-OVERHAUL-11
 *
 * Handles Stripe webhook events for product checkout (parallel to stripe-webhook for subscriptions).
 *
 * Events handled:
 * - payment_intent.succeeded → order confirmed + decrement inventory
 * - payment_intent.payment_failed → order cancelled
 * - charge.refunded → order refunded + restore inventory
 *
 * SECURITY: Verifies Stripe webhook signature before processing any event.
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

/**
 * Verify Stripe webhook signature using HMAC-SHA256.
 * This ensures the request genuinely came from Stripe and was not tampered with.
 * The STRIPE_WEBHOOK_SECRET is NEVER exposed to the client — it stays server-side only.
 */
async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string
): Promise<boolean> {
  const parts = sigHeader.split(',');
  let timestamp = '';
  let signatures: string[] = [];

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 't') timestamp = value;
    if (key === 'v1') signatures.push(value);
  }

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  // Check timestamp tolerance (5 minutes)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
  const expectedSig = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return signatures.some((sig) => sig === expectedSig);
}

async function decrementInventory(admin: ReturnType<typeof createClient>, orderId: string) {
  const { data: items } = await admin
    .from('order_items')
    .select('product_id, variant_id, quantity, product_snapshot')
    .eq('order_id', orderId);

  if (!items) return;

  for (const item of items) {
    // Check if product tracks inventory
    const { data: product } = await admin
      .from('products')
      .select('track_inventory, stock_quantity')
      .eq('id', item.product_id)
      .single();

    if (!product || !product.track_inventory) continue;

    // Decrement product stock
    await admin
      .from('products')
      .update({ stock_quantity: Math.max(0, product.stock_quantity - item.quantity) })
      .eq('id', item.product_id);

    // Decrement variant stock if applicable
    if (item.variant_id) {
      const { data: variant } = await admin
        .from('product_variants')
        .select('stock_quantity')
        .eq('id', item.variant_id)
        .single();

      if (variant) {
        await admin
          .from('product_variants')
          .update({ stock_quantity: Math.max(0, variant.stock_quantity - item.quantity) })
          .eq('id', item.variant_id);
      }
    }
  }
}

async function restoreInventory(admin: ReturnType<typeof createClient>, orderId: string) {
  const { data: items } = await admin
    .from('order_items')
    .select('product_id, variant_id, quantity')
    .eq('order_id', orderId);

  if (!items) return;

  for (const item of items) {
    const { data: product } = await admin
      .from('products')
      .select('track_inventory, stock_quantity')
      .eq('id', item.product_id)
      .single();

    if (!product || !product.track_inventory) continue;

    await admin
      .from('products')
      .update({ stock_quantity: product.stock_quantity + item.quantity })
      .eq('id', item.product_id);

    if (item.variant_id) {
      const { data: variant } = await admin
        .from('product_variants')
        .select('stock_quantity')
        .eq('id', item.variant_id)
        .single();

      if (variant) {
        await admin
          .from('product_variants')
          .update({ stock_quantity: variant.stock_quantity + item.quantity })
          .eq('id', item.variant_id);
      }
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    // --- Verify webhook signature ---
    // SECURITY: STRIPE_WEBHOOK_SECRET is a server-side env var, never exposed to client.
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not configured');
    }

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const rawBody = await req.text();

    const isValid = await verifyStripeSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      console.error('shop-webhook: Invalid Stripe signature');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const event = JSON.parse(rawBody);
    console.log(`shop-webhook: Received event ${event.type} (${event.id})`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, supabaseServiceKey);

    // --- Handle events ---
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        console.log(`shop-webhook: PaymentIntent succeeded: ${pi.id}`);

        // Find order by stripe_payment_intent_id
        const { data: order } = await admin
          .from('orders')
          .select('id, status')
          .eq('stripe_payment_intent_id', pi.id)
          .single();

        if (order && order.status === 'pending') {
          // Update order status
          await admin
            .from('orders')
            .update({
              status: 'confirmed',
              stripe_charge_id: pi.latest_charge || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', order.id);

          // Decrement inventory
          await decrementInventory(admin, order.id);
          console.log(`shop-webhook: Order ${order.id} confirmed, inventory decremented`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object;
        console.log(`shop-webhook: PaymentIntent failed: ${pi.id}`);

        const { data: order } = await admin
          .from('orders')
          .select('id, status')
          .eq('stripe_payment_intent_id', pi.id)
          .single();

        if (order && order.status === 'pending') {
          await admin
            .from('orders')
            .update({
              status: 'cancelled',
              updated_at: new Date().toISOString(),
              metadata: { failure_reason: pi.last_payment_error?.message || 'Payment failed' },
            })
            .eq('id', order.id);

          console.log(`shop-webhook: Order ${order.id} cancelled due to payment failure`);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        console.log(`shop-webhook: Charge refunded: ${charge.id}`);

        // Find order by stripe_charge_id or payment_intent
        const piId = charge.payment_intent;
        const { data: order } = await admin
          .from('orders')
          .select('id, status')
          .eq('stripe_payment_intent_id', piId)
          .single();

        if (order && order.status !== 'refunded') {
          await admin
            .from('orders')
            .update({
              status: 'refunded',
              updated_at: new Date().toISOString(),
            })
            .eq('id', order.id);

          // Restore inventory
          await restoreInventory(admin, order.id);
          console.log(`shop-webhook: Order ${order.id} refunded, inventory restored`);
        }
        break;
      }

      default:
        console.log(`shop-webhook: Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('shop-webhook error:', err);
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  }
});
