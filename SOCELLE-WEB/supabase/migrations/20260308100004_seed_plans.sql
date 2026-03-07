-- Migration: Seed Subscription Plans, Add-ons, Bundles, Feature Flags
-- Authority: docs/command/SOCELLE_ENTITLEMENTS_PACKAGING.md

-- Operator plans
INSERT INTO subscription_plans (name, slug, plan_type, monthly_price_cents, annual_price_cents, features, limits, sort_order) VALUES
('Free', 'free', 'operator', 0, 0,
  '["public_intelligence","job_search","brand_directory","education_preview","events_calendar"]',
  '{"signals_per_day":3,"courses":0}', 1),
('Professional', 'professional', 'operator', 4900, 3900,
  '["full_intelligence","unlimited_signals","full_job_board","brand_profiles","education_academy","market_benchmarks"]',
  '{"signals_per_day":-1,"courses":-1}', 2),
('Business', 'business', 'operator', 14900, 11900,
  '["full_intelligence","unlimited_signals","full_job_board","brand_profiles","education_academy","market_benchmarks","wholesale_marketplace","purchasing_benchmarks","peer_comparisons"]',
  '{"signals_per_day":-1,"courses":-1,"api_calls":0}', 3),
('Enterprise', 'enterprise', 'operator', 0, 0,
  '["full_intelligence","unlimited_signals","full_job_board","brand_profiles","education_academy","market_benchmarks","wholesale_marketplace","purchasing_benchmarks","peer_comparisons","api_access","custom_feeds","white_label_reports"]',
  '{"signals_per_day":-1,"courses":-1,"api_calls":-1}', 4);

-- Brand plans
INSERT INTO subscription_plans (name, slug, plan_type, monthly_price_cents, annual_price_cents, features, limits, sort_order) VALUES
('Free', 'brand_free', 'brand', 0, 0,
  '["brand_profile","basic_analytics","marketplace_presence"]',
  '{}', 1),
('Growth', 'growth', 'brand', 9900, 7900,
  '["brand_profile","full_brand_intelligence","storefront_customization","reseller_analytics","campaign_insights"]',
  '{}', 2),
('Scale', 'scale', 'brand', 29900, 23900,
  '["brand_profile","full_brand_intelligence","storefront_customization","reseller_analytics","campaign_insights","featured_placement","advanced_analytics","api_access","custom_integrations"]',
  '{"api_calls":-1}', 3);

-- Studio add-ons
INSERT INTO studio_addons (name, slug, monthly_price_cents, annual_price_cents, allowed_roles, features) VALUES
('Social Studio', 'social_studio', 2900, 2300,
  ARRAY['business_user','brand_admin'],
  '["social_content","social_scheduling","social_monitoring"]'),
('CRM Studio', 'crm_studio', 3900, 3100,
  ARRAY['brand_admin'],
  '["crm_contacts","crm_companies","crm_pipeline"]'),
('Sales Studio', 'sales_studio', 2900, 2300,
  ARRAY['business_user','brand_admin'],
  '["sales_pipeline","deals","proposals","commissions"]'),
('Marketing Studio', 'marketing_studio', 3900, 3100,
  ARRAY['business_user','brand_admin'],
  '["campaigns","audience_segments","content_templates","marketing_analytics"]'),
('Education Studio', 'education_studio', 4900, 3900,
  ARRAY['business_user','provider','brand_admin'],
  '["course_authoring","quiz_builder","certificate_templates","scorm_upload"]');

-- Studio bundles
INSERT INTO studio_bundles (name, slug, monthly_price_cents, annual_price_cents, savings_percent) VALUES
('Creator Bundle', 'creator_bundle', 5900, 4700, 13),
('Growth Bundle', 'growth_bundle', 7900, 6300, 18),
('Full Studio Suite', 'full_suite', 14900, 11900, 22);

-- Feature flags
INSERT INTO feature_flags (key, name, description, required_plan, required_addon) VALUES
('full_intelligence', 'Full Intelligence Hub', 'Access all market signals without daily limit', 'professional', NULL),
('wholesale_marketplace', 'Wholesale Marketplace', 'Browse and order wholesale products', 'business', NULL),
('api_access', 'API Access', 'Access platform APIs', 'enterprise', NULL),
('social_studio', 'Social Studio', 'Social content creation and scheduling', NULL, 'social_studio'),
('crm_studio', 'CRM Studio', 'Contact and company management', NULL, 'crm_studio'),
('sales_studio', 'Sales Studio', 'Sales pipeline and deal management', NULL, 'sales_studio'),
('marketing_studio', 'Marketing Studio', 'Campaign management and analytics', NULL, 'marketing_studio'),
('education_studio', 'Education Studio', 'Course authoring and certification', NULL, 'education_studio'),
('peer_comparisons', 'Peer Comparisons', 'Compare benchmarks against peers', 'business', NULL),
('custom_feeds', 'Custom Intelligence Feeds', 'Custom data feed configuration', 'enterprise', NULL),
('white_label_reports', 'White Label Reports', 'Branded intelligence reports', 'enterprise', NULL),
('featured_placement', 'Featured Placement', 'Featured brand placement in marketplace', 'scale', NULL),
('advanced_analytics', 'Advanced Analytics', 'Deep analytics and custom dashboards', 'scale', NULL);
