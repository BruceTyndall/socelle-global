# SOCELLE Sheet Patch (2026-03-09)

Source sheet export used: `/tmp/socelle_audit_sheet.csv` (212 data rows + header).  
Apply these updates to the Google Sheet rows.

| Row ID | Page | Finding | Severity | Status | Evidence link | Proposed WO |
|---:|---|---|---|---|---|---|
| 24 | `/education` | Dead end: no meaningful outbound action in audited run. | P1 | OPEN-VERIFIED | Screenshot `public_006_education.png` (`docs/qa/e2e-flow-audit_20260309_131130/screens/public_006_education.png`), dead_end record in `...131130.json` | WO-AUDIT-P1-07 |
| 22 | `/jobs` | Route rendered skeleton-only in audited snapshot; detail route not exercised with slug in run. | P1 | OPEN-VERIFIED | `public_009_jobs.png`, `SOCELLE-WEB/src/pages/public/Jobs.tsx` | WO-AUDIT-P1-07 |
| 67 | `/cart` | Revenue dead end (no meaningful next action). | P0 | OPEN-VERIFIED | `public_033_cart.png`, dead_end in `...131130.json` | WO-AUDIT-P0-02 |
| 68 | `/checkout` | Revenue dead end (no meaningful next action). | P0 | OPEN-VERIFIED | `public_036_checkout.png`, dead_end in `...131130.json` | WO-AUDIT-P0-02 |
| 69 | `/account/orders` | Spinner-only page in audited run; no outbound actions. | P1 | OPEN-VERIFIED | `public_026_account__orders.png`, dead_end in `...131130.json` | WO-AUDIT-P1-07 |
| 71 | `/account/wishlist` | Dead end/no progression path in audited run. | P1 | OPEN-VERIFIED | `public_028_account__wishlist.png`, dead_end in `...131130.json` | WO-AUDIT-P1-07 |
| 90 | `/portal/dashboard` | Authenticated pro flow not verifiable (missing test creds); screenshot shows login form instead of dashboard content. | P1 | BLOCKED-BY-AUTH | `professional_001_portal__dashboard.png`, `blocked_by_auth` in e2e JSON | WO-AUDIT-P0-06 |
| 91 | `/portal/intelligence` | Authenticated pro flow blocked by missing credentials. | P1 | BLOCKED-BY-AUTH | `professional_002_portal__intelligence.png`, `blocked_by_auth` | WO-AUDIT-P0-06 |
| 92 | `/portal/advisor` | Authenticated pro flow blocked; live AI path not validated. | P1 | BLOCKED-BY-AUTH | `professional_019_portal__advisor.png`, `blocked_by_auth` | WO-AUDIT-P0-06 |
| 93 | `/portal/plans` | Authenticated pro flow blocked by missing credentials. | P1 | BLOCKED-BY-AUTH | `professional_003_portal__plans.png`, `blocked_by_auth` | WO-AUDIT-P0-06 |
| 98 | `/portal/orders` | Authenticated pro order flow blocked by missing credentials. | P1 | BLOCKED-BY-AUTH | `professional_004_portal__orders.png`, `blocked_by_auth` | WO-AUDIT-P0-06 |
| 133 | `/brand/dashboard` | Authenticated brand flow blocked by missing credentials; login form captured. | P1 | BLOCKED-BY-AUTH | `brand_001_brand__dashboard.png`, `blocked_by_auth` | WO-AUDIT-P0-06 |
| 134 | `/brand/intelligence` | Authenticated brand intelligence blocked by missing credentials. | P1 | BLOCKED-BY-AUTH | `brand_002_brand__intelligence.png`, `blocked_by_auth` | WO-AUDIT-P0-06 |
| 136 | `/brand/products` | Authenticated brand product flow blocked by missing credentials. | P1 | BLOCKED-BY-AUTH | `brand_003_brand__products.png`, `blocked_by_auth` | WO-AUDIT-P0-06 |
| 151 | `/admin/dashboard` | Loading-only shell in audited run (no usable state). | P1 | OPEN-VERIFIED | `admin_001_admin__dashboard.png` | WO-AUDIT-P0-05 |
| 159 | `/admin/market-signals` | Dead end: no meaningful outbound actions in run. | P1 | OPEN-VERIFIED | dead_end entry + `admin_004_admin__market-signals.png` | WO-AUDIT-P0-05 |
| 160 | `/admin/intelligence` | Dead end: no meaningful outbound actions in run. | P1 | OPEN-VERIFIED | dead_end entry + `admin_005_admin__intelligence.png` | WO-AUDIT-P0-05 |
| 169 | `/admin/crm` | Dead end: no meaningful outbound actions in run. | P1 | OPEN-VERIFIED | dead_end entry + `admin_006_admin__crm.png` | WO-AUDIT-P0-05 |
| 177 | `/admin/feeds` | Loading/dead-end in audited run despite live code path. | P1 | OPEN-VERIFIED | `admin_009_admin__feeds.png`, dead_end entry; code `AdminFeedsHub.tsx` | WO-AUDIT-P0-05 |
| 180 | `/admin/shop` | Dead end: no meaningful outbound actions in run. | P1 | OPEN-VERIFIED | dead_end entry + `admin_014_admin__shop.png` | WO-AUDIT-P0-05 |
| 187 | `/admin/subscriptions` | Dead end in run; row is currently DEMO but is operationally critical for billing controls. | P1 | OPEN-VERIFIED | dead_end entry + `admin_015_admin__subscriptions.png`; code `AdminSubscriptionPlans.tsx` DEMO badge lines 195-197 | WO-AUDIT-P0-05 |
| 148 | `/admin/login` | User can be signed in but non-admin; trap state should link to remediation playbook. | P2 | OPEN-VERIFIED | `public_025_admin__login.png` debug panel text | WO-AUDIT-P1-07 |
| 162 | `/admin/api` | API registry test in hub is placeholder (`Phase 6 will wire live test`), reducing trust in “live” status. | P1 | OPEN-VERIFIED | `SOCELLE-WEB/src/pages/admin/AdminApiControlHub.tsx:139-153` | WO-AUDIT-P1-03 |

### New rows to add (not represented in current sheet)

| Row ID | Page | Finding | Severity | Status | Evidence link | Proposed WO |
|---|---|---|---|---|---|---|
| NEW-SYS-01 | `system/entitlements` | Runtime 404 on `account_module_access` breaks module gating consistency. Migration creating table is dated `2026-03-10`, after audit date (`2026-03-09`). | P0 | OPEN-VERIFIED | e2e `http_error` 404 in `...131130.json`; `ModuleAccessContext.tsx:57`; migration `20260310100001_entitlements_chain_fix.sql:50` | WO-AUDIT-P0-01 |
| NEW-SYS-02 | `system/feed-orchestrator` | Endpoint is documented admin-only but has no role verification in handler. | P0 | OPEN-VERIFIED | `feed-orchestrator/index.ts:408-427`; compare `test-api-connection/index.ts:53-97` | WO-AUDIT-P0-04 |
| NEW-SYS-03 | `system/credits` | Frontend reads `credit_ledger`, migration defines `ai_credit_ledger`; live credit accounting can silently drift. | P1 | OPEN-VERIFIED | `useCreditBalance.ts:55-57`; migration `20260228000001...:43` | WO-AUDIT-P1-01 |
| NEW-SYS-04 | `system/ai-response-contract` | AI response lacks citations/provenance fields; trust and compliance friction. | P1 | OPEN-VERIFIED | `ai-orchestrator/index.ts:622-632` | WO-AUDIT-P1-02 |

