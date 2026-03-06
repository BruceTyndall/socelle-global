-- ============================================================
-- SOCELLE GLOBAL — Migration: 20260305000001_initial_schema
-- ============================================================
-- Creates core tables for the B2B marketplace MVP.
-- Run via: supabase db reset  OR  supabase migration up
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";        -- pgvector for AI embeddings
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- trigram search

-- ── BUSINESSES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.businesses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT        NOT NULL,
  owner_user_id   UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  plan            TEXT        NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Spa owners can only see and edit their own business record
CREATE POLICY "Spa owners see own business"
  ON public.businesses FOR SELECT
  USING (owner_user_id = auth.uid());

CREATE POLICY "Spa owners update own business"
  ON public.businesses FOR UPDATE
  USING (owner_user_id = auth.uid());

-- ── PRO PRODUCTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pro_products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT        NOT NULL,
  brand           TEXT        NOT NULL,
  sku             TEXT        UNIQUE NOT NULL,
  wholesale_price NUMERIC(10,2) NOT NULL,
  retail_price    NUMERIC(10,2) NOT NULL,
  category        TEXT        NOT NULL,
  description     TEXT,
  embedding       vector(1536),  -- OpenAI ada-002 embedding for AI concierge
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pro_products ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view the product catalog
CREATE POLICY "Authenticated users view products"
  ON public.pro_products FOR SELECT
  TO authenticated
  USING (true);

-- Only service_role (backend) can insert/update products
CREATE POLICY "Service role manages products"
  ON public.pro_products FOR ALL
  TO service_role
  USING (true);

-- ── ORDERS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id     UUID        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  placed_by       UUID        NOT NULL REFERENCES auth.users(id),
  status          TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total_amount    NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Spa owners can only see orders for their own business
CREATE POLICY "Spa owners see own orders"
  ON public.orders FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Spa owners create orders"
  ON public.orders FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_user_id = auth.uid()
    )
  );

-- ── ORDER ITEMS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID        NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id      UUID        NOT NULL REFERENCES public.pro_products(id),
  quantity        INTEGER     NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price      NUMERIC(10,2) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order items inherit order visibility"
  ON public.order_items FOR SELECT
  USING (
    order_id IN (
      SELECT o.id FROM public.orders o
      JOIN public.businesses b ON o.business_id = b.id
      WHERE b.owner_user_id = auth.uid()
    )
  );

-- ── UPDATED_AT TRIGGERS ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_pro_products_updated_at
  BEFORE UPDATE ON public.pro_products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
