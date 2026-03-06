-- =============================================================================
-- SOCELLE Affiliate Commerce Schema — Production Migration
-- Stream 0: Premium Affiliate Commerce
-- Migration: 0072_affiliate_commerce_schema
-- Created: March 2026
-- =============================================================================
-- Adds three tables to the socelle.* schema:
--   socelle.affiliate_products    — curated product catalog
--   socelle.affiliate_placements  — surface-to-product assignment
--   socelle.affiliate_clicks      — click tracking and conversion attribution
-- Plus:
--   socelle.affiliate_revenue_summary  — aggregated reporting view
--   Indexes for all primary query patterns
--   RLS policies (public can read active products/placements; admin-only for clicks)
--   updated_at triggers on mutable tables
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 0. Ensure socelle schema exists
-- ---------------------------------------------------------------------------

CREATE SCHEMA IF NOT EXISTS socelle;

-- ---------------------------------------------------------------------------
-- 1. Table: socelle.affiliate_products
-- ---------------------------------------------------------------------------
-- Stores the editorially curated product catalog for affiliate placements.
-- Products are human-reviewed before activation (relevance_score must be >= 0.70).
-- Sentiment auto-removal sets is_active = false when brand avg rating < 3.0 stars.
-- ---------------------------------------------------------------------------

CREATE TABLE socelle.affiliate_products (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Product identity
    name                    TEXT            NOT NULL,
    brand                   TEXT,
    category                TEXT            NOT NULL
                                            CHECK (category IN (
                                                'skincare',
                                                'haircare',
                                                'tools',
                                                'devices',
                                                'nails',
                                                'business',
                                                'supplies',
                                                'wellness'
                                            )),
    subcategory             TEXT,
    description             TEXT            CHECK (char_length(description) <= 500),

    -- Media and commerce
    image_url               TEXT,
    affiliate_url           TEXT            NOT NULL,

    -- Affiliate network details
    affiliate_network       TEXT            NOT NULL
                                            CHECK (affiliate_network IN (
                                                'shareasale',
                                                'impact',
                                                'cj',
                                                'amazon',
                                                'brand_direct'
                                            )),
    affiliate_program_id    TEXT,           -- Network-assigned program identifier for reconciliation
    commission_rate         NUMERIC(4,2),   -- Percentage, e.g. 8.50 = 8.5%
    cookie_duration_days    INT,

    -- Pricing (stored in cents to avoid floating-point errors)
    price_cents             INT             CHECK (price_cents > 0),

    -- Editorial controls
    is_active               BOOLEAN         NOT NULL DEFAULT true,
    relevance_score         NUMERIC(3,2)    CHECK (
                                                relevance_score IS NULL
                                                OR (relevance_score >= 0.00 AND relevance_score <= 1.00)
                                            ),
    -- Products with relevance_score < 0.70 are never returned by placement queries.
    -- NULL = not yet reviewed; treated as inactive by placement renderer.

    deactivation_reason     TEXT            CHECK (deactivation_reason IN (
                                                'low_relevance',
                                                'sentiment_flag',
                                                'discontinued',
                                                'manual'
                                            )),

    -- Maintenance
    last_price_check        TIMESTAMPTZ,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE socelle.affiliate_products IS
    'Editorially curated affiliate product catalog. All products require human '
    'review (relevance_score >= 0.70) before placement. Sentiment auto-removal '
    'job deactivates products when brand avg rating < 3.0 stars.';

COMMENT ON COLUMN socelle.affiliate_products.relevance_score IS
    '0.00–1.00. Products with score < 0.70 are excluded from all placement queries. '
    'Score must be set by a human editor — never algorithmically assigned.';

COMMENT ON COLUMN socelle.affiliate_products.price_cents IS
    'Current listed price in USD cents. Updated weekly by socelle-affiliate-price-check job. '
    'Price changes > 15% trigger admin review flag.';

COMMENT ON COLUMN socelle.affiliate_products.deactivation_reason IS
    'Required when is_active is set to false. low_relevance: editor judgment. '
    'sentiment_flag: brand avg rating crossed 3.0 threshold. '
    'discontinued: product no longer available. manual: other editorial decision.';

-- ---------------------------------------------------------------------------
-- 2. Table: socelle.affiliate_placements
-- ---------------------------------------------------------------------------
-- Assigns affiliate products to placement surfaces.
-- surface_entity_id = NULL means "global for this surface type" (all articles,
-- all events, etc.). Non-NULL scopes the placement to a specific entity ID.
-- The placement renderer enforces a maximum of 2 active placements per page.
-- ---------------------------------------------------------------------------

CREATE TABLE socelle.affiliate_placements (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),

    affiliate_product_id    UUID            NOT NULL
                                            REFERENCES socelle.affiliate_products(id)
                                            ON DELETE CASCADE,

    surface_type            TEXT            NOT NULL
                                            CHECK (surface_type IN (
                                                'feed',         -- News feed article pages
                                                'brand_page',   -- Public brand profile pages
                                                'event',        -- Event detail pages
                                                'education',    -- Education content pages
                                                'benchmark',    -- Benchmarking data pages
                                                'quiz_result',  -- Quiz result pages
                                                'email'         -- Daily briefing email
                                            )),

    surface_entity_id       UUID,
    -- NULL = global placement for this surface_type (applies to all entities).
    -- Non-NULL = placement scoped to specific entity (specific article, brand, event).
    -- References entity in the appropriate table (articles, brands, events) — not FK-constrained
    -- here because it spans multiple source tables. Application layer enforces referential validity.

    position                INT             NOT NULL DEFAULT 1
                                            CHECK (position IN (1, 2)),
    -- 1 = first affiliate block on the page; 2 = second affiliate block.
    -- Maximum 2 per page enforced by AffiliatePlacementRenderer component.

    is_active               BOOLEAN         NOT NULL DEFAULT true,
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deactivated_at          TIMESTAMPTZ     -- Set when is_active transitions to false
);

