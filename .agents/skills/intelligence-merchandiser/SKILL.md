# SKILL: intelligence-merchandiser
**WO:** MERCH-SKILL-01
**Agent:** Intelligence Merchandiser (Agent #17)
**Suite:** data-integrity-suite (member #7)
**Authority:** `docs/command/AGENT_SCOPE_REGISTRY.md` §17, `/.Codex/AGENTS.md`

---

## PURPOSE

Audits the full signal pipeline against all 12 FEED-MERCH rules that govern how raw feed data is selected, ranked, framed, and curated before reaching the Intelligence Hub user. Produces a structured JSON proof artifact (`verify_merchandising-audit_*.json`).

This skill is the primary gate for Agent #17 (Intelligence Merchandiser). No work done by this agent is DONE until this skill returns `"overall": "PASS"`.

---

## TRIGGER

Run this skill whenever:
- Any change is made to `feed-orchestrator/index.ts`, `rss-to-signals/index.ts`, or `useIntelligence.ts`
- A new vertical, topic category, or feed source is added
- The `impact_score`, `tier_min`, or `tier_visibility` columns are modified
- A FEED-WO or INTEL-WO is being completed
- Pre-completion verification is required for any merchandising-related work

---

## THE 12 FEED-MERCH RULES

| Rule ID | Name | Description |
|---|---|---|
| FEED-MERCH-01 | Source Authority | Signals must cite verifiable source (source_name + source_url populated, not null) |
| FEED-MERCH-02 | Vertical-First | Every signal must have `vertical` set to a canonical value (medspa, salon, beauty_brand, multi, academic, regulatory) |
| FEED-MERCH-03 | Safety Pinning | Signals with `topic = 'safety'` or `topic = 'regulatory'` MUST appear in the top 10 results for their vertical, regardless of impact_score |
| FEED-MERCH-04 | Freshness Decay | Signals older than 14 days with `impact_score < 50` must be demoted below newer signals — never surfaced as "top" signals |
| FEED-MERCH-05 | Free Tier Curation | Free tier users must see ≥3 signals with `impact_score ≥ 65` before hitting any paywall moment |
| FEED-MERCH-06 | Paid Depth Ratio | Paid tier (Pro/Enterprise) must have ≥3× the signal volume of free tier in the same vertical |
| FEED-MERCH-07 | Dedup Editorial | Duplicate signals (same fingerprint or >80% title similarity within 48h) must not both appear; the higher impact_score version wins |
| FEED-MERCH-08 | Title Compliance | Signal titles must be declarative, specific, and ≤120 chars. Banned: clickbait, vague ("New Study"), brand-as-subject without specificity |
| FEED-MERCH-09 | Topic Distribution | No single topic may exceed 40% of signals shown in a given vertical × time window |
| FEED-MERCH-10 | Timeline Eligibility | "What Changed" timeline only includes signals with `impact_score ≥ 60` and published within 30 days |
| FEED-MERCH-11 | Admin Feed Ordering | AdminFeedsHub display order must match `data_feeds.display_order` column, not insertion order |
| FEED-MERCH-12 | Paywall Moment Signal Types | Paywall trigger signals must be of type `opportunity` or `trend`, never `safety` or `regulatory` |

---

## EXECUTION

### Step 1 — Source Authority Check (FEED-MERCH-01)

```sql
-- Check for signals missing source attribution
SELECT COUNT(*) as violations
FROM market_signals
WHERE (source_name IS NULL OR source_name = '')
   OR (source_url IS NULL OR source_url = '')
   AND created_at > NOW() - INTERVAL '30 days';
```
Expected: 0 violations.

### Step 2 — Vertical Classification Check (FEED-MERCH-02)

```sql
-- Check for unclassified signals
SELECT COUNT(*) as violations
FROM market_signals
WHERE vertical IS NULL OR vertical NOT IN ('medspa','salon','beauty_brand','multi','academic','regulatory');
```
Expected: 0 violations in signals created after INTEL-MEDSPA-01 (2026-03-10).

### Step 3 — Safety Pinning Audit (FEED-MERCH-03)

Verify via `useIntelligence.ts` query logic:
- Grep for safety/regulatory topic priority sort in `feed-orchestrator/index.ts` or `rss-to-signals/index.ts`
- Confirm signals with `topic IN ('safety','regulatory')` are sorted to top

```bash
grep -n "safety\|regulatory.*sort\|ORDER.*safety\|priority.*safety" \
  SOCELLE-WEB/supabase/functions/feed-orchestrator/index.ts \
  SOCELLE-WEB/supabase/functions/rss-to-signals/index.ts \
  SOCELLE-WEB/src/lib/intelligence/useIntelligence.ts
```

### Step 4 — Freshness Decay Audit (FEED-MERCH-04)

```sql
-- Count stale low-impact signals that should be demoted
SELECT COUNT(*) as stale_signals
FROM market_signals
WHERE published_at < NOW() - INTERVAL '14 days'
  AND impact_score < 50
  AND status = 'active';
```
Flag if > 20 stale low-impact signals exist without demotion logic in feed-orchestrator.

### Step 5 — Free Tier Curation Check (FEED-MERCH-05)

```sql
-- Count high-impact signals visible to free tier
SELECT COUNT(*) as free_high_impact
FROM market_signals
WHERE (tier_min = 'free' OR tier_min IS NULL)
  AND impact_score >= 65
  AND status = 'active'
  AND created_at > NOW() - INTERVAL '14 days';
```
Expected: ≥ 3.

### Step 6 — Paid Depth Ratio (FEED-MERCH-06)

```sql
-- Compare free vs paid signal counts per vertical
SELECT
  vertical,
  COUNT(*) FILTER (WHERE tier_min = 'free' OR tier_min IS NULL) as free_count,
  COUNT(*) FILTER (WHERE tier_min IN ('pro','enterprise')) as paid_count,
  ROUND(COUNT(*) FILTER (WHERE tier_min IN ('pro','enterprise'))::numeric /
        NULLIF(COUNT(*) FILTER (WHERE tier_min = 'free' OR tier_min IS NULL), 0), 2) as ratio
FROM market_signals
WHERE status = 'active' AND created_at > NOW() - INTERVAL '30 days'
GROUP BY vertical;
```
Expected: ratio ≥ 3.0 for each vertical. Flag any vertical where ratio < 3.

### Step 7 — Deduplication Audit (FEED-MERCH-07)

```sql
-- Check for duplicate fingerprints
SELECT fingerprint, COUNT(*) as dupes
FROM market_signals
WHERE status = 'active'
GROUP BY fingerprint
HAVING COUNT(*) > 1
LIMIT 10;
```
Expected: 0 rows. If dupes exist, verify dedup logic in rss-to-signals is active.

### Step 8 — Title Compliance Spot Check (FEED-MERCH-08)

Sample 10 recent signal titles:
```sql
SELECT id, title, LENGTH(title) as title_len
FROM market_signals
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 10;
```
Manual check: titles must be declarative, specific, ≤ 120 chars. Flag any title > 120 chars or starting with vague openers ("New Study", "Experts Say", "Report Finds").

### Step 9 — Topic Distribution (FEED-MERCH-09)

```sql
-- Check topic concentration per vertical
SELECT
  vertical,
  topic,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY vertical), 1) as pct
FROM market_signals
WHERE status = 'active' AND created_at > NOW() - INTERVAL '30 days'
GROUP BY vertical, topic
ORDER BY vertical, pct DESC;
```
Expected: No topic exceeds 40% within any vertical.

### Step 10 — Timeline Eligibility (FEED-MERCH-10)

```sql
-- Verify What Changed signals meet threshold
SELECT COUNT(*) as eligible_timeline
FROM market_signals
WHERE impact_score >= 60
  AND published_at > NOW() - INTERVAL '30 days'
  AND status = 'active';
```
Expected: ≥ 5 signals eligible for What Changed timeline.

### Step 11 — Admin Feed Ordering (FEED-MERCH-11)

```bash
# Verify AdminFeedsHub uses display_order
grep -n "display_order\|order_by\|orderBy" \
  SOCELLE-WEB/src/pages/admin/AdminFeedsHub.tsx
```
Expected: `display_order` referenced in query or sort logic, not insertion order.

### Step 12 — Paywall Moment Signal Types (FEED-MERCH-12)

```sql
-- Check that paywall signals are opportunity/trend only
SELECT signal_type, COUNT(*) as count
FROM market_signals
WHERE tier_min IN ('pro','enterprise')
  AND status = 'active'
  AND created_at > NOW() - INTERVAL '14 days'
GROUP BY signal_type;
```
Verify: `safety` and `regulatory` types do NOT appear exclusively as paywall-gated content. At minimum they must be available to free tier.

---

## OUTPUT FORMAT

Save result to `docs/qa/verify_merchandising-audit_<ISO-timestamp>.json`:

```json
{
  "wo_id": "MERCH-SKILL-01",
  "skill": "intelligence-merchandiser",
  "timestamp": "<ISO-8601>",
  "rules_checked": 12,
  "results": {
    "FEED-MERCH-01": { "status": "PASS|FAIL|WARN", "evidence": "<sql result or grep output>", "violations": 0 },
    "FEED-MERCH-02": { "status": "PASS|FAIL|WARN", "evidence": "", "violations": 0 },
    "FEED-MERCH-03": { "status": "PASS|FAIL|WARN", "evidence": "", "violations": 0 },
    "FEED-MERCH-04": { "status": "PASS|FAIL|WARN", "evidence": "", "violations": 0 },
    "FEED-MERCH-05": { "status": "PASS|FAIL|WARN", "evidence": "", "violations": 0 },
    "FEED-MERCH-06": { "status": "PASS|FAIL|WARN", "evidence": "", "violations": 0 },
    "FEED-MERCH-07": { "status": "PASS|FAIL|WARN", "evidence": "", "violations": 0 },
    "FEED-MERCH-08": { "status": "PASS|FAIL|WARN", "evidence": "", "violations": 0 },
    "FEED-MERCH-09": { "status": "PASS|FAIL|WARN", "evidence": "", "violations": 0 },
    "FEED-MERCH-10": { "status": "PASS|FAIL|WARN", "evidence": "", "violations": 0 },
    "FEED-MERCH-11": { "status": "PASS|FAIL|WARN", "evidence": "", "violations": 0 },
    "FEED-MERCH-12": { "status": "PASS|FAIL|WARN", "evidence": "", "violations": 0 }
  },
  "free_tier_high_impact_count": 0,
  "paid_free_ratio_by_vertical": {},
  "title_violations": [],
  "overall": "PASS|FAIL|WARN"
}
```

**Overall rules:**
- `PASS` = all 12 rules PASS
- `WARN` = any rule is WARN, no rule is FAIL
- `FAIL` = any rule is FAIL

---

## STOP CONDITIONS

- FAIL on FEED-MERCH-01 (missing source attribution): block deployment
- FAIL on FEED-MERCH-05 (< 3 free high-impact signals): block deployment — free tier receives no value
- FAIL on FEED-MERCH-07 (active duplicate fingerprints): block deployment — dedup is broken

---

## GOVERNANCE

- **Double-Agent Rule:** Agent #17 may NOT mark any FEED-WO or INTEL-WO DONE until this skill outputs `"overall": "PASS"` or `"WARN"`.
- **Allowed Paths:** Intelligence Merchandiser may only modify feed-orchestrator (ranking block), rss-to-signals (classification/title), useIntelligence.ts (filter/ordering), AdminFeedsHub.tsx (display ordering).
- **Forbidden:** No UI layout changes, no new table creation without Data Architect WO, no outreach copy.
