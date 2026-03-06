-- =============================================================================
-- SOCELLE EVENTS SYSTEM — COMPLETE DATABASE MIGRATION
-- Schema: socelle
-- Version: 1.0
-- Date: March 2026
-- Author: Agent 4 — Industry Events Agent
--
-- PURPOSE:
-- Full production-ready SQL migration for the Socelle industry events system.
-- Handles both virtual and in-person events, CE credit tracking, brand
-- sponsorship links, geocoding data, source attribution, user saves,
-- crawl logging, crawler configuration, and geocode caching.
--
-- DEPENDENCIES:
-- - socelle schema must exist (created in baseline migration)
-- - socelle.brands table must exist (WO-10)
-- - public.user_profiles table must exist (baseline auth migration)
--
-- EXECUTION ORDER:
-- 1. socelle.events (main events table)
-- 2. socelle.event_saves (user save/RSVP table)
-- 3. socelle.crawl_logs (pipeline execution log)
-- 4. socelle.crawler_configs (per-source crawl configuration)
-- 5. socelle.geocode_cache (Google Maps geocoding cache)
-- 6. All indexes
-- 7. RLS policies
-- 8. Triggers
-- 9. Initial data / comments
-- =============================================================================


-- =============================================================================
-- SECTION 1: SCHEMA GUARD
-- Ensure the socelle schema exists before any table creation
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS socelle;


-- =============================================================================
-- SECTION 2: socelle.events — MAIN EVENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS socelle.events (

  -- -------------------------------------------------------------------------
  -- Primary Key
  -- -------------------------------------------------------------------------
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- -------------------------------------------------------------------------
  -- Core Event Identity
  -- -------------------------------------------------------------------------
  name                        TEXT NOT NULL,
  slug                        TEXT NOT NULL UNIQUE,         -- e.g., "ispa-conference-expo-2026"
  description                 TEXT,                         -- plaintext, max 2000 chars
  event_type                  TEXT NOT NULL,                -- see check constraint below

  -- -------------------------------------------------------------------------
  -- Organizer / Source
  -- -------------------------------------------------------------------------
  organizer_name              TEXT,
  organizer_url               TEXT,
  organizer_brand_id          UUID REFERENCES socelle.brands(id) ON DELETE SET NULL,
  -- ^ links to socelle.brands if the organizer is a known Socelle brand

  -- -------------------------------------------------------------------------
  -- Registration
  -- -------------------------------------------------------------------------
  registration_url            TEXT,
  registration_price_min_cents INT CHECK (registration_price_min_cents >= 0),
  registration_price_max_cents INT CHECK (registration_price_max_cents >= 0),
  is_free                     BOOLEAN NOT NULL DEFAULT false,

  -- -------------------------------------------------------------------------
  -- CE Credits (Continuing Education)
  -- Primarily for esthetician, medspa, and massage events
  -- -------------------------------------------------------------------------
  ce_credits_available        BOOLEAN NOT NULL DEFAULT false,
  ce_credits_count            NUMERIC(5,1),                 -- e.g., 1.5 CE hours
  ce_provider                 TEXT,                         -- NCEA | ASCP | NCBTMB | state board | brand name

  -- -------------------------------------------------------------------------
  -- Date and Time
  -- All dates stored in the event's local timezone.
  -- start_time and end_time are local-timezone times (not UTC).
  -- The timezone column provides IANA timezone for conversion.
  -- -------------------------------------------------------------------------
  start_date                  DATE NOT NULL,
  end_date                    DATE,                         -- NULL for single-day events
  start_time                  TIME,                         -- NULL if time not announced
  end_time                    TIME,
  timezone                    TEXT,                         -- IANA format: America/New_York

  -- -------------------------------------------------------------------------
  -- Virtual / Online
  -- -------------------------------------------------------------------------
  is_virtual                  BOOLEAN NOT NULL DEFAULT false,
  virtual_platform            TEXT,                         -- zoom | webex | teams | hopin | custom
  virtual_url                 TEXT,                         -- direct join link (if public)

  -- -------------------------------------------------------------------------
  -- Physical Location
  -- NULL when is_virtual = true
  -- -------------------------------------------------------------------------
  venue_name                  TEXT,                         -- e.g., "Gaylord Opryland Resort"
  venue_address               TEXT,                         -- full street address
  city                        TEXT,
  state                       TEXT,                         -- 2-letter US state code
  country                     TEXT NOT NULL DEFAULT 'US',
  lat                         NUMERIC(10,7),                -- WGS84 latitude
  lng                         NUMERIC(10,7),                -- WGS84 longitude

  -- -------------------------------------------------------------------------
  -- Capacity
  -- -------------------------------------------------------------------------
  capacity                    INT CHECK (capacity > 0),     -- NULL = unlimited / unknown

  -- -------------------------------------------------------------------------
  -- Classification Tags
  -- PostgreSQL native arrays — queried with && (overlap) or @> (contains)
  -- specialty_tags: facial | hair | nails | medspa | wellness | business |
  --                 laser | injectables | waxing | massage | makeup | compliance
  -- brand_sponsors: brand names (text); resolved to brand_id asynchronously
  -- -------------------------------------------------------------------------
  specialty_tags              TEXT[] NOT NULL DEFAULT '{}',
  brand_sponsors              TEXT[] NOT NULL DEFAULT '{}',

  -- -------------------------------------------------------------------------
  -- Media
  -- -------------------------------------------------------------------------
  hero_image_url              TEXT,

  -- -------------------------------------------------------------------------
  -- Source Attribution
  -- Every auto-extracted event must have a source_url.
  -- Manually created events set source_url = 'https://socelle.com/admin' and
  -- auto_extracted = false.
  -- -------------------------------------------------------------------------
  source_url                  TEXT NOT NULL,
  source_name                 TEXT,                         -- e.g., "ISPA" | "Eventbrite" | "ASCP"
  auto_extracted              BOOLEAN NOT NULL DEFAULT true,
  last_verified_at            TIMESTAMPTZ,                  -- NULL = never human-verified

  -- -------------------------------------------------------------------------
  -- Status
  -- is_cancelled: soft delete — never hard-delete a previously-indexed event
  -- is_hidden: admin-controlled; removes from all public surfaces (opt-out)
  -- is_featured: editorial pick; surfaces at top of index page
  -- -------------------------------------------------------------------------
  is_cancelled                BOOLEAN NOT NULL DEFAULT false,
  is_hidden                   BOOLEAN NOT NULL DEFAULT false,
  is_featured                 BOOLEAN NOT NULL DEFAULT false,

  -- -------------------------------------------------------------------------
  -- Flexible Metadata
  -- Stores: needs_review (bool), secondary_registration_urls (array),
  --         member_price_cents (int), ce_credits_raw (text),
  --         eventbrite_event_id (text), compliance_topics (array),
  --         is_major_tradeshow (bool), etc.
  -- -------------------------------------------------------------------------
  metadata                    JSONB NOT NULL DEFAULT '{}',

  -- -------------------------------------------------------------------------
  -- Audit Timestamps
  -- -------------------------------------------------------------------------
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- -------------------------------------------------------------------------
  -- Check Constraints
  -- -------------------------------------------------------------------------
  CONSTRAINT events_type_check CHECK (
    event_type IN (
      'conference',
      'training',
      'webinar',
      'summit',
      'tradeshow',
      'brand_education',
      'retreat',
      'networking'
    )
  ),

  CONSTRAINT events_date_order CHECK (
    end_date IS NULL OR end_date >= start_date
  ),

  CONSTRAINT events_price_order CHECK (
    registration_price_max_cents IS NULL
    OR registration_price_min_cents IS NULL
    OR registration_price_max_cents >= registration_price_min_cents
  ),

  CONSTRAINT events_virtual_location CHECK (
    -- Virtual events must not have physical lat/lng
    NOT (is_virtual = true AND (lat IS NOT NULL OR lng IS NOT NULL))
    OR is_virtual = false
  )

);

