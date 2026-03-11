# AUDIT SPRINT SUMMARY — AUDIT + IDEA MINING + AGENT UPSKILL (NO EASY SPLIT)

**Sprint date:** 2026-03-13  
**Commit anchor:** d1442d3  
**Goal:** Repo-wide audit (multi-agent), rebuild Source-of-Truth hierarchy, product-power-first execution plan, app-by-app split gated on Product Power + UX. Documentation only unless GO:CODE.

---

## 1. CURRENT TRUTH — PHASE AND DONE/OPEN/BLOCKED

| Phase | Status | Evidence |
|-------|--------|----------|
| BUILD 0 (CTRL + FOUND) | DONE | verify_CTRL-WO-01..04, verify_FOUND-WO-01..15 |
| BUILD 1 (INTEL + FEED + PAY) | DONE | verify_INTEL-WO-01-11, verify_FEED-WO-01..05, verify_BUILD1-COMPLETE |
| BUILD 2 (CRM/EDU/SALES/COMMERCE/AUTH-CORE) | DONE (sub-WOs verified) | verify_CRM-WO-07-09, verify_SALES-WO-05-08, verify_COMMERCE-WO-03-07, verify_EDU-WO-02-05, verify_AUTH-CORE-01-06 |
| BUILD 3 (Growth) | DONE | verify_BUILD3-* |
| BUILD 4 / 5 | PARTIAL | EVT-WO-01 partial; SEARCH-WO-02/03 partial; MOBILE/TAURI/PWA partial |
| P0 GATE | DONE | All P0 items in build_tracker lines 96–101 + verify_P0-* |
| P1 GATE | ACTIVE | CMS-WO-07 next; EVT-WO-02, DEBT-TANSTACK-REAL-6, P1-3, ROUTE-CLEANUP, BRAND-SIGNAL open |
| P2 GATE | PENDING / BLOCKED | P2-1 unblocked; P2-STRIPE owner-blocked |

**BLOCKED:** P2-STRIPE (owner must set stripe_price_id).  
**OPEN (next):** CMS-WO-07, DEBT-TANSTACK-REAL-6, P1-3, EVT-WO-02, MERCH-INTEL-03-FINAL, ROUTE-CLEANUP-WO, BRAND-SIGNAL-WO, P2-1.

---

## 2. CONFLICTS FOUND — WHAT MUST BE PATCHED

| Document | Conflict | Required patch |
|----------|----------|----------------|
| SOCELLE-WEB/MASTER_STATUS.md | Lines 5–6: "Authority: V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH" | Point authority to `/.claude/CLAUDE.md` and SOURCE_OF_TRUTH_MAP; clarify status snapshot. |
| docs/command/SOCELLE_MONOREPO_MAP.md | Header: V1 master | Authority = CLAUDE + SOURCE_OF_TRUTH_MAP. |
| docs/command/MODULE_BOUNDARIES.md | Header: V1 master | Same. |
| docs/operations/API_LOGIC_MAP.md | No superseded note for API-WO-* | Add banner: API-WO-* superseded by build_tracker WO IDs. |
| SOCELLE-WEB/docs/audit/SOCELLE_WORK_ORDER_BACKLOG.md | Second WO backlog | Add banner: "Not execution authority. Use build_tracker.md." |
| docs/command/AGENT_SCOPE_REGISTRY.md | "Read V1 before any work" | Update to SESSION_START + 3-file chain; authority = CLAUDE + SOURCE_OF_TRUTH_MAP. |

Patch text is in `SOCELLE-WEB/docs/ops/DOC_CONFLICT_PATCH_PLAN.md`. Execute as DOC-GOV-01 (docs-only WO).

---

## 3. WHAT IS BEING DEPRECATED (AND HOW LABELED)

- **V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md:** Add header "SUPERSEDED. Authority: /.claude/CLAUDE.md and SOURCE_OF_TRUTH_MAP." Do not delete.
- **SOCELLE_MASTER_CLAUDE_MD_COMPLETE.md:** Add "SNAPSHOT — NOT LIVE. Authoritative: /.claude/CLAUDE.md." Optionally move to docs/archive/.
- **SITE_MAP.md:** Add "DEPRECATED. Use GLOBAL_SITE_MAP.md."
- **Root OPERATION_BREAKOUT.md:** Add "Canonical for web: SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md."
- **SOCELLE_WORK_ORDER_BACKLOG.md, SOCELLE_MASTER_ACTION_PLAN.md:** Add "Not execution authority. Use build_tracker.md."
- **SOCELLE-WEB/docs/ASSET_MANIFEST.md:** Add "Canonical: docs/command/ASSET_MANIFEST.md."

All by header/banner only unless owner approves archive move. No file deletion.

---