COMMENT ON TABLE socelle.affiliate_placements IS
    'Assigns affiliate products to content surfaces. surface_entity_id = NULL means '
    'global placement for that surface type. Maximum 2 active placements per page '
    'enforced by the AffiliatePlacementRenderer component (not only at data layer).';

COMMENT ON COLUMN socelle.affiliate_placements.surface_entity_id IS
    'UUID of the specific entity (article, brand, event) this placement is scoped to. '
    'NULL means this placement applies globally to all entities of this surface_type.';

COMMENT ON COLUMN socelle.affiliate_placements.position IS
    'Display position within the page (1 or 2). Enforces page cap of 2 placements.';

-- ---------------------------------------------------------------------------
-- 3. Table: socelle.affiliate_clicks
-- ---------------------------------------------------------------------------
-- Records every click on an affiliate link. Supports both authenticated (user_id)
-- and anonymous (session_id only) click tracking. Conversion attribution is
-- recorded when the affiliate network reports a conversion.
-- RLS: public INSERT only; SELECT restricted to service_role (admin analytics).
-- ---------------------------------------------------------------------------

CREATE TABLE socelle.affiliate_clicks (
    id                          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),

    placement_id                UUID            NOT NULL
                                                REFERENCES socelle.affiliate_placements(id)
                                                ON DELETE RESTRICT,
    -- ON DELETE RESTRICT: never delete placements that have click history.
    -- Deactivate placements instead (is_active = false).

    -- User identification (dual-track: authenticated + anonymous)
    user_id                     UUID
                                                REFERENCES auth.users(id)
                                                ON DELETE SET NULL,
    -- NULL for anonymous users. ON DELETE SET NULL preserves click record when
    -- a user account is deleted (anonymized attribution).

    session_id                  TEXT            NOT NULL,
    -- Required for all clicks (authenticated and anonymous). Enables
    -- session-level deduplication and anonymous conversion attribution.

    -- Click metadata
    clicked_at                  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    referrer_url                TEXT,

    -- Conversion tracking (updated by affiliate network webhook or manual import)
    converted                   BOOLEAN         NOT NULL DEFAULT false,
    conversion_reported_at      TIMESTAMPTZ,   -- When network confirmed the conversion
    conversion_value_cents      INT,           -- Order value reported by network
    commission_earned_cents     INT            -- Commission amount earned on this conversion
);

