-- WO-TAXONOMY-02: Auto-tag RSS items against taxonomy_tags and persist tag assignments
-- Owner-approved 2026-03-12
-- Depends on: WO-TAXONOMY-01 (public.taxonomy_tags import table)
-- Operating specs: INTEL_TAXONOMY_AND_SIGNALS.md + AUTO_TAGGING_RULES.md

CREATE TABLE IF NOT EXISTS public.rss_tag_rules (
  id BIGSERIAL PRIMARY KEY,
  tag_code TEXT NOT NULL,
  category_group TEXT NOT NULL,
  match_type TEXT NOT NULL DEFAULT 'phrase'
    CHECK (match_type IN ('exact', 'phrase', 'regex')),
  keywords TEXT[] NOT NULL DEFAULT '{}',
  context_required TEXT[] NOT NULL DEFAULT '{}',
  exclude_if_tag_codes TEXT[] NOT NULL DEFAULT '{}',
  confidence NUMERIC(4,3) NOT NULL DEFAULT 0.750
    CHECK (confidence BETWEEN 0.0 AND 1.0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rss_tag_rules_tag_code_idx
  ON public.rss_tag_rules (tag_code);

CREATE INDEX IF NOT EXISTS rss_tag_rules_category_group_idx
  ON public.rss_tag_rules (category_group);

CREATE INDEX IF NOT EXISTS rss_tag_rules_active_group_idx
  ON public.rss_tag_rules (is_active, category_group, tag_code);

CREATE INDEX IF NOT EXISTS rss_tag_rules_match_type_idx
  ON public.rss_tag_rules (match_type);

CREATE UNIQUE INDEX IF NOT EXISTS rss_tag_rules_seed_dedup_idx
  ON public.rss_tag_rules (
    tag_code,
    category_group,
    match_type,
    keywords,
    context_required,
    exclude_if_tag_codes
  );

COMMENT ON TABLE public.rss_tag_rules IS
  'Keyword and regex rule registry that maps RSS text to canonical taxonomy_tags.tag_code values.';

COMMENT ON COLUMN public.rss_tag_rules.tag_code IS
  'Canonical tag_code from public.taxonomy_tags. Stored as text so rules can be loaded before the CSV import is complete.';

COMMENT ON COLUMN public.rss_tag_rules.context_required IS
  'Optional extra context terms. At least one must appear in the normalized RSS item text for the rule to apply.';

COMMENT ON COLUMN public.rss_tag_rules.exclude_if_tag_codes IS
  'Tag codes that suppress this rule when they also match the same rss_item_id. Used to avoid broad-plus-specific double tagging.';

DROP TRIGGER IF EXISTS rss_tag_rules_set_updated_at ON public.rss_tag_rules;
CREATE TRIGGER rss_tag_rules_set_updated_at
  BEFORE UPDATE ON public.rss_tag_rules
  FOR EACH ROW
  EXECUTE PROCEDURE public.moddatetime('updated_at');

ALTER TABLE public.rss_tag_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rss_tag_rules_authenticated_read_active" ON public.rss_tag_rules;
CREATE POLICY "rss_tag_rules_authenticated_read_active" ON public.rss_tag_rules
  FOR SELECT TO authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "rss_tag_rules_service_role_all" ON public.rss_tag_rules;
CREATE POLICY "rss_tag_rules_service_role_all" ON public.rss_tag_rules
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "rss_tag_rules_admin_all" ON public.rss_tag_rules;
CREATE POLICY "rss_tag_rules_admin_all" ON public.rss_tag_rules
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'platform_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'platform_admin')
    )
  );

