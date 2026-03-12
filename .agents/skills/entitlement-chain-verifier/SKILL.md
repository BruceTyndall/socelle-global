---
name: entitlement-chain-verifier
description: "Verifies OPERATION BREAKOUT CTRL-WO-04 entitlement chain end-to-end. Use this skill whenever subscription plan entitlements, ModuleRoute, useModuleAccess, or UpgradePrompt logic changes."
---

# Entitlement Chain Verifier

Validates the chain: `subscription_plans` -> `modules_included` -> `ModuleRoute` -> `UpgradePrompt`.

## Execution

Run from repo root.

```bash
cd SOCELLE-WEB

echo "=== ENTITLEMENT SCHEMA ==="
rg -n "subscription_plans|modules_included|account_module_access" supabase/migrations/ src/lib/database.types.ts

echo "=== MODULE ACCESS CONTEXT + HOOK ==="
rg -n "ModuleAccessProvider|account_module_access|checkAccess|getAccessRecord" src/modules/_core/context/ModuleAccessContext.tsx
rg -n "useModuleAccess\(" src/modules/_core/hooks/useModuleAccess.ts

echo "=== MODULE ROUTE + UPGRADE PROMPT ==="
rg -n "ModuleRoute|UpgradePrompt|!hasAccess|moduleKey" src/modules/_core/components/ModuleRoute.tsx src/modules/_core/components/UpgradePrompt.tsx

echo "=== APP WRAP + ROUTE COVERAGE ==="
rg -n "ModuleAccessProvider|ModuleRoute" src/App.tsx
```

## Optional E2E Check

```bash
cd SOCELLE-WEB
npm run test:e2e -- --grep "entitlement|upgrade|module" || true
```

## PASS/FAIL Rules

- PASS: schema linkage exists, provider/hook active, ModuleRoute renders UpgradePrompt on denied access, and app routes are wrapped where required.
- FAIL: any chain segment missing or not wired.

## Output

Write `SOCELLE-WEB/docs/qa/entitlement_chain_verifier_results.json`:

```json
{
  "skill": "entitlement-chain-verifier",
  "timestamp": "ISO-8601",
  "status": "PASS|FAIL",
  "checks": [
    { "name": "schema_chain", "status": "PASS|FAIL", "evidence": "" },
    { "name": "provider_and_hook", "status": "PASS|FAIL", "evidence": "" },
    { "name": "module_route_gate", "status": "PASS|FAIL", "evidence": "" },
    { "name": "route_coverage", "status": "PASS|FAIL", "evidence": "" }
  ],
  "summary": { "pass_count": 0, "fail_count": 0 }
}
```

## Stop Conditions

- Hard stop: core module access files missing.
- Soft stop: live DB validation unavailable; report static verification and mark DB checks as pending.
