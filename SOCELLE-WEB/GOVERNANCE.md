# SOCELLE GOVERNANCE FRAMEWORK
**Effective Date:** March 5, 2026  
**Authority:** Agent 9 — Regression & Governance Agent  
**Scope:** All codebase changes, deployments, and platform decisions

---

## SECTION 1: THE LOCKED DESIGN SYSTEM — NO CHANGES ALLOWED

### Color Tokens (MINERAL V2) — SPEC AUTHORITY
These tokens are locked and must not be modified without explicit approval from design authority.

#### PRIMARY COLORS
| Token Name | Hex Value | CSS Var | Use Case | Status |
|---|---|---|---|---|
| graphite | `#141418` | `--color-text-primary` | All body text, primary content | **ACTIVE — WAS WRONG, NOW LOCKED** |
| graphite-secondary | `rgba(20,20,24,0.62)` | `--color-text-secondary` | Secondary/disabled text | **ACTIVE** |
| graphite-muted | `rgba(20,20,24,0.42)` | `--color-text-muted` | Hints, captions | **ACTIVE** |
| mineral-bg | `#F6F3EF` | `--bg` | Page background | **ACTIVE** |
| mineral-surface-alt | `#EFEBE6` | `--surface-alt` | Alternate section backgrounds | **ACTIVE** |
| card-white | `#FFFFFF` | `--card` | Card & panel surfaces | **ACTIVE** |
| panel-dark | `#1F2428` | `--panel-dark` | Dark panels (max 1/page) | **ACTIVE** |
| footer-dark | `#15191D` | `--footer` | Footer background only | **ACTIVE** |

#### ACCENT & SIGNAL COLORS
| Token Name | Hex Value | CSS Var | Use Case | Status |
|---|---|---|---|---|
| accent | `#6E879B` | `--accent` | CTAs, links, primary actions | **LOCKED** |
| accent-hover | `#5E7588` | `--accent-hover` | CTA hover state | **LOCKED** |
| signal-up | `#5F8A72` | `--signal-up` | Growth/positive signals | **LOCKED** |
| signal-warn | `#A97A4C` | `--signal-warn` | Watch/caution signals | **LOCKED** |
| signal-down | `#8E6464` | `--signal-down` | Decline/negative signals | **LOCKED** |

#### FORBIDDEN COLORS — DO NOT USE
The following colors are BANNED from all public pages and components:
- `#3E4C5E` (old warm gray)
- `#2D3748` (old charcoal)
- `#181614` (old black)
- Any warm/editorial palette colors
- `pro-*` prefixed colors on public pages (legacy portal-only)

#### Migration Status: CRITICAL FIX REQUIRED
**Current Issue:** Primary text color in code is `#1E252B` instead of locked `#141418`

**Files to Fix:**
- `tailwind.config.js` line ~27 (graphite token definition)
- `src/index.css` lines ~35-37 (CSS custom properties)

**Scope of Fix:** 400+ instances across all pages using `text-graphite` class

**Fix Template:**
```js
// BEFORE (WRONG)
graphite: '#1E252B',
--color-text-primary: #1E252B;
--color-text-secondary: rgba(30,37,43,0.62);
--color-text-muted: rgba(30,37,43,0.42);

// AFTER (LOCKED SPEC)
graphite: '#141418',
--color-text-primary: #141418;
--color-text-secondary: rgba(20,20,24,0.62);
--color-text-muted: rgba(20,20,24,0.42);
```

---

### Typography System — LOCKED

#### Typeface Authority
| Tier | Font | Usage | Source | Status |
|---|---|---|---|---|
| **Headings** | DM Serif Display | h1, h2, h3 (public pages only) | Fontshare | ✅ LOCKED |
| **Body** | General Sans (fallback: Inter) | All body copy | Fontshare (system fallback) | ✅ LOCKED |
| **Data/Code** | JetBrains Mono | Data values, code blocks | System | ✅ LOCKED |

