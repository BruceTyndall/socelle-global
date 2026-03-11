# SOCELLE GLOBAL — MASTER BUILD WORK ORDER (COMPLETE)

> **Superseded for phase order and WO list by:** `SOCELLE-WEB/docs/command/CONSOLIDATED_BUILD_PLAN.md`. Use this doc only for **full acceptance criteria per WO** (sections 2–9). Execution status = build_tracker.md + verify_*.json.

**V3 CMS-First Platform Build + Full Product Completion**

---

**Authority:** `/.claude/CLAUDE.md` → CONSOLIDATED_BUILD_PLAN.md  
**Date:** March 9, 2026 (last consolidated from build_tracker.md); 2026-03-13 (plan consolidation)  
**Status:** Phase order and WO registry → CONSOLIDATED_BUILD_PLAN; this file = acceptance criteria detail only.  
**Observability:** Admin Hub dashboards + CMS publish health. No external Sentry.

---

## 0.1 ACTUAL COMPLETION STATE (2026-03-09 audit from build_tracker.md)

> This section reflects verified execution records from `SOCELLE-WEB/docs/build_tracker.md`.
> It supersedes §12 status wherever they conflict. `build_tracker.md` is always authoritative.

### COMPLETE (shipped, committed, verified)

| WO | Evidence |
|----|---------|
| WO-CMS-01 | Prerequisite for WO-CMS-03 (COMPLETE, d9dfa82) — inferred complete |
| WO-CMS-02 | Prerequisite for WO-CMS-03 (COMPLETE, d9dfa82) — inferred complete |
| WO-CMS-03 | Session 48 Wave 1, `d9dfa82` — 7 admin routes, full CRUD |
| WO-CMS-04 | Session 48 Wave 1, `d9dfa82` — PageRenderer + 12 block types + blog routes |
| WO-CMS-05 | Session 48 Wave 1.5, `14362ac` — StudioHome + StudioEditor 3-panel + CourseBuilder 5-step |
| WO-CMS-06 | Session 48 Wave 2, `fb228d6` — 6 space-specific hooks wired (intelligence, education, marketing, sales, jobs, brands) |
| V2-INTEL-01 | Session 48 Wave 3, `7cc667a` — 10 Intelligence Cloud modules under `components/intelligence/cloud/` |
| V2-INTEL-03 | Session 48 Wave 3, `7cc667a` — 6 AI tools under `components/intelligence/tools/` |
| V2-HUBS-01 | Session 48 Wave 2, `fb228d6` — Intelligence Hub: dashboard, KPI strip, signal table, detail panel, AI toolbar |
| V2-HUBS-02 | Session 48 Wave 2, `fb228d6` — Jobs Hub: live TanStack Query, filters, Schema.org JSON-LD |
| V2-HUBS-03 | Session 48 Wave 2, `fb228d6` — Brands Hub: competitive intelligence tab, signal mentions, CSV export |
| V2-HUBS-04 | Session 48 Wave 2, `fb228d6` — Professionals Hub: live directory from user_profiles, search/filter |
| V2-HUBS-05 | Session 48 Wave 3, `7cc667a` — AdminUsers, AdminAuditLog, AdminFeatureFlags, AdminPlatformSettings + 4 routes |
| V2-HUBS-06 | Session 48 Wave 1, `d9dfa82` — CRM Hub: tasks, segments, CSV export, edit flows |
| V2-HUBS-08 | Session 48 Wave 2, `fb228d6` — Marketing Hub: dashboard, 4-step campaign builder, CMS templates |
| V2-HUBS-09 | Session 48 Wave 1, `d9dfa82` — Sales Hub: deals, opportunities, revenue analytics |
| V2-HUBS-10 | Session 48 Wave 1, `d9dfa82` — Commerce Hub: intelligence-first shop, trending, affiliate badges |
| V2-HUBS-11 | STUDIO-UI-01..05, commit pending — StudioEditor fully wired: DragCanvas, TemplatePickerModal, ExportModal |
| V2-HUBS-12 | Session 48 Wave 2, `fb228d6` — Credit Economy Hub: ledger, usage history, tier allocation |
| V2-HUBS-14 | Session 48 Wave 4, `b6daca0` — IntelligenceBriefs, EducationArticles, HelpCenter, Stories + 5 routes |
| V2-MULTI-01 | `ae03c98` — PWA: sw.js push handlers, PWAInstallPrompt, VAPID opt-in, App.tsx integration |
| V2-MULTI-02 | `ae03c98` — Tauri: tauri.conf.json, Cargo.toml, main.rs + lib.rs scaffold, npm scripts |
| CTRL-WO-01 | `cfa6f74` — Feature flags table + hook + edge helper |
| CTRL-WO-02 | `6da673f` — Edge-function kill switch enforcement |
| CTRL-WO-03 | `8556d86` — Audit log table + writers |
| CTRL-WO-04 | `eee5ffc` — Entitlements chain verification |

### PARTIAL (real work done, acceptance criteria not fully met)

