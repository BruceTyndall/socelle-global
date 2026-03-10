-- MERCH-REMEDIATION-01
-- Step A: Archive off-topic non-beauty signals (MERCH-08 / MERCH-09)
-- Step B: Add provenance_tier column to market_signals (MERCH-01)
-- Agent: INTELLIGENCE-MERCHANDISER-17
-- WO: MERCH-REMEDIATION-01

-- ── Step A: Archive off-topic signals ──────────────────────────────────────
-- Archive signals clearly outside the beauty/medspa/spa/esthetics domain.
-- Criteria 1: hard keyword matches (disease names, unrelated health topics)
-- Criteria 2: low-quality "other"-topic rows from GNews/NewsAPI that fail
--             the beauty relevance keyword test.
UPDATE market_signals
SET
  active  = false,
  status  = 'archived'
WHERE active = true
  AND (
    -- Criterion 1: hard non-beauty disease / public-health keywords
    lower(title) ~ 'buruli|alzheimer|diabetes|cardiovascular|obesity'
    OR lower(title) ~ 'colon cancer|pancreatic cancer|brain cancer|lung cancer|cancer burden|cancer.*chemo'
    OR lower(title) ~ 'malaria|neglected tropical|neglected disease'
    OR lower(title) ~ 'climate change|physical activity.*climate|climate.*physical'
    OR lower(title) ~ 'b\.c\. women.s health|women.s health roundtable'
    OR lower(title) LIKE '%buruli%'
    OR lower(title) LIKE '%alzheimer%'
    OR lower(title) LIKE '%diabetes%'
    OR lower(title) LIKE '%malaria%'
    -- Criterion 2: GNews/NewsAPI "other"-topic rows with no beauty relevance
    OR (
      lower(source_name) IN ('gnews industry press', 'newsapi industry press')
      AND topic = 'other'
      AND lower(title) !~ 'skin|botox|filler|aesthet|medspa|med spa|esthetician|spa |salon|beauty|cosmetic|skincare|serum|treatment|ingredient|laser|retinol|peptide|collagen|hyaluronic|vitamin\b|anti.?aging|wrinkle|acne|hair |nail|wax |peel|microneedle|rf |ipl |blephar|lash|brow|tox |fda cosmetic|mocra|dermal|injectab|neurotox|botulinum'
      AND lower(description) !~ 'skin|botox|filler|aesthet|medspa|med spa|esthetician|spa |salon|beauty|cosmetic|skincare|serum|treatment|ingredient|laser|retinol|peptide|collagen|hyaluronic|anti.?aging|wrinkle|acne|hair |nail|wax |peel|microneedle|dermal|injectab'
    )
  );

-- ── Step B: Add provenance_tier to market_signals ──────────────────────────
-- Integer: 1 = regulatory/authoritative, 2 = academic/clinical, 3 = trade_pub (default)
ALTER TABLE market_signals
  ADD COLUMN IF NOT EXISTS provenance_tier INTEGER NOT NULL DEFAULT 3;

-- Backfill from data_feeds.provenance_tier via source_feed_id FK
UPDATE market_signals ms
   SET provenance_tier = df.provenance_tier
  FROM data_feeds df
 WHERE ms.source_feed_id = df.id
   AND df.provenance_tier IS NOT NULL;

-- Override: FDA / regulatory signals always tier 1 regardless of feed source
UPDATE market_signals
   SET provenance_tier = 1
 WHERE signal_type = 'regulatory_alert'
    OR lower(source_name) LIKE '%fda%'
    OR lower(source_name) LIKE '%openfda%'
    OR lower(source_name) LIKE '%ftc%'
    OR lower(source_name) LIKE '%epa %';

-- Index for ORDER BY performance
CREATE INDEX IF NOT EXISTS idx_market_signals_provenance_tier
  ON market_signals (provenance_tier, impact_score DESC);
