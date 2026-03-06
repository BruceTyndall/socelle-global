# SOCELLE — Wave 1 Build Strategy (Updated)

**Classification:** Internal planning document — updated March 2026
**Status:** Authoritative — supersedes Wave 1 sections in SOCELLE_FULL_BUILD_ALL_WAVES_v6.md and Socelle_Pro_Working_Channel_Roadmap.md
**Version:** 2.0 — Complete Platform Model with Automation Architecture, Brand Intelligence Pages, and Affiliate Commerce

---

## Strategic Thesis

SOCELLE is a **living beauty intelligence portal** — not a static hub, not a media company, not a community. The platform attracts spa directors, medspa owners, service providers, and brands through education, data, public brand intelligence, industry events, and live signals. It retains them through freshness, personalization, and recurring value. It monetizes through six staggered revenue streams, with affiliate commerce active from day one and brand claim subscriptions converting passive brand traffic into recurring SaaS revenue.

Wave 1 launches a fully automated intelligence portal. 90% of the content is auto-generated from lawful public sources. The editorial team contributes 6–8 hours per week at steady state. Everything else runs via pipeline.

---

## Why Intelligence-First, Not Community-First

Every competitor in professional beauty is a community play. BehindTheChair.com is the world's largest hairstylist community. PBA has 100,000+ members. ISPA has 3,000+ member organizations. Live Love Spa runs 22+ annual events.

We cannot out-community organizations with decades of trust and hundreds of thousands of members.

But none of them are technology companies. None of them have:
- A personalized feed engine
- Professional surveys that compensate participants
- Brand-funded research panels
- Business benchmarking data
- A verified professional identity layer
- AI-powered intelligence tools
- Auto-generated brand profile pages indexed for professional search queries
- A structured events extraction system
- Contextual affiliate commerce embedded in intelligence content

They are media companies, associations, and event companies running on editorial calendars, membership dues, and expo floor revenue. SOCELLE is an intelligence and technology platform. That is a fundamentally different business that creates a fundamentally different moat.

Community happens as a byproduct when professionals return every day because the intelligence tools are that good. We do not sell belonging — we sell value.

---

## Why Web-First, Not App-First

- Web-first means SEO works immediately. Quiz results pages, brand profile pages, and event pages get indexed. Articles rank. Intelligence reports drive organic traffic.
- Web-first means no App Store approval delays.
- Web-first means instant updates and zero version fragmentation.
- Web-first means email and SMS as the primary engagement engine.
- Web-first means lower build cost and faster iteration.
- The existing React/Vite codebase already runs as a web application.
- Mobile comes later as a PWA or native wrapper once proven engagement patterns exist.

With 500+ auto-generated brand profile pages and 200+ event pages at launch, SOCELLE has an organic SEO surface that no competitor can match. This is not human-written editorial — it is a living, auto-updating intelligence corpus indexed by Google from day one.

---

## What Ships in Wave 1

Wave 1 ships a complete, production-ready public intelligence portal. The following eight capabilities ship together at launch:

**1. Public intelligence feed (news, trends, signals)**
A personalized feed aggregating industry news from 30+ publications, embedded polls (2–3 per week), technique signals, trend alerts, and editorial picks. Personalized to specialty and business type via the Explore Profile. The feed is the front door of the platform and the primary daily engagement surface.

**2. Brand and business discovery pages**
The existing brands discovery grid (`/brands`) and business/operator-facing pages, reframed through the intelligence-first lens. Brand cards surface trending signals, adoption data, and category positioning — not just product listings.

**3. Education content hub**
A structured education content index aggregating CE-eligible courses, technique videos, business education, and professional development resources. Sourced from YouTube Data API, RSS feeds, PubMed, and CE catalog scrapes. Tagged by specialty, audience level, and CE credit availability.

