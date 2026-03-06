-- ── Phase 3: pgvector — semantic similarity for protocol matching ─────────────
-- Requires Supabase project with pgvector enabled (available on Pro plan +)
-- Run: supabase db push

-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ── Add embedding columns ─────────────────────────────────────────────────────

ALTER TABLE canonical_protocols
  ADD COLUMN IF NOT EXISTS embedding vector(1536),
  ADD COLUMN IF NOT EXISTS embedding_updated_at timestamptz;

ALTER TABLE retail_products
  ADD COLUMN IF NOT EXISTS embedding vector(1536),
  ADD COLUMN IF NOT EXISTS embedding_updated_at timestamptz;

ALTER TABLE pro_products
  ADD COLUMN IF NOT EXISTS embedding vector(1536),
  ADD COLUMN IF NOT EXISTS embedding_updated_at timestamptz;

-- ── IVFFlat indexes for fast cosine similarity ────────────────────────────────
-- lists = sqrt(num_rows) is a reasonable starting value; tune after data load

CREATE INDEX IF NOT EXISTS protocols_embedding_idx
  ON canonical_protocols
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);

CREATE INDEX IF NOT EXISTS retail_products_embedding_idx
  ON retail_products
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS pro_products_embedding_idx
  ON pro_products
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ── RPC: match_protocols ──────────────────────────────────────────────────────
-- Returns protocols ordered by cosine similarity to the query embedding.
-- Used by the mapping engine for semantic scoring.

CREATE OR REPLACE FUNCTION match_protocols(
  query_embedding   vector(1536),
  match_threshold   float    DEFAULT 0.70,
  match_count       int      DEFAULT 5,
  p_brand_id        uuid     DEFAULT NULL
)
RETURNS TABLE (
  id               uuid,
  protocol_name    text,
  category         text,
  target_concerns  text[],
  similarity       float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id,
    cp.protocol_name,
    cp.category,
    cp.target_concerns,
    1 - (cp.embedding <=> query_embedding) AS similarity
  FROM canonical_protocols cp
  WHERE
    cp.embedding IS NOT NULL
    AND (p_brand_id IS NULL OR cp.brand_id = p_brand_id)
    AND 1 - (cp.embedding <=> query_embedding) >= match_threshold
  ORDER BY cp.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ── RPC: match_retail_products ────────────────────────────────────────────────
-- Returns retail products by semantic similarity — used for retail attach.

CREATE OR REPLACE FUNCTION match_retail_products(
  query_embedding   vector(1536),
  match_threshold   float    DEFAULT 0.68,
  match_count       int      DEFAULT 5,
  p_brand_id        uuid     DEFAULT NULL
)
RETURNS TABLE (
  id               uuid,
  product_name     text,
  category         text,
  target_concerns  text[],
  retail_price     numeric,
  similarity       float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rp.id,
    rp.product_name,
    rp.category,
    rp.target_concerns,
    rp.retail_price,
    1 - (rp.embedding <=> query_embedding) AS similarity
  FROM retail_products rp
  WHERE
    rp.embedding IS NOT NULL
    AND (p_brand_id IS NULL OR rp.brand_id = p_brand_id)
    AND 1 - (rp.embedding <=> query_embedding) >= match_threshold
  ORDER BY rp.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ── Table: embedding_queue ────────────────────────────────────────────────────
-- Tracks which rows need embeddings generated or refreshed.
-- The generate-embeddings edge function polls this table.

CREATE TABLE IF NOT EXISTS embedding_queue (
  id            bigserial PRIMARY KEY,
  table_name    text        NOT NULL,
  row_id        uuid        NOT NULL,
  content_hash  text        NOT NULL,  -- SHA-256 of the text that was embedded
  status        text        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'processing', 'done', 'error')),
  error_message text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  processed_at  timestamptz,
  UNIQUE (table_name, row_id)
);

ALTER TABLE embedding_queue ENABLE ROW LEVEL SECURITY;

-- Only service role can manage the queue
CREATE POLICY "service_role_only" ON embedding_queue
  USING (auth.role() = 'service_role');

-- Index for polling pending jobs
CREATE INDEX IF NOT EXISTS embedding_queue_status_idx
  ON embedding_queue (status, created_at)
  WHERE status = 'pending';

-- ── Trigger helpers: auto-enqueue on content change ──────────────────────────

CREATE OR REPLACE FUNCTION enqueue_protocol_embedding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO embedding_queue (table_name, row_id, content_hash, status)
  VALUES (
    'canonical_protocols',
    NEW.id,
    md5(COALESCE(NEW.protocol_name, '') || COALESCE(NEW.description, '') || COALESCE(array_to_string(NEW.target_concerns, ' '), '')),
    'pending'
  )
  ON CONFLICT (table_name, row_id)
  DO UPDATE SET
    content_hash = EXCLUDED.content_hash,
    status       = CASE WHEN embedding_queue.content_hash != EXCLUDED.content_hash THEN 'pending' ELSE embedding_queue.status END,
    processed_at = NULL;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_protocol_embedding_enqueue
  AFTER INSERT OR UPDATE OF protocol_name, description, target_concerns
  ON canonical_protocols
  FOR EACH ROW EXECUTE FUNCTION enqueue_protocol_embedding();

CREATE OR REPLACE FUNCTION enqueue_retail_product_embedding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO embedding_queue (table_name, row_id, content_hash, status)
  VALUES (
    'retail_products',
    NEW.id,
    md5(COALESCE(NEW.product_name, '') || COALESCE(NEW.product_function, '') || COALESCE(array_to_string(NEW.target_concerns, ' '), '')),
    'pending'
  )
  ON CONFLICT (table_name, row_id)
  DO UPDATE SET
    content_hash = EXCLUDED.content_hash,
    status       = CASE WHEN embedding_queue.content_hash != EXCLUDED.content_hash THEN 'pending' ELSE embedding_queue.status END,
    processed_at = NULL;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_retail_product_embedding_enqueue
  AFTER INSERT OR UPDATE OF product_name, product_function, target_concerns
  ON retail_products
  FOR EACH ROW EXECUTE FUNCTION enqueue_retail_product_embedding();
