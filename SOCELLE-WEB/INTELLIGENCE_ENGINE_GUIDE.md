# Core Intelligence Engine
## Service Mapping & Gap Analysis Guide

---

## OVERVIEW

The Core Intelligence Engine is a deterministic, data-driven system that performs:

1. **Service Mapping** - Maps spa menu services to canonical protocols with explainable confidence scores
2. **Gap Analysis** - Identifies missing services and recommends completed protocols
3. **Seasonal Intelligence** - Incorporates marketing calendar for relevance boosting
4. **Spa Type Logic** - Applies different priorities for Med Spas vs Day Spas

**Critical Principle:** ALL recommendations are grounded in completed canonical data. NO AI inference. NO incomplete protocols. 100% traceable and explainable.

---

## ARCHITECTURE

### Data Sources (Read-Only)
- `canonical_protocols` (completion_status >= 'steps_complete')
- `canonical_protocol_steps`
- `canonical_protocol_step_products`
- `marketing_calendar` (seasonal relevance)
- `pro_products` (backbar catalog)

### Output Tables
- `spa_service_mapping` - Service-to-protocol mappings with confidence scores
- `service_gap_analysis` - Identified gaps with recommendations

### Core Engines
- `serviceMappingEngine.ts` - Performs deterministic matching
- `gapAnalysisEngine.ts` - Identifies missing services

---

## SERVICE MAPPING ENGINE

### How It Works

#### 1. Input Processing
When a spa uploads a menu, services are parsed in the format:
```
Service Name | Category | Duration | Price | Description
```

Example:
```
Anti-Aging Facial | Facial | 60 min | 120 | Advanced treatment for fine lines
Relaxation Massage | Massage | 90 min | 150 | Swedish-style full body massage
```

#### 2. Matching Algorithm

For each service, the engine:

**A) Loads Completed Protocols**
- Only protocols with `completion_status` = 'steps_complete' OR 'fully_complete'
- Incomplete protocols are NEVER recommended

**B) Calculates Similarity Scores**

1. **Name Similarity (50% weight)**
   - Exact match = 100%
   - Substring match = 85%
   - Word overlap (Jaccard similarity) = variable
   - Example: "Vitamin C Facial" vs "Vitamin C Radiance Facial" = 90%

2. **Duration Match (20% weight)**
   - Exact match = 100%
   - Within 5 min = 90%
   - Within 10 min = 75%
   - Within 15 min = 50%
   - Within 30 min = 25%
   - Example: 60 min service vs 60 min protocol = 100%

3. **Category Match (20% weight)**
   - Exact match = 100%
   - Alias match (e.g., "facial" = "face treatment") = 100%
   - Similar category = 80%
   - Example: "Facial" vs "FACIALS" = 100%

4. **Concern Match (10% weight)**
   - Extracts concerns from service description
   - Compares to protocol.target_concerns
   - Match ratio × 100
   - Example: Service mentions "acne" and protocol targets "acne, congestion" = 50%

**C) Weighted Total Score**
```
confidence_score = (name × 0.50) + (duration × 0.20) + (category × 0.20) + (concern × 0.10)
```

**D) Seasonal Boost**
- If protocol is featured in marketing calendar (current or next 2 months)
- AND confidence >= 70%
- THEN confidence += 5% (capped at 100%)

**E) Match Type Classification**
- **Exact** (90-100%): High confidence, recommended for immediate use
- **Partial** (70-89%): Good match, minor differences
- **Candidate** (40-69%): Possible match, requires review
- **No Match** (<40%): No suitable protocol found

#### 3. Missing Data Flags

The engine identifies issues:
- `protocol_not_fully_complete` - Steps done but metadata incomplete
- `duration_mismatch` - >50% duration difference
- `category_mismatch` - >50% category difference

#### 4. Mapping Notes

Human-readable explanation generated:
```
"Matched to 'Acne Clearing Facial'. Name similarity: 95%. Duration alignment: 100%.
Category match: 100%. Concern overlap: 75%. Flags: None."
```

