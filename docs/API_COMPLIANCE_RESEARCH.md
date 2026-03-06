# SOCELLE API COMPLIANCE RESEARCH REPORT
**Date:** 2026-03-06  
**Scope:** Category B1 (E-Commerce Platforms) + Category B2 (Pro Brand APIs)  
**Method:** Web search, GitHub org search, official developer portal verification  
**Disclaimer:** This is an evidence-based research report. It is NOT legal advice. Consult counsel before implementation.

---

## CATEGORY B1 — E-COMMERCE PLATFORMS

### 1. Shopify (Storefront API + Admin API)

| Field | Evidence |
|---|---|
| **Developer Portal** | https://shopify.dev/docs/api — CONFIRMED LIVE |
| **Access Model** | OAuth 2.0 (Admin API — app-based, merchant must install/authorize); API key (Storefront API — public token per store) |
| **GitHub SDK URLs** | https://github.com/Shopify/shopify-api-js (MIT) · https://github.com/Shopify/shopify-api-ruby (MIT) · https://github.com/Shopify/shopify-api-php (MIT) · https://github.com/Shopify/storefront-api-learning-kit (MIT) |
| **Developer ToS URL** | https://www.shopify.com/legal/api-terms |
| **Key Restrictions** | (1) Aggregate/derived Merchant Data CANNOT be used to train AI/ML without written consent from Shopify or merchant. (2) Non-sublicensable, non-transferable license. (3) App must be enrolled in Partner Program for commercial distribution. (4) REST Admin API is legacy as of Oct 2024; new public apps must use GraphQL Admin API from Apr 2025. |
| **Allowed Data Scope** | Products, pricing, catalog, inventory, store locations, orders (with merchant OAuth), B2B wholesale via Admin API (merchant-authorized) |
| **CLASSIFICATION** | **SAFE ONLY WITH BUSINESS AUTH** — Merchant must install your app and authorize OAuth. Data is merchant-scoped. Storefront API public token is per-store, not global. |

---

### 2. BigCommerce (REST API + GraphQL)

| Field | Evidence |
|---|---|
| **Developer Portal** | https://developer.bigcommerce.com/ — CONFIRMED LIVE |
| **Access Model** | OAuth 2.0 (store-level; merchant must create API account or install app) |
| **GitHub SDK URLs** | https://github.com/bigcommerce/bigcommerce-api-python (license: check repo; MIT likely) · https://bigcommerce.github.io/ (open source hub) |
| **Developer ToS URL** | https://www.bigcommerce.co.uk/terms/api-terms/ |
| **Key Restrictions** | Non-exclusive license; redistribution/republication prohibited without written consent; services may not be used to compete with BigCommerce or its licensors |
| **Allowed Data Scope** | Products, pricing, catalog, inventory, store data, orders (merchant-scoped OAuth); GraphQL Storefront API available for headless storefronts |
| **CLASSIFICATION** | **SAFE ONLY WITH BUSINESS AUTH** — Merchant must authorize. No cross-store aggregation without consent. |

---

### 3. WooCommerce (REST API — open source)

| Field | Evidence |
|---|---|
| **Developer Portal** | https://woocommerce.github.io/woocommerce-rest-api-docs/ — CONFIRMED LIVE |
| **Access Model** | API key (Consumer Key + Secret, generated per WordPress site by store owner); built on WordPress REST API |
| **GitHub SDK URLs** | https://github.com/woocommerce/woocommerce-rest-api (GPL-2.0) · https://github.com/woocommerce/woocommerce-rest-api-js-lib (MIT) · https://github.com/woocommerce/woocommerce-rest-api-docs (license: Slate-based, check repo) |
| **Developer ToS URL** | No centralized SaaS ToS — GPL-2.0 governs core; each store operator sets own terms |
| **Key Restrictions** | GPL-2.0 copyleft for core package (derivatives must be GPL); JS lib is MIT (permissive). No central restriction on redistribution of aggregated data — governed by individual merchant agreements. |
| **Allowed Data Scope** | Products, pricing, categories, orders, customers, coupons — full store data with key auth |
| **CLASSIFICATION** | **SAFE ONLY WITH BUSINESS AUTH** — Each merchant grants API key; no platform-level gatekeeping but each merchant owns their data. GPL-2.0 copyleft applies to derived server-side code. |

---

### 4. Lightspeed Commerce (Retail/Restaurant POS)

