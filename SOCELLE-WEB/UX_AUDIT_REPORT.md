# Spa Portal UX Audit Report - "Why Nothing Happens"

**Date:** 2026-01-21
**Auditor:** System Analysis
**Severity:** CRITICAL - Core user journey is non-functional

---

## Executive Summary

**The Spa Portal is currently non-functional for end users.** While the authentication, navigation, and data infrastructure exist, the core value proposition—creating and viewing implementation plans—is completely missing. Users can sign up and log in, but cannot actually do anything productive with the system.

**Impact:** 100% of promised functionality is unavailable. The app appears to be a polished shell with no working internals.

---

## User Journey Analysis

### Step-by-Step Simulation Results

#### ✅ Step 1: Visit `/` (not logged in)
**Expected:** See landing page with value proposition
**Actual:** ✅ WORKS - Beautiful home page loads with CTAs
**Status:** FUNCTIONAL

#### ✅ Step 2: Click "Create Your Plan"
**Expected:** Navigate to signup or onboarding
**Actual:** ✅ WORKS - Links to `/signup`
**Status:** FUNCTIONAL

#### ✅ Step 3: Create account
**Expected:** Fill form, create account, redirect to dashboard
**Actual:** ✅ WORKS - Signup flow creates user_profiles record, sets role='spa_user', redirects to `/dashboard`
**Status:** FUNCTIONAL

#### ❌ Step 4: Enter Spa Profile
**Expected:** Form to collect spa details (name, type, location, goals)
**Actual:** ❌ FAILS - Profile is collected during signup, but there's no onboarding wizard
**Status:** PARTIALLY FUNCTIONAL (captured in signup only)

#### ❌ Step 5: Upload menu
**Expected:** PDF upload or text paste interface
**Actual:** ❌ FAILS - Dashboard shows "New Plan" button → routes to `/plan/new` → **PLACEHOLDER PAGE: "Plan creation wizard coming soon"**
**Root Cause:** `App.tsx` lines 66-73 render a hardcoded placeholder div
**Status:** NON-FUNCTIONAL

#### ❌ Step 6: Click "Generate Plan"
**Expected:** System analyzes menu, maps protocols, identifies gaps, generates recommendations
**Actual:** ❌ FAILS - No "Generate" button exists because plan creation doesn't exist
**Root Cause:** No plan creation wizard component exists
**Status:** NON-FUNCTIONAL

#### ❌ Step 7: View results
**Expected:** See analysis dashboard with gaps, mappings, recommendations, opening order
**Actual:** ❌ FAILS - Clicking a plan from dashboard → routes to `/plans/:id` → **PLACEHOLDER PAGE: "Plan details view coming soon"**
**Root Cause:** `App.tsx` lines 54-63 render a hardcoded placeholder div
**Status:** NON-FUNCTIONAL

#### ❌ Step 8: Save plan
**Expected:** Save draft or finalize plan
**Actual:** ❌ FAILS - No save functionality exists (no plan creation = nothing to save)
**Status:** NON-FUNCTIONAL

#### ❌ Step 9: Download plan PDF
**Expected:** Export plan as professional PDF
**Actual:** ❌ FAILS - No PDF export functionality exists
**Status:** NON-FUNCTIONAL

#### ⚠️ Step 10: Log out, log back in, confirm persistence
**Expected:** See previously created plans
**Actual:** ⚠️ PARTIALLY WORKS - Auth persists, dashboard queries `plan_submissions` table, but table is empty because users can't create plans
**Status:** INFRASTRUCTURE WORKS, BUT NO DATA

---

## Top 10 Root Causes (Evidence-Based)

### 1. **Plan Creation Route is a Placeholder** [CRITICAL]
**File:** `src/App.tsx` lines 65-74
**Code:**
```tsx
<Route
  path="/plan/new"
  element={
    <ProtectedRoute>
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Create New Plan</h2>
        <p className="text-slate-600">Plan creation wizard coming soon</p>
      </div>
    </ProtectedRoute>
  }
/>
```
**Impact:** Users cannot create plans. This is the PRIMARY action of the entire app.
**Expected:** Multi-step wizard component that collects spa info, uploads menu, triggers analysis.

---

### 2. **Plan Detail Route is a Placeholder** [CRITICAL]
**File:** `src/App.tsx` lines 54-63
**Code:**
```tsx
<Route
  path="/plans/:id"
  element={
    <ProtectedRoute>
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Plan Details</h2>
        <p className="text-slate-600">Plan details view coming soon</p>
      </div>
    </ProtectedRoute>
  }
/>
```
**Impact:** Users cannot view plan results even if plans existed.
**Expected:** Results dashboard showing mappings, gaps, recommendations, opening order.

---

### 3. **No Plan Orchestrator** [CRITICAL]
**Missing Component:** No orchestrator function that:
1. Accepts menu input (text or PDF)
2. Parses menu into services
3. Calls mapping engine
4. Calls gap analysis engine
5. Calls retail attach engine
6. Calls opening order engine
7. Saves results to `plan_outputs` table
8. Links to `plan_submissions.plan_output_id`

