-- WO-OVERHAUL-12: ingredient_collections + ingredient_collection_items
-- Curated groupings: actives, humectants, occlusives, etc.
-- ADD ONLY — never modify existing migrations.

CREATE TABLE IF NOT EXISTS public.ingredient_collections (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text        NOT NULL,
  description     text,
  slug            text        UNIQUE NOT NULL,
  collection_type text        CHECK (collection_type IN (
    'actives', 'humectants', 'occlusives', 'emollients',
    'preservatives', 'exfoliants', 'antioxidants'
  )),
  is_featured     bool        DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ingredient_collections_slug_idx
  ON public.ingredient_collections (slug);

CREATE INDEX IF NOT EXISTS ingredient_collections_type_idx
  ON public.ingredient_collections (collection_type);

CREATE TABLE IF NOT EXISTS public.ingredient_collection_items (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id   uuid        NOT NULL REFERENCES public.ingredient_collections(id) ON DELETE CASCADE,
  ingredient_id   uuid        NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  sort_order      int         DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(collection_id, ingredient_id)
);

CREATE INDEX IF NOT EXISTS ingredient_collection_items_collection_idx
  ON public.ingredient_collection_items (collection_id, sort_order);

COMMENT ON TABLE public.ingredient_collections IS
  'Curated ingredient groupings (actives, humectants, etc.). WO-OVERHAUL-12.';
COMMENT ON TABLE public.ingredient_collection_items IS
  'Junction: which ingredients belong to which collection, with sort order. WO-OVERHAUL-12.';
