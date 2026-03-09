# CORE USER JOURNEYS
### The PRO Edit — Brand Discovery, Evaluation, and Activation Platform
**Version:** 1.0  
**Date:** 2026-02-22  
**Status:** Authoritative Design Reference  
**Audience:** Product, Engineering, Design, QA

---

## Overview

This document defines every core user journey across the three principal actor types on The PRO Edit platform: **Business users** (spa/salon/medspa operators), **Brand users** (product brand account managers), and **Admin users** (internal platform operators). Each journey is described at step resolution, with entry points, decision gates, success criteria, failure modes, recovery paths, and — where applicable — paywall and revenue moments clearly marked.

### Journey Design Principles

1. **Progressive disclosure.** Users see only what they need for their current goal. Complexity is revealed in layers as the user advances, not front-loaded.

2. **Async-first with visible progress.** AI processing is never synchronous from the user's perspective. Every async operation surfaces a real-time status component with phase labels, estimated duration, and an error recovery path. The platform must not navigate away from or destroy state during async operations.

3. **Fail loudly at data boundaries, fail gracefully at UX boundaries.** Data isolation between tenants and brands is enforced at the database row-level security (RLS) layer and is never soft. UX errors — a failed upload, a timeout, a partial result — have defined recovery paths and never leave the user stranded.

4. **Money moments are explicit.** Every gate that requires a paid plan or triggers a transaction is marked in the UI with clear value framing before the gate, not after.

5. **Correction beats perfection.** AI-generated mappings, gap analyses, and revenue simulations are editable. The system surfaces confidence scores and invites human override. Overrides are logged and fed back into model quality monitoring.

6. **The adoption loop closes the value chain.** Generating a kit or placing an order is not the end of a journey. The platform tracks whether the business actually implemented the recommendation and resurfaces results in the monthly insights cadence.

### Actor Definitions

| Actor | Primary Goal | Key Screens Referenced |
|---|---|---|
| Business User | Discover brands, evaluate fit, activate through products and kits | B-01 through B-25 |
| Brand User | Manage catalog, measure performance, run visibility campaigns | BR-01 through BR-15 |
| Admin User | Manage tenants, validate catalog, reconcile billing | AD-01 through AD-12 |

### Known Engineering Issues That Affect Journey Integrity

The following bugs identified in the code audit directly compromise journey reliability and are flagged inline throughout this document:

| Issue | Affected Journey | Severity |
|---|---|---|
| Race condition: PlanWizard navigates before save completes | Business Journey B, Business Journey C | Critical |
| No polling for async analysis completion | Business Journey B, Business Journey C | Critical |
| `Promise.all()` unguarded — one failure silently drops all results | Business Journey C, Business Journey E | High |
| No real-time status updates on long-running operations | Business Journey B, Business Journey C, Business Journey E | High |

---

## Business Journey A: Discover Brand → Evaluate Fit

### Purpose
A business user with no prior relationship with a specific brand enters the platform to discover which brands align with their service offerings, price positioning, and client demographics. This journey ends when the user either saves a brand to their evaluation list or dismisses it.

### Entry Points

| Entry Point | Context | Landing Screen |
|---|---|---|
| Direct signup via marketing site | New user, no menu uploaded yet | B-01 Welcome / Onboarding |
| Referral link from a brand | New user with brand context pre-set | B-02 Brand Detail (pre-filtered) |
| Returning user from dashboard | Existing user exploring new brands | B-08 Brand Discovery Feed |
| Email campaign with curated list | Returning or new user | B-09 Curated Brand Collection |

### Step-by-Step Flow

```
[B-01 Welcome / Onboarding]
        |
        v
[B-03 Business Profile Setup]  <-- collects: spa type, location, price tier, client avg spend
        |
        v
[B-04 Service Category Selection]  <-- multi-select: facials, body, lashes, injectables, etc.
        |
        v
[B-08 Brand Discovery Feed]
        |
        +--[Filter Panel: category, price tier, protocol complexity, min order, certifications]
        |
        v
[B-10 Brand Card]  <-- shows: brand name, hero image, positioning tagline, fit score (if menu uploaded)
        |
        +-- [Save to Evaluation List]  --> [B-11 Evaluation List]
        |
        +-- [View Brand Detail] -->
                |
                v
        [B-02 Brand Detail]
                |
                +-- Overview tab: brand story, price positioning, target client profile
                |
                +-- Protocols tab: list of protocols with complexity ratings
                |
                +-- Fit Analysis tab: ⭐ PAYWALL GATE (Free: teaser card; Pro: full fit report)
                |
                +-- Reviews tab: anonymized business operator reviews
                |
                +-- [Add to Evaluation List]  --> [B-11 Evaluation List]
                |
                +-- [Begin Evaluation] --> [Business Journey C]
```

### Decision Gates

| Gate | Condition | Pass | Fail |
|---|---|---|---|
| Profile completeness | Spa type + at least one service category selected | Proceed to discovery feed | Prompt to complete profile; discovery available but fit scores hidden |
| Menu uploaded | Service menu present in account | Show personalized fit scores | Show generic brand scores with "Upload menu to see your fit" CTA |
| Plan gate on Fit Analysis tab | Active Pro or higher subscription | Show full fit report | Show paywall modal with plan comparison |

### Success Criteria

- User views at least one Brand Detail screen.
- User adds at least one brand to Evaluation List OR begins a full evaluation.
- Fit scores are visible for all feed cards when a menu is present (no broken/empty score states).

### Failure Modes and Recovery Paths

| Failure | User Impact | Recovery |
|---|---|---|
| Brand catalog API timeout | Feed shows spinner indefinitely | After 8 seconds: show cached results with staleness badge; show retry button |
| Fit score computation fails (no menu) | Score chip shows "--" | Tooltip explains: "Upload your menu to see your personalized fit score" with CTA |
| Brand detail images fail to load | Broken image placeholder | Show brand initials avatar; log to error monitoring |
| Filter combination returns zero results | Empty state | Show "No brands match all filters" with suggested filter relaxation |

### Money Moments

| Moment | Screen | Trigger |
|---|---|---|
| ⭐ Fit Analysis tab paywall | B-02 Brand Detail | User clicks "Fit Analysis" tab on free plan |
| ⭐ Evaluation comparison paywall | B-11 Evaluation List | User attempts to compare more than 2 brands side-by-side on free plan |

---

## Business Journey B: Upload Menu → Normalize → Categorize

### Purpose
A business user uploads their current service menu so the platform can extract service names, descriptions, durations, and prices; normalize them against the platform's service taxonomy; and categorize them into treatment families. This normalized menu is the foundation for all subsequent AI mapping, gap analysis, and revenue simulation.

### Entry Points

| Entry Point | Context | Landing Screen |
|---|---|---|
| Onboarding prompt | First-time user completing profile | B-05 Menu Upload |
| Dashboard empty state | Returning user who skipped upload | B-05 Menu Upload (via banner CTA) |
| Settings > Menu Management | User updating an existing menu | B-06 Menu Manager |
| PlanWizard step 2 | User mid-flow in evaluation | B-05 Menu Upload (inline modal) |

### File Format Handling

The upload component accepts three input modes:

**Mode 1: File Upload (PDF or DOCX)**
- Maximum file size: 25 MB
- PDF: extracted via server-side PDF parser; layout-based table detection preferred over raw text extraction
- DOCX: extracted via OOXML parser; preserves table structure
- Multi-page documents: all pages processed; user can deselect pages post-extraction

**Mode 2: Paste Plain Text**
- Free-text area accepts raw paste
- Parser attempts to detect column structure (service | duration | price)
- User reviews parsed table before confirming

**Mode 3: Manual Entry**
- Line-by-line form entry
- Available as fallback and as supplemental add/edit post-upload

### Step-by-Step Flow

```
[B-05 Menu Upload Screen]
        |
        +-- [Choose input mode: Upload File | Paste Text | Enter Manually]
        |
        v
[File selected / text pasted / entries complete]
        |
        v
[Client-side validation]
        |-- File type check (PDF/DOCX only)
        |-- File size check (< 25 MB)
        |-- Empty content check
        |
        v (validation passes)
        |
[Upload to Supabase Storage]  <-- signed URL upload; progress bar shown
        |
        v
[POST /api/menu/ingest edge function triggered]
        |
        v
⚠️  ASYNC PROCESSING BEGINS — SEE CRITICAL BUG NOTE BELOW
        |
[B-05a Processing Status Screen]
        |
        +-- Phase display: "Uploading..." → "Extracting content..." → "Normalizing services..."
        |                   → "Categorizing treatments..." → "Review ready"
        |
        +-- Estimated time indicator (dynamic based on file size)
        |
        +-- Cancel button (marks job as cancelled in DB; does not block re-upload)
        |
        v (job status = 'complete')
        |
[B-06 Menu Review Screen]
        |
        +-- Extracted services shown in editable table:
        |     [Service Name] | [Duration (min)] | [Price ($)] | [Category (AI-assigned)] | [Confidence]
        |
        +-- Confidence color coding:
        |     Green (>85%): AI is confident; user may accept as-is
        |     Yellow (60-85%): AI uncertain; user review recommended
        |     Red (<60%): AI could not reliably parse; manual entry required
        |
        +-- Bulk actions: Accept All Green, Flag All Red for Review
        |
        +-- Per-row actions: Edit, Accept, Flag, Delete
        |
        +-- [Confirm Menu] button -->
                |
                v
        [Menu saved to DB]
                |
                v
        [Redirect to B-07 Menu Summary or next PlanWizard step]
```

