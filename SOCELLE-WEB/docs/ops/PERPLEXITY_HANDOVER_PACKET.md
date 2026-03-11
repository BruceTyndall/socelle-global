# PERPLEXITY HANDOVER PACKET — VALIDATE PLAN & CHALLENGE ASSUMPTIONS

**Created:** 2026-03-10  
**Purpose:** Single handover doc for Perplexity Computer to validate the SOCELLE competitive plan, challenge assumptions, and answer specific questions. Priority: product power (data + advanced features + modern UX). We are not taking the easiest split.

**HANDOVER OF RESPONSIBILITY:** Perplexity Computer is taking over **all planning and all code edits** for SOCELLE. After completing the validation and answering the questions in §8, Perplexity owns: (1) planning — WO sequencing, scope decisions, and plan updates; (2) code edits — implementing WOs, updating build_tracker, creating verify_*.json artifacts, and following the authority chain (CLAUDE.md, build_tracker, CONSOLIDATED_BUILD_PLAN, APP_BY_APP_IDEA_MINING_UPGRADES). The human owner approves direction and gates; Perplexity executes planning and code changes.

**STOP CONDITION (before first code edit):** Do not start coding until app-by-app idea mining is done externally, WOs are upgraded per platform, UX growth upgrades are specified and governed, this packet is complete, and Q1–Q4 in §8 are answered. After that, Perplexity proceeds with planning and code edits as the primary executor.

---

## 1. REPO SUMMARY + WHAT “DONE” MEANS (PROOF REQUIREMENTS)

### Repo in one sentence

SOCELLE is a B2B intelligence platform for professional beauty (medspa, salon, brand) with live market signals, cross-hub actions (CRM, Sales, Marketing, Education, Commerce), Authoring Studio/CMS, and multi-platform (PWA, Tauri, Flutter). Execution is single-codebase; split/packaging is gated on Product Power + UX.

### What “done” means (no DONE without these)

- **tsc=0** — TypeScript strict, no errors.
- **build=PASS** — Vite build succeeds.
- **verify_&lt;WO_ID&gt;_*.json** — Artifact in `SOCELLE-WEB/docs/qa/` with `overall: "PASS"` for the WO.
- **Required validators** — Any validator cited for that WO (e.g. hub-shell-detector, cta-validator, system-health-dashboard-validator, intelligence-merchandiser) must be run and pass or have documented gaps.
- **No self-certification** — Execution truth = `build_tracker.md` + `docs/qa/verify_*.json`. Older narrative plans do not define “done.”

### Authority chain

- **Tier 0:** `/.claude/CLAUDE.md` — wins all conflicts.
- **Execution:** `SOCELLE-WEB/docs/build_tracker.md` + `docs/qa/verify_*.json`.
- **Single plan:** `SOCELLE-WEB/docs/command/CONSOLIDATED_BUILD_PLAN.md`.
- **Per-app scope & WOs:** `SOCELLE-WEB/docs/ops/APP_BY_APP_IDEA_MINING_UPGRADES.md`.
- **Session entry:** `docs/command/SESSION_START.md` + read chain. One WO per session unless owner approves parallelism.

### Streamline Source-of-Truth (fewer docs, not weaker gates)

- Tier 0 wins conflicts. Execution truth = build_tracker + verify_*.json, not older narrative docs.
- One WO per session unless explicitly approved parallelism.
- No DONE without: tsc, build, verify json, required validators.

### Multi-agent alignment

- One shared ledger: **build_tracker** is the only execution tracker.
- One entrypoint: **SESSION_START** + the read chain.
- Agents must not invent new WOs, routes, or parallel trackers.

---

## 2. APP-BY-APP STATE (WILL HAVE / WILL NOT HAVE / FALL SHORT)

*Brutal assessment. No softening. DEMO/shell on main path called out explicitly.*

### 1. Intelligence

| Category | State |
|----------|--------|
| **Good enough today** | Live feed pipeline (FEED-WO-01..05), useIntelligence with vertical/tier, signal table, AI toolbar (6 tools + credit gate), detail panel + CrossHubActionDispatcher, saved searches, realtime INSERT, admin intel dashboard, signal cards clickable to detail, images on cards, merchandising (safety-pin, topic cap), INTEL-WO-01..11 complete. |
| **Not competitive yet** | No impact badge on list/detail cards (vs Valona/6sense confidence/impact). No “N similar” dedup UI (vs table-stakes clustering). Today View / Snapshot is not default entry (vs best-in-class progressive disclosure). No in-card “Take action” row on list cards (CrossHubActionDispatcher exists but not surfaced on card). No sentiment aggregate banner; no “More filters” (date, impact, source). MERCH-INTEL-03-FINAL open (MERCH-01, 06, 10). |
| **Broken / partial / risky** | MERCH-INTEL-03 PARTIAL: migration 000027 written, DB apply was PENDING (Supabase MCP). Portal intel not consistently LIVE-as-default in all entry paths. |
| **DEMO or shell on main path?** | BrandIntelligenceHub had DEMO labels on Position Banner + 3 tab panels (LANE-B fixes). IntelligenceCommerce DEMO banner + LIVE guard added. No remaining DEMO on primary intelligence list/detail; risk is secondary surfaces. |

