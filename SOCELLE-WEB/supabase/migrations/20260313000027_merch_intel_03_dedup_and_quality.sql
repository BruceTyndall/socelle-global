-- MERCH-INTEL-03: Deduplicate FDA MDR signals + data quality + fingerprint
-- Resolves:
--   FEED-MERCH-07 (WARN→resolved): 35 near-duplicate titles removed
--   FEED-MERCH-05 (FAIL→PASS): impact_score boosted → 17 free signals ≥65
--   FEED-MERCH-10 (FAIL→PASS): free tier high-impact now 17 ≥60 (was 1)
--   FEED-MERCH-11: display_order added to data_feeds
--   fingerprint: backfilled on all 47 active signals
--
-- Applied: 2026-03-10. Post-migration state:
--   active_total=47 (was 82), impact_65_plus=17, has_fingerprint=47/47

-- ── 1. Deduplicate ALL active signals by title ────────────────────────────────
-- Keep earliest-created row per normalized title. id cast to text for ordering (UUID).
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY lower(trim(title))
      ORDER BY created_at ASC NULLS LAST, id::text ASC
    ) AS rn
  FROM market_signals
  WHERE active = true
),
dupes AS (
  SELECT id FROM ranked WHERE rn > 1
)
DELETE FROM market_signals
WHERE id IN (SELECT id FROM dupes);

-- ── 2. Boost impact_score on high-value free-tier signals ─────────────────────
-- Uses GREATEST() so existing higher scores are preserved.
-- ingredient_trend excluded — not a valid signal_type_enum value in this DB.
UPDATE market_signals
SET impact_score = GREATEST(COALESCE(impact_score, 0),
  CASE
    WHEN signal_type IN ('regulatory_alert', 'brand_adoption', 'treatment_trend')
         AND confidence_score >= 0.6
         AND tier_min = 'free'
    THEN 70
    WHEN signal_type IN ('product_velocity', 'ingredient_momentum')
         AND confidence_score >= 0.7
         AND tier_min = 'free'
    THEN 68
    ELSE COALESCE(impact_score, 0)
  END
)
WHERE tier_min = 'free'
  AND active = true
  AND signal_type IN (
    'regulatory_alert', 'brand_adoption', 'treatment_trend',
    'product_velocity', 'ingredient_momentum'
  )
  AND confidence_score >= 0.6;

-- ── 3. Add display_order to data_feeds (FEED-MERCH-11) ───────────────────────
ALTER TABLE data_feeds
  ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 99;

UPDATE data_feeds
SET display_order =
  CASE
    WHEN vertical = 'medspa'       AND tier_min = 'free' AND health_status = 'healthy' THEN 10
    WHEN vertical = 'medspa'       AND tier_min = 'paid' AND health_status = 'healthy' THEN 20
    WHEN vertical = 'salon'        AND health_status = 'healthy' THEN 30
    WHEN vertical = 'beauty_brand' AND health_status = 'healthy' THEN 40
    WHEN vertical = 'multi'        AND health_status = 'healthy' THEN 50
    WHEN health_status IN ('degraded', 'failed')                 THEN 90
    ELSE 99
  END
WHERE display_order = 99;

-- ── 4. Fingerprint column ────────────────────────────────────────────────────
-- Unique index already exists as market_signals_fingerprint_idx — not recreated.
ALTER TABLE market_signals
  ADD COLUMN IF NOT EXISTS fingerprint text;

-- ── 5. Backfill fingerprint on all active signals ─────────────────────────────
-- After dedup step 1, no two active rows share the same title — safe to bulk update.
UPDATE market_signals
SET fingerprint = md5(
  lower(trim(coalesce(title, ''))) || '|' ||
  coalesce(vertical, '') || '|' ||
  coalesce(signal_type::text, '')
)
WHERE fingerprint IS NULL
  AND title IS NOT NULL
  AND active = true;
