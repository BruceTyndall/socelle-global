-- Migration: Add api_key_encrypted column + expand API registry seed + route map seed
-- Phase 2 Backend Schema Foundation — supplemental
-- Authority: WO-OVERHAUL-02

-- ── Add api_key_encrypted column (spec requirement) ────────────────────────
ALTER TABLE public.api_registry
  ADD COLUMN IF NOT EXISTS api_key_encrypted text;

COMMENT ON COLUMN public.api_registry.api_key_encrypted IS
  'Encrypted API key — NEVER expose in client responses, logs, or network payloads';

-- ── Expand API registry with all discovered integrations ───────────────────
INSERT INTO public.api_registry (name, provider, category, base_url, docs_url, environment, is_active, last_test_status, notes) VALUES
  ('OpenRouter AI', 'OpenRouter', 'ai', 'https://openrouter.ai/api/v1', 'https://openrouter.ai/docs', 'production', true, 'untested', 'Routes to Claude Sonnet, Gemini 2.5 Pro, GPT-4o-mini, Llama 3.3 via Groq'),
  ('Resend Email', 'Resend', 'email', 'https://api.resend.com', 'https://resend.com/docs', 'production', true, 'untested', 'Transactional email via send-email edge function'),
  ('Open Beauty Facts', 'Open Beauty Facts', 'other', 'https://world.openbeautyfacts.org/api/v2', 'https://wiki.openfoodfacts.org/API', 'production', true, 'untested', 'Ingredient database — ingest-open-beauty-facts edge function'),
  ('NPI Registry', 'CMS.gov', 'other', 'https://npiregistry.cms.hhs.gov/api', 'https://npiregistry.cms.hhs.gov/api-page', 'production', true, 'untested', 'National Provider Identifier lookup — ingest-npi edge function'),
  ('Fontshare CDN', 'Indian Type Foundry', 'other', 'https://api.fontshare.com', 'https://www.fontshare.com', 'production', true, 'untested', 'General Sans typeface CDN'),
  ('OpenFDA', 'FDA', 'other', 'https://api.fda.gov', 'https://open.fda.gov/apis/', 'production', true, 'untested', 'FDA adverse events and recall data — W11-06'),
  ('Google Trends', 'Google', 'analytics', 'https://trends.google.com', 'https://trends.google.com', 'production', false, 'untested', 'Trend data — W11-01 — needs API key'),
  ('Google Places', 'Google', 'analytics', 'https://maps.googleapis.com/maps/api/place', 'https://developers.google.com/maps/documentation/places', 'production', false, 'untested', 'Medspa location data — W11-07 — needs API key')
ON CONFLICT DO NOTHING;

-- ── Seed api_route_map — link APIs to routes/edge functions ────────────────
-- Uses subqueries to reference api_registry rows by name

