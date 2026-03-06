> [!CAUTION]
> **DEPRECATED** — March 5, 2026. Superseded by `/docs/command/MODULE_BOUNDARIES.md` and `/docs/command/SOCELLE_MONOREPO_MAP.md`. Do not treat as authoritative. Filed for historical reference only.

# MODULE MAP — SOCELLE GLOBAL (DEPRECATED)
**Generated:** March 5, 2026 — G0 Repo Inventory  
**Authority:** NONE — Superseded

---

## MONOREPO STRUCTURE

```
SOCELLE GLOBAL/
├── .claude/CLAUDE.md                 ← Global governance
├── docs/command/                     ← Canonical docs (sole authority)
├── SOCELLE-WEB/                      ← Web app (Vite + React + Tailwind)
├── SOCELLE-MOBILE-main/              ← Mobile app (Flutter + Riverpod)
├── apps/
│   ├── marketing-site/               ← Next.js marketing site (planned)
│   └── web-portal/                   ← Web portal (planned)
├── supabase/                         ← Backend (PostgreSQL + Edge Functions)
├── packages/
│   ├── eslint-config/                ← Shared ESLint config
│   ├── supabase-config/              ← Shared Supabase config
│   ├── typescript-config/            ← Shared tsconfig
│   └── ui/                           ← Shared UI primitives (planned)
└── turbo.json                        ← Turborepo config
```

---

## MINI-APP BOUNDARIES

### Intelligence Mini-Apps

| Mini-App | Web Route | File Location | Shared Core | Data Tables |
|---|---|---|---|---|
| **Intelligence Hub** | `/intelligence` | `pages/public/Intelligence.tsx` | `useIntelligence()` hook | `market_signals` |
| **Business Intelligence** | `/portal/intelligence` | `pages/business/IntelligenceHub.tsx` | `useIntelligence()` hook | `market_signals` |
| **Brand Intelligence** | `/brand/intelligence` | `pages/brand/BrandIntelligenceHub.tsx` | `useIntelligence()` hook | `market_signals` |
| **Admin Intelligence** | `/admin/intelligence` | `pages/admin/IntelligenceDashboard.tsx` | Direct Supabase | `market_signals` |
| **Market Pulse Bar** | (component) | `components/intelligence/MarketPulseBar.tsx` | Shared component | `market_signals` |

### Jobs Mini-App

| Mini-App | Web Route | File Location | Data Tables |
|---|---|---|---|
| **Jobs Index** | `/jobs` | `pages/public/Jobs.tsx` | `job_postings` |
| **Job Detail** | `/jobs/:slug` | `pages/public/JobDetail.tsx` | `job_postings` |

### Brands Mini-App

| Mini-App | Web Route | File Location | Data Tables |
|---|---|---|---|
| **Brands Directory** | `/brands` | `pages/public/Brands.tsx` | `brands` |
| **Brand Storefront** | `/brands/:slug` | `pages/public/BrandStorefront.tsx` | `brands`, `brand_seed_content`, `pro_products`, `retail_products`, `protocols` |
| **Brand Admin Hub** | `/admin/brands/:id/*` | `pages/admin/brand-hub/Hub*.tsx` | `brands`, products, protocols |

### Events Mini-App

| Mini-App | Web Route | File Location | Data Tables |
|---|---|---|---|
| **Events Calendar** | `/events` | `pages/public/Events.tsx` | `events` |

### Education Mini-App

| Mini-App | Web Route | File Location | Data Tables |
|---|---|---|---|
| **Education Catalog** | `/education` | `pages/public/Education.tsx` | `protocols` (category counts) |
| **Protocols** | `/protocols` | `pages/public/Protocols.tsx` | `protocols` |
| **Protocol Detail** | `/protocols/:slug` | `pages/public/ProtocolDetail.tsx` | `protocols` |

### Commerce Mini-App

| Mini-App | Web Route | File Location | Data Tables |
|---|---|---|---|
| **Business Orders** | `/portal/orders` | `pages/business/Orders.tsx` | `orders` |
| **Brand Orders** | `/brand/orders` | `pages/brand/Orders.tsx` | `orders` |
| **Admin Orders** | `/admin/orders` | `pages/admin/AdminOrders.tsx` | `orders` |

### AI Mini-App

| Mini-App | Web Route | File Location |
|---|---|---|
| **Business AI Advisor** | `/portal/advisor` | `pages/business/AIAdvisor.tsx` |
| **Brand AI Advisor** | `/brand/advisor` | `pages/brand/BrandAIAdvisor.tsx` |
| **Edge Function** | `supabase/functions/ai-orchestrator` | Deno edge function |

### Studios (Planned)

| Studio | Route Prefix | Status |
|---|---|---|
| Social Studio | `/studio/social/*` | Not yet created |
| CRM Studio | `/studio/crm/*` | Not yet created |
| Sales Studio | `/studio/sales/*` | Not yet created |
| Marketing Studio | `/studio/marketing/*` | Not yet created |
| Education Studio | `/studio/education/*` | Not yet created |

---

## SHARED CORE MODULES

### Services (`SOCELLE-WEB/src/lib/`)

| Module | File | Shared By |
|---|---|---|
| Supabase Client | `lib/supabase.ts` | All pages with data |
| Auth Context | `lib/auth.tsx` | All authenticated pages |
| Types | `lib/types.ts` | All pages |
| Intelligence Hook | `lib/intelligence/useIntelligence.ts` | Intelligence Hub (public + business + brand) |

### Components (`SOCELLE-WEB/src/components/`)

| Component | File | Shared By |
|---|---|---|
| MainNav | `components/MainNav.tsx` | All public pages |
| SiteFooter | `components/sections/SiteFooter.tsx` | All public pages |
| ProtectedRoute | `components/ProtectedRoute.tsx` | All portal pages |
| ErrorBoundary | `components/ErrorBoundary.tsx` | App root |
| Toast | `components/Toast.tsx` | App root |
| ConfigCheck | `components/ConfigCheck.tsx` | App root |
| BlockReveal | `components/motion/BlockReveal.tsx` | Multiple pages |
| WordReveal | `components/motion/WordReveal.tsx` | Multiple pages |
| GlassAccordion | `components/sections/GlassAccordion.tsx` | FAQ, Plans |

### Layouts

| Layout | File | Used By |
|---|---|---|
| BusinessLayout | `layouts/BusinessLayout.tsx` | All `/portal/*` routes |
| BrandLayout | `layouts/BrandLayout.tsx` | All `/brand/*` routes |
| AdminLayout | `layouts/AdminLayout.tsx` | All `/admin/*` routes |

### Supabase Backend (`supabase/`)

| Resource | Path | Count |
|---|---|---|
| Migrations | `supabase/migrations/` | 71+ |
| Edge Functions | `supabase/functions/` | 8 |
| Config | `supabase/config.toml` | — |

---

## CROSS-BOUNDARY RULES

Per `/.claude/CLAUDE.md` §3:

1. Web Agent owns `SOCELLE-WEB/` and `apps/`
2. Mobile Agent owns `SOCELLE-MOBILE-main/`
3. Backend Agent owns `supabase/` (only agent that may create migrations)
4. Design token changes require coordinated updates (web Tailwind + mobile Flutter theme)
5. Shared types live in `lib/types.ts` (web) and must mirror mobile models

---

*Per `docs/command/SOCELLE_RELEASE_GATES.md` §9: All modules cited with file paths.*
