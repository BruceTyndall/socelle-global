# AGENT SCOPE REGISTRY
**Version:** 1.0  
**Effective:** March 5, 2026  
**Authority:** `/.claude/CLAUDE.md` §A → `docs/command/SOCELLE_CANONICAL_DOCTRINE.md`  
**Scope:** All agents operating in the SOCELLE monorepo

---

## PURPOSE

This registry defines the boundary, skills, allowed paths, forbidden paths, and required proof artifacts for every recognized agent in the SOCELLE monorepo. No agent may operate outside its defined scope without an explicit WO in `SOCELLE-WEB/docs/build_tracker.md`. No agent may invent WO IDs.

**Contradiction resolution:** If any agent output contradicts a command doc, the command doc wins. Update the agent output, not the command doc.

---

## GLOBAL RULES (APPLY TO ALL AGENTS)

| Rule | Enforcement |
|---|---|
| Read `/.claude/CLAUDE.md` before any work | Non-negotiable — no exceptions |
| Read this file before any work | Non-negotiable — no exceptions |
| All WO IDs must exist in `build_tracker.md` | Inventing WO IDs = FAIL 2, auto-block |
| Do not modify files outside your allowed path list | Cross-boundary work requires explicit owner approval |
| Do not create governance docs outside `/docs/command/` | FAIL 2 |
| Do not draft outreach emails or cold acquisition copy | FAIL 7 — see `/.claude/CLAUDE.md §G` |
| Label all data surfaces LIVE or DEMO | FAIL 4 for violations |
| Ecommerce is a module — never an IA center | FAIL 6 for violations |
| Pass Doc Gate (all 7 FAIL conditions) | Required before any output is considered complete |

---

## AGENT DEFINITIONS

---

### 1. WEB AGENT

**Description:** Full-stack web development for SOCELLE-WEB (Vite + React 18 + TypeScript + Tailwind + Supabase).

**Required Skills:**
- React 18 (RSC-aware patterns, React Router v7)
- TypeScript strict mode
- Tailwind CSS v3.4 (custom token system — Pearl Mineral V2)
- Supabase JS SDK v2 (auth, PostgreSQL, edge functions)
- Vite 5.4 build tooling
- react-helmet-async (SEO meta)
- General Sans / Fontshare CDN integration

**Allowed Paths:**
- `SOCELLE-WEB/src/pages/public/` — Full read/write (public pages)
- `SOCELLE-WEB/src/components/` — Read/write (UI components)
- `SOCELLE-WEB/src/layouts/` — Read/write (layout shells)
- `SOCELLE-WEB/src/lib/` — Read/write (hooks, services — except protected files below)
- `SOCELLE-WEB/src/App.tsx` — Read/write (route registration only)
- `SOCELLE-WEB/tailwind.config.js` — Extend only (never replace tokens)
- `SOCELLE-WEB/docs/build_tracker.md` — Update WO status at session end
- `SOCELLE-WEB/MASTER_STATUS.md` — Read-only (status snapshot)
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (never modify existing)
- `SOCELLE-WEB/supabase/functions/` — Read/write for new functions; never modify existing
- Portal pages (below) — only with explicit WO in `build_tracker.md`:
  - `SOCELLE-WEB/src/pages/business/` — DO NOT MODIFY without WO
  - `SOCELLE-WEB/src/pages/brand/` — DO NOT MODIFY without WO
  - `SOCELLE-WEB/src/pages/admin/` — ADD ONLY (stub completion), no deletions

**Forbidden Paths (absolute — no exceptions):**
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- `SOCELLE-MOBILE-main/` — NEVER TOUCH
- `apps/marketing-site/` — SEO Agent domain, not Web Agent
- `packages/` — Read only; write requires Backend Agent coordination
- `supabase/` (monorepo root) — Backend Agent domain

**Required Proofs Before Marking Work Complete:**
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `npm run build` — no build errors
- [ ] No `pro-*` tokens in `src/pages/public/`
- [ ] No `font-serif` in `src/pages/public/`
- [ ] `graphite` = `#141418`, background = `#F6F3EF`
- [ ] All data surfaces labeled LIVE or DEMO
- [ ] MainNav: Intelligence is position 1; ecommerce not in MainNav
- [ ] Auth-aware right pill present and correct
- [ ] `build_tracker.md` updated with session WO completion

---

### 2. MOBILE AGENT

