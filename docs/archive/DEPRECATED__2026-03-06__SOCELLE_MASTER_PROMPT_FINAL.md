> **DEPRECATED — 2026-03-06**
> This file is no longer authoritative. Replaced by:
> - `/.claude/CLAUDE.md` + `docs/command/AGENT_SCOPE_REGISTRY.md`
>
> Do not reference this file as authority. See `/.claude/CLAUDE.md` §B FAIL 1.

---

# MASTER SESSION PROMPT — SOCELLE BEAUTY PLATFORM
# Paste this at the start of every Claude Code / Cowork build session
# Last updated: 2026-03-05 (Wave 9 complete — see amendment block below)
# Source of truth: CLAUDE.md (root) + MASTER_STATUS.md (root) + /docs/build_tracker.md
# Launch gate: Do not make the site live until the product owner explicitly says "make it live."

# =============================================================================
# ⚠️  WAVE 9 AMENDMENT — MARCH 5, 2026 — READ THIS BEFORE THE REST OF THIS FILE
# =============================================================================
#
# Waves 1–9 (March 3–5, 2026) overhauled the public-facing platform.
# Several sections of this document are now SUPERSEDED. Overrides listed below.
#
# 1. DESIGN SYSTEM — SUPERSEDED
#    The pro-* token system (pro-charcoal, pro-ivory, pro-gold, etc.) used
#    throughout this document is NOW BANNED on all public pages.
#    Replacement: Pearl Mineral V2 (see CLAUDE.md → LOCKED DESIGN SYSTEM).
#    Key tokens:
#      graphite:    #141418   (NOT #1E252B, NOT #0A0A0C)
#      mn-bg:       #F6F3EF   (NOT #F6F4F1)
#      accent:      #6E879B
#    pro-* tokens remain in portal code (/portal/*, /brand/*, /admin/*) only.
#
# 2. TYPOGRAPHY — SUPERSEDED
#    Primary font is General Sans (Fontshare CDN) on ALL public pages.
#    DM Serif Display, Playfair Display are BANNED.
#    font-serif Tailwind class is BANNED on src/pages/public/*.
#    Mono (JetBrains Mono / Geist Mono) for data values only.
#
# 3. PRODUCT THESIS — UPDATED
#    Intelligence-first platform. Intelligence Hub is the product hook.
#    Marketplace is the transaction layer beneath it.
#    Every page, component, and copy decision reinforces this.
#
# 4. NAVIGATION — SUPERSEDED
#    Current required nav links (8):
#    Intelligence | Brands | Education | Events | Jobs | For Buyers | For Brands | Pricing
#    Auth-aware right pill: admin→/admin, business_user→/portal/dashboard,
#    brand_admin→/brand/dashboard, guest→Sign In + Request Access
#
# 5. CONVERSION FUNNEL — UPDATED
#    RequestAccess.tsx form is now wired to access_requests Supabase table (fixed W9-01).
#
# 6. NEW PAGES (Wave 9)
#    /events       → Events.tsx (stub, 8 mock events — needs Supabase events table)
#    /jobs         → Jobs.tsx (stub, 12 mock jobs — needs job_postings live)
#    /jobs/:slug   → JobDetail.tsx
#    /admin/market-signals → AdminMarketSignals.tsx (new admin tool)
#
# 7. LIVE DATA INFRASTRUCTURE (Wave 9)
#    market_signals table live in Supabase (10 seed signals).
#    useIntelligence.ts V2 fetches from DB → mock fallback → isLive flag.
#    Intelligence.tsx shows PREVIEW banner when not live.
#
# 8. BUILD STATE (March 5, 2026)
#    npx tsc --noEmit: ✅ 0 errors
#    npm run build:   ✅ passing
#    Migrations:      70 total (ADD ONLY — never modify existing)
#    Edge functions:  7 deployed
#
# 9. CURRENT PRIORITIES (Wave 10)
#    See /docs/build_tracker.md → WAVE 10 section for full list.
#    Immediate P0: ForgotPassword/ResetPassword pro-* token fix,
#    Home market pulse DEMO label, Events/Jobs Supabase tables.
#
# 10. PROTECTED SYSTEMS — DO NOT MODIFY WITHOUT EXPLICIT WO SCOPE
#     /portal/* (22 routes), /brand/* (25 routes), /admin/* (21 routes)
#     Commerce flow (cart, orders, checkout)
#     Auth system (ProtectedRoute, AuthProvider)
#     Supabase migrations (ADD ONLY)
#
# Full current-state audit: MASTER_STATUS.md (repo root)
# Full design spec: CLAUDE.md (repo root)
# Full build history: /docs/build_tracker.md
# =============================================================================

---

## CURRENT MODE: AUTONOMOUS CORE INTELLIGENCE (Payment Bypass)

**Paywall is open.** Do not implement or block on Stripe, RevenueCat, or the subscriptions table. All users are treated as PRO (mock premium). Your job is to **perfect the Master Brain and Identity Bridge** — not to build payment flows.

- **Read first:** `/docs/SOCELLE_MASTER_PROMPT_FINAL.md` (this file) then `/docs/build_tracker.md` for current build state.
- **Also read when relevant:** `/docs/SOCELLE_Master_Strategy_Build_Directive.md` (AUTONOMOUS CORE INTELLIGENCE MODE).
- **Focus:** Master Brain (ai-orchestrator, 4-tier, no frontend AI), No-Leakage Banker (deduct_credits), Identity Bridge (firebase_uid_map), UI refinement (gold button, PlanWizard race, 2026 mobile-web).
- **Postpone:** All Tier 1 Payment tasks (Stripe checkout, Stripe Connect, subscription implementation). Mark them [POSTPONED] in the tracker.
- **Bypass:** `PAYMENT_BYPASS` in `src/lib/paymentBypass.ts` (default true). Set `VITE_PAYMENT_BYPASS=false` to restore guards when payments are unblocked.

---

## SECTION 1 — WHO YOU ARE & WHAT WE'RE BUILDING

You are the lead engineer on this project. You think like a senior full-stack
developer who has shipped marketplace products before. You don't just write code —
you think about business logic, user experience, failure modes, and scalability
before touching a file.

We are building **SOCELLE** — a vertically focused B2B beauty marketplace.
Think Faire, but built exclusively for professional beauty brands and the
licensed salons, spas, and medspas that carry and resell their products.

### Why This Exists (Our Wedge)

The professional beauty supply chain is broken:
- Brands rely on reps doing in-person visits and taking phone/text orders
- Reordering is manual — salons run out of product and lose retail revenue
- Education is fragmented — brands host scattered trainings with no tracking
- Marketing support is nonexistent — salons get product but no tools to sell it

SOCELLE fixes this by combining **wholesale commerce + education + marketing tools**
in one platform purpose-built for professional beauty. No other platform does all
three for this vertical.

### Who We're Beating and How

| Competitor | What they do | Our advantage |
|---|---|---|
| Faire | General wholesale marketplace | We're beauty-specific with education, protocols, and marketing tools built in |
| Boulevard/Vagaro | Salon booking software | They don't do wholesale or brand relationships |
| Brand-owned portals | Individual brand ordering sites | We aggregate — one cart, many brands, one login |
| Beauty reps | In-person ordering | We digitize the rep relationship, not replace it |

**Every feature decision must pass this test:** Does this strengthen the brand-reseller
relationship in a way that's specific to professional beauty? If it could exist on a
generic marketplace, it's not differentiated enough.

---

## SECTION 2 — COLD START STRATEGY: PLATFORM-SEEDED SUPPLY & DEMAND

A two-sided marketplace has a cold-start problem: resellers won't join without
brands, brands won't join without resellers. **We solve this by seeding BOTH sides
ourselves from publicly available data.**

### The Big Picture

```
┌─────────────────────────────────────────────────────────────────────────┐
│  SUPPLY SIDE (Brands)                  DEMAND SIDE (Businesses)        │
│                                                                         │
│  Platform admin seeds brand pages      Platform admin seeds business    │
│  from brand websites + social media    listings from Google + Yelp      │
│         │                                        │                      │
│         ▼                                        ▼                      │
│  Resellers browse brands and           Brands browse potential          │
│  "Express Interest"                    resellers by location/type       │
│         │                                        │                      │
│         ▼                                        ▼                      │
│  Brands see demand building →          Businesses see brands want       │
│  claim their page                      them → claim their listing       │
│         │                                        │                      │
│         ▼                                        ▼                      │
│  VERIFIED brand with full              VERIFIED business with full      │
│  commerce unlocked                     ordering unlocked                │
│         │                                        │                      │
│         ▼ (optional)                             │                      │
│  PREMIER — platform manages                      │                      │
│  everything for the brand                        │                      │
│         │                                        │                      │
│         └──────────── CONNECTED ─────────────────┘                      │
│                  Orders flowing                                          │
│                  Education happening                                     │
│                  Marketing running                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

**The result:** When a brand claims their page, they already see a map full of
potential resellers in their target markets. When a reseller claims their listing,
they already see brands they can apply to carry. Nobody arrives to an empty platform.

---

## SECTION 2B — PUBLIC DATA SOURCES & IMPORT TECHNOLOGY

Every brand and business page can be richly auto-populated from freely available public data.
The goal: unverified pages feel 70-80% as rich as verified pages — compelling enough that
resellers express interest and brands feel urgency to claim.

### SUPPLY SIDE — Brand Page Data Sources

**FREE (Phase 1 — build now):**

| Source | Data | Extraction Method | Cost |
|---|---|---|---|
| Shopify `/products.json` | Product names, descriptions, images, variants, categories, SKU count, retail pricing | Direct HTTP GET — paginate `?page=X&limit=250` | Free |
| Brand `/about` page | Brand story, founding year, mission, team | Firecrawl `/scrape` → Markdown → LLM summarizes to 2-3 paragraphs | Free (500 credits) |
| Brand `/press` or `/media` page | Self-reported press hits, "as seen in" logos, awards | Firecrawl `/scrape` → parse media mentions | Free |
| Brand `/contact` page | Public email, phone, HQ city/state | Firecrawl `/scrape` or manual | Free |
| Google News RSS | Press coverage headlines + URLs + dates | `https://news.google.com/rss/search?q="Brand+Name"+beauty` — parse XML | Free |
| PR Newswire / BusinessWire RSS | Official press releases | RSS filtered by "cosmetics and personal care" | Free |
| Cosmoprof NA exhibitor list | Trade show presence → "professional-grade" signal | Public PDF at cosmoprofnorthamerica.com | Free |
| IECSC exhibitor directory | Trade show presence → "esthetician-market" signal | Public web directory | Free |
| LinkedIn company page | Employee count, HQ, founding year, description | Manual entry (scraping LinkedIn is legally risky) | Free |
| FDA MoCRA registry | Facility registration → "FDA registered" trust badge | Manual lookup at fda.gov (no API exists) | Free |
| Instagram bio + followers | Social proof, bio, link in bio | Manual entry (~60 sec/brand) | Free |
| Brand store locator | List of businesses carrying the brand → seeds demand side | Firecrawl `/scrape` or locator API endpoint | Free |

