-- MERCH-INTEL-02: Feed Quality + Coverage Expansion
-- Scope: data_feeds ONLY — no UI, auth, payment, or registry table changes.
--
-- Scoring rubric (§3): Authority(0-3) + Operator Relevance(0-3) + Cadence(0-2) + Cleanliness(0-2)
-- Minimum score ≥7 for inclusion. All feeds below scored ≥7.
--
-- Phase 0: Disable 13 known-paywalled / bot-blocked / no-RSS feeds
-- Phase 1: Add 20+ medspa feeds (target: ≥30 enabled medspa)
-- Phase 2: Add 14 salon/spa/wellness feeds (target: ≥20 enabled salon)
-- Phase 3: Add 9 beauty brand/trade feeds (target: ≥20 enabled beauty_brand+trade)
-- Phase 4: Add 5 additional academic/regulatory feeds (target: ≥10 enabled)
-- Phase 5: Set hero feeds to tier_min='free'

-- ─────────────────────────────────────────────────────────────────────────────
-- PHASE 0: DISABLE KNOWN-BAD FEEDS
-- ─────────────────────────────────────────────────────────────────────────────

-- Paywalled market research: RSS returns empty teasers only, zero operator value
UPDATE data_feeds
SET is_enabled = false, health_status = 'disabled', updated_at = NOW()
WHERE name IN (
  'Mordor Intelligence Beauty',   -- paywall — no content in RSS
  'Mintel Ingredients',           -- paywall — no content in RSS
  'Euromonitor Beauty',           -- paywall — no content in RSS
  'Grand View Research Beauty',   -- paywall — no content in RSS
  'Cosmetic Ingredient Review'    -- paywall — members-only
);

-- Bot-blocked: returns 403/CAPTCHA on automated fetch
UPDATE data_feeds
SET is_enabled = false, health_status = 'disabled', updated_at = NOW()
WHERE name IN (
  'LinkedIn Beauty Jobs',         -- bot-blocked (403)
  'Indeed Beauty Jobs'            -- bot-blocked (403)
);

-- No working RSS: feed URL returns empty or non-RSS content
UPDATE data_feeds
SET is_enabled = false, health_status = 'disabled', updated_at = NOW()
WHERE name IN (
  'SCC News',                     -- scconline.org/feed returns empty
  'Cosmetics & Toiletries',       -- cosmeticsandtoiletries.com/rss — paywalled
  'GlobeNewswire Beauty',         -- bot-blocked (redirect loop)
  'International Esthetics Expo', -- ieshow.com/feed — no RSS content
  'Cosmetics Design'              -- paywalled content, RSS teasers only
);

-- ─────────────────────────────────────────────────────────────────────────────
-- PHASE 1: MEDSPA FEEDS
-- Score: each ≥7/10. Scores listed as (Authority+Relevance+Cadence+Cleanliness)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO data_feeds
  (name, feed_type, category, endpoint_url, is_enabled, vertical, tier_min,
   provenance_tier, attribution_label, poll_interval_minutes)
SELECT name, feed_type, category, endpoint_url, is_enabled, vertical, tier_min,
       provenance_tier, attribution_label, poll_interval_minutes
