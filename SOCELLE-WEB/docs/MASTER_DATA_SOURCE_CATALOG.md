# SOCELLE — MASTER DATA SOURCE CATALOG
Last Updated: 2026-03-06 (Session 37)
Source Authority: `docs/API_COMPLIANCE_RESEARCH.md`, `docs/api_compliance_supplement_20260306.md`, `docs/command/SOCELLE_DATA_PROVENANCE_POLICY.md`, `SOCELLE-WEB/docs/build_tracker.md`

> Every feed listed here routes through the Admin Feed Manager (`/admin/feeds`).
> Owner can toggle ON/OFF per feed, set poll intervals, add new sources at runtime.
> No feed goes live without admin toggle = ON.

---

## STATUS KEY
- ✅ WIRED — Edge function deployed, table exists, data flowing
- 🔧 WO EXISTS — Build tracker WO assigned, not yet executed
- 🆓 FREE — No API key needed, can wire immediately
- 🔑 KEY NEEDED — Requires API key provisioning by owner
- ⚠️ LEGAL — Needs legal/counsel review before use
- ⛔ DO NOT USE — No API exists or compliance block
- 🏪 BUSINESS AUTH — Operator must OAuth their own account (per-merchant)
- 🤝 PARTNER-GATED — Requires direct partnership/enrollment

---

## CATEGORY 1: ALREADY WIRED (16 sources)

| # | Source | Type | Edge Function | Table | Provenance Tier | Status |
|---|--------|------|---------------|-------|-----------------|--------|
| 1 | Internal orders/purchasing data | Platform | — | `orders`, `order_items` | Tier 1 | ✅ WIRED |
| 2 | Brand profiles + catalogs | Platform | — | `brands`, `products` | Tier 1 | ✅ WIRED |
| 3 | Operator profiles | Platform | — | `businesses` | Tier 1 | ✅ WIRED |
| 4 | Access requests (lead pipeline) | Platform | — | `access_requests` | Tier 1 | ✅ WIRED |
| 5 | Protocols + training modules | Platform | — | `canonical_protocols`, `brand_training_modules` | Tier 1 | ✅ WIRED |
| 6 | RSS trade publications (10 feeds) | RSS | `ingest-rss` | `rss_items` | Tier 2 | ✅ WIRED |
| 7 | RSS → Intelligence signals pipeline | Derived | `rss-to-signals` | `market_signals` | Tier 2 | ✅ WIRED |
| 8 | NPI Registry (CMS NPPES) | Gov API | `ingest-npi` | `businesses.npi_verified` | Tier 2 | ✅ WIRED |
| 9 | Open Beauty Facts (ingredients DB) | Open API | `open-beauty-facts-sync` | `ingredients` | Tier 2 | ✅ WIRED |
| 10 | Resend transactional email | SaaS | `send-email` | — | Tier 1 | ✅ WIRED |
| 11 | AI orchestrator + concierge | Internal | `ai-orchestrator`, `ai-concierge` | `ai_credit_ledger` | Tier 1 | ✅ WIRED |
| 12 | Sitemap generator | Internal | `sitemap-generator` | — | Tier 1 | ✅ WIRED |
| 13 | Intelligence briefing | Internal | `intelligence-briefing` | `market_signals` | Tier 1 | ✅ WIRED |
| 14 | Jobs search | Internal | `jobs-search` | `job_postings` | Tier 1 | ✅ WIRED |
| 15 | Events | Platform | — | `events` | Tier 1 | ✅ WIRED |
| 16 | Embeddings (vector search) | Internal | `generate-embeddings` | — | Tier 1 | ✅ WIRED |

---

## CATEGORY 2: FREE / OPEN APIs — NO KEY NEEDED (wire immediately)

### 2A: Government / Regulatory (Tier 2 — High Trust)

