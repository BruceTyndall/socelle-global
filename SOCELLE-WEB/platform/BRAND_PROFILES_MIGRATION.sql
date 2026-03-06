-- =============================================================================
-- SOCELLE — Brand Profiles Feature Migration
-- File: BRAND_PROFILES_MIGRATION.sql
-- Schema: socelle.*
-- Author: Agent 2 — Public Brand Profile Agent
-- Date: March 2026
-- Description:
--   Creates the complete database schema for public brand intelligence pages,
--   brand claim subscriptions, brand-posted content, operator reviews,
--   and per-page analytics tracking.
--   Extends the existing socelle.brands table with profile and monetization data.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Set search path
-- ---------------------------------------------------------------------------
SET search_path TO socelle, public;


-- ---------------------------------------------------------------------------
-- TABLE 1: brand_profiles
-- Stores the assembled brand profile data — both auto-generated fields and
-- brand-controlled fields (populated after claim). One row per brand.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS socelle.brand_profiles (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id              UUID NOT NULL REFERENCES socelle.brands(id)
                              ON DELETE CASCADE ON UPDATE CASCADE,
    slug                  TEXT NOT NULL UNIQUE,

    -- Auto-generated content fields (populated by pipeline)
    auto_description      TEXT,

    -- Claim status
    claimed               BOOLEAN NOT NULL DEFAULT false,
    claimed_by            UUID REFERENCES socelle.user_profiles(id)
                              ON DELETE SET NULL ON UPDATE CASCADE,
    claimed_at            TIMESTAMPTZ,

    -- Brand-controlled content (available after claim)
    official_description  TEXT,
    logo_url              TEXT,
    hero_image_url        TEXT,

    -- Brand classification (auto-populated, brand can confirm)
    category              TEXT NOT NULL
                              CHECK (category IN (
                                  'skincare',
                                  'haircare',
                                  'devices',
                                  'injectables',
                                  'tools',
                                  'nail',
                                  'color',
                                  'wellness'
                              )),
    tier                  TEXT NOT NULL
                              CHECK (tier IN (
                                  'luxury',
                                  'prestige',
                                  'professional',
                                  'mass'
                              )),

    -- Brand metadata (auto-populated from pipeline)
    parent_company        TEXT,
    founded_year          INT
                              CHECK (founded_year IS NULL OR (founded_year >= 1800 AND founded_year <= EXTRACT(YEAR FROM CURRENT_DATE)::INT + 1)),
    headquarters          TEXT,
    website_url           TEXT,
    social_urls           JSONB,
    -- Expected social_urls shape:
    -- {
    --   "instagram": "https://instagram.com/brandname",
    --   "facebook":  "https://facebook.com/brandname",
    --   "tiktok":    "https://tiktok.com/@brandname",
    --   "linkedin":  "https://linkedin.com/company/brandname",
    --   "youtube":   "https://youtube.com/@brandname"
    -- }

    -- Pipeline refresh tracking
    last_auto_refresh     TIMESTAMPTZ,
    last_manual_edit      TIMESTAMPTZ,

    -- Flexible metadata for pipeline fields not yet formalized
    metadata              JSONB,
    -- Suggested metadata shape:
    -- {
    --   "adoption_data": { ... },
    --   "trend_signals": { ... },
    --   "education_items": [ ... ],
    --   "product_catalog_summary": { ... },
    --   "pipeline_source_versions": { ... }
    -- }

    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Enforce one profile record per brand
    CONSTRAINT uq_brand_profiles_brand_id UNIQUE (brand_id)
);

COMMENT ON TABLE socelle.brand_profiles IS
    'Auto-generated and brand-managed public profile data for each beauty brand. '
    'One row per brand. Unclaimed rows are auto-generated from pipeline data. '
    'Claimed rows have official brand content in addition to auto-generated sections.';

COMMENT ON COLUMN socelle.brand_profiles.slug IS
    'URL-safe kebab-case identifier, e.g. "zo-skin-health". Used in /brands/[slug] routes. Must be globally unique.';
COMMENT ON COLUMN socelle.brand_profiles.auto_description IS
    'Pipeline-generated brand description. Replaced in public display by official_description when the brand is claimed.';
COMMENT ON COLUMN socelle.brand_profiles.metadata IS
    'JSONB bag for pipeline-derived data not yet promoted to dedicated columns: adoption maps, trend snapshots, etc.';


