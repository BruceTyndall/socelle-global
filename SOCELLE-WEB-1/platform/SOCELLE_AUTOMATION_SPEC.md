# SOCELLE — Complete Automation Architecture Specification

**Document type:** Automation Architecture Specification
**Author:** Agent 6 — Automation Architecture Agent
**Date:** March 2026
**Status:** Production-ready reference document
**Classification:** Internal engineering reference

---

## Preamble

SOCELLE is a living beauty intelligence portal targeting 90% content automation at steady state. It shares the Beauty Intelligence Data Architecture pipeline with Viaive — the same Supabase/PostgreSQL database, the same pg-boss job system, and the same crawl/normalize/signal pipeline defined in `BeautyIntel_DataArchitect_Spec.docx`. SOCELLE adds a SOCELLE-specific automation layer on top of that shared pipeline, targeting its own content surfaces: the personalized feed, public brand profile pages, the events calendar, affiliate commerce placements, the education index, the daily briefing email, and community polls.

This document is the authoritative engineering reference for:

1. How each of the 8 pipeline use cases feeds specific SOCELLE content surfaces
2. The 10 SOCELLE-specific pg-boss queues and their complete configurations
3. The RSS feed source registry (33+ feeds)
4. The automation vs. human decision matrix for all 10 content surfaces
5. The compliance checklist template for adding any new data source
6. The pg-boss queue registry as importable TypeScript config
7. The steady-state weekly human effort budget

The shared pipeline (UC-1 through UC-8) is owned by the shared infrastructure team. SOCELLE-specific queues (Sections 2 and 6 of this document) are owned by the SOCELLE engineering team and run within the same pg-boss instance — not a parallel system.

---

## Section 1: Pipeline Connection Map — 8 Use Cases to SOCELLE Surfaces

### Overview Table

| Pipeline Use Case | SOCELLE Surface | Data Flow | Tables Involved | Refresh Cadence |
|---|---|---|---|---|
| UC-6: Brand/Product Assortment Intelligence | Brand profile pages (auto-generated overview + product catalog) | brand product catalog, tier classification, ingredients data | `brand_products` → `brand_profiles.auto_description`, `brand_products` | Monthly |
| UC-3: Review/Sentiment Intelligence | Brand profile pages (professional sentiment section) | Aggregated review scores by aspect (efficacy, value, support, training) | `reviews_processed` → `mv_brand_sentiment` → `brand_profiles` sentiment fields | Weekly |
| UC-7: Trend Intelligence | Brand pages + trend feed items + trend widgets on homepage | Trend lifecycle stage, social velocity, TDI score | `trend_signals_weekly` → `mv_trend_scores` → `brand_profiles.trend_stage` + `feed_items` | Weekly |
| UC-8: Education/Content Intelligence | Education content index + brand education section | Content categorization, CE credit availability, technique coverage | `youtube_signals` + `content_index` → `feed_items` (type=education) + `brand_profiles.education_section` | Daily |
| UC-5: Pricing Intelligence | Benchmarking pages + brand page pricing data | Service pricing by metro, category, tier | `pricing_signals` → `mv_metro_benchmarks` → benchmarking pages + `brand_profiles.price_context` | Weekly |
| UC-1 + UC-2: Spa/Medspa Business Intelligence | Competitive landscape + provider adoption maps on brand pages | Anonymized provider adoption % by metro/specialty | `businesses_enriched` + `services` → `mv_competitive_landscape` → `brand_profiles.adoption_section` | Weekly |
| UC-4: Local Competitor Intelligence | Operator dashboards (premium subscriber tier) | Individual business benchmarking vs. local competitors | `market_opportunity` → `mv_business_scores` → operator benchmarking dashboard | Daily |
| All use cases: Confidence Scores | Data quality indicators on all surfaces | Confidence column on all derived data → UI indicator badge | All pipeline tables (`.confidence_level` columns) → frontend quality badge component | Continuous |

---

### 1.1 UC-6: Brand/Product Assortment Intelligence → Brand Profile Pages

**SOCELLE Surface:** `/brands/[slug]` — Brand Overview and Product Catalog sections

**Data Flow:**

```
Open Beauty Facts API → brand_products (monthly sync)
    ↓
socelle-assemble-brand-profiles queue (monthly)
    ↓
brand_profiles.auto_description + brand_profiles.product_catalog_json
    ↓
/brands/[slug] page render
```

**SQL / Materialized View:**

```sql
-- Assembled brand overview for profile page
CREATE MATERIALIZED VIEW mv_brand_profile_overview AS
SELECT
  b.id AS brand_id,
  b.slug,
  b.name,
  b.category,
  b.tier_classification,
  b.parent_company,
  b.headquarters_city,
  b.headquarters_country,
  b.founding_year,
  b.website_url,
  COUNT(bp.id) AS product_count,
  ARRAY_AGG(DISTINCT bp.subcategory) FILTER (WHERE bp.subcategory IS NOT NULL) AS product_categories,
  ARRAY_AGG(DISTINCT ingredient FROM UNNEST(bp.key_ingredients) AS ingredient LIMIT 10) AS top_ingredients,
  b.auto_description,
  b.confidence_level,
  b.last_assembled_at
FROM socelle.brands b
LEFT JOIN socelle.brand_products bp ON bp.brand_id = b.id AND bp.is_active = true
GROUP BY b.id, b.slug, b.name, b.category, b.tier_classification,
         b.parent_company, b.headquarters_city, b.headquarters_country,
         b.founding_year, b.website_url, b.auto_description,
         b.confidence_level, b.last_assembled_at;

CREATE UNIQUE INDEX ON mv_brand_profile_overview (brand_id);
```

**Confidence Score Display:** Shown as a small badge in the Brand Overview section header: "Data confidence: HIGH / MEDIUM / LOW" with a tooltip explaining the scoring methodology. LOW confidence records include "Data may be incomplete" notice in italics below the auto-description.

**Stale Data Handling:** If `last_assembled_at` is older than 60 days (2× the 30-day SLA): display "Last updated [X] days ago" badge in warm gray below the overview section. Trigger a priority re-assembly job on next queue run.

---

### 1.2 UC-3: Review/Sentiment Intelligence → Brand Profile Sentiment Section

**SOCELLE Surface:** `/brands/[slug]` — Professional Sentiment section (overall rating, aspect scores, review excerpts)

**Data Flow:**

```
Google Maps + Yelp + SOCELLE internal reviews → reviews_processed (weekly NLP batch)
    ↓
mv_brand_sentiment (weekly refresh)
    ↓
brand_profiles.sentiment_json (updated by socelle-compute-brand-scores queue)
    ↓
/brands/[slug] Professional Sentiment section
```

**SQL / Materialized View:**

```sql
-- Brand-level sentiment aggregation
CREATE MATERIALIZED VIEW mv_brand_sentiment AS
SELECT
  brand_id,
  COUNT(*) AS total_reviews,
  ROUND(AVG(review_rating)::numeric, 1) AS avg_rating,
  ROUND(AVG(CASE WHEN topic_tags @> ARRAY['efficacy'] THEN sentiment_score END)::numeric / 20, 1) AS efficacy_score,
  ROUND(AVG(CASE WHEN topic_tags @> ARRAY['value'] OR complaint_flags @> ARRAY['price'] THEN sentiment_score END)::numeric / 20, 1) AS value_score,
  ROUND(AVG(CASE WHEN topic_tags @> ARRAY['support'] OR praise_flags @> ARRAY['responsive'] THEN sentiment_score END)::numeric / 20, 1) AS support_score,
  ROUND(AVG(CASE WHEN topic_tags @> ARRAY['training'] OR topic_tags @> ARRAY['education'] THEN sentiment_score END)::numeric / 20, 1) AS training_score,
  -- Weighted recency: last 90 days count 2x
  ROUND(
    (SUM(sentiment_score * CASE WHEN review_date > NOW() - INTERVAL '90 days' THEN 2 ELSE 1 END)::numeric /
     SUM(CASE WHEN review_date > NOW() - INTERVAL '90 days' THEN 2 ELSE 1 END)::numeric) / 100 * 5,
  1) AS sqs_score,
  MAX(review_date) AS latest_review_date,
  CASE
    WHEN COUNT(*) >= 20 AND AVG(review_rating) >= 4.0 THEN 'HIGH'
    WHEN COUNT(*) >= 5 THEN 'MEDIUM'
    ELSE 'LOW'
  END AS confidence_level
FROM reviews_processed
WHERE brand_id IS NOT NULL
GROUP BY brand_id;

CREATE UNIQUE INDEX ON mv_brand_sentiment (brand_id);
```

**Confidence Score Display:** Shown alongside the star rating as "Based on [N] professional reviews — [CONFIDENCE] data confidence." Fewer than 3 reviews shows: "Not enough reviews yet — be among the first to rate this brand."

**Stale Data Handling:** If `latest_review_date` is older than 14 days (2× the 7-day SLA): display "Sentiment data last updated [X] ago" in pro-warm-gray below the aspect scores. Does not hide data — shows it with the staleness indicator.

---

### 1.3 UC-7: Trend Intelligence → Brand Pages + Feed Items + Homepage Trend Widgets

**SOCELLE Surface:**
- `/brands/[slug]` — Trend Data section (lifecycle stage, social velocity badge)
- `/` homepage — Trending Now widget (top 5 rising treatments)
- `feed_items` (type=trend) — trend alert cards in the personalized feed

**Data Flow:**