**4. SEO foundation (structured data, sitemaps, canonical URLs)**
Complete technical SEO infrastructure: JSON-LD structured data (Organization, Product, Review schemas), XML sitemap with auto-submission to Google Search Console on new page creation, canonical URLs on all routes, per-page react-helmet-async meta, robots.txt, and Open Graph tags.

**5. Request access / waitlist flow**
The `/request-access` conversion page with dual-path CTAs (operator or brand), an Explore Profile onboarding flow (5 steps: role → specialty → interests → experience → location), and Brevo CRM integration for segmented email follow-up.

**6. Public brand intelligence pages (auto-generated, 500+ brands at launch)**
Auto-generated public profile pages for 500+ professional beauty brands, assembled from lawful public data sources. Each page targets long-tail professional search queries no competitor currently owns. Pages are claimable by brands directly, creating a permanent inbound brand acquisition funnel. Full specification in the Automation Architecture section below.

**7. Contextual affiliate recommendation blocks across all content surfaces**
Editorially curated, premium affiliate product recommendations placed contextually alongside intelligence content. Not banner ads. Not invasive commerce. Wirecutter-style contextual placement: "Top-rated facial devices for 2026" appearing below a trend article about peptides, not in a sidebar. Full placement map in the Revenue Model section below.

**8. Brand claim flow (basic CTA on unclaimed pages)**
Every auto-generated brand profile page that has not yet been claimed displays a persistent "Claim This Page" CTA. This creates a permanent, passive brand acquisition funnel. Brands discover their page via Google, see operator sentiment and intelligence data, and are prompted to claim and control their profile. Full brand claim subscription model in the Revenue Model section below.

---

## Site Architecture and SEO Map

All routes, primary keyword targets, and search intent classifications:

| Route | Primary Keyword Target | Intent | Priority |
|---|---|---|---|
| `/` | "professional beauty intelligence platform" | Informational/Brand | P0 — Launch |
| `/for-buyers` | "professional beauty wholesale for salons" | Commercial | P0 — Launch |
| `/for-brands` | "sell wholesale to salons" / "beauty brand wholesale" | Commercial | P0 — Launch |
| `/how-it-works` | "how professional beauty platform works" | Informational | P0 — Launch |
| `/request-access` | "join professional beauty intelligence platform" | Transactional | P0 — Launch |
| `/pricing` | "professional beauty platform pricing" | Commercial | P0 — Launch |
| `/about` | "SOCELLE professional beauty company" | Brand | P1 — Launch |
| `/insights` | "professional beauty market insights" | Informational | P0 — Launch |
| `/insights/[slug]` | Article-specific long-tail keywords | Informational | P0 — Launch |
| `/education` | "professional beauty CE courses" / "esthetician continuing education" | Informational/Commercial | P0 — Launch |
| `/brands` | "professional beauty brands wholesale" | Commercial | P0 — Launch |
| `/brands/[slug]` | "[brand name] professional reviews" / "[brand name] for spas" | Informational/Commercial | P0 — Launch |
| `/events` | "beauty industry events 2026" / "spa industry conference" | Informational | P1 — Launch |
| `/events/[slug]` | "[event name] 2026" / "esthetician CE [city]" | Informational | P1 — Launch |
| `/for-medspas` | "medspa intelligence platform" / "medspa Botox pricing [state]" | Informational/Commercial | P1 — Launch |
| `/for-salons` | "salon benchmarking" / "salon wholesale intelligence" | Informational/Commercial | P1 — Launch |
| `/faq` | "professional beauty platform FAQ" | Informational | P1 — Launch |
| `/privacy` | — | — | P0 — Keep |
| `/terms` | — | — | P0 — Keep |
| `/portal/signup` | "join professional beauty platform" | Transactional | P0 — Existing |
| `/portal/login` | — | — | P0 — Existing |
| `/brand/apply` | "apply to sell wholesale beauty" | Transactional | P1 — Existing |
| `/admin/*` | — | Admin-only | Protected |

### Brand Profile Page SEO Template