-- ---------------------------------------------------------------------------
-- TABLE 2: brand_claims
-- Tracks the brand claim process and subscription status. A brand may have
-- multiple claim records over time (initial claim, upgrades, renewals).
-- The most recent approved record with a valid subscription is authoritative.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS socelle.brand_claims (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id                UUID NOT NULL REFERENCES socelle.brands(id)
                                ON DELETE CASCADE ON UPDATE CASCADE,
    claimant_user_id        UUID NOT NULL REFERENCES socelle.user_profiles(id)
                                ON DELETE RESTRICT ON UPDATE CASCADE,

    -- Claim workflow status
    claim_status            TEXT NOT NULL DEFAULT 'pending'
                                CHECK (claim_status IN (
                                    'pending',
                                    'approved',
                                    'rejected',
                                    'revoked'
                                )),

    -- Subscription tier (set on approval)
    plan_tier               TEXT
                                CHECK (plan_tier IS NULL OR plan_tier IN (
                                    'basic',
                                    'pro',
                                    'enterprise'
                                )),

    -- Stripe integration
    stripe_subscription_id  TEXT,
    monthly_price_cents     INT
                                CHECK (monthly_price_cents IS NULL OR monthly_price_cents IN (
                                    19900,   -- basic    $199/mo
                                    49900,   -- pro      $499/mo
                                    99900    -- enterprise $999/mo
                                )),

    -- Claimant company information
    company_name            TEXT NOT NULL,
    company_role            TEXT NOT NULL,
    -- e.g. "VP Marketing", "Founder", "Brand Manager", "Authorized Distributor"

    -- Proof of authority (URL to supporting document or description)
    proof_of_authority      TEXT,
    -- e.g. link to LinkedIn profile, company email domain verification,
    --       uploaded letter of authorization, or verbal description of authority

    -- Timestamps
    claimed_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at             TIMESTAMPTZ,
    approved_by             UUID REFERENCES socelle.user_profiles(id)
                                ON DELETE SET NULL,
    -- ^^ SOCELLE admin user who approved the claim

    -- Rejection tracking
    rejected_reason         TEXT,

    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE socelle.brand_claims IS
    'Brand claim applications and subscription records. Each row represents one claim '
    'attempt. Approved claims with active Stripe subscriptions grant brand portal access. '
    'Tier determines feature access per the SOCELLE_BRAND_PROFILES_SPEC.md tier table.';

COMMENT ON COLUMN socelle.brand_claims.monthly_price_cents IS
    'Constrained to valid tier prices: 19900 (basic $199), 49900 (pro $499), 99900 (enterprise $999). '
    'Must match the plan_tier selection.';
COMMENT ON COLUMN socelle.brand_claims.proof_of_authority IS
    'Free-form text or URL demonstrating the claimant has authority to represent the brand. '
    'Reviewed by SOCELLE admin before approval.';


-- ---------------------------------------------------------------------------
-- TABLE 3: brand_posts
-- Brand-posted content: news updates, product launches, education items,
-- and general updates. Available to Pro and Enterprise tiers.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS socelle.brand_posts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id        UUID NOT NULL REFERENCES socelle.brands(id)
                        ON DELETE CASCADE ON UPDATE CASCADE,
    author_user_id  UUID NOT NULL REFERENCES socelle.user_profiles(id)
                        ON DELETE RESTRICT ON UPDATE CASCADE,

    -- Post content
    title           TEXT NOT NULL
                        CHECK (LENGTH(TRIM(title)) >= 3 AND LENGTH(title) <= 300),
    body            TEXT NOT NULL
                        CHECK (LENGTH(TRIM(body)) >= 10),
    image_url       TEXT,

    -- Post classification
    post_type       TEXT NOT NULL DEFAULT 'news'
                        CHECK (post_type IN (
                            'news',
                            'launch',
                            'education',
                            'update'
                        )),

    -- Feature flag (shows in hero position on brand profile page)
    is_featured     BOOLEAN NOT NULL DEFAULT false,

    -- Publishing control
    published_at    TIMESTAMPTZ,
    -- NULL = draft; non-null = published (can be future-dated for scheduling)

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE socelle.brand_posts IS
    'Brand-authored content posts. Available to Pro ($499/mo) and Enterprise ($999/mo) tiers. '
    'Post types: news (announcements), launch (new products), education (training content), '
    'update (formulation changes, availability updates). published_at NULL = draft.';

COMMENT ON COLUMN socelle.brand_posts.is_featured IS
    'When true, this post is shown in the featured/hero position on the brand profile page. '
    'Only one post should be featured at a time per brand — enforced at application layer.';
COMMENT ON COLUMN socelle.brand_posts.published_at IS
    'Publish timestamp. NULL indicates a draft. Future timestamps enable scheduled publishing. '
    'Posts with published_at > NOW() are not shown publicly until the scheduled time.';


-- ---------------------------------------------------------------------------
-- TABLE 4: brand_reviews
-- Operator reviews of brands. One review per user per brand (enforced by
-- unique constraint). Reviews from verified SOCELLE accounts carry a
-- verified_purchase flag when purchase history confirms brand use.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS socelle.brand_reviews (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id            UUID NOT NULL REFERENCES socelle.brands(id)
                            ON DELETE CASCADE ON UPDATE CASCADE,
    user_id             UUID NOT NULL REFERENCES socelle.user_profiles(id)
                            ON DELETE CASCADE ON UPDATE CASCADE,

    -- Overall rating (1.0 to 5.0, supports half-star increments)
    rating              NUMERIC(2, 1) NOT NULL
                            CHECK (rating >= 1.0 AND rating <= 5.0),

    -- Review text body
    review_text         TEXT
                            CHECK (review_text IS NULL OR LENGTH(TRIM(review_text)) >= 20),

    -- Aspect-level scores stored as JSONB for flexibility
    -- All aspect values are 0–5 NUMERIC; 0 means "not rated" (not "zero stars")
    aspects             JSONB,
    -- Expected aspects shape:
    -- {
    --   "efficacy":  4.5,   -- Product performance/results
    --   "value":     3.0,   -- Price/value ratio for professional use
    --   "support":   4.0,   -- Brand rep, customer service, responsiveness
    --   "training":  3.5    -- Quality of education, training programs, resources
    -- }

    -- Trust signals
    verified_purchase   BOOLEAN NOT NULL DEFAULT false,
    -- Set to true when the reviewer's order history confirms purchase of this brand

    -- Helpfulness voting (community moderation)
    helpful_count       INT NOT NULL DEFAULT 0
                            CHECK (helpful_count >= 0),

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- One review per user per brand — enforced at database level
    CONSTRAINT uq_brand_reviews_brand_user UNIQUE (brand_id, user_id)
);

COMMENT ON TABLE socelle.brand_reviews IS
    'Operator reviews of beauty brands. Limited to one review per user per brand. '
    'Rating is the overall 1–5 score (half-star increments supported). '
    'aspects JSONB holds aspect-level scores for efficacy/value/support/training (0–5 each). '
    'verified_purchase is set by the system when order history confirms brand purchase.';

COMMENT ON COLUMN socelle.brand_reviews.aspects IS
    'JSONB object with aspect scores. Valid keys: efficacy, value, support, training. '
    'Values are NUMERIC 0.0–5.0. A value of 0 means the aspect was not rated by this reviewer. '
    'Example: {"efficacy": 4.5, "value": 3.0, "support": 4.0, "training": 3.5}';
COMMENT ON COLUMN socelle.brand_reviews.verified_purchase IS
    'True when SOCELLE order history confirms the reviewer has purchased this brand. '
    'Set automatically by the purchase verification job, never by user input.';


-- ---------------------------------------------------------------------------
-- TABLE 5: brand_page_analytics
-- Daily rollup of brand profile page analytics. One row per brand per date.
-- Incremental counters updated throughout the day; session-derived metrics
-- (avg_time_on_page, top_referrer) computed by daily pg-boss job at 02:00 UTC.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS socelle.brand_page_analytics (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id                    UUID NOT NULL REFERENCES socelle.brands(id)
                                    ON DELETE CASCADE ON UPDATE CASCADE,
    date                        DATE NOT NULL,

    -- Volume metrics (incremented in real time)
    views                       INT NOT NULL DEFAULT 0
                                    CHECK (views >= 0),
    unique_visitors             INT NOT NULL DEFAULT 0
                                    CHECK (unique_visitors >= 0),

    -- Conversion metrics
    claim_cta_clicks            INT NOT NULL DEFAULT 0
                                    CHECK (claim_cta_clicks >= 0),
    affiliate_clicks            INT NOT NULL DEFAULT 0
                                    CHECK (affiliate_clicks >= 0),
    review_submissions          INT NOT NULL DEFAULT 0
                                    CHECK (review_submissions >= 0),

    -- Engagement metrics (computed by daily job)
    avg_time_on_page_seconds    INT
                                    CHECK (avg_time_on_page_seconds IS NULL OR avg_time_on_page_seconds >= 0),

    -- Top traffic source for the day (computed by daily job)
    top_referrer                TEXT,
    -- e.g. "google.com", "direct", "instagram.com", "socelle.com/insights"

    -- One analytics row per brand per calendar day
    CONSTRAINT uq_brand_page_analytics_brand_date UNIQUE (brand_id, date)
);

COMMENT ON TABLE socelle.brand_page_analytics IS
    'Daily rollup of brand profile page metrics. One row per brand per date. '
    'Counters (views, unique_visitors, claim_cta_clicks, affiliate_clicks, review_submissions) '
    'are incremented in real time via database operations. '
    'avg_time_on_page_seconds and top_referrer are computed by the nightly pg-boss job at 02:00 UTC.';

COMMENT ON COLUMN socelle.brand_page_analytics.unique_visitors IS
    'Count of distinct session_ids for this brand page on this date. '
    'Computed hourly by pg-boss from the event log — not incremented in real time.';
COMMENT ON COLUMN socelle.brand_page_analytics.top_referrer IS
    'The single highest-volume referring domain for this brand page on this date. '
    'e.g. "google.com", "direct", "instagram.com". Computed by daily aggregation job.';


-- =============================================================================
-- INDEXES
-- =============================================================================

-- brand_profiles indexes
CREATE INDEX IF NOT EXISTS idx_brand_profiles_slug
    ON socelle.brand_profiles (slug);

CREATE INDEX IF NOT EXISTS idx_brand_profiles_claimed
    ON socelle.brand_profiles (claimed);

CREATE INDEX IF NOT EXISTS idx_brand_profiles_category
    ON socelle.brand_profiles (category);

CREATE INDEX IF NOT EXISTS idx_brand_profiles_tier
    ON socelle.brand_profiles (tier);

CREATE INDEX IF NOT EXISTS idx_brand_profiles_last_auto_refresh
    ON socelle.brand_profiles (last_auto_refresh);

-- Composite: support queries like "all unclaimed profiles in skincare sorted by freshness"
CREATE INDEX IF NOT EXISTS idx_brand_profiles_category_claimed_refresh
    ON socelle.brand_profiles (category, claimed, last_auto_refresh DESC);

-- Full-text search on brand profile descriptions (for internal search, not public-facing)
CREATE INDEX IF NOT EXISTS idx_brand_profiles_auto_desc_fts
    ON socelle.brand_profiles USING gin (to_tsvector('english', COALESCE(auto_description, '')));


-- brand_claims indexes
CREATE INDEX IF NOT EXISTS idx_brand_claims_brand_id
    ON socelle.brand_claims (brand_id);

CREATE INDEX IF NOT EXISTS idx_brand_claims_claim_status
    ON socelle.brand_claims (claim_status);

CREATE INDEX IF NOT EXISTS idx_brand_claims_claimant_user_id
    ON socelle.brand_claims (claimant_user_id);

-- Composite: look up active approved claims for a brand quickly
CREATE INDEX IF NOT EXISTS idx_brand_claims_brand_status_tier
    ON socelle.brand_claims (brand_id, claim_status, plan_tier);


-- brand_posts indexes
CREATE INDEX IF NOT EXISTS idx_brand_posts_brand_id
    ON socelle.brand_posts (brand_id);

CREATE INDEX IF NOT EXISTS idx_brand_posts_published_at
    ON socelle.brand_posts (published_at DESC)
    WHERE published_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_brand_posts_brand_published
    ON socelle.brand_posts (brand_id, published_at DESC)
    WHERE published_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_brand_posts_post_type
    ON socelle.brand_posts (post_type);

CREATE INDEX IF NOT EXISTS idx_brand_posts_featured
    ON socelle.brand_posts (brand_id, is_featured)
    WHERE is_featured = true;


-- brand_reviews indexes
CREATE INDEX IF NOT EXISTS idx_brand_reviews_brand_id
    ON socelle.brand_reviews (brand_id);

CREATE INDEX IF NOT EXISTS idx_brand_reviews_rating
    ON socelle.brand_reviews (brand_id, rating DESC);

CREATE INDEX IF NOT EXISTS idx_brand_reviews_created_at
    ON socelle.brand_reviews (brand_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_brand_reviews_verified_purchase
    ON socelle.brand_reviews (brand_id, verified_purchase)
    WHERE verified_purchase = true;

-- Support "my reviews" query in user dashboard
CREATE INDEX IF NOT EXISTS idx_brand_reviews_user_id
    ON socelle.brand_reviews (user_id);


-- brand_page_analytics indexes
CREATE INDEX IF NOT EXISTS idx_brand_page_analytics_brand_date
    ON socelle.brand_page_analytics (brand_id, date DESC);

-- Range queries across all brands for a date window (admin reporting)
CREATE INDEX IF NOT EXISTS idx_brand_page_analytics_date
    ON socelle.brand_page_analytics (date DESC);

-- Find top brands by claim CTA conversion on a given date (admin dashboard)
CREATE INDEX IF NOT EXISTS idx_brand_page_analytics_claim_cta
    ON socelle.brand_page_analytics (date DESC, claim_cta_clicks DESC);


-- =============================================================================
-- UPDATED_AT TRIGGERS
-- Keep updated_at columns current automatically on every row modification.
-- =============================================================================

-- Reusable trigger function (create only if it does not already exist)
CREATE OR REPLACE FUNCTION socelle.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- brand_profiles
DROP TRIGGER IF EXISTS trg_brand_profiles_updated_at ON socelle.brand_profiles;
CREATE TRIGGER trg_brand_profiles_updated_at
    BEFORE UPDATE ON socelle.brand_profiles
    FOR EACH ROW EXECUTE FUNCTION socelle.set_updated_at();

-- brand_claims
DROP TRIGGER IF EXISTS trg_brand_claims_updated_at ON socelle.brand_claims;
CREATE TRIGGER trg_brand_claims_updated_at
    BEFORE UPDATE ON socelle.brand_claims
    FOR EACH ROW EXECUTE FUNCTION socelle.set_updated_at();

-- brand_posts
DROP TRIGGER IF EXISTS trg_brand_posts_updated_at ON socelle.brand_posts;
CREATE TRIGGER trg_brand_posts_updated_at
    BEFORE UPDATE ON socelle.brand_posts
    FOR EACH ROW EXECUTE FUNCTION socelle.set_updated_at();

-- brand_reviews
DROP TRIGGER IF EXISTS trg_brand_reviews_updated_at ON socelle.brand_reviews;
CREATE TRIGGER trg_brand_reviews_updated_at
    BEFORE UPDATE ON socelle.brand_reviews
    FOR EACH ROW EXECUTE FUNCTION socelle.set_updated_at();


-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- brand_profiles RLS
-- ---------------------------------------------------------------------------
ALTER TABLE socelle.brand_profiles ENABLE ROW LEVEL SECURITY;

-- Public read: anyone (including anonymous) can read all brand profiles
CREATE POLICY brand_profiles_select_public
    ON socelle.brand_profiles
    FOR SELECT
    USING (true);

-- Insert: only the service role can insert brand profile rows
-- (auto-generated by pipeline; no user inserts brand profiles directly)
CREATE POLICY brand_profiles_insert_service_role
    ON socelle.brand_profiles
    FOR INSERT
    WITH CHECK (
        current_setting('role') = 'service_role'
    );

-- Update: service role can update any row (pipeline refreshes)
-- OR the authenticated user who holds an approved claim for this brand
-- can update the brand-controlled fields on their claimed profile.
-- Note: restricting which columns they can edit is enforced at application layer.
CREATE POLICY brand_profiles_update_service_or_claimant
    ON socelle.brand_profiles
    FOR UPDATE
    USING (
        current_setting('role') = 'service_role'
        OR (
            auth.uid() IS NOT NULL
            AND claimed = true
            AND claimed_by = auth.uid()
        )
    )
    WITH CHECK (
        current_setting('role') = 'service_role'
        OR (
            auth.uid() IS NOT NULL
            AND claimed = true
            AND claimed_by = auth.uid()
        )
    );

-- Delete: service role only (brand profiles are never user-deleted)
CREATE POLICY brand_profiles_delete_service_role
    ON socelle.brand_profiles
    FOR DELETE
    USING (
        current_setting('role') = 'service_role'
    );


-- ---------------------------------------------------------------------------
-- brand_claims RLS
-- ---------------------------------------------------------------------------
ALTER TABLE socelle.brand_claims ENABLE ROW LEVEL SECURITY;

-- Select: authenticated users can see only their own claim records
CREATE POLICY brand_claims_select_own
    ON socelle.brand_claims
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL
        AND claimant_user_id = auth.uid()
    );

-- Insert: any authenticated user can submit a claim application
CREATE POLICY brand_claims_insert_authenticated
    ON socelle.brand_claims
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND claimant_user_id = auth.uid()
    );

