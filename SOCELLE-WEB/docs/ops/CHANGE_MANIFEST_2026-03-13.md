# CHANGE MANIFEST — 2026-03-13
**Checkpoint range:** `2f005fe..195dca3` (12 commits)
**Checkpoint base:** `2f005fe` (MERCH-INTEL-03-DB DONE)
**HEAD at close:** `195dca3`
**Generated:** 2026-03-13
**Authority:** `docs/build_tracker.md` (execution authority)

---

## SECTION A — COMMITS (chronological, oldest first)

| # | SHA | Title | WO | Scope |
|---|-----|-------|----|-------|
| 1 | `fbe7a60` | feat(db): DB-TYPES-02 — regenerate database.types.ts from live schema | DB-TYPES-02 | code+docs |
| 2 | `6a43a75` | feat(feeds): NEWSAPI-INGEST-01 — GNews + NewsAPI press-layer ingestion live | NEWSAPI-INGEST-01 | edge+docs |
| 3 | `ba97274` | chore: mark P0 GATE complete — NEWSAPI-INGEST-01 + DB-TYPES-02 DONE | tracker marker | docs-only |
| 4 | `fe64d8e` | feat(cms): CMS-SEED-01 — seed 6 editorial posts, editorial rail LIVE | CMS-SEED-01 | db+docs |
| 5 | `36e323a` | MERCH-REMEDIATION-01: Step A+B — archive 39 off-topic signals + add provenance_tier column | MERCH-REMEDIATION-01 | db |
| 6 | `690ea8d` | MERCH-REMEDIATION-01: Step B — add provenance_tier to IntelligenceSignal type | MERCH-REMEDIATION-01 | code |
| 7 | `94875a2` | MERCH-REMEDIATION-01: Steps B+C+D — provenance ORDER BY, freshness decay, timeline filter | MERCH-REMEDIATION-01 | code |
| 8 | `fc4b6cc` | MERCH-REMEDIATION-01: Step A pass 2 — extended off-topic archive across all topics | MERCH-REMEDIATION-01 | db |
| 9 | `1722d1f` | MERCH-REMEDIATION-01: COMPLETE — verify_INTEL_MERCH.json 7 FAIL → 0 FAIL (PASS) | MERCH-REMEDIATION-01 | docs |
| 10 | `951fd5a` | docs(research): IDEA-MINING-01 — pattern library from 10 comparable intelligence platforms | IDEA-MINING-01 | docs |
| 11 | `5ce6336` | docs(planning): IDEA-MINING-01 tracker update + GUARDRAIL-01 clearance + tomorrow brief | planning | docs-only |
| 12 | `195dca3` | docs(planning): document acceptable WARNs in OPERATION_BREAKOUT + harden tomorrow brief | planning | docs-only |

---

## SECTION B — FILE-LEVEL DIFF PER COMMIT

### `fbe7a60` — DB-TYPES-02

| Status | File |
|--------|------|
| A | `SOCELLE-WEB/docs/qa/verify_DB-TYPES-02.json` |
| M | `SOCELLE-WEB/src/lib/database.types.ts` |

**Note:** Full regen of database.types.ts from live schema (migrations 000027–000031). 6332 lines. 19 signal_type_enum values confirmed.

---

### `6a43a75` — NEWSAPI-INGEST-01

| Status | File |
|--------|------|
| A | `SOCELLE-WEB/docs/qa/api_runtime_inventory.json` |
| A | `SOCELLE-WEB/docs/qa/verify_NEWSAPI-INGEST-01.json` |
| M | `SOCELLE-WEB/supabase/functions/feed-orchestrator/index.ts` |

**Note:** feed-orchestrator extended with GNews + NewsAPI ingestion layer. Reddit on hold (OAuth complexity). Currents API disabled (timeout). 74 new signals ingested (47→121 total). signal_type_enum fixed.

---

### `ba97274` — P0 GATE marker (docs-only)

| Status | File |
|--------|------|
| M | `SOCELLE-WEB/docs/build_tracker.md` |

**Note:** Tracker status update only. No code changes.

---

### `fe64d8e` — CMS-SEED-01

| Status | File |
|--------|------|
| M | `SOCELLE-WEB/docs/build_tracker.md` |
| A | `SOCELLE-WEB/docs/qa/verify_CMS-SEED-01.json` |
| A | `SOCELLE-WEB/supabase/migrations/20260313000033_cms_seed_editorial_stories.sql` |

**Note:** 6 published cms_posts seeded to Intelligence space (2 featured). Migration 000033 applied to live project. Editorial rail (useStories hook) now LIVE.

---

### `36e323a` — MERCH-REMEDIATION-01 Step A+B (db)

| Status | File |
|--------|------|
| M | `SOCELLE-WEB/docs/build_tracker.md` |
| A | `SOCELLE-WEB/supabase/migrations/20260313000035_merch_remediation_01.sql` |

