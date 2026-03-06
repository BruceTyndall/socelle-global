-- W10-10: NPI Registry operator verification
-- Adds NPI number storage and verification status to the businesses table.
-- Authority: SOCELLE_DATA_PROVENANCE_POLICY.md §2 (Tier 1 source — CMS NPPES)
-- Migration rule: ADD ONLY — never edit existing migrations.

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS npi_number      VARCHAR(10),
  ADD COLUMN IF NOT EXISTS npi_verified    BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS npi_verified_at TIMESTAMPTZ;

-- Sparse index: only businesses that have an NPI number on file
CREATE INDEX IF NOT EXISTS idx_businesses_npi_number
  ON public.businesses (npi_number)
  WHERE npi_number IS NOT NULL;

-- Note: existing RLS policies on public.businesses cover these new columns.
-- No new RLS policies needed — operators can only read/write their own row.
