# AGENT WORKFLOW INDEX
**Authority:** `/.claude/CLAUDE.md`, `docs/command/AGENT_SCOPE_REGISTRY.md`
**Last Updated:** 2026-03-06
**Working Folders Reference:** `docs/command/AGENT_WORKING_FOLDERS.md` ← deterministic WRITE/READ/FORBIDDEN map for every agent

---

## Purpose

Canonical index of all agent workflow runbooks in `/.agents/workflows/`. Every registered agent in `AGENT_SCOPE_REGISTRY.md` has a corresponding workflow file. All workflows use the 8-section template (Purpose, Authority, Preconditions, Allowed/Forbidden Paths, Execution Loop, Handoff Protocol, Proof Checklist, Stop Conditions).

---

## Table 1: Agent → Workflow File → Registry Section

| Agent | Workflow File | Registry § | Status |
|---|---|---|---|
| Web Agent | `/.agents/workflows/web_agent.md` | §1 | ACTIVE |
| Mobile Agent | `/.agents/workflows/mobile_agent.md` | §2 | ACTIVE |
| Backend Agent | `/.agents/workflows/backend_agent.md` | §3 | ACTIVE |
| SEO Agent | `/.agents/workflows/seo_agent.md` | §4 | ACTIVE |
| Admin Control Center Agent | `/.agents/workflows/admin_control_center_agent.md` | §5 | ACTIVE |
| AI Agent | `/.agents/workflows/ai_agent.md` | §6 | ACTIVE |
| Affiliates Agent | `/.agents/workflows/affiliates_agent.md` | §7 | ACTIVE |
| Jobs Pipeline Agent | `/.agents/workflows/jobs_pipeline_agent.md` | §8 | ACTIVE |
| Jobs Marketplace Agent | `/.agents/workflows/jobs_marketplace_agent.md` | §9 | ACTIVE |
| Editorial / News Agent | `/.agents/workflows/editorial_news_agent.md` | §10 | ACTIVE |
| CRM Agent | `/.agents/workflows/crm_agent.md` | §11 | ACTIVE |
| Marketing Studio Agent | `/.agents/workflows/marketing_studio_agent.md` | §12 | ACTIVE |
| Education Studio Agent | `/.agents/workflows/education_studio_agent.md` | §13 | ACTIVE |
| Social Studio Agent | `/.agents/workflows/social_studio_agent.md` | §14 | ACTIVE |
| Sales Studio Agent | `/.agents/workflows/sales_studio_agent.md` | §15 | ACTIVE |
| Quizzes / Polls Agent | `/.agents/workflows/quizzes_polls_agent.md` | §16 | ACTIVE |
| Recruitment / Ops Agent | `/.agents/workflows/recruitment_ops_agent.md` | §17 | BLOCKED |
| Command Center Agent | `/.agents/workflows/command_center_agent.md` | — | ACTIVE |
| Doc Gate QA Agent | `/.agents/workflows/doc_gate_qa_agent.md` | — | ACTIVE |
| Events Pipeline Agent | `/.agents/workflows/events_pipeline_agent.md` | — | ACTIVE |
| Analytics / Attribution Agent | `/.agents/workflows/analytics_attribution_agent.md` | — | ACTIVE |
| Design Parity Agent | `/.agents/workflows/design_parity_agent.md` | — | ACTIVE |
| Infra / DevOps Agent | `/.agents/workflows/infra_devops_agent.md` | — | ACTIVE |
| I18N / Localization Agent | `/.agents/workflows/i18n_localization_agent.md` | — | ACTIVE |

**Note:** Recruitment / Ops Agent is BLOCKED by Doc Gate FAIL 7 until `/.claude/CLAUDE.md §G` is amended by owner.

---

## Table 2: Agent → Allowed Paths (Summary) → Forbidden Paths (Summary)

