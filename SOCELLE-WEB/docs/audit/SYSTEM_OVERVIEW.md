# SYSTEM OVERVIEW
> Generated: 2026-02-22 | Auditor: Senior Product Designer + Staff Frontend + Staff Backend

---

## 1. Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| UI Framework | React | 18.3.1 | Functional components, hooks throughout |
| Language | TypeScript | 5.5.3 | Strict mode not confirmed; types present |
| Build | Vite | 5.4.2 | Module bundler, dev server |
| Routing | React Router | 7.12.0 | Client-side SPA, lazy-loaded routes |
| Styling | Tailwind CSS | 3.4.1 | Custom `pro-*` design tokens |
| Backend | Supabase | 2.57.4 | PostgreSQL + Auth + Storage + Edge Functions |
| State | Local `useState`/`useEffect` | — | No global store (no Redux/Zustand/Jotai) |
| AI | Anthropic Claude | via Edge Fn | `ANTHROPIC_API_KEY` in Supabase Secrets only |
| Vector Search | pgvector | via Supabase RPC | `match_protocols` stored procedure |
| Doc Parsing | pdfjs-dist + mammoth | 3.11 / 1.11 | Client-side PDF + DOCX extraction |
| Icons | Lucide React | 0.344.0 | — |
| Testing | Vitest + Playwright | 4.0.18 / 1.58.2 | Unit + E2E; coverage unknown |
| Hosting | Netlify | — | SPA redirects via `_redirects` |

### State Management Pattern
**No global state store.** Each component fetches its own data on mount via `useEffect`. Auth state is the only shared context (`AuthProvider` via React Context). This causes:
- Duplicate DB queries across sibling components
- No cache invalidation strategy
- Stale data after mutations unless page refreshes

---

## 2. Auth Method & User Model

### Auth Provider
Supabase Auth — JWT stored in `localStorage`, auto-refresh enabled.

### User Roles (5 types)
```typescript
type UserRole = 'spa_user' | 'admin' | 'business_user' | 'brand_admin' | 'platform_admin';
```

| Role | Portal | Access Level |
|------|--------|-------------|
| `business_user` | `/portal/*` | Own plans, menus, orders |
| `spa_user` | `/portal/*` | Legacy alias for `business_user` |
| `brand_admin` | `/brand/*` | Brand's own data (filtered by `brand_id`) |
| `admin` | `/admin/*` | All data |
| `platform_admin` | `/admin/*` | All data + exclusive features |

### Role Resolution Logic (`auth.tsx`)
```typescript
isAdmin        = role === 'admin' || role === 'platform_admin'
isBusinessUser = role === 'business_user' || role === 'spa_user'
isBrandAdmin   = role === 'brand_admin' || isAdmin
isPlatformAdmin = role === 'platform_admin'
```

### User Profile Schema (`user_profiles` table)
```typescript
{
  id: string           // matches auth.users.id
  role: UserRole
  spa_name: string | null
  business_type: string | null
  contact_email: string | null
  contact_phone: string | null
  brand_id: string | null       // brand_admin scoping
  business_id: string | null    // business_user scoping
  created_at: string
  updated_at: string
}
```

### Auth Boot Sequence
1. `AuthProvider` mounts → subscribes to `supabase.auth.onAuthStateChange`
2. On session detected → fetch `user_profiles` with 2 retries + delay
3. On profile not found → auto-create with role `business_user`
4. `ProtectedRoute` reads `user`, `profile`, `loading` from context
5. Missing role → redirect to appropriate login

### Critical Auth Gaps Found
- **Race condition:** Profile fetch can complete before `onAuthStateChange` fires on cold start — component may render in wrong auth state briefly
- **Silent profile creation:** If profile upsert fails silently, user gets stuck in loading loop with no feedback
- **No session expiry UI:** Expired JWT causes silent API failures with no logout/re-auth prompt

---

## 3. Data Layer

### Database: Supabase (PostgreSQL)
- **Access pattern:** Direct client-side Supabase SDK calls (no API gateway)
- **Security:** Row-Level Security (RLS) policies (assumed — not audited directly)
- **ORM:** None — raw Supabase query builder

### Complete Table Inventory (46 tables)

#### Brand & Product Core
| Table | Purpose |
|-------|---------|
| `brands` | Brand profiles, theme, status, slug |
| `brand_assets` | Logo, hero images, marketing materials |
| `brand_commercial_assets` | Sales/commercial assets |
| `brand_page_modules` | CMS-style brand page content blocks |
| `brand_shop_settings` | Brand storefront configuration |
| `brand_training_modules` | Education/training content |
| `brand_differentiation_points` | USP/competitive positioning |
| `canonical_protocols` | Treatment protocol definitions |
| `canonical_protocol_steps` | Step-by-step protocol instructions |
| `canonical_protocol_step_products` | Product-step linkages (backbar) |
| `pro_products` | Professional/backbar products (wholesale) |
| `retail_products` | Consumer-facing retail products |

