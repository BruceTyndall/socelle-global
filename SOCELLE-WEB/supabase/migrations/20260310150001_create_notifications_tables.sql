-- Build 3: Notification Engine foundation (transactional in-app + preference ledger)
-- Adds notification_preferences + notifications with RLS for owner-only access.

create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null,
  intelligence_alerts boolean not null default true,
  reorder_reminders boolean not null default true,
  campaign_notifications boolean not null default true,
  education_updates boolean not null default true,
  enrichment_updates boolean not null default false,
  system_notifications boolean not null default true,
  email_frequency text not null default 'daily'
    check (email_frequency in ('real_time', 'daily', 'weekly', 'monthly')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null,
  type text not null
    check (type in ('intelligence_alert', 'reorder_reminder', 'campaign_launch', 'education_new', 'enrichment_update', 'system')),
  channel text not null default 'in_app'
    check (channel in ('in_app', 'email')),
  title text not null,
  body text not null,
  action_url text,
  metadata jsonb not null default '{}'::jsonb,
  read boolean not null default false,
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_notification_preferences_business_id
  on public.notification_preferences (business_id);

create index if not exists idx_notifications_user_id_created_at
  on public.notifications (user_id, created_at desc);

create index if not exists idx_notifications_business_id
  on public.notifications (business_id);

create index if not exists idx_notifications_unread
  on public.notifications (user_id, read, created_at desc);

create or replace function public.set_notifications_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_notification_preferences_updated_at on public.notification_preferences;
create trigger trg_notification_preferences_updated_at
before update on public.notification_preferences
for each row execute procedure public.set_notifications_updated_at();

drop trigger if exists trg_notifications_updated_at on public.notifications;
create trigger trg_notifications_updated_at
before update on public.notifications
for each row execute procedure public.set_notifications_updated_at();

alter table public.notification_preferences enable row level security;
alter table public.notifications enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notification_preferences'
      and policyname = 'notification_preferences_select_own'
  ) then
    create policy notification_preferences_select_own
      on public.notification_preferences
      for select
      using (user_id = auth.uid());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notification_preferences'
      and policyname = 'notification_preferences_insert_own'
  ) then
    create policy notification_preferences_insert_own
      on public.notification_preferences
      for insert
      with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notification_preferences'
      and policyname = 'notification_preferences_update_own'
  ) then
    create policy notification_preferences_update_own
      on public.notification_preferences
      for update
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notification_preferences'
      and policyname = 'notification_preferences_service_role_manage'
  ) then
    create policy notification_preferences_service_role_manage
      on public.notification_preferences
      for all
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'notifications_select_own'
  ) then
    create policy notifications_select_own
      on public.notifications
      for select
      using (user_id = auth.uid());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'notifications_insert_own'
  ) then
    create policy notifications_insert_own
      on public.notifications
      for insert
      with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'notifications_update_own'
  ) then
    create policy notifications_update_own
      on public.notifications
      for update
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'notifications_delete_own'
  ) then
    create policy notifications_delete_own
      on public.notifications
      for delete
      using (user_id = auth.uid());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'notifications_service_role_manage'
  ) then
    create policy notifications_service_role_manage
      on public.notifications
      for all
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;
end;
$$;
