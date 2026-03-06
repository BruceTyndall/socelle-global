# SOCELLE GLOBAL — Hospitality Platform API Compliance Research

**Generated:** 2026-03-06
**Scope:** C1 PMS Systems, C2 Spa Systems, C3 Guest Experience Platforms
**Method:** Web search only — evidence-based, no scraping
**Status of all data surfaces:** DEMO (research findings, not live DB connections)

---

## IMPORTANT UPFRONT CAVEATS

1. This is not legal advice. Assessments are evidence-based classifications only.
2. "PARTNER-GATED" does not mean inaccessible — it means a formal application/agreement is required before API credentials are issued.
3. For all hospitality APIs, the property operator (hotel/resort/spa) must also authorize third-party access, regardless of platform classification.
4. PII restriction applies universally: no platform permits third-party access to guest PII without explicit property authorization and a data processing agreement.
5. Aggregate-only, de-identified data is the appropriate scope for intelligence/benchmarking use cases across all platforms.

---

## CLASSIFICATION KEY

| Label | Meaning |
|---|---|
| SAFE TO IMPLEMENT | Public dataset, no auth required, permissive terms |
| SAFE ONLY WITH BUSINESS AUTH | Official API, OAuth/key, property/operator must authorize |
| PARTNER-GATED | API exists but requires certified integrator / partner program application |
| DO NOT USE | No public API, or ToS explicitly prohibits third-party use |
| NEEDS COUNSEL | Has API but terms ambiguous or partner requirements unclear |

---

## CATEGORY C1 — HOSPITALITY PMS SYSTEMS

---

### 1. Oracle OPERA Cloud (OHIP — Oracle Hospitality Integration Platform)

| Field | Detail |
|---|---|
| **Classification** | **PARTNER-GATED** |
| **Developer Portal** | https://www.oracle.com/hospitality/integration-platform/ (public) |
| **OHIP Docs** | https://docs.oracle.com/en/industries/hospitality/integration-platform/ |
| **HTTP Status** | Public pages load (200); OHIP runtime portal is enterprise-specific (URL issued via welcome email) |
| **GitHub SDK** | https://github.com/oracle/hospitality-api-docs |
| **GitHub License** | Universal Permissive License v1.0 (UPL) — specs only, not runtime |
| **Developer ToS** | https://docs.oracle.com/en/industries/hospitality/integration-platform/ohipl/c_licensing_guide_licensing_information.htm |
| **Access Model** | OHIP self-registration via shop.oracle.com; sandbox available (consumption-based pricing); NDA-equivalent embedded in OHIP subscription |
| **Key Restrictions** | API specs on GitHub are UPL (free to read/fork specs) — but runtime API calls require OHIP account + property authorization. Software may not be redistributed, transmitted, or sublicensed without license. Only OPERA Cloud supported (OPERA 5 planned). |
| **Spa/Activity Data** | Yes — property API specs (bof.json, property modules) exist in GitHub repo; spa/activity availability, rates, reservations in scope |
| **Aggregate-Only Path** | OHIP Streaming API + Analytics available (announced 2023+); property must authorize |
| **PII Handling** | Per-property authorization required; governed by Oracle data agreements |

**Note:** The GitHub repo (UPL) makes API *specifications* freely readable. This does **not** grant runtime access. Self-registration is available but the property must also activate the integration.

**Evidence:**
- https://github.com/oracle/hospitality-api-docs
- https://www.oracle.com/hospitality/pms-pos-integration-partners/
- https://docs.oracle.com/en/industries/hospitality/integration-platform/ohipu/c_faqs.htm

---

### 2. Mews Systems

| Field | Detail |
|---|---|
| **Classification** | **SAFE ONLY WITH BUSINESS AUTH** |
| **Developer Portal** | https://docs.mews.com/ (public, HTTP 200 confirmed) |
| **Connector API** | https://mews-systems.gitbook.io/connector-api |
| **GitHub SDK** | https://github.com/MewsSystems/open-api-docs, https://github.com/MewsSystems/gitbook-connector-api, https://github.com/MewsSystems/gitbook-open-api |
| **GitHub License** | Not explicitly confirmed in search; docs appear open |
| **Developer ToS** | https://www.mews.com/en/terms-conditions/partners (Partner General T&C) |
| **Access Model** | API key / access token per property; partner contact: partnersuccess@mews.com |
| **APIs Available** | Connector API (general PMS data), Channel Manager API, Booking Engine API |
| **Key Restrictions** | Mews retains full IP ownership. Partners may not alter, edit, sublicense, or white-label. API access granted per property. No redistribution without explicit written consent. |
| **Spa/Activity Data** | Connector API includes guest services data; spa/activity scope depends on property configuration |
| **Aggregate-Only Path** | Aggregate data permitted in anonymized form per Partner T&C |
| **PII Handling** | Property must authorize; subject to Mews data processing terms |

