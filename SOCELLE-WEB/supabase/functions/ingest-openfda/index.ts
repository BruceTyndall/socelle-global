/**
 * ingest-openfda — Supabase Edge Function
 *
 * Pulls FDA cosmetics enforcement actions (recalls, market withdrawals) and
 * aesthetic device adverse events from the OpenFDA public API (no key required)
 * and writes them as market_signals rows.
 *
 * Two signal types:
 *   1. FDA cosmetics recalls → signal_type='regulatory_alert', topic='safety'
 *   2. Aesthetic device adverse events → signal_type='regulatory_alert', topic='safety'
 *
 * All signals: vertical='medspa', tier_min='free' (government/public data),
 * source_type='api', data_source='openfda'.
 *
 * Dedup: ON CONFLICT (source_type, external_id) DO NOTHING
 *
 * Invocation:
 *   POST /functions/v1/ingest-openfda
 *   Body: {} (no params needed — always fetches latest 100 records)
 *
 * External API:
 *   https://api.fda.gov  — No API key required. Rate limit: 240 req/min.
 *   Data license: Public domain (US government works, 17 U.S.C. §105).
 *
 * Secrets required:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * FREE-DATA-01 — SOCELLE GLOBAL OpenFDA Intelligence Integration
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

const FDA_BASE       = 'https://api.fda.gov';
const FETCH_TIMEOUT  = 20_000;
const USER_AGENT     = 'Socelle-Intelligence-Bot/1.0 (https://socelle.com)';

// ── FDA API Types ──────────────────────────────────────────────────────────────

interface FdaEnforcementResult {
  recall_number: string;
  reason_for_recall: string;
  status: string;
  product_description: string;
  product_quantity?: string;
  recalling_firm?: string;
  classification: 'Class I' | 'Class II' | 'Class III';
  recall_initiation_date?: string;
  report_date?: string;
  state?: string;
  country?: string;
  voluntary_mandated?: string;
}

interface FdaDeviceEventResult {
  report_number: string;
  date_received?: string;
  device?: Array<{
    generic_name?: string;
    brand_name?: string;
    manufacturer_d_name?: string;
  }>;
  mdr_text?: Array<{ text?: string; text_type_code?: string }>;
  event_type?: string;
  patient?: Array<{ sequence_number_outcome?: string[] }>;
}

interface FdaApiResponse<T> {
  meta?: { total?: number };
  results: T[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert FDA recall classification to impact_score */
function recallClassToImpact(classification: string): number {
  switch (classification) {
    case 'Class I':   return 90;
    case 'Class II':  return 60;
    case 'Class III': return 30;
    default:           return 40;
  }
}

/** Convert FDA recall classification to magnitude (numeric 0-1 scale) */
function recallClassToMagnitude(classification: string): number {
  switch (classification) {
    case 'Class I':   return 0.9;
    case 'Class II':  return 0.6;
    case 'Class III': return 0.3;
    default:           return 0.4;
  }
}

