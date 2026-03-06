# AGENT WORKING FOLDERS
**Authority:** `/.claude/CLAUDE.md` §A–§J → `docs/command/AGENT_SCOPE_REGISTRY.md`
**Last Updated:** 2026-03-06
**Enforced by:** Doc Gate QA Agent — FAIL if any agent writes outside its defined working roots.

---

## HOW TO READ THIS FILE

Each agent entry contains:
- **Working Root(s):** ONLY folders the agent may write to
- **Read-Only Allowed:** may read; must NOT write
- **Forbidden:** NEVER touch under any circumstance
- **Protected Files:** individual files that are NEVER modified by this agent
- **Typical Tasks:** 3–6 bullets of expected work
- **Escalate to Command Center when…:** 3 conditions requiring owner / cross-agent sign-off

**Universal Protected Files (apply to ALL agents — never listed again per agent):**
- `SOCELLE-WEB/src/lib/auth.tsx`
- `SOCELLE-WEB/src/lib/useCart.ts`
- `SOCELLE-WEB/src/components/ProtectedRoute.tsx`
- Commerce flow: `supabase/functions/create-checkout/`, `supabase/functions/stripe-webhook/`
- `/.claude/CLAUDE.md` (root governance — Command Center only via change control)
- `docs/command/*` (Command Center only via change control)

**Universal Rules (apply to ALL agents):**
- All WO IDs must exist in `SOCELLE-WEB/docs/build_tracker.md` before execution
- Supabase migrations: ADD ONLY — never edit existing `.sql` files
- LIVE vs DEMO label required on every data surface in output
- Intelligence Hub leads; ecommerce is a module beneath — never invert
- No outreach email copy (CLAUDE.md §G)

---

## 1. WEB AGENT

**Working Root(s):**
- `SOCELLE-WEB/src/pages/public/` — full read/write
- `SOCELLE-WEB/src/components/` — full read/write (non-auth, non-cart)
- `SOCELLE-WEB/src/lib/` — read/write excluding protected files
- `SOCELLE-WEB/src/hooks/` — full read/write
- `SOCELLE-WEB/src/types/` — full read/write
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY
- `SOCELLE-WEB/src/pages/portal/` — WITH explicit WO scope only
- `SOCELLE-WEB/src/pages/brand/` — WITH explicit WO scope only
- `SOCELLE-WEB/src/pages/business/` — WITH explicit WO scope only

**Read-Only Allowed:**
- `SOCELLE-WEB/src/pages/admin/` (read; Admin Agent writes)
- `packages/` (read only)
- `docs/command/*`
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- `SOCELLE-MOBILE-main/` — Mobile Agent domain
- `apps/marketing-site/` — SEO Agent domain
- `supabase/` (monorepo root) — Backend Agent domain
- `SOCELLE-WEB/supabase/functions/` — Backend / AI Agent domain

**Protected Files (this agent):**
- `SOCELLE-WEB/src/lib/auth.tsx`
- `SOCELLE-WEB/src/lib/useCart.ts`
- `SOCELLE-WEB/src/components/ProtectedRoute.tsx`
- Any existing Supabase migration file

**Typical Tasks:**
- Build and update public-facing pages (`/intelligence`, `/brands`, `/events`, `/jobs`, etc.)
- Implement DEMO → LIVE data hooks using `isLive` pattern
- Add DEMO/Preview badges to hardcoded data surfaces
- Wire Supabase queries to public page components
- Fix TypeScript type errors in page/component files
- Apply Pearl Mineral V2 design tokens (no banned colors/fonts)

**Escalate to Command Center when…:**
- Task requires modifying portal, brand, or business routes without a scoped WO
- A design decision contradicts `docs/command/SOCELLE_CANONICAL_DOCTRINE.md`
- A data surface requires a new Supabase table (hand off to Backend Agent)

---

## 2. MOBILE AGENT

**Working Root(s):**
- `SOCELLE-MOBILE-main/apps/mobile/lib/` — full read/write
- `SOCELLE-MOBILE-main/apps/mobile/pubspec.yaml`
- `SOCELLE-MOBILE-main/apps/mobile/ios/`
- `SOCELLE-MOBILE-main/apps/mobile/android/`

**Read-Only Allowed:**
- `packages/` (shared config)
- `docs/command/*`
- `SOCELLE-WEB/supabase/` (schema reference only)
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- `SOCELLE-WEB/` — Web Agent domain
- `apps/marketing-site/` — SEO Agent domain
- `supabase/migrations/` — Backend Agent domain
- `supabase/functions/` — Backend / AI Agent domain

**Protected Files (this agent):**
- Any Firebase credentials or config file
- Any existing Supabase migration file

**Typical Tasks:**
- Build and update Flutter screens and feature modules in `lib/features/`
- Sync design tokens with `socelle_theme.dart` per `SOCELLE_FIGMA_TO_CODE_HANDOFF.md`
- Wire Supabase Dart client queries to mobile UI
- Update Riverpod providers and repositories
- Fix `flutter analyze` warnings and errors
- Update `pubspec.yaml` for new dependencies

