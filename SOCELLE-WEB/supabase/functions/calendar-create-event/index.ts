import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { enforceEdgeFunctionEnabled } from '../_shared/edgeControl.ts';
import { checkFlag } from '../_shared/featureFlags.ts';

type Provider = 'google' | 'microsoft';

interface CalendarConnectionRow {
  id: string;
  business_id: string;
  provider: Provider;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
  status: string;
}

interface CreateEventBody {
  provider: Provider;
  title: string;
  starts_at: string;
  duration_minutes?: number;
  notes?: string;
  attendee_email?: string;
  timezone?: string;
  location?: string;
}

interface AuthContext {
  userId: string;
  businessId: string;
  tier: string;
}

interface OAuthTokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_EVENTS_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1';
const MICROSOFT_TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
const MICROSOFT_EVENTS_URL = 'https://graph.microsoft.com/v1.0/me/events';

Deno.serve(async (req: Request) => {
  const edgeControlResponse = await enforceEdgeFunctionEnabled('calendar-create-event', req);
  if (edgeControlResponse) return edgeControlResponse;

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: 'Missing Supabase environment configuration' }, 500);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  try {
    const authContext = await resolveAuthContext(req, supabaseUrl, serviceRoleKey);
    if (!authContext) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const flagEnabled = await checkFlag({
      supabaseAdmin,
      userId: authContext.userId,
      userTier: authContext.tier,
      flagKey: 'CRM_CALENDAR_API_SYNC',
    });

    if (!flagEnabled) {
      return json({ error: 'Calendar sync is disabled for this account' }, 403);
    }

    const body = await req.json() as Partial<CreateEventBody>;
    const validated = validateBody(body);
    if (!validated.ok) {
      return json({ error: validated.error }, 400);
    }

    const payload = validated.value;

    const { data: connectionRow, error: connectionError } = await supabaseAdmin
      .from('calendar_connections')
      .select('id, business_id, provider, access_token, refresh_token, token_expires_at, status')
      .eq('business_id', authContext.businessId)
      .eq('provider', payload.provider)
      .maybeSingle();

    if (connectionError) {
      return json({ error: connectionError.message }, 500);
    }

    if (!connectionRow) {
      return json({ error: `No ${payload.provider} calendar connection found` }, 404);
    }

    if (connectionRow.status !== 'active') {
      return json({ error: `${payload.provider} connection is not active` }, 409);
    }

    const connection = connectionRow as CalendarConnectionRow;
    const accessToken = await getValidAccessToken(connection, supabaseAdmin);

    const eventResult = payload.provider === 'google'
      ? await createGoogleEvent(accessToken, payload)
      : await createMicrosoftEvent(accessToken, payload);

    if (!eventResult.ok) {
      await supabaseAdmin
        .from('calendar_connections')
        .update({ status: 'error', error_message: eventResult.error })
        .eq('id', connection.id);

      return json({ error: eventResult.error }, 502);
    }

    await supabaseAdmin
      .from('calendar_connections')
      .update({
        status: 'active',
        error_message: null,
        last_event_created_at: new Date().toISOString(),
      })
      .eq('id', connection.id);

    return json(
      {
        success: true,
        provider: payload.provider,
        event_id: eventResult.eventId,
        event_url: eventResult.eventUrl,
        join_url: eventResult.joinUrl,
        starts_at: payload.starts_at,
        duration_minutes: payload.duration_minutes ?? 30,
      },
      200,
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[calendar-create-event] unexpected error:', message);
    return json({ error: message || 'Unexpected error' }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: CORS_HEADERS,
  });
}

