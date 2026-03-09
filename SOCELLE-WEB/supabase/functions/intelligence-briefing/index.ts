/**
 * intelligence-briefing — Supabase Edge Function
 * W12-16: Serving function for Intelligence Hub — returns live market signals + pulse.
 *
 * GET /functions/v1/intelligence-briefing
 *   ?category=<signal_type>   filter by signal_type (optional)
 *   &limit=<n>                max signals to return (default: 20, max: 50)
 *
 * Response shape matches IntelligenceSignal[] + MarketPulse from src/lib/intelligence/types.ts
 *
 * Data label: LIVE — all data sourced from market_signals, brands, businesses tables.
 *
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-injected)
 *
 * Allowed path: SOCELLE-WEB/supabase/functions/ (AGENT_SCOPE_REGISTRY §Backend Agent)
 * Authority: build_tracker.md WO W12-16
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { enforceEdgeFunctionEnabled } from '../_shared/edgeControl.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const JSON_HEADERS = {
  ...CORS_HEADERS,
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=60', // signals cache 1 min
};

// Mirrors IntelligenceSignal from src/lib/intelligence/types.ts
interface SignalRow {
  id: string;
  signal_type: string;
  signal_key: string;
  title: string;
  description: string;
  magnitude: number;
  direction: 'up' | 'down' | 'stable';
  region: string | null;
  category: string | null;
  related_brands: string[] | null;
  related_products: string[] | null;
  updated_at: string;
  source: string | null;
}

serve(async (req) => {
  const edgeControlResponse = await enforceEdgeFunctionEnabled('intelligence-briefing', req);
  if (edgeControlResponse) return edgeControlResponse;
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: JSON_HEADERS,
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }

  const params   = new URL(req.url).searchParams;
  const category = params.get('category') ?? null;
  const rawLimit = parseInt(params.get('limit') ?? '20', 10);
  const limit    = Math.min(Math.max(rawLimit, 1), 50);

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // ── Signals query ──────────────────────────────────────────────────────
    let signalQuery = supabase
      .from('market_signals')
      .select('id, signal_type, signal_key, title, description, magnitude, direction, region, category, related_brands, related_products, updated_at, source')
      .eq('active', true)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
      .order('display_order', { ascending: true })
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (category && category !== 'all') {
      signalQuery = signalQuery.eq('signal_type', category);
    }

    const { data: signalRows, error: signalErr } = await signalQuery;
    if (signalErr) throw signalErr;

    const signals = (signalRows as SignalRow[] ?? []).map((row) => ({
      id:               row.id,
      signal_type:      row.signal_type,
      signal_key:       row.signal_key,
      title:            row.title,
      description:      row.description,
      magnitude:        row.magnitude,
      direction:        row.direction,
      region:           row.region ?? undefined,
      category:         row.category ?? undefined,
      related_brands:   row.related_brands ?? [],
      related_products: row.related_products ?? [],
      updated_at:       row.updated_at,
      source:           row.source ?? undefined,
    }));

    // ── Market pulse ───────────────────────────────────────────────────────
    const now = new Date().toISOString();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      { count: totalProfessionals },
      { count: totalBrands },
      { count: activeSignals },
      { count: signalsThisWeek },
      { data: trendingRows },
    ] = await Promise.all([
      supabase.from('businesses').select('id', { count: 'exact', head: true }),
      supabase.from('brands').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('market_signals').select('id', { count: 'exact', head: true })
        .eq('active', true)
        .or('expires_at.is.null,expires_at.gt.' + now),
      supabase.from('market_signals').select('id', { count: 'exact', head: true })
        .eq('active', true)
        .gte('created_at', weekAgo),
      // Most frequent signal_type in the last 30 days for trending_category
      supabase.from('market_signals')
        .select('signal_type')
        .eq('active', true)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .limit(100),
    ]);

    // Compute trending_category client-side from the returned rows
    const typeCounts: Record<string, number> = {};
    for (const row of (trendingRows ?? []) as { signal_type: string }[]) {
      typeCounts[row.signal_type] = (typeCounts[row.signal_type] ?? 0) + 1;
    }
    const trendingCategory = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'ingredient';

    const pulse = {
      total_professionals: totalProfessionals ?? 0,
      total_brands:        totalBrands ?? 0,
      active_signals:      activeSignals ?? 0,
      signals_this_week:   signalsThisWeek ?? 0,
      trending_category:   trendingCategory,
    };

    return new Response(
      JSON.stringify({ signals, pulse, isLive: true, fetched_at: now }),
      { headers: JSON_HEADERS }
    );
  } catch (err: any) {
    console.error('[intelligence-briefing]', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: JSON_HEADERS }
    );
  }
});
