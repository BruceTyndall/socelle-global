> Updated to align with V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md on 2026-03-08.

# AGENT WORKING FOLDERS
**Authority:** `V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` → `/.claude/CLAUDE.md` → `docs/command/AGENT_SCOPE_REGISTRY.md`
**Last Updated:** 2026-03-08
**Enforced by:** QA Agent — FAIL if any agent writes outside its defined working roots.

---

## HOW TO READ THIS FILE

Each agent entry contains:
- **Working Root(s):** ONLY folders the agent may write to
- **Read-Only Allowed:** may read; must NOT write
- **Forbidden:** NEVER touch under any circumstance
- **Protected Files:** individual files that are NEVER modified by this agent
- **Typical Tasks:** 3-6 bullets of expected work
- **Escalate to Command Center when...:** 3 conditions requiring owner / cross-agent sign-off

**Anti-Shell Rule (V1 §D):** Every hub-owning agent must ensure its hub meets ALL 10 minimum functional surface requirements: Create / List / Detail / Edit+Delete / Permissions (RLS+TierGuard) / Intelligence input / Proof+metrics / Export / Error+empty+loading states / Observability. **NO SHELLS.**

**Universal Protected Files (apply to ALL agents — never listed again per agent):**
- `SOCELLE-WEB/src/lib/auth.tsx`
- `SOCELLE-WEB/src/lib/useCart.ts`
- `SOCELLE-WEB/src/components/ProtectedRoute.tsx`
- Commerce flow: `supabase/functions/create-checkout/`, `supabase/functions/stripe-webhook/`
- `/.claude/CLAUDE.md` (root governance — Command Agent only via change control)
- `docs/command/*` (Command Agent only via change control)

**Universal Rules (apply to ALL agents):**
- V1 is the single source of truth — if any doc conflicts, V1 wins
- All WO IDs must exist in `SOCELLE-WEB/docs/build_tracker.md` before execution
- Supabase migrations: ADD ONLY — never edit existing `.sql` files
- LIVE vs DEMO label required on every data surface in output
- Intelligence Hub leads; ecommerce is a module beneath — never invert
- No outreach email copy (V1 §P)
- **NO SHELLS** — every hub surface must be fully functional (V1 §D)
- **Tech baseline:** React+Vite is the primary runtime. No Next.js as main runtime. Upgrades are surgical (~1 day). See V1 §E.
- **Skill library:** `/.claude/skills/` is READ-ONLY for all agents (97 skills + 6 suites). Only `skill-creator` may write to this path.
- **Invoke assigned skills** (see `AGENT_SCOPE_REGISTRY.md`) before manual audits

---

## 1. COMMAND AGENT

**Hub ownership:** Admin

**Working Root(s):**
- `docs/command/` — full read/write (change control process applies)
- `/.claude/CLAUDE.md` — read/write (owner approval required for semantic changes)
- `/.agents/workflows/` — full read/write
- `SOCELLE-WEB/docs/build_tracker.md` — read/write (WO status updates only)
- `SOCELLE-WEB/MASTER_STATUS.md` — read/write (status snapshot only)
- `SOCELLE-WEB/src/pages/admin/` — Admin Hub surfaces (ADD ONLY, with WO)

**Read-Only Allowed:**
- ALL code paths (read for audit/governance only)
- ALL migration files (read for integrity review only)

**Forbidden:**
- ALL `src/` directories (except admin pages with WO) — no code changes
- ALL `supabase/migrations/` — no schema changes
- ALL `supabase/functions/` — no function changes
- Commerce flow, auth system — NEVER TOUCH

**Protected Files (this agent):**
- All migration files (read-only)
- All source code files (read-only)

**Typical Tasks:**
- Update command docs per change control process
- Resolve contradictions between command docs and V1
- Add new WO IDs to `build_tracker.md`
- Update `MASTER_STATUS.md` status snapshots
- Write and update agent workflow files in `/.agents/workflows/`
- Coordinate cross-agent handoffs
- Ensure Admin Hub meets anti-shell requirements (with WO)

**Escalate to Command Center when...:**
- (This IS the Command Center — escalate to product owner when:)
- A governance rule requires owner approval
- Two command docs directly contradict each other
- A security boundary needs to be permanently modified

---

## 2. INTELLIGENCE ARCHITECT

**Hub ownership:** Intelligence

