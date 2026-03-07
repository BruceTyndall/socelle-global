-- W13-04 expansion: Additional data sources from Open Source Beauty & Wellness APIs research
-- Cross-referenced against existing 102 rows — no duplicates.
-- All is_enabled = false (owner toggles ON from /admin/feeds)

-- ══════════════════════════════════════════════════════════════════════════════
-- CATEGORY: ingredients (Ingredient Databases & Safety)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, api_key_env_var, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES

-- Open Beauty Facts — 50K+ crowdsourced cosmetic products (ODbL license)
('Open Beauty Facts API', 'api', 'ingredients', 'https://world.openbeautyfacts.org/api/v0/search.json?action=process&tagtype_0=categories&tag_contains_0=contains&page_size=100&json=true', NULL, 1440, false, 2, 'Open Beauty Facts'),

-- Open Food Facts API (sister project — nutrition + ingredient cross-reference)
('Open Food Facts API', 'api', 'ingredients', 'https://world.openfoodfacts.org/api/v0/search.json?action=process&page_size=50&json=true', NULL, 1440, false, 2, 'Open Food Facts'),

-- EU CosIng Database — EU regulatory ingredient status
('EU CosIng Database', 'scraper', 'ingredients', 'https://single-market-economy.ec.europa.eu/sectors/cosmetics/cosmetic-ingredient-database_en', NULL, 10080, false, 1, 'European Commission CosIng'),

-- COSMILE Europe — 30K+ ingredients, free consumer resource
('COSMILE Europe', 'scraper', 'ingredients', 'https://www.cosmile-europe.com/', NULL, 10080, false, 2, 'COSMILE Europe / Cosmetics Europe'),

-- INCI Beauty — ingredient list with safety ratings
('INCI Beauty', 'scraper', 'ingredients', 'https://incibeauty.com/en/ingredients', NULL, 10080, false, 2, 'INCI Beauty'),

-- Makeup API — product + ingredient data (open, no key needed)
('Makeup API', 'api', 'ingredients', 'http://makeup-api.herokuapp.com/api/v1/products.json', NULL, 1440, false, 2, 'Makeup API'),

-- Kaggle Cosmetic Brand Products Dataset (periodic bulk import)
('Kaggle Cosmetic Products Dataset', 'api', 'ingredients', 'https://www.kaggle.com/datasets/shivd24coder/cosmetic-brand-products-dataset', NULL, 43200, false, 3, 'Kaggle / shivd24coder'),

-- Ingredient Parser NLP (GitHub — open source)
('Ingredient Parser NLP (GitHub)', 'api', 'ingredients', 'https://github.com/AkashSingirikonda/ingredient-parser-nlp', NULL, 43200, false, 3, 'GitHub / AkashSingirikonda'),

-- MakeupCheckAI (GitHub — AI ingredient analysis)
('MakeupCheckAI (GitHub)', 'api', 'ingredients', 'https://github.com/PriyanK7n/MakeupCheckAI', NULL, 43200, false, 3, 'GitHub / PriyanK7n');

-- ══════════════════════════════════════════════════════════════════════════════
-- CATEGORY: market_data (Wellness & Nutrition APIs)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, api_key_env_var, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES

-- API-Ninjas Nutrition — NLP calorie + macro extraction
('API-Ninjas Nutrition', 'api', 'market_data', 'https://api.api-ninjas.com/v1/nutrition', 'API_NINJAS_KEY', 1440, false, 2, 'API-Ninjas'),

-- API-Ninjas Calories Burned
('API-Ninjas Calories Burned', 'api', 'market_data', 'https://api.api-ninjas.com/v1/caloriesburned', 'API_NINJAS_KEY', 1440, false, 2, 'API-Ninjas'),

-- API-Ninjas Exercises
('API-Ninjas Exercises', 'api', 'market_data', 'https://api.api-ninjas.com/v1/exercises', 'API_NINJAS_KEY', 1440, false, 2, 'API-Ninjas'),

-- USDA FoodData Central — validated government nutrition data
('USDA FoodData Central', 'api', 'market_data', 'https://api.nal.usda.gov/fdc/v1/foods/search', 'USDA_API_KEY', 1440, false, 1, 'USDA FoodData Central'),

