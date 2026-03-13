# AUDIT REPORT — 2026 MULTI-APP READINESS

Generated: 2026-03-12T18:19:32Z  
Scope: SOCELLE-WEB hub-by-hub UX, data live-ness, reliability, security, and tracker correction audit.  
Method: simulated multi-agent sections using `playwright-crawler`, `feed-pipeline-checker`, `risk-gatekeeper`, and `operations-optimizer` workflows plus live Supabase probes and build/runtime gates.

## 1. Governance Citations

From `/.claude/CLAUDE.md`:

> **Before writing ANY code, running ANY command, or making ANY decision, follow the `SESSION_START.md` sequence exactly. The core three-file chain is:**
>
> 1. **`/.claude/CLAUDE.md`** — this file (governance, stop conditions, launch gates)
> 2. **`SOCELLE-WEB/docs/build_tracker.md`** — lines 1–50 only (current phase, active WOs, freeze directives)
> 3. **`SOCELLE-WEB/MASTER_STATUS.md`** — top sections (build health, LIVE/DEMO mix, data/API state)
>
> 4. **`SOCELLE-WEB/docs/command/CONSOLIDATED_BUILD_PLAN.md`** — single plan document (phase order 1–9, WO registry, non-negotiables). Execution status = build_tracker + verify_*.json only.

From `/.claude/CLAUDE.md`:

> 3. Skill output must be captured as a JSON artifact in `SOCELLE-WEB/docs/qa/verify_<WO_ID>_<timestamp>.json`.

From `/.claude/CLAUDE.md`:

> | Any page edit | `hub-shell-detector` → `live-demo-detector` |
> | Any DB change | `rls-auditor` → `schema-db-suite` → `migration-validator` |
> | Pre-completion of any WO | `build-gate` → `banned-term-scanner` → `proof-pack` |

From `/.claude/CLAUDE.md`:

> 1. `npx tsc --noEmit` → Exit 0
> 2. `npm run build` → Exit 0

From `SOCELLE-WEB/docs/build_tracker.md`:

> **Execution scope is ONLY the WOs within CURRENT_QUEUE_START/END.**
> All other tables are historical/planning unless explicitly moved into CURRENT_QUEUE.
> Sources of truth: this file + `docs/qa/verify_*.json`.

From `SOCELLE-WEB/docs/command/CONSOLIDATED_BUILD_PLAN.md`:

> **Execution status (DONE / OPEN / PARTIAL) lives only in:**
> - `SOCELLE-WEB/docs/build_tracker.md`
> - `SOCELLE-WEB/docs/qa/verify_<WO_ID>_*.json`
>
> Do not infer status from this plan. Check build_tracker + verify artifacts.

## 2. Verification Gates

| Command | Result | Evidence |
|---|---|---|
| `git status --short --branch` | PASS with dirty worktree | Existing parallel-agent edits in `docs/build_tracker.md`, `docs/command/CONSOLIDATED_BUILD_PLAN.md`, `docs/qa/shell_detector_report.json`, `../SOCELLE_MASTER_BUILD_WO.md`, plus untracked QA screenshots/json. |
| `npx tsc --noEmit` | PASS | Exit `0`. |
| `npm run build` | PASS with warnings | Exit `0`; `pdfjs-dist` `eval` warning; chunk warnings for `vendor-docs-DOtA4UTj.js` `847.70 kB` and `index-IhlrfslO.js` `458.83 kB`. |
| `npm test` | PASS | `20` files, `155` tests passed. |
| `npm run shell:check` | PASS | `281` total pages; `187 LIVE`, `59 DEMO`, `0 SHELL`, `35 EXEMPT`. |
| `npm run fakelive:check` | FAIL | Regression list includes `src/lib/intelligence/adminIntelligence.ts` and `src/pages/public/EventDetail.tsx`, plus test mocks. |
| `npm run routes:check` | FAIL | Route manifest drift: added `/waitlist`; source-of-truth route manifest not regenerated. |
| `bash -lc 'ls tests/e2e/*.spec.ts 2>/dev/null | wc -l'` | FAIL | `0` Playwright E2E specs found. |

## 2.1 Post-Audit Governance Alignment

