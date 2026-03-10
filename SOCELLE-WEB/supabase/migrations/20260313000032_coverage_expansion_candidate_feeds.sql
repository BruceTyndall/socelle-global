-- COVERAGE-EXPANSION-01 Phase 2: Candidate feed inserts for underrepresented domains
-- Authority: COVERAGE-EXPANSION-01 work order
-- Domains targeted: nails, makeup, fragrance, bodycare, education_training
-- + spa_hospitality hotel/resort expansion
--
-- Strategy:
--   hero feeds (is_enabled=true): high-confidence, known-working RSS endpoints
--   candidate feeds (is_enabled=false): valid sources, validate before enabling
--
-- Safe to re-run: all inserts use WHERE NOT EXISTS guard

-- ─── NAILS ──────────────────────────────────────────────────────────────────

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Nails Magazine', 'rss', 'trade_pub', 'https://www.nailsmag.com/feed', 'salon', 'nails', 1, 'free', true, 10, 'healthy', 60
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Nails Magazine');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Scratch Magazine', 'rss', 'trade_pub', 'https://www.scratchmagazine.co.uk/feed', 'salon', 'nails', 1, 'free', true, 20, 'healthy', 60
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Scratch Magazine');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Nail Pro Magazine', 'rss', 'trade_pub', 'https://www.nailpro.com/feed', 'salon', 'nails', 1, 'free', true, 30, 'healthy', 60
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Nail Pro Magazine');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Nailpro UK', 'rss', 'trade_pub', 'https://www.nailpro.co.uk/feed', 'salon', 'nails', 2, 'free', false, 40, 'degraded', 120
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Nailpro UK');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'The Nail Hub', 'rss', 'trade_pub', 'https://www.thenailhub.com/feed', 'salon', 'nails', 2, 'free', false, 50, 'degraded', 120
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'The Nail Hub');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'CND Education Blog', 'rss', 'brand_news', 'https://www.cnd.com/blog/feed', 'salon', 'nails', 2, 'free', false, 60, 'degraded', 120
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'CND Education Blog');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'OPI Pro Blog', 'rss', 'brand_news', 'https://www.opi.com/blog/feed', 'salon', 'nails', 2, 'paid', false, 70, 'degraded', 120
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'OPI Pro Blog');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'NailGeek Blog', 'rss', 'trade_pub', 'https://www.nailgeek.com/feed', 'salon', 'nails', 3, 'free', false, 80, 'degraded', 120
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'NailGeek Blog');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Reddit r/Nails', 'rss', 'social', 'https://www.reddit.com/r/Nails/new.rss', 'salon', 'nails', 3, 'free', false, 90, 'degraded', 60
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Reddit r/Nails');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Reddit r/NailArt', 'rss', 'social', 'https://www.reddit.com/r/NailArt/new.rss', 'salon', 'nails', 3, 'free', false, 100, 'degraded', 60
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Reddit r/NailArt');

-- ─── MAKEUP ─────────────────────────────────────────────────────────────────

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Into The Gloss', 'rss', 'trade_pub', 'https://intothegloss.com/feed', 'multi', 'makeup', 1, 'free', true, 10, 'healthy', 60
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Into The Gloss');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Byrdie Beauty', 'rss', 'trade_pub', 'https://www.byrdie.com/feed', 'multi', 'makeup', 1, 'free', true, 20, 'healthy', 60
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Byrdie Beauty');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Temptalia', 'rss', 'trade_pub', 'https://www.temptalia.com/feed', 'multi', 'makeup', 1, 'free', true, 30, 'healthy', 60
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Temptalia');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Makeup.com Blog', 'rss', 'trade_pub', 'https://www.makeup.com/blog/feed', 'multi', 'makeup', 2, 'free', true, 40, 'healthy', 60
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Makeup.com Blog');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Refinery29 Beauty', 'rss', 'trade_pub', 'https://www.refinery29.com/en-us/beauty/rss.xml', 'multi', 'makeup', 1, 'free', true, 50, 'healthy', 60
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Refinery29 Beauty');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Cosmopolitan Beauty', 'rss', 'trade_pub', 'https://www.cosmopolitan.com/beauty-hair/rss/', 'multi', 'makeup', 1, 'free', false, 60, 'degraded', 60
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Cosmopolitan Beauty');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'The Beauty Department', 'rss', 'trade_pub', 'https://www.thebeautydepartment.com/feed', 'multi', 'makeup', 2, 'free', false, 70, 'degraded', 120
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'The Beauty Department');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Allure Makeup', 'rss', 'trade_pub', 'https://www.allure.com/feed/makeup/rss', 'multi', 'makeup', 1, 'free', false, 80, 'degraded', 60
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Allure Makeup');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Beautylish News', 'rss', 'trade_pub', 'https://www.beautylish.com/articles/feed', 'multi', 'makeup', 2, 'free', false, 90, 'degraded', 120
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Beautylish News');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Makeup Artists Guild Blog', 'rss', 'association', 'https://www.iatse706.org/feed/', 'multi', 'makeup', 2, 'paid', false, 100, 'degraded', 120
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Makeup Artists Guild Blog');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'The Cut Beauty', 'rss', 'trade_pub', 'https://www.thecut.com/beauty/rss.xml', 'multi', 'makeup', 1, 'free', false, 110, 'degraded', 60
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'The Cut Beauty');

