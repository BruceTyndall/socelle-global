# SOCELLE Industry Events System — Complete Specification

**Agent:** Industry Events Agent (Agent 4)
**Document:** SOCELLE_EVENTS_SPEC.md
**Version:** 1.0
**Date:** March 2026
**Status:** Production Specification — Ready for Engineering

---

## Overview

Industry events are a primary content surface for Socelle. Events drive SEO traffic via long-tail queries like "[event name] 2026" and "esthetician CE courses [state]," create weekly return visits through personalized digests, and unlock affiliate commerce via "prepare for [event]" recommendation blocks.

This specification covers the complete lifecycle: source identification → extraction → normalization → database storage → SEO-optimized event pages → cross-surface integration.

At steady state: 17+ active sources, 350–600 scraped events per year, 200+ indexed event pages, automated deduplication, and human review only for flagged edge cases.

---

## Section 1: Source Registry — 17 Sources

### 1.1 Complete Source Table

| # | Source Name | URL Pattern | Event Types | Extraction Method | Refresh Cadence | Expected Annual Volume |
|---|---|---|---|---|---|---|
| 1 | ISPA (International Spa Association) | `experienceispa.com/events` | Conference, webinar, town hall, research summit | HTML scrape (Playwright) | Monthly | 10–15/year |
| 2 | PBA (Professional Beauty Association) | `probeauty.org/events` | Conference, summit, education, trade show | HTML scrape (Playwright) | Monthly | 15–20/year |
| 3 | BehindTheChair | `behindthechair.com/events` | Show, education, brand events, competitions | HTML scrape + RSS feed | Monthly | 20–30/year |
| 4 | Live Love Spa | `livelovespa.com/events` | Spa events, retreats, networking, owner meetups | HTML scrape (Playwright) | Monthly | 15–25/year |
| 5 | Spa Collab | `spacollab.com` | Collaboration events, owner retreats, community | HTML scrape (Wix/Playwright) | Monthly | 5–10/year |
| 6 | Modern Salon | `modernsalon.com/events` | Education, boot camps, shows, competitions | HTML scrape | Monthly | 10–15/year |
| 7 | Eventbrite | `eventbrite.com/d/[category]/beauty-professionals` | All types — training, certification, networking | Eventbrite API v3 (free tier) | Weekly | 50–100 relevant/month |
| 8 | Cosmoprof North America | `cosmoprofnorthamerica.com` | Trade show, brand exhibition, education sessions | Manual + HTML scrape | Annually | 1–2/year |
| 9 | Premiere Orlando | `premiereorlandoshow.com` | Trade show, education, brand launches | Manual + HTML scrape | Annually | 1/year |
| 10 | IBS New York | `ibsnewyork.com` | Trade show, competition, education | Manual + HTML scrape | Annually | 1/year |
| 11 | AmSpa (American Med Spa Association) | `americanmedspa.org/events` | Medspa conference, compliance training, bootcamps | HTML scrape | Quarterly | 5–10/year |
| 12 | NCEA (National Coalition of Estheticians) | `ncea.tv/events` (previously naboretail.com) | Esthetician CE, certification, licensing review | HTML scrape | Quarterly | 10–20/year |
| 13 | ASCP (Associated Skin Care Professionals) | `ascpskincare.com/events` | Esthetician education, CE courses, webinars | HTML scrape | Quarterly | 10–15/year |
| 14 | Brand Education Pages | Multiple — see brand list below | Brand training, certification, product launches | Per-brand scrape of `/education` or `/events` | Monthly | 5–10 per brand |
| 15 | Dermascope Magazine | `dermascope.com/events` | Esthetician education, congresses, CE courses | HTML scrape | Monthly | 8–12/year |
| 16 | Skin Inc Magazine | `skininc.com/events` | Esthetician education, industry summits, webinars | HTML scrape + RSS | Monthly | 10–15/year |
| 17 | Associated Bodywork & Massage Professionals (ABMP) | `abmp.com/events` | Massage CE, wellness retreats, practitioner conferences | HTML scrape | Quarterly | 10–20/year |

**Additional Sources (Identified):**
- `waxingassociation.org/events` — Waxing CE, technique certifications (10–15/year)
- `nailsmag.com/events` — Nail industry shows, education (10–15/year)
- `americanspa.com/events` — Spa director education, owner retreats (8–12/year)

---

### 1.2 Extended Source Detail Table

#### Source 1: ISPA
| Field | Value |
|---|---|
| Base URL | `https://experienceispa.com/events` |
| Pagination | `/events?page=2`, `/events?page=3` (query string) |
| Key CSS Selectors | `.event-listing h2.event-title`, `.event-listing .event-date`, `.event-listing .event-location`, `.event-listing a.register-link`, `.event-listing .event-description` |
| Date Format | "March 15-17, 2026" → normalize to start/end date split |
| Authentication Required | No — public listing |
| robots.txt Status | Allowlisted for `/events` — no disallow rule for crawlers on this path |
| Rate Limit Recommendation | 1 request per 10 seconds; max 6 req/min |
| Special Handling | Paginated — crawl up to 5 pages per run; check for "No upcoming events" sentinel |

#### Source 2: PBA
| Field | Value |
|---|---|
| Base URL | `https://probeauty.org/events` |
| Key CSS Selectors | `.tribe-events-calendar .tribe-event-url`, `.tribe-events-calendar .tribe-event-schedule-details`, `.tribe-events-calendar .tribe-venue`, `.tribe-event-title`, `.tribe-events-pro-summary__event-datetime` |
| Date Format | "Monday, March 15, 2026 @ 9:00 am" → ISO split |
| Authentication Required | No |
| robots.txt Status | No disallow for `/events` — allowlisted |
| Rate Limit Recommendation | 1 request per 8 seconds |
| Special Handling | Uses The Events Calendar plugin (common WordPress pattern). Supports `/events/list/` URL for full list view — prefer this over calendar view. |

#### Source 3: BehindTheChair
| Field | Value |
|---|---|
| Base URL | `https://behindthechair.com/events` |
| RSS Feed | `https://behindthechair.com/feed/?post_type=tribe_events` |
| Key CSS Selectors | `.tribe-events-list .tribe-event-url`, `.tribe-event-name`, `.tribe-event-schedule-details`, `.tribe-venue-location`, `.tribe-events-schedule` |
| Date Format | "March 15 @ 9:00 am - March 17 @ 6:00 pm" → multi-day split |
| Authentication Required | No |
| robots.txt Status | Allowlisted — no `/events` disallow |
| Rate Limit Recommendation | 1 request per 8 seconds; use RSS as primary (faster, lighter) |
| Special Handling | Prefer RSS ingestion first; fall back to HTML scrape for fields missing from RSS items |

#### Source 4: Live Love Spa
| Field | Value |
|---|---|
| Base URL | `https://livelovespa.com/events` |
| Key CSS Selectors | `.eventlist-event .eventlist-title`, `.eventlist-meta-date`, `.eventlist-meta-address`, `.eventlist-description`, `.eventlist-column-info a` |
| Date Format | "Monday, March 15, 2026" |
| Authentication Required | No (some events may require member login for details — extract what is public) |
| robots.txt Status | Check on crawl — Squarespace platform; no known disallow |
| Rate Limit Recommendation | 1 request per 10 seconds |
| Special Handling | Squarespace platform — uses `.eventlist` class pattern. Some event detail pages may 401 for non-members. Capture public details only; note `requires_member_login = true` in metadata. |

#### Source 5: Spa Collab
| Field | Value |
|---|---|
| Base URL | `https://spacollab.com` (events may be at `/events` or `/retreats`) |
| Key CSS Selectors | Wix-based — `.wixui-rich-text`, `.event-list-item`, `[data-testid="event-title"]`, `[data-testid="event-date"]` |
| Date Format | Variable — normalize all encountered formats |
| Authentication Required | No |
| robots.txt Status | Wix default — check `spacollab.com/robots.txt` each run |
| Rate Limit Recommendation | 1 request per 15 seconds (Wix can rate-limit aggressively) |
| Special Handling | Wix JavaScript-rendered pages require Playwright with `waitForSelector`. Use 3s `waitUntil: networkidle`. Wix Events widget may use `wix-events` API internally — check network tab for JSON endpoints on first crawl. |

