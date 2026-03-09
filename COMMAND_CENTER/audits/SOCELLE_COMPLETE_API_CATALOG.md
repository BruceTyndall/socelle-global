# SOCELLE — COMPLETE API & DATA SOURCE CATALOG

> **Purpose:** Single reference document listing every API, RSS feed, public dataset, scraping target, and open-source data source Socelle uses or plans to use  
> **Total sources cataloged:** 90+  
> **Date:** March 2026  
> **Tiers:** Tier 0 = Open/OSS (free, no limits or very high limits) · Tier 1 = Free-quota commercial · Tier 2 = Paid, high leverage  

---

## TABLE OF CONTENTS

1. Beauty Products & Ingredients (11 sources)
2. Safety, Clinical & Research (4 sources)
3. Providers & Professional Licensing (6 sources)
4. Employment, Economic & Education (3 sources)
5. Patents & Innovation (2 sources)
6. Social Media & Content (7 sources)
7. Search Trends (3 sources)
8. Places, Listings & Reviews (4 sources)
9. News Monitoring (3 sources)
10. Jobs & Hiring Signals (2 sources)
11. RSS Feeds — Professional Beauty/Spa (10 feeds)
12. RSS Feeds — Medspa/Aesthetic Medicine (5 feeds)
13. RSS Feeds — Skincare/Beauty Brands (8 feeds)
14. RSS Feeds — Wellness/Holistic (5 feeds)
15. RSS Feeds — Beauty Tech/AI (3 feeds)
16. RSS Feeds — Cosmetic/Plastic Surgery (2 feeds)
17. RSS Feeds — Trade/Industry (7 feeds)
18. Public Scraping Targets — Booking/Pricing (7 targets)
19. Public Scraping Targets — Treatment Pricing Benchmarks (3 targets)
20. Public Scraping Targets — Provider Directories (5 targets)
21. Public Scraping Targets — Reddit Communities (10 subreddits)
22. Open-Source Repos to Self-Host (6 repos)
23. AI/Try-On APIs — Future Tier 2 (4 sources)
24. Industry Classification Codes (5 code systems)
25. Google Trends Search Terms to Track (30 terms)

---

## 1. BEAUTY PRODUCTS & INGREDIENTS

### 1.1 Open Beauty Facts API & Dumps
- **Tier:** 0 — Open
- **URL:** `https://world.openbeautyfacts.org/`
- **API Base:** `https://world.openbeautyfacts.org/api/v2/`
- **Data:** Product names, brands, barcodes, full INCI ingredient lists, categories, packaging, allergens, images
- **Auth:** None required
- **Rate Limits:** No hard limits published
- **Format:** JSON API + nightly CSV/JSONL/Parquet dumps
- **License:** Open Database License (ODbL)
- **Coverage:** Skews European, includes major global brands
- **Socelle Use:** Seed `brands`, `products`, `product_ingredients` tables
- **Refresh:** Monthly dump re-ingestion

### 1.2 EU CosIng Cosmetic Ingredient Database
- **Tier:** 0 — Open
- **URL:** `https://single-market-economy.ec.europa.eu/sectors/cosmetics/cosmetic-ingredient-database_en`
- **Download:** Free CSV from `data.europa.eu`
- **Data:** 30,000+ ingredients with INCI names, CAS numbers, EINECS/ELINCS numbers, chemical names, ingredient functions, mandatory restrictions, conditions of use, SCCS opinion references
- **Auth:** None
- **Rate Limits:** N/A (CSV download)
- **License:** EU Open Data
- **Socelle Use:** Seed `ingredients`, `ingredient_identifiers` tables. Foundation of ingredient knowledge graph.
- **Refresh:** Quarterly re-download

### 1.3 PubChem PUG REST API
- **Tier:** 0 — Open
- **URL:** `https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest`
- **Data:** Chemical properties, structures, bioactivity, safety data, synonyms for any cosmetic ingredient by CAS number or INCI name
- **Auth:** None required
- **Rate Limits:** 5 requests/second recommended
- **Format:** JSON, XML, CSV
- **Socelle Use:** Enrich `ingredients` with official NIH chemical safety data. Cross-reference by CAS number.
- **Refresh:** On-demand per ingredient

### 1.4 EU CosIng API (via API Store)
- **Tier:** 0 — Open
- **URL:** `https://api.store/eu-institutions-api/directorate-general-for-internal-market-industry-entrepreneurship-and-smes-api/cosmetic-ingredient-database-cosing-ingredients-and-fragrance-inventory-api`
- **Data:** Same CosIng data accessible via REST API (ingredients + fragrance inventory)
- **Auth:** API key (free registration)
- **Rate Limits:** Standard EU data portal limits
- **Socelle Use:** Programmatic alternative to CSV download for ingredient lookups

### 1.5 COSMILE Europe (INCI Database)
- **Tier:** 0 — Open
- **URL:** `https://cosmileeurope.eu/inci/`
- **Data:** INCI ingredient search with functions, descriptions, regulatory status
- **Auth:** None (web interface, scrapeable)
- **Socelle Use:** Supplementary ingredient data, consumer-friendly descriptions

