-- NEWSAPI-INGEST-01: Wire GNews + Currents + Reddit API feeds
-- Authority: build_tracker.md NEWSAPI-INGEST-01

-- 1. GNews: update existing row — add {API_KEY} token param + enable
UPDATE data_feeds
SET
  endpoint_url  = 'https://gnews.io/api/v4/search?q=beauty+medspa+skincare+aesthetics+spa&lang=en&max=100&token={API_KEY}',
  is_enabled    = true,
  health_status = 'healthy',
  display_order = 50
WHERE name = 'GNews — Beauty & Wellness';

-- 2. Currents API: insert if not already present
INSERT INTO data_feeds (
  name, feed_type, category,
  endpoint_url, api_key_env_var,
  poll_interval_minutes, is_enabled, provenance_tier,
  attribution_label, vertical, tier_min, health_status, display_order
)
SELECT
  'Currents — Beauty & Aesthetics',
  'api', 'trade_pub',
  'https://api.currentsapi.services/v1/search?keywords=beauty+aesthetics+skincare+medspa&apiKey={API_KEY}&language=en',
  'CURRENTS_KEY',
  720, true, 3,
  'Currents API', 'multi', 'free', 'healthy', 51
WHERE NOT EXISTS (
  SELECT 1 FROM data_feeds WHERE name = 'Currents — Beauty & Aesthetics'
);

-- 3. Reddit OAuth API feeds: insert as disabled (pending Reddit approval)
INSERT INTO data_feeds (
  name, feed_type, category,
  endpoint_url, api_key_env_var,
  poll_interval_minutes, is_enabled, provenance_tier,
  attribution_label, vertical, tier_min, health_status, display_order
)
SELECT 'Reddit — r/estheticians (API)', 'api', 'social',
  'https://oauth.reddit.com/r/estheticians/hot.json?limit=25', 'REDDIT_CLIENT_ID',
  360, false, 2, 'Reddit r/estheticians', 'medspa', 'free', 'healthy', 60
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Reddit — r/estheticians (API)');

INSERT INTO data_feeds (
  name, feed_type, category,
  endpoint_url, api_key_env_var,
  poll_interval_minutes, is_enabled, provenance_tier,
  attribution_label, vertical, tier_min, health_status, display_order
)
SELECT 'Reddit — r/MedSpa (API)', 'api', 'social',
  'https://oauth.reddit.com/r/MedSpa/hot.json?limit=25', 'REDDIT_CLIENT_ID',
  360, false, 2, 'Reddit r/MedSpa', 'medspa', 'free', 'healthy', 61
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Reddit — r/MedSpa (API)');

INSERT INTO data_feeds (
  name, feed_type, category,
  endpoint_url, api_key_env_var,
  poll_interval_minutes, is_enabled, provenance_tier,
  attribution_label, vertical, tier_min, health_status, display_order
)
SELECT 'Reddit — r/SkincareAddiction (API)', 'api', 'social',
  'https://oauth.reddit.com/r/SkincareAddiction/hot.json?limit=25', 'REDDIT_CLIENT_ID',
  480, false, 3, 'Reddit r/SkincareAddiction', 'beauty_brand', 'free', 'healthy', 62
WHERE NOT EXISTS (SELECT 1 FROM data_feeds WHERE name = 'Reddit — r/SkincareAddiction (API)');
