-- Socelle Supabase Schema
-- Run in Supabase SQL Editor to create tables with RLS

-- Enable RLS on all tables
-- Each table uses auth.uid() for row-level security

-- User settings (mirrors SharedPreferences + Firebase)
create table if not exists user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  avg_booking_value numeric default 85,
  slot_duration_minutes integer default 60,
  calendar_source text default '',
  provider_type text default '',
  growth_goal text default '',
  working_hours jsonb default '{}',
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

alter table user_settings enable row level security;
create policy "Users can read own settings" on user_settings
  for select using (auth.uid() = user_id);
create policy "Users can insert own settings" on user_settings
  for insert with check (auth.uid() = user_id);
create policy "Users can update own settings" on user_settings
  for update using (auth.uid() = user_id);

-- Sync state metadata
create table if not exists sync_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  last_sync_at timestamptz,
  gap_count integer default 0,
  weekly_leakage numeric default 0,
  total_bookable_slots integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

alter table sync_state enable row level security;
create policy "Users can read own sync state" on sync_state
  for select using (auth.uid() = user_id);
create policy "Users can upsert own sync state" on sync_state
  for all using (auth.uid() = user_id);

-- Recovered revenue tracking
create table if not exists recovered_revenue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  total_recovered numeric default 0,
  gap_count integer default 0,
  first_recovery_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

alter table recovered_revenue enable row level security;
create policy "Users can read own revenue" on recovered_revenue
  for select using (auth.uid() = user_id);
create policy "Users can upsert own revenue" on recovered_revenue
  for all using (auth.uid() = user_id);

-- Subscription state (mirrors RevenueCat, used for server-side checks)
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  tier text default 'free',
  trial_start_date timestamptz,
  expiration_date timestamptz,
  revenuecat_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

alter table subscriptions enable row level security;
create policy "Users can read own subscription" on subscriptions
  for select using (auth.uid() = user_id);
create policy "Users can upsert own subscription" on subscriptions
  for all using (auth.uid() = user_id);
