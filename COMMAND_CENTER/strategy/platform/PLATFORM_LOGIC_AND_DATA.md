# PLATFORM LOGIC AND DATA

## Overview

This document is the authoritative reference for the platform's data architecture, permissioning model, recommendation logic, economics engine, AI processing pipeline, and commerce data model. It describes both current state (as-built) and specified future state (v2 proposals and gap fills).

**Tech Stack:** React 18 + TypeScript 5.5 + Vite + Supabase (PostgreSQL + Auth + Storage + Edge Functions) + Tailwind CSS + pgvector

**Database:** 46 tables across Supabase PostgreSQL. Row-Level Security (RLS) enforced at the database layer. Auth managed by Supabase Auth (JWT-based). Semantic search powered by pgvector with 1536-dimension embeddings.

**AI Engines (10):** mappingEngine, gapAnalysisEngine, retailAttachEngine, planOrchestrator, openingOrderEngine, aiConciergeEngine, phasedRolloutPlanner, serviceMappingEngine, implementationReadinessEngine, brandDifferentiationEngine

**Known Critical Bugs (as of current codebase):**
1. Race condition in `handleAnalyze`: `navigate()` called before `saveOutputs()` completes
2. Unguarded `Promise.all` — a single rejected promise fails the entire analysis batch silently
3. No transaction wrapping in multi-table updates — partial writes are possible
4. Duplicate slug allowed on brand create — no unique constraint enforced at application layer
5. Hardcoded email address in `AdminOrderDetail` — security/configuration issue

---

## Section A: Data Model

### A1. Tenant Architecture

#### Multi-Tenancy Partitioning Strategy

The platform uses a **dual-partition** model. Every row of business or plan data is scoped by `business_id`. Every row of brand catalog data is scoped by `brand_id`. These two partition keys are distinct and do not overlap — a business is a spa/medspa operator; a brand is a product brand supplying protocols and products.

| Partition Key  | Applies To                                                                 | Enforced By         |
|----------------|---------------------------------------------------------------------------|---------------------|
| `business_id`  | plans, menu_uploads, business_plan_outputs, spa_menus, spa_services, spa_leads, orders, opening_orders, implementation_readiness, phased_rollout_plans, brand_analytics (consumer side), user_profiles (spa_user / business_user) | RLS + FK constraint |
| `brand_id`     | brands, brand_assets, brand_differentiation_points, canonical_protocols, canonical_protocol_steps, canonical_protocol_step_products, pro_products, retail_products, brand_analytics (brand side), mixing_rules | RLS + FK constraint |

Cross-partition queries (e.g., a brand admin viewing which businesses adopted a protocol) must be anonymized and aggregated. No brand admin may receive a row-level result that identifies a specific business by name or ID.

#### Tenant Lifecycle

```
signup → active → suspended → churned
```

| State       | Description                                                                                     | Data Behavior                                                          |
|-------------|-------------------------------------------------------------------------------------------------|------------------------------------------------------------------------|
| `signup`    | Account created, onboarding not complete. `businesses.status = 'onboarding'`                   | No plan analysis permitted. Menu upload allowed.                       |
| `active`    | Subscription confirmed, full access. `businesses.status = 'active'`                            | All features enabled per plan tier.                                    |
| `suspended` | Payment failure or admin action. `businesses.status = 'suspended'`                             | Read-only access to existing outputs. No new analysis runs.            |
| `churned`   | Cancelled. `businesses.status = 'churned'`                                                     | Data retained for 90 days, then soft-deleted (anonymized, not purged). |

The `plans` table and `user_profiles` table should carry a `business_id` FK that participates in this lifecycle. Suspended businesses must have RLS policies that prevent INSERT on analysis tables.

---

### A2. Core Entity Relationships

The following is a text-based ER diagram showing the primary relationships between the platform's core entities.

```
BUSINESS SIDE
─────────────────────────────────────────────────────────────────────────────────

  businesses
    │  id (PK)
    │  slug
    │  status
    │  plan_tier
    │
    ├──── user_profiles (FK: business_id)
    │       id (PK)
    │       user_id (FK → auth.users)
    │       role: spa_user | business_user | brand_admin | admin | platform_admin
    │       business_id (nullable FK → businesses)
    │       brand_id    (nullable FK → brands)
    │
    ├──── plans (FK: business_id)
    │       id (PK)
    │       business_id
    │       status: draft | processing | ready | failed | stale
    │       menu_upload_id (FK → menu_uploads)
    │       brand_id (FK → brands)
    │       created_at
    │       │
    │       ├──── menu_uploads (FK: plan_id or business_id)
    │       │       id (PK)
    │       │       business_id
    │       │       raw_text
    │       │       parsed_services (JSONB)
    │       │       upload_status
    │       │
    │       ├──── business_plan_outputs (FK: plan_id)
    │       │       id (PK)
    │       │       plan_id
    │       │       output_type
    │       │       output_data (JSONB)
    │       │       generated_at
    │       │
    │       ├──── spa_service_mapping (FK: plan_id)
    │       │       id (PK)
    │       │       plan_id
    │       │       spa_service_id (FK → spa_services)
    │       │       canonical_protocol_id (FK → canonical_protocols)
    │       │       confidence_score
    │       │       match_type
    │       │       override_flag
    │       │       override_by (FK → user_profiles)
    │       │
    │       ├──── service_gap_analysis (FK: plan_id)
    │       │       id (PK)
    │       │       plan_id
    │       │       canonical_protocol_id (FK → canonical_protocols)
    │       │       gap_type
    │       │       revenue_opportunity
    │       │       confidence_score
    │       │
    │       └──── retail_attach_recommendations (FK: plan_id)
    │               id (PK)
    │               plan_id
    │               retail_product_id (FK → retail_products)
    │               recommended_for_service_id (FK → spa_services)
    │               attach_rate_estimate
    │               revenue_uplift_estimate

BRAND SIDE
─────────────────────────────────────────────────────────────────────────────────

  brands
    │  id (PK)
    │  slug (UNIQUE — currently NOT enforced, known bug)
    │  name
    │  status: draft | published | suspended
    │
    ├──── brand_assets (FK: brand_id)
    │
    ├──── brand_differentiation_points (FK: brand_id)
    │
    ├──── canonical_protocols (FK: brand_id)
    │       id (PK)
    │       brand_id
    │       name
    │       category
    │       duration_minutes
    │       embedding (vector(1536)) — pgvector
    │       │
    │       └──── canonical_protocol_steps (FK: canonical_protocol_id)
    │               id (PK)
    │               canonical_protocol_id
    │               step_order
    │               step_name
    │               │
    │               └──── canonical_protocol_step_products (FK: step_id)
    │                       id (PK)
    │                       step_id
    │                       pro_product_id (FK → pro_products)
    │                       typical_usage_amount
    │                       is_required
    │
    ├──── pro_products (FK: brand_id)
    │       id (PK)
    │       brand_id
    │       name
    │       sku
    │       wholesale_price
    │       msrp
    │       product_type: backbar | retail | both
    │
    └──── retail_products (FK: brand_id)
            id (PK)
            brand_id
            name
            sku
            wholesale_price
            msrp
            consumer_benefit

CROSS-PARTITION (aggregated only, no row-level business exposure to brand side)
─────────────────────────────────────────────────────────────────────────────────

  brand_analytics
    brand_id (FK → brands)
    metric_type
    metric_value
    period
    [NO business_id — anonymized aggregation only]
```

---

### A3. Minimum Viable Schema (Proposed Additions)

The following tables are missing from the current 46-table schema and should be added to support planned features.

#### `business_manager` Role Support

The current `user_profiles` table supports 5 roles but lacks a formal way to link a `business_manager` (e.g., a regional manager overseeing multiple locations) to multiple businesses. The current FK is `user_profiles.business_id` (single business). Proposed fix:

```sql
-- New join table: business_managers
CREATE TABLE business_managers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id   uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  role          text NOT NULL DEFAULT 'manager',
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, business_id)
);

-- RLS: user can see their own rows; platform_admin can see all
ALTER TABLE business_managers ENABLE ROW LEVEL SECURITY;
```

#### `practitioners` Table

Practitioners (estheticians, therapists) are currently not modeled. They are needed for the implementation readiness and training plan features.

