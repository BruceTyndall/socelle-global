-- ============================================================================
-- WO-OVERHAUL-05: Seed sitemap_entries with all public routes
-- Depends on: 20260307000005_sitemap_entries.sql (Phase 2 migration)
-- ============================================================================

INSERT INTO sitemap_entries (loc, changefreq, priority, lastmod)
VALUES
  -- Tier 1: Homepage (priority 1.0, daily)
  ('/', 'daily', 1.0, now()),

  -- Tier 2: High-value discovery pages (priority 0.9, daily)
  ('/intelligence', 'daily', 0.9, now()),
  ('/brands', 'daily', 0.9, now()),

  -- Tier 3: Content hubs (priority 0.8, weekly)
  ('/education', 'weekly', 0.8, now()),
  ('/protocols', 'weekly', 0.8, now()),
  ('/events', 'weekly', 0.8, now()),
  ('/jobs', 'weekly', 0.8, now()),
  ('/ingredients', 'weekly', 0.8, now()),
  ('/stories', 'weekly', 0.8, now()),

  -- Tier 4: Audience landing pages (priority 0.7, monthly)
  ('/for-brands', 'monthly', 0.7, now()),
  ('/professionals', 'monthly', 0.7, now()),
  ('/for-medspas', 'monthly', 0.7, now()),
  ('/for-salons', 'monthly', 0.7, now()),
  ('/plans', 'monthly', 0.7, now()),
  ('/request-access', 'monthly', 0.7, now()),

  -- Tier 5: Informational pages (priority 0.5, monthly)
  ('/about', 'monthly', 0.5, now()),
  ('/how-it-works', 'monthly', 0.5, now()),
  ('/faq', 'monthly', 0.5, now()),
  ('/api/docs', 'monthly', 0.5, now()),
  ('/api/pricing', 'monthly', 0.5, now()),

  -- Tier 6: Legal pages (priority 0.3, yearly)
  ('/privacy', 'yearly', 0.3, now()),
  ('/terms', 'yearly', 0.3, now())

ON CONFLICT (loc) DO UPDATE
  SET changefreq = EXCLUDED.changefreq,
      priority   = EXCLUDED.priority,
      lastmod    = now();
