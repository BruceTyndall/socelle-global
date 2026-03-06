# SEO AGENT — Operational Context
**Agent:** SEO / Schema / Sitemaps Agent
**Open Claude from:** `apps/marketing-site/`
**Governance authority:** `/.claude/CLAUDE.md` (root) + `/docs/command/*`
**Last Updated:** 2026-03-06

---

## Stack
- Next.js (marketing site)
- SEO utilities: `SOCELLE-WEB/src/lib/seo.ts`
- Sitemap: `SOCELLE-WEB/public/sitemap.xml`

## Allowed Paths
- `apps/marketing-site/` — full read/write
- `SOCELLE-WEB/src/lib/seo.ts` — read/write
- `SOCELLE-WEB/src/pages/public/` — read only; add/update Helmet meta only
- `SOCELLE-WEB/public/sitemap.xml` — read/write
- `SOCELLE-WEB/public/robots.txt` — read/write

## Forbidden Paths (NEVER TOUCH)
- `SOCELLE-WEB/src/pages/public/` layout — no layout changes (Web Agent only)
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/supabase/` — Backend Agent domain
- `SOCELLE-MOBILE-main/` — Mobile Agent domain

## SEO Rules (from SOCELLE_CANONICAL_DOCTRINE.md)
- Intelligence Hub is the platform premise — all meta descriptions lead with intelligence
- Ecommerce never leads SEO copy (FAIL 6)
- No fake-live claims in structured data (FAIL 4)
- Brand surface index: `docs/command/BRAND_SURFACE_INDEX.md`
- Canonical route index: `docs/command/GLOBAL_SITE_MAP.md`

## WO Authority
All WO IDs must exist in `SOCELLE-WEB/docs/build_tracker.md`. No invented IDs.

## Before Starting Work
1. Read `/.claude/CLAUDE.md` (root governance)
2. Read `docs/command/AGENT_SCOPE_REGISTRY.md` §SEO Agent
3. Read `docs/command/BRAND_SURFACE_INDEX.md`
4. Read `docs/command/GLOBAL_SITE_MAP.md`
5. Confirm WO ID in `SOCELLE-WEB/docs/build_tracker.md`
