-- INTEL-MONETIZATION-02: First-class intelligence channels backed by taxonomy tags.
-- Depends on: WO-TAXONOMY-03 (v_tag_performance_30d)

CREATE TABLE IF NOT EXISTS public.intelligence_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  eyebrow TEXT,
  summary TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'all'
    CHECK (audience IN ('all', 'provider', 'brand')),
  tier_min TEXT NOT NULL DEFAULT 'free'
    CHECK (tier_min IN ('free', 'paid')),
  icon_key TEXT NOT NULL DEFAULT 'activity',
  accent_token TEXT NOT NULL DEFAULT 'accent',
  region_scope TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  vertical_scope TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  signal_type_scope TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS intelligence_channels_status_idx
  ON public.intelligence_channels (status, audience, tier_min, sort_order);

DROP TRIGGER IF EXISTS intelligence_channels_set_updated_at ON public.intelligence_channels;
CREATE TRIGGER intelligence_channels_set_updated_at
  BEFORE UPDATE ON public.intelligence_channels
  FOR EACH ROW
  EXECUTE PROCEDURE public.moddatetime('updated_at');

ALTER TABLE public.intelligence_channels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "intelligence_channels_public_read_active" ON public.intelligence_channels;
CREATE POLICY "intelligence_channels_public_read_active" ON public.intelligence_channels
  FOR SELECT TO anon, authenticated
  USING (status = 'active');

DROP POLICY IF EXISTS "intelligence_channels_service_role_all" ON public.intelligence_channels;
CREATE POLICY "intelligence_channels_service_role_all" ON public.intelligence_channels
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "intelligence_channels_admin_all" ON public.intelligence_channels;
CREATE POLICY "intelligence_channels_admin_all" ON public.intelligence_channels
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

CREATE TABLE IF NOT EXISTS public.intelligence_channel_tags (
  channel_id UUID NOT NULL REFERENCES public.intelligence_channels(id) ON DELETE CASCADE,
  tag_code TEXT NOT NULL REFERENCES public.taxonomy_tags(tag_code) ON DELETE CASCADE,
  weight NUMERIC(6,2) NOT NULL DEFAULT 1
    CHECK (weight >= 0 AND weight <= 25),
  required BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (channel_id, tag_code)
);

CREATE INDEX IF NOT EXISTS intelligence_channel_tags_tag_code_idx
  ON public.intelligence_channel_tags (tag_code);

CREATE INDEX IF NOT EXISTS intelligence_channel_tags_channel_sort_idx
  ON public.intelligence_channel_tags (channel_id, sort_order, required DESC);

DROP TRIGGER IF EXISTS intelligence_channel_tags_set_updated_at ON public.intelligence_channel_tags;
CREATE TRIGGER intelligence_channel_tags_set_updated_at
  BEFORE UPDATE ON public.intelligence_channel_tags
  FOR EACH ROW
  EXECUTE PROCEDURE public.moddatetime('updated_at');

ALTER TABLE public.intelligence_channel_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "intelligence_channel_tags_public_read" ON public.intelligence_channel_tags;
CREATE POLICY "intelligence_channel_tags_public_read" ON public.intelligence_channel_tags
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "intelligence_channel_tags_service_role_all" ON public.intelligence_channel_tags;
CREATE POLICY "intelligence_channel_tags_service_role_all" ON public.intelligence_channel_tags
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "intelligence_channel_tags_admin_all" ON public.intelligence_channel_tags;
CREATE POLICY "intelligence_channel_tags_admin_all" ON public.intelligence_channel_tags
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

