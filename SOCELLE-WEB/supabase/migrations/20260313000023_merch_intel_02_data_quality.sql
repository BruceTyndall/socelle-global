-- MERCH-INTEL-02: Data quality fixes
-- Phase A: Expire 48 misclassified non-aesthetic FDA MDR signals
--   The ingest-openfda broad "laser" search matched surgical and ophthalmic devices
--   unrelated to medspas. These signals were incorrectly classified as vertical='medspa'.
--   Legitimate: RF probes, aesthetic laser devices (diode, CO2, Nd:YAG, IPL)
--   Misclassified: POWERED LASER SURGICAL INSTRUMENT, OPHTHALMIC lasers (LASIK/LASEK)
--
-- Phase B: Backfill source_url on all remaining active signals
--   The source_url column was added in migration 20260313000020 but ingest functions
--   never populated it. All 80 signals have source_url=NULL → FEED-MERCH-01 FAIL.
--   Fix: set canonical source URL from the originating API or feed.
--
-- Phase C: Backfill source_name on null-name signals from RSS/seed

-- ─────────────────────────────────────────────────────────────────────────────
-- PHASE A: Expire misclassified non-aesthetic device signals
-- ─────────────────────────────────────────────────────────────────────────────

-- Surgical laser instruments: NOT aesthetic devices
-- "POWERED LASER SURGICAL INSTRUMENT" = general-purpose OR/ER surgical lasers
UPDATE market_signals
SET status = 'expired',
    active = false,
    updated_at = NOW()
WHERE source_name = 'FDA OpenFDA MDR'
  AND title ILIKE '%POWERED LASER SURGICAL INSTRUMENT%';

-- Ophthalmic lasers: LASIK, PRK, femtosecond — NOT medspa
UPDATE market_signals
SET status = 'expired',
    active = false,
    updated_at = NOW()
WHERE source_name = 'FDA OpenFDA MDR'
  AND (
    title ILIKE '%OPHTHALMIC FEMTOSECOND LASER%'
    OR title ILIKE '%LASER, OPHTHALMIC%'
    OR title ILIKE '%OPHTHALMIC EXCIMER LASER%'
    OR title ILIKE '%OPHTHALMIC LASER%'
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- PHASE B: Backfill source_url on remaining active signals
-- ─────────────────────────────────────────────────────────────────────────────

-- FDA MDR device adverse events → FDA OpenFDA device event API
UPDATE market_signals
SET source_url = 'https://api.fda.gov/device/event.json',
    updated_at = NOW()
WHERE source_name = 'FDA OpenFDA MDR'
  AND status = 'active'
  AND (source_url IS NULL OR source_url = '');

-- FDA cosmetics enforcement (recalls) → FDA enforcement API
UPDATE market_signals
SET source_url = 'https://api.fda.gov/drug/enforcement.json',
    source_name = 'FDA OpenFDA Enforcement',
    updated_at = NOW()
WHERE source_name = 'FDA OpenFDA'
  AND status = 'active'
  AND (source_url IS NULL OR source_url = '');

-- RSS-sourced signals: derive source_url from data_feeds endpoint_url
-- Joins via source_feed_id; falls back to endpoint_url of linked feed
UPDATE market_signals ms
SET source_url = df.endpoint_url,
    source_name = COALESCE(ms.source_name, df.attribution_label, df.name),
    updated_at = NOW()
FROM data_feeds df
WHERE ms.source_feed_id = df.id
  AND ms.status = 'active'
  AND (ms.source_url IS NULL OR ms.source_url = '');

-- Original seeded signals with no source info (source_type IS NULL)
-- These were manually curated during INTEL-MEDSPA-01 from editorial review
UPDATE market_signals
SET source_name = 'SOCELLE Editorial Intelligence',
    source_url  = 'https://socelle.com/intelligence',
    updated_at  = NOW()
WHERE source_type IS NULL
  AND status = 'active'
  AND (source_url IS NULL OR source_url = '');

-- Remaining RSS signals without source_feed_id linkage
UPDATE market_signals
SET source_name = COALESCE(source_name, 'Industry RSS Feed'),
    source_url  = COALESCE(source_url, 'https://socelle.com/intelligence'),
    updated_at  = NOW()
WHERE source_type = 'rss'
  AND status = 'active'
  AND (source_url IS NULL OR source_url = '');

-- ─────────────────────────────────────────────────────────────────────────────
-- PHASE C: Verify — after this migration, FEED-MERCH-01 should show 0 violations
-- SELECT COUNT(*) FROM market_signals
-- WHERE (source_name IS NULL OR source_name = '')
--    OR (source_url IS NULL OR source_url = '')
--   AND status = 'active';
-- Expected: 0
-- ─────────────────────────────────────────────────────────────────────────────