```
pytrends + Reddit PRAW + YouTube API → trend_signals_weekly
    ↓
Trend Score Calculator → mv_trend_scores (TDI + trend_stage per keyword per week)
    ↓
brand_profiles.trend_stage (updated by socelle-assemble-brand-profiles)
feed_items (type=trend) created by socelle-aggregate-news based on trend spikes
    ↓
/brands/[slug] Trend section + homepage widget + personalized feed
```

**SQL / Materialized View:**

```sql
-- Brand trend profile — joins brand product keywords to trend scores
CREATE MATERIALIZED VIEW mv_brand_trend_profile AS
SELECT
  b.id AS brand_id,
  b.name AS brand_name,
  b.slug,
  t.keyword,
  t.tdi_score,
  t.trend_stage,
  t.trend_velocity,
  t.gt_value AS google_trends_index,
  t.reddit_post_count_7d,
  t.confidence_level,
  t.week_date
FROM socelle.brands b
JOIN socelle.brand_keywords bk ON bk.brand_id = b.id
JOIN mv_trend_scores t ON t.keyword_id = bk.keyword_id
WHERE t.week_date = (SELECT MAX(week_date) FROM mv_trend_scores);

CREATE INDEX ON mv_brand_trend_profile (brand_id);
CREATE INDEX ON mv_brand_trend_profile (tdi_score DESC);

-- Homepage trending feed — top 10 rising keywords this week
CREATE VIEW v_trending_now AS
SELECT
  keyword,
  tdi_score,
  trend_stage,
  trend_velocity,
  gt_value,
  reddit_post_count_7d,
  confidence_level
FROM mv_trend_scores
WHERE week_date = (SELECT MAX(week_date) FROM mv_trend_scores)
  AND trend_velocity = 'rising'
  AND confidence_level IN ('HIGH', 'MEDIUM')
ORDER BY tdi_score DESC
LIMIT 10;
```

**Confidence Score Display:** Lifecycle stage badge on brand page (e.g., "Trending: Emerging") includes a data provenance tooltip: "Based on Google Trends + Reddit velocity + YouTube growth — [CONFIDENCE] confidence." LOW confidence stages are shown with a "Limited data" label and no lifecycle badge.

**Stale Data Handling:** If trend data is older than 14 days (2× the 7-day SLA): trend section on brand page shows "Trend data last updated [X] ago — updating soon" and the lifecycle stage badge is replaced with a grayed-out "—" indicator.

---

### 1.4 UC-8: Education/Content Intelligence → Education Index + Brand Education Section

**SOCELLE Surface:**
- `/education` — Education content hub with category browse
- `/brands/[slug]` — Education & Training section (known CE courses and brand education resources)
- `feed_items` (type=education) — education content cards in the personalized feed

**Data Flow:**

```
YouTube Data API + RSS education feeds + Eventbrite → youtube_signals + content_index
    ↓
NLP Processor → content_gap_score + editorial_priority_score per topic
    ↓
content_index rows tagged with brand_id (where brand is mentioned)
feed_items (type=education) created daily from high-priority content
brand_profiles.education_section populated from content_index where brand_id matches
    ↓
/education + /brands/[slug] education section + personalized feed
```

**SQL / Materialized View:**

```sql
-- Education content index with brand linkage
CREATE MATERIALIZED VIEW mv_education_content AS
SELECT
  c.id,
  c.title,
  c.source_url,
  c.source_type, -- 'youtube' | 'rss' | 'eventbrite' | 'pubmed'
  c.content_categories,
  c.audience_level,
  c.ce_credits_available,
  c.ce_credits_count,
  c.brand_mentions, -- array of brand_ids mentioned
  c.content_gap_score,
  c.editorial_priority_score,
  c.published_at,
  c.last_indexed_at,
  CASE
    WHEN c.last_indexed_at > NOW() - INTERVAL '24 hours' THEN 'HIGH'
    WHEN c.last_indexed_at > NOW() - INTERVAL '48 hours' THEN 'MEDIUM'
    ELSE 'LOW'
  END AS freshness_confidence
FROM content_index c
WHERE c.is_active = true
ORDER BY c.editorial_priority_score DESC;

-- Per-brand education content
CREATE INDEX ON mv_education_content USING GIN (brand_mentions);

-- Brand education section query
-- Usage: SELECT * FROM mv_education_content WHERE brand_mentions @> ARRAY['{brand_id}'::uuid]
```

**Confidence Score Display:** On the education index, each card shows "Source: [YouTube / ISPA / Eventbrite]" as a provenance label. CE credit availability shows "CE credits: [N] hours (unverified)" unless human-verified, in which case it shows "CE credits: [N] hours (verified)."

**Stale Data Handling:** If `last_indexed_at` is older than 48 hours (2× the 24-hour SLA): a banner appears on `/education` reading "Content index refreshing — some items may be up to [X] hours old." Individual cards do not show staleness notices (too granular).

---

### 1.5 UC-5: Pricing Intelligence → Benchmarking Pages + Brand Page Pricing Data

**SOCELLE Surface:**
- `/insights` — Market benchmarking section with service pricing by metro/category
- `/brands/[slug]` — Pricing Context section ("Professional pricing context for [Brand] products in your market")
- Operator dashboards — price benchmarking vs. local market

**Data Flow:**

```
Indeed job posts + Archive.org + Reddit price threads → pricing_signals (weekly)
    ↓
Market Price Index calculation → mv_metro_benchmarks
    ↓
brand_profiles.price_context (median price by category, market index)
Operator dashboard pricing cards (for premium subscribers)
    ↓
/insights benchmarking pages + /brands/[slug] + operator dashboard
```

**SQL / Materialized View:**

```sql
-- Metro-level pricing benchmarks per treatment category
CREATE MATERIALIZED VIEW mv_metro_benchmarks AS
SELECT
  metro,
  treatment_canonical_id,
  treatment_name,
  PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY reddit_price_median) AS price_p25,
  PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY reddit_price_median) AS price_median,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY reddit_price_median) AS price_p75,
  AVG(reddit_price_median) / (SELECT AVG(reddit_price_median) FROM pricing_signals WHERE treatment_canonical_id = ps.treatment_canonical_id) AS market_price_index,
  AVG(salary_floor) AS avg_tech_salary_floor,
  MAX(last_updated_at) AS data_as_of,
  CASE
    WHEN COUNT(*) >= 3 AND STDDEV(reddit_price_median) / NULLIF(AVG(reddit_price_median), 0) < 0.3 THEN 'HIGH'
    WHEN COUNT(*) >= 2 THEN 'MEDIUM'
    ELSE 'LOW'
  END AS confidence_level
FROM pricing_signals ps
WHERE last_updated_at > NOW() - INTERVAL '90 days'
GROUP BY metro, treatment_canonical_id, treatment_name, ps.treatment_canonical_id;

CREATE INDEX ON mv_metro_benchmarks (metro, treatment_canonical_id);
```

**Confidence Score Display:** Pricing ranges on benchmarking pages display confidence inline: "Median: $185 — based on [N] data points ([CONFIDENCE] confidence)." LOW confidence pricing data shows only the range, not the median, and is labeled "Limited data — range estimate only."

**Stale Data Handling:** If `data_as_of` is older than 14 days (2× the 7-day SLA): pricing cards show "Pricing data last updated [X] ago." For operator dashboards, a yellow warning banner reads "Market pricing data may be outdated — refresh in progress."

---

### 1.6 UC-1 + UC-2: Spa/Medspa Business Intelligence → Provider Adoption Maps

**SOCELLE Surface:**
- `/brands/[slug]` — Provider Adoption section ("Adoption by market and specialty")
- `/insights` — Competitive landscape overview (category-level)

**Data Flow:**

```
Google Maps + Yelp + OSM → businesses_raw → businesses_enriched
Explore Profile specialty + brand usage → businesses_enriched (SOCELLE users)
    ↓
Anonymized aggregate by metro + specialty → mv_competitive_landscape
    ↓
brand_profiles.adoption_section (% of providers using brand by metro)
    ↓
/brands/[slug] Provider Adoption section + /insights competitive landscape
```

**SQL / Materialized View:**

```sql
-- Anonymized provider adoption by brand, metro, specialty
-- IMPORTANT: Only shows aggregates where N >= 5 to protect individual privacy
CREATE MATERIALIZED VIEW mv_brand_adoption AS
SELECT
  brand_id,
  metro,
  specialty,
  COUNT(DISTINCT business_id) AS provider_count,
  ROUND(COUNT(DISTINCT business_id)::numeric /
    NULLIF(SUM(COUNT(DISTINCT business_id)) OVER (PARTITION BY metro, specialty), 0) * 100, 1) AS adoption_pct,
  CASE
    WHEN COUNT(DISTINCT business_id) >= 20 THEN 'HIGH'
    WHEN COUNT(DISTINCT business_id) >= 5 THEN 'MEDIUM'
    ELSE NULL -- Do not expose groups smaller than 5
  END AS confidence_level
FROM businesses_enriched be
JOIN explore_profile_brand_usage epbu ON epbu.business_id = be.id
WHERE be.is_verified = true
GROUP BY brand_id, metro, specialty
HAVING COUNT(DISTINCT business_id) >= 5; -- Privacy floor: never show groups < 5

CREATE INDEX ON mv_brand_adoption (brand_id, metro);
```

**Confidence Score Display:** Adoption map on brand page shows: "Used by [X]% of [specialty] providers in [Metro] — [CONFIDENCE] data" with sample size disclosed: "([N] providers)." If no data meets the privacy floor of N>=5, section shows "Not enough regional data yet — be among the first to add this brand to your profile."

