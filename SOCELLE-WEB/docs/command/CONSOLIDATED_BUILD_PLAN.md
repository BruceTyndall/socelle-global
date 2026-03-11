# CONSOLIDATED BUILD PLAN — SINGLE PLAN DOCUMENT

**Created:** 2026-03-13  
**Authority:** `/.claude/CLAUDE.md` §0.  
**Purpose:** One place for "what we're building" and "in what order." All other plan docs (V3_BUILD_PLAN, SOCELLE_MASTER_BUILD_WO, OPERATION_BREAKOUT phase/WO structure) are superseded by this document for phase order and WO scope.

**Execution status (DONE / OPEN / PARTIAL) lives only in:**
- `SOCELLE-WEB/docs/build_tracker.md`
- `SOCELLE-WEB/docs/qa/verify_<WO_ID>_*.json`

Do not infer status from this plan. Check build_tracker + verify artifacts.

---

## §1 — WHERE TO LOOK FOR WHAT

| Question | Answer |
|----------|--------|
| What phases exist and in what order? | §2 below (this doc). |
| What WOs exist and what is their scope? | §3 + §4 below; Product Power detail → `SOCELLE-WEB/docs/ops/APP_BY_APP_IDEA_MINING_UPGRADES.md`. |
| Is WO X done or open? | `SOCELLE-WEB/docs/build_tracker.md` + `docs/qa/verify_<WO_ID>_*.json`. |
| What are the non-negotiables and stop conditions? | §5–§6 below. |
| CMS table spec / block types / journey specs? | Tier 2: `CMS_ARCHITECTURE.md`, `CMS_CONTENT_MODEL.md`, `JOURNEY_STANDARDS.md` (read when doing CMS/hub WOs). |
| **Where does every other important detail live?** | **`SOCELLE-WEB/docs/command/SOURCE_OF_TRUTH_MAP.md` §4 — "Where every important detail lives."** Nothing is lost; that section lists every doc and what it contains. |

---

## §2 — PHASE ORDER (SEQUENTIAL)