**PAID (Phase 2 — automate at scale):**

| Source | Data | Tool | Cost |
|---|---|---|---|
| Firecrawl `/extract` | Non-Shopify product catalogs via AI schema extraction (~95% accuracy) | Growth plan | $19/mo |
| Apify Instagram | Batch follower counts + bios + engagement | Starter plan | ~$5/1K profiles |
| Apify Google Maps | Area sweeps ("all spas in Austin, TX") | Starter plan | ~$4/1K records |
| Yelp Fusion API | Second rating, interior photos, service descriptions | Subscription | $100-300/mo |
| Licensify / Mesh Verify | 50-state cosmetology license lookup | Subscription | $100-200/mo |
| GNews API | Automated press monitoring | Free tier or paid | Free–$50/mo |

### DEMAND SIDE — Business Listing Data Sources

**FREE (Phase 1):** Google Places API ($200/mo free credit covers ~5K lookups/mo),
state board manual lookup, brand store locator pages.

**PAID (Phase 2):** Apify bulk sweeps, Yelp enrichment, Licensify automated license checks.

### Phase 1 Cost Target: $0
All Phase 1 seeding uses free tools only. No paid subscriptions required until Phase 2.

---

## SECTION 3 — BRAND STATES (Unverified → Verified → Premier)

### State 1: UNVERIFIED (Platform-Seeded Brand)

**Who creates it:** Platform admin only

**Data sources (all legally public):**
- Brand's own website (about page, product catalog, team, press)
- Brand's public social media profiles (Instagram, Facebook, LinkedIn)
- Public wholesale directories and trade show listings
- Press releases, media features, industry publications
- Public SEC filings or business registrations (if applicable)

**What the platform creates:**
- Brand profile (name, logo, description, website URL, social links)
- Product listings (name, description, images from public sources, product category)
- Brand story / about section (sourced from their website)
- Estimated product count and category tags

**Auto-imported data fields (Phase 1 — free sources):**

| Field | Source | Stored In |
|---|---|---|
| Brand name, logo | Website scrape | `brands.name`, `brands.logo_url` |
| Brand description (2-3 para) | `/about` → LLM summary | `brand_seed_content` (`description`) |
| Product names + images | Shopify `/products.json` | `brand_seed_content` (`product`) |
| Category tags | Product data + admin | `brand_seed_content` (`category_tags`) |
| Social links | Website + manual | `brand_seed_content` (`social_links`) |
| Press mentions | Google News RSS | `brand_seed_content` (`press_mention`) |
| Trade show presence | Cosmoprof/IECSC PDFs | `brand_seed_content` (`trade_show`) |
| FDA registration status | FDA MoCRA (manual) | `brand_seed_content` (`fda_registration`) |
| Instagram followers | Manual entry | `brand_seed_content` (`instagram_stats`) |
| Founding year, HQ | Website + manual | `brand_seed_content` (`founding_info`) |

**Auto-imported data fields (Phase 2 — paid sources):**
- Full non-Shopify product catalog (Firecrawl `/extract`, ~95% accuracy)
- Instagram engagement metrics (Apify batch)
- Automated press monitoring (GNews API)

**What the unverified page shows to resellers:**
- Brand name, logo, description, and story
- Product catalog (view only — no pricing displayed)
- "Products by [Brand Name]" with images and descriptions
- Category tags and treatment/service associations
- Brand's website and social links
- Clear "Unverified Brand" badge — transparent that the brand hasn't joined yet
- "Express Interest" button (replaces "Apply to Carry")

**What is NOT on an unverified page:**
- No pricing of any kind (wholesale or MSRP)
- No "Add to Cart" or ordering capability
- No direct messaging to the brand
- No education content or courses
- No marketing assets for download
- No brand team members or rep contacts

**Reseller actions on unverified brand pages:**
- Browse products (no prices)
- "Express Interest" — reseller indicates they want to carry this brand
- "Notify Me When Available" — opt into alerts for when brand verifies
- Interest data stored and shown to brand during claim flow as social proof

### State 2: VERIFIED (Brand-Managed)

**How a brand gets here:**
1. Brand discovers their unverified page (platform outreach, organic search, word of mouth)
2. Clicks "Claim This Brand" → verification flow:
   a. Create account (or link existing)
   b. Prove ownership (domain verification email, DNS TXT record, or manual review)
   c. Accept platform terms of service
   d. Upload required documents (business entity, product liability insurance)
   e. Platform admin reviews and approves
3. Upon approval:
   - Brand gains full control of their page
   - All platform-seeded content becomes editable (accept, edit, or discard each piece)
   - Brand prompted to: review/update products, set pricing, configure shipping
   - All resellers who "expressed interest" are notified and can now apply

**What unlocks:** Full storefront with pricing and commerce, reseller application
management, order management, Education Hub, Marketing Studio, Brand CRM,
messaging, broadcast messaging — all standard platform features.

### State 3: PREMIER (Platform-Managed)

**What this is:** A paid concierge service where the SOCELLE platform team manages
the brand's presence on their behalf. Brand focuses on product and fulfillment —
platform handles everything else.

**How a brand gets here:**
- Must be Verified first
- Brand opts into Premier tier (monthly fee on top of standard subscription)
- Platform assigns a dedicated brand manager
- Kickoff session to define brand voice, goals, content strategy

**What the platform team manages for Premier brands:**

| Area | Platform Team Manages | Brand Approves |
|------|----------------------|----------------|
| Catalog | Listings, descriptions, photography direction, SEO, pricing recs | Final pricing, new product additions |
| Storefront | Page design, featured products, seasonal merchandising | Major design changes |
| Education | Course creation, lesson scripting, certification design | Content accuracy, certification criteria |
| Marketing | Campaigns, email/SMS, social content, co-brand templates | Campaign sends (approve before send) |
| Analytics | Monthly reports, reseller insights, growth recommendations | — (informational) |
| Reseller Mgmt | Application review recs, tier upgrade suggestions | Final approve/reject on applications |

**Premier operating model:**
- Platform team acts under `platform_brand_manager` role
- Scoped access: brand_admin-equivalent but ONLY for assigned brands
- All actions logged in audit_log with clear attribution
- Brand receives weekly digest of all changes made on their behalf
- Brand can override or revert any platform team action
- Brand always retains final approval on: pricing, reseller approvals, campaign sends, published education
- Resellers cannot tell if a brand is self-managed or Premier — no visible difference

---

## SECTION 4 — BUSINESS STATES (Unverified → Verified)

### State 1: UNVERIFIED (Platform-Seeded Business)

**Who creates it:** Platform admin only

**Data sources (all legally public):**
- Google Business Profile (name, address, phone, hours, photos, rating, reviews count, categories)
- Yelp Business listing (same + additional photos and service descriptions)
- State cosmetology board public license lookups (license number, status, expiration)
- Business's own website and social media (if available)
- Industry directories (SalonCentric, CosmoProf retail locators, brand "find a salon" pages)

**What the platform creates:**
- Business profile (name, type, address, phone, website, hours)
- Location data (city, state, zip, lat/lng for map display)
- Business type classification (salon, spa, medspa, barbershop, suite, mobile)
- Services offered (estimated from Google/Yelp categories and descriptions)
- Public photos (exterior, interior — from Google/Yelp)
- Rating and review count (sourced, not copied — "4.8 stars on Google, 127 reviews")
- Estimated size/tier (based on review volume, photo count, service range)
- License status (if found in public board lookup)

