-- ============================================================
-- SOCELLE GLOBAL — Seed Data
-- ============================================================
-- Purpose: Populate local development database with baseline
-- test data. Run via: supabase db reset
-- ============================================================

-- ── TEST USERS (mirrors auth.users) ──────────────────────────
-- NOTE: In local dev, create users via the Supabase dashboard
-- at http://localhost:54323 or via the auth.users table directly.

-- ── BUSINESSES (Spa Owners) ──────────────────────────────────
INSERT INTO public.businesses (id, name, owner_user_id, plan, created_at)
VALUES
  ('11111111-0000-0000-0000-000000000001', 'Serenity Spa', NULL, 'pro', NOW()),
  ('11111111-0000-0000-0000-000000000002', 'Glow Studio', NULL, 'starter', NOW())
ON CONFLICT DO NOTHING;

-- ── PRO PRODUCTS (Brand Catalog) ─────────────────────────────
INSERT INTO public.pro_products (id, name, brand, sku, wholesale_price, retail_price, category, created_at)
VALUES
  ('22222222-0000-0000-0000-000000000001', 'Hydrating Serum Pro', 'LaBelle', 'LB-001', 24.99, 64.99, 'skincare', NOW()),
  ('22222222-0000-0000-0000-000000000002', 'Repair Mask Treatment', 'LaBelle', 'LB-002', 18.50, 49.99, 'treatment', NOW()),
  ('22222222-0000-0000-0000-000000000003', 'Volume Boost Shampoo', 'Revive', 'RV-001', 12.00, 32.00, 'haircare', NOW())
ON CONFLICT DO NOTHING;
