---
name: tone-voice-auditor
description: "Deep audits all customer-facing copy for SOCELLE's B2B empowerment voice, intelligence-first framing, and anti-sales-pressure rules. Goes beyond banned-term-scanner by evaluating sentence-level tone, rewriting violations, and scoring overall voice consistency. Use this skill whenever someone asks to audit voice/tone, review copy for brand consistency, check messaging alignment, rewrite marketing text, or evaluate whether content sounds like SOCELLE. Also triggers on: 'tone audit', 'voice check', 'brand voice', 'copy review', 'rewrite for voice', 'messaging consistency', 'does this sound right', 'brand alignment check'."
---

# Tone & Voice Auditor

Performs deep copy audits beyond keyword scanning — evaluating sentence-level tone, rewriting violations, and scoring voice consistency. The banned-term-scanner catches individual words; this skill evaluates whether the overall feel of the copy matches SOCELLE's expert-peer voice. A page can have zero banned terms and still sound like a generic SaaS landing page if the framing is wrong.

## SOCELLE Voice Profile

| Dimension | Target | Anti-Pattern |
|-----------|--------|-------------|
| Authority level | Expert peer briefing a colleague | Teacher lecturing a student |
| Emotional register | Confident, calm, data-backed | Urgent, excited, fear-based |
| Value framing | Intelligence empowers your decisions | Our product is amazing |
| Action language | Access intelligence / Explore data / Review signals | Buy now / Don't miss / Limited time |
| Complexity | Professional but accessible | Jargon-heavy or dumbed-down |

## Step 1: Collect All Customer-Facing Copy

```bash
echo "=== COPY COLLECTION ==="
cd SOCELLE-WEB

# Page titles and headings
echo "H1/H2 headings:"
grep -rn "<h1\|<h2\|<H1\|<H2\|heading.*1\|heading.*2" src/pages/ src/components/ 2>/dev/null | grep -v node_modules | head -20

# CTA button text
echo "CTA text:"
grep -rn "className.*btn\|Button.*>\|cta\|CTA" src/ 2>/dev/null | grep -v node_modules | head -15

# Meta descriptions
echo "Meta/SEO copy:"
grep -rn "meta.*description\|og:description\|helmet" src/ 2>/dev/null | grep -v node_modules | head -10

# Error messages and empty states
echo "Error/empty state copy:"
grep -rn "error.*message\|empty.*state\|no.*results\|not.*found" src/ 2>/dev/null | grep -v node_modules | head -10
```

## Step 2: Score Each Surface

Rate each copy surface on a 1-5 scale:

| Score | Meaning |
|-------|---------|
| 5 | Perfect SOCELLE voice — intelligence-first, expert-peer tone |
| 4 | Good with minor improvements possible |
| 3 | Acceptable but generic — could be any SaaS platform |
| 2 | Misaligned — sales pressure, marketplace framing, or wrong tone |
| 1 | Violation — banned terms, cold outreach language, or commerce-first |

## Step 3: Rewrite Violations

For any surface scoring ≤ 3, provide a rewrite:

```markdown
**Original** (score: 2): "Shop the latest trending products handpicked by experts!"
**Rewrite** (score: 5): "See which products are gaining market traction — backed by intelligence from 200+ professional sources."
**Why**: Original leads with commerce ("shop"), uses hype language ("latest trending"), and positions curation over data. Rewrite leads with intelligence, cites data backing, and positions products as market signals.
```

## Step 4: Consistency Score

Calculate an overall voice consistency score:
- Total surfaces audited
- Average score
- % scoring ≥ 4 (on-brand)
- % scoring ≤ 2 (violations)

## Output

Write to `docs/qa/tone_voice_audit.json`:
```json
{
  "skill": "tone-voice-auditor",
  "surfaces_audited": 0,
  "average_score": 0.0,
  "on_brand_pct": 0.0,
  "violation_pct": 0.0,
  "rewrites_needed": 0,
  "top_violations": [],
  "timestamp": "ISO-8601"
}
```

## Verification (Deterministic)
- **Command:** `echo "Manual: verify score 0-100 produced and rewrites provided for violations"  # check JSON output`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/tone-voice-auditor-YYYY-MM-DD.json`
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
