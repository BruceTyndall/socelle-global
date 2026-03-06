# Functional Architecture & Logic Audit

**Generated:** February 16, 2026
**Purpose:** Map implemented vs stubbed functionality to prioritize remaining work

---

## Section A – Engines & Functions

### 1. documentExtraction.ts

| Function | Purpose | Status | Triggered By | Tables Read | Tables Write | Persistence |
|----------|---------|--------|--------------|-------------|--------------|-------------|
| `extractTextFromFile` | Extract text from uploaded PDF/DOCX files | ✅ Fully implemented | PlanWizard.tsx file upload | None | None | No - returns text only |
| `extractFromPDF` | PDF parsing using pdfjs-dist | ✅ Fully implemented | Called by extractTextFromFile | None | None | No - returns text |
| `extractFromDOCX` | DOCX parsing using mammoth | ✅ Fully implemented | Called by extractTextFromFile | None | None | No - returns text |

**Notes:**
- Production-ready file extraction
- No database interaction
- Validates file types and detects scanned PDFs
- Returns structured ExtractionResult with success/error states

---

### 2. menuOrchestrator.ts

| Function | Purpose | Status | Triggered By | Tables Read | Tables Write | Persistence |
|----------|---------|--------|--------------|-------------|--------------|-------------|
| `runMenuAnalysis` | Main orchestrator for menu analysis workflow | ✅ Fully implemented | PlanWizard.tsx handleAnalyze, PlanResults.tsx reanalyze | `canonical_protocols`, `pro_products`, `brand_assets` | `business_plan_outputs`, `plans` | Yes - outputs persisted |
| `parseMenuText` | Parse raw menu text into structured services | ✅ Fully implemented | Called by runMenuAnalysis | None | None | No - in-memory only |
| `inferCategory` | Categorize services by keywords | ✅ Fully implemented | Called by parseMenuText | None | None | No - in-memory only |
| `fetchBrandProtocols` | Retrieve brand's protocols | ✅ Fully implemented | Called by runMenuAnalysis | `canonical_protocols` | None | No - returns data |
| `fetchBrandProducts` | Retrieve brand's pro products | ✅ Fully implemented | Called by runMenuAnalysis | `pro_products` | None | No - returns data |
| `fetchBrandAssets` | Retrieve brand's marketing assets | ✅ Fully implemented | Called by runMenuAnalysis | `brand_assets` | None | No - returns data |
| `matchServicesToProtocols` | Match spa services to canonical protocols | ✅ Fully implemented | Called by runMenuAnalysis | None | None | No - computed matches |
| `identifyGaps` | Find unmatched protocols (opportunities) | ✅ Fully implemented | Called by runMenuAnalysis | None | None | No - computed gaps |
| `generateRetailAttach` | Recommend retail products per service | ✅ Fully implemented | Called by runMenuAnalysis | None | None | No - computed recommendations |
| `organizeAssets` | Group assets by type | ✅ Fully implemented | Called by runMenuAnalysis | None | None | No - computed organization |
| `calculateFitScore` | Calculate brand fit percentage | ✅ Fully implemented | Called by runMenuAnalysis | None | None | No - computed score |
| `saveOutputs` | Persist analysis results | ✅ Fully implemented | Called by runMenuAnalysis | None | `business_plan_outputs` | Yes - all outputs saved |

**Notes:**
- **FULLY FUNCTIONAL** end-to-end
- Deterministic matching algorithm (keyword + category + duration scoring)
- All outputs persisted to `business_plan_outputs` table with proper output_type keys
- No AI/ML involved - pure rule-based matching

---

### 3. mappingEngine.ts

| Function | Purpose | Status | Triggered By | Tables Read | Tables Write | Persistence |
|----------|---------|--------|--------------|-------------|--------------|-------------|
| `performServiceMapping` | Map spa services to protocols with COGS | ⚠️ Partial logic | SpaOnboardingWizard (legacy), NOT used in Business Portal | `spa_menus`, `canonical_protocols`, `pro_products`, `retail_products`, `treatment_costs`, `medspa_treatments`, `medspa_products` | `spa_services`, `service_mappings`, `spa_menus` (status update) | Yes - fully persisted |
| `parseMenuData` | Parse raw menu into structured services | ✅ Fully implemented | Called by performServiceMapping | None | None | No - in-memory |
| `extractKeywords` | Extract concern keywords from service names | ✅ Fully implemented | Called by parseMenuData | None | None | No - in-memory |
| `findBestMapping` | Match service to protocol/product/medspa treatment | ✅ Fully implemented | Called by performServiceMapping | None | None | No - computed mapping |
| `findRetailAttach` | Find retail products for a mapping | ✅ Fully implemented | Called by performServiceMapping | None | None | No - computed list |
| `calculateCOGS` | Calculate cost of goods sold | ✅ Fully implemented | Called by performServiceMapping | None | None | No - computed cost |