### CRITICAL BUG: Race Condition in PlanWizard + No Async Polling

> **Bug Reference:** PlanWizard navigate-before-save race condition; no polling for async analysis completion.

**Current broken behavior:**
When a user uploads a menu from within the PlanWizard flow, the wizard advances to the next step (e.g., "Map Brands") before the `/api/menu/ingest` edge function has completed processing. This means:

1. The next step renders with no normalized menu data.
2. The AI mapping step (`/api/brand/map`) is called with an empty or stale menu payload.
3. The user sees either a blank mapping result or a confusing error with no explanation.
4. If the user navigates back and forward, the partially-written DB row may conflict with a new ingest job.

**There is also no polling mechanism.** The client fires the ingest request and immediately attempts to read the result. There is no `GET /api/menu/ingest/status?jobId=...` call, no websocket subscription, and no Supabase Realtime listener on the job row. The UI shows a static spinner with no connection to actual job state.

**Required fix (engineering specification):**

```
1. On upload submit:
   - POST /api/menu/ingest
   - Response: { jobId: string }
   - Store jobId in component state AND in sessionStorage (survives re-render)

2. Begin polling:
   - GET /api/menu/ingest/status?jobId={jobId} every 2000ms
   - OR subscribe to Supabase Realtime channel: menu_ingest_jobs WHERE id = jobId
   - Job row has columns: status ('queued' | 'processing' | 'complete' | 'failed'), phase (string), progress_pct (int)

3. Update Processing Status Screen based on polled/realtime data:
   - Map phase strings to user-readable labels
   - Animate progress bar to progress_pct value

4. On status = 'complete':
   - Stop polling / unsubscribe
   - Fetch normalized menu rows
   - Navigate to B-06 Menu Review Screen
   - PlanWizard MUST NOT advance until this navigation occurs

5. On status = 'failed':
   - Stop polling
   - Display error message from job row error_message column
   - Offer retry (new jobId) or manual entry fallback

6. PlanWizard step guard:
   - Next button is DISABLED until menuIngestStatus === 'complete' in global state
   - This guard must survive component unmount/remount (use Zustand or context, not local state)
```

### Success Criteria

- File upload completes within 30 seconds for files up to 10 MB.
- All extracted services appear in the review table with confidence scores.
- User can edit any field inline before confirming.
- Confirmed menu persists to DB and is immediately available to downstream AI mapping.
- No navigation to next PlanWizard step occurs until job status is `complete`.

### Empty State Handling

| Condition | UI Response |
|---|---|
| User has no menu at all | Prominent upload CTA on dashboard; discovery available but fit scores hidden |
| Extraction returns zero services | Error state: "We couldn't extract services from this file. Try pasting your menu as text." |
| All services have red confidence | Warning banner: "Your menu needs review. Please check and correct each highlighted item." |
| User cancels mid-upload | Upload state cleared; return to upload screen with "Upload cancelled" toast |

### Error Recovery

| Error | Trigger | Recovery |
|---|---|---|
| File type rejected | Non-PDF/DOCX uploaded | Inline error: "Please upload a PDF or Word document (.docx)" |
| File too large | >25 MB | Inline error with suggestion to compress or paste text instead |
| Extraction timeout (>120s) | Edge function timeout | Offer manual entry; log job as failed with timeout reason |
| Partial extraction | Parser extracts some but not all pages | Show partial results with banner: "We extracted X of Y pages. Missing content? Add services manually." |
| Network error during upload | Connection dropped | Retry button; upload resumes from zero (no chunked resumable upload in v1) |

---

## Business Journey C: Run AI Mapping → See Gaps and Opportunities

### Purpose
After the business user's menu is normalized, the platform runs AI-driven brand protocol mapping: each service in the user's menu is matched against brand protocols in the catalog. The output is a gap analysis showing which brand protocols the business does not currently offer, ranked by revenue opportunity. The user reviews results, applies corrections, and — at a paywall gate — unlocks the full gap report.

### Entry Points

| Entry Point | Context | Landing Screen |
|---|---|---|
| Post-menu-confirm redirect | Menu just confirmed for first time | B-12 Mapping Launch Screen |
| PlanWizard step 3 | User in evaluation flow | B-12 Mapping Launch Screen (inline) |
| Dashboard "Refresh Analysis" CTA | Returning user with updated menu | B-12 Mapping Launch Screen |
| Brand Detail "See My Fit" button | User initiated from brand page | B-12 filtered to single brand |

### Step-by-Step Flow

```
[B-12 Mapping Launch Screen]
        |
        +-- Shows: selected brands (from Evaluation List), menu service count, estimated time
        |
        +-- [Run Analysis] button
        |
        v
[POST /api/brand/map edge function]
        |
        v
⚠️  ASYNC PROCESSING — SAME POLLING REQUIREMENT AS JOURNEY B
        |
[B-12a Analysis Progress Screen]
        |
        +-- Phase labels:
        |     "Comparing your services to brand protocols..."
        |     "Scoring compatibility..."
        |     "Identifying gaps..."
        |     "Calculating revenue opportunities..."
        |     "Building your report..."
        |
        +-- Per-brand progress tiles (each brand shows its own status)
        |
⚠️  CRITICAL BUG: Promise.all() UNGUARDED FAILURE
        |
        +-- Current code uses Promise.all([mapBrand1, mapBrand2, mapBrand3, ...])
        |   If any single brand mapping call fails (timeout, API error, rate limit),
        |   Promise.all() rejects entirely and the user sees zero results — even
        |   for brands that completed successfully.
        |
        |   REQUIRED FIX:
        |   Replace with Promise.allSettled([...]) and process each result independently.
        |   Brands with status 'fulfilled' render results normally.
        |   Brands with status 'rejected' show a per-brand error tile with a retry button.
        |   The user can continue reviewing successful results while retrying failed ones.
        |
        v (all brands complete or partially complete)
        |
[B-13 Mapping Results Screen]
        |
        +-- Layout: Brand tabs across top; services list in left panel; protocol match in right panel
        |
        +-- Per-service row:
        |     [User's Service Name] → [Matched Protocol] | [Match Type] | [Confidence %] | [Actions]
        |
        +-- Match Types:
        |     Exact: service maps directly to a brand protocol
        |     Close: service is adjacent; brand protocol could substitute or enhance
        |     None: no match found; this is a gap
        |
        +-- Confidence score display:
        |     Shown as percentage + color badge
        |     Tooltip on hover: "Confidence is based on service name, duration, and ingredient keywords"
        |
        v
[B-14 Override / Correction Flow]
        |
        +-- User clicks any match row → inline edit panel slides in
        |
        +-- Override options:
        |     a. Confirm match as-is
        |     b. Change matched protocol (searchable dropdown of brand protocols)
        |     c. Mark as "Not applicable — I don't offer this"
        |     d. Flag for admin review
        |
        +-- On save: override written to user_mapping_overrides table with:
        |     user_id, service_id, original_match_id, override_match_id, override_type, timestamp
        |
        +-- Overrides feed async retraining pipeline (model quality monitoring)
        |
        v
[B-15 Gap Analysis Screen]  ⭐ PAYWALL GATE
        |
        +-- FREE TIER: shows top 3 gaps only; rest blurred with upgrade prompt
        |
        +-- PRO TIER: shows full gap list
        |
        +-- ENTERPRISE TIER: shows gap list + market benchmarks + competitor intensity signal
        |
        +-- Per-gap row:
        |     [Gap Protocol Name] | [Category] | [Est. Monthly Revenue Opportunity] | [Complexity] | [Add to Plan]
        |
        +-- Sort/filter: by revenue opportunity (default), by complexity, by category
        |
        +-- Opportunity calculation inputs (visible on hover):
        |     Based on: your avg treatment room utilization, local market avg ticket, typical attach rate
        |     These inputs are editable in Revenue Simulator (Journey D)
        |
        +-- [Build Revenue Model] CTA --> [Business Journey D]
        +-- [Generate Activation Kit] CTA --> [Business Journey E]
        +-- [Order Products] CTA --> [Business Journey F]
```

### How Confidence Scores Surface to the User

Confidence scores are displayed at three levels of granularity:

1. **Service-level confidence** (B-13 Mapping Results): each matched row shows the confidence percentage for that specific service-to-protocol match.
2. **Overall mapping confidence** (B-13 header): aggregate score across all services, shown as a gauge. Below 70% triggers a banner: "Some matches need your review — check highlighted rows before proceeding."
3. **Gap-level confidence** (B-15): the gap analysis notes whether the gap identification itself is high-confidence (both the service absence and the opportunity estimate).

Confidence scores are never hidden or suppressed. The rationale is that surfacing uncertainty builds trust and invites correction, which improves data quality over time.

### Paywall Gate Detail

| Plan | Gap List Access | Revenue Estimate Visibility | Override Capability |
|---|---|---|---|
| Free | Top 3 gaps only | Teaser label only | Yes (first 3 rows) |
| Pro | Full gap list | Full estimates | Yes (all rows) |
| Enterprise | Full gap list + benchmarks | Full estimates + benchmark comparison | Yes (all rows) |

The paywall modal appears when a free-tier user scrolls past the third gap row or clicks "Show All Gaps." It presents a two-column plan comparison with a "Start Pro Trial" CTA and a "Maybe Later" dismiss. Dismissal is tracked; users who dismiss 3+ times receive an in-app message from a "success advisor" (simulated; email-triggered).

### Override Mechanism Detail

The correction flow is designed to be low-friction and reversible:

1. Single click opens the override panel — no modal, no page navigation.
2. Protocol search is instant (client-side fuzzy search on cached brand protocol list).
3. Saving an override does not re-run the entire analysis; it updates only the affected row in real time.
4. A "Restore Original" link appears on any overridden row for 30 days.
5. All overrides are visible in an audit view under Settings > My Overrides.

### Success Criteria

- Analysis completes within 60 seconds for up to 10 brands and 100 services.
- Individual brand failures do not block results for other brands (Promise.allSettled requirement).
- All confidence scores are visible and accurate.
- Overrides persist across sessions.
- Gap list is sortable and filterable without re-running analysis.
- Paywall gate renders correctly on all plan tiers.

### Failure Modes and Recovery Paths

| Failure | Impact | Recovery |
|---|---|---|
| Single brand mapping API failure | That brand's results missing | Per-brand error tile with "Retry this brand" button; other brands unaffected (requires Promise.allSettled fix) |
| All brand mappings fail | Zero results screen | "Analysis failed — please try again" with retry; if 3rd failure, route to support |
| Confidence score computation error | Score shows "—" | Tooltip: "Score unavailable for this item"; item flagged for admin review |
| Override save fails | User's correction lost | Optimistic UI with rollback; toast: "Couldn't save your correction. Try again." |
| Gap analysis timeout | No gaps shown | Partial results shown if available; retry CTA for failed portion |

---

## Business Journey D: Simulate Revenue Impact

### Purpose
The revenue simulator allows a business user to build a financial model projecting the uplift from adopting specific brand protocols identified in the gap analysis. The user adjusts assumptions to match their business reality and sees projected monthly revenue, margin, and payback period. The simulator output links directly to the ordering flow.

### Entry Points

| Entry Point | Context |
|---|---|
| "Build Revenue Model" CTA on Gap Analysis screen (B-15) | Pre-populated with selected gap protocols |
| Dashboard "Revenue Simulator" card | Blank simulator; user selects protocols manually |
| Activation Kit generation (Journey E) | Simulator pre-populated for kit protocols |

### Step-by-Step Flow

```
[B-16 Revenue Simulator Screen]
        |
        +-- LEFT PANEL: Protocol Selection
        |     List of gap protocols from analysis; checkboxes to include/exclude
        |     User can also add protocols not in their gap list (advanced use)
        |
        +-- CENTER PANEL: Editable Assumptions
        |     [See Assumption Groups below]
        |
        +-- RIGHT PANEL: Output Model (live-updating as assumptions change)
        |     [See Output Model below]
        |
        v
[User edits assumptions — all changes reflected in output within 200ms]
        |
        v
[B-17 Simulator Results / Export]
        +-- [Save Model] — stores assumptions + outputs to user account
        +-- [Share Model] — generates shareable read-only link (no auth required to view)
        +-- [Export PDF] — formatted revenue model report
        +-- [Add to Activation Kit] --> [Business Journey E]
        +-- [Order Products] --> [Business Journey F]
```

### Editable Assumption Groups

**Group 1: Utilization**

| Assumption | Default Value | Range | Description |
|---|---|---|---|
| Treatment rooms | 2 | 1–20 | Number of rooms that could offer this protocol |
| Operating days/week | 5 | 1–7 | |
| Hours per day | 8 | 4–12 | |
| Room utilization rate | 60% | 10–100% | % of available hours that are booked |
| Protocol duration (min) | Pulled from brand protocol | 30–180 | Editable per protocol |

**Group 2: Pricing**

| Assumption | Default Value | Range | Description |
|---|---|---|---|
| Service price | Pulled from brand protocol MSRP guidance | $0–$999 | Per-treatment retail price |
| Retail attach rate | 25% | 0–100% | % of treatment clients who buy retail |
| Average retail basket | $45 | $0–$500 | Average retail sale per attaching client |

**Group 3: Cost of Goods**

| Assumption | Default Value | Range | Description |
|---|---|---|---|
| Product cost per treatment | Pulled from brand wholesale pricing | $0–$200 | Direct COGS for consumables |
| Retail product cost | Pulled from brand wholesale pricing | $0–$200 | COGS on retail units sold |
| Labor cost per treatment | $35 | $0–$300 | Estimated labor including benefits allocation |

**Group 4: Ramp**

| Assumption | Default Value | Range | Description |
|---|---|---|---|
| Months to full utilization | 3 | 1–12 | How long to ramp to stated utilization rate |
| Training cost (one-time) | Pulled from brand training program | $0–$5,000 | One-time investment |
| Equipment cost (one-time) | Pulled from brand kit pricing | $0–$50,000 | One-time investment |

### Output Model

The right panel shows live-calculated outputs. All calculations are client-side (no server round-trip) to ensure the 200ms responsiveness requirement.

**Monthly Revenue Uplift (at full utilization)**

```
Treatments per month = rooms × days/week × 4.33 × hours/day × utilization% ÷ (duration/60)
Treatment revenue    = treatments/month × service price
Retail revenue       = treatments/month × attach rate × avg retail basket
Total monthly revenue = treatment revenue + retail revenue
```

**Monthly Gross Margin**

```
Treatment COGS       = treatments/month × product cost/treatment
Retail COGS          = (treatments/month × attach rate) × retail product cost
Labor cost           = treatments/month × labor cost/treatment
Total monthly COGS   = treatment COGS + retail COGS + labor cost
Monthly gross margin = total monthly revenue − total monthly COGS
Gross margin %       = monthly gross margin ÷ total monthly revenue
```

**Payback Period**

```
Total one-time investment = training cost + equipment cost
Monthly profit            = monthly gross margin (steady state)
Payback period (months)   = total one-time investment ÷ monthly profit
```

**Displayed Output Cards**

| Output | Format | Threshold Colors |
|---|---|---|
| Monthly Revenue Uplift | $X,XXX/mo | Green >$2,000; Yellow $500–$2,000; Red <$500 |
| Monthly Gross Margin | $X,XXX/mo + XX% | Green >40%; Yellow 25–40%; Red <25% |
| Annual Revenue Uplift | $XX,XXX/yr | Green >$24,000 |
| Payback Period | X.X months | Green <6mo; Yellow 6–12mo; Red >12mo |
| First-Year Net Profit | $XX,XXX | After subtracting one-time costs |

**Ramp Chart**

A 12-month bar chart shows month-by-month revenue during the ramp period. Month 1 starts at `1/months_to_full_utilization` of full utilization, scaling linearly to full. Training and equipment costs are shown as a negative bar in month 1.

### Link from Simulator to Ordering

When the user clicks "Order Products" from the simulator, the cart is pre-populated with:

1. The brand's recommended starter kit for each included protocol.
2. Quantity calculated as: `treatments/month × product cost/treatment ÷ cost per unit` rounded up to nearest case quantity.
3. If retail was included: retail unit assortment from brand's recommended retail set.

The user can adjust quantities before checkout. The simulator assumptions are saved to the order record for post-purchase adoption tracking (Journey G).

### Success Criteria

- All assumption changes reflect in output within 200ms (no server calls in calculation path).
- Default values pull correctly from brand catalog data (protocol duration, MSRP, wholesale pricing).
- Saved models persist across sessions and load in under 2 seconds.
- Shared model links work without authentication and show a read-only view.
- PDF export renders correctly on A4 and US Letter.

### Failure Modes

| Failure | Recovery |
|---|---|
| Brand pricing data missing | Use platform-wide category averages; flag with "Estimated — brand pricing not confirmed" |
| Calculation produces negative margin | Show warning: "This model shows a loss at these assumptions. Check your pricing and COGS." |
| PDF export fails | Retry button; fallback to "Copy as text" |
| Shared link expired (30-day TTL) | "This model link has expired. Ask the owner to reshare." |

---

## Business Journey E: Generate Activation Kit

### Purpose
The activation kit is a branded, ready-to-use package of materials that helps a business implement a new brand protocol. It is AI-generated from the mapping results, revenue model, and brand protocol documentation, then customized with the business's name and logo. The kit is the primary value artifact that differentiates The PRO Edit from a simple product directory.

### Entry Points

| Entry Point | Context |
|---|---|
| "Generate Activation Kit" CTA on Gap Analysis screen (B-15) | One or more protocols selected |
| Revenue Simulator "Add to Activation Kit" CTA (B-17) | Protocol list from simulator |
| Dashboard "Your Kits" → "New Kit" | Manual protocol selection |

### What Is in the Kit

Each activation kit contains the following components, generated per brand-protocol combination:

**1. Service Menu Redesign**
- Formatted service menu insert with the new protocol(s) added
- Uses business's existing menu structure (extracted during menu upload)
- Brand protocol name, description, and price positioned per brand guidelines
- Format: PDF (print-ready, 300dpi) + editable DOCX

**2. Pricing Guide**
- Recommended retail price based on local market tier (entered at profile setup)
- Introductory offer suggestion (first 60 days)
- Bundle pricing recommendations if multiple protocols from same brand
- Format: PDF one-pager

**3. Training Plan**
- Brand's official training outline (sourced from brand catalog)
- Scheduling template: how to fit training into existing team schedule
- Knowledge check questions (5 per protocol)
- Format: PDF + markdown (for LMS import)

**4. Retail Bundles**
- Recommended retail bundles for home care continuity
- Includes SKU list, display suggestion, talking points
- Format: PDF shelf card + plain text for POS system import