#### Source 6: Modern Salon
| Field | Value |
|---|---|
| Base URL | `https://modernsalon.com/events` |
| Key CSS Selectors | `.views-row .views-field-title`, `.views-field-field-event-date`, `.views-field-field-event-location`, `.views-field-body`, `.views-field-field-registration-link a` |
| Date Format | "March 15, 2026" or "March 15-17, 2026" |
| Authentication Required | No |
| robots.txt Status | Allowlisted — Bobit Media network, no known crawl restrictions on `/events` |
| Rate Limit Recommendation | 1 request per 8 seconds |
| Special Handling | Drupal Views — use `/events?page=0`, `/events?page=1` for pagination |

#### Source 7: Eventbrite
| Field | Value |
|---|---|
| API Base | `https://www.eventbriteapi.com/v3/events/search/` |
| Search Params | `q=beauty+professionals&categories=119&location.within=500mi&location.address=[city]&start_date.range_start=[today]` |
| Category IDs | 119 = Health & Wellness; also try 102 = Science & Technology for medspa/devices |
| Authentication | API key (free Eventbrite developer account — 2,000 calls/day) |
| robots.txt Status | N/A — using official API |
| Rate Limit | 1,000 req/hour per key; batch by metro to stay within limits |
| Special Handling | Response is JSON. Events include JSON-LD in HTML page — use API response directly. Cross-reference with manual medspa/esthetician keyword queries. Paginate with `continuation` token. Extract `organizer.name`, `venue.*`, `ticket_classes[0].cost`, `logo.url`, `description.text`. |

#### Source 8: Cosmoprof North America
| Field | Value |
|---|---|
| Base URL | `https://cosmoprofnorthamerica.com` |
| Key CSS Selectors | `.event-info`, `.event-date`, `.event-venue`, `h1.entry-title`, `.event-register-btn` |
| Date Format | "June 14 – 16, 2026, Las Vegas, NV" |
| Authentication Required | No |
| robots.txt Status | Check on crawl — no known restrictions |
| Rate Limit Recommendation | Manual first run; scrape 1x annually after initial seed |
| Special Handling | Single major event per year. Supplement with manual entry for sub-events (education sessions, brand showcases). Mark `is_major_tradeshow = true` in metadata. |

#### Source 9: Premiere Orlando
| Field | Value |
|---|---|
| Base URL | `https://premiereorlandoshow.com` |
| Key CSS Selectors | `.show-date`, `.show-location`, `.show-description`, `.show-register`, `h1, h2.event-heading` |
| Date Format | "May 31 – June 2, 2026" |
| Authentication Required | No |
| robots.txt Status | No known restrictions |
| Rate Limit Recommendation | 1x annually; supplement with manual entry |
| Special Handling | Single annual event. Check `/education` and `/speakers` paths for sub-events. Create individual records for major education tracks. |

#### Source 10: IBS New York
| Field | Value |
|---|---|
| Base URL | `https://ibsnewyork.com` |
| Key CSS Selectors | `.event-details`, `.event-date-location`, `.registration-info`, `h1.show-title` |
| Date Format | "March 1–3, 2026, New York, NY" |
| Authentication Required | No |
| robots.txt Status | No known restrictions |
| Rate Limit Recommendation | 1x annually |
| Special Handling | Co-located with Premiere BeautyNow. Check for joint event overlaps. Check `/classes` for education session extraction. |

#### Source 11: AmSpa
| Field | Value |
|---|---|
| Base URL | `https://americanmedspa.org/events` |
| Key CSS Selectors | `.event-list .event-title`, `.event-date`, `.event-location`, `.event-registration`, `.event-description`, `.ce-credits` |
| Date Format | "April 15, 2026" or "April 15–16, 2026" |
| Authentication Required | No (member-only events noted publicly but require login for registration) |
| robots.txt Status | Allowlisted — no disallow for `/events` |
| Rate Limit Recommendation | 1 request per 10 seconds |
| Special Handling | High-value medspa compliance content. Extract `compliance_topic` from description keywords ("HIPAA", "OSHA", "state board", "injector"). Tag as `specialty_tags: ['medspa', 'compliance']` automatically. |

#### Source 12: NCEA
| Field | Value |
|---|---|
| Base URL | `https://ncea.tv/events` |
| Key CSS Selectors | `.tribe-events-list .tribe-event-url`, `.tribe-events-schedule`, `.tribe-venue`, `.tribe-event-title`, `.ce-credits-badge` |
| Date Format | "March 15, 2026 @ 1:00 pm – 2:30 pm EDT" |
| Authentication Required | No |
| robots.txt Status | Check on crawl |
| Rate Limit Recommendation | 1 request per 10 seconds |
| Special Handling | CE credit count prominently displayed — extract numeric value from text like "1.5 CE Credits". Store in `ce_credits_count`. Set `ce_provider = 'NCEA'`. Check for state board approval notes. |

#### Source 13: ASCP
| Field | Value |
|---|---|
| Base URL | `https://ascpskincare.com/events` |
| Key CSS Selectors | `.event-card .event-title`, `.event-card .event-date`, `.event-card .event-location`, `.event-card .event-price`, `.event-card .ce-credits`, `.event-card a.register` |
| Date Format | "March 15, 2026 \| 1:00 PM – 2:30 PM ET" |
| Authentication Required | No (member pricing shown after login but event info is public) |
| robots.txt Status | Allowlisted |
| Rate Limit Recommendation | 1 request per 8 seconds |
| Special Handling | ASCP is a primary esthetician CE source. Extract `ce_credits_count` (common format: "1.5 CE Hours"). Note whether NCBTMB-approved. Set `ce_provider = 'ASCP'`. |

#### Source 14: Brand Education Pages
| Field | Value |
|---|---|
| Target Brands | Redken (`redken.com/education`), Moroccanoil (`moroccanoil.com/education`), HydraFacial (`hydrafacial.com/events`), Dermalogica (`dermalogica.com/education`), Image Skincare (`imageskincare.com/events`), PCA Skin (`pcaskin.com/events`), Glo Skin Beauty (`gloskinbeauty.com/education`) |
| Key CSS Selectors | Brand-specific — use `h2, h3` for event titles, `.event-date, .date, time[datetime]`, `.event-location, .location`, `a[href*="register"], a[href*="eventbrite"]` |
| Date Format | Varies per brand — normalize all |
| Authentication Required | No for public event listings |
| robots.txt Status | Check per brand — most allow crawling of `/education` and `/events` paths |
| Rate Limit Recommendation | 1 request per 15 seconds per domain |
| Special Handling | Each brand is a separate crawl job with its own pg-boss payload. Store `organizer_brand_id` linking to `socelle.brands`. Event registration may redirect to Eventbrite — if so, note Eventbrite event ID to avoid deduplication collision. |

#### Source 15: Dermascope Magazine
| Field | Value |
|---|---|
| Base URL | `https://dermascope.com/events` |
| Key CSS Selectors | `.event-list-item .event-title`, `.event-list-item .event-dates`, `.event-list-item .event-location`, `.event-list-item .event-description a` |
| Date Format | "March 15-17, 2026" |
| Authentication Required | No |
| robots.txt Status | No known restrictions |
| Rate Limit Recommendation | 1 request per 10 seconds |
| Special Handling | Dermascope hosts the Aesthetics & Spa World Conference (ASWC) annually — flag as major event. Also aggregates third-party events; deduplicate against ISPA and ASCP sources. |

