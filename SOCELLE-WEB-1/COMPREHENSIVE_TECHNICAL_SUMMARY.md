# COMPREHENSIVE TECHNICAL & UX SUMMARY
## Naturopathica Planning Application

**Last Updated:** January 22, 2026
**Purpose:** Complete overview for external product consultant

---

## 1. ARCHITECTURE OVERVIEW

### Tech Stack

**Frontend:**
- **Framework:** React 18.3.1 with TypeScript 5.5.3
- **Build Tool:** Vite 5.4.2
- **Routing:** React Router DOM 7.12.0
- **Styling:** Tailwind CSS 3.4.1
- **Icons:** Lucide React 0.344.0
- **State Management:** React Context API (no Redux/Zustand)

**Backend:**
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (email/password)
- **Storage:** Supabase (for future file uploads)
- **API:** Direct Supabase client calls (no separate API layer)

**Hosting:**
- Frontend: Vite build (can deploy to Vercel, Netlify, etc.)
- Database: Supabase cloud instance

### Project Structure

```
/src
  /components          # Reusable UI components + admin views
  /layouts             # SpaLayout (end-user) + AdminLayout
  /lib                 # Business logic, engines, utilities
  /pages
    /spa               # End-user portal pages
    /admin             # Admin portal pages
  App.tsx              # Root routing
  main.tsx             # Entry point

/supabase
  /migrations          # Database schema migrations (11 files)

/public                # Static assets (58 PDF protocol files)
```

### Routing Architecture

**Two Distinct Portals:**
1. **Spa End-User Portal:** `/` routes with `SpaLayout`
2. **Admin Portal:** `/admin` routes with `AdminLayout`

Both use `ProtectedRoute` wrapper for authentication checks.

### State Management

- **Global State:** React Context (`AuthProvider` in `src/lib/auth.tsx`)
- **Local State:** Component-level `useState` hooks
- **Data Fetching:** Direct Supabase queries (no caching layer like React Query)
- **No centralized state management library**

### External Integrations

- **Supabase:** Authentication, database, RLS
- **No AI APIs currently integrated** (OpenAI references exist but not implemented)
- **No payment processing**
- **No email service integration**

---

## 2. DATABASE SCHEMA

### Complete Table List (40 tables)

#### **CORE CONTENT TABLES** (Used by Intelligence Engines)

| Table Name | Purpose | Row Count | Admin Editable |
|------------|---------|-----------|----------------|
| `canonical_protocols` | Master protocol library | 47 | ✅ Yes |
| `canonical_protocol_steps` | Step-by-step protocol instructions | 0 | ✅ Yes |
| `canonical_protocol_step_products` | Products used in each step | 0 | ✅ Yes |
| `pro_products` | Professional backbar products | 27 | ✅ Yes |
| `retail_products` | Retail products for client purchase | 35 | ✅ Yes |
| `marketing_calendar` | 2026 monthly marketing themes | 12 | ✅ Yes |
| `mixing_rules` | Product mixing/contraindication rules | 0 | ✅ Yes |
| `protocol_costing` | Cost of goods per protocol | 0 | ✅ Yes |
| `treatment_costs` | Individual treatment costs | 0 | ✅ Yes |

#### **BUSINESS RULES TABLES** (Admin Configuration)

| Table Name | Purpose | Row Count | Admin Editable |
|------------|---------|-----------|----------------|
| `service_category_benchmarks` | Min service counts per spa type | 15 | ✅ Yes |
| `revenue_model_defaults` | Default utilization/attach rates | 3 | ✅ Yes |
| `pricing_uplift_rules` | Pricing optimization rules | 0 | ✅ Yes |
| `retail_attach_rules` | PRO→Retail pairing rules | 0 | ✅ Yes |
| `brand_differentiation_points` | Sales talking points | 6 | ✅ Yes |

#### **MEDSPA REFERENCE TABLES** (Static Data)

| Table Name | Purpose | Row Count |
|------------|---------|-----------|
| `medspa_products` | Products for medspa positioning | 36 |
| `medspa_treatments` | Common medspa treatments | 5 |
| `medspa_product_kits` | Pre-configured product bundles | 4 |

#### **SPA END-USER SUBMISSION FLOW**