| Field | Evidence |
|---|---|
| **Developer Portal** | https://developers.lightspeedhq.com/ — CONFIRMED LIVE · https://x-series-api.lightspeedhq.com/ — CONFIRMED LIVE |
| **Access Model** | OAuth 2.0 (Authorization Code Grant); personal tokens also supported |
| **GitHub SDK URLs** | https://github.com/darrylmorley/lightspeed-retail-sdk (community, not official) · https://github.com/timothydc/laravel-lightspeed-retail-api (community, not official) — No official Lightspeed GitHub SDK found |
| **Developer ToS URL** | https://developers.lightspeedhq.com/terms |
| **Key Restrictions** | Non-exclusive, non-sublicensable, non-transferable, revocable license. Developer may only use API to extend Lightspeed products — NOT to build competing platforms. Lightspeed can terminate at any time with notice. |
| **Allowed Data Scope** | Products, inventory, sales, store data, orders — per authorized merchant account |
| **CLASSIFICATION** | **SAFE ONLY WITH BUSINESS AUTH** — Merchant must authorize. No official GitHub SDK with OSI license found (community SDKs only). |

---

### 5. Magento / Adobe Commerce

| Field | Evidence |
|---|---|
| **Developer Portal** | https://developer.adobe.com/commerce/webapi/rest/ — CONFIRMED LIVE |
| **Access Model** | OAuth 1.0a (for Admin API integrations); bearer tokens; API key via Adobe Developer Console for SaaS-connected services |
| **GitHub SDK URLs** | https://github.com/AdobeDocs/commerce-webapi (OSL 3.0) · https://github.com/magento/magento2 (OSL 3.0) |
| **Developer ToS URL** | https://www.adobe.com/legal/terms/enterprise-licensing/all-product-terms.html · https://www.adobe.com/content/dam/cc/en/legal/terms/enterprise/pdfs/PSLT-AdobeCommerceCloud-WW-2025v1.pdf |
| **Key Restrictions** | OSL 3.0 (not GPL): copyleft on server-side modifications distributed externally; contributor CLA required. Adobe Commerce (paid) has additional enterprise licensing terms. Magento Open Source is OSL 3.0 permissive for self-hosted builds. |
| **Allowed Data Scope** | Full catalog, pricing, inventory, orders, customers — on merchant's own instance |
| **CLASSIFICATION** | **SAFE ONLY WITH BUSINESS AUTH** — For Magento Open Source: self-hosted, OSL 3.0. For Adobe Commerce Cloud: enterprise license required. Either way, merchant must provision access. |

---

### 6. Salesforce Commerce Cloud (SFCC / B2C Commerce API)

| Field | Evidence |
|---|---|
| **Developer Portal** | https://developer.salesforce.com/docs/commerce/commerce-api/overview — CONFIRMED LIVE |
| **Access Model** | OAuth 2.0 (SLAS — Shopper Login and API Access Service); partner/ISV enrollment required for AppExchange distribution |
| **GitHub SDK URLs** | https://github.com/SalesforceCommerceCloud/commerce-sdk (MIT) |
| **Developer ToS URL** | https://www.salesforce.com/company/legal/program-agreement/ · https://developer.salesforce.com/blogs/2025/02/important-updates-to-legal-terms-for-salesforce-developers |
| **Key Restrictions** | Direct Salesforce competitors PROHIBITED from access. AppExchange Partner Program enrollment required for commercially distributed apps. Competitive use strictly prohibited. |
| **Allowed Data Scope** | Products, pricing, catalog, promotions, orders — per licensed merchant instance |
| **CLASSIFICATION** | **PARTNER-GATED** — Requires AppExchange Partner Program enrollment for commercial apps. Salesforce competitors explicitly banned. |

---

## CATEGORY B2 — PRO BRAND APIs

> **Research methodology:** Searched "[Brand] developer API", "[Brand] partner API", "[Brand] B2B API", "[Brand] SDK github", "[Brand] store locator API" for each brand. Results are evidence-based; absence of findings is documented.

---

### 7. Naturopathica

| Field | Evidence |
|---|---|
| **Developer Portal** | None found. developer.naturopathica.com — no evidence of existence. naturopathica.com has no developer section. |
| **GitHub Org** | No GitHub org found for Naturopathica |
| **API Evidence** | None. Brand operates retail DTC + spa wholesale only. No public developer documentation found. |
| **CLASSIFICATION** | **DO NOT USE** — No public API. No developer portal. No SDK. B2B ordering is manual/distributor-based. |

---

### 8. Dermalogica

| Field | Evidence |
|---|---|
| **Developer Portal** | pro.dermalogica.com (professional B2B portal confirmed live — login/account required); prodashboard.dermalogica.com (confirmed live — login required). No API documentation found at any public developer URL. |
| **GitHub Org** | No github.com/dermalogica found |
| **API Evidence** | None publicly documented. Professional ordering is through the PRO portal (web-based, not API). |
| **CLASSIFICATION** | **DO NOT USE** — No public API. PRO portal exists but is a web app, not an API endpoint. Contact Dermalogica partner relations for any integration inquiry. |

