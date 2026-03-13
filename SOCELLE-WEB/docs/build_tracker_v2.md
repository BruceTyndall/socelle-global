# SOCELLE BUILD TRACKER V2 — CANONICAL EXECUTION LEDGER

Execution scope is **ONLY** the Work Orders (WOs) inside `CURRENT_QUEUE_START/END` in this file.  
All execution truth = this file **plus** `SOCELLE-WEB/docs/qa/verify_<WO_ID>_*.json` artifacts.

---

## CURRENT_QUEUE — Execution Ledger (Single Source of Truth)

<!-- CURRENT_QUEUE_START -->

| WO ID | Hub / Area | Priority (P0/P1/P2) | Status (OPEN / IN_PROGRESS / BLOCKED / READY_FOR_REVIEW / COMPLETE) | Blocker (short) | Proof (docs/qa/verify_*.json) | Owner Skill (Skill-Creator role) | Next Action (1 line) |
|-------|------------|---------------------|-----------------------------------------------------------------------|-----------------|-------------------------------|----------------------------------|----------------------|
| P0-1 | Public Site / Commerce Boundary | P0 | COMPLETE | — | `docs/qa/verify_P0-1_2026-03-09T22-00-00-000Z.json` | `dev-best-practice-checker` | None (COMPLETE; reference only). |
| P0-2 | Intelligence / Public Surface | P0 | COMPLETE | — | `docs/qa/verify_P0-2_2026-03-09T22-15-00-000Z.json` | `live-demo-detector` | None (COMPLETE; reference only). |
| P0-3 | Enrichment Hook | P0 | COMPLETE | — | `docs/qa/verify_P0-3_2026-03-09T22-20-00-000Z.json` | `dev-best-practice-checker` | None (COMPLETE; reference only). |
| P0-4 | Copy / Banned Terms | P0 | COMPLETE | — | `docs/qa/verify_P0-04_2026-03-09T22-30-00-000Z.json` | `banned-term-scanner` | None (COMPLETE; reference only). |
| P0-5 | Supabase Types | P0 | COMPLETE | — | `docs/qa/verify_P0-5_2026-03-09T22-45-00-000Z.json` | `database-types-generator` | None (COMPLETE; reference only). |
| P1-1 | Design Tokens — brand-* | P1 | COMPLETE | — | `docs/qa/verify_P1-1_2026-03-09T23-10-00-000Z.json` | `design-audit-suite` | None (COMPLETE; reference only). |
| P1-2 | Design Tokens — intel-* | P1 | COMPLETE | — | `docs/qa/verify_P1-2_2026-03-09T23-20-00-000Z.json` | `design-audit-suite` | None (COMPLETE; reference only). |
| P1-3 | Tailwind Token Cleanup | P1 | COMPLETE | — | `docs/qa/verify_P1-3_2026-03-09T23-25-00-000Z.json` | `token-drift-scanner` | None (COMPLETE; reference only). |
| P2-1 | Unit Test Fixes | P2 | COMPLETE | — | `docs/qa/verify_P2-1.json` | `test-runner-suite` | None (COMPLETE; reference only). |
| INTEL-POWER-01 | Intelligence Product Power | P1 | COMPLETE | — | `docs/qa/verify_INTEL-POWER-01_2026-03-11.json` | `intelligence-hub-api-contract` | None (COMPLETE; reference only). |
| INTEL-POWER-02 | Intelligence Product Power | P1 | COMPLETE | — | `docs/qa/verify_INTEL-POWER-02.json` | `intelligence-hub-api-contract` | None (COMPLETE; reference only). |
| INTEL-POWER-03 | Intelligence Product Power | P1 | COMPLETE | — | `docs/qa/verify_INTEL-POWER-03_2026-03-11.json` | `intelligence-hub-api-contract` | None (COMPLETE; reference only). |
| INTEL-POWER-04 | Intelligence Product Power | P1 | COMPLETE | — | `docs/qa/verify_INTEL-POWER-04.json` | `intelligence-hub-api-contract` | None (COMPLETE; reference only). |
| INTEL-POWER-05 | Intelligence Product Power | P1 | COMPLETE | — | `docs/qa/verify_INTEL-POWER-05.json` | `intelligence-hub-api-contract` | None (COMPLETE; reference only). |
| CRM-POWER-01 | CRM Product Power | P1 | READY_FOR_REVIEW | PR `feat/crm-power-01` | `docs/qa/verify_CRM-POWER-01_20...json` | `agent-crm` | Run review + verification skills, then decide MERGE. |
| CRM-POWER-02 | CRM Product Power | P1 | READY_FOR_REVIEW | PR `feat/crm-power-02` | `docs/qa/verify_CRM-POWER-02_20...json` | `agent-crm` | Run review + verification skills, then decide MERGE. |
| SALES-POWER-01 | Sales Product Power | P1 | READY_FOR_REVIEW | — | `docs/qa/verify_SALES-POWER-01_2026-03-14T05-00-00-000Z.json`, `docs/qa/verify_SALES-POWER-01_2026-03-14T05-30-00-000Z.json` | `agent-sales` |  |
| MKT-POWER-01 | Marketing Product Power | P1 | READY_FOR_REVIEW | — | `docs/qa/verify_MKT-POWER-01_2026-03-14T05-15-00-000Z.json` | `agent-marketing` |  |
| EDU-POWER-01 | Education Product Power | P1 | COMPLETE | — | `verify_EDU-POWER-01_2026-03-12T01-57-00Z` | `agent-education` | None (COMPLETE; reference only). |
| COMMERCE-POWER-01 | Commerce Product Power | P1 | OPEN | — | — | `agent-commerce` | Keep OPEN; execute only when Commerce phase is active. |
| ADMIN-POWER-01 | Admin Product Power | P1 | OPEN | — | — | `agent-admin` | Keep OPEN; execute only when Admin phase is active. |
| PWA-BUILD-UNBLOCK-01 | Infra / PWA | P0 | READY_FOR_REVIEW | — | `docs/qa/verify_PWA-BUILD-UNBLOCK-01_2026-03-12T12-00-00-000Z.json` | `build-gate` | Owner to certify DONE; unblocks CMS-POWER-01. |
| CMS-POWER-01 | CMS Product Power | P1 | READY_FOR_REVIEW | — | `docs/qa/verify_CMS-POWER-01_2026-03-13T06-43-00-000Z.json` | `agent-cms` | Owner to certify COMPLETE after reviewing AdminStoryDrafts + /intelligence/briefs. |
| SITE-POWER-01 | Public Site Product Power | P1 | OPEN | — | — | `agent-site` | Keep OPEN; execute only when Site phase is active. |
| MOBILE-POWER-01 | Mobile Product Power | P1 | OPEN | — | — | `agent-mobile` | Keep OPEN; execute only when Mobile phase is active. |
| DEBT-MONETIZATION-01 | Platform / Monetization Debt | P0 | COMPLETE | — | `docs/qa/verify_DEBT-MONETIZATION-01.json` | `billing-payments-suite` | None (COMPLETE; reference only). |
| ROUTE-CLEANUP-01 | Marketing / Routing | P0 | COMPLETE | — | `docs/qa/verify_ROUTE-CLEANUP-01.json` | `route-mapper` | None (COMPLETE; reference only). |
| CRM-CONSENT-01 | CRM | P1 | READY_FOR_REVIEW | PR `feat/crm-consent-01` | `docs/qa/verify_CRM-CONSENT-01.json` | `agent-crm` | Run review + verification skills, then decide MERGE. |
| EDU-CE-EXPIRY-01 | Education | P1 | OPEN | — | `docs/qa/verify_EDU-CE-EXPIRY-01.json` | `agent-education` | Implement per WO spec when Education phase is active. |
| COMMERCE-PROCURE-01 | Commerce | P1 | OPEN | — | `docs/qa/verify_COMMERCE-PROCURE-01.json` | `agent-commerce` | Implement per WO spec when Commerce phase is active. |
| INTEL-MONETIZATION-01 | Intelligence | P1 | READY_FOR_REVIEW | Depends on WO-TAXONOMY-03 | `docs/qa/verify_INTEL-MONETIZATION-01.json` | `agent-crm` | Run AGENT-17 dataset + monetization review, then finalize. |
| INTEL-MONETIZATION-02 | Intelligence | P1 | READY_FOR_REVIEW | Depends on WO-TAXONOMY-03 | `docs/qa/verify_INTEL-MONETIZATION-02.json` | `agent-crm` | Run AGENT-17 + channel audit, then finalize. |
| INTEL-HUB-FEED-UX-01 | Intelligence UX | P1 | BLOCKED | Skills not yet executed for re-verify | `docs/qa/verify_INTEL-HUB-FEED-UX-01_2026-03-14T03-00-00-000Z.json` | `agent-intelligence` | Launch Skill-Creator specialists and re-run required skills. |
| SITE-ONBOARD-01 | Public Site Onboarding | P1 | OPEN | — | `docs/qa/verify_SITE-ONBOARD-01.json` | `agent-site` | Design and implement onboarding per CONSOLIDATED_BUILD_PLAN. |
| MOBILE-PUSH-01 | Mobile Push | P2 | OPEN | — | `docs/qa/verify_MOBILE-PUSH-01.json` | `agent-mobile` | Plan mobile push implementation when Mobile phase is active. |
| SALES-AUTOFILL-01 | Sales Autofill | P2 | OPEN | — | `docs/qa/verify_SALES-AUTOFILL-01.json` | `agent-sales` | Implement Proposal autofill when Sales phase is active. |
| rss-feeds-bridge-01 | CMS / Feed Pipeline | P2 | OPEN | — | — | `agent-cms` | Bridge rss_sources ↔ data_feeds so story_drafts.feed_id can be populated; enables feed name display in AdminStoryDrafts. |
| MIGRATION-DRIFT-01 | Infra / Migrations | P2 | OPEN | — | — | `migration-validator` | Local file 20260313000041_story_drafts_suggested_products.sql missing from DB history; audit and reconcile local↔remote migration sequence. |

