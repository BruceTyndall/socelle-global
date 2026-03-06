-- =============================================================================
-- Migration: tenant_balances + deduct_credits
-- Date:      2026-02-28
-- Purpose:   "Banker" credit system — atomic, thread-safe AI cost accounting.
--
-- Philosophy:
--   Every AI request must be accounted for with atomic precision.
--   DECIMAL(10,6) tracks costs to the sixth decimal (GPT-4o-mini / Gemini).
--   Row-level locking via SELECT ... FOR UPDATE prevents double-spending.
-- =============================================================================

-- ── 1. tenant_balances ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tenant_balances (
  id              uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid         NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  -- DECIMAL(10,6): max $9999.999999 — tracks sub-cent AI costs precisely
  credit_balance_usd DECIMAL(10,6) NOT NULL DEFAULT 0.000000,
  lifetime_spent_usd DECIMAL(10,6) NOT NULL DEFAULT 0.000000,
  lifetime_requests  integer      NOT NULL DEFAULT 0,
  last_request_at    timestamptz,
  created_at         timestamptz  NOT NULL DEFAULT now(),
  updated_at         timestamptz  NOT NULL DEFAULT now(),

  CONSTRAINT credit_balance_non_negative CHECK (credit_balance_usd >= 0)
);

CREATE INDEX IF NOT EXISTS idx_tenant_balances_user ON public.tenant_balances(user_id);

ALTER TABLE public.tenant_balances ENABLE ROW LEVEL SECURITY;

-- Users read their own balance; write is service-role only
CREATE POLICY "Users can read own balance"
  ON public.tenant_balances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages balances"
  ON public.tenant_balances FOR ALL
  USING (auth.role() = 'service_role');

-- ── 2. ai_credit_ledger — immutable audit log ────────────────────────────────

