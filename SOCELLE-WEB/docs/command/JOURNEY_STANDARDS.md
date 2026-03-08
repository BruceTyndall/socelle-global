# SOCELLE — Journey Standards

> Updated to align with `V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` on 2026-03-08.
> Authority: `V3_BUILD_PLAN.md` → `V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` §D (Anti-Shell Rule)
> Related: `MODULE_BOUNDARIES.md`, `GLOBAL_SITE_MAP.md`, `CMS_ARCHITECTURE.md`

---

## §1 — Purpose

Every hub must define tested user journeys — the path a user takes from entry to outcome. A journey is not a wireframe or a sitemap. It is a **testable sequence of actions** that proves the hub is functional, not a shell.

### Doc Gate Rule

Before any hub can be marked non-shell, its journeys listed here must be:
1. **Defined** — entry point, actions, outcome documented
2. **Implemented** — every step has a working UI surface backed by real data
3. **Tested** — Playwright or manual test confirms the journey end-to-end

If a journey cannot be completed, the hub is a shell. Full stop.

---

## §2 — Journey Template

Every journey follows this format:

```
JOURNEY: [Journey Name]
Hub: [Hub Name]
Persona: [Operator | Provider | Brand | Student | Admin]
Entry: [URL or trigger]
Steps:
  1. [Action] → [Expected result]
  2. [Action] → [Expected result]
  ...
Outcome: [What the user has achieved]
Data: [Which tables are read/written]
Anti-Shell Check: [Which of the 10 requirements this journey exercises]
```

---

## §3 — Intelligence Hub Journeys

### JOURNEY: View Market Signals
- **Hub:** Intelligence
- **Persona:** Operator, Provider, Brand
- **Entry:** `/intelligence`
- **Steps:**
  1. Page loads → Signal table renders with live `market_signals` data
  2. User views KPI strip → Key metrics from aggregated signals display
  3. User clicks signal row → Signal detail expands with source, confidence, provenance
  4. User filters by category → Table filters, URL updates
  5. User searches signals → Server-side search returns matching signals
- **Outcome:** User understands current market conditions in their category
- **Data:** `market_signals` (read), `data_feeds` (provenance join)
- **Anti-Shell Check:** Library view, Detail view, Intelligence input (signals ARE the primary object)

### JOURNEY: Generate Intelligence Brief
- **Hub:** Intelligence
- **Persona:** Pro, Enterprise
- **Entry:** `/intelligence` → "Generate Brief" CTA
- **Steps:**
  1. User clicks "Generate Brief" → AI orchestrator invoked
  2. Brief generated → Stored as `cms_posts` (space="intelligence")
  3. User views brief → Full brief with citations, confidence scores
  4. Credits deducted → `tenant_balances` updated
  5. User exports brief → PDF download (Pro+)
- **Outcome:** User has actionable intelligence brief with citations
- **Data:** `market_signals` (read), `cms_posts` (write), `tenant_balances` (write)
- **Anti-Shell Check:** Create action, Export, Intelligence input

### JOURNEY: Export Signals
- **Hub:** Intelligence
- **Persona:** Pro, Enterprise
- **Entry:** `/intelligence` → Export button
- **Steps:**
  1. User clicks Export → Format selection (CSV, PDF for Pro+)
  2. User selects filters → Export scoped to current view
  3. Download triggers → File generated and downloaded
- **Outcome:** User has signal data in portable format
- **Data:** `market_signals` (read)
- **Anti-Shell Check:** Export

---

## §4 — Jobs Hub Journeys

### JOURNEY: Browse Job Postings
- **Hub:** Jobs
- **Persona:** Provider, Student
- **Entry:** `/jobs`
- **Steps:**
  1. Page loads → Job listings from `job_postings` table
  2. User filters by category/location → Results update
  3. User clicks job → Detail page with full description
  4. User clicks Apply → External link or in-app application
