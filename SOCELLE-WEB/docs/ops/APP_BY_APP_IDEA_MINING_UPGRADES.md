# APP-BY-APP IDEA MINING UPGRADES — COMPETITIVE + WHAT WE MUST SHIP

**Generated:** 2026-03-13  
**Authority:** `/.claude/CLAUDE.md`; `SOCELLE-WEB/docs/build_tracker.md`; `SOCELLE-WEB/docs/ops/PRODUCT_POWER_AUDIT.md`.  
**Purpose:** Per-app competitive landscape, table-stakes vs moat, best-in-class UX patterns, "what we must ship" upgrades, and upgraded WOs with proof pack paths. No easy-split shortcuts — execution truth = build_tracker + verify_*.json.

---

## 1. INTELLIGENCE APP

### 1.1 Competitors (5–10)

| Competitor | Domain | Notes |
|------------|--------|--------|
| Valona Intelligence | valonaintelligence.com | Real-time market intelligence, 200k+ sources, Forrester Wave Leader 2024 |
| AeraVision | aeravision.com | AI news monitoring, signal extraction, Slack/Teams alerts |
| Glint | joinglint.com | Real-time AI monitoring, custom dashboards, tiered pricing |
| 6sense | 6sense.com | Signalverse, 1T signals, revenue platform |
| Crayon | crayon.co | Compete Hub, Crayon Answers, Sparks |
| Hindsight | usehindsight.com | Battlecards, Slack distribution, win-rate lift |
| Signal Labs | usesignallabs.com | Competitive enablement, battlecards, same-day implementation |

*See also PRODUCT_POWER_AUDIT.md §1 for full source table.*

### 1.2 Table-stakes vs moat

- **Table stakes:** Real-time or near-real-time feed refresh with freshness indicators; dedup/clustering ("N similar"); role/vertical views (medspa vs salon vs brand); source attribution and confidence on every signal; alerts and saved searches; export (CSV); clear LIVE vs DEMO labeling.
- **Moat:** Early-warning detection (3–6 months ahead); AI summarization without replacing source (intelligence-first); cross-hub action arc (Spot→Understand→Act); vertical benchmarks and peer comparison; same-day implementation; credit-based AI with clear tier gates.

### 1.3 Best-in-class UX patterns

- Automated monitoring that surfaces fresh insights without manual assembly (Valona, B2B dashboard best practices).
- Actionable insights over raw data: concise summaries with strategic implications; filter by competitor/market/geo/timeline; deep-linkable views.
- Progressive disclosure: Today View / Snapshot as default entry; "N similar" expand; in-card "Take action" row.

### 1.4 What we must ship

- Impact badge on every signal card (list + detail); "N similar" dedup UI + expand; Today View / Snapshot as default entry; in-card "Take action" row (CrossHubActionDispatcher); sentiment aggregate banner + More filters.

### 1.4b Completed global upgrades

- **INTEL-GLOBAL-01 (2026-03-11):** Global Intelligence Expansion — activated 34 dormant feeds + inserted 49 new global sources across APAC (Korea/Japan/SEA/India/Australia), Europe (UK/France/EU regulatory/journals), AI+Beauty Tech (CosmeticsDesign/arXiv/VentureBeat/FDA), Reddit RSS (8 subreddits), PubMed/Google Trends/FTC. Total enabled feeds ~190. Migration: `20260311043000_global_intelligence_expansion.sql`.

### 1.5 Upgraded WOs

