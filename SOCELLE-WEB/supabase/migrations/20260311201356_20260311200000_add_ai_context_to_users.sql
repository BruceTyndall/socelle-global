-- Add AI Context to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS ai_context jsonb DEFAULT '{}'::jsonb;

-- Add comment
COMMENT ON COLUMN user_profiles.ai_context IS 'Store persistent LLM memory for the AI Concierge (e.g., preferences, spa size, buying habits).';

-- Create an RPC to safely merge new memory context
CREATE OR REPLACE FUNCTION merge_user_ai_context(p_user_id uuid, p_new_context jsonb)
RETURNS jsonb AS $$
DECLARE
  v_current_context jsonb;
  v_merged_context jsonb;
BEGIN
  -- Check permission
  IF auth.uid() != p_user_id AND NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized to modify this user context.';
  END IF;

  SELECT ai_context INTO v_current_context 
  FROM user_profiles 
  WHERE id = p_user_id;

  IF v_current_context IS NULL THEN
    v_current_context := '{}'::jsonb;
  END IF;

  v_merged_context := v_current_context || p_new_context;

  UPDATE user_profiles 
  SET ai_context = v_merged_context
  WHERE id = p_user_id;

  RETURN v_merged_context;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the authenticated role
GRANT EXECUTE ON FUNCTION merge_user_ai_context(uuid, jsonb) TO authenticated;