- **Title:** `[Brand Name] — Professional Reviews, Pricing & Intelligence | Socelle`
- **Meta Description:** `See what licensed professionals think about [Brand Name]. Reviews, pricing data, ingredient analysis, and competitive comparisons for spa directors and medspa owners.` (155 chars max)
- **H1:** `[Brand Name]: Professional Beauty Intelligence`
- **Structured Data:** Organization + Product + AggregateRating JSON-LD
- **Canonical:** `https://socelle.com/brands/[slug]`
- **Additional keyword targets:** `[brand name] vs [competitor]`, `[brand name] ingredients`, `[brand name] wholesale pricing`

### Event Page SEO Template

- **Title:** `[Event Name] 2026 — Beauty Industry Events | Socelle`
- **Meta Description:** `[Event Name] details, dates, CE credits, and registration for spa directors and medspa owners. Professional beauty events calendar.` (155 chars max)
- **H1:** `[Event Name] [Year]`
- **Structured Data:** Event JSON-LD with startDate, location, organizer, offers
- **Canonical:** `https://socelle.com/events/[slug]`
- **Additional keyword targets:** `beauty industry events [city]`, `esthetician CE [state]`

---

## Automation Architecture

SOCELLE shares the crawl/normalize/signal pipeline with Viaive (defined in the Beauty Intelligence Data Architecture document and Enterprise Hardening Appendix). The following specifications define which pipeline outputs feed SOCELLE and what additional automation modules SOCELLE requires beyond the shared Viaive pipeline.

All automation jobs run as pg-boss queue workers within the same job system defined in the Enterprise Hardening Appendix (section G.2). New source-specific job types are registered in the existing job registry.

### The 10 Automation Surfaces

**1. Brand Profiles (500+ brands)**
- **Method:** Google Places API + Yelp API + website scrape + brand locator page extraction + social bio extraction (LinkedIn, Instagram bio scrape where public)
- **Data assembled:** Brand overview (name, parent company, category, tier classification, HQ, founding year), product catalog (key lines, ingredients, retail pricing from Sephora/Ulta public data + Open Beauty Facts), trend data (Google Trends interest, social mention volume, lifecycle stage), education availability (known CE courses and webinars scraped from brand sites)
- **Refresh:** Monthly automated refresh. Top 50 brands reviewed by editorial quarterly. New brand additions flagged for editorial sign-off.
- **Human touch:** ~2 hrs/week for flagged reviews

**2. Industry News Feed**
- **Method:** RSS aggregation from 30+ professional beauty publications (American Spa, Dayspa, Modern Salon, Dermascope, Skin Inc., Les Nouvelles Esthétiques, Pulse, Allure Business, WWD Beauty, Cosmetics & Toiletries, Global Cosmetic Industry, HairBrained, BehindTheChair editorial RSS, NCEA, ASCP, AmSpa, and others) + Reddit beauty subs (r/esthetics, r/mua, r/salon) + YouTube channel RSS feeds from key educators
- **Refresh:** Every 6 hours
- **Human touch:** Editorial picks for "Featured" slot (2–3 per day, approximately 15 min/day)

**3. Events Calendar**
- **Method:** Scrape ISPA, PBA, BTC, Live Love Spa, Spa Collab, Eventbrite (beauty category API), NCEA, ASCP, AmSpa event pages, brand education event pages (Redken, Moroccanoil, HydraFacial, SkinCeuticals, iS Clinical, etc.). Event type classification via LLM enrichment.
- **Refresh:** Weekly automated scrape + re-verification before event dates
- **Human touch:** Verify new events, remove cancelled events (~30 min/week)

**4. Category Intelligence**
- **Method:** Materialized views from the shared Beauty Intelligence Data Architecture pipeline: `mv_business_scores`, `mv_metro_benchmarks`, `mv_category_trends`, `mv_brand_adoption`. These views are computed from the upstream Viaive pipeline and surfaced on SOCELLE pages without duplication of pipeline infrastructure.
- **Refresh:** Daily (scores) and weekly (metro benchmarks). No human touch required at steady state. Anomaly alerts flag for spot-check.

