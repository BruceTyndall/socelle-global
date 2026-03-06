# SOCELLE MASTER WORK ORDER
**Version:** 9.0 — Post Full-Platform Audit
**Date:** March 5, 2026
**Status:** Waves 1–8 Complete (25 WOs) | Wave 9 In Progress — W9-01/02/03/04/06 Complete ✅
**Compiled by:** 9-Agent Parallel Audit System

---

## ENFORCEMENT RULES (NON-NEGOTIABLE)

1. **NO PLACEHOLDER COPY.** No fake stats. No invented numbers. No "live" claims unless truly wired.
2. **LIVE DATA ONLY.** Any "signals / updated X ago / market pulse / benchmarks" must be DB-connected or clearly labeled PREVIEW/DEMO.
3. **BEAUTY IS VISUAL.** Use real assets from `/public/videos/` and `/public/images/`. No gradient art blocks as content.
4. **DESIGN LOCK.** Colors, fonts, glass system below are LOCKED. No overrides.
5. **NO OUTREACH EMAILS.** Acquisition via on-site flows only.
6. **NO PARALLEL PLANS.** One Master Work Order. Updates go here.
7. **DUAL QA GATES on every page:** Gate 1 = Intelligence density. Gate 2 = Page artistry.
8. **BUILD MUST PASS.** Every agent runs `npx tsc --noEmit` before marking complete.

---

## LOCKED DESIGN SYSTEM

### Colors — Pearl Mineral V2
```
--bg:          #F6F3EF   /* page background */
--surface-alt: #EEEAE6   /* alternate sections */
--card:        #FFFFFF   /* card surfaces */
--panel-dark:  #1F2428   /* dark panels, max 1/page */
--footer:      #15191D   /* footer only */
--ink:         #141418   /* primary text — NOT #1E252B (wrong) */
--ink-sec:     rgba(20,20,24,0.62)
--ink-muted:   rgba(20,20,24,0.42)
--on-dark:     #F7F5F2
--on-dark-sec: rgba(247,245,242,0.72)
--accent:      #6E879B   /* ONE accent only */
--accent-hov:  #5E7588
--accent-tint: rgba(110,135,155,0.10)
--signal-up:   #5F8A72
--signal-warn: #A97A4C
--signal-down: #8E6464
```

BANNED colors: terracotta, peach, blush, burgundy, sage, brass, gold-led UI, bright SaaS blues, `#0A0A0C`, `#3E4C5E`, `#2D3748`, `#181614`, any `pro-*` token on public pages.

### Typography — Option C (LOCKED)
- **Primary:** General Sans (Fontshare CDN) — ALL text, ALL public pages
- **Mono:** JetBrains Mono or Geist Mono — data values, timestamps, deltas only
- **NO SERIF** anywhere — DM Serif Display, Playfair Display, Inter all BANNED on public pages
- No `font-serif` class on any public page component

### Glass System
```css
backdrop-filter: blur(24px) saturate(1.5) brightness(1.03);
background: rgba(255,255,255,0.76);
border: 1px solid rgba(255,255,255,0.55);
box-shadow: inset 0 1px 0 rgba(255,255,255,0.92), inset 0 -1px 0 rgba(200,196,190,0.22), 0 8px 32px rgba(20,20,24,0.08);
```
NOT generic blur boxes. Pearl diffusion. Tone-switching (light/dark sections). Highlight edge required.

---

## SITE MAP (Audit-Verified, March 5, 2026)

