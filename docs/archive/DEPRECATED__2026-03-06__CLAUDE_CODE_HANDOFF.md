> **DEPRECATED — 2026-03-06**
> This file is no longer authoritative. Replaced by:
> - `/.claude/CLAUDE.md` + `docs/command/AGENT_SCOPE_REGISTRY.md`
>
> Do not reference this file as authority. See `/.claude/CLAUDE.md` §B FAIL 1.

---

# The Pro Edit — Claude Code Handoff Prompt
> Copy everything below the line and paste it as your opening message in Claude Code.

---

---

## CONTEXT: Full Platform Rebuild — Pick Up From Phase 2

You are continuing a full rebuild of **The Pro Edit** — a B2B professional brand marketplace that connects service businesses (spas, salons, med spas, wellness studios) with professional product brands through AI-powered protocol matching.

The platform is modelled on Faire.com's marketplace architecture but purpose-built for the professional service industry with deep vertical intelligence: service menu parsing, protocol-to-product mapping, gap analysis, and phased retail activation.

---

## CODEBASE LOCATION

You are working in the current directory. The app is a **React 18 + TypeScript + Vite + Tailwind CSS + Supabase** SPA with a 3-portal architecture.

---

## WHAT HAS ALREADY BEEN DONE (DO NOT REDO)

### Session 1 — Infrastructure
- `src/lib/types.ts` — Full domain type system (Brand, Protocol, ProProduct, RetailProduct, Lead, CartItem, MappingMatch, etc.)
- `src/lib/platformConfig.ts` — Centralized config (thresholds, scoring weights, retry config, brand concierge config)
- `src/lib/logger.ts` — Structured logging with level-based filtering
- `src/lib/errors.ts` — AppError class, Supabase error mapper
- `src/lib/mappingEngine.ts` — Parallelized with `Promise.all`, structured logging
- `src/components/BrandPageRenderer.tsx` — Full rewrite with proper interfaces
- `src/lib/auth.tsx` — Logger + config constants, proper types
- `src/components/AIConcierge.tsx` — Multi-brand config via `getBrandConciergeConfig()`
- `src/pages/business/PlanWizard.tsx` — Error mapper, null safety
- `src/components/BrandShop.tsx` — useMemo for categories/filteredProducts, fixed $0.00 price bug
- **TypeScript: 0 errors** on `npx tsc --noEmit`

### Session 2 — Phase 1 Complete
- `tailwind.config.js` — Full `pro.*` design token palette (navy, gold, ivory, cream, stone, charcoal, warm-gray). DM Serif Display + Inter fonts. Custom shadows and animations.
- `src/index.css` — Google Fonts import, CSS custom properties, component utilities: `.btn-primary`, `.btn-gold`, `.btn-outline`, `.card`, `.card-elevated`, `.input`, `.badge-bestseller`, `.badge-new`, `.product-card`, `.skeleton`, `.section-container`, `.text-display`, `.text-headline`, `.text-subhead`
- `src/components/MainNav.tsx` — Rebranded to "the pro edit." wordmark with gold period. Clean editorial nav using `pro.*` tokens.
- `src/pages/public/Home.tsx` — Full premium landing page: navy hero, stats bar, 4-step how-it-works, dual value-prop split (businesses vs brands), protocol match mockup card, testimonials, footer
- `.github/workflows/ci.yml` — 4-job CI pipeline: TypeScript → Lint → Build → E2E
- `.env.example` — Documented environment variables
- `supabase/migrations/20260222000001_analytics_powerhouse.sql` — 10-table analytics schema with RLS:
  - `platform_events` (raw event stream)
  - `product_metrics` (daily product analytics)
  - `brand_analytics` (brand dashboard data)
  - `business_analytics` (business dashboard data)
  - `platform_health` (admin snapshot)
  - `search_analytics` (search quality)
  - `mapping_analytics` (protocol match outcomes)
  - `revenue_attribution` (multi-touch attribution)
  - `feature_flags` (runtime flags)
  - `audit_log` (immutable audit trail)
  - `mv_top_brands_weekly` (materialized view)

---

## BRAND & DESIGN SYSTEM

**Platform name:** The Pro Edit
**Domain:** theproedit.com
**Tagline:** "Your curated brand partner."
**Logo treatment:** lowercase serif "the pro edit." — the period is in gold