INSERT INTO public.api_route_map (route, method, api_registry_id, edge_function_name, description, auth_required, is_active) VALUES
  -- Supabase Database routes
  ('/', 'GET', (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1), NULL, 'Home page — market_signals, brands, platform stats', false, true),
  ('/intelligence', 'GET', (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1), NULL, 'Intelligence hub — market_signals table', false, true),
  ('/brands', 'GET', (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1), NULL, 'Brand directory — brands table', false, true),
  ('/brands/:slug', 'GET', (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1), NULL, 'Brand detail — brands + products + protocols', false, true),
  ('/education', 'GET', (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1), NULL, 'Education hub — brand_training_modules', false, true),
  ('/protocols', 'GET', (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1), NULL, 'Protocol library — canonical_protocols', false, true),
  ('/protocols/:slug', 'GET', (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1), NULL, 'Protocol detail page', false, true),
  ('/events', 'GET', (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1), NULL, 'Events listing — events table (stub)', false, true),
  ('/jobs', 'GET', (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1), NULL, 'Jobs listing — job_postings table', false, true),
  ('/jobs/:slug', 'GET', (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1), NULL, 'Job detail page', false, true),
  ('/request-access', 'POST', (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1), NULL, 'Access request form → access_requests table', false, true),
  ('/insights', 'GET', (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1), NULL, 'Insights — rss_items table', false, true),
  ('/ingredients', 'GET', (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1), NULL, 'Ingredient directory — ingredients table', false, true),
  ('/blog', 'GET', (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1), NULL, 'Blog listing — blog_posts table', false, true),
  ('/blog/:slug', 'GET', (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1), NULL, 'Blog post detail', false, true),

  -- Supabase Auth routes
  ('/auth/signin', 'POST', (SELECT id FROM public.api_registry WHERE name = 'Supabase Auth' LIMIT 1), NULL, 'Sign in — auth.signInWithPassword', false, true),
  ('/auth/signup', 'POST', (SELECT id FROM public.api_registry WHERE name = 'Supabase Auth' LIMIT 1), NULL, 'Sign up — auth.signUp', false, true),

  -- Portal routes (auth required)
  ('/portal/dashboard', 'GET', (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1), NULL, 'Business portal dashboard', true, true),
  ('/portal/intelligence', 'GET', (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1), NULL, 'Portal intelligence hub', true, true),
  ('/portal/benchmarks', 'GET', (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1), NULL, 'Benchmark dashboard — aggregated analytics', true, true),
  ('/brand/dashboard', 'GET', (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1), NULL, 'Brand portal dashboard', true, true),
  ('/brand/intelligence', 'GET', (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1), NULL, 'Brand intelligence hub', true, true),
  ('/admin/market-signals', 'GET', (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1), NULL, 'Admin signal curation', true, true),

  -- Stripe routes
  ('/portal/orders', 'GET', (SELECT id FROM public.api_registry WHERE name = 'Stripe Payments' LIMIT 1), 'stripe-webhook', 'Order history — via Stripe webhook', true, true),

  -- AI routes
  ('/portal/ai-advisor', 'POST', (SELECT id FROM public.api_registry WHERE name = 'OpenRouter AI' LIMIT 1), 'ai-orchestrator', 'AI Advisor — routed through OpenRouter', true, true),
  ('/brand/ai-advisor', 'POST', (SELECT id FROM public.api_registry WHERE name = 'OpenRouter AI' LIMIT 1), 'ai-orchestrator', 'Brand AI Advisor', true, true),

  -- Edge function routes
  ('/functions/v1/send-email', 'POST', (SELECT id FROM public.api_registry WHERE name = 'Resend Email' LIMIT 1), 'send-email', 'Transactional email — access request notifications', true, true),
  ('/functions/v1/ingest-rss', 'POST', (SELECT id FROM public.api_registry WHERE name = 'Supabase Edge Functions' LIMIT 1), 'ingest-rss', 'RSS feed ingestion → rss_items + market_signals', true, true),
  ('/functions/v1/ingest-open-beauty-facts', 'POST', (SELECT id FROM public.api_registry WHERE name = 'Open Beauty Facts' LIMIT 1), 'ingest-open-beauty-facts', 'Ingredient data ingestion', true, true),
  ('/functions/v1/ingest-npi', 'POST', (SELECT id FROM public.api_registry WHERE name = 'NPI Registry' LIMIT 1), 'ingest-npi', 'NPI provider lookup', true, true),
  ('/functions/v1/feed-orchestrator', 'POST', (SELECT id FROM public.api_registry WHERE name = 'Supabase Edge Functions' LIMIT 1), 'feed-orchestrator', 'Data feed orchestration — RSS + API → market_signals', true, true),
  ('/functions/v1/rss-to-signals', 'POST', (SELECT id FROM public.api_registry WHERE name = 'Supabase Edge Functions' LIMIT 1), 'rss-to-signals', 'RSS to market signals transform', true, true),
  ('/functions/v1/intelligence-briefing', 'POST', (SELECT id FROM public.api_registry WHERE name = 'OpenRouter AI' LIMIT 1), 'intelligence-briefing', 'AI-generated intelligence briefing', true, true),
  ('/functions/v1/jobs-search', 'POST', (SELECT id FROM public.api_registry WHERE name = 'Supabase Edge Functions' LIMIT 1), 'jobs-search', 'Job search endpoint', true, true),

  -- Admin CMS routes (Phase 4)
  ('/admin/pages', 'GET', (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1), NULL, 'CMS page editor — cms_pages table', true, true),
  ('/admin/blog', 'GET', (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1), NULL, 'Blog manager — blog_posts table', true, true),
  ('/admin/media', 'GET', (SELECT id FROM public.api_registry WHERE name = 'Supabase Storage' LIMIT 1), NULL, 'Media library — media_library + Supabase Storage', true, true),
  ('/admin/seo', 'GET', (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1), NULL, 'SEO manager — sitemap_entries + page meta', true, true),
  ('/admin/live-data', 'GET', (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1), NULL, 'Live data feed manager — live_data_feeds table', true, true),
  ('/admin/api-control', 'GET', (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1), NULL, 'API Control Center — api_registry table', true, true),
  ('/admin/api-sitemap', 'GET', (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1), NULL, 'API Sitemap — api_route_map table', true, true),
  ('/admin/feeds', 'GET', (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1), NULL, 'Admin feeds hub — data_feeds table', true, true),
  ('/admin/settings', 'GET', (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1), NULL, 'Site settings panel', true, true)
ON CONFLICT DO NOTHING;
