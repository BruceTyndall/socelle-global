-- MERCH-INTEL-02 — Feed URL fixes (applied 2026-03-10)
-- Corrects stale RSS URLs and disables permanently bot-blocked or 404 feeds
-- discovered during first feed-orchestrator v8 pipeline run.
-- Applied remotely via apply_migration; this file is the local source record.

-- ── Fix correctable 404 URLs ─────────────────────────────────────────────────

-- FTC Consumer News: tag-specific path was 404; main press-releases RSS works
UPDATE data_feeds
SET feed_url = 'https://www.ftc.gov/feeds/press-releases.xml'
WHERE name = 'FTC Consumer News'
  AND vertical = 'academic_regulatory';

-- FDA Cosmetics Updates → MedWatch safety alerts path
UPDATE data_feeds
SET feed_url = 'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/medwatch-safety-alerts/rss.xml'
WHERE name = 'FDA Cosmetics Updates'
  AND vertical = 'academic_regulatory';

-- PubMed Dermatology → valid search RSS
UPDATE data_feeds
SET feed_url = 'https://pubmed.ncbi.nlm.nih.gov/rss/search/1XKvMqmhP5tCl5y5pUALJ_6G3e_hc0sPmLR7jR6TYPGRe-Ul52/?limit=20&utm_campaign=pubmed-2&fc=20260101170000'
WHERE name = 'PubMed Dermatology'
  AND vertical = 'academic_regulatory';

-- American Spa Magazine: replace broken tag-specific URL with main RSS
UPDATE data_feeds
SET feed_url = 'https://www.americanspa.com/rss.xml'
WHERE name IN ('American Spa Magazine', 'American Spa – Business', 'American Spa – Skincare',
               'American Spa – Treatments', 'American Spa – News', 'American Spa – People')
  AND vertical = 'medspa';

-- ── Disable permanently bot-blocked (403) feeds ──────────────────────────────

UPDATE data_feeds
SET is_enabled = false,
    health_status = 'failed',
    consecutive_failures = 99,
    last_error = 'HTTP 403 — bot-blocked by publisher; Supabase us-west-2 user-agent denied'
WHERE name IN ('Skin Inc Magazine', 'Dermatology Times', 'Day Spa Magazine', 'The Aesthetic Guide');

-- ── Disable confirmed-404 feeds with no known correct URL ────────────────────

UPDATE data_feeds
SET is_enabled = false,
    health_status = 'failed',
    consecutive_failures = 99,
    last_error = 'HTTP 404 — RSS endpoint not found at registered URL; no correctable path identified'
WHERE name IN (
  'ISAPS – Aesthetic Surgery News',
  'JAMA Dermatology',
  'Practical Dermatology',
  'Beauty Matter'
);
