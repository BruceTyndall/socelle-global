-- ============================================================
-- SOCELLE GLOBAL — Migration: 20260305000002_vector_search_fn
-- ============================================================
-- Adds the pgvector similarity search helper function used by
-- the ai-orchestrator Edge Function.
-- ============================================================

CREATE OR REPLACE FUNCTION public.match_pro_products(
  query_embedding  vector(1536),
  match_threshold  float DEFAULT 0.75,
  match_count      int   DEFAULT 5
)
RETURNS TABLE (
  id              UUID,
  name            TEXT,
  brand           TEXT,
  sku             TEXT,
  category        TEXT,
  description     TEXT,
  wholesale_price NUMERIC,
  retail_price    NUMERIC,
  similarity      float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    p.id,
    p.name,
    p.brand,
    p.sku,
    p.category,
    p.description,
    p.wholesale_price,
    p.retail_price,
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM public.pro_products p
  WHERE p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;

-- Grant execute to authenticated and service_role
GRANT EXECUTE ON FUNCTION public.match_pro_products TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_pro_products TO service_role;
