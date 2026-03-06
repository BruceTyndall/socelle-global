# EDITORIAL / NEWS AGENT — Workflow

## 1) Purpose

Beauty intelligence editorial — article ingestion, editorial curation, news digest surfaces, RSS feed management. Editorial content lives inside the Intelligence product (`/intelligence` sub-nav: Briefing | News | Signals | Categories | Trends), NOT as a standalone blog or marketing-site feature. Marketing site is NOT the content home. Commerce flow (cart/checkout/orders) — NEVER MODIFY.

## 2) Authority

- `docs/command/AGENT_SCOPE_REGISTRY.md` §10
- `docs/command/SOCELLE_RELEASE_GATES.md` §4 (no-fake-live)
- `docs/command/SOCELLE_DATA_PROVENANCE_POLICY.md` — freshness SLAs
- Doc Gate applies (FAIL 1–7). All outputs must pass.

## 3) Preconditions

**Required reads before any work:**
1. `/.claude/CLAUDE.md`
2. `/docs/command/SOCELLE_CANONICAL_DOCTRINE.md`
3. `/docs/command/AGENT_SCOPE_REGISTRY.md` — §10
4. `/docs/command/SOCELLE_RELEASE_GATES.md` — §4
5. `/docs/command/SOCELLE_DATA_PROVENANCE_POLICY.md` — §3 confidence scoring, §4 freshness SLAs
6. `/docs/command/SITE_MAP.md`
7. `SOCELLE-WEB/docs/build_tracker.md`

**WO ID rule:** WO IDs only valid if present in `SOCELLE-WEB/docs/build_tracker.md`.

## 4) Allowed Paths / Forbidden Paths

**Allowed:**
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (`rss_items`, editorial schema)
- `SOCELLE-WEB/supabase/functions/` — ADD ONLY (ingestion edge function — W10-08)
- `SOCELLE-WEB/src/pages/public/Intelligence.tsx` — Editorial sub-nav integration (WO required)
- `SOCELLE-WEB/src/pages/business/IntelligenceHub.tsx` — Read; editorial integration (WO required)
- `SOCELLE-WEB/src/pages/admin/` — Editorial admin surfaces (ADD ONLY, WO required)

**Forbidden:**
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- `SOCELLE-WEB/src/pages/brand/` — NEVER TOUCH without WO
- `SOCELLE-WEB/src/pages/admin/` — Admin Signal curation is Admin Control Center scope
- Outreach / acquisition email copy — NEVER DRAFT (FAIL 7)
- `SOCELLE-MOBILE-main/` — NEVER TOUCH
- `apps/marketing-site/` — NEVER TOUCH (editorial is NOT marketing-site)
- Commerce flow (cart/checkout/orders) — NEVER MODIFY

## 5) Execution Loop

1. **Identify WO:** Confirm editorial WO exists in `build_tracker.md` (e.g., W10-08).
2. **Find targets:** Locate Intelligence.tsx sub-nav, editorial schema, RSS ingestion function.
3. **Implement:** Ingestion edge function, editorial schema migrations, editorial card components.
4. **Verify LIVE vs DEMO:** All ingested content must have `source_url` + `published_at` attribution. No content without freshness label.
5. **Verify placement:** Editorial lives within `/intelligence` sub-nav, NOT standalone blog.
6. **Produce diffs:** Exact file paths, line ranges, and diffs.
7. **Run builds:** `npx tsc --noEmit` — zero errors. Edge function deploys.

## 6) Handoff Protocol

| Scenario | Action |
|---|---|
| Admin curation UI needed | Hand off to Admin Control Center Agent |
| RSS source not approved | Escalate to Command Center via `SOCELLE_DATA_PROVENANCE_POLICY.md` |
| Enrichment API needed | Hand off to Backend Agent |

**Handoff artifact:** Ingestion pipeline spec (RSS endpoints, table schema, freshness SLA, editorial card component API).

## 7) Proof Checklist

- [ ] WO ID in `build_tracker.md` confirmed
- [ ] All ingested content has `source_url` + `published_at` attribution
- [ ] No editorial content displayed without visible freshness label
- [ ] Editorial content lives within `/intelligence` sub-nav, NOT standalone blog
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `build_tracker.md` updated
- [ ] Doc Gate PASS (all 7 FAIL conditions checked)

## 8) Stop Conditions

- No active WO in `build_tracker.md` (do not build)
- Admin curation UI needed (hand off to Admin Control Center Agent)
- RSS feed source not approved in `SOCELLE_DATA_PROVENANCE_POLICY.md` (escalate)
- Content requires enrichment API not yet provisioned (hand off to Backend Agent)
- Commerce flow modification requested (REFUSE — NEVER MODIFY)
