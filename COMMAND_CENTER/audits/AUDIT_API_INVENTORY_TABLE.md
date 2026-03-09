# SOCELLE API INVENTORY — QUICK REFERENCE TABLE
**Date:** March 7, 2026
**Format:** Sortable summary table of all APIs, feeds, and data sources

---

## DECLARED vs IMPLEMENTED — MASTER INVENTORY

| # | Source Name | Type | Tier | URL/Endpoint | In Catalog | In Code | Wave Status | Notes |
|---|---|---|---|---|---|---|---|---|
| **PRODUCTS & INGREDIENTS** |
| 1 | Open Beauty Facts API | Product data | 0 | https://world.openbeautyfacts.org/api/v2/ | ✅ | ❌ | TBD | Not implemented |
| 2 | EU CosIng Database | Ingredient DB | 0 | https://data.europa.eu | ✅ | ❌ | TBD | CSV download, not API |
| 3 | PubChem PUG REST | Chemical properties | 0 | https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest | ✅ | ❌ | TBD | Rate limited |
| 4 | CosIng API (API Store) | Ingredients | 0 | https://api.store/... | ✅ | ❌ | TBD | Via API Store |
| 5 | COSMILE Europe INCI | Ingredient data | 0 | https://cosmileeurope.eu/inci/ | ✅ | ❌ | TBD | Scrapeable |
| 6 | Makeup API | Product catalog | 0 | https://makeup-api.herokuapp.com/ | ✅ | ❌ | TBD | Static dataset |
| 7 | UPCitemdb API | Barcode lookup | 1 | https://www.upcitemdb.com/api | ✅ | ❌ | TBD | 100 req/day free |
| 8 | BEAUTE E Dataset | Ingredient mappings | 0 | https://github.com/beauteeru/cosmetic-ingredients-dataset | ✅ | ❌ | TBD | CSV/JSON |
| 9 | SkincareAPI | Product data | 0 | https://github.com/LauraRobertson/skincare-api | ✅ | ❌ | TBD | Self-hostable |
| 10 | skincare-ingredients | Ingredient interactions | 0 | https://github.com/nic-pan/skincare-ingredients | ✅ | ❌ | TBD | Self-hostable |
| 11 | inside_beauty | Product datasets | 0 | https://github.com/NoxMoon/inside_beauty | ✅ | ❌ | TBD | Self-hostable |
| **SAFETY & RESEARCH** |
| 12 | openFDA API | Safety events | 0 | https://open.fda.gov/apis/ | ✅ | ❌ | W10-03 | Botox, Juvederm, etc. |
| 13 | PubMed E-utilities | Citations | 0 | https://eutils.ncbi.nlm.nih.gov/entrez/eutils/ | ✅ | ❌ | TBD | 36M+ citations |
| 14 | ClinicalTrials.gov API | Clinical trials | 0 | https://clinicaltrials.gov/api/v2/studies | ✅ | ❌ | W10-05 | Aesthetic trials |
| 15 | NIH RePORTER | Research grants | 0 | https://api.reporter.nih.gov | ✅ | ❌ | TBD | Grant funding data |
| **PROVIDERS & LICENSING** |
| 16 | NPI Registry API | Provider licensing | 0 | https://npiregistry.cms.hhs.gov/api/ | ✅ | ❌ | TBD | 200 results/page |
| 17 | NIH Clinical Tables NPI | Provider autocomplete | 0 | https://clinicaltables.nlm.nih.gov/apidoc/npi_idv/v3/ | ✅ | ❌ | TBD | NPI search |
| 18 | State Cosmetology Boards | License verification | 0 | Various URLs per state | ✅ | ❌ | TBD | Web scraping required |
| 19 | ABMS Certification | Physician creds | 0 | https://certificationmatters.org | ✅ | ❌ | TBD | Scraping required |
| 20 | MeshVerify | License aggregator | 0 | https://meshverify.com/resources/... | ✅ | ❌ | TBD | Links to state portals |
| 21 | NPI Profile | NPI lookup | 0 | https://npiprofile.com | ✅ | ❌ | TBD | Reference tool |
| **EMPLOYMENT & ECONOMY** |
| 22 | BLS API v2 | Labor statistics | 0 | https://api.bls.gov/publicAPI/v2/ | ✅ | ❌ | TBD | 500 req/day free |
| 23 | Census Bureau API | Market sizing | 0 | https://api.census.gov | ✅ | ❌ | TBD | 500 req/day free |
| 24 | College Scorecard | Education data | 0 | https://collegescorecard.ed.gov/data/ | ✅ | ❌ | TBD | Cosmetology programs |
| **PATENTS & INNOVATION** |
| 25 | USPTO PatentsView | Patent data | 0 | https://patentsview.org | ✅ | ❌ | TBD | US patents 1976+ |
| 26 | European Patent Office | International patents | 0 | https://developers.epo.org | ✅ | ❌ | TBD | 4GB/mo free |
| **SOCIAL MEDIA & CONTENT** |
| 27 | Instagram Graph API | Social metrics | 1 | https://developers.facebook.com | ✅ | ❌ | TBD | 30 hashtag searches/week |
| 28 | YouTube Data API v3 | Video trends | 1 | https://www.googleapis.com/youtube/v3/ | ✅ | ❌ | TBD | 10K units/day free |
| 29 | Pinterest API v5 | Trend endpoints | 1 | https://api.pinterest.com | ✅ | ❌ | TBD | Approved apps only |
| 30 | Reddit Data API | Social sentiment | 1 | https://oauth.reddit.com | ✅ | ❌ | TBD | 100 req/min free |
| 31 | TikTok Research API | Video metadata | Restricted | https://developers.tiktok.com | ✅ | ❌ | TBD | Academic only |
| 32 | X/Twitter API | Social listening | 2 | https://api.twitter.com | ✅ | ❌ | TBD | $200+/mo |
| 33 | GDELT Project | News monitoring | 0 | https://blog.gdeltproject.org | ✅ | ❌ | TBD | 3-month window |
| **SEARCH TRENDS** |
| 34 | Google Trends (pytrends) | Search trends | 0 | Unofficial library | ✅ | ❌ | TBD | Rate-limited |
| 35 | Google Trends RSS | Trending queries | 0 | https://trends.google.com/trending/rss | ✅ | ❌ | TBD | Daily feeds |
| 36 | Glimpse | Search volumes | 2 | https://meetglimpse.com | ✅ | ❌ | Future | $100+/mo |
| **PLACES & REVIEWS** |
| 37 | Google Places API | Business listings | 1 | https://developers.google.com/maps/documentation/places | ✅ | ❌ | TBD | 10K free req/mo |
| 38 | Foursquare Places API | Location data | 1 | https://foursquare.com/developer/docs | ✅ | ❌ | TBD | 10K free calls/mo |
| 39 | Yelp Fusion API | Business reviews | 2 | https://www.yelp.com/developers | ✅ | ❌ | TBD | $7.99+/1K calls |
| 40 | Google Favicon API | Website icons | 0 | https://www.google.com/s2/favicons | ✅ | ❌ | TBD | Brand logo icons |
| **NEWS MONITORING** |
| 41 | NewsAPI.ai | News aggregation | 1 | https://newsapi.ai | ✅ | ❌ | TBD | 2K free tokens/mo |
| 42 | Google News RSS | News feeds | 0 | https://news.google.com/rss/ | ✅ | ❌ | TBD | Unlimited |
| **JOBS & HIRING** |
| 43 | JSearch API (RapidAPI) | Job aggregation | 1 | https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch | ✅ | ✅ | W10-06 | 100-500 req/mo free |
| **RSS FEEDS — PROFESSIONAL BEAUTY/SPA** |
| 44 | Beauty/Spa Feed 1 | RSS | 0 | Various | ✅ | 🔲 Schema only | TBD | 10 feeds declared |
| ... | ... | ... | ... | ... | ✅ | 🔲 Schema only | TBD | (see catalog for full list) |
| **RSS FEEDS — MEDSPA/AESTHETICS** |
| 54 | Medspa Feed 1 | RSS | 0 | Various | ✅ | 🔲 Schema only | TBD | 5 feeds declared |
| ... | ... | ... | ... | ... | ✅ | 🔲 Schema only | TBD | (see catalog for full list) |
| **RSS FEEDS — SKINCARE/BRANDS** |
| 59 | Brand Feed 1 | RSS | 0 | Various | ✅ | 🔲 Schema only | TBD | 8 feeds declared |
| ... | ... | ... | ... | ... | ✅ | 🔲 Schema only | TBD | (see catalog for full list) |
| **RSS FEEDS — WELLNESS/HOLISTIC** |
| 67 | Wellness Feed 1 | RSS | 0 | Various | ✅ | 🔲 Schema only | TBD | 5 feeds declared |
| ... | ... | ... | ... | ... | ✅ | 🔲 Schema only | TBD | (see catalog for full list) |
| **RSS FEEDS — BEAUTY TECH/AI** |
| 72 | Tech Feed 1 | RSS | 0 | Various | ✅ | 🔲 Schema only | TBD | 3 feeds declared |
| ... | ... | ... | ... | ... | ✅ | 🔲 Schema only | TBD | (see catalog for full list) |
| **RSS FEEDS — COSMETIC/PLASTIC SURGERY** |
| 75 | Surgery Feed 1 | RSS | 0 | Various | ✅ | 🔲 Schema only | TBD | 2 feeds declared |
| ... | ... | ... | ... | ... | ✅ | 🔲 Schema only | TBD | (see catalog for full list) |
| **RSS FEEDS — TRADE/INDUSTRY** |
| 77 | Trade Feed 1 | RSS | 0 | Various | ✅ | 🔲 Schema only | TBD | 7 feeds declared |
| ... | ... | ... | ... | ... | ✅ | 🔲 Schema only | TBD | (see catalog for full list) |
| **SCRAPING TARGETS — BOOKING** |
| 84 | Mindbody | Booking scrape | 1 | https://www.mindbody.io | ✅ | ❌ | TBD | 7 scrape targets |
| 85 | Vagaro | Booking scrape | 1 | https://www.vagaro.com | ✅ | ❌ | TBD | Partner-gated API |
| 86 | Acuity Scheduling | Booking scrape | 1 | https://acuity.schedulingonline.com | ✅ | ❌ | TBD | Via SDK |
| ... | ... | ... | ... | ... | ✅ | ❌ | TBD | (7 targets total) |
| **SCRAPING TARGETS — PRICING BENCHMARKS** |
| 91 | Spa pricing sites | Pricing scrape | 0 | Multiple | ✅ | ❌ | TBD | 3 targets |
| **SCRAPING TARGETS — PROVIDER DIRECTORIES** |
| 94 | Provider directories | Directory scrape | 0 | Multiple | ✅ | ❌ | TBD | 5 targets |
| **SCRAPING TARGETS — REDDIT** |
| 99 | r/skincareaddiction | Reddit scrape | 0 | reddit.com | ✅ | ❌ | TBD | 10 subreddits |
| ... | r/esthetician | Reddit scrape | 0 | reddit.com | ✅ | ❌ | TBD | |
| ... | (+ 8 more) | Reddit scrape | 0 | reddit.com | ✅ | ❌ | TBD | |
| **OPEN-SOURCE REPOS** |
| 109 | Various OSS repos | Self-host | 0 | GitHub | ✅ | ❌ | TBD | 6 repos |
| **CAREER PAGES (JOB SCRAPING)** |
| 115 | Ulta Beauty | Career page scrape | Configured | https://careers.ulta.com/ | ⚠️ | ✅ | W10-06 | Greenhouse ATS |
| 116 | Sephora | Career page scrape | Configured | https://www.sephora.com/beauty/careers | ⚠️ | ✅ | W10-06 | Greenhouse ATS |
| 117 | Massage Envy | Career page scrape | Configured | https://jobs.massageenvy.com/ | ⚠️ | ✅ | W10-06 | JSON-LD |
| 118 | Hand & Stone | Career page scrape | Configured | https://www.handandstone.com/careers/ | ⚠️ | ✅ | W10-06 | JSON-LD |
| 119 | European Wax Center | Career page scrape | Configured | https://waxcenter.com/careers | ⚠️ | ✅ | W10-06 | JSON-LD |
| 120 | SkinSpirit | Career page scrape | Configured | https://www.skinspirit.com/careers | ⚠️ | ✅ | W10-06 | HTML parse |
| 121 | Ideal Image | Career page scrape | Configured | https://www.idealimage.com/careers | ⚠️ | ✅ | W10-06 | JSON-LD |
| 122 | LaserAway | Career page scrape | Configured | https://www.laseraway.com/careers/ | ⚠️ | ✅ | W10-06 | HTML parse |
| 123 | Drybar | Career page scrape | Configured | https://www.thedrybar.com/careers | ⚠️ | ✅ | W10-06 | HTML parse |
| 124 | Madison Reed | Career page scrape | Configured | https://www.madison-reed.com/careers | ⚠️ | ✅ | W10-06 | JSON-LD |
| 125 | Heyday Skincare | Career page scrape | Configured | https://www.heydayskincare.com/careers | ⚠️ | ✅ | W10-06 | HTML parse |
| 126 | Bluemercury | Career page scrape | Configured | https://bluemercury.com/pages/careers | ⚠️ | ✅ | W10-06 | HTML parse |
| 127 | Woodhouse Spa | Career page scrape | Configured | https://www.woodhousespas.com/careers | ⚠️ | ✅ | W10-06 | HTML parse |
| 128 | Great Clips | Career page scrape | Configured | https://jobs.greatclips.com/ | ⚠️ | ✅ | W10-06 | JSON-LD |
| 129 | Equinox | Career page scrape | Configured | https://careers.equinox.com/ | ⚠️ | ✅ | W10-06 | Greenhouse ATS |
| **NICHE JOB BOARDS** |
| 130 | Behind the Chair | Niche job board | Configured | https://www.behindthechair.com/jobs/ | ⚠️ | ✅ | W10-06 | Beauty board |
| 131 | ASCP | Niche job board | Configured | https://www.ascpskincare.com/career-center | ⚠️ | ✅ | W10-06 | Skincare board |
| 132 | American MedSpa Assoc | Niche job board | Configured | https://www.americanmedspa.org/page/careercenter | ⚠️ | ✅ | W10-06 | MedSpa board |
| 133 | SpaStaff | Niche job board | Configured | https://spastaff.com/jobs/ | ⚠️ | ✅ | W10-06 | Spa board |
| 134 | Beauty Schools Directory | Niche job board | Configured | https://www.beautyschoolsdirectory.com/jobs | ⚠️ | ✅ | W10-06 | Education + jobs |
| 135 | Spa Elite | Niche job board | Configured | https://spa-elite.com/find-a-job | ⚠️ | ✅ | W10-06 | Premium spa |
| **E-COMMERCE PLATFORMS (RESEARCH)** |
| 141 | Shopify | E-comm API | Research | https://shopify.dev | ✅ Research | ❌ | PARTNER-GATED | OAuth required |
| 142 | BigCommerce | E-comm API | Research | https://developer.bigcommerce.com | ✅ Research | ❌ | PARTNER-GATED | OAuth required |
| 143 | WooCommerce | E-comm API | Research | https://woocommerce.github.io | ✅ Research | ❌ | PARTNER-GATED | GPL-2.0 |
| 144 | Lightspeed | E-comm API | Research | https://developers.lightspeedhq.com | ✅ Research | ❌ | PARTNER-GATED | Non-sublicensable |
| 145 | Magento/Adobe | E-comm API | Research | https://developer.adobe.com/commerce | ✅ Research | ❌ | PARTNER-GATED | OSL 3.0 / enterprise |
| 146 | Salesforce Commerce | E-comm API | Research | https://developer.salesforce.com | ✅ Research | ❌ | PARTNER-GATED | AppExchange required |
| **BOOKING PLATFORMS (RESEARCH)** |
| 152 | Mindbody | Booking API | Research | https://developer.mindbody.io | ✅ Research | ❌ | PARTNER-GATED | OAuth |
| 153 | Pike13 | Booking API | Research | https://developer.pike13.com | ✅ Research | ❌ | PARTNER-GATED | OAuth |
| 154 | Vagaro | Booking API | Research | Undocumented | ✅ Research | ❌ | PARTNER-GATED | Private API |
| 155 | Wix Bookings | Booking API | Research | https://dev.wix.com | ✅ Research | ❌ | PARTNER-GATED | OAuth + app |
| 156 | SimplyBook.me | Booking API | Research | https://simplybook.me/en/api | ✅ Research | ❌ | PARTNER-GATED | Account-scoped |
| 157 | Boulevard | Booking API | Research | https://github.com/boulevard | ✅ Research | ❌ | PARTNER-GATED | MIT SDK |
| ... | (+ 8 more) | Booking API | Research | Various | ✅ Research | ❌ | TBD / DO NOT USE | See compliance report |
| **STRIPE** |
| 165 | Stripe | Payment API | Installed | https://stripe.com/docs/api | ⚠️ | ✅ | LIVE (env setup) | npm packages installed |

