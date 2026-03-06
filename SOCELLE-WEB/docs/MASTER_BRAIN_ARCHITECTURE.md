# Master Brain — Atomic Intelligence Engine & AI Banker

**Role:** Principal Product Architect & AI Systems Visionary  
**Focus:** High-performance web platform (Vite + React + Supabase).  
**Goal:** A "Master Brain" ecosystem that is **mobile-native in spirit** and **AI-banker in logic**.

> **Stack note:** This codebase uses **Vite + React** (not Next.js). All principles apply: no AI logic in the frontend; single orchestrator; banking layer in Supabase.

---

## 1. The "Master Brain" AI Strategy

We are not building a site; we are building an **Atomic Intelligence Engine**. No AI logic or sensitive prompt engineering is allowed in the frontend.

### Centralized orchestration

- **All AI calls** route through a single Supabase Edge Function: **`ai-orchestrator`**.
- **Location:** `supabase/functions/ai-orchestrator/index.ts`
- **Contract:** Frontend sends `{ task_type, messages, context?, feature }`; orchestrator selects model, deducts credits, calls OpenRouter, returns `{ answer, tier, cost_usd, balance_remaining }`.

### 4-tier master routing (OpenRouter)

| Tier | Role        | Model (OpenRouter)                    | Use cases |
|------|-------------|---------------------------------------|-----------|
| **1** | Reasoning   | Claude Sonnet 4.5                     | Deep logic, protocol mapping, gap analysis |
| **2** | Long context | Gemini 2.5 Pro                      | Large file ingestion, huge context windows |
| **3** | Speed       | GPT-4o-mini                           | UI summaries, general chat, fast interactions |
| **4** | Latency     | Llama 3.3 70B (e.g. via Groq)         | Ultra-low latency, real-time typing, AI Concierge |

- **Single API key:** `OPENROUTER_API_KEY` (set in Supabase secrets).
- **Details:** See `supabase/functions/ai-orchestrator/ARCHITECTURE.md` and `index.ts`.

---

## 2. The "No-Leakage" Atomic Banker

Stop **performance leakage** (losing money on AI costs) by treating the system as a **bank**: every request is accounted for with atomic precision.

### Implemented

- **`tenant_balances`** — Per-user balance and lifetime stats. `credit_balance_usd` is **DECIMAL(10,6)** (sub-cent precision for low-cost models).
- **`ai_credit_ledger`** — Immutable audit log: every deduction and top-up with provider, model, tier, tokens, feature.
- **`deduct_credits()`** — PostgreSQL function (SECURITY DEFINER):
  - **Row-level lock:** `SELECT ... FOR UPDATE` on `tenant_balances` so concurrent requests for the same user do not double-spend.
  - **Transaction:** Deduct + ledger insert in one transaction; on failure, rollback.
  - **Insufficient balance:** Raises exception (ERRCODE P0002); orchestrator returns 402.
- **Migration:** `supabase/migrations/20260228000001_create_tenant_balances_and_credit_deduction.sql`

### Guarantees

- **No ghost deductions:** Deduct and ledger write are in one function; if the insert fails, the update rolls back.
- **Micro-precision:** DECIMAL(10,6) for all credit amounts.
- **Concurrency:** Row lock ensures one logical deduction at a time per user.

### Orchestrator flow (current)

1. Estimate cost from tier + input length.  
2. Call `deduct_credits(estimatedCostUsd)`.  
3. Call OpenRouter.  
4. On success: compute actual cost; if different from estimate, reconcile via `top_up_credits(delta)` (refund or small extra deduct).  
5. Return answer + usage + balance.

*(If OpenRouter fails after deduct, the user was charged but got no answer — MVP behaviour; future: optional refund or retry policy.)*

---

## 3. Groundbreaking "Native-Web" Design

The web app must feel **indistinguishable from a native mobile app** on phones.

### Dumb client policy

- **Heavy work** (PDF parsing, data mapping, AI prompts, complex logic) lives in **Supabase Edge Functions**.
- The frontend **only** handles: auth, routing, rendering, and invoking the orchestrator with structured payloads.

### 2026 mobile-web standards (design tokens)

- **Touch targets:** Minimum **44×44px** for every interactive element (buttons, links, form controls). Use class `touch-target` or Tailwind `min-h-touch min-w-touch`.
- **Safe areas:** Use `env(safe-area-inset-*)` for notched devices; tokens in `index.css` (`--safe-area-*`).
- **Accessibility:** High-contrast tokens **WCAG 2.2 AA** compliant. Primary text on background ≥ 4.5:1; buttons and focus rings meet contrast requirements. See `tailwind.config.js` and `index.css` (e.g. `pro-charcoal`, `pro-light-gray`).
- **Skeleton screens:** All AI-generated content should use skeletons while loading so **Cumulative Layout Shift (CLS) < 0.1**. Use `src/components/ui/Skeleton.tsx` or the shared `Skeleton` component; reserve space for text/blocks before the AI response is rendered.
- **Multi-tenant isolation:** RLS and `tenant_id` (or `user_id`) on all tenant-scoped tables; data from Client A is invisible to Client B.

### Where it’s defined

- **Design tokens:** `tailwind.config.js`, `src/index.css` (including 2026 mobile-web section).
- **Component patterns:** `src/components/ui/`, `index.css` (`.btn-*`, `.card`, etc.).

---

## 4. Immediate Status

| Item | Status | Location |
|------|--------|----------|
| ai-orchestrator scaffold | ✅ Implemented | `supabase/functions/ai-orchestrator/index.ts` |
| 4-tier OpenRouter routing | ✅ Implemented | Same file; TIERS, selectTier(), callOpenRouter() |
| Banking layer (tenant_balances, deduct_credits) | ✅ Implemented | `supabase/migrations/20260228000001_create_tenant_balances_and_credit_deduction.sql` |
| Design tokens (mobile-web 2026) | ✅ Added | `src/index.css` (safe-area, touch-target), `tailwind.config.js` (touch, spacing) |
| No AI in frontend | ✅ Enforced | AI calls only via `supabase.functions.invoke('ai-orchestrator', …)` |

---

## 5. References

- **Orchestrator deep dive:** `supabase/functions/ai-orchestrator/ARCHITECTURE.md`
- **Migration:** `supabase/migrations/20260228000001_create_tenant_balances_and_credit_deduction.sql`
- **Design system:** `docs/platform/DESIGN_PLANS.md`, `docs/platform/UI_UX_SITE_DESIGN_DEEP_DIVE.md`
- **Build state:** `docs/build_tracker.md`

## 6. Wired into master planning (so this happens)

This doc is **mandatory** for any work on AI, credit/billing, or mobile-native UX. It is referenced in:

- **Master Prompt:** Section 22 (Master Brain note under build phases); Section 23 ("When Building AI, Credit Billing, or Mobile-Native UX"); Section 24 (session checklist: read this doc when task touches AI/mobile/credits); Section 25 (reference files table).
- **Build tracker:** PLATFORM SPECS table; weekly review step 3 (confirm alignment when AI/credit/mobile work was done); Decisions log (Master Brain adopted 2026-02-28).
- **DESIGN_PLANS.md:** Section 3.4 (Master Brain mandatory); Section 5 (where design is referenced).
- **ai-orchestrator/ARCHITECTURE.md:** Header points to this doc as master planning source.