CREATE TABLE IF NOT EXISTS public.rss_item_tags (
  rss_item_id UUID NOT NULL REFERENCES public.rss_items(id) ON DELETE CASCADE,
  tag_code TEXT NOT NULL REFERENCES public.taxonomy_tags(tag_code) ON DELETE CASCADE,
  confidence NUMERIC(4,3) NOT NULL DEFAULT 0.700
    CHECK (confidence BETWEEN 0.0 AND 1.0),
  source TEXT NOT NULL DEFAULT 'rule'
    CHECK (source IN ('rule', 'model', 'manual')),
  rule_id BIGINT REFERENCES public.rss_tag_rules(id) ON DELETE SET NULL,
  matched_keyword TEXT,
  matched_scope TEXT
    CHECK (matched_scope IN ('title', 'description', 'content', 'metadata')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (rss_item_id, tag_code)
);

CREATE INDEX IF NOT EXISTS rss_item_tags_tag_code_idx
  ON public.rss_item_tags (tag_code);

CREATE INDEX IF NOT EXISTS rss_item_tags_source_idx
  ON public.rss_item_tags (source);

CREATE INDEX IF NOT EXISTS rss_item_tags_created_at_idx
  ON public.rss_item_tags (created_at DESC);

COMMENT ON TABLE public.rss_item_tags IS
  'Canonical tag assignments for rss_items. One row per rss_item_id + tag_code, updated by rules/model/manual review.';

COMMENT ON COLUMN public.rss_item_tags.tag_code IS
  'Canonical identifier sourced from public.taxonomy_tags.tag_code.';

COMMENT ON COLUMN public.rss_item_tags.source IS
  'Origin of the assignment: rule, model, or manual.';

DROP TRIGGER IF EXISTS rss_item_tags_set_updated_at ON public.rss_item_tags;
CREATE TRIGGER rss_item_tags_set_updated_at
  BEFORE UPDATE ON public.rss_item_tags
  FOR EACH ROW
  EXECUTE PROCEDURE public.moddatetime('updated_at');

ALTER TABLE public.rss_item_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rss_item_tags_public_read" ON public.rss_item_tags;
CREATE POLICY "rss_item_tags_public_read" ON public.rss_item_tags
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "rss_item_tags_service_role_all" ON public.rss_item_tags;
CREATE POLICY "rss_item_tags_service_role_all" ON public.rss_item_tags
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "rss_item_tags_admin_all" ON public.rss_item_tags;
CREATE POLICY "rss_item_tags_admin_all" ON public.rss_item_tags
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'platform_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'platform_admin')
    )
  );

