-- Migration 12: create business_seed_content
-- Platform-created business content that the business reviews and approves during claim flow

CREATE TABLE IF NOT EXISTS business_seed_content (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     uuid        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  content_type    text        NOT NULL
    CHECK (content_type IN (
      'description', 'photos', 'services', 'hours',
      'website_url', 'social_links', 'license_info', 'location'
    )),
  content_data    jsonb       NOT NULL,
  source_url      text,
  status          text        NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  rejected_reason text,
  accepted_at     timestamptz,
  created_by      uuid        NOT NULL REFERENCES auth.users(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_business_seed_content_business_id
  ON business_seed_content(business_id);

CREATE INDEX IF NOT EXISTS idx_business_seed_content_status
  ON business_seed_content(status)
  WHERE status = 'pending';

COMMENT ON TABLE business_seed_content IS
  'Content seeded by Socelle admins for unverified business listings. Businesses review and accept/reject during claim flow.';
COMMENT ON COLUMN business_seed_content.source_url IS
  'URL where this content was found (Google Business, Yelp, etc.). Displayed to business during claim review.';