| Phase | Name | WOs (summary) | Notes |
|-------|------|----------------|-------|
| 1 | CMS Schema + RLS | WO-CMS-01 | 8 `cms_*` tables, RLS, indexes, database.types.ts |
| 2 | CMS Client + PageRenderer | WO-CMS-02, WO-CMS-04 | Hooks (useCms*), PageRenderer, public routes |
| 3 | CMS Hub UI + Authoring Studio | WO-CMS-03, WO-CMS-05 | /admin/cms/*, Studio editor, version history |
| 4 | Hub CMS Integrations | WO-CMS-06 | All hubs read from cms_*; one journey per hub + E2E |
| 5 | Intelligence Cloud | V2-INTEL-01..06 (or INTEL-WO-*, FEED-WO-*, MERCH-*) | 10 modules, 7 AI engines, 6 tools, feed pipeline, credits, affiliate |
| 6 | All Hubs Non-Shell | V2-HUBS-01..14 | Intelligence, Jobs, Brands, Professionals, Admin, CRM, Education, Marketing, Sales, Commerce, Studio, Credit, Affiliate, CMS surfaces |
| 7 | Platform Features | V2-PLAT-01..05 | Search, notifications, SEO, onboarding, paywall/tier gating |
| 8 | Multi-Platform | V2-MULTI-01..03 / MOBILE-WO, TAURI-WO, PWA-WO | PWA, Tauri, Flutter |
| 9 | Launch Gates | V2-LAUNCH-01, V2-LAUNCH-02 | Launch non-negotiables (CLAUDE §16), launch comms |

**Product Power / Idea Mining** (upgrade layer): INTEL-POWER-01..05, CRM-POWER-01/02, SALES-POWER-01, MKT-POWER-01, EDU-POWER-01, COMMERCE-POWER-01, ADMIN-POWER-01, CMS-POWER-01, SITE-POWER-01, MOBILE-POWER-01. Full scope and acceptance criteria in `SOCELLE-WEB/docs/ops/APP_BY_APP_IDEA_MINING_UPGRADES.md`. Registered in build_tracker "Product Power / Idea Mining WOs" table.

---

## §3 — WO REGISTRY (SCOPE ONE-LINER)

**CMS (Phases 1–4)**  
| WO | Scope |
|----|--------|
| WO-CMS-01 | 8 cms_* tables, RLS, indexes, database.types.ts regen |
| WO-CMS-02 | CMS client + 8 useCms* hooks (TanStack Query), 42P01, isLive |
| WO-CMS-03 | 7 admin routes /admin/cms/*, CRUD, media, auth guards |
| WO-CMS-04 | PageRenderer (cms_pages + blocks), /pages/:slug, /blog, SEO |
| WO-CMS-05 | Authoring Studio: block editor, preview, version history, publish |
| WO-CMS-06 | Hub integrations: intelligence/education/marketing/sales/jobs/brands from cms_*; one journey + E2E per hub |
| CMS-WO-07 / CMS-POWER-01 | Editorial rail + story_drafts + feeds-to-drafts + AdminStoryDrafts (no shell) |

**Intelligence & Feed (Phase 5)**  
| WO | Scope |
|----|--------|
| FEED-WO-01..05 | data_feeds, feed_run_log, rss-to-signals, health, DLQ |
| INTEL-WO-01..11 | useIntelligence, SignalTable, TrendStacks, OpportunitySignals, AIToolbar, CrossHubActionDispatcher, states, saved searches, /home |
| MERCH-INTEL-* | Merchandising rules, safety-pin sort, topic cap, coverage expansion, image clicks |
| INTEL-POWER-01..05 | Impact badge, "N similar" dedup UI, Today View default, in-card Take action, sentiment banner + filters |

**Control & Pay (foundation)**  
| WO | Scope |
|----|--------|
| CTRL-WO-01..04 | Feature flags, kill switch, audit log, entitlements chain |
| PAY-WO-01..05 | Credits E2E, deduct_credits, CreditGate, affiliate_clicks, Stripe webhook |

**Hubs (Phase 6)**  
| WO | Scope |
|----|--------|
| CRM-WO-07/08/09, CRM-POWER-01/02 | Consent log, churn risk, rebooking, timeline + signal attribution |
| SALES-WO-05/08, SALES-POWER-01 | signal_id on deals, ProposalBuilder states, deal attribution + revenue analytics |
| COMMERCE-WO-03/07, COMMERCE-POWER-01 | FTC affiliate badges, ProcurementDashboard, reorder alerts |
| EDU-WO-02/05, EDU-POWER-01 | EducationDashboard, CECredits, QuizPlayer states, CE + course player states |
| MKT-POWER-01 | Signal → campaign CTA (fix DEBT-04), single marketing path |
| ADMIN-POWER-01 | System health + feeds + audit log dashboard (real data) |
| SITE-POWER-01 | Route cleanup, single pricing path, persona CTA hierarchy |
| STUDIO-UI-* | StudioEditor, DragCanvas, TemplatePickerModal, ExportModal, share pack |

**Platform & Multi-Platform (Phases 7–8)**  
| WO | Scope |
|----|--------|
| V2-PLAT-01..05 | Search, notifications, SEO, onboarding, paywall |
| MOBILE-WO, TAURI-WO-01, PWA-WO-01/02/03, MOBILE-POWER-01 | Flutter hubs, Tauri shell, PWA install + push, MODULE gates |

**Launch (Phase 9)**  
| WO | Scope |
|----|--------|
| V2-LAUNCH-01 | 24 launch non-negotiables (CLAUDE §16) |
| V2-LAUNCH-02 | Launch comms — 72-hour window |

**Debt / P0 / P1 / P2**  
Tracked in build_tracker P0/P1/P2 queues (e.g. DEBT-TANSTACK-REAL-6, P1-3, P2-1). No separate phase; fix before or alongside phase work per priority.

---

## §4 — ACCEPTANCE CRITERIA SOURCE (NOTHING LOST)

- **Full acceptance criteria** for CMS WOs: `SOCELLE-WEB/docs/command/V3_BUILD_PLAN.md` §8 (WO-CMS-01..06 substeps).  
- **Full acceptance criteria** for hub/platform/multi/launch WOs: `SOCELLE_MASTER_BUILD_WO.md` (repo root) sections 2–9 (per-WO scope, owner, depends on, acceptance).  
- **Product Power WOs**: `SOCELLE-WEB/docs/ops/APP_BY_APP_IDEA_MINING_UPGRADES.md` (per-app tables with acceptance, proof pack path, dependencies, effort).  
- **Done** = build_tracker row + `docs/qa/verify_<WO_ID>_*.json` with overall PASS + tsc=0 + build=PASS. No self-certification.

**All other detail (V3 §0–§7, §9–§10; Master WO §0–0.1; OPERATION_BREAKOUT; PRODUCT_POWER_AUDIT; AUDIT_SPRINT_SUMMARY; EXECUTION_STATE_AUDIT; doc patches; etc.)** is explicitly listed in **SOURCE_OF_TRUTH_MAP.md §4 — "Where every important detail lives."** That section is the guarantee that nothing important is lost.

---

## §5 — NON-NEGOTIABLES

1. **Intelligence-first** — Intelligence platform first; commerce and other hubs second.  
2. **No shells** — Every hub/page has real data, actions, RLS, error/empty/loading, exports; observability in Admin.  
3. **LIVE vs DEMO** — All data surfaces labeled; no MOCK without DEMO badge.  
4. **Add-only migrations** — RLS on every table; no destructive ops without owner approval.  
5. **Pearl Mineral V2** — Tokens only; no rogue hex; no `font-serif` on public pages.  
6. **No external CMS** — All content in Supabase `cms_*` tables.  
7. **TanStack Query** — No raw `useEffect` + `supabase.from()` for data fetch.  
8. **Doc Gate** — No WO marked DONE without proof pack (tsc, build, verify_*.json, required skills).  
9. **Execution truth** — build_tracker + verify_*.json (not older plans).

---

## §6 — STOP CONDITIONS (HALT AND ESCALATE)

- Shell page about to ship (no live data, no states, no CRUD).  
- Banned term in user-facing copy.  
- Raw `useEffect` + `supabase.from()` in new code.  
- Self-certification without `docs/qa/verify_*.json`.  
- `font-serif` on public pages or hardcoded hex outside Pearl Mineral V2.  
- CMS tables without RLS; PageRenderer without `status = 'published'` check.  
- New planning doc created outside build_tracker / this consolidated plan (CLAUDE §B).

Full list: `/.claude/CLAUDE.md` §9.

---

## §7 — SUPERSEDED DOCUMENTS (DO NOT USE FOR PHASE/WO ORDER — BUT DETAIL LIVES HERE)

| Document | Role now | What important detail it still holds |
|----------|----------|--------------------------------------|
| `V3_BUILD_PLAN.md` | Phase order and WO list → this doc. | **§0** scope clarification (V2-TECH frozen); **§1–§2** CMS vision, 8 cms_* tables, RLS model; **§3** all-hubs CMS requirements per hub; **§4** persona success criteria, V3 vs Previous; **§5–§6** phase detail, CMS non-negotiables; **§7** CMS stop conditions; **§8** WO-CMS-01..06 substeps; **§9** global non-negotiables; **§10** required skill runs before launch, HALT conditions. |
| `SOCELLE_MASTER_BUILD_WO.md` (repo root) | Phase order and WO list → this doc. | **§0.1** completion state snapshot (COMPLETE/PARTIAL/TODO); **§0** frozen milestones, codebase metrics; **§1** phase table; **§2–§9** full WO acceptance criteria, owner, depends on; **OPEN DEBT** table (pro-*, Sentry, useEffect+supabase, tests, shells). |
| `OPERATION_BREAKOUT.md` | Not source of phase order. | WO sub-task decomposition; sub-WO definitions when a WO has sub-tasks. |
| `SOCELLE_WORK_ORDER_BACKLOG.md` | Not execution authority. | Proposed WOs; must be in build_tracker before execution. |
| `SOCELLE_MASTER_ACTION_PLAN.md` | Snapshot. | Items integrated into build_tracker. |

**Full index of where every important detail lives:** `SOURCE_OF_TRUTH_MAP.md` §4.

---

*Single plan = this file. Execution status = build_tracker + verify_*.json. Quality outranks time. Intelligence platform first. Always.*
