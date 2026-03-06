/*
  # Modify pro_products and retail_products: add sort_order

  Adds a brand-controlled display sort order to both product tables.

  sort_order (integer, default 0):
    - Lower numbers appear first in the storefront catalog.
    - Products with the same sort_order are sorted alphabetically
      by product_name as a secondary sort (handled in application query).
    - Defaults to 0 so all existing products start at the same level
      and appear in their current alphabetical order until a brand
      explicitly sets ordering in the product editor.
    - brand_shop_settings.featured_product_ids[] takes precedence over
      sort_order for the hero/featured row; sort_order governs the
      main catalog grid below.

  No RLS changes needed — these columns are on tables that already have
  complete brand-scoped RLS from 20260124004432.
*/

-- ─────────────────────────────────────────────
-- pro_products
-- ─────────────────────────────────────────────

ALTER TABLE pro_products
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_pro_products_brand_sort
  ON pro_products (brand_id, sort_order ASC, product_name ASC)
  WHERE is_active = true;

COMMENT ON COLUMN pro_products.sort_order IS
  'Brand-controlled display order in the storefront catalog. '
  'Lower = appears earlier. Secondary sort is product_name ASC. '
  'Overridden by brand_shop_settings.featured_product_ids for the hero row.';

-- ─────────────────────────────────────────────
-- retail_products
-- ─────────────────────────────────────────────

ALTER TABLE retail_products
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_retail_products_brand_sort
  ON retail_products (brand_id, sort_order ASC, product_name ASC)
  WHERE is_active = true;

COMMENT ON COLUMN retail_products.sort_order IS
  'Brand-controlled display order in the storefront catalog. '
  'Lower = appears earlier. Secondary sort is product_name ASC. '
  'Overridden by brand_shop_settings.featured_product_ids for the hero row.';