| Agent | Allowed Paths | Key Forbidden Paths |
|---|---|---|
| Web Agent | `SOCELLE-WEB/src/pages/`, `src/components/`, `src/lib/` | auth.tsx, useCart.ts, commerce, mobile, marketing-site |
| Mobile Agent | `SOCELLE-MOBILE-main/apps/mobile/lib/` | SOCELLE-WEB/, marketing-site, supabase/migrations, Firebase |
| Backend Agent | `supabase/`, `SOCELLE-WEB/supabase/`, `database.types.ts` | src/pages/, auth.tsx, useCart.ts, commerce, docs/command |
| SEO Agent | `apps/marketing-site/`, `src/lib/seo.ts`, sitemap, robots | auth.tsx, useCart.ts, commerce, mobile |
| Admin Control Center | `SOCELLE-WEB/src/pages/admin/` | public/, brand/, business/, auth.tsx, useCart.ts, commerce |
| AI Agent | `ai-orchestrator/`, `ai-concierge/` edge fns, AIAdvisor | auth.tsx, useCart.ts, commerce, marketing-site |
| Affiliates Agent | `supabase/migrations/` (ADD), portal surfaces (WO) | auth.tsx, useCart.ts, commerce, marketing-site |
| Jobs Pipeline Agent | `supabase/migrations/` (ADD), `public/Jobs.tsx`, `public/JobDetail.tsx` | Portal pages, auth.tsx, useCart.ts, commerce |
| Jobs Marketplace Agent | `business/`, `brand/` job surfaces | public/, auth.tsx, useCart.ts, commerce, mobile |
| Editorial / News Agent | `supabase/migrations/` (ADD), `public/News.tsx`, `public/NewsDetail.tsx` | Portal pages, auth.tsx, useCart.ts, commerce |
| CRM Agent | `supabase/migrations/` (ADD), CRM portal surfaces (WO) | auth.tsx, useCart.ts, commerce, public/, marketing-site |
| Marketing Studio Agent | `business/MarketingCalendar`, `brand/Campaigns`, `brand/CampaignBuilder` | Cold email, send-email (transactional only), auth.tsx, commerce |
| Education Studio Agent | `public/Education.tsx`, `business/CECredits.tsx`, admin education | auth.tsx, useCart.ts, commerce, marketing-site |
| Social Studio Agent | `business/` social, `brand/` social, `supabase/functions/` | Automated DM, cold outreach, auth.tsx, commerce |
| Sales Studio Agent | `business/` sales, `brand/leads`, `brand/pipeline` | Cold outreach, auth.tsx, useCart.ts, commerce |
| Quizzes / Polls Agent | `public/` quiz, `business/` quiz, `brand/` quiz, `admin/` quiz | auth.tsx, useCart.ts, commerce, mobile, marketing-site |
| Recruitment / Ops Agent | BLOCKED — no paths allowed until §G amendment | ALL paths (BLOCKED) |
| Command Center Agent | `/docs/command/*`, `/.claude/CLAUDE.md`, `/.agents/workflows/*` | All code paths, supabase, packages |
| Doc Gate QA Agent | ALL paths READ ONLY | ALL paths WRITE FORBIDDEN |
| Events Pipeline Agent | `supabase/migrations/` (ADD), `public/Events.tsx`, `public/EventDetail.tsx` | Portal pages, auth.tsx, useCart.ts, commerce |
| Analytics / Attribution Agent | `src/lib/analytics/`, `src/lib/tracking.ts`, marketing-site analytics | auth.tsx, useCart.ts, commerce, src/pages/ (read only) |
| Design Parity Agent | `tailwind.config.js`, `index.css`, `socelle_theme.dart` | src/pages/, auth.tsx, useCart.ts, commerce, supabase |
| Infra / DevOps Agent | `.github/workflows/`, `wrangler.toml`, build configs | src/pages/, auth.tsx, useCart.ts, commerce, supabase/migrations |
| I18N / Localization Agent | `src/lib/i18n/`, `src/locales/`, `lib/l10n/` | auth.tsx, useCart.ts, commerce, src/pages/ (read only) |

---

