# Manual Protocol Completion Workflow
## Phase 2 Extension Guide

---

## OVERVIEW

The Manual Protocol Completion workflow enables admins to fill in missing protocol data through a structured editor interface. This addresses the limitation that automated PDF text extraction requires server-side processing.

---

## ACCESSING THE PROTOCOL COMPLETION EDITOR

### From Protocols View

1. Navigate to **"Protocols"** tab in the main navigation
2. View the **Completion Progress Dashboard** showing:
   - Total protocols
   - Incomplete count
   - Steps complete count
   - Fully complete count
   - Overall completion percentage

3. **Filter protocols** by completion status:
   - All
   - Incomplete
   - Steps Complete
   - Fully Complete

4. Click the **blue "Complete Protocol" icon** (FileEdit) for any protocol

### Direct Protocol Access

Protocols are accessible from the canonical protocols list. Each row shows:
- Protocol name with featured badge (if applicable)
- Category
- **Completion status badge** (color-coded)
- Target concerns
- Duration
- Action buttons

---

## COMPLETION STATUS LEVELS

### 1. Incomplete (Red Badge)
**Criteria:**
- No steps entered, OR
- Steps exist but lack instructions

**What's Missing:**
- Step-by-step instructions
- Product linkages
- Target concerns (optional for this level)
- Contraindications (optional for this level)

### 2. Steps Complete (Yellow Badge)
**Criteria:**
- ✅ All steps have instructions
- ✅ Each step has step_number and step_instructions
- ⚠️ Products, concerns, or contraindications may be missing

**What's Missing:**
- Target concerns (may be empty)
- Contraindications (may be empty)
- Product linkages (may be empty)

### 3. Fully Complete (Green Badge)
**Criteria:**
- ✅ All steps with instructions
- ✅ Target concerns populated
- ✅ Contraindications populated
- ✅ At least one product linked to steps

**Result:**
- Protocol is production-ready
- Can be used in menu generation
- Costing can be calculated
- No further manual entry needed

---

## USING THE PROTOCOL COMPLETION EDITOR

### Opening the Editor

Click the **blue FileEdit icon** in the Actions column of any protocol row.

The editor opens as a full-screen modal with:
- Protocol metadata at top
- Scrollable content area
- Sticky header and footer

### Editor Sections

#### A) Protocol Metadata (Always Visible)
Displays read-only information:
- Protocol name
- Category
- Current completion status
- Source file (if ingested from Phase 2)

#### B) Editable Fields

**1. Typical Duration**
- Free text field
- Example: "60 minutes", "90 min", "1 hour"
- Used for spa menu display and scheduling

**2. Target Concerns** (comma-separated)
- Free text input
- Parsed as array on save
- Example: "Acne, Inflammation, Sensitivity, Redness"
- Used for protocol recommendation and filtering

**3. Contraindications** (comma-separated)
- Free text input
- Parsed as array on save
- Example: "Pregnancy, Active infection, Recent laser treatment, Rosacea"
- Critical for safety and liability
- **Required for "Fully Complete" status**

**4. Admin Notes**
- Free text area for internal notes
- Document sources, clarifications, or special instructions
- Not customer-facing
- Useful for audit trail

#### C) Protocol Steps Editor

**Adding a Step:**
1. Click **"Add Step"** button (top-right of steps section)
2. New step auto-numbers sequentially
3. Fill in step details:

**Step Fields:**
- **Step Number** (auto-generated, can edit)
- **Step Title** (optional) - e.g., "Cleanse", "Exfoliate", "Mask"
- **Instructions** (required) - Detailed, step-by-step directions
- **Timing (minutes)** (optional) - How long this step takes
- **Technique Notes** (optional) - Special techniques, warnings, or tips

**Step Product Linkages:**

For each step, you can add one or more products:

1. Click **"Add Product"** button within the step
2. Select product from dropdown (sourced from `pro_products` table)
3. Enter usage details:
   - **Usage Amount** - e.g., "2", "dime-sized", "quarter-sized"
   - **Usage Unit** - e.g., "pumps", "ml", "drops"
   - **Notes** - Additional product-specific notes

**Product Dropdown:**
- Shows all products from `naturopathica_backbar_products`
- Format: `Product Name (Brand)`
- Searchable by typing
- Only backbar products (no retail)

**Removing Items:**
- Click red **trash icon** to remove a step
- Click small **X** to remove a product from a step
- Confirmation is automatic (no undo warning)

#### D) Validation Rules

**Cannot Save If:**
- Any step lacks instructions (step_instructions is empty)

**Cannot Mark "Steps Complete" If:**
- No steps exist
- Any step lacks instructions

**Cannot Mark "Fully Complete" If:**
- Steps not complete (see above)
- Target concerns array is empty
- Contraindications array is empty
- No products linked to any step

---

## SAVING PROTOCOLS

