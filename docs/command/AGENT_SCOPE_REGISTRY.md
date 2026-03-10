> Updated to align with V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md on 2026-03-08.

# AGENT SCOPE REGISTRY
**Version:** 2.0
**Effective:** March 8, 2026
**Authority:** `V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` → `/.claude/CLAUDE.md` → `docs/command/SOCELLE_CANONICAL_DOCTRINE.md`
**Scope:** All agents operating in the SOCELLE monorepo

---

## PURPOSE

This registry defines the boundary, skills, allowed paths, forbidden paths, and required proof artifacts for every recognized agent in the SOCELLE monorepo. No agent may operate outside its defined scope without an explicit WO in `SOCELLE-WEB/docs/build_tracker.md`. No agent may invent WO IDs.

**Contradiction resolution:** If any agent output contradicts V1 or a command doc, V1 wins. Update the agent output, not V1.

---

## GLOBAL RULES (APPLY TO ALL AGENTS)

| Rule | Enforcement |
|---|---|
| Read `V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` before any work | Non-negotiable — V1 is the single source of truth |
| Read `/.claude/CLAUDE.md` before any work | Non-negotiable — no exceptions |
| Read this file before any work | Non-negotiable — no exceptions |
| All WO IDs must exist in `build_tracker.md` | Inventing WO IDs = FAIL 2, auto-block |
| Do not modify files outside your allowed path list | Cross-boundary work requires explicit owner approval |
| Do not create governance docs outside `/docs/command/` | FAIL 2 |
| Do not draft outreach emails or cold acquisition copy | FAIL 7 — see V1 §P |
| Label all data surfaces LIVE or DEMO | FAIL 4 for violations |
| Ecommerce is a module — never an IA center | FAIL 6 for violations |
| Pass Doc Gate (all FAIL conditions) | Required before any output is considered complete |
| **NO SHELLS** — every hub surface must be fully functional | See V1 §D — Anti-Shell Rule |

---

## ANTI-SHELL RULE (V1 §D — Applies to All Hubs)

**NO SHELLS.** Any page, hub, or feature that renders UI must be fully functional. Every hub must satisfy ALL of the following minimum functional surface requirements:

| # | Requirement | What it means in practice |
|---|------------|---------------------------|
| 1 | Create action | User can create the primary object — a row in DB |
| 2 | Library/List view | Browse all objects with sort/filter/search from Supabase |
| 3 | Detail view | Full detail of any object from DB |
| 4 | Edit + Delete | Update and archive/remove objects with RLS respected |
| 5 | Permissions | RLS + ModuleRoute/TierGuard enforcing roles & tiers |
| 6 | Intelligence input | A signal can spawn or update an object in this hub |
| 7 | Proof/metrics | Dashboard with real aggregated metrics (and `updated_at`) |
| 8 | Export | CSV minimum; PDF for Pro+ |
| 9 | Error/empty/loading | Premium states implemented and tested |
| 10 | Observability | Errors and slow paths visible in Sentry / logs |

If an agent detects a shell, they HALT and raise a WO to fix it.

---

## V1 TECH BASELINE (§E — "Surgical Upgrade" Framing)

All agents must understand the tech baseline. These are **surgical, incremental upgrades on a working app**, not multi-week migrations.

| Package | Current | Target | Effort |
|---------|---------|--------|--------|
| React | 18.3 | 19.x | ~2 hours |
| Vite | 5.4 | 6.x | ~1 hour |
| TypeScript | 5.5 | 5.5 strict ON (`noExplicitAny`) | ~3-5 hours |
| TanStack Query | — | v5 | Incremental |
| Router | React Router | React Router / TanStack Router | React+Vite primary; NO Next.js as main runtime |
| Tailwind | 3.4 | 3.4 (Tailwind 4 deferred) | No change |
| Sentry | — | Web + edge | New |
| Playwright | Thin | E2E smoke | Expand |

**TOTAL tech baseline upgrade:** roughly **one working day**, zero rewrites.

---

## HUB-TO-AGENT OWNERSHIP (V1 §G + §L)

Every hub has exactly one primary owner agent. **NO SHELLS.** Each hub must satisfy the anti-shell minimum functional surface (10 requirements above).