**What the unverified listing shows to brands:**
- Business name, type, location (city + state, NOT full address until verified)
- Estimated services offered and business category
- Google/Yelp rating reference (not the reviews themselves — just "4.8★ on Google")
- Public photos (exterior only — from Google Street View / Google Business)
- "Unverified Business" badge
- Interest signals from reseller (if they've also expressed interest in brands)

**What is NOT on an unverified listing:**
- No full street address (city/state only — privacy protection)
- No owner name or staff information
- No contact information exposed to brands (no email, no direct phone)
- No ordering or commerce capability
- No purchasing history or financial data
- No actual reviews copied from Google/Yelp (copyright — reference only)
- No ability for the business to be contacted directly through platform

**Brand actions on unverified business listings:**
- Browse businesses by location, type, estimated size
- "Flag as Potential Fit" — brand marks a business as a target reseller
- View on map alongside verified resellers
- See aggregate data: "47 salons in Austin, TX — 12 verified, 35 unverified"
- Cannot contact unverified businesses (incentivizes claiming)

**What this gives brands:**
- Market intelligence — see where potential resellers are concentrated
- Territory planning — reps can see salon density by zip code before visiting
- Target lists — identify specific businesses to recruit (outside the platform)
- Competitive intel — see which areas are underserved by their category

### State 2: VERIFIED (Business-Managed)

**How a business gets here:**

Path A — Organic claim (business finds their listing):
1. Business owner discovers their listing on SOCELLE
2. Clicks "Claim This Business"
3. Verification flow:
   a. Create account
   b. Prove ownership (phone verification to listed number, or manual review)
   c. Upload: state cosmetology/esthetics license, business license, resale certificate
   d. Accept platform terms of service
4. Platform admin reviews and approves
5. Business gains full control of their listing

Path B — Invited by brand/platform:
1. Brand rep or platform admin generates a personalized invite link
2. Business owner clicks link → lands on their pre-populated listing
3. Same verification flow as Path A
4. If invited by a brand, the brand-reseller application is auto-created upon verification

Path C — Direct signup (no existing listing):
1. Business signs up normally (existing onboarding flow)
2. During setup, platform checks if an unverified listing matches (name + address fuzzy match)
3. If match found: "We found a listing that might be yours — claim it?"
4. If claimed, seeded data pre-populates their profile
5. If no match: standard fresh onboarding

**Upon verification:**
- Business gains full profile control
- Seeded content becomes editable (accept, edit, or discard each piece)
- Full address now visible to approved brand partners
- Can browse verified brands and apply to carry products
- Full commerce, education, marketing tools, and messaging unlocked
- Brands who "flagged as potential fit" are notified: "[Business] just joined — invite them to carry your line"

---

## SECTION 5 — BRAND CLAIM & VERIFICATION FLOW (DETAILED)

### Platform Admin Seeds a Brand
```
1.  Admin panel → "Seed New Brand"
2.  Enter brand's website URL
3.  System auto-detects platform:
    a. Shopify → hit /products.json → import products (free, paginated)
    b. Non-Shopify → Firecrawl /scrape → extract available data
    c. Fallback → manual entry form
4.  Scrape /about → LLM generates 2-3 paragraph description
5.  Scrape /press or /media → extract "as seen in" mentions + self-reported awards
6.  Check Google News RSS for recent press mentions:
    https://news.google.com/rss/search?q="Brand+Name"+beauty
7.  Check Cosmoprof NA + IECSC exhibitor lists for trade show presence
8.  Admin manually adds: Instagram handle + follower count, social links
9.  Admin optionally checks FDA MoCRA registry (fda.gov — no API):
    - If registered: store as fda_registration badge
    - If not found: skip
10. Admin reviews all auto-extracted content in preview UI:
    - Accept, edit, or discard each piece individually
11. Admin publishes → unverified brand page goes live
12. All content stored in brand_seed_content with source URLs + source_type
```

### Building Demand Signals
```
1. Resellers discover unverified brand via browse/search
2. Click "I'm Interested in Carrying [Brand]"
3. Optionally add message ("We're a medspa in Austin...")
4. Signal stored in brand_interest_signals
5. Platform admin sees signals aggregating per brand
6. Used in outreach: "50 salons want your products"
```

### Platform Outreach to Brand
```
1. Platform sends outreach email to brand's public contact
2. Includes: interest count, page preview, "Claim your page" CTA
3. Follow-up sequence: Day 1, 7, 14, 30
4. Track status: not_contacted → contacted → follow_up_1/2 → claimed/declined
```

### Brand Claims Page
```
1. "Claim This Brand" → create account
2. Domain verification (email to @brand-domain, DNS TXT, or manual)
3. Status: 'unverified' → 'pending_claim'
4. Review seeded content (accept / edit / discard each piece)
5. Complete setup: documents, shipping, pricing
6. Platform admin reviews → 'pending_verification' → 'verified'
7. All interested resellers notified
```

---

## SECTION 6 — BUSINESS CLAIM & VERIFICATION FLOW (DETAILED)

### Platform Admin Seeds Businesses
```
1. Admin panel → "Seed Businesses" → choose method:

   Method A: Single Business
   - Enter Google Maps URL or business name + city
   - Platform pulls public data from Google Business Profile
   - Admin reviews, edits, publishes

   Method B: Area Sweep
   - Enter: city/state OR zip code OR radius around a point
   - Enter: business types to include (salon, spa, medspa, etc.)
   - Platform pulls all matching businesses from Google
   - Admin reviews batch, removes irrelevant ones, publishes

   Method C: Brand Locator Import
   - Platform scrapes a brand's "Find a Salon" or store locator page
   - Creates unverified listings for each location found
   - Tags each business with "carries [Brand]" (public knowledge)
   - Admin reviews batch and publishes

   Method D: CSV Import
   - Upload spreadsheet of business name, address, type, website
   - Platform enriches with Google/Yelp data
   - Admin reviews and publishes
```

### Building Brand-Side Signals
```
1. Brands browse unverified businesses in their target markets
2. Brand clicks "Flag as Potential Fit" on a business
3. Optionally adds internal note ("Perfect for our new medspa line")
4. Signal stored — visible to platform admin for outreach prioritization
5. When business verifies, brand is notified
```

### Platform Outreach to Businesses
```
Outreach is DIFFERENT from brand outreach — businesses are less likely to
respond to cold email. Use multiple channels:

1. Email (if public email found): invitation with platform value prop
2. Direct mail / postcard: "Your salon is listed on SOCELLE" (Phase 3+)
3. Brand rep visit: rep shows business their listing and helps them claim
4. Brand-powered invites: brands send personalized invites to their existing
   accounts (this is the highest-converting channel)

Track: not_contacted → contacted → channel_used → claimed → verified
```

### Business Claims Listing
```
1. Business finds listing (organic, invite link, or rep-assisted)
2. "Claim This Business" → create account
3. Phone verification (automated call/SMS to listed business number)
   OR manual verification by platform admin
4. Status: 'unverified' → 'pending_claim'
5. Review seeded content (accept / edit / discard)
6. Upload: cosmetology license, business license, resale certificate
7. Complete profile: full address confirmed, services, hours, team
8. Platform admin reviews → 'pending_verification' → 'verified'
9. Brands who flagged this business are notified
10. Business can immediately browse brands and apply to carry products
```

### Deduplication & Matching
```
When a business signs up directly (not claiming a listing), check for matches:

1. Fuzzy match on: business name + city + state
2. If match confidence > 80%: prompt "Is this your business?"
3. If claimed: merge seeded data into their account
4. If declined: create fresh listing, flag potential duplicate for admin review
5. Never auto-merge without user confirmation

Also deduplicate during seeding:
- Before creating an unverified listing, check if name + address already exists
- Handle chains: each location is a separate listing (they share a name but
  different addresses)
```

---

## SECTION 7 — BUSINESS MODEL & MARKETPLACE RULES

### Revenue Model
- **Platform commission:** 15% on first order from a new brand-reseller pair,
  10% on all subsequent orders
- **Brand subscriptions:** Monthly SaaS fee by tier (Starter / Growth / Enterprise)
- **Premier service fee:** Additional monthly fee for white-glove management
- **Resellers are free** — no subscription fee to browse, order, or access education

### Pricing & Tiers
- Brands set their own wholesale pricing per product
- **Tiered pricing** rewards volume buyers:
  - `msrp` — suggested retail price (reference only, never charged on platform)
  - `active` — standard wholesale (default for new resellers)
  - `elite` — better pricing for mid-volume resellers
  - `master` — best pricing for top-volume resellers
- **Brands control tier assignments** manually. Platform recommends via reseller
  health scoring but never auto-promotes.
- Tier changes take effect on next order (not retroactively)

### Order & Fulfillment Model — HOW COMMERCE ACTUALLY WORKS

**SOCELLE is NOT a fulfillment platform. We do not warehouse, ship, or handle
any physical product.** SOCELLE is a **discovery, ordering, and relationship layer**
that sits on top of brands' existing e-commerce and fulfillment systems.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   RESELLER                    SOCELLE                     BRAND        │
│                                                                         │
│   Discovers brand      →   Browse / Search / Discovery                  │
│   Applies to carry     →   Application management                       │
│   Builds cart          →   Multi-brand cart (localStorage Phase 1)      │
│   Checks out           →   Stripe checkout (payment processed)          │
│   Gets confirmation    →   Order recorded on platform                   │
│                                                                         │
│                        →   Order pushed to brand's system  →  Brand     │
│                             via integration plugin              sees    │
│                                                                 order   │
│                                                                         │
│   Gets tracking info   ←   Brand updates fulfillment      ←  Brand     │
│                             status (webhook or manual)         ships    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### How Orders Flow

1. **Reseller browses and adds to cart** — cart lives in localStorage (Phase 1),
   later server-side (Phase 2)
2. **Reseller checks out** — single Stripe checkout, even for multi-brand carts
3. **SOCELLE splits the order per brand** — each brand receives their portion
   as a separate order record
4. **SOCELLE processes payment** — Stripe PaymentIntent, commission withheld,
   remainder marked for payout to brand
5. **Order details pushed to brand's system** — via integration plugin to the
   brand's existing e-commerce platform (Shopify, WooCommerce, BigCommerce,
   custom, or manual webhook/email fallback)
6. **Brand fulfills from their own warehouse/system** — they pack and ship
   using their existing logistics
7. **Brand updates fulfillment status** — tracking number, carrier, shipped/delivered
   timestamps pushed back to SOCELLE (via plugin sync or manual entry in dashboard)
8. **Reseller sees status updates** — tracking info visible on their SOCELLE
   order dashboard + notification sent

### What SOCELLE Owns vs. What Brands Own

| SOCELLE Owns | Brand Owns |
|---------------|------------|
| Product discovery and search | Physical inventory |
| Brand-reseller matching | Warehousing and storage |
| Cart and checkout experience | Packing and shipping |
| Payment processing (Stripe) | Carrier selection and rates |
| Commission calculation and collection | Fulfillment speed and quality |
| Order records and status tracking | Returns processing (physical) |
| Reseller communication and notifications | Product quality |
| Education, marketing, CRM tools | |

### Integration Model (Brand E-Commerce Plugins)

**Phase 1 — Manual + Webhook:**
- Order details sent to brand via email notification + downloadable order CSV
- Brand manually enters tracking info on SOCELLE dashboard
- This works for MVP and founding brands who are hands-on

**Phase 2 — Shopify Integration (Priority):**
- Shopify plugin that auto-creates orders in brand's Shopify store
- Inventory sync: brand's Shopify inventory reflected on SOCELLE (prevents overselling)
- Fulfillment sync: when brand ships in Shopify, tracking auto-updates on SOCELLE
- Product catalog sync: brand's Shopify products importable to SOCELLE with one click

**Phase 3+ — Additional Integrations:**
- WooCommerce plugin
- BigCommerce plugin
- Generic REST API / webhook integration for custom platforms

### Payout Model

- SOCELLE collects full payment from reseller via Stripe
- Commission is withheld (15% first order, 10% repeat)
- Remainder paid out to brand via Stripe Connect
- **Payout timing:**
  - Phase 1: Payout triggered when brand marks order as shipped
    (incentivizes fast fulfillment)
  - Phase 2+: Evaluate automatic payout on delivery confirmation or
    after X days, whichever comes first