### Public Routes (26 routes)
| Route | File | Nav? | Status |
|---|---|---|---|
| `/` | *Coming soon gate — separate deploy* | — | ⚠️ DUAL DEPLOY ISSUE |
| `/home` | `Home.tsx` | — | ✅ SPA entry |
| `/intelligence` | `Intelligence.tsx` | ✅ | ✅ |
| `/brands` | `Brands.tsx` | ✅ (live) | ✅ |
| `/brands/:slug` | `BrandStorefront.tsx` | — | ✅ |
| `/education` | `Education.tsx` | ✅ (live) | ✅ — MISSING from code nav |
| `/protocols` | `Protocols.tsx` | ✅ (code) | ✅ |
| `/protocols/:slug` | `ProtocolDetail.tsx` | — | ✅ |
| `/for-buyers` | `ForBuyers.tsx` | ✅ | ✅ |
| `/for-brands` | `ForBrands.tsx` | ✅ | ✅ |
| `/for-medspas` | `ForMedspas.tsx` | — | ✅ |
| `/for-salons` | `ForSalons.tsx` | — | ✅ |
| `/how-it-works` | `HowItWorks.tsx` | — | ✅ |
| `/pricing` | `Pricing.tsx` | ✅ | ✅ |
| `/about` | `About.tsx` | ✅ (code) | ✅ |
| `/request-access` | `RequestAccess.tsx` | — | 🔴 FORM BROKEN |
| `/faq` | `FAQ.tsx` | — | ✅ |
| `/api/docs` | `ApiDocs.tsx` | — | ✅ |
| `/api/pricing` | `ApiPricing.tsx` | — | ✅ |
| `/events` | **MISSING** | ✅ (live) | 🔴 NO PAGE FILE |
| `/jobs` | **MISSING** | ✅ (live) | 🔴 NO PAGE FILE |
| `/claim/brand/:slug` | `ClaimBrand.tsx` | — | ✅ |
| `/claim/business/:slug` | `ClaimBusiness.tsx` | — | ✅ |
| `/forgot-password` | `ForgotPassword.tsx` | — | ✅ |
| `/reset-password` | `ResetPassword.tsx` | — | ✅ |
| `/privacy` + `/terms` | `Privacy.tsx`, `Terms.tsx` | — | ✅ |

### Business Portal (/portal/*) — 16 routes — DO NOT MODIFY without WO scope
### Brand Portal (/brand/*) — 15 routes — DO NOT MODIFY without WO scope
### Admin Portal (/admin/*) — 24 routes — DO NOT MODIFY without WO scope

---

## NAVIGATION ISSUES (Audit-Verified)

### Code MainNav (current) vs Live Nav (deployed)
| Live Site Shows | In Code Nav | Status |
|---|---|---|
| Intelligence | ✅ Yes | ✅ Match |
| Brands | ❌ No | 🔴 Missing — add |
| Education | ❌ No | 🔴 Missing — add |
| Jobs | ❌ No | 🔴 Missing — page also missing |
| Events | ❌ No | 🔴 Missing — page also missing |
| For Buyers | ✅ Yes | ✅ Match |
| For Brands | ✅ Yes | ✅ Match |
| Pricing | ✅ Yes | ✅ Match |
| Protocols | ✅ (code only) | — |
| About | ✅ (code only) | — |

### Auth-Aware Nav (MISSING)
When user is logged in, the right pill currently shows email + sign out only.
REQUIRED behavior:
- `admin` / `platform_admin` → show "Admin →" link to `/admin`
- `business_user` → show "My Portal →" link to `/portal/dashboard`
- `brand_admin` → show "Brand Portal →" link to `/brand/dashboard`

---

## AUDIT FINDINGS — P0/P1/P2

### P0 — CRITICAL (Block launch / fix immediately)

| ID | Issue | File | Fix | Hours |
|---|---|---|---|---|
| P0-01 | Text color `#1E252B` instead of `#141418` | `tailwind.config.js` line `graphite` | Change to `#141418` | 0.5h |
| P0-02 | BG color `#F6F4F1` instead of `#F6F3EF` | `tailwind.config.js` + `index.css` | Change to `#F6F3EF` | 0.25h |
| P0-03 | RequestAccess form has `e.preventDefault()` but NO DB insert | `RequestAccess.tsx` | Wire Supabase insert + success state | 2h |
| P0-04 | `/events` page missing entirely | `App.tsx` + create file | Create Events.tsx + add route | 4h |
| P0-05 | `/jobs` page missing entirely | `App.tsx` + create file | Create Jobs.tsx (Phase 1 stub) + add route | 4h |
| P0-06 | Nav does not include Brands, Education, Events, Jobs | `MainNav.tsx` | Update NAV_LINKS | 0.5h |
| P0-07 | Auth-aware portal nav missing | `MainNav.tsx` | Add role-based portal shortcut | 1h |
| P0-08 | No `/home` redirect (SPA entry via weird path) | `App.tsx` | Add `/home` → `/` redirect | 0.1h |
| P0-09 | Benchmark Dashboard orphaned (no route) | `App.tsx` | Add `/portal/benchmarks` route | 0.25h |
| P0-10 | Intelligence shows empty grids with no disclaimer | `Intelligence.tsx` | Add PREVIEW label to mock signal cards | 1h |