- `AGENTS.md` path references were normalized to the real root governance file and active skill directory.
- `docs/command/SESSION_START.md` and `SOCELLE-WEB/docs/command/SESSION_START.md` were aligned to the same active authority chain.
- `docs/command/SOURCE_OF_TRUTH_MAP.md` and `SOCELLE-WEB/docs/command/SOURCE_OF_TRUTH_MAP.md` now open with an owner quick-start section that points to execution truth first.
- `SOCELLE-WEB/docs/build_tracker.md` top-of-file guidance now explicitly routes conflicts to `AGENTS.md` → `SESSION_START.md` → `build_tracker.md` → `verify_*.json`.
- `SOCELLE-WEB/docs/GOVERNANCE.md` was demoted to reference-only so it no longer overrides the execution ledger.

## 3. Agent Summaries

### Agent A — UX Journey Auditor
- Public crawl proved that `/`, `/intelligence`, `/brands`, `/events`, and `/jobs` all converge to the same prelaunch `/waitlist` experience for anonymous users.
- Portal routes render shared chrome, but critical value loops remain ambiguous or degraded because several backing tables are absent in production.
- Admin routes exist and some are data-backed, but the admin experience is mixed live/demo and fractured across hub pages.

### Agent B — Data & Pipeline Auditor
- `market_signals` is genuinely live: `2489` total rows, `235` in the last 24 hours, `735` in the last 7 days.
- Core intelligence/taxonomy inventory exists: `14` `intelligence_channels`, `584` `taxonomy_tags`, `603` `rss_item_tags`.
- Public inventory exists but is under-merchandised or hidden: `1` brand, `8` events, `12` job postings, `6` CMS posts.
- Several declared hub tables are absent from the live schema cache: `account_module_access`, `crm_contacts`, `crm_companies`, `crm_tasks`, `crm_consent_log`, `deals`, `campaigns`, `courses`, `course_enrollments`, `ingredient_profiles`.

### Agent C — Reliability / Observability
- Feed pipeline is active but degraded: `216` `data_feeds`, `706` `feed_run_log` rows, `549` `feed_dlq` rows.
- In the latest `25` feed runs: `15 error`, `8 running`, `2 success`; `8` rows are stale `running` with `finished_at = null`.
- Latest feed error is endpoint hygiene, not transport failure: `URL returned HTML (text/html; charset=utf-8) — not an RSS/Atom feed. Update endpoint_url in data_feeds.`
- `platform_events = 0` and `audit_log = 0`, so product telemetry and administrative observability are not yet proving real usage.

### Agent D — Security / Compliance
- Intelligence signal article rendering is hardened through `sanitizeArticleHtml`, but other HTML surfaces remain unsanitized.
- `CoursePlayer` renders `currentLesson.content` via `dangerouslySetInnerHTML` without sanitization.
- `IntelligenceBriefDetail` renders `post.body` via `dangerouslySetInnerHTML` without sanitization.
- `src-tauri/tauri.conf.json` sets `"csp": null`, which is not acceptable for a split desktop shell.
- `public/sw.js` claims an offline navigation fallback but `navigationFallback()` just calls `fetch(request)`.

### Agent E — Tracker / Plan Integrator
- The current queue did not contain multi-app readiness WOs for every audited hub.
- This audit adds a dedicated multi-app readiness block inside the canonical queue with one measurable WO per audited hub plus an audit ledger row.

## 4. Hub-by-Hub Scorecards

