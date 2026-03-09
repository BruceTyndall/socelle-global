/**
 * rss-to-signals — Supabase Edge Function
 * W12-20: Promotes qualifying rss_items rows into market_signals.
 *
 * POST /functions/v1/rss-to-signals
 *   Body (optional JSON): { "limit": <n> }  — max items per run (default 100, max 500)
 *   GET also accepted (no body needed, uses defaults).
 *
 * Promotion threshold: rss_items.confidence_score >= 0.50
 *
 * signal_type heuristic (deterministic — owner approved 2026-03-06):
 *   brand_mentions.length > 0 AND ingredient_mentions.length === 0
 *     → 'brand_adoption'  (brand-only article, zero ingredient context)
 *   all other cases (ingredient, mixed, general news)
 *     → 'ingredient_momentum'  (default)
 *
 * Provenance fields (per SOCELLE_DATA_PROVENANCE_POLICY.md §2–3):
 *   source_type      = 'rss'
 *   external_id      = rss_items.guid           (dedup key)
 *   data_source      = rss_items.id             (linkable provenance)
 *   confidence_score = rss_items.confidence_score
 *   source           = rss_items.attribution_text || rss_sources.name
 *
 * Data label: LIVE — rows derived from live rss_items table.
 * updated_at is a real DB column auto-updated on upsert (not simulated).
 *
 * Dedup: upsert on (source_type, external_id) via market_signals_source_dedup_idx.
 * Existing rows for the same guid are updated (title/description/confidence may change).
 *
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-injected by Supabase)
 *
 * Allowed path: SOCELLE-WEB/supabase/functions/ (AGENT_SCOPE_REGISTRY §Backend Agent)
 * Authority: build_tracker.md WO W12-20
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
};

// Minimum confidence threshold per W12-20 scope
const CONFIDENCE_THRESHOLD = 0.50;

// Batch cap per invocation
const MAX_LIMIT = 500;
const DEFAULT_LIMIT = 100;

// ── Types ─────────────────────────────────────────────────────────────────────

interface RssItemRow {
  id: string;
  guid: string;
  title: string;
  description: string | null;
  content: string | null;
  link: string | null;
  published_at: string | null;
  confidence_score: number;
  relevance_score: number | null;
  brand_mentions: string[];
  ingredient_mentions: string[];
  treatment_mentions: string[];
  vertical_tags: string[];
  attribution_text: string;
  source_id: string;
  // joined from rss_sources:
  source_name: string | null;
  source_category: string | null;
}

type SignalType = 'product_velocity' | 'treatment_trend' | 'ingredient_momentum' | 'brand_adoption' | 'regional' | 'pricing_benchmark' | 'regulatory_alert' | 'education';
type SignalDirection = 'up' | 'down' | 'stable';

interface MarketSignalUpsert {
  signal_type:      SignalType;
  signal_key:       string;
  title:            string;
  description:      string;
  magnitude:        number;
  direction:        SignalDirection;
  region:           string | null;
  category:         string | null;
  related_brands:   string[];
  related_products: string[];
  source:           string | null;
  source_type:      string;
  external_id:      string;
  data_source:      string;
  confidence_score: number;
  active:           boolean;
  // FEED-WO-03: dedup fingerprint
  fingerprint:      string | null;
  is_duplicate:     boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Deterministic signal_type mapping (owner approved 2026-03-06):
 * brand_mentions > 0 AND ingredient_mentions = 0 → brand_adoption
 * all other cases → ingredient_momentum
 */
function resolveSignalType(item: RssItemRow): SignalType {
  if (item.brand_mentions.length > 0 && item.ingredient_mentions.length === 0) {
    return 'brand_adoption';
  }
  return 'ingredient_momentum';
}

/**
 * Derive a stable, namespaced signal_key from rss_items.id.
 * Uses first 16 hex chars of the UUID (no dashes) prefixed with 'rss_'.
 * Guaranteed unique (derived from UUID primary key).
 */
function signalKey(id: string): string {
  return `rss_${id.replace(/-/g, '').substring(0, 16)}`;
}

/**
 * Build description: prefer rss_items.description, fall back to content prefix.
 * Truncated to 500 chars to keep market_signals readable.
 */
function buildDescription(item: RssItemRow): string {
  const raw = item.description || item.content || item.title;
  return raw.substring(0, 500);
}

/**
 * Build magnitude from relevance_score (preferred) or confidence_score.
 * Both are 0–1 numeric. Clamp to [0, 1].
 */
function buildMagnitude(item: RssItemRow): number {
  const raw = item.relevance_score ?? item.confidence_score;
  return Math.min(Math.max(raw, 0), 1);
}

/**
 * FEED-WO-03: Build a content fingerprint for dedup.
 * Hash = btoa(title|source|published_at) truncated to 64 chars.
 * Used as a unique key to detect duplicate ingestion across pipeline runs.
 * Falls back to null if btoa is unavailable (should never happen in Deno).
 */
function buildFingerprint(item: RssItemRow): string | null {
  try {
    const raw = `${item.title}|${item.attribution_text ?? item.source_name ?? ''}|${item.published_at ?? ''}`;
    return btoa(encodeURIComponent(raw)).substring(0, 64);
  } catch {
    return null;
  }
}