### P1 — HIGH (Fix within 1 week)

| ID | Issue | File | Fix | Hours |
|---|---|---|---|---|
| P1-01 | 9 pages missing Helmet meta tags | `HowItWorks.tsx`, `Pricing.tsx`, `FAQ.tsx`, `Education.tsx`, `Protocols.tsx`, `Brands.tsx`, `ApiDocs.tsx`, `ApiPricing.tsx`, `ProtocolDetail.tsx` | Add HelmetProvider meta to each | 2h |
| P1-02 | Sitemap has only 7 URLs (should be 17+) | `public/sitemap.xml` | Expand per SITEMAP_PLAN.md | 1h |
| P1-03 | `/brands` missing CollectionPage schema | `Brands.tsx` | Add JSON-LD | 0.5h |
| P1-04 | `/faq` missing FAQPage schema | `FAQ.tsx` | Add JSON-LD | 0.5h |
| P1-05 | Protocol detail pages missing dynamic meta | `ProtocolDetail.tsx` | Add dynamic Helmet from protocol data | 1h |
| P1-06 | Brand storefront missing ProfessionalService schema | `BrandStorefront.tsx` | Add JSON-LD | 1h |
| P1-07 | Intelligence → Brands cross-linking missing | `Intelligence.tsx` | Add "See trending brands" links to signal cards | 1h |
| P1-08 | `font-serif` must be removed from public pages | `Home.tsx` WordReveal component | Replace with General Sans weight variant | 2h |

### P2 — MEDIUM (Fix within 1 month)

| ID | Issue | File | Fix | Hours |
|---|---|---|---|---|
| P2-01 | Live data tables missing (5 tables) | Supabase migrations | Create rss_items, brand_health, etc. | 8h |
| P2-02 | Intelligence page shows static mock signals | `Intelligence.tsx` | Wire to Supabase signals table with PREVIEW label | 4h |
| P2-03 | No access_requests Supabase table | Supabase migrations | Create table + wire RequestAccess form | 2h |
| P2-04 | Legacy brand portal routes undocumented | `App.tsx` | Add deprecation comments | 0.5h |
| P2-05 | Font comments reference fonts that don't load | `tailwind.config.js` | Clean up comments | 0.25h |
| P2-06 | About page title has `-- ` typo | `About.tsx` Helmet | Change to em-dash `—` | 0.1h |

---

## VISUAL ASSETS (Audit-Verified)

### Videos — All 6 Active in Codebase
| File | Size | Current Use | Optimal Use |
|---|---|---|---|
| `dropper.mp4` | 3.3MB | Home hero | Home hero ✅ |
| `blue-drops.mp4` | 9.8MB | ForBuyers hero | ForBuyers hero ✅ |
| `tube.mp4` | 2.1MB | ForBrands hero | Conversion close section |
| `foundation.mp4` | 2.7MB | ForSalons hero | ForSalons hero ✅ |
| `air-bubbles.mp4` | 1.3MB | ForMedspas hero | ForMedspas hero ✅ |
| `yellow-drops.mp4` | 5.5MB | HowItWorks hero | HowItWorks hero ✅ |

**Action:** Generate WebM versions for 30-40% compression. Target: hero <2MB, ambient <1MB.

