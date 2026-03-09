# SCREEN REQUIREMENTS

**Product:** The PRO Edit  
**Document Type:** UX/UI Screen Specification  
**Version:** 1.0  
**Date:** 2026-02-22  
**Status:** Authoritative — Engineering and Design must implement to this spec

---

## Overview / How to Read This Document

This document defines the complete user experience requirements for the ten most critical screens in The PRO Edit platform. It is written for product designers, frontend engineers, and QA reviewers. It is not a wireframe — it is a behavioral, structural, and visual specification.

**How to use this document:**

- Each screen section is self-contained. You do not need to read other sections to understand any given screen.
- Every section follows the same structure: goal → inputs → states → trust cues → bugs → accessibility → mobile/desktop → design tokens.
- Sections marked **BUG** represent confirmed issues from the current codebase audit. These are not hypothetical. They must be resolved before shipping the affected screen.
- Sections marked **ASSUMPTION** flag places where product or revenue logic is based on a modeled assumption rather than verified data. These must be disclosed to users.
- Design token references use the `pro-*` naming convention defined in the global token system.

**Design token reference:**

| Token Name       | Value     | Usage                                      |
|------------------|-----------|--------------------------------------------|
| `pro-navy`       | `#1E3A5F` | Primary headers, CTAs, key UI chrome       |
| `pro-gold`       | `#C5A572` | Accents, highlights, premium indicators    |
| `pro-ivory`      | `#FAFAF7` | Page backgrounds                           |
| `pro-cream`      | `#F5F1EC` | Card backgrounds, secondary surfaces       |
| `pro-stone`      | `#E8E3DA` | Borders, dividers, inactive states         |
| `pro-charcoal`   | `#2D2D2D` | Body text, secondary headings              |

**Typography:**

- Headings: DM Serif Display
- Body, labels, UI text: Inter

**Breakpoints:**

- Mobile: < 768px
- Tablet: 768px–1024px
- Desktop: > 1024px

**Accessibility baseline:** WCAG 2.1 AA compliance required on all screens. Specific requirements are called out per screen.

---

## Screen 1: Business Onboarding + Menu Upload

**Route:** `/portal/onboarding` (wizard) and `/portal/plans/new` step 2  
**Screen type:** Multi-step wizard  
**Primary user:** Spa, salon, or medspa business owner or manager

---

### Primary User Goal

Complete account setup and upload or paste their current service menu so the platform can begin AI-powered analysis. The user's single motivating question at this stage is: "What is this platform going to show me about my business?" This screen must answer that question with forward momentum, not friction.

---

### Primary Action

Upload or paste the menu and submit it for analysis. Every other element on this screen is secondary to that action.

---

### Inputs Required

| Input | Type | Why It Is Needed |
|---|---|---|
| Business name | Text field | Used in all generated outputs, activation kits, and branded exports. Also used as display name across the platform. |
| Business type | Select: Spa / Salon / Medspa / Medical Clinic / Multi-location | Determines which brand categories and protocols are surfaced. A medspa sees injectable and device protocols; a hair salon does not. |
| Location (city, state) | Text / autocomplete | Used for regional pricing benchmarks in the revenue simulator. Also used in activation kit exports. |
| Number of treatment rooms or chairs | Number input | Used in the revenue model as a capacity constraint for utilization calculations. |
| Primary services offered | Multi-select tag input (checkboxes by category) | Pre-seeds the gap analysis with service category context before the menu is parsed. Reduces false-positive gap flags. |
| Menu upload OR menu paste | File upload or textarea | This is the core data input. The menu is the source of truth for all downstream analysis. |
| Estimated average ticket price | Number input (optional at step 1, prompted again in simulator) | Used to initialize revenue model assumptions. Can be changed later. |

---

### Wizard Structure

**Step 1 of 4 — Business Profile**

- Heading (DM Serif Display, 28px): "Tell us about your business."
- Subheading (Inter, 16px, `pro-charcoal`): "We use this to tailor your brand recommendations and revenue analysis."
- Fields: Business name, Business type, Location
- Progress indicator: 4-step horizontal stepper at top, Step 1 filled
- CTA: "Continue" — disabled until Business name and Business type are filled
- Back: Not shown on step 1

**Step 2 of 4 — Upload Your Menu**

- Heading: "Upload or paste your current service menu."
- Subheading: "We'll map your services to brand protocols and identify your revenue gaps. This takes about 30–60 seconds."
- Upload zone: Drag-and-drop file zone with inner label "Drop your menu here, or click to browse" — `pro-cream` background, `pro-stone` dashed border, `pro-gold` on hover/drag-over
- Supported formats listed below upload zone: PDF, DOCX, TXT — max 10 MB
- Toggle: "Paste menu text instead" — toggles file upload zone to a plain-text textarea (24 rows, monospace optional)
- Trust cue block (see Trust Cues section below)
- CTA: "Analyze My Menu" — triggers async processing, transitions to Step 3

**Step 3 of 4 — Processing (Async)**

- This step is displayed while the Claude AI edge function processes the uploaded menu.
- See "Async Processing State Design" section below for full detail.

**Step 4 of 4 — Confirmation + Redirect**

- Heading: "Your analysis is ready."
- Body: "We found [N] services on your menu and identified [X] potential revenue opportunities."
- CTA: "View My Gap Analysis" — navigates to `/portal/plans/:id?tab=gaps`
- Secondary CTA: "Review Menu Matches First" — navigates to `/portal/plans/:id?tab=matches`

---

### File Format Handling

| Format | Handling |
|---|---|
| PDF | Parsed via server-side text extraction. If the PDF is image-based (scanned), surface a warning: "This PDF appears to be a scanned image. Parsing may be less accurate. Consider pasting your menu as text for best results." |
| DOCX | Converted to plain text server-side. Tables and formatted lists are preserved as line-separated text. |
| TXT | Accepted as-is, passed directly to the AI prompt. |
| Image files (JPG, PNG) | Not currently supported. Show error: "Image files are not yet supported. Please export your menu as a PDF or paste the text directly." |
| Files over 10 MB | Rejected client-side before upload with error message (see Error States). |
| Password-protected PDF | Server returns parsing error. Surface the specific error: "This PDF is password-protected. Please remove the password and re-upload, or paste your menu text." |

**Validation rules:**