| Hub | Owner Agent | Anti-Shell | Phase |
|-----|------------|------------|-------|
| Intelligence | Intelligence Architect | Required | 4 |
| Jobs | Platform Engineer | Required | 5 |
| Brands | Marketing Agent | Required | 5 |
| Professionals | CRM Agent | Required | 5 |
| Admin | Command Agent | Required | 5 |
| CRM | CRM Agent | Required | 5 |
| Education | Education Agent | Required | 5 |
| Marketing | Marketing Agent | Required | 5 |
| Sales | Sales Agent | Required | 5 |
| Commerce | Ecommerce Agent | Required | 5 |
| Authoring Studio | Authoring Agent | Required | 5 |
| Mobile App | Multi-Platform Agent | Required | 6 |
| Desktop App | Multi-Platform Agent | Required | 6 |
| Credit Economy | Monetization Agent | Required | 4-5 |
| Affiliate/Wholesale Engine | Monetization Agent | Required | 4-5 |

---

## AGENT DEFINITIONS (V1 §L Roster)

---

### 1. COMMAND AGENT

**Description:** Sequencing, governance, gates. Owns the Admin Hub.

**Scope:** Program-level coordination, command doc maintenance, gate enforcement, cross-agent sequencing.

**Hub ownership:** Admin

**Allowed Paths:**
- `docs/command/` — full read/write (change control process applies)
- `/.claude/CLAUDE.md` — read/write (owner approval required for semantic changes)
- `/.agents/workflows/` — full read/write
- `SOCELLE-WEB/docs/build_tracker.md` — read/write (WO status updates only)
- `SOCELLE-WEB/MASTER_STATUS.md` — read/write (status snapshot only)

**Forbidden Paths:**
- ALL `src/` directories — no code changes
- ALL `supabase/migrations/` — no schema changes
- ALL `supabase/functions/` — no function changes
- Commerce flow, auth system — NEVER TOUCH

**Required Proofs:**
- [ ] No code modified
- [ ] Doc Gate PASS
- [ ] Contradiction resolution citations provided
- [ ] `build_tracker.md` updated

---

### 2. INTELLIGENCE ARCHITECT

**Description:** Intelligence Hub, AI tools, feed pipeline. The revenue surface.

**Scope:** 10 modules (KPI Strip, Signal Table, Trend Stacks, What Changed Timeline, Opportunity Signals, Confidence + Provenance, Category Intelligence, Competitive Benchmarking, Brand Health Monitor, Local Market View), 7 AI engines, 6 AI tools, feed pipeline (37+ feeds), AI orchestrator with caching + eval harness.

**Hub ownership:** Intelligence

**Required Skills:**
- OpenRouter API integration (Claude Sonnet, Gemini 2.5 Pro, GPT-4o-mini, Llama 3.3 via Groq)
- Atomic credit system (tenant_balances, deduct_credits(), top_up_credits() RPCs)
- Deno edge function authoring
- Supabase Realtime (for streaming AI responses)
- React hooks for AI state

**Allowed Paths:**
- `SOCELLE-WEB/supabase/functions/ai-orchestrator/` — read/write
- `SOCELLE-WEB/supabase/functions/ai-concierge/` — read/write
- `SOCELLE-WEB/supabase/functions/feed-orchestrator/` — read/write
- `SOCELLE-WEB/supabase/functions/rss-to-signals/` — read/write
- `SOCELLE-WEB/src/pages/business/IntelligenceHub.tsx` — read/write (with WO)
- `SOCELLE-WEB/src/pages/business/AIAdvisor.tsx` — read/write (with WO)
- `SOCELLE-WEB/src/pages/brand/BrandAIAdvisor.tsx` — read/write (with WO)
- `SOCELLE-WEB/src/pages/public/Intelligence.tsx` — read/write (with WO)
- `supabase/migrations/` — ADD ONLY (intelligence + credit schema)

**Forbidden Paths:**
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- `SOCELLE-WEB/supabase/functions/stripe-webhook/` — NEVER MODIFY
- Commerce flow — FROZEN
- Any front-end file that would expose raw LLM prompts to client

**Required Proofs:**
- [ ] AI calls route through `ai-orchestrator` (no direct client-to-LLM calls)
- [ ] Credit deduction verified via `deduct_credits()` RPC
- [ ] All 10 Intelligence modules wired to real data
- [ ] Feed pipeline has >= 5 active feeds
- [ ] `npx tsc --noEmit` — zero errors
- [ ] Doc Gate PASS

---

### 3. PLATFORM ENGINEER

**Description:** Build system, tech upgrades, CI, observability. Owns Jobs Hub.

**Scope:** Tech baseline upgrades (React 19, Vite 6, TS strict, TanStack Query), Sentry wiring, CI/CD pipeline, `database.types.ts` regeneration, Supabase migrations and edge functions, monorepo tooling.

