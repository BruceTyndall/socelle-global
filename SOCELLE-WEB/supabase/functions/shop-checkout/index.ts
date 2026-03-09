/**
 * shop-checkout — Supabase Edge Function
 * WO: WO-OVERHAUL-11
 *
 * Creates a Stripe PaymentIntent for product checkout (NOT subscription).
 * Parallel to create-checkout (which handles subscriptions).
 *
 * Accepts: cart_id, shipping_method_id, discount_code?, shipping_address, billing_address
 * Returns: { client_secret, order_id, order_number }
 *
 * SECURITY: Never returns Stripe secret key. Only returns client_secret for PaymentIntent.
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

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SCL-${ts}-${rand}`;
}

serve(async (req) => {
  const edgeControlResponse = await enforceEdgeFunctionEnabled('shop-checkout', req);
  if (edgeControlResponse) return edgeControlResponse;
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    // --- Auth check ---
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

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

    // --- Parse request body ---
    const body = await req.json();
    const {
      cart_id,
      shipping_method_id,
      discount_code,
      shipping_address,
      billing_address,
    } = body;

    if (!cart_id || !shipping_method_id || !shipping_address || !billing_address) {
      return new Response(JSON.stringify({ error: 'Missing required fields: cart_id, shipping_method_id, shipping_address, billing_address' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(supabaseUrl, supabaseServiceKey);

    // --- Fetch cart + items ---
    const { data: cart, error: cartError } = await admin
      .from('carts')
      .select('*')
      .eq('id', cart_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (cartError || !cart) {
      return new Response(JSON.stringify({ error: 'Cart not found or not active' }), {
        status: 404,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const { data: cartItems, error: itemsError } = await admin
      .from('cart_items')
      .select('*, product:products(*), variant:product_variants(*)')
      .eq('cart_id', cart_id);

    if (itemsError || !cartItems || cartItems.length === 0) {
      return new Response(JSON.stringify({ error: 'Cart is empty' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // --- Validate inventory + calculate subtotal ---
    let subtotalCents = 0;
    const orderItems: Array<{
      product_id: string;
      variant_id: string | null;
      quantity: number;
      unit_price_cents: number;
      total_price_cents: number;
      product_snapshot: Record<string, unknown>;
    }> = [];

    for (const item of cartItems) {
      const product = item.product;
      if (!product || !product.is_active) {
        return new Response(JSON.stringify({ error: `Product "${item.product_id}" is no longer available` }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      // Use variant price if variant exists, otherwise product price
      const unitPrice = item.variant
        ? item.variant.price_cents
        : product.price_cents;

      // Check inventory
      if (product.track_inventory) {
        const availableStock = item.variant
          ? item.variant.stock_quantity
          : product.stock_quantity;

        if (availableStock < item.quantity) {
          return new Response(JSON.stringify({
            error: `Insufficient stock for "${product.name}". Available: ${availableStock}, Requested: ${item.quantity}`,
          }), {
            status: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          });
        }
      }

      const totalPrice = unitPrice * item.quantity;
      subtotalCents += totalPrice;

      orderItems.push({
        product_id: product.id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price_cents: unitPrice,
        total_price_cents: totalPrice,
        product_snapshot: {
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          price_cents: product.price_cents,
          images: product.images,
          variant_name: item.variant?.name || null,
          variant_sku: item.variant?.sku || null,
        },
      });
    }

    // --- Apply discount ---
    let discountCents = 0;
    if (discount_code) {
      const { data: discount } = await admin
        .from('discount_codes')
        .select('*')
        .eq('code', discount_code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (discount) {
        const now = new Date();
        const notExpired = !discount.expires_at || new Date(discount.expires_at) > now;
        const underMaxUses = !discount.maximum_uses || discount.current_uses < discount.maximum_uses;
        const meetsMinimum = !discount.minimum_order_cents || subtotalCents >= discount.minimum_order_cents;

        if (notExpired && underMaxUses && meetsMinimum) {
          if (discount.type === 'percentage' && discount.percentage) {
            discountCents = Math.round(subtotalCents * discount.percentage / 100);
          } else if (discount.type === 'fixed_amount' && discount.value_cents) {
            discountCents = Math.min(discount.value_cents, subtotalCents);
          }
          // free_shipping handled below

          // Increment usage
          await admin
            .from('discount_codes')
            .update({ current_uses: discount.current_uses + 1 })
            .eq('id', discount.id);
        }
      }
    }

    // --- Shipping ---
    const { data: shippingMethod } = await admin
      .from('shipping_methods')
      .select('*')
      .eq('id', shipping_method_id)
      .eq('is_active', true)
      .single();

    if (!shippingMethod) {
      return new Response(JSON.stringify({ error: 'Shipping method not found' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const totalItemCount = orderItems.reduce((sum, i) => sum + i.quantity, 0);
    let shippingCents = shippingMethod.base_rate_cents + (shippingMethod.per_item_rate_cents * totalItemCount);

    // Free shipping threshold or discount
    if (shippingMethod.free_above_cents && subtotalCents >= shippingMethod.free_above_cents) {
      shippingCents = 0;
    }

    // Check if discount is free_shipping type
    if (discount_code) {
      const { data: freeShipDiscount } = await admin
        .from('discount_codes')
        .select('type')
        .eq('code', discount_code.toUpperCase())
        .eq('type', 'free_shipping')
        .maybeSingle();
      if (freeShipDiscount) {
        shippingCents = 0;
      }
    }

    // --- Tax (placeholder — 0 for now) ---
    const taxCents = 0;

    // --- Total ---
    const totalCents = Math.max(0, subtotalCents - discountCents + shippingCents + taxCents);

    // --- Create Stripe PaymentIntent ---
    // SECURITY: Only client_secret is returned to the client. The Stripe secret key
    // (STRIPE_SECRET_KEY) is NEVER sent to the client — it stays server-side only.
    const paymentIntent = await stripeRequest('/payment_intents', {
      'amount': String(totalCents),
      'currency': 'usd',
      'metadata[supabase_user_id]': user.id,
      'metadata[cart_id]': cart_id,
    }, stripeKey);

    // --- Generate order number ---
    const orderNumber = generateOrderNumber();

    // --- Create order ---
    const { data: order, error: orderError } = await admin
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user.id,
        status: 'pending',
        subtotal_cents: subtotalCents,
        discount_cents: discountCents,
        tax_cents: taxCents,
        shipping_cents: shippingCents,
        total_cents: totalCents,
        currency: 'USD',
        stripe_payment_intent_id: paymentIntent.id,
        shipping_address: shipping_address,
        billing_address: billing_address,
        metadata: {
          discount_code: discount_code || null,
          shipping_method_id: shipping_method_id,
          shipping_method_name: shippingMethod.name,
        },
      })
      .select('id')
      .single();

    if (orderError || !order) {
      throw new Error(`Failed to create order: ${orderError?.message}`);
    }

    // --- Create order items ---
    const orderItemRows = orderItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      unit_price_cents: item.unit_price_cents,
      total_price_cents: item.total_price_cents,
      product_snapshot: item.product_snapshot,
    }));

    const { error: oiError } = await admin
      .from('order_items')
      .insert(orderItemRows);

    if (oiError) {
      throw new Error(`Failed to create order items: ${oiError.message}`);
    }

    // --- Mark cart as converted ---
    await admin
      .from('carts')
      .update({ status: 'converted', updated_at: new Date().toISOString() })
      .eq('id', cart_id);

    // --- Return client_secret (NEVER the stripe secret key) ---
    return new Response(
      JSON.stringify({
        client_secret: paymentIntent.client_secret,
        order_id: order.id,
        order_number: orderNumber,
      }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('shop-checkout error:', err);
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  }
});