| Hub | Status | Entry Routes Audited | Critical Flows Audited | Navigation | Data Visibility | Actionability | Error Handling | Multi-App Readiness | Key Evidence |
|---|---|---|---|---:|---:|---:|---:|---:|---|
| Intelligence | READY_FOR_REVIEW | `/intelligence`, `/portal/intelligence`, `/brand/intelligence`, `/admin/intelligence` | public browse → signal preview, portal feed → detail → save/like, admin intelligence → feed/admin telemetry | 3 | 4 | 3 | 3 | 3 | `market_signals=2489`, `24h=235`, `intelligence_channels=14`, public route still waitlist-gated |
| CRM | BROKEN/MISSING | `/portal/crm`, `/portal/crm/contacts`, `/portal/crm/companies`, `/portal/crm/tasks`, `/admin/crm` | dashboard → contacts → detail → task → consent | 2 | 1 | 2 | 2 | 1 | live schema cache missing `crm_contacts`, `crm_companies`, `crm_tasks`, `crm_consent_log` |
| Sales | BROKEN/MISSING | `/sales`, `/sales/pipeline`, `/sales/deals/:id`, `/portal/sales`, `/admin/sales` | dashboard → opportunity → deal → proposal | 2 | 1 | 2 | 2 | 1 | live schema cache missing `deals`; top-level sales pages still demo-heavy |
| Marketing | BROKEN/MISSING | `/portal/marketing`, `/portal/marketing/campaigns`, `/portal/marketing/templates`, `/admin/marketing` | dashboard → campaign list → builder → detail → analytics | 3 | 1 | 2 | 2 | 1 | live schema cache missing `campaigns`; dashboard metrics hardcoded |
| Education | BROKEN/MISSING | `/education`, `/education/courses`, `/education/learn/:slug`, `/portal/education`, `/admin/education` | catalog → course detail → player → certificate | 3 | 1 | 2 | 2 | 1 | live schema cache missing `courses` and `course_enrollments`; unsanitized lesson HTML |
| Commerce / Procurement | BROKEN/MISSING | `/shop`, `/portal/procurement`, `/portal/orders`, `/portal/subscription`, `/admin/shop` | browse → cart → checkout → order history, procurement → reorder | 2 | 1 | 2 | 2 | 1 | `orders=0`, `order_items=0`, subscription cancellation TODO, module access table missing |
| Admin | READY_FOR_REVIEW | `/admin/dashboard`, `/admin/intelligence`, `/admin/feeds`, `/admin/subscriptions/accounts`, `/admin/cms` | telemetry → feeds → subscriptions → CMS | 3 | 3 | 3 | 2 | 2 | some live data (`api_registry=31`, `data_feeds=216`), but `audit_log=0` and subscription pages depend on missing `account_module_access` |
| Studio / CMS | READY_FOR_REVIEW | `/admin/cms`, `/admin/cms/posts`, `/admin/cms/pages`, `/portal/studio`, `/pages/:slug` | post list → post edit → placement → draft handoff | 3 | 3 | 2 | 2 | 2 | `cms_spaces=10`, `cms_templates=4`, `cms_posts=6`, `cms_pages=0`, `story_drafts=0` |
| Public Site | BROKEN/MISSING | `/`, `/intelligence`, `/brands`, `/events`, `/jobs`, `/request-access` | home → category → detail → request access | 1 | 2 | 1 | 2 | 1 | public crawl shows core routes redirect to `/waitlist`; distinct hub IA is hidden |
| Mobile / Tauri / PWA | BROKEN/MISSING | web install prompt, `src-tauri`, service worker | install → offline → push, desktop shell launch | 2 | 1 | 1 | 1 | 1 | PWA exists but no E2E coverage; Tauri shell exists with `csp: null`; no Flutter workspace found |

### Intelligence
- What is live:
  - `market_signals=2489`, `last_24h=235`, `last_7d=735`
  - `intelligence_channels=14`
  - `taxonomy_tags=584`, `rss_item_tags=603`
- UX issues:
  - Anonymous `/intelligence` does not open a true public intelligence experience; it redirects to `/waitlist`.
  - The public editorial rail still contains a static message: “The editorial rail stays tied to the live feed, not a static placeholder.”
  - Portal intelligence still carries a DEMO branch in code, which undermines trust while live data is already present.
- Multi-app readiness:
  - Stable route namespace exists.
  - Needs an uncollapsed public value loop, non-static editorial merchandising, and real engagement telemetry.

### CRM
- What is live:
  - Cannot prove CRM live inventory because live schema cache returns `404` for `crm_contacts`, `crm_companies`, `crm_tasks`, and `crm_consent_log`.
- UX issues:
  - CRM appears navigable from portal chrome, but the production data layer for its core entities is absent.
  - This makes list/detail/task/consent loops impossible to certify.
- Multi-app readiness:
  - Fails stable value-loop and tenant-proof requirements until the production schema is applied and verified.

### Sales
- What is live:
  - Cannot prove live deals or proposals because `deals` is absent from the live schema cache.
- UX issues:
  - Sales routes exist and some pages show polished states, but the core deal loop is not production-backed.
  - Proposal flows exist in UI but cannot be certified end-to-end.
- Multi-app readiness:
  - Fails value-loop readiness until `deals` and related sales tables exist and portal/admin loops are verified.

### Marketing
- What is live:
  - Cannot prove live campaign inventory because `campaigns` is absent from the live schema cache.
