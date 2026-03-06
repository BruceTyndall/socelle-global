# AI Orchestrator — 4-Tier Architecture Plan
**Date:** 2026-02-28  
**Status:** Implemented (see `index.ts`). Master planning: `/docs/MASTER_BRAIN_ARCHITECTURE.md` — mandatory for all AI and mobile UX.  
**Location:** `supabase/functions/ai-orchestrator/index.ts`

---

## Core Philosophy

> NO prompt logic in the frontend. The orchestrator is the single gateway for all AI requests.

The frontend sends structured `{ task, context, feature }` — the orchestrator decides which tier, which model, what to charge, and returns structured output.

---

## Provider Strategy

**Single provider: OpenRouter** (`https://openrouter.ai/api/v1`)

OpenRouter is a unified API that routes to every model below under a single API key and billing account. This eliminates N separate API keys and gives unified cost tracking. Set one secret: `OPENROUTER_API_KEY`.

---

## 4-Tier Routing Table

| Tier | Role | Model | Provider | Est. Cost/1K tokens | Use Cases |
|------|------|--------|----------|---------------------|-----------|
| 1 | Reasoning | `anthropic/claude-sonnet-4-5` | Anthropic via OpenRouter | ~$0.003 in / $0.015 out | Protocol mapping, gap analysis, plan orchestration |
| 2 | Long Context | `google/gemini-2.5-pro` | Google via OpenRouter | ~$0.00125 in / $0.005 out | Large PDF parsing, full menu analysis, embedding generation |
| 3 | Speed | `openai/gpt-4o-mini` | OpenAI via OpenRouter | ~$0.00015 in / $0.0006 out | UI summaries, quick answers, retail attach suggestions |
| 4 | Latency | `meta-llama/llama-3.3-70b-instruct` | Groq via OpenRouter | ~$0.00005 in / $0.0001 out | Real-time chat, AI Concierge streaming, sub-500ms responses |

---

## Routing Logic

```
function selectTier(task: OrchestratorTask): Tier {
  switch (task.type) {
    case 'protocol_mapping':   return Tier.REASONING;     // Tier 1
    case 'gap_analysis':       return Tier.REASONING;     // Tier 1
    case 'pdf_extraction':     return Tier.LONG_CONTEXT;  // Tier 2
    case 'menu_parse_large':   return Tier.LONG_CONTEXT;  // Tier 2 (>4K chars)
    case 'menu_parse_small':   return Tier.SPEED;         // Tier 3 (<4K chars)
    case 'retail_summary':     return Tier.SPEED;         // Tier 3
    case 'plan_summary':       return Tier.SPEED;         // Tier 3
    case 'chat_concierge':     return Tier.LATENCY;       // Tier 4
    case 'real_time_feedback': return Tier.LATENCY;       // Tier 4
    default:                   return Tier.SPEED;         // Tier 3 (safe default)
  }
}
```

Escalation rule: If Tier 4/3 returns a low-confidence response (`confidence < 0.7`), automatically escalate to Tier 1 and charge the delta.

---

## Request/Response Contract

### Request (from frontend via `supabase.functions.invoke`)

```typescript
interface OrchestratorRequest {
  task_type: TaskType;           // 'protocol_mapping' | 'gap_analysis' | 'pdf_extraction' | etc.
  messages: ChatMessage[];       // conversation turn(s)
  context?: Record<string, unknown>; // retrieved DB data (protocols, products, etc.)
  feature: string;               // for credit ledger attribution
  stream?: boolean;              // default false; true for chat_concierge only
}
```

### Response

```typescript
interface OrchestratorResponse {
  answer: string;
  tier: 1 | 2 | 3 | 4;
  model: string;
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;              // actual cost deducted
  balance_remaining: number;     // user's balance after deduction
}
```

---

## Credit Deduction Flow

```
1. Orchestrator receives request + user JWT
2. Calls deduct_credits() PostgreSQL function (via service-role client)
   - If balance insufficient → return 402 Payment Required
   - deduct_credits() acquires row lock, deducts, writes ledger row
3. Orchestrator calls OpenRouter
4. On success → response returned to client
5. On failure → credits are NOT refunded in MVP (document this behavior)
   Phase 2: implement idempotency key + compensation transaction
```

---

## Logic Leakage Audit — Items to Move to Orchestrator

The following TypeScript files contain AI/LLM logic that currently runs **in the browser** and must be migrated to this Edge Function:

| Current Location | Leakage Type | Move To |
|-----------------|--------------|---------|
| `src/lib/aiConciergeEngine.ts` | Direct LLM calls via Supabase `ai-concierge` | Already in Edge Function — wire to orchestrator |
| `src/lib/mappingEngine.ts` | Protocol matching (deterministic, keep client-side) | Keep — no LLM |
| `src/lib/gapAnalysisEngine.ts` | Gap scoring (deterministic, keep client-side) | Keep — no LLM |
| `src/lib/planOrchestrator.ts` | Calls `ai-concierge` Edge Function | Already correct |
| `src/lib/pdfExtractionService.ts` | May contain prompt logic | Audit — move if any LLM |
| `src/lib/reportGenerator.ts` | May build LLM prompts | Audit — move prompt construction |

**Rule:** No `fetch('https://api.anthropic.com')` or `fetch('https://openrouter.ai')` calls from `src/`. These belong in `supabase/functions/`.

---

## Implementation Sequence (after plan approval)

1. **Create `supabase/functions/ai-orchestrator/index.ts`**
   - Single Deno handler
   - Auth gate (user JWT → Supabase user)
   - `selectTier()` routing function
   - OpenRouter fetch with model selection
   - `deduct_credits()` RPC call before each request
   - Structured error responses (402 = no credits, 503 = model unavailable)

2. **Update `supabase/functions/ai-concierge/index.ts`**
   - Refactor to call `ai-orchestrator` internally (or fold into orchestrator)
   - Remove direct Anthropic/Gemini keys — use `OPENROUTER_API_KEY` only

3. **Update frontend callers**
   - Replace direct `ai-concierge` invocations with `ai-orchestrator` invocations
   - Frontend only sends `task_type` + `messages` + `context` — never model selection

4. **Set secrets**
   ```bash
   supabase secrets set OPENROUTER_API_KEY=sk-or-...
   # Remove: ANTHROPIC_API_KEY, GOOGLE_GEMINI_API_KEY (no longer needed directly)
   ```

5. **Test with credit deduction**
   - Seed a test user with $1.00 balance via `top_up_credits()`
   - Confirm ledger row created per request
   - Confirm 402 returned when balance = $0

---

## Secrets Required

| Secret Name | Value | Where |
|------------|-------|-------|
| `OPENROUTER_API_KEY` | From openrouter.ai dashboard | Supabase secrets |
| `STRIPE_SECRET_KEY` | Already set | Supabase secrets |
| `SUPABASE_SERVICE_ROLE_KEY` | Already set | Supabase secrets (auto-injected) |

---

*Plan status: APPROVED — ready for TypeScript implementation on next session.*
