-- INTEL-GLOBAL-01: Global Intelligence Expansion
-- Activates 37 dormant feeds + inserts 49 new global intelligence sources
-- Regions: APAC, Europe, AI/Beauty Tech, Reddit RSS, PubMed, regulatory
-- Authority: feed_activation_spec.md, CLAUDE.md §3 (INTEL queue)
-- ADD ONLY — never modify existing migrations
-- Idempotent: UPDATE WHERE conditions + ON CONFLICT DO NOTHING

BEGIN;

-- =============================================================================
-- PART 0: Extend category CHECK constraint to include 'research'
-- The original CREATE TABLE only allowed 'academic' — we need 'research' for
-- arXiv, PubMed RSS, and journal feeds that are better categorized as research.
-- =============================================================================
ALTER TABLE public.data_feeds DROP CONSTRAINT IF EXISTS data_feeds_category_check;
ALTER TABLE public.data_feeds ADD CONSTRAINT data_feeds_category_check
  CHECK (category IN (
    'trade_pub', 'regulatory', 'academic', 'social',
    'jobs', 'events', 'ingredients', 'brand_news',
    'press_release', 'association', 'supplier',
    'regional', 'government', 'market_data', 'research'
  ));

-- Add UNIQUE constraint on endpoint_url if not exists (needed for ON CONFLICT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.data_feeds'::regclass
      AND contype = 'u'
      AND conname = 'data_feeds_endpoint_url_key'
  ) THEN
    ALTER TABLE public.data_feeds ADD CONSTRAINT data_feeds_endpoint_url_key UNIQUE (endpoint_url);
  END IF;
END $$;

-- =============================================================================
-- PART 1: ACTIVATE DORMANT FEEDS
-- Enable feeds with consecutive_failures=0, never fetched, not requiring REDDIT_CLIENT_ID
-- Uses specific UUIDs from the spec for precision
-- =============================================================================
UPDATE public.data_feeds
SET is_enabled = true, updated_at = now()
WHERE id IN (
  'e4e2b77a-630f-4214-ae5a-0a3669d6ad42',  -- Luxury SpaFinder Blog
  'bcc7cff1-6535-423b-8c94-35dc6c9b1276',  -- Google Trends Beauty
  '4e7426b3-b880-4699-bd32-4be2597a2697',  -- Nailpro UK
  '342f9098-1675-4232-b3b2-b8369bec626b',  -- Makeup.com Blog
  '22f1e712-3531-41bd-aa32-9e5834f59f95',  -- The Nail Hub
  '7e17392e-697e-4947-9af8-09197109dc08',  -- CND Education Blog
  'f3f322fb-6083-4369-bd8c-067da865a91e',  -- OPI Pro Blog
  '5ef2834f-c251-469b-8a67-dc2e9fcecfbd',  -- NailGeek Blog
  'a2d66586-783b-41b4-991e-6ec8d3e3ed77',  -- Reddit r/Nails
  '1d042f4b-f776-4743-8133-b8c96fe3ce84',  -- Reddit r/NailArt
  'c2054c93-be9f-49f5-9063-c41a2c327fcc',  -- Cosmopolitan Beauty
  '2bed5732-70ed-46eb-9bfd-25fff3717a39',  -- The Beauty Department
  'b5951a1e-de8e-4c44-bf52-aa70bdb144e5',  -- Beautylish News
  'f13482f3-c794-4191-8196-4ee6915a9ff6',  -- Makeup Artists Guild Blog
  'a373c33f-2f70-4d47-b0ae-a7b26a2dbbc5',  -- The Cut Beauty
  'dafcb9f5-3ef9-46d1-9e9a-baab59bd561f',  -- The Perfume Society
  '185d5ef7-d8ca-4c01-aba5-50376c48b691',  -- Perfumer & Flavorist Plus
  'a1817892-cc74-4a2a-a311-198d1f909edb',  -- The Scent Blog
  '84cf7d76-27a4-42a9-92c6-78fd236e2dfa',  -- Esxence Fragrance News
  '624abfde-4bc6-45e5-97a2-180f4adeddcc',  -- Reddit r/fragrance
  '3148bcb2-eb00-4e73-9e70-36d4fa0817a7',  -- Women's Health Beauty
  '3ea8a2aa-0375-485a-bcf2-b38062f02d93',  -- SELF Magazine Beauty
  '084f4b54-d9bd-45e8-98a0-64774eeeb0dd',  -- Healthline Beauty
  '74e86366-e412-441e-971e-8d7b785138a1',  -- Organic Beauty Talk
  'e6d25ff8-db99-4356-a2cb-07ca28ad99f5',  -- Body Positive Blog - NAHA
  '9ab6d3c0-92b9-4971-bae2-5accac0e1346',  -- NCEA Education News
  'a5347292-9f39-4eb7-aa10-153987a1e55e',  -- Paul Mitchell Schools Blog
  '7b99707f-60eb-4967-9365-151e227fe12b',  -- American Beauty Association News
  '700f07ae-16fe-4941-a3af-8470cc7188d8',  -- CIDESCO International News
  '268be55b-a33f-4a43-a7cd-6f2a4a259fff',  -- Beauty Schools Directory Blog
  '6bcece6a-937c-428d-8bdb-610e8fcaa7d1',  -- CE Zoom Aesthetics Blog
  '3f488461-7317-4b92-9d86-855ec4de09a0',  -- Resort + Recreation Magazine
  '40ea9bb0-eb65-439c-8f36-8faef854939e',  -- Condé Nast Traveler Spa
  '18a8b7fa-07ff-4e14-8fc1-10e89091a90b'   -- Spa Business News
)
AND is_enabled = false
AND consecutive_failures = 0;