#### Source 16: Skin Inc Magazine
| Field | Value |
|---|---|
| Base URL | `https://skininc.com/events` |
| RSS Feed | `https://skininc.com/rss.xml` (filter `category=Events`) |
| Key CSS Selectors | `.event-list .event-item h3`, `.event-item .event-date`, `.event-item .event-location`, `.event-item a.event-link` |
| Date Format | "March 15, 2026" |
| Authentication Required | No |
| robots.txt Status | Allowlisted — Allured Business Media network |
| Rate Limit Recommendation | 1 request per 8 seconds; prefer RSS |
| Special Handling | Allured network also includes Les Nouvelles Esthétiques and Global Cosmetic Industry — cross-check for duplicate listings across these sister publications. |

#### Source 17: ABMP
| Field | Value |
|---|---|
| Base URL | `https://abmp.com/events` |
| Key CSS Selectors | `.views-row .event-title a`, `.views-row .date-display-range`, `.views-row .field-name-field-event-location`, `.views-row .field-name-body` |
| Date Format | "March 15, 2026 to March 17, 2026" |
| Authentication Required | No |
| robots.txt Status | No known restrictions |
| Rate Limit Recommendation | 1 request per 10 seconds |
| Special Handling | ABMP events skew toward massage/bodywork but many are wellness-inclusive (relevant for spa/medspa operators). Tag `specialty_tags: ['wellness', 'massage']`. Filter out events purely focused on massage therapy without spa/esthetic crossover. |

---

## Section 2: Parser Requirements Per Source

### 2.1 Universal Field Extraction Map

Every parser must attempt to extract the following canonical fields. Missing optional fields are stored as NULL. Missing required fields (name, start_date, source_url) cause the record to be sent to human review queue.

| Canonical Field | Required | Notes |
|---|---|---|
| `name` | YES | Clean of HTML entities; strip trailing whitespace |
| `start_date` | YES | Normalized to `YYYY-MM-DD` |
| `end_date` | NO | Same format; NULL if single-day |
| `start_time` | NO | `HH:MM:SS` 24-hour; NULL if not found |
| `end_time` | NO | Same format |
| `timezone` | NO | IANA format; default to `America/New_York` if US East event and timezone not found |
| `description` | NO | First 1,000 chars of plaintext; strip HTML |
| `location_string` | YES (in-person) | Raw string before geocoding |
| `venue_name` | NO | Extract if present |
| `city` | NO | Extracted from location_string |
| `state` | NO | 2-letter code; extracted from location_string |
| `registration_url` | NO | Absolute URL; resolve relative URLs |
| `price_string` | NO | Raw price text before parsing to cents |
| `is_free` | NO | True if "free" in price_string or price = $0 |
| `ce_credits_text` | NO | Raw CE credits text; parse count from this |
| `organizer_name` | NO | From event page organizer section |
| `hero_image_url` | NO | First `<img>` in event card or detail page |
| `event_type_raw` | NO | Raw type label from source; mapped to enum |

---

### 2.2 Date Format Normalization Rules

| Encountered Format | Example | Normalized Output |
|---|---|---|
| `Month D, YYYY` | "March 15, 2026" | `start_date: 2026-03-15` |
| `Month D–D, YYYY` | "March 15–17, 2026" | `start_date: 2026-03-15, end_date: 2026-03-17` |
| `Month D – Month D, YYYY` | "March 31 – April 2, 2026" | `start_date: 2026-03-31, end_date: 2026-04-02` |
| `Weekday, Month D, YYYY @ H:MM am/pm` | "Monday, March 15, 2026 @ 9:00 am" | `start_date: 2026-03-15, start_time: 09:00:00` |
| `YYYY-MM-DD` (ISO) | "2026-03-15" | Pass through |
| `MM/DD/YYYY` | "03/15/2026" | `start_date: 2026-03-15` |
| `D Month YYYY` | "15 March 2026" | `start_date: 2026-03-15` |
| `time[datetime]` attribute | `datetime="2026-03-15T09:00:00-04:00"` | Parse ISO 8601 directly |

**Timezone extraction rules:**
- If "ET", "EDT", "EST" → `America/New_York`
- If "CT", "CDT", "CST" → `America/Chicago`
- If "MT", "MDT", "MST" → `America/Denver`
- If "PT", "PDT", "PST" → `America/Los_Angeles`
- If "virtual" or no city found → `UTC` as default
- If specific city found → resolve via city-to-timezone lookup table

---

### 2.3 Per-Source Special Parser Notes

**ISPA:** Pages use JavaScript-rendered content for event details. Use Playwright `waitForSelector('.event-listing')`. Paginated listing — crawl until `div.event-listing` count is 0 or page 10 (whichever comes first). ISPA events often list "Members Only" pricing alongside public pricing — capture both in `registration_price_min_cents` and `registration_price_max_cents`.

**PBA:** Uses The Events Calendar WordPress plugin (tribe). Use `/events/list/?tribe-bar-search=` URL for cleanest list extraction. `tribe-events-pro-summary__event-datetime` contains combined date/time string. CE credits not typically listed — check event description for "CEU" or "continuing education" keywords.

**BehindTheChair:** RSS feed provides `<title>`, `<link>`, `<pubDate>`, and partial `<description>`. Use RSS for initial discovery; follow `<link>` to detail page for full field extraction (price, CE credits, venue). RSS date format: RFC 822 (`Mon, 15 Mar 2026 09:00:00 +0000`) — parse with standard library.

**Eventbrite API:** Response structure:
```json
{
  "events": [{
    "name": { "text": "Event Name" },
    "description": { "text": "..." },
    "start": { "local": "2026-03-15T09:00:00", "timezone": "America/New_York" },
    "end": { "local": "2026-03-15T17:00:00", "timezone": "America/New_York" },
    "venue": {
      "name": "...",
      "address": { "city": "...", "region": "...", "country": "US" },
      "latitude": "...",
      "longitude": "..."
    },
    "ticket_classes": [{ "cost": { "major_value": "49.00" }, "free": false }],
    "logo": { "url": "..." },
    "organizer": { "name": "..." },
    "url": "https://www.eventbrite.com/e/..."
  }]
}
```
Eventbrite provides lat/lng — skip geocoding step for these records. Filter events: only include where `organizer.name` or `description.text` contains keywords: `["esthetician", "spa", "medspa", "salon", "beauty professional", "skincare", "laser", "injector", "cosmetology", "aesthetics"]`.

**Cosmoprof / Premiere / IBS (annual trade shows):** Seed manually on first run. Set a cron to re-scrape starting 6 months before the expected annual date. Monitor for date announcement. On first detection of new year's dates, send Slack alert: `Major trade show date announced: [name] [year]`.

**Brand education pages:** Each brand has a unique HTML structure. Maintain a per-brand selector config object:
```json
{
  "brand_id": "uuid",
  "domain": "hydrafacial.com",
  "events_path": "/events",
  "selectors": {
    "event_container": ".event-card",
    "title": ".event-card__title",
    "date": ".event-card__date",
    "location": ".event-card__location",
    "register_link": ".event-card__cta a",
    "price": ".event-card__price",
    "description": ".event-card__description"
  }
}
```
Store selector configs in `socelle.crawler_configs` table. Allow admin to update selectors without code deploy when a brand updates their site.

**CE Credit Extraction (NCEA, ASCP, Dermascope):** Use regex on description and dedicated CE field:
```
pattern: /(\d+\.?\d*)\s*(CE|CEU|CEC|credit|hour|hour[s]?)\b/i
```
Round to nearest 0.5 credits. Store raw text in `metadata.ce_credits_raw` for audit. Set `ce_credits_available = true` whenever count > 0.

---

### 2.4 Error Handling Per Field