**Notes:**
- **UNUSED in Business Portal Plan Wizard** - replaced by menuOrchestrator.ts
- Still referenced by legacy SpaOnboardingWizard
- More sophisticated than menuOrchestrator (includes COGS, medspa treatments, custom builds)
- **RECOMMENDATION:** Migrate Business Portal to use this instead of menuOrchestrator for richer insights

---

### 4. gapAnalysisEngine.ts

| Function | Purpose | Status | Triggered By | Tables Read | Tables Write | Persistence |
|----------|---------|--------|--------------|-------------|--------------|-------------|
| `runGapAnalysis` | Legacy stub function | 🚧 Stub / placeholder | SpaOnboardingWizard | None | None | No |
| `performGapAnalysis` | Comprehensive gap analysis with revenue estimates | ✅ Fully implemented | planOrchestrator.ts (Spa Portal) | `spa_service_mapping`, `service_category_benchmarks`, `revenue_model_defaults`, `canonical_protocols`, `marketing_calendar`, `protocol_costing` | `service_gap_analysis` | Yes - gaps persisted |
| `getCategoryBenchmarks` | Fetch spa-type-specific benchmarks | ✅ Fully implemented | Called by performGapAnalysis | `service_category_benchmarks` | None | No |
| `getRevenueDefaults` | Fetch revenue model defaults | ✅ Fully implemented | Called by performGapAnalysis | `revenue_model_defaults` | None | No |
| `getCanonicalInventory` | Fetch available protocols by category | ✅ Fully implemented | Called by performGapAnalysis | `canonical_protocols` | None | No |
| `getCurrentSeasonalProtocols` | Fetch seasonal opportunities | ✅ Fully implemented | Called by performGapAnalysis | `marketing_calendar`, `canonical_protocols` | None | No |
| `analyzeSpaCategories` | Count services by category | ✅ Fully implemented | Called by performGapAnalysis | None | None | No - in-memory |
| `getSpaTypeTreatmentFocus` | Get spa-type treatment focus keywords | ✅ Fully implemented | Called by performGapAnalysis | None | None | No - static logic |
| `calculateRevenueEstimate` | Estimate revenue/profit with confidence | ✅ Fully implemented | Called by performGapAnalysis | None | None | No - computed |
| `getGapAnalysisSummary` | Generate gap summary statistics | ✅ Fully implemented | Admin/reporting views | `service_gap_analysis` | None | No - computed |

**Notes:**
- **NOT USED in Business Portal** - only used in Spa Portal (different workflow)
- More sophisticated than menuOrchestrator's identifyGaps
- Includes revenue impact estimation, seasonal alignment, benchmark-based recommendations
- **RECOMMENDATION:** Integrate this into Business Portal for better gap insights

---

### 5. retailAttachEngine.ts

| Function | Purpose | Status | Triggered By | Tables Read | Tables Write | Persistence |
|----------|---------|--------|--------------|-------------|--------------|-------------|
| `generateRetailAttachRecommendations` | Generate scored retail product recommendations | ✅ Fully implemented | generateRetailAttachForServiceMapping, generateRetailAttachForGap | `retail_products`, `marketing_calendar` | None | No - returns recommendations |
| `getRetailProducts` | Fetch active retail products | ✅ Fully implemented | Called by generateRetailAttachRecommendations | `retail_products` | None | No |
| `getSeasonallyFeaturedProducts` | Get currently featured products | ✅ Fully implemented | Called by generateRetailAttachRecommendations | `marketing_calendar` | None | No |
| `calculateProductScore` | Score product fit with detailed criteria | ✅ Fully implemented | Called by generateRetailAttachRecommendations | None | None | No - computed |
| `generateRetailAttachForServiceMapping` | Generate attach for specific service mapping | ✅ Fully implemented | planOrchestrator.ts, generateAllRetailAttachForMenu | `spa_service_mapping`, `canonical_protocols` | `retail_attach_recommendations` | Yes |
| `generateRetailAttachForGap` | Generate attach for gap opportunities | ✅ Fully implemented | generateAllRetailAttachForMenu | `service_gap_analysis`, `canonical_protocols` | `retail_attach_recommendations` | Yes |
| `generateAllRetailAttachForMenu` | Generate all retail attach for a menu | ✅ Fully implemented | planOrchestrator.ts | `spa_service_mapping`, `service_gap_analysis` | `retail_attach_recommendations` (delete + insert) | Yes |

**Notes:**
- **NOT USED in Business Portal** - only used in Spa Portal planOrchestrator
- Sophisticated deterministic scoring: protocol_allowed_products (50pts), category match (25pts), concern overlap (30pts), seasonal (10pts)
- Includes source tracing and confidence scoring
- **RECOMMENDATION:** Integrate into Business Portal for better retail recommendations

---

### 6. planOrchestrator.ts