```sql
CREATE TABLE practitioners (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  full_name     text NOT NULL,
  role_title    text,                         -- e.g., "Lead Esthetician"
  license_type  text,                         -- e.g., "LE", "RN", "CMT"
  hire_date     date,
  active        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE practitioners ENABLE ROW LEVEL SECURITY;
-- RLS: business_user scoped to business_id
```

#### `order_items` Table

Orders currently exist but line-item granularity appears to be missing or incomplete. Required for commission calculation, fulfillment, and reporting.

```sql
CREATE TABLE order_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id        uuid,                     -- FK → pro_products OR retail_products
  product_type      text NOT NULL,            -- 'pro' | 'retail'
  product_name      text NOT NULL,            -- denormalized for order history
  sku               text,
  quantity          integer NOT NULL DEFAULT 1,
  unit_wholesale    numeric(10,2) NOT NULL,
  unit_msrp         numeric(10,2),
  line_total        numeric(10,2) GENERATED ALWAYS AS (quantity * unit_wholesale) STORED,
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
```

#### `subscriptions` Table

No subscription tracking table currently exists. Required to enforce feature gating, manage billing state, and track brand-side subscription separately from business-side.

```sql
CREATE TABLE subscriptions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_type     text NOT NULL,           -- 'business' | 'brand'
  subscriber_id       uuid NOT NULL,           -- FK to businesses.id or brands.id
  plan_tier           text NOT NULL,           -- 'starter' | 'growth' | 'pro' | 'enterprise'
  status              text NOT NULL DEFAULT 'trialing',
                                               -- trialing | active | past_due | cancelled | churned
  stripe_subscription_id text,
  stripe_customer_id     text,
  current_period_start   timestamptz,
  current_period_end     timestamptz,
  cancelled_at           timestamptz,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
-- platform_admin: full access
-- brand_admin: own brand_id rows
-- business_user: own business_id rows
```

#### `brand_placement_products` Table

For the paid placement feature, brands pay to have certain products featured more prominently in recommendations. This must be tracked separately from organic recommendations.

```sql
CREATE TABLE brand_placement_products (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id            uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  product_id          uuid NOT NULL,           -- FK → pro_products or retail_products
  product_type        text NOT NULL,           -- 'pro' | 'retail'
  placement_type      text NOT NULL,           -- 'featured' | 'sponsored' | 'priority'
  placement_start     timestamptz NOT NULL,
  placement_end       timestamptz,
  impression_budget   integer,                 -- max impressions purchased
  impressions_served  integer NOT NULL DEFAULT 0,
  cpm_rate            numeric(8,4),            -- cost per thousand impressions
  active              boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE brand_placement_products ENABLE ROW LEVEL SECURITY;
-- CRITICAL: Placement status must be disclosed to business users in UI
-- Any "sponsored" recommendation must render a visible disclosure label
```

#### `revenue_simulations` Table

The revenue simulator currently has no persistence. Users lose their scenario when navigating away.

```sql
CREATE TABLE revenue_simulations (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id               uuid NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  business_id           uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  sessions_per_week     integer NOT NULL DEFAULT 20,
  avg_service_price     numeric(8,2) NOT NULL DEFAULT 120.00,
  weeks_per_year        integer NOT NULL DEFAULT 48,
  attach_rate_pct       numeric(5,4) NOT NULL DEFAULT 0.35,
  retail_avg_transaction numeric(8,2) NOT NULL DEFAULT 45.00,
  scenario_name         text,
  total_uplift_estimate numeric(12,2),
  inputs_snapshot       jsonb,                -- full snapshot of all slider values
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE revenue_simulations ENABLE ROW LEVEL SECURITY;
-- business_user scoped to business_id
```

#### `activation_assets` Table

Generated kit assets (training guides, shelf talkers, service protocols as PDFs, marketing copy) need to be linked to a plan and tracked.

```sql
CREATE TABLE activation_assets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id         uuid REFERENCES plans(id) ON DELETE SET NULL,
  business_id     uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  brand_id        uuid REFERENCES brands(id) ON DELETE SET NULL,
  asset_type      text NOT NULL,  -- 'training_guide' | 'shelf_talker' | 'protocol_card'
                                  -- | 'menu_redesign' | 'marketing_copy' | 'opening_order_pdf'
  asset_name      text NOT NULL,
  storage_path    text,           -- Supabase Storage path
  public_url      text,
  generation_status text NOT NULL DEFAULT 'queued',
                                  -- queued | generating | complete | failed
  generated_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE activation_assets ENABLE ROW LEVEL SECURITY;
```

---

### A4. Schema Completeness Audit

The following assessment covers all 46 existing tables. Each table is rated for completeness, usage status, and any obvious missing fields.

**Rating Key:**
- **CRITICAL** — Core to the platform's primary value proposition; must be complete
- **SECONDARY** — Supports a feature but not on the critical path
- **UNUSED/UNCLEAR** — No clear consumer in the current engine code; may be legacy or planned

