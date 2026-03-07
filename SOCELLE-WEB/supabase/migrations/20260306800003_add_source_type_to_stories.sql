-- W15-05: Add source_type to stories (curated vs automated)
-- ADD ONLY — never edit existing migrations (AGENT_SCOPE_REGISTRY §Backend Agent)
-- Authority: build_tracker.md WO W15-05
--
-- source_type: 'curated' (admin-written), 'automated' (feed-derived), 'hybrid' (auto-draft + admin edit)
-- Existing rows default to 'curated' (all current stories were admin-created).

ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS source_type text NOT NULL DEFAULT 'curated'
    CHECK (source_type IN ('curated', 'automated', 'hybrid'));

-- Index for filtering by source_type (editorial injection queries)
CREATE INDEX IF NOT EXISTS idx_stories_source_type
  ON public.stories (source_type);

-- reading_time_minutes: estimated read time for story detail page
ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS reading_time_minutes smallint;

-- featured: flag for spotlight/hero placement on listings
ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_stories_featured
  ON public.stories (featured)
  WHERE featured = true;

COMMENT ON COLUMN public.stories.source_type IS
  'W15-05: Origin type — curated (admin-written), automated (feed-derived), hybrid (auto-draft + admin edit)';

COMMENT ON COLUMN public.stories.reading_time_minutes IS
  'W15-05: Estimated reading time in minutes (computed on save)';

COMMENT ON COLUMN public.stories.featured IS
  'W15-05: Featured flag — featured stories get spotlight placement on listings';
