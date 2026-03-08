---
name: education-preference-alignor
description: ALWAYS use this skill when aligning education modules, training content, protocol documentation, or certification materials with SOCELLE governance preferences. Triggers on "align education", "education compliance", "training governance", "module disclaimers", "education preference check". Ensures all educational content includes proper disclaimers, maps to entitlement tiers, respects intelligence-first doctrine, and follows SOCELLE data provenance rules.
---

# Education Preference Alignor

## Purpose
Aligns all educational content (modules, protocols, certifications, training materials) with SOCELLE governance preferences — disclaimers, entitlement tier mapping, data provenance, intelligence-first framing, and accessibility standards. Education is a trust-building layer, never a standalone product pitch.

## When to Use
- After `education-module-creator` or `education-content-optimizer` produces content
- Before publishing any protocol, training module, or certification
- When auditing existing education content for governance drift
- When mapping educational content to entitlement tiers

## Procedure

### Step 1 — Ingest Education Content
Accept modules, protocols, quizzes, or certification materials. Identify structure:

```
CONTENT STRUCTURE MAP:
- module_title: string
- sections: [{title, content, data_sources}]
- assessments: [{type, questions, passing_score}]
- prerequisites: [module_ids]
- tier_requirement: "free | starter | pro | enterprise"
- data_freshness: "date of last data update"
- disclaimers_present: boolean
```

### Step 2 — Disclaimer Validation
Every education module MUST include appropriate disclaimers:

```
REQUIRED DISCLAIMERS:
[ ] "Educational content only — not a substitute for professional advice"
    → Required on ALL modules touching health, safety, or regulatory topics
[ ] Data freshness notice: "Content reflects data available as of [DATE]"
    → Required when module references market data, trends, or benchmarks
[ ] "Results may vary by market, location, and business model"
    → Required when module includes ROI projections or benchmarks
[ ] Source attribution for all cited data points
    → Per SOCELLE_DATA_PROVENANCE_POLICY.md
[ ] Tier access notice: "This module requires [TIER] access"
    → Required on gated content per SOCELLE_ENTITLEMENTS_PACKAGING.md

PLACEMENT RULES:
- Freshness disclaimer: Top of module, before any data presentation
- Professional advice disclaimer: Bottom of module, clearly visible
- Tier notice: Before any gated section, not hidden in footer
```

### Step 3 — Intelligence-First Alignment
Education must frame learning through the intelligence lens:

```
ALIGNMENT CHECK:
[ ] Module opens with "why this matters" market context, not product tutorial
[ ] Learning objectives reference business outcomes, not feature mastery
[ ] Data examples use real intelligence surfaces (signals, benchmarks, trends)
[ ] Completion path leads to intelligence activation, not purchase
[ ] "Try it yourself" exercises use intelligence tools, not ecommerce

REFRAMING EXAMPLES:
❌ "Learn how to use the SOCELLE marketplace"
✅ "Understand how category intelligence drives better purchasing decisions"

❌ "This module covers our product features"
✅ "This module builds your ability to read and act on market signals"
```

### Step 4 — Entitlement Tier Mapping
Verify content respects the access model:

```
TIER MAPPING RULES (per SOCELLE_ENTITLEMENTS_PACKAGING.md):
- Free Preview: Overview content, 1-2 sample signals, basic concepts
- Starter ($49): Full module access, basic assessments, community
- Pro ($149): Advanced modules, certifications, benchmarking tools
- Enterprise (Custom): Custom training, white-label, dedicated support

VALIDATION:
[ ] Free content provides genuine value (not just teasers)
[ ] Gated content clearly shows what's behind the gate
[ ] No tier leakage (Pro content accessible at Starter level)
[ ] Upgrade prompts are contextual, not interruptive
```

### Step 5 — Data Provenance Check
All educational data claims must meet provenance standards:

```
PROVENANCE RULES (per SOCELLE_DATA_PROVENANCE_POLICY.md):
[ ] Every statistic has an attributed source
[ ] Confidence level noted (high/medium/low) for trend claims
[ ] No unverifiable claims presented as fact
[ ] Freshness SLA met (data not older than stated freshness window)
[ ] Influencer-sourced data flagged appropriately
[ ] Mock/demo data clearly labeled DEMO
```

### Step 6 — Generate Alignment Report

```json
{
  "skill": "education-preference-alignor",
  "module_title": "string",
  "overall_aligned": true,
  "disclaimers_valid": true,
  "missing_disclaimers": [],
  "intelligence_first_score": "0-100",
  "tier_mapping_valid": true,
  "tier_leakage_found": false,
  "provenance_issues": [],
  "reframings_needed": [],
  "recommendations": [],
  "report_path": "docs/qa/education-preference-alignor-YYYY-MM-DD.md"
}
```

Save report to `docs/qa/`.

## Fade Protocol
- **Review quarterly** — Sync disclaimer templates with latest regulatory guidance
- **Retest** — Run against 3 published modules; if disclaimer patterns are outdated, refresh
- **Retire** — If education model fundamentally changes, rebuild via skill-creator

## Verification (Deterministic)
- **Command:** `find docs/qa -name "education-preference-alignor*.json" | wc -l  # expect >= 1`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/education-preference-alignor-YYYY-MM-DD.json`
- **Fail criteria:** Command returns unexpected value, report not generated, or any BLOCK-level issue found without resolution


## Stop Conditions
- **Hard stop:** Codebase does not compile (`npx tsc --noEmit` fails) — fix build before running this skill
- **Hard stop:** Target path does not exist or is empty — verify repo checkout
- **Hard stop:** Required command-line tool missing (grep, find, node) — install before proceeding
- **Soft stop (owner decision):** More than 50 issues found — present summary to owner for prioritization before attempting fixes
- **Soft stop (owner decision):** Findings contradict a command doc — escalate to owner; do not auto-fix governance
