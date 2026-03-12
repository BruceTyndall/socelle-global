---
name: audit-log-auditor
description: "Audits OPERATION BREAKOUT CTRL-WO-03 audit logging implementation. Use this skill whenever audit table schema, audit writers, admin audit UI, or tracked action coverage changes."
---

# Audit Log Auditor

Verifies that audit logging is implemented, queryable, and includes required event classes.

## Execution

Run from repo root.

```bash
cd SOCELLE-WEB

echo "=== AUDIT TABLE + RLS ==="
rg -n "CREATE TABLE IF NOT EXISTS public\.audit_logs|ENABLE ROW LEVEL SECURITY|CREATE POLICY" supabase/migrations/*audit* supabase/migrations/

echo "=== AUDIT WRITER ==="
rg -n "export async function logAudit|from\('audit_logs'\)|action:" src/lib/auditLog.ts src/lib/useEdgeFunctionControls.ts src/supabase 2>/dev/null || true

echo "=== REQUIRED ACTION TYPES ==="
rg -n "ai\.request|admin\.action|entitlement\.change" src/

echo "=== ADMIN AUDIT VIEWER ==="
rg -n "AdminAuditLog|useAuditLogs|audit_logs|Export CSV" src/pages/admin/AdminAuditLog.tsx src/lib/useAuditLogs.ts
```

## PASS/FAIL Rules

- PASS: `audit_logs` table + RLS policies exist, writer inserts structured events, required action types are represented, and admin viewer is searchable/exportable.
- FAIL: missing table/RLS, missing writer path, or missing admin viewer capabilities.

## Output

Write `SOCELLE-WEB/docs/qa/audit_log_auditor_results.json`:

```json
{
  "skill": "audit-log-auditor",
  "timestamp": "ISO-8601",
  "status": "PASS|FAIL",
  "checks": [
    { "name": "table_and_rls", "status": "PASS|FAIL", "evidence": "" },
    { "name": "writer_paths", "status": "PASS|FAIL", "evidence": "" },
    { "name": "required_actions", "status": "PASS|FAIL", "evidence": "" },
    { "name": "admin_viewer", "status": "PASS|FAIL", "evidence": "" }
  ],
  "summary": { "pass_count": 0, "fail_count": 0 }
}
```

## Stop Conditions

- Hard stop: audit migration files missing.
- Soft stop: action taxonomy mismatch between logger and viewer; escalate for owner decision.
