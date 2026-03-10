-- MERCH-INTEL-02 Master Feed Cleanup
-- Fixes 5 known breakages from prior migrations + establishes authoritative feed state.
--
-- WHY THIS EXISTS:
-- 20260313000022 used column name 'feed_url' (WRONG — actual col is 'endpoint_url').
-- All URL fix UPDATEs in that migration silently matched 0 rows.
-- 20260313000022 also used vertical='academic_regulatory' (not a valid vertical value).
-- Those WHERE clauses also matched 0 rows.
-- 20260313000024 used feed_type='atom' which violates the CHECK constraint.
-- ~200 legacy rows still have vertical=NULL, tier_min=NULL.
-- Bot-blocked feeds were never actually disabled.
-- This migration corrects all of that.

-- ─────────────────────────────────────────────────────────────────────────────
-- PART 1: Fix URL updates that silently failed in 20260313000022
--         (wrong column name 'feed_url' — correct is 'endpoint_url')
-- ─────────────────────────────────────────────────────────────────────────────

-- FTC: correct URL
UPDATE data_feeds
SET endpoint_url = 'https://www.ftc.gov/feeds/press-releases.xml', updated_at = NOW()
WHERE name IN ('FTC Press Releases', 'FTC Consumer News');

-- FDA MedWatch: correct path
UPDATE data_feeds
SET endpoint_url = 'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/medwatch/rss.xml', updated_at = NOW()
WHERE name IN ('FDA Cosmetics Guidance', 'FDA MedWatch Safety Alerts');