| # | API | Endpoint | What It Feeds | Rate Limit | Priority | WO |
|---|-----|----------|--------------|------------|----------|-----|
| 17 | **openFDA — MAUDE** (medical device adverse events) | `api.fda.gov/device/event` | Safety alerts, device incident signals | 240 req/min | HIGH | W11-06 |
| 18 | **openFDA — Drug Labels** | `api.fda.gov/drug/label` | Ingredient safety data, contraindications | 240 req/min | HIGH | W11-06 |
| 19 | **openFDA — Recalls** | `api.fda.gov/drug/enforcement` | Product recall alerts | 240 req/min | HIGH | W11-06 |
| 20 | **CPSC Recalls API** | `www.saferproducts.gov/RestWebServices` | Consumer product recall alerts | Open | HIGH | Needs WO |
| 21 | **ClinicalTrials.gov** | `clinicaltrials.gov/api/v2/studies` | Ingredient clinical trial data (dermatology, aesthetics) | Open | MED | Needs WO |
| 22 | **PubMed / NCBI E-Utilities** | `eutils.ncbi.nlm.nih.gov/entrez/eutils` | Research abstracts (ingredients, treatments, dermatology) | 3 req/sec (10 w/ free key) | MED | Needs WO |
| 23 | **USPTO PatentsView** | `api.patentsview.org/patents/query` | Beauty/skincare patent filings, innovation signals | Open | LOW | Needs WO |
| 24 | **BLS — Bureau of Labor Statistics** | `api.bls.gov/publicAPI/v2/timeseries/data` | Personal care industry employment, wage data | 25 req/day (500 w/ free key) | LOW | Needs WO |
| 25 | **Census County Business Patterns** | `api.census.gov/data/cbp` | Spa/salon establishment counts by ZIP/metro | Open | LOW | Needs WO |
| 26 | **Health Canada Recalls** | `recalls-rappels.canada.ca/en/search/site` | Canadian regulatory alerts | RSS/Open | MED | Needs WO |
| 27 | **TGA (Australia) Safety** | `tga.gov.au/safety` | Australian regulatory alerts | RSS | MED | Needs WO |
| 28 | **EU RAPEX Alerts** | `ec.europa.eu/safety-gate-alerts/screen/webReport` | EU product safety alerts | RSS/Open | MED | Needs WO |
| 29 | **FTC Press Releases** | `ftc.gov/news-events/news/press-releases` | US compliance/advertising enforcement | RSS | LOW | Needs WO |

### 2B: Academic / Clinical (Tier 2 — High Trust)

| # | API | Endpoint | What It Feeds | Rate Limit | Priority | WO |
|---|-----|----------|--------------|------------|----------|-----|
| 30 | **Europe PMC** | `europepmc.org/restfulapi` | European clinical/research abstracts | Open | MED | Needs WO |
| 31 | **Semantic Scholar** | `api.semanticscholar.org/graph/v1` | AI-powered paper discovery, citation analysis | 100 req/5min | LOW | Needs WO |
| 32 | **CrossRef** | `api.crossref.org/works` | DOI metadata, publication trends | Open (polite pool) | LOW | Needs WO |
| 33 | **OpenAlex** | `api.openalex.org` | Open scholarly metadata, concept trends | Open | LOW | Needs WO |

### 2C: RSS Feeds — Trade Publications (Tier 2 — Medium Trust)

> All RSS feeds route through existing `ingest-rss` → `rss-to-signals` pipeline.
> Adding a feed = INSERT into `data_feeds` table + admin toggle ON.