- UX issues:
  - `MarketingDashboard` computes `totalSends`, `avgOpenRate`, and `avgClickRate` from placeholders, not stored metrics.
  - Campaign surfaces are mixed live/demo at best.
- Multi-app readiness:
  - Fails data truth and outcome-loop requirements until live campaigns, metrics, and analytics are present.

### Education
- What is live:
  - Cannot prove live course or enrollment inventory because `courses` and `course_enrollments` return schema-cache `404`.
- UX issues:
  - Course player renders raw lesson HTML.
  - Certificate and CE flows cannot be certified against live course/enrollment data.
- Multi-app readiness:
  - Fails data, safety, and verified value-loop requirements.

### Commerce / Procurement
- What is live:
  - `orders=0`, `order_items=0`
- UX issues:
  - Subscription cancellation is a TODO no-op.
  - Payment method and billing history are placeholders.
  - Procurement/order history can render, but there is no proven transactional inventory.
- Multi-app readiness:
  - Fails revenue-loop readiness until billing, module access, and order history are real and observable.

### Admin
- What is live:
  - `data_feeds=216`
  - `api_registry=31`
  - `feed_run_log=706`
  - `feed_dlq=549`
  - `cms_spaces=10`
  - `cms_templates=4`
- UX issues:
  - Admin is fractured across many live/demo pages, so “one pane of glass” is still missing.
  - Subscription admin is blocked by missing `account_module_access`.
  - `audit_log=0`, so admin observability is incomplete.
- Multi-app readiness:
  - Closest of the non-intelligence hubs, but still not split-ready without entitlement/admin telemetry repair.

### Studio / CMS
- What is live:
  - `cms_spaces=10`
  - `cms_templates=4`
  - `cms_posts=6`
- UX issues:
  - `cms_pages=0`, so the generic page system has no production content inventory.
  - `story_drafts=0`, so feeds-to-editorial handoff is effectively absent.
- Multi-app readiness:
  - Content primitives exist, but editorial workflow and page inventory do not yet support an autonomous app split.

### Public Site
- What is live:
  - `brands=1`, `events=8`, `job_postings=12`, `cms_posts=6`
- UX issues:
  - Public crawl proves multiple hub entry routes collapse to `/waitlist`.
  - The site hides actual live inventory instead of previewing it and converting from value.
- Multi-app readiness:
  - Fails route namespace, IA, and SEO readiness because the hub surfaces are effectively masked.

### Mobile / Tauri / PWA
- What is live:
  - PWA plugin and service worker exist.
  - Tauri wrapper exists under `src-tauri`.
- UX issues:
  - No Playwright E2E coverage.
  - Offline fallback is declared but not implemented.
  - Tauri shell disables CSP.
  - No Flutter workspace was found (`pubspec.yaml` not present in repo scan).
- Multi-app readiness:
  - Fails verification, security, and parity requirements.

## 5. Live-ness / Freshness Findings

### Production-backed value today
- Intelligence signals are the strongest live asset:
  - `market_signals=2489`
  - `235` created/updated in the last 24 hours
  - `735` created/updated in the last 7 days
- Feed supply is real:
  - `data_feeds=216`
  - `api_registry=31`
  - `feed_run_log=706`
- Taxonomy and channel substrate is live:
  - `taxonomy_tags=584`
  - `rss_item_tags=603`
  - `intelligence_channels=14`
- Public inventory exists:
  - `brands=1`
  - `events=8`
  - `job_postings=12`
  - `cms_posts=6`

### Production-backed value that is absent or unproven
- `platform_events=0`
- `audit_log=0`
- `user_tag_preferences=0`
- `user_signal_engagements=0`
- `orders=0`
- `order_items=0`
- `story_drafts=0`
- `cms_pages=0`
- `canonical_protocols=0`
- Missing from live schema cache:
  - `account_module_access`
  - `crm_contacts`
  - `crm_companies`
  - `crm_tasks`
  - `crm_consent_log`
  - `deals`
  - `campaigns`
  - `courses`
  - `course_enrollments`
  - `ingredient_profiles`

## 6. Top 25 UX Defects (Ranked)