**Working Root(s):**
- `SOCELLE-WEB/supabase/functions/ai-orchestrator/` — full read/write
- `SOCELLE-WEB/supabase/functions/ai-concierge/` — full read/write
- `SOCELLE-WEB/supabase/functions/feed-orchestrator/` — full read/write
- `SOCELLE-WEB/supabase/functions/rss-to-signals/` — full read/write
- `SOCELLE-WEB/supabase/functions/generate-embeddings/` — full read/write
- `SOCELLE-WEB/src/pages/business/IntelligenceHub.tsx` — with WO
- `SOCELLE-WEB/src/pages/business/AIAdvisor.tsx` — with WO
- `SOCELLE-WEB/src/pages/brand/BrandAIAdvisor.tsx` — with WO
- `SOCELLE-WEB/src/pages/public/Intelligence.tsx` — with WO
- `supabase/migrations/` — ADD ONLY (intelligence + credit schema)

**Read-Only Allowed:**
- `SOCELLE-WEB/src/lib/` (hook reference)
- `docs/command/SOCELLE_DATA_PROVENANCE_POLICY.md`
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- `SOCELLE-WEB/supabase/functions/send-email/` — transactional only
- `SOCELLE-WEB/supabase/functions/create-checkout/` — FROZEN
- `SOCELLE-WEB/supabase/functions/stripe-webhook/` — FROZEN
- `SOCELLE-WEB/src/pages/public/` (except Intelligence.tsx with WO)
- `apps/marketing-site/` — SEO Agent domain
- Any front-end file that would expose raw LLM prompts to client

**Protected Files (this agent):**
- `SOCELLE-WEB/src/lib/auth.tsx`
- `SOCELLE-WEB/src/lib/useCart.ts`
- `supabase/functions/send-email/index.ts`

**Typical Tasks:**
- Build and update AI orchestrator routing logic (7 AI engines)
- Implement the 10 Intelligence modules (KPI Strip, Signal Table, Trend Stacks, What Changed Timeline, Opportunity Signals, Confidence + Provenance, Category Intelligence, Competitive Benchmarking, Brand Health Monitor, Local Market View)
- Wire 6 AI tools to credit system
- Build feed pipeline (37+ feeds, APIs)
- Implement credit deduction on AI feature usage
- Enforce data provenance and confidence scoring on all AI outputs

**Escalate to Command Center when...:**
- An AI feature requires a new public-facing page (hand off to Platform Engineer)
- Credit/billing logic touches commerce flow
- An LLM provider change affects data provenance compliance

---

## 3. PLATFORM ENGINEER

**Hub ownership:** Jobs

**Working Root(s):**
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
- `SOCELLE-WEB/vite.config.ts` — read/write
- `SOCELLE-WEB/tsconfig.json` — read/write
- `SOCELLE-WEB/src/pages/public/Jobs.tsx` — read/write
- `SOCELLE-WEB/src/pages/public/JobDetail.tsx` — read/write
- `SOCELLE-WEB/src/pages/public/` — with WO (public page wiring)
- `SOCELLE-WEB/src/components/` — with WO (component updates during upgrades)
- `SOCELLE-WEB/src/lib/` — read/write excluding protected files
- `SOCELLE-WEB/src/hooks/` — full read/write
- `SOCELLE-WEB/src/types/` — full read/write
- `SOCELLE-WEB/.netlify/netlify.toml` — read/write

**Read-Only Allowed:**
- `SOCELLE-WEB/src/pages/business/` (reference)
- `SOCELLE-WEB/src/pages/brand/` (reference)
- `SOCELLE-WEB/src/pages/admin/` (reference)
- `docs/command/*`
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- `SOCELLE-WEB/supabase/functions/create-checkout/` — FROZEN
- `SOCELLE-WEB/supabase/functions/stripe-webhook/` — FROZEN
- Existing migration files — NEVER MODIFY
- `SOCELLE-MOBILE-main/` — Multi-Platform Agent domain

**Protected Files (this agent):**
- `SOCELLE-WEB/src/lib/auth.tsx`
- `SOCELLE-WEB/src/lib/useCart.ts`
- Any existing `.sql` migration file
- `supabase/functions/create-checkout/index.ts`
- `supabase/functions/stripe-webhook/index.ts`

**Typical Tasks:**
- Execute tech baseline upgrades: React 18.3->19, Vite 5.4->6, TS strict ON (~1 day total per V1 §E)
- Wire TanStack Query v5 on all data hooks
- Wire Sentry (web + edge)
- Create new Supabase migrations for new tables
- Regenerate `database.types.ts` after schema changes
- Build and maintain CI/CD pipeline workflows
- Wire Jobs Hub pages to `job_postings` Supabase table
- Add RLS policies to new tables
- Ensure Jobs Hub meets anti-shell requirements

