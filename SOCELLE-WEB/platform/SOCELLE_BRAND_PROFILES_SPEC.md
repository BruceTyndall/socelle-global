# SOCELLE — Public Brand Profile Pages: Complete Specification

**Document type:** Platform product specification
**Author:** Agent 2 — Public Brand Profile Agent
**Date:** March 2026
**Status:** Production-ready reference document

---

## Overview

Public brand profile pages are SOCELLE's largest content surface and primary organic acquisition engine. Auto-generated from lawful public data, each page creates a claimable, SEO-indexed asset that:

1. Ranks for long-tail professional beauty queries before the brand ever touches the platform
2. Delivers genuine operator intelligence value (sentiment, adoption, trend data) to drive return visits
3. Creates an inbound lead channel for brand subscriptions by surfacing the page to the brand itself
4. Monetizes immediately via contextual affiliate placements, independent of brand participation

At launch: 500+ brand pages indexed, targeting queries no professional beauty competitor currently owns. Every page that ranks is a permanent, compounding asset. Every unclaimed page is an active brand lead.

---

## Section 1: Page Architecture

### 1.1 URL Structure

```
/brands/[slug]
```

Where `slug` is the kebab-case brand name. Examples:
- `/brands/skinceuticals`
- `/brands/zo-skin-health`
- `/brands/hydrafacial`
- `/brands/olaplex`

Canonical URL always resolves to `/brands/[slug]`. Redirect any legacy or alternate paths to canonical.

### 1.2 Page Layout — Unclaimed Profile

The unclaimed brand page is fully auto-generated. No brand involvement required. All data sourced from the lawful public pipeline (see Section 2).

#### Header Zone

```
[Brand Logo — auto-fetched or placeholder wordmark]
[Brand Name]  [Category Badge]  [Tier Badge]
[Founding Year]  [HQ Location]  [Parent Company if applicable]
[Official Website ↗]

[CLAIM THIS PAGE CTA — full-width warm rosewood bar]
"Is this your brand? Claim this page to control your profile,
 post updates, and access professional intelligence."
[Claim Your Page →]
```

Visual treatment: liquid glass card surface (`backdrop-blur-sm bg-white/60`), `pro-gold` accent border on claim bar, `pro-navy` CTA button.

#### Section A: Professional Sentiment

Auto-generated from SOCELLE internal reviews + cross-referenced public data.

```
Overall Rating: [X.X / 5.0]  •  [N] professional reviews
[5-star visual bar chart]

Aspect Scores (0–5 scale, icon + numeric):
  Efficacy       [████░]  4.3
  Value          [███░░]  3.1
  Support        [████░]  4.0
  Training       [███░░]  3.8

Review excerpts (2–3 featured):
  "[Quote text]" — Verified Provider, [City, State]

[See all [N] reviews →]
[Write a Review →]
```

If fewer than 3 reviews exist: display "Be among the first to review this brand" prompt with star input.

#### Section B: Brand Overview

Auto-generated from website scrape + Open Beauty Facts + Google Knowledge Graph.

```
About [Brand Name]

[Auto-generated description paragraph — 150–200 words — covering:
  brand positioning, target professional segment, primary product categories,
  known differentiators, professional vs. retail availability]

Category: [Skincare / Haircare / Devices / Injectables / Tools / Nail / Color / Wellness]
Tier: [Luxury / Prestige / Professional / Mass]
Parent Company: [Name or "Independent"]
Founded: [Year]
Headquarters: [City, State/Country]
```

**Claimed override:** When brand claims page, official_description replaces this section entirely and is labeled with a "Brand Statement" badge.

#### Section C: Product Catalog

Auto-generated from brand website + Sephora/Ulta public data + Open Beauty Facts.

```
Key Product Lines

[Product Line Card — repeat for each line]
  [Product Image or Category Illustration]
  [Product Name]
  [Category Tag]
  [Key Ingredients: ingredient1, ingredient2, ingredient3]
  [Retail Price Range: $XX–$XX]
  [Professional Price: Available to verified providers]
  [Short description — 2 sentences]

[View all [N] products →]
```

Display maximum 6 product line cards on brand profile. Full catalog accessible via expansion. Ingredients sourced from Open Beauty Facts where available; brand website scrape as fallback.

#### Section D: Provider Adoption Map

Auto-generated from Explore Profile aggregated data. Anonymized — no individual provider data exposed.

```
Provider Adoption

[X%] of providers in [Top Metro] use [Brand Name]
Most adopted by: [Specialty Type 1], [Specialty Type 2]

Top metros by adoption:
  [City, State]     [Bar] [X%]
  [City, State]     [Bar] [X%]
  [City, State]     [Bar] [X%]

Adoption trend: [↑ Growing / → Stable / ↓ Declining]

Data is anonymized aggregate from SOCELLE provider profiles.
Minimum 10 providers required per metro to display data.
```

Minimum data threshold: metro must have ≥10 providers using the brand before any metro-level display. Categories with fewer than 5 providers show "Insufficient data for this category."

#### Section E: Trend Intelligence

Auto-generated from Google Trends + social hashtag pipeline.

```
Market Trend

Search Interest (12 months): [Sparkline chart]
  Peak: [Month, Year]
  Current vs. prior year: [+X% / -X%]

Social Mention Volume: [N] mentions/month (30-day trailing)
  Trending hashtags: #[tag1], #[tag2], #[tag3]

Lifecycle Stage: [Emerging / Growing / Established / Declining]
  [Stage description — 1 sentence explanation of what this means]

Last updated: [Date]
```

