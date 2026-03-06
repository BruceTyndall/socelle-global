/*
  # Extend user_role Enum for Multi-Tenancy

  1. Enum Extensions
    - Add 'business_user' to user_role (maps from 'spa_user')
    - Add 'brand_admin' to user_role (for brand admins)
    - Add 'platform_admin' to user_role (for superadmin)

  2. Notes
    - Existing 'spa_user' role continues to work
    - Existing 'admin' role continues to work (will be Naturopathica brand admin)
    - New roles enable multi-tenant architecture
*/

-- Extend user_role enum with new values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    AND enumlabel = 'business_user'
  ) THEN
    ALTER TYPE user_role ADD VALUE 'business_user';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    AND enumlabel = 'brand_admin'
  ) THEN
    ALTER TYPE user_role ADD VALUE 'brand_admin';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    AND enumlabel = 'platform_admin'
  ) THEN
    ALTER TYPE user_role ADD VALUE 'platform_admin';
  END IF;
END $$;