**5. Client Scripts**
- Consultation script: how to introduce the new service to existing clients
- Rebooking script: how to suggest the service at checkout
- Email/SMS announcement template for existing client list
- Social caption set (3 variations per protocol)
- Format: DOCX + plain text

**6. Revenue Projection Summary** (if simulator was run)
- One-page financial summary from the revenue simulator output
- Format: PDF

### Step-by-Step Flow

```
[B-18 Kit Builder Screen]
        |
        +-- Protocol selector (pre-populated from journey entry point)
        |
        +-- Brand asset check:
        |     System verifies brand has uploaded: logo, color palette, protocol documentation
        |     If any missing: show per-component warning; kit can still generate with placeholders
        |
        +-- Business customization fields:
        |     Business name (pre-filled from profile)
        |     Logo upload (optional; uses brand logo placeholder if none)
        |     Primary color (optional; for menu redesign accent)
        |     Market tier (pre-filled from profile; affects pricing guidance)
        |
        +-- [Generate Kit] button
        |
        v
⚠️  ASYNC GENERATION — POLLING REQUIRED (same pattern as Journey B)
        |
[B-18a Kit Generation Progress Screen]
        |
        +-- Per-component status tiles:
        |     Menu Redesign: Generating... / Ready / Failed
        |     Pricing Guide: Generating... / Ready / Failed
        |     Training Plan: Generating... / Ready / Failed
        |     Retail Bundles: Generating... / Ready / Failed
        |     Client Scripts: Generating... / Ready / Failed
        |
⚠️  CRITICAL BUG: Promise.all() unguarded failure
        If the edge function uses Promise.all() for component generation,
        a failure in one component (e.g., training plan generation times out)
        will cancel all other component generation.
        REQUIRED FIX: Use Promise.allSettled() per component.
        Components that succeed render immediately as downloadable.
        Failed components show a per-component retry button.
        User should never see a blank kit because one component failed.
        |
        v (all or partial components complete)
        |
[B-19 Kit Preview Screen]
        |
        +-- Tab per component: click tab → preview renders in iframe
        |
        +-- Per-component actions: Download, Regenerate, Edit (opens component editor)
        |
        +-- [Download All] — ZIP of all completed components
        |
        +-- [Share Kit] — generates shareable link (read-only); optionally password-protected
        |
        +-- [Order Products] CTA — transitions to Journey F with kit protocols pre-selected
```

### Export Formats

| Component | Primary Format | Secondary Format |
|---|---|---|
| Menu Redesign | PDF (print-ready) | DOCX (editable) |
| Pricing Guide | PDF | — |
| Training Plan | PDF | Markdown (.md) |
| Retail Bundles | PDF | Plain text (.txt) |
| Client Scripts | DOCX | Plain text (.txt) |
| Revenue Summary | PDF | — |
| Full Kit | ZIP | — |

### Sharing Flow

1. User clicks "Share Kit" on B-19.
2. System generates a signed URL with a 30-day TTL.
3. Optional: user sets a 4-digit PIN for access control.
4. Recipient opens URL → sees read-only kit preview with all downloadable components.
5. Recipient can download individual components without an account.
6. Share events are logged (open, download per component) and surfaced to the kit owner in a "Kit Activity" panel.

### Regeneration

If a user edits their menu or runs a new analysis after generating a kit:
- Dashboard shows a banner: "Your kit for [Brand] may be out of date. Regenerate?"
- Regeneration creates a new kit version; old version is archived (not deleted).
- Up to 5 kit versions are stored; oldest pruned beyond that.

### Success Criteria

- Kit generation completes within 90 seconds for a single-protocol kit.
- Per-component failures do not block other components from completing.
- All downloads produce valid, correctly-formatted files.
- Shared links work without authentication.
- Regeneration preserves the user's custom fields (business name, logo, color).

### Failure Modes

| Failure | Recovery |
|---|---|
| Brand assets missing (no logo, no protocol doc) | Generate with placeholders; banner: "Some content could not be personalized — brand assets are incomplete" |
| Script generation AI failure | Show placeholder text with "Regenerate Scripts" button |
| PDF rendering failure | Offer DOCX download as fallback |
| ZIP creation failure | Offer per-component individual downloads |
| Share link generation failure | Retry; if persistent, offer "Copy link manually" with manual instructions |

---

## Business Journey F: Purchase Pro / Retail → Track Adoption

### Purpose
After generating a kit or viewing a revenue model, the business user proceeds to purchase the brand's professional and/or retail products. Post-purchase, the platform tracks whether the user has implemented the protocol and resurfaces adoption checkpoints.

### Entry Points

| Entry Point | Context |
|---|---|
| Kit Preview "Order Products" CTA (B-19) | Products pre-populated from kit protocols |
| Gap Analysis "Order Products" CTA (B-15) | Products pre-populated from selected gaps |
| Simulator "Order Products" CTA (B-17) | Products pre-populated from simulator protocols |
| Brand Detail "Shop" tab (B-02) | Direct product browsing |
| Dashboard Reorder banner | Triggered by reorder cadence logic (Journey G) |

### Step-by-Step Flow

```
[B-20 Cart Screen]
        |
        +-- Product line items: SKU, brand, protocol association, qty, unit price, line total
        |
        +-- Qty editable per line; min order quantities enforced per brand
        |
        +-- Kit association badge: "Part of [Brand] Activation Kit"
        |
        +-- "You might also need" suggestions: consumables, tools, retail assortment
        |
        +-- Order summary: subtotal, estimated shipping, estimated tax, total
        |
        +-- [Proceed to Checkout] -->
        |
[B-21 Checkout Screen]
        |
        +-- Shipping address (pre-filled from profile; editable)
        |
        +-- Shipping method selection (standard / expedited / freight for large orders)
        |
        +-- Payment method:
        |     Saved card (if exists)
        |     New card (Stripe Elements embed)
        |     Net 30 (if business is approved for trade credit)
        |
        +-- Order notes field
        |
        +-- [Place Order] button
        |
        v
[Payment processing — Stripe]
        |
        +-- On success:
        |     Order record created in DB
        |     Order confirmation email sent
        |     Redirect to B-22 Order Confirmation
        |
        +-- On failure:
        |     Error message from Stripe displayed inline
        |     Card fields remain populated; user can correct without re-entering entire form
        |
[B-22 Order Confirmation Screen]
        |
        +-- Order ID, summary, estimated delivery date
        |
        +-- "What happens next" timeline:
        |     Order confirmed → Brand fulfillment → Shipped → Delivered → Implementation check-in
        |
        +-- [View Order Tracking] → B-23 Order Tracking
        |
        +-- [Return to Dashboard]
        |
[B-23 Order Tracking Screen]
        |
        +-- Real-time fulfillment status (pulled from brand's order management integration or manual admin updates)
        |
        +-- Tracking number with carrier deep-link when available
        |
        +-- Estimated delivery date with confidence range
        |
        +-- Contact support CTA if delivery is overdue
```

### Post-Purchase Adoption Loop

Adoption tracking is the mechanism that closes the loop between purchasing and business outcomes. Without it, the platform cannot demonstrate ROI, brands cannot see true adoption rates, and the optimization loop (Journey G) has no signal.

```
[Order Delivered (estimated delivery date + 2 days)]
        |
        v
[Adoption Check-In Trigger]
        |
        +-- In-app notification: "Your [Brand Protocol] order was delivered. Ready to implement?"
        |
        +-- Email: "Time to activate — here's your 3-step launch checklist"
        |
        v
[B-24 Adoption Check-In Screen]
        |
        +-- Checklist per protocol:
        |     [ ] Team trained
        |     [ ] Protocol on your menu (live)
        |     [ ] First client booked
        |     [ ] Retail on display
        |
        +-- Each checkbox, when checked, prompts a light data capture:
        |     Team trained → When? (date picker)
        |     Protocol on menu → Share your updated menu? (optional upload)
        |     First client booked → Date of first service? (date picker)
        |     Retail on display → How many units on display? (number)
        |
        +-- Completion unlocks:
        |     "Implementation Badge" shown on business profile
        |     30-day results check-in scheduled
        |
        v
[30-Day Results Check-In]  (triggered by scheduler)
        |
        +-- "How many [Protocol] treatments have you performed this month?"
        |
        +-- "What was your average ticket for this treatment?"
        |
        +-- "Did you hit your revenue goal?" (yes/no/close)
        |
        +-- Responses feed the optimization loop (Journey G) and brand analytics (Brand Journey C)
```

### Success Criteria

- Cart correctly pre-populates from kit and gap analysis entry points.
- Minimum order quantities enforced per brand without blocking cart creation.
- Payment processing completes or fails with a clear user message within 30 seconds.
- Order confirmation email delivered within 2 minutes of order placement.
- Adoption check-in triggers fire within 24 hours of estimated delivery date.
- Check-in completion rate is tracked as a platform health metric.

### Failure Modes

| Failure | Recovery |
|---|---|
| Payment failure (card declined) | Inline Stripe error message; user corrects card details |
| Brand out of stock on ordered SKU | Flag in cart before checkout: "This item is currently out of stock — expected [date]" |
| Fulfillment integration unavailable | Order saved; admin notified; manual fulfillment fallback |
| Tracking data unavailable | "Tracking not yet available — check back in 24 hours" |
| Adoption check-in email bounces | In-app notification used as fallback; attempt resend after 48 hours |

---

## Business Journey G: Ongoing Optimization Loop

### Purpose
The optimization loop is the recurring cadence of insights, alerts, and reorder triggers that turns The PRO Edit from a one-time discovery tool into an ongoing business operating system. It operates on a monthly insight cadence with event-driven seasonal and reorder interrupts.