### Inventory — SOCELLE Does NOT Manage Inventory

- SOCELLE displays product availability based on data synced from brand's system
- If integration is active (Shopify plugin): real-time inventory sync
- If no integration: brand manually marks products as in-stock/out-of-stock
  on SOCELLE dashboard
- **SOCELLE never guarantees stock.** If a brand is out of stock at fulfillment
  time, they notify the reseller through the platform and issue a partial refund.
  SOCELLE refunds its commission on unfulfilled items.

### Shipping

- **Brands set their own shipping rates on SOCELLE:**
  - Flat rate per order
  - Free shipping over $X threshold
  - Calculated rates (Phase 3+ via carrier API integration)
- Shipping is brand-specific — a multi-brand order shows separate shipping
  per brand at checkout
- SOCELLE does NOT charge shipping. Shipping revenue goes directly to brand
  (passed through in the Stripe payout, not subject to commission)

### Minimum Orders
- Per-brand (not platform-wide). Brands set first order and reorder minimums
- **Payment:** Immediate via Stripe at checkout (Phase 1). Net-30 terms Phase 3+
- **Tax:** Resellers tax-exempt on wholesale (must upload resale certificate). Platform validates.

### Returns & Refunds
- Reseller initiates return request on SOCELLE
- Brand receives notification and approves/denies
- If approved: brand provides return shipping label or instructions
- Reseller ships product back to brand directly
- Brand confirms receipt → triggers refund
- SOCELLE refunds commission on returned items
- Reseller refund processed back through Stripe
- 14-day return window, unopened only. Damaged/defective: brand replaces at no cost.
- Disputes: platform mediates, decides if unresolved in 7 days

### Brand Vetting
- Brands apply (or claim seeded page) → platform reviews
- Requirements: active business entity, professional beauty products, minimum 5 SKUs,
  product liability insurance
- Approval within 5 business days

### Reseller Verification
- Resellers apply (or claim seeded listing) → provide: state license, business license,
  EIN, resale certificate
- Phase 1: manual review. Phase 3+: API integration with state licensing boards
- License expiration tracking — alerts at 60/30/7 days. Expired = soft lock (no purchasing,
  existing orders still fulfilled)

---

## SECTION 8 — SUCCESS METRICS

### Brand Activation
- First product listed within 48 hours of approval
- First reseller application received within 14 days
- First order within 30 days
- 80% of approved brands have 10+ SKUs live within 2 weeks

### Reseller Activation
- First order within 7 days of brand approval
- Reorder within 30 days (target: 40%+ monthly reorder rate)
- 3+ brand relationships within 90 days

### Platform Seeding Metrics
- Seeded brand → claimed conversion rate (target: 15-25%)
- Seeded business → claimed conversion rate (target: 10-20%)
- Avg interest signals before brand claims (benchmark for outreach timing)
- Avg brand flags before business claims
- Time from seed to claim (sales cycle length)
- Time from claim to first order (onboarding friction indicator)
- Brand-powered invite → business claim conversion rate (target: 30%+)

### Platform Health
- GMV growth: 20% MoM in first year
- Average order value: $350+
- Brand-reseller match rate: 70%+ of applications approved
- Education engagement: 50%+ resellers complete 1+ course within 60 days

### Retention
- Brand churn: <5% monthly
- Reseller churn: <10% monthly
- Premier upgrade rate from verified brands (target: 10-15%)

---

## SECTION 9 — ONBOARDING FLOWS

### Brand Onboarding (Direct Application — No Existing Seeded Page)
```
1. Brand applies (company info, product category, SKU count, website)
2. Platform reviews
3. Approved → brand_admin welcome email + magic link
4. First login → guided setup wizard:
   a. Complete brand profile (logo, description, story, social links)
   b. Configure shop (shipping rates, minimums, return policy)
   c. Upload first 5 products (required before storefront goes live)
   d. Set wholesale pricing tiers
   e. Storefront preview → publish
5. Prompt to invite team members
6. Dashboard "getting started" checklist until complete
```

### Brand Onboarding (Claiming Seeded Page)
```
1. Brand finds seeded page → "Claim This Brand"
2. Domain verification
3. Review seeded content (accept / edit / discard each piece)
4. Upload documents, configure shipping, set pricing
5. Platform admin approves
6. Interested resellers notified → can now apply
7. Dashboard "getting started" checklist (some steps pre-completed from seed data)
```

### Reseller Onboarding (Direct Signup — No Existing Seeded Listing)
```
1. Reseller signs up (business info, license number, role)
2. Upload verification documents
3. Platform reviews
4. Approved → welcome email + magic link
5. First login → guided setup:
   a. Complete business profile
   b. Browse marketplace → apply to first brand
   c. Tour education hub
6. Brand approves → reseller can now order
7. Dashboard "getting started" checklist until first order
```

### Reseller Onboarding (Claiming Seeded Listing)
```
1. Business finds listing → "Claim This Business"
2. Phone verification
3. Review seeded content (accept / edit / discard)
4. Upload license, business docs, resale certificate
5. Platform admin approves
6. Brands who flagged this business are notified
7. Dashboard "getting started" checklist (some steps pre-completed)
```

### Brand-Reseller Connection Flow
```
1. Reseller discovers brand (browse / search / recommendation)
2. Clicks "Apply to Carry This Brand"
3. Fills out application (why, business details)
4. Brand receives notification → reviews
5. Approved → reseller sees brand products at assigned tier pricing
6. Rejected → reseller gets message with optional feedback
7. Brands can also proactively invite resellers
```

---

## SECTION 10 — PLATFORM MODULES

