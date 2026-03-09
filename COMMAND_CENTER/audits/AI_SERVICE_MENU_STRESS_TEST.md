# SOCELLE — AI Service Menu: Complete Build Logic & Stress Test Reference

**Generated:** March 8, 2026
**Purpose:** Full source documentation for stress testing the AI Service Menu intelligence pipeline
**Status:** ACTIVE in codebase — all engines functional

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture & Data Flow](#2-architecture--data-flow)
3. [Database Schema](#3-database-schema)
4. [Routes & UI](#4-routes--ui)
5. [Engine 1: menuOrchestrator.ts — Core Analysis Pipeline](#5-engine-1-menuorchestratorrs)
6. [Engine 2: PlanWizard.tsx — 3-Step Wizard UI](#6-engine-2-planwizardtsx)
7. [Engine 3: planOrchestrator.ts — Plan Generation Pipeline](#7-engine-3-planorchestratorrs)
8. [Engine 4: documentExtraction.ts — PDF/DOCX Extraction](#8-engine-4-documentextractionts)
9. [Engine 5: mappingEngine.ts — Service-to-Protocol Mapping](#9-engine-5-mappingenginets)
10. [Engine 6: gapAnalysisEngine.ts — Gap Analysis](#10-engine-6-gapanalysisenginets)
11. [Engine 7: retailAttachEngine.ts — Retail Product Recommendations](#11-engine-7-retailattachenginets)
12. [Scoring Algorithms Reference](#12-scoring-algorithms-reference)
13. [Stress Test Scenarios](#13-stress-test-scenarios)

---

## 1. System Overview

The AI Service Menu is SOCELLE's core intelligence feature. It allows spa/salon business users to upload their service menu, select a professional brand, and receive a comprehensive analysis including:

- **Protocol Matching** — Maps each service to the best-fit canonical protocol
- **Gap Analysis** — Identifies missing service categories, seasonal opportunities, signature treatments
- **Retail Attach** — Recommends retail products per service for revenue optimization
- **Brand Fit Score** — Quantifies how well a brand's protocols align with the business menu
- **Revenue Estimates** — Projects monthly revenue/profit for gap opportunities

### Key Principle
Intelligence platform first, marketplace second. The Service Menu analysis is the product hook — ecommerce is a transaction module beneath.

---

## 2. Architecture & Data Flow

```
User uploads menu (PDF/DOCX/paste)
         │
         ▼
┌─────────────────────┐
│  documentExtraction  │  ← PDF via pdfjs-dist, DOCX via mammoth
│  .ts                 │
└──────────┬──────────┘
           │ raw text
           ▼
┌─────────────────────┐
│  PlanWizard.tsx      │  ← 3-step UI: Upload → Brand Select → Analyze
│  (React component)   │
└──────────┬──────────┘
           │ calls runMenuAnalysis(planId, brandId, menuText)
           ▼
┌─────────────────────┐
│  menuOrchestrator.ts │  ← Core pipeline: parse → match → gaps → retail → score
│                      │
│  parseMenuText()     │──→ 4 regex patterns extract services
│  matchServices()     │──→ Category + keyword + duration scoring
│  identifyGaps()      │──→ Unmatched protocols = opportunities
│  generateRetail()    │──→ Category-based product matching
│  calculateFitScore() │──→ (matchRate×0.6 + avgQuality×0.4) × 100
│  saveOutputs()       │──→ business_plan_outputs table
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────────┐
│  PARALLEL PIPELINE (planOrchestrator.ts)     │
│                                              │
│  ┌──────────────┐  ┌──────────────────────┐ │
│  │ mappingEngine │  │ gapAnalysisEngine    │ │
│  │ .ts           │  │ .ts                  │ │
│  │               │  │                      │ │
│  │ Keyword +     │  │ Category benchmarks  │ │
│  │ pgvector      │  │ Seasonal protocols   │ │
│  │ semantic      │  │ Signature detection  │ │
│  │ matching      │  │ Enhancement gaps     │ │
│  └──────┬───────┘  └──────────┬───────────┘ │
│         │                     │              │
│         ▼                     ▼              │
│  ┌──────────────────────────────────────┐   │
│  │ retailAttachEngine.ts                 │   │
│  │ Scored product recommendations        │   │
│  │ per mapping + per gap                 │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
           │
           ▼
    Plan status → 'ready'
    Navigate to /portal/plans/:id
```

---

## 3. Database Schema

### Core Tables

| Table | Purpose |
|---|---|
| `plans` | User implementation plans (status: processing → ready) |
| `menu_uploads` | Raw menu data, source type (pdf/docx/paste), parsed_services |
| `business_plan_outputs` | Analysis results: overview, protocol_matches, gaps, retail_attach, activation_assets |
| `spa_menus` | Admin-level spa menu uploads with category counts |
| `spa_menu_services` | Individual parsed services per menu |
| `spa_service_mapping` | Mapped services with confidence scores (Exact/Partial/Candidate/No Match) |
| `service_gap_analysis` | Gap analysis results with revenue estimates |
| `retail_attach_recommendations` | Product recommendations per mapping/gap |
| `protocol_mappings` | Solution type + confidence per service |
| `service_gaps` | Gap type + priority + recommended protocol |
| `plan_submissions` | Submission workflow state |
| `plan_outputs` | Full implementation plan JSON |

### Supporting Reference Tables

| Table | Purpose |
|---|---|
| `canonical_protocols` | Brand protocols with completion_status, target_concerns, allowed_products |
| `pro_products` | Professional products with category, usage_instructions |
| `retail_products` | Retail products with target_concerns, msrp, wholesale |
| `brands` | Brand catalog with is_published, is_featured |
| `brand_assets` | Training materials, merchandising, social assets |
| `treatment_costs` | COGS per protocol/product |
| `marketing_calendar` | Monthly themes, featured_protocols, featured_products |
| `service_category_benchmarks` | Min service counts per spa type per category |
| `revenue_model_defaults` | Default utilization rates, attach rates per spa type |
| `protocol_costing` | Estimated COGS per canonical protocol |
| `medspa_treatments` | Med-spa specific treatment data |
| `medspa_products` | Med-spa specific product data |

---

## 4. Routes & UI

| Route | Component | Purpose |
|---|---|---|
| `/portal/plans` | `PlansList.tsx` | List all user plans |
| `/portal/plans/new` | `PlanWizard.tsx` | 3-step wizard (Upload → Brand → Analyze) |
| `/portal/plans/:id` | `PlanResults.tsx` | View analysis results |
| `/portal/plans/compare` | `PlanComparison.tsx` | Compare multiple plans |

All routes are protected by `PaywallGate` feature="plan_wizard".

---

## 5. Engine 1: menuOrchestrator.ts — Core Analysis Pipeline

**Path:** `SOCELLE-WEB/src/lib/menuOrchestrator.ts`
**Lines:** ~471

### Interfaces

```typescript
export interface ParsedService {
  name: string;
  duration?: number;
  price?: number;
  category?: string;
  rawText: string;
}

export interface ProtocolMatch {
  service: ParsedService;
  protocol: {
    id: string;
    name: string;
    duration: number;
    category: string;
    description: string | null;
  };
  matchScore: number;
  matchReasons: string[];
}

export interface GapOpportunity {
  protocol: {
    id: string;
    name: string;
    duration: number;
    category: string;
    description: string | null;
  };
  reason: string;
  estimatedRevenue?: number;
}

export interface RetailAttach {
  service: ParsedService;
  products: Array<{
    id: string;
    name: string;
    category: string;
    size: string | null;
    usage: string | null;
  }>;
}

export interface MenuValidationResult {
  valid: boolean;
  error?: string;
  quality: 'ok' | 'low' | 'invalid';
}
```

### validateMenuInput()

Pre-check before analysis. Hard-blocks if text too short or too few services detected.

```typescript
export function validateMenuInput(text: string): MenuValidationResult {
  const trimmed = text.trim();

  if (trimmed.length <= 100) {
    return {
      valid: false,
      error: 'Your menu text is too short. Please paste your full menu.',
      quality: 'invalid',
    };
  }

  const services = parseMenuText(trimmed);

  if (services.length <= 3) {
    return {
      valid: false,
      error: "We couldn't detect enough services. Try adding more service names.",
      quality: 'invalid',
    };
  }

  const isLowQuality = services.length <= 6 || trimmed.length <= 300;

  return {
    valid: true,
    quality: isLowQuality ? 'low' : 'ok',
  };
}
```

**Stress test targets:**
- Text exactly 100 chars → should FAIL
- Text 101 chars but only 3 services → should FAIL
- Text 301 chars with 7 services → should pass as 'ok'
- Text 300 chars with 6 services → should pass as 'low'

### parseMenuText() — 4 Regex Patterns

```typescript
const servicePatterns = [
  /^(.+?)\s*[-–—]\s*(\d+)\s*min(?:ute)?s?\s*[-–—]?\s*\$?(\d+(?:\.\d{2})?)?/i,
  /^(.+?)\s*\$(\d+(?:\.\d{2})?)\s*[-–—]?\s*(\d+)?\s*min/i,
  /^(.+?)\s*\((\d+)\s*min(?:ute)?s?\)/i,
  /^(.+?)\s+(\d{2,3})\s*min/i,
];
```

**Pattern 1:** `Service Name — 60 min — $120` (standard format)
**Pattern 2:** `Service Name $120 — 60 min` (price-first)
**Pattern 3:** `Service Name (60 minutes)` (parenthetical duration)
**Pattern 4:** `Service Name 60 min` (simple space-separated)

Fallback: Any line 3-100 chars that doesn't match gets added as name-only service.

Duration validation: Must be >10 and <500 to count as duration (not price).

### inferCategory()

```typescript
function inferCategory(serviceName: string): string {
  const lower = serviceName.toLowerCase();

  if (lower.includes('facial') || lower.includes('face') || lower.includes('skin') ||
      lower.includes('cleansing') || lower.includes('peel')) return 'Facial';
  if (lower.includes('body') || lower.includes('wrap') || lower.includes('scrub') ||
      lower.includes('exfoliation')) return 'Body';
  if (lower.includes('massage') || lower.includes('therapeutic')) return 'Massage';
  if (lower.includes('hand') || lower.includes('foot') ||
      lower.includes('manicure') || lower.includes('pedicure')) return 'Hands & Feet';
  if (lower.includes('eye') || lower.includes('lip')) return 'Eye & Lip';

  return 'Other';
}
```

### matchServicesToProtocols() — Scoring Algorithm

```
Category match:     +30 points
Keyword matches:    +20 points each (words >3 chars, substring match)
Duration ≤15 min:   +15 points
Duration ≤30 min:   +5 points
Minimum threshold:  30 points (below = no match)
```

### identifyGaps()

Finds protocols NOT matched to any service. Caps at 10 gap opportunities.

- If protocol category not in service categories → "New service category"
- If protocol category IS in service categories → "Additional offering"

### calculateFitScore()

```typescript
function calculateFitScore(services: ParsedService[], matches: ProtocolMatch[]): number {
  if (services.length === 0) return 0;
  const matchRate = matches.length / services.length;
  const avgMatchQuality = matches.length > 0
    ? matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length / 100
    : 0;
  return Math.round((matchRate * 0.6 + avgMatchQuality * 0.4) * 100);
}
```

**Formula:** `FitScore = (matchRate × 0.6 + avgMatchQuality × 0.4) × 100`

### estimateRevenue()

```typescript
const basePriceMap = {
  Facial: 120, Body: 140, Massage: 100,
  'Hands & Feet': 50, 'Eye & Lip': 60, Other: 80,
};
// Revenue = basePrice × (protocol.duration / 60)
```

### runMenuAnalysis() — Full Pipeline

```
1. parseMenuText(menuText)
2. Promise.all([fetchBrandProtocols, fetchBrandProducts, fetchBrandAssets])
3. matchServicesToProtocols(services, protocols)
4. identifyGaps(services, protocols, matches)
5. generateRetailAttach(services, products, matches)
6. organizeAssets(assets) → 5 categories
7. calculateFitScore(services, matches)
8. saveOutputs(planId, { overview, protocol_matches, gaps, retail_attach, activation_assets })
9. Update plan status → 'ready'
```

---

## 6. Engine 2: PlanWizard.tsx — 3-Step Wizard UI

**Path:** `SOCELLE-WEB/src/pages/business/PlanWizard.tsx`
**Lines:** ~529

### Step Flow

**Step 1: Upload Menu**
- File upload (PDF/DOCX) via `extractTextFromFile()`
- Or paste text directly in textarea
- Validation via `validateMenuInput()`
- Shows line count + character count

**Step 2: Select Brand**
- Fetches brands with `is_published=true OR status=active`
- Sorted by `is_featured` (desc), then `name`
- Radio button selection
- Supports URL preselection: `?brand=<id|slug>`

**Step 3: Review & Analyze**
- Summary card: Business name, Brand, Menu stats
- Processing animation with 4-step progress list
- Calls `handleAnalyze()`:

```typescript
// 1. Create plan row (status: 'processing')
// 2. Insert menu_uploads row
// 3. Call runMenuAnalysis(plan.id, brandId, menuText)
// 4. Poll for plan status='ready' (MAX_POLLS=10, POLL_INTERVAL=600ms)
// 5. Navigate to /portal/plans/:id
```

**Stress test targets:**
- Upload empty PDF → should show extraction error
- Upload password-protected PDF → should show error
- Upload .doc (legacy) → should show unsupported error
- Submit with 0 active brands → should show "No active brands" message
- Network timeout during analysis → should show "Analysis timed out" after 6 seconds (10 × 600ms)

---

## 7. Engine 3: planOrchestrator.ts — Plan Generation Pipeline

**Path:** `SOCELLE-WEB/src/lib/planOrchestrator.ts`
**Lines:** ~290

### Alternate Parsing Engine

Has its own `parseMenuText()` with simpler single regex:
```typescript
const match = line.match(/^(.*?)\s*-\s*(\d+)\s*min\s*-\s*\$(\d+)/i);
```

And its own `inferCategory()` with UPPERCASE categories:
```
FACIALS, MASSAGE THERAPY, BODY WRAPS / BODY TREATMENTS,
BODY SCRUBS / POLISHES, HAND & FOOT TREATMENTS, MED-SPA TREATMENTS
```

### orchestratePlanGeneration() Flow

```
1. parseMenuText(menuText)
2. Create/update spa_menus row with category counts
3. Insert spa_menu_services rows
4. Link spa_menu_id to plan_submission
5. performServiceMapping(menuId) → mapping results
6. Insert protocol_mappings rows
7. performGapAnalysis(menuId, spaType) → gap results
8. Insert service_gaps rows
9. generateAllRetailAttachForMenu(menuId)
10. Build plan_outputs JSON:
    - summary (totals, mapped, gaps, retail, opening order)
    - protocolMappings
    - gapAnalysis
    - retailRecommendations
    - openingOrder (from pro_products)
    - implementationPhases (3 phases: Foundation, Expansion, Optimization)
11. Update plan_submission status → 'approved'
```

### Implementation Phases (Hardcoded Structure)

```
Phase 1 (Months 1-2): Foundation
  - Team training, core protocols, initial inventory

Phase 2 (Months 3-4): Expansion
  - Additional treatments, retail program, marketing collateral

Phase 3 (Months 5-6): Optimization
  - Advanced protocols, seasonal treatments, performance tracking
```

---

## 8. Engine 4: documentExtraction.ts — PDF/DOCX Extraction

**Path:** `SOCELLE-WEB/src/lib/documentExtraction.ts`
**Lines:** 125

### Libraries
- **PDF:** `pdfjs-dist` with CDN worker
- **DOCX:** `mammoth` (extractRawText)

### Extraction Logic

```typescript
// PDF: iterate pages, extract text content, join with spaces
// DOCX: mammoth.extractRawText({ arrayBuffer })
// Both: validate text length >= 10 chars
```

### Error Handling
- Scanned/image-based PDF → specific error message
- Corrupted/password-protected → specific error message
- Legacy .doc format → not supported
- Empty document → specific error message

### Return Interface
```typescript
interface ExtractionResult {
  text: string;
  success: boolean;
  error?: string;
  meta?: {
    pageCount?: number;  // PDF only
    wordCount?: number;
  };
}
```

---

## 9. Engine 5: mappingEngine.ts — Service-to-Protocol Mapping

**Path:** `SOCELLE-WEB/src/lib/mappingEngine.ts`
**Lines:** ~891

### TWO mapping systems in one file:

#### System A: Scored-Similarity Mapping (`mapServiceToProtocol()`)

Weighted scoring:
```
Name similarity:    50% weight (Jaccard + substring)
Duration match:     20% weight
Category match:     20% weight
Concern match:      10% weight
```

Match type thresholds:
```
≥90 total → Exact
≥70 total → Partial
≥40 total → Candidate
<40 total → No Match
```

**String Similarity (Jaccard + substring):**
```typescript
// Exact match → 100
// Substring inclusion → max(jaccard, 85)
// Otherwise → jaccard score (intersection/union × 100)
```

**Duration Matching:**
```
0 min diff → 100
≤5 min → 90
≤10 min → 75
≤15 min → 50
≤30 min → 25
>30 min → 0
```

**Concern Keywords (30 terms):**
```
acne, aging, anti-aging, wrinkle, fine lines, hydration, dehydration,
dryness, moisture, sensitivity, sensitive, redness, rosacea, brightening,
pigmentation, dark spots, discoloration, congestion, pores, oily,
oil control, detox, purifying, clarifying, soothing, calming, relaxation,
firmness, lifting, tightening, exfoliation, resurfacing, renewal
```

**Seasonal Relevance Check:**
- Queries `marketing_calendar` for current + next 2 months
- If protocol is featured → `is_seasonally_relevant = true`
- If score ≥70 AND seasonal → +5 bonus points (capped at 100)

#### System B: Keyword + Semantic Mapping (`performServiceMapping()`)

**Step 1: Parse raw menu data**
- Detect category headers (11 categories including MED-SPA)
- Extract duration, price, keywords per line
- Med-spa keyword detection (16 keywords: chemical peel, botox, filler, laser, etc.)

**Step 2: Keyword matching (`findBestMapping()`)**
```
Med-spa services:
  - Match against medspa_treatments table
  - Keyword overlap in treatment name → Direct Fit, High confidence
  - No match → Medium confidence, custom build suggestion

Regular services:
  - Category match + ≥2 concern overlaps → Direct Fit, High
  - ≥1 concern overlap → Partial Fit, Medium
  - No match → Custom-Built, Low (uses PRO products to build treatment)
```

**Step 3: Semantic mapping (pgvector)**
```typescript
// Generate embedding via 'generate-embeddings' Edge Function
// Match against canonical_protocols via match_protocols RPC
// Threshold: 0.65 similarity, Top-K: 5
// Blend: 60% keyword + 40% semantic
//   ≥0.75 blended → High
//   ≥0.45 blended → Medium
//   <0.45 blended → Low
```

**Semantic override:** If keyword matching returns "Custom-Built" but semantic finds ≥0.75 similarity → upgrades to Protocol match.

**Step 4: Retail attach + COGS calculation**
- `findRetailAttach()` → product name matching via target_concerns
- `calculateCOGS()` → from treatment_costs table (Known/Partial/Unknown)

---

## 10. Engine 6: gapAnalysisEngine.ts — Gap Analysis

**Path:** `SOCELLE-WEB/src/lib/gapAnalysisEngine.ts`
**Lines:** ~577

### 4 Gap Types

#### 1. Category Gaps (`category_gap`)
- Compares service counts against `service_category_benchmarks` table
- Per spa type (medspa/spa/hybrid)
- If count < benchmark minimum → gap identified
- Recommends unmapped protocol aligned with spa type treatment focus

**Treatment Focus by Spa Type:**
```
medspa: results-driven, clinical, anti-aging, acne, pigmentation, resurfacing
spa:    relaxation, wellness, ritual, aromatherapy, hydration, soothing
hybrid: results-driven, wellness, clinical, relaxation, anti-aging
```

#### 2. Seasonal Gaps (`seasonal_gap`)
- Queries `marketing_calendar` for current + next 2 months
- Cross-references featured_protocols against canonical_protocols
- If spa doesn't offer a featured seasonal protocol → gap
- Current month = High priority, future months = Medium

#### 3. Signature Missing (`signature_missing`)
- Checks if any facial service contains "signature" in name
- If facials exist but no signature → High priority gap
- Recommends protocol containing "signature" or "pure results"

#### 4. Enhancement Missing (`enhancement_missing`)
- If enhancement count < 2 AND facial count > 2
- Recommends add-on protocols for ticket size increase
- Revenue estimate uses: avgServicePrice × 0.4 × utilization × attachRate

### Revenue Estimation

```typescript
function calculateRevenueEstimate(servicePrice, utilizationRate, protocolCogs) {
  // revenue = servicePrice × utilizationRate
  // profit = revenue - (protocolCogs × utilizationRate)
  // Confidence: High (all data), Medium (1 missing), Low (2+ missing), Unknown (critical missing)
}
```

### Source Trace (Audit Trail)

Every gap includes `source_trace` with:
- Benchmark used, current vs minimum count
- Revenue model source (table reference)
- Protocol costing source
- Seasonal adjustment factors

---

## 11. Engine 7: retailAttachEngine.ts — Retail Product Recommendations

**Path:** `SOCELLE-WEB/src/lib/retailAttachEngine.ts`
**Lines:** ~380

### Scoring Algorithm

```
Protocol allowed products list match:  +50 points
Exact category match:                  +25 points
Related category match:                +15 points
Concern overlap:                       +10 per concern (max 30)
Seasonal featured product:             +10 points
```

**Related category mappings:**
```
facial product + facial protocol
body product + body protocol
serum product + treatment protocol
cleanser product + facial protocol
```

### Recommendation Flow

```
1. generateRetailAttachRecommendations(protocolId, name, category, concerns, allowedProducts)
2. Fetch retail products (filtered by category, limit 100)
3. Fetch seasonal featured products from marketing_calendar
4. Score each product against protocol
5. Sort by score descending
6. Return top 2 recommendations (rank 1 and 2)
7. Each includes: confidence_score, rationale, matching_criteria, source_trace
```

### Two Entry Points

**Per Service Mapping:** `generateRetailAttachForServiceMapping(mappingId, menuId)`
- Joins spa_service_mapping → canonical_protocols
- Only for protocols with steps_complete or fully_complete

**Per Gap:** `generateRetailAttachForGap(gapId, menuId)`
- Joins service_gap_analysis → canonical_protocols
- Only for admin_reviewed gaps with status identified/approved

### Batch Processing

`generateAllRetailAttachForMenu(menuId)`:
1. Delete existing recommendations for menu
2. Fetch all mappings with protocol match
3. Fetch all reviewed/approved gaps with protocol recommendation
4. Run retail attach for all in parallel

---

## 12. Scoring Algorithms Reference

### Brand Fit Score (menuOrchestrator)
```
FitScore = (matchRate × 0.6 + avgMatchQuality × 0.4) × 100
  where matchRate = matchedServices / totalServices
  where avgMatchQuality = avg(matchScores) / 100
```

### Protocol Match Score (menuOrchestrator)
```
Category match:   +30
Keyword match:    +20 per word (>3 chars, substring)
Duration ≤15min:  +15
Duration ≤30min:  +5
Threshold:        30 minimum
```

### Service Mapping Score (mappingEngine — scored)
```
Name similarity:  50% weight (Jaccard + substring, 0-100)
Duration match:   20% weight (0/25/50/75/90/100 based on diff)
Category match:   20% weight
Concern match:    10% weight (overlap ratio × 100)

Thresholds: ≥90=Exact, ≥70=Partial, ≥40=Candidate, <40=No Match
```

### Blended Score (mappingEngine — semantic)
```
Blended = keywordScore × 0.6 + semanticSimilarity × 0.4
  where keywordScore: High=1.0, Medium=0.55, Low=0.15
  ≥0.75 → High, ≥0.45 → Medium, <0.45 → Low
```

### Retail Attach Score
```
Protocol allowed products: +50
Exact category:            +25
Related category:          +15
Concern overlap:           +10 per (max 30)
Seasonal featured:         +10
```

### Revenue Estimate
```
Monthly Revenue = servicePrice × utilizationRate
Monthly Profit = Revenue - (COGS × utilizationRate)
Enhancement Revenue: avgServicePrice × 0.4 × utilization × attachRate
Seasonal adjustment: utilization × 0.5 (partial month)
```

---

## 13. Stress Test Scenarios

### Input Parsing Tests

| # | Test | Input | Expected |
|---|---|---|---|
| P1 | Standard format | `Signature Facial — 60 min — $120` | name="Signature Facial", duration=60, price=120, category=Facial |
| P2 | Price-first format | `Deep Cleanse $150 — 75 min` | name="Deep Cleanse", duration=75, price=150 |
| P3 | Parenthetical duration | `Hot Stone (90 minutes)` | name="Hot Stone", duration=90, category=Massage |
| P4 | Simple format | `Swedish Massage 60 min` | name="Swedish Massage", duration=60 |
| P5 | No match (short line) | `Hi` | Skipped (length ≤ 3) |
| P6 | No match (long generic) | `This is a general description` | name-only, category=Other |
| P7 | Em-dash variant | `Facial — 60 min — $120` | Should match Pattern 1 |
| P8 | En-dash variant | `Facial – 60 min – $120` | Should match Pattern 1 |
| P9 | Ambiguous duration/price | `Facial 120 min` | duration=120 (>10, <500) |
| P10 | Price-only line | `Facial $120` | Pattern 2 match, price=120, no duration |

### Category Inference Tests

| # | Service Name | Expected Category |
|---|---|---|
| C1 | "Deep Cleansing Facial" | Facial |
| C2 | "Full Body Scrub" | Body |
| C3 | "Swedish Massage" | Massage |
| C4 | "Luxury Pedicure" | Hands & Feet |
| C5 | "Eye Lift Treatment" | Eye & Lip |
| C6 | "Aromatherapy Session" | Other |
| C7 | "Skin Rejuvenation" | Facial (contains 'skin') |
| C8 | "Exfoliation Treatment" | Body (contains 'exfoliation') |
| C9 | "Chemical Peel" | Facial (contains 'peel') |
| C10 | "Therapeutic Deep Tissue" | Massage (contains 'therapeutic') |

### Validation Tests

| # | Input | Expected |
|---|---|---|
| V1 | 50 chars, 2 services | INVALID (length ≤ 100) |
| V2 | 150 chars, 3 services | INVALID (services ≤ 3) |
| V3 | 150 chars, 4 services | VALID, quality='low' (services ≤ 6) |
| V4 | 350 chars, 8 services | VALID, quality='ok' |
| V5 | 250 chars, 5 services | VALID, quality='low' (length ≤ 300) |
| V6 | Empty string | INVALID |

### Matching Algorithm Tests

| # | Test | Service | Protocol | Expected Score |
|---|---|---|---|---|
| M1 | Perfect match | "Signature Facial 60min" | "Signature Facial" (Facial, 60min) | 30+20+15 = 65+ |
| M2 | Category only | "Mystery Treatment" (Facial) | "Clarifying Facial" (Facial) | 30 (just category) |
| M3 | Keywords only | "Anti-Aging Peptide" | "Peptide Renewal" (Body) | 20 (1 word) |
| M4 | No match | "Yoga Class" | "Deep Cleansing Facial" | 0 (below 30) |
| M5 | Duration edge | "Facial 75min" | Protocol 60min | 30+5 = 35 (diff=15) |
| M6 | Duration close | "Facial 65min" | Protocol 60min | 30+15 = 45 (diff=5) |

### Fit Score Tests

| # | Services | Matches | Avg Score | Expected Fit |
|---|---|---|---|---|
| F1 | 10 services | 10 matched | avg 80 | (1.0×0.6 + 0.8×0.4) × 100 = 92 |
| F2 | 10 services | 5 matched | avg 60 | (0.5×0.6 + 0.6×0.4) × 100 = 54 |
| F3 | 10 services | 0 matched | N/A | 0 |
| F4 | 0 services | N/A | N/A | 0 |
| F5 | 1 service | 1 matched | score 100 | (1.0×0.6 + 1.0×0.4) × 100 = 100 |

### Gap Analysis Tests

| # | Scenario | Expected Gap Type |
|---|---|---|
| G1 | 0 facials, benchmark requires 2 | category_gap (FACIALS) |
| G2 | Has facials but no "Signature" in name | signature_missing |
| G3 | 3+ facials but only 1 enhancement | enhancement_missing |
| G4 | Missing protocol featured in current month marketing | seasonal_gap (High priority) |
| G5 | Missing protocol featured in month+2 marketing | seasonal_gap (Medium priority) |
| G6 | All benchmarks met, all seasonal covered | No gaps |

### Revenue Estimation Tests

| # | Service Price | Utilization | COGS | Expected |
|---|---|---|---|---|
| R1 | $120 | 20/month | $30 | Revenue: $2,400, Profit: $1,800, Confidence: High |
| R2 | $120 | 20/month | null | Revenue: $2,400, Profit: null, Confidence: Medium |
| R3 | null | 20/month | $30 | Revenue: null, Confidence: Unknown |
| R4 | $120 | null | $30 | Revenue: null, Confidence: Unknown |

### Semantic Mapping Tests

| # | Scenario | Expected |
|---|---|---|
| S1 | Keyword=Custom-Built, Semantic ≥0.75 | Upgrade to Protocol (Semantic Match) |
| S2 | Keyword=High, Semantic=0.9 | Stay High (blended still High) |
| S3 | Keyword=Low, Semantic=0.3 | Stay Low (blended < 0.45) |
| S4 | Embedding generation fails | Fallback to keyword-only (no error) |
| S5 | match_protocols RPC fails | Fallback to keyword-only (no error) |

### Retail Attach Tests

| # | Scenario | Expected |
|---|---|---|
| RA1 | Product in protocol.allowed_products | Score ≥ 50, rank 1 |
| RA2 | Exact category match + 2 concern overlaps | Score = 25+20 = 45 |
| RA3 | Seasonal featured product | +10 bonus, is_seasonally_relevant=true |
| RA4 | No retail products in DB | Empty recommendations array |
| RA5 | Score = 0 for all products | No recommendations (filtered out) |

### End-to-End Integration Tests

| # | Scenario | Expected Flow |
|---|---|---|
| E2E-1 | Upload 10-service menu, select brand with 5 protocols | Parse 10 → Match ~3-5 → 5-7 gaps → retail per match → FitScore 30-60 |
| E2E-2 | Upload single-service menu | Validation FAIL (≤3 services) |
| E2E-3 | Upload menu with all med-spa services | Category = MED-SPA for all → medspa_treatments matching |
| E2E-4 | Select brand with 0 completed protocols | 0 matches, 0 gaps, FitScore = 0 |
| E2E-5 | Upload PDF with scanned images only | Extraction error: "scanned or image-based" |
| E2E-6 | Network timeout during runMenuAnalysis | Poll 10×600ms = 6s timeout → "Analysis timed out" |

---

*Generated from live codebase — SOCELLE-WEB/src/lib/ engine files*
*All engines confirmed active as of March 8, 2026*

---

## 14. SOCELLE AI & Technology Registry (Full Platform Stack)

> Source: `SOCELLE_AI_TECHNOLOGY_REGISTRY.md` — Every tool, API, model, and platform ranked by profit impact × implementation feasibility

### AI Language Models (Active in ai-orchestrator via OpenRouter)

| Model | Use Case | Cost | Profit Rank |
|---|---|---|---|
| **Claude Sonnet 4.6** | Complex reasoning: Intelligence Briefs, Activation Plans, Competitive Synthesis | $3/1M in, $15/1M out | #1 — highest quality for premium AI features |
| **GPT-4o** | Signal summarization, Activation Plans, Content Repurposer | $3/1M in, $10/1M out | #2 — strong general purpose |
| **GPT-4o-mini** | Quick advisor, lightweight tasks | $0.10/1M in, $0.40/1M out | #3 — best cost/speed for high-frequency features |
| **Gemini 3.1 Pro** | Long-context analysis (202 feeds), weekly briefs | Similar to Claude pricing | #4 — 2M+ token context unique advantage |
| **Llama 3.3 70B** | Real-time chat, instant advisor (<200ms) | Free model, pay compute | #5 — lowest cost, latency-sensitive |
| **Claude Haiku** | Ultra-cheap quick answers ($0.0007/query) | $0.20/1M in, $1/1M out | #6 — "Explain This Signal" at scale |

**AI Model Assessment:** The ai-orchestrator already routes to all models via OpenRouter with 4-tier routing + credit accounting. At $1.20/user/month average AI cost vs $65-79 ARPU, AI is 1.5-2% of revenue. Exceptional margin.

### Embeddings & Search

| Technology | Status | Use Case |
|---|---|---|
| **OpenAI text-embedding-3-small** | ✅ ACTIVE (generate-embeddings edge function) | Semantic search over signals, ingredients, protocols |
| **pgvector (Supabase)** | ✅ ACTIVE (migration exists) | Vector storage + similarity search |
| **Typesense / Meilisearch** | ❌ Phase 2 | Dedicated search at 500+ users |

### AI Orchestration

| Technology | Status | Use Case |
|---|---|---|
| **OpenRouter** | ✅ ACTIVE | Multi-model routing — single API for all models |
| **LangGraph** | ❌ Phase 3+ | Multi-step autonomous agents |
| **LangSmith** | ❌ Phase 3+ | Agent debugging/tracing |

### AI Caching & Performance

| Technology | Status | Impact |
|---|---|---|
| **Redis** | ❌ PRIORITY BUILD | 50-70% AI cost reduction ($800/mo savings at 1K users) |
| **Cloudflare KV** | ❌ Phase 2 | Global edge caching for geo-specific intelligence |

### Visual / Creative AI (Phase 2-4)

| Technology | Use Case | Phase |
|---|---|---|
| **Nano Banana 2** | AI product photography | Phase 2-3 |
| **Leonardo.ai** | Scaled professional product photos | Phase 2-3 |
| **Veo (Google)** | Instructional video generation | Phase 3-4 |
| **Haut.AI** | Clinical skin analysis — Before/After prediction | Phase 3-4 |

### Infrastructure Stack

| Technology | Status | Role |
|---|---|---|
| **Supabase** | ✅ ACTIVE | Postgres + Auth + RLS + Edge Functions + Realtime + Storage |
| **Cloudflare Pages** | ✅ ACTIVE | Web hosting, CDN, edge |
| **Vite** | ✅ ACTIVE | Build tool |
| **Stripe** | ✅ ACTIVE | Subscriptions, checkout, webhooks |
| **TanStack Query** | ❌ PRIORITY (#1) | Data fetching, caching, stale-while-revalidate |
| **BullMQ** | ❌ PRIORITY (#4) | Job queue for feed pipeline reliability |
| **Sentry** | ❌ Day 1 NON-NEGOTIABLE | Error tracking, performance monitoring |
| **PostHog** | ❌ Month 1 | Event tracking, feature flags, session replay |

### Master Profit-Ranked Build Order

**Tier 1 — Ship Revenue:**
1. TanStack Query (12 hrs) → 3x dashboard quality
2. Sentry (2 hrs) → prevents blind failures
3. Stripe BYPASS OFF (4 hrs) → revenue Day 1
4. Recharts (8-12 hrs) → intelligence IS charts
5. Redis AI caching (3-5 days) → 50-70% cost reduction

**Tier 2 — Retain & Grow (first 30 days):**
6. BullMQ feed pipeline, 7. Embeddings verification, 8. PostHog analytics, 9. Supabase Realtime, 10. Support (Crisp/Discord)

**Tier 3 — Differentiate (30-90 days):**
11. PostGIS hyper-local, 12. Leaflet.js map heatmaps, 13. Image generation API

**Tier 4 — Scale (500+ subscribers):**
14. Typesense, 15. Next.js migration, 16. Trigger.dev, 17. LangGraph

**Tier 5 — New Revenue Streams (Phase 3-4):**
18. Perfect Corp SDK ($200K-500K/yr), 19. Haut.AI, 20. Veo video, 21. Brand photography, 22. Meta Wearables SDK

### Cost at Scale (1,000 Subscribers)

| Category | Monthly Cost |
|---|---|
| AI queries (after Redis caching) | $400 |
| AI embeddings | $50 |
| Redis cache | $100-200 |
| Supabase | $25-599 |
| Cloudflare | $20 |
| Sentry + PostHog + Crisp | ~$50 |
| **Total infrastructure** | **~$700-1,500/mo** |
| **Revenue at 1K subs** | **$65,000-$106,500/mo** |
| **Gross margin** | **97-99%** |

---

## 15. Value-Credit Matrix (Financial Engine)

Protects 98% gross margins by assigning credit costs to high-compute AI actions.

```json
{
  "version": "2026.03.08",
  "currency": "SOCELLE_CREDITS",
  "tier_allowances": {
    "starter": 500,
    "pro": 2500,
    "enterprise": 10000
  },
  "costs": {
    "intelligence": {
      "signal_explain": 1,
      "market_brief_standard": 10,
      "market_brief_deep_dive": 25,
      "semantic_search_query": 0.5
    },
    "creative": {
      "product_photo_gen": 15,
      "texture_refinement": 20,
      "instructional_video_15s": 150,
      "social_moodboard_5pack": 50
    },
    "strategy": {
      "activation_plan": 30,
      "rd_scout_report": 100,
      "competitor_synthesis": 40,
      "compliance_audit_bot": 50
    },
    "automation": {
      "wholesale_arbitrage_run": 20,
      "no_show_predictor_batch": 10,
      "virtual_receptionist_hour": 15
    }
  },
  "overage_price_usd": 0.10
}
```

### Credit Economics Per Action

| Action | API Cost (Est.) | Credit Cost | Retail Value (USD) | Margin |
|---|---|---|---|---|
| Weekly Brief | $0.08 (Claude 4.6) | 10 | $1.00 | 92% |
| Activation Plan | $0.15 (Claude 4.6) | 30 | $3.00 | 95% |
| Instructional Video | $4.50 (Veo) | 150 | $15.00 | 70% |
| Signal Advisor | $0.005 (4o-mini) | 1 | $0.10 | 95% |

### Credit Flow Logic

1. **Trigger:** User clicks "Generate Brief" → ai-orchestrator checks `profiles.credit_balance`
2. **Deduction:** If balance ≥ cost → AI runs, balance decremented
3. **Upsell:** If balance < cost → "Top Up" modal: "Add 100 credits for $10 or upgrade to Pro for 2,500 credits"

---

## 16. Tri-Sided Revenue Engine

### Revenue Streams at 1,000 Subscribers

| Stream | Model | Monthly Rev | Margin |
|---|---|---|---|
| SaaS Subscription | $49/$149/$499 tiers | $106,500 | ~98.6% |
| Wholesale Affiliate | 5% commission on Arbitrage Bot orders | $25,000 | 100% |
| AI Content Add-ons | $29/mo Content Pack | $12,000 | ~80% |
| B2B Ad-Tech (Suppliers) | $2,500/mo Sponsored R&D slots | $15,000 | 100% |
| **Total** | | **$158,500/mo** | **~96%** |

### Affiliate Link Wrapper (Edge Function)

Intercepts distributor URLs → converts to tracked affiliate links → 3-8% commission per order.

```
Affiliate Mapping:
  saloncentric.com     → SOCELLE_SC_001
  cosmoprofbeauty.com  → SOCELLE_CP_002
  dermstore.com        → SOCELLE_DS_003
```

### Sponsored R&D Injection

Brand-tier feature: Raw material suppliers pay for "Preferred Formulation" status in R&D Scout.

| Tier | Capability | Investment |
|---|---|---|
| Verified Supplier | Basic listing in Ingredient DB | $500/mo |
| Strategic Partner | Priority Injection for 3 categories | $2,500/mo |
| Enterprise Data | Real-time "Ingredient Momentum" heatmaps + lead gen | $5,000/mo |

---

## 17. Launch Execution Checklist

### 72-Hour Window
- **Day 1 (Content):** Deploy Pearl Mineral V2 copy across all paywalls and empty states
- **Day 2 (Gates):** Activate Value-Based Credit Logic + Stripe Production mode
- **Day 3 (Launch):** Send "Access Granted" to waitlist + LinkedIn "Manifesto" post

### Founder Demo Conversion Targets

| Metric | Target | Why |
|---|---|---|
| Time to First Signal | < 60 seconds | Proves immediate value |
| Activation Plan Generation | > 80% | Confirms "Action" tool positioning |
| Wholesale Click-Through | > 40% | Proves Arbitrage is must-have |

### Compliance Requirements
- **Guardrails AI:** Safety layer for medical-adjacent beauty recommendations
- **FTC Compliance:** "Commission-linked" badge on affiliate recommendations
- **Algorithm Integrity:** Lowest price always prioritized regardless of affiliate status
- **MoCRA/Legal:** No AI diagnosis claims, disclosure on all generated content

---

*SOCELLE AI Technology & Stress Test Complete Reference v1.0 — March 8, 2026*