| Field | If Missing | Action |
|---|---|---|
| `name` | Required | Skip record; log to `crawl_errors` with source_url |
| `start_date` | Required | Attempt extraction from URL slug (e.g., `/events/march-2026`); if still missing, skip |
| `registration_url` | Optional | Set NULL; use `source_url` as fallback in UI |
| `price_string` | Optional | Set `is_free = false, registration_price_min_cents = NULL` |
| `description` | Optional | Set NULL; event card still renders |
| `city` / `state` | Optional (in-person) | Attempt geocode from `venue_name` alone; if fails, flag for human review |
| `ce_credits_count` | Optional | Set `ce_credits_available = false` unless CE mentioned in description |
| `hero_image_url` | Optional | Set NULL; UI uses default category image |
| `organizer_name` | Optional | Set to source name (e.g., "ISPA") as fallback |

---

## Section 3: Events Database Schema — Complete SQL

Full SQL is provided in `EVENTS_MIGRATION.sql` (the companion file). Key design decisions documented here:

### 3.1 Schema Design Rationale

**`event_type` as TEXT with check constraint** rather than ENUM — allows adding new types without schema migration. Validated at application layer and via DB check constraint.

**Dual price columns** (`registration_price_min_cents`, `registration_price_max_cents`) — handles events with multiple tiers (e.g., "member: $299, non-member: $499"). Both in integer cents to avoid floating-point issues.

**`specialty_tags TEXT[]`** — PostgreSQL native array with GIN index for fast containsAny queries. Tags: `facial`, `hair`, `nails`, `medspa`, `wellness`, `business`, `laser`, `injectables`, `waxing`, `massage`, `makeup`, `compliance`.

**`brand_sponsors TEXT[]`** — stores brand names as text rather than FK array for flexibility (brands may not yet be in `socelle.brands`). Resolution to `brand_id` happens asynchronously.

**Geocoding cache** — `lat`/`lng` on the events table; geocode results cached in `socelle.geocode_cache` keyed on address string to avoid redundant API calls.

**Soft delete on cancellation** — `is_cancelled = true` rather than DELETE. Preserves SEO equity on indexed pages (301 redirects to events index) and historical data.

---

## Section 4: Extraction Pipeline Specification

### 4.1 pg-boss Queue Configuration

**Queue name:** `socelle-crawl-events`

```typescript
// Queue configuration
const queueConfig = {
  name: 'socelle-crawl-events',
  options: {
    retryLimit: 3,
    retryDelay: 3600,        // 1 hour between retries
    retryBackoff: true,       // Exponential: 1h, 2h, 4h
    expireInHours: 4,         // Job expires if not picked up in 4h
    singletonKey: '${source_name}',  // One active job per source at a time
    priority: 0,              // Default; bump to 10 for manual triggers
  }
};

// Job payload schema
interface CrawlEventsPayload {
  source_name: string;          // e.g., "ISPA"
  source_url: string;           // e.g., "https://experienceispa.com/events"
  crawl_depth: number;          // Max pages to crawl (default: 5)
  brand_id?: string;            // UUID — only for brand education sources
  selector_config_id?: string;  // UUID — for brand sources with stored selectors
  trigger: 'scheduled' | 'manual' | 'webhook';
}

// Worker timeout
const WORKER_TIMEOUT_MS = 120_000; // 2 minutes per source
```

**Schedule (cron via pg-boss):**
```
// Monthly sources: run on 1st of each month at 3:00 AM UTC
0 3 1 * * → ISPA, PBA, Modern Salon, Live Love Spa, Spa Collab, BehindTheChair (HTML), Dermascope, Skin Inc, brand pages

// Weekly sources: run every Sunday at 2:00 AM UTC
0 2 * * 0 → Eventbrite API, BehindTheChair (RSS)

// Quarterly sources: run on 1st of Jan, Apr, Jul, Oct at 3:30 AM UTC
30 3 1 1,4,7,10 * → AmSpa, NCEA, ASCP, ABMP

// Annual: run Nov 1 to start watching for next year's dates
0 4 1 11 * → Cosmoprof, Premiere Orlando, IBS New York
```

---

### 4.2 Worker Execution Flow

```
CrawlEventsWorker(payload):
  1. Log job start → crawl_logs (source_name, started_at, status: 'running')
  2. Fetch source HTML or API response
     → Playwright for JS-rendered sources (ISPA, Spa Collab, Live Love Spa)
     → axios for static HTML (PBA, ASCP, Modern Salon)
     → Eventbrite SDK for API source
  3. Parse events using source-specific parser
  4. For each parsed event:
     a. Normalize fields (see Section 4.4)
     b. Run deduplication check (see Section 4.3)
     c. If new → INSERT with auto_extracted=true, last_verified_at=null
        If existing → UPDATE modified fields, set last_verified_at=now()
  5. Run cancellation check (see Section 4.6)
  6. Log job complete → crawl_logs (ended_at, events_found, events_new, events_updated, status: 'success')
  7. On error → crawl_logs (status: 'failed', error_message)
              → check consecutive_failures; if ≥3, send Slack alert
```

---

### 4.3 Deduplication Logic

**Primary matching key:** `(name_normalized, start_date, city_normalized)`

**Algorithm:**
```python
def is_duplicate(candidate, existing_events):
    # Step 1: Exact match on (start_date, city)
    date_city_matches = [e for e in existing_events
                         if e.start_date == candidate.start_date
                         and normalize(e.city) == normalize(candidate.city)]

    if not date_city_matches:
        return False, None

    # Step 2: Fuzzy name match using Levenshtein distance
    for existing in date_city_matches:
        distance = levenshtein(
            normalize(candidate.name),
            normalize(existing.name)
        )
        similarity_ratio = 1 - (distance / max(len(candidate.name), len(existing.name)))

        if distance <= 3 or similarity_ratio >= 0.85:
            return True, existing.id

    return False, None

def normalize(text):
    return text.lower().strip()
             .replace(r'[^\w\s]', '')  # Remove punctuation
             .replace(r'\s+', ' ')     # Collapse whitespace
```

**Duplicate detected → UPDATE, not INSERT:**
```sql
UPDATE socelle.events SET
  description = COALESCE(EXCLUDED.description, description),
  registration_url = COALESCE(EXCLUDED.registration_url, registration_url),
  registration_price_min_cents = COALESCE(EXCLUDED.registration_price_min_cents, registration_price_min_cents),
  hero_image_url = COALESCE(EXCLUDED.hero_image_url, hero_image_url),
  last_verified_at = now(),
  updated_at = now()
WHERE id = [existing_id];
```

**Same event in multiple years = distinct records:**
- Slug includes year: `ispa-conference-and-expo-2026`
- Matching uses `start_date` year as part of uniqueness — two records with the same name but different years are NOT duplicates

**Eventbrite + Brand Education collision:**
- If a brand event registers on Eventbrite, both sources will detect it
- Deduplication catches this: same name, date, city → update existing with Eventbrite URL as secondary `registration_url` in `metadata.secondary_registration_urls[]`

---

### 4.4 Normalization Pipeline Steps