**Hub ownership:** Jobs

**Required Skills:**
- React 19 + Vite 6 + TypeScript strict (surgical upgrades per V1 §E)
- Supabase PostgreSQL (RLS, triggers, RPCs, tsvector)
- Supabase migrations (ADD ONLY policy)
- Deno / TypeScript (edge functions)
- TanStack Query v5
- Sentry (web + edge)

**Allowed Paths:**
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY
- `SOCELLE-WEB/supabase/functions/` — ADD ONLY for new; update non-commerce with WO
- `supabase/migrations/` (monorepo root) — ADD ONLY
- `supabase/functions/` (monorepo root) — with WO
- `SOCELLE-WEB/src/lib/database.types.ts` — regenerate only
- `packages/` — write with cross-agent coordination
- `.github/workflows/` — full read/write
- `wrangler.toml` — read/write
- `turbo.json` — read/write
- `package.json` (root + SOCELLE-WEB) — dependency/script management
- `SOCELLE-WEB/src/pages/public/Jobs.tsx` — read/write
- `SOCELLE-WEB/src/pages/public/JobDetail.tsx` — read/write
- `SOCELLE-WEB/vite.config.ts` — read/write
- `SOCELLE-WEB/tsconfig.json` — read/write

**Forbidden Paths:**
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- `SOCELLE-WEB/supabase/functions/create-checkout/` — FROZEN
- `SOCELLE-WEB/supabase/functions/stripe-webhook/` — FROZEN
- Commerce flow — FROZEN
- Existing migration files — NEVER MODIFY (ADD ONLY)

**Required Proofs:**
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `npm run build` — no build errors
- [ ] RLS policies on every new table
- [ ] `database.types.ts` regenerated after schema changes
- [ ] Sentry wired (web + edge) after Phase 3
- [ ] Doc Gate PASS

---

### 4. DESIGN GUARDIAN

**Description:** Design tokens, figma-to-code, responsiveness. Pearl Mineral V2 enforcement.

**Scope:** Tailwind token system, Figma-to-code handoff, design parity across web and mobile, banned color/font enforcement, responsive design audits.

**Allowed Paths:**
- `SOCELLE-WEB/tailwind.config.js` — parity/compliance fixes ONLY
- `SOCELLE-WEB/src/index.css` — token updates ONLY
- `SOCELLE-MOBILE-main/apps/mobile/lib/core/theme/socelle_theme.dart` — token sync ONLY

**Forbidden Paths:**
- `SOCELLE-WEB/src/pages/` — no layout or logic changes
- Commerce flow — FROZEN
- `supabase/` — Backend domain
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY

**Required Proofs:**
- [ ] No banned colors (outside Pearl Mineral V2 tokens)
- [ ] No `font-serif` on public pages
- [ ] `graphite` = `#141418`, `background` = `#F6F3EF`, `accent` = `#6E879B`
- [ ] Web and mobile tokens in parity
- [ ] Doc Gate PASS

---

### 5. SECURITY AGENT

**Description:** RLS, secrets, AI guardrails, legal, FTC compliance.

**Scope:** Row-Level Security audits, secrets scanning, AI safety guardrails (V1 §O), FTC compliance for affiliate/commission disclosures, data provenance enforcement.

**Allowed Paths:**
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (RLS policies)
- `docs/command/` — security-related docs only

**Forbidden Paths:**
- ALL application code except for RLS policy audits (read-only)
- Commerce flow — FROZEN
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY

**Required Proofs:**
- [ ] RLS on every table
- [ ] No secrets in code
- [ ] AI outputs show "Generated by AI" + evidence panel
- [ ] Hard block on dosing, diagnoses, prescriptions
- [ ] FTC badges on commission-linked content
- [ ] Doc Gate PASS

---

### 6. QA AGENT

**Description:** Tests, smoke, visual regression, LIVE/DEMO enforcement.

**Scope:** Playwright E2E, Vitest unit, route crawl, auth/paywall smoke tests, visual regression, LIVE/DEMO surface labeling enforcement.

**Allowed Paths:**
- `SOCELLE-WEB/tests/` — full read/write
- `SOCELLE-WEB/playwright.config.ts` — read/write
- `docs/command/HARD_CODED_SURFACES.md` — write with WO

**Forbidden Paths:**
- ALL application code (read-only for audit)
- Commerce flow — FROZEN
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY

**Required Proofs:**
- [ ] Playwright smoke tests pass (routes + auth + paywall)
- [ ] All data surfaces labeled LIVE or DEMO
- [ ] No unlabeled mock data in user-facing surfaces
- [ ] Doc Gate PASS

