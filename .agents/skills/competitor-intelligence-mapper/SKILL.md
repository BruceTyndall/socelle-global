---
name: competitor-intelligence-mapper
description: "Maps SOCELLE's competitive landscape, analyzes feature parity with competitors, and identifies differentiation opportunities in the professional beauty intelligence space. Use this skill whenever someone asks about competitive analysis, market positioning, feature comparison, differentiation strategy, or competitive intelligence. Also triggers on: 'competitors', 'competitive analysis', 'market positioning', 'feature comparison', 'differentiation', 'competitive landscape', 'who are we competing with', 'market gap'. Understanding the competitive landscape informs product priorities and messaging."
---

# Competitor Intelligence Mapper

Maps SOCELLE's position in the professional beauty intelligence market. Without clear competitive awareness, product decisions happen in a vacuum and messaging fails to differentiate. This skill provides a structured framework for ongoing competitive analysis.

## Step 1: Define Competitive Categories

SOCELLE competes across multiple categories because of its intelligence-first thesis:

| Category | What They Do | SOCELLE Advantage |
|----------|-------------|-------------------|
| Beauty industry data platforms | Market data, trend reports | Real-time intelligence vs static reports |
| B2B beauty marketplaces | Product ordering | Intelligence layer on top of transactions |
| Professional beauty SaaS | Salon/spa management | Intelligence + management in one platform |
| AI beauty tools | Skin analysis, product matching | Professional-grade intelligence, not consumer |
| Industry publications | Beauty news, trend coverage | Actionable data vs editorial content |

## Step 2: Feature Parity Matrix

Build a feature matrix comparing SOCELLE's capabilities:

```bash
echo "=== SOCELLE FEATURE INVENTORY ==="
cd SOCELLE-WEB

# Intelligence features
echo "Intelligence modules:"
grep -rn "Intelligence\|intelligence" src/components/ src/pages/ 2>/dev/null | grep -v node_modules | grep -i "module\|hub\|dashboard\|signal\|trend\|benchmark" | head -15

# AI tools
echo "AI tools:"
grep -rn "aiTool\|ai_tool\|AITool\|service.*menu" src/ 2>/dev/null | grep -v node_modules | head -10

# Portal features
echo "Portal capabilities:"
ls src/pages/portal/ src/pages/brand/ src/pages/admin/ 2>/dev/null | head -20

# Entitlement-gated features
echo "Premium features:"
grep -rn "tier.*required\|premium\|enterprise.*only\|pro.*feature" src/ 2>/dev/null | grep -v node_modules | head -10
```

## Step 3: Differentiation Analysis

For each competitor category, document:

```markdown
### vs [Competitor Category]

**They offer**: [Feature list]
**We offer**: [Our features in this space]
**Our advantage**: [Why intelligence-first wins]
**Their advantage**: [Where they're stronger — be honest]
**Gap to close**: [What we need to build to compete]
**Messaging angle**: [How to position against them]
```

## Step 4: Product Priority Recommendations

Based on competitive gaps, generate prioritized recommendations:
- Must-have features (competitive parity requirements)
- Nice-to-have features (differentiation enhancers)
- Ignore features (not aligned with intelligence-first thesis)

## Output

Write to `docs/qa/competitive_intelligence.json`:
```json
{
  "skill": "competitor-intelligence-mapper",
  "categories_analyzed": 0,
  "features_compared": 0,
  "parity_gaps": [],
  "differentiation_strengths": [],
  "priority_recommendations": [],
  "timestamp": "ISO-8601"
}
```

## Verification (Deterministic)
- **Command:** `find docs/qa -name "competitor-intelligence-mapper*.json" | wc -l  # expect >= 1`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/competitor-intelligence-mapper-YYYY-MM-DD.json`
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
