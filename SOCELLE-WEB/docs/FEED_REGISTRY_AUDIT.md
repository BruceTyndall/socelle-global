# FEED REGISTRY AUDIT — Task 1 Deliverable
**WO_ID:** Needs new WO: W15-01 (Feed Registry Audit + Phase 1 Activation Plan)
**Generated:** Session 40 — Feed + Media Merchandising Sprint
**Data Source:** `supabase/migrations/20260306600002_seed_data_feeds.sql` + `20260306600003_seed_data_feeds_wave2.sql`

---

## SUMMARY

| Metric | Count |
|--------|-------|
| Total feeds seeded | 202 (102 file 1 + 100 file 2) |
| Feed types | rss: ~130, api: ~35, scraper: 19, webhook: ~18 |
| Categories | 14 (trade_pub, brand_news, supplier, government, ingredients, academic, regional, market_data, regulatory, association, events, press_release, social, jobs) |
| Auth-required (api_key_env set) | 19 |
| Scraper (need custom code) | 19 |
| All is_enabled | false (0 activated — correct per governance) |
| Phase 1 candidates (RSS, no auth, high value) | 68 eligible, 25 selected |

---

## A) PHASE 1 ACTIVATION SET — Top 25 Feeds

Criteria: RSS (no auth complexity), high signal value, likely image availability, provenance tier 1-2.

| # | Name | Category | Tier | Poll | Attribution |
|---|------|----------|------|------|-------------|
| 1 | Dermascope | trade_pub | 2 | 60m | Dermascope Magazine |
| 2 | American Spa Magazine | trade_pub | 2 | 60m | American Spa |
| 3 | Spa Business Magazine | trade_pub | 2 | 60m | Spa Business |
| 4 | Global Wellness Institute | trade_pub | 2 | 60m | Global Wellness Institute |
| 5 | ISPA | trade_pub | 2 | 60m | ISPA |
| 6 | Cosmetics & Toiletries | trade_pub | 2 | 60m | Cosmetics & Toiletries |
| 7 | Cosmetics Design | trade_pub | 2 | 60m | CosmeticsDesign |
| 8 | Beauty Independent | trade_pub | 2 | 60m | Beauty Independent |
| 9 | Glossy.co | trade_pub | 2 | 60m | Glossy |
| 10 | Beauty Matter | trade_pub | 2 | 60m | Beauty Matter |
| 11 | WWD Beauty | trade_pub | 2 | 60m | WWD Beauty Inc |
| 12 | Allure | trade_pub | 2 | 60m | Allure |
| 13 | Byrdie | trade_pub | 2 | 60m | Byrdie |
| 14 | Skin Inc | trade_pub | 2 | 60m | Skin Inc |
| 15 | MedEsthetics Magazine | trade_pub | 2 | 60m | MedEsthetics |
| 16 | Dermatology Times | trade_pub | 2 | 60m | Dermatology Times |
| 17 | Practical Dermatology | trade_pub | 2 | 60m | Practical Dermatology |
| 18 | The Dermatologist | trade_pub | 2 | 60m | The Dermatologist |
| 19 | Modern Salon/Spa | trade_pub | 2 | 60m | Modern Salon |
| 20 | PR Newswire — Beauty/Health | press_release | 2 | 60m | PR Newswire |
| 21 | BusinessWire — Personal Care | press_release | 2 | 60m | Business Wire |
| 22 | GlobeNewsWire — Health & Beauty | press_release | 2 | 60m | GlobeNewsWire |
| 23 | Naturopathica Blog | brand_news | 1 | 60m | Naturopathica |
| 24 | Dermalogica Blog | brand_news | 1 | 60m | Dermalogica |
| 25 | SkinCeuticals Blog | brand_news | 1 | 60m | SkinCeuticals |

**Rationale:** All 25 are RSS feeds with no authentication required. Trade publications provide the highest editorial signal value with professional imagery. Press release wires provide volume. Brand blogs (tier 1 = owned/direct) provide verified brand intelligence. All 25 can be activated immediately from /admin/feeds with zero code changes.

---

## B) FEED → SIGNAL_TYPE MAP

| Category (14) | Default signal_type | Default tier_visibility | Feed Count |
|---------------|--------------------|-----------------------|------------|
| academic | research_insight | pro | 12 |
| association | industry_news | free | 11 |
| brand_news | brand_update | free | 24 |
| events | event_signal | free | 9 |
| government | regulatory_alert | pro | 15 |
| ingredients | ingredient_trend | pro | 13 |
| jobs | job_market | free | 4 |
| market_data | market_data | pro | 12 |
| press_release | press_release | free | 7 |
| regional | regional_market | pro | 12 |
| regulatory | regulatory_alert | pro | 11 |
| social | social_trend | free | 4 |
| supplier | supply_chain | pro | 16 |
| trade_pub | industry_news | free | 37 |

