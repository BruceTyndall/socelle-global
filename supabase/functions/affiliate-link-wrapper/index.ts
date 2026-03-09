/**
 * affiliate-link-wrapper — Supabase Edge Function
 * PAY-WO-04: Affiliate link click tracking
 *
 * Accepts a JSON body with affiliate link details, logs the click to
 * affiliate_clicks table, and returns the redirect URL with ref params.
 *
 * Request body:
 *   { affiliate_code, target_url, product_id?, distributor_id? }
 *
 * Response:
 *   { redirect_url: string }
 *
 * Auth: optional — anonymous clicks are allowed (user_id may be null).
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { enforceEdgeFunctionEnabled } from '../_shared/edgeControl.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const edgeControlResponse = await enforceEdgeFunctionEnabled('affiliate-link-wrapper', req);
  if (edgeControlResponse) return edgeControlResponse;

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { affiliate_code, target_url, product_id, distributor_id } = body;

    if (!target_url) {
      return new Response(JSON.stringify({ error: 'target_url is required' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Resolve the calling user (optional — anonymous clicks allowed)
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id ?? null;
    }

    // Build redirect URL with affiliate ref params
    let redirectUrl: string;
    try {
      const url = new URL(target_url);
      if (affiliate_code) url.searchParams.set('ref', affiliate_code);
      url.searchParams.set('src', 'socelle');
      if (product_id) url.searchParams.set('pid', product_id);
      redirectUrl = url.toString();
    } catch {
      // Relative or malformed URL — append params manually
      const sep = target_url.includes('?') ? '&' : '?';
      redirectUrl = `${target_url}${sep}src=socelle`;
      if (affiliate_code) redirectUrl += `&ref=${encodeURIComponent(affiliate_code)}`;
    }

    // Log the click — fire-and-forget (do not block redirect on write failure)
    supabase.from('affiliate_clicks').insert({
      user_id: userId,
      product_id: product_id ?? null,
      distributor_id: distributor_id ?? null,
      affiliate_code: affiliate_code ?? null,
      target_url,
      user_agent: req.headers.get('user-agent') ?? null,
      created_at: new Date().toISOString(),
    }).then(({ error }) => {
      if (error) console.error('[affiliate-link-wrapper] click log error:', error.message);
    });

    return new Response(JSON.stringify({ redirect_url: redirectUrl }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[affiliate-link-wrapper] error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