**Stale Data Handling:** If adoption data is older than 14 days: adoption percentages are shown with "Last updated [X] ago" note. The map visual is not hidden — stale aggregate data is still directionally useful.

---

### 1.7 UC-4: Local Competitor Intelligence → Operator Benchmarking Dashboard

**SOCELLE Surface:**
- `/portal/benchmarks` (premium subscriber tier) — Individual business benchmarking vs. local competitors
- Powered by LMOI (Local Market Opportunity Index) scores from the pipeline

**Data Flow:**

```
Census API + Google Maps + State registries → market_opportunity (weekly ZIP-level scores)
businesses_enriched + reviews_processed → mv_business_scores (daily)
    ↓
Operator's benchmarking dashboard: their score vs. local market distribution
    ↓
/portal/benchmarks premium page
```

**SQL / Materialized View:**

```sql
-- Business score vs. local competitors
CREATE MATERIALIZED VIEW mv_business_scores AS
SELECT
  b.id AS business_id,
  b.metro,
  b.zip_code,
  b.specialty,
  b.name,
  -- Composite score components
  COALESCE(ROUND(bs.avg_sentiment_score / 2.0, 1), 0) AS sentiment_dimension,  -- 0–50
  COALESCE(ROUND(bs.review_count_normalized * 10, 1), 0) AS volume_dimension,  -- 0–10
  COALESCE(mo.lmoi_score * 0.3, 0) AS market_opportunity_dimension,            -- 0–30
  COALESCE(bs.reorder_health_score * 0.1, 0) AS reorder_health_dimension,      -- 0–10
  -- Composite total
  ROUND(
    COALESCE(bs.avg_sentiment_score / 2.0, 0) +
    COALESCE(bs.review_count_normalized * 10, 0) +
    COALESCE(mo.lmoi_score * 0.3, 0) +
    COALESCE(bs.reorder_health_score * 0.1, 0),
  1) AS composite_score,
  -- Peer percentile within metro + specialty
  PERCENT_RANK() OVER (
    PARTITION BY b.metro, b.specialty
    ORDER BY COALESCE(bs.avg_sentiment_score / 2.0, 0) +
             COALESCE(bs.review_count_normalized * 10, 0)
  ) * 100 AS peer_percentile,
  mo.opportunity_tier,
  bs.last_computed_at,
  CASE
    WHEN bs.last_computed_at > NOW() - INTERVAL '24 hours' AND mo.last_updated_at > NOW() - INTERVAL '7 days' THEN 'HIGH'
    WHEN bs.last_computed_at > NOW() - INTERVAL '48 hours' THEN 'MEDIUM'
    ELSE 'LOW'
  END AS confidence_level
FROM businesses_enriched b
LEFT JOIN business_scores bs ON bs.business_id = b.id
LEFT JOIN market_opportunity mo ON mo.zip_code = b.zip_code;

CREATE UNIQUE INDEX ON mv_business_scores (business_id);
CREATE INDEX ON mv_business_scores (metro, specialty, composite_score DESC);
```

**Confidence Score Display:** Benchmarking dashboard shows composite score confidence in the header: "Your intelligence score — [CONFIDENCE] confidence ([N] data points)." LOW confidence shows a notice: "Limited local data — your score will improve as more providers in your area join Socelle."

**Stale Data Handling:** If `last_computed_at` is older than 48 hours (2× the 24-hour SLA): a yellow banner on the benchmarking dashboard reads "Score data updating — last computed [X] ago."

---

### 1.8 All Use Cases: Confidence Scores → Data Quality Indicators

**SOCELLE Surface:** All public and authenticated surfaces — confidence badge component used consistently across all data-driven sections.

**Confidence Score Logic (from pipeline spec):**

| Level | Criteria |
|---|---|
| HIGH | 3+ source types agree within 20% variance OR N >= 20 records |
| MEDIUM | 2 sources within 30% variance OR N >= 5 records |
| LOW | Single source OR >30% variance OR N < 5 records |
| INSUFFICIENT | Required signal (weight >= 25%) is absent — never shown in product recommendations |

**Propagation Rules:**
- Derived scores inherit the LOWEST confidence of any required input signal
- Data older than 2× its target freshness SLA: confidence drops one tier automatically
- Human-validated records: confidence = VERIFIED (overrides algorithm)

**Frontend Component:**

```tsx
// ConfidenceBadge component — used across all data surfaces
type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'VERIFIED' | 'INSUFFICIENT';

const badgeConfig: Record<ConfidenceLevel, { label: string; className: string; tooltip: string }> = {
  HIGH: {
    label: 'High confidence',
    className: 'bg-green-50 text-green-700 border border-green-200',
    tooltip: '3+ data sources in agreement'
  },
  MEDIUM: {
    label: 'Medium confidence',
    className: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    tooltip: '2 data sources, some variance'
  },
  LOW: {
    label: 'Limited data',
    className: 'bg-pro-stone/30 text-pro-warm-gray border border-pro-stone',
    tooltip: 'Single source or high variance — directional only'
  },
  VERIFIED: {
    label: 'Verified',
    className: 'bg-pro-gold/10 text-pro-gold border border-pro-gold/30',
    tooltip: 'Manually verified by Socelle team'
  },
  INSUFFICIENT: {
    label: 'Insufficient data',
    className: 'hidden', // Never displayed in UI
    tooltip: ''
  }
};
```

---

## Section 2: SOCELLE-Specific Automation Modules — 10 pg-boss Queues

All queues below run within the **same pg-boss instance** as the shared pipeline queues. They do not create a parallel job system. They reference the same Supabase connection pool and share the same `crawl_logs`, `response_cache`, and `data_quality_alerts` infrastructure tables.

---

### Queue 1: `socelle-crawl-events`

**Function:** Extract industry events from 14+ sources, normalize into structured event records, and upsert into `socelle.events`.

**Sources (14):**
1. ISPA — International Spa Association (`ispa.com/events`) — Playwright scrape
2. PBA — Professional Beauty Association (`probeauty.org/events`) — Playwright scrape
3. BTC — Behind The Chair (`btcpro.com/events`) — RSS + Playwright
4. Eventbrite API — category: `beauty`, `spa`, `medspa` — public API
5. Live Love Spa (`livelovespa.com/events`) — Playwright scrape
6. Spa Collab (`spacollab.com`) — Playwright scrape
7. Modern Salon (`modernsalon.com/events`) — RSS + Playwright
8. AmSpa — American Med Spa Association (`americanmedspa.org/events`) — Playwright scrape
9. NCEA — National Coalition of Estheticians (`ncea.tv/events`) — Playwright scrape
10. ASCP — Associated Skin Care Professionals (`ascpskincare.com/events`) — Playwright scrape
11. Cosmoprof North America (`cosmoprofnorthamerica.com`) — Playwright scrape
12. Premiere Orlando (`premiereorlando.com`) — Playwright scrape
13. IBS New York (`ibsnewyork.com`) — Playwright scrape
14. Brand education pages — top 50 brand websites, `/education` or `/events` path — Playwright scrape

**Refresh:** Weekly — every Sunday at 2:00 AM ET (`0 7 * * 0` UTC)

**Priority:** 5 (medium)

**pg-boss config:**
```typescript
{
  retryLimit: 3,
  retryDelay: 3600,     // retry after 1 hour on failure
  singleton: true,
  singletonKey: 'crawl-events-weekly',
  expireInSeconds: 3600 // expire job if not claimed within 1 hour
}
```

**Worker timeout:** 300 seconds (5 minutes)

**On success:**
1. Upsert into `socelle.events` using `hash(source_url + event_start_date)` as dedup key
2. Set `auto_extracted = true` on all upserted records
3. Create `feed_items` records (type=event) for events starting within 14 days
4. Update `crawl_logs` with run stats: sources_attempted, sources_succeeded, events_upserted, events_updated, events_failed

**On failure:**
1. Log to `crawl_logs` with error details
2. Create alert in `socelle.data_quality_alerts` if 3+ consecutive failures on same source

**Expected output per run:** 50–200 new or updated events

**Worker registration:**
```typescript
await boss.work('socelle-crawl-events', { teamSize: 1, teamConcurrency: 1 }, async (job) => {
  const { sources, batchId } = job.data;

  for (const source of EVENT_SOURCES) {
    try {
      const rawEvents = await crawlEventSource(source);
      const normalized = rawEvents.map(e => normalizeEvent(e, source));
      await upsertEvents(normalized);
      await updateCrawlLog(source.id, { status: 'success', count: normalized.length });
    } catch (err) {
      await updateCrawlLog(source.id, { status: 'error', error: err.message });
      await checkConsecutiveFailures(source.id); // alert after 3 failures
    }
  }
});
```

---

### Queue 2: `socelle-aggregate-news`

**Function:** RSS aggregation from 30+ beauty publications, auto-categorize by specialty and content type, deduplicate, and publish to `socelle.feed_items`.

**Sources:** See Section 3 (RSS Feed Source Registry) for complete list of 33+ feeds.

**Refresh:** Every 6 hours (`0 */6 * * *` UTC)

**Priority:** 8 (high — highest priority SOCELLE queue)

**pg-boss config:**
```typescript
{
  retryLimit: 2,
  retryDelay: 300,     // retry after 5 minutes
  singleton: true,
  singletonKey: 'aggregate-news',
  expireInSeconds: 600 // expire if not claimed in 10 minutes
}
```

**Worker timeout:** 120 seconds

