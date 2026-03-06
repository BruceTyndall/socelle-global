> **DEPRECATED — 2026-03-06**
> This file is no longer authoritative. Replaced by:
> - `SOCELLE-WEB/docs/build_tracker.md` (sole WO authority per CLAUDE.md §D)
>
> Do not reference this file as authority. See `/.claude/CLAUDE.md` §B FAIL 1.

---

# SOCELLE — Phase 1 Work Order
## Cursor Multi-Agent Deployment

**Status:** Pre-launch blockers. Nothing ships until every item in this order is complete and verified.
**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Supabase → Netlify
**Repo root:** `SOCELLE-WEB/`

---

## BEFORE AGENTS RUN — Owner Decisions Required

These cannot be resolved by an agent. The owner must decide before deployment starts.

| # | Decision | What Agent Needs |
|---|---|---|
| D1 | Professional contact email | The exact address to replace `debvaihello@gmail.com` — e.g. `hello@socelle.com` |
| D2 | Stats bar treatment | Either: (A) remove the stats bar entirely, or (B) replace figures with the pre-launch copy provided below |
| D3 | Testimonials treatment | Either: (A) remove the testimonials section entirely, or (B) supply 1–3 real quotes with real names/titles |
| D4 | Insights page treatment | Either: (A) remove Insights from the public nav, or (B) remove the placeholder disclosure line only |

**Defaults if owner does not specify before deploy:**
- D1: Use `hello@socelle.com` as placeholder — owner must update DNS/inbox
- D2: Replace stats with pre-launch copy (provided in Agent B below)
- D3: Remove testimonials section entirely
- D4: Remove the disclosure line; keep the page in the nav

---

## AGENT MAP — Parallelism

All six agents can run simultaneously. There are no dependencies between them. Each agent touches a distinct file set.

```
┌─────────────────────────────────────────────────────────────┐
│  PARALLEL — launch all six at once                          │
│                                                             │
│  Agent A  →  Email replacement (4 files)                   │
│  Agent B  →  Stats bar + Testimonials (Home.tsx)           │
│  Agent C  →  index.html fixes (meta, title, favicon ref)   │
│  Agent D  →  Favicon + OG assets (public/)                 │
│  Agent E  →  Insights page fix (Insights.tsx)              │
│  Agent F  →  Per-page SEO meta (all public pages)          │
│                                                             │
│  Agent G  →  Apply + Signup audit (read-only, report out)  │
└─────────────────────────────────────────────────────────────┘
```

---

## AGENT A — Email Replacement

**Objective:** Replace every instance of `debvaihello@gmail.com` with the professional contact email across all public-facing files. No other changes.

**Files to touch:**
```
src/pages/public/Home.tsx
src/pages/public/About.tsx
src/pages/public/Pricing.tsx
src/pages/public/Insights.tsx
```

**Task:**

Search every file listed above for:
```
debvaihello@gmail.com
```

Replace every instance with:
```
hello@socelle.com
```

This appears in two contexts across these files:
1. `href="mailto:debvaihello@gmail.com"` — replace the email address inside the href
2. As visible link text `debvaihello@gmail.com` — replace the display text too

**Exact pattern in footer (all four files):**
```tsx
// BEFORE
<a href="mailto:debvaihello@gmail.com" className="hover:text-white transition-colors">Contact</a>

// AFTER
<a href="mailto:hello@socelle.com" className="hover:text-white transition-colors">Contact</a>
```

**Exact pattern in Pricing.tsx FAQ:**
```tsx
// BEFORE
<a href="mailto:debvaihello@gmail.com" className="font-medium text-pro-charcoal hover:underline">
  debvaihello@gmail.com
</a>

// AFTER
<a href="mailto:hello@socelle.com" className="font-medium text-pro-charcoal hover:underline">
  hello@socelle.com
</a>
```

**Verification:** After changes, grep the entire `src/` directory for `debvaihello` — result must be zero matches.

```bash
grep -r "debvaihello" src/
# Expected output: (none)
```

---

## AGENT B — Stats Bar + Testimonials

