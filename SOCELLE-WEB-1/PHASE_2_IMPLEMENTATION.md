# PHASE 2 CANONICAL PROTOCOL INGESTION
## Implementation Guide & Technical Limitations

---

## OVERVIEW

Phase 2 ingestion is now **LIVE** with a dedicated UI panel that handles:
- Pre-flight validation (readability checks on all 14 primary protocol PDFs)
- Structured protocol ingestion with transaction safety
- Post-ingestion validation reporting
- Exception tracking and unresolved product flagging

---

## ACCESSING PHASE 2 INGESTION

1. Navigate to **Document Ingestion** tab (first in navigation)
2. Locate **Phase 2: Canonical Protocols** in the phase dashboard
3. Click **"Ingest Phase"** button
4. The Phase 2 Ingestion Panel will open

---

## PHASE 2 WORKFLOW

### Step 1: Pre-Flight Validation
**Required before ingestion**

The system automatically runs readability checks on all 14 primary protocol files:
- `acneclearingfacial_protocol_060524.pdf`
- `advanced_wrinkle_remedy_facial_2021.pdf`
- `balance_and_clarify_teen_facial_2025_(2).pdf`
- `caffeineguashafacial_100224_1.pdf`
- `defyfacial_protocol_hydrafacial.pdf`
- `manukamoisturedrenchfacial.pdf`
- `marshmallow_soothing_facial.pdf`
- `mensrebalancingfacial_060524.pdf`
- `naturopathica-detoxrepairfacial.pdf`
- `naturopathicamanukapeel.pdf`
- `smoothingglycolicfacial_protocol_2024.pdf`
- `spiced_pumpkin_facial_2023.pdf`
- `vitamincradiancefacialupdated.pdf`
- `winterwellbeingresetfacial.pdf`

**Checks performed:**
- File accessibility (HTTP 200 status)
- File size validation
- Binary format verification

**Result:**
- ✓ Pass: All files readable → Proceed to ingestion
- ✗ Fail: One or more files unreadable → Ingestion blocked

All results are logged to `document_ingestion_log` table.

### Step 2: Protocol Ingestion
**Only runs if pre-flight passes**

For each protocol PDF:

1. **Create `canonical_protocols` record:**
   - `protocol_name` - Extracted from filename (basic parsing)
   - `category` - Defaults to 'facial'
   - `target_concerns` - Empty array (requires manual PDF parsing)
   - `typical_duration` - Defaults to '60 minutes'
   - `contraindications` - Empty array (requires manual PDF parsing)
   - `modalities_steps` - NULL (steps missing flag)

2. **Check for step-by-step instructions:**
   - Current implementation: NOT EXTRACTED (requires server-side PDF parser)
   - If steps were extracted, would create `canonical_protocol_steps` records
   - Each step would link to `canonical_protocol_step_products`

3. **Product matching:**
   - Extract product names from steps (not yet implemented)
   - Match to `pro_products` by exact name
   - If matched: Create `canonical_protocol_step_products` record
   - If not matched: Flag as unresolved product

4. **Transaction safety:**
   - Each protocol ingestion is wrapped in try/catch
   - Individual protocol failures don't block others
   - All exceptions logged to `document_ingestion_log`

### Step 3: Post-Ingestion Validation Report
**Automatically generated after ingestion**

The report shows:

**Summary Metrics:**
- Total protocols ingested
- Protocols with missing steps
- Protocols with unresolved products
- Total exceptions/warnings

**Per-Protocol Details:**
- Protocol name and source file
- Extraction confidence (High/Medium/Low)
- Steps created (count)
- Products linked (count)
- Unresolved products (list)
- Warnings and errors

**Color Coding:**
- 🟢 Green: Successful with high confidence
- 🟡 Yellow: Successful with warnings
- 🔴 Red: Failed with errors

---

## CURRENT IMPLEMENTATION LIMITATIONS

### ⚠️ PDF Text Extraction Not Implemented

**Why:**
- Browser-based PDF parsing is limited and unreliable
- PDF.js and similar libraries require significant setup
- Proper extraction needs server-side processing

**What's Created:**
- Protocol records with basic metadata ONLY
- Protocol names extracted from filenames
- Default values for duration and category
- `steps_missing` flag set to TRUE