-- Update: service role only (SOCELLE admin approves/rejects/revokes claims)
-- Claimants cannot self-approve their own claims
CREATE POLICY brand_claims_update_service_role
    ON socelle.brand_claims
    FOR UPDATE
    USING (
        current_setting('role') = 'service_role'
    )
    WITH CHECK (
        current_setting('role') = 'service_role'
    );

-- Delete: service role only
CREATE POLICY brand_claims_delete_service_role
    ON socelle.brand_claims
    FOR DELETE
    USING (
        current_setting('role') = 'service_role'
    );


-- ---------------------------------------------------------------------------
-- brand_posts RLS
-- ---------------------------------------------------------------------------
ALTER TABLE socelle.brand_posts ENABLE ROW LEVEL SECURITY;

-- Select: anyone can read published posts (published_at <= NOW())
-- Draft posts (published_at IS NULL or future) are only visible to the author
CREATE POLICY brand_posts_select_published_or_own
    ON socelle.brand_posts
    FOR SELECT
    USING (
        -- Post is published (published_at is set and in the past or now)
        (published_at IS NOT NULL AND published_at <= NOW())
        OR
        -- Or the authenticated user is the author (can see their own drafts)
        (auth.uid() IS NOT NULL AND author_user_id = auth.uid())
        OR
        -- Service role can read everything
        current_setting('role') = 'service_role'
    );

