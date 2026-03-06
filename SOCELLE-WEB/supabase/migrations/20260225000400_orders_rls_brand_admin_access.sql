-- Allow brand admins to read all orders for their brand
-- (existing policy only covers created_by = auth.uid() for business users)

CREATE POLICY "Brand admins can view their brand orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.brand_id = orders.brand_id
        AND user_profiles.role IN ('brand_admin', 'admin', 'platform_admin')
    )
  );
