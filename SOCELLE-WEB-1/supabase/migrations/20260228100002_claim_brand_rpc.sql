/*
  # claim_brand RPC + anon read unverified brands

  1. RPC claim_brand(p_brand_id): authenticated user claims unverified brand;
     sets claimed_by, claimed_at, verification_status = 'pending_claim', user_profiles.brand_id.
  2. RLS: allow anon to SELECT brands where is_published OR verification_status = 'unverified'
     so public storefront and /claim/brand/:slug can load unverified brand by slug.
*/

-- Allow anon to read unverified brands (for public storefront and claim page)
DROP POLICY IF EXISTS "Anonymous users can view published brands" ON brands;
CREATE POLICY "Anonymous users can view published or unverified brands"
  ON brands FOR SELECT
  TO anon
  USING (is_published = true OR verification_status = 'unverified');

CREATE OR REPLACE FUNCTION public.claim_brand(p_brand_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_brand record;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Not authenticated');
  END IF;

  SELECT id, verification_status INTO v_brand
  FROM brands
  WHERE id = p_brand_id
  FOR UPDATE;

  IF v_brand.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Brand not found');
  END IF;

  IF v_brand.verification_status != 'unverified' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Brand is already claimed or verified');
  END IF;

  UPDATE brands
  SET
    claimed_by = v_uid,
    claimed_at = now(),
    verification_status = 'pending_claim',
    updated_at = now()
  WHERE id = p_brand_id;

  INSERT INTO user_profiles (id, role, brand_id, updated_at)
  VALUES (v_uid, 'brand_admin', p_brand_id, now())
  ON CONFLICT (id) DO UPDATE
  SET
    role = 'brand_admin',
    business_id = NULL,
    brand_id = p_brand_id,
    updated_at = now();

  RETURN jsonb_build_object('ok', true, 'brand_id', p_brand_id);
END;
$$;

COMMENT ON FUNCTION public.claim_brand(uuid) IS
  'Claims an unverified brand for the current user. Sets claimed_by, claimed_at, verification_status = pending_claim, and links user_profiles to this brand.';