Lifecycle stages defined:
- **Emerging:** <12 months Google Trends data, accelerating search volume, <1K social mentions/mo
- **Growing:** Search volume up >20% YoY, increasing adoption curve, 1K–10K social mentions/mo
- **Established:** Stable search volume, mature adoption curve, >10K social mentions/mo
- **Declining:** Search volume down >15% YoY, contraction in adoption signals

#### Section F: Education & Certifications

Auto-generated from event extraction pipeline + education content index.

```
Education & Training

[N] CE-eligible courses available
[N] brand-hosted webinars
[N] certifications offered

Upcoming Training:
  [Event Card] — [Event Name] · [Date] · [Location / Virtual] · [CE Credits]
  [Event Card] — ...

[Browse all [Brand Name] education →]
```

Links to `/education` filtered by brand. If no events found: "No upcoming training events found. Check back or follow this brand for updates."

#### Section G: Competitive Positioning

Auto-generated from materialized views across the pipeline. Anonymized.

```
How [Brand Name] Compares

In the [Category] category among professional brands:

                    Price    Sentiment   Adoption
[Brand Name]        [●]       [●]         [●]
Category Average    [●]       [●]         [●]
Top Performers      [●]       [●]         [●]

Price Position: [Premium / Mid-range / Value]
Sentiment Rank: [X of Y brands in category]
Adoption Rank: [X of Y brands in category]

[Compare [Brand Name] vs. competitors →]
```

Competitor names are not displayed in this section — only positional data. Named comparisons available on dedicated `/brands/compare` pages.

#### Section H: Affiliate Recommendation Block

Placed below competitive positioning on all pages (claimed and unclaimed).

```
Professional-Recommended Alternatives

Top-rated [Category] products for 2026

[Affiliate Product Card — repeat 2–3]
  [Product Image]
  [Product Name]  [Brand]
  [Star Rating]  [Short description]
  [See on [Retailer] ↗]  — Socelle Pick

Socelle Pick: These recommendations are curated editorially.
We may earn a commission if you purchase. [Learn more →]
```

Maximum 2–3 affiliate placements per brand page. All labeled "Socelle Pick." Removed automatically if brand receives negative sentiment trending signal.

#### Section I: Claim CTA (Bottom of Page)

Repeated at bottom of every unclaimed page.

```
[Full-width panel — pro-navy background, pro-gold accent]

This is [Brand Name]'s auto-generated SOCELLE profile.

Thousands of licensed professionals view brand intelligence pages
like this one every month. Claim your page to:

  ✓ Replace auto-generated content with your official brand statement
  ✓ Post news, product launches, and formulation updates
  ✓ Upload training videos and CE-eligible education content
  ✓ Add sales rep contact and authorized distributor links
  ✓ Respond to professional reviews
  ✓ Access provider sentiment and adoption intelligence

[Claim Your Page — Free to Start →]

Questions? Reach us at brands@socelle.com
```

---

### 1.3 Page Layout — Claimed Brand Profile

All auto-generated sections remain visible (with verified badge and brand ability to update). Additional sections unlocked by claim tier.

#### Verified Badge

```
[Checkmark icon]  Verified Brand  ·  Managed by [Brand Name]
```

Displayed in page header on all claimed profiles.

#### Section J: Official Brand Statement (All Claimed Tiers)

Replaces auto-generated brand overview.

```
[Brand Name]'s Official Statement

[Brand-written description — rendered from official_description field]
[Uploaded logo — replaces auto-fetched image]
[Hero image — brand-uploaded]

Last updated: [Date]
```

#### Section K: Latest News & Launches (Pro + Enterprise)

Brand-posted updates surfaced in chronological feed.

```
From [Brand Name]

[Post Card]
  [Post Type Badge: NEWS / LAUNCH / EDUCATION / UPDATE]
  [Post Title]
  [Post Image if uploaded]
  [Post excerpt — 2 sentences]
  [Date posted]

[See all updates →]
```

#### Section L: Education Hub (Pro + Enterprise)

Brand-uploaded training content.

```
[Brand Name] Education

[Content Card — repeat]
  [Thumbnail]
  [Title]
  [Type: Video / Guide / Webinar / CE Course]
  [CE Credits if applicable]
  [Duration / Length]
  [Access button]
```

#### Section M: Contact & Ordering (All Claimed Tiers)

```
Contact & Ordering

Sales Representative: [Name, phone, email]
Authorized Distributors:
  [Distributor Name] — [Region] — [Link ↗]
  [Distributor Name] — [Region] — [Link ↗]

Minimum Order: [If specified]
Lead Time: [If specified]
```

#### Section N: Response to Reviews (Pro + Enterprise)

Brand can post a public response to any operator review.

```
[Review excerpt]
"[Quote text]" — Verified Provider

Brand Response · [Brand Name]
"[Brand response text]"
— [Brand Name] Customer Success Team, [Date]
```

---

## Section 2: Data Source Mapping

Each auto-generated section maps to specific pipeline sources. All data acquisition is lawful public data — no scraping behind authentication, no personal data, no proprietary databases.

### 2.1 Brand Overview

| Data Point | Primary Source | Fallback Source | Refresh Cadence |
|---|---|---|---|
| Brand name, parent company | Google Knowledge Graph API | Wikipedia API | Monthly |
| Founded year, HQ | Brand website scrape | Crunchbase public data | Quarterly |
| Category classification | Open Beauty Facts categories | Manual classification queue | On ingestion |
| Tier classification | Price point analysis + channel distribution | Manual review queue | Quarterly |
| Official website URL | Google Knowledge Graph | WHOIS public data | Monthly |