**Objective:** Remove or replace the fictional projected stats and the placeholder testimonials in `Home.tsx`.

**File to touch:**
```
src/pages/public/Home.tsx
```

### Task B1 — Stats Bar

**Locate** the `STATS` constant near the top of the file:
```tsx
const STATS = [
  { value: '500+', label: 'Professional brands' },
  { value: '12k+', label: 'Licensed businesses' },
  { value: '1',    label: 'Platform, one cart' },
  { value: '✓',   label: 'Verified wholesale' },
];
```

**Replace** with this pre-launch version:
```tsx
const STATS = [
  { value: 'Open',   label: 'Early access now' },
  { value: '2026',   label: 'Launch year' },
  { value: '1',      label: 'Platform, one cart' },
  { value: '✓',      label: 'Verified wholesale' },
];
```

**Also locate and remove** the footnote beneath the stats grid. Find this line:
```tsx
<p className="text-center text-[11px] text-pro-warm-gray/50 font-sans mt-10 tracking-wide">
  Projected targets · figures based on platform growth model
</p>
```
Delete it entirely.

**Also locate** the quick-stat pills in the hero right-panel and replace:
```tsx
// BEFORE
{ value: '500+', label: 'Brands' },
{ value: '1',    label: 'Cart' },
{ value: '✓',   label: 'Verified' },

// AFTER
{ value: 'Open', label: 'Early access' },
{ value: '1',    label: 'Cart' },
{ value: '✓',   label: 'Verified' },
```

### Task B2 — Testimonials Section

**Locate** the TESTIMONIALS section. It is preceded by this comment:
```tsx
{/* NOTE: Placeholder quotes — replace with real testimonials before launch */}
```

**Remove** the entire testimonials `<RevealSection>` block — from the opening `<RevealSection>` that wraps the testimonials section to its closing `</RevealSection>`. This includes the section header ("Early feedback", "What professionals are saying") and all three testimonial cards.

Do not remove the `TESTIMONIALS` constant at the top of the file — leave it in place as a reference for when real quotes are ready.

**Verification:**
1. Search `Home.tsx` for `Projected targets` — must return zero matches
2. Search `Home.tsx` for `Placeholder quotes` — the comment should still exist but the section it references should be gone from the JSX render
3. The page should render without errors — run `npm run typecheck` if available

---

## AGENT C — index.html Fixes

**Objective:** Fix the meta description, page title, and favicon reference in `index.html`.

**File to touch:**
```
index.html
```

### Task C1 — Meta Description

**Find:**
```html
<meta name="description" content="Socelle connects service businesses with premium professional brands through AI-powered protocol matching, gap analysis, and phased retail activation." />
```

**Replace with:**
```html
<meta name="description" content="Socelle is the professional beauty wholesale marketplace. Licensed salons, spas, and medspas discover and order from verified brands — one platform, one cart." />
```

### Task C2 — OG Description

**Find:**
```html
<meta property="og:description" content="Find the brands built for your treatment room. AI-powered matching for spas, salons, and wellness businesses." />
```

**Replace with:**
```html
<meta property="og:description" content="The professional beauty wholesale marketplace. One platform connecting verified brands with licensed salons, spas, and medspas." />
```

### Task C3 — OG Title (minor tightening)

**Find:**
```html
<meta property="og:title" content="Socelle — Premium Service Marketplace" />
```

**Replace with:**
```html
<meta property="og:title" content="Socelle — Professional Beauty Wholesale Marketplace" />
```

### Task C4 — Page Title

**Find:**
```html
<title>Socelle — Premium Service Marketplace</title>
```

**Replace with:**
```html
<title>Socelle — Professional Beauty Wholesale</title>
```

### Task C5 — Favicon Reference

**Find:**
```html
<link rel="icon" type="image/svg+xml" href="/vite.svg" />
```

