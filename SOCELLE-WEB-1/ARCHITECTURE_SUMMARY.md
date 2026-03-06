# Naturopathica Account Manager - Architecture Summary

## Database Architecture Overview

### ✅ Fully Populated Tables

#### Marketing & Calendar
- **`marketing_calendar`** - 12 months of 2026 marketing strategy
  - Themes, featured protocols, featured products, new launches, webinars
  - Source: `2026+pro+marketing+calendar+-+final+(2).pdf`

#### Products
- **`naturopathica_backbar_products`** - PRO line products (27 entries)
  - Product names, costs, sizes, usage details

- **`naturopathica_retail_products`** - Retail products (35 entries)
  - Product names, wholesale, retail prices, MSRP

- **`medspa_products`** - MedSpa-specific products (36 entries)
  - Specialized products for medical spa applications

#### Reference Data
- **`medspa_treatments`** - MedSpa treatment types (5 entries)
- **`medspa_product_kits`** - Pre-packaged product kits (4 entries)
- **`pro_products`** - Additional PRO products (27 entries)
- **`retail_products`** - Additional retail products (35 entries)

### 🚧 Structural Tables (Empty, Ready for Data)

#### Protocol Details
- **`canonical_protocols`** - Official Naturopathica treatment protocols
  - Status: Structure exists, needs PDF extraction
  - Will contain: protocol names, categories, target concerns, durations

- **`canonical_protocol_steps`** - Step-by-step protocol instructions
  - Status: Newly created, awaits PDF extraction
  - Will contain: step numbers, titles, instructions, timing, techniques

- **`canonical_protocol_step_products`** - Products used in each step
  - Status: Newly created, awaits PDF extraction
  - Will contain: product names, usage amounts, application notes

- **`protocol_costing`** - Cost of goods sold per protocol
  - Status: Newly created, awaits cost PDF extraction
  - Will contain: COGS estimates, confidence levels, source references

#### Spa Integration
- **`spa_menus`** - Individual spa/medspa locations
  - Status: Structure exists, ready for menu uploads

- **`spa_services`** - Services offered by each spa
  - Status: Structure exists, linked to spa_menus

- **`service_mappings`** - Maps spa services to canonical protocols
  - Status: Structure exists, enhanced with missing_data_flags
  - Contains: match_type, solution_type, confidence, missing_data_flags

#### Rules & Costs
- **`mixing_rules`** - Product mixing/blending rules
  - Status: Structure exists, needs extraction from blending guide PDF

- **`treatment_costs`** - Cost tracking for treatments
  - Status: Structure exists, needs population

#### Tracking & Audit
- **`document_ingestion_log`** - Tracks PDF extraction progress
  - Status: Newly created, ready to log ingestion activities
  - Will track: source files, extraction status, confidence, errors

## Data Integrity System

### Core Principle
**Never invent, assume, or estimate data. All recommendations must reference actual database entries.**

### Validation Layer
- **File:** `/src/lib/dataIntegrityRules.ts`
- **Purpose:** Enforce strict data validation rules
- **Key Functions:**
  - `matchFeaturedToCanonical()` - Match marketing to protocols
  - `matchServiceToProtocol()` - Match spa services to protocols
  - `validateProtocolReference()` - Verify protocol exists
  - `validateProductReference()` - Verify product exists
  - `assessProtocolCompleteness()` - Check for missing data
  - `getDisplayRules()` - Determine what to show based on data availability

### Fuzzy Matching Policy

#### ✅ ALLOWED (Display Only)
1. Marketing calendar featured protocols → Canonical protocols (show badges)
2. Spa service names → Canonical protocols (mapping assistance)

#### ❌ PROHIBITED (Never)
- Creating new protocol names
- Assuming products exist
- Estimating costs without data
- Guessing treatment steps

## Application Features

### Marketing Calendar View
- 2026 seasonal planning by quarter
- Monthly themes and focus areas
- Featured protocols and products
- New product launches
- Training webinar schedule

### Protocols View
- List of canonical protocols
- Seasonal "Featured" badges (based on marketing calendar)
- Protocol management (add/edit/delete)
- Data completeness indicators (when implemented)

### Products Views
- PRO Products - Backbar professional products
- Retail Products - Consumer retail products
- Product pricing and details

### Spa Management Views
- Spa Menus - Upload and manage spa menus
- Service Mapping - Map spa services to canonical protocols
- Confidence scoring and data gap tracking

### Reports View
- Generate recommendations
- Cost analysis
- Product usage reports

## PDF Content (Not Yet Extracted)

### Protocol PDFs (60+ files)
Located in `/public/`:
- Facial protocols (20+ files)
- Body treatment protocols (15+ files)
- Enhancement protocols (10+ files)
- Massage protocols (10+ files)
- Specialty protocols (5+ files)

Each contains:
- Step-by-step instructions
- Product recommendations
- Timing guidelines
- Technique notes
- Contraindications

### Cost PDFs
- `cost_per_treatment_pdf_2025.pdf` - Treatment cost breakdowns
- `cost_per_application_summary_pdf_2025.pdf` - Application cost summary

### Reference Guides
- `pro_blending_guide_2025.pdf` - Mixing and blending rules
- `retailreferenceguide2023.pdf` - Retail product reference

### Marketing
- `2026+pro+marketing+calendar+-+final+(2).pdf` - ✅ EXTRACTED

## Next Development Phase

### Priority 1: Protocol Extraction
**Goal:** Populate canonical protocol tables from PDF files

**Steps:**
1. Build PDF parser for protocol documents
2. Extract protocol names → `canonical_protocols`
3. Extract step-by-step instructions → `canonical_protocol_steps`
4. Extract product usage → `canonical_protocol_step_products`
5. Log extraction → `document_ingestion_log`

**Impact:**
- Enables full protocol recommendations
- Allows accurate cost calculations
- Provides complete treatment planning

### Priority 2: Cost Data Integration
**Goal:** Populate protocol costing from cost PDFs

**Steps:**
1. Parse cost PDFs
2. Link costs to protocols → `protocol_costing`
3. Calculate confidence levels
4. Document source references

**Impact:**
- Accurate COGS estimates
- Pricing guidance for spas
- Margin analysis

### Priority 3: Service Mapping Intelligence
**Goal:** Enhanced spa service mapping with data completeness

**Steps:**
1. Match existing spa services to protocols
2. Calculate missing_data_flags for each mapping
3. Generate custom build recommendations where needed
4. Track mapping confidence

**Impact:**
- Better spa integration
- Clear data gap identification
- Actionable next steps for each mapping

## Technology Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (ready, not yet implemented)

## Security & Access

- **RLS Enabled:** All tables have Row Level Security
- **Public Read:** Anonymous users can read reference data
- **Authenticated Write:** Authenticated users can manage data
- **No Auth Required Yet:** Current build doesn't require login

## File Structure

```
/src
  /components       - React components for each view
  /lib
    supabase.ts           - Supabase client setup
    database.types.ts     - TypeScript types from schema
    dataIntegrityRules.ts - Validation and matching logic
    mappingEngine.ts      - Service mapping logic
    reportGenerator.ts    - Report generation logic

/public              - 60+ PDF protocol files (source data)

/supabase/migrations - Database schema migrations

DATA_INTEGRITY.md          - Data integrity documentation
ARCHITECTURE_SUMMARY.md    - This file