**Escalate to Command Center when…:**
- A mobile feature requires a new Supabase table or edge function (hand off to Backend Agent)
- Design token changes conflict with web token values
- A screen requires auth-system modifications

---

## 3. BACKEND AGENT

**Working Root(s):**
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (new `.sql` files; never edit existing)
- `SOCELLE-WEB/supabase/functions/` — ADD ONLY for new functions; update existing non-commerce functions with WO
- `supabase/migrations/` (monorepo root) — ADD ONLY
- `supabase/functions/` (monorepo root) — with WO
- `SOCELLE-WEB/src/lib/database.types.ts` — regenerate only (`supabase gen types`)
- `packages/` — write with cross-agent coordination

**Read-Only Allowed:**
- `SOCELLE-WEB/src/` (schema reference, type checking)
- `docs/command/*`
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- `SOCELLE-WEB/src/pages/` — Web Agent domain
- `SOCELLE-WEB/src/components/` — Web Agent domain
- `SOCELLE-MOBILE-main/` — Mobile Agent domain
- `apps/marketing-site/` — SEO Agent domain
- `supabase/functions/create-checkout/` — FROZEN
- `supabase/functions/stripe-webhook/` — FROZEN

**Protected Files (this agent):**
- Any existing `.sql` migration file (ADD ONLY — never edit)
- `supabase/functions/create-checkout/index.ts`
- `supabase/functions/stripe-webhook/index.ts`
- `SOCELLE-WEB/src/lib/auth.tsx`

**Typical Tasks:**
- Create new Supabase migration files for new tables
- Seed data migrations for demo/staging environments
- Add or update Deno Edge Functions (non-commerce)
- Regenerate `database.types.ts` after schema changes
- Add RLS policies to new tables
- Configure `updated_at` triggers on new tables

**Escalate to Command Center when…:**
- A migration would alter an existing table in a breaking way
- Commerce or auth schema changes are required
- A new edge function overlaps with AI Agent scope

---

## 4. SEO / SCHEMA / SITEMAPS AGENT

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
- `SOCELLE-WEB/src/pages/public/` layout/logic — Web Agent domain
- `SOCELLE-WEB/src/lib/auth.tsx`
- `SOCELLE-WEB/supabase/` — Backend Agent domain
- `SOCELLE-MOBILE-main/` — Mobile Agent domain
- Commerce routes

**Protected Files (this agent):**
- Any existing Supabase migration
- `SOCELLE-WEB/src/lib/auth.tsx`
- `SOCELLE-WEB/src/lib/useCart.ts`

**Typical Tasks:**
- Build and update marketing site pages in `apps/marketing-site/`
- Add/update `<Helmet>` meta tags on public pages (Helmet only — no layout changes)
- Maintain `sitemap.xml` and `robots.txt`
- Implement Schema.org structured data (Article, Event, JobPosting, Organization)
- Audit brand surface SEO readiness per `BRAND_SURFACE_INDEX.md`
- Validate all public routes in `GLOBAL_SITE_MAP.md` have canonical meta

**Escalate to Command Center when…:**
- A public page layout change is needed to fix SEO (hand off to Web Agent)
- A new route is required that isn't in `GLOBAL_SITE_MAP.md`
- Schema.org data requires a new Supabase table (hand off to Backend Agent)

---

## 5. ADMIN CONTROL CENTER AGENT

**Working Root(s):**
- `SOCELLE-WEB/src/pages/admin/` — ADD ONLY (no deleting or restructuring existing admin pages)
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (admin-specific tables/views)

**Read-Only Allowed:**
- `SOCELLE-WEB/src/components/` (shared component reference)
- `SOCELLE-WEB/src/lib/` (hook reference, no writes)
- `docs/command/*`
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- `SOCELLE-WEB/src/pages/public/` — Web Agent domain
- `SOCELLE-WEB/src/pages/portal/` — Web Agent domain
- `SOCELLE-WEB/src/pages/brand/` — Web Agent domain
- `SOCELLE-WEB/src/pages/business/` — Web Agent domain
- `SOCELLE-MOBILE-main/` — Mobile Agent domain
- Commerce flow
- `SOCELLE-WEB/src/lib/auth.tsx`

**Protected Files (this agent):**
- Existing admin pages (add new; never delete existing)
- `SOCELLE-WEB/src/lib/auth.tsx`
- `SOCELLE-WEB/src/lib/useCart.ts`

**Typical Tasks:**
- Build new admin dashboard panels and data views
- Create admin-scoped Supabase migrations (admin tables, RLS admin policies)
- Implement admin management interfaces for brands, jobs, events, users
- Add audit logging hooks to admin actions
- Wire admin tables to real DB with RLS (admins only)
- Build moderation queues for content approval