async function resolveAuthContext(
  req: Request,
  supabaseUrl: string,
  serviceRoleKey: string,
): Promise<AuthContext | null> {
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '');

  if (!token) {
    return null;
  }

  if (token === serviceRoleKey) {
    return null;
  }

  const userClient = createClient(supabaseUrl, token, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) {
    return null;
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: userProfile } = await adminClient
    .from('user_profiles')
    .select('business_id, tier')
    .eq('id', user.id)
    .maybeSingle();

  const profileFallback = !userProfile
    ? await adminClient
        .from('profiles')
        .select('business_id')
        .eq('id', user.id)
        .maybeSingle()
    : null;

  const businessId = userProfile?.business_id ?? profileFallback?.data?.business_id;
  if (!businessId) {
    return null;
  }

  return {
    userId: user.id,
    businessId,
    tier: normalizeTier(userProfile?.tier),
  };
}

function normalizeTier(input: string | null | undefined): string {
  const tier = String(input ?? '').toLowerCase();
  if (!tier) return 'starter';
  if (tier === 'business' || tier === 'growth') return 'pro';
  if (tier === 'enterprise') return 'enterprise';
  if (tier === 'pro') return 'pro';
  return 'starter';
}

function validateBody(body: Partial<CreateEventBody>):
  | { ok: true; value: CreateEventBody }
  | { ok: false; error: string } {
  if (!body.provider || !['google', 'microsoft'].includes(body.provider)) {
    return { ok: false, error: 'provider must be google or microsoft' };
  }

  if (!body.title || !body.title.trim()) {
    return { ok: false, error: 'title is required' };
  }

  if (!body.starts_at) {
    return { ok: false, error: 'starts_at is required' };
  }

  const startsAt = new Date(body.starts_at);
  if (Number.isNaN(startsAt.getTime())) {
    return { ok: false, error: 'starts_at must be a valid datetime' };
  }

  const duration = body.duration_minutes ?? 30;
  if (duration < 15 || duration > 240) {
    return { ok: false, error: 'duration_minutes must be between 15 and 240' };
  }

  return {
    ok: true,
    value: {
      provider: body.provider,
      title: body.title.trim(),
      starts_at: body.starts_at,
      duration_minutes: duration,
      notes: body.notes?.trim(),
      attendee_email: body.attendee_email?.trim(),
      timezone: body.timezone?.trim() || 'UTC',
      location: body.location?.trim() || '',
    },
  };
}

async function getValidAccessToken(
  connection: CalendarConnectionRow,
  supabaseAdmin: ReturnType<typeof createClient>,
): Promise<string> {
  const expiresAtMs = connection.token_expires_at ? new Date(connection.token_expires_at).getTime() : null;
  const isValidForMoreThanOneMinute = expiresAtMs ? expiresAtMs > Date.now() + 60_000 : true;

  if (isValidForMoreThanOneMinute) {
    return connection.access_token;
  }

  if (!connection.refresh_token) {
    throw new Error(`${connection.provider} token expired and no refresh token is available`);
  }

  const refreshed = connection.provider === 'google'
    ? await refreshGoogleToken(connection.refresh_token)
    : await refreshMicrosoftToken(connection.refresh_token);

  if (!refreshed.access_token) {
    throw new Error(
      refreshed.error_description
      || refreshed.error
      || `Failed to refresh ${connection.provider} token`,
    );
  }

  const tokenExpiresAt = refreshed.expires_in
    ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
    : connection.token_expires_at;

  await supabaseAdmin
    .from('calendar_connections')
    .update({
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token ?? connection.refresh_token,
      token_expires_at: tokenExpiresAt,
      oauth_scope: refreshed.scope ?? null,
      status: 'active',
      error_message: null,
    })
    .eq('id', connection.id);

  return refreshed.access_token;
}

