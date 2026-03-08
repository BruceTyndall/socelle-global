> Updated to align with V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md on 2026-03-08.
> If this file conflicts with V1, the V1 file wins.

# SOCELLE DATA PROVENANCE POLICY
**Version:** 1.1
**Effective:** March 8, 2026
**Authority:** SOCELLE Command Center
**Scope:** All data ingestion, display, attribution, and intelligence surfaces across all 15 hubs

---

## 1. ALLOWED DATA SOURCES

### Tier 1 — Direct / Owned (Highest Trust)

| Source Type | Examples | Confidence Floor | Attribution |
|---|---|---|---|
| Platform-generated data | User activity, order history, signal interactions | High | "SOCELLE platform data" |
| Admin-managed signals | `brand_interest_signals`, curated market data | High | "SOCELLE editorial" |
| Brand-submitted data | Product catalogs, pricing, protocols, brand profiles | High | Brand name |
| User-submitted data | Job postings by operators, event submissions | Medium | Submitting entity |

### Tier 2 — Public / Structured (Medium Trust)

| Source Type | Examples | Confidence Floor | Attribution |
|---|---|---|---|
| Government / regulatory | FDA MAUDE, CPSC recalls, TGA adverse events, USPTO patents | High | Agency name + report ID |
| Academic / clinical | PubMed abstracts, PeerJ, clinical trial registries | High | Journal + DOI |
| Public RSS feeds | Trade publications (Dermascope, Modern Spa, BeautyStar, SkinInc) | Medium | Publication name + article URL |
| Public job boards | LinkedIn Jobs (public listings), Indeed (public API), ZipRecruiter | Medium | Board name + listing URL |
| Public event listings | Industry association calendars, Eventbrite (public), 10times | Medium | Source name + event URL |
| Company press releases | PRNewswire, BusinessWire, GlobeNewsWire | Medium | Company name + PR URL |

### Tier 3 — Aggregated / Derived (Lower Trust — Extra Scrutiny)

| Source Type | Examples | Confidence Floor | Attribution |
|---|---|---|---|
| Social media (public) | Public Instagram/TikTok post counts, public follower counts, hashtag volumes | Low | "Public social data" + platform name |
| News aggregation | Google News (headlines + snippets only), Factiva | Medium | Source publication, not aggregator |
| Market research (public) | Statista (free tier), IBISWorld (public summaries) | Low | Report name + date |

### DISALLOWED Sources

| Source | Reason | Violation Severity |
|---|---|---|
| Private social media data | ToS violation | P0 — immediately remove |
| Scraped copyrighted full-text | Copyright infringement | P0 — immediately remove |
| Private API endpoints without agreement | Unauthorized access | P0 — immediately remove |
| Leaked/confidential documents | Privacy violation | P0 — immediately remove |
| User DMs or private conversations | Privacy violation | P0 — immediately remove |
| Purchased data of unknown provenance | Compliance risk | P1 — audit and remove if needed |
| Self-reported "industry estimates" | Unverifiable | P1 — label as "estimate" with methodology |

---

## 2. ATTRIBUTION REQUIREMENTS

### Every Data Point Must Include

```typescript
interface DataAttribution {
  source_url: string;          // URL where data was obtained (required)
  source_name: string;         // Human-readable source name (required)
  published_at: string;        // When the source published this data (required)
  fetched_at: string;          // When SOCELLE ingested this data (required)
  confidence_score: number;    // 0.0 to 1.0 (required)
  confidence_tier: string;     // 'high' | 'medium' | 'low' (derived from score)
  attribution_text: string;    // Display-ready attribution line (required)
  license_type?: string;       // CC-BY, public domain, fair use, etc.
  expires_at?: string;         // When this data should be re-validated or removed
}
```

### Display Attribution Rules

| Context | Attribution Display |
|---|---|
| Signal card | Source name + "Updated {relative_time}" in card footer |
| Intelligence briefing | Source name + URL link for each data point |
| Market pulse | "Aggregated from {count} sources" + expandable source list |
| Job listing | Source board name in listing metadata |
| Event listing | Source name + "Verified {date}" stamp |
| Brand intelligence | "Based on {count} public data points" + source breakdown |
| AI-generated summary | "Summary based on: [source_1, source_2, ...]" |