**Evidence:**
- https://docs.mews.com/getting-started
- https://www.mews.com/en/terms-conditions/partners
- https://mews-systems.gitbook.io/connector-api/guidelines

---

### 3. Cloudbeds

| Field | Detail |
|---|---|
| **Classification** | **SAFE ONLY WITH BUSINESS AUTH** |
| **Developer Portal** | https://developers.cloudbeds.com/ (public, confirmed) |
| **GitHub SDK** | None found |
| **Developer ToS** | https://www.cloudbeds.com/terms/api/ (confirmed URL) |
| **Access Model** | OAuth 2.0 OR API key. Two paths: (1) self-service — property generates key directly; (2) partner program — requires Partnerships team review, test account, 60-min cert call. Contact: partnerships@cloudbeds.com |
| **Key Restrictions** | Licenses NOT sublicenseable, transferable, or assignable. Service providers must be bound by same T&C. Cloudbeds may use aggregate/de-identified data; developers may NOT redistribute raw data. API v1.1 deprecated March 31, 2025. |
| **Spa/Activity Data** | Available if property uses Cloudbeds for those modules |
| **Aggregate-Only Path** | De-identified aggregate use permitted for Cloudbeds internally; developer redistribution not permitted |
| **PII Handling** | https://myfrontdesk.cloudbeds.com/hc/en-us/articles/360004920294 |

**Evidence:**
- https://developers.cloudbeds.com/
- https://www.cloudbeds.com/terms/api/
- https://developers.cloudbeds.com/docs/getting-started-as-a-partner-in-5-steps

---

### 4. SiteMinder (Channel Manager + PMS)

| Field | Detail |
|---|---|
| **Classification** | **PARTNER-GATED** |
| **Developer Portal** | https://developer.siteminder.com/siteminder-apis (confirmed loads) |
| **Apply to Partner** | https://www.siteminder.com/integrations/apply-now/ |
| **GitHub SDK** | None found |
| **Developer ToS** | Not found as standalone public URL; embedded in partner agreement |
| **Access Model** | Application required; 5-phase integration process (Initiation → Development → Certification → Production → Live). Test account issued only after partnership agreement is complete. Timeline: 4–6 weeks post-test-account. |
| **Key Restrictions** | Approved partners only; no self-service API key path |
| **Spa/Activity Data** | No spa-specific API documented; SiteMinder is a distribution/channel management layer |
| **APIs Documented** | SiteConnect (channel booking), pmsXchange (PMS/RMS), SiteMinder Exchange (apps) |
| **PII Handling** | Guest booking data; subject to partner agreement and GDPR |

**Evidence:**
- https://developer.siteminder.com/siteminder-apis
- https://www.siteminder.com/integrations/apply-now/
- https://developer.siteminder.com/siteminder-apis/integration-process

---

### 5. Sabre SynXis (CRS + PMS)

| Field | Detail |
|---|---|
| **Classification** | **PARTNER-GATED** |
| **Developer Portal** | https://developer.synxis.com/ (confirmed loads) |
| **GitHub** | https://github.com/SabreDevStudio (Sabre org; SynXis-specific public SDKs not confirmed) |
| **Developer ToS** | NDA required before API access; no public ToS URL |
| **Access Model** | Multi-stage certification: Contact Sabre → sign NDA → develop in cert environment → submit message samples → certification review. Contact: SHSIntegrationCertification@sabre.com |
| **Access Restriction** | "Access to the Sabre Hospitality APIs is limited to customers or partners working with a customer of Sabre Hospitality" |
| **Key Restrictions** | NDA required. No open/self-service path. Both REST and SOAP APIs available. 100+ APIs, 600+ connections. |
| **Spa/Activity Data** | Not confirmed as separate module in public docs; primarily reservations/distribution/loyalty |
| **PII Handling** | Governed by NDA and Sabre data agreements |

**Evidence:**
- https://developer.synxis.com/
- https://developer.synxis.com/apis/soap_apis/hotel/certification
- https://partners.sabre.com/