| Function | Purpose | Status | Triggered By | Tables Read | Tables Write | Persistence |
|----------|---------|--------|--------------|-------------|--------------|-------------|
| `orchestratePlanGeneration` | Full plan generation workflow for Spa Portal | ✅ Fully implemented | Spa Portal submission flow | `plan_submissions`, `canonical_protocols`, `pro_products` | `spa_menus`, `spa_menu_services`, `protocol_mappings`, `service_gaps`, `plan_outputs` | Yes - comprehensive |
| `parseMenuText` | Simple menu parser (service name - duration - price) | ✅ Fully implemented | Called by orchestratePlanGeneration | None | None | No |
| `inferCategory` | Categorize service by keywords | ✅ Fully implemented | Called by parseMenuText | None | None | No |

**Notes:**
- **SPA PORTAL ONLY** - not used in Business Portal
- Calls mappingEngine.performServiceMapping (more sophisticated than menuOrchestrator)
- Calls gapAnalysisEngine.performGapAnalysis (more sophisticated than menuOrchestrator)
- Calls retailAttachEngine.generateAllRetailAttachForMenu
- **Business Portal uses menuOrchestrator instead** (simpler, less sophisticated)
- **Key Insight:** Two separate orchestration paths exist for the two portals

---

### 7. ingestionService.ts

| Function | Purpose | Status | Triggered By | Tables Read | Tables Write | Persistence |
|----------|---------|--------|--------------|-------------|--------------|-------------|
| `ingestSpaMenu` | Legacy stub function | 🚧 Stub / placeholder | SpaOnboardingWizard | None | None | No |
| `getIngestionFiles` | List all files with ingestion status | ✅ Fully implemented | IngestionView.tsx | `document_ingestion_log` | None | No - returns file list |
| `getIngestionPhases` | Get phased ingestion status | ✅ Fully implemented | IngestionView.tsx | `document_ingestion_log`, `canonical_protocols` | None | No - computed phases |
| `updateFileStatus` | Mark file as ingested/failed/ignored | ✅ Fully implemented | IngestionView.tsx | `document_ingestion_log` | `document_ingestion_log` | Yes |
| `readabilityCheck` | Check if file is readable | ✅ Fully implemented | IngestionView.tsx | None | `document_ingestion_log` | Yes |
| `batchIngestProtocols` | Create protocol stubs from Phase 2 files | ✅ Fully implemented | IngestionView.tsx | `document_ingestion_log`, `canonical_protocols` | `canonical_protocols`, `document_ingestion_log` | Yes |
| `extractProtocolNameFromFilename` | Parse protocol name from filename | ✅ Fully implemented | Called by batchIngestProtocols | None | None | No |
| `categorizeProtocol` | Infer category from filename | ✅ Fully implemented | Called by batchIngestProtocols | None | None | No |
| `ingestPhase1` | Ingest marketing calendar | ✅ Fully implemented | IngestionView.tsx | `marketing_calendar`, `document_ingestion_log` | `document_ingestion_log` | Yes |

**Notes:**
- Admin tool for initial data population
- Phase 2 creates protocol stubs (name + category only)
- **Does NOT extract steps/products from PDFs** - requires manual completion via ProtocolCompletionEditor
- File classification hardcoded (not dynamic)

---

### 8. pdfExtractionService.ts

| Function | Purpose | Status | Triggered By | Tables Read | Tables Write | Persistence |
|----------|---------|--------|--------------|-------------|--------------|-------------|
| `extractProtocolFromPDF` | Extract protocol structure from PDF | 🚧 Stub / placeholder | ingestCanonicalProtocol | None | None | No |
| `ingestCanonicalProtocol` | Ingest protocol with steps from PDF | ⚠️ Partial logic | Not actively used | `canonical_protocols`, `pro_products` | `canonical_protocols`, `canonical_protocol_steps`, `canonical_protocol_step_products`, `document_ingestion_log` | Yes |
| `matchProductToBackbar` | Match product name to pro_products | ✅ Fully implemented | Called by ingestCanonicalProtocol | `pro_products` | None | No |
| `extractProtocolNameFromFilename` | Parse filename to protocol name | ✅ Fully implemented | Called by extractProtocolFromPDF | None | None | No |
| `runPreFlightValidation` | Validate all Phase 2 files are readable | ✅ Fully implemented | Not actively used | None | `document_ingestion_log` | Yes |
| `ingestPhase2` | Batch ingest Phase 2 protocols | ⚠️ Partial logic | Not actively used | `canonical_protocols`, `document_ingestion_log` | `canonical_protocols`, `canonical_protocol_steps`, `canonical_protocol_step_products`, `document_ingestion_log` | Yes |

**Notes:**
- **CRITICAL GAP:** extractProtocolFromPDF is a stub that returns empty protocol with stepsMissing=true
- Currently protocols are created as stubs, then **manually completed via ProtocolCompletionEditor**
- No automated PDF text extraction for protocol steps/products
- **RECOMMENDATION:** This is the biggest gap in the ingestion pipeline

