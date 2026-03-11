/**
 * ai-concierge — Supabase Edge Function
 *
 * Thin adapter that translates the AI Concierge request format into the
 * canonical ai-orchestrator format and forwards it.
 *
 * Security gates applied locally (fail-fast before forwarding):
 *   1. Edge function kill-switch (CTRL-WO-02)
 *   2. JWT authentication
 *   3. Input validation (2000 char max on question)
 *   4. Subscription tier gating (403 — free users blocked)
 *   5. Rate limiting (429 — sliding window per user)
 *
 * Credit deduction happens inside ai-orchestrator (not duplicated here).
 *
 * Supports 5 concierge modes: discovery | protocol | retail | analytics | support
 * Maps each mode → task_type 'chat_concierge' (Tier 4 — sub-500ms latency).
 *
 * Deploy:   supabase functions deploy ai-concierge
 * Secrets:  OPENROUTER_API_KEY (inherited by ai-orchestrator)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { enforceEdgeFunctionEnabled } from '../_shared/edgeControl.ts';
import { corsPreflightResponse, jsonResponse } from '../_shared/cors.ts';
import { authenticateUser } from '../_shared/auth.ts';
import { getUserTier, enforceTierGate } from '../_shared/tier-gate.ts';
import { getTierRateLimit, checkRateLimit } from '../_shared/rate-limit.ts';
import { writeAiAuditLog, writeGenericAuditLog } from '../_shared/ai-audit-log.ts';

const MAX_QUESTION_LENGTH = 2000;

type ConciergeMode = 'discovery' | 'protocol' | 'retail' | 'analytics' | 'support';

const VALID_MODES: ConciergeMode[] = ['discovery', 'protocol', 'retail', 'analytics', 'support'];

interface ConciergeRequest {
  question: string;
  retrievedData: Record<string, unknown[]>;
  mode: string;
  userRole: string;
  contextPage: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

Deno.serve(async (req: Request) => {
  // ── 0. Kill-switch & CORS ───────────────────────────────────────────────────
  const edgeControlResponse = await enforceEdgeFunctionEnabled('ai-concierge', req);
  if (edgeControlResponse) return edgeControlResponse;
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  // ── 1. Authenticate user JWT ────────────────────────────────────────────────
  const authResult = await authenticateUser(req);
  if (authResult instanceof Response) return authResult;
  const { user, authHeader } = authResult;

  // ── 2. Parse and validate request body ──────────────────────────────────────
  let body: ConciergeRequest;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const {
    question,
    retrievedData,
    mode,
    userRole,
    contextPage,
    conversationHistory = [],
  } = body;

  // Validate question
  if (!question || typeof question !== 'string' || !question.trim()) {
    return jsonResponse(
      { error: 'question is required and must be a non-empty string', code: 'invalid_input' },
      400,
    );
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return jsonResponse(
      {
        error: `Question exceeds maximum length of ${MAX_QUESTION_LENGTH} characters`,
        code: 'input_too_long',
        max_length: MAX_QUESTION_LENGTH,
        actual_length: question.length,
      },
      400,
    );
  }

  const resolvedMode: ConciergeMode = VALID_MODES.includes(mode as ConciergeMode)
    ? (mode as ConciergeMode)
    : 'discovery';

  // ── 3. Subscription tier gating (403) ───────────────────────────────────────
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  const userTier = await getUserTier(supabaseAdmin, user.id);

  // Concierge maps to chat_concierge — allowed for starter+
  const tierGateResponse = enforceTierGate(userTier, 'chat_concierge');
  if (tierGateResponse) {
    await writeAiAuditLog(supabaseAdmin, {
      userId: user.id,
      toolName: `concierge_${resolvedMode}`,
      tier: userTier,
      status: 'blocked',
      blockedReason: 'tier_insufficient',
      requestMeta: { mode: resolvedMode, context_page: contextPage },
    });
    await writeGenericAuditLog(supabaseAdmin, {
      userId: user.id,
      action: 'ai.blocked',
      details: {
        reason: 'tier_insufficient',
        user_tier: userTier,
        tool: 'ai-concierge',
        mode: resolvedMode,
      },
    });
    return tierGateResponse;
  }

  // ── 4. Rate limiting (429) ──────────────────────────────────────────────────
  const tierLimit = getTierRateLimit(userTier);
  const rateLimitResponse = await checkRateLimit(supabaseAdmin, user.id, tierLimit);
  if (rateLimitResponse) {
    await writeAiAuditLog(supabaseAdmin, {
      userId: user.id,
      toolName: `concierge_${resolvedMode}`,
      tier: userTier,
      status: 'blocked',
      blockedReason: 'rate_limit_exceeded',
      requestMeta: { tier_limit: tierLimit, mode: resolvedMode },
    });
    await writeGenericAuditLog(supabaseAdmin, {
      userId: user.id,
      action: 'ai.rate_limited',
      details: { tier_limit: tierLimit, tool: 'ai-concierge', mode: resolvedMode },
    });
    return rateLimitResponse;
  }

  // ── 5. Forward to ai-orchestrator ───────────────────────────────────────────
  // Build conversation messages: up to 6 turns of history + current question
  const messages = [
    ...conversationHistory.slice(-6).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: question },
  ];

  const orchestratorUrl = `${supabaseUrl}/functions/v1/ai-orchestrator`;

  let orchRes: Response;
  try {
    orchRes = await fetch(orchestratorUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({
        task_type: 'chat_concierge',
        messages,
        context: retrievedData,
        feature: `concierge_${resolvedMode}`,
        mode: resolvedMode,
        user_role: userRole,
        context_page: contextPage,
      }),
    });
  } catch (err) {
    console.error('ai-orchestrator unreachable:', err);
    return jsonResponse({ error: 'AI service temporarily unavailable' }, 502);
  }

  const orchBody = await orchRes.json();

  if (!orchRes.ok) {
    return jsonResponse(orchBody, orchRes.status);
  }

  // Return in the shape existing frontend callers expect
  return jsonResponse({
    answer: orchBody.answer ?? '',
    mode: resolvedMode,
    // Pass through orchestrator metadata for debugging / analytics
    _meta: {
      tier: orchBody.tier,
      model: orchBody.model,
      tokens_in: orchBody.tokens_in,
      tokens_out: orchBody.tokens_out,
      cost_usd: orchBody.cost_usd,
    },
  });
});