---

### 6. Amadeus Hospitality (Central Reservations + GDS)

| Field | Detail |
|---|---|
| **Classification** | **PARTNER-GATED** |
| **Developer Portal (Hospitality)** | https://developer.amadeus-hospitality.com/products |
| **Developer Portal (Travel — CLOSING)** | https://developers.amadeus.com/ (self-service tier being decommissioned 2025) |
| **GitHub SDK** | https://github.com/amadeus4dev — Node.js SDK: amadeus4dev/amadeus-node; Python SDK: amadeus4dev/amadeus-python |
| **GitHub License** | MIT (travel self-service SDKs) |
| **Developer ToS** | https://developers.amadeus.com/self-service/apis-docs/guides/developer-guides/faq/ |
| **Access Model** | Enterprise only (request-based, dedicated account manager, customized pricing). Self-service portal decommissioned in early 2025. |
| **CRITICAL NOTE** | Amadeus shut down the self-service developer portal. Do NOT build on the self-service tier. Enterprise path is the only remaining option and requires a formal commercial agreement. |
| **Key Restrictions** | Enterprise access requires formal agreement; no self-service path post-2025. Redistribution and competitive use governed by enterprise agreement only. |
| **Spa/Activity Data** | Not publicly documented; would require Enterprise agreement |
| **PII Handling** | Enterprise data processing agreement required |

**Evidence:**
- https://www.phocuswire.com/amadeus-shut-down-self-service-apis-portal-developers
- https://developer.amadeus-hospitality.com/products
- https://github.com/amadeus4dev

---

### 7. Agilysys (PMS + Spa/Activities — includes Book4Time, ResortSuite, Stay PMS)

| Field | Detail |
|---|---|
| **Classification** | **PARTNER-GATED** (self-certification path available) |
| **Developer Portal** | https://agys-dev.developer.azure-api.net/ (Azure API Management portal) |
| **QA/Int Portal** | https://agys-qaint.developer.azure-api.net/ |
| **HTNG Registry** | https://apiregistry.htng.org/api/agilysys~agilysys-api |
| **GitHub** | https://github.com/Agilysys-Inc (org exists; no public SDKs confirmed) |
| **Developer ToS** | Not found as standalone public URL; partner agreements govern |
| **Access Model** | Developer portal signup for API key (Azure APIM). Integration partners self-certify against Agilysys APIs or HTNG standards. Certification logo issued on successful testing. |
| **Solution Partners** | https://www.agilysys.com/en/solution-partners/ |
| **Key Restrictions** | No public documentation of redistribution/caching restrictions found; contact required for full terms. Self-certification is a lower barrier than Oracle/Sabre. |
| **Spa/Activity Data** | Yes — Spa (Agilysys Spa / Book4Time), Golf, Activities, ResortSuite modules all confirmed. Treatment menus, service pricing, availability, scheduling in scope. |
| **PII Handling** | Property must authorize |

**Evidence:**
- https://agys-dev.developer.azure-api.net/
- https://www.agilysys.com/en/solution-partners/
- https://apiregistry.htng.org/api/agilysys~agilysys-api

---

### 8. Maestro PMS

| Field | Detail |
|---|---|
| **Classification** | **NEEDS COUNSEL** |
| **Developer Portal** | http://developers.maestro.io/ (HTTP — not HTTPS; confirm TLS in any implementation) |
| **REST API Docs** | http://developers.maestro.io/api/rest |
| **GitHub SDK** | None found; API specs use OpenAPI 3.0 (Swagger) |
| **Developer ToS** | Not found as public URL; email: documentation@maestro.io |
| **Access Model** | API key + Client ID + JWT; described as "open API" in press but contact required for non-listed interfaces. No formal partner certification program described. |
| **Key Restrictions** | "Open API" language used in marketing but no public ToS found. HTTP (non-HTTPS) developer portal raises security concern. Terms unclear. 800+ vendor integrations supported. |
| **Spa/Activity Data** | Not explicitly documented in public-facing materials; contact required |
| **PII Handling** | Property authorization required |

**Evidence:**
- https://www.maestropms.com/interfaces-open-apis-integration-pms-partners.html
- http://developers.maestro.io/api/rest
- https://www.maestropms.com/uploads/InterfacesIntegrated.pdf

---

## CATEGORY C2 — SPA SYSTEMS IN RESORTS

---

### 9. Book4Time (Book4Time by Agilysys)

