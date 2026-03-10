-- CMS-SEED-01: Seed 6 published editorial posts → /intelligence editorial rail LIVE
-- Authority: build_tracker.md CMS-SEED-01 / WO_MASTER_PLATFORM_UPGRADE.md §CMS-SEED-01
-- Space: Intelligence (0076805d-b66b-4b1e-a658-3c29f8e423ed)
-- Related signal UUIDs are real rows from market_signals verified at seed time.

DO $$
DECLARE
  v_space_id UUID := '0076805d-b66b-4b1e-a658-3c29f8e423ed';
  v_author_id UUID := '70d017ef-3ff0-4da0-b0e0-b5a06376d350';
BEGIN

-- 1. Fractional Laser Safety Alert (regulatory, featured)
INSERT INTO cms_posts (space_id, title, slug, excerpt, hero_image, author_id, category, tags, status, published_at, featured, source_type, reading_time, metadata)
SELECT
  v_space_id,
  'Fractional Laser Systems: FDA Adverse Event Filings Signal Protocol Gap',
  'fractional-laser-fda-adverse-events',
  'Recent FDA MDR filings for fractional laser systems indicate a pattern of adverse events requiring updated treatment protocols and operator training review.',
  NULL,
  v_author_id,
  'regulatory',
  ARRAY['medspa', 'laser', 'fda', 'safety'],
  'published',
  NOW() - INTERVAL '2 hours',
  true,
  'automated',
  3,
  '{"author_name": "Socelle Intelligence", "related_signal_ids": ["6592d800-cc33-4dd0-8750-5ec965382243"]}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM cms_posts WHERE space_id = v_space_id AND slug = 'fractional-laser-fda-adverse-events'
);

-- 2. IPL Device Safety Alert (regulatory, featured)
INSERT INTO cms_posts (space_id, title, slug, excerpt, hero_image, author_id, category, tags, status, published_at, featured, source_type, reading_time, metadata)
SELECT
  v_space_id,
  'IPL Systems Under FDA Review — Operators Should Verify Informed Consent Protocols',
  'ipl-fda-adverse-events-medspa-operators',
  'Multiple adverse event reports filed for intense pulsed light delivery devices highlight the need for updated pre-treatment screening and consent documentation.',
  NULL,
  v_author_id,
  'regulatory',
  ARRAY['medspa', 'ipl', 'fda', 'consent'],
  'published',
  NOW() - INTERVAL '4 hours',
  true,
  'automated',
  3,
  '{"author_name": "Socelle Intelligence", "related_signal_ids": ["246f8618-4328-4a98-8ee2-b08ce0d6369e"]}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM cms_posts WHERE space_id = v_space_id AND slug = 'ipl-fda-adverse-events-medspa-operators'
);

-- 3. RF Microneedling Adverse Events (regulatory)
INSERT INTO cms_posts (space_id, title, slug, excerpt, hero_image, author_id, category, tags, status, published_at, featured, source_type, reading_time, metadata)
SELECT
  v_space_id,
  'RF Microneedling Adverse Events: Protocol Indicators for Treatment Room Review',
  'rf-microneedling-adverse-events-protocol',
  'FDA medical device reporting data shows adverse events associated with RF microneedling systems. Clinical review of contraindication screening may reduce operator risk.',
  NULL,
  v_author_id,
  'regulatory',
  ARRAY['medspa', 'microneedling', 'rf', 'fda'],
  'published',
  NOW() - INTERVAL '6 hours',
  false,
  'automated',
  3,
  '{"author_name": "Socelle Intelligence", "related_signal_ids": ["dd610c00-2dff-4b83-baa3-6acdd41c3cdb"]}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM cms_posts WHERE space_id = v_space_id AND slug = 'rf-microneedling-adverse-events-protocol'
);

-- 4. Collagen Supplement Clinical Evidence (clinical)
INSERT INTO cms_posts (space_id, title, slug, excerpt, hero_image, author_id, category, tags, status, published_at, featured, source_type, reading_time, metadata)
SELECT
  v_space_id,
  'Collagen Supplementation Evidence Review: Clinical Data on Skin Elasticity and Treatment Outcomes',
  'collagen-supplement-clinical-evidence-review',
  'A growing body of peer-reviewed evidence examines oral collagen supplement efficacy on skin elasticity, hydration, and treatment room outcome benchmarks for practitioners.',
  NULL,
  v_author_id,
  'clinical',
  ARRAY['collagen', 'clinical', 'skincare', 'evidence'],
  'published',
  NOW() - INTERVAL '8 hours',
  false,
  'automated',
  4,
  '{"author_name": "Socelle Intelligence", "related_signal_ids": ["5a80466a-a0c6-4407-9a7c-503c0438aaff"]}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM cms_posts WHERE space_id = v_space_id AND slug = 'collagen-supplement-clinical-evidence-review'
);

-- 5. Diode Laser Safety Protocol (medspa)
INSERT INTO cms_posts (space_id, title, slug, excerpt, hero_image, author_id, category, tags, status, published_at, featured, source_type, reading_time, metadata)
SELECT
  v_space_id,
  'Diode Laser Adverse Event Reports: Operator Protocol Review Signals Training Gap',
  'diode-laser-fda-safety-operator-protocol',
  'FDA adverse event data for diode laser hair removal systems points to operator training and pre-treatment assessment as primary risk reduction indicators for medspa operators.',
  NULL,
  v_author_id,
  'medspa',
  ARRAY['medspa', 'diode-laser', 'hair-removal', 'training'],
  'published',
  NOW() - INTERVAL '12 hours',
  false,
  'automated',
  3,
  '{"author_name": "Socelle Intelligence", "related_signal_ids": ["849a6449-93bf-4530-ac87-014e630215f7"]}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM cms_posts WHERE space_id = v_space_id AND slug = 'diode-laser-fda-safety-operator-protocol'
);

-- 6. Market Intelligence Brief (market_intelligence)
INSERT INTO cms_posts (space_id, title, slug, excerpt, hero_image, author_id, category, tags, status, published_at, featured, source_type, reading_time, metadata)
SELECT
  v_space_id,
  'Medspa Market Intelligence Brief: Regulatory Signals Shaping 2026 Treatment Demand',
  'medspa-market-intelligence-brief-2026',
  'Cross-analysis of FDA regulatory filings and treatment demand data reveals emerging procurement patterns for medspa operators building formulary strategies in 2026.',
  NULL,
  v_author_id,
  'market_intelligence',
  ARRAY['medspa', 'market', 'procurement', 'formulary'],
  'published',
  NOW() - INTERVAL '16 hours',
  false,
  'automated',
  5,
  '{"author_name": "Socelle Intelligence", "related_signal_ids": ["5ace96bd-7313-4aac-83a6-ac44629ec542"]}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM cms_posts WHERE space_id = v_space_id AND slug = 'medspa-market-intelligence-brief-2026'
);

END $$;
