# SOCELLE PRO — WORKING CHANNEL ROADMAP (Updated)

**Updated:** March 2026
**Supersedes:** `Socelle_Pro_Working_Channel_Roadmap.md` (Downloads)
**Key changes in this version:**
- Revenue model expanded to 6 streams (affiliate commerce as Stream 0, brand claim subscriptions as Stream 4, premium operator subscriptions as Stream 5)
- Brand portal description updated to reflect dual-path brand entry (inquiry + claim flow)
- All instances of "intelligence hub" replaced with "intelligence portal"
- Automation architecture added per `socelle_platform_model_update.docx`

---

## THE STRATEGIC SHIFT

We are pausing the SOCELLE marketplace app build (React/Vite/Supabase B2B wholesale platform) and launching SOCELLE PRO as a web-first intelligence portal.

**Why:**

The existing SOCELLE codebase is a B2B wholesale marketplace — brand storefronts, product catalogs, tiered wholesale pricing, cart/checkout, reseller portals. It solves a real problem (fragmented beauty wholesale), but it has a cold-start problem: you need brands AND resellers on the platform simultaneously for either side to get value. That's a classic two-sided marketplace chicken-and-egg, and it's the #1 killer of marketplace startups.

SOCELLE PRO solves the cold-start problem by building the audience first through intelligence and data — then activating that audience for commerce later.

**The logic:**

1. **Wave 1 (NOW):** Launch a professional beauty intelligence portal. Personalized feed, industry surveys/quizzes, professional profiles, events calendar, public brand intelligence pages, and contextual affiliate commerce. Professionals join because the content and tools are valuable on day one — no brand partnerships required.

2. **Wave 2 (LATER):** Once we have 5,000–10,000 professionals with Explore Profiles (specialty, location, experience, brand preferences), we activate the existing SOCELLE marketplace codebase. Professionals who indicated brand preferences in quizzes become qualified wholesale buyers. Brands who purchased intelligence reports become marketplace sellers. The data layer feeds the commerce layer.

**Why intelligence-first, not community-first:**

Every competitor in professional beauty is a community play. BehindTheChair.com is the world's largest hairstylist community. PBA has 100,000+ members. ISPA has 3,000+ member organizations. Live Love Spa runs 22+ annual events with 2,000+ five-star reviews. Modern Salon has been publishing for 101 years.

We cannot out-community organizations with decades of trust and hundreds of thousands of members.

But NONE of them are technology companies. None of them have:
- A personalized feed engine
- Professional surveys that compensate participants
- Brand-funded research panels
- Business benchmarking data
- A verified professional identity layer
- AI-powered intelligence tools
- Auto-generated brand profile pages indexed for professional search queries

They are media companies, associations, and event companies running on editorial calendars, membership dues, and expo floor revenue. We are building an intelligence and technology platform. That's a fundamentally different business that creates a fundamentally different moat.

Community happens as a byproduct when 10,000 professionals show up every day because the intelligence tools are that good. We don't need to sell belonging — we sell value.

**Why we're pausing the app (mobile) build:**

- Web-first means SEO works (quiz results pages get indexed, articles rank, brand profile pages rank for "[brand name] professional reviews," industry reports drive organic traffic)
- Web-first means no App Store approval delays
- Web-first means instant updates, no version fragmentation
- Web-first means email/SMS as the engagement engine (not push notifications)
- Web-first means lower build cost and faster iteration
- The existing React/Vite codebase already runs as a web app
- Mobile comes later as a PWA or native wrapper once we have proven engagement patterns

---

## WHAT EXISTS TODAY (Current Codebase)

The SOCELLE codebase is a fully architected React 18 + TypeScript web application with Supabase backend. Here's what's built:

### Infrastructure (KEEP ALL OF THIS)

| Component | Status | Wave 1 Action |
|---|---|---|
| React 18 + TypeScript + Vite 5.4 | Built | Keep — this is our framework |
| TailwindCSS with custom design tokens | Built | Keep — refine color palette for intelligence brand |
| Supabase project (auth, database, RLS) | Live | Keep — add new tables for quizzes/polls/feed/brand profiles/affiliate |
| Auth system (email/password, sessions, roles) | Built | Keep — extend with 'professional' role |
| UI component library (Button, Input, Modal, Badge, Card, Table, Tabs, Skeleton, Avatar, EmptyState, StatCard) | Built | Keep — these are production-ready |
| React Router v7 routing | Built | Keep — rewrite route structure |
| Playfair Display + Inter fonts | Built | Keep |
| Environment config (.env) | Built | Keep |