**Evidence:** Engines exist in `src/lib/` but are never called:
- `mappingEngine.ts` - exists but unused
- `gapAnalysisEngine.ts` - exists but unused
- `retailAttachEngine.ts` - exists but unused
- `openingOrderEngine.ts` - exists but unused
- `planOutputGenerator.ts` - exists but needs integration

**Impact:** Even if we had a form, there's no backend logic to process submissions.

---

### 4. **Dashboard Shows Empty State Correctly, But for Wrong Reason** [MISLEADING]
**File:** `src/pages/spa/Dashboard.tsx` lines 154-168
**Behavior:** Shows "No plans yet" message with "Create First Plan" button
**Problem:** This empty state is correct UI, but it's permanent because plan creation doesn't work
**User Experience:** Users click "Create First Plan" → see "coming soon" → confused/frustrated
**Impact:** Creates false expectation that functionality exists

---

### 5. **Menu Upload Infrastructure Missing** [CRITICAL]
**Missing:**
- File upload component
- PDF parsing integration
- Text input alternative
- Menu storage in database

**Evidence:**
- `plan_submissions.menu_file_url` column exists but nothing writes to it
- `pdfExtractionService.ts` exists but is never called from spa portal
- No file input UI component anywhere in spa pages

**Impact:** Even if wizard existed, users couldn't provide menu data.

---

### 6. **Analysis Engines Not Wired to User Flow** [CRITICAL]
**Files that exist but are never called:**
```
src/lib/mappingEngine.ts
src/lib/gapAnalysisEngine.ts
src/lib/retailAttachEngine.ts
src/lib/openingOrderEngine.ts
src/lib/serviceMappingEngine.ts
src/lib/brandDifferentiationEngine.ts
```

**Where they should be called:** In a plan orchestrator during "Generate Plan" step
**Where they are actually called:** Nowhere in the spa portal (only used in admin ingestion)
**Impact:** All the intelligence exists but is inaccessible to end users

---

### 7. **No Status Progression Logic** [HIGH]
**Database Field:** `plan_submissions.submission_status` (draft, submitted, under_review, approved, completed)
**Current Behavior:** Record created with status='draft', never changes
**Missing Logic:**
- Transition draft → submitted when user clicks "Generate"
- Transition submitted → under_review when analysis starts
- Transition under_review → completed when analysis finishes

**Impact:** Status badges in dashboard are cosmetic, don't reflect actual progress

---

### 8. **Plan Outputs Table Not Linked** [HIGH]
**Tables:**
- `plan_submissions` - user-created plans (has data)
- `plan_outputs` - analysis results (empty)

**Link:** `plan_submissions.plan_output_id` (FK to plan_outputs)

**Problem:** No code creates records in `plan_outputs` or links them to submissions
**Impact:** Even if we generated results in memory, they wouldn't persist or be retrievable

---

### 9. **RLS May Block Writes (Uncertain)** [MEDIUM - NEEDS VERIFICATION]
**Potential Issue:** When we create plan_outputs, RLS policies may not allow writes
**Evidence:** We have RLS on plan_submissions for users to write their own records
**Uncertainty:** We haven't verified RLS on plan_outputs, service_gaps, protocol_mappings, etc.
**Impact:** Orchestrator may fail silently when trying to write results

**Action Needed:** Test write access to analysis result tables

---

### 10. **No Error Handling or User Feedback** [HIGH]
**Missing:**
- Loading states during analysis (could take 10-30 seconds)
- Error messages if analysis fails
- Progress indicators
- Success confirmation

**Impact:** Users will have no idea if system is working, broken, or stuck

---

## Minimal "Make It Work" Fix Plan

### Priority 0: Core Flow (Must Have)

**Goal:** User can create a plan, generate analysis, and view results

#### P0.1: Create Plan Wizard Component
**File:** `src/pages/spa/PlanWizard.tsx` (NEW)
**Requirements:**
- Step 1: Spa profile (if not already in user_profiles)
- Step 2: Menu input (textarea for MVP, file upload optional)
- Step 3: Trigger analysis
- Creates `plan_submissions` record with user_id
- Transitions to results view on completion

**Code Changes:**
```tsx
// Create multi-step form with:
// - Spa name, type, location
// - Menu text input
// - Submit button
// - Creates submission record
// - Calls orchestrator
// - Redirects to /plans/{id}
```

#### P0.2: Create Plan Orchestrator
**File:** `src/lib/planOrchestrator.ts` (NEW)
**Requirements:**
- Accepts submissionId and menuText
- Parses menu text into services array
- Calls mappingEngine
- Calls gapAnalysisEngine
- Calls retailAttachEngine
- Calls openingOrderEngine
- Creates plan_output record
- Links via plan_submissions.plan_output_id
- Updates submission_status to 'completed'

**Code Changes:**
```typescript
export async function orchestratePlanGeneration(
  submissionId: string,
  menuText: string
) {
  // 1. Parse menu
  // 2. Run engines
  // 3. Save outputs
  // 4. Link to submission
  // 5. Update status
}
```

