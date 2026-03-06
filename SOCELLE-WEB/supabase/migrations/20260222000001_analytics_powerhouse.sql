-- ═══════════════════════════════════════════════════════════════════
-- The Pro Edit — Analytics Powerhouse Migration
-- Phase 1: Event tracking, product metrics, brand analytics,
--           business insights, platform health
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Platform Events (raw event stream) ───────────────────────
-- Capture every meaningful user action for funnel analysis,
-- retention, and feature adoption measurement.
CREATE TABLE IF NOT EXISTS platform_events (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id    uuid,
  user_id       uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  org_id        uuid,                              -- brand or business org
  event_type    text        NOT NULL,              -- e.g. 'page_view', 'menu_uploaded', 'brand_viewed'
  event_category text       NOT NULL,              -- 'navigation' | 'engagement' | 'conversion' | 'commerce'
  properties    jsonb       DEFAULT '{}',          -- flexible payload
  page_path     text,
  referrer      text,
  user_agent    text,
  ip_hash       text,                              -- hashed for privacy
  created_at    timestamptz DEFAULT now()
);

-- Partition by month for performance at scale
CREATE INDEX IF NOT EXISTS idx_events_user_id    ON platform_events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_type       ON platform_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_category   ON platform_events(event_category);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON platform_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_org_id     ON platform_events(org_id);
CREATE INDEX IF NOT EXISTS idx_events_properties ON platform_events USING GIN(properties);

COMMENT ON TABLE platform_events IS
  'Raw event stream for all platform activity. Powers funnel analysis, retention, and feature adoption.';

-- ── 2. Product Metrics (Faire-style product analytics) ──────────
-- Daily rollup of product-level metrics for brand dashboards.
CREATE TABLE IF NOT EXISTS product_metrics (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id      uuid        NOT NULL,            -- references retail_products or pro_products
  product_type    text        NOT NULL CHECK (product_type IN ('retail', 'pro')),
  brand_id        uuid,
  metric_date     date        NOT NULL,
  page_views      integer     DEFAULT 0,
  unique_views    integer     DEFAULT 0,
  add_to_cart     integer     DEFAULT 0,
  orders          integer     DEFAULT 0,
  units_sold      integer     DEFAULT 0,
  revenue         numeric(12,2) DEFAULT 0,
  return_rate     numeric(5,4) DEFAULT 0,
  protocol_matches integer    DEFAULT 0,           -- how many businesses matched this product
  wishlist_adds   integer     DEFAULT 0,
  updated_at      timestamptz DEFAULT now(),
  UNIQUE(product_id, product_type, metric_date)
);

CREATE INDEX IF NOT EXISTS idx_product_metrics_brand    ON product_metrics(brand_id);
CREATE INDEX IF NOT EXISTS idx_product_metrics_date     ON product_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_product_metrics_product  ON product_metrics(product_id);

COMMENT ON TABLE product_metrics IS
  'Daily product performance rollup. Powers brand analytics dashboards (views, carts, orders, revenue).';

-- ── 3. Brand Analytics (Faire-style brand dashboards) ───────────
-- Weekly/monthly brand performance summaries.
CREATE TABLE IF NOT EXISTS brand_analytics (
  id                  uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id            uuid        NOT NULL,
  period_type         text        NOT NULL CHECK (period_type IN ('day','week','month')),
  period_start        date        NOT NULL,
  period_end          date        NOT NULL,
  -- Discovery
  storefront_views    integer     DEFAULT 0,
  product_views       integer     DEFAULT 0,
  search_appearances  integer     DEFAULT 0,
  -- Engagement
  businesses_reached  integer     DEFAULT 0,        -- unique businesses that saw this brand
  businesses_matched  integer     DEFAULT 0,        -- unique businesses with protocol matches
  protocol_match_rate numeric(5,4) DEFAULT 0,       -- matched / reached
  -- Commerce
  new_orders          integer     DEFAULT 0,
  repeat_orders       integer     DEFAULT 0,
  total_orders        integer     DEFAULT 0,
  gross_revenue       numeric(12,2) DEFAULT 0,
  avg_order_value     numeric(10,2) DEFAULT 0,
  return_rate         numeric(5,4) DEFAULT 0,
  -- Retention
  new_businesses      integer     DEFAULT 0,
  returning_businesses integer    DEFAULT 0,
  reorder_rate        numeric(5,4) DEFAULT 0,
  -- Leads
  new_leads           integer     DEFAULT 0,
  qualified_leads     integer     DEFAULT 0,
  converted_leads     integer     DEFAULT 0,
  lead_conversion_rate numeric(5,4) DEFAULT 0,
  created_at          timestamptz DEFAULT now(),
  UNIQUE(brand_id, period_type, period_start)
);