**Replace with:**
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="alternate icon" href="/favicon.ico" />
```

Note: Agent D will create `public/favicon.svg`. Agent C only updates the reference.

### Task C6 — Add Missing OG Tags

**After** the existing Twitter card tags, add:
```html
<meta property="og:type" content="website" />
<meta property="og:url" content="https://socelle.com" />
<meta property="og:image" content="https://socelle.com/og-image.png" />
<meta name="twitter:description" content="The professional beauty wholesale marketplace. One platform connecting verified brands with licensed salons, spas, and medspas." />
<meta name="twitter:image" content="https://socelle.com/og-image.png" />
```

**Verification:** Validate the final `index.html` head contains no reference to `AI-powered protocol matching` and no reference to `vite.svg` as primary favicon.

---

## AGENT D — Favicon + OG Placeholder Assets

**Objective:** Create a proper `favicon.svg` in the `public/` directory. Create an `og-image.png` placeholder. The vite.svg file can remain but will no longer be referenced.

**Files to create:**
```
public/favicon.svg
public/og-image.png  ← placeholder; real asset to be designed
```

### Task D1 — Create favicon.svg

Create `public/favicon.svg` with this content — a clean wordmark-based SVG favicon using the SOCELLE brand colors:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="6" fill="#8C6B6E"/>
  <text
    x="16"
    y="23"
    font-family="Georgia, serif"
    font-size="18"
    font-weight="400"
    fill="#F5F3F0"
    text-anchor="middle"
    letter-spacing="-0.5"
  >S</text>
  <circle cx="24" cy="24" r="2" fill="#D4A44C"/>
</svg>
```

This renders as: warm rosewood square, ivory serif "S", gold period dot. It will hold until the real logomark is designed.

### Task D2 — Create og-image.png placeholder

This is a placeholder file. Create a minimal 1200×630 SVG saved as `public/og-image.svg` (browsers and most OG scrapers accept SVG):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <rect width="1200" height="630" fill="#1A1714"/>
  <rect width="1200" height="1" y="1" fill="#D4A44C" opacity="0.4"/>
  <text
    x="600"
    y="290"
    font-family="Georgia, serif"
    font-size="96"
    font-weight="400"
    fill="#F5F3F0"
    text-anchor="middle"
    letter-spacing="-2"
  >socelle</text>
  <circle cx="837" cy="290" r="7" fill="#D4A44C"/>
  <text
    x="600"
    y="360"
    font-family="Arial, sans-serif"
    font-size="24"
    font-weight="400"
    fill="#6B6560"
    text-anchor="middle"
    letter-spacing="4"
  >PROFESSIONAL BEAUTY WHOLESALE</text>
</svg>
```

Also update the OG image reference in `index.html` (Agent C handles this) to point to `/og-image.svg` if PNG is not yet available.

**Verification:**
1. `public/favicon.svg` exists and is valid SVG
2. `public/og-image.svg` exists
3. `public/vite.svg` still exists (do not delete — just no longer referenced as primary favicon)

---

## AGENT E — Insights Page Fix

**Objective:** Remove the publicly visible placeholder disclosure from `Insights.tsx`. The page stays in the nav.

**File to touch:**
```
src/pages/public/Insights.tsx
```

### Task E1 — Remove the "full integration in progress" disclosure

**Find and remove** this paragraph from the "What we're watching" section:
```tsx
<p className="text-center text-pro-warm-gray font-light text-sm max-w-lg mx-auto">
  We use industry sources and trend data to surface what's relevant. APIs and feeds are wired in to keep this page fresh — sign in or join to get personalized briefs.
</p>
```

**Replace with:**
```tsx
<p className="text-center text-pro-warm-gray font-light text-sm max-w-lg mx-auto">
  Curated from industry sources and trend data. Sign in or join for personalized briefs.
</p>
```

### Task E2 — Remove the "full integration in progress" footer line

**Find and remove** this line at the bottom of the trends grid section:
```tsx
<p className="text-center text-sm text-pro-warm-gray font-light mt-10">
  Trend content is powered by industry feeds and APIs — full integration in progress.
</p>
```

Delete this element entirely. Do not replace it.

### Task E3 — Update trend card dates

**Find** the `TREND_PLACEHOLDERS` constant. The date fields currently say `'2026'`. Update the source labels to read more specifically:

```tsx
// BEFORE
{ source: 'Industry report', date: '2026' },
{ source: 'Trend data', date: '2026' },
{ source: 'Category pulse', date: '2026' },