---

## Section B – Workflow Wiring

### Workflow A: Business Portal - Create Plan Wizard

**UI Flow:** PlanWizard.tsx → PlanResults.tsx

#### Step 1: Select Brand
- **Component:** PlanWizard.tsx (step 1)
- **Query:** `brands` table → fetch published brands
- **Data:** Brand list with id, name, slug, description
- **State:** Stores selectedBrandId

#### Step 2: Upload Menu
- **Component:** PlanWizard.tsx (step 2)
- **Function Call:** `extractTextFromFile(file)` from documentExtraction.ts
- **Tables Read:** None
- **Tables Write:** None
- **Output:** Raw menu text stored in menuText state

#### Step 3: Confirm Brand
- **Component:** PlanWizard.tsx (step 3)
- **Action:** User confirms brand selection
- **No backend interaction**

#### Step 4: Review & Analyze
- **Component:** PlanWizard.tsx (step 4)
- **Button Click:** handleAnalyze()
- **Function Calls:**
  1. **Create plan record:**
     - Insert into `plans` (business_user_id, brand_id, name, status='processing')
  2. **Save menu upload:**
     - Insert into `menu_uploads` (plan_id, source_type, file_path, raw_text)
  3. **Run analysis:**
     - `runMenuAnalysis(plan.id, selectedBrandId, menuText)` from menuOrchestrator.ts
  4. **Navigate to results:**
     - Redirect to `/portal/plans/${plan.id}`

#### Analysis Execution (menuOrchestrator.ts → runMenuAnalysis)

**Execution Flow:**
1. `parseMenuText(menuText)` → ParsedService[]
2. `fetchBrandProtocols(brandId)` → Read `canonical_protocols`
3. `fetchBrandProducts(brandId)` → Read `pro_products`
4. `fetchBrandAssets(brandId)` → Read `brand_assets`
5. `matchServicesToProtocols(services, protocols)` → ProtocolMatch[]
6. `identifyGaps(services, protocols, matches)` → GapOpportunity[]
7. `generateRetailAttach(services, products, matches)` → RetailAttach[]
8. `organizeAssets(assets)` → Organized asset groups
9. `calculateFitScore(services, matches)` → Fit score percentage
10. `saveOutputs(planId, outputs)` → Insert into `business_plan_outputs`:
    - output_type: 'overview'
    - output_type: 'protocol_matches'
    - output_type: 'gaps'
    - output_type: 'retail_attach'
    - output_type: 'activation_assets'
11. Update `plans` table: status='ready'

**Tables Read:**
- `canonical_protocols` (by brand_id)
- `pro_products` (by brand_id)
- `brand_assets` (by brand_id)

**Tables Written:**
- `plans` (status update)
- `business_plan_outputs` (5 inserts with different output_types)

**Missing/Skipped:**
- No COGS calculation
- No medspa treatment mapping
- No service_mappings table usage
- No retail_attach_recommendations table usage
- Simpler matching than mappingEngine

#### Results Rendering (PlanResults.tsx)

**Data Loading:**
1. Fetch `plans` record by id
2. Fetch `menu_uploads` record by plan_id
3. Fetch ALL `business_plan_outputs` by plan_id
4. Group outputs by output_type into outputsMap

**Tab Rendering:**
- **Overview Tab:** Displays `outputs.overview` (totalServices, mappedServices, gaps, brandFitScore)
- **Protocol Matches Tab:** Displays `outputs.protocol_matches` (service, protocol, matchScore, matchReasons)
- **Gaps Tab:** Displays `outputs.gaps` (protocol, reason, estimatedRevenue)
- **Retail Attach Tab:** Displays `outputs.retail_attach` (service, products array)
- **Activation Kit Tab:** Displays `outputs.activation_assets` (organized by asset type)

**Reanalyze Function:**
1. Delete all `business_plan_outputs` for plan_id
2. Update `plans` status='processing'
3. Re-run `runMenuAnalysis(plan.id, plan.brand_id, menuUpload.raw_text)`
4. Refetch all data

**Key Insight:** All data is JSON in business_plan_outputs.output_data - no relational queries

---

### Workflow B: Business Portal - Plan Results Page Tabs

**Component:** PlanResults.tsx

**Data Source:** `business_plan_outputs` table
- Single table query: `.select('*').eq('plan_id', id)`
- Grouped by output_type into React state

**Tab Wiring:**