### Example Mapping Results

**High Confidence Match:**
```
Service: "Deep Cleansing Facial"
Protocol: "Acne Clearing Facial"
Match Type: Exact
Confidence: 92%
Notes: Strong name similarity (88%), exact duration (60 min), perfect category match
```

**No Match:**
```
Service: "Hot Stone Massage Therapy"
Protocol: None
Match Type: No Match
Confidence: 0%
Notes: No completed canonical protocols available for matching
Flags: no_canonical_data
```

---

## GAP ANALYSIS ENGINE

### How It Works

#### 1. Service Category Analysis

Analyzes uploaded menu and counts services by category:
- Facials
- Body treatments
- Massage
- Enhancements (eye, lip, hand, foot)
- Oncology

Compares against industry thresholds:
- Facials: 3+ recommended
- Body: 2+ recommended
- Massage: 2+ recommended
- Enhancements: 2+ recommended
- Oncology: 1+ (if offering compassionate care)

#### 2. Spa Type Logic Branching

**Med Spa Priorities:**
```javascript
{
  facials: 'High',        // Results-driven core service
  enhancements: 'High',   // High-margin add-ons
  body: 'Medium',         // Clinical body treatments
  oncology: 'Medium',     // Specialized care
  massage: 'Low'          // Deprioritized (not clinical)
}

Treatment Focus:
- Results-driven
- Clinical
- Anti-aging
- Acne treatment
- Pigmentation
- Resurfacing
```

**Day Spa Priorities:**
```javascript
{
  facials: 'High',        // Core wellness service
  body: 'High',           // Essential spa experience
  massage: 'High',        // Key relaxation offering
  enhancements: 'Medium', // Nice-to-have
  oncology: 'Low'         // Specialized niche
}

Treatment Focus:
- Relaxation
- Wellness
- Ritual
- Aromatherapy
- Hydration
- Soothing
```

**Hybrid Spa Priorities:**
```javascript
{
  facials: 'High',
  body: 'High',
  enhancements: 'High',
  massage: 'Medium',
  oncology: 'Medium'
}

Treatment Focus:
- Results-driven
- Wellness
- Clinical
- Relaxation
- Anti-aging
```

#### 3. Gap Type Identification

**Category Gap**
- Too few services in a category for spa type
- Example: Med spa with only 1 facial (needs 3+)
- Recommends protocol that matches spa type focus

**Seasonal Gap**
- Missing protocol featured in marketing calendar
- Current month = High priority
- Next 2 months = Medium priority
- Includes theme and seasonal window

**Signature Missing**
- No "signature" or flagship service identified
- Critical for brand identity
- Recommends Signature or Pure Results protocols

**Enhancement Missing**
- Low add-on/enhancement count despite multiple facials
- High ROI opportunity (30-50% ticket increase)
- Recommends eye, lip, hand, or foot treatments

#### 4. Recommendation Selection

For each gap:
1. Find all completed protocols in gap category
2. Filter out already-mapped protocols
3. Match against spa type treatment focus
4. Select best match

Example:
```
Gap: Med Spa needs more facials
Available: 8 facial protocols
Focus: Results-driven, anti-aging, clinical
Best Match: "Advanced Wrinkle Remedy Facial"
Rationale: "Targets anti-aging concerns, results-oriented approach
           aligns with medical spa positioning"
```

#### 5. Revenue & Complexity Estimation

**High Priority Gaps:**
- Revenue Impact: $5,000-$15,000/month
- Reason: Core service category, frequent booking potential

**Medium Priority Gaps:**
- Revenue Impact: $2,000-$8,000/month
- Reason: Secondary service, moderate demand

**Seasonal Gaps:**
- Revenue Impact: $3,000-$10,000 for seasonal window
- Reason: Time-limited promotional opportunity

**Enhancements:**
- Revenue Impact: $4,000-$12,000/month (incremental)
- Reason: Add-on to existing services, pure margin

**Implementation Complexity:**
- Low: Protocol fully documented and ready
- Medium: Requires staff training and marketing
- High: Specialized equipment or certification needed

