# TOMORROW EXECUTION BRIEF
**Date:** 2026-03-13 (valid for next session)
**Authority:** `docs/build_tracker.md` (execution authority) + `docs/operations/OPERATION_BREAKOUT.md`
**Prepared by:** IDEA-MINING-01 session wrap-up

---

## 1) CURRENT GATE STATUS

### GUARDRAIL-01 — Intelligence UI Gate
| Verify Artifact | Status | File |
|----------------|--------|------|
| verify_AGENT_ACTIVATION.json | ✅ PASS | docs/qa/ |
| verify_INTEL_MERCH.json | ✅ PASS | docs/qa/ — 6 PASS, 6 WARN, 0 FAIL |
| verify_INTEL-UI-CLICK-IMAGE-01.json | ✅ PASS | docs/qa/ |
| verify_COVERAGE_EXPANSION.json | ✅ PASS | docs/qa/ |
| verify_MERCH-INTEL-02.json | ✅ PASS | docs/qa/ |
| verify_IDEA-MINING-01.json | ✅ PASS | docs/qa/ — committed 951fd5a |

**GUARDRAIL-01: ✅ CLEARED**

### P0 GATE — Master Platform Upgrade
| WO ID | Status | Proof |
|-------|--------|-------|
| MERCH-INTEL-03-DB | ✅ DONE | verify_MERCH-INTEL-03-DB.json |
| NEWSAPI-INGEST-01 | ✅ DONE | verify_NEWSAPI-INGEST-01.json (commit 6a43a75) |
| DB-TYPES-02 | ✅ DONE | verify_DB-TYPES-02.json (commit fbe7a60) |

**P0 GATE: ✅ COMPLETE**

### P1 GATE — Current open WOs
| WO ID | Status | Depends On |
|-------|--------|------------|
| CMS-WO-07 | OPEN | CMS-SEED-01 (DONE) |
| CMS-WO-08 | OPEN | CMS-WO-07 |
| CMS-WO-09 | OPEN | CMS-WO-08 |
| CMS-WO-10 | OPEN | CMS-WO-07 |
| CMS-WO-11 | OPEN | CMS-WO-07, CMS-WO-10 |
| CMS-WO-12 | OPEN | CMS-WO-10 |
| DATA-PRESS-PROOF | OPEN | NEWSAPI-INGEST-01, CMS-WO-07 |
| EVT-WO-02 | OPEN | P0 GATE |
| ROUTE-CLEANUP-WO | OPEN | P0 GATE |
| BRAND-SIGNAL-WO | OPEN | P0 GATE |
| PAY-UPGRADE-WO | BLOCKED | Owner must configure stripe_price_id |
| DEBT-TANSTACK-REAL-6 | OPEN | P0 GATE |
| MERCH-INTEL-03-FINAL | OPEN | MERCH-INTEL-03-DB |
| P1-3 | OPEN | P0 GATE |
| STATE-AUDIT-01 | OPEN | P0 GATE |
| INTEL-UI-REMEDIATION-01 | OPEN (GUARDRAIL-01 CLEARED) | IDEA-MINING-01 (DONE) |

### Missing verify artifacts (OPEN WOs have no proof yet — expected)
The following verify JSONs DO NOT EXIST and are expected to be created by the agent that executes each WO:
- verify_CMS-WO-07.json — MISSING (WO not started)
- verify_EVT-WO-02.json — MISSING (WO not started)
- verify_ROUTE-CLEANUP-WO.json — MISSING (WO not started)
- verify_BRAND-SIGNAL-WO.json — MISSING (WO not started)
- verify_DEBT-TANSTACK-REAL-6.json — MISSING (WO not started)
- verify_MERCH-INTEL-03-FINAL.json — MISSING (WO not started)
- verify_P1-3.json — MISSING (WO not started)
- verify_STATE-AUDIT-01.json — MISSING (WO not started)
- verify_INTEL-UI-REMEDIATION-01.json — MISSING (WO not started, GUARDRAIL-01 cleared)

---

## 2) WHAT IS ALLOWED TOMORROW