---

## LEGEND

| Symbol | Meaning |
|--------|---------|
| ✅ | Exists / Confirmed / Yes |
| ❌ | Does not exist / Not found / No |
| 🔲 | Partially complete (schema created, no data) |
| ⚠️ | Configured but status unclear (verify in build_tracker.md) |
| Tier 0 | Open/OSS (free, no limits or very high limits) |
| Tier 1 | Free-quota commercial (Google, Instagram, etc.) |
| Tier 2 | Paid / Enterprise (Yelp, Glimpse, X/Twitter) |
| Restricted | Academic only (TikTok Research) |
| PARTNER-GATED | Requires business agreement / app enrollment |
| DO NOT USE | No API found or out-of-scope |

---

## SUMMARY STATISTICS

| Category | Count | Declared | In Code | % Implemented |
|----------|-------|----------|---------|---|
| Core Infrastructure | 2 | 2 | 2 | 100% (Supabase + Stripe) |
| Product/Ingredient APIs | 11 | 11 | 0 | 0% |
| Safety/Research APIs | 4 | 4 | 0 | 0% |
| Provider/Licensing APIs | 6 | 6 | 0 | 0% |
| Employment/Economy APIs | 3 | 3 | 0 | 0% |
| Patent APIs | 2 | 2 | 0 | 0% |
| Social Media APIs | 7 | 7 | 0 | 0% |
| Search Trend APIs | 3 | 3 | 0 | 0% |
| Places/Review APIs | 4 | 4 | 0 | 0% |
| News APIs | 3 | 3 | 0 | 0% |
| Job APIs | 1 | 1 | 1 | 100% (configured in Python) |
| RSS Feeds | 40 | 40 | 🔲 (schema only) | ~0% |
| Career page scraping | 15 | 15 | 15 | 100% (configured) |
| Niche job boards | 6 | 6 | 6 | 100% (configured) |
| E-commerce platforms (research) | 6 | 6 | 0 | 0% (research only) |
| Booking platforms (research) | ~15 | 15 | 0 | 0% (research only) |
| **TOTALS** | **~128** | **~128** | **~24** | **~19%** |

---

## CRITICAL GAPS

| Gap | Sources Affected | Workaround |
|-----|--|--|
| No external API clients in package.json | Google APIs, Reddit, Instagram, YouTube, PubMed, FDA, etc. | Must add npm dependencies before implementation |
| RSS feed schema created but empty | 40 declared feeds | Populate `rss_sources` table |
| Jobs pipeline configured but live status unclear | 21 job sources | Verify in build_tracker.md; test `jobs` table population |
| Demo data lacks DEMO label | `/`, `/plans`, `/for-brands`, `/professionals`, portals | Add DEMO badge or hide until live |
| Brand APIs mostly don't exist | Naturopathica, Dermalogica, SkinCeuticals, etc. | Use web scraping or skip |
| Tier 0/1 APIs not wired | 25+ open/free APIs | Create Supabase edge functions or Python jobs |

---

*This table is auto-generated from the comprehensive audit. Last updated: 2026-03-07.*
