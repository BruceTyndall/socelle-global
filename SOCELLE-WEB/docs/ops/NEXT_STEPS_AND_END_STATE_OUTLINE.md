# NEXT STEPS FORWARD — AND END RESULT PER PLATFORM/TOOL

**Created:** 2026-03-13  
**Authority:** `SOCELLE-WEB/docs/command/CONSOLIDATED_BUILD_PLAN.md`; `SOCELLE-WEB/docs/build_tracker.md`; `SOCELLE-WEB/docs/ops/APP_BY_APP_IDEA_MINING_UPGRADES.md`; `SOCELLE-WEB/docs/ops/AUDIT_SPRINT_SUMMARY.md`.  
**Purpose:** Single outline of (1) next steps in order and (2) what “done” looks like for each platform/tool before we move forward. Use this to align on scope and end state.

---

## PART 1 — NEXT STEPS FORWARD (IN ORDER)

### A. Immediate (gates / debt — do first)

| Step | What | End result |
|------|------|------------|
| P1-3 | Remove `brand-*` + `intel-*` from tailwind.config.js legacy token blocks | Token config clean; no legacy token references. |
| P2-1 | Upgrade @testing-library/react to ^17.x | 29 failing unit tests fixed (React 19 compat); 150+ tests passing. |
| DEBT-TANSTACK-REAL-6 | Migrate 6 files from raw `useEffect` + `supabase.from()` to useQuery | BusinessRulesView, ReportsView, MappingView, PlanOutputView, ServiceIntelligenceView, MarketingCalendarView all use TanStack Query; launch §16.23 satisfied. |

### B. Next 5 WOs by ROI (AUDIT_SPRINT_SUMMARY §4)

| Priority | WO | What | End result |
|----------|-----|------|------------|
| 1 | **CMS-WO-07 / CMS-POWER-01** | story_drafts migration + feeds-to-drafts + AdminStoryDrafts live | Editorial pipeline: feed → draft → publish; no CMS editorial shell; proof: verify_CMS-WO-07_*.json. |
| 2 | **DEBT-TANSTACK-REAL-6** | (see A above) | All data fetch via TanStack Query. |
| 3 | **INTEL-POWER-01** | Impact badge on every signal card (list + detail) | Every SignalCardFeatured + SignalCardStandard shows impact/percentile or tier; table stakes met. |
| 4 | **EVT-WO-02** | Add `/events/:slug` + EventDetail page | No dead end on events; journey 8 fix; shell count reduced. |
| 5 | **P1-3 + P2-1** | (see A above) | Token cleanup + test suite green. |

### C. Journey / route fixes (LANE-A debt)

| Step | What | End result |
|------|------|------------|
| LANE-A-DEBT-02 | TierGate upgrade CTA → Stripe checkout (not DEMO /pricing) | Paywall/upgrade leads to real checkout (PAY-WO scope). |
| LANE-A-DEBT-03 | Route cleanup: single pricing path; resolve /home, /for-* orphans; dual marketing paths → one | One /plans (or /pricing); no orphan routes; one marketing hub path. |
| LANE-A-DEBT-04 | Brand → Signal → Campaign CTA in BrandIntelligenceHub | MKT-POWER-01: signal-to-campaign CTA wired; Journey 8 unbroken. |

### D. Product Power WOs by app (after C above)

- **Intelligence:** INTEL-POWER-02 (“N similar” dedup UI), INTEL-POWER-03 (Today View default), INTEL-POWER-04 (in-card Take action), INTEL-POWER-05 (sentiment banner + More filters).
- **CRM:** CRM-POWER-01 (timeline + signal attribution), CRM-POWER-02 (consent audit + rebooking engine).
- **Sales:** SALES-POWER-01 (deal attribution + revenue analytics).
- **Marketing:** MKT-POWER-01 (signal → campaign CTA) — may be done with LANE-A-DEBT-04.
- **Education:** EDU-POWER-01 (CE credits + course player states; no Category C shell).
- **Commerce:** COMMERCE-POWER-01 (affiliate compliance + product intelligence).
- **Admin:** ADMIN-POWER-01 (system health + feeds + audit log dashboard, real data).
- **Studio/CMS:** CMS-POWER-01 (editorial rail + story drafts) — may be done with CMS-WO-07.
- **Public site:** SITE-POWER-01 (route cleanup + persona CTA hierarchy).
- **Mobile/Tauri/PWA:** MOBILE-POWER-01 (hub parity + MODULE gates + PWA + Tauri stable).

