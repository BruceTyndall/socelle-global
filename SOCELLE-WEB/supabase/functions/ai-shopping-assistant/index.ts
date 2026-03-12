import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { CORS_HEADERS, corsPreflightResponse, jsonResponse } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  // Healthcheck / Model Verification Endpoint
  if (req.method === 'GET') {
    return jsonResponse({ 
      service: 'ai-shopping-assistant',
      status: 'routed_to_orchestrator'
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Auth Header');

    const body = await req.json();

    // Create client to invoke orchestrator
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false }
    });

    // Route request through ai-orchestrator to enforce credit gates
    const { data, error } = await supabase.functions.invoke('ai-orchestrator', {
      body: {
        task_type: 'chat_concierge',
        messages: body.messages || [],
        feature: 'ai-shopping-assistant',
        mode: 'retail'
      }
    });

    if (error) {
       console.error("Orchestrator error:", error);
       return new Response(JSON.stringify({ error: error.message || 'AI Orchestrator Error' }), {
         status: 200,
         headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
       });
    }

    if (data?.error) {
       console.error("Orchestrator backend error:", data.error);
       return new Response(JSON.stringify({ error: data.error }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
       });
    }

    return new Response(JSON.stringify({
      role: 'assistant',
      content: data?.answer || 'No response generated.'
    }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });

  } catch (e: any) {
    console.error('Edge function error:', e.message);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
