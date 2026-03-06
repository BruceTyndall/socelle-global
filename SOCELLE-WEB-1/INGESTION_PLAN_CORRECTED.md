# CORRECTED INGESTION PLAN
## Using Existing Database Schema

This document outlines the corrected ingestion plan that maps to the **actual** database schema, not hypothetical tables.

---

## EXISTING SCHEMA SUMMARY

### Core Protocol Tables
- `canonical_protocols` - Main protocol records (protocol_name, category, target_concerns, typical_duration)
- `canonical_protocol_steps` - Step-by-step instructions (step_number, step_title, step_instructions, timing_minutes)
- `canonical_protocol_step_products` - Products used in each step (product_name, product_type, usage_amount)

### Product Tables
- `pro_products` - Professional/backbar products (product_name, category, size, pro_price, status)
- `retail_products` - Retail/take-home products (product_name, category, size, msrp, wholesale, status)

### Cost & Mixing Tables
- `protocol_costing` - Cost per protocol (canonical_protocol_id, estimated_cogs, cogs_confidence, cost_notes)
- `treatment_costs` - General cost tracking (item_type, item_reference, cost_per_unit, typical_usage_amount)
- `mixing_rules` - Product mixing rules (rule_type, product_references, rule_description, severity)

### Marketing & Calendar
- `marketing_calendar` - 2026 marketing calendar (month, theme, focus_moment, featured_products, featured_protocols)

### Spa Menu Management
- `spa_menus` - Uploaded spa menus (spa_name, raw_menu_data, parse_status)
- `spa_services` - Parsed services from menus (service_name, category, duration, price, keywords)
- `service_mappings` - Mapping results (solution_type, solution_reference, match_type, confidence, rationale)

### Tracking & Logging
- `document_ingestion_log` - Tracks which PDFs have been processed (source_file, doc_type, status, extraction_confidence, exceptions)

### MedSpa-Specific Tables
- `medspa_treatments` - Med-spa treatment protocols
- `medspa_products` - Products with med-spa context
- `medspa_product_kits` - Pre-configured product kits

---

## CORRECTED PHASE MAPPING

### Phase 1: Marketing Calendar
**Status**: ✓ ALREADY POPULATED (from migration)

**Files**:
- `2026+pro+marketing+calendar+-+final+(2).pdf`

**Target Tables**:
- `marketing_calendar` - 12 records for 2026 already exist
- `document_ingestion_log` - Track ingestion status

**Ingestion Strategy**:
- Marketing calendar was pre-populated during migration
- Phase 1 ingestion verifies data exists and logs completion
- No parsing required

---

### Phase 2: Canonical Protocols (Core Facials)
**Status**: Locked (depends on Phase 1)

**Files (15 primary)**:
1. acneclearingfacial_protocol_060524.pdf
2. advanced_wrinkle_remedy_facial_2021.pdf
3. balance_and_clarify_teen_facial_2025_(2).pdf
4. caffeineguashafacial_100224_1.pdf
5. defyfacial_protocol_hydrafacial.pdf
6. manukamoisturedrenchfacial.pdf
7. marshmallow_soothing_facial.pdf
8. mensrebalancingfacial_060524.pdf
9. naturopathica-detoxrepairfacial.pdf
10. naturopathicamanukapeel.pdf
11. smoothingglycolicfacial_protocol_2024.pdf
12. spiced_pumpkin_facial_2023.pdf
13. vitamincradiancefacialupdated.pdf
14. winterwellbeingresetfacial.pdf

**Secondary Files (skip)**:
- vitamincradiancefacial.pdf (older version)
- copy_of_signaturepureresultsfacial_protocol_060524.pdf (copy, needs review)

**Target Tables**:
- `canonical_protocols` - Create protocol record with metadata
- `canonical_protocol_steps` - Extract step-by-step instructions
- `canonical_protocol_step_products` - Link products to steps
- `document_ingestion_log` - Track each file

**Required Fields**:
```sql
canonical_protocols:
  - protocol_name (from PDF header)
  - category (facial/body/massage/oncology/specialty)
  - target_concerns (array)
  - typical_duration (e.g., "60 minutes")

canonical_protocol_steps:
  - canonical_protocol_id (FK)
  - step_number (sequential)
  - step_title (e.g., "Cleanse")
  - step_instructions (detailed text)
  - timing_minutes (if specified)

canonical_protocol_step_products:
  - protocol_step_id (FK)
  - product_name (exact match to pro_products)
  - product_type (BACKBAR/RETAIL/CONSUMABLE/TOOL)
  - usage_amount (e.g., "2 pumps", "dime-sized")
```

**Safety Rules**:
- Protocol name must come from document title/header
- If steps missing, create protocol with `modalities_steps = null` and flag in log
- Product names must match existing `pro_products` or `retail_products`
- If product unknown, log as exception, do not create fake product

---

### Phase 3: Extended Services (Enhancements, Body, Massage, Oncology, Specialty)
**Status**: Locked (depends on Phase 2)

**Files (28 primary)**:

**3A - Enhancements (12 files)**:
- caffeineguashaeyetreatment_100224.pdf
- enhancement_smoothingglycolicfacial_protocol_2024.pdf
- handfootenhancement_smoothingglycolic_protocol_2024.pdf
- holistic_facial_acupressure_ff21b45a-6bbf-442a-b916-32c84785f99d.pdf
- holistic_facial_cleansing_stimulation_de98f190-bc4d-4393-b80f-0f208a3e2e8c.pdf
- holistic_facial_massage_stimulation_f726efa4-f605-4068-a16f-63c6f9a97812.pdf
- naturopathica_eye_contour_enhancement.pdf
- naturopathica_luminous_lip_enhancement.pdf
- naturopathicaarnicasweetbirchenhancement.pdf
- naturopathicapeppermintfoottherapy.pdf
- naturopathicapepperminthandarmtensionreliefs.pdf
- naturopathicawildlimescalptreatment.pdf

**3B - Body Treatments (5 files)**:
- acneclearingbacktreatment_060524.pdf
- naturopathica_espresso_mud_detoxifying_body_treatment.pdf
- naturopathica_lemon_verbena_hydrating_body_treatment.pdf
- naturopathica_moisture_drench_skin_conditioning_treatment.pdf
- naturopathica_seaweed_body_wrap_treatment.pdf

**3C - Massage (6 files)**:
- aromaticdetoxmassage.pdf
- naturopathicaalpinearnicadeeptissuemassage.pdf
- naturopathicablueeucalyptusenergizingmassage.pdf
- naturopathicanirvanastressreliefmassage.pdf
- naturopathicaprenatalrestrenewaltreatment.pdf
- naturopathicasignatureherbalmassages.pdf

**3D - Oncology-Safe (5 files)**:
- oncology_care_-_body_restore_ritual.pdf
- oncology_care_-_nurture_&_restore_facial.pdf
- oncology_care_-_soothing_sole_ritual.pdf
- oncology_care_-_tension_release_scalp_massage.pdf
- oncology_care_-_the_helping_hands_massage.pdf

**3E - Specialty/Wellness (5 files)**:
- naturopathica_bath_cures.pdf
- naturopathica_lemon_verbena_quench_manicure.pdf
- naturopathica_rosemary_mint_pedicure.pdf
- naturopathica_sweet_birch_magnesium_bath_cure.pdf
- naturopathicawelcomeclosingritualsface_ec4b0875-e399-4dcf-927b-28f6f283ab9e.pdf

**Target Tables**:
- Same as Phase 2: `canonical_protocols`, `canonical_protocol_steps`, `canonical_protocol_step_products`
- Category field distinguishes service types

**Category Tagging**:
- Enhancements: `category = 'enhancement'`
- Body: `category = 'body'`
- Massage: `category = 'massage'`
- Oncology: `category = 'oncology'` (or add `oncology_safe = true` flag)
- Specialty: `category = 'specialty'`

---

### Phase 4: Mixing & Blending Rules
**Status**: Locked (depends on Phase 2 and Phase 6)

**Files (1)**:
- pro_blending_guide_2025.pdf

**Target Tables**:
- `mixing_rules` - Product mixing ratios and rules
- `document_ingestion_log`

**Required Fields**:
```sql
mixing_rules:
  - rule_type (compatibility/concentration/restriction)
  - product_references (array of product names)
  - rule_description (the actual rule)
  - severity (mandatory/warning/info)
```

**Safety Rules**:
- Never infer mixing ratios
- Product names must match existing `pro_products`
- If ratio not explicit in PDF, log as exception

---

### Phase 5: Cost & COGS
**Status**: Locked (depends on Phase 2, 3, and 6)

**Files (2)**:
- cost_per_treatment_pdf_2025.pdf → `protocol_costing`
- cost_per_application_summary_pdf_2025.pdf → `treatment_costs`

**Target Tables**:
- `protocol_costing` - Cost per complete protocol
- `treatment_costs` - Cost per product application
- `document_ingestion_log`

**Required Fields**:
```sql
protocol_costing:
  - canonical_protocol_id (FK to canonical_protocols)
  - estimated_cogs (decimal)
  - cogs_confidence (High/Medium/Low)
  - cost_notes (explanation)
  - source_reference (PDF filename/page)

treatment_costs:
  - item_type (protocol/product/step)
  - item_reference (name or identifier)
  - cost_per_unit (decimal)
  - unit_type (ml/application/treatment)
  - typical_usage_amount (decimal)
```

**Safety Rules**:
- Never estimate costs without explicit data
- Protocol names must match existing `canonical_protocols`
- Product names must match existing `pro_products` or `retail_products`
- If cost data incomplete, log as exception

---

### Phase 6: Product References
**Status**: Ready (independent)

**Files (3)**:
- retailreferenceguide2023.pdf
- aromatherapy_products.pdf
- naturopathica_wellness_teas.pdf

**Target Tables**:
- `retail_products` - Add/update retail product catalog
- `pro_products` - Add/update backbar products (if found)
- `document_ingestion_log`