COMMENT ON TABLE socelle.events IS
  'Industry events extracted from 17+ sources. Handles virtual and in-person events. '
  'Soft-delete only (is_cancelled). Every auto-extracted event has source_url. '
  'CE credits, geocoding, brand sponsorship, and specialty tagging included.';

COMMENT ON COLUMN socelle.events.slug IS
  'URL-safe identifier. Format: kebab-case(name)-YYYY. Unique. Used in /events/[slug] routes.';

COMMENT ON COLUMN socelle.events.event_type IS
  'Classified from name/description keywords. Values: conference | training | webinar | '
  'summit | tradeshow | brand_education | retreat | networking';

COMMENT ON COLUMN socelle.events.ce_credits_count IS
  'Number of CE hours/credits awarded. Use NUMERIC(5,1) to support 0.5-credit increments.';

COMMENT ON COLUMN socelle.events.specialty_tags IS
  'Array of specialty tags. Used for feed personalization, email targeting, and filtering. '
  'Values: facial | hair | nails | medspa | wellness | business | laser | injectables | '
  'waxing | massage | makeup | compliance';

COMMENT ON COLUMN socelle.events.brand_sponsors IS
  'Array of brand names (text). Brands whose name appears in brand_sponsors are shown '
  'this event on their brand profile page. Resolved to brand IDs asynchronously.';

COMMENT ON COLUMN socelle.events.is_cancelled IS
  'Soft delete flag. Set true when event disappears from source before start_date. '
  'NEVER hard-delete — preserves SEO equity and historical data.';

COMMENT ON COLUMN socelle.events.metadata IS
  'Flexible JSONB for non-schema fields: needs_review, secondary_registration_urls, '
  'member_price_cents, ce_credits_raw, eventbrite_event_id, compliance_topics, '
  'is_major_tradeshow, etc.';


-- =============================================================================
-- SECTION 3: socelle.event_saves — USER SAVE / RSVP TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS socelle.event_saves (

  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  event_id                    UUID NOT NULL REFERENCES socelle.events(id) ON DELETE CASCADE,
  user_id                     UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  -- Save timestamp
  saved_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Reminder tracking — prevents duplicate reminder sends
  reminder_sent_2weeks        BOOLEAN NOT NULL DEFAULT false,
  reminder_sent_1day          BOOLEAN NOT NULL DEFAULT false,

  -- Cancellation notification — tracks if user was notified of cancellation
  cancellation_notified       BOOLEAN NOT NULL DEFAULT false,

  -- Audit
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Each user can save each event only once
  UNIQUE (event_id, user_id)

);

COMMENT ON TABLE socelle.event_saves IS
  'Tracks user saves/RSVPs for events. Drives reminder email scheduling and '
  'cancellation notifications. One record per user per event.';