### Pages That STAY (Rewritten for Intelligence Positioning)

| Page | Current State | Wave 1 Action |
|---|---|---|
| Homepage (`/`) | Built but has marketplace copy | REWRITE — intelligence portal hero, value props, social proof |
| Privacy (`/privacy`) | Built | Keep as-is, review for data collection compliance |
| Terms (`/terms`) | Built | Keep as-is, update for survey/data terms |
| Forgot Password | Built | Keep |
| Reset Password | Built | Keep |

### Pages That GET PAUSED (Marketplace Features)

| Page | Current State | Why Paused |
|---|---|---|
| Brand Storefront (`/brands/:slug`) | Built (~1300 lines) as marketplace page | Replaced by intelligence-first brand profile page; marketplace storefront reactivates in Wave 2 |
| Pricing page (`/pricing`) | Built (3-tier) | Subscription model comes after free launch proves value |
| Brand Orders (`/brand/orders`) | Built | Wave 2 |
| Brand Products (`/brand/products`) | Built with tiered pricing | Wave 2 |
| Brand Messages (`/brand/messages`) | Built | Wave 2 |
| Brand Storefront preview (`/brand/storefront`) | Built | Wave 2 |
| Reseller Dashboard (`/portal/dashboard`) | Built | Wave 2 — becomes the bridge from intelligence user to wholesale buyer |
| Reseller Orders (`/portal/orders`) | Built | Wave 2 |
| Reseller Brand Detail (`/portal/brands/:slug`) | Built | Wave 2 |
| CartDrawer component | Built | Wave 2 |

### Database Tables That STAY

| Table | Wave 1 Use |
|---|---|
| `user_profiles` | Core — extend with professional fields (specialty, experience, interests) |
| `brands` | Keep structure — extended by `brand_profiles` for public intelligence pages |
| `businesses` | Keep structure — maps to salon/spa business profiles |

### Database Tables That GET PAUSED

| Table | Why |
|---|---|
| `pro_products` / `retail_products` | Commerce — Wave 2 |
| `product_pricing` | Commerce — Wave 2 |
| `orders` / `order_items` | Commerce — Wave 2 |
| `conversations` / `messages` / `message_read_status` | Messaging — Wave 2 |

### NEW Database Tables for Wave 1

| Table | Purpose |
|---|---|
| `explore_profiles` | Professional identity — specialty, experience, interests, client volume, licensing (FK → user_profiles) |
| `quizzes` | Quiz metadata — title, slug, status, reward type, close date, brand_sponsor_id |
| `quiz_questions` | Questions — text, type (multiple_choice/scale/open/ranking), options JSON, sort_order |
| `quiz_responses` | Individual answers — FK → quiz_questions, FK → user_profiles, response value |
| `polls` | Single-question embedded polls — text, options, active status, display_location |
| `poll_votes` | Individual votes — FK → polls, FK → user_profiles, selected option |
| `feed_items` | Aggregated content — source, title, url, summary, image, category, published_at |
| `events` | Industry events — expanded schema (see below) |
| `survey_rewards` | Reward fulfillment tracking — FK → user_profiles, FK → quizzes, reward type, status |
| `professional_badges` | Achievement/verification badges — FK → user_profiles, badge_type, earned_at |
| `brand_profiles` | Public profile page data — auto-generated, one row per brand |
| `brand_claims` | Claim requests and active brand subscriptions |
| `brand_posts` | Official news/updates posted by claimed brands |
| `brand_reviews` | Operator reviews of brands |
| `brand_page_analytics` | Page view and engagement tracking per brand |
| `affiliate_products` | Curated affiliate product catalog with network and commission data |
| `affiliate_placements` | Maps affiliate products to content surfaces (feed, brand page, event, education, etc.) |
| `affiliate_clicks` | Click and conversion tracking for affiliate placements |