| WO | What's done | What's missing |
|----|------------|---------------|
| V2-INTEL-02 | 7 AI engine guardrails + credit gates wired (Wave 1) | Live signal integration in each engine, structured JSON output |
| V2-INTEL-04 | feed-orchestrator edge function live (`W13-02`, `W13-05`), 202 feeds seeded, RSS pipeline active | Verify ≥5 signals < 24h, DLQ confirmed, Admin Hub feeds dashboard full coverage |
| V2-INTEL-05 | Credit Economy schema (`tenant_balances`, `credit_transactions`) exists; V2-HUBS-12 UI done | Server-side deduction per AI action, overage blocking, webhook tier update |
| V2-INTEL-06 | Affiliate Engine Hub UI (`fb228d6`) — dashboard, FTC badges, link manager | `affiliate-link-wrapper` edge function, click tracking in `affiliate_clicks`, distributor mapping |
| V2-HUBS-07 | Education Hub: CE credits + staff training (Wave 1), intelligence recommendations + CSV + skeletons (Wave 1.5) | Quizzes + assessments, certificates via edge function, brand-sponsored academies, competency scorecards |
| V2-HUBS-13 | Affiliate Engine Hub UI (`fb228d6`) | Real affiliate click tracking, commission calculation, distributor URL wrapping |
| V2-PLAT-01 | `/search` page added: brand+product search, tabbed results, TanStack Query (SEARCH-WO-02/03 partial) | Faceted search across all hubs, semantic search via pgvector, save-to-alert |
| V2-PLAT-02 | Notification live ledger + booking CRM linking (BUILD3, `4c7ae53`) | Preferences center, quiet hours, rate limiting, full channel support |
| V2-PLAT-03 | SEO audit: 61 public pages → 100% meta coverage, 28 files fixed (Wave 4) | Auto-generated ingredient/protocol/trend/city pages, city-level market views |
| V2-MULTI-03 | Flutter: brands_hub, jobs_hub, events_hub, studio_hub screens + MODULE gates + app_router (`ae03c98`) | Push notifications via FCM, offline caching, bottom tab nav parity |

### TODO (not started or no build_tracker evidence)

| WO | Blocking reason |
|----|----------------|
| V2-PLAT-04 | Onboarding 4-screen flow (Identity Scan → Shadow Menu → Signal Match → Gate) |
| V2-PLAT-05 | Paywall + tier gating UX — tier surface definitions per §5 |
| V2-LAUNCH-01 | Launch non-negotiables (24 items from CLAUDE.md §16) |
| V2-LAUNCH-02 | Launch comms — 72-hour window plan |

### OPEN DEBT (must resolve before V2-LAUNCH-01)

| Item | Count | Files | Notes |
|------|-------|-------|-------|
| `pro-*` token usages | 2,027 | admin (748), business (587), brand (288), components (377), layouts (26) | Lane A — ULTRA_DRIVE |
| Sentry references | Multiple | `main.tsx`, `App.tsx`, `ErrorBoundary.tsx`, `vite.config.ts`, `package.json` | Lane C — full removal |
| useEffect+supabase violations | 6 | `BusinessRulesView`, `ReportsView`, `MappingView`, `PlanOutputView`, `ServiceIntelligenceView`, `MarketingCalendarView` | DEBT-TANSTACK-REAL-6 PENDING |
| Unit tests | 2 of ≥20 | — | Lane D — need 18+ more |
| E2E Playwright tests | 4 of ≥10 | — | Lane D — need 6+ more |
| True shells | 18 | admin (5), business (6), public (3), brand (2), edu (1), sales (1) | FOUND-WO-04 resolved detection; stubs remain |

---

## 0. CURRENT STATE

### COMPLETED AND FROZEN (do not touch)

| Milestone | Status | What was done |
|-----------|--------|--------------|
| V2-TECH (7/7) | FROZEN | React 19.2.4, Vite 6.4.1, TypeScript strict, TanStack Query v5, database.types.ts regen, Playwright E2E smoke, Admin Hub observability |
| V2-COMMAND (3/3) | FROZEN | All governance docs aligned to CLAUDE.md |
| V3 Phase 0 (4/4) | FROZEN | CMS Architecture, Content Model, Journey Standards, V3 Build Plan |

### VERIFIED CODEBASE

| Metric | Count |
|--------|-------|
| Pages | 220 |
| Components | 99 |
| Hooks | 75 (all TanStack Query) |
| Edge functions | 30 |
| Routes | 241 (205 protected) |
| Tables in DB | 137 |
| Tables in types | 137 (regen complete) |
| Migrations | 150+ |
| CMS tables | 8 (designed, not yet migrated) |
| figma-make-source modules | 14 (not yet wired) |

---

## 1. PHASE EXECUTION ORDER

Sequential. Each phase completes before next begins. Quality outranks time.

| Phase | Name | WOs | Sessions |
|-------|------|-----|----------|
| 1 | CMS Schema + RLS | 1 | 1 |
| 2 | CMS Client + Hooks + PageRenderer | 2 | 1-2 |
| 3 | CMS Hub UI + Authoring Studio | 2 | 2-3 |
| 4 | Hub CMS Integrations + Journeys | 1 | 2-3 |
| 5 | Intelligence Cloud | 6 | 3-5 |
| 6 | All Hubs Non-Shell | 14 | 5-8 |
| 7 | Platform Features (search, notifications, SEO, onboarding) | 5 | 3-4 |
| 8 | Multi-Platform | 3 | 3-5 |
| 9 | Launch Gates | 2 | 1-2 |

**Total: 36 work orders across 9 phases.**

---

## 2. CMS BUILD (Phase 1-4) — ACTIVE PRIORITY

### WO-CMS-01: CMS Schema + RLS

**Scope:** Supabase migrations for 8 `cms_*` tables: `cms_spaces`, `cms_pages`, `cms_blocks`, `cms_page_blocks`, `cms_posts`, `cms_assets`, `cms_docs`, `cms_templates`. RLS: anon SELECT published only, admin full CRUD. Indexes on slug, `space_id`, status. Regenerate `database.types.ts`.

**Owner:** Data Architect
**Acceptance:** All 8 tables exist. RLS enforced. `tsc` passes. `schema-db-suite` passes.
**Depends on:** Nothing (Phase 0 docs complete)

---

### WO-CMS-02: CMS Client + Hooks

**Scope:** `src/lib/cms/client.ts` with typed Supabase functions. 8 TanStack Query hooks: `useCmsPages`, `useCmsBlocks`, `useCmsPosts`, `useCmsAssets`, `useCmsSpaces`, `useCmsTemplates`, `useCmsDocs`, `useCmsPageBlocks`. All hooks: `isLive` flag, 42P01 handling, `useMutation` with invalidation.

