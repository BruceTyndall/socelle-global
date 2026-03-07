-- WO-OVERHAUL-12: ingredient_aliases table
-- Trade names, common names, abbreviations for ingredient cross-referencing.
-- ADD ONLY — never modify existing migrations.

CREATE TABLE IF NOT EXISTS public.ingredient_aliases (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id uuid        NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  alias         text        NOT NULL,
  alias_type    text        CHECK (alias_type IN ('trade_name', 'common_name', 'abbreviation')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(ingredient_id, alias)
);

CREATE INDEX IF NOT EXISTS ingredient_aliases_alias_lower_idx
  ON public.ingredient_aliases (lower(alias));

CREATE INDEX IF NOT EXISTS ingredient_aliases_ingredient_id_idx
  ON public.ingredient_aliases (ingredient_id);

COMMENT ON TABLE public.ingredient_aliases IS
  'Alternate names for ingredients — trade names, common names, abbreviations. WO-OVERHAUL-12.';
