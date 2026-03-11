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
import { ORCHESTRATOR_TOOLS } from './tools.ts';

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
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_calls?: any[];
  tool_call_id?: string;
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
    case 'chat_concierge':
    case 'real_time_feedback':
    case 'messaging_assist':
      // The user mandated gpt-4o-mini as the default model.
      return TIERS[3];

    default:
      return TIERS[3];
  }
}

// ── System prompts ────────────────────────────────────────────────────────────

const BASE_SYSTEM = `You are an expert AI consultant and continuous-learning research assistant for Socelle — a B2B wholesale intelligence platform connecting service businesses (spas, salons, med spas) with professional brands.

Core Rules & Fallback Priority:
1. **Priority 1 (Internal Data):** Always prioritize answering with the provided platform/internal data first. Never fabricate product names, prices, or statistics.
2. **Priority 2 (External Research):** If platform data is missing, incomplete, or the user asks for industry trends/best practices, you MUST proactively use the \`search_web\` tool to synthesize a well-informed answer.
3. **Priority 3 (Support Escalation):** If NO internal or external data can answer the question (or if it's a direct account/billing/tech support issue), you must warmly apologize and explicitly direct the user to email support@socelle.com. NEVER say "I don't know" without offering the support email.

Style Guidelines:
- Be helpful, conversational, and act as a leading expert in the spa, aesthetic, and wellness industry.
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
    message: { 
      content: string | null;
      tool_calls?: Array<{
        id: string;
        type: 'function';
        function: { name: string; arguments: string };
      }>;
    };
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
  availableTools: any[] = ORCHESTRATOR_TOOLS,
  reqId: string,
): Promise<OpenRouterResponse> {
  console.log(`[${reqId}] callOpenRouter start: model=${model}`);
  const callStart = Date.now();
  const body: any = {
    model,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.filter((m) => m.role !== 'system'),
    ],
  };

  if (model === 'openai/gpt-4o-mini') {
    if (availableTools.length > 0) {
      body.tools = availableTools;
      body.tool_choice = 'auto';
    }
  }

  let cleanKey = apiKey.replace(/[^\x20-\x7E]/g, '').trim();
  if (cleanKey.startsWith('sk-sk-')) {
    cleanKey = cleanKey.replace('sk-sk-', 'sk-');
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cleanKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://socelle.com',
        'X-Title': 'Socelle AI Orchestrator',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenRouter error ${res.status}: ${err}`);
    }

    console.log(`[${reqId}] callOpenRouter end: duration=${Date.now() - callStart}ms`);
    return res.json() as Promise<OpenRouterResponse>;
  } catch (err: any) {
    console.log(`[${reqId}] callOpenRouter failed: duration=${Date.now() - callStart}ms, err=${err.message}`);
    throw err;
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

async function processAiRequest(req: Request, reqId: string): Promise<Response> {
  try {
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

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
       return jsonResponse({ error: 'System environment variables missing' }, 500);
    }

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

    // ── 4. Look up subscription tier & User Context ────────────────────────────
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  const userTier = await getUserTier(supabaseAdmin, user.id);
  
  const { data: userProfile } = await supabaseAdmin
    .from('user_profiles')
    .select('ai_context')
    .eq('id', user.id)
    .single();
    
  const userAiContext = userProfile?.ai_context || {};

  // ── 5. Subscription tier gating (403) ───────────────────────────────────────
  const tierGateResponse = enforceTierGate(userTier, task_type);
  if (tierGateResponse) {
    if (user.id !== 'guest') {
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
    }
    return tierGateResponse;
  }

  // ── 6. Feature flag check (CTRL-WO-01) ─────────────────────────────────────
  const aiOrchestratorEnabled = await checkFlag({
    supabaseAdmin,
    userId: user.id !== 'guest' ? user.id : '00000000-0000-0000-0000-000000000000',
    flagKey: 'AI_ORCHESTRATOR_ENABLED',
    userTier,
  });
  if (!aiOrchestratorEnabled) {
    if (user.id !== 'guest') {
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
    }
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
  let rateLimitResponse = null;
  // Rate limit by IP instead of UUID for guests (stubbed for now to allow pass-through)
  if (user.id !== 'guest') {
    rateLimitResponse = await checkRateLimit(supabaseAdmin, user.id, tierLimit);
  }
  
  if (rateLimitResponse) {
    if (user.id !== 'guest') {
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
    }
    return rateLimitResponse;
  }

  // ── 8. Select tier and estimate cost ────────────────────────────────────────
  const contextStr = context ? JSON.stringify(context) : '';
  const allText = messages.map((m) => m.content).join(' ') + contextStr;
  const tierConfig = selectTier(task_type as TaskType, allText.length);
  const estimatedCostUsd = estimateCost(tierConfig, allText);

  // ── 9. Credit balance check (402) ───────────────────────────────────────────
  const startTime = Date.now();
  let creditResult = { balanceAfter: 999 }; // Dummy balance for guests
  
  if (user.id !== 'guest') {
    const deductRes = await deductCredits(supabaseAdmin, {
      userId: user.id,
      amountUsd: estimatedCostUsd,
      provider: 'openrouter',
      model: tierConfig.model,
      tier: tierConfig.tier,
      feature,
    });

    if (deductRes instanceof Response) {
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
      return deductRes;
    }
    creditResult = deductRes;
  }

  const systemPrompt = buildSystemPrompt(task_type as TaskType, mode);
  const contextBlock = contextStr
    ? `\n\n--- PLATFORM DATA ---\n${contextStr}\n--- END DATA ---`
    : '';
  const memoryBlock = Object.keys(userAiContext).length > 0
    ? `\n\n--- PERSISTENT USER MEMORY ---\n${JSON.stringify(userAiContext, null, 2)}\n(Use this context to inform your recommendations)\n--- END MEMORY ---`
    : '';
    
  const enrichedSystem = systemPrompt + contextBlock + memoryBlock;

  let aiResult: OpenRouterResponse | null = null;
  let finalAnswer = '';
  let loopCount = 0;
  const previousToolCalls = new Set<string>();

  // Use the verified user JWT to create an authenticated client for tools (like add_to_cart)
  const authHeader = req.headers.get('Authorization');
  const userClient = createClient(supabaseUrl, supabaseServiceKey, {
    global: { headers: { Authorization: authHeader || '' } },
    auth: { persistSession: false }
  });

  const MAX_TOOL_CALLS = 2;

  // Dynamically strip redundant retrieval tools if the frontend already supplied the data
  const availableTools = ORCHESTRATOR_TOOLS.filter(tool => {
    if (contextStr) {
      if (tool.function.name === 'search_products' || tool.function.name === 'search_intelligence') {
        return false;
      }
    }
    return true;
  });

  try {
    while (loopCount <= MAX_TOOL_CALLS) {
      loopCount++;

      const toolExecStart = Date.now();
      console.log(`[${reqId}] loop ${loopCount} OpenAI decision start`);

      aiResult = await callOpenRouter(
        openRouterKey,
        tierConfig.model,
        enrichedSystem,
        messages,
        tierConfig.max_tokens,
        availableTools,
        reqId
      );

      console.log(`[${reqId}] loop ${loopCount} OpenAI decision end`);

      const responseMessage = aiResult.choices?.[0]?.message;
      if (!responseMessage) {
        throw new Error('No message returned from OpenRouter');
      }

      // 1. If no tool calls, we are done
      if (!responseMessage.tool_calls || responseMessage.tool_calls.length === 0) {
        finalAnswer = responseMessage.content ?? '';
        break;
      }

      // 2. We have tool calls. Push the assistant's request to messages array
      messages.push({
        role: 'assistant',
        content: responseMessage.content || '',
        tool_calls: responseMessage.tool_calls
      });

      // 3. Execute each tool
      for (const toolCall of responseMessage.tool_calls) {
        const fnName = toolCall.function.name;
        const argString = toolCall.function.arguments;

        let args;
        try {
          args = JSON.parse(argString);
        } catch {
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: 'Error: invalid JSON arguments generated. Retry with valid schema.',
          });
          continue;
        }

        const callSignature = `${fnName}:${argString}`;
        if (previousToolCalls.has(callSignature)) {
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: 'Error: Duplicate tool call detected. Do not call the same tool with identical arguments.',
          });
          continue;
        }
        previousToolCalls.add(callSignature);

        console.log(`[${reqId}] loop ${loopCount} tool exec start: ${fnName}`);
        const singleToolExecStart = Date.now();
        let resultContent = '';

        if (fnName === 'search_products') {
          const { data } = await supabaseAdmin
            .from('retail_products')
            .select('id, title, price, in_stock')
            .ilike('title', `%${args.query}%`)
            .limit(5);
          resultContent = JSON.stringify(data || []);
        } 
        else if (fnName === 'search_intelligence') {
          const { data } = await supabaseAdmin
            .from('market_signals')
            .select('id, title, summary, confidence')
            .ilike('title', `%${args.topic}%`)
            .limit(5);
          resultContent = JSON.stringify(data || []);
        } 
        else if (fnName === 'add_to_cart') {
           const { data, error } = await userClient.rpc('add_to_local_cart', {
              p_product_id: args.product_id,
              p_variant_id: args.variant_id || null,
              p_quantity: args.quantity
           });
           resultContent = error ? `Error: ${error.message}` : JSON.stringify(data || { success: true });
        } 
        else if (fnName === 'save_user_context') {
           const { data, error } = await supabaseAdmin.rpc('merge_user_ai_context', {
             p_user_id: user.id,
             p_new_context: { [Date.now().toString()]: args.key_fact }
           });
           resultContent = error ? `Error saving context: ${error.message}` : `Success: Remembered "${args.key_fact}"`;
        }
        else if (fnName === 'search_web') {
           try {
             const braveApiKey = Deno.env.get('BRAVE_SEARCH_API_KEY');
             if (!braveApiKey) {
               resultContent = JSON.stringify([{ title: "Brave API Key Missing", description: "Search is currently offline in this environment." }]);
             } else {
               const searchRes = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(args.query)}`, {
                 headers: {
                   "Accept": "application/json",
                   "Accept-Encoding": "gzip",
                   "X-Subscription-Token": braveApiKey
                 }
               });
               if (!searchRes.ok) throw new Error(`Search failed: ${searchRes.status}`);
               const searchData = await searchRes.json();
               
               // Extract top 3 web results to keep context small
               const topResults = searchData.web?.results?.slice(0, 3).map((r: any) => ({
                 title: r.title,
                 description: r.description,
                 url: r.url
               })) || [];
               
               resultContent = JSON.stringify(topResults);
             }
           } catch (e: any) {
             resultContent = `Error performing web search: ${e.message}`;
           }
        }
        else {
          resultContent = 'Error: Unknown function called.';
        }

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: resultContent,
        });
      }

      if (loopCount === MAX_TOOL_CALLS) {
         messages.push({
             role: 'system',
             content: 'SYSTEM OVERRIDE: Max tool limit reached. Synthesize final answer immediately.'
         });
      }
    }
  } catch (err) {
    const durationMs = Date.now() - startTime;
    console.error('OpenRouter call failed:', err);
    
    if (user.id !== 'guest') {
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
    }
    return jsonResponse(
      {
        error: `AI service temporarily unavailable. Backend Error: ${err instanceof Error ? err.message : String(err)}`,
        code: 'ai_error',
        debug_key_len: openRouterKey.length,
        debug_key_prefix: openRouterKey.substring(0, 5),
      },
      200,
    );
  }

  // ── 11. Extract usage and compute actual cost ───────────────────────────────
  const durationMs = Date.now() - startTime;
  // Total tokens accumulated across loops is tricky here because aiResult only has the final usage.
  // For cost calculation, we will use the final aiResult.usage. 
  const tokensIn = aiResult?.usage?.prompt_tokens ?? 0;
  const tokensOut = aiResult?.usage?.completion_tokens ?? 0;
  const actualCostUsd = actualCost(tierConfig, tokensIn, tokensOut);
  const answer = finalAnswer;

  // Reconcile cost difference
  const costDelta = actualCostUsd - estimatedCostUsd;
  if (aiResult?.id && user.id !== 'guest') reconcileCost(supabaseAdmin, user.id, costDelta, aiResult.id);

  // ── 12. Write audit logs ────────────────────────────────────────────────────
  if (user.id !== 'guest') {
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
        request_id: aiResult?.id || 'unknown',
      },
    });
    await writeGenericAuditLog(supabaseAdmin, {
      userId: user.id,
      action: 'ai.request',
      resourceId: aiResult?.id || 'unknown',
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
  }

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
    request_id: aiResult?.id || 'unknown',
  });
  
  } catch (err: any) {
    console.error(`[${reqId}] Unhandled Edge Function Exception:`, err);
    return jsonResponse({ error: `Unhandled Edge Function Exception: ${err.message}`, request_id: reqId }, 200);
  }
}

Deno.serve(async (req: Request) => {
  const reqId = req.headers.get('x-request-id') || crypto.randomUUID();
  console.log(`[${reqId}] Received ${req.method} /ai-orchestrator`);
  
  const timeoutPromise = new Promise<Response>((_, reject) => {
    setTimeout(() => reject(new Error('timeout_9s')), 9000);
  });

  try {
    const res = await Promise.race([processAiRequest(req, reqId), timeoutPromise]);
    console.log(`[${reqId}] Sending response status=${res.status}`);
    return res;
  } catch (err: any) {
    if (err.message === 'timeout_9s') {
      console.warn(`[${reqId}] Edge function 9s hard timeout exceeded.`);
      return jsonResponse({
        error: 'Processing taking too long.',
        code: 'timeout',
        request_id: reqId,
        status: 'processing'
      }, 202);
    }
    console.error(`[${reqId}] Fatal error strictly in serve block:`, err);
    return jsonResponse({ error: 'Internal Server Error' }, 500);
  }
});