**Owner:** Platform Engineer
**Acceptance:** All hooks return typed data. No raw `useEffect`. `tsc` passes.
**Depends on:** WO-CMS-01

---

### WO-CMS-03: CMS Hub Admin UI

**Scope:** 7 admin routes: `/admin/cms` (dashboard), `/admin/cms/pages` (CRUD), `/admin/cms/posts` (CRUD), `/admin/cms/blocks` (library), `/admin/cms/media` (Supabase Storage upload/browse), `/admin/cms/templates` (manager), `/admin/cms/spaces` (config). All registered in `App.tsx`.

**Owner:** Admin Agent
**Acceptance:** All 7 routes render real data. Full CRUD works. Media upload works. `hub-shell-detector` returns 0. Auth guards on all routes.
**Depends on:** WO-CMS-02

---

### WO-CMS-04: PageRenderer + Public Pages

**Scope:** `PageRenderer` component reads `cms_pages` + `cms_page_blocks` + `cms_blocks`, renders by block type → React component map. 12 block components: hero, text, cta, image, video, faq, testimonial, stats, split_feature, evidence_strip, embed, code. Public routes: `/pages/:slug`, `/blog`, `/blog/:slug`, `/help/:slug`. SEO via Helmet from `seo_*` fields.

**Owner:** Web Agent
**Acceptance:** Pages render from DB. Only `status=published` visible. SEO populates. Pearl Mineral V2 tokens. Loading/error/empty states. E2E test for `/blog`.
**Depends on:** WO-CMS-02 (parallel with WO-CMS-03)

---

### WO-CMS-05: Authoring Studio + CMS Integration

**Scope:** Rich block editor for creating/editing CMS content. Preview via PageRenderer. Version history (draft/published/archived). Author assignment + review workflow. Block picker with all 12 block types plus: KPI block (live signal binding), signal embed block, table block (sortable/exportable), chart block (Recharts), disclaimer block (auto-injected for AI/medical content).

Editor layout:

```
TOOLBAR: [New] [Templates] [Brand Kit] [Preview] [Publish] [Export]
BLOCK PICKER | CANVAS/EDITOR | PROPERTIES PANEL
STATUS BAR: Draft • Last saved 2m ago • v3
```

**Owner:** Authoring Agent
**Acceptance:** Create post → add blocks → preview → publish works. Status transitions work. Author tracked. 17 block types render correctly. Anti-shell compliant.
**Depends on:** WO-CMS-03 + WO-CMS-04

---

### WO-CMS-06: Hub CMS Integrations + Journeys

**Scope:** Wire all hubs to CMS: Intelligence briefs → `cms_posts` (space="intelligence"). Education content → `cms_posts` (space="education"). Marketing landing pages → `cms_pages` (space="marketing"). Sales playbooks → `cms_docs` (space="sales"). Implement one full user journey per hub with E2E test per `JOURNEY_STANDARDS.md`.

**Owner:** All Hub Agents
**Acceptance:** Every hub reads from `cms_*` tables. No hardcoded content. E2E test per journey. LIVE labels on all CMS surfaces.
**Depends on:** WO-CMS-04 + WO-CMS-05

---

## 3. INTELLIGENCE CLOUD (Phase 5)

### V2-INTEL-01: 10 Intelligence Modules

Wire figma-make-source modules to live `market_signals` data:

| Module | Source component | Data hook | What it shows |
|--------|-----------------|-----------|--------------|
| KPI Strip | figma/KPIStrip.tsx | useDataFeedStats | 4-6 at-a-glance metrics |
| Signal Table | figma/SignalTable.tsx | useIntelligence | Sortable/filterable/exportable signals |
| Trend Stacks | NEW (Recharts) | useSignalCategories | 7/30/90 day stacked bars by category |
| What Changed Timeline | figma/NewsTicker.tsx | useRssItems | Chronological signal movements |
| Opportunity Signals | NEW | get_salon_opportunities RPC | "You're missing $X/month" with evidence |
| Confidence + Provenance | figma/EvidenceStrip.tsx | signal metadata | Source, date, confidence tier per signal |
| Category Intelligence | NEW | taxonomy-filtered signals | Drill-down by ingredient/treatment/brand |
| Competitive Benchmarking | EXISTS (upgrade) | useBenchmarkData | Anonymized peer comparison |
| Brand Health Monitor | EXISTS (upgrade) | useBrandIntelligence | Brand signals, sentiment, competitor |
| Local Market View | NEW | geo-filtered signals | Zip/metro intelligence |

**Owner:** Intelligence Architect
**Acceptance:** All 10 modules render live data. Signal Table exports CSV. KPI Strip refreshes without page reload. Provenance shows on every signal.
**Depends on:** CMS live (WO-CMS-06)

---

### V2-INTEL-02: 7 AI Service Menu Engines

All 7 engines EXIST in `src/lib/analysis/`. Upgrade each with: live signal integration (not just static protocol matching), credit deduction per invocation, Guardrails AI safety layer, structured JSON output (not markdown).

| Engine | File | Upgrade needed |
|--------|------|---------------|
| menuOrchestrator | src/lib/analysis/menuOrchestrator.ts | Wire to market_signals for real-time pricing/demand |
| planOrchestrator | src/lib/analysis/planOrchestrator.ts | Credit deduction + safety guardrails |
| documentExtraction | src/lib/analysis/documentExtraction.ts | Error handling for corrupt PDFs |
| mappingEngine | src/lib/analysis/mappingEngine.ts | Confidence scoring from signal data |
| gapAnalysisEngine | src/lib/analysis/gapAnalysisEngine.ts | Real revenue estimates from local market data |
| retailAttachEngine | src/lib/analysis/retailAttachEngine.ts | Affiliate link integration |
| PlanWizard | src/pages/business/PlanWizard.tsx | Loading states, error handling, preview |