**Note**: Most products already populated from earlier migrations. This phase fills gaps or updates attributes.

---

### Phase 7: Manual Review
**Status**: Locked (requires admin classification)

**Files (1)**:
- pk_for_app_.pdf (unknown content, cryptic filename)

**Target Tables**: TBD (depends on manual inspection)

**Action Required**: Admin must open PDF, determine content type, then manually assign to appropriate phase.

---

## INGESTION SAFETY RULES (ENFORCED)

### Rule 1: No Fuzzy Matching
- Protocol names must be extracted from document title or header
- Product names must match existing database records by exact name
- If no exact match exists, flag for admin review
- Never create records based on filename alone

### Rule 2: Explicit Data Extraction Only
- Product quantities must be extracted from "amount used" or measurement fields
- Mixing ratios must be extracted from blending guide (never inferred)
- Costs must be extracted from cost documents (never estimated)
- Step instructions must be extracted from numbered or bulleted steps

### Rule 3: Missing Data Flagging
- If PDF lacks step-by-step instructions:
  - Create `canonical_protocols` record with metadata only
  - Set `modalities_steps = null`
  - Log exception: `"steps_missing": true`
- If protocol references unknown products:
  - Create protocol record
  - Flag product references as `unresolved_products`
  - Log in `document_ingestion_log.exceptions`

### Rule 4: Version Control
- Use "primary file" designation from duplicate resolution table
- Never ingest secondary/duplicate files unless explicitly approved
- Track ingestion timestamp and source file in all records

### Rule 5: Data Integrity Enforcement
- Enforce foreign key constraints (protocols → steps → products)
- Validate all cost values are numeric and positive
- Validate all ratios sum appropriately (mixing rules)
- Reject records that violate constraints; log failures

### Rule 6: Admin Approval Gates
- Each phase must be approved before execution
- Admin must review flagged/unresolved records before proceeding to dependent phases
- No automatic progression between phases

### Rule 7: Rollback Capability
- Each phase ingestion must be transaction-wrapped
- If phase fails, rollback all records from that phase
- Preserve ingestion logs for debugging

### Rule 8: Unknown Files
- Files in Phase 7 (Unknown) must NOT be ingested automatically
- Admin must manually classify and approve

---

## ADMIN CONTROL PANEL (IMPLEMENTED)

### Features Implemented

#### 1. File Dashboard
- Lists all 57 PDFs from /public/
- Shows phase, type, status, confidence, exceptions
- Per-file actions:
  - Readability Check (validates PDF is accessible)
  - View PDF (opens in new tab)
  - Approve as Primary
  - Mark Secondary
  - Ignore

#### 2. Phase Controls
- Visual progress bars per phase
- Dependency tracking (phases lock until dependencies complete)
- Per-phase actions:
  - Filter Files (show only files in that phase)
  - Ingest Phase (execute approved files)
  - Rollback Phase (undo completed ingestion)

#### 3. Logging & Exceptions
- `document_ingestion_log` tracks every file:
  - source_file
  - doc_type
  - status (pending/processing/completed/failed/skipped)
  - extraction_confidence (High/Medium/Low)
  - extracted_at (timestamp)
  - exceptions (JSON array of errors)
  - metadata (JSON with additional info)

#### 4. Safety Features
- Transaction-wrapped ingestion with rollback
- Real-time validation feedback
- Exception tracking and reporting
- Phase dependency enforcement

---

## PHASE 1 EXECUTION COMPLETE

**File**: `2026+pro+marketing+calendar+-+final+(2).pdf`

**Result**:
- ✓ Marketing calendar already populated (12 records for 2026)
- ✓ Ingestion log entry created
- ✓ Status: completed
- ✓ Confidence: High

**Next Steps**:
- Phase 2+ remain locked until explicit admin approval
- Review this corrected ingestion plan
- Approve Phase 2 when ready to ingest canonical protocols

---

## TABLE MAPPING SUMMARY

| Phase | PDF Type | Primary Table | Related Tables |
|-------|----------|---------------|----------------|
| 1 | Marketing Calendar | `marketing_calendar` | `document_ingestion_log` |
| 2 | Canonical Protocols | `canonical_protocols` | `canonical_protocol_steps`, `canonical_protocol_step_products` |
| 3 | Extended Services | `canonical_protocols` | `canonical_protocol_steps`, `canonical_protocol_step_products` |
| 4 | Mixing Guide | `mixing_rules` | `document_ingestion_log` |
| 5 | Cost Analysis | `protocol_costing`, `treatment_costs` | `document_ingestion_log` |
| 6 | Product Guides | `retail_products`, `pro_products` | `document_ingestion_log` |
| 7 | Unknown | TBD | Requires manual review |

---

## AWAITING APPROVAL FOR PHASE 2+

The ingestion control panel is now live and ready for controlled phase execution.

To proceed:
1. Review Phase 1 completion in the UI
2. Explicitly request Phase 2 ingestion when ready
3. Review exceptions and flagged items before advancing to dependent phases