-- Spike Nutrition API — multi-database nutrition profiling
('Spike Nutrition API', 'api', 'market_data', 'https://api.spikeapi.com/nutrition/v1/search', 'SPIKE_API_KEY', 1440, false, 2, 'Spike Nutrition API'),

-- Edamam Nutrition API — large-scale food database
('Edamam Nutrition API', 'api', 'market_data', 'https://api.edamam.com/api/nutrition-data', 'EDAMAM_APP_KEY', 1440, false, 2, 'Edamam'),

-- Nutritionix API — grocery + restaurant nutrition
('Nutritionix API', 'api', 'market_data', 'https://trackapi.nutritionix.com/v2/natural/nutrients', 'NUTRITIONIX_API_KEY', 1440, false, 2, 'Nutritionix');

-- ══════════════════════════════════════════════════════════════════════════════
-- CATEGORY: market_data (Wearable / Biometric Intelligence)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, api_key_env_var, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES

-- Open Wearables (Momentum) — unified API for 200+ wearable devices
('Open Wearables (Momentum)', 'api', 'market_data', 'https://github.com/the-momentum/open-wearables', NULL, 43200, false, 2, 'Momentum Open Wearables'),

-- Google Fit REST API — activity + biometric data
('Google Fit REST API', 'api', 'market_data', 'https://www.googleapis.com/fitness/v1/users/me/dataSources', 'GOOGLE_FIT_KEY', 1440, false, 2, 'Google Fit'),

-- Fitbit Web API — wearable health data
('Fitbit Web API', 'api', 'market_data', 'https://api.fitbit.com/1/user/-/activities.json', 'FITBIT_API_KEY', 1440, false, 2, 'Fitbit'),

-- Oura Ring API — sleep + readiness + activity
('Oura Ring API', 'api', 'market_data', 'https://api.ouraring.com/v2/usercollection/daily_activity', 'OURA_API_KEY', 1440, false, 2, 'Oura Ring'),

-- Whoop API — strain + recovery + sleep
('Whoop API', 'api', 'market_data', 'https://api.prod.whoop.com/developer/v1/cycle', 'WHOOP_API_KEY', 1440, false, 2, 'Whoop');

-- ══════════════════════════════════════════════════════════════════════════════
-- CATEGORY: trade_pub (Industry Publications — NEW sources from research)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, api_key_env_var, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES

-- CEW News & Insights
('CEW News & Insights', 'rss', 'trade_pub', 'https://cew.org/news-insights/feed/', NULL, 60, false, 2, 'CEW'),

-- CosmeticsDesign-Europe (sister site to existing CosmeticsDesign)
('CosmeticsDesign-Europe', 'rss', 'trade_pub', 'https://www.cosmeticsdesign-europe.com/var/wrbm_gb_food_pharma/storage/original/application/rss.xml', NULL, 60, false, 2, 'CosmeticsDesign-Europe'),

-- CosmeticsDesign-Asia
('CosmeticsDesign-Asia', 'rss', 'trade_pub', 'https://www.cosmeticsdesign-asia.com/var/wrbm_gb_food_pharma/storage/original/application/rss.xml', NULL, 60, false, 2, 'CosmeticsDesign-Asia'),

-- Cosmetics Business
('Cosmetics Business', 'rss', 'trade_pub', 'https://www.cosmeticsbusiness.com/rss', NULL, 60, false, 2, 'Cosmetics Business'),

-- Cosmetics Technology (CT)
('Cosmetics Technology', 'rss', 'trade_pub', 'https://www.cosmeticsandtoiletries.com/rss', NULL, 60, false, 2, 'Cosmetics Technology'),

-- The Beauty Conversation
('The Beauty Conversation', 'rss', 'trade_pub', 'https://thebeautyconversation.com/feed/', NULL, 120, false, 2, 'The Beauty Conversation'),

-- Niche Beauty Network
('Niche Beauty Network', 'rss', 'trade_pub', 'https://nichebeautynetwork.com/feed/', NULL, 120, false, 3, 'Niche Beauty Network'),

-- Coveteur Beauty
('Coveteur Beauty', 'rss', 'trade_pub', 'https://coveteur.com/beauty/feed', NULL, 120, false, 3, 'Coveteur'),

-- The Cut — Beauty Section
('The Cut — Beauty', 'rss', 'trade_pub', 'https://www.thecut.com/beauty/rss/', NULL, 60, false, 3, 'The Cut'),

