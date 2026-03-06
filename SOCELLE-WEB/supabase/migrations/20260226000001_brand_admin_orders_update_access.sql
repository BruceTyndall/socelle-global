-- Brand admins can update status + tracking on their brand's orders
-- (view access added in 20260225000400; this adds UPDATE)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'orders'
      AND policyname = 'Brand admins can update their brand orders'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Brand admins can update their brand orders"
        ON orders FOR UPDATE
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
              AND user_profiles.brand_id = orders.brand_id
              AND user_profiles.role IN ('brand_admin', 'admin', 'platform_admin')
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
              AND user_profiles.brand_id = orders.brand_id
              AND user_profiles.role IN ('brand_admin', 'admin', 'platform_admin')
          )
        )
    $policy$;
  END IF;
END $$;