- File must be one of the accepted MIME types: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/plain`
- File size must not exceed 10,485,760 bytes (10 MB)
- Client-side validation runs before upload begins
- If paste mode: minimum 50 characters required before submission is enabled

---

### Async Processing State Design

> **BUG — RACE CONDITION (CONFIRMED):** The current implementation navigates to the gap analysis view before the AI analysis result has been saved to Supabase. This means the plan record exists but is empty when the user arrives. The fix is: navigation must only occur after the save Promise resolves successfully. The `navigate()` call must be placed inside the `.then()` or after `await` on the save operation — never in a `finally` block or in parallel with the save. See also the unguarded `Promise.all` issue noted below.

**Processing screen layout (Step 3):**

- Full-width progress panel replaces the upload form
- Animated progress bar: indeterminate (no fake percentage — do not fake progress)
- Three sequential status messages that update as the process advances. Each message replaces the previous:
  1. "Parsing your menu..." (shown immediately after submit)
  2. "Mapping services to protocols..." (shown after parse complete webhook or timeout-based fallback)
  3. "Calculating your revenue opportunities..." (shown after mapping complete)
- Estimated time label below progress bar: "This usually takes 30–60 seconds."
- Do not allow the user to navigate away during processing. The "Continue" and "Back" buttons are hidden. Provide a "Cancel" link (small, `pro-charcoal`, below the progress bar) that aborts the upload and returns to Step 2 with the file input cleared.
- If the process completes in under 10 seconds, show the final status message for at least 2 seconds before auto-advancing to Step 4. Do not flash-transition.

> **BUG — UNGUARDED Promise.all (CONFIRMED):** The edge function currently uses `Promise.all([parseMenu(), analyzeGaps(), saveResults()])` without individual error handling. If any one Promise rejects, the entire batch fails silently. Refactor to `Promise.allSettled()` with per-result inspection, or use sequential awaits with try/catch per step so partial results can be saved and the user can be given a meaningful partial result state rather than a blank screen.

---

### Outputs Shown After Completion (Step 4)

- Number of services detected (integer)
- Number of service categories detected (e.g., "Facial, Body, Massage")
- Number of gap opportunities identified (integer, may be capped at 2 if free tier)
- Headline estimated revenue uplift range: "We identified up to $X,XXX/month in potential revenue opportunities." — ASSUMPTION flag shown as tooltip: "Based on industry average pricing and utilization rates. Adjust assumptions in the Revenue Simulator."
- Two CTAs: primary (View Gap Analysis) and secondary (Review Menu Matches)

---

### Empty State

Route `/portal/plans/new` step 2 when no menu has been uploaded yet.

- Upload zone with dashed border is the hero element
- Subheading: "You haven't uploaded a menu yet. Start here to unlock your gap analysis."
- Helper text: "Don't have a digital menu? Paste your services as a list — one service per line is enough to get started."
- No skeleton, no spinner — static state

---

### Loading State

- When the page itself is loading (e.g., returning to an in-progress onboarding session): show a centered spinner (`pro-navy`, 32px) with label "Loading your session..."
- Do not show an empty form while data is fetching

---

### Error States

| Trigger | Message | Recovery Action |
|---|---|---|
| File too large (>10 MB) | "This file is too large. Maximum file size is 10 MB. Please compress the PDF or paste your menu as text." | Re-show upload zone |
| Unsupported file type | "This file type is not supported. Please upload a PDF, Word document, or text file." | Re-show upload zone |
| Parse failed (server error) | "We weren't able to read this file. Try pasting your menu text directly, or contact support if the problem continues." | Show paste textarea as fallback |
| Network timeout (>90 seconds) | "This is taking longer than expected. Your menu has been saved — we'll email you when analysis is complete." | Redirect to dashboard with status banner |
| AI edge function error | "Something went wrong during analysis. Your menu was saved and we'll retry automatically. You can also try again now." | Show "Try Again" button that re-triggers analysis on existing plan record |
| Paste input too short (<50 characters) | "Please include more detail — at minimum, list your services one per line." | Inline validation below textarea |

---

### Trust Cues

Trust cue block displayed below the upload zone on Step 2:

- Lock icon + text: "Your menu is private. It is never shared with brands or other businesses."
- Info icon + text: "The AI reads your menu to identify service categories and match them to brand protocols. It does not store your menu text after analysis is complete." — IMPORTANT: Only display this if it is technically true. Verify with engineering that raw menu text is not persisted beyond the analysis run.
- Shield icon + text: "All data is encrypted in transit and at rest."

---

### Accessibility Requirements (WCAG 2.1 AA)

- File upload zone must be keyboard accessible: Enter and Space activate the file picker when the zone is focused
- Drag-and-drop is an enhancement — keyboard/click must work independently
- Progress messages on Step 3 must use `aria-live="polite"` so screen readers announce updates
- All form fields must have associated `<label>` elements (not placeholder-only)
- Error messages must be associated with their input via `aria-describedby`
- Focus must be managed at each step transition: focus moves to the new step's heading (`tabIndex={-1}` on heading, `.focus()` called on transition)
- Color is never the sole means of conveying information (e.g., error state uses icon + color + text)
- Minimum touch target size: 44×44px for all interactive elements
- Progress stepper must have `aria-label="Step X of 4"` on each step indicator

---

### Mobile vs Desktop

**Mobile (< 768px):**

- Wizard steps are full-screen, vertically stacked
- Progress stepper condenses to "Step 1 of 4" text label — dots only, no step labels
- File upload zone is a large tap target (minimum 120px height)
- "Paste menu text instead" toggle is prominently placed below the upload zone, not collapsed
- "Analyze My Menu" CTA is fixed to bottom of screen, full width
- Trust cue block collapses to an icon-only row with tap-to-expand

**Desktop (> 1024px):**

- Wizard is centered in a card, max-width 680px
- Progress stepper shows step labels ("Business Profile", "Upload Menu", "Processing", "Complete")
- Upload zone is 200px tall with centered content
- Trust cue block displays in full as a horizontal row below the upload zone

---

### Design Tokens for This Screen

- Page background: `pro-ivory`
- Card/wizard background: white or `pro-cream`
- Borders: `pro-stone`
- Upload zone hover: `pro-gold` border
- Primary CTA: `pro-navy` background, white text
- Progress bar: `pro-gold`
- Error text: system red (not a pro token — use Tailwind `red-600`)
- Heading font: DM Serif Display
- Body/label font: Inter

---

## Screen 2: Menu Normalization / Mapping Assistant

**Route:** `/portal/plans/:id?tab=matches`  
**Screen type:** Review + correction interface  
**Primary user:** Business owner or manager reviewing AI-generated service mappings

---

### Primary User Goal

Understand how the AI mapped their menu services to brand protocols, correct any mismatches, and confirm the mapping is accurate before the gap analysis is finalized. The user's question at this stage is: "Did the AI understand my menu correctly?"

---

### Primary Action

Review mappings and either accept them in bulk or correct individual mismatches. The user should be able to complete this screen in under 5 minutes for a menu of 30 or fewer services.

---

### Confidence Score System

Every service-to-protocol mapping is assigned a confidence score by the AI. Scores are displayed as both a label and a color indicator.

| Confidence Level | Score Range | Color | Behavior |
|---|---|---|---|
| High | 80–100% | `green-600` | Pre-selected as accepted. User can reject. |
| Medium | 50–79% | `amber-500` | Pre-selected but flagged for review. User should confirm. |
| Low | 25–49% | `orange-500` | Not pre-selected. User must explicitly accept. |
| No Match | 0–24% | `stone-400` / `pro-stone` | Listed separately at bottom. User can manually assign or mark as "not mappable." |

Color is never the sole indicator — each confidence level also shows its text label and an icon (checkmark, warning triangle, X).

---

### Layout

**Desktop (table layout):**

- Page heading: "Menu Mapping Review"
- Subheading: "Review how your services were matched to brand protocols. Correct any mismatches before viewing your gap analysis."
- Summary bar at top: "[N] services mapped — [X] High confidence, [Y] Medium, [Z] Low, [W] No match"
- Bulk action toolbar: "Accept All High" button, "Accept All" button, "Reject All" button — with confirmation modal before destructive bulk actions
- Table columns: Your Service | Mapped Protocol | Brand | Confidence | Rationale | Action
- Each row is a service from the uploaded menu
- Action column: "Accept" (checkmark button) and "Override" (pencil button) per row
- "Accepted" rows show a green checkmark in the status column and are visually dimmed but not hidden
- "No Match" rows are grouped at the bottom under a "Unmatched Services" section header

**Mobile (card layout):**

- Each service is a card with the service name as the card heading
- Mapped protocol and brand shown as a two-line subtitle
- Confidence badge in top-right corner of card
- "Accept" and "Override" as two full-width buttons at bottom of card
- Cards are sorted: High confidence first, then Medium, then Low, then No Match

---

### Inline Correction / Override Mechanism

When the user clicks "Override" on a row or card:

1. A slide-over panel opens (desktop: right-side drawer; mobile: bottom sheet)
2. Panel heading: "Correct this mapping"
3. Shows the original service name from the menu (read-only)
4. Protocol search field: searchable dropdown of all available protocols in the system, grouped by brand
5. "No matching protocol" option at bottom of dropdown
6. Optional notes field: "Why are you making this change?" (not required, stored for QA)
7. "Save Override" CTA
8. On save: mapping is updated in place, confidence badge is replaced with "User Override" badge in `pro-navy`
9. Override is stored in the `plan_service_mappings` table with `override: true` and `override_by: user_id`

---

### Bulk Accept / Reject Pattern

- "Accept All High Confidence" — accepts all rows with confidence >= 80% without confirmation
- "Accept All" — accepts all rows including Medium and Low — requires confirmation modal: "This includes [N] medium and [Z] low confidence matches. Are you sure?" with "Accept All" (destructive-primary) and "Cancel" buttons
- "Reject All" — clears all accepted states — requires confirmation modal: "This will remove all accepted mappings. You'll need to review them individually. Continue?" — Use this only as an escape hatch, not a primary workflow

---

### "Why This Match?" Expandable Rationale

- Each row/card has a "Why this match?" link (small, `pro-navy`, underlined)
- Clicking expands an inline panel below the row (desktop) or within the card (mobile)
- Rationale text is AI-generated at mapping time and stored with the result. Example: "Your service 'Hydrafacial' was matched to the HydraBoost Deep Cleanse Protocol because both involve multi-step aqueous infusion with exfoliation and serum delivery."
- Rationale includes: data source used, key matching terms, and confidence explanation
- Trust cue within rationale: "This match was generated by AI and should be reviewed for accuracy."

---

### Service Categories

Services are grouped by category in the table/card list:

- Facial & Skin
- Body Treatments
- Massage & Wellness
- Medspa / Injectable (only shown for medspa business types)
- Lash & Brow
- Nail
- Hair
- Other / Uncategorized

Category headers are collapsible on desktop. On mobile, they are persistent as section labels between cards.

---

### Trust Cues

- Inline tooltip on confidence percentage: "Confidence scores are based on semantic similarity between your service descriptions and protocol definitions. Scores above 80% are generally reliable."
- Data source label per mapping: "Matched to [Brand Name] protocol database — last updated [date]"
- Footer note: "You can adjust these mappings at any time. Your gap analysis is recalculated whenever you save changes."

---

### Loading Skeleton

While mapping data is fetching from Supabase:

- Show a skeleton table (desktop) or skeleton cards (mobile)
- Skeleton rows: 3 columns of grey shimmer bars at the widths of the real content
- Minimum 6 skeleton rows shown regardless of actual count
- Skeleton must use `pro-stone` shimmer on `pro-cream` background
- Do not show real column headers until data is loaded — show skeleton headers too

---

### Error State

- If mapping data fails to load: "We couldn't load your menu mappings. Please refresh the page. If this continues, contact support."
- Full-width error banner, `red-50` background, `red-700` text, with "Refresh" button and "Contact Support" link
- Preserve the page structure (heading, subheading) — only the table/card area shows the error

---

### Accessibility Requirements (WCAG 2.1 AA)

- Table must use proper `<th>` elements with `scope="col"` for all column headers
- Confidence badges must not rely on color alone — include text label and icon
- "Accept" and "Override" buttons must have accessible names that include the service: `aria-label="Accept match for Hot Stone Massage"`
- Expanded rationale panels must use `aria-expanded` on the trigger button
- Bulk action confirmations must trap focus in the modal
- Sort controls on table columns must announce sort direction via `aria-sort`

---

### Mobile vs Desktop

**Mobile:**

- Card layout replaces table
- Bulk action toolbar collapses to a "Bulk Actions" dropdown button at top
- "Why this match?" rationale expands inline within the card (not a drawer)
- Override opens a bottom sheet (full-width, 80% viewport height)
- Category section headers are sticky while scrolling through that category's cards

**Desktop:**

- Full table layout with sortable columns
- Override opens a right-side drawer (400px wide)
- Rationale expands as an inline row below the mapped row
- Bulk action buttons are horizontal in the toolbar

---

### Design Tokens for This Screen

- Background: `pro-ivory`
- Table/card background: white
- Category header: `pro-cream`
- Accepted row background: `green-50`
- High confidence badge: `green-100` background, `green-700` text
- Medium confidence badge: `amber-100` background, `amber-700` text
- Low confidence badge: `orange-100` background, `orange-700` text
- No match badge: `pro-stone` background, `pro-charcoal` text
- Override badge: `pro-navy` background, white text
- Primary CTA: `pro-navy`
- Accent links: `pro-gold`

---

## Screen 3: Gap Analysis Results Dashboard

**Route:** `/portal/plans/:id?tab=gaps`  
**Screen type:** Analytical results dashboard with paywall gate  
**Primary user:** Business owner evaluating revenue opportunities

---

### Primary User Goal

See exactly which revenue opportunities their current menu is missing, understand the financial value of each gap, and decide which opportunities to pursue first. This is the core value delivery screen of the platform. It must lead with money, not features.

---

### Primary Action

Review gap opportunities and click "Add to Plan" on the highest-value gaps. Secondary action: upgrade to see all gaps (paywall).

---

### This Is the Money Screen

The gap analysis is the reason a business user creates an account. Design decisions on this screen have the highest leverage for conversion. Every layout choice must reinforce: "Here is what you are leaving on the table, and here is what it is worth."

---

### Layout Structure

**Summary Banner (top of page, full width):**

- Background: `pro-navy`
- Text color: white
- Left: Heading (DM Serif Display, 32px): "You could be earning an additional [estimated total range]/month."
- Sub-label (Inter, 14px): "Based on [N] identified gaps across [X] service categories. ASSUMPTION: Estimates use industry-average pricing and 60% utilization. Adjust in the Revenue Simulator."
- Right: "View Revenue Simulator" button — `pro-gold` text, `pro-navy` outline, white on hover
- ASSUMPTION disclosure tooltip on the revenue figure: "This estimate is based on regional average pricing benchmarks and assumes 60% service utilization. Your actual results will vary."

**Tier Filter Bar (below summary banner):**

- Three tab-style filters: "All Gaps" | "Quick Wins" | "Strategic Adds" | "Long-Term"
- Default: "Quick Wins" is selected on first visit
- Filter counts shown in each tab: "Quick Wins (4)"
- Background: `pro-cream`, active tab: `pro-navy` background, white text

**Gap List (main content area):**

- Sorted by: estimated monthly revenue (descending) by default
- Sort controls: dropdown with options: "Estimated Revenue (High to Low)", "Complexity (Low to High)", "Priority Tier"
- Free tier: first 2 gaps shown in full, remaining gaps blurred with paywall overlay

---

### Gap Card Specification

Each gap is displayed as a card. Cards are the unit of interaction.

**Card layout:**

- Top-left: Priority tier badge — "Quick Win" (`green-600`), "Strategic Add" (`pro-navy`), or "Long-Term" (`pro-stone`)
- Top-right: Complexity badge — "Low", "Medium", "High" complexity — color coded: Low = `green-100`/`green-700`, Medium = `amber-100`/`amber-700`, High = `red-100`/`red-700`
- Heading (DM Serif Display, 20px): Service concept name — e.g., "Scalp Restoration Facial"
- Sub-label (Inter, 14px, `pro-charcoal`): "Recommended Protocol: [Protocol Name] — [Brand Name]"
- Revenue estimate (Inter Bold, 24px, `green-700`): "$X,XXX / month estimated"
  - ASSUMPTION tooltip on revenue: "Estimated at [sessions/week] sessions × $[price] × 4.3 weeks. Adjust in simulator."
- Required SKUs summary: "[N] products required — View list"
- Three-column info row:
  - Sessions/week assumption: "4 sessions/week assumed"
  - Price assumption: "$XXX per service assumed"
  - Complexity: "Low complexity — [N] training hours"
- CTA row:
  - Primary: "Add to Plan" — `pro-navy` background, white text
  - Secondary: "View Details" — `pro-navy` text, transparent background, `pro-navy` border
- Expand toggle at bottom: "+ See required SKUs" — expands inline SKU list without navigation

**Expanded SKU list (inline, below CTA row):**

- Simple table: Product Name | SKU | Estimated Cost/Service
- "View full details" link to the Opportunity Detail Page

---

### Priority Tiers

| Tier | Criteria | Badge Color |
|---|---|---|
| Quick Win | Complexity: Low AND Estimated Revenue: Top 50% | `green-600` text on `green-50` background |
| Strategic Add | Medium complexity OR medium revenue | `pro-navy` text on `pro-cream` background |
| Long-Term | High complexity OR requires certification | `pro-charcoal` text on `pro-stone` background |

Tier assignment is computed by the analysis engine. It is not editable by the user, but the user can filter by tier.

---

### Paywall Gate

- Free tier: 2 gap cards shown in full
- Remaining cards: rendered in the DOM but blurred with CSS `filter: blur(4px)` and a semi-transparent overlay
- Overlay contains:
  - Heading: "Unlock [N] more revenue opportunities"
  - Body: "Upgrade to PRO to see all identified gaps, access the Revenue Simulator, and generate your Activation Kit."
  - CTA: "Upgrade to PRO — $[price]/month" — `pro-gold` background, `pro-navy` text
  - Secondary: "Learn what's included" — link to pricing page
- The paywall overlay is not a modal — it is inline within the card list, appearing after card 2
- Do not hide blurred cards from screen readers entirely — use `aria-hidden="true"` on the blurred content and ensure the paywall overlay itself is accessible

---

### Editable Revenue Assumptions (Inline)

- Each gap card's revenue estimate is clickable
- Clicking opens a small popover with two fields: "Sessions per week" (number input) and "Price per service" (number input)
- On change: revenue estimate on the card updates in real time (client-side calculation, not a new API call)
- Popover has a "Reset to defaults" link
- Changes are not persisted unless the user clicks "Save to Simulator" in the popover
- Persisting saves the overrides to the plan record in Supabase

---

### "Add to Plan" CTA Behavior

- Clicking "Add to Plan" adds the gap to the user's active plan
- Visual feedback: button changes to "Added to Plan" with a checkmark, `green-600` background
- Toast notification: "Scalp Restoration Facial added to your plan."
- If user clicks again: "Remove from Plan" — with undo option in toast
- The plan accumulates selected gaps and is used to pre-populate the Activation Kit and order cart

---

### Empty State

Shown when the analysis finds no gaps (rare but possible for a very comprehensive menu):

- Heading: "Your menu is comprehensive."
- Body: "We mapped all of your services to available brand protocols and found no significant revenue gaps. This is rare — well done."
- Secondary CTA: "Explore New Brands" — links to brand discovery
- Tertiary CTA: "Run analysis again with a different brand set" — re-triggers brand matching

---

### Error State

- Full-width error banner: "Your gap analysis could not be loaded. Please refresh the page."
- "Refresh" button and "Contact Support" link
- If the plan exists but analysis is still processing (e.g., due to the race condition bug noted in Screen 1): show a processing banner instead: "Your analysis is still being generated. This usually takes under 60 seconds." with an animated spinner and auto-refresh every 15 seconds.

---

### Trust Cues

- ASSUMPTION tooltip on all revenue figures (as described above)
- Methodology disclosure link in the summary banner footer: "How are these estimates calculated?" — opens a modal explaining the revenue model
- Revenue model assumptions footnote at bottom of gap list: "Revenue estimates assume [X] sessions/week, [Y]% utilization of capacity, and regional average pricing benchmarks for [state]. Estimates do not account for cost of goods, staffing, or overhead unless shown."
- Data freshness label: "Protocol data last updated [date]"

---

### Accessibility Requirements (WCAG 2.1 AA)

- Revenue figures must not use color alone to convey positivity — use "estimated monthly revenue: $X,XXX" as the accessible text, not just a green number
- Paywall blurred content must use `aria-hidden="true"` — screen readers should not read blurred gap text
- Paywall overlay CTA must be focusable and have a clear accessible name
- Sort dropdown must use a `<select>` or a properly implemented ARIA listbox
- Cards must be navigable by keyboard; "Add to Plan" and "View Details" must be reachable via Tab
- Gap cards should use `role="article"` for semantic grouping

---

### Mobile Layout

- Summary banner stacks vertically: revenue headline above, simulator CTA below
- Tier filter bar becomes a horizontally scrollable chip row
- Sort controls move to a top-right "Sort" button opening a bottom sheet
- Gap cards are full-width, single-column
- Expanded SKU list is a full-width inline table
- Paywall overlay is full-width, vertically stacked

---

### Design Tokens for This Screen

- Summary banner: `pro-navy` background, white text, `pro-gold` accent
- Page background: `pro-ivory`
- Card background: white
- Card border: `pro-stone`
- Revenue figure: `green-700` (Tailwind)
- Tier badge — Quick Win: `green-600`
- Tier badge — Strategic: `pro-navy`
- Tier badge — Long-Term: `pro-charcoal`
- Primary CTA: `pro-navy`
- Upgrade CTA: `pro-gold` background, `pro-navy` text

---

## Screen 4: Opportunity Detail Page

**Route:** `/portal/plans/:id/gaps/:gapId`  
**Screen type:** Single-item detail page  
**Primary user:** Business owner evaluating a specific revenue opportunity in depth

---

### Primary User Goal

Understand a single revenue gap in complete detail — what it is, how to implement it, what it costs to start, what it will earn, and what risks or requirements exist — and decide whether to add it to their plan.

---

### Primary Action

Click "Start Order" to begin purchasing the required products for this protocol, or "Add to Plan" if not ready to order yet.

---

### Page Structure

**Page header:**

- Breadcrumb: "Gap Analysis > [Gap Name]" — links back to `/portal/plans/:id?tab=gaps`
- Page title (DM Serif Display, 32px): Service concept name — e.g., "Scalp Restoration Facial"
- Subtitle (Inter, 16px, `pro-charcoal`): "Recommended Protocol: [Protocol Name] by [Brand Name]"
- Priority badge: Quick Win / Strategic Add / Long-Term
- Complexity badge
- Top-right: "Add to Plan" button (secondary style) and "Start Order" button (primary — `pro-navy`)

---

### Section 1: Service Concept

- What this service is and why it represents a revenue opportunity
- How it fits the user's existing menu context (e.g., "You currently offer HydraFacials — this protocol extends that category into scalp care")
- Target client profile: who books this service
- Typical booking frequency and seasonality context

---

### Section 2: Canonical Protocol

- Protocol name and brand
- Step-by-step procedure list (numbered, Inter, 16px):
  1. Step description with time estimate (e.g., "15 min: Scalp analysis and consultation")
  2. Step description...
  (Minimum 4 steps, sourced from brand protocol data)
- Total service duration
- Required equipment (non-product items — e.g., "Steamer, magnifying lamp")
- Contraindications list: conditions under which this service should not be performed — displayed in a yellow/amber callout box with a warning icon
- Client intake requirement: "Requires intake form for [specific conditions]"

---

### Section 3: Revenue Model

**Interactive revenue calculator:**

- Utilization slider: "Sessions per week" — range 1–20, default 4
- Price input: "Average service price" — default from regional benchmark, editable
- Weeks per year: "Weeks operating" — default 48, editable
- Margin input: "Gross margin %" — default from engine (based on COGS from required products), editable

**Output display (updates in real time as inputs change):**

| Output | Value | Display Style |
|---|---|---|
| Annual service revenue | $XX,XXX | DM Serif Display, 28px, `pro-navy` |
| Monthly service revenue | $X,XXX | Inter Bold, 20px |
| Annual retail revenue (at attach rate) | $X,XXX | Inter, 16px |
| Total annual revenue | $XX,XXX | Inter Bold, 20px, `green-700` |
| Gross margin estimate | $XX,XXX (XX%) | Inter, 16px |
| Opening order cost (estimated) | $X,XXX | Inter, 16px |
| Estimated payback period | X months | Inter Bold, 16px, `pro-gold` |

- ASSUMPTION tooltip on each calculated output
- "Reset to defaults" link below the calculator

---

### Section 4: Required Products Table

Full-width table with the following columns:

| Column | Description |
|---|---|
| Product name | Brand product name, linked to product detail if available |
| SKU | Product SKU code |
| Size / Format | e.g., "50mL serum" |
| Wholesale price | PRO wholesale price |
| MSRP | Manufacturer suggested retail price |
| Retail margin | Calculated: `(MSRP - Wholesale) / MSRP × 100` — shown as percentage |
| Usage per service | e.g., "2mL per service" |
| Estimated cost per service | Calculated from usage and wholesale price |
| Protocol role | e.g., "Step 2 — Treatment serum" |

- Below table: "Estimated total product cost per service: $X.XX"
- Below table: "Estimated total opening order (based on [N] services/week for 4 weeks): $X,XXX"
- "Add All to Cart" button — `pro-navy`
- Individual "Add to Cart" button per product row

---

### Section 5: Pricing Guidance

- Suggested retail price range for this service in the user's region: "$[low] – $[high]"
- Target gross margin: "We recommend pricing this service between $[X] and $[Y] to achieve a [Z]% gross margin after product cost."
- Comparison to market: "The regional average for this service type is $[X]."
- Upsell opportunity: "Clients who book this service also frequently add [add-on service] — average ticket increases to $[X+Y]."
- ASSUMPTION flag on all regional data

---

### Section 6: Training Requirements

| Field | Value |
|---|---|
| Required training hours | X hours |
| Certification level | e.g., "Licensed esthetician — no additional cert required" or "Advanced cert required" |
| Complexity rating | Low / Medium / High |
| Available training format | In-person, Online, Hybrid |
| Training provider | [Brand Name] Education |
| Training link | Button: "Request Training Information" — links to brand's training asset or opens a contact form |

---

### Section 7: Implementation Timeline

A simple visual timeline (horizontal on desktop, vertical on mobile):

- Week 1–2: Product ordering and receiving
- Week 2–3: Staff training
- Week 3: Menu update and client communication
- Week 4: First client bookings
- Week 6–8: First reorder trigger

---

### Section 8: Risk and Contraindications Disclosure

- Displayed in an amber callout box (not red — this is not an error, it is information)
- Heading: "Before adding this service"
- Bullet list of contraindications, client screening requirements, and any regulatory notes (e.g., medspa services with medical supervision requirements)
- "This information is provided as guidance. You are responsible for ensuring compliance with your state licensing requirements."

---

### Section 9: Brand Education Assets

- List of available training and support assets from the brand:
  - Protocol guide (PDF download)
  - Training video (link or embed)
  - Marketing assets (images, copy templates)
  - Client FAQ template
- Each asset shown as a row: icon, asset name, format badge (PDF, Video, Template), "Download" or "View" button
- If no assets available: "This brand has not yet uploaded education assets for this protocol. Contact [Brand Name] directly."

---

### Bottom CTA Bar (fixed on mobile, inline on desktop)

- Left: "Back to Gap Analysis" — text link
- Center: "Add to Plan" — secondary button
- Right: "Start Order" — primary `pro-navy` button, pre-populated with all required SKUs for this protocol

---

### Trust Cues

- ASSUMPTION flag on all revenue figures
- Protocol data attribution: "Protocol data provided by [Brand Name]. Last updated [date]."
- Contraindications callout
- "This is a recommendation, not a guarantee. Revenue outcomes depend on your client mix, pricing strategy, and execution."

---

### Accessibility Requirements (WCAG 2.1 AA)

- Product table must have proper `<th>` elements with `scope="col"`
- Revenue calculator inputs must have labels and be operable by keyboard
- Slider inputs must have `aria-valuemin`, `aria-valuemax`, `aria-valuenow`
- Timeline must not rely solely on visual position — use numbered steps or `aria-label` for sequence
- Fixed bottom CTA bar must not obscure content — add padding-bottom to page content equal to bar height

---

### Mobile Layout

- All sections stack vertically, full width
- Revenue calculator: slider above, outputs below, each output on its own full-width row
- Product table: horizontal scroll, or collapsed to card per product
- Fixed bottom CTA bar: full-width, "Start Order" dominant, "Add to Plan" secondary
- Implementation timeline: vertical stepper
- Education assets: full-width card list

---

### Design Tokens for This Screen

- Page background: `pro-ivory`
- Section card backgrounds: white
- Revenue outputs: `pro-navy` (annual), `green-700` (total), `pro-gold` (payback period)
- Contraindications callout: `amber-50` background, `amber-700` border and text
- Table borders: `pro-stone`
- Primary CTA: `pro-navy`
- Secondary CTA: white background, `pro-navy` border and text

---

## Screen 5: Revenue Simulator

**Route:** `/portal/plans/:id/simulate`  
**Screen type:** Interactive financial modeling tool  
**Primary user:** Business owner building conviction to invest in a brand partnership

---

### Primary User Goal

Model the financial return of adopting a brand's protocols, adjust assumptions to match their real business, and arrive at a confident "yes" or "no" on whether the investment makes sense. This is the highest-leverage conversion screen on the platform.

---

### Primary Action

Review the total annual revenue uplift and click "Order Products" to begin purchasing. Secondary action: share or export the simulation results.

---

### Design Principle for This Screen

The simulator must feel like a financial planning tool, not a marketing brochure. Every number must be adjustable. Every assumption must be disclosed. The user must feel in control of the model. Trust is built through transparency, not by showing only favorable outputs.

---

### Input Assumptions Panel

**Left column (desktop) / top section (mobile):**

All inputs are editable. Each has a label, a default value sourced from the analysis engine or regional benchmarks, and an ASSUMPTION indicator where the default is not user-specific.

| Input | Control Type | Default | ASSUMPTION? | Notes |
|---|---|---|---|---|
| Services per week (per selected protocol) | Slider, 1–40 | 4 per protocol | Yes — industry avg | One slider per selected protocol/gap |
| Average service price | Number input, $ | Regional benchmark | Yes — regional avg | One per protocol |
| Retail attach rate % | Slider, 0–100% | 35% | Yes — industry avg | Percentage of service clients who purchase retail |
| Average retail transaction value | Number input, $ | $65 | Yes — industry avg | Average value of a retail purchase |
| COGS % | Number input, % | From engine per protocol | Yes — estimated | Cost of goods as percentage of service revenue |
| Weeks per year operating | Number input | 48 | Suggested default | User knows their own schedule |
| Number of protocols selected | Read-only count | From plan | No | Shows how many gaps are being simulated |

- Below all inputs: "Reset all to defaults" link
- "Save my assumptions" button — saves to plan record in Supabase

---

### Output Panels

**Right column (desktop) / below inputs (mobile):**

All outputs update in real time as inputs change. No submit button required for recalculation.

**Panel 1 — Total Annual Revenue Uplift**

- Displayed at the top, largest type on the page
- Heading (DM Serif Display, 40px, `pro-navy`): "$XX,XXX"
- Sub-label (Inter, 16px): "Estimated annual revenue uplift"
- ASSUMPTION disclosure below: "Based on your current assumptions. Adjust inputs to reflect your actual business."

**Panel 2 — Monthly Revenue Breakdown**

- Bar chart or table (toggle between views)
- Rows/bars: one per service category (Facial, Body, Medspa, etc.)
- Columns: Service Revenue | Retail Revenue | Total Revenue per category
- Chart uses `pro-navy` for service bars and `pro-gold` for retail bars

**Panel 3 — Retail vs Service Revenue Split**

- Donut chart or two-column summary
- Service revenue total vs retail revenue total
- Percentage split shown as labels
- `pro-navy` for service, `pro-gold` for retail

**Panel 4 — Gross Margin Estimate**

- Total gross revenue (service + retail)
- Less: total COGS (product cost)
- Equals: gross margin ($)
- Gross margin percentage
- Displayed as a simple three-row calculation, not a chart
- ASSUMPTION: "Gross margin does not include labor, overhead, or marketing costs. This is a product-level margin estimate only."

**Panel 5 — Estimated Payback Period**

- Formula displayed: "Opening order cost ÷ Monthly gross margin = X months to payback"
- Output: "Estimated payback period: X months"
- Color: `pro-gold` for the payback figure
- Contextual label: "This means your opening order investment is recovered in approximately X months from service and retail revenue."

---

### Assumptions Expandable Section

- Collapsed by default
- Toggle label: "View all assumptions and methodology"
- When expanded, shows:
  - Full list of all defaulted values and their sources
  - Revenue model formula: `(sessions/week × price × weeks/year) + (sessions/week × attach_rate × retail_avg × weeks/year) - COGS`
  - Statement: "All revenue estimates are projections based on modeled assumptions. Actual results will vary based on your client mix, pricing decisions, and operational execution. These figures are for planning purposes only and do not constitute a financial guarantee."

---

### Save / Share Simulator Results

- "Save Simulation" button: saves current assumptions and outputs as a snapshot to the plan record
- "Share" button: generates a read-only shareable URL (e.g., `theproe.com/shared/simulate/[token]`) — the shared view shows outputs only, not editable inputs
- Shared view displays a banner: "This is a read-only revenue simulation created on [date]. Assumptions may not reflect current data."
- "Download as PDF" / "Print" button: generates a formatted one-page PDF of the simulation summary

---

### "Order Products" CTA

- Fixed at bottom of output panel (desktop) or bottom of page (mobile)
- Button: "Order Products" — `pro-navy` background, white text, full width on mobile
- Pre-populates the cart with all required SKUs for all selected protocols/gaps in the simulation
- On click: navigates to `/portal/shop/pro` with cart pre-filled
- Sub-label below button: "Based on your [N] selected protocols — [total SKU count] products"

---

### Trust Cues

- ASSUMPTION indicator on every defaulted input — shown as an "A" badge or tooltip: "This is an industry average assumption. Replace it with your own data for a more accurate estimate."
- Methodology disclosure in expandable section
- "These projections are for planning purposes only" disclaimer in the output panel footer
- Data provenance for regional benchmarks: "Pricing benchmarks sourced from [data source], [year]."

---

### Print / Export

- Print view: single page, `pro-ivory` background, all ASSUMPTION disclosures included
- PDF export via browser print or server-side rendering
- Exported PDF must include: business name, plan ID, date generated, all input assumptions, all output values, full methodology disclosure

---

### Accessibility Requirements (WCAG 2.1 AA)

- All sliders must have `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-label`
- Output panels must use `aria-live="polite"` so screen readers announce recalculated values
- Charts must have accessible text alternatives (a data table toggled by "View as table" button)
- All input labels must be visible (not placeholder-only)
- Color in charts is supplemented by pattern fill or data labels

---

### Mobile Layout

- Inputs stack vertically in a single column, full width
- Each protocol gets its own collapsible input section (collapsed by default for protocols below the top 3)
- Output panels stack below inputs, in order: Annual Uplift → Monthly Breakdown → Retail Split → Margin → Payback
- Charts are simplified for mobile: bar chart becomes a horizontal scrollable list
- "Order Products" CTA is fixed to the bottom of the screen at all times

---

### Design Tokens for This Screen

- Page background: `pro-ivory`
- Input panel background: white
- Output panel background: `pro-cream`
- Annual uplift figure: `pro-navy`
- Payback period: `pro-gold`
- Service revenue chart: `pro-navy`
- Retail revenue chart: `pro-gold`
- ASSUMPTION badge: `amber-100` background, `amber-700` text
- Primary CTA: `pro-navy`

---

## Screen 6: Brand Comparison View

**Route:** `/portal/plans/:id/compare`  
**Screen type:** Side-by-side comparison tool  
**Primary user:** Business owner deciding between multiple brand partnerships

---

### Primary User Goal

Directly compare 2 to 4 shortlisted brands across the dimensions that matter most to their business decision — fit, revenue potential, operational burden, and cost — and arrive at a confident choice.

---

### Primary Action

Click "Choose This Brand" on the winning brand and proceed to plan finalization or ordering.

---

### Comparison Structure

**Brand selection:**

- User can add up to 4 brands to the comparison
- "Add Brand" button opens a panel with a searchable list of all available brands, filtered to those that match the user's business type
- Minimum 2 brands required to show the comparison view
- If fewer than 2 brands have been shortlisted: show an empty state prompt (see Empty State below)

**Comparison table layout (desktop):**

- Leftmost column: dimension labels
- Remaining columns: one per brand (max 4)
- Each brand column header: brand logo (if available), brand name (DM Serif Display, 18px), "Remove" link (small, `pro-charcoal`)
- Winner badge: shown in the header of the brand that wins the most categories — "Best Overall" — `pro-gold` background, `pro-navy` text

---

### Comparison Dimensions

| Dimension | Display Format | Winner Logic | Notes |
|---|---|---|---|
| Fit Score | Percentage + colored bar (0–100%) | Highest score wins | Score from matching engine |
| Estimated Revenue Uplift | Dollar range ($/month) | Highest wins | Sum of gap estimates for this brand |
| Operational Complexity | Low / Medium / High label | Lowest wins | Average complexity across protocols |
| Training Requirement | Hours + level label | Lowest total hours wins | Sum of required training hours |
| Min Opening Order | Dollar amount | Lowest wins | From brand data |
| Protocol Count | Integer | Informational only — no winner | Number of protocols available |
| SKU Count | Integer | Informational only — no winner | Number of SKUs in catalog |
| Support Level | Label: Email / Dedicated Rep / Platform Only | Informational only | From brand profile |

**Winner badge per row:**

- The cell with the best value for each dimension (per the winner logic above) gets a subtle highlight: `pro-gold` left border, `amber-50` background
- A trophy icon appears in the cell
- "Informational only" dimensions do not have a winner highlighted

---

### "Choose This Brand" CTA

- Appears below each brand column header
- Button: "Choose This Brand" — `pro-navy` background, white text
- On click: triggers a confirmation modal:
  - Heading: "Add [Brand Name] to your plan?"
  - Body: "You can always add more brands later. This will set [Brand Name] as your primary focus for this plan."
  - Confirm: "Yes, Add to Plan" — `pro-navy`
  - Cancel: "Not Yet"
- After confirmation: brand is added to the plan record, user is redirected to `/portal/plans/:id?tab=gaps` with the selected brand's gaps shown

---

### Brand Profile Quick-Links

- Below each "Choose This Brand" button: a small row of quick-links
- "View Brand Profile" — opens brand detail page
- "View Protocols ([N])" — opens a filtered view of that brand's protocols
- "View Full Gap Analysis" — opens the gap analysis filtered to this brand

---

### Empty State

- If fewer than 2 brands shortlisted: "Add at least 2 brands to compare. Browse available brands below."
- Shows a truncated brand discovery grid inline (top 6 recommended brands)
- Each brand card has a "Add to Comparison" button

---

### Error State

- If brand data fails to load for one column: replace that column with an error state: "Data unavailable for [Brand Name]. Refresh to try again."
- Other columns remain functional

---

### Accessibility Requirements (WCAG 2.1 AA)

- Comparison table must use proper `<table>`, `<th scope="col">` for brand names, `<th scope="row">` for dimension labels
- Winner badges must use `aria-label="[Brand Name] wins this category"` on the trophy icon
- "Remove" brand button must have `aria-label="Remove [Brand Name] from comparison"`
- Table must be scrollable horizontally with `role="region"` and `aria-label="Brand comparison table"` wrapper on mobile

---

### Mobile Layout

**Option A — Horizontal scroll:**

- The full table is rendered and horizontally scrollable
- Dimension labels column is sticky (does not scroll)
- Brand columns scroll horizontally
- Scroll indicator shown (fade at right edge)

**Option B — Tab per brand:**

- A tab bar at top shows each brand name
- Selecting a tab shows a single-column detail view for that brand
- A "Compare" button at bottom switches to a two-brand side-by-side view (two columns)
- Recommended for more than 2 brands on mobile

Implement Option A for 2 brands, Option B for 3–4 brands on mobile.

---

### Design Tokens for This Screen

- Page background: `pro-ivory`
- Table background: white
- Winner cell background: `amber-50`
- Winner cell border: `pro-gold`
- Brand column header background: `pro-cream`
- "Choose This Brand" CTA: `pro-navy`
- Winner badge in header: `pro-gold` background, `pro-navy` text
- Dimension label column: `pro-cream` background, `pro-charcoal` text

---

## Screen 7: Activation Kit Generator and Export Center

**Route:** `/portal/plans/:id/kit` and `/portal/plans/:id/export`  
**Screen type:** Async generation tool + asset download center  
**Primary user:** Business owner preparing to launch the new service and brand partnership

---

### Primary User Goal

Generate a complete, customized implementation package — menu updates, pricing guidance, staff training materials, client communication templates, and retail scripts — and export them in usable formats for their team.

---

### Primary Action

Customize the kit parameters and click "Generate Kit." Then download individual assets or the full ZIP.

---

### Kit Contents

The Activation Kit consists of the following assets, generated for the specific plan and brand:

| Asset | Description | Export Format |
|---|---|---|
| Menu redesign suggestion | Updated service menu listing new services, renamed services (if applicable), and repriced services with margin targets. Formatted as a clean client-facing document. | PDF |
| New service pricing guidance | Per-service pricing recommendations with margin targets, regional context, and rationale. | PDF |
| Retail product scripts | Per-service retail recommendation scripts — one per protocol. Written for the treatment provider to use during the service. | PDF, DOCX |
| Staff training plan | Role-by-role training timeline with milestones, topics, and responsible parties. Covers: esthetician, front desk, manager. | PDF, DOCX |
| Client communication template | Email and social media post templates announcing the new services. Personalized with business name. | DOCX, TXT |
| Retail bundle suggestions | Curated retail bundle definitions with names, product combinations, and suggested retail prices. | PDF |

---

### Customization Inputs (Before Generation)

- Business name: pre-filled from onboarding, editable
- Business logo: file upload (PNG, SVG, max 2 MB) — used in PDF header
- Primary brand color (for PDF styling): color picker — defaults to `pro-navy`
- Staff names (optional): text input, comma-separated — used in the training plan
- Launch date (optional): date picker — used in training plan timeline
- Tone preference: dropdown — "Professional and polished" / "Warm and approachable" / "Clinical and precise" — passed to the AI generation prompt

---

### Generation Status (Async)

- Clicking "Generate Kit" triggers the AI generation edge function
- The UI transitions to a generation progress view:
  - Progress list: each asset is listed with its status — Queued → Generating → Ready
  - Each item shows a spinner while generating and a checkmark when complete
  - Assets become downloadable individually as each one completes (do not wait for all to finish)
  - Estimated time: "Kit generation typically takes 2–4 minutes."
  - If generation fails for a single asset: show that asset as "Failed — Retry" while others remain available
  - "Cancel" button: available during generation. Cancelling stops the generation job and returns to the customization form with inputs preserved.

---

### Per-Asset Download Buttons

- Each asset card shows: asset name, asset type icon, format badges (PDF, DOCX, TXT), file size, "Download" button
- "Preview" button for PDF assets — opens in-browser PDF viewer in a modal
- "Copy to clipboard" for TXT assets (client communication templates)
- Download triggers a signed URL from Supabase Storage

---

### Bundle Export

- "Download All (ZIP)" button at top of asset list
- ZIP includes all generated assets in a flat file structure with a README.txt listing the files and their purposes
- ZIP file named: `[BusinessName]_ActivationKit_[Date].zip`

---

### Share Link

- "Create Share Link" button generates a read-only URL for the full kit
- The shared page allows viewing and downloading of all assets without an account
- Shared page shows: business name (not displayed if user opts out), kit generation date, list of assets
- Share link expires after 30 days by default — user can extend or revoke
- Trust cue on the share page: "This kit was generated by The PRO Edit on [date] based on [Business Name]'s service menu and selected brand protocols."

---

### Trust Cues

- Above "Generate Kit" button: "Generated based on your menu analysis and [Brand Name]'s protocols. Content is AI-generated and should be reviewed before use."
- On each generated asset: footer line: "Generated by The PRO Edit — [date] — Review before distributing."
- Pricing in the kit is clearly labeled as guidance: "Suggested pricing — adjust to your market and cost structure."

---

### Error States

- Individual asset generation failure: "Failed to generate [asset name]. Retry?" with retry button per asset.
- Full kit generation failure: "Kit generation failed. Please try again. If this continues, contact support." — with retry button and support link.
- File download failure: "Download failed. Please try again." — with retry button.

---

### Accessibility Requirements (WCAG 2.1 AA)

- Generation progress list must use `aria-live="polite"` so screen readers announce status changes per asset
- "Download" buttons must have accessible names: `aria-label="Download Staff Training Plan (PDF)"`
- PDF preview modal must trap focus and have a close button reachable by keyboard
- Progress spinners must have `role="status"` and `aria-label="Generating [asset name]"`

---

### Mobile Layout

- Customization form: single-column, full-width fields
- Generation progress: vertical list of asset status cards
- Each asset card: full-width, with download and preview buttons stacked vertically
- "Download All (ZIP)" CTA: fixed to bottom of screen during and after generation
- Share link: tap-to-copy button

---

### Design Tokens for This Screen

- Page background: `pro-ivory`
- Asset cards: white background, `pro-stone` border
- Generated/ready state: `green-50` background, `green-700` check icon
- Queued state: `pro-cream` background, `pro-stone` icon
- Generating state: `pro-cream` background, animated `pro-gold` spinner
- Failed state: `red-50` background, `red-600` icon
- Primary CTA: `pro-navy`
- ZIP download CTA: `pro-gold` background, `pro-navy` text

---

## Screen 8: Commerce — Ordering (PRO and Retail)

**Route:** `/portal/shop/pro`, `/portal/shop/retail`, `/portal/orders`  
**Screen type:** Product catalog, cart, checkout, and order management  
**Primary user:** Business owner or purchasing manager placing product orders

---

### Primary User Goal

Find the exact products needed for their selected protocols, place an order at PRO wholesale pricing, and track their orders. A secondary goal is discovery: finding new products they weren't aware of.

---

### Primary Action

Add required protocol products to the cart and complete checkout. The "Protocols that use this product" link drives secondary discovery.

---

### Product Catalog

**Layout:**

- Sidebar filters (desktop) / filter sheet (mobile)
- Product grid: 3 columns (desktop), 2 columns (tablet), 1 column (mobile)
- Default sort: "Recommended for your plan" (surfaces products from the user's selected gaps first)

**Filter options:**

- Brand (multi-select checkboxes)
- Protocol (multi-select — shows protocols from the user's plan first)
- Category (e.g., Cleanser, Serum, Mask, Device, Consumable)
- PRO vs Retail view toggle (top of catalog, prominent)
- Price range (slider)
- In stock only (toggle)

**Product card:**

- Product image (square, 1:1 ratio, `pro-stone` placeholder if no image)
- Brand name (Inter, 12px, `pro-charcoal`, above product name)
- Product name (Inter SemiBold, 14px, `pro-charcoal`)
- SKU (Inter, 12px, `pro-stone` — subtle)
- PRO wholesale price (Inter Bold, 16px, `pro-navy`)
- MSRP (Inter, 12px, `pro-charcoal`, strikethrough styling)
- Retail margin badge: "XX% retail margin" — `green-100` background, `green-700` text
- Min order qty (if > 1): "Min. order: X units"
- "Protocols that use this product" link (small, underlined, `pro-navy`) — opens a popover listing protocol names
- "Add to Cart" button — `pro-navy`, full width of card
- Quantity selector: appears after first "Add to Cart" click — inline +/- controls on the card

---

### "Protocols That Use This Product" Link

- Opens a popover (desktop) or bottom sheet (mobile)
- Lists: Protocol name | Brand | Gap status (In Your Plan / Not in Your Plan)
- "View Protocol" link per row
- If product is not associated with any protocols in the user's plan: "This product is not currently associated with any of your selected protocols. Add it to a custom protocol instead."

---

### Cart

**Cart panel (slide-over on desktop, full page on mobile):**

- Cart heading: "Your Order"
- Line items: product image (small), product name, SKU, qty (editable +/- inline), unit price, line total
- Remove item: "×" button per line item, with undo toast
- Order summary:
  - Subtotal (wholesale)
  - Estimated retail value (if all products sold at MSRP): shown as a context line, not a total
  - Estimated retail margin: "If you sell all products at MSRP, your estimated retail margin is $X,XXX"
  - Shipping: "Calculated at checkout"
  - Total: bold, `pro-navy`
- "Proceed to Checkout" CTA: `pro-navy`, full-width
- "Continue Shopping" link: `pro-charcoal`, below CTA
- "Save Cart" link: saves cart to the plan record for later

---

### Checkout Flow

**Step 1 — Shipping Address:**

- Fields: First name, Last name, Business name, Address line 1, Address line 2 (optional), City, State, ZIP, Country
- "Use my profile address" prefill option
- Address validation: client-side format validation + server-side verification if available

**Step 2 — Payment:**

- Current implementation note: "Payment is admin-managed. Orders are submitted for invoice processing."
- Display a callout: "Payment is processed via invoice. Your account manager will confirm your order and issue an invoice within 1 business day."
- Input: Order notes / purchase order number (optional text field)
- No credit card fields in the current implementation — remove any placeholder card inputs to avoid user confusion

**Step 3 — Review + Submit:**

- Full order summary: all items, quantities, prices, shipping address, notes
- "Edit" links next to each section for quick corrections
- "Place Order" CTA: `pro-navy`, large, full-width on mobile
- Terms note: "By placing this order, you agree to The PRO Edit's [Terms of Service] and [Wholesale Policy]."

**Order confirmation:**

- Confirmation number displayed prominently
- Summary of order contents
- "What happens next" copy: "Your order has been submitted. Your account manager will confirm and issue an invoice within 1 business day. You'll receive a shipping confirmation email when your order ships."
- "View My Orders" CTA
- "Continue Shopping" secondary CTA

---

### Order History (`/portal/orders`)

- Table: Order # | Date | Brand(s) | Items | Total | Status | Actions
- Status labels: Submitted / Confirmed / Shipped / Delivered / Cancelled
- "View Details" per order — expands inline or opens detail page
- "Reorder" button per past order
- Reorder trigger: "You ordered [Product Name] 45 days ago — time to restock?" — shown as a dismissable banner at top of `/portal/orders` if a reorder trigger is active (trigger logic: items with a projected depletion window calculated from usage-per-service × sessions/week × days since order)

---

### Trust Cues

- PRO pricing badge: "PRO wholesale pricing — available to verified business accounts only"
- Retail margin estimate: labeled as "ESTIMATE — based on MSRP. Actual retail price and margin are at your discretion."
- "Protocols that use this product" link: "Protocol associations are sourced from brand-provided data."

---

### Accessibility Requirements (WCAG 2.1 AA)

- Quantity inputs in cart must have `aria-label="Quantity for [Product Name]"`
- Add to cart buttons must have `aria-label="Add [Product Name] to cart"`
- Cart total must be announced via `aria-live="polite"` when it changes
- Checkout form fields must have visible labels
- Error messages at checkout must use `role="alert"`
- Order status in the table must not rely on color alone — use text labels

---

### Mobile Checkout Flow

- The full checkout flow must be optimized for mobile (this is a critical requirement, not an enhancement)
- All inputs must have appropriate `inputmode` and `type` attributes for mobile keyboards (e.g., `type="tel"` for phone, `inputmode="numeric"` for quantities)
- Address autocomplete should be enabled where available
- Review step shows a scrollable summary with a fixed "Place Order" button at the bottom
- No horizontal scrolling at any checkout step

---

### Design Tokens for This Screen

- Page background: `pro-ivory`
- Product card: white background, `pro-stone` border
- PRO price: `pro-navy`
- Retail margin badge: `green-100` background, `green-700` text
- Cart panel: white background
- Order summary: `pro-cream` background
- Primary CTA: `pro-navy`
- Confirmation page: `pro-cream` background, `pro-gold` confirmation icon

---

## Screen 9: Brand Partner Dashboard

**Route:** `/brand/dashboard` and `/brand/analytics`  
**Screen type:** Brand-facing analytics and performance dashboard  
**Primary user:** Brand partner account manager or marketing lead

---

### Primary User Goal

Understand how their brand is performing on the platform — how many businesses have adopted their protocols, what the pipeline value looks like, which protocols are generating the most matches, and where there are gaps in their catalog that are reducing their match rate.

---

### Primary Action

Review performance KPIs and click "Improve Match Rate" CTAs to fill catalog gaps that are limiting brand visibility and protocol adoption.

---

### Data Boundary — Critical Requirement

**This dashboard must never expose individual business data.** All metrics are aggregated. No business name, specific menu item, or identifiable business characteristic may be shown to a brand user. All activity feeds are anonymized. This must be enforced at both the API and UI level.

- Display a persistent banner on this dashboard: "Data shown here is aggregated across all businesses. Individual business data is never shared with brand partners."
- Banner style: `pro-cream` background, `pro-navy` text, info icon — not dismissable

---

### KPI Cards (Top Row)

Four large KPI cards displayed in a horizontal row (desktop) or 2×2 grid (mobile):

| KPI | Display | Sub-label |
|---|---|---|
| Total Adopting Businesses | Integer, large | "Businesses that have added your brand to at least one plan" |
| Pipeline Value ($) | Dollar amount (sum of estimated revenue uplift across all plans featuring this brand) | "Estimated annual revenue across all active plans — ASSUMPTION" |
| Average Fit Score | Percentage | "Average match confidence across all menu analyses that included your brand" |
| Plans Generated This Month | Integer | "New plans featuring your brand this month" |

- ASSUMPTION tooltip on Pipeline Value: "Calculated using average revenue assumptions from the simulation engine. This is an estimate."
- Each KPI card is `pro-cream` background, `pro-navy` figure (DM Serif Display, 36px), Inter label

---

### Time-Series Chart: Adoption Over Time

- Line chart: X-axis = date (last 12 months, monthly intervals), Y-axis = cumulative adopting businesses
- Secondary line: plans generated (new, not cumulative) — shown as a dashed line
- Date range selector: Last 30 days / Last 90 days / Last 12 months / All Time
- Chart color: `pro-navy` for adoption, `pro-gold` for new plans
- Tooltip on hover: "Month: [Month Name] — Total adopting businesses: [N] — New plans this month: [X]"
- Accessible text alternative: "View as table" toggle

---

### Top Services Mapped to Their Protocols

- Table: Your Protocol | Services Matched To It (count) | Average Confidence Score | Top Service Name (anonymized)
- "Top Service Name" shows the most common generic service name mapped to this protocol — e.g., "Hydrating Facial" — not a specific business's service
- Sort: by match count (descending) by default
- This table shows brands where their protocols are working — high match counts indicate good market alignment

---

### Top Performing Protocols by Match Rate

- Table or ranked list: Protocol Name | Total Matches | High Confidence % | Medium Confidence % | Low Confidence %
- Confidence distribution shown as a horizontal stacked bar per row
- Colors: `green-600` (high), `amber-500` (medium), `orange-500` (low)
- "View Protocol" link per row — opens the brand's protocol detail editor

---

### Retailer Activity Feed (Anonymized)

- Heading: "Recent Platform Activity"
- Data boundary reminder shown as a sub-label: "All activity is anonymized. No business identities are shown."
- Feed items (most recent first):
  - "A business in [State] added your [Protocol Name] protocol to their plan"
  - "Your [Product SKU] was added to a cart"
  - "A business generated an activation kit featuring [Protocol Name]"
  - "[N] new menu analyses matched to your protocols this week"
- No business names, no menu content, no identifying information
- Feed items use a relative timestamp: "2 hours ago", "Yesterday", "3 days ago"
- Feed is paginated or "Load more" — not infinite scroll (to avoid excessive Supabase reads)

---

### "Improve Your Match Rate" CTAs

- Shown in a callout card with heading: "Improve your match rate"
- Body: "Brands with complete protocol definitions and full product catalogs get [X]% more matches on average."
- Action list — each item is a link:
  - "Complete your protocol descriptions ([N] protocols missing descriptions)"
  - "Add missing products to your catalog ([N] SKUs referenced in protocols but not in catalog)"
  - "Upload training assets ([N] protocols with no training materials)"
  - "Add client-facing service names to your protocols ([N] protocols with no client name)"
- Each action links to the relevant section of the brand's catalog editor

---

### Alerts

- Catalog gap warning: "You have [N] protocols that reference products not in your catalog. This reduces your match rate."
- Low confidence score alert: "Your average match confidence dropped [X]% this month. Review your protocol descriptions."
- Missing asset alert: "Activation kits for [N] businesses are missing your training assets. Upload assets to complete these kits."
- All alerts are shown as dismissable banners at the top of the dashboard, below the data boundary banner

---

### Accessibility Requirements (WCAG 2.1 AA)

- KPI cards must have `aria-label` that includes the metric name and value: `aria-label="Total Adopting Businesses: 47"`
- Charts must have accessible text alternatives (data tables)
- Feed items must be a proper list (`<ul>` / `<li>`)
- Alert banners must use `role="alert"` for screen reader announcement
- All interactive table controls must be keyboard accessible

---

### Mobile Layout

- KPI cards: 2×2 grid
- Time-series chart: simplified to a single line (adoption only), reduced date range default (30 days)
- Protocol tables: horizontally scrollable or collapsed to cards
- Activity feed: full-width card list
- Improve Match Rate CTA: full-width card at bottom of page

---

### Design Tokens for This Screen

- Page background: `pro-ivory`
- KPI cards: `pro-cream` background
- KPI figures: `pro-navy`
- Data boundary banner: `pro-cream` background, `pro-navy` text
- Adoption chart line: `pro-navy`
- Plans chart line: `pro-gold`
- Confidence bar — high: `green-600`
- Confidence bar — medium: `amber-500`
- Confidence bar — low: `orange-500`
- Alert banners: `amber-50` background, `amber-700` border

---

## Screen 10: Admin Console (Tenants, Disputes, Data Integrity)

**Route:** `/admin/dashboard`, `/admin/brands/:id`, `/admin/schema`  
**Screen type:** Internal operations and platform health monitoring console  
**Primary user:** The PRO Edit platform administrators and operations team

---

### Primary User Goal

Monitor platform health, ensure data integrity, manage brand and tenant accounts, review and QA plans, and take operational actions with a full audit trail.

---

### Primary Action

Triage the plan QA queue and resolve pending items. Secondary: respond to brand health alerts.

---

### Access Control

- This entire section is behind admin role authentication
- Admin users are identified by role in the Supabase `users` table (role: `admin`)

> **BUG — HARDCODED EMAIL (CONFIRMED):** The current implementation contains a hardcoded email address used to identify admin users (e.g., `if (user.email === 'admin@theproe.com')`). This is a security vulnerability and a maintenance problem. Replace immediately with a proper role-based access check against the `user_roles` table or a `role` column on the `profiles` table. The admin check must not be email-based under any circumstances in production.

- All admin actions must be audit-logged (see Audit Log section below)
- "Impersonate User" action must create an audit log entry before the impersonation session begins, including: admin user ID, target user ID, timestamp, and reason (required free-text field)

---

### Platform Health Metrics (Top Row)

Six metric cards displayed in a 3×2 grid (desktop) or scrollable horizontal row with wrap (mobile):

| Metric | Display | Refresh |
|---|---|---|
| Total Tenants | Integer | Real-time |
| Plans Generated Today | Integer | Real-time |
| Plans Generated This Week | Integer | Real-time |
| Plans Generated Total | Integer | Real-time |
| Orders Today | Integer + $ value | Real-time |
| Error Rate (last 24h) | Percentage + count | Real-time |

- Real-time: data polls every 60 seconds or uses Supabase Realtime subscription
- Error rate card uses color coding: green (< 1%), amber (1–5%), red (> 5%) — with accessible text labels
- "View Details" link on error rate card: navigates to error log filtered by last 24 hours

---

### Brand Health Matrix

Table: one row per brand, showing catalog completeness.

| Column | Description |
|---|---|
| Brand Name | Linked to `/admin/brands/:id` |
| Protocols Complete | % of protocols with complete descriptions, steps, and required products |
| Products Complete | % of products with image, price, SKU, and description |
| Assets Uploaded | Count of training assets / expected minimum |
| Avg Match Confidence | Average confidence score across all recent matches |
| Status | Healthy / Needs Attention / Critical |

- Status is computed: Healthy = all scores above 80%. Needs Attention = any score 50–79%. Critical = any score below 50%.
- Status column uses color + icon + text label (never color alone)
- Row click: navigates to `/admin/brands/:id` — brand detail and editor
- "Needs Attention" and "Critical" rows are sorted to the top by default
- Export as CSV button for the full matrix

---

### Schema Health (`/admin/schema`)

- Table: one row per critical database table
- Columns: Table Name | Row Count | % Rows with Missing Critical Fields | Last Updated | Status
- "Missing Critical Fields" is defined per-table (configurable in a schema validation config file, not hardcoded in the component)
- Clicking a table row: expands to show which fields are most commonly missing and sample (anonymized) row IDs
- "Run Schema Check" button: triggers a server-side schema validation job and refreshes the table
- Alert if any table has > 10% missing critical fields: shown as a red banner at top of schema view

---

### Plan QA Queue

- Table: plans flagged for human review, sorted by submission date (oldest first)
- Columns: Plan ID | Business Type | Submitted At | Flag Reason | Assigned To | Actions
- Flag reasons: "Low confidence mappings (>50% below 50%)", "AI analysis error", "User dispute", "Unusual revenue estimate", "Manual flag"
- Actions per row:
  - "Review" — opens plan detail in a side panel
  - "Approve" — marks plan as reviewed and clears the flag
  - "Flag for Revision" — marks plan and triggers re-analysis
  - "Assign to Me" — assigns the QA item to the current admin user
- Bulk actions: "Approve All Low-Risk" (confidence flags only)
- Side panel (plan review): shows the original menu text, the mapping results, the gap analysis output, and the confidence scores — all in read-only format

---

### Quick Actions

All quick actions are logged to the audit trail before execution.

| Action | Trigger | Confirmation Required | Audit Log Entry |
|---|---|---|---|
| Approve Brand | Button on brand row | Yes — modal with brand name | admin_id, brand_id, action, timestamp |
| Flag Plan for Review | Button on plan row | Yes — requires reason text | admin_id, plan_id, reason, timestamp |
| Impersonate User | Button in user detail | Yes — requires reason text | admin_id, target_user_id, reason, timestamp |
| Revoke Brand Access | Button on brand detail | Yes — modal with consequences listed | admin_id, brand_id, action, timestamp |
| Trigger Re-Analysis | Button on plan QA row | Yes | admin_id, plan_id, action, timestamp |

- Impersonate User: opens a new browser session as the target user, with a persistent banner: "You are viewing as [User Name]. [End Session]" — banner cannot be dismissed until the impersonation session is explicitly ended.

---

### Commission Reconciliation Table

Route: `/admin/commissions`

| Column | Description |
|---|---|
| Order ID | Linked to order detail |
| Brand | Brand name |
| Order Value | Wholesale order total |
| Commission Rate | % (from brand contract) |
| Commission Amount | Calculated |
| Status | Pending / Paid / Disputed |
| Dispute | "Open Dispute" link if status is Disputed |
| Actions | Mark as Paid, Dispute |

- Export as CSV for accounting
- Summary row at top: Total Pending ($), Total Paid This Month ($), Total Disputed ($)
- "Open Disputes" section: separate table showing only disputed items with dispute reason and resolution status

---

### Audit Log Viewer (`/admin/audit`)

- Full-width table: Timestamp | Admin User | Action | Target (user/brand/plan ID) | Details
- Search: by admin user, action type, date range, target ID
- Filter: by action type (dropdown), date range (date picker)
- Export: CSV export of filtered results
- Details column: expandable inline to show full JSON payload of the audit entry
- Audit log is append-only — no admin user can delete audit entries (enforced at database level via RLS policy)
- Retention: audit logs retained for minimum 2 years

---

### Trust Cues (Internal)

- Data boundary reminder on brand health matrix: "Metrics are aggregated. You are viewing platform-level data, not individual business data, unless you navigate to a specific account."
- Impersonation session banner (described above)
- All audit log entries display the admin's name (not just ID) for accountability

---

### Accessibility Requirements (WCAG 2.1 AA)

- All data tables must use `<th scope>` appropriately
- Status badges must use text + icon + color (never color alone)
- Confirmation modals must trap focus and have a visible close button
- Impersonation banner must have `role="alert"` so screen readers announce it immediately on session start
- Search and filter controls must have visible labels

---

### Bug: Slug Collision on Brand Create

> **BUG — NO SLUG COLLISION CHECK (CONFIRMED):** When a new brand is created via the admin console (or brand signup flow), the slug is generated from the brand name without checking for existing slugs in the database. If two brands with similar names are created, one slug will silently overwrite or conflict with the other, resulting in routing errors or data association failures. Fix: before saving a new brand record, query the `brands` table for the proposed slug. If it exists, append a numeric suffix (e.g., `-2`, `-3`) and confirm with the admin user before saving. Alternatively, expose the slug field as an editable input during brand creation so an admin can resolve collisions manually.

---

### Mobile Layout

- Platform health metrics: 2-column grid, scrollable
- Brand health matrix: horizontally scrollable table with sticky Brand Name column
- Plan QA queue: card layout per item with action buttons at the bottom of each card
- Audit log: horizontally scrollable table, date and action as the primary visible columns
- Quick actions: accessible via a "..." menu per row on mobile

---

### Design Tokens for This Screen

- Page background: `pro-ivory`
- Admin chrome / sidebar: `pro-navy` background, white text
- Metric cards: white background, `pro-navy` figure
- Status: Healthy — `green-100`/`green-700`, Needs Attention — `amber-100`/`amber-700`, Critical — `red-100`/`red-700`
- Table: white background, `pro-stone` borders
- Quick action buttons: `pro-navy` background, white text
- Impersonation banner: `amber-500` background, `pro-charcoal` text — high visibility, cannot be missed
- Audit log: `pro-cream` background

---

## Summary of All Confirmed Bugs

The following bugs were identified during the codebase audit and are referenced throughout this document. They are collected here for engineering triage.

| Bug ID | Screen | Severity | Description | Fix Required |
|---|---|---|---|---|
| BUG-001 | Screen 1 — Onboarding | Critical | Race condition: `navigate()` is called before the save Promise resolves, leaving the user on an empty gap analysis screen | Move `navigate()` inside `.then()` or after `await` on the save operation. Never in `finally` or parallel. |
| BUG-002 | Screen 1 — Onboarding | High | Unguarded `Promise.all`: if any sub-task fails, the entire analysis fails silently | Replace with `Promise.allSettled()` or sequential `try/catch` per step |
| BUG-003 | Screen 10 — Admin | Critical | Hardcoded email used for admin role check: security vulnerability and maintenance failure | Replace with role-based check against `user_roles` table or `role` column on `profiles` |
| BUG-004 | Screen 10 — Admin | High | No slug collision check when creating a new brand | Check for slug existence before save; append suffix or expose slug as editable field |

---

*End of SCREEN REQUIREMENTS document.*  
*Version 1.0 — 2026-02-22 — The PRO Edit Platform*