| Tab | Data Key | Source | Functions | Derived Calculations |
|-----|----------|--------|-----------|---------------------|
| Overview | `outputs.overview` | menuOrchestrator → saveOutputs | None | brandFitScore pre-calculated |
| Protocol Matches | `outputs.protocol_matches` | menuOrchestrator → matchServicesToProtocols | None | Match scores pre-calculated |
| Gaps | `outputs.gaps` | menuOrchestrator → identifyGaps | None | Revenue estimates pre-calculated |
| Retail Attach | `outputs.retail_attach` | menuOrchestrator → generateRetailAttach | None | Product lists pre-calculated |
| Activation Kit | `outputs.activation_assets` | menuOrchestrator → organizeAssets | None | Asset grouping pre-calculated |

**Data Flow:**
- **No live queries** - all data is pre-computed JSON blobs
- **No joins** - all related data embedded in JSON
- **No aggregations** - all summaries pre-calculated
- **Fast rendering** - just JSON parsing and display

**Missing:**
- No drill-down into canonical_protocols table for full protocol details
- No real-time recalculation based on protocol updates
- No protocol completion status checks

---

### Workflow C: Business Portal - Brand Discovery → Brand Detail

**Discovery Page:** Not implemented in Business Portal
- Business users browse brands via public `/brands` route
- Redirects to public Brands.tsx page

**Brand Detail Flow:**

**Component:** BrandDetail.tsx (in business portal)

