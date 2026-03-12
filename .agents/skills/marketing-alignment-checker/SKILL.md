---
name: marketing-alignment-checker
description: ALWAYS use this skill when validating marketing campaigns, landing pages, email sequences, social content, or any marketing output for SOCELLE governance alignment. Triggers on "check marketing alignment", "validate campaign", "marketing compliance", "trend-first phrasing", "marketing audit". Ensures intelligence-first positioning, trend-first language, proper CTA hierarchy, and banned term compliance across all marketing surfaces.
---

# Marketing Alignment Checker

## Purpose
Validates any marketing output against SOCELLE canonical doctrine to ensure trend-first phrasing, intelligence-led positioning, and governance compliance. Catches ecommerce-first framing, banned terms, fake-live claims, and misaligned CTAs before they reach production.

## When to Use
- After `marketing-campaign-builder` or `marketing-content-generator` produces content
- Before publishing any landing page, email, social post, or ad copy
- When reviewing existing marketing materials for doctrine drift
- During quarterly marketing audit cycles

## Procedure

### Step 1 — Ingest Marketing Content
Accept content in any format: .md, .html, .docx, raw text, or URL path to a marketing surface. Identify the content type:

```
CONTENT TYPES:
- landing-page: Full page with headline, body, CTAs
- email-sequence: Multi-touch email campaign
- social-post: Single social media post
- ad-copy: Paid advertising copy
- blog-article: Long-form content marketing
- one-pager: PDF/doc sales collateral
- in-app-message: Portal notification or banner
```

### Step 2 — Run Trend-First Language Scan
Every marketing output must lead with intelligence/trends, not products/features:

```
TREND-FIRST VALIDATION:
[ ] Headline leads with insight, trend, or data point — NOT product name
[ ] First paragraph establishes market context before mentioning SOCELLE
[ ] Statistics include source attribution or confidence level
[ ] "Intelligence" appears before "marketplace" or "shop" in content flow
[ ] Discovery → Intelligence → Trust → Transaction flow respected

FAILURE PATTERNS:
❌ "SOCELLE: The Beauty Industry Marketplace"
✅ "The beauty industry is shifting — here's the intelligence to stay ahead"

❌ "Shop trending products on SOCELLE"
✅ "See which ingredients are gaining traction in your market — then source them"

❌ "Sign up for our platform"
✅ "Get Intelligence Access — see what's changing in your category"
```

### Step 3 — CTA Hierarchy Check
Validate that calls-to-action follow the canonical conversion flow:

```
CTA HIERARCHY (in order of priority):
1. "Get Intelligence Access" / "See Your Market" (primary — always first)
2. "Explore [Module Name]" (secondary — specific intelligence surface)
3. "Start Free Preview" (tertiary — trial activation)
4. "View Plans" (quaternary — only after value demonstrated)
5. NEVER: "Shop Now", "Buy", "Add to Cart" on public marketing surfaces

ENFORCEMENT:
- Primary CTA must appear above the fold
- No more than 2 CTA types per surface
- "Shop" CTAs allowed ONLY inside authenticated portal contexts
```

### Step 4 — Banned Terms & Voice Scan
Cross-reference against `SOCELLE_CANONICAL_DOCTRINE.md` §banned-language:

```
SCAN FOR:
- All 67+ banned terms from doctrine
- Hyperbolic claims without data backing ("revolutionary", "game-changing")
- Competitor mentions or disparagement
- Cold outreach framing (AGENTS.md §G)
- Feature-first language patterns
- Ecommerce-first positioning (AGENTS.md §E — FAIL 6)
```

### Step 5 — LIVE/DEMO Data Check
Any marketing content referencing data, numbers, or signals must be verified:

```
DATA CLAIMS CHECK:
[ ] Any "X% of professionals" claim has a real data source
[ ] Any "trending" claim links to a live signal, not a static array
[ ] Any benchmark number includes freshness date
[ ] Screenshots show DEMO badge if using mock data
[ ] "Updated X ago" timestamps derive from real updated_at columns
```

### Step 6 — Generate Alignment Report
Output structured results:

```json
{
  "skill": "marketing-alignment-checker",
  "content_type": "landing-page | email-sequence | social-post | ad-copy | blog-article",
  "overall_pass": true,
  "trend_first_score": "0-100",
  "cta_hierarchy_valid": true,
  "banned_terms_found": [],
  "voice_violations": [],
  "data_claims_verified": true,
  "ecommerce_positioning_clean": true,
  "issues": [],
  "recommendations": [],
  "report_path": "docs/qa/marketing-alignment-checker-YYYY-MM-DD.md"
}
```

Save report to `docs/qa/`.

## Fade Protocol
- **Review quarterly** — Sync banned terms list with latest doctrine updates
- **Retest** — Validate against 5 recent marketing outputs; recalibrate scoring if false positives exceed 10%
- **Retire** — If marketing voice fundamentally pivots, rebuild via skill-creator

## Verification (Deterministic)
- **Command:** `find docs/qa -name "marketing-alignment-checker*.json" | wc -l  # expect >= 1`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/marketing-alignment-checker-YYYY-MM-DD.json`
- **Fail criteria:** Command returns unexpected value, report not generated, or any BLOCK-level issue found without resolution


## Stop Conditions
- **Hard stop:** Codebase does not compile (`npx tsc --noEmit` fails) — fix build before running this skill
- **Hard stop:** Target path does not exist or is empty — verify repo checkout
- **Hard stop:** Required command-line tool missing (grep, find, node) — install before proceeding
- **Soft stop (owner decision):** More than 50 issues found — present summary to owner for prioritization before attempting fixes
- **Soft stop (owner decision):** Findings contradict a command doc — escalate to owner; do not auto-fix governance