#### Spa/Business Operations
| Table | Purpose |
|-------|---------|
| `spa_menus` | Raw menu uploads (PDF/DOCX/text) |
| `spa_services` | Parsed services extracted from menus |
| `spa_menu_services` | Service-menu join |
| `spa_service_mapping` | Service → canonical protocol mapping |
| `service_gaps` | Identified service gaps |
| `service_gap_analysis` | Detailed gap analysis results |
| `service_category_benchmarks` | Category expectations by spa type |

#### MedSpa
| Table | Purpose |
|-------|---------|
| `medspa_treatments` | MedSpa treatment definitions |
| `medspa_products` | MedSpa-specific product recommendations |

#### Planning & Rollout
| Table | Purpose |
|-------|---------|
| `plan_submissions` | Spa onboarding submissions |
| `plans` | Plan records (user-facing) |
| `plan_outputs` | Legacy plan output storage |
| `business_plan_outputs` | Structured plan outputs (JSON by type) |
| `phased_rollout_plans` | 3-phase rollout plans |
| `rollout_plan_items` | Individual rollout items |
| `implementation_readiness` | Training complexity + risk scores |
| `opening_orders` | Initial product orders |

#### Commerce
| Table | Purpose |
|-------|---------|
| `orders` | Purchase orders |
| `order_items` | Line items per order |
| `treatment_costs` | Per-unit cost data for products |
| `protocol_costing` | Protocol-level cost breakdown |
| `retail_attach_recommendations` | Cross-sell product recommendations |

#### Marketing & Analytics
| Table | Purpose |
|-------|---------|
| `marketing_calendar` | Seasonal featured products |
| `brand_analytics` | Brand performance KPIs |
| `business_analytics` | Business KPIs |
| `search_analytics` | Search query tracking |
| `spa_leads` | Lead tracking |
| `lead_activities` | Lead activity log |

#### AI & Rules
| Table | Purpose |
|-------|---------|
| `ai_concierge_chat_logs` | AI chat session history |
| `ai_concierge_starter_questions` | Mode-specific prompt suggestions |
| `mixing_rules` | Product contraindications |

#### Admin / System
| Table | Purpose |
|-------|---------|
| `user_profiles` | User account + role data |
| `audit_log` | Change tracking |
| `platform_health` | System health metrics |
| `document_ingestion_log` | Protocol PDF ingestion tracking |
| `menu_uploads` | Menu upload tracking |

### RPC / Edge Functions
| Name | Type | Purpose |
|------|------|---------|
| `match_protocols` | RPC (pgvector) | Semantic protocol matching via embeddings |
| `get_table_columns` | RPC | Schema health check |
| `generate-embeddings` | Edge Function | Anthropic embedding generation |

---

## 4. Frontend Routes (System Map)

### Public Routes (Unauthenticated)
```
/                    → Home.tsx           (landing page)
/brands              → Brands.tsx         (public brand directory)
/forgot-password     → ForgotPassword.tsx
/reset-password      → ResetPassword.tsx
```

### Business Portal (`/portal/*`) — Role: `business_user` | `spa_user`
```
/portal              → PortalHome.tsx     (brand exploration)
/portal/login        → Login.tsx
/portal/signup       → Signup.tsx
/portal/dashboard    → Dashboard.tsx      (stats + onboarding)
/portal/plans        → PlansList.tsx      (plan history)
/portal/plans/new    → PlanWizard.tsx     (4-step plan creation)
/portal/plans/:id    → PlanResults.tsx    (5-tab results viewer)
/portal/plans/compare→ PlanComparison.tsx
/portal/brands/:slug → BrandDetail.tsx    (brand deep-dive)
/portal/orders       → Orders.tsx
/portal/calendar     → MarketingCalendar.tsx
```