-- Insert: authenticated users who hold an approved claim for the brand
-- Enforcement: application layer verifies active claim before allowing insert
CREATE POLICY brand_posts_insert_claimed_brand
    ON socelle.brand_posts
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND author_user_id = auth.uid()
    );

-- Update: author only, or service role
CREATE POLICY brand_posts_update_author_or_service
    ON socelle.brand_posts
    FOR UPDATE
    USING (
        (auth.uid() IS NOT NULL AND author_user_id = auth.uid())
        OR current_setting('role') = 'service_role'
    )
    WITH CHECK (
        (auth.uid() IS NOT NULL AND author_user_id = auth.uid())
        OR current_setting('role') = 'service_role'
    );

-- Delete: author or service role
CREATE POLICY brand_posts_delete_author_or_service
    ON socelle.brand_posts
    FOR DELETE
    USING (
        (auth.uid() IS NOT NULL AND author_user_id = auth.uid())
        OR current_setting('role') = 'service_role'
    );


-- ---------------------------------------------------------------------------
-- brand_reviews RLS
-- ---------------------------------------------------------------------------
ALTER TABLE socelle.brand_reviews ENABLE ROW LEVEL SECURITY;

-- Select: public read — all published reviews are visible to everyone
CREATE POLICY brand_reviews_select_public
    ON socelle.brand_reviews
    FOR SELECT
    USING (true);

