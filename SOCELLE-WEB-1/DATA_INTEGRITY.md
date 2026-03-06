# Data Integrity Architecture

## Core Principle
**All recommendations, cost estimates, and product suggestions MUST be grounded in actual database content. Never invent, assume, or estimate data.**

## Database Schema

### Protocol Data (Ground Truth)

#### `canonical_protocols`
- Master list of official Naturopathica treatment protocols
- **Source:** Protocol PDF files from `/public/`
- **Status:** Partially populated, needs PDF extraction
- Contains: `protocol_name`, `category`, `target_concerns`, `typical_duration`, `allowed_products`, `contraindications`

#### `canonical_protocol_steps`
- Step-by-step instructions for each protocol
- **Links to:** `canonical_protocols` via `canonical_protocol_id`
- Contains: `step_number`, `step_title`, `step_instructions`, `timing_minutes`, `technique_notes`
- **Status:** Not yet populated, awaits PDF extraction

#### `canonical_protocol_step_products`
- Specific products used in each protocol step
- **Links to:** `canonical_protocol_steps` via `protocol_step_id`
- Contains: `product_name`, `product_type` (BACKBAR/RETAIL), `usage_amount`, `usage_unit`, `notes`
- **Status:** Not yet populated, awaits PDF extraction

#### `protocol_costing`
- Cost of goods sold (COGS) for each protocol
- **Links to:** `canonical_protocols` via `canonical_protocol_id`
- Contains: `estimated_cogs`, `cogs_confidence` (High/Medium/Low), `cost_notes`, `source_reference`
- **Status:** Not yet populated, awaits cost PDF extraction

### Product Data (Ground Truth)

#### `naturopathica_backbar_products`
- Professional products used in treatments (PRO line)
- Contains: `product_name`, `category`, `product_code`, `size`, `cost_price`
- **Status:** Fully populated

#### `naturopathica_retail_products`
- Products sold to clients
- Contains: `product_name`, `category`, `wholesale_price`, `retail_price`
- **Status:** Fully populated

### Marketing Data

#### `marketing_calendar`
- 2026 seasonal marketing strategy
- Contains: `month`, `theme`, `featured_protocols[]`, `featured_products[]`, `new_launches[]`, `webinar_title`
- **Status:** Fully populated for all 12 months

### Spa Integration

#### `spa_menus`
- Individual spa/medspa locations
- Contains: `spa_name`, `raw_menu_data`

#### `spa_services`
- Services offered by each spa
- **Links to:** `spa_menus` via `menu_id`
- Contains: `service_name`, `category`, `duration`, `price`, `description`

#### `service_mappings`
- Maps spa services to canonical protocols
- **Links to:** `spa_services` via `service_id`
- Contains: `solution_type` (Protocol/Custom-Built/Unmapped), `match_type` (Direct/Partial/Adjacent/None), `confidence`, `missing_data_flags`
- **New field:** `missing_data_flags` - tracks incomplete data

### Tracking & Audit

#### `document_ingestion_log`
- Tracks which PDF files have been processed
- Contains: `source_file`, `doc_type`, `status`, `extraction_confidence`, `extracted_at`, `exceptions`, `metadata`
- **Status:** Not yet populated, will track PDF extraction progress

## Fuzzy Matching Policy

### ✅ ALLOWED Uses of Fuzzy Matching

1. **Marketing Calendar to Canonical Protocols**
   - **Purpose:** Display seasonal "Featured" badges on protocols
   - **Function:** `matchFeaturedToCanonical()`
   - **Logic:** Case-insensitive substring matching
   - **Never:** Creates new protocol names or invents data
   - **Example:** "Vitamin C Radiance Facial" in marketing calendar → matches → "Vitamin C Radiance Facial" in canonical_protocols

2. **Spa Service Names to Canonical Protocols**
   - **Purpose:** Help map spa menu items to official protocols
   - **Function:** `matchServiceToProtocol()`
   - **Returns:** Match metadata with confidence score
   - **Never:** Invents protocol names or assumes protocols exist

### ❌ PROHIBITED Uses of Fuzzy Matching

- Creating new protocol names
- Assuming products exist
- Estimating costs without data
- Guessing protocol steps
- Inventing product recommendations
- Calculating COGS without product costs

## Data Completeness Tracking

### Missing Data Flags (JSON)
```json
{
  "protocol_steps_missing": boolean,
  "product_details_missing": boolean,
  "costing_missing": boolean,
  "needs_pdf_extraction": boolean
}
```

### Display Rules Based on Data Availability

- **Show Full Protocol:** Only if `canonical_protocol_steps` has entries
- **Show Cost Estimate:** Only if `protocol_costing` has entry OR all products have costs
- **Show Product Recommendations:** Only if `canonical_protocol_step_products` has entries
- **Show Warning:** If any missing data flags are true

### Example Warning Messages
- "Missing data: step-by-step instructions. Available after PDF extraction."
- "Missing data: product usage details, cost estimates. Available after PDF extraction."

## Validation Rules

### Protocol References
```typescript
// CORRECT: Reference existing protocol
const protocolId = "uuid-of-existing-protocol";

// INCORRECT: Invent protocol name
const protocolName = "Custom Anti-Aging Facial"; // Unless it exists in canonical_protocols
```

### Product References
```typescript
// CORRECT: Reference existing product
const productName = "Vitamin C15 Wrinkle Remedy Serum"; // Exists in backbar_products

// INCORRECT: Assume product exists
const productName = "Super Hydrating Serum"; // Not in database
```

### Cost Calculations
```typescript
// CORRECT: Based on actual product costs
const cogs = calculateFromProductCosts(productList);

// INCORRECT: Estimate without data
const cogs = 25.00; // No source data
```

## Next Steps for Data Population

### Phase 1: Protocol Extraction (Priority)
- [ ] Extract 60+ protocol PDFs from `/public/`
- [ ] Parse step-by-step instructions
- [ ] Identify products used in each step
- [ ] Populate `canonical_protocols`, `canonical_protocol_steps`, `canonical_protocol_step_products`

### Phase 2: Cost Data Extraction
- [ ] Extract `cost_per_treatment_pdf_2025.pdf`
- [ ] Extract `cost_per_application_summary_pdf_2025.pdf`
- [ ] Link cost data to protocols
- [ ] Populate `protocol_costing`

### Phase 3: Mixing Rules Extraction
- [ ] Extract `pro_blending_guide_2025.pdf`
- [ ] Parse mixing/blending rules
- [ ] Populate `mixing_rules` table

### Phase 4: Service Mapping
- [ ] Match existing spa services to canonical protocols
- [ ] Calculate `missing_data_flags` for each mapping
- [ ] Identify protocols that need custom builds
- [ ] Update `service_mappings` with confidence scores

## File Reference

### Key Files
- `/src/lib/dataIntegrityRules.ts` - Validation and matching logic
- `/src/components/ProtocolsView.tsx` - Uses validated matching for featured badges
- `DATA_INTEGRITY.md` - This documentation file

### Source PDFs (Not Yet Extracted)
All PDFs in `/public/` directory:
- 60+ protocol files (facials, body treatments, enhancements)
- Cost analysis PDFs
- Mixing guide PDF
- Retail reference guide PDF
- Marketing calendar PDF (already extracted)

## Summary

This architecture ensures:
1. **No invented data** - All recommendations reference database entries
2. **Transparent matching** - Fuzzy matching is clearly documented and limited
3. **Completeness tracking** - Missing data is flagged, not guessed
4. **Audit trail** - Document ingestion is logged
5. **Data provenance** - Source files are referenced

The system will not provide recommendations it cannot substantiate with actual data.
