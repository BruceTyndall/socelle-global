-- CRM calendar OAuth integration (Google + Microsoft)
-- Purpose: allow authenticated business users to connect provider calendars and
-- create real calendar/Teams invites from CRM tasks.

create table if not exists public.calendar_oauth_states (
  state       text primary key,
  business_id uuid not null references public.businesses(id) on delete cascade,
  provider    text not null check (provider in ('google', 'microsoft')),
  created_by  uuid not null,
  return_path text not null default '/portal/crm/tasks',
  expires_at  timestamptz not null default (now() + interval '10 minutes'),
  created_at  timestamptz not null default now()
);

create index if not exists calendar_oauth_states_expires_idx
  on public.calendar_oauth_states (expires_at);

create table if not exists public.calendar_connections (
  id                   uuid primary key default gen_random_uuid(),
  business_id          uuid not null references public.businesses(id) on delete cascade,
  provider             text not null check (provider in ('google', 'microsoft')),
  provider_account_id  text,
  provider_email       text,
  access_token         text not null,
  refresh_token        text,
  token_expires_at     timestamptz,
  oauth_scope          text,
  status               text not null default 'active'
    check (status in ('active', 'disconnected', 'error', 'pending')),
  connected_at         timestamptz not null default now(),
  last_event_created_at timestamptz,
  error_message        text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (business_id, provider)
);

create index if not exists calendar_connections_status_idx
  on public.calendar_connections (status)
  where status = 'active';

create index if not exists calendar_connections_business_provider_idx
  on public.calendar_connections (business_id, provider);

-- updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_calendar_connections_updated_at'
  ) THEN
    CREATE TRIGGER set_calendar_connections_updated_at
      BEFORE UPDATE ON public.calendar_connections
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;

alter table public.calendar_oauth_states enable row level security;
alter table public.calendar_connections enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'calendar_oauth_states'
      AND policyname = 'calendar_oauth_states_insert_own'
  ) THEN
    CREATE POLICY calendar_oauth_states_insert_own
      ON public.calendar_oauth_states
      FOR INSERT
      TO authenticated
      WITH CHECK (
        created_by = auth.uid()
        AND (
          business_id in (
            select business_id from public.user_profiles where id = auth.uid()
          )
          OR business_id in (
            select business_id from public.profiles where id = auth.uid()
          )
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'calendar_oauth_states'
      AND policyname = 'calendar_oauth_states_select_own'
  ) THEN
    CREATE POLICY calendar_oauth_states_select_own
      ON public.calendar_oauth_states
      FOR SELECT
      TO authenticated
      USING (
        created_by = auth.uid()
        OR business_id in (
          select business_id from public.user_profiles where id = auth.uid()
        )
        OR business_id in (
          select business_id from public.profiles where id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'calendar_oauth_states'
      AND policyname = 'calendar_oauth_states_delete_own'
  ) THEN
    CREATE POLICY calendar_oauth_states_delete_own
      ON public.calendar_oauth_states
      FOR DELETE
      TO authenticated
      USING (
        created_by = auth.uid()
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'calendar_oauth_states'
      AND policyname = 'calendar_oauth_states_service_role_manage'
  ) THEN
    CREATE POLICY calendar_oauth_states_service_role_manage
      ON public.calendar_oauth_states
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'calendar_connections'
      AND policyname = 'calendar_connections_select_own'
  ) THEN
    CREATE POLICY calendar_connections_select_own
      ON public.calendar_connections
      FOR SELECT
      TO authenticated
      USING (
        business_id in (
          select business_id from public.user_profiles where id = auth.uid()
        )
        OR business_id in (
          select business_id from public.profiles where id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'calendar_connections'
      AND policyname = 'calendar_connections_service_role_manage'
  ) THEN
    CREATE POLICY calendar_connections_service_role_manage
      ON public.calendar_connections
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END;
$$;

-- Feature flag for staged rollout (unknown flags fail-open in check_flag, so seed explicit row)
insert into public.feature_flags (
  flag_key,
  key,
  display_name,
  name,
  description,
  default_enabled,
  is_enabled,
  enabled,
  enabled_tiers,
  enabled_user_ids,
  rollout_percentage,
  rollout_pct,
  created_at,
  updated_at
)
values (
  'CRM_CALENDAR_API_SYNC',
  'CRM_CALENDAR_API_SYNC',
  'CRM Calendar API Sync',
  'CRM Calendar API Sync',
  'Enable Google and Microsoft OAuth calendar sync for CRM tasks',
  true,
  true,
  true,
  '{}'::text[],
  '{}'::uuid[],
  100,
  100,
  now(),
  now()
)
on conflict (flag_key)
do update set
  key = excluded.key,
  display_name = excluded.display_name,
  name = excluded.name,
  description = excluded.description,
  updated_at = now();

-- Register edge functions in the control plane kill-switch table.
insert into public.edge_function_controls (function_name, display_name, description)
values
  ('calendar-oauth-callback', 'Calendar OAuth Callback', 'OAuth callback for Google/Microsoft calendar connections'),
  ('calendar-create-event', 'Calendar Create Event', 'Creates provider-backed calendar events for CRM tasks')
on conflict (function_name)
do update set
  display_name = excluded.display_name,
  description = excluded.description,
  updated_at = now();

comment on table public.calendar_oauth_states is
  'Short-lived OAuth CSRF state records for calendar integrations (Google/Microsoft).';

comment on table public.calendar_connections is
  'Business calendar OAuth connections used for server-side event creation from CRM tasks.';