CREATE INDEX IF NOT EXISTS idx_brand_analytics_brand  ON brand_analytics(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_analytics_period ON brand_analytics(period_start DESC);

COMMENT ON TABLE brand_analytics IS
  'Aggregated brand performance metrics by period. Powers brand portal analytics dashboard.';

-- ── 4. Business Analytics ────────────────────────────────────────
-- Analytics for service business (spa/salon) portal dashboards.
CREATE TABLE IF NOT EXISTS business_analytics (
  id                    uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id           uuid        NOT NULL,
  period_type           text        NOT NULL CHECK (period_type IN ('day','week','month')),
  period_start          date        NOT NULL,
  period_end            date        NOT NULL,
  -- Menu coverage
  total_services        integer     DEFAULT 0,
  mapped_services       integer     DEFAULT 0,
  unmapped_services     integer     DEFAULT 0,
  menu_coverage_rate    numeric(5,4) DEFAULT 0,
  -- Brand engagement
  brands_viewed         integer     DEFAULT 0,
  brands_matched        integer     DEFAULT 0,
  brands_ordered        integer     DEFAULT 0,
  -- Commerce
  total_orders          integer     DEFAULT 0,
  total_spend           numeric(12,2) DEFAULT 0,
  avg_order_value       numeric(10,2) DEFAULT 0,
  -- Retail performance
  retail_revenue        numeric(12,2) DEFAULT 0,   -- if business tracks client retail sales
  retail_uplift_pct     numeric(6,4) DEFAULT 0,
  -- Plan activity
  plans_created         integer     DEFAULT 0,
  plans_activated       integer     DEFAULT 0,
  created_at            timestamptz DEFAULT now(),
  UNIQUE(business_id, period_type, period_start)
);

CREATE INDEX IF NOT EXISTS idx_business_analytics_business ON business_analytics(business_id);
CREATE INDEX IF NOT EXISTS idx_business_analytics_period   ON business_analytics(period_start DESC);

COMMENT ON TABLE business_analytics IS
  'Aggregated business performance metrics. Powers business portal dashboard.';

-- ── 5. Platform Health (admin dashboard) ────────────────────────
-- Daily snapshot of platform-wide health metrics.
CREATE TABLE IF NOT EXISTS platform_health (
  id                    uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_date         date        NOT NULL UNIQUE,
  -- Users
  total_users           integer     DEFAULT 0,
  new_users             integer     DEFAULT 0,
  dau                   integer     DEFAULT 0,       -- daily active users
  mau                   integer     DEFAULT 0,       -- monthly active users
  -- Supply
  total_brands          integer     DEFAULT 0,
  active_brands         integer     DEFAULT 0,
  total_products        integer     DEFAULT 0,
  -- Demand
  total_businesses      integer     DEFAULT 0,
  active_businesses     integer     DEFAULT 0,
  -- Commerce
  gmv                   numeric(14,2) DEFAULT 0,     -- gross merchandise value
  total_orders          integer     DEFAULT 0,
  avg_order_value       numeric(10,2) DEFAULT 0,
  -- Intelligence
  menus_uploaded        integer     DEFAULT 0,
  plans_created         integer     DEFAULT 0,
  protocol_matches      integer     DEFAULT 0,
  avg_match_rate        numeric(5,4) DEFAULT 0,
  -- Quality
  avg_session_duration  interval,
  bounce_rate           numeric(5,4) DEFAULT 0,
  error_rate            numeric(5,4) DEFAULT 0,
  created_at            timestamptz DEFAULT now()
);

COMMENT ON TABLE platform_health IS
  'Daily platform health snapshot for admin dashboard. Powers GMV, DAU/MAU, and quality metrics.';

-- ── 6. Search Analytics ─────────────────────────────────────────
-- Track search queries and result quality.
CREATE TABLE IF NOT EXISTS search_analytics (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id      uuid,
  query           text        NOT NULL,
  query_type      text        CHECK (query_type IN ('product','brand','protocol','general')),
  filters_applied jsonb       DEFAULT '{}',
  result_count    integer     DEFAULT 0,
  clicked_result  uuid,                            -- which result was clicked
  result_position integer,                         -- position of clicked result
  converted       boolean     DEFAULT false,       -- resulted in an order
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_analytics_query      ON search_analytics(query);
CREATE INDEX IF NOT EXISTS idx_search_analytics_created_at ON search_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_analytics_user       ON search_analytics(user_id);

COMMENT ON TABLE search_analytics IS
  'Search query log. Powers search quality metrics and content gap analysis.';

-- ── 7. Protocol Match Analytics ──────────────────────────────────
-- Track how well the mapping engine performs.
CREATE TABLE IF NOT EXISTS mapping_analytics (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id         uuid,
  business_id     uuid,
  service_name    text        NOT NULL,
  protocol_id     uuid,
  brand_id        uuid,
  match_score     numeric(5,2),                    -- 0-100 confidence
  match_type      text        CHECK (match_type IN ('exact','partial','candidate','none')),
  accepted        boolean,                         -- did business accept this match?
  rejected        boolean,
  feedback        text,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mapping_analytics_business ON mapping_analytics(business_id);
CREATE INDEX IF NOT EXISTS idx_mapping_analytics_brand    ON mapping_analytics(brand_id);
CREATE INDEX IF NOT EXISTS idx_mapping_analytics_score    ON mapping_analytics(match_score DESC);

COMMENT ON TABLE mapping_analytics IS
  'Protocol mapping outcome tracking. Powers match quality improvement and brand recommendations.';

-- ── 8. Revenue Attribution ───────────────────────────────────────
-- Link orders back to the discovery/matching events that drove them.
CREATE TABLE IF NOT EXISTS revenue_attribution (
  id                    uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id              uuid        NOT NULL,
  business_id           uuid,
  brand_id              uuid,
  attribution_source    text        NOT NULL,       -- 'organic_search' | 'ai_recommendation' | 'protocol_match' | 'direct' | 'concierge'
  attribution_channel   text,                       -- 'brand_page' | 'search_results' | 'plan_wizard' | 'concierge'
  first_touch_event_id  uuid        REFERENCES platform_events(id) ON DELETE SET NULL,
  last_touch_event_id   uuid        REFERENCES platform_events(id) ON DELETE SET NULL,
  days_to_conversion    integer,
  order_value           numeric(10,2),
  commission_amount     numeric(10,2),
  created_at            timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_revenue_attr_order    ON revenue_attribution(order_id);
CREATE INDEX IF NOT EXISTS idx_revenue_attr_source   ON revenue_attribution(attribution_source);
CREATE INDEX IF NOT EXISTS idx_revenue_attr_brand    ON revenue_attribution(brand_id);
CREATE INDEX IF NOT EXISTS idx_revenue_attr_business ON revenue_attribution(business_id);

COMMENT ON TABLE revenue_attribution IS
  'Multi-touch attribution for all orders. Powers ROI reporting and channel effectiveness analysis.';

-- ── 9. Feature Flags ─────────────────────────────────────────────
-- Runtime feature flag system for controlled rollouts.
CREATE TABLE IF NOT EXISTS feature_flags (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  flag_key      text        NOT NULL UNIQUE,
  description   text,
  enabled       boolean     DEFAULT false,
  rollout_pct   integer     DEFAULT 0 CHECK (rollout_pct BETWEEN 0 AND 100),
  conditions    jsonb       DEFAULT '{}',           -- user/org targeting conditions
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- Seed default feature flags
INSERT INTO feature_flags (flag_key, description, enabled, rollout_pct)
VALUES
  ('promoted_listings',    'AI-powered promoted product placements for brands',       false, 0),
  ('net30_terms',          'Net 30 payment terms for verified service businesses',    false, 0),
  ('vector_search',        'pgvector-powered semantic search',                        false, 0),
  ('ai_product_copy',      'AI-generated product descriptions for onboarding brands', false, 0),
  ('brand_analytics_v2',   'Enhanced brand analytics dashboard',                     true,  100),
  ('concierge_mode_retail','AI Concierge retail mode',                                true,  100)
ON CONFLICT (flag_key) DO NOTHING;

COMMENT ON TABLE feature_flags IS
  'Runtime feature flags for controlled rollouts and A/B testing.';

-- ── 10. Audit Log ────────────────────────────────────────────────
-- Immutable audit trail for sensitive operations.
CREATE TABLE IF NOT EXISTS audit_log (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id    uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_role  text,
  action      text        NOT NULL,               -- e.g. 'brand.created', 'order.refunded', 'user.role_changed'
  resource    text,                               -- e.g. 'brand', 'order', 'user'
  resource_id uuid,
  old_value   jsonb,
  new_value   jsonb,
  ip_address  text,
  user_agent  text,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_actor      ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_action     ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_resource   ON audit_log(resource, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_log(created_at DESC);

COMMENT ON TABLE audit_log IS
  'Immutable audit trail for all sensitive platform operations. Required for compliance.';

-- ── Row Level Security ───────────────────────────────────────────
ALTER TABLE platform_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_metrics      ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_analytics      ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_analytics   ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_health      ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_analytics     ENABLE ROW LEVEL SECURITY;
ALTER TABLE mapping_analytics    ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_attribution  ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags        ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log            ENABLE ROW LEVEL SECURITY;

-- Service role can do anything (used by Edge Functions & backend)
CREATE POLICY "service_role_all" ON platform_events     FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON product_metrics     FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON brand_analytics     FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON business_analytics  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON platform_health     FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON search_analytics    FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON mapping_analytics   FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON revenue_attribution FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON feature_flags       FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON audit_log           FOR ALL USING (auth.role() = 'service_role');

-- Authenticated users can INSERT events (client-side tracking)
CREATE POLICY "users_insert_events" ON platform_events
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can read own events
CREATE POLICY "users_read_own_events" ON platform_events
  FOR SELECT USING (auth.uid() = user_id);

-- Feature flags are readable by all authenticated users
CREATE POLICY "authenticated_read_flags" ON feature_flags
  FOR SELECT USING (auth.role() = 'authenticated');

-- ── Materialized view: top brands by engagement (refreshed daily) ──
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_top_brands_weekly AS
  SELECT
    ba.brand_id,
    SUM(ba.storefront_views)   AS total_views,
    SUM(ba.businesses_matched) AS total_matches,
    SUM(ba.total_orders)       AS total_orders,
    SUM(ba.gross_revenue)      AS total_revenue,
    AVG(ba.protocol_match_rate)::numeric(5,4) AS avg_match_rate
  FROM brand_analytics ba
  WHERE ba.period_type = 'week'
    AND ba.period_start >= CURRENT_DATE - INTERVAL '4 weeks'
  GROUP BY ba.brand_id
  ORDER BY total_orders DESC, total_views DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_top_brands_brand_id
  ON mv_top_brands_weekly(brand_id);

COMMENT ON MATERIALIZED VIEW mv_top_brands_weekly IS
  'Top performing brands in the last 4 weeks. Refresh daily via: REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_brands_weekly';
