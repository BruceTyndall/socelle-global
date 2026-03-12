---
name: affiliate-link-tracker-auditor
description: "Validates affiliate tracking implementation: schema, wrappers, tracking paths, and FTC disclosure visibility. Use this skill whenever affiliate monetization code changes."
---

# Affiliate Link Tracker Auditor

## Execution

```bash
cd SOCELLE-WEB
rg -n "affiliate_clicks|affiliate_url|affiliate|commission|FTC|disclosure|commission-linked" supabase/migrations/ supabase/functions/ src/pages src/components src/lib
```

## PASS/FAIL Rules

- PASS: tracking schema exists, click-path instrumentation exists, and FTC badge/disclosure appears on tracked surfaces.
- FAIL: missing table, tracking path, or disclosure.

## Output

Write `SOCELLE-WEB/docs/qa/affiliate_link_tracker_auditor_results.json`.
