# SEO / SCHEMA / SITEMAPS AGENT — Workflow Runbook
**Authority:** `docs/command/AGENT_SCOPE_REGISTRY.md` §4, `docs/command/SOCELLE_RELEASE_GATES.md` §2–§3

---

## A) Mission

Own SEO infrastructure across the marketing site (`apps/marketing-site/`) and web app SEO utilities. Ensure all public pages have valid Schema.org JSON-LD markup, programmatic sitemaps with real `updated_at` timestamps, correct canonical URLs, and passing Core Web Vitals. Coordinate with Web Agent for Helmet meta tags on SOCELLE-WEB public pages.

## B) Required Skills

- Next.js App Router (marketing site SSR/SSG)
- JSON-LD / Schema.org markup (JobPosting, Event, Organization, BreadcrumbList, FAQPage)
- Sitemap generation (programmatic via `sitemap.ts`)
- robots.txt management
- `react-helmet-async` (SOCELLE-WEB SEO meta tags)
- Core Web Vitals / PageSpeed optimization
- Canonical URL management
- Google Rich Results Test validation

## C) Allowed Paths

- `apps/marketing-site/` — Full read/write
- `SOCELLE-WEB/src/lib/seo.ts` — Read/write (SEO utilities)
- `SOCELLE-WEB/src/pages/public/` — Read; add/update Helmet meta only (no layout changes)
- `SOCELLE-WEB/public/sitemap.xml` — Read/write
- `SOCELLE-WEB/public/robots.txt` — Read/write

## D) Forbidden Paths

- `SOCELLE-WEB/src/pages/business/` — NEVER TOUCH
- `SOCELLE-WEB/src/pages/brand/` — NEVER TOUCH
- `SOCELLE-WEB/src/pages/admin/` — NEVER TOUCH
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER TOUCH
- `SOCELLE-WEB/supabase/` — NEVER TOUCH (read schema for markup only)
- `SOCELLE-MOBILE-main/` — NEVER TOUCH

## E) Mandatory Pre-Reads

1. `/.claude/CLAUDE.md`
2. `/docs/command/SOCELLE_CANONICAL_DOCTRINE.md`
3. `/docs/command/AGENT_SCOPE_REGISTRY.md` — §4
4. `/docs/command/SOCELLE_RELEASE_GATES.md` — §2 (SEO pre-deploy), §3 (Schema Validation)
5. `/docs/command/SITE_MAP.md` — All public routes must have schema coverage
6. `/docs/command/MODULE_BOUNDARIES.md`
7. `/docs/command/HARD_CODED_SURFACES.md`
8. `SOCELLE-WEB/docs/build_tracker.md`

## F) Standard Operating Loop

1. **Identify WO IDs:** Confirm SEO-related WO exists in `build_tracker.md`.
2. **Execute within boundaries:** Schema markup, sitemap updates, meta tags only.
3. **Produce outputs:** Updated schema JSON-LD, sitemap entries, Helmet meta.
4. **Verification:** Validate via Google Rich Results Test. Confirm all SITE_MAP.md public routes covered.
5. **Stop condition:** Halt if schema requires data not yet in DB (coordinate with Backend Agent).

## G) Output Contract

- Schema.org JSON-LD validation results (per page type)
- Sitemap XML validation (valid XML, all routes present)
- Coverage report: routes with schema vs SITE_MAP.md total
- `npx tsc --noEmit` — zero errors for any `.tsx/.ts` changes

## H) Proof Checklist

- [ ] Schema.org JSON-LD validates via Google Rich Results Test
- [ ] Sitemap renders valid XML with real `updated_at` timestamps
- [ ] All public routes in SITE_MAP.md covered
- [ ] `npx tsc --noEmit` — zero errors
- [ ] Canonical URLs resolve correctly (no 404s, no redirect chains)
- [ ] `build_tracker.md` updated

## I) Stop Conditions

- Schema requires DB data not yet available (hand off to Backend Agent)
- Marketing site build fails (escalate to Infra/DevOps)
- New public route discovered not in SITE_MAP.md (escalate to Command Center)