**Escalate to Command Center when…:**
- An admin action requires modifying public-facing pages
- Admin RLS policies conflict with existing user-role RLS
- A new admin feature touches commerce or auth flow

---

## 6. AI AGENT

**Working Root(s):**
- `SOCELLE-WEB/supabase/functions/ai-orchestrator/` — full read/write
- `SOCELLE-WEB/supabase/functions/ai-concierge/` — full read/write
- `SOCELLE-WEB/supabase/functions/generate-embeddings/` — full read/write
- `SOCELLE-WEB/src/pages/business/AIAdvisor.tsx` — with explicit WO
- `SOCELLE-WEB/src/pages/brand/BrandAIAdvisor.tsx` — with explicit WO
- `SOCELLE-MOBILE-main/apps/mobile/lib/features/` — AI-related features only, with WO
- `supabase/migrations/` — ADD ONLY (credit system schema)

**Read-Only Allowed:**
- `SOCELLE-WEB/src/lib/` (hook reference)
- `docs/command/SOCELLE_DATA_PROVENANCE_POLICY.md`
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- `SOCELLE-WEB/supabase/functions/send-email/` — transactional only; no cold outreach
- `SOCELLE-WEB/supabase/functions/create-checkout/` — FROZEN
- `SOCELLE-WEB/supabase/functions/stripe-webhook/` — FROZEN
- `SOCELLE-WEB/src/pages/public/` — Web Agent domain
- `apps/marketing-site/` — SEO Agent domain
- Any front-end file that would expose raw LLM prompts to client

**Protected Files (this agent):**
- `SOCELLE-WEB/src/lib/auth.tsx`
- `SOCELLE-WEB/src/lib/useCart.ts`
- `supabase/functions/send-email/index.ts` (no cold outreach additions)

**Typical Tasks:**
- Build and update AI orchestrator routing logic
- Build and update AI concierge conversation flows
- Implement credit deduction on AI feature usage
- Generate and store embeddings for intelligence content
- Wire AI advisor surfaces to orchestrator (never direct client→LLM)
- Enforce `SOCELLE_DATA_PROVENANCE_POLICY.md` confidence scoring on AI outputs

**Escalate to Command Center when…:**
- An AI feature requires a new public-facing page (hand off to Web Agent)
- Credit/billing logic touches commerce flow
- An LLM provider change affects data provenance compliance

---

## 7. AFFILIATES AGENT

**Working Root(s):**
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (affiliates schema)
- `SOCELLE-WEB/src/pages/portal/` — affiliates surfaces only, with explicit WO
- `SOCELLE-WEB/src/pages/brand/` — affiliates surfaces only, with explicit WO

**Read-Only Allowed:**
- `SOCELLE-WEB/src/lib/` (hook reference)
- `docs/command/SOCELLE_ENTITLEMENTS_PACKAGING.md`
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- `SOCELLE-WEB/src/pages/public/` — Web Agent domain
- Commerce checkout flow — FROZEN
- `apps/marketing-site/` — SEO Agent domain
- `SOCELLE-MOBILE-main/` — Mobile Agent domain

**Protected Files (this agent):**
- `SOCELLE-WEB/src/lib/auth.tsx`
- `SOCELLE-WEB/src/lib/useCart.ts`
- Any existing migration file

**Typical Tasks:**
- Create affiliate referral tracking schema (migrations)
- Build affiliate dashboard portal pages
- Implement attribution tracking for referral conversions
- Add FTC disclosure components to affiliate surfaces
- Wire affiliate commissions to real DB (not hardcoded)
- Validate attribution chain from click → signup → conversion

**Escalate to Command Center when…:**
- Attribution logic requires touching commerce checkout
- A new public referral landing page is needed (hand off to Web Agent)
- Commission payout logic requires Stripe changes (FROZEN — owner approval)

---

## 8. JOBS PIPELINE AGENT

**Working Root(s):**
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (job_postings, applications schema)
- `SOCELLE-WEB/src/pages/public/Jobs.tsx` — read/write
- `SOCELLE-WEB/src/pages/public/JobDetail.tsx` — read/write

**Read-Only Allowed:**
- `SOCELLE-WEB/src/pages/portal/` (portal job surfaces — reference only)
- `SOCELLE-WEB/src/lib/` (hook reference)
- `docs/command/GLOBAL_SITE_MAP.md`
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- Portal job management pages — Web Agent domain (with WO)
- Commerce flow — FROZEN
- `apps/marketing-site/` — SEO Agent domain
- `SOCELLE-MOBILE-main/` — Mobile Agent domain

**Protected Files (this agent):**
- `SOCELLE-WEB/src/lib/auth.tsx`
- Any existing migration file

