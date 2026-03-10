# WO INTEL-MERCH-01 — Intelligence Feed Merchandising Production Gaps

**Status:** DRAFT — awaiting owner approval before any code changes
**Priority:** P0 → P5 (execute in order)
**Phase:** BUILD 1 — INTEL-WO / FEED-WO
**Agent:** INTELLIGENCE MERCHANDISER (Agent #17)
**Evidence source:** intelligence-merchandiser eval runs — iteration-1 (all 3 evals 100% pass) + iteration-2 partial findings
**Verification skill:** `intelligence-merchandiser` (must return overall: PASS before marking DONE)
**Double-agent rule:** Building agent PROHIBITED from self-certifying. Audit JSON required in `docs/qa/verify_INTEL-MERCH-01_<timestamp>.json`.

---

## Production Gaps — Summary

Six confirmed production gaps identified across the intelligence feed pipeline. All map to named FEED-MERCH rules. None require DB schema changes. All are confined to the allowed paths defined in the intelligence-merchandiser skill.

| # | Priority | Gap | FEED-MERCH Rule(s) | Severity |
|---|----------|-----|--------------------|----------|
| 1 | P0 | Test record active in production | FEED-MERCH-08 | CRITICAL |
| 2 | P1 | `rowToSignal()` drops `impact_score` — scoring pipeline is dead code from client | FEED-MERCH-01, FEED-MERCH-04 | CRITICAL |
| 3 | P2 | Client sort uses `Math.abs(magnitude)` — overrides authority + decay ranking | FEED-MERCH-01, FEED-MERCH-03, FEED-MERCH-04 | CRITICAL |
| 4 | P3 | RSS pipeline never ran — 100% of medspa signals are `topic=safety` | FEED-MERCH-09 | CRITICAL |
| 5 | P4 | ~54% of medspa signals are near-duplicate FDA MDR device records | FEED-MERCH-07 | WARNING |
| 6 | P5 | No `normalizeSignalTitle()` — raw ALL CAPS device names in production | FEED-MERCH-08 | WARNING |

---

## P0 — Remove test record from production

**Evidence:** Title "FDA Recall: Test cosmetic product" active in `market_signals` table. Found by iteration-1 without_skill run (actual DB data cited). Maps to FEED-MERCH-08 (editorial title compliance — a test record in production is an unrecoverable editorial violation).

**Files in scope:**
- `market_signals` table (DELETE — not a migration)

**Change:**
```sql
-- Verify first:
SELECT id, title, topic, created_at
FROM market_signals
WHERE title ILIKE '%test cosmetic%' OR title ILIKE 'FDA Recall: Test%';

-- Delete after verifying row count = 1:
DELETE FROM market_signals
WHERE title ILIKE '%test cosmetic%' OR title ILIKE 'FDA Recall: Test%';
```

**Acceptance criteria:**
- Zero rows with title matching `%test cosmetic%` or `FDA Recall: Test%`
- Deletion logged in audit trail

**Verification:**
```bash
# Via Supabase MCP: execute_sql
SELECT count(*) FROM market_signals WHERE title ILIKE '%test%' AND signal_type = 'regulatory_alert';
```

---

## P1 — Fix `rowToSignal()`: surface `impact_score` through to the client

**Evidence:** `useIntelligence.ts:106-130` — `rowToSignal()` fetches `impact_score` from DB (line 162) but the field is never mapped to the output `IntelligenceSignal` object. The `computeImpactScore()` pipeline in feed-orchestrator is architecturally correct — provenance authority weighted at 40%, recency decay baked in — but its output is silently discarded at the client boundary. Every feed-orchestrator and rss-to-signals run computes a 0-100 composite score that no sort key ever reads.

**Files in scope:**
- `SOCELLE-WEB/src/lib/intelligence/useIntelligence.ts`
- `SOCELLE-WEB/src/lib/intelligence/types.ts`

**Changes:**

1. Add `impact_score` to `IntelligenceSignal` type in `types.ts`:
```typescript
// In IntelligenceSignal interface, add:
impact_score?: number;
provenance_tier?: number;
```

2. Map it in `rowToSignal()` (useIntelligence.ts ~line 106):
```typescript
// Add to the returned object:
impact_score: row.impact_score ?? undefined,
provenance_tier: row.provenance_tier ?? undefined,
```

> `provenance_tier` is not currently fetched in the DB select — add it to the SELECT columns at line 162 alongside `impact_score`.

**Acceptance criteria:**
- `IntelligenceSignal` type has `impact_score?: number`
- `rowToSignal()` maps `row.impact_score` to output object (not dropped)
- `provenance_tier` included in DB SELECT and mapped to output
- `npx tsc --noEmit` passes with 0 errors

**Verification skill:** `intelligence-hub-api-contract`, `build-gate`

---

## P2 — Fix client sort: replace `Math.abs(magnitude)` with authority-first composite sort

**Evidence:** `useIntelligence.ts:288` — `filtered.sort((a, b) => Math.abs(b.magnitude) - Math.abs(a.magnitude))`. This single-dimension sort on the raw provenance confidence float (0.5–0.9) has three compounding failures:
1. **FEED-MERCH-01 FAIL** — source authority is not the primary sort key; a tier-2 source with magnitude=0.70 can outrank a tier-1 source that also happens to have magnitude=0.70 (same default).
2. **FEED-MERCH-03 FAIL** — safety signals with `impact_score >= 60` are not guaranteed positions 1-3; they rank wherever their magnitude falls.
3. **FEED-MERCH-04 FAIL** — freshness decay is computed at write time inside `computeImpactScore()` but the client sort ignores it entirely; a 3-day-old signal can outrank a 2-hour-old alert.

The `display_order` DB sort at line 166-168 is also silently discarded by this client re-sort — admin feed curation has zero effect on what users see.

**Files in scope:**
- `SOCELLE-WEB/src/lib/intelligence/useIntelligence.ts`

**Change** (requires P1 to be complete first, so `impact_score` is available on signal):

Replace the `signals` useMemo sort at line ~288:

```typescript
// BEFORE (broken — magnitude-only, ignores authority and decay):
filtered.sort((a, b) => Math.abs(b.magnitude) - Math.abs(a.magnitude));

// AFTER (authority-first, decay-aware, pin-respecting):
filtered.sort((a, b) => {
  // 1. Admin-pinned signals float to top (lower display_order = higher priority)
  const aPin = a.display_order ?? 9999;
  const bPin = b.display_order ?? 9999;
  if (aPin !== bPin) return aPin - bPin;

  // 2. Safety signals with impact_score >= 60 always pin to top
  const aSafety = a.topic === 'safety' && (a.impact_score ?? 0) >= 60 ? 1 : 0;
  const bSafety = b.topic === 'safety' && (b.impact_score ?? 0) >= 60 ? 1 : 0;
  if (aSafety !== bSafety) return bSafety - aSafety;

  // 3. Primary: impact_score DESC (encodes provenance_tier × 40% + recency × 20%)
  const aScore = a.impact_score ?? 0;
  const bScore = b.impact_score ?? 0;
  if (aScore !== bScore) return bScore - aScore;

  // 4. Tiebreaker: most recent first
  return new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime();
});
```

> Note: `display_order` and `topic` must be surfaced on `IntelligenceSignal`. Check if `display_order` is already mapped. `topic` should already be present (check types.ts).

**Acceptance criteria:**
- Safety signals (`topic='safety'`, `impact_score >= 60`) appear in positions 1-3 in test data
- Signals sort by `impact_score` DESC when no pin is set
- `display_order` (when non-null) overrides score-based sort
- `Math.abs(magnitude)` no longer used as sort key
- `npx tsc --noEmit` passes

**Verification skill:** `intelligence-merchandiser` (FEED-MERCH-01, FEED-MERCH-03, FEED-MERCH-04 must flip to PASS)

---

## P3 — Investigate and fix RSS pipeline silence

**Evidence:** All 56 enabled `data_feeds` rows have `signal_count=0`. 100% of medspa signals in the last 24h are `topic=safety` sourced from `ingest-openfda` only. Feed-orchestrator has never produced signals from the 18 healthy RSS feeds fixed in FEED-URL-01. FEED-MERCH-09 is in CRITICAL FAIL: `safety=100%` vs max 40%.

**Root cause candidates (investigate in this order):**

1. **pg_cron job not scheduled or not running** — check `SELECT * FROM cron.job;` for a feed-orchestrator row
2. **feed-orchestrator never manually triggered** since RSS URLs were fixed in FEED-URL-01
3. **`data_source` FK not set on insert** — `rss-to-signals` and `ingest-openfda` may not populate `data_source = feed_id`, meaning signal counts per feed remain 0 even if signals are inserted (the `LEFT JOIN` on `data_source` returns no matches)

**Files in scope:**
- `SOCELLE-WEB/supabase/functions/feed-orchestrator/index.ts` (read/diagnose, write only ranking logic)
- `SOCELLE-WEB/supabase/functions/rss-to-signals/index.ts` (confirm `data_source` field is set on insert)
- Supabase pg_cron schedule (via migration if cron job needs to be registered)

**Investigation steps:**

```sql
-- Step 1: Check pg_cron schedule
SELECT jobname, schedule, command, active FROM cron.job;

-- Step 2: Check if any signals exist with a data_source FK set
SELECT data_source, count(*) FROM market_signals GROUP BY data_source LIMIT 20;

-- Step 3: Manual trigger test — invoke feed-orchestrator edge function
-- (use Supabase MCP: invoke_edge_function or curl)
```

**Expected fix:** One of:
- Register pg_cron job if missing: `SELECT cron.schedule('feed-orchestrator-hourly', '0 * * * *', $$SELECT net.http_post(...)$$);`
- Ensure `rss-to-signals` sets `data_source = feed_id` on every insert (likely a 1-line fix)

**Acceptance criteria:**
- pg_cron job for feed-orchestrator is active and has a `last_run_at` timestamp within the last 2 hours
- At least one RSS-sourced signal with `topic != 'safety'` exists in `market_signals` within 24 hours
- FEED-MERCH-09 topic distribution: no single topic exceeds 40%

**Verification skills:** `pg-cron-scheduler-validator`, `feed-pipeline-checker`, `intelligence-merchandiser`

---

## P4 — Reduce near-duplicate FDA MDR device records

**Evidence:** ~54% of medspa signals are near-duplicate FDA MDR records for the same device name. `external_id` upsert dedup is correctly implemented (FIND-009 — PASS), but the dedup key `(source_type, external_id)` is too narrow for MDR records: multiple FDA MDR reports for the same device (e.g., "BOTULINUM TOXIN TYPE A") are inserted as separate signals because they have different `external_id` values (different MDR report numbers) but are editorially equivalent for a medspa operator audience.

**Files in scope:**
- `SOCELLE-WEB/supabase/functions/ingest-openfda/index.ts` — add same-device dedup logic
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (add `is_duplicate` flag migration if not present)

**Proposed fix:**

When inserting FDA MDR signals, before insert check:
```sql
SELECT id FROM market_signals
WHERE signal_type = 'device_safety_alert'
  AND topic = 'safety'
  AND title ILIKE '%' || device_name || '%'
  AND created_at > NOW() - INTERVAL '6 hours';
```

If a match exists, set `is_duplicate = true` on the new record and do not show it in the default feed query (add `WHERE is_duplicate = false OR is_duplicate IS NULL` to useIntelligence query).

**Acceptance criteria:**
- Duplicate rate for `signal_type='device_safety_alert'` falls below 30% of total medspa signals
- `is_duplicate = true` signals are excluded from default feed view (not deleted — they remain for audit trail)
- `useIntelligence.ts` query includes `is_duplicate` filter

**Verification skill:** `deduplication-logic-checker`, `intelligence-merchandiser` (FEED-MERCH-07 must flip to PASS or WARN)

---

## P5 — Add `normalizeSignalTitle()` to both ingestion paths

**Evidence:** No `normalizeSignalTitle()` function exists anywhere in the codebase (grep confirms). Raw RSS article titles are written verbatim via `title.substring(0, 500)` in feed-orchestrator and `item.title` in rss-to-signals. FDA MDR device names arrive in ALL CAPS from the FDA API and are stored verbatim. All 5 FEED-MERCH-08 sub-rules are unguarded.

**Files in scope:**
- `SOCELLE-WEB/supabase/functions/feed-orchestrator/index.ts` — add call before DB insert (ranking/ingest logic — allowed path)
- `SOCELLE-WEB/supabase/functions/rss-to-signals/index.ts` — same (classification rules — allowed path)

**Function to implement** (inline in each edge function — no `_shared/` import due to EDGE FUNCTION DEPLOYMENT NOTE):

```typescript
function normalizeSignalTitle(raw: string, signalType?: string): string {
  let title = raw.trim();

  // 1. Convert ALL CAPS to title case (preserve acronyms <= 4 chars)
  if (title === title.toUpperCase() && title.length > 4) {
    title = title.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  // 2. Remove exclamation marks
  title = title.replace(/!/g, '');

  // 3. Remove sensationalist openers
  title = title.replace(/^(New Study Shows|Breaking:|EXCLUSIVE:|Exclusive:)\s*/i, '');

  // 4. Truncate to 12 words
  const words = title.trim().split(/\s+/);
  if (words.length > 12) {
    title = words.slice(0, 12).join(' ') + '…';
  }

  return title.trim();
}
```

Call site in feed-orchestrator (before insert, ~line 354):
```typescript
title: normalizeSignalTitle(item.title ?? '', signalType),
```

Call site in rss-to-signals (before insert, ~line 439):
```typescript
title: normalizeSignalTitle(item.title ?? '', signal_type),
```

**Note:** This normalizes titles at ingest time. Existing raw-title records in the DB are NOT retroactively updated by this change (acceptable — they will be overwritten on next upsert for the same `external_id`). A separate one-time backfill migration can be added later if needed.

**Acceptance criteria:**
- `normalizeSignalTitle()` function present in both edge functions
- `grep -r "normalizeSignalTitle"` returns at least 2 hits
- No ALL CAPS titles inserted by a test run of feed-orchestrator after this fix
- `npx tsc --noEmit` passes (edge functions are Deno — check for Deno-specific type issues)

**Verification skill:** `intelligence-merchandiser` (FEED-MERCH-08 must flip from FAIL to PASS or WARN), `build-gate`

---

## Execution Order (non-negotiable)

```
P0 → P1 → P2 → P3 → P4 → P5
```

P2 depends on P1 (needs `impact_score` on `IntelligenceSignal` type).
P3 is independent but must run after P0 to avoid re-inserting the test record.
P4 and P5 are independent of each other and of P1/P2.

## Required Proof Artifacts

After all 6 gaps are fixed, run `intelligence-merchandiser` tool and save output to:
```
docs/qa/verify_INTEL-MERCH-01_<timestamp>.json
```

Required verdicts in the proof JSON:
- `FEED-MERCH-01`: PASS (provenance_tier → impact_score sort order)
- `FEED-MERCH-03`: PASS (safety signals at positions 1-3)
- `FEED-MERCH-04`: PASS (impact_score used as sort key, encoding freshness decay)
- `FEED-MERCH-07`: PASS or WARN (duplicate rate < 30%)
- `FEED-MERCH-08`: PASS (normalizeSignalTitle present + no ALL CAPS in spot check)
- `FEED-MERCH-09`: PASS (no single topic > 40% after RSS pipeline runs)
- `overall`: `"PASS"`

**WO is NOT DONE until `overall: "PASS"` is in the proof JSON.**

## Forbidden Paths (do not touch)

Per intelligence-merchandiser skill allowed/forbidden paths:
- `src/lib/auth.tsx` — NEVER MODIFY
- `src/lib/useCart.ts` — NEVER MODIFY
- `supabase/functions/create-checkout/` — FROZEN
- `supabase/functions/stripe-webhook/` — FROZEN
- Any UI layout or visual component changes (Copy Agent / Design Guardian domain)
- Any new table creation without Data Architect WO
- Any outreach copy — FORBIDDEN per V1 §P

---

*Draft produced by INTELLIGENCE MERCHANDISER (Agent #17) from iteration-1 and iteration-2 eval evidence. No code changes have been made. This WO requires owner approval before execution.*