**Pipeline module:** `brand_profile_assembly` — combines results from multiple upstream sources into a single normalized record per brand.

### 2.2 Professional Sentiment

| Data Point | Primary Source | Fallback Source | Refresh Cadence |
|---|---|---|---|
| Aggregate star rating | SOCELLE internal review system | — | Real-time |
| Aspect scores (efficacy, value, support, training) | SOCELLE internal reviews (aspects JSONB) | — | Real-time |
| Review excerpts | SOCELLE brand_reviews table | — | Real-time |
| Review count | COUNT from brand_reviews | — | Real-time |

**Pipeline module:** No external scrape required. All sentiment data is collected natively through SOCELLE's review system. Cross-reference against public review mentions for signal validation only (not displayed directly).

**Minimum threshold:** 3 verified reviews required before aggregate rating displays publicly. Below threshold: "Reviews coming soon — be the first."

### 2.3 Product Catalog

| Data Point | Primary Source | Secondary Source | Fallback Source | Refresh Cadence |
|---|---|---|---|---|
| Product names, descriptions | Brand website scrape (public pages only) | Open Beauty Facts | Sephora/Ulta listing | Monthly |
| Ingredient lists | Open Beauty Facts (INCI lookup) | Brand website scrape | Manual queue | Monthly |
| Retail pricing | Sephora/Ulta public product pages | Brand website | Manual entry | Weekly |
| Product images | Brand website (public CDN assets) | Open Beauty Facts image | Placeholder | Monthly |
| Product line structure | Brand website navigation/catalog | Open Beauty Facts categories | Manual | Quarterly |

**Pipeline module:** `product_catalog_enrichment` — normalizes product data across sources, deduplicates by INCI match and product name similarity, stores in normalized product catalog.

### 2.4 Provider Adoption Map

| Data Point | Source | Refresh Cadence |
|---|---|---|
| Metro-level adoption % | Aggregated Explore Profile data (anonymous) | Weekly |
| Specialty breakdown | Explore Profile specialty tags | Weekly |
| Adoption trend direction | Week-over-week delta on adoption %, 8-week trailing | Weekly |

**Pipeline module:** Materialized view — `brand_adoption_by_metro` — computed from anonymized Explore Profile records. Minimum 10 providers per metro enforced at query layer. Individual provider data never exposed.

### 2.5 Trend Data

| Data Point | Primary Source | Refresh Cadence |
|---|---|---|
| Search interest index | Google Trends API (relative interest, normalized 0–100) | Weekly |
| YoY search change | Google Trends 12-month comparison | Weekly |
| Social mention volume | Social hashtag pipeline (Instagram, TikTok public hashtags) | Daily |
| Trending hashtags | Social hashtag pipeline | Daily |
| Lifecycle stage | Computed from search trend slope + adoption curve | Weekly |

**Pipeline module:** `trend_signals_weekly` (defined in BeautyIntel Data Architecture). Brand-level trend signals are a filtered view of the broader trend pipeline.

### 2.6 Education Availability

| Data Point | Primary Source | Secondary Source | Refresh Cadence |
|---|---|---|---|
| CE courses | Education content index (brand websites, NCEA, ABMP listings) | RSS aggregation | Weekly |
| Webinars | Event extraction pipeline (Eventbrite, brand calendars) | RSS aggregation | Daily |
| Certifications | Brand website scrape (education/training pages) | Manual queue | Monthly |
| Upcoming events | Events pipeline (linked via brand_sponsors field) | Brand website events | Daily |

**Pipeline module:** `education_content_index` + `events_extraction` — linked to brand by brand name + domain matching.

### 2.7 Competitive Positioning

| Data Point | Source | Refresh Cadence |
|---|---|---|
| Price position in category | Aggregated product pricing data from product catalog | Weekly |
| Sentiment rank | brand_reviews aggregate by category | Real-time |
| Adoption rank | brand_adoption_by_metro aggregate by category | Weekly |
| Category peer set | brand_profiles WHERE category matches | On brand_profiles update |

**Pipeline module:** Materialized view — `brand_category_positioning` — rebuilt weekly. Individual brand comparisons computed at query time against the view.

---

## Section 3: SEO Specification

### 3.1 Page-Level Templates

**Title tag:**
```
[Brand Name] — Professional Reviews, Pricing & Intelligence | Socelle
```
Maximum 60 characters for brand names exceeding 25 characters: truncate to `[Brand Name] Reviews & Intel | Socelle`

**Meta description:**
```
See what licensed professionals think about [Brand Name]. Reviews, pricing data, ingredient analysis, and competitive comparisons for spa directors and medspa owners.
```
155–160 characters. Dynamically populated. If brand has reviews: prepend `"[X.X stars from N professionals] —"` before "See what."

**Canonical URL:**
```
https://socelle.com/brands/[slug]
```

**Open Graph:**
```
og:title     = [Brand Name] — Professional Intelligence | Socelle
og:description = [Meta description text]
og:image     = [brand logo or SOCELLE branded card image]
og:type      = website
og:url       = https://socelle.com/brands/[slug]
```

**Twitter Card:**
```
twitter:card        = summary_large_image
twitter:title       = [Brand Name] — Professional Intelligence | Socelle
twitter:description = [Meta description text]
twitter:image       = [brand card image]
```

