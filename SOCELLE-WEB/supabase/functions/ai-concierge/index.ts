/**
 * ai-concierge — Supabase Edge Function
 *
 * Thin adapter that translates the AI Concierge request format into the
 * canonical ai-orchestrator format and forwards it.
 *
 * All model selection, credit deduction, and provider logic now lives in
 * ai-orchestrator. This function is kept as a stable public API endpoint
 * so existing callers do not need to change immediately.
 *
 * Supports 5 concierge modes: discovery | protocol | retail | analytics | support
 * Maps each mode → task_type 'chat_concierge' (Tier 4 — sub-500ms latency).
 *
 * Deploy:   supabase functions deploy ai-concierge
 * Secrets:  OPENROUTER_API_KEY (inherited by ai-orchestrator)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { enforceEdgeFunctionEnabled } from '../_shared/edgeControl.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ConciergeMode = 'discovery' | 'protocol' | 'retail' | 'analytics' | 'support';

interface ConciergeRequest {
  question: string;
  retrievedData: Record<string, unknown[]>;
  mode: string;
  userRole: string;
  contextPage: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  const edgeControlResponse = await enforceEdgeFunctionEnabled('ai-concierge', req);
  if (edgeControlResponse) return edgeControlResponse;
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'Missing authorization' }, 401);
  }

  // Validate the user JWT before forwarding
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
  if (authError || !user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

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

  const resolvedMode: ConciergeMode =
    ['discovery', 'protocol', 'retail', 'analytics', 'support'].includes(mode)
      ? (mode as ConciergeMode)
      : 'discovery';

  // Build conversation messages for the orchestrator.
  // Prepend up to 6 turns of history, then append the current question.
  const messages = [
    ...conversationHistory.slice(-6).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: question },
  ];

  // Forward to ai-orchestrator with full context
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
