---
name: css-variable-font-system-validator
description: "Validates universal CSS variable font system and confirms no font-serif usage. Use this skill whenever typography tokens or Tailwind font mappings are modified."
---

# CSS Variable Font System Validator

## Execution

```bash
cd SOCELLE-WEB
rg -n -- "--font-primary|--font-display|--font-mono" src/index.css src/**/*.css
rg -n "fontFamily|font-sans|var\(--font-primary\)" tailwind.config.js src/
rg -n "font-serif" src/ && exit 1 || echo "font-serif: 0"
```

## PASS/FAIL Rules

- PASS: three CSS vars exist, `font-sans` maps to primary variable, and `font-serif` count is zero.
- FAIL: any required variable/mapping missing or `font-serif` detected.

## Output

Write `SOCELLE-WEB/docs/qa/css_variable_font_system_validator_results.json` with counts and evidence.