| Table | Status | Assessment | Missing Fields / Issues |
|---|---|---|---|
| `businesses` | CRITICAL | Core tenant entity. Appears complete for MVP. | `status` field lifecycle (onboarding/active/suspended/churned) — confirm it exists. `plan_tier` for feature gating. |
| `brands` | CRITICAL | Core brand entity. Functional. | `slug` UNIQUE constraint missing (known bug). `status` (draft/published/suspended) needed. |
| `brand_assets` | SECONDARY | Stores brand logos, imagery. Likely complete. | Confirm `asset_type` enum and `storage_path` are present. |
| `brand_differentiation_points` | SECONDARY | Powers brandDifferentiationEngine. | May lack `display_order`, `active` flag. |
| `canonical_protocols` | CRITICAL | Core protocol catalog. Must be fully populated. | `embedding vector(1536)` — confirm column exists and is indexed with ivfflat/hnsw. `duration_minutes` needed for confidence scoring. |
| `canonical_protocol_steps` | CRITICAL | Step-by-step protocol definition. | `step_order` integer required. `duration_seconds` optional but useful. |
| `canonical_protocol_step_products` | CRITICAL | Links products to steps. Powers opening order. | `typical_usage_amount` and `usage_unit` must exist. `is_required` boolean needed. |
| `pro_products` | CRITICAL | Backbar product catalog. | `wholesale_price`, `msrp`, `sku` must be present. `stock_status` useful. |
| `retail_products` | CRITICAL | Retail product catalog for attach engine. | `wholesale_price`, `msrp`, `consumer_benefit` text. May be missing `embed_vector` for semantic attach. |
| `spa_menus` | CRITICAL | Uploaded/parsed spa menus. | `raw_text` and `parsed_services JSONB` needed. Relationship to `menu_uploads` needs clarification — possible overlap/duplication. |
| `spa_services` | CRITICAL | Individual parsed services from a menu. | `duration_minutes`, `price`, `category` required for confidence scoring. |
| `spa_menu_services` | SECONDARY | Join table for spa_menus ↔ spa_services. | May be redundant with `spa_services.menu_id` FK. Audit for necessity. |
| `spa_service_mapping` | CRITICAL | Output of mappingEngine/serviceMappingEngine. | `override_flag boolean`, `override_by uuid`, `match_type text`, `confidence_score numeric` — confirm all present. |
| `service_gaps` | CRITICAL | Individual gap records. | Relationship to `service_gap_analysis` needs clarity — are these the line items vs. the parent? |
| `service_gap_analysis` | CRITICAL | Parent output of gapAnalysisEngine. | `revenue_opportunity numeric`, `priority_rank integer` needed. |
| `service_category_benchmarks` | SECONDARY | Benchmark data for gap scoring. | `category text`, `avg_services_count`, `top_performer_count`. May be sparsely populated. |
| `medspa_treatments` | SECONDARY | Medspa-specific treatment catalog. | Relationship to `canonical_protocols` unclear — is this a subtype or separate? Needs FK or discriminator. |
| `medspa_products` | SECONDARY | Medspa-specific products. | Overlap risk with `pro_products`. Needs audit for deduplication. |
| `treatment_costs` | CRITICAL | COGS per treatment. Powers margin model. | `cost_per_service numeric`, `canonical_protocol_id FK` — must exist. `typical_usage_amount` may duplicate `canonical_protocol_step_products`. |
| `protocol_costing` | SECONDARY | Aggregate cost rollup per protocol. | May be a computed/denormalized cache. Confirm it is kept in sync with `treatment_costs`. |
| `protocol_mappings` | CRITICAL | Stores mapping results (possibly same as `spa_service_mapping`?). | Audit for overlap with `spa_service_mapping`. If duplicated, consolidate. |
| `plan_submissions` | CRITICAL | Tracks when a plan was submitted for analysis. | `submitted_at`, `submitted_by` needed. |
| `plan_outputs` | CRITICAL | Raw outputs from planOrchestrator. | `output_type`, `output_data JSONB`, `plan_id FK` — confirm. May overlap with `business_plan_outputs`. |
| `business_plan_outputs` | CRITICAL | Business-facing plan output. | `plan_id FK`, `output_type`, `output_data JSONB`. Confirm distinct from `plan_outputs`. |
| `phased_rollout_plans` | SECONDARY | Output of phasedRolloutPlanner. | `plan_id FK`, `phase_count`, `total_duration_weeks`. |
| `rollout_plan_items` | SECONDARY | Individual items per rollout phase. | `phase_number`, `item_type`, `due_date`, `status`. |
| `implementation_readiness` | SECONDARY | Output of implementationReadinessEngine. | `readiness_score numeric`, `blocking_issues JSONB`. |
| `opening_orders` | CRITICAL | Generated opening order header. | `order_total numeric`, `plan_id FK`, `status`. Line items may live in a separate table or JSONB blob — migrate to `order_items`. |
| `retail_attach_recommendations` | CRITICAL | Output of retailAttachEngine. | `attach_rate_estimate`, `revenue_uplift_estimate`, `retail_product_id FK`. |
| `orders` | CRITICAL | Actual placed orders. | Status enum, `business_id FK`, `brand_id FK`, `total numeric`. Line items in separate `order_items` table (proposed). |
| `spa_leads` | SECONDARY | Lead capture for brand/spa sales. | `lead_source`, `status`, `assigned_to`. |
| `lead_activities` | SECONDARY | Activity log per lead. | `activity_type`, `notes`, `performed_by`. |
| `marketing_calendar` | UNUSED/UNCLEAR | No clear engine consumer identified. | Verify if actively used. May be placeholder for P2 feature. |
| `brand_analytics` | CRITICAL | Aggregated brand metrics. Privacy boundary required. | Must NOT contain `business_id` references. `metric_type`, `metric_value`, `period`. |
| `business_analytics` | SECONDARY | Business-level usage analytics. | `metric_type`, `value`, `period`. Confirm RLS scopes to `business_id`. |
| `search_analytics` | SECONDARY | Tracks search queries for product/protocol discovery. | `query_text`, `results_count`, `clicked_result_id`. Useful for improving recommendations. |
| `ai_concierge_chat_logs` | SECONDARY | Stores aiConciergeEngine conversation history. | `session_id`, `role` (user/assistant), `content`, `plan_id FK`. |
| `ai_concierge_starter_questions` | SECONDARY | Seeded starter prompts for the AI concierge. | `question_text`, `category`, `brand_id` (brand-specific starters). |
| `mixing_rules` | CRITICAL | Contraindication rules. Powers guardrails. | `product_a_id`, `product_b_id`, `rule_type` (contraindicated/caution), `reason`. |
| `dataIntegrityRules` | SECONDARY | Application-layer validation rules. | Table name is not snake_case — rename to `data_integrity_rules` for consistency. Content and usage unclear. |
| `user_profiles` | CRITICAL | Links auth.users to business/brand context. | `role` enum, `business_id`, `brand_id`. Role enum must include all 5 values. `full_name`, `avatar_url`. |
| `audit_log` | CRITICAL | Security/compliance audit trail. | `actor_id`, `action`, `table_name`, `row_id`, `old_value JSONB`, `new_value JSONB`, `ip_address`. |
| `platform_health` | SECONDARY | System health metrics. | `metric_name`, `metric_value`, `recorded_at`. Admin-only visibility. |
| `document_ingestion_log` | SECONDARY | Tracks document uploads and processing. | `document_type`, `source_url`, `status`, `error_message`. |
| `menu_uploads` | CRITICAL | Raw menu upload records. | `raw_text`, `parsed_json JSONB`, `upload_status`, `business_id FK`. Potential overlap with `spa_menus` — audit. |
| `plans` | CRITICAL | Central plan entity, parent of all analysis outputs. | `status` (draft/processing/ready/failed/stale) — REQUIRED for async fix. `brand_id FK`, `business_id FK`. |
| `businesses` | CRITICAL | (See row 1) | — |

**Tables requiring immediate audit for deduplication:**
- `spa_menus` vs. `menu_uploads` — likely the same concept modeled twice
- `plan_outputs` vs. `business_plan_outputs` — likely the same concept with different naming
- `protocol_mappings` vs. `spa_service_mapping` — likely the same concept
- `medspa_treatments` vs. `canonical_protocols` — may be a subtype that should be unified

---

## Section B: Permissioning / Multi-Tenant Security

### B1. RLS Policy Design

All tables must have RLS enabled. The following specifies the policy logic per table group. Helper functions should be defined once and reused.

#### Helper Functions

```sql
-- Returns true if the current user has a role of admin or platform_admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'platform_admin')
  );
$$;

-- Returns the business_id of the current authenticated user
CREATE OR REPLACE FUNCTION my_business_id()
RETURNS uuid LANGUAGE sql SECURITY DEFINER AS $$
  SELECT business_id FROM user_profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Returns the brand_id of the current authenticated user
CREATE OR REPLACE FUNCTION my_brand_id()
RETURNS uuid LANGUAGE sql SECURITY DEFINER AS $$
  SELECT brand_id FROM user_profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Returns true if the current user is a brand_admin
CREATE OR REPLACE FUNCTION is_brand_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role = 'brand_admin'
  );
$$;
```

#### plans / business_plan_outputs

```sql
-- plans: SELECT
CREATE POLICY "plans_select" ON plans
  FOR SELECT USING (
    business_id = my_business_id()
    OR is_admin()
  );

-- plans: INSERT (business user creating a plan for their own business)
CREATE POLICY "plans_insert" ON plans
  FOR INSERT WITH CHECK (
    business_id = my_business_id()
  );

-- plans: UPDATE (business user or admin)
CREATE POLICY "plans_update" ON plans
  FOR UPDATE USING (
    business_id = my_business_id()
    OR is_admin()
  );

-- business_plan_outputs: SELECT
CREATE POLICY "bpo_select" ON business_plan_outputs
  FOR SELECT USING (
    plan_id IN (
      SELECT id FROM plans WHERE business_id = my_business_id()
    )
    OR is_admin()
  );
```

#### brands

```sql
-- brands: public SELECT for published brands
CREATE POLICY "brands_public_read" ON brands
  FOR SELECT USING (
    status = 'published'
    OR brand_id = my_brand_id()
    OR is_admin()
  );

-- brands: UPDATE scoped to own brand
CREATE POLICY "brands_brand_admin_update" ON brands
  FOR UPDATE USING (
    id = my_brand_id()
    AND is_brand_admin()
  );

-- brands: INSERT (platform_admin only — brand onboarding is admin-initiated)
CREATE POLICY "brands_admin_insert" ON brands
  FOR INSERT WITH CHECK (
    is_admin()
  );
```

#### brand_analytics

This table has the strictest constraint: brand admins may only see their own brand's aggregate metrics. No cross-brand reads are permitted under any role except `platform_admin`.

```sql
-- brand_analytics: brand_admin sees only own brand
CREATE POLICY "brand_analytics_brand_admin_select" ON brand_analytics
  FOR SELECT USING (
    brand_id = my_brand_id()
    AND is_brand_admin()
    OR is_admin()
  );

-- DENY: No policy permits brand_admin to read another brand's analytics.
-- The absence of a permissive policy means the default DENY applies.
```

#### canonical_protocols

```sql
-- canonical_protocols: public read (all authenticated users)
CREATE POLICY "canonical_protocols_read" ON canonical_protocols
  FOR SELECT USING (auth.role() = 'authenticated');

-- canonical_protocols: INSERT/UPDATE — admin or brand_admin for own brand
CREATE POLICY "canonical_protocols_write" ON canonical_protocols
  FOR ALL USING (
    brand_id = my_brand_id() AND is_brand_admin()
    OR is_admin()
  );
```

#### orders

