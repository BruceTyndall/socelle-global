-- WO-OVERHAUL-12: product_ingredients junction table
-- Links products to ingredients with INCI order and optional concentration.
-- ADD ONLY — never modify existing migrations.

CREATE TABLE IF NOT EXISTS public.product_ingredients (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id          uuid        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  ingredient_id       uuid        NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  position            int         NOT NULL,  -- INCI order: 1 = highest concentration
  concentration_pct   numeric,
  function_in_product text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, ingredient_id)
);

CREATE INDEX IF NOT EXISTS product_ingredients_product_id_idx
  ON public.product_ingredients (product_id);

CREATE INDEX IF NOT EXISTS product_ingredients_ingredient_id_idx
  ON public.product_ingredients (ingredient_id);

CREATE INDEX IF NOT EXISTS product_ingredients_position_idx
  ON public.product_ingredients (product_id, position);

COMMENT ON TABLE public.product_ingredients IS
  'INCI ingredient list per product. Position 1 = highest concentration. WO-OVERHAUL-12.';
