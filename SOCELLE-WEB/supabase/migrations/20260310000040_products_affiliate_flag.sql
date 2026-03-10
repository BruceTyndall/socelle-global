-- Migration: Add affiliate flag columns to products table
-- WO: COMMERCE-WO-03 — FTC-compliant affiliate badge enforcement
-- Adds is_affiliated, affiliate_url, affiliate_disclosure to products

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_affiliated BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS affiliate_url TEXT,
  ADD COLUMN IF NOT EXISTS affiliate_disclosure TEXT;

-- Index for fast filtering on affiliated products
CREATE INDEX IF NOT EXISTS idx_products_is_affiliated ON products(is_affiliated)
  WHERE is_affiliated = true;

COMMENT ON COLUMN products.is_affiliated IS
  'True when SOCELLE earns a commission on this product. Triggers FTC disclosure badge per COMMERCE-WO-03.';
COMMENT ON COLUMN products.affiliate_url IS
  'External affiliate/distributor URL for commission-tracked purchases.';
COMMENT ON COLUMN products.affiliate_disclosure IS
  'Optional override disclosure text. Falls back to standard FTC disclosure if NULL.';