| Table Name | Purpose | Row Count | RLS Enabled |
|------------|---------|-----------|-------------|
| `plan_submissions` | User-initiated plan requests | 0 | ✅ Yes |
| `spa_menus` | Parsed spa menus | 0 | ✅ Yes |
| `spa_services` | DEPRECATED (use spa_menu_services) | 0 | ✅ Yes |

**New Schema (Post-Refactor):**
- `spa_menu_services` - Individual services from parsed menu
- `protocol_mappings` - Service→Protocol mappings
- `service_gaps` - Identified menu gaps
- `retail_attach_recommendations` - Retail attach suggestions

#### **ANALYSIS OUTPUT TABLES**

| Table Name | Purpose | Row Count | Notes |
|------------|---------|-----------|-------|
| `spa_service_mapping` | Service→Protocol matches | 0 | Admin reviewable |
| `service_gap_analysis` | Identified service gaps | 0 | Admin reviewable |
| `retail_attach_recommendations` | Retail product suggestions | 0 | Admin reviewable |
| `implementation_readiness` | Training/complexity scoring | 0 | Admin reviewable |
| `phased_rollout_plans` | 30/60/90 day plans | 0 | Admin reviewable |
| `rollout_plan_items` | Individual plan items | 0 | - |
| `opening_orders` | Product opening orders | 0 | - |
| `plan_outputs` | Final generated plans | 0 | Shareable/versionable |
| `plan_sections` | Modular plan content sections | 0 | - |

#### **SALES PIPELINE TABLES** (Admin Use)

| Table Name | Purpose | Row Count |
|------------|---------|-----------|
| `spa_leads` | Sales prospects | 0 |
| `lead_activities` | Activity timeline (calls, notes) | 0 |

#### **SYSTEM TABLES**

| Table Name | Purpose | Row Count |
|------------|---------|-----------|
| `user_profiles` | Auth extension table | 1 |
| `document_ingestion_log` | PDF extraction tracking | 0 |
| `ai_concierge_chat_logs` | Concierge conversation logs | 1 |
| `ai_concierge_approved_tables` | AI data access whitelist | 14 |
| `ai_concierge_starter_questions` | Contextual starter prompts | 14 |
| `admin_activity_log` | Admin action audit trail | 0 |

### Data Flow for Plan Creation

**1. Spa User Initiates Plan:**
```
plan_submissions (INSERT with status='draft')
  ↓
spa_menus (INSERT with raw_menu_text)
  ↓
spa_menu_services (INSERT parsed services)
```

**2. Analysis Engines Run:**
```
mappingEngine → protocol_mappings (service→protocol matches)
gapAnalysisEngine → service_gaps (missing categories)
retailAttachEngine → retail_attach_recommendations (retail suggestions)
openingOrderEngine → opening_orders (product order)
```

**3. Plan Output Generated:**
```
plan_outputs (INSERT with output_data JSON)
  ↓
plan_submissions.plan_output_id (UPDATE)
  ↓
plan_submissions.submission_status = 'completed'
```

### Row Level Security (RLS)

**All tables have RLS enabled.**

**Spa Users:**
- Can only see their own `plan_submissions`
- Can only see their own `spa_menus`
- Cannot see other spas' data

**Admins:**
- Full read/write access to all tables
- Differentiated by `user_profiles.role = 'admin'`

**Current Issue:** Some tables may not have complete RLS policies, needs audit.

---

## 3. CURRENT ROUTES & PAGES

### Spa End-User Portal Routes

| Route | Purpose | Status | Notes |
|-------|---------|--------|-------|
| `/` | Public home/landing | ✅ Complete | Marketing page |
| `/login` | Spa user login | ✅ Complete | Email/password |
| `/signup` | Spa user registration | ✅ Complete | Creates user_profile |
| `/dashboard` | Main dashboard | 🟡 Functional but basic | Shows plan_submissions list |
| `/plans` | Plan list view | ✅ Complete | Lists all user plans |
| `/plans/:id` | Plan detail/results | ✅ Complete | Tabbed plan output |
| `/plan/new` | Plan creation wizard | ✅ Complete | 3-step wizard |
| `/concierge` | AI Concierge chat | 🟡 Partially implemented | UI exists, AI backend incomplete |

### Admin Portal Routes