-- Explicitly skip Reddit API feeds requiring REDDIT_CLIENT_ID:
-- 283d3ef8 (r/estheticians), 76e17895 (r/MedSpa), 86fb9bbf (r/SkincareAddiction)

-- =============================================================================
-- PART 2: INSERT NEW FEEDS — ASIA-PACIFIC (12 feeds)
-- =============================================================================

-- SOUTH KOREA (5 feeds)
INSERT INTO public.data_feeds (id, name, endpoint_url, feed_type, category, domain, vertical, provenance_tier, poll_interval_minutes, is_enabled, health_status, consecutive_failures, signal_count, api_key_env_var, priority, tier_min, attribution_label, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Yonhap News Korea (EN)', 'https://en.yna.co.kr/RSS/news.xml', 'rss', 'trade_pub', 'regulatory', 'multi', 1, 60, true, 'healthy', 0, 0, null, 50, 'free', 'Yonhap News Korea (EN)', now(), now()),
  (gen_random_uuid(), 'Fifty Shades of Snail', 'https://fiftyshadesofsnail.com/feed', 'rss', 'social', 'skincare', 'beauty_brand', 3, 240, true, 'healthy', 0, 0, null, 50, 'free', 'Fifty Shades of Snail', now(), now()),
  (gen_random_uuid(), 'Snow White Asian Pear', 'https://snowwhiteandtheasianpear.com/feed', 'rss', 'social', 'skincare', 'beauty_brand', 3, 240, true, 'healthy', 0, 0, null, 50, 'free', 'Snow White Asian Pear', now(), now()),
  (gen_random_uuid(), 'Fanserviced-B K-Beauty', 'https://fanserviced-b.com/feed', 'rss', 'social', 'skincare', 'beauty_brand', 3, 240, true, 'healthy', 0, 0, null, 50, 'free', 'Fanserviced-B K-Beauty', now(), now()),
  (gen_random_uuid(), 'Christina Hello K-Beauty', 'https://christinahello.com/feed', 'rss', 'social', 'skincare', 'beauty_brand', 3, 240, true, 'healthy', 0, 0, null, 50, 'free', 'Christina Hello K-Beauty', now(), now())
ON CONFLICT (endpoint_url) DO NOTHING;

-- JAPAN (3 feeds)
INSERT INTO public.data_feeds (id, name, endpoint_url, feed_type, category, domain, vertical, provenance_tier, poll_interval_minutes, is_enabled, health_status, consecutive_failures, signal_count, api_key_env_var, priority, tier_min, attribution_label, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'PMDA Japan Regulatory', 'https://www.pmda.go.jp/rss_008.xml', 'rss', 'regulatory', 'regulatory', 'medspa', 1, 120, true, 'healthy', 0, 0, null, 50, 'free', 'PMDA Japan Regulatory', now(), now()),
  (gen_random_uuid(), 'Tokyo Beauty Book', 'https://tokyobeautybook.com/feed', 'rss', 'trade_pub', 'skincare', 'beauty_brand', 2, 240, true, 'healthy', 0, 0, null, 50, 'free', 'Tokyo Beauty Book', now(), now()),
  (gen_random_uuid(), 'Laura Loukola J-Beauty', 'https://lauraloukola.net/blog?format=rss', 'rss', 'social', 'skincare', 'beauty_brand', 3, 240, true, 'healthy', 0, 0, null, 50, 'free', 'Laura Loukola J-Beauty', now(), now())
ON CONFLICT (endpoint_url) DO NOTHING;

-- SOUTHEAST ASIA (2 feeds)
INSERT INTO public.data_feeds (id, name, endpoint_url, feed_type, category, domain, vertical, provenance_tier, poll_interval_minutes, is_enabled, health_status, consecutive_failures, signal_count, api_key_env_var, priority, tier_min, attribution_label, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Daily Vanity Singapore', 'https://dailyvanity.sg/feed', 'rss', 'trade_pub', 'skincare', 'multi', 2, 120, true, 'healthy', 0, 0, null, 50, 'free', 'Daily Vanity Singapore', now(), now()),
  (gen_random_uuid(), 'Beauty Insider Singapore', 'https://beautyinsider.sg/feed', 'rss', 'trade_pub', 'skincare', 'multi', 2, 120, true, 'healthy', 0, 0, null, 50, 'free', 'Beauty Insider Singapore', now(), now())
ON CONFLICT (endpoint_url) DO NOTHING;

-- INDIA (1 feed)
INSERT INTO public.data_feeds (id, name, endpoint_url, feed_type, category, domain, vertical, provenance_tier, poll_interval_minutes, is_enabled, health_status, consecutive_failures, signal_count, api_key_env_var, priority, tier_min, attribution_label, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Skincare Villa India', 'https://skincarevilla.com/feed', 'rss', 'social', 'skincare', 'beauty_brand', 3, 240, true, 'healthy', 0, 0, null, 50, 'free', 'Skincare Villa India', now(), now())
ON CONFLICT (endpoint_url) DO NOTHING;

-- AUSTRALIA (1 feed)
INSERT INTO public.data_feeds (id, name, endpoint_url, feed_type, category, domain, vertical, provenance_tier, poll_interval_minutes, is_enabled, health_status, consecutive_failures, signal_count, api_key_env_var, priority, tier_min, attribution_label, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Nudie Glow AU Blog', 'https://nudieglow.com/blogs/nudieblog.atom', 'rss', 'brand_news', 'skincare', 'beauty_brand', 2, 240, true, 'healthy', 0, 0, null, 50, 'free', 'Nudie Glow AU Blog', now(), now())
ON CONFLICT (endpoint_url) DO NOTHING;

-- =============================================================================
-- PART 3: INSERT NEW FEEDS — EUROPE (10 feeds)
-- =============================================================================

-- UK (3 feeds)
INSERT INTO public.data_feeds (id, name, endpoint_url, feed_type, category, domain, vertical, provenance_tier, poll_interval_minutes, is_enabled, health_status, consecutive_failures, signal_count, api_key_env_var, priority, tier_min, attribution_label, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'PBL Magazine UK', 'https://pblmagazine.co.uk/news?format=rss', 'rss', 'trade_pub', 'skincare', 'medspa', 1, 60, true, 'healthy', 0, 0, null, 50, 'free', 'PBL Magazine UK', now(), now()),
  (gen_random_uuid(), 'Anti-Age Magazine EN', 'https://en.anti-age-magazine.com/feed', 'rss', 'trade_pub', 'skincare', 'medspa', 1, 120, true, 'healthy', 0, 0, null, 50, 'free', 'Anti-Age Magazine EN', now(), now()),
  (gen_random_uuid(), 'British Beauty Blogger', 'https://britishbeautyblogger.com/feed', 'rss', 'social', 'skincare', 'multi', 2, 240, true, 'healthy', 0, 0, null, 50, 'free', 'British Beauty Blogger', now(), now())
ON CONFLICT (endpoint_url) DO NOTHING;

-- FRANCE (3 feeds)
INSERT INTO public.data_feeds (id, name, endpoint_url, feed_type, category, domain, vertical, provenance_tier, poll_interval_minutes, is_enabled, health_status, consecutive_failures, signal_count, api_key_env_var, priority, tier_min, attribution_label, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Premium Beauty News FR', 'https://www.premiumbeautynews.com/spip.php?page=backend', 'rss', 'trade_pub', 'skincare', 'multi', 1, 60, true, 'healthy', 0, 0, null, 50, 'free', 'Premium Beauty News FR', now(), now()),
  (gen_random_uuid(), 'Anti-Age Magazine FR', 'https://anti-age-magazine.com/feed', 'rss', 'trade_pub', 'skincare', 'medspa', 1, 120, true, 'healthy', 0, 0, null, 50, 'free', 'Anti-Age Magazine FR', now(), now()),
  (gen_random_uuid(), 'Greentech Cosmetics', 'https://greentech.fr/en/feed', 'rss', 'brand_news', 'ingredients', 'beauty_brand', 2, 240, true, 'healthy', 0, 0, null, 50, 'free', 'Greentech Cosmetics', now(), now())
ON CONFLICT (endpoint_url) DO NOTHING;

-- EU REGULATORY (1 feed)
INSERT INTO public.data_feeds (id, name, endpoint_url, feed_type, category, domain, vertical, provenance_tier, poll_interval_minutes, is_enabled, health_status, consecutive_failures, signal_count, api_key_env_var, priority, tier_min, attribution_label, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'EUR-Lex Cosmetics Reg', 'https://eur-lex.europa.eu/RSSF/eu-law-new-acts?locale=en', 'rss', 'regulatory', 'regulatory', 'multi', 1, 120, true, 'healthy', 0, 0, null, 50, 'free', 'EUR-Lex Cosmetics Reg', now(), now())
ON CONFLICT (endpoint_url) DO NOTHING;

-- PAN-EUROPEAN JOURNALS (3 feeds)
INSERT INTO public.data_feeds (id, name, endpoint_url, feed_type, category, domain, vertical, provenance_tier, poll_interval_minutes, is_enabled, health_status, consecutive_failures, signal_count, api_key_env_var, priority, tier_min, attribution_label, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'JEADV Dermatology', 'https://onlinelibrary.wiley.com/feed/14683083/most-recent', 'rss', 'research', 'skincare', 'medspa', 1, 240, true, 'healthy', 0, 0, null, 50, 'free', 'JEADV Dermatology', now(), now()),
  (gen_random_uuid(), 'Intl J Cosmetic Science', 'https://onlinelibrary.wiley.com/feed/14682494/most-recent', 'rss', 'research', 'ingredients', 'multi', 1, 240, true, 'healthy', 0, 0, null, 50, 'free', 'Intl J Cosmetic Science', now(), now()),
  (gen_random_uuid(), 'Global Cosmetics News', 'https://www.globalcosmeticsnews.com/feed/', 'rss', 'trade_pub', 'skincare', 'multi', 1, 60, true, 'healthy', 0, 0, null, 50, 'free', 'Global Cosmetics News', now(), now())
ON CONFLICT (endpoint_url) DO NOTHING;

-- =============================================================================
-- PART 4: INSERT NEW FEEDS — AI + BEAUTY TECH (13 feeds)
-- =============================================================================
INSERT INTO public.data_feeds (id, name, endpoint_url, feed_type, category, domain, vertical, provenance_tier, poll_interval_minutes, is_enabled, health_status, consecutive_failures, signal_count, api_key_env_var, priority, tier_min, attribution_label, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'CosmeticsDesign USA', 'https://www.cosmeticsdesign.com/feed', 'rss', 'trade_pub', 'skincare', 'multi', 1, 60, true, 'healthy', 0, 0, null, 50, 'free', 'CosmeticsDesign USA', now(), now()),
  (gen_random_uuid(), 'CosmeticsDesign Europe', 'https://www.cosmeticsdesign-europe.com/feed', 'rss', 'trade_pub', 'skincare', 'multi', 1, 60, true, 'healthy', 0, 0, null, 50, 'free', 'CosmeticsDesign Europe', now(), now()),
  (gen_random_uuid(), 'BeautyMatter', 'https://beautymatter.com/articles/feed', 'rss', 'trade_pub', 'skincare', 'multi', 1, 120, true, 'healthy', 0, 0, null, 50, 'free', 'BeautyMatter', now(), now()),
  (gen_random_uuid(), 'Glossy (Digiday)', 'https://glossy.co/feed', 'rss', 'trade_pub', 'skincare', 'multi', 1, 60, true, 'healthy', 0, 0, null, 50, 'free', 'Glossy (Digiday)', now(), now()),
  (gen_random_uuid(), 'in-cosmetics Connect', 'https://connect.in-cosmetics.com/feed', 'rss', 'trade_pub', 'ingredients', 'multi', 1, 120, true, 'healthy', 0, 0, null, 50, 'free', 'in-cosmetics Connect', now(), now()),
  (gen_random_uuid(), 'arXiv Computer Vision', 'https://rss.arxiv.org/rss/cs.CV', 'rss', 'research', 'skincare', 'multi', 1, 1440, true, 'healthy', 0, 0, null, 50, 'free', 'arXiv Computer Vision', now(), now()),
  (gen_random_uuid(), 'arXiv AI', 'https://rss.arxiv.org/rss/cs.AI', 'rss', 'research', 'skincare', 'multi', 1, 1440, true, 'healthy', 0, 0, null, 50, 'free', 'arXiv AI', now(), now()),
  (gen_random_uuid(), 'VentureBeat AI', 'https://venturebeat.com/category/ai/feed/', 'rss', 'trade_pub', 'wellness', 'multi', 2, 120, true, 'healthy', 0, 0, null, 50, 'free', 'VentureBeat AI', now(), now()),
  (gen_random_uuid(), 'MIT Tech Review AI', 'https://www.technologyreview.com/feed/', 'rss', 'trade_pub', 'wellness', 'multi', 1, 120, true, 'healthy', 0, 0, null, 50, 'free', 'MIT Tech Review AI', now(), now()),
  (gen_random_uuid(), 'Happi Magazine', 'https://www.happi.com/rss.xml', 'rss', 'trade_pub', 'ingredients', 'multi', 1, 120, true, 'healthy', 0, 0, null, 50, 'free', 'Happi Magazine', now(), now()),
  (gen_random_uuid(), 'CIO Dive Enterprise', 'https://www.ciodive.com/feeds/news/', 'rss', 'trade_pub', 'wellness', 'multi', 2, 120, true, 'healthy', 0, 0, null, 50, 'free', 'CIO Dive Enterprise', now(), now()),
  (gen_random_uuid(), 'FDA Press Releases', 'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/press-releases/rss.xml', 'rss', 'regulatory', 'regulatory', 'medspa', 1, 60, true, 'healthy', 0, 0, null, 50, 'free', 'FDA Press Releases', now(), now()),
  (gen_random_uuid(), 'FDA MedWatch Safety', 'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/medwatch-safety-alerts/rss.xml', 'rss', 'regulatory', 'regulatory', 'medspa', 1, 60, true, 'healthy', 0, 0, null, 50, 'free', 'FDA MedWatch Safety', now(), now())
ON CONFLICT (endpoint_url) DO NOTHING;

-- =============================================================================
-- PART 5: INSERT NEW FEEDS — REDDIT RSS (8 feeds, no auth needed)
-- =============================================================================
INSERT INTO public.data_feeds (id, name, endpoint_url, feed_type, category, domain, vertical, provenance_tier, poll_interval_minutes, is_enabled, health_status, consecutive_failures, signal_count, api_key_env_var, priority, tier_min, attribution_label, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Reddit r/AsianBeauty', 'https://www.reddit.com/r/AsianBeauty/new.rss', 'rss', 'social', 'skincare', 'beauty_brand', 3, 60, true, 'healthy', 0, 0, null, 50, 'free', 'Reddit r/AsianBeauty', now(), now()),
  (gen_random_uuid(), 'Reddit r/30PlusSkinCare', 'https://www.reddit.com/r/30PlusSkinCare/new.rss', 'rss', 'social', 'skincare', 'multi', 3, 120, true, 'healthy', 0, 0, null, 50, 'free', 'Reddit r/30PlusSkinCare', now(), now()),
  (gen_random_uuid(), 'Reddit r/MakeupAddiction', 'https://www.reddit.com/r/MakeupAddiction/new.rss', 'rss', 'social', 'makeup', 'multi', 3, 120, true, 'healthy', 0, 0, null, 50, 'free', 'Reddit r/MakeupAddiction', now(), now()),
  (gen_random_uuid(), 'Reddit r/Dermatology', 'https://www.reddit.com/r/Dermatology/new.rss', 'rss', 'social', 'skincare', 'medspa', 3, 120, true, 'healthy', 0, 0, null, 50, 'free', 'Reddit r/Dermatology', now(), now()),
  (gen_random_uuid(), 'Reddit r/PlasticSurgery', 'https://www.reddit.com/r/PlasticSurgery/new.rss', 'rss', 'social', 'skincare', 'medspa', 3, 120, true, 'healthy', 0, 0, null, 50, 'free', 'Reddit r/PlasticSurgery', now(), now()),
  (gen_random_uuid(), 'Reddit r/SkincareScience', 'https://www.reddit.com/r/SkincareScience/new.rss', 'rss', 'social', 'skincare', 'multi', 3, 240, true, 'healthy', 0, 0, null, 50, 'free', 'Reddit r/SkincareScience', now(), now()),
  (gen_random_uuid(), 'Reddit r/BeautyGuruChatter', 'https://www.reddit.com/r/BeautyGuruChatter/new.rss', 'rss', 'social', 'makeup', 'multi', 3, 120, true, 'healthy', 0, 0, null, 50, 'free', 'Reddit r/BeautyGuruChatter', now(), now()),
  (gen_random_uuid(), 'Reddit r/Botox', 'https://www.reddit.com/r/Botox/new.rss', 'rss', 'social', 'skincare', 'medspa', 3, 120, true, 'healthy', 0, 0, null, 50, 'free', 'Reddit r/Botox', now(), now())
ON CONFLICT (endpoint_url) DO NOTHING;

-- =============================================================================
-- PART 6: INSERT NEW FEEDS — PUBMED + GOOGLE TRENDS + FTC (6 feeds)
-- =============================================================================
INSERT INTO public.data_feeds (id, name, endpoint_url, feed_type, category, domain, vertical, provenance_tier, poll_interval_minutes, is_enabled, health_status, consecutive_failures, signal_count, api_key_env_var, priority, tier_min, attribution_label, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'PubMed Cosmeceuticals', 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=cosmeceuticals+skincare&limit=15&format=abstract', 'rss', 'research', 'ingredients', 'multi', 1, 720, true, 'healthy', 0, 0, null, 50, 'free', 'PubMed Cosmeceuticals', now(), now()),
  (gen_random_uuid(), 'PubMed Botulinum Aesthetic', 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=botulinum+toxin+aesthetic&limit=15&format=abstract', 'rss', 'research', 'skincare', 'medspa', 1, 720, true, 'healthy', 0, 0, null, 50, 'free', 'PubMed Botulinum Aesthetic', now(), now()),
  (gen_random_uuid(), 'PubMed AI Dermatology', 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=artificial+intelligence+dermatology&limit=15&format=abstract', 'rss', 'research', 'skincare', 'medspa', 1, 720, true, 'healthy', 0, 0, null, 50, 'free', 'PubMed AI Dermatology', now(), now()),
  (gen_random_uuid(), 'PubMed Hyaluronic Filler', 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=hyaluronic+acid+dermal+filler&limit=15&format=abstract', 'rss', 'research', 'skincare', 'medspa', 1, 720, true, 'healthy', 0, 0, null, 50, 'free', 'PubMed Hyaluronic Filler', now(), now()),
  (gen_random_uuid(), 'Google Trends US', 'https://trends.google.com/trending/rss?geo=US', 'rss', 'social', 'skincare', 'multi', 2, 60, true, 'healthy', 0, 0, null, 50, 'free', 'Google Trends US', now(), now()),
  (gen_random_uuid(), 'FTC Press Releases', 'https://www.ftc.gov/feeds/press-release-consumer-protection.xml', 'rss', 'regulatory', 'regulatory', 'multi', 1, 240, true, 'healthy', 0, 0, null, 50, 'free', 'FTC Press Releases', now(), now())
ON CONFLICT (endpoint_url) DO NOTHING;

COMMIT;

-- Migration summary:
-- Part 0: Extended category CHECK to include 'research'; added UNIQUE on endpoint_url
-- Part 1: Activated 34 dormant feeds (37 qualifying minus 3 Reddit API feeds skipped)
-- Part 2: Inserted 12 APAC feeds (Korea 5, Japan 3, SEA 2, India 1, Australia 1)
-- Part 3: Inserted 10 Europe feeds (UK 3, France 3, EU Reg 1, Pan-EU Journals 3)
-- Part 4: Inserted 13 AI + Beauty Tech feeds
-- Part 5: Inserted 8 Reddit RSS feeds (no auth needed)
-- Part 6: Inserted 6 PubMed/Google/FTC feeds
-- Total: 34 activated + 49 new = 83 feeds going live (+ 3 Reddit API feeds kept disabled)