**Note:** Step A — archived 39 off-topic signals (Buruli, Alzheimer, NASA, dog video, etc.). Step B — `ALTER TABLE market_signals ADD COLUMN IF NOT EXISTS provenance_tier INTEGER NOT NULL DEFAULT 3`; backfill from data_feeds.provenance_tier via source_feed_id; regulatory_alert/FDA source override to tier=1; index created.

---

### `690ea8d` — MERCH-REMEDIATION-01 Step B (code)

| Status | File |
|--------|------|
| M | `SOCELLE-WEB/src/lib/intelligence/types.ts` |

**Note:** Added `provenance_tier?: number` to `IntelligenceSignal` interface.

---

### `94875a2` — MERCH-REMEDIATION-01 Steps B+C+D (code)

| Status | File |
|--------|------|
| M | `SOCELLE-WEB/src/lib/intelligence/useIntelligence.ts` |

**Note:**
- Added `provenance_tier: number | null` to `MarketSignalRow`
- Added `provenance_tier` to SELECT column list
- ORDER BY: `.order('provenance_tier', { ascending: true }).order('display_order'...).order('updated_at'...)`
- Added `timeline?: boolean` to `UseIntelligenceOptions`
- Timeline filter: `gte('impact_score',60).gte('updated_at',72h_cutoff).not('topic','in','other,general')`
- Added `freshnessDecay()` function with 5-tier decay table
- Added `PROVENANCE_WEIGHTS` constant: `{1:2.0, 2:1.4, 3:1.0}`
- Added `rankedScore()` function: `impact_score × freshnessDecay × PROVENANCE_WEIGHTS[tier]`
- signals useMemo: sorts by `rankedScore(b) - rankedScore(a)` for both safety and non-safety groups
- queryKey includes `options?.timeline ?? false`

---

### `fc4b6cc` — MERCH-REMEDIATION-01 Step A pass 2 (db)

| Status | File |
|--------|------|
| A | `SOCELLE-WEB/supabase/migrations/20260313000036_merch_remediation_01_pass2.sql` |

**Note:** Extended archiving to science/regulation/events/pricing topics from GNews/NewsAPI. Hard keywords added: NASA, depression drugs, magic mushroom, measles, dog video, yo-yo diet, salmon skin, cancer supplement. Extended beauty-keyword exclusion regex. Result: MERCH-09 topic cap restored (max=34%, under 40% hard cap).

---

### `1722d1f` — MERCH-REMEDIATION-01 COMPLETE (docs)

| Status | File |
|--------|------|
| A | `SOCELLE-WEB/docs/audit/API_RUNTIME_INVENTORY.md` |
| M | `SOCELLE-WEB/docs/build_tracker.md` |
| A | `SOCELLE-WEB/docs/qa/verify_AGENT_ACTIVATION.json` |
| A | `SOCELLE-WEB/docs/qa/verify_INTEL_MERCH.json` |
| A | `SOCELLE-WEB/docs/qa/verify_MERCH-REMEDIATION-01.json` |

**Note:** Proof pack for MERCH-REMEDIATION-01. verify_INTEL_MERCH.json: 6 PASS, 6 WARN, 0 FAIL — overall PASS. verify_AGENT_ACTIVATION.json: Agent #17 INTELLIGENCE-MERCHANDISER registered. This commit closed GUARDRAIL-01 preconditions.

---

### `951fd5a` — IDEA-MINING-01 (docs)

| Status | File |
|--------|------|
| A | `SOCELLE-WEB/docs/qa/verify_IDEA-MINING-01.json` |
| A | `SOCELLE-WEB/docs/research/IDEA-MINING-01-comparables.md` |

**Note:** 775-line pattern library. 10 platforms (Inoreader, New Sloth, NewsData.io, PeakMetrics, Pulsar, Sprinklr, Listrak, AMP/Lifetimely, Benchmarkit.ai, Dash Social). 45 patterns catalogued. 10 top patterns mapped to SOCELLE surfaces. 7 anti-patterns prohibited. Dash Social substituted for ampagency.com (no public product, documented). This commit cleared GUARDRAIL-01.

---

### `5ce6336` — Planning docs (docs-only)

| Status | File |
|--------|------|
| M | `SOCELLE-WEB/docs/build_tracker.md` |
| M | `SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md` |
| A | `SOCELLE-WEB/docs/ops/TOMORROW_EXECUTION_BRIEF.md` |

**Note:** Tracker updated with IDEA-MINING-01 DONE row + GUARDRAIL-01 STATUS block. OPERATION_BREAKOUT.md updated with Pattern Library Inputs section + binding rules. TOMORROW_EXECUTION_BRIEF.md created with gate status, allowed/forbidden work, first WO.

---

### `195dca3` — Planning hardening (docs-only)