| Route | Purpose | Status | Notes |
|-------|---------|--------|-------|
| `/admin/login` | Admin login | ✅ Complete | Separate from spa login |
| `/admin/inbox` | Submission queue | ✅ Complete | Lists all plan_submissions |
| `/admin/submissions/:id` | Review submission | ❌ Placeholder | "Coming soon" message |
| `/admin/ingestion` | PDF data extraction | ✅ Complete | Extracts from `/public/*.pdf` |
| `/admin/protocols` | Protocol management | ✅ Complete | CRUD for canonical_protocols |
| `/admin/products` | PRO + Retail products | ✅ Complete | Split view, CRUD |
| `/admin/calendar` | Marketing calendar | ✅ Complete | 2026 calendar view/edit |
| `/admin/mixing` | Mixing rules | ✅ Complete | CRUD for mixing_rules |
| `/admin/costs` | Cost management | ✅ Complete | Protocol costing |
| `/admin/rules` | Business rules config | ✅ Complete | Category benchmarks, revenue defaults |
| `/admin/health` | Schema health dashboard | ✅ Complete | Table row counts, missing data flags |

---

## 4. SPA END-USER PORTAL

### Current Features

#### ✅ Working Features:
1. **Authentication:**
   - Email/password signup with spa name
   - Login/logout
   - Session persistence

2. **Dashboard:**
   - Shows total plans, in-progress, completed counts
   - Lists all plan_submissions
   - "Create New Plan" CTA
   - Basic stats (no revenue projections)

3. **Plan Wizard (3 steps):**
   - Step 1: Spa details (name, type, location)
   - Step 2: Menu input (paste text menu)
   - Step 3: Analysis loading state
   - Parses format: "Service Name - 60 min - $150"

4. **Plan Results:**
   - Tabbed interface: Overview, Gaps, Mappings, Retail, Opening Order
   - Summary stats at top
   - Service list with pricing
   - Gap analysis with priority levels
   - Protocol mappings with confidence scores
   - Retail recommendations
   - Opening order product table

5. **AI Concierge:**
   - Full-page chat UI
   - Starter question suggestions
   - NOT CONNECTED TO REAL AI (placeholder responses)

### Current User Flow

```
1. Spa owner signs up → user_profiles created
2. Logs in → Redirected to /dashboard
3. Clicks "Create New Plan" → /plan/new
4. Fills out spa details → Next
5. Pastes menu text → "Generate Plan"
6. Orchestrator runs:
   - Parses menu
   - Creates spa_menu + spa_menu_services
   - Runs mappingEngine (47 protocols loaded, requires step completion)
   - Runs gapAnalysisEngine (47 protocols loaded, requires step completion)
   - Runs retailAttachEngine (broken - no protocol mappings)
   - Creates plan_outputs with JSON data
7. Redirected to /plans/:id
8. Views tabbed results
```

### Content Currently Surfaced to Spa Users

**Visible:**
- ✅ Their own parsed services (name, duration, price, category)
- ✅ Protocol mapping results (if protocols exist)
- ✅ Service gaps (if analysis ran successfully)
- ✅ Retail recommendations (if generated)
- ✅ Opening order (if generated)

**NOT Visible:**
- ❌ Protocol library (no browsing UI)
- ❌ Product library (no browsing UI)
- ❌ Marketing calendar
- ❌ Training requirements
- ❌ Implementation timelines
- ❌ Revenue projections
- ❌ Seasonal recommendations

### Content in Database But NOT Surfaced

**High Value, Not Accessible:**
1. **Protocol Library:** 47 protocols loaded (need step completion via `/admin/protocols`)
2. **PRO Products:** 27 products (no spa-facing UI)
3. **Retail Products:** 35 products (no spa-facing UI)
4. **Marketing Calendar:** 12 months of themes (not shown to spas)
5. **Training Requirements:** In protocol_steps, not shown
6. **Seasonal Windows:** In marketing_calendar, not referenced
7. **Product Mixing Rules:** Loaded but not displayed
8. **Cost Analysis:** Not shown to spas
9. **MedSpa Reference Data:** 36 medspa products, 5 treatments, 4 kits (not shown)

### Pain Points & Incomplete Areas

**Critical UX Issues:**
1. **Empty Analysis:**
   - 47 protocols loaded with basic metadata (steps need manual completion)
   - No warning to user BEFORE they create a plan
   - No explanation of why results are empty