// AFTER
{ source: 'Industry report', date: 'Q1 2026' },
{ source: 'Market intelligence', date: 'Q1 2026' },
{ source: 'Category pulse', date: 'Q1 2026' },
```

**Verification:**
1. Search `Insights.tsx` for `full integration in progress` — must return zero matches
2. Search `Insights.tsx` for `APIs and feeds are wired in` — must return zero matches

---

## AGENT F — Per-Page SEO Meta Tags

**Objective:** Add a `<title>` and `<meta name="description">` management pattern to each public page. Since this is a Vite SPA without SSR, use `react-helmet-async` — install it if not present.

**Files to touch:**
```
package.json               ← add react-helmet-async if not present
src/main.tsx               ← wrap app in HelmetProvider
src/pages/public/Home.tsx
src/pages/public/About.tsx
src/pages/public/Pricing.tsx
src/pages/public/Insights.tsx
src/pages/public/Brands.tsx
```

### Task F1 — Install react-helmet-async

Check `package.json` dependencies for `react-helmet-async`. If not present, add it:
```bash
npm install react-helmet-async
```

### Task F2 — Wrap app in HelmetProvider

In `src/main.tsx`, import and wrap the app:
```tsx
import { HelmetProvider } from 'react-helmet-async';

// Wrap the existing app render:
<HelmetProvider>
  <App />
</HelmetProvider>
```

### Task F3 — Add Helmet to each public page

Add the following `<Helmet>` block at the top of each page's return statement, inside the outermost div, before `<MainNav />`.

Import at the top of each file:
```tsx
import { Helmet } from 'react-helmet-async';
```

**Home.tsx:**
```tsx
<Helmet>
  <title>Socelle — Professional Beauty Wholesale Marketplace</title>
  <meta name="description" content="The professional beauty wholesale marketplace. Licensed salons, spas, and medspas discover and order from verified brands — one platform, one cart." />
  <meta property="og:title" content="Socelle — Professional Beauty Wholesale Marketplace" />
  <meta property="og:description" content="One platform connecting verified beauty brands with licensed salons, spas, and medspas. Tiered wholesale pricing, multi-brand cart." />
</Helmet>
```

**About.tsx:**
```tsx
<Helmet>
  <title>About Socelle — Built for Professional Beauty</title>
  <meta name="description" content="Socelle is fixing the professional beauty supply chain. One verified wholesale marketplace for brands, salons, spas, and medspas." />
  <meta property="og:title" content="About Socelle" />
  <meta property="og:description" content="The professional beauty supply chain is broken. Socelle is fixing it — one verified wholesale marketplace for brands and licensed resellers." />
</Helmet>
```

**Pricing.tsx:**
```tsx
<Helmet>
  <title>Pricing — Socelle Professional Beauty Wholesale</title>
  <meta name="description" content="Commission-only for brands. Free forever for licensed resellers. Simple, transparent wholesale marketplace pricing with no monthly fees." />
  <meta property="og:title" content="Socelle Pricing — Simple and Transparent" />
  <meta property="og:description" content="Brands pay only when they sell. Resellers join free. No monthly fees, no minimums, no lock-in." />
</Helmet>
```

**Insights.tsx:**
```tsx
<Helmet>
  <title>Insights — Professional Beauty Trends | Socelle</title>
  <meta name="description" content="Professional beauty intelligence: ingredients, treatment room trends, and market shifts curated for salons, spas, and medspas." />
  <meta property="og:title" content="Professional Beauty Insights — Socelle" />
  <meta property="og:description" content="Trends, ingredients, and market intelligence for professional beauty buyers. Curated for salons, spas, and medspas." />
</Helmet>
```

**Brands.tsx:**
```tsx
<Helmet>
  <title>Browse Professional Beauty Brands — Socelle Wholesale</title>
  <meta name="description" content="Discover verified professional beauty brands offering wholesale pricing to licensed salons, spas, and medspas. Skincare, haircare, wellness, med spa, and more." />
  <meta property="og:title" content="Browse Professional Beauty Brands — Socelle" />
  <meta property="og:description" content="Verified wholesale brands for licensed salons, spas, and medspas. Skincare, haircare, body, wellness, and med spa categories." />