**Deduplication:** `MD5(url || TO_CHAR(published_date, 'YYYY-MM-DD'))` uniqueness check against `feed_items.dedup_hash`. On conflict: update `updated_at`, do not create duplicate record.

**Categorization:** Rule-based NLP classifier assigns `content_categories[]` and `specialty_tags[]`. Categories: `skincare | haircare | medspa | business | trends | education | compliance | products | events`. LLM categorization is a future enhancement (Phase 2).

**On success:**
1. Insert new `feed_items` records (type=news)
2. Update `rss_feed_last_pulled` on each feed source record
3. Set `is_featured = false` by default — human editor promotes to featured
4. Update `crawl_logs`

**Expected output per run:** 20–50 new articles per 6-hour cycle (120–250/day)

**Worker registration:**
```typescript
await boss.work('socelle-aggregate-news', { teamSize: 2, teamConcurrency: 2 }, async (job) => {
  const feeds = await getActiveFeedSources();

  for (const feed of feeds) {
    const items = await fetchRSSFeed(feed.rss_url);
    const dedupedItems = await deduplicateItems(items, feed.id);
    const categorized = await categorizeItems(dedupedItems);
    await insertFeedItems(categorized);
    await updateFeedPullTime(feed.id);
  }
});
```

---

### Queue 3: `socelle-crawl-reddit`

**Function:** Monitor beauty subreddits for trending topics, brand mentions, and operator questions. Feeds into the `trends` table and triggers poll generation.

**Sources (7 subreddits):**
1. `r/SkincareAddiction` — skincare products, ingredients, professional advice
2. `r/MedSpa` — medspa treatments, pricing, provider reviews
3. `r/Esthetics` — esthetician professional discussions
4. `r/SkincareFlatlay` — product discovery, brand mentions
5. `r/BeautyAddiction` — beauty trends, product launches
6. `r/Sephora` — retail brand sentiment (leading indicator for professional)
7. `r/HairstylistMethods` — haircare professional discussions

**Extraction via:** Reddit public JSON API (`reddit.com/r/{subreddit}/new.json`, `reddit.com/r/{subreddit}/rising.json`, `reddit.com/r/{subreddit}/top.json?t=week`) — no auth required for public posts.

**What to extract:** Post title, score (upvotes), comment count, brand mentions (matched against brand dictionary), trending topics (matched against treatment taxonomy), post URL, author, created UTC, flair.

**Refresh:** Every 4 hours for high-signal subreddits (`r/SkincareAddiction`, `r/Esthetics`, `r/MedSpa`). Daily batch for remaining subreddits. Schedule: `0 */4 * * *` UTC.

**Priority:** 3 (low)

**pg-boss config:**
```typescript
{
  retryLimit: 2,
  retryDelay: 600,
  singleton: false, // allow concurrent runs for different subreddits
  expireInSeconds: 1200
}
```

**Worker timeout:** 90 seconds

**Output:** New records in `reddit_signals` table → feeds into `mv_trend_scores` refresh (via UC-7 pipeline) + creates candidate inputs for `socelle-generate-polls` queue.

**Rate limiting:** Respect Reddit's crawl rate: maximum 1 request per 2 seconds. User-agent: `SocelleBot/1.0 (+https://socelle.com/bot; data@socelle.com)`.

**Worker registration:**
```typescript
await boss.work('socelle-crawl-reddit', { teamSize: 3, teamConcurrency: 3 }, async (job) => {
  const { subreddit, listingType } = job.data;
  const posts = await fetchRedditListing(subreddit, listingType, { limit: 100 });
  const signals = extractSignals(posts, BRAND_DICTIONARY, TREATMENT_TAXONOMY);
  await upsertRedditSignals(signals);
  await flagPollCandidates(signals); // marks high-upvote questions for poll queue
});
```

---

### Queue 4: `socelle-assemble-brand-profiles`

**Function:** Combine pipeline data from multiple sources into complete `brand_profiles` rows. This is the monthly assembly job that powers every auto-generated `/brands/[slug]` page.

**Sources:**
- `brand_products` (from UC-6 Open Beauty Facts sync)
- `mv_brand_sentiment` (from UC-3 review aggregation)
- `mv_brand_trend_profile` (from UC-7 trend signals)
- `mv_education_content` — brand-linked education items (from UC-8)
- `mv_brand_adoption` — provider adoption data (from UC-1/2)
- Brand website scrape (Playwright) — logo URL, website description, social links

**Refresh:** Monthly — first Sunday of every month at 3:00 AM ET (`0 8 1-7 * 0` UTC)

**Priority:** 5 (medium)

**pg-boss config:**
```typescript
{
  retryLimit: 3,
  retryDelay: 7200,    // retry after 2 hours
  singleton: true,
  singletonKey: 'assemble-brand-profiles-monthly',
  expireInSeconds: 7200
}
```

**Worker timeout:** 600 seconds (10 minutes — this job processes 500+ brands)

**Process:**
```
For each brand in socelle.brands WHERE is_active = true:
  1. Pull product catalog from brand_products WHERE brand_id = ?
  2. Pull sentiment from mv_brand_sentiment WHERE brand_id = ?
  3. Pull trend profile from mv_brand_trend_profile WHERE brand_id = ?
  4. Pull education items from mv_education_content WHERE brand_mentions @> ARRAY[brand_id]
  5. Pull adoption data from mv_brand_adoption WHERE brand_id = ?
  6. Compose auto_description (150-200 words) using template + extracted data
  7. Compute overall confidence_level as MIN(all source confidence levels)
  8. Upsert brand_profiles record
  9. Trigger Google Search Console sitemap ping for new/updated profiles
```

**Expected output per run:** 500+ brand profile updates

**Worker registration:**
```typescript
await boss.work('socelle-assemble-brand-profiles', { teamSize: 1, teamConcurrency: 1 }, async (job) => {
  const brands = await getActiveBrands();

  for (const brand of brands) {
    const [products, sentiment, trends, education, adoption] = await Promise.all([
      getBrandProducts(brand.id),
      getBrandSentiment(brand.id),
      getBrandTrendProfile(brand.id),
      getBrandEducationContent(brand.id),
      getBrandAdoption(brand.id)
    ]);

    const profile = assembleBrandProfile({ brand, products, sentiment, trends, education, adoption });
    await upsertBrandProfile(profile);
    await pingSearchConsole(brand.slug);
  }
});
```

---

### Queue 5: `socelle-match-affiliates`

**Function:** Auto-match affiliate products to content categories and placement surfaces. Creates `affiliate_placements` records for human editorial approval before any placement goes live.

**Sources:**
- `affiliate_products` — curated product catalog with commission data
- `feed_items` — recently published news and education items
- `socelle.events` — upcoming industry events
- `mv_trend_scores` — trending topics for contextual matching

**Refresh:** Weekly — every Wednesday at 1:00 AM ET (`0 6 * * 3` UTC)

**Priority:** 3 (low)

**pg-boss config:**
```typescript
{
  retryLimit: 2,
  retryDelay: 1800,
  singleton: true,
  singletonKey: 'match-affiliates-weekly',
  expireInSeconds: 3600
}
```

**Worker timeout:** 180 seconds

**Matching logic:**
- Match affiliate product `category` to feed item `content_categories[]` using string intersection
- Boost matches where product keywords appear in article title/summary
- `relevance_score` computed as: `(category_match_score * 0.5) + (keyword_match_score * 0.3) + (brand_sentiment_score_normalized * 0.2)`
- `relevance_score >= 0.6`: auto-create `affiliate_placements` record with `status = 'pending_review'`
- `relevance_score 0.4–0.59`: create record with `status = 'low_confidence_review'` and `requires_editorial = true`
- `relevance_score < 0.4`: do not create placement record

**Output:** Creates or updates `affiliate_placements` records — all with `status = 'pending_review'` or `'low_confidence_review'`. NO placements go live automatically. Human editorial approval required.

**Worker registration:**
```typescript
await boss.work('socelle-match-affiliates', { teamSize: 1, teamConcurrency: 1 }, async (job) => {
  const [products, recentContent, upcomingEvents, trendingTopics] = await Promise.all([
    getActiveAffiliateProducts(),
    getRecentFeedItems({ hours: 168 }), // last 7 days
    getUpcomingEvents({ days: 30 }),
    getTopTrendingTopics({ limit: 20 })
  ]);

  const placements = computeAffiliatePlacements(products, recentContent, upcomingEvents, trendingTopics);
  const filtered = placements.filter(p => p.relevanceScore >= 0.4);
  await upsertAffiliatePlacements(filtered);
  await notifyEditorOfPendingPlacements(filtered.length);
});
```

---

### Queue 6: `socelle-enrich-profiles`

**Function:** Auto-enrich new professional profiles from public data. Triggered by new `user_profile` creation webhook, not on a fixed schedule.

**Sources:**
- State license databases — 14 states with public lookup APIs: CA (BREEZE), TX (TDLR), FL (DBPR), NY (OP), IL (IDFPR), WA (DOL), CO (DORA), AZ (AZSOS), GA (SOS), NC (NCBLEC), VA (DPOR), OH (eLicense), PA (PALS), NJ (Division of Consumer Affairs)
- Social bio enrichment — public-facing LinkedIn profile summaries (lawful public data only, no login bypass)
- SOCELLE Explore Profile data — self-reported specialty and experience

**Refresh:** On signup — triggered by Supabase database webhook on `INSERT INTO user_profiles`

**Priority:** 7 (high — new user experience depends on fast enrichment)

**pg-boss config:**
```typescript
{
  retryLimit: 3,
  retryDelay: 60,      // retry quickly — user is waiting
  singleton: false,    // allow concurrent enrichments for different users
  expireInSeconds: 300
}
```