**5. Trend Intelligence**
- **Method:** Google Trends API (keyword interest over time by geography) + social hashtag volume tracking (Instagram, TikTok, Pinterest) + Reddit velocity scoring (posts per day, upvote rate in beauty subs) from the shared Data Architecture trend pipeline
- **Refresh:** Weekly. Lifecycle stage transitions (emerging → growing → peaking → declining) reviewed.
- **Human touch:** Review lifecycle transitions (~15 min/week)

**6. Education Content Index**
- **Method:** YouTube Data API (search by professional beauty keywords, channel subscription for known educators) + RSS feeds from CE providers + PubMed search (ingredient efficacy, dermatology research) + CE catalog scrape (NCEA, ASCP, state board CE databases, American Institute of Medical Aesthetics)
- **Refresh:** Daily for new content detection, weekly for full re-index
- **Human touch:** Tag new content with audience level and specialty (~20 min/week)

**7. Affiliate Placements**
- **Method:** ShareASale, Impact.com, CJ Affiliate, Amazon Associates (professional tools category), and brand-direct affiliate program APIs for product data and pricing. Content-category matcher maps trending topics, brand page categories, and event types to relevant affiliate product selections from the curated affiliate catalog.
- **Refresh:** Weekly product data refresh. Affiliate selections are editorially curated — not auction-based.
- **Human touch:** Editorial curation of affiliate selections (~1 hr/week). Sentiment check: if a product brand receives negative signal in intelligence data, it is removed from affiliate placements.

**8. Profile Enrichment**
- **Method:** When a professional creates an Explore Profile, auto-enrich from: public professional license databases (state cosmetology board public records where available), Instagram/LinkedIn public bios, Google Business Profile for their salon or spa
- **Refresh:** On signup, then re-enrichment when license renewal dates approach
- **Human touch:** None. User confirms or edits enriched data.

**9. Polls and Quizzes**
- **Method:** LLM-assisted generation from trending topics detected in the news feed and trend pipeline. Generated candidates go into an editorial review queue before publishing.
- **Refresh:** 2–3 new polls or quiz questions per week
- **Human touch:** Human reviews and approves each poll and quiz before publish (~2 hrs/week). No poll or quiz publishes without human sign-off.

**10. Brand Page Analytics**
- **Method:** Page view tracking, unique visitor counting, CTA click tracking (claim CTA clicks, affiliate link clicks), average time on page. Stored in `brand_page_analytics` table. Aggregated weekly for brand dashboard (available after brand claims page).
- **Refresh:** Continuous (event-driven writes). Aggregated nightly.
- **Human touch:** None.

### Estimated Human Effort at Steady State

Total: approximately **6–8 hours per week**. This is one part-time content editor, not a content team. Everything else runs autonomously via the pipeline architecture.

| Task | Weekly Time |
|---|---|
| Editorial picks for news feed | ~1.5 hrs |
| Event verification and cleanup | ~0.5 hrs |
| Trend lifecycle review | ~0.25 hrs |
| Education content tagging | ~0.5 hrs |
| Poll and quiz review/approval | ~2 hrs |
| Affiliate selection curation | ~1 hr |
| Brand profile spot-check (top 50) | ~0.5 hrs (amortized) |
| Anomaly review and pipeline health | ~0.5 hrs |
| **Total** | **~6.75 hrs/week** |

---

## Public Brand Intelligence Pages — Full Specification

Public brand intelligence pages are the single most important addition to the platform model. They serve four functions simultaneously: SEO acquisition (attract), operator decision-making (value), claimable monetization (revenue), and brand funnel entry (B2B pipeline). Every other addition in this update is enhanced by brand profiles.

### What a Public Brand Profile Page Contains

**Auto-Generated Sections** (no brand involvement required):

