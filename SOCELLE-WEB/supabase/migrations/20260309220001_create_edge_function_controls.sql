-- CTRL-WO-02: API Kill-Switch — Edge Function Controls
-- Allows admins to enable/disable edge functions at runtime.

CREATE TABLE IF NOT EXISTS public.edge_function_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name text UNIQUE NOT NULL,
  is_enabled boolean DEFAULT true,
  display_name text NOT NULL,
  description text DEFAULT '',
  last_toggled_at timestamptz,
  last_toggled_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.edge_function_controls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read controls"
  ON public.edge_function_controls FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Only admins can manage controls"
  ON public.edge_function_controls FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'platform_admin')
    )
  );

-- Seed with all known edge functions
INSERT INTO public.edge_function_controls (function_name, display_name, description) VALUES
  ('ai-orchestrator', 'AI Orchestrator', 'Main AI request handler'),
  ('ai-concierge', 'AI Concierge', 'Conversational AI assistant'),
  ('feed-orchestrator', 'Feed Orchestrator', 'Data feed ingestion scheduler'),
  ('intelligence-briefing', 'Intelligence Briefing', 'AI brief generator'),
  ('rss-to-signals', 'RSS to Signals', 'RSS feed to market signal converter'),
  ('create-checkout', 'Create Checkout', 'Stripe checkout session creator'),
  ('stripe-webhook', 'Stripe Webhook', 'Stripe event handler'),
  ('subscription-webhook', 'Subscription Webhook', 'Subscription state handler'),
  ('send-email', 'Send Email', 'Transactional email sender'),
  ('ingest-rss', 'Ingest RSS', 'RSS feed ingester'),
  ('ingest-npi', 'Ingest NPI', 'NPI registry data ingester'),
  ('generate-embeddings', 'Generate Embeddings', 'Vector embedding generator'),
  ('sitemap-generator', 'Sitemap Generator', 'XML sitemap generator')
ON CONFLICT (function_name) DO NOTHING;