**Worker timeout:** 60 seconds per user

**Process:**
```
1. Receive new user_profile record (user_id, name, state, specialty)
2. Look up state license database for matching record (name + state)
3. If license found: verify active status + extract license_number, specialty, expiration_date
4. Update user_profiles: license_verified = true, license_status = 'active', specialty = [from license]
5. NEVER store raw license data — store only: verification_status, license_expires_at, specialty
6. Log enrichment attempt to profile_enrichment_log (success/fail/not_found)
7. If not found: flag profile for optional manual verification
```

**Privacy guarantee:** Raw license data is never stored. Only verification status and expiration date are persisted. All processing happens in-memory within the worker.

**Worker registration:**
```typescript
await boss.work('socelle-enrich-profiles', { teamSize: 5, teamConcurrency: 5 }, async (job) => {
  const { userId, name, state, specialty } = job.data;

  const licenseResult = await lookupStateLicense({ name, state, specialty });

  if (licenseResult.found && licenseResult.status === 'active') {
    await updateUserProfile(userId, {
      license_verified: true,
      license_status: 'active',
      license_expires_at: licenseResult.expiration_date,
      verified_specialty: licenseResult.specialty
    });
  }

  await logEnrichmentAttempt(userId, licenseResult.status);
});
```

---

### Queue 7: `socelle-generate-polls`

**Function:** LLM-assisted poll generation from trending topics. Creates draft polls for human review. NEVER auto-publishes.

**Sources:**
- `mv_trend_scores` — top trending topics this week
- `feed_items` (type=news) — recent high-engagement articles
- `reddit_signals` — high-upvote question posts flagged by `socelle-crawl-reddit`

**Refresh:** Monday, Wednesday, Friday at 8:00 AM ET (`0 13 * * 1,3,5` UTC)

**Priority:** 2 (low — non-critical, human review required)

**pg-boss config:**
```typescript
{
  retryLimit: 1,
  retryDelay: 3600,
  singleton: true,
  singletonKey: 'generate-polls',
  expireInSeconds: 1800
}
```

**Worker timeout:** 120 seconds

**Process:**
```
1. Pull top 5 trending topics from mv_trend_scores (TDI > 40, trend_velocity = 'rising')
2. Pull top 3 high-upvote question posts from reddit_signals (flagged by crawl-reddit queue)
3. For each topic: generate poll draft via LLM
   - Poll question (professional tone, industry-specific vocabulary)
   - 3-4 answer options (balanced, non-leading)
   - Suggested specialty_tags for targeted display
4. INSERT into socelle.polls with status = 'draft', auto_generated = true
5. Notify content editor via Slack + in-platform notification
```

**CRITICAL RULE:** All polls have `status = 'draft'` and `published = false` on creation. The content editor must:
1. Review poll question for accuracy and professional appropriateness
2. Verify answer options are balanced and non-leading
3. Assign target_specialty_tags
4. Set `status = 'approved'` and manually set `published = true`

Auto-publishing is permanently disabled at the database level via a `BEFORE INSERT OR UPDATE` trigger that prevents `published = true` where `auto_generated = true AND status != 'approved'`.

**Worker registration:**
```typescript
await boss.work('socelle-generate-polls', { teamSize: 1, teamConcurrency: 1 }, async (job) => {
  const [trendingTopics, redditQuestions] = await Promise.all([
    getTopTrendingTopics({ minTDI: 40, velocity: 'rising', limit: 5 }),
    getFlaggedRedditQuestions({ limit: 3 })
  ]);

  const sources = [...trendingTopics, ...redditQuestions].slice(0, 5);

  for (const source of sources) {
    const pollDraft = await generatePollDraft(source); // LLM call
    await insertDraftPoll({
      ...pollDraft,
      status: 'draft',
      published: false,  // ALWAYS false — never override
      auto_generated: true,
      source_type: source.type,
      source_id: source.id
    });
  }

  await notifyContentEditor({ pollsCreated: sources.length });
});
```

---

### Queue 8: `socelle-compute-brand-scores`

**Function:** Refresh materialized views for brand sentiment, adoption scores, and trend profiles. Keeps brand profile pages current between monthly full assemblies.

**Sources:**
- `brand_reviews` — new reviews submitted since last run
- `explore_profile_brand_usage` — new brand usage data from operator profiles
- Pipeline data from UC-3, UC-6, UC-7

**Refresh:** Daily at 1:00 AM ET (`0 6 * * *` UTC)

**Priority:** 5 (medium)

**pg-boss config:**
```typescript
{
  retryLimit: 3,
  retryDelay: 1800,
  singleton: true,
  singletonKey: 'compute-brand-scores-daily',
  expireInSeconds: 3600
}
```

**Worker timeout:** 300 seconds

**Output:** Refreshes the following materialized views:
- `mv_brand_sentiment` — recalculates SQS scores with new reviews
- `mv_brand_adoption` — updates adoption percentages with new explore profile data
- `mv_brand_trend_profile` — pulls latest trend scores for brand keywords
- `mv_brand_scores` — composite brand ranking score (sentiment + adoption + trend)

```sql
-- Executed sequentially in this order by the queue worker:
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_brand_sentiment;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_brand_adoption;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_brand_trend_profile;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_brand_scores;
```

**Worker registration:**
```typescript
await boss.work('socelle-compute-brand-scores', { teamSize: 1, teamConcurrency: 1 }, async (job) => {
  const views = [
    'mv_brand_sentiment',
    'mv_brand_adoption',
    'mv_brand_trend_profile',
    'mv_brand_scores'
  ];

  for (const view of views) {
    await supabase.rpc('refresh_materialized_view', { view_name: view });
    await logRefresh(view, { status: 'success', refreshedAt: new Date() });
  }
});
```

---

### Queue 9: `socelle-send-briefings`

**Function:** Compile and send the daily professional briefing email. Personalized by specialty and location.

**Sources:**
- `feed_items` — articles published in the last 24 hours (top 5 by engagement score)
- `socelle.events` — upcoming events in the next 7 days (filtered by user location/specialty)
- `socelle.polls` — active polls published this week
- `affiliate_products` — 2 editor-approved affiliate picks for the week
- `user_profiles` — specialty, location, briefing preferences

**Refresh:** Daily at 6:00 AM ET (`0 11 * * *` UTC)

**Priority:** 7 (high — user-facing, time-sensitive)

**pg-boss config:**
```typescript
{
  retryLimit: 2,
  retryDelay: 600,
  singleton: true,
  singletonKey: 'send-briefings-daily',
  expireInSeconds: 7200 // must complete within 2 hours
}
```

**Worker timeout:** 7200 seconds (2 hours — total batch window)

**Process:**
```
1. Compile shared content sections (same for all users):
   - Top 3 news items (highest editorial_priority_score from last 24h)
   - 1 trend alert (top rising TDI keyword)
   - Active poll CTA
   - 2 affiliate picks (editor-approved for this week)

2. Personalize per user segment (specialty + metro):
   - Local events section (events in user's metro + specialty, next 7 days)
   - 1 specialty-specific news item (filtered by specialty_tags)
   - Benchmarking teaser (for premium subscribers only)

3. Render email template (React Email or Resend template)

4. Send in batches of 500 users, rate limit: 100 emails/second
   - Email provider: Resend (primary) with SendGrid fallback

5. Honor unsubscribe preferences: check briefing_preferences table before each batch
   - Unsubscribes applied within 1 send cycle (never send to unsubscribed user)

6. Log delivery stats to briefing_send_log
```

**Worker registration:**
```typescript
await boss.work('socelle-send-briefings', { teamSize: 1, teamConcurrency: 1 }, async (job) => {
  const sharedContent = await compileBriefingContent();
  const subscribedUsers = await getBriefingSubscribers(); // respects preferences

  const batches = chunk(subscribedUsers, 500);

  for (const batch of batches) {
    const personalizedEmails = await Promise.all(
      batch.map(user => personalizeBriefing(user, sharedContent))
    );
    await sendEmailBatch(personalizedEmails, { rateLimit: 100 }); // per second
    await logBatchDelivery(batch.map(u => u.id));
  }
});
```

---

### Queue 10: `socelle-track-freshness`

**Function:** Monitor data freshness SLAs across all `socelle.*` tables. Create alerts when SLAs are breached. The monitoring layer for the entire automation system.

**Sources:** All tables with `updated_at`, `last_pulled_at`, or `last_computed_at` columns in the `socelle.*` schema.

**Refresh:** Nightly at 12:00 AM ET (`0 5 * * *` UTC)

**Priority:** 5 (medium)

**pg-boss config:**
```typescript
{
  retryLimit: 2,
  retryDelay: 900,
  singleton: true,
  singletonKey: 'track-freshness-nightly',
  expireInSeconds: 1800
}
```

**Worker timeout:** 120 seconds

**SLA Thresholds:**

| Table / Surface | SLA | Alert Threshold | Severity |
|---|---|---|---|
| `feed_items` (type=news) | 6 hours | > 8 hours since last item | HIGH |
| `socelle.events` | 7 days | > 10 days since last crawl | MEDIUM |
| `brand_profiles` | 30 days | > 45 days since last assembly | MEDIUM |
| `mv_trend_scores` | 7 days | > 10 days | MEDIUM |
| `mv_education_content` | 24 hours | > 36 hours | HIGH |
| `mv_brand_sentiment` | 7 days | > 10 days | LOW |
| `mv_metro_benchmarks` | 7 days | > 14 days | LOW |
| `mv_business_scores` | 24 hours | > 36 hours | MEDIUM |
| `affiliate_placements` | 7 days | > 14 days since last match run | LOW |
| `briefing_send_log` | 24 hours | > 26 hours since last send | HIGH |

