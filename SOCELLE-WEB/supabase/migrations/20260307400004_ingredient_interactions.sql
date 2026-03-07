-- WO-OVERHAUL-12: ingredient_interactions table
-- Pairwise ingredient interaction data (synergistic, avoid, caution, neutral).
-- ADD ONLY — never modify existing migrations.

CREATE TABLE IF NOT EXISTS public.ingredient_interactions (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id_a   uuid        NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  ingredient_id_b   uuid        NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  interaction_type  text        NOT NULL CHECK (interaction_type IN ('synergistic', 'avoid', 'caution', 'neutral')),
  explanation       text,
  source            text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  CHECK (ingredient_id_a < ingredient_id_b)
);

CREATE UNIQUE INDEX IF NOT EXISTS ingredient_interactions_pair_idx
  ON public.ingredient_interactions (ingredient_id_a, ingredient_id_b);

CREATE INDEX IF NOT EXISTS ingredient_interactions_a_idx
  ON public.ingredient_interactions (ingredient_id_a);

CREATE INDEX IF NOT EXISTS ingredient_interactions_b_idx
  ON public.ingredient_interactions (ingredient_id_b);

CREATE INDEX IF NOT EXISTS ingredient_interactions_type_idx
  ON public.ingredient_interactions (interaction_type);

COMMENT ON TABLE public.ingredient_interactions IS
  'Pairwise ingredient interactions. CHECK constraint ensures a < b to prevent duplicate pairs. WO-OVERHAUL-12.';