**What's NOT Created:**
- Step-by-step instructions
- Product usage details
- Timing per step
- Technique notes

### ✅ What Works Now

1. **File Management**
   - All 14 protocols identified and tracked
   - Pre-flight validation runs successfully
   - Readability status logged

2. **Database Records**
   - `canonical_protocols` records created
   - `document_ingestion_log` entries created
   - Transaction safety enforced
   - Duplicate prevention (checks existing protocol names)

3. **Admin Visibility**
   - Real-time progress tracking
   - Exception logging and display
   - Post-ingestion validation report
   - Phase status updates

4. **Safety Controls**
   - No automatic progression to Phase 3
   - Rollback capability (on individual protocol failures)
   - Missing data flagging
   - Unresolved product tracking

---

## TECHNICAL APPROACH: SERVER-SIDE PDF PARSING

To enable full Phase 2 functionality, implement a **Supabase Edge Function**:

### Architecture

```
Client (React)
    ↓
    Calls Edge Function: /functions/v1/parse-protocol
    ↓
Edge Function (Deno)
    ↓
    Uses PDF.js or pdf-parse library
    ↓
    Extracts:
      - Protocol title from header
      - Target concerns from introduction
      - Step-by-step instructions with numbering
      - Product names per step
      - Usage amounts (pumps, dime-sized, etc.)
      - Timing per step
    ↓
    Returns structured JSON
    ↓
Client receives and ingests to database
```

### Edge Function Template

```typescript
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
  // 1. Receive PDF file or URL
  // 2. Parse using PDF.js or pdf-parse
  // 3. Extract structured data using regex patterns
  // 4. Match products to pro_products table
  // 5. Return JSON with:
  //    - protocolName
  //    - category
  //    - targetConcerns
  //    - steps[]
  //    - products[]
  //    - confidence score
});
```

### Extraction Patterns

**Protocol Name:**
- Match first heading or title block
- Pattern: `/^[A-Z][a-zA-Z\s&-]+(?:Facial|Treatment|Protocol|Peel)/`

**Step-by-Step:**
- Look for numbered or bulleted lists
- Pattern: `/^(\d+[\.\)]|•)\s+([A-Z][^.]+)/gm`
- Extract step title and instructions

**Product References:**
- Look for product names in steps
- Match against `pro_products.product_name`
- Pattern: `/(?:apply|use|massage)\s+([A-Z][a-zA-Z\s]+(?:Serum|Oil|Cream|Mask|Peel))/gi`

**Usage Amounts:**
- Pattern: `/(\d+\s+pumps?|dime-sized|quarter-sized|pea-sized|\d+\s*ml)/gi`

---

## INGESTION RULES (ENFORCED)

### Rule 1: Explicit Extraction Only
- Protocol names extracted from document headers (currently from filename)
- Product names must match existing `pro_products` exactly
- Steps must be explicitly numbered or bulleted
- Amounts must be stated in measurements

### Rule 2: No Inference or Assumptions
- If steps not found: Set `steps_missing = true`, create protocol with metadata only
- If product not matched: Flag as `unresolved_products`, do not create fake product
- If duration not stated: Use default or NULL
- If concerns not listed: Leave array empty

### Rule 3: Transaction Safety
- Each protocol wrapped in try/catch
- Protocol creation is atomic (all or nothing per protocol)
- Failures logged to `document_ingestion_log.exceptions`
- Failed protocols don't block others

### Rule 4: Duplicate Prevention
- Check `canonical_protocols.protocol_name` before insert
- If exists: Log error and skip
- If similar: Create new with suffix (e.g., "Facial V2")

### Rule 5: Product Matching
- Query `pro_products` table by exact name match
- If not found: Check for partial match (fuzzy)
- If still not found: Flag as unresolved
- Log all unresolved products for admin review

### Rule 6: Admin Review Gates
- Protocols with `steps_missing = true` require manual entry
- Protocols with `unresolved_products` require product resolution
- Low confidence extractions flagged for admin review
- Phase 3 remains locked until Phase 2 complete and reviewed

---

## DATABASE UPDATES

### After Phase 2 Ingestion

**canonical_protocols table:**
```sql
SELECT
  protocol_name,
  category,
  typical_duration,
  modalities_steps IS NULL as steps_missing,
  created_at
FROM canonical_protocols
WHERE created_at > NOW() - INTERVAL '1 hour';
```

