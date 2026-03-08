---
name: marketing-campaign-builder
description: "Builds multi-channel marketing campaigns from SOCELLE intelligence trends, coordinating email sequences, social content, landing pages, and in-app messaging into cohesive campaign plans. Use this skill whenever someone asks to build a campaign, plan a launch, create a content calendar, design a drip sequence, or coordinate multi-channel marketing. Also triggers on: 'campaign plan', 'launch campaign', 'content calendar', 'drip sequence', 'email sequence', 'multi-channel', 'campaign builder', 'marketing plan', 'launch strategy'. Every campaign leads with intelligence value — we market data empowerment, not product features."
---

# Marketing Campaign Builder

Builds cohesive multi-channel campaigns that position SOCELLE's intelligence as the hero. Unlike one-off content generation (see `marketing-content-generator`), this skill orchestrates full campaigns across channels with sequencing, audience segmentation, and conversion tracking plans.

## Campaign Architecture

Every SOCELLE campaign follows the intelligence-first funnel:

```
Discovery → Intelligence Preview → Trust Building → Conversion → Activation
```

| Stage | Channel | Content Type | CTA |
|-------|---------|-------------|-----|
| Discovery | Social, SEO, PR | Trend insights, data stories | "See the full signal" |
| Intelligence Preview | Landing page, webinar | Live data demo, category report | "Get Intelligence Access" |
| Trust Building | Email sequence, education | Protocol deep-dives, case data | "Explore your category" |
| Conversion | In-app, email | Tier comparison, free trial | "Start your free trial" |
| Activation | In-app, push | Personalized alerts, first AI tool use | "Set up your first alert" |

## Step 1: Define Campaign Parameters

Every campaign needs:
- **Trigger**: What intelligence trend or business event triggers this campaign?
- **Audience segment**: Which persona/tier/category?
- **Goal**: Awareness / Trial signup / Upgrade / Re-engagement
- **Duration**: Sprint (1 week) / Standard (2-4 weeks) / Evergreen (ongoing)
- **Channels**: Email + Social + In-app + Landing page (select applicable)

## Step 2: Generate Channel Content

### Email Sequence (3-5 emails)
```markdown
Email 1 (Day 0): Intelligence hook — share a compelling data point
Email 2 (Day 3): Deep dive — expand on the trend with category-specific data
Email 3 (Day 7): Social proof — show how professionals use this intelligence
Email 4 (Day 10): Value demonstration — preview a relevant AI tool
Email 5 (Day 14): Conversion — clear tier comparison with intelligence framing
```

### Social Content (5-10 posts)
- Data visualizations from intelligence modules
- "Did you know?" intelligence facts for the beauty industry
- Category-specific trend callouts
- Professional testimonial cards (intelligence-focused, not feature-focused)

### Landing Page Brief
- Hero: Intelligence headline with real data point
- Body: 3 intelligence modules most relevant to campaign audience
- Proof: Data freshness indicators, source count
- CTA: "Get Intelligence Access" (primary), "See a demo" (secondary)

### In-App Messaging
- Triggered nudges based on usage patterns
- Upgrade prompts tied to intelligence value (not feature gates)
- Re-engagement for inactive users with fresh intelligence teaser

## Step 3: Build Conversion Tracking Plan

```markdown
## Tracking Plan
| Metric | Source | Target |
|--------|--------|--------|
| Email open rate | Email provider | >25% |
| Email click rate | Email provider | >5% |
| Landing page conversion | Analytics | >3% |
| Trial signup | Supabase access_requests | >2% of visitors |
| Trial → Paid conversion | Stripe | >10% of trials |
```

## Step 4: Compliance and Governance Check

```bash
echo "=== CAMPAIGN COMPLIANCE ==="
# Verify all campaign content passes doctrine
# Run language-linter on all copy
# Run cta-validator on all CTAs
# Run voice-enforcer on tone
# Verify no cold outreach (CLAUDE.md §G)
echo "Campaign copy must pass: language-linter, cta-validator, voice-enforcer"
echo "No cold outreach components allowed"
```

## Output

Write campaign plan to `docs/marketing/campaigns/[campaign-name].md`
Write QA to `docs/qa/campaign_builder.json`:
```json
{
  "skill": "marketing-campaign-builder",
  "campaign_name": "",
  "audience_segment": "",
  "channels": [],
  "email_count": 0,
  "social_posts": 0,
  "landing_pages": 0,
  "governance_pass": true,
  "cold_outreach_violations": 0,
  "timestamp": "ISO-8601"
}
```

## Fade Protocol
Update when: new channels are added, tier structure changes, new intelligence modules launch, or campaign performance data reveals which patterns convert best.

## Verification (Deterministic)
- **Command:** `find docs/qa -name "marketing-campaign-builder*.json" | wc -l  # expect >= 1`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/marketing-campaign-builder-YYYY-MM-DD.json`
- **Fail criteria:** Command returns unexpected value, report not generated, or any BLOCK-level issue found without resolution


## Stop Conditions
- **Hard stop:** Codebase does not compile (`npx tsc --noEmit` fails) — fix build before running this skill
- **Hard stop:** Target path does not exist or is empty — verify repo checkout
- **Hard stop:** Required command-line tool missing (grep, find, node) — install before proceeding
- **Soft stop (owner decision):** More than 50 issues found — present summary to owner for prioritization before attempting fixes
- **Soft stop (owner decision):** Findings contradict a command doc — escalate to owner; do not auto-fix governance
