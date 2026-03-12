---
name: idea-mining
description: "Mines SOCELLE governance docs, build tracker, and codebase for actionable product ideas, feature opportunities, and monetization angles — all filtered through intelligence-first alignment. Use this skill whenever someone asks to brainstorm features, find product opportunities, identify monetization ideas, discover gaps in the platform, or generate ideas for new modules. Also triggers on: 'brainstorm', 'feature ideas', 'what should we build', 'monetization opportunities', 'product ideas', 'gap analysis for features', 'new module ideas', 'innovation mining'. This skill ensures every idea generated aligns with the intelligence-first doctrine and can be traced to a real gap in the codebase."
---

# Idea Mining Skill

Extracts actionable product ideas from the SOCELLE codebase and governance docs, filtering everything through the intelligence-first doctrine. Ideas that don't serve the intelligence thesis are noise — this skill ensures every suggestion has a governance-backed rationale and a concrete implementation path.

## Why Governance-Backed Ideas Matter

SOCELLE's AGENTS.md §E is clear: intelligence platform first, marketplace second. Ideas that drift toward "marketplace features" or "social commerce" violate doctrine. This skill mines for ideas that strengthen the intelligence layer, then maps each one to a revenue lever.

## Step 1: Mine the Sources

Pull insights from multiple locations:

```bash
echo "=== IDEA MINING SOURCES ==="
cd SOCELLE-WEB

# Shell/stub pages (each is an unfinished feature opportunity)
echo "1. UNFINISHED FEATURES (shell pages):"
grep -rn "Coming Soon\|placeholder\|TODO\|FIXME\|stub" src/pages/ 2>/dev/null | grep -v node_modules | head -15

# Recommendations from governance docs
echo "2. GOVERNANCE RECOMMENDATIONS:"
grep -in "recommend\|should\|opportunity\|future\|roadmap\|planned" docs/command/ 2>/dev/null | head -15

# Build tracker pending items
echo "3. PENDING WORK ORDERS:"
grep "PENDING\|PLANNED" docs/build_tracker.md 2>/dev/null | head -15

# Entitlement gaps (features defined but not gated)
echo "4. ENTITLEMENT GAPS (defined but not enforced):"
grep -rn "tier\|entitlement\|gated\|premium\|pro_only" src/ 2>/dev/null | grep -v node_modules | grep -i "todo\|fixme\|stub\|placeholder" | head -10

# Unused Supabase tables (built but not wired)
echo "5. UNWIRED TABLES:"
ls supabase/migrations/ 2>/dev/null | wc -l
echo "tables in migrations"
```

## Step 2: Filter Through Doctrine

Every idea must pass the intelligence-first filter:

| Filter | Question | Disqualify If |
|--------|----------|---------------|
| Intelligence-first | Does this strengthen the intelligence layer? | Pure commerce feature |
| Revenue lever | Which revenue stream does this serve? | No clear revenue path |
| Data enrichment | Does this add or improve data? | Pure UI cosmetic change |
| User empowerment | Does this help professionals make better decisions? | Entertainment/social only |
| Technical feasibility | Can this be built with current stack? | Requires tech not in roadmap |

## Step 3: Rank and Format Ideas

Output each idea in this format:

```markdown
### Idea: [Name]
- **Intelligence thesis alignment**: [How it strengthens the intelligence layer]
- **Revenue lever**: SaaS / Affiliate / AI Add-on / Ad-Tech
- **Effort estimate**: S(1-2 days) / M(3-5 days) / L(1-2 weeks) / XL(2+ weeks)
- **Source**: [Where this idea came from — specific file/doc/gap]
- **Implementation path**: [Which files/tables/hooks need work]
- **Entitlement tier**: Free preview / Pro / Enterprise / Custom
```

## Step 4: Deduplicate Against Build Tracker

Before presenting ideas, check they don't already exist:

```bash
echo "=== DEDUP CHECK ==="
cd SOCELLE-WEB
# For each idea name, search build_tracker
grep -in "[idea_keyword]" docs/build_tracker.md 2>/dev/null
```

## Output

Write to `docs/qa/idea_mining.json`:
```json
{
  "skill": "idea-mining",
  "ideas_mined": 0,
  "ideas_passed_filter": 0,
  "ideas_duplicate": 0,
  "top_ideas": [],
  "sources_scanned": ["shell_pages", "governance_docs", "build_tracker", "entitlements", "migrations"],
  "timestamp": "ISO-8601"
}
```

## Verification (Deterministic)
- **Command:** `find docs/qa -name "idea-mining*.json" | wc -l  # expect >= 1`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/idea-mining-YYYY-MM-DD.json`
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