Expected: 14 new protocol records

**document_ingestion_log table:**
```sql
SELECT
  source_file,
  status,
  extraction_confidence,
  exceptions,
  metadata
FROM document_ingestion_log
WHERE doc_type = 'protocol'
AND phase = 2
ORDER BY extracted_at DESC;
```

Expected: 14 log entries with status 'completed' or 'failed'

---

## POST-INGESTION TASKS

### 1. Review Protocols with Missing Steps
```sql
SELECT id, protocol_name
FROM canonical_protocols
WHERE modalities_steps IS NULL
ORDER BY protocol_name;
```

**Action:** Manually add steps or deploy PDF parser

### 2. Review Unresolved Products
```sql
SELECT
  metadata->>'unresolved_products'
FROM document_ingestion_log
WHERE doc_type = 'protocol'
AND metadata->>'unresolved_products_count' > '0';
```

**Action:**
- Add missing products to `pro_products`
- Re-run product matching
- Update `canonical_protocol_step_products`

### 3. Verify Extraction Confidence
```sql
SELECT
  source_file,
  extraction_confidence
FROM document_ingestion_log
WHERE extraction_confidence IN ('Low', 'Medium')
AND doc_type = 'protocol';
```

**Action:** Review and manually correct low-confidence extractions

---

## PHASE 3 UNLOCK CONDITIONS

Phase 3 will unlock when:

1. ✅ All 14 Phase 2 protocols have status 'completed'
2. ✅ No protocols have status 'failed'
3. ⚠️ Admin reviews and approves protocols with missing steps
4. ⚠️ Admin reviews and resolves unresolved products
5. ✅ Phase 2 dependency check passes

Current blocker: **Steps missing** (requires PDF parser or manual entry)

---

## NEXT STEPS

### Immediate (Current State)
1. Run Phase 2 ingestion via UI
2. Review post-ingestion report
3. Note protocols with missing steps
4. Note unresolved products

### Short Term (Manual Workaround)
1. Manually add steps to protocols via database or UI
2. Manually resolve product references
3. Update confidence scores
4. Approve Phase 2 as complete

### Long Term (Production Ready)
1. Deploy Supabase Edge Function for PDF parsing
2. Implement retry mechanism for failed extractions
3. Add admin UI for step-by-step entry
4. Add product resolution wizard
5. Build confidence scoring based on extraction patterns

---

## ROLLBACK PROCEDURE

If Phase 2 ingestion needs to be rolled back:

### Option 1: Individual Protocol
```sql
DELETE FROM canonical_protocol_step_products
WHERE protocol_step_id IN (
  SELECT id FROM canonical_protocol_steps
  WHERE canonical_protocol_id = '<protocol_id>'
);

DELETE FROM canonical_protocol_steps
WHERE canonical_protocol_id = '<protocol_id>';

DELETE FROM canonical_protocols
WHERE id = '<protocol_id>';

UPDATE document_ingestion_log
SET status = 'pending'
WHERE source_file = '<filename>';
```

### Option 2: Full Phase 2
```sql
-- Delete all Phase 2 protocols created today
DELETE FROM canonical_protocol_step_products
WHERE protocol_step_id IN (
  SELECT cps.id
  FROM canonical_protocol_steps cps
  JOIN canonical_protocols cp ON cp.id = cps.canonical_protocol_id
  WHERE cp.created_at > CURRENT_DATE
);

DELETE FROM canonical_protocol_steps
WHERE canonical_protocol_id IN (
  SELECT id FROM canonical_protocols
  WHERE created_at > CURRENT_DATE
);

DELETE FROM canonical_protocols
WHERE created_at > CURRENT_DATE;

UPDATE document_ingestion_log
SET status = 'pending'
WHERE doc_type = 'protocol'
AND extracted_at > CURRENT_DATE;
```

---

## SUMMARY

✅ **Phase 2 ingestion is functional** with basic protocol creation
⚠️ **PDF text extraction requires server-side implementation**
✅ **All safety controls and logging are in place**
🔒 **Phase 3+ remain locked until Phase 2 is complete**

The system creates a foundation for protocol management while clearly flagging what data is missing and what requires manual intervention or enhanced parsing.
