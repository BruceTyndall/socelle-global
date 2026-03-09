/**
 * ⛔ DO NOT DEPLOY — W11-13 BLOCKED (governance + security)
 * WO requires explicit owner GO:W11-13 before deployment.
 * Tokens must use Supabase Vault before this function is production-ready.
 * See W11-13 Security Block in SOCELLE-WEB/docs/build_tracker.md.
 *
 * square-oauth-callback — Supabase Edge Function
 *
 * Handles the OAuth 2.0 callback from Square after an operator authorizes
 * their Square Appointments account to connect with SOCELLE.
 *
 * Flow:
 *   1. Frontend creates a `square_oauth_states` row and redirects operator to Square OAuth URL.
 *   2. Operator authorizes on Square → Square redirects to this function with ?code=&state=
 *   3. This function:
 *      a. Validates state against `square_oauth_states` (CSRF protection)
 *      b. Exchanges code for access_token + refresh_token at Square /oauth2/token
 *      c. Fetches merchant info from Square /v2/merchants/me
 *      d. Upserts into `square_connections`
 *      e. Deletes the used state row
 *      f. Redirects operator back to portal integrations page
 *
 * Square OAuth docs: https://developer.squareup.com/docs/oauth-api/overview
 * API version: 2026-01-22
 *
 * Deployment:
 *   supabase functions deploy square-oauth-callback
 *
 * Secrets required:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   SQUARE_APPLICATION_ID          — from Square Developer Dashboard
 *   SQUARE_APPLICATION_SECRET      — from Square Developer Dashboard
 *   SQUARE_ENVIRONMENT             — 'sandbox' | 'production' (default: 'sandbox')
 *
 * Redirect URL to register in Square Developer Dashboard:
 *   <SUPABASE_URL>/functions/v1/square-oauth-callback
 *
 * OAuth scopes to request:
 *   MERCHANT_PROFILE_READ APPOINTMENTS_READ BOOKINGS_READ
 *
 * W11-13 — SOCELLE GLOBAL Square Bookings Operator Sync
 * Permission verdict: SAFE — Square Developer ToS (2025-06-30) explicitly permits commercial use.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { enforceEdgeFunctionEnabled } from '../_shared/edgeControl.ts';

// ── Constants ─────────────────────────────────────────────────────────────────

const SQUARE_TOKEN_URL  = 'https://connect.squareup.com/oauth2/token';
const SQUARE_API_BASE   = 'https://connect.squareup.com/v2';
const SQUARE_API_VERSION = '2026-01-22';

const DEFAULT_RETURN_PATH = '/portal/settings/integrations';
const ERROR_RETURN_PATH   = '/portal/settings/integrations?error=square_auth_failed';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SquareTokenResponse {
  access_token: string;
  token_type: string;
  expires_at: string;
  merchant_id: string;
  refresh_token?: string;
  short_lived?: boolean;
  error?: string;
  message?: string;
}

interface SquareMerchant {
  id: string;
  main_location_id?: string;
  business_name?: string;
  country?: string;
  currency?: string;
}

// ── Main Handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  const edgeControlResponse = await enforceEdgeFunctionEnabled('square-oauth-callback', req);
  if (edgeControlResponse) return edgeControlResponse;
  const url        = new URL(req.url);
  const code       = url.searchParams.get('code');
  const state      = url.searchParams.get('state');
  const errorParam = url.searchParams.get('error');

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;

  const supabase = createClient(
    supabaseUrl,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );

  // ── Operator denied access on Square ──────────────────────────────────────
  if (errorParam) {
    console.warn('[square-oauth-callback] Operator denied authorization:', errorParam);
    return redirectTo(supabaseUrl, `${ERROR_RETURN_PATH}&reason=denied`);
  }

  // ── Basic parameter validation ─────────────────────────────────────────────
  if (!code || !state) {
    console.error('[square-oauth-callback] Missing code or state parameter');
    return redirectTo(supabaseUrl, ERROR_RETURN_PATH);
  }

  try {
    // ── 1. Validate state (CSRF protection) ───────────────────────────────────
    const { data: stateRow, error: stateError } = await supabase
      .from('square_oauth_states')
      .select('state, business_id, return_path, expires_at')
      .eq('state', state)
      .single();

    if (stateError || !stateRow) {
      console.error('[square-oauth-callback] Invalid or expired state:', stateError?.message);
      return redirectTo(supabaseUrl, `${ERROR_RETURN_PATH}&reason=invalid_state`);
    }

    if (new Date(stateRow.expires_at) < new Date()) {
      console.error('[square-oauth-callback] State expired for business_id:', stateRow.business_id);
      await supabase.from('square_oauth_states').delete().eq('state', state);
      return redirectTo(supabaseUrl, `${ERROR_RETURN_PATH}&reason=state_expired`);
    }

    const businessId  = stateRow.business_id as string;
    const returnPath  = (stateRow.return_path as string) || DEFAULT_RETURN_PATH;

    // ── 2. Exchange code for tokens ────────────────────────────────────────────
    const tokenRes = await fetch(SQUARE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type':    'application/json',
        'Square-Version':  SQUARE_API_VERSION,
      },
      body: JSON.stringify({
        client_id:     Deno.env.get('SQUARE_APPLICATION_ID'),
        client_secret: Deno.env.get('SQUARE_APPLICATION_SECRET'),
        code,
        grant_type:    'authorization_code',
      }),
    });

    const tokenData: SquareTokenResponse = await tokenRes.json();

    if (!tokenRes.ok || tokenData.error || !tokenData.access_token) {
      const msg = tokenData.message ?? tokenData.error ?? `HTTP ${tokenRes.status}`;
      console.error('[square-oauth-callback] Token exchange failed:', msg);
      return redirectTo(supabaseUrl, `${ERROR_RETURN_PATH}&reason=token_exchange_failed`);
    }

    // ── 3. Fetch merchant profile (for merchant_id + main_location_id) ────────
    let mainLocationId: string | null = null;
    try {
      const merchantRes = await fetch(`${SQUARE_API_BASE}/merchants/me`, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Square-Version': SQUARE_API_VERSION,
        },
      });
      if (merchantRes.ok) {
        const merchantData = await merchantRes.json();
        const merchant: SquareMerchant = merchantData.merchant;
        mainLocationId = merchant?.main_location_id ?? null;
      }
    } catch (merchantErr) {
      console.warn('[square-oauth-callback] Could not fetch merchant profile:', merchantErr);
      // Non-fatal — we can proceed without location_id
    }

    // ── 4. Upsert into square_connections ─────────────────────────────────────
    const { error: upsertError } = await supabase
      .from('square_connections')
      .upsert(
        {
          business_id:         businessId,
          square_merchant_id:  tokenData.merchant_id,
          square_location_id:  mainLocationId,
          access_token:        tokenData.access_token,
          refresh_token:       tokenData.refresh_token ?? null,
          token_expires_at:    tokenData.expires_at ?? null,
          oauth_scope:         'MERCHANT_PROFILE_READ APPOINTMENTS_READ BOOKINGS_READ',
          status:              'active',
          connected_at:        new Date().toISOString(),
          error_message:       null,
        },
        { onConflict: 'business_id' },
      );

    if (upsertError) {
      console.error('[square-oauth-callback] Connection upsert failed:', upsertError.message);
      return redirectTo(supabaseUrl, `${ERROR_RETURN_PATH}&reason=db_error`);
    }

    // ── 5. Delete used state (consumed — no replay) ────────────────────────────
    await supabase.from('square_oauth_states').delete().eq('state', state);

    // ── 6. Redirect to portal with success flag ────────────────────────────────
    return redirectTo(supabaseUrl, `${returnPath}?connected=square`);

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[square-oauth-callback] Unexpected error:', message);
    return redirectTo(supabaseUrl, `${ERROR_RETURN_PATH}&reason=unexpected`);
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Redirects the operator's browser back to the SOCELLE portal.
 * The path is appended to the SUPABASE_URL origin; adjust to
 * your SOCELLE_WEB_URL env var if frontend is on a separate domain.
 */
function redirectTo(supabaseUrl: string, path: string): Response {
  // SOCELLE_WEB_URL should be set as a secret if frontend is on a different domain
  const webUrl = Deno.env.get('SOCELLE_WEB_URL') ?? supabaseUrl;
  const target = `${webUrl.replace(/\/$/, '')}${path}`;
  return new Response(null, {
    status: 302,
    headers: { Location: target },
  });
}
