-- Seed service_category_benchmarks and revenue_model_defaults
-- These tables are required by gapAnalysisEngine.ts to produce gap analysis results.
-- Without data in these tables, gap analysis silently returns 0 gaps.

-- ============================================================
-- service_category_benchmarks
-- Defines which service categories are expected for each spa type
-- and their priority level. Used by gapAnalysisEngine to detect
-- missing categories in a spa's menu.
-- ============================================================

INSERT INTO service_category_benchmarks (spa_type, service_category, is_required, priority_level)
VALUES
  -- Day Spa benchmarks
  ('day_spa', 'FACIALS', true, 'high'),
  ('day_spa', 'MASSAGE THERAPY', true, 'high'),
  ('day_spa', 'BODY SCRUBS / POLISHES', false, 'medium'),
  ('day_spa', 'BODY WRAPS / BODY TREATMENTS', false, 'medium'),
  ('day_spa', 'HAND & FOOT TREATMENTS', true, 'medium'),
  ('day_spa', 'FACIAL ENHANCEMENTS / ADD-ONS', false, 'low'),
  ('day_spa', 'SEASONAL / LIMITED SERVICES', false, 'low'),

  -- Resort Spa benchmarks
  ('resort_spa', 'FACIALS', true, 'high'),
  ('resort_spa', 'MASSAGE THERAPY', true, 'high'),
  ('resort_spa', 'BODY WRAPS / BODY TREATMENTS', true, 'high'),
  ('resort_spa', 'BODY SCRUBS / POLISHES', true, 'medium'),
  ('resort_spa', 'HAND & FOOT TREATMENTS', true, 'medium'),
  ('resort_spa', 'HYDROTHERAPY / RITUALS', false, 'medium'),
  ('resort_spa', 'ADVANCED / CORRECTIVE FACIALS', false, 'medium'),
  ('resort_spa', 'FACIAL ENHANCEMENTS / ADD-ONS', false, 'low'),
  ('resort_spa', 'SEASONAL / LIMITED SERVICES', false, 'low'),

  -- Medical Spa / Medi-Spa benchmarks
  ('medical_spa', 'ADVANCED / CORRECTIVE FACIALS', true, 'high'),
  ('medical_spa', 'FACIALS', true, 'high'),
  ('medical_spa', 'FACIAL ENHANCEMENTS / ADD-ONS', true, 'high'),
  ('medical_spa', 'MASSAGE THERAPY', false, 'low'),
  ('medical_spa', 'HAND & FOOT TREATMENTS', false, 'low'),

  -- Wellness Center benchmarks
  ('wellness_center', 'MASSAGE THERAPY', true, 'high'),
  ('wellness_center', 'FACIALS', true, 'high'),
  ('wellness_center', 'BODY WRAPS / BODY TREATMENTS', false, 'medium'),
  ('wellness_center', 'HYDROTHERAPY / RITUALS', false, 'medium'),
  ('wellness_center', 'ONCOLOGY-SAFE SERVICES', false, 'medium'),
  ('wellness_center', 'HAND & FOOT TREATMENTS', false, 'low'),
  ('wellness_center', 'SEASONAL / LIMITED SERVICES', false, 'low'),

  -- Salon + Spa benchmarks
  ('salon_spa', 'FACIALS', true, 'high'),
  ('salon_spa', 'HAND & FOOT TREATMENTS', true, 'high'),
  ('salon_spa', 'MASSAGE THERAPY', false, 'medium'),
  ('salon_spa', 'BODY SCRUBS / POLISHES', false, 'low'),
  ('salon_spa', 'FACIAL ENHANCEMENTS / ADD-ONS', false, 'low'),

  -- Generic / unknown spa type — conservative defaults
  ('general', 'FACIALS', true, 'high'),
  ('general', 'MASSAGE THERAPY', true, 'high'),
  ('general', 'HAND & FOOT TREATMENTS', false, 'medium'),
  ('general', 'BODY SCRUBS / POLISHES', false, 'medium'),
  ('general', 'BODY WRAPS / BODY TREATMENTS', false, 'low'),
  ('general', 'FACIAL ENHANCEMENTS / ADD-ONS', false, 'low'),
  ('general', 'SEASONAL / LIMITED SERVICES', false, 'low')

ON CONFLICT DO NOTHING;


-- ============================================================
-- revenue_model_defaults
-- Default revenue model assumptions used by gapAnalysisEngine
-- to estimate monthly revenue impact for identified gaps.
-- All values are conservative industry estimates.
-- ============================================================

