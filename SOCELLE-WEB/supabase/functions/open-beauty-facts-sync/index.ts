/**
 * open-beauty-facts-sync — Supabase Edge Function
 *
 * Fetches beauty product data from the Open Beauty Facts API
 * (https://world.openbeautyfacts.org) and populates public.ingredients
 * with INCI names extracted from product ingredient lists.
 *
 * Each invocation processes one page of OBF results (100 products).
 * Designed for iterative, cron-driven pagination: the response includes
 * `next_page` so the scheduler can walk through all available data.
 *
 * Only INCI name extraction is performed in this function. Safety scores,
 * CAS numbers, and CosIng IDs are populated by later enrichment WOs
 * (ingest-cosing, ingest-openfda W11-06).
 *
 * Invocation:
 *   POST /functions/v1/open-beauty-facts-sync
 *   Body: { "page": 1 }   — page to fetch (default 1, 1-indexed)
 *
 * Deployment:
 *   supabase functions deploy open-beauty-facts-sync
 *
 * Secrets required:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Scheduling (initial full sync — run sequentially or parallel):
 *   Call page 1, read next_page from response, continue until next_page is null.
 *   Recommended: trigger via pg_cron at low frequency (1 req/sec) to respect OBF rate limits.
 *
 * OBF Terms: Open Database License (ODbL). Data is open access, no API key required.
 *   Attribution: "Open Beauty Facts contributors (https://world.openbeautyfacts.org)"
 *
 * W10-09 — SOCELLE GLOBAL Open Beauty Facts Integration
 * Owner: Backend Agent
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { enforceEdgeFunctionEnabled } from '../_shared/edgeControl.ts';

// ── Constants ─────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OBF_SEARCH_URL = 'https://world.openbeautyfacts.org/cgi/search.pl';
const PAGE_SIZE      = 100;
const FETCH_TIMEOUT  = 25_000;
const USER_AGENT     = 'Socelle-Intelligence-Bot/1.0 (https://socelle.com)';

// Maximum INCI name length guard (CosIng names can be long but rarely > 300 chars)
const MAX_INCI_LEN = 300;

// ── Types ─────────────────────────────────────────────────────────────────────

interface OBFIngredient {
  id?: string;
  text?: string;
  rank?: number;
  percent_min?: number;
}

interface OBFProduct {
  _id?: string;
  product_name?: string;
  brands?: string;
  ingredients_text?: string;
  ingredients?: OBFIngredient[];
}

interface OBFSearchResponse {
  count?: number;
  page?: number;
  page_size?: number;
  products: OBFProduct[];
}

// ── INCI Name Normalisation ───────────────────────────────────────────────────

/**
 * Normalise a raw ingredient token to a canonical INCI form:
 * - Uppercase (INCI is always uppercase by convention)
 * - Collapse whitespace
 * - Strip brackets/parenthetical comments (e.g. "(AND)" phrases)
 * - Reject tokens that are clearly not ingredient names
 */
function normaliseInci(raw: string): string | null {
  const cleaned = raw
    .trim()
    // Remove leading/trailing punctuation artefacts
    .replace(/^[-–•*+.]+/, '')
    .replace(/[-–•*+.]+$/, '')
    // Strip parenthetical explanatory clauses common in OBF text
    .replace(/\((?:and|or|may contain|ci \d+)[^)]*\)/gi, '')
    .trim()
    .toUpperCase()
    // Collapse internal whitespace
    .replace(/\s+/g, ' ');

  // Reject: too short, pure digits, too long, contains control characters
  if (
    cleaned.length < 2 ||
    cleaned.length > MAX_INCI_LEN ||
    /^\d+$/.test(cleaned) ||
    // eslint-disable-next-line no-control-regex
    /[\x00-\x1F]/.test(cleaned)
  ) {
    return null;
  }

  return cleaned;
}

/**
 * Parse a free-text INCI ingredient list (comma- or semicolon-separated)
 * into individual normalised INCI names.
 */
function parseInciText(text: string): string[] {
  return text
    .split(/[,;]/)
    .map(s => normaliseInci(s))
    .filter((s): s is string => s !== null);
}

/**
 * Extract INCI names from an OBF product, preferring the structured
 * `ingredients` array over raw `ingredients_text`.
 */
function extractInciNames(product: OBFProduct): string[] {
  if (product.ingredients?.length) {
    return product.ingredients
      .map(ing => normaliseInci(ing.text ?? ing.id ?? ''))
      .filter((s): s is string => s !== null);
  }
  if (product.ingredients_text) {
    return parseInciText(product.ingredients_text);
  }
  return [];
}

