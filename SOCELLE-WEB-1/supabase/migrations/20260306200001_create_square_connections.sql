-- ⛔ DO NOT APPLY — BLOCKED PENDING OWNER APPROVAL + SECURITY REMEDIATION
--
-- Governance violation: W11-13 was registered without explicit GO command (Session 29).
-- Security block: access_token + refresh_token are stored as plaintext TEXT.
--   This is not acceptable for launch. Tokens must use Supabase Vault (Option A)
--   or pgcrypto pgp_sym_encrypt (Option B) before this migration may be applied.
--
-- Required before applying:
--   1. Owner issues explicit GO:W11-13
--   2. Token storage remediation is implemented (see W11-13 Security Block in build_tracker.md)
--   3. This migration is replaced or superseded by a revised version with secure token columns
--
-- ────────────────────────────────────────────────────────────────────────────────

-- W11-13: Square Bookings operator sync — square_connections + supporting tables
--
-- Purpose: Operators who use Square Appointments can connect their Square account
-- to SOCELLE. This enables real appointment data in their portal and contributes
-- service pricing signals (consented) to the Intelligence platform.
--
-- API authority: Square Developer Terms of Service (squareup.com/us/en/legal/general/developers-annotated)
-- Verdict: SAFE — commercial use explicitly permitted (SOCELLE Booking API Audit, Session 29).
-- OAuth scopes required: MERCHANT_PROFILE_READ, APPOINTMENTS_READ, BOOKINGS_READ
--
-- Security note on token storage:
--   access_token and refresh_token are stored as text for MVP.
--   Before launch, migrate these columns to Supabase Vault (supabase_vault extension)
--   per SOCELLE_RELEASE_GATES.md pre-deploy checklist.
--
-- ADD ONLY — never modify this file after applying to production.

-- ── square_oauth_states: short-lived CSRF tokens ─────────────────────────────
-- Created by the frontend when initiating OAuth. Verified by square-oauth-callback.
-- Rows expire after 10 minutes and are deleted on use.

create table if not exists public.square_oauth_states (
  state             text        primary key,
  business_id       uuid        not null references public.businesses(id) on delete cascade,
  return_path       text        not null default '/portal/settings/integrations',
  expires_at        timestamptz not null default (now() + interval '10 minutes'),
  created_at        timestamptz not null default now()
);

create index if not exists square_oauth_states_expires_idx
  on public.square_oauth_states (expires_at);

-- ── square_connections: one OAuth connection per business ─────────────────────

create table if not exists public.square_connections (
  id                   uuid        primary key default gen_random_uuid(),
  business_id          uuid        not null references public.businesses(id) on delete cascade,
  square_merchant_id   text        not null,
  square_location_id   text,         -- primary location for appointment sync
  -- Token storage (MVP: plaintext. TODO: migrate to Supabase Vault pre-launch)
  access_token         text        not null,
  refresh_token        text,
  token_expires_at     timestamptz,
  oauth_scope          text,         -- space-separated scopes granted by operator
  status               text        not null default 'active'
    check (status in ('active', 'disconnected', 'error', 'pending')),
  connected_at         timestamptz not null default now(),
  last_synced_at       timestamptz,
  error_message        text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (business_id)              -- one Square connection per business
);

create index if not exists square_connections_status_idx
  on public.square_connections (status)
  where status = 'active';

-- ── square_appointments_cache: synced appointment data ───────────────────────
-- Populated by square-appointments-sync Edge Function.
-- Stores appointment records from the operator's Square account.
-- NO PII beyond Square-system IDs. Customer names/emails are NOT stored.

