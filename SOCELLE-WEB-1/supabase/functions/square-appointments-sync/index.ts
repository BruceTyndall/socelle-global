/**
 * ⛔ DO NOT DEPLOY — W11-13 BLOCKED (governance + security)
 * WO requires explicit owner GO:W11-13 before deployment.
 * Tokens must use Supabase Vault before this function is production-ready.
 * See W11-13 Security Block in SOCELLE-WEB/docs/build_tracker.md.
 *
 * square-appointments-sync — Supabase Edge Function
 *
 * Syncs appointment data from connected operator Square accounts into
 * `square_appointments_cache`, then aggregates service pricing signals
 * into `market_stats` (metric: service_price_floor).
 *
 * Each invocation processes up to `batch_size` active Square connections
 * ordered by last_synced_at ASC (oldest-first rotation, same pattern as ingest-rss).
 *
 * Data provenance:
 *   - Source: operator-consented Square Bookings API (TIER 1 — operator-authorized)
 *   - No PII stored: customer names/emails are NOT fetched or stored.
 *     Only Square system IDs, service names, team member IDs, and pricing.
 *   - Attribution: source = 'square_appointments', business_id always set.
 *   - LIVE vs DEMO: LIVE after operator connects Square. DEMO until then.
 *
 * Invocation:
 *   POST /functions/v1/square-appointments-sync
 *   Body (optional):
 *     { "batch_size": 5 }                   — connections per run (default 5)
 *     { "connection_ids": ["uuid", ...] }   — target specific connections
 *     { "lookback_days": 30 }               — days of history to sync (default 30)
 *
 * Deployment:
 *   supabase functions deploy square-appointments-sync
 *
 * Scheduling:
 *   pg_cron or Supabase Scheduled Functions — recommend every 4 hours
 *   select cron.schedule('square-appointments-sync', '0 */4 * * *', ...);
 *
 * Secrets required:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   SQUARE_APPLICATION_ID
 *   SQUARE_APPLICATION_SECRET
 *
 * W11-13 — SOCELLE GLOBAL Square Bookings Operator Sync
 * Permission verdict: SAFE — Square Developer ToS (squareup.com/us/en/legal/general/developers-annotated, 2025-06-30).
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

// ── Constants ─────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SQUARE_API_BASE    = 'https://connect.squareup.com/v2';
const SQUARE_API_VERSION = '2026-01-22';
const SQUARE_TOKEN_URL   = 'https://connect.squareup.com/oauth2/token';

const DEFAULT_BATCH_SIZE  = 5;
const DEFAULT_LOOKBACK_DAYS = 30;
const MAX_BOOKINGS_PER_PAGE = 100;

// ── Types ─────────────────────────────────────────────────────────────────────

interface SquareConnection {
  id: string;
  business_id: string;
  square_merchant_id: string;
  square_location_id: string | null;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
}

interface SquareBooking {
  id: string;
  status: string;
  start_at: string;
  location_id: string;
  appointment_segments?: Array<{
    duration_minutes: number;
    service_variation_id?: string;
    team_member_id?: string;
    service_variation_version?: string;
  }>;
  // customer_id intentionally NOT destructured — we do not store customer identity
}

interface SquareBookingsResponse {
  bookings: SquareBooking[];
  cursor?: string;
  errors?: Array<{ code: string; detail: string; category: string }>;
}

interface SquareCatalogObject {
  id: string;
  type: string;
  item_variation_data?: {
    name?: string;
    price_money?: { amount: number; currency: string };
  };
}

interface SyncResult {
  connection_id: string;
  business_id: string;
  bookings_fetched: number;
  bookings_upserted: number;
  token_refreshed: boolean;
  error?: string;
}

// ── Token Refresh ─────────────────────────────────────────────────────────────

