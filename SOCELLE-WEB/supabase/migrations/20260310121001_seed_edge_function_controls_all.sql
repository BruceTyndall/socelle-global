-- CTRL-WO-02: ensure edge_function_controls has every deployed edge function
-- Authority: docs/operations/OPERATION_BREAKOUT.md

INSERT INTO public.edge_function_controls (function_name, display_name, description)
VALUES
  ('ai-concierge', 'AI Concierge', 'Conversational AI assistant'),
  ('ai-orchestrator', 'AI Orchestrator', 'Main AI request handler'),
  ('create-checkout', 'Create Checkout', 'Stripe checkout session creator'),
  ('feed-orchestrator', 'Feed Orchestrator', 'Data feed ingestion scheduler'),
  ('generate-certificate', 'Generate Certificate', 'Certificate PDF generator'),
  ('generate-embeddings', 'Generate Embeddings', 'Vector embedding generator'),
  ('ingest-npi', 'Ingest NPI', 'NPI registry data ingester'),
  ('ingest-rss', 'Ingest RSS', 'RSS feed ingester'),
  ('ingredient-search', 'Ingredient Search', 'Ingredient search endpoint'),
  ('intelligence-briefing', 'Intelligence Briefing', 'AI intelligence brief generator'),
  ('jobs-search', 'Jobs Search', 'Jobs search endpoint'),
  ('magic-link', 'Magic Link', 'Auth magic-link handler'),
  ('manage-subscription', 'Manage Subscription', 'Subscription management endpoint'),
  ('open-beauty-facts-sync', 'Open Beauty Facts Sync', 'Ingredient sync from Open Beauty Facts'),
  ('process-scorm-upload', 'Process SCORM Upload', 'SCORM package upload processor'),
  ('refresh-live-data', 'Refresh Live Data', 'Live-data refresh runner'),
  ('rss-to-signals', 'RSS To Signals', 'Transforms RSS items into market signals'),
  ('scorm-runtime', 'SCORM Runtime', 'SCORM runtime endpoint'),
  ('send-email', 'Send Email', 'Transactional email sender'),
  ('shop-checkout', 'Shop Checkout', 'Shop checkout endpoint'),
  ('shop-webhook', 'Shop Webhook', 'Shop webhook handler'),
  ('sitemap-generator', 'Sitemap Generator', 'XML sitemap generator'),
  ('square-appointments-sync', 'Square Appointments Sync', 'Square appointments sync runner'),
  ('square-oauth-callback', 'Square OAuth Callback', 'Square OAuth callback handler'),
  ('stripe-webhook', 'Stripe Webhook', 'Stripe event webhook handler'),
  ('subscription-webhook', 'Subscription Webhook', 'Subscription state webhook handler'),
  ('test-api-connection', 'Test API Connection', 'API registry connectivity tester'),
  ('update-inventory', 'Update Inventory', 'Inventory update endpoint'),
  ('validate-discount', 'Validate Discount', 'Discount validation endpoint'),
  ('verify-certificate', 'Verify Certificate', 'Certificate verification endpoint')
ON CONFLICT (function_name)
DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  updated_at = now();
