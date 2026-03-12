-- WO-TAXONOMY-01: Flat taxonomy_tags table for 500+ cross-hub taxonomy import
-- Owner-approved 2026-03-12
-- Source file: /Users/brucetyndall/Downloads/socelle_taxonomy_full_500plus.csv
-- Import path: Supabase Table Editor -> public.taxonomy_tags -> Import data

CREATE TABLE IF NOT EXISTS public.taxonomy_tags (
  id BIGSERIAL PRIMARY KEY,
  tag_code TEXT NOT NULL UNIQUE,
  display_label TEXT NOT NULL,
  level INT NOT NULL,
  category_group TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS taxonomy_tags_category_group_idx
  ON public.taxonomy_tags (category_group);

CREATE INDEX IF NOT EXISTS taxonomy_tags_level_idx
  ON public.taxonomy_tags (level);

CREATE INDEX IF NOT EXISTS taxonomy_tags_active_group_level_idx
  ON public.taxonomy_tags (is_active, category_group, level);

COMMENT ON TABLE public.taxonomy_tags IS
  'Flat owner-managed taxonomy import table for cross-hub roles, environments, services, products, claims, trends, and regions.';

COMMENT ON COLUMN public.taxonomy_tags.level IS
  '1 = top (environment/role), 2 = services, 3 = products/claims/trends/regions.';

COMMENT ON COLUMN public.taxonomy_tags.category_group IS
  'Cross-hub category family such as pro_environment, medspa_service, product_macro, region, or market_trend.';

CREATE OR REPLACE FUNCTION public.moddatetime()
RETURNS trigger AS $$
BEGIN
  NEW := jsonb_populate_record(NEW, jsonb_build_object(TG_ARGV[0], NOW()));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS taxonomy_tags_set_updated_at ON public.taxonomy_tags;
CREATE TRIGGER taxonomy_tags_set_updated_at
  BEFORE UPDATE ON public.taxonomy_tags
  FOR EACH ROW
  EXECUTE PROCEDURE public.moddatetime('updated_at');

ALTER TABLE public.taxonomy_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "taxonomy_tags_admin_all" ON public.taxonomy_tags;
CREATE POLICY "taxonomy_tags_admin_all" ON public.taxonomy_tags
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'platform_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'platform_admin')
    )
  );

DROP POLICY IF EXISTS "taxonomy_tags_authenticated_read_active" ON public.taxonomy_tags;
CREATE POLICY "taxonomy_tags_authenticated_read_active" ON public.taxonomy_tags
  FOR SELECT TO authenticated
  USING (is_active = true);