**Typical Tasks:**
- Wire `Jobs.tsx` and `JobDetail.tsx` to `job_postings` Supabase table
- Add Schema.org `JobPosting` structured data
- Build ingestion pipelines for external job feed imports
- Implement job deduplication logic
- Add DEMO badges to hardcoded job surfaces
- Maintain `employment_type`, `created_at` schema alignment between DB and frontend types

**Escalate to Command Center when…:**
- A new job-related portal page is needed (hand off to Web Agent with WO)
- Job application data storage requires PII handling design decision
- Ingestion pipeline requires a new edge function (hand off to Backend Agent)

---

## 9. JOBS MARKETPLACE AGENT

**Working Root(s):**
- `SOCELLE-WEB/src/pages/business/` — job marketplace features only, with explicit WO
- `SOCELLE-WEB/src/pages/brand/` — brand job posting surfaces only, with explicit WO
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (marketplace-specific schema)

**Read-Only Allowed:**
- `SOCELLE-WEB/src/pages/public/Jobs.tsx` (public surface reference)
- `SOCELLE-WEB/src/lib/` (hook reference)
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- `SOCELLE-WEB/src/pages/public/` layout — Web Agent domain
- Commerce flow — FROZEN
- `apps/marketing-site/` — SEO Agent domain
- `SOCELLE-MOBILE-main/` — Mobile Agent domain

**Protected Files (this agent):**
- `SOCELLE-WEB/src/lib/auth.tsx`
- `SOCELLE-WEB/src/lib/useCart.ts`

**Typical Tasks:**
- Build brand-side job posting management interfaces
- Build professional-side job application flows
- Implement applicant data RLS (tenant-scoped — brands see only their applicants)
- Wire job match scores to intelligence layer (not hardcoded)
- Build portal job application status tracking
- Add marketplace search and filter features

**Escalate to Command Center when…:**
- A feature requires exposing applicant PII across tenant boundaries
- Job matching logic requires new AI embedding (hand off to AI Agent)
- A new public route is needed for marketplace discovery

---

## 10. EDITORIAL / NEWS AGENT

**Working Root(s):**
- `SOCELLE-WEB/src/pages/public/` — news/editorial pages only (News.tsx, NewsDetail.tsx, etc.)
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (news/articles schema)
- `SOCELLE-WEB/supabase/functions/` — ADD ONLY (RSS ingestion, content pipeline)

**Read-Only Allowed:**
- `docs/command/SOCELLE_DATA_PROVENANCE_POLICY.md`
- `docs/command/GLOBAL_SITE_MAP.md`
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- Portal pages — Web Agent domain
- Commerce flow — FROZEN
- `apps/marketing-site/` — SEO Agent domain
- `SOCELLE-MOBILE-main/` — Mobile Agent domain

**Protected Files (this agent):**
- `SOCELLE-WEB/src/lib/auth.tsx`
- Any existing migration file

**Typical Tasks:**
- Build RSS ingestion edge functions (`rss_items` table pipeline)
- Wire news/editorial pages to `rss_items` or `articles` Supabase table
- Implement content deduplication for RSS sources
- Add Schema.org `NewsArticle` structured data
- Apply `SOCELLE_DATA_PROVENANCE_POLICY.md` source attribution and confidence scoring
- Add DEMO badges to hardcoded editorial surfaces

**Escalate to Command Center when…:**
- An editorial surface requires a paid content model (touches commerce — FROZEN)
- A new content type requires a new public route not in `GLOBAL_SITE_MAP.md`
- Source data provenance cannot be verified per policy

---

## 11. CRM AGENT

**Working Root(s):**
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (CRM schema)
- `SOCELLE-WEB/src/pages/business/` — CRM features only, with explicit WO
- `SOCELLE-WEB/src/pages/brand/` — CRM features only, with explicit WO

**Read-Only Allowed:**
- `SOCELLE-WEB/src/lib/` (hook reference)
- `docs/command/SOCELLE_ENTITLEMENTS_PACKAGING.md`
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- `SOCELLE-WEB/src/pages/public/` — Web Agent domain
- Commerce flow — FROZEN
- Cold outreach or DM automation — FORBIDDEN (CLAUDE.md §G)
- `apps/marketing-site/` — SEO Agent domain
- `SOCELLE-MOBILE-main/` — Mobile Agent domain

**Protected Files (this agent):**
- `SOCELLE-WEB/src/lib/auth.tsx`
- `SOCELLE-WEB/src/lib/useCart.ts`
- `supabase/functions/send-email/index.ts` (no cold outreach additions)

**Typical Tasks:**
- Build professional and brand CRM portal interfaces
- Create CRM schema migrations (contacts, pipelines, notes)
- Implement tenant-scoped RLS on all CRM tables
- Wire CRM activity feeds to real `updated_at` timestamps
- Build contact import/export flows (no PII leakage between tenants)
- Add CRM intelligence hooks (brand signal overlays)

**Escalate to Command Center when…:**
- CRM automation would trigger outbound email (must remain transactional only)
- Cross-tenant data access is requested by any CRM feature
- A CRM feature requires monetization gating (touches commerce — FROZEN)

