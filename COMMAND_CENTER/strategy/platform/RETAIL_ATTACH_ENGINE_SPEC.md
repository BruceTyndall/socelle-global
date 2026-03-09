# RETAIL ATTACH ENGINE SPEC — Turning SKU Maps into Retail Conversion

## Overview

This spec describes a **conversion mechanics layer** added on top of the existing `retailAttachEngine.ts`. The engine itself is untouched. We are adding the presentation and calculation layer that transforms product recommendations into actionable retail conversion tools: bundled SKU sets, attach scripts, editable probability assumptions, and margin estimates.

### What Exists
- `retailAttachEngine.ts` maps services to the top 2 product recommendations with confidence scores (0–1)
- `business_plan_outputs` stores results under `output_type = 'retail_attach'`
- The Activation Kit tab in `PlanResults.tsx` has sections for marketing assets, training materials, and an export center

### What We Are Adding
- **Retail bundle construction**: group existing 1–2 recommendations into a named bundle with MSRP, sell price, and margin
- **Attach scripts**: short (in-service) and long (checkout) versions per bundle, generated from existing product and protocol data
- **Attach probability model**: editable defaults by service category, clearly labeled as estimates vs. confirmed values
- **Margin estimates**: computed from wholesale/MSRP when available; fallback to 50% COGS assumption (labeled)
- **Revenue projections**: annual retail revenue estimate per service, based on sessions and probability

### What We Are NOT Changing
- `retailAttachEngine.ts` — untouched
- `business_plan_outputs` table schema — no changes
- Existing product recommendation ranking logic — untouched
- Existing Activation Kit tab structure — extended, not replaced

### Integration Point
Extends the existing **Activation Kit tab** (`PlanResults.tsx`) with a new "Retail Conversion Toolkit" sub-section. This is not a new tab.

---

## Section 1: Existing Retail Attach Output Shape

The existing `retailAttachEngine.ts` stores results in `business_plan_outputs` with `output_type = 'retail_attach'`. The current output shape per service is:

```typescript
interface RetailAttachOutput {
  service_id: string;
  service_name: string;
  product_recommendations: {
    rank: 1 | 2;
    product_id: string;
    product_name: string;
    confidence: number;          // 0–1
    matching_criteria: string[]; // e.g. ["skin_type_match", "treatment_phase"]
    rationale: string;           // human-readable reason for recommendation
  }[];
  seasonal_relevance?: {
    is_seasonal: boolean;
    peak_months?: number[];
  };
  missing_data_flags?: string[]; // e.g. ["no_wholesale_price", "product_discontinued"]
}
```

### Fields Present vs. Missing for the Conversion Layer

| Field | Present | Needed | Source |
|---|---|---|---|
| `service_id` | Yes | Yes — bundle key | Existing |
| `service_name` | Yes | Yes — display + script | Existing |
| `product_recommendations[].product_id` | Yes | Yes — bundle product key | Existing |
| `product_recommendations[].product_name` | Yes | Yes — script generation | Existing |
| `product_recommendations[].rank` | Yes | Yes — maps to `role` in bundle | Existing |
| `product_recommendations[].confidence` | Yes | Yes — bundle confidence | Existing |
| `product_recommendations[].rationale` | Yes | Yes — benefit language source | Existing |
| `seasonal_relevance` | Yes | Yes — urgency framing | Existing |
| `missing_data_flags` | Yes | Yes — controls assumption labels | Existing |
| `msrp` | No | Must look up from `pro_products` / `retail_products` | DB lookup in builder |
| `wholesale_price` | No | Must look up from `pro_products` / `retail_products` | DB lookup in builder |
| `bundleMsrpTotal` | No | Computed | Computed |
| `suggestedSellPrice` | No | Computed | Computed |
| `estimatedMargin` | No | Computed | Computed |
| `attachProbabilityPct` | No | Defaulted by service category | Mapped |
| `revenuePerService` | No | Computed | Computed |
| `attach_script_short` | No | Generated from template | Generated |
| `attach_script_long` | No | Generated from template | Generated |

---

## Section 2: Retail Bundle Construction

`retailBundleBuilder.ts` reads the existing `RetailAttachOutput` for a service and constructs a `RetailBundle`. This is a pure transformation with one DB read (product pricing) and no writes.

### Bundle TypeScript Interface

