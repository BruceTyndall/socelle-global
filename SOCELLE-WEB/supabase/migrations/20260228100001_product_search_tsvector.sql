/*
  # Product full-text search (tsvector)

  Adds search_vector to pro_products and retail_products for basic product search.
  Used by searchService.searchProducts and in-portal brand shop filters.

  - search_vector: tsvector GENERATED from product_name, product_function,
    category, and (for retail) target_concerns + regimen_placement.
  - GIN index for fast full-text search.
  - English text search config.
*/

-- ─────────────────────────────────────────────
-- pro_products
-- ─────────────────────────────────────────────

ALTER TABLE pro_products
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(product_name, '')), 'A')
    || setweight(to_tsvector('english', coalesce(product_function, '')), 'B')
    || setweight(to_tsvector('english', coalesce(category, '')), 'B')
    || setweight(to_tsvector('english', coalesce(array_to_string(key_ingredients, ' '), '')), 'C')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_pro_products_search_vector
  ON pro_products USING GIN (search_vector);

COMMENT ON COLUMN pro_products.search_vector IS
  'Full-text search vector from product_name (A), product_function/category (B), key_ingredients (C).';

-- ─────────────────────────────────────────────
-- retail_products
-- ─────────────────────────────────────────────

ALTER TABLE retail_products
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(product_name, '')), 'A')
    || setweight(to_tsvector('english', coalesce(product_function, '')), 'B')
    || setweight(to_tsvector('english', coalesce(category, '')), 'B')
    || setweight(to_tsvector('english', coalesce(array_to_string(key_ingredients, ' '), '')), 'C')
    || setweight(to_tsvector('english', coalesce(array_to_string(target_concerns, ' '), '')), 'C')
    || setweight(to_tsvector('english', coalesce(regimen_placement, '')), 'C')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_retail_products_search_vector
  ON retail_products USING GIN (search_vector);

COMMENT ON COLUMN retail_products.search_vector IS
  'Full-text search vector from product_name (A), product_function/category (B), ingredients/concerns/regimen (C).';
