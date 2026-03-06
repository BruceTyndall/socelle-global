/*
  # Order return request workflow

  Reseller requests return → brand approves or rejects.
  Refund processing (Stripe) is [POSTPONED]; this adds request/approve state only.
*/

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS return_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS return_status text NOT NULL DEFAULT 'none'
    CHECK (return_status IN ('none', 'requested', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS return_reason text,
  ADD COLUMN IF NOT EXISTS return_resolved_at timestamptz,
  ADD COLUMN IF NOT EXISTS return_resolved_by uuid REFERENCES auth.users(id);

COMMENT ON COLUMN orders.return_status IS 'Return workflow: none → requested (reseller) → approved | rejected (brand). Refund execution is separate (Stripe postponed).';

-- Reseller requests return (must be order creator; status must be none)
CREATE OR REPLACE FUNCTION public.request_return(p_order_id uuid, p_reason text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_order record;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Not authenticated');
  END IF;

  SELECT id, created_by, return_status INTO v_order
  FROM orders WHERE id = p_order_id FOR UPDATE;

  IF v_order.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Order not found');
  END IF;
  IF v_order.created_by != v_uid THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Not your order');
  END IF;
  IF v_order.return_status != 'none' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Return already requested or resolved');
  END IF;

  UPDATE orders
  SET return_requested_at = now(), return_status = 'requested', return_reason = nullif(trim(p_reason), '')
  WHERE id = p_order_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

-- Brand resolves return (must be brand admin for this order)
CREATE OR REPLACE FUNCTION public.resolve_return(p_order_id uuid, p_approve boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_order record;
  v_brand_id uuid;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Not authenticated');
  END IF;

  SELECT o.id, o.brand_id, o.return_status INTO v_order
  FROM orders o
  WHERE o.id = p_order_id FOR UPDATE;

  IF v_order.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Order not found');
  END IF;
  IF v_order.return_status != 'requested' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'No return request pending');
  END IF;

  SELECT brand_id INTO v_brand_id FROM user_profiles WHERE id = v_uid;
  IF v_brand_id IS NULL OR v_brand_id != v_order.brand_id THEN
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = v_uid AND role IN ('admin', 'platform_admin')) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'Not authorized to resolve this return');
    END IF;
  END IF;

  UPDATE orders
  SET return_status = CASE WHEN p_approve THEN 'approved' ELSE 'rejected' END,
      return_resolved_at = now(),
      return_resolved_by = v_uid
  WHERE id = p_order_id;

  RETURN jsonb_build_object('ok', true, 'approved', p_approve);
END;
$$;

COMMENT ON FUNCTION public.request_return(uuid, text) IS 'Reseller requests return for their order. Caller must be order created_by; return_status must be none.';
COMMENT ON FUNCTION public.resolve_return(uuid, boolean) IS 'Brand (or admin) approves or rejects a return request.';
