---
name: investor-readiness-checker
description: "Audits SOCELLE's platform, metrics, documentation, and business model for investor presentation readiness. Use this skill whenever someone asks about fundraising prep, investor materials, pitch deck data, due diligence readiness, metrics dashboard, or financial modeling. Also triggers on: 'investor ready', 'fundraising', 'pitch deck data', 'due diligence', 'metrics for investors', 'financial model', 'unit economics', 'ARR', 'MRR', 'CAC', 'LTV', 'runway'. This skill ensures the platform can back up every claim in a pitch with real data."
---

# Investor Readiness Checker

Audits platform readiness for investor scrutiny. Investors in B2B SaaS will test every claim — "real-time intelligence" must show real data, "enterprise-grade" must pass security audit, and revenue metrics must be verifiable. This skill identifies gaps between pitch claims and platform reality.

## Step 1: Metrics Availability

```bash
echo "=== INVESTOR METRICS ==="
cd SOCELLE-WEB

# User metrics
echo "User tracking:"
grep -rn "user.*count\|active.*users\|DAU\|MAU\|signup\|registration" src/ supabase/ 2>/dev/null | grep -v node_modules | head -10

# Revenue metrics
echo "Revenue tracking:"
grep -rn "revenue\|MRR\|ARR\|subscription.*count\|paying.*user" src/ supabase/ 2>/dev/null | grep -v node_modules | head -10

# Engagement metrics
echo "Engagement tracking:"
grep -rn "session.*duration\|page.*view\|event.*track\|analytics\|posthog\|mixpanel" src/ 2>/dev/null | grep -v node_modules | head -10

# Churn tracking
echo "Churn tracking:"
grep -rn "churn\|cancel\|downgrade\|unsubscribe" src/ supabase/ 2>/dev/null | grep -v node_modules | head -5
```

## Step 2: Technical Due Diligence Readiness

| Area | Investor Question | Check |
|------|-------------------|-------|
| Security | "How do you handle data security?" | RLS, auth, secrets, HTTPS |
| Scalability | "Can this handle 10x users?" | DB indexing, code splitting, CDN |
| Data moat | "What's your defensible data advantage?" | Proprietary data sources, feed count |
| AI IP | "What's proprietary about your AI?" | Custom models vs API wrappers |
| Architecture | "Show me the tech stack" | Clean monorepo, typed, tested |

```bash
echo "=== TECH DD READINESS ==="
cd SOCELLE-WEB

# Test coverage
echo "Test files:"
find . -name "*.test.*" -o -name "*.spec.*" | grep -v node_modules | wc -l

# TypeScript strictness
echo "TypeScript strict mode:"
grep "strict" tsconfig.json 2>/dev/null

# CI/CD pipeline
echo "CI/CD:"
find . -name "*.yml" -path "*/.github/*" 2>/dev/null | head -5
```

## Step 3: Claims vs Reality Audit

For each common pitch claim, verify:

| Claim | Verification Method | Status |
|-------|-------------------|--------|
| "Real-time intelligence" | Check for live data sources with `updated_at` | LIVE/DEMO |
| "200+ data sources" | Count feeds in feed pipeline | Count |
| "10 intelligence modules" | Verify all 10 exist and are functional | Module check |
| "Enterprise-grade security" | RLS, auth, encryption audit | Security score |
| "$X ARR" | Verify from Stripe or DB | Revenue check |

## Output

Write to `docs/qa/investor_readiness.json`:
```json
{
  "skill": "investor-readiness-checker",
  "metrics_available": [],
  "metrics_missing": [],
  "claims_verified": 0,
  "claims_unverifiable": 0,
  "tech_dd_score": "A-F",
  "security_score": "A-F",
  "recommendations": [],
  "timestamp": "ISO-8601"
}
```

## Verification (Deterministic)
- **Command:** `find docs/qa -name "investor-readiness-checker*.json" | wc -l  # expect >= 1`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/investor-readiness-checker-YYYY-MM-DD.json`
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
