-- INTEL-MEDSPA-01: Add vertical and tier_min to data_feeds
-- Allows feed-orchestrator to tag promoted signals correctly
ALTER TABLE public.data_feeds
  ADD COLUMN IF NOT EXISTS vertical text
    CHECK (vertical IN ('medspa', 'salon', 'beauty_brand', 'multi', 'regulatory', 'science'))
    DEFAULT 'multi',
  ADD COLUMN IF NOT EXISTS tier_min text
    CHECK (tier_min IN ('free', 'paid'))
    DEFAULT 'paid';

COMMENT ON COLUMN public.data_feeds.vertical IS
  'INTEL-MEDSPA-01: Which industry vertical this feed primarily serves';
COMMENT ON COLUMN public.data_feeds.tier_min IS
  'INTEL-MEDSPA-01: Minimum tier for signals produced by this feed';
