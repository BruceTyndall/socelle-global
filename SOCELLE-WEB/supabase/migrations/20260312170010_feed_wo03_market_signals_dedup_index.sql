-- FEED-WO-03: Add non-partial unique index on market_signals(source_type, external_id)
-- The existing market_signals_source_dedup_idx is a partial index (WHERE source_type IS NOT NULL AND external_id IS NOT NULL).
-- Supabase JS client onConflict requires a non-partial unique index for ON CONFLICT resolution.
-- This migration adds a full unique index so upsert(onConflict: 'source_type,external_id') works correctly.
-- ADD ONLY — never modify existing migrations

-- Drop the partial index (it cannot be used by ON CONFLICT without matching WHERE clause)
DROP INDEX IF EXISTS public.market_signals_source_dedup_idx;

-- Add non-partial unique index — NULL values are treated as distinct by PostgreSQL,
-- so NULL,NULL rows will not conflict with each other (correct behavior).
CREATE UNIQUE INDEX IF NOT EXISTS market_signals_source_external_uniq
  ON public.market_signals (source_type, external_id);

COMMENT ON INDEX public.market_signals_source_external_uniq IS
  'FEED-WO-03: Non-partial dedup index enabling ON CONFLICT (source_type, external_id) in upserts. '
  'Replaces the partial market_signals_source_dedup_idx which was incompatible with Supabase JS onConflict.';