-- Insert: any authenticated user can submit a review
-- (unique constraint prevents duplicate reviews per brand per user)
CREATE POLICY brand_reviews_insert_authenticated
    ON socelle.brand_reviews
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND user_id = auth.uid()
    );

-- Update: users can only update their own review
CREATE POLICY brand_reviews_update_own
    ON socelle.brand_reviews
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL
        AND user_id = auth.uid()
    )
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND user_id = auth.uid()
    );

-- Delete: user can delete own review, or service role for moderation
CREATE POLICY brand_reviews_delete_own_or_service
    ON socelle.brand_reviews
    FOR DELETE
    USING (
        (auth.uid() IS NOT NULL AND user_id = auth.uid())
        OR current_setting('role') = 'service_role'
    );


-- ---------------------------------------------------------------------------
-- brand_page_analytics RLS
-- ---------------------------------------------------------------------------
ALTER TABLE socelle.brand_page_analytics ENABLE ROW LEVEL SECURITY;

-- Select: service role + admin users can read all analytics
-- Claimed brands can read analytics for their own brand only
-- Application layer enforces tier gating (30-day / 90-day / 12-month windows)
CREATE POLICY brand_page_analytics_select_service_or_claimant
    ON socelle.brand_page_analytics
    FOR SELECT
    USING (
        current_setting('role') = 'service_role'
        OR (
            auth.uid() IS NOT NULL
            AND brand_id IN (
                SELECT bp.brand_id
                FROM socelle.brand_profiles bp
                WHERE bp.claimed = true
                  AND bp.claimed_by = auth.uid()
            )
        )
    );