```
1. RAW EXTRACTION
   → Extract fields from HTML/API using source parser

2. TEXT CLEANING
   → Strip HTML tags from all text fields
   → Decode HTML entities (&amp; → &, etc.)
   → Remove zero-width characters and non-printable chars
   → Trim whitespace from all string fields
   → Truncate description to 2,000 chars; hero to 500-char URL

3. DATE/TIME NORMALIZATION
   → Parse raw date string using date format rules (Section 2.2)
   → Convert to UTC ISO 8601 for storage
   → Extract timezone from string or infer from city
   → If only start_date (no time): store time as NULL, not midnight

4. PRICE NORMALIZATION
   → Extract numeric values from price strings using regex:
     /\$([0-9,]+(?:\.[0-9]{2})?)/g
   → Convert to cents (multiply by 100, round to int)
   → If "free" or "$0" in price_string: set is_free=true, price=0
   → If price range: min = lowest value, max = highest value
   → If "members only" pricing found: store in metadata.member_price_cents

5. GEOCODING
   → If in-person event with venue_address or city+state:
     a. Check socelle.geocode_cache for (address_normalized) hit
     b. If cache hit: use cached lat/lng (cache TTL: 180 days)
     c. If cache miss: call Google Maps Geocoding API
        → Store result in geocode_cache
        → Store lat/lng on event record
     d. If geocoding fails: log warning, leave lat/lng NULL

6. EVENT_TYPE CLASSIFICATION
   → Keyword matching on name + description (case-insensitive):
     "conference", "summit", "expo", "congress" → 'conference'
     "workshop", "training", "class", "bootcamp", "course", "certification" → 'training'
     "webinar", "online", "virtual", "zoom", "livestream" → 'webinar'
     "trade show", "beauty show", "show floor", "exhibition" → 'tradeshow'
     "retreat", "spa week", "getaway", "immersion" → 'retreat'
     "networking", "meetup", "social", "mixer" → 'networking'
     brand name + ("education", "training", "masterclass") → 'brand_education'
   → If multiple match: use most specific (tradeshow > conference > training)
   → If none match: set 'conference' as default, flag for review

7. SPECIALTY_TAGS EXTRACTION
   → Scan name + description for specialty keywords:
     ["facial", "esthetician", "esthetic", "skincare", "skin care"] → 'facial'
     ["hair", "salon", "colorist", "hairstylist"] → 'hair'
     ["nail", "manicure", "pedicure", "nail tech"] → 'nails'
     ["medspa", "med spa", "injector", "botox", "filler", "laser"] → 'medspa'
     ["wellness", "holistic", "ayurveda", "bodywork", "massage"] → 'wellness'
     ["business", "revenue", "marketing", "owner", "director", "management"] → 'business'
     ["compliance", "HIPAA", "OSHA", "state board", "regulation"] → 'compliance'
   → Tags are additive — an event can have multiple tags

8. CE CREDITS EXTRACTION
   → Regex: /(\d+\.?\d*)\s*(CE|CEU|CEC|credit|hour)\b/i on description
   → If match: set ce_credits_available=true, ce_credits_count=parsed_number
   → Extract provider from CE text or organizer: "NCEA", "ASCP", "NCBTMB", "state board"
   → Store ce_provider as text

9. SLUG GENERATION
   → slug = kebab-case(name) + '-' + year(start_date)
   → Strip: articles (a, an, the), special chars, extra hyphens
   → Truncate to 80 chars before year suffix
   → Check uniqueness in DB; if collision: append -2, -3, etc.

10. VIRTUAL DETECTION
    → If "virtual", "online", "webinar", "zoom", "teams", "webex" in name/description:
      set is_virtual=true
    → Extract virtual_platform from keywords: "zoom", "webex", "teams", "hopin", "custom"
    → If is_virtual=true: leave venue/city/lat/lng as NULL
```

---

### 4.5 New Event Detection and Admin Notification

```typescript
// After INSERT of new event
async function onNewEventDetected(event: Event) {
  // Flag for human review
  await db.query(`
    UPDATE socelle.events
    SET metadata = jsonb_set(metadata, '{needs_review}', 'true')
    WHERE id = $1
  `, [event.id]);

  // Major trade show detection
  const majorShows = ['cosmoprof', 'premiere orlando', 'ibs new york', 'imats', 'beauty expo'];
  const isMajor = majorShows.some(show => event.name.toLowerCase().includes(show));

  if (isMajor) {
    await sendSlackAlert({
      channel: '#socelle-crawl-alerts',
      text: `Major trade show detected: ${event.name} on ${event.start_date} in ${event.city}`,
      blocks: [/* rich Slack block with event details */]
    });
  }

  // Add to admin review queue
  await pgBoss.send('socelle-admin-review', {
    entity_type: 'event',
    entity_id: event.id,
    reason: 'new_auto_extracted',
    priority: isMajor ? 'high' : 'normal'
  });
}
```

---

### 4.6 Cancelled Event Detection

```typescript
// Run after each source crawl completes
async function detectCancelledEvents(sourceName: string, scraped_ids: string[]) {
  // Find events from this source that are future-dated but not in the latest scrape
  const missing = await db.query(`
    SELECT id, name, start_date, source_url
    FROM socelle.events
    WHERE source_name = $1
      AND start_date > CURRENT_DATE
      AND is_cancelled = false
      AND id NOT IN (SELECT unnest($2::uuid[]))
  `, [sourceName, scraped_ids]);

  for (const event of missing.rows) {
    // Re-verify once by fetching the event's source_url directly
    const stillExists = await verifyEventUrl(event.source_url);

    if (!stillExists) {
      await db.query(`
        UPDATE socelle.events
        SET is_cancelled = true, updated_at = now()
        WHERE id = $1
      `, [event.id]);

      // Notify users who saved this event
      await notifySavedEventCancelled(event.id);
    }
  }
}

// Notify saved users
async function notifySavedEventCancelled(eventId: string) {
  const saves = await db.query(`
    SELECT es.user_id, up.email, e.name, e.start_date
    FROM socelle.event_saves es
    JOIN public.user_profiles up ON up.id = es.user_id
    JOIN socelle.events e ON e.id = es.event_id
    WHERE es.event_id = $1
  `, [eventId]);

  for (const save of saves.rows) {
    await sendEmail({
      to: save.email,
      template: 'event_cancelled',
      data: { event_name: save.name, event_date: save.start_date }
    });
  }
}
```

---

### 4.7 Crawl Logs Table

```sql
CREATE TABLE IF NOT EXISTS socelle.crawl_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name TEXT NOT NULL,
  source_url TEXT,
  job_id TEXT,                      -- pg-boss job ID
  trigger TEXT,                     -- 'scheduled' | 'manual'
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running',  -- 'running' | 'success' | 'failed'
  events_found INT DEFAULT 0,
  events_new INT DEFAULT 0,
  events_updated INT DEFAULT 0,
  events_cancelled INT DEFAULT 0,
  error_message TEXT,
  consecutive_failures INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_crawl_logs_source ON socelle.crawl_logs(source_name);
CREATE INDEX idx_crawl_logs_status ON socelle.crawl_logs(status);
CREATE INDEX idx_crawl_logs_started ON socelle.crawl_logs(started_at DESC);
```

---

## Section 5: SEO Specification for Event Pages

### 5.1 URL Structure

```
/events                           → Index page (all events, filterable)
/events/[slug]                    → Event detail page
/events/conferences               → Category filter: conferences
/events/webinars                  → Category filter: webinars
/events/ce-courses                → Category filter: CE-eligible courses
/events/trade-shows               → Category filter: trade shows
/events/brand-education           → Category filter: brand education
/events/virtual                   → Virtual-only filter
/events/[state-slug]              → e.g., /events/florida (geo filter)
```

**Slug format:** `[kebab-event-name]-[YYYY]`
Examples:
- `/events/ispa-conference-and-expo-2026`
- `/events/premiere-orlando-2026`
- `/events/ascp-virtual-esthetician-summit-2026`

**301 Redirect rules:**
- Cancelled events: `/events/[slug]` → 301 → `/events` (with message in flash)
- Past events: Keep indexed with `eventStatus: EventCancelled` or `eventStatus: EventPostponed` in JSON-LD; add "This event has passed" banner; do NOT redirect

---

### 5.2 Page Title Templates

| Event Type | Template | Example |
|---|---|---|
| Conference / Summit | `[Event Name] [Year] — Dates, Location & Registration \| Socelle` | `ISPA Conference & Expo 2026 — Dates, Location & Registration \| Socelle` |
| Trade Show | `[Event Name] [Year] — [City] Beauty Trade Show \| Socelle` | `Premiere Orlando 2026 — Orlando Beauty Trade Show \| Socelle` |
| Webinar | `[Event Name] [Year] — Free Webinar for Beauty Professionals \| Socelle` | `ASCP Skin Science Webinar 2026 — Free Webinar for Beauty Professionals \| Socelle` |
| CE Course | `[Event Name] [Year] — [X] CE Credits \| Socelle` | `NCEA Online Review Course 2026 — 3 CE Credits \| Socelle` |
| Brand Education | `[Brand] [Event Name] [Year] — Professional Training \| Socelle` | `Dermalogica Expert Masterclass 2026 — Professional Training \| Socelle` |
| Retreat | `[Event Name] [Year] — Spa & Wellness Retreat for Beauty Professionals \| Socelle` | `Live Love Spa Owner Retreat 2026 — Spa & Wellness Retreat for Beauty Professionals \| Socelle` |