-- Refinery29 Beauty
('Refinery29 Beauty', 'rss', 'trade_pub', 'https://www.refinery29.com/en-us/beauty/rss.xml', NULL, 60, false, 3, 'Refinery29'),

-- Vogue Beauty
('Vogue Beauty', 'rss', 'trade_pub', 'https://www.vogue.com/beauty/feed/rss', NULL, 60, false, 3, 'Vogue Beauty'),

-- Cosmopolitan Beauty
('Cosmopolitan Beauty', 'rss', 'trade_pub', 'https://www.cosmopolitan.com/beauty-fashion/rss/', NULL, 120, false, 3, 'Cosmopolitan'),

-- Into The Gloss
('Into The Gloss', 'rss', 'trade_pub', 'https://intothegloss.com/feed/', NULL, 120, false, 3, 'Into The Gloss'),

-- The Strategist — Beauty
('The Strategist Beauty', 'rss', 'trade_pub', 'https://nymag.com/strategist/beauty/rss/', NULL, 120, false, 3, 'The Strategist / NY Mag');

-- ══════════════════════════════════════════════════════════════════════════════
-- CATEGORY: press_release (Press Release Networks — expanded)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, api_key_env_var, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES

-- Business Wire — Beauty & Personal Care (already have general cosmetics)
('BusinessWire — Beauty & Personal Care', 'rss', 'press_release', 'https://feed.businesswire.com/rss/home/?rss=G1QFDERJXkJeGVpYXw==', NULL, 30, false, 2, 'Business Wire'),

-- GlobeNewsWire — Personal Care
('GlobeNewsWire — Personal Care', 'rss', 'press_release', 'https://www.globenewswire.com/RssFeed/subjectcode/14-Beauty/feedTitle/GlobeNewswire%20-%20Beauty', NULL, 30, false, 2, 'GlobeNewsWire'),

-- Cision PR Web — Beauty
('Cision PRWeb — Beauty', 'rss', 'press_release', 'https://www.prweb.com/rss/beauty.xml', NULL, 60, false, 3, 'Cision PRWeb'),

-- MarketWatch Press Releases — Beauty
('MarketWatch Press — Beauty', 'rss', 'press_release', 'https://www.marketwatch.com/rss/realtimeheadlines?industry=beauty', NULL, 60, false, 3, 'MarketWatch');

-- ══════════════════════════════════════════════════════════════════════════════
-- CATEGORY: academic (Research + Clinical)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, api_key_env_var, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES

-- Cochrane Library — Systematic Reviews (skin/dermatology)
('Cochrane Skin Group', 'rss', 'academic', 'https://www.cochranelibrary.com/rss/ReviewGroup/STI', NULL, 1440, false, 1, 'Cochrane Library'),

-- Nature Reviews Dermatology
('Nature Reviews Dermatology', 'rss', 'academic', 'https://www.nature.com/natrevderm.rss', NULL, 1440, false, 1, 'Nature Reviews'),

-- MDPI Cosmetics Journal
('MDPI Cosmetics Journal', 'rss', 'academic', 'https://www.mdpi.com/rss/journal/cosmetics', NULL, 1440, false, 1, 'MDPI'),

-- Frontiers in Dermatology
('Frontiers in Dermatology', 'rss', 'academic', 'https://www.frontiersin.org/journals/dermatology/rss', NULL, 1440, false, 1, 'Frontiers'),

-- Wiley Skin Research & Technology
('Skin Research & Technology (Wiley)', 'rss', 'academic', 'https://onlinelibrary.wiley.com/feed/16000846/most-recent', NULL, 1440, false, 1, 'Wiley / Skin Research & Technology'),

