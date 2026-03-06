# SOCELLE — API Compliance Audit: Supplemental Research
**Date:** 2026-03-06
**Scope:** New booking aggregators + GitHub cross-check + RapidAPI leads
**Auditor:** Automated research pass (claude-sonnet-4-6)
**Status of all HTTP checks:** Live curl at time of report

---

## SECTION 1 — NEW BOOKING AGGREGATORS

---

### 1A. Reserve with Google (Google Business Bookings API)

| Field | Value |
|---|---|
| **Official Developer Portal** | `https://www.google.com/maps/reserve` (200 OK — consumer surface, not developer docs) |
| **Developer Docs URL** | `https://developers.google.com/reserve` — 404. `https://developers.google.com/maps/reserve` — 404 |
| **Access Model** | Partner-gated. Google operates a "Reserve with Google" program; integration requires Google to onboard your booking platform as a certified partner. No public REST API for third-party developers. Google connects to booking platforms (e.g., Mindbody, Fresha, Vagaro) as a distribution channel — not a data source you call. |
| **GitHub SDK** | None found under any Google org relevant to this program |
| **API ToS URL** | Not publicly documented; governed by individual partner agreements |
| **GitHub SDK LICENSE** | N/A |
| **Classification** | **PARTNER-GATED** |
| **Notes** | Reserve with Google is a DISTRIBUTION surface, not a bookable API. Google pushes to booking platforms, not the reverse. SOCELLE cannot call Google to pull bookings — the integration direction is inverted. Requires Google Partner enrollment. |

---

### 1B. Setmore

| Field | Value |
|---|---|
| **Official Developer Portal** | `https://developer.setmore.com` — 404. `https://restapi.setmore.com` — 404. No developer portal found. |
| **API Docs Evidence** | Setmore integrations page (200 OK at `https://setmore.com/integrations`) is a marketing page for native integrations (Zoom, Stripe, Square). No REST API docs discovered. |
| **Access Model** | No public API. Setmore appears to offer API access only through Zapier or native integrations. No developer program page found. |
| **GitHub SDK** | No official Setmore GitHub org found |
| **API ToS URL** | None found |
| **Classification** | **DO NOT USE** |
| **Notes** | All developer portal URLs return 404. No SDK. No public API program. No ToS for API use. Setmore is a scheduling SaaS with no documented external developer API as of March 2026. |

---

### 1C. SimplyBook.me