## 4. PRODUCT POWER FIRST PLAN

### Next 5 WOs by ROI (data + UX + advanced features)

| Priority | WO ID | Why ROI-first |
|----------|-------|----------------|
| 1 | **CMS-WO-07** | P1 head. story_drafts + feeds-to-drafts + AdminStoryDrafts. Unblocks editorial pipeline and Product Power (content from intelligence). |
| 2 | **DEBT-TANSTACK-REAL-6** | Launch §16.23. 6 raw useEffect+supabase violations. Data pattern consistency and maintainability. |
| 3 | **INTEL-POWER-01** (or equivalent WO) | Impact badge on every signal card (list + detail). Table stakes per competitive audit; IDEA-MINING Pattern 1. |
| 4 | **EVT-WO-02** | /events/:slug dead end. Journey fix; shell reduction. |
| 5 | **P1-3 + P2-1** | Token cleanup (P1-3); test upgrade (P2-1). Fast wins for gate and stability. |

### Explicitly deferred (and why)

- **SPLIT-* packaging:** Deferred until Product Power + UX gates are satisfied (see §5). We do not package/split until then.
- **P2-STRIPE:** Blocked on owner configuring stripe_price_id; no agent action until then.
- **Full MERCH-INTEL-02:** Verify artifact shows FAIL (4 gaps); treated as PARTIAL until MERCH-INTEL-03-FINAL closes.

---

## 5. APP-BY-APP GROUPING FOR SPLIT (GATE)

**Gate:** We do not package/split until **Product Power + UX gates are satisfied.**

**Shared platform layers (not split out as separate "app"):**  
CMS Core, Authoring Studio, Core Platform (auth, entitlements, credits, analytics, routing).

**Hub apps (split targets when gate is met):**  
Intelligence, CRM, Sales, Marketing, Education, Commerce/Procurement, Admin, Public Marketing Site, Mobile/Tauri/PWA wrappers.

**Product Power + UX gates (must be satisfied before split):**  
(1) Intelligence: LIVE portal intelligence; impact/dedup/action arc on cards; Today View entry.  
(2) No Category C shells on critical journeys (CoursePlayer, protocols, marketing campaign).  
(3) Signal→campaign and signal→deal attribution wired.  
(4) Proof packs (tsc, build, verify_*.json) for all P1-head WOs.  
(5) DOC-GOV-01 patches applied so authority chain is unambiguous.

Until then, execution remains single-codebase; split is downstream.

---

## 6. VALIDATION GATE

**Question:** Is this plan best for the future of SOCELLE as a leading technology company — or just the easiest split?

**Answer:** This plan prioritizes product power (intelligence as intelligence, cross-hub action, provenance, vertical UX) and competitive table stakes. **Next WOs are chosen by ROI + competitive advantage, not convenience.** Split is gated on Product Power + UX. It is **not** the easiest split — it defers packaging until gates are satisfied.

---

## 7. PRE-CODING SPRINT OUTPUT (CANONICAL LIST)

**Pre-coding sprint deliverables — all must exist before choosing next WOs. Split plan gated by Product Power + UX readiness.**

| # | File | Status |
|---|------|--------|
| 1 | SOCELLE-WEB/docs/command/SOURCE_OF_TRUTH_MAP.md | (A) Conflict rules: execution truth = build_tracker + verify_*.json (not older plans) |
| 2 | SOCELLE-WEB/docs/ops/DOC_INVENTORY_REPORT.md | (B) Reduced Daily Read Set = Tier 0 + small Tier 1; WO-scoped read for Tier 2; demotion = no deletes |
| 3 | SOCELLE-WEB/docs/ops/EXECUTION_STATE_AUDIT.md | (C) |
| 4 | SOCELLE-WEB/docs/ops/PRODUCT_SURFACE_AUDIT.md | (D) |
| 5 | SOCELLE-WEB/docs/ops/PRODUCT_POWER_AUDIT.md | (E) |
| 6 | **SOCELLE-WEB/docs/ops/APP_BY_APP_IDEA_MINING_UPGRADES.md** | **(NEW) Per-app competitors, table-stakes vs moat, upgraded WOs with proof pack paths** |
| 7 | SOCELLE-WEB/docs/command/SESSION_START.md | (F1) Canonical entrypoint; proof pack = tsc + build + verify_*.json + required skills; one WO per session unless owner authorizes |
| 8 | .claude/CLAUDE.md | (F2) Patched §0 |
| 9 | SOCELLE-WEB/docs/ops/AUDIT_SPRINT_SUMMARY.md | This file (final compilation) |

**Split gate:** Next WOs are chosen by **ROI + competitive advantage**, not convenience. Packaging/split is downstream of Product Power + UX gates (§5).

---

