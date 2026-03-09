/**
 * ingest-npi — Supabase Edge Function
 *
 * Verifies an operator's NPI number against the CMS NPPES NPI Registry
 * (free public API — no API key required). On success, stamps
 * businesses.npi_verified = true and businesses.npi_verified_at = now().
 *
 * Invocation:
 *   POST /functions/v1/ingest-npi
 *   Body: { "business_id": "<uuid>" }
 *
 * Prerequisites:
 *   businesses.npi_number must be set before calling this function.
 *   Apply migration 20260306300001 first.
 *
 * External API:
 *   https://npiregistry.cms.hhs.gov/api/?number=<NPI>&version=2.1
 *   No key required. Rate limit: ~120 req/min per CMS guidance.
 *
 * Secrets required:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Data provenance (SOCELLE_DATA_PROVENANCE_POLICY.md §2):
 *   Source: CMS NPPES — Tier 1 (government registry)
 *   Confidence: 1.0 for verified match, 0.0 for not-found
 *   Attribution: npi_verified = true + npi_verified_at timestamp on businesses row
 *
 * W10-10 — SOCELLE GLOBAL NPI Registry Operator Verification
 * Owner: Backend Agent
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { enforceEdgeFunctionEnabled } from '../_shared/edgeControl.ts';

// ── Constants ─────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NPPES_API_BASE = 'https://npiregistry.cms.hhs.gov/api';
const FETCH_TIMEOUT_MS = 10_000;

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  const edgeControlResponse = await enforceEdgeFunctionEnabled('ingest-npi', req);
  if (edgeControlResponse) return edgeControlResponse;
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
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

  // ── Supabase client (service role — bypasses RLS for internal update) ──────
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // ── Fetch business row ─────────────────────────────────────────────────────
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

  // NPI numbers are exactly 10 digits
  if (!/^\d{10}$/.test(npiNumber)) {
    return json({ error: 'npi_number must be exactly 10 digits', npi_number: npiNumber }, 422);
  }

  // ── Query NPPES ────────────────────────────────────────────────────────────
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

  // ── Verify result ──────────────────────────────────────────────────────────
  const verified = nppesData.result_count >= 1 && nppesData.results.length >= 1;
  const now = new Date().toISOString();

  // ── Update businesses row ──────────────────────────────────────────────────
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

  // ── Response ───────────────────────────────────────────────────────────────
  const result = verified
    ? {
        verified: true,
        npi_number: npiNumber,
        enumeration_type: nppesData.results[0].enumeration_type,
        npi_verified_at: now,
      }
    : {
        verified: false,
        npi_number: npiNumber,
        reason: 'NPI number not found in NPPES registry',
        npi_verified_at: now,
      };

  return json(result, 200);
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}