| Status | File |
|--------|------|
| M | `SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md` |
| M | `SOCELLE-WEB/docs/ops/TOMORROW_EXECUTION_BRIEF.md` |

**Note:** Acceptable WARNs table added to OPERATION_BREAKOUT.md (6 WARN rules documented with resolution paths). TOMORROW_EXECUTION_BRIEF.md §4 hardened: "FIRST WO ONLY" — no parallel coding until gate proof validated. Explicit list of 9 missing verify artifacts added.

---

## SECTION C — WO MAPPING

| WO ID | Status | Impl SHA(s) | Verify Artifact | Scope | WARNs |
|-------|--------|-------------|-----------------|-------|-------|
| DB-TYPES-02 | **DONE** | `fbe7a60` | `docs/qa/verify_DB-TYPES-02.json` | code+docs | none |
| NEWSAPI-INGEST-01 | **DONE** | `6a43a75` | `docs/qa/verify_NEWSAPI-INGEST-01.json` | edge+docs | none |
| CMS-SEED-01 | **DONE** | `fe64d8e` | `docs/qa/verify_CMS-SEED-01.json` | db+docs | none |
| MERCH-REMEDIATION-01 | **DONE** | `36e323a`, `690ea8d`, `94875a2`, `fc4b6cc`, `1722d1f` | `docs/qa/verify_INTEL_MERCH.json` + `verify_MERCH-REMEDIATION-01.json` | db+code+docs | 6 WARNs (MERCH-02,06,07,08,11,12) — documented in OPERATION_BREAKOUT.md §Acceptable WARNs |
| IDEA-MINING-01 | **DONE** | `951fd5a` | `docs/qa/verify_IDEA-MINING-01.json` | docs | none |
| P0 GATE marker | docs-only | `ba97274` | — (tracker update only) | docs | — |
| Planning/governance | docs-only | `5ce6336`, `195dca3` | — | docs | — |

**WOs NOT in this range (completed in prior sessions, before `2f005fe`):**

| WO ID | Prior SHA | Verify Artifact |
|-------|-----------|-----------------|
| MERCH-INTEL-03-DB | `2f005fe` (checkpoint base) | `docs/qa/verify_MERCH-INTEL-03-DB.json` |
| COVERAGE-EXPANSION-01 | pre-`2f005fe` | `docs/qa/verify_COVERAGE_EXPANSION.json` |
| MERCH-INTEL-IMAGE-CLICKS | pre-`2f005fe` | `docs/qa/verify_INTEL-UI-CLICK-IMAGE-01.json` |

---

## SECTION D — RISK REGISTER

| # | Risk | Severity | Mitigation | Status |
|---|------|----------|------------|--------|
| R-01 | GNews/NewsAPI signals may degrade topic distribution if beauty classifier misses new article patterns (MERCH-09 violation) | MED | MERCH-09 40% cap enforced in useIntelligence.ts useMemo; migration 000036 archived non-beauty signals | MITIGATED |
| R-02 | provenance_tier column defaults to 3 for any future signal inserted without a valid source_feed_id FK | MED | ingest-openfda and rss-to-signals both resolve provenance_tier from the feed row before insert; regulatory_alert topic override sets tier=1 unconditionally | MITIGATED |
| R-03 | 68 signals archived (MERCH-REMEDIATION-01 Step A + pass 2) — may reduce visible signal count in medspa/multi verticals | LOW | FDA API (ingest-openfda) generates fresh signals hourly; net count remains above 50 active signals | MITIGATED |
| R-04 | database.types.ts will drift again after next migration batch (DB-TYPES-02 is a point-in-time snapshot) | MED | DB-TYPES-02 must be re-run after any new migration batch; this is noted in verify_DB-TYPES-02.json | ACCEPTED — re-run required post next batch |
| R-05 | CMS editorial rail (cms_posts) — if content team deletes seeded rows, rail renders empty state | LOW | Empty state guard exists in useStories; 6 rows seeded with `status=published`; editorial workflow (CMS-WO-07+08) will add approval gate | ACCEPTED |
| R-06 | MERCH-06 WARN: paid signal ratio remains 0.14:1 (required ≥3:1) — commercial API feeds still disabled | HIGH | Commercial feeds blocked by paywall (Mintel, Euromonitor). Unblocked only by owner API budget decision. Documented as acceptable WARN in OPERATION_BREAKOUT.md | OWNER DECISION REQUIRED |
| R-07 | 9 verify JSON artifacts listed in TOMORROW_EXECUTION_BRIEF.md §1 do not exist on disk — WOs are NOT DONE | HIGH | All 9 WOs correctly marked OPEN in build_tracker.md; no false DONE claimed | TRACKED — WOs open |

---

*CHANGE_MANIFEST_2026-03-13.md — generated 2026-03-13 — covers 2f005fe..195dca3 (12 commits)*