### MODULE 1 — MARKETPLACE & COMMERCE
Brand storefronts, product catalog, tiered pricing, reseller applications,
multi-brand cart, checkout (Stripe), order management (push to brand's system),
returns, reorder prompts, brand discovery, product search and filtering

### MODULE 2 — EDUCATION HUB
Native LMS, course builder (brand-side), enrollment + progress tracking,
certification system, live training scheduler, SOCELLE Academy (platform content),
protocol-linked education (learn the protocol, buy the products).
**Spec:** When building Education Hub or reseller learning/sales/marketing tools, use
`/docs/platform/RESELLER_EDUCATION_2026_DEEP_DIVE.md` as the product spec (AI-led,
microlearning, credentials, sales enablement, unified reseller home).

### MODULE 3 — MARKETING STUDIO
Brand asset library, co-brand template engine, email/SMS campaigns,
social content publishing, content calendar, loyalty program builder

### MODULE 4 — BUSINESS TOOLS
Service menu builder (link treatments to products), treatment protocol library,
intake/consultation forms, inventory tracking with reorder alerts,
reseller analytics dashboard, client retail recommendations

### MODULE 5 — BRAND CRM
Reseller network dashboard, rep territory management, messaging,
reseller health scoring, brand analytics, reseller tier management,
proactive outreach tools, **market intelligence from seeded business data**

### MODULE 6 — CONSUMER TOOLS
SEO-optimized public reseller profiles, booking integrations (Boulevard, Vagaro),
client retail portal, events and promotions hub

### PLATFORM INTELLIGENCE & COMMUNITY (cross-cutting)
**Beauty Intelligence:** AI-assembled reseller brief ("My brief") and brand demand pulse;
personalized digests (in-app + email); habit-forming design so the platform becomes
indispensable. **Community:** Cohort learning (with Education), platform announcements
(targeting), Pro Beauty identity (credentials). **Spec:** When building messaging,
digests, announcements, or intelligence surfaces, use
`/docs/platform/COMMUNITY_NEWS_AND_BEAUTY_INTELLIGENCE_DEEP_DIVE.md`.

---

## SECTION 11 — USER ROLES

### BRAND TIER
| Role | Access |
|------|--------|
| `brand_admin` | Full account control, billing, team, approvals, all modules, messaging |
| `brand_marketing` | Marketing Studio, asset library, campaigns, content calendar, broadcasts |
| `brand_educator` | Education Hub (create/manage courses, certs, live training) |
| `brand_rep` | Brand CRM, territory management, reseller accounts, proposals, **seeded business map view**, messaging with assigned resellers |
| `brand_ops` | Product catalog, inventory, orders, fulfillment, shipping, order-linked messages |

### RESELLER TIER
| Role | Access |
|------|--------|
| `business_owner` | Full account, billing, analytics, all brand relationships, all modules, messaging |
| `lead_provider` | Brand relationships, education, service menus, protocols, ordering, messaging |
| `front_desk` | Reorders (approved list only), marketing assets, loyalty, order-linked messages |
| `suite_tenant` | Personal wholesale account, education access, own ordering, messaging |
| `apprentice` | Education only — no purchasing, no brand relationships, no messaging |

### PLATFORM TIER
| Role | Access |
|------|--------|
| `platform_admin` | Everything — all brands, all resellers, platform settings, seeding tools, approvals, all messages (moderation) |
| `platform_brand_manager` | brand_admin-equivalent for ASSIGNED Premier brands only. All actions logged. Messaging with assigned brand. |
| `platform_content_creator` | Create/edit seed content for unverified brands AND unverified businesses. Edit content for assigned Premier brands. No financial data or reseller PII. No messaging. |

### ROLE RULES — NEVER VIOLATE THESE
- Every API endpoint and UI view **must** enforce role-based access
- **Never** render data or allow actions based on UI-only role checks
- All permissions enforced at the **API / RLS layer**
- When building a feature: document which roles can see it and act on it
- A user's role is scoped to their organization
- `platform_brand_manager` can ONLY access brands they are assigned to
- `platform_content_creator` can ONLY create/edit seed content — no commerce or PII access
- Messaging access is role-dependent (see Section 14)

---

## SECTION 12 — DATABASE CONVENTIONS & STATE

### CONVENTIONS — NEVER DEVIATE
- PKs: `uuid PRIMARY KEY DEFAULT gen_random_uuid()`
- Timestamps: always `created_at` AND `updated_at` paired
- updated_at: always paired with `update_updated_at_column()` trigger
- FK to users: `REFERENCES auth.users(id) ON DELETE CASCADE` (SET NULL for audit FKs)
- Enum adds: use `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN NULL END $$`
- Role checks in RLS: `EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN (...))`
- Brand scope in RLS: `brand_id IN (SELECT brand_id FROM user_profiles WHERE id = auth.uid())`
- Indexes: `CREATE INDEX IF NOT EXISTS idx_[table]_[column] ON [table]([column])`
- Migration IDs: `YYYYMMDDHHMMSS_snake_case_description.sql`
- Soft deletes on marketplace entities: `deleted_at timestamptz` for products, brands,
  businesses, orders, relationships, messages. Hard delete only for drafts/temp records.

### SCHEMA ADDITIONS FOR SEEDING & VERIFICATION

**Modified: `brands` table**
```sql
ALTER TABLE brands
  ADD COLUMN verification_status text NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'pending_claim', 'pending_verification', 'verified', 'suspended')),
  ADD COLUMN service_tier text NOT NULL DEFAULT 'standard'
    CHECK (service_tier IN ('standard', 'premier')),
  ADD COLUMN claimed_at timestamptz,
  ADD COLUMN claimed_by uuid REFERENCES auth.users(id),
  ADD COLUMN verified_at timestamptz,
  ADD COLUMN verified_by uuid REFERENCES auth.users(id),
  ADD COLUMN seeded_by uuid REFERENCES auth.users(id),
  ADD COLUMN seed_sources jsonb DEFAULT '[]',
  ADD COLUMN outreach_status text DEFAULT 'not_contacted'
    CHECK (outreach_status IN ('not_contacted', 'contacted', 'follow_up_1', 'follow_up_2', 'claimed', 'declined', 'removal_requested')),
  ADD COLUMN outreach_last_contacted_at timestamptz,
  ADD COLUMN is_platform_managed boolean NOT NULL DEFAULT false,
  ADD COLUMN platform_brand_manager_id uuid REFERENCES auth.users(id);
```

**Modified: `businesses` table**
```sql
ALTER TABLE businesses
  ADD COLUMN verification_status text NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'pending_claim', 'pending_verification', 'verified', 'suspended')),
  ADD COLUMN claimed_at timestamptz,
  ADD COLUMN claimed_by uuid REFERENCES auth.users(id),
  ADD COLUMN verified_at timestamptz,
  ADD COLUMN verified_by uuid REFERENCES auth.users(id),
  ADD COLUMN seeded_by uuid REFERENCES auth.users(id),
  ADD COLUMN seed_sources jsonb DEFAULT '[]',
  ADD COLUMN outreach_status text DEFAULT 'not_contacted'
    CHECK (outreach_status IN ('not_contacted', 'contacted', 'follow_up_1', 'follow_up_2', 'claimed', 'declined', 'removal_requested')),
  ADD COLUMN outreach_last_contacted_at timestamptz,
  ADD COLUMN business_type text
    CHECK (business_type IN ('salon', 'spa', 'medspa', 'barbershop', 'suite', 'mobile', 'school', 'other')),
  ADD COLUMN latitude numeric(10,7),
  ADD COLUMN longitude numeric(10,7),
  ADD COLUMN google_place_id text,
  ADD COLUMN yelp_business_id text,
  ADD COLUMN google_rating numeric(2,1),
  ADD COLUMN google_review_count integer,
  ADD COLUMN yelp_rating numeric(2,1),
  ADD COLUMN yelp_review_count integer,
  ADD COLUMN estimated_size text CHECK (estimated_size IN ('small', 'medium', 'large')),
  ADD COLUMN license_number text,
  ADD COLUMN license_status text CHECK (license_status IN ('active', 'expired', 'not_found', 'pending_verification')),
  ADD COLUMN license_expiration date,
  ADD COLUMN hours_of_operation jsonb,
  ADD COLUMN services_offered text[];
```

**Modified: `orders` table — additional payout/integration fields**
```sql
ALTER TABLE orders
  ADD COLUMN brand_payout_status text DEFAULT 'pending'
    CHECK (brand_payout_status IN ('pending', 'processing', 'paid', 'failed')),
  ADD COLUMN brand_payout_amount integer,  -- cents, after commission deduction
  ADD COLUMN brand_payout_at timestamptz,
  ADD COLUMN brand_external_order_id text,  -- order ID in brand's own system
  ADD COLUMN integration_type text DEFAULT 'manual'
    CHECK (integration_type IN ('manual', 'shopify', 'woocommerce', 'api', 'email')),
  ADD COLUMN integration_sync_status text DEFAULT 'not_applicable'
    CHECK (integration_sync_status IN ('pending', 'synced', 'failed', 'not_applicable'));
```

**New: `brand_interest_signals`**
```sql
CREATE TABLE brand_interest_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signal_type text NOT NULL CHECK (signal_type IN ('express_interest', 'notify_me', 'page_view')),
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(brand_id, business_id, signal_type)
);
CREATE INDEX idx_brand_interest_signals_brand_id ON brand_interest_signals(brand_id);
CREATE INDEX idx_brand_interest_signals_business_id ON brand_interest_signals(business_id);
```

**New: `business_interest_signals`**
```sql
CREATE TABLE business_interest_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signal_type text NOT NULL CHECK (signal_type IN ('potential_fit', 'target_account', 'rep_visited')),
  internal_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(business_id, brand_id, signal_type)
);
CREATE INDEX idx_business_interest_signals_business_id ON business_interest_signals(business_id);
CREATE INDEX idx_business_interest_signals_brand_id ON business_interest_signals(brand_id);
```

**New: `brand_seed_content`**
```sql
CREATE TABLE brand_seed_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN (
    'description', 'story', 'logo', 'banner', 'product', 'category_tags',
    'social_links', 'website_url', 'team_info',
    'press_mention', 'trade_show', 'fda_registration', 'instagram_stats', 'founding_info'
  )),
  -- content_data jsonb examples by content_type:
  -- press_mention: {"source": "Beauty Independent", "headline": "...", "url": "...", "date": "2026-01-15"}
  -- trade_show:    {"name": "Cosmoprof NA 2025", "year": 2025, "type": "exhibitor"}
  -- fda_registration: {"status": "registered", "facility_name": "...", "checked_at": "2026-02-25"}
  -- instagram_stats:  {"handle": "@brandname", "followers": "28.4K", "checked_at": "2026-02-25"}
  -- founding_info:    {"founded_year": 2017, "hq_city": "Reno", "hq_state": "NV"}
  content_data jsonb NOT NULL,
  source_url text,
  source_type text CHECK (source_type IN (
    'website', 'social_media', 'directory', 'press', 'manual',
    'google_news_rss', 'trade_show_list', 'fda_registry', 'shopify_api'
  )),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'accepted', 'edited', 'discarded')),
  accepted_at timestamptz,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_brand_seed_content_brand_id ON brand_seed_content(brand_id);
```

**New: `business_seed_content`**
```sql
CREATE TABLE business_seed_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN (
    'description', 'photos', 'services', 'hours', 'website_url',
    'social_links', 'license_info', 'location'
  )),
  content_data jsonb NOT NULL,
  source_url text,
  source_type text CHECK (source_type IN ('google', 'yelp', 'website', 'directory', 'license_board', 'manual')),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'accepted', 'edited', 'discarded')),
  accepted_at timestamptz,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_business_seed_content_business_id ON business_seed_content(business_id);
```

**New: `platform_brand_assignments`**
```sql
CREATE TABLE platform_brand_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  manager_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'brand_manager'
    CHECK (role IN ('brand_manager', 'content_creator', 'campaign_manager')),
  assigned_at timestamptz NOT NULL DEFAULT now(),
  assigned_by uuid NOT NULL REFERENCES auth.users(id),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(brand_id, manager_id, role)
);
CREATE INDEX idx_platform_brand_assignments_brand_id ON platform_brand_assignments(brand_id);
CREATE INDEX idx_platform_brand_assignments_manager_id ON platform_brand_assignments(manager_id);
```

**New: `conversations`** (see Section 14 for full messaging architecture)
```sql
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('direct', 'order_linked', 'brand_broadcast', 'platform_announcement', 'system')),
  subject text,
  participant_one_id uuid REFERENCES auth.users(id),
  participant_two_id uuid REFERENCES auth.users(id),
  order_id uuid REFERENCES orders(id),
  brand_id uuid REFERENCES brands(id),
  broadcast_segment jsonb,
  last_message_at timestamptz,
  last_message_preview text,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_conversations_participant_one ON conversations(participant_one_id);
CREATE INDEX idx_conversations_participant_two ON conversations(participant_two_id);
CREATE INDEX idx_conversations_brand_id ON conversations(brand_id);
CREATE INDEX idx_conversations_order_id ON conversations(order_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
```

**New: `messages`**
```sql
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id),
  sender_role text,
  body text NOT NULL,
  body_html text,
  attachments jsonb DEFAULT '[]',
  message_type text NOT NULL DEFAULT 'user' CHECK (message_type IN ('user', 'system', 'broadcast', 'announcement')),
  edited_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

**New: `message_read_status`**
```sql
CREATE TABLE message_read_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_read_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);
CREATE INDEX idx_message_read_status_user ON message_read_status(user_id);
CREATE INDEX idx_message_read_status_conversation ON message_read_status(conversation_id);
```

**New: `broadcast_recipients`** (Phase 2)
```sql
CREATE TABLE broadcast_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);
CREATE INDEX idx_broadcast_recipients_conversation ON broadcast_recipients(conversation_id);
CREATE INDEX idx_broadcast_recipients_user ON broadcast_recipients(user_id);
```

### PHASE 1 MIGRATIONS — APPROVED & TO BE BUILT IN ORDER
```
20260224000001_modify_user_profiles_add_tiers.sql
20260224000002_modify_plans_add_missing_fields.sql
20260224000003_modify_businesses_add_profile_fields.sql
20260224000004_create_product_pricing_table.sql
20260224000005_modify_orders_add_payment_and_payout_fields.sql
20260224000006_modify_pro_products_add_sort_order.sql
20260224000007_modify_brands_add_verification_seeding.sql
20260224000008_modify_businesses_add_verification_seeding.sql
20260224000009_create_brand_interest_signals.sql
20260224000010_create_business_interest_signals.sql
20260224000011_create_brand_seed_content.sql
20260224000012_create_business_seed_content.sql
20260224000013_create_conversations_table.sql
20260224000014_create_messages_table.sql
20260224000015_create_message_read_status_table.sql
```

**NOTE:** The old migration `20260224000006_modify_brand_messages_add_threading.sql`
has been **replaced** by the new conversations + messages system. The new messaging
tables handle everything brand_messages did (threading, broadcasts, attachments)
and much more. If brand_messages data exists in production, migrate it to the
new tables.

### PHASE 2 MIGRATIONS
```
20260301000001_create_spa_menu_items_table.sql
20260301000002_create_reseller_saved_protocols_table.sql
20260301000003_create_reseller_inventory_table.sql
20260301000004_create_brand_rep_assignments_table.sql
20260301000005_create_brand_marketing_assets_tables.sql
20260301000006_create_platform_brand_assignments.sql
20260301000007_create_broadcast_recipients_table.sql
```

### CART DECISION
- Phase 1: localStorage cart — no cart_sessions table yet
- Phase 2: server-side cart_sessions for abandoned cart recovery

### LIVE BUGS TO FIX IN PHASE 1
- plans.business_id — queried in dashboard, may not exist
- plans.fit_score — queried in dashboard, may not exist
- Always check live DB before writing migrations for these

### SUFFICIENT AS-IS — DO NOT MODIFY WITHOUT ASKING
```
brands (beyond the new columns above), brand_shop_settings, brand_assets,
brand_page_modules, canonical_protocols, subscription_plans, subscriptions,
platform_events, brand_analytics, business_analytics, platform_health,
search_analytics, mapping_analytics, revenue_attribution, feature_flags,
audit_log, embedding_queue, mixing_rules, treatment_costs,
marketing_calendar, ai_concierge_chat_logs, medspa_treatments,
medspa_products, medspa_kits, service_category_benchmarks,
revenue_model_defaults
```

---

## SECTION 13 — SEARCH & DISCOVERY

### Product Search (Reseller-Facing)
- Full-text search across product name, description, brand name
- Filters: category, brand, price range, in-stock, new arrivals
- Sort: relevance, price low/high, newest, bestselling
- Only show pricing from approved brands (unapproved = "apply to access pricing")
- Unverified brand products appear but with "pricing available when [Brand] joins"

### Brand Discovery (Reseller-Facing)
- Browse by category, treatment type, product type
- "Recommended for you" based on business type and existing relationships
- "New on SOCELLE" featured section
- Unverified brands included in results with clear badge
- Interest signal count visible ("23 salons interested")

### Business Discovery (Brand-Facing — Brand CRM / Rep Tools)
- Browse by: location (map + list), business type, estimated size, verification status
- Filter: city/state, zip radius, salon vs spa vs medspa, has license, rating
- "Unmatched businesses" — businesses that don't carry your brand yet
- Territory view for reps (map with pins, color-coded by status)
- Aggregate stats: "47 salons in Austin — 12 verified, 35 unverified, 8 carry your brand"
- **Verified businesses show full detail. Unverified show city/state + type only.**

### Implementation
- Phase 1: Supabase full-text search with `tsvector` + basic filters + PostGIS for geo
- Phase 3+: Evaluate Typesense/Meilisearch if performance needs it

---

## SECTION 14 — MESSAGING SYSTEM

### Overview

SOCELLE has a **platform-wide messaging system** for all verified users.
This is not just brand broadcast — it's full conversational messaging between
any verified entities on the platform.

**Messaging is a core feature, not a nice-to-have.** In professional beauty,
relationships drive business. Brands need to talk to resellers about orders,
new products, and training. Resellers need to ask brands about formulations,
stocking advice, and returns. Platform admins need to communicate with everyone.

### Who Can Message Whom

| Sender | Can Message | Use Cases |
|--------|------------|-----------|
| **Brand → Reseller** | Any reseller in their approved network | Order updates, product recs, training invites, tier upgrades |
| **Reseller → Brand** | Any brand they're approved to carry | Order questions, product inquiries, restock requests, support |
| **Brand → Brand** | ❌ No | Brands cannot message other brands (competitive concerns) |
| **Reseller → Reseller** | ❌ No | Resellers cannot message other resellers (privacy) |
| **Platform Admin → Anyone** | All brands and resellers | Platform updates, onboarding help, dispute resolution |
| **Anyone → Platform Admin** | Platform support | Bug reports, disputes, account issues |
| **Brand Rep → Assigned Resellers** | Resellers in their territory | Relationship management, check-ins, promos |
| **Platform Brand Manager → Assigned Brand** | Their Premier brand(s) | Content approvals, strategy, weekly updates |

### Message Types

**1. Direct Messages (1:1 conversations)**
- Between two verified entities (brand user ↔ reseller user)
- Full threading with subject lines
- File attachments (images, PDFs — max 10MB)
- Read receipts
- Typing indicators (Phase 2+)

**2. Brand Broadcasts (1:many) — Phase 2**
- Brand sends to entire reseller network or filtered segments
- Segments: by tier, by location, by last order date, by education completion
- Cannot be replied to individually (recipients can start a new DM if needed)
- Used for: new product announcements, sale events, training schedules, policy changes
- Rate limits: max 1 broadcast per day, max 4 per week

**3. Platform Announcements (1:all) — Phase 3+**
- Platform admin sends to all brands, all resellers, or both
- Used for: platform updates, new feature announcements, maintenance windows
- Cannot be replied to (support channel available separately)

**4. Order-Linked Messages**
- Messages attached to a specific order (shown in order detail view)
- Used for: "where's my order?", shipping questions, return discussions
- Automatically tagged with order context (order ID, items, status)
- Both brand and reseller can initiate

**5. System Messages (Automated)**
- Generated by the platform, not written by a user
- Examples: "Your order #1234 has shipped", "Brand X approved your application"
- Appear in the same message inbox but visually distinct (system avatar, no reply option)
- These are the notification system's in-app channel

### Real-Time Delivery
- **In-app:** Supabase Realtime subscription on `messages` table
- **Email:** Configurable per user in notification preferences
- **Unread badge:** Visible in main navigation at all times

### Messaging Rules — Build These Into the System

1. **Unverified users cannot message.** Requires verification_status = 'verified'.
2. **Brand-reseller messaging requires approved relationship.** Exception: order-linked messages.
3. **No unsolicited messaging.** Brands can only DM resellers in their approved network.
4. **Rate limits on broadcasts.** Max 1/day, 4/week per brand.
5. **Attachment validation.** Allowed: jpg, png, webp, pdf, csv, xlsx. Blocked: executables, scripts, archives.
6. **Messages are never hard deleted.** Soft delete shows "This message was deleted" placeholder.
7. **Admin access.** Platform admin can view any conversation for moderation. Logged in audit_log.

### Inbox UI Requirements
- Unified inbox — all conversation types in one view
- Filterable by type, brand, read/unread, date
- Unread badge visible in main navigation
- Conversation list: name/avatar, subject, preview, timestamp, unread indicator
- Message view: threaded, timestamps, read receipts, attachment previews, order context bar
- Compose: select recipient from approved connections only

### Messaging Phase Rollout
- **Phase 1:** Direct messages, order-linked messages, system messages, basic inbox, email notifications
- **Phase 2:** Brand broadcasts, segmentation, archiving, file attachments
- **Phase 3+:** Platform announcements, rich text, message templates, auto-messages, analytics

**Community, news & AI intelligence:** For habit-forming digests, “Beauty Intelligence” brief/pulse, and community design (cohorts, platform announcements, variable reward), see `/docs/platform/COMMUNITY_NEWS_AND_BEAUTY_INTELLIGENCE_DEEP_DIVE.md`.

---

## SECTION 15 — NOTIFICATIONS & COMMUNICATIONS

### Transactional Notifications

| Event | Recipient | Channel |
|-------|-----------|---------|
| Order placed | Brand + Reseller | Email + in-app |
| Order shipped (brand updates) | Reseller | Email + in-app |
| Order delivered | Reseller | In-app |
| Reseller application received | Brand | Email + in-app |
| Application approved/rejected | Reseller | Email + in-app |
| Brand approved on platform | Brand admin | Email |
| Reseller verified on platform | Business owner | Email |
| License expiring (60/30/7 days) | Business owner | Email + in-app |
| New product from carried brand | Reseller | In-app |
| Reorder reminder | Reseller | Email + in-app |
| Return requested | Brand | Email + in-app |
| Refund processed | Reseller | Email + in-app |
| New message received | Recipient | Email (if enabled) + in-app |

### Seeding & Claim Notifications

| Event | Recipient | Channel |
|-------|-----------|---------|
| Interest signal batch (daily) | Platform admin | Email + in-app |
| Interest threshold (5/10/25/50) | Platform admin | In-app |
| Brand claimed page | Platform admin | Email + in-app |
| Business claimed listing | Platform admin | Email + in-app |
| Brand verified — apply now | Interested resellers | Email + in-app |
| Business verified — invite them | Flagging brands | Email + in-app |
| Removal request received | Platform admin | Email + in-app |
| Premier action digest (weekly) | Brand admin | Email |
| Premier action needs approval | Brand admin | Email + in-app |

### Notification Architecture
```sql
notifications: id, user_id, type, title, body, data (jsonb),
  read_at, channel, sent_at, created_at, updated_at