---

## 12. MARKETING STUDIO AGENT

**Working Root(s):**
- `SOCELLE-WEB/src/pages/business/` — marketing studio features only, with explicit WO
- `SOCELLE-WEB/src/pages/brand/` — campaign builder features only, with explicit WO
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (campaigns, content calendar schema)

**Read-Only Allowed:**
- `SOCELLE-WEB/supabase/functions/send-email/` (reference only — no modifications)
- `SOCELLE-WEB/src/lib/` (hook reference)
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- Cold email copy or outbound acquisition flows — FORBIDDEN (CLAUDE.md §G)
- Commerce flow — FROZEN
- `SOCELLE-WEB/src/pages/public/` — Web Agent domain
- `apps/marketing-site/` — SEO Agent domain
- `SOCELLE-MOBILE-main/` — Mobile Agent domain

**Protected Files (this agent):**
- `SOCELLE-WEB/src/lib/auth.tsx`
- `supabase/functions/send-email/index.ts` (transactional only — no cold outreach)

**Typical Tasks:**
- Build campaign builder interfaces for brand portal
- Build marketing calendar views for business portal
- Implement content scheduling schema and UI
- Wire campaign analytics to real attribution data (not hardcoded)
- Build audience targeting interfaces (intelligence-layer driven)
- Implement brand-sponsored content disclosure components

**Escalate to Command Center when…:**
- A marketing feature would trigger outbound cold email (FORBIDDEN)
- A campaign requires payment processing (touches commerce — FROZEN)
- A feature requires new AI content generation (hand off to AI Agent)

---

## 13. EDUCATION STUDIO AGENT

**Working Root(s):**
- `SOCELLE-WEB/src/pages/public/Education.tsx` — read/write
- `SOCELLE-WEB/src/pages/public/Protocols.tsx` — read/write
- `SOCELLE-WEB/src/pages/public/ProtocolDetail.tsx` — read/write
- `SOCELLE-WEB/src/pages/business/` — CE credits features only, with explicit WO
- `SOCELLE-WEB/src/pages/admin/` — admin education management only, ADD ONLY
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (education, CE credits schema)

**Read-Only Allowed:**
- `SOCELLE-WEB/src/lib/` (hook reference)
- `docs/command/SOCELLE_DATA_PROVENANCE_POLICY.md`
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- Commerce checkout for CE credits — FROZEN
- `apps/marketing-site/` — SEO Agent domain
- `SOCELLE-MOBILE-main/` — Mobile Agent domain

**Protected Files (this agent):**
- `SOCELLE-WEB/src/lib/auth.tsx`
- `SOCELLE-WEB/src/lib/useCart.ts`

**Typical Tasks:**
- Wire `Education.tsx` to `brand_training_modules` Supabase table
- Wire `Protocols.tsx` and `ProtocolDetail.tsx` to `canonical_protocols` table
- Add `(est.)` qualifiers to hardcoded adoption counts
- Build CE credit tracking schema and UI
- Add Schema.org `Course` or `EducationalOccupationalCredential` structured data
- Ensure education is positioned within the intelligence layer (not as standalone ecommerce)

**Escalate to Command Center when…:**
- CE credit monetization is requested (touches commerce — FROZEN)
- A new protocol category requires a schema change (hand off to Backend Agent)
- Education content attribution cannot be verified per `SOCELLE_DATA_PROVENANCE_POLICY.md`

---

## 14. SOCIAL STUDIO AGENT

**Working Root(s):**
- `SOCELLE-WEB/src/pages/business/` — social studio features only, with explicit WO
- `SOCELLE-WEB/src/pages/brand/` — social brand features only, with explicit WO
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (social content schema)
- `SOCELLE-WEB/supabase/functions/` — ADD ONLY (social publishing functions, non-DM)

**Read-Only Allowed:**
- `SOCELLE-WEB/src/lib/` (hook reference)
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- Automated DM or cold outreach — FORBIDDEN (CLAUDE.md §G)
- Commerce flow — FROZEN
- `SOCELLE-WEB/src/pages/public/` — Web Agent domain
- `apps/marketing-site/` — SEO Agent domain
- `SOCELLE-MOBILE-main/` — Mobile Agent domain

**Protected Files (this agent):**
- `SOCELLE-WEB/src/lib/auth.tsx`
- `SOCELLE-WEB/src/lib/useCart.ts`
- `supabase/functions/send-email/index.ts`

**Typical Tasks:**
- Build social content calendar and scheduling interfaces
- Implement brand social content publishing flows
- Build social analytics dashboard panels (real DB, not hardcoded)
- Wire social content to intelligence signal overlays
- Add cross-channel content preview components
- Implement content approval workflows

**Escalate to Command Center when…:**
- A social feature would automate direct messages (FORBIDDEN)
- A publishing feature requires a new third-party OAuth (security review required)
- Social analytics require cross-tenant data access