COMMENT ON COLUMN socelle.event_saves.reminder_sent_2weeks IS
  'Set true after 14-day reminder email is sent. Prevents duplicate sends.';

COMMENT ON COLUMN socelle.event_saves.reminder_sent_1day IS
  'Set true after 1-day reminder email is sent. Prevents duplicate sends.';

COMMENT ON COLUMN socelle.event_saves.cancellation_notified IS
  'Set true after user is notified their saved event was cancelled.';


-- =============================================================================
-- SECTION 4: socelle.crawl_logs — PIPELINE EXECUTION LOG
-- =============================================================================

CREATE TABLE IF NOT EXISTS socelle.crawl_logs (

  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  source_name                 TEXT NOT NULL,
  source_url                  TEXT,
  job_id                      TEXT,                         -- pg-boss job ID
  trigger                     TEXT NOT NULL DEFAULT 'scheduled', -- scheduled | manual | webhook

  started_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at                    TIMESTAMPTZ,

  status                      TEXT NOT NULL DEFAULT 'running', -- running | success | failed | skipped

  -- Counters
  events_found                INT NOT NULL DEFAULT 0,       -- total events parsed from source
  events_new                  INT NOT NULL DEFAULT 0,       -- newly inserted
  events_updated              INT NOT NULL DEFAULT 0,       -- existing records updated
  events_cancelled            INT NOT NULL DEFAULT 0,       -- events flagged as cancelled

  -- Error tracking
  error_message               TEXT,
  consecutive_failures        INT NOT NULL DEFAULT 0,       -- incremented per source on failure

  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT crawl_logs_status_check CHECK (
    status IN ('running', 'success', 'failed', 'skipped')
  ),

  CONSTRAINT crawl_logs_trigger_check CHECK (
    trigger IN ('scheduled', 'manual', 'webhook')
  )

);

COMMENT ON TABLE socelle.crawl_logs IS
  'Execution log for every crawl job in the socelle-crawl-events pg-boss queue. '
  'consecutive_failures >= 3 triggers Slack alert via application layer.';


-- =============================================================================
-- SECTION 5: socelle.crawler_configs — PER-SOURCE CRAWL CONFIGURATION
-- =============================================================================

CREATE TABLE IF NOT EXISTS socelle.crawler_configs (

  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  source_name                 TEXT NOT NULL UNIQUE,
  source_url                  TEXT NOT NULL,

  extraction_method           TEXT NOT NULL,
  -- Values: playwright | axios | api | rss | manual

  -- CSS selector configuration (stored as JSONB for admin editability)
  -- Keys: event_container, title, date, location, register_link, price,
  --       description, ce_credits, organizer, hero_image
  selector_config             JSONB NOT NULL DEFAULT '{}',

  -- API configuration (keys are encrypted at application layer before storage)
  -- Keys: api_key, base_url, search_params, pagination_type
  api_config                  JSONB NOT NULL DEFAULT '{}',

  -- cron expression for scheduling
  crawl_cadence               TEXT NOT NULL,                -- e.g., "0 3 1 * *"

  -- Rate limiting
  rate_limit_per_min          INT NOT NULL DEFAULT 12,      -- requests per minute
  crawl_delay_seconds         INT NOT NULL DEFAULT 5,       -- seconds between requests

  -- Depth
  max_pages_per_crawl         INT NOT NULL DEFAULT 5,

  -- Optional brand link (for brand education sources)
  brand_id                    UUID REFERENCES socelle.brands(id) ON DELETE SET NULL,

  -- Status
  is_active                   BOOLEAN NOT NULL DEFAULT true,
  last_crawled_at             TIMESTAMPTZ,

  -- Robots.txt compliance notes (plain text for admin reference)
  robots_txt_notes            TEXT,

  -- Audit
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT crawler_configs_method_check CHECK (
    extraction_method IN ('playwright', 'axios', 'api', 'rss', 'manual')
  )

);

COMMENT ON TABLE socelle.crawler_configs IS
  'Per-source crawler configuration. selector_config is editable by admin without '
  'code deploy — critical for handling site redesigns. API keys in api_config are '
  'encrypted at the application layer before storage.';


-- =============================================================================
-- SECTION 6: socelle.geocode_cache — GOOGLE MAPS GEOCODING CACHE
-- =============================================================================

CREATE TABLE IF NOT EXISTS socelle.geocode_cache (

  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Cache key: normalized address string
  -- Normalized: lowercase, trimmed, punctuation removed
  address_normalized          TEXT NOT NULL UNIQUE,

  -- Geocoded result
  lat                         NUMERIC(10,7) NOT NULL,
  lng                         NUMERIC(10,7) NOT NULL,
  formatted_address           TEXT,                         -- Google's canonical address
  city                        TEXT,
  state                       TEXT,
  country                     TEXT,
  place_id                    TEXT,                         -- Google Place ID for re-lookup

  -- Cache management
  geocoded_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at                  TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '180 days')

);

COMMENT ON TABLE socelle.geocode_cache IS
  'Cache for Google Maps Geocoding API results. TTL = 180 days. '
  'Keyed on address_normalized (lowercase, trimmed address string). '
  'Prevents redundant API calls and reduces geocoding costs.';


-- =============================================================================
-- SECTION 7: socelle.data_opt_outs — OPT-OUT REGISTRY
-- =============================================================================

