-- WO-TAXONOMY-03: Canonical taxonomy fields on market_signals + tag performance views
-- Purpose:
--   1. Persist tag-derived intelligence fields directly on market_signals
--   2. Backfill existing RSS-promoted signals where the taxonomy is already available
--   3. Expose query-ready views for tag performance, tag hygiene, and co-occurrence
-- ADD ONLY — never modify this file after applying to production.

ALTER TABLE public.market_signals
  ADD COLUMN IF NOT EXISTS rss_item_id UUID REFERENCES public.rss_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS primary_environment TEXT,
  ADD COLUMN IF NOT EXISTS primary_vertical TEXT,
  ADD COLUMN IF NOT EXISTS service_tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS product_tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS claim_tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS region_tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS trend_tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS brand_names TEXT[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS sentiment TEXT,
  ADD COLUMN IF NOT EXISTS score_importance NUMERIC(5,2) NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'market_signals_sentiment_check'
  ) THEN
    ALTER TABLE public.market_signals
      ADD CONSTRAINT market_signals_sentiment_check
      CHECK (sentiment IN ('positive', 'neutral', 'negative'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'market_signals_score_importance_range'
  ) THEN
    ALTER TABLE public.market_signals
      ADD CONSTRAINT market_signals_score_importance_range
      CHECK (score_importance BETWEEN 0 AND 10);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_market_signals_rss_item_id
  ON public.market_signals (rss_item_id);

CREATE INDEX IF NOT EXISTS idx_market_signals_primary_environment
  ON public.market_signals (primary_environment);

CREATE INDEX IF NOT EXISTS idx_market_signals_primary_vertical
  ON public.market_signals (primary_vertical);

CREATE INDEX IF NOT EXISTS idx_market_signals_score_importance
  ON public.market_signals (score_importance DESC);

CREATE INDEX IF NOT EXISTS idx_market_signals_service_tags
  ON public.market_signals USING GIN (service_tags);

CREATE INDEX IF NOT EXISTS idx_market_signals_claim_tags
  ON public.market_signals USING GIN (claim_tags);

CREATE INDEX IF NOT EXISTS idx_market_signals_region_tags
  ON public.market_signals USING GIN (region_tags);

CREATE INDEX IF NOT EXISTS idx_market_signals_trend_tags
  ON public.market_signals USING GIN (trend_tags);

COMMENT ON COLUMN public.market_signals.rss_item_id IS
  'WO-TAXONOMY-03: Canonical provenance link back to public.rss_items for tag rollups, audits, and explainability.';

COMMENT ON COLUMN public.market_signals.primary_environment IS
  'WO-TAXONOMY-03: Highest-priority pro_environment tag assigned to the underlying RSS item.';

COMMENT ON COLUMN public.market_signals.primary_vertical IS
  'WO-TAXONOMY-03: Service-led vertical classification (medspa_service, hair_service, nail_lash_brow_service, spa_wellness_service).';

COMMENT ON COLUMN public.market_signals.service_tags IS
  'WO-TAXONOMY-03: Canonical service tag_code array derived from taxonomy_tags category groups ending in _service.';

COMMENT ON COLUMN public.market_signals.product_tags IS
  'WO-TAXONOMY-03: Canonical product and product-line tag_code array.';

COMMENT ON COLUMN public.market_signals.claim_tags IS
  'WO-TAXONOMY-03: Canonical claims, regulation, and safety tag_code array.';

COMMENT ON COLUMN public.market_signals.region_tags IS
  'WO-TAXONOMY-03: Canonical region tag_code array.';

COMMENT ON COLUMN public.market_signals.trend_tags IS
  'WO-TAXONOMY-03: Canonical market trend tag_code array.';

COMMENT ON COLUMN public.market_signals.brand_names IS
  'WO-TAXONOMY-03: Brand names mentioned by the underlying RSS item, normalized into a dedicated analytics field.';

COMMENT ON COLUMN public.market_signals.sentiment IS
  'WO-TAXONOMY-03: Lightweight deterministic sentiment label for dashboards and tag-health scoring.';

COMMENT ON COLUMN public.market_signals.score_importance IS
  'WO-TAXONOMY-03: 0-10 importance heuristic combining environment, service, claim, and impact signals.';

-- Backfill canonical rss_item_id for existing RSS-promoted signals.
UPDATE public.market_signals AS ms
SET rss_item_id = ri.id
FROM public.rss_items AS ri
WHERE ms.source_type = 'rss'
  AND ms.external_id = ri.guid
  AND ms.rss_item_id IS NULL;

WITH tag_rollups AS (
  SELECT
    ms.id AS signal_id,
    array_remove(array_agg(DISTINCT CASE WHEN tt.category_group = 'pro_environment' THEN tt.tag_code END), NULL) AS environment_tags,
    array_remove(array_agg(DISTINCT CASE WHEN tt.category_group LIKE '%_service' THEN tt.tag_code END), NULL) AS service_tags,
    array_remove(array_agg(DISTINCT CASE WHEN tt.category_group = 'medspa_service' THEN tt.tag_code END), NULL) AS medspa_service_tags,
    array_remove(array_agg(DISTINCT CASE WHEN tt.category_group = 'body_device_service' THEN tt.tag_code END), NULL) AS body_device_service_tags,
    array_remove(array_agg(DISTINCT CASE WHEN tt.category_group = 'hair_service' THEN tt.tag_code END), NULL) AS hair_service_tags,
    array_remove(array_agg(DISTINCT CASE WHEN tt.category_group = 'nail_lash_brow_service' THEN tt.tag_code END), NULL) AS nail_service_tags,
    array_remove(array_agg(DISTINCT CASE WHEN tt.category_group = 'spa_wellness_service' THEN tt.tag_code END), NULL) AS spa_service_tags,
    array_remove(array_agg(DISTINCT CASE WHEN tt.category_group IN (
      'pro_product_line',
      'product_macro',
      'skincare_product',
      'hair_body_product',
      'color_cosmetic'
    ) THEN tt.tag_code END), NULL) AS product_tags,
    array_remove(array_agg(DISTINCT CASE WHEN tt.category_group = 'claim_regulation' THEN tt.tag_code END), NULL) AS claim_tags,
    array_remove(array_agg(DISTINCT CASE WHEN tt.category_group = 'region' THEN tt.tag_code END), NULL) AS region_tags,
    array_remove(array_agg(DISTINCT CASE WHEN tt.category_group = 'market_trend' THEN tt.tag_code END), NULL) AS trend_tags
  FROM public.market_signals AS ms
  JOIN public.rss_item_tags AS rit
    ON rit.rss_item_id = ms.rss_item_id
  JOIN public.taxonomy_tags AS tt
    ON tt.tag_code = rit.tag_code
   AND tt.is_active = true
  GROUP BY ms.id
),
resolved AS (
  SELECT
    signal_id,
    COALESCE(
      (
        SELECT env
        FROM unnest(COALESCE(environment_tags, '{}'::text[])) WITH ORDINALITY AS ranked(env, ord)
        ORDER BY
          CASE env
            WHEN 'medspa' THEN 1
            WHEN 'dermatology_clinic' THEN 2
            WHEN 'aesthetic_clinic' THEN 3
            WHEN 'plastic_surgery_practice' THEN 4
            ELSE 100
          END,
          ord
        LIMIT 1
      ),
      NULL
    ) AS primary_environment,
    CASE
      WHEN COALESCE(cardinality(medspa_service_tags), 0) > 0
        OR COALESCE(cardinality(body_device_service_tags), 0) > 0
        THEN 'medspa_service'
      WHEN COALESCE(cardinality(hair_service_tags), 0) > 0
        THEN 'hair_service'
      WHEN COALESCE(cardinality(nail_service_tags), 0) > 0
        THEN 'nail_lash_brow_service'
      WHEN COALESCE(cardinality(spa_service_tags), 0) > 0
        THEN 'spa_wellness_service'
      ELSE NULL
    END AS primary_vertical,
    COALESCE(service_tags, '{}'::text[]) AS service_tags,
    COALESCE(product_tags, '{}'::text[]) AS product_tags,
    COALESCE(claim_tags, '{}'::text[]) AS claim_tags,
    COALESCE(region_tags, '{}'::text[]) AS region_tags,
    COALESCE(trend_tags, '{}'::text[]) AS trend_tags
  FROM tag_rollups
)
UPDATE public.market_signals AS ms
SET
  primary_environment = COALESCE(ms.primary_environment, resolved.primary_environment),
  primary_vertical = COALESCE(ms.primary_vertical, resolved.primary_vertical),
  service_tags = CASE
    WHEN ms.service_tags = '{}'::text[] THEN resolved.service_tags
    ELSE ms.service_tags
  END,
  product_tags = CASE
    WHEN ms.product_tags = '{}'::text[] THEN resolved.product_tags
    ELSE ms.product_tags
  END,
  claim_tags = CASE
    WHEN ms.claim_tags = '{}'::text[] THEN resolved.claim_tags
    ELSE ms.claim_tags
  END,
  region_tags = CASE
    WHEN ms.region_tags = '{}'::text[] THEN resolved.region_tags
    ELSE ms.region_tags
  END,
  trend_tags = CASE
    WHEN ms.trend_tags = '{}'::text[] THEN resolved.trend_tags
    ELSE ms.trend_tags
  END
FROM resolved
WHERE ms.id = resolved.signal_id;

UPDATE public.market_signals
SET product_tags = related_products
WHERE product_tags = '{}'::text[]
  AND COALESCE(cardinality(related_products), 0) > 0;

UPDATE public.market_signals
SET brand_names = related_brands
WHERE brand_names = '{}'::text[]
  AND COALESCE(cardinality(related_brands), 0) > 0;

UPDATE public.market_signals
SET region_tags = ARRAY[COALESCE(geo_source, region)]
WHERE region_tags = '{}'::text[]
  AND COALESCE(geo_source, region) IS NOT NULL;

UPDATE public.market_signals
SET primary_vertical = vertical
WHERE primary_vertical IS NULL
  AND vertical IS NOT NULL;

UPDATE public.market_signals
SET sentiment = CASE
  WHEN lower(COALESCE(title, '') || ' ' || COALESCE(description, '')) ~
    '(recall|lawsuit|fined|warning letter|safety issue|adverse event|withdrawal|ban\b)'
    THEN 'negative'
  WHEN lower(COALESCE(title, '') || ' ' || COALESCE(description, '')) ~
    '(record growth|expansion|award|partnership|launch|funding|opens|opening|acquisition|breakthrough)'
    THEN 'positive'
  ELSE 'neutral'
END
WHERE sentiment IS NULL;

UPDATE public.market_signals
SET score_importance = LEAST(
  10,
  ROUND(
    (
      1
      + CASE WHEN primary_environment IS NOT NULL THEN 1 ELSE 0 END
      + CASE WHEN COALESCE(cardinality(service_tags), 0) > 0 THEN 1 ELSE 0 END
      + CASE WHEN COALESCE(cardinality(claim_tags), 0) > 0 THEN 1 ELSE 0 END
      + LEAST(COALESCE(impact_score, 0) / 25.0, 4)
    )::numeric,
    2
  )
)
WHERE score_importance = 0;

CREATE OR REPLACE VIEW public.v_signal_tag_assignments AS
SELECT
  ms.id AS signal_id,
  ms.rss_item_id,
  ms.title AS signal_title,
  ms.published_at AS signal_published_at,
  ms.created_at AS signal_created_at,
  ms.source_name,
  ms.source_domain,
  ms.primary_environment,
  ms.primary_vertical,
  ms.tier_min,
  ms.confidence_score,
  ms.score_importance,
  ms.sentiment,
  rit.tag_code,
  tt.display_label,
  tt.level,
  tt.category_group,
  rit.confidence AS tag_confidence,
  rit.source AS tag_source
FROM public.market_signals AS ms
JOIN public.rss_item_tags AS rit
  ON rit.rss_item_id = ms.rss_item_id
JOIN public.taxonomy_tags AS tt
  ON tt.tag_code = rit.tag_code
 AND tt.is_active = true;

COMMENT ON VIEW public.v_signal_tag_assignments IS
  'WO-TAXONOMY-03: One row per signal/tag pairing. Powers tag reach, source diversity, and tag-health analysis.';

CREATE OR REPLACE VIEW public.v_tag_signal_metrics_30d AS
SELECT
  tag_code,
  max(display_label) AS display_label,
  max(level) AS level,
  max(category_group) AS category_group,
  COUNT(DISTINCT signal_id) AS signal_count,
  COUNT(DISTINCT COALESCE(source_domain, source_name, 'unknown')) AS source_diversity,
  AVG(tag_confidence)::numeric(5,3) AS avg_tag_confidence,
  AVG(score_importance)::numeric(5,2) AS avg_score_importance,
  MAX(signal_published_at) AS last_published_at
FROM public.v_signal_tag_assignments
WHERE COALESCE(signal_published_at, signal_created_at) >= now() - INTERVAL '30 days'
GROUP BY tag_code;

COMMENT ON VIEW public.v_tag_signal_metrics_30d IS
  'WO-TAXONOMY-03: Last-30-day reach metrics per tag_code across market_signals.';

CREATE OR REPLACE VIEW public.v_tag_event_metrics_30d AS
SELECT
  tag.tag_code,
  COUNT(*) FILTER (WHERE pe.event_type = 'signal_clicked') AS click_count,
  COUNT(*) FILTER (
    WHERE pe.event_type = 'signal_viewed'
      AND COALESCE(pe.properties ->> 'signal_id', '') <> ''
  ) AS detail_view_count,
  COUNT(*) FILTER (WHERE pe.event_type = 'signal_saved') AS save_count,
  COUNT(*) FILTER (WHERE pe.event_type = 'signal_liked') AS like_count,
  COUNT(DISTINCT COALESCE(pe.user_id::text, pe.session_id::text, pe.id::text)) AS unique_actor_count,
  COUNT(DISTINCT NULLIF(pe.properties ->> 'signal_id', '')) AS unique_signals_engaged,
  MAX(pe.created_at) AS last_event_at
FROM public.platform_events AS pe
CROSS JOIN LATERAL jsonb_array_elements_text(
  CASE
    WHEN jsonb_typeof(pe.properties -> 'tag_codes') = 'array'
      THEN pe.properties -> 'tag_codes'
    ELSE '[]'::jsonb
  END
) AS tag(tag_code)
WHERE pe.event_type IN ('signal_clicked', 'signal_viewed', 'signal_saved', 'signal_liked')
  AND pe.created_at >= now() - INTERVAL '30 days'
GROUP BY tag.tag_code;

COMMENT ON VIEW public.v_tag_event_metrics_30d IS
  'WO-TAXONOMY-03: Last-30-day engagement metrics per tag_code derived from platform_events tag payloads.';

CREATE OR REPLACE VIEW public.v_tag_performance_30d AS
SELECT
  tt.tag_code,
  tt.display_label,
  tt.level,
  tt.category_group,
  COALESCE(sm.signal_count, 0) AS signal_count,
  COALESCE(sm.source_diversity, 0) AS source_diversity,
  COALESCE(em.click_count, 0) AS click_count,
  COALESCE(em.detail_view_count, 0) AS detail_view_count,
  COALESCE(em.save_count, 0) AS save_count,
  COALESCE(em.like_count, 0) AS like_count,
  COALESCE(em.unique_actor_count, 0) AS unique_actor_count,
  COALESCE(em.unique_signals_engaged, 0) AS unique_signals_engaged,
  COALESCE(sm.avg_tag_confidence, 0)::numeric(5,3) AS avg_tag_confidence,
  COALESCE(sm.avg_score_importance, 0)::numeric(5,2) AS avg_score_importance,
  COALESCE(
    ROUND(
      (
        COALESCE(em.click_count, 0)
        + COALESCE(em.detail_view_count, 0)
        + (COALESCE(em.save_count, 0) * 2)
        + (COALESCE(em.like_count, 0) * 1.5)
      )::numeric
      / NULLIF(COALESCE(sm.signal_count, 0), 0),
      2
    ),
    0
  )::numeric(6,2) AS engagement_per_signal,
  sm.last_published_at,
  em.last_event_at
FROM public.taxonomy_tags AS tt
LEFT JOIN public.v_tag_signal_metrics_30d AS sm
  ON sm.tag_code = tt.tag_code
LEFT JOIN public.v_tag_event_metrics_30d AS em
  ON em.tag_code = tt.tag_code
WHERE tt.is_active = true;

COMMENT ON VIEW public.v_tag_performance_30d IS
  'WO-TAXONOMY-03: Query-ready 30-day tag KPI surface for dashboards, channel ranking, and taxonomy cleanup.';

CREATE OR REPLACE VIEW public.v_tag_orphans AS
SELECT
  tt.tag_code,
  tt.display_label,
  tt.level,
  tt.category_group
FROM public.taxonomy_tags AS tt
LEFT JOIN public.rss_item_tags AS rit
  ON rit.tag_code = tt.tag_code
WHERE tt.is_active = true
GROUP BY tt.tag_code, tt.display_label, tt.level, tt.category_group
HAVING COUNT(rit.rss_item_id) = 0;

COMMENT ON VIEW public.v_tag_orphans IS
  'WO-TAXONOMY-03: Active taxonomy tags with zero assignments in rss_item_tags.';

CREATE OR REPLACE VIEW public.v_tag_cooccurrence_30d AS
WITH recent_tag_pairs AS (
  SELECT
    LEAST(a.tag_code, b.tag_code) AS tag_code,
    GREATEST(a.tag_code, b.tag_code) AS related_tag_code,
    COUNT(*) AS cooccurrence_count
  FROM public.rss_item_tags AS a
  JOIN public.rss_item_tags AS b
    ON a.rss_item_id = b.rss_item_id
   AND a.tag_code < b.tag_code
  JOIN public.rss_items AS ri
    ON ri.id = a.rss_item_id
  WHERE COALESCE(ri.published_at, ri.created_at) >= now() - INTERVAL '30 days'
  GROUP BY LEAST(a.tag_code, b.tag_code), GREATEST(a.tag_code, b.tag_code)
),
bidirectional AS (
  SELECT tag_code, related_tag_code, cooccurrence_count FROM recent_tag_pairs
  UNION ALL
  SELECT related_tag_code AS tag_code, tag_code AS related_tag_code, cooccurrence_count FROM recent_tag_pairs
)
SELECT
  tag_code,
  related_tag_code,
  cooccurrence_count,
  ROW_NUMBER() OVER (
    PARTITION BY tag_code
    ORDER BY cooccurrence_count DESC, related_tag_code
  ) AS related_rank
FROM bidirectional;

COMMENT ON VIEW public.v_tag_cooccurrence_30d IS
  'WO-TAXONOMY-03: Bidirectional 30-day tag co-occurrence matrix for channel design and taxonomy collision review.';