COMMENT ON TABLE socelle.affiliate_clicks IS
    'Click and conversion tracking for all affiliate placements. Public INSERT for '
    'real-time click recording. SELECT restricted to service_role — affiliate revenue '
    'data is never exposed to brand intelligence clients (revenue firewall).';

COMMENT ON COLUMN socelle.affiliate_clicks.session_id IS
    'Required for all clicks. For authenticated users, session_id supplements user_id '
    'for deduplication. For anonymous users, session_id is the sole tracking identifier.';

COMMENT ON COLUMN socelle.affiliate_clicks.commission_earned_cents IS
    'Populated via affiliate network webhook or weekly manual CSV import from network dashboard. '
    'Not available in real time — networks report conversions with 1–30 day delay.';

-- ---------------------------------------------------------------------------
-- 4. Indexes
-- ---------------------------------------------------------------------------

-- affiliate_products indexes

-- Primary query: fetch active products by category for placement rendering
CREATE INDEX idx_aff_products_active_category
    ON socelle.affiliate_products (category, relevance_score DESC)
    WHERE is_active = true AND relevance_score >= 0.70;

-- Secondary query: admin reporting by network
CREATE INDEX idx_aff_products_network
    ON socelle.affiliate_products (affiliate_network, is_active);

-- Sentiment check job: query by brand name
CREATE INDEX idx_aff_products_brand
    ON socelle.affiliate_products (brand);

-- Price check job: find products due for price verification
CREATE INDEX idx_aff_products_price_check
    ON socelle.affiliate_products (last_price_check ASC NULLS FIRST)
    WHERE is_active = true;

-- affiliate_placements indexes

-- Primary query: fetch active placements by surface type (global placements)
CREATE INDEX idx_aff_placements_surface_global
    ON socelle.affiliate_placements (surface_type, position)
    WHERE is_active = true AND surface_entity_id IS NULL;

-- Primary query: fetch active placements by surface type + specific entity
CREATE INDEX idx_aff_placements_surface_entity
    ON socelle.affiliate_placements (surface_type, surface_entity_id, position)
    WHERE is_active = true AND surface_entity_id IS NOT NULL;

-- Cascade deactivation: find placements when a product is deactivated
CREATE INDEX idx_aff_placements_product
    ON socelle.affiliate_placements (affiliate_product_id);

-- affiliate_clicks indexes

-- Primary query: reporting clicks by placement over time
CREATE INDEX idx_aff_clicks_placement_date
    ON socelle.affiliate_clicks (placement_id, clicked_at DESC);

-- Analytics query: conversion reporting
CREATE INDEX idx_aff_clicks_converted_date
    ON socelle.affiliate_clicks (converted, conversion_reported_at)
    WHERE converted = true;

-- Session-level deduplication
CREATE INDEX idx_aff_clicks_session
    ON socelle.affiliate_clicks (session_id, clicked_at DESC);

-- User-level analytics (partial index — only where user_id is set)
CREATE INDEX idx_aff_clicks_user
    ON socelle.affiliate_clicks (user_id, clicked_at DESC)
    WHERE user_id IS NOT NULL;

-- Revenue summary view: aggregation by month/network/category
CREATE INDEX idx_aff_clicks_month
    ON socelle.affiliate_clicks (DATE_TRUNC('month', clicked_at));

-- ---------------------------------------------------------------------------
-- 5. Revenue Summary View
-- ---------------------------------------------------------------------------
-- Aggregates clicks, conversions, and commission by network, category, and month.
-- Used by the admin affiliate reporting dashboard.
-- Accessible only to service_role (not exposed via public API).
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW socelle.affiliate_revenue_summary AS
SELECT
    ap.affiliate_network                                                AS network,
    ap.category                                                         AS category,
    DATE_TRUNC('month', ac.clicked_at)::DATE                           AS month,

    -- Volume metrics
    COUNT(ac.id)                                                        AS total_clicks,
    COUNT(DISTINCT ac.session_id)                                       AS unique_sessions,
    COUNT(DISTINCT ac.user_id) FILTER (WHERE ac.user_id IS NOT NULL)   AS authenticated_users,

    -- Conversion metrics
    COUNT(ac.id) FILTER (WHERE ac.converted = true)                    AS total_conversions,
    ROUND(
        COUNT(ac.id) FILTER (WHERE ac.converted = true)::NUMERIC
        / NULLIF(COUNT(ac.id), 0) * 100,
        2
    )                                                                   AS conversion_rate_pct,

    -- Revenue metrics (all in cents)
    COALESCE(SUM(ac.conversion_value_cents), 0)                        AS total_gmv_cents,
    COALESCE(SUM(ac.commission_earned_cents), 0)                       AS total_commission_cents,
    ROUND(
        COALESCE(SUM(ac.commission_earned_cents), 0)::NUMERIC
        / NULLIF(COUNT(ac.id), 0),
        2
    )                                                                   AS commission_per_click_cents,

    -- Catalog metrics
    COUNT(DISTINCT apl.id)                                             AS active_placements,
    COUNT(DISTINCT ap.id)                                              AS products_with_clicks

