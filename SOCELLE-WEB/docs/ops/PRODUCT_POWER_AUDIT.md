# PRODUCT POWER AUDIT — COMPETITIVE UPGRADE MAP

**Generated:** 2026-03-13 (AUDIT + IDEA MINING + AGENT UPSKILL — commit anchor d1442d3)  
**Authority:** `/.claude/CLAUDE.md` §2–§4; `SOCELLE-WEB/docs/build_tracker.md`; `SOCELLE-WEB/docs/ops/IDEA_MINING_IMPLEMENTATION_MAP.md`.  
**Purpose:** Product-power-first execution plan; competitive benchmarking; upgraded WOs per hub; "not the easy way" — data power + advanced features + UX.

---

## 1. COMPETITIVE IDEA MINING — SOURCES

Research covered: intelligence feeds/dashboards, B2B market intelligence, operator OS (salon/medspa), marketplace enablement, competitive enablement.

| Source | URL | Domain |
|--------|-----|--------|
| Valona Intelligence | https://valonaintelligence.com/ | Real-time market intelligence, 200k+ sources, early warning |
| Valona Platform | https://valonaintelligence.com/platform | Forrester Wave Leader 2024 |
| AeraVision | https://aeravision.com/ai-powered-news-and-web-monitoring-platform-for-competitive-market-intelligence/ | AI news monitoring, signal extraction, Slack/Teams alerts |
| Glint | https://joinglint.com/ | Real-time AI monitoring, custom dashboards, tiered pricing |
| 6sense | https://6sense.com/platform/ | Signalverse, 1T signals, revenue platform |
| Zenoti | https://www.zenoti.com/salon-international | Salon/spa/medspa OS, 30k+ customers, AI growth tools |
| GlossGenius | https://oropelbeauty.glossgenius.com/about | Salon/spa software, booking, POS, AI marketing |
| Signal Labs | http://usesignallabs.com/ | Competitive enablement, battlecards, same-day implementation |
| Crayon | https://www.crayon.co/product/enable | Compete Hub, Crayon Answers, Sparks |
| Hindsight | https://www.usehindsight.com/competitive-enablement | Battlecards, Slack distribution, win-rate lift |
| DataHawk | https://datahawk.co/platform/ | Marketplace analytics, multi-channel, revenue lift |

---

## 2. TOP PATTERNS (TABLE STAKES VS MOAT)

**Table stakes (must have):**
- Real-time or near-real-time feed refresh with clear freshness indicators.
- Deduplication / clustering (e.g. "N similar" or one canonical card per story).
- Role- or vertical-specific views (medspa vs salon vs brand).
- Source attribution and confidence/provenance on every signal.
- Alerts and saved searches that drive re-engagement.
- Export (CSV minimum) and clear LIVE vs DEMO labeling.

**Moat / differentiators:**
- Early-warning detection (e.g. 3–6 months ahead) from structured + unstructured signals.
- AI summarization and briefs without replacing the source (SOCELLE: intelligence-first, not black-box).
- Cross-hub action arc: signal → CRM deal, campaign, education, procurement (Spot→Understand→Act).
- Vertical benchmarks and peer comparison (e.g. "Your metric vs vertical median").
- Same-day or fast implementation vs 3–6 month enterprise rollouts (operator-friendly).
- Credit-based AI with clear cost and tier gates (no surprise burn).

**Anti-patterns (avoid):**
- Boolean query as primary search (prefer filters + facets + semantic).
- Blank widget canvas or static PDF as primary delivery.
- Self-reported benchmark data with no audit trail.
- Feature-first positioning over outcome/ROI (intelligence-first only).

---

## 3. UPGRADED WOs BY HUB (PRODUCT POWER FIRST)

### Intelligence App

| WO ID | Feature | Why it matters | Acceptance criteria | Proof pack | Dependencies | Not the easy way |
|-------|---------|----------------|---------------------|------------|--------------|------------------|
| INTEL-POWER-01 | Impact badge on every signal card (list + detail) | Table stakes; comparables show impact/priority on every item | Badge on SignalCardFeatured + SignalCardStandard; percentile or tier label | verify_INTEL-POWER-01_*.json; design-lock-enforcer | IDEA_MINING Pattern 1 | Full impact_score + confidence in UI, not just detail page |
| INTEL-POWER-02 | "N similar" dedup UI + expand | Reduces noise; Valona/AeraVision-style clustering | Collapse badge per cluster; expand to show sources | verify_INTEL-POWER-02_*.json; intelligence-merchandiser | FEED-WO-03 (fingerprint/is_duplicate) | Real clustering UI, not just filtering duplicates out |
| INTEL-POWER-03 | Today View / Snapshot as default entry | Situational awareness at a glance | `/intelligence` or portal default tab = Snapshot; vertical KPIs | verify_INTEL-POWER-03_*.json | INTEL-WO-11, KPIStrip | Portal intelligence LIVE, not DEMO |
| INTEL-POWER-04 | In-card "Take action" row (Spot→Understand→Act) | Cross-hub action arc; Crayon/Hindsight-style "what to do" | Every signal card has action row; CrossHubActionDispatcher linked | verify_INTEL-POWER-04_*.json; cross-hub-dispatcher-validator | INTEL-WO-07 | Action on card, not 2 clicks deep |
| INTEL-POWER-05 | Sentiment aggregate banner + More filters | Table stakes for feed UX | Banner above feed; "More filters" panel (date, impact, source) | verify_INTEL-POWER-05_*.json | useIntelligence signalTypes | Full filter dimensions, not just 2 |