INSERT INTO revenue_model_defaults (
  spa_type,
  service_category,
  avg_service_price,
  avg_treatments_per_month,
  retail_attach_rate,
  avg_retail_transaction,
  utilization_rate
)
VALUES
  -- Day Spa defaults
  ('day_spa', 'FACIALS', 150, 40, 0.25, 65, 0.65),
  ('day_spa', 'MASSAGE THERAPY', 120, 50, 0.15, 45, 0.70),
  ('day_spa', 'BODY SCRUBS / POLISHES', 110, 20, 0.20, 55, 0.55),
  ('day_spa', 'BODY WRAPS / BODY TREATMENTS', 140, 15, 0.20, 60, 0.50),
  ('day_spa', 'HAND & FOOT TREATMENTS', 65, 60, 0.30, 35, 0.75),
  ('day_spa', 'ADVANCED / CORRECTIVE FACIALS', 200, 25, 0.35, 90, 0.60),
  ('day_spa', 'FACIAL ENHANCEMENTS / ADD-ONS', 45, 30, 0.40, 50, 0.70),
  ('day_spa', 'SEASONAL / LIMITED SERVICES', 130, 10, 0.25, 60, 0.45),

  -- Resort Spa defaults (higher pricing)
  ('resort_spa', 'FACIALS', 200, 60, 0.30, 85, 0.70),
  ('resort_spa', 'MASSAGE THERAPY', 175, 80, 0.20, 60, 0.75),
  ('resort_spa', 'BODY WRAPS / BODY TREATMENTS', 195, 30, 0.25, 75, 0.60),
  ('resort_spa', 'BODY SCRUBS / POLISHES', 160, 25, 0.25, 70, 0.60),
  ('resort_spa', 'HAND & FOOT TREATMENTS', 90, 70, 0.35, 45, 0.75),
  ('resort_spa', 'HYDROTHERAPY / RITUALS', 225, 20, 0.20, 80, 0.55),
  ('resort_spa', 'ADVANCED / CORRECTIVE FACIALS', 275, 35, 0.40, 110, 0.65),
  ('resort_spa', 'SEASONAL / LIMITED SERVICES', 180, 15, 0.30, 80, 0.50),

  -- Medical Spa defaults
  ('medical_spa', 'ADVANCED / CORRECTIVE FACIALS', 350, 40, 0.45, 125, 0.70),
  ('medical_spa', 'FACIALS', 225, 35, 0.35, 95, 0.65),
  ('medical_spa', 'FACIAL ENHANCEMENTS / ADD-ONS', 125, 50, 0.50, 85, 0.75),

  -- Wellness Center defaults
  ('wellness_center', 'MASSAGE THERAPY', 130, 60, 0.20, 50, 0.70),
  ('wellness_center', 'FACIALS', 155, 35, 0.30, 70, 0.65),
  ('wellness_center', 'BODY WRAPS / BODY TREATMENTS', 145, 20, 0.20, 65, 0.55),
  ('wellness_center', 'ONCOLOGY-SAFE SERVICES', 110, 15, 0.15, 45, 0.50),
  ('wellness_center', 'HYDROTHERAPY / RITUALS', 175, 12, 0.15, 65, 0.45),

  -- Salon + Spa defaults
  ('salon_spa', 'FACIALS', 125, 30, 0.30, 60, 0.65),
  ('salon_spa', 'HAND & FOOT TREATMENTS', 55, 80, 0.35, 35, 0.80),
  ('salon_spa', 'MASSAGE THERAPY', 100, 20, 0.15, 40, 0.60),
  ('salon_spa', 'BODY SCRUBS / POLISHES', 90, 10, 0.20, 50, 0.50),

  -- General defaults (used when spa_type is unknown)
  ('general', 'FACIALS', 155, 40, 0.28, 70, 0.65),
  ('general', 'MASSAGE THERAPY', 125, 45, 0.17, 48, 0.68),
  ('general', 'BODY SCRUBS / POLISHES', 105, 18, 0.20, 52, 0.53),
  ('general', 'BODY WRAPS / BODY TREATMENTS', 135, 14, 0.20, 58, 0.50),
  ('general', 'HAND & FOOT TREATMENTS', 62, 55, 0.32, 35, 0.75),
  ('general', 'ADVANCED / CORRECTIVE FACIALS', 210, 22, 0.37, 88, 0.60),
  ('general', 'FACIAL ENHANCEMENTS / ADD-ONS', 48, 28, 0.38, 48, 0.68),
  ('general', 'SEASONAL / LIMITED SERVICES', 128, 10, 0.25, 58, 0.45),
  ('general', 'HYDROTHERAPY / RITUALS', 185, 10, 0.18, 68, 0.48),
  ('general', 'ONCOLOGY-SAFE SERVICES', 115, 12, 0.15, 42, 0.50)

ON CONFLICT DO NOTHING;