### Monthly Insights Cadence

```
[1st of each month — automated]
        |
        v
[Monthly Insights Report generated]
        |
        +-- Inputs:
        |     Adoption check-in responses from prior month
        |     Order history (what was ordered, when)
        |     Gap analysis results (what opportunities were identified)
        |     Revenue simulator saved models (what was projected)
        |
        +-- Report sections:
        |     1. Implementation score: % of kit checklist items completed
        |     2. Estimated revenue impact: based on check-in data vs. simulator projection
        |     3. Remaining gaps: top 3 unaddressed opportunities
        |     4. Trending protocols: what's popular in similar businesses this month
        |     5. Reorder forecast: which products are likely running low
        |
        v
[B-25 Monthly Insights Screen]
        |
        +-- Accessible from Dashboard "Insights" card
        |
        +-- Email digest version sent on 2nd of month (plain text + link to full report)
        |
        +-- Drill-down available on each section
        |
        +-- [Take Action] CTAs per section:
        |     Remaining gaps → "See Gap Analysis"
        |     Trending protocols → "View in Brand Discovery"
        |     Reorder forecast → "Reorder Now" (pre-populated cart)
```

### Seasonal Promotion Alerts

Seasonal alerts are event-driven interrupts that fire outside the monthly cadence. They are triggered by a combination of calendar logic and brand-supplied promotion data.

| Alert Type | Trigger | Content | CTA |
|---|---|---|---|
| Seasonal protocol push | 6 weeks before major season (Summer, Holiday, Valentine's, Mother's Day) | "Summer body protocols are trending — you have 2 gaps in this category" | View gaps |
| Brand promotion | Brand submits a time-limited promotion in Brand Journey B | "[Brand] is offering 20% off starter kits through [date]" | Add to cart |
| New protocol available | Brand publishes a new protocol in catalog | "[Brand] just launched [Protocol] — see if it fits your menu" | View brand |
| Low inventory prediction | Order history + typical reorder cadence | "Based on your usage, you may run out of [Product] in ~2 weeks" | Reorder |

Alert delivery channels: in-app notification bell, email (daily digest of all pending alerts), SMS (opt-in only, high-priority alerts only such as promotion expiring in 24 hours).

Alert fatigue management: maximum 3 alerts per week per user; alerts are prioritized by estimated revenue impact; user can set preferences per alert type.

### Reorder Triggers

```
[Reorder Trigger Logic — runs nightly]
        |
        +-- For each user × product order history:
        |
        +-- Calculate average consumption rate:
        |     treatments_per_month (from adoption check-in) × product_units_per_treatment
        |
        +-- Calculate days of supply remaining:
        |     units_on_hand (last order qty − estimated consumed) ÷ daily_consumption_rate
        |
        +-- If days_of_supply_remaining < 14:
        |     Create reorder alert
        |     Pre-populate reorder cart with last order quantities
        |
        +-- If days_of_supply_remaining < 7:
        |     Escalate to high-priority alert
        |     Offer expedited shipping option in pre-populated cart
```

Note: Units on hand is estimated, not tracked in real time (no inventory integration in v1). Accuracy depends on adoption check-in data. Users who do not complete check-ins will receive less accurate reorder triggers. The check-in UI should emphasize this connection: "Completing your check-in helps us forecast your reorder needs."

### Success Criteria

- Monthly insights report generates by 6:00 AM on the 1st of each month.
- Email digest delivered by 8:00 AM on the 2nd of each month.
- Seasonal alerts fire at the correct calendar intervals.
- Reorder pre-populated cart matches last order with updated quantity estimates.
- Alert fatigue limits respected (no more than 3 per week per user).

### Failure Modes

| Failure | Recovery |
|---|---|
| Insights report generation fails | Retry with exponential backoff; if still failed by end of day 1st, notify admin; user sees "Insights loading — check back soon" |
| Email delivery failure | In-app notification fallback |
| Reorder calculation with no adoption check-in data | Fall back to order history cadence only; accuracy flag shown to user |
| Brand promotion data stale or incorrect | Admin review required before alert fires; brands cannot push alerts without admin approval |

---

## Brand Journey A: Onboard Brand → Catalog Ingestion

### Purpose
A brand account manager (or the admin on their behalf) sets up the brand's presence on the platform. This includes uploading protocol documentation, SKU catalog, pricing, and brand assets. The journey ends when the brand's catalog is live and discoverable by business users.

### Entry Points

| Entry Point | Context |
|---|---|
| Admin-initiated: Admin creates brand tenant, sends invite link | Brand receives email with branded onboarding URL |
| Brand self-serve signup (if enabled) | Brand registers, awaits admin approval before catalog is live |

### Step-by-Step Flow

```
[BR-01 Brand Welcome / Onboarding]
        |
        +-- Brand name, website, primary contact details
        +-- Brand category (skincare, body, nail, lash, etc.) — multi-select
        +-- Price tier: Mass Market / Professional / Luxury / Ultra-Luxury
        +-- Target client profile: age range, spend tier, treatment frequency
        +-- [Continue]
        |
        v
[BR-02 Brand Asset Upload]
        |
        +-- Logo (SVG or PNG, min 500×500, transparent background)
        +-- Brand color palette (hex values; max 5 colors)
        +-- Hero image (1200×628, JPG/PNG)
        +-- Brand story text (max 500 words)
        +-- [Continue]
        |
        v
[BR-03 Protocol Upload]
        |
        +-- For each protocol:
        |     Protocol name
        |     Category (must match platform taxonomy)
        |     Duration (minutes)
        |     Complexity (Basic / Advanced / Expert)
        |     Required products (linked to SKU catalog)
        |     Optional products (add-on/upgrade SKUs)
        |     Treatment steps summary (plain text or PDF attachment)
        |     Contraindications (plain text)
        |     Training required: Yes/No; if Yes, link to training program
        |
        +-- Bulk upload via CSV template (template downloadable from this screen)
        |
        +-- After upload: system runs protocol validation:
        |     Required fields present?
        |     Category matches taxonomy?
        |     Linked SKUs exist in catalog?
        |
        v
[BR-04 SKU Catalog Upload]
        |
        +-- For each SKU:
        |     SKU ID (brand's internal ID)
        |     Product name
        |     Size / unit
        |     MSRP (USD)
        |     Professional wholesale price
        |     Case quantity (minimum order)
        |     Product type: Professional Use / Retail / Both
        |     Protocol associations (multi-select from uploaded protocols)
        |     Product images (1–5 images, JPG/PNG)
        |
        +-- Bulk upload via CSV
        |
        +-- After upload: SKU validation run (same as protocol validation)
        |
        v
[BR-05 Pricing and Terms Setup]
        |
        +-- Minimum order value (USD)
        +-- Payment terms: Prepay / Net 15 / Net 30
        +-- Shipping policy (flat rate / weight-based / free over threshold)
        +-- Returns policy (text field)
        +-- Territory restrictions (US only / all markets / specific state exclusions)
        |
        v
[BR-06 Go-Live Checklist]
        |
        +-- System-generated checklist with pass/fail status:
        |
        |     [ ] Brand assets complete (logo, hero, story) — PASS/FAIL
        |     [ ] At least 1 protocol uploaded and validated — PASS/FAIL
        |     [ ] At least 1 SKU per protocol — PASS/FAIL
        |     [ ] Pricing and terms complete — PASS/FAIL
        |     [ ] Admin catalog QA approved — PENDING/APPROVED/REJECTED
        |
        +-- Items marked FAIL show inline fix links
        +-- Admin QA approval is required before brand goes live (see Admin Journey B)
        |
        +-- [Submit for Review] button — triggers Admin Journey B
        |
        v
[Awaiting Admin Approval state]
        |
        +-- Brand catalog is in draft state; not discoverable by business users
        +-- Brand user can continue editing catalog during review
        +-- Estimated review time shown: "Usually reviewed within 1 business day"
        |
        v (Admin approves)
        |
[BR-07 Catalog Live Confirmation]
        |
        +-- "Your brand is now live on The PRO Edit"
        +-- First performance data available within 48 hours (after indexing and first views)
        +-- Link to Brand Journey C (Analytics)
        +-- Link to Brand Journey B (Visibility Products)
```

### Validation and QA Steps

Protocol validation rules:

| Rule | Validation | Error Message |
|---|---|---|
| Category match | Protocol category must be in platform taxonomy | "Category '[value]' not recognized. Choose from: [list]" |
| Duration range | Must be 15–300 minutes | "Duration must be between 15 and 300 minutes" |
| Required products | At least one SKU linked | "Each protocol requires at least one linked product SKU" |
| SKU cross-reference | Linked SKUs must exist in uploaded catalog | "SKU [id] not found. Upload this product before linking." |
| Name uniqueness | Protocol names unique within brand | "A protocol named '[name]' already exists for your brand" |

SKU validation rules:

| Rule | Validation | Error Message |
|---|---|---|
| MSRP > Wholesale | MSRP must be greater than wholesale price | "MSRP must be higher than wholesale price" |
| Case quantity | Must be a positive integer | "Case quantity must be a whole number greater than zero" |
| Image required | At least one product image required | "Each product requires at least one image" |
| SKU ID unique | SKU IDs unique within brand | "Duplicate SKU ID: [id]" |

### Go-Live Checklist (Detailed)