| # | Feed | URL Pattern | Category | Priority |
|---|------|------------|----------|----------|
| 34 | **Dermascope** | dermascope.com/rss | Trade pub | ✅ Already wired |
| 35 | **Modern Spa** | (in current 10-feed list) | Trade pub | ✅ Already wired |
| 36 | **SkinInc** | (in current 10-feed list) | Trade pub | ✅ Already wired |
| 37-40 | **Remaining 7 of original 10 feeds** | (in current list) | Trade pub | ✅ Already wired |
| 41 | **American Spa Magazine** | americanspa.com/rss | Trade pub | HIGH |
| 42 | **Spa Business Magazine** | spabusiness.com/rss | Trade pub | HIGH |
| 43 | **Global Wellness Institute** | globalwellnessinstitute.org/feed | Wellness | HIGH |
| 44 | **ISPA (Intl Spa Association)** | experienceispa.com/rss | Trade association | HIGH |
| 45 | **Cosmetics & Toiletries** | cosmeticsandtoiletries.com/rss | Ingredients | HIGH |
| 46 | **Cosmetics Design** | cosmeticsdesign.com/rss | Industry | HIGH |
| 47 | **Beauty Independent** | beautyindependent.com/feed | Brand news | HIGH |
| 48 | **Glossy.co** | glossy.co/feed | Beauty business | HIGH |
| 49 | **Beauty Matter** | beautymatter.com/feed | Brand news | MED |
| 50 | **WWD Beauty** | wwd.com/beauty-industry-news/feed | Fashion/beauty | MED |
| 51 | **Allure** | allure.com/feed/rss | Consumer trends | MED |
| 52 | **Byrdie** | byrdie.com/feed | Consumer treatments | MED |
| 53 | **MedEsthetics** | medestheticsmag.com/rss | MedSpa clinical | HIGH |
| 54 | **Dermatology Times** | dermatologytimes.com/rss | Clinical | MED |
| 55 | **JAMA Dermatology** | jamanetwork.com/rss/site_136/67.xml | Academic | MED |
| 56 | **Journal of Cosmetic Dermatology** | (Wiley RSS) | Academic | MED |
| 57 | **Practical Dermatology** | practicaldermatology.com/rss | Clinical | MED |
| 58 | **The Dermatologist** | the-dermatologist.com/rss | Clinical | MED |

### 2D: RSS Feeds — Regulatory / Safety

| # | Feed | URL Pattern | Category | Priority |
|---|------|------------|----------|----------|
| 59 | **FDA MedWatch** | fda.gov/about-fda/contact-fda/stay-informed/rss-feeds | Safety alerts | HIGH |
| 60 | **FDA Cosmetics Guidance** | fda.gov/cosmetics (RSS) | Regulatory | HIGH |
| 61 | **Health Canada Recalls RSS** | recalls-rappels.canada.ca (RSS) | Regulatory (CA) | MED |
| 62 | **TGA Safety RSS (Australia)** | tga.gov.au (RSS) | Regulatory (AU) | MED |
| 63 | **EU RAPEX Consumer Alerts** | ec.europa.eu (RSS) | Regulatory (EU) | MED |
| 64 | **FTC Press Releases** | ftc.gov (RSS) | Compliance | LOW |
| 65 | **State Board — California** | barbercosmo.ca.gov (RSS/scrape) | Licensing | LOW |
| 66 | **State Board — New York** | dos.ny.gov (RSS/scrape) | Licensing | LOW |
| 67 | **State Board — Texas** | tdlr.texas.gov (RSS/scrape) | Licensing | LOW |
| 68 | **State Board — Florida** | myfloridalicense.com (RSS/scrape) | Licensing | LOW |

### 2E: RSS Feeds — Press Releases / Wire Services

| # | Feed | URL Pattern | Category | Priority |
|---|------|------------|----------|----------|
| 69 | **PRNewswire — Beauty** | prnewswire.com/rss/beauty (filtered) | Brand press releases | HIGH |
| 70 | **BusinessWire — Personal Care** | businesswire.com/rss (filtered) | Company announcements | MED |
| 71 | **GlobeNewsWire — Health/Beauty** | globenewswire.com/rss (filtered) | Industry press releases | MED |

### 2F: RSS Feeds — Brand-Specific Blog/News