2. **No Content Discovery:**
   - Can't browse protocols before committing to a plan
   - Can't explore products without generating a plan
   - No educational content

3. **Data Tables Without Context:**
   - Plan results are raw data dumps
   - No "What does this mean for your business?"
   - No "What to do next" guidance

4. **AI Concierge Misleading:**
   - Has UI but doesn't work
   - Sets wrong expectations

5. **No Onboarding:**
   - No tour, tooltips, or first-time guidance
   - Spa owners don't know what to expect

6. **Mobile Responsiveness:**
   - Exists but not optimized
   - Tables don't work well on mobile

---

## 5. ADMIN PORTAL

### Current Features

#### ✅ Working Features:

1. **Inbox (Submission Queue):**
   - Lists all plan_submissions
   - Shows status, spa name, dates
   - Can click to view (but detail page is placeholder)

2. **Ingestion System:**
   - Lists all `/public/*.pdf` files (58 protocol PDFs)
   - Can select and extract protocols
   - Writes to `canonical_protocols`, `canonical_protocol_steps`, `canonical_protocol_step_products`
   - Uses PDF parsing (pdfExtractionService.ts)

3. **Protocol Management:**
   - Table view of canonical_protocols
   - Can view/edit protocol details
   - Shows completion status
   - Can manually add protocols

4. **Product Management:**
   - Split view: PRO products | Retail products
   - CRUD operations
   - Shows pricing, status, categories

5. **Marketing Calendar:**
   - 12-month view for 2026
   - Shows themes, featured products, webinars
   - Editable

6. **Business Rules:**
   - Service category benchmarks (min service counts)
   - Revenue model defaults (utilization, attach rates)
   - Editable with notes

7. **Schema Health:**
   - Table row counts
   - Missing data flags
   - RLS status
   - Quick diagnostics

### Missing Admin Functionality

**Critical Gaps:**
1. **No Submission Review Workflow:**
   - Can't view individual submission details
   - Can't approve/reject plans
   - Can't add admin notes
   - Route exists but shows "Coming soon"

2. **No Manual Plan Editing:**
   - Can't override AI recommendations
   - Can't customize plans before sending

3. **No Lead Management:**
   - `spa_leads` table exists but no UI
   - `lead_activities` not accessible
   - No CRM-like features

4. **No Plan Publishing:**
   - Can't mark plans as "ready to send"
   - Can't generate shareable links
   - Can't export as PDF

5. **No Data Quality Tools:**
   - Can't bulk-edit protocols
   - Can't validate product-protocol links
   - No data integrity checker

6. **No Analytics:**
   - Can't see which protocols are most recommended
   - Can't see common gaps across spas
   - No usage metrics

---

## 6. PLAN CREATION FLOW (DETAILED)

### Current Working Flow

**Step 1: User Input (PlanWizard.tsx)**
```
User enters:
  - Spa name
  - Spa type (spa/medspa/hybrid)
  - Location (optional)
  - Menu text (multi-line, format: "Service - 60 min - $150")
```

**Step 2: Plan Submission Created**
```
POST to plan_submissions:
{
  user_id: auth_user_id,
  spa_name: "Example Spa",
  spa_type: "spa",
  spa_location: "NYC",
  submission_status: "draft",
  menu_uploaded: false
}
```

**Step 3: Orchestrator Runs (planOrchestrator.ts)**

```javascript
orchestratePlanGeneration(submissionId, menuText, userId)
  ↓
1. parseMenuText(menuText)
   → Extracts: service_name, duration_minutes, price, category
   → Uses regex: /^(.*?)\s*-\s*(\d+)\s*min\s*-\s*\$(\d+)/
   → Infers category from service name

2. Create spa_menus record
   → Stores raw_menu_text
   → Stores total_services_count, category counts

3. Insert spa_menu_services (bulk)
   → One row per parsed service

4. performServiceMapping(menuId)
   → Queries canonical_protocols
   → Matches spa services to protocols
   → Scores: name similarity, duration, category, concerns
   → Inserts to protocol_mappings

5. performGapAnalysis(menuId, spaType)
   → Queries service_category_benchmarks
   → Compares spa's category counts to benchmarks
   → Identifies missing categories
   → Recommends protocols to fill gaps
   → Inserts to service_gaps

6. generateAllRetailAttachForMenu(menuId)
   → Queries protocol_mappings
   → Queries retail_attach_rules
   → Queries retail_products
   → Generates retail product recommendations
   → Inserts to retail_attach_recommendations

7. Generate opening order
   → Queries pro_products
   → Calculates quantities (placeholder logic)
   → Stores in opening_orders

8. Create plan_outputs record
   → output_data = {
       summary: { totalServices, mappedServices, identifiedGaps, retailOpportunities, openingOrderTotal },
       services: [...],
       mappings: [...],
       gaps: [...],
       retailRecommendations: [...],
       openingOrder: [...]
     }

9. Update plan_submissions
   → submission_status = "completed"
   → analysis_completed = true
   → plan_generated = true
   → plan_output_id = output_id

10. Redirect user to /plans/:id
```

