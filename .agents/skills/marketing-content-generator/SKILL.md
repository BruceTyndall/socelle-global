---
name: marketing-content-generator
description: "Creates SOCELLE-aligned marketing copy including emails, social posts, landing page text, paywall messages, and campaign content. Use this skill whenever someone asks to write marketing copy, draft an email campaign, create social media content, write paywall or upgrade text, compose launch announcements, or produce any customer-facing copy for SOCELLE. Also triggers on: 'write copy', 'email blast', 'social post', 'campaign text', 'launch email', 'upgrade prompt text', 'paywall copy'. This skill enforces intelligence-first framing, B2B empowerment tone, and banned-term compliance on every piece of content."
---

# Marketing Content Generator

Creates marketing content that aligns with SOCELLE's intelligence-first positioning and B2B empowerment voice. Every piece of copy this skill generates reinforces the platform thesis: SOCELLE is an intelligence platform, not a marketplace. This matters because inconsistent messaging erodes brand trust and confuses the value proposition.

## Voice Rules (from SOCELLE_CANONICAL_DOCTRINE.md)

- **Tone**: Expert peer, not salesperson. Write as if briefing a trusted colleague.
- **Frame**: Intelligence and data empowerment first, transactions second.
- **Banned terms**: "revolutionary", "game-changing", "disruptive", "synergy", "leverage" (as verb), "utilize", "cutting-edge", "best-in-class", "world-class", "one-stop-shop", "guru", "ninja", "rockstar", "hack" (as noun), "unlock your potential" — see full list in SOCELLE_CANONICAL_DOCTRINE.md §5
- **CTA hierarchy**: Primary CTAs lead to intelligence ("Get Intelligence Access"), never to shopping ("Shop Now")
- **No outreach/cold email**: AGENTS.md §G strictly prohibits cold email copy. This skill generates content for opted-in audiences only.

## Step 1: Identify Content Type

| Type | Template | Audience |
|------|----------|----------|
| Launch email | Announcement + value prop + single CTA | Existing users |
| Upgrade prompt | Intelligence benefit + tier comparison | Free-tier users |
| Social post | Insight hook + platform mention | Industry professionals |
| Landing page section | Problem → Intelligence → Trust → Action | Prospects on-site |
| In-app notification | Contextual nudge based on usage | Active users |
| Paywall text | What you'll unlock + intelligence framing | Gated content viewers |

## Step 2: Gather Context

Before writing, pull relevant data:

```bash
echo "=== CONTENT CONTEXT ==="
cd SOCELLE-WEB

# Current tier structure for upgrade copy
echo "Tier names and pricing:"
grep -A 3 "plan.*name\|tier.*name\|price" src/ -rn 2>/dev/null | grep -v node_modules | head -10

# Intelligence modules for feature mentions
echo "Intelligence modules:"
grep -rn "module.*name\|intelligence.*hub" src/components/intelligence/ 2>/dev/null | head -10

# Current CTAs in use (for consistency)
echo "Existing CTAs:"
grep -rn "Get Intelligence\|Request Access\|Start Free\|Upgrade" src/components/ src/pages/ 2>/dev/null | grep -v node_modules | head -10
```

## Step 3: Draft Content

Apply this structure to every content piece:

1. **Hook**: Open with an intelligence insight or data point (never "Hey there!" or "Exciting news!")
2. **Value**: What the reader gains in terms of intelligence/data empowerment
3. **Proof**: Reference a specific module, signal type, or data capability
4. **Action**: Single CTA using intelligence-first language

### Content Rules
- Maximum 1 exclamation mark per piece
- No emoji in professional B2B copy (unless social platform norms require it)
- Numbers and specifics over vague claims ("47 market signals" not "tons of insights")
- Every claim must be supportable by actual platform capability
- Upgrade copy compares intelligence access tiers, never pressures

## Step 4: Compliance Check

```bash
echo "=== COPY COMPLIANCE ==="
CONTENT_FILE="$1"

# Banned terms
echo "Banned term scan:"
grep -in "revolutionary\|game-changing\|disruptive\|synergy\|leverage\|utilize\|cutting-edge\|best-in-class\|world-class\|one-stop-shop\|guru\|ninja\|rockstar\|unlock your potential" "$CONTENT_FILE" 2>/dev/null

# Sales pressure
echo "Sales pressure language:"
grep -in "act now\|limited time\|don't miss\|last chance\|hurry\|expires\|FOMO\|exclusive deal" "$CONTENT_FILE" 2>/dev/null

# Commerce-first framing
echo "Commerce-first violations:"
grep -in "shop now\|buy now\|add to cart\|browse products\|best deals" "$CONTENT_FILE" 2>/dev/null

# Cold outreach (FORBIDDEN)
echo "Cold outreach indicators:"
grep -in "reaching out\|touch base\|wanted to connect\|I noticed your\|quick question" "$CONTENT_FILE" 2>/dev/null
```

## Step 5: Output

Save generated content to the appropriate location:
- Emails → `docs/content/emails/`
- Social → `docs/content/social/`
- In-app copy → `docs/content/in-app/`

Write QA record to `docs/qa/marketing_content.json`:
```json
{
  "skill": "marketing-content-generator",
  "content_type": "launch_email|social|upgrade|paywall",
  "banned_terms_found": 0,
  "sales_pressure_found": 0,
  "commerce_first_violations": 0,
  "cta_text": "Get Intelligence Access",
  "intelligence_first": true,
  "timestamp": "ISO-8601"
}
```

## Verification (Deterministic)
- **Command:** `echo "Manual: review output against banned-term-scanner"  # deterministic via chained skill`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/marketing-content-generator-YYYY-MM-DD.json`
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