| # | Hub | Reproduction | Actual | Impact |
|---:|---|---|---|---|
| 1 | Public Site / Intelligence | Visit `/intelligence` as anonymous user | Redirects to `/waitlist` instead of a public intelligence preview | Core acquisition loop hidden |
| 2 | Public Site / Brands | Visit `/brands` as anonymous user | Redirects to `/waitlist` despite live brand inventory | Directory discovery blocked |
| 3 | Public Site / Events | Visit `/events` as anonymous user | Redirects to `/waitlist` despite `8` live events | Events app has no public funnel |
| 4 | Public Site / Jobs | Visit `/jobs` as anonymous user | Redirects to `/waitlist` despite `12` live jobs | Jobs app has no public funnel |
| 5 | Intelligence | Open public intelligence page hero rail | Editorial headline is static copy, not a live signal | Trust and perceived freshness loss |
| 6 | Business Portal | Log into `/portal/dashboard` | Console logs module-access fetch failures immediately | Entitlement confidence broken |
| 7 | Intelligence | Open `/portal/intelligence` | DEMO branch still exists in live hub code path | Mixed live/demo messaging |
| 8 | CRM | Open `/portal/crm` then try contacts/tasks flow | Route chrome loads, but production tables are missing | False sense of readiness |
| 9 | Sales | Open `/sales` or `/portal/sales` and pursue a deal flow | Core sales entities are absent from production schema | Value loop cannot complete |
| 10 | Marketing | Open `/portal/marketing` dashboard | KPI tiles use placeholder sends/open/click rates | Fake business insight |
| 11 | Commerce | Open `/portal/subscription` and confirm cancel | Confirm cancel button is TODO no-op | Billing UX is misleading |
| 12 | Commerce | Open payment method card in subscription | Payment method is placeholder-only | Paid account management incomplete |
| 13 | Commerce | Open billing history in subscription | Billing history is placeholder-only | No financial transparency loop |
| 14 | Education | Render a text lesson in `CoursePlayer` | Raw HTML is injected unsanitized | XSS risk in learning surface |
| 15 | Public Site / Briefs | Render rich HTML `post.body` in `IntelligenceBriefDetail` | Raw HTML is injected unsanitized | XSS risk in public editorial surface |
| 16 | Admin | Open `/admin/settings` and save changes | Save only mutates local state | Admin UI overpromises control |
| 17 | Studio / CMS | Open CMS pages workflow | `cms_pages=0` in production | Page-rendering app has no inventory |
| 18 | Studio / CMS | Follow feed-to-draft editorial flow | `story_drafts=0` in production | Editorial workflow dead-end |
| 19 | Education | Open public education routes expecting live course data | `courses` is absent from production schema | Catalog/player cannot be certified |
| 20 | Commerce | Open order history routes | `orders=0`, `order_items=0` | Procurement loop has no proof of use |
| 21 | Personalization | Use channels/save-like surfaces in production | `user_tag_preferences=0`, `user_signal_engagements=0` | “For you” promise is not yet evidenced |
| 22 | Reliability | Trigger public site manifest check | `routes:check` fails because `/waitlist` is untracked | Docs/runtime drift |
| 23 | Mobile / PWA | Go offline after service worker install | `navigationFallback()` never serves offline page | PWA offline claim not met |
| 24 | Desktop / Tauri | Audit desktop shell security config | Desktop CSP is null | Unsafe shell posture |
| 25 | Platform QA | Inspect E2E coverage baseline | `0` Playwright specs found | No verified value loops |

## 7. Top 25 Platform Blockers to Multi-App Split (Ranked)

