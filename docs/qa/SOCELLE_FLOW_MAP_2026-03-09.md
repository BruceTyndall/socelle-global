# SOCELLE FLOW MAP — 2026-03-09

## Scope and Evidence
- Crawl artifact: `docs/qa/e2e-flow-audit_20260309_105413.json`.
- Screens: `docs/qa/e2e-flow-audit_20260309_105413/screens/`.
- Logs: `docs/qa/e2e-flow-audit_20260309_105413/logs/`.
- Route/gate baseline: `docs/qa/SOCELLE_ROUTE_MAP_20260309.json`.

## Route Coverage by User Type
| User Type | Routes Audited | Auth Result | Primary Failure Mode | Evidence |
|---|---:|---|---|---|
| Public (logged out) | 40 | Completed | High backend error noise + dead ends | `e2e-flow-audit_20260309_105413.json` (`summary`, `dead_ends`) |
| Professional (logged in target) | 28 | Blocked (`missing_credentials`) | Redirect-to-login trap across protected routes | same JSON (`auth_results.professional`, `top_broken_flows`) |
| Brand (logged in target) | 22 | Blocked (`missing_credentials`) | Structural-only route validation | same JSON (`auth_results.brand`) |
| Admin (logged in target) | 24 | Blocked (`missing_credentials`) | Structural-only route validation | same JSON (`auth_results.admin`) |

## Public Journey Map (First 5 Minutes)
| Step | User Goal | Current Behavior | Friction | Evidence |
|---|---|---|---|---|
| 1 | Land and understand value | `/` loads but fires repeated API failures (`data_feeds`, `stories`, `brands`) | Trust erosion before value moment | `logs/public.log:7`, `:9`, `:15` |
| 2 | Explore intelligence | `/intelligence` renders but backend dependencies fail repeatedly | “Premium data” perception weakened | `logs/public.log:138`, `:140`, `:158` |
| 3 | Browse brands/jobs/events | Pages open but same dependency failures recur | Perceived instability across catalog surfaces | `logs/public.log:209`, `:257`, `:279` |
| 4 | Move toward conversion | `/request-access` is reachable, but commerce/course routes have dead ends | Next action unclear in high-intent moments | dead-end screenshots `public_026`, `public_036`, `public_039` |
| 5 | Continue learning/purchase | `/education`, `/courses`, `/checkout` detected as no-next-action states | Activation drop-off risk | `dead_ends` list in flow JSON |

### Public Activation Moment
- Intended “wow moment”: intelligence insight + clear next CTA into access or plan.
- Missing pieces:
  - stable signal/brand/story data contract;
  - frictionless conversion CTA from intelligence cards;
  - non-dead-end education and checkout flows.
- Evidence: `/intelligence` route + `public.log` query failures + dead-end screenshots.

## Professional Journey Map (Target Logged-In)
| Step | User Goal | Current Structural Behavior | Gap | Evidence |
|---|---|---|---|---|
| 1 | Sign in at `/portal/login` | Login page reachable | credentials absent in audit runtime | `auth_results.professional` |
| 2 | Open dashboard/intelligence | `/portal/dashboard`, `/portal/intelligence` redirect to `/portal/login` | cannot verify post-login utility | `top_broken_flows` entries |
| 3 | Use CRM/Booking | `/portal/crm`, `/portal/booking` redirect to login | structural gate only, no value validation | same JSON |
| 4 | Use Sales/Marketing | `/portal/sales`, `/portal/marketing` redirect to login | cannot confirm conversion loops | same JSON |
| 5 | Reach studio/credits/affiliates | all protected flows redirect | activation path blocked in test environment | same JSON |

### Professional Activation Moment
- Intended “wow moment”: dashboard KPI insight -> action dispatch to CRM/Booking/Sales.
- Missing pieces:
  - test credential pipeline for deterministic audits;
  - authenticated screenshot+state assertions;
  - flow continuity when user lacks module entitlements (clear upgrade path messaging).
- Evidence: `blocked_by_auth` + `gate_counts.redirect_to_login=53`.