**Escalate to Command Center when...:**
- A migration would alter an existing table in a breaking way
- Commerce or auth schema changes are required
- Tech upgrade creates breaking changes requiring multi-agent coordination

---

## 4. DESIGN GUARDIAN

**Working Root(s):**
- `SOCELLE-WEB/tailwind.config.js` — parity/compliance fixes ONLY (no redesign)
- `SOCELLE-WEB/src/index.css` — token updates ONLY
- `SOCELLE-MOBILE-main/apps/mobile/lib/core/theme/socelle_theme.dart` — token sync ONLY

**Read-Only Allowed:**
- ALL `src/pages/` (audit for banned tokens/colors/fonts — read only)
- ALL `lib/` Flutter files (audit for banned tokens — read only)
- `docs/command/SOCELLE_FIGMA_TO_CODE_HANDOFF.md`
- `docs/command/SOCELLE_CANONICAL_DOCTRINE.md`
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- `SOCELLE-WEB/src/pages/` — no layout or logic changes
- `SOCELLE-MOBILE-main/apps/mobile/lib/` beyond `socelle_theme.dart` — Multi-Platform Agent domain
- Commerce flow — FROZEN
- `supabase/` — Data Architect/Platform Engineer domain
- `apps/marketing-site/` — SEO Agent domain

**Protected Files (this agent):**
- `SOCELLE-WEB/src/lib/auth.tsx`
- `SOCELLE-WEB/src/lib/useCart.ts`
- All migration files

**Typical Tasks:**
- Audit and fix banned color token usage
- Remove `font-serif` from public pages
- Sync Figma token changes to `tailwind.config.js` and `socelle_theme.dart`
- Validate Pearl Mineral V2 tokens: background=#F6F3EF, graphite=#141418, accent=#6E879B
- Enforce Tailwind 3.4 (Tailwind 4 is deferred per V1 §F)
- Flag pages with banned design tokens for fix by hub owner

**Escalate to Command Center when...:**
- A Figma token change requires a semantic rename affecting component logic
- A design decision in doctrine is ambiguous or outdated
- A banned token is inside commerce or auth components

---

## 5. SECURITY AGENT

**Working Root(s):**
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (RLS policies only)
- `docs/command/` — security-related docs with change control

**Read-Only Allowed:**
- ALL source code (security audit — no writes)
- ALL migration files (RLS review)
- ALL edge functions (guardrail review)

**Forbidden:**
- ALL application code — no functional changes
- Commerce flow — FROZEN
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY

**Typical Tasks:**
- Audit RLS policies on all tables
- Scan for secrets in codebase
- Enforce AI safety guardrails (V1 §O): "Generated by AI" labels, evidence panels, hard block on dosing/diagnoses/prescriptions
- Validate FTC-compliant "Commission-linked" badges on affiliate content
- Audit data provenance compliance
- Review provider override logging for insurance/legal

**Escalate to Command Center when...:**
- Secrets found in code (HALT immediately)
- RLS bypass discovered
- AI guardrail violation in production output

---

## 6. QA AGENT

**Working Root(s):**
- `SOCELLE-WEB/tests/` — full read/write
- `SOCELLE-WEB/playwright.config.ts` — read/write
- `docs/command/HARD_CODED_SURFACES.md` — write with WO

**Read-Only Allowed:**
- ALL code paths (audit only)
- ALL migration files
- `docs/command/*`

**Forbidden:**
- ALL application code (read-only for audit)
- Commerce flow — FROZEN

**Typical Tasks:**
- Run Playwright E2E smoke tests (route crawl, auth, paywall)
- Verify LIVE/DEMO labels on all data surfaces
- Audit hubs against anti-shell rule (10 requirements)
- Visual regression testing
- Validate launch non-negotiables (V1 §J)
- Update `HARD_CODED_SURFACES.md` with new findings

**Escalate to Command Center when...:**
- A hub fails anti-shell requirements
- PAYMENT_BYPASS found true in production
- Build or tests fail and cannot be resolved

---

## 7. COPY AGENT

**Working Root(s):**
- `SOCELLE-WEB/src/pages/` — text/string changes ONLY, with WO (no layout/logic)
- `docs/command/` — copy-related docs with change control

**Read-Only Allowed:**
- ALL pages (copy audit)
- `docs/command/BRAND_VOICE_GUIDELINES.md`
- `docs/command/COPY_SYSTEM.md`

**Forbidden:**
- Layout or logic changes in any page
- Commerce flow — FROZEN
- Outreach / cold email copy — FORBIDDEN (V1 §P)