### What Happens at Each Step (Backend)

**Database Writes:**
1. `plan_submissions` - 1 INSERT, 3 UPDATEs
2. `spa_menus` - 1 INSERT
3. `spa_menu_services` - N INSERTs (N = number of services)
4. `protocol_mappings` - M INSERTs (M = number of mappable services)
5. `service_gaps` - G INSERTs (G = number of gaps)
6. `retail_attach_recommendations` - R INSERTs (R = recommendations)
7. `opening_orders` - 1 INSERT
8. `plan_outputs` - 1 INSERT

**Total DB Operations:** ~10-50 queries depending on menu size

### Plan Output Structure

**JSON Schema (plan_outputs.output_data):**
```json
{
  "summary": {
    "totalServices": 12,
    "mappedServices": 8,
    "identifiedGaps": 3,
    "retailOpportunities": 15,
    "openingOrderTotal": 2450.00
  },
  "services": [
    {
      "service_name": "Signature Facial",
      "duration_minutes": 60,
      "price": 150,
      "category": "FACIALS"
    }
  ],
  "mappings": [
    {
      "serviceName": "Signature Facial",
      "solutionType": "CANONICAL_PROTOCOL",
      "solutionReference": "Pure Results Facial",
      "matchType": "Partial",
      "confidence": "High",
      "rationale": "Duration and category match"
    }
  ],
  "gaps": [
    {
      "gap_category": "Body Treatments",
      "gap_description": "No body wraps or scrubs offered",
      "priority_level": "High",
      "rationale": "Comparable spas have 3-5 body treatments"
    }
  ],
  "retailRecommendations": [
    {
      "serviceName": "Signature Facial",
      "productName": "Vitamin C Serum",
      "rationale": "Used in protocol, high client interest",
      "strategy": "Cross-sell"
    }
  ],
  "openingOrder": [
    {
      "productName": "Sweet Birch Cleansing Gel",
      "quantity": 3,
      "unitPrice": 45.00,
      "totalCost": 135.00
    }
  ]
}
```

### Intelligence Generated

**1. Service Mapping Intelligence:**
- Matches spa services to canonical protocols
- Confidence scoring (High/Medium/Low)
- Rationale for each match
- Identifies unmappable services

**2. Gap Analysis Intelligence:**
- Compares menu to category benchmarks
- Identifies missing service types
- Prioritizes gaps (High/Medium/Low)
- Recommends specific protocols to fill gaps

**3. Retail Attach Intelligence:**
- Links services to retail products
- Based on protocol product usage
- Estimates attach rates
- Suggests selling strategies

**4. Opening Order Intelligence:**
- Lists required PRO products
- Calculates quantities (currently placeholder)
- Estimates initial investment
- Organizes by product type

**5. Implementation Readiness (Partial):**
- Training complexity scoring
- Prerequisites identification
- Risk assessment
- NOT CURRENTLY SHOWN IN UI

---

## 7. CONTENT LIBRARIES

### Protocol Content

**Database Table:** `canonical_protocols`

**Current State:** 47 protocols loaded (basic metadata only, steps incomplete)

**Protocol Breakdown by Category:**
- Facials: 21 protocols
- Massage: 7 protocols
- Body Treatments: 4 protocols
- Hand Treatments: 3 protocols
- Eye Treatments: 2 protocols
- Foot Treatments: 2 protocols
- Scalp Treatment: 1 protocol
- Lip Treatment: 1 protocol
- Other: 6 protocols

