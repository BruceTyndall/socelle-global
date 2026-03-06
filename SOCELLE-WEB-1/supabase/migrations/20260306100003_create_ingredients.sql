-- W10-09: Open Beauty Facts integration — ingredients schema
-- Creates the ingredient intelligence data model.
-- Populated by: open-beauty-facts-sync Edge Function.
-- Future enrichment: ingest-cosing (EU CosIng CSV), ingest-openfda (safety scores W11-06).
-- ADD ONLY — never modify this file after applying to production.

-- ── ingredients: INCI registry ───────────────────────────────────────────────

create table if not exists public.ingredients (
  id               uuid     primary key default gen_random_uuid(),
  inci_name        text     unique not null,     -- INCI (International Nomenclature of Cosmetic Ingredients)
  common_name      text,                         -- consumer-friendly name
  cas_number       text,                         -- Chemical Abstracts Service registry number
  cosing_id        text,                         -- EU CosIng ingredient ID (populated by ingest-cosing)
  pubchem_cid      text,                         -- PubChem Compound ID (populated by future enrichment)
  function         text[]   not null default '{}', -- e.g. ['emollient', 'preservative', 'surfactant']
  restrictions     text,                         -- regulatory restriction notes
  eu_status        text
    check (eu_status in ('allowed', 'restricted', 'banned') or eu_status is null),
  safety_score     numeric  check (safety_score between 0.0 and 10.0),      -- populated by W11-06 (openFDA)
  trending_score   numeric  check (trending_score between 0.0 and 100.0),   -- populated by future social/patent signals
  description      text,
  metadata         jsonb    not null default '{}',  -- source, obf_page, additional provenance data
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists ingredients_inci_lower_idx
  on public.ingredients (lower(inci_name));

create index if not exists ingredients_safety_score_idx
  on public.ingredients (safety_score desc)
  where safety_score is not null;

create index if not exists ingredients_trending_score_idx
  on public.ingredients (trending_score desc)
  where trending_score is not null;

create index if not exists ingredients_eu_status_idx
  on public.ingredients (eu_status)
  where eu_status is not null;

-- ── ingredient_identifiers: cross-reference table ────────────────────────────

create table if not exists public.ingredient_identifiers (
  ingredient_id    uuid not null references public.ingredients(id) on delete cascade,
  identifier_type  text not null
    check (identifier_type in ('inci', 'cas', 'cosing', 'pubchem', 'einecs')),
  identifier_value text not null,
  primary key (ingredient_id, identifier_type)
);

create index if not exists ingredient_identifiers_value_idx
  on public.ingredient_identifiers (identifier_type, identifier_value);

-- ── Auto-update trigger ───────────────────────────────────────────────────────

create or replace function public.set_ingredients_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ingredients_updated_at on public.ingredients;
create trigger ingredients_updated_at
  before update on public.ingredients
  for each row execute function public.set_ingredients_updated_at();

-- ── RLS: ingredients ─────────────────────────────────────────────────────────

alter table public.ingredients enable row level security;

create policy "public_read_ingredients"
  on public.ingredients
  for select
  to anon, authenticated
  using (true);

create policy "service_role_write_ingredients"
  on public.ingredients
  for all
  to service_role
  using (true)
  with check (true);

-- ── RLS: ingredient_identifiers ──────────────────────────────────────────────

alter table public.ingredient_identifiers enable row level security;

create policy "public_read_ingredient_identifiers"
  on public.ingredient_identifiers
  for select
  to anon, authenticated
  using (true);

create policy "service_role_write_ingredient_identifiers"
  on public.ingredient_identifiers
  for all
  to service_role
  using (true)
  with check (true);

-- ── Comments ─────────────────────────────────────────────────────────────────

comment on table public.ingredients is
  'INCI ingredient registry. Seeded from Open Beauty Facts (W10-09). Enriched by ingest-cosing, ingest-openfda. LIVE when open-beauty-facts-sync has run.';

comment on table public.ingredient_identifiers is
  'Cross-reference identifiers for ingredients (INCI, CAS, CosIng, PubChem, EINECS). W10-09.';

comment on column public.ingredients.safety_score is
  'Composite safety rating 0–10. Populated by W11-06 (openFDA adverse events). NULL until then — do not display to users without DEMO label.';

comment on column public.ingredients.trending_score is
  'Composite trend score 0–100 from social mentions + patents + PubMed. NULL until downstream enrichment WOs run.';
