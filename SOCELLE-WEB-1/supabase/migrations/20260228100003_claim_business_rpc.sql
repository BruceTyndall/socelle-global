/*
  # claim_business RPC + anon read unverified businesses

  1. RPC claim_business(p_business_id): authenticated user claims unverified business;
     sets claimed_by, claimed_at, verification_status = 'pending_claim', user_profiles.business_id.
  2. RLS: allow anon to SELECT businesses where verification_status = 'unverified'
     so /claim/business/:slug can load business by slug.
*/

-- Allow anon to read unverified businesses (for claim page)
CREATE POLICY "Anonymous users can read unverified businesses for claim"
  ON businesses FOR SELECT
  TO anon
  USING (verification_status = 'unverified');

CREATE OR REPLACE FUNCTION public.claim_business(p_business_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_biz record;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Not authenticated');
  END IF;

  SELECT id, verification_status INTO v_biz
  FROM businesses
  WHERE id = p_business_id
  FOR UPDATE;

  IF v_biz.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Business not found');
  END IF;

  IF v_biz.verification_status != 'unverified' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Business is already claimed or verified');
  END IF;

  UPDATE businesses
  SET
    claimed_by = v_uid,
    claimed_at = now(),
    verification_status = 'pending_claim',
    updated_at = now()
  WHERE id = p_business_id;

  INSERT INTO user_profiles (id, role, business_id, updated_at)
  VALUES (v_uid, 'business_user', p_business_id, now())
  ON CONFLICT (id) DO UPDATE
  SET
    role = 'business_user',
    brand_id = NULL,
    business_id = p_business_id,
    updated_at = now();

  RETURN jsonb_build_object('ok', true, 'business_id', p_business_id);
END;
$$;

COMMENT ON FUNCTION public.claim_business(uuid) IS
  'Claims an unverified business (salon/spa/medspa) for the current user. Sets claimed_by, claimed_at, verification_status = pending_claim, and links user_profiles to this business.';
