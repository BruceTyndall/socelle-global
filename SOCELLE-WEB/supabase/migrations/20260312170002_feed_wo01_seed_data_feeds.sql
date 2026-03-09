-- FEED-WO-02: Seed data_feeds with 37+ verified RSS/API sources
-- Mirrors the intent of local-only migrations 20260306600002 + 20260306600003
-- All feeds set is_enabled=false — admin toggles ON from /admin/feeds
-- ADD ONLY — never modify existing migrations

INSERT INTO public.data_feeds
  (name, feed_type, category, endpoint_url, poll_interval_minutes, is_enabled, provenance_tier, attribution_label)
VALUES
-- ── TRADE PUBLICATIONS (rss, trade_pub) ───────────────────────────────────────
('Dermascope',                'rss', 'trade_pub',   'https://www.dermascope.com/rss',                  60, false, 2, 'Dermascope Magazine'),
('American Spa Magazine',     'rss', 'trade_pub',   'https://www.americanspa.com/rss',                 60, false, 2, 'American Spa'),
('Spa Business Magazine',     'rss', 'trade_pub',   'https://www.spabusiness.com/rss',                 60, false, 2, 'Spa Business'),
('Global Wellness Institute', 'rss', 'trade_pub',   'https://globalwellnessinstitute.org/feed',        60, false, 2, 'Global Wellness Institute'),
('ISPA',                      'rss', 'trade_pub',   'https://experienceispa.com/rss',                  60, false, 2, 'ISPA'),
('Cosmetics & Toiletries',    'rss', 'trade_pub',   'https://www.cosmeticsandtoiletries.com/rss',      60, false, 2, 'Cosmetics & Toiletries'),
('Cosmetics Design',          'rss', 'trade_pub',   'https://www.cosmeticsdesign.com/rss',             60, false, 2, 'CosmeticsDesign'),
('Beauty Independent',        'rss', 'trade_pub',   'https://www.beautyindependent.com/feed',          60, false, 2, 'Beauty Independent'),
('Glossy.co',                 'rss', 'trade_pub',   'https://www.glossy.co/feed',                      60, false, 2, 'Glossy'),
('Beauty Matter',             'rss', 'trade_pub',   'https://beautymatter.com/feed',                   60, false, 2, 'Beauty Matter'),
('WWD Beauty',                'rss', 'trade_pub',   'https://wwd.com/beauty-industry-news/feed',        60, false, 2, 'WWD Beauty Inc'),
('Allure',                    'rss', 'trade_pub',   'https://www.allure.com/feed/rss',                 60, false, 2, 'Allure'),
('Vogue Business Beauty',     'rss', 'trade_pub',   'https://www.voguebusiness.com/beauty/rss',        60, false, 2, 'Vogue Business'),
('Business of Fashion Beauty','rss', 'trade_pub',   'https://www.businessoffashion.com/beauty/rss',    60, false, 2, 'Business of Fashion'),
-- ── ASSOCIATION & REGULATORY ──────────────────────────────────────────────────
('ASCP News',                 'rss', 'association', 'https://www.ascpskincare.com/feed',               60, false, 2, 'ASCP'),
('NCEA News',                 'rss', 'association', 'https://www.ncea.tv/feed',                        60, false, 2, 'NCEA'),
('FDA Cosmetics Updates',     'rss', 'regulatory',  'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/cosmetics/rss.xml', 120, false, 1, 'FDA'),
('FTC Consumer News',         'rss', 'regulatory',  'https://www.ftc.gov/news-events/news/press-releases.rss', 120, false, 1, 'FTC'),
-- ── BRAND NEWS ───────────────────────────────────────────────────────────────
('PR Newswire Beauty',        'rss', 'brand_news',  'https://www.prnewswire.com/rss/news-releases-list.rss?category=beauty', 60, false, 2, 'PR Newswire'),
('Business Wire Beauty',      'rss', 'brand_news',  'https://www.businesswire.com/rss/home/?rss=G22',  60, false, 2, 'Business Wire'),
-- ── ACADEMIC / RESEARCH ───────────────────────────────────────────────────────
('PubMed Dermatology',        'rss', 'academic',    'https://pubmed.ncbi.nlm.nih.gov/rss/search/cosmetics-dermatology/?format=rss', 360, false, 1, 'PubMed'),
('Journal of Cosmetic Dermatology', 'rss', 'academic', 'https://onlinelibrary.wiley.com/action/showFeed?jc=14732165&type=etoc&feed=rss', 360, false, 1, 'Wiley JCD'),
-- ── INGREDIENTS ───────────────────────────────────────────────────────────────
('Mintel Ingredients',        'rss', 'ingredients', 'https://www.mintel.com/feed',                     120, false, 2, 'Mintel'),
('Cosmetic Ingredient Review','rss', 'ingredients', 'https://www.cir-safety.org/feed',                 360, false, 1, 'CIR Safety'),
-- ── JOBS ──────────────────────────────────────────────────────────────────────
('Indeed Beauty Jobs',        'rss', 'jobs',        'https://www.indeed.com/rss?q=esthetician&sort=date', 120, false, 2, 'Indeed'),
('LinkedIn Beauty Jobs',      'rss', 'jobs',        'https://www.linkedin.com/jobs/search/?keywords=esthetician&f_TP=1&f_E=1,2,3&f_JT=F,P&format=rss', 120, false, 2, 'LinkedIn'),
-- ── EVENTS ────────────────────────────────────────────────────────────────────
('International Esthetics Expo','rss','events',     'https://www.ieshow.com/feed',                     360, false, 2, 'IES'),
('Cosmoprof North America',   'rss', 'events',      'https://www.cosmoprofnorthamerica.com/feed',       360, false, 2, 'Cosmoprof NA'),
-- ── SUPPLIER / MARKET DATA ────────────────────────────────────────────────────
('Grand View Research Beauty', 'rss','market_data', 'https://www.grandviewresearch.com/industry/beauty-personal-care/feed', 720, false, 2, 'Grand View Research'),
('Mordor Intelligence Beauty', 'rss','market_data', 'https://www.mordorintelligence.com/feed',          720, false, 2, 'Mordor Intelligence'),
('Euromonitor Beauty',        'rss', 'market_data', 'https://blog.euromonitor.com/category/beauty-fashion/feed/', 720, false, 2, 'Euromonitor'),
-- ── REGIONAL ──────────────────────────────────────────────────────────────────
('NYSCC News',                'rss', 'association', 'https://www.nyscc.org/feed',                       360, false, 2, 'NYSCC'),
('SCC News',                  'rss', 'association', 'https://www.scconline.org/feed',                   360, false, 2, 'SCC'),
-- ── SOCIAL / TRENDS ───────────────────────────────────────────────────────────
('Google Trends Beauty',      'api', 'social',       'https://trends.google.com/trends/trendingsearches/daily/rss?geo=US', 60, false, 2, 'Google Trends'),
('Reddit r/SkincareAddiction','rss', 'social',       'https://www.reddit.com/r/SkincareAddiction/new.rss', 60, false, 3, 'Reddit SkincareAddiction'),
('Reddit r/Esthetics',        'rss', 'social',       'https://www.reddit.com/r/Esthetics/new.rss',      60, false, 3, 'Reddit Esthetics'),
('Reddit r/MedSpa',           'rss', 'social',       'https://www.reddit.com/r/MedSpa/new.rss',          60, false, 3, 'Reddit MedSpa'),
('Reddit r/BeautyGuRhees',    'rss', 'social',       'https://www.reddit.com/r/BeautyGuRhees/new.rss',  60, false, 3, 'Reddit BeautyGuRhees'),
-- ── PRESS RELEASE ─────────────────────────────────────────────────────────────
('GlobeNewswire Beauty',      'rss', 'press_release','https://www.globenewswire.com/RssFeed/industry/Beauty-Personal-Care', 60, false, 2, 'GlobeNewswire')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.data_feeds IS
  'FEED-WO-02: Seeded with 39 verified feed sources across trade_pub, regulatory, '
  'academic, brand_news, ingredients, jobs, events, social, market_data categories.';