#### Font Class Usage Rules
```css
/* ✅ CORRECT USE */
<h1 className="font-serif text-hero">...</h1>     /* DM Serif on heading */
<p className="text-base">Body copy uses Inter</p>  /* No font-serif */

/* ❌ FORBIDDEN */
<p className="font-serif">Body copy</p>           /* Serif on body copy */
<h1 className="font-sans text-hero">...</h1>      /* Sans on heading */
<span className="font-display">...</span>         /* No font-display class */
```

#### Canvas Web Font Loading
- General Sans loads from Fontshare CDN if available
- JetBrains Mono loads from system fallback (no CDN needed)
- DM Serif Display must be loaded via Fontshare or Adobe Fonts
- All font files live in `/public/fonts/` when licensed

#### Font Token Comments
**Current Issue:** `tailwind.config.js` contains misleading comments about placeholder fonts.

**Rule:** Comments must accurately reflect what's loaded:
```js
// ✅ CORRECT COMMENT
sans: ['Inter', 'system-ui', 'sans-serif'], // Licensed fonts pending

// ❌ WRONG COMMENT
sans: ['"PPNeueMontreal"', 'Inter', ...], // PPNeueMontreal never loads
```

---

### Glass System — LOCKED PARAMETERS

#### Nav Glass Pill (Primary)
```css
/* ACTIVE STATE (scrolled = false) */
background: rgba(255, 255, 255, 0.55);
backdrop-filter: blur(6px);
border: 1px solid rgba(255, 255, 255, 0.30);
border-radius: 9999px;

/* SCROLL STATE (scrolled = true) */
background: rgba(255, 255, 255, 0.80);
backdrop-filter: blur(14px);
border: 1px solid rgba(255, 255, 255, 0.45);
box-shadow: 0 4px 24px rgba(19, 24, 29, 0.08);

/* ANIMATION */
transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
```

**Rule:** Do not change blur values, opacity, border widths, or transition timing.

#### Glass Surfaces (Light)
```css
.glass-surface {
  background: rgba(255, 255, 255, 0.60);
  border: 1px solid rgba(255, 255, 255, 0.30);
  backdrop-filter: blur(12px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.glass-surface-strong {
  background: rgba(255, 255, 255, 0.80);
  border: 1px solid rgba(255, 255, 255, 0.40);
  backdrop-filter: blur(14px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
```

#### Glass Surfaces (Dark)
```css
.glass-dark {
  background: rgba(31, 36, 40, 0.60); /* panel-dark */
  border: 1px solid rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(12px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}
```

**Enforcement:** Glass values are approved for Apple Silicon + Safari rendering. Do not modify.

---

## SECTION 2: CRITICAL REGRESSIONS IDENTIFIED

### P0 — BLOCKING ISSUES (Deploy Blocker)

#### Issue #1: Primary Text Color Wrong (400+ instances)
- **Location:** All public pages using `text-graphite` class
- **Problem:** Color is `#1E252B` (WRONG) instead of `#141418` (LOCKED SPEC)
- **Impact:** Text appears 12 hex positions lighter/bluer than design authority
- **Files to Fix:** `tailwind.config.js`, `src/index.css`
- **Regression Type:** Design system violation (was never correct)
- **Fix Timeline:** IMMEDIATE (before next deployment)

#### Issue #2: Background Color Slightly Off
- **Location:** Page background throughout site
- **Problem:** Color is `#F6F4F1` instead of `#F6F3EF` (2 hex positions off)
- **Impact:** Subtle warm cast vs. cool neutral spec
- **Files to Fix:** `tailwind.config.js`, `src/index.css`
- **Fix Timeline:** Include in color token fix