**Typical Tasks:**
- Scan for and remove banned terms on public pages
- Write paywall, onboarding, and empty-state copy
- Enforce brand voice consistency
- Execute launch comms playbook copy
- Ensure no "revolutionary" / "game-changing" / "best-in-class" language

**Escalate to Command Center when...:**
- Banned terms found in governance docs
- Copy change requires layout modification (hand off to hub owner)
- Launch comms copy requires owner approval

---

## 8. MONETIZATION AGENT

**Hub ownership:** Credit Economy, Affiliate/Wholesale Engine

**Working Root(s):**
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (credit + affiliate schema)
- `SOCELLE-WEB/src/pages/` — entitlement/credit/affiliate surfaces only, with WO
- `SOCELLE-WEB/supabase/functions/` — credit/affiliate edge functions only, with WO

**Read-Only Allowed:**
- `SOCELLE-WEB/src/lib/` (hook reference)
- `docs/command/SOCELLE_ENTITLEMENTS_PACKAGING.md`
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- `SOCELLE-WEB/supabase/functions/create-checkout/` — FROZEN
- `SOCELLE-WEB/supabase/functions/stripe-webhook/` — FROZEN
- Commerce checkout flow — read-only reference

**Protected Files (this agent):**
- `SOCELLE-WEB/src/lib/auth.tsx`
- `SOCELLE-WEB/src/lib/useCart.ts`
- Any existing migration file

**Typical Tasks:**
- Build credit deduction system (`deduct_credits()`, `top_up_credits()` RPCs)
- Implement tier gating (Free/Starter/Pro/Enterprise per V1 §A)
- Build affiliate tracking schema and referral links
- Implement FTC-compliant commission disclosure badges
- Wire credit costs to AI tool usage
- Ensure Credit Economy + Affiliate hubs meet anti-shell requirements

**Escalate to Command Center when...:**
- Pricing or tier changes requested (requires V1 update by owner)
- Commission payout logic requires Stripe changes (FROZEN)
- Credit system edge case could result in negative balances

---

## 9. DATA ARCHITECT

**Working Root(s):**
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY
- `supabase/migrations/` (monorepo root) — ADD ONLY
- `SOCELLE-WEB/src/lib/database.types.ts` — regenerate only (`supabase gen types`)
- `packages/` — type definitions with cross-agent coordination

**Read-Only Allowed:**
- `SOCELLE-WEB/src/` (schema reference, type checking)
- `docs/command/*`
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- `SOCELLE-WEB/src/pages/` — hub owner domains
- `SOCELLE-WEB/src/components/` — hub owner domains
- `SOCELLE-MOBILE-main/` — Multi-Platform Agent domain
- Commerce flow — FROZEN
- Existing migration files — NEVER MODIFY

**Protected Files (this agent):**
- Any existing `.sql` migration file
- `SOCELLE-WEB/src/lib/auth.tsx`

**Typical Tasks:**
- Design Supabase schema for new hubs and features
- Create materialized views for Intelligence modules
- Configure pg_cron jobs for scheduled data tasks
- Set up pgvector for AI embeddings
- Regenerate `database.types.ts` after all schema changes
- Add `updated_at` triggers on every new table
- Ensure RLS policies on every new table

**Escalate to Command Center when...:**
- A migration would alter an existing table in a breaking way
- Schema design conflicts between multiple hub owners
- pgvector or pg_cron configuration requires Supabase plan upgrade

---

## 10. CRM AGENT

**Hub ownership:** CRM, Professionals

**Working Root(s):**
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (CRM + professionals schema)
- `SOCELLE-WEB/src/pages/business/` — CRM + professional features only, with WO
- `SOCELLE-WEB/src/pages/brand/` — CRM features only, with WO

**Read-Only Allowed:**
- `SOCELLE-WEB/src/lib/` (hook reference)
- `docs/command/SOCELLE_ENTITLEMENTS_PACKAGING.md`
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- `SOCELLE-WEB/src/pages/public/` — Platform Engineer domain
- Commerce flow — FROZEN
- Cold outreach or DM automation — FORBIDDEN (V1 §P)
- `apps/marketing-site/` — SEO Agent domain
- `SOCELLE-MOBILE-main/` — Multi-Platform Agent domain

**Protected Files (this agent):**
- `SOCELLE-WEB/src/lib/auth.tsx`
- `SOCELLE-WEB/src/lib/useCart.ts`
- `supabase/functions/send-email/index.ts` (no cold outreach additions)