| # | Feed | Brand | Priority |
|---|------|-------|----------|
| 72 | Naturopathica blog RSS | Naturopathica | MED |
| 73 | Dermalogica blog RSS | Dermalogica | MED |
| 74 | SkinCeuticals blog RSS | SkinCeuticals | MED |
| 75 | iS Clinical blog RSS | iS Clinical | MED |
| 76 | Environ blog RSS | Environ | LOW |
| 77 | PCA Skin blog RSS | PCA Skin | LOW |
| 78 | Eminence blog RSS | Eminence Organic | LOW |
| 79 | HydraFacial blog RSS | HydraFacial | LOW |
| 80 | Glo Skin Beauty blog RSS | Glo Skin Beauty | LOW |
| 81 | Image Skincare blog RSS | Image Skincare | LOW |
| 82 | Circadia blog RSS | Circadia | LOW |
| 83 | Biologique Recherche news | Biologique Recherche | LOW |
| 84 | ZO Skin Health blog RSS | ZO Skin Health | LOW |
| 85 | SkinMedica blog RSS | SkinMedica | LOW |
| 86 | Obagi blog RSS | Obagi Medical | LOW |
| 87 | Jan Marini blog RSS | Jan Marini | LOW |
| 88 | Revision Skincare blog RSS | Revision Skincare | LOW |
| 89 | Alastin blog RSS | Alastin Skincare | LOW |
| 90 | DefenAge blog RSS | DefenAge | LOW |
| 91 | EltaMD blog RSS | EltaMD | LOW |

### 2G: RSS Feeds — Ingredient Suppliers

| # | Feed | Supplier | Priority |
|---|------|----------|----------|
| 92 | BASF Care Chemicals news | BASF | LOW |
| 93 | Ashland Specialty Ingredients | Ashland | LOW |
| 94 | Evonik Care Solutions | Evonik | LOW |
| 95 | DSM-Firmenich Personal Care | DSM | LOW |
| 96 | Seppic news | Seppic (Air Liquide) | LOW |
| 97 | Lubrizol Life Science Beauty | Lubrizol | LOW |
| 98 | Croda Personal Care | Croda | LOW |
| 99 | Symrise Cosmetic Ingredients | Symrise | LOW |
| 100 | Givaudan Active Beauty | Givaudan | LOW |

### 2H: RSS Feeds — Regional / International

| # | Feed | Region | Priority |
|---|------|--------|----------|
| 101 | UK Aesthetics Journal | UK | MED |
| 102 | AU Beauty Biz | Australia | MED |
| 103 | Professional Beauty (UK) | UK | MED |
| 104 | Professional Beauty (AU) | Australia | MED |
| 105 | Spa + Clinic (AU) | Australia | LOW |
| 106 | Gulf Beauty Magazine (UAE) | UAE | LOW |
| 107 | Asia Spa Magazine | Asia | LOW |
| 108 | European Spa Magazine | EU | LOW |
| 109 | Spa Asia (SEA) | Southeast Asia | LOW |
| 110 | Canadian Spa Magazine | Canada | LOW |

### 2I: RSS Feeds — Spa Associations / Orgs

| # | Feed | Organization | Priority |
|---|------|-------------|----------|
| 111 | AmSpa (American Med Spa Association) | US | HIGH |
| 112 | CIDESCO news | International | MED |
| 113 | NCEA (National Coalition of Estheticians) | US | MED |
| 114 | ASCP (Associated Skin Care Professionals) | US | MED |
| 115 | ABMP (Associated Bodywork & Massage) | US | LOW |
| 116 | ICA (Intl Congress of Esthetics) | International | LOW |
| 117 | Les Nouvelles Esthétiques | International | LOW |
| 118 | BABTAC (UK) | UK | LOW |
| 119 | Spa & Wellness Association of Canada | Canada | LOW |
| 120 | Day Spa Association | US | LOW |

---

## CATEGORY 3: NEED API KEYS (owner must provision)

### 3A: Intelligence Feeds — Priority 1