/**
 * Build source attribution string.
 * Priority: attribution_text (if non-empty) → source_name → link
 */
function buildSource(item: RssItemRow): string | null {
  if (item.attribution_text && item.attribution_text.trim().length > 0) {
    return item.attribution_text.trim();
  }
  if (item.source_name) {
    return item.source_name;
  }
  return item.link ?? null;
}

// ── Main handler ──────────────────────────────────────────────────────────────

serve(async (req) => {
  const edgeControlResponse = await enforceEdgeFunctionEnabled('rss-to-signals', req);
  if (edgeControlResponse) return edgeControlResponse;
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
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

  // Parse optional limit from POST body
  let limit = DEFAULT_LIMIT;
  if (req.method === 'POST') {
    try {
      const body = await req.json().catch(() => ({}));
      if (typeof body.limit === 'number') {
        limit = Math.min(Math.max(body.limit, 1), MAX_LIMIT);
      }
    } catch {
      // Ignore parse errors — use default limit
    }
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const startedAt = new Date().toISOString();

  try {
    // ── 1. Fetch qualifying rss_items joined with rss_sources ─────────────────
    //
    // Qualification: confidence_score >= threshold
    // Join: rss_sources for source_name and category (provenance + signal category)
    // Order: newest published_at first, then by confidence_score desc
    // Limit: capped per invocation to prevent runaway promotions

    const { data: items, error: fetchErr } = await supabase
      .from('rss_items')
      .select(`
        id, guid, title, description, content, link, published_at,
        confidence_score, relevance_score,
        brand_mentions, ingredient_mentions, treatment_mentions, vertical_tags,
        attribution_text,
        source_id,
        rss_sources!inner (
          name,
          category
        )
      `)
      .gte('confidence_score', CONFIDENCE_THRESHOLD)
      .order('published_at', { ascending: false })
      .order('confidence_score', { ascending: false })
      .limit(limit);

    if (fetchErr) throw fetchErr;

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({
          promoted: 0,
          skipped: 0,
          message: 'No qualifying rss_items found above confidence threshold',
          threshold: CONFIDENCE_THRESHOLD,
          started_at: startedAt,
          finished_at: new Date().toISOString(),
          isLive: true,
        }),
        { headers: JSON_HEADERS }
      );
    }

    // ── 2. Build market_signals upsert payload ────────────────────────────────

    const upsertRows: MarketSignalUpsert[] = (items as any[]).map((row) => {
      // Flatten joined rss_sources
      const item: RssItemRow = {
        ...row,
        source_name:     row.rss_sources?.name     ?? null,
        source_category: row.rss_sources?.category ?? null,
      };

      return {
        signal_type:      resolveSignalType(item),
        signal_key:       signalKey(item.id),
        title:            item.title,
        description:      buildDescription(item),
        magnitude:        buildMagnitude(item),
        direction:        'stable' as SignalDirection, // RSS articles don't convey trend direction
        region:           null,                         // Not derivable from RSS without NLP
        category:         item.source_category,
        related_brands:   item.brand_mentions,
        related_products: [],                           // RSS has no product-level data
        source:           buildSource(item),
        // Provenance (W12-20 requirements):
        source_type:      'rss',
        external_id:      item.guid,
        data_source:      item.id,
        confidence_score: item.confidence_score,
        active:           true,
        // FEED-WO-03: dedup fingerprint
        fingerprint:      buildFingerprint(item),
        is_duplicate:     false,
      };
    });

    // ── 3. Upsert into market_signals ─────────────────────────────────────────
    //
    // onConflict: 'source_type,external_id' maps to market_signals_source_dedup_idx
    // ignoreDuplicates: false → UPDATE existing rows (title/confidence may change)
    // updated_at is auto-updated by DB trigger on any row change

    const { data: upserted, error: upsertErr } = await supabase
      .from('market_signals')
      .upsert(upsertRows, {
        onConflict: 'source_type,external_id',
        ignoreDuplicates: false,
      })
      .select('id, signal_key, signal_type, confidence_score, source_type, external_id');

    if (upsertErr) throw upsertErr;

    const promotedCount  = upserted?.length ?? 0;
    const skippedCount   = items.length - promotedCount;

    return new Response(
      JSON.stringify({
        promoted:    promotedCount,
        skipped:     skippedCount,
        threshold:   CONFIDENCE_THRESHOLD,
        limit_used:  limit,
        sample:      (upserted ?? []).slice(0, 5).map((r: any) => ({
          id:               r.id,
          signal_key:       r.signal_key,
          signal_type:      r.signal_type,
          confidence_score: r.confidence_score,
          source_type:      r.source_type,
          external_id:      r.external_id,
        })),
        started_at:  startedAt,
        finished_at: new Date().toISOString(),
        isLive:      true,
      }),
      { headers: JSON_HEADERS }
    );

  } catch (err: any) {
    console.error('[rss-to-signals]', err);
    return new Response(
      JSON.stringify({ error: err.message, isLive: true }),
      { status: 500, headers: JSON_HEADERS }
    );
  }
});