---

### 7. COPY AGENT

**Description:** Voice, banned terms, paywall/onboarding/empties, launch comms.

**Scope:** Brand voice enforcement (per `BRAND_VOICE_GUIDELINES.md`), banned term scanning, copy for paywall/onboarding/empty states, launch comms playbook execution.

**Allowed Paths:**
- Copy-only changes in `SOCELLE-WEB/src/pages/` — text/string changes only, with WO
- `docs/command/` — copy-related docs only

**Forbidden Paths:**
- Layout or logic changes in any page
- Commerce flow — FROZEN
- Outreach / cold email copy — FORBIDDEN (V1 §P)
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY

**Required Proofs:**
- [ ] Zero banned terms on public pages
- [ ] No outreach/cold copy generated
- [ ] Voice matches brand guidelines
- [ ] Doc Gate PASS

---

### 8. MONETIZATION AGENT

**Description:** Entitlements, credits, pricing, onboarding. Owns Credit Economy and Affiliate/Wholesale Engine hubs.

**Scope:** Tier gating (Free/Starter/Pro/Enterprise per V1 §A), credit system (deduct_credits/top_up_credits RPCs), affiliate tracking and commission logic, FTC disclosure, onboarding flows.

**Hub ownership:** Credit Economy, Affiliate/Wholesale Engine

**Allowed Paths:**
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (credit + affiliate schema)
- `SOCELLE-WEB/src/pages/` — entitlement/credit/affiliate surfaces only, with WO
- `SOCELLE-WEB/supabase/functions/` — credit/affiliate edge functions only, with WO

**Forbidden Paths:**
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- `SOCELLE-WEB/supabase/functions/create-checkout/` — FROZEN
- `SOCELLE-WEB/supabase/functions/stripe-webhook/` — FROZEN

**Required Proofs:**
- [ ] Credits deduct correctly on every AI action
- [ ] Tier gating matches V1 §A pricing table
- [ ] Affiliate links show FTC-compliant badges
- [ ] Commission rates sourced from DB, not hardcoded
- [ ] `npx tsc --noEmit` — zero errors
- [ ] Doc Gate PASS

---

### 9. DATA ARCHITECT

**Description:** Schema, types, materialized views, first-party events.

**Scope:** Supabase schema design, `database.types.ts` generation, materialized views for intelligence modules, first-party event tracking schema, pg_cron jobs, pgvector configuration.

**Allowed Paths:**
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY
- `supabase/migrations/` (monorepo root) — ADD ONLY
- `SOCELLE-WEB/src/lib/database.types.ts` — regenerate only
- `packages/` — type definitions

**Forbidden Paths:**
- `SOCELLE-WEB/src/pages/` — no UI changes
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- Commerce flow — FROZEN
- Existing migration files — NEVER MODIFY

**Required Proofs:**
- [ ] RLS on every new table
- [ ] `database.types.ts` regenerated and matches migrations
- [ ] Migration naming: `YYYYMMDDHHMMSS_description.sql`
- [ ] `updated_at` trigger on every new table
- [ ] Doc Gate PASS

---

### 10. CRM AGENT

**Description:** CRM Hub owner. Also owns Professionals Hub.

**Scope:** Customer relationship management — operator CRM, brand CRM, pipeline management, contact database, interaction history, professional profile management.

**Hub ownership:** CRM, Professionals

**Allowed Paths:**
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (CRM + professionals schema)
- `SOCELLE-WEB/src/pages/business/` — CRM + professional features only, with WO
- `SOCELLE-WEB/src/pages/brand/` — CRM features only, with WO

**Forbidden Paths:**
- Cross-tenant CRM data access — NEVER (RLS must prevent)
- Outreach / cold acquisition email — NEVER (V1 §P)
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- Commerce flow — FROZEN

**Required Proofs:**
- [ ] RLS prevents cross-tenant data leakage
- [ ] No cold outreach scaffolding
- [ ] `npx tsc --noEmit` — zero errors
- [ ] Doc Gate PASS

---

### 11. EDUCATION AGENT

**Description:** Education Hub owner.

**Scope:** Course builder, protocol library, CE credits system, training scheduler, CMS content for education articles and learning paths.

**Hub ownership:** Education