### Save Options (Footer Buttons)

#### 1. Cancel
- Closes editor without saving
- No changes are persisted
- Confirmation not required

#### 2. Save Draft
- Saves all entered data
- Does NOT change completion status
- Useful for partial work
- Allows you to return later

#### 3. Mark Steps Complete
- Saves all data
- Updates `completion_status` to `steps_complete`
- Validates that all steps have instructions
- Sets `completed_by` and `completed_at` timestamps
- **Blocked if validation fails**

#### 4. Mark Fully Complete
- Saves all data
- Updates `completion_status` to `fully_complete`
- Validates:
  - All steps have instructions
  - Target concerns is populated
  - Contraindications is populated
  - At least one product is linked
- Sets `completed_by` and `completed_at` timestamps
- **Blocked if validation fails**

### Auto-Update Logic

The database includes triggers that automatically recalculate completion status when:
- Steps are added/updated/deleted
- Products are added/updated/deleted
- Target concerns or contraindications are updated

**Downgrade Warning:**
If you mark a protocol as "Fully Complete" then later remove products or concerns, the status will automatically downgrade to "Steps Complete" or "Incomplete".

---

## COMPLETION PROGRESS TRACKING

### Dashboard Metrics

The Protocols view displays:

1. **Total Protocols** - All canonical protocols in database
2. **Incomplete** - Protocols without complete steps
3. **Steps Complete** - Steps done, metadata may be missing
4. **Fully Complete** - Production-ready protocols

### Progress Bar

Visual indicator showing:
- Percentage of protocols that are NOT incomplete
- Formula: `((stepsComplete + fullyComplete) / total) * 100`
- Blue progress bar with percentage label

### Phase 3 Unlock Message

Below progress bar:
- **If incomplete > 0:** Shows count and "need completion to unlock Phase 3"
- **If incomplete = 0:** Shows "All protocols complete! Phase 3 ready to unlock."

---

## PHASE 3 UNLOCK RULE

### Enforcement

Phase 3 (Extended Services) is **LOCKED** until:

✅ All Phase 2 ingestion files marked as "completed"
✅ **AND** all Phase 2 canonical protocols have `completion_status != 'incomplete'`

This means:
- Protocols can be "Steps Complete" OR "Fully Complete"
- Protocols CANNOT be "Incomplete"

### Checking Phase Status

Navigate to **"Document Ingestion"** tab to see phase status:
- Phase 2 shows as "Complete" when files ingested
- Phase 3 shows as "Locked" until protocol completion requirement met
- Phase 3 shows as "Ready" when unlocked

---

## WORKFLOW EXAMPLES

### Example 1: Completing a Freshly Ingested Protocol

**Scenario:** Protocol ingested from Phase 2 with no steps

1. Navigate to Protocols view
2. Filter by "Incomplete"
3. Find protocol (e.g., "Acne Clearing Facial")
4. Click FileEdit icon
5. Add steps:
   - Step 1: Cleanse (Purifying Gel Cleanser, 2 pumps)
   - Step 2: Exfoliate (Glycolic Peel, apply thin layer)
   - Step 3: Extract (no products, 10 minutes)
   - Step 4: Mask (Peppermint Eucalyptus Mask, even layer)
   - Step 5: Moisturize (Oil Free Lotion, 1 pump)
6. Add target concerns: "Acne, Congestion, Oily skin"
7. Add contraindications: "Active infection, Accutane use"
8. Click **"Mark Fully Complete"**
9. Protocol now shows green badge

### Example 2: Updating an Existing Protocol

**Scenario:** Protocol has steps but needs product linkages

1. Find protocol with "Steps Complete" status
2. Click FileEdit icon
3. For each step, click "Add Product"
4. Select products from dropdown
5. Add usage amounts
6. Click **"Mark Fully Complete"**

### Example 3: Bulk Completion Strategy

**Approach for 14 Phase 2 Protocols:**

**Session 1:** Focus on steps only
- Complete steps for all 14 protocols
- Use "Save Draft" after each
- Don't worry about products yet

**Session 2:** Add products
- Return to each protocol
- Link products to steps
- Use product reference PDFs as guide

**Session 3:** Finalize metadata
- Add target concerns for all
- Add contraindications for all
- Mark as "Fully Complete"

---

## DATA SAFETY & AUDIT TRAIL

### Automatic Tracking

Every save operation logs:
- `last_edited_by` - Currently set to "admin" (can be enhanced with real user auth)
- `last_edited_at` - Timestamp of last edit

When marking complete:
- `completed_by` - Admin who marked as complete
- `completed_at` - Timestamp of completion

### Change History

All changes are transactional:
- Step changes are atomic
- Product changes are atomic
- Rollback on error

### Manual Entry Notes

Use the "Admin Notes" field to document:
- Source PDFs referenced
- Clarifications made
- Assumptions taken
- Special instructions

---

