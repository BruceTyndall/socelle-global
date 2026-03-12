---
name: marketing-analytics-forecaster
description: "Predicts marketing campaign ROI and performance from trend data, historical patterns, and channel benchmarks. Use this skill whenever someone asks to forecast campaign performance, predict marketing ROI, analyze channel effectiveness, model acquisition costs, or plan marketing budget allocation. Also triggers on: 'marketing forecast', 'campaign ROI', 'channel performance', 'CAC prediction', 'marketing budget', 'acquisition cost', 'marketing analytics', 'forecast campaign', 'marketing ROI model'."
---

# Marketing Analytics Forecaster

Predicts campaign performance and ROI using trend data and channel benchmarks. Marketing spend without forecasting is gambling — this skill provides structured models to estimate returns before committing budget, and to evaluate performance against predictions after execution.

## Step 1: Gather Historical Data

```bash
echo "=== MARKETING DATA ==="
cd SOCELLE-WEB

# Analytics integration
echo "Analytics tools:"
grep -rn "analytics\|posthog\|mixpanel\|segment\|gtag\|GA4" src/ package.json 2>/dev/null | grep -v node_modules | head -10

# Conversion tracking
echo "Conversion events:"
grep -rn "track\|event\|conversion\|signup\|register" src/ 2>/dev/null | grep -v node_modules | grep -i "analytics\|track\|event" | head -10

# Traffic sources
echo "Source/medium tracking:"
grep -rn "utm_\|referrer\|source\|medium\|campaign" src/ 2>/dev/null | grep -v node_modules | head -10
```

## Step 2: Build Channel Models

| Channel | CAC Range | Conv Rate | Time to Convert | Best For |
|---------|-----------|-----------|----------------|----------|
| Organic SEO | $20-50 | 2-5% | 30-90 days | Sustained growth |
| Content marketing | $30-80 | 1-3% | 14-60 days | Authority building |
| Email (nurture) | $5-15 | 5-15% | 7-30 days | Pipeline conversion |
| Industry events | $100-300 | 10-20% | 1-14 days | Enterprise leads |
| Partner/referral | $10-30 | 15-25% | 7-21 days | Trusted warm leads |
| Paid search | $50-150 | 1-3% | 1-7 days | High-intent capture |

## Step 3: ROI Forecast Model

```python
def forecast_campaign_roi(
    channel: str,
    budget: float,
    estimated_cac: float,
    avg_deal_size_monthly: float,  # Average MRR per conversion
    avg_customer_lifetime_months: float,
    conversion_rate: float
) -> dict:
    leads_generated = budget / estimated_cac * 10  # Rough leads-to-spend ratio
    conversions = leads_generated * conversion_rate
    first_month_revenue = conversions * avg_deal_size_monthly
    ltv_revenue = conversions * avg_deal_size_monthly * avg_customer_lifetime_months
    roi = (ltv_revenue - budget) / budget * 100
    payback_months = budget / first_month_revenue if first_month_revenue > 0 else float('inf')
    
    return {
        "channel": channel,
        "budget": budget,
        "leads_estimated": int(leads_generated),
        "conversions_estimated": int(conversions),
        "first_month_mrr": round(first_month_revenue, 2),
        "ltv_revenue": round(ltv_revenue, 2),
        "roi_pct": round(roi, 1),
        "payback_months": round(payback_months, 1)
    }
```

## Step 4: Budget Allocation Recommendation

Given total marketing budget, allocate across channels:
- **60%** to highest-ROI proven channels
- **25%** to growth/experimental channels
- **15%** to brand/authority building

## Output

Write to `docs/qa/marketing_forecast.json`:
```json
{
  "skill": "marketing-analytics-forecaster",
  "total_budget": 0,
  "channels_modeled": [],
  "projected_roi_pct": 0,
  "projected_conversions": 0,
  "projected_mrr_impact": 0,
  "payback_period_months": 0,
  "timestamp": "ISO-8601"
}
```

## Fade Protocol
Update when: actual campaign data becomes available (calibrate models), new channels are tested, or conversion benchmarks shift significantly.

## Verification (Deterministic)
- **Command:** `find docs/qa -name "marketing-analytics-forecaster*.json" | wc -l  # expect >= 1`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/marketing-analytics-forecaster-YYYY-MM-DD.json`
- **Fail criteria:** Command returns unexpected value, report not generated, or any BLOCK-level issue found without resolution


## Stop Conditions
- **Hard stop:** Codebase does not compile (`npx tsc --noEmit` fails) — fix build before running this skill
- **Hard stop:** Target path does not exist or is empty — verify repo checkout
- **Hard stop:** Required command-line tool missing (grep, find, node) — install before proceeding
- **Soft stop (owner decision):** More than 50 issues found — present summary to owner for prioritization before attempting fixes
- **Soft stop (owner decision):** Findings contradict a command doc — escalate to owner; do not auto-fix governance
