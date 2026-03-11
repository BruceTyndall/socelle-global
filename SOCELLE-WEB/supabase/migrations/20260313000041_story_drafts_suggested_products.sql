-- CMS-WO-07 Idea-Mining Revenue Enhancement
-- Adds an array of suggested product UUIDs to story drafts to drive immediate
-- B2B wholesale and retail revenue directly from editorial content.

ALTER TABLE public.story_drafts
ADD COLUMN IF NOT EXISTS suggested_products uuid[] NOT NULL DEFAULT '{}';

-- Create an index to quickly find drafts that refer to specific products
CREATE INDEX IF NOT EXISTS story_drafts_suggested_products_idx
  ON public.story_drafts USING GIN (suggested_products);
