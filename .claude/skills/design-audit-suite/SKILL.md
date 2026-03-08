---
name: design-audit-suite
description: Unified Pearl Mineral V2 design compliance suite — runs design-lock-enforcer, token-drift-scanner, figma-parity-checker, and design-standard-enforcer in coordinated sequence with single verification entrypoint and consolidated output artifact.
---

# design-audit-suite

Coordinated execution of 4 design compliance skills in dependency order. Produces a single unified report covering all Pearl Mineral V2 design rules.

## Member Skills (Execution Order)

1. `design-lock-enforcer` — 5 hex/glass/radius design locks
2. `token-drift-scanner` — Figma token vs Tailwind vs code parity
3. `figma-parity-checker` — Component-level Figma-to-code match
4. `design-standard-enforcer` — Responsive + accessibility overlay

## Inputs

| Input | Source | Required |
|---|---|---|
| SOCELLE-WEB/src/ | Codebase | Yes |
| SOCELLE-WEB/tailwind.config.js | Codebase | Yes |
| docs/command/SOCELLE_FIGMA_TO_CODE_HANDOFF.md | Command doc | Yes |
| docs/command/SOCELLE_CANONICAL_DOCTRINE.md | Command doc | Yes |

## Procedure

### Step 1 — Run design-lock-enforcer

```bash
grep -rn '#141418\|#F6F3EF\|#6E879B\|backdrop-blur-md\|rounded-2xl' SOCELLE-WEB/src/ | head -20
```

Verify all 5 design locks are present and no unapproved hex values appear in component files.

Lock registry:
- Primary text: `#141418` (graphite)
- Background: `#F6F3EF` (mineral nude)
- Accent: `#6E879B` (muted steel blue)
- Glass: `backdrop-blur-md bg-white/70`
- Radius: `rounded-2xl`

Any color outside the approved palette in a UI component = FAIL.

### Step 2 — Run token-drift-scanner

```bash
grep -rn 'graphite\|mn-bg\|accent\|glass' SOCELLE-WEB/tailwind.config.js | head -10
```

Cross-reference Tailwind token names against Figma export names. Any mismatch = drift.

Check for:
- Token name parity (Figma layer name == Tailwind key == CSS variable)
- No orphaned tokens (defined in Tailwind but not used in code)
- No hardcoded values that should reference tokens

### Step 3 — Run figma-parity-checker

```bash
find SOCELLE-WEB/src/components -name '*.tsx' | head -20
```

For each component in the Figma handoff doc, verify:
- Component exists at the specified file path
- Props match Figma variant names
- Spacing/padding matches Figma auto-layout values
- No visual drift from the Figma source of truth

### Step 4 — Run design-standard-enforcer

```bash
grep -rn 'sm:\|md:\|lg:\|xl:' SOCELLE-WEB/src/components/ | wc -l
```

Verify:
- Responsive breakpoints present (sm/md/lg/xl)
- Accessibility attributes (aria-label, role, alt text)
- Glass effect applied consistently (backdrop-blur-md bg-white/70)
- No serif fonts on public pages

### Step 5 — Consolidate Results

Merge all 4 sub-reports into a single JSON artifact:

```json
{
  "suite": "design-audit-suite",
  "timestamp": "YYYY-MM-DDTHH:MM:SSZ",
  "members_run": ["design-lock-enforcer", "token-drift-scanner", "figma-parity-checker", "design-standard-enforcer"],
  "locks_pass": true,
  "drift_count": 0,
  "parity_score": "100%",
  "responsive_coverage": "95%",
  "overall": "PASS",
  "findings": []
}
```

Save to: `docs/qa/design-audit-suite-YYYY-MM-DD.json`

## Outputs

| Output | Format | Location |
|---|---|---|
| Consolidated design audit report | JSON | `docs/qa/design-audit-suite-YYYY-MM-DD.json` |
| Per-member sub-reports | Inline in consolidated JSON | Same file |
| Drift inventory (if any) | Array in JSON | Same file |

## Verification

**Command:**
```bash
grep -rn '#141418\|#F6F3EF\|#6E879B\|backdrop-blur' SOCELLE-WEB/src/ | wc -l
```
**Pass criteria:** Count > 0 AND no unapproved hex values in component files AND `docs/qa/design-audit-suite-*.json` exists with `"overall": "PASS"`.

## Stop Conditions

- STOP if `SOCELLE_FIGMA_TO_CODE_HANDOFF.md` is not found — cannot validate without handoff doc.
- STOP if `tailwind.config.js` is missing — cannot check token parity.
- STOP if any member skill produces a FAIL that blocks downstream members (e.g., lock violations make parity checking meaningless).
- STOP if more than 20 drift violations found — triage required before full audit.

## Failure Modes

| Mode | Symptom | Resolution |
|---|---|---|
| Missing command doc | Member skill cannot find governance file | Restore from `/docs/command/` |
| Token rename | Figma tokens renamed without code update | Run token-drift-scanner standalone, patch Tailwind config |
| Hardcoded hex | Color bypasses token system | Replace with Tailwind token reference |

## Fade Protocol

**Quarterly re-certification required.** Design tokens evolve with brand updates. Re-run this suite after any Figma design system update, Tailwind config change, or brand refresh. If Pearl Mineral V2 is superseded, retire and rebuild suite against new design system spec.
