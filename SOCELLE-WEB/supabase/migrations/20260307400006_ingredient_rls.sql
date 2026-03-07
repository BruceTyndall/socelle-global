-- WO-OVERHAUL-12: RLS policies for new ingredient tables
-- Public read, admin/service_role write.
-- ADD ONLY — never modify existing migrations.

-- ── ingredient_aliases ─────────────────────────────────────────────────────
ALTER TABLE public.ingredient_aliases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_ingredient_aliases"
  ON public.ingredient_aliases FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "service_role_write_ingredient_aliases"
  ON public.ingredient_aliases FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── product_ingredients ────────────────────────────────────────────────────
ALTER TABLE public.product_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_product_ingredients"
  ON public.product_ingredients FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "service_role_write_product_ingredients"
  ON public.product_ingredients FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── ingredient_interactions ────────────────────────────────────────────────
ALTER TABLE public.ingredient_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_ingredient_interactions"
  ON public.ingredient_interactions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "service_role_write_ingredient_interactions"
  ON public.ingredient_interactions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── ingredient_collections ─────────────────────────────────────────────────
ALTER TABLE public.ingredient_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_ingredient_collections"
  ON public.ingredient_collections FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "service_role_write_ingredient_collections"
  ON public.ingredient_collections FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── ingredient_collection_items ────────────────────────────────────────────
ALTER TABLE public.ingredient_collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_ingredient_collection_items"
  ON public.ingredient_collection_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "service_role_write_ingredient_collection_items"
  ON public.ingredient_collection_items FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