CREATE TABLE IF NOT EXISTS socelle.data_opt_outs (

  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What was opted out
  entity_type                 TEXT NOT NULL,                -- 'event_source' | 'event' | 'brand'
  entity_identifier           TEXT NOT NULL,                -- source_name | event slug | brand name/domain

  -- Requestor
  requestor_email             TEXT NOT NULL,
  requestor_name              TEXT,
  requestor_organization      TEXT,

  -- Request details
  opt_out_reason              TEXT,
  request_received_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  action_taken_at             TIMESTAMPTZ,
  action_taken_by             TEXT,                         -- admin user email
  action_description          TEXT,                         -- what was done

  -- Status
  status                      TEXT NOT NULL DEFAULT 'pending', -- pending | actioned | rejected

  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()

);

COMMENT ON TABLE socelle.data_opt_outs IS
  'Log of data removal/opt-out requests from event organizers and publications. '
  'SLA: 5 business days to action. Sets is_hidden=true on affected events; '
  'sets is_active=false on affected crawler_configs.';


-- =============================================================================
-- SECTION 8: INDEXES
-- =============================================================================

-- -------------------------------------------
-- socelle.events — Query performance indexes
-- -------------------------------------------

-- Most common query: upcoming events sorted by date
CREATE INDEX idx_events_start_date
  ON socelle.events(start_date ASC)
  WHERE is_cancelled = false AND is_hidden = false;

-- Filter by event type (conference, webinar, etc.)
CREATE INDEX idx_events_event_type
  ON socelle.events(event_type)
  WHERE is_cancelled = false AND is_hidden = false;

-- GIN index on specialty_tags for array containsAny queries (&&)
-- Query: WHERE specialty_tags && ARRAY['facial', 'medspa']
CREATE INDEX idx_events_specialty_tags_gin
  ON socelle.events USING GIN (specialty_tags);

-- GIN index on brand_sponsors for brand profile integration
-- Query: WHERE brand_sponsors @> ARRAY['Redken']
CREATE INDEX idx_events_brand_sponsors_gin
  ON socelle.events USING GIN (brand_sponsors);

-- Geographic queries — filter events by state for CE course pages
CREATE INDEX idx_events_state
  ON socelle.events(state)
  WHERE is_cancelled = false AND is_hidden = false AND is_virtual = false;

-- CE credit filtering
CREATE INDEX idx_events_ce_credits
  ON socelle.events(ce_credits_available, ce_credits_count)
  WHERE is_cancelled = false AND is_hidden = false;

-- Virtual vs in-person filtering
CREATE INDEX idx_events_is_virtual
  ON socelle.events(is_virtual)
  WHERE is_cancelled = false AND is_hidden = false;

-- Cancelled events — admin review queries
CREATE INDEX idx_events_is_cancelled
  ON socelle.events(is_cancelled, start_date);

-- Source attribution — deduplication and crawl management
CREATE INDEX idx_events_source_name
  ON socelle.events(source_name);

-- Admin review queue
CREATE INDEX idx_events_needs_review
  ON socelle.events USING GIN (metadata jsonb_path_ops)
  WHERE metadata @> '{"needs_review": true}';

-- Geospatial bounding box — map view queries
-- NOTE: For production map queries at scale, consider PostGIS and ST_MakeEnvelope.
-- This composite index handles simple lat/lng bounding box queries.
CREATE INDEX idx_events_geo
  ON socelle.events(lat, lng)
  WHERE lat IS NOT NULL AND lng IS NOT NULL
    AND is_cancelled = false
    AND is_virtual = false;

-- Featured events
CREATE INDEX idx_events_featured
  ON socelle.events(is_featured, start_date)
  WHERE is_featured = true AND is_cancelled = false;

-- Slug lookup (primary unique index, but explicit for query planner clarity)
-- Already covered by UNIQUE constraint, listed here for documentation
-- CREATE UNIQUE INDEX idx_events_slug ON socelle.events(slug);

-- -------------------------------------------
-- socelle.event_saves — Query performance indexes
-- -------------------------------------------

-- User's saved events (My Events dashboard)
CREATE INDEX idx_event_saves_user_id
  ON socelle.event_saves(user_id, saved_at DESC);

-- Reminder processing — daily cron queries
-- Finds saves where reminder not yet sent and event is within N days
CREATE INDEX idx_event_saves_reminder_2weeks
  ON socelle.event_saves(event_id, user_id)
  WHERE reminder_sent_2weeks = false;

CREATE INDEX idx_event_saves_reminder_1day
  ON socelle.event_saves(event_id, user_id)
  WHERE reminder_sent_1day = false;

-- Count of saves per event (event popularity metric)
CREATE INDEX idx_event_saves_event_id
  ON socelle.event_saves(event_id);

-- -------------------------------------------
-- socelle.crawl_logs — Query performance indexes
-- -------------------------------------------

CREATE INDEX idx_crawl_logs_source
  ON socelle.crawl_logs(source_name, started_at DESC);

CREATE INDEX idx_crawl_logs_status
  ON socelle.crawl_logs(status, started_at DESC);

-- -------------------------------------------
-- socelle.geocode_cache — Query performance indexes
-- -------------------------------------------

CREATE INDEX idx_geocode_cache_address
  ON socelle.geocode_cache(address_normalized);

CREATE INDEX idx_geocode_cache_expires
  ON socelle.geocode_cache(expires_at)
  WHERE expires_at < now();  -- Partial index for expiry cleanup

-- -------------------------------------------
-- socelle.crawler_configs — Query performance indexes
-- -------------------------------------------

