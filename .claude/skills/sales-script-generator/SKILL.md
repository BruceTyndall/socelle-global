---
name: sales-script-generator
description: "Creates personalized sales scripts, demo talking points, and discovery call frameworks from prospect profiles and SOCELLE intelligence data. Use this skill whenever someone asks to write a sales script, prepare for a demo, build a discovery call guide, create pitch talking points, or personalize outreach for a specific prospect. Also triggers on: 'sales script', 'demo prep', 'discovery call', 'pitch deck talking points', 'prospect briefing', 'demo walkthrough', 'sales call prep', 'personalized pitch'. IMPORTANT: This skill generates scripts for inbound/warm prospects only — CLAUDE.md §G prohibits cold outreach. All scripts lead with intelligence value, never product features."
---

# Sales Script Generator

Creates personalized, intelligence-first sales scripts for warm prospects and inbound leads. SOCELLE's acquisition model is on-site (no cold outreach per CLAUDE.md §G), so these scripts are for prospects who have already expressed interest through `/request-access` or inbound channels. Every script positions intelligence as the value hook — the product demo is a data walkthrough, not a feature tour.

## Why Intelligence-First Sales Matters

Traditional SaaS sales leads with features ("Let me show you our dashboard"). SOCELLE leads with the prospect's own data: "Here's what the market signals say about your category in your region." This reframes the demo as a consultation, not a pitch.

## Step 1: Build Prospect Profile

Before generating any script, gather:

```bash
echo "=== PROSPECT CONTEXT ==="
cd SOCELLE-WEB

# What roles/personas exist in the system
echo "Defined personas:"
grep -rn "persona\|role.*type\|user.*type\|Operator\|Provider\|Brand" src/types/ src/integrations/ 2>/dev/null | grep -v node_modules | head -10

# Intelligence modules available for demo
echo "Demo-able intelligence modules:"
grep -rn "Intelligence\|intelligence.*module\|intelligence.*hub" src/components/intelligence/ src/pages/ 2>/dev/null | grep -v node_modules | head -10

# Tier features for value conversation
echo "Tier features:"
grep -rn "plan.*feature\|tier.*include\|entitlement" src/ 2>/dev/null | grep -v node_modules | head -10
```

Prospect inputs needed:
- **Role**: Operator (salon/spa owner), Provider (professional), Brand (manufacturer/distributor), or Admin
- **Category**: Skincare, haircare, nails, wellness, medspa, devices
- **Region**: US market, specific state/metro
- **Pain point**: Market visibility, competitive intel, supplier intelligence, trend tracking
- **Current tools**: What they use today for intelligence/data

## Step 2: Generate Script Framework

Every SOCELLE sales script follows this structure:

### Discovery Call (15-20 min)
```markdown
## Opening (2 min)
"Thanks for requesting access to SOCELLE. I saw you're [role] in [category] — 
I'd love to understand what market intelligence you're working with today 
so I can show you the most relevant data."

## Discovery Questions (8 min)
1. "How do you currently track [category] trends in your market?"
2. "When a new ingredient or treatment gains traction, how quickly do you hear about it?"
3. "How do you benchmark your [category] performance against the market?"
4. "What's your biggest blind spot when making purchasing or service menu decisions?"

## Intelligence Preview (5 min)
"Based on what you've shared, let me show you what SOCELLE's intelligence 
layer sees for [category] in [region]..."
→ Share 2-3 relevant market signals from the Intelligence Hub
→ Show one benchmark comparison relevant to their category
→ Demonstrate a trend stack for their vertical

## Next Step (3 min)
"Would it be useful to set up your portal with alerts for [specific signals 
they reacted to]? That's included in our [appropriate tier]."
```

### Demo Walkthrough (30 min)
```markdown
## Context Setting (3 min)
- Reference their discovery call pain points
- Frame the demo as "walking through your market data"

## Intelligence Hub Tour (15 min)
1. KPI Strip — "Here's your category's real-time pulse"
2. Signal Table — "These are the market movements in [their category]"
3. Trend Stacks — "This is where [category] is heading over 6 months"
4. Category Intelligence — "Your specific vertical benchmarks"
5. Brand Health Monitor — "Track the brands you care about"

## AI Tools Demo (7 min)
- Show 1-2 AI tools relevant to their role
- Demonstrate credit usage and value per query

## Pricing Conversation (5 min)
- Map their needs to tier: Free trial → Pro → Enterprise
- Frame upgrade as "more intelligence access" not "more features"
```

## Step 3: Compliance Check

Every generated script must pass:

```bash
echo "=== SCRIPT COMPLIANCE ==="
SCRIPT_FILE="$1"

# No cold outreach language
echo "Cold outreach indicators (MUST be zero):"
grep -in "reaching out\|touch base\|wanted to connect\|cold\|prospect list" "$SCRIPT_FILE" 2>/dev/null

# No feature-first framing
echo "Feature-first violations:"
grep -in "our product\|our platform\|we offer\|we provide\|our solution" "$SCRIPT_FILE" 2>/dev/null

# Intelligence-first framing present
echo "Intelligence-first markers:"
grep -in "market signal\|intelligence\|data\|trend\|benchmark\|insight" "$SCRIPT_FILE" 2>/dev/null | wc -l

# Banned terms
echo "Banned terms:"
grep -in "revolutionary\|game-changing\|best-in-class\|cutting-edge\|world-class" "$SCRIPT_FILE" 2>/dev/null
```

## Step 4: Personalize and Output

For each prospect, output:
- Discovery call script (markdown)
- Demo walkthrough with module sequence (markdown)
- Pre-call briefing with relevant intelligence data points
- Follow-up email template (intelligence-first, not sales-y)

Write to `docs/sales/scripts/[prospect-name].md` and QA to `docs/qa/sales_script.json`:
```json
{
  "skill": "sales-script-generator",
  "prospect_role": "",
  "prospect_category": "",
  "script_type": "discovery|demo|followup",
  "cold_outreach_violations": 0,
  "feature_first_violations": 0,
  "intelligence_first_markers": 0,
  "banned_terms": 0,
  "timestamp": "ISO-8601"
}
```

## Fade Protocol
This skill references specific intelligence modules and tier names. Update quarterly when:
- Intelligence modules are added or renamed
- Tier structure changes
- New AI tools are launched
- Pricing changes

## Verification (Deterministic)
- **Command:** `find docs/qa -name "sales-script-generator*.json" | wc -l  # expect >= 1`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/sales-script-generator-YYYY-MM-DD.json`
- **Fail criteria:** Command returns unexpected value, report not generated, or any BLOCK-level issue found without resolution


## Stop Conditions
- **Hard stop:** Codebase does not compile (`npx tsc --noEmit` fails) — fix build before running this skill
- **Hard stop:** Target path does not exist or is empty — verify repo checkout
- **Hard stop:** Required command-line tool missing (grep, find, node) — install before proceeding
- **Soft stop (owner decision):** More than 50 issues found — present summary to owner for prioritization before attempting fixes
- **Soft stop (owner decision):** Findings contradict a command doc — escalate to owner; do not auto-fix governance