**Title length rule:** Keep under 60 characters for search snippet truncation. If title would exceed 60 chars, truncate event name: `[Event Name, max 35 chars...] [Year] — ... \| Socelle`

---

### 5.3 Meta Description Templates

| Event Type | Template |
|---|---|
| In-person, Conference | `Everything you need to know about [Event Name] [Year]: [dates] in [city, state], registration from $[price], CE credits, and what to expect. Your beauty industry events hub.` |
| In-person, Trade Show | `[Event Name] [Year] in [city]: [dates], exhibitor list, education sessions, and registration info for spa directors and beauty professionals. Plan your trip with Socelle.` |
| Virtual / Webinar | `Join [Event Name] [Year] online: [dates], registration details, [X CE credits if applicable], agenda, and what to expect. [Free/Paid] events for beauty professionals.` |
| CE Course | `Earn [X] CE credits at [Event Name] [Year]: [dates], [in-person/virtual], [price or free]. Approved for [state/NCEA/ASCP] license renewal. Register via Socelle.` |
| Brand Education | `[Brand] [Event Name] [Year]: [dates], [city/virtual], registration, and what to expect from this professional beauty training. Socelle tracks events for spa pros.` |

**Meta description length:** 145–160 characters. Truncate gracefully if over.

---

### 5.4 JSON-LD Structured Data — Complete Examples

#### In-Person Conference Example
```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "ISPA Conference & Expo 2026",
  "startDate": "2026-09-14T09:00:00-04:00",
  "endDate": "2026-09-16T18:00:00-04:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "location": {
    "@type": "Place",
    "name": "Gaylord Opryland Resort & Convention Center",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "2800 Opryland Dr",
      "addressLocality": "Nashville",
      "addressRegion": "TN",
      "postalCode": "37214",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 36.1952,
      "longitude": -86.6862
    }
  },
  "organizer": {
    "@type": "Organization",
    "name": "International Spa Association",
    "url": "https://experienceispa.com"
  },
  "offers": {
    "@type": "Offer",
    "price": "1299",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "https://experienceispa.com/events/conference/register",
    "validFrom": "2026-01-15T00:00:00-05:00"
  },
  "description": "The ISPA Conference & Expo is the premier gathering for spa industry professionals. Join 2,000+ attendees for education sessions, networking, and the largest spa industry trade show floor in North America.",
  "image": "https://cdn.socelle.com/events/ispa-conference-expo-2026.jpg",
  "performer": {
    "@type": "PerformingGroup",
    "name": "ISPA Speaker Faculty"
  },
  "inLanguage": "en-US",
  "url": "https://socelle.com/events/ispa-conference-and-expo-2026",
  "sameAs": "https://experienceispa.com/events/conference",
  "keywords": "spa conference, ISPA, spa industry, spa director, spa education, wellness conference"
}
```

#### Virtual Webinar Example
```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "ASCP Skin Science Webinar: Advanced Chemical Peels 2026",
  "startDate": "2026-04-15T13:00:00-04:00",
  "endDate": "2026-04-15T14:30:00-04:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
  "location": {
    "@type": "VirtualLocation",
    "url": "https://zoom.us/webinar/register/ascp-peels-2026"
  },
  "organizer": {
    "@type": "Organization",
    "name": "Associated Skin Care Professionals",
    "url": "https://ascpskincare.com"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "https://ascpskincare.com/events/register/skin-science-webinar",
    "validFrom": "2026-03-01T00:00:00-05:00"
  },
  "description": "Join ASCP's Skin Science Webinar Series for an advanced session on chemical peels — protocols, contraindications, and client selection. Earn 1.5 CE credits. Free for ASCP members.",
  "image": "https://cdn.socelle.com/events/ascp-skin-science-webinar-2026.jpg",
  "inLanguage": "en-US",
  "url": "https://socelle.com/events/ascp-skin-science-webinar-advanced-chemical-peels-2026",
  "sameAs": "https://ascpskincare.com/events/skin-science-webinar-2026",
  "keywords": "esthetician CE, chemical peels, ASCP webinar, skin care education, CE credits"
}
```

#### Cancelled Event Example
```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Example Beauty Summit 2026",
  "startDate": "2026-05-10",
  "eventStatus": "https://schema.org/EventCancelled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "location": { "@type": "Place", "name": "TBD" },
  "description": "This event has been cancelled. Check back for updates or browse upcoming beauty industry events on Socelle.",
  "url": "https://socelle.com/events/example-beauty-summit-2026"
}
```

---

### 5.5 Index Page (`/events`) Feature Specification

#### Filter Controls
```
Type:       [ All ] [ Conferences ] [ Webinars ] [ CE Courses ] [ Trade Shows ] [ Retreats ] [ Brand Education ] [ Networking ]
Date:       [ Upcoming (default) ] [ This Month ] [ Next 3 Months ] [ Custom Range: __ to __ ]
Location:   [ All ] [ Virtual ] [ Alabama → Wyoming dropdown ] [ Near Me (geo) ]
Specialty:  [ All ] [ Facial/Esthetics ] [ Hair ] [ Nails ] [ MedSpa ] [ Wellness ] [ Business ]
CE Credits: [ ] Show only events with CE credits available
Price:      [ All ] [ Free ] [ Paid ]
```

#### View Modes
- **List view (default):** Vertical card list sorted by start_date ascending. Card shows: event name, date range, location or "Virtual," specialty tags, CE credit badge, price range, "Save" button.
- **Calendar view:** Monthly calendar grid. Events appear as colored dots/pills on their start dates. Click date to see events. Navigation: prev/next month.
- **Map view (in-person only):** Leaflet.js map. Pin per event using lat/lng. Click pin → event mini-card. Auto-bounds to show all upcoming events. Toggle available only when "Virtual" filter is NOT selected.

#### Sort Options
```
Sort by: [ Date (upcoming first) ] [ Relevance ] [ Price (free first) ]
```

#### Save / RSVP System
- Unauthenticated: "Save" button → prompt to log in
- Authenticated: "Save" → insert into `socelle.event_saves` → button toggles to "Saved" with checkmark
- Saved event appears in user's "My Events" dashboard section
- Reminder system: cron runs daily at 8 AM UTC
  - 14 days before event: send reminder email
  - 1 day before event: send reminder email
  - If cancelled after save: send cancellation notice email immediately