**Typical Tasks:**
- Build professional and brand CRM portal interfaces
- Build professional profile management surfaces
- Create CRM schema migrations (contacts, pipelines, notes)
- Implement tenant-scoped RLS on all CRM tables
- Wire CRM activity feeds to real `updated_at` timestamps
- Build contact import/export flows (no PII leakage between tenants)
- Ensure CRM + Professionals hubs meet anti-shell requirements

**Escalate to Command Center when...:**
- CRM automation would trigger outbound email (transactional only)
- Cross-tenant data access requested
- CRM feature requires monetization gating (touches commerce)

---

## 11. EDUCATION AGENT

**Hub ownership:** Education

**Working Root(s):**
- `SOCELLE-WEB/src/pages/public/Education.tsx` — read/write
- `SOCELLE-WEB/src/pages/public/Protocols.tsx` — read/write
- `SOCELLE-WEB/src/pages/public/ProtocolDetail.tsx` — read/write
- `SOCELLE-WEB/src/pages/business/` — CE credits features only, with WO
- `SOCELLE-WEB/src/pages/admin/` — education admin, ADD ONLY
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (education schema)

**Read-Only Allowed:**
- `SOCELLE-WEB/src/lib/` (hook reference)
- `docs/command/SOCELLE_DATA_PROVENANCE_POLICY.md`
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- Commerce checkout for CE credits — FROZEN
- `apps/marketing-site/` — SEO Agent domain
- `SOCELLE-MOBILE-main/` — Multi-Platform Agent domain

**Protected Files (this agent):**
- `SOCELLE-WEB/src/lib/auth.tsx`
- `SOCELLE-WEB/src/lib/useCart.ts`

**Typical Tasks:**
- Wire Education pages to Supabase tables
- Build CE credit tracking schema and UI
- Build course builder and protocol library
- Add Schema.org Course/EducationalOccupationalCredential structured data
- Position education within intelligence layer (not standalone ecommerce)
- Ensure Education Hub meets anti-shell requirements

**Escalate to Command Center when...:**
- CE credit monetization requested (touches commerce)
- New protocol category requires schema change (hand off to Data Architect)
- Education content attribution unverifiable per provenance policy

---

## 12. MARKETING AGENT

**Hub ownership:** Marketing, Brands

**Working Root(s):**
- `SOCELLE-WEB/src/pages/business/` — marketing features only, with WO
- `SOCELLE-WEB/src/pages/brand/` — campaign + brand features only, with WO
- `SOCELLE-WEB/src/pages/public/Brands.tsx` — read/write
- `SOCELLE-WEB/src/pages/public/BrandDetail.tsx` — read/write
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (campaign + brand schema)

**Read-Only Allowed:**
- `SOCELLE-WEB/supabase/functions/send-email/` (reference only)
- `SOCELLE-WEB/src/lib/` (hook reference)
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- Cold email copy or outbound acquisition — FORBIDDEN (V1 §P)
- Commerce flow — FROZEN
- `send-email` edge function — transactional only
- `apps/marketing-site/` — SEO Agent domain
- `SOCELLE-MOBILE-main/` — Multi-Platform Agent domain

**Protected Files (this agent):**
- `SOCELLE-WEB/src/lib/auth.tsx`
- `supabase/functions/send-email/index.ts` (transactional only)

**Typical Tasks:**
- Build campaign builder interfaces for brand portal
- Build marketing calendar views for business portal
- Build brand directory and brand profile surfaces
- Implement content scheduling schema and UI
- Wire campaign analytics to real attribution data
- Build audience targeting interfaces (intelligence-driven)
- Ensure Marketing + Brands hubs meet anti-shell requirements

**Escalate to Command Center when...:**
- Marketing feature would trigger outbound cold email (FORBIDDEN)
- Campaign requires payment processing (touches commerce)
- Feature requires new AI content generation (hand off to Intelligence Architect)

---

## 13. SALES AGENT

**Hub ownership:** Sales

**Working Root(s):**
- `SOCELLE-WEB/src/pages/business/` — sales features only, with WO
- `SOCELLE-WEB/src/pages/brand/` — brand leads/pipeline features only, with WO
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (sales schema)

**Read-Only Allowed:**
- `SOCELLE-WEB/src/lib/` (hook reference)
- `docs/command/SOCELLE_ENTITLEMENTS_PACKAGING.md`
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- Cold outreach or acquisition email — FORBIDDEN (V1 §P)
- Commerce checkout — FROZEN
- `SOCELLE-WEB/src/pages/public/` — Platform Engineer domain
- `apps/marketing-site/` — SEO Agent domain
- `SOCELLE-MOBILE-main/` — Multi-Platform Agent domain