- **Brand overview:** Name, parent company, headquarters, founding year, category (skincare, haircare, devices, injectables), tier classification (luxury/prestige/professional/mass). Sourced from website scrape + Open Beauty Facts + Google Knowledge Graph.
- **Professional sentiment:** Aggregated review sentiment from operators who use the brand. Star rating, aspect-level scores (efficacy, value, support, training), review excerpts. Sourced from SOCELLE internal review system + cross-referenced public reviews.
- **Product catalog:** Key product lines with ingredients, descriptions, and retail pricing. Sourced from brand website + Sephora/Ulta public data + Open Beauty Facts.
- **Provider adoption map:** What percentage of providers in each metro and specialty use this brand (from Explore Profile data). Anonymized aggregate only. No individual data exposed.
- **Trend data:** Google Trends interest, social media mention volume, lifecycle stage (emerging/growing/peaking/declining). Sourced from the Data Architecture trend pipeline.
- **Education availability:** Known CE courses, webinars, certifications offered by the brand. Sourced from event extraction + education content index.
- **Competitive positioning:** How this brand compares to others in the same category on price, sentiment, and adoption. Anonymized.
- **Contextual affiliate block:** "Where professionals source this category" — 2–3 affiliate-linked products from related brands or authorized retailers.

**Claimed Brand Sections** (available after brand claims page):

- **Official brand statement:** Brand-written description replacing auto-generated overview.
- **Latest news:** Brand posts official announcements, product launches, reformulations.
- **Education hub:** Brand uploads training videos, technique guides, CE-eligible content.
- **Contact and ordering:** Official sales rep contact, authorized distributor links, ordering information.
- **Product launches:** Featured new products with rich media.
- **Verified badge:** Visual indicator that this brand actively manages their SOCELLE presence.

### Brand Profile Database Schema

New tables added to `socelle.*` schema, extending the existing `brands` table:

| Table | Purpose | Key Columns |
|---|---|---|
| `brand_profiles` | Public profile page data | `brand_id FK`, `slug`, `auto_description`, `claimed`, `claimed_by`, `claimed_at`, `official_description`, `logo_url`, `hero_image_url`, `category`, `tier`, `parent_company`, `founded_year`, `headquarters`, `last_auto_refresh`, `last_manual_edit` |
| `brand_claims` | Claim requests and active subscriptions | `id`, `brand_id FK`, `claimant_user_id FK`, `claim_status` (pending/approved/rejected), `plan_tier` (basic/pro/enterprise), `stripe_subscription_id`, `claimed_at`, `approved_at` |
| `brand_posts` | Official news/updates by claimed brands | `id`, `brand_id FK`, `title`, `body`, `image_url`, `post_type` (news/launch/education), `published_at`, `is_featured` |
| `brand_reviews` | Operator reviews of brands | `id`, `brand_id FK`, `user_id FK`, `rating`, `review_text`, `aspects JSONB`, `verified_purchase`, `created_at` |
| `brand_page_analytics` | Page view and engagement tracking | `brand_id FK`, `date`, `views`, `unique_visitors`, `claim_cta_clicks`, `affiliate_clicks`, `avg_time_on_page` |

### Event Table Expansion

The existing `events` table is expanded with the following columns:

`event_type ENUM` (conference | training | webinar | summit | tradeshow | brand_education), `organizer_name`, `organizer_url`, `registration_url`, `registration_price_range`, `ce_credits_available BOOLEAN`, `ce_credits_count INT`, `capacity`, `specialty_tags TEXT[]`, `brand_sponsors TEXT[]`, `venue_name`, `venue_address`, `lat NUMERIC`, `lng NUMERIC`, `is_virtual BOOLEAN`, `description TEXT`, `hero_image_url`, `source_url`, `last_verified_at`, `auto_extracted BOOLEAN`

### Affiliate Commerce Schema

