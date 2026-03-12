# SKILL: feed-value-ranker
**WO:** MERCH-SKILL-01
**Agent:** Intelligence Merchandiser (Agent #17)
**Suite:** data-integrity-suite (member #7)
**Authority:** `docs/command/AGENT_SCOPE_REGISTRY.md` §17, `/.Codex/AGENTS.md`

---

## PURPOSE

Scores and ranks all active signals by editorial value — combining freshness, impact score, tier relevance, and vertical specificity into a composite rank. Used to verify that the feed pipeline surfaces the highest-value signals for each audience segment, and to identify low-value signals that should be deprioritized or expired.

This is a diagnostic tool, not a deployment step. Run it to understand the current state of signal quality before making any changes to feed-orchestrator or rss-to-signals ranking logic.

---

## TRIGGER

Run this skill when:
- New feed sources are added and you need to verify their signal quality contribution
- impact_score distribution looks off (too many low-score signals surfaced)
- A FEED-MERCH-04 (freshness decay) or FEED-MERCH-06 (paid depth ratio) violation is detected
- Preparing a merchandising-audit and you need the ranked signal inventory

---

## RANKING ALGORITHM

Each signal receives a composite **Editorial Value Score (EVS)** from 0–100:

```
EVS = (impact_score × 0.40)
    + (freshness_score × 0.30)
    + (tier_depth_score × 0.20)
    + (vertical_specificity_score × 0.10)
```

### Component Definitions

**impact_score** (0–100, from `market_signals.impact_score`):
Use directly. Already normalized.

**freshness_score** (computed):
```
freshness_score = CASE
  WHEN published_at > NOW() - INTERVAL '24 hours' THEN 100
  WHEN published_at > NOW() - INTERVAL '3 days'   THEN 80
  WHEN published_at > NOW() - INTERVAL '7 days'   THEN 60
  WHEN published_at > NOW() - INTERVAL '14 days'  THEN 40
  WHEN published_at > NOW() - INTERVAL '30 days'  THEN 20
  ELSE 0
END
```

**tier_depth_score** (computed):
```
tier_depth_score = CASE tier_min
  WHEN 'free'       THEN 40   -- broadly accessible, lower exclusivity
  WHEN 'starter'    THEN 60
  WHEN 'pro'        THEN 80
  WHEN 'enterprise' THEN 100
  ELSE 40
END
```

**vertical_specificity_score** (computed):
```
vertical_specificity_score = CASE vertical
  WHEN 'medspa'        THEN 100  -- most specific to platform audience
  WHEN 'salon'         THEN 90
  WHEN 'beauty_brand'  THEN 80
  WHEN 'regulatory'    THEN 85   -- always high relevance
  WHEN 'academic'      THEN 70
  WHEN 'multi'         THEN 50   -- least specific
  ELSE 30
END
```

---

## EXECUTION

### Step 1 — Generate Full Ranked Inventory

Run this SQL via Supabase MCP `execute_sql`:

```sql
SELECT
  id,
  title,
  vertical,
  topic,
  tier_min,
  impact_score,
  published_at,
  source_name,
  -- Freshness score
  CASE
    WHEN published_at > NOW() - INTERVAL '24 hours' THEN 100
    WHEN published_at > NOW() - INTERVAL '3 days'   THEN 80
    WHEN published_at > NOW() - INTERVAL '7 days'   THEN 60
    WHEN published_at > NOW() - INTERVAL '14 days'  THEN 40
    WHEN published_at > NOW() - INTERVAL '30 days'  THEN 20
    ELSE 0
  END AS freshness_score,
  -- Tier depth score
  CASE tier_min
    WHEN 'free'       THEN 40
    WHEN 'starter'    THEN 60
    WHEN 'pro'        THEN 80
    WHEN 'enterprise' THEN 100
    ELSE 40
  END AS tier_depth_score,
  -- Vertical specificity score
  CASE vertical
    WHEN 'medspa'       THEN 100
    WHEN 'salon'        THEN 90
    WHEN 'beauty_brand' THEN 80
    WHEN 'regulatory'   THEN 85
    WHEN 'academic'     THEN 70
    WHEN 'multi'        THEN 50
    ELSE 30
  END AS vertical_specificity_score,
  -- Composite EVS
  ROUND(
    (COALESCE(impact_score, 0) * 0.40)
    + (CASE
        WHEN published_at > NOW() - INTERVAL '24 hours' THEN 100
        WHEN published_at > NOW() - INTERVAL '3 days'   THEN 80
        WHEN published_at > NOW() - INTERVAL '7 days'   THEN 60
        WHEN published_at > NOW() - INTERVAL '14 days'  THEN 40
        WHEN published_at > NOW() - INTERVAL '30 days'  THEN 20
        ELSE 0
       END * 0.30)
    + (CASE tier_min
        WHEN 'free'       THEN 40
        WHEN 'starter'    THEN 60
        WHEN 'pro'        THEN 80
        WHEN 'enterprise' THEN 100
        ELSE 40
       END * 0.20)
    + (CASE vertical
        WHEN 'medspa'       THEN 100
        WHEN 'salon'        THEN 90
        WHEN 'beauty_brand' THEN 80
        WHEN 'regulatory'   THEN 85
        WHEN 'academic'     THEN 70
        WHEN 'multi'        THEN 50
        ELSE 30
       END * 0.10)
  , 1) AS evs
FROM market_signals
WHERE status = 'active'
ORDER BY evs DESC
LIMIT 50;
```

### Step 2 — Identify Bottom-Quartile Signals

```sql
-- Signals with EVS below 30 that are still being surfaced
SELECT id, title, vertical, impact_score, published_at, tier_min
FROM (
  SELECT *,
    ROUND(
      (COALESCE(impact_score, 0) * 0.40)
      + (CASE
          WHEN published_at > NOW() - INTERVAL '24 hours' THEN 100 * 0.30
          WHEN published_at > NOW() - INTERVAL '3 days'   THEN 80 * 0.30
          WHEN published_at > NOW() - INTERVAL '7 days'   THEN 60 * 0.30
          WHEN published_at > NOW() - INTERVAL '14 days'  THEN 40 * 0.30
          ELSE 0
         END)
    , 1) AS evs
  FROM market_signals WHERE status = 'active'
) ranked
WHERE evs < 30
ORDER BY evs ASC;
```

### Step 3 — Free Tier Top Signal Check

```sql
-- Top 10 signals visible to free tier by EVS
SELECT id, title, vertical, impact_score, published_at,
  ROUND(impact_score * 0.40 +
    CASE WHEN published_at > NOW() - INTERVAL '7 days' THEN 60*0.30 ELSE 20*0.30 END
  , 1) AS evs_approx
FROM market_signals
WHERE status = 'active'
  AND (tier_min = 'free' OR tier_min IS NULL)
ORDER BY evs_approx DESC
LIMIT 10;
```

---

## OUTPUT FORMAT

```json
{
  "skill": "feed-value-ranker",
  "wo_id": "MERCH-SKILL-01",
  "timestamp": "<ISO-8601>",
  "total_active_signals": 0,
  "top_10_by_evs": [
    { "id": "", "title": "", "vertical": "", "evs": 0, "impact_score": 0, "tier_min": "" }
  ],
  "bottom_quartile_count": 0,
  "bottom_quartile_signals": [],
  "free_tier_top_10": [],
  "recommendations": [
    "Expire N signals with EVS < 20 older than 14 days",
    "Vertical X has no signals with EVS > 60 — check feed sources"
  ],
  "overall": "PASS|WARN"
}
```

**Overall:**
- `PASS` = top 10 EVS signals average ≥ 60, ≥ 3 free-tier signals with EVS ≥ 60
- `WARN` = bottom quartile > 30% of total, or free-tier top signals average < 50

---

## GOVERNANCE

- **Read-only diagnostic.** This skill runs queries and produces a ranked report. It does NOT modify any data or code.
- **Output only.** Recommendations in the output are advisory — implementation requires an Intelligence Merchandiser WO.
- **Use before:** Any changes to `feed-orchestrator` ranking block or `useIntelligence.ts` filter ordering.
