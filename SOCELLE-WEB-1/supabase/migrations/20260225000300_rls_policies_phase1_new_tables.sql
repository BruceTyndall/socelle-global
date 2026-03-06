-- RLS policies for all Phase 1 new tables
-- Covers: user_profiles, brand_interest_signals, business_interest_signals,
--         brand_seed_content, business_seed_content,
--         conversations, messages, message_read_status

-- ─────────────────────────────────────────────────────────────────────────────
-- HELPER: is_platform_admin()
-- Checks if the current user has the platform_admin role
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
      AND role = 'platform_admin'
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. user_profiles
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_profiles: users can read own"
  ON user_profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "user_profiles: platform_admin can read all"
  ON user_profiles FOR SELECT
  USING (public.is_platform_admin());

CREATE POLICY "user_profiles: users can update own"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "user_profiles: users can insert own"
  ON user_profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. brand_interest_signals
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE brand_interest_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brand_interest_signals: brand can read own"
  ON brand_interest_signals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.brand_id = brand_interest_signals.brand_id
    )
  );

CREATE POLICY "brand_interest_signals: business can read own"
  ON brand_interest_signals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.business_id = brand_interest_signals.business_id
    )
  );

CREATE POLICY "brand_interest_signals: platform_admin can read all"
  ON brand_interest_signals FOR SELECT
  USING (public.is_platform_admin());

CREATE POLICY "brand_interest_signals: business user can insert own"
  ON brand_interest_signals FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.business_id = brand_interest_signals.business_id
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. business_interest_signals
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE business_interest_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "business_interest_signals: brand can read own"
  ON business_interest_signals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.brand_id = business_interest_signals.brand_id
    )
  );

CREATE POLICY "business_interest_signals: business can read own"
  ON business_interest_signals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.business_id = business_interest_signals.business_id
    )
  );

CREATE POLICY "business_interest_signals: platform_admin can read all"
  ON business_interest_signals FOR SELECT
  USING (public.is_platform_admin());

CREATE POLICY "business_interest_signals: brand user can insert own"
  ON business_interest_signals FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.brand_id = business_interest_signals.brand_id
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. brand_seed_content
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE brand_seed_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brand_seed_content: brand can read own"
  ON brand_seed_content FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.brand_id = brand_seed_content.brand_id
    )
  );

CREATE POLICY "brand_seed_content: platform_admin can read all"
  ON brand_seed_content FOR SELECT
  USING (public.is_platform_admin());

CREATE POLICY "brand_seed_content: platform_admin can insert"
  ON brand_seed_content FOR INSERT
  WITH CHECK (public.is_platform_admin());

CREATE POLICY "brand_seed_content: platform_admin can update"
  ON brand_seed_content FOR UPDATE
  USING (public.is_platform_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. business_seed_content
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE business_seed_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "business_seed_content: business can read own"
  ON business_seed_content FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.business_id = business_seed_content.business_id
    )
  );

CREATE POLICY "business_seed_content: platform_admin can read all"
  ON business_seed_content FOR SELECT
  USING (public.is_platform_admin());

CREATE POLICY "business_seed_content: platform_admin can insert"
  ON business_seed_content FOR INSERT
  WITH CHECK (public.is_platform_admin());

CREATE POLICY "business_seed_content: platform_admin can update"
  ON business_seed_content FOR UPDATE
  USING (public.is_platform_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. conversations
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations: participants can read"
  ON conversations FOR SELECT
  USING (
    participant_one_id = auth.uid()
    OR participant_two_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.brand_id = conversations.brand_id
    )
  );

CREATE POLICY "conversations: platform_admin can read all"
  ON conversations FOR SELECT
  USING (public.is_platform_admin());

CREATE POLICY "conversations: authenticated can insert"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "conversations: participants can update"
  ON conversations FOR UPDATE
  USING (
    participant_one_id = auth.uid()
    OR participant_two_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.brand_id = conversations.brand_id
    )
    OR public.is_platform_admin()
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. messages
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages: participants can read"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND (
          c.participant_one_id = auth.uid()
          OR c.participant_two_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid()
              AND up.brand_id = c.brand_id
          )
        )
    )
  );

CREATE POLICY "messages: platform_admin can read all"
  ON messages FOR SELECT
  USING (public.is_platform_admin());

CREATE POLICY "messages: participants can insert"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND (
          c.participant_one_id = auth.uid()
          OR c.participant_two_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid()
              AND up.brand_id = c.brand_id
          )
        )
    )
  );

CREATE POLICY "messages: sender can update own"
  ON messages FOR UPDATE
  USING (sender_id = auth.uid() OR public.is_platform_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. message_read_status
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE message_read_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "message_read_status: users can read own"
  ON message_read_status FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "message_read_status: users can insert own"
  ON message_read_status FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "message_read_status: users can update own"
  ON message_read_status FOR UPDATE
  USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- Fix function search_path warnings (mutable search_path security issue)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.slugify(text) SET search_path = public;
ALTER FUNCTION public.set_business_slug() SET search_path = public;