## Table 3: Agent → Required Proofs

| Agent | Required Proofs |
|---|---|
| Web Agent | `npx tsc --noEmit`, LIVE/DEMO labels, design token match, Doc Gate PASS |
| Mobile Agent | `flutter analyze`, design token match, no Firebase, Doc Gate PASS |
| Backend Agent | `npx tsc --noEmit`, RLS on all tables, `database.types.ts` regenerated, Doc Gate PASS |
| SEO Agent | `npx tsc --noEmit`, Schema.org validation, sitemap coverage, Doc Gate PASS |
| Admin Control Center | `npx tsc --noEmit`, RLS verified, audit logging, Doc Gate PASS |
| AI Agent | `npx tsc --noEmit`, credit deduction verified, no direct client→LLM, Doc Gate PASS |
| Affiliates Agent | `npx tsc --noEmit`, attribution verified, FTC disclosure, Doc Gate PASS |
| Jobs Pipeline Agent | `npx tsc --noEmit`, Schema.org JobPosting, deduplication, Doc Gate PASS |
| Jobs Marketplace Agent | `npx tsc --noEmit`, RLS enforced, applicant data private, Doc Gate PASS |
| Editorial / News Agent | `npx tsc --noEmit`, Schema.org NewsArticle, deduplication, Doc Gate PASS |
| CRM Agent | `npx tsc --noEmit`, RLS cross-tenant prevention, Doc Gate PASS |
| Marketing Studio Agent | `npx tsc --noEmit`, no cold email, send-email transactional only, Doc Gate PASS |
| Education Studio Agent | `npx tsc --noEmit`, CE credits from real events, intelligence-layer positioned, Doc Gate PASS |
| Social Studio Agent | `npx tsc --noEmit`, RLS cross-tenant prevention, no automated DM, Doc Gate PASS |
| Sales Studio Agent | `npx tsc --noEmit`, commissions from DB, RLS tenant-scoped, Doc Gate PASS |
| Quizzes / Polls Agent | `npx tsc --noEmit`, intelligence-first placement, sponsor disclosure, Doc Gate PASS |
| Recruitment / Ops Agent | BLOCKED — no proofs required until unblocked |
| Command Center Agent | No code modified, Doc Gate PASS, contradiction resolution citations |
| Doc Gate QA Agent | All 7 FAIL conditions evaluated, no files modified, Doc Gate PASS |
| Events Pipeline Agent | `npx tsc --noEmit`, Schema.org Event, deduplication, Doc Gate PASS |
| Analytics / Attribution Agent | `npx tsc --noEmit`, no PII in payloads, Core Web Vitals met, Doc Gate PASS |
| Design Parity Agent | `npx tsc --noEmit` / `flutter analyze`, token parity verified, no banned colors/fonts, Doc Gate PASS |
| Infra / DevOps Agent | `npm run build`, `npx tsc --noEmit`, CI/CD passes, no secrets committed, Doc Gate PASS |
| I18N / Localization Agent | `npx tsc --noEmit`, strings extracted, hreflang valid, Doc Gate PASS |

---

## Universal Forbidden Paths (All Agents)

- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- Commerce flow (cart/checkout/orders) — NEVER MODIFY

## Universal Rules

- **WO ID rule:** All WO IDs must exist in `SOCELLE-WEB/docs/build_tracker.md`
- **Doc Gate:** All agent outputs must pass FAIL 1–7 conditions
- **LIVE vs DEMO:** Every data surface must be explicitly labeled
- **Intelligence-first:** Intelligence Hub leads; ecommerce is a module beneath

---

## Supporting Files

| File | Purpose |
|---|---|
| `/.agents/workflows/README.md` | Workflow directory documentation, template definition, usage guide |
| `/.agents/workflows/seo_schema_sitemaps_agent.md` | Phase 1 legacy file (superseded by `seo_agent.md`) |
| `/.agents/workflows/crm_studio_agent.md` | Phase 1 legacy file (superseded by `crm_agent.md`) |