### 3.2 Target Keywords Per Page

Primary (high intent):
- `[brand] professional reviews`
- `[brand] for spas`
- `[brand] for medspas`
- `[brand] spa products`

Secondary (informational):
- `[brand] ingredients`
- `[brand] vs [top competitor in category]`
- `[brand] pricing`
- `[brand] training`

Long-tail (high conversion, low competition):
- `[brand] esthetician review`
- `[brand] wholesale for salons`
- `is [brand] good for medspas`
- `[brand] professional skincare line`

### 3.3 Structured Data — JSON-LD Specification

Four schema types applied to every brand profile page. Full example using SkinCeuticals:

#### Organization Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "SkinCeuticals",
  "url": "https://www.skinceuticals.com",
  "logo": "https://socelle.com/cdn/brands/skinceuticals/logo.png",
  "description": "SkinCeuticals is a professional-grade skincare brand owned by L'Oréal Group, founded in 1994, specializing in antioxidant serums, vitamin C formulations, and corrective skincare for spa and medspa professionals.",
  "foundingDate": "1994",
  "parentOrganization": {
    "@type": "Organization",
    "name": "L'Oréal Group"
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "New York",
    "addressRegion": "NY",
    "addressCountry": "US"
  },
  "sameAs": [
    "https://www.instagram.com/skinceuticals",
    "https://www.facebook.com/SkinCeuticals",
    "https://en.wikipedia.org/wiki/SkinCeuticals"
  ]
}
```

#### Product Schema (one per key product line, rendered as ItemList)

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "SkinCeuticals Key Product Lines",
  "description": "Professional skincare product lines from SkinCeuticals available for spa and medspa use",
  "url": "https://socelle.com/brands/skinceuticals",
  "numberOfItems": 3,
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Product",
        "name": "C E Ferulic",
        "brand": {
          "@type": "Brand",
          "name": "SkinCeuticals"
        },
        "description": "Combination antioxidant treatment featuring 15% pure vitamin C, 1% vitamin E, and 0.5% ferulic acid. Neutralizes free radicals, improves visible signs of aging.",
        "category": "Antioxidant Serum",
        "url": "https://www.skinceuticals.com/c-e-ferulic",
        "offers": {
          "@type": "Offer",
          "price": "182.00",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "seller": {
            "@type": "Organization",
            "name": "SkinCeuticals"
          }
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 2,
      "item": {
        "@type": "Product",
        "name": "Phloretin CF",
        "brand": {
          "@type": "Brand",
          "name": "SkinCeuticals"
        },
        "description": "Daytime vitamin C antioxidant treatment with 10% pure vitamin C, 2% phloretin, and 0.5% ferulic acid. Targets multiple signs of aging and hyperpigmentation.",
        "category": "Antioxidant Serum",
        "url": "https://www.skinceuticals.com/phloretin-cf",
        "offers": {
          "@type": "Offer",
          "price": "182.00",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "seller": {
            "@type": "Organization",
            "name": "SkinCeuticals"
          }
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 3,
      "item": {
        "@type": "Product",
        "name": "Triple Lipid Restore 2:4:2",
        "brand": {
          "@type": "Brand",
          "name": "SkinCeuticals"
        },
        "description": "Corrective cream containing 2% pure ceramides, 4% natural cholesterol, and 2% fatty acids to nourish and restore the skin's natural barrier.",
        "category": "Barrier Repair",
        "url": "https://www.skinceuticals.com/triple-lipid-restore",
        "offers": {
          "@type": "Offer",
          "price": "128.00",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "seller": {
            "@type": "Organization",
            "name": "SkinCeuticals"
          }
        }
      }
    }
  ]
}
```

#### AggregateRating Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "SkinCeuticals Professional Skincare",
  "brand": {
    "@type": "Brand",
    "name": "SkinCeuticals"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.6",
    "reviewCount": "847",
    "bestRating": "5",
    "worstRating": "1",
    "ratingExplanation": "Aggregate rating from verified licensed beauty professionals on Socelle"
  },
  "description": "Professional-grade skincare line reviewed by licensed estheticians, spa directors, and medspa operators on Socelle"
}
```

#### Review Schema (first 3 reviews, rendered as structured data array)

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Professional Reviews — SkinCeuticals",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Review",
        "itemReviewed": {
          "@type": "Brand",
          "name": "SkinCeuticals"
        },
        "author": {
          "@type": "Person",
          "name": "Verified Esthetician",
          "description": "Licensed esthetician, New York"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5",
          "worstRating": "1"
        },
        "reviewBody": "The C E Ferulic remains a cornerstone of my facial protocols. Client retention is noticeably higher when I include it. Formulation consistency over 12+ years is unmatched.",
        "datePublished": "2026-02-15",
        "publisher": {
          "@type": "Organization",
          "name": "Socelle"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 2,
      "item": {
        "@type": "Review",
        "itemReviewed": {
          "@type": "Brand",
          "name": "SkinCeuticals"
        },
        "author": {
          "@type": "Person",
          "name": "Verified Spa Director",
          "description": "Spa director, California"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "4",
          "bestRating": "5",
          "worstRating": "1"
        },
        "reviewBody": "Exceptional efficacy scores across our team but the price point creates retail resistance. Training support from the brand rep is genuinely best-in-class.",
        "datePublished": "2026-01-28",
        "publisher": {
          "@type": "Organization",
          "name": "Socelle"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 3,
      "item": {
        "@type": "Review",
        "itemReviewed": {
          "@type": "Brand",
          "name": "SkinCeuticals"
        },
        "author": {
          "@type": "Person",
          "name": "Verified Medspa Owner",
          "description": "Medspa owner, Texas"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5",
          "worstRating": "1"
        },
        "reviewBody": "We carry SkinCeuticals as our anchor homecare line. The clinical science backing is something we can speak to confidently with our medical clientele. Worth the investment.",
        "datePublished": "2026-01-10",
        "publisher": {
          "@type": "Organization",
          "name": "Socelle"
        }
      }
    }
  ]
}
```

