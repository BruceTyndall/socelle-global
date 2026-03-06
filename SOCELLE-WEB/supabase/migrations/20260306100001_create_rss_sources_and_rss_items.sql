-- W10-08: RSS ingestion pipeline — rss_sources + rss_items tables
-- Creates the data model for ingesting beauty industry RSS feeds.
-- Populated by: ingest-rss Edge Function (SOCELLE-WEB/supabase/functions/ingest-rss/)
-- Powers: news/editorial intelligence surfaces, brand mention signals.
-- ADD ONLY — never modify this file after applying to production.

-- ── rss_sources: registry of feeds to ingest ─────────────────────────────────

create table if not exists public.rss_sources (
  id                uuid        primary key default gen_random_uuid(),
  name              text        not null,
  feed_url          text        unique not null,
  category          text        not null
    check (category in (
      'professional_beauty', 'medspa_aesthetic', 'skincare_brands',
      'wellness', 'beauty_tech', 'cosmetic_surgery', 'trade_industry'
    )),
  verticals         text[]      not null default '{}',
  refresh_minutes   integer     not null default 60,
  last_fetched_at   timestamptz,
  last_item_count   integer     not null default 0,
  error_count       integer     not null default 0,
  status            text        not null default 'active'
    check (status in ('active', 'paused', 'deprecated')),
  created_at        timestamptz not null default now()
);

create index if not exists rss_sources_status_idx
  on public.rss_sources (status);

create index if not exists rss_sources_last_fetched_idx
  on public.rss_sources (last_fetched_at asc nulls first)
  where status = 'active';

-- ── rss_items: individual items ingested from feeds ──────────────────────────

create table if not exists public.rss_items (
  id                   uuid        primary key default gen_random_uuid(),
  source_id            uuid        not null references public.rss_sources(id) on delete cascade,
  guid                 text        not null,
  title                text        not null,
  link                 text,
  description          text,
  content              text,
  author               text,
  published_at         timestamptz,
  image_url            text,
  -- Intelligence enrichment fields (populated by downstream processing WOs)
  sentiment_score      numeric     check (sentiment_score between -1.0 and 1.0),
  relevance_score      numeric     check (relevance_score between 0.0 and 1.0),
  brand_mentions       text[]      not null default '{}',
  ingredient_mentions  text[]      not null default '{}',
  treatment_mentions   text[]      not null default '{}',
  vertical_tags        text[]      not null default '{}',
  is_new               boolean     not null default true,
  -- Provenance fields (required by SOCELLE_DATA_PROVENANCE_POLICY.md §2)
  -- RSS = Tier 2 (medium trust). Base confidence = 0.70 × recency × corroboration.
  -- Single-source items: 0.70 × 1.0 (fresh) × 0.85 (single source) = 0.595 default.
  confidence_score     numeric     not null default 0.595 check (confidence_score between 0.0 and 1.0),
  -- Format: "{source_name} — {article_url}" or "{source_name} — {feed_url}"
  attribution_text     text        not null default '',
  -- Full-text search index (auto-generated, immutable column)
  search_vector        tsvector    generated always as (
    to_tsvector('english',
      coalesce(title, '') || ' ' || coalesce(description, '')
    )
  ) stored,
  created_at           timestamptz not null default now(),
  unique (source_id, guid)
);

create index if not exists rss_items_search_idx
  on public.rss_items using gin(search_vector);

create index if not exists rss_items_published_idx
  on public.rss_items (published_at desc);

create index if not exists rss_items_source_published_idx
  on public.rss_items (source_id, published_at desc);

create index if not exists rss_items_is_new_idx
  on public.rss_items (is_new)
  where is_new = true;

-- ── RLS: rss_sources ─────────────────────────────────────────────────────────

alter table public.rss_sources enable row level security;

create policy "public_read_active_rss_sources"
  on public.rss_sources
  for select
  to anon, authenticated
  using (status = 'active');

create policy "admin_manage_rss_sources"
  on public.rss_sources
  for all
  to authenticated
  using (
    exists (
      select 1 from public.user_profiles
      where user_profiles.id = auth.uid()
        and user_profiles.role in ('admin', 'platform_admin')
    )
  );

create policy "service_role_write_rss_sources"
  on public.rss_sources
  for all
  to service_role
  using (true)
  with check (true);

-- ── RLS: rss_items ────────────────────────────────────────────────────────────

alter table public.rss_items enable row level security;

create policy "public_read_rss_items"
  on public.rss_items
  for select
  to anon, authenticated
  using (true);

create policy "service_role_write_rss_items"
  on public.rss_items
  for all
  to service_role
  using (true)
  with check (true);

-- ── Comments ─────────────────────────────────────────────────────────────────

comment on table public.rss_sources is
  'Registry of beauty industry RSS feeds. Populated by seed migration. W10-08.';

comment on table public.rss_items is
  'Individual RSS items ingested from rss_sources. Powers news/intelligence surfaces. LIVE when ingest-rss is running. W10-08.';

comment on column public.rss_items.search_vector is
  'Auto-generated tsvector for full-text search across title + description.';

comment on column public.rss_items.content is
  'Truncated excerpt (max 2000 chars) of item body. Per SOCELLE_DATA_PROVENANCE_POLICY.md §6: full-text reproduction of copyrighted articles is prohibited. Store excerpt only — never display full content without original link.';

comment on column public.rss_items.confidence_score is
  'Data provenance confidence per SOCELLE_DATA_PROVENANCE_POLICY.md §3. Tier 2 base=0.70, single-source corroboration=0.85, freshly-fetched recency=1.0 → default 0.595. Display at Medium confidence tier (0.50–0.79).';

comment on column public.rss_items.attribution_text is
  'Human-readable attribution: "{SourceName} — {article_url}". Required on all user-facing surfaces per SOCELLE_DATA_PROVENANCE_POLICY.md §2.';

comment on column public.rss_items.brand_mentions is
  'Brand names extracted from item text. Populated by downstream enrichment WO. Empty array until then.';
