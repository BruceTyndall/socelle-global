-- Performance indexes for common query patterns
-- These indexes match the most frequent .eq() and .order() calls observed in the app.

-- plans: commonly queried by business_user_id, brand_id, and status
CREATE INDEX IF NOT EXISTS idx_plans_business_user_id ON plans (business_user_id);
CREATE INDEX IF NOT EXISTS idx_plans_brand_id ON plans (brand_id);
CREATE INDEX IF NOT EXISTS idx_plans_status ON plans (status);
CREATE INDEX IF NOT EXISTS idx_plans_created_at ON plans (created_at DESC);

-- business_plan_outputs: commonly queried by plan_id and output_type
CREATE INDEX IF NOT EXISTS idx_business_plan_outputs_plan_id ON business_plan_outputs (plan_id);
CREATE INDEX IF NOT EXISTS idx_business_plan_outputs_brand_id ON business_plan_outputs (brand_id);
CREATE INDEX IF NOT EXISTS idx_business_plan_outputs_plan_type ON business_plan_outputs (plan_id, output_type);

-- orders: commonly queried by created_by and brand_id
CREATE INDEX IF NOT EXISTS idx_orders_created_by ON orders (created_by);
CREATE INDEX IF NOT EXISTS idx_orders_brand_id ON orders (brand_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);

-- order_items: commonly queried by order_id for N+1 fix
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);

-- spa_service_mapping: commonly queried by business_id and menu_id
CREATE INDEX IF NOT EXISTS idx_spa_service_mapping_business_id ON spa_service_mapping (business_id);
CREATE INDEX IF NOT EXISTS idx_spa_service_mapping_menu_id ON spa_service_mapping (menu_id);

-- spa_menus: commonly queried by business_id and user_id
CREATE INDEX IF NOT EXISTS idx_spa_menus_user_id ON spa_menus (user_id);

-- user_profiles: primary key already indexed; add role for admin queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles (role);

-- canonical_protocols: brand_id filter
CREATE INDEX IF NOT EXISTS idx_canonical_protocols_brand_id ON canonical_protocols (brand_id);
CREATE INDEX IF NOT EXISTS idx_canonical_protocols_category ON canonical_protocols (category);

-- pro_products and retail_products: brand_id filter
CREATE INDEX IF NOT EXISTS idx_pro_products_brand_id ON pro_products (brand_id);
CREATE INDEX IF NOT EXISTS idx_retail_products_brand_id ON retail_products (brand_id);

-- plan_submissions: commonly queried by user_id and status
CREATE INDEX IF NOT EXISTS idx_plan_submissions_user_id ON plan_submissions (user_id);
CREATE INDEX IF NOT EXISTS idx_plan_submissions_status ON plan_submissions (submission_status);
CREATE INDEX IF NOT EXISTS idx_plan_submissions_updated_at ON plan_submissions (updated_at DESC);

-- ai_concierge_logs: queried by user_id and created_at
CREATE INDEX IF NOT EXISTS idx_ai_concierge_logs_user_id ON ai_concierge_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_concierge_logs_created_at ON ai_concierge_logs (created_at DESC);

-- service_category_benchmarks: queried by spa_type
CREATE INDEX IF NOT EXISTS idx_service_category_benchmarks_spa_type ON service_category_benchmarks (spa_type);

-- revenue_model_defaults: queried by spa_type
CREATE INDEX IF NOT EXISTS idx_revenue_model_defaults_spa_type ON revenue_model_defaults (spa_type);
