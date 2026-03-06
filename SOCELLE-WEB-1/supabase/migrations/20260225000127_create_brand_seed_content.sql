-- Migration 11: create brand_seed_content
-- Platform-created brand content that the brand reviews and approves during claim flow

CREATE TABLE IF NOT EXISTS brand_seed_content (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id        uuid        NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  content_type    text        NOT NULL
    CHECK (content_type IN (
      'description', 'story', 'logo', 'banner', 'product',
      'category_tags', 'social_links', 'website_url', 'team_info'
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

CREATE INDEX IF NOT EXISTS idx_brand_seed_content_brand_id
  ON brand_seed_content(brand_id);

CREATE INDEX IF NOT EXISTS idx_brand_seed_content_status
  ON brand_seed_content(status)
  WHERE status = 'pending';

COMMENT ON TABLE brand_seed_content IS
  'Content seeded by Socelle admins for unverified brand pages. Brands review and accept/reject during claim flow.';
COMMENT ON COLUMN brand_seed_content.source_url IS
  'URL where this content was found (brand website, social, etc.). Displayed to brand during claim review.';
COMMENT ON COLUMN brand_seed_content.content_data IS
  'Structured JSON content. Shape varies by content_type (e.g. {text: "..."} for description, {url: "..."} for logo).';
