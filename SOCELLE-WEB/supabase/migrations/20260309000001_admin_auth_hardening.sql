/*
  # Admin Auth Hardening

  1. Creates `public.is_admin()` — a SECURITY DEFINER boolean helper
     used by RLS policies and UI code to check admin status without recursion.

  2. Creates a trigger `protect_admin_role` on user_profiles that prevents
     the role column from being silently downgraded from admin/platform_admin
     via client-side RLS-constrained writes. Service-role (migrations, seeds)
     bypasses this check because triggers run with the invoker's privileges
     but SECURITY DEFINER overrides that.

  3. Adds an admin INSERT policy so an existing admin can create profiles
     for other users (e.g., provisioning new users from admin panel).

  4. Documents the canonical recovery SQL — run this if the owner account
     ever loses admin access (e.g., after an accidental seed or role reset).
*/

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. is_admin() — boolean helper, SECURITY DEFINER, bypasses RLS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'platform_admin')
  );
$$;

COMMENT ON FUNCTION public.is_admin IS
  'Returns true if the current authenticated user has admin or platform_admin role. '
  'SECURITY DEFINER — bypasses RLS to avoid recursive policy evaluation.';


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Trigger: protect admin role from accidental client-side downgrades
--    Only fires on UPDATE when role is being changed away from admin.
--    Service-role connections (migrations, Supabase dashboard) are exempt
--    because they bypass RLS and this guard is checked via current_setting.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.prevent_admin_role_downgrade()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only block if: old role was admin-level AND new role is not admin-level
  -- AND the request is coming from an authenticated (non-service-role) session
  IF OLD.role IN ('admin', 'platform_admin')
    AND NEW.role NOT IN ('admin', 'platform_admin')
    AND auth.role() = 'authenticated'
  THEN
    RAISE EXCEPTION
      'Admin role cannot be downgraded via client-side writes. '
      'Use the Supabase dashboard or a service-role migration to change admin roles.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_admin_role ON public.user_profiles;

CREATE TRIGGER protect_admin_role
  BEFORE UPDATE OF role ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_admin_role_downgrade();

COMMENT ON FUNCTION public.prevent_admin_role_downgrade IS
  'Prevents authenticated clients from downgrading admin/platform_admin roles. '
  'Only service-role (migrations, dashboard) can demote admin accounts.';


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Allow admins to INSERT profiles for other users (provisioning)
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admin_insert_any_profile" ON public.user_profiles;

CREATE POLICY "admin_insert_any_profile"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Allow admins to UPDATE any profile (for role provisioning from Admin Hub)
-- ─────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admin_update_any_profile" ON public.user_profiles;

CREATE POLICY "admin_update_any_profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. RECOVERY REFERENCE — run this SQL if owner account ever loses admin role
--    Replace the email if the owner account changes.
--    DO NOT automate this — it must be run manually in Supabase SQL Editor.
-- ─────────────────────────────────────────────────────────────────────────────

/*
  === OWNER ACCOUNT RECOVERY ===
  Run in Supabase SQL Editor → rumdmulxzmjtsplsjngi

  -- Step 1: Restore admin role
  UPDATE public.user_profiles
  SET role = 'platform_admin'
  WHERE id = (SELECT id FROM auth.users WHERE email = 'brucetyndallprofessional@gmail.com');

  -- Step 2: Reset password (if also broken)
  UPDATE auth.users
  SET encrypted_password = crypt('DevAdmin2026!', gen_salt('bf', 10))
  WHERE email = 'brucetyndallprofessional@gmail.com';

  -- Step 3: Verify
  SELECT au.email, up.role, LEFT(au.encrypted_password, 7) as hash_prefix
  FROM auth.users au
  JOIN public.user_profiles up ON au.id = up.id
  WHERE au.email = 'brucetyndallprofessional@gmail.com';
*/