<!-- CURRENT_QUEUE_END -->

---

## READY_FOR_REVIEW STACK (Review-Only, Non-Executable)

These rows are **not** execution authority on their own. They exist to help reviewers see what is queued for review.

| WO ID | Hub / Area | Proof (docs/qa/verify_*.json) | Notes |
|------|------------|--------------------------------|-------|
| CRM-POWER-01 | CRM Product Power | `docs/qa/verify_CRM-POWER-01_20...json` | Review PR `feat/crm-power-01` and verification evidence. |
| CRM-POWER-02 | CRM Product Power | `docs/qa/verify_CRM-POWER-02_20...json` | Review PR `feat/crm-power-02` and verification evidence. |
| CRM-CONSENT-01 | CRM | `docs/qa/verify_CRM-CONSENT-01.json` | Consent audit modal; ready once tests+skills pass. |
| INTEL-MONETIZATION-01 | Intelligence | `docs/qa/verify_INTEL-MONETIZATION-01.json` | Intelligence monetization slice; depends on taxonomy WOs. |
| INTEL-MONETIZATION-02 | Intelligence | `docs/qa/verify_INTEL-MONETIZATION-02.json` | Channels rail; depends on taxonomy WOs. |
| CMS-POWER-01 | CMS Product Power | `docs/qa/verify_CMS-POWER-01_2026-03-13T06-43-00-000Z.json` | Editorial rail + story_drafts pipeline. 4 migrations applied. 40 pending drafts in DB. Review AdminStoryDrafts (/admin/cms/story-drafts) and IntelligenceBriefs (/intelligence/briefs). |

---

## ARCHIVE / HISTORY (Non-Executable)

- Historical WOs, legacy queues, and full audit notes remain in `SOCELLE-WEB/docs/build_tracker.md` (ARCHIVED — REFERENCE ONLY).  
- For older WOs, consult that file plus their `docs/qa/verify_*.json` artifacts for full context.  
- **Do not** infer new execution status from archived tables; this v2 file is the only execution ledger.