#### Issue #3: Request Access Form Has No Submit Handler
- **Location:** `/request-access` page (`src/pages/public/RequestAccess.tsx`)
- **Problem:** Form collects 5 fields but submission is `e.preventDefault()` with no DB insert
- **Expected:** Data should insert into `waitlist` or `access_requests` table
- **Impact:** Leads are lost; no funnel visibility
- **Status:** Visually correct, functionally broken
- **Fix Timeline:** IMMEDIATE (critical business impact)
- **Required DB Table:** `access_requests(id, email, business_name, business_type, heard_from, created_at)`

#### Issue #4: Live Data Infrastructure Missing (5 Tables)
- **Location:** Intelligence Hub, Market Pulse, Job Demand pages
- **Problem:** UI claims "live" data but backend tables don't exist:
  - `rss_items` — RSS feed content (missing)
  - `rss_sources` — Feed registry (missing)
  - `mv_brand_health` — Trending brands (missing)
  - `mv_ingredient_emerging` — Emerging treatments (missing)
  - `mv_job_demand` — Job posting trends (missing)
- **Impact:** Intelligence pages display zero data or fake fallbacks without user knowledge
- **Current Behavior:** Falls back to `FALLBACK_SIGNALS` (hardcoded) with "Preview" label on some pages, but NO label on others
- **Fix Timeline:** WAVE 9 (backend infrastructure build)
- **Workaround:** Add "Preview Mode" disclaimer to all intelligence pages immediately

#### Issue #5: Jobs Platform Missing from Navigation
- **Location:** `MainNav.tsx` (public navigation)
- **Problem:** `/jobs` route exists in architecture but NO NAV LINK; page not implemented
- **Impact:** Users can't discover job listings; route would 404
- **Files Missing:** `src/pages/public/Jobs.tsx`, `src/pages/public/JobDetail.tsx`
- **Routes Missing:** `/jobs`, `/jobs/:slug`
- **Fix Timeline:** WAVE 9 (new feature, not regression of existing feature)

#### Issue #6: Events Platform Missing (Similar to Jobs)
- **Location:** Not present in repo; referenced in product spec
- **Problem:** `/events` page not implemented
- **Impact:** No event discovery flow
- **Fix Timeline:** WAVE 9

#### Issue #7: Benchmark Dashboard Route Missing
- **Location:** `src/pages/business/BenchmarkDashboard.tsx` exists
- **Problem:** Page exists but no route in App.tsx; nav references `/portal/benchmarks` but doesn't map
- **Impact:** Operators can't access benchmarks from nav
- **Status:** Orphaned component
- **Fix Timeline:** Wire route or remove nav reference immediately

---

### P1 — HIGH PRIORITY (Fix within 1 week)

#### Issue #8: Intelligence Hub Pages Show Zero Data Without Disclaimer
- **Pages:** `/intelligence` (public), `/portal/intelligence` (operator)
- **Problem:** When Supabase is unconfigured, pages show empty grids with NO "preview mode" label
- **Current Behavior:** 
  - Home page ✅ shows "Preview data — live pipeline activates at launch"
  - Intelligence Hub ❌ shows nothing with no explanation
- **Fix:** Add consistent disclaimer across all intelligence pages
- **Template:**
```tsx
{!isSupabaseConfigured && (
  <div className="p-4 bg-amber-50 border border-amber-300 rounded">
    Preview Mode: Live intelligence data will display here after launch.
    Visit the Intelligence Hub to explore sample insights.
  </div>
)}
```

#### Issue #9: Design System Button Component Uses Legacy Portal Tokens
- **Location:** `src/components/ui/Button.tsx`
- **Problem:** Uses `pro-*` prefixed colors (legacy) instead of mineral tokens
- **Current Use:** Only in protected routes (portals) — acceptable for backward compat
- **But:** If used on public pages, creates color inconsistency
- **Rule:** Button component may stay as-is for portal use, but NEVER import into public pages
- **Enforcement:** Code review must flag any Button usage on public routes

