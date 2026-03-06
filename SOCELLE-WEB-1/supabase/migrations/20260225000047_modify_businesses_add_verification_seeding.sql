-- Migration 08: businesses add verification + seeding
-- Adds verification state machine, claim/verify audit fields, lat/lng, license fields, integration tracking

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'pending_claim', 'pending_verification', 'verified', 'suspended')),
  ADD COLUMN IF NOT EXISTS claimed_at timestamptz,
  ADD COLUMN IF NOT EXISTS claimed_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS seeded_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS business_type text
    CHECK (business_type IN ('salon', 'spa', 'medspa', 'retail', 'other')),
  ADD COLUMN IF NOT EXISTS latitude numeric(10, 8),
  ADD COLUMN IF NOT EXISTS longitude numeric(11, 8),
  ADD COLUMN IF NOT EXISTS license_number text,
  ADD COLUMN IF NOT EXISTS license_state text,
  ADD COLUMN IF NOT EXISTS license_expiration_date date,
  ADD COLUMN IF NOT EXISTS integration_type text DEFAULT 'manual'
    CHECK (integration_type IN ('manual', 'shopify', 'woocommerce', 'api', 'email')),
  ADD COLUMN IF NOT EXISTS integration_sync_status text DEFAULT 'not_applicable'
    CHECK (integration_sync_status IN ('pending', 'synced', 'failed', 'not_applicable'));

-- Index for admin verification queues + public browse
CREATE INDEX IF NOT EXISTS idx_businesses_verification_status ON businesses(verification_status);

-- Index for geo-proximity queries (Phase 2+ feature)
CREATE INDEX IF NOT EXISTS idx_businesses_lat_lng ON businesses(latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Index for license expiration monitoring
CREATE INDEX IF NOT EXISTS idx_businesses_license_expiration ON businesses(license_expiration_date)
  WHERE license_expiration_date IS NOT NULL;

COMMENT ON COLUMN businesses.verification_status IS
  'State machine: unverified → pending_claim → pending_verification → verified. suspended = removed from public.';
COMMENT ON COLUMN businesses.business_type IS
  'Finer-grained type than the existing type enum. Nullable for seeded records pending claim.';
COMMENT ON COLUMN businesses.latitude IS
  'Geographic coordinates for location-based discovery. Set during seeding or claim flow.';
COMMENT ON COLUMN businesses.license_number IS
  'Professional license for salon/spa/medspa. Verified during claim flow by platform admin.';