-- Insert/Update: service role only (analytics rows are written by the pipeline, not users)
CREATE POLICY brand_page_analytics_insert_service_role
    ON socelle.brand_page_analytics
    FOR INSERT
    WITH CHECK (
        current_setting('role') = 'service_role'
    );

CREATE POLICY brand_page_analytics_update_service_role
    ON socelle.brand_page_analytics
    FOR UPDATE
    USING (
        current_setting('role') = 'service_role'
    )
    WITH CHECK (
        current_setting('role') = 'service_role'
    );

-- Delete: service role only
CREATE POLICY brand_page_analytics_delete_service_role
    ON socelle.brand_page_analytics
    FOR DELETE
    USING (
        current_setting('role') = 'service_role'
    );


-- =============================================================================
-- MATERIALIZED VIEWS
-- Referenced in SOCELLE_BRAND_PROFILES_SPEC.md Section 2 — Data Source Mapping.
-- These views are refreshed by pg-boss scheduled jobs.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- View: brand_aggregate_ratings
-- Computes the aggregate rating and aspect averages for each brand.
-- Refreshed every time a review is submitted (via trigger or scheduled job).
-- ---------------------------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS socelle.brand_aggregate_ratings AS
SELECT
    br.brand_id,
    COUNT(*)                                                    AS review_count,
    ROUND(AVG(br.rating), 1)                                    AS avg_rating,
    ROUND(AVG((br.aspects->>'efficacy')::NUMERIC), 1)           AS avg_efficacy,
    ROUND(AVG((br.aspects->>'value')::NUMERIC), 1)              AS avg_value,
    ROUND(AVG((br.aspects->>'support')::NUMERIC), 1)            AS avg_support,
    ROUND(AVG((br.aspects->>'training')::NUMERIC), 1)           AS avg_training,
    COUNT(*) FILTER (WHERE br.verified_purchase = true)         AS verified_review_count,
    MAX(br.created_at)                                          AS most_recent_review_at
