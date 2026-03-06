-- W12-20: Add provenance columns to market_signals for RSS-derived signals
-- ADD ONLY — never edit existing migrations (AGENT_SCOPE_REGISTRY §Backend Agent)
-- Authority: build_tracker.md WO W12-20
-- Owner approval: 2026-03-06 (APPROVE:W12-20-migration MAP-TYPE:ingredient_momentum)
--
-- Adds 4 columns required for rss_items → market_signals promotion pipeline:
--   source_type     text         — 'rss', 'manual', future source labels
--   external_id     text         — dedup key (rss_items.guid for RSS-derived rows)
--   data_source     uuid         — soft FK to source record (rss_items.id)
--   confidence_score numeric     — numeric 0–1 propagated from rss_items.confidence_score
--
-- Does NOT add 'industry_news' to signal_type_enum.
-- RSS-derived rows map to existing enum values per owner decision:
--   brand_mentions > 0 AND ingredient_mentions = 0 → 'brand_adoption'
--   all other cases                                → 'ingredient_momentum'
--
-- Existing rows (manually curated signals) are unaffected:
--   source_type, external_id, data_source, confidence_score default to NULL.
--   Partial unique index ignores rows where source_type IS NULL (manual signals).

ALTER TABLE public.market_signals
  ADD COLUMN IF NOT EXISTS source_type     text,
  ADD COLUMN IF NOT EXISTS external_id     text,
  ADD COLUMN IF NOT EXISTS data_source     uuid,
  ADD COLUMN IF NOT EXISTS confidence_score numeric;

-- Dedup index: prevents duplicate market_signals for the same source record.
-- Partial: only applies when source_type IS NOT NULL (RSS/external rows).
-- Manual signals (source_type IS NULL) are not constrained by this index.
CREATE UNIQUE INDEX IF NOT EXISTS market_signals_source_dedup_idx
  ON public.market_signals (source_type, external_id)
  WHERE source_type IS NOT NULL AND external_id IS NOT NULL;

COMMENT ON COLUMN public.market_signals.source_type IS
  'W12-20: Provenance source type (rss, manual). NULL = legacy/manually curated row.';

COMMENT ON COLUMN public.market_signals.external_id IS
  'W12-20: External dedup identifier. For RSS rows: rss_items.guid. '
  'Combined with source_type forms a unique key (partial index).';

COMMENT ON COLUMN public.market_signals.data_source IS
  'W12-20: Soft FK to source record UUID. For RSS rows: rss_items.id. '
  'No hard FK constraint — source rows may be cleaned up independently.';

COMMENT ON COLUMN public.market_signals.confidence_score IS
  'W12-20: Numeric confidence 0–1 propagated from source. '
  'For RSS rows: rss_items.confidence_score. NULL for legacy manual signals.';