**On SLA breach:**
1. Create record in `socelle.data_quality_alerts` with severity, table_name, hours_stale, and recommended_action
2. Send Slack notification to `#data-alerts` channel (HIGH severity: immediate; MEDIUM: daily digest; LOW: weekly digest)
3. Do NOT automatically trigger re-runs — alert only; human decision to re-trigger

**Worker registration:**
```typescript
await boss.work('socelle-track-freshness', { teamSize: 1, teamConcurrency: 1 }, async (job) => {
  const checks = await runFreshnessChecks(FRESHNESS_SLA_CONFIG);
  const breaches = checks.filter(c => c.isBreached);

  for (const breach of breaches) {
    await createDataQualityAlert(breach);
    if (breach.severity === 'HIGH') {
      await sendSlackAlert(breach); // immediate
    }
  }

  await logFreshnessReport(checks);
});
```

---

## Section 3: RSS Feed Source Registry — 33+ Feeds

All feeds are checked for compliance before ingestion (see Section 5: Compliance Checklist). Feeds are processed by the `socelle-aggregate-news` queue every 6 hours. Priority indicates launch priority: start with the 15 HIGH-priority feeds in week 1 and expand weekly.

---

### Beauty Publications — Consumer + Professional Crossover (10 feeds)

| Publication | RSS URL | Category | Audience Level | Refresh Priority | Posts/Week | Primary Content Categories |
|---|---|---|---|---|---|---|
| Allure | `https://www.allure.com/feed/rss` | Beauty / Skincare | Consumer | HIGH | 30–50 | Skincare, trends, products, ingredients |
| Byrdie | `https://www.byrdie.com/feeds/all.rss` | Beauty / Wellness | Consumer | HIGH | 20–40 | Skincare, haircare, wellness, product reviews |
| Cosmopolitan Beauty | `https://www.cosmopolitan.com/style-beauty/beauty/` — verify URL before launch | Beauty | Consumer | MEDIUM | 15–25 | Trends, product recommendations, celebrity beauty |
| InStyle Beauty | `https://www.instyle.com/feeds/all.rss` — verify URL before launch | Beauty / Fashion | Consumer | MEDIUM | 10–20 | Trends, luxury beauty, skincare |
| Refinery29 Beauty | `https://www.refinery29.com/rss.xml` (filter: beauty tag) — verify filter syntax before launch | Beauty | Consumer | MEDIUM | 15–25 | Diversity-forward beauty, inclusive skincare, trends |
| WWD Beauty | `https://wwd.com/feed/?category=beauty` — verify URL before launch | Beauty / Business | Professional | HIGH | 10–20 | Industry news, brand launches, M&A, retail trends |
| Glossy | `https://www.glossy.co/feed` | Beauty Business | Professional | HIGH | 5–10 | Brand strategy, DTC beauty, retail, industry analysis |
| Beauty Independent | `https://www.beautyindependent.com/feed/` | Indie Beauty / Business | Professional | HIGH | 10–15 | Indie brand news, formulation, founder stories |
| Beauty Packaging | `https://www.beautypackaging.com/rss/` | Beauty Industry | Professional | MEDIUM | 5–10 | Packaging trends, sustainability, supply chain |
| Global Cosmetics Industry | `https://www.gcimagazine.com/rss/` | Beauty Industry | Professional | LOW | 3–8 | Formulation science, regulatory, ingredient trends |

---

### Professional Beauty Publications (9 feeds)

| Publication | RSS URL | Category | Audience Level | Refresh Priority | Posts/Week | Primary Content Categories |
|---|---|---|---|---|---|---|
| Modern Salon | `https://www.modernsalon.com/rss/` | Salon / Haircare | Professional | HIGH | 10–20 | Haircare techniques, business, product launches |
| American Salon | `https://www.americansalon.com/feed/` — verify URL before launch | Salon | Professional | MEDIUM | 5–10 | Salon business, color, styling techniques |
| Salon Today | `https://www.salontoday.com/rss` — verify URL before launch | Salon Business | Professional | MEDIUM | 5–8 | Salon management, business coaching, staffing |
| Behind The Chair Blog | `https://btcpro.com/feed/` — verify URL before launch | Haircare | Professional | HIGH | 15–25 | Techniques, education, product reviews, business |
| Dermascope | `https://www.dermascope.com/rss.xml` | Esthetics / Skincare | Professional | HIGH | 5–10 | Esthetics techniques, ingredient education, CE content |
| Skin Inc Magazine | `https://www.skininc.com/rss/` | Esthetics / Clinical | Professional | HIGH | 8–15 | Skincare science, esthetics, medspa crossover |
| Les Nouvelles Esthétiques | `https://www.lnemagazine.com/feed/` — verify URL before launch | Esthetics | Professional | MEDIUM | 3–6 | Esthetics techniques, luxury spa, international trends |
| Beauty Launchpad | `https://www.beautylaunchpad.com/rss/` — verify URL before launch | Cosmetology | Professional | LOW | 3–6 | Salon, color, nail, education |
| Nail Pro Magazine | `https://www.nailpro.com/rss/` — verify URL before launch | Nail | Professional | LOW | 5–10 | Nail techniques, products, business |

---

### Medspa / Clinical Publications (6 feeds)

| Publication | RSS URL | Category | Audience Level | Refresh Priority | Posts/Week | Primary Content Categories |
|---|---|---|---|---|---|---|
| Dermatology Times | `https://www.dermatologytimes.com/rss` | Clinical Dermatology | Clinical | HIGH | 10–20 | Dermatology research, treatments, regulatory, devices |
| Practical Dermatology | `https://practicaldermatology.com/feed/` — verify URL before launch | Clinical | Clinical | MEDIUM | 5–10 | Treatment protocols, device reviews, clinical cases |
| Aesthetic Society News | `https://www.surgery.org/feed/` — verify URL before launch | Aesthetic Medicine | Clinical | MEDIUM | 3–6 | Aesthetic surgery, injectables, device news |
| AmSpa Blog | `https://americanmedspa.org/blog/feed/` — verify URL before launch | Medspa Business | Professional | HIGH | 3–8 | Medspa compliance, business, marketing, regulations |
| Modern Aesthetics | `https://www.modernaesthetics.com/rss.xml` — verify URL before launch | Aesthetic Medicine | Clinical | MEDIUM | 5–10 | Aesthetic treatments, device reviews, clinical education |
| The Aesthetic Guide | `https://www.aestheticguide.com/feed/` — verify URL before launch | Aesthetics | Professional | LOW | 3–5 | Aesthetic business, treatment trends |

---

### Business / Spa Industry Publications (4 feeds)

| Publication | RSS URL | Category | Audience Level | Refresh Priority | Posts/Week | Primary Content Categories |
|---|---|---|---|---|---|---|
| Spa Business Magazine | `https://www.spabusiness.com/feed.xml` — verify URL before launch | Spa Business | Professional | HIGH | 5–8 | Spa management, trends, design, wellness, benchmarking |
| Spa Opportunities | `https://www.spaopportunities.com/feed/` — verify URL before launch | Spa Industry | Professional | LOW | 3–5 | Jobs, spas for sale, industry news |
| Spa Executive | `https://www.spawire.com/feed/` — verify URL before launch | Spa Business | Professional | MEDIUM | 3–6 | Spa leadership, operations, wellness business |
| Professional Beauty Association | `https://probeauty.org/feed/` — verify URL before launch | Beauty Industry | Professional | MEDIUM | 2–5 | Industry advocacy, regulatory, business resources |

---

### Brand Blogs with RSS Feeds (4 feeds)

| Brand | RSS URL | Category | Audience Level | Refresh Priority | Posts/Week | Notes |
|---|---|---|---|---|---|---|
| Dermalogica Blog | `https://www.dermalogica.com/blogs/news.atom` | Professional Skincare | Professional | HIGH | 2–4 | Education content, ingredient spotlights, technique guides |
| SkinCeuticals Blog | `https://www.skinceuticals.com/blog.rss` — verify URL before launch | Clinical Skincare | Clinical/Professional | MEDIUM | 1–3 | Science-backed skincare, clinical protocols |
| Wella Professionals Blog | `https://www.wella.com/professional/feed/` — verify URL before launch | Professional Haircare | Professional | MEDIUM | 2–4 | Color education, technique trends, product launches |
| Olaplex Blog | `https://olaplex.com/blogs/news.atom` — verify URL before launch | Haircare | Professional/Consumer | LOW | 1–3 | Bond science education, technique spotlights |

---

### Launch Priority Summary

**Week 1 (15 HIGH-priority feeds):** Allure, Byrdie, WWD Beauty, Glossy, Beauty Independent, Modern Salon, Behind The Chair Blog, Dermascope, Skin Inc Magazine, Dermatology Times, AmSpa Blog, Spa Business Magazine, Dermalogica Blog, Practical Dermatology, Spa Executive

**Week 2–3 (add MEDIUM feeds):** Beauty Packaging, American Salon, Salon Today, Refinery29 Beauty, InStyle, Cosmopolitan Beauty, Aesthetic Society News, Modern Aesthetics, PBA, SkinCeuticals Blog, Wella Blog

**Week 4+ (add LOW feeds):** Global Cosmetics Industry, Les Nouvelles Esthétiques, Beauty Launchpad, Nail Pro, Aesthetic Guide, Spa Opportunities, Olaplex Blog

