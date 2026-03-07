/**
 * refresh-live-data — Supabase Edge Function
 *
 * Fetches live data from sources defined in the `live_data_feeds` table
 * and updates their status (last_refreshed_at, last_status, last_error).
 *
 * Invocation:
 *   POST /functions/v1/refresh-live-data
 *   Query params (optional, mutually exclusive):
 *     ?feed_name=<name>  — refresh a single feed by name
 *     ?feed_key=<key>    — refresh a single feed by name (alias)
 *   Body: {} (empty JSON)
 *
 * When ?feed_key=<key> is provided:
 *   - Reads the matching row from live_data_feeds by name
 *   - Fetches source_url
 *   - Writes response JSON to data_payload column
 *   - Updates last_refreshed_at to NOW()
 *   - Returns { success: true, feed_key, refreshed_at }
 *
 * Admin-only: Requires a valid JWT with role = admin or super_admin.
 * Also accepts service_role_key for cron/internal calls (pg_cron via pg_net).
 *
 * SECURITY: NEVER exposes api keys in any response.
 *
 * Secrets required:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Table: public.live_data_feeds
 *   Columns used: id, name, source_type, source_url, is_active,
 *                 last_refreshed_at, last_status, last_error, data_snapshot,
 *                 data_payload
 *
 * WO-OVERHAUL-06 — Fix the feed pipeline
 * Owner: Backend Agent
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

// ── Constants ─────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FETCH_TIMEOUT_MS = 15_000;
const MAX_SNAPSHOT_BYTES = 50_000;

// ── Types ─────────────────────────────────────────────────────────────────────

interface FeedRow {
  id: string;
  name: string;
  source_type: string;
  source_url: string | null;
  is_active: boolean;
}

interface FeedResult {
  id: string;
  name: string;
  status: 'success' | 'error';
  http_code?: number;
  error?: string;
  latency_ms: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

/**
 * Verify the caller is an admin via JWT, or that the request uses the
 * service_role_key (for pg_cron / internal invocation).
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

  // If the token IS the service role key, allow (pg_cron / internal)
  if (token === serviceRoleKey) {
    return { authorized: true };
  }

  // Otherwise, decode the JWT and check the user's role in profiles
  const userClient = createClient(supabaseUrl, token, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user }, error: userErr } = await userClient.auth.getUser();
  if (userErr || !user) {
    return { authorized: false, reason: 'Invalid or expired token' };
  }

  // Check role in profiles table using service role client (bypasses RLS)
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

  // ── Parse optional filter ──────────────────────────────────────────────────
  const url = new URL(req.url);
  const feedKey = url.searchParams.get('feed_key');
  const feedName = url.searchParams.get('feed_name') ?? feedKey;

  // ── Supabase admin client ──────────────────────────────────────────────────
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // ── Single-feed mode via ?feed_key= ──────────────────────────────────────
  if (feedKey) {
    const { data: feed, error: feedErr } = await supabase
      .from('live_data_feeds')
      .select('id, name, source_type, source_url, is_active')
      .eq('name', feedKey)
      .single();

    if (feedErr || !feed) {
      return json({ error: 'Feed not found', feed_key: feedKey }, 404);
    }

    if (!feed.source_url) {
      return json({ error: 'No source_url configured', feed_key: feedKey }, 400);
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      const res = await fetch(feed.source_url, {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        const now = new Date().toISOString();
        await supabase.from('live_data_feeds').update({
          last_refreshed_at: now,
          last_status: 'error',
          last_error: `HTTP ${res.status}`,
          updated_at: now,
        }).eq('id', feed.id);
        return json({ success: false, feed_key: feedKey, error: `HTTP ${res.status}` }, 200);
      }

      const text = await res.text();
      const truncated = text.length > MAX_SNAPSHOT_BYTES ? text.slice(0, MAX_SNAPSHOT_BYTES) : text;
      let payload: unknown;
      try {
        payload = JSON.parse(truncated);
      } catch {
        payload = { raw: truncated };
      }

      const now = new Date().toISOString();
      await supabase.from('live_data_feeds').update({
        data_payload: payload,
        data_snapshot: payload,
        last_refreshed_at: now,
        last_status: 'success',
        last_error: null,
        updated_at: now,
      }).eq('id', feed.id);

      return json({ success: true, feed_key: feedKey, refreshed_at: now }, 200);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const now = new Date().toISOString();
      await supabase.from('live_data_feeds').update({
        last_refreshed_at: now,
        last_status: 'error',
        last_error: errMsg,
        updated_at: now,
      }).eq('id', feed.id);
      return json({ success: false, feed_key: feedKey, error: errMsg }, 200);
    }
  }

  // ── Batch mode: refresh all active feeds ─────────────────────────────────
  let query = supabase
    .from('live_data_feeds')
    .select('id, name, source_type, source_url, is_active')
    .eq('is_active', true);

  if (feedName) {
    query = query.eq('name', feedName);
  }

  const { data: feeds, error: feedErr } = await query;

  if (feedErr) {
    return json({ error: 'Failed to query live_data_feeds', detail: feedErr.message }, 500);
  }

  if (!feeds || feeds.length === 0) {
    return json({ refreshed: 0, failed: 0, feeds: [], message: 'No active feeds found' }, 200);
  }

  // ── Refresh each feed ──────────────────────────────────────────────────────
  const results: FeedResult[] = [];
  let refreshed = 0;
  let failed = 0;

  for (const feed of feeds as FeedRow[]) {
    const start = Date.now();
    let status: 'success' | 'error' = 'success';
    let httpCode: number | undefined;
    let errorMsg: string | undefined;
    let snapshot: unknown = null;

    if (!feed.source_url) {
      status = 'error';
      errorMsg = 'No source_url configured';
    } else {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

        const res = await fetch(feed.source_url, {
          headers: { 'Accept': 'application/json' },
          signal: controller.signal,
        });
        clearTimeout(timeout);

        httpCode = res.status;

        if (res.ok) {
          try {
            const text = await res.text();
            // Truncate to MAX_SNAPSHOT_BYTES to avoid bloating the jsonb column
            const truncated = text.length > MAX_SNAPSHOT_BYTES
              ? text.slice(0, MAX_SNAPSHOT_BYTES)
              : text;
            snapshot = JSON.parse(truncated);
          } catch {
            snapshot = { raw: 'Response was not valid JSON' };
          }
          status = 'success';
        } else {
          status = 'error';
          errorMsg = `HTTP ${res.status}`;
        }
      } catch (err: unknown) {
        status = 'error';
        errorMsg = err instanceof Error ? err.message : String(err);
      }
    }

    const latencyMs = Date.now() - start;
    const now = new Date().toISOString();

    // ── Update feed row ────────────────────────────────────────────────────
    const updatePayload: Record<string, unknown> = {
      last_refreshed_at: now,
      last_status: status,
      last_error: status === 'error' ? errorMsg : null,
      updated_at: now,
    };

    if (status === 'success' && snapshot !== null) {
      updatePayload.data_snapshot = snapshot;
      updatePayload.data_payload = snapshot;
    }

    await supabase
      .from('live_data_feeds')
      .update(updatePayload)
      .eq('id', feed.id);

    if (status === 'success') refreshed++;
    else failed++;

    results.push({
      id: feed.id,
      name: feed.name,
      status,
      http_code: httpCode,
      error: errorMsg,
      latency_ms: latencyMs,
    });
  }

  return json({ refreshed, failed, feeds: results }, 200);
});
