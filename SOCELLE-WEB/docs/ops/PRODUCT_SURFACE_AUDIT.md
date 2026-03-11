# PRODUCT SURFACE AUDIT — WHAT USERS ACTUALLY EXPERIENCE

**Generated:** 2026-03-13 (AUDIT + IDEA MINING + AGENT UPSKILL — commit anchor d1442d3)  
**Authority:** `/.claude/CLAUDE.md` §E; `SOCELLE-WEB/docs/build_tracker.md`; `SOCELLE-WEB/MASTER_STATUS.md` top.  
**Scope:** Public routes, portal routes, LIVE/DEMO with code evidence; top 10 journeys (broken/partial/complete + breakpoints); IDEA-MINING patterns in code vs docs-only.

---

## 1. PUBLIC ROUTES — LIVE/DEMO (CODE EVIDENCE)

| Route | Status | Evidence (file + line or verify path) |
|-------|--------|---------------------------------------|
| `/` (Home) | DEMO | Hardcoded `INTELLIGENCE_SIGNALS` array; CLAUDE §E; build_tracker P0-02 resolved but audit trail incomplete |
| `/intelligence` | LIVE | `useIntelligence()` → `market_signals`; isLive guard; `SOCELLE-WEB/src/pages/public/Intelligence.tsx` |
| `/brands` | LIVE | `brands` table; TanStack Query; MASTER_STATUS line 77 |
| `/brands/:slug` | LIVE | `brands` + `brand_seed_content` joined; MASTER_STATUS line 78 |
| `/education` | LIVE | `brand_training_modules`; DEMO badges on stats (mock aggregates) — MASTER_STATUS line 98 |
| `/protocols` | PARTIAL | `canonical_protocols`; Category C shell — missing error/loading/empty per FOUND-WO-04 |
| `/events` | PARTIAL LIVE | `events` table wired (076cb12); DEMO badge; `/events/:slug` missing — verify_LANE-A.json |
| `/jobs` | DEMO | Stub; job_postings not wired; MASTER_STATUS line 96 |
| `/for-brands`, `/for-medspas`, `/for-salons` | DEMO | Hardcoded STATS; MASTER_STATUS lines 79–81; for-medspas/for-salons orphan (no nav) |
| `/plans` | DEMO | Hardcoded TIERS; Stripe not wired; PAY-WO blocked |
| `/search` | PARTIAL | SearchPage.tsx 076cb12; brand+product only; no pgvector — build_tracker SEARCH-WO-02/03 partial |
| `/portal/intelligence` | DEMO | Heavy mock data; CLAUDE §E; IDEA_MINING_IMPLEMENTATION_MAP Pattern 2 |
| `/portal/crm`, `/portal/crm/consent` | LIVE | crm_contacts, crm_consent_log; verify_CRM-WO-07-09_2026-03-10T00-00-00-000Z.json |
| `/portal/education`, `/portal/procurement` | LIVE | EducationDashboard, ProcurementDashboard; verify_EDU-WO-02-05, verify_COMMERCE-WO-03-07 |
| `/portal/sales` | LIVE | OpportunityFinder + useIntelligence(); verify_TIER-BYPASS-FIX_2026-03-10.json |
| `/admin/intelligence`, `/admin/feeds` | LIVE | useAdminIntelligence; AdminFeedsHub; verify_LANE-A.json Journey 7 PASS |
| `/admin/story-drafts` | NEW | e0a2c40 — AdminStoryDrafts + story_drafts; CMS-WO-07 prep, not verified |

---

## 2. TOP 10 JOURNEYS — BROKEN / PARTIAL / COMPLETE (ROUTE BREAKPOINTS)

| # | Journey | Steps | Status | Breakpoint (exact route or step where it fails) |
|---|---------|-------|--------|-------------------------------------------------|
| 1 | Anonymous → Intelligence | `/` → `/intelligence` → sign in → `/portal/intelligence` | PARTIAL | Step 4: `/portal/intelligence` is DEMO (mock data) |
| 2 | Brand Discovery | `/brands` → `/brands/:slug` → contact/purchase | COMPLETE | — |
| 3 | Education | `/education` → `/education/:course` → CoursePlayer → Certificate | PARTIAL | CoursePlayer Category C shell (missing error/loading); Certificate CTA fixed (LANE-B) |
| 4 | Protocol Research | `/protocols` → `/protocols/:slug` | PARTIAL | `/protocols` Category C shell (no error/loading/empty) |
| 5 | CRM Contact | `/portal/crm` → list → ContactDetail → intelligence tab | COMPLETE | — |
| 6 | Deal Pipeline | `/portal/sales` → OpportunityFinder → CreateDeal (signal attribution) | COMPLETE | — |
| 7 | Admin Intelligence | `/admin/intelligence` → live signals, API health, feed status | COMPLETE | — |
| 8 | Marketing Campaign | `/portal/marketing` → signal → campaign | BROKEN | Dual routes `/portal/marketing` vs `/portal/marketing-hub/*`; no signal→campaign CTA (DEBT-04) |
| 9 | Brand Portal Intelligence | `/brand/intelligence` → market position | PARTIAL DEMO | Panels DEMO badges; underlying data mock |
| 10 | Procurement / Commerce | `/portal/procurement` → cart → checkout | PARTIAL | Procurement LIVE; Stripe checkout not wired; TierGate → DEMO /pricing (DEBT-02) |

---

## 3. IDEA-MINING PATTERNS — IMPLEMENTED IN CODE VS DOCS-ONLY

Source: `SOCELLE-WEB/docs/ops/IDEA_MINING_IMPLEMENTATION_MAP.md` (commit d1442d3). Authority: `docs/operations/STUDIO_IDEA_MINING_2026.md`.

| Pattern | In code | Docs-only | Evidence |
|---------|---------|-----------|----------|
| Impact Score Badge on every signal card | PARTIAL | List cards: no badge | Detail: `IntelligenceSignalDetail.tsx` ~346–356; list: `SignalCardFeatured` / `SignalCardStandard` no impact_score — IDEA_MINING_IMPLEMENTATION_MAP Pattern 1 |
| Snapshot / Today View entry | PARTIAL | Portal intelligence DEMO | `IntelligenceHome.tsx` at `/home`; KPIStrip on `/intelligence`; `/portal/intelligence` mock — Pattern 2 |
| Similarity dedup "N Similar" badge | DB only | No UI badge | `fingerprint`, `is_duplicate` in DB; `useIntelligence.ts` `.eq('is_duplicate', false)`; no collapse UI — Pattern 3 |
| List / Card view toggle | State only | No toggle UI | Filter state lifted (INTEL-UI-REMEDIATION-01); no List/Card button — Pattern 4 |
| Sentiment aggregate banner | No | — | No sentiment bar above feed — Pattern 5 |
| Spot→Understand→Act on every card | Detail only | No in-card action | CrossHubActionDispatcher on detail; no "Take action" row on feed cards — Pattern 6 |
| Entity chips on cards | No | — | related_brands/products not rendered as chips — Pattern 7 |
| Vertical-scoped KPI strip | Platform-wide only | No per-vertical | KPIStrip 4 KPIs platform-wide; no Medspa vs Salon breakdown — Pattern 8 |
| More filters expansion | No | — | 2 dimensions (vertical + category); no "More filters" panel — Pattern 9 |
| AI Brief Builder (bulk) | No | — | No multi-select or bulk brief — Pattern 10 |

---

*End of PRODUCT_SURFACE_AUDIT. All claims cite build_tracker, MASTER_STATUS, verify_*.json paths, or IDEA_MINING_IMPLEMENTATION_MAP.md + file paths.*