- **Outcome:** User finds relevant job opportunities
- **Data:** `job_postings` (read)
- **Anti-Shell Check:** Library view, Detail view

### JOURNEY: Post a Job (Operator)
- **Hub:** Jobs
- **Persona:** Operator
- **Entry:** `/portal/jobs/new`
- **Steps:**
  1. User fills job posting form → Title, description, requirements, salary range
  2. User submits → Row inserted in `job_postings`
  3. Posting appears in `/jobs` listing → Visible to all users
  4. User edits posting → Update applied
  5. User closes posting → Status changed to closed
- **Outcome:** Operator has active job listing reaching providers
- **Data:** `job_postings` (write), `businesses` (read for business context)
- **Anti-Shell Check:** Create action, Edit+Delete, Permissions (RLS: only own postings)

---

## §5 — CRM Hub Journeys

### JOURNEY: Manage Contacts
- **Hub:** CRM
- **Persona:** Operator
- **Entry:** `/portal/crm`
- **Steps:**
  1. User views contact list → All contacts for their business
  2. User adds new contact → Form with name, email, phone, tags
  3. Contact saved → Row in `contacts` table
  4. User views contact detail → Full history, notes, activities
  5. User adds note → Activity logged
  6. User edits contact → Update applied
  7. User archives contact → Soft delete
- **Outcome:** Operator has organized client database
- **Data:** `contacts` (CRUD), `activities` (write), `notes` (write)
- **Anti-Shell Check:** Create, Library, Detail, Edit+Delete, Permissions

### JOURNEY: Track Client Treatment History
- **Hub:** CRM
- **Persona:** Operator, Provider
- **Entry:** `/portal/crm/:contactId`
- **Steps:**
  1. User views client detail → Treatment history tab
  2. User adds treatment record → Service, products used, notes, photos
  3. Record saved → Row in `client_treatment_records`
  4. User views history timeline → Chronological list of treatments
  5. User exports client history → CSV download
- **Outcome:** Complete treatment history for client consultations
- **Data:** `client_treatment_records` (CRUD), `contacts` (read)
- **Anti-Shell Check:** Create, Library, Detail, Export

---

## §6 — Education Hub Journeys

### JOURNEY: Browse & Enroll in Course
- **Hub:** Education
- **Persona:** Provider, Student
- **Entry:** `/education`
- **Steps:**
  1. User browses course catalog → Courses from `brand_training_modules`
  2. User views course detail → Full description, modules, duration
  3. User enrolls → Row in `enrollments`
  4. User starts module → Progress tracked
  5. User completes quiz → Score recorded
  6. User earns certificate → Certificate generated
- **Outcome:** User has completed training and earned credential
- **Data:** `brand_training_modules` (read), `enrollments` (write), `quiz_attempts` (write), `certificates` (write)
- **Anti-Shell Check:** Library, Detail, Create (enrollment), Proof/metrics (progress)

### JOURNEY: Read Education Content
- **Hub:** Education
- **Persona:** Provider, Student
- **Entry:** `/education` → Articles section
- **Steps:**
  1. User browses education articles → `cms_posts` (space="education")
  2. User reads article → Full article with related content
  3. User bookmarks article → Saved to profile (future)
- **Outcome:** User has consumed educational content
- **Data:** `cms_posts` (read)
- **Anti-Shell Check:** Library, Detail

---

## §7 — Marketing Hub Journeys

### JOURNEY: Create Campaign
- **Hub:** Marketing
- **Persona:** Operator, Brand
- **Entry:** `/portal/marketing/campaigns/new` or `/brand/marketing/campaigns/new`
- **Steps:**
  1. User selects campaign type → Email, social, or landing page
  2. User defines audience → Segment from contacts
  3. User creates content → Using CMS blocks or templates
  4. User previews → Full preview of campaign output
  5. User schedules/sends → Campaign activated
  6. User views analytics → Open rates, clicks, conversions
