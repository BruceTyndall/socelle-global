/*
  # Modify businesses: add profile fields and auto-slug generation

  1. New columns:
     - slug            (text, unique) — URL-safe identifier, auto-generated
                        from name on INSERT. Used for: future reseller profiles,
                        brand CRM drill-down URLs, internal linking.
     - website_url     (text, nullable)
     - instagram_handle (text, nullable) — handle only, no @ prefix enforced
     - phone           (text, nullable)
     - is_verified     (boolean, default false) — platform has verified this
                        business is real and operating. Drives: net terms
                        eligibility, tier promotion triggers, trust signals.
     - city            (text, nullable)
     - state           (text, nullable)
     - country         (text, default 'US')

  2. slugify() function — pure text transformation, IMMUTABLE, reusable
     across other tables that need slug generation.

  3. set_business_slug() trigger — fires BEFORE INSERT only.
     - If slug is already provided, leaves it untouched.
     - Otherwise generates from name, checks uniqueness, appends
       a random 4-char hex suffix on conflict (retries up to 10x).

  4. Backfill — generates slugs for any existing business records.
*/

-- ─────────────────────────────────────────────
-- 1. NEW COLUMNS
-- ─────────────────────────────────────────────

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS website_url text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS instagram_handle text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS phone text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS city text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS state text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'US';

CREATE INDEX IF NOT EXISTS idx_businesses_slug
  ON businesses (slug)
  WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_businesses_is_verified
  ON businesses (is_verified)
  WHERE is_verified = true;

COMMENT ON COLUMN businesses.slug IS
  'URL-safe unique identifier. Auto-generated from name on insert. '
  'Used for future reseller profile URLs: /spa/[slug]';

COMMENT ON COLUMN businesses.is_verified IS
  'Platform has verified this is a real, operating business. '
  'Drives: net terms eligibility, reseller tier promotion, trust display.';

-- ─────────────────────────────────────────────
-- 2. slugify() HELPER FUNCTION
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION slugify(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE STRICT
AS $$
DECLARE
  result text;
BEGIN
  -- Lowercase and trim whitespace
  result := lower(trim(input_text));

  -- Replace accented characters with ASCII equivalents
  result := translate(result,
    'àáâãäåæçèéêëìíîïðñòóôõöùúûüýþÿ',
    'aaaaaaaceeeeiiiidnoooooouuuuypy'
  );

  -- Remove any character that is not alphanumeric, space, or hyphen
  result := regexp_replace(result, '[^a-z0-9\s\-]', '', 'g');

  -- Replace one or more spaces or hyphens with a single hyphen
  result := regexp_replace(result, '[\s\-]+', '-', 'g');

  -- Strip leading/trailing hyphens
  result := trim(both '-' from result);

  -- Truncate to 50 chars (leaves room for -xxxx suffix without exceeding 55)
  result := left(result, 50);

  -- Strip any trailing hyphen left by truncation
  result := rtrim(result, '-');

  -- Fallback: if result is empty (e.g. name was all special chars), use 'business'
  IF result = '' OR result IS NULL THEN
    result := 'business';
  END IF;

  RETURN result;
END;
$$;

COMMENT ON FUNCTION slugify(text) IS
  'Converts arbitrary text to a URL-safe lowercase slug. '
  'IMMUTABLE — safe to use in indexes and generated columns.';

-- ─────────────────────────────────────────────
-- 3. AUTO-SLUG TRIGGER FUNCTION
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_business_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug  text;
  candidate  text;
  suffix     text;
  attempts   integer := 0;
BEGIN
  -- If a slug was explicitly provided, normalise it and return early
  IF NEW.slug IS NOT NULL AND trim(NEW.slug) != '' THEN
    NEW.slug := slugify(NEW.slug);
    RETURN NEW;
  END IF;

  -- Generate base slug from business name
  base_slug := slugify(NEW.name);
  candidate := base_slug;

  -- Check uniqueness; on conflict append a random 4-char hex suffix and retry
  WHILE EXISTS (SELECT 1 FROM businesses WHERE slug = candidate) LOOP
    attempts  := attempts + 1;
    suffix    := lower(substring(md5(random()::text || attempts::text) from 1 for 4));
    candidate := base_slug || '-' || suffix;

    -- Hard stop after 10 attempts — use an 8-char suffix for near-certainty
    IF attempts >= 10 THEN
      candidate := base_slug || '-' || lower(substring(md5(gen_random_uuid()::text) from 1 for 8));
      EXIT;
    END IF;
  END LOOP;

  NEW.slug := candidate;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION set_business_slug() IS
  'BEFORE INSERT trigger on businesses. Auto-generates a unique slug from '
  'the business name. If the base slug is taken, appends a random 4-char '
  'hex suffix and retries up to 10 times.';

-- Attach trigger — INSERT only; slug is stable once set
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_set_business_slug'
    AND tgrelid = 'businesses'::regclass
  ) THEN
    CREATE TRIGGER trg_set_business_slug
      BEFORE INSERT ON businesses
      FOR EACH ROW
      EXECUTE FUNCTION set_business_slug();
  END IF;
END $$;

-- ─────────────────────────────────────────────
-- 4. BACKFILL — generate slugs for existing businesses
-- ─────────────────────────────────────────────

DO $$
DECLARE
  rec       record;
  base_slug text;
  candidate text;
  suffix    text;
  attempts  integer;
BEGIN
  FOR rec IN
    SELECT id, name FROM businesses WHERE slug IS NULL ORDER BY created_at
  LOOP
    base_slug := slugify(rec.name);
    candidate := base_slug;
    attempts  := 0;

    WHILE EXISTS (SELECT 1 FROM businesses WHERE slug = candidate AND id != rec.id) LOOP
      attempts  := attempts + 1;
      suffix    := lower(substring(md5(random()::text || attempts::text) from 1 for 4));
      candidate := base_slug || '-' || suffix;

      IF attempts >= 10 THEN
        candidate := base_slug || '-' || lower(substring(md5(rec.id::text) from 1 for 8));
        EXIT;
      END IF;
    END LOOP;

    UPDATE businesses SET slug = candidate WHERE id = rec.id;
  END LOOP;
END $$;