**Owner:** Intelligence Architect
**Depends on:** V2-INTEL-01

---

### V2-INTEL-03: 6 AI Tools (User-Facing)

| Tool | Model | Edge function | Credits | Tier | Output |
|------|-------|--------------|---------|------|--------|
| Explain This Signal | GPT-4o-mini | ai-orchestrator (task: signal_explain) | 1 | Starter | 3-4 sentences + source citation inline |
| Intelligence Brief | Claude Sonnet | intelligence-briefing | 10 | Pro | Structured JSON → cms_posts (space=intelligence) |
| Activation Plan | GPT-4o | ai-orchestrator (task: activation_plan) | 30 | Pro | Steps + revenue + timeline + PENDING_REVIEW |
| Content Repurposer | GPT-4o | ai-orchestrator (task: content_repurpose) | varies | Pro | Social posts + email copy as authored blocks |
| Competitive Synthesizer | Claude Sonnet | ai-orchestrator (task: competitive_synth) | 40 | Enterprise | Multi-source analysis → cms_docs |
| Semantic Search | text-embedding-3-small | generate-embeddings + pgvector | 0.5 | All | Ranked signal results |

Safety: All tools pass through Guardrails AI layer. No medical diagnoses. "Generated by AI" on every output. Citations required or refusal.

**Owner:** Intelligence Architect
**Depends on:** V2-INTEL-02

---

### V2-INTEL-04: Live Feed Pipeline

**Scope:** Activate 37+ feeds from `data_feeds` table. Verify feed-orchestrator → ingest-rss → rss-to-signals pipeline produces signals with freshness < 24h. Feed health visible in Admin Hub feeds dashboard.

Feed sources (verified in migrations):

| Category | Count | Examples |
|----------|-------|---------|
| Trade publications | 19 | Dermascope, American Spa, CosmeticsDesign, Glossy, Allure, SkinInc |
| Regulatory | 5 | FDA openFDA, EU CosIng |
| Ingredients | 7 | Open Beauty Facts API, Makeup API, COSMILE Europe |
| Google News | 5 | beauty industry, medspa, cosmetic surgery |
| Research | 3 | PubMed, ClinicalTrials.gov |

Pipeline flow:

```
data_feeds (is_enabled=true) → pg_cron hourly
  → feed-orchestrator → dispatch by feed_type
  → ingest-rss → parse XML → rss_items with provenance
  → rss-to-signals → promote at confidence ≥ 0.50 → market_signals
```

**Owner:** Intelligence Architect
**Acceptance:** ≥5 signals < 24h old. Feed failures visible in Admin Hub. Dead-letter handling for failed feeds.
**Depends on:** V2-INTEL-01

---

### V2-INTEL-05: Credit Economy

| Tier | Monthly credits | Overage |
|------|----------------|---------|
| Starter ($49) | 500 | Blocked with upgrade prompt |
| Pro ($149) | 2,500 | Blocked with upgrade prompt |
| Enterprise ($499) | 10,000 | Soft block + account manager alert |

Credit costs per action:

| Action | Credits | Category |
|--------|---------|----------|
| Explain Signal | 1 | Intelligence |
| Semantic search query | 0.5 | Intelligence |
| Market brief (standard) | 10 | Intelligence |
| Market brief (deep dive) | 25 | Intelligence |
| Activation plan | 30 | Strategy |
| Competitive synthesis | 40 | Strategy |
| R&D scout report | 100 | Strategy |
| Content repurpose (per item) | 5 | Creative |
| Product photo gen | 15 | Creative |
| Social moodboard (5-pack) | 50 | Creative |

Tables: `tenant_balances` (tenant_id, credits_remaining, credits_used_this_period, period_start, period_end), `credit_transactions` (id, tenant_id, action, credits_deducted, created_at, metadata JSONB)

**Owner:** Monetization Agent
**Acceptance:** Every AI action deducts correct credits. Balance visible in portal. Overage blocks with upgrade CTA. Admin can view tenant credit usage.
**Depends on:** V2-INTEL-03

---

### V2-INTEL-06: Affiliate + Wholesale Engine

**Scope:** Edge function `affiliate-link-wrapper` converts distributor URLs → tracked affiliate links. FTC-compliant "Commission-linked" badge on all affiliated product recommendations. Distributor mapping (saloncentric → SOCELLE_SC_001, cosmoprofbeauty → SOCELLE_CP_002). Click tracking in `affiliate_clicks` table. Revenue attribution.

Tables: `affiliate_clicks` (id, user_id, distributor, product_url, affiliate_url, clicked_at, converted, commission_amount), `distributor_mappings` (id, domain, affiliate_code, commission_rate)

Commerce boundary (CLAUDE.md §M): Commerce is a module, never the platform premise. Affiliate links appear within intelligence context (e.g., "This product matches your protocol — order from authorized distributor"). Not in primary nav.

**Owner:** Monetization Agent
**Acceptance:** Distributor URLs convert to tracked links. FTC badge visible. Click tracking works. Commission calculation correct.
**Depends on:** V2-INTEL-01

---

## 4. ALL HUBS NON-SHELL (Phase 6)

### Anti-Shell Requirements (every hub must pass ALL)

| # | Requirement | Verification |
|---|------------|-------------|
| 1 | Create action | Click Create → form → submit → DB row |
| 2 | Library view | Browse with sort/filter/search from Supabase |
| 3 | Detail view | Click item → all fields from DB |
| 4 | Edit + Delete | Update form + delete/archive |
| 5 | Permissions | RLS + ModuleRoute with correct tier |
| 6 | Intelligence input | Signal can spawn object in this hub |
| 7 | Proof/metrics | Dashboard with real aggregated data |
| 8 | Export | CSV minimum, PDF for Pro+ |
| 9 | Error/empty/loading | All three premium quality (see §6 below) |
| 10 | Observability | Errors visible in Admin Hub logs |

---

