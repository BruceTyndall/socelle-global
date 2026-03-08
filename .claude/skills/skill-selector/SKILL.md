---
name: skill-selector
description: ALWAYS use this skill when you need to find, match, recommend, or auto-invoke the right skill for a user prompt. Triggers on "which skill", "find skill", "match skill", "suggest skill", "skill for this", "what skill should I use", "route to skill", "skill lookup", "auto-select skill". Scans the full .claude/skills/ library, matches prompt keywords and intent to skill descriptions and trigger phrases, and recommends or invokes the best-fit skill. Essential meta-skill for navigating large skill libraries (90+).
---

# Skill Selector

## Purpose
Analyzes user prompts, matches them against all available skills' descriptions and trigger phrases, and recommends or invokes the best-fit skill. As your skill library grows (currently 90+), manual selection slows workflows 20-30% — this automates skill routing by scanning metadata, scoring relevance, and presenting ranked recommendations.

## When to Use
- When unsure which skill applies to a task
- When a prompt could match multiple skills
- When onboarding someone to the skill library
- When building automation chains that need skill routing
- During scheduled audit sessions to suggest the right audit skill sequence

## Procedure

### Step 1 — Inventory All Available Skills
Scan the skills directory and build a live registry:

```bash
# Build skill inventory with names and descriptions
SKILLS_DIR=".claude/skills"
echo "=== SKILL INVENTORY ==="
for dir in "$SKILLS_DIR"/*/; do
  skill_name=$(basename "$dir")
  if [ -f "$dir/SKILL.md" ]; then
    # Extract description from YAML frontmatter
    description=$(sed -n '/^description:/,/^---$/p' "$dir/SKILL.md" | head -1 | sed 's/^description: //')
    echo "[$skill_name] $description"
  fi
done
```

### Step 2 — Parse the User Prompt
Extract intent signals from the user's request:

```
INTENT EXTRACTION:
1. Primary action verb: create | audit | check | validate | generate | refine | simulate | forecast | optimize | enforce
2. Domain keywords: sales | marketing | education | design | dev | strategy | billing | legal | data | security
3. Target object: component | campaign | module | script | model | pipeline | prototype | forecast | report
4. Governance signals: banned terms | LIVE/DEMO | Pearl Mineral | doctrine | entitlement | compliance
5. Meta signals: "which skill" | "help me find" | "what should I use" | "route this"
```

### Step 3 — Score Skills Against Prompt
Match the extracted intent against each skill's metadata:

```
SCORING ALGORITHM:
For each skill in inventory:
  score = 0

  # Name match (exact keyword in skill name)
  if prompt contains skill_name_keyword → score += 30

  # Description trigger match (keywords in description)
  for each trigger_word in skill.description:
    if prompt contains trigger_word → score += 10

  # Domain match (skill category matches prompt domain)
  if skill.layer matches prompt.domain → score += 20

  # Action match (skill purpose verb matches prompt verb)
  if skill.purpose_verb matches prompt.action → score += 15

  # Governance match (governance keywords present)
  if prompt has governance_signal AND skill handles governance → score += 25

RANKING:
  Sort skills by score descending
  Return top 3 matches with scores
  Flag ties for user disambiguation
```

### Step 4 — Apply Disambiguation Rules
When multiple skills score similarly, apply tiebreakers:

```
DISAMBIGUATION RULES:
1. PREFERENCE OVER CAPABILITY: If both a Layer B (Capability) and Layer C (Preference) skill match,
   recommend running Capability first, then Preference as refinement.
   Example: "Write a sales script" → sales-script-generator THEN sales-output-refiner

2. AUDIT CHAIN: If the prompt implies quality checking, recommend the audit execution order
   from SOCELLE_SKILLS_MASTER.md (security → data → design → copy → code → governance)

3. SPECIFICITY WINS: More specific skill beats general skill.
   Example: "Check Pearl Mineral colors" → design-standard-enforcer (specific) over design-lock-enforcer (broader)

4. GENERATOR vs CHECKER: If prompt says "create/generate/build" → Layer B skill.
   If prompt says "check/audit/validate/enforce" → Layer A or C skill.

5. COMPOUND TASKS: If prompt requires multiple skills, return a recommended sequence:
   Example: "Build a campaign and make sure it's on-brand"
   → marketing-campaign-builder → marketing-alignment-checker → tone-voice-auditor
```