```sql
-- orders: SELECT — own orders or admin
CREATE POLICY "orders_select" ON orders
  FOR SELECT USING (
    business_id = my_business_id()
    OR is_admin()
  );

-- orders: INSERT — own business only
CREATE POLICY "orders_insert" ON orders
  FOR INSERT WITH CHECK (
    business_id = my_business_id()
  );

-- orders: UPDATE — admin only (status management, fulfillment)
CREATE POLICY "orders_admin_update" ON orders
  FOR UPDATE USING (is_admin());
```

#### user_profiles

```sql
-- user_profiles: SELECT own row or admin
CREATE POLICY "user_profiles_select" ON user_profiles
  FOR SELECT USING (
    user_id = auth.uid()
    OR is_admin()
  );

-- user_profiles: UPDATE own row only (no role self-escalation)
CREATE POLICY "user_profiles_update_own" ON user_profiles
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (
    -- Prevent self-escalation to admin roles
    role NOT IN ('admin', 'platform_admin')
    OR is_admin()
  );
```

---

### B2. Data Partitioning Boundaries

#### brand_id Partition

All brand catalog data is partitioned by `brand_id`. This includes: `brands`, `brand_assets`, `brand_differentiation_points`, `canonical_protocols`, `canonical_protocol_steps`, `canonical_protocol_step_products`, `pro_products`, `retail_products`, `mixing_rules`.

A `brand_admin` user has a `brand_id` stored in `user_profiles.brand_id`. Every RLS policy on brand-side tables compares the row's `brand_id` to `my_brand_id()`.

#### business_id Partition

All operator data is partitioned by `business_id`. This includes: `plans`, `menu_uploads`, `business_plan_outputs`, `spa_menus`, `spa_services`, `spa_service_mapping`, `service_gap_analysis`, `retail_attach_recommendations`, `opening_orders`, `orders`, `implementation_readiness`, `phased_rollout_plans`, `spa_leads`.

A `business_user` or `spa_user` has a `business_id` stored in `user_profiles.business_id`.

#### Cross-Tenant Query Prevention Strategy

1. **RLS as the primary enforcement layer.** No application code should be trusted to enforce tenant isolation; RLS policies are the authoritative boundary.
2. **No tenant_id bypass in application code.** The Supabase client must NEVER use the service role key in browser-side or user-facing code. The service role key is restricted to Edge Functions only.
3. **Aggregation-only cross-tenant access.** Where a brand admin needs cross-business data (e.g., "how often is this protocol matched"), the system must query via a Postgres function or Edge Function that aggregates and strips `business_id` before returning results.
4. **No direct JOINs across partition keys in user-facing queries.** Queries issued from brand_admin sessions must not JOIN against `plans`, `businesses`, or any `business_id`-partitioned table.

#### Audit Logging for Admin Cross-Tenant Reads

When an `admin` or `platform_admin` queries data across tenant boundaries, the action must be logged.

```sql
-- Trigger function: log admin cross-tenant reads
-- Applied to sensitive tables when accessed by admin role
CREATE OR REPLACE FUNCTION log_admin_access()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF is_admin() THEN
    INSERT INTO audit_log (
      actor_id,
      action,
      table_name,
      row_id,
      metadata,
      created_at
    ) VALUES (
      auth.uid(),
      'admin_read',
      TG_TABLE_NAME,
      NEW.id,
      jsonb_build_object('reason', current_setting('app.audit_reason', true)),
      now()
    );
  END IF;
  RETURN NEW;
END;
$$;
```

All admin cross-tenant reads via the dashboard must pass an `app.audit_reason` session variable (set via `SET LOCAL app.audit_reason = 'support ticket #1234'` in the same transaction).

---

### B3. Brand Visibility Constraints

Brand analytics expose aggregate performance data to brand admins. The following rules define what is permissible to display.

#### ALLOWED

- "47 businesses have analyzed protocols in this category this month."
- "Your match rate for [Protocol Name]: 78% (category average: 71%)."
- "Top gap category among businesses analyzing your brand: Body Treatments (34%)."
- "Retail attach recommendations featuring your products: 312 this quarter."
- Trend charts showing brand's own metrics over time.
- Percentile ranking ("Your brand is in the top 15% for protocol adoption in the facial category") — as long as this is computed from anonymized aggregate.

#### NOT ALLOWED

- Naming any specific business, spa, or medspa that has or has not adopted a protocol.
- Showing a business's location, revenue estimate, or plan data.
- Showing which specific businesses placed or did not place an opening order.
- Any query result that could be reverse-engineered to identify a specific competitor brand's performance.
- Displaying counts so small they would de-anonymize (enforce a minimum threshold of N ≥ 5 for any displayed aggregate; show "< 5" for smaller counts).

#### Implementation Enforcement

```sql
-- brand_analytics view: enforce minimum anonymization threshold
CREATE VIEW brand_analytics_safe AS
SELECT
  brand_id,
  metric_type,
  period,
  CASE
    WHEN metric_value < 5 THEN NULL   -- suppress small counts
    ELSE metric_value
  END AS metric_value,
  CASE
    WHEN metric_value < 5 THEN true
    ELSE false
  END AS is_suppressed
FROM brand_analytics;
```

---

## Section C: Recommendation Integrity

### C1. Confidence Scoring System

#### Current System (v1)

The existing confidence blending formula is:

```
confidence_score = (0.60 × keyword_score) + (0.40 × semantic_score)
```

Where:
- `keyword_score` = normalized score from keyword matching against service name, description, and category
- `semantic_score` = cosine similarity from pgvector `match_protocols` RPC (threshold: 0.65)

#### Specified v2 Scoring Tiers

| Condition | Score Range | Rationale |
|---|---|---|
| Exact name match (case-insensitive) | 100% | String equality after normalization |
| High semantic similarity (cosine > 0.85) | 88–92% | Strong embedding-space proximity |
| Duration + category + keyword match (all three) | 75–85% | Multi-signal corroboration |
| Duration match + category match (no keyword) | 65–74% | Two structural signals |
| Category match + keyword match (no duration) | 55–64% | Two content signals |
| Partial keyword match only | 40–54% | Weak single signal |
| Semantic only (0.65–0.75 cosine) | 35–50% | Below strong-signal threshold |
| No meaningful match | < 35% | Treat as NO_MATCH |

#### Confidence Tiers and UI Behavior

| Tier | Score Range | UI Behavior |
|---|---|---|
| `HIGH` | > 75% | Show match with protocol name, rationale collapsed by default. Green indicator. |
| `MEDIUM` | 40–75% | Show match with rationale expanded. Amber indicator. Prompt user to verify. |
| `LOW` | < 40% | Show as "Possible Match" with visible uncertainty. Red/grey indicator. Require user confirmation before including in plan. |
| `NO_MATCH` | < 30% (floor) | Do not show as a match. Classify as a gap candidate. Show "No matching protocol found — this may be a gap opportunity." |

The 30% confidence floor is a hard guardrail. A match with score < 0.30 must never be presented to the user as a confirmed match.

#### v2 Scoring Algorithm (Pseudocode)

```typescript
function computeConfidenceScore(
  spaService: SpaService,
  protocol: CanonicalProtocol
): ConfidenceResult {

  let score = 0;
  const signals: string[] = [];

  // Signal 1: Exact name match
  if (normalize(spaService.name) === normalize(protocol.name)) {
    return { score: 1.0, match_type: 'exact', signals: ['exact_name_match'] };
  }

  // Signal 2: Semantic similarity (pgvector)
  const semanticScore = await matchProtocols(spaService.embedding, 1)[0]?.similarity ?? 0;
  if (semanticScore > 0.85) {
    score += 0.40;
    signals.push(`semantic_similarity:${semanticScore.toFixed(3)}`);
  } else if (semanticScore >= 0.65) {
    score += (semanticScore - 0.65) / (0.85 - 0.65) * 0.25;
    signals.push(`semantic_similarity:${semanticScore.toFixed(3)}`);
  }

  // Signal 3: Category match
  if (spaService.category === protocol.category) {
    score += 0.20;
    signals.push('category_match');
  }

  // Signal 4: Duration match (within ±10 minutes)
  if (Math.abs(spaService.duration_minutes - protocol.duration_minutes) <= 10) {
    score += 0.20;
    signals.push(`duration_match:${spaService.duration_minutes}min`);
  }

  // Signal 5: Keyword overlap
  const keywordScore = computeKeywordOverlap(spaService.name, protocol.name);
  score += keywordScore * 0.20;
  if (keywordScore > 0.5) signals.push(`keyword_overlap:${keywordScore.toFixed(2)}`);

  // Enforce floor
  if (score < 0.30) {
    return { score, match_type: 'no_match', tier: 'NO_MATCH', signals };
  }

  const tier = score > 0.75 ? 'HIGH' : score > 0.40 ? 'MEDIUM' : 'LOW';
  const match_type = score > 0.75 ? 'semantic' : 'partial';

  return { score: Math.min(score, 0.99), match_type, tier, signals };
}
```

