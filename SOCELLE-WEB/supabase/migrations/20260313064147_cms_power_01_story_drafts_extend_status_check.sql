-- CMS-POWER-01: Extend story_drafts status CHECK constraint
-- Original CMS workflow: draft → review → scheduled → published → archived
-- RSS approval queue:    pending → approved | rejected → published
-- Both workflows coexist in story_drafts; extend constraint to cover all valid states.
-- Applied: 2026-03-13

ALTER TABLE public.story_drafts
  DROP CONSTRAINT IF EXISTS story_drafts_status_check;

ALTER TABLE public.story_drafts
  ADD CONSTRAINT story_drafts_status_check
  CHECK (status = ANY (ARRAY[
    'draft'::text,
    'review'::text,
    'scheduled'::text,
    'published'::text,
    'archived'::text,
    'pending'::text,
    'approved'::text,
    'rejected'::text
  ]));
