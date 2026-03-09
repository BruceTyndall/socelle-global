import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { enforceEdgeFunctionEnabled } from '../_shared/edgeControl.ts';

type Provider = 'google' | 'microsoft';

interface CalendarStateRow {
  state: string;
  business_id: string;
  provider: Provider;
  return_path: string;
  expires_at: string;
}

interface OAuthTokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
}

const DEFAULT_RETURN_PATH = '/portal/crm/tasks';
const ERROR_RETURN_PATH = '/portal/crm/tasks?calendar_auth=failed';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';
const MICROSOFT_TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
const MICROSOFT_ME_URL = 'https://graph.microsoft.com/v1.0/me';

Deno.serve(async (req: Request) => {
  const edgeControlResponse = await enforceEdgeFunctionEnabled('calendar-oauth-callback', req);
  if (edgeControlResponse) return edgeControlResponse;

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const oauthError = url.searchParams.get('error');

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  if (!supabaseUrl || !serviceRoleKey) {
    return redirectTo(supabaseUrl, `${ERROR_RETURN_PATH}&reason=missing_env`);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  if (oauthError) {
    return redirectTo(supabaseUrl, `${ERROR_RETURN_PATH}&reason=provider_denied`);
  }

  if (!code || !state) {
    return redirectTo(supabaseUrl, `${ERROR_RETURN_PATH}&reason=missing_params`);
  }

  try {
    const { data: stateRow, error: stateError } = await supabase
      .from('calendar_oauth_states')
      .select('state, business_id, provider, return_path, expires_at')
      .eq('state', state)
      .maybeSingle();

    if (stateError || !stateRow) {
      return redirectTo(supabaseUrl, `${ERROR_RETURN_PATH}&reason=invalid_state`);
    }

    const typedState = stateRow as CalendarStateRow;
    if (new Date(typedState.expires_at).getTime() < Date.now()) {
      await supabase.from('calendar_oauth_states').delete().eq('state', state);
      return redirectTo(supabaseUrl, `${ERROR_RETURN_PATH}&reason=state_expired`);
    }

    const redirectUri = Deno.env.get('CALENDAR_OAUTH_REDIRECT_URI')
      ?? `${supabaseUrl.replace(/\/$/, '')}/functions/v1/calendar-oauth-callback`;

    const tokenResponse = typedState.provider === 'google'
      ? await exchangeGoogleCode(code, redirectUri)
      : await exchangeMicrosoftCode(code, redirectUri);

    if (!tokenResponse.access_token) {
      const reason = tokenResponse.error_description || tokenResponse.error || 'token_exchange_failed';
      return redirectTo(supabaseUrl, `${ERROR_RETURN_PATH}&reason=${encodeURIComponent(reason)}`);
    }

    const profile = typedState.provider === 'google'
      ? await fetchGoogleProfile(tokenResponse.access_token)
      : await fetchMicrosoftProfile(tokenResponse.access_token);

    const tokenExpiresAt = tokenResponse.expires_in
      ? new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString()
      : null;

    const { error: upsertError } = await supabase
      .from('calendar_connections')
      .upsert(
        {
          business_id: typedState.business_id,
          provider: typedState.provider,
          provider_account_id: profile.id,
          provider_email: profile.email,
          access_token: tokenResponse.access_token,
          refresh_token: tokenResponse.refresh_token ?? null,
          token_expires_at: tokenExpiresAt,
          oauth_scope: tokenResponse.scope ?? null,
          status: 'active',
          connected_at: new Date().toISOString(),
          error_message: null,
        },
        { onConflict: 'business_id,provider' },
      );

    if (upsertError) {
      return redirectTo(supabaseUrl, `${ERROR_RETURN_PATH}&reason=db_upsert_failed`);
    }

    await supabase.from('calendar_oauth_states').delete().eq('state', state);

    const returnPath = typedState.return_path || DEFAULT_RETURN_PATH;
    const separator = returnPath.includes('?') ? '&' : '?';
    return redirectTo(supabaseUrl, `${returnPath}${separator}calendar_connected=${typedState.provider}`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[calendar-oauth-callback] unexpected:', message);
    return redirectTo(supabaseUrl, `${ERROR_RETURN_PATH}&reason=unexpected`);
  }
});

async function exchangeGoogleCode(code: string, redirectUri: string): Promise<OAuthTokenResponse> {
  const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID') ?? '';
  const clientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET') ?? '';

  if (!clientId || !clientSecret) {
    return { error: 'google_client_not_configured' };
  }

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = (await response.json()) as OAuthTokenResponse;
  if (!response.ok) {
    return {
      ...data,
      error: data.error ?? `google_http_${response.status}`,
    };
  }

  return data;
}

async function exchangeMicrosoftCode(code: string, redirectUri: string): Promise<OAuthTokenResponse> {
  const clientId = Deno.env.get('MICROSOFT_OAUTH_CLIENT_ID') ?? '';
  const clientSecret = Deno.env.get('MICROSOFT_OAUTH_CLIENT_SECRET') ?? '';

  if (!clientId || !clientSecret) {
    return { error: 'microsoft_client_not_configured' };
  }

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });

  const response = await fetch(MICROSOFT_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = (await response.json()) as OAuthTokenResponse;
  if (!response.ok) {
    return {
      ...data,
      error: data.error ?? `microsoft_http_${response.status}`,
    };
  }

  return data;
}

async function fetchGoogleProfile(accessToken: string): Promise<{ id: string | null; email: string | null }> {
  try {
    const response = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      return { id: null, email: null };
    }

    const data = await response.json() as { id?: string; email?: string };
    return { id: data.id ?? null, email: data.email ?? null };
  } catch {
    return { id: null, email: null };
  }
}

async function fetchMicrosoftProfile(accessToken: string): Promise<{ id: string | null; email: string | null }> {
  try {
    const response = await fetch(MICROSOFT_ME_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      return { id: null, email: null };
    }

    const data = await response.json() as { id?: string; mail?: string; userPrincipalName?: string };
    return {
      id: data.id ?? null,
      email: data.mail ?? data.userPrincipalName ?? null,
    };
  } catch {
    return { id: null, email: null };
  }
}

function redirectTo(supabaseUrl: string, path: string): Response {
  const webUrl = Deno.env.get('SOCELLE_WEB_URL') ?? supabaseUrl;
  const normalizedBase = webUrl.replace(/\/$/, '');
  const isAbsolute = /^https?:\/\//i.test(path);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const target = isAbsolute ? path : `${normalizedBase}${normalizedPath}`;

  return new Response(null, {
    status: 302,
    headers: { Location: target },
  });
}