| WO ID | Scope | Acceptance criteria | Proof pack | Dependencies | Est. effort |
|-------|--------|---------------------|------------|--------------|-------------|
| INTEL-POWER-01 | Impact badge on every signal card (list + detail) | Badge on SignalCardFeatured + SignalCardStandard; percentile or tier label | `docs/qa/verify_INTEL-POWER-01_*.json`; design-lock-enforcer | IDEA_MINING Pattern 1 | 1–2 d |
| INTEL-POWER-02 | "N similar" dedup UI + expand | Collapse badge per cluster; expand to show sources | `docs/qa/verify_INTEL-POWER-02_*.json`; intelligence-merchandiser | FEED-WO-03 (fingerprint/is_duplicate) | 2 d |
| INTEL-POWER-03 | Today View / Snapshot as default entry | `/intelligence` or portal default tab = Snapshot; vertical KPIs | `docs/qa/verify_INTEL-POWER-03_*.json` | INTEL-WO-11, KPIStrip | 1 d |
| INTEL-POWER-04 | In-card "Take action" row (Spot→Understand→Act) | Every signal card has action row; CrossHubActionDispatcher linked | `docs/qa/verify_INTEL-POWER-04_*.json`; cross-hub-dispatcher-validator | INTEL-WO-07 | 1–2 d |
| INTEL-POWER-05 | Sentiment aggregate banner + More filters | Banner above feed; "More filters" panel (date, impact, source) | `docs/qa/verify_INTEL-POWER-05_*.json` | useIntelligence signalTypes | 1 d |

---

## 2. CRM APP

### 2.1 Competitors (5–10)

| Competitor | Domain | Notes |
|------------|--------|--------|
| Zenoti | zenoti.com | Salon/spa/medspa OS, 30k+ customers, AI growth tools |
| GlossGenius | glossgenius.com | Salon/spa software, booking, POS, AI marketing, 75%+ rebooking |
| Boulevard | boulevard.com | Salon/spa platform, membership, retail |
| Mindbody | mindbodyonline.com | Wellness/salon booking, payments, marketing |
| Fresha | fresha.com | Booking, payments, marketplace |
| Square Appointments | squareup.com | Scheduling, POS, CRM-lite |

### 2.2 Table-stakes vs moat

- **Table stakes:** Contact timeline; consent audit trail; rebooking engine; churn risk visibility; calendar/booking integration.
- **Moat:** Signal-attributed timeline (market_signals → contact actions); rebooking recommendation from churn_risk_score and intelligence; no manual "source" tags — use signal_id from feed.

### 2.3 Best-in-class UX patterns

- Unified contact timeline with attributed actions (Zenoti/GlossGenius-level); consent log with agreed_at, IP, user_agent; rebooking CTA from churn risk.

### 2.4 What we must ship

- Contact timeline + signal attribution; consent audit + rebooking engine wired to churn_risk_score and signal_id.

### 2.5 Upgraded WOs

| WO ID | Scope | Acceptance criteria | Proof pack | Dependencies | Est. effort |
|-------|--------|---------------------|------------|--------------|-------------|
| CRM-POWER-01 | Contact timeline + signal attribution | Timeline shows signal_id-attributed actions; churn risk + rebooking CTA | `docs/qa/verify_CRM-POWER-01_*.json` | CRM-WO-07/08/09 | 2 d |
| CRM-POWER-02 | Consent audit + rebooking engine | crm_consent_log wired; rebooking recommendation from churn_risk_score | `docs/qa/verify_CRM-POWER-02_*.json` | CRM-WO-07 | 1–2 d |

---

## 3. SALES APP

### 3.1 Competitors (5–10)

| Competitor | Domain | Notes |
|------------|--------|--------|
| Signal Labs | usesignallabs.com | Competitive enablement, battlecards, same-day implementation |
| Crayon | crayon.co | Compete Hub, deal attribution, Sparks |
| Hindsight | usehindsight.com | Battlecards, win-rate lift |
| Gong | gong.io | Revenue intelligence, deal analytics |
| Clari | clari.com | Pipeline, forecasting, signal-driven |
| 6sense | 6sense.com | Signalverse, revenue platform |

### 3.2 Table-stakes vs moat

- **Table stakes:** Deal pipeline; proposal builder; revenue analytics; pipeline stages.
- **Moat:** Signal-influenced deals metric (signal_id → deal → revenue); proposal builder with signal context; attribution in pipeline and reporting, not just "create deal."

### 3.3 Best-in-class UX patterns

- Deal attribution to intelligence signals; revenue analytics with "Signal-Influenced Deals" segment; proposal builder pre-filled from signal context.

### 3.4 What we must ship

- Deal attribution + revenue analytics; proposal builder with signal context; Signal-Influenced Deals in reporting.

### 3.5 Upgraded WOs

