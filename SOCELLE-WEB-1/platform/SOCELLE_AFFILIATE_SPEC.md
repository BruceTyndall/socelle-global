# SOCELLE Affiliate Monetization System — Complete Specification

**Classification:** Internal working document — affiliate strategy, placements, trust guardrails, tracking, and admin workflow
**Stream:** Revenue Stream 0 — Premium Affiliate Commerce
**Status:** Specification complete — ready for implementation
**Last updated:** March 2026

---

## Overview

Affiliate commerce is SOCELLE's day-one revenue engine. It requires zero brand partnerships, zero survey data, and zero user scale to activate. It operates as editorial recommendation commerce — the Wirecutter model applied to professional beauty intelligence content. Every placement decision is made by a human editor. No placement is ever auction-based or fully algorithmic.

This system is embedded in content operators are already consuming. It is never intrusive, never disguised as editorial, and always disclosed. The product recommendation earns its position by being genuinely useful to the licensed professional reading it.

**Revenue Stream 0 is live from day one. It scales linearly with traffic.**

---

## Section 1: Affiliate Network Setup

### 1.1 Network Overview

SOCELLE targets five affiliate networks at launch, chosen for commission rates, deep-link support, professional beauty product availability, and editorial credibility. Combined, these networks provide access to 200–500 curated products at launch, with weekly catalog expansion targeting 1,000+ products by month 6.

**Catalog strategy:** Begin with 50 hero products across the top categories (skincare devices, professional tools, haircare, business software). Expand by 20–30 products per week based on editorial review. Never auto-populate — all products are human-reviewed before going live.

---

### 1.2 Network 1: ShareASale

**Focus:** Professional beauty tools, salon equipment, furniture, accessories, and specialty brands not covered by larger networks.

| Attribute | Detail |
|---|---|
| Application URL | https://account.shareasale.com/newsignup.cfm |
| Application process | Create merchant account, browse merchant list, apply to individual merchant programs. Requires: website URL, traffic description, audience description, promotional methods. No minimum traffic requirement for application. |
| Typical approval timeline | 3–14 business days per merchant program. Some auto-approve. |
| Commission rates (professional beauty) | 5–15%. Professional tools average 8–10%. Some specialty brands offer 12–15% for new affiliates. |
| Cookie duration | 30–90 days depending on merchant. Standard is 30 days. Request 60–90 days where available. |
| Payment terms | Net 30. Minimum payout $50. Payments via check, direct deposit, or Payoneer. |
| Dashboard/tracking | Full click tracking, conversion tracking, deep-link generator, product datafeed access, real-time reporting. |
| Deep-linking support | Yes — full deep-link support with link builder tool. |
| Priority at launch | High — broadest access to professional beauty tool brands. |
| Notable merchants | Spafinder, professional salon supply brands, beauty equipment manufacturers. |

---

### 1.3 Network 2: Impact.com

**Focus:** Prestige skincare brands (SkinCeuticals, Dermalogica), luxury devices, professional-grade skincare retail channels, and premium brand partnerships.

| Attribute | Detail |
|---|---|
| Application URL | https://impact.com/affiliates/ |
| Application process | Register as affiliate publisher, complete profile (website, audience, content type), apply to individual brand programs. Editorial content platforms receive favorable review. SOCELLE's intelligence-first positioning is a strong application angle. |
| Typical approval timeline | 7–21 business days. Prestige brands (SkinCeuticals) may require additional vetting. |
| Commission rates (professional beauty) | 6–15%. SkinCeuticals historically 8–12%. Dermalogica 8–10%. Luxury devices vary; some offer flat CPA ($15–$50 per conversion). |
| Cookie duration | 30–60 days. Impact platform default is 30 days; negotiate 60 for editorial partners. |
| Payment terms | Net 30 or Net 45. Minimum payout $10. Wire transfer, PayPal, direct deposit. |
| Dashboard/tracking | Industry-leading attribution. Cross-device tracking, view-through attribution (Phase 2), real-time dashboard, API access for custom reporting. |
| Deep-linking support | Yes — impact.com Link Builder, supports UTM parameters, custom tracking IDs. |
| Priority at launch | High — required for prestige brand coverage. SkinCeuticals and Dermalogica are core to the SOCELLE operator audience. |
| Notable merchants | SkinCeuticals, Dermalogica, NuFace, BeautyCounter (professional line), select luxury device brands. |

---

### 1.4 Network 3: CJ Affiliate (Commission Junction)

**Focus:** Salon equipment, business technology, spa management software, professional supply chains, and national retail channels carrying professional products.

| Attribute | Detail |
|---|---|
| Application URL | https://www.cj.com/publisher |
| Application process | Apply as publisher, describe content and audience. CJ requires more detail on traffic and monetization strategy than ShareASale. SOCELLE's operator audience (spa owners, medspa directors) is a strong qualification. |
| Typical approval timeline | 7–14 days for publisher account. Individual merchant programs: 5–30 days. |
| Commission rates (professional beauty) | 4–12%. Business tools and technology average 8–10%. Large retailers (Salon Centric via CJ) may offer 4–6%. |
| Cookie duration | 30–120 days depending on merchant. CJ supports extended cookies for B2B publishers. |
| Payment terms | Net 30 or Net 20 (performance tier). Minimum payout $25. Direct deposit, check. |
| Dashboard/tracking | Full attribution suite. CJ Insights dashboard, API access, custom conversion tracking, cross-device. |
| Deep-linking support | Yes — Link Builder with full deep-link capability. |
| Priority at launch | Medium — use for salon equipment, supply chains, and business software categories where ShareASale and Impact have gaps. |
| Notable merchants | Salon equipment distributors, spa management software, professional beauty supply retail. |

---

### 1.5 Network 4: Amazon Associates

**Focus:** Professional tools, books, accessible devices, general supplies, and any professional-grade product available on Amazon where no direct affiliate program exists.

| Attribute | Detail |
|---|---|
| Application URL | https://affiliate-program.amazon.com/ |
| Application process | Apply with website URL. Amazon requires a website with established content before approval. Must generate at least 3 qualifying sales within 180 days of application or account closes. |
| Typical approval timeline | 24–72 hours. Account conditional until 3 sales completed. |
| Commission rates (professional beauty) | 1–8% by category. Beauty category: 6–8%. Tools: 3–4.5%. Books: 4.5%. Devices/electronics: 3–4%. Lower than other networks but catalog breadth compensates. |
| Cookie duration | 24 hours (session). 90 days if product is added to cart. Shortest in the industry — compensate with strong editorial intent signals at placement time. |
| Payment terms | Net 60. Minimum payout $10 (direct deposit), $100 (check). |
| Dashboard/tracking | Amazon Associates dashboard. Basic click and conversion reporting. No API for clicks (conversion data only). |
| Deep-linking support | Yes — Site Stripe tool, product link builder, OneLink for international traffic. |
| Priority at launch | Medium — use as fallback for products not available on other networks. Do not lead with Amazon if a direct affiliate program exists at higher commission. |
| Notable merchants | Any Amazon-listed product. Priority: professional tool kits, technique books, accessible skincare devices, office/business supplies for spa owners. |