### E. Remaining partial / open (after D)

| Item | What | End result |
|------|------|------------|
| MERCH-INTEL-03 (remaining) | MERCH-01, MERCH-06, MERCH-10; migration 000027 DB apply if pending | Merchandising rules complete; DB in sync. |
| EVT-WO-01 | Events full LIVE (already partial) | Events list + detail fully live; no DEMO where data is real. |
| SEARCH-WO-02/03 | Faceted/semantic search (currently partial) | Search across hubs; save-to-alert where scoped. |
| P2-STRIPE | stripe_price_id set in Stripe dashboard | PAY-WO-05 complete; checkout uses real price IDs. |

### F. Launch gate (last)

| Step | What | End result |
|------|------|------------|
| V2-LAUNCH-01 | 24 launch non-negotiables (CLAUDE §16) | All items in §16 satisfied; proof pack. |
| V2-LAUNCH-02 | Launch comms — 72-hour window | Comms plan and assets ready. |

---

## PART 2 — END RESULT PER PLATFORM/TOOL (BEFORE WE MOVE FORWARD)

*“End result” = what “done” looks like for that platform/tool so we can move forward. Product Power + UX gates (AUDIT_SPRINT_SUMMARY §5) must be satisfied before split/packaging.*

### 1. Intelligence (web + portal)

| Outcome | Description |
|---------|-------------|
| **LIVE portal intelligence** | Portal intelligence surfaces use live `market_signals` (no DEMO where DB is wired). |
| **Impact/dedup/action on cards** | Every signal card shows impact badge (list + detail); “N similar” dedup UI with expand; in-card “Take action” row (CrossHubActionDispatcher). |
| **Today View / Snapshot entry** | Default entry to intelligence is Snapshot/Today View with vertical KPIs. |
| **Sentiment + filters** | Sentiment aggregate banner above feed; “More filters” (date, impact, source). |
| **Proof** | verify_INTEL-POWER-01 through 05; intelligence-merchandiser, design-lock-enforcer, cross-hub-dispatcher-validator. |

### 2. CRM

| Outcome | Description |
|---------|-------------|
| **Contact timeline + signal attribution** | Timeline shows actions linked to `signal_id`; churn risk + rebooking CTA visible. |
| **Consent audit + rebooking engine** | `crm_consent_log` wired and visible; rebooking recommendation from `churn_risk_score`. |
| **No manual-only “source”** | Attribution from `market_signals` (signal_id), not manual tags. |
| **Proof** | verify_CRM-POWER-01, verify_CRM-POWER-02. |

### 3. Sales

| Outcome | Description |
|---------|-------------|
| **Deal attribution + revenue analytics** | Signal-influenced deals metric in pipeline/reporting; proposal builder can use signal context. |
| **Proof** | verify_SALES-POWER-01. |

### 4. Marketing

| Outcome | Description |
|---------|-------------|
| **Signal → campaign CTA** | From BrandIntelligenceHub or signal detail, one CTA to create campaign from signal (fix DEBT-04). |
| **Single marketing path** | No dual /portal/marketing and /portal/marketing-hub; one canonical path. |
| **Proof** | verify_MKT-POWER-01; cta-validator. |

### 5. Education

| Outcome | Description |
|---------|-------------|
| **CE credits + course player states** | CoursePlayer has loading/error/empty states; certificate flow; CE on dashboard; no Category C shell. |
| **Proof** | verify_EDU-POWER-01; hub-shell-detector. |

### 6. Commerce / Procurement