#### P0.3: Create Plan Detail View
**File:** `src/pages/spa/PlanDetail.tsx` (NEW)
**Requirements:**
- Fetches submission by ID
- Fetches linked plan_output
- Displays tabs: Overview, Service Gaps, Mappings, Retail Recommendations, Opening Order
- Shows status and timestamps
- Download PDF button (can be placeholder initially)

**Code Changes:**
```tsx
// Fetch submission + plan_output
// Render tabs with results
// Show loading/error states
```

#### P0.4: Wire Routes
**File:** `src/App.tsx`
**Changes:**
```tsx
// Replace line 66-73:
<Route path="/plan/new" element={
  <ProtectedRoute><PlanWizard /></ProtectedRoute>
} />

// Replace line 54-63:
<Route path="/plans/:id" element={
  <ProtectedRoute><PlanDetail /></ProtectedRoute>
} />
```

---

### Priority 1: Essential UX (Should Have)

#### P1.1: Loading States
- Show spinner during analysis
- Disable buttons during submission
- Progress indicator (Step 1 of 3)

#### P1.2: Error Handling
- Catch orchestrator failures
- Show user-friendly error messages
- Allow retry

#### P1.3: Status Transitions
- Update submission_status at each stage
- Show status in real-time on detail page

---

### Priority 2: Polish (Nice to Have)

#### P2.1: PDF Upload
- Add file input to wizard
- Integrate pdfExtractionService
- Parse PDF to text before analysis

#### P2.2: PDF Export
- Generate professional PDF from plan_output
- Include branding, charts, tables

#### P2.3: Edit Draft Plans
- Allow users to modify menu text
- Re-run analysis
- Version history

---

## Exact Files That Need Changes

### New Files (Must Create)
1. `src/pages/spa/PlanWizard.tsx` - Multi-step plan creation form
2. `src/pages/spa/PlanDetail.tsx` - Results dashboard
3. `src/lib/planOrchestrator.ts` - Analysis pipeline coordinator

### Modified Files
1. `src/App.tsx` - Replace placeholder routes with real components

### No Changes Needed
- `src/pages/spa/Home.tsx` - Already functional
- `src/pages/spa/Dashboard.tsx` - Already functional, will show data once plans are created
- `src/pages/spa/Login.tsx` - Already functional
- `src/pages/spa/Signup.tsx` - Already functional
- `src/lib/auth.tsx` - Already functional
- Database schema - Already correct

---

## Verification Steps (5 Minutes)

After implementing fixes, verify:

```bash
# 1. Start app
npm run dev

# 2. Open browser to http://localhost:5173

# 3. Sign up as new user
- Click "Get Started"
- Fill form: "Test Spa", "test@example.com", "password123"
- Verify redirect to /dashboard

# 4. Create first plan
- Click "Create First Plan"
- Fill spa details
- Paste menu:
  """
  Signature Facial - 60 min - $150
  Swedish Massage - 60 min - $120
  Hot Stone Massage - 90 min - $180
  """
- Click "Generate Plan"
- Wait for analysis (should take 5-10 seconds)
- Verify redirect to plan detail page

# 5. Verify results
- See "Service Gaps" tab with recommendations
- See "Protocol Mappings" tab with matched services
- See "Opening Order" tab with products
- Status shows "completed"

# 6. Return to dashboard
- Click "Dashboard" in nav
- Verify plan appears in list
- Click plan to re-open
- Verify results persist

# 7. Create second plan
- Click "New Plan"
- Repeat process
- Verify both plans show in dashboard
```

---

## Current vs. Target State

### Current State (Broken)
```
User Flow:
1. Sign up ✅
2. Click "New Plan" ✅
3. See "Coming soon" ❌
4. Exit frustrated ❌
```

### Target State (Working)
```
User Flow:
1. Sign up ✅
2. Click "New Plan" ✅
3. Fill wizard form ✅
4. Paste menu ✅
5. Click "Generate" ✅
6. Wait 10 seconds ✅
7. View results ✅
8. Return to dashboard ✅
9. Click plan to re-open ✅
10. Results still there ✅
```

---

## Implementation Estimate

**P0 (Core Flow):** 3 components, ~800 lines of code
**Timeline:** Can be completed in this session
**Risk:** Low - infrastructure exists, just needs wiring

**P1 (Essential UX):** Error handling + loading states
**Timeline:** Follow-on session
**Risk:** Low - standard patterns

**P2 (Polish):** PDF features
**Timeline:** Future sprint
**Risk:** Medium - requires PDF libraries

---

## Conclusion

**The app is a beautiful, well-architected shell with no working core.** All the hard parts exist (auth, database, analysis engines), but the user-facing workflow is completely missing. The fixes are straightforward—create 3 new components and wire them together—but without them, the app delivers zero value to spa users.

**Recommended Action:** Implement P0 immediately. This is not a "nice to have" or "future feature." This IS the product.