## COMMON ISSUES & SOLUTIONS

### Issue: Can't Mark as Complete

**Symptom:** Button disabled or shows error

**Solutions:**
1. Check that all steps have instructions
2. For "Fully Complete", check:
   - Target concerns filled
   - Contraindications filled
   - At least one product linked
3. Review error message in red banner at top

### Issue: Product Not in Dropdown

**Symptom:** Can't find product when adding to step

**Solutions:**
1. Verify product exists in `pro_products` table
2. Check product name spelling
3. Add product to backbar catalog first (Pro Products view)
4. Return to protocol editor and try again

### Issue: Steps Not Saving

**Symptom:** Changes lost after closing editor

**Solutions:**
1. Always click "Save Draft" or completion button before closing
2. Don't use browser back button
3. Don't refresh page while editor is open
4. Check for error messages

### Issue: Completion Status Downgraded

**Symptom:** Protocol was "Fully Complete", now shows "Steps Complete"

**Cause:** Automatic trigger detected missing data

**Solutions:**
1. Re-open protocol editor
2. Check for deleted products
3. Check for empty concerns or contraindications
4. Re-add missing data
5. Mark as complete again

---

## RECOMMENDED COMPLETION ORDER

### Priority 1: Featured Protocols
Complete protocols that appear in the current month's marketing calendar first.

Check the teal "Featured" banner at top of Protocols view to see which protocols are promoted this month.

### Priority 2: High-Revenue Services
Focus on protocols that are:
- Most frequently booked
- Highest price point
- Signature services

### Priority 3: Basic Facials
Complete standard facial protocols that form the foundation of the spa menu.

### Priority 4: Seasonal & Specialty
Leave seasonal and low-frequency protocols for last.

---

## TIPS FOR EFFICIENT COMPLETION

1. **Keep PDFs Open:** Have source protocol PDFs open in another window for reference

2. **Use Copy-Paste:** Copy instructions from PDFs directly into editor

3. **Standardize Formatting:**
   - Use consistent terminology
   - Format usage amounts the same way (e.g., always "2 pumps" not "2-3 pumps")

4. **Product Names:** Match exact product names from backbar catalog

5. **Save Frequently:** Use "Save Draft" every few steps

6. **Batch Similar Protocols:** Complete all acne protocols together, all anti-aging together, etc.

7. **Admin Notes:** Document your sources and reasoning for future reference

---

## DATABASE SCHEMA REFERENCE

### Tables Modified

**canonical_protocols**
- `completion_status` - enum: incomplete | steps_complete | fully_complete
- `completed_by` - text: admin user identifier
- `completed_at` - timestamptz: when marked complete
- `manual_entry_notes` - text: admin notes
- `last_edited_by` - text: last editor
- `last_edited_at` - timestamptz: last edit time

**canonical_protocol_steps** (existing)
- Linked via `canonical_protocol_id`
- Stores step-by-step instructions

**canonical_protocol_step_products** (existing)
- Linked via `protocol_step_id`
- Stores product usage per step

---

## NEXT STEPS AFTER COMPLETION

Once all Phase 2 protocols are at least "Steps Complete":

1. **Phase 3 Unlocks Automatically**
   - Check Document Ingestion tab
   - Phase 3 status changes to "Ready"

2. **Begin Phase 3 Ingestion**
   - Enhancements (eye, lip, hand, foot)
   - Body treatments
   - Massage protocols
   - Oncology care
   - Specialty services

3. **Review Protocol Costing**
   - Navigate to Costs view
   - Calculate COGS per protocol
   - Review profitability

4. **Generate Spa Menus**
   - Navigate to Spa Menus view
   - Create seasonal menus from completed protocols
   - Export for print or digital use

---

## SUPPORT & TROUBLESHOOTING

### Validation Errors

All validation errors appear in a red banner at the top of the editor modal. Common errors:

- "At least one step is required"
- "Step X: Instructions are required"
- "Cannot mark as fully complete: Target concerns are required"
- "Cannot mark as fully complete: Contraindications are required"
- "Cannot mark as fully complete: At least one product must be linked"

### Data Integrity

The system enforces:
- No duplicate protocol names
- Products must exist in backbar catalog
- Steps must have sequential numbering
- All timestamps are UTC

### Performance

For large protocols (20+ steps):
- Save periodically to avoid data loss
- Editor may take 1-2 seconds to save
- Saving success is confirmed with green banner

---

## SUMMARY

The Manual Protocol Completion workflow provides:
- ✅ Structured data entry for protocols
- ✅ Automatic validation and status tracking
- ✅ Product linkage from backbar catalog
- ✅ Phase 3 unlock enforcement
- ✅ Audit trail and change tracking
- ✅ Progress visualization
- ✅ Filter and search capabilities

This bridges the gap between Phase 2 basic ingestion and full protocol data availability until server-side PDF parsing is implemented.