---

## 3. CONFIDENCE SCORING

### Scoring Algorithm

```
confidence_score = base_trust × recency_factor × corroboration_factor

base_trust:
  Tier 1 (owned/direct)        = 0.90
  Tier 2 (public/structured)   = 0.70
  Tier 3 (aggregated/derived)  = 0.50
  
recency_factor:
  < 1 hour old                 = 1.00
  1–24 hours old               = 0.95
  1–7 days old                 = 0.85
  7–30 days old                = 0.70
  30–90 days old               = 0.50
  > 90 days old                = 0.30

corroboration_factor:
  3+ independent sources agree = 1.10 (cap at 1.0 total)
  2 sources agree              = 1.00
  1 source only                = 0.85
  contradicted by other source = 0.50
```

### Confidence Tier Mapping

| Score Range | Tier | Display | Color Token |
|---|---|---|---|
| 0.80 – 1.00 | High | `●` High Confidence | `--signal-up` (#5F8A72) |
| 0.50 – 0.79 | Medium | `●` Medium Confidence | `--signal-warn` (#A97A4C) |
| 0.20 – 0.49 | Low | `●` Low Confidence | `--signal-down` (#8E6464) |
| 0.00 – 0.19 | Insufficient | Not displayed | — (data hidden from public surfaces) |

### Display Rules

- **High confidence** data may be displayed prominently (lead signals, hero metrics).
- **Medium confidence** data may be displayed in grids and lists with confidence indicator visible.
- **Low confidence** data may only be displayed in detailed/expanded views, never in headlines or hero sections.
- **Insufficient confidence** data is hidden from all user-facing surfaces. Available only in admin audit views.

---

## 4. FRESHNESS SLAs

### Data Freshness Targets

| Data Category | Update Frequency | Staleness Threshold | Action When Stale |
|---|---|---|---|
| Market signals (RSS) | Every 1 hour | 6 hours | Hide from "live" surfaces, move to "recent" |
| Job listings | Every 4 hours | 48 hours | Mark as "may be closed" |
| Brand health metrics | Daily (6 AM EST) | 72 hours | Hide trend arrows, show static data |
| Event listings | Daily | 7 days | Show as-is with date (events have natural expiry) |
| Safety alerts | Real-time (on publication) | — | Never stale; historical record |
| Purchasing benchmarks | Weekly | 14 days | Label "as of {date}" |
| Education content | On publish | — | Never stale unless curriculum changes |

### Freshness Display

```typescript
function formatFreshness(updatedAt: Date): string {
  const minutes = differenceInMinutes(new Date(), updatedAt);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `Updated ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Updated ${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Updated ${days}d ago`;
  return `Updated ${format(updatedAt, 'MMM d')}`;
}
```

---

## 5. INFLUENCER MONITORING LIMITATIONS

### What Is Allowed

| Activity | Source | Lawfulness |
|---|---|---|
| Track public post counts by hashtag | Public Instagram/TikTok APIs or web counts | ✅ Public data |
| Track public follower counts | Public profile pages | ✅ Public data |
| Track public engagement rates | Public metrics (likes, comments, shares) | ✅ Public data |
| Aggregate public brand mentions | Public posts containing @brand or #brand | ✅ Public data |
| Monitor public trending topics | Public trending feeds | ✅ Public data |
| Track creator-published collaboration disclosures | Public #ad, #sponsored posts | ✅ Public data |

### What Is NOT Allowed

| Activity | Reason | Violation Severity |
|---|---|---|
| Access private/DM data | ToS violation, privacy law | P0 |
| Scrape at scale exceeding platform ToS rate limits | ToS violation | P0 |
| Store personal data without consent basis | GDPR/CCPA risk | P0 |
| Reverse-engineer private APIs | Computer fraud risk | P0 |
| Purchase black-market follower/engagement data | Data provenance violation | P0 |
| Track individual user behavior across platforms | Privacy violation | P0 |
| Impersonate users or brands to access data | Fraud | P0 |

### Influencer Data Storage Rules

```sql
-- Only public, aggregated metrics
CREATE TABLE influencer_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_handle TEXT NOT NULL,        -- Public handle only
  platform TEXT NOT NULL,              -- 'instagram', 'tiktok', etc.
  follower_count INTEGER,             -- Public count at fetch time
  avg_engagement_rate NUMERIC(5,4),   -- Computed from public metrics
  brand_mention_count INTEGER,        -- Count of public mentions
  fetched_at TIMESTAMPTZ NOT NULL,    -- When we collected this
  source_method TEXT NOT NULL,        -- 'public_api' | 'public_profile'
  -- NO private data, NO DMs, NO email, NO real name unless public
  CONSTRAINT lawful_source CHECK (source_method IN ('public_api', 'public_profile'))
);
```

---

## 6. CONTENT REUSE CONSTRAINTS

### Summarization Rules

| Source Content | Allowed Use | Not Allowed |
|---|---|---|
| News article (RSS) | Headline + 2-sentence summary + link to original | Full-text reproduction |
| Clinical abstract | Title + conclusion quote + DOI link | Full abstract copy |
| Job listing | Full reproduction with attribution (listings are factual) | Removing source attribution |
| Press release | Full reproduction with source (press releases are intended for redistribution) | Claiming as original content |
| Social media post | Embed or quote with attribution + link | Screenshot without attribution |
| Market research report | 1-2 data points with citation | Reproducing tables, charts, or methodology |

### AI-Generated Content Rules

| Context | Rule |
|---|---|
| Summaries of real data | ✅ Allowed — must cite all sources inline |
| Personalized intelligence briefs | ✅ Allowed — must disclose "AI-generated summary" |
| Fabricated data points | ❌ Never — AI may not generate fake statistics |
| Fabricated source citations | ❌ Never — all citations must be verifiable |
| Paraphrased copyrighted text | ⚠️ Caution — must be genuinely transformative, not light rewording |

---

## 7. TRUTHFULNESS POLICY (NON-NEGOTIABLE)

### Core Rule

**Never display fake numbers as live data.**

This is the single most important data integrity rule on the platform. Violations of this rule undermine the entire intelligence-first thesis.

### What Constitutes a Violation

| Violation | Example | Severity |
|---|---|---|
| Hardcoded "live" number | `"Updated 3 min ago"` with no database timestamp | P0 |
| Animated counter to zero without context | Counter animates 0→0 with no "data loading" state | P1 |
| Fake signal count | `"130+ sources"` when zero sources are connected | P0 |
| Fake freshness claim | `"Updated every 5 minutes"` with no refresh mechanism | P0 |
| Unlabeled mock data | Fallback data displayed without "Preview" or "Demo" label | P0 |
| Fake demographic data | `"12,500 professionals"` when the actual count is 0 | P0 |
| Inflated metrics | Rounding up or estimating numbers without transparency | P1 |

### Required Behavior

| Scenario | Correct Behavior |
|---|---|
| Data source exists, data is fresh | Display with real `updated_at` timestamp and confidence tier |
| Data source exists, data is stale | Display with "Last updated {date}" and remove "live" label |
| Data source doesn't exist yet | Display "Preview Mode" label, use obviously example content |
| Data count is zero | Display "0" honestly, with context ("No signals in the last 24 hours") |
| API returns error | Display "Data temporarily unavailable" — never fall back to fake data silently |

---

## 8. COMPLIANCE REFERENCE

| Regulation | Applicability | Key Requirements |
|---|---|---|
| GDPR (EU) | If serving EU users | Consent for data processing, right to deletion, data minimization |
| CCPA (California) | If serving CA users | Right to know, right to delete, opt-out of data sale |
| CAN-SPAM | Email communications | Opt-out mechanism, accurate sender info, no deceptive headers |
| FTC Guidelines | Influencer monitoring | Disclose material connections, truthful advertising |
| DMCA | Content ingestion | Respond to takedown notices, don't reproduce protected content |
| Platform ToS | Social media APIs | Respect rate limits and usage policies per platform |

---

## 9. CONSUMER BEAUTY SIGNALS — ALLOWED AS INTELLIGENCE INPUTS

**Added:** 2026-03-06 (Session 29) | **Authority:** Command Center | **Change class:** Additive clarification — no existing rule overridden.

### 9.1 Policy Statement

Consumer beauty sources (consumer publications, consumer product review platforms, consumer social signals, consumer beauty media) are **explicitly APPROVED** as upstream inputs for trend detection and demand forecasting on the SOCELLE intelligence platform.

**Rationale:** Intelligence-first thesis (CLAUDE.md §A) requires the broadest possible signal set to produce reliable trend and demand outputs. Excluding consumer signals — which are the primary leading indicators for ingredient trends, treatment demand, and product category growth — would degrade signal quality for professional operators. "Not a professional source" is not a valid provenance or compliance reason to exclude a source.

### 9.2 Classification Rules

| Rule | Requirement |
|---|---|
| **source_type label** | All consumer-origin records must carry `source_type = 'consumer'` in their row metadata or attribution struct |
| **Surface placement** | Consumer signals may only appear inside Intelligence surfaces (`/intelligence/*`, `/portal/intelligence`, `/brand/intelligence`) and signal overlays. They must NOT appear as primary nav anchors or audience-positioning copy. |
| **Commerce framing forbidden** | Consumer source data must never be used to reframe nav, copy, or IA toward consumer shopping. Commerce-first framing remains forbidden per CLAUDE.md §E. |
| **Exclusion requires documented cause** | An agent may only exclude a consumer source if a specific, documented reason exists: ToS violation, licensing restriction, copyright constraint, or data quality failure. "Not professional enough" is not a valid reason and will be treated as a Doc Gate FAIL. |
| **Attribution** | Consumer sources follow the same attribution rules as all Tier 2 sources (§2): source_url, source_name, published_at, fetched_at, confidence_score (base 0.70), attribution_text. |

### 9.3 UI Filtering Requirement

Every intelligence surface that mixes consumer and professional sources **must** provide the following filter modes:

| Mode | Behavior |
|---|---|
| **Pro-only** | Show only `source_type = 'professional'` records |
| **Consumer-only** | Show only `source_type = 'consumer'` records |
| **Combined (default)** | Show both; professional signals rendered as primary layer; consumer signals rendered as overlay or secondary tier |

The default view is Combined with pro-first presentation. This default may be changed per user preference but must ship as Combined.

### 9.4 Outreach / Lead Gen Restriction

No consumer-audience outreach, lead capture, or consumer marketing initiatives may launch from any consumer signal surface until the product owner explicitly lifts the no-outreach rule (CLAUDE.md §G). Intelligence surfaces may display signal data; they may NOT capture emails, run ads, or initiate acquisition flows toward a consumer audience.

### 9.5 Currently Approved Consumer Sources

The following consumer sources are explicitly cleared under this policy:

| Source | Feed / Endpoint | source_type | Tier |
|---|---|---|---|
| Allure | `allure.com/feed/rss` | consumer | Tier 2 |
| New Beauty | `newbeauty.com/feed/` | consumer | Tier 2 |
| Elle Beauty | `elle.com/rss/beauty.xml` | consumer | Tier 2 |
| Harper's Bazaar Beauty | `harpersbazaar.com/rss/beauty.xml` | consumer | Tier 2 |
| YouTube (beauty trends) | YouTube Data API v3 | consumer | Tier 2 |

Additional consumer sources may be added to `rss_sources` without a WO, provided: (a) they return HTTP 200 + valid RSS/API response, (b) they are verified under `SOCELLE_DATA_PROVENANCE_POLICY.md §1 Tier 2`, and (c) `source_type = 'consumer'` is set in the seed row.

---

### V1 Alignment Notes

This policy supports V1 §N (Live vs Demo Truth) and §O (AI Safety). Key requirements from V1:

- Every data surface must declare LIVE or DEMO truth level. MOCK (unlabeled) is forbidden.
- AI-generated content must always show "Generated by AI" with an expandable "Evidence & Logic" panel.
- Hard block on dosing, diagnoses, and prescriptions.
- Provider override for higher-risk suggestions requires NPI + scope_of_practice + rationale logged.
- All hooks must follow the `isLive` pattern per V1 §N.
- Intelligence Hub requires 37+ live feeds in the pipeline (V1 §I Phase 4).

---

*SOCELLE DATA PROVENANCE POLICY v1.1 — March 8, 2026 — Command Center Authority*
*§9 Consumer Beauty Signals — Added 2026-03-06 (Session 29)*
*Aligned to V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md*