-- American Spa: consolidate all to verified /rss/*/xml URL format
UPDATE data_feeds
SET name = 'American Spa — All Stories',
    endpoint_url = 'https://www.americanspa.com/rss/all-stories/xml',
    vertical = 'medspa', tier_min = 'free', is_enabled = true,
    consecutive_failures = 0, health_status = 'healthy', updated_at = NOW()
WHERE name IN ('American Spa Magazine', 'American Spa — All Stories')
  AND endpoint_url NOT LIKE '%/rss/all-stories/xml';

UPDATE data_feeds
SET endpoint_url = 'https://www.americanspa.com/rss/medical-spa/xml',
    consecutive_failures = 0, health_status = 'healthy', updated_at = NOW()
WHERE name = 'American Spa — Medical Spa'
  AND endpoint_url NOT LIKE '%/rss/medical-spa/xml';

UPDATE data_feeds
SET endpoint_url = 'https://www.americanspa.com/rss/skincare/xml',
    consecutive_failures = 0, health_status = 'healthy', updated_at = NOW()
WHERE name = 'American Spa — Skincare'
  AND endpoint_url NOT LIKE '%/rss/skincare/xml';

UPDATE data_feeds
SET endpoint_url = 'https://www.americanspa.com/rss/treatments/xml',
    consecutive_failures = 0, health_status = 'healthy', updated_at = NOW()
WHERE name = 'American Spa — Treatments'
  AND endpoint_url NOT LIKE '%/rss/treatments/xml';

UPDATE data_feeds
SET endpoint_url = 'https://www.americanspa.com/rss/business/xml',
    consecutive_failures = 0, health_status = 'healthy', updated_at = NOW()
WHERE name = 'American Spa — Business'
  AND endpoint_url NOT LIKE '%/rss/business/xml';

UPDATE data_feeds
SET endpoint_url = 'https://www.americanspa.com/rss/news/xml',
    consecutive_failures = 0, health_status = 'healthy', updated_at = NOW()
WHERE name = 'American Spa — News'
  AND endpoint_url NOT LIKE '%/rss/news/xml';

UPDATE data_feeds
SET endpoint_url = 'https://www.americanspa.com/rss/people/xml',
    consecutive_failures = 0, health_status = 'healthy', updated_at = NOW()
WHERE name = 'American Spa — People'
  AND endpoint_url NOT LIKE '%/rss/people/xml';

-- ─────────────────────────────────────────────────────────────────────────────
-- PART 2: Disable confirmed bot-blocked / 404 / paywalled feeds
--         (these disablements also failed in 20260313000022 due to wrong column)
-- ─────────────────────────────────────────────────────────────────────────────

-- Bot-blocked (HTTP 403 from Supabase us-west-2 egress IP)
UPDATE data_feeds
SET is_enabled = false, health_status = 'failed', consecutive_failures = 99,
    last_error = 'HTTP 403 — bot-blocked by publisher; Supabase egress IP denied', updated_at = NOW()
WHERE name IN (
  'Skin Inc Magazine', 'SkinInc',
  'Dermatology Times',
  'Day Spa Magazine',
  'The Aesthetic Guide',
  'LinkedIn Beauty Jobs', 'LinkedIn Jobs API',
  'Indeed Beauty Jobs', 'Indeed Job Search'
);

-- Confirmed 404 (no correctable URL identified)
UPDATE data_feeds
SET is_enabled = false, health_status = 'failed', consecutive_failures = 99,
    last_error = 'HTTP 404 — RSS endpoint not found; no correctable path known', updated_at = NOW()
WHERE name IN (
  'ISAPS – Aesthetic Surgery News',
  'Practical Dermatology',
  'Beauty Matter', 'BeautyMatter'
);

-- Paywalled / API-key-only / empty RSS teasers
UPDATE data_feeds
SET is_enabled = false, health_status = 'disabled',
    last_error = 'Paywall — public RSS returns empty teasers only; no operator value', updated_at = NOW()
WHERE name IN (
  'Mordor Intelligence Beauty',
  'Mintel Ingredients', 'Mintel Beauty Reports',
  'Euromonitor Beauty',
  'Grand View Research Beauty',
  'Cosmetic Ingredient Review', 'CIR (Cosmetic Ingredient Review)',
  'Cosmetics Design', 'Cosmetics & Toiletries', 'Cosmetics Technology',
  'GlobeNewswire — Health & Beauty', 'GlobeNewswire — Personal Care',
  'International Esthetics Expo',
  'SCC News', 'SCC — Society of Cosmetic Chemists'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- PART 3: Set vertical + tier_min on all legacy NULL rows
--         (~200 rows from 20260306600002 seed have no vertical/tier_min)
-- ─────────────────────────────────────────────────────────────────────────────

-- Medspa: clinical dermatology + aesthetics publications
UPDATE data_feeds SET vertical = 'medspa', tier_min = 'paid', updated_at = NOW()
WHERE vertical IS NULL AND name IN (
  'Dermascope', 'MedEsthetics', 'Dermatology Times', 'Practical Dermatology',
  'The Dermatologist', 'Medscape Dermatology', 'JAMA Dermatology',
  'Journal of Cosmetic Dermatology', 'British Journal of Dermatology',
  'International Journal of Dermatology', 'Dermatologic Surgery',
  'Journal of Drugs in Dermatology', 'Aesthetic Surgery Journal',
  'Clinical, Cosmetic and Investigational Dermatology',
  'JAAD – Journal of the American Academy of Dermatology',
  'Dermatologic Surgery Journal', 'International Journal of Cosmetic Science',
  'Nature Reviews Dermatology', 'MDPI Cosmetics Journal',
  'Frontiers in Dermatology', 'Skin Research & Technology (Wiley)',
  'Cochrane Skin Group', 'PMC Dermatology OA', 'NIH – National Library of Medicine News'
);

-- Medspa: associations + regulatory (safety always free)
UPDATE data_feeds SET vertical = 'medspa', tier_min = 'free', updated_at = NOW()
WHERE vertical IS NULL AND name IN (
  'AmSpa (American Med Spa Association)', 'AmSpa – Med Spa Industry News',
  'NCEA (National Coalition of Estheticians)', 'ASCP (Associated Skin Care Professionals)',
  'AAD – American Academy of Dermatology News',
  'FDA MedWatch Safety Alerts', 'FDA Recalls – Medical Devices', 'FDA Recalls — Medical Devices',
  'FDA MedWatch Alerts', 'TGA Safety (Australia)',
  'RealSelf News', 'ISAPS – Aesthetic Surgery News', 'Aesthetics Journal (UK)'
);

-- Medspa: paid clinical/trade
UPDATE data_feeds SET vertical = 'medspa', tier_min = 'paid', updated_at = NOW()
WHERE vertical IS NULL AND name IN (
  'Les Nouvelles Esthétiques (LNE)', 'Les Nouvelles Esthétiques – Spa',
  'Aesthetic Medicine', 'The Aesthetic Guide',
  'JAAD – Journal of the American Academy of Dermatology',
  'Spa + Clinic AU', 'Spa + Clinic (Australia)',
  'ISAPS – Aesthetic Surgery News'
);

-- Salon: trade pubs + associations
UPDATE data_feeds SET vertical = 'salon', tier_min = 'free', updated_at = NOW()
WHERE vertical IS NULL AND name IN (
  'ISPA', 'Global Wellness Institute', 'Day Spa Association',
  'Modern Salon/Spa', 'Modern Salon', 'American Salon',
  'Well + Good', 'Global Wellness Summit Blog'
);

UPDATE data_feeds SET vertical = 'salon', tier_min = 'paid', updated_at = NOW()
WHERE vertical IS NULL AND name IN (
  'Spa Business Magazine', 'Spa Business – News', 'Spa Business — News',
  'Massage Magazine', 'Massage & Bodywork Magazine', 'ABMP (Associated Bodywork & Massage)',
  'CIDESCO International', 'Hairdressers Journal International',
  'Salon Today', 'Behind the Chair', 'Spa Executive', 'Mindbody Industry Blog',
  'Professional Beauty UK', 'Professional Beauty AU', 'Beauty Biz (AU)',
  'Canadian Spa Magazine', 'Nailpro', 'American Salon'
);

-- Beauty brand: trade pubs, ingredients, suppliers
UPDATE data_feeds SET vertical = 'beauty_brand', tier_min = 'free', updated_at = NOW()
WHERE vertical IS NULL AND name IN (
  'Beauty Independent', 'Glossy.co', 'WWD Beauty'
);

UPDATE data_feeds SET vertical = 'beauty_brand', tier_min = 'paid', updated_at = NOW()
WHERE vertical IS NULL AND name IN (
  'Happi Magazine', 'Global Cosmetic Industry', 'Global Cosmetic Industry (GCI)',
  'Premium Beauty News', 'BeautyPackaging.com', 'Beauty Packaging',
  'Allure', 'Byrdie', 'Vogue Beauty', 'Into The Gloss', 'Coveteur Beauty',
  'Refinery29 Beauty', 'Cosmopolitan Beauty', 'The Cut — Beauty',
  'CEW News & Insights', 'CEW – Cosmetic Executive Women',
  'CosmeticsDesign-Europe', 'CosmeticsDesign-Asia',
  'Cosmetics Business', 'Cosmetics Technology', 'The Beauty Conversation',
  'PRNewswire — Beauty & Personal Care', 'BusinessWire — Beauty & Personal Care',
  'BusinessWire — Personal Care', 'GlobeNewsWire — Personal Care',
  'Cision PRWeb — Beauty', 'MarketWatch Press — Beauty',
  'Personal Care Products Council (PCPC)', 'PCPC Updates',
  'Cosmetics Europe', 'Cosmetics Europe News',
  'ICMAD News', 'IFSCC News', 'The Cosmetic Chemist',
  'In-cosmetics Global', 'Perfumer & Flavorist',
  'K-Beauty Insight', 'Jing Daily — Beauty',
  'Premium Beauty News'
);

-- Brand news / supplier feeds → beauty_brand paid
UPDATE data_feeds SET vertical = 'beauty_brand', tier_min = 'paid', updated_at = NOW()
WHERE vertical IS NULL AND category IN ('brand_news', 'supplier');

-- Ingredients → beauty_brand paid (except EWG which is free-tier safety)
UPDATE data_feeds SET vertical = 'beauty_brand', tier_min = 'paid', updated_at = NOW()
WHERE vertical IS NULL AND category = 'ingredients'
  AND name NOT IN ('EWG Skin Deep Updates', 'CIR (Cosmetic Ingredient Review)');

UPDATE data_feeds SET vertical = 'beauty_brand', tier_min = 'free', updated_at = NOW()
WHERE vertical IS NULL AND name = 'EWG Skin Deep Updates';

-- Regulatory: FDA safety → medspa free; EU/RAPEX → multi paid
UPDATE data_feeds SET vertical = 'medspa', tier_min = 'free', updated_at = NOW()
WHERE vertical IS NULL AND category = 'regulatory'
  AND name LIKE '%FDA%' OR name LIKE '%MedWatch%' OR name LIKE '%Recall%';

UPDATE data_feeds SET vertical = 'multi', tier_min = 'paid', updated_at = NOW()
WHERE vertical IS NULL AND category IN ('regulatory', 'government');

-- Jobs, events, social, market_data → multi
UPDATE data_feeds SET vertical = 'multi', tier_min = 'paid', updated_at = NOW()
WHERE vertical IS NULL AND category IN ('jobs', 'events', 'social', 'market_data');

-- Remaining NULLs (catch-all)
UPDATE data_feeds SET vertical = 'multi', tier_min = 'paid', updated_at = NOW()
WHERE vertical IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- PART 4: Fix provenance_tier on authority sources
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE data_feeds
SET provenance_tier = 1, updated_at = NOW()
WHERE category IN ('regulatory', 'academic', 'government', 'association')
  AND (provenance_tier IS NULL OR provenance_tier != 1);

-- ─────────────────────────────────────────────────────────────────────────────
-- PART 5: Enable verified hero FREE feeds (safety + flagship trade pubs)
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE data_feeds
SET is_enabled = true, tier_min = 'free',
    consecutive_failures = 0, health_status = 'healthy', updated_at = NOW()
WHERE name IN (
  -- Medspa heroes
  'American Spa — All Stories',
  'American Spa — Medical Spa',
  'AmSpa – Med Spa Industry News',
  'AmSpa (American Med Spa Association)',
  'MedEsthetics Magazine',
  'RealSelf News',
  'AAD – American Academy of Dermatology News',
  'FDA MedWatch Safety Alerts',
  'FDA Recalls – Medical Devices',
  'FDA Recalls — Medical Devices',
  -- Salon heroes
  'Modern Salon', 'Modern Salon/Spa',
  'American Salon',
  'Well + Good',
  'ISPA',
  'Global Wellness Institute',
  -- Beauty brand heroes
  'Beauty Independent',
  'Glossy.co',
  'WWD Beauty'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- PART 6: Enable verified PAID feeds (passed URL validation in FEED-URL-01)
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE data_feeds
SET is_enabled = true, consecutive_failures = 0, health_status = 'healthy', updated_at = NOW()
WHERE is_enabled = false
  AND health_status NOT IN ('failed', 'disabled')
  AND name IN (
  -- Medspa paid
  'American Spa — Skincare', 'American Spa — Treatments',
  'American Spa — Business', 'American Spa — News', 'American Spa — People', 'American Spa — Spas',
  'Les Nouvelles Esthétiques (LNE)', 'Aesthetic Medicine', 'Medscape Dermatology',
  'International Journal of Cosmetic Science', 'Journal of Drugs in Dermatology',
  'Aesthetic Surgery Journal', 'Clinical, Cosmetic and Investigational Dermatology',
  'JAAD – Journal of the American Academy of Dermatology', 'Dermatologic Surgery Journal',
  'Dermascope',
  -- Salon paid
  'Salon Today', 'Behind the Chair', 'Massage Magazine', 'Spa Executive',
  'Hairdressers Journal International', 'Global Wellness Summit Blog',
  'Massage & Bodywork Magazine', 'Day Spa Association', 'Spa Business Magazine',
  'Spa Business – News', 'Spa Business — News',
  -- Beauty brand paid
  'Happi Magazine', 'Global Cosmetic Industry', 'Global Cosmetic Industry (GCI)',
  'Cosmetics Business', 'Premium Beauty News',
  'CEW News & Insights', 'CEW – Cosmetic Executive Women',
  'Personal Care Products Council (PCPC)', 'Cosmetics Europe', 'Cosmetics Europe News',
  'PRNewswire — Beauty & Personal Care', 'BusinessWire — Beauty & Personal Care',
  -- Academic / regulatory paid
  'Journal of Cosmetic Dermatology', 'British Journal of Dermatology',
  'International Journal of Dermatology', 'Nature Reviews Dermatology',
  'MDPI Cosmetics Journal', 'Frontiers in Dermatology',
  'Skin Research & Technology (Wiley)', 'Cochrane Skin Group',
  'Health Canada Recalls & Alerts', 'TGA Safety (Australia)',
  'EU RAPEX Consumer Alerts', 'European Medicines Agency News'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- PART 7: Insert missing high-value feeds NOT already in data_feeds
--         CHECK constraint: feed_type IN ('rss','api','webhook','scraper')
--         Do NOT use 'atom' — Atom-format feeds still use 'rss' as feed_type
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO data_feeds
  (name, feed_type, category, endpoint_url, is_enabled, vertical, tier_min,
   provenance_tier, attribution_label, poll_interval_minutes)
SELECT name, feed_type, category, endpoint_url, is_enabled, vertical, tier_min,
       provenance_tier, attribution_label, 60
FROM (VALUES
  -- Salon (not in original seed)
  ('Modern Salon',        'rss', 'trade_pub',   'https://www.modernsalon.com/feed',             true,  'salon',        'free', 2, 'Modern Salon'),
  ('American Salon',      'rss', 'trade_pub',   'https://www.americansalon.com/feed',           true,  'salon',        'free', 2, 'American Salon'),
  ('Salon Today',         'rss', 'trade_pub',   'https://www.salontoday.com/feed',              true,  'salon',        'paid', 2, 'Salon Today'),
  ('Behind the Chair',    'rss', 'trade_pub',   'https://behindthechair.com/feed',              true,  'salon',        'paid', 2, 'Behind the Chair'),
  ('Spa Executive',       'rss', 'trade_pub',   'https://spaexecutive.com/feed',                true,  'salon',        'paid', 2, 'Spa Executive'),
  ('Well + Good',         'rss', 'trade_pub',   'https://www.wellandgood.com/feed',             true,  'salon',        'free', 2, 'Well + Good'),
  ('Spa Business — News', 'rss', 'trade_pub',   'https://www.spabusiness.com/rss/news',         true,  'salon',        'paid', 2, 'Spa Business News'),
  -- Beauty brand (not in original seed or disabled)
  ('Global Cosmetic Industry (GCI)', 'rss', 'trade_pub', 'https://www.gcimagazine.com/feed',   true,  'beauty_brand', 'paid', 2, 'GCI Magazine'),
  ('Cosmetics Business',  'rss', 'trade_pub',   'https://www.cosmeticsbusiness.com/feed',       true,  'beauty_brand', 'paid', 2, 'Cosmetics Business'),
  ('Premium Beauty News', 'rss', 'trade_pub',   'https://www.premiumbeautynews.com/en/?format=feed&type=rss', true, 'beauty_brand', 'paid', 2, 'Premium Beauty News'),
  ('CEW – Cosmetic Executive Women', 'rss', 'trade_pub', 'https://cew.org/feed',               true,  'beauty_brand', 'paid', 2, 'CEW'),
  -- Medspa (missing verified working feeds)
  ('AAD – American Academy of Dermatology News', 'rss', 'association', 'https://www.aad.org/news/rss', true, 'medspa', 'free', 1, 'American Academy of Dermatology'),
  ('RealSelf News',       'rss', 'trade_pub',   'https://www.realself.com/news/feed',           true,  'medspa',       'free', 2, 'RealSelf'),
  ('FDA Recalls — Medical Devices', 'rss', 'regulatory', 'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/recalls/rss.xml', true, 'medspa', 'free', 1, 'FDA Recalls'),
  ('JAMA Dermatology (New URL)', 'rss', 'academic', 'https://jamanetwork.com/journals/jamadermatology/rss', true, 'medspa', 'paid', 1, 'JAMA Network'),
  ('Aesthetic Surgery Journal', 'rss', 'academic', 'https://academic.oup.com/rss/content/aif?title=Aesthetic+Surgery+Journal', true, 'medspa', 'paid', 1, 'Oxford Academic / ASJ'),
  ('JAAD – Journal of the American Academy of Dermatology', 'rss', 'academic', 'https://www.jaad.org/rssFeed', true, 'medspa', 'paid', 1, 'JAAD / Elsevier'),
  ('International Journal of Cosmetic Science', 'rss', 'academic', 'https://onlinelibrary.wiley.com/action/showFeed?jc=14682494&type=etoc&feed=rss', true, 'medspa', 'paid', 1, 'Wiley / IJCS')
) AS v(name, feed_type, category, endpoint_url, is_enabled, vertical, tier_min, provenance_tier, attribution_label)
WHERE NOT EXISTS (SELECT 1 FROM data_feeds df WHERE df.name = v.name);

-- Also insert American Spa — Spas if missing (new channel not in any prior migration)
INSERT INTO data_feeds
  (name, feed_type, category, endpoint_url, is_enabled, vertical, tier_min, provenance_tier, attribution_label, poll_interval_minutes)
SELECT
  'American Spa — Spas',
  'rss', 'trade_pub',
  'https://www.americanspa.com/rss/spas/xml',
  true, 'medspa', 'paid', 2, 'American Spa', 60
WHERE NOT EXISTS (
  SELECT 1 FROM data_feeds WHERE name = 'American Spa — Spas'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- PART 8: Add priority column for admin feed ordering (Rule 11 — FEED-MERCH)
--         Needed for AdminFeedsHub to allow drag-to-reorder
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'data_feeds' AND column_name = 'priority'
  ) THEN
    ALTER TABLE public.data_feeds ADD COLUMN priority integer DEFAULT 50;
    COMMENT ON COLUMN public.data_feeds.priority IS 'Admin display ordering — lower number = higher position in feed. Default 50. Set by AdminFeedsHub drag-to-reorder.';
  END IF;
END $$;

-- Set priority for hero free feeds (highest priority = lowest number)
UPDATE data_feeds SET priority = 10 WHERE name IN (
  'American Spa — All Stories', 'American Spa — Medical Spa',
  'AmSpa – Med Spa Industry News', 'AmSpa (American Med Spa Association)',
  'MedEsthetics Magazine', 'FDA MedWatch Safety Alerts',
  'FDA Recalls — Medical Devices', 'FDA Recalls – Medical Devices',
  'AAD – American Academy of Dermatology News',
  'Modern Salon', 'American Salon', 'Beauty Independent'
);

UPDATE data_feeds SET priority = 20 WHERE name IN (
  'RealSelf News', 'WWD Beauty', 'Glossy.co', 'Well + Good',
  'ISPA', 'Global Wellness Institute',
  'Dermascope', 'Medscape Dermatology'
) AND (priority IS NULL OR priority = 50);

UPDATE data_feeds SET priority = 30 WHERE name IN (
  'American Spa — Skincare', 'American Spa — Treatments',
  'American Spa — Business', 'American Spa — News', 'American Spa — People',
  'American Spa — Spas', 'Les Nouvelles Esthétiques (LNE)',
  'Salon Today', 'Behind the Chair', 'Spa Business — News'
) AND (priority IS NULL OR priority = 50);

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICATION QUERY (run after applying to confirm state)
-- ─────────────────────────────────────────────────────────────────────────────
-- SELECT vertical, tier_min, COUNT(*) FILTER (WHERE is_enabled) AS enabled,
--        COUNT(*) FILTER (WHERE NOT is_enabled) AS disabled
-- FROM data_feeds
-- GROUP BY vertical, tier_min
-- ORDER BY vertical, tier_min;
--
-- Expected: medspa free ≥8, medspa paid ≥22, salon free ≥5, salon paid ≥10,
--           beauty_brand free ≥3, beauty_brand paid ≥12
