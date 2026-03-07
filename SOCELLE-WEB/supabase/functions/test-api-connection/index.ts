/**
 * test-api-connection — Supabase Edge Function
 *
 * Pings an API by registry_id, records latency and HTTP status,
 * and updates last_tested_at + last_test_status in api_registry.
 *
 * Invocation:
 *   POST /functions/v1/test-api-connection
 *   Query param: ?api_registry_id=<uuid>  (alternative to body)
 *   Body: { "registry_id": "<uuid>" }
 *
 * Admin-only: Requires a valid JWT with role = admin or super_admin.
 *
 * SECURITY: NEVER reads or exposes api_key_encrypted from api_registry.
 *           The api_key_encrypted column is NEVER selected, logged, or returned.
 *
 * Secrets required:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Table: public.api_registry
 *   Columns read:  id, name, base_url, is_active
 *   Columns written: last_tested_at, last_test_status, last_test_latency_ms, updated_at
 *
 * WO-OVERHAUL-06 — Phase 6: Live Data Edge Functions + Cron
 * Owner: Backend Agent
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

// ── Constants ─────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PING_TIMEOUT_MS = 5_000;

// ── Helpers ───────────────────────────────────────────────────────────────────

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

/**
 * Verify the caller is an admin via JWT.
 */
async function verifyAdmin(
  req: Request,
  supabaseUrl: string,
  serviceRoleKey: string,
): Promise<{ authorized: boolean; reason?: string }> {
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '');

  if (!token) {
    return { authorized: false, reason: 'Missing Authorization header' };
  }

  // Service role key = internal call — allow
  if (token === serviceRoleKey) {
    return { authorized: true };
  }

  // Decode JWT and check user role
  const userClient = createClient(supabaseUrl, token, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user }, error: userErr } = await userClient.auth.getUser();
  if (userErr || !user) {
    return { authorized: false, reason: 'Invalid or expired token' };
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: profile, error: profileErr } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileErr || !profile) {
    return { authorized: false, reason: 'Profile not found' };
  }

  if (!['admin', 'super_admin'].includes(profile.role)) {
    return { authorized: false, reason: 'Insufficient role — admin required' };
  }

  return { authorized: true };
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // ── Auth check ─────────────────────────────────────────────────────────────
  const auth = await verifyAdmin(req, supabaseUrl, serviceRoleKey);
  if (!auth.authorized) {
    return json({ error: 'Unauthorized', detail: auth.reason }, 401);
  }

  // ── Parse registry ID from query param or body ────────────────────────────
  const reqUrl = new URL(req.url);
  let registryId: string | undefined = reqUrl.searchParams.get('api_registry_id') ?? undefined;

  if (!registryId) {
    try {
      const body = await req.json();
      registryId = body?.registry_id;
    } catch {
      // No body or invalid JSON — fall through to validation
    }
  }

  if (!registryId || typeof registryId !== 'string') {
    return json({ error: 'api_registry_id query param or registry_id in body is required (uuid string)' }, 400);
  }

  // ── Supabase admin client ──────────────────────────────────────────────────
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // ── Look up api_registry row ───────────────────────────────────────────────
  // SECURITY: Only select safe columns — NEVER select api_key_encrypted
  const { data: api, error: lookupErr } = await supabase
    .from('api_registry')
    .select('id, name, base_url, is_active')
    .eq('id', registryId)
    .single();

  if (lookupErr || !api) {
    return json({ error: 'API registry entry not found', detail: lookupErr?.message }, 404);
  }

  if (!api.base_url) {
    // No base_url — record as fail
    const now = new Date().toISOString();
    await supabase
      .from('api_registry')
      .update({
        last_tested_at: now,
        last_test_status: 'fail',
        last_test_latency_ms: 0,
        updated_at: now,
      })
      .eq('id', api.id);

    return json({
      success: false,
      api_name: api.name,
      status: 'FAIL',
      tested_at: now,
      latency_ms: 0,
      http_code: null,
      error: 'No base_url configured',
    }, 200);
  }

  // ── Ping the API ───────────────────────────────────────────────────────────
  let httpCode: number | null = null;
  let testStatus: 'pass' | 'fail' | 'timeout' = 'pass';
  let errorMsg: string | undefined;
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

    const res = await fetch(api.base_url, {
      method: 'HEAD',
      signal: controller.signal,
    }).catch(async () => {
      // Some APIs reject HEAD — fall back to GET
      return fetch(api.base_url, {
        method: 'GET',
        signal: controller.signal,
      });
    });

    clearTimeout(timeout);
    httpCode = res.status;

    // Consider 2xx and 3xx as pass; 4xx/5xx as fail
    if (res.ok || (res.status >= 300 && res.status < 400)) {
      testStatus = 'pass';
    } else {
      testStatus = 'fail';
      errorMsg = `HTTP ${res.status}`;
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('abort') || message.includes('timeout')) {
      testStatus = 'timeout';
      errorMsg = `Request timed out after ${PING_TIMEOUT_MS}ms`;
    } else {
      testStatus = 'fail';
      errorMsg = message;
    }
  }

  const latencyMs = Date.now() - start;
  const now = new Date().toISOString();

  // ── Update api_registry ────────────────────────────────────────────────────
  const { error: updateErr } = await supabase
    .from('api_registry')
    .update({
      last_tested_at: now,
      last_test_status: testStatus,
      last_test_latency_ms: latencyMs,
      updated_at: now,
    })
    .eq('id', api.id);

  if (updateErr) {
    return json({
      error: 'Failed to update api_registry',
      detail: updateErr.message,
    }, 500);
  }

  const statusLabel = testStatus === 'pass' ? 'OK' : 'FAIL';
  return json({
    success: testStatus === 'pass',
    api_name: api.name,
    status: statusLabel,
    tested_at: now,
    latency_ms: latencyMs,
    http_code: httpCode,
    ...(errorMsg ? { error: errorMsg } : {}),
  }, 200);
});