| Item | Who Completes | Blocking? |
|---|---|---|
| Brand profile complete | Brand user | Yes |
| Brand assets uploaded | Brand user | Yes |
| At least 3 protocols uploaded | Brand user | Yes (3 minimum for discovery indexing) |
| At least 1 SKU per protocol | Brand user | Yes |
| Pricing and terms set | Brand user | Yes |
| Protocol descriptions meet min length (50 words) | Brand user | Yes |
| No broken SKU cross-references | System validation | Yes |
| Admin catalog QA pass | Admin user | Yes |
| Brand terms of service signed | Brand user | Yes |

### Success Criteria

- Brand catalog is fully searchable and discoverable within 1 hour of admin approval.
- Protocol-to-taxonomy mapping is 100% valid before go-live.
- All product images load correctly on brand detail screen.
- Bulk CSV uploads process within 60 seconds for catalogs up to 500 SKUs.

---

## Brand Journey B: Visibility and Placement Products

### Purpose
Brands can purchase paid placement to increase their visibility in the business user's discovery feed, appear in curated collections, and run time-limited campaigns targeting specific business segments.

### Placement Product Types

| Product | Description | Pricing Model |
|---|---|---|
| Featured Brand Slot | Brand appears in "Featured" row at top of discovery feed | CPM (per 1,000 impressions) |
| Category Sponsor | Brand's card shown first within a specific treatment category | Flat weekly fee |
| Curated Collection Inclusion | Brand included in editorially-styled collection ("Best for Medspas," etc.) | Flat monthly fee |
| New Business Push | Brand surfaced to businesses in their first 30 days | CPA (per qualified view) |
| Seasonal Spotlight | Seasonal promotion card shown to business users | Flat campaign fee |
| Email Feature | Brand included in PRO Edit weekly email digest to business users | Flat per-send fee |

### Step-by-Step Flow

```
[BR-08 Visibility Products Screen]
        |
        +-- Current active placements summary
        +-- Available placement products with inventory/availability
        +-- [Browse Products]
        |
        v
[BR-09 Placement Product Detail]
        |
        +-- Product description, example creative, targeting options, pricing
        |
        +-- Targeting options (vary by product):
        |     Business type (spa / salon / medspa)
        |     Business size (solo / small team / multi-location)
        |     Geography (national / state / metro)
        |     Service category affinity (businesses with matching service categories)
        |
        +-- Estimated reach: "~X,XXX businesses match your targeting"
        |
        +-- [Add to Campaign] -->
        |
[BR-10 Campaign Builder]
        |
        +-- Campaign name (internal label)
        +-- Start date / End date
        +-- Budget (for CPM/CPA products: daily cap + total cap)
        +-- Creative upload:
        |     Featured Slot: 600×400 image + 80-char headline + 160-char body
        |     Category Sponsor: 300×300 image + brand name auto-populated
        |     Curated Collection: collection image provided by PRO Edit editorial team
        +-- Call-to-action destination: Brand Detail page (default) or external URL
        +-- [Submit Campaign for Review]
        |
        v
[Campaign review by Admin — 1 business day SLA]
        |
        v (Admin approves)
        |
[BR-11 Campaign Live Confirmation]
        |
        +-- Campaign goes live on specified start date
        +-- Real-time performance available in Brand Journey C (Analytics)
```

### Campaign Review Criteria (Admin-enforced)

- Creative must meet size, format, and file size specifications.
- Headline and body copy must not make unsubstantiated claims (e.g., "clinically proven" requires supporting documentation).
- Campaigns targeting competitor brand categories are flagged for additional review.
- Budget must meet minimum: $500/campaign.

### Success Criteria

- Campaign builder saves in-progress state so brand user can return to draft.
- Creative upload accepts JPG, PNG, GIF (no video in v1).
- Estimated reach calculation updates within 500ms of targeting change.
- Approved campaigns go live within 1 hour of start date.

### Failure Modes

| Failure | Recovery |
|---|---|
| Creative rejected by Admin | Email with specific rejection reasons + edit link to campaign |
| Campaign budget exhausted before end date | Email notification; campaign paused; brand can top up |
| Targeting returns <100 estimated reach | Warning: "Your targeting is very narrow — you may get few impressions. Consider broadening." |
| Billing failure on CPM charge | Campaign paused; brand notified by email; 72-hour grace period to update payment |

---

## Brand Journey C: Performance Analytics

### Purpose
Brand users view data on how their catalog is performing on the platform: how many businesses have viewed their brand, how many have run gap analyses involving their protocols, how many have added to evaluation, and how many have placed orders.

### Analytics Dashboard (BR-12)

The analytics dashboard is organized into four metric groups:

**Group 1: Discovery**

| Metric | Definition | Refresh Cadence |
|---|---|---|
| Profile Views | Unique business users who viewed the brand detail screen | Daily (T-1) |
| Discovery Feed Impressions | Times brand card appeared in a feed or search result | Daily (T-1) |
| Feed Click-Through Rate | Profile Views ÷ Impressions | Daily (T-1) |
| Evaluation List Saves | Unique businesses that added brand to their evaluation list | Daily (T-1) |

**Group 2: Evaluation**

| Metric | Definition | Refresh Cadence |
|---|---|---|
| Gap Analyses Run | Times brand's protocols were included in a gap analysis | Daily (T-1) |
| Protocols Appearing as Gaps | Count of brand protocols identified as gaps for any business | Daily (T-1) |
| Kit Generations | Times a kit was generated including brand protocols | Daily (T-1) |
| Revenue Simulations Run | Times a brand's protocol was included in a revenue simulation | Daily (T-1) |

**Group 3: Conversion**

| Metric | Definition | Refresh Cadence |
|---|---|---|
| Orders Placed | Count of orders including at least one brand SKU | Daily (T-1) |
| Revenue (GMV) | Total order value (MSRP) | Daily (T-1) |
| Average Order Value | Revenue ÷ Orders | Daily (T-1) |
| Unique Ordering Businesses | Count of distinct businesses placing first order | Daily (T-1) |

**Group 4: Adoption**

| Metric | Definition | Refresh Cadence |
|---|---|---|
| Implementation Rate | % of ordering businesses that completed training checklist item | Weekly |
| Protocol Live Rate | % of ordering businesses that marked protocol as live on their menu | Weekly |
| 30-Day Retention | % of ordering businesses that placed a second order within 30 days | Weekly |
| Average Treatment Volume | Self-reported treatments/month from adoption check-ins | Weekly |

### Strict Data Boundary Enforcement

Data shown to a brand user is scoped exclusively to their own brand. This is enforced at multiple layers:

1. **Row-level security (RLS):** All analytics queries run against views where `brand_id = auth.jwt() -> 'brand_id'`. A brand user cannot query another brand's data regardless of client-side state.
2. **No cross-brand aggregations exposed:** A brand user cannot see how their performance compares to specific named competitors. Benchmarking (Brand Journey D) uses anonymized aggregates only.
3. **Business identity masking:** Brand users can see aggregate metrics (how many businesses, what geography tier) but cannot see individual business names, business owner names, or any PII. Individual business records are identified only by anonymized IDs for debugging purposes in admin tools.
4. **Audit log:** All brand user data access is logged with timestamp and query parameters for compliance review.

### Drill-Down Flows

From any metric tile, the brand user can:

1. Click metric → time-series chart (last 30 days default; 7-day / 90-day options)
2. Apply filters: date range, geography tier, business type
3. Export chart data as CSV (own brand data only; export includes brand_id watermark)

### Success Criteria

- Dashboard loads within 3 seconds for any brand with up to 24 months of data.
- Data is no more than 26 hours stale (T-1 cadence with morning refresh by 6 AM).
- Drill-down to time-series chart loads within 2 seconds.
- CSV export generates within 10 seconds.
- No cross-brand data leakage verified via automated RLS tests in CI pipeline.

### Failure Modes

| Failure | Recovery |
|---|---|
| Analytics refresh job fails | Show last-refreshed timestamp; banner: "Data may be delayed. We're working on it." |
| Metric returns null (new brand, no data) | Show "—" with tooltip: "No data yet — check back after your brand goes live for 48 hours" |
| CSV export fails | Retry button; if persistent, admin notified to run manual export |

---

## Brand Journey D: Benchmarking

### Purpose
Brand users can view anonymized benchmarks showing how their performance metrics compare to aggregated peer performance. This data is strictly anonymized — no individual brand can be identified — and access is gated by plan tier.

### What Is Shown

Benchmarks are available on four dimensions:

| Dimension | Metric Shown | Peer Group Definition |
|---|---|---|
| Discovery | Feed CTR, Evaluation List Save Rate | Same brand category, same price tier |
| Evaluation | Kit Generation Rate per Profile View | Same brand category |
| Conversion | Conversion Rate (Orders/Evaluations), Average Order Value | Same brand category, same price tier |
| Adoption | Implementation Rate, 30-Day Retention | Same brand category |

Peer group minimum size: **10 brands.** If fewer than 10 brands exist in the peer group, the benchmark is suppressed and replaced with: "Not enough peers in your category to show this benchmark yet."

### Benchmark Display Format

Each benchmark metric is shown as:

- Brand's own value (exact number)
- Peer group median (anonymized aggregate)
- Peer group 75th percentile (anonymized aggregate)
- Simple label: "Below median" / "Near median" / "Above median" / "Top quartile"

No individual brand values, brand names, or identifiable data are ever shown in the benchmark view.

### Permissioning

| Plan Tier | Benchmark Access |
|---|---|
| Starter | No benchmark access |
| Growth | Discovery and Evaluation benchmarks only |
| Pro | All four benchmark dimensions |