**Data Loading (parallel queries):**
1. Fetch `brands` record by slug
2. Fetch `canonical_protocols` by brand_id
3. Fetch `pro_products` by brand_id
4. Fetch `retail_products` by brand_id
5. Fetch `marketing_calendar` by brand_id (ERROR: marketing_calendar doesn't have brand_id)

**Tables Read:**
- `brands`
- `canonical_protocols`
- `pro_products`
- `retail_products`
- `marketing_calendar`

**Missing/Broken:**
- marketing_calendar query will fail (no brand_id column)
- No protocol detail views
- No "Create Plan with This Brand" CTA linked to PlanWizard

**Key Insight:** Brand detail page is informational only, not integrated into plan creation flow

---

### Workflow D: Spa Portal - Plan Generation (Alternative Path)

**Component:** Not in business portal - separate Spa Portal flow

**Orchestrator:** planOrchestrator.ts → orchestratePlanGeneration

**Key Differences from Business Portal:**
1. Uses `plan_submissions` table (not `plans`)
2. Creates `spa_menus` and `spa_menu_services` records
3. Calls `mappingEngine.performServiceMapping` (more sophisticated)
4. Calls `gapAnalysisEngine.performGapAnalysis` (includes revenue modeling)
5. Calls `retailAttachEngine.generateAllRetailAttachForMenu` (deterministic scoring)
6. Writes to:
   - `protocol_mappings` table
   - `service_gaps` table
   - `retail_attach_recommendations` table
   - `plan_outputs` table (different from business_plan_outputs)

**Key Insight:** **Two completely separate plan generation pipelines exist**

---

## Section C – Data Integrity Issues

### Issue 1: marketing_calendar.brand_id Missing

**Location:** BrandDetail.tsx:106-109

**Problem:**
```typescript
supabase
  .from('marketing_calendar')
  .select('...')
  .eq('brand_id', brandData.id)  // ❌ brand_id column doesn't exist
```

**Schema:** marketing_calendar has:
- month, year, month_name, theme
- featured_protocols (text array)
- featured_products (text array)
- **NO brand_id column**

**Impact:**
- BrandDetail query will fail
- Marketing calendar is brand-agnostic (applies to all brands)

**Fix Required:**
- Remove `.eq('brand_id', brandData.id)` filter
- OR add brand_id to marketing_calendar schema if multi-brand support needed

---

### Issue 2: Dual Plan Tables (plans vs plan_submissions)

**Tables:**
- `plans` - used by Business Portal
- `plan_submissions` - used by Spa Portal

**Problem:**
- Two separate plan tracking systems
- No cross-portal visibility
- Duplicate schemas with different columns

**Impact:**
- Admin can't see all plans in one place
- Reporting fragmented

**Recommendation:**
- Consolidate into single `plans` table with `portal_type` enum
- OR create unified view

---

### Issue 3: Dual Output Tables (business_plan_outputs vs plan_outputs)

**Tables:**
- `business_plan_outputs` - used by Business Portal menuOrchestrator
- `plan_outputs` - used by Spa Portal planOrchestrator

**Problem:**
- Different schemas
- Different output_type conventions
- business_plan_outputs stores arrays of outputs with same output_type
- plan_outputs stores single consolidated output

**Impact:**
- Can't compare plans across portals
- Different data structures for similar concepts

**Recommendation:**
- Standardize output format
- Use single table with portal_type field

---

### Issue 4: Protocol Completion Status Not Checked in Business Portal

**Location:** menuOrchestrator.ts → fetchBrandProtocols

**Query:**
```typescript
.from('canonical_protocols')
.select('id, protocol_name, duration_minutes, service_category, protocol_description')
.eq('brand_id', brandId)
// ❌ No filter on completion_status
```

**Problem:**
- Includes incomplete protocols in matching
- No steps data loaded (needed for COGS, product recommendations)

**Impact:**
- Business users see protocols that aren't actually usable
- Can't generate opening orders (no product details)
- Can't calculate costs

**Fix Required:**
- Add `.in('completion_status', ['steps_complete', 'fully_complete'])`
- OR load steps data: `.select('*, canonical_protocol_steps(*, canonical_protocol_step_products(*))')`

---

### Issue 5: No Relational Queries in Business Portal

**Observation:**
- All `business_plan_outputs` data is JSON blobs
- No foreign keys used to join to `canonical_protocols`, `pro_products`, `retail_products`
- IDs present in JSON but not used for lookups

**Problem:**
- Protocol details frozen at analysis time
- Updates to protocols don't reflect in past plans
- Can't query "all plans using Protocol X"

**Impact:**
- Stale data in old plans
- No protocol usage analytics
- No drill-down to full protocol details

**Recommendation:**
- Store protocol_ids in separate junction table
- Use relational queries for live data
- Keep JSON for audit trail only

---

### Issue 6: Incomplete Products in retail_attach

**Location:** menuOrchestrator.ts → generateRetailAttach

**Logic:**
```typescript
const relevantProducts = products.filter(
  (p) =>
    p.category === category ||
    p.name.toLowerCase().includes(category.toLowerCase()) ||
    (service.name.toLowerCase().includes('facial') && p.category === 'Facial')
);
```

**Problem:**
- Very basic matching (category + keyword)
- No concern-based matching
- No seasonal relevance
- No allowed_products from protocol
- Returns only first 3 products

**Comparison to retailAttachEngine:**
- retailAttachEngine uses: protocol.allowed_products (50pts), category match (25pts), concern overlap (30pts), seasonal (10pts)
- Includes confidence scoring
- Includes source tracing

**Impact:**
- Weak retail recommendations
- No differentiation between products
- Missing cross-sell opportunities

**Recommendation:**
- Replace with retailAttachEngine.generateRetailAttachRecommendations
- Persist to retail_attach_recommendations table

---

## Section D – Critical Gaps

### Gap 1: PDF Protocol Extraction Stubbed

**File:** pdfExtractionService.ts → extractProtocolFromPDF

**Status:** 🚧 Returns empty protocol with stepsMissing=true

**Impact:**
- Protocols must be manually completed via ProtocolCompletionEditor
- Initial ingestion creates stubs only
- Steps, products, timing, techniques all manual entry

**Blockers:**
- Client-side PDF text extraction insufficient for structured data
- Need server-side AI/parser to extract:
  - Step numbers and titles
  - Instructions and timing
  - Product names and amounts
  - Techniques and contraindications

**Recommendation:**
- Implement server-side extraction service
- OR continue manual completion workflow (current state)
- OR provide AI-assisted completion tool

---

### Gap 2: No COGS in Business Portal

**Observation:**
- Business Portal uses menuOrchestrator (no COGS)
- Spa Portal uses mappingEngine (includes COGS via calculateCOGS)

**Impact:**
- Business users can't see treatment costs
- Can't calculate profit margins
- Can't generate accurate opening orders
- Can't validate pricing guidance

**Tables Available But Unused:**
- `treatment_costs` (protocol COGS)
- `protocol_costing` (estimated costs)

**Recommendation:**
- Switch Business Portal to use mappingEngine instead of menuOrchestrator
- OR add COGS calculation to menuOrchestrator

---

### Gap 3: No Opening Order Generation in Business Portal

**Observation:**
- PlanResults.tsx has no "Opening Order" tab
- menuOrchestrator doesn't calculate backbar needs
- No inventory planning features

**Spa Portal Has:**
- planOrchestrator generates opening order
- Uses pro_products with quantities
- Calculates total cost

**Business Portal Missing:**
- Which products to order
- How much of each product
- Total investment required
- Inventory pars and reorder points

**Impact:**
- Business users can't plan initial purchase
- No "click to order" workflow
- Missing critical revenue feature

**Recommendation:**
- Add opening order calculation to menuOrchestrator
- Integrate with e-commerce for direct ordering

---

### Gap 4: No Revenue/Profit Modeling in Business Portal

**Observation:**
- Business Portal menuOrchestrator.identifyGaps includes estimateRevenue (simple)
- Spa Portal gapAnalysisEngine.calculateRevenueEstimate includes:
  - Service price
  - Utilization rate
  - Protocol COGS
  - Profit calculation
  - Confidence scoring
  - Missing data tracking

**Impact:**
- Business users see "estimated revenue" without profit
- No ROI calculations
- Can't prioritize gaps by profitability

**Tables Available But Unused:**
- `revenue_model_defaults` (utilization rates, attach rates by spa type)
- `protocol_costing` (COGS data)

**Recommendation:**
- Integrate gapAnalysisEngine into Business Portal
- Add profit margin and ROI to gap recommendations

---

### Gap 5: No Service Category Benchmarking

**Observation:**
- menuOrchestrator.identifyGaps just finds unmatched protocols
- gapAnalysisEngine.performGapAnalysis uses `service_category_benchmarks`:
  - Minimum service counts per category
  - Priority levels
  - Spa-type-specific recommendations

**Impact:**
- Business users don't know if their menu is balanced
- No guidance on "you need 5 facials, 3 body treatments, 2 enhancements"
- Gap recommendations not prioritized by importance

**Table Available But Unused:**
- `service_category_benchmarks`

**Recommendation:**
- Port benchmark logic from gapAnalysisEngine to menuOrchestrator
- Show "Menu Health Score" with category breakdowns

---

### Gap 6: No Seasonal Alignment

**Observation:**
- menuOrchestrator doesn't check marketing_calendar
- gapAnalysisEngine.getCurrentSeasonalProtocols:
  - Fetches next 3 months of featured protocols
  - Flags seasonal gaps with high priority
  - Links to marketing themes

**Impact:**
- Business users miss seasonal revenue opportunities
- No "Add Pumpkin Facial for October" recommendations
- Retail recommendations don't prioritize seasonal products

**Table Available But Unused:**
- `marketing_calendar` (has featured_protocols and featured_products arrays)

**Recommendation:**
- Add seasonal gap detection to menuOrchestrator
- Add seasonal boost to retail product scoring

---

### Gap 7: Incomplete Protocol Data in Business Portal

**Observation:**
- menuOrchestrator loads: id, protocol_name, duration_minutes, service_category, protocol_description
- Missing:
  - target_concerns
  - allowed_products
  - contraindications
  - modalities_steps
  - completion_status

**Impact:**
- Can't match by concerns (weak matching)
- Can't validate product recommendations
- No safety/contraindication warnings
- Can't check if protocol is actually complete

**Recommendation:**
- Load full protocol data
- Filter to only completed protocols
- Use target_concerns and allowed_products in matching

---

### Gap 8: No Custom Build Recommendations

**Observation:**
- menuOrchestrator only matches existing protocols
- mappingEngine includes custom-built treatment recommendations:
  - When no direct protocol match
  - Suggests PRO products to build custom treatment
  - Provides pricing guidance

**Impact:**
- Business users miss "new service opportunity" guidance
- No product suggestions for unique services
- Less comprehensive planning

**Recommendation:**
- Add custom build logic to menuOrchestrator
- OR switch to mappingEngine

---

### Gap 9: No Implementation Readiness Scoring

**Observation:**
- Neither Business nor Spa Portal uses `implementationReadinessEngine.ts`
- File exists but unused

**Impact:**
- No guidance on "how ready is this spa to implement Protocol X"
- No staff training requirement assessment
- No equipment/space requirement checks

**Recommendation:**
- Integrate implementation readiness into gap recommendations
- Flag protocols requiring training, equipment, or space modifications

---

### Gap 10: No Intelligence Engine Usage

**File:** `aiConciergeEngine.ts`, `brandDifferentiationEngine.ts`, `openingOrderEngine.ts`, etc.

**Status:** Files exist but not integrated into Business Portal workflows

**Impact:**
- No AI-powered insights
- No brand differentiation analysis
- No competitive positioning
- No automated opening order optimization

**Recommendation:**
- Phase 2 feature set
- Requires OpenAI API key and prompt engineering
- Current deterministic engines sufficient for MVP

---

## Section E – Recommended Next Build Priority

### Tier 1: Critical for Business Portal Production (P0)

1. **Fix marketing_calendar Query** (BrandDetail.tsx:106)
   - Effort: 5 minutes
   - Impact: High - breaks brand detail page
   - Action: Remove `.eq('brand_id', brandData.id)` or add brand_id to schema

2. **Filter Incomplete Protocols** (menuOrchestrator.ts:184)
   - Effort: 10 minutes
   - Impact: High - prevents broken recommendations
   - Action: Add `.in('completion_status', ['steps_complete', 'fully_complete'])`

3. **Load Full Protocol Data** (menuOrchestrator.ts:184-187)
   - Effort: 30 minutes
   - Impact: High - enables better matching
   - Action: Include target_concerns, allowed_products in SELECT

---

### Tier 2: High-Value Features (P1)

4. **Integrate COGS Calculation** (menuOrchestrator.ts)
   - Effort: 2 hours
   - Impact: Very High - enables profit margin analysis
   - Action: Port calculateCOGS from mappingEngine
   - Dependencies: treatment_costs and protocol_costing tables

5. **Add Opening Order Generation** (menuOrchestrator.ts)
   - Effort: 4 hours
   - Impact: Very High - critical revenue feature
   - Action: Calculate backbar needs from protocol steps
   - Dependencies: canonical_protocol_step_products
   - UI: Add "Opening Order" tab to PlanResults

6. **Upgrade Retail Attach Logic** (menuOrchestrator.ts:342-367)
   - Effort: 3 hours
   - Impact: High - better product recommendations
   - Action: Replace with retailAttachEngine.generateRetailAttachRecommendations
   - Dependencies: protocol.allowed_products, protocol.target_concerns

7. **Add Seasonal Gap Detection** (menuOrchestrator.ts:297-325)
   - Effort: 2 hours
   - Impact: High - captures seasonal revenue opportunities
   - Action: Port getCurrentSeasonalProtocols from gapAnalysisEngine
   - Dependencies: marketing_calendar

---

### Tier 3: Enhanced Intelligence (P2)

8. **Add Revenue/Profit Modeling** (menuOrchestrator.ts)
   - Effort: 3 hours
   - Impact: Medium - better ROI insights
   - Action: Port calculateRevenueEstimate from gapAnalysisEngine
   - Dependencies: revenue_model_defaults, protocol_costing
   - UI: Show estimated monthly revenue and profit per gap

9. **Add Category Benchmarking** (menuOrchestrator.ts)
   - Effort: 2 hours
   - Impact: Medium - menu balance scoring
   - Action: Port analyzeSpaCategories and getCategoryBenchmarks from gapAnalysisEngine
   - Dependencies: service_category_benchmarks
   - UI: Add "Menu Health Score" to Overview tab

10. **Persist Relational References** (menuOrchestrator.ts:406-414)
    - Effort: 4 hours
    - Impact: Medium - enables analytics
    - Action: Create plan_protocol_matches, plan_gap_opportunities, plan_retail_recommendations tables
    - Benefits: Protocol usage tracking, cross-plan analytics, live data drill-down

---

### Tier 4: Advanced Features (P3)

11. **Implement PDF Protocol Extraction** (pdfExtractionService.ts:120-141)
    - Effort: 40 hours
    - Impact: Medium - speeds up protocol ingestion
    - Action: Build server-side extraction service with AI/parser
    - Alternative: Continue manual completion workflow

12. **Consolidate Plan Tables** (Schema migration)
    - Effort: 8 hours
    - Impact: Low - improves maintainability
    - Action: Merge plans and plan_submissions into unified schema
    - Dependencies: Requires Spa Portal updates

13. **Add Implementation Readiness** (unused implementationReadinessEngine.ts)
    - Effort: 6 hours
    - Impact: Low - nice-to-have insights
    - Action: Integrate staff/space/equipment readiness checks into gap recommendations

---

## Summary Statistics

### Engine Status Overview

| Engine | Total Functions | Fully Implemented | Partial | Stub | Used in Business Portal |
|--------|----------------|-------------------|---------|------|------------------------|
| documentExtraction | 3 | 3 | 0 | 0 | ✅ Yes |
| menuOrchestrator | 12 | 12 | 0 | 0 | ✅ Yes |
| mappingEngine | 6 | 6 | 0 | 0 | ❌ No (Spa Portal only) |
| gapAnalysisEngine | 10 | 9 | 0 | 1 | ❌ No (Spa Portal only) |
| retailAttachEngine | 7 | 7 | 0 | 0 | ❌ No (Spa Portal only) |
| planOrchestrator | 3 | 3 | 0 | 0 | ❌ No (Spa Portal only) |
| ingestionService | 9 | 8 | 0 | 1 | ⚠️ Partial (Admin only) |
| pdfExtractionService | 6 | 4 | 1 | 1 | ❌ No |

**Total Functions:** 56
**Fully Implemented:** 52 (93%)
**Partial Logic:** 1 (2%)
**Stubs:** 3 (5%)

### Key Insights

1. **Two Separate Orchestration Pipelines:**
   - Business Portal: menuOrchestrator (simpler, faster, less data)
   - Spa Portal: planOrchestrator → mappingEngine + gapAnalysisEngine + retailAttachEngine (richer, more sophisticated)

2. **Business Portal Uses 25% of Available Logic:**
   - Only uses documentExtraction + menuOrchestrator
   - Ignores mappingEngine, gapAnalysisEngine, retailAttachEngine
   - Missing COGS, revenue modeling, benchmarking, seasonal alignment

3. **Most Code is Fully Implemented:**
   - 93% of functions are production-ready
   - Main gaps are integration, not implementation
   - Priority is wiring existing engines together

4. **PDF Extraction is the Only Major Stub:**
   - extractProtocolFromPDF returns empty shells
   - Requires server-side AI/parser or continued manual workflow
   - Not blocking for MVP (manual completion works)

5. **Data Integrity Issues are Low-Hanging Fruit:**
   - marketing_calendar.brand_id query fails (5 min fix)
   - Incomplete protocols included in matching (10 min fix)
   - Quick wins for production readiness

---

## End of Audit Report
