-- Migration: seed missing api_registry entries + api_route_map
-- WO-OVERHAUL-02: Backend Schema Foundation — additive seed
-- Discovered from edge function scan: OpenRouter, OpenAI, Resend, NPI, Open Beauty Facts, Square

-- ── Missing API Registry entries ───────────────────────────────────────────

INSERT INTO public.api_registry (name, provider, category, base_url, docs_url, environment, is_active, last_test_status, notes) VALUES
  -- AI: OpenRouter is the actual gateway used by ai-orchestrator (routes to Claude, Gemini, GPT-4o-mini, Llama)
  ('OpenRouter AI Gateway', 'OpenRouter', 'ai', 'https://openrouter.ai/api/v1', 'https://openrouter.ai/docs', 'production', true, 'untested',
   'Single API key routes to Anthropic Claude, Google Gemini, OpenAI GPT-4o-mini, Meta Llama. Secret: OPENROUTER_API_KEY'),

  -- AI: OpenAI direct (used by generate-embeddings for text-embedding-ada-002)
  ('OpenAI Embeddings', 'OpenAI', 'ai', 'https://api.openai.com/v1', 'https://platform.openai.com/docs', 'production', true, 'untested',
   'Used by generate-embeddings edge function. Secret: OPENAI_API_KEY'),

  -- Email: Resend (used by send-email edge function for transactional mail)
  ('Resend Email', 'Resend', 'email', 'https://api.resend.com', 'https://resend.com/docs', 'production', true, 'untested',
   'Transactional email provider. Secret: RESEND_API_KEY, FROM_EMAIL'),

  -- Government: CMS NPPES NPI Registry (used by ingest-npi, no API key required)
  ('CMS NPPES NPI Registry', 'CMS.gov', 'other', 'https://npiregistry.cms.hhs.gov/api', 'https://npiregistry.cms.hhs.gov/api-page', 'production', true, 'untested',
   'Free public API for NPI verification. No API key required. Rate limit ~120 req/min.'),

  -- Data: Open Beauty Facts (used by open-beauty-facts-sync, no API key required)
  ('Open Beauty Facts', 'Open Beauty Facts', 'other', 'https://world.openbeautyfacts.org/api/v2', 'https://wiki.openfoodfacts.org/API', 'production', true, 'untested',
   'Free open-data API for beauty product INCI ingredients. No API key required.'),

  -- Payments: Square (used by square-oauth-callback + square-appointments-sync, BLOCKED W11-13)
  ('Square Appointments', 'Square', 'payments', 'https://connect.squareup.com/v2', 'https://developer.squareup.com/docs', 'production', false, 'untested',
   'BLOCKED W11-13: requires owner GO + Vault integration. Secrets: SQUARE_APPLICATION_ID, SQUARE_APPLICATION_SECRET')
ON CONFLICT DO NOTHING;


-- ── API Route Map: edge function → api_registry mapping ───────────────────
-- Uses subqueries to resolve api_registry_id by name (avoids hardcoded UUIDs)

INSERT INTO public.api_route_map (route, method, api_registry_id, edge_function_name, description, auth_required, is_active) VALUES
  -- AI routes
  ('/functions/v1/ai-orchestrator', 'POST',
   (SELECT id FROM public.api_registry WHERE name = 'OpenRouter AI Gateway' LIMIT 1),
   'ai-orchestrator', '4-tier AI routing gateway (Claude/Gemini/GPT-4o-mini/Llama)', true, true),

  ('/functions/v1/ai-concierge', 'POST',
   (SELECT id FROM public.api_registry WHERE name = 'OpenRouter AI Gateway' LIMIT 1),
   'ai-concierge', 'AI Concierge thin adapter — forwards to ai-orchestrator', true, true),

  ('/functions/v1/generate-embeddings', 'POST',
   (SELECT id FROM public.api_registry WHERE name = 'OpenAI Embeddings' LIMIT 1),
   'generate-embeddings', 'Text embedding generation (ada-002) — single or batch', true, true),

  ('/functions/v1/intelligence-briefing', 'GET',
   (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
   'intelligence-briefing', 'Live market signals + pulse for Intelligence Hub', false, true),

  -- Data ingestion routes
  ('/functions/v1/feed-orchestrator', 'POST',
   (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
   'feed-orchestrator', 'Central dispatcher for data_feeds ingestion (RSS/API/webhook)', true, true),

  ('/functions/v1/ingest-rss', 'POST',
   (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
   'ingest-rss', 'RSS 2.0/Atom feed ingestion into rss_items', true, true),

  ('/functions/v1/rss-to-signals', 'POST',
   (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
   'rss-to-signals', 'Transform RSS items into market_signals', true, true),

  ('/functions/v1/ingest-npi', 'POST',
   (SELECT id FROM public.api_registry WHERE name = 'CMS NPPES NPI Registry' LIMIT 1),
   'ingest-npi', 'NPI number verification against CMS NPPES registry', true, true),

  ('/functions/v1/open-beauty-facts-sync', 'POST',
   (SELECT id FROM public.api_registry WHERE name = 'Open Beauty Facts' LIMIT 1),
   'open-beauty-facts-sync', 'INCI ingredient extraction from Open Beauty Facts', true, true),

  -- Email
  ('/functions/v1/send-email', 'POST',
   (SELECT id FROM public.api_registry WHERE name = 'Resend Email' LIMIT 1),
   'send-email', 'Transactional email (welcome, order_status, access_request)', true, true),

  ('/functions/v1/magic-link', 'POST',
   (SELECT id FROM public.api_registry WHERE name = 'Supabase Auth' LIMIT 1),
   'magic-link', 'Passwordless auth magic link generation', false, true),

  -- Commerce (DO NOT MODIFY — reference only)
  ('/functions/v1/create-checkout', 'POST',
   (SELECT id FROM public.api_registry WHERE name = 'Stripe Payments' LIMIT 1),
   'create-checkout', 'Stripe checkout session creation', true, true),

  ('/functions/v1/stripe-webhook', 'POST',
   (SELECT id FROM public.api_registry WHERE name = 'Stripe Payments' LIMIT 1),
   'stripe-webhook', 'Stripe webhook handler (order fulfillment)', false, true),

  -- Live data
  ('/functions/v1/refresh-live-data', 'POST',
   (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
   'refresh-live-data', 'Refresh active live_data_feeds from external sources', true, true),

  -- Search + Jobs
  ('/functions/v1/jobs-search', 'GET',
   (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
   'jobs-search', 'Filtered paginated job search from job_postings', false, true),

  -- SEO
  ('/functions/v1/sitemap-generator', 'GET',
   (SELECT id FROM public.api_registry WHERE name = 'Supabase Database' LIMIT 1),
   'sitemap-generator', 'Dynamic sitemap XML generation from sitemap_entries', false, true),

  -- Square (BLOCKED W11-13)
  ('/functions/v1/square-oauth-callback', 'GET',
   (SELECT id FROM public.api_registry WHERE name = 'Square Appointments' LIMIT 1),
   'square-oauth-callback', 'Square OAuth2 callback handler — BLOCKED W11-13', true, false),

  ('/functions/v1/square-appointments-sync', 'POST',
   (SELECT id FROM public.api_registry WHERE name = 'Square Appointments' LIMIT 1),
   'square-appointments-sync', 'Square Appointments data sync — BLOCKED W11-13', true, false)
ON CONFLICT DO NOTHING;
