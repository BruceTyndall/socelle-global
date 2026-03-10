# SKILL: topic-distribution-checker
**WO:** MERCH-SKILL-01
**Agent:** Intelligence Merchandiser (Agent #17)
**Suite:** data-integrity-suite (member #7)
**Authority:** `docs/command/AGENT_SCOPE_REGISTRY.md` §17, `/.claude/CLAUDE.md`

---

## PURPOSE

Audits signal topic concentration per vertical to enforce FEED-MERCH-09 (Topic Distribution): no single topic may exceed 40% of signals shown in a given vertical × time window. Identifies over-concentrated verticals that would degrade feed diversity and produce a monotone editorial experience.

This is a diagnostic-first tool. It queries the live `market_signals` table, computes topic concentration percentages, and flags violations. It does NOT modify signals or feed configuration — it produces a structured report with remediation recommendations.

---

## TRIGGER

Run this skill when:
- A new feed source is added for a vertical that already has known topic concentration
- FEED-MERCH-09 is flagged in a `intelligence-merchandiser` audit output
- Topic distribution looks off (too many "regulatory" or "trend" signals in a vertical)
- Preparing for a merchandising audit and need current topic health

---

## THE RULE: FEED-MERCH-09

> **No single topic may exceed 40% of signals shown in a given vertical × time window.**

**Canonical topic values:** `regulatory`, `safety`, `trend`, `opportunity`, `research`, `product`, `clinical`, `business`, `technology`

**Time window for this audit:** Last 30 days of active signals.

**Violation threshold:** Any (vertical, topic) pair where `pct > 40.0`.

**Warning threshold:** Any (vertical, topic) pair where `pct > 30.0` (approaching limit — flag for monitoring).

---

## EXECUTION

### Step 1 — Full Topic Distribution by Vertical

```sql
SELECT
  vertical,
  topic,
  COUNT(*) AS signal_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY vertical), 1) AS pct,
  CASE
    WHEN ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY vertical), 1) > 40 THEN 'FAIL'
    WHEN ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY vertical), 1) > 30 THEN 'WARN'
    ELSE 'PASS'
  END AS status
FROM market_signals
WHERE status = 'active'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY vertical, topic
ORDER BY vertical, pct DESC;
```

### Step 2 — Violation Summary (FAIL rows only)

```sql
SELECT
  vertical,
  topic,
  COUNT(*) AS signal_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY vertical), 1) AS pct
FROM market_signals
WHERE status = 'active'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY vertical, topic
HAVING ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY vertical), 1) > 40
ORDER BY pct DESC;
```

### Step 3 — Per-Vertical Signal Count (Context for Ratios)

```sql
SELECT
  vertical,
  COUNT(*) AS total_signals,
  COUNT(DISTINCT topic) AS distinct_topics,
  MAX(ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY vertical), 1)) AS max_topic_pct
FROM market_signals
WHERE status = 'active'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY vertical
ORDER BY max_topic_pct DESC;
```

### Step 4 — Topic Coverage Gap (Verticals Missing Key Topics)

Check whether key topics (`safety`, `regulatory`, `opportunity`) have at least one signal per vertical. A vertical with 0 safety/regulatory signals is an editorial gap even if topic distribution is numerically balanced.

```sql
SELECT
  v.vertical,
  COUNT(*) FILTER (WHERE ms.topic = 'safety')     AS safety_count,
  COUNT(*) FILTER (WHERE ms.topic = 'regulatory') AS regulatory_count,
  COUNT(*) FILTER (WHERE ms.topic = 'opportunity') AS opportunity_count,
  COUNT(*) FILTER (WHERE ms.topic = 'trend')       AS trend_count
FROM (
  SELECT DISTINCT vertical FROM market_signals WHERE status = 'active'
) v
LEFT JOIN market_signals ms
  ON ms.vertical = v.vertical
  AND ms.status = 'active'
  AND ms.created_at > NOW() - INTERVAL '30 days'
GROUP BY v.vertical
ORDER BY v.vertical;
```

---

## OUTPUT FORMAT

```json
{
  "skill": "topic-distribution-checker",
  "wo_id": "MERCH-SKILL-01",
  "timestamp": "<ISO-8601>",
  "window_days": 30,
  "verticals_audited": [],
  "distribution_by_vertical": {
    "medspa": [
      { "topic": "regulatory", "count": 0, "pct": 0.0, "status": "PASS|WARN|FAIL" }
    ],
    "salon": [],
    "beauty_brand": [],
    "multi": [],
    "academic": [],
    "regulatory": []
  },
  "violations": [
    {
      "vertical": "",
      "topic": "",
      "pct": 0.0,
      "signal_count": 0,
      "recommendation": "Add <N> signals from other topics in <vertical> to bring <topic> below 40%"
    }
  ],
  "warnings": [],
  "coverage_gaps": [
    { "vertical": "", "missing_topics": [] }
  ],
  "overall": "PASS|WARN|FAIL"
}
```

**Overall:**
- `PASS` = no (vertical, topic) pair exceeds 40%, all verticals have ≥1 safety or regulatory signal
- `WARN` = any pair exceeds 30% but none exceed 40%, OR any vertical missing safety/regulatory
- `FAIL` = any (vertical, topic) pair exceeds 40%

---

## REMEDIATION GUIDANCE

When a violation is found:

1. **Do NOT delete or expire signals** — that breaks FEED-MERCH-04 (freshness decay) enforcement.
2. **Add signals from under-represented topics** — use `rss-to-signals` to ingest from feed sources that cover missing topics for that vertical.
3. **Check `data_feeds` table** for feeds tagged to the vertical — if topic diversity is missing, the feed source itself may be single-topic (e.g., a regulatory-only RSS feed covering medspa).
4. **Flag feed sources** that produce >60% of one topic for a vertical as `low_diversity` in `data_feeds.notes`.

---

## GOVERNANCE

- **Read-only diagnostic.** This skill runs queries and produces a distribution report. It does NOT modify any signals, feeds, or code.
- **Output only.** Recommendations are advisory — implementation requires an Intelligence Merchandiser WO.
- **Use before:** Any INTEL-WO or FEED-WO completion verification run.
- **Part of:** `intelligence-merchandiser` full audit (Step 9 of 12).
