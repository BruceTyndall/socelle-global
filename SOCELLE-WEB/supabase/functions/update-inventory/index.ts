/**
 * update-inventory — Supabase Edge Function
 * WO: WO-OVERHAUL-11
 *
 * Decrements product/variant stock_quantity based on order items.
 * SERVICE ROLE ONLY — called from shop-webhook, not public.
 *
 * Accepts: { order_id }
 * Skips products with track_inventory = false.
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
    // --- Service role auth only ---
    const authHeader = req.headers.get('Authorization');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Only allow service_role calls (Bearer <service_role_key>)
    if (!authHeader || !authHeader.includes(supabaseServiceKey)) {
      return new Response(JSON.stringify({ error: 'Forbidden — service role only' }), {
        status: 403,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const admin = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { order_id } = body;

    if (!order_id) {
      return new Response(JSON.stringify({ error: 'Missing order_id' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // Fetch order items
    const { data: items, error: itemsError } = await admin
      .from('order_items')
      .select('product_id, variant_id, quantity')
      .eq('order_id', order_id);

    if (itemsError || !items || items.length === 0) {
      return new Response(JSON.stringify({ error: 'No order items found', details: itemsError?.message }), {
        status: 404,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    let updatedCount = 0;
    let skippedCount = 0;

    for (const item of items) {
      // Check if product tracks inventory
      const { data: product } = await admin
        .from('products')
        .select('id, track_inventory, stock_quantity')
        .eq('id', item.product_id)
        .single();

      if (!product) continue;

      // Skip products that don't track inventory
      if (!product.track_inventory) {
        skippedCount++;
        continue;
      }

      // Decrement product stock (floor at 0)
      const newProductStock = Math.max(0, product.stock_quantity - item.quantity);
      await admin
        .from('products')
        .update({
          stock_quantity: newProductStock,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.product_id);

      // Decrement variant stock if applicable
      if (item.variant_id) {
        const { data: variant } = await admin
          .from('product_variants')
          .select('id, stock_quantity')
          .eq('id', item.variant_id)
          .single();

        if (variant) {
          const newVariantStock = Math.max(0, variant.stock_quantity - item.quantity);
          await admin
            .from('product_variants')
            .update({ stock_quantity: newVariantStock })
            .eq('id', item.variant_id);
        }
      }

      updatedCount++;
    }

    return new Response(JSON.stringify({
      success: true,
      updated: updatedCount,
      skipped: skippedCount,
    }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('update-inventory error:', err);
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  }
});