---

### 9. SkinCeuticals

| Field | Evidence |
|---|---|
| **Developer Portal** | Part of L'Oréal Dermatological Beauty. L'Oréal operates api.loreal.com (CONFIRMED LIVE — internal API catalog). SkinCeuticals-specific developer portal: none found. |
| **GitHub Org** | No github.com/skinceuticals found. L'Oréal has no public GitHub SDK for brand data. |
| **API Evidence** | L'Oréal api.loreal.com is described as an internal platform for L'Oréal entities and future partners — not a public developer API. Contact required to access production environment. L'Oréal uses Apigee (Google Cloud) as API management. |
| **CLASSIFICATION** | **PARTNER-GATED** — L'Oréal has an API platform (api.loreal.com) but access requires direct engagement with L'Oréal API owners. No self-serve enrollment. No SDK with OSI license. |

---

### 10. PCA Skin

| Field | Evidence |
|---|---|
| **Developer Portal** | None found. pcaskin.com has no developer section. developer.pcaskin.com — no evidence of existence. |
| **GitHub Org** | No github.com/pcaskin found |
| **API Evidence** | None. PCA Skin operates through authorized professional accounts. B2B ordering is through their professional portal (web-based). No API documentation found in any search. |
| **CLASSIFICATION** | **DO NOT USE** — No public API. No developer portal. No SDK. |

---

### 11. SkinMedica (Allergan Aesthetics / AbbVie)

| Field | Evidence |
|---|---|
| **Developer Portal** | allerganaesthetics.com exists. "Brilliant Connections" platform is a managed e-commerce storefront for practices — not an open API. allerganbrandbox.com exists for marketing assets. No developer API portal found. |
| **GitHub Org** | No github.com/allergan or github.com/skinmedica with public SDKs found |
| **API Evidence** | "Aptios by Allergan Aesthetics" referenced (ctech-t.abbvie.net/login) — appears to be an internal/partner-authenticated system. Allē loyalty program built on Twilio infrastructure — no public API. |
| **CLASSIFICATION** | **DO NOT USE** — No public API. Brilliant Connections is a white-label storefront, not an API. Allē has no public developer program. |

---

### 12. Obagi Medical

| Field | Evidence |
|---|---|
| **Developer Portal** | obagi-professional.com confirmed live — professional ordering portal requiring account. No developer API portal found. obagi.com/pages/professional-registration-form — manual enrollment. |
| **GitHub Org** | No github.com/obagimedical found |
| **API Evidence** | None. Professional access requires account with unique Customer Number. No API documentation found in any search. |
| **CLASSIFICATION** | **DO NOT USE** — No public API. Professional ordering is web portal-based, not API. |

---

### 13. iS Clinical

| Field | Evidence |
|---|---|
| **Developer Portal** | isclinical.com — no developer section found. developer.isclinical.com — no evidence of existence. |
| **GitHub Org** | No github.com/isclinical found |
| **API Evidence** | None. Professional ordering through authorized distributors. No API documentation in any search result. |
| **CLASSIFICATION** | **DO NOT USE** — No public API. No developer portal. No SDK. |

---

### 14. Eminence Organic Skin Care

| Field | Evidence |
|---|---|
| **Developer Portal** | eminenceorganics.com — no developer section. Professional/spa accounts managed through web portal. No developer API portal found. |
| **GitHub Org** | No github.com/eminenceorganics found |
| **API Evidence** | None. Described as distributed through licensed spa professionals. No API documentation in any search. |
| **CLASSIFICATION** | **DO NOT USE** — No public API. No developer portal. No SDK. |

---

### 15. Circadia

| Field | Evidence |
|---|---|
| **Developer Portal** | circadia.com — no developer section. Partnerships referenced on blog. No developer API portal found. |
| **GitHub Org** | No github.com/circadia found |
| **API Evidence** | None. Circadia is a small professional brand distributed through licensed providers. No API documentation in any search. |
| **CLASSIFICATION** | **DO NOT USE** — No public API. No developer portal. No SDK. |

---

### 16. Image Skincare

| Field | Evidence |
|---|---|
| **Developer Portal** | imageskincare.com — no developer section found. 30,000+ professional network mentioned but no API portal. |
| **GitHub Org** | No github.com/imageskincare found |
| **API Evidence** | None. Distributed through licensed skincare professionals. No API documentation in any search. |
| **CLASSIFICATION** | **DO NOT USE** — No public API. No developer portal. No SDK. |