- **Outcome:** User has executed a marketing campaign with measurable results
- **Data:** `campaigns` (CRUD), `cms_pages` (read for templates), `contacts` (read for segments)
- **Anti-Shell Check:** Create, Library, Detail, Edit, Proof/metrics

---

## §8 — Sales Hub Journeys

### JOURNEY: Manage Sales Pipeline
- **Hub:** Sales
- **Persona:** Brand
- **Entry:** `/brand/sales/pipeline`
- **Steps:**
  1. User views pipeline → Kanban board with deal stages
  2. User creates deal → Name, value, contact, expected close
  3. User moves deal between stages → Drag-and-drop or edit
  4. User logs activity → Call, email, meeting logged against deal
  5. User views deal detail → Full history, notes, documents
  6. User closes deal → Won/lost status, revenue recorded
  7. User exports pipeline → CSV download
- **Outcome:** User has visibility into sales pipeline and revenue forecast
- **Data:** `deals` (CRUD), `activities` (write), `contacts` (read)
- **Anti-Shell Check:** Create, Library, Detail, Edit+Delete, Export, Proof/metrics

---

## §9 — Commerce Hub Journeys

### JOURNEY: Browse & Purchase Products
- **Hub:** Commerce
- **Persona:** Operator, Provider
- **Entry:** `/brands/:slug` → Products section
- **Steps:**
  1. User browses brand storefront → Products from `products` table
  2. User views product detail → Full product info, variants, pricing
  3. User adds to cart → `cart_items` updated
  4. User proceeds to checkout → Stripe checkout session
  5. User completes payment → Order created, confirmation email
  6. User views order history → `/portal/orders`
- **Outcome:** User has purchased professional products
- **Data:** `products` (read), `cart_items` (write), `orders` (write)
- **Anti-Shell Check:** Library, Detail, Create (order), Proof/metrics (order history)

---

## §10 — Admin Hub Journeys

### JOURNEY: Manage CMS Content
- **Hub:** Admin
- **Persona:** Admin
- **Entry:** `/admin/cms`
- **Steps:**
  1. Admin views CMS dashboard → Page/post/media counts
  2. Admin creates new page → Select template, add blocks, set SEO
  3. Admin adds blocks → Block editor with type selection
  4. Admin previews page → PageRenderer preview
  5. Admin publishes → Status → published, appears publicly
  6. Admin edits published page → Updates content, re-publishes
  7. Admin archives page → Hidden from public
- **Outcome:** Admin has published content visible on public site
- **Data:** `cms_pages` (CRUD), `cms_blocks` (CRUD), `cms_page_blocks` (CRUD)
- **Anti-Shell Check:** Create, Library, Detail, Edit+Delete, Permissions (admin only)

### JOURNEY: Monitor Platform Health
- **Hub:** Admin
- **Persona:** Admin
- **Entry:** `/admin`
- **Steps:**
  1. Admin views dashboard → Key platform metrics
  2. Admin checks feed status → `/admin/feeds` — feed health, last run
  3. Admin checks user activity → Access requests, signups, active users
  4. Admin reviews signals → `/admin/market-signals` — signal freshness
  5. Admin exports report → CSV of platform metrics
- **Outcome:** Admin has visibility into platform health and can act on issues
- **Data:** Multiple admin tables (read), `data_feeds` (read), `access_requests` (read)
- **Anti-Shell Check:** Library, Detail, Proof/metrics, Export

---

## §11 — Authoring Studio Journeys

### JOURNEY: Author & Publish Content
- **Hub:** Authoring Studio
- **Persona:** Admin, Brand (with author role)
- **Entry:** `/admin/cms/posts/new`
- **Steps:**
  1. Author selects content type → Blog post, brief, guide
  2. Author selects space → Blog, intelligence, education, etc.
  3. Author writes content → Rich editor with block insertion
  4. Author adds media → Upload or select from media library
  5. Author sets SEO → Title, description, OG image
  6. Author previews → Full preview with PageRenderer
  7. Author submits for review → Status = draft, reviewer notified (future)
  8. Admin publishes → Status → published
