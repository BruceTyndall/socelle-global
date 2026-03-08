---
name: strategy-preference-validator
description: ALWAYS use this skill when validating business strategy models, forecasts, scenario analyses, or strategic recommendations for SOCELLE intelligence-first alignment. Triggers on "validate strategy", "strategy compliance", "intelligence-first check", "forecast governance", "strategy preference", "model alignment". Ensures all strategic outputs lead with intelligence positioning, avoid ecommerce-first framing, include confidence scoring, and respect SOCELLE canonical doctrine.
---

# Strategy Preference Validator

## Purpose
Validates any strategic output — forecasts, scenario models, market analyses, business cases, or recommendations — for alignment with SOCELLE's intelligence-first doctrine. Ensures strategic thinking consistently positions intelligence as the platform's center of gravity, not ecommerce, and that all projections include proper confidence scoring and governance compliance.

## When to Use
- After `strategy-simulator` or `business-forecast-modeler` produces output
- Before presenting strategic recommendations to stakeholders
- When reviewing business cases, pitch materials, or investor-facing content
- During quarterly strategy review cycles
- When evaluating market entry, pricing, or expansion decisions

## Procedure

### Step 1 — Ingest Strategic Output
Accept the strategic document, model, or recommendation. Classify:

```
STRATEGY TYPES:
- revenue-forecast: Multi-year revenue projections by tier/channel
- market-entry: New market or vertical expansion analysis
- pricing-model: Tier pricing changes or new plan structures
- competitive-analysis: Competitive positioning and response plans
- investment-case: Fundraising materials, investor decks
- partnership-strategy: Alliance, integration, or channel strategies
- growth-model: User acquisition, retention, expansion projections
- risk-assessment: Threat analysis with mitigation plans
```

### Step 2 — Intelligence-First Positioning Check
Every strategic output must frame SOCELLE as an intelligence platform:

```
POSITIONING VALIDATION:
[ ] Executive summary leads with intelligence value proposition
[ ] Market opportunity sized by intelligence demand, not GMV
[ ] Revenue model shows SaaS/intelligence as primary, commerce as secondary
[ ] Competitive moat described through data/intelligence, not marketplace features
[ ] User journey starts with intelligence discovery, not shopping
[ ] Key metrics prioritize intelligence engagement over transaction volume

VIOLATION PATTERNS:
❌ "SOCELLE is a B2B beauty marketplace with analytics"
✅ "SOCELLE is a beauty industry intelligence platform with integrated commerce"

❌ "Revenue driven by $X GMV with Y% take rate"
✅ "Revenue driven by $X SaaS ARR, supplemented by wholesale transaction fees"

❌ "Competitive advantage: largest product catalog"
✅ "Competitive advantage: proprietary intelligence from 10 real-time data dimensions"
```

### Step 3 — Confidence Scoring Validation
All projections and claims must include confidence levels:

```
CONFIDENCE REQUIREMENTS:
[ ] Every numeric projection has Conservative/Base/Optimistic variants
[ ] Assumptions explicitly listed and labeled by confidence:
    - HIGH: Based on verified historical data or contractual commitments
    - MEDIUM: Based on industry benchmarks or analogous companies
    - LOW: Based on estimates, interviews, or early signals
[ ] Sensitivity analysis shows which assumptions drive the most variance
[ ] Time horizon acknowledged (projections beyond 2 years = lower confidence)
[ ] Data sources attributed per SOCELLE_DATA_PROVENANCE_POLICY.md

VIOLATION:
❌ "We project $10M ARR by Year 3"
✅ "Year 3 ARR range: $4.2M (conservative) / $8.1M (base) / $12.5M (optimistic)
    Key assumption: 15% monthly operator conversion rate (MEDIUM confidence, based on SaaS benchmarks)"
```

### Step 4 — Revenue Model Hierarchy Check
Ensure revenue streams are ordered correctly:

```
CANONICAL REVENUE HIERARCHY:
1. SaaS Subscriptions (intelligence access) — PRIMARY
2. AI Tool Credits (per-query services) — SECONDARY
3. Wholesale Affiliate Commission — TERTIARY
4. B2B Ad-Tech / Sponsored Placement — QUATERNARY

VALIDATION:
[ ] SaaS always listed first in revenue breakdowns
[ ] SaaS projected as largest revenue stream by Year 2+
[ ] Commerce GMV presented as a supporting metric, not the headline
[ ] AI credits positioned as expansion revenue, not core
[ ] Ad-tech positioned as future upside, not current dependency
```

### Step 5 — Governance Compliance Scan
Cross-reference against SOCELLE canonical rules:

```
GOVERNANCE CHECK:
[ ] No ecommerce-first positioning (CLAUDE.md §E — FAIL 6)
[ ] No cold outreach strategies recommended (CLAUDE.md §G — FAIL 7)
[ ] Entitlement tiers match SOCELLE_ENTITLEMENTS_PACKAGING.md
[ ] Pricing follows established tier structure ($49/$149/Custom)
[ ] Data claims comply with SOCELLE_DATA_PROVENANCE_POLICY.md
[ ] No banned terms from SOCELLE_CANONICAL_DOCTRINE.md
[ ] Market claims labeled LIVE (verified) or DEMO (estimated)
```

### Step 6 — Risk & Assumption Transparency
Validate that strategic outputs are honest about uncertainties:

```
TRANSPARENCY RULES:
[ ] Major risks explicitly listed (not buried in appendix)
[ ] Mitigation strategies provided for top 3 risks
[ ] Key assumptions testable (can be validated with data)
[ ] Failure scenarios described ("what if X doesn't happen")
[ ] Dependencies on external factors acknowledged
[ ] Timeline risks noted for each major milestone
```

### Step 7 — Generate Validation Report

```json
{
  "skill": "strategy-preference-validator",
  "strategy_type": "revenue-forecast | market-entry | pricing-model | ...",
  "overall_aligned": true,
  "intelligence_first_score": "0-100",
  "confidence_scoring_valid": true,
  "revenue_hierarchy_correct": true,
  "governance_pass": true,
  "governance_issues": [],
  "positioning_violations": [],
  "missing_confidence_scores": [],
  "risk_transparency_score": "0-100",
  "recommendations": [],
  "report_path": "docs/qa/strategy-preference-validator-YYYY-MM-DD.md"
}
```

Save report to `docs/qa/`.

## Fade Protocol
- **Review quarterly** — Sync with latest revenue actuals and strategic pivots
- **Retest** — Run against 3 recent strategy documents; recalibrate if positioning rules have evolved
- **Retire** — If SOCELLE's core thesis pivots away from intelligence-first, rebuild entirely via skill-creator

## Verification (Deterministic)
- **Command:** `find docs/qa -name "strategy-preference-validator*.json" | wc -l  # expect >= 1`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/strategy-preference-validator-YYYY-MM-DD.json`
- **Fail criteria:** Command returns unexpected value, report not generated, or any BLOCK-level issue found without resolution


## Stop Conditions
- **Hard stop:** Codebase does not compile (`npx tsc --noEmit` fails) — fix build before running this skill
- **Hard stop:** Target path does not exist or is empty — verify repo checkout
- **Hard stop:** Required command-line tool missing (grep, find, node) — install before proceeding
- **Soft stop (owner decision):** More than 50 issues found — present summary to owner for prioritization before attempting fixes
- **Soft stop (owner decision):** Findings contradict a command doc — escalate to owner; do not auto-fix governance