---

## ADMIN WORKFLOW

### 1. Upload Spa Menu

Navigate to **Spa Menus** tab:

1. Click "Upload Menu"
2. Enter spa name (e.g., "Manhattan Wellness Spa")
3. Enter location (optional, e.g., "New York, NY")
4. Select spa type:
   - **Day Spa** - Relaxation & wellness focus
   - **Med Spa** - Results-driven & clinical
   - **Hybrid** - Balanced approach
5. Paste menu data in pipe-delimited format:
   ```
   Service Name | Category | Duration | Price | Description
   ```
6. Click "Upload Menu"

**Menu Format Examples:**

```
Signature Facial | Facial | 60 min | 120 | Our most popular treatment
Deep Tissue Massage | Massage | 90 min | 150 | Therapeutic pressure point work
Body Polish | Body | 60 min | 130 | Exfoliating scrub with moisture mask
Eye Renewal | Enhancement | 15 min | 35 | Caffeine eye treatment add-on
```

### 2. Run Intelligence Analysis

Navigate to **Service Intelligence** tab:

1. Select spa menu from tabs at top
2. Click **"Run Analysis"** button
3. Engine processes:
   - Parses menu services
   - Maps each service to canonical protocols
   - Identifies gaps and generates recommendations
   - Calculates confidence scores
   - Applies seasonal relevance
4. Wait for "Analysis Complete" (usually 10-30 seconds)

### 3. Review Service Mappings

**Mappings Tab:**

View all service mappings with:
- Service name → Protocol name
- Match type badge (Exact/Partial/Candidate/No Match)
- Confidence score (0-100%)
- Detailed mapping notes
- Seasonal relevance indicator

**Filter by Match Type:**
- All
- Exact matches
- Partial matches
- No matches

**Review Actions:**

For each mapping:
- ✓ **Approve** - Accept the mapping as-is
- ✗ **Override** - Reject and provide notes

**Approved mappings:**
- Turn gray with ✓ indicator
- Locked from further auto-updates
- Can be manually changed if needed

**Overridden mappings:**
- Marked with ⚠️ warning
- Admin notes displayed
- Not used in downstream calculations

### 4. Review Gap Analysis

**Gaps Tab:**

View all identified gaps with:
- Priority level (High/Medium/Low)
- Gap type (category/seasonal/signature/enhancement)
- Gap description
- Recommended protocol
- Rationale (data-backed explanation)
- Revenue impact estimate
- Implementation complexity

**Gap Actions:**

For each gap:
- **Approve** - Accept recommendation, add to implementation plan
- **Review Later** - Flag for further consideration
- **Reject** - Dismiss with reason

**Status Tracking:**
- Identified (default)
- Approved (admin accepted)
- Under Review (flagged for later)
- Rejected (dismissed with notes)

### 5. Interpret Results

**Dashboard Metrics:**

- **Total Services** - Count of services in uploaded menu
- **Exact Matches** - High-confidence mappings (90%+)
- **High Priority Gaps** - Critical missing services
- **Avg Confidence** - Overall mapping quality

**Reading Confidence Scores:**
- 90-100%: Excellent match, use immediately
- 70-89%: Good match, minor verification recommended
- 40-69%: Possible match, requires careful review
- 0-39%: Poor match or no canonical equivalent

**Understanding Gaps:**

High Priority = Critical for spa type & revenue
Medium Priority = Important but not urgent
Low Priority = Nice-to-have, optional

Seasonal = Time-sensitive, current or upcoming calendar
Category = Core service menu balance
Signature = Brand identity and flagship service
Enhancement = Revenue optimization opportunity

---

## SEASONAL INTELLIGENCE

### How It Works

**Marketing Calendar Integration:**
- Checks current month + next 2 months
- Identifies featured protocols
- Boosts confidence for seasonal matches
- Flags gaps for missing seasonal services

**Seasonal Boost Example:**