```typescript
interface RetailBundle {
  serviceId: string;
  serviceName: string;
  bundleProducts: {
    productId: string;
    productName: string;
    msrp: number;
    wholesalePrice: number;
    role: 'hero' | 'support' | 'cross_sell';
    // hero     = rank 1 from retailAttachEngine
    // support  = rank 2 from retailAttachEngine
    // cross_sell = any additional product added by category rule (future expansion)
    rank: number;               // from existing retailAttachEngine
    confidence: number;         // from existing retailAttachEngine
  }[];
  bundleMsrpTotal: number;      // sum of all bundleProducts[].msrp
  suggestedSellPrice: number;   // bundleMsrpTotal × 0.9  (10% bundle discount)
  estimatedMargin: number;      // (suggestedSellPrice - totalWholesale) / suggestedSellPrice
  attachProbabilityPct: number; // editable; default from Section 4 table
  isUserEditedProbability: boolean; // true if user has changed the default
  revenuePerService: number;    // suggestedSellPrice × (attachProbabilityPct / 100)
}
```

### Role Assignment

| Rank from `retailAttachEngine` | Bundle Role |
|---|---|
| 1 | `hero` |
| 2 | `support` |
| 3+ (future) | `cross_sell` |

### Bundle Pricing Logic

```
bundleMsrpTotal     = sum of msrp for all bundleProducts
suggestedSellPrice  = bundleMsrpTotal × 0.9
totalWholesale      = sum of wholesalePrice for all bundleProducts
estimatedMargin     = (suggestedSellPrice - totalWholesale) / suggestedSellPrice
revenuePerService   = suggestedSellPrice × (attachProbabilityPct / 100)
```

### Pricing Data Fallback

1. Check `pro_products.msrp` and `pro_products.wholesale_price`
2. Fall back to `retail_products.msrp` and `retail_products.cost_price`
3. If neither available: set `msrp = 0`, `wholesalePrice = 0`, apply 50% COGS assumption, and add `"no_pricing_data"` to `missing_data_flags`

When 50% COGS assumption is applied, the UI must display:
> "Margin estimated at 50% — update with your actual wholesale pricing for accuracy"

This label uses the same assumption styling as the leakage engine price assumptions (prominent, inline).

---

## Section 3: Attach Script Generation

Two script variants are generated per bundle. Scripts are generated in `retailBundleBuilder.ts` from templates populated with product and protocol data.

### Short Script (In-Service Delivery — approx. 30 seconds)

**Template:**
```
"I used [hero_product_name] during your [service_name] today — it [hero_benefit]. 
We have it available at the front for $[hero_msrp]."
```

**Variable resolution:**

| Variable | Source | Fallback |
|---|---|---|
| `hero_product_name` | `bundleProducts[role='hero'].productName` | "this product" |
| `service_name` | `RetailBundle.serviceName` | "your service today" |
| `hero_benefit` | `brand_assets.training_content` benefit for this product → `canonical_protocol_steps` description → generic category benefit | Generic benefit by product category (see below) |
| `hero_msrp` | `bundleProducts[role='hero'].msrp` formatted as "$XX" | "check with the front desk for pricing" |

### Long Script (Checkout Delivery — approx. 90 seconds)

**Template:**
```
"I wanted to mention a couple of things I used today that I think would be great for you at home. 

[hero_product_name] is what I used for [treatment_step] — it [hero_benefit_1] and [hero_benefit_2]. 
I also used [support_product_name], which will help [support_benefit]. 

These are available as a set for $[bundle_sell_price] — it's what I recommend to maintain your results."
```

**Variable resolution:**

| Variable | Source | Fallback |
|---|---|---|
| `hero_product_name` | `bundleProducts[role='hero'].productName` | "the primary product" |
| `treatment_step` | `canonical_protocol_steps` step name for this service phase | "your treatment" |
| `hero_benefit_1` | First benefit from training content or protocol description | Generic benefit by category |
| `hero_benefit_2` | Second benefit from training content or protocol description | "maintain your results" |
| `support_product_name` | `bundleProducts[role='support'].productName` | Omit this sentence if no support product |
| `support_benefit` | Benefit from training content or protocol description for support product | "support your skin at home" |
| `bundle_sell_price` | `RetailBundle.suggestedSellPrice` formatted as "$XX" | "ask about our bundle pricing" |

### Generic Benefit Fallbacks by Product Category

Used when no training content or protocol description is available:

| Product Category | Generic Benefit |
|---|---|
| Cleanser | "gently clean without stripping" |
| Serum | "deliver active ingredients deeper into the skin" |
| Moisturizer | "lock in hydration and protect your skin barrier" |
| SPF / Sunscreen | "protect your results and prevent UV damage" |
| Exfoliant / Scrub | "keep skin smooth between treatments" |
| Mask | "provide a weekly treatment boost at home" |
| Body lotion / butter | "maintain softness and hydration" |
| Massage oil | "keep muscles relaxed and nourished" |
| Candle / aromatherapy | "extend the relaxation experience at home" |
| Nail treatment | "strengthen and protect between appointments" |
| Post-wax / post-care | "soothe and prevent ingrown hairs" |