CREATE INDEX idx_crawler_configs_active
  ON socelle.crawler_configs(is_active, source_name)
  WHERE is_active = true;


-- =============================================================================
-- SECTION 9: ROW-LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE socelle.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE socelle.event_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE socelle.crawl_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE socelle.crawler_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE socelle.geocode_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE socelle.data_opt_outs ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------
-- socelle.events policies
-- -------------------------------------------

-- Public can SELECT non-cancelled, non-hidden events
CREATE POLICY "events_public_select"
  ON socelle.events
  FOR SELECT
  TO anon, authenticated
  USING (
    is_cancelled = false
    AND is_hidden = false
  );

-- Service role can SELECT everything (includes cancelled/hidden for admin)
CREATE POLICY "events_service_select_all"
  ON socelle.events
  FOR SELECT
  TO service_role
  USING (true);

-- Service role can INSERT new events (crawl pipeline, admin manual entry)
CREATE POLICY "events_service_insert"
  ON socelle.events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Service role can UPDATE events (deduplication merge, cancellation flagging)
CREATE POLICY "events_service_update"
  ON socelle.events
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Service role can DELETE events (hard delete — admin only, rare)
CREATE POLICY "events_service_delete"
  ON socelle.events
  FOR DELETE
  TO service_role
  USING (true);

-- -------------------------------------------
-- socelle.event_saves policies
-- -------------------------------------------

-- Authenticated users can SELECT their own saves
CREATE POLICY "event_saves_user_select"
  ON socelle.event_saves
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Authenticated users can INSERT their own saves
CREATE POLICY "event_saves_user_insert"
  ON socelle.event_saves
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Authenticated users can DELETE their own saves (unsave)
CREATE POLICY "event_saves_user_delete"
  ON socelle.event_saves
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Service role can UPDATE event_saves (for reminder tracking flags)
CREATE POLICY "event_saves_service_update"
  ON socelle.event_saves
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Service role can SELECT all saves (for reminder processing)
CREATE POLICY "event_saves_service_select"
  ON socelle.event_saves
  FOR SELECT
  TO service_role
  USING (true);

-- -------------------------------------------
-- socelle.crawl_logs policies
-- -------------------------------------------

-- Only service role can read/write crawl logs
CREATE POLICY "crawl_logs_service_all"
  ON socelle.crawl_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -------------------------------------------
-- socelle.crawler_configs policies
-- -------------------------------------------

-- Only service role can read/write crawler configs
CREATE POLICY "crawler_configs_service_all"
  ON socelle.crawler_configs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -------------------------------------------
-- socelle.geocode_cache policies
-- -------------------------------------------

-- Only service role can read/write geocode cache
CREATE POLICY "geocode_cache_service_all"
  ON socelle.geocode_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -------------------------------------------
-- socelle.data_opt_outs policies
-- -------------------------------------------

-- Only service role can access opt-out records
CREATE POLICY "data_opt_outs_service_all"
  ON socelle.data_opt_outs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- =============================================================================
-- SECTION 10: TRIGGERS
-- =============================================================================

-- -------------------------------------------
-- updated_at trigger function (shared)
-- -------------------------------------------

CREATE OR REPLACE FUNCTION socelle.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION socelle.set_updated_at() IS
  'Shared trigger function that sets updated_at = now() on any UPDATE. '
  'Applied to socelle.events, socelle.event_saves, socelle.crawler_configs.';

-- -------------------------------------------
-- Apply updated_at trigger to socelle.events
-- -------------------------------------------

CREATE TRIGGER events_set_updated_at
  BEFORE UPDATE ON socelle.events
  FOR EACH ROW
  EXECUTE FUNCTION socelle.set_updated_at();

-- -------------------------------------------
-- Apply updated_at trigger to socelle.event_saves
-- -------------------------------------------

CREATE TRIGGER event_saves_set_updated_at
  BEFORE UPDATE ON socelle.event_saves
  FOR EACH ROW
  EXECUTE FUNCTION socelle.set_updated_at();

-- -------------------------------------------
-- Apply updated_at trigger to socelle.crawler_configs
-- -------------------------------------------

CREATE TRIGGER crawler_configs_set_updated_at
  BEFORE UPDATE ON socelle.crawler_configs
  FOR EACH ROW
  EXECUTE FUNCTION socelle.set_updated_at();

-- -------------------------------------------
-- Slug uniqueness enforcement trigger
-- Ensures slug is always lowercase and hyphenated
-- -------------------------------------------

CREATE OR REPLACE FUNCTION socelle.normalize_event_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Normalize slug: lowercase, trim
  NEW.slug = lower(trim(NEW.slug));

  -- Replace spaces and underscores with hyphens
  NEW.slug = regexp_replace(NEW.slug, '[\s_]+', '-', 'g');

  -- Remove characters that are not alphanumeric or hyphens
  NEW.slug = regexp_replace(NEW.slug, '[^a-z0-9-]', '', 'g');

  -- Collapse multiple hyphens
  NEW.slug = regexp_replace(NEW.slug, '-{2,}', '-', 'g');

  -- Strip leading/trailing hyphens
  NEW.slug = trim(BOTH '-' FROM NEW.slug);

  RETURN NEW;
END;
$$;

CREATE TRIGGER events_normalize_slug
  BEFORE INSERT OR UPDATE OF slug ON socelle.events
  FOR EACH ROW
  EXECUTE FUNCTION socelle.normalize_event_slug();