```
Service: "Winter Reset Facial"
Protocol: "Winter Wellbeing Reset Facial"
Base Confidence: 88%

Marketing Calendar Check:
- January 2026: Featured protocol = "Winter Wellbeing Reset Facial"
- Theme: "New Year Renewal"

Result:
- Seasonal Boost: +5%
- Final Confidence: 93%
- Badge: 🗓️ Seasonal
- Rationale: "Featured in January marketing calendar (New Year Renewal)"
```

**Seasonal Gap Detection:**

If spa menu is missing featured protocols:
```
Gap Type: seasonal_gap
Priority: High (if current month) or Medium (if next 2 months)
Description: "Missing seasonal protocol: Winter Wellbeing Reset Facial"
Rationale: "Featured in January marketing calendar under theme:
           'New Year Renewal'. Aligning menu with seasonal promotions
           drives bookings and revenue."
Revenue Impact: $3,000-$10,000 for seasonal window
```

---

## DATA SAFETY & TRACEABILITY

### Grounding Rules

**NEVER Recommend:**
- Protocols with completion_status = 'incomplete'
- Custom blends without mixing_rules
- Products not in backbar catalog
- Invented or hypothetical services

**ALWAYS Include:**
- Rationale for every recommendation
- Confidence score breakdown
- Missing data flags
- Matching criteria explanation

### Audit Trail

Every mapping and gap record includes:
- Created timestamp
- Confidence score and match type
- Detailed mapping notes
- Admin review status
- Admin override flag
- Reviewed by (admin user)
- Reviewed at (timestamp)

### Override Safety

Admins can override mappings:
- Original mapping preserved
- Override flag set to true
- Admin notes required
- Timestamp logged
- Future auto-analysis respects overrides

---

## EXAMPLE WORKFLOWS

### Workflow 1: New Med Spa Menu Upload

**Scenario:** Manhattan Medical Spa uploads 8-service menu

**Step 1: Upload**
```
Spa Name: Manhattan Medical Spa
Type: Med Spa
Location: New York, NY

Services:
Anti-Aging Facial | Facial | 75 min | 180 | Advanced wrinkle treatment
Acne Treatment | Facial | 60 min | 150 | Clinical acne protocol
Chemical Peel | Facial | 45 min | 200 | Glycolic resurfacing
Hydration Boost | Facial | 60 min | 140 | Deep moisture infusion
Body Contouring | Body | 90 min | 250 | Firming body treatment
Eye Lift | Enhancement | 20 min | 50 | Caffeine eye treatment
Lip Plump | Enhancement | 15 min | 45 | Hydrating lip treatment
Relaxation Massage | Massage | 60 min | 120 | Swedish style
```

**Step 2: Analysis Results**

**Mappings:**
- Anti-Aging Facial → Advanced Wrinkle Remedy Facial (Exact, 94%)
- Acne Treatment → Acne Clearing Facial (Exact, 92%)
- Chemical Peel → Smoothing Glycolic Facial (Partial, 85%)
- Hydration Boost → Manuka Moisture Drench Facial (Partial, 78%)
- Body Contouring → No Match (0%, no completed body protocols)
- Eye Lift → Caffeine Gua Sha Eye Treatment (Exact, 96%)
- Lip Plump → No Match (0%, no lip protocols completed)
- Relaxation Massage → Nirvana Stress Relief Massage (Partial, 72%)

**Summary:**
- 5 mapped (3 exact, 2 partial)
- 2 no matches
- Average confidence: 65%

**Step 3: Gap Analysis**

**Gaps Identified:**

1. **Category Gap - Body Treatments**
   - Priority: Medium (Med Spa deprioritizes body)
   - Description: Only 1 body service, industry standard 2+
   - Recommended: Espresso Mud Detoxifying Body Treatment
   - Rationale: "Med spa positioning benefits from results-driven
                detox treatments. Clinical approach aligns with brand."
   - Revenue: $2,000-$8,000/month

2. **Enhancement Missing**
   - Priority: High
   - Description: Limited add-ons to increase ticket size
   - Recommended: Luminous Lip Enhancement
   - Rationale: "Enhancement services increase average ticket by 30-50%.
                Can be added to any facial with minimal time."
   - Revenue: $4,000-$12,000/month (incremental)