#### SEO Optimizations on Index Page
- `<title>Beauty Industry Events 2026 — Conferences, CE Courses & Trade Shows | Socelle</title>`
- `<meta name="description" content="Browse 200+ beauty industry events for 2026: esthetician CE courses, spa conferences, medspa summits, trade shows, and brand training. Filter by specialty, location, and dates.">`
- Canonical: `https://socelle.com/events`
- Pagination: `rel="next"` / `rel="prev"` for list pages
- Breadcrumb JSON-LD:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://socelle.com" },
    { "@type": "ListItem", "position": 2, "name": "Industry Events", "item": "https://socelle.com/events" }
  ]
}
```

---

### 5.6 Category Filter Pages

| URL | Title Tag | Meta Description | Target Keyword |
|---|---|---|---|
| `/events/conferences` | `Beauty Industry Conferences 2026 — Spa & Medspa Summits \| Socelle` | `Upcoming beauty industry conferences and summits for spa directors, medspa owners, and estheticians in 2026. Registration, dates, and what to expect.` | `beauty industry conferences 2026` |
| `/events/webinars` | `Free Beauty Industry Webinars 2026 — Online Training for Pros \| Socelle` | `Free and paid webinars for licensed estheticians, spa professionals, and medspa staff. CE credits available. Filter by specialty and date.` | `esthetician webinars 2026` |
| `/events/ce-courses` | `Esthetician CE Courses 2026 — License Renewal Credits \| Socelle` | `Earn CE credits for your esthetician license with these 2026 courses approved by NCEA, ASCP, and state boards. Virtual and in-person options.` | `esthetician CE courses 2026` |
| `/events/trade-shows` | `Beauty Trade Shows 2026 — Cosmoprof, Premiere, IBS & More \| Socelle` | `Complete guide to beauty trade shows in 2026: Cosmoprof, Premiere Orlando, IBS New York, and more. Dates, locations, and registration info.` | `beauty trade shows 2026` |

---

### 5.7 Target Keyword Strategy

**Primary:**
- `beauty industry events 2026` — index page
- `spa industry conference 2026` — conferences category
- `esthetician CE courses [state]` — CE category + state filter pages
- `medspa conference 2026` — medspa specialty filter

**Secondary:**
- `hair show 2026` — hair specialty filter
- `nail industry events 2026` — nails specialty filter
- `spa networking events` — networking category
- `free beauty webinars` — webinars category, price=free filter
- `beauty trade shows 2026` — trade shows category

**Long-tail (event-specific, auto-generated):**
- `[event name] [year]` — each event detail page
- `[event name] registration` — detail page + registration section
- `[event name] agenda` — detail page sections
- `[event name] [city]` — detail page (in-person events)
- `[event name] dates` — detail page

**State-specific CE pages (high-value, low competition):**
- `/events/ce-courses?state=FL` → target: `esthetician CE courses Florida`
- `/events/ce-courses?state=CA` → target: `esthetician CE courses California`
- Generate static metadata per state using state abbreviation lookup

---

## Section 6: Cross-Surface Integration

### 6.1 Daily Briefing Email — "Events This Week"

**Trigger:** Nightly email assembly job (10 PM UTC)

**Personalization logic:**
```sql
-- Select events for a given user's briefing
SELECT e.*
FROM socelle.events e
WHERE e.start_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '30 days')
  AND e.is_cancelled = false
  AND (
    -- Specialty match
    e.specialty_tags && (
      SELECT specialty_interests FROM public.user_profiles WHERE id = $user_id
    )
    OR
    -- Virtual events always included (no location friction)
    e.is_virtual = true
    OR
    -- In-person events within user's state
    e.state = (SELECT state FROM public.user_profiles WHERE id = $user_id)
  )
ORDER BY e.start_date ASC
LIMIT 3;
```

**Email section format:**
```html
<section class="events-this-week">
  <h2>Events This Week</h2>

  <div class="event-item">
    <div class="event-date">March 15, 2026</div>
    <div class="event-name"><a href="https://socelle.com/events/[slug]">[Event Name]</a></div>
    <div class="event-meta">
      [Virtual / City, State] · [CE badge: "1.5 CE Credits"] · [Price: "Free" or "$X"]
    </div>
    <a href="[registration_url]" class="cta-link">Register Now →</a>
  </div>

  <!-- Repeat for 2–3 events -->

  <a href="https://socelle.com/events" class="view-all">View all upcoming events →</a>
</section>
```

**Frequency control:** Max 3 events per email. If no events in 30 days matching user's specialty/location, include 1–2 top virtual events with "Recommended" label.

---

### 6.2 Brand Profile Pages — "Upcoming Events Featuring [Brand]"

**Trigger:** Any event record with brand name in `brand_sponsors[]` array or `organizer_brand_id` matching brand

**Query:**
```sql
SELECT e.*
FROM socelle.events e
WHERE (
  e.brand_sponsors @> ARRAY[$brand_name]::text[]
  OR e.organizer_brand_id = $brand_id
)
AND e.start_date >= CURRENT_DATE
AND e.is_cancelled = false
ORDER BY e.start_date ASC
LIMIT 3;
```

**Display location on brand profile page:** Below "Professional Sentiment" section, above "Product Catalog"

**Brand profile event card:**
```
[Event Name]
[Date] · [City, State or Virtual]
[CE badge if applicable]
[Register / Learn More] → links to socelle.com/events/[slug]
```

If 0 events: section is hidden (not rendered)
If 3+ events: show first 3 + "View all [brand] events →" link to `/events?brand=[brand-slug]`

---

### 6.3 Affiliate Commerce Integration — "Prepare for [Event]"

**Placement:** Event detail page, between "Event Details" and "RSVP/Save" button

**Affiliate block title:** `Prepare for [Event Name]`

**Product selection logic:**
```typescript
async function getEventAffiliateRecommendations(event: Event) {
  const tags = event.specialty_tags;
  const type = event.event_type;

  // Rule-based product category selection
  const productCategories: string[] = [];

  if (type === 'tradeshow' || type === 'conference') {
    productCategories.push('professional-bags', 'business-cards', 'travel-skincare');
  }
  if (tags.includes('facial') || tags.includes('medspa')) {
    productCategories.push('treatment-tools', 'professional-skincare');
  }
  if (tags.includes('hair')) {
    productCategories.push('styling-tools', 'professional-haircare');
  }
  if (tags.includes('nails')) {
    productCategories.push('nail-tools', 'professional-nail-products');
  }
  if (event.is_virtual) {
    productCategories.push('ring-lights', 'webcam', 'note-taking-tools');
  }

  // Query affiliate_placements for matching surface=event
  return db.query(`
    SELECT ap.*, aff.*
    FROM socelle.affiliate_placements ap
    JOIN socelle.affiliate_products aff ON aff.id = ap.affiliate_product_id
    WHERE ap.surface_type = 'event'
      AND aff.category = ANY($1::text[])
      AND aff.is_active = true
    ORDER BY aff.commission_rate DESC
    LIMIT 3
  `, [productCategories]);
}
```

**Display format:**
```
[ Socelle Pick ]  Professional Rollaway Case — $189 → [Buy on Amazon]
[ Socelle Pick ]  Dermaplaning Tool Kit — $64 → [Buy on ShareASale partner]
[ Socelle Pick ]  CERAVE Travel Skincare Set — $29 → [Buy on Amazon]
```

**Trust guardrail:** "Socelle Pick" label on all affiliate recommendations. Max 2 affiliate placements on event detail pages (as per platform affiliate rules). Transparent `/about/recommendations` link in section footer.

---

### 6.4 Intelligence Feed Integration

**Trigger:** Any new event detected with `start_date` within 60 days (90 days for major trade shows)

**Feed item creation:**
```typescript
async function createEventFeedItem(event: Event) {
  const daysUntil = differenceInDays(event.start_date, new Date());

  // Only create feed item within window
  const window = event.event_type === 'tradeshow' ? 90 : 60;
  if (daysUntil > window) return;

  await db.query(`
    INSERT INTO socelle.feed_items (
      type, entity_id, entity_type, title, body, specialty_tags,
      priority, expires_at
    ) VALUES (
      'event',
      $1,
      'event',
      $2,
      $3,
      $4,
      $5,
      $6
    )
  `, [
    event.id,
    `Upcoming: ${event.name}`,
    `${format(event.start_date, 'MMM d, yyyy')} · ${event.is_virtual ? 'Virtual' : `${event.city}, ${event.state}`}`,
    event.specialty_tags,
    event.event_type === 'tradeshow' ? 'high' : 'normal',
    event.start_date  // Feed item expires when event starts
  ]);
}
```

**Feed card appearance:**
```
[ EVENT ]
Upcoming: ISPA Conference & Expo 2026
September 14–16 · Nashville, TN
[ facial ] [ wellness ] [ business ]
[ Save Event ] [ View Details →]
```

**Feed personalization:** Feed items are shown only to users whose `specialty_interests` array overlaps with `event.specialty_tags`, OR to all users if `event_type = 'tradeshow'` (assumed universally relevant).

---

### 6.5 RSVP / Save System — Complete Flow

```
User clicks "Save" on event card or detail page
  → If unauthenticated: redirect to /login?return=/events/[slug]
  → If authenticated:
      INSERT INTO socelle.event_saves (event_id, user_id)
      Button state: "Saved ✓" (toggle)

      Schedule reminders (via pg-boss delayed jobs):
        → Job 1: send 14 days before event.start_date
          pgBoss.sendAfter('event-reminder', payload, { seconds: (daysUntil - 14) * 86400 })
        → Job 2: send 1 day before event.start_date
          pgBoss.sendAfter('event-reminder', payload, { seconds: (daysUntil - 1) * 86400 })