### 2. CRM

| Category | State |
|----------|--------|
| **Good enough today** | crm_consent_log, CrmConsent at /portal/crm/consent, churn_risk_score + last_visit_at, ChurnRisk badge in list, ContactDetail intelligence tab with churn bar + rebooking CTA, signal_id FK on crm_contacts, unified timeline, calendar OAuth sync, BUILD3 growth/booking/notifications. |
| **Not competitive yet** | Timeline does not show which actions came from which signal (signal_id-attributed events). Rebooking recommendation exists but is not driven by an explicit “rebooking engine” using churn_risk_score + consent. Vs Zenoti/GlossGenius: no AI rebooking, no 75%+ rebooking flow, no attributed timeline. |
| **Broken / partial / risky** | Attribution from market_signals (signal_id) is in schema and contact link; timeline UI does not yet display “Action from signal X.” |
| **DEMO or shell on main path?** | CRM hub is LIVE (useQuery, states). Consent and churn are real. No DEMO on main path; risk is depth of timeline attribution. |

### 3. Sales

| Category | State |
|----------|--------|
| **Good enough today** | signal_id + attributed_at on deals, OpportunityFinder createDeal wires attribution, RevenueAnalytics “Signal-Influenced Deals” (signal_id IS NOT NULL), ProposalBuilder and OpportunityFinder loading/error/empty states. |
| **Not competitive yet** | “Signal-influenced” is a metric only; not visible in pipeline view or standard reporting. Proposal builder has no signal context (no pre-fill or link from a signal). Vs Gong/Clari/6sense: no intent-in-workflow, no deal prioritization from signals, no proposal-from-signal. |
| **Broken / partial / risky** | Journey “see signal → create deal” works; “see signal-influenced in pipeline/reporting” and “proposal with signal context” are missing. |
| **DEMO or shell on main path?** | Sales surfaces are LIVE. No DEMO on main path. |

### 4. Marketing

