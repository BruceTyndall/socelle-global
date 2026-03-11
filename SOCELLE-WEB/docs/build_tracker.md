Claude Code updates this at the end of every session
- **Walkthrough**: `walkthrough.md` updated with AI functionalities and new commerce schemas.

> **Execution scope is ONLY the WOs within CURRENT_QUEUE_START/END.**
> All other tables are historical/planning unless explicitly moved into CURRENT_QUEUE.
> Sources of truth: this file + `docs/qa/verify_*.json`.

---

### **[2026-03-11]** - SALES-TRACKER-01: Omni-Channel Attribution & Account Parity
- **Edge Functions**: Modified `shop-checkout` to extract dominant `brand_id` from retail cart items and sync to the main `orders` table.
   - Result: Retail sales tracking now works natively in Brand Manager admin pipelines.
- **Frontend Changes**:
   - Built `AccountProfile.tsx` for a centralized Shopify-style user hub encompassing Order History, Wishlists, and Profile Settings.
   - Integrated `My Account` omni-channel access link into `MainNav.tsx` auth dropdown for default retail users.
**OPERATING SYSTEM:** `SOCELLE-WEB/docs/GOVERNANCE.md` — read that file first for WO lifecycle, verification protocol, branch policy, agent model, and build plan lineage (V1+V2 strategic plans consolidated in §8).
**WHERE WE LEFT OFF:** Execution stopped after **INTEL-GLOBAL-01** (`dbe4818`) + **INTEL-PREMIUM-01** (`ee9be9a`) — global intelligence expansion and premium UI (hero images, full articles, segments, quality scoring). Next approved work: **CMS-WO-07** + **Product Power WOs** (parallel execution per owner approval). Sources of truth: this file + `docs/qa/verify_*.json`.
DELIVERABLES A+B+C COMPLETE — A: 598d8d6 (GOVERNANCE.md) | B: c824776 (PR reconciliation) | C: 0376111 (all 5 PRs merged, 0 open, tsc=0, build=0)
Last Updated: 2026-03-13 (MERCH-INTEL-IMAGE-CLICKS COMPLETE — signal cards clickable (/intelligence/signals/:id), IntelligenceSignalDetail page + TanStack Query, getSignalImage() hook, images in all signal cards. tsc=0, build=6.42s. Proof: docs/qa/verify_MERCH-INTEL-IMAGE-CLICKS.json. Previous: COVERAGE-EXPANSION-01 COMPLETE + URL VALIDATION DONE — migrations 000032/033/034 applied. 53 candidate feeds inserted (5 new domains); 12 dead feeds disabled (404/403/Cloudflare confirmed by background HTTP agent); 3 Bobit URLs fixed (/feed→/rss); 6 new verified hero feeds added (HJI, Aesthetics Journal UK, Skin Therapy Letter, Yoga Journal, Wellbeing Magazine, TheIndustry.beauty). Final: 175 total feeds, 103 enabled, 15/15 domains covered. P0 GATE: ALL DONE (MERCH-INTEL-03-DB + NEWSAPI-INGEST-01 + DB-TYPES-02). P1 next: CMS-WO-07. Proof: docs/qa/verify_COVERAGE_EXPANSION.json. Previous: CMS-SEED-01 COMPLETE — 6 published cms_posts seeded to Intelligence space; editorial rail LIVE; 2 featured, all slugs valid; migration 20260313000033 applied. feed-orchestrator v26 redeployed with verify_jwt=true. database.types.ts regenerated (6332 lines, 19 signal_type_enum values). tsc=0. Proof: docs/qa/verify_CMS-SEED-01.json. P0 GATE: COMPLETE. P1 next: CMS-WO-07. Previous: MERCH-INTEL-03 PARTIAL: useIntelligence safety-pin sort (MERCH-03) + topic 40% cap (MERCH-09) LIVE. Migration 000027 written (dedup MERCH-07-STOP, impact_score boost MERCH-05-STOP, display_order MERCH-11, fingerprint backfill) — DB PENDING manual apply (Supabase MCP permission error this session). tsc=0. Proof: docs/qa/verify_MERCH-INTEL-03_2026-03-10.json. Previous: LANE-A: CoursePlayer completion CTA added — "View Certificate" button (signal-up) shown when overallProgress=100 and no nextLesson; links to /education/certificates. tsc=0. Lane A audit: 228 routes mapped, 5/10 journeys pass, 4 P0 dead ends documented. Proof: docs/qa/verify_LANE-A.json. Previous: LANE-B FIXES: rowToSignal tier_visibility now reads from DB (P1 gate was no-op); BrandIntelligenceHub DEMO labels on Position Banner + 3 tab panels; IntelligencePricing DEMO banner + 3x font-playfair→font-sans. tsc=0. Proof: docs/qa/verify_LANE-B-fixes_2026-03-10.json. Previous: LANE-C P0 TIER-BYPASS FIXED — OpportunityFinder.tsx + CECreditDashboard.tsx replaced raw supabase.from('market_signals') with useIntelligence() tier-gated hook; direction/magnitude filters moved client-side. tsc=0. Proof: docs/qa/verify_TIER-BYPASS-FIX_2026-03-10.json. Previous: LANE-E BANNED TERMS FIXED — 11 violations resolved: Unlock→Access (UpgradeGate.tsx ×5, PaywallGate.tsx, Education.tsx, BrandStorefront.tsx, BrandDetail.tsx, ProductCard.tsx), optimized→calibrated (PlanResults.tsx). tsc=0. Proof: docs/qa/verify_LANE-E-fixes_2026-03-10.json.)
Previously: EDU-WO-02/05 + QuizPlayer states COMPLETE — EducationDashboard.tsx created (business portal, live course_enrollments via TanStack Query, KPI strip, skeleton/error/empty); CECredits.tsx (business) migrated from mockProtocols to useCECredits live hook (certificates + course_enrollments); QuizPlayer.tsx: spinner→skeleton shimmer, error state + retry, empty state (no questions); route /portal/education added; tsc=0, build=5.66s. Proof: docs/qa/verify_EDU-WO-02-05_2026-03-10T01-00-00-000Z.json)
Previously: SALES-WO-05/08 + ProposalBuilder states COMPLETE — signal_id FK + attributed_at migration on deals; OpportunityFinder wires signal attribution to createDeal; OpportunityFinder skeleton shimmer + error state; RevenueAnalytics Signal-Influenced Deals uses signal_id IS NOT NULL; ProposalBuilder loading/error/empty/save-error states added; tsc=0, build=PASS. Proof: docs/qa/verify_SALES-WO-05-08_2026-03-10T00-00-00-000Z.json)
Previously: AUTH-CORE-01..06 COMPLETE — cms_versions migration + block_data_bindings migration + VersionHistory.tsx (TanStack Query, timeline, restore) + EmbedIntelligenceBlock.tsx (live market_signals CMS block) + DataBindingEngine.ts ({{variable}} substitution); tsc=0, build=6.26s. Proof: docs/qa/verify_AUTH-CORE-01-06_2026-03-13T00-00-00-000Z.json)
Previously: FREE-DATA-01 COMPLETE — open-beauty-facts-sync v8 + ingest-npi v10 + ingest-openfda v13 deployed; businesses +npi_number+npi_verified+npi_verified_at + signal trigger; 51 FDA safety signals (medspa/free); ingredients 2,950 rows; total signals 30→81. EMBED-01 blocked: no OPENAI_API_KEY. Proof: docs/qa/verify_FREE-DATA-01.json)
Previously: INTEL-MEDSPA-01 COMPLETE — market_signals +vertical+topic+geo_country+geo_region+impact_score+tier_min; data_feeds +vertical+tier_min; rss-to-signals v7 + feed-orchestrator v6 deployed with classification engine; 30 signals backfilled (8 medspa, 1 salon, 24 free, 6 paid); useIntelligence extended with vertical filter + tier gating + 14d free window; tsc=0. Proof: docs/qa/verify_INTEL-MEDSPA-01.json.
Previously-2: SCHEMA-API-01 COMPLETE — 5 tables verified; market_signals +confidence/source_name/tier_visibility/status; api_route_map +updated_at+trigger; RLS=user_profiles+platform_admin; types regen; tsc=0. Proof: docs/qa/verify_SCHEMA-API-01_2026-03-10T00-15-00-000Z.json)
Previously: INTEL-FLOW-01 COMPLETE — ApiStatusRibbon (compact pill + detailed cards); ribbon on /intelligence (isLive guard) + /portal/intelligence (detailed); realtime market_signals INSERT in useIntelligence; slide-in CSS animation; fake-live verified (0 violations). tsc=0, build=0. Proof: docs/qa/verify_INTEL-FLOW-01_2026-03-09T23-55-00-000Z.json)

---

## OPERATION BREAKOUT V2 — EXECUTION STATUS (MAIN)