Reminder email content (14-day):
  Subject: "[Event Name] is 2 weeks away — you saved this"
  Body: Event name, date, location/virtual link, registration URL, "add to calendar" links (Google, iCal)

Reminder email content (1-day):
  Subject: "[Event Name] is tomorrow"
  Body: Event name, tomorrow's date, start time + timezone, location/virtual link, registration URL

Cancellation email:
  Subject: "[Event Name] has been cancelled"
  Body: Event name, original date, notice that event was cancelled, link to browse similar events on Socelle
```

---

## Section 7: Compliance and Robots.txt Policy

### 7.1 Our Bot Identity

```
User-Agent: SocelleBot/1.0 (+https://socelle.com/bot; data@socelle.com)
```

This user agent is used for all HTML scraping. A public bot disclosure page at `https://socelle.com/bot` explains what we scrape, why, and how to contact us to opt out or request corrections.

### 7.2 Universal Rate Limiting Policy

**Default:** Maximum 1 request per 5 seconds per domain (12 req/min).

**Override (stricter):**
- Wix sites (Spa Collab): 1 req per 15 sec
- Annual events (Cosmoprof, Premiere, IBS): Manual seed + 1x/year scrape

**Crawl window:** All scraping runs between 2:00–6:00 AM UTC to minimize server load impact.

### 7.3 Per-Source Compliance Table

| Source | robots.txt Status | Crawl Delay | ToS Assessment | Notes |
|---|---|---|---|---|
| ISPA | Allow `/events` — no disallow for SocelleBot | 10s | Compliant — public event data, no ToS restriction on indexing | Contact: `info@experienceispa.com` |
| PBA | Allow `/events` — no disallow | 8s | Compliant — public trade org data | Check annually for ToS updates |
| BehindTheChair | Allow — provides RSS feed (implicit permission) | 8s | Compliant — RSS = explicit permission to aggregate | Prefer RSS over HTML scrape |
| Live Love Spa | Allow (Squarespace) — no disallow | 10s | Compliant — public event listings | Member-only content not accessed |
| Spa Collab | Check per crawl (Wix default varies) | 15s | Likely compliant — public event listings | Abort if disallowed; flag for manual review |
| Modern Salon | Allow — Bobit Media network | 8s | Compliant — industry publication; public event data | No known scraping restrictions |
| Eventbrite | N/A — official API | API rate limit | Fully compliant — Eventbrite Developer ToS allows data aggregation for event discovery | Requires API key; respect 2,000 calls/day free limit |
| Cosmoprof | Allow — no robots.txt restrictions noted | Manual | Compliant — public trade show info; 1x/year | Manual seed preferred; single annual event |
| Premiere Orlando | Allow — no restrictions noted | Manual | Compliant | Manual seed; 1x/year |
| IBS New York | Allow — no restrictions noted | Manual | Compliant | Manual seed; 1x/year |
| AmSpa | Allow `/events` — no disallow | 10s | Compliant — trade association public events | Member pricing not accessed |
| NCEA | Allow — no restrictions noted | 10s | Compliant — public CE listings | Old domain (naboretail.com) may redirect; check both |
| ASCP | Allow — no restrictions noted | 8s | Compliant — public CE listings | Member pricing not accessed |
| Brand pages (all) | Check per brand per crawl | 15s per domain | Compliant — brands publish `/education` and `/events` for discovery; scraping supports their promotional goals | Abort if `Disallow: /education` or `Disallow: /events` found for SocelleBot or * |
| Dermascope | Allow — no restrictions | 10s | Compliant | Part of DERMASCOPE Magazine; public event aggregator |
| Skin Inc | Allow — Allured network | 8s | Compliant — industry publisher | Cross-check sister publications for dups |
| ABMP | Allow — no restrictions | 10s | Compliant — public CE listings | Focus on spa/wellness crossover events |

### 7.4 Opt-Out Mechanism

Any event organizer or publication can request removal of their events from Socelle by emailing `data@socelle.com`. Response SLA: 5 business days. Implementation: set `is_hidden = true` in event record (preserves data; hides from all public surfaces). Log opt-out in `socelle.data_opt_outs` table.

### 7.5 Data Attribution

Every event detail page includes:
```
Source: [Source Name] · Last verified: [last_verified_at date]
[View original event listing →] → links to source_url
```

This attribution is both ethically correct and provides a quality signal (we link out to the authoritative source, which does not harm SEO and reinforces trust).

---

## Section 8: Admin Interface Specification

### 8.1 Admin Events Dashboard (`/admin/events`)

**Views:**
- **Events Queue:** All events where `metadata->>'needs_review' = 'true'` — for human review
- **All Events:** Full paginated table with filters (source, type, date range, status)
- **Crawl Logs:** Latest crawl runs per source — status, events found/new/updated, errors
- **Cancelled Events:** All `is_cancelled = true` events — audit trail

**Admin actions on each event:**
- Edit any field inline
- Mark as verified (`last_verified_at = now()`, remove `needs_review` flag)
- Mark as cancelled
- Delete (hard delete — admin only, not exposed to user-facing pipeline)
- Re-enrich (re-run geocoding, re-extract tags)
- Trigger manual crawl for a specific source

### 8.2 Manual Event Entry

Admin can manually create events (for major trade shows seeded before scraping, or events not covered by automated sources):
- Full form with all event fields
- `auto_extracted = false` on manually created events
- `last_verified_at = now()` on creation

---

## Appendix A: Crawler Config Schema

```sql
CREATE TABLE IF NOT EXISTS socelle.crawler_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name TEXT NOT NULL UNIQUE,
  source_url TEXT NOT NULL,
  extraction_method TEXT NOT NULL, -- 'playwright' | 'axios' | 'api' | 'rss' | 'manual'
  selector_config JSONB,           -- CSS selectors per field
  api_config JSONB,                -- API keys, endpoints, params (encrypted at app layer)
  crawl_cadence TEXT NOT NULL,     -- cron expression
  rate_limit_per_min INT DEFAULT 12,
  max_pages_per_crawl INT DEFAULT 5,
  brand_id UUID REFERENCES socelle.brands(id),
  is_active BOOLEAN DEFAULT true,
  last_crawled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Appendix B: Geocode Cache Schema

```sql
CREATE TABLE IF NOT EXISTS socelle.geocode_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address_normalized TEXT NOT NULL UNIQUE,  -- normalized address string used as cache key
  lat NUMERIC(10,7) NOT NULL,
  lng NUMERIC(10,7) NOT NULL,
  formatted_address TEXT,                    -- Google's formatted address
  city TEXT,
  state TEXT,
  country TEXT,
  geocoded_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '180 days')
);

CREATE INDEX idx_geocode_cache_address ON socelle.geocode_cache(address_normalized);
CREATE INDEX idx_geocode_cache_expires ON socelle.geocode_cache(expires_at);
```

---

*End of SOCELLE_EVENTS_SPEC.md — Agent 4: Industry Events Agent*
*Cross-reference: EVENTS_MIGRATION.sql (companion file)*