**What's Complete:**
- ✅ Protocol names extracted from 47 PDF files
- ✅ Categories auto-assigned
- ✅ Basic metadata (duration defaults to 60 minutes)
- ✅ Source file tracking
- ✅ All protocols marked as `completion_status: 'incomplete'`

**What's Missing (Requires Manual Entry):**
- ❌ Step-by-step instructions
- ❌ Product usage per step
- ❌ Target skin concerns
- ❌ Contraindications
- ❌ Timing per step
- ❌ Technique notes

**Next Steps:**
Admin needs to use `/admin/protocols` → Protocol Completion Editor to:
1. Add step-by-step instructions for each protocol
2. Link products to steps
3. Add target concerns and contraindications
4. Mark protocols as `steps_complete` or `fully_complete`

**Fields:**
- `protocol_name` (unique)
- `category` (e.g., "FACIALS", "BODY TREATMENTS")
- `target_concerns` (array: ["aging", "acne", "hydration"])
- `typical_duration` (e.g., "60 minutes")
- `allowed_products` (array of product names)
- `contraindications` (array)
- `completion_status` (incomplete/steps_complete/fully_complete)
- `training_required` (boolean)
- `training_type` (virtual/live/hybrid)
- `estimated_training_hours` (numeric)

**Related Tables:**
- `canonical_protocol_steps` - Step-by-step instructions
- `canonical_protocol_step_products` - Products used per step
- `protocol_costing` - Cost of goods per protocol

**Source Files:** 58 PDF files in `/public/` directory
- Example: `acneclearingfacial_protocol_060524.pdf`
- Example: `caffeineguashafacial_100224_1.pdf`
- Example: `vitamincradiancefacial.pdf`

**Accessibility:** NOT accessible to spa users (no UI)

### Product Content

**PRO Products (27 active):**
- Table: `pro_products`
- Fields: product_name, product_function, key_ingredients, category, size, pro_price, status, contraindications, in_service_usage_allowed, notes
- Example: "Sweet Birch Cleansing Gel", "Manuka Honey Cleanser"

**Retail Products (35 active):**
- Table: `retail_products`
- Fields: product_name, product_function, target_concerns, key_ingredients, regimen_placement, category, size, msrp, wholesale, status
- Example: "Vitamin C15 Serum", "Argan & Retinol Night Cream"

**MedSpa Products (36):**
- Table: `medspa_products`
- Fields: product_name, category, size, retail_price, backbar_price, medspa_application, value_proposition, priority, why_excels
- Example: "Caffeine Peptide Eye Cream", "Glycolic Flash Peel"

**Accessibility:** NOT accessible to spa users (no UI)

### Marketing Calendar

**Table:** `marketing_calendar`

**Current State:** 12 months loaded (2026)

**Fields:**
- `month` (1-12)
- `month_name` (e.g., "January")
- `year` (2026)
- `theme` (e.g., "New Year New You")
- `focus_moment` (e.g., "Winter skin recovery")
- `featured_products` (array)
- `featured_protocols` (array)
- `new_launches` (array)
- `webinar_title`
- `webinar_date`
- `quarter` (1-4)

**Example Entry:**
```json
{
  "month": 1,
  "month_name": "January",
  "theme": "New Year New You",
  "focus_moment": "Winter skin recovery",
  "featured_products": ["Vitamin C Serum", "Hydrating Mask"],
  "featured_protocols": ["Winter Wellness Reset Facial"],
  "new_launches": ["Caffeine Eye Treatment"],
  "webinar_title": "Winter Wellness Kick-Off",
  "webinar_date": "January 15, 2026"
}
```

**Accessibility:** Admin-only (not shown to spa users)

---

## 8. KNOWN ISSUES & GAPS

### Critical Issues

**1. Empty Analysis (BLOCKING):**
- 47 protocols loaded with basic metadata; step-by-step details require manual completion
- Spa users get a plan with zero recommendations
- No warning or explanation
- **Impact:** First-time users get worthless output

**2. Protocol Ingestion Required:**
- Admin must manually run ingestion on each PDF
- 58 PDFs need processing
- No batch ingestion
- Time-consuming manual process

**3. AI Concierge Non-Functional:**
- UI exists and is prominent in nav
- Backend not connected to AI
- Misleading to users

**4. No Submission Review Flow:**
- Admin can't review/approve plans
- `/admin/submissions/:id` is placeholder
- No way to add admin notes or overrides