### Color Tokens (Tailwind)
```
pro-navy:        #1E3A5F   ← primary, CTAs, headings
pro-navy-dark:   #152C4A   ← hover states
pro-gold:        #C5A572   ← signature accent, gold period in logo
pro-gold-light:  #D4B98A   ← hover gold
pro-gold-pale:   #F0E6D3   ← gold tint backgrounds
pro-ivory:       #FAFAF7   ← page background
pro-cream:       #F5F1EC   ← card surfaces
pro-stone:       #E8E3DA   ← borders, dividers
pro-charcoal:    #2D2D2D   ← primary text
pro-warm-gray:   #6B6560   ← muted text
pro-light-gray:  #9C9591   ← placeholder/disabled
```

### Typography
- **Headlines (h1/h2/h3):** DM Serif Display (`font-serif`)
- **Body/UI:** Inter (`font-sans`)
- **Display sizes:** `text-display-xl`, `text-display-lg`, `text-display-md`, `text-display-sm`

### Design Principles (from Faire analysis)
- Clean luxury / editorial aesthetic
- Generous whitespace
- Skeleton loading states (not spinners) for all data fetching
- Product badges: "Bestseller", "New", "Protocol Match", "Verified Pro"
- Gated pricing behind registration (show "Unlock price" to guests)
- Left sidebar for search filters on listing pages
- 5-column product grid on desktop

---

## TECH STACK

```
Frontend:   React 18.3 + TypeScript 5.5 + Vite 5.4 + React Router v7
Styling:    Tailwind CSS 3.4 (with pro.* design tokens above)
Backend:    Supabase (PostgreSQL + Auth + Storage + Edge Functions)
AI:         Anthropic Claude API (via Supabase Edge Functions — key stored as Supabase secret)
Icons:      lucide-react
Doc parse:  mammoth (Word), pdfjs-dist (PDF)
Testing:    Playwright (E2E only, no unit tests yet)
CI/CD:      GitHub Actions (.github/workflows/ci.yml)
```

---

## PORTAL ARCHITECTURE

```
/ (public)          → Home, Brands discovery, auth pages
/portal/*           → Business portal (spas, salons, wellness studios)
/brand/*            → Brand portal (professional product brands)
/admin/*            → Admin portal (platform management)
```

### User Roles
- `business_user` — service business owner/manager
- `brand_admin` — brand portal admin
- `admin` / `platform_admin` — platform admins
- Protected via `ProtectedRoute` component with role-based access

---

## CURRENT FILE STRUCTURE (key files)

```
src/
├── components/
│   ├── AIConcierge.tsx         ← AI assistant (5 modes)
│   ├── BrandPageRenderer.tsx   ← Dynamic brand page rendering
│   ├── BrandShop.tsx           ← Brand product shop with cart
│   ├── MainNav.tsx             ← ✅ Rebranded
│   ├── ProtectedRoute.tsx      ← Role-based route guard
│   ├── Skeleton.tsx            ← Loading skeleton component
│   └── Toast.tsx               ← Toast notifications
├── layouts/
│   ├── AdminLayout.tsx
│   ├── BrandLayout.tsx
│   ├── BusinessLayout.tsx
│   └── SpaLayout.tsx
├── pages/
│   ├── public/
│   │   ├── Home.tsx            ← ✅ Rebuilt (premium landing page)
│   │   └── Brands.tsx          ← Brand discovery (needs Phase 4 search upgrade)
│   ├── business/
│   │   ├── Dashboard.tsx
│   │   ├── PlanWizard.tsx      ← ✅ Fixed
│   │   └── BrandDetail.tsx     ← Brand detail page (Phase 2 target)
│   ├── brand/
│   │   └── Dashboard.tsx       ← Brand portal dashboard (Phase 6 analytics)
│   └── admin/
│       └── AdminDashboard.tsx  ← Admin dashboard (Phase 6 analytics)
└── lib/
    ├── types.ts                ← ✅ Full domain types
    ├── platformConfig.ts       ← ✅ Centralized config
    ├── logger.ts               ← ✅ Structured logging
    ├── errors.ts               ← ✅ Error handling
    ├── auth.tsx                ← ✅ Auth context
    ├── supabase.ts             ← Supabase client
    ├── mappingEngine.ts        ← ✅ Parallelized
    ├── aiConciergeEngine.ts    ← AI concierge logic
    ├── gapAnalysisEngine.ts    ← Gap analysis
    └── retailAttachEngine.ts   ← Retail recommendations
```

---

## REBUILD PHASES — START FROM PHASE 2

Phase 1 is complete. Work through these phases in order:

---

### PHASE 2 — Brand Storefronts (Faire-style)

**Goal:** Every brand gets a premium storefront page that looks as good as Faire's brand pages.