---

### C2. Human-in-the-Loop Overrides

#### User Correction Flow

1. The user views the service mapping results in the plan UI.
2. For any service with a MEDIUM or LOW confidence match, an "Edit Mapping" control is visible.
3. The user can:
   - **Drag** a service card to a different protocol column in the mapping view.
   - **Select from list**: click "Change Protocol" to open a searchable dropdown of all `canonical_protocols` for the brand.
   - **Mark as No Match**: explicitly flag that the service has no corresponding protocol.
4. On confirmation, the system writes the override to `spa_service_mapping`.

#### Override Storage Schema

```sql
-- Required fields in spa_service_mapping for override support:
ALTER TABLE spa_service_mapping
  ADD COLUMN IF NOT EXISTS override_flag boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS override_by uuid REFERENCES user_profiles(id),
  ADD COLUMN IF NOT EXISTS override_at timestamptz,
  ADD COLUMN IF NOT EXISTS original_canonical_protocol_id uuid
    REFERENCES canonical_protocols(id),
  ADD COLUMN IF NOT EXISTS override_reason text;
  -- override_reason: 'user_correction' | 'admin_correction' | 'no_match_confirmed'
```

When an override is applied:
- `override_flag` = `true`
- `override_by` = the `user_profiles.id` of the correcting user
- `override_at` = current timestamp
- `original_canonical_protocol_id` = the system's original suggestion (for training signal collection)
- The `canonical_protocol_id` column is updated to the user's chosen protocol (or `NULL` for "no match")

#### Override Feedback Loop (Training Signal — ASSUMPTION)

**NOTE: The following describes an aspirational feedback loop. The mechanism for feeding override data back into model training is not yet implemented and is marked as an assumption.**

Override patterns can be aggregated to improve future recommendations:

```sql
-- Aggregate override patterns for training signal review
CREATE VIEW override_signal_summary AS
SELECT
  original_canonical_protocol_id,
  canonical_protocol_id AS corrected_to_protocol_id,
  COUNT(*) AS override_count,
  COUNT(DISTINCT override_by) AS distinct_users,
  MIN(override_at) AS first_seen,
  MAX(override_at) AS last_seen
FROM spa_service_mapping
WHERE override_flag = true
  AND original_canonical_protocol_id IS NOT NULL
  AND canonical_protocol_id IS NOT NULL
GROUP BY 1, 2
ORDER BY 3 DESC;
```

This view surfaces systematic mapping errors (e.g., "Protocol A is frequently corrected to Protocol B by users") which a data administrator can use to retrain the keyword scoring weights or update protocol embeddings.

#### Admin QA of Override Patterns