| # | Blocker | Evidence | Split Risk |
|---:|---|---|---|
| 1 | Production schema drift for core hub tables | `404` on `crm_*`, `deals`, `campaigns`, `courses`, `course_enrollments`, `ingredient_profiles` | Separate apps would ship into missing backends |
| 2 | Entitlement source table missing in production | `account_module_access` schema-cache `404`; portal logs fetch warning | Cross-app access control is unreliable |
| 3 | Public hub namespaces collapse behind prelaunch guard | `/intelligence`, `/brands`, `/events`, `/jobs` → `/waitlist` | Public apps cannot stand alone |
| 4 | Product telemetry is absent | `platform_events=0` | No personalization, funnel, or cross-app analytics |
| 5 | Administrative telemetry is absent | `audit_log=0` | No compliance/ops traceability |
| 6 | Feed pipeline is noisy | latest 25 runs = `15 error`, `8 running`, `2 success` | Intelligence supply not stable enough for app split |
| 7 | Feed DLQ backlog is high | `feed_dlq=549` | Reliability debt accumulates across apps |
| 8 | Stale running feed jobs | `8` stale `running` rows in latest 25 | Scheduler/job observability weak |
| 9 | Too many DEMO surfaces remain | `59 DEMO` pages from shell detector | App split would amplify unfinished surfaces |
| 10 | No Playwright E2E coverage | `0` specs | Split readiness cannot be proven |
| 11 | Route manifest is stale | `/waitlist` missing from manifest | Governance/source-of-truth drift |
| 12 | CMS page inventory is empty | `cms_pages=0` | Public/CMS app cannot own routed pages |
| 13 | Editorial draft pipeline is empty | `story_drafts=0` | CMS app lacks a live editorial workflow |
| 14 | Commerce transaction inventory is empty | `orders=0`, `order_items=0` | Commerce app lacks proven value loop |
| 15 | Marketing KPI logic is hardcoded | `campaigns.length * 120`, fixed open/click rates | Marketing app is not data-truthful |
| 16 | Subscription management is not wired end-to-end | Stripe cancellation TODO + payment placeholders | Revenue app not split-ready |
| 17 | Education content rendering is unsafe | raw `dangerouslySetInnerHTML` in `CoursePlayer` | Education app exposes XSS surface |
| 18 | Public editorial rendering is unsafe | raw `dangerouslySetInnerHTML` in `IntelligenceBriefDetail` | Public content app exposes XSS surface |
| 19 | PWA offline behavior is incomplete | service worker comment does not match implementation | PWA readiness overstated |
| 20 | Desktop CSP disabled | `src-tauri/tauri.conf.json` sets `csp: null` | Desktop app should not split yet |
| 21 | No mobile workspace found | no `pubspec.yaml` found | Mobile app readiness is mostly nominal |
| 22 | Intelligence engagement inventory is empty | `user_tag_preferences=0`, `user_signal_engagements=0` | Channels/personalization lack proof |
| 23 | Canonical protocols inventory is empty | `canonical_protocols=0` | Education/protocols split lacks substance |
| 24 | Ingredient app data is absent in production | `ingredient_profiles` schema-cache `404` | Ingredient app cannot split cleanly |
| 25 | Build warnings point to bundle and library debt | `pdfjs-dist` eval warning; `vendor-docs` `847.70 kB` | Performance/security debt will spread across split apps |

## 8. Security & Compliance Findings

### Critical
1. `src/pages/education/CoursePlayer.tsx:368`
   - Renders `currentLesson.content` with `dangerouslySetInnerHTML` and no sanitization.
2. `src/pages/public/IntelligenceBriefDetail.tsx:334-336`
   - Renders `post.body` with `dangerouslySetInnerHTML` and no sanitization.
3. `src-tauri/tauri.conf.json:26-28`
   - Desktop shell sets `"csp": null`.

### High
4. `public/sw.js:132-135`
   - Offline navigation fallback is claimed but not implemented.
5. `src/modules/_core/context/ModuleAccessContext.tsx:48-63`
   - Entitlement checks depend on `account_module_access`, which is absent from the live schema cache; current behavior falls back to empty records after warning.
6. `feed_run_log` latest 25 rows show repeated HTML endpoint failures, implying URL hygiene and source validation still need hardening before more aggressive automated fetches.

### Positive controls already present
- `src/components/intelligence/SignalDetailPanel.tsx:78` and `src/pages/public/IntelligenceSignalDetail.tsx`
  - Signal article HTML is sanitized with `sanitizeArticleHtml`.
- External article links in signal detail use `target="_blank"` with `rel="noopener noreferrer"`.

## 9. Definition of Done for Multi-App Split

- Route namespace is stable and not collapsed behind prelaunch redirects for the target app.
- The app has at least one complete value loop proven in browser automation.
- All backing tables for that hub exist in the live production schema cache.
- LIVE vs DEMO labeling is truthful on every surface.
- No hardcoded KPI or placeholder business metric remains on user-facing pages.
- Loading, error, and empty states are present and high-quality.
- Entitlements are enforced from a real production-backed module access source.
- `platform_events` is receiving real interaction data for the app.
- `audit_log` or equivalent admin telemetry captures privileged actions.
- Any HTML rendering surface is sanitized or downgraded to plaintext.
- `npx tsc --noEmit`, `npm run build`, `npm test`, `npm run shell:check`, `npm run routes:check`, and `npm run fakelive:check` all pass.
- The relevant verification skills from `/.claude/CLAUDE.md` have passing artifacts in `docs/qa/`.
- For PWA/Tauri/mobile:
  - offline behavior is real
  - CSP is explicit
  - parity flows have E2E proof
  - mobile workspace exists and is buildable