| WO ID | Scope | Acceptance criteria | Proof pack | Dependencies | Est. effort |
|-------|--------|---------------------|------------|--------------|-------------|
| SALES-POWER-01 | Deal attribution + revenue analytics | Signal-influenced deals metric; proposal builder with signal context | `docs/qa/verify_SALES-POWER-01_*.json` | SALES-WO-05/08 | 1–2 d |

---

## 4. MARKETING APP

### 4.1 Competitors (5–10)

| Competitor | Domain | Notes |
|------------|--------|--------|
| HubSpot | hubspot.com | Campaigns, automation, attribution |
| Mailchimp | mailchimp.com | Email, campaigns, segments |
| Klaviyo | klaviyo.com | Ecommerce marketing, flows |
| Zenoti / GlossGenius | — | In-app marketing, rebooking, retention |
| 6sense | 6sense.com | ABM, signal-driven campaigns |

### 4.2 Table-stakes vs moat

- **Table stakes:** Campaign creation; segments; email/SMS; calendar.
- **Moat:** Signal → campaign CTA (Journey 8 unbroken); single marketing path; campaign created from intelligence signal (fix DEBT-04).

### 4.3 Best-in-class UX patterns

- One path to marketing (no dual /portal/marketing vs /portal/marketing-hub); CTA from BrandIntelligenceHub / signal detail to "Create campaign from this signal."

### 4.4 What we must ship

- Signal → campaign CTA; fix DEBT-04; single marketing route; CTA-validator pass.

### 4.5 Upgraded WOs

| WO ID | Scope | Acceptance criteria | Proof pack | Dependencies | Est. effort |
|-------|--------|---------------------|------------|--------------|-------------|
| MKT-POWER-01 | Signal → campaign CTA (fix DEBT-04) | BrandIntelligenceHub / portal marketing: CTA from signal to campaign creation | `docs/qa/verify_MKT-POWER-01_*.json`; cta-validator | ROUTE-CLEANUP (dual marketing paths) | 1–2 d |

---

## 5. EDUCATION APP

### 5.1 Competitors (5–10)

| Competitor | Domain | Notes |
|------------|--------|--------|
| Zenoti | zenoti.com | Learning, CE, brand training |
| Mindbody | mindbodyonline.com | Staff training, certifications |
| TalentLMS | talentlms.com | LMS, CE, certificates |
| Teachable / Thinkific | — | Course player, progress, certificates |
| SCORM-based platforms | — | Interoperable learning objects |

### 5.2 Table-stakes vs moat

- **Table stakes:** Course player with loading/error/empty states; CE credits on dashboard; certificate flow; no Category C shell.
- **Moat:** Protocol-backed education; intelligence-informed curriculum; CE tracking with expiry warnings.

### 5.3 Best-in-class UX patterns

- Course player: skeleton shimmer, error + retry, empty state; certificate view when progress = 100%; CE credits strip with "expiring soon."

### 5.4 What we must ship

- CE credits + course player states (loading/error/empty); certificate flow; no Category C shell on CoursePlayer.

### 5.5 Upgraded WOs

| WO ID | Scope | Acceptance criteria | Proof pack | Dependencies | Est. effort |
|-------|--------|---------------------|------------|--------------|-------------|
| EDU-POWER-01 | CE credits + course player states | Loading/error/empty on CoursePlayer; certificate flow; CE on dashboard | `docs/qa/verify_EDU-POWER-01_*.json`; hub-shell-detector | EDU-WO-02/05 | 1 d |

---

## 6. COMMERCE / PROCUREMENT APP

### 6.1 Competitors (5–10)

| Competitor | Domain | Notes |
|------------|--------|--------|
| DataHawk | datahawk.co | Marketplace analytics, multi-channel |
| Zenoti / GlossGenius | — | Retail, inventory, reorder |
| Square / Toast | — | POS, inventory, procurement-lite |
| NetSuite / SAP | — | Enterprise procurement |
| Affiliate platforms | — | FTC disclosure, commission tracking |

### 6.2 Table-stakes vs moat

- **Table stakes:** FTC affiliate badges on product cards; procurement dashboard; reorder alerts; CSV export.
- **Moat:** Commerce never becomes IA backbone; intelligence informs procurement (reorder alerts, product intelligence), not the other way around.