### 3.4 Internal Linking Strategy

Every brand name mention across the SOCELLE platform links to the corresponding brand profile. Specifically:

**Intelligence feed articles:** Any article mentioning a brand name in body text renders that mention as an inline link to `/brands/[slug]`. Implemented as a post-processing step in the content rendering pipeline — regex match against brand name index, inject anchor tag.

**Education content pages:** Brand references in technique articles, video descriptions, and course descriptions link to brand profiles.

**Event pages:** Brand sponsor tags on event detail pages link to brand profiles. "Events featuring [Brand]" section on brand profiles links back to `/events?brand=[slug]`.

**Competitive positioning sections:** "Category peers" shown in comparison always link to the comparison brand's profile.

**Email digests:** Brand names mentioned in weekly briefing emails link to brand profiles (tracked UTM links for analytics).

**Protocol pages:** Every product/brand mentioned in treatment protocol detail pages links to the brand profile.

### 3.5 Sitemap and Indexing

- Brand profile pages included in `/sitemap.xml` under `<url>` entries with `changefreq: weekly` and `priority: 0.8`
- New brand pages auto-submitted to Google Search Console via Indexing API on creation
- `robots.txt` allows crawling of all `/brands/*` paths
- Pagination of reviews at `/brands/[slug]/reviews` with canonical pointing to main profile page

---

## Section 4: Brand Seed List — 50+ Brands

### 4.1 Professional Skincare (10 brands)

| Brand | Parent Company | Primary Data Sources |
|---|---|---|
| SkinCeuticals | L'Oréal Group | Sephora/Ulta listing, Open Beauty Facts, brand website, Google Knowledge Graph |
| SkinMedica | AbbVie | Brand website, Open Beauty Facts, Ulta listing |
| Obagi Medical | Crown Laboratories | Brand website, Open Beauty Facts, Google Knowledge Graph |
| ZO Skin Health | ZO International | Brand website, Open Beauty Facts, dermatology publications |
| PCA Skin | Colgate-Palmolive | Sephora/Ulta listing, Open Beauty Facts, brand website |
| iS Clinical | Innovative Skincare | Brand website, Open Beauty Facts, professional distributor listings |
| Dermalogica | Unilever | Sephora/Ulta listing, Open Beauty Facts, Google Knowledge Graph |
| Image Skincare | Image Skincare Inc. | Brand website, Open Beauty Facts, professional beauty supply listings |
| Environ Skincare | Environ (Pty) Ltd | Brand website, Open Beauty Facts, authorized distributor websites |
| Murad | Unilever | Sephora/Ulta listing, Open Beauty Facts, Google Knowledge Graph |

### 4.2 Injectables & Biologics (5 brands)

| Brand | Parent Company | Primary Data Sources |
|---|---|---|
| Allergan Aesthetics (Botox, Juvederm) | AbbVie | FDA public device database, brand website (HCP section), RealSelf public reviews, medical publications |
| Galderma (Restylane, Dysport) | EQT Partners | FDA public device database, brand website (HCP section), RealSelf, medical publications |
| Evolus (Jeuveau) | Evolus Inc. | FDA 510(k) database, brand website, RealSelf public data |
| Merz Aesthetics (Xeomin, Belotero) | Merz Group | FDA public device database, brand website (HCP section), RealSelf |
| Prollenium (Revanesse) | Prollenium Medical | Health Canada public listings, brand website, RealSelf public data |

**Note on injectables data:** All sentiment and adoption data sourced exclusively from provider accounts on SOCELLE. No patient data, no outcome data, no clinical claims. Brand profile pages for injectable brands prominently note: "Clinical information on this page is general in nature. Medical decisions should involve qualified medical professionals."

### 4.3 Aesthetic Devices (9 brands)

| Brand | Parent Company | Primary Data Sources |
|---|---|---|
| HydraFacial | BeautyHealth Company | Brand website, trade show listings (ISPA, AAD), industry publications |
| Sciton (Halo, BBL) | Sciton Inc. | Brand website, medical device publications, trade show listings |
| CoolSculpting | Allergan (AbbVie) | Brand website, FDA device database, RealSelf public data |
| Venus Concept | Venus Concept Ltd. | Brand website, medical device publications, trade show listings |
| Candela Medical | Syneron-Candela | FDA 510(k) database, brand website, medical publications |
| Cutera | Cutera Inc. | Brand website, FDA device database, medical publications |
| Lumenis | Boston Scientific | Brand website, FDA device database, medical publications |
| Alma Lasers | Sisram Medical | Brand website, trade show listings, medical publications |
| InMode | InMode Ltd. | Brand website, FDA device database, Nasdaq investor relations (public) |

### 4.4 Professional Haircare (10 brands)