### How Anonymization Is Enforced

1. Benchmarks are computed by a scheduled job (nightly) that runs in a service-role context, not a user context.
2. The job writes to a `brand_benchmarks` table containing only: `category`, `price_tier`, `metric_name`, `median_value`, `p75_value`, `peer_count`, `computed_at`.
3. Brand users query only this pre-aggregated table. They never have access to the raw analytics table for other brands.
4. The `peer_count` column is always returned. If `peer_count < 10`, the application layer suppresses the benchmark values and shows the minimum peer count message.
5. This suppression logic is enforced at the API layer (not just the UI layer) so it cannot be bypassed by direct API calls.

### Success Criteria

- Benchmarks computed and available by 7 AM each day.
- Peer group minimum enforced at API layer.
- No brand names or identifiable information appear in benchmark data.
- Plan-tier gating enforced for Growth vs. Pro benchmark access.

---

## Admin Journey A: Tenant Management

### Purpose
Admin users monitor platform health across all tenants (both business users and brand users), intervene when issues arise, and manage account lifecycle events (upgrades, downgrades, suspension, deletion).

### Admin Dashboard (AD-01)

```
[AD-01 Admin Dashboard]
        |
        +-- PANEL: Platform Health
        |     Active tenants (business + brand)
        |     New signups today / this week / this month
        |     Failed ingest jobs (last 24h)
        |     Failed kit generations (last 24h)
        |     Open support tickets
        |     Billing anomalies (failed charges, overdue)
        |
        +-- PANEL: Recent Activity Feed
        |     Real-time log: tenant signups, plan changes, orders, catalog submissions
        |     Filterable by event type and tenant type
        |
        +-- PANEL: Alert Queue
        |     Ingest failures requiring manual review
        |     Catalog submissions awaiting QA
        |     Billing disputes
        |     Flagged mappings (from business user override flags)
```

### Tenant Monitoring Flow

```
[AD-02 Tenant List]
        |
        +-- Searchable, filterable list:
        |     Filters: tenant type (business/brand), plan tier, status (active/suspended/pending)
        |     Columns: Tenant Name, Type, Plan, Signup Date, Last Active, MRR, Status
        |
        +-- [View Tenant] → AD-03 Tenant Detail
        |
[AD-03 Tenant Detail — Business Tenant]
        |
        +-- Profile summary: contact info, business type, location, signup date
        +-- Subscription: current plan, billing date, MRR, payment method status
        +-- Activity log: logins, uploads, analyses, orders, kit generations (last 90 days)
        +-- Menu: last uploaded menu summary; link to view normalized menu
        +-- Analyses: list of gap analyses run; link to view results
        +-- Orders: order history with status
        +-- Support tickets: linked support history
        +-- [Actions]: Send email, Reset password, Change plan, Suspend account, Delete account
        |
[AD-03 Tenant Detail — Brand Tenant]
        |
        +-- Profile summary, brand category, price tier
        +-- Catalog status: live / draft / suspended; last updated
        +-- Protocol count, SKU count
        +-- Campaign summary: active campaigns, spend to date
        +-- Revenue summary: GMV through platform, commissions owed
        +-- [Actions]: Approve catalog, Suspend catalog, Change plan, Flag for review
```

### Intervention Flows

**Suspend Account:**

1. Admin selects "Suspend Account" on Tenant Detail.
2. Confirmation modal: "This will prevent [tenant] from logging in and will hide their catalog (if brand). This does not cancel their subscription."
3. Admin enters reason (required, internal only).
4. Suspension takes effect immediately; tenant receives email: "Your account has been temporarily suspended. Contact support at [email]."
5. Suspension is reversible; admin selects "Lift Suspension."

**Force Plan Change:**

1. Admin selects "Change Plan" on Tenant Detail.
2. Select new plan from dropdown; enter effective date and reason.
3. Proration calculated and shown (credit or charge).
4. Confirm; plan change applied immediately; tenant notified by email.

**Delete Account (GDPR/CCPA compliance):**

1. Admin selects "Delete Account."
2. System checks for: pending orders (block deletion until fulfilled or cancelled), outstanding invoices (must be settled), active brand catalog (must be taken offline first).
3. Confirmation modal requires admin to type tenant name.
4. Soft delete: account marked deleted, data anonymized per retention policy. Hard delete after 30-day grace period.

### Success Criteria

- Admin dashboard loads within 3 seconds for all platform sizes.
- Tenant list supports search across 10,000+ tenants without pagination latency.
- Account suspension takes effect within 60 seconds of admin action.
- Deletion checks all blocking conditions before allowing action.

---

## Admin Journey B: Catalog Validation and Mapping QA

### Purpose
Admin users review newly submitted brand catalogs for completeness, accuracy, and taxonomy alignment before approving them for live discovery. They also review business user mapping overrides flagged for admin attention.

### Protocol QA Workflow

```
[AD-05 Catalog QA Queue]
        |
        +-- List of pending catalog submissions (brand name, submission date, item counts)
        +-- Priority order: oldest first; flagged items surfaced to top
        |
        +-- [Open Submission] → AD-06 Catalog QA Detail
        |
[AD-06 Catalog QA Detail]
        |
        +-- Brand summary: name, category, price tier
        |
        +-- SECTION: Protocols
        |     Table: Protocol Name | Category | Duration | Complexity | SKU Links | Auto-Validation Status
        |     Admin can click any row → Protocol Detail panel
        |
        |     Protocol Detail Panel:
        |         Full protocol data as submitted
        |         Auto-validation results (pass/fail per rule)
        |         Admin notes field
        |         [Approve Protocol] | [Request Change] | [Reject Protocol]
        |
        +-- SECTION: SKUs
        |     Table: SKU ID | Product Name | MSRP | Wholesale | Type | Images | Auto-Validation Status
        |     Admin can click any row → SKU Detail panel
        |
        +-- SECTION: Brand Assets
        |     Preview: logo, hero image, brand story
        |     Admin checklist:
        |         [ ] Logo meets spec (min size, transparent background)
        |         [ ] Hero image meets spec
        |         [ ] Brand story is substantive (not placeholder text)
        |         [ ] No prohibited claims in brand story
        |
        +-- SECTION: Admin Decision
        |     [Approve All + Go Live] — catalog goes live
        |     [Approve with Changes Required] — catalog goes live; specific items flagged for brand to fix
        |     [Return for Revision] — catalog stays in draft; brand notified with specific feedback
        |     [Reject] — catalog rejected; brand notified; cannot resubmit without contacting support
```

### Correction Flow

When admin selects "Request Change" on a protocol or SKU:

1. Admin enters a change request note (required): describes what needs to change and why.
2. The protocol/SKU is marked with a "Revision Needed" badge visible to the brand user.
3. Brand user receives email: "Action required: your catalog submission has items that need updates."
4. Brand user edits the flagged items and clicks "Resubmit for Review."
5. Admin receives a notification that revised items are ready for re-review.
6. Re-review is scoped to flagged items only; previously approved items are not re-reviewed.

### Mapping Override QA

Business users can flag mappings for admin review (from the override flow in Business Journey C). These appear in a separate queue:

```
[AD-07 Mapping Override Queue]
        |
        +-- List: Business Name | Brand | Service | AI Match | User Override | Flag Reason | Date
        |
        +-- [Review Override] → AD-08 Override Detail
        |
[AD-08 Override Detail]
        |
        +-- Side-by-side: AI's original match vs. user's override
        +-- Confidence score for original match
        +-- User's flag note (if provided)
        +-- [Accept Override as Correct] — marks override as validated; feeds retraining pipeline
        +-- [Reject Override] — restores AI match; notifies user with explanation
        +-- [Escalate] — routes to model quality team for deeper investigation
```

### Success Criteria

- New catalog submissions reviewed within 1 business day (SLA tracked in admin dashboard).
- Every approve/reject action is logged with admin user ID, timestamp, and reason.
- Brand users receive feedback within 4 hours of admin decision via email.
- Override queue is reviewed at least twice weekly.

---

## Admin Journey C: Billing and Commissions Reconciliation

### Purpose
Admin users reconcile orders placed through the platform, calculate brand commissions, and manage payouts. They also handle billing exceptions (failed charges, disputed invoices, proration credits).

### Order to Commission to Payout Logic

```
[Order Placed by Business User]
        |
        v
[Order Record Created]
        |
        +-- Fields: order_id, business_id, brand_id, line_items[], total_amount, order_date,
        |            fulfillment_status, commission_rate, commission_amount, payout_status
        |
        +-- Commission rate sourced from brand's contract record in DB
        |     Default rate if no contract: platform default (configurable by admin, default 15%)
        |
        v
[Order Fulfilled (status = 'delivered')]
        |
        v
[Commission Accrues]
        |
        +-- commission_amount = total_amount × commission_rate
        +-- payout_status set to 'accrued'
        +-- Accrued commissions aggregated into monthly payout batch
        |
        v
[Monthly Payout Batch — generated on last business day of month]
        |
        +-- Groups all 'accrued' commissions by brand_id
        +-- Calculates: gross payout, any deductions (chargebacks, promotional credits)
        +-- Net payout amount calculated
        +-- Payout record created: payout_id, brand_id, period, gross, deductions, net, status='pending'
        |
        v
[Admin Payout Reconciliation — AD-10]
        |
        +-- Admin reviews payout batch before release
        +-- [Review Payout Batch] → AD-10 Payout Detail
        |
[AD-10 Payout Detail]
        |
        +-- Brand-level payout cards: brand name, order count, gross GMV, commission rate, gross commission, deductions, net payout
        +-- [View Line Items] → order-level detail per brand
        +-- [Flag for Review] — marks payout for additional check; does not block other payouts
        +-- [Approve Payout] — releases net payout to brand via ACH (Stripe Connect) or manual wire
        +-- [Hold Payout] — holds payout with reason; brand notified
        |
        v (Admin approves)
        |
[Payout Initiated]
        |
        +-- Stripe Connect: transfer initiated; 2–3 business day settlement
        +-- payout_status → 'initiated' → 'settled' (updated via Stripe webhook)
        +-- Brand receives automated payout notification email with statement PDF
```