---

### 1.6 Network 5: Brand-Direct Programs

**Focus:** Flagship brands with their own referral or affiliate programs outside the major networks. Higher commissions, closer editorial relationship, potential for exclusive placements.

#### Olaplex Affiliate Program

| Attribute | Detail |
|---|---|
| Application URL | https://olaplex.com/pages/affiliate (confirm active) |
| Application process | Direct application via Olaplex brand site. Editorial content creators and B2B platforms may qualify for professional affiliate tier. Reference SOCELLE's licensed professional audience in application. |
| Commission rates | 10–15% per sale. Professional tier may receive enhanced rates. |
| Cookie duration | 30–60 days. |
| Payment terms | Net 30. Minimum payout $50. |
| Notes | Olaplex brand page on SOCELLE is a natural placement. "Where to Buy Olaplex" affiliate link on brand profile page. |

#### Moroccanoil Affiliate Program

| Attribute | Detail |
|---|---|
| Application URL | Contact via moroccanoil.com/pages/professional — check for affiliate partner program. |
| Application process | Professional-audience editorial platforms may qualify. Reference licensed professional buyer audience. |
| Commission rates | 8–12% estimated (confirm with Moroccanoil partner team). |
| Cookie duration | 30 days standard. |
| Payment terms | Net 30. |
| Notes | Moroccanoli haircare products highly relevant to salon operators on platform. |

#### Hydrafacial Referral Program

| Attribute | Detail |
|---|---|
| Application URL | Contact Hydrafacial via hydrafacial.com/professional — referral program for device placement leads. |
| Application process | Hydrafacial operates a referral/lead-gen model for device sales, not a traditional affiliate click-commission program. Referral fees typically paid per qualified lead (medspa/spa inquiring about device purchase). |
| Commission rates | $200–$500 per qualified device lead (estimated). Confirm current rates with Hydrafacial partner team. |
| Cookie duration | N/A — lead-gen model, not click-through. |
| Payment terms | Net 30 post-qualified lead confirmation. |
| Notes | Exceptionally high potential. SOCELLE's medspa operator audience is the exact Hydrafacial buyer target. A single device referral can generate more revenue than 500 standard affiliate clicks. Prioritize for quiz result placements on medspa income gap quizzes. |

---

### 1.7 Catalog Management Strategy

- **Launch inventory:** 50 hero products, manually curated across 5 categories (skincare, haircare, tools/devices, business, wellness)
- **Expansion cadence:** 20–30 new products reviewed per week by content editor
- **Category allocation at launch:**

| Category | Hero Products at Launch | Target Month 6 |
|---|---|---|
| Skincare tools and devices | 12 | 80 |
| Professional haircare | 10 | 60 |
| Treatment tools and supplies | 10 | 80 |
| Business/practice management | 8 | 50 |
| Wellness and spa accessories | 10 | 60 |
| **Total** | **50** | **330** |

- **Brand alignment check:** Before adding any product, editor verifies: (1) brand exists or would exist naturally in the SOCELLE professional beauty context, (2) product is genuinely used by the target operator audience, (3) no active negative sentiment flag in SOCELLE brand reviews
- **Price verification:** Weekly automated check ensures listed price matches current affiliate landing page price

---

## Section 2: Placement Map — 7 Surfaces

### Placement Ground Rules (Apply to All Surfaces)

- Maximum 2 affiliate placements per page — enforced in rendering code, not just policy
- All placements require `relevance_score >= 0.70` set by human editor
- Placement renderer counts active blocks before adding; throws error if count exceeds 2
- All placements carry the "Socelle Pick" label and disclosure footer
- Affiliate blocks have distinct visual treatment (subtle left border in pro-gold, "Socelle Pick" badge) — never styled to blend with organic editorial

---

### Surface 1: News Feed Articles

**Trigger condition:** Article category tag matches one or more affiliate product categories. Matching is performed on article categories at publish time. If no products match with `relevance_score >= 0.70`, no block appears.

**Block format:** "Socelle Pick" card — single block containing 2–3 products presented in a horizontal row (desktop) or stacked cards (mobile). Each product: image, product name, brand, price, 1-sentence professional relevance statement, "Shop Now" CTA button.

**Max placements:** 1 block per article page (containing 2–3 products). The block counts as 1 of the 2 maximum placements.

**Position:** Below article body, above related articles and comments. Never inline within article body text.

**Copy conventions:**
- Block header: "Socelle Pick" (badge) — "Recommended Tools for [Article Topic]"
- Product line 1: Product name (linked) — Brand name — Price
- Product line 2: One sentence, professional tone. "Trusted by licensed estheticians for [specific benefit]."
- CTA: "Shop Now" — opens affiliate URL in new tab
- Footer: "Socelle earns a small commission on purchases made through this link. About our recommendations."

**Card template:**
```
┌─────────────────────────────────────────────────────┐
│ SOCELLE PICK                              [ℹ️]      │
├─────────────────────────────────────────────────────┤
│ [Product Image]  [Product Image]  [Product Image]   │
│ Product Name     Product Name     Product Name      │
│ by Brand         by Brand         by Brand          │
│ $XX.XX           $XX.XX           $XX.XX            │
│ [1-line copy]    [1-line copy]    [1-line copy]     │
│ [Shop Now →]     [Shop Now →]     [Shop Now →]      │
├─────────────────────────────────────────────────────┤
│ Socelle earns a small commission on purchases made  │
│ through this link. ℹ️ About our recommendations     │
└─────────────────────────────────────────────────────┘
```

**Example placements:**
- Article: "AHA Exfoliation Protocols for Medspas" → Socelle Pick: SkinCeuticals C E Ferulic, Image Skincare Ageless Total Resurfacing Masque, Dermalogica Daily Microfoliant
- Article: "Dermaplaning Safety Standards 2026" → Socelle Pick: Tinkle Dermaplaning Tool Set, Sterile Blade Refill Pack, Image Skincare Post-Treatment Serum
- Article: "Top Salon Management Software" → Socelle Pick: Vagaro Salon Software (affiliate link), GlossGenius subscription, Boulevard POS

---

### Surface 2: Brand Profile Pages

**Trigger condition:** Brand has one or more products in `affiliate_products` table with `is_active = true`. If brand has no affiliate products, no blocks appear.

**Block 1 — "Where to Buy":**
Direct affiliate purchase links to authorized retailers carrying the brand. Present 1–3 purchase options with retailer name, product price, and affiliate link.

**Block 2 — "Similar Brands You May Like":**
2–3 affiliated alternative brands with brief positioning statement. Used when operator is researching a brand that is not yet on the SOCELLE marketplace (unclaimed) or has no direct transaction pathway.

**Max placements:** 2 blocks (both count toward the page maximum of 2).

**Position:** Below all auto-generated intelligence sections (sentiment, trend data, product catalog, adoption map). Above the brand claim CTA.