</Helmet>
```

**Verification:**
1. Run `npm run typecheck` — no TypeScript errors
2. Run `npm run dev` — each page should render with correct title in browser tab
3. Check that `react-helmet-async` appears in `package.json` dependencies

---

## AGENT G — Apply & Signup Pages Audit (Read-Only)

**Objective:** Read and produce a written audit report of the two highest-conversion pages. Do not modify any files. Output the report as `APPLY_AUDIT.md` in the project root.

**Files to read:**
```
src/pages/brand/Apply.tsx         ← /brand/apply — brand application (every brand-facing CTA)
src/pages/brand/ApplicationReceived.tsx  ← confirmation page after brand applies
src/pages/business/Apply.tsx      ← /portal/signup — reseller signup (every reseller CTA)
src/pages/business/Login.tsx      ← /portal/login — reseller login
src/pages/brand/Login.tsx         ← /brand/login — brand login
```

**For each file, report on:**

1. **Copy quality** — Is the headline clear? Does the subhead explain what happens next? Is the CTA copy specific or generic?
2. **Form friction** — How many fields? Are any unnecessary at this stage? Is the form split into logical steps?
3. **Trust signals** — Are there any trust elements near the form (security note, review timeline, "no fees" reminder)?
4. **Error handling** — What error messages appear and are they human-readable?
5. **Post-conversion** — Where does the user land after submitting? Is the confirmation clear and reassuring?
6. **Brand consistency** — Does the page use the same visual system as the marketing site?
7. **What is missing** — What would a high-converting version of this page have that this one doesn't?

**Output format:** Save as `APPLY_AUDIT.md` in `SOCELLE-WEB/` with one section per file reviewed, plus a prioritized list of recommended changes.

---

## MASTER VERIFICATION CHECKLIST

Run this after all six agents complete. Every item must pass before the site can be considered Phase 1 complete.

```
[ ] grep -r "debvaihello" src/           → zero matches
[ ] grep -r "Projected targets" src/     → zero matches
[ ] grep -r "Placeholder quotes" src/    → comment exists but section not rendered
[ ] grep -r "full integration in progress" src/ → zero matches
[ ] grep -r "vite.svg" index.html        → zero matches as primary favicon
[ ] grep -r "AI-powered protocol matching" index.html → zero matches
[ ] public/favicon.svg                   → exists and is valid SVG
[ ] public/og-image.svg                  → exists
[ ] npm run typecheck                    → zero errors
[ ] npm run build                        → successful build, no errors
[ ] Browser tab shows correct title on each public page
[ ] APPLY_AUDIT.md                       → exists in project root
```

---

## WHAT AGENTS MUST NOT DO

- Do not modify any portal pages (`/brand/*`, `/business/*`, `/admin/*`, `/spa/*`)
- Do not modify any component files not explicitly listed
- Do not modify `tailwind.config.js` or `src/index.css`
- Do not modify `App.tsx` routing
- Do not delete any existing files — only modify and create
- Do not change any visual styles, colors, or layout — content and meta changes only (except Agent D which creates new assets)
- Do not add dependencies other than `react-helmet-async` (Agent F only)

---

## FILES MODIFIED BY PHASE 1

```
index.html                              (Agent C)
public/favicon.svg                      (Agent D — new file)
public/og-image.svg                     (Agent D — new file)
src/main.tsx                            (Agent F — HelmetProvider wrap)
src/pages/public/Home.tsx               (Agents B, F)
src/pages/public/About.tsx              (Agents A, F)
src/pages/public/Pricing.tsx            (Agents A, F)
src/pages/public/Insights.tsx           (Agents A, E, F)
src/pages/public/Brands.tsx             (Agent F)
package.json                            (Agent F — react-helmet-async)
APPLY_AUDIT.md                          (Agent G — new file)
```

**Files not touched by Phase 1:**
Everything else. Including all portal pages, all components, all lib files, all admin pages, all configuration files except package.json.