**Verification before launch:** All feeds marked "verify URL before launch" must be tested in staging with a live fetch before the first production run.

---

## Section 4: Automation vs. Human Decision Matrix

### Decision Matrix Table

| Surface | Automated | Human Required | Human Time Estimate |
|---|---|---|---|
| Brand profiles (auto section) | 100% — assembled from pipeline data: product catalog, sentiment scores, trend data, adoption maps, auto-description generation | Quarterly editorial review of top 50 brands for accuracy and tone | 4 hrs/quarter = 20 min/week amortized |
| News feed | 95% — RSS pull, auto-categorize with NLP classifier, dedup by URL hash, insert into feed_items | Select 2–3 "Featured" articles per day for homepage prominence | 15 min/day = 1.75 hrs/week |
| Events calendar | 85% — scrape + normalize + dedup from 14 sources, auto-tag by type and CE availability | Verify new events before they publish (capacity, cancellations, duplicate sources), confirm cancelled events, manually add major events missed by crawl | 30 min/week |
| Trends | 90% — pipeline computes TDI scores, lifecycle stages, velocity labels, and brand keyword mapping | Review lifecycle stage transitions for top 20 brands; confirm no egregious misclassifications (e.g., brand in decline labeled "emerging") | 15 min/week |
| Education index | 80% — YouTube API, RSS aggregation, PubMed fetch, auto-categorization by topic keyword match | Tag audience level (consumer/professional/clinical) for new content items where NLP confidence is LOW; spot-check CE credit accuracy for recently indexed courses | 20 min/week |
| Affiliate placements | 70% — auto-match by category + keyword relevance scoring (>= 0.6 threshold creates pending placement) | Editorial curation: review pending placements, approve/reject, ensure brand sentiment alignment, manually curate "Socelle Picks" weekly editorial selection | 1 hr/week |
| Profile enrichment | 95% — license database lookup + social bio auto-parse + Explore Profile data integration | User confirms/edits enriched data on their own profile (0 staff time); handle exception cases where license lookup fails for valid professionals | 0 min/week (user self-service) |
| Polls / quizzes | 50% — LLM generates draft question + answer options from trending topics; auto-flags reddit questions as poll candidates | Human reviews and approves EVERY poll before publish: question accuracy, answer balance, professional tone, specialty targeting | 2 hrs/week |
| Daily briefing email | 90% — auto-compiled content sections + personalization by specialty + location; email render + batch send | Spot-check 1 rendered email per audience segment per day (approx. 5 segments); check personalization logic; confirm affiliate picks are appropriate for that day's content mix | 5 min/day = 35 min/week |
| Brand page analytics | 100% — page views, click events, and claim conversion tracked automatically via Supabase analytics | None — data feeds admin dashboard automatically | 0 min/week |

**Total steady-state human effort: 6–8 hours per week.**

---

### Staffing Recommendation

SOCELLE's automation architecture is designed to run on 6–8 hours per week of editorial oversight. A single content editor (20 hrs/week) can manage SOCELLE's content operations while spending the remaining 12+ hours on higher-value work: outreach, partnerships, and quality curation.

The full 20 hrs/week breaks down as:

| Category | Hours/Week | Examples |
|---|---|---|
| Automation oversight (per matrix above) | 6–8 hrs | Featured picks, poll approval, affiliate curation |
| Outreach and partnerships | 4–6 hrs | Reaching out to brands about unclaimed profiles, sourcing new affiliate programs |
| Quality curation and content strategy | 2–4 hrs | Selecting quarterly brand review queue, calibrating NLP category rules |
| New source onboarding | 1–2 hrs | Vetting new RSS feeds, completing compliance checklists |

This is not a full-time content operation. It is a technology platform with editorial oversight. The automation does the work; the editor ensures it does the work correctly.

---

## Section 5: Compliance Checklist Template

Copy this template for every new data source added to SOCELLE. File completed checklists in `/platform/source-compliance/[source-slug]-compliance.md`.