3. **Seasonal Gap - February**
   - Priority: High
   - Description: Missing "Vitamin C Radiance Facial"
   - Recommended: Vitamin C Radiance Facial
   - Rationale: "Featured in February marketing calendar under theme:
                'Glow Up'. Seasonal timing drives bookings."
   - Revenue: $3,000-$10,000 for February

**Step 4: Admin Review**

Admin actions:
- ✓ Approve all Exact matches
- ✓ Approve Partial matches after verification
- ✗ Override "Body Contouring" - notes: "This is a device-based service, not manual treatment"
- ✓ Approve all gaps
- Flag seasonal gap for February implementation

**Outcome:**
- 5 services mapped to protocols
- 3 new services recommended
- Implementation plan created

---

### Workflow 2: Day Spa Gap Analysis

**Scenario:** Wellness Retreat Day Spa with wellness focus

**Menu Overview:**
- 6 facials (relaxation-focused)
- 0 body treatments
- 0 massage
- 1 enhancement

**Gap Analysis Results:**

1. **Category Gap - Massage (HIGH)**
   - "0 massage services. Essential for complete wellness experience."
   - Recommended: Signature Herbal Massage
   - Priority: High (Day Spa core service)

2. **Category Gap - Body Treatments (HIGH)**
   - "0 body treatments. Industry standard 2+"
   - Recommended: Seaweed Body Wrap
   - Priority: High (Day Spa core service)

3. **Enhancement Missing (MEDIUM)**
   - "Only 1 enhancement. Missed revenue opportunity."
   - Recommended: Peppermint Foot Therapy
   - Priority: Medium

**Med Spa Logic NOT Applied:**
- Massage is HIGH priority (not LOW)
- Body treatments are HIGH priority (not MEDIUM)
- Focus on relaxation & wellness treatments

---

## TECHNICAL SPECIFICATIONS

### Matching Algorithm Weights

```typescript
const weights = {
  name: 0.50,      // 50% - Most important factor
  duration: 0.20,  // 20% - Significant but flexible
  category: 0.20,  // 20% - Important for classification
  concern: 0.10    // 10% - Nice to have, often sparse data
};
```

### Duration Tolerance Table

| Difference | Score | Description |
|------------|-------|-------------|
| 0 min | 100% | Exact match |
| ≤5 min | 90% | Very close |
| ≤10 min | 75% | Close enough |
| ≤15 min | 50% | Moderate difference |
| ≤30 min | 25% | Large difference |
| >30 min | 0% | Too different |

### Concern Keywords

The engine extracts these keywords from service descriptions:
```
acne, aging, anti-aging, wrinkle, fine lines,
hydration, dehydration, dryness, moisture,
sensitivity, sensitive, redness, rosacea,
brightening, pigmentation, dark spots, discoloration,
congestion, pores, oily, oil control,
detox, purifying, clarifying,
soothing, calming, relaxation,
firmness, lifting, tightening,
exfoliation, resurfacing, renewal
```

### Category Aliases

```javascript
{
  'facial': ['facials', 'face', 'facial treatment'],
  'body': ['body treatment', 'body therapy', 'wraps'],
  'massage': ['massage therapy', 'bodywork'],
  'enhancement': ['add-on', 'upgrade', 'enhancement']
}
```

---

## API REFERENCE

### Service Mapping Engine

```typescript
import { mapServiceToProtocol, analyzeSpaMenu } from './lib/serviceMappingEngine';

// Map single service
const mapping = await mapServiceToProtocol(
  {
    service_name: "Anti-Aging Facial",
    service_category: "Facial",
    service_duration: "60 min",
    service_price: 150,
    service_description: "Advanced wrinkle treatment"
  },
  'medspa' // spa type
);

// Analyze entire menu
const result = await analyzeSpaMenu(
  spaMenuId,
  services,
  'spa'
);
```

### Gap Analysis Engine

