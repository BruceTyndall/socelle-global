/**
 * ai-orchestrator — Supabase Edge Function
 *
 * The single gateway for ALL AI requests on the Socelle platform.
 * No prompt logic may live in the frontend. This function owns model
 * selection, tier routing, cost accounting, and credit deduction.
 *
 * 4-Tier Routing (via OpenRouter — single API key for all providers):
 *   Tier 1 — Reasoning   : anthropic/claude-sonnet-4-5         (protocol mapping, gap analysis)
 *   Tier 2 — Long Context : google/gemini-2.5-pro              (large PDF / menu parsing)
 *   Tier 3 — Speed       : openai/gpt-4o-mini                  (summaries, retail attach)
 *   Tier 4 — Latency     : meta-llama/llama-3.3-70b-instruct   (real-time chat, AI Concierge)
 *
 * Credit Accounting:
 *   Calls deduct_credits() PostgreSQL function (SECURITY DEFINER, row-locked)
 *   before each AI call. Returns 402 if balance is insufficient.
 *
 * Deploy:
 *   supabase functions deploy ai-orchestrator
 *
 * Secrets required:
 *   supabase secrets set OPENROUTER_API_KEY=sk-or-...
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { checkFlag } from '../_shared/featureFlags.ts';

// ── CORS ──────────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  /** Retrieved DB data passed as structured context to the model */
  context?: Record<string, unknown>;
  /** Which product feature triggered this call — written to the credit ledger */
  feature: string;
  /** Concierge mode — used to inject the correct system prompt */
  mode?: string;
  /** User role — controls prompt permissions */
  user_role?: string;
  /** Page the user is on — informs grounding context */
  context_page?: string;
}

interface TierConfig {
  tier: 1 | 2 | 3 | 4;
  model: string;
  /** Cost per 1K input tokens in USD */
  cost_per_1k_in: number;
  /** Cost per 1K output tokens in USD */
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

    // Large menus (>4K chars) escalate to Tier 2
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
  // Mode takes precedence for concierge tasks
  if (mode && MODE_SYSTEM_PROMPTS[mode]) return MODE_SYSTEM_PROMPTS[mode];
  if (MODE_SYSTEM_PROMPTS[taskType]) return MODE_SYSTEM_PROMPTS[taskType];
  return BASE_SYSTEM;
}

// ── Cost estimation ───────────────────────────────────────────────────────────