## 8. DELIVERABLES CREATED/UPDATED (THIS SPRINT)

| # | File | Status |
|---|------|--------|
| 1 | SOCELLE-WEB/docs/command/SOURCE_OF_TRUTH_MAP.md | Created/updated (A) |
| 2 | SOCELLE-WEB/docs/ops/DOC_INVENTORY_REPORT.md | Created/updated (B) |
| 3 | SOCELLE-WEB/docs/ops/EXECUTION_STATE_AUDIT.md | Created/updated (C) |
| 4 | SOCELLE-WEB/docs/ops/PRODUCT_SURFACE_AUDIT.md | Created/updated (D) |
| 5 | SOCELLE-WEB/docs/ops/PRODUCT_POWER_AUDIT.md | Created/updated (E) |
| 6 | SOCELLE-WEB/docs/ops/APP_BY_APP_IDEA_MINING_UPGRADES.md | Created (this deliverable) |
| 7 | SOCELLE-WEB/docs/command/SESSION_START.md | Created (F1) |
| 8 | .claude/CLAUDE.md | Patched §0 (F2) |
| 9 | SOCELLE-WEB/docs/ops/AUDIT_SPRINT_SUMMARY.md | This file (final compilation) |
| 10 | SOCELLE-WEB/docs/ops/GIT_PROOF_REPORT.md | Git proof (local vs GitHub; commit/push to make GitHub authoritative) |

---

## 9. EXECUTIVE SUMMARY (10 BULLETS)

1. **Single entrypoint:** SESSION_START.md (docs/command or SOCELLE-WEB/docs/command) is mandatory first read; CLAUDE §0 patched to mandate it.
2. **Source-of-truth map:** Tier 0 = CLAUDE; Tier 1 = build_tracker, MASTER_STATUS, SOCELLE_MASTER_BUILD_WO, V3_BUILD_PLAN, CMS specs, JOURNEY_STANDARDS, SESSION_START; conflict rules and "documents to patch" listed.
3. **Doc inventory:** Command outputs pasted; duplicates and demotion plan (no delete); reduced daily read set and WO-scoped read rules.
4. **Execution state:** Hard DONE/OPEN/BLOCKED table with evidence; P0 DONE, P1 ACTIVE, P2 PENDING/BLOCKED; verification gaps noted.
5. **Product surface:** Public/portal routes LIVE/DEMO with code evidence; top 10 journeys with breakpoints; IDEA-MINING code vs docs-only table.
6. **Product power audit:** Competitive research (10+ sources); table stakes vs moat; upgraded WOs per hub (Intelligence, CRM, Sales, Marketing, Education, Commerce, Admin, Studio/CMS); "not the easy way" callouts; validation gate passed.
7. **Conflicts:** MASTER_STATUS, MONOREPO_MAP, MODULE_BOUNDARIES, API_LOGIC_MAP, WORK_ORDER_BACKLOG, AGENT_SCOPE_REGISTRY require patches (DOC-GOV-01).
8. **Deprecated:** V1, SOCELLE_MASTER_CLAUDE_MD_COMPLETE, SITE_MAP, OPERATION_BREAKOUT (root), audit backlogs — header/banner only, no delete.
9. **Next 5 WOs by ROI:** CMS-WO-07, DEBT-TANSTACK-REAL-6, INTEL-POWER-01 (or impact-badge WO), EVT-WO-02, P1-3+P2-1. SPLIT deferred until Product Power + UX gates satisfied.
10. **Git proof:** Local HEAD = origin/main (19e9ec7); uncommitted = 5 modified + 10 untracked; to make GitHub authoritative, commit and push.

---

## 10. NEXT 3 RECOMMENDED WOs

1. **CMS-WO-07** — Complete story_drafts migration + feeds-to-drafts + AdminStoryDrafts; run hub-shell-detector, rls-auditor, dev-best-practice-checker, build-gate; produce verify_CMS-WO-07_*.json.
2. **DEBT-TANSTACK-REAL-6** — Migrate 6 files (BusinessRulesView, ReportsView, MappingView, PlanOutputView, ServiceIntelligenceView, MarketingCalendarView) from raw useEffect+supabase to useQuery; run dev-best-practice-checker; produce verify_DEBT-TANSTACK-REAL-6_*.json.
3. **EVT-WO-02** — Add `/events/:slug` route and EventDetail page; wire to events table; run hub-shell-detector, live-demo-detector; produce verify_EVT-WO-02_*.json.

---

**STOP CONDITION OBSERVED:** No coding has been started. All deliverables are documentation-only. Return with list of created/updated docs + executive summary + next 3 WOs as specified.

---

*End of AUDIT_SPRINT_SUMMARY. Commit anchor: d1442d3.*