**Protected Files (this agent):**
- `SOCELLE-WEB/src/lib/auth.tsx`
- `SOCELLE-WEB/src/lib/useCart.ts`
- `supabase/functions/send-email/index.ts`

**Typical Tasks:**
- Build brand lead management pipeline UI
- Build professional-to-brand connection request flows
- Implement commission tracking schema (real DB, not hardcoded)
- Wire pipeline stages to real `updated_at` timestamps
- Add entitlement gating to sales features per packaging doc
- Ensure Sales Hub meets anti-shell requirements

**Escalate to Command Center when...:**
- Sales feature would trigger outbound cold contact (FORBIDDEN)
- Commission payout requires Stripe integration (FROZEN)
- New public-facing sales page needed (hand off to Platform Engineer)

---

## 14. ECOMMERCE AGENT

**Hub ownership:** Commerce

**Working Root(s):**
- `SOCELLE-WEB/src/pages/` — commerce surfaces only, with WO
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (commerce schema, non-checkout)

**Read-Only Allowed:**
- `SOCELLE-WEB/src/lib/` (hook reference)
- `SOCELLE-WEB/docs/build_tracker.md`
- Commerce checkout flow (read-only reference)

**Forbidden:**
- `SOCELLE-WEB/supabase/functions/create-checkout/` — FROZEN
- `SOCELLE-WEB/supabase/functions/stripe-webhook/` — FROZEN
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- No "Shop" as primary nav; no "Shop Now"/"Buy Now" as main CTA on Intelligence pages (V1 §M)
- `SOCELLE-MOBILE-main/` — Multi-Platform Agent domain

**Typical Tasks:**
- Build product catalog management surfaces
- Build order management interfaces
- Wire commerce analytics to real DB
- Ensure commerce routes are gated (auth + tier)
- Position commerce as module, never IA backbone
- Ensure Commerce Hub meets anti-shell requirements

**Escalate to Command Center when...:**
- Commerce feature requires modifying checkout flow (FROZEN)
- Commerce wants primary nav positioning (FORBIDDEN per V1 §M)
- Payment processing changes needed (owner approval)

---

## 15. AUTHORING AGENT

**Hub ownership:** Authoring Studio

**Working Root(s):**
- `SOCELLE-WEB/src/pages/` — authoring surfaces only, with WO
- `SOCELLE-WEB/src/pages/admin/` — CMS admin surfaces, ADD ONLY
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (CMS + content schema)

**Read-Only Allowed:**
- `SOCELLE-WEB/src/lib/` (hook reference)
- `docs/command/SOCELLE_DATA_PROVENANCE_POLICY.md`
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- Commerce flow — FROZEN
- `SOCELLE-MOBILE-main/` — Multi-Platform Agent domain

**Typical Tasks:**
- Build CMS tables and admin UI (CMS goes first, authoring UI later)
- Create content types: blog posts, stories/briefs, launch comms, SEO content, education content, in-app help
- Wire authoring studio to CMS backend
- Implement content provenance (source, author, `updated_at`)
- Build content scheduling and publishing workflows
- Ensure Authoring Studio Hub meets anti-shell requirements

**Escalate to Command Center when...:**
- Content type requires a new public route not in site map
- CMS schema conflicts with Education or Marketing agent content models
- Content monetization touches commerce (FROZEN)

---

## 16. MULTI-PLATFORM AGENT

**Hub ownership:** Mobile App, Desktop App

**Working Root(s):**
- `SOCELLE-MOBILE-main/apps/mobile/lib/` — full read/write
- `SOCELLE-MOBILE-main/apps/mobile/pubspec.yaml` — read/write
- `SOCELLE-MOBILE-main/apps/mobile/ios/` — read/write
- `SOCELLE-MOBILE-main/apps/mobile/android/` — read/write
- `src-tauri/` — Tauri desktop config and IPC (when created)

**Read-Only Allowed:**
- `SOCELLE-WEB/src/` (reference for parity — no writes)
- `packages/` (shared config, type definitions)
- `docs/command/*`
- `SOCELLE-WEB/supabase/` (schema reference only)
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- `SOCELLE-WEB/src/` — Platform Engineer domain
- `supabase/migrations/` — Data Architect/Platform Engineer domain
- `supabase/functions/` — Intelligence Architect/Platform Engineer domain
- Commerce flow — FROZEN

**Protected Files (this agent):**
- Any Firebase credentials or config file
- Any existing Supabase migration file

