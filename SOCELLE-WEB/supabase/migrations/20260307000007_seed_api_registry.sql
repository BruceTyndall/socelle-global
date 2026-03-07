-- Migration: seed api_registry with known integrations
-- Phase 2 Backend Schema Foundation

INSERT INTO public.api_registry (name, provider, category, base_url, docs_url, environment, is_active, last_test_status) VALUES
  ('Supabase Database', 'Supabase', 'storage', 'https://YOUR_PROJECT.supabase.co', 'https://supabase.com/docs', 'production', true, 'untested'),
  ('Supabase Auth', 'Supabase', 'auth', 'https://YOUR_PROJECT.supabase.co/auth', 'https://supabase.com/docs/guides/auth', 'production', true, 'untested'),
  ('Stripe Payments', 'Stripe', 'payments', 'https://api.stripe.com', 'https://stripe.com/docs/api', 'production', true, 'untested'),
  ('Anthropic Claude', 'Anthropic', 'ai', 'https://api.anthropic.com', 'https://docs.anthropic.com', 'production', true, 'untested'),
  ('Google Gemini', 'Google', 'ai', 'https://generativelanguage.googleapis.com', 'https://ai.google.dev/docs', 'production', true, 'untested'),
  ('Supabase Storage', 'Supabase', 'storage', 'https://YOUR_PROJECT.supabase.co/storage', 'https://supabase.com/docs/guides/storage', 'production', true, 'untested'),
  ('Supabase Edge Functions', 'Supabase', 'other', 'https://YOUR_PROJECT.supabase.co/functions', 'https://supabase.com/docs/guides/functions', 'production', true, 'untested'),
  ('Supabase Realtime', 'Supabase', 'monitoring', 'https://YOUR_PROJECT.supabase.co/realtime', 'https://supabase.com/docs/guides/realtime', 'production', true, 'untested'),
  ('Transactional Email', 'Supabase', 'email', 'https://YOUR_PROJECT.supabase.co/functions/v1/send-email', 'internal', 'production', true, 'untested')
ON CONFLICT DO NOTHING;