| Table | Key Columns |
|---|---|
| `affiliate_products` | `id`, `name`, `brand`, `category`, `description`, `image_url`, `affiliate_url`, `affiliate_network` (shareasale | impact | cj | amazon | brand_direct), `commission_rate`, `price_cents`, `is_active`, `created_at` |
| `affiliate_placements` | `id`, `affiliate_product_id FK`, `surface_type ENUM` (feed | brand_page | event | education | benchmark | quiz_result | email), `surface_entity_id`, `position`, `is_active`, `created_at` |
| `affiliate_clicks` | `id`, `placement_id FK`, `user_id FK` (nullable for anonymous), `clicked_at`, `referrer_url`, `converted BOOLEAN`, `conversion_value_cents INT`, `commission_earned_cents INT` |

---

## Path Decision: Web-First

The decision to build web-first is correct and is not revisited in this update.

**The core logic:**
- SEO distributes automatically — 500+ brand profile pages and 200+ event pages are indexed without human distribution effort
- Email and SMS (via Brevo) are more reliable engagement channels than push notifications at this stage
- The existing React/Vite/Supabase codebase is production-grade and requires no framework migration
- App Store submission timing would delay the organic SEO surface by months
- The intelligence content (benchmarks, brand profiles, event listings) is consumed in browser sessions, not in moments requiring native app capability

**When mobile becomes warranted:**
After proven engagement patterns are established (suggested threshold: 5,000+ professionals with active Explore Profiles, 10,000+ monthly active users), a PWA wrapper or React Native native app deployment is evaluated. The Supabase backend does not change — only the frontend presentation layer extends.

---

## Revenue Model

SOCELLE Wave 1 activates six revenue streams in staggered sequence. The intelligence portal is the acquisition surface for all six streams.

### Stream 0: Premium Affiliate Commerce (Day 1)

**The day-one revenue engine.** Requires zero brand partnerships and zero user scale to activate. Editorially curated, premium product and tool recommendations placed contextually alongside intelligence content. Not banner ads. Think Wirecutter-style contextual placement embedded naturally in content operators are already consuming.

**Placement rules:**

| Surface | Placement | Example | Max Per Page |
|---|---|---|---|
| News feed articles | Contextual recommendation block | Peptide trend article → "Top peptide serums for professionals" | 1 block (2–3 products) |
| Brand profile pages | "Where to buy" + alternatives | SkinCeuticals page → authorized retailer links + similar brands | 2 blocks |
| Event detail pages | "Prepare for [event]" block | ISPA Conference → travel, networking tools, product kits | 1 block (3–4 products) |
| Education content | "Tools used" block | Microneedling technique article → recommended devices + serums | 1 block (2–3 products) |
| Benchmarking pages | "Top performing" block | Facial pricing data → "Top-rated facial devices by category" | 1 block (2–3 products) |
| Quiz results pages | "Based on what pros chose" block | Color quiz results → "Most-recommended color lines by our panel" | 1 block (2–3 products) |
| Daily briefing email | "Editor's Pick" single product | One curated product per email, bottom placement | 1 product |

**Trust guardrails:**
- All affiliate content is labeled "Socelle Pick" — never disguised as editorial
- Maximum 2 affiliate placements per page
- Affiliate selections are editorially curated, never auction-based
- Recommendations must genuinely serve the operator audience
- If an affiliate product brand receives negative sentiment in our intelligence data, it is removed
- A transparency page at `/about/recommendations` explains the model fully

**Target affiliate networks:** ShareASale, Impact.com, CJ Affiliate, Amazon Associates (professional tools), brand-direct programs

**Revenue estimate:** At 10,000 monthly page views with 2% click-through and 5% conversion at average 8% commission on professional products: approximately **$2,000–$5,000/month in the first 6 months**, scaling linearly with traffic.

---

### Stream 1: Embedded Poll Sponsorship (Month 2–3)

**$1,000–$5,000 per placement.** Brands sponsor embedded polls in the intelligence feed. The poll data belongs to SOCELLE. The brand gets brand visibility and aggregated results. This is the earliest brand-direct monetization that does not require a data delivery infrastructure — just an audience and a poll.

