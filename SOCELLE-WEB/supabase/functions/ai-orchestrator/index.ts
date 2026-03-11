/**
 * ai-orchestrator — Supabase Edge Function
 *
 * The single gateway for ALL AI requests on the Socelle platform.
 * No prompt logic may live in the frontend. This function owns model
 * selection, tier routing, cost accounting, and credit deduction.
 *
 * Security gates (in order):
 *   1. Edge function kill-switch (CTRL-WO-02)
 *   2. JWT authentication
 *   3. Input sanitisation (2000 char limit, tool whitelist, injection stripping)
 *   4. Subscription tier gating (403 — free blocked, starter limited)
 *   5. Feature flag check (CTRL-WO-01)
 *   6. Rate limiting (429 — sliding window per user)
 *   7. Credit balance check (402 — atomic deduction via deduct_credits)
 *
 * 4-Tier Routing (via OpenRouter — single API key for all providers):
 *   Tier 1 — Reasoning   : anthropic/claude-sonnet-4-5         (protocol mapping, gap analysis)
 *   Tier 2 — Long Context : google/gemini-2.5-pro              (large PDF / menu parsing)
 *   Tier 3 — Speed       : openai/gpt-4o-mini                  (summaries, retail attach)
 *   Tier 4 — Latency     : meta-llama/llama-3.3-70b-instruct   (real-time chat, AI Concierge)
 *
 * Deploy:
 *   supabase functions deploy ai-orchestrator
 *
 * Secrets required:
 *   supabase secrets set OPENROUTER_API_KEY=sk-or-...
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { checkFlag } from '../_shared/featureFlags.ts';
import { enforceEdgeFunctionEnabled } from '../_shared/edgeControl.ts';
import { CORS_HEADERS, corsPreflightResponse, jsonResponse } from '../_shared/cors.ts';
import { authenticateUser } from '../_shared/auth.ts';
import { deductCredits, reconcileCost } from '../_shared/credits.ts';
import { getTierRateLimit, checkRateLimit } from '../_shared/rate-limit.ts';
import { getUserTier, enforceTierGate } from '../_shared/tier-gate.ts';
import { sanitizeInput } from '../_shared/input-sanitizer.ts';
import { writeAiAuditLog, writeGenericAuditLog } from '../_shared/ai-audit-log.ts';

// ── Types ─────────────────────────────────────────────────────────────────────

type TaskType =
  | 'protocol_mapping'
  | 'gap_analysis'
  | 'pdf_extraction'
  | 'menu_parse_large'
  | 'menu_parse_small'
  | 'retail_summary'
  | 'plan_summary'
  | 'chat_concierge'
  | 'real_time_feedback'
  | 'messaging_assist'
  | 'brand_strategy';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OrchestratorRequest {
  task_type: TaskType;
  messages: ChatMessage[];
  context?: Record<string, unknown>;
  feature: string;
  mode?: string;
  user_role?: string;
  context_page?: string;
}

interface TierConfig {
  tier: 1 | 2 | 3 | 4;
  model: string;
  cost_per_1k_in: number;
  cost_per_1k_out: number;
  max_tokens: number;
  label: string;
}

// ── Tier definitions ──────────────────────────────────────────────────────────

const TIERS: Record<1 | 2 | 3 | 4, TierConfig> = {
  1: {
    tier: 1,
    model: 'anthropic/claude-sonnet-4-5',
    cost_per_1k_in: 0.003,
    cost_per_1k_out: 0.015,
    max_tokens: 2048,
    label: 'Reasoning',
  },
  2: {
    tier: 2,
    model: 'google/gemini-2.5-pro',
    cost_per_1k_in: 0.00125,
    cost_per_1k_out: 0.005,
    max_tokens: 4096,
    label: 'Long Context',
  },
  3: {
    tier: 3,
    model: 'openai/gpt-4o-mini',
    cost_per_1k_in: 0.00015,
    cost_per_1k_out: 0.0006,
    max_tokens: 1024,
    label: 'Speed',
  },
  4: {
    tier: 4,
    model: 'meta-llama/llama-3.3-70b-instruct',
    cost_per_1k_in: 0.00005,
    cost_per_1k_out: 0.0001,
    max_tokens: 800,
    label: 'Latency',
  },
};

// ── Tier routing ──────────────────────────────────────────────────────────────

function selectTier(taskType: TaskType, contextLength: number): TierConfig {
  switch (taskType) {
    case 'protocol_mapping':
    case 'gap_analysis':
    case 'brand_strategy':
      return TIERS[1];

    case 'pdf_extraction':
    case 'menu_parse_large':
      return TIERS[2];

    case 'menu_parse_small':
      return contextLength > 4000 ? TIERS[2] : TIERS[3];

    case 'retail_summary':
    case 'plan_summary':
      return TIERS[3];

    case 'chat_concierge':
    case 'real_time_feedback':
    case 'messaging_assist':
      return TIERS[4];

    default:
      return TIERS[3];
  }
}

// ── System prompts ────────────────────────────────────────────────────────────

const BASE_SYSTEM = `You are a professional AI assistant for Socelle — a B2B wholesale intelligence platform
connecting service businesses (spas, salons, med spas) with professional brands.

Core rules:
- Answer based ONLY on provided data. Never fabricate product names, prices, or statistics.
- Be concise, practical, and conversational. 2–3 paragraphs max unless summarizing data.
- If data is missing, say so and suggest next steps.
- Use professional spa/wellness industry terminology.
- Format lists with bullet points for readability.`.trim();

const MODE_SYSTEM_PROMPTS: Record<string, string> = {
  discovery: `${BASE_SYSTEM}

DISCOVERY MODE — Help the user find brands, products, or categories.
Focus: surfacing relevant brands, explaining what makes each unique, comparing options, guiding toward brands that fit their practice.`,

  protocol: `${BASE_SYSTEM}

PROTOCOL MODE — Match service menu items to protocols and products.
Focus: protocol-to-product mapping, ingredient compatibility, treatment steps, contraindications, and complete product kits per service.`,

  retail: `${BASE_SYSTEM}

RETAIL MODE — Recommend retail products for client take-home.
Focus: post-treatment home care, retail attach recommendations, product pairings, price points, and revenue-per-client impact.`,

  analytics: `${BASE_SYSTEM}

ANALYTICS MODE — Interpret platform data and performance metrics.
Focus: explaining trends, top/underperformers, revenue insights, and actionable improvement recommendations.`,

  support: `${BASE_SYSTEM}

SUPPORT MODE — Help users understand and use the platform.
Focus: platform features, step-by-step workflows, how-to questions. If you don't know, direct to platform support.`,

  protocol_mapping: `${BASE_SYSTEM}

PROTOCOL MAPPING — Analyze a service menu and map each service to the best-matching protocol.
For each service: identify the closest protocol match, explain the match reasoning, flag any gaps where no protocol exists.
Output structured analysis with match scores (0–100).`,

  gap_analysis: `${BASE_SYSTEM}

GAP ANALYSIS — Identify missing protocols in the service menu that represent revenue opportunities.
For each gap: name the missing protocol, estimate monthly revenue impact, suggest which products are needed.
Be specific with numbers. Prioritize gaps by revenue potential.`,

  plan_summary: `${BASE_SYSTEM}

PLAN SUMMARY — Summarize a completed gap analysis plan for the business owner.
Be encouraging but honest. Lead with the biggest revenue opportunity. Keep it under 150 words.`,

  retail_summary: `${BASE_SYSTEM}

RETAIL ATTACH — Recommend retail products for each identified service.
For each product recommendation: explain why it's recommended, typical retail price, and revenue impact.`,

  messaging_assist: `${BASE_SYSTEM}

MESSAGING — Help compose professional messages between brands and spa/salon owners.
Tone: professional, warm, and concise. Focus on mutual business value.`,
};

function buildSystemPrompt(taskType: TaskType, mode?: string): string {
  if (mode && MODE_SYSTEM_PROMPTS[mode]) return MODE_SYSTEM_PROMPTS[mode];
  if (MODE_SYSTEM_PROMPTS[taskType]) return MODE_SYSTEM_PROMPTS[taskType];
  return BASE_SYSTEM;
}

// ── Cost estimation ───────────────────────────────────────────────────────────

function estimateCost(tierConfig: TierConfig, inputText: string): number {
  const estimatedTokensIn = Math.ceil(inputText.length / 4);
  const estimatedTokensOut = tierConfig.max_tokens * 0.5;
  const cost =
    (estimatedTokensIn / 1000) * tierConfig.cost_per_1k_in +
    (estimatedTokensOut / 1000) * tierConfig.cost_per_1k_out;
  return Math.max(0.000001, parseFloat(cost.toFixed(6)));
}

function actualCost(tierConfig: TierConfig, tokensIn: number, tokensOut: number): number {
  const cost =
    (tokensIn / 1000) * tierConfig.cost_per_1k_in +
    (tokensOut / 1000) * tierConfig.cost_per_1k_out;
  return Math.max(0.000001, parseFloat(cost.toFixed(6)));
}

// ── OpenRouter call ───────────────────────────────────────────────────────────

interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: { content: string };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

async function callOpenRouter(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: ChatMessage[],
  maxTokens: number,
): Promise<OpenRouterResponse> {
  const body = {
    model,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.filter((m) => m.role !== 'system'),
    ],
  };

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://socelle.com',
      'X-Title': 'Socelle AI Orchestrator',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${err}`);
  }

  return res.json() as Promise<OpenRouterResponse>;
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // ── 0. Kill-switch & CORS ───────────────────────────────────────────────────
  const edgeControlResponse = await enforceEdgeFunctionEnabled('ai-orchestrator', req);
  if (edgeControlResponse) return edgeControlResponse;
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  // ── 1. Check secrets ────────────────────────────────────────────────────────
  const openRouterKey = Deno.env.get('OPENROUTER_API_KEY');
  if (!openRouterKey) {
    return jsonResponse({ error: 'AI service not configured. Set OPENROUTER_API_KEY.' }, 503);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // ── 2. Authenticate user JWT ────────────────────────────────────────────────
  const authResult = await authenticateUser(req);
  if (authResult instanceof Response) return authResult;
  const { user } = authResult;

  // ── 3. Parse and sanitise request body ──────────────────────────────────────
  let rawBody: OrchestratorRequest;
  try {
    rawBody = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const sanitized = sanitizeInput(rawBody);
  if (sanitized instanceof Response) return sanitized;

  const { taskType: task_type, messages } = sanitized;
  const context = rawBody.context;
  const feature = rawBody.feature || 'unknown';
  const mode = rawBody.mode;

  // ── 4. Look up subscription tier ────────────────────────────────────────────
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  const userTier = await getUserTier(supabaseAdmin, user.id);

  // ── 5. Subscription tier gating (403) ───────────────────────────────────────
  const tierGateResponse = enforceTierGate(userTier, task_type);
  if (tierGateResponse) {
    await writeAiAuditLog(supabaseAdmin, {
      userId: user.id,
      toolName: task_type,
      tier: userTier,
      status: 'blocked',
      blockedReason: 'tier_insufficient',
      requestMeta: { feature, mode },
    });
    await writeGenericAuditLog(supabaseAdmin, {
      userId: user.id,
      action: 'ai.blocked',
      details: {
        reason: 'tier_insufficient',
        user_tier: userTier,
        task_type,
        feature,
      },
    });
    return tierGateResponse;
  }

  // ── 6. Feature flag check (CTRL-WO-01) ─────────────────────────────────────
  const aiOrchestratorEnabled = await checkFlag({
    supabaseAdmin,
    userId: user.id,
    flagKey: 'AI_ORCHESTRATOR_ENABLED',
    userTier,
  });
  if (!aiOrchestratorEnabled) {
    await writeAiAuditLog(supabaseAdmin, {
      userId: user.id,
      toolName: task_type,
      tier: userTier,
      status: 'blocked',
      blockedReason: 'feature_flag_disabled',
      requestMeta: { flag_key: 'AI_ORCHESTRATOR_ENABLED' },
    });
    await writeGenericAuditLog(supabaseAdmin, {
      userId: user.id,
      action: 'ai.blocked',
      details: {
        reason: 'feature_flag_disabled',
        flag_key: 'AI_ORCHESTRATOR_ENABLED',
        user_tier: userTier,
      },
    });
    return jsonResponse(
      {
        error: 'AI service is currently disabled by feature flag.',
        code: 'feature_disabled',
        flag_key: 'AI_ORCHESTRATOR_ENABLED',
      },
      503,
    );
  }

  // ── 7. Rate limiting (429) ──────────────────────────────────────────────────
  const tierLimit = getTierRateLimit(userTier);
  const rateLimitResponse = await checkRateLimit(supabaseAdmin, user.id, tierLimit);
  if (rateLimitResponse) {
    await writeAiAuditLog(supabaseAdmin, {
      userId: user.id,
      toolName: task_type,
      tier: userTier,
      status: 'blocked',
      blockedReason: 'rate_limit_exceeded',
      requestMeta: { tier_limit: tierLimit, feature },
    });
    await writeGenericAuditLog(supabaseAdmin, {
      userId: user.id,
      action: 'ai.rate_limited',
      details: { tier_limit: tierLimit, feature, task_type },
    });
    return rateLimitResponse;
  }

  // ── 8. Select tier and estimate cost ────────────────────────────────────────
  const contextStr = context ? JSON.stringify(context) : '';
  const allText = messages.map((m) => m.content).join(' ') + contextStr;
  const tierConfig = selectTier(task_type as TaskType, allText.length);
  const estimatedCostUsd = estimateCost(tierConfig, allText);

  // ── 9. Credit balance check (402) ───────────────────────────────────────────
  const startTime = Date.now();
  const creditResult = await deductCredits(supabaseAdmin, {
    userId: user.id,
    amountUsd: estimatedCostUsd,
    provider: 'openrouter',
    model: tierConfig.model,
    tier: tierConfig.tier,
    feature,
  });

  if (creditResult instanceof Response) {
    await writeAiAuditLog(supabaseAdmin, {
      userId: user.id,
      toolName: task_type,
      tier: userTier,
      status: 'blocked',
      blockedReason: 'insufficient_credits',
      requestMeta: {
        estimated_cost_usd: estimatedCostUsd,
        feature,
        model: tierConfig.model,
      },
    });
    await writeGenericAuditLog(supabaseAdmin, {
      userId: user.id,
      action: 'ai.blocked',
      details: {
        reason: 'insufficient_credits',
        estimated_cost_usd: estimatedCostUsd,
        feature,
        task_type,
        model: tierConfig.model,
      },
    });
    return creditResult;
  }

  // ── 10. Build system prompt and call OpenRouter ─────────────────────────────
  const systemPrompt = buildSystemPrompt(task_type as TaskType, mode);
  const contextBlock = contextStr
    ? `\n\n--- PLATFORM DATA ---\n${contextStr}\n--- END DATA ---`
    : '';
  const enrichedSystem = systemPrompt + contextBlock;

  let aiResult: OpenRouterResponse;
  try {
    aiResult = await callOpenRouter(
      openRouterKey,
      tierConfig.model,
      enrichedSystem,
      messages,
      tierConfig.max_tokens,
    );
  } catch (err) {
    const durationMs = Date.now() - startTime;
    console.error('OpenRouter call failed:', err);
    await writeAiAuditLog(supabaseAdmin, {
      userId: user.id,
      toolName: task_type,
      tier: userTier,
      creditsBefore: creditResult.balanceAfter + estimatedCostUsd,
      creditsAfter: creditResult.balanceAfter,
      durationMs,
      status: 'error',
      blockedReason: 'ai_provider_error',
      requestMeta: { feature, model: tierConfig.model },
    });
    await writeGenericAuditLog(supabaseAdmin, {
      userId: user.id,
      action: 'ai.blocked',
      details: {
        reason: 'ai_error',
        feature,
        task_type,
        model: tierConfig.model,
      },
    });
    return jsonResponse(
      {
        error: 'AI service temporarily unavailable. Please try again.',
        code: 'ai_error',
      },
      502,
    );
  }

  // ── 11. Extract usage and compute actual cost ───────────────────────────────
  const durationMs = Date.now() - startTime;
  const tokensIn = aiResult.usage?.prompt_tokens ?? 0;
  const tokensOut = aiResult.usage?.completion_tokens ?? 0;
  const actualCostUsd = actualCost(tierConfig, tokensIn, tokensOut);
  const answer = aiResult.choices?.[0]?.message?.content ?? '';

  // Reconcile cost difference
  const costDelta = actualCostUsd - estimatedCostUsd;
  reconcileCost(supabaseAdmin, user.id, costDelta, aiResult.id);

  // ── 12. Write audit logs ────────────────────────────────────────────────────
  await writeAiAuditLog(supabaseAdmin, {
    userId: user.id,
    toolName: task_type,
    tier: userTier,
    creditsBefore: creditResult.balanceAfter + estimatedCostUsd,
    creditsAfter: creditResult.balanceAfter,
    tokensUsed: tokensIn + tokensOut,
    durationMs,
    status: 'success',
    requestMeta: {
      feature,
      model: tierConfig.model,
      tier_config: tierConfig.tier,
      tokens_in: tokensIn,
      tokens_out: tokensOut,
      cost_usd: actualCostUsd,
      request_id: aiResult.id,
    },
  });
  await writeGenericAuditLog(supabaseAdmin, {
    userId: user.id,
    action: 'ai.request',
    resourceId: aiResult.id,
    details: {
      feature,
      task_type,
      model: tierConfig.model,
      tier: tierConfig.tier,
      user_tier: userTier,
      tokens_in: tokensIn,
      tokens_out: tokensOut,
      cost_usd: actualCostUsd,
    },
  });

  // ── 13. Return structured response ──────────────────────────────────────────
  return jsonResponse({
    answer,
    tier: tierConfig.tier,
    tier_label: tierConfig.label,
    model: tierConfig.model,
    tokens_in: tokensIn,
    tokens_out: tokensOut,
    cost_usd: actualCostUsd,
    balance_remaining: creditResult.balanceAfter,
    request_id: aiResult.id,
  });
});