FROM (VALUES
  -- Score 3+3+2+2=10 — THE medspa industry association
  ('AmSpa – Med Spa Industry News', 'rss', 'association',
   'https://americanmedspa.org/feed',
   true, 'medspa', 'free', 1, 'American Med Spa Association', 60),

  -- Score 3+3+2+2=10 — dedicated medspa trade publication
  ('MedEsthetics Magazine', 'rss', 'trade_pub',
   'https://www.medestheticsmagazine.com/feed',
   true, 'medspa', 'free', 2, 'MedEsthetics', 60),

  -- Score 2+3+2+2=9 — AmSpa medical spa channel
  ('American Spa – Medical Spa', 'rss', 'trade_pub',
   'https://www.americanspa.com/tag/medical-spa/rss.xml',
   true, 'medspa', 'free', 2, 'American Spa', 60),

  -- Score 2+3+2+2=9 — AmSpa skincare channel
  ('American Spa – Skincare', 'rss', 'trade_pub',
   'https://www.americanspa.com/tag/skincare/rss.xml',
   true, 'medspa', 'paid', 2, 'American Spa', 60),

  -- Score 2+3+2+2=9 — AmSpa treatments channel
  ('American Spa – Treatments', 'rss', 'trade_pub',
   'https://www.americanspa.com/tag/treatments/rss.xml',
   true, 'medspa', 'paid', 2, 'American Spa', 60),

  -- Score 2+3+2+2=9 — AmSpa business channel
  ('American Spa – Business', 'rss', 'trade_pub',
   'https://www.americanspa.com/tag/business/rss.xml',
   true, 'medspa', 'paid', 2, 'American Spa', 60),

  -- Score 2+3+2+2=9 — AmSpa news channel
  ('American Spa – News', 'rss', 'trade_pub',
   'https://www.americanspa.com/tag/news/rss.xml',
   true, 'medspa', 'paid', 2, 'American Spa', 60),

  -- Score 2+3+2+2=9 — AmSpa people / industry profiles
  ('American Spa – People', 'rss', 'trade_pub',
   'https://www.americanspa.com/tag/people/rss.xml',
   true, 'medspa', 'paid', 2, 'American Spa', 60),

  -- Score 3+3+2+2=10 — esthetics + medspa treatment authority
  ('Skin Inc Magazine', 'rss', 'trade_pub',
   'https://www.skininc.com/feed',
   true, 'medspa', 'paid', 2, 'Skin Inc', 60),

  -- Score 3+3+2+2=10 — esthetics education authority
  ('Les Nouvelles Esthétiques (LNE)', 'rss', 'trade_pub',
   'https://www.lneonline.com/feed',
   true, 'medspa', 'paid', 2, 'LNE', 60),

  -- Score 3+2+2+2=9 — clinical dermatology, medspa crossover
  ('Dermatology Times', 'rss', 'trade_pub',
   'https://www.dermatologytimes.com/feed',
   true, 'medspa', 'paid', 2, 'Dermatology Times', 60),

  -- Score 3+2+2+2=9 — applied dermatology for practitioners
  ('Practical Dermatology', 'rss', 'trade_pub',
   'https://practicaldermatology.com/feed',
   true, 'medspa', 'paid', 2, 'Practical Dermatology', 60),

  -- Score 2+3+2+2=9 — medspa industry intelligence
  ('The Aesthetic Guide', 'rss', 'trade_pub',
   'https://aestheticguide.com/feed',
   true, 'medspa', 'paid', 2, 'The Aesthetic Guide', 60),

  -- Score 2+3+2+2=9 — UK aesthetic medicine, global relevance
  ('Aesthetic Medicine', 'rss', 'trade_pub',
   'https://aestheticmedicine.co.uk/feed',
   true, 'medspa', 'paid', 2, 'Aesthetic Medicine UK', 60),

  -- Score 2+3+2+2=9 — consumer medspa intelligence, procedure demand signals
  ('RealSelf News', 'rss', 'trade_pub',
   'https://www.realself.com/news/feed',
   true, 'medspa', 'free', 2, 'RealSelf', 60),

  -- Score 2+3+2+2=9 — medspa/spa crossover treatment focus
  ('Day Spa Magazine', 'rss', 'trade_pub',
   'https://www.dayspamagazine.com/feed',
   true, 'medspa', 'paid', 2, 'Day Spa Magazine', 60),

  -- Score 3+2+2+2=9 — Medscape dermatology + aesthetics
  ('Medscape Dermatology', 'rss', 'trade_pub',
   'https://www.medscape.com/rss/dermatology.xml',
   true, 'medspa', 'paid', 2, 'Medscape', 60),

  -- Score 3+2+2+2=9 — leading global plastic surgery association
  ('ISAPS – Aesthetic Surgery News', 'rss', 'association',
   'https://www.isaps.org/feed/',
   true, 'medspa', 'paid', 1, 'ISAPS', 60),

  -- Score 3+2+2+2=9 — AAD public news, skin disease awareness + treatment guidelines
  ('AAD – American Academy of Dermatology News', 'rss', 'association',
   'https://www.aad.org/news/rss',
   true, 'medspa', 'free', 1, 'American Academy of Dermatology', 60),

  -- Score 3+2+2+2=9 — top dermatology journal, medspa clinical evidence
  ('JAMA Dermatology', 'rss', 'academic',
   'https://jamanetwork.com/journals/jamadermatology/rss',
   true, 'medspa', 'paid', 1, 'JAMA Network', 60),

  -- Score 3+2+2+2=9 — cosmetic science peer review
  ('International Journal of Cosmetic Science', 'rss', 'academic',
   'https://onlinelibrary.wiley.com/action/showFeed?jc=14682494&type=etoc&feed=rss',
   true, 'medspa', 'paid', 1, 'Wiley / IJCS', 60),

  -- Score 3+2+2+2=9 — dermatology drug evidence, injectable/laser research
  ('Journal of Drugs in Dermatology', 'rss', 'academic',
   'https://jddonline.com/feed',
   true, 'medspa', 'paid', 1, 'JDD Online', 60),

  -- Score 3+2+2+2=9 — aesthetic surgery outcomes, procedure adoption research
  ('Aesthetic Surgery Journal', 'rss', 'academic',
   'https://academic.oup.com/rss/content/aif?title=Aesthetic+Surgery+Journal',
   true, 'medspa', 'paid', 1, 'Oxford Academic / ASJ', 60),

  -- Score 3+2+2+2=9 — cosmetic + investigational dermatology open access
  ('Clinical, Cosmetic and Investigational Dermatology', 'rss', 'academic',
   'https://www.dovepress.com/clinical-cosmetic-and-investigational-dermatology-journal-rss.xml',
   true, 'medspa', 'paid', 1, 'Dove Medical Press / CCID', 60),

  -- Score 3+3+2+2=10 — FDA MedWatch: device/product safety alerts for aesthetics
  ('FDA MedWatch Safety Alerts', 'rss', 'regulatory',
   'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/medwatch/rss.xml',
   true, 'medspa', 'free', 1, 'FDA MedWatch', 60)

) AS v(name, feed_type, category, endpoint_url, is_enabled, vertical, tier_min,
        provenance_tier, attribution_label, poll_interval_minutes)