-- -------------------------------------------
-- Auto-set is_free when price = 0
-- -------------------------------------------

CREATE OR REPLACE FUNCTION socelle.auto_set_is_free()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If both price columns are 0, set is_free = true
  IF NEW.registration_price_min_cents = 0
     AND (NEW.registration_price_max_cents IS NULL OR NEW.registration_price_max_cents = 0)
  THEN
    NEW.is_free = true;
  END IF;

  -- If is_free = true, ensure price columns are 0 or NULL
  IF NEW.is_free = true THEN
    NEW.registration_price_min_cents = 0;
    NEW.registration_price_max_cents = 0;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER events_auto_set_is_free
  BEFORE INSERT OR UPDATE OF registration_price_min_cents, registration_price_max_cents, is_free
  ON socelle.events
  FOR EACH ROW
  EXECUTE FUNCTION socelle.auto_set_is_free();

-- -------------------------------------------
-- CE credits consistency trigger
-- -------------------------------------------

CREATE OR REPLACE FUNCTION socelle.sync_ce_credits_flag()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If ce_credits_count > 0, ensure ce_credits_available = true
  IF NEW.ce_credits_count IS NOT NULL AND NEW.ce_credits_count > 0 THEN
    NEW.ce_credits_available = true;
  END IF;

  -- If ce_credits_available = false, clear the count
  IF NEW.ce_credits_available = false THEN
    NEW.ce_credits_count = NULL;
    NEW.ce_provider = NULL;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER events_sync_ce_credits
  BEFORE INSERT OR UPDATE OF ce_credits_available, ce_credits_count
  ON socelle.events
  FOR EACH ROW
  EXECUTE FUNCTION socelle.sync_ce_credits_flag();


-- =============================================================================
-- SECTION 11: HELPER VIEWS
-- =============================================================================

-- -------------------------------------------
-- Public upcoming events view
-- Used by the React frontend via Supabase client
-- -------------------------------------------

CREATE OR REPLACE VIEW socelle.upcoming_events AS
SELECT
  id,
  name,
  slug,
  description,
  event_type,
  organizer_name,
  organizer_url,
  organizer_brand_id,
  registration_url,
  registration_price_min_cents,
  registration_price_max_cents,
  is_free,
  ce_credits_available,
  ce_credits_count,
  ce_provider,
  start_date,
  end_date,
  start_time,
  timezone,
  is_virtual,
  virtual_platform,
  venue_name,
  city,
  state,
  country,
  lat,
  lng,
  specialty_tags,
  brand_sponsors,
  hero_image_url,
  source_url,
  source_name,
  is_featured,
  created_at
FROM socelle.events
WHERE
  start_date >= CURRENT_DATE
  AND is_cancelled = false
  AND is_hidden = false
ORDER BY
  is_featured DESC,
  start_date ASC;

COMMENT ON VIEW socelle.upcoming_events IS
  'Public view of non-cancelled, non-hidden future events. '
  'Ordered by: featured first, then by date ascending. '
  'Excludes sensitive admin fields (auto_extracted, metadata, last_verified_at).';


-- -------------------------------------------
-- Events needing admin review
-- -------------------------------------------

CREATE OR REPLACE VIEW socelle.events_review_queue AS
SELECT
  id,
  name,
  slug,
  event_type,
  start_date,
  city,
  state,
  is_virtual,
  source_name,
  source_url,
  auto_extracted,
  last_verified_at,
  metadata,
  created_at
FROM socelle.events
WHERE
  (metadata->>'needs_review')::boolean = true
  OR last_verified_at IS NULL
ORDER BY created_at DESC;

COMMENT ON VIEW socelle.events_review_queue IS
  'Admin view showing events that need human verification. '
  'Includes auto-extracted events not yet verified and events flagged needs_review.';


-- -------------------------------------------
-- Brand events view (for brand profile pages)
-- Returns upcoming events associated with a brand
-- -------------------------------------------

CREATE OR REPLACE VIEW socelle.brand_upcoming_events AS
SELECT
  e.id,
  e.name,
  e.slug,
  e.event_type,
  e.start_date,
  e.end_date,
  e.city,
  e.state,
  e.is_virtual,
  e.ce_credits_available,
  e.ce_credits_count,
  e.registration_url,
  e.is_free,
  e.registration_price_min_cents,
  e.specialty_tags,
  e.brand_sponsors,
  e.organizer_brand_id,
  b.name AS brand_name,
  b.slug AS brand_slug
FROM socelle.events e
LEFT JOIN socelle.brands b ON b.id = e.organizer_brand_id
WHERE
  e.start_date >= CURRENT_DATE
  AND e.is_cancelled = false
  AND e.is_hidden = false
ORDER BY e.start_date ASC;

COMMENT ON VIEW socelle.brand_upcoming_events IS
  'Events associated with brands — either as organizer (organizer_brand_id) '
  'or as sponsor (brand_sponsors array). Used by brand profile pages to show '
  '"Upcoming Events Featuring [Brand]" section.';


-- =============================================================================
-- SECTION 12: INITIAL CRAWLER CONFIG DATA
-- Seeds the 17 configured sources so the admin dashboard populates on deploy
-- =============================================================================

INSERT INTO socelle.crawler_configs (
  source_name, source_url, extraction_method, crawl_cadence,
  rate_limit_per_min, crawl_delay_seconds, max_pages_per_crawl,
  robots_txt_notes, selector_config, api_config
) VALUES

