---
name: growth-tactic-simulator
description: "Models product-led growth scenarios, simulates retention mechanics, and generates A/B test plans for SOCELLE. Use this skill whenever someone asks about growth modeling, retention analysis, viral coefficients, NRR projections, cohort analysis, A/B testing, conversion funnel optimization, or PLG strategy. Also triggers on: 'growth model', 'retention simulation', 'viral coefficient', 'NRR', 'cohort analysis', 'A/B test plan', 'conversion funnel', 'churn prediction', 'PLG', 'product-led growth', 'user acquisition model'. This skill bridges the gap between product decisions and revenue impact."
---

# Growth Tactic Simulator

Models PLG scenarios and simulates retention mechanics for SOCELLE. Growth decisions without modeling are guesses — this skill provides a structured framework to project the revenue impact of product changes before committing engineering resources.

## SOCELLE Revenue Model Context

SOCELLE has a tri-sided revenue model:
1. **SaaS subscriptions**: Free/$49 Pro/$149 Enterprise/Custom tiers
2. **Wholesale affiliate**: Commission on B2B product transactions
3. **AI add-ons + B2B Ad-Tech**: Credit-based AI tools, sponsored intelligence placements

Key metrics to model:
- **NRR** (Net Revenue Retention): Target > 120%
- **Viral coefficient**: Each user invites X new users
- **Time-to-value**: Minutes from signup to first intelligence insight
- **Conversion rate**: Free → Pro, Pro → Enterprise
- **Credit consumption**: AI tool usage driving add-on revenue

## Step 1: Define the Scenario

Every simulation needs:
1. **Hypothesis**: "If we [change X], then [metric Y] will [increase/decrease] by [Z%]"
2. **Baseline**: Current metric values (pull from analytics or estimate)
3. **Variables**: What changes in the scenario
4. **Time horizon**: 30/60/90/180/365 days

## Step 2: Build the Model

```python
# Growth simulation template
import json
from datetime import datetime

def simulate_growth(
    initial_users: int,
    monthly_growth_rate: float,
    conversion_rate_free_to_pro: float,
    conversion_rate_pro_to_enterprise: float,
    monthly_churn_rate: float,
    viral_coefficient: float,
    months: int
) -> dict:
    results = []
    users = initial_users
    pro_users = 0
    enterprise_users = 0

    for month in range(1, months + 1):
        # Organic + viral growth
        new_users = int(users * monthly_growth_rate) + int(users * viral_coefficient * 0.1)
        churned = int(users * monthly_churn_rate)
        users = users + new_users - churned

        # Conversions
        new_pro = int(users * conversion_rate_free_to_pro * 0.1)
        new_enterprise = int(pro_users * conversion_rate_pro_to_enterprise * 0.05)
        pro_users += new_pro
        enterprise_users += new_enterprise

        # Revenue
        mrr = (pro_users * 49) + (enterprise_users * 149)

        results.append({
            "month": month,
            "total_users": users,
            "pro_users": pro_users,
            "enterprise_users": enterprise_users,
            "mrr": mrr,
            "arr": mrr * 12
        })

    return {"scenario": "baseline", "results": results}
```

## Step 3: Compare Scenarios

Run the baseline and the hypothesis side-by-side:

| Metric | Baseline (12mo) | Scenario (12mo) | Delta |
|--------|-----------------|-----------------|-------|
| Total users | X | Y | +Z% |
| Pro conversions | X | Y | +Z% |
| MRR | $X | $Y | +$Z |
| ARR | $X | $Y | +$Z |

## Step 4: Generate A/B Test Plan (if applicable)

If the scenario warrants live testing:

```markdown
## A/B Test: [Name]

**Hypothesis**: [If X then Y]
**Primary metric**: [Conversion rate / retention / revenue]
**Secondary metrics**: [Engagement, time-to-value]
**Sample size needed**: [Calculate for statistical significance]
**Duration**: [Days needed for confidence]
**Variant A (Control)**: [Current experience]
**Variant B (Treatment)**: [Changed experience]
**Success criteria**: [Metric threshold to ship]
**Kill criteria**: [When to stop the test]
```

## Output

Write to `docs/qa/growth_simulation.json`:
```json
{
  "skill": "growth-tactic-simulator",
  "scenario_name": "",
  "hypothesis": "",
  "baseline_arr": 0,
  "scenario_arr": 0,
  "delta_pct": 0,
  "confidence": "high|medium|low",
  "recommendation": "test|ship|skip",
  "timestamp": "ISO-8601"
}
```

## Verification (Deterministic)
- **Command:** `echo "Manual: verify 3 scenario variants generated (Conservative/Base/Optimistic)"  # check output JSON`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/growth-tactic-simulator-YYYY-MM-DD.json`
- **Fail criteria:** Command returns unexpected value, report not generated, or any BLOCK-level issue found without resolution


## Stop Conditions
- **Hard stop:** Codebase does not compile (`npx tsc --noEmit` fails) — fix build before running this skill
- **Hard stop:** Target path does not exist or is empty — verify repo checkout
- **Hard stop:** Required command-line tool missing (grep, find, node) — install before proceeding
- **Soft stop (owner decision):** More than 50 issues found — present summary to owner for prioritization before attempting fixes
- **Soft stop (owner decision):** Findings contradict a command doc — escalate to owner; do not auto-fix governance


## Fade Protocol
- **Retest trigger:** Run quarterly or after any major refactor, migration, or dependency upgrade
- **Deprecation trigger:** Skill references files/patterns that no longer exist in codebase for 2+ consecutive quarters
- **Replacement path:** If deprecated, merge functionality into the relevant suite or rebuild via `skill-creator`
- **Last recertified:** 2026-03-08