**Copy conventions — Block 1:**
```
WHERE TO BUY
[Retailer Logo] [Retailer Name]    [Price]    [Shop Now →]
[Retailer Logo] [Retailer Name]    [Price]    [Shop Now →]
Socelle earns a small commission on purchases. ℹ️
```

**Copy conventions — Block 2:**
```
SOCELLE PICK
Brands Professional Operators Also Trust
[Brand Image]           [Brand Image]           [Brand Image]
Brand Name              Brand Name              Brand Name
Category                Category                Category
[1-line distinction]    [1-line distinction]    [1-line distinction]
[Explore Brand →]       [Explore Brand →]       [Explore Brand →]
Socelle earns a small commission on purchases. ℹ️
```

**Example placements:**
- Olaplex brand page → Block 1: "Where to Buy" with direct link to authorized Olaplex retailer + affiliate link. Block 2: "Similar Brands" → Davines, Wella Professional, Redken (each linking to affiliate purchase options)
- SkinCeuticals brand page → Block 1: SkinCeuticals authorized retailer affiliate link. Block 2: Dermalogica, Image Skincare, Obagi as professional alternatives

---

### Surface 3: Event Detail Pages

**Trigger condition:** Any event in the events catalog triggers this block. Block always appears on event detail pages (no category matching required — events are universal placement surfaces).

**Block format:** "Prepare for [Event Name]" — 3–4 products in a horizontal card row. Products selected by editor for travel utility, professional preparation, or event-specific relevance.

**Max placements:** 1 block per event page. Counts as 1 of the 2 maximum page placements.

**Position:** Below event details (date, location, agenda, speakers). Above RSVP/Save/Register button.

**Copy conventions:**
```
SOCELLE PICK
Prepare for [Event Name]
[Product Image]  [Product Image]  [Product Image]  [Product Image]
Product Name     Product Name     Product Name     Product Name
by Brand         by Brand         by Brand         by Brand
$XX.XX           $XX.XX           $XX.XX           $XX.XX
[1-line copy]    [1-line copy]    [1-line copy]    [1-line copy]
[Shop Now →]     [Shop Now →]     [Shop Now →]     [Shop Now →]
Socelle earns a small commission on purchases made through this link. ℹ️
```

**Event-type product mapping (editorial curation guide):**

| Event Type | Product Category | Example Products |
|---|---|---|
| Trade conference (ISPA, PBA) | Travel prep, professional gear | Rolling luggage, professional tote, portable skincare kit, business card holder |
| CE training/workshop | Learning tools, technique tools | Dermaplaning starter kit, CE tracking app, massage tools, textbooks |
| Brand education event | Brand product line | Brand's hero products via affiliate |
| Webinar/virtual event | Home studio setup | Ring light, background, professional camera kit |
| Networking reception | Professional presentation | Business attire accessories, skincare for headshots |

**Example placement:**
- ISPA International Spa & Wellness Conference → Prepare for ISPA: Samsonite Pro Carry-On ($189, Shop Now), GlossGenius App Subscription ($24/mo, Try Free), Dermalogica Travel Kit ($65, Shop Now), ISPA Member Professional Tote ($45, Shop Now)

---

### Surface 4: Education Content Pages

**Trigger condition:** Education article or video mentions a specific technique, product category, or tool type. Matching is performed on article tags at publish time. If no products match, no block appears.

**Block format:** "Tools Used in This Guide" — 2–3 products in a card row. Products specifically used in or recommended for the technique being taught.

**Max placements:** 1 block per education page. Counts as 1 of the 2 maximum page placements.

**Position:** Below the article body or video embed, above "Related Content" / "Related Courses."

**Copy conventions:**
```
SOCELLE PICK
Tools Used in This Guide
[Product Image]       [Product Image]       [Product Image]
Product Name          Product Name          Product Name
by Brand              by Brand              by Brand
$XX.XX                $XX.XX                $XX.XX
[1-line professional  [1-line professional  [1-line professional
use description]      use description]      use description]
[Shop Now →]          [Shop Now →]          [Shop Now →]
Socelle earns a small commission on purchases made through this link. ℹ️
```

**Example placements:**
- Dermaplaning technique guide → Socelle Pick: Tinkle Dermaplaning Razors ($12, Shop Now), Accutec Personna Blades ($18/10pk, Shop Now), Image Skincare Post-Procedure Solution ($68, Shop Now)
- Lymphatic drainage massage video → Socelle Pick: Gua Sha Facial Tool ($28, Shop Now), Jojoba Company Massage Oil ($32, Shop Now), Compression Massage Device ($189, Shop Now)
- Business pricing strategy article → Socelle Pick: Salon Business Planning Guide ($24, Shop Now), GlossGenius Software (Try Free), Vagaro POS System (Start Trial)

---

### Surface 5: Benchmarking Data Pages

**Trigger condition:** Benchmarking page displays data for a specific product category. Category from benchmark data is matched to affiliate products in the same category with `relevance_score >= 0.70`.

**Block format:** "Top Performing in [Category] This Month" — 2–3 product cards showing highest-performing products by operator adoption data in that category. Products are affiliated versions of or alternatives to the top-performing brands.

**Max placements:** 1 block per benchmarking page. Counts as 1 of the 2 maximum page placements.

**Position:** Below the data visualization table or chart. Above the methodology/notes section.

**Copy conventions:**
```
SOCELLE PICK
Top Performing in [Category] This Month
Based on SOCELLE operator adoption data

[Product Image]              [Product Image]              [Product Image]
Product Name                 Product Name                 Product Name
by Brand                     by Brand                     by Brand
$XX.XX                       $XX.XX                       $XX.XX
[adoption rank context]      [adoption rank context]      [adoption rank context]
[Shop Now →]                 [Shop Now →]                 [Shop Now →]
Socelle earns a small commission on purchases made through this link. ℹ️
```

**Example placements:**
- Skincare benchmark page → Top Performing in Skincare: SkinCeuticals C E Ferulic (used by 67% of medspa operators), Dermalogica Daily Microfoliant (used by 54% of spas), Image Skincare Vital C (used by 41% of solo estheticians)
- Professional haircare benchmark → Top Performing in Color: Wella Professionals Color Touch, Schwarzkopf IGORA, Redken Shades EQ

---

### Surface 6: Quiz Results Pages

**Trigger condition:** Quiz results page displays a result category that matches one or more affiliate product categories. Quiz result type is mapped to product category in the placement configuration.

**Block format:** "What Pros Recommend Based on Your Results" — 2–3 products with direct relevance to the quiz outcome. Products are highly curated for the specific quiz result persona.

**Max placements:** 1 block per quiz result page. Counts as 1 of the 2 maximum page placements.

**Position:** Below the results summary and any data visualization. Above CTA to share results or take another quiz.

**Copy conventions:**
```
SOCELLE PICK
What Pros Recommend Based on Your Results

[Product Image]              [Product Image]              [Product Image]
Product Name                 Product Name                 Product Name
by Brand                     by Brand                     by Brand
$XX.XX                       $XX.XX                       $XX.XX
[why this fits your          [why this fits your          [why this fits your
result profile]              result profile]              result profile]
[Shop Now →]                 [Shop Now →]                 [Shop Now →]
Socelle earns a small commission on purchases made through this link. ℹ️
```

