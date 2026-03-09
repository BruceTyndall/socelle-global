# SOCELLE: Autonomous Core Intelligence Mandate

**Role:** Lead Full-Stack Architect (Autonomous Mode).  
**Source documents:** `/docs/SOCELLE_MASTER_PROMPT_FINAL.md`, `/docs/build_tracker.md`, `PLANNED_VS_BUILT.md`.

**Current mode:** Payment bypass active. Focus is **Master Brain** and **Identity Bridge** only. Do not implement or block on Stripe, RevenueCat, or subscriptions.

---

## 1. The "Payment Bypass" Protocol

- **Freeze all billing:** Do not implement Stripe, RevenueCat, or the `subscriptions` table yet.
- **Mock premium status:** Globally bypass all subscription guards. Assume all users have PRO tier access.
- **No interruption:** If a component (e.g. `PaywallGate.tsx`, `UpgradeGate.tsx`) blocks a feature, it is refactored to allow access temporarily so development of the 7 Lifestyle Layers and AI core can continue.
- **Reversible:** Bypass is controlled by a single flag (`PAYMENT_BYPASS` in `src/lib/paymentBypass.ts` or `VITE_PAYMENT_BYPASS`). When payments are ready, set to `false` and restore guards.

---

## 2. The Groundbreaking Missions (Re-Prioritized)

With payments on ice, redirect all autonomous energy to:

| Priority | Mission | Status / Notes |
|----------|---------|----------------|
| 1 | **Master Brain (Edge Functions)** | All AI logic in Supabase Edge Functions; no logic leakage in frontend. |
| 2 | **4-Tier AI Orchestrator** | `ai-orchestrator` routes Claude (Reasoning), Gemini (Context), GPT (Speed), Groq (Latency) via OpenRouter. |
| 3 | **No-Leakage Banker** | Atomic `deduct_credits` SQL; track cost of every AI call to 6th decimal place. |
| 4 | **Identity Bridge** | `firebase_uid_map` lookup table (Web) — maps Firebase UID ↔ Supabase user ID so Mobile and Web backends connect. Migration: `20260227000001_create_firebase_uid_map.sql`. |
| 5 | **UI/UX refinement** | Gold button contrast (text → #1A1714); PlanWizard race condition fixed; 2026 mobile-web (44px touch, safe-area, WCAG 2.2 AA, skeletons). |

---

## 3. Autonomous Workflow

1. Read `/docs/build_tracker.md`.
2. Treat all **Tier 1 Payment** tasks (Stripe checkout, Stripe Connect payouts, subscription/RevenueCat) as **[POSTPONED]**.
3. Select the next **Intelligence** or **Architecture** task (Master Brain, Identity Bridge, orchestrator, banker, UI fixes).
4. Execute until functional.
5. Update `/docs/build_tracker.md` with progress and move to the next item.

---

## 4. What "Done" Looks Like for This Phase

- **Paywall:** Technically open (bypass enabled); no feature blocked by subscription.
- **Master Brain:** Single ai-orchestrator gateway; 4-tier routing; no AI or prompt logic in frontend.
- **Banker:** `tenant_balances` + `deduct_credits()` in place; every AI call accounted for.
- **Identity Bridge:** `firebase_uid_map` table exists and is used for Mobile ↔ Web identity mapping (or clearly documented for mobile team).
- **UI:** Gold button and PlanWizard race condition fixed; 2026 mobile-web tokens applied where relevant.

When payment is unblocked, disable bypass and re-enable PaywallGate/UpgradeGate/useSubscription checks.