**Free-tier signals:** trade_pub, brand_news, press_release, association, social, jobs, events (96 feeds)
**Pro-tier signals:** academic, government, ingredients, market_data, regional, regulatory, supplier (91 feeds)

---

## C) BLOCKED FEEDS

### Feeds requiring API keys (19 — api_key_env_var set, keys NOT in repo secrets)

| Feed Name | Required Key Env Var | Category |
|-----------|---------------------|----------|
| API-Ninjas Nutrition | API_NINJAS_KEY | ingredients |
| API-Ninjas Calories Burned | API_NINJAS_KEY | ingredients |
| API-Ninjas Exercises | API_NINJAS_KEY | ingredients |
| USDA FoodData Central | USDA_API_KEY | ingredients |
| Spike Nutrition API | SPIKE_API_KEY | ingredients |
| Edamam Nutrition API | EDAMAM_APP_KEY | ingredients |
| Nutritionix API | NUTRITIONIX_API_KEY | ingredients |
| Google Fit REST API | GOOGLE_FIT_KEY | market_data |
| Fitbit Web API | FITBIT_API_KEY | market_data |
| Oura Ring API | OURA_API_KEY | market_data |
| Whoop API | WHOOP_API_KEY | market_data |
| TikTok Research API | TIKTOK_RESEARCH_KEY | social |
| Instagram Graph API | INSTAGRAM_API_KEY | social |
| Pinterest Trends API | PINTEREST_API_KEY | social |
| Twitter/X API v2 | TWITTER_BEARER_TOKEN | social |
| LinkedIn Jobs API | LINKEDIN_API_KEY | jobs |
| Indeed Job Search | INDEED_API_KEY | jobs |
| ZipRecruiter API | ZIPRECRUITER_API_KEY | jobs |
| Glassdoor Jobs API | GLASSDOOR_API_KEY | jobs |

**Action:** These feeds remain is_enabled=false until API keys are provisioned in Supabase secrets. Flag as "Needs API Key Provisioning WO".

### Scraper feeds (19 — need custom scraping code, no standard RSS/API)

| Feed Name | Target URL | Category |
|-----------|-----------|----------|
| EU CosIng Database | single-market-economy.ec.europa.eu | ingredients |
| COSMILE Europe | cosmile-europe.com | ingredients |
| INCI Beauty | incibeauty.com | ingredients |
| EU SCCS Opinions | health.ec.europa.eu | regulatory |
| IFRA Standards | ifrafragrance.org | regulatory |
| PCPC Updates | personalcarecouncil.org | regulatory |
| EU REACH Cosmetics | echa.europa.eu | regulatory |
| in-cosmetics Global | in-cosmetics.com | events |
| Cosmoprof Worldwide | cosmoprof.com | events |
| Innocos Summit | innocosevents.com | events |
| IFSCC Congress | ifscc.org | events |
| CEW Beauty Awards | cew.org | events |
| Premiere Beauty Show | premierebeautyshow.com | events |
| Face & Body Expo | faceandbody.com | events |
| MakeUp in Events | makeup-in.com | events |
| PCPC Annual Meeting | personalcarecouncil.org | association |
| JCIA News (Japan) | jcia.org | regional |
| Mintel Beauty Reports | mintel.com | market_data |
| Euromonitor Beauty | euromonitor.com | market_data |

**Action:** These feeds remain is_enabled=false. The feed-orchestrator skips scraper type feeds. Flag as "Needs Scraper Pipeline WO".

---

## D) INFRASTRUCTURE GAP ANALYSIS

### market_signals table — missing columns per REQUIRED DATA SHAPE

| Required Column | Status | Action |
|----------------|--------|--------|
| signal_type | EXISTS | - |
| source_type | EXISTS | - |
| source_url | EXISTS (added W13-04) | - |
| source_name | EXISTS (added W13-04) | - |
| confidence_score | EXISTS (added W13-04) | - |
| tier_visibility | EXISTS (added W13-04) | - |
| image_url | EXISTS | - |
| source_feed_id | MISSING | ADD — FK to data_feeds.id |
| is_duplicate | MISSING | ADD — boolean default false |

### Missing tables

| Table | Status | Action |
|-------|--------|--------|
| feed_run_log | DOES NOT EXIST | ADD — Task 2 migration |
| editorial_stories | DOES NOT EXIST (stories table exists as basic blog) | ADD — Task 5 migration |

---

## PROOF PACK — TASK 1

```
WO_ID:           Needs new WO: W15-01 (Feed Registry Audit)
FILES_CHANGED:   audit only — SOCELLE-WEB/docs/FEED_REGISTRY_AUDIT.md (this file)
BUILD_CHECK:     N/A (audit only, no code changes)
LIVE_STATEMENT:  data_feeds table is LIVE (202 rows, all is_enabled=false)
MEDIA_STATEMENT: N/A (audit only)
```
