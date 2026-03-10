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
 * Secrets required:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * OBF Terms: Open Database License (ODbL). Data is open access, no API key required.
 *   Attribution: "Open Beauty Facts contributors (https://world.openbeautyfacts.org)"
 *
 * W10-09 — SOCELLE GLOBAL Open Beauty Facts Integration
 * FREE-DATA-01 — inlined _shared/edgeControl.ts (MCP deploy cannot resolve cross-dir imports)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

// ── Inlined from _shared/edgeControl.ts ───────────────────────────────────────
async function enforceEdgeFunctionEnabled(functionName: string, req: Request): Promise<Response | null> {
  if (req.method === 'OPTIONS') return null;
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !supabaseServiceKey) return null;
  const ctrl = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });
  const { data, error } = await ctrl
    .from('edge_function_controls')
    .select('is_enabled')
    .eq('function_name', functionName)
    .maybeSingle();
  if (error) { console.error('[edgeControl] lookup error:', error.message); return null; }
  if (!data) return null;
  if (data.is_enabled === false) {
    return new Response(
      JSON.stringify({ error: 'Edge function disabled', code: 'edge_function_disabled', function_name: functionName }),
      { status: 503, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Content-Type': 'application/json' } },
    );
  }
  return null;
}
// ─────────────────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OBF_SEARCH_URL = 'https://world.openbeautyfacts.org/cgi/search.pl';
const PAGE_SIZE      = 100;
const FETCH_TIMEOUT  = 25_000;
const USER_AGENT     = 'Socelle-Intelligence-Bot/1.0 (https://socelle.com)';
const MAX_INCI_LEN   = 300;

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

function normaliseInci(raw: string): string | null {
  const cleaned = raw
    .trim()
    .replace(/^[-–•*+.]+/, '')
    .replace(/[-–•*+.]+$/, '')
    .replace(/\((?:and|or|may contain|ci \d+)[^)]*\)/gi, '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');

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

function parseInciText(text: string): string[] {
  return text
    .split(/[,;]/)
    .map(s => normaliseInci(s))
    .filter((s): s is string => s !== null);
}

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

    const params = new URLSearchParams({
      action:     'process',
      json:       '1',
      page_size:  String(PAGE_SIZE),
      page:       String(page),
      tagtype_0:  'categories',
      tag_0:      'beauty',
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
        JSON.stringify({ ok: true, page, total_pages: totalPages, next_page: nextPage, products_processed: 0, unique_inci_names: 0, ingredients_inserted: 0, message: 'No products returned for this page' }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      );
    }

    const inciSet = new Set<string>();
    for (const product of products) {
      for (const name of extractInciNames(product)) {
        inciSet.add(name);
      }
    }

    const inciNames = Array.from(inciSet);

    if (!inciNames.length) {
      return new Response(
        JSON.stringify({ ok: true, page, total_pages: totalPages, next_page: nextPage, products_processed: products.length, unique_inci_names: 0, ingredients_inserted: 0, message: 'No parseable INCI names found on this page' }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      );
    }

    const fetchedAt = new Date().toISOString();
    const obfPageUrl = `${OBF_SEARCH_URL}?action=process&json=1&page_size=${PAGE_SIZE}&page=${page}&tagtype_0=categories&tag_0=beauty`;
    const obfAttribution = {
      source:           'open_beauty_facts',
      source_name:      'Open Beauty Facts',
      source_url:       obfPageUrl,
      canonical_url:    'https://world.openbeautyfacts.org',
      license_type:     'ODbL',
      attribution_text: 'Open Beauty Facts contributors (https://world.openbeautyfacts.org) — ODbL license',
      fetched_at:       fetchedAt,
      obf_page:         page,
    };

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
      JSON.stringify({ ok: true, page, total_pages: totalPages, next_page: nextPage, products_processed: products.length, unique_inci_names: inciNames.length, ingredients_inserted: totalInserted }),
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
