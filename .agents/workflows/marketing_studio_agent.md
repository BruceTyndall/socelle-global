# MARKETING STUDIO AGENT — Workflow

## 1) Purpose

Marketing studio — campaign builder, automation triggers, broadcast messaging, marketing calendar. Provides campaign tooling for operators and brands. The `send-email` edge function is transactional only — no blast/cold email. Commerce flow (cart/checkout/orders) — NEVER MODIFY.

## 2) Authority

- `docs/command/AGENT_SCOPE_REGISTRY.md` §12
- `docs/command/SOCELLE_RELEASE_GATES.md`
- `/.claude/CLAUDE.md` — §G (No Outreach Emails Rule)
- Doc Gate applies (FAIL 1–7). All outputs must pass.

## 3) Preconditions

**Required reads before any work:**
1. `/.claude/CLAUDE.md` — §G (No Outreach Emails Rule)
2. `/docs/command/SOCELLE_CANONICAL_DOCTRINE.md`
3. `/docs/command/AGENT_SCOPE_REGISTRY.md` — §12
4. `/docs/command/SOCELLE_RELEASE_GATES.md`
5. `/docs/command/SITE_MAP.md` — Marketing studio routes
6. `SOCELLE-WEB/docs/build_tracker.md`

**WO ID rule:** WO IDs only valid if present in `SOCELLE-WEB/docs/build_tracker.md`. Do not build until WO exists.

## 4) Allowed Paths / Forbidden Paths

**Allowed:**
- `SOCELLE-WEB/src/pages/business/MarketingCalendar.tsx` — Read/write (WO required)
- `SOCELLE-WEB/src/pages/brand/Campaigns.tsx` — Read/write (WO required)
- `SOCELLE-WEB/src/pages/brand/CampaignBuilder.tsx` — Read/write (WO required)
- `SOCELLE-WEB/src/pages/brand/Automations.tsx` — Read/write (WO required)
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (campaign schema)

**Forbidden:**
- Outreach / cold acquisition email — NEVER (FAIL 7)
- `send-email` edge function — transactional only; no blast/cold email
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- Commerce flow (cart/checkout/orders) — NEVER MODIFY
- `SOCELLE-WEB/src/pages/public/` — NEVER TOUCH
- `SOCELLE-MOBILE-main/` — NEVER TOUCH
- `apps/marketing-site/` — NEVER TOUCH

## 5) Execution Loop

1. **Identify WO:** Confirm marketing studio WO exists in `build_tracker.md`.
2. **Find targets:** Locate marketing studio routes in `SITE_MAP.md`. Review existing campaign schema.
3. **Implement:** Campaign builder UI, automation triggers, marketing calendar components.
4. **Verify LIVE vs DEMO:** All automation data labeled LIVE or DEMO. All automations have explicit operator opt-in.
5. **Verify no cold email:** No blast/cold email functionality scaffolded. `send-email` usage is transactional only.
6. **Produce diffs:** Exact file paths, line ranges, and diffs.
7. **Run builds:** `npx tsc --noEmit` — zero errors.

## 6) Handoff Protocol

| Scenario | Action |
|---|---|
| Brevo account not configured | Owner must configure — External Setup |
| Cold email / blast email requested | REFUSE — FAIL 7 |
| CRM data needed for campaigns | Wait for CRM Agent |
| Commerce flow changes needed | REFUSE — NEVER MODIFY |

**Handoff artifact:** Campaign spec (state machine: draft → scheduled → sent → analyzed, automation triggers, template format).

## 7) Proof Checklist

- [ ] WO ID in `build_tracker.md` confirmed
- [ ] All automations have explicit operator opt-in documented
- [ ] No cold email functionality scaffolded
- [ ] `send-email` usage is transactional only
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `build_tracker.md` updated
- [ ] Doc Gate PASS (all 7 FAIL conditions checked)

## 8) Stop Conditions

- No active WO in `build_tracker.md` (do not build)
- Brevo account not configured by owner (External Setup required)
- Cold email / blast email functionality requested (REFUSE — FAIL 7)
- CRM data needed but not yet available (wait for CRM Agent)
- Commerce flow modification requested (REFUSE — NEVER MODIFY)
