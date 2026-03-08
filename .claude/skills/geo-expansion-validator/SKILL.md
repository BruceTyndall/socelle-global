---
name: geo-expansion-validator
description: "Audits SOCELLE platform readiness for international market expansion including data coverage, regulatory compliance, localization, and currency support. Use this skill whenever someone asks about international expansion, geographic readiness, localization, multi-currency support, GDPR compliance, regional data sources, or market entry planning. Also triggers on: 'international', 'expansion', 'localization', 'i18n', 'GDPR', 'multi-currency', 'regional', 'market entry', 'global readiness', 'SEA expansion', 'EU expansion', 'LATAM'."
---

# Geo-Expansion Validator

Audits platform readiness for international markets. SOCELLE's Phase 2 roadmap includes SEA, EU, and LATAM expansion — each market brings unique data source requirements, regulatory frameworks, and localization needs. Expanding without validation means launching with blind spots that undermine intelligence credibility in new markets.

## Expansion Readiness Matrix

| Dimension | US (Baseline) | EU | SEA | LATAM |
|-----------|---------------|-----|-----|-------|
| Data sources | Professional beauty feeds | GDPR-compliant feeds needed | Korean MFDS, J-beauty sources | Brazil ANVISA, regional brands |
| Regulatory | FDA, FTC, state boards | GDPR, EU Cosmetics Regulation | Country-specific cosmetics laws | ANVISA, COFEPRIS |
| Currency | USD | EUR, GBP | Multiple (KRW, JPY, SGD, etc.) | BRL, MXN, ARS |
| Language | English | Multi-language (EN, DE, FR, ES, IT) | Multi-language (KO, JA, ZH, etc.) | Portuguese, Spanish |
| Payment | Stripe US | Stripe EU + SCA compliance | Stripe Asia + local methods | Stripe LATAM + local methods |

## Step 1: Current Internationalization Audit

```bash
echo "=== I18N READINESS ==="
cd SOCELLE-WEB

# i18n library presence
echo "i18n libraries:"
grep -rn "i18n\|intl\|locale\|translation\|t(\|useTranslation" src/ package.json 2>/dev/null | grep -v node_modules | head -10

# Currency handling
echo "Currency handling:"
grep -rn "currency\|USD\|EUR\|formatCurrency\|Intl.NumberFormat" src/ 2>/dev/null | grep -v node_modules | head -10

# Hardcoded US-centric content
echo "Hardcoded US references:"
grep -rn "United States\|US only\|USD\|American\|domestic" src/ 2>/dev/null | grep -v node_modules | head -10

# Timezone handling
echo "Timezone awareness:"
grep -rn "timezone\|timeZone\|UTC\|Intl.DateTimeFormat" src/ 2>/dev/null | grep -v node_modules | head -5

# GDPR consent mechanisms
echo "GDPR/privacy mechanisms:"
grep -rn "consent\|cookie.*banner\|gdpr\|privacy.*shield\|data.*processing" src/ 2>/dev/null | grep -v node_modules | head -10
```

## Step 2: Data Source Gap Analysis by Region

For each target region, check:
1. Are there feeds/sources covering that market's professional beauty industry?
2. Are regulatory data sources (ingredient safety, compliance) available?
3. Are local brand databases populated?

```bash
echo "=== REGIONAL DATA COVERAGE ==="
cd SOCELLE-WEB

# Feed sources with geographic metadata
grep -rn "region\|country\|market\|locale" supabase/migrations/ src/hooks/ 2>/dev/null | grep -v node_modules | head -15

# Brand geographic tagging
grep -rn "country.*code\|market.*region\|brand.*origin" supabase/migrations/ 2>/dev/null | head -10
```

## Step 3: Regulatory Readiness Check

| Regulation | Requirement | Check |
|------------|------------|-------|
| GDPR (EU) | Consent before data collection, right to delete, DPA | Consent banner, delete API, DPA doc |
| EU Cosmetics Reg | Ingredient safety database, CPNP references | Source feeds for EU cosmetics data |
| Korean MFDS | Korean cosmetics registration data | Feed source for MFDS data |
| ANVISA (Brazil) | Brazilian cosmetics registration | Feed source for ANVISA data |

## Step 4: Expansion Readiness Score

For each target market, score on a 0-100 scale:
- **Data coverage**: 0-30 points
- **Regulatory compliance**: 0-25 points
- **Localization**: 0-20 points
- **Payment infrastructure**: 0-15 points
- **Legal framework**: 0-10 points

## Output

Write to `docs/qa/geo_expansion.json`:
```json
{
  "skill": "geo-expansion-validator",
  "markets_assessed": [],
  "readiness_scores": {},
  "critical_gaps": [],
  "regulatory_blockers": [],
  "data_source_gaps": [],
  "recommendations": [],
  "timestamp": "ISO-8601"
}
```

## Verification (Deterministic)
- **Command:** `find docs/qa -name "geo-expansion-validator*.json" | wc -l  # expect >= 1`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/geo-expansion-validator-YYYY-MM-DD.json`
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