---

## 15. SALES STUDIO AGENT

**Working Root(s):**
- `SOCELLE-WEB/src/pages/business/` — sales studio features only, with explicit WO
- `SOCELLE-WEB/src/pages/brand/` — brand leads/pipeline features only, with explicit WO
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (sales pipeline, leads schema)

**Read-Only Allowed:**
- `SOCELLE-WEB/src/lib/` (hook reference)
- `docs/command/SOCELLE_ENTITLEMENTS_PACKAGING.md`
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- Cold outreach or acquisition email — FORBIDDEN (CLAUDE.md §G)
- Commerce checkout — FROZEN
- `SOCELLE-WEB/src/pages/public/` — Web Agent domain
- `apps/marketing-site/` — SEO Agent domain
- `SOCELLE-MOBILE-main/` — Mobile Agent domain

**Protected Files (this agent):**
- `SOCELLE-WEB/src/lib/auth.tsx`
- `SOCELLE-WEB/src/lib/useCart.ts`
- `supabase/functions/send-email/index.ts`

**Typical Tasks:**
- Build brand lead management pipeline UI
- Build professional-to-brand connection request flows
- Implement commission tracking schema (real DB, not hardcoded)
- Wire pipeline stages to real `updated_at` timestamps (no fake-live claims)
- Add entitlement gating to sales features per `SOCELLE_ENTITLEMENTS_PACKAGING.md`
- Build sales activity feed components

**Escalate to Command Center when…:**
- A sales feature would trigger outbound cold contact (FORBIDDEN)
- Commission payout requires Stripe integration (FROZEN — owner approval)
- A new public-facing sales/pricing page is needed (hand off to Web Agent)

---

## 16. QUIZZES / POLLS AGENT

**Working Root(s):**
- `SOCELLE-WEB/src/pages/public/` — quiz/poll public surfaces only, with explicit WO
- `SOCELLE-WEB/src/pages/business/` — quiz/poll business surfaces only, with explicit WO
- `SOCELLE-WEB/src/pages/brand/` — quiz/poll brand surfaces only, with explicit WO
- `SOCELLE-WEB/src/pages/admin/` — quiz/poll admin management only, ADD ONLY
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (quizzes, polls, responses schema)

**Read-Only Allowed:**
- `SOCELLE-WEB/src/lib/` (hook reference)
- `docs/command/SOCELLE_CANONICAL_DOCTRINE.md`
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- Commerce gating of quiz results — FROZEN
- `apps/marketing-site/` — SEO Agent domain
- `SOCELLE-MOBILE-main/` — Mobile Agent domain

**Protected Files (this agent):**
- `SOCELLE-WEB/src/lib/auth.tsx`
- `SOCELLE-WEB/src/lib/useCart.ts`

**Typical Tasks:**
- Build quiz and poll creation interfaces for brand portal
- Build public-facing quiz/poll participation flows
- Implement quiz result intelligence overlays (intelligence-first positioning)
- Add sponsor disclosure to brand-sponsored quizzes
- Wire poll results to real DB aggregate counts (no hardcoded vote counts)
- Build admin quiz/poll moderation management

**Escalate to Command Center when…:**
- A quiz requires a paywall (touches commerce — FROZEN)
- A brand-sponsored quiz requires special legal disclosure not in existing templates
- Quiz result aggregation surfaces cross-tenant PII

---

## 17. RECRUITMENT / OPS AGENT

**Status: BLOCKED**
**Reason:** CLAUDE.md §G — No outreach email copy may be drafted or sent. Recruitment flows inherently require outreach. Blocked until product owner explicitly lifts §G in writing.

**Working Root(s):** NONE — all paths forbidden until unblocked

**Forbidden:** ALL paths

**To unblock:** Owner must amend `/.claude/CLAUDE.md §G` with explicit written authorization. Command Center Agent processes the amendment via change control (§H).

---

## 18. COMMAND CENTER AGENT

**Working Root(s):**
- `docs/command/` — full read/write (change control process applies per CLAUDE.md §H)
- `/.claude/CLAUDE.md` — read/write (owner approval required for semantic changes)
- `/.agents/workflows/` — full read/write
- `SOCELLE-WEB/docs/build_tracker.md` — read/write (WO status updates only)
- `SOCELLE-WEB/MASTER_STATUS.md` — read/write (status snapshot only)

**Read-Only Allowed:**
- ALL code paths (read for audit/governance only)
- ALL migration files (read for integrity review only)

**Forbidden:**
- ALL `src/` directories — no code changes
- ALL `supabase/migrations/` — no schema changes
- ALL `supabase/functions/` — no function changes
- Commerce flow, auth system — NEVER TOUCH

**Protected Files (this agent):**
- All migration files (read-only)
- All source code files (read-only)