### UX Issues

**5. Content Not Discoverable:**
- Spa users can't browse protocols or products
- No "Service Library" or "Product Library"
- Must create a plan to see any content

**6. Results Lack Context:**
- Plan results are data tables without explanation
- No "What this means for your business"
- No "What to do next" guidance

**7. No Empty States:**
- If gaps = 0, shows empty section
- If mappings = 0, shows empty section
- No helpful messaging

**8. Poor Onboarding:**
- No tour or tooltips
- No example plan to see before creating
- Spa owners don't know what to expect

**9. Navigation Unclear:**
- "Dashboard" vs "My Plans" distinction unclear
- "Concierge" button leads to non-functional feature

**10. Plan Detail Overwhelming:**
- 5 tabs of data
- No summary or executive overview
- Hard to understand priority

### Technical Issues

**11. Schema Misalignment:**
- Old tables (`spa_services`, `service_mappings`) still exist
- New tables (`spa_menu_services`, `protocol_mappings`) in use
- Confusion in codebase

**12. Missing RLS Policies:**
- Some tables may allow cross-spa data access
- Needs security audit

**13. No Error Handling:**
- If orchestrator fails, user sees generic error
- No retry mechanism
- No partial results

**14. Performance:**
- Orchestrator runs synchronously
- Large menus take 20+ seconds
- No progress updates beyond loading spinner

**15. Mobile Responsiveness:**
- Tables don't scroll well on mobile
- Multi-column grids break on small screens
- Forms usable but not optimized

### Content Gaps

**16. Protocol Completion Status:**
- Most protocols incomplete (no steps, no products)
- Affects mapping quality
- Affects opening order accuracy

**17. Missing Product Links:**
- Protocols don't reference specific products
- Retail attach rules not populated
- Opening orders use placeholder logic

**18. No Revenue Projections:**
- Gap analysis doesn't estimate revenue impact
- No ROI calculations
- Spa owners can't justify investment

**19. No Training Content:**
- Training requirements exist in schema
- Not surfaced to spa users
- No training resources linked

**20. No Seasonal Guidance:**
- Marketing calendar not integrated into plans
- Seasonal protocols not highlighted
- Launch windows not suggested

---

## 9. AUTHENTICATION & PERMISSIONS

### How Auth Works

**Provider:** Supabase Auth (built on PostgreSQL)

**Flow:**
1. User signs up with email/password
2. Supabase creates `auth.users` record
3. App creates `user_profiles` record with `id = auth.users.id`
4. `user_profiles.role` determines permissions (spa_user or admin)

**Session Management:**
- JWT tokens stored in browser (httpOnly)
- Tokens refresh automatically
- `AuthContext` provides global auth state

### User Types

**1. Spa User (`role: spa_user`):**
- Default role for signups
- Can view own plans only
- Cannot access admin routes
- RLS restricts to own data

**2. Admin (`role: admin`):**
- Manually set in database (no signup flow)
- Full access to all data
- Can access `/admin` routes
- Bypasses most RLS policies

### Permission Structure

**Spa User Permissions:**
- ✅ Create plan_submissions
- ✅ Read own plan_submissions
- ✅ Read own spa_menus
- ✅ Read own plan_outputs
- ❌ Cannot read other spas' data
- ❌ Cannot access admin routes

**Admin Permissions:**
- ✅ Read all plan_submissions
- ✅ Read/write all content tables
- ✅ Run ingestion
- ✅ Edit business rules
- ❌ Cannot create plans AS a spa (no "impersonate" feature)

### Permission Issues

**Known Gaps:**
1. **No Admin Signup Flow:**
   - Must manually INSERT into user_profiles
   - No in-app way to promote a user to admin

2. **RLS Policy Incomplete:**
   - Some tables may not properly restrict by user_id
   - Needs comprehensive audit

3. **No Role-Based Features:**
   - No "manager" or "viewer" roles
   - Binary: spa_user or admin

4. **No Team Accounts:**
   - One spa = one user
   - No multi-user spa accounts
   - No team collaboration

5. **No Password Reset:**
   - Supabase supports it
   - Not implemented in UI

---

## 10. ADDITIONAL CONTEXT

### What Has Been Attempted But Didn't Work