**Quiz-to-product category mapping:**

| Quiz Type | Result Profile | Product Recommendations |
|---|---|---|
| Medspa income gap | High opportunity in body contouring | Aesthetic body devices, CoolSculpting alternatives, referral to Hydrafacial lead program |
| Treatment menu optimization | Missing dermaplaning revenue | Dermaplaning tool kit, blades, aftercare products |
| Retail revenue gap | Under-utilizing retail sales | Retail display fixtures, top retail skincare products, POS systems |
| CE credit tracker | Need credits in [specialty] | CE course subscriptions, relevant textbooks, technique tools |

**Example placement:**
- Medspa income gap quiz — result: "You have untapped device revenue potential" → Socelle Pick: Hydrafacial Device Inquiry (lead form, $250 referral), Dermalogica Professional Device ($445, Shop Now), NuFace Trinity Pro ($299, Shop Now)

---

### Surface 7: Daily Briefing Email

**Trigger condition:** Always present — one product placement in every daily briefing email.

**Block format:** "Editor's Pick" — single product with image, product name, brand, 2-sentence description, price, and CTA button. The most constrained placement format. One product only.

**Max placements:** 1 product per email. No exceptions.

**Position:** Bottom of email, above footer, unsubscribe link, and legal text.

**Copy conventions:**
```
───────────────────────────────────────
EDITOR'S PICK

[Product Image — 300x200px]

[Product Name] by [Brand]
$[Price]

[Sentence 1: What it is and why it matters to this operator.]
[Sentence 2: Specific professional use case or peer adoption data point.]

[Shop Now →]  (affiliate link)

Socelle earns a small commission on purchases made through this link.
About our recommendations: socelle.com/about/recommendations
───────────────────────────────────────
```

**Editorial cadence:**
- Monday: Featured professional tool relevant to the week's top story
- Tuesday: Skincare product tied to a technique or trend in that day's brief
- Wednesday: Business tool or practice management product
- Thursday: Education resource (book, course, software)
- Friday: Premium or aspirational product — "weekend upgrade" framing

**Example placements:**
- Monday briefing (top story: AHA regulations update) → Editor's Pick: SkinCeuticals Blemish + Age Solution, $76. "The gold standard in professional AHA-based treatment. Now available with affiliate pricing through SOCELLE. Used by 71% of medspa operators in our network."
- Wednesday briefing (business edition) → Editor's Pick: GlossGenius All-in-One Salon Platform, from $24/month. "The most-adopted booking and POS platform among solo estheticians tracked in our data. Free 30-day trial for SOCELLE readers."

---

## Section 3: Trust Guardrails — 7 Mandatory Rules

### Rule 1: Disclosure Label

**The rule:** All affiliate content is labeled "Socelle Pick" with an info icon (ℹ️) that links to `/about/recommendations`. The label "Socelle Pick" is the universal disclosure signal. No exceptions.

**Implementation mechanism:** A global CSS class `.socelle-pick-block` is required on every affiliate placement wrapper. The `SocellePickCard` React component enforces the label in its render output — the label is not removable via props. The `/about/recommendations` link is hardcoded in the component, not configurable per placement.

**Rationale:** FTC guidelines require clear and conspicuous disclosure of material connections, including affiliate compensation. "Socelle Pick" is the equivalent of "Wirecutter Pick" — it signals editorial curation while being unambiguously distinct from organic editorial content. Consistent labeling builds reader trust over time rather than eroding it.

---

### Rule 2: No Disguised Editorial

**The rule:** Affiliate blocks are never styled to look like organic article content, editorial recommendations, or editorial picks that omit disclosure. The visual treatment of a Socelle Pick block must always be visually distinguishable from surrounding editorial content.

