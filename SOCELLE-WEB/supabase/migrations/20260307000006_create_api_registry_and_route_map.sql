-- Migration: create api_registry and api_route_map tables
-- Phase 2 Backend Schema Foundation

CREATE TABLE IF NOT EXISTS public.api_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  provider text NOT NULL,
  category text NOT NULL CHECK (category IN ('payments','ai','search','analytics','email','storage','auth','monitoring','other')),
  base_url text,
  docs_url text,
  environment text NOT NULL DEFAULT 'production' CHECK (environment IN ('development','staging','production')),
  api_key_vault_ref text,
  is_active boolean DEFAULT true,
  last_tested_at timestamptz,
  last_test_status text CHECK (last_test_status IN ('pass','fail','timeout','untested')),
  last_test_latency_ms integer,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.api_route_map (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route text NOT NULL,
  method text NOT NULL DEFAULT 'GET' CHECK (method IN ('GET','POST','PUT','PATCH','DELETE')),
  api_registry_id uuid REFERENCES public.api_registry(id) ON DELETE SET NULL,
  edge_function_name text,
  description text,
  auth_required boolean DEFAULT true,
  rate_limit_rpm integer,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.api_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_route_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage API registry" ON public.api_registry
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
  );

CREATE POLICY "Admins can manage route map" ON public.api_route_map
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin'))
  );

CREATE INDEX idx_api_registry_provider ON public.api_registry(provider);
CREATE INDEX idx_api_registry_category ON public.api_registry(category);
CREATE INDEX idx_api_route_map_route ON public.api_route_map(route);