| Category | State |
|----------|--------|
| **Good enough today** | V2-HUBS-08: marketing dashboard, 4-step campaign builder, CMS templates. BUILD3 signal-action dispatcher, notification ledger. MarketingCalendar isLive. |
| **Not competitive yet** | No CTA from BrandIntelligenceHub or signal detail to “Create campaign from this signal” (LANE-A-DEBT-04). Dual marketing paths (/portal/marketing/* and /portal/marketing-hub/*). Dual pricing (/plans vs /pricing). Vs signal-based ABM: no “campaign from signal” workflow; no single path to marketing. |
| **Broken / partial / risky** | Journey 8 (Brand → Signal → Campaign) is broken. ROUTE-CLEANUP-WO and SITE-POWER-01 OPEN. |
| **DEMO or shell on main path?** | Some admin editorial shells wired; marketing hub has live calendar. Dual routes create confusion; not labeled DEMO but path fragmentation is a UX risk. |

### 5. Education

| Category | State |
|----------|--------|
| **Good enough today** | EducationDashboard at /portal/education, live course_enrollments, KPI strip, skeleton/error/empty; CECredits from useCECredits; QuizPlayer with full states; “View Certificate” when progress=100% (LANE-A-EDU-01). |
| **Not competitive yet** | CoursePlayer must have full loading/error/empty and certificate flow everywhere; CE on dashboard is there. “No Category C shell” not yet proven (hub-shell-detector). Vs Zenoti/TalentLMS: no automated certificate styling/expiry, no SCORM authoring in-edu (lives in Studio). |
| **Broken / partial / risky** | Risk of Category C shell if any CoursePlayer or CE surface has stub/missing states. |
| **DEMO or shell on main path?** | EDU-WO-02/05 complete; DEMO badges were fixed on Education stats + CE progress (MERCH-INTEL-02). Main path is LIVE; gate is full state coverage. |

### 6. Commerce / Procurement

| Category | State |
|----------|--------|
| **Good enough today** | FTC affiliate (products.is_affiliated, AffiliateDisclosureBadge, “Commission-linked” on ProductCard). ProcurementDashboard at /portal/procurement: KPI, reorder alerts table, CSV, skeleton/error/empty. |
| **Not competitive yet** | Consistent FTC treatment everywhere affiliate links appear not audited. Reorder alerts / product intelligence not explicitly documented as “informed by intelligence” (commerce must not become IA backbone). Vs procurement best practice: no supplier performance, no cost-by-category drilldown. |
| **Broken / partial / risky** | Affiliate-link-tracker-auditor not yet run as gate. |
| **DEMO or shell on main path?** | Commerce is LIVE. No DEMO on main path. |

### 7. Admin

| Category | State |
|----------|--------|
| **Good enough today** | CTRL-WO-01..04 (feature flags, kill switch, audit log, entitlements). INTEL-ADMIN-01: IntelligenceDashboard live (API health, feed status). V2-HUBS-05: AdminUsers, AdminAuditLog, AdminFeatureFlags, AdminPlatformSettings. Session 48: Admin System Health Dashboard (KPI strip, feed errors, quick actions, feed status). AdminFeedsHub /admin/feeds CRUD. |
| **Not competitive yet** | No single dashboard that unifies feed health + API status + audit log viewer + feature flags with real data (some surfaces may still be static or partial). Vs Datadog/Stripe: no audit trail retention/archiving, no feature-flag rollback from dashboard. |
| **Broken / partial / risky** | Audit log table and writers exist; unified “system health + audit log” view may be split or DEMO in places. |
| **DEMO or shell on main path?** | Admin intel dashboard is LIVE. Risk: other admin pages (Editorial, etc.) may be shells; system-health-dashboard-validator will clarify. |

### 8. Studio / CMS

| Category | State |
|----------|--------|
| **Good enough today** | WO-CMS-03/04/05/06 done (CMS admin, PageRenderer, Authoring Studio, hub integrations). AUTH-CORE-01..06: cms_versions, block_data_bindings, VersionHistory, EmbedIntelligenceBlock. CMS-SEED-01: 6 published cms_posts, editorial rail LIVE. STUDIO-UI-01..05/17: StudioEditor (DragCanvas, TemplatePickerModal, ExportModal, share pack). |
| **Not competitive yet** | CMS-WO-07 OPEN: no story_drafts migration, no feeds-to-drafts pipeline, no AdminStoryDrafts. No ingest → draft → publish path (editorial rail is seeded only). Vs Contentful: no workflow steps, no tasks/comments, no scheduled publish. |
| **Broken / partial / risky** | Editorial pipeline is manual-only. Any “content from intelligence” story flow is blocked until CMS-WO-07. |
| **DEMO or shell on main path?** | Studio and editorial rail are LIVE (seeded content). AdminStoryDrafts and feed-to-draft are missing, so no shell on main path but capability gap. |

### 9. Public Site (marketing / landing)

| Category | State |
|----------|--------|
| **Good enough today** | Marketing content (/, /professionals, /for-brands, /plans). Persona pages (for-brands, for-medspas, for-salons, for-professionals). E2E: /pricing→/plans, /for-buyers→/professionals. Cart “Shop Now” fixed; IntelligenceCommerce LIVE/DEMO guard. |
| **Not competitive yet** | LANE-A-DEBT-03: orphaned routes (/home not in nav, /for-medspas, /for-salons), dual marketing hubs, dual pricing. Persona CTA hierarchy and single /plans not done. Vs B2B landing best practice: no value-driven CTA copy audit, no 3–5 field form optimization. |
| **Broken / partial / risky** | Route fragmentation and dual pricing confuse users and SEO. |
| **DEMO or shell on main path?** | Persona pages exist; /home and dual routes are on main paths (entry and nav). Not labeled DEMO but route debt is on main path. |

### 10. Mobile / Tauri / PWA

| Category | State |
|----------|--------|
| **Good enough today** | TAURI-WO-01 done (Tauri shell). PWA-WO-01/02/03 done (sw.js, install prompt, VAPID). MOBILE-WO partial: Flutter hubs (brands, jobs, events, studio) + MODULE gates + app_router. |
| **Not competitive yet** | Flutter hubs may be shells or DEMO; MODULE_* keys not fully validated. No parity with web for intelligence-first UX. Vs Zenoti/GlossGenius apps: no native-grade booking/rebooking, no push-driven retention. |
| **Broken / partial / risky** | MOBILE-WO PARTIAL; mobile-module-key-validator not run as gate. |
| **DEMO or shell on main path?** | Flutter hub screens exist but are partial; if any hub is shell and reachable, it is on main path for mobile users. |

---

## 3. APP-BY-APP UPGRADED WO PLAN (EXTERNAL IDEA MINING)

*Comparables: 10–15 per platform (direct + adjacent). Table stakes, moat, UX patterns, anti-patterns → upgraded WOs with WO ID, scope, why it matters, acceptance criteria, validators, proof pack, dependencies.*

### Intelligence (external comparables: Valona, 6sense, Crayon, AeraVision, Glint, Hindsight, Signal Labs, Apollo, Bombora)

- **Table stakes (we lack):** Impact/confidence on every card; “N similar” dedup; Today View as default; in-card action row; sentiment + filters.
- **Moat (we want):** Early-warning 3–6 months; AI without replacing source; cross-hub Spot→Understand→Act; vertical benchmarks; credit-based AI gates.
- **UX patterns:** Progressive disclosure (Snapshot first, then expand); actionable row per card; deep-linkable views.
- **Anti-patterns:** Raw data dumps; no source attribution; static lists without freshness.

| WO ID | Scope | Why it matters (growth + competitive) | Acceptance criteria | Validators / proof pack | Dependencies |
|-------|--------|----------------------------------------|----------------------|-------------------------|--------------|
| INTEL-POWER-01 | Impact badge on every signal card (list + detail) | Table stakes vs Valona/6sense; trust and prioritization | Badge on SignalCardFeatured + SignalCardStandard; percentile or tier label | design-lock-enforcer; `docs/qa/verify_INTEL-POWER-01_*.json` | IDEA_MINING Pattern 1 |
| INTEL-POWER-02 | “N similar” dedup UI + expand | Reduces noise; matches Crayon/Bombora clustering | Collapse badge per cluster; expand to show sources | intelligence-merchandiser; `docs/qa/verify_INTEL-POWER-02_*.json` | FEED-WO-03 |
| INTEL-POWER-03 | Today View / Snapshot as default entry | Activation: first screen = value, not raw feed | `/intelligence` or portal default tab = Snapshot; vertical KPIs | `docs/qa/verify_INTEL-POWER-03_*.json` | INTEL-WO-11, KPIStrip |
| INTEL-POWER-04 | In-card “Take action” row | Spot→Understand→Act in one place; conversion | Every signal card has action row; CrossHubActionDispatcher linked | cross-hub-dispatcher-validator; `docs/qa/verify_INTEL-POWER-04_*.json` | INTEL-WO-07 |
| INTEL-POWER-05 | Sentiment aggregate banner + More filters | Decision speed; filter by date/impact/source | Banner above feed; “More filters” panel | `docs/qa/verify_INTEL-POWER-05_*.json` | useIntelligence signalTypes |
| MERCH-INTEL-03-FINAL | MERCH-01, 06, 10 (openfda source_url, paid signal volume, 30d archive) | Data quality and completeness | All three items done; verify artifact PASS | `docs/qa/verify_MERCH-INTEL-03-FINAL.json` | MERCH-INTEL-03-DB |

### CRM (external comparables: Zenoti, GlossGenius, Boulevard, Mindbody, Fresha, Square Appointments)

- **Table stakes:** Contact timeline; consent audit; rebooking engine; churn visibility; calendar integration.
- **Moat:** Signal-attributed timeline (market_signals → actions); rebooking from churn_risk_score + consent; no manual “source” tags.
- **UX patterns:** Unified timeline with attributed actions; consent log (agreed_at, IP, user_agent); rebooking CTA from churn.
- **Anti-patterns:** Timeline without attribution; rebooking not driven by risk score.

| WO ID | Scope | Why it matters | Acceptance criteria | Validators / proof pack | Dependencies |
|-------|--------|----------------|---------------------|-------------------------|--------------|
| CRM-POWER-01 | Contact timeline + signal attribution | Zenoti/GlossGenius-level; trust and actionability | Timeline shows signal_id-attributed actions; churn risk + rebooking CTA | `docs/qa/verify_CRM-POWER-01_*.json` | CRM-WO-07/08/09 |
| CRM-POWER-02 | Consent audit + rebooking engine | Compliance and retention | crm_consent_log wired; rebooking from churn_risk_score | `docs/qa/verify_CRM-POWER-02_*.json` | CRM-WO-07 |

### Sales (external comparables: 6sense, Gong, Clari, Crayon, Hindsight, Signal Labs)

- **Table stakes:** Pipeline; proposal builder; revenue analytics.
- **Moat:** Signal-influenced deals in pipeline and reporting; proposal builder with signal context; attribution beyond “create deal.”
- **UX patterns:** Intent in workflow (6sense+Gong); deal prioritization from signals; proposal pre-fill from signal.
- **Anti-patterns:** Attribution only at create; no pipeline/reporting visibility.

| WO ID | Scope | Why it matters | Acceptance criteria | Validators / proof pack | Dependencies |
|-------|--------|----------------|---------------------|-------------------------|--------------|
| SALES-POWER-01 | Deal attribution + revenue analytics | Pipeline and reporting credibility | Signal-influenced in pipeline/reporting; proposal builder with signal context | `docs/qa/verify_SALES-POWER-01_*.json` | SALES-WO-05/08 |

### Marketing (external comparables: HubSpot, Klaviyo, Clay, signal-based ABM, Zenoti/GlossGenius in-app marketing)

- **Table stakes:** Campaign creation; segments; email/SMS; calendar.
- **Moat:** Signal → campaign CTA; single marketing path; campaign from intelligence signal.
- **UX patterns:** One path to marketing; CTA from signal/BrandIntelligenceHub to “Create campaign from this signal.”
- **Anti-patterns:** Dual paths; no signal-to-campaign; cold outreach (we forbid).

| WO ID | Scope | Why it matters | Acceptance criteria | Validators / proof pack | Dependencies |
|-------|--------|----------------|---------------------|-------------------------|--------------|
| MKT-POWER-01 | Signal → campaign CTA (fix DEBT-04) | Journey 8; conversion from intelligence | CTA from BrandIntelligenceHub/signal to campaign creation | cta-validator; `docs/qa/verify_MKT-POWER-01_*.json` | ROUTE-CLEANUP |
| ROUTE-CLEANUP-WO | Single marketing path; single pricing path; orphan redirects | UX and SEO | One /plans; no dual marketing hubs; /home, /for-* resolved | `docs/qa/verify_ROUTE-CLEANUP-WO.json` | P0 GATE |

### Education (external comparables: Zenoti, TalentLMS, Mindbody, Teachable, SCORM platforms)

- **Table stakes:** Course player states; CE on dashboard; certificate flow; no Category C shell.
- **Moat:** Protocol-backed education; intelligence-informed curriculum; CE expiry warnings.
- **UX patterns:** Skeleton/error/empty; certificate at 100%; CE strip with “expiring soon.”
- **Anti-patterns:** Stub states; no certificate path.

| WO ID | Scope | Why it matters | Acceptance criteria | Validators / proof pack | Dependencies |
|-------|--------|----------------|---------------------|-------------------------|--------------|
| EDU-POWER-01 | CE credits + course player states | No Category C shell; retention | Full loading/error/empty on CoursePlayer; certificate flow; CE on dashboard | hub-shell-detector; `docs/qa/verify_EDU-POWER-01_*.json` | EDU-WO-02/05 |

### Commerce / Procurement (external comparables: RestockPro, Zentail, Replen, DataHawk, FTC/affiliate)

- **Table stakes:** FTC badges on product cards; procurement dashboard; reorder alerts; CSV.
- **Moat:** Intelligence informs procurement; commerce never becomes IA backbone.
- **UX patterns:** Affiliate badge on every affiliated product; reorder alerts table; “Commission-linked” labeling.
- **Anti-patterns:** Commerce-led intelligence; missing FTC disclosure.

| WO ID | Scope | Why it matters | Acceptance criteria | Validators / proof pack | Dependencies |
|-------|--------|----------------|---------------------|-------------------------|--------------|
| COMMERCE-POWER-01 | Affiliate compliance + product intelligence | Legal and positioning | Badges everywhere affiliate; procurement with reorder alerts; intel-informed | affiliate-link-tracker-auditor; `docs/qa/verify_COMMERCE-POWER-01_*.json` | COMMERCE-WO-03/07 |

### Admin (external comparables: Datadog, Stripe Dashboard, Sentry, Retool)

- **Table stakes:** System health; feed health; API status; audit log viewer; feature flags.
- **Moat:** Real telemetry (not static); single dashboard; feature-flag rollback.
- **UX patterns:** One dashboard: feed health + API + audit log + flags; live data.
- **Anti-patterns:** Static copy; scattered admin pages.

| WO ID | Scope | Why it matters | Acceptance criteria | Validators / proof pack | Dependencies |
|-------|--------|----------------|---------------------|-------------------------|--------------|
| ADMIN-POWER-01 | System health + feeds + audit log | Operations and trust | Dashboard: feed health, API status, audit log viewer, feature flags (real data) | system-health-dashboard-validator; `docs/qa/verify_ADMIN-POWER-01_*.json` | CTRL-WO-01..04 |

### Studio / CMS (external comparables: Contentful, Canva, Notion, Ceros, Storyblok)

- **Table stakes:** Editorial rail; story drafts; ingest → draft → publish; version history; block types.
- **Moat:** Feeds-to-drafts; EmbedIntelligenceBlock; no manual-only pipeline.
- **UX patterns:** Draft/published/archived; version restore; tasks/comments (Contentful).
- **Anti-patterns:** Manual-only content; no feed-to-draft.

| WO ID | Scope | Why it matters | Acceptance criteria | Validators / proof pack | Dependencies |
|-------|--------|----------------|---------------------|-------------------------|--------------|
| CMS-POWER-01 / CMS-WO-07 | Editorial rail + story drafts | Content-from-intelligence pipeline | story_drafts migration; feeds-to-drafts; AdminStoryDrafts live; no shell | authoring-core-schema-validator; `docs/qa/verify_CMS-WO-07_*.json` | CMS-SEED-01, e0a2c40 prep |

### Public Site (external comparables: B2B landing best practice, Unbounce, Webflow, HubSpot landing)

- **Table stakes:** Persona pages; intelligence-first CTAs; single pricing path; no orphans.
- **Moat:** Trend-first phrasing; CTA hierarchy (intelligence-first, then upgrade).
- **UX patterns:** One /plans; persona CTAs; 3–5 field forms; value-driven CTA copy.
- **Anti-patterns:** Commerce on intelligence surfaces; dual pricing; orphan routes.

| WO ID | Scope | Why it matters | Acceptance criteria | Validators / proof pack | Dependencies |
|-------|--------|----------------|---------------------|-------------------------|--------------|
| SITE-POWER-01 | Route cleanup + persona CTA hierarchy | Conversion and SEO | Single /plans; persona CTAs; no commerce on intel surfaces; GLOBAL_SITE_MAP aligned | persona-page-validator; cta-validator; `docs/qa/verify_SITE-POWER-01_*.json` | LANE-A-DEBT-03, ROUTE-CLEANUP |

### Mobile / Tauri / PWA (external comparables: Zenoti/GlossGenius apps, Flutter PWA, Tauri, pwa_install)

- **Table stakes:** MODULE_* keys; hub screens LIVE or gated; PWA install + push; Tauri stable.
- **Moat:** Same intelligence-first UX as web; no shell hubs on mobile.
- **UX patterns:** Install prompt (snooze); push subscription; same nav and gates as web.
- **Anti-patterns:** Shell hubs; MODULE_* not validated.

| WO ID | Scope | Why it matters | Acceptance criteria | Validators / proof pack | Dependencies |
|-------|--------|----------------|---------------------|-------------------------|--------------|
| MOBILE-POWER-01 | Mobile/Tauri/PWA parity + MODULE gates | Multi-platform credibility | Flutter hubs LIVE or gated; MODULE_* validator pass; PWA install + push; Tauri shell | mobile-module-key-validator; `docs/qa/verify_MOBILE-POWER-01_*.json` | MOBILE-WO, TAURI-WO-01, PWA-WO-01/02/03 |

---

## 4. TOP 3 UX GROWTH UPGRADES PER PLATFORM (ACTIVATION / RETENTION)

*Pearl Mineral V2 compliance is baseline. These are strategic UX changes that materially improve adoption; each has specific changes and WO linkage.*

### Intelligence

1. **Default entry = Snapshot/Today View** — Change: `/intelligence` and portal intel default tab to Snapshot with vertical KPIs; remove “raw feed first” as default. WO: INTEL-POWER-03.
2. **In-card action row on list** — Change: Add visible “Take action” row (Create deal, Add to plan, etc.) on every SignalCardFeatured and SignalCardStandard without requiring click-through. WO: INTEL-POWER-04.
3. **Impact badge above the fold** — Change: Show impact/percentile or tier on every card (list + detail) so users can triage without opening. WO: INTEL-POWER-01.

### CRM

1. **Timeline shows “From signal”** — Change: Each timeline entry that came from a signal shows signal title/link; “Rebooking suggested” from churn_risk_score. WO: CRM-POWER-01.
2. **Consent audit one click** — Change: From contact detail, one click to consent log (agreed_at, source); clear “Compliant” vs “Needs consent” state. WO: CRM-POWER-02.
3. **Rebooking CTA on dashboard** — Change: Dashboard strip or widget: “N contacts at rebooking risk” with CTA to list filtered by churn_risk_score. WO: CRM-POWER-02 (extend).

### Sales

1. **Pipeline view: “Signal-influenced” column or filter** — Change: Pipeline and list views show which deals have signal_id; filter “Signal-influenced only.” WO: SALES-POWER-01.
2. **Proposal from signal** — Change: From signal detail, “Create proposal from this signal” pre-fills or links context to ProposalBuilder. WO: SALES-POWER-01.
3. **Revenue report: Signal-influenced segment** — Change: RevenueAnalytics has explicit “Signal-influenced revenue” segment and % of total. WO: SALES-POWER-01.

### Marketing

1. **One CTA: “Create campaign from this signal”** — Change: BrandIntelligenceHub and signal detail: primary CTA to create campaign with signal context. WO: MKT-POWER-01.
2. **Single marketing path** — Change: One canonical path to marketing (e.g. /portal/marketing); redirect or remove /portal/marketing-hub. WO: ROUTE-CLEANUP-WO.
3. **Campaign list: “From signal” badge** — Change: Campaigns created from a signal show which signal; improves attribution. WO: MKT-POWER-01 (extend).

### Education

1. **Certificate in one click at 100%** — Change: CoursePlayer at 100% shows “View Certificate” prominently (done); ensure no dead end. WO: EDU-POWER-01.
2. **CE strip with “Expiring soon”** — Change: Dashboard CE strip shows expiry countdown; CTA to renew or take course. WO: EDU-POWER-01.
3. **Course player skeleton everywhere** — Change: Every loading state in CoursePlayer is skeleton (no spinner); error/empty with retry. WO: EDU-POWER-01.

### Commerce

1. **“Commission-linked” on every affiliated product** — Change: ProductCard and product detail always show AffiliateDisclosureBadge when is_affiliated. WO: COMMERCE-POWER-01.
2. **Procurement reorder from intel** — Change: Reorder alerts or copy explicitly reference “based on demand signals” or link to intelligence (intel-informed, not commerce-led). WO: COMMERCE-POWER-01.
3. **One-click export with attribution** — Change: CSV export includes column “intel_signal_id” or “source” where applicable. WO: COMMERCE-POWER-01 (extend).

### Admin

1. **One dashboard: Health + Audit + Flags** — Change: Single admin view with tabs or sections: feed health, API status, audit log viewer, feature flags; all live data. WO: ADMIN-POWER-01.
2. **Audit log filter by action type** — Change: Filter audit log by admin/AI/entitlements and by date. WO: ADMIN-POWER-01.
3. **Feed health → quick action** — Change: From feed status, “Retry” or “View DLQ” where applicable. WO: ADMIN-POWER-01.

### Studio / CMS

1. **“New from feed” in AdminStoryDrafts** — Change: AdminStoryDrafts list shows drafts created from feeds; one-click “Edit” to Studio. WO: CMS-POWER-01.
2. **Editorial calendar placeholder** — Change: After CMS-WO-07, add “Scheduled” or “Draft” state in a simple calendar view (can be Phase 2). WO: CMS-WO-08/09.
3. **Version restore one click** — Change: VersionHistory already exists; ensure “Restore” is one click and updates current draft. WO: AUTH-CORE (already in); verify.

### Public Site

1. **Single pricing path** — Change: All upgrade/pricing CTAs go to /plans; /pricing redirects to /plans. WO: SITE-POWER-01, ROUTE-CLEANUP-WO.
2. **Persona CTA hierarchy** — Change: Each persona page: primary CTA intelligence-first (e.g. “See your market”), secondary “Upgrade” or “Plans.” WO: SITE-POWER-01.
3. **No orphans in nav** — Change: /home in nav or redirect to /intelligence; /for-medspas, /for-salons in nav or redirect. WO: SITE-POWER-01.

### Mobile / Tauri / PWA

1. **PWA install at right moment** — Change: Install prompt after value (e.g. after first signal view or first completed action); snooze 14 days. WO: MOBILE-POWER-01.
2. **Same gates as web** — Change: MODULE_* gates on Flutter hubs; no hub reachable without entitlement. WO: MOBILE-POWER-01.
3. **Hub screens LIVE or gated** — Change: No shell hub on main path; each hub either shows live data or upgrade prompt. WO: MOBILE-POWER-01.

---

## 5. TOP 10 COMPETITIVE RISKS IF WE SHIP WITHOUT ADDITIONAL UPGRADES

1. **Intelligence looks like a feed reader, not a decision platform** — No impact badge, no Today View default, no in-card action → users don’t triage or act; churn.
2. **CRM timeline not attributed** — Pros compare to Zenoti/GlossGenius; “where did this action come from?” unanswered → perceived as lightweight.
3. **Sales attribution invisible in pipeline** — Signal-influenced exists in DB but not in UI → sales doesn’t trust or use it; no proposal-from-signal.
4. **Journey 8 broken** — No signal→campaign CTA; dual marketing/pricing paths → confused positioning and lower conversion.
5. **Education Category C shell** — Any stub state on CoursePlayer or CE = shell detector fail and launch gate fail.
6. **Commerce as accidental backbone** — If reorder/procurement isn’t clearly intel-informed, we violate “intelligence first.”
7. **Admin fragmented** — No single “system health + audit + flags” view → ops and support harder; trust lower.
8. **CMS editorial manual-only** — No feed→draft→publish → content-from-intelligence story doesn’t scale.
9. **Public site route debt** — Orphans and dual pricing hurt SEO and conversion; persona CTAs weak.
10. **Mobile hubs shell or DEMO** — If Flutter hubs are shells on main path, mobile is not credible; MODULE_* not validated = entitlement leaks.

---

## 6. TOP 10 MUST-HAVE ADVANCED FEATURES TO BE CREDIBLE IN 2026

1. **Impact/confidence on every signal** — Not just “live”; percentile or tier so users prioritize (INTEL-POWER-01).
2. **“N similar” and dedup** — Clustering and expand so feed isn’t noisy (INTEL-POWER-02).
3. **Today View / Snapshot as default** — First screen = value, not raw list (INTEL-POWER-03).
4. **In-card action row** — Spot→Understand→Act without leaving feed (INTEL-POWER-04).
5. **Signal-attributed CRM timeline** — Actions linked to signal_id; rebooking from churn_risk_score (CRM-POWER-01, 02).
6. **Signal-influenced in pipeline and proposal** — Visible in Sales UI; proposal from signal (SALES-POWER-01).
7. **Signal→campaign CTA + single marketing path** — Journey 8 fixed; one path (MKT-POWER-01, ROUTE-CLEANUP).
8. **Feed→draft→publish CMS** — story_drafts, feeds-to-drafts, AdminStoryDrafts (CMS-POWER-01).
9. **Single dashboard for Admin** — Feed health + API + audit log + flags, real data (ADMIN-POWER-01).
10. **Single pricing path + persona CTA hierarchy** — No orphans; intelligence-first CTAs (SITE-POWER-01).

---

## 7. LINKS TO TIER 0/1 AND KEY AUDIT DOCS

### Tier 0

- `/.claude/CLAUDE.md` — Root governance; §0 read order, §9 stop conditions, §16 launch non-negotiables.

### Tier 1 (execution authority)

- `SOCELLE-WEB/docs/build_tracker.md` — Execution status; P0/P1/P2 queues; Product Power WO table.
- `SOCELLE-WEB/MASTER_STATUS.md` — Build health, hub readiness, LIVE/DEMO mix.
- `SOCELLE-WEB/docs/command/CONSOLIDATED_BUILD_PLAN.md` — Phase order, WO registry, non-negotiables.
- `SOCELLE_MASTER_BUILD_WO.md` (repo root) — Full acceptance criteria per WO (detail only; order = CONSOLIDATED).
- `SOCELLE-WEB/docs/command/V3_BUILD_PLAN.md` — WO-CMS-01..06 substeps (CMS detail only).
- `SOCELLE-WEB/docs/command/CMS_ARCHITECTURE.md` — CMS tables, admin routes, PageRenderer.
- `SOCELLE-WEB/docs/command/JOURNEY_STANDARDS.md` — Per-hub journeys and E2E requirements.
- `docs/command/SESSION_START.md` — Session entrypoint; proof rules; one WO per session.

### Key audit / ops docs

- `SOCELLE-WEB/docs/command/SOURCE_OF_TRUTH_MAP.md` — Authority tiers; §4 “where every detail lives.”
- `SOCELLE-WEB/docs/ops/APP_BY_APP_IDEA_MINING_UPGRADES.md` — Per-app competitors, table stakes, moat, upgraded WOs.
- `SOCELLE-WEB/docs/ops/PRODUCT_POWER_AUDIT.md` — Competitive research, “not the easy way.”
- `SOCELLE-WEB/docs/ops/AUDIT_SPRINT_SUMMARY.md` — Next WOs by ROI; Product Power + UX gate; split gate.
- `SOCELLE-WEB/docs/ops/NEXT_STEPS_AND_END_STATE_OUTLINE.md` — Next steps order; end result per platform; checklist.
- `SOCELLE-WEB/docs/qa/` — All verify_*.json artifacts; proof required here.

### Route / site map

- `docs/command/GLOBAL_SITE_MAP.md` — Canonical route map (if present; else see SOURCE_OF_TRUTH_MAP).

---

## 8. QUESTIONS PERPLEXITY MUST ANSWER

1. **Are we choosing the best tech + feature set for a category-leading platform, or just a convenient implementation?**  
   *Evaluate: POWER WOs vs “easiest split”; intelligence-first vs feature parity with legacy tools.*

2. **What are the biggest missing moat features per platform?**  
   *For each of Intelligence, CRM, Sales, Marketing, Education, Commerce, Admin, Studio/CMS, Public Site, Mobile: what would make us defensible vs Valona, Zenoti, Gong, HubSpot, etc.?*

3. **Which upgrades will produce the biggest lift in activation, retention, and paid conversion?**  
   *Rank: INTEL-POWER-01..05, CRM-POWER-01/02, SALES-POWER-01, MKT-POWER-01, EDU-POWER-01, COMMERCE-POWER-01, ADMIN-POWER-01, CMS-POWER-01, SITE-POWER-01, MOBILE-POWER-01, plus UX growth items in §4.*

4. **What should we change now before coding to avoid rework later?**  
   *Scope cuts, sequence changes, missing validators, or doc/contract changes.*

---

*End of PERPLEXITY_HANDOVER_PACKET. Perplexity Computer takes over all planning and code edits after: app-by-app idea mining done externally, WOs upgraded per platform, UX growth upgrades specified and governed, this packet complete, and Q1–Q4 answered. Until then, complete validation only; then proceed as primary executor.*