Existing coverage in the source documents is correct and complete. Activation timeline: Month 2–3 after launch, once poll engagement data demonstrates scale to brand partners.

---

### Stream 2: Brand Intelligence Reports (Month 3–4)

**$500–$5,000 per report.** Custom research intelligence delivered to brands: operator sentiment analysis, category penetration by metro, competitive positioning, adoption rate trends, panel survey data specific to the brand's category. This is the primary B2B revenue engine from Month 3 onward.

Existing coverage in the source documents is correct and complete. Activation timeline: Month 3–4, after sufficient Explore Profile data density creates credible segmentation.

---

### Stream 3: Sponsored Quizzes and Studies (Month 4–6)

**$5,000–$25,000 per study.** Brand-funded professional research panels. The brand sponsors a quiz that collects verified, segmented data from licensed professionals in their target specialty and geography. SOCELLE delivers a research report. The professional who participates earns rewards. This is the highest-value single-transaction revenue stream.

Existing coverage in the source documents is correct and complete. Activation timeline: Month 4–6, requiring a professional audience of sufficient scale for credible panel composition.

---

### Stream 4: Brand Claim Subscriptions (Month 4–6)

**$199–$999/month per brand. Recurring SaaS MRR.**

This is the Yelp/TripAdvisor model adapted for B2B professional beauty. Public brand intelligence pages exist whether or not the brand participates. Brands can claim their page to control and enhance it. The unclaimed page is the top-of-funnel that costs SOCELLE nothing to create and generates inbound brand leads indefinitely.

| Tier | Price | Includes | Target Brands |
|---|---|---|---|
| Free (Unclaimed) | $0 | Auto-generated profile from public data. Brand has no control. Operator reviews and intelligence visible. | All 500+ brands at launch |
| Claimed (Basic) | $199/mo | Verified badge. Edit brand description, logo, contact info. Add official news. View page analytics. Respond to operator feedback. | Emerging brands |
| Claimed (Pro) | $499/mo | Everything in Basic + upload education content, feature product launches, access operator demographics who viewed page, priority placement in category pages. | Mid-size brands |
| Claimed (Enterprise) | $999/mo | Everything in Pro + API access to intelligence data, custom survey sponsorship credits, co-branded reports, dedicated account support, commerce-ready product catalog. | Major brands |

**The natural progression:** Brand discovers its page via Google → sees operator sentiment and competitive positioning → wants to control the narrative → claims the page → discovers the intelligence tools → upgrades for data access → eventually opens a commerce channel.

The unclaimed page creates this progression passively, at zero cost to SOCELLE.

---

### Stream 5: Premium Operator Subscriptions (Month 6+)

**$49–$149/month per operator. Recurring SaaS MRR.**

Gated intelligence features for operators who need deeper benchmarking, advanced protocol intelligence, and multi-location analytics. The free tier of the intelligence portal is valuable enough to attract operators. The premium tier is valuable enough to retain and monetize them.

Activation timeline: Month 6+, after free tier engagement patterns are established and premium feature scope is validated against operator behavior data.

---

### Revenue Model Summary

| Stream | Activation | Price Range | Type | Status |
|---|---|---|---|---|
| 0: Premium affiliate commerce | Day 1 | $2K–$10K/mo aggregate | Transactional | NEW — launch-day |
| 1: Embedded poll sponsorship | Month 2–3 | $1K–$5K per placement | Campaign | Covered in existing docs |
| 2: Brand intelligence reports | Month 3–4 | $500–$5K per report | One-time | Covered in existing docs |
| 3: Sponsored quizzes/studies | Month 4–6 | $5K–$25K per study | Campaign | Covered in existing docs |
| 4: Brand claim subscriptions | Month 4–6 | $199–$999/mo | SaaS MRR | NEW — add to all docs |
| 5: Premium operator subscriptions | Month 6+ | $49–$149/mo | SaaS MRR | NEW — spec in progress |