INSERT INTO public.intelligence_channels (
  slug,
  name,
  eyebrow,
  summary,
  audience,
  tier_min,
  icon_key,
  accent_token,
  region_scope,
  vertical_scope,
  signal_type_scope,
  sort_order,
  status
)
VALUES
  ('medspa-core-services', 'Medspa Core Services', 'Clinical demand', 'Track the services, devices, and aesthetic treatments medspas are reading about most right now.', 'provider', 'free', 'pulse', 'accent', ARRAY['global_beauty_market', 'us_beauty_market'], ARRAY['medspa'], ARRAY['treatment_trend', 'research_insight', 'regulatory_alert'], 10, 'active'),
  ('medspa-body-weight', 'Medspa Body & Weight', 'Body and GLP-1', 'Monitor body contouring, weight management, and adjacent wellness signals with stronger operator intent.', 'provider', 'paid', 'layers', 'signal-up', ARRAY['global_beauty_market', 'us_beauty_market'], ARRAY['medspa'], ARRAY['treatment_trend', 'market_data', 'brand_update'], 20, 'active'),
  ('aesthetic-devices-capex', 'Aesthetic Devices & CapEx', 'Capital equipment', 'Follow device-led signals, capital equipment positioning, and the treatments most likely to drive procurement decisions.', 'provider', 'paid', 'briefcase', 'signal-warn', ARRAY['global_beauty_market'], ARRAY['medspa'], ARRAY['product_velocity', 'brand_update', 'market_data'], 30, 'active'),
  ('salon-color-blonding', 'Color & Blonding', 'Salon innovation', 'See which color services, blonding stories, and product launches are leading salon attention.', 'provider', 'free', 'swatchbook', 'accent', ARRAY['global_beauty_market'], ARRAY['salon'], ARRAY['treatment_trend', 'brand_update', 'social_trend'], 40, 'active'),
  ('salon-texture-treatments', 'Texture, Smoothing & Treatments', 'Specialty services', 'Track texture services, smoothing systems, repair stories, and specialist treatment demand.', 'provider', 'paid', 'sparkles', 'signal-up', ARRAY['global_beauty_market'], ARRAY['salon'], ARRAY['treatment_trend', 'education', 'social_trend'], 50, 'active'),
  ('nails-lash-brow', 'Nails, Lash & Brow', 'Studio services', 'Watch the enhancement services, techniques, and studio stories shaping fast-moving appointment demand.', 'provider', 'free', 'gem', 'accent', ARRAY['global_beauty_market'], ARRAY['salon'], ARRAY['treatment_trend', 'social_trend', 'brand_update'], 60, 'active'),
  ('spa-wellness-rituals', 'Spa Rituals & Wellness', 'Wellness menu', 'A live channel for body rituals, massage, retreat programming, and hospitality-led wellness demand.', 'provider', 'free', 'waves', 'signal-up', ARRAY['global_beauty_market'], ARRAY['salon'], ARRAY['treatment_trend', 'industry_news', 'event_signal'], 70, 'active'),
  ('pro-skincare-claims', 'Pro Skincare & Claims', 'Product and claims', 'Track the claim families, product lines, and ingredient narratives surfacing across professional skincare.', 'all', 'free', 'flask', 'accent', ARRAY['global_beauty_market'], ARRAY['beauty_brand', 'medspa', 'salon'], ARRAY['ingredient_momentum', 'ingredient_trend', 'research_insight', 'brand_update'], 80, 'active'),
  ('clean-microbiome-regulatory', 'Clean, Microbiome & Regulation', 'Claims watch', 'A cross-market watchlist for clean beauty, microbiome language, non-comedogenic positioning, and compliance shifts.', 'all', 'paid', 'shield', 'signal-warn', ARRAY['global_beauty_market', 'us_beauty_market', 'eu_beauty_market'], ARRAY['beauty_brand', 'medspa', 'salon'], ARRAY['ingredient_trend', 'regulatory_alert', 'research_insight'], 90, 'active'),
  ('business-pricing-market', 'Business, Pricing & Market', 'Operator pressure', 'A channel for pricing movement, macro market changes, regional shifts, and business-model pressure points.', 'all', 'free', 'chart', 'signal-warn', ARRAY['global_beauty_market', 'us_beauty_market', 'uk_beauty_market', 'eu_beauty_market', 'asia_pacific_beauty'], ARRAY['beauty_brand', 'medspa', 'salon'], ARRAY['pricing_benchmark', 'market_data', 'regional_market', 'supply_chain'], 100, 'active'),
  ('regulatory-safety', 'Regulation & Safety', 'Trust and compliance', 'Keep critical alerts, compliance signals, and recall-level stories visible across the beauty stack.', 'all', 'free', 'shield', 'signal-down', ARRAY['global_beauty_market', 'us_beauty_market', 'eu_beauty_market'], ARRAY['beauty_brand', 'medspa', 'salon'], ARRAY['regulatory_alert', 'industry_news'], 110, 'active'),
  ('pro-education-careers', 'Pro Education & Careers', 'Team development', 'See the certifications, training themes, and career signals that can influence staffing and education decisions.', 'provider', 'free', 'graduation', 'accent', ARRAY['global_beauty_market'], ARRAY['medspa', 'salon'], ARRAY['education', 'job_market', 'event_signal'], 120, 'active'),
  ('brand-launches-positioning', 'Brand Launches & Positioning', 'Brand intelligence', 'A paid brand-facing view of launches, positioning shifts, and professional-channel storytelling momentum.', 'brand', 'paid', 'megaphone', 'accent', ARRAY['global_beauty_market', 'us_beauty_market'], ARRAY['beauty_brand'], ARRAY['brand_update', 'brand_adoption', 'product_velocity', 'industry_news'], 130, 'active'),
  ('global-beauty-market-strategy', 'Global Beauty Market & Strategy', 'Brand and market strategy', 'Follow the tag clusters and regional signals that matter most for pricing, positioning, and territory strategy.', 'brand', 'paid', 'globe', 'signal-up', ARRAY['global_beauty_market', 'us_beauty_market', 'uk_beauty_market', 'eu_beauty_market', 'asia_pacific_beauty'], ARRAY['beauty_brand', 'medspa', 'salon'], ARRAY['market_data', 'regional_market', 'pricing_benchmark', 'industry_news'], 140, 'active')
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  eyebrow = EXCLUDED.eyebrow,
  summary = EXCLUDED.summary,
  audience = EXCLUDED.audience,
  tier_min = EXCLUDED.tier_min,
  icon_key = EXCLUDED.icon_key,
  accent_token = EXCLUDED.accent_token,
  region_scope = EXCLUDED.region_scope,
  vertical_scope = EXCLUDED.vertical_scope,
  signal_type_scope = EXCLUDED.signal_type_scope,
  sort_order = EXCLUDED.sort_order,
  status = EXCLUDED.status;