**Typical Tasks:**
- Update command docs per change control process
- Resolve contradictions between command docs and app files
- Add new WO IDs to `build_tracker.md`
- Update `MASTER_STATUS.md` status snapshots
- Write and update agent workflow files in `/.agents/workflows/`
- Coordinate cross-agent handoffs

**Escalate to Command Center when…:**
- (This IS the Command Center — escalate to product owner when:)
- A governance rule requires owner approval per §H
- Two command docs directly contradict each other
- A security boundary needs to be permanently modified

---

## 19. DOC GATE QA AGENT

**Working Root(s):**
- `docs/command/HARD_CODED_SURFACES.md` — write ONLY when explicitly permitted per WO
- NO other write access

**Read-Only Allowed:**
- ALL paths in the monorepo (full read for audit purposes)

**Forbidden:**
- ALL write operations except `HARD_CODED_SURFACES.md` (with explicit WO)
- Any code modification
- Any migration creation or modification
- Any governance doc modification (Command Center only)

**Protected Files (this agent):**
- ALL files (read-only agent)

**Typical Tasks:**
- Audit all agent outputs against FAIL 1–7 conditions
- Verify LIVE vs DEMO labels on all data surfaces
- Confirm WO IDs exist in `build_tracker.md`
- Validate no ecommerce IA elevation (FAIL 6)
- Check for fake-live claims (FAIL 4)
- Update `HARD_CODED_SURFACES.md` with newly discovered hardcoded surfaces

**Escalate to Command Center when…:**
- A FAIL condition is found in a command doc itself
- A FAIL condition cannot be resolved without a governance rule change
- An agent output passes Doc Gate but conflicts with business requirements

---

## 20. EVENTS PIPELINE AGENT

**Working Root(s):**
- `SOCELLE-WEB/src/pages/public/Events.tsx` — read/write
- `SOCELLE-WEB/src/pages/public/EventDetail.tsx` — read/write (if exists)
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (events schema)
- `SOCELLE-WEB/supabase/functions/` — ADD ONLY (event ingestion functions)

**Read-Only Allowed:**
- `SOCELLE-WEB/src/lib/` (hook reference)
- `docs/command/SOCELLE_DATA_PROVENANCE_POLICY.md`
- `docs/command/GLOBAL_SITE_MAP.md`
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- Portal event management pages — Web Agent domain (with WO)
- Commerce ticketing — FROZEN
- `apps/marketing-site/` — SEO Agent domain
- `SOCELLE-MOBILE-main/` — Mobile Agent domain

**Protected Files (this agent):**
- `SOCELLE-WEB/src/lib/auth.tsx`
- Any existing migration file

**Typical Tasks:**
- Wire `Events.tsx` to `events` Supabase table (DEMO → LIVE)
- Build event ingestion functions from external sources
- Add Schema.org `Event` structured data
- Implement event deduplication logic
- Add DEMO badges to hardcoded event surfaces
- Wire event counts to real `COUNT(*)` queries

**Escalate to Command Center when…:**
- Event ticketing or RSVP requires payment (touches commerce — FROZEN)
- A new events portal management page is needed (hand off to Web Agent with WO)
- An external event data source cannot meet `SOCELLE_DATA_PROVENANCE_POLICY.md` freshness SLA

---

## 21. ANALYTICS / ATTRIBUTION AGENT

**Working Root(s):**
- `SOCELLE-WEB/src/lib/analytics/` — full read/write
- `SOCELLE-WEB/src/lib/tracking.ts` — read/write
- `apps/marketing-site/` analytics config — with SEO Agent coordination
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (analytics schema)

**Read-Only Allowed:**
- `SOCELLE-WEB/src/pages/` (read for instrumentation audit only — no writes)
- `SOCELLE-WEB/src/components/` (read for event hook audit only — no writes)
- `docs/command/*`
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- `SOCELLE-WEB/src/pages/` layout changes — Web Agent domain
- PII in analytics payloads — FORBIDDEN always
- Commerce flow — FROZEN
- `SOCELLE-MOBILE-main/` — Mobile Agent domain (coordinate for mobile analytics)

**Protected Files (this agent):**
- `SOCELLE-WEB/src/lib/auth.tsx`
- `SOCELLE-WEB/src/lib/useCart.ts`

**Typical Tasks:**
- Build analytics event tracking library
- Implement Core Web Vitals monitoring
- Wire attribution tracking from referral click → signup → conversion
- Build analytics dashboard data schema (migrations)
- Audit pages for missing tracking hooks (read-only audit — no layout changes)
- Ensure no PII in analytics event payloads

**Escalate to Command Center when…:**
- Attribution requires reading cross-tenant conversion data
- An analytics vendor requires new OAuth or data sharing agreement
- Core Web Vitals budget is exceeded and a page layout change is needed (hand off to Web Agent)

---