### 6.3 Best-in-class UX patterns

- Affiliate disclosure badge on every affiliated product; procurement KPI strip; reorder alerts table; clear "Commission-linked" labeling.

### 6.4 What we must ship

- Affiliate compliance + product intelligence; FTC badges; procurement dashboard with reorder alerts.

### 6.5 Upgraded WOs

| WO ID | Scope | Acceptance criteria | Proof pack | Dependencies | Est. effort |
|-------|--------|---------------------|------------|--------------|-------------|
| COMMERCE-POWER-01 | Affiliate compliance + product intelligence | Affiliate badges on product cards; procurement dashboard with reorder alerts | `docs/qa/verify_COMMERCE-POWER-01_*.json`; affiliate-link-tracker-auditor | COMMERCE-WO-03/07 | 1 d |

---

## 7. ADMIN APP

### 7.1 Competitors (5–10)

| Competitor | Domain | Notes |
|------------|--------|--------|
| Zenoti / GlossGenius | — | Admin dashboards, reporting, settings |
| Stripe Dashboard | stripe.com | Billing, usage, logs |
| Sentry / Datadog | — | Errors, health, audit trails |
| Retool / Internal tools | — | Admin UIs, feed health, feature flags |

### 7.2 Table-stakes vs moat

- **Table stakes:** System health view; feed health; API status; audit log viewer; feature flags.
- **Moat:** Real telemetry (feed health, API status, audit log) — not static copy; system-health-dashboard-validator pass.

### 7.3 Best-in-class UX patterns

- Single admin dashboard: feed health, API status, audit log, feature flags; live data, not placeholders.

### 7.4 What we must ship

- System health + feeds + audit log dashboard with real data.

### 7.5 Upgraded WOs

| WO ID | Scope | Acceptance criteria | Proof pack | Dependencies | Est. effort |
|-------|--------|---------------------|------------|--------------|-------------|
| ADMIN-POWER-01 | System health + feeds + audit log | Dashboard: feed health, API status, audit log viewer, feature flags (real data) | `docs/qa/verify_ADMIN-POWER-01_*.json`; system-health-dashboard-validator | CTRL-WO-01..04 | 1–2 d |

---

## 8. STUDIO / CMS APP

### 8.1 Competitors (5–10)

| Competitor | Domain | Notes |
|------------|--------|--------|
| Contentful / Sanity | — | Headless CMS, blocks, versioning |
| Notion | notion.so | Blocks, templates, export |
| Canva | canva.com | Visual editor, templates, export |
| Ceros | ceros.com | Interactive content, experiences |
| Storyblok | storyblok.com | Component-based CMS |

### 8.2 Table-stakes vs moat

- **Table stakes:** Editorial rail; story drafts; ingest → draft → publish path; version history; block types; LIVE intelligence blocks.
- **Moat:** Feeds-to-drafts automation; EmbedIntelligenceBlock (live market_signals); no manual-only content pipeline.

### 8.3 Best-in-class UX patterns

- Draft/published/archived states; version history with restore; block-based editor; data-bound blocks (e.g. intelligence).

### 8.4 What we must ship

- Editorial rail + story drafts (complete CMS-WO-07); feeds-to-drafts; AdminStoryDrafts live; full ingest → draft → publish path.

### 8.5 Upgraded WOs

| WO ID | Scope | Acceptance criteria | Proof pack | Dependencies | Est. effort |
|-------|--------|---------------------|------------|--------------|-------------|
| CMS-POWER-01 | Editorial rail + story drafts (complete CMS-WO-07) | story_drafts migration; feeds-to-drafts; AdminStoryDrafts live; no shell | `docs/qa/verify_CMS-WO-07_*.json`; authoring-core-schema-validator | e0a2c40 prep | 2 d |

---

## 9. PUBLIC SITE (MARKETING / LANDING)

### 9.1 Competitors (5–10)

| Competitor | Domain | Notes |
|------------|--------|--------|
| Unbounce / Leadpages | — | Landing pages, CTAs, conversion |
| Webflow | webflow.com | Design-led landing, SEO |
| HubSpot / Marketing sites | — | Persona pages, SEO, CTAs |
| Segment / GTM | — | Attribution, consent |
| SOCELLE persona pages | — | for-brands, for-medspas, for-salons, for-professionals |

