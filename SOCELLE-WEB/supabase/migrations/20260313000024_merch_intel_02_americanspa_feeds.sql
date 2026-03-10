-- MERCH-INTEL-02 Phase 1 — American Spa RSS Set (new URLs + enable)
-- Source: Owner directive 2026-03-10
-- Purpose: Add all 8 American Spa channels using the /rss/*/xml URL format
-- Coverage impact: medspa enabled feeds 21 → 28 (target: ≥30)

-- Update existing records to new URL format and enable all
UPDATE data_feeds SET
  name = 'American Spa — All Stories',
  endpoint_url = 'https://www.americanspa.com/rss/all-stories/xml',
  vertical = 'medspa',
  tier_min = 'free',
  is_enabled = true,
  consecutive_failures = 0,
  health_status = 'healthy'
WHERE endpoint_url = 'https://www.americanspa.com/rss.xml';

UPDATE data_feeds SET
  name = 'American Spa — Medical Spa',
  endpoint_url = 'https://www.americanspa.com/rss/medical-spa/xml',
  consecutive_failures = 0,
  health_status = 'healthy'
WHERE endpoint_url = 'https://www.americanspa.com/tag/medical-spa/rss.xml';

UPDATE data_feeds SET
  name = 'American Spa — Treatments',
  endpoint_url = 'https://www.americanspa.com/rss/treatments/xml',
  is_enabled = true, consecutive_failures = 0, health_status = 'healthy'
WHERE endpoint_url = 'https://www.americanspa.com/tag/treatments/rss.xml';

UPDATE data_feeds SET
  name = 'American Spa — Skincare',
  endpoint_url = 'https://www.americanspa.com/rss/skincare/xml',
  is_enabled = true, consecutive_failures = 0, health_status = 'healthy'
WHERE endpoint_url = 'https://www.americanspa.com/tag/skincare/rss.xml';

UPDATE data_feeds SET
  name = 'American Spa — Business',
  endpoint_url = 'https://www.americanspa.com/rss/business/xml',
  is_enabled = true, consecutive_failures = 0, health_status = 'healthy'
WHERE endpoint_url = 'https://www.americanspa.com/tag/business/rss.xml';

UPDATE data_feeds SET
  name = 'American Spa — News',
  endpoint_url = 'https://www.americanspa.com/rss/news/xml',
  is_enabled = true, consecutive_failures = 0, health_status = 'healthy'
WHERE endpoint_url = 'https://www.americanspa.com/tag/news/rss.xml';

UPDATE data_feeds SET
  name = 'American Spa — People',
  endpoint_url = 'https://www.americanspa.com/rss/people/xml',
  is_enabled = true, consecutive_failures = 0, health_status = 'healthy'
WHERE endpoint_url = 'https://www.americanspa.com/tag/people/rss.xml';

-- Insert Spas channel (new — not previously in DB)
INSERT INTO data_feeds (name, endpoint_url, feed_type, category, vertical, tier_min, is_enabled, consecutive_failures, health_status)
SELECT
  'American Spa — Spas',
  'https://www.americanspa.com/rss/spas/xml',
  'rss', 'trade_pub', 'medspa', 'paid', true, 0, 'healthy'
WHERE NOT EXISTS (
  SELECT 1 FROM data_feeds WHERE endpoint_url = 'https://www.americanspa.com/rss/spas/xml'
);