- **Outcome:** Content published and visible on appropriate public surface
- **Data:** `cms_posts` (CRUD), `cms_assets` (read/write), `cms_blocks` (read/write)
- **Anti-Shell Check:** Create, Detail, Edit, Permissions

---

## §12 — CMS Hub Journeys

### JOURNEY: Manage Content Spaces
- **Hub:** CMS
- **Persona:** Admin
- **Entry:** `/admin/cms/spaces`
- **Steps:**
  1. Admin views space list → All configured spaces
  2. Admin creates space → Name, slug, description, settings
  3. Admin configures space → Allowed block types, default template
  4. Admin views space content → Filtered page/post list for space
- **Outcome:** Content is organized by hub with clear boundaries
- **Data:** `cms_spaces` (CRUD)
- **Anti-Shell Check:** Create, Library, Detail, Edit+Delete

### JOURNEY: SEO Audit
- **Hub:** CMS
- **Persona:** Admin
- **Entry:** `/admin/cms` → SEO tab
- **Steps:**
  1. Admin views SEO report → Pages/posts missing meta, OG, schema
  2. Admin clicks flagged item → Opens editor with SEO fields highlighted
  3. Admin fills SEO fields → Saves
  4. Admin re-runs audit → Issue resolved
- **Outcome:** All published content has complete SEO metadata
- **Data:** `cms_pages` (read), `cms_posts` (read)
- **Anti-Shell Check:** Proof/metrics, Observability

---

## §13 — Cross-Hub Journey: Intelligence → Action

The defining SOCELLE journey — intelligence creates value in other hubs.

### JOURNEY: Signal → Service Menu Update
- **Entry:** Intelligence Hub (signal detected)
- **Steps:**
  1. Signal appears → "LED therapy demand up 34% in your metro"
  2. User clicks signal → Detail with confidence, sources, trend
  3. User clicks "Create Action Plan" → AI generates service menu recommendation
  4. Action plan stored → `cms_posts` (space="intelligence")
  5. User navigates to service menu → `/portal/services`
  6. User adds new service based on recommendation → `booking_services` row
  7. Service visible to clients → Bookable
- **Data Flow:** `market_signals` → AI orchestrator → `cms_posts` → user action → `booking_services`

### JOURNEY: Signal → Education Content
- **Entry:** Intelligence Hub
- **Steps:**
  1. Signal detected → New ingredient trending
  2. Admin creates education article → `cms_posts` (space="education")
  3. Article references signal → Source attribution
  4. Article published → Visible on `/education`
  5. Provider reads article → Informed about trending ingredient
- **Data Flow:** `market_signals` → admin → `cms_posts` → public

---

## §14 — Testing Requirements

### Per Journey

Each journey must have:
1. **Manual test script** — step-by-step instructions a human can follow
2. **Playwright smoke test** — automated test covering critical path
3. **Data preconditions** — what must exist in DB for the journey to work
4. **Expected error states** — what happens when data is missing or user lacks permissions

### Playwright Test Pattern

```typescript
test('Intelligence: view market signals', async ({ page }) => {
  await page.goto('/intelligence');
  // Signal table renders
  await expect(page.locator('[data-testid="signal-table"]')).toBeVisible();
  // At least one signal row
  await expect(page.locator('[data-testid="signal-row"]').first()).toBeVisible();
  // Click signal row → detail expands
  await page.locator('[data-testid="signal-row"]').first().click();
  await expect(page.locator('[data-testid="signal-detail"]')).toBeVisible();
});
```

### Coverage Target

- Every hub: at least 1 primary journey has Playwright test
- All Create/Edit/Delete actions tested
- All permission gates tested (unauthorized user → redirect or error)
- All empty states tested (no data → proper empty state UI)

---

*Journey Standards v1.0 — 2026-03-08 — Governed by V3_BUILD_PLAN.md + V1 §D (Anti-Shell Rule)*