### Brand Portal (`/brand/*`) — Role: `brand_admin`
```
/brand/login         → Login.tsx
/brand/dashboard     → Dashboard.tsx      (metrics + recent plans)
/brand/orders        → Orders.tsx         ← NEW (mock data)
/brand/products      → Products.tsx       ← NEW (mock data)
/brand/performance   → Performance.tsx    ← NEW (mock data)
/brand/messages      → Messages.tsx       ← NEW (mock data)
/brand/campaigns     → Campaigns.tsx      ← NEW (mock data)
/brand/automations   → Automations.tsx    ← NEW (mock data)
/brand/promotions    → Promotions.tsx     ← NEW (mock data)
/brand/customers     → Customers.tsx      ← NEW (mock data)
/brand/storefront    → Storefront.tsx     ← NEW (mock data)
/brand/plans         → Plans.tsx          (legacy)
/brand/leads         → Leads.tsx
```

### Admin Portal (`/admin/*`) — Role: `admin` | `platform_admin`
```
/admin/login         → AdminLogin.tsx
/admin/dashboard     → AdminDashboard.tsx
/admin/brands        → AdminBrandList.tsx
/admin/brands/new    → BrandAdminEditor.tsx
/admin/brands/:id    → BrandHub.tsx       (brand hub wrapper)
  /admin/brands/:id/profile    → BrandAdminEditor.tsx
  /admin/brands/:id/products   → HubProducts.tsx
  /admin/brands/:id/protocols  → HubProtocols.tsx
  /admin/brands/:id/education  → HubEducation.tsx
  /admin/brands/:id/orders     → HubOrders.tsx
  /admin/brands/:id/retailers  → HubRetailers.tsx
  /admin/brands/:id/analytics  → HubAnalytics.tsx
  /admin/brands/:id/settings   → HubSettings.tsx
/admin/orders        → AdminOrders.tsx
/admin/orders/:id    → AdminOrderDetail.tsx
/admin/inbox         → AdminInbox.tsx
/admin/debug         → DebugPanel.tsx
/admin/ingestion     → IngestionView.tsx
/admin/protocols     → ProtocolsView.tsx
/admin/products      → (inline: ProProductsView + RetailProductsView)
/admin/mixing        → MixingRulesView.tsx
/admin/costs         → CostsView.tsx
/admin/calendar      → MarketingCalendarView.tsx
/admin/rules         → BusinessRulesView.tsx
/admin/health        → SchemaHealthView.tsx
/admin/submissions/:id→ SubmissionDetail.tsx
/admin/protocols/import→ BulkProtocolImport.tsx
/admin/debug-auth    → AuthDebug.tsx
```

### Deprecated Routes (Redirects)
```
/spa/* → /portal/* (all spa routes redirect)
```

---

## 5. Key Async Flows

### Flow 1: User Registration
```
Signup.tsx → supabase.auth.signUp()
           → onAuthStateChange fires
           → AuthProvider fetches user_profiles
           → Profile not found → auto-create (role: business_user)
           → Navigate to /portal/dashboard
```

### Flow 2: Plan Creation (Core Product Flow)
```
PlanWizard.tsx (Step 1: Business context)
  → (Step 2: Menu upload — PDF/DOCX extract client-side OR paste text)
  → (Step 3: Select brand from supabase.from('brands'))
  → (Step 4: Confirm)
  → planOrchestrator.ts → creates plan_submissions record
  → mappingEngine.ts → spa_services inserts + protocol matches
  → gapAnalysisEngine.ts → service_gap_analysis writes
  → retailAttachEngine.ts → retail_attach_recommendations writes
  → business_plan_outputs record created
  → Navigate to /portal/plans/:id
```

### Flow 3: Plan Results Display
```
PlanResults.tsx → supabase.from('plans').select() + ownership check
               → supabase.from('business_plan_outputs').select()
               → Renders 5 tabs: Overview, Protocols, Gaps, Retail, Activation
               → Reanalysis: triggers planOrchestrator again
```

### Flow 4: Brand Admin — Content Management
```
BrandAdminEditor.tsx → 7 tabs: Overview, Protocols, Products,
                       Assets, Training, Shop, Page Modules
  → Per tab: fetch + upsert to respective supabase tables
  → No optimistic updates — all server-confirmed saves
```

### Flow 5: AI Concierge
```
aiConciergeEngine.ts → determines mode (brand_expert, service_strategy, etc.)
                     → fetches approved tables for mode
                     → supabase.functions.invoke('generate-embeddings' or AI fn)
                     → returns structured response with confidence + missing data flags
```

---

## 6. Top 10 Load-Bearing Files