**1. AI Concierge:**
- Full UI built (`SpaConcierge.tsx`, `AIConciergeLogsView.tsx`)
- `aiConciergeEngine.ts` exists with sophisticated logic
- NOT CONNECTED to OpenAI or Claude
- Placeholder responses only
- Reason: Waiting on API keys / budget approval

**2. Direct PDF Upload:**
- Initially planned for spa users to upload PDF menus
- Pivoted to text input (simpler, faster)
- PDF upload UI removed

**3. Real-Time Analysis:**
- Tried WebSocket updates during plan generation
- Too complex for current setup
- Reverted to loading spinner

**4. Shareable Plan Links:**
- Schema includes `plan_outputs.shareable_link_token`
- UI not built
- Public view route not implemented

**5. PDF Export:**
- `plan_outputs.pdf_generated` field exists
- PDF generation library not integrated
- Planned for future

### Constraints

**Technical:**
- **No backend server** - All logic in client + Supabase
- **No background jobs** - Orchestrator runs in client (slow for large menus)
- **No email service** - Can't send plan notifications
- **No file storage** - PDFs in `/public/` only (not scalable)

**Business:**
- **Protocol content incomplete** - Most PDFs not ingested yet
- **Product data needs review** - Some products missing details
- **Pricing data sensitive** - Wholesale prices visible in DB (RLS critical)

**Team:**
- **Solo developer** - No dedicated designer, one engineer
- **No dedicated QA** - Testing done ad-hoc
- **No user research** - UX decisions made without spa owner input

### Priority Order for Improvements

**Phase 1: Make Analysis Work (CRITICAL)**
1. Run admin ingestion on all 58 PDFs
2. Complete protocol data (steps, products)
3. Populate retail_attach_rules
4. Test full plan generation flow

**Phase 2: Improve Spa User Experience (HIGH)**
5. Add Service Library (browse protocols)
6. Add Product Library (browse PRO + Retail)
7. Redesign Dashboard (content-first, not data tables)
8. Add plan summary/"What this means" sections
9. Improve empty states and error messaging

**Phase 3: Admin Workflow (HIGH)**
10. Build submission review UI (`/admin/submissions/:id`)
11. Add manual plan editing
12. Add approval workflow
13. Build lead management UI

**Phase 4: Intelligence Improvements (MEDIUM)**
14. Add revenue projections to gap analysis
15. Integrate marketing calendar into seasonal recommendations
16. Add implementation timeline to plans
17. Add training requirements to plan output

**Phase 5: Polish & Scale (MEDIUM)**
18. Mobile optimization
19. PDF export
20. Shareable plan links
21. Email notifications

**Phase 6: AI & Advanced Features (LOW)**
22. Connect AI Concierge to OpenAI/Claude
23. Add conversational plan creation
24. Add plan comparison (v1 vs v2)

### Success Metrics (Not Currently Tracked)

**Desired Metrics:**
- Plans created per week
- Plan completion rate
- Time from signup to first plan
- Common service gaps
- Most recommended protocols
- Retail attach adoption rate

**Current State:** No analytics integrated

---

## SUMMARY FOR CONSULTANT

### What's Working Well
✅ Authentication and user management
✅ Database schema is well-structured and normalized
✅ Plan generation orchestrator (when data exists)
✅ Admin content management tools
✅ Business rules configuration system

### Critical Blockers
🟡 47 protocols loaded with basic metadata; step completion required for full functionality
❌ Spa users can't browse content before creating plans
❌ Results lack business context and guidance
❌ Admin can't review/approve plans
❌ AI Concierge non-functional but prominent

### Recommended Next Steps
1. **Complete data ingestion** (run on all 58 PDFs)
2. **Build content libraries** for spa users (Service Library + Product Library)
3. **Redesign spa dashboard** (content-first, outcome-driven)
4. **Add plan summary section** ("What this means for your business")
5. **Build admin submission review flow**
6. **Remove or complete AI Concierge** (don't mislead users)

### Key Questions for Consultant
1. Should spa users be able to browse protocols before creating a plan?
2. How should we frame plan results (data-driven vs. consultative)?
3. Should admins manually review every plan before spa sees it?
4. Priority: polish spa experience OR build admin workflow?
5. What's the right level of AI integration (full automation vs. human-in-loop)?

---

**End of Document**