create table if not exists public.square_appointments_cache (
  id                    uuid        primary key default gen_random_uuid(),
  square_connection_id  uuid        not null references public.square_connections(id) on delete cascade,
  business_id           uuid        not null references public.businesses(id) on delete cascade,
  square_booking_id     text        not null,
  service_name          text,
  service_variation_id  text,
  team_member_id        text,         -- Square team member ID (no name stored)
  location_id           text,
  start_at              timestamptz,
  duration_minutes      integer,
  -- Pricing: stored in smallest currency unit (cents / pence)
  price_amount          integer,
  currency              text        not null default 'USD',
  booking_status        text,         -- ACCEPTED | PENDING_SELLER_CONFIRMATION | CANCELLED_BY_SELLER | NO_SHOW | etc.
  -- Provenance (SOCELLE_DATA_PROVENANCE_POLICY.md §2 — Tier 1 operator-consented data)
  source                text        not null default 'square_appointments',
  synced_at             timestamptz not null default now(),
  created_at            timestamptz not null default now(),
  unique (square_connection_id, square_booking_id)
);

create index if not exists square_appts_business_start_idx
  on public.square_appointments_cache (business_id, start_at desc);

create index if not exists square_appts_service_price_idx
  on public.square_appointments_cache (service_name, price_amount)
  where price_amount is not null;

-- Auto-update updated_at on square_connections
create or replace function public.set_square_connections_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists square_connections_updated_at on public.square_connections;
create trigger square_connections_updated_at
  before update on public.square_connections
  for each row execute function public.set_square_connections_updated_at();

-- ── RLS: square_oauth_states ─────────────────────────────────────────────────
-- Only the service role writes/reads states (callback handler runs as service_role).
-- Authenticated users can create their own state rows.

alter table public.square_oauth_states enable row level security;

create policy "authenticated_insert_own_oauth_state"
  on public.square_oauth_states
  for insert
  to authenticated
  with check (
    business_id in (
      select business_id from public.user_profiles
      where id = auth.uid()
    )
  );

create policy "service_role_manage_oauth_states"
  on public.square_oauth_states
  for all
  to service_role
  using (true)
  with check (true);

-- ── RLS: square_connections ───────────────────────────────────────────────────
-- Operators can read their own connection. Only service_role writes (via Edge Fn).

alter table public.square_connections enable row level security;

create policy "owner_read_square_connection"
  on public.square_connections
  for select
  to authenticated
  using (
    business_id in (
      select business_id from public.user_profiles
      where id = auth.uid()
    )
  );

create policy "service_role_manage_square_connections"
  on public.square_connections
  for all
  to service_role
  using (true)
  with check (true);

-- ── RLS: square_appointments_cache ───────────────────────────────────────────
-- Operators can read their own appointments. Platform admins can read all.
-- Only service_role writes.

alter table public.square_appointments_cache enable row level security;

create policy "owner_read_own_appointments"
  on public.square_appointments_cache
  for select
  to authenticated
  using (
    business_id in (
      select business_id from public.user_profiles
      where id = auth.uid()
    )
  );

create policy "admin_read_all_appointments"
  on public.square_appointments_cache
  for select
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles
      where user_profiles.id = auth.uid()
        and user_profiles.role in ('admin', 'platform_admin')
    )
  );

create policy "service_role_write_appointments"
  on public.square_appointments_cache
  for all
  to service_role
  using (true)
  with check (true);

-- ── Comments ──────────────────────────────────────────────────────────────────

comment on table public.square_connections is
  'Square OAuth connections per business operator. SAFE per SOCELLE Booking API Audit (Session 29). W11-13.';

comment on table public.square_appointments_cache is
  'Cached appointment records from connected operator Square accounts. Operator-consented Tier 1 data. No PII beyond Square system IDs. W11-13.';

comment on column public.square_connections.access_token is
  'Square OAuth access token. MVP: stored as text. TODO: migrate to Supabase Vault (supabase_vault) before launch per SOCELLE_RELEASE_GATES.md.';

comment on column public.square_appointments_cache.price_amount is
  'Price in smallest currency unit (cents/pence). Used for market_stats service_price_floor signals per operator consent.';
