---
name: legal-compliance-checker
description: "Scans SOCELLE platform outputs, Terms of Service, disclaimers, and AI-generated content for legal and regulatory compliance risks. Use this skill whenever someone asks about legal compliance, FDA disclaimers, HIPAA considerations, FTC requirements, Terms of Service review, privacy policy audit, medical-adjacent language risks, or AI output liability. Also triggers on: 'compliance check', 'legal risk', 'disclaimer', 'terms of service', 'privacy policy', 'FDA', 'HIPAA', 'FTC', 'medical claims', 'AI liability'. This is critical for SOCELLE because the beauty/wellness industry sits adjacent to medical claims where regulatory missteps can be existential."
---

# Legal Compliance Checker

Scans platform content and AI outputs for legal/regulatory risk. SOCELLE operates in professional beauty — a space adjacent to medical claims (skincare efficacy, ingredient safety, treatment outcomes). Unqualified claims can trigger FDA enforcement, FTC deceptive advertising actions, or HIPAA violations if handling client health data. This skill exists to catch these risks before they reach production.

## Regulatory Framework

| Authority | Risk Area | SOCELLE Exposure |
|-----------|-----------|------------------|
| FDA | Product efficacy claims, "drug" language | Brand product descriptions, intelligence signals about ingredients |
| FTC | Testimonials, endorsements, affiliate disclosure | Affiliate links, brand partnerships, provider reviews |
| HIPAA | Protected health information | If portal ever handles client treatment records |
| State cosmetology boards | Scope of practice claims | Professional protocol recommendations |
| GDPR/CCPA | Data collection, consent, right to delete | User profiles, tracking, analytics |

## Step 1: Identify Scan Scope

Determine what needs checking:

```bash
echo "=== COMPLIANCE SCAN SCOPE ==="
cd SOCELLE-WEB

# AI output surfaces (highest risk)
echo "AI-generated content surfaces:"
grep -rn "aiGenerated\|ai_output\|generatedText\|GPT\|claude\|openai" src/ 2>/dev/null | grep -v node_modules | wc -l

# Medical-adjacent language
echo "Medical-adjacent terms:"
grep -rin "cure\|treat\|heal\|diagnose\|medical\|clinical\|FDA.approved\|dermatologist.tested" src/ 2>/dev/null | grep -v node_modules | head -15

# Disclaimer presence
echo "Disclaimer components:"
grep -rn "Disclaimer\|disclaimer\|legal.*notice\|terms.*conditions" src/ 2>/dev/null | grep -v node_modules | head -10

# Affiliate/endorsement markers
echo "Affiliate disclosure:"
grep -rn "affiliate\|sponsored\|partnership\|endorsement\|#ad\|paid.*promotion" src/ 2>/dev/null | grep -v node_modules | head -10
```

## Step 2: Check AI Output Guardrails

Every AI-generated surface must have:
1. **Output disclaimer**: "AI-generated content — verify with qualified professionals"
2. **Medical block**: Refuses to provide medical advice or treatment recommendations
3. **Financial block**: Refuses to provide specific financial/investment advice
4. **PENDING_REVIEW flag**: Human review required before publishing AI-generated brand recommendations

```bash
echo "=== AI GUARDRAIL CHECK ==="
cd SOCELLE-WEB

# Check for guardrail patterns
echo "AI disclaimer components:"
grep -rn "PENDING_REVIEW\|ai.*disclaimer\|not.*medical.*advice\|consult.*professional" src/ 2>/dev/null | grep -v node_modules | head -10

# Check edge functions for output filtering
echo "Edge function guardrails:"
grep -rn "block\|filter\|moderate\|guardrail\|safety" supabase/functions/ 2>/dev/null | head -10
```

## Step 3: Terms of Service Audit

```bash
echo "=== TOS/PRIVACY AUDIT ==="
cd SOCELLE-WEB

# Check for TOS/Privacy pages
echo "Legal pages:"
grep -rn "terms\|privacy.*policy\|cookie.*policy\|acceptable.*use" src/pages/ 2>/dev/null | grep -v node_modules | head -10

# Data collection points
echo "Data collection forms:"
grep -rn "onSubmit\|handleSubmit\|form.*action" src/ 2>/dev/null | grep -v node_modules | wc -l

# Consent mechanisms
echo "Consent checkboxes/banners:"
grep -rn "consent\|cookie.*banner\|opt.in\|agree.*terms" src/ 2>/dev/null | grep -v node_modules | head -10
```

## Step 4: Risk Classification

Classify each finding:
- **CRITICAL**: Medical claims without disclaimer, missing HIPAA safeguards, no AI output guardrails
- **HIGH**: Missing FTC affiliate disclosure, no TOS/Privacy pages, GDPR consent gaps
- **MEDIUM**: Vague disclaimers, inconsistent disclaimer placement
- **LOW**: Best-practice improvements, language softening

## Output

Write to `docs/qa/legal_compliance.json`:
```json
{
  "skill": "legal-compliance-checker",
  "critical_findings": [],
  "high_findings": [],
  "medium_findings": [],
  "low_findings": [],
  "ai_guardrails_present": true,
  "disclaimer_pages_exist": true,
  "affiliate_disclosure_compliant": true,
  "medical_claims_found": 0,
  "timestamp": "ISO-8601"
}
```

## Verification (Deterministic)
- **Command:** `find docs/qa -name "legal-compliance-checker*.json" | wc -l  # expect >= 1`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/legal-compliance-checker-YYYY-MM-DD.json`
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
