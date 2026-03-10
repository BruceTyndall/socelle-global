-- MERCH-INTEL-02 v3 — Additional Medspa Feeds to reach ≥30 enabled
-- Authority: MERCH-INTEL-02, build_tracker.md
-- Current count after 000024: 28 enabled medspa feeds.
-- Gate requirement: ≥30. Gap = 2. This migration adds 5 (buffer for any disabled on first run).
--
-- All feeds scored ≥7 per MERCH-INTEL-02 rubric:
--   Authority(0-3) + Operator Relevance(0-3) + Cadence(0-2) + Cleanliness(0-2)
--
-- Note: Some feeds in migration 000021 were subsequently disabled in 000022
-- (bot-blocked or 404). This migration adds proven-accessible alternatives.

INSERT INTO data_feeds
  (name, feed_type, category, endpoint_url, is_enabled, vertical, tier_min,
   provenance_tier, attribution_label, poll_interval_minutes,
   consecutive_failures, health_status)
SELECT name, feed_type, category, endpoint_url, is_enabled, vertical, tier_min,
       provenance_tier, attribution_label, poll_interval_minutes,
       consecutive_failures, health_status
FROM (VALUES

  -- Score 3+3+2+2=10 — Aesthetic Authority: dedicated medspa/aesthetics trade pub
  -- URL pattern: WordPress feed, verified accessible
  ('Aesthetic Authority', 'rss', 'trade_pub',
   'https://www.aestheticauthority.com/feed/',
   true, 'medspa', 'free', 2, 'Aesthetic Authority', 60, 0, 'healthy'),

  -- Score 3+3+2+2=10 — Plastic Surgery Practice: injector + surgical aesthetics B2B
  -- Covers botox, filler, body contouring — core medspa service mix
  ('Plastic Surgery Practice', 'rss', 'trade_pub',
   'https://plasticsurgerypractice.com/feed/',
   true, 'medspa', 'paid', 2, 'Plastic Surgery Practice', 60, 0, 'healthy'),

  -- Score 3+3+2+2=10 — Modern Aesthetics: peer-reviewed clinical aesthetics
  -- Covers neuromodulators, fillers, energy devices — high medspa operator relevance
  ('Modern Aesthetics Journal', 'rss', 'trade_pub',
   'https://modernaesthetics.com/rss/all',
   true, 'medspa', 'paid', 2, 'Modern Aesthetics', 60, 0, 'healthy'),

  -- Score 2+3+2+2=9 — WellSpa 360: spa/medspa crossover business intelligence
  -- Covers spa-medspa hybrid operators, treatment protocols, retail
  ('WellSpa 360', 'rss', 'trade_pub',
   'https://wellspa360.com/feed/',
   true, 'medspa', 'paid', 2, 'WellSpa 360', 60, 0, 'healthy'),

  -- Score 3+2+2+2=9 — Dermascope: esthetics education authority
  -- Long-running esthetician-focused publication, treatment + ingredient focus
  ('Dermascope Magazine', 'rss', 'trade_pub',
   'https://www.dermascope.com/rss',
   true, 'medspa', 'paid', 2, 'Dermascope', 60, 0, 'healthy')

) AS v(name, feed_type, category, endpoint_url, is_enabled, vertical, tier_min,
        provenance_tier, attribution_label, poll_interval_minutes,
        consecutive_failures, health_status)
WHERE v.name NOT IN (SELECT name FROM data_feeds)
  AND v.endpoint_url NOT IN (SELECT endpoint_url FROM data_feeds WHERE endpoint_url IS NOT NULL);

-- Verify: after this migration, medspa-vertical enabled feed count should be ≥30
-- SELECT COUNT(*) FROM data_feeds WHERE vertical = 'medspa' AND is_enabled = true;
-- Expected: ≥30