```typescript
import { performGapAnalysis, getGapAnalysisSummary } from './lib/gapAnalysisEngine';

// Perform gap analysis
const gaps = await performGapAnalysis(
  spaMenuId,
  'hybrid' // spa type
);

// Get summary
const summary = await getGapAnalysisSummary(spaMenuId);
```

---

## FUTURE ENHANCEMENTS

### Phase 1 (Current) ✅
- Deterministic service mapping
- Gap analysis with spa type logic
- Seasonal intelligence
- Admin review workflow

### Phase 2 (Planned)
- Machine learning confidence tuning
- Historical booking data integration
- Revenue prediction modeling
- A/B test recommendations

### Phase 3 (Future)
- Automatic protocol creation suggestions
- Custom blend recommendations
- Retail product attach suggestions
- Pricing optimization

---

## TROUBLESHOOTING

### Issue: Low Confidence Scores

**Symptom:** Most mappings are <70% confidence

**Causes:**
1. Menu uses non-standard service names
2. Duration information missing or inconsistent
3. Few completed canonical protocols available
4. Category mismatches

**Solutions:**
1. Complete more canonical protocols (increase match pool)
2. Standardize service naming in uploaded menus
3. Include duration and category in every service line
4. Use admin override for known matches

### Issue: No Matches Found

**Symptom:** All services show "No Match"

**Causes:**
1. No completed canonical protocols exist
2. Service category not in canon ical inventory
3. Very specialized/niche services

**Solutions:**
1. Complete Phase 2 protocol ingestion
2. Manually complete protocols for missing categories
3. Use gap analysis to identify what's missing
4. Create custom protocols for unique services

### Issue: Gaps Not Relevant

**Symptom:** Gap recommendations don't fit spa's brand

**Causes:**
1. Wrong spa type selected
2. Generic recommendations not accounting for positioning
3. Missing niche categories

**Solutions:**
1. Re-upload menu with correct spa type
2. Use admin reject with notes explaining mismatch
3. System learns from overrides over time
4. Complete protocols that match your niche

### Issue: Seasonal Gaps Out of Sync

**Symptom:** Seasonal recommendations don't align with spa's calendar

**Causes:**
1. Marketing calendar not updated
2. Spa has different seasonal focus
3. Regional climate differences

**Solutions:**
1. Update marketing calendar in Marketing Calendar view
2. Admin reject seasonal gaps not applicable
3. Create custom seasonal protocols
4. Adjust featured_protocols in marketing calendar

---

## BEST PRACTICES

### Menu Upload
1. Use consistent formatting
2. Include all 5 fields (name, category, duration, price, description)
3. Select correct spa type upfront
4. Add location for regional context

### Analysis Review
1. Review all Exact matches first (usually safe to approve)
2. Verify Partial matches against protocol details
3. Investigate No Matches - often gaps or unique services
4. Review gaps in priority order (High → Medium → Low)

### Override Management
1. Always provide detailed notes
2. Document why automatic match failed
3. Suggest what canonical protocol should exist
4. Use overrides sparingly - they indicate system gaps

### Continuous Improvement
1. Complete more protocols = better matching
2. Update marketing calendar quarterly
3. Review seasonal gaps 2 months ahead
4. Track which gaps lead to implemented services

---

## SUMMARY

The Core Intelligence Engine provides:

✅ **Deterministic Matching** - Explainable confidence scores, no black box
✅ **Grounded Recommendations** - Only completed canonical protocols
✅ **Spa Type Logic** - Med Spa vs Day Spa prioritization
✅ **Seasonal Intelligence** - Marketing calendar integration
✅ **Admin Control** - Review, approve, override, annotate
✅ **Full Traceability** - Audit trail for every decision
✅ **Revenue Context** - Impact estimates for every gap

This engine forms the foundation for:
- Retail product attach recommendations (Phase 2)
- Pricing & margin optimization (Phase 3)
- Custom protocol builder (Phase 4)
- Implementation plan PDF generation (Phase 5)

All powered by canonical data, zero hallucination, 100% traceable.