Admins can access a "Mapping Quality" dashboard that shows:
- Override rate by protocol (high override rate = system is consistently wrong)
- Override rate by brand (some brands' protocol names may be particularly ambiguous)
- Override patterns (from → to frequency matrix)
- Anomaly alerts: override rate > 30% on any protocol triggers an alert for admin review

---

### C3. Explainability Outputs

Every recommendation record — whether a service mapping, gap recommendation, or retail attach — must persist the following explainability fields.

#### Required Fields on Recommendation Records

```typescript
interface RecommendationExplainability {
  match_type: 'exact' | 'partial' | 'semantic' | 'candidate' | 'no_match';
  confidence_score: number;         // 0.0 to 1.0
  confidence_tier: 'HIGH' | 'MEDIUM' | 'LOW' | 'NO_MATCH';
  rationale: string;                // Human-readable explanation
  data_sources_used: string[];      // Array of table names consulted
  missing_data_flags: string[];     // Fields that would improve confidence
}
```

#### Example `rationale` Strings

| Scenario | Rationale String |
|---|---|
| Exact match | "Matched on service name 'HydraFacial' to protocol 'HydraFacial Signature Treatment' — exact name match." |
| Semantic + duration | "Matched 'Glow Facial 45min' to protocol 'Brightening Enzyme Facial' based on high semantic similarity (0.88) and 45-minute duration match." |
| Partial keyword | "Partial match: 'Deep Clean' shares keyword overlap with protocol 'Deep Cleansing Back Treatment'. Category mismatch (facial vs. body) reduces confidence." |
| Candidate / gap | "No existing match found for 'Lash Lift'. Nearest protocol 'Eye Treatment Essentials' has low similarity (0.32). Flagged as potential gap opportunity." |

#### `data_sources_used` Examples

```json
["spa_services", "canonical_protocols", "service_category_benchmarks"]
```

```json
["spa_services", "canonical_protocols", "canonical_protocol_steps", "treatment_costs"]
```

#### `missing_data_flags` Examples

```json
["spa_services.duration_minutes", "canonical_protocols.embedding"]
```

```json
["treatment_costs.cost_per_service", "retail_products.consumer_benefit"]
```

These flags are shown to the user as "Improve Your Results" prompts: "Add service durations to your menu to improve match accuracy."

---

### C4. Guardrails to Prevent Nonsensical Recommendations

#### Minimum Data Requirements (Pre-Analysis Gate)

Before any analysis engine is permitted to run, the following conditions must be met:

| Condition | Minimum Requirement | Error Message if Unmet |
|---|---|---|
| Menu text length | > 50 characters | "Your menu appears too short to analyze. Please upload a complete menu." |
| Number of parsed services | ≥ 2 | "We need at least 2 services to generate a meaningful analysis." |
| Brand protocol count | ≥ 3 canonical protocols | "This brand does not have enough protocols loaded to run analysis." |
| Brand has products | ≥ 1 pro_product | "No brand products found. Opening order cannot be generated." |

```typescript
function validateAnalysisPrerequisites(
  menuText: string,
  parsedServices: SpaService[],
  brandProtocols: CanonicalProtocol[],
  brandProducts: ProProduct[]
): ValidationResult {
  const errors: string[] = [];

  if (menuText.trim().length < 50)
    errors.push('Menu text too short for analysis (minimum 50 characters).');
  if (parsedServices.length < 2)
    errors.push('Minimum 2 services required for gap analysis.');
  if (brandProtocols.length < 3)
    errors.push('Brand requires at least 3 protocols to run mapping.');
  if (brandProducts.length < 1)
    errors.push('No brand products available; opening order generation skipped.');

  return { valid: errors.length === 0, errors };
}
```

#### Confidence Floor

Never present a "match" with confidence < 0.30. Any result below 0.30 must be re-classified as `NO_MATCH` and optionally surfaced as a gap candidate.

```typescript
const CONFIDENCE_FLOOR = 0.30;

if (result.confidence_score < CONFIDENCE_FLOOR) {
  result.match_type = 'no_match';
  result.confidence_tier = 'NO_MATCH';
  // Optionally promote to gap_candidate
}
```

#### Category Cross-Contamination Prevention

Protocols and services are typed by `category`. A massage/body protocol must never match a facial service, and vice versa. Category matching is a hard constraint, not a scoring signal.

```typescript
const CATEGORY_MAP: Record<string, string[]> = {
  'facial':        ['facial', 'skin', 'peel', 'enzyme', 'hydration', 'brightening'],
  'body':          ['body', 'massage', 'wrap', 'scrub', 'lymphatic'],
  'nail':          ['nail', 'manicure', 'pedicure'],
  'eye':           ['eye', 'lash', 'brow'],
  'injectable':    ['injectable', 'botox', 'filler', 'neurotoxin'],
  'laser':         ['laser', 'ipl', 'rf', 'energy_device'],
};

// If categories do not share a bucket, prevent the match regardless of score
function categoryCompatible(serviceCategory: string, protocolCategory: string): boolean {
  for (const bucket of Object.values(CATEGORY_MAP)) {
    if (bucket.includes(serviceCategory) && bucket.includes(protocolCategory)) return true;
  }
  return false;
}
```

#### Mixing Rules Enforcement

Before any retail attach or protocol recommendation is finalized, check `mixing_rules` for contraindications.

```typescript
async function checkMixingRules(
  productIds: string[]
): Promise<MixingViolation[]> {
  const { data: violations } = await supabase
    .from('mixing_rules')
    .select('*')
    .in('product_a_id', productIds)
    .in('product_b_id', productIds)
    .eq('rule_type', 'contraindicated');

  return violations ?? [];
}
// Any violation removes the combination from the recommendation set.
// Violations of type 'caution' are flagged but not excluded.
```

#### Maximum Gap Recommendations

The `gapAnalysisEngine` must return a maximum of **10 gap recommendations** per plan, ordered by `revenue_opportunity DESC`. Returning more than 10 overwhelms operators and reduces action rate.

```typescript
const MAX_GAP_RECOMMENDATIONS = 10;
const topGaps = gaps
  .sort((a, b) => b.revenue_opportunity - a.revenue_opportunity)
  .slice(0, MAX_GAP_RECOMMENDATIONS);
```

#### Revenue Estimate Sanity Cap

If the computed total revenue uplift exceeds 300% of the business's estimated current annual revenue, flag it as a likely calculation error rather than displaying the raw number.

```typescript
const REVENUE_UPLIFT_SANITY_MULTIPLIER = 3.0;

if (totalUpliftEstimate > currentAnnualRevenue * REVENUE_UPLIFT_SANITY_MULTIPLIER) {
  upliftDisplay = {
    value: totalUpliftEstimate,
    flagged: true,
    flag_reason: 'Estimated uplift exceeds 300% of current revenue. Please verify input assumptions.',
  };
}
```

---

## Section D: Economics Engine

### D1. Revenue Uplift Model

The revenue uplift model estimates annualized additional revenue from adopting recommended protocols and retail products. All values are estimates and must be disclosed as such in the UI.

#### Base Variables

| Variable | Description | Default Value | User-Adjustable |
|---|---|---|---|
| `sessions_per_week` | Number of revenue-generating sessions per week | 20 | Yes |
| `avg_service_price` | Average ticket price per service session ($) | $120 | Yes |
| `weeks_per_year` | Operating weeks per year | 48 | Yes (range: 40–52) |
| `attach_rate_pct` | % of sessions that result in a retail purchase | 35% | Yes (range: 5%–80%) |
| `retail_avg_transaction` | Average retail sale value ($) | $45 | Yes |

#### Revenue Formulas

```
// Service revenue per gap (per week)
service_revenue_weekly = sessions_per_week × avg_service_price

// Annual service revenue per gap
service_revenue_annual = service_revenue_weekly × weeks_per_year

// Retail revenue (annual)
retail_revenue_annual = attach_rate_pct × retail_avg_transaction × sessions_per_week × weeks_per_year

// Total revenue uplift per gap
gap_uplift = service_revenue_annual + retail_revenue_annual

// Cumulative uplift (top N gaps)
total_uplift = SUM(gap_uplift[1..N])
               where N = min(recommended_gaps.length, MAX_GAP_RECOMMENDATIONS)
```

#### Example Calculation

```
sessions_per_week    = 20
avg_service_price    = $130
weeks_per_year       = 48
attach_rate_pct      = 0.35
retail_avg_transaction = $50

service_revenue_annual = 20 × $130 × 48 = $124,800
retail_revenue_annual  = 0.35 × $50 × 20 × 48 = $16,800
gap_uplift             = $124,800 + $16,800 = $141,600

For 3 gap recommendations (assuming same inputs scaled proportionally):
total_uplift ≈ $141,600 × adoption_factor
```

Note: Each gap's `sessions_per_week` input represents the incremental sessions added by adopting that protocol — not total business sessions. Users should be prompted to input realistic incremental estimates.

---

### D2. Margin Model

#### COGS Data Source

The primary COGS source is `treatment_costs.cost_per_service`, which links via `canonical_protocol_id` to a specific protocol. This value represents the per-service cost of backbar products consumed during the treatment.

```sql
SELECT
  cp.name AS protocol_name,
  tc.cost_per_service,
  tc.typical_usage_amount,
  tc.usage_unit
FROM treatment_costs tc
JOIN canonical_protocols cp ON cp.id = tc.canonical_protocol_id
WHERE cp.brand_id = :brand_id;
```

#### Gross Margin Formula

```
gross_margin_per_service = (avg_service_price - cost_per_service) / avg_service_price
gross_margin_dollars     = avg_service_price - cost_per_service
```

#### Default COGS Assumptions (When treatment_costs Is Missing)

When no `treatment_costs` record exists for a protocol, the system applies category-level defaults. These defaults must be visibly labeled as estimates.

| Service Category | Default COGS % | Rationale |
|---|---|---|
| Facial services | 18–22% | Industry benchmark for facial backbar consumption |
| Body treatments | 15–20% | Lower product consumption per session |
| Injectables / Medspa | 30–45% | Higher product cost (medical-grade) |
| Retail products | 50% | Standard wholesale/MSRP assumption |
| Nail services | 10–15% | Low consumables per service |
| Massage | 5–10% | Minimal product consumption |

#### Payback Period

```
payback_period_weeks = opening_order_value / weekly_margin_uplift

where:
  weekly_margin_uplift = sessions_per_week × gross_margin_dollars_per_service
  opening_order_value  = SUM(order_items.line_total) from the generated opening order
```

#### Disclosure Requirement

All margin and payback calculations must include a visible disclaimer in the UI:

> "Revenue and margin figures are estimates based on your inputs and industry benchmarks. Actual results will vary. Consult your accountant for financial projections."

---

### D3. Sensitivity Sliders + Transparency

#### User-Adjustable Variables in the Revenue Simulator

| Variable | UI Control | Validation Range | Default |
|---|---|---|---|
| Sessions per week | Integer slider | 1 – 200 | 20 |
| Average service price | Currency input | $20 – $2,000 | $120 |
| Operating weeks per year | Integer slider | 40 – 52 | 48 |
| Retail attach rate | Percentage slider | 5% – 80% | 35% |
| Average retail transaction | Currency input | $10 – $500 | $45 |
| Number of gaps to model | Integer slider | 1 – 10 | Top 5 |

If a user enters a value outside the validation range, the input reverts to the nearest valid boundary and displays: "Value adjusted to valid range."

#### "Methodology" Expandable Section

The Revenue Simulator must include an expandable "How is this calculated?" section containing:

1. The formula used (plain English + formula notation)
2. Which inputs are user-provided vs. system defaults
3. Which COGS values are from real data vs. category defaults
4. A note that retail attach rate is based on industry benchmarks (Source: Professional Beauty Association data) unless the business provides actual POS data
5. Full disclosure that these are forward-looking estimates, not guarantees

#### "Reset to Defaults" Option

A "Reset to Defaults" button must be present in the simulator. On click:
- All slider values return to system defaults
- The plan's `revenue_simulations` record (if saved) is not overwritten — only the UI state resets
- The reset action is logged to `audit_log` with `action = 'simulator_reset'`

#### Scenario Save/Compare (P2 Feature)

- Users can name and save up to 3 scenarios per plan (stored in `revenue_simulations` table)
- A side-by-side compare view shows two scenarios in parallel columns
- Each scenario stores the full `inputs_snapshot JSONB` for reproducibility
- Scenarios are tied to the plan and persist across sessions

---

### D4. Opening Order Engine Logic

The `openingOrderEngine` generates a recommended first purchase order from the brand's product catalog, sized for the protocols the business plans to adopt.

#### Data Flow

```
plans
  └── service_gap_analysis (top N accepted gaps)
        └── canonical_protocols
              └── canonical_protocol_steps
                    └── canonical_protocol_step_products
                          ├── pro_products (backbar items)
                          │     ├── wholesale_price
                          │     └── msrp
                          └── treatment_costs
                                └── typical_usage_amount (unit consumption per service)

retail_attach_recommendations
  └── retail_products
        ├── wholesale_price
        └── msrp
```

#### Quantity Calculation

```
quantity_recommended = ceil(
  (sessions_per_week × weeks_to_stock)           // e.g., 4 weeks
  × typical_usage_amount                         // from treatment_costs or canonical_protocol_step_products
  / units_per_product_container                  // from pro_products.unit_size (if available)
)
```

Default `weeks_to_stock` = 4 (one month of backbar supply). If `units_per_product_container` is not stored, the engine must flag the item and estimate based on a default container size by product category.

#### Retail Extension

Retail products sourced from `retail_attach_recommendations` are appended to the order with a default quantity of 3 units per SKU (suggested minimum display quantity). The user can adjust quantities in the order review UI.

#### Missing Pricing Data Handling

| Scenario | Handling |
|---|---|
| `pro_products.wholesale_price` is NULL | Flag item as "Price not available — contact brand rep." Include in order but exclude from `order_total` computation. |
| `treatment_costs` missing for a protocol | Use category-level COGS default. Mark item with `is_estimated = true`. |
| `canonical_protocol_step_products.typical_usage_amount` is NULL | Default to 1 unit per service. Flag as "Usage amount unspecified — verify with brand." |
| Product is discontinued (`pro_products.stock_status = 'discontinued'`) | Exclude from order. Suggest nearest active substitute if available. |

#### Output Structure

```typescript
interface OpeningOrderLineItem {
  product_id: string;
  product_name: string;
  sku: string;
  product_type: 'pro' | 'retail';
  quantity: number;
  unit_wholesale: number | null;
  unit_msrp: number | null;
  line_total: number | null;
  is_estimated: boolean;
  flags: string[];           // e.g., ['price_unavailable', 'usage_estimated']
  source_protocol_id: string | null;
}
```

---

## Section E: AI Engine Architecture (Current State + Gaps)

### E1. Engine Inventory and Roles

| Engine | Input | Processing | Output Tables | Current Issues |
|---|---|---|---|---|
| `mappingEngine` | Parsed spa services, canonical protocols | Keyword + semantic scoring (60/40 blend), pgvector `match_protocols` RPC | `spa_service_mapping` | No transaction wrapping; race condition with navigate; no validation gate |
| `serviceMappingEngine` | Same as mappingEngine | May be a duplicate or wrapper — audit for consolidation | `spa_service_mapping` | Possible duplication with `mappingEngine` |
| `gapAnalysisEngine` | `spa_service_mapping`, `canonical_protocols`, `service_category_benchmarks` | Identifies protocols not matched to any existing service | `service_gap_analysis`, `service_gaps` | Unguarded `Promise.all`; max gap limit not enforced in all code paths |
| `retailAttachEngine` | Gap analysis results, `retail_products`, `attach_rate` inputs | Matches retail products to gap protocols based on product-protocol affinity | `retail_attach_recommendations` | No mixing_rules check in current implementation |
| `openingOrderEngine` | Gap analysis, protocol steps, products, treatment_costs | Builds quantity-calculated opening order from backbar + retail products | `opening_orders` (+ proposed `order_items`) | Missing pricing data handled inconsistently; no transaction wrap |
| `planOrchestrator` | All engine inputs | Coordinates execution order of all engines for a given plan | `plan_outputs`, `business_plan_outputs` | Race condition (navigate before save); no status polling mechanism; no retry on failure |
| `phasedRolloutPlanner` | Gap analysis results, implementation readiness | Generates phased adoption timeline | `phased_rollout_plans`, `rollout_plan_items` | Output completeness unclear; no time-to-value calculation |
| `implementationReadinessEngine` | Business profile, gap analysis | Scores business readiness to adopt each recommendation | `implementation_readiness` | Scoring rubric undocumented; no explanation output |
| `brandDifferentiationEngine` | `brand_differentiation_points`, gap analysis | Generates brand-specific competitive positioning copy | `business_plan_outputs` (differentiation section) | Depends on brand having populated `brand_differentiation_points` — no fallback |
| `aiConciergeEngine` | User message, plan context, brand context | Generates contextual AI responses via OpenAI/Anthropic API call in Edge Function | `ai_concierge_chat_logs` | No rate limiting per session; no context window management for long sessions |

---

### E2. Async Processing Architecture Gap

#### Current State (Broken)

```typescript
// CURRENT — RACE CONDITION
async function handleAnalyze() {
  triggerAnalysis();        // async — starts engines
  navigate('/results');     // executes IMMEDIATELY — before analysis completes
  // saveOutputs() may not have run yet when the results page mounts
}
```

The result: the results page renders before outputs are written to the database. The UI either shows stale data, empty data, or crashes.

#### Required Fix: Status-Based Async Pattern

##### Step 1: Add Status to Plans Table

```sql
ALTER TABLE plans
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'processing', 'ready', 'failed', 'stale')),
  ADD COLUMN IF NOT EXISTS processing_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS processing_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS processing_error text;
```

##### Step 2: Analysis Write Order

```typescript
// CORRECTED FLOW
async function handleAnalyze(planId: string) {
  // 1. Set status = 'processing' BEFORE navigating
  await supabase.from('plans')
    .update({ status: 'processing', processing_started_at: new Date().toISOString() })
    .eq('id', planId);

  // 2. Navigate to results page (which will show loading state)
  navigate(`/plans/${planId}/results`);

  // 3. In the background (Edge Function or sequential awaits with error handling):
  try {
    await runAllEngines(planId);     // wrapped in try/catch per engine
    await supabase.from('plans')
      .update({ status: 'ready', processing_completed_at: new Date().toISOString() })
      .eq('id', planId);
  } catch (err) {
    await supabase.from('plans')
      .update({ status: 'failed', processing_error: err.message })
      .eq('id', planId);
  }
}
```

##### Step 3: Results Page Polling or Realtime

**Option A: Polling (simpler, adequate for MVP)**

```typescript
// In the results page component
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS  = 180_000; // 3 minutes

useEffect(() => {
  if (plan.status === 'ready' || plan.status === 'failed') return;

  const startTime = Date.now();
  const interval = setInterval(async () => {
    if (Date.now() - startTime > POLL_TIMEOUT_MS) {
      clearInterval(interval);
      setPlanStatus('failed');
      return;
    }

    const { data } = await supabase
      .from('plans')
      .select('status, processing_error')
      .eq('id', planId)
      .single();

    if (data?.status === 'ready' || data?.status === 'failed') {
      clearInterval(interval);
      setPlanStatus(data.status);
    }
  }, POLL_INTERVAL_MS);

  return () => clearInterval(interval);
}, [plan.status, planId]);
```

**Option B: Supabase Realtime (preferred for production)**

```typescript
useEffect(() => {
  const channel = supabase
    .channel(`plan-status-${planId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'plans', filter: `id=eq.${planId}` },
      (payload) => {
        const newStatus = payload.new.status;
        setPlanStatus(newStatus);
        if (newStatus === 'ready' || newStatus === 'failed') {
          supabase.removeChannel(channel);
        }
      }
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [planId]);
```

##### Step 4: UI State Machine

| Plan Status | UI State | User Visible |
|---|---|---|
| `draft` | "Analysis not yet started" | Start Analysis button |
| `processing` | "Analyzing your menu..." | Animated progress indicator, stage labels |
| `ready` | "Your results are ready" | Full results view |
| `failed` | "Analysis failed" | Error message + Retry button |
| `stale` | "Results may be outdated" | Results with staleness warning + Re-analyze button |

UI stage labels during processing:
1. "Reading your menu..." (0–15s)
2. "Matching services to protocols..." (15–45s)
3. "Identifying growth opportunities..." (45–90s)
4. "Building your opening order..." (90–150s)
5. "Finalizing your plan..." (150s+)

##### Timeout Handling

If `plans.status` remains `processing` for more than 3 minutes without transitioning to `ready` or `failed`, a scheduled job (Supabase pg_cron or Edge Function cron) must set `status = 'failed'` and write `processing_error = 'Timeout: analysis exceeded 3 minutes'`.

```sql
-- pg_cron job: timeout stuck processing plans
SELECT cron.schedule(
  'timeout-stuck-plans',
  '* * * * *',  -- every minute
  $$
    UPDATE plans
    SET status = 'failed',
        processing_error = 'Timeout: analysis exceeded 180 seconds'
    WHERE status = 'processing'
      AND processing_started_at < now() - interval '3 minutes';
  $$
);
```

---

### E3. Edge Function Inventory

#### Known Existing Edge Functions

| Function Name | Purpose | Trigger |
|---|---|---|
| `ai-concierge` | Handles AI concierge chat requests; calls LLM API with plan context | HTTP POST from frontend |
| `generate-embeddings` | Generates pgvector embeddings for new protocols or services | Called on insert/update of canonical_protocols, spa_services |

#### Proposed Additional Edge Functions

| Function Name | Purpose | Input | Output |
|---|---|---|---|
| `generate-activation-kit` | Generates the full activation kit: training guide, protocol cards, shelf talkers | `plan_id`, `brand_id`, `business_id` | PDF assets saved to Supabase Storage; records in `activation_assets` |
| `generate-menu-redesign` | Produces an AI-suggested menu rewrite incorporating new protocols | `plan_id`, `spa_menu_id`, `brand_id` | Markdown/HTML menu content; saved to `activation_assets` with `asset_type = 'menu_redesign'` |
| `generate-training-plan` | Creates a practitioner training schedule for adopted protocols | `plan_id`, `practitioner_ids[]`, `protocol_ids[]` | Training plan document; optionally saved to `activation_assets` |
| `run-plan-analysis` | Orchestrates all engine execution server-side (replaces client-side orchestration) | `plan_id` | Updates `plans.status`; writes to all output tables |
| `process-opening-order` | Converts a generated opening order into a submitted order record | `opening_order_id`, `business_id` | Creates `orders` + `order_items` records |

**Critical architecture note:** The `run-plan-analysis` Edge Function should replace the current client-side `planOrchestrator` execution. Running analysis in an Edge Function eliminates the race condition, provides a reliable execution environment, and allows proper status management. The client simply POSTs to `run-plan-analysis`, sets `plans.status = 'processing'`, navigates to the results page, and subscribes to Realtime updates.

---

## Section F: Commerce Data Model

### F1. Order Lifecycle

```
draft → submitted → confirmed → processing → shipped → delivered → completed
                                                                  ↘ cancelled
                                                                  ↘ refunded
