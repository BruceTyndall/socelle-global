-- Allow authenticated users to insert a brand row during the apply flow.
-- All brand applications land in verification_status='pending_verification' and
-- require platform admin approval before going live (status='active').
-- This policy is intentionally permissive on insert because we review every brand manually.

CREATE POLICY "Authenticated users can apply as brand"
  ON brands FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