-- NCBI PMC — Dermatology open access
('PMC Dermatology OA', 'api', 'academic', 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pmc&term=dermatology+cosmetic+skin+care&retmax=50&retmode=json', NULL, 1440, false, 1, 'NCBI PubMed Central');

-- ══════════════════════════════════════════════════════════════════════════════
-- CATEGORY: regulatory (Safety + Compliance — expanded)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, api_key_env_var, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES

-- Health Canada Natural Health Products Database
('Health Canada NHP Database', 'api', 'regulatory', 'https://health-products.canada.ca/api/natural-licences', NULL, 10080, false, 1, 'Health Canada'),

-- SCCS (Scientific Committee on Consumer Safety) Opinions
('EU SCCS Opinions', 'scraper', 'regulatory', 'https://health.ec.europa.eu/scientific-committees/scientific-committee-consumer-safety-sccs_en', NULL, 10080, false, 1, 'EU Scientific Committee on Consumer Safety'),

-- IFRA (International Fragrance Association) Standards
('IFRA Standards', 'scraper', 'regulatory', 'https://ifrafragrance.org/safe-use/library', NULL, 10080, false, 1, 'IFRA'),

-- PCPC (Personal Care Products Council) Updates
('PCPC Updates', 'scraper', 'regulatory', 'https://www.personalcarecouncil.org/resources/', NULL, 10080, false, 1, 'PCPC'),

-- Cosmetics Regulation Watch (EU REACH + Cosmetics Reg.)
('EU REACH Cosmetics', 'scraper', 'regulatory', 'https://echa.europa.eu/substances-restricted-under-reach', NULL, 10080, false, 1, 'ECHA / EU REACH');

-- ══════════════════════════════════════════════════════════════════════════════
-- CATEGORY: brand_news (Brand + Consumer Media — expanded)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, api_key_env_var, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES

-- Sephora Community / Beauty Insider
('Sephora Beauty Insider Blog', 'rss', 'brand_news', 'https://www.sephora.com/beauty/rss', NULL, 120, false, 3, 'Sephora'),

-- Ulta Beauty Blog
('Ulta Beauty Blog', 'rss', 'brand_news', 'https://www.ulta.com/blog/feed/', NULL, 120, false, 3, 'Ulta Beauty'),

-- Bluemercury Blog
('Bluemercury Blog', 'rss', 'brand_news', 'https://bluemercury.com/blogs/the-blue-print.atom', NULL, 240, false, 3, 'Bluemercury'),

-- SpaceNK Blog
('SpaceNK Beauty Blog', 'rss', 'brand_news', 'https://www.spacenk.com/blog/feed', NULL, 240, false, 3, 'Space NK'),

-- Paula's Choice Expert Advice
('Paulas Choice Expert Advice', 'rss', 'brand_news', 'https://www.paulaschoice.com/expert-advice/feed.xml', NULL, 1440, false, 2, 'Paulas Choice'),

-- Sunday Riley Blog
('Sunday Riley Blog', 'rss', 'brand_news', 'https://sundayriley.com/blogs/news.atom', NULL, 1440, false, 3, 'Sunday Riley'),

-- Drunk Elephant Blog
('Drunk Elephant Blog', 'rss', 'brand_news', 'https://www.drunkelephant.com/blogs/the-blend.atom', NULL, 1440, false, 3, 'Drunk Elephant'),

-- Tatcha Blog
('Tatcha Blog', 'rss', 'brand_news', 'https://www.tatcha.com/blog/feed/', NULL, 1440, false, 3, 'Tatcha'),

-- La Roche-Posay Blog
('La Roche-Posay Blog', 'rss', 'brand_news', 'https://www.laroche-posay.us/blog/feed/', NULL, 1440, false, 3, 'La Roche-Posay'),

-- CeraVe Blog
('CeraVe Blog', 'rss', 'brand_news', 'https://www.cerave.com/skin-smarts/rss', NULL, 1440, false, 3, 'CeraVe');

-- ══════════════════════════════════════════════════════════════════════════════
-- CATEGORY: social (Social + Trend Intelligence — expanded)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, api_key_env_var, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES

-- TikTok Research API (beauty hashtags)
('TikTok Research API', 'api', 'social', 'https://open.tiktokapis.com/v2/research/video/query/', 'TIKTOK_RESEARCH_KEY', 720, false, 3, 'TikTok Research API'),

-- Instagram Graph API (beauty brands tracking)
('Instagram Graph API', 'api', 'social', 'https://graph.instagram.com/v18.0/', 'INSTAGRAM_API_KEY', 720, false, 3, 'Instagram Graph API'),

-- Pinterest Trends API
('Pinterest Trends API', 'api', 'social', 'https://api.pinterest.com/v5/trends/', 'PINTEREST_API_KEY', 1440, false, 3, 'Pinterest'),

-- Twitter/X API v2 (beauty industry tracking)
('Twitter/X API v2', 'api', 'social', 'https://api.twitter.com/2/tweets/search/recent', 'TWITTER_BEARER_TOKEN', 720, false, 3, 'Twitter/X');

-- ══════════════════════════════════════════════════════════════════════════════
-- CATEGORY: association (Industry Associations — expanded)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, api_key_env_var, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES

-- Cosmetics Europe
('Cosmetics Europe', 'rss', 'association', 'https://cosmeticseurope.eu/feed/', NULL, 1440, false, 1, 'Cosmetics Europe'),

-- ICMAD (Independent Cosmetic Manufacturers and Distributors)
('ICMAD News', 'rss', 'association', 'https://www.icmad.org/feed/', NULL, 1440, false, 2, 'ICMAD'),

-- IFSCC (International Federation of Societies of Cosmetic Chemists)
('IFSCC News', 'rss', 'association', 'https://ifscc.org/feed/', NULL, 1440, false, 1, 'IFSCC'),

-- Society of Cosmetic Chemists
('SCC — Society of Cosmetic Chemists', 'rss', 'association', 'https://www.scconline.org/feed/', NULL, 1440, false, 1, 'Society of Cosmetic Chemists'),

-- Cosmetic Chemist (educational)
('The Cosmetic Chemist', 'rss', 'association', 'https://thecosmeticchemist.com/feed/', NULL, 1440, false, 2, 'The Cosmetic Chemist');

-- ══════════════════════════════════════════════════════════════════════════════
-- CATEGORY: supplier (Supply Chain + Ingredient Suppliers — expanded)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, api_key_env_var, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES

-- IFF (International Flavors & Fragrances) News
('IFF News', 'rss', 'supplier', 'https://www.iff.com/rss/news', NULL, 1440, false, 2, 'IFF'),

-- Lonza Personal Care
('Lonza Personal Care', 'rss', 'supplier', 'https://www.lonza.com/rss/news', NULL, 1440, false, 2, 'Lonza'),

-- Clariant Care Chemicals
('Clariant Care Chemicals', 'rss', 'supplier', 'https://www.clariant.com/en/Corporate/News/rss', NULL, 1440, false, 2, 'Clariant'),

-- Merck KGaA / EMD Performance Materials
('Merck KGaA Surface Solutions', 'rss', 'supplier', 'https://www.emdgroup.com/en/news/rss.xml', NULL, 1440, false, 2, 'Merck KGaA'),

-- Inolex (clean beauty ingredients)
('Inolex', 'rss', 'supplier', 'https://www.inolex.com/feed/', NULL, 1440, false, 2, 'Inolex'),

-- Hallstar Beauty
('Hallstar Beauty', 'rss', 'supplier', 'https://www.hallstar.com/feed/', NULL, 1440, false, 2, 'Hallstar'),

-- BASF Sustainability (care chemicals angle)
('BASF Sustainability News', 'rss', 'supplier', 'https://www.basf.com/global/en/media/news-releases.rss', NULL, 1440, false, 2, 'BASF');

-- ══════════════════════════════════════════════════════════════════════════════
-- CATEGORY: government (Public Health + Government — expanded)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, api_key_env_var, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES

-- WHO Global Health Observatory
('WHO Global Health Observatory', 'api', 'government', 'https://ghoapi.azureedge.net/api/', NULL, 10080, false, 1, 'WHO GHO'),

-- CDC MMWR (Morbidity + Mortality Weekly)
('CDC MMWR Reports', 'rss', 'government', 'https://tools.cdc.gov/api/v2/resources/media/rss/316422.rss', NULL, 1440, false, 1, 'CDC MMWR'),

-- NIH NCCIH (Complementary & Integrative Health)
('NIH NCCIH News', 'rss', 'government', 'https://www.nccih.nih.gov/news/rss', NULL, 1440, false, 1, 'NIH NCCIH'),

-- EPA Chemical Safety
('EPA Chemical Safety', 'rss', 'government', 'https://www.epa.gov/feeds/press-releases-headquarters-rss-feed', NULL, 1440, false, 1, 'US EPA'),

-- NIOSH (Occupational Safety — salon/spa workers)
('NIOSH Occupational Safety', 'rss', 'government', 'https://www.cdc.gov/niosh/rss/index.html', NULL, 1440, false, 1, 'CDC NIOSH');

-- ══════════════════════════════════════════════════════════════════════════════
-- CATEGORY: events (Industry Events — expanded)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, api_key_env_var, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES

-- in-cosmetics Global Events
('in-cosmetics Global', 'scraper', 'events', 'https://www.in-cosmetics.com/global/en-gb.html', NULL, 10080, false, 2, 'in-cosmetics Global'),

-- Cosmoprof Worldwide
('Cosmoprof Worldwide', 'scraper', 'events', 'https://www.cosmoprof.com/', NULL, 10080, false, 2, 'Cosmoprof'),

-- Innocos Events (innovation + cosmetics)
('Innocos Summit', 'scraper', 'events', 'https://innocosevents.com/', NULL, 10080, false, 2, 'Innocos'),

-- IFSCC Congress
('IFSCC Congress', 'scraper', 'events', 'https://ifscc.org/events/', NULL, 10080, false, 1, 'IFSCC'),

-- CEW Beauty Insider Awards
('CEW Beauty Awards', 'scraper', 'events', 'https://cew.org/awards/', NULL, 10080, false, 2, 'CEW'),

-- Premiere Beauty Show
('Premiere Beauty Show', 'scraper', 'events', 'https://premierebeautyshow.com/', NULL, 10080, false, 2, 'Premiere Beauty Show'),

-- Face & Body Expo
('Face & Body Expo', 'scraper', 'events', 'https://www.faceandbody.com/', NULL, 10080, false, 2, 'Face & Body Expo'),

-- MakeUp in... events series
('MakeUp in Events', 'scraper', 'events', 'https://www.makeup-in.com/', NULL, 10080, false, 2, 'MakeUp in'),

-- PCPC Annual Meeting
('PCPC Annual Meeting', 'scraper', 'events', 'https://www.personalcarecouncil.org/events/', NULL, 10080, false, 1, 'PCPC');

-- ══════════════════════════════════════════════════════════════════════════════
-- CATEGORY: regional (Regional Beauty Markets — expanded)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, api_key_env_var, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES

-- K-Beauty Insight (Korea)
('K-Beauty Insight', 'rss', 'regional', 'https://www.cosmeticsdesign-asia.com/RSS/Feed/K-beauty', NULL, 120, false, 2, 'CosmeticsDesign-Asia / K-Beauty'),

-- Japan Cosmetic Industry Association
('JCIA News (Japan)', 'scraper', 'regional', 'https://www.jcia.org/english/', NULL, 10080, false, 1, 'JCIA'),

-- Beauty Packaging India
('Beauty Packaging India', 'rss', 'regional', 'https://www.indianretailer.com/beauty/feed', NULL, 240, false, 3, 'Indian Retailer Beauty'),

-- China Beauty Market (Jing Daily)
('Jing Daily — Beauty', 'rss', 'regional', 'https://jingdaily.com/beauty/feed/', NULL, 120, false, 2, 'Jing Daily'),

-- Mintel Beauty & Personal Care
('Mintel Beauty Reports', 'scraper', 'regional', 'https://www.mintel.com/beauty-personal-care/', NULL, 10080, false, 2, 'Mintel'),

-- Euromonitor Beauty & Personal Care
('Euromonitor Beauty', 'scraper', 'regional', 'https://www.euromonitor.com/beauty-and-personal-care', NULL, 10080, false, 2, 'Euromonitor');

-- ══════════════════════════════════════════════════════════════════════════════
-- CATEGORY: jobs (Additional Job Sources)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO data_feeds (name, feed_type, category, endpoint_url, api_key_env_var, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES

-- LinkedIn Jobs API (beauty industry)
('LinkedIn Jobs API', 'api', 'jobs', 'https://api.linkedin.com/v2/jobSearch', 'LINKEDIN_API_KEY', 720, false, 2, 'LinkedIn'),

-- Indeed Job Search API
('Indeed Job Search', 'api', 'jobs', 'https://apis.indeed.com/ads/apisearch', 'INDEED_API_KEY', 720, false, 2, 'Indeed'),

-- ZipRecruiter API
('ZipRecruiter API', 'api', 'jobs', 'https://api.ziprecruiter.com/jobs/v1', 'ZIPRECRUITER_API_KEY', 720, false, 2, 'ZipRecruiter'),

-- Glassdoor Jobs API
('Glassdoor Jobs API', 'api', 'jobs', 'https://api.glassdoor.com/api/api.htm', 'GLASSDOOR_API_KEY', 1440, false, 2, 'Glassdoor');