**Files to create/update:**
- `src/pages/business/BrandDetail.tsx` — Full rebuild as a Faire-style brand storefront
- `src/pages/public/Brands.tsx` — Upgrade to proper brand discovery listing with filters
- `src/components/BrandCard.tsx` — New reusable brand card component
- `src/components/ProductCard.tsx` — New reusable Faire-style product card

**BrandDetail.tsx must include:**
1. **Hero section** — Full-width brand hero banner (using `brand.hero_image_url`), brand logo overlay, gradient overlay for readability
2. **Brand header** — Brand name, "Verified Pro" badge (if applicable), location, delivery estimate, star rating with review count
3. **About section** — Brand story with "Read more" expand/collapse
4. **Category tabs** — "All products" + dynamic subcategory tabs (from product categories)
5. **Product grid** — 4-5 column responsive grid using the `ProductCard` component
6. **Skeleton loading** — Show skeleton layout while data loads (NO spinners)
7. **Sticky "Unlock wholesale pricing" CTA** — shown to unauthenticated users

**ProductCard.tsx must include:**
- Square product image with `aspect-square`, hover scale effect
- Status badges: "Bestseller" (`badge-bestseller`), "New" (`badge-new`), "Protocol Match" (pro-navy badge)
- Product name (truncated with ellipsis)
- Brand name as secondary text
- Star rating + review count
- Gated price: authenticated users see actual price, guests see "Unlock price" link
- `product-card` CSS class from design system

**BrandCard.tsx (for brand listing page) must include:**
- Brand hero image thumbnail
- Brand logo
- Brand name + category
- "Top Shop" badge if applicable
- Star rating
- Key stat (e.g., "47 protocols matched" or "Free shipping over $200")
- Hover state with shadow elevation

**Brands.tsx (listing page) must include:**
- Category filter chips (horizontal scroll on mobile): All, Skincare, Haircare, Body, Wellness, Makeup, etc.
- Filter: "New brands", "Top rated", "Free shipping", "Low minimum"
- Responsive brand grid (3-4 columns desktop, 2 mobile)
- Skeleton loading for brand cards
- Empty state with clear messaging

---

### PHASE 3 — Protocol Mapping Engine Upgrade

**Goal:** Upgrade the mapping engine to use vector embeddings for semantic similarity, not just keyword scoring.

**Files to update:**
- `src/lib/mappingEngine.ts` — Add vector similarity scoring alongside existing keyword scoring
- `supabase/migrations/20260222000002_pgvector.sql` — New migration to enable pgvector extension
- `supabase/functions/generate-embeddings/` — New edge function to generate and store embeddings

**pgvector migration must:**
```sql
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE retail_products ADD COLUMN IF NOT EXISTS embedding vector(1536);
ALTER TABLE pro_products ADD COLUMN IF NOT EXISTS embedding vector(1536);
CREATE INDEX ON protocols USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX ON retail_products USING ivfflat (embedding vector_cosine_ops);
```

**Mapping engine upgrade:**
- Keep existing keyword/scoring system as primary
- Add `semanticSimilarity()` function using pgvector cosine distance
- Blend scores: `finalScore = (keywordScore * 0.6) + (semanticScore * 0.4)`
- Cache embeddings in DB, regenerate only on content change

---

### PHASE 4 — Search & Discovery

**Goal:** Faire-quality search with faceted filters, skeleton loading, and intelligent product discovery.

**Files to create/update:**
- `src/pages/public/Brands.tsx` — Full search results page with filters
- `src/components/SearchFilters.tsx` — New left sidebar filter component
- `src/components/SearchBar.tsx` — Upgraded global search with suggestions
- `src/lib/searchService.ts` — New search service (Supabase full-text + filters)

**Search page layout (desktop):**
```
[Left Sidebar: Filters]    [Main: Search Results Grid]
- Category                 - "5,000+ products" count
  ☐ Skincare ▾            - Filter chips (active filters)
  ☐ Haircare ▾            - Sort dropdown
  ☐ Body ▾                - Product cards grid (4-col)
- Brand                    - Pagination / infinite scroll
- Minimum order
- Ships from
- Rating
- New this month
```

**SearchFilters.tsx must include:**
- Collapsible filter groups with chevron toggle
- In-filter search for long lists (e.g., brand name search within "Brand" filter)
- Active filter chips at top of results ("×" to remove)
- "Clear all filters" button
- Mobile: slide-in drawer instead of sidebar

**searchService.ts must:**
- Use Supabase full-text search (`to_tsvector` / `plainto_tsquery`)
- Support faceted filtering (category, brand, price range, minimum order)
- Log queries to `search_analytics` table
- Return result count for "X results found" display

---