---

### 17. Biologique Recherche

| Field | Evidence |
|---|---|
| **Developer Portal** | biologique-recherche.com — no developer section found. Premium French brand with exclusive spa distribution. No developer API portal found. |
| **GitHub Org** | No GitHub org found |
| **API Evidence** | None. Biologique Recherche is exclusively distributed through authorized clinics/spas with manual ordering. No API documentation in any search. |
| **CLASSIFICATION** | **DO NOT USE** — No public API. No developer portal. No SDK. Exclusive distribution model incompatible with open API. |

---

### 18. Hydrafacial (Devices + Software)

| Field | Evidence |
|---|---|
| **Developer Portal** | hydrafacial.com — no public developer section found. Software integration search returned zero relevant results about a developer portal. |
| **GitHub Org** | No github.com/hydrafacial found |
| **API Evidence** | None publicly documented. HydraFacial device software is proprietary (BeautyStat platform / Syndeo device ecosystem). No public API documentation in any search. |
| **CLASSIFICATION** | **DO NOT USE** — No public API. Device software is proprietary. Contact HydraFacial business development for any integration discussions. |

---

### 19. Candela Medical (Devices)

| Field | Evidence |
|---|---|
| **Developer Portal** | candelamedical.com — press releases only; no developer section found. No API documentation accessible publicly. |
| **GitHub Org** | No github.com/candelamedical found |
| **API Evidence** | None. Medical device company. Device integration would likely require formal OEM/partner agreement. |
| **CLASSIFICATION** | **DO NOT USE** — No public API. Medical device company; software integration requires formal partnership. |

---

### 20. Lumenis (Devices)

| Field | Evidence |
|---|---|
| **Developer Portal** | lumenis.com — no developer section. partnerzone.lumenis.com CONFIRMED LIVE — partner portal for educational/sales materials, requires partner login. Not a developer API portal. |
| **GitHub Org** | No github.com/lumenis found |
| **API Evidence** | PartnerZone is a partner resource portal (marketing/education materials) — not a developer API. No device API or SDK documentation found publicly. |
| **CLASSIFICATION** | **DO NOT USE** — No public API. PartnerZone is a content portal, not a developer API. Medical device integration requires formal partner agreement. |

---

### 21. Allergan Aesthetics (Botox, Juvederm, CoolSculpting)

| Field | Evidence |
|---|---|
| **Developer Portal** | allerganaesthetics.com / allerganadvantage.com — HCP portals requiring authentication. No public developer API portal found. Allē loyalty platform built on Twilio (no public API). |
| **GitHub Org** | No public github.com/allergan with OSI-licensed SDKs |
| **API Evidence** | No public developer API. "Aptios" system (ctech-t.abbvie.net) appears to be a closed partner/clinical system. |
| **CLASSIFICATION** | **DO NOT USE** — No public API. Loyalty and HCP portals are closed systems. |

---

### 22. Galderma (Restylane, Dysport, Sculptra)

| Field | Evidence |
|---|---|
| **Developer Portal** | galderma.com/partnering — partnership inquiry page, not API portal. galdermahcp.com — HCP portal (login required). gainconnect.com — educational platform (login required). No public developer API found. |
| **GitHub Org** | No public GitHub org with SDKs found |
| **API Evidence** | ASPIRE Rewards program working toward EMR integration — but no public API documented. galderma.com/us/partnerships requires direct business development contact. |
| **CLASSIFICATION** | **DO NOT USE** — No public API. Partnership inquiries via business development team only. ASPIRE EMR integration not publicly API-accessible. |

---

### 23. Merz Aesthetics (Xeomin, Radiesse, Belotero)

| Field | Evidence |
|---|---|
| **Developer Portal** | portal.merzusa.com — confirmed live (authenticated portal for purchasing/products). merzusa.com — no developer section. xperiencemerz.com — confirmed live (Xperience+ rewards portal). No public developer API portal found. |
| **GitHub Org** | No public GitHub org with SDKs found |
| **API Evidence** | No public developer API. portal.merzusa.com is a closed web ordering platform. Xperience+ rewards has no public API. |
| **CLASSIFICATION** | **DO NOT USE** — No public API. Ordering and rewards portals are closed authenticated web apps. |

---

## SUMMARY TABLE