| # | API | What It Feeds | Key Type | Free Tier | Cost (Paid) | WO |
|---|-----|--------------|----------|-----------|-------------|-----|
| 121 | **Google Trends API** | Beauty search term trending (30+ terms) | Google Cloud API key | Unofficial (pytrends) | $0 (scraping) or SerpAPI $50/mo | W11-01 |
| 122 | **NewsAPI** | Real news articles → intelligence feed | API key | 100 req/day | $449/mo (business) | W11-02 |
| 123 | **GNews** (alternative to NewsAPI) | Same — news articles | API key | 100 req/day | $84/mo (basic) | W11-02 |
| 124 | **Google Places API** | Operator enrichment (reviews, photos, hours, ratings) | Google Cloud API key | $200/mo credit | $17/1K requests | W11-07 |
| 125 | **Yelp Fusion API** | Operator reviews + ratings | Yelp API key | 5000 calls/day | Free | W11-07 |
| 126 | **PubMed API key** (optional — higher limits) | Research abstracts at scale | NCBI API key | 3 req/sec | 10 req/sec w/ free key | Needs WO |

### 3B: Jobs Expansion — Priority 2

| # | API | What It Feeds | Key Type | Free Tier | Cost (Paid) | WO |
|---|-----|--------------|----------|-----------|-------------|-----|
| 127 | **JSearch (RapidAPI)** | External job aggregation (Indeed, LinkedIn, ZipRecruiter) | RapidAPI key | 500 req/mo | $30/mo (10K) | Needs WO |
| 128 | **Adzuna API** | International job listings (UK, CA, AU, NZ) | API key | Free for publishers | Free | Needs WO |
| 129 | **The Muse API** | Curated professional job listings | API key | Free (limited) | Contact | Needs WO |
| 130 | **Remotive API** | Remote beauty/wellness jobs | API key | Free | Free | Needs WO |

### 3C: Social / Content Signals — Priority 3

