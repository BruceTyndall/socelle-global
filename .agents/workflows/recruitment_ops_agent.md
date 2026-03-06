# RECRUITMENT / OPS AGENT — Workflow

**STATUS: BLOCKED by Doc Gate FAIL 7 until governance amendment.**

This agent is NOT authorized for execution. No WO may be created. No code may be written. No outreach content may be drafted.

Activation requires explicit written amendment to `/.claude/CLAUDE.md §G` (No Outreach Emails Rule) by the product owner, merged into the canonical governance docs.

---

## 1) Purpose

Future outreach and recruitment operations — operator recruitment, brand onboarding outreach, re-engagement campaigns. **BLOCKED** until `/.claude/CLAUDE.md §G` is amended by owner. Commerce flow (cart/checkout/orders) — NEVER MODIFY.

## 2) Authority

- `docs/command/AGENT_SCOPE_REGISTRY.md` §17
- `/.claude/CLAUDE.md` §G — **No Outreach Emails Rule (BLOCKING)**
- `docs/command/SOCELLE_RELEASE_GATES.md`
- Doc Gate applies (FAIL 1–7). FAIL 7 explicitly blocks this agent.

## 3) Preconditions

**BLOCKED — Do not proceed. The following preconditions cannot be met until governance amendment:**

1. `/.claude/CLAUDE.md §G` must be amended to allow outreach (owner approval required)
2. Amendment must be merged into canonical governance docs
3. WO must be created in `SOCELLE-WEB/docs/build_tracker.md` after amendment
4. Only then: read all standard pre-reads

**WO ID rule:** WO IDs only valid if present in `SOCELLE-WEB/docs/build_tracker.md`. No WO may be created for this agent until §G amendment is merged.

## 4) Allowed Paths / Forbidden Paths

**Allowed (post-amendment only, with WO):**
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (outreach schema)
- `SOCELLE-WEB/supabase/functions/` — ADD ONLY (outreach edge functions — separate from `send-email`)
- `SOCELLE-WEB/src/pages/admin/` — Outreach admin surfaces (ADD ONLY, WO required)

**Forbidden (absolute — no exceptions, even post-amendment):**
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- `SOCELLE-WEB/supabase/functions/send-email/` — Transactional only; outreach uses separate function
- Cold DMs, scraping, purchased lists — NEVER (even post-amendment, all outreach requires verified double opt-in consent)
- Commerce flow (cart/checkout/orders) — NEVER MODIFY

## 5) Execution Loop

**BLOCKED — No execution permitted.**

Post-amendment execution loop (when authorized):
1. **Verify amendment:** Confirm `/.claude/CLAUDE.md §G` has been amended and merged.
2. **Identify WO:** Confirm outreach WO exists in `build_tracker.md`.
3. **Implement:** Outreach schema (outreach_campaigns, outreach_recipients, consent_records), outreach edge functions (separate from `send-email`), admin outreach surfaces.
4. **Verify compliance:** CAN-SPAM / GDPR compliance. Double opt-in verified. Consent records auditable.
5. **Produce diffs:** Output exact file paths, line ranges, and diffs.
6. **Run builds:** Edge function deploys. `npx tsc --noEmit` — zero errors.

## 6) Handoff Protocol

| Scenario | Action |
|---|---|
| Owner wants to enable outreach | Owner amends `/.claude/CLAUDE.md §G` → WO created in `build_tracker.md` → Agent becomes authorized |
| Outreach needs CRM contact data | CRM Agent must complete contact schema first |
| `send-email` modification requested | REFUSE — transactional only. Outreach uses separate edge function |

**Handoff artifact:** Compliance documentation (consent flow, opt-out mechanism, audit trail).

## 7) Proof Checklist

**BLOCKED — Cannot be completed until amendment.**

Post-amendment proofs:
- [ ] `/.claude/CLAUDE.md §G` amendment verified (merged)
- [ ] WO ID in `build_tracker.md` confirmed
- [ ] Double opt-in consent flow implemented
- [ ] CAN-SPAM / GDPR compliance verified
- [ ] Consent records auditable (database trail)
- [ ] Outreach uses separate edge function (NOT `send-email`)
- [ ] No cold DMs, scraping, or purchased lists
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `build_tracker.md` updated
- [ ] Doc Gate PASS (all 7 FAIL conditions checked)

## 8) Stop Conditions

- **PRIMARY STOP: `/.claude/CLAUDE.md §G` has NOT been amended** — agent is BLOCKED
- No WO in `build_tracker.md` (do not build)
- Any cold outreach without verified consent (STOP — FAIL 7)
- `send-email` modification requested (REFUSE — transactional only)
- Commerce flow modification requested (REFUSE — NEVER MODIFY)