## 10. Next 10 Execution Set (Ranked)

| Rank | WO ID | Hub | Owner Skill | Why Next | Acceptance Criteria | Expected PR |
|---:|---|---|---|---|---|---|
| 1 | MULTIAPP-INTEL-01 | Intelligence | `intelligence-module-checker` | Highest live revenue surface already exists; fixing preview-to-paid conversion unlocks immediate value | `/intelligence` shows a real public preview, portal intelligence reaches score `>=4/5` for nav/data/action, `platform_events > 0` from signal interactions, no static editorial placeholder copy remains | 1 PR |
| 2 | MULTIAPP-SITE-01 | Public Site | `agent-site` | Current public UX hides all app value behind waitlist redirects | `/intelligence`, `/brands`, `/events`, and `/jobs` stop collapsing to the same waitlist route; at least one preview/detail/action loop exists per public app surface | 1 PR |
| 3 | MULTIAPP-CRM-01 | CRM | `agent-crm` | CRM is a retention and monetization lever but missing from prod schema | Live schema contains `crm_contacts`, `crm_companies`, `crm_tasks`, `crm_consent_log`; portal/admin CRM routes verified with Playwright list→detail→task→consent loop | 1 PR |
| 4 | MULTIAPP-SALES-01 | Sales | `agent-sales` | Sales attribution is a paid differentiator but cannot run without live deals | Live schema contains `deals` and related sales entities; `/sales` and `/portal/sales` complete opportunity→deal→proposal loop; no demo-only blockers remain | 1 PR |
| 5 | MULTIAPP-ADMIN-01 | Admin | `agent-admin` | Admin must be the control plane before apps split | `account_module_access` exists live, subscription admin works, `audit_log > 0`, unified telemetry page covers feeds/signals/errors/entitlements | 1 PR |
| 6 | MULTIAPP-MKT-01 | Marketing | `agent-marketing` | Marketing app exists in chrome but not in truthful metrics | `campaigns` exists live, marketing KPIs are sourced from real metrics, campaign list→builder→detail loop is browser-verified | 1 PR |
| 7 | MULTIAPP-CMS-01 | Studio / CMS | `agent-cms` | CMS app needs real editorial inventory and workflow | `story_drafts > 0`, `cms_pages > 0`, feed-to-draft flow works, `/admin/cms/*` and `/pages/:slug` have Playwright coverage | 1 PR |
| 8 | MULTIAPP-COMMERCE-01 | Commerce / Procurement | `agent-commerce` | Revenue loop is still mostly conceptual | Subscription cancel/update works, orders/order_items can be created and viewed, procurement loop ties intelligence to reorder actions, FTC/affiliate controls verified | 1 PR |
| 9 | MULTIAPP-EDU-01 | Education | `agent-education` | Education should be a standalone retention app but lacks live tables and safe rendering | `courses` and `course_enrollments` exist live, `CoursePlayer` HTML is sanitized, catalog→player→certificate loop is verified | 1 PR |
| 10 | MULTIAPP-MULTI-01 | Mobile / Tauri / PWA | `agent-mobile` | Multi-platform split should not proceed on nominal scaffolding | Real mobile workspace exists, Tauri CSP is non-null, PWA offline fallback works, `>=10` E2E specs exist with mobile/PWA/Tauri smoke coverage | 1 PR |

## 11. Recommended Status Correction

The platform is **not ready for a multi-app split today**.

- What is actually live and valuable now:
  - Intelligence feed inventory and feed supply
  - A partial Admin/CMS substrate
  - Public waitlist/onboarding acquisition shell
- What still blocks a split:
  - missing production schema for CRM/Sales/Marketing/Education/entitlements
  - prelaunch route collapse on public app surfaces
  - zero telemetry proof for personalization and admin audit trails
  - unresolved XSS and shell-security issues

Tracker correction in this audit:
- keep existing completed WOs as historical execution truth
- add a dedicated multi-app readiness queue inside `CURRENT_QUEUE_START/END`
- do not mark any hub split work `COMPLETE` until the new verify artifacts exist and the above checklist passes