```

| Status | Description | Trigger |
|---|---|---|
| `draft` | Order is being built (opening order generator output, not yet reviewed) | System creates on opening order generation |
| `submitted` | Business user has reviewed and submitted the order | User clicks "Submit Order" |
| `confirmed` | Brand has acknowledged receipt and confirmed availability | Brand admin action or webhook |
| `processing` | Brand is picking and packing the order | Brand admin action |
| `shipped` | Order has shipped; tracking number available | Brand admin updates with tracking info |
| `delivered` | Carrier confirmed delivery | Webhook from shipping carrier OR brand admin |
| `completed` | Business has confirmed receipt; order closed | Business user action or auto-close after 7 days post-delivery |
| `cancelled` | Order cancelled before shipping | Business user or brand admin action |
| `refunded` | Full or partial refund issued post-delivery | Admin action; triggers commission ledger adjustment |

#### Required Fields on `orders`

```sql
-- Confirm or add to orders table:
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','submitted','confirmed','processing',
                      'shipped','delivered','completed','cancelled','refunded')),
  ADD COLUMN IF NOT EXISTS business_id uuid REFERENCES businesses(id),
  ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES brands(id),
  ADD COLUMN IF NOT EXISTS plan_id uuid REFERENCES plans(id),
  ADD COLUMN IF NOT EXISTS order_total numeric(12,2),
  ADD COLUMN IF NOT EXISTS commission_rate numeric(5,4),
  ADD COLUMN IF NOT EXISTS commission_amount numeric(12,2),
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS shipped_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;
```

---

### F2. Commission Model

#### Commission Rate Configuration

Commission rates are configured at the platform level and optionally overridden per brand or per order. Platform default rate is stored in a configuration table or environment variable accessible only to `platform_admin`.

```
per_order_commission = order_total × commission_rate