FROM socelle.affiliate_clicks ac
JOIN socelle.affiliate_placements apl
    ON ac.placement_id = apl.id
JOIN socelle.affiliate_products ap
    ON apl.affiliate_product_id = ap.id

GROUP BY
    ap.affiliate_network,
    ap.category,
    DATE_TRUNC('month', ac.clicked_at)::DATE

ORDER BY
    month DESC,
    total_commission_cents DESC;

COMMENT ON VIEW socelle.affiliate_revenue_summary IS
    'Aggregated affiliate performance by network, category, and month. '
    'Admin analytics only — never exposed to brand intelligence clients.';

-- ---------------------------------------------------------------------------
-- 6. Row Level Security
-- ---------------------------------------------------------------------------

-- Enable RLS
ALTER TABLE socelle.affiliate_products  ENABLE ROW LEVEL SECURITY;
ALTER TABLE socelle.affiliate_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE socelle.affiliate_clicks    ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- affiliate_products RLS
-- ---------------------------------------------------------------------------

-- Public SELECT: active products only (for placement rendering on public pages)
CREATE POLICY aff_products_select_active
    ON socelle.affiliate_products
    FOR SELECT
    USING (is_active = true);

-- Service role: full access for admin operations (add, edit, deactivate)
CREATE POLICY aff_products_insert_service
    ON socelle.affiliate_products
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY aff_products_update_service
    ON socelle.affiliate_products
    FOR UPDATE
    USING (auth.role() = 'service_role');