CREATE OR REPLACE FUNCTION public.normalize_tag_match_text(input_text TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT trim(
    regexp_replace(
      replace(
        replace(
          replace(
            replace(lower(coalesce(input_text, '')), 'med spa', 'medspa'),
            'medical spa',
            'medspa'
          ),
          'micro-needling',
          'microneedling'
        ),
        'u.s.',
        'us'
      ),
      '[^a-z0-9]+',
      ' ',
      'g'
    )
  );
$$;

COMMENT ON FUNCTION public.normalize_tag_match_text(TEXT) IS
  'Normalizes RSS article text for rule matching: lowercase, punctuation stripped, whitespace collapsed, and common beauty-domain spelling variants normalized.';

CREATE OR REPLACE FUNCTION public.auto_tag_rss_items(
  p_source_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 250,
  p_category_group TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_limit INTEGER := GREATEST(1, LEAST(COALESCE(p_limit, 250), 500));
  v_scanned_items INTEGER := 0;
  v_rule_hits INTEGER := 0;
  v_distinct_matches INTEGER := 0;
  v_tag_rows_written INTEGER := 0;
BEGIN
  WITH candidate_items AS (
    SELECT
      ri.id AS rss_item_id,
      lower(coalesce(ri.title, '')) AS title_raw,
      lower(coalesce(ri.description, '')) AS description_raw,
      lower(coalesce(ri.content, '')) AS content_raw,
      public.normalize_tag_match_text(ri.title) AS title_text,
      public.normalize_tag_match_text(ri.description) AS description_text,
      public.normalize_tag_match_text(ri.content) AS content_text,
      public.normalize_tag_match_text(
        concat_ws(
          ' ',
          ri.title,
          ri.description,
          ri.content,
          array_to_string(coalesce(ri.vertical_tags, '{}'::text[]), ' '),
          rs.name,
          rs.category
        )
      ) AS combined_text
    FROM public.rss_items ri
    LEFT JOIN public.rss_sources rs
      ON rs.id = ri.source_id
    WHERE (p_source_id IS NULL OR ri.source_id = p_source_id)
    ORDER BY coalesce(ri.published_at, ri.created_at) DESC, ri.created_at DESC
    LIMIT v_limit
  ),
  candidate_rules AS (
    SELECT
      r.id,
      r.tag_code,
      r.category_group,
      r.match_type,
      r.keywords,
      r.context_required,
      r.exclude_if_tag_codes,
      r.confidence
    FROM public.rss_tag_rules r
    WHERE r.is_active = true
      AND (p_category_group IS NULL OR r.category_group = p_category_group)
  ),
  expanded_rules AS (
    SELECT
      cr.id AS rule_id,
      cr.tag_code,
      cr.category_group,
      cr.match_type,
      cr.context_required,
      cr.exclude_if_tag_codes,
      cr.confidence,
      keyword,
      public.normalize_tag_match_text(keyword) AS normalized_keyword
    FROM candidate_rules cr
    CROSS JOIN LATERAL unnest(cr.keywords) AS keyword
    WHERE coalesce(array_length(cr.keywords, 1), 0) > 0
  ),
  matched_rules AS (
    SELECT
      ci.rss_item_id,
      er.tag_code,
      er.category_group,
      er.rule_id,
      er.keyword,
      er.exclude_if_tag_codes,
      CASE
        WHEN er.match_type = 'regex' AND ci.title_raw ~ er.keyword THEN 'title'
        WHEN er.match_type = 'regex' AND ci.description_raw ~ er.keyword THEN 'description'
        WHEN er.match_type = 'regex' AND ci.content_raw ~ er.keyword THEN 'content'
        WHEN er.match_type = 'exact'
          AND position(' ' || er.normalized_keyword || ' ' IN ' ' || ci.title_text || ' ') > 0 THEN 'title'
        WHEN er.match_type = 'exact'
          AND position(' ' || er.normalized_keyword || ' ' IN ' ' || ci.description_text || ' ') > 0 THEN 'description'
        WHEN er.match_type = 'exact'
          AND position(' ' || er.normalized_keyword || ' ' IN ' ' || ci.content_text || ' ') > 0 THEN 'content'
        WHEN er.match_type = 'exact'
          AND position(' ' || er.normalized_keyword || ' ' IN ' ' || ci.combined_text || ' ') > 0 THEN 'metadata'
        WHEN er.match_type IN ('phrase')
          AND position(er.normalized_keyword IN ci.title_text) > 0 THEN 'title'
        WHEN er.match_type IN ('phrase')
          AND position(er.normalized_keyword IN ci.description_text) > 0 THEN 'description'
        WHEN er.match_type IN ('phrase')
          AND position(er.normalized_keyword IN ci.content_text) > 0 THEN 'content'
        WHEN er.match_type IN ('phrase')
          AND position(er.normalized_keyword IN ci.combined_text) > 0 THEN 'metadata'
        ELSE NULL
      END AS matched_scope,
      LEAST(
        0.98,
        GREATEST(
          0.40,
          er.confidence +
            CASE
              WHEN er.match_type = 'regex' AND ci.title_raw ~ er.keyword THEN 0.05
              WHEN er.match_type = 'regex' AND ci.description_raw ~ er.keyword THEN 0.00
              WHEN er.match_type = 'regex' AND ci.content_raw ~ er.keyword THEN -0.05
              WHEN er.match_type = 'exact'
                AND position(' ' || er.normalized_keyword || ' ' IN ' ' || ci.title_text || ' ') > 0 THEN 0.05
              WHEN er.match_type = 'exact'
                AND position(' ' || er.normalized_keyword || ' ' IN ' ' || ci.description_text || ' ') > 0 THEN 0.00
              WHEN er.match_type = 'exact'
                AND position(' ' || er.normalized_keyword || ' ' IN ' ' || ci.content_text || ' ') > 0 THEN -0.05
              WHEN er.match_type IN ('phrase')
                AND position(er.normalized_keyword IN ci.title_text) > 0 THEN 0.05
              WHEN er.match_type IN ('phrase')
                AND position(er.normalized_keyword IN ci.description_text) > 0 THEN 0.00
              WHEN er.match_type IN ('phrase')
                AND position(er.normalized_keyword IN ci.content_text) > 0 THEN -0.05
              ELSE -0.10
            END
        )
      ) AS matched_confidence
    FROM candidate_items ci
    JOIN expanded_rules er
      ON (
        (er.match_type = 'regex' AND (
          ci.title_raw ~ er.keyword
          OR ci.description_raw ~ er.keyword
          OR ci.content_raw ~ er.keyword
        ))
        OR
        (er.match_type = 'exact' AND (
          position(' ' || er.normalized_keyword || ' ' IN ' ' || ci.combined_text || ' ') > 0
        ))
        OR
        (er.match_type = 'phrase' AND (
          position(er.normalized_keyword IN ci.combined_text) > 0
        ))
      )
    JOIN public.taxonomy_tags tt
      ON tt.tag_code = er.tag_code
     AND tt.category_group = er.category_group
     AND tt.is_active = true
    WHERE (
      coalesce(array_length(er.context_required, 1), 0) = 0
      OR EXISTS (
        SELECT 1
        FROM unnest(er.context_required) AS ctx
        WHERE position(public.normalize_tag_match_text(ctx) IN ci.combined_text) > 0
      )
    )
  ),
  resolved_matches AS (
    SELECT DISTINCT ON (mr.rss_item_id, mr.tag_code)
      mr.rss_item_id,
      mr.tag_code,
      mr.rule_id,
      mr.keyword,
      mr.matched_scope,
      mr.matched_confidence
    FROM matched_rules mr
    WHERE mr.matched_scope IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM matched_rules blocker
        WHERE blocker.rss_item_id = mr.rss_item_id
          AND blocker.tag_code = ANY(mr.exclude_if_tag_codes)
      )
    ORDER BY mr.rss_item_id, mr.tag_code, mr.matched_confidence DESC, mr.rule_id ASC
  ),
  upserted_tags AS (
    INSERT INTO public.rss_item_tags AS target (
      rss_item_id,
      tag_code,
      confidence,
      source,
      rule_id,
      matched_keyword,
      matched_scope
    )
    SELECT
      rm.rss_item_id,
      rm.tag_code,
      rm.matched_confidence,
      'rule',
      rm.rule_id,
      rm.keyword,
      rm.matched_scope
    FROM resolved_matches rm
    ON CONFLICT (rss_item_id, tag_code) DO UPDATE
    SET
      confidence = CASE
        WHEN target.source = 'manual' THEN target.confidence
        ELSE GREATEST(target.confidence, EXCLUDED.confidence)
      END,
      source = CASE
        WHEN target.source = 'manual' THEN target.source
        ELSE EXCLUDED.source
      END,
      rule_id = CASE
        WHEN target.source = 'manual' THEN target.rule_id
        ELSE EXCLUDED.rule_id
      END,
      matched_keyword = CASE
        WHEN target.source = 'manual' THEN target.matched_keyword
        ELSE EXCLUDED.matched_keyword
      END,
      matched_scope = CASE
        WHEN target.source = 'manual' THEN target.matched_scope
        ELSE EXCLUDED.matched_scope
      END
    RETURNING 1
  )
  SELECT
    (SELECT COUNT(*) FROM candidate_items),
    (SELECT COUNT(*) FROM matched_rules WHERE matched_scope IS NOT NULL),
    (SELECT COUNT(*) FROM resolved_matches),
    (SELECT COUNT(*) FROM upserted_tags)
  INTO
    v_scanned_items,
    v_rule_hits,
    v_distinct_matches,
    v_tag_rows_written;

  RETURN jsonb_build_object(
    'scanned_items', v_scanned_items,
    'rule_hits', v_rule_hits,
    'distinct_matches', v_distinct_matches,
    'tag_rows_written', v_tag_rows_written,
    'category_group', p_category_group,
    'source_id', p_source_id,
    'limit_used', v_limit
  );
END;
$$;

COMMENT ON FUNCTION public.auto_tag_rss_items(UUID, INTEGER, TEXT) IS
  'Best-effort keyword tagging RPC for rss_items. Uses public.taxonomy_tags as the canonical tag registry and upserts public.rss_item_tags.';

REVOKE ALL ON FUNCTION public.auto_tag_rss_items(UUID, INTEGER, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auto_tag_rss_items(UUID, INTEGER, TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.auto_tag_rss_items(UUID, INTEGER, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.auto_tag_rss_items(UUID, INTEGER, TEXT) TO service_role;

INSERT INTO public.rss_tag_rules (
  tag_code,
  category_group,
  match_type,
  keywords,
  context_required,
  exclude_if_tag_codes,
  confidence
)
VALUES
  ('medspa', 'pro_environment', 'phrase', ARRAY['medspa', 'med spa', 'medical spa'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.900),
  ('dermatology_clinic', 'pro_environment', 'phrase', ARRAY['dermatology clinic', 'dermatology practice', 'dermatology center'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.850),
  ('aesthetic_clinic', 'pro_environment', 'phrase', ARRAY['aesthetic clinic', 'aesthetics clinic', 'cosmetic clinic'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.840),
  ('plastic_surgery_practice', 'pro_environment', 'phrase', ARRAY['plastic surgery practice', 'plastic surgeon', 'cosmetic surgery clinic'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.840),
  ('hair_salon', 'pro_environment', 'phrase', ARRAY['hair salon', 'hairdresser', 'hairdressing salon'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.850),
  ('beauty_salon', 'pro_environment', 'phrase', ARRAY['beauty salon'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.820),
  ('nail_salon', 'pro_environment', 'phrase', ARRAY['nail salon', 'nail bar', 'manicure studio'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.850),
  ('day_spa', 'pro_environment', 'phrase', ARRAY['day spa'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.900),
  ('spa', 'pro_environment', 'phrase', ARRAY['spa'], ARRAY['massage', 'facial', 'retreat', 'wellness'], ARRAY[]::TEXT[], 0.720),
  ('lash_brow_studio', 'pro_environment', 'phrase', ARRAY['lash studio', 'brow studio', 'lash brow studio', 'lash & brow studio'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.880),
  ('brow_bar', 'pro_environment', 'phrase', ARRAY['brow bar'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.900),
  ('rf_microneedling', 'medspa_service', 'phrase', ARRAY['rf microneedling', 'radiofrequency microneedling', 'rf micro needling'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.950),
  ('microneedling', 'medspa_service', 'phrase', ARRAY['microneedling', 'micro needling', 'micro-needling'], ARRAY[]::TEXT[], ARRAY['rf_microneedling'], 0.900),
  ('hydrafacial', 'medspa_service', 'phrase', ARRAY['hydrafacial', 'hydra facial', 'hydra-facial'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.950),
  ('chemical_peel_light', 'medspa_service', 'phrase', ARRAY['light chemical peel', 'superficial chemical peel'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.800),
  ('chemical_peel_medium', 'medspa_service', 'phrase', ARRAY['medium depth chemical peel', 'medium-depth chemical peel', 'medium depth peel'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.800),
  ('chemical_peel_deep', 'medspa_service', 'phrase', ARRAY['deep chemical peel', 'phenol peel'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.850),
  ('semaglutide_weight_loss', 'medspa_service', 'phrase', ARRAY['semaglutide', 'glp 1 weight loss', 'ozempic for weight loss', 'wegovy'], ARRAY['clinic', 'medspa', 'medical spa', 'weight loss'], ARRAY[]::TEXT[], 0.900),
  ('laser_hair_removal', 'medspa_service', 'phrase', ARRAY['laser hair removal', 'lhr treatment'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.900),
  ('ipl_photofacial', 'medspa_service', 'phrase', ARRAY['ipl photofacial', 'intense pulsed light facial', 'photofacial'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.900),
  ('thread_lift', 'medspa_service', 'phrase', ARRAY['thread lift', 'pdo threads', 'lifting threads'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.900),
  ('body_contouring', 'body_device_service', 'phrase', ARRAY['body contouring', 'body shaping', 'body sculpting'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.850),
  ('cryolipolysis_fat_freezing', 'body_device_service', 'phrase', ARRAY['cryolipolysis', 'fat freezing', 'coolsculpting'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.900),
  ('rf_body_contouring', 'body_device_service', 'phrase', ARRAY['rf body contouring', 'radiofrequency body contouring'], ARRAY[]::TEXT[], ARRAY['body contouring'], 0.900),
  ('skin_tightening_face', 'body_device_service', 'phrase', ARRAY['skin tightening', 'face tightening'], ARRAY['face', 'facial'], ARRAY[]::TEXT[], 0.820),
  ('skin_tightening_body', 'body_device_service', 'phrase', ARRAY['skin tightening', 'body tightening'], ARRAY['body'], ARRAY[]::TEXT[], 0.820),
  ('massage_therapy', 'spa_wellness_service', 'phrase', ARRAY['massage therapy', 'therapeutic massage'], ARRAY[]::TEXT[], ARRAY['swedish_massage', 'deep_tissue_massage', 'hot_stone_massage'], 0.800),
  ('swedish_massage', 'spa_wellness_service', 'phrase', ARRAY['swedish massage'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.900),
  ('deep_tissue_massage', 'spa_wellness_service', 'phrase', ARRAY['deep tissue massage'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.900),
  ('hot_stone_massage', 'spa_wellness_service', 'phrase', ARRAY['hot stone massage'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.900),
  ('sauna_circuit', 'spa_wellness_service', 'phrase', ARRAY['sauna circuit', 'thermal circuit', 'thermal spa circuit'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.800),
  ('wellness_retreat_package', 'spa_wellness_service', 'phrase', ARRAY['wellness retreat', 'wellness weekend', 'wellness getaway'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.800),
  ('balayage', 'hair_service', 'phrase', ARRAY['balayage', 'balayage highlights'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.950),
  ('vivid_fashion_color', 'hair_service', 'phrase', ARRAY['vivid color', 'fashion color', 'bright fashion shades'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.850),
  ('keratin_smoothing_treatment', 'hair_service', 'phrase', ARRAY['keratin smoothing', 'keratin treatment', 'brazilian blowout'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.900),
  ('curly_cut_specialty', 'hair_service', 'phrase', ARRAY['curly cut', 'curly hair specialist', 'curl specialist', 'deva cut'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.850),
  ('hair_extensions_install', 'hair_service', 'phrase', ARRAY['hair extensions', 'extension install', 'tape in extensions', 'weft extensions'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.900),
  ('gelx_nails', 'nail_lash_brow_service', 'phrase', ARRAY['gel x', 'gelx nails', 'apres gel x'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.950),
  ('dip_powder_nails', 'nail_lash_brow_service', 'phrase', ARRAY['dip powder', 'sns nails'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.900),
  ('russian_manicure', 'nail_lash_brow_service', 'phrase', ARRAY['russian manicure'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.950),
  ('lash_extensions_volume', 'nail_lash_brow_service', 'phrase', ARRAY['volume lash extensions', 'russian volume lashes'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.900),
  ('brow_lamination', 'nail_lash_brow_service', 'phrase', ARRAY['brow lamination'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.950),
  ('brazilian_wax', 'nail_lash_brow_service', 'phrase', ARRAY['brazilian wax'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.950),
  ('sugaring_hair_removal', 'nail_lash_brow_service', 'phrase', ARRAY['sugaring hair removal', 'sugar wax'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.900),
  ('clean_beauty', 'claim_regulation', 'phrase', ARRAY['clean beauty', 'clean formulation', 'free from parabens and sulfates'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.850),
  ('microbiome_friendly_claim', 'claim_regulation', 'phrase', ARRAY['microbiome friendly', 'supports the skin microbiome', 'balances the microbiome'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.900),
  ('non_comedogenic', 'claim_regulation', 'phrase', ARRAY['non comedogenic', 'non-comedogenic'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.950),
  ('mocra_compliance', 'claim_regulation', 'phrase', ARRAY['mocra compliant', 'mocra compliance', 'cosmetic product facility registration'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.900),
  ('safety_recall_notice', 'claim_regulation', 'phrase', ARRAY['recall', 'safety notice', 'safety alert'], ARRAY['beauty', 'cosmetic', 'skincare', 'haircare'], ARRAY[]::TEXT[], 0.820),
  ('us_beauty_market', 'region', 'phrase', ARRAY['us beauty market', 'united states beauty market', 'u.s. beauty market'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.880),
  ('uk_beauty_market', 'region', 'phrase', ARRAY['uk beauty market', 'united kingdom beauty market'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.880),
  ('eu_beauty_market', 'region', 'phrase', ARRAY['eu beauty market', 'european union beauty market'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.880),
  ('asia_pacific_beauty', 'region', 'phrase', ARRAY['asia pacific beauty', 'apac beauty', 'asia pacific market'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.860),
  ('korea_beauty_market', 'region', 'phrase', ARRAY['k beauty', 'korean beauty', 'k beauty market'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.860),
  ('japan_beauty_market', 'region', 'phrase', ARRAY['j beauty', 'japanese beauty', 'j beauty market'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.860),
  ('beauty_industry_news', 'market_trend', 'phrase', ARRAY['beauty industry', 'beauty business'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.650),
  ('professional_beauty_news', 'market_trend', 'phrase', ARRAY['professional beauty'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.700),
  ('medspa_market_trends', 'market_trend', 'phrase', ARRAY['medspa market', 'medical spa market', 'medspa trend'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.780),
  ('spa_market_trends', 'market_trend', 'phrase', ARRAY['spa market', 'spa trend'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.760),
  ('salon_market_trends', 'market_trend', 'phrase', ARRAY['salon market', 'salon trend'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.760),
  ('hair_trends', 'market_trend', 'phrase', ARRAY['hair trends', 'hair trend'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.740),
  ('skincare_trends', 'market_trend', 'phrase', ARRAY['skincare trends', 'skin care trends'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.740),
  ('premiumization_trend', 'market_trend', 'phrase', ARRAY['premiumization', 'premium beauty'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.760),
  ('social_commerce_beauty', 'market_trend', 'phrase', ARRAY['social commerce beauty', 'beauty social commerce', 'tiktok shop beauty'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.800),
  ('pricing_trend', 'market_trend', 'phrase', ARRAY['pricing trend', 'price increase', 'price hike'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.780),
  ('consumer_preference_shift', 'market_trend', 'phrase', ARRAY['consumer preference shift', 'shifting consumer demand', 'consumer behavior'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], 0.760)
ON CONFLICT DO NOTHING;
