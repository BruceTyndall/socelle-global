# SEO / SCHEMA / SITEMAPS AGENT — Workflow

## 1) Purpose

Own SEO infrastructure across the marketing site (`apps/marketing-site/`) and web app SEO utilities. Ensure all public pages have valid Schema.org JSON-LD markup, programmatic sitemaps with real `updated_at` timestamps, correct canonical URLs, and passing Core Web Vitals. Marketing site is SEO Agent domain per monorepo boundary rules. Commerce flow (cart/checkout/orders) — NEVER MODIFY.

## 2) Authority

- `docs/command/AGENT_SCOPE_REGISTRY.md` §4
- `docs/command/SOCELLE_RELEASE_GATES.md` §2–§3
- `docs/command/SOCELLE_CANONICAL_DOCTRINE.md`
- `docs/command/SOCELLE_DATA_PROVENANCE_POLICY.md`
- Doc Gate applies (FAIL 1–7). All outputs must pass.

## 3) Preconditions

**Required reads before any work:**
1. `/.claude/CLAUDE.md`
2. `/docs/command/SOCELLE_CANONICAL_DOCTRINE.md`
3. `/docs/command/AGENT_SCOPE_REGISTRY.md` — §4
4. `/docs/command/SOCELLE_RELEASE_GATES.md` — §2 (SEO pre-deploy), §3 (Schema Validation)
5. `/docs/command/SITE_MAP.md` — All public routes must have schema coverage
6. `/docs/command/MODULE_BOUNDARIES.md`
7. `/docs/command/HARD_CODED_SURFACES.md`
8. `SOCELLE-WEB/docs/build_tracker.md`

**WO ID rule:** WO IDs only valid if present in `SOCELLE-WEB/docs/build_tracker.md`.

## 4) Allowed Paths / Forbidden Paths

**Allowed:**
- `apps/marketing-site/` — Full read/write
- `SOCELLE-WEB/src/lib/seo.ts` — Read/write (SEO utilities)
- `SOCELLE-WEB/src/pages/public/` — Read; add/update Helmet meta only (no layout changes)
- `SOCELLE-WEB/public/sitemap.xml` — Read/write
- `SOCELLE-WEB/public/robots.txt` — Read/write

**Forbidden:**
- `SOCELLE-WEB/src/pages/business/` — NEVER TOUCH
- `SOCELLE-WEB/src/pages/brand/` — NEVER TOUCH
- `SOCELLE-WEB/src/pages/admin/` — NEVER TOUCH
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER TOUCH
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER TOUCH
- `SOCELLE-WEB/supabase/` — NEVER TOUCH (read schema for markup only)
- `SOCELLE-MOBILE-main/` — NEVER TOUCH
- Commerce flow (cart/checkout/orders) — NEVER MODIFY

## 5) Execution Loop

1. **Identify WO:** Confirm SEO-related WO exists in `build_tracker.md`.
2. **Find targets:** Enumerate all public routes from `SITE_MAP.md`. Cross-reference with existing schema coverage in `apps/marketing-site/`.
3. **Schema markup:** For each page type, generate Schema.org JSON-LD (`JobPosting`, `Event`, `Organization`, `BreadcrumbList`, `FAQPage`). Schema must use real DB data, never hardcoded placeholders.
4. **Sitemap:** Update `sitemap.ts` with every new template. `lastModified` must use real DB `updated_at` timestamps.
5. **Verify LIVE vs DEMO:** Every data surface producing schema markup must be labeled LIVE (DB-connected with `updated_at`) or DEMO (mock/hardcoded with visible badge).
6. **Produce diffs:** Output exact file paths, line ranges, and diffs for all changes.
7. **Run builds:** `npx tsc --noEmit` — zero errors. Validate Schema.org via Google Rich Results Test.
8. **Coverage report:** Confirm all `SITE_MAP.md` public routes have schema coverage.

## 6) Handoff Protocol

| Scenario | Action |
|---|---|
| Schema requires DB data not yet available | Hand off to Backend Agent with table/column requirements |
| Marketing site build fails | Escalate to Infra/DevOps |
| New public route discovered not in SITE_MAP.md | Escalate to Command Center |
| Portal Helmet meta needs layout changes | Hand off to Web Agent |

**Handoff artifact:** Written summary specifying: what data is needed, which table/column, which page type, and the JSON-LD template ready to wire.

## 7) Proof Checklist

- [ ] WO ID in `build_tracker.md` confirmed
- [ ] Schema.org JSON-LD validates via Google Rich Results Test
- [ ] Sitemap renders valid XML with real `updated_at` timestamps
- [ ] All public routes in `SITE_MAP.md` covered
- [ ] `npx tsc --noEmit` — zero errors
- [ ] Canonical URLs resolve correctly (no 404s, no redirect chains)
- [ ] `build_tracker.md` updated
- [ ] Doc Gate PASS (all 7 FAIL conditions checked)

## 8) Stop Conditions

- Schema requires DB data not yet available (hand off to Backend Agent)
- Marketing site build fails (escalate to Infra/DevOps)
- New public route discovered not in SITE_MAP.md (escalate to Command Center)
- Commerce flow modification requested (REFUSE — NEVER MODIFY)
