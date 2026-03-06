-- Wave 9 / W9-01: Create access_requests table
-- Captures leads from RequestAccess.tsx public form
-- Intentionally minimal — no auth required to insert
-- RLS: public insert (anon), authenticated read (admin only)

create table if not exists public.access_requests (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  email           text not null,
  business_name   text,
  contact_name    text,
  business_type   text,
  referral_source text,
  status          text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'duplicate')),
  notes           text,
  reviewed_at     timestamptz,
  reviewed_by     uuid references auth.users(id)
);

-- Unique constraint on email (duplicate submissions treated as success on frontend)
create unique index if not exists access_requests_email_idx
  on public.access_requests (lower(email));

-- Index on status for admin queue
create index if not exists access_requests_status_idx
  on public.access_requests (status, created_at desc);

-- RLS
alter table public.access_requests enable row level security;

-- Anyone (including anonymous) can INSERT a new request
create policy "public_insert_access_requests"
  on public.access_requests
  for insert
  to anon, authenticated
  with check (true);

-- Only admins can SELECT / UPDATE access requests
create policy "admin_read_access_requests"
  on public.access_requests
  for select
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles
      where user_profiles.id = auth.uid()
        and user_profiles.role in ('admin', 'platform_admin')
    )
  );

create policy "admin_update_access_requests"
  on public.access_requests
  for update
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles
      where user_profiles.id = auth.uid()
        and user_profiles.role in ('admin', 'platform_admin')
    )
  );

comment on table public.access_requests is
  'Lead capture from public /request-access form. Reviewed by admin team.';