-- Source 1: ISPA
(
  'ISPA',
  'https://experienceispa.com/events',
  'playwright',
  '0 3 1 * *',
  6, 10, 5,
  'Allow /events — no disallow for SocelleBot. Crawl 2-6 AM UTC.',
  '{"event_container": ".event-listing", "title": ".event-listing h2.event-title", "date": ".event-listing .event-date", "location": ".event-listing .event-location", "register_link": ".event-listing a.register-link", "description": ".event-listing .event-description"}',
  '{}'
),

-- Source 2: PBA
(
  'PBA',
  'https://probeauty.org/events/list/',
  'playwright',
  '0 3 1 * *',
  7, 8, 5,
  'Allow /events — no disallow. Uses The Events Calendar WP plugin.',
  '{"event_container": ".tribe-events-pro-summary__event", "title": ".tribe-event-title a", "date": ".tribe-events-pro-summary__event-datetime", "location": ".tribe-venue", "register_link": ".tribe-events-pro-summary__event a", "description": ".tribe-events-pro-summary__event-description"}',
  '{}'
),

-- Source 3: BehindTheChair (RSS primary)
(
  'BehindTheChair',
  'https://behindthechair.com/events',
  'rss',
  '0 2 * * 0',
  7, 8, 5,
  'Allow — provides RSS feed (implicit permission to aggregate).',
  '{"rss_url": "https://behindthechair.com/feed/?post_type=tribe_events", "event_container": ".tribe-events-list article", "title": ".tribe-event-name a", "date": ".tribe-event-schedule-details", "location": ".tribe-venue-location"}',
  '{}'
),

-- Source 4: Live Love Spa
(
  'LiveLoveSpa',
  'https://livelovespa.com/events',
  'playwright',
  '0 3 1 * *',
  6, 10, 3,
  'Allow (Squarespace). Member-only event details not accessed.',
  '{"event_container": ".eventlist-event", "title": ".eventlist-title a", "date": ".eventlist-meta-date", "location": ".eventlist-meta-address", "register_link": ".eventlist-column-info a", "description": ".eventlist-description"}',
  '{}'
),

-- Source 5: Spa Collab (Wix)
(
  'SpaCollab',
  'https://spacollab.com/events',
  'playwright',
  '0 3 1 * *',
  4, 15, 3,
  'Wix platform — check robots.txt each run. Aggressive rate limiting.',
  '{"wait_for_selector": "[data-testid=\"event-title\"]", "wait_until": "networkidle", "wait_timeout_ms": 3000, "event_container": "[data-testid=\"event-list-item\"]", "title": "[data-testid=\"event-title\"]", "date": "[data-testid=\"event-date\"]", "location": "[data-testid=\"event-location\"]"}',
  '{}'
),

-- Source 6: Modern Salon
(
  'ModernSalon',
  'https://modernsalon.com/events',
  'axios',
  '0 3 1 * *',
  7, 8, 5,
  'Allow — Bobit Media network. Drupal Views pagination.',
  '{"event_container": ".views-row", "title": ".views-field-title a", "date": ".views-field-field-event-date", "location": ".views-field-field-event-location", "register_link": ".views-field-field-registration-link a", "description": ".views-field-body"}',
  '{}'
),

-- Source 7: Eventbrite (API)
(
  'Eventbrite',
  'https://www.eventbriteapi.com/v3/events/search/',
  'api',
  '0 2 * * 0',
  30, 2, 1,
  'Official API — no robots.txt constraints. 2000 calls/day free tier.',
  '{}',
  '{"api_key_env": "EVENTBRITE_API_KEY", "search_params": {"q": "beauty professionals esthetician spa medspa", "categories": "119,102", "expand": "organizer,venue,ticket_classes,logo"}, "filter_keywords": ["esthetician", "spa", "medspa", "salon", "beauty professional", "skincare", "laser", "injector", "cosmetology", "aesthetics"]}'
),

-- Source 8: Cosmoprof North America
(
  'CosmoprofNA',
  'https://cosmoprofnorthamerica.com',
  'manual',
  '0 4 1 11 *',
  2, 30, 2,
  'Allow — single annual event. Manual seed preferred.',
  '{"event_container": ".event-info", "title": "h1", "date": ".event-date", "location": ".event-venue", "register_link": ".event-register-btn"}',
  '{}'
),

-- Source 9: Premiere Orlando
(
  'PremiereOrlando',
  'https://premiereorlandoshow.com',
  'manual',
  '0 4 1 11 *',
  2, 30, 2,
  'Allow — single annual event. Check /education for sub-events.',
  '{"event_container": ".show-info", "title": "h1.show-title", "date": ".show-date", "location": ".show-location", "register_link": ".show-register"}',
  '{}'
),

-- Source 10: IBS New York
(
  'IBSNewYork',
  'https://ibsnewyork.com',
  'manual',
  '0 4 1 11 *',
  2, 30, 2,
  'Allow — single annual event. Co-located with Premiere BeautyNow.',
  '{"event_container": ".event-details", "title": "h1.show-title", "date": ".event-date-location", "location": ".event-date-location", "register_link": ".registration-info a"}',
  '{}'
),