### Billing Exception Handling (AD-11)

```
[AD-11 Billing Exceptions Queue]
        |
        +-- Failed subscription charges:
        |     Business | Amount | Failure Reason | Days Since Failure | Last Retry
        |     [Retry Charge] | [Switch to Manual Invoice] | [Suspend Account]
        |
        +-- Disputed invoices:
        |     Business | Invoice ID | Amount | Dispute Reason | Days Open
        |     [View Invoice] | [Issue Credit] | [Escalate to Finance]
        |
        +-- Overdue accounts (payment not received after 30 days):
        |     Business | Amount | Days Overdue
        |     [Send Reminder] | [Suspend Services] | [Write Off]
```

### Commission Rate Management

Admin can set commission rates at three levels (most specific wins):

| Level | Example | Override Scope |
|---|---|---|
| Platform default | 15% | All brands, all order types |
| Brand-specific | Brand X: 18% | All orders from Brand X |
| Brand + Order Type | Brand X, Retail orders: 20% | Only retail orders from Brand X |

Rate changes are forward-looking only; historical orders are not retroactively recalculated.

### Success Criteria

- Monthly payout batch generated accurately on last business day of month.
- Commission amounts match expected calculation for 100% of line items (verified by reconciliation report).
- Stripe Connect payouts initiate within 24 hours of admin approval.
- Failed charge queue reviewed and actioned within 2 business days.
- All financial actions logged with admin user ID, timestamp, and reason.

---

## Journey Failure Modes (Cross-Journey)

This section catalogs failure modes that span multiple journeys or occur at infrastructure level.

### Infrastructure-Level Failures

| Failure | Affected Journeys | Fallback |
|---|---|---|
| Supabase edge function cold start latency (>10s) | B, C, E (all async operations) | Show loading state with user-readable message; do not timeout UI before 30s |
| Supabase database connection pool exhausted | All journeys | Queue-based retry with exponential backoff; user sees "Service momentarily busy" with auto-retry |
| Stripe API unavailable | Journey F (checkout), Admin Journey C | Checkout blocked with: "Payment processing temporarily unavailable. Your cart is saved." Alert admin immediately. |
| Claude API rate limit or unavailability | Journey B (extraction), Journey C (mapping), Journey E (kit generation) | Queue job for retry; user sees "AI processing is experiencing delays — we'll notify you when complete"; email notification when job finishes |
| File storage (Supabase Storage) unavailable | Journey B (upload), Journey E (kit export) | Accept upload to in-memory queue; drain to storage when available; user does not need to re-upload |
| Real-time websocket disconnected | Journeys with live status updates | Fall back to polling every 5 seconds; show "Live updates paused" badge |

### Application-Level Failures

| Failure | Affected Journeys | Fallback |
|---|---|---|
| Promise.all() unguarded failure | Journey C (brand mapping), Journey E (kit generation) | Requires fix: replace with Promise.allSettled(). Per-item retry available. |
| Race condition: navigate before save | Journey B (PlanWizard) | Requires fix: disable Next button until async job confirmed complete |
| No async polling | Journey B, Journey C, Journey E | Requires fix: implement job status polling or Supabase Realtime subscription |
| No real-time status updates | Journey B, Journey C, Journey E | Requires fix: use Supabase Realtime channels for job row updates |
| Session timeout mid-analysis | Journey C | Save job ID to sessionStorage; on re-auth, restore polling for in-progress job |
| Optimistic UI failure (override save fails) | Journey C | Toast notification; rollback UI state to pre-save; retry button |

### Data Integrity Failures

| Failure | Affected Journeys | Fallback |
|---|---|---|
| Menu ingest job completes but DB write fails | Journey B, C, D, E | Retry DB write up to 3 times; if all fail, mark job as failed with error details; user can re-upload |
| Kit generation completes but file write to storage fails | Journey E | Retry file write; if persistent, offer regeneration; do not charge kit generation against usage quota |
| Commission calculation mismatch | Admin Journey C | Flag payout for manual review; do not auto-release; notify finance team |
| RLS policy misconfiguration (data leakage risk) | Brand Journey C, D | Automated RLS tests run on every deploy; deployment blocked if tests fail |

### User-Caused Failures

| Failure | Affected Journeys | Fallback |
|---|---|---|
| User navigates away mid-upload | Journey B | Prompt: "You have an upload in progress. Leave and cancel it?" |
| User uploads wrong file | Journey B | Allow re-upload at any point before confirming; replace in-progress job |
| User enters invalid assumptions in simulator | Journey D | Client-side validation with field-level error messages; no server call until valid |
| User attempts to order out-of-stock product | Journey F | Block checkout with per-item stock message; allow user to remove or waitlist |

---

## Summary Decision Matrix

This matrix summarizes all journeys across priority, complexity, and estimated revenue impact to support roadmap sequencing decisions.

| Journey | Name | Actor | Priority | Complexity | Revenue Impact | Status |
|---|---|---|---|---|---|---|
| Business A | Discover Brand → Evaluate Fit | Business | P0 | Medium | High (top of funnel — drives all downstream revenue) | Core; must be flawless at launch |
| Business B | Upload Menu → Normalize → Categorize | Business | P0 | High | Critical (blocks all AI-dependent journeys; contains critical bugs) | Core; bugs must be fixed pre-launch |
| Business C | Run AI Mapping → See Gaps/Opportunities | Business | P0 | Very High | Critical (primary value proposition; paywall gate; contains critical bugs) | Core; bugs must be fixed pre-launch |
| Business D | Simulate Revenue Impact | Business | P1 | Medium | High (conversion driver; links directly to ordering) | Core; launch with v1 simulator |
| Business E | Generate Activation Kit | Business | P0 | Very High | High (primary differentiator; drives orders; contains bug) | Core; Promise.allSettled fix required |
| Business F | Purchase Pro/Retail → Track Adoption | Business | P0 | High | Direct (all platform GMV flows through this journey) | Core; launch requirement |
| Business G | Ongoing Optimization Loop | Business | P1 | Medium | High (LTV driver; increases reorder frequency) | Launch with basic cadence; expand in v2 |
| Brand A | Onboard Brand → Catalog Ingestion | Brand | P0 | Medium | Enabling (zero brand revenue without this) | Core; launch requirement |
| Brand B | Visibility/Placement Products | Brand | P1 | Medium | Medium (brand revenue stream; not launch-critical) | Phase 2 |
| Brand C | Performance Analytics | Brand | P0 | Medium | Enabling (required for brand retention; cannot sell placement without analytics) | Core; basic dashboard at launch |
| Brand D | Benchmarking | Brand | P2 | Low | Low (premium feature; nice-to-have for brand upsell) | Phase 3 |
| Admin A | Tenant Management | Admin | P0 | Medium | Enabling (operational necessity) | Core; launch requirement |
| Admin B | Catalog Validation + Mapping QA | Admin | P0 | Medium | Enabling (no brands go live without this) | Core; launch requirement |
| Admin C | Billing/Commissions Reconciliation | Admin | P0 | High | Direct (all commission revenue flows through this) | Core; launch requirement |

### Priority Definitions

| Priority | Definition |
|---|---|
| P0 | Launch blocker. Platform cannot operate commercially without this journey working correctly. |
| P1 | High value. Significant revenue or retention impact. Must be present within 60 days of launch. |
| P2 | Enhancement. Adds value but does not block commercial operation. Target for Phase 3. |

### Critical Pre-Launch Engineering Checklist

Based on the journeys defined above, the following engineering issues must be resolved before commercial launch:

1. **[CRITICAL] Fix PlanWizard race condition.** The wizard must not navigate to the next step until the async ingest job is confirmed complete. Implement Zustand/context-level guard on the Next button.

2. **[CRITICAL] Implement async job polling.** All long-running jobs (menu ingest, AI mapping, kit generation) require a polling or Supabase Realtime subscription on the job status row. The client must not assume completion without confirmation.

3. **[CRITICAL] Replace Promise.all() with Promise.allSettled().** In the brand mapping and kit generation edge functions, replace all unguarded Promise.all() calls with Promise.allSettled(). Handle fulfilled and rejected results independently.

4. **[HIGH] Implement real-time status updates.** All processing screens must reflect live job phase and progress, sourced from DB or Realtime subscription. Static spinners are not acceptable for operations that may take 30–90 seconds.

5. **[HIGH] Add RLS integration tests to CI pipeline.** Automated tests must verify that brand users cannot access other brands' analytics data. Pipeline must block deployment on any RLS test failure.

6. **[HIGH] Implement sessionStorage resilience for in-progress jobs.** If a user re-authenticates mid-analysis or mid-generation, the job ID must be recoverable from sessionStorage so polling can resume without restarting the job.

---

*Document maintained by: Product Design*  
*Next review: After Business Journey B and C bug fixes are merged to main*  
*Changelog: v1.0 — Initial authoritative draft, 2026-02-22*
