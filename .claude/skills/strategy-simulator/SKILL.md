---
name: strategy-simulator
description: "Models business strategy scenarios including NRR forecasts, market entry analysis, pricing optimization, and competitive positioning for SOCELLE. Use this skill whenever someone asks to model a business scenario, run a what-if analysis, simulate strategy outcomes, forecast NRR, analyze pricing, or evaluate market entry options. Also triggers on: 'strategy model', 'business scenario', 'what-if analysis', 'NRR forecast', 'pricing model', 'market entry', 'scenario planning', 'strategic analysis', 'business simulation'. Differs from growth-tactic-simulator (which focuses on PLG mechanics) — this skill models higher-level business strategy."
---

# Strategy Simulator

Models business strategy scenarios at the company level. While `growth-tactic-simulator` focuses on product-led growth mechanics (viral coefficients, conversion funnels), this skill operates at the business strategy layer — market entry, pricing optimization, competitive positioning, and NRR forecasting.

## Scenario Types

| Scenario | Inputs | Outputs |
|----------|--------|---------|
| NRR Forecast | Current MRR, churn rate, expansion rate, contraction rate | 12/24-month NRR projection |
| Pricing Optimization | Current tiers, usage data, competitor pricing | Recommended pricing with revenue impact |
| Market Entry | Target market, data coverage, regulatory requirements | Go/no-go recommendation with timeline |
| Competitive Response | Competitor move, our positioning, customer impact | Response options with risk/reward |
| Revenue Mix | SaaS %, Affiliate %, AI Add-on %, Ad-Tech % | Optimal mix with dependency analysis |

## Step 1: Define Scenario Parameters

Every simulation needs:
- **Scenario name**: Descriptive title
- **Hypothesis**: What we're testing
- **Variables**: What changes in each variant
- **Baseline**: Current state metrics
- **Time horizon**: 6mo / 12mo / 24mo
- **Success metric**: What defines a good outcome

## Step 2: Build the Model

### NRR Forecast Model
```python
def forecast_nrr(
    starting_mrr: float,
    gross_churn_rate: float,      # Monthly % of revenue lost to cancellation
    contraction_rate: float,      # Monthly % of revenue lost to downgrades
    expansion_rate: float,        # Monthly % of revenue gained from upgrades
    new_logo_mrr: float,          # New customer MRR added monthly
    months: int = 12
) -> list:
    results = []
    beginning_mrr = starting_mrr
    
    for month in range(1, months + 1):
        churned = beginning_mrr * gross_churn_rate
        contracted = beginning_mrr * contraction_rate
        expanded = beginning_mrr * expansion_rate
        
        ending_mrr = beginning_mrr - churned - contracted + expanded + new_logo_mrr
        nrr = (ending_mrr - new_logo_mrr) / beginning_mrr * 100
        
        results.append({
            "month": month,
            "beginning_mrr": round(beginning_mrr, 2),
            "churned": round(churned, 2),
            "contracted": round(contracted, 2),
            "expanded": round(expanded, 2),
            "new_logo": round(new_logo_mrr, 2),
            "ending_mrr": round(ending_mrr, 2),
            "nrr_pct": round(nrr, 1)
        })
        beginning_mrr = ending_mrr
    
    return results
```

### Pricing Model
```markdown
## Pricing Analysis Framework

### Current State
| Tier | Price | Users | MRR | Margin |
|------|-------|-------|-----|--------|

### Scenarios
| Change | Impact on MRR | Impact on Conversion | Risk |
|--------|--------------|---------------------|------|

### Recommendation
[Based on elasticity analysis and competitive positioning]
```

### Revenue Mix Model
```markdown
## Revenue Diversification

| Stream | Current % | Target % | Gap | Actions |
|--------|-----------|----------|-----|---------|
| SaaS | X% | Y% | | |
| Wholesale Affiliate | X% | Y% | | |
| AI Add-ons | X% | Y% | | |
| B2B Ad-Tech | X% | Y% | | |
```

## Step 3: Run Comparison

Generate 3 scenarios for every analysis:
1. **Conservative**: Pessimistic assumptions
2. **Base case**: Realistic assumptions
3. **Optimistic**: Best-case assumptions

Output a comparison table showing all three.

## Step 4: Strategic Recommendation

Every simulation ends with:
- **Recommendation**: Clear go/no-go or specific action
- **Confidence level**: High/Medium/Low based on data quality
- **Key assumptions**: What must be true for this to work
- **Risks**: What could go wrong
- **Next steps**: Concrete actions to validate

## Output

Write to `docs/strategy/[scenario-name].md` and QA to `docs/qa/strategy_simulation.json`:
```json
{
  "skill": "strategy-simulator",
  "scenario_name": "",
  "scenario_type": "nrr|pricing|market_entry|competitive|revenue_mix",
  "time_horizon_months": 12,
  "recommendation": "",
  "confidence": "high|medium|low",
  "variants_modeled": 3,
  "timestamp": "ISO-8601"
}
```

## Fade Protocol
Update when: pricing changes, new revenue streams launch, market conditions shift, or actual metrics diverge significantly from model assumptions.

## Verification (Deterministic)
- **Command:** `echo "Manual: verify 3 scenarios (Conservative/Base/Optimistic) in output JSON"`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/strategy-simulator-YYYY-MM-DD.json`
- **Fail criteria:** Command returns unexpected value, report not generated, or any BLOCK-level issue found without resolution


## Stop Conditions
- **Hard stop:** Codebase does not compile (`npx tsc --noEmit` fails) — fix build before running this skill
- **Hard stop:** Target path does not exist or is empty — verify repo checkout
- **Hard stop:** Required command-line tool missing (grep, find, node) — install before proceeding
- **Soft stop (owner decision):** More than 50 issues found — present summary to owner for prioritization before attempting fixes
- **Soft stop (owner decision):** Findings contradict a command doc — escalate to owner; do not auto-fix governance