**Events table expansion:** The existing `events` table is expanded with: `event_type ENUM` (conference | training | webinar | summit | tradeshow | brand_education), `organizer_name`, `organizer_url`, `registration_url`, `registration_price_range`, `ce_credits_available BOOLEAN`, `ce_credits_count INT`, `specialty_tags TEXT[]`, `brand_sponsors TEXT[]`, `venue_name`, `venue_address`, `lat NUMERIC`, `lng NUMERIC`, `is_virtual BOOLEAN`, `description TEXT`, `hero_image_url`, `source_url`, `last_verified_at`, `auto_extracted BOOLEAN`.

---

## WAVE 1 PAGES TO BUILD

| Page | Route | Purpose | Priority |
|---|---|---|---|
| **Homepage** | `/` | Intelligence portal hero, value props, audience CTAs | P0 — Launch |
| **Feed** | `/feed` | Personalized industry news, embedded polls, article links | P0 — Core product |
| **Quiz Hub** | `/quizzes` | Active quizzes, completed results, reward status | P0 — Revenue engine |
| **Quiz Detail** | `/quizzes/[slug]` | Individual quiz — questions, progress, submission | P0 |
| **Quiz Results** | `/quizzes/[slug]/results` | Published data visualizations from completed quizzes | P0 — SEO + content engine |
| **For Professionals** | `/professionals` | Audience page — why join, rewards, how it works | P0 — Conversion |
| **For Brands** | `/for-brands` | B2B page — research panel access, pricing, case studies | P0 — Revenue |
| **For Salon Owners** | `/for-salons` | Audience page — benchmarking, team insights | P1 |
| **For Medspas** | `/for-medspas` | Audience page — compliance intelligence, device trends, pricing benchmarks | P1 |
| **Events Calendar** | `/events` | Aggregated industry events filtered by specialty/location | P1 — SEO + utility |
| **Event Detail** | `/events/[slug]` | Individual event — dates, CE credits, registration, affiliate block | P1 — SEO |
| **Brand Intelligence Pages** | `/brands/[slug]` | Auto-generated brand profile — operator sentiment, product data, trend signals, claim CTA | P0 — SEO surface |
| **Professional Profile** | `/pro/[username]` | Public profile — specialty, badges, stats, quiz history | P1 — Community credibility |
| **Profile Settings** | `/settings` | Edit Explore Profile, notification preferences | P1 |
| **About** | `/about` | Mission, principles, team | P1 |
| **Join / Onboarding** | `/join` | Explore Profile creation (5-step: role → specialty → interests → experience → location) | P0 |
| **Article Detail** | `/insights/[slug]` | Full article pages (written from quiz data) | P1 — SEO |
| **Request Access** | `/request-access` | Dual-path conversion page (operator or brand) | P0 |
| **Privacy** | `/privacy` | Already built — update | P0 |
| **Terms** | `/terms` | Already built — update | P0 |

---

## THE INTELLIGENCE PORTAL

### What we say we are:
**"The intelligence portal for professional beauty."**

### What that means in practice:
- Every quiz generates data that no competitor has
- Every poll is a real-time pulse check on the industry
- Every article is written FROM our proprietary survey data (not editorial opinion)
- Every professional profile is a verified data identity that earns rewards
- Every events listing reduces friction for professional development
- Every brand profile page surfaces real operator intelligence — reviews, adoption data, competitive signals
- Every daily briefing email is personalized by specialty and interests
- Every affiliate recommendation is editorially curated and contextually placed