WITH desired_channel_tags AS (
  SELECT *
  FROM (
    VALUES
      ('medspa-core-services', 'medspa', 3.00, true, 10),
      ('medspa-core-services', 'medspa_market_trends', 2.00, false, 20),
      ('medspa-core-services', 'rf_microneedling', 2.80, false, 30),
      ('medspa-core-services', 'microneedling', 2.30, false, 40),
      ('medspa-core-services', 'hydrafacial', 2.50, false, 50),
      ('medspa-core-services', 'chemical_peel_medium', 2.00, false, 60),
      ('medspa-core-services', 'laser_hair_removal', 1.80, false, 70),
      ('medspa-core-services', 'ipl_photofacial', 1.80, false, 80),
      ('medspa-core-services', 'thread_lift', 1.70, false, 90),

      ('medspa-body-weight', 'medspa', 2.50, true, 10),
      ('medspa-body-weight', 'medspa_market_trends', 2.00, false, 20),
      ('medspa-body-weight', 'body_contouring', 3.00, false, 30),
      ('medspa-body-weight', 'cryolipolysis_fat_freezing', 2.60, false, 40),
      ('medspa-body-weight', 'semaglutide_weight_loss', 3.00, false, 50),
      ('medspa-body-weight', 'skin_tightening_body', 2.10, false, 60),

      ('aesthetic-devices-capex', 'professional_tools_equipment', 3.00, false, 10),
      ('aesthetic-devices-capex', 'rf_microneedling', 2.40, false, 20),
      ('aesthetic-devices-capex', 'body_contouring', 2.30, false, 30),
      ('aesthetic-devices-capex', 'skin_tightening_body', 1.90, false, 40),
      ('aesthetic-devices-capex', 'medspa_market_trends', 1.70, false, 50),

      ('salon-color-blonding', 'hair_salon', 2.50, true, 10),
      ('salon-color-blonding', 'salon_market_trends', 2.00, false, 20),
      ('salon-color-blonding', 'hair_trends', 2.20, false, 30),
      ('salon-color-blonding', 'balayage', 2.80, false, 40),
      ('salon-color-blonding', 'vivid_fashion_color', 2.50, false, 50),

      ('salon-texture-treatments', 'hair_salon', 2.30, true, 10),
      ('salon-texture-treatments', 'salon_market_trends', 1.80, false, 20),
      ('salon-texture-treatments', 'curly_cut_specialty', 2.90, false, 30),
      ('salon-texture-treatments', 'keratin_smoothing_treatment', 2.70, false, 40),
      ('salon-texture-treatments', 'hair_extensions_install', 2.10, false, 50),

      ('nails-lash-brow', 'nail_salon', 2.50, true, 10),
      ('nails-lash-brow', 'nail_market_trends', 2.00, false, 20),
      ('nails-lash-brow', 'gelx_nails', 2.90, false, 30),
      ('nails-lash-brow', 'dip_powder_nails', 2.50, false, 40),
      ('nails-lash-brow', 'russian_manicure', 2.70, false, 50),
      ('nails-lash-brow', 'lash_extensions_volume', 2.40, false, 60),
      ('nails-lash-brow', 'brow_lamination', 2.20, false, 70),
      ('nails-lash-brow', 'brazilian_wax', 1.90, false, 80),
      ('nails-lash-brow', 'sugaring_hair_removal', 1.90, false, 90),

      ('spa-wellness-rituals', 'day_spa', 2.50, true, 10),
      ('spa-wellness-rituals', 'spa_market_trends', 2.20, false, 20),
      ('spa-wellness-rituals', 'wellness_retreat_package', 2.80, false, 30),
      ('spa-wellness-rituals', 'massage_therapy', 2.60, false, 40),
      ('spa-wellness-rituals', 'swedish_massage', 2.10, false, 50),
      ('spa-wellness-rituals', 'deep_tissue_massage', 2.10, false, 60),
      ('spa-wellness-rituals', 'hot_stone_massage', 1.90, false, 70),
      ('spa-wellness-rituals', 'sauna_circuit', 1.80, false, 80),

      ('pro-skincare-claims', 'professional_skincare_line', 2.60, false, 10),
      ('pro-skincare-claims', 'medical_grade_skincare_line', 2.40, false, 20),
      ('pro-skincare-claims', 'skincare_trends', 2.20, false, 30),
      ('pro-skincare-claims', 'clean_beauty', 2.20, false, 40),
      ('pro-skincare-claims', 'microbiome_friendly_claim', 2.50, false, 50),
      ('pro-skincare-claims', 'non_comedogenic', 2.10, false, 60),

      ('clean-microbiome-regulatory', 'clean_beauty', 2.50, false, 10),
      ('clean-microbiome-regulatory', 'microbiome_friendly_claim', 3.00, false, 20),
      ('clean-microbiome-regulatory', 'non_comedogenic', 2.10, false, 30),
      ('clean-microbiome-regulatory', 'mocra_compliance', 3.00, false, 40),
      ('clean-microbiome-regulatory', 'safety_recall_notice', 2.80, false, 50),
      ('clean-microbiome-regulatory', 'eu_beauty_market', 1.40, false, 60),

      ('business-pricing-market', 'beauty_industry_news', 2.20, false, 10),
      ('business-pricing-market', 'professional_beauty_news', 2.60, false, 20),
      ('business-pricing-market', 'pricing_trend', 3.00, false, 30),
      ('business-pricing-market', 'consumer_preference_shift', 2.30, false, 40),
      ('business-pricing-market', 'global_beauty_market', 2.40, false, 50),
      ('business-pricing-market', 'us_beauty_market', 2.00, false, 60),
      ('business-pricing-market', 'uk_beauty_market', 1.80, false, 70),
      ('business-pricing-market', 'eu_beauty_market', 1.80, false, 80),
      ('business-pricing-market', 'asia_pacific_beauty', 1.80, false, 90),

      ('regulatory-safety', 'mocra_compliance', 3.00, false, 10),
      ('regulatory-safety', 'safety_recall_notice', 3.00, false, 20),
      ('regulatory-safety', 'beauty_industry_news', 1.60, false, 30),
      ('regulatory-safety', 'us_beauty_market', 1.30, false, 40),
      ('regulatory-safety', 'eu_beauty_market', 1.30, false, 50),

      ('pro-education-careers', 'professional_education_trend', 3.00, false, 10),
      ('pro-education-careers', 'licensed_esthetician', 2.40, false, 20),
      ('pro-education-careers', 'medspa_owner', 1.90, false, 30),
      ('pro-education-careers', 'salon_owner', 1.90, false, 40),
      ('pro-education-careers', 'student_trainee', 2.20, false, 50),

      ('brand-launches-positioning', 'professional_beauty_only', 2.60, false, 10),
      ('brand-launches-positioning', 'premiumization_trend', 2.40, false, 20),
      ('brand-launches-positioning', 'social_commerce_beauty', 2.30, false, 30),
      ('brand-launches-positioning', 'professional_skincare_line', 2.20, false, 40),
      ('brand-launches-positioning', 'beauty_industry_news', 2.50, false, 50),

      ('global-beauty-market-strategy', 'global_beauty_market', 2.80, false, 10),
      ('global-beauty-market-strategy', 'us_beauty_market', 2.20, false, 20),
      ('global-beauty-market-strategy', 'uk_beauty_market', 1.90, false, 30),
      ('global-beauty-market-strategy', 'eu_beauty_market', 1.90, false, 40),
      ('global-beauty-market-strategy', 'asia_pacific_beauty', 1.90, false, 50),
      ('global-beauty-market-strategy', 'beauty_industry_news', 2.20, false, 60),
      ('global-beauty-market-strategy', 'pricing_trend', 2.10, false, 70),
      ('global-beauty-market-strategy', 'premiumization_trend', 2.00, false, 80)
  ) AS t(channel_slug, tag_code, weight, required, sort_order)
),
resolved_channel_tags AS (
  SELECT
    c.id AS channel_id,
    d.tag_code,
    d.weight,
    d.required,
    d.sort_order
  FROM desired_channel_tags AS d
  JOIN public.intelligence_channels AS c
    ON c.slug = d.channel_slug
  JOIN public.taxonomy_tags AS tt
    ON tt.tag_code = d.tag_code
   AND tt.is_active = true
)
INSERT INTO public.intelligence_channel_tags (
  channel_id,
  tag_code,
  weight,
  required,
  sort_order
)
SELECT
  channel_id,
  tag_code,
  weight,
  required,
  sort_order