FROM socelle.brand_reviews br
GROUP BY br.brand_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_brand_aggregate_ratings_brand_id
    ON socelle.brand_aggregate_ratings (brand_id);

COMMENT ON MATERIALIZED VIEW socelle.brand_aggregate_ratings IS
    'Pre-computed aggregate ratings per brand. Refreshed on demand by the review '
    'submission handler and nightly by pg-boss. Used on brand profile pages and '
    'in brand category positioning comparisons.';


-- ---------------------------------------------------------------------------
-- View: brand_category_positioning
-- Computes relative positioning of each brand within its category.
-- Refreshed weekly by pg-boss.
-- ---------------------------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS socelle.brand_category_positioning AS
WITH category_stats AS (
    SELECT
        bp.category,
        AVG(bar.avg_rating)         AS cat_avg_rating,
        PERCENTILE_CONT(0.5)
            WITHIN GROUP (ORDER BY bar.avg_rating)
                                    AS cat_median_rating,
        COUNT(bp.id)                AS brand_count
    FROM socelle.brand_profiles bp
    LEFT JOIN socelle.brand_aggregate_ratings bar ON bar.brand_id = bp.brand_id
    GROUP BY bp.category
)
SELECT
    bp.id                                                   AS profile_id,
    bp.brand_id,
    bp.category,
    bp.tier,
    bar.avg_rating,
    bar.review_count,
    cs.cat_avg_rating,
    cs.cat_median_rating,
    cs.brand_count                                          AS category_peer_count,
    RANK() OVER (
        PARTITION BY bp.category
        ORDER BY bar.avg_rating DESC NULLS LAST
    )                                                       AS sentiment_rank_in_category,
    RANK() OVER (
        PARTITION BY bp.category, bp.tier
        ORDER BY bar.avg_rating DESC NULLS LAST
    )                                                       AS sentiment_rank_in_tier
FROM socelle.brand_profiles bp
LEFT JOIN socelle.brand_aggregate_ratings bar ON bar.brand_id = bp.brand_id
LEFT JOIN category_stats cs ON cs.category = bp.category;