| Brand | Parent Company | Primary Data Sources |
|---|---|---|
| Olaplex | Olaplex Holdings | Sephora/Ulta listing, Open Beauty Facts, brand website, Google Knowledge Graph |
| Redken | L'Oréal Professional | Open Beauty Facts, Sephora listing, brand website |
| Wella Professionals | Wella Company | Open Beauty Facts, professional beauty supply listings, brand website |
| Schwarzkopf Professional | Henkel | Open Beauty Facts, professional beauty supply listings, brand website |
| Goldwell | Kao Corporation | Open Beauty Facts, professional beauty supply listings, brand website |
| Moroccanoil | Moroccanoil Israel | Sephora/Ulta listing, Open Beauty Facts, brand website |
| Kevin Murphy | Revlon Professional | Open Beauty Facts, professional distributor websites, brand website |
| Davines | Davines Group | Open Beauty Facts, professional distributor websites, brand website |
| R+Co | Luxury Brand Partners | Sephora listing, Open Beauty Facts, brand website |
| Pureology | L'Oréal Professional | Sephora/Ulta listing, Open Beauty Facts, brand website |

### 4.5 Nail & Lash (5 brands)

| Brand | Parent Company | Primary Data Sources |
|---|---|---|
| OPI | Wella Company | Ulta listing, Open Beauty Facts, brand website, professional supply distributors |
| CND / Shellac | Revlon Professional | Brand website, Open Beauty Facts, professional supply distributors |
| Gelish | Hand & Nail Harmony | Brand website, professional beauty supply listings |
| Borboleta Beauty | Borboleta Inc. | Brand website, professional lash supply distributors |
| Xtreme Lashes | Xtreme Lashes LLC | Brand website, professional lash distributor listings |

### 4.6 Wellness & Body (6 brands)

| Brand | Parent Company | Primary Data Sources |
|---|---|---|
| Elemis | L'Occitane Group | Sephora listing, Open Beauty Facts, brand website, Google Knowledge Graph |
| Comfort Zone | Davines Group | Open Beauty Facts, professional spa distributor listings, brand website |
| OSEA Malibu | OSEA Inc. | Sephora listing, Open Beauty Facts, brand website |
| Pevonia | Pevonia International | Brand website, Open Beauty Facts, professional spa distributor listings |
| Eminence Organic | Eminence Organic Skin Care | Brand website, Open Beauty Facts, professional spa distributor listings |
| Repêchage | Repêchage Inc. | Brand website, Open Beauty Facts, ISPA exhibitor listings |

### 4.7 Professional Tools & Equipment (6 brands)

| Brand | Parent Company | Primary Data Sources |
|---|---|---|
| Dermalogica Pro (tools) | Unilever | Brand website, professional supply distributors |
| NovaBay (tools) | NovaBay Pharmaceuticals | Brand website, professional supply listings |
| Ultrasun Professional | Ultrasun Ltd. | Brand website, professional beauty supply listings |
| Glo Professional (SPF/tools) | Glo Skin Beauty | Brand website, professional distributor listings |
| Circadia | Circadia by Dr. Pugliese | Brand website, Open Beauty Facts, professional distributor listings |
| BioMedic by La Roche-Posay | L'Oréal Group | Sephora listing, Open Beauty Facts, brand website |

### 4.8 Color Cosmetics (Professional) (5 brands)

| Brand | Parent Company | Primary Data Sources |
|---|---|---|
| NARS Cosmetics | Shiseido Group | Sephora listing, Open Beauty Facts, brand website, Google Knowledge Graph |
| Make Up For Ever | LVMH | Sephora listing, Open Beauty Facts, brand website |
| Kjaer Weis | Kjaer Weis LLC | Sephora listing, Open Beauty Facts, brand website |
| Glo Skin Beauty | Glo Skin Beauty LLC | Brand website, Open Beauty Facts, professional distributor listings |
| Jane Iredale | Jane Iredale Cosmetics | Brand website, Open Beauty Facts, professional spa distributor listings |

**Total seed brands: 56 across 8 categories.**

All 56 brands have at minimum: website URL, category classification, tier classification, and at least one primary data source active. Pipeline ingestion prioritizes this list for initial batch processing.

---

## Section 5: Claimed vs. Unclaimed Comparison

### 5.1 Claim CTA — Canonical Copy

```
Is this your brand? Claim this page to control your profile,
post updates, and access professional intelligence.

[Claim Your Page →]
```

Displayed:
- In header bar on every unclaimed page (pro-navy background, pro-gold text, persistent)
- Inline between Section G (competitive positioning) and Section H (affiliate block)
- In footer CTA panel at page bottom
- In weekly brand lead digest emails sent to brands detected via contact scrape

### 5.2 Tier Comparison Table

