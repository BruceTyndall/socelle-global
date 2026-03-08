---
name: sales-output-refiner
description: ALWAYS use this skill when refining, polishing, or reviewing sales scripts, outreach copy, pitch decks, or any sales-facing content. Triggers on "refine sales", "polish pitch", "sales review", "ROI language", "sales compliance check". Enforces intelligence-first ROI framing, bans cold outreach, strips feature-first language, and ensures SOCELLE governance alignment across all sales outputs.
---

# Sales Output Refiner

## Purpose
Refines any sales-facing content to ensure ROI-focused, intelligence-first positioning aligned with SOCELLE canonical doctrine. Strips feature-first framing, cold outreach language, and banned terms. Every sales output must lead with business outcomes, not product features.

## When to Use
- After `sales-script-generator` produces a draft
- When reviewing any sales deck, one-pager, or pitch content
- Before publishing or sharing any sales-facing material
- When converting feature-focused content to value-focused content

## Procedure

### Step 1 — Collect the Sales Output
Gather the content to refine. Accepted formats: script text, .md, .docx pitch deck content, email sequences, one-pagers, or proposal sections.

### Step 2 — Run Compliance Scan
Check against SOCELLE governance rules:

```
COMPLIANCE CHECKLIST:
[ ] No cold outreach language (CLAUDE.md §G — FAIL 7)
[ ] No banned terms from SOCELLE_CANONICAL_DOCTRINE.md §banned-language
[ ] No feature-first framing (features listed before business outcomes)
[ ] No "Shop" or ecommerce-first positioning (CLAUDE.md §E — FAIL 6)
[ ] Intelligence-first thesis respected (intelligence → trust → transaction)
[ ] All data claims labeled LIVE or DEMO (CLAUDE.md §F — FAIL 4)
[ ] No competitor disparagement
[ ] No unverifiable ROI claims without confidence scoring
```

### Step 3 — Apply ROI Reframing
Transform every feature mention into an outcome statement:

```
REFRAMING PATTERN:
❌ "SOCELLE provides real-time market signals"
✅ "Operators using SOCELLE intelligence report 23% faster trend adoption — here's the data behind that"

❌ "Our platform has 10 intelligence modules"
✅ "Your category decisions get backed by 10 intelligence dimensions — reducing guesswork by replacing gut feel with verified market data"

❌ "We offer wholesale marketplace features"
✅ "The intelligence layer identifies which brands your clients actually want — then the transaction module makes ordering frictionless"
```

### Step 4 — Tone Calibration
Ensure the refined output matches SOCELLE voice:

```
VOICE RULES:
- Confident but not aggressive
- Data-backed, not hyperbolic
- Consultative, not transactional
- "We help you see what's happening" not "Buy our product"
- Lead with the insight, follow with the action
- Numbers always include source or confidence level
```

### Step 5 — Structure Validation
Verify the output follows the canonical sales flow:

```
REQUIRED FLOW ORDER:
1. Discovery question (what challenge are they facing?)
2. Intelligence preview (show relevant signal or benchmark)
3. Trust proof (data source, confidence, freshness)
4. Business outcome (ROI, time saved, risk reduced)
5. Activation path (plan tier, next step — never "buy now")
```

### Step 6 — Generate Refinement Report
Output a structured report:

```json
{
  "skill": "sales-output-refiner",
  "input_type": "script | deck | email | one-pager | proposal",
  "compliance_pass": true,
  "issues_found": [],
  "issues_fixed": [],
  "banned_terms_removed": [],
  "reframings_applied": 0,
  "tone_adjustments": [],
  "flow_order_valid": true,
  "confidence": "high | medium | low",
  "refined_output_path": "docs/qa/sales-output-refiner-YYYY-MM-DD.md"
}
```

Save the refined content and report to `docs/qa/`.

## Fade Protocol
- **Review quarterly** — Update banned terms list from latest doctrine
- **Retest** — Run against 3 recent sales outputs; if reframing patterns feel stale, update examples
- **Retire** — If sales voice guidelines fundamentally change, rebuild from scratch using skill-creator

## Verification (Deterministic)
- **Command:** `find docs/qa -name "sales-output-refiner*.json" | wc -l  # expect >= 1`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/sales-output-refiner-YYYY-MM-DD.json`
- **Fail criteria:** Command returns unexpected value, report not generated, or any BLOCK-level issue found without resolution


## Stop Conditions
- **Hard stop:** Codebase does not compile (`npx tsc --noEmit` fails) — fix build before running this skill
- **Hard stop:** Target path does not exist or is empty — verify repo checkout
- **Hard stop:** Required command-line tool missing (grep, find, node) — install before proceeding
- **Soft stop (owner decision):** More than 50 issues found — present summary to owner for prioritization before attempting fixes
- **Soft stop (owner decision):** Findings contradict a command doc — escalate to owner; do not auto-fix governance