FROM resolved_channel_tags
ON CONFLICT (channel_id, tag_code) DO UPDATE
SET
  weight = EXCLUDED.weight,
  required = EXCLUDED.required,
  sort_order = EXCLUDED.sort_order;

CREATE OR REPLACE VIEW public.v_intelligence_channel_performance_30d AS
SELECT
  c.id AS channel_id,
  c.slug,
  c.name,
  c.eyebrow,
  c.summary,
  c.audience,
  c.tier_min,
  c.icon_key,
  c.accent_token,
  c.region_scope,
  c.vertical_scope,
  c.signal_type_scope,
  c.sort_order,
  c.status,
  COUNT(ict.tag_code) AS configured_tag_count,
  COUNT(*) FILTER (WHERE ict.required = true) AS required_tag_count,
  COALESCE(SUM(COALESCE(tp.signal_count, 0) * ict.weight), 0)::numeric(10,2) AS weighted_signal_count,
  COALESCE(SUM(COALESCE(tp.engagement_per_signal, 0) * ict.weight), 0)::numeric(10,2) AS weighted_engagement_score,
  COALESCE(SUM(COALESCE(tp.unique_actor_count, 0) * ict.weight), 0)::numeric(10,2) AS weighted_unique_actor_count,
  MAX(tp.last_published_at) AS last_published_at,
  MAX(tp.last_event_at) AS last_event_at
