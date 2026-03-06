-- Allow brand users to read unverified businesses for Pipeline (Flag as Fit) feature.
-- They cannot read verified businesses (those are visible via orders/customers context).

CREATE POLICY "Brand users can read unverified businesses for pipeline"
  ON businesses FOR SELECT
  TO authenticated
  USING (
    (verification_status IS NULL OR verification_status != 'verified')
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.brand_id IS NOT NULL
    )
  );