**Implementation mechanism:** `SocellePickCard` components receive a mandatory left border in `pro-gold` (#D4A44C), a light background tint (`pro-cream` #EDEDE5), and the "Socelle Pick" badge in all caps in a smaller weight. No variant of the component omits these visual differentiators. Code review checklist item: "Does this affiliate block look like a native article element? If yes, reject."

**Rationale:** The FTC requires that disclosure be "in a place and a format that consumers will notice and understand." Disguising affiliate content as editorial is both an FTC violation and a reader trust violation. SOCELLE's credibility as an intelligence platform depends on editorial independence being unambiguous.

---

### Rule 3: Page Cap (Maximum 2 Placements)

**The rule:** No page may contain more than 2 affiliate placements. This applies to any combination of Socelle Pick blocks across all surfaces rendered on a single page.

**Implementation mechanism:** The placement renderer (`AffiliatePlacementRenderer`) maintains a page-level counter. Before rendering each placement block, it checks `affiliatePlacementsRendered < 2`. If the count has reached 2, the component returns `null` for all subsequent placements on that page. This is enforced at the component level, not at the data layer — a data layer check alone is insufficient because multiple components may render on the same page.

**Rationale:** Over-commercialization destroys editorial credibility. Two placements per page is the maximum before readers begin to feel the content is organized around selling rather than informing. The Wirecutter model maintains high reader trust precisely because recommendations are sparse and highly curated.

---

### Rule 4: Editorial Curation Required

**The rule:** No affiliate product placement is fully automated. Every placement requires a human editor to assign `relevance_score >= 0.70` before the product is eligible for display.

**Implementation mechanism:** The `affiliate_products` table has a `relevance_score NUMERIC(3,2)` column. Products are inserted with `relevance_score = 0.00` by default. A product with `relevance_score < 0.70` is never returned by the placement query (`WHERE relevance_score >= 0.70 AND is_active = true`). The admin dashboard placement assignment form requires the editor to explicitly set the relevance score using a slider (0.00–1.00) with a minimum of 0.70 to save. There is no way to publish a placement without editor review.

**Rationale:** Fully algorithmic placement is advertising, not editorial. The moment placements are determined by bid price or pure engagement optimization, reader trust in the "Socelle Pick" label collapses. Human editorial judgment is the moat.

---

### Rule 5: Relevance Scoring

**The rule:** Products must be professionally relevant to the target operator audience. "Professionally relevant" means: a licensed beauty professional would plausibly encounter, use, or buy this product in the course of their professional practice.

**Implementation mechanism:** Editor assigns relevance score (0.00–1.00) using these criteria:
- 0.90–1.00: Product is specifically designed for professional beauty operators. No consumer alternative exists.
- 0.75–0.89: Product is primarily professional but has a consumer version. The affiliate link targets the professional version.
- 0.70–0.74: Product is not professional-only but is widely adopted by the SOCELLE target audience. Clear professional use case exists.
- Below 0.70: Product may be generally useful but has no clear professional beauty relevance. Never displayed.

Category matching uses the `category` field on `affiliate_products` to match placement surface context. An article tagged `skincare` can only trigger placements where `affiliate_products.category IN ('skincare', 'devices', 'tools')`.

**Rationale:** Irrelevant affiliate placements damage the Socelle Pick brand faster than any other failure mode. A medspa director seeing an affiliate link to a consumer face wash or a generic kitchen product would immediately distrust all future Socelle Picks.

---

### Rule 6: Sentiment Auto-Removal

**The rule:** If an affiliate product's brand receives an average operator rating of less than 3.0 stars in SOCELLE review data, the product is automatically deactivated from all placements.

**Implementation mechanism:** A nightly automated job `socelle-check-affiliate-sentiment` (runs at 2:00 AM UTC) executes the following logic:

```sql
UPDATE socelle.affiliate_products ap
SET is_active = false,
    deactivation_reason = 'sentiment_flag',
    updated_at = NOW()
FROM (
  SELECT brand, AVG(rating) as avg_rating
  FROM socelle.brand_reviews
  GROUP BY brand
  HAVING AVG(rating) < 3.0
) flagged_brands
WHERE ap.brand = flagged_brands.brand
  AND ap.is_active = true;
```

Deactivated products are flagged in the admin dashboard for editor review. Editor can either (a) keep deactivated, (b) investigate and reactivate if data is insufficient (fewer than 5 reviews), or (c) escalate to remove from affiliate catalog entirely.

A warning threshold at 3.5 stars triggers an alert to the editor (no automatic deactivation) to allow proactive review before the 3.0 threshold is crossed.

**Rationale:** SOCELLE's intelligence data is the basis for placement decisions, not just editorial opinions. If SOCELLE's own operator community is rating a brand below 3.0 stars, continuing to recommend that brand's products for affiliate revenue is a direct conflict of interest with the platform's intelligence mission. Auto-removal makes the system self-consistent.

---

### Rule 7: Revenue Firewall

**The rule:** Affiliate revenue data — clicks, conversion rates, commission earned per product — is never disclosed to brand intelligence clients and is never visible in any brand-facing dashboard. A brand cannot determine whether SOCELLE is earning affiliate revenue on their category, their brand, or a competitor brand.

**Implementation mechanism:** The `affiliate_clicks` table resides in the `socelle` schema with Row Level Security policies allowing INSERT from public (click recording) and SELECT only for `service_role` (internal analytics). No brand-facing API endpoint ever queries `affiliate_clicks` or `affiliate_placements`. Brand Intelligence Hub components never import from the affiliate data layer. The internal analytics dashboard is admin-only and not accessible via shared links or exported reports.

**Rationale:** If brand intelligence clients (who pay for SOCELLE market data and competitor analysis) could see that SOCELLE earns more commission from Brand A than Brand B, they would reasonably question whether SOCELLE's intelligence reports are influenced by affiliate economics. The firewall ensures the intelligence product's credibility is never compromised by the commerce layer.

---

### 3.1 Transparency Page — `/about/recommendations`

**Full page copy (editorial, 350 words):**

---

**How We Choose What We Recommend**

SOCELLE is an intelligence platform. Our core job is to give licensed beauty professionals accurate, unbiased data about brands, products, market trends, and industry performance. That job is incompatible with compromised recommendations.

Here is exactly how our recommendation system works, with no fine print.

**What "Socelle Pick" means**

When you see a "Socelle Pick" label on this platform, it means our editorial team reviewed a product and decided it is genuinely useful for licensed beauty professionals. We consider professional-grade quality, adoption by operators in our network, price-to-value ratio, and alignment with current techniques and treatment standards.

Socelle Pick is never a paid placement. Brands cannot purchase a Socelle Pick designation. No product appears because a brand paid us to feature it.

**How we earn revenue from recommendations**

If you click a "Shop Now" link on a Socelle Pick and make a purchase, we may earn a small commission from the retailer or the affiliate network. This is called affiliate commerce, and it is how publications like Wirecutter, The Strategist, and many professional editorial outlets sustain their work.

Our affiliate commission has zero influence on which products appear. A product with a 15% commission rate is held to the same editorial standard as a product with a 3% commission rate. If both products are excellent, both may appear. If neither is excellent, neither appears.

**What keeps us honest**

We maintain four automatic guardrails. First, affiliate content is always labeled — you will never see a Socelle Pick that omits the disclosure or the link to this page. Second, every product is scored by a human editor; no fully automated placement is ever displayed. Third, if a brand in our affiliate catalog receives an average operator rating below 3.0 stars from our network, that brand's products are automatically removed from recommendations — our intelligence data cannot endorse what our community has rejected. Fourth, our affiliate revenue data is never shared with brand intelligence clients, so our market analysis is never influenced by which brands generate commission.

**Your feedback**

If you believe a Socelle Pick recommendation is not genuinely useful for professional operators, or if you suspect a conflict of interest, contact us at editorial@socelle.com. We investigate every report.

---

## Section 4: Affiliate Database Schema

### Table Definitions

**Table 1: `socelle.affiliate_products`**

```sql
CREATE TABLE socelle.affiliate_products (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                    TEXT NOT NULL,
    brand                   TEXT,
    category                TEXT NOT NULL
                                CHECK (category IN (
                                    'skincare', 'haircare', 'tools', 'devices',
                                    'nails', 'business', 'supplies', 'wellness'
                                )),
    subcategory             TEXT,
    description             TEXT,
    image_url               TEXT,
    affiliate_url           TEXT NOT NULL,
    affiliate_network       TEXT NOT NULL
                                CHECK (affiliate_network IN (
                                    'shareasale', 'impact', 'cj', 'amazon', 'brand_direct'
                                )),
    affiliate_program_id    TEXT,
    commission_rate         NUMERIC(4,2),
    cookie_duration_days    INT,
    price_cents             INT,
    is_active               BOOLEAN NOT NULL DEFAULT true,
    relevance_score         NUMERIC(3,2)
                                CHECK (relevance_score >= 0.00 AND relevance_score <= 1.00),
    deactivation_reason     TEXT
                                CHECK (deactivation_reason IN (
                                    'low_relevance', 'sentiment_flag',
                                    'discontinued', 'manual', NULL
                                )),
    last_price_check        TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Table 2: `socelle.affiliate_placements`**

```sql
CREATE TABLE socelle.affiliate_placements (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_product_id    UUID NOT NULL REFERENCES socelle.affiliate_products(id)
                                ON DELETE CASCADE,
    surface_type            TEXT NOT NULL
                                CHECK (surface_type IN (
                                    'feed', 'brand_page', 'event',
                                    'education', 'benchmark', 'quiz_result', 'email'
                                )),
    surface_entity_id       UUID,
    -- NULL means: apply globally to this surface_type (every article, every event, etc.)
    -- Non-NULL means: apply specifically to this entity (this article ID, this brand ID, etc.)
    position                INT NOT NULL DEFAULT 1,
    is_active               BOOLEAN NOT NULL DEFAULT true,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deactivated_at          TIMESTAMPTZ
);
```

**Table 3: `socelle.affiliate_clicks`**

```sql
CREATE TABLE socelle.affiliate_clicks (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement_id                UUID NOT NULL REFERENCES socelle.affiliate_placements(id)
                                    ON DELETE RESTRICT,
    user_id                     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    -- NULL for anonymous / unauthenticated clicks
    session_id                  TEXT NOT NULL,
    -- Required for anonymous tracking; also present for authenticated users
    clicked_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    referrer_url                TEXT,
    converted                   BOOLEAN NOT NULL DEFAULT false,
    conversion_reported_at      TIMESTAMPTZ,
    conversion_value_cents      INT,
    commission_earned_cents     INT
);
```

---

### 4.1 Indexes

```sql
-- affiliate_clicks: primary query patterns
CREATE INDEX idx_affiliate_clicks_placement_date
    ON socelle.affiliate_clicks (placement_id, clicked_at DESC);

CREATE INDEX idx_affiliate_clicks_user
    ON socelle.affiliate_clicks (user_id)
    WHERE user_id IS NOT NULL;

CREATE INDEX idx_affiliate_clicks_converted
    ON socelle.affiliate_clicks (converted, conversion_reported_at)
    WHERE converted = true;

CREATE INDEX idx_affiliate_clicks_session
    ON socelle.affiliate_clicks (session_id, clicked_at DESC);

-- affiliate_placements: primary query patterns
CREATE INDEX idx_affiliate_placements_surface
    ON socelle.affiliate_placements (surface_type, is_active)
    WHERE is_active = true;

CREATE INDEX idx_affiliate_placements_entity
    ON socelle.affiliate_placements (surface_type, surface_entity_id)
    WHERE is_active = true AND surface_entity_id IS NOT NULL;

CREATE INDEX idx_affiliate_placements_product
    ON socelle.affiliate_placements (affiliate_product_id);

-- affiliate_products: primary query patterns
CREATE INDEX idx_affiliate_products_active_category
    ON socelle.affiliate_products (category, is_active, relevance_score DESC)
    WHERE is_active = true;

CREATE INDEX idx_affiliate_products_network
    ON socelle.affiliate_products (affiliate_network, is_active);

CREATE INDEX idx_affiliate_products_brand
    ON socelle.affiliate_products (brand);
```

---

### 4.2 Row Level Security Policies

```sql
-- Enable RLS on all tables
ALTER TABLE socelle.affiliate_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE socelle.affiliate_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE socelle.affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- affiliate_products: public can see active products only
CREATE POLICY affiliate_products_select_public
    ON socelle.affiliate_products
    FOR SELECT
    USING (is_active = true);

-- affiliate_products: only service_role can insert or update
CREATE POLICY affiliate_products_insert_service
    ON socelle.affiliate_products
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY affiliate_products_update_service
    ON socelle.affiliate_products
    FOR UPDATE
    USING (auth.role() = 'service_role');

-- affiliate_placements: public can see active placements for rendering
CREATE POLICY affiliate_placements_select_public
    ON socelle.affiliate_placements
    FOR SELECT
    USING (is_active = true);

-- affiliate_placements: only service_role can modify
CREATE POLICY affiliate_placements_insert_service
    ON socelle.affiliate_placements
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY affiliate_placements_update_service
    ON socelle.affiliate_placements
    FOR UPDATE
    USING (auth.role() = 'service_role');

-- affiliate_clicks: any authenticated or anonymous user can insert (click recording)
CREATE POLICY affiliate_clicks_insert_public
    ON socelle.affiliate_clicks
    FOR INSERT
    WITH CHECK (true);

-- affiliate_clicks: only service_role (admin/analytics) can read click data
CREATE POLICY affiliate_clicks_select_admin
    ON socelle.affiliate_clicks
    FOR SELECT
    USING (auth.role() = 'service_role');
```

---

### 4.3 Revenue Summary View

```sql
CREATE OR REPLACE VIEW socelle.affiliate_revenue_summary AS
SELECT
    ap.affiliate_network                                        AS network,
    ap.category                                                 AS category,
    DATE_TRUNC('month', ac.clicked_at)                         AS month,
    COUNT(ac.id)                                               AS total_clicks,
    COUNT(ac.id) FILTER (WHERE ac.converted = true)            AS total_conversions,
    ROUND(
        COUNT(ac.id) FILTER (WHERE ac.converted = true)::NUMERIC
        / NULLIF(COUNT(ac.id), 0) * 100, 2
    )                                                           AS conversion_rate_pct,
    COALESCE(SUM(ac.conversion_value_cents), 0)                AS total_gmv_cents,
    COALESCE(SUM(ac.commission_earned_cents), 0)               AS total_commission_cents,
    ROUND(
        COALESCE(SUM(ac.commission_earned_cents), 0)::NUMERIC
        / NULLIF(COUNT(ac.id), 0), 2
    )                                                           AS commission_per_click_cents,
    COUNT(DISTINCT apl.id)                                     AS active_placements,
    COUNT(DISTINCT ap.id)                                       AS active_products
FROM socelle.affiliate_clicks ac
JOIN socelle.affiliate_placements apl ON ac.placement_id = apl.id
JOIN socelle.affiliate_products ap ON apl.affiliate_product_id = ap.id
GROUP BY
    ap.affiliate_network,
    ap.category,
    DATE_TRUNC('month', ac.clicked_at)
ORDER BY
    month DESC,
    total_commission_cents DESC;
```

---

## Section 5: Admin Dashboard Specification

### 5.1 Affiliate Product Management

**Add New Product — Form Fields:**
- Product name (text, required)
- Brand (text, required)
- Category (select: skincare | haircare | tools | devices | nails | business | supplies | wellness, required)
- Subcategory (text, optional)
- Description (textarea, max 500 chars)
- Image URL (text with live preview) — validated on save
- Affiliate URL (text, required) — URL validator runs on save; verifies URL resolves and returns 200
- Affiliate Network (select: ShareASale | Impact | CJ | Amazon | Brand Direct, required)
- Affiliate Program ID (text, optional — for network reporting reconciliation)
- Commission Rate (numeric input, 0–100%, required)
- Cookie Duration (numeric input, days, optional)
- Price (currency input in dollars, auto-converts to cents for storage, required)
- Relevance Score (slider 0.00–1.00, minimum 0.70 to publish, required)

**Validation before save:**
- Affiliate URL returns 200 (live check)
- Image URL returns 200 and is an image content-type
- Relevance score is >= 0.70 (warn if attempting to save below this)
- Commission rate is within typical network range (warn if > 30% or < 1%)

**Edit Product:**
- Same form as Add New
- Additional field: Deactivation Reason (select: low_relevance | sentiment_flag | discontinued | manual) — required when `is_active` is toggled to false
- Deactivation logs: show history of deactivation/reactivation events with timestamps and reasons

**Bulk Import — CSV Upload:**
- Required columns: `name, brand, category, affiliate_url, affiliate_network, price_usd, commission_rate_pct`
- Optional columns: `subcategory, description, image_url, affiliate_program_id, cookie_duration_days`
- CSV is validated before import: all required columns present, affiliate URLs checked (async batch), categories validated against enum
- After validation: editor sets a default relevance_score for all imported products (overridable per row in a preview table before confirming import)
- Imported products have `is_active = false` until editor reviews and activates individually or in batch

**Deactivate Product:**
- Toggle `is_active = false` with required reason selection (low_relevance | sentiment_flag | discontinued | manual)
- Reason and timestamp logged
- All active placements for this product are simultaneously deactivated
- Admin notified of deactivation cascade (how many placements were affected)

---

### 5.2 Placement Assignment

**Assign Product to Surface:**

Form fields:
1. Product (searchable select — shows active products with relevance_score >= 0.70 only)
2. Surface Type (select: news feed | brand page | event | education | benchmarking | quiz result | email)
3. Scope:
   - "Global for surface type" — applies to all entities of this surface type (e.g., all news feed articles in category X)
   - "Specific entity" — select a specific article, brand, or event by name/ID
4. Category filter (optional) — if global, limit to articles/events in this category
5. Position (select: 1 | 2 — where on the page if multiple placements are active)

**Preview mode:** After filling form, editor sees a live preview rendering of the Socelle Pick card as it will appear on the target surface. Preview uses real product data. Label, disclosure text, and visual treatment are shown exactly as they will appear to operators.

**A/B Testing (Phase 2 — not at launch):**
- Allow 2 product variants per placement slot
- System randomly assigns variant A or B per session
- Track CTR and conversion rate by variant
- Admin can manually "declare winner" and deactivate the lower-performing variant
- Statistical significance indicator: shows when enough clicks exist for reliable comparison (minimum 100 clicks per variant)

---

### 5.3 Reporting Dashboard

**Daily Summary Card (top of admin dashboard):**
- Total clicks today (vs yesterday, vs 7-day avg)
- Total conversions today
- Estimated commission today (in dollars)
- CTR (clicks / page views with affiliate block)
- Breakdown by surface type in horizontal bar chart

**Product Performance Table:**
- Top 10 products by clicks (30-day rolling)
- Top 10 products by conversion rate
- Top 10 products by commission earned
- Columns: Product name, Brand, Network, Clicks, Conversions, CVR%, Commission
- Sortable by any column
- Filter by network, category, date range

**Network Comparison Table:**
- Columns: Network, Active Products, Total Clicks, Conversions, CVR%, Total Commission, Avg Commission/Click, Avg Commission Rate%
- Used for quarterly network review: are we prioritizing the right networks?

**Flagged Products Panel:**
- Products approaching the 3.0-star sentiment threshold (currently avg 3.0–3.5 stars in brand_reviews)
- Displays: Product name, Brand, Current avg rating, Review count, Recommendation: "Monitor" | "Review Now"
- One-click access to brand profile page and brand_reviews data for that brand

---

### 5.4 Automated Monitoring

**Weekly Price Check Job (`socelle-affiliate-price-check`):**
- Runs Sunday at 3:00 AM UTC
- For each active affiliate product, fetches the affiliate URL and extracts current price from structured data (JSON-LD Product schema) or falls back to regex price extraction
- If extracted price differs from stored `price_cents` by more than 15%: flags product in admin dashboard as "price changed"
- Editor receives weekly email digest of all price-changed products
- Price is never auto-updated — editor must confirm

**Sentiment Cross-Check Job (`socelle-check-affiliate-sentiment`):**
- Runs nightly at 2:00 AM UTC (described in Rule 6 above)
- Deactivates products where brand avg rating < 3.0 stars
- Sends admin alert for any new deactivations

**Dead Link Check Job (`socelle-affiliate-link-check`):**
- Runs Saturday at 4:00 AM UTC
- Performs HTTP HEAD request on all active affiliate URLs
- If URL returns 404, 403, or redirect to a non-product page: flags as "broken link"
- Admin email digest lists all broken links with one-click deactivation button
- Products with broken links are not auto-deactivated (retailer may have temporary issues) but are flagged prominently in admin

**Commission Rate Alert:**
- When editors update a product's commission_rate, a trigger logs the previous and new rate
- If the change exceeds 3 percentage points (up or down), an alert is shown in admin dashboard: "Commission rate changed significantly — review placement priority"
- Network-level commission changes (e.g., ShareASale updates program terms) require manual review; no automatic tracking of network-level rate changes exists (rely on network email notifications)

---

## Section 6: Revenue Projection Model

### 6.1 Formula

```
Monthly Revenue = PV × appearance_rate × CTR × CVR × AOV × commission_rate
```

Where:
- `PV` = Monthly page views (total platform)
- `appearance_rate` = % of pages that display an affiliate placement (estimated 40% of pages qualify)
- `CTR` = Click-through rate on affiliate blocks (2.0–3.0% for editorial placement)
- `CVR` = Conversion rate from click to purchase (5.0% industry standard for professional products)
- `AOV` = Average order value ($80 blended across professional beauty product types)
- `commission_rate` = Blended average commission rate across all networks (8%)

### 6.2 Base Case Projection (Month-by-Month)

| Month | PV | Pages w/ Affiliate | Affiliate Impressions | CTR | Clicks | CVR | Conversions | AOV | Revenue |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 2,000 | 40% | 800 | 2.0% | 16 | 5% | 1 | $80 | ~$6 |
| 2 | 5,000 | 40% | 2,000 | 2.0% | 40 | 5% | 2 | $80 | ~$13 |
| 3 | 10,000 | 40% | 4,000 | 2.5% | 100 | 5% | 5 | $80 | ~$32 |
| 4 | 20,000 | 40% | 8,000 | 2.5% | 200 | 5% | 10 | $80 | ~$64 |
| 5 | 35,000 | 40% | 14,000 | 2.5% | 350 | 5% | 18 | $80 | ~$112 |
| 6 | 50,000 | 40% | 20,000 | 3.0% | 600 | 5% | 30 | $80 | ~$192 |
| 7 | 70,000 | 40% | 28,000 | 3.0% | 840 | 5% | 42 | $80 | ~$269 |
| 8 | 90,000 | 40% | 36,000 | 3.0% | 1,080 | 5% | 54 | $80 | ~$346 |
| 9 | 100,000 | 40% | 40,000 | 3.0% | 1,200 | 5% | 60 | $80 | ~$384 |
| 10 | 120,000 | 40% | 48,000 | 3.0% | 1,440 | 5% | 72 | $80 | ~$461 |
| 11 | 135,000 | 40% | 54,000 | 3.0% | 1,620 | 5% | 81 | $80 | ~$518 |
| 12 | 150,000 | 40% | 60,000 | 3.0% | 1,800 | 5% | 90 | $80 | ~$576 |

**Year 1 Total (Base Case): ~$2,977**

Note: The docx revenue estimate of "$2K–$5K/month in the first 6 months" assumes a faster traffic ramp than shown here. The base case above reflects a conservative organic-only ramp. With content seeding and SEO investment accelerating in months 3–4, the month 6 figure can reach $500–$1,500/month.

---

### 6.3 Upside Scenario

Conditions: Featured placements at 12–15% commission (brand-direct programs), higher AOV products ($120+ devices and professional equipment), CTR of 4–5% with editorial optimization.

| Month | PV | Clicks (4% CTR) | Conversions (6% CVR) | AOV | Commission | Revenue |
|---|---|---|---|---|---|---|
| 6 | 50,000 | 1,000 | 60 | $120 | 12% | ~$864 |
| 9 | 100,000 | 2,000 | 120 | $120 | 12% | ~$1,728 |
| 12 | 150,000 | 3,000 | 180 | $120 | 12% | ~$2,592 |

**Upside Year 1 Total: ~$12,000–$15,000**

This scenario is achievable if: Hydrafacial lead referral program is active (single referral = $200–$500), brand-direct programs are signed by month 3, and 2–3 high-commission device products ($300+ AOV at 12% commission) are featured in email placements weekly.

---

### 6.4 Downside Scenario

Conditions: CTR underperforms at 1.0% (poorly placed or too similar to editorial, requiring visual redesign), CVR at 3% (audience is research-oriented, not ready to buy).

| Month | PV | Clicks (1% CTR) | Conversions (3% CVR) | AOV | Commission | Revenue |
|---|---|---|---|---|---|---|
| 6 | 50,000 | 200 | 6 | $80 | 8% | ~$38 |
| 9 | 100,000 | 400 | 12 | $80 | 8% | ~$77 |
| 12 | 150,000 | 600 | 18 | $80 | 8% | ~$115 |

**Downside Year 1 Total: ~$500**

If CTR falls below 1.5% for two consecutive months, trigger an editorial placement review: reposition blocks on page, test new copy for card descriptions, assess whether surface type is wrong for the product category. Do not chase revenue by removing trust guardrails.

---

### 6.5 Revenue Trajectory Narrative

Months 1–2: Activation phase. 50 hero products live. Revenue is negligible ($5–$15/month). Use this period to establish editorial baseline, test card designs, and measure CTR per surface type.

Months 3–4: Learning phase. 100+ products live. Begin weekly editorial picks for email. First brand-direct program likely onboarded. Revenue $30–$100/month.

Months 5–6: Growth phase. 200+ products. SEO organic traffic begins compounding from brand profile pages and event pages. Quiz result placements online. Revenue $150–$500/month.

Months 7–9: Compounding phase. Traffic growth accelerates as indexed pages accumulate authority. Affiliate catalog at 300+ products with strong category coverage. Revenue $300–$800/month.

Months 10–12: Scale phase. 150K+ monthly page views. Email list at 5,000+ subscribers with strong daily briefing open rates. Revenue $500–$1,200/month.

**Year 2 projection (not shown):** At 300K+ monthly page views with optimized placements, $2,000–$5,000/month becomes achievable. This matches the docx estimate but is a Year 2, not Year 1, outcome under organic-only traffic growth.

---

## Section 7: Affiliate Network Comparison Sheet

| Attribute | ShareASale | Impact.com | CJ Affiliate | Amazon Associates | Brand-Direct |
|---|---|---|---|---|---|
| **Application URL** | account.shareasale.com/newsignup.cfm | impact.com/affiliates | cj.com/publisher | affiliate-program.amazon.com | Individual brand sites |
| **Application requirements** | Website, audience description, promotional methods. No traffic minimum. | Website, audience, content type. Editorial platforms preferred. | Website, traffic data, monetization strategy. More detailed than ShareASale. | Website with content. Must generate 3 sales in 180 days. | Varies by brand. Some require editorial track record. |
| **Approval timeline** | 3–14 days per merchant | 7–21 days per merchant | 7–14 days publisher, 5–30 days per merchant | 24–72 hours (conditional) | 1–4 weeks |
| **Commission rates (beauty)** | 5–15% (avg 8–10% for pro tools) | 6–15% (avg 8–12% for prestige skincare) | 4–12% (avg 6–8% for equipment/retail) | 3–8% by subcategory (beauty: 6–8%) | 10–15%+ (higher for direct relationships) |
| **Cookie duration** | 30–90 days (negotiate) | 30–60 days | 30–120 days | 24 hours (cart: 90 days) | 30–60 days |
| **Payment terms** | Net 30 | Net 30 or Net 45 | Net 20 (performance) or Net 30 | Net 60 | Net 30 |
| **Minimum payout** | $50 | $10 | $25 | $10 (direct deposit), $100 (check) | Varies, typically $50–$100 |
| **Deep linking** | Yes — full deep-link builder | Yes — Link Builder + UTM | Yes — Link Builder | Yes — Site Stripe / OneLink | Varies by brand |
| **Beauty product catalog size** | Large — thousands of specialty brands; strong in professional tools and indie brands | Medium-large — focused on prestige/luxury; excellent for SkinCeuticals, Dermalogica tier | Medium — better for equipment, supply chains, and retail channels | Massive — virtually any product on Amazon, but commission is lowest | Small per brand — but commission is highest |
| **Dashboard/reporting** | Good — real-time, basic API | Excellent — cross-device attribution, API, custom events | Good — CJ Insights, full API | Basic — click and conversion only, no API for clicks | Varies — often basic |
| **Priority at launch** | High | High | Medium | Medium | High (for Hydrafacial lead program specifically) |
| **SOCELLE use case** | Primary network for professional tools, salon equipment, indie beauty brands | Primary network for prestige skincare (SkinCeuticals, Dermalogica), luxury devices | Supplement for equipment, salon furniture, supply chain | Fallback for products not covered elsewhere; accessible price-point tools | Olaplex brand page, Hydrafacial device lead referrals |
| **Notes** | Broadest coverage for professional beauty tool brands. Apply to this first. | Best attribution tracking in the industry. Apply here second. Required for prestige brand coverage. | Lower commissions but broader equipment/supply coverage. Apply third. | Shortest cookie (24h) is a disadvantage. Use only when no better affiliate option exists. | Hydrafacial referral is a disproportionate revenue opportunity. Pursue independently from network applications. |

---

## Acceptance Criteria — Self-Verification

- [x] All 7 placement surfaces specified with trigger condition, block format, position, max placement count, copy template, and example products
- [x] 7 trust guardrails each with the rule, implementation mechanism, and rationale
- [x] Schema handles click tracking (affiliate_clicks), conversion attribution (converted, conversion_reported_at, conversion_value_cents, commission_earned_cents), and commission data
- [x] Admin dashboard covers product management (add/edit/bulk import/deactivate), placement assignment (with preview), and reporting (daily summary, product performance, network comparison)
- [x] Sentiment auto-removal specified: avg brand rating < 3.0 stars in brand_reviews → is_active = false, reason = 'sentiment_flag', nightly job documented
- [x] Revenue projection with month-by-month figures for months 1–12, base/upside/downside scenarios, and explicit formula
- [x] Transparency page copy complete at approximately 350 words
- [x] All SQL tables, indexes, RLS policies, and revenue summary view are included in Section 4
