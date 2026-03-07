-- Migration: Subscription Helper Functions
-- Authority: docs/command/SOCELLE_ENTITLEMENTS_PACKAGING.md

-- Get user's current tier slug (defaults to 'free')
CREATE OR REPLACE FUNCTION get_user_tier(p_user_id UUID)
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT sp.slug FROM subscriptions s
     JOIN subscription_plans sp ON s.plan_id = sp.id
     WHERE s.user_id = p_user_id AND s.status IN ('active', 'trialing')
     ORDER BY s.created_at DESC LIMIT 1),
    'free'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user has a specific active add-on
CREATE OR REPLACE FUNCTION user_has_addon(p_user_id UUID, p_addon_slug TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM user_addons ua
    JOIN studio_addons sa ON ua.addon_id = sa.id
    WHERE ua.user_id = p_user_id AND sa.slug = p_addon_slug AND ua.status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check feature access (combines tier + addons + flags)
CREATE OR REPLACE FUNCTION check_feature_access(p_user_id UUID, p_feature_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier TEXT;
  v_flag RECORD;
  v_tier_rank INTEGER;
  v_required_rank INTEGER;
BEGIN
  v_tier := get_user_tier(p_user_id);

  SELECT * INTO v_flag FROM feature_flags WHERE key = p_feature_key;
  IF NOT FOUND THEN RETURN true; END IF;
  IF NOT v_flag.is_enabled THEN RETURN false; END IF;

  -- If addon-gated, check addon
  IF v_flag.required_addon IS NOT NULL THEN
    RETURN user_has_addon(p_user_id, v_flag.required_addon);
  END IF;

  -- If plan-gated, check tier hierarchy
  IF v_flag.required_plan IS NOT NULL THEN
    v_tier_rank := CASE v_tier
      WHEN 'enterprise' THEN 4 WHEN 'business' THEN 3 WHEN 'scale' THEN 3
      WHEN 'professional' THEN 2 WHEN 'growth' THEN 2
      WHEN 'free' THEN 1 ELSE 0 END;
    v_required_rank := CASE v_flag.required_plan
      WHEN 'enterprise' THEN 4 WHEN 'business' THEN 3 WHEN 'scale' THEN 3
      WHEN 'professional' THEN 2 WHEN 'growth' THEN 2
      WHEN 'free' THEN 1 ELSE 0 END;
    RETURN v_tier_rank >= v_required_rank;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Increment usage meter (upserts daily counter)
CREATE OR REPLACE FUNCTION increment_usage(p_user_id UUID, p_feature_key TEXT, p_amount INTEGER DEFAULT 1)
RETURNS INTEGER AS $$
  INSERT INTO usage_meters (user_id, feature_key, period_start, count)
  VALUES (p_user_id, p_feature_key, CURRENT_DATE, p_amount)
  ON CONFLICT (user_id, feature_key, period_start)
  DO UPDATE SET count = usage_meters.count + p_amount, updated_at = now()
  RETURNING count;
$$ LANGUAGE sql SECURITY DEFINER;
