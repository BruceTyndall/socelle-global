# INFRA / DEVOPS AGENT — Workflow

## 1) Purpose

Infrastructure and DevOps — CI/CD pipelines, Cloudflare Pages deployment, Wrangler configuration, build optimization, environment management, performance monitoring. Ensures the monorepo builds, deploys, and runs reliably across all apps. Commerce flow (cart/checkout/orders) — NEVER MODIFY.

## 2) Authority

- `docs/command/SOCELLE_RELEASE_GATES.md` — §5 (performance budgets), §6 (broken links), §7 (rollback)
- `docs/command/SOCELLE_MONOREPO_MAP.md`
- `docs/command/MONOREPO_TOOLING.md`
- Doc Gate applies (FAIL 1–7). All outputs must pass.

## 3) Preconditions

**Required reads before any work:**
1. `/.claude/CLAUDE.md`
2. `/docs/command/SOCELLE_RELEASE_GATES.md` — §5 (performance budgets), §6 (broken links), §7 (rollback)
3. `/docs/command/SOCELLE_MONOREPO_MAP.md`
4. `/docs/command/MONOREPO_TOOLING.md`
5. `SOCELLE-WEB/docs/build_tracker.md`

**WO ID rule:** WO IDs only valid if present in `SOCELLE-WEB/docs/build_tracker.md`. No WO needed for CI fixes or maintenance.

## 4) Allowed Paths / Forbidden Paths

**Allowed:**
- `.github/workflows/` — Read/write (CI/CD pipelines)
- `wrangler.toml` — Read/write (Cloudflare config)
- `package.json` (root) — Read/write (monorepo scripts)
- `SOCELLE-WEB/vite.config.ts` — Read/write (build config)
- `SOCELLE-WEB/tsconfig*.json` — Read/write (TypeScript config)
- `apps/marketing-site/next.config.*` — Read/write (Next.js config)
- `.env.example` — Read/write (environment template)

**Forbidden:**
- `SOCELLE-WEB/src/pages/` — NEVER TOUCH (feature code is agent-specific)
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- Commerce flow (cart/checkout/orders) — NEVER MODIFY
- `supabase/migrations/` — NEVER MODIFY (Backend Agent scope)
- `docs/command/` — NEVER MODIFY (Command Center scope)
- `.env` files with real secrets — NEVER COMMIT

## 5) Execution Loop

1. **Identify scope:** Confirm infra task has WO or is a maintenance fix (no WO needed for CI fixes).
2. **Find targets:** Locate CI/CD workflows, build configs, deploy configs.
3. **Implement:** CI/CD pipeline changes, build config updates, deploy scripts.
4. **Verify builds:** `npm run build` — zero errors across all apps.
5. **Verify performance:** Performance budgets met (bundle size, LCP, FID, CLS).
6. **Produce diffs:** Exact file paths, line ranges, and diffs.
7. **Run builds:** `npx tsc --noEmit` — zero errors.

## 6) Handoff Protocol

| Scenario | Action |
|---|---|
| Code modifications needed | Hand off to appropriate feature agent |
| Secrets or credentials need provisioning | Owner must configure — External Setup |
| Marketing site build fails after config change | Rollback, investigate |
| Mobile build pipeline changes needed | Coordinate with Mobile Agent |

**Handoff artifact:** Infra change spec (CI/CD workflow diff, build config diff, deploy verification log, performance budget report).

## 7) Proof Checklist

- [ ] `npm run build` — zero errors (SOCELLE-WEB)
- [ ] `npx tsc --noEmit` — zero errors
- [ ] CI/CD pipeline passes on all configured workflows
- [ ] No `.env` secrets committed
- [ ] Performance budgets met (bundle size, LCP, FID, CLS)
- [ ] `build_tracker.md` updated (if WO-scoped)
- [ ] Doc Gate PASS (all 7 FAIL conditions checked)

## 8) Stop Conditions

- Code modifications needed (hand off to appropriate feature agent)
- Secrets or credentials need provisioning (owner must configure)
- Marketing site build fails after config change (rollback, investigate)
- Mobile build pipeline changes needed (coordinate with Mobile Agent)
- Commerce flow modification requested (REFUSE — NEVER MODIFY)