| Feature | Unclaimed | Basic Claimed ($199/mo) | Pro Claimed ($499/mo) | Enterprise ($999/mo) |
|---|---|---|---|---|
| **Auto-generated brand overview** | Shown | Shown (replaceable) | Shown (replaceable) | Shown (replaceable) |
| **Professional sentiment & reviews** | Shown (read-only) | Shown (read-only) | Shown + respond to reviews | Shown + respond + flag disputes |
| **Product catalog (auto)** | Shown | Shown | Shown | Shown |
| **Provider adoption map** | Shown (blurred below metro 3) | Shown in full | Shown in full | Shown in full + export |
| **Trend intelligence** | Current period only | 12-month history | 24-month history | 36-month history + alerts |
| **Education availability (auto)** | Shown | Shown | Shown | Shown |
| **Competitive positioning** | Shown (anonymized peers) | Shown (anonymized peers) | Shown + named peers | Shown + full category matrix |
| **Verified badge** | None | Shown | Shown | Shown |
| **Official brand statement** | Auto-generated text only | Editable | Editable | Editable |
| **Brand logo upload** | Auto-fetched | Uploadable | Uploadable | Uploadable |
| **Hero image upload** | None | Uploadable | Uploadable | Uploadable |
| **Latest news posts** | None | None | Up to 12 posts/mo | Unlimited |
| **Product launch announcements** | None | None | 3 launches/mo | Unlimited |
| **Education hub (brand-uploaded)** | None | None | Up to 5 items | Unlimited |
| **Sales rep contact info** | None | Yes | Yes | Yes |
| **Authorized distributor links** | None | Up to 3 | Up to 10 | Unlimited |
| **Response to reviews** | None | None | Yes | Yes |
| **Claim CTA bar** | Visible | Hidden | Hidden | Hidden |
| **Affiliate block on page** | Shown (3 placements) | Shown (1 placement, brand-adjacent) | None (removed) | None (removed) |
| **Brand page analytics dashboard** | None | 30-day rolling | 90-day history | 12-month history + cohort analysis |
| **Sentiment intelligence report** | None | None | Monthly email summary | Weekly dashboard + export |
| **API access to own brand data** | None | None | None | Full API access |
| **Dedicated account manager** | None | None | None | Yes |
| **Featured placement in category** | None | None | None | Yes (1 slot/category) |

### 5.3 Upgrade Path Logic

- Unclaimed pages link to `/claim/brand` — a form collecting brand name, claimant name, company role, and email for verification
- Basic claim ($199/mo) activates immediately upon Stripe subscription + email verification
- Pro upgrade ($499/mo) requires same verification, activates within 24 hours
- Enterprise ($999/mo) requires account manager review, activates within 2 business days
- Downgrade: features immediately restricted to new tier; content uploaded at higher tier preserved but hidden

### 5.4 Brand Lead Generation Flow

```
Google Search: "[Brand Name] professional reviews"
        ↓
SOCELLE brand profile page (auto-generated, indexed)
        ↓
Brand discovers their profile exists with operator sentiment
        ↓
Clicks "Claim Your Page" CTA
        ↓
/claim/brand form — email + company role verification
        ↓
Stripe checkout — selects tier
        ↓
Brand dashboard — profile editing, analytics, intelligence
        ↓
Upgrade path: Basic → Pro → Enterprise as value recognized
```

---

## Section 6: Analytics Tracking Specification

### 6.1 Tracked Events — All Brand Profile Pages

Every brand profile page view fires these events to the analytics pipeline (stored in `brand_page_analytics` and the general event log).

#### Metric 1: Page Views

- **Event name:** `brand_profile_view`
- **Trigger:** On page load (after 2-second dwell minimum to filter bots)
- **Data captured:** `brand_id`, `page_slug`, `timestamp`, `user_id` (nullable — anonymous visitors tracked), `session_id`, `referrer_url`, `utm_source`, `utm_medium`, `utm_campaign`
- **Storage:** Increments `brand_page_analytics.views` for the current date

#### Metric 2: Unique Visitors

- **Event name:** Derived metric, not a separate event
- **Method:** Unique `session_id` count per `brand_id` per `date` — computed from `brand_profile_view` events
- **Storage:** Computed daily into `brand_page_analytics.unique_visitors` via pg-boss scheduled job

#### Metric 3: Claim CTA Clicks

- **Event name:** `brand_claim_cta_click`
- **Trigger:** User clicks any claim CTA element on the page (header bar, inline, footer panel, header button)
- **Data captured:** `brand_id`, `cta_position` (header_bar | inline | footer | header_button), `user_id` (nullable), `timestamp`, `session_id`, `brand_slug`
- **Storage:** Increments `brand_page_analytics.claim_cta_clicks`; also stored in separate `claim_cta_events` table for funnel analysis
- **Downstream:** Powers "Claim Conversion Rate" metric in admin dashboard — CTA clicks ÷ page views

#### Metric 4: Affiliate Link Clicks

- **Event name:** `affiliate_link_click`
- **Trigger:** User clicks any affiliate product link on the brand profile page
- **Data captured:** `placement_id`, `affiliate_product_id`, `brand_id` (host brand page), `user_id` (nullable), `clicked_at`, `referrer_url` (the brand profile URL), `affiliate_url`
- **Storage:** Stored in `affiliate_clicks` table; increments `brand_page_analytics.affiliate_clicks`
- **Downstream:** Powers affiliate commission tracking, conversion attribution, and affiliate program reporting

#### Metric 5: Review Submissions

- **Event name:** `brand_review_submitted`
- **Trigger:** User submits a review via the review form on the brand profile page
- **Data captured:** `brand_id`, `user_id`, `rating`, `review_length` (character count — no content), `has_aspects` (boolean), `timestamp`
- **Storage:** Increments `brand_page_analytics.review_submissions`; actual review stored in `brand_reviews` table
- **Downstream:** Triggers re-computation of aggregate rating; triggers brand notification (if claimed) of new review

#### Metric 6: Social Share Events

- **Event name:** `brand_profile_share`
- **Trigger:** User clicks any share button (copy link, share to LinkedIn, share to Instagram, email share)
- **Data captured:** `brand_id`, `share_medium` (copy_link | linkedin | instagram | email), `user_id` (nullable), `timestamp`, `session_id`
- **Storage:** Stored in event log; not in `brand_page_analytics` (separate share_events table)
- **Downstream:** Powers virality coefficient metric; share events trigger scheduled crawl of shared URLs to check for backlinks