-- ─── FRAGRANCE ──────────────────────────────────────────────────────────────

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Fragrantica News', 'rss', 'trade_pub', 'https://www.fragrantica.com/news/rss.php', 'beauty_brand', 'fragrance', 1, 'free', true, 10, 'healthy', 120
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Fragrantica News');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Basenotes Fragrance News', 'rss', 'trade_pub', 'https://basenotes.com/news/rss', 'beauty_brand', 'fragrance', 1, 'free', true, 20, 'healthy', 120
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Basenotes Fragrance News');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'The Perfume Society', 'rss', 'trade_pub', 'https://perfumesociety.org/feed/', 'beauty_brand', 'fragrance', 1, 'free', false, 30, 'degraded', 120
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'The Perfume Society');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Perfumer & Flavorist Plus', 'rss', 'trade_pub', 'https://www.perfumerflavorist.com/category/fragrance/feed', 'beauty_brand', 'fragrance', 1, 'paid', false, 40, 'degraded', 120
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Perfumer & Flavorist Plus');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'The Scent Blog', 'rss', 'trade_pub', 'https://thescentblog.com/feed/', 'beauty_brand', 'fragrance', 3, 'free', false, 50, 'degraded', 240
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'The Scent Blog');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Esxence Fragrance News', 'rss', 'events', 'https://www.esxence.com/feed/', 'beauty_brand', 'fragrance', 2, 'paid', false, 60, 'degraded', 240
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Esxence Fragrance News');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Reddit r/fragrance', 'rss', 'social', 'https://www.reddit.com/r/fragrance/new.rss', 'beauty_brand', 'fragrance', 3, 'free', false, 70, 'degraded', 60
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Reddit r/fragrance');

-- ─── BODYCARE ────────────────────────────────────────────────────────────────

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'MindBodyGreen', 'rss', 'trade_pub', 'https://www.mindbodygreen.com/rss', 'multi', 'bodycare', 1, 'free', true, 10, 'healthy', 60
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'MindBodyGreen');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Shape Magazine Beauty', 'rss', 'trade_pub', 'https://www.shape.com/feeds/all', 'multi', 'bodycare', 1, 'free', true, 20, 'healthy', 60
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Shape Magazine Beauty');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Women''s Health Beauty', 'rss', 'trade_pub', 'https://www.womenshealthmag.com/beauty/rss/', 'multi', 'bodycare', 1, 'free', false, 30, 'degraded', 60
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Women''s Health Beauty');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'SELF Magazine Beauty', 'rss', 'trade_pub', 'https://www.self.com/skin-care/rss', 'multi', 'bodycare', 1, 'free', false, 40, 'degraded', 60
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'SELF Magazine Beauty');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Healthline Beauty', 'rss', 'trade_pub', 'https://www.healthline.com/rss/health-topics', 'multi', 'bodycare', 1, 'free', false, 50, 'degraded', 60
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Healthline Beauty');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Organic Beauty Talk', 'rss', 'trade_pub', 'https://organicbeautytalk.com/feed/', 'multi', 'bodycare', 2, 'free', false, 60, 'degraded', 120
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Organic Beauty Talk');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Body Positive Blog – NAHA', 'rss', 'association', 'https://naha.org/feed/', 'salon', 'bodycare', 2, 'free', false, 70, 'degraded', 240
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Body Positive Blog – NAHA');

