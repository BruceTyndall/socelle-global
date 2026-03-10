-- COVERAGE-EXPANSION-01: Add domain column to data_feeds
-- Authority: build_tracker.md COVERAGE-EXPANSION-01
-- Taxonomy per work order §0.1:
-- domain: skincare | makeup | haircare | nails | fragrance | bodycare | wellness |
--         devices | ingredients_science | regulatory_compliance | retail_market |
--         professional_business_ops | education_training | jobs_talent |
--         events_trade | spa_hospitality

-- 1. Add domain column
ALTER TABLE data_feeds
  ADD COLUMN IF NOT EXISTS domain TEXT DEFAULT 'skincare';

-- 2. Backfill existing feeds with best-fit domain values

-- Regulatory / FDA → regulatory_compliance
UPDATE data_feeds SET domain = 'regulatory_compliance'
WHERE category IN ('regulatory') OR name ILIKE '%fda%' OR name ILIKE '%ftc%'
   OR name ILIKE '%ema%' OR name ILIKE '%regulation%';

-- Academic dermatology/science → ingredients_science
UPDATE data_feeds SET domain = 'ingredients_science'
WHERE category = 'academic'
   OR name ILIKE '%pubmed%' OR name ILIKE '%journal%' OR name ILIKE '%dermatology%'
   OR name ILIKE '%cosmetic science%';

-- Devices / medical aesthetic technology → devices
UPDATE data_feeds SET domain = 'devices'
WHERE name ILIKE '%aesthetic%' AND (name ILIKE '%device%' OR name ILIKE '%laser%')
   OR name ILIKE '%medesthetics%' OR name ILIKE '%plastic surgery%'
   OR name ILIKE '%modern aesthetics%';

-- Nail-focused → nails (none currently, ready for new inserts)
UPDATE data_feeds SET domain = 'nails'
WHERE name ILIKE '%nail%' OR name ILIKE '%nails%' OR name ILIKE '%scratch magazine%';

-- Spa / hospitality → spa_hospitality
UPDATE data_feeds SET domain = 'spa_hospitality'
WHERE name ILIKE '%ispa%' OR name ILIKE '%spa business%' OR name ILIKE '%global wellness%'
   OR name ILIKE '%spa executive%' OR name ILIKE '%wellness summit%'
   OR name ILIKE '%wellspa%' OR name ILIKE '%day spa%' OR name ILIKE '%spa & resort%'
   OR name ILIKE '%hotel spa%' OR name ILIKE '%destination spa%';

-- Wellness / bodycare → wellness
UPDATE data_feeds SET domain = 'wellness'
WHERE name ILIKE '%massage%' OR name ILIKE '%well+good%' OR name ILIKE '%well %'
   OR name ILIKE '%bodywork%' OR name ILIKE '%wellness%' AND domain = 'skincare';

-- Haircare → haircare
UPDATE data_feeds SET domain = 'haircare'
WHERE name ILIKE '%salon%' OR name ILIKE '%hair%' OR name ILIKE '%hairdress%'
   OR name ILIKE '%behind the chair%' OR name ILIKE '%salon today%';

-- Makeup / color cosmetics → makeup
UPDATE data_feeds SET domain = 'makeup'
WHERE name ILIKE '%makeup%' OR name ILIKE '%allure%' OR name ILIKE '%cosmopolitan%'
   OR name ILIKE '%into the gloss%' OR name ILIKE '%lipstick%';

-- Brand/retail trade → retail_market
UPDATE data_feeds SET domain = 'retail_market'
WHERE name ILIKE '%wwd%' OR name ILIKE '%business of fashion%' OR name ILIKE '%glossy%'
   OR name ILIKE '%beauty independent%' OR name ILIKE '%vogue business%'
   OR name ILIKE '%premium beauty news%' OR name ILIKE '%cosmetics business%'
   OR name ILIKE '%happi%' OR name ILIKE '%gci%' OR name ILIKE '%cew%'
   OR name ILIKE '%in-cosmetics%';

-- Professional ops → professional_business_ops
UPDATE data_feeds SET domain = 'professional_business_ops'
WHERE name ILIKE '%mindbody%' OR name ILIKE '%patientnow%' OR name ILIKE '%nextech%'
   OR name ILIKE '%symplast%' OR name ILIKE '%aesthetic record%'
   OR name ILIKE '%practice%' OR name ILIKE '%business%' AND category = 'trade_pub'
      AND vertical IN ('medspa','salon');

-- Events → events_trade
UPDATE data_feeds SET domain = 'events_trade'
WHERE category = 'events' OR name ILIKE '%cosmoprof%' OR name ILIKE '%expo%'
   OR name ILIKE '%summit%' AND category != 'trade_pub';

-- Jobs → jobs_talent
UPDATE data_feeds SET domain = 'jobs_talent'
WHERE category = 'jobs' OR name ILIKE '% jobs%' OR name ILIKE '%career%';

-- American Spa channels (spa + medspa content) → spa_hospitality
UPDATE data_feeds SET domain = 'spa_hospitality'
WHERE name ILIKE 'american spa%';

-- Associations → keep skincare/spa as appropriate (override if not yet set)
UPDATE data_feeds SET domain = 'skincare'
WHERE category = 'association' AND domain = 'skincare'
  AND name ILIKE '%dermatolog%';

UPDATE data_feeds SET domain = 'spa_hospitality'
WHERE category = 'association' AND (name ILIKE '%spa%' OR name ILIKE '%wellness%')
  AND domain = 'skincare';

-- Press releases / newswires → retail_market
UPDATE data_feeds SET domain = 'retail_market'
WHERE category IN ('press_release','brand_news') AND domain = 'skincare';

-- API feeds
UPDATE data_feeds SET domain = 'wellness' WHERE name ILIKE 'gnews%';
UPDATE data_feeds SET domain = 'wellness' WHERE name ILIKE 'newsapi%';
UPDATE data_feeds SET domain = 'wellness' WHERE name ILIKE 'currents%';

-- Add constraint hint (non-enforcing comment; enforced at app layer)
COMMENT ON COLUMN data_feeds.domain IS
  'Beauty domain taxonomy: skincare|makeup|haircare|nails|fragrance|bodycare|wellness|devices|ingredients_science|regulatory_compliance|retail_market|professional_business_ops|education_training|jobs_talent|events_trade|spa_hospitality';