### Photos — All photo-1 through photo-7 SVGs Contain Base64 JPEGs
| File | Size | Current Use | Action |
|---|---|---|---|
| `photo-4.svg` | ~32KB | Intelligence.tsx (7% opacity watermark) | Extract JPEG, use directly |
| `photo-1,2,3,5,6,7.svg` | ~32KB each | **UNUSED** | Delete (200KB recovered) |

### Swatches — 12 SVGs in `/public/images/swatches/` — ALL UNUSED
63MB of embedded base64 JPEGs. **Delete immediately** unless being wired into Brand Intelligence grid.

---

## LIVE DATA ARCHITECTURE

### Current State
| Surface | UI Claims | Actual Source | Status |
|---|---|---|---|
| Home Market Pulse | "Live signals" | Mock array with DEMO label | ✅ HONEST PREVIEW |
| Intelligence Hub | Signal cards | Supabase `brand_interest_signals` (admin-managed) | ⚠️ REAL but limited |
| Intelligence Hub | "Updated every 5 minutes" | No refresh mechanism exists | 🔴 FALSE CLAIM |
| Portal Intelligence | Peer benchmarks | Mock/hardcoded | ⚠️ LABELED PREVIEW |
| Brand Storefronts | Adoption metrics | Hardcoded mock | ⚠️ NEEDS LABEL |

### Required Supabase Tables (create in Wave 9)
```sql
-- Market signals feed
CREATE TABLE market_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  headline TEXT NOT NULL,
  delta NUMERIC,
  direction TEXT CHECK (direction IN ('up', 'warn', 'down')),
  confidence TEXT CHECK (confidence IN ('high', 'medium', 'low')),
  source_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

-- Access requests (from RequestAccess form)
CREATE TABLE access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  user_type TEXT,
  business_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending'
);
```

---

## CTA LIBRARY (Intelligence-First)

### Discovery
- "Get Intelligence Access" (primary, all pages)
- "View Today's Briefing"
- "See Market Pulse"
- "Explore Signal Feed"
- "See What's Moving"
- "Check Category Trends"
- "View Adoption Data"

### Proof
- "Benchmark Your Market"
- "See Peer Comparison"
- "Check Your Category Position"
- "View Industry Benchmarks"

### Access
- "Request Platform Access"
- "Claim Your Intelligence Seat"
- "Apply as a Brand Partner"
- "Claim Your Brand Profile"

### Commerce
- "Browse Verified Brands"
- "Shop Wholesale"
- "View Brand Protocols"

### BANNED CTAs
Get Started, Learn More, Unlock Growth, Discover More, Sign Up Today, Join Now (without context)

---

## SEO PRIORITY ACTIONS

### P0 (Add immediately)
1. Add Helmet to: HowItWorks, Pricing, FAQ, Education, Protocols, Brands, ApiDocs, ApiPricing
2. Add dynamic Helmet to ProtocolDetail (pull title/desc from protocol data)
3. Add dynamic Helmet to BrandStorefront (pull brand name/desc from brand data)
4. Expand sitemap from 7 → 17 core URLs

### P1 (Week 2)
5. Add CollectionPage schema to /brands and /protocols
6. Add FAQPage schema to /faq
7. Add ProfessionalService schema to brand storefronts
8. Add BreadcrumbList to /brands/:slug and /protocols/:slug
9. Add cross-links: Intelligence ↔ Brands, ForBuyers → Intelligence

### P2 (Month 1)
10. Dynamic sitemaps: sitemap-brands.xml (from Supabase brands table), sitemap-protocols.xml
11. JobPosting schema (once /jobs pages built)
12. Event schema (once /events pages built)

---

## CONVERSION FUNNEL FIXES

### Current Broken Flow
`Homepage CTA` → `RequestAccess page` → `form submits` → **NOTHING HAPPENS** (e.preventDefault, no DB insert)

### Required Fix
```typescript
// RequestAccess.tsx — add submit handler
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const { error } = await supabase
    .from('access_requests')
    .insert({ email, user_type: role, business_name: company });
  if (!error) setSubmitted(true);
};
```