### Script Storage

Scripts are generated at bundle build time in `retailBundleBuilder.ts` and stored on the `RetailBundle` object as:

```typescript
attachScripts: {
  short: string;
  long: string;
  generationMethod: 'training_content' | 'protocol_description' | 'generic_fallback';
}
```

The `generationMethod` field allows the UI to show a label when fallback language was used:
> "Script generated from category defaults — customize with your brand language"

---

## Section 4: Attach Probability Model

### Default Attach Probability by Service Category

| Service Category | Default Attach % | High-Performer % | Notes |
|---|---|---|---|
| Facial | 25% | 45% | Highest natural attach; skin care continuation intent is strong |
| Chemical peel | 35% | 55% | Post-care products are perceived as essential, not optional |
| Massage | 12% | 25% | Lower purchase intent; focus scripts on candles and oils |
| Body treatment | 20% | 40% | Scrubs and moisturizers attach well to body service context |
| MedSpa service | 40% | 65% | Medical-grade products command high compliance and perceived necessity |
| Hair service | 18% | 35% | Shampoo and treatment add-ons; stylist recommendation carries high trust |
| Nail service | 8% | 15% | Lowest natural attach; post-care cuticle and strengthening products |
| Waxing | 10% | 22% | Post-care focus; ingrown prevention and soothing products |

### Rules

- **Default** is the conservative starting point used on first load.
- **High-performer** is displayed as a reference point ("Top performers in this category see X%") — it is not pre-selected.
- The probability is **always editable** by the user via the probability slider (Section 7).
- Track whether the value has been edited: `isUserEditedProbability: boolean`
  - Default (unchanged): display as "est. X%"
  - User-edited: display as "X%" (no "est." prefix; treat as intentional input)
- If a service category does not match any row in the table, use 15% as the global default.

---

## Section 5: Margin Calculation

### Formula

```
retailMargin = (suggestedSellPrice - totalWholesale) / suggestedSellPrice

wholesalePrice = pro_products.wholesale_price
             OR retail_products.cost_price
             OR assumed at 50% of msrp  (ASSUMPTION — label prominently)

msrp           = pro_products.msrp
             OR retail_products.msrp

sessions_per_week  = business_settings.utilization_inputs.sessions_per_week OR default 4
weeks_per_month    = 4
weeks_per_year     = 48

monthly_retail_revenue = sessions_per_week × weeks_per_month × revenuePerService
annual_retail_revenue  = monthly_retail_revenue × 12
annual_retail_margin   = annual_retail_revenue × retailMargin
```

### Margin Display Format

Show margin as both a percentage and a dollar amount on every bundle card:

> "Est. 28% margin — $XX per attach"

Where "$XX per attach" = `suggestedSellPrice × retailMargin` (margin dollars per transaction).

### Assumption Labels

Apply the following labels wherever estimated values are used:

| Condition | Label |
|---|---|
| Wholesale price not available; 50% COGS assumed | "Margin estimated at 50% — update with your actual wholesale pricing" |
| MSRP not in database | "Pricing estimated — verify with your distributor" |
| Attach probability is default (not user-edited) | "est. X% attach" |
| Sessions/week is default (not user-provided) | "Based on estimated X sessions/week" |

---

## Section 6: Integration into Activation Kit Tab

### Existing Tab Structure

The Activation Kit tab currently contains three sections rendered sequentially:
1. Marketing assets
2. Training materials
3. Export center

### Where the Retail Conversion Toolkit Slots In

Insert the "Retail Conversion Toolkit" as a **new sub-section between Training materials and Export center**. Do not create a new tab. Do not duplicate existing sections.

```
Activation Kit tab
├── Marketing assets          (existing — unchanged)
├── Training materials        (existing — unchanged)
├── Retail Conversion Toolkit (NEW — this spec)
│   ├── Bundle cards for top 5 services by attach potential
│   ├── Attach scripts (collapsed by default)
│   └── Probability and margin assumptions
└── Export center             (existing — unchanged, but now includes bundle data in export)
```

### New Files Required

**`src/components/business/RetailBundleCard.tsx`**

Props:
```typescript
{
  bundle: RetailBundle;
  onProbabilityChange: (serviceId: string, newPct: number) => void;
  onShopBundleClick: (serviceId: string) => void;
}
```

Renders the bundle card per Section 7 display rules.