| Outcome | Description |
|---------|-------------|
| **Affiliate compliance + product intelligence** | FTC badges on product cards; procurement dashboard with reorder alerts; commerce never replaces intelligence as backbone. |
| **Proof** | verify_COMMERCE-POWER-01; affiliate-link-tracker-auditor. |

### 7. Admin

| Outcome | Description |
|---------|-------------|
| **System health + feeds + audit log** | Dashboard shows feed health, API status, audit log viewer, feature flags — all real data, not static copy. |
| **Proof** | verify_ADMIN-POWER-01; system-health-dashboard-validator. |

### 8. Studio / CMS

| Outcome | Description |
|---------|-------------|
| **Editorial rail + story drafts** | story_drafts migration; feeds-to-drafts; AdminStoryDrafts live; full ingest → draft → publish path; no shell. |
| **Proof** | verify_CMS-WO-07_*.json; authoring-core-schema-validator. |

### 9. Public site (marketing / landing)

| Outcome | Description |
|---------|-------------|
| **Route cleanup + persona CTA hierarchy** | Single /plans (or /pricing); persona pages (for-brands, for-medspas, for-salons, for-professionals) with correct CTAs; no commerce on intelligence surfaces; GLOBAL_SITE_MAP aligned. |
| **Proof** | verify_SITE-POWER-01; persona-page-validator; cta-validator. |

### 10. Mobile / Tauri / PWA

| Outcome | Description |
|---------|-------------|
| **Flutter hubs** | All hub screens (brands, jobs, events, studio) LIVE or correctly gated. |
| **MODULE_* keys** | Entitlement keys validated; mobile-module-key-validator pass. |
| **PWA** | Install prompt + push (VAPID) wired; sw.js handlers correct. |
| **Tauri** | Desktop shell stable; package scripts and build verified. |
| **Proof** | verify_MOBILE-POWER-01; mobile-module-key-validator. |

### 11. Shared platform (not a “hub” — underpins all)

| Outcome | Description |
|---------|-------------|
| **Auth, entitlements, credits** | CTRL-WO-01..04, PAY-WO-01..05 done; entitlement chain verified; credit balance and gates correct. |
| **Routing** | GLOBAL_SITE_MAP and App routes aligned; no orphan routes once SITE-POWER-01 done. |
| **Build + proof** | tsc=0, build=PASS; every WO has docs/qa/verify_<WO_ID>_*.json with overall PASS where required. |

---

## PART 3 — GATE BEFORE SPLIT/PACKAGING

We do **not** package or split until (AUDIT_SPRINT_SUMMARY §5):

1. **Intelligence:** LIVE portal intelligence; impact/dedup/action on cards; Today View entry.
2. **No Category C shells** on critical journeys (CoursePlayer, protocols, marketing campaign).
3. **Signal→campaign and signal→deal** attribution wired.
4. **Proof packs** (tsc, build, verify_*.json) for all P1-head WOs.
5. **DOC-GOV-01** patches applied (authority chain unambiguous).

Until then, execution stays **single-codebase**; split is downstream.

---

## PART 4 — ONE-PAGE CHECKLIST (BEFORE WE MOVE FORWARD)

- [ ] P1-3 (tailwind token cleanup) done  
- [ ] P2-1 (testing-library upgrade) done  
- [ ] DEBT-TANSTACK-REAL-6 done  
- [ ] CMS-WO-07 / CMS-POWER-01 done (editorial pipeline)  
- [ ] INTEL-POWER-01 done (impact badge on cards)  
- [ ] EVT-WO-02 done (/events/:slug)  
- [ ] Route cleanup (SITE-POWER-01 / LANE-A-DEBT-03) done  
- [ ] Signal→campaign CTA (MKT-POWER-01 / LANE-A-DEBT-04) done  
- [ ] Product Power WOs for Intelligence (02–05), CRM (01–02), Sales (01), Education (01), Commerce (01), Admin (01), Mobile (01) either done or explicitly scheduled  
- [ ] Product Power + UX gate (§5) satisfied  
- [ ] DOC-GOV-01 patches applied  

*Use this outline to agree on next steps and end state per platform/tool before moving forward. Execution truth remains build_tracker + verify_*.json.*