### Correct Funnel (post-fix)
1. Homepage → "Get Intelligence Access"
2. RequestAccess form → submit → Supabase insert → success state → "Check your email"
3. Email (via Supabase edge function) → portal signup link
4. Portal signup → dashboard with intelligence preview

---

## WAVE 9 SCOPE — APPROVED WORK ORDERS

### W9-01: Critical Regressions + Nav Fix ✅ COMPLETE (March 5, 2026)
**Priority: P0 — Do First**
- Fix tailwind.config.js color tokens (graphite #141418, bg #F6F3EF)
- Fix MainNav.tsx: update NAV_LINKS (add Brands, Education, Events, Jobs), add role-aware portal link
- Add /home redirect in App.tsx
- Add /portal/benchmarks route for BenchmarkDashboard
- Fix RequestAccess.tsx form (wire to Supabase, add success state)
- Create access_requests migration

**QA Gate 1 (Intelligence):** Nav links to real pages. Portal link works by role.
**QA Gate 2 (Artistry):** Nav still looks like pearl glass 3-pill. No style regressions.

### W9-02: Events Platform — Phase 1 ✅ COMPLETE (March 5, 2026)
**Priority: P0**
- Create `src/pages/public/Events.tsx` — industry calendar page
- Design: dark hero, filter pills (Time + Type), event card grid, event detail template
- Mock data: 8 events (The Skin Games, AmSpa, Premiere Orlando, etc.)
- Add route `/events` to App.tsx
- Add Helmet meta, Event schema placeholder
- Add `/events` to MainNav

**QA Gate 1:** Page shows real industry events with dates/locations/categories.
**QA Gate 2:** Dark hero + filter system + card grid. Matches design spec.

### W9-03: Jobs Platform — Phase 1 Stub ✅ COMPLETE (March 5, 2026)
**Priority: P0**
- Create `src/pages/public/Jobs.tsx` — professional beauty job board
- Create `src/pages/public/JobDetail.tsx` — individual job page
- Create Supabase migration: job_postings table
- 12 mock beauty industry jobs (medspa injector, spa director, esthetician, etc.)
- Filters: Role, Vertical, Location, Remote/On-site
- Route: `/jobs` and `/jobs/:slug`
- JobPosting JSON-LD schema on detail pages
- Add `/jobs` to MainNav

**QA Gate 1:** Shows real-seeming job listings with honest "DEMO — Live jobs coming" label.
**QA Gate 2:** Grid layout, filter system, job card design matches mineral system.

### W9-04: SEO Foundation ✅ COMPLETE (March 5, 2026)
**Priority: P1**
- Add Helmets to 9 missing pages (see P1-01 above)
- Expand sitemap.xml from 7 → 17 core URLs
- Add CollectionPage schema to /brands and /protocols
- Add FAQPage schema to /faq
- Add dynamic meta to ProtocolDetail and BrandStorefront
- Add cross-links (Intelligence → Brands, ForBuyers → Intelligence)
- Fix About page title `-- ` → `—`

**QA Gate 1:** Every public page has title + desc. No blank SERPs.
**QA Gate 2:** No visual changes to pages.

### W9-05: Live Data — Signals Infrastructure (Est. 10h)
**Priority: P2**
- Create market_signals Supabase table + migration
- Wire Intelligence Hub signal cards to market_signals table
- Add admin UI to manage signals (add/edit/expire)
- Remove false "updated every 5 minutes" claim
- Add honest freshness timestamps where real (use DB updated_at)
- Wire Market Pulse on Home to Supabase (with DEMO fallback)

**QA Gate 1:** Every "live" claim is real or clearly labeled DEMO.
**QA Gate 2:** Signal cards still look great with real data.

### W9-06: Remove Font-Serif Violations ✅ COMPLETE (March 5, 2026)
**Priority: P1**
- Find all `font-serif` usage in public pages: `grep -r "font-serif" src/pages/public/`
- Replace with General Sans weight equivalents (bold/700 or 800)
- Ensure General Sans is loading from Fontshare CDN in index.html
- Remove DM Serif Display, Playfair Display, Inter from Google Fonts import in index.html

**QA Gate 1:** `npx tsc --noEmit` passes, 0 font-serif on public pages.
**QA Gate 2:** Headlines still look premium. Not flat. Use weight + tracking instead of serif.

---

## JOBS PLATFORM — LONGER TERM (Wave 10)

### Phase 2: Live Pipeline (Est. 96h)
See `JOBS_AUDIT.md` and `JOBS_PATCH_LIST.md` for complete spec.

- WO-26: DB Schema (8h)
- WO-27: Job Services TS (6h)
- WO-28: Jobs Page + Components (12h)
- WO-29: JobPosting Schema (4h)
- WO-30: SEO Hubs x6 (10h)
- WO-31: Admin Analytics (8h)
- WO-32: Business Portal Integration (10h)
- WO-33: Pipeline Foundation Python (6h)
- WO-34: Scrapers + Transformers (20h)
- WO-35: Deploy + Monitor (4h)
- WO-36: QA (8h)

### International Expansion Wave 1 (after live pipeline)
Countries: United Kingdom, Canada, Australia, UAE
Routes: `/jobs/uk`, `/jobs/ca`, `/jobs/au`, `/jobs/uae`
Requirements: hreflang, local job board aggregator integrations, currency-adjusted salary display

---

## NO-REGRESSION CHECKLIST (Every PR)

Before marking any work order complete, verify ALL 15 items:

- [ ] `npx tsc --noEmit` — zero TypeScript errors
- [ ] `graphite` token in tailwind = `#141418` (not `#1E252B`)
- [ ] `mn-bg` / background = `#F6F3EF` (not `#F6F4F1`)
- [ ] No `font-serif` class on any file in `src/pages/public/`
- [ ] No banned SaaS phrases: grep "unlock\|seamless\|leverage\|streamline\|optimize\|synergy\|empower" src/pages/public/
- [ ] All "live" UI claims are either DB-connected or labeled DEMO/PREVIEW
- [ ] No `pro-*` color tokens on public pages
- [ ] General Sans loading from Fontshare (not removed from index.html)
- [ ] RequestAccess form submit wires to Supabase (not dead preventDefault)
- [ ] MainNav NAV_LINKS includes: Intelligence, Brands, Education, Events, Jobs, For Buyers, For Brands, Pricing
- [ ] Auth-aware portal link in nav right pill (admin/business/brand)
- [ ] No existing Supabase migrations modified (ADD ONLY)
- [ ] No Business/Brand/Admin portal routes touched without explicit WO scope
- [ ] Commerce flow (cart, orders, checkout) untouched
- [ ] Auth system (ProtectedRoute, AuthProvider) untouched

---

## AUDIT FILES PRODUCED (March 5, 2026)

All in `/SOCELLE-WEB/`:
- `SITE_MAP.md` — full route inventory
- `COPY_AUDIT.md` — page-by-page copy scores + rewrites + CTA library
- `DESIGN_AUDIT.md` — token violations + component issues
- `TOKENS_DIFF.md` — current vs required token values
- `ASSET_MANIFEST.md` — video/photo inventory + placements
- `LIVE_DATA_AUDIT.md` — every "live" surface traced to source
- `SEO_AUDIT.md` — meta tags + schema + sitemap
- `SCHEMA_TEMPLATES.md` — JSON-LD templates (10 types)
- `SITEMAP_PLAN.md` — 4-phase sitemap strategy
- `FUNNEL_AUDIT.md` — gate + conversion flow analysis
- `JOBS_AUDIT.md` — jobs platform gap analysis
- `JOBS_PATCH_LIST.md` — jobs implementation roadmap
- `GOVERNANCE.md` — locked design system + enforcement rules
- `PLATFORM_STATUS.md` — P0/P1/P2 priority matrix
- `NO_REGRESSION_CHECKLIST.md` — 15-item pre-deployment checklist

---

*SOCELLE MASTER WORK ORDER v9.1 — Waves 1–8 Complete (25 WOs) + W9-01/02/03/04/06 Complete — W9-05 (Live Signals) Remaining*
