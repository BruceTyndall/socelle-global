# SOCELLE — Complete Strategic & Executional Playbook
**Classification:** Internal working document — brand strategy, copy system, visual direction, SEO, and multi-agent execution plan
**Status:** Living document — update as decisions are made and phases complete
**Last updated:** March 2026

---

# A. Executive Summary

## What the business is today

SOCELLE is a functional B2B wholesale marketplace platform built specifically for professional beauty. It has a production-grade React/TypeScript/Supabase codebase with four portals (public marketing, brand, business/reseller, admin), a coherent visual system, and thoughtfully written copy on most of its public pages. The core product — brand storefronts, tiered wholesale pricing, multi-brand cart, order management, direct messaging — is real and built to a professional standard. The platform architecture is more sophisticated than most B2B marketplaces at this stage.

What it does not yet have: real brands on the platform, real social proof, a professional domain email, a logomark, a resolved visual identity system, or a marketing site that earns the quality of the product behind it. The current site is a functional platform that happens to have a homepage. It is not yet a brand that earns trust before asking for it.

## What it should become

A premium cross-category professional commerce platform — the infrastructure layer between verified specialty brands and licensed professional buyers — with beauty, wellness, spa, salon, medspa, and hospitality as the authoritative launch vertical and a clear expansion pathway into adjacent professional trade categories.

The brand analogy: what Faire did for general wholesale, what Procore did for construction, what Toast did for restaurants — SOCELLE should become the defining commerce infrastructure for professional beauty and the professional trades adjacent to it. Not a directory. Not a marketplace in the Etsy sense. A commerce platform with intelligence built in.

## Biggest strategic gaps

1. The color system, typography, and architecture decision (rosewood navy vs. sage) is unresolved and is blocking the marketing site rebuild
2. The DEBVAI / SOCELLE brand relationship is undefined
3. No brands are onboarded — the platform's most important page (browse) is empty
4. The parent-brand vs. vertical-specific messaging split is not built out
5. No real social proof exists at any level

## Biggest website gaps

1. No marketing site worthy of the platform (Next.js rebuild planned but not started)
2. No logomark — brand exists only as a text treatment
3. No vertical landing pages for SEO or vertical-specific conversion
4. /brand/apply and /portal/signup have not been audited for conversion quality
5. Phase 1 fixes in progress but not yet verified complete

## Biggest messaging gaps

1. The tagline "Professional beauty, one platform" is functional but not ownable
2. No messaging architecture that distinguishes platform-level language from beauty-vertical language
3. No "why now" argument in any public-facing copy
4. No social proof language to anchor trust claims
5. The hero sub-headline describes the category instead of leading with the value

## Biggest visual gaps

1. Unresolved color system — two competing palettes, no decision
2. No logomark or standalone icon
3. Current Playfair Display typography is good but dates the brand in the context of 2026 premium B2B
4. No OG image, no social sharing assets
5. No illustration or visual metaphor system — the platform currently lives or dies on typography and color alone

## Fastest path to strong launch

Phase 0 decisions (1 day) → Phase 1 fixes completion + verification (1-2 days) → Next.js marketing site scaffold with resolved visual system (5-7 days) → Copy system applied to all pages (3-4 days) → Real brand content onboarded (concurrent) → Soft launch with real brands visible. Total: 2-3 weeks to a credible launch if Phase 0 decisions are made today.

---

# B. Current Website Audit

*Full detail in previous audit documents. Summary of key findings by page:*

**Home** — Structurally strong. Hero headline is good. Comparison table is the best strategic asset on the site. Stats are fictional and disclosed. Testimonials are fabricated. The "Projected targets" footnote is an active credibility killer. Stats section and testimonials section have been removed/fixed in Phase 1.

**About** — Best narrative writing on the site. "Four things that shouldn't still be true in 2026" earns its place. Team section is an empty placeholder that needs to be resolved. Principles section is unusually strong.

**Pricing** — Honest, direct, and well-structured. The 92/8 economics disclosure builds trust. The FAQ is the best pre-sales copy on the platform. Gmail contact has been updated in Phase 1.

**Insights** — Layout exists, all content is placeholder. Phase 1 removed the disclosure language. The page needs real content or it needs to be gated.

**Brands (browse)** — Functional but depends entirely on real brand data. Empty at launch = dead page.

**Brand Storefront** — Built and sophisticated. Needs real brands to prove it.

**/brand/apply** — Two-step form, functional, connected to Supabase. Needs conversion audit (Agent G in Phase 1 work order).

**/portal/signup (business/apply)** — Needs same audit.

**Navigation** — Primary CTA ("Apply as brand") is brand-only. Reseller acquisition is deprioritized structurally.

**Footer** — Identical across pages. Phase 1 email fix applied. Needs a proper logo treatment and expanded links when the site grows.

---

# C. Missing / Weak / Incomplete Areas

## List 1 — Existing and strong

- Platform name (SOCELLE)
- Visual DNA: warm rosewood / amber gold palette (strong for beauty vertical)
- Playfair Display + Inter typography (functional, editorial)
- About page problem framing and principles copy
- Pricing page economics and FAQ
- Comparison table (Home page)
- Four-portal platform architecture
- Tiered pricing system (Active / Elite / Master)
- Brand application form (functional, Supabase-connected)
- Design system (tokens, shadows, accessibility)
- Phase 1 fixes: email, stats, testimonials, meta, Insights cleanup

## List 2 — Existing but weak or incomplete

- Homepage hero sub-headline (category description, not value proposition)
- Tagline ("Professional beauty, one platform" — accurate but not ownable)
- Testimonials section (removed — needs real quotes)
- Stats bar (replaced with pre-launch language — needs real data over time)
- Insights page (placeholder content, needs editorial or gating)
- Team section on About (empty placeholder)
- Brands browse page (functional but empty without real data)
- Nav CTA hierarchy (brand-only, ignores reseller acquisition)
- index.html meta tags (updated in Phase 1, but per-page SEO via react-helmet-async is partial)
- Favicon (interim SVG created in Phase 1 — needs real logomark)
- OG image (placeholder SVG created — needs designed asset)
- Package.json name (still "vite-react-typescript-starter")
- CURSORRULES color system (unresolved conflict with current site)

## List 3 — Missing but required

- Real logomark and brand icon
- Resolved canonical color system (one palette, one decision)
- Real brand content (3-5 onboarded brands minimum before launch)
- Real social proof (1-2 genuine testimonials minimum)
- Professional domain email (hello@socelle.com confirmed, DNS/inbox needed)
- OG image (designed asset)
- Per-page SEO coverage (react-helmet-async applied to all public pages)
- /for-brands page (dedicated brand acquisition page)
- /for-buyers page (dedicated reseller acquisition page)
- /how-it-works page
- Vertical landing pages (/spa, /medspa, /salon)
- Middle-of-funnel capture (waitlist or brand guide for interested-but-not-ready brands)
- Reseller verification explainer
- DEBVAI / SOCELLE relationship definition
- Next.js marketing site (planned rebuild)
- Brand identity package (logo files, color swatch, typography specimen)

## MVP Must-Build List

1. Resolve Phase 0 decisions (color, architecture, typography, CTA destination)
2. Complete Phase 1 fixes (in progress)
3. Onboard 3-5 real brands with real storefronts
4. Get 2 real testimonials (one brand, one buyer)
5. Next.js marketing site with resolved visual system
6. /for-brands page
7. /for-buyers page
8. Real logomark and OG image
9. Audit and optimize /brand/apply conversion
10. Professional domain email active

## Secondary Launch List

1. /how-it-works page
2. /spa vertical landing page
3. /medspa vertical landing page
4. Insights page with real editorial content
5. Team section on About
6. Waitlist/brand guide middle-of-funnel capture
7. Reseller verification explainer
8. Per-page SEO fully deployed

## Post-Launch Enhancement List

1. /salon and /wellness vertical pages
2. /hospitality vertical page
3. Loyalty and net-30 terms (Phase 2 platform feature)
4. Education layer (Phase 2 platform feature)
5. Brand guide / co-branded asset library
6. Blog / content engine for SEO authority
7. Market intelligence product
8. Shopify integration for brand fulfillment
9. Socelle Academy (Phase 2+)

---

# D. Brand Positioning Foundation

## Mission

To rebuild the commerce infrastructure between professional brands and the licensed businesses that bring their products to life — starting where that infrastructure is most broken: professional beauty.

## Vision

The platform where every verified professional brand has a direct wholesale channel to its best buyers, and every licensed professional buyer has one intelligent place to discover, source, and manage every brand they carry.

## Purpose

Professional buyers and brands have been doing business through phone calls, PDF price lists, and scattered portals for decades. Not because that's efficient — because nothing better existed. SOCELLE builds what should have always been there.

## Promise

To brands: a verified wholesale channel that works harder than a sales rep and costs nothing until it performs.
To buyers: one platform that replaces six portals, knows your tier, and makes reorder frictionless.
To both: transparency, alignment, and commercial infrastructure worthy of the quality of the brands and businesses on it.

## Value Proposition

**For professional brands:**
Sell wholesale to verified licensed businesses through a single branded storefront. Set your own tier pricing, manage your catalog, receive orders directly, and see your reseller network in real time — on commission, with no monthly fees.

**For licensed professional buyers:**
Discover and order from hundreds of verified professional brands — with your tier pricing, one cart, one checkout, and one order history. Free forever. No minimums.

**Platform-level:**
SOCELLE is the commerce layer professional beauty has been waiting for. Verified on both sides. Aligned on economics. Built for the way this industry actually works.

## Brand Pillars

**1. Vertical authority**
We are not a general marketplace. We are built for professional markets — and in those markets, specificity is expertise. We earn trust by understanding how this industry works, not just that it exists.

**2. Mutual alignment**
We succeed when brands grow wholesale accounts and buyers grow retail revenue. Our commission model is the structural expression of that alignment — we only earn when both sides win.