**Allowed Paths:**
- `SOCELLE-WEB/src/pages/public/Education.tsx` — read/write
- `SOCELLE-WEB/src/pages/public/Protocols.tsx` — read/write
- `SOCELLE-WEB/src/pages/public/ProtocolDetail.tsx` — read/write
- `SOCELLE-WEB/src/pages/business/` — CE credits features only, with WO
- `SOCELLE-WEB/src/pages/admin/` — education admin, ADD ONLY
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (education schema)

**Forbidden Paths:**
- Commerce checkout for CE credits — FROZEN
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY

**Required Proofs:**
- [ ] CE credits tied to real completion events, not hardcoded
- [ ] Education positioned within intelligence layer
- [ ] `npx tsc --noEmit` — zero errors
- [ ] Doc Gate PASS

---

### 12. MARKETING AGENT

**Description:** Marketing Hub owner. Also owns Brands Hub.

**Scope:** Campaign builder, automation triggers, broadcast messaging, marketing calendar, brand directory and brand profile management.

**Hub ownership:** Marketing, Brands

**Allowed Paths:**
- `SOCELLE-WEB/src/pages/business/` — marketing features only, with WO
- `SOCELLE-WEB/src/pages/brand/` — campaign + brand features only, with WO
- `SOCELLE-WEB/src/pages/public/Brands.tsx` — read/write
- `SOCELLE-WEB/src/pages/public/BrandDetail.tsx` — read/write
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (campaign + brand schema)

**Forbidden Paths:**
- Cold email copy or outbound acquisition — FORBIDDEN (V1 §P)
- Commerce flow — FROZEN
- `send-email` edge function — transactional only
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY

**Required Proofs:**
- [ ] No cold email functionality scaffolded
- [ ] Brand surfaces meet anti-shell minimum functional surface
- [ ] `npx tsc --noEmit` — zero errors
- [ ] Doc Gate PASS

---

### 13. SALES AGENT

**Description:** Sales Hub owner.

**Scope:** Lead scoring, deal tracking, commission management, sales analytics, pipeline management.

**Hub ownership:** Sales

**Allowed Paths:**
- `SOCELLE-WEB/src/pages/business/` — sales features only, with WO
- `SOCELLE-WEB/src/pages/brand/` — brand leads/pipeline features only, with WO
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (sales schema)

**Forbidden Paths:**
- Cold outreach or acquisition email — FORBIDDEN (V1 §P)
- Commerce checkout — FROZEN
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY

**Required Proofs:**
- [ ] Commission rates from DB, not hardcoded
- [ ] Lead data tenant-scoped (RLS)
- [ ] No cold outreach tooling
- [ ] `npx tsc --noEmit` — zero errors
- [ ] Doc Gate PASS

---

### 14. ECOMMERCE AGENT

**Description:** Commerce Hub owner. Commerce is a **module**, never the IA backbone (V1 §M).

**Scope:** Product catalog, order management, cart/checkout (read-only on frozen paths), commerce analytics. Commerce routes are always gated (auth + tier).

**Hub ownership:** Commerce

**Allowed Paths:**
- `SOCELLE-WEB/src/pages/` — commerce surfaces only, with WO
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (commerce schema, non-checkout)

**Forbidden Paths:**
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- `SOCELLE-WEB/supabase/functions/create-checkout/` — FROZEN
- `SOCELLE-WEB/supabase/functions/stripe-webhook/` — FROZEN
- No "Shop" as primary nav; no "Shop Now" / "Buy Now" as main CTA on Intelligence pages

**Required Proofs:**
- [ ] Commerce never elevated above Intelligence in nav/IA
- [ ] All commerce routes gated (auth + tier)
- [ ] `npx tsc --noEmit` — zero errors
- [ ] Doc Gate PASS

---

### 15. AUTHORING AGENT

**Description:** Authoring Studio Hub owner.

**Scope:** Content authoring studio — blog posts, stories/briefs, launch comms, SEO content, education content, in-app help. CMS tables and admin go first; Authoring Studio UI later wires into CMS.

**Hub ownership:** Authoring Studio

**Allowed Paths:**
- `SOCELLE-WEB/src/pages/` — authoring surfaces only, with WO
- `SOCELLE-WEB/src/pages/admin/` — CMS admin surfaces, ADD ONLY
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (CMS + content schema)

**Forbidden Paths:**
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- Commerce flow — FROZEN

**Required Proofs:**
- [ ] CMS tables operational before authoring UI
- [ ] Content has provenance (source, author, `updated_at`)
- [ ] `npx tsc --noEmit` — zero errors
- [ ] Doc Gate PASS

---

### 17. INTELLIGENCE MERCHANDISER