### V2-HUBS-01: Intelligence Hub

Full non-shell: 10 modules from V2-INTEL-01, signal CRUD, tier gating per signal visibility, CSV + PDF export, saved searches, alerts (in-app + email for Pro+). Public intelligence page (`/intelligence`) with first 3 signals free, blur on rest.

### V2-HUBS-02: Jobs Hub

Job postings from pipeline + dedup, JobPosting schema.org (SEO), filters (location/role/pay/specialty), apply flow (v1: redirect + basic form), brand-side job management (post/edit/pause/analytics), pro-side profile with cert verification from Education, talent intelligence from `market_signals`, career guides from CMS (space="jobs").

### V2-HUBS-03: Brands Hub

Brand profiles + products + education assets, competitive view (share-of-voice from signals), geo insights (where demand growing), partner enablement (CMS-backed training content, launch kits), brand dashboards by tier, brand-to-pro messaging (in-platform only — no cold outreach per §P), sponsorship placement rules (disclosed).

### V2-HUBS-04: Professionals Hub

Pro profiles (credentials, specialties, portfolio, availability), credential verification (Education certificate tie-in), trust signals (JSON-LD schema), tools access by tier (saved briefs, alerts, templates, exports), team/employee model, booking integration placeholders, reputation (opt-in reviews).

### V2-HUBS-05: Admin Hub

Platform health dashboard (feed status, signal count, user count, error log), CMS admin (from WO-CMS-03), feed admin (toggle/refresh/failures/last run), AI admin (cost per model, latency, refusals, top prompts), user/org management (roles, seats, access), API registry (what powers what, connection test), feature flags, system health export.

### V2-HUBS-06: CRM Hub

Unified CRM objects (people, orgs, locations, relationships), interaction timeline (notes, calls, meetings, tasks, attachments), segmentation + tags (custom + system), tasks + follow-ups with reminders, intelligence-linked records (signal → person/org/deal/campaign), retention (rebooking reminders, churn risk rules), consent + compliance (opt-in tracking), daily "today" view. Pro CRM: client profiles, visit history, staff assignment. Brand CRM: account profiles, rep coverage, territory, account health.

### V2-HUBS-07: Education Hub

Course catalog from CMS (space="education"), enrollment + progress tracking, quizzes + assessments, certificates (`generate-certificate` edge function), CE credit tracking (`ce_credit_rules` table), brand-sponsored academies (disclosed), operator staff dashboard (compliance, gaps, expirations), training-to-service linkage, competency scorecards, intelligence-driven curriculum updates (signal → "recommended module").

### V2-HUBS-08: Marketing Hub

Campaign CRUD (email/push/in-app with consent), content studio (signal → social posts/email/signage via Content Repurposer AI tool), asset library from CMS media, audience segments (CRM-derived + intelligence-derived), scheduling calendar, UTM builder + attribution events, performance dashboard, CMS-backed templates (space="marketing").

### V2-HUBS-09: Sales Hub

Pipeline kanban (deals: stages/value/close/owner/probability), accounts + contacts (org-level profiles, roles, activity timeline), opportunity finder (intelligence signal → sellable opportunity → one-click create deal), proposals from CMS templates (space="sales"), revenue analytics (pipeline coverage, conversion, cycle time, "influenced by intelligence" attribution), seat selling + upsell surfaces.

### V2-HUBS-10: Commerce Hub

Product catalog (SKUs, variants, pricing), checkout (Stripe via create-checkout + shop-checkout), order lifecycle (created → paid → fulfilled → delivered → return), affiliate link wrapper integration (from V2-INTEL-06), distributor verification, intelligence commerce (shadow cart, landing cost, price history, profit-first recommendations), buying guides from CMS (space="commerce"). Ready to toggle ON at any moment but not in primary nav until Intelligence is established.

### V2-HUBS-11: Authoring Studio

Full block editor from WO-CMS-05 plus: design canvas for visual content creation (stat cards, social images, promo materials). Canvas layout:

```
LAYERS | CANVAS (drag/drop) | ELEMENT PROPERTIES
Canvas sizes: 1080×1080 (IG), 1200×628 (LinkedIn), 1080×1920 (Story), A4, 5×7 card, custom
```

Templates + brand kits (colors/fonts/logo per org). Variable system (`{{brand_name}}`, `{{signal_delta}}`, `{{opportunity_revenue}}`). AI-assisted authoring ("generate brief from signals" → structured blocks). Export: PDF, CSV, social images, email HTML.

### V2-HUBS-12: Credit Economy Hub

Credit ledger page in portal (current balance, usage history, cost per action breakdown). Admin view (tenant credit usage, overage frequency, revenue per AI action). Tier upgrade prompts when credits low. Usage analytics for product decisions.

### V2-HUBS-13: Affiliate Engine Hub

Affiliate dashboard in portal (click count, conversion rate, commission earned). Admin view (distributor mapping, commission rates, payout reports). FTC badge enforcement. Link health monitoring.

### V2-HUBS-14: CMS Content Surfaces

Blog (`/blog`, `/blog/:slug`), intelligence briefs (`/stories`), education articles, in-app help (`/help/:slug`), evergreen SEO pages — ALL rendered via PageRenderer from `cms_*` tables. No hardcoded content on any CMS-backed surface.

---

## 5. PLATFORM FEATURES (Phase 7)

Cross-cutting features that serve ALL hubs.

---

### V2-PLAT-01: Unified Search

**Scope:** Site-wide search across ALL hubs (signals, brands, jobs, courses, products, protocols, CMS content). Faceted filters per surface. Semantic search via pgvector. Autocomplete. Search-to-alert ("save this search, notify me"). Ranking policy per surface (freshness × relevance × confidence × authority).

Tables: `search_analytics` (query, user_id, results_count, clicked_result, created_at)