// ── Main Handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  const edgeControlResponse = await enforceEdgeFunctionEnabled('open-beauty-facts-sync', req);
  if (edgeControlResponse) return edgeControlResponse;
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );

  try {
    const body: { page?: number } =
      req.method === 'POST' && req.headers.get('content-type')?.includes('application/json')
        ? await req.json().catch(() => ({}))
        : {};

    const page = Math.max(1, Math.floor(Number(body.page ?? 1)));

    // ── Fetch page from Open Beauty Facts ──────────────────────────────────

    const params = new URLSearchParams({
      action:     'process',
      json:       '1',
      page_size:  String(PAGE_SIZE),
      page:       String(page),
      // Filter to beauty category products
      tagtype_0:  'categories',
      tag_0:      'beauty',
      // Only fetch fields we need — minimises response payload
      fields:     'product_name,brands,ingredients_text,ingredients,_id',
    });

    const obfRes = await fetch(`${OBF_SEARCH_URL}?${params}`, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    });

    if (!obfRes.ok) {
      throw new Error(`Open Beauty Facts API error: HTTP ${obfRes.status}`);
    }

    const data: OBFSearchResponse = await obfRes.json();
    const products = data.products ?? [];
    const totalCount = data.count ?? 0;
    const totalPages = totalCount > 0 ? Math.ceil(totalCount / PAGE_SIZE) : null;
    const nextPage = totalPages && page < totalPages ? page + 1 : null;

    if (!products.length) {
      return new Response(
        JSON.stringify({
          ok: true,
          page,
          total_pages: totalPages,
          next_page: nextPage,
          products_processed: 0,
          unique_inci_names: 0,
          ingredients_inserted: 0,
          message: 'No products returned for this page',
        }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      );
    }

    // ── Extract unique INCI names across all products on this page ─────────

    const inciSet = new Set<string>();
    for (const product of products) {
      for (const name of extractInciNames(product)) {
        inciSet.add(name);
      }
    }

    const inciNames = Array.from(inciSet);

    if (!inciNames.length) {
      return new Response(
        JSON.stringify({
          ok: true,
          page,
          total_pages: totalPages,
          next_page: nextPage,
          products_processed: products.length,
          unique_inci_names: 0,
          ingredients_inserted: 0,
          message: 'No parseable INCI names found on this page',
        }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      );
    }

    // ── Upsert into public.ingredients (skip existing by inci_name) ────────

    // ODbL attribution — required per SOCELLE_DATA_PROVENANCE_POLICY.md §2 and ODbL §4.3.
    // Every record must document: source_url, source_name, license_type, attribution_text,
    // and fetched_at so the provenance is permanently auditable.
    const fetchedAt = new Date().toISOString();
    const obfPageUrl = `${OBF_SEARCH_URL}?action=process&json=1&page_size=${PAGE_SIZE}&page=${page}&tagtype_0=categories&tag_0=beauty`;
    const obfAttribution = {
      source:           'open_beauty_facts',
      source_name:      'Open Beauty Facts',
      source_url:       obfPageUrl,
      canonical_url:    'https://world.openbeautyfacts.org',
      license_type:     'ODbL',                            // Open Database License v1.0
      attribution_text: 'Open Beauty Facts contributors (https://world.openbeautyfacts.org) — ODbL license',
      fetched_at:       fetchedAt,
      obf_page:         page,
    };

    // Batch upserts in chunks of 500 to stay within request body limits
    const CHUNK_SIZE = 500;
    let totalInserted = 0;

    for (let i = 0; i < inciNames.length; i += CHUNK_SIZE) {
      const chunk = inciNames.slice(i, i + CHUNK_SIZE).map(inci_name => ({
        inci_name,
        metadata: obfAttribution,
      }));

      const { error: upsertError, count } = await supabase
        .from('ingredients')
        .upsert(chunk, { onConflict: 'inci_name', ignoreDuplicates: true })
        .select('id', { count: 'exact', head: true });

      if (upsertError) {
        throw new Error(`ingredients upsert failed (chunk ${i}): ${upsertError.message}`);
      }

      totalInserted += count ?? 0;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        page,
        total_pages: totalPages,
        next_page: nextPage,
        products_processed: products.length,
        unique_inci_names: inciNames.length,
        ingredients_inserted: totalInserted,
      }),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[open-beauty-facts-sync] Fatal error:', message);
    return new Response(
      JSON.stringify({ ok: false, error: message }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }
});