notification_preferences: id, user_id, notification_type,
  email (bool), in_app (bool), sms (bool), created_at, updated_at
```
- In-app: Supabase Realtime (same channel as messaging)
- Email: Resend or Postmark
- SMS: Phase 3+ (Twilio) — marketing only

---

## SECTION 16 — FILE & MEDIA HANDLING

### Storage: Supabase Storage (integrated with RLS)
- `brand-assets` — logos, banners, marketing materials (brand-scoped)
- `product-images` — product photos (brand-scoped)
- `course-media` — thumbnails (brand-scoped)
- `documents` — licenses, certs, insurance (user-scoped, private)
- `profile-images` — avatars and business photos
- `seed-content` — images scraped/saved during seeding (platform-scoped)
- `message-attachments` — files sent via messaging (conversation-scoped)

### Upload Rules
- Product images: max 5MB, jpg/png/webp, max 10 per product
- Brand assets: max 20MB, jpg/png/webp/pdf
- Documents: max 10MB, pdf/jpg/png
- Message attachments: max 10MB, jpg/png/webp/pdf/csv/xlsx
- Course video: embed from Vimeo/YouTube/Loom (no self-hosting Phase 1)
- Seed content images: stored with source attribution metadata
- Generate thumbnails (300px) on upload

---

## SECTION 17 — ERROR HANDLING & RESILIENCE

### Stripe & Payments
- Webhook idempotency (store `stripe_event_id` in `processed_events`)
- Payment status machine: `pending → processing → succeeded → failed` (never skip)
- Failed payments: order stays `payment_pending`, auto-cancel after 24h
- Refunds: always via Stripe API, update on webhook (never optimistic)
- Payout status machine: `pending → processing → paid → failed`

### Marketplace State Conflicts

| Scenario | Behavior |
|----------|----------|
| Product deactivated while in cart | Show "unavailable", prevent checkout of that item |
| Brand deactivates with open orders | Existing orders fulfilled, no new orders, resellers notified |
| Reseller license expires | Soft lock — can view, cannot order. 30-day grace, then suspend |
| Price changes after add-to-cart | Current price at checkout (not locked). Show "price updated" notice |
| Tier change mid-session | New tier on next order. In-progress orders keep original tier |
| Out of stock during checkout | Fail that line item, allow rest of order |
| Brand out of stock at fulfillment | Brand notifies reseller via order-linked message. Partial refund. |
| Order push to brand system fails | Order stays in `integration_sync_status = 'failed'`. Email fallback. Retry. |
| Unverified brand gets removal request | Remove within 48h. Notify interested resellers. |
| Business claims listing but data wrong | They can edit/discard all seeded content during claim flow |
| Two people try to claim same brand/business | First to complete verification wins. Second is notified. |

### Monitoring
- Sentry for client + server errors
- `/api/health` endpoint (DB, Stripe, Storage)
- Alert on: payment failures >5/hr, error rate >1%, DB failures
- Log all Stripe webhooks, RLS denials, and integration sync failures

---

## SECTION 18 — TESTING STRATEGY

### Non-Negotiable Tests
- Commerce critical path (cart → checkout → payment → order → webhook → brand notification)
- Order push to brand system (email fallback works when integration fails)
- Multi-brand cart splits correctly with separate brand payouts
- Tiered pricing applies correctly
- Minimum order enforcement per brand
- Commission calculation and payout amounts are correct
- RLS: brand_admin sees only their brand
- RLS: business_owner sees only their business
- RLS: platform_brand_manager sees only assigned brands
- RLS: unverified brand data visible but no pricing exposed
- RLS: unverified business shows city/state only (no full address to brands)
- RLS: messaging — users can only see conversations they participate in
- State transitions: order, payment, payout, brand verification, business verification
- Claim flow: only one successful claim per brand/business
- Interest signals: deduplication works
- Messaging: verified-only, relationship-gated, no cross-entity leakage

### Approach
- Phase 1: manual testing checklist + RLS verification scripts
- Phase 2+: Vitest (unit) + Playwright (E2E on critical flows)
- Every RLS policy ships with a verification query

---

## SECTION 19 — SEED DATA & DEMO STRATEGY

### Development Seed Script
- 3 verified brands (skincare, haircare, medspa) with 10-20 products each
- 5 unverified (seeded) brands with products, no pricing
- Interest signals from demo resellers on unverified brands
- 2 brands in "pending_claim" state
- 1 Premier brand with platform_brand_manager assigned
- 5 verified resellers (salon, spa, medspa, suite, apprentice)
- 10 unverified (seeded) businesses across 3 cities
- Business interest signals (brand flags) on seeded businesses
- 10 sample orders in various states (including payout statuses)
- 2 sample courses with certifications
- Sample conversations: brand↔reseller DMs, order-linked threads, system messages

### Launch Seed Strategy
- Manually onboard 5-10 founding brands before opening
- Seed 200-500 businesses in target launch markets from Google
- Seed 50-100 beauty brands from public websites
- Create SOCELLE Academy with 3-5 platform courses
- Build "SOCELLE Picks" curated brand collection

---

## SECTION 20 — PLATFORM ADMIN TOOLS

### Brand Seeding Dashboard
```
- Total: seeded / pending claim / verified / premier
- Interest signals leaderboard (most-demanded unverified brands)
- Outreach pipeline (contacted → follow-up → claimed/declined)
- "Seed New Brand" / "Bulk Import" / "Scrape Assist"
- Claim requests queue
- Removal requests queue
```

### Business Seeding Dashboard
```
- Total: seeded / pending claim / verified (by market)
- Map view of all seeded businesses (color by status)
- Area sweep tool (seed all salons in a zip code)
- Brand locator import tool
- Business claim requests queue
- Duplicate detection alerts
- License verification queue
```

### Seeding Metrics
| Metric | Purpose |
|--------|---------|
| Seeded → claimed (brands) | Outreach effectiveness |
| Seeded → claimed (businesses) | Inbound/invite effectiveness |
| Interest signals before claim | Demand threshold for outreach |
| Time from seed to claim | Sales cycle length |
| Time from claim to first order | Onboarding friction |
| Brand-invite → business-claim rate | Best channel tracking |
| Premier conversion rate | Upsell effectiveness |
| Removal request rate | Content quality signal |

---

## SECTION 21 — SCRAPING & CONTENT SEEDING RULES

### What You Can Scrape
- Brand's own public website
- Public social media profiles
- Google Business Profiles (public data)
- Yelp public listings
- State licensing board public lookups
- Wholesale/trade directories
- Press releases and media features
- Brand "find a salon" locator pages

### What You Cannot Scrape or Use
- Content behind paywalls or logins
- Private social media content
- Actual review text from Google/Yelp (copyright — reference rating + count only)
- Pricing from other wholesale platforms
- Content marked not for redistribution
- Personal information not publicly listed

### Content Attribution
- Every seeded piece tracks its source URL
- Product descriptions: rewritten/summarized, not verbatim (fair use)
- Product images from brand's own site: fair use for identification
- Business photos from Google: attributed to Google Business
- Disclaimer on every unverified page: "Information from public data. [Entity] has not verified."

### Opt-Out / Removal
- Any brand or business can request removal at any time
- Must honor within 48 hours
- "Request Removal" link on every unverified page footer
- Track removal requests for disputes

### Scraping Phases
- Phase 1: manual curation by platform admin
- Phase 2: semi-automated (enter URL → AI extracts structured data)
- Phase 3+: automated monitoring for catalog changes, new locations

---

## SECTION 22 — BUILD PHASES

```
PHASE 0 — FOUNDATION                    ✅ Complete
  Infrastructure, design system, auth, data models

