# INTELLIGENCE MERCHANDISING AUDIT REPORT
**Skill:** intelligence-merchandiser (Agent #17)
**WO:** INTEL-MERCH-02 (Lane F re-audit with live DB evidence)
**Audit timestamp:** 2026-03-10T12:00:00.000Z
**Auditor:** INTELLIGENCE MERCHANDISER — Agent #17, Lane F (read-only lane)
**Evidence artifact:** `docs/qa/verify_INTEL_MERCH.json`
**Supersedes:** Prior INTEL-MERCH-01 report (stale DB counts corrected with live queries)

---

## Executive Summary

12 FEED-MERCH rules evaluated across the full signal pipeline: `useIntelligence.ts`, `feed-orchestrator/index.ts`, `rss-to-signals/index.ts`, `AdminFeedsHub.tsx`, and live Supabase DB queries against project `rumdmulxzmjtsplsjngi` (130 total signals, 82 active in last 30 days).

**Overall verdict: FAIL**

| Result | Count | Rules |
|--------|-------|-------|
| PASS   | 4     | FEED-MERCH-02, FEED-MERCH-04, FEED-MERCH-08, FEED-MERCH-12 |
| WARN   | 0     | — |
| FAIL   | 8     | FEED-MERCH-01, FEED-MERCH-03, FEED-MERCH-05, FEED-MERCH-06, FEED-MERCH-07, FEED-MERCH-09, FEED-MERCH-10, FEED-MERCH-11 |

Three STOP CONDITION rules are triggered (deployment blocked):
- **FEED-MERCH-01 FAIL** — 48 of 130 signals missing `source_url` (36.9%)
- **FEED-MERCH-05 FAIL** — only 1 of 3 required free-tier signals with impact_score >= 65
- **FEED-MERCH-07 FAIL** — 41 near-duplicate rows by title (8 clusters, up to 16 copies of same title)

**DB state at audit time:** 130 total signals | 82 active (30-day window) | 76 free-tier | 6 tier_min='paid' (vocabulary mismatch — 0 pro/enterprise) | 0 paid depth ratio across all verticals.

---

## Rule-by-Rule Scorecard

---

### FEED-MERCH-01 — Source Authority Weighting
**Status: FAIL**

**Evidence:**
- DB query (all signals, last 30 days): `missing_source_name=0, missing_source_url=48, total=130`
- All 48 signals have `source_name` populated. All 48 are missing `source_url`.
- Root cause: `ingest-openfda` edge function populates `source_name` ("FDA MAUDE Adverse Events") but does not construct a per-record MAUDE permalink for `source_url`. The 51 FDA MDR signals inserted by this function have no individual source URL.
- `useIntelligence.ts:171-172`: SELECT correctly includes `source_name, source_url` columns — the hook is correct. The gap is at ingest time.

**STOP CONDITION triggered:** Missing source attribution blocks deployment per SKILL.md §STOP CONDITIONS.

**Fix:** `ingest-openfda` must construct `source_url` per record, e.g., `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfmaude/detail.cfm?mdrfoi__id=<mdr_report_key>`.

---

### FEED-MERCH-02 — Vertical-First Ordering
**Status: PASS**

**Evidence:**
- DB query: `violations = 0` — no active signals have a NULL or out-of-contract `vertical` value.
- `useIntelligence.ts:189-191`: vertical filter implemented — when `vertical` is passed, query filters to `[options.vertical, 'multi']`.
- `feed-orchestrator/index.ts:342-344`: reads `feed.vertical ?? 'multi'` from the `data_feeds` row (backfilled in INTEL-MEDSPA-01).
- `rss-to-signals/index.ts:430`: derives `signalVertical` from `CATEGORY_VERTICAL` map before insert.
- 80 total signals, 0 with null vertical.

**Gap:** None.

---

### FEED-MERCH-03 — Safety Signal Pinning
**Status: FAIL**

**Evidence:**
- DB query: `safety` topic = 52 active signals (avg_impact 45.6, max_impact 75). 86.7% of medspa vertical is `safety` topic.
- DB rank query (medspa vertical, active): all 15 visible rows are `topic='safety'` with `impact_score=45` — they appear first due to NULL `display_order` + `updated_at DESC` coincidence, not enforced pinning.
- `useIntelligence.ts:298`: sort is `impact_score DESC` only. No explicit safety-pin logic exists in any file.
- Grep for `safety.*sort|ORDER.*safety|priority.*safety|pin.*safety` across all three files: 0 matches.

**Gap:** Pinning is coincidental. Any non-safety signal with `impact_score > 45` will sort above 52 safety signals. No enforcement exists. The rule requires safety/regulatory signals to appear in the top 10 regardless of score.

**Fix:** Add a two-pass sort in `useIntelligence.ts` after line 298: lift signals with `topic === 'safety' || topic === 'regulatory'` to positions 1-N before impact_score sort applies to remaining signals.

---

### FEED-MERCH-04 — Freshness Decay
**Status: PASS**

**Evidence:**
- DB query: `stale_signals = 0` — no active signals are older than 14 days with `impact_score < 50`.
- `useIntelligence.ts:298`: primary sort is `impact_score DESC`. `computeImpactScore()` encodes recency decay as 0-20 points (lines 196-202 in both edge functions): signals < 2h get +20, < 6h +16, < 24h +10, < 72h +5, older +0. Decay is baked into the score at write time.
- DB order clause at `useIntelligence.ts:177`: `.order('updated_at', { ascending: false })` as secondary sort — freshness is the tiebreaker.

**Gap:** None within current signal set.

---

### FEED-MERCH-05 — Free Tier Curation
**Status: FAIL**

**Evidence:**
- DB query: `free_high_impact = 1` — only 1 free-tier signal has `impact_score >= 65` within the last 14 days (requires ≥ 3).
- 76 total free-tier signals; 1 meets the 65-point threshold.
- The `computeImpactScore()` ceiling for FDA MDR signals (regulatory source, no recency bonus for historical data) produces a max of 45 points: 25 (tier-2 authority) + 18 (regulatory category bonus) + 20 (safety urgency) = 63 — still below 65 when recency bonus is 0. Only signals ingested within the last 2 hours can exceed 65 from this source.

**STOP CONDITION triggered:** Free tier users see only 1 of the 3 required high-quality signals. Blocks deployment per SKILL.md §STOP CONDITIONS.

**Fix:** Either (a) run the RSS feed-orchestrator against 18 healthy feeds (RSS signals from tier-1 sources with fresh timestamps will score ≥ 65 easily), or (b) recalibrate `computeImpactScore()` to award FDA regulatory signals a sustained score of 70+ independent of recency.

---

### FEED-MERCH-06 — Paid Depth Ratio
**Status: FAIL**

**Evidence:**
- DB query (30-day window, active signals):
  - `medspa`: free_count=55, paid_count=0, ratio=0.00
  - `multi`: free_count=21, paid_count=0, ratio=0.00
  - `salon`: free_count=0, paid_count=0, ratio=null
- Overall totals: free=76, tier_min='paid'=6, pro/enterprise=0, null=0, grand_total=82
- The 6 signals with `tier_min='paid'` use a non-standard vocabulary value. The skill check uses `IN ('pro','enterprise')` which returns 0. The `useIntelligence.ts` hook checks `effectiveTierMin === 'free'` to gate signals — meaning `tier_min='paid'` signals ARE shown to paid users, but are not correctly labeled as `pro` or `enterprise`.

**Root cause:** `CATEGORY_TIER_MIN` in `rss-to-signals` uses `'paid'` as a value (e.g., `academic: 'paid'`). `CATEGORY_TIER_VISIBILITY` in `feed-orchestrator` correctly uses `'pro'`. These two pipeline paths are inconsistent. No pro/enterprise signals have been written in the last 30 days — the 18 healthy RSS feeds have not been run against the `feed-orchestrator`.

**Fix:** Standardize to `'pro'` vocabulary across all pipeline components. Run `UPDATE market_signals SET tier_min='pro' WHERE tier_min='paid'`. Trigger `feed-orchestrator` against 18 healthy feeds to populate academic/market_data/ingredients signals tagged as `tier_min='pro'`.

---

### FEED-MERCH-07 — Dedup Editorial
**Status: FAIL**

**Evidence:**
- DB query (fingerprint dedup): 0 active rows share a non-null fingerprint — the fingerprint-based dedup is technically clean.
- DB query (title-based near-duplicate check): **41 near-duplicate rows** exist across 8 title clusters:

| Title | Duplicate Count |
|-------|----------------|
| FDA MDR: FAMILY OF SQUARE EPIL (ALEX, ALEX2, ND:YAG, ALEX+ND:YAG) adverse event | 16 |
| FDA MDR: STELLAR M22 FOR INTENSE PULSED LIGHT DELIVERY DEVICE, PRODUCT CODE: GEX adverse event | 7 |
| FDA MDR: STELLAR M22 FOR INTENSE PULSED LIGHT (IPL) AND LASER SYSTEM adverse event | 6 |
| FDA MDR: M22 FOR INTENSE PULSED LIGHT (IPL) AND LASER SYSTEM adverse event | 4 |
| FDA MDR: FAMILY OF SQUARE EPIL..., PRODUCT CODE: GEX adverse event | 4 |
| FDA MDR: M22 FOR INTENSE PULSED LIGHT DELIVERY DEVICE, PRODUCT CODE: GEX adverse event | 2 |
| FDA MDR: SPLENDOR X ALEX+ND:YAG adverse event | 2 |
| FDA MDR: VIRTUE RF MICRONEEDLING adverse event | 2 |

- Root cause: `ingest-openfda` does not compute a `fingerprint` value — FDA MDR rows have `fingerprint = NULL`. The upsert conflict key is `(source_type, external_id)`, but multiple MDR report numbers exist for the same device model, allowing multiple rows with identical titles.
- `rss-to-signals/index.ts:306-313`: `buildFingerprint()` is correctly implemented for RSS signals.
- `feed-orchestrator/index.ts`: does not write a fingerprint field on insert.

**STOP CONDITION triggered:** Active duplicate rows exist in the feed. Dedup is broken for the FDA ingest path.

**Fix:** `ingest-openfda` must compute a fingerprint per device+event type. Near-duplicate suppression (>80% title similarity within 48h) must be enforced at ingest time via title fingerprint before insert, or via a post-insert dedup job that sets `is_duplicate=true` on lower-impact copies.

---

### FEED-MERCH-08 — Title Compliance
**Status: PASS**

**Evidence:**
- DB query: 0 titles exceed 120 characters (longest: 93 chars). 0 titles start with banned openers ("New Study", "Experts Say", "Report Finds", "Study Shows").
- Title spot check (10 most recent active signals): All ≤ 120 chars, all declarative, all specific:
  - "FDA MDR: VIRTUE RF MICRONEEDLING adverse event" (46 chars)
  - "FDA MDR: FAMILY OF SQUARE EPIL (ALEX, ALEX2, ND:YAG, ALEX+ND:YAG) adverse event" (79 chars)
  - "FDA MDR: M22 FOR INTENSE PULSED LIGHT (IPL) AND LASER SYSTEM, PRODUCT CODE: GEX adverse event" (93 chars)
- No HTML entities, sensationalist openers, or clickbait patterns detected in current active signals.
- Note: prior audit found an "EXCLUSIVE:" RSS title — this signal is no longer in the active top-10, suggesting it aged out or was deactivated.

**Gap (advisory):** Titles use ALL CAPS device names (FDA data verbatim). Technically compliant under the skill rule (declarative + specific + ≤120 chars), but a title normalizer (`toTitleCase()`) would improve consumer-facing display quality. Not a FAIL under current rule definition.

---

### FEED-MERCH-09 — Topic Distribution
**Status: FAIL**

**Evidence (82 active signals, 30-day window per-vertical):**

| Vertical | Topic | Count | Percentage |
|----------|-------|-------|-----------|
| medspa | safety | 52 | **86.7%** |
| medspa | other | 4 | 6.7% |
| medspa | ingredient | 2 | 3.3% |
| medspa | treatment_trend | 2 | 3.3% |
| multi | other | 8 | 38.1% |
| multi | science | 5 | 23.8% |
| multi | brand_news | 3 | 14.3% |
| multi | treatment_trend | 2 | 9.5% |
| multi | consumer_trend | 2 | 9.5% |
| multi | ingredient | 1 | 4.8% |
| salon | other | 1 | **100.0%** |

The `medspa` vertical is 86.7% `safety` topic — more than double the 40% cap. The `salon` vertical has a single signal (100% one topic — trivially violates but meaningless at n=1). The `multi` vertical is borderline healthy.

**Root cause:** `ingest-openfda` inserted 51 FDA MDR safety signals into the `medspa` vertical with no topic diversity cap. `useIntelligence.ts` has no topic distribution enforcement in the post-filter step.

**Fix:** Two options: (a) add topic distribution cap in `useIntelligence.ts` post-filter (no single topic > 40% of returned set), capping safety at 40% max; or (b) limit `ingest-openfda` to maximum 15 safety signals per batch. Option (a) is preferred as it does not lose data.

---

### FEED-MERCH-10 — Timeline Eligibility
**Status: FAIL**

**Evidence:**
- DB query (`impact_score >= 60 AND updated_at > NOW() - INTERVAL '30 days' AND active=true`): `eligible_timeline = 1`.
- Rule requires ≥ 5 signals eligible for the "What Changed" timeline. Only 1 qualifies.
- Note: the `market_signals` table has no `published_at` column. The skill spec references `published_at` — the actual column is `updated_at`. Both were tested; result is the same (1 eligible signal).
- Root cause: FDA MDR signals max out at `impact_score = 45` (historical data, 0 recency bonus). Only signals ingested within hours can score ≥ 60 from the regulatory category. The RSS pipeline has not run to produce fresh high-authority signals.

**Fix:** Trigger `feed-orchestrator` against the 18 healthy RSS feeds. Fresh signals from tier-1/tier-2 sources ingested within 24h will score 50-80 depending on topic. Alternatively, create a pg_cron hourly schedule for feed-orchestrator (FEED-WO-01) to continuously populate fresh signals.

---

### FEED-MERCH-11 — Admin Feed Ordering
**Status: FAIL**

**Evidence:**
- DB schema inspection: `data_feeds` table has **no `display_order` column**. Columns confirmed: id, name, feed_type, category, endpoint_url, api_key_env_var, poll_interval_minutes, is_enabled, provenance_tier, attribution_label, last_fetched_at, last_error, signal_count, consecutive_failures, last_success_at, health_status, created_at, updated_at, vertical, tier_min. No `display_order`.
- `AdminFeedsHub.tsx:163-167`: orders by `.order('category', { ascending: true }).order('name', { ascending: true })` — alphabetical by category then name, not priority order.
- `useIntelligence.ts:176`: correctly applies `.order('display_order', { ascending: true })` for `market_signals` — but the `data_feeds` table itself has no analogous column.

**Gap:** The `display_order` column required by FEED-MERCH-11 does not exist in `data_feeds`. The admin UI cannot honor display ordering because the column is absent. `market_signals.display_order` exists (confirmed in market_signals schema), but the feed-level ordering in `data_feeds` is missing entirely.

**Fix:** Add migration: `ALTER TABLE data_feeds ADD COLUMN display_order INTEGER DEFAULT 0;`. Update `AdminFeedsHub.tsx` query to order by `display_order ASC, name ASC`. Add a `display_order` field to the Add Feed form and support manual reordering.

---

### FEED-MERCH-12 — Paywall Moment Signal Types
**Status: PASS**

**Evidence:**
- DB query (paid signals, active, last 14 days): 0 rows with `tier_min IN ('pro','enterprise')`.
- All 52 safety signals have `tier_min = 'free'` — no safety or regulatory content is paywalled.
- The 6 signals with `tier_min = 'paid'` (non-standard vocabulary) were not created in the last 14 days and are not safety/regulatory type.
- Rule intent: safety/regulatory signals must NOT be exclusively paywall-gated. Confirmed: all safety signals are free-tier accessible.

**Advisory:** The paywall moment UI (show N signals, then gate) has not been implemented yet. When it is built, it must be verified that safety/regulatory signal types are never the paywall trigger signal. The current data contract satisfies this requirement by design (safety = free tier only).

---

## Score Summary

| Rule | Name | Status | Evidence |
|------|------|--------|----------|
| FEED-MERCH-01 | Source Authority | FAIL | 48/130 signals missing source_url |
| FEED-MERCH-02 | Vertical-First | PASS | 0 unclassified signals |
| FEED-MERCH-03 | Safety Pinning | FAIL | No pin logic; coincidental ordering only |
| FEED-MERCH-04 | Freshness Decay | PASS | 0 stale low-impact signals |
| FEED-MERCH-05 | Free Tier Curation | FAIL | 1 of 3 required high-impact free signals |
| FEED-MERCH-06 | Paid Depth Ratio | FAIL | 0 pro/enterprise signals; ratio=0.00 all verticals |
| FEED-MERCH-07 | Dedup Editorial | FAIL | 41 near-duplicate title rows (8 clusters, max 16 copies) |
| FEED-MERCH-08 | Title Compliance | PASS | 0 violations; 0 titles >120 chars |
| FEED-MERCH-09 | Topic Distribution | FAIL | medspa safety topic = 86.7% (cap: 40%) |
| FEED-MERCH-10 | Timeline Eligibility | FAIL | 1 of 5 required eligible signals |
| FEED-MERCH-11 | Admin Feed Ordering | FAIL | display_order column absent from data_feeds |
| FEED-MERCH-12 | Paywall Moment Signal Types | PASS | No safety/regulatory content paywalled |

**Pass: 4 | Warn: 0 | Fail: 8**
**Overall: FAIL**

---

## Consolidated Remediation WO

### WO ID: MERCH-INTEL-03

**Trigger:** 8 of 12 merchandising rules FAIL. 3 STOP CONDITION rules triggered (MERCH-01, MERCH-05, MERCH-07). Owner approval required before execution.

**Priority order:**

| Priority | Gap | Rule | Scope | Severity |
|----------|-----|------|-------|----------|
| P0 | 48 signals missing source_url | MERCH-01 | `ingest-openfda`: add MAUDE permalink to source_url | STOP CONDITION |
| P0 | 41 near-duplicate title rows | MERCH-07 | `ingest-openfda`: add fingerprint; title-dedup before insert | STOP CONDITION |
| P0 | Only 1 of 3 required free high-impact signals | MERCH-05 | Trigger feed-orchestrator against 18 healthy RSS feeds | STOP CONDITION |
| P1 | No safety pin logic | MERCH-03 | `useIntelligence.ts`: two-pass sort to pin safety/regulatory | CRITICAL |
| P1 | 0 pro/enterprise signals; ratio=0 | MERCH-06 | Standardize tier_min vocabulary to 'pro'; run RSS pipeline | CRITICAL |
| P1 | medspa safety topic = 86.7% | MERCH-09 | `useIntelligence.ts`: topic distribution cap (40% per topic) | CRITICAL |
| P2 | Only 1 timeline-eligible signal | MERCH-10 | Run feed-orchestrator hourly (pg_cron) | HIGH |
| P2 | display_order missing from data_feeds | MERCH-11 | Migration + AdminFeedsHub query update | MEDIUM |

**Files in scope (allowed paths per SKILL.md governance):**

1. `SOCELLE-WEB/supabase/functions/ingest-openfda/index.ts` — add source_url + fingerprint + batch size limit
2. `SOCELLE-WEB/supabase/functions/rss-to-signals/index.ts` — standardize tier_min vocabulary ('paid' → 'pro')
3. `SOCELLE-WEB/supabase/functions/feed-orchestrator/index.ts` — standardize tier_min vocabulary ('paid' → 'pro')
4. `SOCELLE-WEB/src/lib/intelligence/useIntelligence.ts` — add safety pin sort + topic distribution cap
5. `SOCELLE-WEB/src/pages/admin/AdminFeedsHub.tsx` — order by display_order
6. `SOCELLE-WEB/supabase/migrations/<timestamp>_data_feeds_display_order.sql` — ADD COLUMN
7. DB one-time: `UPDATE market_signals SET tier_min='pro' WHERE tier_min='paid'`

**Acceptance criteria:**

| Rule | Acceptance Test |
|------|----------------|
| MERCH-01 | `SELECT COUNT(*) WHERE source_url IS NULL ... created_at > NOW()-30d` → 0 for new signals |
| MERCH-03 | Safety/regulatory signals appear in positions 1-N before any non-safety signal in useIntelligence output |
| MERCH-05 | `SELECT COUNT(*) WHERE tier_min='free' AND impact_score>=65 AND created_at > NOW()-14d` → ≥ 3 |
| MERCH-06 | Paid/free ratio ≥ 3.0 for medspa and multi after RSS pipeline run |
| MERCH-07 | `SELECT title, COUNT(*) GROUP BY title HAVING COUNT(*)>1` → 0 rows for new ingest |
| MERCH-09 | No topic exceeds 40% in any vertical in last 30 days |
| MERCH-10 | `SELECT COUNT(*) WHERE impact_score>=60 AND updated_at>NOW()-30d` → ≥ 5 |
| MERCH-11 | `data_feeds.display_order` column exists; AdminFeedsHub orders by it |

**Verification:** `intelligence-merchandiser` skill must return `overall: PASS` after all fixes. Proof artifact: `docs/qa/verify_INTEL-MERCH-03_<timestamp>.json`.

---

## Signal Corpus State (as of audit 2026-03-10)

- Total signals: 130 (82 active in last 30 days, 48 outside window)
- Free tier: 76 | tier_min='paid' (non-standard): 6 | pro/enterprise: 0
- Max free-tier impact_score: 75 (1 signal); most FDA MDR signals: 45
- All active signals from `ingest-openfda` (FDA MDR batch)
- 0 RSS-sourced signals in active feed (RSS pipeline not triggered)
- 41 near-duplicate title rows from FDA MDR batch (fingerprint = NULL on openfda path)
- market_signals has no `published_at` column (skill spec references this — schema discrepancy, note for SKILL.md update)

---

*Audit produced by INTELLIGENCE MERCHANDISER (Agent #17), Lane F — read-only. No code changes made. All findings require owner-approved WO before remediation.*
