---
name: business-forecast-modeler
description: "Simulates multi-variable business growth scenarios with batch processing for SOCELLE including user growth, revenue forecasts, market penetration, and operational scaling models. Use this skill whenever someone asks for business forecasts, growth projections, scaling models, multi-scenario batch analysis, or long-term business planning. Also triggers on: 'business forecast', 'growth projection', 'scaling model', 'batch scenario', 'business model', 'revenue forecast', '5-year plan', 'financial projection', 'unit economics'. Differs from strategy-simulator (single scenarios) and growth-tactic-simulator (PLG mechanics) — this runs comprehensive multi-variable forecasts."
---

# Business Forecast Modeler

Runs comprehensive multi-variable business forecasts with batch processing across scenarios. While `strategy-simulator` handles single strategic decisions and `growth-tactic-simulator` handles product-led growth mechanics, this skill builds full business models with interdependent variables, sensitivity analysis, and multi-year projections.

## Forecast Dimensions

| Dimension | Variables | Sources |
|-----------|-----------|---------|
| User Growth | Signups, activation rate, churn, viral coefficient | Analytics, access_requests |
| Revenue | MRR by tier, expansion revenue, credit revenue, affiliate revenue | Stripe, entitlements |
| Costs | Infrastructure, team, marketing, data feeds | Operational data |
| Market | TAM, SAM, SOM, penetration rate | Industry research |
| Operations | Team size, cost per employee, infrastructure per user | Operational data |

## Step 1: Define Forecast Parameters

```python
# Forecast configuration
config = {
    "base_year": 2026,
    "forecast_years": 5,
    "scenarios": ["conservative", "base", "optimistic"],
    
    # User growth
    "initial_users": 100,
    "monthly_signup_rates": {
        "conservative": 0.05,
        "base": 0.10,
        "optimistic": 0.20
    },
    "monthly_churn_rates": {
        "conservative": 0.08,
        "base": 0.05,
        "optimistic": 0.03
    },
    
    # Revenue per user
    "tier_distribution": {
        "free": 0.70, "pro": 0.20, "enterprise": 0.08, "custom": 0.02
    },
    "tier_pricing": {
        "free": 0, "pro": 49, "enterprise": 149, "custom": 500
    },
    
    # Cost structure
    "infra_cost_per_user_monthly": 2.50,
    "cac": 75,
    "team_cost_monthly": 50000
}
```

## Step 2: Run Batch Scenarios

Generate a matrix of scenarios by varying key inputs:

```python
def run_batch_forecast(config: dict, months: int = 60) -> list:
    all_results = []
    for scenario in config["scenarios"]:
        results = []
        users = config["initial_users"]
        
        for month in range(1, months + 1):
            # Growth
            new_users = int(users * config["monthly_signup_rates"][scenario])
            churned = int(users * config["monthly_churn_rates"][scenario])
            users = users + new_users - churned
            
            # Revenue
            mrr = sum(
                users * config["tier_distribution"][tier] * config["tier_pricing"][tier]
                for tier in config["tier_pricing"]
            )
            
            # Costs
            infra = users * config["infra_cost_per_user_monthly"]
            acquisition = new_users * config["cac"]
            team = config["team_cost_monthly"]
            total_cost = infra + acquisition + team
            
            # Metrics
            results.append({
                "month": month,
                "users": users,
                "mrr": round(mrr),
                "arr": round(mrr * 12),
                "costs": round(total_cost),
                "profit": round(mrr - total_cost),
                "ltv_cac_ratio": round(mrr / max(acquisition/max(new_users,1), 1), 2)
            })
        
        all_results.append({"scenario": scenario, "data": results})
    
    return all_results
```

## Step 3: Sensitivity Analysis

Identify which variables have the biggest impact on outcomes:
- Vary each input ±20% while holding others constant
- Rank variables by impact on 12-month ARR
- Highlight "lever variables" (small changes → big impact)

## Step 4: Output Report

```markdown
## Business Forecast — [Date]

### 5-Year Summary
| Metric | Conservative | Base | Optimistic |
|--------|-------------|------|-----------|
| Year 1 ARR | | | |
| Year 3 ARR | | | |
| Year 5 ARR | | | |
| Break-even month | | | |
| Peak cash need | | | |
| Users at Year 5 | | | |

### Sensitivity Analysis
| Variable | -20% Impact | +20% Impact | Leverage |
|----------|-------------|-------------|----------|

### Key Assumptions
1. [Assumption 1]
2. [Assumption 2]

### Risks
1. [Risk 1 — mitigation]
2. [Risk 2 — mitigation]
```

## Output

Write to `docs/qa/business_forecast.json`:
```json
{
  "skill": "business-forecast-modeler",
  "forecast_years": 5,
  "scenarios_run": 3,
  "base_case_year1_arr": 0,
  "base_case_year5_arr": 0,
  "break_even_month": 0,
  "top_lever_variable": "",
  "timestamp": "ISO-8601"
}
```

## Fade Protocol
Update when: actual metrics become available for calibration, pricing changes, cost structure changes, or market conditions shift materially. Re-run quarterly with actuals to improve accuracy.

## Verification (Deterministic)
- **Command:** `echo "Manual: verify 5-year projection table with 3 variants in output"`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/business-forecast-modeler-YYYY-MM-DD.json`
- **Fail criteria:** Command returns unexpected value, report not generated, or any BLOCK-level issue found without resolution


## Stop Conditions
- **Hard stop:** Codebase does not compile (`npx tsc --noEmit` fails) — fix build before running this skill
- **Hard stop:** Target path does not exist or is empty — verify repo checkout
- **Hard stop:** Required command-line tool missing (grep, find, node) — install before proceeding
- **Soft stop (owner decision):** More than 50 issues found — present summary to owner for prioritization before attempting fixes
- **Soft stop (owner decision):** Findings contradict a command doc — escalate to owner; do not auto-fix governance
