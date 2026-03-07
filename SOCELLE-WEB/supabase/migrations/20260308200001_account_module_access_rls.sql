-- Enable RLS on account_module_access if not already enabled
ALTER TABLE IF EXISTS account_module_access ENABLE ROW LEVEL SECURITY;

-- Users can read their own account's module access
CREATE POLICY "Users read own module access"
ON account_module_access FOR SELECT
USING (
  account_id = auth.uid()
  OR EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'platform_admin'))
);

-- Only admins can insert/update/delete
CREATE POLICY "Admins manage module access"
ON account_module_access FOR ALL
USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'platform_admin'))
);