### CRM App

| WO ID | Feature | Why it matters | Acceptance criteria | Proof pack | Dependencies | Not the easy way |
|-------|---------|----------------|---------------------|------------|--------------|------------------|
| CRM-POWER-01 | Contact timeline + signal attribution | Zenoti/GlossGenius-level timeline; signal → contact link | Timeline shows signal_id-attributed actions; churn risk + rebooking CTA | verify_CRM-POWER-01_*.json | CRM-WO-07/08/09 | Real attribution from market_signals, not manual tag |
| CRM-POWER-02 | Consent audit + rebooking engine | Compliance + retention | crm_consent_log wired; rebooking recommendation from churn_risk_score | verify_CRM-POWER-02_*.json | CRM-WO-07 | Full consent trail and actionable rebooking |

### Sales App

| WO ID | Feature | Why it matters | Acceptance criteria | Proof pack | Dependencies | Not the easy way |
|-------|---------|----------------|---------------------|------------|--------------|------------------|
| SALES-POWER-01 | Deal attribution + revenue analytics | Signal Labs/Crayon: signal → deal → revenue | Signal-influenced deals metric; proposal builder with signal context | verify_SALES-POWER-01_*.json | SALES-WO-05/08 | Attribution in pipeline and reporting, not just create deal |

### Marketing App

| WO ID | Feature | Why it matters | Acceptance criteria | Proof pack | Dependencies | Not the easy way |
|-------|---------|----------------|---------------------|------------|--------------|------------------|
| MKT-POWER-01 | Signal → campaign CTA (fix DEBT-04) | Journey 8 unbroken; campaign from intelligence | BrandIntelligenceHub / portal marketing: CTA from signal to campaign creation | verify_MKT-POWER-01_*.json; cta-validator | ROUTE-CLEANUP (dual marketing paths) | Single marketing path + signal-to-campaign |

### Education App

| WO ID | Feature | Why it matters | Acceptance criteria | Proof pack | Dependencies | Not the easy way |
|-------|---------|----------------|---------------------|------------|--------------|------------------|
| EDU-POWER-01 | CE credits + course player states | Zenoti-style learning; no Category C shell | Loading/error/empty on CoursePlayer; certificate flow; CE on dashboard | verify_EDU-POWER-01_*.json; hub-shell-detector | EDU-WO-02/05 | Full state coverage, not stub |

### Commerce / Procurement App

| WO ID | Feature | Why it matters | Acceptance criteria | Proof pack | Dependencies | Not the easy way |
|-------|---------|----------------|---------------------|------------|--------------|------------------|
| COMMERCE-POWER-01 | Affiliate compliance + product intelligence | DataHawk-style clarity; FTC badges | Affiliate badges on product cards; procurement dashboard with reorder alerts | verify_COMMERCE-POWER-01_*.json; affiliate-link-tracker-auditor | COMMERCE-WO-03/07 | Commerce never becomes IA backbone; intelligence informs, does not replace |

### Admin App

| WO ID | Feature | Why it matters | Acceptance criteria | Proof pack | Dependencies | Not the easy way |
|-------|---------|----------------|---------------------|------------|--------------|------------------|
| ADMIN-POWER-01 | System health + feeds + audit log | Operator OS visibility | Dashboard: feed health, API status, audit log viewer, feature flags | verify_ADMIN-POWER-01_*.json; system-health-dashboard-validator | CTRL-WO-01..04 | Real telemetry, not static copy |

### Studio / CMS

| WO ID | Feature | Why it matters | Acceptance criteria | Proof pack | Dependencies | Not the easy way |
|-------|---------|----------------|---------------------|------------|--------------|------------------|
| CMS-POWER-01 | Editorial rail + story drafts (complete CMS-WO-07) | Content pipeline from feed to publish | story_drafts migration; feeds-to-drafts; AdminStoryDrafts live; no shell | verify_CMS-WO-07_*.json; authoring-core-schema-validator | e0a2c40 prep | Full ingest → draft → publish path, not manual only |

---

## 4. EXPLICIT "NOT THE EASY WAY" CALLOUTS

- **Intelligence:** Do not ship "impact in detail only" — list cards must show impact/confidence. Do not hide dedup — show "N similar" and let users expand. Do not keep portal intelligence as DEMO — wire live.
- **CRM:** Do not add manual "source" tags — use signal_id attribution from market_signals.
- **Sales:** Do not treat attribution as optional — it must flow into pipeline and revenue analytics.
- **Marketing:** Do not leave dual marketing routes; do not skip signal→campaign CTA (DEBT-04).
- **Education:** Do not ship CoursePlayer without loading/error/empty (Category C shell).
- **Commerce:** Do not make commerce the IA backbone; keep intelligence as input to procurement, not the other way around.
- **Admin:** Do not ship dashboards without real feed/API/audit data.
- **CMS:** Do not rely on manual content only — story_drafts + feeds-to-drafts must be fully wired and verified.

---

## 5. VALIDATION GATE

**Question:** Is this plan best for the future of SOCELLE as a leading technology company — or just the easiest split?

**Answer:** This plan prioritizes product power (intelligence as intelligence, not links; cross-hub action; provenance and confidence; vertical and operator-centric UX) and aligns with competitive table stakes and differentiators. Split/packaging is downstream of these WOs. It is not the easiest split — it gates split on Product Power + UX readiness.

---

*End of PRODUCT_POWER_AUDIT. Sources: URLs in §1; IDEA_MINING_IMPLEMENTATION_MAP.md; build_tracker.md.*