| Field | Detail |
|---|---|
| **Classification** | **PARTNER-GATED** |
| **Developer Portal** | No standalone Book4Time developer portal; routes through Agilysys partner ecosystem |
| **Integration Page** | https://book4time.com/software-integrations/ |
| **GitHub SDK** | None found |
| **Developer ToS** | Governed by Agilysys partner agreement |
| **Access Model** | Agilysys integration partner program (agys-dev.developer.azure-api.net); 100+ existing pre-built integrations (Oracle OPERA, Mews, Infor, ALICE, etc.) |
| **Key Restrictions** | No public self-service API; partner registration required; acquired by Agilysys 2022 |
| **Spa/Activity Data** | Yes — spa appointments, service menus, availability, therapist scheduling, guest profiles, POS confirmed in integration documentation |
| **Aggregate-Only Path** | Not explicitly documented; aggregate analytics via Agilysys RevStream Analytics product |
| **PII Handling** | Property must authorize |

**Evidence:**
- https://book4time.com/software-integrations/
- https://www.agilysys.com/en/agilysys-book4time-integrations/
- https://www.agilysys.com/en/solution-partners/

---

### 10. SpaSoft (Springer-Miller Systems — subsidiary of Gary Jonas Computing)

| Field | Detail |
|---|---|
| **Classification** | **DO NOT USE** |
| **Developer Portal** | None found — springermiller.com has no developer/API portal link |
| **GitHub SDK** | None found |
| **Developer ToS** | Not publicly available |
| **Access Model** | Contact-only. Partners page: https://springermiller.com/partners/. Support: +1 702-560-6900 |
| **Key Restrictions** | No public API documentation found. Third-party press articles reference integration capability, but no official developer docs confirmed. |
| **Spa/Activity Data** | Spa scheduling, POS, treatment menus — assumed to exist in system, but no API access path confirmed |
| **PII Handling** | Unknown without formal engagement |

**Note:** SpaSoft is used by 65%+ of five-star spas globally. No API developer path confirmed publicly across multiple search attempts. Classify as DO NOT USE until a direct partner inquiry to springermiller.com/partners/ yields documented API access terms.

**Evidence:**
- https://springermiller.com/partners/
- https://springermiller.com/products/spasoft/
- https://www.exploretech.io/en/product/springer-miller-systems-smshost-spasoft

---

### 11. ResortSuite (ResortSuite by Agilysys — acquired)