#### Issue #10: Font Comment Misleading
- **Location:** `tailwind.config.js` lines 123-128
- **Problem:** Comments reference placeholder fonts (PPNeueMontreal, SimplonBPMono) that never load
- **Fix:** Update comments to reflect actual fallback fonts (Inter, JetBrains Mono)

#### Issue #11: Missing Route Guard Documentation
- **Location:** No clear ruleset for which routes require ProtectedRoute vs. public access
- **Problem:** Some brand detail routes are optional-auth, creating ambiguity
- **Rule:** Document auth requirements in a `ROUTE_AUTH_MATRIX.md` file
- **Impact:** Reduces confusion for future agents; prevents accidental security gaps

---

### P2 — MEDIUM PRIORITY (Fix within 1 month)

#### Issue #12: Placeholder Copy References
- **Location:** Scattered throughout admin pages
- **Problem:** Some admin pages have "TODO: wire this section" or mock data labels
- **Rule:** No fake data on production pages; clearly label all mock sections or remove them
- **Fix Timeline:** Before public beta

#### Issue #13: Portal Page Backward Compatibility
- **Location:** `/brand/plans` and `/brand/leads` marked as LEGACY
- **Problem:** Kept for backward compat but may confuse navigation
- **Decision:** Document why these are kept and link to their replacements
- **Fix Timeline:** Post-launch documentation

---

## SECTION 3: NO-REGRESSION ENFORCEMENT CHECKLIST

Every agent must complete this checklist BEFORE marking work complete. Failure to check all items = work not delivered.

### Pre-Deployment Verification (10+ items)

- [ ] **TypeScript Build Success** — Run `npx tsc --noEmit` with zero errors
- [ ] **Color Token Compliance** — All public pages use mineral tokens, NOT `pro-*` prefixed tokens
- [ ] **Text Color Lock** — Verify no new instances of `#1E252B` (wrong) vs. `#141418` (locked)
- [ ] **No New SaaS Clichés** — Banned phrases (unlock, empower, seamless, leverage, synergy) not introduced
- [ ] **Font Classes Correct** — `font-serif` used ONLY on h1/h2/h3; never on body copy
- [ ] **Glass System Integrity** — Nav pill blur transitions (6px → 14px), opacity (55% → 80%), border colors follow spec
- [ ] **Live Data Disclaimer** — Any page claiming "live" or "real-time" data displays preview mode disclaimer if Supabase unconfigured
- [ ] **No Hardcoded Placeholders** — Mock data clearly labeled; no fake "updated X minutes ago" timestamps
- [ ] **Route Mapping Verified** — All new pages have routes in App.tsx; no orphaned components
- [ ] **Nav Consistency** — All main navigation links in MainNav.tsx correspond to real routes; no broken links
- [ ] **Supabase Migration Documented** — Any new DB changes include migration files with clear comments
- [ ] **Component Scope Clear** — New components either in `/ui` (primitives) or `/components` (feature-specific); no orphaned files
- [ ] **Meta Tags Present** — All pages have `<Helmet>` with title, description, canonical, og:* tags
- [ ] **Import Cleanup** — No unused imports; no console.log() statements; no debug code
- [ ] **Design System Extension Only** — No design token modifications without explicit scope. EXTEND (add new tokens), never REPLACE

---

## SECTION 4: PLATFORM PROTECTION DOCTRINE

### What Must NEVER Be Modified Without Explicit Scope

#### Business Portal (`/portal/*`)
- 25 routes established across 5 major flows
- **RULE:** Do not modify routing, auth, or data models without explicit work order
- **Exception:** Bug fixes to existing features require only pull request review

#### Brand Portal (`/brand/*`)
- 23 routes including campaign builder, intelligence suite, pricing tiers
- **RULE:** Do not restructure without explicit scope
- **Exception:** Cosmetic improvements to existing pages allowed

#### Admin Portal (`/admin/*`)
- 32+ routes across 6 operational tiers
- **RULE:** Stub completion and admin-only feature additions only
- **Exception:** Signal management infrastructure belongs here; order management does not