WHERE v.name NOT IN (SELECT name FROM data_feeds);

-- ─────────────────────────────────────────────────────────────────────────────
-- PHASE 2: SALON / SPA / WELLNESS FEEDS
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO data_feeds
  (name, feed_type, category, endpoint_url, is_enabled, vertical, tier_min,
   provenance_tier, attribution_label, poll_interval_minutes)
SELECT name, feed_type, category, endpoint_url, is_enabled, vertical, tier_min,
       provenance_tier, attribution_label, poll_interval_minutes
FROM (VALUES
  -- Score 3+3+2+2=10 — #1 US salon industry trade publication
  ('Modern Salon', 'rss', 'trade_pub',
   'https://www.modernsalon.com/feed',
   true, 'salon', 'free', 2, 'Modern Salon', 60),

  -- Score 3+3+2+2=10 — premium US salon trade, technique + business
  ('American Salon', 'rss', 'trade_pub',
   'https://www.americansalon.com/feed',
   true, 'salon', 'free', 2, 'American Salon', 60),

  -- Score 2+3+2+2=9 — salon business + retail intelligence
  ('Salon Today', 'rss', 'trade_pub',
   'https://www.salontoday.com/feed',
   true, 'salon', 'paid', 2, 'Salon Today', 60),

  -- Score 2+3+2+2=9 — professional stylist community
  ('Behind the Chair', 'rss', 'trade_pub',
   'https://behindthechair.com/feed',
   true, 'salon', 'paid', 2, 'Behind the Chair', 60),

  -- Score 2+2+2+2=8 — massage therapy + bodywork trade
  ('Massage Magazine', 'rss', 'trade_pub',
   'https://www.massagemag.com/feed',
   true, 'salon', 'paid', 2, 'Massage Magazine', 60),

  -- Score 2+3+2+2=9 — spa management B2B intelligence
  ('Spa Executive', 'rss', 'trade_pub',
   'https://spaexecutive.com/feed',
   true, 'salon', 'paid', 2, 'Spa Executive', 60),

  -- Score 2+2+2+2=8 — professional hairdressing trade (UK, global reach)
  ('Hairdressers Journal International', 'rss', 'trade_pub',
   'https://hjimagazine.com/feed',
   true, 'salon', 'paid', 2, 'HJi Magazine', 60),

  -- Score 2+2+2+1=7 — wellness/lifestyle authority, medspa consumer crossover
  ('Well + Good', 'rss', 'trade_pub',
   'https://www.wellandgood.com/feed',
   true, 'salon', 'free', 2, 'Well + Good', 60),

  -- Score 2+2+2+2=8 — global wellness industry intelligence
  ('Global Wellness Summit Blog', 'rss', 'trade_pub',
   'https://www.globalwellnesssummit.com/blog/feed',
   true, 'salon', 'paid', 2, 'Global Wellness Summit', 60),

  -- Score 2+2+2+2=8 — ABMP (massage/bodywork association) publication
  ('Massage & Bodywork Magazine', 'rss', 'trade_pub',
   'https://www.massageandbodywork.com/rss',
   true, 'salon', 'paid', 2, 'ABMP', 60),

  -- Score 2+3+1+2=8 — spa/wellness booking platform industry insights
  ('Mindbody Industry Blog', 'rss', 'trade_pub',
   'https://www.mindbodyonline.com/business/health-wellness/feed',
   true, 'salon', 'paid', 2, 'Mindbody', 60),

  -- Score 2+3+2+2=9 — esthetic education cross with spa treatments
  ('Les Nouvelles Esthétiques – Spa', 'rss', 'trade_pub',
   'https://www.lneonline.com/category/spa/feed',
   true, 'salon', 'paid', 2, 'LNE Spa', 60),

  -- Score 2+3+2+2=9 — spa day-spa owner association
  ('Day Spa Association', 'rss', 'association',
   'https://www.dayspaassociation.com/feed',
   true, 'salon', 'paid', 1, 'Day Spa Association', 60),

  -- Score 2+2+2+2=8 — spa and hotel wellness benchmark intelligence
  ('Spa Business – News', 'rss', 'trade_pub',
   'https://www.spabusiness.com/rss/news',
   true, 'salon', 'paid', 2, 'Spa Business News', 60)

) AS v(name, feed_type, category, endpoint_url, is_enabled, vertical, tier_min,
        provenance_tier, attribution_label, poll_interval_minutes)