| Field | Detail |
|---|---|
| **Classification** | **PARTNER-GATED** |
| **Developer Portal** | Routes to Agilysys partner portal; no standalone ResortSuite developer docs |
| **GitHub SDK** | None found |
| **Developer ToS** | Governed by Agilysys partner agreement |
| **Access Model** | Agilysys integration partner program (same as #7 and #9) |
| **Key Restrictions** | Same as Agilysys (#7) |
| **Spa/Activity Data** | Yes — full module suite confirmed: SPA, PMS, CLUB, GOLF, CATERING, RETAIL, SKI, CONCIERGE, F&B |
| **GuestEX** | Web/mobile booking interface for guests; may have webhook capability (unconfirmed in public docs) |

**Evidence:**
- https://www.agilysys.com/en/resortsuite/
- https://www.usoft.com/client-case/agilysys-resortsuite

---

### 12. Springer-Miller Systems (SMS|Host PMS + SpaSoft)

| Field | Detail |
|---|---|
| **Classification** | **DO NOT USE** |
| **Developer Portal** | None found |
| **GitHub SDK** | None found |
| **Developer ToS** | Not publicly available |
| **Access Model** | Direct partner engagement only — same as #10 |

**Note:** SMS|Host is the PMS; SpaSoft is the spa module. Both are Springer-Miller products. No API developer pathway confirmed publicly. Same evidence as #10. Assess as DO NOT USE until formal inquiry yields documentation.

---

## CATEGORY C3 — GUEST EXPERIENCE PLATFORMS

---

### 13. INTELITY (Hotel Guest App + Staff Platform)

| Field | Detail |
|---|---|
| **Classification** | **NEEDS COUNSEL** |
| **Developer Portal** | https://intelity.com/api/ (confirmed page exists; form-gated) |
| **Platform Integrations** | https://intelity.com/platform-integrations/ |
| **GitHub SDK** | None found |
| **Developer ToS** | Not found publicly |
| **Access Model** | Short form required at intelity.com/api/ to access API details. INTELITY Connect affiliate program provides "certified, discrete integrations." |
| **Key Restrictions** | No public documentation; form-gated; certified integrations only; terms not publicly available |
| **Spa/Activity Data** | Spa/ticketing confirmed in 120+ system integration list (PMS, POS, CRM, spa management, ticketing) |
| **PII Handling** | Property must authorize |

**Evidence:**
- https://intelity.com/api/
- https://intelity.com/platform-integrations/

---

### 14. ALICE (Hotel Operations — now part of Actabl)

| Field | Detail |
|---|---|
| **Classification** | **NEEDS COUNSEL** |
| **Developer Portal** | None found; Actabl website has no API docs section |
| **Blog (API Conceptual)** | https://actabl.com/blog/how-hotel-technology-apis-help-hoteliers/ |
| **GitHub SDK** | None found |
| **Developer ToS** | Not found publicly |
| **Access Model** | Partnership agreement with Actabl required; no self-service path documented. 270+ software integrations; integration team handles custom API partnerships. |
| **Key Restrictions** | No public API documentation; contact-only partnership |
| **Spa/Activity Data** | No spa-specific module; ALICE is hotel operations focused (service delivery, housekeeping, messaging) |
| **PII Handling** | Property must authorize |

**Evidence:**
- https://actabl.com/alice/
- https://actabl.com/blog/how-hotel-technology-apis-help-hoteliers/

---

### 15. Canary Technologies (Digital Check-in / Concierge)

| Field | Detail |
|---|---|
| **Classification** | **NEEDS COUNSEL** |
| **Developer Portal** | None found; integrations page: https://www.canarytechnologies.com/integrations |
| **GitHub SDK** | None found |
| **Developer ToS** | Not found publicly |
| **Access Model** | Internal API team builds integrations in-house (5–10 new integrations/quarter). No self-service API key or OAuth documentation found publicly. |
| **Key Restrictions** | No public-facing API documentation; contact-only path; API exists but access terms not disclosed |
| **Spa/Activity Data** | No spa-specific module; digital check-in / concierge / upsells / messaging focused |
| **PII Handling** | Check-in data (guest PII); property authorization required |

**Note:** Canary raised $80M Series D (2025), ~$600M valuation. API exists internally but no developer program found.

**Evidence:**
- https://www.canarytechnologies.com/integrations

---

### 16. Duve (Guest Communication Platform)

| Field | Detail |
|---|---|
| **Classification** | **NEEDS COUNSEL** |
| **Developer Portal** | None found; main site: https://duve.com/ |
| **GitHub SDK** | None found |
| **Developer ToS** | Not found publicly |
| **Access Model** | PMS-integration based (80+ PMS connectors); no direct third-party developer API documented publicly. Integrations appear to be pre-built PMS connectors. |
| **Key Restrictions** | No public developer documentation found |
| **Spa/Activity Data** | No spa-specific capability documented; guest communication platform only |
| **PII Handling** | Guest communication data (WhatsApp, SMS, email, OTA messages); property authorization required |

**Note:** $60M Series B raised Dec 2025; serves 1M+ guests/month in 70+ countries. API exists (150+ integrations) but developer access path not public.

**Evidence:**
- https://duve.com/
- https://skift.com/2025/12/09/duve-60-million-series-b-hotels-guest-management/

---

## MASTER SUMMARY TABLE

| # | Platform | Category | Classification | Developer Portal (URL) | Auth Model | GitHub / License | Developer ToS URL | Spa/Activity Data |
|---|----------|----------|----------------|----------------------|------------|-----------------|-------------------|-------------------|
| 1 | Oracle OPERA Cloud (OHIP) | C1-PMS | PARTNER-GATED | oracle.com/hospitality/integration-platform/ | OHIP partner acct + property auth | github.com/oracle/hospitality-api-docs — UPL | docs.oracle.com/…/ohipl/ | Yes (BOF/property API modules) |
| 2 | Mews Systems | C1-PMS | SAFE ONLY WITH BUSINESS AUTH | docs.mews.com | API key per property | github.com/MewsSystems/open-api-docs — unconfirmed | mews.com/en/terms-conditions/partners | Yes (Connector API) |
| 3 | Cloudbeds | C1-PMS | SAFE ONLY WITH BUSINESS AUTH | developers.cloudbeds.com | OAuth 2.0 or API key; partner review | None found | cloudbeds.com/terms/api/ | If property uses Cloudbeds modules |
| 4 | SiteMinder | C1-PMS | PARTNER-GATED | developer.siteminder.com | Partner agreement + cert | None found | Embedded in partner agreement | No spa module (distribution layer) |
| 5 | Sabre SynXis | C1-PMS | PARTNER-GATED | developer.synxis.com | NDA + cert process | github.com/SabreDevStudio — SDKs not confirmed | NDA-only; no public URL | Not confirmed |
| 6 | Amadeus Hospitality | C1-PMS | PARTNER-GATED | developer.amadeus-hospitality.com | Enterprise only (self-service CLOSED 2025) | github.com/amadeus4dev — MIT (travel APIs only) | developers.amadeus.com/…/faq/ | Not publicly documented |
| 7 | Agilysys (PMS+Spa) | C1-PMS | PARTNER-GATED | agys-dev.developer.azure-api.net | API key (Azure APIM); self-cert | github.com/Agilysys-Inc — no public SDKs | Not found publicly | Yes (Spa, Golf, Activities, ResortSuite) |
| 8 | Maestro PMS | C1-PMS | NEEDS COUNSEL | developers.maestro.io (HTTP only) | API key + JWT | None; OpenAPI 3.0 specs | Not found publicly | Not confirmed in public docs |
| 9 | Book4Time (by Agilysys) | C2-SPA | PARTNER-GATED | Via Agilysys (agys-dev.developer.azure-api.net) | Agilysys partner program | None found | Via Agilysys | Yes (menus, availability, pricing, scheduling) |
| 10 | SpaSoft (Springer-Miller) | C2-SPA | DO NOT USE | None found | Contact-only | None found | Not available | Unknown without direct engagement |
| 11 | ResortSuite (by Agilysys) | C2-SPA | PARTNER-GATED | Via Agilysys | Agilysys partner program | None found | Via Agilysys | Yes (spa, golf, dining, activities, full suite) |
| 12 | Springer-Miller Systems (SMS|Host) | C2-SPA | DO NOT USE | None found | Contact-only | None found | Not available | Unknown without direct engagement |
| 13 | INTELITY | C3-GUEST | NEEDS COUNSEL | intelity.com/api/ (form-gated) | Form inquiry; INTELITY Connect | None found | Not available publicly | Spa/ticketing in integration list |
| 14 | ALICE (Actabl) | C3-GUEST | NEEDS COUNSEL | None found | Partner agreement required | None found | Not available publicly | No spa module; ops-focused |
| 15 | Canary Technologies | C3-GUEST | NEEDS COUNSEL | None found (integrations pg) | Internal team builds integrations | None found | Not available publicly | No spa module; check-in focused |
| 16 | Duve | C3-GUEST | NEEDS COUNSEL | None found | PMS connector-based | None found | Not available publicly | No spa module; communication platform |

---

## KEY FINDINGS FOR SOCELLE INTELLIGENCE USE CASES

### Platforms with confirmed spa/activity data in scope:
- Oracle OPERA Cloud (OHIP) — PARTNER-GATED; spa module in property API specs
- Agilysys (and Book4Time, ResortSuite) — PARTNER-GATED; full spa/activity/golf/dining suite
- Mews Systems — SAFE ONLY WITH BUSINESS AUTH; spa data if property configured

### Platforms with lower integration barriers:
- Mews Systems: Most accessible; public docs, API key per property, clear ToS
- Cloudbeds: Self-service path exists; partner review for broader integrations

### Platforms requiring formal legal/partner agreements before any integration:
- Oracle OPERA Cloud (OHIP): OHIP subscription required; property must also activate
- Sabre SynXis: NDA must be signed first
- SiteMinder: Full 5-phase partner certification
- Amadeus Hospitality: Enterprise commercial agreement required (self-service closed)

### Platforms to deprioritize or avoid without direct legal/partner inquiry:
- SpaSoft / Springer-Miller Systems: No public API path found
- ALICE (Actabl), Canary Technologies, Duve: No public developer documentation

### Aggregate-only / no-PII path considerations:
- None of the 16 platforms offer a fully open, no-auth aggregate data API for spa/amenity intelligence
- All require at minimum: (a) property authorization, and (b) a signed partner/integration agreement
- The closest to accessible are Mews (public docs, OAuth, clear ToS) and Cloudbeds (public docs, API ToS at known URL)

---

*SOCELLE GLOBAL API Compliance Research — 2026-03-06 — Evidence-based only — Not legal advice*
