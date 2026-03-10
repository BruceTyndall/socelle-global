/**
 * ingest-npi — Supabase Edge Function
 *
 * Verifies an operator's NPI number against the CMS NPPES NPI Registry
 * (free public API — no API key required). On success, stamps
 * businesses.npi_verified = true and businesses.npi_verified_at = now().
 * A DB trigger (migration 20260313000001) then emits a market_signals row.
 *
 * Invocation:
 *   POST /functions/v1/ingest-npi
 *   Body: { "business_id": "<uuid>" }
 *
 * External API:
 *   https://npiregistry.cms.hhs.gov/api/?number=<NPI>&version=2.1
 *   No key required. Rate limit: ~120 req/min per CMS guidance.
 *
 * Secrets required:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * W10-10 — SOCELLE GLOBAL NPI Registry Operator Verification
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

const NPPES_API_BASE  = 'https://npiregistry.cms.hhs.gov/api';
const FETCH_TIMEOUT_MS = 10_000;

interface NppesResult {
  number: string;
  enumeration_type: 'NPI-1' | 'NPI-2';
  basic: {
    status: string;
    name?: string;
    first_name?: string;
    last_name?: string;
    organization_name?: string;
  };
}

interface NppesResponse {
  result_count: number;
  results: NppesResult[];
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  const edgeControlResponse = await enforceEdgeFunctionEnabled('ingest-npi', req);
  if (edgeControlResponse) return edgeControlResponse;
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let business_id: string;
  try {
    const body = await req.json();
    business_id = body?.business_id;
    if (!business_id || typeof business_id !== 'string') {
      return json({ error: 'business_id is required' }, 400);
    }
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );

  const { data: business, error: fetchErr } = await supabase
    .from('businesses')
    .select('id, npi_number')
    .eq('id', business_id)
    .single();

  if (fetchErr || !business) {
    return json({ error: 'Business not found', detail: fetchErr?.message }, 404);
  }

  const npiNumber = (business.npi_number ?? '').trim();
  if (!npiNumber) {
    return json({ error: 'npi_number is not set on this business' }, 422);
  }

  if (!/^\d{10}$/.test(npiNumber)) {
    return json({ error: 'npi_number must be exactly 10 digits', npi_number: npiNumber }, 422);
  }

  let nppesData: NppesResponse;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const url = `${NPPES_API_BASE}/?number=${encodeURIComponent(npiNumber)}&version=2.1`;
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`NPPES API returned HTTP ${res.status}`);
    }
    nppesData = await res.json() as NppesResponse;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return json({ error: 'NPPES API request failed', detail: message }, 502);
  }

  const verified = nppesData.result_count >= 1 && nppesData.results.length >= 1;
  const now = new Date().toISOString();

  // Update businesses row — DB trigger (20260313000001) fires on npi_verified=true
  // and inserts a market_signals row automatically.
  const { error: updateErr } = await supabase
    .from('businesses')
    .update({
      npi_verified: verified,
      npi_verified_at: now,
    })
    .eq('id', business_id);

  if (updateErr) {
    return json({ error: 'Failed to update verification status', detail: updateErr.message }, 500);
  }

  const result = verified
    ? {
        verified: true,
        npi_number: npiNumber,
        enumeration_type: nppesData.results[0].enumeration_type,
        npi_verified_at: now,
        signal_emitted: true,
      }
    : {
        verified: false,
        npi_number: npiNumber,
        reason: 'NPI number not found in NPPES registry',
        npi_verified_at: now,
        signal_emitted: false,
      };

  return json(result, 200);
});