function estimateCost(tierConfig: TierConfig, inputText: string): number {
  // Rough token estimation: ~4 chars per token
  const estimatedTokensIn = Math.ceil(inputText.length / 4);
  const estimatedTokensOut = tierConfig.max_tokens * 0.5; // conservative 50% utilisation
  const cost =
    (estimatedTokensIn / 1000) * tierConfig.cost_per_1k_in +
    (estimatedTokensOut / 1000) * tierConfig.cost_per_1k_out;
  // Minimum 6-decimal precision, rounded up for safety
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
  // OpenRouter uses OpenAI-compatible chat completions format
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

// ── Rate limit tiers ─────────────────────────────────────────────────────────
// Owner decision #7: 5/min Starter, 15/min Pro, 60/min Enterprise.

const RATE_LIMITS: Record<string, number> = {
  starter: 5,
  pro: 15,
  enterprise: 60,
};

function getTierLimit(subscriptionTier?: string): number {
  const tier = (subscriptionTier ?? 'starter').toLowerCase();
  return RATE_LIMITS[tier] ?? RATE_LIMITS.starter;
}

// ── JSON response helper ──────────────────────────────────────────────────────

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  // ── 1. Check secrets ───────────────────────────────────────────────────────
  const openRouterKey = Deno.env.get('OPENROUTER_API_KEY');
  if (!openRouterKey) {
    return jsonResponse({ error: 'AI service not configured. Set OPENROUTER_API_KEY.' }, 503);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  // ── 2. Authenticate user JWT ───────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'Missing authorization header' }, 401);
  }

  const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
  if (authError || !user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  // ── 3. Parse request body ──────────────────────────────────────────────────
  let body: OrchestratorRequest;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const {
    task_type,
    messages,
    context,
    feature = 'unknown',
    mode,
  } = body;

  if (!task_type || !messages?.length) {
    return jsonResponse({ error: 'task_type and messages are required' }, 400);
  }

  // ── 4. Rate limit check (sliding window per user) ──────────────────────────
  // Look up the user's subscription tier to determine their rate limit.
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  const { data: profileData } = await supabaseAdmin
    .from('user_profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  const userTier = profileData?.subscription_tier ?? 'starter';

  // Server-side feature toggle (CTRL-WO-01).
  const aiOrchestratorEnabled = await checkFlag({
    supabaseAdmin,
    userId: user.id,
    flagKey: 'AI_ORCHESTRATOR_ENABLED',
    userTier,
  });
  if (!aiOrchestratorEnabled) {
    return jsonResponse(
      {
        error: 'AI service is currently disabled by feature flag.',
        code: 'feature_disabled',
        flag_key: 'AI_ORCHESTRATOR_ENABLED',
      },
      503,
    );
  }

  const tierLimit = getTierLimit(userTier);

  const { data: rateLimitResult, error: rateLimitError } = await supabaseAdmin
    .rpc('check_rate_limit', {
      p_user_id: user.id,
      p_tier_limit: tierLimit,
    });

  if (rateLimitError) {
    console.error('Rate limit check error:', rateLimitError.message);
    // Fail open on rate limit infrastructure errors — log but don't block
  } else if (rateLimitResult && !rateLimitResult.allowed) {
    return jsonResponse(
      {
        error: 'Rate limit exceeded',
        code: 'rate_limit_exceeded',
        message: `You have exceeded your rate limit of ${tierLimit} requests per minute. Please wait and try again.`,
        limit: rateLimitResult.limit,
        current_count: rateLimitResult.current_count,
        resets_at: rateLimitResult.resets_at,
      },
      429,
    );
  }

  // ── 5. Select tier based on task + context size ────────────────────────────
  const contextStr = context ? JSON.stringify(context) : '';
  const allText = messages.map((m) => m.content).join(' ') + contextStr;
  const tierConfig = selectTier(task_type, allText.length);

  // ── 6. Estimate cost and pre-check credit balance ──────────────────────────
  // We estimate conservatively before the call. After the call we write the
  // actual cost to the ledger. The pre-check prevents requests that are
  // guaranteed to fail due to insufficient balance.
  const estimatedCostUsd = estimateCost(tierConfig, allText);

  // Call deduct_credits() — this acquires a row-level lock and deducts atomically.
  // It raises a PostgreSQL exception (ERRCODE P0002) if balance is insufficient.
  const { data: balanceAfter, error: creditError } = await supabaseAdmin.rpc('deduct_credits', {
    p_user_id: user.id,
    p_amount_usd: estimatedCostUsd,
    p_provider: 'openrouter',
    p_model: tierConfig.model,
    p_tier: tierConfig.tier,
    p_tokens_in: 0,   // updated post-call via ledger correction
    p_tokens_out: 0,
    p_request_id: null,
    p_feature: feature,
  });

  if (creditError) {
    // P0002 = insufficient funds (set in deduct_credits function)
    const isInsufficientFunds = creditError.message?.toLowerCase().includes('insufficient credit');
    if (isInsufficientFunds) {
      return jsonResponse(
        {
          error: 'Insufficient credit balance',
          code: 'insufficient_credits',
          message: 'Your credit balance is too low for this request. Please top up to continue.',
        },
        402,
      );
    }
    console.error('Credit deduction error:', creditError.message);
    return jsonResponse({ error: 'Billing error — request cancelled' }, 500);
  }

  // ── 7. Build system prompt and call OpenRouter ─────────────────────────────
  const systemPrompt = buildSystemPrompt(task_type, mode);

  // Inject context data as a system-level data block if present
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
    console.error('OpenRouter call failed:', err);
    // On AI failure, log the failed attempt (balance already deducted — MVP behaviour)
    return jsonResponse(
      {
        error: 'AI service temporarily unavailable. Please try again.',
        code: 'ai_error',
      },
      502,
    );
  }

  // ── 8. Extract usage and compute actual cost ───────────────────────────────
  const tokensIn = aiResult.usage?.prompt_tokens ?? 0;
  const tokensOut = aiResult.usage?.completion_tokens ?? 0;
  const actualCostUsd = actualCost(tierConfig, tokensIn, tokensOut);
  const answer = aiResult.choices?.[0]?.message?.content ?? '';

  // Write a correcting ledger entry for the difference between estimated and actual.
  // This keeps the audit log accurate without requiring a compensating transaction.
  const costDelta = actualCostUsd - estimatedCostUsd;
  if (Math.abs(costDelta) > 0.000001) {
    // Non-blocking — best effort reconciliation
    supabaseAdmin.rpc('top_up_credits', {
      p_user_id: user.id,
      // Positive delta = we over-charged; refund the difference.
      // Negative delta = we under-charged; deduct more (rare with conservative estimate).
      p_amount_usd: -costDelta,
      p_request_id: aiResult.id,
    }).then(({ error }) => {
      if (error) console.warn('Cost reconciliation failed:', error.message);
    });
  }

  // ── 9. Return structured response ─────────────────────────────────────────
  return jsonResponse({
    answer,
    tier: tierConfig.tier,
    tier_label: tierConfig.label,
    model: tierConfig.model,
    tokens_in: tokensIn,
    tokens_out: tokensOut,
    cost_usd: actualCostUsd,
    balance_remaining: typeof balanceAfter === 'number' ? balanceAfter : null,
    request_id: aiResult.id,
  });
});
