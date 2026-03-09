-- INTEL-WO-10: signal_alerts — saved signal searches + alert preferences
-- Users save filter criteria as named searches; alerts fire when new
-- signals match the stored filter.
-- RLS: users can only access their own alerts.

create table if not exists public.signal_alerts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null check (char_length(name) between 1 and 120),
  filter_criteria jsonb not null default '{}',
  -- Optional notification preferences
  notify_email  boolean not null default false,
  notify_in_app boolean not null default true,
  -- Last time a notification was sent for this alert
  last_notified_at timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Indices
create index if not exists signal_alerts_user_id_idx on public.signal_alerts (user_id);

-- RLS
alter table public.signal_alerts enable row level security;

create policy "users_own_alerts_select"
  on public.signal_alerts for select
  using (auth.uid() = user_id);

create policy "users_own_alerts_insert"
  on public.signal_alerts for insert
  with check (auth.uid() = user_id);

create policy "users_own_alerts_update"
  on public.signal_alerts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users_own_alerts_delete"
  on public.signal_alerts for delete
  using (auth.uid() = user_id);

-- updated_at trigger
create or replace function public.set_signal_alerts_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger signal_alerts_updated_at
  before update on public.signal_alerts
  for each row execute function public.set_signal_alerts_updated_at();