### PHASE 5 — AI Concierge Upgrade

**Goal:** Upgrade the AI Concierge to a true 5-mode intelligence assistant with context-aware responses and conversation history.

**Files to update:**
- `src/components/AIConcierge.tsx` — UI upgrade with mode selector
- `src/lib/aiConciergeEngine.ts` — Context management, conversation history, mode-specific prompting
- `supabase/functions/ai-concierge/` — Edge function upgrade

**5 Concierge Modes:**
1. **Discovery** — "Find me brands that work with microneedling" — brand discovery assistant
2. **Protocol** — "What products do I need for a Hydrafacial menu?" — protocol-to-product matching
3. **Retail** — "What should I retail to clients after a peel?" — retail recommendation engine
4. **Analytics** — "How is my retail performance this month?" — data interpretation assistant
5. **Support** — "How do I set up a new brand?" — platform help assistant

**UI requirements:**
- Mode selector tabs at top of concierge panel (icon + label)
- Chat history persisted to `conversations` table
- Context-aware: concierge knows user's service menu, current plans, and order history
- Streaming responses (use SSE or streaming from Edge Function)
- Suggested prompts per mode (e.g., Mode 1: "Show me skincare brands for sensitive skin")

---

### PHASE 6 — Analytics Dashboards

**Goal:** Build embedded analytics dashboards for all three portals using the analytics schema from Phase 1.

**Files to create:**
- `src/components/analytics/BrandDashboard.tsx` — Brand portal analytics
- `src/components/analytics/BusinessDashboard.tsx` — Business portal analytics
- `src/components/analytics/AdminDashboard.tsx` — Platform-wide admin analytics
- `src/components/analytics/MetricCard.tsx` — Reusable KPI card
- `src/components/analytics/SparklineChart.tsx` — Small trend chart
- `src/lib/analyticsService.ts` — Query service for analytics tables

**Use Recharts** for all charts (already compatible with the stack).

**Brand Dashboard must show:**
- KPI row: Total views, Protocol matches, Orders, Revenue (with % change vs last period)
- Top products table: product name, views, orders, revenue, trend sparkline
- Businesses reached chart (line chart, last 30 days)
- Match rate gauge or progress indicator
- Recent orders list

**Business Dashboard must show:**
- Menu coverage: "X of Y services have brand matches" (progress bar)
- Gap analysis summary: services needing brand matches, sorted by revenue potential
- Top performing brands (by orders)
- Retail revenue tracker (if integrated)
- Quick action cards: "Upload new menu", "Browse brands", "View plans"

**Admin Dashboard must show:**
- Platform health: Total GMV, Active brands, Active businesses, Total orders
- DAU/MAU trend chart
- New registrations by week
- Top brands by revenue table
- Recent audit log entries

---

### PHASE 7 — Scale & Polish

- Accessibility audit (keyboard nav, ARIA labels, colour contrast)
- Performance: code splitting, lazy loading images, CDN for assets
- Unit tests: add Vitest for critical service functions (mappingEngine, gapAnalysisEngine)
- Security: CSP headers, rate limiting on Edge Functions, input sanitisation audit
- `README.md` with setup guide, env vars, deployment instructions

---

## KEY RULES TO FOLLOW

1. **Never use `blue-*` Tailwind classes** — all colours use `pro-*` or `brand-*` tokens
2. **Always use skeleton loading** (`Skeleton.tsx` or `animate-pulse`) — no spinner-only states
3. **TypeScript strict** — no `any` types. Use types from `src/lib/types.ts`
4. **Log with `createScopedLogger`** from `src/lib/logger.ts`, not `console.*`
5. **Handle errors with `mapSupabaseError`** from `src/lib/errors.ts`
6. **Fonts:** `font-serif` for h1/h2/h3, `font-sans` for everything else
7. **The period in "the pro edit." is always gold** — `<span className="text-pro-gold">.</span>`
8. **Product prices are gated** — unauthenticated users see "Unlock price" CTA, not actual prices
9. **Run `npx tsc --noEmit` after every significant change** — keep TypeScript at 0 errors
10. **Analytics events** — log meaningful user actions to `platform_events` table using the service role client

---

## START HERE

Run a quick health check first:
```bash
npx tsc --noEmit
npm run lint
```

Then begin **Phase 2 — Brand Storefronts**. Start with `ProductCard.tsx` and `BrandCard.tsx` as the foundational components, then rebuild `BrandDetail.tsx`, then upgrade `Brands.tsx`.

Work through phases 2 → 3 → 4 → 5 → 6 → 7 in order, running `npx tsc --noEmit` after each phase.
