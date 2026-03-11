-- ai_audit_log — Detailed AI call tracking for security and cost analysis
-- ADD ONLY — never edit existing migrations
--
-- Records every AI edge function invocation, whether successful, blocked,
-- or errored. Complements the generic audit_logs (CTRL-WO-03) with
-- AI-specific fields: credits, tokens, duration, blocked reason.

CREATE TABLE IF NOT EXISTS public.ai_audit_log (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name       TEXT         NOT NULL,  -- task_type or concierge mode
  tier            TEXT         NOT NULL,  -- user subscription tier at time of call
  credits_before  DECIMAL(10,6),          -- balance before deduction (null if blocked)
  credits_after   DECIMAL(10,6),          -- balance after deduction (null if blocked)
  tokens_used     INTEGER,                -- total tokens (in + out)
  duration_ms     INTEGER,                -- wall-clock time of AI call
  status          TEXT         NOT NULL CHECK (status IN ('success', 'blocked', 'error')),
  blocked_reason  TEXT,                   -- null unless status = 'blocked'
  request_meta    JSONB,                  -- additional context (model, feature, etc.)
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_ai_audit_log_user
  ON public.ai_audit_log (user_id);

CREATE INDEX IF NOT EXISTS idx_ai_audit_log_created
  ON public.ai_audit_log (created_at);

CREATE INDEX IF NOT EXISTS idx_ai_audit_log_status
  ON public.ai_audit_log (status);

CREATE INDEX IF NOT EXISTS idx_ai_audit_log_tool
  ON public.ai_audit_log (tool_name);

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE public.ai_audit_log ENABLE ROW LEVEL SECURITY;

-- Users can read their own audit entries
CREATE POLICY "Users can read own AI audit log"
  ON public.ai_audit_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update (edge functions use service role key)
CREATE POLICY "Service role manages AI audit log"
  ON public.ai_audit_log
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