CREATE POLICY aff_products_delete_service
    ON socelle.affiliate_products
    FOR DELETE
    USING (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- affiliate_placements RLS
-- ---------------------------------------------------------------------------

-- Public SELECT: active placements only (for rendering affiliate blocks)
CREATE POLICY aff_placements_select_active
    ON socelle.affiliate_placements
    FOR SELECT
    USING (is_active = true);

-- Service role: full access for placement management
CREATE POLICY aff_placements_insert_service
    ON socelle.affiliate_placements
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY aff_placements_update_service
    ON socelle.affiliate_placements
    FOR UPDATE
    USING (auth.role() = 'service_role');

CREATE POLICY aff_placements_delete_service
    ON socelle.affiliate_placements
    FOR DELETE
    USING (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- affiliate_clicks RLS
-- ---------------------------------------------------------------------------
-- Revenue firewall: clicks are INSERT-only from the public layer.
-- SELECT is restricted to service_role (internal analytics).
-- No brand-facing API endpoint may ever query this table.

-- Any user (authenticated or anonymous) can INSERT a click record
CREATE POLICY aff_clicks_insert_public
    ON socelle.affiliate_clicks
    FOR INSERT
    WITH CHECK (true);

-- Only internal analytics (service_role) can read click data
CREATE POLICY aff_clicks_select_admin
    ON socelle.affiliate_clicks
    FOR SELECT
    USING (auth.role() = 'service_role');

-- Service role UPDATE for conversion attribution (webhook updates converted = true)
CREATE POLICY aff_clicks_update_service
    ON socelle.affiliate_clicks
    FOR UPDATE
    USING (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- 7. updated_at Triggers
-- ---------------------------------------------------------------------------
-- Automatically maintain updated_at timestamps on mutable tables.
-- Uses a shared trigger function if one exists in the database,
-- or creates a local one if not.

CREATE OR REPLACE FUNCTION socelle.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION socelle.set_updated_at() IS
    'Trigger function: sets updated_at to NOW() on every UPDATE.';

-- Trigger on affiliate_products (has updated_at column)
CREATE TRIGGER trg_aff_products_updated_at
    BEFORE UPDATE ON socelle.affiliate_products
    FOR EACH ROW
    EXECUTE FUNCTION socelle.set_updated_at();

-- Note: affiliate_placements uses deactivated_at (set in application layer when
-- is_active is set to false) rather than a generic updated_at column.
-- affiliate_clicks is append-only; no updated_at needed.

-- ---------------------------------------------------------------------------
-- 8. Sentiment Auto-Removal Job Helper Function
-- ---------------------------------------------------------------------------
-- Called nightly by the socelle-check-affiliate-sentiment pg-boss job.
-- Deactivates affiliate products whose brand has fallen below 3.0 stars
-- in the socelle.brand_reviews table.
-- Returns: number of products deactivated.

CREATE OR REPLACE FUNCTION socelle.deactivate_low_sentiment_affiliate_products()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deactivated_count INT := 0;
BEGIN
    -- Join chain:
    --   brand_reviews.brand_id (UUID FK) → socelle.brands.id (UUID)
    --   socelle.brands.name    (TEXT)    → affiliate_products.brand (TEXT)
    -- This is necessary because brand_reviews stores brand_id (UUID), not a text brand name.
    -- affiliate_products.brand stores a TEXT brand name matched against socelle.brands.name.
    WITH flagged_brands AS (
        SELECT b.name AS brand_name, AVG(br.rating) AS avg_rating
        FROM socelle.brand_reviews br
        JOIN socelle.brands b ON b.id = br.brand_id
        GROUP BY b.name
        HAVING AVG(br.rating) < 3.0
    ),
    deactivated AS (
        UPDATE socelle.affiliate_products ap
        SET
            is_active           = false,
            deactivation_reason = 'sentiment_flag',
            updated_at          = NOW()
        FROM flagged_brands fb
        WHERE ap.brand = fb.brand_name
          AND ap.is_active = true
        RETURNING ap.id
    )
    SELECT COUNT(*) INTO v_deactivated_count FROM deactivated;

    -- Also cascade to placements: deactivate placements for newly deactivated products
    UPDATE socelle.affiliate_placements apl
    SET
        is_active      = false,
        deactivated_at = NOW()
    WHERE apl.is_active = true
      AND NOT EXISTS (
          SELECT 1
          FROM socelle.affiliate_products ap
          WHERE ap.id = apl.affiliate_product_id
            AND ap.is_active = true
      );

    RETURN v_deactivated_count;
END;
$$;

COMMENT ON FUNCTION socelle.deactivate_low_sentiment_affiliate_products() IS
    'Nightly sentiment check: deactivates affiliate products where the brand has '
    'avg operator rating < 3.0 stars in brand_reviews. Also cascades to deactivate '
    'all active placements for those products. Returns count of products deactivated.';

-- ---------------------------------------------------------------------------
-- 9. Warning Threshold Function
-- ---------------------------------------------------------------------------
-- Returns brands with avg rating between 3.0 and 3.5 stars (warning zone)
-- that still have active affiliate products. Used by admin dashboard alert panel.

CREATE OR REPLACE FUNCTION socelle.get_affiliate_sentiment_warnings()
RETURNS TABLE (
    brand           TEXT,
    avg_rating      NUMERIC,
    review_count    BIGINT,
    active_products BIGINT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    -- Join chain:
    --   brand_reviews.brand_id (UUID FK) → socelle.brands.id (UUID)
    --   socelle.brands.name    (TEXT)    → affiliate_products.brand (TEXT)
    SELECT
        b.name                          AS brand,
        ROUND(AVG(br.rating), 2)        AS avg_rating,
        COUNT(br.id)                    AS review_count,
        COUNT(ap.id)                    AS active_products
    FROM socelle.brand_reviews br
    JOIN socelle.brands b ON b.id = br.brand_id
    JOIN socelle.affiliate_products ap
        ON ap.brand = b.name AND ap.is_active = true
    GROUP BY b.name
    HAVING AVG(br.rating) >= 3.0 AND AVG(br.rating) < 3.5
    ORDER BY AVG(br.rating) ASC;
$$;

COMMENT ON FUNCTION socelle.get_affiliate_sentiment_warnings() IS
    'Returns brands in the warning zone (3.0–3.5 avg rating) that still have '
    'active affiliate products. Used by admin dashboard flagged products panel.';

-- ---------------------------------------------------------------------------
-- 10. Placement Count Guard Function
-- ---------------------------------------------------------------------------
-- Validates that adding a placement does not exceed 2 per page.
-- Called by application layer before inserting a new placement record.
-- Returns true if adding is safe, false if page cap would be exceeded.

CREATE OR REPLACE FUNCTION socelle.can_add_placement(
    p_surface_type      TEXT,
    p_surface_entity_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT COUNT(*) < 2
    FROM socelle.affiliate_placements
    WHERE surface_type      = p_surface_type
      AND (
              (p_surface_entity_id IS NULL AND surface_entity_id IS NULL)
          OR  (surface_entity_id = p_surface_entity_id)
      )
      AND is_active = true;
$$;

COMMENT ON FUNCTION socelle.can_add_placement(TEXT, UUID) IS
    'Returns true if a new placement can be added for this surface/entity without '
    'exceeding the 2-placement-per-page cap. Call before INSERT on affiliate_placements.';

-- ---------------------------------------------------------------------------
-- 11. Sample Data — Verification (Optional, comment out for production)
-- ---------------------------------------------------------------------------
-- Uncomment to insert 3 test products for schema validation only.
-- Remove before deploying to production.

/*
INSERT INTO socelle.affiliate_products (
    name, brand, category, subcategory, description,
    affiliate_url, affiliate_network, commission_rate, cookie_duration_days,
    price_cents, is_active, relevance_score
) VALUES
(
    'C E Ferulic',
    'SkinCeuticals',
    'skincare',
    'antioxidant serum',
    'Professional-grade antioxidant serum trusted by medspa operators for post-treatment skin optimization.',
    'https://shareasale.com/r.cfm?b=XXXX&u=XXXX&m=XXXX&urllink=&afftrack=',
    'impact',
    10.00,
    30,
    18200,   -- $182.00
    false,   -- requires editor review and relevance_score before activation
    0.97
),
(
    'Daily Microfoliant',
    'Dermalogica',
    'skincare',
    'exfoliant',
    'Enzyme-based exfoliant used by licensed estheticians across spa and medspa settings.',
    'https://shareasale.com/r.cfm?b=XXXX&u=XXXX&m=XXXX&urllink=&afftrack=',
    'shareasale',
    8.50,
    30,
    6900,    -- $69.00
    false,
    0.93
),
(
    'GlossGenius All-in-One Platform',
    'GlossGenius',
    'business',
    'booking and POS software',
    'Most-adopted booking and point-of-sale platform among solo estheticians in the SOCELLE network.',
    'https://glossgenius.com/?ref=socelle',
    'brand_direct',
    15.00,
    60,
    2400,    -- $24.00/month (shown as first month price)
    false,
    0.91
);
*/

-- ---------------------------------------------------------------------------
-- End of Migration
-- ---------------------------------------------------------------------------

COMMIT;

-- Post-migration verification queries (run manually after COMMIT to confirm):
--
-- SELECT COUNT(*) FROM socelle.affiliate_products;
-- SELECT COUNT(*) FROM socelle.affiliate_placements;
-- SELECT COUNT(*) FROM socelle.affiliate_clicks;
-- SELECT * FROM pg_indexes WHERE tablename LIKE 'affiliate_%' AND schemaname = 'socelle';
-- SELECT table_name, row_security FROM information_schema.tables
--   WHERE table_schema = 'socelle' AND table_name LIKE 'affiliate_%';
-- SELECT schemaname, viewname FROM pg_views WHERE schemaname = 'socelle';
-- SELECT proname FROM pg_proc JOIN pg_namespace ON pg_namespace.oid = pg_proc.pronamespace
--   WHERE nspname = 'socelle' AND proname LIKE '%affiliate%';