- ✅ **INTEL-UI-REMEDIATION-01** — server-side category filtering, image diversity, spotlightTrends 3→5. GUARDRAIL-01 cleared.
- ✅ **CMS-WO-07** — story_drafts table + feeds-to-drafts edge function (next P1 queue item)
- ✅ **MERCH-INTEL-03-FINAL** — MERCH-01 (openfda source_url MAUDE permalink), MERCH-06, MERCH-10 (30d archive cron)
- ✅ **DEBT-TANSTACK-REAL-6** — migrate 6 raw useEffect+supabase violations to useQuery
- ✅ **EVT-WO-02** — /events/:slug detail route + registration CTA + related signals
- ✅ **ROUTE-CLEANUP-WO** — redirect orphaned routes
- ✅ **P1-3** — remove brand-*/intel-* legacy token blocks from tailwind.config.js
- ✅ **STATE-AUDIT-01** — skeleton/error/empty states on 23 priority shell pages
- ✅ Any UI work that cites at least one pattern from IDEA-MINING-01-comparables.md

---

## 3) WHAT IS FORBIDDEN TOMORROW

- ❌ **PAY-UPGRADE-WO** — BLOCKED. Do not attempt until owner configures stripe_price_id in Stripe dashboard.
- ❌ **CMS-WO-08, 09, 10, 11, 12** — blocked until CMS-WO-07 completes.
- ❌ **DATA-PRESS-PROOF** — blocked until NEWSAPI-INGEST-01 + CMS-WO-07 both done.
- ❌ Any UI change that cannot cite a specific pattern from IDEA-MINING-01-comparables.md.
- ❌ Self-certification (writing PASS/DONE without a verify JSON in docs/qa/).
- ❌ Inventing new WO IDs not in build_tracker.md.
- ❌ Modifying auth.tsx, useCart.ts, or any commerce checkout files.
- ❌ Modifying existing Supabase migrations (ADD ONLY — new files only).
- ❌ Implementing anti-patterns from IDEA-MINING-01 (Boolean query as primary search, blank canvas UI, static-PDF-only delivery, self-reported benchmark data entry).
- ❌ Pushing to production / making site live (owner has not authorized launch).

---

## 4) FIRST 3 WOs FOR TOMORROW (PRIORITY ORDER)

### WO 1: INTEL-UI-REMEDIATION-01

**Objective:** Fix Intelligence Hub UX per IDEA-MINING-01 patterns + outstanding segmentation gaps.

**Target files:**
- `src/lib/intelligence/useIntelligence.ts` — add `signalTypes?: SignalType[]` option + `.in('signal_type', signalTypes)` DB filter
- `src/lib/intelligence/useSignalImage.ts` — add deterministic ID-hash image pool variation (break repeated SVGs per type)
- `src/components/intelligence/IntelligenceFeedSection.tsx` — lift filter state to props, export FEED_FILTERS, remove internal filter state
- `src/pages/public/Intelligence.tsx` — lift filter state, wire server-side category filter, spotlightTrends 3→5

**Required skills to run (pre-completion):**
- `live-demo-detector` — verify no fake-live violations introduced
- `intelligence-merchandiser` → `merchandising-audit` — verify MERCH 1–12 still PASS/WARN after UI changes
- `build-gate` — tsc=0, build=PASS

**Required verify JSON:** `docs/qa/verify_INTEL-UI-REMEDIATION-01.json`

**IDEA-MINING-01 patterns cited:**
- Pattern 5 (List/Card view toggle) — Phase 1 target
- Pattern 9 (Filter panel Primary + More filters) — server-side category filter
- Pattern 3 (Impact score badge) — already in place via rankedScore

**Commit rule:** One commit per file changed (strict).

---

### WO 2: CMS-WO-07

**Objective:** Create `story_drafts` table + `feeds-to-drafts` edge function. RSS signals auto-queue to drafts; editorial team approves before publish. No direct signal→publish pipeline.

**Target files:**
- `supabase/migrations/YYYYMMDD_story_drafts.sql` — table + RLS + handle_updated_at trigger
- `supabase/functions/feeds-to-drafts/index.ts` — reads `market_signals` (last 24h, active) → inserts into `story_drafts` where no duplicate exists
- `src/pages/admin/cms/AdminStoryDrafts.tsx` — admin review queue (TanStack Query, approve/reject actions, skeleton/error/empty)