## 22. DESIGN PARITY AGENT

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
- `SOCELLE-MOBILE-main/apps/mobile/lib/` beyond `socelle_theme.dart` — Mobile Agent domain
- Commerce flow — FROZEN
- `supabase/` — Backend Agent domain
- `apps/marketing-site/` — SEO Agent domain

**Protected Files (this agent):**
- `SOCELLE-WEB/src/lib/auth.tsx`
- `SOCELLE-WEB/src/lib/useCart.ts`
- All migration files

**Typical Tasks:**
- Audit and fix banned color token usage (`#1E252B` as text, etc.)
- Remove `font-serif` from public pages
- Sync Figma token changes to `tailwind.config.js` and `socelle_theme.dart`
- Validate Pearl Mineral V2 token names in web and mobile
- Generate no-drift checklist compliance report
- Flag pages with banned design tokens for Web/Mobile Agent fix

**Escalate to Command Center when…:**
- A Figma token change requires a semantic rename that affects component logic (not just values)
- A design decision in `SOCELLE_CANONICAL_DOCTRINE.md` is ambiguous or outdated
- A banned token is used inside commerce or auth components (requires owner decision)

---

## 23. INFRA / DEVOPS AGENT

**Working Root(s):**
- `.github/workflows/` — full read/write
- `wrangler.toml` (monorepo root) — read/write
- `SOCELLE-WEB/.netlify/netlify.toml` — read/write
- `turbo.json` — read/write
- `package.json` (root) — read/write (dependency/script management only)
- `SOCELLE-WEB/package.json` — read/write (dependency/script management only)

**Read-Only Allowed:**
- ALL source directories (build audit — no code changes)
- `docs/command/*`
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- `src/pages/` — Web Agent domain
- `supabase/migrations/` — Backend Agent domain (no schema changes via DevOps)
- Commerce flow — FROZEN
- No secrets committed to any file (hard rule)
- `SOCELLE-MOBILE-main/` beyond build config — Mobile Agent domain

**Protected Files (this agent):**
- `SOCELLE-WEB/src/lib/auth.tsx`
- `SOCELLE-WEB/src/lib/useCart.ts`
- All migration files

**Typical Tasks:**
- Build and maintain CI/CD pipeline workflows
- Configure environment variable management (no secrets in files)
- Set up preview deploy environments
- Maintain build scripts and monorepo tooling (`turbo.json`)
- Configure CDN and edge rules (`wrangler.toml`, `netlify.toml`)
- Monitor and resolve build failures

**Escalate to Command Center when…:**
- A CI/CD gate needs to be bypassed for a hotfix (owner approval required)
- A new secret or API key needs to be added to the environment
- Infrastructure changes would affect the Launch Gate (CLAUDE.md — no production deploy without owner sign-off)

---

## 24. i18n / LOCALIZATION AGENT

**Working Root(s):**
- `SOCELLE-WEB/src/lib/i18n/` — full read/write
- `SOCELLE-WEB/src/locales/` — full read/write
- `SOCELLE-MOBILE-main/apps/mobile/lib/l10n/` — full read/write
- `apps/marketing-site/` localization files — with SEO Agent coordination

**Read-Only Allowed:**
- `SOCELLE-WEB/src/pages/` (string extraction audit — no writes)
- `SOCELLE-MOBILE-main/apps/mobile/lib/` (string extraction audit — no writes)
- `docs/command/*`
- `SOCELLE-WEB/docs/build_tracker.md`

**Forbidden:**
- `SOCELLE-WEB/src/pages/` layout changes — Web Agent domain
- Commerce flow — FROZEN
- `supabase/migrations/` — Backend Agent domain
- Any page logic changes (localization strings only)

**Protected Files (this agent):**
- `SOCELLE-WEB/src/lib/auth.tsx`
- `SOCELLE-WEB/src/lib/useCart.ts`
- All migration files

**Typical Tasks:**
- Extract hardcoded strings from pages into i18n key files
- Add locale files for new supported languages
- Implement `hreflang` tags on public pages (coordinate with SEO Agent)
- Wire i18n library into page components (string replacement only — no layout changes)
- Validate locale completeness (no missing keys)
- Sync mobile and web locale files for shared string keys

**Escalate to Command Center when…:**
- A locale requires right-to-left layout changes (requires Web Agent coordination)
- A new language requires a new Supabase locale column (hand off to Backend Agent)
- Localization of a brand name or trademark requires legal review

---

## UNIVERSAL ESCALATION PATH

```
Agent detects out-of-scope task
  → STOP work
  → Document: what was requested + why it's out of scope
  → Hand off to: correct agent per this file
  → If no clear owner: escalate to Command Center Agent
  → Command Center: resolves via docs/command/ or escalates to product owner (Bruce)
```

---

## VERSION HISTORY

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-03-06 | Initial creation — 24 agents defined |

---
*Authority: `/.claude/CLAUDE.md` §A + `docs/command/AGENT_SCOPE_REGISTRY.md` — Command Center only may modify this file per change control §H*
