-- Migration 07: brands add verification + seeding
-- Adds verification state machine, service tier, claim/verify audit fields, seeding, and outreach tracking

ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'pending_claim', 'pending_verification', 'verified', 'suspended')),
  ADD COLUMN IF NOT EXISTS service_tier text NOT NULL DEFAULT 'standard'
    CHECK (service_tier IN ('standard', 'premier')),
  ADD COLUMN IF NOT EXISTS claimed_at timestamptz,
  ADD COLUMN IF NOT EXISTS claimed_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS seeded_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS outreach_status text DEFAULT 'not_applicable'
    CHECK (outreach_status IN ('not_contacted', 'contacted', 'interested', 'onboarding', 'verified', 'not_applicable'));

-- Index for filtering by verification status (admin queues, public browse)
CREATE INDEX IF NOT EXISTS idx_brands_verification_status ON brands(verification_status);

-- Index for filtering by service tier (Premier brand features)
CREATE INDEX IF NOT EXISTS idx_brands_service_tier ON brands(service_tier);

-- Index for outreach pipeline queries
CREATE INDEX IF NOT EXISTS idx_brands_outreach_status ON brands(outreach_status)
  WHERE outreach_status != 'not_applicable';

COMMENT ON COLUMN brands.verification_status IS
  'State machine: unverified → pending_claim → pending_verification → verified. suspended = removed from public.';
COMMENT ON COLUMN brands.service_tier IS
  'standard = self-serve. premier = managed by Socelle team with dedicated support.';
COMMENT ON COLUMN brands.outreach_status IS
  'Tracks Socelle outreach progress for unverified/seeded brands. not_applicable for self-applied brands.';