WHERE v.name NOT IN (SELECT name FROM data_feeds);

-- ─────────────────────────────────────────────────────────────────────────────
-- PHASE 3: BEAUTY BRAND / COSMETICS TRADE FEEDS
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO data_feeds
  (name, feed_type, category, endpoint_url, is_enabled, vertical, tier_min,
   provenance_tier, attribution_label, poll_interval_minutes)
SELECT name, feed_type, category, endpoint_url, is_enabled, vertical, tier_min,
       provenance_tier, attribution_label, poll_interval_minutes
FROM (VALUES
  -- Score 3+2+2+2=9 — US household/personal care products industry trade
  ('Happi Magazine', 'rss', 'trade_pub',
   'https://www.happi.com/rss',
   true, 'beauty_brand', 'paid', 2, 'HAPPI', 60),

  -- Score 3+2+2+2=9 — global cosmetics/beauty brand intelligence
  ('Global Cosmetic Industry (GCI)', 'rss', 'trade_pub',
   'https://www.gcimagazine.com/feed',
   true, 'beauty_brand', 'paid', 2, 'GCI Magazine', 60),

  -- Score 2+2+2+2=8 — beauty business and brand strategy
  ('Cosmetics Business', 'rss', 'trade_pub',
   'https://www.cosmeticsbusiness.com/feed',
   true, 'beauty_brand', 'paid', 2, 'Cosmetics Business', 60),

  -- Score 2+2+2+2=8 — premium beauty brand launches and trends
  ('Premium Beauty News', 'rss', 'trade_pub',
   'https://www.premiumbeautynews.com/en/?format=feed&type=rss',
   true, 'beauty_brand', 'paid', 2, 'Premium Beauty News', 60),

  -- Score 2+1+2+2=7 — fragrance/flavor science (ingredient intelligence)
  ('Perfumer & Flavorist', 'rss', 'trade_pub',
   'https://www.perfumerflavorist.com/feed',
   true, 'beauty_brand', 'paid', 2, 'Perfumer & Flavorist', 60),

  -- Score 2+2+2+2=8 — cosmetic executive community, brand intelligence
  ('CEW – Cosmetic Executive Women', 'rss', 'trade_pub',
   'https://cew.org/feed',
   true, 'beauty_brand', 'paid', 2, 'CEW', 60),

  -- Score 3+2+1+2=8 — US personal care products regulatory + industry
  ('Personal Care Products Council (PCPC)', 'rss', 'association',
   'https://www.personalcarecouncil.org/news/feed',
   true, 'beauty_brand', 'paid', 1, 'PCPC', 60),

  -- Score 3+1+1+2=7 — European cosmetics regulatory authority
  ('Cosmetics Europe News', 'rss', 'association',
   'https://cosmeticseurope.eu/feed/',
   true, 'beauty_brand', 'paid', 1, 'Cosmetics Europe', 60),

  -- Score 2+2+2+2=8 — global cosmetics ingredient innovation trade show
  ('In-cosmetics Global', 'rss', 'trade_pub',
   'https://www.in-cosmetics.com/en/blog/rss',
   true, 'beauty_brand', 'paid', 2, 'In-cosmetics Global', 60)

) AS v(name, feed_type, category, endpoint_url, is_enabled, vertical, tier_min,
        provenance_tier, attribution_label, poll_interval_minutes)