## Brand Journey Map (Target Logged-In)
| Step | User Goal | Current Structural Behavior | Gap | Evidence |
|---|---|---|---|---|
| 1 | Sign in at `/brand/login` | Route reachable | audit blocked by missing creds | `auth_results.brand` |
| 2 | Open brand dashboard/intelligence | protected route checks in place | post-login quality not verified | `App.tsx` brand route tree + flow JSON |
| 3 | Manage products/orders/campaigns | route reachability confirmed structurally | CRUD/export/state quality unknown in authenticated context | brand screenshots + blocked auth |
| 4 | Run CRM leads/pipeline | structural route map exists | activation flow not validated | routes `/brand/crm/*` in `SOCELLE_ROUTE_MAP_20260309.json` |
| 5 | Review notifications and automation | routes exist | no authenticated run assertions | same |

### Brand Activation Moment
- Intended “wow moment”: brand sees lead + order + campaign insights in one session.
- Missing pieces:
  - authenticated runtime verification;
  - shell cleanup for brand intelligence pricing/advisor surfaces;
  - linked CTA from intelligence to campaign/automation builders.
- Evidence: shell files `BrandAIAdvisor.tsx`, `IntelligencePricing.tsx` in `shell_detector_report.json`.

## Admin Journey Map (Target Logged-In)
| Step | User Goal | Current Structural Behavior | Gap | Evidence |
|---|---|---|---|---|
| 1 | Sign in at `/admin/login` | Route reachable | credentials missing in run | `auth_results.admin` |
| 2 | Open admin dashboard and hubs | major admin routes crawled structurally | no post-login outcome validation | admin screenshots in audit folder |
| 3 | Use CMS/shop/subscription controls | route surfaces exist | multiple CMS pages are shell-classified | `shell_detector_report.json` (`CmsDashboard.tsx`, etc.) |
| 4 | Monitor platform health | shell/inventory views exist | telemetry quality/alerting not validated | `/admin/shell-detection`, `/admin/inventory-report` |
| 5 | Operate safely at scale | kill-switch exists | centralized rate limiting missing | `supabase/functions/_shared/edgeControl.ts` |

### Admin Activation Moment
- Intended “wow moment”: single-pane platform control (health + content + commerce + policy).
- Missing pieces:
  - live reliability KPIs in dashboard;
  - completion of CMS/authoring shells;
  - incident automation and abuse controls.
- Evidence: shell summary + edge function middleware.

## Blocked-by-Auth List (Exact Unblock Requirements)
| User Type | Required Inputs | Why Required | Evidence |
|---|---|---|---|
| Professional | `E2E_BUSINESS_EMAIL`, `E2E_BUSINESS_PASSWORD` | Required to validate post-login business routes | `e2e-flow-audit_20260309_105413.json` (`blocked_by_auth[0]`) |
| Brand | `E2E_BRAND_EMAIL`, `E2E_BRAND_PASSWORD` | Required to validate brand dashboard/CRM/product flows | same (`blocked_by_auth[1]`) |
| Admin | `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD` | Required to validate admin governance and CMS operations | same (`blocked_by_auth[2]`) |

## Confusing Loops
- None were flagged as explicit URL oscillation loops (`confusing_loops: 0`), but repeated login redirects on protected routes function as practical loop behavior when credentials are missing.
- Evidence: `docs/qa/e2e-flow-audit_20260309_105413.json` (`confusing_loops`, `top_broken_flows`).

## First-Session Friction Summary
| Friction Point | Observed In | Impact | Evidence |
|---|---|---|---|
| Failed core data queries | Public home/intelligence/brands | weakens confidence in platform data quality | `logs/public.log` failures on `brands`, `stories`, `data_feeds` |
| Dead-end surfaces | Education + Commerce routes | interrupts activation and checkout intent | dead-end screenshots and JSON |
| Auth test coverage blocked | Professional/Brand/Admin | leaves high-value workflows unverified | `blocked_by_auth` |
| High network error noise | all sessions | masks product issues and slows debugging | `summary.errors=797` |