---

## Four Audience Types and Their Attract Paths

| Audience | Attracted By | Entry Point |
|---|---|---|
| Spa directors | Benchmarking data, category intelligence, competitive signals, events calendar | Google search for "spa pricing benchmarks [city]" → benchmarking page → profile signup |
| Medspa owners | Procedure pricing data, trend intelligence, device/brand comparisons, compliance updates | Google search for "medspa Botox pricing [state]" → pricing intelligence page → profile signup |
| Service providers | Personalized feed, polls, quizzes, CE credits, product rewards, professional recognition | Shared poll link from colleague → feed → profile signup for personalized experience |
| Brands | Public brand profile page (SEO), operator decision-making data, competitor visibility, panel access | Google search for "[brand name] professional reviews" → brand profile page → claim CTA |

---

## Build Sequence and Sprint Plan

Wave 1 ships in 12–14 weeks across six sprints. The automation infrastructure runs in parallel with the sprint build — pipeline jobs are configured before Sprint 1 is complete.

| Sprint | Weeks | Deliverables |
|---|---|---|
| Sprint 1 | 1–2 | Homepage rewrite, navigation restructure, Explore Profile onboarding flow, new Supabase tables (`brand_profiles`, `brand_claims`, `brand_reviews`, `brand_page_analytics`, `affiliate_products`, `affiliate_placements`, `affiliate_clicks`), events table expansion |
| Sprint 2 | 3–4 | Feed engine (RSS aggregation + poll embedding), brand profile page template + auto-generation pipeline, Brevo CRM integration, affiliate placement framework |
| Sprint 3 | 5–6 | First 5 quizzes live, 20 embedded polls, professional profile pages, events calendar with extraction pipeline, education content index |
| Sprint 4 | 7–8 | Quiz results visualization pages, first 10 brand claim CTAs active, daily briefing email, affiliate placements live on feed and brand pages |
| Sprint 5 | 9–10 | For Buyers page, For Brands page, For Medspas page, For Salons page, About page, affiliate placements on education and event pages |
| Sprint 6 | 11–14 | Polish, technical SEO complete, OG images, analytics integration, Google Search Console auto-submission, soft launch, invite first 500 professionals |

---

## What Is NOT in Wave 1

The following items are valuable but are deferred to post-launch waves. They do not block Wave 1.

| Deferred Item | Return Point |
|---|---|
| Full marketplace activation (brand storefronts, wholesale catalog, cart, checkout) | Wave 2 — after 5,000–10,000 professionals with Explore Profiles |
| Premium operator subscriptions (Stream 5) full feature build | Month 6+ — after free tier engagement patterns are established |
| Brand portal commerce integration (ordering, invoicing, fulfillment) | Wave 2 — after brand claim subscriptions validate the brand funnel |
| Native mobile app | After proven engagement patterns. PWA or React Native — database does not change |
| Socelle Academy (standalone learning product) | Education is inside the intelligence portal first |
| Vertical landing pages beyond /for-medspas and /for-salons | After first operator cohort data drives vertical prioritization |
| AI-powered business insights (personalized LLM-generated recommendations) | Wave 3 — after sufficient behavioral data |
| Job board and career tools | Wave 3 |

---

## Document Authority

This document supersedes Wave 1 sections in:
- `SOCELLE_FULL_BUILD_ALL_WAVES_v6.md`
- `Socelle_Pro_Working_Channel_Roadmap.md`

It does not supersede:
- The competitive analysis sections in any document (still accurate, no update required)
- The auth roles and schema architecture (correct, no update required)
- The "Why intelligence-first" and "Why web-first" reasoning (preserved verbatim)
- The Beauty Intelligence Data Architecture document (referenced, not modified)
- The Enterprise Hardening Appendix (referenced, not modified)

Source update: `socelle_platform_model_update.docx` — March 2026
