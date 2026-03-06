/*
  # get_or_create_order_conversation — Order-linked messages

  Returns (or creates) the conversation thread for an order so reseller and brand
  can message about that order. Caller must be the order creator (reseller) or a
  brand user for the order's brand.
*/

CREATE OR REPLACE FUNCTION public.get_or_create_order_conversation(p_order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_order record;
  v_brand_user_id uuid;
  v_p1 uuid;
  v_p2 uuid;
  v_conv_id uuid;
  v_existing record;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Not authenticated');
  END IF;

  SELECT o.id, o.brand_id, o.created_by, o.order_number
  INTO v_order
  FROM orders o
  WHERE o.id = p_order_id;

  IF v_order.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Order not found');
  END IF;

  -- Caller must be reseller (order creator) or a brand user for this order
  IF v_order.created_by != v_uid AND NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.id = v_uid AND up.brand_id = v_order.brand_id
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Not authorized to message about this order');
  END IF;

  -- Existing order-linked conversation?
  SELECT id INTO v_existing
  FROM conversations
  WHERE type = 'order_linked' AND order_id = p_order_id
  LIMIT 1;

  IF v_existing.id IS NOT NULL THEN
    RETURN jsonb_build_object('ok', true, 'conversation_id', v_existing.id, 'created', false);
  END IF;

  -- One brand user (any with this brand_id)
  SELECT id INTO v_brand_user_id
  FROM user_profiles
  WHERE brand_id = v_order.brand_id
    AND role IN ('brand_admin', 'admin', 'platform_admin')
  LIMIT 1;

  IF v_brand_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'No brand user found for this order');
  END IF;

  v_p1 := LEAST(v_brand_user_id, v_order.created_by);
  v_p2 := GREATEST(v_brand_user_id, v_order.created_by);

  INSERT INTO conversations (
    type, order_id, brand_id, participant_one_id, participant_two_id,
    subject, last_message_at, last_message_preview
  ) VALUES (
    'order_linked',
    p_order_id,
    v_order.brand_id,
    v_p1,
    v_p2,
    'Order #' || COALESCE(v_order.order_number, v_order.id::text),
    NULL,
    NULL
  )
  RETURNING id INTO v_conv_id;

  RETURN jsonb_build_object('ok', true, 'conversation_id', v_conv_id, 'created', true);
END;
$$;

COMMENT ON FUNCTION public.get_or_create_order_conversation(uuid) IS
  'Returns or creates the order_linked conversation for an order. Caller must be order created_by or a brand user for order.brand_id.';