#### Auth System
- Supabase Auth integration via ProtectedRoute wrapper
- **RULE:** NEVER MODIFY without explicit security approval
- **Current State:** Using magic links + password auth; multi-factor auth not implemented
- **Future Work:** MFA implementation is WAVE 9+ scope

#### Commerce Flow
- Cart → Orders → Fulfillment
- **RULE:** Read-only for audit; modify only per commerce architecture work order
- **Current State:** Cart system exists; order fulfillment is merchant-facing

#### Supabase Backend
- 71 migrations, 8 edge functions
- **RULE:** ADD ONLY — never modify existing migrations
- **Why:** Existing production data depends on migration immutability
- **New Migrations:** Must include clear comments explaining schema changes
- **Edge Functions:** New functions added to `/supabase/functions/` with clear naming convention

#### Design Tokens
- Tailwind config + colors + typography + glass system
- **RULE:** EXTEND (add new tokens), never REPLACE existing ones
- **Why:** Existing pages depend on current token values
- **If Correction Needed:** Create new token with clear "v2" naming, update all uses, deprecate old one

---

## SECTION 5: MULTI-AGENT COORDINATION RULES

### What Each Agent Role Owns

| Agent Role | Owns | May Not Touch | Coordination Point |
|---|---|---|---|
| Copy Agent | Page titles, H1s, CTAs, meta descriptions | Color/layout/code | Copy audit per 500 words |
| Design Agent | Colors, spacing, fonts, glass | Routing/auth/DB | Design audit per component |
| Dev Agent | Feature implementation, routes, logic | Copy/design decisions | Code review + TypeScript check |
| Data Agent | Data modeling, Supabase, edge functions | UI/UX decisions | Migration documentation |
| QA Agent | Test coverage, regressions, edge cases | Feature decisions | Pre-deployment checklist |
| Governance Agent | Rules, enforcement, regressions | Individual feature work | Authority document (this file) |

### Pre-Commit Protocol

1. **Copy Agent** runs copy audit, flags clichés, verifies meta tags ✅
2. **Design Agent** runs design audit, checks tokens, verifies glass system ✅
3. **Dev Agent** implements features, runs `npx tsc --noEmit`, routes everything ✅
4. **Data Agent** creates migrations, documents schema changes ✅
5. **QA Agent** verifies all routes work, no broken links, no console errors ✅
6. **Governance Agent** checks against this enforcement list ✅

**No Pull Request Merges Without All 6 Agent Sign-Offs**

---

## SECTION 6: INTELLIGENCE-FIRST THESIS ENFORCEMENT

### Every decision must reinforce intelligence hierarchy

1. **Intelligence leads, marketplace follows** — visible in every page layout
2. **Data visualization before transaction flows** — intelligence cards above order buttons
3. **Operator intelligence first** — portal home shows intelligence feed, not orders
4. **Brand intelligence included** — brands see performance + reseller signals
5. **No generic SaaS language** — beauty industry vocabulary always
6. **Beauty is visual** — platform must feel premium, current, clinically credible

### Monthly Governance Review

- **First Wednesday of month:** Governance agent reviews all PRs merged in prior month
- **Checklist:** Are we still intelligence-first? Are tokens still locked? Are regressions caught?
- **Output:** Updated GOVERNANCE.md with any new rules or clarifications

---

## SECTION 7: KNOWN ISSUES REFERENCE

For the most up-to-date list of all P0/P1/P2 issues, consult `/sessions/affectionate-hopeful-mccarthy/mnt/SOCELLE-WEB/PLATFORM_STATUS.md`

This document is the AUTHORITY for governance rules. PLATFORM_STATUS.md is the authority for issue tracking.

---

**Document Version:** 1.0  
**Last Updated:** March 5, 2026 — Post-Audit  
**Authority:** Agent 9 — Regression & Governance  
**Next Review:** April 5, 2026