async function refreshSquareToken(
  refreshToken: string,
): Promise<{ access_token: string; refresh_token?: string; expires_at?: string } | null> {
  const res = await fetch(SQUARE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Square-Version': SQUARE_API_VERSION },
    body: JSON.stringify({
      client_id:     Deno.env.get('SQUARE_APPLICATION_ID'),
      client_secret: Deno.env.get('SQUARE_APPLICATION_SECRET'),
      refresh_token: refreshToken,
      grant_type:    'refresh_token',
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.access_token) return null;
  return { access_token: data.access_token, refresh_token: data.refresh_token, expires_at: data.expires_at };
}

// ── Square API Helpers ────────────────────────────────────────────────────────

async function squareGet(
  path: string,
  token: string,
  params?: Record<string, string>,
): Promise<Response> {
  const url = new URL(`${SQUARE_API_BASE}${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Square-Version': SQUARE_API_VERSION,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Fetch all bookings for a location within a date range, paginating as needed.
 * Does NOT request or store customer identity fields.
 */
async function fetchBookings(
  token: string,
  locationId: string,
  startAt: string,
  endAt: string,
): Promise<SquareBooking[]> {
  const bookings: SquareBooking[] = [];
  let cursor: string | undefined;

  do {
    const params: Record<string, string> = {
      location_id: locationId,
      start_at_min: startAt,
      start_at_max: endAt,
      limit: String(MAX_BOOKINGS_PER_PAGE),
    };
    if (cursor) params.cursor = cursor;

    const res = await squareGet('/bookings', token, params);
    if (!res.ok) break;

    const data: SquareBookingsResponse = await res.json();
    if (data.errors?.length) break;

    bookings.push(...(data.bookings ?? []));
    cursor = data.cursor;
  } while (cursor);

  return bookings;
}

/**
 * Fetch service catalog to resolve service_variation_id → name + price.
 * Returns a map of variation_id → { name, price_amount, currency }.
 */
async function fetchServiceCatalog(
  token: string,
): Promise<Map<string, { name: string; price_amount: number | null; currency: string }>> {
  const catalog = new Map<string, { name: string; price_amount: number | null; currency: string }>();

  let cursor: string | undefined;
  do {
    const params: Record<string, string> = { types: 'ITEM_VARIATION' };
    if (cursor) params.cursor = cursor;

    const res = await squareGet('/catalog/list', token, params);
    if (!res.ok) break;

    const data = await res.json();
    for (const obj of (data.objects ?? []) as SquareCatalogObject[]) {
      if (obj.type === 'ITEM_VARIATION' && obj.item_variation_data) {
        catalog.set(obj.id, {
          name:         obj.item_variation_data.name ?? '',
          price_amount: obj.item_variation_data.price_money?.amount ?? null,
          currency:     obj.item_variation_data.price_money?.currency ?? 'USD',
        });
      }
    }
    cursor = data.cursor;
  } while (cursor);

  return catalog;
}

// ── Main Handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );

  try {
    const body: { batch_size?: number; connection_ids?: string[]; lookback_days?: number } =
      req.method === 'POST' && req.headers.get('content-type')?.includes('application/json')
        ? await req.json().catch(() => ({}))
        : {};

    const batchSize    = body.batch_size ?? DEFAULT_BATCH_SIZE;
    const specificIds  = body.connection_ids;
    const lookbackDays = body.lookback_days ?? DEFAULT_LOOKBACK_DAYS;

    // ── Fetch connections to process ──────────────────────────────────────────
    let query = supabase
      .from('square_connections')
      .select('id, business_id, square_merchant_id, square_location_id, access_token, refresh_token, token_expires_at')
      .eq('status', 'active')
      .order('last_synced_at', { ascending: true, nullsFirst: true })
      .limit(batchSize);

    if (specificIds?.length) {
      query = query.in('id', specificIds);
    }

    const { data: connections, error: connErr } = await query;
    if (connErr) throw new Error(`square_connections fetch failed: ${connErr.message}`);
    if (!connections?.length) {
      return new Response(
        JSON.stringify({ ok: true, message: 'No active Square connections to sync' }),
        { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      );
    }

    const now    = new Date();
    const endAt  = now.toISOString();
    const startAt = new Date(now.getTime() - lookbackDays * 86_400_000).toISOString();

    const results: SyncResult[] = [];

    for (const conn of connections as SquareConnection[]) {
      const result: SyncResult = {
        connection_id: conn.id,
        business_id: conn.business_id,
        bookings_fetched: 0,
        bookings_upserted: 0,
        token_refreshed: false,
      };

      try {
        let token = conn.access_token;

        // ── Refresh token if expired or expiring within 1 hour ───────────────
        const expiresAt = conn.token_expires_at ? new Date(conn.token_expires_at) : null;
        if (expiresAt && expiresAt.getTime() - now.getTime() < 3_600_000 && conn.refresh_token) {
          const refreshed = await refreshSquareToken(conn.refresh_token);
          if (refreshed) {
            token = refreshed.access_token;
            result.token_refreshed = true;
            await supabase
              .from('square_connections')
              .update({
                access_token:     refreshed.access_token,
                refresh_token:    refreshed.refresh_token ?? conn.refresh_token,
                token_expires_at: refreshed.expires_at ?? null,
              })
              .eq('id', conn.id);
          }
        }

        // ── Determine location ────────────────────────────────────────────────
        const locationId = conn.square_location_id;
        if (!locationId) {
          result.error = 'No location_id — run square-oauth-callback again to re-fetch';
          await updateConnectionStatus(supabase, conn.id, 'error', result.error);
          results.push(result);
          continue;
        }

        // ── Fetch service catalog for price resolution ────────────────────────
        const catalog = await fetchServiceCatalog(token);

        // ── Fetch bookings ────────────────────────────────────────────────────
        const bookings = await fetchBookings(token, locationId, startAt, endAt);
        result.bookings_fetched = bookings.length;

        if (bookings.length > 0) {
          // Build upsert rows — NO customer PII
          const rows = bookings.flatMap(booking => {
            const segments = booking.appointment_segments ?? [{}];
            return segments.map(seg => {
              const variationId = seg.service_variation_id ?? null;
              const catalogEntry = variationId ? catalog.get(variationId) : null;
              return {
                square_connection_id: conn.id,
                business_id:          conn.business_id,
                square_booking_id:    booking.id,
                service_name:         catalogEntry?.name ?? null,
                service_variation_id: variationId,
                team_member_id:       seg.team_member_id ?? null,
                location_id:          booking.location_id,
                start_at:             booking.start_at,
                duration_minutes:     seg.duration_minutes ?? null,
                price_amount:         catalogEntry?.price_amount ?? null,
                currency:             catalogEntry?.currency ?? 'USD',
                booking_status:       booking.status,
                synced_at:            now.toISOString(),
              };
            });
          });

          const { error: upsertErr } = await supabase
            .from('square_appointments_cache')
            .upsert(rows, { onConflict: 'square_connection_id,square_booking_id', ignoreDuplicates: false });

          if (upsertErr) throw new Error(`Upsert failed: ${upsertErr.message}`);
          result.bookings_upserted = rows.length;

          // ── Aggregate pricing signals into market_stats ────────────────────
          // Only for bookings with a price — contributes service_price_floor signal.
          const pricedRows = rows.filter(r => r.price_amount && r.service_name);
          if (pricedRows.length > 0) {
            // Group by service_name, compute min/avg price
            const serviceMap = new Map<string, number[]>();
            for (const r of pricedRows) {
              if (!r.service_name || !r.price_amount) continue;
              const key = r.service_name.toLowerCase().trim();
              if (!serviceMap.has(key)) serviceMap.set(key, []);
              serviceMap.get(key)!.push(r.price_amount);
            }

            const statRows = Array.from(serviceMap.entries()).map(([service, prices]) => ({
              metric:     'service_price_floor',
              value:      Math.min(...prices) / 100,  // convert cents → dollars
              value_unit: 'USD',
              metadata: {
                service_name: service,
                sample_count: prices.length,
                avg_price:    prices.reduce((a, b) => a + b, 0) / prices.length / 100,
                source:       'square_appointments',
                business_id:  conn.business_id,
                synced_at:    now.toISOString(),
              },
              source:     'square_appointments',
              updated_at: now.toISOString(),
            }));

            // Best-effort — don't fail the sync if market_stats update fails
            await supabase
              .from('market_signals')
              .upsert(statRows, { onConflict: 'metric,source', ignoreDuplicates: false })
              .then(() => null, (err) => console.warn('[square-sync] market_signals update failed:', err));
          }
        }

        // ── Update connection sync timestamp ──────────────────────────────────
        await supabase
          .from('square_connections')
          .update({ last_synced_at: now.toISOString(), status: 'active', error_message: null })
          .eq('id', conn.id);

      } catch (err) {
        result.error = err instanceof Error ? err.message : String(err);
        await updateConnectionStatus(supabase, conn.id, 'error', result.error);
      }

      results.push(result);
    }

    const totalFetched  = results.reduce((s, r) => s + r.bookings_fetched, 0);
    const totalUpserted = results.reduce((s, r) => s + r.bookings_upserted, 0);
    const errorCount    = results.filter(r => r.error).length;

    return new Response(
      JSON.stringify({
        ok: true,
        connections_processed: connections.length,
        total_bookings_fetched: totalFetched,
        total_bookings_upserted: totalUpserted,
        errors: errorCount,
        results,
      }),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[square-appointments-sync] Fatal error:', message);
    return new Response(
      JSON.stringify({ ok: false, error: message }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────

async function updateConnectionStatus(
  supabase: ReturnType<typeof createClient>,
  connectionId: string,
  status: string,
  errorMessage?: string,
): Promise<void> {
  await supabase
    .from('square_connections')
    .update({ status, error_message: errorMessage ?? null })
    .eq('id', connectionId)
    .then(() => null, () => null);
}