| # | Brand / Platform | Classification | Developer Portal | SDK License | Notes |
|---|---|---|---|---|---|
| 1 | Shopify (Storefront + Admin) | SAFE ONLY WITH BUSINESS AUTH | shopify.dev (LIVE) | MIT | Merchant OAuth required; AI/ML aggregate data restrictions |
| 2 | BigCommerce (REST + GraphQL) | SAFE ONLY WITH BUSINESS AUTH | developer.bigcommerce.com (LIVE) | MIT (likely) | Merchant OAuth; no competitive use |
| 3 | WooCommerce (REST) | SAFE ONLY WITH BUSINESS AUTH | woocommerce.github.io (LIVE) | GPL-2.0 / MIT | Per-merchant API key; GPL copyleft for server-side |
| 4 | Lightspeed Commerce | SAFE ONLY WITH BUSINESS AUTH | developers.lightspeedhq.com (LIVE) | Community only (no official OSI SDK) | Non-sublicensable; cannot compete with Lightspeed |
| 5 | Magento / Adobe Commerce | SAFE ONLY WITH BUSINESS AUTH | developer.adobe.com/commerce (LIVE) | OSL 3.0 | Open Source = OSL; Cloud = enterprise license |
| 6 | Salesforce Commerce Cloud | PARTNER-GATED | developer.salesforce.com (LIVE) | MIT (SDK) | AppExchange enrollment required; competitors banned |
| 7 | Naturopathica | DO NOT USE | None found | None | No API; manual B2B ordering |
| 8 | Dermalogica | DO NOT USE | PRO portal (login-only) | None | No API; web portal only |
| 9 | SkinCeuticals (L'Oréal) | PARTNER-GATED | api.loreal.com (internal; contact required) | None public | L'Oréal API platform exists but requires direct engagement |
| 10 | PCA Skin | DO NOT USE | None found | None | No API; professional portal only |
| 11 | SkinMedica (Allergan) | DO NOT USE | None found | None | Brilliant Connections = managed storefront, not API |
| 12 | Obagi Medical | DO NOT USE | Professional portal (login-only) | None | No API; manual professional account |
| 13 | iS Clinical | DO NOT USE | None found | None | No API; distributor-based ordering |
| 14 | Eminence Organic Skin Care | DO NOT USE | None found | None | No API; spa professional distribution |
| 15 | Circadia | DO NOT USE | None found | None | No API; licensed provider distribution |
| 16 | Image Skincare | DO NOT USE | None found | None | No API; 30K+ pro network, no developer access |
| 17 | Biologique Recherche | DO NOT USE | None found | None | Exclusive distribution; no API |
| 18 | Hydrafacial | DO NOT USE | None found | None | Proprietary device software; no public API |
| 19 | Candela Medical | DO NOT USE | None found | None | Medical device; OEM/partner only |
| 20 | Lumenis | DO NOT USE | partnerzone.lumenis.com (content portal) | None | PartnerZone is content/education only; no API |
| 21 | Allergan Aesthetics | DO NOT USE | HCP portals (login-only) | None | Closed loyalty + HCP systems; no public API |
| 22 | Galderma | DO NOT USE | HCP + partnership portals (login-only) | None | ASPIRE EMR integration not public; BD inquiry only |
| 23 | Merz Aesthetics | DO NOT USE | portal.merzusa.com (login-only) | None | Closed ordering portal; no public API |

---

## KEY FINDINGS FOR SOCELLE

1. **All Category B1 platforms (Shopify, BigCommerce, WooCommerce, Lightspeed, Magento, SFCC) have official APIs** but ALL require merchant authorization — no cross-merchant aggregation without consent.

2. **Zero Category B2 pro skincare brands have public APIs.** None of the 17 professional skincare/device brands have a publicly documented, self-serve developer API with an OSI-licensed SDK.

3. **SkinCeuticals / L'Oréal is the one exception with a latent API infrastructure** (api.loreal.com uses Apigee/Google Cloud) — but access requires direct engagement with L'Oréal's API owners, not self-serve enrollment.

4. **Device brands (Hydrafacial, Candela, Lumenis) are closed.** Medical device software is proprietary and integration requires formal OEM/partner agreements.

5. **Aesthetic injectable brands (Allergan, Galderma, Merz) operate closed HCP portals.** No public API, no public SDK. EMR integrations are brand-initiative (not third-party API) programs.

6. **For SOCELLE:** Integration with brand product data, pricing, protocols, or store locators for any B2 brand will require either: (a) manual data ingestion via brand partnership agreements, (b) brand-provided data exports under contract, or (c) user-facing brand portals where professionals log in directly. Scraping is not authorized by any of these brands and would violate their terms.

---

*Evidence sourced from web searches conducted 2026-03-06. URLs verified as live at time of research. All findings should be validated with legal counsel before implementation.*

*This document is DEMO — no live DB connection. Classification is research-based, not legal advice.*