**3. Verified trust**
Every brand is reviewed. Every buyer is a licensed professional. The platform is only as valuable as the quality of what's on it, so we are selective by design.

**4. Commercial clarity**
Simple economics, transparent terms, no hidden fees. The beauty industry already has enough opacity. SOCELLE doesn't add to it.

**5. Platform intelligence**
As the platform grows, it gets smarter — about which brands perform with which buyer types, which categories are growing, and where the market is moving. That intelligence flows back to every participant.

## Differentiators

- The only wholesale marketplace purpose-built for professional beauty (vs. general wholesale like Faire)
- One cart, one login for all brands (vs. individual brand portals)
- Verified on both sides — brands are reviewed, buyers are licensed (vs. open directories)
- Commission-only model with no monthly fees (vs. subscription-based platforms)
- Tiered pricing (Active / Elite / Master) that gives brands meaningful partner economics (vs. flat wholesale)
- Built with the treatment room as the organizing logic, not general retail (vs. mass-market wholesale)

## Market Opportunity Statement

The professional beauty industry generates over $80 billion annually in North America. The wholesale layer — how brands reach licensed professionals — still operates largely on personal relationships, manual ordering, and fragmented systems. No purpose-built B2B commerce platform has established category leadership. The infrastructure gap is real, the timing is right, and the category is growing.

## Why Now

Three forces converging: (1) indie professional beauty brands have proliferated in the last decade and lack the distribution infrastructure that legacy brands built over decades; (2) professional service businesses are growing and buying more product with fewer dedicated reps to service them; (3) B2B commerce infrastructure has matured enough (Stripe Connect, Supabase, modern React frameworks) that a small team can build what previously required enterprise budgets.

## Why Us

We are not outsiders guessing at a problem. This platform is built by people who know the professional beauty industry from the inside — the supply chain, the buying relationships, the gaps that have existed for years. The product reflects that fluency in every feature decision.

## What Category We Own

**Professional commerce platform** — specifically, the B2B wholesale layer for professional service industries, with beauty as the launch vertical and adjacent professional categories as the expansion path.

We do not compete with Shopify (which serves DTC, not B2B wholesale). We do not compete with Faire (which serves general retail, not professional services). We are building a category that does not yet have a dominant player.

## What We Should Never Sound Like

- Generic SaaS: "streamline your workflow," "unlock growth," "scale your business"
- Low-end wholesale directory: "find cheap product," "bulk discounts," "connect with suppliers"
- Generic beauty brand: "glow," "transform," "elevate your routine"
- Overconfident launch-stage startup: "we're revolutionizing," "disrupting," "changing everything"
- Cold enterprise software: clinical, jargon-heavy, feature-list-driven

---

# E. Customer + Market Strategy

## Primary Customer Segments

### Supply Side — Professional Brands

**Profile:** Independent to mid-tier professional beauty brands ($500K–$50M revenue), selling to professional accounts through a mix of sales reps, brand portals, and industry distributors. Typically 20–200 SKUs across professional and/or retail lines.

**Current state:** Managing wholesale manually or through rudimentary tools. Often using Shopify B2B or a custom portal that costs time and money to maintain. Frustrated by visibility gaps — they don't know who's carrying them, what's moving, or which accounts need attention.

**What they need from SOCELLE:** A branded wholesale storefront that reflects their quality. Tiered pricing they control. Orders that flow without reps. Analytics on reseller activity. A curated buyer base that actually moves product.

### Demand Side — Licensed Professional Service Businesses

**Profile:** Salon owners, spa directors, medspa operators, and wellness business owners ($300K–$10M revenue) with 1–15 treatment rooms or chairs. Licensed to purchase professional-grade product. Sourcing from 3–10 brands simultaneously.

**Current state:** Logging into multiple brand portals, sending emails or texts to reps, manually tracking orders, forgetting to reorder until they've run out, missing new brand discovery entirely because discovery is passive.

**What they need from SOCELLE:** One login, one cart. Easy reorder. Access to brands they haven't discovered yet. Wholesale pricing that reflects their relationship level without having to negotiate it every time.

## Secondary Customer Segments

- **Medical aesthetics practices** (dermatology offices, plastic surgery practices) — high value, clinical product requirements, need for supply chain reliability over aesthetics
- **Hospitality wellness** (hotel spas, resort wellness centers) — high volume, standardization requirements, often operating under a parent brand
- **Independent estheticians** operating out of suites or co-working spaces — lower volume but high loyalty, often the most brand-educated buyers on the platform

## Buyer Personas

### The Brand Builder (Supply Side)

Sarah, 42. Founder and CEO of an 8-year-old professional skincare brand with 45 SKUs. Revenue: $3.2M. Distribution: 180 wholesale accounts, managed by a team of 2 sales reps and herself. Pain: her best accounts reorder through reps, but 40% of accounts are dormant. She has no visibility into why, no easy way to reach them, and no tools to reward her top performers. She's evaluated Faire but it doesn't fit professional. She's considered building her own portal but can't justify the dev cost.

What she needs to hear: "Your storefront. Your pricing. Your buyers. We just make the connection work."

### The Sales Director (Supply Side)

Marcus, 35. VP of Sales at a professional color brand. Manages 300 wholesale accounts across 12 states. His team spends 30% of their time on order logistics and account management that should be automated. He's accountable to a growth number, and fragmented distribution is making it harder to hit. He evaluates SOCELLE as infrastructure, not as a brand play.

What he needs to hear: "Your accounts order directly. Your team sees everything in real time. Your rate doesn't start until you sell."

### The Spa Director (Demand Side)

Jennifer, 38. Owns a 6-treatment-room day spa with $1.1M in annual revenue. She's the buyer, the director, and the head esthetician. She sources from 7 brands, each through a different channel. She made a brand switch last year specifically because the ordering process was too complicated. She doesn't have time to discover new brands the old way — trade shows and cold emails.

What she needs to hear: "Every brand you carry, every brand you're about to discover — one place, one cart."

### The Medspa Operator (Demand Side)

David, 44. Operates two medspas with a medical director on staff. Purchases are driven by clinical protocol requirements and margin optimization. He doesn't browse for fun — he buys what his estheticians are trained to use and he needs reliable supply. He's skeptical of new platforms because switching costs are real in his operation.

What he needs to hear: "Verified brands. Your tier pricing. Reliable supply. No new complexity."

## Decision Makers vs. Influencers

**Brands:** Decision made by founder/CEO (small brands) or VP Sales (larger brands). Influenced by marketing director (brand presentation), finance (economics), and operations (fulfillment logistics).

**Buyers:** Decision made by owner/director (most businesses). Influenced by lead esthetician (product quality), retail manager (brand selection), and bookkeeper (cost management).

## Key Objections

**Brand side:**
- "We already have a portal" → Yours serves existing accounts. SOCELLE finds new ones and makes reorders frictionless for all of them.
- "What's the commission?" → Applied only at transaction. No monthly fee. See your rate when you apply.
- "We have reps" → SOCELLE augments reps, it doesn't replace them. It handles routine reorders so reps can focus on relationships.
- "We don't know if our buyers are on here" → They aren't yet — that's the point. Curated onboarding builds the buyer base the platform earns.

**Buyer side:**
- "I already have relationships with my brands" → Those relationships still exist. SOCELLE just handles the ordering so you stop logging in to six separate portals.
- "What if my brand isn't on here?" → We're onboarding brands now. Tell us who you buy from and we'll prioritize them.
- "Is this going to cost me more?" → Free forever for licensed businesses. Your tier pricing is set by the brand.
- "I'm not sure I'm verified" → If you hold a cosmetology, esthetics, or similar professional license, you qualify. Approval same day.

## Purchase Triggers

**Brands:** Being told about SOCELLE by a peer brand, frustration with current portal maintenance costs, losing an account due to ordering friction, being approached by a sales rep who recommends the platform.

**Buyers:** Running out of product because reordering was too hard, being told by a brand rep that they're on SOCELLE now, finding SOCELLE while searching for a specific brand or product category, seeing a peer business mention it.

## What Each Audience Needs to Hear

**Brands:** Credibility first, then economics, then ease. They are evaluating whether to give SOCELLE a piece of their wholesale revenue. They need to trust the platform before they care about the commission rate.

**Buyers:** Ease first, then breadth, then price. They are evaluating whether to change a sourcing habit. The cost of change has to feel lower than the cost of staying the same. Make it feel effortless.

---

# F. Category Strategy

## Options Analysis

### Wholesale Marketplace
**Pros:** Understood by buyers. Low explanation needed. Matches intent-based search.
**Cons:** Positions against Faire and Amazon Business. "Marketplace" connotes generality. Doesn't signal the intelligence layer.
**Premium perception:** Medium
**SEO impact:** High (high-volume terms)
**Buyer perception:** Familiar but may trigger Faire comparison
**Brand perception:** Familiar but may imply they're one of many
**Investor perception:** Large TAM, but "another marketplace" framing
**Verdict:** Use in secondary descriptions, not primary positioning

### Professional Sourcing Platform
**Pros:** Signals B2B specificity. "Sourcing" connotes expertise and process.
**Cons:** Can read as procurement software. Less immediate.
**Premium perception:** Medium-high
**SEO impact:** Medium (emerging category terms)
**Verdict:** Strong secondary frame for SEO and category copy

### Trade Platform
**Pros:** Premium connotation (used in fashion, interior design). Signals professional-only access.
**Cons:** Associated with trade discounts rather than full commerce. Less understood in beauty.
**Premium perception:** High
**Verdict:** Consider as secondary descriptor, especially for hospitality vertical

### Procurement Intelligence Platform
**Pros:** Enterprise-grade signal.
**Cons:** Cold, corporate, wrong register for beauty. Implies complexity.
**Verdict:** Reject for primary positioning

### Brand Discovery Platform
**Pros:** Clear, accessible.
**Cons:** Discovery is passive. Doesn't capture commerce, ordering, or relationship management.
**Verdict:** Useful as a feature description, not a platform position

