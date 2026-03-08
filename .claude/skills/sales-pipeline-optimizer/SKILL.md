---
name: sales-pipeline-optimizer
description: "Scores and prioritizes inbound leads using SOCELLE intelligence data, trend alignment, and prospect profile analysis. Use this skill whenever someone asks to score leads, prioritize prospects, build a lead scoring model, analyze pipeline health, or optimize sales pipeline. Also triggers on: 'lead scoring', 'pipeline optimization', 'prospect priority', 'lead qualification', 'pipeline health', 'sales funnel', 'lead ranking', 'prospect scoring'. This skill works with INBOUND leads only — no cold outreach per CLAUDE.md §G."
---

# Sales Pipeline Optimizer

Scores and prioritizes inbound leads based on intelligence data alignment. SOCELLE's acquisition is inbound-only (CLAUDE.md §G), so this skill maximizes conversion from the `/request-access` pipeline by identifying which prospects have the highest intelligence-value fit.

## Lead Scoring Framework

| Signal | Weight | Logic |
|--------|--------|-------|
| Role match | 25pts | Operator/Provider/Brand aligns with target persona |
| Category activity | 20pts | Their category has high signal volume in SOCELLE |
| Market coverage | 20pts | Their region has good data coverage |
| Tier fit | 15pts | Their needs map to Pro/Enterprise (revenue potential) |
| Engagement | 10pts | Pages viewed, time on site, return visits |
| Urgency indicators | 10pts | Explicit pain point, competitive pressure mentioned |

## Step 1: Pull Pipeline Data

```bash
echo "=== PIPELINE DATA ==="
cd SOCELLE-WEB

# Access requests table
echo "Access request fields:"
grep -rn "access_request\|request_access" supabase/migrations/ 2>/dev/null | head -10

# Request volume
echo "Request handling:"
grep -rn "access.*request\|request.*form\|onSubmit.*request" src/pages/ 2>/dev/null | grep -v node_modules | head -10

# Prospect data points collected
echo "Data collected from prospects:"
grep -rn "formData\|form.*field\|input.*name" src/pages/request-access/ src/pages/RequestAccess/ 2>/dev/null | grep -v node_modules | head -10
```

## Step 2: Score Each Lead

For each prospect in the pipeline:
1. Match their stated role to SOCELLE persona types
2. Check if their category has strong signal coverage
3. Verify their region has data sources
4. Estimate tier fit based on stated needs
5. Check any engagement data available

## Step 3: Priority Segments

| Segment | Score Range | Action | Timeline |
|---------|------------|--------|----------|
| Hot | 80-100 | Personal demo within 24h | Immediate |
| Warm | 60-79 | Email sequence + scheduled demo | 3-5 days |
| Cool | 40-59 | Nurture with intelligence content | 1-2 weeks |
| Cold | 0-39 | Auto-nurture email sequence | Ongoing |

## Step 4: Generate Pipeline Report

```markdown
## Pipeline Health — [Date]

### Summary
- Total leads: X
- Hot: X (X%)
- Warm: X (X%)
- Average score: X
- Estimated pipeline value: $X MRR

### Top 10 Leads
| Rank | Prospect | Role | Category | Score | Recommended Action |
|------|----------|------|----------|-------|-------------------|
```

## Output

Write to `docs/qa/pipeline_optimizer.json`:
```json
{
  "skill": "sales-pipeline-optimizer",
  "total_leads": 0,
  "hot_leads": 0,
  "warm_leads": 0,
  "average_score": 0,
  "estimated_pipeline_mrr": 0,
  "timestamp": "ISO-8601"
}
```

## Fade Protocol
Update when: lead scoring weights need recalibration based on actual conversion data, new data points are collected on the access request form, or target personas change.

## Verification (Deterministic)
- **Command:** `find docs/qa -name "sales-pipeline-optimizer*.json" | wc -l  # expect >= 1`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/sales-pipeline-optimizer-YYYY-MM-DD.json`
- **Fail criteria:** Command returns unexpected value, report not generated, or any BLOCK-level issue found without resolution


## Stop Conditions
- **Hard stop:** Codebase does not compile (`npx tsc --noEmit` fails) — fix build before running this skill
- **Hard stop:** Target path does not exist or is empty — verify repo checkout
- **Hard stop:** Required command-line tool missing (grep, find, node) — install before proceeding
- **Soft stop (owner decision):** More than 50 issues found — present summary to owner for prioritization before attempting fixes
- **Soft stop (owner decision):** Findings contradict a command doc — escalate to owner; do not auto-fix governance
