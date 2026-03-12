---
name: export-fidelity-validator
description: "Validates Studio export fidelity harness configuration for Build 4. Checks required formats, template coverage (>=5), and baseline manifest presence. Produces PASS/FAIL JSON evidence in docs/qa."
---

# export-fidelity-validator

Validates the Build 4 Studio export reliability harness inputs before CI image-diff enforcement.

## Run

```bash
node tools/export-fidelity-validator/run.js
```

## Required checks

1. Manifest exists at `SOCELLE-WEB/docs/qa/export_fidelity_manifest.json`
2. Manifest declares all required formats: `PNG`, `JPG`, `PDF`, `PPTX`, `SCORM`, `SVG`, `GIF`
3. Manifest includes at least 5 template baselines
4. Each template includes baseline entries for `PNG`, `PDF`, `PPTX`
5. Studio editor includes output preset definitions (static check)

## Output

Writes JSON report:
- `SOCELLE-WEB/docs/qa/export-fidelity-validator-<timestamp>.json`

Schema:
```json
{
  "skill": "export-fidelity-validator",
  "timestamp": "ISO-8601",
  "status": "PASS|FAIL",
  "checks": []
}
```

## Pass criteria

- All required checks pass
- Report file exists under `SOCELLE-WEB/docs/qa/`
