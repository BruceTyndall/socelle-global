-- Wave 10 / W10-05: Events table
-- Industry events & conferences for /events public page
-- Frontend (Events.tsx) already wired to supabase.from('events')
-- This migration creates the table and RLS to activate LIVE data.

create table if not exists public.events (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  -- Core fields
  name            text not null,
  date            text not null,           -- ISO date string: '2026-05-12'
  date_end        text,                    -- optional end date
  location        text not null,
  type            text not null
    check (type in ('conference', 'trade-show', 'workshop', 'virtual')),
  verticals       text[] not null default '{}',  -- 'spa' | 'medspa' | 'salon'
  description     text not null,
  url             text not null,
  attendees       text,                    -- display string e.g. '2,000+'
  featured        boolean not null default false,
  -- Admin control
  status          text not null default 'active'
    check (status in ('active', 'draft', 'cancelled'))
);

-- Date ordering index (Events.tsx orders by date ASC)
create index if not exists events_date_status_idx
  on public.events (date asc, status);

-- Featured events
create index if not exists events_featured_idx
  on public.events (featured, date asc)
  where featured = true;

-- Auto-update updated_at
create or replace function public.set_events_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists events_updated_at on public.events;
create trigger events_updated_at
  before update on public.events
  for each row execute function public.set_events_updated_at();

-- RLS
alter table public.events enable row level security;

-- Public read (anon + authenticated) — active events only
create policy "public_read_active_events"
  on public.events
  for select
  to anon, authenticated
  using (status = 'active');

-- Admins can manage all
create policy "admin_manage_events"
  on public.events
  for all
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles
      where user_profiles.id = auth.uid()
        and user_profiles.role in ('admin', 'platform_admin')
    )
  );

comment on table public.events is
  'Industry events for /events public page. W10-05 activates live data replacing stub.';