```markdown
## New Source Compliance Checklist: [Source Name]

**Source:** [full source name]
**URL:** [base URL]
**Type:** RSS | HTML scrape | API | Manual import
**Queue:** [pg-boss queue name this source feeds into]
**Added by:** [name] | **Date:** [YYYY-MM-DD]
**Review approved by:** [name] | **Date:** [YYYY-MM-DD]

---

### Pre-Launch Checks

#### Crawl Permission
- [ ] robots.txt checked at [url]/robots.txt — our user-agent (`SocelleBot/1.0`) allowed? [yes / no / not specified]
- [ ] Crawl-Delay specified in robots.txt? [X seconds or "not specified"]
- [ ] Our user-agent string used in all requests: `SocelleBot/1.0 (+https://socelle.com/bot; data@socelle.com)`
- [ ] No CAPTCHA or bot detection encountered during test scrape
- [ ] If blocked: alternative method identified (RSS instead of scrape, API instead of scrape)

#### Content Legality
- [ ] Content is lawfully public — no login-wall bypass required [yes / no]
- [ ] Terms of Service reviewed — ToS URL: [url]
- [ ] ToS prohibits automated access? [yes / no]
  - If YES: document alternative access method or do not add source
- [ ] Content is copyrightable — our use is [headline + URL only / excerpt / full text]
- [ ] Attribution required per ToS or license? [yes / no] — if yes: attribution method: [inline credit / footer / none]
- [ ] Open license (CC, RSS without restriction)? [yes / no / partial]

#### Technical Setup
- [ ] Rate limit set in `crawl_access_policy` table: [X requests/minute]
- [ ] Respect header `Retry-After` on 429 responses? [yes — configured in worker]
- [ ] Source added to appropriate pg-boss queue configuration: [queue name]
- [ ] Parser function created: `parsers/[source-slug].ts`
- [ ] Parser tested with live sample response — output validated
- [ ] Raw response caching configured in `response_cache` table (TTL: [X hours])
- [ ] Error handling tested: 404 response [handled], 503 timeout [handled], malformed HTML [handled]
- [ ] Deduplication logic verified — using: [hash(url) / hash(url+date) / source_id]
- [ ] Test run completed in staging environment — [N] items ingested correctly

#### Content Quality
- [ ] Sample output (20+ items) reviewed by content editor — quality acceptable? [yes / no]
- [ ] Content categories assigned correctly by NLP classifier [yes / no / manually overridden]
- [ ] Audience level tagged correctly: [consumer / professional / clinical]
- [ ] Language: English only? [yes / no] — if no: translation pipeline configured? [yes / no / deferred]
- [ ] Duplicate content issue? (same articles from multiple feeds) — deduplicated by [method]

---

### Ongoing Monitoring

- [ ] Added to `freshness_sla` table with threshold: [X hours]
- [ ] Alert configured in `socelle-track-freshness` queue if SLA breached
- [ ] Slack alert channel configured for breach notification: `#data-alerts`
- [ ] Alert configured if scrape fails 3+ consecutive times
- [ ] Quarterly review date scheduled in content calendar: [YYYY-QN]

---

### Notes

[Any additional compliance considerations, edge cases, or decisions made during review]
```

---

## Section 6: pg-boss Queue Registry — Configuration Reference

Complete TypeScript configuration. Import this into the job system setup file. All queues run within the same pg-boss instance as the shared pipeline queues.

```typescript
// /lib/jobs/socelleQueues.ts
// SOCELLE-specific pg-boss queue configurations
// These queues run within the same pg-boss instance as the shared Beauty Intelligence pipeline queues.
// Do NOT create a new PgBoss instance — import the shared boss from /lib/jobs/pgBoss.ts

export const SOCELLE_QUEUES = {

  crawlEvents: {
    name: 'socelle-crawl-events',
    options: {
      retryLimit: 3,
      retryDelay: 3600,        // 1 hour between retries
      singleton: true,
      singletonKey: 'crawl-events-weekly',
      expireInSeconds: 3600
    },
    schedule: '0 7 * * 0',     // Sunday 2am ET (7am UTC)
    timeout: 300000,           // 5 minutes
    priority: 5,
    teamSize: 1,
    teamConcurrency: 1,
    description: 'Extract industry events from 14+ beauty industry sources including ISPA, PBA, Eventbrite, AmSpa, NCEA, ASCP, Cosmoprof, Premiere, IBS, and brand education pages'
  },

  aggregateNews: {
    name: 'socelle-aggregate-news',
    options: {
      retryLimit: 2,
      retryDelay: 300,          // 5 minutes between retries
      singleton: true,
      singletonKey: 'aggregate-news',
      expireInSeconds: 600
    },
    schedule: '0 */6 * * *',   // Every 6 hours
    timeout: 120000,           // 2 minutes
    priority: 8,
    teamSize: 2,
    teamConcurrency: 2,
    description: 'RSS aggregation from 33+ beauty publications — auto-categorize, dedup, publish to feed_items'
  },

  crawlReddit: {
    name: 'socelle-crawl-reddit',
    options: {
      retryLimit: 2,
      retryDelay: 600,          // 10 minutes between retries
      singleton: false,         // Allow concurrent subreddit crawls
      expireInSeconds: 1200
    },
    schedule: '0 */4 * * *',   // Every 4 hours
    timeout: 90000,            // 90 seconds
    priority: 3,
    teamSize: 3,
    teamConcurrency: 3,
    description: 'Monitor 7 beauty subreddits for trending topics, brand mentions, and operator questions'
  },

  assembleBrandProfiles: {
    name: 'socelle-assemble-brand-profiles',
    options: {
      retryLimit: 3,
      retryDelay: 7200,         // 2 hours between retries
      singleton: true,
      singletonKey: 'assemble-brand-profiles-monthly',
      expireInSeconds: 7200
    },
    schedule: '0 8 1-7 * 0',   // First Sunday of month, 3am ET (8am UTC)
    timeout: 600000,           // 10 minutes
    priority: 5,
    teamSize: 1,
    teamConcurrency: 1,
    description: 'Monthly assembly of 500+ brand profile pages from pipeline data sources'
  },

  matchAffiliates: {
    name: 'socelle-match-affiliates',
    options: {
      retryLimit: 2,
      retryDelay: 1800,         // 30 minutes between retries
      singleton: true,
      singletonKey: 'match-affiliates-weekly',
      expireInSeconds: 3600
    },
    schedule: '0 6 * * 3',     // Wednesday 1am ET (6am UTC)
    timeout: 180000,           // 3 minutes
    priority: 3,
    teamSize: 1,
    teamConcurrency: 1,
    description: 'Auto-match affiliate products to content surfaces — all matches require human editorial approval before going live'
  },

  enrichProfiles: {
    name: 'socelle-enrich-profiles',
    options: {
      retryLimit: 3,
      retryDelay: 60,           // 1 minute between retries (user is waiting)
      singleton: false,         // Allow concurrent enrichments
      expireInSeconds: 300
    },
    schedule: null,             // Event-triggered only (new user signup webhook)
    timeout: 60000,            // 1 minute per user
    priority: 7,
    teamSize: 5,
    teamConcurrency: 5,
    description: 'Auto-enrich new professional profiles from state license databases — triggered by signup webhook, never on schedule'
  },

  generatePolls: {
    name: 'socelle-generate-polls',
    options: {
      retryLimit: 1,
      retryDelay: 3600,         // 1 hour between retries
      singleton: true,
      singletonKey: 'generate-polls',
      expireInSeconds: 1800
    },
    schedule: '0 13 * * 1,3,5', // Mon/Wed/Fri 8am ET (1pm UTC)
    timeout: 120000,            // 2 minutes
    priority: 2,
    teamSize: 1,
    teamConcurrency: 1,
    description: 'LLM-assisted poll draft generation from trending topics — ALL drafts require human approval before publish, auto-publish is permanently disabled'
  },

  computeBrandScores: {
    name: 'socelle-compute-brand-scores',
    options: {
      retryLimit: 3,
      retryDelay: 1800,         // 30 minutes between retries
      singleton: true,
      singletonKey: 'compute-brand-scores-daily',
      expireInSeconds: 3600
    },
    schedule: '0 6 * * *',     // Daily 1am ET (6am UTC)
    timeout: 300000,           // 5 minutes
    priority: 5,
    teamSize: 1,
    teamConcurrency: 1,
    description: 'Daily refresh of brand sentiment, adoption, and trend materialized views'
  },

  sendBriefings: {
    name: 'socelle-send-briefings',
    options: {
      retryLimit: 2,
      retryDelay: 600,          // 10 minutes between retries
      singleton: true,
      singletonKey: 'send-briefings-daily',
      expireInSeconds: 7200
    },
    schedule: '0 11 * * *',    // Daily 6am ET (11am UTC)
    timeout: 7200000,          // 2 hours (batch window)
    priority: 7,
    teamSize: 1,
    teamConcurrency: 1,
    description: 'Compile and send personalized daily briefing emails — processes in batches of 500 at 100 emails/second'
  },

  trackFreshness: {
    name: 'socelle-track-freshness',
    options: {
      retryLimit: 2,
      retryDelay: 900,          // 15 minutes between retries
      singleton: true,
      singletonKey: 'track-freshness-nightly',
      expireInSeconds: 1800
    },
    schedule: '0 5 * * *',     // Daily 12am ET (5am UTC) — runs before briefings
    timeout: 120000,           // 2 minutes
    priority: 5,
    teamSize: 1,
    teamConcurrency: 1,
    description: 'Nightly SLA monitoring across all socelle.* tables — creates data_quality_alerts and Slack notifications on breach'
  }

} as const;

// Type helper
export type SocelleQueueName = typeof SOCELLE_QUEUES[keyof typeof SOCELLE_QUEUES]['name'];

// Registration helper — call once during server startup
export async function registerSocelleQueues(boss: PgBoss): Promise<void> {
  // Register scheduled queues
  for (const [key, queue] of Object.entries(SOCELLE_QUEUES)) {
    if (queue.schedule) {
      await boss.schedule(queue.name, queue.schedule, {}, queue.options);
      console.log(`[pg-boss] Scheduled: ${queue.name} @ ${queue.schedule}`);
    }
  }
}

// Freshness SLA configuration — used by socelle-track-freshness queue
export const FRESHNESS_SLA_CONFIG = [
  { table: 'feed_items',            maxAgeHours: 6,    severity: 'HIGH'   as const },
  { table: 'socelle.events',        maxAgeHours: 168,  severity: 'MEDIUM' as const }, // 7 days
  { table: 'brand_profiles',        maxAgeHours: 720,  severity: 'MEDIUM' as const }, // 30 days
  { table: 'mv_trend_scores',       maxAgeHours: 168,  severity: 'MEDIUM' as const },
  { table: 'mv_education_content',  maxAgeHours: 24,   severity: 'HIGH'   as const },
  { table: 'mv_brand_sentiment',    maxAgeHours: 168,  severity: 'LOW'    as const },
  { table: 'mv_metro_benchmarks',   maxAgeHours: 168,  severity: 'LOW'    as const },
  { table: 'mv_business_scores',    maxAgeHours: 24,   severity: 'MEDIUM' as const },
  { table: 'affiliate_placements',  maxAgeHours: 168,  severity: 'LOW'    as const },
  { table: 'briefing_send_log',     maxAgeHours: 26,   severity: 'HIGH'   as const },
] as const;
```

---

## Section 7: Steady-State Human Effort Budget

### Weekly Effort Table

| Task | Frequency | Time per Session | Weekly Total |
|---|---|---|---|
| Featured feed picks (select 2–3 articles to feature on homepage / top of feed) | Daily (M–F) | 15 min | 1.25 hrs |
| Weekend featured picks (Saturday/Sunday — lighter selection) | Daily (Sa–Su) | 5 min | 0.17 hrs |
| Event verification (review new events added by crawl, confirm/reject, check cancelled events) | Weekly (Monday) | 30 min | 0.5 hrs |
| Trend lifecycle review (confirm lifecycle transitions for top 20 tracked brands/treatments) | Weekly (Wednesday) | 15 min | 0.25 hrs |
| Education content tagging (tag audience level for items NLP tagged as LOW confidence) | Weekly (Thursday) | 20 min | 0.33 hrs |
| Affiliate curation (review pending placements, approve/reject, curate weekly "Socelle Picks") | Weekly (Tuesday) | 60 min | 1.0 hr |
| Poll / quiz review + approval (review LLM-generated drafts Mon/Wed/Fri — ~3 drafts per session) | 3× per week | 40 min | 2.0 hrs |
| Daily briefing spot-check (render and review 1 email per audience segment, ~5 segments) | Daily | 5 min | 0.58 hrs |
| Brand profile quarterly review (review top 50 brand pages for accuracy — amortized weekly) | Quarterly | 4 hrs | 0.31 hrs |

**Weekly Total: 6.44 hours**

---

### Budget Notes

**Conservative floor:** 6–7 hours per week. This assumes all automation is working correctly and the queue failure rate is below 5%.

**Launch calibration period:** During the first 4 weeks after launch, double the time budget to 12–14 hours per week for quality verification and calibration. Tasks during this period:
- Verify NLP categorization accuracy across a sample of 100+ articles
- Calibrate affiliate matching relevance thresholds (0.6 threshold may need tuning)
- Verify event deduplication is working correctly across all 14 sources
- Spot-check confidence score display across brand profile pages
- Confirm unsubscribe handling in briefing emails

After 4 weeks of stable operation, revert to the standard 6–8 hour budget.

**Scale consideration:** The 6–8 hour budget holds through approximately 100,000 monthly active users and 1,000+ brand profile pages. Beyond that scale, a second content editor covering weekend coverage becomes cost-justified. The automation architecture does not require additional engineering headcount to scale content volume.

**What is not in this budget:**
- New affiliate program outreach (handled separately by business development)
- Brand onboarding calls for claimed profiles (handled by brand success team)
- Technical incident response for queue failures (handled by engineering on-call)
- Strategic content planning and editorial calendar (handled monthly by leadership)

---

### Effort Budget by Surface

```
News feed:          26%  (1.67 hrs/wk) — daily featured picks + briefing spot-check
Polls / quizzes:    31%  (2.00 hrs/wk) — highest human touch, non-negotiable
Affiliate:          15%  (1.00 hr/wk)  — weekly curation batch
Events:              8%  (0.50 hrs/wk) — weekly verification
Trends:              4%  (0.25 hrs/wk) — lifecycle review
Education:           5%  (0.33 hrs/wk) — content tagging
Brand profiles:      5%  (0.31 hrs/wk) — quarterly review amortized
                  ─────
TOTAL:              94%  (6.06 hrs/wk core)
Buffer (6%):         ~0.38 hrs — unexpected items, ad-hoc reviews
WEEKLY TOTAL:       ~6.44 hrs
```

---

*Document version: 1.0 — March 2026*
*Next review: After Wave 1 launch (4-week calibration period complete)*
*Owner: Agent 6 — Automation Architecture Agent*