**Description:** Editorial layer between raw feed data and user-facing Intelligence Hub. Owns the 12 FEED-MERCH rules governing signal selection, ranking, framing, and paywall curation.

**Scope:** Signal ranking algorithm, vertical-to-audience matching, tier visibility curation (beyond column flags), editorial title rules, feed source weighting, freshness decay, deduplication editorial logic, "What Changed" timeline eligibility, paywall moment curation, admin feed display ordering.

**Skill:** `intelligence-merchandiser` (see `/.claude/skills/intelligence-merchandiser/SKILL.md`)
**Suite membership:** `data-integrity-suite` (member #7)

**Hub ownership:** None — cross-cutting editorial layer (Intelligence Architect owns the hub; this agent owns the presentation rules within it)

**Allowed Paths:**
- `SOCELLE-WEB/supabase/functions/feed-orchestrator/index.ts` — read/write (ranking logic only)
- `SOCELLE-WEB/supabase/functions/rss-to-signals/index.ts` — read/write (classification + title normalization only)
- `SOCELLE-WEB/src/lib/intelligence/useIntelligence.ts` — read/write (query filters + ordering only)
- `SOCELLE-WEB/src/pages/admin/AdminFeedsHub.tsx` — read/write (display ordering + sort logic only)
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (merchandising column additions only)
- `docs/command/` — read only
- `SOCELLE-WEB/docs/build_tracker.md` — read only (WO verification)

**Forbidden Paths:**
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- `SOCELLE-WEB/supabase/functions/create-checkout/` — FROZEN
- `SOCELLE-WEB/supabase/functions/stripe-webhook/` — FROZEN
- Any UI layout or visual component changes — Design Guardian domain
- Any new table creation without Data Architect WO
- Any outreach copy — FORBIDDEN per CLAUDE.md §14

**Required Proofs:**
- [ ] `merchandising-audit` JSON saved to `docs/qa/verify_merchandising-audit_*.json` with `"overall": "PASS"` or `"WARN"`
- [ ] All 12 FEED-MERCH rules checked with evidence
- [ ] Free tier sees ≥3 signals with `impact_score≥65` before paywall
- [ ] Paid tier has ≥3x signal volume vs free in same vertical
- [ ] No signal titles violate FEED-MERCH-08 (spot check 10)
- [ ] `npx tsc --noEmit` — zero errors if any TypeScript modified
- [ ] Doc Gate PASS

**Double-Agent Rule:** This agent does NOT mark any work DONE until `merchandising-audit` tool runs and returns `"overall": "PASS"`.

---

### 16. MULTI-PLATFORM AGENT

**Description:** Mobile + Desktop hubs owner. Executes multi-platform strategy (V1 §H).

**Scope:**
- **Desktop:** Tauri shell wrapping the same React+Vite app. No re-implementation of business logic in Rust; only IPC plumbing. Desktop-only features: notifications, file export, auto-update, secure storage.
- **Mobile:** Flutter app using same Supabase API contracts and edge functions. No FFI of TypeScript logic into Dart. Shares: schemas, entitlement rules, credit system, AI endpoints.

**Hub ownership:** Mobile App, Desktop App

**Allowed Paths:**
- `SOCELLE-MOBILE-main/apps/mobile/lib/` — full read/write
- `SOCELLE-MOBILE-main/apps/mobile/pubspec.yaml` — read/write
- `SOCELLE-MOBILE-main/apps/mobile/ios/` — read/write
- `SOCELLE-MOBILE-main/apps/mobile/android/` — read/write
- `src-tauri/` — Tauri desktop config and IPC (when created)
- `packages/` — shared type definitions (read only)

**Forbidden Paths:**
- `SOCELLE-WEB/src/` — Web/Platform Engineer domain (except Tauri wrapper of built output)
- `supabase/migrations/` — Data Architect/Platform Engineer domain
- `supabase/functions/` — Intelligence Architect/Platform Engineer domain
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- Commerce flow — FROZEN

**Required Proofs:**
- [ ] `flutter analyze` — zero errors (mobile)
- [ ] Tauri build compiles (desktop)
- [ ] Design tokens in parity with web spec
- [ ] No hardcoded data without DEMO label
- [ ] Doc Gate PASS

---

### SUPPORTING AGENT ROLES

These agents support the hub owners but do not own hubs themselves:

---

#### SEO / Schema Agent

**Scope:** SEO infrastructure, Schema.org markup, sitemaps, robots.txt, Core Web Vitals.

**Allowed Paths:**
- `apps/marketing-site/` — full read/write
- `SOCELLE-WEB/src/lib/seo.ts` — read/write
- `SOCELLE-WEB/public/sitemap.xml`, `robots.txt` — read/write

**Forbidden Paths:**
- Page layout/logic — Web Agent domain
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- Commerce flow — FROZEN

---

#### Doc Gate QA Agent

**Scope:** Audit all agent outputs against FAIL conditions. Read-only access to entire monorepo.

**Allowed Paths:**
- `docs/command/HARD_CODED_SURFACES.md` — write with WO only
- ALL other paths: READ-ONLY

---

#### Events Pipeline Agent

**Scope:** Event ingestion, deduplication, Schema.org Event markup.

**Allowed Paths:**
- `SOCELLE-WEB/src/pages/public/Events.tsx`, `EventDetail.tsx` — read/write
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY
- `SOCELLE-WEB/supabase/functions/` — ADD ONLY (event ingestion)

---

#### Analytics / Attribution Agent

**Scope:** First-party analytics, Core Web Vitals, attribution tracking.

**Allowed Paths:**
- `SOCELLE-WEB/src/lib/analytics/` — full read/write
- `SOCELLE-WEB/src/lib/tracking.ts` — read/write

---

#### Infra / DevOps Agent

**Scope:** CI/CD, environment management, build tooling.

**Allowed Paths:**
- `.github/workflows/` — full read/write
- `wrangler.toml`, `turbo.json`, `package.json` — read/write

---

## AGENT HANDOFF PROTOCOL

| Handoff Scenario | Process |
|---|---|
| Any agent needs new DB table | Create WO in `build_tracker.md` → Data Architect/Platform Engineer executes migration → requesting agent wires frontend |
| Intelligence Architect needs feed ingestion | Intelligence Architect builds edge function → Platform Engineer reviews deployment |
| Marketing Agent needs campaign email | Transactional only via `send-email` → no cold outreach (V1 §P) |
| Multi-Platform Agent needs API contract | Intelligence Architect/Platform Engineer defines contract → Multi-Platform Agent implements in Flutter/Tauri |
| Any agent crossing hub boundary | Must have WO in `build_tracker.md` + explicit owner approval |
| Authoring Agent needs CMS tables | Data Architect creates migration → Authoring Agent builds admin UI |

---

## SKILL LIBRARY INTEGRATION (v4.0 — March 8, 2026)

**97 skills installed** in `/.claude/skills/` — auto-discovered by Claude Code sessions. Each agent has assigned skills that match its scope. Agents MUST use their assigned skills before manual audits.

**6 Consolidation Suites** wrap 26 member skills into coordinated pipelines with single verification entrypoints.

### System Skills (All Agents)

| Skill | Purpose |
|---|---|
| `skill-creator` | Create, modify, and benchmark skills |
| `skill-selector` | Auto-route prompts to best-fit skill |

### Agent-to-Skill Map

| Agent | Assigned Skills | Assigned Suites |
|---|---|---|
| **Command Agent** | doc-gate-enforcer, proof-pack, repo-auditor, changelog-generator | ALL suites (audit-only) |
| **Intelligence Architect** | ai-output-quality-checker, ai-service-menu-validator, confidence-scorer, feed-source-auditor, feed-pipeline-checker, signal-data-validator, provenance-checker | data-integrity-suite |
| **Platform Engineer** | build-gate, db-inspector, migration-validator, rls-auditor, edge-fn-health, type-generation-validator, route-mapper, dependency-scanner | schema-db-suite, test-runner-suite |
| **Design Guardian** | design-lock-enforcer, design-standard-enforcer, token-drift-scanner, figma-parity-checker | design-audit-suite |
| **Security Agent** | secrets-scanner, rls-auditor, legal-compliance-checker, risk-gatekeeper | — |
| **QA Agent** | smoke-test-suite, e2e-test-runner, playwright-crawler, live-demo-detector, hub-shell-detector | test-runner-suite |
| **Copy Agent** | voice-enforcer, tone-voice-auditor, banned-term-scanner, copy-system-enforcer, language-linter | copy-quality-suite |
| **Monetization Agent** | credit-economy-validator, billing-scenario-simulator, payment-flow-tester, stripe-integration-tester, affiliate-link-checker, entitlement-validator | billing-payments-suite |
| **Data Architect** | db-inspector, migration-validator, schema-drift-detector, type-generation-validator, materialized-view-checker | schema-db-suite |
| **CRM Agent** | rls-auditor, entitlement-validator | — |
| **Education Agent** | education-content-optimizer, education-module-creator, education-preference-alignor | — |
| **Marketing Agent** | marketing-alignment-checker, marketing-analytics-forecaster, marketing-campaign-builder, marketing-content-generator, cta-validator | copy-quality-suite |
| **Sales Agent** | sales-pipeline-optimizer, sales-output-refiner, sales-script-generator | billing-payments-suite |
| **Ecommerce Agent** | entitlement-validator, payment-flow-tester | billing-payments-suite |
| **Authoring Agent** | data-quality-auditor, provenance-checker | — |
| **Multi-Platform Agent** | mobile-parity-checker, build-gate, responsive-checker | design-audit-suite |
| **Intelligence Merchandiser** | intelligence-merchandiser, feed-value-ranker, topic-distribution-checker, signal-title-rewriter | data-integrity-suite |

### Cross-Cutting Skills (Available to All Agents)

| Skill | Scope |
|---|---|
| `build-gate` | TypeScript compilation gate |
| `secrets-scanner` | Leaked credential detection |
| `env-validator` | Environment variable compliance |
| `doc-gate-enforcer` | FAIL condition enforcement |
| `live-demo-detector` | LIVE/DEMO surface labeling |
| `proof-pack` | QA artifact aggregation for release gates |
| `repo-auditor` | Full monorepo structure audit |
| `risk-gatekeeper` | Existential business risk scan |
| `legal-compliance-checker` | Legal and regulatory scan |
| `changelog-generator` | Release notes from git history |

### Consolidation Suites Reference

| Suite | Members | Verification Command |
|---|---|---|
| `design-audit-suite` | design-lock-enforcer, design-standard-enforcer, token-drift-scanner, figma-parity-checker | `grep -rn '#141418\|#F6F3EF\|#6E879B' SOCELLE-WEB/src/ \| wc -l` |
| `copy-quality-suite` | voice-enforcer, tone-voice-auditor, language-linter, banned-term-scanner, copy-system-enforcer | `grep -rn 'revolutionary\|game-changing\|best-in-class' SOCELLE-WEB/src/ \| wc -l` -> expect 0 |
| `data-integrity-suite` | signal-data-validator, feed-source-auditor, feed-pipeline-checker, provenance-checker, confidence-scorer, data-quality-auditor | `grep -rn 'isLive\|updated_at\|confidence' SOCELLE-WEB/src/hooks/ \| wc -l` |
| `billing-payments-suite` | billing-scenario-simulator, payment-flow-tester, stripe-integration-tester, credit-economy-validator | `grep -rn 'stripe\|subscription\|payment' SOCELLE-WEB/src/ \| wc -l` |
| `schema-db-suite` | db-inspector, migration-validator, schema-drift-detector, type-generation-validator | `ls SOCELLE-WEB/supabase/migrations/*.sql \| wc -l` |
| `test-runner-suite` | smoke-test-suite, e2e-test-runner, playwright-crawler | `npx playwright test --list 2>&1 \| tail -1` |

### Skill Library Governance

- **Location:** `/.claude/skills/` (97 directories, auto-discovered)
- **Authority:** Skills Master vNext (`SOCELLE_SKILLS_MASTER_vNEXT.docx`)
- **Certification:** 97/97 PASS (March 8, 2026 re-certification)
- **Re-certification cadence:** Quarterly (next: June 2026)
- **Suite definitions:** Suites are execution wrappers; member skills remain individually invocable
- **New skills:** Must be created via `skill-creator` and added to Skills Master

---

## SCOPE VERIFICATION CHECKLIST

Before any agent begins work, verify:

- [ ] V1 master file read (`V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md`)
- [ ] This file read (`docs/command/AGENT_SCOPE_REGISTRY.md`)
- [ ] `/.claude/CLAUDE.md` read (global governance)
- [ ] Relevant command docs read for task area
- [ ] WO ID confirmed in `SOCELLE-WEB/docs/build_tracker.md`
- [ ] Target paths confirmed within agent's allowed path list
- [ ] No forbidden paths in planned changeset
- [ ] Doc Gate PASS conditions understood
- [ ] LIVE vs DEMO labels planned for all data surfaces in scope
- [ ] Anti-shell rule understood — all 10 requirements for hub surfaces
- [ ] Assigned skills checked for automated verification before manual audit
- [ ] Suite-level verification run if task spans multiple skill domains

---

*SOCELLE AGENT SCOPE REGISTRY v2.0 — March 8, 2026 — Aligned to V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md — Command Center Authority*