**Description:** Flutter native app development for SOCELLE-MOBILE (Flutter + Riverpod + Supabase).

**Required Skills:**
- Flutter 3.x + Dart
- Riverpod state management
- Supabase Dart SDK
- `socelle_theme.dart` design token system (must stay in parity with web tokens)
- RevenueCat (in-app subscriptions — Phase 6)

**Allowed Paths:**
- `SOCELLE-MOBILE-main/apps/mobile/lib/` — Full read/write
- `SOCELLE-MOBILE-main/apps/mobile/pubspec.yaml` — Read/write (dependency management)
- `SOCELLE-MOBILE-main/apps/mobile/ios/` — Read/write (iOS config)
- `SOCELLE-MOBILE-main/apps/mobile/android/` — Read/write (Android config)

**Forbidden Paths (absolute — no exceptions):**
- `SOCELLE-WEB/` — NEVER TOUCH
- `apps/marketing-site/` — NEVER TOUCH
- `supabase/migrations/` — NEVER MODIFY (read schema only)
- `supabase/functions/` — NEVER MODIFY (read edge function signatures only)
- `packages/` — Read only

**Required Proofs Before Marking Work Complete:**
- [ ] `flutter analyze` — zero errors
- [ ] `flutter build apk --debug` or `flutter build ios --debug` — no build errors
- [ ] Design tokens in parity with web spec (`socelle_theme.dart`)
- [ ] No hardcoded data presented as live without DEMO label

---

### 3. BACKEND AGENT

**Description:** Supabase PostgreSQL schema, migrations, edge functions, and RLS policies.

**Required Skills:**
- PostgreSQL (RLS, triggers, RPCs, tsvector)
- Supabase migrations (ADD ONLY policy — never modify existing)
- Deno / TypeScript (edge functions)
- Resend (transactional email via `send-email` edge function)
- OpenRouter AI integration (ai-orchestrator edge function)
- Stripe (webhook handler — not yet active)

**Allowed Paths:**
- `supabase/migrations/` (monorepo root) — ADD ONLY
- `supabase/functions/` (monorepo root) — Read/write new functions; never modify deployed functions without WO
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY
- `SOCELLE-WEB/supabase/functions/` — Read/write new; never modify deployed without WO
- `packages/` — Read/write (shared config + schema types)

**Forbidden Paths (absolute — no exceptions):**
- `SOCELLE-WEB/src/` — NEVER MODIFY directly (schema changes propagate via types only)
- `SOCELLE-MOBILE-main/` — NEVER TOUCH
- `apps/marketing-site/` — NEVER TOUCH
- Existing migration files — NEVER MODIFY (ADD ONLY policy is absolute)

**Required Proofs Before Marking Work Complete:**
- [ ] Migration file follows `YYYYMMDDHHMMSS_description.sql` naming
- [ ] RLS policies defined for every new table
- [ ] `supabase db push` dry run — no conflicts
- [ ] Edge function type-checks via Deno
- [ ] `build_tracker.md` updated with migration record

---

### 4. SEO / SCHEMA / SITEMAPS AGENT

**Description:** SEO infrastructure for the marketing site (`apps/marketing-site/`) and web app SEO utilities.

**Required Skills:**
- Next.js App Router (marketing site)
- JSON-LD / Schema.org markup (JobPosting, Event, Organization, BreadcrumbList, FAQPage)
- Sitemap generation (programmatic via Next.js `sitemap.ts`)
- robots.txt management
- `react-helmet-async` (SOCELLE-WEB SEO meta tags)
- Core Web Vitals / PageSpeed optimization
- Canonical URL management

**Allowed Paths:**
- `apps/marketing-site/` — Full read/write
- `SOCELLE-WEB/src/lib/seo.ts` — Read/write (SEO utilities)
- `SOCELLE-WEB/src/pages/public/` — Read; add/update Helmet meta only (no layout changes without Web Agent)
- `SOCELLE-WEB/public/sitemap.xml` — Read/write
- `SOCELLE-WEB/public/robots.txt` — Read/write

**Forbidden Paths (absolute — no exceptions):**
- `SOCELLE-WEB/src/pages/business/` — NEVER TOUCH
- `SOCELLE-WEB/src/pages/brand/` — NEVER TOUCH
- `SOCELLE-WEB/src/pages/admin/` — NEVER TOUCH
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER TOUCH
- `SOCELLE-WEB/supabase/` — NEVER TOUCH (read schema for schema markup only)
- `SOCELLE-MOBILE-main/` — NEVER TOUCH

