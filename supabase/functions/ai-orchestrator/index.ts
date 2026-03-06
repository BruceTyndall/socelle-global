// ============================================================
// SOCELLE GLOBAL — Edge Function: ai-orchestrator
// ============================================================
// Secure proxy between the Socelle clients (mobile & web) and
// the underlying AI/LLM layer. Handles:
//   1. JWT auth verification (via Supabase)
//   2. Intent parsing from natural language queries
//   3. Product vector similarity search (pgvector)
//   4. Response generation via OpenAI
// ============================================================
// Deploy: supabase functions deploy ai-orchestrator
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

interface OrchestratorRequest {
  query: string;         // Natural language query from the user
  business_id?: string;  // Optional: scope recommendations to a business
  context?: string[];    // Optional: previous conversation turns
}

serve(async (req: Request) => {
  // ── CORS ──────────────────────────────────────────────────
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // ── AUTH VERIFICATION ──────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create a Supabase client to verify the JWT
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── PARSE REQUEST ──────────────────────────────────────
    const body: OrchestratorRequest = await req.json();
    const { query, business_id, context = [] } = body;

    if (!query || query.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Query is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── STEP 1: EMBED THE QUERY (for vector similarity search) ─
    const embeddingRes = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-ada-002",
        input: query,
      }),
    });
    const embeddingData = await embeddingRes.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // ── STEP 2: VECTOR SIMILARITY SEARCH ON PRO_PRODUCTS ───
    const { data: similarProducts, error: searchError } = await supabase.rpc(
      "match_pro_products",
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.75,
        match_count: 5,
      }
    );

    if (searchError) {
      console.error("Vector search error:", searchError);
    }

    const productContext = (similarProducts ?? [])
      .map((p: { name: string; brand: string; category: string; description: string }) =>
        `- ${p.name} by ${p.brand} (${p.category}): ${p.description}`
      )
      .join("\n");

    // ── STEP 3: CALL LLM WITH CONTEXT ──────────────────────
    const systemPrompt = `You are the Socelle AI Concierge — an expert beauty industry advisor helping spa owners and professionals make smart backbar purchasing decisions. You speak with authority, warmth, and precision. 

You have access to Socelle's curated professional product catalog. Based on the spa professional's query, recommend specific products and explain WHY they're the right fit for their business.

${productContext ? `Relevant products from the catalog:\n${productContext}` : "No specific products matched — provide general guidance."}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...context.map((c, i) => ({
        role: i % 2 === 0 ? "user" : "assistant",
        content: c,
      })),
      { role: "user", content: query },
    ];

    const completionRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    const completionData = await completionRes.json();
    const answer = completionData.choices?.[0]?.message?.content ?? "I couldn't generate a response. Please try again.";

    // ── RESPONSE ───────────────────────────────────────────
    return new Response(
      JSON.stringify({
        answer,
        related_products: similarProducts ?? [],
        user_id: user.id,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    console.error("AI Orchestrator error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