### 6.2 Scroll Depth Milestones

Scroll depth tracked at 25%, 50%, 75%, and 100% of page height.

- **Event name:** `brand_profile_scroll_depth`
- **Trigger:** User scrolls to 25 / 50 / 75 / 100% of page
- **Data captured:** `brand_id`, `depth_percentage`, `timestamp`, `session_id`, `time_to_reach_seconds`
- **Storage:** Event log only; aggregated weekly into `avg_time_on_page_seconds` for `brand_page_analytics`

**Key insight:** Scroll depth to 50% indicates the user reached the product catalog section. Scroll to 75% indicates reach of the trend/education data. Scroll to 100% indicates full page engagement — the highest-quality engagement signal for brand lead scoring.

### 6.3 Session Duration

- **Method:** Computed from first `brand_profile_view` event to last event in same session for same brand page
- **Storage:** Stored as `avg_time_on_page_seconds` in `brand_page_analytics` (rolling average per day)
- **Displayed to:** Brand dashboard (claimed brands only, 30+ day tier and above)

### 6.4 Analytics Aggregation Schedule

| Metric | Computation frequency | Method |
|---|---|---|
| Views | Real-time increments | Postgres row insert/increment |
| Unique visitors | Hourly | pg-boss scheduled job |
| Claim CTA clicks | Real-time increments | Postgres row insert/increment |
| Affiliate clicks | Real-time | Immediate insert to affiliate_clicks |
| Review submissions | Real-time | Triggered by review insert |
| Social shares | Real-time | Event log insert |
| Scroll depth aggregation | Daily at 02:00 UTC | pg-boss scheduled job |
| Session duration | Daily at 02:00 UTC | pg-boss scheduled job |
| Top referrer | Daily at 02:00 UTC | Aggregation query |

### 6.5 Admin Analytics Surfaces

All brand page analytics visible to SOCELLE admin at `/admin/brand-analytics`:
- Top 20 brand pages by views (daily/weekly/monthly toggle)
- Top 20 by claim CTA click rate
- Top 20 by affiliate click rate
- Review velocity leaderboard
- Unclaimed pages with highest traffic (highest-priority brand outreach targets)

Brand-level analytics visible to claimed brands in their brand portal at `/brand/analytics`:
- Gated by claim tier (30-day for Basic, 90-day for Pro, 12-month for Enterprise)

---

## Appendix A: Page Performance Targets

| Metric | Target | Measurement |
|---|---|---|
| Time to First Contentful Paint | < 1.8s | Lighthouse / Core Web Vitals |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Cumulative Layout Shift | < 0.1 | Lighthouse |
| Total Blocking Time | < 200ms | Lighthouse |
| Page weight (initial load) | < 300KB gzipped | Network tab |

All brand profile pages render critical content server-side (or via pre-rendering at build time for seed brands). Product catalog and review sections lazy-loaded. Trend charts deferred until scroll reaches section.

---

## Appendix B: Brand Profile Component Map

These React components implement the brand profile page spec. To be built as part of the brand profiles feature:

| Component | File path | Responsibility |
|---|---|---|
| `BrandProfilePage` | `src/pages/public/BrandProfile.tsx` | Page container, routes `/brands/[slug]` |
| `BrandProfileHeader` | `src/components/brand-profile/BrandProfileHeader.tsx` | Logo, name, badges, claim CTA bar |
| `BrandSentimentPanel` | `src/components/brand-profile/BrandSentimentPanel.tsx` | Star ratings, aspect scores, review excerpts |
| `BrandOverviewPanel` | `src/components/brand-profile/BrandOverviewPanel.tsx` | Description, key facts, official statement (claimed) |
| `BrandProductCatalog` | `src/components/brand-profile/BrandProductCatalog.tsx` | Product line cards, ingredient tags |
| `BrandAdoptionMap` | `src/components/brand-profile/BrandAdoptionMap.tsx` | Metro adoption bars, specialty breakdown |
| `BrandTrendChart` | `src/components/brand-profile/BrandTrendChart.tsx` | Sparkline, lifecycle stage badge |
| `BrandEducationList` | `src/components/brand-profile/BrandEducationList.tsx` | CE courses, events, certifications |
| `BrandCompetitorMatrix` | `src/components/brand-profile/BrandCompetitorMatrix.tsx` | Category positioning visualization |
| `BrandClaimCTA` | `src/components/brand-profile/BrandClaimCTA.tsx` | Reusable claim panel (header + footer variants) |
| `BrandPostsFeed` | `src/components/brand-profile/BrandPostsFeed.tsx` | Claimed brand news/launch posts feed |
| `BrandReviewForm` | `src/components/brand-profile/BrandReviewForm.tsx` | Authenticated review submission |
| `BrandAffiliateBlock` | `src/components/brand-profile/BrandAffiliateBlock.tsx` | Affiliate recommendation section |

All components use SOCELLE design tokens (pro-navy, pro-gold, pro-ivory, etc.) and Tailwind CSS. Liquid glass card treatment (`backdrop-blur-sm bg-white/60 border border-white/40`) applied to all panel surfaces per WO-last visual system.

---

*Document complete. For implementation questions, reference `/platform/BRAND_PROFILES_MIGRATION.sql` for database schema and `CLAUDE.md` for platform protection rules.*
