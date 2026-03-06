# JOBS PIPELINE AGENT — Workflow

## 1) Purpose

Back-office jobs data pipeline — ingestion, classification, deduplication, schema compliance for the `/jobs` and `/jobs/:slug` public surfaces. This agent owns the data pipeline; the Jobs Marketplace Agent owns the operator-facing portal UX. Commerce flow (cart/checkout/orders) — NEVER MODIFY.

## 2) Authority

- `docs/command/AGENT_SCOPE_REGISTRY.md` §8
- `docs/command/SOCELLE_RELEASE_GATES.md` §3 (schema validation), §4 (no-fake-live)
- `docs/command/SOCELLE_DATA_PROVENANCE_POLICY.md`
- Doc Gate applies (FAIL 1–7). All outputs must pass.

## 3) Preconditions

**Required reads before any work:**
1. `/.claude/CLAUDE.md`
2. `/docs/command/SOCELLE_CANONICAL_DOCTRINE.md`
3. `/docs/command/AGENT_SCOPE_REGISTRY.md` — §8
4. `/docs/command/SOCELLE_RELEASE_GATES.md` — §3, §4
5. `/docs/command/SOCELLE_DATA_PROVENANCE_POLICY.md` — §3 confidence scoring
6. `/docs/command/SITE_MAP.md` — `/jobs`, `/jobs/:slug` routes
7. `SOCELLE-WEB/docs/build_tracker.md`

**WO ID rule:** WO IDs only valid if present in `SOCELLE-WEB/docs/build_tracker.md`.

## 4) Allowed Paths / Forbidden Paths

**Allowed:**
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (`job_postings` table + search index)
- `SOCELLE-WEB/supabase/functions/` — ADD ONLY (ingestion edge function)
- `SOCELLE-WEB/src/pages/public/Jobs.tsx` — Wire to live table (W10-06)
- `SOCELLE-WEB/src/pages/public/JobDetail.tsx` — Wire + add schema markup

**Forbidden:**
- Portal pages — NEVER TOUCH (Web Agent / Jobs Marketplace Agent scope)
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- `SOCELLE-MOBILE-main/` — NEVER TOUCH
- `apps/marketing-site/` — NEVER TOUCH
- Commerce flow (cart/checkout/orders) — NEVER MODIFY

## 5) Execution Loop

1. **Identify WO:** Confirm W10-06 or relevant WO in `build_tracker.md`.
2. **Find targets:** Locate `job_postings` table schema, Jobs.tsx, JobDetail.tsx.
3. **Implement:** `job_postings` table migration, ingestion edge function, Jobs.tsx live wire, JobDetail.tsx JSON-LD.
4. **Verify LIVE vs DEMO:** Jobs.tsx must be labeled LIVE after wire-up or DEMO if still using mock data.
5. **Verify schema:** Schema.org `JobPosting` validates via Google Rich Results Test. `datePosted` and `validThrough` required.
6. **Verify dedup:** No duplicate `source_url` records in `job_postings` table.
7. **Produce diffs:** Exact file paths, line ranges, and diffs.
8. **Run builds:** `npx tsc --noEmit` — zero errors. Edge function deploys without error.

## 6) Handoff Protocol

| Scenario | Action |
|---|---|
| Portal UX changes needed | Hand off to Jobs Marketplace Agent |
| SEO schema markup beyond JobDetail.tsx | Hand off to SEO Agent |
| Job data enrichment API needed | Hand off to Backend Agent |
| Job data source not approved | Escalate to Command Center |

**Handoff artifact:** Table schema doc (`job_postings` columns, RLS policies, ingestion edge function API contract).

## 7) Proof Checklist

- [ ] WO ID in `build_tracker.md` confirmed
- [ ] `job_postings` table has RLS (public read, admin write)
- [ ] Schema.org `JobPosting` validates via Google Rich Results Test
- [ ] Deduplication: no duplicate `source_url` records
- [ ] Jobs.tsx data source labeled LIVE after wire-up
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `build_tracker.md` updated
- [ ] Doc Gate PASS (all 7 FAIL conditions checked)

## 8) Stop Conditions

- No active WO in `build_tracker.md` for jobs pipeline work
- Job data source not approved in `SOCELLE_DATA_PROVENANCE_POLICY.md` (escalate)
- Portal UX changes needed (hand off to Jobs Marketplace Agent)
- Commerce flow modification requested (REFUSE — NEVER MODIFY)