**Required skills to run (pre-completion):**
- `rls-auditor` — verify RLS on story_drafts
- `migration-validator` — verify ADD-ONLY compliance, naming convention
- `hub-shell-detector` — verify AdminStoryDrafts is not a shell
- `build-gate` — tsc=0

**Required verify JSON:** `docs/qa/verify_CMS-WO-07.json`

**Depends on:** CMS-SEED-01 (DONE ✅)

---

### WO 3: MERCH-INTEL-03-FINAL

**Objective:** Complete remaining MERCH rules that require pipeline work.

**Target files:**
- `supabase/functions/ingest-openfda/index.ts` — add MAUDE permalink to `source_url` field per signal
- `supabase/migrations/YYYYMMDD_signal_archive_cron.sql` — pg_cron job to archive signals older than 30 days (set `active=false, status='archived'`)
- `docs/qa/verify_MERCH-INTEL-03-FINAL.json` — proof pack

**Required skills to run (pre-completion):**
- `intelligence-merchandiser` → `merchandising-audit` — verify MERCH-01 (source_url), MERCH-06 (paid depth), MERCH-10 (timeline eligibility) all PASS or WARN
- `pg-cron-scheduler-validator` — verify cron job registered

**Required verify JSON:** `docs/qa/verify_MERCH-INTEL-03-FINAL.json`

**Depends on:** MERCH-INTEL-03-DB (DONE ✅)

---

## 5) DESIGN INTENT — IDEA-MINING-01 Patterns Mapped to Intelligence Surfaces

Based on the pattern library in `docs/research/IDEA-MINING-01-comparables.md`:

1. **Snapshot Today View** (Pulsar) → Intelligence Hub landing adds a "Today's Summary" card above the signal feed showing top 3 categories, signal count, and sentiment aggregate for the last 24 hours.

2. **Narrative Clustering** (New Sloth, Sprinklr) → Duplicate signals on the same story are collapsed into a single expandable row; the highest-provenance version is shown, with a "+N similar" chip.

3. **Impact Score Badge** (PeakMetrics) → Every `SignalCard.tsx` shows a color-coded impact score badge (signal-up=70+, signal-warn=40–69, signal-down=<40) using the existing `impact_score` DB column.

4. **Peer Benchmark KPI Strip** (AMP/Lifetimely, Benchmarkit, Listrak) → Intelligence Hub KPI strip shows operator's signal consumption vs. vertical median and top-quartile — a retention hook that makes SOCELLE data feel essential.

5. **List / Card View Toggle** (Inoreader) → Signal list offers a density toggle: Card (default, current state) and List (headline-only, for operators scanning between appointments). Persisted in localStorage.

6. **Sentiment Aggregate Banner** (NewsData.io, Sprinklr) → Above the signal list, a compact bar shows "N signals this week: X% positive, Y% negative, Z% neutral" computed client-side from the current filter's signal set.

7. **Spot → Understand → Act Arc** (PeakMetrics, AMP) → Below each signal summary, a collapsed "What to do" row links to: create Opportunity (OpportunityFinder pre-populated), add CRM note (pre-tagged), or add to Campaign brief.

8. **Entity Recognition Chips** (New Sloth, Sprinklr) → Brand names, ingredient names, and regulatory body names extracted from signal titles are surfaced as colored chips below the headline; clicking a chip adds it as a feed filter.

9. **Primary + Advanced Filter Panel** (Pulsar) → Signal filter panel shows 4 primary dimensions by default (Vertical, Impact, Topic, Date). A "More filters" expansion reveals Signal type, Source, Tier, Geo for power users.

10. **AI Brief Builder** (Inoreader, PeakMetrics) → Multi-select on signal cards + "Generate Brief" button → AI prompt templates → output stored as `signal_type='ai_brief'` synthetic signal with source IDs. Mapped to future INTEL-WO-07 scope.

---

*Brief generated 2026-03-13. Valid for next session. Authority: build_tracker.md + OPERATION_BREAKOUT.md. GUARDRAIL-01 CLEARED.*
