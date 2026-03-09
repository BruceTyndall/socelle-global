---
name: authoring-core-schema-validator
description: "Validates Authoring Core schema coverage for document model, 17 block types, versioning, and publish-state transitions. Use this skill whenever authoring core data model, renderer blocks, or publish workflow changes."
---

# Authoring Core Schema Validator

## Execution

```bash
cd SOCELLE-WEB

# Schema + versioning + status states
rg -n "document model|json schema|version|draft|published|archived|publish" src/ supabase/migrations/ docs/command

# Block types coverage
rg -n "heading|paragraph|bullets|kpi|signal embed|table|media|cta|disclaimer|chart|quote|hero|text|image|video|faq|testimonial" src/components src/lib src/pages

# Renderer path
rg -n "PageRenderer|block type|renderBlock" src/
```

## PASS/FAIL Rules

- PASS: authoring schema/versioning/publish states exist, all 17 block types are represented, and renderer supports them.
- FAIL: missing block types, missing state transitions, or missing renderer support.

## Output

Write `SOCELLE-WEB/docs/qa/authoring_core_schema_validator_results.json` with missing block/state arrays and evidence.