### Professional Commerce Platform ← RECOMMENDED
**Pros:** "Commerce" captures the full transactional layer — discovery, ordering, payment, analytics. "Professional" signals B2B, licensed, verified. "Platform" implies infrastructure, not just a directory. Scales across categories without sounding generic. Carries investor-friendly framing without over-indexing on scale.
**Cons:** Slightly more abstract than "marketplace" — requires a sentence to land for unfamiliar audiences.
**Premium perception:** High
**SEO impact:** Medium (build the category term, don't chase existing volume)
**Buyer perception:** "This is where I come to do business, not browse"
**Brand perception:** "This is infrastructure, not an ad platform"
**Investor perception:** "Platform company with clear expansion logic"
**Verdict:** Primary positioning at the parent-brand level

### Platform-Level Headline to Own:
**"The professional commerce platform for beauty and wellness."**
— At launch, add the vertical qualifier. Over time, drop it as the category expands.

---

# G. Website Architecture

## Sitemap — Marketing Site (Next.js rebuild)

```
/ (Home)
  → /for-brands
  → /for-buyers
  → /how-it-works
  → /pricing
  → /about
  → /insights
  → /brands (browse — connects to platform)
  → /brand/apply (application — connects to platform)
  → /join (reseller signup — connects to platform)
  → /contact
  → /privacy
  → /terms

/solutions/ (optional at launch, required at 90 days)
  → /solutions/spa
  → /solutions/medspa
  → /solutions/salon
  → /solutions/wellness
  → /solutions/hospitality (Phase 2)
```

## Platform Portals (existing React app — unchanged in architecture)

```
/portal/* (Business/reseller)
/brand/* (Brand)
/admin/* (Admin)
```

## Page-by-Page Architecture

### / (Home)
**Purpose:** Platform authority. Earn trust from both brand and buyer audiences.
**Primary audience:** Cold traffic — both sides
**Funnel role:** Top of funnel → direct to /for-brands or /for-buyers
**CTA path:** Primary: "Apply as a brand" + "Join as a buyer" (dual CTA)
**Trust blocks:** Comparison table, principles, number of verified brands (when real)
**Proof blocks:** Real testimonials (when available), brand logos
**SEO role:** Brand terms, primary category keywords
**Universal or vertical:** Universal — no beauty-specific language in hero

### /for-brands
**Purpose:** Convert brand applications
**Primary audience:** Brand decision-makers
**Funnel role:** Mid-funnel conversion
**CTA path:** "Apply now" → /brand/apply
**Trust blocks:** Economics (92/8), review timeline, peer brand logos
**Proof blocks:** Brand testimonial, sample storefront screenshot
**SEO role:** "wholesale marketplace for beauty brands," "sell wholesale to salons"

### /for-buyers
**Purpose:** Convert reseller signups
**Primary audience:** Spa directors, salon owners, medspa operators
**Funnel role:** Mid-funnel conversion
**CTA path:** "Create free account" → /portal/signup
**Trust blocks:** "Free forever," verification explainer, brand count
**Proof blocks:** Buyer testimonial, sample order experience
**SEO role:** "professional beauty wholesale," "spa product wholesale"

### /how-it-works
**Purpose:** Reduce friction for both audiences
**Primary audience:** Warm traffic evaluating the platform
**Funnel role:** Mid-funnel trust
**CTA path:** Split → brand or buyer path depending on reader
**Trust blocks:** Step-by-step flow, verification explanation
**Proof blocks:** Platform screenshots

### /pricing
**Purpose:** Economics transparency — convert undecided brands
**Primary audience:** Brands evaluating commission model
**Funnel role:** Late-funnel
**CTA path:** "Apply as a brand"
**Trust blocks:** "No monthly fee," "no setup cost," payout timeline
**Proof blocks:** "Most competitive commission in professional wholesale"
**SEO role:** "beauty wholesale platform pricing," "wholesale marketplace commission"

### /about
**Purpose:** Founder credibility, mission authority
**Primary audience:** Anyone doing due diligence
**Funnel role:** Trust-building
**CTA path:** "Apply" or "Browse brands"
**Trust blocks:** Team (when available), principles, problem framing
**Proof blocks:** Industry context, market evidence

### /solutions/spa, /solutions/medspa, /solutions/salon
**Purpose:** Vertical-specific conversion
**Primary audience:** That specific buyer type
**Funnel role:** Top/mid funnel SEO entry → conversion
**CTA path:** "Create free account"
**Trust blocks:** Category-specific language, relevant brands in category
**Proof blocks:** Buyer testimonial from that vertical
**SEO role:** Vertical-specific high-intent keywords

### /brand/apply
**Purpose:** Brand application conversion
**Critical note:** This is the most important conversion page on the site. It needs a strategic copy rewrite and conversion audit. See Section H.

### /join (or /portal/signup)
**Purpose:** Reseller signup
**Critical note:** Second most important conversion page. Needs same treatment.

---

# H. Full Website Copy System

## HOMEPAGE

**Page goal:** Establish platform authority. Earn trust from both brand and buyer audiences simultaneously. Direct each to their specific path.

**Primary audience:** Cold traffic, both sides

---

### Hero Section

**Eyebrow:** `Professional commerce platform`

**Headline options:**
1. "The professional beauty supply chain, rebuilt."
2. "Where verified brands meet their best buyers."
3. "Professional beauty deserves better infrastructure."
4. "One platform. Every professional brand. Every licensed buyer."
5. "The wholesale platform built for the treatment room."

**Recommended headline:**
> **The professional beauty supply chain, rebuilt.**

*Why:* It stakes a claim, not just a category. It implies the current state is broken (credibility — the About page proves this). It signals ambition without arrogance. It lands for both brands (who feel the fragmented distribution) and buyers (who feel the portal chaos). It positions SOCELLE as infrastructure, not a directory.

**Subheadline:**
> Socelle connects verified professional beauty brands with licensed salons, spas, and medspas — one platform, one cart, one wholesale relationship that works.

**Hero CTA (dual):**
- Primary button: `Apply as a brand →`
- Secondary button: `Browse brands`
- Below buttons, separator line: `Already have an account? · Reseller sign in · Brand sign in`

**Trust signal below CTAs:**
> Verified brands · Licensed buyers · Commission-only pricing

---

### Platform Split Section (For Brands / For Buyers)

**Eyebrow:** `Built for both sides`

**Section headline:**
> Two portals. One platform. Everyone wins.

**For Brands card:**

Headline: `For professional brands`
Subline: `Commission only · Pay when you sell`

Body:
> Sell wholesale to verified salons, spas, and medspas through a dedicated storefront that reflects your brand. Set your own tier pricing, manage your catalog, and receive orders directly — with no monthly fees and no setup cost.

Feature list:
- Branded wholesale storefront, built for your product line
- Tiered pricing (Active, Elite, Master) — reward your best partners
- Orders direct from your storefront to your team
- Brand analytics and reseller performance insights
- Direct messaging with buyers
- Applications reviewed within 2 business days

CTA: `Apply as a brand →`

**For Buyers card:**

Headline: `For licensed professionals`
Subline: `Free forever · Built for your workflow`

Body:
> Salons, spas, and medspas. Discover hundreds of professional beauty brands, get verified wholesale pricing for your tier, and reorder in seconds. All from one account, one cart, one checkout.

Feature list:
- Hundreds of professional beauty brands, all verified
- Your tier pricing — no negotiation required
- Multi-brand single checkout
- Order history and one-click reorder
- Direct messaging with brands
- Free to join — no credit card, no commitment

CTA: `Create free account →`

---

### Why SOCELLE Section

**Eyebrow:** `Why Socelle`

**Headline:**
> The only platform built for this vertical.

**Body:**
> Professional beauty is a specialty. The buyers are licensed. The brands are formulated for professional use. The relationships are long-term. General wholesale platforms weren't built for any of that. Brand portals solve one brand at a time. Socelle was built to solve the whole thing.

**Comparison table (keep from current site — it's working):**

| | General wholesale (e.g. Faire) | Brand portals | **Socelle** |
|---|---|---|---|
| | Not beauty-specific | Fragmented ordering | **Beauty-specific vertical** |
| | No tiered reseller pricing | Separate logins per brand | **Tiered wholesale pricing** |
| | No treatment room context | No cross-brand cart | **Multi-brand single checkout** |
| | Competing with every vertical | No reseller analytics | **Brand + reseller analytics** |

---

### How It Works Section

**Eyebrow:** `The platform`

**Headline:**
> Three steps. No complexity.

**Step 1 — Brands:**
Headline: `01 · Apply`
Body: Professional beauty brands apply and get reviewed. Approved brands set up their storefront, load their catalog, and configure tier pricing. Ready to sell in days, not months.

**Step 2 — Buyers:**
Headline: `02 · Discover`
Body: Licensed salons, spas, and medspas browse verified brands, get their tier pricing automatically, and add products to a single cart — across multiple brands in one checkout.

**Step 3 — Both:**
Headline: `03 · Grow`
Body: Brands see their wholesale accounts in real time. Buyers reorder in seconds. Orders flow directly. Both sides build the kind of wholesale relationships that used to require a full sales team.

---

### Social Proof Section (placeholder until real quotes available)

**Eyebrow:** `Early access`

**Headline:**
> Built with the people who know this industry.

**Body (when no testimonials available):**
> Socelle is currently in early access with a curated group of professional beauty brands and licensed businesses. We're onboarding with intent — reviewing every application so the platform earns its reputation for quality before it earns its reputation for scale.

**When real quotes are available, replace with standard testimonial grid.**

---

### Final CTA Section

**Eyebrow:** `Get started`

**Headline:**
> Where professional beauty moves.

**Body:**
> Join the marketplace built for professional beauty — as a brand or as a licensed professional. Early access is open now.

**Dual CTA:**
- `Apply as a brand →`
- `Browse brands`

---

## FOR BRANDS PAGE

**Page goal:** Convert brand applications. Answer every question a skeptical brand decision-maker has before they'll apply.

**Target audience:** Founders, VPs of Sales, Brand Managers at professional beauty brands

---

**Eyebrow:** `For professional brands`

**Hero headline:**
> Your wholesale channel. Rebuilt for how this industry works.

**Subheadline:**
> A dedicated storefront, verified buyers, and a commission model that means we only win when you do. No monthly fees. No setup cost. Apply in minutes.

**CTA:** `Apply as a brand →`
**Below CTA:** `No monthly fee · Applications reviewed within 2 business days · Commission-only pricing`

---

**Section: The problem we're solving for you**

> Most brands manage wholesale through a mix of reps, spreadsheets, and portals that take months to build and years to maintain. The accounts that order consistently get attention. The accounts that don't — stay dormant. And there's no single place where a new reseller can discover your brand, get their pricing, and place an order without a rep in the loop.
>
> Socelle is the missing infrastructure. Your storefront is live in days. Buyers find you, get their tier, and order directly. You see everything.

---

**Section: What you get**

Headline: `Your storefront. Your terms. Your data.`

Features with supporting copy:

**Branded wholesale storefront**
Your catalog, your pricing, your brand presentation — in a dedicated storefront that looks like yours, not like a marketplace listing.

**Tiered pricing you control**
Set Active, Elite, and Master tier pricing for your reseller accounts. Reward your top buyers with better rates. Every buyer sees their tier automatically.

**Orders that flow directly**
When a reseller orders, you receive the notification and fulfill from your existing inventory. No 3PL, no intermediary, no complexity.

**Analytics and reseller insights**
See which accounts are active, what's moving, and where reorder opportunity exists. The visibility that used to require a sales team.

**Direct messaging with buyers**
Communicate with your accounts through the platform — without needing their phone number, their email, or a rep in the middle.

**Verification badge**
Every brand on Socelle is reviewed and approved. Your badge signals to buyers that your brand meets the platform's professional standard.

---

**Section: The economics**

Headline: `Simple. Transparent. Aligned.`

> We charge a commission on completed orders. You pay nothing until you sell. There are no monthly fees, no setup costs, and no minimums. Apply to see your exact rate — it's not a negotiation, it's disclosed on approval.

Three-step flow:
1. Buyer places an order from your storefront at your tier price
2. You receive the order, fulfill and ship from your inventory
3. Socelle processes your payout via Stripe Connect when the order ships

**Economics highlight:**
> You receive the majority of each order value. Socelle retains a single-digit platform commission. Full rate disclosed on application approval.

**CTA:** `Apply to see your rate →`

---

**Section: FAQ for brands**

Q: How quickly can I get my storefront live?
A: After approval, most brands have their storefront live within 3-5 business days. We provide an onboarding wizard that walks you through catalog setup, pricing configuration, and storefront presentation.

Q: Do I need to give up my existing wholesale accounts?
A: No. Your existing accounts can be migrated to your Socelle storefront — they'll order through the platform instead of through separate portals or email. Nothing changes about your relationship with them.

Q: What does "commission-only" actually mean?
A: You pay a platform commission on each completed order. Zero monthly fees, zero setup costs, zero minimums. Your exact rate is disclosed at application approval.

Q: What if I already have a Shopify B2B portal?
A: Many brands run both in parallel during onboarding. Shopify integration is on our near-term roadmap. Apply now to secure your storefront — migration tools are coming.

Q: Who is a "verified reseller" on Socelle?
A: Licensed salons, spas, and medspas who have completed our business verification process. Every buyer is a licensed professional — not a retail consumer or gray-market reseller.

Q: Is there a contract or minimum commitment?
A: No contracts, no lock-in. Brands can deactivate their storefront at any time. We earn only when transactions happen.

---

## FOR BUYERS PAGE

**Page goal:** Convert reseller signups. Reduce friction. Make the platform feel like it was built for them specifically.

**Target audience:** Spa directors, salon owners, medspa operators

---

**Eyebrow:** `For licensed professionals`

**Hero headline:**
> Every brand you carry. Every brand you should. One place.

**Subheadline:**
> Salons, spas, and medspas — create a free account to browse verified professional brands, get your wholesale pricing, and order across multiple brands in a single checkout.

**CTA:** `Create free account →`
**Below CTA:** `Free forever · No credit card required · Licensed businesses only`

---

**Section: The problem we're solving for you**

> You're carrying six brands. Six portals. Six order histories. Six sets of rep relationships. And when you run out of something on a Tuesday, the fastest path is a text message that may or may not get answered before Friday.
>
> You also don't have time to discover new brands. Trade shows are twice a year. Reps are infrequent. Instagram is full of DTC noise. So you stick with what you know, even when something better exists.
>
> Socelle fixes both of those things at once.

---

**Section: What you get**

Headline: `One account. Every brand you need.`

**Hundreds of verified professional brands**
Every brand on Socelle has been reviewed and approved. No gray market, no mass brands in professional packaging — just the brands built for professional service environments.

**Your tier pricing, automatically**
Your wholesale pricing reflects your relationship with each brand — Active, Elite, or Master. No negotiation, no asking your rep. Log in and your price is your price.

**Multi-brand single checkout**
Order from 6 brands in one cart. One checkout. One payment. One order confirmation. One less reason for the reorder to not happen.

**Order history and one-click reorder**
Your full order history lives here. When you're ready to reorder, you're one click from done.

**Direct messaging with brands**
Questions about a product? Want to know about a new launch? Message the brand directly through the platform — no hunting for email addresses.

**Free forever**
Creating an account, browsing brands, and ordering is free for licensed professionals. Always. The brands absorb the platform cost.

---

**Section: Who qualifies?**

Headline: `Built for licensed professionals.`

> Socelle is built exclusively for licensed service businesses — salons, spas, medspas, wellness centers, and other professional environments. To complete your account, you'll be asked to verify your business license or professional credentials. Approval is typically same-day.
>
> If you're a licensed cosmetologist, esthetician, medical aesthetics provider, or similar professional running a service business — you qualify.

**Verification FAQ:**
Q: What documentation is required?
A: Your business license, cosmetology/esthetics license, or medical facility registration — whatever is applicable to your business type and state.

Q: How long does verification take?
A: Most accounts are approved same business day. You can browse brands while you wait.

Q: What if I have multiple locations?
A: Create one account for your primary location, then contact us to add additional locations under the same account. Multi-location tools are on our roadmap.

---

## ABOUT PAGE

**Keep the existing strong copy. Restructure and add to it.**

**Hero headline (keep):**
> The professional beauty supply chain is broken.

**Hero body (tighten):**
> Distribution is fragmented. Resellers juggle multiple portals; reorders are manual; education is disconnected from commerce, and brand visibility is scarce. We built Socelle to change that — one marketplace, built exclusively for professional beauty.

**Problem section (keep — it's the best copy on the site)**

**"What we're building" section (keep + tighten):**

Headline: `Wholesale commerce. Built for this vertical.`

Body (revised):
> Phase 1 is the foundation: a clean, verified wholesale marketplace where professional beauty brands sell directly to licensed resellers — with tiered pricing, order management, and direct messaging built in. Phase 2 adds education. Phase 3 adds marketing tools. The sequence is intentional. We build the commerce layer first because everything else depends on the commerce relationship.

**Team section — replace placeholder with:**

Option A (if no bios available yet):

Headline: `Built by people who know this industry.`

Body:
> Socelle is built by a founding team with direct experience in professional beauty distribution, B2B commerce infrastructure, and the specific problems this platform solves. We're not outsiders analyzing a market opportunity. We know this supply chain because we've worked in it.
>
> Team profiles and backgrounds available on request — we're focused on the build right now.

Option B (when bios are ready — use this structure):
Name · Title · One sentence of relevant credential · One sentence of what they're building at Socelle

---

## PRICING PAGE

**Keep the existing structure — it's working. Rewrite key sections:**

**Hero headline (rewrite):**
> Simple economics. No catch.

**Hero body (rewrite):**
> Brands pay a single platform commission on completed orders — nothing until you sell. Licensed professionals join and order free, forever. Apply or create an account to see your terms.

**"How it works" headline (rewrite):**
> The economics, plainly.

---

## BRAND APPLICATION PAGE (/brand/apply)

**Current state (from Agent G audit):** Two-step form (Brand Info → Account Creation). Functional, connected to Supabase. Review note: 2 business days.

**What it needs:**

Replace the current header with a proper conversion page opening:

**Current headline:** `Apply to join Socelle.`

**Replace with:**
**Headline:** `Apply to list your brand on Socelle.`
**Subheadline:** `Tell us about your brand. We review every application within 2 business days. Commission-only — no fees until you sell.`

**Trust bar below form (add):**
> ✓ No monthly fees · ✓ Commission-only · ✓ Reviewed within 48 hours · ✓ Secure — powered by Stripe

**Step 1 label (keep):** `Brand Info`
**Step 2 label (keep):** `Your Account`

**Add to step 2, below the form:**

> By creating an account you agree to Socelle's [Terms of Service] and [Privacy Policy]. Your application will be reviewed within 2 business days. You'll receive an email at the address above when your storefront is approved.

**Application received page (review `/brand/apply/received`):**

If not already present, the confirmation should include:
- What happens next (review timeline)
- What to do while you wait (explore the platform, prepare your catalog)
- How to reach someone with questions (hello@socelle.com)
- No reference to timelines that can't be honored

---

## NAVIGATION

**Current labels:** Browse brands · Pricing · Insights · About

**Recommended labels (revised):**
- `Brands` (keep — direct, understood)
- `For Brands` (replaces or supplements current brand-facing copy)
- `Pricing` (keep)
- `About` (keep)

**Nav primary CTA (revise from brand-only):**

Desktop — two options:
- `Apply as a brand` (brand side)
- `Join free` (buyer side — add as secondary button or dropdown)

Or: single CTA `Get early access` that opens a path selector (brand vs. buyer).

The current single "Apply as brand" CTA in the nav is the most structurally damaging conversion issue on the site. Every reseller who visits the homepage sees a CTA that isn't for them before they find their path.

**Footer navigation (expand):**

```
For Brands     For Buyers     Company
Apply          Join free      About
How it works   Browse brands  Pricing
Insights       Insights       Contact
               FAQ            Privacy · Terms
```

---

## METADATA — All Public Pages

*(react-helmet-async applied in Phase 1 — these are final recommended values)*

| Page | Title | Meta Description |
|---|---|---|
| Home | Socelle — Professional Beauty Wholesale | The professional beauty wholesale marketplace. Licensed salons, spas, and medspas discover and order from verified brands. One platform, one cart. |
| For Brands | For Brands — Socelle Professional Beauty Wholesale | Sell wholesale to verified salons, spas, and medspas. Commission-only storefront for professional beauty brands. Apply in minutes. |
| For Buyers | For Licensed Professionals — Socelle | Browse professional beauty brands and order at wholesale pricing. Free forever for licensed salons, spas, and medspas. |
| Pricing | Pricing — Simple and Transparent | Socelle | Commission-only for brands. Free forever for resellers. No monthly fees, no minimums, no lock-in. Professional beauty wholesale. |
| About | About Socelle — Built for Professional Beauty | Socelle is rebuilding the professional beauty supply chain. One verified wholesale marketplace for brands, salons, spas, and medspas. |
| Insights | Professional Beauty Insights — Socelle | Professional beauty intelligence: ingredients, treatment room trends, and market shifts curated for salons, spas, and medspas. |
| Brands | Browse Professional Beauty Brands — Socelle | Discover verified professional beauty brands offering wholesale pricing to licensed salons, spas, and medspas. |

---

# I. Messaging Architecture

## One-Line Positioning Statement

> The professional commerce platform for beauty and wellness.

## Short Pitch (2 sentences)

> Socelle is the wholesale marketplace purpose-built for professional beauty. One platform where verified brands sell directly to licensed salons, spas, and medspas — commission-only for brands, free forever for buyers.

## Medium Pitch (1 paragraph)

> The professional beauty supply chain still runs on phone calls, PDF price lists, and scattered portals — not because it works, but because nothing better existed. Socelle is that something better: a verified wholesale marketplace where professional beauty brands sell directly to licensed buyers, buyers order across all their brands in one cart, and both sides build relationships with real data behind them. Commission-only for brands. Free forever for buyers. No middlemen, no fragmentation, no monthly fees until the platform earns them.

## Long Pitch (3 paragraphs — for pitch decks and media)

> The professional beauty industry generates over $80 billion annually in North America, and the wholesale layer — how brands reach the licensed salons, spas, and medspas that use and resell their products — is still operated largely through personal relationships, manual ordering, and technology from the previous decade. Fragmented distribution. Dormant accounts. No visibility. Reorders that don't happen because the process is too hard.

> Socelle is rebuilding that layer. A verified wholesale marketplace where professional beauty brands get a direct storefront, tier-based pricing controls, and real-time analytics on their reseller accounts — and where licensed service businesses get one platform to discover, order from, and communicate with every brand they carry. Both sides are verified. Economics are transparent. The platform earns only when transactions happen.

> We are starting with professional beauty because the problem is most acute and the opportunity is most immediate there. The platform architecture is built to expand across adjacent professional trade categories — the same fundamental infrastructure problem exists in professional wellness, hospitality, and eventually further. But we are not a general marketplace. We are building vertical authority first, and we are starting where we know the industry best.

## Tagline Directions

**Direction 1 — Infrastructure framing:**
> "Professional commerce, built right."
> "The commerce layer professional beauty deserved."
> "Built for the way professional beauty works."

**Direction 2 — Connection framing:**
> "Where professional brands meet their best buyers."
> "Every brand. Every buyer. One place."

**Direction 3 — Problem-solution framing:**
> "The professional beauty supply chain, rebuilt."
> "Better than portals. Better than reps. Better than the way it's always been."

**Direction 4 — Platform authority framing:**
> "Professional beauty's commerce infrastructure."
> "The platform professional beauty runs on."

**Recommended direction for testing:**
> **"Built for the way professional beauty works."**

It's specific (professional beauty), credible (implies industry knowledge), and differentiating (implies others weren't built this way). It also scales — swap "beauty" for any vertical as the platform expands.

**Current tagline assessment:**
"Professional beauty, one platform" — keep as a descriptive tagline for the footer. Replace in hero and marketing contexts with the recommended direction.

## Vocabulary to Use

- Professional · Licensed · Verified · Wholesale · Tier · Commerce · Platform
- Treatment room · Reseller · Storefront · Catalog · Buyer · Account
- Direct · Transparent · Commission · Payout · Aligned
- Curated · Exclusive · Purpose-built · Vertical
- Discover · Source · Reorder · Manage

## Vocabulary to Ban

- Streamline / Optimize / Leverage / Unlock / Scale / Transform (generic SaaS verbs)
- Revolutionize / Disrupt / Game-changer / Next-level (launch-stage hyperbole)
- Glow / Transform your routine / Elevate your beauty (consumer beauty copy)
- Solution / Ecosystem / Best-in-class / World-class (corporate filler)
- Cheap / Discount / Bulk / Low prices (mass wholesale signals)
- AI-powered / Smart / Intelligent (only if the feature actually exists in context)
- Partners / Clients (use "brands" and "buyers" or "resellers" specifically)

## Tone-of-Voice Rules

1. **Direct over clever.** Say what the thing does. If a line can be tighter, cut it.
2. **Specific over broad.** "Salons, spas, and medspas" over "service businesses."
3. **Earned authority over claimed authority.** Show the problem before claiming the solution.
4. **Industry-fluent, not industry-heavy.** Use professional beauty language naturally — not as name-dropping.
5. **No superlatives without evidence.** "The only platform built for this vertical" is a claim we can back. "The best wholesale platform" is not.
6. **Premium through restraint.** Expensive things don't over-explain themselves.
7. **Confident but not arrogant.** "We're building this" not "we've already won."

## Parent Brand vs. Vertical Messaging

**Parent brand language (platform-level):**
> "Professional commerce platform" · "Verified wholesale" · "Licensed buyers" · "Professional supply chain"

*Use on:* Homepage hero, About page hero, investor/press materials, any page that may serve non-beauty verticals in the future

**Beauty/wellness vertical language:**
> "Professional beauty" · "Treatment room" · "Skincare · Haircare · Wellness" · "Salons, spas, and medspas"

*Use on:* /for-buyers, /for-brands, /solutions/spa, /solutions/medspa, /solutions/salon, email campaigns, brand outreach

**Rule:** Never use vertical language as the brand's primary self-description at the platform level. The hero of the homepage should always use platform language. Vertical specificity lives one click deeper.

---

# J. Visual Direction + Color Palette

## Brand Personality Keywords

Precise · Editorial · Authoritative · Warm · Intelligent · Professional · Understated premium

**Not:** Soft · Luxury · Clinical · Trendy · Corporate · Playful

## Design Principles

1. **Restraint signals quality.** Fewer elements, more intentional. Negative space is not empty — it's deliberate.
2. **Typography does the work.** The palette and type system should be strong enough that the design works without photography.
3. **Premium through specificity.** Every visual decision should feel like it was made for this vertical, not borrowed from a template.
4. **No SaaS blue.** No startup green. No legacy enterprise gray. The palette must signal that this platform understands the industry it serves.
5. **Functional beauty.** The design should be beautiful in the way a well-made professional tool is beautiful — through fit, proportion, and material, not decoration.

## Color System — Final Recommendation

**Resolve the conflict between the current site (rosewood navy / amber gold) and the CURSORRULES (deep sage / warm brass) as follows:**

### Recommended decision:

**Adopt the CURSORRULES palette as the canonical platform/parent brand system.**

The rosewood navy (#8C6B6E) of the current site is genuinely beautiful, but it is a warm pink-purple that reads specifically as professional beauty/feminine wellness. As a platform that must expand into medspa, hospitality, and adjacent professional categories, a sage-anchored palette carries more cross-category authority.

The deep sage / warm brass system reads premium and professional across all the target verticals without signaling a single category. It is the stronger platform-level choice.

**Preserve the rosewood navy as the beauty/wellness vertical accent color.** When building /solutions/spa, /solutions/medspa, and beauty-specific content, the rosewood-gold palette can serve as the visual language of the beauty vertical layer — giving the brand a meaningful visual distinction between platform and vertical.

---

### Platform Color System (Primary)

```
--background:      #FAFAF8    /* Warm off-white — site background */
--surface:         #F4F2EF    /* Card backgrounds */
--surface-raised:  #FFFFFF    /* Elevated cards, modals */
--border:          #E8E5DF    /* Dividers, input borders */
--border-hover:    #D4D0C8    /* Interactive borders */

--text-primary:    #1A1A1A    /* Headlines, primary body — near-black */
--text-secondary:  #6B6560    /* Secondary body, captions */
--text-tertiary:   #9C968F    /* Labels, metadata */

--accent:          #2D5A4E    /* Deep sage — primary brand CTA color */
--accent-soft:     #D6E5DF    /* Sage tint — backgrounds, tags */
--accent-hover:    #3D7A6A    /* Sage on hover */

--warm:            #C4956A    /* Warm brass — premium accent, badges */
--warm-soft:       #F0E6D8    /* Warm glow — gradient use */

/* Dark sections */
--dark-bg:         #141413
--dark-surface:    #1E1E1C
--dark-text:       #F4F2EF
--dark-accent:     #C4956A    /* Warm brass on dark backgrounds */
--dark-muted:      #8A847C
```

### Beauty/Wellness Vertical Accent (Secondary — vertical pages only)

```
--beauty-primary:  #8C6B6E    /* Rosewood — beauty vertical primary */
--beauty-accent:   #D4A44C    /* Amber gold — beauty vertical accent */
--beauty-bg:       #F5F3F0    /* Warm ivory — beauty vertical background */
```

### Accessibility

- `--accent` (#2D5A4E) on `--background` (#FAFAF8): contrast ratio 7.4:1 — WCAG AAA ✓
- `--text-primary` (#1A1A1A) on `--background` (#FAFAF8): contrast ratio 17.8:1 — WCAG AAA ✓
- `--warm` (#C4956A) on `--dark-bg` (#141413): contrast ratio 5.2:1 — WCAG AA ✓ (large text)
- `--text-secondary` (#6B6560) on `--background` (#FAFAF8): contrast ratio 5.1:1 — WCAG AA ✓

## Typography System

**Adopt the CURSORRULES recommendation:**

```
--font-display:  'Instrument Serif', serif        /* Headlines */
--font-body:     'Satoshi', 'DM Sans', sans-serif  /* Body, UI */
--font-mono:     'JetBrains Mono', monospace       /* Code, data */
```

**Why Instrument Serif over Playfair Display:**
Instrument Serif is more contemporary, more editorial, and does not carry the "luxury spa menu" association that Playfair has accumulated over the last decade of being the default choice for beauty brands. It has the same serif authority with less categorical specificity.

**Why Satoshi over Inter:**
Inter is an excellent utility font but it reads as "tech startup." Satoshi has geometric proportions with more character — it reads professional and premium without reading clinical.

**Typography scale:**
```
Display XL:  72–96px, Instrument Serif, weight 400, tracking -0.02em, lh 1.05
Display LG:  56–72px, Instrument Serif, weight 400, tracking -0.02em, lh 1.08
Display MD:  40–48px, Instrument Serif, weight 400, tracking -0.02em, lh 1.1
Display SM:  32–40px, Instrument Serif, weight 400, tracking -0.015em, lh 1.15
H2:          28–32px, Instrument Serif, weight 400, lh 1.2
H3:          20–24px, Satoshi, weight 600, lh 1.3
Body LG:     18px, Satoshi, weight 400, lh 1.65, max-width 65ch
Body:        16px, Satoshi, weight 400, lh 1.65, max-width 65ch
Body SM:     14px, Satoshi, weight 400, lh 1.6
Label:       11–12px, Satoshi, weight 600, tracking 0.12em, uppercase
```

## Visual Rules

**Buttons:**
- Primary: Deep sage fill, white text, 8px radius, 44px min-height
- Secondary: Transparent, sage border, sage text
- Gold/premium: Warm brass fill, white or dark text — for featured CTAs only
- All buttons: magnetic hover effect (per CURSORRULES technique #7)

**Cards:**
- Radius: 16–20px
- Shadow: layered (`0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)`)
- Hover: `translateY(-4px)` + shadow increase (spring cubic-bezier)
- Border: 1px `--border` at rest, `--border-hover` on hover
- Gold bar: 2px gradient bar across the top of featured/highlighted cards (keep from current system)

**Spacing rhythm:**
- Base unit: 8px
- Section padding: 96–128px vertical
- Card padding: 28–32px
- Container max-width: 1280px
- Content max-width: 720px (body text)

**Imagery direction:**
The platform currently has no photography. Until real brand/product imagery is available:
- Use abstract gradient mesh backgrounds (per CURSORRULES)
- Use UI mockup elements (product cards, order screens) as visual props
- Use typographic design elements (large numerals, oversized pull quotes)
- When brand/product photography is available: editorial, high-contrast, treatment-room context. NOT studio white-background product shots.

**Icon direction:**
- Lucide React (already in the stack) — keep for UI icons
- No custom icon set required at launch
- Icon weight should be consistent: 1.5–2px stroke, never filled (except for status indicators)

**How to avoid generic SaaS visuals:**
- No blue gradient hero sections
- No isometric illustration (overused in B2B SaaS)
- No abstract floating shapes/blobs
- No stock photography of people smiling at screens
- No "feature screenshots" as primary hero visuals
- No rainbow gradients or neon accents

**How to avoid low-end wholesale directory aesthetics:**
- No data-table-heavy hero sections
- No price-comparison grids as primary visual elements
- No product catalog grids in the hero
- No "supplier spotlight" grid layouts
- Typography must always dominate over data

---

# K. SEO Strategy

## Search Intent Map

**Commercial intent (high value, priority targets):**
- "professional beauty wholesale marketplace"
- "wholesale beauty products for salons"
- "professional skincare brands wholesale"
- "spa product wholesale supplier"
- "medspa wholesale products"
- "salon wholesale distributor"
- "professional beauty brand wholesale application"
- "buy wholesale skincare for spa"
- "wholesale wellness products for spas"
- "professional haircare wholesale"

**Informational intent (authority-building, content targets):**
- "how to buy wholesale beauty products for salon"
- "professional beauty supply chain explained"
- "salon wholesale vs retail buying"
- "what is a reseller tier in professional beauty"
- "how to sell professional skincare wholesale"
- "professional beauty brand distribution guide"
- "spa product sourcing guide"
- "best professional skincare brands for spas 2026"

**Comparison intent (mid-funnel, high-conversion):**
- "faire vs professional beauty"
- "alternatives to brand portals for salon buying"
- "professional beauty wholesale platform comparison"
- "best wholesale marketplace for salons"

**Navigation/branded intent:**
- "socelle"
- "socelle wholesale"
- "socelle professional beauty"

## Primary Keyword Clusters

**Platform keywords (parent brand):**
`professional commerce platform` · `professional wholesale marketplace` · `B2B beauty platform` · `professional sourcing platform`

**Supply side (brand acquisition):**
`professional beauty wholesale` · `sell wholesale to salons` · `beauty brand wholesale storefront` · `wholesale beauty marketplace for brands`

**Demand side (buyer acquisition):**
`professional beauty wholesale for salons` · `spa product wholesale` · `medspa wholesale supplier` · `salon wholesale ordering` · `wholesale skincare for estheticians`

**Category authority:**
`professional skincare wholesale` · `spa product brands` · `professional haircare wholesale` · `wellness product wholesale`

## Site Architecture Recommendations for SEO

1. **Homepage** — targets: "professional beauty wholesale marketplace," brand terms
2. **/for-brands** — targets: "sell wholesale to salons," "beauty brand wholesale"
3. **/for-buyers** — targets: "professional beauty wholesale for salons," "spa wholesale"
4. **/pricing** — targets: "wholesale marketplace pricing," "beauty wholesale commission"
5. **/solutions/spa** — targets: "wholesale spa products," "professional spa brand wholesale"
6. **/solutions/medspa** — targets: "medspa wholesale products," "professional skincare for medspas"
7. **/solutions/salon** — targets: "salon wholesale," "professional haircare wholesale"
8. **/brands/[slug]** — targets: brand name + "wholesale" long-tail
9. **/insights** — targets: informational keywords, industry authority

## Metadata Rules

- Title format: `[Page Name] — Socelle [Category Descriptor]`
- Titles max: 60 characters
- Descriptions: 140–155 characters, include primary keyword and a differentiating claim
- H1: One per page, matches primary keyword intent, matches title concept but not identical
- H2: Descriptive, keyword-informed, no keyword stuffing
- Image alt text: descriptive, functional — no keyword packing

## Content Pillar Recommendations

**Pillar 1: Professional Beauty Wholesale Guide**
- How the professional beauty supply chain works
- Wholesale vs. retail: what professional buyers need to know
- How to evaluate a professional brand for your spa/salon
- Professional beauty buying guide by treatment category

**Pillar 2: For Professional Brands**
- How to grow a professional beauty wholesale channel
- Building reseller relationships that scale
- Tiered pricing strategies for professional wholesale
- How to evaluate a wholesale marketplace (what to look for)

**Pillar 3: Industry Intelligence (Insights)**
- Ingredient trends in professional beauty
- Treatment room innovation tracking
- Market and regulatory shifts
- Category performance reports

## How SEO Supports Monetization

**Brand acquisition funnel:**
Search → /for-brands (informational article or landing page) → /brand/apply (conversion)

**Buyer acquisition funnel:**
Search ("wholesale spa products") → /solutions/spa or /for-buyers → /portal/signup (conversion)

**Authority flywheel:**
Insights content → organic traffic → email capture → warm audience → platform adoption

---

# L. Account Acquisition Deck

## Slide-by-Slide Outline

### Slide 1 — Cover
**Title:** `The professional beauty supply chain is broken. We're fixing it.`
**Visual:** SOCELLE wordmark on dark background, warm brass period, minimal
**CTA:** None — let the statement land

---

### Slide 2 — The Problem
**Title:** `Four things that shouldn't still be true in 2026`
**Copy:**
1. Brands manage 100+ wholesale accounts through phone calls and text messages
2. Resellers log into 6 separate portals to reorder from 6 brands
3. Dormant accounts stay dormant because there's no system to reactivate them
4. Education is completely disconnected from the products it trains people to use

**Objection handled:** "Is this really a problem?" → Yes, it's endemic and structural.
**Visual:** 4 cards, problem framing, dark background

---

### Slide 3 — The Market
**Title:** `A $80B+ industry running on infrastructure from 2005`
**Copy:**
- Professional beauty: $80B+ annually in North America
- ~350,000 licensed salons, spas, and medspas in the US
- Average professional business sources from 5-8 brands
- No dominant B2B commerce platform has established category leadership
**Proof:** Industry sizing sources
**Objection handled:** "Is the market big enough?"

---

### Slide 4 — The Solution
**Title:** `Socelle: the professional commerce platform for beauty.`
**Copy:** Single-paragraph medium pitch
**Visual:** Platform diagram — brand side → SOCELLE → buyer side, with key features labeled

---

### Slide 5 — How It Works (Brands)
**Title:** `For brands: your wholesale channel, working harder.`
**Copy:**
- Branded storefront, live in days
- Tier pricing you control
- Orders direct, no rep required
- Analytics on every reseller account
- Commission-only — zero until you sell
**Proof needed:** Sample storefront screenshot
**Objection handled:** "We already have a portal"

---

### Slide 6 — How It Works (Buyers)
**Title:** `For buyers: every brand. One login.`
**Copy:**
- Browse hundreds of verified brands
- Your tier pricing, automatically applied
- Multi-brand single checkout
- Reorder in one click
- Free forever
**Proof needed:** Sample ordering experience
**Objection handled:** "I have good rep relationships"

---

### Slide 7 — The Economics
**Title:** `Simple. Aligned. Commission-only.`
**Copy:**
- Brands: commission on completed orders. Nothing until you sell.
- Buyers: free forever. Zero platform cost.
- Platform earns only when transactions happen — structurally aligned with both sides.
**Visual:** Three-column economics diagram

---

### Slide 8 — Traction / Pipeline
**Title:** `Early access — quality before scale.`
**Copy:**
- X brands in review / onboarding (use real number)
- X licensed businesses registered (use real number)
- Target: 25 verified brands, 500 licensed businesses at soft launch
**Note:** Replace with real traction numbers as available. Do not project.

---

### Slide 9 — Why Now
**Title:** `The infrastructure moment.`
**Copy:**
- Indie professional brands proliferated but lack distribution infrastructure
- Professional service businesses are growing and buying more
- B2B commerce infrastructure (Stripe, Supabase, modern SaaS) has matured
- No category leader exists in this vertical yet
**Objection handled:** "Why hasn't someone done this before?"

---

### Slide 10 — Why Us
**Title:** `Built by people who know this industry.`
**Copy:**
- Founding team background (insert specifics)
- Product is live, not a concept
- Real Supabase backend, real Stripe Connect integration, real brand storefronts
- Commission-only model means we're aligned with brand success from day one
**Proof needed:** Founder credentials, platform screenshot

---

### Slide 11 — The Roadmap
**Title:** `Phase 1 is commerce. Phase 2 is education. Phase 3 is intelligence.`
**Visual:** Timeline diagram showing three phases with Phase 1 highlighted
**Copy:** Brief description of each phase (from About page)

---

### Slide 12 — Call to Action
**Title:** `Early access is open.`
**Copy:**
- For brands: apply to list your storefront at socelle.com/brand/apply
- For investors: [contact information]
- For partnerships: hello@socelle.com
**Visual:** Dark background, warm brass CTA, SOCELLE wordmark

---

# M. Multi-Agent Work Orders

## Agent Structure Overview

```
Phase 1 agents (complete/in progress — see PHASE1_WORK_ORDER.md)
Phase 2 agents (marketing site rebuild — begin after Phase 0 decisions made)

PHASE 2 AGENTS:
  Agent 1: Project Scaffold          → Next.js 14, Tailwind, Lenis, Vercel
  Agent 2: Design System             → CSS variables, typography, color tokens
  Agent 3: Nav + Layout              → Glassmorphic nav, root layout, Lenis init
  Agent 4: Homepage                  → All sections, GSAP animations
  Agent 5: For Brands Page           → Full conversion page
  Agent 6: For Buyers Page           → Full conversion page
  Agent 7: How It Works Page         → Pinned scroll section
  Agent 8: Pricing + About           → Both pages
  Agent 9: Solutions / Vertical Pages → /spa, /medspa, /salon
  Agent 10: SEO + Metadata           → Helmet, sitemap, robots
  Agent 11: QA + Accessibility       → Cross-browser, motion, contrast
```

---

## Agent 1 — Project Scaffold

**Objective:** Initialize the Next.js 14 marketing site codebase with all dependencies installed, folder structure created, and deployment connected to Vercel.

**Scope:**
- Create new Next.js 14 project with App Router
- Install all required packages
- Set up folder structure per CURSORRULES specification
- Connect to Vercel for continuous deployment
- Configure environment variables

**Required inputs:**
- Domain (socelle.com or subdomain for staging)
- Vercel account access
- CURSORRULES.md (full reference)

**Required outputs:**
- Running Next.js app at localhost:3000 showing a blank page with correct fonts loaded
- Vercel deployment active at staging URL
- All packages installed with no peer dependency warnings

**Package install:**
```bash
npx create-next-app@latest socelle-marketing --typescript --tailwind --app
cd socelle-marketing
npm install gsap @gsap/react framer-motion lenis react-helmet-async
```

**Folder structure to create:**
```
app/
  layout.tsx
  page.tsx
  globals.css
  for-brands/page.tsx
  for-buyers/page.tsx
  how-it-works/page.tsx
  pricing/page.tsx
  about/page.tsx
  insights/page.tsx
  solutions/
    spa/page.tsx
    medspa/page.tsx
    salon/page.tsx
components/
  Nav.tsx
  Hero.tsx
  PinnedSection.tsx
  FeatureCards.tsx
  DarkSection.tsx
  CTASection.tsx
  MagneticButton.tsx
  CountUp.tsx
  Footer.tsx
hooks/
  useScrollReveal.ts
  useSmoothScroll.ts
  useMagnetic.ts
public/
  favicon.svg
  og-image.svg
```

**Definition of done:**
- `npm run dev` runs without errors
- Fonts load (Instrument Serif + Satoshi)
- Vercel deployment URL is active
- No TypeScript errors (`npm run typecheck`)

---

## Agent 2 — Design System

**Objective:** Implement the full CSS variable token system, Tailwind configuration, and base styles per the resolved CURSORRULES palette and platform typography.

**Scope:** `globals.css`, `tailwind.config.ts`

**Required inputs:**
- Phase 0 color decision (confirmed: deep sage / warm brass platform palette)
- CURSORRULES.md color and typography sections
- This playbook Section J

**globals.css — implement:**
- All CSS custom properties from Section J color system
- Typography scale variables
- Base reset (no pure white, no pure black)
- Gradient mesh animation keyframe
- `prefers-reduced-motion` disable rule for all transitions

**tailwind.config.ts — implement:**
- Extend theme with all CSS variable tokens
- Custom font families (instrument-serif, satoshi)
- Custom shadow scale (card, card-hover, panel, elevated, modal)
- Custom spacing tokens
- Touch target minimum (44px)

**Definition of done:**
- All CSS variables accessible in components via `var(--token)`
- All Tailwind classes available via `text-accent`, `bg-surface`, etc.
- No Tailwind purge warnings
- `prefers-reduced-motion` tested and functional

---

## Agent 3 — Nav + Root Layout

**Objective:** Build the glassmorphic navigation and root layout with Lenis smooth scroll initialized.

**Scope:** `app/layout.tsx`, `components/Nav.tsx`, `hooks/useSmoothScroll.ts`

**Nav specification:**
- Fixed position, full-width
- Transparent on page load
- Gets `backdrop-filter: blur(16px)` + warm background on scroll (threshold: 8px)
- Hides on scroll-down (after 100px), shows on scroll-up (GSAP ScrollTrigger `onUpdate`)
- Logo: left — "socelle" in Instrument Serif + warm brass period
- Links: center on desktop — "Brands" "For Brands" "How It Works" (or as specified)
- CTA: right — "Get early access" pill button in deep sage
- Mobile: simplified, no hamburger on desktop, all links visible on mobile with 44px touch targets

**Lenis initialization (in layout.tsx):**
- Duration: 1.2
- Easing: `(t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))`
- smoothWheel: true
- Destroy on unmount

**Definition of done:**
- Nav renders on all pages without import
- Scroll behavior tested at multiple scroll speeds
- Mobile nav tested at 375px, 390px, 414px viewports
- `prefers-reduced-motion` disables all nav animations

---

## Agent 4 — Homepage

**Objective:** Build the complete homepage with all sections and animations per CURSORRULES techniques and this playbook's copy system (Section H).

**Scope:** `app/page.tsx`, referenced components

**Section build order:**
1. Hero — gradient mesh background, split-text headline reveal, dual CTA, stat pills
2. Platform split — For Brands / For Buyers cards with 3D tilt
3. Comparison table — three-column (General wholesale / Brand portals / SOCELLE)
4. How it works — pinned scroll section (Discover → Order → Grow)
5. Social proof — dark background, counter animation, testimonials when available
6. Final CTA — gradient mesh, magnetic button, dual path

**Copy:** Use Section H Homepage copy verbatim. Do not improvise copy.

**Animations to implement:**
- Technique #1 (Lenis — inherited from layout)
- Technique #2 (scroll reveals — `data-reveal` on all section elements)
- Technique #3 (pinned "How It Works" section)
- Technique #4 (3D tilt on Feature Cards)
- Technique #5 (gradient mesh on hero and CTA sections)
- Technique #6 (split-text hero headline reveal)
- Technique #7 (magnetic primary CTA button)

**Definition of done:**
- All sections render correctly
- All 7 animation techniques functional
- Mobile: 3D tilt and magnetic disabled, animations simplified
- `prefers-reduced-motion`: all animations disabled, content fully visible
- Lighthouse Performance ≥ 90 on desktop

---

## Agent 5 — For Brands Page

**Objective:** Build the /for-brands conversion page with full copy from Section H.

**Scope:** `app/for-brands/page.tsx`

**Section order:**
1. Hero — headline + subhead + CTA + trust bar
2. Problem section — "The problem we're solving for you"
3. Features section — 6 feature cards with 3D tilt
4. Economics section — three-step commission flow
5. FAQ — 6 questions, accordion interaction
6. Final CTA

**Copy:** Use Section H For Brands page copy verbatim.

**CTA destination:** `/brand/apply` (connects to existing React platform)

**Definition of done:**
- Page renders, all sections complete
- CTA links to correct destination
- FAQ accordion functional (Framer Motion)
- Scroll reveals active on all sections

---

## Agent 6 — For Buyers Page

**Objective:** Build the /for-buyers conversion page.

**Scope:** `app/for-buyers/page.tsx`

**Section order:**
1. Hero — "Every brand you carry. Every brand you should. One place."
2. Problem section
3. Features section — 6 features
4. Verification explainer — "Who qualifies?"
5. FAQ — 4 questions
6. Final CTA

**Copy:** Use Section H For Buyers page copy verbatim.

**CTA destination:** `/portal/signup` (connects to existing React platform)

**Definition of done:** Same as Agent 5.

---

## Agent 7 — How It Works Page

**Objective:** Build the /how-it-works page featuring the pinned scroll storytelling section as the centerpiece.

**Scope:** `app/how-it-works/page.tsx`, `components/PinnedSection.tsx`

**The pinned section is the entire page.** Three phases pinned in sequence:
1. Discover — "Brands list their professional products. Buyers browse and discover what fits their practice."
2. Order — "Buyers add to cart across multiple brands. One checkout, one order confirmation."
3. Grow — "Both sides build direct wholesale relationships. Data flows both ways. Reorders take seconds."

Each step has: large step number (01/02/03), title, body, and an abstract UI card animation.

**Definition of done:**
- Pinned section functional at all desktop widths
- Mobile: pinned section replaced with standard vertical scroll (no pin on mobile)
- Transitions are smooth and tied to scroll position (scrub: 1)

---

## Agent 8 — Pricing + About Pages

**Objective:** Build both pages with updated copy.

**Pricing:**
- Use existing page structure (it works)
- Update hero headline to "Simple economics. No catch."
- Implement all Section H Pricing copy revisions
- Add Helmet metadata

**About:**
- Keep problem framing and principles copy (strong as-is)
- Replace team placeholder with Section H interim team language
- Update "What we're building" with tightened copy
- Add Helmet metadata

**Definition of done:** Both pages complete with copy from Section H, correct metadata, no placeholder content visible.

---

## Agent 9 — Vertical Landing Pages

**Objective:** Build three vertical landing pages for SEO and conversion.

**Scope:** `app/solutions/spa/page.tsx`, `app/solutions/medspa/page.tsx`, `app/solutions/salon/page.tsx`

**Each page structure:**
1. Hero — vertical-specific headline + subhead
2. Problem — vertical-specific pain points
3. Platform benefits — tailored to that buyer type
4. Featured brands in that category (when available)
5. Testimonial (when available — vertical-specific)
6. CTA — "Create free account"

**Copy approach:** Use Section H and Section I vertical messaging guidelines. Do not reuse homepage copy verbatim — adapt to vertical context.

**SEO metadata per page:**
- /solutions/spa: target "wholesale spa products," "professional spa brand wholesale"
- /solutions/medspa: target "medspa wholesale products," "professional skincare for medspas"
- /solutions/salon: target "salon wholesale," "professional haircare wholesale"

**Definition of done:** Three pages with unique copy, correct metadata, correct CTAs.

---

## Agent 10 — SEO + Metadata

**Objective:** Implement full SEO infrastructure across all marketing site pages.

**Scope:** All `app/*/page.tsx` files, `app/layout.tsx`, `public/sitemap.xml`, `public/robots.txt`

**Tasks:**
1. Implement metadata per Section K metadata rules for all pages
2. Generate `sitemap.xml` (all marketing site pages, canonical URLs)
3. Create `robots.txt` (allow all, sitemap reference)
4. Add `canonical` link to all pages
5. Implement JSON-LD structured data on Homepage (Organization schema)
6. Verify OG image is referenced correctly on all pages
7. Implement Twitter card metadata on all pages

**Definition of done:**
- All pages have unique title + description
- Sitemap includes all public pages
- Robots.txt allows crawling
- Structured data validates in Google Rich Results Test
- No duplicate titles or descriptions

---

## Agent 11 — QA + Accessibility

**Objective:** Test and verify the complete marketing site before launch.

**Scope:** All pages, cross-browser, cross-device

**QA checklist:**
```
[ ] Lighthouse Performance ≥ 90 on all pages (desktop)
[ ] Lighthouse Performance ≥ 75 on all pages (mobile)
[ ] First Contentful Paint < 1.5s (desktop)
[ ] Largest Contentful Paint < 2.5s (desktop)
[ ] Total JS bundle < 300KB (compressed, excluding fonts)
[ ] prefers-reduced-motion: all animations disabled, all content visible
[ ] Keyboard navigation: all interactive elements reachable, focus states visible
[ ] Color contrast: all text meets 4.5:1 minimum
[ ] Touch targets: all interactive elements ≥ 44px
[ ] Mobile viewport: tested at 375px, 390px, 428px, 768px
[ ] Desktop: tested at 1280px, 1440px, 1920px
[ ] All internal links resolve correctly
[ ] All CTAs point to correct platform URLs
[ ] No console errors in production build
[ ] Fonts load correctly: Instrument Serif + Satoshi
[ ] OG image renders correctly in social sharing preview
[ ] Sitemap accessible at /sitemap.xml
[ ] Robots.txt accessible at /robots.txt
[ ] No debvaihello@gmail.com remaining in any page
[ ] No "vite.svg" references
[ ] No placeholder content visible
```

**Accessibility specific:**
```
[ ] Skip-to-content link present and functional
[ ] All images have descriptive alt text
[ ] Semantic HTML: section, nav, main, article, header, footer
[ ] Form inputs have associated labels
[ ] Error messages are descriptive and associated with fields
[ ] ARIA roles where semantic HTML is insufficient
```

**Definition of done:** All checklist items pass. Document any exceptions with rationale.

---

# N. MVP Launch Priorities

**Critical path in sequence:**

**Day 1 — Phase 0 decisions:**
- [ ] Color system decision (sage confirmed vs. reconsidered)
- [ ] Architecture decision (Next.js marketing site confirmed as separate from React platform)
- [ ] "Get Early Access" CTA destination confirmed (email capture vs. application split)
- [ ] Professional email active (hello@socelle.com DNS + inbox)

**Days 2-3 — Phase 1 verification:**
- [ ] Run Phase 1 master checklist (PHASE1_WORK_ORDER.md)
- [ ] Verify no debvaihello@gmail.com anywhere in production
- [ ] Verify no fictional stats anywhere in production
- [ ] Verify Agent G audit report complete (APPLY_AUDIT.md)

**Days 3-5 — Content:**
- [ ] Onboard 3-5 real brands with real storefronts
- [ ] Collect 2 real testimonials (1 brand, 1 buyer)
- [ ] Founder/team information ready for About page

**Days 5-12 — Marketing site build (Agents 1-9 in parallel):**
- [ ] Project scaffold + design system + nav (Agents 1-3, day 1)
- [ ] Homepage + For Brands + For Buyers (Agents 4-6, days 2-5)
- [ ] How It Works + Pricing + About (Agents 7-8, days 3-5)
- [ ] Vertical pages + SEO (Agents 9-10, days 5-7)

**Days 12-14 — QA + launch:**
- [ ] Agent 11 QA pass
- [ ] Resolve all blockers from QA
- [ ] DNS cutover if marketing site is on new domain/subdomain
- [ ] Soft launch to warm audience before broad marketing

---

# O. Post-Launch Priorities (Days 30-90)

**30 days:**
- [ ] Insights page with real editorial content (3-5 articles minimum)
- [ ] /contact page with structured intake form
- [ ] Middle-of-funnel brand capture (waitlist or brand guide for not-ready brands)
- [ ] Reseller verification explainer added to /for-buyers
- [ ] First batch of buyer testimonials collected and deployed
- [ ] Basic analytics installed (GA4 + Posthog for behavioral)

**60 days:**
- [ ] /solutions/wellness page
- [ ] /solutions/hospitality page (if partnership development is active)
- [ ] Blog / content engine launched with first 3 SEO articles
- [ ] A/B test: homepage hero headline variants
- [ ] A/B test: nav CTA (single "Get early access" vs. dual brand/buyer)
- [ ] Email sequences for brand onboarding and buyer reactivation

**90 days:**
- [ ] Shopify integration for brand fulfillment (Phase 2 platform feature)
- [ ] Education layer planning (Phase 2)
- [ ] First market intelligence report (Insights pillar)
- [ ] Review typography and color system across platform portals — plan migration
- [ ] DEBVAI / SOCELLE brand relationship: public definition or retirement of DEBVAI name

---

# P. Final Recommendation

## The one thing that unlocks everything else

Every delay in this build traces back to one root cause: **Phase 0 decisions have not been made.**

The color system cannot be finalized. The marketing site cannot be scaffolded. The agent work orders cannot be deployed. The brand cannot present a coherent face to the market.

**Make the five Phase 0 decisions today.** They will take 60 minutes to discuss and resolve. Not making them will cost weeks.

## The three things that determine launch quality

1. **Real brands.** The platform's most important page (browse) is empty without them. Credibility without content is a beautiful shell. Prioritize brand onboarding above everything that isn't a Phase 0 decision.

2. **Real social proof.** Two genuine quotes — one brand, one buyer — replace the largest trust gap on the site. These don't need to be produced. They need to be asked for.

3. **A resolved visual identity.** The current site has a strong visual system. The CURSORRULES has a different but also strong visual system. Using both at once creates incoherence. Pick one. The next two weeks of build work depend on it.

## The thing that will determine long-term category position

SOCELLE has the correct instinct on category positioning. "Professional commerce platform" is the right frame. The About page's problem framing ("Four things that shouldn't still be true in 2026") is exactly the kind of earned authority that distinguishes a platform brand from a directory brand.

The risk is not that the strategy is wrong. The risk is that the gap between the quality of the vision and the quality of the current execution grows wide enough that early prospects lose confidence before the marketing site is finished.

**Close that gap fast.** Phase 1 reduces it significantly. The Next.js marketing site closes it entirely. The brand this company can become is worth the precision the build requires.

---

*End of SOCELLE Strategic + Executional Playbook*
*Next document: PHASE2_WORK_ORDER.md — marketing site build*
