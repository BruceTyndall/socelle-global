# EVENTS PIPELINE AGENT — Workflow

## 1) Purpose

Events data pipeline — ingestion, classification, deduplication, schema compliance for the `/events` and `/events/:slug` public surfaces. Owns the `events` Supabase table, event ingestion edge functions, and public event page live wiring. Commerce flow (cart/checkout/orders) — NEVER MODIFY.

## 2) Authority

- `docs/command/AGENT_SCOPE_REGISTRY.md`
- `docs/command/SOCELLE_RELEASE_GATES.md` — §3 (schema validation), §4 (no-fake-live)
- `docs/command/SOCELLE_DATA_PROVENANCE_POLICY.md` — §3 confidence scoring
- Doc Gate applies (FAIL 1–7). All outputs must pass.

## 3) Preconditions

**Required reads before any work:**
1. `/.claude/CLAUDE.md`
2. `/docs/command/SOCELLE_CANONICAL_DOCTRINE.md`
3. `/docs/command/AGENT_SCOPE_REGISTRY.md`
4. `/docs/command/SOCELLE_RELEASE_GATES.md` — §3 (schema validation), §4 (no-fake-live)
5. `/docs/command/SOCELLE_DATA_PROVENANCE_POLICY.md` — §3 confidence scoring
6. `/docs/command/SITE_MAP.md` — `/events`, `/events/:slug` routes
7. `SOCELLE-WEB/docs/build_tracker.md`

**WO ID rule:** WO IDs only valid if present in `SOCELLE-WEB/docs/build_tracker.md`. Do not build until WO exists.

## 4) Allowed Paths / Forbidden Paths

**Allowed:**
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (`events` table + search index)
- `SOCELLE-WEB/supabase/functions/` — ADD ONLY (events ingestion edge function)
- `SOCELLE-WEB/src/pages/public/Events.tsx` — Wire to live table (W10-05)
- `SOCELLE-WEB/src/pages/public/EventDetail.tsx` — Wire + add schema markup

**Forbidden:**
- Portal pages — NEVER TOUCH (event management portal is Web Agent scope)
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- Commerce flow (cart/checkout/orders) — NEVER MODIFY
- `SOCELLE-MOBILE-main/` — NEVER TOUCH
- `apps/marketing-site/` — NEVER TOUCH

## 5) Execution Loop

1. **Identify WO:** Confirm W10-05 or relevant WO in `build_tracker.md`.
2. **Find targets:** Locate `/events` and `/events/:slug` routes. Review existing `events` schema.
3. **Implement:** `events` table migration, ingestion edge function, Events.tsx live wire, EventDetail.tsx schema markup.
4. **Verify schema:** Schema.org `Event` validates via Google Rich Results Test.
5. **Verify deduplication:** No duplicate events by URL + title + date fingerprint.
6. **Produce diffs:** Exact file paths, line ranges, and diffs.
7. **Run builds:** `npx tsc --noEmit` — zero errors.

## 6) Handoff Protocol

| Scenario | Action |
|---|---|
| Event data source not approved | Escalate — check `SOCELLE_DATA_PROVENANCE_POLICY.md` |
| Portal event management needed | Hand off to Web Agent |
| SEO schema markup beyond EventDetail.tsx | Hand off to SEO Agent |
| Commerce flow changes needed | REFUSE — NEVER MODIFY |

**Handoff artifact:** Events pipeline spec (table schema, ingestion edge function, deduplication fingerprint, Schema.org `Event` template).

## 7) Proof Checklist

- [ ] WO ID in `build_tracker.md` confirmed
- [ ] `events` table has RLS (public read, admin write)
- [ ] Schema.org `Event` validates via Google Rich Results Test
- [ ] Deduplication: no duplicate events by URL + title + date
- [ ] Events.tsx data source labeled LIVE after wire-up
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `build_tracker.md` updated
- [ ] Doc Gate PASS (all 7 FAIL conditions checked)

## 8) Stop Conditions

- No active WO in `build_tracker.md` for events pipeline work
- Event data source not approved in `SOCELLE_DATA_PROVENANCE_POLICY.md` (escalate)
- Portal event management needed (hand off to Web Agent)
- SEO schema markup beyond EventDetail.tsx (hand off to SEO Agent)
- Commerce flow modification requested (REFUSE — NEVER MODIFY)