**`src/components/business/AttachScript.tsx`**

Props:
```typescript
{
  scripts: { short: string; long: string; generationMethod: string };
  serviceId: string;
  serviceName: string;
  onCopy: (serviceId: string, scriptVersion: 'short' | 'long') => void;
}
```

Renders the script expander with copy button. Collapsed by default.

**`src/lib/retailBundleBuilder.ts`**

```typescript
// Pure transformation function with one DB read (product pricing). No writes.
// Input: RetailAttachOutput[] from business_plan_outputs
//        + business_settings (sessions, pricing inputs)
// Output: RetailBundle[] sorted by estimated annual retail revenue DESC

export async function buildRetailBundles(
  retailAttachOutputs: RetailAttachOutput[],
  businessSettings: BusinessSettings
): Promise<RetailBundle[]>
```

Internal steps:
1. For each `RetailAttachOutput`, look up `msrp` and `wholesale_price` from `pro_products` or `retail_products`
2. Assign `role` based on `rank`
3. Compute `bundleMsrpTotal`, `suggestedSellPrice`, `estimatedMargin`
4. Apply default `attachProbabilityPct` from Section 4 table by `service_category`
5. Compute `revenuePerService`
6. Generate attach scripts from templates (Section 3)
7. Compute annual retail revenue estimate
8. Sort by annual retail revenue DESC
9. Return top 5 (all bundles available but top 5 rendered above fold)

---

## Section 7: Display Rules

### Bundle Card

Each bundle card shows the following elements in order:

1. **Service name** — bold header
2. **Hero product** — product name + MSRP + confidence badge
3. **Support product(s)** — product name + MSRP (1–2 items; omit row if none)
4. **Bundle sell price** — "Bundle: $XX (save X% vs. buying separately)"
5. **Margin and revenue line** — "Est. X% margin — $XX per attach"
6. **Annual revenue estimate** — "If you hit X% attach on this service: +$X,XXX/year"
   - Uses `isUserEditedProbability` to display "est." or confirmed value
7. **Probability slider** — always visible; labeled "Attach rate assumption"
   - Range: 1%–80%
   - Default from Section 4 table
   - Shows "est." prefix until user edits
8. **"Show script" expander** — collapsed by default; opens `AttachScript` component
9. **"Shop bundle" CTA** — links to product ordering or brand portal; fires `bundle_order_clicked` event

### Script Display (inside expander)

- Two tabs: "In-Service (30 sec)" and "Checkout (90 sec)"
- Full script text, untruncated
- "Copy script" button (clipboard API)
- If `generationMethod === 'generic_fallback'`: show label "Script generated from category defaults — customize with your brand language"

### Margin Display

- Format: "XX% margin — $XX per attach"
- Always show both % and $
- If assumption applied (50% COGS): append "(estimated)" and show inline label

### Annual Revenue Estimate Line

- Format: "If you hit X% attach on this service: **+$X,XXX/year**"
- X = `attachProbabilityPct` (with "est." if default)
- $X,XXX = `annual_retail_revenue` for this service, rounded to nearest $100

### Above-the-Fold Display

- Show top 5 bundles (by annual retail revenue DESC) above the fold
- "View all X services →" for remainder

---

## Section 8: Instrumentation Events

All events are fired from `RetailBundleCard.tsx` and `AttachScript.tsx`. The `retailBundleBuilder.ts` function emits no events.

| Event Name | Trigger | Properties |
|---|---|---|
| `retail_bundle_viewed` | Bundle card scrolled into viewport (IntersectionObserver) | `service_id`, `bundle_value` (bundleMsrpTotal), `product_count` |
| `script_copied` | "Copy script" button clicked | `service_id`, `script_version` ('short' or 'long'), `generation_method` |
| `attach_probability_edited` | Probability slider value committed (on blur or release) | `service_id`, `old_pct`, `new_pct` |
| `bundle_order_clicked` | "Shop bundle" CTA clicked | `service_id`, `product_count`, `bundle_sell_price` |
| `script_expander_opened` | "Show script" expander toggled open | `service_id`, `service_name` |
| `retail_view_all_clicked` | "View all X services →" clicked | `total_count`, `plan_id` |

### Event Schema Notes

- `service_id` = `RetailBundle.serviceId`
- `bundle_value` = `bundleMsrpTotal` as integer
- `script_version` = literal string `'short'` or `'long'`
- `old_pct` / `new_pct` = integer percentage values (e.g. 25, not 0.25)
- `generation_method` = value of `attachScripts.generationMethod`
- All events include standard session context (plan_id, user_id, timestamp) via the existing analytics wrapper