async function refreshGoogleToken(refreshToken: string): Promise<OAuthTokenResponse> {
  const clientId = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID') ?? '';
  const clientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET') ?? '';

  if (!clientId || !clientSecret) {
    return { error: 'google_client_not_configured' };
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = await response.json() as OAuthTokenResponse;
  if (!response.ok) {
    return {
      ...data,
      error: data.error ?? `google_refresh_http_${response.status}`,
    };
  }

  return data;
}

async function refreshMicrosoftToken(refreshToken: string): Promise<OAuthTokenResponse> {
  const clientId = Deno.env.get('MICROSOFT_OAUTH_CLIENT_ID') ?? '';
  const clientSecret = Deno.env.get('MICROSOFT_OAUTH_CLIENT_SECRET') ?? '';

  if (!clientId || !clientSecret) {
    return { error: 'microsoft_client_not_configured' };
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
    scope: 'offline_access User.Read Calendars.ReadWrite',
  });

  const response = await fetch(MICROSOFT_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = await response.json() as OAuthTokenResponse;
  if (!response.ok) {
    return {
      ...data,
      error: data.error ?? `microsoft_refresh_http_${response.status}`,
    };
  }

  return data;
}

async function createGoogleEvent(accessToken: string, payload: CreateEventBody): Promise<
  | { ok: true; eventId: string | null; eventUrl: string | null; joinUrl: string | null }
  | { ok: false; error: string }
> {
  const start = new Date(payload.starts_at);
  const end = new Date(start.getTime() + (payload.duration_minutes ?? 30) * 60_000);

  const body = {
    summary: payload.title,
    description: payload.notes ?? '',
    start: {
      dateTime: start.toISOString(),
      timeZone: payload.timezone || 'UTC',
    },
    end: {
      dateTime: end.toISOString(),
      timeZone: payload.timezone || 'UTC',
    },
    attendees: payload.attendee_email ? [{ email: payload.attendee_email }] : undefined,
    conferenceData: {
      createRequest: {
        requestId: crypto.randomUUID(),
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  };

  const response = await fetch(GOOGLE_EVENTS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json() as Record<string, unknown>;
  if (!response.ok) {
    const message = typeof data.error === 'object'
      ? JSON.stringify(data.error)
      : `Google event create failed (${response.status})`;
    return { ok: false, error: message };
  }

  return {
    ok: true,
    eventId: typeof data.id === 'string' ? data.id : null,
    eventUrl: typeof data.htmlLink === 'string' ? data.htmlLink : null,
    joinUrl: typeof data.hangoutLink === 'string' ? data.hangoutLink : null,
  };
}

async function createMicrosoftEvent(accessToken: string, payload: CreateEventBody): Promise<
  | { ok: true; eventId: string | null; eventUrl: string | null; joinUrl: string | null }
  | { ok: false; error: string }
> {
  const start = new Date(payload.starts_at);
  const end = new Date(start.getTime() + (payload.duration_minutes ?? 30) * 60_000);

  const body = {
    subject: payload.title,
    body: {
      contentType: 'HTML',
      content: payload.notes ?? '',
    },
    start: {
      dateTime: toGraphDateTime(start),
      timeZone: payload.timezone || 'UTC',
    },
    end: {
      dateTime: toGraphDateTime(end),
      timeZone: payload.timezone || 'UTC',
    },
    attendees: payload.attendee_email
      ? [{ emailAddress: { address: payload.attendee_email }, type: 'required' }]
      : [],
    isOnlineMeeting: true,
    onlineMeetingProvider: 'teamsForBusiness',
    location: {
      displayName: payload.location || 'Microsoft Teams',
    },
  };

  const response = await fetch(MICROSOFT_EVENTS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json() as Record<string, unknown>;
  if (!response.ok) {
    const message = typeof data.error === 'object'
      ? JSON.stringify(data.error)
      : `Microsoft event create failed (${response.status})`;
    return { ok: false, error: message };
  }

  const onlineMeeting = (data.onlineMeeting ?? null) as { joinUrl?: string } | null;

  return {
    ok: true,
    eventId: typeof data.id === 'string' ? data.id : null,
    eventUrl: typeof data.webLink === 'string' ? data.webLink : null,
    joinUrl: typeof onlineMeeting?.joinUrl === 'string' ? onlineMeeting.joinUrl : null,
  };
}

function toGraphDateTime(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, '');
}