### 9.2 Table-stakes vs moat

- **Table stakes:** Persona landing pages with intelligence-first framing; clear CTAs; SEO (meta, OG, canonical); no commerce-first above fold; consent/banner where required.
- **Moat:** Trend-first phrasing; single pricing/plans path; no orphan routes; CTA hierarchy (intelligence-first, then upgrade).

### 9.3 Best-in-class UX patterns

- One /plans (or /pricing) path; persona pages with consistent nav and CTA; SEO audit pass; no "Shop Now" on intelligence surfaces (§9 STOP).

### 9.4 What we must ship

- ROUTE-CLEANUP: single pricing path; resolve /home, /for-* orphans; dual marketing path resolved; CTA hierarchy; persona-page-validator pass.

### 9.5 Upgraded WOs

| WO ID | Scope | Acceptance criteria | Proof pack | Dependencies | Est. effort |
|-------|--------|---------------------|------------|--------------|-------------|
| SITE-POWER-01 | Route cleanup + persona CTA hierarchy | Single /plans; persona pages CTAs present; no commerce on intelligence surfaces; GLOBAL_SITE_MAP aligned | `docs/qa/verify_SITE-POWER-01_*.json`; persona-page-validator; cta-validator | LANE-A-DEBT-03, ROUTE-CLEANUP | 1–2 d |

---

## 10. MOBILE / TAURI / PWA

### 10.1 Competitors (5–10)

| Competitor | Domain | Notes |
|------------|--------|--------|
| Zenoti / GlossGenius apps | — | Native or hybrid, booking, notifications |
| React Native / Flutter | — | Cross-platform patterns |
| Tauri | tauri.app | Desktop shell, small footprint |
| PWA (e.g. Starbucks, Twitter Lite) | — | Install prompt, offline, push |

### 10.2 Table-stakes vs moat

- **Table stakes:** MODULE_* keys for entitlement; hub screens (brands, jobs, events, studio); app_router wired; PWA: sw.js, install prompt, VAPID.
- **Moat:** Feature parity with web for core journeys; same intelligence-first UX; no shell hubs on mobile.

### 10.3 Best-in-class UX patterns

- Install prompt with snooze; push subscription; same nav and entitlement gates as web; responsive breakpoints.

### 10.4 What we must ship

- MOBILE-WO completion: all hub screens LIVE or gated; MODULE keys validated; PWA install + push wired; Tauri shell stable.

### 10.5 Upgraded WOs

| WO ID | Scope | Acceptance criteria | Proof pack | Dependencies | Est. effort |
|-------|--------|---------------------|------------|--------------|-------------|
| MOBILE-POWER-01 | Mobile/Tauri/PWA parity + MODULE gates | Flutter hubs LIVE or gated; MODULE_* validator pass; PWA install + push; Tauri shell | `docs/qa/verify_MOBILE-POWER-01_*.json`; mobile-module-key-validator | MOBILE-WO, TAURI-WO-01, PWA-WO-01/02/03 | 2–3 d |

---

## 11. VALIDATION GATE

**Question:** Is this plan best for SOCELLE as a leading technology company — or just the easiest split?

**Answer:** This plan prioritizes product power (intelligence as intelligence, cross-hub action, provenance, vertical UX) and competitive table stakes. Next WOs are chosen by **ROI + competitive advantage**, not convenience. Split/packaging is gated on Product Power + UX readiness (see AUDIT_SPRINT_SUMMARY.md §5).

---

## 12. PROOF PACK RULE

Every upgraded WO above must have a verification artifact at `SOCELLE-WEB/docs/qa/verify_<WO_ID>_*.json` with `overall: "PASS"`. No WO is DONE without tsc=0, build=PASS, and required skills run. Execution truth = build_tracker + verify_*.json (not older plans). See SESSION_START.md §4.

---

*End of APP_BY_APP_IDEA_MINING_UPGRADES. Reuses and cites PRODUCT_POWER_AUDIT.md; expanded with Public Site and Mobile/Tauri/PWA; all WOs registered in build_tracker.md.*