**Required Proofs Before Marking Work Complete:**
- [ ] Schema.org JSON-LD validates via `schema.org` validator or Google Rich Results Test
- [ ] Sitemap renders valid XML
- [ ] All public routes in `SITE_MAP.md` covered
- [ ] `npx tsc --noEmit` — zero errors (for any `.tsx/.ts` changes)
- [ ] Canonical URLs do not duplicate across routes

---

### 5. ADMIN CONTROL CENTER AGENT

**Description:** Admin portal development (`/admin/*`) — signal curation, brand management, order oversight, ingestion controls.

**Required Skills:**
- React 18 + TypeScript (admin UI patterns)
- Supabase admin queries (direct table access, no RLS bypass without explicit policy)
- AdminLayout component awareness
- Signal curation (market_signals table + AdminMarketSignals.tsx patterns)

**Allowed Paths:**
- `SOCELLE-WEB/src/pages/admin/` — ADD ONLY (no deletion, no modification of existing admin pages without WO)
- `SOCELLE-WEB/src/components/` — Read/write (admin-specific components)
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (admin-related tables/policies)

**Forbidden Paths (absolute — no exceptions):**
- `SOCELLE-WEB/src/pages/public/` — Web Agent domain (read for context only)
- `SOCELLE-WEB/src/pages/business/` — NEVER MODIFY
- `SOCELLE-WEB/src/pages/brand/` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-MOBILE-main/` — NEVER TOUCH
- `apps/marketing-site/` — NEVER TOUCH

**Required Proofs Before Marking Work Complete:**
- [ ] `npx tsc --noEmit` — zero errors
- [ ] New admin page registered in `App.tsx` under `/admin/*`
- [ ] RLS policies confirm admin-only access
- [ ] `build_tracker.md` updated

---

### 6. AI AGENT

**Description:** AI Orchestrator, AI Concierge, and AI Advisor features across web + mobile.

**Required Skills:**
- OpenRouter API integration (Claude Sonnet, Gemini 2.5 Pro, GPT-4o-mini, Llama 3.3 via Groq)
- Atomic credit system (tenant_balances, deduct_credits(), top_up_credits() RPCs)
- Deno edge function authoring
- Supabase Realtime (for streaming AI responses)
- React hooks for AI state (web portal)
- Flutter Riverpod (mobile AI state)

**Allowed Paths:**
- `SOCELLE-WEB/supabase/functions/ai-orchestrator/` — Read/write
- `SOCELLE-WEB/supabase/functions/ai-concierge/` — Read/write
- `SOCELLE-WEB/src/pages/business/AIAdvisor.tsx` — Read/write (with WO)
- `SOCELLE-WEB/src/pages/brand/BrandAIAdvisor.tsx` — Read/write (with WO)
- `SOCELLE-MOBILE-main/apps/mobile/lib/features/` — Read/write AI-related features (with WO)
- `supabase/migrations/` — ADD ONLY (credit system schema)

**Forbidden Paths (absolute — no exceptions):**
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- `SOCELLE-WEB/supabase/functions/stripe-webhook/` — NEVER MODIFY (payment system)
- Portal pages without explicit WO — DO NOT MODIFY

**Required Proofs Before Marking Work Complete:**
- [ ] AI calls route through `ai-orchestrator` (no direct OpenAI/Anthropic calls from client)
- [ ] Credit deduction verified via `deduct_credits()` RPC call
- [ ] Atomic credit system not bypassed
- [ ] Edge function deploys without error
- [ ] `build_tracker.md` updated

---

### 7. AFFILIATES AGENT

**Description:** Affiliate program infrastructure (first-class revenue channel) — sources/programs index, affiliate tracking schema, referral links, commission logic, placement rules, disclosure compliance, affiliate portal surfaces. Placement rule: affiliate content appears AFTER intelligence context, never as the premise.

**Status:** 📋 PLANNED — No active WO. Do not build until WO exists in `build_tracker.md`.

**Required Skills (when active):**
- Supabase PostgreSQL (affiliate_links, affiliate_commissions, affiliate_payouts tables)
- Attribution token generation + referral URL tracking
- Stripe Connect (affiliate payouts — Phase 3+)
- React portal UI (affiliate dashboard)

**Allowed Paths (when active, with WO):**
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (affiliate schema)
- `SOCELLE-WEB/src/pages/` — Affiliate portal surfaces only (path TBD in WO)
- `SOCELLE-MOBILE-main/apps/mobile/lib/features/affiliate/` — Mobile affiliate feature

**Forbidden Paths (absolute — no exceptions):**
- All portal paths without explicit WO
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- Commerce flow — NEVER MODIFY

**Required Proofs (when active):**
- [ ] WO ID in `build_tracker.md` confirmed before any work begins
- [ ] Attribution logic verifiable (no ghost clicks, no unattributed payouts)
- [ ] Commission rates sourced from DB, not hardcoded

---

### 8. JOBS PIPELINE AGENT

**Description:** Back-office jobs data pipeline — ingestion, classification, deduplication, schema compliance for the `/jobs` and `/jobs/:slug` surfaces.

**Status:** 📋 PLANNED — WO W10-06 in `build_tracker.md` covers `job_postings` table. Full pipeline work requires additional WO.

**Required Skills (when active):**
- Supabase PostgreSQL (`job_postings` table, tsvector search)
- RSS / JSON feed ingestion (edge functions)
- Schema.org `JobPosting` JSON-LD
- Deduplication logic (fingerprinting by URL + title)

**Allowed Paths (when active, with WO):**
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (`job_postings` table + search index)
- `SOCELLE-WEB/supabase/functions/` — ADD ONLY (ingestion edge function)
- `SOCELLE-WEB/src/pages/public/Jobs.tsx` — Wire to live table (W10-06)
- `SOCELLE-WEB/src/pages/public/JobDetail.tsx` — Wire + add schema markup

**Forbidden Paths (absolute — no exceptions):**
- Portal pages — NEVER TOUCH (jobs portal surfaces are Web Agent scope)
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-MOBILE-main/` — NEVER TOUCH

**Required Proofs (when active):**
- [ ] WO ID in `build_tracker.md` confirmed
- [ ] `job_postings` table has RLS (public read, admin write)
- [ ] Schema.org `JobPosting` validates via Google Rich Results Test
- [ ] Deduplication: no duplicate `source_url` records
- [ ] Jobs.tsx data source labeled LIVE after wire-up

---

### 9. JOBS MARKETPLACE AGENT

**Description:** Operator-facing job posting UX — brand/operator job creation, applicant tracking, portal job management surfaces.

**Status:** 📋 PLANNED — No active WO. Requires `job_postings` table (W10-06) to complete first.

**Required Skills (when active):**
- React 18 + TypeScript (portal UI)
- Supabase Row Level Security (operator-scoped job records)
- Form design (job posting wizard)
- Applicant state machine (open → applied → reviewed → hired/closed)

**Allowed Paths (when active, with WO):**
- `SOCELLE-WEB/src/pages/business/` — Job posting / applicant management surfaces (WO required)
- `SOCELLE-WEB/src/pages/brand/` — Brand-side job management (WO required)
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (applicant tracking schema)

**Forbidden Paths (absolute — no exceptions):**
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- `SOCELLE-WEB/src/pages/public/` — Marketplace agent does not own public job pages (Jobs Pipeline Agent domain)

**Required Proofs (when active):**
- [ ] WO ID in `build_tracker.md` confirmed
- [ ] Applicant data never publicly accessible (RLS enforced)
- [ ] Job posting creation confirms to `job_postings` schema from Jobs Pipeline Agent

---

### 10. EDITORIAL / NEWS AGENT

**Description:** Beauty intelligence editorial — article ingestion, editorial curation, news digest surfaces, RSS feed management. Editorial content lives inside the Intelligence product (`/intelligence` sub-nav: Briefing | News | Signals | Categories | Trends), NOT as a standalone blog or marketing-site feature. Marketing site is not the content home.

**Status:** 📋 PLANNED — WO W10-08 (RSS ingestion pipeline) covers the initial pipeline. Editorial surfaces require additional WO.

**Required Skills (when active):**
- RSS feed parsing (edge functions)
- Content classification (category tagging, vertical matching)
- `news_items` + `editorial_posts` + `rss_items` table design (Supabase, with attribution + `updated_at`)
- React editorial card components
- Freshness attribution (`published_at`, `fetched_at`, `source_url`)

**Allowed Paths (when active, with WO):**
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (`rss_items`, editorial schema)
- `SOCELLE-WEB/supabase/functions/` — ADD ONLY (ingestion edge function — W10-08)
- `SOCELLE-WEB/src/pages/public/Intelligence.tsx` — Editorial sub-nav integration within `/intelligence` (WO required)
- `SOCELLE-WEB/src/pages/business/IntelligenceHub.tsx` — Read; editorial integration (WO required)
- `SOCELLE-WEB/src/pages/admin/` — Editorial admin surfaces: `/admin/editorial`, `/admin/news-sources`, `/admin/news-review` (ADD ONLY, WO required)

**Forbidden Paths (absolute — no exceptions):**
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/pages/brand/` — NEVER TOUCH without WO
- `SOCELLE-WEB/src/pages/admin/` — Admin Signal curation is Admin Control Center Agent scope
- Outreach / acquisition email copy — NEVER DRAFT (FAIL 7)

**Required Proofs (when active):**
- [ ] WO ID in `build_tracker.md` confirmed
- [ ] All ingested content has `source_url` + `published_at` attribution
- [ ] No editorial content displayed without visible `published_at` freshness label
- [ ] DEMO label on any hardcoded placeholder content

---

### 11. CRM AGENT

**Description:** Customer relationship management — operator CRM, brand CRM, pipeline management, contact database, interaction history tracking.

**Status:** 📋 PLANNED — Phase 3. No active WO.

**Required Skills (when active):**
- CRM data model (contacts, interactions, pipeline stages)
- React studio builder UI
- Supabase RLS (CRM data strictly tenant-scoped)
- Campaign integration (CRM → Marketing Studio handoff)

**Allowed Paths (when active, with WO):**
- `SOCELLE-WEB/src/pages/business/` — Business CRM surfaces
- `SOCELLE-WEB/src/pages/brand/` — Brand CRM surfaces (`/brand/customers`, `/brand/pipeline`)
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (CRM schema)

**Forbidden Paths (absolute — no exceptions):**
- Cross-tenant CRM data access — NEVER (RLS must prevent)
- Outreach / cold acquisition email — NEVER (FAIL 7)
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY

**Required Proofs (when active):**
- [ ] WO ID in `build_tracker.md` confirmed
- [ ] RLS prevents cross-tenant data leakage (verified by policy test)
- [ ] No cold outreach scaffolding in any CRM feature

---

### 12. MARKETING STUDIO AGENT

**Description:** Marketing studio — campaign builder, automation triggers, broadcast messaging, marketing calendar.

**Status:** 📋 PLANNED — Phase 3. No active WO.

**Required Skills (when active):**
- Campaign state machine (draft → scheduled → sent → analyzed)
- Brevo API integration (Phase 3 broadcast emails)
- Supabase triggers (automation rules)
- React drag-and-drop builder

**Allowed Paths (when active, with WO):**
- `SOCELLE-WEB/src/pages/business/MarketingCalendar.tsx` — Read/write (WO)
- `SOCELLE-WEB/src/pages/brand/Campaigns.tsx` — Read/write (WO)
- `SOCELLE-WEB/src/pages/brand/CampaignBuilder.tsx` — Read/write (WO)
- `SOCELLE-WEB/src/pages/brand/Automations.tsx` — Read/write (WO)
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (campaign schema)

**Forbidden Paths (absolute — no exceptions):**
- Outreach / cold acquisition email — NEVER (FAIL 7)
- `send-email` edge function — transactional only; no blast/cold email
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY

**Required Proofs (when active):**
- [ ] WO ID in `build_tracker.md` confirmed
- [ ] All automations have explicit operator opt-in documented
- [ ] No cold email functionality scaffolded

---

### 13. EDUCATION STUDIO AGENT

**Description:** Education Hub — course builder, protocol library, CE credits system, training scheduler.

**Status:** 📋 PLANNED — Phase 2. No active WO beyond existing `brand_training_modules`.

**Required Skills (when active):**
- Course builder UI (step wizard, video embed)
- CE credit system (credential issuance, CPD tracking)
- Zoom/live scheduler integration (Phase 2)
- Supabase `reseller_saved_protocols`, course tracking schema

**Allowed Paths (when active, with WO):**
- `SOCELLE-WEB/src/pages/public/Education.tsx` — Read/write (WO)
- `SOCELLE-WEB/src/pages/business/CECredits.tsx` — Read/write (WO)
- `SOCELLE-WEB/src/pages/admin/` — Education admin surfaces (ADD ONLY, WO)
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (education schema — Phase 2 migrations)
- `SOCELLE-MOBILE-main/apps/mobile/lib/features/studio/` — Mobile education features (WO)

**Forbidden Paths (absolute — no exceptions):**
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- Brand portal education surfaces without explicit WO

**Required Proofs (when active):**
- [ ] WO ID in `build_tracker.md` confirmed
- [ ] Phase 2 migrations follow ADD ONLY policy
- [ ] CE credits must be tied to real completion events, not hardcoded

---

### 14. SOCIAL STUDIO AGENT

**Description:** Social media management studio — content scheduling, social analytics, platform publishing, engagement tracking.

**Status:** PLANNED — Phase 3+. No active WO.

**Required Skills (when active):**
- Social media API integrations (Instagram Business, TikTok, Pinterest)
- Content scheduling and publishing pipelines
- Social analytics dashboards (engagement, reach, growth)
- React studio builder UI
- Supabase RLS (tenant-scoped social accounts)

**Allowed Paths (when active, with WO):**
- `SOCELLE-WEB/src/pages/business/` — Social studio surfaces (WO required)
- `SOCELLE-WEB/src/pages/brand/` — Brand social surfaces (WO required)
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (social schema)
- `SOCELLE-WEB/supabase/functions/` — ADD ONLY (social API edge functions)

**Forbidden Paths (absolute — no exceptions):**
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- Outreach / cold acquisition messaging — NEVER (FAIL 7)
- `SOCELLE-WEB/src/pages/public/` — Web Agent domain

**Required Proofs (when active):**
- [ ] WO ID in `build_tracker.md` confirmed
- [ ] RLS prevents cross-tenant social account access
- [ ] No automated DM or cold outreach functionality scaffolded
- [ ] Social data labeled LIVE or DEMO on all surfaces

---

### 15. SALES STUDIO AGENT

**Description:** Sales pipeline and revenue tooling — lead scoring, deal tracking, commission management, sales analytics.

**Status:** PLANNED — Phase 3+. No active WO.

**Required Skills (when active):**
- Sales pipeline state machine (lead → qualified → proposal → closed)
- Lead scoring models (Supabase RPCs)
- Commission calculation engine
- React pipeline/kanban UI
- Supabase RLS (sales rep and tenant scoping)

**Allowed Paths (when active, with WO):**
- `SOCELLE-WEB/src/pages/business/` — Sales pipeline surfaces (WO required)
- `SOCELLE-WEB/src/pages/brand/` — Brand sales/leads surfaces (`/brand/leads`, `/brand/pipeline`) (WO required)
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (sales schema)

**Forbidden Paths (absolute — no exceptions):**
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- Outreach / cold acquisition email — NEVER (FAIL 7)
- Commerce flow (cart, checkout, orders) — NEVER MODIFY

**Required Proofs (when active):**
- [ ] WO ID in `build_tracker.md` confirmed
- [ ] Commission rates sourced from DB, not hardcoded
- [ ] Lead data strictly tenant-scoped (RLS verified)
- [ ] No cold outreach tooling scaffolded

---

### 16. QUIZZES / POLLS AGENT

**Description:** Engagement and monetization tooling — quiz/poll creation, response collection, sponsor slot placement, results visualization, lead capture via interactive content. Placement rule: quizzes/polls appear AFTER intelligence context, never as the premise.

**Status:** PLANNED — No active WO. First-class engagement + monetization channel.

**Required Skills (when active):**
- Quiz/poll builder UI (React form wizard)
- Response aggregation and analytics (Supabase RPCs)
- Sponsor slot integration (brand-sponsored quiz placement)
- Results visualization (charts, share cards)
- Supabase RLS (response data tenant-scoped where applicable)

**Allowed Paths (when active, with WO):**
- `SOCELLE-WEB/src/pages/public/` — Public quiz/poll surfaces (WO required)
- `SOCELLE-WEB/src/pages/business/` — Operator quiz results surfaces (WO required)
- `SOCELLE-WEB/src/pages/brand/` — Brand-sponsored quiz management (WO required)
- `SOCELLE-WEB/src/pages/admin/` — Quiz/poll admin curation (ADD ONLY, WO required)
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (quizzes, polls, responses schema)

**Forbidden Paths (absolute — no exceptions):**
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- Outreach / cold acquisition — NEVER (FAIL 7)

**Required Proofs (when active):**
- [ ] WO ID in `build_tracker.md` confirmed
- [ ] Quiz/poll placement follows intelligence context (never as premise)
- [ ] Sponsor disclosures visible on all sponsored content
- [ ] Response data labeled LIVE or DEMO

---

### 17. RECRUITMENT / OPS AGENT

**Description:** Future outreach and recruitment operations — operator recruitment, brand onboarding outreach, re-engagement campaigns. BLOCKED by no-outreach rule (`/.claude/CLAUDE.md §G`).

**Status:** PLANNED — DO NOT AUTHORIZE. Execution requires explicit written amendment to `/.claude/CLAUDE.md §G` (No Outreach Emails Rule) by the product owner. No WO may be created for this agent until that amendment is merged.

**Required Skills (when active — post-amendment only):**
- Transactional + marketing email (Brevo/Resend)
- CAN-SPAM / GDPR compliance engine
- Opt-in/opt-out management (double opt-in required)
- Campaign state machine (draft → approved → scheduled → sent → tracked)
- Supabase tables (outreach_campaigns, outreach_recipients, consent_records)

**Allowed Paths (when active — post-amendment only, with WO):**
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (outreach schema)
- `SOCELLE-WEB/supabase/functions/` — ADD ONLY (outreach edge functions — separate from `send-email`)
- `SOCELLE-WEB/src/pages/admin/` — Outreach admin surfaces (ADD ONLY, WO required)

**Forbidden Paths (absolute — no exceptions, even post-amendment):**
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- `SOCELLE-WEB/supabase/functions/send-email/` — Transactional only; outreach uses separate function
- Cold DMs, scraping, purchased lists — NEVER (even post-amendment, all outreach requires verified consent)

**Required Proofs (when active — post-amendment only):**
- [ ] Written amendment to `/.claude/CLAUDE.md §G` merged and cited
- [ ] WO ID in `build_tracker.md` confirmed
- [ ] Double opt-in consent verified for every recipient
- [ ] CAN-SPAM / GDPR compliance audit passed
- [ ] Unsubscribe mechanism functional and tested
- [ ] No outreach to purchased or scraped lists

---

## AGENT HANDOFF PROTOCOL

When work crosses agent boundaries, the following handoff process applies:

| Handoff Scenario | Process |
|---|---|
| Web Agent needs new DB table | Create WO in `build_tracker.md` → Backend Agent executes migration → Web Agent wires frontend |
| SEO Agent needs schema data from jobs | Jobs Pipeline Agent completes W10-06 first → SEO Agent adds JSON-LD to `JobDetail.tsx` |
| Editorial Agent needs admin curation UI | Editorial Agent builds ingestion pipeline → Admin Control Center Agent builds curation surface |
| AI Agent needs new credit tables | Backend Agent migration first → AI Agent wires edge function |
| Marketing Studio needs Brevo | Owner must configure Brevo account (External Setup) → Backend Agent adds edge function → Marketing Studio Agent wires UI |
| Any agent crossing app boundary | Must have WO in `build_tracker.md` + explicit owner approval |
| Social Studio needs platform API keys | Owner configures API credentials (External Setup) → Backend Agent adds edge function → Social Studio Agent wires UI |
| Sales Studio needs CRM data | CRM Agent completes contact/pipeline schema first → Sales Studio Agent builds pipeline UI |
| Quizzes/Polls needs brand sponsorship data | CRM Agent provides brand contact → Quizzes/Polls Agent manages sponsor placement |
| Recruitment/Ops requires outreach amendment | Owner amends `/.claude/CLAUDE.md §G` → WO created in `build_tracker.md` → Recruitment/Ops Agent authorized |

---

## SCOPE VERIFICATION CHECKLIST

Before any agent begins work, verify:

- [ ] This file read (`docs/command/AGENT_SCOPE_REGISTRY.md`)
- [ ] `/.claude/CLAUDE.md` read (global governance)
- [ ] Relevant command docs read for task area
- [ ] WO ID confirmed in `SOCELLE-WEB/docs/build_tracker.md`
- [ ] Target paths confirmed within agent's allowed path list
- [ ] No forbidden paths in planned changeset
- [ ] Doc Gate PASS conditions understood (§B of `/.claude/CLAUDE.md`)
- [ ] LIVE vs DEMO labels planned for all data surfaces in scope

---

*SOCELLE AGENT SCOPE REGISTRY v3.0 — March 5, 2026 — Command Center Authority*