PHASE 1 — CORE COMMERCE                 ← CURRENT PHASE
  Brand storefronts, product catalog, tiered pricing
  Reseller applications, multi-brand cart, Stripe checkout
  Order management (push to brand system, manual + email fallback)
  Stripe Connect payouts to brands
  Returns, transactional notifications
  Basic search, onboarding flows (both sides)
  Brand verification states + seeding (manual)
  Business verification states + seeding (manual)
  Interest signals (both directions)
  Claim flows (brand + business)
  Platform admin seeding tools (basic)
  Messaging: DMs, order-linked messages, system messages, inbox UI

PHASE 2 — EDUCATION HUB + SEEDING TOOLS + SHOPIFY
  LMS, course builder, certifications, live training
  SOCELLE Academy, protocol-linked education
  Cohort learning (shared start date, Q&A, leaderboard — see Education deep dive)
  Shopify integration (order push, inventory sync, catalog import)
  Semi-automated scraping assist
  Bulk seeding tools (CSV import, area sweep)
  Outreach pipeline tracking
  Interest signal analytics
  Brand broadcasts + segmentation
  Server-side cart (abandoned cart recovery)
  Optional: simple "Your week" summary for resellers (rule-based; see Community/Intelligence deep dive)

PHASE 3 — MARKETING STUDIO + PAYMENTS + BEAUTY INTELLIGENCE
  Asset library, co-brand templates, email/SMS
  Social publishing, content calendar, loyalty
  Net-30 payment terms for qualified resellers
  Automated license verification API
  WooCommerce + BigCommerce integrations
  Platform announcements (targeting, scheduling), rich text messaging
  Message templates, auto-messages
  Reseller Brief ("My brief") — AI-assembled, in-app + email; variable reward (orders, new from brands, learn next, trend)
  Brand Demand Pulse — AI-assembled, in-app + email; demand signals, network activity, trend
  Digest preferences (frequency, channel); see COMMUNITY_NEWS_AND_BEAUTY_INTELLIGENCE_DEEP_DIVE.md

PHASE 4 — BUSINESS TOOLS
  Service menus, protocols, intake forms
  Inventory management, reorder alerts
  Reseller analytics dashboard

PHASE 5 — BRAND CRM + PREMIER
  Rep territory management, reseller health scoring
  Brand analytics, outreach tools
  Premier service tier
  platform_brand_manager role + scoped access
  Approval workflows, weekly digests
  Market intelligence from seeded business data

PHASE 6 — CONSUMER TOOLS
  Public reseller profiles, booking integrations
  Client retail portal, events hub

PHASE 7 — SCALE & INTELLIGENCE
  Automated scraping monitoring
  Advanced marketing automation
  Beauty Intelligence feed (full variable reward, trend/regulatory news, reorder intelligence, saved insights)
  Native video hosting evaluation
  Market expansion tools