/** Safe date parser — returns ISO string or falls back to now() */
function safeIso(raw: string | null | undefined): string {
  if (!raw) return new Date().toISOString();
  const d = new Date(raw);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

/** Simple fetch wrapper with timeout */
async function fdaFetch<T>(url: string): Promise<FdaApiResponse<T> | null> {
  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    });
    if (res.status === 404) return { results: [] }; // no results for query
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json() as FdaApiResponse<T>;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[ingest-openfda] fetch error for ${url}:`, msg);
    return null;
  }
}

// ── Main Handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  try {
  const edgeControlResponse = await enforceEdgeFunctionEnabled('ingest-openfda', req);
  if (edgeControlResponse) return edgeControlResponse;
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );

  const stats = {
    cosmetic_recalls_fetched: 0,
    device_events_fetched: 0,
    signals_inserted: 0,
    signals_skipped: 0,
    errors: [] as string[],
  };

  // ── 1. FDA Cosmetics Recalls ────────────────────────────────────────────────
  // Enforcement actions for cosmetics products: recalls, market withdrawals.
  const cosmeticsUrl = `${FDA_BASE}/drug/enforcement.json?search=product_type:%22Cosmetics%22&sort=report_date:desc&limit=100`;
  const cosmeticsData = await fdaFetch<FdaEnforcementResult>(cosmeticsUrl);

  if (cosmeticsData?.results?.length) {
    stats.cosmetic_recalls_fetched = cosmeticsData.results.length;
    const rows = cosmeticsData.results.map((r) => {
      const reportedAt = r.report_date
        ? `${r.report_date.slice(0,4)}-${r.report_date.slice(4,6)}-${r.report_date.slice(6,8)}`
        : null;
      const title = `FDA Recall: ${(r.product_description ?? 'Cosmetic product').slice(0, 120)}`;
      const description = [
        r.reason_for_recall ?? 'Reason not specified',
        r.recalling_firm ? `Firm: ${r.recalling_firm}` : null,
        r.classification ? `Classification: ${r.classification}` : null,
        r.voluntary_mandated ? `Type: ${r.voluntary_mandated}` : null,
      ].filter(Boolean).join(' | ');

      return {
        signal_type:       'regulatory_alert',
        signal_key:        `openfda_recall_${r.recall_number}`,
        external_id:       r.recall_number,
        source_type:       'api',
        source_name:       'FDA OpenFDA',
        title,
        description,
        vertical:          'medspa',
        topic:             'safety',
        tier_min:          'free',
        tier_visibility:   'free',
        impact_score:      recallClassToImpact(r.classification),
        magnitude:         recallClassToMagnitude(r.classification),
        direction:         'down',
        region:            r.country ?? 'US',
        confidence_score:  0.95,
        confidence:        0.95,
        confidence_tier:   'high',
        active:            true,
        status:            'active',
        created_at:        safeIso(reportedAt),
        updated_at:        new Date().toISOString(),
      };
    });

    for (let i = 0; i < rows.length; i += 50) {
      const chunk = rows.slice(i, i + 50);
      const { data: inserted, error } = await supabase
        .from('market_signals')
        .upsert(chunk, { onConflict: 'source_type,external_id', ignoreDuplicates: true })
        .select('id');

      if (error) {
        stats.errors.push(`cosmetics upsert chunk ${i}: ${error.message}`);
      } else {
        stats.signals_inserted += inserted?.length ?? 0;
        stats.signals_skipped += chunk.length - (inserted?.length ?? 0);
      }
    }
  }

  // ── 2. Aesthetic Device Adverse Events ──────────────────────────────────────
  // MDR reports for laser, IPL, RF, and ultrasound aesthetic devices.
  const deviceUrl = `${FDA_BASE}/device/event.json?search=device.generic_name:(laser+OR+"intense+pulsed+light"+OR+radiofrequency+OR+microneedling)&sort=date_received:desc&limit=50`;
  const deviceData = await fdaFetch<FdaDeviceEventResult>(deviceUrl);

  if (deviceData?.results?.length) {
    stats.device_events_fetched = deviceData.results.length;
    const rows = deviceData.results
      .filter(r => r.report_number)
      .map((r) => {
        const device = r.device?.[0];
        const deviceName = device?.generic_name ?? device?.brand_name ?? 'Aesthetic device';
        const narrative = r.mdr_text?.find(t => t.text_type_code === 'Description of Event or Problem')?.text;
        const outcomes = r.patient?.[0]?.sequence_number_outcome ?? [];
        const serious = outcomes.some(o => ['Death', 'Hospitalization', 'Disability'].includes(o));

        const title = `FDA MDR: ${deviceName.slice(0, 80)} adverse event`;
        const description = [
          narrative ? narrative.slice(0, 300) : 'Adverse event reported to FDA MedWatch',
          device?.manufacturer_d_name ? `Manufacturer: ${device.manufacturer_d_name}` : null,
          outcomes.length ? `Outcomes: ${outcomes.slice(0, 3).join(', ')}` : null,
        ].filter(Boolean).join(' | ');

        return {
          signal_type:       'regulatory_alert',
          signal_key:        `openfda_mdr_${r.report_number}`,
          external_id:       r.report_number,
          source_type:       'api',
          source_name:       'FDA OpenFDA MDR',
          title,
          description,
          vertical:          'medspa',
          topic:             'safety',
          tier_min:          'free',
          tier_visibility:   'free',
          impact_score:      serious ? 75 : 45,
          magnitude:         serious ? 0.75 : 0.45,
          direction:         'down',
          region:            'US',
          confidence_score:  0.90,
          confidence:        0.90,
          confidence_tier:   'high',
          active:            true,
          status:            'active',
          created_at:        safeIso(r.date_received),
          updated_at:        new Date().toISOString(),
        };
      });

    if (rows.length) {
      for (let i = 0; i < rows.length; i += 50) {
        const chunk = rows.slice(i, i + 50);
        const { data: inserted, error } = await supabase
          .from('market_signals')
          .upsert(chunk, { onConflict: 'source_type,external_id', ignoreDuplicates: true })
          .select('id');

        if (error) {
          stats.errors.push(`device events upsert chunk ${i}: ${error.message}`);
        } else {
          stats.signals_inserted += inserted?.length ?? 0;
          stats.signals_skipped += chunk.length - (inserted?.length ?? 0);
        }
      }
    }
  }

  // ── 3. Register function in edge_function_controls if missing ───────────────
  await supabase
    .from('edge_function_controls')
    .upsert({ function_name: 'ingest-openfda', is_enabled: true }, { onConflict: 'function_name', ignoreDuplicates: true });

  return new Response(
    JSON.stringify({ ok: true, ...stats }),
    { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
  );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[ingest-openfda] unhandled error:', msg);
    return new Response(
      JSON.stringify({ ok: false, error: msg }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }
});