payout_to_brand      = order_total × (1 - commission_rate)
platform_revenue     = order_total × commission_rate
```

Example:
```
order_total     = $1,250.00
commission_rate = 0.12 (12%)

commission      = $1,250.00 × 0.12 = $150.00
brand_payout    = $1,250.00 × 0.88 = $1,100.00
```

#### Commission Tiers (Proposed)

| Brand Tier | Commission Rate | Notes |
|---|---|---|
| Standard | 12% | Default |
| Growth Partner | 10% | Negotiated for high-volume brands |
| Launch Partner | 8% | Introductory rate for new brand partners |
| Enterprise | Negotiated | Custom rate stored per brand |

#### Commission Ledger Table (Proposed)

```sql
CREATE TABLE commission_ledger (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            uuid NOT NULL REFERENCES orders(id),
  brand_id            uuid NOT NULL REFERENCES brands(id),
  business_id         uuid NOT NULL REFERENCES businesses(id),
  order_total         numeric(12,2) NOT NULL,
  commission_rate     numeric(5,4) NOT NULL,
  commission_amount   numeric(12,2) NOT NULL,
  brand_payout_amount numeric(12,2) NOT NULL,
  payout_status       text NOT NULL DEFAULT 'pending',
                      -- pending | processing | paid | disputed | voided
  payout_date         timestamptz,
  stripe_transfer_id  text,
  notes               text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE commission_ledger ENABLE ROW LEVEL SECURITY;

-- brand_admin: read own brand rows
CREATE POLICY "commission_ledger_brand_read" ON commission_ledger
  FOR SELECT USING (brand_id = my_brand_id() AND is_brand_admin());

-- platform_admin: full access
CREATE POLICY "commission_ledger_admin" ON commission_ledger
  FOR ALL USING (is_admin());
```

A ledger record is created for every order that transitions to `confirmed` status. If an order is `refunded`, a corresponding negative adjustment record is inserted (not an update) to maintain a complete audit trail.

---

### F3. Missing Tables for Commerce

The following tables are required for a production-ready commerce layer and are not present in the current 46-table schema.

#### `order_items`

Line-item granularity per order. Required for commission calculation, fulfillment, partial fulfillment, and order history.

```sql
CREATE TABLE order_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id        uuid,
  product_type      text NOT NULL CHECK (product_type IN ('pro', 'retail')),
  product_name      text NOT NULL,
  sku               text,
  quantity          integer NOT NULL CHECK (quantity > 0),
  unit_wholesale    numeric(10,2) NOT NULL,
  unit_msrp         numeric(10,2),
  line_total        numeric(12,2) GENERATED ALWAYS AS (quantity * unit_wholesale) STORED,
  is_estimated      boolean NOT NULL DEFAULT false,
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_items_select" ON order_items
  FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE business_id = my_business_id())
    OR is_admin()
  );
```

#### `payments`

Tracks payment intents, status, and provider references. Required for Stripe integration.

```sql
CREATE TABLE payments (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id              uuid NOT NULL REFERENCES orders(id),
  business_id           uuid NOT NULL REFERENCES businesses(id),
  amount                numeric(12,2) NOT NULL,
  currency              text NOT NULL DEFAULT 'usd',
  status                text NOT NULL DEFAULT 'pending',
                        -- pending | processing | succeeded | failed | refunded | cancelled
  payment_provider      text NOT NULL DEFAULT 'stripe',
  provider_payment_intent_id text,
  provider_charge_id    text,
  failure_code          text,
  failure_message       text,
  paid_at               timestamptz,
  refunded_at           timestamptz,
  refund_amount         numeric(12,2),
  metadata              jsonb,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_select" ON payments
  FOR SELECT USING (
    business_id = my_business_id()
    OR is_admin()
  );
-- INSERT/UPDATE: service role only (from Edge Function handling Stripe webhooks)
```

#### `shipping_addresses`

Saved delivery addresses per business. Prevents re-entry on every order.

```sql
CREATE TABLE shipping_addresses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  label           text,                    -- e.g., "Main Location", "Back Office"
  recipient_name  text NOT NULL,
  company_name    text,
  address_line1   text NOT NULL,
  address_line2   text,
  city            text NOT NULL,
  state           text NOT NULL,
  postal_code     text NOT NULL,
  country         text NOT NULL DEFAULT 'US',
  phone           text,
  is_default      boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shipping_addresses_business" ON shipping_addresses
  FOR ALL USING (business_id = my_business_id());

-- Enforce single default address per business
CREATE UNIQUE INDEX shipping_addresses_default_idx
  ON shipping_addresses (business_id)
  WHERE is_default = true;
```

#### `commission_ledger`

Per-order commission record. Described in full in Section F2 above. Required for brand payouts, financial reporting, and dispute resolution.

---

*End of document. All SQL is illustrative; column names and types should be validated against the live schema before migration.*