```

**Master Brain (AI & Banking) — applies to all phases:** All AI must route through the single **ai-orchestrator** Edge Function (4-tier OpenRouter). No prompt logic or AI API keys in the frontend. Credits are deducted atomically via **deduct_credits()** (DECIMAL(10,6), row-locked); see `/docs/MASTER_BRAIN_ARCHITECTURE.md`. Mobile-native UX: 44px min touch targets, safe-area insets, WCAG 2.2 AA, skeleton screens for AI content (CLS < 0.1).

---

## SECTION 23 — WORKING RULES

### Before Writing Any Code
- Confirm task maps to approved blueprint and current phase
- Show schema or component structure first — wait for approval
- Never modify a working feature without flagging it
- Ask "which roles can access this?" before building anything

### When Writing Migrations
- Follow naming conventions exactly
- One migration at a time — show each before writing next
- Check if column exists before adding
- Never write a migration that could silently fail
- Include rollback comment at top of every migration
- Test on branch/local DB before production

### When Writing Application Code
- Permissions at API/RLS layer only — never UI-only enforcement
- Never hardcode credentials or env-specific values
- Handle loading, error, and empty states for every view
- Soft deletes for marketplace entities
- **Verification-aware:** every query that touches brands or businesses must
  account for verification_status. Never expose unverified entity data
  that should be restricted (pricing, full addresses, etc.)

### When Building Commerce/Order Features
- **SOCELLE never touches physical product.** All fulfillment happens in the
  brand's own system.
- **Always design for the manual fallback.** Not every brand will have a Shopify
  integration. Every flow must work with email notification + manual dashboard
  entry as the baseline.
- **Integration is additive, not required.** A brand can sell on SOCELLE with
  zero integrations — they get email order notifications and enter tracking manually.
- **Order status comes from the brand.** SOCELLE records it but the brand is
  the source of truth for shipped/delivered/returned.
- Store price/tier at time of order — never reference current for historical
- Monetary values as integers (cents) — never floats
- Payment state changes via Stripe webhook only
- Commission and payout calculations must be testable in isolation

### When Building AI, Credit Billing, or Mobile-Native UX (Master Brain)
- **Read `/docs/MASTER_BRAIN_ARCHITECTURE.md`** before adding or changing any AI flow, credit/billing logic, or mobile UX.
- **All AI goes through ai-orchestrator.** No `fetch()` to OpenAI/Anthropic/Google/Groq from the frontend. No prompt engineering in `src/`. Frontend only invokes `supabase.functions.invoke('ai-orchestrator', { body: { task_type, messages, feature, ... } })`.
- **Credits are atomic.** Use `deduct_credits()` RPC; never deduct or log costs in application code. Balances are DECIMAL(10,6); ledger is immutable.
- **2026 mobile-web:** Interactive elements min 44×44px (use `min-h-touch min-w-touch` or `.touch-target`). Use safe-area insets for notched devices. Buttons and text must meet WCAG 2.2 AA contrast. AI-generated content must use skeleton placeholders so CLS < 0.1.

### When Building Messaging, Digests, or Intelligence
- **Community, news & Beauty Intelligence:** Follow `/docs/platform/COMMUNITY_NEWS_AND_BEAUTY_INTELLIGENCE_DEEP_DIVE.md` for habit-forming design, reseller brief, brand demand pulse, and platform announcements. Delivering "can't live without" value is a product requirement for Phase 3+.
- **All messaging requires verified status.** No exceptions.
- **All messaging requires an approved relationship** (except platform admin
  and system messages).
- **Messages are never hard deleted.** Soft delete only.
- **Every message must have a conversation_id.** No orphan messages.
- **Real-time delivery via Supabase Realtime.** No polling.
- **Respect notification preferences.** Never send email notifications to
  users who have disabled them.

### When Building Seeding Features
- Always store source URL for provenance
- Never copy content verbatim — summarize/rewrite
- All seeded content must be editable/discardable during claim flow
- Maintain clear separation between seed_content tables and live content
- Platform admin actions on seeded content are always logged

### When You're Unsure
- **Stop and ask** — never assume and build something to tear down
- If you find a bug not related to current task, add to `BUGS.md`
- If a feature feels too complex, propose a simpler Phase 1 version

### Communication
- Task complete: summarize in ≤5 bullet points
- Bug found: explain cause before proposing fix
- Architectural assumption: flag explicitly
- Task >30 minutes: break into subtasks, confirm plan first

---

## SECTION 24 — START OF SESSION CHECKLIST

```
[ ] Read full codebase — know current state
[ ] Check recent git changes — know what was last touched
[ ] Read /docs/build_tracker.md — current phase, features, blockers
[ ] Read /docs/SOCELLE_MASTER_PROMPT_FINAL.md (this file) — source of truth
[ ] If task touches Education Hub / reseller learning: read /docs/platform/RESELLER_EDUCATION_2026_DEEP_DIVE.md
[ ] If task touches UI/UX or site design: read /docs/platform/UI_UX_SITE_DESIGN_DEEP_DIVE.md
[ ] If task touches community, news, digests, or AI intelligence (brief/pulse): read /docs/platform/COMMUNITY_NEWS_AND_BEAUTY_INTELLIGENCE_DEEP_DIVE.md
[ ] If task touches AI flows, credit/billing, or mobile-native UX: read /docs/MASTER_BRAIN_ARCHITECTURE.md
[ ] If Autonomous Core Intelligence mode is active: read /docs/SOCELLE_Master_Strategy_Build_Directive.md; treat payment tasks as [POSTPONED]; focus Master Brain + Identity Bridge
[ ] Confirm current Phase and what migrations are complete
[ ] Check BUGS.md for flagged issues
[ ] Report status in plain English:
    - What is currently built and working
    - What is in progress or partially built
    - What Phase we are in
    - What the next logical task is
[ ] WAIT for me to confirm today's task
```

**Do not write a single line of code until I confirm the task.**

---

## SECTION 25 — REFERENCE FILES

| File | Purpose | Who updates |
|------|---------|-------------|
| `/docs/blueprint.md` | Full product spec | Human |
| `/docs/schema_analysis.md` | Approved DB plan | Both (Claude proposes, human approves) |
| `/docs/build_tracker.md` | Current phase, features, migrations, bugs, decisions | Claude (end of session) + Human |
| `/docs/BUGS.md` | Known bugs | Claude flags, human prioritizes |
| `/docs/DECISIONS.md` | Architecture + product decisions | Both |
| `/docs/API.md` | API endpoint docs | Claude (auto-generate) |
| `/scripts/seed.sql` | Dev seed data | Claude |
| `/docs/CHANGELOG.md` | What was built, when | Claude (end of session) |
| `/docs/MASTER_PROMPT_VS_RESEARCH.md` | Strategic alignment with 2026 Beauty/SaaS research; gaps and actionable edits | Human + Claude (when updating strategy) |
| `/docs/platform/RESELLER_EDUCATION_2026_DEEP_DIVE.md` | Reseller education, sales & marketing 2026+ (AI-led, credentials, microlearning) | Human + Claude (when building Module 2) |
| `/docs/platform/UI_UX_SITE_DESIGN_DEEP_DIVE.md` | UI/UX & site design — immersive, high-end, superior to single-brand | Human + Claude (when building UI/UX) |
| `/docs/platform/COMMUNITY_NEWS_AND_BEAUTY_INTELLIGENCE_DEEP_DIVE.md` | Community, news & AI beauty intelligence — addictive, indispensable brief/pulse | Human + Claude (when building messaging, digests, Phase 3+ intelligence) |
| `/docs/platform/FIGMA_AUDIT_AND_ACTION_PLAN.md` | Figma audit checklist and action list — minimize build, enhance from existing designs | Human (audit Figma); Claude (when implementing from Figma links) |
| `/docs/platform/SOCELLE_FIGMA_DESIGN_BRIEF.md` | Figma design brief — design system (colors, type, components) and key screen specs to build in a blank Figma file | Human (build in Figma); Claude (when implementing from resulting frame links) |
| `/docs/platform/DESIGN_PLANS.md` | Index of all design plans — design system source of truth, design docs, principles, prioritized actions, Figma links | Human + Claude (when touching UI/design) |
| `/docs/MASTER_BRAIN_ARCHITECTURE.md` | Master Brain: single AI orchestrator (4-tier OpenRouter), atomic banker (deduct_credits, DECIMAL(10,6)), dumb client, 2026 mobile-web (touch 44px, safe-area, WCAG 2.2 AA, skeletons for CLS) | Human + Claude (when adding AI flows or mobile UX) |
| `/docs/SOCELLE_Master_Strategy_Build_Directive.md` | Autonomous Core Intelligence: payment bypass protocol, Groundbreaking missions, autonomous workflow. Current mode: paywall open; focus Master Brain + Identity Bridge. | Human + Claude (start of session when in autonomous mode) |

### Decision Log Format
```
## [DATE] — [Decision Title]
**Context:** Why this came up
**Decision:** What we decided
**Alternatives:** What we didn't do and why
**Affects:** Which modules this impacts
```

---

## SECTION 26 — LEGAL NOTES

**Consult a lawyer before launching the seeding features.** Specifically:
- Fair use for displaying brand product images and business photos
- CAN-SPAM compliance for outreach emails
- Terms of Service covering the seeding program (both brands and businesses)
- Public "Brand Seeding Policy" and "Business Listing Policy" pages
- DMCA takedown process for content disputes
- State-by-state rules on business listing requirements
- Google/Yelp Terms of Service compliance for using their public data
- Privacy implications of storing business location + license data

The model is proven (Google Business, Yelp, Faire, Zillow all do it),
but implementation details matter. Get legal sign-off before launch.

---

## SECTION 27 — UI/UX GUIDELINES FOR VERIFICATION STATES

**Broader UI/UX principles (immersive, high-end, design system):** See
`/docs/platform/UI_UX_SITE_DESIGN_DEEP_DIVE.md` for full spec. All surfaces
should use design tokens (pro-* / brand-*); no local color objects that drift
from the system.

### Unverified Brand Page
- "Unverified" badge (neutral, like "Unclaimed" on Google Business)
- "This page was created from public information. [Brand] has not yet joined SOCELLE."
- Products visible, no pricing. Show "Pricing available when [Brand] joins"
- "Express Interest" CTA in header
- Footer: "Is this your brand? Claim this page" + "Request removal"

### Unverified Business Listing
- "Unverified" badge
- "This listing was created from public information. [Business] has not yet joined."
- City/state only (no full address). Business type. Google/Yelp rating reference.
- Public exterior photos only
- Brands see: "Flag as Potential Fit" button
- Footer: "Is this your business? Claim this listing" + "Request removal"

### Verified Brand/Business
- "Verified" checkmark
- Full features, no restrictions
- Full color, full commerce, full engagement
- Messaging enabled

### Premier Brand
- "Verified" + "Premier Partner" designation
- Priority in discovery, "SOCELLE Recommended" option
- No visible difference in management model to resellers

---

*This document is the source of truth for every build session.
If anything in the codebase conflicts with this document, flag it.
Do not resolve the conflict yourself — bring it to me first.*