WHERE v.name NOT IN (SELECT name FROM data_feeds);

-- ─────────────────────────────────────────────────────────────────────────────
-- PHASE 4: ADDITIONAL ACADEMIC / REGULATORY FEEDS
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO data_feeds
  (name, feed_type, category, endpoint_url, is_enabled, vertical, tier_min,
   provenance_tier, attribution_label, poll_interval_minutes)
SELECT name, feed_type, category, endpoint_url, is_enabled, vertical, tier_min,
       provenance_tier, attribution_label, poll_interval_minutes
FROM (VALUES
  -- Score 3+2+2+2=9 — top dermatology journal (JAAD)
  ('JAAD – Journal of the American Academy of Dermatology', 'rss', 'academic',
   'https://www.jaad.org/rssFeed',
   true, 'medspa', 'paid', 1, 'JAAD / Elsevier', 60),

  -- Score 3+2+2+2=9 — surgical dermatology, resurfacing, aesthetic procedures
  ('Dermatologic Surgery Journal', 'rss', 'academic',
   'https://journals.lww.com/dermatologicsurgery/rss/recent.xml',
   true, 'medspa', 'paid', 1, 'LWW Dermatologic Surgery', 60),

  -- Score 3+1+2+2=8 — EU medicines / cosmeceutical regulatory authority
  ('European Medicines Agency News', 'rss', 'regulatory',
   'https://www.ema.europa.eu/en/feeds/news',
   true, 'multi', 'paid', 1, 'European Medicines Agency', 60),

  -- Score 3+2+2+2=9 — NCI clinical trial registry (device/procedure safety)
  ('FDA Recalls – Medical Devices', 'rss', 'regulatory',
   'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/recalls/rss.xml',
   true, 'medspa', 'free', 1, 'FDA Recalls', 60),

  -- Score 3+2+2+2=9 — NIH clinical research relevant to aesthetic procedures
  ('NIH – National Library of Medicine News', 'rss', 'academic',
   'https://www.nlm.nih.gov/news/nlm_news_rss.xml',
   true, 'medspa', 'paid', 1, 'National Library of Medicine', 60)

) AS v(name, feed_type, category, endpoint_url, is_enabled, vertical, tier_min,
        provenance_tier, attribution_label, poll_interval_minutes)
WHERE v.name NOT IN (SELECT name FROM data_feeds);

-- ─────────────────────────────────────────────────────────────────────────────
-- PHASE 5: HERO FEEDS — SET tier_min = 'free' for flagship sources
-- (Any newly inserted + existing flagship sources)
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE data_feeds
SET tier_min = 'free', updated_at = NOW()
WHERE name IN (
  -- Medspa hero
  'AmSpa – Med Spa Industry News',
  'MedEsthetics Magazine',
  'American Spa – Medical Spa',
  'RealSelf News',
  'AAD – American Academy of Dermatology News',
  'FDA MedWatch Safety Alerts',
  'FDA Recalls – Medical Devices',
  -- Salon hero
  'Modern Salon',
  'American Salon',
  'Well + Good',
  -- Existing flagship
  'American Spa Magazine',  -- already free, confirm
  'NCEA News',              -- already free, confirm
  'Beauty Independent',     -- already free, confirm
  'Glossy.co',              -- already free, confirm
  'WWD Beauty'              -- already free, confirm
);

-- Raise provenance_tier to 1 for association and regulatory sources
UPDATE data_feeds
SET provenance_tier = 1, updated_at = NOW()
WHERE category IN ('association', 'regulatory', 'academic')
  AND provenance_tier != 1;