CREATE UNIQUE INDEX IF NOT EXISTS idx_brand_category_positioning_brand_id
    ON socelle.brand_category_positioning (brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_category_positioning_category
    ON socelle.brand_category_positioning (category, sentiment_rank_in_category);

COMMENT ON MATERIALIZED VIEW socelle.brand_category_positioning IS
    'Relative positioning of each brand within its category by sentiment rank. '
    'Used to populate the "How [Brand] Compares" section on brand profile pages. '
    'Refreshed weekly by pg-boss scheduled job.';


-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Function: increment_brand_analytics
-- Called by the application layer to increment daily analytics counters.
-- Uses INSERT ... ON CONFLICT to upsert the daily row atomically.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION socelle.increment_brand_analytics(
    p_brand_id              UUID,
    p_date                  DATE,
    p_views_delta           INT DEFAULT 0,
    p_claim_cta_delta       INT DEFAULT 0,
    p_affiliate_delta       INT DEFAULT 0,
    p_review_delta          INT DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO socelle.brand_page_analytics (
        brand_id,
        date,
        views,
        claim_cta_clicks,
        affiliate_clicks,
        review_submissions
    )
    VALUES (
        p_brand_id,
        p_date,
        p_views_delta,
        p_claim_cta_delta,
        p_affiliate_delta,
        p_review_delta
    )
    ON CONFLICT (brand_id, date)
    DO UPDATE SET
        views              = brand_page_analytics.views + EXCLUDED.views,
        claim_cta_clicks   = brand_page_analytics.claim_cta_clicks + EXCLUDED.claim_cta_clicks,
        affiliate_clicks   = brand_page_analytics.affiliate_clicks + EXCLUDED.affiliate_clicks,
        review_submissions = brand_page_analytics.review_submissions + EXCLUDED.review_submissions;
END;
$$;

COMMENT ON FUNCTION socelle.increment_brand_analytics IS
    'Atomically increments daily analytics counters for a brand page. '
    'Creates the row if it does not exist for the given date. '
    'Called by the application layer on page view events and action events.';


-- ---------------------------------------------------------------------------
-- Function: get_brand_claim_tier
-- Returns the active plan tier for a brand, or NULL if unclaimed.
-- Used in application layer for feature gating.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION socelle.get_brand_claim_tier(p_brand_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    v_tier TEXT;
BEGIN
    SELECT bc.plan_tier
    INTO v_tier
    FROM socelle.brand_claims bc
    WHERE bc.brand_id = p_brand_id
      AND bc.claim_status = 'approved'
      AND bc.stripe_subscription_id IS NOT NULL
    ORDER BY bc.approved_at DESC
    LIMIT 1;

    RETURN v_tier; -- Returns NULL if no active approved claim exists
END;
$$;

COMMENT ON FUNCTION socelle.get_brand_claim_tier IS
    'Returns the active claim tier (basic | pro | enterprise) for a brand, '
    'or NULL if the brand is unclaimed. Used for feature gating in application logic.';


-- =============================================================================
-- SEED DATA — BRAND PROFILES INITIAL BATCH
-- Insert initial brand profile stubs for the 56 seed brands defined in
-- SOCELLE_BRAND_PROFILES_SPEC.md Section 4.
-- Requires that corresponding rows exist in socelle.brands table.
-- This section uses DO block to gracefully skip brands not yet in brands table.
-- =============================================================================

-- Note: The DO block below inserts stubs only if the brand slug does not already
-- exist in brand_profiles. Each insert requires a matching brand_id in socelle.brands.
-- Run the brands table seed migration before this migration.

DO $$
DECLARE
    v_brand_id UUID;
BEGIN
    -- The following are placeholder slug inserts.
    -- In production: replace these with actual brand UUIDs from socelle.brands.
    -- This block demonstrates the expected seed pattern.

    -- Example for one brand (SkinCeuticals):
    -- SELECT id INTO v_brand_id FROM socelle.brands WHERE LOWER(name) LIKE '%skinceuticals%' LIMIT 1;
    -- IF v_brand_id IS NOT NULL AND NOT EXISTS (
    --     SELECT 1 FROM socelle.brand_profiles WHERE brand_id = v_brand_id
    -- ) THEN
    --     INSERT INTO socelle.brand_profiles (brand_id, slug, category, tier, headquarters, parent_company, founded_year, website_url)
    --     VALUES (v_brand_id, 'skinceuticals', 'skincare', 'luxury', 'New York, NY', 'L''Oréal Group', 1994, 'https://www.skinceuticals.com');
    -- END IF;

    RAISE NOTICE 'Brand profile seed data: insert brand-specific rows after populating socelle.brands. See SOCELLE_BRAND_PROFILES_SPEC.md Section 4 for the full 56-brand seed list.';
END;
$$;


-- =============================================================================
-- MIGRATION RECORD
-- Track that this migration has been applied.
-- =============================================================================

-- Insert migration record if a migrations tracking table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'socelle'
          AND table_name = 'migrations'
    ) THEN
        INSERT INTO socelle.migrations (name, applied_at)
        VALUES ('brand_profiles_feature', NOW())
        ON CONFLICT (name) DO NOTHING;
    END IF;
END;
$$;

COMMIT;

-- =============================================================================
-- POST-MIGRATION VERIFICATION QUERIES
-- Run these manually to confirm the migration applied correctly.
-- =============================================================================

-- Verify tables created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'socelle' AND table_name LIKE 'brand_%' ORDER BY table_name;
-- Expected: brand_claims, brand_page_analytics, brand_posts, brand_profiles, brand_reviews

-- Verify indexes:
-- SELECT indexname FROM pg_indexes WHERE schemaname = 'socelle' AND tablename LIKE 'brand_%' ORDER BY tablename, indexname;

-- Verify RLS enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'socelle' AND tablename LIKE 'brand_%' ORDER BY tablename;

-- Verify materialized views:
-- SELECT matviewname FROM pg_matviews WHERE schemaname = 'socelle' ORDER BY matviewname;
-- Expected: brand_aggregate_ratings, brand_category_positioning

-- Verify functions:
-- SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'socelle' AND routine_name LIKE '%brand%' ORDER BY routine_name;
-- Expected: get_brand_claim_tier, increment_brand_analytics

-- Verify tier price constraint (should return 3 rows):
-- SELECT monthly_price_cents FROM (VALUES (19900),(49900),(99900)) t(monthly_price_cents)
--   WHERE monthly_price_cents NOT IN (19900, 49900, 99900);
-- Expected: 0 rows (all valid)