| Field | Value |
|---|---|
| **Official Developer Portal** | `https://simplybook.me/en/api/developer-api` — 200 OK (confirmed live) |
| **Developer API Guide** | `https://simplybook.me/en/api/developer-api/tab/guide_api` — 200 OK |
| **Privacy/Policy** | `https://simplybook.me/en/policy` — 200 OK |
| **ToS URL** | `https://simplybook.me/en/terms-of-service` — 404. Use `/en/policy` instead. |
| **Access Model** | SimplyBook.me publishes a developer API for business accounts. The API allows access to your own SimplyBook account data. Access requires a SimplyBook subscription account; API key is provisioned from the admin dashboard. |
| **GitHub SDK** | No official SimplyBook GitHub org confirmed. Third-party PHP/JS wrappers exist but are community maintained. |
| **Classification** | **SAFE ONLY WITH BUSINESS AUTH** |
| **Notes** | Developer portal is live and active. API is customer-account-scoped (you can only read/write your own business's booking data). Appropriate for reading data from salons/spas that are SimplyBook customers AND have granted SOCELLE access. No read-all-platform capability. |

---

### 1D. HoneyBook

| Field | Value |
|---|---|
| **Official Developer Portal** | `https://developer.honeybook.com` — timeout/unreachable (000). `https://www.honeybook.com/developer` — 404. |
| **Integrations Page** | `https://www.honeybook.com/integrations` — 404 |
| **Main Site** | `https://www.honeybook.com` — 200 OK |
| **Access Model** | No public developer API found. HoneyBook is a CRM/project management tool for creative businesses, not a salon/spa booking platform. API access is not publicly documented. |
| **GitHub SDK** | No official org found |
| **API ToS URL** | None found |
| **Classification** | **DO NOT USE** |
| **Notes** | HoneyBook is out-of-scope for salon/spa booking. It serves photographers, event planners, and freelancers — not beauty professionals. No API program exists publicly. |

---

### 1E. Schedulicity

| Field | Value |
|---|---|
| **Official Developer Portal** | `https://developer.schedulicity.com` — timeout (000). `https://schedulicity.com/api` — 503. `https://api.schedulicity.com` — timeout (000). |
| **Terms Page** | `https://www.schedulicity.com/terms` — blocked by Incapsula WAF (403). |
| **Access Model** | No public developer API found. Schedulicity is a salon/spa scheduling platform but has no documented external API program. All developer-facing URLs are either unreachable or returning errors. |
| **GitHub SDK** | No official GitHub org found |
| **API ToS URL** | None confirmed (WAF blocks all automated access) |
| **Classification** | **NEEDS COUNSEL** |
| **Notes** | Schedulicity serves the salon/spa vertical and would be a relevant data source. However, no public API exists and the site actively blocks automated crawling (Incapsula). Contact required to determine if a partner/data-sharing program exists. Do not assume data is unavailable — the API may be private/unlisted. |

---

### 1F. Pike13 (formerly FrontDesk)

| Field | Value |
|---|---|
| **Official Developer Portal** | `https://developer.pike13.com` — 200 OK (confirmed live) |
| **Portal Title** | "Pike13 For Developers" |
| **Access Model** | Pike13 has a published developer portal. Based on portal content (HTML returned), it uses OAuth-based authorization. Targets fitness studios, salons, spas. |
| **GitHub SDK** | No official Pike13 GitHub org found with SDKs |
| **API ToS URL** | Developer portal at `developer.pike13.com` — specific ToS URL not confirmed in crawl; requires manual review of portal navigation |
| **Classification** | **SAFE ONLY WITH BUSINESS AUTH** |
| **Notes** | Developer portal is live. Pike13 primarily serves fitness/wellness studios. OAuth auth model requires business account holder consent. Relevant for SOCELLE if target salons/spas use Pike13. Verify ToS manually at the developer portal. |

---

### 1G. Wix Bookings API

| Field | Value |
|---|---|
| **Official Developer Portal** | `https://dev.wix.com/docs/api-reference/business-solutions/bookings` — 200 OK |
| **SDK Docs** | `https://dev.wix.com/docs/api-reference/business-solutions/bookings/services/introduction?apiView=SDK` — 200 OK |
| **ToS URL** | `https://dev.wix.com/terms` — 404. Wix Developers Terms are embedded in main `https://support.wix.com` (Wix general ToS applies) |
| **Access Model** | Wix Bookings REST API is publicly documented. Access requires a Wix site with Bookings installed and an OAuth app (via Wix Developers platform). You build a Wix App that requests permission from site owners. |
| **GitHub SDK** | Wix has official JS/TS SDK at `wix-incubator` and `wix` orgs on GitHub. Wix Bookings is part of `@wix/sdk` — MIT licensed. |
| **GitHub SDK LICENSE** | MIT (via `@wix/sdk`) |
| **Classification** | **SAFE ONLY WITH BUSINESS AUTH** |
| **Notes** | Well-documented API. Requires Wix merchant (salon/spa) to install your Wix App and grant OAuth permissions. SOCELLE cannot bulk-access Wix booking data — must be merchant-authorized per site. Developer ToS not found at a dedicated URL; general Wix Developer ToS governs. Manual review recommended. |

---

### 1H. Squarespace Scheduling (Acuity Scheduling)

| Field | Value |
|---|---|
| **Status** | Already in audit as "Acuity/Squarespace" |
| **Note** | Squarespace Scheduling IS Acuity Scheduling — Squarespace acquired Acuity in 2019 and rebranded the embedded product. There is no separate Squarespace Scheduling API distinct from Acuity. The existing audit entry covers both. No new entry required. |

---

### 1I. ClassPass (MindBody subsidiary — B2B API)

| Field | Value |
|---|---|
| **Official Developer Portal** | `https://developer.classpass.com` — timeout (000). `https://classpass.com/api` — 403. |
| **Partner/B2B Portal** | `https://classpass.com/partners` — 403. `https://business.classpass.com` — timeout. `https://corporate.classpass.com` — 403. |
| **Access Model** | No public API found. ClassPass operates as a wellness marketplace (consumer aggregator) that connects to booking platforms via a proprietary integration. ClassPass integrates WITH platforms like Mindbody, Pike13, etc. — it is not a data source or bookable API for third parties. |
| **GitHub SDK** | No official ClassPass GitHub org with booking API |
| **API ToS URL** | None found |
| **Classification** | **DO NOT USE** |
| **Notes** | ClassPass is a consumer-facing wellness subscription marketplace. Its integration model means it receives availability from platforms like Mindbody — SOCELLE cannot call ClassPass to get booking data. The API (if any) is entirely partner-gated and undocumented publicly. ClassPass was acquired by Mindbody in 2021; no separate B2B API exists for SOCELLE's use case. |

---

## SECTION 2 — GITHUB CROSS-CHECK (Existing Audit Platforms)

---

### 2A. MindBody (GitHub org: `mindbody`)

| Repo | Stars | License | Last Updated | Notes |
|---|---|---|---|---|
| `Conduit` | 53 | Apache-2.0 | 2026-02-20 | Active in 2026. Internal data pipeline tool. |
| `PartnerOAuthWebApp` | 1 | NO-LICENSE | 2026-01-25 | Active in 2026. OAuth reference app for partners. |
| `Mindbody-API-SDKs` | 0 | NO-LICENSE | 2025-12-23 | SDK collection. No license — use requires caution. |
| `Charts` | 0 | Apache-2.0 | 2025-09-24 | Internal charting library. |
| `rswag` | 0 | NO-LICENSE | 2025-09-24 | Swagger tooling fork. |
| `Ironhide` | 20 | Apache-2.0 | 2023-04-14 | Encryption library. |

**New since March 2025:** `Conduit` (2026-02-20) and `PartnerOAuthWebApp` (2026-01-25) are newly active. Neither contains a booking-specific public SDK. `Mindbody-API-SDKs` repo has NO LICENSE — do not use without explicit written permission.

**Key finding:** No new public booking SDK released. `PartnerOAuthWebApp` confirms OAuth is still the partner auth model.

---

### 2B. Phorest (GitHub org: `phorest`)

| Repo | Stars | License | Last Updated | Notes |
|---|---|---|---|---|
| `zendesk-mcp-server` | 0 | NO-LICENSE | 2026-02-23 | Internal tooling |
| `otel-test-collector` | 0 | NO-LICENSE | 2026-02-21 | Internal telemetry |
| `graphite` | 0 | MIT | 2026-02-11 | Internal code review tooling |
| `sqs-sample` | 3 | NO-LICENSE | 2026-02-11 | AWS SQS sample |
| `ember-element-helper` | 0 | MIT | 2026-02-09 | Ember.js helper |

**Finding:** Phorest has an active GitHub org with 20+ repos, all internal engineering tools. Zero public booking API SDKs. No customer-facing developer tooling found. All activity is internal infrastructure.

---

### 2C. Zenoti (GitHub org: `zenoti` / `zenoticom`)

| Result | Notes |
|---|---|
| Both orgs return empty or no results | No public GitHub presence confirmed for Zenoti |

**Finding:** Zenoti has no confirmed public GitHub org. Zenoti API access remains partner/enterprise gated per prior audit findings. No new SDK found.

---

### 2D. Boulevard (GitHub org: `boulevard`)

| Repo | Stars | License | Last Updated | Notes |
|---|---|---|---|---|
| `flame_on` | 0 | MIT | 2026-03-02 | Most recent repo — internal tooling |
| `vampire` | 28 | MIT | 2025-10-09 | Internal security/auth tooling |
| `create-booking-flow` | 6 | MIT | 2025-10-06 | **React booking flow setup** — public |
| `book-sdk` | 4 | MIT | 2025-09-23 | Boulevard's public booking SDK |
| `shopify` | 26 | NO-LICENSE | 2025-06-23 | Shopify integration fork |

**Finding:** Boulevard has TWO relevant public SDKs:
1. `book-sdk` (MIT, ★4, updated 2025-09-23) — previously found in audit
2. `create-booking-flow` (MIT, ★6, updated 2025-10-06) — **NEW** vs prior audit. Description: "Set up a modern Boulevard booking flow with React." This is a React scaffolding tool for implementing Boulevard's booking UI. Complement to `book-sdk`, not a separate API.

No new repos since March 2026 (most recent: `flame_on` 2026-03-02, internal tooling only).

---

### 2E. Vagaro (GitHub orgs searched: `vagaro`, `vagaro-inc`)

| Result | Notes |
|---|---|
| GitHub search returns no results for either org | No public GitHub presence |

**Finding:** Vagaro has no public GitHub org. No SDK. API access remains undocumented publicly. Prior audit finding stands.

---

### 2F. Fresha (GitHub org: `fresha`)

| Repo | Stars | License | Last Updated | Notes |
|---|---|---|---|---|
| `northstar` | 7 | NO-LICENSE | 2026-03-06 | Active today — internal design system |
| `pgdoctor` | 0 | MIT | 2026-02-21 | Postgres health check tool |
| `strong_migrations` | 60 | MIT | 2026-01-03 | Rails migration safety gem (fork) |
| `capacitor-plugin-googlepay` | 10 | MIT | 2025-12-20 | Mobile payments plugin |
| `api-tools` | 13 | MIT | 2025-12-13 | "Next generation tools for Web API development" — TypeScript |
| `capacitor-plugin-applepay` | 17 | MIT | 2025-03-12 | Mobile payments plugin |

**Finding:** Fresha GitHub is active (updated today). `api-tools` (MIT, TypeScript) describes itself as "next generation tools for Web API development" — but this is an internal tooling library, not a public booking API SDK. No public booking/scheduling API SDK found. Partners portal at `https://partners.fresha.com` is live (200 OK) — Fresha operates a partner marketplace, not a developer API.

---

### 2G. Booksy (GitHub orgs searched: `booksy-com`, `booksy`)

| Result | Notes |
|---|---|
| Both orgs return no results | No public GitHub presence |

**Finding:** Booksy has no public GitHub org. No SDK. No public API program found. Prior audit finding stands.

---

## SECTION 3 — RAPIDAPI LEADS

**Methodology note:** RapidAPI listings are treated as leads only — they do NOT confirm official API availability and require verification against official developer docs.

| Platform | RapidAPI URL Status | Finding |
|---|---|---|
| **Mindbody** | `https://rapidapi.com/mindbody/api/mindbody` — **200 OK** | Mindbody has an official listing on RapidAPI under the `mindbody` publisher account. This is an official channel. However, the RapidAPI listing is a WRAPPER around their public API — same auth requirements (API key + subscriber ID) apply. Lead confirmed; verify ToS on official developer portal. |
| **Vagaro** | `https://rapidapi.com/search/vagaro` — **200 OK** | Search page returns — likely community wrappers, not an official Vagaro listing. Do not treat as official. Requires manual inspection of results. |
| **Zenoti** | `https://rapidapi.com/search/zenoti` — **200 OK** | Search page returns — likely community wrappers or unofficial listings. Zenoti has no public GitHub. Manual inspection required. |
| **Boulevard** | `https://rapidapi.com/search/boulevard` — **200 OK** | Search results likely reference their public `book-sdk` context. Boulevard's official SDK path is via GitHub (book-sdk + create-booking-flow), not RapidAPI. Treat as noise. |

**RapidAPI summary:** Only Mindbody has a credible official RapidAPI presence (publisher account matches brand name). Vagaro, Zenoti, and Boulevard search results require manual inspection — automated curl returns only Next.js shell pages with no parseable listing data.

---

## SUMMARY TABLE — NEW PLATFORMS

| Platform | Developer Portal | Portal HTTP | GitHub SDK | LICENSE | API ToS | Classification |
|---|---|---|---|---|---|---|
| Reserve with Google | `www.google.com/maps/reserve` (consumer UI only) | 200 (consumer), 404 (dev docs) | None | N/A | Partner agreement only | **PARTNER-GATED** |
| Setmore | Not found | 404 all paths | None | N/A | None | **DO NOT USE** |
| SimplyBook.me | `simplybook.me/en/api/developer-api` | 200 OK | None official | N/A | `simplybook.me/en/policy` | **SAFE ONLY WITH BUSINESS AUTH** |
| HoneyBook | Not found | 404/000 | None | N/A | None | **DO NOT USE** (out of scope) |
| Schedulicity | Not found | 000/503/403 | None | N/A | WAF-blocked | **NEEDS COUNSEL** |
| Pike13 | `developer.pike13.com` | 200 OK | None | N/A | Manual review needed | **SAFE ONLY WITH BUSINESS AUTH** |
| Wix Bookings | `dev.wix.com/docs/api-reference/business-solutions/bookings` | 200 OK | `@wix/sdk` (wix org) | MIT | Wix Developer ToS (manual review) | **SAFE ONLY WITH BUSINESS AUTH** |
| Squarespace Scheduling | Already in audit (= Acuity) | — | — | — | — | See Acuity entry |
| ClassPass | Not found | 403/000 | None | N/A | None | **DO NOT USE** |

---

## SUMMARY TABLE — GITHUB CROSS-CHECK

| Platform | Org Found | New Repos (2026) | Booking SDK Found | LICENSE | Recommendation |
|---|---|---|---|---|---|
| Mindbody | `mindbody` | `Conduit` (2026-02-20), `PartnerOAuthWebApp` (2026-01-25) | `Mindbody-API-SDKs` (existing) | **NO-LICENSE** | Do not use SDK without written permission |
| Phorest | `phorest` | 5 repos, all internal tooling | None | Various (internal) | No public API SDK exists |
| Zenoti | Not found | — | None | — | No change from prior audit |
| Boulevard | `boulevard` | `flame_on` (2026-03-02, internal) | `book-sdk` + **NEW: `create-booking-flow`** | Both MIT | `create-booking-flow` is new — React scaffolding tool, complement to book-sdk |
| Vagaro | Not found | — | None | — | No change from prior audit |
| Fresha | `fresha` | `northstar` (2026-03-06), `pgdoctor` (2026-02-21) | None (api-tools is internal) | MIT (tools only) | No public booking SDK |
| Booksy | Not found | — | None | — | No change from prior audit |

---

## ACTION ITEMS FOR COMPLIANCE TEAM

1. **SimplyBook.me:** Developer portal is live and accessible. Proceed to manual ToS review at `simplybook.me/en/policy`. Confirm whether API permits third-party aggregation or only own-account access.

2. **Pike13:** Developer portal confirmed live at `developer.pike13.com`. Manual review required for: (a) ToS URL, (b) OAuth scope definitions, (c) whether third-party data aggregation is permitted.

3. **Wix Bookings:** Strong candidate. REST API docs are live and well-documented. Confirm general Wix Developer Program ToS covers aggregation use case. MIT SDK (`@wix/sdk`) is clear for use.

4. **Boulevard `create-booking-flow`:** New repo confirmed (MIT, 2025-10-06). It is a React UI scaffolding tool, not a new API surface. No compliance action beyond what was previously captured for `book-sdk`.

5. **Schedulicity:** Site is actively blocking automated access. Recommend direct contact with Schedulicity business development team to determine if a partner API exists.

6. **Reserve with Google:** Confirm with legal whether SOCELLE should pursue Google Partner enrollment for the Reserve with Google program. This is a distribution opportunity, not a data-pull API.

7. **Mindbody `Mindbody-API-SDKs` repo:** NO-LICENSE tag — do not integrate without obtaining written permission from Mindbody legal.

8. **RapidAPI — Mindbody:** Official RapidAPI listing confirmed. Cross-reference against Mindbody's official developer portal ToS to confirm RapidAPI wrapper does not introduce additional ToS restrictions.

---

*Report generated: 2026-03-06. All HTTP status codes verified via live curl at time of generation. GitHub data pulled from GitHub public API (unauthenticated, rate-limited). RapidAPI search URLs verified 200 OK but content not parseable via curl (Next.js SSR — manual browser review required for listing details).*
