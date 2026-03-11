import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { corsHeaders } from '../_shared/cors.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// ── Configuration ──────────────────────────────────────────────
const MODEL = 'gpt-4o-mini'; // 2026-best-practice non-preview model
const MAX_OUTPUT_TOKENS = 750;
const MAX_HISTORY_TURNS = 6; // Keep history tight to reduce cost
const MAX_TOOL_CALLS_PER_TURN = 2; // Hard loop cap
const MAX_TOOL_RESULT_ROWS = 5; // Truncation for DB results

// ── In-Memory Ephemeral Cache ──────────────────────────────────
// Note: In Deno edge functions, memory is lost between cold starts, 
// but this helps during burst requests on the same isolate.
const queryCache = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

function getCached(key: string) {
  const hit = queryCache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.data;
  return null;
}

function setCached(key: string, data: any) {
  queryCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ── System Prompt ──────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the SOCELLE Protocol Assistant. Your goal is to help users find products, access intelligence, and checkout securely.

Strict rules for this interaction:
1. Be concise by default. Do not output preamble. Reply directly.
2. If you are uncertain about what the user wants, ask EXACTLY ONE clarifying question and wait for their answer.
3. ALWAYS use tools if querying the database is required.
4. Do not repeat the same tool call with identical arguments if it previously failed or returned empty.
5. If adding to cart is requested, verify if the user specified a variant. If not, and variants exist, ask which one before calling add_to_cart.`;

// ── Structured Output Tools ────────────────────────────────────
const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_products',
      description: 'Search the database for retail and professional products',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'What to search for (e.g., "retinol", "cleanser")' },
          category: { type: 'string', description: 'Optional category filter' },
          max_price: { type: 'number', description: 'Optional max price constraint' },
        },
        required: ['query', 'category', 'max_price'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_intelligence',
      description: 'Search for market signals and industry intelligence protocols',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          topic: { type: 'string', description: 'Topic to research (e.g., "microneedling safety")' },
        },
        required: ['topic'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_to_cart',
      description: 'Add a specific product to the user cart',
      strict: true,
      parameters: {
        type: 'object',
        properties: {
          product_id: { type: 'string', description: 'UUID of the product' },
          variant_id: { type: 'string', description: 'UUID of the variant (if applicable, else empty string)' },
          quantity: { type: 'number', description: 'Amount to add' },
        },
        required: ['product_id', 'variant_id', 'quantity'],
        additionalProperties: false,
      },
    },
  },
];

serve(async (req) => {
  const startTime = Date.now();

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // 1. Healthcheck / Model Verification Endpoint
  if (req.method === 'GET') {
    let openaiStatus = 'unknown';
    // Let's verify our configured model exists via OpenAI /models
    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` }
      });
      if (res.ok) {
        const body = await res.json();
        const found = body.data?.find((m: any) => m.id === MODEL);
        openaiStatus = found ? 'healthy' : 'model_missing';
      } else {
        openaiStatus = 'api_error';
      }
    } catch {
      openaiStatus = 'network_error';
    }

    return new Response(JSON.stringify({ 
      service: 'ai-shopping-assistant', 
      configured_model: MODEL,
      openai_status: openaiStatus
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // We expect the auth header to get the user ID
    const authHeader = req.headers.get('Authorization')!;
    if (!authHeader) throw new Error('Missing Auth Header');
    
    // Create a client for the user to securely interact with RPCs
    const userClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false }
    });
    
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    const body = await req.json();
    let messages = body.messages || [];

    // 2. Hard Cost Controls: Enforce Max Input Tokens (Heuristic via turn slicing)
    // We only keep the System Prompt + the last N turns.
    if (messages.length > MAX_HISTORY_TURNS) {
      messages = messages.slice(-MAX_HISTORY_TURNS);
    }
    
    // Inject system prompt up front
    messages = [{ role: 'system', content: SYSTEM_PROMPT }, ...messages];

    let loopCount = 0;
    const previousToolCalls = new Set<string>();
    let finalContent = null;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    // The core 2-call loop
    while (loopCount <= MAX_TOOL_CALLS_PER_TURN) {
      loopCount++;

      // Optional Semantic cache: cache exact user prompt sequence hash (skipped to keep simple, focusing on tool cache)
      const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          messages,
          tools: TOOLS,
          tool_choice: 'auto',
          max_completion_tokens: MAX_OUTPUT_TOKENS, // Ensure output cap
          temperature: 0.1, // Strict temperature for structured accuracy
        }),
      });

      if (!openAiRes.ok) {
        // Enforce parsing error so jq-like headless failures don't happen silently
        const errorText = await openAiRes.text();
        throw new Error(`OpenAI API failed: ${openAiRes.status} ${errorText}`);
      }

      const aiData = await openAiRes.json();
      
      // Accumulate token usage for observability
      totalInputTokens += aiData.usage?.prompt_tokens || 0;
      totalOutputTokens += aiData.usage?.completion_tokens || 0;

      const responseMessage = aiData.choices[0].message;
      messages.push(responseMessage);

      // If OpenAI doesn't want to use tools anymore, break the loop
      if (!responseMessage.tool_calls || responseMessage.tool_calls.length === 0) {
        finalContent = responseMessage.content;
        break;
      }

      // Execute tools
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

        // Detect repeated identical tool calls to prevent infinite looping
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

        // Routing to implementation
        let resultContent = '';
        let cacheMiss = true;

        if (fnName === 'search_products') {
          const cacheKey = `prod_${args.query}_${args.category}`;
          const cached = getCached(cacheKey);
          if (cached) {
            resultContent = JSON.stringify(cached);
            cacheMiss = false;
          } else {
            const { data } = await supabase
              .from('retail_products')
              .select('id, title, price, in_stock') // Hard Cost Control: Truncate tool results to required columns
              .ilike('title', \`%\${args.query}%\`)
              .limit(MAX_TOOL_RESULT_ROWS); // Hard Cost Control: Cap rows
            
            resultContent = JSON.stringify(data || []);
            setCached(cacheKey, data);
          }
        } 
        else if (fnName === 'search_intelligence') {
          const cacheKey = `intel_${args.topic}`;
          const cached = getCached(cacheKey);
          if (cached) {
            resultContent = JSON.stringify(cached);
            cacheMiss = false;
          } else {
            const { data } = await supabase
              .from('market_signals')
              .select('id, title, summary, confidence')
              .ilike('title', \`%\${args.topic}%\`)
              .limit(MAX_TOOL_RESULT_ROWS);
              
            resultContent = JSON.stringify(data || []);
            setCached(cacheKey, data);
          }
        } 
        else if (fnName === 'add_to_cart') {
           // We use the authenticated user client for RPC calls
           const { data, error } = await userClient.rpc('add_to_local_cart', {
              p_product_id: args.product_id,
              p_variant_id: args.variant_id || null,
              p_quantity: args.quantity
           });
           resultContent = error ? \`Error: \${error.message}\` : JSON.stringify(data || { success: true });
        } 
        else {
          resultContent = 'Error: Unknown function called.';
        }

        // Add tool result to history
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: resultContent,
        });
      }

      // Hard Cost Control limit check
      if (loopCount === MAX_TOOL_CALLS_PER_TURN) {
         messages.push({
             role: 'system',
             content: 'SYSTEM OVERRIDE: Max tool limit reached. Synthesize final answer immediately.'
         });
      }
    }

    const duration = Date.now() - startTime;
    // Estimated cost logic for 4o-mini ($0.15 / 1M input, $0.60 / 1M output)
    const estCostCents = ((totalInputTokens / 1_000_000) * 15 + (totalOutputTokens / 1_000_000) * 60) * 100;

    // Observability Logging
    console.log(JSON.stringify({
      log_type: 'ai_assistant_observability',
      user_id: user.id,
      model: MODEL,
      input_tokens: totalInputTokens,
      output_tokens: totalOutputTokens,
      tool_call_loop_count: loopCount,
      estimated_cost_cents: estCostCents.toFixed(4),
      latency_ms: duration,
    }));

    return new Response(JSON.stringify({
      role: 'assistant',
      content: finalContent
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (e: any) {
    console.error('Edge function fatal error:', e.message);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