| # | API | What It Feeds | Key Type | Free Tier | Cost (Paid) | WO |
|---|-----|--------------|----------|-----------|-------------|-----|
| 131 | **YouTube Data API** | Beauty video trend signals, channel analytics | Google Cloud API key | 10K units/day | Free | Needs WO |
| 132 | **Reddit API** | Beauty/skincare subreddit trends (r/SkincareAddiction, r/Estheticians) | OAuth client_id + secret | 60 req/min | Free | Needs WO |
| 133 | **Instagram Graph API** | Public hashtag volumes, brand follower counts | Facebook Developer App | Rate limited | Free | Needs WO |
| 134 | **TikTok Research API** | Beauty trend hashtags (#skincare, #medspa, etc.) | Research application | Approved researchers | Free | Needs WO |
| 135 | **Pinterest API** | Beauty/wellness pin volume trends | Developer app | Rate limited | Free | Needs WO |
| 136 | **Eventbrite API** | Industry event discovery + enrichment | OAuth token | Rate limited | Free | Needs WO |
| 137 | **Meetup API** | Local spa/beauty professional meetups | API key | Rate limited | Free | Needs WO |

### 3D: Market Data — Priority 3

| # | API | What It Feeds | Key Type | Free Tier | Cost (Paid) | WO |
|---|-----|--------------|----------|-----------|-------------|-----|
| 138 | **Google Keyword Planner** (via Ads API) | Search volume for beauty terms | Google Ads account | Free with account | Free | Needs WO |
| 139 | **SimilarWeb API** | Competitor website traffic estimates | API key | Limited free | $$$$ (enterprise) | Needs WO |
| 140 | **Crunchbase API** | Beauty brand funding/M&A signals | API key | Limited free | $29/mo basic | Needs WO |
| 141 | **SEC EDGAR** | Public beauty company filings (ELF, Ulta, etc.) | Open (EDGAR) | Open | Free | Needs WO |

---

## CATEGORY 4: BOOKING PLATFORM INTEGRATIONS (operator-authorized, per-merchant OAuth)

> These require each operator to connect their own account.
> They are NOT intelligence feeds — they are operator tools.
> Saved for LAST per owner instruction.

### 4A: SAFE (compliance cleared)

| # | Platform | Classification | Key Type | WO | Status |
|---|----------|---------------|----------|-----|--------|
| 142 | **Square** | SAFE WITH BUSINESS AUTH | OAuth App ID + Secret | W11-13 | ⛔ BLOCKED (token storage) |
| 143 | **SimplyBook.me** | SAFE WITH BUSINESS AUTH | Per-merchant API key | Needs WO | Not started |
| 144 | **Pike13** | SAFE WITH BUSINESS AUTH | OAuth | Needs WO | Not started |
| 145 | **Wix Bookings** | SAFE WITH BUSINESS AUTH | Wix SDK (MIT) | Needs WO | Not started |
| 146 | **Boulevard** | SAFE WITH BUSINESS AUTH | book-sdk (MIT) | Needs WO | Not started |

### 4B: NEEDS LEGAL REVIEW

| # | Platform | Classification | Issue | WO |
|---|----------|---------------|-------|-----|
| 147 | **Mindbody** | NEEDS COUNSEL | Non-sublicensable SDK (NO-LICENSE on GitHub) | Needs WO |
| 148 | **Vagaro** | NEEDS COUNSEL | No API-specific ToS found | Needs WO |
| 149 | **Acuity Scheduling** | NEEDS COUNSEL | Squarespace Developer Terms apply | Needs WO |
| 150 | **Phorest** | NEEDS COUNSEL | Manual API grant, no public SDK | Needs WO |
| 151 | **Schedulicity** | NEEDS COUNSEL | WAF-blocked, can't verify ToS | Needs WO |

### 4C: PARTNER-GATED

| # | Platform | Classification | Requirement | WO |
|---|----------|---------------|-------------|-----|
| 152 | **Reserve with Google** | PARTNER-GATED | Google partnership agreement | Needs WO |
| 153 | **Salesforce Commerce Cloud** | PARTNER-GATED | AppExchange enrollment | Needs WO |
| 154 | **SkinCeuticals (L'Oréal)** | PARTNER-GATED | Direct L'Oréal engagement | Needs WO |

### 4D: DO NOT USE (no API exists)

| # | Platform | Reason |
|---|----------|--------|
| 155 | Naturopathica | No API; manual B2B ordering |
| 156 | Dermalogica | No API; web portal only |
| 157 | PCA Skin | No API; professional portal only |
| 158 | SkinMedica (Allergan) | Brilliant Connections = managed storefront, not API |
| 159 | Obagi Medical | No API; manual professional account |
| 160 | iS Clinical | No API; distributor-based |
| 161 | Eminence Organic | No API; spa distribution |
| 162 | Circadia | No API; licensed provider distribution |
| 163 | Image Skincare | No API; 30K+ pro network, no dev access |
| 164 | Biologique Recherche | Exclusive distribution; no API |
| 165 | HydraFacial | Proprietary device software; no public API |
| 166 | Candela Medical | Medical device; OEM/partner only |
| 167 | Lumenis | PartnerZone is content only; no API |
| 168 | Allergan Aesthetics | Closed loyalty + HCP systems; no public API |
| 169 | Galderma | ASPIRE EMR integration not public |
| 170 | Merz Aesthetics | Closed ordering portal; no public API |
| 171 | Setmore | 404 all paths; no API |
| 172 | HoneyBook | No API; out of scope |
| 173 | ClassPass | 403/blocked; no public API |

---

## CATEGORY 5: E-COMMERCE PLATFORMS (operator-authorized, per-merchant)

> Only used when an operator connects their own store.
> LAST PRIORITY per owner instruction.

| # | Platform | Classification | SDK License | WO |
|---|----------|---------------|-------------|-----|
| 174 | **Shopify** | SAFE WITH BUSINESS AUTH | MIT | Needs WO |
| 175 | **BigCommerce** | SAFE WITH BUSINESS AUTH | MIT (likely) | Needs WO |
| 176 | **WooCommerce** | SAFE WITH BUSINESS AUTH | GPL-2.0 / MIT | Needs WO |
| 177 | **Lightspeed Commerce** | SAFE WITH BUSINESS AUTH | Community | Needs WO |
| 178 | **Magento / Adobe Commerce** | SAFE WITH BUSINESS AUTH | OSL 3.0 | Needs WO |

---

## AUDIT SUMMARY

| Category | Count | Key Needed? | Priority |
|----------|-------|------------|----------|
| 1. Already wired | 16 | — | ✅ Done |
| 2. Free / open APIs | 104 | NO | 🟢 Wire now |
| 3. Need API keys | 21 | YES | 🔑 Owner provisions |
| 4. Booking platforms | 22 | Per-merchant OAuth | 🔴 Last |
| 5. E-commerce platforms | 5 | Per-merchant OAuth | 🔴 Last |
| **TOTAL** | **168** | | |

### What You Need To Provision (API Keys)

| # | Service | Key Steps | Estimated Time |
|---|---------|-----------|----------------|
| 1 | **Google Cloud project** | console.cloud.google.com → Enable: Trends, Places, YouTube Data, Keyword Planner | 15 min |
| 2 | **NewsAPI or GNews** | newsapi.org/register OR gnews.io/register | 5 min |
| 3 | **Yelp Fusion** | yelp.com/developers → Create App | 5 min |
| 4 | **PubMed/NCBI** | ncbi.nlm.nih.gov/account → API key | 5 min |
| 5 | **Reddit** | reddit.com/prefs/apps → Create app (script type) | 5 min |
| 6 | **JSearch (RapidAPI)** | rapidapi.com → Subscribe to JSearch | 5 min |
| 7 | **Adzuna** | developer.adzuna.com → Register | 5 min |
| 8 | **Instagram Graph API** | developers.facebook.com → Create App | 15 min |
| 9 | **Crunchbase** | data.crunchbase.com → Basic API | 5 min |
| 10 | **Eventbrite** | eventbrite.com/platform → Create App | 5 min |

**Total provisioning time: ~1.5 hours for all 10 services**

---

## ARCHITECTURE: ADMIN FEED MANAGER

### New Table: `data_feeds`
```sql
CREATE TABLE data_feeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  feed_type text NOT NULL CHECK (feed_type IN ('rss', 'api', 'webhook', 'scraper')),
  category text NOT NULL CHECK (category IN (
    'trade_pub', 'regulatory', 'academic', 'social',
    'jobs', 'events', 'ingredients', 'brand_news',
    'press_release', 'association', 'supplier',
    'regional', 'government', 'market_data'
  )),
  endpoint_url text,
  api_key_env_var text,          -- e.g. 'NEWSAPI_KEY' — references Supabase secret
  poll_interval_minutes int DEFAULT 60,
  is_enabled boolean DEFAULT false,   -- YOUR ON/OFF SWITCH
  provenance_tier int DEFAULT 2 CHECK (provenance_tier IN (1, 2, 3)),
  attribution_label text,
  last_fetched_at timestamptz,
  last_error text,
  signal_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS: admin only
ALTER TABLE data_feeds ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_only ON data_feeds
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

### New Admin Page: `/admin/feeds`
- Toggle grid: every feed with ON/OFF switch
- Add new feed form (name, URL, type, category, interval)
- Status dashboard: last fetch time, error count, signal count per feed
- Category filters + search
- Bulk enable/disable by category

### New Edge Function: `feed-orchestrator`
- Reads `data_feeds WHERE is_enabled = true`
- Groups by feed_type, dispatches to appropriate ingestor
- Logs results: signal_count, last_fetched_at, last_error
- Replaces hardcoded feed URLs in current `ingest-rss`

---

*Compiled from: API_COMPLIANCE_RESEARCH.md (23 entries), api_compliance_supplement_20260306.md (9 entries), SOCELLE_DATA_PROVENANCE_POLICY.md (tier framework), build_tracker.md (existing WOs + API key table), codebase audit (16 deployed edge functions)*