| WO | Scope | Status | Commit | Verification JSON |
|---|---|---|---|---|
| NEXTGEN-AGENT-DEPLOYMENT | Executed Idea-Mining Commerce/Social/AI/SEO Upgrades: Cart Video Upsell, Global Reviews, Omnipresent Context-Aware ShoppingAssistant, Shopify 2026 JSON-LD | COMPLETE | — | `docs/qa/verify_NEXTGEN-AGENT-DEPLOYMENT.json` |
| MERCH-SKILL-01 | Agent registry + skill library governance correction: (P0) Fix Sentry contradiction in Anti-Shell Rule #10 → "Admin Hub dashboards and logs"; add Forbidden Paths to 4 supporting agents (Doc Gate QA, Events Pipeline, Analytics/Attribution, Infra/DevOps). (P1) Add Required Skills field to all 15 agent definitions missing it; add Hub ownership N/A to agents 4/5/6/7/9; fix numbering order (Agent 16 before 17); extend CRM Agent Allowed Paths to include booking surfaces; update SKILLS_DEFINITION_SPEC.md §7.3 with Agent #17 row; create 4 missing Intelligence Merchandiser skill files: intelligence-merchandiser, feed-value-ranker, topic-distribution-checker, signal-title-rewriter. | COMPLETE | — | `docs/qa/verify_SKILL-CREATOR-01.json` |
| AUTH-CORE-01..06 | cms_versions migration (entity versioning, draft/published/archived, UNIQUE(entity_id,version_number), RLS) + block_data_bindings migration (variable→data_source→field_path, RLS) + VersionHistory.tsx (TanStack Query v5, timeline, admin restore, skeleton/error/empty) + EmbedIntelligenceBlock.tsx (live market_signals CMS block, direction badge, LIVE badge, skeleton/error/empty) + DataBindingEngine.ts (resolveBindings async + resolveBindingsSync) + barrel exports updated; tsc=0, build=6.26s | COMPLETE | — | `docs/qa/verify_AUTH-CORE-01-06_2026-03-13T00-00-00-000Z.json` |
| EMBED-01 | generate-embeddings v1 ACTIVE (inlined edgeControl); embedding_queue table + UNIQUE(table_name,row_id); vector(1536) columns + HNSW cosine indexes on retail_products/pro_products/canonical_protocols; backfill: 62/62 done (35 retail + 27 pro), 0 errors; canonical_protocols 0 rows (embeddings auto-queue on seed); model: text-embedding-ada-002 | COMPLETE | — | `docs/qa/verify_EMBED-01.json` |
| FEED-URL-01 | RSS URL remediation: 34 feeds tested via HTTP; 16 originally working; 4 URLs fixed (americanspa→.xml, businessoffashion→/feed, businesswire→feed. subdomain, voguebusiness→vogue.com/feed/rss); 17 disabled (paywall/API-only: Mordor/Mintel/Euromonitor/GrandView/CIR/CosmeticsDesign/BeautyMatter/GlobeNewswire + bot-blocked: LinkedIn/Indeed + removed RSS: FDA/FTC/ASCP/SCC/C&T); 18 feeds healthy; consecutive_failures=0, health_status=healthy on all active | COMPLETE | — | `docs/qa/verify_FEED-WO-02.json` |
| FREE-DATA-01 | open-beauty-facts-sync v8 ACTIVE (inlined edgeControl); ingest-npi v10 ACTIVE + businesses +npi_number+npi_verified+npi_verified_at + trg_npi_verification_signal; ingest-openfda v13 ACTIVE (FDA cosmetics recalls + aesthetic device MDR); 51 FDA safety signals inserted (medspa/free); ingredients table 2,950 rows; total signals 30→81. | COMPLETE | — | `docs/qa/verify_FREE-DATA-01.json` |
| INTEL-MEDSPA-01 | market_signals +vertical+topic+geo_country+geo_region+impact_score+tier_min (6 cols + 4 indexes); data_feeds +vertical+tier_min; rss-to-signals v7 ACTIVE (classifyTopic+computeImpactScore inline); feed-orchestrator v6 ACTIVE (same classification engine); 30 signals backfilled: 8 medspa, 1 salon, 24 free, 6 paid; useIntelligence extended: vertical filter + tierOverride + limit + 14d free window + DB-level tier_min gate; tsc=0. RSS URL staleness → FEED-WO-02. | COMPLETE | — | `docs/qa/verify_INTEL-MEDSPA-01.json` |
| API-DEPLOY-01 | api_registry (31 rows, real URLs) + api_route_map (20 routes linked) seeded; RLS fixed (user_profiles + platform_admin); test-api-connection edge fn deployed ACTIVE (ver 1, JWT=true); profiles→user_profiles + super_admin→platform_admin fixed; 24/27 endpoints pass, 3 timeout (Google Trends, NPI Registry, OpenFDA — slow external) | COMPLETE | — | `docs/qa/verify_API-DEPLOY-01_2026-03-09T23-00-00-000Z.json` |
| INTEL-ADMIN-01 | IntelligenceDashboard wired to live DB via useAdminIntelligence (TanStack Query v5); LIVE/DEMO badge; API Health Panel (api_registry) + Feed Status Strip (data_feeds); realtime invalidation on market_signals INSERT; adminIntelligence.ts @deprecated; tsc=0, build=0 | COMPLETE | — | `docs/qa/verify_INTEL-ADMIN-01_2026-03-09T23-45-00-000Z.json` |
| INTEL-FLOW-01 | ApiStatusRibbon component (compact pill + detailed grid cards); ribbon on /intelligence (isLive guard) + /portal/intelligence (detailed); realtime market_signals INSERT subscription in useIntelligence; slide-in signal-new-item CSS animation; fake-live compliance verified (0 violations) | COMPLETE | — | `docs/qa/verify_INTEL-FLOW-01_2026-03-09T23-55-00-000Z.json` |
| SCHEMA-API-01 | 5 tables verified (api_registry 31 rows, api_route_map 28 rows, market_signals 30 rows, data_feeds 39 rows); market_signals +confidence+source_name+tier_visibility+status; api_route_map +updated_at+trigger; RLS=user_profiles+platform_admin confirmed; database.types.ts regenerated; tsc=0 | COMPLETE | — | `docs/qa/verify_SCHEMA-API-01_2026-03-10T00-15-00-000Z.json` |
| FEED-WO-01 | data_feeds table (39 feeds, 11 categories) + feed_run_log + pg_cron hourly schedule | COMPLETE | `cf32089` | `docs/qa/verify_FEED-WO-01_2026-03-09T23-10-00-000Z.json` |
| FEED-WO-02 | 39 feeds seeded, rss-to-signals live (20 signals promoted from 375 rss_items) | COMPLETE | `cf32089` | `docs/qa/verify_FEED-WO-02_2026-03-09T23-10-00-000Z.json` |
| FEED-WO-03 | Dedup: fingerprint column + non-partial unique index + rss-to-signals fingerprint population | COMPLETE | `cf32089` | `docs/qa/verify_FEED-WO-03_2026-03-09T23-10-00-000Z.json` |
| FEED-WO-04 | Feed health monitoring: consecutive_failures, health_status, last_success_at on data_feeds; feed_run_log per-run records | COMPLETE | `cf32089` | `docs/qa/verify_FEED-WO-04_2026-03-09T23-10-00-000Z.json` |
| FEED-WO-05 | Dead letter queue: feed_dlq table + RLS + feed-orchestrator DLQ writes on error | COMPLETE | `cf32089` | `docs/qa/verify_FEED-WO-05_2026-03-09T23-10-00-000Z.json` |
| INTEL-WO-01..11 | Intelligence platform BUILD 1: live data wire, signal table, trend stacks, opportunity engine, AI toolbar (6 tools + credit gating), signal detail panel + CrossHubActionDispatcher, states, saved searches (signal_alerts migration + hook + component), /home IntelligenceHome page | COMPLETE | `97b55c4` | `docs/qa/verify_INTEL-WO-01-11_2026-03-10T00-00-00-000Z.json` |
| PAY-WO-01..05 | Credits E2E: deduct_credits RPC + useCreditBalance fix (credit_ledger→tenant_balances); credit balance strip in BusinessLayout nav; CreditGate USD cents fix + all AI tools wrapped; affiliate_clicks table + affiliate-link-wrapper edge function; Stripe webhook HMAC verified (PAY-WO-05 partial: stripe_price_id=null pending Stripe dashboard config) | COMPLETE | `de9ebef` | `docs/qa/verify_BUILD1-COMPLETE_2026-03-09T23-13-05-000Z.json` |
| BUILD-1-GATE | Global gate: tsc=0, build=PASS (5.73s). All 3 BUILD 1 agents complete. | COMPLETE | — | `docs/qa/verify_BUILD1-COMPLETE_2026-03-09T23-13-05-000Z.json` |
| CTRL-WO-01 | Feature flags table + hook + edge helper | COMPLETE | `cfa6f74` | `docs/qa/verify_CTRL-WO-01_2026-03-09T04-04-39Z.json` |
| CTRL-WO-02 | Edge-function kill switch enforcement | COMPLETE | `6da673f` | `docs/qa/verify_CTRL-WO-02_2026-03-09T04-10-55Z.json` |
| CTRL-WO-03 | Audit log table + writers (admin + AI + entitlements) | COMPLETE | `8556d86` | `docs/qa/verify_CTRL-WO-03_2026-03-09T04-14-51Z.json` |
| CTRL-WO-04 | Entitlements chain verification (ModuleRoute -> UpgradePrompt) | COMPLETE | `eee5ffc` | `docs/qa/verify_CTRL-WO-04_2026-03-09T04-17-09Z.json` |
| CRM-WO-calendar-oauth-sync | CRM Tasks Google/Microsoft OAuth connections + server-side event creation | COMPLETE | `ea341c6` | `docs/qa/verify_CRM-WO-calendar-oauth-sync_2026-03-09T06-25-39Z.json` |
| CRM-WO-unified-timeline | Contact-level unified timeline + CRM dashboard commerce/sales reinforcement | COMPLETE | `176a01d` | `docs/qa/verify_CRM-WO-unified-timeline_2026-03-09T06-38-37Z.json` |
| BUILD3-GROWTH-CRM-MARKETING-BOOKING-NOTIFICATIONS | Notifications live ledger + booking CRM linking + growth hook schema hardening | COMPLETE | `4c7ae53` | `docs/qa/verify_BUILD3-NOTIFICATIONS_2026-03-09T18-24-14-253Z.json` |
| BUILD3-BOOKING-CRM-CALENDAR-AUTOMATION | Booking follow-up automation + CRM task/notification fan-out + Google/Teams calendar actions | COMPLETE | `6a70c5c` | `docs/qa/verify_BUILD3-BOOKING-CRM-CALENDAR-AUTOMATION_2026-03-09T07-15-27Z.json` |
| BUILD3-GROWTH-HARDENING-WAVE2 | Shell-detector live-pattern upgrades + signal-action dispatcher on marketing/booking + notification ledger + brand CSV exports | COMPLETE | `ba59f01` | `docs/qa/verify_BUILD3-MARKETING_2026-03-09T18-24-14-253Z.json` |
| BUILD3-GROWTH-APPS | Marketing + Booking + Brands + Professionals + Notifications app verification bundle | COMPLETE | `ba59f01` | `docs/qa/verify_BUILD3-MARKETING_2026-03-09T18-24-14-253Z.json`, `docs/qa/verify_BUILD3-BOOKING_2026-03-09T18-24-14-253Z.json`, `docs/qa/verify_BUILD3-BRANDS_2026-03-09T18-24-14-253Z.json`, `docs/qa/verify_BUILD3-PROFESSIONALS_2026-03-09T18-24-14-253Z.json`, `docs/qa/verify_BUILD3-NOTIFICATIONS_2026-03-09T18-24-14-253Z.json` |
| DEBT-TANSTACK-6 | Migrate 6 raw useEffect+supabase violations to TanStack Query (CostsView, MixingRulesView, SpaMenusView, ProProductsView, RetailProductsView, brand/Products.tsx) | COMPLETE | `a3f54cb` | `docs/qa/verify_tanstack_audit_20260309T120000Z.json` |
| DEBT-6 (FOUND-WO-13) | Remove tier-filter bypass in useIntelligence.ts — tier filter now applies to all signal paths | COMPLETE | `8c58be8` | `docs/qa/verify_FOUND-WO-13_20260309.json` |
| FOUND-WO-04 | Shell detector overhaul: 22 exempt paths, extended live patterns (useCms*, useAdmin*, etc.), page_type classification — 18 true shells (down from 65 baseline) | COMPLETE | `8c58be8` | `docs/qa/shell_detector_report.json` |
| CRM-WO-07 | crm_consent_log migration (contact_id FK, action enum, agreed_at, ip, user_agent, RLS admin_all + own contact); CrmConsent.tsx at /portal/crm/consent — TanStack Query from crm_consent_log, audit table skeleton/error/empty; route added | COMPLETE | `d9bc46c` | `docs/qa/verify_CRM-WO-07-09_2026-03-10T00-00-00-000Z.json` |
| CRM-WO-08 | crm_churn_risk migration (churn_risk_score float + last_visit_at on crm_contacts); ChurnRisk column in CRM contact list with color-coded badge (signal-down/warn/up); useQuery fetch includes new columns | COMPLETE | `d9bc46c` | `docs/qa/verify_CRM-WO-07-09_2026-03-10T00-00-00-000Z.json` |
| CRM-WO-09 | Rebooking risk UI: ContactDetail intelligence tab shows churn_risk_score bar + rebooking recommendation CTA; signal_id FK on crm_contacts links contact to triggering intelligence signal | COMPLETE | `d9bc46c` | `docs/qa/verify_CRM-WO-07-09_2026-03-10T00-00-00-000Z.json` |
| SALES-WO-05 | signal_id FK + attributed_at on sales_deals/deals (migration 20260310000030); OpportunityFinder createDeal wires signal attribution; RevenueAnalytics "Signal-Influenced Deals" metric uses signal_id IS NOT NULL | COMPLETE | `e63b870` | `docs/qa/verify_SALES-WO-05-08_2026-03-10T00-00-00-000Z.json` |
| SALES-WO-08 | ProposalBuilder.tsx: loading skeleton (3-block shimmer), error state + retry button, empty state (no proposals) with create CTA, save error inline banner; OpportunityFinder skeleton shimmer + error state with retry | COMPLETE | `e63b870` | `docs/qa/verify_SALES-WO-05-08_2026-03-10T00-00-00-000Z.json` |
| COMMERCE-WO-03 | FTC affiliate badges: products table + is_affiliated + affiliate_url + affiliate_disclosure (migration 20260310000040); AffiliateDisclosureBadge component; ProductCard wraps affiliate products with "Commission-linked" badge + tooltip | COMPLETE | `c2981f0` | `docs/qa/verify_COMMERCE-WO-03-07_2026-03-10T00-00-00-000Z.json` |
| COMMERCE-WO-07 | ProcurementDashboard.tsx at /portal/procurement: TanStack Query from orders/products; 4-card KPI (total spend, orders, avg order, pending); reorder alerts table (low-stock products); CSV export; skeleton/error/empty states | COMPLETE | `c2981f0` | `docs/qa/verify_COMMERCE-WO-03-07_2026-03-10T00-00-00-000Z.json` |
| EDU-WO-02 | EducationDashboard.tsx created at /portal/education — useQuery from course_enrollments joined with courses; KPI strip (enrolled/completed/in-progress/CE earned); in-progress courses with progress bar; completed courses table; certificates quick view; CSV export; loading skeleton/error/empty states | COMPLETE | — | `docs/qa/verify_EDU-WO-02-05_2026-03-10T01-00-00-000Z.json` |
| EDU-WO-05 | business/CECredits.tsx migrated from mockProtocols (getCEProgress/getProtocols) to useCECredits hook (live certificates + course_enrollments via TanStack Query); CSV export; skeleton shimmer/error/empty states; expiring soon warnings; live/no-data badge | COMPLETE | — | `docs/qa/verify_EDU-WO-02-05_2026-03-10T01-00-00-000Z.json` |
| QuizPlayer-states | QuizPlayer.tsx: Loader2 spinner → 3-block skeleton shimmer; error state with retry; empty state (no questions) with back CTA | COMPLETE | — | `docs/qa/verify_EDU-WO-02-05_2026-03-10T01-00-00-000Z.json` |
| BUILD-2-GATE | BUILD 2 global gate: AUTH-CORE-01..06 + CRM-WO-07/08/09 + SALES-WO-05/08 + COMMERCE-WO-03/07 + EDU-WO-02/05 all COMPLETE. tsc=0, build=PASS. 5 new migrations (consent log, churn risk, affiliate flag, signal attribution, cms versions). Routes added: /portal/crm/consent, /portal/procurement, /portal/education. | COMPLETE | `01ed653` | — |
| MERCH-INTEL-02 | Feed quality + coverage expansion COMPLETE: impact_score/vertical/topic/tier_min type+rowToSignal bug fixed; URL fixes (000022+000025); Atom parser (rss-to-signals v9+); feed-orchestrator v8+; American Spa 8-channel set (000024); master cleanup migration 000025 applied live (URL re-fixes, bot-blocked disabled, priority col added, hero feeds enabled, 19 feeds inserted, health_status constraint honored); final state: medspa=30✅ salon=20✅ beauty_brand=11✅ total_enabled=75. P0 fake-live violations fixed: Education.tsx DEMO badge on stats+CE progress; BrandAIAdvisor.tsx DEMO badges on Brand Profile+Market Signals panels. | COMPLETE | — | `docs/qa/verify_MERCH-INTEL-02_cleanup.json` |
| FOUND-WO-08 | Banned terms sweep COMPLETE — Wave 1: 4 fixes (Intelligence.tsx, Home.tsx ×2, PrelaunchQuiz.tsx). Lane E Wave 2: 11 fixes — Unlock→Access (UpgradeGate.tsx ×5, PaywallGate.tsx, Education.tsx, BrandStorefront.tsx, BrandDetail.tsx, ProductCard.tsx); optimized→calibrated (PlanResults.tsx). Post-fix grep: 0 user-facing violations. tsc=0. | COMPLETE | `8c58be8` | `docs/qa/verify_LANE-E-fixes_2026-03-10.json` |
| W10-04 | Insights.tsx confirmed live (useRssItems → TanStack Query) — orphan resolved | COMPLETE | `8c58be8` | — |
| UD-A-01..06 | Ultra Drive LANE A: pro-* token purge audit — 0 usages found across admin/business/brand/components/layouts + tailwind.config.js pro: block already removed in prior sessions | AUDIT-CLEAN | `8c58be8`+ | `docs/qa/verify_UD-A-ALL_20260309T210000Z.json` |
| UD-C-01..08 | Ultra Drive LANE C: Sentry removal audit — 0 references in main.tsx/App.tsx/components/vite.config.ts/package.json; SentryUserContext.tsx deleted; 1 false-positive string label in AdminInventoryReport.tsx (intentional metric tracker) | AUDIT-CLEAN | prior sessions | `docs/qa/verify_UD-A-ALL_20260309T210000Z.json` |
| STUDIO-UI-01..05 | Studio UI: StudioEditor.tsx wired with DragCanvas (drag/resize/rotate), TemplatePickerModal (52 templates × 10 categories), ExportModal (PNG/JPG/PDF/SVG/SCORM), Doc/Canvas mode toggle, grid toggle, canvas_blocks saved in metadata | WIRED | `00fa3a7` | — |
| STUDIO-UI-17 | Share pack export: generateStudioSharePack + downloadStudioSharePack wired to StudioEditor top bar | COMPLETE | `c039a8e` | — |
| EVT-WO-01 (partial) | Events.tsx wired to live DB via useEvents.ts hook (TanStack Query v5); LIVE/DEMO badge, skeleton shimmer, error/empty states, CSV export | PARTIAL | `076cb12` | — |
| SEARCH-WO-02/03 (partial) | /search page added (SearchPage.tsx): brand+product search via searchService, tabbed results, TanStack Query v5, skeleton shimmer | PARTIAL | `076cb12` | — |
| MOBILE-WO (partial) | Flutter: brands_hub, jobs_hub, events_hub, studio_hub screens + MODULE gates + app_router wired | PARTIAL | `ae03c98` | `docs/qa/verify_BUILD5_MULTI_PLATFORM_20260309T200000Z.json` |
| TAURI-WO-01 | Tauri desktop shell: tauri.conf.json, Cargo.toml, main.rs + lib.rs scaffold; package.json scripts | COMPLETE | `ae03c98` | `docs/qa/verify_BUILD5_MULTI_PLATFORM_20260309T200000Z.json` |
| PWA-WO-01/02/03 | PWA: sw.js push/notificationclick/pushsubscriptionchange handlers; PWAInstallPrompt.tsx (14-day snooze, VAPID opt-in); wired in App.tsx | COMPLETE | `ae03c98` | `docs/qa/verify_BUILD5_MULTI_PLATFORM_20260309T200000Z.json` |
| STUDIO-UI-01..05 | StudioEditor fully wired: DragCanvas + TemplatePickerModal + ExportModal (PNG/JPG/PDF/SVG/SCORM) + mode toggle + grid overlay | COMPLETE | pending | — |
| DEBT-TANSTACK-REAL-6 | Audit confirmed 6 real useEffect+supabase violations: BusinessRulesView, ReportsView, MappingView, PlanOutputView, ServiceIntelligenceView, MarketingCalendarView — PENDING migration to useQuery | COMPLETE | — | `docs/qa/verify_DEBT-TANSTACK-REAL-6_2026-03-11.json` |
| LANE-A-EDU-01 | CoursePlayer completion screen: added "View Certificate" CTA (signal-up button, links /education/certificates) when overallProgress=100 and no nextLesson. tsc=0. | COMPLETE | — | — |
| LANE-A-DEBT-01 | Dead end: /events/:slug route missing — EventDetail.tsx linked in pageIndex.ts and App.tsx. Routing funnel COMPLETE. | COMPLETE | — | `docs/qa/verify_LANE-A-DEBT-01.json` |
| LANE-A-DEBT-02 | Dead end: TierGate upgrade CTA leads to DEMO /pricing page, not Stripe checkout. PaywallGate/UpgradePrompt links updated to /plans. | COMPLETE | — | `docs/qa/verify_LANE-A-DEBT-02.json` |
| LANE-A-DEBT-03 | Orphaned routes: /home (not in nav), /for-medspas, /for-salons, dual marketing hubs (/portal/marketing/* + /portal/marketing-hub/*), dual pricing pages (/plans vs /pricing). Cleanup WO needed. | OPEN | — | `docs/qa/verify_LANE-A.json` |
| LANE-A-DEBT-04 | Brand→Signal→Campaign journey broken: no signal-to-campaign CTA in BrandIntelligenceHub. BRAND-WO scope. | OPEN | — | `docs/qa/verify_LANE-A.json` |
| MERCH-INTEL-03 (partial) | Lane F audit fixes: useIntelligence safety-pin sort (MERCH-03 PASS) + 40% topic cap (MERCH-09 PASS). Migration 000027 written: dedup FDA MDR dupes (MERCH-07-STOP), impact_score boost (MERCH-05-STOP), display_order on data_feeds (MERCH-11), fingerprint backfill. DB apply PENDING (Supabase MCP permission error this session). Remaining: MERCH-01 (ingest-openfda source_url), MERCH-06 (run RSS pipeline for paid-tier signals), MERCH-10 (timeline eligibility). | PARTIAL | — | `docs/qa/verify_MERCH-INTEL-03_2026-03-10.json` |
| UD-E (Lane E) | Audit doc corrections: CODE_AUDIT_REPORT §3b/3d/3e updated; DESIGN_AUDIT line 311 false exemption replaced; build_tracker.md line 126 self-granted exemption deleted; build_gate_results.json: token_compliance + tanstack_migration + sentry_status fields added | COMPLETE | — | `docs/qa/verify_UD-E_2026-03-09T21-00-00-000Z.json` |
| UD-D (Lane D) | Test coverage sprint: 26 new unit tests (useIntelligence×9, PaywallGate×9, ErrorBoundary×8) + 16 new E2E tests (paywall-and-entitlements.spec.ts) + IS_REACT_ACT_ENVIRONMENT fix → 150 passing (was 100) | COMPLETE | — | `docs/qa/verify_UD-D_2026-03-09T21-00-00-000Z.json` |
| SITE-WIDE-AUDIT-2026-03-09 | Full 5-agent site audit complete. See artifact. Results: tsc=PASS, build=PASS, 18 shells remain, 19 raw market_signals queries, 1 missing isLive (IntelligenceCommerce.tsx), Sentry=RESOLVED, pro-* tokens=0, brand-*=19, intel-*=30, useEffect+supabase=1 (useEnrichment.ts), 29 unit tests failing (React 19 compat), SEO=40.1%, Cart.tsx 'Shop Now' STOP CONDITION, database.types.ts drift 116/165 tables | COMPLETE | — | `docs/qa/verify_site_wide_audit_2026-03-09T22-00-00-000Z.json` |
| P0-01 | Cart.tsx:84 'Shop Now' → 'Explore Products' (§9 STOP CONDITION resolved). grep src/ returns 0. tsc=0. | COMPLETE | — | `docs/qa/verify_P0-01_2026-03-09T22-30-00-000Z.json` |
| P0-02 | IntelligenceCommerce.tsx isLive LIVE/DEMO guard added: DEMO banner (signal-warn) + LIVE badge (signal-up). tsc=0, build=0. | COMPLETE | — | `docs/qa/verify_P0-02_2026-03-09T22-30-00-000Z.json` |
| P0-03 | database.types.ts regenerated via supabase gen types --linked. Now reflects live DB (99 tables, tsc=0). 74 migrations pending push to remote (BUILD 1/2/4 feature tables — deferred, owner decision required). 8 tables in live DB without migration files: access_requests, events, ingredient_identifiers, ingredients, job_postings, market_signals, rss_items, rss_sources. | PARTIAL | — | `docs/qa/verify_P0-03_2026-03-09T22-30-00-000Z.json` |
| P0-03-push | supabase db push: owner-authorized push to remote (rumdmulxzmjtsplsjngi). All 101 local migrations already applied — remote was up to date. 1 remote-only migration (20260309173300) repaired/reverted in history (applied manually via dashboard, no local file). database.types.ts regenerated: 109 tables. tsc=0. | COMPLETE | — | `docs/qa/verify_P0-03-push_2026-03-09T23-30-00-000Z.json` |
| P0-04 | 9 user-facing 'AI-powered' occurrences replaced across 8 files with intelligence-first vocabulary per CANONICAL_DOCTRINE §9. tsc=0. Additional banned term noted: PlanResults.tsx:407 'optimized' → add to SITE-WO-04 copy sweep. | COMPLETE | — | `docs/qa/verify_P0-04_2026-03-09T22-30-00-000Z.json` |
| P0-events | /events crash fixed: isSupabaseConfigured() → isSupabaseConfigured (boolean, not fn) in useEvents.ts:155. DEMO badge already present (2 banners). tsc=0, build=0. | COMPLETE | — | `docs/qa/verify_P0-events_2026-03-09T23-00-00-000Z.json` |
| E2E-triage | 40 E2E failures triaged (was 47 — stale count). Type A (test bugs): 5. Type B (product bugs): 35. Type A fixed: nav hrefs /for-buyers→/professionals, /pricing→/plans; Brands exact:true; auth pages SEO-exempt. Type B: 32 SEO failures → SITE-WO-04; homepage console errors; no <main> landmark (WCAG); /events DEMO badge (resolved above). | COMPLETE | — | `docs/qa/verify_UD-E2E-triage_2026-03-09T22-00-00-000Z.json` |
| E2E-typeA-fixes | navigation.spec.ts: For Buyers href /for-buyers→/professionals; Pricing href /pricing→/plans; Brands link exact:true + .first(). seo.spec.ts: auth pages (/forgot-password, /reset-password) added to AUTH_EXEMPT_PATHS. tsc=0. | COMPLETE | — | `docs/qa/verify_E2E-typeA-fixes_2026-03-09T23-00-00-000Z.json` |
| INTEL-GLOBAL-01 | Global Intelligence Expansion: Activated 34 dormant feeds + inserted 49 new global intelligence sources across APAC (12: Korea, Japan, SEA, India, Australia), Europe (10: UK, France, EU regulatory, journals), AI/Beauty Tech (13: CosmeticsDesign, arXiv, VentureBeat, FDA), Reddit RSS (8 subreddits, no auth), PubMed/Google/FTC (6). Extended category CHECK to include 'research'. Added UNIQUE constraint on endpoint_url. Total ~190 enabled feeds. Migration: 20260311043000_global_intelligence_expansion.sql | COMPLETE | `dbe4818` | `docs/qa/verify_INTEL-GLOBAL-01_2026-03-11.json` |
| INTEL-PREMIUM-01 (Part D) | Intelligence UI premium display: SignalCard hero images + content_segment badges + reading time + quality indicator + topic tags; SignalDetailPanel full article_body reader + image gallery + quality score bar + author/published_at + geo_source; SignalCardEditorial hero image preference + segment badges + reading time + topic tags; ContentSegmentFilter component (8 segments); useIntelligence.ts extended select (14 new columns) + quality_score DESC sort + contentSegment filter option; IntelligenceSignal type expanded with 14 premium fields + ContentSegment type. tsc=0. | COMPLETE | `ee9be9a` | `docs/qa/verify_INTEL-PREMIUM-01_2026-03-11.json` |
| NEXTGEN-POWER-UP | Commerce SEO, Video, Social & AI Upgrades: ProductVideoPlayer + SocialProofTags + GlobalCommentThread + VerifiedReviews components. ShoppingAssistant (globally mounted) with Edge Function integration (GPT-4 turbo + search_products + search_intelligence + add_to_cart). SeoHead wrapper with Shopify 2026-level JSON-LD schemas injected into ProductDetail, ShopCategory, and Shop views. Typecheck structural integrity verified. | COMPLETE | — | `docs/qa/verify_NEXTGEN-POWER-UP.json` |

<!-- CURRENT_QUEUE_START -->

## ⚡ P0 QUEUE — FIX BEFORE ANY NEW WO (from 2026-03-09 audit)

| ID | Task | File | Effort | Blocks | Status |
|----|------|------|--------|--------|--------|
| P0-1 | Cart.tsx:84 — replace 'Shop Now' (§9 STOP CONDITION) | src/pages/public/Cart.tsx | 2 min | §16.8 | COMPLETE |
| P0-2 | IntelligenceCommerce.tsx — add isLive LIVE/DEMO badge | src/pages/public/IntelligenceCommerce.tsx | 10 min | §8 | COMPLETE |
| P0-3 | useEnrichment.ts — migrate useEffect+supabase to useQuery | src/lib/enrichment/useEnrichment.ts | 15 min | §16.23 | COMPLETE |
| P0-4 | 9x 'AI-powered' copy — replaced with intelligence-first vocab | 8 files | 20 min | §16.8 | COMPLETE |
| P0-5 | supabase gen types — regenerated database.types.ts (99 live tables, tsc=0) | src/lib/database.types.ts | 5 min | §16.13 | COMPLETE |

## 🎨 P1 QUEUE — DESIGN TOKEN MIGRATION

| ID | Task | Effort | Status |
|----|------|--------|--------|
| P1-1 | Migrate 19 brand-* usages → Pearl Mineral V2 (StatCard, Button, EmptyState, UpgradeGate, index.css) | 1-2h | COMPLETE |
| P1-2 | Migrate 30 intel-* usages → signal-*/accent (GlowBadge, DarkPanel, 5 business pages) | 1-2h | COMPLETE |
| P1-3 | Remove brand-* + intel-* from tailwind.config.js after migration | 5 min | COMPLETE |

## 🧪 P2 QUEUE — TEST FIXES

| Priority | ID | Task | Status | Owner | Blocker | Evidence Link |
|----------|----|------|--------|-------|---------|---------------|
| 🧪 P2 QUEUE | P2-1 | Upgrade @testing-library/react to v16.3.2 (max compatible version). Fixes 29 failing unit tests — React 19 compat | COMPLETE | Unassigned | — | `docs/qa/verify_P2-1.json` |

## 📋 PRODUCT POWER / IDEA MINING WOs (APP_BY_APP_IDEA_MINING_UPGRADES.md)

| WO | Scope | Status | Proof pack |
|----|--------|--------|------------|
| INTEL-POWER-01 | Impact badge on every signal card (list + detail) | COMPLETE | `docs/qa/verify_INTEL-POWER-01_2026-03-11.json` |
| INTEL-POWER-02 | "N similar" dedup UI + expand | COMPLETE | `docs/qa/verify_INTEL-POWER-02.json` |
| INTEL-POWER-03 | Today View / Snapshot as default entry | COMPLETE | `docs/qa/verify_INTEL-POWER-03_2026-03-11.json` |
| INTEL-POWER-04 | In-card "Take action" row (Spot→Understand→Act) | COMPLETE | `docs/qa/verify_INTEL-POWER-04.json` |
| INTEL-POWER-05 | Sentiment aggregate banner + More filters | COMPLETE | `docs/qa/verify_INTEL-POWER-05.json` |
| CRM-POWER-01 | Contact timeline + signal attribution | COMPLETE | `docs/qa/verify_CRM-POWER-01.json` |
| CRM-POWER-02 | Consent audit + rebooking engine | COMPLETE | `docs/qa/verify_CRM-POWER-02.json` |
| SALES-POWER-01 | Deal attribution + revenue analytics | COMPLETE | `docs/qa/verify_SALES-POWER-01_2026-03-11.json` |
| MKT-POWER-01 | Signal → campaign CTA (fix DEBT-04) | COMPLETE | `docs/qa/verify_MKT-POWER-01.json` |
| EDU-POWER-01 | CE credits + course player states | COMPLETE | `docs/qa/verify_EDU-POWER-01.json` |
| COMMERCE-POWER-01 | Organic commerce conversion + product intelligence | COMPLETE | `docs/qa/verify_COMMERCE-POWER-01.json` |
| ADMIN-POWER-01 | System health + feeds + audit log dashboard | COMPLETE | `docs/qa/verify_ADMIN-POWER-01.json` |
| CMS-POWER-01 | Editorial rail + story drafts (complete CMS-WO-07) | COMPLETE | `docs/qa/verify_CMS-WO-07_2026-03-11.json` |
| SITE-POWER-01 | Route cleanup + unified revenue funnel CTA hierarchy | COMPLETE | `docs/qa/verify_SITE-POWER-01.json` |
| MOBILE-POWER-01 | Mobile/Tauri/PWA parity + MODULE gates | OPEN | `docs/qa/verify_MOBILE-POWER-01_*.json` |

<!-- CURRENT_QUEUE_END -->

*Source: SOCELLE-WEB/docs/ops/APP_BY_APP_IDEA_MINING_UPGRADES.md. Execution truth = build_tracker + verify_*.json (not older plans).*

| Build 0 Foundation WO | Status | Verification JSON |
|---|---|---|
| FOUND-WO-01..FOUND-WO-15 | COMPLETE (artifact presence verified) | `docs/qa/verify_FOUND-WO-01_20260309.json` through `docs/qa/verify_FOUND-WO-15_20260309.json` |
| INTEL-WO-01 | COMPLETE — useIntelligence() wired on all public surfaces; portal pages deferred to BUILD 2 portal WOs (DO NOT MODIFY §B) | `docs/qa/verify_INTEL-WO-01-11_2026-03-10T00-00-00-000Z.json` |
| INTEL-WO-02 | COMPLETE — SignalTable: sort/filter/search/CSV/pagination (already built, verified) | same artifact |
| INTEL-WO-03 | COMPLETE — TrendStacks: CSS-only stacked bars, skeleton+empty (already built, verified) | same artifact |
| INTEL-WO-04 | COMPLETE — OpportunitySignals: revenue estimates, Create Deal / Add to Plan / Dismiss (already built, verified) | same artifact |
| INTEL-WO-05 | COMPLETE — AIToolbar rebuilt: 6 real tools → ai-orchestrator edge fn, USD credit check, 'Generated by AI' disclosure, ESC close | same artifact |
| INTEL-WO-06 | COMPLETE — SignalDetailPanel: ESC key handler + CrossHubActionDispatcher wired into Actions section | same artifact |
| INTEL-WO-07 | COMPLETE — CrossHubActionDispatcher: all 9 action_types, navigate with fromSignal state, wired into SignalDetailPanel | same artifact |
| INTEL-WO-08 | COMPLETE — All intel components have loading skeleton/error retry/empty state (Pearl Mineral illustration + CTA) | same artifact |
| INTEL-WO-09 | DEFERRED — Flutter directory inaccessible; defer to MOBILE-WO-01..08 (BUILD 5) | same artifact |
| INTEL-WO-10 | COMPLETE — signal_alerts migration + RLS (4 policies) + useSignalAlerts.ts (TanStack v5) + SavedSearches.tsx component | same artifact |
| INTEL-WO-11 | COMPLETE — IntelligenceHome.tsx at /home: KPI strip, featured signals, category nav, isLive guard, SEO meta, DemoBanner | same artifact |

| Build 1 Payments | Owner Directive |
|---|---|
| PAY-WO-01..PAY-WO-05 | BYPASSED FOR TODAY (no execution) |

---

## 🔄 MASTER PLATFORM UPGRADE — WO REGISTRY (2026-03-10)

> **Authority:** Owner directive Command Mode 2026-03-10. Full specs in `docs/operations/WO_MASTER_PLATFORM_UPGRADE.md`. This table is co-authoritative.

### P0 GATE — must be 100% PASS before P1 starts

| WO ID | Title | Team | Status | Depends On | Proof Pack | Impl SHA | Scope |
|-------|-------|------|--------|------------|------------|----------|-------|
| MERCH-INTEL-03-DB | Apply migration 000027: dedup, impact_score, display_order, fingerprint backfill | Team 1 | DONE | none | `docs/qa/verify_MERCH-INTEL-03-DB.json` | `2f005fe` | db+docs |
| NEWSAPI-INGEST-01 | GNews + NewsAPI ingestion live (Reddit on hold, Currents disabled-timeout); 74 signals added (47→121); source_domain=0 nulls; signal_type_enum fixed; tsc=0 | Team 1 | DONE | none | `docs/qa/verify_NEWSAPI-INGEST-01.json` | `6a43a75` | edge+docs |
| DB-TYPES-02 | Regen database.types.ts from live schema (migrations 000027–000031); tsc=0 | Team 1 | DONE | MERCH-INTEL-03-DB | `docs/qa/verify_DB-TYPES-02.json` | `fbe7a60` | code+docs |

### P1 GATE — CMS + Editorial (starts when P0 PASS; Team 2 + Team 3 + Team 4 run in parallel)

> **Owner-approved parallel execution:** `CMS-WO-07` + Product Power WOs (`INTEL-POWER-01..05`, `CRM-POWER-01/02`, `SALES-POWER-01`, `MKT-POWER-01`, `EDU-POWER-01`, `COMMERCE-POWER-01`, `ADMIN-POWER-01`, `SITE-POWER-01`, `MOBILE-POWER-01`). Execution truth remains `build_tracker.md` + `docs/qa/verify_*.json`.

| WO ID | Title | Team | Status | Depends On | Proof Pack | Impl SHA | Scope |
|-------|-------|------|--------|------------|------------|----------|-------|
| CMS-SEED-01 | Seed 6 published cms_posts → editorial rail LIVE; 6 rows inserted (2 featured), migration 000033 applied, useStories confirmed LIVE | Team 2 | DONE | DB-TYPES-02 | `docs/qa/verify_CMS-SEED-01.json` | `fe64d8e` | db+docs |
| CMS-WO-07 | story_drafts table + RLS + auto-ingest pipeline (feeds→drafts, not direct publish) | Team 2 | OPEN | CMS-SEED-01 | `docs/qa/verify_CMS-WO-07.json` | — | — |
| CMS-WO-08 | Editorial approval workflow (draft→review→approve→publish, admin UI) | Team 2 | COMPLETE | CMS-WO-07 | `docs/qa/verify_CMS-WO-08_2026-03-11.json` | — | — |
| CMS-WO-09 | WordPress-grade blog (scheduled_at, editorial calendar, OG/Twitter cards, schema.org Article, newsletter export, auto-sitemap) | Team 2 | COMPLETE | CMS-WO-08 | `docs/qa/verify_CMS-WO-09_2026-03-11.json` | — | — |
| CMS-WO-10 | content_placements table + Merchandising Console (owner changes any placement without code deploy) | Team 2 | COMPLETE | CMS-WO-07 | `docs/qa/verify_CMS-WO-10.json` | — | — |
| CMS-WO-11 | Daily Brief + Weekly Market Memo edge fns + pg_cron → story_drafts (not auto-publish) | Team 2 | OPEN | CMS-WO-07, CMS-WO-10 | `docs/qa/verify_CMS-WO-11.json` | — | — |
| CMS-WO-12 | Layout Builder + Block Placement Editing (owner edits any block/layout/grid placement without code deploy) | Team 2 | COMPLETE | CMS-WO-10 | `docs/qa/verify_CMS-WO-12.json` | — | — |
| DATA-PRESS-PROOF | Proof pack: 5 source layers, topic cap, dup rate, 30 signal sample, MERCH 1–12 | Team 2 | OPEN | NEWSAPI-INGEST-01, CMS-WO-07 | `docs/qa/verify_DATA_PRESS_VALUE.json` | — | — |
| EVT-WO-02 | /events/:slug EventDetail + registration CTA + related signals | Team 3 | OPEN | P0 GATE | `docs/qa/verify_EVT-WO-02.json` | — | — |
| ROUTE-CLEANUP-WO | Redirect orphaned routes: /home→/intelligence, /pricing→/plans, /for-medspas→/professionals, dual hubs | Team 3 | OPEN | P0 GATE | `docs/qa/verify_ROUTE-CLEANUP-WO.json` | — | — |
| BRAND-SIGNAL-WO | BrandIntelligenceHub → signal → create_campaign CrossHubActionDispatcher | Team 3 | OPEN | P0 GATE | `docs/qa/verify_BRAND-SIGNAL-WO.json` | — | — |
| PAY-UPGRADE-WO | TierGate → Stripe Checkout Session (BLOCKED: owner must configure stripe_price_id in Stripe dashboard) | Team 3 | BLOCKED | Owner prereq | `docs/qa/verify_PAY-UPGRADE-WO.json` | — | — |
| DEBT-TANSTACK-REAL-6 | Migrate 6 raw useEffect+supabase violations to useQuery | Team 4 | COMPLETE | P0 GATE | `docs/qa/verify_DEBT-TANSTACK-REAL-6_2026-03-11.json` | — | — |
| MERCH-INTEL-03-FINAL | MERCH-01 (openfda source_url), MERCH-06 (paid signal volume), MERCH-10 (30d archive cron) | Team 1 | OPEN | MERCH-INTEL-03-DB | `docs/qa/verify_MERCH-INTEL-03-FINAL.json` | — | — |
| P1-3 | Remove brand-*/intel-* legacy blocks from tailwind.config.js | Team 4 | COMPLETE | P0 GATE | `docs/qa/verify_P1-3_2026-03-11.json` | — | — |
| STATE-AUDIT-01 | Skeleton/error/empty states on priority shell pages | Team 4 | COMPLETE | P0 GATE | `docs/qa/verify_STATE-AUDIT-01_2026-03-11.json` | — | — |
| COVERAGE-EXPANSION-01 | Domain coverage expansion: 53 candidate feeds (nails, makeup, fragrance, bodycare, education_training, spa_hospitality hotel), 18 heroes enabled, 15/15 domains covered, dedup migration 000033 | Team 1 | DONE | none (parallel push-ahead) | `docs/qa/verify_COVERAGE_EXPANSION.json` | pre-`2f005fe` | db+docs |
| MERCH-REMEDIATION-01 | Archive 68 off-topic signals (NASA/dog/depression topics); add provenance_tier column to market_signals; backfill from data_feeds; freshness decay + rankedScore in useIntelligence; timeline eligibility filter. Migrations 000035+000036 applied. MERCH 1–12 audit: 6 PASS, 6 WARN, 0 FAIL → overall PASS | Team 1 | DONE | MERCH-INTEL-03-DB | `docs/qa/verify_INTEL_MERCH.json` + `verify_MERCH-REMEDIATION-01.json` | `36e323a`+`690ea8d`+`94875a2`+`fc4b6cc`+`1722d1f` | db+code+docs |
| MERCH-INTEL-IMAGE-CLICKS | Signal cards clickable → /intelligence/signals/:id; IntelligenceSignalDetail page (TanStack Query v5); getSignalImage() hook deployed; images on all signal cards. tsc=0, build=6.42s | Team 1 | DONE | MERCH-REMEDIATION-01 | `docs/qa/verify_INTEL-UI-CLICK-IMAGE-01.json` | pre-`2f005fe` | code+docs |
| IDEA-MINING-01 | Pattern library from 10 comparable intelligence/feed/benchmark platforms (Inoreader, New Sloth, NewsData.io, PeakMetrics, Pulsar, Sprinklr, Listrak, AMP/Lifetimely, Benchmarkit.ai, Dash Social). 45 patterns, 10 top patterns, 7 anti-patterns, 3 implementation phases. Research + documentation only. Deliverable: docs/research/IDEA-MINING-01-comparables.md | Team 1 | DONE | MERCH-INTEL-IMAGE-CLICKS | `docs/qa/verify_IDEA-MINING-01.json` | `951fd5a` | docs |
| INTEL-UI-REMEDIATION-01 | server-side category filtering (signalTypes? in useIntelligence), image diversity (ID-hash in useSignalImage), spotlightTrends 3→5. GUARDRAIL-01 cleared. | Team 1 | DONE | IDEA-MINING-01 | `docs/qa/verify_INTEL-UI-REMEDIATION-01.json` | `342f263`+`09e7161`+`6b330e4`+`2e8b94a` | code |

### GUARDRAIL-01 STATUS (gate for all Intelligence UI + feed UX work)

> **Rule:** No Intelligence UI proposals, module rewires, or feed UX improvements may proceed unless GUARDRAIL-01 is CLEARED.

| Required Verify Artifact | Status | Notes |
|--------------------------|--------|-------|
| `docs/qa/verify_AGENT_ACTIVATION.json` | ✅ PASS | Agent #17 INTELLIGENCE-MERCHANDISER registered |
| `docs/qa/verify_INTEL_MERCH.json` | ✅ PASS | MERCH 1–12 audit: 6 PASS, 6 WARN, 0 FAIL — MERCH-REMEDIATION-01 cleared all FAIL rules |
| `docs/qa/verify_INTEL-UI-CLICK-IMAGE-01.json` | ✅ PASS | Signal cards clickable, images on all cards, signal detail route working |
| `docs/qa/verify_COVERAGE_EXPANSION.json` | ✅ PASS | 103 enabled feeds, 15/15 domains covered |
| `docs/qa/verify_MERCH-INTEL-02.json` | ✅ PASS | Coverage gates met; known issues on commercial feeds tracked |
| `docs/qa/verify_IDEA-MINING-01.json` | ✅ PASS | Pattern library committed (951fd5a); 10 platforms, 45 patterns |

**GUARDRAIL-01: ✅ CLEARED as of commit 951fd5a (2026-03-13)**

**What is now unlocked:**
- INTEL-UI-REMEDIATION-01 (server-side category filtering, image diversity, spotlightTrends 3→5)
- Any Intelligence Hub UX work citing patterns from IDEA-MINING-01-comparables.md
- CMS-WO-07 (next in P1 queue)

**What remains blocked (separate gates):**
- PAY-UPGRADE-WO — BLOCKED pending owner Stripe dashboard config
- P2-1, P2-STRIPE — blocked on P1 gate completion

### PR → WO RECONCILIATION (Part B — Governance Directive 2026-03-10)

> **Authority:** GOVERNANCE.md §4 (Branch and PR Policy). All 5 open PRs were created WITHOUT WO mapping. This reconciliation maps them before any merges.

| PR | Branch | Mapped WO(s) | WOs on main? | Risk | Merge Order | Disposition |
|----|--------|-------------|-------------|------|-------------|-------------|
| #1 | `phase0/cleanup-and-migration` | DEBT-TANSTACK-6, FOUND-WO-04 | Partial | ⚠️ MED | 1st | ✅ MERGED `c5761e6` → tag `lkg-2026-03-10-pr1-cleanup` |
| #2 | `phase0/design-system-cleanup` | V2-TECH-07 (FROZEN), P1-1/P1-2 | Most done | 🔴 HIGH | 3rd | ✅ MERGED `75257b8` → tag `lkg-2026-03-10-pr2-design` (net-new: WCAG aria-busy, ui/ canonical ErrorBoundary) |
| #3 | `phase0/ai-security-lockdown` | V2-INTEL-02, PAY-WO-01..05, CTRL-WO-01..04 | _shared/ net-new | 🔴 HIGH | 4th | ✅ MERGED `b01e88b` → tag `lkg-2026-03-10-pr3-security` (net-new: 7-gate pipeline, 6 _shared/ modules) |
| #4 | `phase0/intelligence-ux-polish` | INTEL-WO-08, MERCH-INTEL-IMAGE-CLICKS, INTEL-UI-REMEDIATION-01 | Enhanced | 🔴 HIGH | 5th | ✅ MERGED `0376111` → tag `lkg-2026-03-10-pr4-intel-ux` (net-new: 5 dedicated intelligence state components) |
| #5 | `phase0/pricing-and-gates` | V2-PLAT-04 (OPEN), V2-PLAT-05 (OPEN), PAY-UPGRADE-WO (BLOCKED) | Primary WOs still OPEN | ⚠️ MED | 2nd | ✅ MERGED `ce1e8bd` → tag `lkg-2026-03-10-pr5-pricing` (post-fix: banned term in PaywallGate) |

**Merge execution: COMPLETE** — All 5 PRs merged in order #1→#5→#2→#3→#4. Zero conflicts. Zero tsc errors. Zero build errors across all 5 merges. 5 LKG tags created.

**Final state:** 0 open PRs. Last commit: `0376111`. Proof: `docs/qa/verify_GOVERNANCE_PART_C_MERGE_2026-03-10.json`

---

### P2 GATE — Testing / CI (starts when P1 PASS)

| WO ID | Title | Team | Status | Depends On | Proof Pack |
|-------|-------|------|--------|------------|------------|
| P2-1 | Upgrade @testing-library/react →^17.x; fix 29 failing tests | Team 5 | OPEN | P0 GATE | `docs/qa/verify_P2-1.json` |
| P2-STRIPE | Confirm single Stripe webhook handler; no double-write | Team 5 | OPEN | P0 GATE | `docs/qa/verify_P2-STRIPE.json` |

---

## ⛔ V2-TECH FREEZE — EFFECTIVE IMMEDIATELY (March 8, 2026)

**ALL V2-TECH work orders are COMPLETE and FROZEN.** Do not resume, extend, or create new V2-TECH WOs.

**V2-TECH-01 through V2-TECH-07: ALL DONE ✅** — React 19, Vite 6, TS strict, TanStack Query, observability baseline, types regen, Playwright. Observability is satisfied via Admin Hub dashboards and CMS Hub publish/route health — not external Sentry dashboards.

**From this point forward, the ONLY execution priority is:**
1. **WO-CMS-01 through WO-CMS-06** (V3 Internal CMS Build)
2. **Hub-by-hub V3 upgrades** (after CMS is live)

**Authority:** `docs/command/V3_BUILD_PLAN.md` + `V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md`

**Do NOT touch:** V2-INTEL, V2-HUBS, V2-MULTI, V2-LAUNCH, W11, or WAVE OVERHAUL items until all WO-CMS work orders are complete.

---

Completed 2026-03-09 (BUILD 4 — STUDIO-UI-01..05): StudioEditor.tsx fully wired — DragCanvas interactive canvas (drag/resize/rotate, 8-handle resize, pointer capture), TemplatePickerModal (52 templates × 10 categories, category filter, thumbnail grid), ExportModal (PNG/JPG/PDF/SVG/SCORM 2004 formats), Doc/Canvas mode toggle, grid overlay toggle, canvas_blocks saved/restored in metadata, template presetId sets output preset. tsc=0 errors. Remaining: STUDIO-UI-07 (comments), STUDIO-UI-08 (brand kit), STUDIO-UI-09 (mobile quick authoring).
W14-01: Pre-launch quiz page ✅ — PrelaunchQuiz.tsx at / (App.tsx updated); Home kept at /home; migration 20260307000001 adds zip_code + quiz_answers JSONB to access_requests; 8-question professional benchmarking quiz → lead capture → results view; Pearl Mineral V2; SEO Helmet + JSON-LD; tsc pending (run before deploy)
Current Phase: **V3 WAVE 2** — Remaining CMS + Intelligence Cloud + Hub completions
V2-TECH: ✅ ALL COMPLETE + FROZEN (do not resume)
V3 Wave 1: ✅ COMPLETE (Session 48, commit d9dfa82 — 109 files, 13,481 insertions)
V3 Wave 1.5: ✅ COMPLETE (Session 48, commit 14362ac — 28 files, 5,447 insertions)
V3 Wave 2: ✅ COMPLETE (Session 48, commit fb228d6 — 28 files, 5,739 insertions)
V3 Wave 3: ✅ COMPLETE (Session 48, commit 7cc667a — 25 files, 5,680 insertions)
V3 Wave 4: ✅ COMPLETE (Session 48, commit b6daca0 — 42 files, 2,355 insertions)
Next Milestone: font-serif purge + pro-* token removal + Sentry removal → V2-PLAT-04 (onboarding) → V2-PLAT-05 (paywall)
Completed 2026-03-09 (Session 48 — V3 Wave 4): V2-HUBS-14 (CMS content surfaces — IntelligenceBriefs, IntelligenceBriefDetail, EducationArticles, HelpCenter DEMO, Stories DEMO + 5 routes), IntelligenceHub.tsx rewrite (795→407 lines, 10 cloud modules + 6 AI tools wired, 6-tab layout), W12-13 (WCAG accessibility — skip nav, ARIA landmarks, form labels, 40+ aria-hidden icons on 9 files), SEO audit (61 public pages → 100% meta coverage, 28 files fixed). tsc=0 errors.
Completed 2026-03-09 (Session 48 — V3 Wave 3): V2-HUBS-05 complete (Admin Hub — AdminUsers, AdminAuditLog, AdminFeatureFlags, AdminPlatformSettings + 4 routes), V2-INTEL-01 (10 Intelligence Cloud modules under components/intelligence/cloud/), V2-INTEL-03 (6 AI tools under components/intelligence/tools/), W12-23 (Home.tsx already clean — verified), W12-24 (BrandStorefront gradients normalized to Pearl Mineral V2). tsc=0 errors.
Completed 2026-03-09 (Session 48 — V3 Wave 2): V2-HUBS-01 (Intelligence Hub — full dashboard, KPI strip, sortable signal table, timeline, opportunity signals, slide-out detail panel, AI toolbar DEMO), V2-HUBS-02 (Jobs Hub — live TanStack Query, filters, Schema.org JSON-LD, talent signals), V2-HUBS-03 (Brands Hub — competitive intelligence tab, signal mentions, CSV export, Schema.org), V2-HUBS-04 (Professionals Hub — live directory from user_profiles, search/filter, Schema.org Person, CSV export), V2-HUBS-08 (Marketing Hub — dashboard, campaign list/builder 4-step wizard, templates from cms_templates), V2-HUBS-12 (Credit Economy — dashboard with usage history, tier allocation, purchase page DEMO), V2-HUBS-13 (Affiliate Engine — dashboard with FTC badges, link manager with copy-to-clipboard DEMO), WO-CMS-06 (CMS Hub Integrations — 6 space-specific hooks: intelligence, education, marketing, sales, jobs, brands). Routes added: /portal/credits, /portal/credits/purchase, /portal/affiliates, /portal/affiliates/links, /portal/marketing-hub/*, tsc=0 errors.
Completed 2026-03-09 (Session 48 — V3 Wave 1.5): WO-CMS-05 (Authoring Studio — StudioHome + StudioEditor 3-panel + CourseBuilder 5-step wizard + useStudioDocs hook + 3 App.tsx routes), V2-HUBS-05 partial (Admin System Health Dashboard — KPI strip, feed errors, quick actions, feed status), CMS Media Library full upgrade (drag-drop multi-format upload, grid/list view, preview modal, metadata editor, CSV export). Hub depth upgrades: CRM Today View + intelligence tab + churn risk + skeleton shimmers; Sales CSV export + error states + skeleton shimmers + empty states; Education intelligence recommendations + CSV export + skeleton shimmers + empty states. tsc=0 errors.
Completed 2026-03-09 (Session 48 — V3 Wave 1): WO-CMS-03 (CMS Hub UI — 7 admin pages), WO-CMS-04 (PageRenderer + 12 block types + blog + CMS public routes), V2-INTEL-02 partial (7 AI engine guardrails + credit gates), V2-HUBS-06 (CRM Hub — tasks, segments, CSV export, edit flows), V2-HUBS-07 partial (Education — CE credits + staff training), V2-HUBS-09 (Sales Hub — deals, opportunities, revenue analytics), V2-HUBS-10 (Commerce — intelligence-first shop + trending + affiliate badges), Design compliance (accent-hover=#5A7185, accent-soft=#E8EDF1 added, font-serif purge, legacy token cleanup). 14 Intelligence modules wired (figma-spec adapters). 2 pg_cron migrations for RSS pipeline. tsc=0 errors, build=5.08s.
Completed 2026-03-06 (Session 38 — Wave 13): W13-01 (data_feeds table + RLS + indexes), W13-02 (feed-orchestrator edge function — RSS+API→market_signals), W13-03 (AdminFeedsHub /admin/feeds — full CRUD), W13-04 (102 seed rows across 14 categories), W13-05 (useDataFeedStats + dataSourcesCount in usePlatformStats — full pipeline wired), W13-06 (100 additional sources from Open Source Beauty & Wellness APIs research — grand total 202 feeds)
Completed 2026-03-06 (Session 37 — 4 parallel lanes): W12-04 (brandIntelligence DB wiring), W12-05 (Portal IntelligenceHub live), W12-06 (BenchmarkDashboard live aggregates), W12-07 (Brand Intelligence+Report live), W12-08 (Brand Analytics live), W12-11 (8 admin hub functional shells — 5 LIVE, 3 DEMO), W12-12 (MarketingCalendar isLive), W10-12 (ProtocolDetail adoptionCount DEMO badge)
Doc Gate PASS 2026-03-06 (Session 37 Lane A): W12-19 ✅ (all 13 remediation items verified), W12-21 ✅ (useRssItems→rss_items, isLive gates rendering), W12-22 ✅ (useIngredients→ingredients table, isLive gates count+timestamps)
Doc Gate PASS 2026-03-06 (Session 34 Lane D): W10-11 ✅ (trigger artifact + send-email handler verified), W12-16 ✅ (all 5 functions ACTIVE on rumdmulxzmjtsplsjngi — supabase functions list EXIT:0), W12-20 ✅ (migration applied + rss-to-signals ACTIVE on rumdmulxzmjtsplsjngi — provenance + dedup index + signal_type heuristic verified)
Completed 2026-03-06 (Session 36): W12-28/29/30/31/32/33/34/35/36/37/38/39 (complete Wave 12 public page redesign — tsc 0 errors, build 3.64s)
Completed 2026-03-06 (Session 33 Lane A): W12-16 (intelligence-briefing + jobs-search edge functions)
Completed 2026-03-06 (Session 33 Lane B): W12-19 (remediation sweep), W12-21 (Insights live RSS wire), W12-22 (Ingredients directory) — ✅ Doc Gate PASS confirmed Session 37
Completed 2026-03-06 (Session 32): W12-10 (Marketing site content buildout — 4 pages: /, /professionals, /for-brands, /plans)
Completed 2026-03-06 (Session 31): W10-11 (Auto-email trigger on access_requests INSERT), W12-09 (Dynamic sitemap edge function)
Completed 2026-03-06 (Session 30): W10-10 (NPI Registry), W10-08 (RSS ingestion pipeline), W10-09 (Open Beauty Facts ingredients)
Source of Truth: /.claude/CLAUDE.md (root governance) + /docs/command/* (canonical doctrine) + MASTER_STATUS.md (repo root)

⚠️ LAUNCH GATE — DO NOT GO LIVE
The site must NOT be made live (production deploy, DNS pointing to production, or public launch) until the product owner explicitly says "make it live" or "go live." Do not deploy to production, connect socelle.com to a live build, or remove any staging/preview safeguards without that explicit instruction.

---

⚠️ DESIGN SYSTEM CHANGE — READ BEFORE ANY UI WORK
Sessions 1–24 used pro-* tokens (pro-charcoal, pro-ivory, pro-gold, etc.).
Waves 1–9 (March 3–5, 2026) replaced ALL public page tokens with Pearl Mineral V2.
DO NOT use pro-* tokens on any page in src/pages/public/.
DO NOT use font-serif on any public page.
DO NOT use DM Serif Display, Playfair Display, or Inter on public pages.
pro-* portal cleanup: COMPLETE (verified 2026-03-09 — 0 usages in src/ including all portals; migration executed via Ultra Drive UD-A-01..UD-A-06). Prior exemption "do not clean without a dedicated audit WO" was a false self-certification — deleted per ULTRA_DRIVE_PROMPT.md §2 Lane E.
Full spec: CLAUDE.md (root) → LOCKED DESIGN SYSTEM section.

---

RECENT PROGRESS — WAVES 1–9 (March 3–5, 2026, Sessions ~25)

Design system overhaul (Waves 1–6):
- Pearl Mineral V2 applied to all 23 public pages
- Tailwind config: graphite = #141418, mn-bg = #F6F3EF, accent = #6E879B
- All pro-* tokens removed from public pages
- font-serif violations: 0 (cleaned in W9-06)
- Banned SaaS phrases: 0 (full copy sweep)
- General Sans via Fontshare wired as primary typeface on all public pages
- Liquid Pearl glass system on MainNav and cards

Navigation fixed (W9-01):
- MainNav updated to 8 required links: Intelligence | Brands | Education | Events | Jobs | For Buyers | For Brands | Pricing
- Auth-aware right pill: admin→/admin, business_user→/portal/dashboard, brand_admin→/brand/dashboard, guest→Sign In + Request Access

Conversion funnel fixed (W9-01):
- RequestAccess.tsx form now inserts to access_requests Supabase table (was broken — e.preventDefault() with no DB write)
- BenchmarkDashboard route added to App.tsx (/portal/benchmarks — was orphaned)

New pages built (W9-02, W9-03):
- Events.tsx at /events — Phase 1 stub with 8 mock events, dark hero, filter system
- Jobs.tsx at /jobs — stub with 12 mock jobs
- JobDetail.tsx at /jobs/:slug — job detail page

SEO (W9-04):
- Helmet meta tags added to: HowItWorks, Pricing, FAQ, Education, Protocols, Brands, ApiDocs, ApiPricing, ProtocolDetail

Live Data Infrastructure (W9-05):
- market_signals Supabase table created (migration: create_market_signals)
- 10 curated seed signals across 8 categories (migration: seed_market_signals_initial)
- useIntelligence.ts rewritten V2: fetches from market_signals → mock fallback → isLive flag
- Intelligence.tsx: PREVIEW banner when isLive=false, skeleton loading, dynamic freshness label
- Insights.tsx: Full rewrite to Pearl Mineral V2 (was still using pro-* tokens)
- AdminMarketSignals.tsx: New admin page at /admin/market-signals for curating signals

Infrastructure:
- MASTER_STATUS.md created at repo root — authoritative sweep of every page, portal, data state
- 70 migrations total (ADD ONLY policy strictly enforced)
- TypeScript: 0 errors. Build: passing.

RECENT PROGRESS — SESSIONS 18–24 (Feb 28, 2026)

- BUG-M01 fixed: Brand inbox rewritten from legacy brand_messages to conversations + messages system
- Admin Brand Hub: Orders, Products, Retailers, Analytics, Settings wired to DB
- Reseller application: /portal/apply, Dashboard Apply Now / Under review banners
- Order tracking: Reseller OrderDetail shows tracking section + Track package link
- Unverified business listing: /brand/pipeline, Flag as Fit → business_interest_signals
- Basic product search: tsvector on pro_products + retail_products (migration 20260228100001)
- Brand claim flow: /claim/brand/:slug, claim_brand RPC, /brand/claim/review
- Business claim flow: /claim/business/:slug, claim_business RPC, /portal/claim/review
- Returns workflow: request_return/resolve_return RPCs (migration 20260228100004)
- Order-linked messages: get_or_create_order_conversation RPC (migration 20260228100005)
- Email transactional: send-email Edge Function (Resend) — new_order + order_status types
- Dashboard resilience: Promise.allSettled on Business, Brand, Admin dashboards

---

AUTONOMOUS CORE INTELLIGENCE MODE (Payment Bypass — Still Active)
- Paywall is technically open: all users treated as PRO. No Stripe/RevenueCat/subscriptions implementation yet.
- Payment bypass flag: src/lib/paymentBypass.ts (VITE_PAYMENT_BYPASS=false to restore guards)
- All Tier 1 Payment tasks (Stripe checkout, Stripe Connect, subscription tables) remain POSTPONED
- Directive: /docs/SOCELLE_Master_Strategy_Build_Directive.md

---

PLATFORM SPECS / DEEP DIVES (consult when building in these areas)
| Doc | Use when |
|-----|----------|
| CLAUDE.md (root) | ALWAYS READ FIRST — design tokens, nav spec, protected routes, non-negotiable rules |
| MASTER_STATUS.md (root) | Current state of every page, portal, data source — updated Wave 9 |
| /docs/SOCELLE_MASTER_PROMPT_FINAL.md | ARCHIVED (moved to docs/archive/) — design tokens + governance now in /docs/command/* |
| /docs/MASTER_PROMPT_VS_RESEARCH.md | Strategic alignment with 2026 Beauty/SaaS research |
| /docs/platform/RESELLER_EDUCATION_2026_DEEP_DIVE.md | Education Hub, reseller learning, credentials, AI-led flows |
| /docs/platform/UI_UX_SITE_DESIGN_DEEP_DIVE.md | UI/UX, site design — use for portal work; public page design governed by CLAUDE.md |
| /docs/platform/COMMUNITY_NEWS_AND_BEAUTY_INTELLIGENCE_DEEP_DIVE.md | Community, news/digests, AI beauty intelligence, habit loops |
| /docs/platform/FIGMA_AUDIT_AND_ACTION_PLAN.md | Figma audit checklist |
| /docs/MASTER_BRAIN_ARCHITECTURE.md | AI orchestrator (4-tier OpenRouter), atomic credits, mobile-web tokens |
| /docs/SOCELLE_Master_Strategy_Build_Directive.md | Autonomous Core Intelligence — payment bypass, mission priorities |
| /docs/SOCELLE_COMPLETE_API_CATALOG.md | 90+ external APIs cataloged — 0 integrated as of Wave 9 |

---

WAVE 10 — CURRENT PRIORITIES (Short Term, 1–2 weeks)

🟢 Fix Before Launch (P0 — ALL COMPLETE, Session 26, 2026-03-06)
| # | Task | File | Status |
|---|------|------|--------|
| W10-01 | ForgotPassword + ResetPassword pro-* → Pearl Mineral V2 | ForgotPassword.tsx, ResetPassword.tsx | ✅ Done — all pro-* replaced with mn-bg, graphite, accent, mn-dark |
| W10-02 | Home market pulse DEMO label | Home.tsx | ✅ Done — INTELLIGENCE_SIGNALS timestamps → "Demo", pulsing green badge → static amber "Demo Data — Preview Only" |
| W10-03 | BrandStorefront PREVIEW labels | BrandStorefront.tsx | ✅ Done — amber "Preview" badge on PeerAdoptionBanner + ProfessionalsAlsoBoughtSection |
| W10-04 | Insights.tsx orphan resolved | Home.tsx | ✅ Done — /insights already redirects to /intelligence in App.tsx; fixed Home.tsx CTA to link directly to /intelligence (removes redirect hop). Insights.tsx is dead code, kept in place. |

🟡 Wave 10 Features
| # | Feature | Scope | Est |
|---|---------|-------|-----|
| ✅ W10-05 | events Supabase table + wire Events.tsx | Migration + page update | 4h |
| ✅ W10-06 | job_postings Supabase table + wire Jobs.tsx | Migration + page update | 6h |
| ✅ W10-07 | Home market pulse live wire (COUNT from Supabase) | Migration view + Home.tsx | 3h |
| ✅ W10-08 | RSS ingestion pipeline — Edge Function, 10 feeds, rss_items table | Edge Fn + migration | 10h |
| ✅ W10-09 | Open Beauty Facts integration — ingredients table | Edge Fn + migration | 8h |
| ✅ W10-10 | NPI Registry operator verification | Edge Fn + businesses column | 6h |
| ✅ W10-11 | Auto-email trigger on access_requests INSERT | DB webhook + send-email edge fn | 2h |
| ✅ W10-12 | ProtocolDetail adoptionCount DEMO badge | `pages/public/ProtocolDetail.tsx` | Web Agent | Added DEMO badges next to adoptionCount in hero + sidebar — no live wiring, label-only | 2h |

---

W10-10 SCOPE — NPI Registry Operator Verification
WO: W10-10 | Owner: Backend Agent | Status: ✅ Complete (2026-03-06)

Goal: Operators supply their NPI number; `ingest-npi` Edge Function verifies it against
the CMS NPPES NPI Registry (free public API, no key required), then stamps npi_verified
on the businesses row.

Phase 1 — Migration (ADD ONLY):
  File: supabase/migrations/20260306300001_add_npi_columns_to_businesses.sql
  - ALTER TABLE businesses ADD COLUMN npi_number VARCHAR(10);
  - ALTER TABLE businesses ADD COLUMN npi_verified BOOLEAN NOT NULL DEFAULT FALSE;
  - ALTER TABLE businesses ADD COLUMN npi_verified_at TIMESTAMPTZ;
  - CREATE INDEX ON businesses (npi_number) WHERE npi_number IS NOT NULL;

Phase 2 — Edge Function:
  File: supabase/functions/ingest-npi/index.ts
  POST /functions/v1/ingest-npi  { "business_id": "<uuid>" }
  External: https://npiregistry.cms.hhs.gov/api/?number=<NPI>&version=2.1 (no key)
  Secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

Data provenance (SOCELLE_DATA_PROVENANCE_POLICY.md §2):
  Source: CMS NPPES — Tier 1 (government registry), confidence 1.0 for verified match

Proof:
  - npx tsc --noEmit → 0 errors
  - supabase/functions/ingest-npi/index.ts — present
  - supabase/migrations/20260306300001_add_npi_columns_to_businesses.sql — present

---

WAVE 11 — MEDIUM TERM (1 month, external APIs + enrichment)
Source: Transferred from MASTER_STATUS.md to build_tracker.md (execution authority per CLAUDE.md §D)

| # | Feature | Scope | Owner Agent | Est |
|---|---------|-------|-------------|-----|
| W11-01 | Google Trends integration — 30 beauty terms → Intelligence Hub | Edge Fn + signals table | Backend Agent | 8h |
| W11-02 | NewsAPI/GNews integration — real articles for intelligence feed | Edge Fn + rss_items | Backend Agent | 6h |
| W11-03 | Benchmark Dashboard live data — peer benchmarks from `businesses` aggregates | Portal page + migration | Backend + Web Agent | 10h |
| W11-04 | Business portal Intelligence Hub live data | IntelligenceHub.tsx + market_signals | Web Agent | 8h |
| W11-05 | Brand Intelligence Reports — wire to real signal data | IntelligenceReport.tsx | Web Agent | 8h |
| W11-06 | Open FDA safety data — ingredient compliance checks | Edge Fn + safety_events table | Backend Agent | 6h |
| W11-07 | Google Places / Yelp enrichment — operator profiles | enrichmentService.ts upgrade | Backend Agent | 12h |
| W11-08 | Operator enrichment pipeline — schedule, orchestrate, store | Edge Fn scheduler | Backend Agent | 16h |
| W11-09 | WebM video conversion (all 6 videos — 30-40% size reduction) | Build pipeline | Web Agent | 2h |
| W11-10 | Dynamic sitemaps (brands, protocols, jobs from Supabase) | Edge Fn sitemap generator | SEO + Backend Agent | 4h |
| W11-11 | WCAG accessibility audit | All public pages | Web Agent | 8h |
| W11-12 | Jobs international expansion (UK, CA, AU, UAE) | 4 route sets + hreflang | Web Agent | 16h |
| W11-13 | Square Bookings operator sync — connect operator Square account, sync appointments + service pricing | OAuth callback Edge Fn + sync Edge Fn + square_connections migration | Backend Agent | 10h | ⚠️ NEEDS OWNER APPROVAL — WO registered without explicit GO (governance violation, Session 29). Status reverted. ⛔ ALSO BLOCKED: plaintext token storage (see W11-13 Security Block below). DO NOT apply migration 20260306200001 until both conditions are resolved. |

W11-13 SECURITY BLOCK — Plaintext OAuth Tokens
Status: ⛔ BLOCKED — not acceptable for launch.
Issue: square_connections.access_token and .refresh_token are stored as plaintext TEXT columns in migration 20260306200001. This is a P0 security risk — credential exposure via DB dump, logging, or inadvertent SELECT *.
Resolution required before GO:W11-13 can be accepted:

Option A (RECOMMENDED): Supabase Vault
- Requires: vault extension enabled (Dashboard → Database → Extensions → vault)
- Schema change: Replace access_token TEXT + refresh_token TEXT columns with vault_access_token_id UUID + vault_refresh_token_id UUID (references to vault.secrets)
- Write path: vault.create_secret(secret := <token>, name := 'sq_access_<business_id>') → returns UUID stored in square_connections
- Read path in Edge Fn: SELECT decrypted_secret FROM vault.decrypted_secrets WHERE id = $vault_id
- Migration: replace 20260306200001 with a revised version using vault UUID columns (ADD ONLY — write new migration, do not edit the existing one if already applied)

Option B (Fallback — if Vault extension unavailable on plan):
- Use pgcrypto pgp_sym_encrypt / pgp_sym_decrypt with a SOCELLE_TOKEN_ENCRYPTION_KEY Supabase secret
- Store encrypted bytea in access_token_enc + refresh_token_enc columns
- Decrypt in Edge Function only at point of use; never SELECT * across token columns

Owner-confirmed token storage decision (Session 29):
  PRIMARY:  Option A — Supabase Vault (vault_access_token_id + vault_refresh_token_id UUID columns)
  FALLBACK: Option B — pgcrypto pgp_sym_encrypt with managed key stored as Supabase secret
            (use only if Vault extension is unavailable on this project/plan)

Proof required before WO can resume:
1. Owner issues explicit GO:W11-13
2. Vault extension status confirmed (Dashboard → Database → Extensions → vault)
3. Updated migration using vault UUID columns (Option A) or encrypted bytea columns (Option B)
4. Updated Edge Functions reading from vault.decrypted_secrets / decrypting at point of use only
5. build_tracker BLOCKED note removed only after items 1–4 are complete

No Square artifact (migration, Edge Function, secrets provisioning) may be applied or deployed
until GO:W11-13 is explicitly issued by owner.

---

WAVE 12 — GAP DISCOVERY (Build Gap Discovery, Session 27, 2026-03-06)
Source: Derived from cross-referencing 9 canonical docs (CLAUDE.md, MONOREPO_MAP, SITE_MAP, MODULE_BOUNDARIES, HARD_CODED_SURFACES, AGENT_SCOPE_REGISTRY, AGENT_WORKFLOW_INDEX, build_tracker, MASTER_STATUS)
Priority: FAIL 4 compliance first → intelligence thesis → revenue → SEO

🔴 FAIL 4 Compliance (public-facing unverified claims)
| # | Task | Scope | Owner Agent | Data Truth | Est |
|---|------|-------|-------------|------------|-----|
| ✅ W12-01 | ForBrands + Professionals STATS → DEMO badge (amber) | `ForBrands.tsx`, `Professionals.tsx` | Web Agent | Amber "Preview Data" badge added; FAIL 4 fix: "Live market signals" → "Market signals" | 1h |
| ✅ W12-02 | Plans TIERS → DEMO badge (amber) | `Plans.tsx` | Web Agent | Amber "Preview Pricing" badge added below CTAs | 2h |
| ✅ W12-03 | ProtocolDetail adoptionCount → (est.) qualifier | `ProtocolDetail.tsx:181`, `ProtocolDetail.tsx:362` | Web Agent | Added "(est.)" inline at both display sites | 3h |

🟡 Intelligence Thesis (subscribers/partners seeing mock data)
| # | Task | Scope | Owner Agent | Data Truth | Est |
|---|------|-------|-------------|------------|-----|
| ✅ W12-04 | brandIntelligence.ts → DB wiring (PEER_DATA_MAP, ADOPTION_MAP, ALSO_BOUGHT_MAP) | `src/lib/intelligence/useBrandIntelligence.ts` (new), `BrandStorefront.tsx` | Backend + Web Agent | LIVE when orders exist / DEMO with PREVIEW badge on mock fallback | 8h |
| ✅ W12-05 | Portal Intelligence Hub → live market_signals | `pages/business/IntelligenceHub.tsx` | Web Agent | useIntelligence() wired, isLive + PREVIEW banner on mock fallback | 4h |
| ✅ W12-06 | Portal Benchmark Dashboard → live aggregates | `src/lib/intelligence/useBenchmarkData.ts` (new), `BenchmarkDashboard.tsx` | Backend + Web Agent | LIVE when business has orders / DEMO badge on fallback | 8h |
| ✅ W12-07 | Brand Intelligence + Report → live signal data | `BrandIntelligenceHub.tsx`, `IntelligenceReport.tsx` | Web Agent | useIntelligence() wired, isLive + PREVIEW banners on both pages | 6h |
| ✅ W12-08 | Brand Analytics → live order/product aggregates | `src/lib/intelligence/useBrandAnalytics.ts` (new), `BrandDashboard.tsx` | Backend + Web Agent | LIVE when KPIs > 0 / DEMO badge on fallback. No migration needed. | 6h |

🟢 SEO + Infrastructure
| # | Task | Scope | Owner Agent | Data Truth | Est |
|---|------|-------|-------------|------------|-----|
| ✅ W12-09 | Dynamic sitemap Edge Function | `supabase/functions/sitemap-generator/`, `public/sitemap.xml` | SEO + Backend Agent | LIVE — pulls from `brands`, `protocols`, `job_postings` | 4h |
| ✅ W12-10 | Marketing site content buildout (4 stub routes → real content) | `apps/marketing-site/src/app/page.tsx`, `professionals/page.tsx`, `for-brands/page.tsx`, `plans/page.tsx` | SEO Agent | Static content — no DB dependency | 8h |
| ✅ W12-11 | Admin hub stubs → functional shells (CRM, Social, Sales, Editorial, Affiliates, Events, Jobs, Recruitment) | `pages/admin/` (8 hub files) | Admin Control Center Agent | 8 shells: CrmHub (LIVE access_requests), SalesHub (LIVE orders), EditorialHub (LIVE rss_items), EventsHub (LIVE events), JobsHub (LIVE job_postings), SocialHub (DEMO), AffiliatesHub (DEMO), RecruitmentHub (DEMO). Routes in App.tsx. tsc 0 errors | 12h |
| ✅ W12-12 | Portal MarketingCalendar → isLive flag | `components/MarketingCalendarView.tsx` | Web Agent | Added isLive state + isSupabaseConfigured check + conditional DEMO badge. tsc 0 errors | 4h |

🔴 FAIL 3 Compliance — Design Lock Violations (owner-approved 2026-03-06, Session 35)
| # | Task | Scope | Owner Agent | Data Truth | Est |
|---|------|-------|-------------|------------|-----|
| W12-23 | Home.tsx Warm Cocoa purge — replace all hardcoded Cocoa hex (#47201c, #29120f, #f8f6f2) + inline gradients with mn-*/graphite/accent tokens | `src/pages/public/Home.tsx` | Web Agent (Lane B) | N/A — token swap only, no data surfaces | 2h |
| W12-24 | BrandStorefront.tsx token normalization — replace #1E252B→#141418, convert inline palette constants/gradients to approved Tailwind tokens | `src/pages/public/BrandStorefront.tsx` | Web Agent (Lane B) | N/A — token swap only | 2h |
| W12-25 | Scope Warm Cocoa tokens to portals only — wrap cocoa/page/ds-* CSS vars in `.portal-context` class, prevent global Tailwind utility generation | `src/index.css` (lines 92–180), `tailwind.config.js` (cocoa/page/ds-* entries) | Design Parity Agent (Lane X) | N/A — scoping only, no deletions | 2h |

🟠 Public Page Layout Upgrade (owner-approved 2026-03-06, Session 35)
| # | Task | Scope | Owner Agent | Data Truth | Est |
|---|------|-------|-------------|------------|-----|
| ✅ W12-26 | Public Page Layout Upgrade (anti-card, media-first) — HeroMediaRail, SplitFeature, EvidenceStrip primitives applied to all 5 main public pages | New: `HeroMediaRail.tsx`, `SplitFeature.tsx`, `EvidenceStrip.tsx`. Pages: Home, Intelligence, BrandStorefront, ForBrands, Professionals | Web Agent | Committed `3655319`. tsc 0 errors | 16h |

🟠 Public UI Kit Normalization (owner-approved 2026-03-06, Session 35)
| # | Task | Scope | Owner Agent | Data Truth | Est |
|---|------|-------|-------------|------------|-----|
| ✅ W12-27 | Public UI Kit Normalization (Buttons + Typography) — 9 btn-mineral-* class recipes in index.css, font-sans enforced, font-mono for data only | Class recipe in `index.css`. Pages: Home, Intelligence, ForBrands, Professionals, BrandStorefront, HowItWorks, Pricing, FAQ, RequestAccess + public components | Web Agent | Committed `3655319`. tsc 0 errors | 12h |

✅ WAVE 13 — Admin Feed Manager + Intelligence Wiring (Session 38 — COMPLETE)
| # | Task | Scope | Owner Agent | Data Truth | Est |
|---|------|-------|-------------|------------|-----|
| ✅ W13-01 | data_feeds migration — admin-managed feed registry table | `supabase/migrations/20260306600001_create_data_feeds_table.sql` | Backend Agent | LIVE — table + RLS (admin only) + 3 indexes + updated_at trigger | 2h |
| ✅ W13-02 | feed-orchestrator edge function — reads data_feeds, dispatches to ingestors | `supabase/functions/feed-orchestrator/index.ts` | Backend Agent | LIVE — reads enabled feeds, RSS→market_signals, API→market_signals, webhook/scraper pending | 6h |
| ✅ W13-03 | /admin/feeds page — functional feed manager (toggle on/off, add new, status) | `src/pages/admin/AdminFeedsHub.tsx` + `App.tsx` route `/admin/feeds` | Admin Control Center Agent | LIVE — full CRUD, toggle is_enabled, category filters, status dots, orchestrator trigger button | 4h |
| ✅ W13-04 | Seed data_feeds with 100+ free RSS/API sources | `supabase/migrations/20260306600002_seed_data_feeds.sql` | Backend Agent | LIVE — 102 rows across 14 categories, all is_enabled=false (owner toggles ON from admin) | 3h |
| ✅ W13-05 | Wire intelligence hooks to aggregate signals from data_feeds-sourced pipelines | `src/lib/intelligence/useDataFeedStats.ts` + `src/lib/usePlatformStats.ts` | Web Agent | LIVE — useDataFeedStats hook + dataSourcesCount in usePlatformStats. Pipeline: data_feeds→feed-orchestrator→market_signals→useIntelligence()→Intelligence Hub | 4h |
| ✅ W13-06 | Seed data_feeds Wave 2 — 100 additional sources from Open Source Beauty & Wellness APIs research | `supabase/migrations/20260306600003_seed_data_feeds_wave2.sql` | Backend Agent | LIVE — 100 new rows (ingredients, market_data, trade_pub, press_release, academic, regulatory, brand_news, social, association, supplier, government, events, regional, jobs). Grand total: 202 feeds. All is_enabled=false | 3h |

WAVE 14 — Figma Page Rebuilds + Blog + Search + Tier Gating (Session 39)
| # | Task | Scope | Owner Agent | Data Truth | Est |
|---|------|-------|-------------|------------|-----|
| W14-01 | ✅ Figma Make page rebuilds — update HeroMediaRail (image+CTA API), rebuild Home + Intelligence + Professionals + Brands + Events + Jobs with 13 new module components | `src/components/public/HeroMediaRail.tsx`, `src/components/modules/*` (13 files), `src/pages/public/Home.tsx`, `Intelligence.tsx`, `Professionals.tsx`, `ForBrands.tsx`, `Events.tsx`, `Jobs.tsx` | Web Agent | DEMO — modules use mock data with DEMO badges; wired to useIntelligence/usePlatformStats where live data exists | 12h |
| W14-02 | ✅ Blog/editorial CRUD admin — stories migration + admin UI (create/edit story: title/slug/excerpt/body/hero, attach to signals/tags) | `supabase/migrations/20260306700001_create_stories_table.sql`, `src/pages/admin/AdminBlogHub.tsx`, `App.tsx` route `/admin/blog` | Admin Control Center + Backend Agent | LIVE — stories table + RLS (admin write, public read) | 8h |
| W14-03 | Intelligence search UI — unified query box, server-side search, results tabs (signals + stories) | `src/pages/public/Intelligence.tsx` (search section), `src/components/intelligence/SearchBar.tsx` (new) | Web Agent | LIVE — queries market_signals + stories tables | 6h |
| W14-04 | Tier gating — free vs pro filter depth (public: curated top signals; free portal: limited query/time; pro: full search + history) | `src/lib/intelligence/useIntelligence.ts` (tier param), entitlement checks | Web Agent | LIVE — tier logic gates query depth per SOCELLE_ENTITLEMENTS_PACKAGING.md | 4h |
| W14-05 | Blog SEO — sitemap entries for blog routes + Article/NewsArticle schema markup + canonicals | `supabase/functions/sitemap-generator/index.ts` (update), `src/pages/public/` (schema tags) | SEO Agent | LIVE — sitemap reads stories table, schema markup on article pages | 3h |

WAVE 15 — Feeds + Media Merchandising Sprint (Session 40)
| # | Task | Scope | Owner Agent | Data Truth | Est |
|---|------|-------|-------------|------------|-----|
| ✅ W15-01 | Feed Registry Audit — inventory 202 feeds, Phase 1 activation set (25), signal_type map, blocked feeds, infrastructure gaps | `SOCELLE-WEB/docs/FEED_REGISTRY_AUDIT.md` | Backend Agent | Audit only — no code changes | 2h |
| ✅ W15-02 | Feed Orchestrator upgrade — feed_run_log migration, add source_feed_id + is_duplicate to market_signals, category→signal_type mapping, run logging | `supabase/migrations/20260306800001_create_feed_run_log.sql`, `20260306800002_add_feed_columns_to_market_signals.sql`, `supabase/functions/feed-orchestrator/index.ts` | Backend Agent | LIVE — feed_run_log + enhanced market_signals + category-aware signal_type | 6h |
| ✅ W15-03 | /admin/feeds Control Center — Test Feed button, bulk enable/disable, search/filter/sort, signal_type+tier columns, expandable run history from feed_run_log, corrected 14-category enum | `src/pages/admin/AdminFeedsHub.tsx` (rewrite) | Admin Control Center | LIVE — reads/writes data_feeds + feed_run_log | 6h |
| ✅ W15-04 | useIntelligence() V3 — provenance columns (source_url, source_name, source_feed_id, confidence_score, tier_visibility, image_url, is_duplicate) + tier gating (TIER_ACCESS map) + useSignalModules hook (KPIStrip, SignalTable, NewsTicker, SpotlightPanel data shapes) + expanded SignalType union (11 feed-derived types) + TierVisibility type | `src/lib/intelligence/useIntelligence.ts` (update), `src/lib/intelligence/types.ts` (update), `src/lib/intelligence/useSignalModules.ts` (new) | Web Agent | LIVE — modules wired to market_signals with tier_visibility gating | 8h |
| ✅ W15-05 | Editorial architecture — source_type/reading_time/featured migration on stories, useStories+useStoryDetail hooks, StoriesIndex+StoryDetail public pages (/stories, /stories/:slug), editorial injection into Intelligence page via EditorialScroll (live from stories table, hardcoded fallback) | `supabase/migrations/20260306800003_add_source_type_to_stories.sql` (new), `src/lib/editorial/useStories.ts` (new), `src/pages/public/StoriesIndex.tsx` (new), `src/pages/public/StoryDetail.tsx` (new), `src/pages/public/Intelligence.tsx` (update), `src/App.tsx` (update) | Backend + Web Agent | LIVE — stories table with RLS (public reads published only) | 6h |
| ✅ W15-06 | SEO + Schema + Sitemaps — sitemap-generator ?type=stories handler (LIVE from stories table), /stories in STATIC_ROUTES, sitemap.xml index updated, Article JSON-LD on StoryDetail, CollectionPage JSON-LD on StoriesIndex | `supabase/functions/sitemap-generator/index.ts` (update), `public/sitemap.xml` (update), `src/pages/public/StoryDetail.tsx` (update), `src/pages/public/StoriesIndex.tsx` (update) | SEO Agent | LIVE — sitemap reads stories table | 3h |
| ✅ W15-07 | Media Placement Map — full audit of all image/video surfaces across public pages + components. 6 owner videos (3 used, 3 available), 21 unique Unsplash photos (~60 refs across 6 pages), 7 DB-driven image columns (all LIVE), 0 Figma placeholders, 1 issue (SocialProof avatars missing from public/). Output: `MEDIA_PLACEMENT_MAP.md` with placement inventory, source verification, gating rules, recommended storage structure | `docs/MEDIA_PLACEMENT_MAP.md` (new) | Web Agent | Audit only — no code changes | 2h |
| ✅ W15-08 | Analytics Instrumentation — 8 funnel events (feed_activated, signal_created, signal_viewed, signal_searched, signal_clicked, signal_saved, story_clicked, story_viewed). Provider-agnostic tracking layer via `funnelEvents.ts` (console in dev, CustomEvent dispatch for GA4/Segment/PostHog). Wired into Intelligence (signal_viewed on load, signal_clicked on table row), StoriesIndex (story_clicked on card/featured), StoryDetail (story_viewed on load). SignalTable gets onClickRow callback prop. No PII — IDs, categories, counts only. | `src/lib/analytics/funnelEvents.ts` (new), `src/pages/public/Intelligence.tsx` (update), `src/pages/public/StoriesIndex.tsx` (update), `src/pages/public/StoryDetail.tsx` (update), `src/components/modules/SignalTable.tsx` (update) | Web Agent | LIVE — event firing verified (tsc 0, build 3.69s) | 3h |

🔵 Quality + Optimization
| # | Task | Scope | Owner Agent | Data Truth | Est |
|---|------|-------|-------------|------------|-----|
| W12-13 | WCAG accessibility audit — public pages (axe-core / Lighthouse ≥ 90) | All `pages/public/*.tsx` | Web Agent | N/A | 8h |
| W12-14 | WebM video conversion (6 videos, 30-40% size reduction) | `public/videos/` or asset pipeline | Web Agent | N/A | 2h |

⚪ Revenue + Deployment Prerequisites
| # | Task | Scope | Owner Agent | Data Truth | Est |
|---|------|-------|-------------|------------|-----|
| W12-15 | Stripe checkout live wire (test mode → production) | `create-checkout` edge fn, Cart.tsx, Checkout.tsx | Backend Agent | LIVE — Stripe test mode | 8h |
| W12-16 | Missing Edge Functions deployment (rss-ingestion, open-beauty-facts-sync, npi-lookup, intelligence-briefing, jobs-search) | `supabase/functions/` | Backend Agent | LIVE — each deployed and invocable | 16h | ✅ |
| W12-17 | Mobile ↔ Web data parity audit | `SOCELLE-MOBILE-main/` — 21 feature dirs | Mobile Agent | Audit report | 8h |
| W12-18 | pro-* token removal — portal pages audit | All `pages/business/`, `pages/brand/`, `pages/admin/` | Web Agent | `grep pro-` returns 0 on public-facing surfaces | 4h |
| ✅ W12-19 | Launch Live Data Sweep — hardcoded claim remediation (Doc Gate FAIL 4 cleanup) | See full scope below | Web Agent | No new data wiring — remove/label only | 4h |
| ✅ W12-20 | RSS → market_signals promotion pipeline | `supabase/functions/rss-to-signals/` (new), `supabase/migrations/20260306500001_add_provenance_columns_to_market_signals.sql` (new) | Backend Agent | `market_signals` grows on each run; provenance columns (source_type, external_id, data_source, confidence_score) + dedup index added; signal_type heuristic: brand_adoption if brand_mentions>0 && ingredient_mentions===0, else ingredient_momentum; Doc Gate PASS 2026-03-06 | 8h |
| ✅ W12-21 | Wire rss_items to Insights page (live RSS news feed) | `src/pages/public/Insights.tsx`, new hook `useRssItems.ts` | Web Agent | Replaces `TREND_PLACEHOLDERS` constant with live `rss_items` query; zero hardcoded strings; empty-state if DB empty | 4h |
| ✅ W12-22 | Wire ingredients table to public Ingredient Directory | New page or section in `Education.tsx` or new `src/pages/public/Ingredients.tsx` | Web Agent | Read-only directory of INCI names from `public.ingredients`; empty-state if DB empty; no hardcodes | 6h |
| W12-DESIGN-CUTOVER | Clean sweep old design logic → adopt Clean Room UI system as primary | See W12-DESIGN-CUTOVER SCOPE below | Design Parity Agent + Web Agent | N/A — CSS/token work only, no data surfaces | 12h |
| W12-DESIGN-CUTOVER-SHARED | Fix Inter font stragglers in shared components | `src/components/analytics/SparklineChart.tsx`, `src/components/BrandPageRenderer.tsx` | Web Agent | `rg 'fontFamily.*Inter' src/components/` → 0 matches (or documented exemptions); tsc + build pass | 1h |
| W12-DESIGN-CUTOVER-PORTAL-OPERATOR | Design token cutover — Business Portal | `src/pages/business/` (22 files), `src/layouts/BusinessLayout.tsx` | Web Agent | Owner must confirm Option A/B/C (see scope) before GO; tsc + build pass | 8h |
| W12-DESIGN-CUTOVER-PORTAL-BRAND | Design token cutover — Brand Portal | `src/pages/brand/` (26 files), `src/layouts/BrandLayout.tsx` | Web Agent | Owner must confirm Option A/B/C (see scope) before GO; tsc + build pass | 8h |
| W12-DESIGN-CUTOVER-PORTAL-ADMIN | Design token cutover — Admin Portal | `src/pages/admin/` (37 files), `src/layouts/AdminLayout.tsx` | Web Agent | Owner must confirm Option A/B/C (see scope) before GO; tsc + build pass | 6h |
| W12-DESIGN-CUTOVER-MOBILE | Flutter theme token parity with Pearl Mineral V2 + SCL | `SOCELLE-MOBILE-main/apps/mobile/lib/theme/socelle_theme.dart` | Mobile Agent | Color tokens match #141418/#F6F3EF/#6E879B; flutter analyze → 0 errors; flutter build pass | 4h |

W12-DESIGN-CUTOVER SCOPE (DO NOT IMPLEMENT UNTIL GO:W12-DESIGN-CUTOVER):

Authority: SOCELLE_CANONICAL_DOCTRINE.md §3 (color locks) + §4 (typography locks)
Agents: Design Parity Agent (audit + validation) + Web Agent (implementation)
Conflict Report: docs/design_parity_conflict_report.md (2026-03-06)

OBJECTIVE:
  Sweep all banned/drifted design logic from SOCELLE-WEB and replace with the Pearl Mineral V2
  token set as primary. The Clean Room UI System (--scl-* namespace) is the staging layer.
  Fonts and colors have already been corrected in index.css base layer (Session 30).
  This WO covers the remaining sweep of public pages that still reference banned tokens,
  legacy vars, or warm-cocoa/inter/serif design artifacts.

PHASE 1 — Base layer corrections (COMPLETE as of Session 30):
  ✅ index.css: --color-bg → #F6F3EF (was #F6F4F1)
  ✅ index.css: --color-text-primary → #141418 (was #1E252B)
  ✅ index.css: --font-sans → 'General Sans' (was 'Inter')
  ✅ index.css: --font-mono → 'JetBrains Mono' added
  ✅ index.css: body color → #141418 (was var(--color-primary-cocoa) = #47201c)
  ✅ index.css: h1/h2/h3 → font-sans, weight 300 (was font-serif)
  ✅ index.css: mobile nav bg → #F6F3EF (was #F6F4F1)
  ✅ index.css: --scl-* token block + component classes appended (additive, no collision)
  ✅ Google Fonts import (DM Serif Display, Playfair Display, Inter) removed from index.css

PHASE 2 — Public page sweep (authorized under this WO):
  Target: ALL files in src/pages/public/ — grep for the following banned patterns:

  BANNED PATTERNS TO REMOVE/REPLACE:
  · font-serif (Tailwind class) — replace with font-sans
  · var(--color-primary-cocoa) — replace with #141418 or text-graphite
  · var(--bg-page-main) — replace with bg-mn-bg or #F6F3EF
  · var(--bg-page-near-white) — replace with bg-mn-surface or #FAF9F7
  · pro-* tokens (any class prefixed pro-) — document and remove
  · text-[#1E252B] inline colors on public pages — replace with text-graphite
  · text-[#F6F4F1] background colors — replace with #F6F3EF

  FILES TO AUDIT (public pages only — 23 total):
  · src/pages/public/Home.tsx (font-serif confirmed on lines 142, 185, 278, 328 — must fix)
  · src/pages/public/ForBrands.tsx
  · src/pages/public/ForBuyers.tsx
  · src/pages/public/Intelligence.tsx
  · src/pages/public/Brands.tsx
  · src/pages/public/Education.tsx
  · src/pages/public/Events.tsx
  · src/pages/public/Jobs.tsx
  · src/pages/public/Plans.tsx
  · src/pages/public/Pricing.tsx
  · src/pages/public/Protocols.tsx
  · src/pages/public/BrandStorefront.tsx
  · src/pages/public/Insights.tsx
  · src/pages/public/RequestAccess.tsx
  · src/pages/public/ForgotPassword.tsx (W10-01 — pro-* tokens)
  · src/pages/public/ResetPassword.tsx (W10-01 — pro-* tokens)
  · Remaining public pages as found in grep scan

  PORTAL/BRAND/ADMIN PAGES — OUT OF SCOPE:
  · pro-* tokens in portal/brand/admin pages are permitted (portal design system)
  · font-serif in portal/brand pages permitted for portal design system
  · DO NOT touch /portal/*, /brand/*, /admin/* under this WO

PHASE 3 — Validation (required before marking COMPLETE):
  [ ] grep -r "font-serif" src/pages/public/ → zero matches
  [ ] grep -r "color-primary-cocoa" src/pages/public/ → zero matches
  [ ] grep -r "bg-page-main\|bg-page-near-white" src/pages/public/ → zero matches
  [ ] grep -r "pro-" src/pages/public/ → zero matches
  [ ] npx tsc --noEmit → zero errors
  [ ] npm run build → success
  [ ] graphite token = #141418 on all public text (spot check Home, Intelligence, Brands)
  [ ] background = #F6F3EF on all public pages (spot check Home, Brands, Education)
  [ ] No new font-serif introduced in any public surface

PROOF ARTIFACTS REQUIRED:
  · grep output showing zero banned patterns in src/pages/public/ (paste in completion note)
  · npx tsc --noEmit output: zero errors
  · List of files modified with brief description of change per file

EXCLUDED FROM THIS WO:
  · Portal/brand/admin CSS (separate design system — do not touch)
  · tailwind.config.js changes — EXTEND ONLY, no modifications to locked tokens
  · Adding new --scl-* component classes (additive CSS already staged)
  · Any data wiring, Supabase queries, or live/demo label changes
  · SOCELLE_CANONICAL_DOCTRINE.md modifications (require owner approval per CLAUDE.md §H)

COMPLETION STATUS: ✅ Complete (2026-03-06)

PROOF:
  grep font-serif src/pages/public/          → 0 matches ✅
  grep color-primary-cocoa src/pages/public/ → 0 matches ✅
  grep bg-page-main src/pages/public/        → 0 matches ✅
  grep bg-page-near-white src/pages/public/  → 0 matches ✅
  grep "pro-[a-z]" src/pages/public/         → 0 matches ✅
  npx tsc --noEmit                            → 0 errors ✅

FILES MODIFIED:
  src/pages/public/Home.tsx — 31 banned token references replaced:
    · font-serif (4×) → font-sans
    · var(--color-primary-cocoa) (21×) → #141418
    · var(--bg-page-main) (4×) → #F6F3EF
    · var(--bg-page-near-white) (1×) → #F9F7F4
  src/index.css — Phase 1 base layer corrections (Session 30, complete)
  docs/build_tracker.md — WO scope + proof block written

---

W12-DESIGN-CUTOVER-SHARED SCOPE (DO NOT IMPLEMENT UNTIL GO:W12-DESIGN-CUTOVER-SHARED):

Authority: SOCELLE_CANONICAL_DOCTRINE.md §4 (typography locks)
Agent: Web Agent
Risk: LOW — 2 files, 4 lines

FILES AUTHORIZED:
  src/components/analytics/SparklineChart.tsx
    · Line 115: fontFamily="Inter, system-ui, sans-serif" → "General Sans, system-ui, sans-serif"
    · Line 132: fontFamily="Inter, system-ui, sans-serif" → "General Sans, system-ui, sans-serif"

  src/components/BrandPageRenderer.tsx
    · Lines 511–512: OWNER DECISION REQUIRED before executing
      Option A: Replace 'Inter, system-ui, sans-serif' → 'General Sans, system-ui, sans-serif' for 'modern' + 'clinical' brand page themes
      Option B: Grant portal-scoped exemption — document in completion note, do not change code
    · Owner must specify A or B at GO time

EXCLUDED: All other files in src/components/ — no blanket sweep authorized

ACCEPTANCE CRITERIA:
  [ ] rg 'fontFamily.*Inter' src/components/ → 0 matches (or documented exemptions for Option B)
  [ ] npx tsc --noEmit → 0 errors
  [ ] npm run build → success

COMPLETION STATUS: ✅ Complete (2026-03-06)

PROOF:
  rg 'fontFamily.*Inter' src/components/ → 0 matches ✅
    (SparklineChart.tsx lines 115+132 fixed; BrandPageRenderer.tsx Option B exemption — portal-scoped inline styles, consistent with Option C portal decision)
  npx tsc --noEmit → 0 errors ✅
  npm run build    → success ✅

FILES MODIFIED:
  src/components/analytics/SparklineChart.tsx — lines 115, 132: fontFamily Inter → General Sans (SVG text attributes)
  src/components/BrandPageRenderer.tsx — NO CHANGE (Option B exemption, portal-scoped inline styles)

---

W12-DESIGN-CUTOVER-PORTAL-OPERATOR SCOPE (DO NOT IMPLEMENT UNTIL GO:W12-DESIGN-CUTOVER-PORTAL-OPERATOR):

Authority: SOCELLE_CANONICAL_DOCTRINE.md §3+§4 + /.claude/CLAUDE.md §C
Agent: Web Agent
Risk: HIGH — 22 protected routes

⚠️ OWNER DECISION REQUIRED BEFORE GO:
  Option A: Replace pro-* tokens with --scl-* Clean Room tokens throughout
  Option B: Replace pro-* tokens with Pearl Mineral V2 mn-* tokens only (no SCL in portals)
  Option C: Exempt portals — leave pro-* as intentional portal design system (no changes)
  Owner must specify A, B, or C explicitly before agent proceeds.

FILES AUTHORIZED (if Option A or B selected):
  src/pages/business/ — all 22 files
  src/layouts/BusinessLayout.tsx

NEVER MODIFY (regardless of option):
  src/lib/useCart.ts
  src/components/CartDrawer.tsx (or equivalent)
  src/lib/auth.tsx
  src/components/ProtectedRoute.tsx
  Any file touching /portal/orders or /portal/checkout

ACCEPTANCE CRITERIA:
  [ ] Owner has specified Option A, B, or C in GO command
  [ ] grep pro- src/pages/business/ → 0 matches (Options A/B) OR exemption documented (Option C)
  [ ] npx tsc --noEmit → 0 errors
  [ ] npm run build → success
  [ ] No commerce/auth files touched (git diff proof)

COMPLETION STATUS: ✅ Option C selected (2026-03-06) — portals retain pro-* design system. No code changes required. Re-evaluate after W10-05/06/07 + W12-01/02/03 complete.

---

W12-DESIGN-CUTOVER-PORTAL-BRAND SCOPE (DO NOT IMPLEMENT UNTIL GO:W12-DESIGN-CUTOVER-PORTAL-BRAND):

Authority: SOCELLE_CANONICAL_DOCTRINE.md §3+§4 + /.claude/CLAUDE.md §C
Agent: Web Agent
Risk: HIGH — 26 protected routes

⚠️ OWNER DECISION REQUIRED BEFORE GO (same Option A/B/C as PORTAL-OPERATOR):
  Must be specified explicitly at GO time.

FILES AUTHORIZED (if Option A or B selected):
  src/pages/brand/ — all 26 files
  src/layouts/BrandLayout.tsx

NEVER MODIFY:
  src/lib/useCart.ts
  src/lib/auth.tsx
  src/components/ProtectedRoute.tsx
  Any file touching /brand/orders, /brand/products checkout flow

ACCEPTANCE CRITERIA:
  [ ] Owner has specified Option A, B, or C in GO command
  [ ] grep pro- src/pages/brand/ → 0 matches (Options A/B) OR exemption documented (Option C)
  [ ] npx tsc --noEmit → 0 errors
  [ ] npm run build → success
  [ ] No commerce/auth files touched (git diff proof)

COMPLETION STATUS: ✅ Option C selected (2026-03-06) — portals retain pro-* design system. No code changes required. Re-evaluate after W10-05/06/07 + W12-01/02/03 complete.

---

W12-DESIGN-CUTOVER-PORTAL-ADMIN SCOPE (DO NOT IMPLEMENT UNTIL GO:W12-DESIGN-CUTOVER-PORTAL-ADMIN):

Authority: SOCELLE_CANONICAL_DOCTRINE.md §3+§4 + /.claude/CLAUDE.md §C (ADD ONLY policy)
Agent: Web Agent
Risk: MEDIUM — 37 admin routes, internal-facing only

⚠️ OWNER DECISION REQUIRED BEFORE GO (same Option A/B/C):
  Admin portal is internal — lower public risk, but ADD ONLY policy means token replacements
  technically require explicit WO. Option C (no change) is low-cost default.

FILES AUTHORIZED (if Option A or B selected):
  src/pages/admin/ — all 37 files
  src/layouts/AdminLayout.tsx

NEVER MODIFY:
  src/lib/auth.tsx
  src/components/ProtectedRoute.tsx

ACCEPTANCE CRITERIA:
  [ ] Owner has specified Option A, B, or C in GO command
  [ ] grep pro- src/pages/admin/ → 0 matches (Options A/B) OR exemption documented (Option C)
  [ ] npx tsc --noEmit → 0 errors
  [ ] npm run build → success

COMPLETION STATUS: ✅ Option C selected (2026-03-06) — portals retain pro-* design system. No code changes required. Re-evaluate after W10-05/06/07 + W12-01/02/03 complete.

---

W12-DESIGN-CUTOVER-MOBILE SCOPE (DO NOT IMPLEMENT UNTIL GO:W12-DESIGN-CUTOVER-MOBILE):

Authority: SOCELLE_CANONICAL_DOCTRINE.md §3+§4 + SOCELLE_FIGMA_TO_CODE_HANDOFF.md (token parity)
Agent: MOBILE AGENT ONLY — Web Agent may NOT execute this WO (cross-boundary rule: /.claude/CLAUDE.md §C)
Risk: MEDIUM — Flutter theme, separate codebase

FILES AUTHORIZED:
  SOCELLE-MOBILE-main/apps/mobile/lib/theme/socelle_theme.dart
  Any Flutter color/typography token files in SOCELLE-MOBILE-main/apps/mobile/lib/theme/

TOKEN PARITY TARGETS (Pearl Mineral V2):
  Primary text:  #141418 (graphite)
  Background:    #F6F3EF (mn.bg)
  Accent:        #6E879B (mineral slate)
  Surface:       #EFEBE6
  Dark panel:    #1F2428

FONT PARITY TARGETS:
  Primary: General Sans (or closest Flutter-available equivalent)
  Mono:    JetBrains Mono

ACCEPTANCE CRITERIA:
  [ ] flutter analyze → 0 errors
  [ ] flutter build → success
  [ ] Color token values match Pearl Mineral V2 locked hex values (spot-check primary/bg/accent)
  [ ] No web-only files touched (SOCELLE-WEB/ must be untouched)

COMPLETION STATUS: ⬜ Not Started

---

W12-20 SCOPE (DO NOT IMPLEMENT UNTIL GO:W12-20):
  - Create a new Edge Function (or extend ingest-rss) that promotes qualifying rss_items rows into market_signals.
  - Rules:
    · No scoring hardcodes. Confidence score must be derived from existing rss_items.confidence_score (≥0.50 threshold suggested).
    · signal_type = 'industry_news' (new type, or map to nearest existing type).
    · All required provenance fields (source_id, attribution_text, confidence_score) must propagate from rss_items.
    · No duplicate signals: upsert on (source_type, external_id) or equivalent dedup key.
    · market_signals.data_source must reference rss_items.id (linkable provenance).
  - Trigger: can be added as a final step in ingest-rss or as a separate scheduled function.
  - Owner decision required before GO:W12-20: confirm market_signals schema supports rss-derived rows
    (check existing columns: signal_type enum, data_source, external_id, confidence_score).
  - NOT to be confused with W10-08/W10-09 which only write to rss_items/ingredients.

W12-19 SCOPE (DO NOT EXPAND — remediation only, no feature work, no new data wiring):

Files and exact changes authorized under W12-19:

PART A — Add amber "Demo Data" badge to portal/brand pages with no badge (items 10–13):
  A1. pages/business/BenchmarkDashboard.tsx — add amber "Demo Data" badge to page header
  A2. pages/business/IntelligenceHub.tsx — add amber "Demo Data" badge to each tab header
  A3. pages/brand/BrandIntelligenceHub.tsx — add amber "Demo Data" badge to page header
  A4. pages/brand/IntelligenceReport.tsx — add amber "Demo Data" badge to page/report header

PART B — Remove fake-live numeric claims from public/portal surfaces (items 2, 3, 7, 8, 9):
  B1. pages/public/Brands.tsx line 495 — remove keyStat prop (the "Added by X spas this quarter" string)
      ONLY: set keyStat={undefined} or remove the conditional — do not alter anything else in BrandCard call
  B2. pages/public/Protocols.tsx line 288 — remove adoptionCount count display entirely
      Acceptable: replace with empty string or omit the span; do not add computed data
  B3. pages/business/AIAdvisor.tsx lines 248–260 — remove "Recent Signals" sidebar section entirely
      Remove the <div> block that maps RECENT_SIGNALS. Keep RECENT_SIGNALS const in place (no deletion rule).
  B4. pages/business/LocationsDashboard.tsx — add prominent amber "Demo Data" badge to page header
  B5. pages/business/CECredits.tsx — add amber "Demo Data" badge to page header

PART C — Remove/qualify Plans.tsx and ForBrands.tsx unverified copy claims (items 4, 5, 6):
  C1. pages/public/Plans.tsx FAQ #3 answer — remove Stripe Connect sentence.
      Rewrite: "Commission payouts to brand partners are processed on a scheduled basis. Payment processing infrastructure is in active development."
  C2. pages/public/Plans.tsx FAQ #6 answer — remove bank-level encryption sentence tied to Stripe.
      Rewrite: "We accept all major credit cards. All transactions are processed through PCI-compliant payment infrastructure."
  C3. pages/public/ForBrands.tsx — qualify "92/8 commission. No listing fees. No monthly charges." copy.
      Rewrite: "92/8 commission model planned. No listing fees. No monthly charges."
      (OR remove the specific ratio if not contractually confirmed — owner to decide at GO time)

PART D — Home.tsx design token revert (owner-confirmed 2026-03-06):
  D1. pages/public/Home.tsx — replace font-serif with font-sans on all 4 heading lines (142, 185, 278, 328)
      Replace all var(--color-primary-cocoa) and var(--bg-page-main) / var(--bg-page-near-white) tokens
      with Pearl Mineral V2 equivalents: text-graphite, bg-mn-bg, bg-mn-surface, text-[rgba(30,37,43,0.62)]
      Update HARD_CODED_SURFACES.md §2 to reflect this as the active fix (previously incorrectly marked ✅)
      Owner decision: Pearl Mineral V2 (not Warm Cocoa) is the approved public page design system

EXCLUDED FROM W12-19 (require separate WOs):
  - ProtocolDetail.tsx adoptionCount live wiring → W10-12
  - BrandStorefront.tsx ADOPTION_MAP/PEER_DATA_MAP live wiring → W12-04
  - IntelligenceHub portal live wiring → W12-05 / W11-04
  - BenchmarkDashboard live wiring → W12-06 / W11-03
  - Brand Intelligence live wiring → W12-07 / W11-05
  - AIAdvisor live signal wiring → separate WO TBD
  - Home.tsx design token fix → separate WO TBD (pending owner decision)

Wave 12 Total: 22 WOs, ~134h estimated

---

LAUNCH LIVE DATA SWEEP — 2026-03-06 (Session 29)
Status: ⛔ CANNOT GO LIVE — 13 hardcoded data violations + 1 design token violation
Authority: HARD_CODED_SURFACES.md + GLOBAL_SITE_MAP.md + direct file scan
Method: Direct reads of all flagged files + grep scan for mock imports, numeric literals, fake-live strings, JSON-LD schemas

BLOCKERS BEFORE LAUNCH (owner must issue GO:<WO> or acknowledge each):

P0 — Must fix before any public launch:
1. Home.tsx — font-serif (4 lines: 142, 185, 278, 328) + var(--color-primary-cocoa) tokens on public page
   → Violates CLAUDE.md §LOCKED DESIGN SYSTEM. HARD_CODED_SURFACES.md §2 claims "✅ FIXED" but file contradicts.
   → NO WO — owner must confirm: is Warm Cocoa Redesign intentional override, or was Pearl Mineral V2 reverted?
2. Brands.tsx line 495 — "Added by ${adoptionCount} spas this quarter" — fake present-tense activity claim, no badge
   → NO WO — cannot act. Remove keyStat until live data exists.
3. Protocols.tsx line 288 — adoptionCount from mockProtocols (1247, 892...) rendered without badge
   → NO WO — cannot act. Remove or badge.
4. Plans.tsx FAQ #3 — "Payouts are processed via Stripe Connect when orders ship" — Stripe Connect not integrated
   → NO WO — cannot act. Remove claim.
5. Plans.tsx FAQ #6 — "All transactions are secured with bank-level encryption" — Stripe not live
   → NO WO — cannot act. Remove or qualify.
6. ForBrands.tsx body copy — "92/8 commission. No listing fees." in non-badged CTA text
   → NO WO — cannot act. Add disclaimer or verify accuracy.
7. AIAdvisor.tsx RECENT_SIGNALS sidebar — "LED therapy demand up 47% in your region" hardcoded, no badge
   → NO WO — cannot act. Remove sidebar block.

P1 — Must badge or hide before launch (existing WOs exist but not yet executed):
8. BenchmarkDashboard.tsx — All mock scores (compositeScore:68, peerGroupSize:142, peerMedian:$28,500) — NO badge
   → W11-03 (not yet executed). Add Demo badge to page header immediately.
9. LocationsDashboard.tsx — All mock data, dollar/% figures — NO badge, comment says "no Supabase mutations"
   → NO WO. Add Demo badge or remove from nav.
10. CECredits.tsx — Mock progress/earned credits — NO badge
    → NO WO. Add Demo badge.
11. IntelligenceHub.tsx (portal) — businessIntelligence.ts "V1: Static mock data" — NO badge
    → W11-04 (not yet executed). Add Demo badge.
12. BrandIntelligenceHub.tsx — mockEnrichment data — NO badge
    → W11-05 (not yet executed). Add Demo badge.
13. IntelligenceReport.tsx — mockTierData — NO badge
    → W11-05 (not yet executed). Add Demo badge.

P2 — Low risk, address when WO assigned:
14. ProtocolDetail.tsx lines 181+360 — adoptionCount from mockProtocols, (est.) label only
    → W10-12 (not yet executed). Add Demo badge or remove.
15. enrichmentService.ts — rating:4.6, reviewCount:187 stub — confirm never exposed without label

CONFIRMED CLEAN (Doc Gate PASS):
- JSON-LD schemas: JobPosting datePosted computed from live created_at ✅
- JSON-LD schemas: Plans FAQPage, Home Organization/SoftwareApplication — no hardcoded numerics ✅
- Events.tsx JSON-LD CollectionPage — no numeric claims ✅
- Marketing site intelligence/page.tsx — no hardcoded stats ✅
- All labeled DEMO surfaces have amber badges (ForBrands STATS, Professionals STATS, Plans TIERS, Home signals) ✅
- BrandStorefront PeerAdoptionBanner + AlsoBought — amber "Preview" badges ✅

---

PHASE 1 STATUS — MIGRATIONS (15 total — ALL COMPLETE ✅)
All Phase 1 migrations applied. See MASTER_STATUS.md for full Supabase state.
Total migrations as of Wave 9: 70

PHASE 1 STATUS — FEATURES
Commerce (Core Critical Path)
| Feature | Status | Notes |
|---------|--------|-------|
| Brand storefront pages | ✅ Complete | Public /brands/:slug live |
| Product catalog management | ✅ Complete | |
| Multi-brand cart (localStorage) | 🔄 Partial | Cart exists, checkout not wired (payments postponed) |
| Checkout (Stripe) | ⬜ Postponed | Payment bypass active |
| Brand payouts (Stripe Connect) | ⬜ Postponed | |

Accounts & Onboarding
| Feature | Status | Notes |
|---------|--------|-------|
| Brand onboarding (direct apply) | ✅ Complete | /brand/apply + wizard |
| Brand onboarding (claim flow) | ✅ Complete | /claim/brand/:slug |
| Business/reseller onboarding | ✅ Complete | /portal/signup |
| Business claim flow | ✅ Complete | /claim/business/:slug |

Intelligence (NEW — Wave 9)
| Feature | Status | Notes |
|---------|--------|-------|
| market_signals table + seed | ✅ Complete | 10 seed signals |
| useIntelligence.ts V2 | ✅ Complete | Supabase fetch + mock fallback |
| Intelligence.tsx PREVIEW mode | ✅ Complete | isLive flag drives banner |
| AdminMarketSignals.tsx | ✅ Complete | /admin/market-signals |
| Events page | ✅ Stub | Mock data — needs Supabase events table |
| Jobs page | ✅ Stub | Mock data — needs job_postings live |

Messaging
| Feature | Status | Notes |
|---------|--------|-------|
| Conversations + messages model | ✅ Complete | |
| Inbox UI (business + brand) | ✅ Complete | |
| Order-linked messages | ✅ Complete | |
| Broadcast messages | ⬜ Not Started | Phase 3 |

PHASE 2 STATUS — NOT STARTED
| # | Migration | Status |
|---|-----------|--------|
| 01 | 20260301000001 — create spa_menu_items | ⬜ Not Started |
| 02 | 20260301000002 — create reseller_saved_protocols | ⬜ Not Started |
| 03 | 20260301000003 — create reseller_inventory | ⬜ Not Started |
| 04 | 20260301000004 — create brand_rep_assignments | ⬜ Not Started |

PHASE 2 FEATURES — NOT STARTED
- Course builder, Education library, Certification system (Education module)
- Socelle Academy v1
- Live training scheduler (Zoom integration)

PHASE 3–7 STATUS — NOT STARTED
- Phase 3: Marketing Studio + Payments + Beauty Intelligence
- Phase 4: Community + Social Proof
- Phase 5: Analytics + Reporting
- Phase 6: Mobile Native
- Phase 7: International

---

BUILT — PRE-WAVE HERITAGE FEATURES (still live in codebase)
| Feature | Route | Status | Note |
|---------|-------|--------|------|
| Brand portal — Performance analytics | /brand/performance | ✅ Functional | Real Supabase queries |
| Brand portal — Customers (retailer CRM) | /brand/customers | ✅ Functional | |
| Edge — AI Orchestrator (4-tier) | supabase/functions/ai-orchestrator | ✅ Deployed | OpenRouter: Claude Sonnet/Gemini 2.5 Pro/GPT-4o-mini/Llama 3.3 Groq |
| Edge — AI Concierge | supabase/functions/ai-concierge | ✅ Deployed | Delegates to orchestrator |
| Edge — Credit banking | migrations/20260228000001 | ✅ Applied | tenant_balances, deduct_credits(), top_up_credits() |
| Edge — Stripe webhook | supabase/functions/stripe-webhook | ✅ Deployed | Wired but Stripe not yet active |
| Edge — send-email (Resend) | supabase/functions/send-email | ✅ Deployed | new_order + order_status types live |

---

LIVE BUGS TRACKER
| ID | Bug | Status | Priority |
|----|-----|--------|----------|
| BUG-B01 | plans.business_id queried but may not exist | ✅ Fixed | — |
| BUG-B02 | plans.fit_score queried but may not exist | ✅ Fixed | — |
| BUG-M01 | Brand inbox on legacy brand_messages | ✅ Fixed | — |
| BUG-W9-01 | ForgotPassword/ResetPassword still use pro-* tokens | ✅ Fixed (W10-01) | — |
| BUG-W9-02 | Home market pulse numbers hardcoded, no DEMO label | ✅ Fixed (W10-02) | — |
| BUG-W9-03 | BrandStorefront adoption % hardcoded, no PREVIEW label | ✅ Fixed (W10-03) | — |

---

EXTERNAL SETUP REQUIRED (Owner: Human)
| Item | Needed For | WO | Status |
|------|-----------|-----|--------|
| Stripe account + API keys | Checkout | W12-15 (⛔ FROZEN) | ⬜ Postponed |
| Stripe Connect setup | Brand payouts | NO WO | ⬜ Postponed |
| Brevo account + API key | Marketing broadcasts (Phase 3) | NO WO | ⬜ Not Started |
| Supabase project (Web) | Everything | — | ✅ rumdmulxzmjtsplsjngi |
| Resend API key | Transactional email | — | ✅ Wired in send-email fn |
| Google Places API key | Operator enrichment, places table | W11-07 | ⬜ Not Started |
| Yelp API key | Operator enrichment, Yelp enrichment | W11-07 | ⬜ Not Started |
| Reddit API credentials (client_id + secret) | ingest-reddit | NO WO — cannot act | ❌ Blocked — needs decision |
| JSearch API key (RapidAPI) | ingest-jobs-external | NO WO — cannot act | ❌ Blocked — needs decision |
| Adzuna API key | ingest-jobs-external | NO WO — cannot act | ❌ Blocked — needs decision |
| openFDA API key (optional) | ingest-openfda; higher rate limits only | W11-06 | ⬜ Optional — open API usable without key |
| pg_cron extension | Scheduling ingest-rss (every 5 min) | W10-08 | ⬜ Check: Dashboard → Database → Extensions → pg_cron. If unavailable (Free plan), use Supabase Scheduled Functions instead (all plans). |
| Groupon Partner Program approval + API key | ingest-groupon-appointments (service_price_floor signal) | NO WO — cannot act | ❌ Blocked — needs Groupon Partner Program application |
| YouTube Data API key + quota allocation | ingest-youtube-trends (social_signals) | NO WO — cannot act | ❌ Blocked — needs Google Cloud project + quota allocation |
| Mindbody Developer Account + API key | Booking platform API (operator sync) | NO WO — cannot act | ⚠️ NEEDS COUNSEL — apply at developers.mindbodyonline.com; legal review of non-sublicensable clause required before use |
| Vagaro API approval | Booking platform API (operator sync) | NO WO — cannot act | ⚠️ NEEDS COUNSEL — apply via vagaro.com Settings → Developers; no API-specific ToS found; formal agreement required |
| Boulevard Developer Portal API key | Booking platform API (operator sync) | NO WO — cannot act | ⚠️ NEEDS COUNSEL — register at developers.joinblvd.com; SDK is MIT; API-level ToS confirmation needed |
| Square Developer Account + Application ID + Application Secret | Booking platform API (operator portal) — square-oauth-callback + square-appointments-sync | W11-13 | ⛔ BLOCKED — W11-13 not owner-approved; plaintext token storage unresolved. Do not provision until GO:W11-13 issued and token remediation complete. Permission verdict: SAFE (developer.squareup.com ToS confirmed). Setup ready to proceed once governance + security blocks are lifted. |
| Acuity Scheduling API key | Booking platform API (operator sync) | NO WO — cannot act | ⚠️ NEEDS COUNSEL — developers.acuityscheduling.com; Squarespace Developer Terms apply; data aggregation use needs review |
| Phorest API credentials (manual grant) | Booking platform API (operator sync) | NO WO — cannot act | ⚠️ NEEDS COUNSEL — email developer@phorest.com; explicit integration approval required; no self-serve |
| Zenoti API key (enterprise agreement) | Booking platform API (operator sync) | NO WO — cannot act | ⚠️ NEEDS COUNSEL — docs.zenoti.com; enterprise contract required; contact Zenoti sales |

---

DECISIONS LOG
| Date | Decision | Why |
|------|----------|-----|
| 2026-02-24 | Replaced brand_messages with conversations + messages system | Old threading model too limited |
| 2026-02-28 | Payment bypass (Autonomous Core Intelligence) activated | Focus Master Brain + Identity Bridge; payments postponed |
| 2026-02-28 | Platform deep dives adopted as reference specs | Secure product + design direction in master build |
| 2026-02-28 | Master Brain mandatory for all AI and mobile UX | All AI via ai-orchestrator; atomic credits; WCAG 2.2 AA |
| 2026-03-05 | Pearl Mineral V2 design system adopted for all public pages | Intelligence-first thesis; pro-* tokens banned on public pages |
| 2026-03-05 | Intelligence-first product thesis | Platform is intelligence first, marketplace second |
| 2026-03-06 | Wave 12 WOs added from Build Gap Discovery | 18 new WOs derived from cross-referencing 9 canonical docs — fills DEMO→LIVE, SEO, infrastructure gaps |
| 2026-03-06 | Wave 11 transferred to build_tracker from MASTER_STATUS | Execution authority requires all WOs in build_tracker.md per CLAUDE.md §D |
| 2026-03-05 | MASTER_STATUS.md created as live audit document | build_tracker was stale; needed authoritative current-state sweep |
| 2026-03-05 | market_signals table + AdminMarketSignals UI created | False live claims on Intelligence Hub needed real data infrastructure |

---

AGENT COORDINATION RULES
1. Read CLAUDE.md (root) FIRST before any work — non-negotiable rules, token spec, protected routes
2. Read MASTER_STATUS.md before starting any feature — it has the live sweep of every page
3. Run `npx tsc --noEmit` AND `npm run build` before marking any work complete
4. Portal routes (/portal/*, /brand/*, /admin/*) — DO NOT MODIFY without explicit WO scope
5. Supabase migrations — ADD ONLY, never modify existing
6. Commerce flow (cart, checkout, orders) — NEVER MODIFY
7. Auth system (ProtectedRoute, AuthProvider) — NEVER MODIFY
8. No pro-* tokens on public pages (src/pages/public/)
9. No font-serif on public pages
10. Intelligence leads, marketplace follows — visible in every output
11. Update this file at the end of every session

---

DAILY STANDUP FORMAT
Paste this as your FIRST message in every Claude Code session:
---DAILY STANDUP---
Date:
Session Goal:
Current Wave/Phase:
Last Session Summary:
Time Available:
Blocker?:
---END STANDUP---

STATUS KEY
⬜ Not Started
🔄 In Progress
✅ Complete
❌ Blocked — needs decision
⚠️ Complete but needs attention
🔁 Needs revision

WEEKLY REVIEW PROMPT
Paste this every Friday:
Weekly review time. Do the following:
1. Read /docs/build_tracker.md
2. Read CLAUDE.md (root) and MASTER_STATUS.md (root)
3. Read /docs/SOCELLE_MASTER_PROMPT_FINAL.md Sections 12 and 22
4. If Education, UI/UX, messaging, or Phase 3 intelligence work was done: confirm alignment with /docs/platform/ deep dives
5. Check all file changes from this week (git log --since="7 days ago")
6. Produce a weekly summary: phases progressed, migrations completed, features shipped, bugs fixed, blockers, next 5 tasks
7. Update this file with current status
8. Are we on track? If not, what should we cut or descope?

MILESTONE TRACKER
| Milestone | Target Phase | Status |
|-----------|-------------|--------|
| All Phase 1 migrations (15) | Phase 1 | ✅ |
| P0 bugs fixed (plans.business_id, plans.fit_score) | Phase 1 | ✅ |
| Brand storefront pages live | Phase 1 | ✅ |
| Pearl Mineral V2 on all public pages | Wave 9 | ✅ |
| font-serif violations eliminated | Wave 9 | ✅ |
| MainNav 8 required links | Wave 9 | ✅ |
| RequestAccess form wired to Supabase | Wave 9 | ✅ |
| market_signals table + seed | Wave 9 | ✅ |
| Events page (stub) | Wave 9 | ✅ |
| Jobs page (stub) | Wave 9 | ✅ |
| ForgotPassword/ResetPassword token fix | Wave 10 | ✅ (W10-01) |
| Home DEMO labels applied | Wave 10 | ✅ (W10-02) |
| BrandStorefront PREVIEW labels | Wave 10 | ✅ (W10-03) |
| Insights orphan resolved | Wave 10 | ✅ (W10-04) |
| Events table (live Supabase) | Wave 10 | ✅ (W10-05) |
| Jobs table (live Supabase) | Wave 10 | ✅ (W10-06) |
| Home market pulse live wire | Wave 10 | ✅ (W10-07) |
| RSS ingestion pipeline | Wave 10 | ✅ Done (W10-08, 2026-03-06) |
| Wave 11 — External APIs + enrichment (12 WOs) | Wave 11 | ⬜ |
| Wave 12 — DEMO→LIVE + SEO + infrastructure (18 WOs) | Wave 12 | ⬜ |
| Multi-brand checkout (Stripe) | Phase 3 | ⬜ Postponed |
| Brand payouts (Stripe Connect) | Phase 3 | ⬜ Postponed |
| Education Hub v1 | Phase 2 | ⬜ |
| Mobile native app | Phase 6 | ⬜ |

---

API / INGESTION COVERAGE CHECKLIST
Source: SOCELLE_API_ROUTE_SPEC.md (reference only; authority remains /.claude/CLAUDE.md + /docs/command/* + build_tracker.md)
Added: 2026-03-06 (Session 28)

Rule: Every ingestion function and serving endpoint must map to an existing WO ID or "NO WO — cannot act." No code may be written for any "NO WO" item until owner creates a WO in this file (CLAUDE.md §D).

INGESTION FUNCTIONS (spec §7 — ingest-* Edge Functions)
| Function | WO | Owner Agent | Status |
|---|---|---|---|
| ingest-rss | W10-08 | Editorial/News Agent + Backend Agent | ✅ Done (2026-03-06) |
| ingest-open-beauty-facts | W10-09 | Backend Agent | ✅ Done (2026-03-06) |
| ingest-npi | W10-10 | Backend Agent | ✅ Done (2026-03-06) |
| ingest-openfda | W11-06 | Backend Agent | ⬜ Not Started |
| ingest-google-trends | W11-01 | Backend Agent | ⬜ Not Started |
| ingest-google-places | W11-07 | Backend Agent | ⬜ Not Started |
| ingest-pubmed | NO WO — cannot act | — | ❌ Blocked — needs decision |
| ingest-clinical-trials | NO WO — cannot act | — | ❌ Blocked — needs decision |
| ingest-patents | NO WO — cannot act | — | ❌ Blocked — needs decision |
| ingest-bls | NO WO — cannot act | — | ❌ Blocked — needs decision |
| ingest-census | NO WO — cannot act | — | ❌ Blocked — needs decision |
| ingest-jobs-external | NO WO — cannot act | — | ❌ Blocked — needs decision |
| ingest-reddit | NO WO — cannot act | — | ❌ Blocked — needs decision |
| ingest-cosing | NO WO — cannot act | — | ❌ Blocked — needs decision |
| refresh-materialized-views | NO WO — cannot act | — | ❌ Blocked — needs decision |

GEMINI-CONFIRMED HIGH-VALUE ADDITIONS (Session 29 — 2026-03-06)
Source: Gemini research + SOCELLE_API_ROUTE_SPEC.md. Authority remains CLAUDE.md + /docs/command/* + build_tracker.md.
Rule: All items below are NO WO — cannot act. No code may be written until owner creates a WO in this file (CLAUDE.md §D).
Note: "UK Product Safety Database" references in any prior doc that require login are invalid — replace with EU Safety Gate (RAPEX) below.

| Priority | Function | Maps To | WO | External Setup Required | Status |
|---|---|---|---|---|---|
| P0 | ingest-cscp | safety_events (type: cscp_report) | NO WO — cannot act | resource-id lookup on data.ca.gov Socrata dataset (no key required) | ❌ Blocked — needs decision |
| P0 | ingest-gudid-devices | NEW table: devices (or existing if schema has one); filter FDA product codes GEX, ONG, OSH; include ISA only if confirmed relevant | NO WO — cannot act | none — official FDA AccessGUDID API, no key required | ❌ Blocked — needs decision |
| P0 | ingest-eu-safety | safety_events (type: eu_rapex_alert) | NO WO — cannot act | none — Safety Gate public export; prefer official export workflow; avoid brittle scraping | ❌ Blocked — needs decision |
| P1 | ingest-uspto-daily | NEW table: trademarks; filter Class 003 (cosmetics) + Class 044 (beauty/medical services) | NO WO — cannot act | storage for daily TDXF zip + XML parser | ❌ Blocked — needs decision |
| P1 | ingest-groupon-appointments | market_stats (metric: service_price_floor) and/or provider_pricing table if it exists; pricing-floor signal only — keep inside Intelligence/Market surfaces, not commerce | NO WO — cannot act | Groupon Partner Program approval + API key (see EXTERNAL SETUP REQUIRED) | ❌ Blocked — needs decision |
| P1 | ingest-youtube-trends | social_signals (platform: youtube) | NO WO — cannot act | YouTube Data API key + quota monitoring (see EXTERNAL SETUP REQUIRED) | ❌ Blocked — needs decision |

BOOKING / APPOINTMENT PLATFORM API AUDIT (Session 29 — 2026-03-06)
Commissioned by: Command Center | Executed by: Backend Agent | Reviewed by: Doc Gate QA
Scope: Official/legally-usable booking APIs (salon/spa). Evidence-based only: LICENSE + official developer terms links.
No scraping, no private endpoints, no ToS guessing. Verdict key: SAFE = usable now with documented terms. NEEDS COUNSEL = has official API but requires legal review before production use. DO NOT USE = no public API, or ToS prohibits third-party use.
IMPORTANT: All items below are NO WO — cannot act. No integration code may be written until WO is created AND verdict is SAFE or NEEDS COUNSEL with explicit owner sign-off.

Use-case note: These are OPERATOR-AUTHORIZED read APIs (business owner grants OAuth/key to SOCELLE to read their own data). NOT market-wide scraping. Use for: operator portal sync, real booking data for intelligence surfaces, service pricing signals when operator consents.

| Verdict | Platform | Access Model | Key Required | Regions | Official Terms Evidence | WO | Status |
|---|---|---|---|---|---|---|---|
| NEEDS COUNSEL | Mindbody | API key + OAuth; registration + Mindbody approval required; production requires sign-off | Yes | US, CA, UK, AU, NZ, HK | API ToS: developers.mindbodyonline.com/Resources/DeveloperAgreement (updated 2023-09-30). License is revocable, non-sublicensable, non-transferable. 1,000 calls/day free then $0.003/call. Concern: non-sublicensable clause may block SOCELLE from surfacing aggregated data. Needs legal review. | NO WO — cannot act | ❌ Blocked — needs legal review + owner decision |
| NEEDS COUNSEL | Vagaro | Application form → 5-day review → API key; webhooks for appointments/customers/transactions | Yes | US, CA, UK, AU | API docs: docs.vagaro.com. No dedicated API developer agreement found — only general Customer Participation Agreement (vagaro.com/participationagreement). No API-specific ToS published. Cannot confirm permitted use without formal developer agreement. | NO WO — cannot act | ❌ Blocked — no API-specific ToS found; needs formal agreement |
| NEEDS COUNSEL | Boulevard | API key from developer portal + sandbox; MIT-licensed book-sdk on GitHub | Yes | US (luxury salon/spa/medspa) | SDK MIT license: github.com/Boulevard/book-sdk. Developer portal: developers.joinblvd.com. API-level ToS not publicly fetched — portal requires sign-in. SDK is MIT (safe for use), but API usage terms need confirmation. Enterprise support tier required for full access. | NO WO — cannot act | ❌ Blocked — API ToS needs confirmation beyond MIT SDK |
| SAFE (operator-only) | Square Bookings API | OAuth (seller must authorize; requires Appointments Plus or Premium subscription) | No (OAuth) | Global (US, AU, UK, CA, JP) | Developer Terms: squareup.com/us/en/legal/general/developers-annotated (updated 2025-06-30). Commercial use explicitly permitted. Data access scoped to consenting seller account only. Cannot pull market-wide data. Booking API version 2026-01-22. | NO WO — cannot act | ❌ Blocked — no WO; SAFE for operator portal feature only (not market intelligence) |
| NEEDS COUNSEL | Acuity Scheduling (Squarespace) | API key (Basic Auth) or OAuth2 for multi-account; SDKs: acuity-js, acuity-php | Yes | Global | Developer Terms: developers.acuityscheduling.com/docs/developer-terms-of-use (Squarespace Developer Terms). Commercial use allowed via Squarespace developer programs. Specific restrictions on data aggregation not confirmed — needs review. | NO WO — cannot act | ❌ Blocked — needs ToS review for aggregated intelligence use |
| NEEDS COUNSEL | Phorest | Email request to support@phorest.com with Phorest account; credentials granted by Phorest manually | Yes | UK, IE, US | Docs: developer.phorest.com. Terms: phorest.com/gb/termsandconditions. COPYRIGHT NOTICE: "not authorized to integrate or use the Software with any other software, plug-in or enhancement without Phorest's approval." Third-party integration explicitly requires Phorest approval. No webhooks (polling only). | NO WO — cannot act | ❌ Blocked — integration requires explicit Phorest approval; needs formal agreement |
| NEEDS COUNSEL | Zenoti | API key from Zenoti backend app; tokens valid 24h; refresh tokens available | Yes | US, Global (enterprise) | Docs: docs.zenoti.com. Terms: zenoti.com/en-uk/trust/terms-and-conditions. Enterprise-focused; full terms require direct Zenoti contact. API access scope governed by Services Terms + Network Agreement. | NO WO — cannot act | ❌ Blocked — enterprise agreement required; needs owner contact with Zenoti |
| DO NOT USE | Fresha | No public third-party API | N/A | Global (EU-heavy) | No official developer API program found. Partner Terms (terms.fresha.com/partner-terms) are for venue businesses, not third-party developers. Third-party Fresha scrapers exist on Apify — these are NOT official and violate ToS. | NO WO — cannot act | ⛔ DO NOT USE — no official API; scraping is ToS violation |
| DO NOT USE | Booksy | No public third-party API | N/A | Global | No official developer API or developer portal found. Search returned BookingSync (unrelated product). No developer program confirmed. | NO WO — cannot act | ⛔ DO NOT USE — no official API found |
| DO NOT USE | Mangomint | No public API; webhooks are for business owners only ($50/mo add-on); "custom APIs" undocumented Unlimited plan only | N/A | US | Webhooks: mangomint.com/learn/webhooks-integration/. Custom API mentioned at $375/mo plan with no public documentation. No developer program. | NO WO — cannot act | ⛔ DO NOT USE — no public API; custom API is enterprise-undocumented |
| NEEDS COUNSEL | Timely | OAuth-based REST API; developer portal live at api.gettimely.com | Yes | AU, NZ, UK, Global | Developer portal confirmed reachable (200). OAuth-based access. No official GitHub SDK found. API-specific ToS and data aggregation restrictions not publicly confirmed — full terms require sign-in. Needs attorney review before integration. | NO WO — cannot act | ❌ Blocked — ToS not confirmed; needs legal review |
| NEEDS COUNSEL | Booker | Partner API via Mindbody (Booker acquired 2018); same partner gate as Mindbody | Yes | US | Booker acquired by Mindbody 2018. API access routed through Mindbody Wellness Partner Program (developers.mindbodyonline.com). Same non-sublicensable, revocable license concern as Mindbody applies. No independent Booker developer agreement exists. | NO WO — cannot act | ❌ Blocked — same gate as Mindbody; partner program approval + legal review required |
| SAFE (operator-only) | Calendly | OAuth2 (user must authorize); REST API; no official GitHub SDK | No (OAuth) | Global | Developer portal: developer.calendly.com (200 confirmed). Public REST API with OAuth2. Well-documented rate limits and scopes. Data access scoped to consenting account only. No data redistribution clause found. Note: scheduling/availability sync only — limited direct salon booking data value. | NO WO — cannot act | ❌ Blocked — no WO; SAFE for operator scheduling sync; confirm salon-intelligence use case before WO |
| DO NOT USE | StyleSeat | Consumer marketplace; no public third-party developer API | N/A | US | GitHub org `styleseat` exists (62 public repos) — no public booking or data API found in any repo. StyleSeat is a consumer-facing marketplace. No developer program, no API docs, no partner portal confirmed. | NO WO — cannot act | ⛔ DO NOT USE — consumer marketplace; no public API |
| DO NOT USE | GlossGenius | Private SaaS; no public API | N/A | US | GitHub org `glossgenius` exists (7 public repos) — no public API repo. Closed salon management SaaS. No developer program, partner portal, or public API documentation found. | NO WO — cannot act | ⛔ DO NOT USE — private SaaS; no public API |
| DO NOT USE | Treatwell | Consumer marketplace; no public developer API | N/A | UK, EU | No official developer portal found. No GitHub SDK. Consumer-facing beauty booking marketplace (EU-focused). No third-party developer program confirmed. Scraping would violate ToS. | NO WO — cannot act | ⛔ DO NOT USE — consumer marketplace; no official API or developer program |

GITHUB AUDIT SUPPLEMENT (Session 30 — 2026-03-06)
Added 6 platforms (Timely, Booker, Calendly, StyleSeat, GlossGenius, Treatwell) to complete the 15-platform Command Center dispatch.
Session 30 global audit adds 3 categories below (aggregators, brands/catalog, resort/hospitality).
Existing entry updates: Boulevard — second MIT repo create-booking-flow confirmed (github.com/Boulevard/create-booking-flow, MIT, 2025-10-06). Fresha — partners.fresha.com live (200); api-tools MIT repo is internal tooling only. Mindbody — Conduit repo Apache-2.0 (2026-02-20) is integration middleware, not a public booking API.

---

BOOKING / APPOINTMENT — GLOBAL API AUDIT (SUPPLEMENT: NEW PLATFORMS) (Session 30 — 2026-03-06)
Authority: CLAUDE.md §D + SOCELLE_DATA_PROVENANCE_POLICY.md. All items NO WO — cannot act.

| Verdict | Platform | Access Model | Key Required | Regions | Official Terms Evidence | WO | Status |
|---|---|---|---|---|---|---|---|
| PARTNER-GATED | Reserve with Google | Google Reserve Partner program; no public API for third-party data aggregation | N/A | Global | reserve.google.com requires approved booking partner status. No self-serve API. Booking flows surface in Google Search/Maps for approved partners only. Developer docs for booking data aggregation: not available. | NO WO — cannot act | ❌ Blocked — partner enrollment required; no aggregate data path |
| SAFE ONLY WITH BUSINESS AUTH | SimplyBook.me | REST API + webhooks; API key per business account | Yes | Global | Developer portal: simplybook.me/api (200 confirmed). ToS: simplybook.me/en/terms/. API key from business dashboard. Webhook support for appointment events. | NO WO — cannot act | ❌ Blocked — no WO; SAFE for operator sync with business authorization |
| SAFE ONLY WITH BUSINESS AUTH | Pike13 | OAuth 2.0 per-client; REST API | No (OAuth) | US | Developer portal: developer.pike13.com (200 confirmed). OAuth 2.0 per client account. Wellness/fitness studio focus. | NO WO — cannot act | ❌ Blocked — no WO; SAFE for operator sync with client authorization |
| SAFE ONLY WITH BUSINESS AUTH | Wix Bookings API | OAuth per Wix site; REST API | No (OAuth) | Global | Developer portal: dev.wix.com/docs/rest/business-solutions/bookings (200 confirmed). Developer Agreement: support.wix.com/en/article/wix-developer-center-terms-of-use. OAuth per Wix site. | NO WO — cannot act | ❌ Blocked — no WO; SAFE for operators on Wix platform; limited spa-specific value |
| DO NOT USE | Setmore | No public developer portal | N/A | Global | developer.setmore.com returns 404. No API documentation. No GitHub org. | NO WO — cannot act | ⛔ DO NOT USE — no public API or developer portal |
| DO NOT USE | HoneyBook | No developer portal; out of scope | N/A | US | Portal not reachable. Serves freelancers/photographers/event planners — not salons or spas. Out of scope for SOCELLE. | NO WO — cannot act | ⛔ DO NOT USE — out of scope; no public API |
| DO NOT USE | ClassPass | Consumer marketplace; no public API | N/A | Global | developer.classpass.com returns 403/000. Consumer-facing marketplace. No third-party developer API or partner data program found. | NO WO — cannot act | ⛔ DO NOT USE — consumer marketplace; no public API |
| NEEDS COUNSEL | Schedulicity | Developer portal WAF-blocked; access model unknown | Unknown | US, CA | schedulicity.com/developers blocked by WAF (503/403). No public API docs accessible. Business development contact required. | NO WO — cannot act | ❌ Blocked — portal WAF-blocked; direct BD contact required |

---

BRANDS / CATALOG / PRO ORDERING — GLOBAL API AUDIT (Session 30 — 2026-03-06)
Authority: CLAUDE.md §D + SOCELLE_DATA_PROVENANCE_POLICY.md. All items NO WO — cannot act.
Critical finding: Zero of 17 pro skincare/device brands have a public self-serve developer API. All brand product/protocol/pricing data requires formal brand partnership agreements — not API calls.

B1 — E-COMMERCE PLATFORMS
| Vendor | Official API? | Docs URL | Access Model | SDK + License | ToS URL | Key Restrictions | Allowed Data Scope | Classification | External Setup | WO |
|---|---|---|---|---|---|---|---|---|---|---|
| Shopify (Storefront + Admin) | Y | shopify.dev/docs/api | OAuth per merchant install | github.com/Shopify/shopify-api-js (MIT); storefront-api-learning-kit (MIT) | shopify.com/legal/api-terms | No AI/ML training on API data without written consent; non-sublicensable; REST Admin deprecated Apr 2025 — GraphQL required | Products, pricing, catalog, collections, locations — per merchant only; no cross-merchant aggregation | SAFE ONLY WITH BUSINESS AUTH | Shopify Partner account + OAuth per merchant | NO WO — cannot act |
| BigCommerce (REST + GraphQL) | Y | developer.bigcommerce.com | OAuth per merchant install | github.com/bigcommerce/bigcommerce-api-python (MIT) | bigcommerce.co.uk/terms/api-terms/ | No redistribution/republication; cannot build competing platform | Products, pricing, catalog, orders — per merchant only | SAFE ONLY WITH BUSINESS AUTH | BigCommerce Partner Portal + OAuth per merchant | NO WO — cannot act |
| WooCommerce REST API | Y | woocommerce.github.io/woocommerce-rest-api-docs | API key per merchant (Basic Auth or OAuth 1.0a) | github.com/woocommerce/woocommerce (GPL-2.0); rest-api-js-lib (MIT) | No central SaaS ToS — each merchant governs (open source) | GPL-2.0 copyleft on server-side derivatives; no central data redistribution clause | Full store data with per-merchant key | SAFE ONLY WITH BUSINESS AUTH | API key from each merchant WooCommerce admin — no central enrollment | NO WO — cannot act |
| Lightspeed Commerce | Y | developers.lightspeedhq.com | OAuth per merchant | No official OSI SDK (community SDKs only — unvetted) | developers.lightspeedhq.com/terms | Non-sublicensable, non-transferable, revocable; cannot build competing platform | Products, inventory, orders, locations — per merchant only | SAFE ONLY WITH BUSINESS AUTH | Lightspeed developer account + OAuth per merchant | NO WO — cannot act |
| Magento / Adobe Commerce | Y | developer.adobe.com/commerce/webapi/rest | Merchant-provisioned token or OAuth | github.com/magento/magento2 (OSL 3.0 + AFL 3.0) | adobe.com/legal/terms/enterprise-licensing/all-product-terms.html | OSL 3.0 copyleft on server-side modifications distributed to others; CLA required for contributions | Full catalog, orders, customers — merchant-provisioned credentials | SAFE ONLY WITH BUSINESS AUTH | API credentials from each merchant Commerce admin — no central enrollment | NO WO — cannot act |
| Salesforce Commerce Cloud | Y | developer.salesforce.com/docs/commerce/commerce-api | OAuth per licensed merchant instance | github.com/SalesforceCommerceCloud/commerce-sdk (MIT) | salesforce.com/company/legal/program-agreement/ | AppExchange Partner Program enrollment required for commercial apps; direct Salesforce competitors explicitly banned | Products, pricing, catalog — per licensed merchant instance only | PARTNER-GATED | AppExchange Partner Program enrollment; salesforce.com/partners | NO WO — cannot act |

B2 — PRO SKINCARE / DEVICE BRANDS (all 17 confirmed DO NOT USE except L'Oréal/SkinCeuticals)
| Brand | Official API? | Evidence | Classification | WO |
|---|---|---|---|---|
| Naturopathica | N | No developer portal. No GitHub org. Manual B2B ordering only. | DO NOT USE | NO WO — cannot act |
| Dermalogica | N | pro.dermalogica.com + prodashboard.dermalogica.com live — login-gated portals, not APIs. No developer docs. | DO NOT USE | NO WO — cannot act |
| SkinCeuticals (L'Oréal) | Partial | api.loreal.com confirmed live — L'Oréal internal API platform (Apigee). Access requires direct contact with L'Oréal API owners; no self-serve enrollment. No SkinCeuticals-specific API found. | PARTNER-GATED | NO WO — cannot act |
| PCA Skin | N | No developer portal. No GitHub org. Login-gated professional portal only. | DO NOT USE | NO WO — cannot act |
| SkinMedica (Allergan/AbbVie) | N | Brilliant Connections = managed storefront. Allē loyalty = closed system (Twilio). No public API. | DO NOT USE | NO WO — cannot act |
| Obagi Medical | N | obagi-professional.com live — authenticated ordering portal, not an API. No developer API found. | DO NOT USE | NO WO — cannot act |
| iS Clinical | N | No developer portal. No GitHub org. Distributor-based ordering only. | DO NOT USE | NO WO — cannot act |
| Eminence Organic Skin Care | N | No developer portal. No GitHub org. Spa professional distribution only. | DO NOT USE | NO WO — cannot act |
| Circadia | N | No developer portal. No GitHub org. Licensed provider distribution only. | DO NOT USE | NO WO — cannot act |
| Image Skincare | N | No developer portal. No GitHub org. 30,000+ pro network managed through human channels. | DO NOT USE | NO WO — cannot act |
| Biologique Recherche | N | No developer portal. No GitHub org. Exclusive clinic/spa distribution; no public API. | DO NOT USE | NO WO — cannot act |
| Hydrafacial | N | No developer portal. Device software (Syndeo/BeautyStat) proprietary. No public API found. | DO NOT USE | NO WO — cannot act |
| Candela Medical | N | No developer portal. No GitHub org. Medical device — formal OEM/partner agreement required. | DO NOT USE | NO WO — cannot act |
| Lumenis | N | partnerzone.lumenis.com live — content/education partner portal (downloads), NOT an API. No device API found. | DO NOT USE | NO WO — cannot act |
| Allergan Aesthetics | N | allerganadvantage.com + allerganmedicalinstitute.com live — all login-gated. Allē = closed loyalty. No public API. | DO NOT USE | NO WO — cannot act |
| Galderma | N | galdermahcp.com + gainconnect.com live — login-gated. galderma.com/partnering = BD inquiry page. No public API. | DO NOT USE | NO WO — cannot act |
| Merz Aesthetics | N | portal.merzusa.com live — authenticated ordering web app. xperiencemerz.com = closed rewards. No public API. | DO NOT USE | NO WO — cannot act |

---

RESORT / HOSPITALITY — GLOBAL API AUDIT (Session 30 — 2026-03-06)
Authority: CLAUDE.md §D + SOCELLE_DATA_PROVENANCE_POLICY.md. All items NO WO — cannot act.
Critical finding: No platform offers open no-auth aggregate data. Every platform requires property authorization + signed partner/integration agreement. Data scope: aggregate-only; no PII.

C1 — HOSPITALITY PMS SYSTEMS
| Vendor | Official API? | Docs URL | Access Model | SDK + License | ToS URL | Key Restrictions | Allowed Data Scope | Classification | External Setup | WO |
|---|---|---|---|---|---|---|---|---|---|---|
| Oracle OPERA Cloud (OHIP) | Y | oracle.com/hospitality/integration-platform/ | OHIP account + property authorization; certified integration partner for production | github.com/oracle/hospitality-api-docs (UPL — specs/docs only; runtime governed by Oracle licensing) | Runtime terms via Oracle licensing agreement (no public standalone URL) | UPL covers spec docs only; runtime requires Oracle licensing; certified partner required for production; NDA likely | Spa/activity availability, amenity booking, room availability — property-scoped; no PII | PARTNER-GATED | Oracle OHIP partner enrollment: oracle.com/hospitality/integration-platform/ | NO WO — cannot act |
| Mews Systems | Y | docs.mews.com | OAuth + API key per property | github.com/MewsSystems (MIT SDKs confirmed) | mews.com/en/terms-conditions/partners | Property must authorize; cross-property aggregation terms — confirm with Mews Partner T&C | Property operations data — property-scoped; no cross-property aggregation confirmed | SAFE ONLY WITH BUSINESS AUTH | Mews developer account + API key per property at docs.mews.com | NO WO — cannot act |
| Cloudbeds | Y | developers.cloudbeds.com | API key per property (self-service) or OAuth (partner path; 60-min cert call required) | No official GitHub SDK | cloudbeds.com/terms/api/ | Self-service key from property dashboard; partner tier cert call required; ToS at cloudbeds.com/terms/api/ | Reservations, room types, amenities — property-scoped | SAFE ONLY WITH BUSINESS AUTH | Cloudbeds developer account + API key per property at developers.cloudbeds.com | NO WO — cannot act |
| SiteMinder | Y | developer.siteminder.com/siteminder-apis | Partner application required before any API access | No official GitHub SDK | siteminder.com/integrations/apply-now/ | Formal partner application and integration agreement required before access | Channel availability, rate data — property-scoped | PARTNER-GATED | SiteMinder partner application: siteminder.com/integrations/apply-now/ | NO WO — cannot act |
| Sabre SynXis | Y | developer.synxis.com | NDA required before any access; formal certification process | No official GitHub SDK | developer.synxis.com/apis/soap_apis/hotel/certification | NDA required before API access; enterprise-only; SOAP + REST | Reservation, availability, rate — property-scoped | PARTNER-GATED | Sabre partnership + NDA + SynXis certification at developer.synxis.com | NO WO — cannot act |
| Amadeus Hospitality | Y (enterprise only) | developer.amadeus-hospitality.com/products | Formal commercial agreement required; self-service tier confirmed shutting down 2025 (PhocusWire) | github.com/amadeus4dev (MIT — travel APIs only; hospitality modules not in public repos) | No public hospitality API ToS; requires commercial engagement | Self-service tier discontinued — do not build; enterprise commercial agreement required | GDS availability, rates — property-scoped; enterprise only | PARTNER-GATED | Direct Amadeus commercial engagement required | NO WO — cannot act |
| Agilysys | Y | agys-dev.developer.azure-api.net | Solution Partner enrollment required | No official GitHub SDK | agilysys.com/en/solution-partners/ | Solution Partner program required; formal integration agreement | PMS data, spa/activity booking, dining — property-scoped | PARTNER-GATED | Agilysys Solution Partner enrollment: agilysys.com/en/solution-partners/ | NO WO — cannot act |
| Maestro PMS | Y (open API claimed) | maestropms.com/interfaces-open-apis-integration-pms-partners.html | Direct engagement with Maestro required; terms not publicly documented | No official GitHub SDK | No public ToS URL found | Open API referenced on website but access process and full terms not publicly documented | PMS data — property-scoped | NEEDS COUNSEL | Direct contact: maestropms.com | NO WO — cannot act |

C2 — SPA SYSTEMS IN RESORTS
| Vendor | Official API? | Docs URL | Access Model | SDK + License | ToS URL | Key Restrictions | Allowed Data Scope | Classification | External Setup | WO |
|---|---|---|---|---|---|---|---|---|---|---|
| Book4Time | Y (partner) | book4time.com/software-integrations/ | Integration partner program required | No public GitHub SDK | No public ToS URL | Partner integration page confirmed live; specific API terms not publicly available | Spa appointments, service menus, availability — property-scoped | PARTNER-GATED | Book4Time integration partner program: book4time.com/software-integrations/ | NO WO — cannot act |
| SpaSoft (Springer-Miller) | N | springermiller.com/partners/ | No public API found | N/A | None found | Partners page live; no API documentation or developer portal found | N/A | DO NOT USE | Direct inquiry to Springer-Miller required | NO WO — cannot act |
| ResortSuite (Agilysys brand) | Y (via Agilysys) | agys-dev.developer.azure-api.net | Same Agilysys Solution Partner path | No official GitHub SDK | agilysys.com/en/solution-partners/ | Same partner enrollment as Agilysys PMS entry above | Spa, activity, dining — property-scoped | PARTNER-GATED | Agilysys Solution Partner enrollment (same as Agilysys PMS above) | NO WO — cannot act |
| Springer-Miller SMS|Host | N | springermiller.com | No public API | N/A | None found | No API documentation or developer portal found | N/A | DO NOT USE | Direct inquiry to Springer-Miller required | NO WO — cannot act |

C3 — GUEST EXPERIENCE PLATFORMS
| Vendor | Official API? | Docs URL | Access Model | SDK + License | ToS URL | Key Restrictions | Allowed Data Scope | Classification | External Setup | WO |
|---|---|---|---|---|---|---|---|---|---|---|
| INTELITY | Y (confirmed exists) | intelity.com/api/ | Direct engagement required; API page live but docs not public | No public SDK | None found publicly | API page live; 100+ integrations confirmed; no public docs or ToS; no spa-specific module identified | Guest-facing services — property-scoped; no PII | NEEDS COUNSEL | Direct contact: intelity.com/api/ | NO WO — cannot act |
| ALICE / Actabl | Y (confirmed exists) | actabl.com/alice/ | Direct engagement required; no public docs | No public SDK | None found publicly | 270+ integrations confirmed; no public API docs or developer program | Operations data — property-scoped; no PII | NEEDS COUNSEL | Direct contact: actabl.com | NO WO — cannot act |
| Canary Technologies | Y (confirmed exists) | canarytechnologies.com/integrations | Direct engagement required; integrations page live | No public SDK | None found publicly | Integrations page live; no public API docs or developer program found | Guest communication — property-scoped; no PII | NEEDS COUNSEL | Direct contact: canarytechnologies.com | NO WO — cannot act |
| Duve | Y (confirmed exists) | duve.com | Direct engagement required; no public docs | No public SDK | None found publicly | Platform confirmed live; no public developer docs found | Guest communication — property-scoped; no PII | NEEDS COUNSEL | Direct contact: duve.com | NO WO — cannot act |

EXTERNAL SETUP REQUIRED — NEW PLATFORMS (Session 30 — 2026-03-06)
| Platform | Setup Required | Who Initiates | Status |
|---|---|---|---|
| SimplyBook.me | Business account + API key from dashboard | Owner (Bruce) | ⬜ Not started |
| Pike13 | Developer account + OAuth app at developer.pike13.com | Owner (Bruce) | ⬜ Not started |
| Wix Bookings | Wix Partner account + OAuth app at dev.wix.com | Owner (Bruce) | ⬜ Not started |
| Reserve with Google | Google Reserve Partner program (significant barrier — approved booking provider required) | Owner (Bruce) | ⬜ Not started |
| Shopify | Shopify Partner account at partners.shopify.com + OAuth per merchant | Owner (Bruce) | ⬜ Not started |
| BigCommerce | BigCommerce Partner Portal + OAuth per merchant | Owner (Bruce) | ⬜ Not started |
| WooCommerce | API key from each merchant WooCommerce admin (no central enrollment) | Per-merchant | ⬜ Not started |
| Lightspeed Commerce | Developer account at developers.lightspeedhq.com + OAuth per merchant | Owner (Bruce) | ⬜ Not started |
| Magento / Adobe Commerce | API credentials from each merchant Commerce admin (no central enrollment) | Per-merchant | ⬜ Not started |
| Salesforce Commerce Cloud | AppExchange Partner Program at salesforce.com/partners (significant barrier) | Owner (Bruce) | ⬜ Not started |
| L'Oréal / SkinCeuticals | Direct contact with L'Oréal API team via api.loreal.com + attorney review of data licensing | Owner (Bruce) + Counsel | ⬜ Not started |
| Oracle OPERA Cloud (OHIP) | Oracle OHIP partner enrollment at oracle.com/hospitality/integration-platform/ | Owner (Bruce) | ⬜ Not started |
| Mews Systems | Developer account + API key per property at docs.mews.com | Owner (Bruce) | ⬜ Not started |
| Cloudbeds | Developer account + API key per property at developers.cloudbeds.com | Owner (Bruce) | ⬜ Not started |
| SiteMinder | Partner application at siteminder.com/integrations/apply-now/ | Owner (Bruce) | ⬜ Not started |
| Sabre SynXis | Partnership + NDA + SynXis certification at developer.synxis.com | Owner (Bruce) + Legal | ⬜ Not started — NDA required |
| Amadeus Hospitality | Direct commercial engagement with Amadeus Hospitality team | Owner (Bruce) | ⬜ Not started — self-service tier discontinued |
| Agilysys / ResortSuite | Solution Partner enrollment at agilysys.com/en/solution-partners/ | Owner (Bruce) | ⬜ Not started |
| Book4Time | Integration partner program at book4time.com/software-integrations/ | Owner (Bruce) | ⬜ Not started |
| Maestro PMS | Direct contact at maestropms.com | Owner (Bruce) | ⬜ Not started |
| INTELITY | Direct contact at intelity.com/api/ | Owner (Bruce) | ⬜ Not started |
| ALICE / Actabl | Direct contact at actabl.com | Owner (Bruce) | ⬜ Not started |
| Canary Technologies | Direct contact at canarytechnologies.com | Owner (Bruce) | ⬜ Not started |
| Duve | Direct contact at duve.com | Owner (Bruce) | ⬜ Not started |

GLOBAL AUDIT MASTER CLASSIFICATION (Session 30 — 2026-03-06)
Total platforms audited across all categories (booking + brands + hospitality): 56

SAFE TO IMPLEMENT (public, no auth): None.
SAFE ONLY WITH BUSINESS AUTH (11): Square Bookings, Calendly, SimplyBook.me, Pike13, Wix Bookings, Shopify, BigCommerce, WooCommerce, Lightspeed, Magento/Adobe Commerce, Mews, Cloudbeds.
PARTNER-GATED (10): Reserve with Google, Salesforce Commerce Cloud, L'Oréal/SkinCeuticals, Oracle OPERA/OHIP, SiteMinder, Sabre SynXis, Amadeus Hospitality, Agilysys, Book4Time, ResortSuite.
NEEDS COUNSEL (12): Mindbody, Vagaro, Boulevard, Acuity, Phorest, Zenoti, Timely, Booker, Schedulicity, Maestro PMS, INTELITY, ALICE/Actabl, Canary, Duve.
DO NOT USE (23): Fresha, Booksy, Mangomint, StyleSeat, GlossGenius, Treatwell, Setmore, HoneyBook, ClassPass + 16 pro skincare/device brands (Naturopathica, Dermalogica, PCA Skin, SkinMedica, Obagi, iS Clinical, Eminence, Circadia, Image Skincare, Biologique Recherche, Hydrafacial, Candela, Lumenis, Allergan, Galderma, Merz) + SpaSoft + SMS|Host.

---

SERVING FUNCTIONS (spec §7 — frontend-called Edge Functions)
| Function | WO | Owner Agent | Status |
|---|---|---|---|
| intelligence-briefing | W12-16 | Backend Agent | ✅ Complete |
| jobs-search | W12-16 | Backend Agent | ✅ Complete |
| brand-intelligence | NO WO — cannot act | — | ❌ Blocked — needs decision |
| ingredient-profile | NO WO — cannot act | — | ❌ Blocked — needs decision |
| market-snapshot | NO WO — cannot act | — | ❌ Blocked — needs decision |
| treatment-pricing | NO WO — cannot act | — | ❌ Blocked — needs decision |
| provider-search | NO WO — cannot act | — | ❌ Blocked — needs decision |
| jobs-post | NO WO — cannot act | — | ❌ Blocked — needs decision |
| jobs-apply | NO WO — cannot act | — | ❌ Blocked — needs decision |
| jobs-match | NO WO — cannot act | — | ❌ Blocked — needs decision |
| job-demand-signals | NO WO — cannot act | — | ❌ Blocked — needs decision |
| generate-plan | NO WO — cannot act | — | ❌ Blocked — needs decision |
| rss-search | NO WO — cannot act | — | ❌ Blocked — needs decision |
| og-image-proxy | NO WO — cannot act | — | ❌ Blocked — needs decision |
| GET /intelligence/compliance/:brand_slug | NO WO — cannot act | — | ❌ Proposed (Session 29) — merges FDA + CSCP + EU Safety Gate signals; blocked pending ingest-cscp, ingest-gudid-devices, ingest-eu-safety WOs |
| GET /intelligence/devices/:device_id | NO WO — cannot act | — | ❌ Proposed (Session 29) — device specs + safety history; blocked pending ingest-gudid-devices WO |
| GET /market/future-products | NO WO — cannot act | — | ❌ Proposed (Session 29) — trademarks last 30 days, Class 003/044; blocked pending ingest-uspto-daily WO |

---

## WAVE 12 — PUBLIC PAGE REDESIGN (Session 34 — March 2026)

Source: `docs/AUDIT_W12_COMPLETE_REAUDIT.md` + `docs/command/SOCELLE_FIGMA_DESIGN_BRIEF.md`

### WAVE A — STOP THE BLEEDING

| WO | Name | Type | Files | Priority | Status |
|---|---|---|---|---|---|
| W12-28 | Home Warm Cocoa Purge + Button Normalization | Token/CSS | Home.tsx | P0 CRITICAL | ✅ Done — tsc 0 errors, build OK |
| W12-29 | EvidenceStrip CSS Fix | Component fix | EvidenceStrip.tsx | P0 CRITICAL | ✅ Done — overflow-x-auto + snap, tsc 0 errors |

### WAVE B — LIVE DATA

| WO | Name | Type | Files | Priority | Status |
|---|---|---|---|---|---|
| W12-30 | Home Signals Live Wire | Hook wiring | Home.tsx | P0 CRITICAL | ✅ Done — useIntelligence() wired, isLive flag drives PREVIEW banner |
| W12-31 | usePlatformStats() Hook | New hook | src/lib/usePlatformStats.ts | P0 CRITICAL | ✅ Done — brands/signals/operators counts from Supabase, isLive flag |
| W12-32 | Platform Stats Wiring | Page integration | Professionals.tsx, ForBrands.tsx, Jobs.tsx | P0 CRITICAL | ✅ Done — EvidenceStrip items wired to usePlatformStats across 3 pages |

### WAVE C — VISUAL RHYTHM

| WO | Name | Type | Files | Priority | Status |
|---|---|---|---|---|---|
| W12-33 | Brands + Events Video Heroes | Media integration | Brands.tsx, Events.tsx | P1 HIGH | ✅ Done — HeroMediaRail on Brands, inline video on Events |
| W12-34 | useSignalCategories() Hook | New hook | src/lib/intelligence/useSignalCategories.ts, Intelligence.tsx | P1 HIGH | ✅ Done — live counts per signal_type, wired into EvidenceStrip + SplitFeature |
| W12-35 | Jobs Hero Video + Live Count | Page fix | Jobs.tsx | P1 HIGH | ✅ Done — HeroMediaRail + live job_postings count via usePlatformStats |
| W12-36 | Animated Counter Component | New component | src/components/public/AnimatedCounter.tsx | P1 HIGH | ✅ Done — IntersectionObserver + rAF + easeOutCubic, wired into ForMedspas metrics |

### WAVE D — POLISH

| WO | Name | Type | Files | Priority | Status |
|---|---|---|---|---|---|
| W12-37 | Inline Button Normalization | CSS cleanup | 9 public pages (About, FAQ, HowItWorks, ForBrands, Professionals, Intelligence, Protocols, BrandStorefront, Brands, Jobs) | P2 MED | ✅ Done — 14 inline buttons → btn-mineral-* classes, 0 remaining |
| W12-38 | index.css Dead Code Cleanup | CSS cleanup | index.css | P2 MED | ✅ Done — removed dead warm-cocoa refs + unused utility classes |
| W12-39 | Video Poster Frames | Asset pipeline | public/videos/posters/, all pages with video | P2 MED | ✅ Done — 6 poster JPEGs generated via ffmpeg, all 15+ video elements have poster attr |

---

## WAVE OVERHAUL — COORDINATED SITE OVERHAUL (Session 41 — March 2026)

Command Center self-execution order. All WO IDs created by Command Center Agent.
Authority: /.claude/CLAUDE.md + /docs/command/* + this file.
GitHub Repo: https://github.com/BruceTyndall/IntegrategithubrepositoryNewLayou.git
Design System Reference: /design-system (FigmaHandoff.tsx) — Pearl Mineral V2 tokens only.

| WO ID | Title | Scope | Owner | Status | Blocking |
|---|---|---|---|---|---|
| WO-OVERHAUL-01 | Design Parity Enforcement | Full token audit across SOCELLE-WEB and SOCELLE-MOBILE-main. Flag banned tokens by file+line. Enforce Pearl Mineral V2 from /design-system. Proof: token summary + flutter analyze PASS + npx tsc --noEmit PASS. | Command Center → Design Parity Agent | ✅ DONE | Web Agent, Mobile Agent |
| WO-OVERHAUL-02 | Backend Schema Foundation | Create cms_pages, blog_posts, media_library, live_data_feeds, sitemap_entries, api_registry, api_route_map tables. RLS: admin r/w on api_registry (api_key_encrypted never exposed to client), public read on api_route_map non-sensitive fields. Seed api_registry + api_route_map with all installed APIs. Regenerate database.types.ts. ADD ONLY — never edit existing migrations. | Command Center → Backend Agent | ✅ DONE | Admin Control Center Agent, SEO Agent |
| WO-OVERHAUL-03 | Site Rebuild (Pearl Mineral V2) | Full site rebuild using Pearl Mineral V2 tokens from /design-system. No hardcoded hex — CSS vars and Tailwind tokens only. Preserve ALL existing photos/videos. Wire public pages to live Supabase data. LIVE/DEMO label every surface. Register all routes in App.tsx. | Command Center → Web Agent | ✅ DONE | SEO Agent |
| WO-OVERHAUL-04 | Admin CMS + Blog Portal + API Control Center | WordPress-inspired CMS: Page Template Editor, Blog Manager (CRUD + rich block editor), SEO Manager (title/meta/OG/schema/sitemap/robots), Media Library (upload to Supabase storage), Live Data Manager (per-feed refresh + cron), API Control Center (/admin/api-control — registry dashboard, detail/edit, route map, API sitemap at /admin/api-sitemap), Settings panel. All content DB-driven, zero hardcoded copy. | Command Center → Admin Control Center Agent | ✅ DONE | Backend Agent (Phase 2 must complete first) |
| WO-OVERHAUL-05 | SEO Infrastructure | Every public route: canonical URLs, Helmet/meta, schema.org JSON-LD (WebPage, BlogPosting, Organization, JobPosting, Event). /sitemap.xml from sitemap_entries table. robots.txt editable from admin. hreflang + breadcrumb schema on detail pages. All schema uses real DB fields. | Command Center → SEO Agent | ✅ DONE | Web Agent (Phase 3), Backend Agent (Phase 2) |
| WO-OVERHAUL-06 | Live Data Edge Functions + Cron | Build refresh-live-data edge function (fetches sources → writes live_data_feeds). Build test-api-connection edge function (pings API by registry_id → writes last_tested_at + status). pg_cron daily refresh 00:00 UTC. Manual trigger POST /refresh-live-data?feed_key=<key> (admin RLS-gated). | Command Center → Backend Agent | ✅ DONE | Admin Control Center Agent (Phase 4) |
| WO-OVERHAUL-07 | API Registry Sitemap + Route Wiring | Verify api_route_map seed covers every route in SITE_MAP.md. Write validation query for gap analysis. Confirm /admin/api-sitemap renders live data with filters + CSV export. Fill any gap routes. | Command Center → Backend Agent + Web Agent | ✅ DONE | Backend Agent (Phase 6), Web Agent (Phase 3) |
| WO-OVERHAUL-08 | Mobile Design Parity | Audit socelle_theme.dart against web tailwind tokens. Replace drift/banned tokens. flutter analyze: zero errors. | Command Center → Mobile Agent | ✅ DONE | Design Parity Agent (Phase 1) |
| WO-OVERHAUL-09 | Doc Gate QA Final Pass | Full Doc Gate audit: FAIL 1–7 across all modified files. Verify LIVE/DEMO labeling. Verify /sitemap.xml covers SITE_MAP.md. Verify /admin/api-sitemap covers api_route_map. Verify api_key_encrypted never exposed. Verify no PII in analytics. Verify no commerce/auth mods. Verify no outreach logic. Verify RLS on all new tables. | Command Center → Doc Gate QA Agent | 🔄 OPEN | All prior phases incl WO-OVERHAUL-10 |
| WO-OVERHAUL-10 | Full Site Audit + Design Consistency | Audit every route in SITE_MAP.md for existence, design token compliance, nav/footer/component/responsive consistency. Fix all issues. Create missing pages. 100% SITE_MAP.md coverage required. | Command Center → Site Audit Agent | 🔄 OPEN | WO-OVERHAUL-03, WO-OVERHAUL-04 |
| WO-OVERHAUL-11 | Ecommerce Full Build | Full ecommerce backend (12 tables, 4 edge functions) + frontend (catalog, cart, checkout, orders, wishlist, admin shop panel). Ecommerce restrictions LIFTED for this WO only per owner approval. Stripe integration, inventory management, discount codes, reviews. Pearl Mineral V2 tokens only. | Command Center → Backend Agent + Web Agent | 🔄 OPEN | WO-OVERHAUL-02, WO-OVERHAUL-03 |
| WO-OVERHAUL-12 | Ingredient Library — API Discovery + Full Build | Discover all available beauty/cosmetic ingredient APIs. Expand ingredients table schema. Build comprehensive ingredient detail pages, search, filters, safety ratings, cross-references. Admin ingredient management. Full API wiring. | Command Center → Backend Agent + Web Agent | 🔄 OPEN | WO-OVERHAUL-02, WO-OVERHAUL-03 |
| WO-OVERHAUL-13 | eLearning Platform + SCORM + Authoring Tool | Full LMS: 12 tables (courses, modules, lessons, SCORM, enrollments, progress, quizzes, certificates), 4 edge functions (SCORM runtime, SCORM upload, certificate gen, certificate verify), learner experience, course player, SCORM player, quiz engine, authoring tool, admin education panel. | Command Center → Education Studio Agent + Backend Agent | 🔄 OPEN | WO-OVERHAUL-02 |
| WO-OVERHAUL-14 | Sales Platform — Full Standalone App | Sales pipelines, deals, activities, proposals, commissions. Kanban pipeline board, deal detail, proposal builder with e-signature, commission dashboard, admin sales panel. | Command Center → Sales Studio Agent + Backend Agent | 🔄 OPEN | WO-OVERHAUL-02 |
| WO-OVERHAUL-15 | Marketing Platform — Full Standalone App | Campaigns (email/sms/push/social), audience segments, content templates, landing pages, campaign analytics, marketing calendar. ZERO cold email — opt-in only. | Command Center → Marketing Studio Agent + Backend Agent | 🔄 OPEN | WO-OVERHAUL-02 |
| WO-OVERHAUL-16 | B2B Reseller + Brand Portal | Reseller accounts, client management, white-label configuration, custom domains, revenue sharing, brand portal dashboard. Core monetization layer. | Command Center → Backend Agent + Web Agent | 🔄 OPEN | WO-OVERHAUL-02, WO-OVERHAUL-11 |
| WO-OVERHAUL-17 | CRM + Salon/Spa Booking + Client Database + B2B Prospecting | Full CRM: contacts, companies, activities, notes, tags. Salon/spa appointment booking with service catalog, staff scheduling, client history. Client database with treatment records, product preferences, visit history. B2B prospecting pipeline for brand/supplier outreach tracking. | Command Center → CRM Studio Agent + Backend Agent | 🔄 OPEN | WO-OVERHAUL-02, WO-OVERHAUL-14 |
| WO-OVERHAUL-18 | Flutter Mobile App — Full Platform Scale-Down | Port all platform features to Flutter mobile: intelligence feed, shop, education/courses, CRM contacts, booking, client records, sales pipeline, marketing campaigns, ingredient lookup, certificates, push notifications. Riverpod state management, Supabase SDK, Pearl Mineral V2 theme parity. | Command Center → Mobile Agent | 🔄 OPEN | WO-OVERHAUL-08, WO-OVERHAUL-11-17 |
| WO-OVERHAUL-19 | Modular Subscription Architecture — Feature Gating | Subscription plans (free/starter/pro/enterprise), feature flags per plan, paywall gates on web + mobile, Stripe subscription integration, usage metering, plan comparison, upgrade/downgrade flows, admin plan management. Replaces paymentBypass.ts with real entitlement system. | Command Center → Backend Agent + Web Agent + Mobile Agent | 🔄 OPEN | WO-OVERHAUL-02, WO-OVERHAUL-11 |
| WO-OVERHAUL-20 | Full Code Audit — Security, Quality, Subscription Integrity | Comprehensive audit: OWASP top 10 scan, XSS/injection check, RLS policy verification, api_key_encrypted exposure scan, Stripe secret key exposure scan, subscription gating integrity (every module route wrapped), LIVE/DEMO label accuracy, banned phrase scan, design token compliance, tsc zero errors, npm run build pass, dead code removal, dependency audit. | Command Center → Audit Agent | 🔄 OPEN | WO-OVERHAUL-11 through WO-OVERHAUL-19 |

### PRE-FLIGHT REPORT (Phase 0 — Command Center)

**Date:** 2026-03-06 Session 41
**Executed by:** Command Center Agent (self-execution mode)

#### Pre-Flight Checks

| Check | Result | Detail |
|---|---|---|
| FAIL 1: External doc reference as authority | ✅ PASS | No external doc references found in src/ |
| FAIL 2: New WO/plan doc outside build_tracker | ✅ PASS | WO-OVERHAUL-01–09 created in this file (above) |
| FAIL 3: Contradiction with command docs | ⚠️ NOTED | SiteFooter "Marketplace" label contradicts FAIL 6 — to be fixed in Phase 3 |
| FAIL 4: Fake-live claims | ✅ PASS | FreshnessLabel.tsx derives from real updated_at (LIVE) |
| FAIL 5: Omitted routes vs SITE_MAP.md | ⏳ DEFERRED | Full route coverage verified in Phase 9 |
| FAIL 6: Ecommerce elevated above Intelligence | ❌ FAIL | SiteFooter.tsx:7 — `{ to: '/brands', label: 'Marketplace' }` — MUST FIX in Phase 3 |
| FAIL 7: Outreach/cold email content | ✅ PASS | No cold email/outreach copy found |
| /design-system page accessible | ✅ PASS | Route: /design-system → FigmaHandoff.tsx (SOCELLE-REBUILD repo) — full token system indexed |
| Supabase migrations ADD-ONLY clean | ✅ PASS | `git diff SOCELLE-WEB/supabase/migrations/` returns empty — no historical edits |
| Protected files intact | ✅ PASS | auth.tsx, useCart.ts, ProtectedRoute.tsx, create-checkout, stripe-webhook — untouched |

#### APIs Identified for Registry Seed (Phase 2)

| API | Provider | Category | Edge Functions / Files |
|---|---|---|---|
| Supabase | Supabase | Platform | Auto-injected (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) — all functions |
| Stripe | Stripe | Payments | stripe-webhook, create-checkout |
| Anthropic Claude | Anthropic | AI | Server-side secret (ANTHROPIC_API_KEY) |
| Google Gemini | Google | AI | Server-side secret (GOOGLE_GEMINI_API_KEY) |
| Feed Orchestrator (RSS/API) | Internal | Data | feed-orchestrator (202 feeds in data_feeds) |
| Sitemap Generator | Internal | SEO | sitemap-generator |
| Magic Link | Internal | Auth | magic-link |
| Jobs Search | Internal | Data | jobs-search |
| Ingest NPI | Internal | Data | ingest-npi |

#### FAIL 6 Remediation Required

SiteFooter.tsx line 7: `{ to: '/brands', label: 'Marketplace' }` violates /.claude/CLAUDE.md §E.
Must change to `{ to: '/brands', label: 'Brand Directory' }` or similar intelligence-first label.
Scheduled for Phase 3 (WO-OVERHAUL-03).

#### Phase Sequence + Dependencies

```
Phase 0 ✅ → Phase 1 (Design Parity) → Phase 2 (Backend Schema)
                                              ↓
                                    Phase 3 (Site Rebuild) → Phase 4 (Admin CMS)
                                              ↓                      ↓
                                    Phase 5 (SEO)          Phase 6 (Edge Functions)
                                              ↓                      ↓
                                    Phase 7 (API Sitemap Wiring) ←──┘
                                              ↓
                                    Phase 8 (Mobile Parity)
                                              ↓
                                    Phase 9 (Doc Gate Final)
```

**PRE-FLIGHT STATUS: PASS (with FAIL 6 noted for Phase 3 remediation)**
**All 9 WOs created. Ready to begin Phase 1.**

---

## SOCELLE V2 — Align Docs to V1 Master + Rebuild Plan

> Added 2026-03-08. Authority: `V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` (docs/command/).
> All V2 WOs follow the V1 master's phase ordering. No code changes in this section — docs and planning only until owner approves execution.

### V2-COMMAND — Documentation Alignment

| WO | Title | Scope | Inputs | Outputs | Owner Agent | Gate |
|----|-------|-------|--------|---------|-------------|------|
| ✅ V2-COMMAND-01 | Align command docs to V1 master | Read V1, update all docs/command/*.md to match V1 tech baseline, hub list, phases, anti-shell rule | V1 master, all docs/command/*.md | Updated docs with V1 alignment headers | Command Agent | Phase 0 | ✅ 2026-03-08 — 29 files aligned, all reference V1 |
| ✅ V2-COMMAND-02 | Refresh agent scopes and workflows | Update AGENT_SCOPE_REGISTRY, AGENT_WORKFLOW_INDEX, AGENT_WORKING_FOLDERS with V1 agent roster + hub-to-agent mapping + NO SHELL rule per hub | V1 §L + §G, agent registry docs | Updated registry docs with 15 hub assignments + skill maps | Command Agent | Phase 0 | ✅ 2026-03-08 — v2.0 registry, 16 agents, 15 hubs mapped |
| ✅ V2-COMMAND-03 | Update site maps and brand surfaces to V1 | Ensure GLOBAL_SITE_MAP, SITE_MAP, BRAND_SURFACE_INDEX list all 15 hubs + their routes | V1 §G, site map docs | Updated site maps with complete hub route coverage | Command Agent | Phase 0 | ✅ 2026-03-08 — all 15 hubs in site maps |

### V2-TECH — Tech Baseline Upgrades (Phase 3)

| WO | Title | Scope | Inputs | Outputs | Owner Agent | Gate |
|----|-------|-------|--------|---------|-------------|------|
| ✅ V2-TECH-01 | React 18.3 → 19.x upgrade | `npm i react@^19 react-dom@^19 @types/react@^19 @types/react-dom@^19` + build + sanity | V1 §E | package.json, lock file, build passing | Platform Engineer | Phase 3 | ✅ 2026-03-08 — React 19.2.4, lucide-react 0.577.0, useRef fix in useScorm.ts, tsc 0 errors, build 4.60s |
| ✅ V2-TECH-02 | Vite 5.4 → 6.x upgrade | `npm i vite@^6 @vitejs/plugin-react@^5` + build + config fix | V1 §E | vite.config.ts, package.json, build passing | Platform Engineer | Phase 3 | ✅ 2026-03-08 — Vite 6.4.1, @vitejs/plugin-react 5.1.4, no config changes needed, build passing |
| ✅ V2-TECH-03 | TypeScript strict enforcement | `"strict": true` already ON in tsconfig.app.json; `npx tsc --noEmit` exit 0 | V1 §E | tsconfig.json already strict, tsc passes 0 errors | Platform Engineer | Phase 3 | ✅ 2026-03-08 — strict:true confirmed, tsc 0 errors. 52 files still use explicit `any` (cleanup WO, not blocker) |
| ✅ V2-TECH-04 | TanStack Query v5 migration | Install TanStack Query, migrate all `useEffect`+fetch patterns to `useQuery`/`useMutation` | V1 §E | All data hooks converted, no raw useEffect+fetch for server data | Platform Engineer | Phase 3 | ✅ 2026-03-08 — @tanstack/react-query v5.90.21 installed, ~80 hook functions across ~46 files migrated, QueryClient defaults (staleTime 5min, gcTime 10min, retry 1), side-effect hooks retain useEffect (Realtime, SCORM, cart/wishlist init), tsc 0 errors, build 4.67s |
| ✅ V2-TECH-05 | Sentry integration (web + edge) | Wire Sentry SDK for error + performance monitoring on web app and edge functions | V1 §E, §J | Sentry init in main entry, edge function wrappers, errors visible in dashboard | Platform Engineer | Phase 3 | ✅ 2026-03-08 — @sentry/react v10.42.0 + @sentry/vite-plugin v5.1.1 installed. main.tsx: Sentry.init() with browserTracing+replay, PII scrubbing. ErrorBoundary: captureException on componentDidCatch. SentryUserContext: sets user ID (no PII). vite.config.ts: sentryVitePlugin (conditional on SENTRY_AUTH_TOKEN), vendor-sentry chunk, CSP updated. supabase/functions/_shared/sentry.ts: withSentry() wrapper + captureException() for edge functions via HTTP envelope API. Set VITE_SENTRY_DSN (web) + SENTRY_DSN_EDGE (edge) to activate. tsc 0 errors, build 5.31s |
| ✅ V2-TECH-06 | database.types.ts regeneration | Run Supabase type generation to match all 71+ migrations | V1 §E | database.types.ts matches schema, tsc passes | Data Architect | Phase 3 | ✅ 2026-03-08 — `supabase gen types typescript --project-id rumdmulxzmjtsplsjngi` → 5,009 lines generated to src/lib/database.types.ts. tsc 0 errors, build 4.99s |
| ✅ V2-TECH-07 | Playwright E2E smoke suite | Route crawl + auth flow + paywall gate tests | V1 §E, §J | Playwright config + test files, CI integration | QA Agent | Phase 3 | ✅ 2026-03-08 — Playwright 1.58.2 already installed. routeTable.ts expanded from 63 to 48 routes (removed stale UUIDs, added all current public/portal/admin routes). New e2e/smoke.spec.ts: 9 tests covering homepage load, intelligence page, auth gates (portal/admin/brand redirect to login), SEO basics (title/meta), and font-serif design compliance check across 6 public routes. Existing routes.spec.ts + auth.spec.ts + ai-flow.spec.ts preserved. tsc 0 errors |

### V2-INTEL — Intelligence Cloud Build (Phase 4)

| WO | Title | Scope | Inputs | Outputs | Owner Agent | Gate |
|----|-------|-------|--------|---------|-------------|------|
| V2-INTEL-01 | Intelligence Cloud v1 — 10 modules | Implement KPI Strip, Signal Table, Trend Stacks, What Changed Timeline, Opportunity Signals, Confidence+Provenance, Category Intelligence, Competitive Benchmarking, Brand Health Monitor, Local Market View | V1 §G | 10 module components wired to live data | Intelligence Architect | Phase 4 | ✅ COMPLETE (2026-03-09 Session 48 Wave 3) — 10 modules under src/components/intelligence/cloud/: KPIStrip (164L), SignalTable (449L, sortable+CSV), TrendStacks (157L, CSS bars), WhatChangedTimeline (157L), OpportunitySignals (170L, revenue estimates), ConfidenceProvenance (183L), CategoryIntelligence (287L, TanStack Query+CSV), CompetitiveBenchmarking (193L, DEMO), BrandHealthMonitor (225L, DEMO), LocalMarketView (247L, DEMO). All use IntelligenceSignal props. tsc=0. |
| V2-INTEL-02 | 7 AI engines implementation | menuOrchestrator, planOrchestrator, gapAnalysisEngine + 4 others wired to credit system | V1 §G | Edge functions + orchestrator configs | Intelligence Architect | Phase 4 |
| V2-INTEL-03 | 6 AI tools user-facing | Explain Signal, Search, Brief Generator, Action Plan, R&D Scout, MoCRA Checker | V1 §G, §A | UI components + credit deduction on each action | Intelligence Architect | Phase 4 | ✅ COMPLETE (2026-03-09 Session 48 Wave 3) — 6 tools under src/components/intelligence/tools/: ExplainSignal (253L, 5cr), SignalSearch (296L, 2cr), BriefGenerator (286L, 25cr), ActionPlanGenerator (370L, 25cr), RnDScout (428L, 10cr, Pro+), MoCRAChecker (405L, 15cr, Enterprise). All DEMO-badged with "Generated by AI" + Evidence & Logic panels. Tier gates on RnDScout/MoCRA. tsc=0. |
| V2-INTEL-04 | Live feed pipeline (37+ feeds) | Activate 37+ feeds from data_feeds registry, ensure signal freshness < 24h | V1 §J, W13/W15 work | feed_run_log shows successful runs, market_signals fresh | Intelligence Architect | Phase 4 |
| V2-INTEL-05 | Credit economy wiring | Credit allocation per tier, deduction on every AI action, balance tracking, overage handling | V1 §A, SOCELLE_ENTITLEMENTS_PACKAGING.md | Credit ledger table, deduction logic, UI balance display | Monetization Agent | Phase 4 |
| V2-INTEL-06 | Affiliate/Wholesale engine | FTC-compliant commission badges, tracked redirects, distributor mapping | V1 §M | Affiliate link wrapper, commission tracking, FTC badges | Monetization Agent | Phase 4 |

### V2-HUBS — Make Each Hub Non-Shell (Phase 5)

Each hub must satisfy ALL anti-shell requirements per V1 §D: Create / List / Detail / Edit+Delete / Permissions / Intelligence input / Proof+metrics / Export / Error+empty+loading / Observability.

| WO | Title | Hub | Owner Agent | Gate |
|----|-------|-----|-------------|------|
| V2-HUBS-01 | Intelligence Hub — full non-shell | Intelligence | Intelligence Architect | Phase 5 | ✅ COMPLETE (2026-03-09 Session 48 Wave 2) — Full dashboard: KPI strip (6 metrics from market_signals), sortable/filterable/searchable Signal Table with CSV export, What Changed Timeline, Opportunity Signals with revenue estimates, slide-out SignalDetailPanel (direction+magnitude, metadata, provenance, cross-hub actions), AIToolbar (5 tools DEMO-badged). tsc=0. |
| V2-HUBS-02 | Jobs Hub — full non-shell | Jobs | Platform Engineer | Phase 5 | ✅ COMPLETE (2026-03-09 Session 48 Wave 2) — Jobs.tsx + JobDetail.tsx rewritten with TanStack Query (useJobPostings hook), search/filter by type/experience/location, CSV export, talent intelligence signals, Schema.org JobPosting JSON-LD, skeleton/error/empty states. tsc=0. |
| V2-HUBS-03 | Brands Hub — full non-shell | Brands | Marketing Agent | Phase 5 | ✅ COMPLETE (2026-03-09 Session 48 Wave 2) — Brands.tsx + BrandStorefront.tsx upgraded: competitive intelligence tab (signal mentions per brand), CSV export, Schema.org Organization, BrandStorefront 5-tab nav (Overview/Products/Education/Protocols/Intelligence), Intelligence tab wired to market_signals. tsc=0. |
| V2-HUBS-04 | Professionals Hub — full non-shell | Professionals | CRM Agent | Phase 5 | ✅ COMPLETE (2026-03-09 Session 48 Wave 2) — Professionals.tsx rewritten: live directory from user_profiles with TanStack Query, search/filter by specialty/location/license, Schema.org Person JSON-LD, CSV export, skeleton/error/empty states. tsc=0. |
| V2-HUBS-05 | Admin Hub — full non-shell | Admin | Command Agent | Phase 5 | ✅ COMPLETE (2026-03-09 Session 48 Waves 1.5+3) — AdminDashboard (System Health KPI strip, feed errors, quick actions), CMS admin (7 pages), Media Library (drag-drop, preview, metadata), AdminUsers (446L, role editor, deactivate/reactivate, CSV), AdminAuditLog (423L, 42P01 DEMO fallback, filterable, CSV), AdminFeatureFlags (253L, 7 toggles DEMO), AdminPlatformSettings (209L, 4 panels DEMO). Routes: /admin/users, /admin/audit-log, /admin/feature-flags, /admin/platform-settings. tsc=0. |
| V2-HUBS-06 | CRM Hub — full non-shell | CRM | CRM Agent | Phase 5 | ✅ UPGRADED (2026-03-09 Session 48) — Wave 1: Full CRUD (contacts, companies, tasks, segments) + CSV export + 6-tab contact detail + search/filter. Wave 1.5 upgrade: Today View dashboard (greeting, KPI strip, tasks due today, upcoming appointments, churn risk flags red/yellow, milestone alerts, relevant signals), Intelligence tab wired to market_signals (cross-ref treatment history, top 5 signals, "Create offer" + "Add to note" actions), churn risk column in ContactList (45d yellow, 60d red, sort + filter), skeleton shimmers on all pages. Still needs: rebooking engine rules, consent audit log. tsc=0. |
| V2-HUBS-07 | Education Hub — full non-shell | Education | Education Agent | Phase 5 | ✅ UPGRADED (2026-03-09 Session 48) — 12 pages + 11 hooks (5,420 lines). Course player with sidebar, quiz engine (multi-type, timer, retake), certificates (PDF + verify), CE credit dashboard (progress bar, category breakdown, expiry warnings), staff compliance view, SCORM support, author tools (CourseBuilder wizard). Wave 1.5: intelligence-driven recommendations (market_signals → course mapping), CSV export on CE + Staff, Pearl Mineral empty states, skeleton shimmers. tsc=0. |
| V2-HUBS-08 | Marketing Hub — full non-shell | Marketing | Marketing Agent | Phase 5 | ✅ COMPLETE (2026-03-09 Session 48 Wave 2) — 4 pages: MarketingDashboard (KPI strip, recent campaigns, quick actions), CampaignList (sortable/filterable table, CSV export), CampaignBuilder (4-step wizard: Details→Audience→Content→Review+Schedule), MarketingTemplates (grid from cms_templates). useMarketingCampaigns hook (TanStack Query v5 CRUD). Routes: /portal/marketing-hub/*. tsc=0. |
| V2-HUBS-09 | Sales Hub — full non-shell | Sales | Sales Agent | Phase 5 | ✅ UPGRADED (2026-03-09 Session 48) — 9 pages + 5 hooks (3,186 lines). PipelineBoard with kanban drag-drop, DealDetail with activity timeline, ProposalBuilder with signature capture, CommissionDashboard, OpportunityFinder (signals → deals), RevenueAnalytics (intelligence attribution). Wave 1.5: CSV export on all 5 pages, visible error states with retry, skeleton shimmers, Pearl Mineral empty states with contextual CTAs. tsc=0. |
| V2-HUBS-10 | Commerce Hub — full non-shell | Commerce | Ecommerce Agent | Phase 5 | ✅ COMPLETE (2026-03-08) — 8 LIVE shop pages (catalog, product detail x2, category, cart, checkout, orders, order detail, wishlist) + intelligence-commerce page + trending badges via market_signals cross-ref + FTC affiliate badge component + admin shop hub with 6 tabs. Auth-gated orders/wishlist. Intelligence-first framing (no "Shop" in MainNav). tsc 0 errors, build pass. |
| V2-HUBS-11 | Authoring Studio — full non-shell | Authoring Studio | Authoring Agent | Phase 5 | ✅ COMPLETE (2026-03-09 Session 48) — StudioHome (3 tabs: My Documents/Templates/Shared, 9 template types, document grid with status badges), StudioEditor (3-panel: 17 block types in 5 categories, canvas with reorder/delete, properties panel, preview overlay, version tracking), CourseBuilder (5-step wizard: Settings/Curriculum/Assessment/Review/Publish with lesson types video/interactive/document/quiz/scorm), useStudioDocs hook (TanStack Query v5 CRUD + publish/archive). Routes: /portal/studio, /portal/studio/editor/:id, /portal/studio/course/:id. tsc=0. |
| V2-HUBS-12 | Credit Economy — full non-shell | Credit Economy | Monetization Agent | Phase 5 | ✅ COMPLETE (2026-03-09 Session 48 Wave 2) — CreditDashboard (KPI strip: balance/used/remaining/tier, usage history table with CSV export, tier allocation visual), CreditPurchase (credit pack options DEMO-badged). useCreditBalance hook (TanStack Query v5 with 42P01 fallback to DEMO). Routes: /portal/credits, /portal/credits/purchase. tsc=0. |
| V2-HUBS-13 | Affiliate/Wholesale Engine — full non-shell | Affiliate Engine | Monetization Agent | Phase 5 | ✅ COMPLETE (2026-03-09 Session 48 Wave 2) — AffiliateDashboard (KPI strip: clicks/conversions/earnings/rate, affiliate links table with FTC badges, CSV export), AffiliateLinks (link manager with copy-to-clipboard, FTC "Commission-linked" badges). useAffiliateData hook (TanStack Query v5 with 42P01 fallback). Routes: /portal/affiliates, /portal/affiliates/links. tsc=0. |
| V2-HUBS-14 | CMS + Content Surfaces | CMS (blog, briefs, education content, in-app help) | Authoring Agent | Phase 5 |

### V2-MULTI — Multi-Platform Rollout (Phase 6)

| WO | Title | Scope | Inputs | Outputs | Owner Agent | Gate |
|----|-------|-------|--------|---------|-------------|------|
| V2-MULTI-01 | PWA baseline | Service worker, manifest, offline support for React+Vite app | V1 §H | PWA-ready web app | Platform Engineer | Phase 6 |
| V2-MULTI-02 | Tauri desktop wrapper | Tauri shell wrapping same React+Vite build for Mac + Windows | V1 §H | Desktop builds, no Rust business logic reimplementation | Multi-Platform Agent | Phase 6 |
| V2-MULTI-03 | Flutter mobile app | Flutter app using same Supabase API contracts + edge functions | V1 §H | Flutter app wired to shared backend, no TS FFI | Multi-Platform Agent | Phase 6 |

### V2-LAUNCH — Launch Gates (Phase 7)

| WO | Title | Scope | Owner Agent | Gate |
|----|-------|-------|-------------|------|
| V2-LAUNCH-01 | Launch non-negotiables checklist | All items from V3 §I must pass: tsc, build, TanStack, PAYMENT_BYPASS=false, 0 font-serif, 0 banned terms, Stripe webhooks, fresh signals, AI briefs, SEO baseline, types match, credits deduct, FTC badges, Playwright smoke, errors visible in Admin Hub dashboards | QA Agent + Command Agent | Phase 7 |
| V2-LAUNCH-02 | Launch comms execution | Site announcement, email sequences, social content per LAUNCH_COMMS_PLAYBOOK.md | Marketing Agent + Copy Agent | Phase 7 |
| OWNER-CREDS-01 | Owner credential setup — AI + Payments + OAuth | **Must complete before launch. Owner action only — no agent can do this.** (1) Supabase Dashboard → Project Settings → Edge Functions secrets → set `OPENAI_API_KEY` (powers ai-orchestrator embeddings + GPT-4o responses). (2) Stripe Dashboard → get publishable key → set `VITE_STRIPE_PUBLISHABLE_KEY` in `SOCELLE-WEB/.env` + get webhook signing secret → set `STRIPE_WEBHOOK_SECRET` in Supabase edge function secrets. (3) Google Cloud Console → create OAuth 2.0 app → set `VITE_GOOGLE_OAUTH_CLIENT_ID` in `.env` (CRM calendar sync). (4) Microsoft Azure → create OAuth app → set `VITE_MICROSOFT_OAUTH_CLIENT_ID` in `.env` (CRM Outlook calendar sync). | Owner (Bruce) only | Phase 7 — after PAY-WO-01..05 complete, before launch |

---

## SOCELLE V3 — CMS-First Platform Build

> Added 2026-03-08. Authority: `V3_BUILD_PLAN.md` → `V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md`.
> Phase 0 (Documentation) complete. Phase 1+ requires owner GO.

### WO-CMS — CMS Foundation (Phase 0-6)

| WO | Title | Scope | Inputs | Outputs | Owner Agent | Status |
|----|-------|-------|--------|---------|-------------|--------|
| WO-CMS-01 | CMS Schema & RLS | Supabase migrations for `cms_spaces`, `cms_pages`, `cms_blocks`, `cms_page_blocks`, `cms_posts`, `cms_assets`, `cms_docs`, `cms_templates`. RLS: admin write, public read published. Indexes for slug/space/status. `database.types.ts` regen. | `CMS_ARCHITECTURE.md` §2-3 | 8 migrations + RLS policies + indexes | Data Architect | ✅ Complete 2026-03-09 (Session 47) — Migration `20260309000001_create_cms_tables.sql` applied. 8 tables + RLS + indexes + triggers + 10 spaces + 4 templates seeded. Types regenerated. tsc=0, build=success. |
| WO-CMS-02 | CMS Client & Hooks | TanStack Query v5 hooks: `useCmsPages`, `useCmsBlocks`, `useCmsPosts`, `useCmsAssets`, `useCmsSpaces`, `useCmsTemplates`, `useCmsDocs`. All follow `isLive`, `enabled`, 42P01 patterns. | `CMS_ARCHITECTURE.md` §4 | `src/lib/cms/*.ts` hooks | Platform Engineer | ✅ Complete 2026-03-09 (Session 47) — 9 files: types.ts + 7 hooks + index.ts barrel. All TanStack Query v5. isLive, 42P01 handling, useMutation with invalidation. tsc=0, build=success. |
| WO-CMS-03 | CMS Hub UI | Admin CMS routes: `/admin/cms` dashboard, `/admin/cms/pages` CRUD, `/admin/cms/posts` CRUD, `/admin/cms/blocks` library, `/admin/cms/media` library, `/admin/cms/templates`, `/admin/cms/spaces`. All routes in App.tsx. Anti-shell compliant. | `CMS_ARCHITECTURE.md` §5, `JOURNEY_STANDARDS.md` §10, §12 | `src/pages/admin/cms/*.tsx` + App.tsx routes | Admin Control Center Agent | ✅ Complete 2026-03-09 (Session 48) — 7 admin pages: CmsDashboard, CmsPagesList, CmsPostsList, CmsBlockLibrary, CmsMediaLibrary, CmsTemplatesList, CmsSpacesConfig. All routes in App.tsx. TanStack Query v5 CRUD. tsc=0, build=success. |
| WO-CMS-04 | PageRenderer & Public CMS Pages | `PageRenderer` component: reads `cms_pages` + `cms_page_blocks` + `cms_blocks`, renders blocks by type → component map. Public routes: `/pages/:slug`, `/blog`, `/blog/:slug`, `/help/:slug`. SEO via Helmet from `seo_*` fields. | `CMS_ARCHITECTURE.md` §4, §6, `CMS_CONTENT_MODEL.md` §2 | `src/components/cms/PageRenderer.tsx` + block components + routes | Web Agent | ✅ Complete 2026-03-09 (Session 48) — PageRenderer + BlockRenderer + 12 block components (Hero, Text, Image, Video, CTA, Stats, FAQ, Embed, Code, Testimonial, SplitFeature, EvidenceStrip) + barrel. Blog routes (/blog, /blog/:slug) + CMS page route (/pages/:slug) + help route (/help/:slug) in App.tsx. tsc=0, build=success. |
| WO-CMS-05 | Authoring Studio + CMS Integration | Rich block editor in Authoring Studio. Preview mode via PageRenderer. Version history (draft/published/archived). Assigned author + review status. | `CMS_ARCHITECTURE.md` §5, `JOURNEY_STANDARDS.md` §11 | Authoring UI components + version tracking | Authoring Agent | ✅ Complete 2026-03-09 (Session 48) — StudioHome (3 tabs, 9 templates, document grid), StudioEditor (3-panel: block picker 17 types + canvas + properties), CourseBuilder (5-step: Settings/Curriculum/Assessment/Review/Publish), useStudioDocs.ts (TanStack Query v5 CRUD + publish/archive). 3 routes in App.tsx (/portal/studio, /portal/studio/editor/:id, /portal/studio/course/:id). tsc=0. |
| WO-CMS-06 | Hub Integrations & Journeys | Wire Intelligence briefs → `cms_posts` (space="intelligence"). Wire Education content → `cms_posts` (space="education"). Wire Marketing landing pages → `cms_pages` (space="marketing"). Wire Sales playbooks → `cms_docs` (space="sales"). All remaining hub content surfaces to CMS. | `CMS_CONTENT_MODEL.md` §6, `JOURNEY_STANDARDS.md` §3-13 | Hub pages reading from CMS tables | All Hub Agents | TODO |

### Phase 0 Deliverables (Complete)

| Document | Status | Date |
|----------|--------|------|
| `docs/command/V3_BUILD_PLAN.md` | ✅ Written | 2026-03-08 |
| `docs/command/CMS_ARCHITECTURE.md` | ✅ Written | 2026-03-08 |
| `docs/command/CMS_CONTENT_MODEL.md` | ✅ Written | 2026-03-08 |
| `docs/command/JOURNEY_STANDARDS.md` | ✅ Written | 2026-03-08 |

---

| MERCH-REMEDIATION-01 | Fix 7 FAIL rules → 0 FAIL (6 PASS, 6 WARN). Steps: (A) archive 68 off-topic signals (68 archived total: Buruli ulcer, Alzheimer, NASA, cancer, etc.) — other topic 47.5%→26%, max topic 34% (safety) < 40% cap; (B) provenance_tier column + ORDER BY + rankedScore (tier1=2.0x, tier2=1.4x, tier3=1.0x); (C) freshnessDecay() (0-2h=1.0 ... 72+h=0.375) + rankedScore sort; (D) timeline eligibility (impact_score>=60, 72h recency, no other/general). Migrations 000035+000036. tsc=0. | COMPLETE | fc4b6cc | docs/qa/verify_MERCH-REMEDIATION-01.json |
| ULTRA-DRIVE-COMPLETE | Ultra Drive sprint: all 5 lanes complete. pro-*=0, brand-*=0, intel-*=0, Sentry=0, TanStack=0 violations, unit=156/156, E2E=164/215. Completion gate artifact: docs/qa/verify_UD-sprint-complete_2026-03-09T24-00-00-000Z.json | COMPLETE | — | docs/qa/verify_UD-sprint-complete_2026-03-09T24-00-00-000Z.json |

---

Update this file at the end of every Claude Code session.
It is the first thing Claude Code reads at the start of every session.
An outdated tracker means a confused Claude Code and wasted build time.
