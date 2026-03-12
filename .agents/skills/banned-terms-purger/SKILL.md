---
name: banned-terms-purger
description: "Scans and purges banned terms from public-facing copy, with optional safe auto-fix. Use this skill whenever public content, marketing pages, or UI copy is changed."
---

# Banned Terms Purger

## Execution

```bash
cd SOCELLE-WEB
# Define banned terms in one file for deterministic scans.
# Example file path: docs/command/BANNED_TERMS.txt (one term per line)

if [ -f docs/command/BANNED_TERMS.txt ]; then
  while IFS= read -r term; do
    [ -z "$term" ] && continue
    rg -n -- "$term" src/pages/public src/components src/pages || true
  done < docs/command/BANNED_TERMS.txt
else
  echo "BANNED_TERMS file missing"
fi

# Optional auto-fix step: perform reviewed replacements and rerun scan.
```

## PASS/FAIL Rules

- PASS: banned-term scan returns zero matches in public-facing paths.
- FAIL: one or more banned terms remain.

## Output

Write `SOCELLE-WEB/docs/qa/banned_terms_purger_results.json` with term-by-term counts and replacement evidence.