**Owner:** Platform Engineer
**Acceptance:** Search bar returns results from all hubs. Facets work. Saved search creates alert. Semantic search returns relevant results for "peptides."

---

### V2-PLAT-02: Notification Engine

**Scope:** Unified notification system: in-app, email (via `send-email` edge function), push (FCM for mobile later). Preferences center (per-channel opt-in/out, quiet hours). Alert types: signal alerts, job matches, price spikes, brief ready, subscription expiry, rebooking reminders, CE expiry. Rate limiting (no spam). Audit trail.

Tables: `notifications` (user_id, type, channel, title, body, data JSONB, read_at, sent_at), `notification_preferences` (user_id, channel, type, enabled, quiet_start, quiet_end)

**Owner:** Platform Engineer
**Acceptance:** In-app notifications render. Email notifications send. Preferences respected. Rate limit prevents >5/day. Admin can view notification logs.

---

### V2-PLAT-03: SEO Evergreen Pages

**Scope:** Auto-generated SEO pages from intelligence data:

| Page type | URL | Data source | SEO target |
|-----------|-----|------------|-----------|
| Ingredient pages | `/ingredients/:slug` | ingredients table + signals | "niacinamide trends 2026" |
| Protocol pages | `/protocols/:slug` | canonical_protocols + signals | "hydrafacial protocol" |
| Brand directory | `/brands/:slug` | brands table + signals | "Dermalogica professional intelligence" |
| City trends | `/trends/:city` | market_signals by region | "SLC medspa trends" |
| Job market | `/jobs/market/:metro` | job_postings aggregated | "esthetician salary Salt Lake City" |
| Treatment pages | `/treatments/:slug` | signals + protocols + pricing | "microneedling cost 2026" |

All pages use PageRenderer with CMS blocks + dynamic data injection. Schema.org structured data per page type.

**Owner:** Platform Engineer + Intelligence Architect
**Acceptance:** Each page type renders with real data. Schema.org validates. Pages appear in `sitemap.xml`.

---

### V2-PLAT-04: Onboarding Flow (4 screens)

**Scope:** The "wow" moment that converts free → paid:

| Screen | What happens | Data |
|--------|-------------|------|
| 1. Identity Scan | Zip, business name, NPI lookup, role select | businesses table, ingest-npi edge fn |
| 2. Shadow Menu Audit | AI scans operator's website URL → detects services | documentExtraction engine |
| 3. Signal Match | "4 opportunities in your zip" + revenue estimates | market_signals + get_salon_opportunities |
| 4. Tailored Gate | "14 more behind this wall" + tier comparison | Static conversion page with dynamic counts |

**Owner:** Monetization Agent + Intelligence Architect
**Acceptance:** Full 4-screen flow works end-to-end. NPI lookup returns data. Website scan detects services. Signals match to zip. Conversion CTA leads to checkout.

---

### V2-PLAT-05: Paywall + Tier Gating UX

**Scope:** Define exactly what each tier sees on every surface:

| Surface | Free | Starter ($49) | Pro ($149) | Enterprise ($499) |
|---------|------|---------------|------------|-------------------|
| Signal Table | 3 rows, rest blurred | Full national, 30-day history | All regions + 1yr history | Unlimited + API |
| AI Tools | Locked with badge | Explain Signal + Search | All 6 tools + weekly brief | All + R&D Scout + MoCRA |
| Exports | None | CSV | CSV + PDF + branded | All + API + webhook |
| Credits | 0 | 500/mo | 2,500/mo | 10,000/mo |
| CMS Content | Public pages only | + saved searches | + alerts + briefs | + custom feeds |

Implementation: `ModuleRoute` component checks tier from `useModuleAccess`. `PaywallGate` component (EXISTS at `src/components/PaywallGate.tsx`) wraps gated content. `UpgradeGate` component (EXISTS at `src/components/UpgradeGate.tsx`) shows tier comparison.

**Owner:** Monetization Agent
**Acceptance:** Each tier sees exactly what's specified. Upgrade prompts appear at lock points. Stripe checkout converts. Webhook updates tier in DB.

---

## 6. UI/UX STANDARDS (referenced by all WOs)

### Portal System

| Portal | Path | Layout | Nav | Auth |
|--------|------|--------|-----|------|
| Public | `/*` | MainNav + SiteFooter | Intelligence, Brands, Jobs, Plans | None for browse |
| Operator | `/portal/*` | BusinessLayout (sidebar) | Dashboard, Intelligence, AI, Plans, Account | ProtectedRoute |
| Brand | `/brand/*` | BrandLayout (sidebar) | Dashboard, Intelligence, Reports, AI | ProtectedRoute + brand role |
| Admin | `/admin/*` | AdminLayout (sidebar) | Dashboard, Feeds, Signals, CMS, AI, API, Users | admin role |
| Marketing | `/marketing/*` | MarketingLayout | Campaigns, Content, Audience, Analytics | ProtectedRoute + marketing role |

### Page Composition (every page = Layout + Modules)

All pages built from standardized modules. No freeform HTML.

| Module type | Purpose | Data source |
|------------|---------|------------|
| KPIStrip | Metrics bar | useDataFeedStats |
| SignalTable | Sortable data | useIntelligence |
| TrendStacks | Recharts bars | useSignalCategories |
| Timeline | Chronological events | useRssItems |
| SpotlightPanel | Featured content | useBrandIntelligence |
| BigStatBanner | Hero metric | usePlatformStats |
| HeroMediaRail | Hero images/video | media_library |
| EditorialScroll | Story cards | useCmsStories |
| CTASection | Conversion block | Static |
| EvidenceStrip | Provenance | signal metadata |
| PageRenderer | CMS pages | cms_pages + cms_blocks |
| FormModule | CRUD forms | Any writable table |
| TableModule | Data tables | Any array data |
| DetailModule | Single record | Any table |
| EmptyState | No data (premium) | None |

### Empty/Error/Loading States