FROM public.intelligence_channels AS c
LEFT JOIN public.intelligence_channel_tags AS ict
  ON ict.channel_id = c.id
LEFT JOIN public.v_tag_performance_30d AS tp
  ON tp.tag_code = ict.tag_code
WHERE c.status = 'active'
GROUP BY
  c.id,
  c.slug,
  c.name,
  c.eyebrow,
  c.summary,
  c.audience,
  c.tier_min,
  c.icon_key,
  c.accent_token,
  c.region_scope,
  c.vertical_scope,
  c.signal_type_scope,
  c.sort_order,
  c.status;

COMMENT ON VIEW public.v_intelligence_channel_performance_30d IS
  'INTEL-MONETIZATION-02: Weighted 30-day channel performance surface derived from channel tag mappings and v_tag_performance_30d.';

CREATE OR REPLACE VIEW public.v_intelligence_channel_top_tags_30d AS
SELECT
  c.id AS channel_id,
  c.slug,
  ict.tag_code,
  tt.display_label,
  tt.category_group,
  ict.weight,
  ict.required,
  ict.sort_order,
  COALESCE(tp.signal_count, 0) AS signal_count,
  COALESCE(tp.engagement_per_signal, 0)::numeric(6,2) AS engagement_per_signal,
  COALESCE(tp.unique_actor_count, 0) AS unique_actor_count,
  ROW_NUMBER() OVER (
    PARTITION BY c.id
    ORDER BY
      ((COALESCE(tp.engagement_per_signal, 0) * 2) + COALESCE(tp.signal_count, 0)) * ict.weight DESC,
      ict.required DESC,
      ict.sort_order ASC,
      ict.tag_code ASC
  ) AS tag_rank
FROM public.intelligence_channels AS c
JOIN public.intelligence_channel_tags AS ict
  ON ict.channel_id = c.id
JOIN public.taxonomy_tags AS tt
  ON tt.tag_code = ict.tag_code
 AND tt.is_active = true
LEFT JOIN public.v_tag_performance_30d AS tp
  ON tp.tag_code = ict.tag_code
WHERE c.status = 'active';

COMMENT ON VIEW public.v_intelligence_channel_top_tags_30d IS
  'INTEL-MONETIZATION-02: Ranked top tags per channel using weighted 30-day tag performance.';