**Typical Tasks:**
- Build Flutter mobile screens using same Supabase API contracts (V1 §H)
- Build Tauri desktop wrapper (wraps same React+Vite build)
- Sync design tokens with `socelle_theme.dart` per Figma handoff
- Wire Supabase Dart client queries to mobile UI
- Add desktop-only features: notifications, file export, auto-update, secure storage
- No re-implementation of business logic in Rust (Tauri) or Dart FFI from TS (Flutter)
- Ensure Mobile + Desktop hubs meet anti-shell requirements

**Escalate to Command Center when...:**
- Mobile/desktop feature requires new Supabase table or edge function (hand off to Data Architect/Platform Engineer)
- Design token changes conflict with web token values
- A screen requires auth-system modifications

---

## SUPPORTING AGENT WORKING FOLDERS

---

### SEO / SCHEMA AGENT

**Working Root(s):**
- `apps/marketing-site/` — full read/write
- `SOCELLE-WEB/src/lib/seo.ts` — read/write
- `SOCELLE-WEB/public/sitemap.xml` — read/write
- `SOCELLE-WEB/public/sitemap-static.xml` — read/write
- `SOCELLE-WEB/public/robots.txt` — read/write

**Read-Only Allowed:**
- `SOCELLE-WEB/src/pages/public/` (Helmet meta audit only; no layout changes)
- `docs/command/GLOBAL_SITE_MAP.md`
- `docs/command/BRAND_SURFACE_INDEX.md`
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- Page layout/logic — hub owner domains
- `SOCELLE-WEB/supabase/` — Data Architect/Platform Engineer domain
- `SOCELLE-MOBILE-main/` — Multi-Platform Agent domain
- Commerce routes

**Typical Tasks:**
- Build and update marketing site pages
- Add/update `<Helmet>` meta tags on public pages
- Maintain `sitemap.xml` and `robots.txt`
- Implement Schema.org structured data
- Audit brand surface SEO readiness

---

### DOC GATE QA AGENT

**Working Root(s):**
- `docs/command/HARD_CODED_SURFACES.md` — write ONLY with WO
- NO other write access

**Read-Only Allowed:**
- ALL paths in the monorepo (full read for audit)

**Forbidden:**
- ALL write operations except `HARD_CODED_SURFACES.md` (with WO)

**Typical Tasks:**
- Audit all agent outputs against FAIL conditions
- Verify LIVE vs DEMO labels on all data surfaces
- Confirm WO IDs exist in `build_tracker.md`
- Validate no ecommerce IA elevation
- Check for fake-live claims
- Update `HARD_CODED_SURFACES.md` with new findings

---

### EVENTS PIPELINE AGENT

**Working Root(s):**
- `SOCELLE-WEB/src/pages/public/Events.tsx` — read/write
- `SOCELLE-WEB/src/pages/public/EventDetail.tsx` — read/write
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (events schema)
- `SOCELLE-WEB/supabase/functions/` — ADD ONLY (event ingestion)

**Forbidden:**
- Portal event management — hub owner domain
- Commerce ticketing — FROZEN
- `SOCELLE-MOBILE-main/` — Multi-Platform Agent domain

---

### ANALYTICS / ATTRIBUTION AGENT

**Working Root(s):**
- `SOCELLE-WEB/src/lib/analytics/` — full read/write
- `SOCELLE-WEB/src/lib/tracking.ts` — read/write
- `apps/marketing-site/` analytics config — with SEO Agent coordination
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (analytics schema)

**Forbidden:**
- Page layout changes — hub owner domains
- PII in analytics payloads — FORBIDDEN always
- Commerce flow — FROZEN

---

### INFRA / DEVOPS AGENT

**Working Root(s):**
- `.github/workflows/` — full read/write
- `wrangler.toml` — read/write
- `SOCELLE-WEB/.netlify/netlify.toml` — read/write
- `turbo.json` — read/write
- `package.json` (root + SOCELLE-WEB) — dependency/script management

**Forbidden:**
- `src/pages/` — hub owner domains
- `supabase/migrations/` — Data Architect/Platform Engineer domain
- Commerce flow — FROZEN
- No secrets committed to any file

---

### i18n / LOCALIZATION AGENT

**Working Root(s):**
- `SOCELLE-WEB/src/lib/i18n/` — full read/write
- `SOCELLE-WEB/src/locales/` — full read/write
- `SOCELLE-MOBILE-main/apps/mobile/lib/l10n/` — full read/write

**Forbidden:**
- Page layout changes — hub owner domains
- Commerce flow — FROZEN
- `supabase/migrations/` — Data Architect domain

---

## HUB DIRECTORY REFERENCE