CREATE TABLE IF NOT EXISTS public.ai_credit_ledger (
  id              uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Credit delta: negative = deduction, positive = top-up
  amount_usd      DECIMAL(10,6) NOT NULL,
  balance_after   DECIMAL(10,6) NOT NULL,
  -- AI metadata for cost attribution
  provider        text         NOT NULL,  -- 'openrouter' | 'anthropic' | 'openai' | 'google' | 'groq'
  model           text         NOT NULL,  -- e.g. 'claude-3-5-sonnet', 'gpt-4o-mini'
  tier            smallint     NOT NULL,  -- 1=reasoning 2=long-ctx 3=speed 4=latency
  tokens_in       integer      NOT NULL DEFAULT 0,
  tokens_out      integer      NOT NULL DEFAULT 0,
  request_id      text,                   -- upstream request ID for debugging
  feature         text,                   -- 'gap_analysis' | 'protocol_match' | 'retail_attach' etc.
  created_at      timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_ledger_user    ON public.ai_credit_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_ledger_created ON public.ai_credit_ledger(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_ledger_feature ON public.ai_credit_ledger(feature);

ALTER TABLE public.ai_credit_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own ledger"
  ON public.ai_credit_ledger FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages ledger"
  ON public.ai_credit_ledger FOR ALL
  USING (auth.role() = 'service_role');

-- ── 3. deduct_credits — atomic, row-locked credit deduction ──────────────────
--
-- Guarantees:
--   - Runs inside a transaction (SECURITY DEFINER + explicit error on failure)
--   - Uses SELECT ... FOR UPDATE to acquire an exclusive row lock before
--     reading balance — prevents concurrent requests from double-spending.
--   - Raises an exception if balance is insufficient — caller must handle.
--   - Writes an immutable ledger row after each deduction.
--
-- Parameters:
--   p_user_id    — Supabase Auth UUID of the calling user
--   p_amount_usd — Cost in USD (e.g. 0.000120 for a GPT-4o-mini call)
--   p_provider   — AI provider name
--   p_model      — Model identifier
--   p_tier       — Routing tier (1–4)
--   p_tokens_in  — Input token count
--   p_tokens_out — Output token count
--   p_request_id — Upstream request ID (optional, for audit)
--   p_feature    — Product feature that triggered the call
--
-- Returns: remaining balance after deduction

CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id    uuid,
  p_amount_usd DECIMAL(10,6),
  p_provider   text,
  p_model      text,
  p_tier       smallint,
  p_tokens_in  integer  DEFAULT 0,
  p_tokens_out integer  DEFAULT 0,
  p_request_id text     DEFAULT NULL,
  p_feature    text     DEFAULT NULL
)
RETURNS DECIMAL(10,6)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance     DECIMAL(10,6);
  v_new_balance DECIMAL(10,6);
BEGIN
  -- Auto-provision a balance row if the user has never been billed.
  -- Default starting balance is 0 — production top-ups come via the
  -- stripe-webhook Edge Function.
  INSERT INTO public.tenant_balances (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Acquire an exclusive row lock for this user before reading balance.
  -- This is the critical section: concurrent calls for the same user_id
  -- will queue here rather than running in parallel, eliminating races.
  SELECT credit_balance_usd
  INTO   v_balance
  FROM   public.tenant_balances
  WHERE  user_id = p_user_id
  FOR    UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'tenant_balances row not found for user %', p_user_id;
  END IF;

  -- Reject if balance is insufficient
  IF v_balance < p_amount_usd THEN
    RAISE EXCEPTION 'Insufficient credit balance: have $%, need $%',
      v_balance::text, p_amount_usd::text
      USING ERRCODE = 'P0002';  -- custom: no_data / insufficient_funds
  END IF;

  v_new_balance := v_balance - p_amount_usd;

  -- Deduct balance and update lifetime stats
  UPDATE public.tenant_balances
  SET
    credit_balance_usd = v_new_balance,
    lifetime_spent_usd = lifetime_spent_usd + p_amount_usd,
    lifetime_requests  = lifetime_requests + 1,
    last_request_at    = now(),
    updated_at         = now()
  WHERE user_id = p_user_id;

  -- Write immutable audit row
  INSERT INTO public.ai_credit_ledger (
    user_id, amount_usd, balance_after,
    provider, model, tier,
    tokens_in, tokens_out, request_id, feature
  ) VALUES (
    p_user_id, -p_amount_usd, v_new_balance,
    p_provider, p_model, p_tier,
    p_tokens_in, p_tokens_out, p_request_id, p_feature
  );

  RETURN v_new_balance;
END;
$$;

-- ── 4. top_up_credits — service-role only, called from stripe-webhook ─────────

CREATE OR REPLACE FUNCTION public.top_up_credits(
  p_user_id    uuid,
  p_amount_usd DECIMAL(10,6),
  p_request_id text DEFAULT NULL
)
RETURNS DECIMAL(10,6)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_balance DECIMAL(10,6);
BEGIN
  INSERT INTO public.tenant_balances (user_id, credit_balance_usd)
  VALUES (p_user_id, p_amount_usd)
  ON CONFLICT (user_id) DO UPDATE
    SET credit_balance_usd = tenant_balances.credit_balance_usd + EXCLUDED.credit_balance_usd,
        updated_at         = now()
  RETURNING credit_balance_usd INTO v_new_balance;

  INSERT INTO public.ai_credit_ledger (
    user_id, amount_usd, balance_after,
    provider, model, tier, feature, request_id
  ) VALUES (
    p_user_id, p_amount_usd, v_new_balance,
    'stripe', 'top_up', 0, 'billing', p_request_id
  );

  RETURN v_new_balance;
END;
$$;

-- ── 5. updated_at trigger ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_tenant_balances_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER tenant_balances_updated_at
  BEFORE UPDATE ON public.tenant_balances
  FOR EACH ROW EXECUTE FUNCTION public.set_tenant_balances_updated_at();
