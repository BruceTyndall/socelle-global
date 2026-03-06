# Application Route Map

## Spa Client Portal Routes

**Base URL:** `/`
**Target Users:** Spa/MedSpa Business Owners
**Authentication:** Supabase Auth (email/password)

### Public Routes
| URL | Page | Description |
|-----|------|-------------|
| `/` | Home | Landing page with CTAs and value props |
| `/login` | Login | Spa user login form |
| `/signup` | Signup | Spa user registration (spa name + email + password) |

### Protected Routes (Requires Login)
| URL | Page | Description |
|-----|------|-------------|
| `/dashboard` | Dashboard | User home with submissions overview, quick actions |
| `/plans` | Plans List | All user's plans with status filtering |
| `/plans/:id` | Plan Detail | Individual plan view (placeholder) |
| `/plan/new` | New Plan Wizard | Multi-step plan creation (placeholder) |
| `/concierge` | AI Concierge | Chat interface for questions |

---

## Admin Portal Routes

**Base URL:** `/admin/*`
**Target Users:** Naturopathica Administrators
**Authentication:** Supabase Auth + Admin Role Verification

### Public Routes
| URL | Page | Description |
|-----|------|-------------|
| `/admin/login` | Admin Login | Dark-themed admin-only login |

### Protected Routes (Requires Admin Role)
| URL | Page | Description |
|-----|------|-------------|
| `/admin` | → Redirect | Redirects to `/admin/inbox` |
| `/admin/inbox` | Submissions Inbox | View all spa submissions with filtering |
| `/admin/submissions/:id` | Submission Review | Review details, add notes, update status (placeholder) |
| `/admin/ingestion` | Document Ingestion | Upload and process PDFs |
| `/admin/protocols` | Protocols | Manage canonical protocols library |
| `/admin/products` | Products | Manage PRO and Retail products |
| `/admin/mixing` | Mixing Rules | Product combination rules |
| `/admin/costs` | Treatment Costs | Cost per application data |
| `/admin/calendar` | Marketing Calendar | 2026 marketing calendar |
| `/admin/rules` | Business Rules | Service benchmarks, pricing rules |
| `/admin/health` | Schema Health | Database schema verification |

---

## Navigation Hierarchy

```
Application Root
│
├─ Spa Portal (SpaLayout)
│  ├─ Header
│  │  ├─ Logo (→ /)
│  │  ├─ Dashboard (→ /dashboard)
│  │  ├─ My Plans (→ /plans)
│  │  ├─ Concierge (→ /concierge)
│  │  └─ User Menu (logout)
│  │
│  ├─ Content (Outlet)
│  └─ Footer
│
└─ Admin Portal (AdminLayout)
   ├─ Header
   │  ├─ Logo + ADMIN badge (→ /admin/inbox)
   │  └─ User Menu (logout)
   │
   ├─ Sub-navigation
   │  ├─ Inbox
   │  ├─ Ingestion
   │  ├─ Protocols
   │  ├─ Products
   │  ├─ Calendar
   │  ├─ Mixing
   │  ├─ Costs
   │  ├─ Rules
   │  └─ Health
   │
   └─ Content (Outlet)
```

---

## Route Guards

### Spa Portal Guards
- **Public routes:** Home, Login, Signup
- **Protected routes:** Dashboard, Plans, Concierge
  - Requires: `session !== null`
  - Redirect to: `/login`

### Admin Portal Guards
- **Public routes:** `/admin/login`
- **Protected routes:** All `/admin/*` except login
  - Requires: `session !== null` AND `profile.role === 'admin'`
  - Redirect to: `/admin/login`

---

## Deep Linking Examples

**Spa User Flow:**
```
User clicks email link → /plans/abc-123
↓ Not logged in
→ Redirect to /login?redirect=/plans/abc-123
↓ User logs in
→ Redirect to /plans/abc-123
```

**Admin Flow:**
```
Admin clicks link → /admin/submissions/xyz-789
↓ Not logged in OR not admin
→ Redirect to /admin/login
↓ Admin logs in
→ Redirect to /admin/submissions/xyz-789
```

---

## API Endpoints (Supabase)

All database access via Supabase client, enforced by RLS:

**Spa Users:**
- `plan_submissions` (own records only)
- `user_profiles` (own profile only)
- `canonical_protocols` (read-only)
- `retail_products` (read-only)
- `pro_products` (read-only)

**Admins:**
- All tables (full read/write access)
- `admin_activity_log` (write access)

---

## 404 Handling

**Unknown routes:**
- Any route not matching above patterns → Redirect to `/`

**Examples:**
- `/unknown` → `/`
- `/admin/unknown` → `/admin/inbox` (if logged in as admin) OR `/admin/login`
