---
name: api-documentation-generator
description: "Generates and audits API documentation for SOCELLE's edge functions, Supabase endpoints, and internal APIs. Use this skill whenever someone asks to document APIs, create API reference docs, audit endpoint documentation, generate OpenAPI/Swagger specs, or review API contracts. Also triggers on: 'API docs', 'endpoint documentation', 'Swagger', 'OpenAPI', 'API reference', 'edge function docs', 'document the API', 'API contract'. Well-documented APIs are critical for onboarding developers and enabling integrations."
---

# API Documentation Generator

Generates comprehensive API documentation for SOCELLE's 31+ edge functions and Supabase endpoints. Documentation is the developer experience — undocumented APIs are unusable APIs, and for SOCELLE's B2B customers who may need API access, this is a table-stakes requirement.

## Step 1: Inventory All Endpoints

```bash
echo "=== ENDPOINT INVENTORY ==="
cd SOCELLE-WEB

# Edge functions
echo "Edge functions:"
ls supabase/functions/ 2>/dev/null | grep -v "_shared" | sort

# Edge function details
echo "---"
for fn_dir in supabase/functions/*/; do
  fn=$(basename "$fn_dir")
  [ "$fn" = "_shared" ] && continue
  has_index=$([ -f "$fn_dir/index.ts" ] && echo "✓" || echo "✗")
  methods=$(grep -o "req.method.*===.*['\"].*['\"]" "$fn_dir/index.ts" 2>/dev/null | head -3)
  echo "$fn: index=$has_index methods=$methods"
done

# REST-style routes
echo "Client API calls:"
grep -rn "supabase.functions.invoke\|supabase.rpc" src/ 2>/dev/null | grep -v node_modules | sed 's/.*invoke[("'"'"']\([^"'"'"')]*\).*/\1/' | sort -u | head -20
```

## Step 2: Extract Function Signatures

For each edge function, document:
- **URL**: `/functions/v1/{function-name}`
- **Method**: GET/POST/PUT/DELETE
- **Auth**: Required? JWT? API key?
- **Request body**: Schema with types
- **Response**: Success and error schemas
- **Rate limits**: If any

```bash
echo "=== FUNCTION SIGNATURES ==="
cd SOCELLE-WEB

# Sample: extract signature from an edge function
for fn_dir in supabase/functions/*/; do
  fn=$(basename "$fn_dir")
  [ "$fn" = "_shared" ] && continue
  echo "--- $fn ---"
  # Extract request handling
  grep -n "req.json\|req.body\|req.method\|headers\|authorization" "$fn_dir/index.ts" 2>/dev/null | head -5
  # Extract response patterns
  grep -n "return new Response\|json({" "$fn_dir/index.ts" 2>/dev/null | head -3
  echo ""
done 2>/dev/null | head -60
```

## Step 3: Generate Documentation

Output format for each endpoint:

```markdown
### `POST /functions/v1/{name}`

**Description**: [What this function does]

**Authentication**: Bearer token required

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|

**Response (200)**:
| Field | Type | Description |
|-------|------|-------------|

**Error Responses**:
| Code | Condition |
|------|-----------|

**Example**:
curl -X POST ...
```

## Step 4: Validation

Check generated docs against actual code:
- Every documented parameter exists in the code
- Every code parameter is documented
- Response shapes match actual returns

## Output

Write to `docs/qa/api_documentation.json`:
```json
{
  "skill": "api-documentation-generator",
  "functions_documented": 0,
  "functions_total": 0,
  "undocumented_functions": [],
  "documentation_coverage_pct": 0,
  "timestamp": "ISO-8601"
}
```

## Verification (Deterministic)
- **Command:** `echo "Manual: verify docs/api/ output covers all edge functions"  # count match`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/api-documentation-generator-YYYY-MM-DD.json`
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
