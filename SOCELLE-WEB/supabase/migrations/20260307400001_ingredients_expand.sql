-- WO-OVERHAUL-12: Expand ingredients table with additional columns
-- ADD ONLY — never modify existing migrations.

ALTER TABLE public.ingredients ADD COLUMN IF NOT EXISTS ewg_score int CHECK (ewg_score BETWEEN 1 AND 10);
ALTER TABLE public.ingredients ADD COLUMN IF NOT EXISTS ewg_score_source text;
ALTER TABLE public.ingredients ADD COLUMN IF NOT EXISTS ewg_score_updated_at timestamptz;
ALTER TABLE public.ingredients ADD COLUMN IF NOT EXISTS comedogenic_rating int CHECK (comedogenic_rating BETWEEN 0 AND 5);
ALTER TABLE public.ingredients ADD COLUMN IF NOT EXISTS skin_types text[] DEFAULT '{}';
ALTER TABLE public.ingredients ADD COLUMN IF NOT EXISTS benefits text[] DEFAULT '{}';
ALTER TABLE public.ingredients ADD COLUMN IF NOT EXISTS concerns text[] DEFAULT '{}';
ALTER TABLE public.ingredients ADD COLUMN IF NOT EXISTS is_vegan bool;
ALTER TABLE public.ingredients ADD COLUMN IF NOT EXISTS is_cruelty_free bool;
ALTER TABLE public.ingredients ADD COLUMN IF NOT EXISTS is_natural bool;
ALTER TABLE public.ingredients ADD COLUMN IF NOT EXISTS is_fragrance bool;
ALTER TABLE public.ingredients ADD COLUMN IF NOT EXISTS is_allergen bool;
ALTER TABLE public.ingredients ADD COLUMN IF NOT EXISTS restricted_regions text[] DEFAULT '{}';
ALTER TABLE public.ingredients ADD COLUMN IF NOT EXISTS source_api text;
ALTER TABLE public.ingredients ADD COLUMN IF NOT EXISTS source_id text;
ALTER TABLE public.ingredients ADD COLUMN IF NOT EXISTS raw_data jsonb DEFAULT '{}';

-- Indexes for common filter queries
CREATE INDEX IF NOT EXISTS ingredients_ewg_score_idx ON public.ingredients (ewg_score) WHERE ewg_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS ingredients_comedogenic_idx ON public.ingredients (comedogenic_rating) WHERE comedogenic_rating IS NOT NULL;
CREATE INDEX IF NOT EXISTS ingredients_vegan_idx ON public.ingredients (is_vegan) WHERE is_vegan = true;

COMMENT ON COLUMN public.ingredients.ewg_score IS 'EWG Skin Deep hazard score 1-10. Source tracked in ewg_score_source.';
COMMENT ON COLUMN public.ingredients.comedogenic_rating IS 'Comedogenic rating 0 (non-comedogenic) to 5 (highly comedogenic).';
COMMENT ON COLUMN public.ingredients.skin_types IS 'Suitable skin types: oily, dry, combination, sensitive, normal, all.';
COMMENT ON COLUMN public.ingredients.raw_data IS 'Raw API response data for provenance/audit trail.';