### 1.6 Makeup API
- **Tier:** 0 — Open
- **URL:** `https://makeup-api.herokuapp.com/`
- **Docs:** `https://publicapi.dev/makeup-api`
- **Data:** Major drugstore and prestige brands (Maybelline, NYX, CoverGirl, L'Oréal). Product names, prices, ratings, images, tag filters (vegan, cruelty-free, organic, EWG verified)
- **Auth:** None
- **Rate Limits:** None published
- **Format:** JSON
- **Caveat:** Dataset is static, not frequently updated. Good for prototyping and seed data.
- **Socelle Use:** Seed `products` for makeup category

### 1.7 UPCitemdb API
- **Tier:** 1 — Free quota
- **URL:** `https://www.upcitemdb.com/`
- **API Docs:** `https://devs.upcitemdb.com/`
- **Data:** Barcode-to-product lookups across 687M+ UPC/EAN numbers. Product titles, descriptions, brands, images, merchant pricing.
- **Auth:** None for Explorer plan
- **Rate Limits:** 100 requests/day (6/minute burst) on free Explorer plan
- **Format:** JSON
- **Socelle Use:** Barcode lookups for product identification. Enrich products with UPC data.
- **Refresh:** On-demand

### 1.8 BEAUTE E Cosmetic Ingredients Dataset
- **Tier:** 0 — Open
- **URL:** `https://github.com/beauteeru/cosmetic-ingredients-dataset`
- **Data:** CSV linking INCI names ↔ CosIng IDs ↔ CAS numbers ↔ EINECS ↔ PubChem CIDs
- **License:** MIT-like open data
- **Socelle Use:** Bridge table `ingredient_identifiers` — the join key between CosIng, PubChem, and Open Beauty Facts
- **Refresh:** One-time seed

### 1.9 SkincareAPI
- **Tier:** 0 — Open (self-hostable)
- **URL:** `https://github.com/LauraRobertson/skincare-api` (Heroku deployment)
- **Data:** ~2,000 skincare products with brand, name, ingredient lists. Mostly US/K-beauty/J-beauty.
- **Auth:** None
- **Format:** JSON
- **Socelle Use:** Seed `products` for skincare category, complementary ingredient corpus

### 1.10 nic-pan/skincare-ingredients
- **Tier:** 0 — Open (self-hostable)
- **URL:** `https://github.com/nic-pan/skincare-ingredients`
- **Data:** Structured JSON of ingredients with properties, skin types, concerns, ingredient interactions
- **Socelle Use:** Seed `ingredients` with skin-type compatibility and interaction data ("avoid this combo for oily skin")

### 1.11 NoxMoon/inside_beauty
- **Tier:** 0 — Open
- **URL:** `https://github.com/NoxMoon/inside_beauty`
- **Data:** Multi-table beauty product datasets (skincare, body, makeup) with thousands of products and ingredient lists
- **Socelle Use:** Additional seed data for products across multiple categories

---

## 2. SAFETY, CLINICAL & RESEARCH

### 2.1 openFDA API Suite
- **Tier:** 0 — Open
- **URL:** `https://open.fda.gov/apis/`
- **Auth:** Free API key recommended (optional)
- **Rate Limits:** With key: 240 requests/minute, 120,000 requests/day. Without: 40/min, 1,000/day.
- **Format:** JSON via Elasticsearch queries
- **Endpoints used:**

| Endpoint | URL Path | Beauty Data |
|---|---|---|
| Drug Adverse Events | `/drug/event.json` | Botox, Juvederm, Restylane, Dysport, Sculptra, Kybella reports |
| Device Adverse Events | `/device/event.json` | Laser, RF, microneedling, IPL, CoolSculpting safety |
| Drug Labels | `/drug/label.json` | Full prescribing info for cosmetic injectables |
| Device 510(k) | `/device/510k.json` | Newly cleared beauty/aesthetic devices |
| Drug Recalls | `/drug/enforcement.json` | Injectable product recalls |
| Device Recalls | `/device/recall.json` | Beauty device safety recalls |
| Device Classification | `/device/classification.json` | FDA class I/II/III for beauty devices |

- **Search examples:** `patient.drug.openfda.brand_name:"BOTOX"`, device generic name `"LASER"`, `"RADIOFREQUENCY"`, `"MICRONEEDLING"`
- **Update frequency:** Weekly
- **Socelle Use:** `safety_events` table. Safety signals on brand profiles and treatment intelligence pages.

### 2.2 PubMed E-utilities
- **Tier:** 0 — Open
- **URL:** `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/`
- **Auth:** Free NCBI API key recommended
- **Rate Limits:** With key: 10 requests/second. Without: 3/second.
- **Format:** XML (some JSON support)
- **Endpoints:** `esearch.fcgi` (search), `efetch.fcgi` (retrieve), `elink.fcgi` (related)
- **MeSH terms for beauty:** "Cosmetic Techniques", "Dermal Fillers", "Botulinum Toxins", "Laser Therapy", "Cosmeceuticals", "Microneedling", "Radiofrequency Treatment", "Chemical Peel", "Hair Removal"
- **Data:** 36M+ biomedical citations
- **Socelle Use:** Research signal for ingredients and treatments. Emerging ingredient score calculation.
- **Refresh:** Weekly

### 2.3 ClinicalTrials.gov API v2
- **Tier:** 0 — Open
- **URL:** `https://clinicaltrials.gov/api/v2/studies`
- **Auth:** None required
- **Rate Limits:** No published limits
- **Format:** JSON, CSV
- **Pagination:** Up to 1,000 results per request
- **Query examples:** `query.cond=botulinum+toxin+aesthetic`, `query.cond=dermal+filler`, `filter.overallStatus=RECRUITING`
- **Socelle Use:** `clinical_trials` table. Active aesthetic trials as treatment intelligence.
- **Refresh:** Weekly

### 2.4 NIH RePORTER API
- **Tier:** 0 — Open
- **URL:** `https://api.reporter.nih.gov`
- **Auth:** None required
- **Rate Limits:** Recommended ≤1 request/second
- **Data:** Research grant data — funding amounts, PI information, abstracts, publications, patents
- **Search terms:** "dermatology", "aesthetic medicine", "cosmetic surgery", "cosmeceuticals"
- **Socelle Use:** Research funding signals for emerging treatments and ingredients

---

## 3. PROVIDERS & PROFESSIONAL LICENSING

### 3.1 NPI Registry API
- **Tier:** 0 — Open
- **URL:** `https://npiregistry.cms.hhs.gov/api/`
- **Auth:** None required
- **Rate Limits:** No published limits (unlimited)
- **Format:** JSON
- **Pagination:** 200 results per page
- **Taxonomy codes for beauty/aesthetics:**
  - `207N00000X` — Dermatology
  - `207NS0135X` — Procedural Dermatology (MOHS)
  - `207ND0101X` — Dermatopathology
  - `208200000X` — Plastic Surgery
  - `363L00000X` — Nurse Practitioner (filter by state for aesthetics NPs)
  - `363A00000X` — Physician Assistant
- **Data:** NPI numbers, names, credentials, addresses, taxonomy codes, license info
- **Bulk:** Monthly CSV downloads from CMS
- **Socelle Use:** `providers` table. Provider density maps, medspa intelligence.
- **Refresh:** Weekly

### 3.2 NIH Clinical Tables NPI API
- **Tier:** 0 — Open
- **URL:** `https://clinicaltables.nlm.nih.gov/apidoc/npi_idv/v3/doc.html`
- **Data:** Same NPI data with autocomplete/search support
- **Socelle Use:** Autocomplete for provider search feature

### 3.3 State Cosmetology Board License Lookups
- **Tier:** 0 — Open (public records, web scraping required)
- **Key state portals:**
  - California DCA: `search.dca.ca.gov` — 560,000+ licensees, 50,000+ establishments
  - Texas TDLR: `tdlr.texas.gov/LicenseSearch`
  - Florida: `myfloridalicense.com`
  - New York: `op.nysed.gov/verification-search`
  - Illinois: `online-dfpr.com/Lookup`
  - Utah: `dopl.utah.gov/verify`
- **Data:** License number, holder name, license type, status, issue/expiration dates, establishment name
- **Legal:** All public records by law
- **Socelle Use:** Provider verification, esthetician/cosmetologist counts per metro
- **Refresh:** Monthly per priority state

### 3.4 ABMS Board Certification Verification
- **Tier:** 0 — Open
- **URL:** `https://certificationmatters.org`
- **Data:** Board certification status for physicians (plastic surgery, dermatology)
- **Access:** Web lookup, scraping required
- **Socelle Use:** Verify physician credentials for cosmetic surgery intelligence

### 3.5 MeshVerify Professional Beauty License Aggregator
- **Tier:** 0 — Open (reference)
- **URL:** `https://meshverify.com/resources/pro-beauty-license-verification-cosmetology-barbering`
- **Data:** Links to all 50 state cosmetology board lookup portals
- **Socelle Use:** Reference for building state-by-state scraping pipeline

### 3.6 NPI Profile (Third-party NPI lookup)
- **Tier:** 0 — Open
- **URL:** `https://npiprofile.com`
- **Data:** NPI records with specialty taxonomy descriptions
- **Socelle Use:** Reference for taxonomy code → human-readable specialty mapping

---

## 4. EMPLOYMENT, ECONOMIC & EDUCATION

### 4.1 Bureau of Labor Statistics API v2
- **Tier:** 0 — Open
- **URL:** `https://api.bls.gov/publicAPI/v2/timeseries/data/`
- **Auth:** Free registration required
- **Rate Limits:** 500 requests/day, 50 series per request, 20-year history
- **SOC codes for beauty industry:**
  - `39-5012` — Hairdressers, Hairstylists, Cosmetologists
  - `39-5094` — Skincare Specialists
  - `39-5092` — Manicurists and Pedicurists
  - `39-5011` — Barbers
  - `39-5091` — Makeup Artists, Theatrical and Performance
  - `29-1171` — Nurse Practitioners (medspa providers)
  - `29-1029` — Surgeons (plastic surgery)
- **Data:** Employment levels, mean/median/percentile wages by metro area
- **Update:** Annual (OES data)
- **Socelle Use:** `labor_stats` table. Salary benchmarks, employment trends, job market intelligence.
- **Refresh:** Quarterly

### 4.2 Census Bureau APIs
- **Tier:** 0 — Open
- **URL:** `https://api.census.gov`
- **Auth:** Free API key required
- **Rate Limits:** 500 requests/day
- **NAICS codes for beauty businesses:**
  - `812112` — Beauty Salons (125,440+ establishments)
  - `812113` — Nail Salons
  - `812111` — Barber Shops
  - `812199` — Other Personal Care Services (day spas)
  - `611511` — Cosmetology and Barber Schools
  - `446120` — Cosmetics, Beauty Supplies, and Perfume Stores
  - `621111` — Offices of Physicians (cosmetic surgery, dermatology)
- **Datasets:** County Business Patterns (CBP) — establishment counts, employment, payroll by geography. American Community Survey (ACS) — demographics for market sizing.
- **Socelle Use:** `market_stats` table. Market snapshot pages, local intelligence.
- **Refresh:** Annual

### 4.3 College Scorecard API
- **Tier:** 0 — Open
- **URL:** `https://collegescorecard.ed.gov/data/`
- **Data:** Completion rates, post-graduation earnings, student debt for cosmetology/esthetics programs
- **CIP codes:**
  - `12.0401` — Cosmetology/Cosmetologist
  - `12.0409` — Aesthetician/Esthetician and Skin Care Specialist
  - `12.0408` — Facial Treatment Specialist
  - `12.0412` — Salon/Beauty Salon Management
- **Auth:** Free API key
- **Socelle Use:** Education intelligence, school quality signals for credential verification

---

## 5. PATENTS & INNOVATION

### 5.1 USPTO PatentsView
- **Tier:** 0 — Open
- **URL:** `https://patentsview.org`
- **Auth:** No API key required
- **Rate Limits:** No published limits
- **Data:** All US patents 1976–present
- **CPC codes for beauty:**
  - `A61K 8/` — Cosmetic/toilet preparations (formulations, ingredients)
  - `A61Q` — Specific cosmetic uses (A61Q 1/ makeup, A61Q 5/ hair care, A61Q 19/ skin care, A61Q 17/ sunscreen)
  - `A45D` — Hairdressing/shaving equipment and devices
  - `A61B 18/` — Surgical laser instruments
  - `A61N 5/` — Radiation therapy devices (beauty device applications)
- **Format:** JSON
- **Socelle Use:** `patents` table. Innovation tracking, emerging ingredient scores, beauty tech intelligence.
- **Refresh:** Monthly

### 5.2 European Patent Office OPS
- **Tier:** 0 — Open (basic tier)
- **URL:** `https://developers.epo.org`
- **Auth:** OAuth registration required
- **Rate Limits:** 4GB data/month free
- **Data:** 130M+ patent documents worldwide. Same CPC codes work.
- **Python client:** `python-epo-ops-client` on PyPI
- **Socelle Use:** Global patent coverage to supplement USPTO data

---

## 6. SOCIAL MEDIA & CONTENT

### 6.1 Instagram Graph API
- **Tier:** 1 — Free quota
- **URL:** Meta Developer Platform
- **Auth:** OAuth 2.0 via Facebook Business (Business/Creator account + linked Facebook Page)
- **Rate Limits:** ~200 requests/hour per token. 30 unique hashtag searches per 7-day rolling window.
- **Data:** Own-account insights (reach, impressions, engagement, follower demographics), public hashtag tracking
- **Hashtags to track:** #botox, #medspa, #esthetician, #skincareroutine, #laserhairremoval, #hydrafacial, #lipfiller, #microblading, #cosmetologist, #salonlife
- **Socelle Use:** `social_signals` table. Brand social presence, hashtag velocity, beauty trend signals.

### 6.2 YouTube Data API v3
- **Tier:** 1 — Free quota
- **URL:** `https://www.googleapis.com/youtube/v3/`
- **Auth:** API key for public data
- **Rate Limits:** 10,000 free units/day. `search.list` = 100 units (~100 searches/day). `videos.list` = 1 unit (10,000 lookups/day).
- **Data:** Video metadata, channel info, view counts, engagement, comments
- **Search queries:** beauty tutorials, skincare routines, medspa tours, cosmetic surgery reviews, salon transformations
- **Socelle Use:** `social_signals` table. Beauty video trend tracking, creator sentiment analysis.

### 6.3 Pinterest API v5
- **Tier:** 1 — Free quota
- **URL:** Pinterest Developer Platform
- **Auth:** OAuth 2.0 (approved apps)
- **Data:** Trend endpoints: `GET /trends/topics/featured`, `GET /trends/product_categories/trending`
- **Why critical:** 570M MAU, 69.4% female. Beauty product category trends emerge here BEFORE mainstream.
- **Socelle Use:** `trend_signals` table. Emerging product category detection, visual trend intelligence.

### 6.4 Reddit Data API
- **Tier:** 1 — Free quota (non-commercial: free. Commercial: $0.24/1,000 calls)
- **URL:** `https://oauth.reddit.com`
- **Auth:** OAuth 2.0 (free registration)
- **Rate Limits:** 100 queries/minute (non-commercial)
- **Beauty subreddits:** See Section 21 below for full list
- **Data:** Posts, comments, scores, author info, subreddit metadata
- **Socelle Use:** `social_signals` table. Sentiment mining, brand perception, treatment experiences, pricing intelligence from user reports.
- **Refresh:** Every 2 hours

### 6.5 TikTok Research API
- **Tier:** Restricted (academic only)
- **URL:** `https://developers.tiktok.com/doc/research-api-faq`
- **Rate Limits:** 1,000 requests/day
- **Data:** Video metadata, engagement, transcription
- **Caveat:** RESTRICTED to accredited academic researchers. No free commercial API.
- **Alternative:** Third-party services (Phyllo, EchoTik) for paid access
- **Socelle Use:** Future Tier 2 — TikTok beauty trend signals when budget allows

### 6.6 X (Twitter) API
- **Tier:** 2 — Paid ($200/month minimum for read access)
- **Data:** 15,000 tweet reads/month, 7-day search window on Basic plan
- **Caveat:** Free tier is write-only. No free read access.
- **Socelle Use:** Deprioritized. Reddit + Instagram + YouTube provide better beauty sentiment at lower cost.

### 6.7 GDELT Project
- **Tier:** 0 — Open
- **URL:** `https://blog.gdeltproject.org`
- **Auth:** None required
- **Rate Limits:** No registration needed
- **Data:** Global news monitoring in near-real-time. Article lists, timeline volume analysis, tone/sentiment, source geography.
- **Coverage:** Most recent 3 months, 250 records per query
- **Python client:** Returns Pandas DataFrames
- **Socelle Use:** `rss_items` table (or separate `news_signals`). Broad beauty industry media coverage, tone tracking.

---

## 7. SEARCH TRENDS

### 7.1 Google Trends (unofficial)
- **Tier:** 0 — Open (unofficial libraries)
- **Libraries:**
  - `pytrends-modern` (`github.com/yiromo/pytrends-modern`) — Recommended. RSS feed support, smart rate-limiting, async.
  - `pytrends` (`github.com/GeneralMills/pytrends`) — Original, widely used
- **Rate Limits:** ~1,400 requests before throttling, 60-second sleep between requests
- **Data:** Relative search interest (0–100 scale), related queries, rising queries, geographic breakdown
- **Caveat:** No official stable free API (Google alpha launched mid-2025). Subject to blocking.
- **Socelle Use:** `trend_signals` table. Treatment demand signals, ingredient trend velocity, geographic interest patterns.
- **Refresh:** Weekly

### 7.2 Google Trends RSS Feeds
- **Tier:** 0 — Open
- **URL pattern:** `https://trends.google.com/trending/rss?geo=US`
- **Data:** Daily trending search queries. Can filter by category.
- **Socelle Use:** Supplement to API-based trend tracking. Capture breaking beauty trends.

### 7.3 Glimpse
- **Tier:** 2 — Paid ($100+/month)
- **URL:** `https://meetglimpse.com`
- **Data:** Absolute search volumes (not just relative indices). More reliable than unofficial Google Trends access.
- **Socelle Use:** Future upgrade when budget allows. Converts trend signals into market-sizing metrics.

---

## 8. PLACES, LISTINGS & REVIEWS

### 8.1 Google Places API (New — post-March 2025)
- **Tier:** 1 — Free quota
- **URL:** Google Maps Platform
- **Auth:** API key
- **Rate Limits:** 10,000 Essentials requests/month + 5,000 Pro requests/month FREE
- **Beauty categories:** `beauty_salon`, `spa`, `hair_care`, `nail_salon`, `medical_clinics`
- **Data:** Ratings, review counts (5 "most relevant" reviews per request), photos, hours, address, phone, website
- **Caveats:** Reviews cannot be cached >30 days. Only 5 reviews per request.
- **Socelle Use:** `places` table. Business listing data for target metros. SLC + Wasatch Front as canonical reference city.
- **Refresh:** Monthly per metro (rotating)

### 8.2 Foursquare Places API
- **Tier:** 1 — Free quota
- **URL:** Foursquare Developer Platform
- **Rate Limits:** 10,000 free calls/month (Pro endpoints: search, details, autocomplete)
- **Data:** Business search, categories, address, coordinates
- **Caveats:** Premium data (photos, tips, hours, ratings) has no free tier.
- **Socelle Use:** Second source for business listing coverage. Cross-reference with Google Places.

### 8.3 Yelp Fusion API
- **Tier:** 2 — Paid (no free commercial tier since 2024)
- **URL:** `https://www.yelp.com/developers`
- **Pricing:** Starter at $7.99/1,000 calls. Only 3 review excerpts per business.
- **Full review text:** Requires private partner agreement
- **Beauty categories:** `beautysvc`, `skincare`, `spas`, `hair`, `medicalspa`, `nailsalons`
- **Socelle Use:** Deprioritized until budget allows. Google Places + Foursquare cover most needs.

### 8.4 Google Favicon API
- **Tier:** 0 — Open
- **URL:** `https://www.google.com/s2/favicons?domain=X&sz=16`
- **Data:** Website favicon icons
- **Auth:** None
- **Socelle Use:** Favicon icons on press/briefing cards and brand profiles (ported from Naturopathica pattern)

---

## 9. NEWS MONITORING

### 9.1 GDELT API
- (See Section 6.7 above — listed there as primary social/content source)

### 9.2 NewsAPI.ai
- **Tier:** 1 — Free quota
- **URL:** `https://newsapi.ai`
- **Free tier:** 2,000 free search tokens + 200,000 articles (past 30 days)
- **Data:** Full article content, sentiment analysis, event clustering, entity recognition across 150,000+ publishers
- **Socelle Use:** Supplementary news intelligence beyond RSS feeds

### 9.3 Google News RSS
- **Tier:** 0 — Open
- **URL pattern:** `https://news.google.com/rss/search?q=beauty+industry`
- **Data:** Topic-based and search-based news feeds. Unlimited.
- **Socelle Use:** `rss_items` table. Broad media coverage monitoring for beauty industry.

---

## 10. JOBS & HIRING SIGNALS

### 10.1 JSearch API (via RapidAPI)
- **Tier:** 1 — Free quota
- **URL:** `https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch`
- **Auth:** RapidAPI key
- **Rate Limits:** 100–500 requests/month (free tier)
- **Data:** Aggregates Google for Jobs data from LinkedIn, Indeed, Glassdoor, ZipRecruiter. 30+ data points per posting: title, company, salary, description, requirements, location.
- **Beauty search queries:** "esthetician", "cosmetologist", "medspa", "laser technician", "spa director", "salon manager", "injector", "cosmetic surgery coordinator", "beauty advisor", "brand educator"
- **Socelle Use:** `jobs` table (source='jsearch'). Primary job aggregation source.
- **Refresh:** Every 6 hours

### 10.2 Adzuna API
- **Tier:** 1 — Free quota
- **URL:** `https://developer.adzuna.com`
- **Auth:** Free registration
- **Rate Limits:** Generous free tier (varies by endpoint)
- **Data:** Job ads across US and UK. Salary data, historical trends.
- **Socelle Use:** `jobs` table (source='adzuna'). Secondary job aggregation source, salary benchmarks.
- **Refresh:** Every 6 hours

**Note:** Indeed API is now paid-only (deprecated free tier). LinkedIn API requires partnership approval. Glassdoor free API discontinued 2018.

---

## 11. RSS FEEDS — PROFESSIONAL BEAUTY / SPA

| # | Publication | Feed URL | Update Frequency |
|---|---|---|---|
| 11.1 | American Spa | `americanspa.com/rss.xml` | Daily |
| 11.2 | Salon Today | `salontoday.com/rss` | ~10 posts/day |
| 11.3 | Modern Salon | `modernsalon.com/rss` | Daily |
| 11.4 | Nails Magazine | `nailsmag.com/rss` | Weekly |
| 11.5 | Skin Inc | `skininc.com/rss` | Daily |
| 11.6 | Beauty Launchpad | `beautylaunchpad.com/rss` | Weekly |
| 11.7 | American Salon | `americansalon.com/rss` | Daily |
| 11.8 | NailPro | `nailpro.com/__rss/website-scheduled-content` | Weekly |
| 11.9 | Day Spa Association | `dayspaassociation.com/feed` | Weekly |
| 11.10 | Organic Spa Magazine | `organicspamagazine.com/feed` | Weekly |

---

## 12. RSS FEEDS — MEDSPA / AESTHETIC MEDICINE

| # | Publication | Feed URL | Update Frequency |
|---|---|---|---|
| 12.1 | Dermatology Times | `dermatologytimes.com/rss` | Daily |
| 12.2 | Aesthetic Authority | `aestheticauthority.com/rss` | Daily |
| 12.3 | Zwivel (cosmetic surgery) | `zwivel.com/blog/feed/` | Weekly |
| 12.4 | Healthline (aesthetics section) | `healthline.com/rss` | Daily |
| 12.5 | Plastic Surgery Practice | `plasticsurgerypractice.com/feed/` | Weekly |

---

## 13. RSS FEEDS — SKINCARE / BEAUTY BRANDS

| # | Publication | Feed URL | Update Frequency |
|---|---|---|---|
| 13.1 | CosmeticsDesign North America | `cosmeticsdesign.com/Info/CosmeticsDesign-USA-RSS` | Daily |
| 13.2 | CosmeticsDesign Europe | `cosmeticsdesign-europe.com/Info/CosmeticsDesign-Europe-RSS` | Daily |
| 13.3 | CosmeticsDesign Asia | `cosmeticsdesign-asia.com/Info/CosmeticsDesign-Asia-RSS` | Daily |
| 13.4 | Premium Beauty News | `premiumbeautynews.com/spip.php?page=backend` | Daily |
| 13.5 | Allure | `allure.com/feed/rss` | Daily |
| 13.6 | Vogue (main) | `vogue.com/feed/rss` | Daily |
| 13.7 | Into The Gloss | `feeds.feedburner.com/intothegloss/oqoU` | Weekly |
| 13.8 | Glossy | `glossy.co/feed/` | Daily |

---

## 14. RSS FEEDS — WELLNESS / HOLISTIC

| # | Publication | Feed URL | Update Frequency |
|---|---|---|---|
| 14.1 | MindBodyGreen | `mindbodygreen.com/0-4287/rss/feed.xml` | Daily |
| 14.2 | MindBodyGreen Featured | `mindbodygreen.com/rss/featured.xml` | Daily |
| 14.3 | Natural Products Insider | `naturalproductsinsider.com/rss` | Daily |
| 14.4 | Glamour | `glamour.com/feed/rss` | Daily |
| 14.5 | Elle | `elle.com/rss/all.xml/` | Daily |

---

## 15. RSS FEEDS — BEAUTY TECH / AI

| # | Publication | Feed URL | Update Frequency |
|---|---|---|---|
| 15.1 | TechCrunch (beauty tag) | `techcrunch.com/tag/beauty/feed/` | Irregular |
| 15.2 | CB Insights | `cbinsights.com/rss` | Weekly |
| 15.3 | Global Cosmetic Industry | `gcimagazine.com/rss` | Daily |

---

## 16. RSS FEEDS — COSMETIC / PLASTIC SURGERY

| # | Publication | Feed URL | Update Frequency |
|---|---|---|---|
| 16.1 | Zwivel | `zwivel.com/blog/feed/` | Weekly |
| 16.2 | Plastic Surgery Practice | `plasticsurgerypractice.com/feed/` | Weekly |

---

## 17. RSS FEEDS — TRADE / INDUSTRY

| # | Publication | Feed URL | Update Frequency |
|---|---|---|---|
| 17.1 | Beauty Packaging | `beautypackaging.com/rssfeeds/` | Weekly |
| 17.2 | Happi Magazine | `happi.com/rss` | Weekly |
| 17.3 | WWD Beauty | `wwd.com/beauty-industry-news/feed/` | Daily |
| 17.4 | Google News (beauty industry) | `news.google.com/rss/search?q=beauty+industry` | Continuous |
| 17.5 | Google News (medspa) | `news.google.com/rss/search?q=medspa+aesthetic+medicine` | Continuous |
| 17.6 | Google News (cosmetic surgery) | `news.google.com/rss/search?q=cosmetic+surgery+plastic+surgery` | Continuous |
| 17.7 | Google News (beauty tech) | `news.google.com/rss/search?q=beauty+technology+AI` | Continuous |

**Publications without RSS (require RSS.app or Feedly website-following for ingestion):**
Behind the Chair, Dermascope, ISPA, PBA, The Aesthetic Society, ASPS, AAFPRS, AmSpa, RealSelf, Beauty Independent, Cosmetics Business, Goop, CEW, Les Nouvelles Esthetiques, Perfect Corp, BoF

---

## 18. PUBLIC SCRAPING TARGETS — BOOKING / PRICING

| # | Platform | URL Pattern | Data Available | Access Method |
|---|---|---|---|---|
| 18.1 | Fresha | `fresha.com/a/{slug}-{id}` | Services, pricing, durations, staff, reviews, hours. JSON-LD structured data. | Standard HTTP (no headless browser) |
| 18.2 | Vagaro | `vagaro.com/{businessname}` | Services, pricing, staff bios, reviews, photos, daily deals | Headless browser (Playwright/Selenium) |
| 18.3 | Mindbody Public API | `api.mindbodyonline.com/public/v6` | Classes, services, staff, schedules, locations | Developer account ($11+/month) + Site IDs |
| 18.4 | GlossGenius | Public booking pages | Service names, pricing, staff | Headless browser |
| 18.5 | Square Appointments | Public booking pages | Services, pricing | Headless browser |
| 18.6 | Acuity Scheduling | Public booking pages | Services, pricing | Headless browser |
| 18.7 | Jane App | Public booking pages | Services, pricing, practitioner bios | Headless browser |

---

## 19. PUBLIC SCRAPING TARGETS — TREATMENT PRICING BENCHMARKS

| # | Source | URL | Data Available |
|---|---|---|---|
| 19.1 | RealSelf Cost Pages | `realself.com/cost` | Patient-reported all-inclusive costs for 100+ cosmetic procedures, by state and metro. Schema.org structured data. ~5.35M monthly visits. |
| 19.2 | BuildMyBod Health | `buildmybod.com/plastic-surgery-pricing` | Physician-reported procedure pricing by region (Midwest, South, Northeast, West, US Average). Injectables, surgical, non-surgical. Updated annually from 150+ providers. |
| 19.3 | ASPS/Aesthetic Society Annual Reports | `plasticsurgery.org/documents/news/statistics/` | Free downloadable PDFs. Procedure volumes, national average surgeon fees, YoY growth, demographics. |

---

## 20. PUBLIC SCRAPING TARGETS — PROVIDER DIRECTORIES

| # | Directory | URL | Data Available |
|---|---|---|---|
| 20.1 | RealSelf Doctor Directory | `realself.com/find/{specialty}/{location}` | Provider profiles, reviews, before/after photos, verified credentials |
| 20.2 | Healthgrades | `healthgrades.com` | Provider profiles, ratings, hospital affiliations, insurance |
| 20.3 | Zocdoc | `zocdoc.com` | Booking availability, patient reviews |
| 20.4 | ABMS Certification | `certificationmatters.org` | Board certification verification |
| 20.5 | State Cosmetology Boards | (See Section 3.3) | License verification for estheticians, cosmetologists, nail techs |

---

## 21. PUBLIC SCRAPING TARGETS — REDDIT COMMUNITIES

| # | Subreddit | Members | Intelligence Value |
|---|---|---|---|
| 21.1 | r/SkincareAddiction | ~2.2M | Product trends, ingredient preferences, brand sentiment |
| 21.2 | r/MakeupAddiction | ~3M | Makeup trends, product reviews, brand perception |
| 21.3 | r/AsianBeauty | ~1.5M | K-beauty/J-beauty trends, ingredient innovation |
| 21.4 | r/curlyhair | ~1M | Haircare product trends, brand sentiment |
| 21.5 | r/30PlusSkinCare | ~500K | Anti-aging trends, retinol/peptide discussions, medspa experiences |
| 21.6 | r/tretinoin | ~300K | Prescription skincare journeys, side effects |
| 21.7 | r/PlasticSurgery | ~200K | Procedure reviews, surgeon recommendations, cost discussions |
| 21.8 | r/Estheticians | ~100K | Treatment protocols, product sourcing, business advice |
| 21.9 | r/Botox | ~50K | Injector experiences, unit counts, regional pricing |
| 21.10 | r/MedSpa | ~20K | Business operations, treatment pricing, marketing |

---

## 22. OPEN-SOURCE REPOS TO SELF-HOST

| # | Repo | URL | Data | Socelle Use |
|---|---|---|---|---|
| 22.1 | SkincareAPI | `github.com/LauraRobertson/skincare-api` | ~2k skincare products with ingredients | Seed products table |
| 22.2 | nic-pan/skincare-ingredients | `github.com/nic-pan/skincare-ingredients` | Ingredients with skin types, concerns, interactions | Seed ingredient properties |
| 22.3 | BEAUTE E Dataset | `github.com/beauteeru/cosmetic-ingredients-dataset` | INCI ↔ CosIng ↔ CAS ↔ PubChem bridge | Seed identifier bridge table |
| 22.4 | NoxMoon/inside_beauty | `github.com/NoxMoon/inside_beauty` | Multi-table product datasets (skincare, body, makeup) | Additional product seed data |
| 22.5 | Open Beauty Facts Server | `github.com/openfoodfacts/openfoodfacts-server` | Full OBF platform code + data loaders | Reference for custom data loaders |
| 22.6 | DataCamp cosmetics.csv | Various Kaggle/GitHub | Brand, name, price, ingredients, skin-type flags | Prototype and seed dataset |

---

## 23. AI / TRY-ON APIs — FUTURE TIER 2

| # | Provider | Capabilities | Pricing | When to Add |
|---|---|---|---|---|
| 23.1 | Perfect Corp / YouCam | Skin analysis (image-based diagnostics), face analysis (shape/ratios), virtual try-on (makeup, hair, accessories), GenAI content API | Enterprise, pay-as-you-go | Post-launch, when brand tier gating is live |
| 23.2 | ModiFace (L'Oréal) | Virtual try-on, skin analysis, hair color simulation | Enterprise partnership | When L'Oréal brands are on platform |
| 23.3 | Banuba | Face AR SDK, virtual try-on, skin analysis | Developer pricing | Evaluating |
| 23.4 | Revieve | Digital skin advisor, product matching, try-on | Enterprise | Evaluating |

**Architecture note:** These attach as optional enrichers via secondary pgmq queue. Core pipeline runs without them. They activate per-brand for brands that pay higher-tier intelligence packages.

---

## 24. INDUSTRY CLASSIFICATION CODES

### NAICS (Census Bureau / County Business Patterns)
- `812112` — Beauty Salons
- `812113` — Nail Salons
- `812111` — Barber Shops
- `812199` — Other Personal Care Services (day spas)
- `611511` — Cosmetology and Barber Schools
- `446120` — Cosmetics, Beauty Supplies, and Perfume Stores
- `621111` — Offices of Physicians (cosmetic surgery, dermatology)

### SOC (BLS Employment)
- `39-5012` — Hairdressers, Hairstylists, Cosmetologists
- `39-5094` — Skincare Specialists
- `39-5092` — Manicurists and Pedicurists
- `39-5011` — Barbers
- `39-5091` — Makeup Artists
- `29-1171` — Nurse Practitioners
- `29-1029` — Surgeons

### CPC (Patents)
- `A61K 8/` — Cosmetic/toilet preparations
- `A61Q` — Specific cosmetic uses (A61Q 1/ makeup, A61Q 5/ hair, A61Q 19/ skin, A61Q 17/ sunscreen)
- `A45D` — Hairdressing/shaving equipment
- `A61B 18/` — Surgical laser instruments
- `A61N 5/` — Radiation therapy devices

### NPI Taxonomy
- `207N00000X` — Dermatology
- `207NS0135X` — Procedural Dermatology
- `208200000X` — Plastic Surgery
- `363L00000X` — Nurse Practitioner
- `363A00000X` — Physician Assistant

### CIP (Education)
- `12.0401` — Cosmetology/Cosmetologist
- `12.0409` — Aesthetician/Esthetician
- `12.0408` — Facial Treatment Specialist
- `12.0412` — Salon/Beauty Salon Management

---

## 25. GOOGLE TRENDS SEARCH TERMS TO TRACK

### Treatments
1. "botox near me"
2. "lip filler"
3. "hydrafacial"
4. "microneedling"
5. "laser hair removal"
6. "chemical peel"
7. "coolsculpting"
8. "PRP facial"
9. "medspa near me"
10. "dermaplaning"

### Ingredients
11. "retinol"
12. "niacinamide"
13. "hyaluronic acid"
14. "vitamin c serum"
15. "peptides skincare"
16. "bakuchiol"
17. "azelaic acid"
18. "salicylic acid"
19. "glycolic acid"
20. "tranexamic acid"

### Trends / Cultural
21. "clean beauty"
22. "glass skin"
23. "slugging"
24. "skin cycling"
25. "ozempic face"
26. "buccal fat removal"
27. "Korean skincare"
28. "beauty AI"
29. "at home laser"
30. "cosmetic surgery financing"

---

## 26. MISSING ITEMS IDENTIFIED IN FINAL AUDIT

These 5 items were identified as gaps after the main catalog was assembled. All are now incorporated.

### 26.1 First-Party App Telemetry (socelle.app_events)
- **Tier:** 0 — Internal (your own data)
- **Source:** Socelle app itself
- **Data:** User searches (treatments, ingredients, brands), page views, saved services, job applications, profile edits, poll responses, quiz completions, content engagement
- **Why critical:** This becomes a unique signal layer no competitor has — what providers are actually looking for right now
- **Schema:**
```sql
CREATE TABLE socelle.app_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id TEXT,
  event_name TEXT NOT NULL, -- search_treatment, view_brand, save_job, apply_job, view_ingredient, complete_poll, etc.
  event_props JSONB, -- {query: "hydrafacial", brand_id: "...", treatment: "botox", etc.}
  page_path TEXT,
  vertical TEXT,
  occurred_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_app_events_name ON socelle.app_events(event_name, occurred_at DESC);
CREATE INDEX idx_app_events_user ON socelle.app_events(user_id, occurred_at DESC);
```
- **Materialized view:** `mv_app_demand_signals` — aggregates search terms, trending treatments, most-viewed brands, job application velocity. Refreshed every 15 min alongside other MVs.
- **Refresh:** Continuous (inserts on every user action)

### 26.2 Education / Training Ecosystem (socelle.schools)
- **Tier:** 0 — Open (public records + College Scorecard)
- **Source:** College Scorecard API (CIP codes), state education board records, school websites
- **Data:** Cosmetology schools, esthetics institutes, beauty academies — name, location, programs, completion rates, post-grad earnings
- **Why critical:** Maps where talent is coming from. Enables recruitment intelligence for employers and dashboard features for schools later.
- **Schema:**
```sql
CREATE TABLE socelle.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  cip_codes TEXT[], -- 12.0401, 12.0409, 12.0408, 12.0412
  programs TEXT[], -- cosmetology, esthetics, nail_technology, salon_management
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'US',
  zip TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  website TEXT,
  type TEXT, -- cosmetology_school, esthetics_institute, community_college, university, online
  accreditation TEXT,
  completion_rate NUMERIC, -- from College Scorecard
  median_earnings_post_grad NUMERIC, -- from College Scorecard
  enrollment INTEGER,
  source_id UUID REFERENCES socelle.sources(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```
- **Refresh:** Annual (aligned with College Scorecard data release)

### 26.3 Account Plans / Access Gating (socelle.account_plans)
- **Tier:** Internal
- **Purpose:** Encodes who can see what at the intelligence level. Gates access to materialized views, raw tables, and premium API endpoints based on user role and subscription tier.
- **Schema:**
```sql
CREATE TABLE socelle.account_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL, -- maps to auth.users or a higher-level account
  role TEXT NOT NULL, -- provider, brand, investor, agency, employer
  plan TEXT NOT NULL, -- provider_free_verified, provider_unverified, brand_free, brand_pro, brand_enterprise, employer_free, employer_pro, investor_pro
  features JSONB, -- {full_brand_health: true, raw_social_signals: false, api_access: true, etc.}
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```
- **Use in RLS:** `plan` column gates access to MVs (e.g., `mv_brand_health` full data only for `brand_pro+`), raw signal tables (aggregate-only for free tiers), and premium API endpoints.

### 26.4 Materialized View: mv_provider_profile_strength
- **Purpose:** Recruitment matching and professional profile scoring
- **Inputs:** professional_profiles (experience, specialties, credentials), job_applications (engagement), app_events (activity)
- **Output fields:** provider_id, specialties_score, experience_score, credential_score, marketability_score, geography_match_score, profile_completeness, refreshed_at
- **Use:** Recommend providers to employers. Show providers their "profile strength" and what to improve. Power the AI job matching engine.
```sql
CREATE MATERIALIZED VIEW socelle.mv_provider_profile_strength AS
SELECT
  pp.id AS provider_id,
  pp.display_name,
  pp.state,
  array_length(pp.credentials, 1) AS credential_count,
  array_length(pp.specialties, 1) AS specialty_count,
  pp.experience_years,
  CASE
    WHEN pp.display_name IS NOT NULL AND pp.bio IS NOT NULL AND pp.resume_url IS NOT NULL
         AND array_length(pp.credentials, 1) > 0 AND array_length(pp.specialties, 1) > 0
    THEN 1.0
    WHEN pp.display_name IS NOT NULL AND (pp.bio IS NOT NULL OR pp.resume_url IS NOT NULL)
    THEN 0.6
    ELSE 0.3
  END AS profile_completeness,
  COALESCE(pp.experience_years, 0) * 0.2
    + COALESCE(array_length(pp.credentials, 1), 0) * 0.3
    + COALESCE(array_length(pp.specialties, 1), 0) * 0.2
    + CASE WHEN pp.resume_url IS NOT NULL THEN 0.15 ELSE 0 END
    + CASE WHEN pp.bio IS NOT NULL AND length(pp.bio) > 100 THEN 0.15 ELSE 0 END
  AS marketability_score,
  (SELECT COUNT(*) FROM socelle.job_applications ja WHERE ja.applicant_id = pp.user_id) AS total_applications,
  now() AS refreshed_at
FROM socelle.professional_profiles pp
WHERE pp.is_public = true;
CREATE UNIQUE INDEX ON socelle.mv_provider_profile_strength(provider_id);
```

### 26.5 Materialized View: mv_place_opportunity_index
- **Purpose:** Location intelligence for medspas/salons/brands choosing where to open or expand
- **Inputs:** market_stats (establishments), labor_stats (wages), providers (count by metro), jobs (open roles), trend_signals (local treatment demand)
- **Output fields:** geography_code, metro, opportunity_index (demand/supply ratio), beauty_establishments, provider_count, active_jobs, avg_wage, salary_pressure, refreshed_at
```sql
CREATE MATERIALIZED VIEW socelle.mv_place_opportunity_index AS
SELECT
  ms.geography_code,
  ms.geography AS metro,
  SUM(ms.establishment_count) AS beauty_establishments,
  (SELECT COUNT(*) FROM socelle.providers pr WHERE pr.address->>'state' = ms.geography_code) AS provider_count,
  (SELECT COUNT(*) FROM socelle.jobs j WHERE j.state = ms.geography_code AND j.status = 'active') AS active_jobs,
  (SELECT AVG(ls.mean_wage) FROM socelle.labor_stats ls WHERE ls.geography_code = ms.geography_code AND ls.soc_code IN ('39-5012', '39-5094')) AS avg_beauty_wage,
  -- Opportunity index: high job demand + low establishment count = high opportunity
  CASE
    WHEN SUM(ms.establishment_count) > 0 THEN
      (SELECT COUNT(*) FROM socelle.jobs j WHERE j.state = ms.geography_code AND j.status = 'active')::numeric
      / SUM(ms.establishment_count)
    ELSE 0
  END AS opportunity_index,
  now() AS refreshed_at
FROM socelle.market_stats ms
WHERE ms.naics_code IN ('812112', '812113', '812199')
GROUP BY ms.geography_code, ms.geography;
CREATE UNIQUE INDEX ON socelle.mv_place_opportunity_index(geography_code);
```

### 26.6 Brand-Owned Analytics Ingestion (socelle.brand_analytics)
- **Tier:** Internal (brand-supplied first-party data)
- **Purpose:** Brands that claim their profiles can optionally plug in their own GA4/Meta ad/email metrics for richer dashboards
- **Schema:**
```sql
CREATE TABLE socelle.brand_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES socelle.brands(id),
  metric_type TEXT NOT NULL, -- website_traffic, social_engagement, email_opens, ad_spend, ad_impressions
  metric_value NUMERIC,
  period_start DATE,
  period_end DATE,
  source TEXT, -- ga4, meta_ads, mailchimp, klaviyo, manual
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```
- **Access:** Only visible to the brand that owns it + admin. Gated by account_plans (brand_pro+).
- **Refresh:** Brand-supplied (manual upload or future API integration)

---

## SUMMARY COUNTS

| Category | Count |
|---|---|
| Free APIs (Tier 0) | 28 |
| Free-quota APIs (Tier 1) | 12 |
| Paid APIs (Tier 2) | 7 |
| Confirmed RSS feeds | 40 |
| Public scraping targets | 25 |
| Open-source repos to self-host | 6 |
| Reddit communities to monitor | 10 |
| Google Trends terms to track | 30 |
| Industry classification code systems | 5 |
| Internal / first-party data tables | 4 (app_events, schools, account_plans, brand_analytics) |
| Materialized views (intelligence layer) | 6 (brand_health, ingredient_emerging, market_snapshot, job_demand, provider_profile_strength, place_opportunity_index) |
| **Total unique data sources** | **90+ external + 4 internal** |
