-- Migration: fill api_route_map gaps — WO-OVERHAUL-07
-- Adds 31 routes from SITE_MAP.md that were missing from api_route_map.
-- Uses ON CONFLICT DO NOTHING to avoid duplicates if any already exist.

-- Add unique constraint on (route, method) if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'api_route_map_route_method_key'
  ) THEN
    ALTER TABLE public.api_route_map
      ADD CONSTRAINT api_route_map_route_method_key UNIQUE (route, method);
  END IF;
END $$;

INSERT INTO public.api_route_map (route, method, api_registry_id, edge_function_name, description, auth_required, is_active) VALUES
  -- ═══ Public pages (12) ═══
  ('/', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'Home page — DEMO hardcoded INTELLIGENCE_SIGNALS', false, true),
  ('/brands', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'Brands directory — LIVE supabase.from(brands)', false, true),
  ('/brands/:slug', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'Brand storefront detail — LIVE brands + seed + products', false, true),
  ('/intelligence', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'Intelligence hub — LIVE useIntelligence() market_signals', false, true),
  ('/events', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'Events listing — LIVE supabase.from(events)', false, true),
  ('/jobs', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'Jobs listing — LIVE supabase.from(job_postings)', false, true),
  ('/jobs/:slug', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'Job detail page — LIVE supabase.from(job_postings)', false, true),
  ('/education', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'Education hub — LIVE brand_training_modules', false, true),
  ('/protocols', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'Protocols listing — LIVE canonical_protocols', false, true),
  ('/protocols/:slug', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'Protocol detail page — LIVE canonical_protocols', false, true),
  ('/request-access', 'POST',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'Request access form — LIVE inserts to access_requests', false, true),
  ('/stories', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'Stories index — LIVE supabase.from(stories)', false, true),

  -- ═══ Business Portal (4) ═══
  ('/portal', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'Portal landing page', false, true),
  ('/portal/dashboard', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'Business portal dashboard — LIVE', true, true),
  ('/portal/intelligence', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'Business intelligence hub — DEMO mock data', true, true),
  ('/portal/orders', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'Business portal orders list — LIVE', true, true),
  ('/portal/benchmarks', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'Business benchmarks — DEMO mock peer data', true, true),

  -- ═══ Brand Portal (2) ═══
  ('/brand/dashboard', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'Brand portal dashboard — LIVE', true, true),
  ('/brand/intelligence', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'Brand intelligence hub — DEMO mock data', true, true),

  -- ═══ Admin (13) ═══
  ('/admin/dashboard', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'Admin dashboard — LIVE', true, true),
  ('/admin/inbox', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'Admin inbox — LIVE', true, true),
  ('/admin/orders', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'Admin orders list — LIVE', true, true),
  ('/admin/orders/:id', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'Admin order detail — LIVE', true, true),
  ('/admin/market-signals', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'Admin market signals manager — LIVE market_signals', true, true),
  ('/admin/brands/:id/analytics', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'Brand hub analytics tab — DEMO', true, true),
  ('/admin/brands/:id/settings', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'Brand hub settings tab — LIVE', true, true),
  ('/admin/api-control', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'API control hub — LIVE api_registry', true, true),
  ('/admin/api-sitemap', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'API route map viewer — LIVE api_route_map', true, true),
  ('/admin/feed-manager', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'Feed manager hub — LIVE data_feeds', true, true),
  ('/admin/cms', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'CMS pages hub — LIVE cms_pages', true, true),
  ('/admin/media', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'Media library hub — LIVE media_library', true, true),
  ('/admin/data-feeds', 'GET',
    (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
    NULL, 'Data feeds hub — LIVE data_feeds', true, true)
ON CONFLICT ON CONSTRAINT api_route_map_route_method_key DO NOTHING;
