-- Migration: Add signal attribution columns to deals table
-- WO: SALES-WO-05 (Revenue Analytics — Signal Attribution)
-- Adds signal_id FK + attributed_at timestamp so OpportunityFinder deals
-- are traceable back to the originating market_signal.

ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS signal_id    UUID REFERENCES market_signals(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS attributed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_deals_signal_id ON deals(signal_id);