-- ─── EDUCATION & TRAINING ────────────────────────────────────────────────────

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Milady Pro Blog', 'rss', 'trade_pub', 'https://www.miladypro.com/blog/feed', 'multi', 'education_training', 1, 'free', true, 10, 'healthy', 120
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Milady Pro Blog');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Pivot Point International Blog', 'rss', 'trade_pub', 'https://pivot-point.com/blog/feed/', 'salon', 'education_training', 1, 'free', true, 20, 'healthy', 120
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Pivot Point International Blog');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'NCEA Education News', 'rss', 'association', 'https://www.ncea.tv/education/feed', 'salon', 'education_training', 1, 'free', false, 30, 'degraded', 120
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'NCEA Education News');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Paul Mitchell Schools Blog', 'rss', 'trade_pub', 'https://www.paulmitchell.edu/blog/feed', 'salon', 'education_training', 2, 'free', false, 40, 'degraded', 120
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Paul Mitchell Schools Blog');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'American Beauty Association News', 'rss', 'association', 'https://www.probeauty.org/feed/', 'multi', 'education_training', 1, 'free', false, 50, 'degraded', 120
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'American Beauty Association News');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'CIDESCO International News', 'rss', 'association', 'https://cidesco.com/feed/', 'medspa', 'education_training', 1, 'paid', false, 60, 'degraded', 240
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'CIDESCO International News');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Beauty Schools Directory Blog', 'rss', 'trade_pub', 'https://www.beautyschoolsdirectory.com/blog/feed/', 'multi', 'education_training', 2, 'free', false, 70, 'degraded', 240
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Beauty Schools Directory Blog');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'CE Zoom Aesthetics Blog', 'rss', 'trade_pub', 'https://www.cezoom.com/blog/feed/', 'medspa', 'education_training', 2, 'free', false, 80, 'degraded', 240
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'CE Zoom Aesthetics Blog');

-- ─── SPA_HOSPITALITY — Hotel & Resort Expansion ───────────────────────────

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Hotel Management Magazine', 'rss', 'trade_pub', 'https://www.hotelmanagement.net/rss', 'multi', 'spa_hospitality', 1, 'free', true, 110, 'healthy', 60
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Hotel Management Magazine');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Lodging Magazine', 'rss', 'trade_pub', 'https://lodgingmagazine.com/feed/', 'multi', 'spa_hospitality', 1, 'free', true, 120, 'healthy', 60
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Lodging Magazine');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Skift Wellness Travel', 'rss', 'trade_pub', 'https://skift.com/category/wellness-travel/feed/', 'multi', 'spa_hospitality', 1, 'paid', true, 130, 'healthy', 60
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Skift Wellness Travel');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Hospitality Net Spa News', 'rss', 'trade_pub', 'https://www.hospitalitynet.org/category/spa_wellness/rss.xml', 'multi', 'spa_hospitality', 1, 'free', true, 140, 'healthy', 60
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Hospitality Net Spa News');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Resort + Recreation Magazine', 'rss', 'trade_pub', 'https://www.resortandrecreation.com/feed', 'multi', 'spa_hospitality', 2, 'free', false, 150, 'degraded', 120
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Resort + Recreation Magazine');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Condé Nast Traveler Spa', 'rss', 'trade_pub', 'https://www.cntraveler.com/tag/spa/rss', 'multi', 'spa_hospitality', 2, 'free', false, 160, 'degraded', 120
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Condé Nast Traveler Spa');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Preferred Hotels Spa Blog', 'rss', 'trade_pub', 'https://preferredhotels.com/blog/feed/', 'multi', 'spa_hospitality', 2, 'paid', false, 170, 'degraded', 240
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Preferred Hotels Spa Blog');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Wellness Tourism Association', 'rss', 'association', 'https://www.wellnesstourismassociation.org/feed/', 'multi', 'spa_hospitality', 1, 'free', false, 180, 'degraded', 240
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Wellness Tourism Association');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Luxury SpaFinder Blog', 'rss', 'trade_pub', 'https://blog.spafinder.com/feed/', 'multi', 'spa_hospitality', 1, 'free', false, 190, 'degraded', 120
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Luxury SpaFinder Blog');

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, vertical, domain, provenance_tier, tier_min, is_enabled, display_order, health_status, poll_interval_minutes)
SELECT 'Forbes Travel Guide Spa', 'rss', 'trade_pub', 'https://www.forbestravelguide.com/rss', 'multi', 'spa_hospitality', 1, 'paid', false, 200, 'degraded', 240
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Forbes Travel Guide Spa');

-- ─── SUMMARY comment ────────────────────────────────────────────────────────
-- Feeds inserted by domain:
--   nails:              10 (3 enabled heroes)
--   makeup:             11 (5 enabled heroes)
--   fragrance:           7 (2 enabled heroes)
--   bodycare:            7 (2 enabled heroes)
--   education_training:  8 (2 enabled heroes)
--   spa_hospitality:    10 (4 enabled heroes)
-- Total new: 53 candidates / 18 enabled heroes
-- After insertion: run feed-orchestrator against new hero feeds
-- then run intelligence-merchandiser audit to verify domain coverage