| Rank | File | Why It Matters |
|------|------|----------------|
| 1 | `src/lib/auth.tsx` | All auth state, role resolution, profile management — everything breaks if this is wrong |
| 2 | `src/App.tsx` | Route tree, auth guards, lazy loading — controls all navigation |
| 3 | `src/components/ProtectedRoute.tsx` | Auth enforcement for all portal pages — security boundary |
| 4 | `src/lib/planOrchestrator.ts` | Core value delivery — orchestrates the entire plan generation AI pipeline |
| 5 | `src/lib/supabase.ts` | Singleton DB client — all data flows through here |
| 6 | `src/pages/business/PlanWizard.tsx` | Primary conversion funnel — where users create plans |
| 7 | `src/pages/business/PlanResults.tsx` | Primary value delivery page — 5-tab results display |
| 8 | `src/pages/admin/BrandAdminEditor.tsx` | Core content management — 7-tab brand data editor (89KB bundle) |
| 9 | `src/lib/mappingEngine.ts` | Intelligence core — semantic + keyword mapping (feeds all outputs) |
| 10 | `src/lib/gapAnalysisEngine.ts` | Revenue intelligence — gap identification and revenue estimates |

---

## 7. Backend Services / Modules

| Module | Location | Purpose |
|--------|----------|---------|
| Auth Context | `src/lib/auth.tsx` | Session management, profile CRUD |
| Supabase Client | `src/lib/supabase.ts` | Configured singleton with proxy for unconfigured state |
| Plan Orchestrator | `src/lib/planOrchestrator.ts` | Master workflow coordinator |
| Mapping Engine | `src/lib/mappingEngine.ts` | Keyword + semantic service-to-protocol matching |
| Gap Analysis Engine | `src/lib/gapAnalysisEngine.ts` | Service gap detection + revenue modeling |
| Retail Attach Engine | `src/lib/retailAttachEngine.ts` | Cross-sell product recommendations |
| Phased Rollout Planner | `src/lib/phasedRolloutPlanner.ts` | 3-phase implementation scheduling |
| Opening Order Engine | `src/lib/openingOrderEngine.ts` | Initial inventory planning |
| AI Concierge Engine | `src/lib/aiConciergeEngine.ts` | Multi-mode AI Q&A with role-based data isolation |
| Service Mapping Engine | `src/lib/serviceMappingEngine.ts` | Individual service → protocol scoring |
| Implementation Readiness | `src/lib/implementationReadinessEngine.ts` | Training complexity + risk scoring |
| Brand Differentiation | `src/lib/brandDifferentiationEngine.ts` | Brand positioning analysis |
| PDF Extraction | `src/lib/pdfExtractionService.ts` | Protocol PDF ingestion (partial — steps missing) |
| Menu Orchestrator | `src/lib/menuOrchestrator.ts` | Menu parsing coordination |
| Plan Output Generator | `src/lib/planOutputGenerator.ts` | Structured output generation |
| Schema Health | `src/lib/schemaHealth.ts` | DB schema validation |
| Analytics Service | `src/lib/analyticsService.ts` | Business/brand analytics |
| Search Service | `src/lib/searchService.ts` | Search query handling |
| CSV Export | `src/lib/csvExport.ts` | Data export utility |
| Logger | `src/lib/logger.ts` | Scoped console logging |
| Platform Config | `src/lib/platformConfig.ts` | Centralized constants + feature flags |

---

## 8. Env Config & Secrets Management

```bash
# Frontend (exposed in browser bundle — public by design)
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_ANON_KEY=[anon_key]      # RLS-gated, read-only without auth

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PROMOTED_LISTINGS=false
VITE_ENABLE_NET30=false
VITE_APP_URL=https://theproedit.com
VITE_SUPPORT_EMAIL=hello@theproedit.com

# Never in frontend (Supabase Secrets → Edge Functions only)
ANTHROPIC_API_KEY   # Claude AI access
```

### Security Architecture
- Anon key: safe to expose (RLS enforces data boundaries)
- JWT: stored in `localStorage` (XSS risk — standard Supabase pattern)
- AI key: correctly isolated to server-side Edge Functions
- No service role key exposed to client (confirmed)

---

## 9. Critical Gaps Identified (Preview)

1. **9 new Brand Portal pages use 100% mock data** — no real Supabase connections
2. **PDF text extraction always returns `Low` confidence + empty steps** — client-side PDF parsing not implemented
3. **No global error handling for expired sessions** — silent API failures after JWT expiry
4. **`Promise.all` in Dashboard.tsx** — single table failure kills entire dashboard load
5. **Brand Admin Editor is 89KB** — largest bundle chunk, no tab-level code splitting
6. **No pagination** on any list view — unbounded DB reads on brands, products, protocols
7. **No rate limiting** on plan creation — user could spam the AI pipeline
8. **Duplicate pages found**: `AdminBrandList.tsx` AND `BrandsAdminList.tsx` AND `BrandsManagement.tsx` — route confusion risk
