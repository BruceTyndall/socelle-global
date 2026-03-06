# ADMIN CONTROL CENTER AGENT — Workflow

## 1) Purpose

Admin portal development (`/admin/*`) — signal curation, brand management, order oversight, ingestion controls, content moderation. Owns all admin-scoped surfaces and admin-specific components. Commerce flow (cart/checkout/orders) — NEVER MODIFY.

## 2) Authority

- `docs/command/AGENT_SCOPE_REGISTRY.md` §5
- `docs/command/SOCELLE_RELEASE_GATES.md`
- `docs/command/SOCELLE_CANONICAL_DOCTRINE.md`
- Doc Gate applies (FAIL 1–7). All outputs must pass.

## 3) Preconditions

**Required reads before any work:**
1. `/.claude/CLAUDE.md`
2. `/docs/command/SOCELLE_CANONICAL_DOCTRINE.md`
3. `/docs/command/AGENT_SCOPE_REGISTRY.md` — §5
4. `/docs/command/SOCELLE_RELEASE_GATES.md`
5. `/docs/command/SITE_MAP.md` — Admin routes (37 admin routes)
6. `/docs/command/MODULE_BOUNDARIES.md`
7. `SOCELLE-WEB/docs/build_tracker.md`

**WO ID rule:** WO IDs only valid if present in `SOCELLE-WEB/docs/build_tracker.md`.

## 4) Allowed Paths / Forbidden Paths

**Allowed:**
- `SOCELLE-WEB/src/pages/admin/` — ADD ONLY (no deletion, no modification of existing pages without WO)
- `SOCELLE-WEB/src/components/` — Read/write (admin-specific components)
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (admin-related tables/policies)

**Forbidden:**
- `SOCELLE-WEB/src/pages/public/` — Web Agent domain (read for context only)
- `SOCELLE-WEB/src/pages/business/` — NEVER MODIFY
- `SOCELLE-WEB/src/pages/brand/` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- `SOCELLE-MOBILE-main/` — NEVER TOUCH
- `apps/marketing-site/` — NEVER TOUCH
- Commerce flow (cart/checkout/orders) — NEVER MODIFY

## 5) Execution Loop

1. **Identify WO:** Confirm admin-related WO exists in `build_tracker.md`.
2. **Find targets:** Enumerate admin routes from `SITE_MAP.md`. Identify existing admin pages in `SOCELLE-WEB/src/pages/admin/`.
3. **Implement:** Admin page components, admin-specific components, admin RLS policies.
4. **Verify LIVE vs DEMO:** All admin data surfaces must be labeled LIVE (DB with `updated_at`) or DEMO (mock with badge).
5. **Register route:** Confirm new admin page registered in `App.tsx` under `/admin/*`.
6. **Produce diffs:** Output exact file paths, line ranges, and diffs for all changes.
7. **Run builds:** `npx tsc --noEmit` — zero errors.

## 6) Handoff Protocol

| Scenario | Action |
|---|---|
| Admin surface needs data from non-existent table | Hand off to Backend Agent with table requirements |
| Editorial Agent needs admin curation UI | Editorial Agent builds ingestion pipeline → Admin Agent builds curation surface |
| Public or portal page changes needed | Hand off to Web Agent |

**Handoff artifact:** Admin surface spec (route, component name, data requirements, RLS policy).

## 7) Proof Checklist

- [ ] WO ID in `build_tracker.md` confirmed
- [ ] `npx tsc --noEmit` — zero errors
- [ ] New admin page registered in `App.tsx` under `/admin/*`
- [ ] RLS policies confirm admin-only access
- [ ] All admin data surfaces labeled LIVE or DEMO
- [ ] `build_tracker.md` updated
- [ ] Doc Gate PASS (all 7 FAIL conditions checked)

## 8) Stop Conditions

- No active WO in `build_tracker.md`
- Admin surface needs data from non-existent table (hand off to Backend Agent)
- Editorial curation surface requested (coordinate handoff with Editorial Agent)
- Public or portal pages need changes (hand off to Web Agent)
- Commerce flow modification requested (REFUSE — NEVER MODIFY)
