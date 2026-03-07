-- W13-04: Seed data_feeds with 100+ free RSS/API sources
-- ALL is_enabled = false — owner toggles ON from /admin/feeds
-- Provenance tiers per SOCELLE_DATA_PROVENANCE_POLICY.md

-- ============================================================
-- RSS TRADE PUBLICATIONS (category='trade_pub', poll=60min)
-- ============================================================
INSERT INTO data_feeds (name, feed_type, category, endpoint_url, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES
('Dermascope', 'rss', 'trade_pub', 'https://www.dermascope.com/rss', 60, false, 2, 'Dermascope Magazine'),
('American Spa Magazine', 'rss', 'trade_pub', 'https://www.americanspa.com/rss', 60, false, 2, 'American Spa'),
('Spa Business Magazine', 'rss', 'trade_pub', 'https://www.spabusiness.com/rss', 60, false, 2, 'Spa Business'),
('Global Wellness Institute', 'rss', 'trade_pub', 'https://globalwellnessinstitute.org/feed', 60, false, 2, 'Global Wellness Institute'),
('ISPA', 'rss', 'trade_pub', 'https://experienceispa.com/rss', 60, false, 2, 'ISPA'),
('Cosmetics & Toiletries', 'rss', 'trade_pub', 'https://www.cosmeticsandtoiletries.com/rss', 60, false, 2, 'Cosmetics & Toiletries'),
('Cosmetics Design', 'rss', 'trade_pub', 'https://www.cosmeticsdesign.com/rss', 60, false, 2, 'CosmeticsDesign'),
('Beauty Independent', 'rss', 'trade_pub', 'https://www.beautyindependent.com/feed', 60, false, 2, 'Beauty Independent'),
('Glossy.co', 'rss', 'trade_pub', 'https://www.glossy.co/feed', 60, false, 2, 'Glossy'),
('Beauty Matter', 'rss', 'trade_pub', 'https://beautymatter.com/feed', 60, false, 2, 'Beauty Matter'),
('WWD Beauty', 'rss', 'trade_pub', 'https://wwd.com/beauty-industry-news/feed', 60, false, 2, 'WWD Beauty Inc'),
('Allure', 'rss', 'trade_pub', 'https://www.allure.com/feed/rss', 60, false, 2, 'Allure'),
('Byrdie', 'rss', 'trade_pub', 'https://www.byrdie.com/feed', 60, false, 2, 'Byrdie'),
('MedEsthetics', 'rss', 'trade_pub', 'https://www.medestheticsmag.com/rss', 60, false, 2, 'MedEsthetics Magazine'),
('Dermatology Times', 'rss', 'trade_pub', 'https://www.dermatologytimes.com/rss', 60, false, 2, 'Dermatology Times'),
('Practical Dermatology', 'rss', 'trade_pub', 'https://practicaldermatology.com/rss', 60, false, 2, 'Practical Dermatology'),
('The Dermatologist', 'rss', 'trade_pub', 'https://www.the-dermatologist.com/rss', 60, false, 2, 'The Dermatologist'),
('SkinInc', 'rss', 'trade_pub', 'https://www.skininc.com/rss', 60, false, 2, 'Skin Inc.'),
('Modern Salon/Spa', 'rss', 'trade_pub', 'https://www.modernsalon.com/rss', 60, false, 2, 'Modern Salon');

-- ============================================================
-- RSS REGULATORY (category='regulatory', poll=60min)
-- ============================================================
INSERT INTO data_feeds (name, feed_type, category, endpoint_url, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES
('FDA MedWatch Safety Alerts', 'rss', 'regulatory', 'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/medwatch/rss.xml', 60, false, 1, 'U.S. FDA MedWatch'),
('FDA Cosmetics Guidance', 'rss', 'regulatory', 'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/cosmetics/rss.xml', 60, false, 1, 'U.S. FDA Cosmetics'),
('Health Canada Recalls & Alerts', 'rss', 'regulatory', 'https://recalls-rappels.canada.ca/en/feed/recent', 60, false, 1, 'Health Canada'),
('TGA Safety (Australia)', 'rss', 'regulatory', 'https://www.tga.gov.au/news/rss.xml', 60, false, 1, 'Therapeutic Goods Administration (AU)'),
('EU RAPEX Consumer Alerts', 'rss', 'regulatory', 'https://ec.europa.eu/consumers/consumers_safety/safety_products/rapex/alerts/repository/content/pages/rapex/index_en.htm/rss', 60, false, 1, 'EU Safety Gate (RAPEX)'),
('FTC Press Releases', 'rss', 'regulatory', 'https://www.ftc.gov/feeds/press-release-consumer-protection.xml', 60, false, 1, 'Federal Trade Commission');

-- ============================================================
-- RSS ACADEMIC (category='academic', poll=60min)
-- ============================================================
INSERT INTO data_feeds (name, feed_type, category, endpoint_url, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES
('JAMA Dermatology', 'rss', 'academic', 'https://jamanetwork.com/rss/site_136/67.xml', 60, false, 1, 'JAMA Dermatology'),
('Journal of Cosmetic Dermatology', 'rss', 'academic', 'https://onlinelibrary.wiley.com/feed/14732165/most-recent', 60, false, 1, 'Journal of Cosmetic Dermatology');

-- ============================================================
-- RSS PRESS RELEASES (category='press_release', poll=60min)
-- ============================================================
INSERT INTO data_feeds (name, feed_type, category, endpoint_url, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES
('PRNewswire — Beauty & Personal Care', 'rss', 'press_release', 'https://www.prnewswire.com/rss/consumer-products-and-retail/beauty-and-personal-care.rss', 60, false, 2, 'PR Newswire'),
('BusinessWire — Personal Care', 'rss', 'press_release', 'https://feed.businesswire.com/rss/home/?rss=G1QFDERJXkJeGVpTWw==', 60, false, 2, 'Business Wire'),
('GlobeNewsWire — Health & Beauty', 'rss', 'press_release', 'https://www.globenewswire.com/RssFeed/subjectcode/14-Health/feedTitle/GlobeNewswire%20-%20Health', 60, false, 2, 'GlobeNewsWire');

-- ============================================================
-- RSS BRAND NEWS / BLOGS (category='brand_news', poll=60min)
-- ============================================================
INSERT INTO data_feeds (name, feed_type, category, endpoint_url, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES
('Naturopathica Blog', 'rss', 'brand_news', 'https://www.naturopathica.com/blogs/journal.atom', 60, false, 1, 'Naturopathica'),
('Dermalogica Blog', 'rss', 'brand_news', 'https://www.dermalogica.com/blogs/skin-health.atom', 60, false, 1, 'Dermalogica'),
('SkinCeuticals Blog', 'rss', 'brand_news', 'https://www.skinceuticals.com/blog/rss', 60, false, 1, 'SkinCeuticals'),
('iS Clinical Blog', 'rss', 'brand_news', 'https://www.isclinical.com/blog/rss', 60, false, 1, 'iS Clinical'),
('PCA Skin Blog', 'rss', 'brand_news', 'https://www.pcaskin.com/blog/rss', 60, false, 1, 'PCA Skin'),
('Eminence Organics Blog', 'rss', 'brand_news', 'https://eminenceorganics.com/blog/feed', 60, false, 1, 'Eminence Organics'),
('HydraFacial Blog', 'rss', 'brand_news', 'https://www.hydrafacial.com/blog/feed', 60, false, 1, 'HydraFacial'),
('Image Skincare Blog', 'rss', 'brand_news', 'https://imageskincare.com/blogs/the-image-blog.atom', 60, false, 1, 'Image Skincare'),
('ZO Skin Health Blog', 'rss', 'brand_news', 'https://zoskinhealth.com/blog/feed', 60, false, 1, 'ZO Skin Health'),
('Obagi Blog', 'rss', 'brand_news', 'https://www.obagi.com/blog/rss', 60, false, 1, 'Obagi Medical'),
('EltaMD Blog', 'rss', 'brand_news', 'https://eltamd.com/blog/feed', 60, false, 1, 'EltaMD');

-- ============================================================
-- RSS ASSOCIATIONS (category='association', poll=60min)
-- ============================================================
INSERT INTO data_feeds (name, feed_type, category, endpoint_url, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES
('AmSpa (American Med Spa Association)', 'rss', 'association', 'https://www.americanmedspa.org/feed', 60, false, 2, 'AmSpa'),
('CIDESCO International', 'rss', 'association', 'https://www.cidesco.com/feed', 60, false, 2, 'CIDESCO'),
('NCEA (National Coalition of Estheticians)', 'rss', 'association', 'https://www.ncea.tv/feed', 60, false, 2, 'NCEA'),
('ASCP (Associated Skin Care Professionals)', 'rss', 'association', 'https://www.ascpskincare.com/feed', 60, false, 2, 'ASCP'),
('ABMP (Associated Bodywork & Massage)', 'rss', 'association', 'https://www.abmp.com/feed', 60, false, 2, 'ABMP'),
('Day Spa Association', 'rss', 'association', 'https://www.dayspaassociation.com/feed', 60, false, 2, 'Day Spa Association');

-- ============================================================
-- RSS REGIONAL (category='regional', poll=60min)
-- ============================================================
INSERT INTO data_feeds (name, feed_type, category, endpoint_url, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES
('Aesthetics Journal (UK)', 'rss', 'regional', 'https://aestheticsjournal.com/feed', 60, false, 2, 'Aesthetics Journal UK'),
('Beauty Biz (AU)', 'rss', 'regional', 'https://www.beautybiz.com.au/feed', 60, false, 2, 'Beauty Biz Australia'),
('Professional Beauty UK', 'rss', 'regional', 'https://www.professionalbeauty.co.uk/feed', 60, false, 2, 'Professional Beauty UK'),
('Professional Beauty AU', 'rss', 'regional', 'https://www.professionalbeauty.com.au/feed', 60, false, 2, 'Professional Beauty Australia'),
('Spa + Clinic AU', 'rss', 'regional', 'https://www.spaandclinic.com.au/feed', 60, false, 2, 'Spa + Clinic Australia'),
('Canadian Spa Magazine', 'rss', 'regional', 'https://canadianspamagazine.com/feed', 60, false, 2, 'Canadian Spa Magazine');

-- ============================================================
-- RSS SUPPLIER / INGREDIENTS (category='supplier', poll=60min)
-- ============================================================
INSERT INTO data_feeds (name, feed_type, category, endpoint_url, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES
('BASF Care Chemicals', 'rss', 'supplier', 'https://www.carechem.basf.com/feed', 60, false, 2, 'BASF Care Chemicals'),
('Ashland Specialty Ingredients', 'rss', 'supplier', 'https://www.ashland.com/feed', 60, false, 2, 'Ashland'),
('Evonik Care Solutions', 'rss', 'supplier', 'https://personal-care.evonik.com/feed', 60, false, 2, 'Evonik'),
('DSM-Firmenich Personal Care', 'rss', 'supplier', 'https://www.dsm-firmenich.com/personal-care/feed', 60, false, 2, 'DSM-Firmenich'),
('Seppic', 'rss', 'supplier', 'https://www.seppic.com/feed', 60, false, 2, 'Seppic'),
('Lubrizol Life Science Beauty', 'rss', 'supplier', 'https://www.lubrizol.com/Life-Science/Beauty/feed', 60, false, 2, 'Lubrizol'),
('Croda Personal Care', 'rss', 'supplier', 'https://www.crodapersonalcare.com/feed', 60, false, 2, 'Croda'),
('Symrise', 'rss', 'supplier', 'https://www.symrise.com/feed', 60, false, 2, 'Symrise'),
('Givaudan Active Beauty', 'rss', 'supplier', 'https://www.givaudan.com/fragrance-beauty/active-beauty/feed', 60, false, 2, 'Givaudan');

-- ============================================================
-- API GOVERNMENT (category='government', feed_type='api', poll=1440min/daily)
-- ============================================================
INSERT INTO data_feeds (name, feed_type, category, endpoint_url, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES
('openFDA MAUDE (Device Events)', 'api', 'government', 'https://api.fda.gov/device/event.json', 1440, false, 2, 'openFDA'),
('openFDA Drug Labels', 'api', 'government', 'https://api.fda.gov/drug/label.json', 1440, false, 2, 'openFDA'),
('openFDA Drug Enforcement / Recalls', 'api', 'government', 'https://api.fda.gov/drug/enforcement.json', 1440, false, 2, 'openFDA'),
('CPSC Recalls (SaferProducts.gov)', 'api', 'government', 'https://www.saferproducts.gov/RestWebServices/Recall', 1440, false, 2, 'CPSC SaferProducts'),
('ClinicalTrials.gov', 'api', 'government', 'https://clinicaltrials.gov/api/v2/studies', 1440, false, 2, 'ClinicalTrials.gov'),
('PubMed E-Utilities', 'api', 'government', 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi', 1440, false, 2, 'NCBI PubMed'),
('USPTO PatentsView', 'api', 'government', 'https://api.patentsview.org/patents/query', 1440, false, 2, 'USPTO PatentsView'),
('BLS (Bureau of Labor Statistics)', 'api', 'government', 'https://api.bls.gov/publicAPI/v2/timeseries/data/', 1440, false, 2, 'U.S. Bureau of Labor Statistics'),
('Census Business Patterns', 'api', 'government', 'https://api.census.gov/data/2021/cbp', 1440, false, 2, 'U.S. Census Bureau'),
('SEC EDGAR Full-Text Search', 'api', 'government', 'https://efts.sec.gov/LATEST/search-index', 1440, false, 2, 'SEC EDGAR');

-- ============================================================
-- API MARKET DATA / INTELLIGENCE (category='market_data', feed_type='api', poll=240min)
-- ============================================================
INSERT INTO data_feeds (name, feed_type, category, endpoint_url, api_key_env_var, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES
('Google Trends', 'api', 'market_data', 'https://trends.google.com/trends/api/dailytrends', 'GOOGLE_CLOUD_KEY', 240, false, 3, 'Google Trends'),
('NewsAPI', 'api', 'market_data', 'https://newsapi.org/v2/everything', 'NEWSAPI_KEY', 240, false, 2, 'NewsAPI'),
('GNews', 'api', 'market_data', 'https://gnews.io/api/v4/search', 'GNEWS_KEY', 240, false, 2, 'GNews'),
('Google Places', 'api', 'market_data', 'https://maps.googleapis.com/maps/api/place/textsearch/json', 'GOOGLE_CLOUD_KEY', 240, false, 2, 'Google Places'),
('Yelp Fusion', 'api', 'market_data', 'https://api.yelp.com/v3/businesses/search', 'YELP_API_KEY', 240, false, 2, 'Yelp'),
('YouTube Data API', 'api', 'market_data', 'https://www.googleapis.com/youtube/v3/search', 'GOOGLE_CLOUD_KEY', 240, false, 3, 'YouTube'),
('Reddit (via OAuth)', 'api', 'market_data', 'https://oauth.reddit.com/r/SkincareAddiction/new.json', 'REDDIT_CLIENT_ID', 240, false, 3, 'Reddit');

-- ============================================================
-- API SOCIAL (category='social', feed_type='api', poll=240min)
-- ============================================================
INSERT INTO data_feeds (name, feed_type, category, endpoint_url, api_key_env_var, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES
('Reddit r/Esthetics', 'api', 'social', 'https://oauth.reddit.com/r/Esthetics/new.json', 'REDDIT_CLIENT_ID', 240, false, 3, 'Reddit r/Esthetics'),
('Reddit r/MedSpa', 'api', 'social', 'https://oauth.reddit.com/r/MedSpa/new.json', 'REDDIT_CLIENT_ID', 240, false, 3, 'Reddit r/MedSpa'),
('Reddit r/Dermatology', 'api', 'social', 'https://oauth.reddit.com/r/Dermatology/new.json', 'REDDIT_CLIENT_ID', 240, false, 3, 'Reddit r/Dermatology');

-- ============================================================
-- API JOBS (category='jobs', feed_type='api', poll=240min)
-- ============================================================
INSERT INTO data_feeds (name, feed_type, category, endpoint_url, api_key_env_var, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES
('JSearch (RapidAPI)', 'api', 'jobs', 'https://jsearch.p.rapidapi.com/search', 'RAPIDAPI_KEY', 240, false, 2, 'JSearch via RapidAPI'),
('Adzuna Job Search', 'api', 'jobs', 'https://api.adzuna.com/v1/api/jobs/us/search', 'ADZUNA_KEY', 240, false, 2, 'Adzuna');

-- ============================================================
-- API EVENTS (category='events', feed_type='api', poll=240min)
-- ============================================================
INSERT INTO data_feeds (name, feed_type, category, endpoint_url, api_key_env_var, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES
('Eventbrite', 'api', 'events', 'https://www.eventbriteapi.com/v3/events/search', 'EVENTBRITE_TOKEN', 240, false, 2, 'Eventbrite');

-- ============================================================
-- RSS INGREDIENTS (category='ingredients', poll=60min)
-- ============================================================
INSERT INTO data_feeds (name, feed_type, category, endpoint_url, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES
('CIR (Cosmetic Ingredient Review)', 'rss', 'ingredients', 'https://www.cir-safety.org/feed', 60, false, 1, 'Cosmetic Ingredient Review'),
('EWG Skin Deep Updates', 'rss', 'ingredients', 'https://www.ewg.org/feed', 60, false, 2, 'Environmental Working Group'),
('INCI Decoder Blog', 'rss', 'ingredients', 'https://incidecoder.com/feed', 60, false, 2, 'INCI Decoder'),
('Prospector (UL) Personal Care', 'rss', 'ingredients', 'https://www.ulprospector.com/en/na/PersonalCare/feed', 60, false, 2, 'UL Prospector');

-- ============================================================
-- ADDITIONAL TRADE PUBS (category='trade_pub', poll=60min)
-- ============================================================
INSERT INTO data_feeds (name, feed_type, category, endpoint_url, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES
('Happi Magazine', 'rss', 'trade_pub', 'https://www.happi.com/rss', 60, false, 2, 'Happi Magazine'),
('Global Cosmetic Industry', 'rss', 'trade_pub', 'https://www.gcimagazine.com/rss', 60, false, 2, 'Global Cosmetic Industry'),
('Premium Beauty News', 'rss', 'trade_pub', 'https://www.premiumbeautynews.com/spip.php?page=backend', 60, false, 2, 'Premium Beauty News'),
('BeautyPackaging.com', 'rss', 'trade_pub', 'https://www.beautypackaging.com/rss', 60, false, 2, 'Beauty Packaging');

-- ============================================================
-- ADDITIONAL ACADEMIC (category='academic', poll=60min)
-- ============================================================
INSERT INTO data_feeds (name, feed_type, category, endpoint_url, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES
('British Journal of Dermatology', 'rss', 'academic', 'https://academic.oup.com/bjd/rss', 60, false, 1, 'British Journal of Dermatology'),
('International Journal of Dermatology', 'rss', 'academic', 'https://onlinelibrary.wiley.com/feed/13654632/most-recent', 60, false, 1, 'Intl Journal of Dermatology'),
('Dermatologic Surgery', 'rss', 'academic', 'https://journals.lww.com/dermatologicsurgery/_layouts/15/OAKS.Journals/feed.aspx?FeedType=MostRecentArticles', 60, false, 1, 'Dermatologic Surgery'),
('Journal of Drugs in Dermatology', 'rss', 'academic', 'https://jddonline.com/feed', 60, false, 1, 'JDD');

-- ============================================================
-- ADDITIONAL BRAND NEWS (category='brand_news', poll=60min)
-- ============================================================
INSERT INTO data_feeds (name, feed_type, category, endpoint_url, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES
('Environ Skin Care Blog', 'rss', 'brand_news', 'https://www.environskincare.com/blog/feed', 60, false, 1, 'Environ'),
('Murad Blog', 'rss', 'brand_news', 'https://www.murad.com/blog/feed', 60, false, 1, 'Murad'),
('SkinMedica Blog', 'rss', 'brand_news', 'https://www.skinmedica.com/blog/rss', 60, false, 1, 'SkinMedica');

-- ============================================================
-- ADDITIONAL SOCIAL (category='social', feed_type='api', poll=240min)
-- ============================================================
INSERT INTO data_feeds (name, feed_type, category, endpoint_url, api_key_env_var, poll_interval_minutes, is_enabled, provenance_tier, attribution_label) VALUES
('Reddit r/SkincareAddiction', 'api', 'social', 'https://oauth.reddit.com/r/SkincareAddiction/new.json', 'REDDIT_CLIENT_ID', 240, false, 3, 'Reddit r/SkincareAddiction'),
('Reddit r/30PlusSkinCare', 'api', 'social', 'https://oauth.reddit.com/r/30PlusSkinCare/new.json', 'REDDIT_CLIENT_ID', 240, false, 3, 'Reddit r/30PlusSkinCare');