### What we DON'T say we are:
- Not a community (community is the byproduct, not the product)
- Not a social network (no follower counts, no likes, no content creator dynamics)
- Not a marketplace (that's Wave 2)
- Not a booking platform (never)
- Not a media company (we don't publish editorial opinion — we publish data)

### The brand pitch (intelligence-first):
> "BehindTheChair can give you a sponsored article. Modern Salon can give you a webinar. ISPA can give you an expo booth. PBA can give you a monthly check-in survey. Nobody can give you verified, segmented survey data from 10,000+ licensed professionals — with a 30–60% response rate — delivered in 2 weeks instead of 6 months. We can."

### The professional pitch (intelligence-first):
> "Trade publications write about you. Research firms survey your clients. Brands market at you. We built the first portal where your professional expertise drives the data, earns you real rewards, and shapes the industry reports everyone else cites."

---

## THE BRAND PORTAL

### Entry Paths

The brand portal serves two distinct brand entry journeys that converge in the same brand dashboard:

**Path 1: Brand Inquiry (existing flow)**
A brand that has heard of SOCELLE directly — through sales outreach, word of mouth, or the `/for-brands` page — completes the Brand Apply form (`/brand/apply`). This is the brand-initiated inquiry flow, leading to review and onboarding by the SOCELLE team. Brand Apply is a commercial relationship inquiry, not a self-serve flow.

**Path 2: Brand Claim (new — Wave 1 launch)**
A brand representative discovers SOCELLE by finding their auto-generated public brand intelligence page through a Google search for "[brand name] professional reviews" or similar. They see operator sentiment, adoption data, competitive positioning, and a "Claim This Page" CTA. They click the CTA, select a subscription plan tier (Basic at $199/mo, Pro at $499/mo, or Enterprise at $999/mo), and immediately begin managing their brand profile.

**Dual path: brands can also discover their auto-generated public profile page and claim it directly. The inquiry flow and the claim flow are parallel entry points that converge in the brand dashboard.**

The Brand Apply inquiry flow is the relationship-led path for brands seeking a full commercial presence. The brand claim flow is the self-serve path for brands who want to control and enhance their intelligence profile. Both paths ultimately lead to the brand dashboard and, in Wave 2, to the full commerce portal. The unclaimed brand profile page is the permanent passive top-of-funnel for the claim path — it costs SOCELLE nothing to create and generates inbound brand leads continuously.

### Brand Claim Subscription Tiers

| Tier | Price | Includes |
|---|---|---|
| Free (Unclaimed) | $0 | Auto-generated profile from public data. No brand control. |
| Claimed (Basic) | $199/mo | Verified badge, editable description and logo, official news, page analytics, operator feedback response |
| Claimed (Pro) | $499/mo | Basic + education content upload, product launch features, operator demographic data, priority category placement |
| Claimed (Enterprise) | $999/mo | Pro + API access to intelligence data, survey sponsorship credits, co-branded reports, dedicated account support, commerce-ready product catalog |

### Brand Journey (Claim Path)

Discovers unclaimed profile page via Google → Views operator sentiment and competitive positioning → Clicks "Claim This Page" → Selects plan tier → Enhances profile with official content → Discovers intelligence tools and benchmarking data → Sponsors a survey panel → Opens commerce channel in Wave 2.

---

## THE CHANNEL ROADMAP

### Operator Channel

**Target:** Spa directors, medspa owners, salon operators, independent estheticians
**Attract via:** Brand profile pages (SEO), benchmarking data, events calendar, personalized feed
**Retain via:** Daily briefing email, weekly events digest, benchmark alerts, new polls and quizzes 2–3x/week
**Monetize via:** Stream 0 (affiliate clicks), Stream 3 (quiz participation enables brand research revenue), Stream 5 (premium subscriptions, Month 6+)

**Onboarding sequence:**
1. Discover via Google (brand profile page, benchmarking page, or event page)
2. See intelligence value — operator sentiment, trend data, pricing benchmarks
3. Click "Get Early Access" or "Join Free" CTA
4. Complete Explore Profile (5 steps: role, specialty, interests, experience, location)
5. Receive personalized daily briefing
6. Engage with polls and quizzes for rewards
7. Upgrade to premium for deeper benchmarking and benchmarking alerts (Month 6+)

### Professional/Service Provider Channel

**Target:** Licensed estheticians, colorists, nail technicians, lash artists, massage therapists
**Attract via:** Personalized feed, shared poll links, quiz reward announcements, CE credit listings
**Retain via:** Rewards system (quiz participation → product rewards), daily briefing, CE tracking, badge progression
**Monetize via:** Stream 0 (affiliate clicks), Stream 1 (poll sponsorship requires professional audience), Stream 3 (quiz panel participation enables brand research revenue)

### Brand Channel

**Attract via:** Auto-generated brand profile pages (passive, always-on) + sales outreach + `/for-brands` page
**Convert via:** "Claim This Page" CTA on unclaimed brand profiles + Brand Apply form for inquiry-led entry
**Retain via:** Profile analytics, operator demographic data, intelligence report access, platform news
**Monetize via:** Stream 1 (poll sponsorship), Stream 2 (intelligence reports), Stream 3 (sponsored quizzes), Stream 4 (claim subscriptions — $199–$999/mo MRR)

---

## THE REVENUE MODEL

SOCELLE activates six revenue streams in staggered sequence. The intelligence portal is the acquisition surface for all six streams. All six streams are compatible with Wave 1 infrastructure — activation timing is governed by audience scale and data density, not by requiring a new platform build.

### Stream 0: Premium Affiliate Commerce — Day 1

**Revenue type:** Transactional, commission-based
**Revenue estimate:** $2,000–$10,000/month at scale
**Activation:** Day 1 — no minimum audience required

Editorially curated, high-quality product and tool recommendations placed contextually alongside intelligence content. Not banner ads. Wirecutter-style placement: the right product recommendation appears naturally in the content operators are already consuming.

**Placement surfaces:**
- News feed articles — contextual recommendation block below relevant content (max 1 block per article)
- Brand profile pages — "Where professionals source this category" (max 2 blocks per page)
- Event detail pages — "Prepare for [event]" block with recommended products and tools
- Education content — "Tools used in this technique" block after technique articles or video embeds
- Benchmarking pages — "Top-performing products in this category" after pricing data
- Quiz results pages — "Based on what pros chose" block after results visualization
- Daily briefing email — single "Editor's Pick" product at the bottom

**Trust guardrails:** All affiliate content labeled "Socelle Pick." Maximum 2 placements per page. Editorial curation, never auction-based. Products removed if the brand receives negative sentiment in intelligence data. Transparency page at `/about/recommendations`.

**Affiliate networks:** ShareASale, Impact.com, CJ Affiliate, Amazon Associates (professional tools), brand-direct programs.

---

### Stream 1: Embedded Poll Sponsorship — Month 2–3

**Revenue type:** Campaign sponsorship
**Price:** $1,000–$5,000 per placement
**Activation:** Month 2–3, once poll engagement data demonstrates scale to brand partners

Brands sponsor embedded polls in the intelligence feed. The poll data belongs to SOCELLE. The brand receives brand visibility and aggregated results summary. This is the earliest brand-direct monetization that requires no data delivery infrastructure — only an engaged professional audience.

The brand pitch: "Your brand name in front of 5,000+ licensed professionals asking them about their product preferences — with verified identity and specialty data you cannot get anywhere else."

---

### Stream 2: Brand Intelligence Reports — Month 3–4

**Revenue type:** One-time research deliverable
**Price:** $500–$5,000 per report
**Activation:** Month 3–4, after sufficient Explore Profile data density creates credible segmentation

Custom intelligence reports delivered to brands: operator sentiment analysis, category penetration by metro, competitive positioning benchmarks, adoption rate trends by specialty, and panel survey data specific to the brand's category. This is the primary B2B revenue engine from Month 3 onward and the most defensible monetization surface because the data is proprietary and cannot be replicated elsewhere.

---

### Stream 3: Sponsored Quizzes and Studies — Month 4–6

**Revenue type:** Campaign research sponsorship
**Price:** $5,000–$25,000 per study
**Activation:** Month 4–6, requiring a professional audience of sufficient scale for credible panel composition

Brand-funded professional research panels. The brand sponsors a quiz that collects verified, segmented data from licensed professionals in their target specialty and geography. SOCELLE designs the study, collects responses, and delivers a research report. The professional who participates earns rewards. This is the highest-value single-transaction revenue stream.

The differentiation: "BehindTheChair can give you a sponsored article. Modern Salon can give you a webinar. ISPA can give you an expo booth. Nobody can give you verified, segmented survey data from 10,000+ licensed professionals — with a 30–60% response rate — delivered in 2 weeks instead of 6 months. We can."

---

### Stream 4: Brand Claim Subscriptions — Month 4–6

**Revenue type:** SaaS recurring (MRR)
**Price:** $199–$999/month per brand
**Activation:** Month 4–6, when sufficient brand profile page traffic validates the conversion opportunity

The Yelp/TripAdvisor model adapted for B2B professional beauty. Public brand intelligence pages exist whether or not the brand participates. Brands discover their pages through organic search, see operator sentiment and competitive intelligence, and are motivated to claim and control their profile.

The unclaimed brand profile page is a passive, always-on top-of-funnel that costs SOCELLE nothing to create and generates inbound brand leads continuously. As traffic to brand profile pages grows through organic search, the conversion rate from "discovered unclaimed page" to "brand claim subscriber" grows with it.

Subscription tiers: Basic ($199/mo), Pro ($499/mo), Enterprise ($999/mo). See Brand Portal section for full tier specifications.

---

### Stream 5: Premium Operator Subscriptions — Month 6+

**Revenue type:** SaaS recurring (MRR)
**Price:** $49–$149/month per operator
**Activation:** Month 6+, after free tier engagement patterns establish premium feature demand

Gated intelligence features for operators who need deeper benchmarking, advanced protocol intelligence, multi-location analytics, and priority access to new intelligence capabilities. The free tier is designed to be genuinely valuable enough to attract and retain operators. The premium tier is designed to be incrementally valuable enough to justify a monthly fee for operators who rely on the intelligence data for purchasing decisions.

Premium feature scope is validated against operator behavior data from Months 1–5 before Stream 5 is activated. We build what operators actually use, not what we assume they need.

---

### Revenue Model Summary

| # | Stream | When | Price | Type |
|---|---|---|---|---|
| 0 | Premium affiliate commerce | Day 1 | $2K–$10K/mo aggregate | Transactional |
| 1 | Embedded poll sponsorship | Month 2–3 | $1K–$5K per placement | Campaign |
| 2 | Brand intelligence reports | Month 3–4 | $500–$5K per report | One-time |
| 3 | Sponsored quizzes/studies | Month 4–6 | $5K–$25K per study | Campaign |
| 4 | Brand claim subscriptions | Month 4–6 | $199–$999/mo per brand | SaaS MRR |
| 5 | Premium operator subscriptions | Month 6+ | $49–$149/mo per operator | SaaS MRR |

---

## COMPETITIVE LANDSCAPE SUMMARY

We researched 6 major platforms. Here's what matters:

| Platform | What They Are | What They DON'T Have |
|---|---|---|
| **BehindTheChair.com** | Largest hairstylist community. Editorial + education + #ONESHOT Awards (2M+ entries). Brand-sponsored content. | No surveys, no data, no rewards, no multi-specialty, no personalization, hair-only |
| **Live Love Spa** | Events company + Shopify store + SpaPro membership ($0–$300/yr) + matchmaking app. 22+ events/year. | No daily content, no surveys, no data, no education, spa-only |
| **Spa Collab** | Boutique in-person events for spa directors. Education-led brand connections. | Wix site. No digital portal, no technology, no community, no data |
| **Modern Salon** | 101-year-old trade publication. Print + web + Boot Camp events + webinars + NAHA. Expanding into spa/wellness. | No surveys, no data, no personalization, no rewards, one-way media |
| **ISPA** | Trade association for spa industry. Conference + research reports + iLearn LMS + career center. 3K+ members. | Expensive ($500+), paywalled research, no daily engagement, spa-only, corporate-luxury focus |
| **PBA** | Largest beauty association (100K+ members). Advocacy + events + education + Beacon student program + Disaster Relief. $50/yr. | No daily content, no personalized intelligence, no product testing, basic "Pro Beauty Pulse" survey only |

### The gap nobody fills:
**Personalized intelligence + professional surveys with rewards + verified data identity + public brand intelligence + multi-specialty + daily engagement + technology tools.**

That's what SOCELLE PRO is.

### Key competitive insight:
PBA already launched a "Pro Beauty Pulse" — monthly check-in survey with Pivot Point International. This validates demand for professional data collection. But it's monthly, basic, and members-only. We do it daily, deep, open, and compensated. PBA is a potential partner, not a competitor — our data + their advocacy = powerful.

---

## TECH STACK DECISION

**Stay in the existing React/Vite/Supabase codebase for Wave 1.**

Rationale:
- UI component library is production-ready (57+ components, 11 UI primitives)
- Auth system works and handles roles (business_user, brand_admin, admin)
- Supabase database is live with 71 migrations
- Design tokens and fonts are configured (Playfair Display + Inter)
- Build tooling is set up and working
- Fastest path to launch
- Automation pipeline jobs run as pg-boss queue workers within existing infrastructure

What we lose vs. Next.js:
- No server-side rendering (hurts SEO on dynamic pages)
- Mitigate with: Vite SSG for quiz results and brand profile pages, pre-rendering for critical SEO surfaces, react-helmet-async meta tags for all public routes, auto-submission to Google Search Console on new page creation

When to migrate:
- If organic traffic becomes a bottleneck (after 6+ months)
- If server-side API routes become a requirement for brand portal functionality
- The database does not change — only the frontend framework

**CRM / Email Engine: Brevo (formerly Sendinblue)**
- Free tier: 100K contacts, 300 emails/day
- Email + SMS + CRM in one platform
- Custom contact attributes = Explore Profile targeting for segmented daily briefings
- Official MCP server for Claude integration (manage entire CRM through Claude conversations)
- API plugs directly into Supabase via Edge Functions or webhooks
- SMS: ~$0.011/text for survey alerts and reward notifications

---

## AUTOMATION ARCHITECTURE

90% of Wave 1 content is auto-generated from lawful public sources. Human editorial effort at steady state: **6–8 hours per week**.

| Surface | Method | Refresh | Human Touch |
|---|---|---|---|
| Brand profiles (500+) | Google Places + Yelp + website scrape + brand locator pages + social bio extraction | Monthly | Editorial review of top 50 brands quarterly. ~2 hrs/week amortized. |
| Industry news feed | RSS from 30+ publications + Reddit beauty subs + YouTube educator channels | Every 6 hours | Editorial picks for "Featured" slot (~15 min/day) |
| Events calendar | Scrape ISPA, PBA, BTC, Live Love Spa, Spa Collab, Eventbrite, brand event pages | Weekly | Verify new events, remove cancelled (~30 min/week) |
| Category intelligence | Materialized views from pipeline (mv_business_scores, mv_metro_benchmarks) | Daily/Weekly | Spot-check anomalies |
| Trend intelligence | Google Trends + social hashtags + Reddit velocity | Weekly | Review lifecycle transitions (~15 min/week) |
| Education content index | YouTube Data API + RSS + PubMed + CE catalog scrape | Daily/Weekly | Tag new content (~20 min/week) |
| Affiliate placements | Affiliate network APIs + auto-match to content categories | Weekly | Editorial curation of selections (~1 hr/week) |
| Profile enrichment | Public license databases + social bios | On signup | None — user confirms/edits |
| Polls and quizzes | LLM-assisted generation + editorial review before publish | 2–3x/week | Human reviews and approves each poll/quiz (~2 hrs/week) |
| Brand page analytics | Page view + engagement tracking | Continuous | None |

All automation jobs run as pg-boss queue workers within the same job system defined in the Enterprise Hardening Appendix (section G.2). The Beauty Intelligence Data Architecture pipeline is the shared backbone — SOCELLE adds: an events extraction module, a brand profile assembly module, an affiliate content matcher, and an RSS aggregation module as additional queue types within the existing job registry.

---

## LAUNCH TIMELINE (12–14 weeks)

| Sprint | Weeks | Deliverables |
|---|---|---|
| **Sprint 1** | 1–2 | Homepage rewrite, navigation restructure, Explore Profile onboarding flow, new Supabase tables (brand_profiles, brand_claims, brand_reviews, brand_page_analytics, affiliate_products, affiliate_placements, affiliate_clicks), events table expansion |
| **Sprint 2** | 3–4 | Feed engine (RSS aggregation + poll embedding), brand profile page template + auto-generation pipeline, Brevo integration, affiliate placement framework |
| **Sprint 3** | 5–6 | First 5 quizzes live, 20 embedded polls, professional profile pages, events calendar with extraction pipeline, education content index |
| **Sprint 4** | 7–8 | Quiz results visualization pages, first 10 brand claim CTAs active, daily briefing email live, affiliate placements active on feed and brand pages |
| **Sprint 5** | 9–10 | For Professionals, For Brands, For Medspas, For Salons, About pages, affiliate placements on education and event pages |
| **Sprint 6** | 11–14 | Polish, technical SEO complete, OG images, analytics, Search Console auto-submission, soft launch, invite first 500 professionals |

**Growth targets:**
- Week 14 (launch): 500–1,000 professionals with Explore Profiles + 500+ brand profile pages indexed
- Month 3: 5,000 professionals, first 3 brand intelligence reports sold ($7.5K–$15K), affiliate revenue $1K–$3K/mo
- Month 6: 10,000 professionals, brand claim subscriptions active, marketplace activation begins (Wave 2)
- Year 1: 50,000+ professionals, $150K–$300K revenue (intelligence reports + brand claims + affiliate + marketplace commission)

---

## THE BRIDGE BETWEEN WAVES

The Explore Profile is the dual-purpose key:

| Explore Profile Data | Wave 1 Use (Intelligence) | Wave 2 Use (Commerce) |
|---|---|---|
| Specialty (colorist, esthetician, etc.) | Quiz targeting, feed personalization | Product recommendations, brand matching |
| Location (city, state) | Regional benchmarking, event suggestions | Wholesale territory mapping, shipping |
| Experience level | Segment survey panels | Tier qualification (Active/Elite/Master) |
| Brand preferences | Brand-funded study targeting | Wholesale buyer qualification |
| License info | Panel verification | Reseller verification |
| Business type (suite, salon, medspa) | Business benchmarking | Business account creation |
| Client volume | Intelligence segmentation | Order volume projection |

Every professional who joins Wave 1 for intelligence is a pre-qualified prospect for Wave 2 commerce. The data they gave us to participate in surveys IS the data that qualifies them as wholesale buyers. No re-onboarding. One profile, two platforms, zero friction.

---

## RETENTION ARCHITECTURE

The intelligence portal must give every audience type a reason to return at least weekly:

| Retention Mechanism | Frequency | Audience |
|---|---|---|
| Daily briefing email | Daily | All professionals and operators |
| New polls and quizzes | 2–3x per week | All |
| Brand profile freshness (new reviews, updated trend data) | Weekly | Brands + Operators |
| Event calendar updates | Weekly | All |
| Benchmarking alerts (when data changes significantly) | When triggered | Operators |
| Trend alerts | Weekly | All |
| Profile completeness nudges | Until 100% | Providers |
| Rewards and product fulfillment | After each study | Providers |
| Curated affiliate recommendations refresh | Bi-weekly | Providers + Owners |

---

## DECISION LOG

| Decision | Rationale | Reversible? |
|---|---|---|
| Pause marketplace build | Cold-start problem; build audience first through intelligence | Yes — codebase is preserved |
| Web-first, not mobile-first | SEO, speed, email/SMS engagement, lower cost | Yes — PWA or native later |
| Intelligence portal positioning, not community | Can't out-community 100-year-old orgs; CAN out-tech them | Partially — brand positioning sets |
| Stay in React/Vite (not Next.js) | Speed to launch; reuse existing components and auth | Yes — migrate frontend later, DB stays |
| Brevo for CRM/email/SMS | 100K free contacts, Claude MCP integration, all-in-one | Yes — data exports easily |
| Supabase stays as backend | 71 migrations live, auth works, RLS configured | Expensive to reverse but unlikely needed |
| Professional profiles from day 1 | Verified panel credibility for brand sales | N/A — core feature |
| Events calendar from day 1 | High-value utility, low build cost, strong SEO | N/A — content feature |
| Auto-generated brand profile pages at launch (500+) | Massive SEO surface + passive brand acquisition funnel at zero marginal cost | N/A — core feature |
| Affiliate commerce from day 1 | Zero-scale revenue that operates independently of brand partnerships or user count | Yes — affiliate products can be swapped |
| Brand claim subscriptions (Stream 4) | Yelp/TripAdvisor model converts passive SEO traffic into SaaS MRR | N/A — depends on brand profile pages |
| PBA as partner target, not competitor | Their advocacy + our data = industry power | Strategic choice |

---

*Updated: March 2026*
*Status: Wave 1 build active — 25 initial work orders complete, automation pipeline architecture in progress*
*Codebase: React 18 + TypeScript + Vite 5.4 + Supabase (71 migrations, 8 edge functions)*
*CRM: Brevo (integration pending)*
*Source update: `socelle_platform_model_update.docx` — March 2026*