-- Source 11: AmSpa
(
  'AmSpa',
  'https://americanmedspa.org/events',
  'playwright',
  '30 3 1 1,4,7,10 *',
  6, 10, 5,
  'Allow /events — no disallow. Member-only registration not accessed.',
  '{"event_container": ".event-list .event-item", "title": ".event-title a", "date": ".event-date", "location": ".event-location", "register_link": ".event-registration a", "description": ".event-description", "ce_credits": ".ce-credits"}',
  '{}'
),

-- Source 12: NCEA
(
  'NCEA',
  'https://ncea.tv/events',
  'playwright',
  '30 3 1 1,4,7,10 *',
  6, 10, 5,
  'Check per crawl. CE credit extraction is primary value.',
  '{"event_container": ".tribe-events-list article", "title": ".tribe-event-title a", "date": ".tribe-events-schedule", "location": ".tribe-venue", "register_link": ".tribe-event-url", "ce_credits": ".ce-credits-badge"}',
  '{}'
),

-- Source 13: ASCP
(
  'ASCP',
  'https://ascpskincare.com/events',
  'axios',
  '30 3 1 1,4,7,10 *',
  7, 8, 5,
  'Allow — ASCP is a primary esthetician CE source.',
  '{"event_container": ".event-card", "title": ".event-card .event-title a", "date": ".event-card .event-date", "location": ".event-card .event-location", "register_link": ".event-card a.register", "price": ".event-card .event-price", "ce_credits": ".event-card .ce-credits", "description": ".event-card .event-description"}',
  '{}'
),

-- Source 15: Dermascope
(
  'Dermascope',
  'https://dermascope.com/events',
  'axios',
  '0 3 1 * *',
  6, 10, 3,
  'No known restrictions. Cross-check against ISPA and ASCP for dups.',
  '{"event_container": ".event-list-item", "title": ".event-list-item .event-title a", "date": ".event-list-item .event-dates", "location": ".event-list-item .event-location", "register_link": ".event-list-item .event-description a"}',
  '{}'
),

-- Source 16: Skin Inc
(
  'SkinInc',
  'https://skininc.com/events',
  'rss',
  '0 3 1 * *',
  7, 8, 3,
  'Allow — Allured Business Media. Prefer RSS.',
  '{"rss_url": "https://skininc.com/rss.xml", "rss_category_filter": "Events", "event_container": ".event-item", "title": ".event-item h3 a", "date": ".event-item .event-date", "location": ".event-item .event-location", "register_link": ".event-item a.event-link"}',
  '{}'
),

-- Source 17: ABMP
(
  'ABMP',
  'https://abmp.com/events',
  'axios',
  '30 3 1 1,4,7,10 *',
  6, 10, 5,
  'No known restrictions. Filter: spa/wellness crossover events only.',
  '{"event_container": ".views-row", "title": ".event-title a", "date": ".date-display-range", "location": ".field-name-field-event-location", "description": ".field-name-body", "specialty_filter_keywords": ["spa", "esthetic", "wellness", "facial", "skin care", "medspa", "salon"]}',
  '{}'
);


-- =============================================================================
-- SECTION 13: GRANT PERMISSIONS
-- Explicit grants for Supabase role hierarchy
-- =============================================================================

-- anon role: SELECT on public views only (events via RLS)
GRANT SELECT ON socelle.events TO anon;
GRANT SELECT ON socelle.upcoming_events TO anon;

-- authenticated role: SELECT on events (via RLS), INSERT/DELETE on event_saves
GRANT SELECT ON socelle.events TO authenticated;
GRANT SELECT ON socelle.upcoming_events TO authenticated;
GRANT SELECT ON socelle.brand_upcoming_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON socelle.event_saves TO authenticated;

-- service_role: full access to all tables
GRANT ALL ON socelle.events TO service_role;
GRANT ALL ON socelle.event_saves TO service_role;
GRANT ALL ON socelle.crawl_logs TO service_role;
GRANT ALL ON socelle.crawler_configs TO service_role;
GRANT ALL ON socelle.geocode_cache TO service_role;
GRANT ALL ON socelle.data_opt_outs TO service_role;
GRANT SELECT ON socelle.upcoming_events TO service_role;
GRANT SELECT ON socelle.events_review_queue TO service_role;
GRANT SELECT ON socelle.brand_upcoming_events TO service_role;


-- =============================================================================
-- SECTION 14: MIGRATION METADATA
-- =============================================================================

COMMENT ON SCHEMA socelle IS
  'Socelle platform schema. Contains events, brands, enrichment, and intelligence tables. '
  'Separate from public schema to isolate platform data from Supabase auth tables.';

-- Migration completion marker (if using a migrations tracking table)
-- INSERT INTO public.migrations (name, executed_at)
-- VALUES ('20260304_events_system', now());


-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
-- Tables created:
--   socelle.events           — main events table (all event types)
--   socelle.event_saves      — user save/RSVP records
--   socelle.crawl_logs       — pipeline execution audit log
--   socelle.crawler_configs  — per-source crawl configuration
--   socelle.geocode_cache    — Google Maps Geocoding API cache
--   socelle.data_opt_outs    — opt-out request registry
--
-- Views created:
--   socelle.upcoming_events       — public non-cancelled future events
--   socelle.events_review_queue   — admin review queue
--   socelle.brand_upcoming_events — events by brand for brand profile pages
--
-- Indexes created: 17 total
-- RLS policies: 14 total
-- Triggers: 5 total (updated_at x3, slug normalize, CE credits sync, is_free sync)
-- Initial data: 16 crawler_configs seeded
-- =============================================================================
