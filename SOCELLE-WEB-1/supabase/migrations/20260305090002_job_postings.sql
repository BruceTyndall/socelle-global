-- Wave 9 / W9-03: Job postings table
-- Phase 1 stub — ready for real data ingestion (Wave 10)
-- Frontend currently uses mock data from Jobs.tsx; this table
-- powers the future backend-wired version.

create table if not exists public.job_postings (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  posted_by       uuid references auth.users(id),
  -- Core fields
  title           text not null,
  company         text not null,
  location        text not null,
  vertical        text not null
    check (vertical in ('spa', 'medspa', 'salon', 'clinic', 'other')),
  employment_type text not null
    check (employment_type in ('full-time', 'part-time', 'contract', 'per-diem')),
  -- Compensation
  salary_min      numeric(10, 2),
  salary_max      numeric(10, 2),
  salary_period   text not null default 'year'
    check (salary_period in ('hour', 'year')),
  -- Content
  description     text not null,
  requirements    jsonb not null default '[]'::jsonb,
  -- Status
  status          text not null default 'active'
    check (status in ('draft', 'active', 'filled', 'expired', 'removed')),
  expires_at      timestamptz,
  featured        boolean not null default false,
  -- Metadata
  apply_url       text,
  source          text default 'manual'
    check (source in ('manual', 'api', 'scrape'))
);

-- Slug index
create unique index if not exists job_postings_slug_idx
  on public.job_postings (slug);

-- Status + vertical for filtered queries
create index if not exists job_postings_status_vertical_idx
  on public.job_postings (status, vertical, created_at desc);

-- Featured jobs
create index if not exists job_postings_featured_idx
  on public.job_postings (featured, created_at desc)
  where featured = true;

-- Auto-update updated_at
create or replace function public.update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists job_postings_updated_at on public.job_postings;
create trigger job_postings_updated_at
  before update on public.job_postings
  for each row execute function public.update_updated_at_column();

-- RLS
alter table public.job_postings enable row level security;

-- Public can read active jobs
create policy "public_read_active_jobs"
  on public.job_postings
  for select
  to anon, authenticated
  using (status = 'active');

-- Admins can read all
create policy "admin_read_all_jobs"
  on public.job_postings
  for select
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles
      where user_profiles.id = auth.uid()
        and user_profiles.role in ('admin', 'platform_admin')
    )
  );

-- Admins can insert / update / delete
create policy "admin_manage_jobs"
  on public.job_postings
  for all
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles
      where user_profiles.id = auth.uid()
        and user_profiles.role in ('admin', 'platform_admin')
    )
  );

comment on table public.job_postings is
  'Job board postings for professional beauty roles. Phase 1 uses mock frontend data; Phase 2 wires this table via jobs-search edge function.';