**Empty states:** Illustration (Pearl Mineral V2 palette) + headline + body + CTA. Per-hub specific:

- Intelligence: "Your intelligence is warming up" → "Explore how intelligence works"
- CRM: "Your client relationships start here" → "Add first contact"
- Commerce: "Intelligence-powered procurement" → "Explore trending products"

**Error states:** Icon + headline + body + retry + fallback. Types: network (show cached data), auth (sign in), RLS (upgrade prompt), AI (retry with backoff).

**Loading states:** Skeleton shimmer (not spinners). TanStack Query handles automatically with `isLoading` → Skeleton component.

### Responsive Behavior

| Component | Desktop (>1024) | Tablet (768-1024) | Mobile (<768) |
|-----------|----------------|-------------------|---------------|
| Signal Table | Full table | Condensed columns | Card list |
| KPI Strip | 6 in row | 3×2 grid | Swipeable |
| Navigation | Horizontal bar | Hamburger | Bottom tabs |
| Sidebar | Always visible | Collapsible | Bottom sheet |
| Glass panels | Full effect | Same | Solid bg (perf) |

### Component Library

ONE implementation per component. No duplicates.

| Component | Variants | Required |
|-----------|----------|----------|
| Button | primary, secondary, ghost, danger, CTA | All hubs |
| Input | text, number, search, textarea, password | All forms |
| Select | single, multi, combobox | All filters |
| Table | sortable, filterable, paginated, exportable | All data |
| Card | signal, brand, job, product, stat | All lists |
| Modal | confirmation, form, detail | All CRUD |
| Toast | success, error, warning, info | All actions |
| Badge | LIVE, DEMO, tier, status, confidence | All surfaces |
| GlassPanel | card, sidebar, overlay | Pearl Mineral V2 |
| ProvenanceBadge | HIGH/MODERATE/LOW | Intelligence |

Rules: All in `src/components/ui/`. All accept `className`. All use Pearl Mineral V2 tokens. All have TypeScript strict props.

---

## 7. CROSS-HUB INTEGRATION MAP

Every hub connects to Intelligence. Intelligence is the spine.

| From | To | Action | Trigger |
|------|----|--------|---------|
| Intelligence | Sales | Create opportunity | High-revenue signal detected |
| Intelligence | Marketing | Create campaign | Trending signal + audience match |
| Intelligence | Education | Update curriculum | Regulatory change or new treatment |
| Intelligence | Commerce | Price alert | Ingredient price/availability change |
| Intelligence | CRM | Add to client note | Signal relevant to client treatment |
| Intelligence | Authoring | Generate brief | Weekly auto or on-demand |
| Education | Professionals | Verify credential | Certificate issued |
| Education | CRM | Assign training | Compliance gap detected |
| CRM | Marketing | Target segment | CRM segment as campaign audience |
| CRM | Sales | Convert to deal | Contact qualified for upsell |
| Authoring | ALL | Publish content | Document published to any hub |

---

## 8. MULTI-PLATFORM (Phase 8)

### V2-MULTI-01: PWA Baseline

Service worker, manifest, offline cache (last-viewed signals + client data), install prompt.

### V2-MULTI-02: Tauri Desktop

Tauri shell wrapping React+Vite build. No Rust business logic. Mac + Windows. OS keychain for auth tokens. File exports to filesystem. Cmd+K search, Cmd+P print, Cmd+E export. Offline shell with cached data. Auto-update every 24h. Binary < 80MB. Cold start < 3s.

### V2-MULTI-03: Flutter Mobile

Same Supabase API contracts + edge functions. Bottom tab nav (Intelligence, Advisor, Alerts, Profile, More). Signal cards (not table on mobile). Push notifications via FCM. Offline caching for briefs + saved data.

---

## 9. LAUNCH GATES (Phase 9)

### V2-LAUNCH-01: Launch Non-Negotiables (18 items)

| # | Check | Verification | Must return |
|---|-------|-------------|------------|
| 1 | tsc clean | `npx tsc --noEmit` | Exit 0 |
| 2 | Build clean | `npm run build` | Exit 0 |
| 3 | `/` is Intelligence Home | Visit `/` | Intelligence page |
| 4 | Errors visible | Admin Hub error log | Recent errors shown |
| 5 | TanStack on all hooks | grep for raw useEffect fetch | 0 matches |
| 6 | PAYMENT_BYPASS off | Production env | false |
| 7 | 0 font-serif public | grep src/pages/public/ | 0 |
| 8 | 0 banned terms public | Banned language linter | 0 violations |
| 9 | Stripe webhooks | Test webhook | Tier updates in DB |
| 10 | Signals fresh | market_signals query | ≥5 rows < 24h |
| 11 | AI briefs coherent | 10 test inputs | 0 hallucinations |
| 12 | SEO complete | SEO scanner | 0 public pages missing meta |
| 13 | Types match DB | Compare types vs migrations | 0 drift |
| 14 | Credits deduct | Trigger AI action | Balance decreases |
| 15 | Affiliate links | Click distributor link | Tracked redirect + FTC badge |
| 16 | Smoke tests | Playwright suite | All pass |
| 17 | hub-shell-detector | Run on all hubs | 0 shells |
| 18 | CMS published-only | PageRenderer check | Only status=published renders |

### V2-LAUNCH-02: Launch Comms

72-hour window: Day 1 (deploy Pearl Mineral V2 copy + credit logic). Day 2 (activate Stripe production + affiliate links). Day 3 (send "Access Granted" to waitlist + LinkedIn post).

---

## 10. DEFERRED TECHNOLOGIES (>$100/mo without users)

Valid technologies, deferred until revenue trigger:

| Technology | Cost | Add when |
|-----------|------|---------|
| Perfect Corp SDK (skin analysis) | $200K+/yr | 500+ subs |
| Haut.AI API | Enterprise | Brand Enterprise demand |
| Veo/Sora (AI video) | Per-gen | Creative AI add-on demand |
| X/Twitter API | $200+/mo | Reddit + IG insufficient |
| Typesense | $29+/mo | pgvector FTS needs supplementing |
| LangGraph | Compute | Multi-step AI chains needed |
| Trigger.dev | $29+/mo | pg_cron insufficient |

---

## 11. STOP CONDITIONS

| Condition | Action |
|-----------|--------|
| Shell page created | HALT — fix or remove |
| Secrets in committed code | HALT — remediate |
| PAYMENT_BYPASS=true | HALT — remediate |
| Banned term in copy | HALT — fix |
| font-serif on public | HALT — fix |
| Intelligence-first violated | HALT — escalate |
| CMS table without RLS | HALT — add RLS |
| PageRenderer skips published check | HALT — fix |
| Hardcoded content on CMS surface | HALT — wire to cms_* |
| CMS admin without auth guard | HALT — add guard |
| Blocks stored as raw HTML | HALT — use structured JSON |
| Media upload bypasses Storage | HALT — use Supabase Storage |

---

## 12. COMPLETE WO INDEX (36 total)

> Status as of 2026-03-09. Source: `SOCELLE-WEB/docs/build_tracker.md`.
> COMPLETE = committed + verified. PARTIAL = real work done, acceptance not fully met. TODO = not started.

| WO ID | Title | Phase | Owner | Status | Commit |
|-------|-------|-------|-------|--------|--------|
| WO-CMS-01 | CMS Schema + RLS | 1 | Data Architect | COMPLETE | (pre-Wave 1) |
| WO-CMS-02 | CMS Client + Hooks | 2 | Platform Engineer | COMPLETE | (pre-Wave 1) |
| WO-CMS-03 | CMS Hub Admin UI | 3 | Admin Agent | COMPLETE | `d9dfa82` |
| WO-CMS-04 | PageRenderer + Public | 2-3 | Web Agent | COMPLETE | `d9dfa82` |
| WO-CMS-05 | Authoring Studio + CMS | 3 | Authoring Agent | COMPLETE | `14362ac` |
| WO-CMS-06 | Hub CMS Integrations | 4 | All Agents | COMPLETE | `fb228d6` |
| V2-INTEL-01 | 10 Intel Modules | 5 | Intel Architect | COMPLETE | `7cc667a` |
| V2-INTEL-02 | 7 AI Engines | 5 | Intel Architect | PARTIAL | `d9dfa82` |
| V2-INTEL-03 | 6 AI Tools | 5 | Intel Architect | COMPLETE | `7cc667a` |
| V2-INTEL-04 | Live Feed Pipeline | 5 | Intel Architect | PARTIAL | `ba59f01` |
| V2-INTEL-05 | Credit Economy | 5 | Monetization | PARTIAL | `fb228d6` |
| V2-INTEL-06 | Affiliate Engine | 5 | Monetization | PARTIAL | `fb228d6` |
| V2-HUBS-01 | Intelligence Hub | 6 | Intel Architect | COMPLETE | `fb228d6` |
| V2-HUBS-02 | Jobs Hub | 6 | Platform Eng | COMPLETE | `fb228d6` |
| V2-HUBS-03 | Brands Hub | 6 | Marketing | COMPLETE | `fb228d6` |
| V2-HUBS-04 | Professionals Hub | 6 | CRM Agent | COMPLETE | `fb228d6` |
| V2-HUBS-05 | Admin Hub | 6 | Command | COMPLETE | `7cc667a` |
| V2-HUBS-06 | CRM Hub | 6 | CRM Agent | COMPLETE | `d9dfa82` |
| V2-HUBS-07 | Education Hub | 6 | Education | PARTIAL | `d9dfa82` |
| V2-HUBS-08 | Marketing Hub | 6 | Marketing | COMPLETE | `fb228d6` |
| V2-HUBS-09 | Sales Hub | 6 | Sales Agent | COMPLETE | `d9dfa82` |
| V2-HUBS-10 | Commerce Hub | 6 | Ecommerce | COMPLETE | `d9dfa82` |
| V2-HUBS-11 | Authoring Studio | 6 | Authoring | COMPLETE | pending commit |
| V2-HUBS-12 | Credit Economy Hub | 6 | Monetization | COMPLETE | `fb228d6` |
| V2-HUBS-13 | Affiliate Engine Hub | 6 | Monetization | PARTIAL | `fb228d6` |
| V2-HUBS-14 | CMS Content Surfaces | 6 | Authoring | COMPLETE | `b6daca0` |
| V2-PLAT-01 | Unified Search | 7 | Platform Eng | PARTIAL | `076cb12` |
| V2-PLAT-02 | Notification Engine | 7 | Platform Eng | PARTIAL | `4c7ae53` |
| V2-PLAT-03 | SEO Evergreen Pages | 7 | Platform + Intel | PARTIAL | `b6daca0` |
| V2-PLAT-04 | Onboarding Flow | 7 | Monetization + Intel | TODO | — |
| V2-PLAT-05 | Paywall + Tier UX | 7 | Monetization | TODO | — |
| V2-MULTI-01 | PWA Baseline | 8 | Platform Eng | COMPLETE | `ae03c98` |
| V2-MULTI-02 | Tauri Desktop | 8 | Multi-Platform | COMPLETE | `ae03c98` |
| V2-MULTI-03 | Flutter Mobile | 8 | Multi-Platform | PARTIAL | `ae03c98` |
| V2-LAUNCH-01 | Launch Non-Negotiables | 9 | QA + Command | TODO | — |
| V2-LAUNCH-02 | Launch Comms | 9 | Marketing + Copy | TODO | — |

**Summary: 22 COMPLETE | 10 PARTIAL | 4 TODO** (as of 2026-03-09)

---

**36 work orders. 9 phases. Zero shells. Quality outranks time. Intelligence first. Always.**
