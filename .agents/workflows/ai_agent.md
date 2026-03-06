# AI / CONCIERGE AGENT — Workflow

## 1) Purpose

AI Orchestrator, AI Concierge, and AI Advisor features across web and mobile. Owns the `ai-orchestrator` and `ai-concierge` edge functions, the atomic credit system (`tenant_balances`, `deduct_credits()`, `top_up_credits()` RPCs), and AI-related portal surfaces. All AI calls route through `ai-orchestrator` — no direct LLM calls from client. Commerce flow (cart/checkout/orders) — NEVER MODIFY.

## 2) Authority

- `docs/command/AGENT_SCOPE_REGISTRY.md` §6
- `docs/command/SOCELLE_RELEASE_GATES.md`
- `docs/command/SOCELLE_DATA_PROVENANCE_POLICY.md`
- Doc Gate applies (FAIL 1–7). All outputs must pass.

## 3) Preconditions

**Required reads before any work:**
1. `/.claude/CLAUDE.md`
2. `/docs/command/SOCELLE_CANONICAL_DOCTRINE.md`
3. `/docs/command/AGENT_SCOPE_REGISTRY.md` — §6
4. `/docs/command/SOCELLE_RELEASE_GATES.md`
5. `/docs/command/SOCELLE_DATA_PROVENANCE_POLICY.md` — AI response sourcing, confidence scoring
6. `/docs/command/SITE_MAP.md`
7. `SOCELLE-WEB/docs/build_tracker.md`

**WO ID rule:** WO IDs only valid if present in `SOCELLE-WEB/docs/build_tracker.md`.

## 4) Allowed Paths / Forbidden Paths

**Allowed:**
- `SOCELLE-WEB/supabase/functions/ai-orchestrator/` — Read/write
- `SOCELLE-WEB/supabase/functions/ai-concierge/` — Read/write
- `SOCELLE-WEB/src/pages/business/AIAdvisor.tsx` — Read/write (with WO)
- `SOCELLE-WEB/src/pages/brand/BrandAIAdvisor.tsx` — Read/write (with WO)
- `SOCELLE-MOBILE-main/apps/mobile/lib/features/` — Read/write AI-related features (with WO)
- `supabase/migrations/` — ADD ONLY (credit system schema)

**Forbidden:**
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- `SOCELLE-WEB/supabase/functions/stripe-webhook/` — NEVER MODIFY (payment system)
- Portal pages without explicit WO — DO NOT MODIFY
- Commerce flow (cart/checkout/orders) — NEVER MODIFY
- Direct LLM calls from client code — NEVER (all calls route through `ai-orchestrator`)

## 5) Execution Loop

1. **Identify WO:** Confirm AI-related WO exists in `build_tracker.md`.
2. **Find targets:** Locate `ai-orchestrator`, `ai-concierge` edge functions, AI portal pages, credit system RPCs.
3. **Implement:** Edge function logic, AI response formatting, credit deduction hooks, streaming response setup.
4. **Verify LIVE vs DEMO:** AI features must show real model responses from edge function, or carry DEMO badge if using mock data.
5. **Verify credit system:** Confirm `deduct_credits()` RPC is called before every AI response. No credit bypass.
6. **Produce diffs:** Output exact file paths, line ranges, and diffs for all changes.
7. **Run builds:** Edge function deploys without error. `npx tsc --noEmit` — zero errors (web). `flutter analyze` — zero errors (mobile, if applicable).

## 6) Handoff Protocol

| Scenario | Action |
|---|---|
| AI needs new credit tables | Backend Agent creates migration first → AI Agent wires edge function |
| AI portal page needs layout changes | Hand off to Web Agent |
| Mobile AI feature needs Riverpod state | Hand off to Mobile Agent with edge function contract |
| AI needs data from Intelligence tables | Coordinate with Web Agent (read-only access to `market_signals`) |

**Handoff artifact:** Edge function API contract (endpoint, request/response schema, auth requirements, credit cost per call).

## 7) Proof Checklist

- [ ] WO ID in `build_tracker.md` confirmed
- [ ] AI calls route through `ai-orchestrator` (no direct client→LLM calls)
- [ ] Credit deduction verified via `deduct_credits()` RPC call
- [ ] Atomic credit system not bypassed
- [ ] Edge function deploys without error
- [ ] `npx tsc --noEmit` — zero errors (web changes)
- [ ] `build_tracker.md` updated
- [ ] Doc Gate PASS (all 7 FAIL conditions checked)

## 8) Stop Conditions

- No active WO in `build_tracker.md` (do not build)
- Credit system tables not yet created (wait for Backend Agent migration)
- OpenRouter API key not provisioned (owner must configure — External Setup)
- Stripe webhook modifications requested (REFUSE — NEVER MODIFY)
- Commerce flow modification requested (REFUSE — NEVER MODIFY)