All 15 hubs and their expected primary working directories:

| Hub | Primary Directory | Owner Agent |
|-----|------------------|-------------|
| Intelligence | `SOCELLE-WEB/src/pages/business/IntelligenceHub.tsx`, `src/pages/public/Intelligence.tsx` | Intelligence Architect |
| Jobs | `SOCELLE-WEB/src/pages/public/Jobs.tsx`, `JobDetail.tsx` | Platform Engineer |
| Brands | `SOCELLE-WEB/src/pages/public/Brands.tsx`, `BrandDetail.tsx`, `src/pages/brand/` | Marketing Agent |
| Professionals | `SOCELLE-WEB/src/pages/business/` (professional profiles) | CRM Agent |
| Admin | `SOCELLE-WEB/src/pages/admin/` | Command Agent |
| CRM | `SOCELLE-WEB/src/pages/business/` (CRM surfaces), `src/pages/brand/` (brand CRM) | CRM Agent |
| Education | `SOCELLE-WEB/src/pages/public/Education.tsx`, `Protocols.tsx`, `src/pages/business/` (CE) | Education Agent |
| Marketing | `SOCELLE-WEB/src/pages/business/` (marketing), `src/pages/brand/` (campaigns) | Marketing Agent |
| Sales | `SOCELLE-WEB/src/pages/business/` (sales), `src/pages/brand/` (leads/pipeline) | Sales Agent |
| Commerce | `SOCELLE-WEB/src/pages/` (commerce surfaces) | Ecommerce Agent |
| Authoring Studio | `SOCELLE-WEB/src/pages/` (authoring), `src/pages/admin/` (CMS admin) | Authoring Agent |
| Mobile App | `SOCELLE-MOBILE-main/apps/mobile/lib/` | Multi-Platform Agent |
| Desktop App | `src-tauri/` (when created) | Multi-Platform Agent |
| Credit Economy | `SOCELLE-WEB/src/pages/` (credit surfaces), `supabase/` (credit schema) | Monetization Agent |
| Affiliate/Wholesale Engine | `SOCELLE-WEB/src/pages/` (affiliate surfaces), `supabase/` (affiliate schema) | Monetization Agent |

---

## SKILL LIBRARY (ALL AGENTS — READ-ONLY)

**Location:** `/.claude/skills/`
**Status:** 97 skills + 6 consolidation suites installed (March 8, 2026)
**Write access:** `skill-creator` skill only (via Command Agent)

**Working Root(s):** NONE — all agents read-only

**Read-Only Allowed:**
- `/.claude/skills/*/SKILL.md` — skill definitions, verification commands, procedures

**Forbidden:**
- Direct modification of any SKILL.md — use `skill-creator` skill instead
- Deleting or renaming skill directories
- Creating new skill directories without `skill-creator`

**Suites (coordinated execution wrappers):**
- `design-audit-suite/` — design-lock-enforcer + token-drift-scanner + figma-parity-checker + design-standard-enforcer
- `copy-quality-suite/` — voice-enforcer + tone-voice-auditor + language-linter + banned-term-scanner + copy-system-enforcer
- `data-integrity-suite/` — signal-data-validator + feed-source-auditor + feed-pipeline-checker + provenance-checker + confidence-scorer + data-quality-auditor
- `billing-payments-suite/` — billing-scenario-simulator + payment-flow-tester + stripe-integration-tester + credit-economy-validator
- `schema-db-suite/` — db-inspector + migration-validator + schema-drift-detector + type-generation-validator
- `test-runner-suite/` — smoke-test-suite + e2e-test-runner + playwright-crawler

**Canonical reference:** `SOCELLE_SKILLS_MASTER_vNEXT.docx`
**Re-certification cadence:** Quarterly (next: June 2026)

---

## UNIVERSAL ESCALATION PATH

```
Agent detects out-of-scope task
  -> STOP work
  -> Document: what was requested + why it's out of scope
  -> Hand off to: correct agent per this file
  -> If no clear owner: escalate to Command Agent
  -> Command Agent: resolves via docs/command/ or escalates to product owner (Bruce)
```

---

## VERSION HISTORY

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-03-06 | Initial creation -- 24 agents defined |
| 2.0 | 2026-03-08 | Aligned to V1 master. Restructured to V1 §L roster (16 primary + supporting agents). Added anti-shell rule + hub ownership + hub directory reference. Merged legacy agents into V1 roles. |

---
*Authority: `V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` -> `/.claude/CLAUDE.md` -> `docs/command/AGENT_SCOPE_REGISTRY.md` — Command Agent only may modify this file per change control*