### Step 5 — Generate Recommendation
Output a structured recommendation:

```json
{
  "skill": "skill-selector",
  "user_prompt_summary": "string — condensed version of what user asked",
  "top_matches": [
    {
      "rank": 1,
      "skill_name": "string",
      "score": 0,
      "reason": "string — why this skill matches",
      "layer": "A | B | C | D",
      "action": "invoke | suggest"
    },
    {
      "rank": 2,
      "skill_name": "string",
      "score": 0,
      "reason": "string",
      "layer": "A | B | C | D",
      "action": "suggest"
    },
    {
      "rank": 3,
      "skill_name": "string",
      "score": 0,
      "reason": "string",
      "layer": "A | B | C | D",
      "action": "suggest"
    }
  ],
  "recommended_sequence": ["skill-1", "skill-2"],
  "confidence": "high | medium | low",
  "ambiguous": false,
  "disambiguation_needed": "string | null"
}
```

### Step 6 — Auto-Invoke or Suggest

```
INVOCATION RULES:
- Score >= 80 AND single clear match → Auto-invoke (run the skill directly)
- Score 50-79 OR multiple close matches → Suggest top 3, ask user to confirm
- Score < 50 → No strong match; describe what's available and ask user to clarify

PRESENTATION FORMAT:
"Based on your request, I recommend:
 1. **[skill-name]** (score: X) — [one-line reason]
 2. **[skill-name]** (score: X) — [one-line reason]
 3. **[skill-name]** (score: X) — [one-line reason]

 Shall I run #1, or would you prefer a different skill?"
```

### Step 7 — Handle No-Match Scenarios
When no skill matches well:

```
NO-MATCH RESPONSE:
1. Acknowledge the gap: "No existing skill closely matches this task."
2. Suggest closest partial matches (if any score > 30)
3. Recommend creating a new skill: "Want me to use skill-creator to build one?"
4. Log the gap for quarterly review: append to docs/qa/skill-gaps.md
```

### Step 8 — Skill Library Health Report (Optional)
When invoked with "audit" or "health check" intent, generate a library overview:

```
LIBRARY HEALTH METRICS:
- Total skills: [count]
- Skills by layer: A=[n], B=[n], C=[n], D=[n], System=[n]
- Most-triggered skills (by keyword frequency in recent prompts): [top 5]
- Least-triggered skills (potential fade candidates): [bottom 5]
- Coverage gaps: [domains with no skill coverage]
- Recommended additions: [based on gap analysis]
```

## Integration Points

### Hooks Integration
Add to `.claude/hooks.json` (when supported):
```json
{
  "pre-prompt": {
    "skill-selector": {
      "trigger": "always",
      "action": "score-and-suggest",
      "threshold": 70
    }
  }
}
```

### Scheduler Integration
Schedule periodic skill health checks:
```
Schedule: Weekly (Mondays 9:00 AM)
Task: Run skill-selector in audit mode
Output: docs/qa/skill-library-health-YYYY-MM-DD.md
```

### Chain with skill-creator
When skill-selector identifies a gap:
1. Log gap to `docs/qa/skill-gaps.md`
2. Suggest: "Run skill-creator to build [gap-skill]?"
3. After creation, re-index the library

## Fade Protocol
- **Review quarterly** — Re-scan all skill descriptions for accuracy; update scoring weights if new patterns emerge
- **Retest** — Run 10 sample prompts through the selector; verify top-1 accuracy ≥ 80%
- **Retire** — If Claude's native skill routing becomes sufficient, this becomes redundant — retire gracefully

## Verification (Deterministic)
- **Command:** `find docs/qa -name "skill-selector*.json" | wc -l  # expect >= 1`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/skill-selector-YYYY-MM-DD.json`
- **Fail criteria:** Command returns unexpected value, report not generated, or any BLOCK-level issue found without resolution


## Stop Conditions
- **Hard stop:** Codebase does not compile (`npx tsc --noEmit` fails) — fix build before running this skill
- **Hard stop:** Target path does not exist or is empty — verify repo checkout
- **Hard stop:** Required command-line tool missing (grep, find, node) — install before proceeding
- **Soft stop (owner decision):** More than 50 issues found — present summary to owner for prioritization before attempting fixes
- **Soft stop (owner decision):** Findings contradict a command doc — escalate to owner; do not auto-fix governance
