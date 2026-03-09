# SOCELLE PUBLIC PAGES — COMPLETE RE-AUDIT
**Date:** 2026-03-06
**Scope:** 6 public pages (Home, Intelligence, Professionals, Brands, Events, Jobs)
**Mode:** READ-ONLY — No code changes
**Triggered by:** Owner visual QA — screenshots show broken layout, dead data, rhythm failures

---

## CSS LAYOUT AUDIT (ADDENDUM — per owner request)

### CRITICAL LAYOUT FAILURES OBSERVED IN SCREENSHOTS

| # | Issue | File | Lines | Root Cause | Severity |
|---|-------|------|-------|------------|----------|
| CSS-1 | **Intelligence Suite cards — text MASSIVE, overflowing, unreadable** | `src/components/public/EvidenceStrip.tsx` | 87, 89 | `text-metric-md` = **36px** font inside `min-w-[200px]` card with NO overflow containment. `flex-1` + `flex-shrink-0` creates collision — cards try to fill AND refuse to shrink. Long description text wraps endlessly. | **CRITICAL** |
| CSS-2 | **EvidenceStrip card descriptions overflow** | `src/components/public/EvidenceStrip.tsx` | 92 | `text-sm font-medium` label has NO `line-clamp`, NO `truncate`, NO `overflow-hidden`. Multi-word labels wrap to 6+ lines in narrow cards. | **CRITICAL** |
| CSS-3 | **Home hero excessive whitespace** | `src/pages/public/Home.tsx` | 114, 175 | `min-h-[100svh]` hero with scroll indicator at `absolute bottom-12`. CTA block ends mid-viewport, leaving ~200px dead gap before scroll indicator. | **HIGH** |
| CSS-4 | **Portal stat bar all zeros** | `src/pages/business/IntelligenceHub.tsx` | 123-162 | Stats pulled from mock `perf` object with no DB query. Missing DEMO badge on stat cards. | **HIGH** (portal — out of public scope but visible in screenshots) |
| CSS-5 | **No poster frames on any video** | `public/videos/*.mp4` | — | 6 videos, 0 poster images. Initial load shows blank/black frame before video decodes. | **MED** |

### CSS-1 ROOT CAUSE DETAIL

`EvidenceStrip.tsx` line 87-89:
```
className={`flex-shrink-0 flex-1 min-w-[200px] px-8 py-6 ...`}
...
className={`font-mono text-metric-md tracking-tight ...`}
```

`text-metric-md` resolves to `font-size: 2.25rem` (36px) per `tailwind.config.js`. A card that is only `min-w-[200px]` wide cannot contain 36px monospace text with 8-character values like "+28.5%". The value text alone at 36px needs ~180px, leaving 20px for padding. The description text below has NO truncation — a label like "LED Device Integration in Facial Protocols Rising" wraps to 5+ lines in 200px.

**The `flex-1` + `flex-shrink-0` conflict**: `flex-1` says "grow to fill"; `flex-shrink-0` says "never shrink." When 6 cards compete for space, each gets `flex-1` share but refuses to shrink below 200px. On viewport widths where `6 × 200px > container`, cards overflow the container entirely.

**Fix required:** Replace `text-metric-md` with a contained size (e.g., `text-2xl` or `text-xl`), add `overflow-hidden` + `line-clamp-2` on labels, and remove the `flex-shrink-0 flex-1` conflict.

---

## A) LIVE DATA SCORECARD

| Page | Total Data Points | Live | Dead | Hybrid | Score | Verdict |
|------|-------------------|------|------|--------|-------|---------|
| **Home** | 8 | 0 | 6 | 2 | **0% confirmed live** | **FAIL** |
| **Intelligence** | 6 | 2 | 2 | 2 | **33% live** | **FAIL** |
| **Professionals** | 10 | 0 | 10 | 0 | **0% live** | **FAIL** |
| **Brands** | 3 | 2 | 1 | 0 | **67% live** | **NEEDS WORK** |
| **Events** | 4 | 3 | 1 | 0 | **75% live** | **NEEDS WORK** |
| **Jobs** | 5 | 3 | 2 | 0 | **60% live** | **NEEDS WORK** |

**Overall: 10 live / 22 dead / 4 hybrid = 28% live across 36 data points. PLATFORM FAIL.**

"Hybrid" = fetch attempt exists but falls back to hardcoded const when DB returns < threshold.

---

## B) DEAD DATA MAP

| # | Page | Section | Current Value | Why It's Dead | Required API Source | Required Hook | Priority |
|---|------|---------|---------------|---------------|---------------------|---------------|----------|
| D1 | Home | Hero stats | "2,847 professionals" | `mockMarketPulse` const | `COUNT(*) FROM businesses WHERE type IN ('spa','medspa')` | `usePlatformStats()` | **CRITICAL** |
| D2 | Home | Hero stats | "156 brands" | `mockMarketPulse` const | `COUNT(*) FROM brands WHERE status='active'` | `usePlatformStats()` | **CRITICAL** |
| D3 | Home | Hero stats | "342 signals" | `mockMarketPulse` const | `COUNT(*) FROM market_signals` | `usePlatformStats()` | **CRITICAL** |
| D4 | Home | Signal cards | 4 signal objects (Polynucleotides +42%, Cart Value $1,294, Aggressive Peels -12%, Barrier Repair +88%) | `INTELLIGENCE_SIGNALS` const fallback — fetch exists but requires ≥4 rows to activate | `market_signals` table | exists: inline `supabase.from('market_signals')` — needs hook extraction | **CRITICAL** |
| D5 | Home | Signal cards | "Demo" updated label | Hardcoded string `'Demo'` in const | `updated_at` from `market_signals` row | same fetch | **CRITICAL** |
| D6 | Home | Intelligence Suite | 6 feature descriptions (Demand Forecasting, Vendor Analytics, etc.) | Static JSX — passed to EvidenceStrip as const items | These are feature descriptions, not metrics — acceptable as static IF they don't show fake numbers | N/A — static feature copy is OK | **MED** |
| D7 | Intelligence | Category descriptions | 6 categories with static text descriptions | `CATEGORIES` const array | Category descriptions are editorial — OK static. But "signal count per category" should be `COUNT(*) WHERE category=X` | `useSignalCategories()` | **HIGH** |
| D8 | Intelligence | Category signal counts | (not shown — missing) | No per-category count displayed | `COUNT(*) FROM market_signals GROUP BY category` | `useSignalCategories()` | **HIGH** |
| D9 | Professionals | Stats row | "120+ Authorized Brands" | `STATS` const | `COUNT(*) FROM brands WHERE status='active'` | `usePlatformStats()` | **CRITICAL** |
| D10 | Professionals | Stats row | "34 Live Signals" | `STATS` const | `COUNT(*) FROM market_signals` | `usePlatformStats()` | **CRITICAL** |
| D11 | Professionals | Stats row | "500+ Operators" | `STATS` const | `COUNT(*) FROM businesses` | `usePlatformStats()` | **CRITICAL** |
| D12 | Professionals | Stats row | "1 Cart" | `STATS` const | Not a real metric — remove or replace with "X protocols" | `usePlatformStats()` | **HIGH** |
| D13 | Professionals | Feature cards | 6 feature descriptions | Static JSX | Editorial copy — acceptable as static | N/A | **LOW** |
| D14 | Professionals | EvidenceStrip | 6 items with values | Static items passed inline | These show fake metric values — either pull live or mark DEMO | `usePlatformStats()` | **HIGH** |
| D15 | Brands | Adoption metric | "Added by X spas this quarter" | Fake present-tense claim | `COUNT(*) FROM orders WHERE brand_id=X AND created_at > quarter_start` | needs per-brand query | **HIGH** |
| D16 | Events | Year label | "2026" | Hardcoded string | `EXTRACT(YEAR FROM NOW())` or derive from event dates | inline | **MED** |
| D17 | Jobs | Stats badge | "12" (job count) | Hardcoded number | `COUNT(*) FROM job_postings WHERE status='active'` | `usePlatformStats()` | **HIGH** |
| D18 | Jobs | Filter options | 5 category filters | Static array | Could be dynamic from `DISTINCT category FROM job_postings` | optional | **LOW** |
| D19 | Home | Warm Cocoa tokens | `#29120f`, `#47201c`, `#f8f6f2` | Banned tokens per Canonical Doctrine | Replace with Pearl Mineral V2 tokens | N/A — CSS fix | **CRITICAL** |
| D20 | Home | Button system | `data-variant` buttons | Legacy system, not btn-mineral | Replace with `btn-mineral-*` classes | N/A — CSS fix | **CRITICAL** |
| D21 | Intelligence | EvidenceStrip metrics | `text-metric-md` (36px) in 200px cards | CSS breakage — text overflows | Reduce to `text-xl` or `text-2xl`, add containment | N/A — CSS fix | **CRITICAL** |
| D22 | Home | Hero whitespace | ~200px dead gap below CTAs | `min-h-[100svh]` with no content constraint | Tighten hero padding or add content to fill | N/A — CSS fix | **HIGH** |

---

## C) LIVE DATA SPEC TABLE

| Dead # | Hook Name | Endpoint / Table | Refresh Strategy | Empty State | Freshness Display |
|--------|-----------|------------------|------------------|-------------|-------------------|
| D1-D3, D9-D12, D17 | `usePlatformStats()` — **NEEDS NEW HOOK** | Supabase RPC or multi-table COUNT: `brands(status=active)`, `businesses`, `market_signals`, `job_postings(status=active)`, `canonical_protocols` | On-mount fetch, 5-min cache via `stale-while-revalidate` | Show `—` with subtle pulse skeleton | "Updated X min ago" from `MAX(updated_at)` across tables |
| D4-D5 | `useIntelligence()` — **EXISTS** in `src/lib/intelligence/useIntelligence.ts` | `market_signals` table | Already implemented — on-mount fetch with isLive flag | Falls back to `INTELLIGENCE_SIGNALS` const — **REMOVE FALLBACK**, show empty state instead | Already has `updated_at` — needs display as "X hours ago" |
| D7-D8 | `useSignalCategories()` — **NEEDS NEW HOOK** | `SELECT category, COUNT(*) FROM market_signals GROUP BY category` | On-mount fetch, 5-min cache | Show categories with `0` count | Per-category latest `updated_at` |
| D15 | Per-brand adoption query | `SELECT COUNT(*) FROM orders WHERE brand_id=? AND created_at > date_trunc('quarter', now())` | On-mount per brand card | Show "New" instead of fake count | Quarter label |
| D16 | Inline computation | `new Date().getFullYear()` | N/A — computed | N/A | N/A |

### Existing Hooks Inventory (confirmed)

| Hook/Util | Location | Tables | isLive Flag | Timestamps |
|-----------|----------|--------|-------------|------------|
| `useIntelligence()` | `src/lib/intelligence/useIntelligence.ts` | `market_signals` | YES | YES (`updated_at`) |
| `useCart()` | `src/lib/useCart.ts` | localStorage | NO | NO |
| `useBrandTier()` | `src/lib/brandTiers/useBrandTier.ts` | Mock data | NO | NO |
| `analyticsService` | `src/lib/analyticsService.ts` | `brand_analytics`, `business_analytics` | NO | YES (`period_end`) |
| Inline Supabase queries | Various pages | `brands`, `events`, `job_postings` | NO (ad-hoc) | PARTIAL |

### New Hooks Required

| Hook | Purpose | Tables | Returns |
|------|---------|--------|---------|
| `usePlatformStats()` | Global platform counts for public pages | `brands`, `businesses`, `market_signals`, `job_postings`, `canonical_protocols` | `{ brandCount, operatorCount, signalCount, jobCount, protocolCount, updatedAt }` |
| `useSignalCategories()` | Category breakdown with counts | `market_signals` | `{ categories: [{ name, count, latestSignal }] }` |

---

## D) DATA VISUALIZATION UPGRADE LIST

| # | Page | Current Treatment | Cinematic? | Proposed Upgrade | Animation |
|---|------|-------------------|------------|------------------|-----------|
| D1 | Home hero stats | Small text ("2,847 professionals") | NO | **Oversized animated counter** — scroll-triggered count-up from 0, 48px+ font, overlaid on video section | on-scroll trigger, 1.5s ease-out |
| D2 | Home hero stats | Same | NO | Same treatment — all 3 stats as a full-width KPI strip with delta arrows | on-scroll trigger |
| D4 | Home signal cards | GlassCard with static values | PARTIAL | **Signal cards with real-time pulse** — magnitude animates on mount, confidence badge + "Updated 3h ago" timestamp, subtle glow on fresh signals | on-mount fade-in, staggered 200ms |
| D7 | Intelligence categories | Text-only grid | NO | **Horizontal scrolling category pills with live signal count badges** — each pill shows `{name} ({count})`, active pill expands to show latest signal | on-mount |
| D9-D12 | Professionals stats | EvidenceStrip with 36px text (BROKEN) | **BROKEN** | **Fix EvidenceStrip first (CSS-1)**, then: animated counters with scroll-triggered count-up, each stat gets a trend arrow + source label | on-scroll trigger |
| D15 | Brands adoption | Inline text "Added by X spas" | NO | **Micro-chart sparkline** per brand card showing adoption over last 4 quarters | on-mount |
| D17 | Jobs count | Badge "12" | NO | **Animated counter** "X active positions" with real count, pulsing if new jobs posted < 24h | on-mount |

### Rules Applied
- No metric on blank background when it could be overlaid on media
- No static number when it could animate on scroll
- No number without a timestamp showing last update
- No signal without a confidence score (per Canonical Doctrine)

---

## E) VIDEO LIBRARY TABLE

| Filename | Format | Size | Poster Frame | Pages Using | Usage | Status |
|----------|--------|------|-------------|-------------|-------|--------|
| dropper.mp4 | MP4 | 3.3MB | NONE | Home | Hero background (ken-burns) | ACTIVE |
| foundation.mp4 | MP4 | 2.6MB | NONE | Home, Professionals | Section background | ACTIVE |
| blue-drops.mp4 | MP4 | 9.7MB | NONE | Intelligence, Professionals | Hero background | ACTIVE |
| air-bubbles.mp4 | MP4 | 1.3MB | NONE | Intelligence | Data section BG | ACTIVE |
| tube.mp4 | MP4 | 2.1MB | NONE | — | **UNUSED** | REALLOCATE → Brands hero |
| yellow-drops.mp4 | MP4 | 5.5MB | NONE | — | **UNUSED** | REALLOCATE → Events hero |

**Total:** 6 videos, 24.5MB. 2 unused. 0 poster frames.

---

## F) SECTION VISUAL ANCHOR TABLE

### Home.tsx

| Section | BG Type | Video | Image | Data Viz | Anchor? | Gap |
|---------|---------|-------|-------|----------|---------|-----|
| Hero | Video (dropper.mp4) | YES | NO | NO | **YES** | NONE |
| Signal cards | Dark solid | NO | NO | Partial (fake signals) | NO | HIGH — signals should be data-viz anchor |
| Intelligence Suite (EvidenceStrip) | Dark solid | NO | NO | YES (broken — CSS-1) | **BROKEN** | CRITICAL |
| SplitFeature | Light solid | NO | NO | NO | NO | HIGH |
| CTA / Footer | Gradient | NO | NO | NO | NO | MED |

### Intelligence.tsx

| Section | BG Type | Video | Image | Data Viz | Anchor? | Gap |
|---------|---------|-------|-------|----------|---------|-----|
| Hero | Video (blue-drops.mp4) | YES | NO | NO | **YES** | NONE |
| Market Pulse stats | Dark solid | NO | NO | YES (counters) | **YES** | NONE |
| Signal grid | Light bg | NO | NO | YES (signal cards) | **YES** | NONE |
| Categories | Light bg | NO | NO | NO | NO | MED |

### Professionals.tsx

| Section | BG Type | Video | Image | Data Viz | Anchor? | Gap |
|---------|---------|-------|-------|----------|---------|-----|
| Hero | Video (blue-drops.mp4) | YES | NO | NO | **YES** | NONE |
| EvidenceStrip | Dark solid | NO | NO | YES (broken — CSS-1) | **BROKEN** | CRITICAL |
| SplitFeature sections | Light solid | NO | Illustration | NO | PARTIAL | MED |
| Feature cards | Light solid | NO | Icons | NO | NO | HIGH |
| CTA | Gradient | NO | NO | NO | NO | MED |

### Brands.tsx

| Section | BG Type | Video | Image | Data Viz | Anchor? | Gap |
|---------|---------|-------|-------|----------|---------|-----|
| Hero | Gradient (no video) | NO | NO | NO | **NO** | **CRITICAL** |
| Brand grid | Light bg | NO | Brand logos | YES (live data) | **YES** | NONE |
| CTA | Dark solid | NO | NO | NO | NO | MED |

### Events.tsx

| Section | BG Type | Video | Image | Data Viz | Anchor? | Gap |
|---------|---------|-------|-------|----------|---------|-----|
| Hero | Dark gradient (no video) | NO | NO | NO | **NO** | **CRITICAL** |
| Event cards | Light bg | NO | Thumbnails | YES (live dates) | **YES** | NONE |
| CTA | Dark solid | NO | NO | NO | NO | MED |

### Jobs.tsx

| Section | BG Type | Video | Image | Data Viz | Anchor? | Gap |
|---------|---------|-------|-------|----------|---------|-----|
| Hero | Text-only (no video, no image) | NO | NO | NO | **NO** | **CRITICAL** |
| Job listings | Light bg | NO | NO | Partial (dates) | NO | HIGH |
| CTA | Dark solid | NO | NO | NO | NO | MED |

---

## G) RHYTHM STRIPS

```
CURRENT STATE:
Home:          V T T S G    → FAIL (2 consecutive T, no D section)
Intelligence:  V D D T      → PASS (opens V, has D, max 1 T)
Professionals: V T S T T G  → FAIL (3 consecutive T, broken D)
Brands:        G D G        → FAIL (opens G, no V/I)
Events:        G D G        → FAIL (opens G, no V/I)
Jobs:          T T G        → FAIL (opens T, no V/I, no D)

TARGET STATE:
Home:          V D I S G    → Video hero → Data strip (live counters) → Image section → Split → CTA
Intelligence:  V D D T      → PASS (no change needed)
Professionals: V D S I G    → Video hero → Data strip (fixed) → Split → Image → CTA
Brands:        V D I G      → Video hero (tube.mp4) → Data (brand grid) → Image → CTA
Events:        V D I G      → Video hero (yellow-drops.mp4) → Data (event cards) → Image → CTA
Jobs:          V D I G      → Video hero (NEW NEEDED) → Data (job listings) → Image → CTA
```

**Pass rate: 1/6 pages pass rhythm requirements.**

---

## H) VIDEO TONAL FIT + CONCEPT BRIEFS

### Current Assignments

| Video | Page | Content | Tonal Fit |
|-------|------|---------|-----------|
| dropper.mp4 | Home hero | Precision dropper, clinical, science | **STRONG** — intelligence/precision theme |
| foundation.mp4 | Home, Professionals | Beauty product showcase | **STRONG** — product industry context |
| blue-drops.mp4 | Intelligence, Professionals | Liquid flow, blue tones | **STRONG** — data flow metaphor |
| air-bubbles.mp4 | Intelligence | Transparent bubbles | **ACCEPTABLE** — clarity theme, slightly static |

### Reallocation for Unused Assets

| Video | Proposed Page | Fit |
|-------|---------------|-----|
| tube.mp4 | **Brands hero** | Product-centric tube = brand/product context. **ACCEPTABLE** — try first before sourcing new. |
| yellow-drops.mp4 | **Events hero** | Warm gold tones = event/gathering warmth. **ACCEPTABLE** — provides color contrast to blue-dominant Intelligence. |

### Missing — Needs New Asset

| Page | Section | Concept Brief (stock search query) |
|------|---------|-----------------------------------|
| Jobs | Hero | "20-30s seamless loop, modern medspa reception desk or treatment room, professional in branded scrubs reviewing tablet, shallow depth of field, warm clinical lighting, no patient faces, slow pan" |
| Jobs | Supporting | "15s loop, hands typing on laptop in bright co-working space, beauty industry context, product samples visible on desk, natural light, no faces" |

---

## I) FIXES USING EXISTING ASSETS + EXISTING HOOKS (ranked by impact)

| Rank | Fix | Files | Existing Resource | Impact |
|------|-----|-------|-------------------|--------|
| **1** | **Fix EvidenceStrip CSS** — reduce `text-metric-md` to `text-2xl`, add `overflow-hidden line-clamp-2`, fix `flex-shrink-0 flex-1` conflict | `EvidenceStrip.tsx` | Component already exists | **CRITICAL** — currently renders garbage on screen |
| **2** | **Wire Home signals to useIntelligence()** — replace inline `supabase.from()` + `INTELLIGENCE_SIGNALS` const with the existing hook | `Home.tsx`, `useIntelligence.ts` | Hook exists, tested, has isLive flag | **CRITICAL** — Home is 0% live |
| **3** | **Remove Warm Cocoa tokens from Home** — replace `#29120f`, `#47201c`, `#f8f6f2` with Pearl Mineral V2 equivalents | `Home.tsx` | Token palette in `tailwind.config.js` | **CRITICAL** — FAIL 3 violation |
| **4** | **Replace Home data-variant buttons with btn-mineral** | `Home.tsx` | `btn-mineral-*` classes in `index.css` | **CRITICAL** — only page still using legacy buttons |
| **5** | **Assign tube.mp4 to Brands hero** — add `<video>` with ken-burns animation | `Brands.tsx`, `public/videos/tube.mp4` | Video exists, unused | **HIGH** — fixes rhythm FAIL |
| **6** | **Assign yellow-drops.mp4 to Events hero** | `Events.tsx`, `public/videos/yellow-drops.mp4` | Video exists, unused | **HIGH** — fixes rhythm FAIL |
| **7** | **Replace hardcoded "12" in Jobs with COUNT query** | `Jobs.tsx` | `job_postings` table exists, already queried on same page | **HIGH** — FAIL 4 |
| **8** | **Replace hardcoded "2026" in Events with computed year** | `Events.tsx` | `new Date().getFullYear()` | **MED** — trivial fix |
| **9** | **Add updated_at to Brands query + display freshness** | `Brands.tsx` | `brands.updated_at` column exists | **MED** — improves trust signal |
| **10** | **Generate poster frames for all 6 videos** | `public/videos/` | FFmpeg one-liner | **MED** — performance + first-frame display |

---

## J) NEW BUILD WOs NEEDED

| WO | Name | Type | Spec | Page/Section | Priority | Est. Files |
|----|------|------|------|-------------|----------|------------|
| **W12-28** | Home Warm Cocoa Purge + Button Normalization | CSS/Token fix | Remove `#29120f`, `#47201c`, `#f8f6f2` → Pearl Mineral V2. Replace `data-variant` buttons → `btn-mineral-*`. | Home.tsx | **P0 CRITICAL** | 1 |
| **W12-29** | EvidenceStrip CSS Fix | Component fix | Fix `text-metric-md` overflow (→ `text-2xl`), fix `flex-shrink-0 flex-1` conflict, add `overflow-hidden line-clamp-2` on labels, test at all breakpoints. | EvidenceStrip.tsx | **P0 CRITICAL** | 1 |
| **W12-30** | Home Signals Live Wire | Hook wiring | Replace inline `supabase.from()` + `INTELLIGENCE_SIGNALS` const with `useIntelligence()` hook. Remove fallback const. Add proper empty state. Display `updated_at` as "X hours ago". | Home.tsx | **P0 CRITICAL** | 1 |
| **W12-31** | `usePlatformStats()` Hook | New hook | Multi-table COUNT RPC: `brands(active)`, `businesses`, `market_signals`, `job_postings(active)`, `canonical_protocols`. Returns `{ brandCount, operatorCount, signalCount, jobCount, protocolCount, updatedAt }`. 5-min stale-while-revalidate cache. | New: `src/hooks/usePlatformStats.ts` | **P0 CRITICAL** | 1 |
| **W12-32** | Platform Stats Wiring | Page integration | Wire `usePlatformStats()` into Home (hero stats), Professionals (stats row), Jobs (count badge). Replace all hardcoded numbers. Add animated counter component for count-up on scroll. | Home.tsx, Professionals.tsx, Jobs.tsx | **P0 CRITICAL** | 3 |
| **W12-33** | Brands + Events Video Heroes | Media integration | Add `tube.mp4` as Brands hero BG, `yellow-drops.mp4` as Events hero BG, with ken-burns animation matching Home pattern. | Brands.tsx, Events.tsx | **P1 HIGH** | 2 |
| **W12-34** | `useSignalCategories()` Hook | New hook | `SELECT category, COUNT(*) FROM market_signals GROUP BY category`. Returns `{ categories: [{ name, count, latestUpdated }] }`. | New: `src/hooks/useSignalCategories.ts`, Intelligence.tsx | **P1 HIGH** | 2 |
| **W12-35** | Jobs Hero Video + Live Count | Page fix | Source/commission Jobs hero video. Replace hardcoded "12" with `COUNT(*) FROM job_postings WHERE status='active'`. Replace hardcoded "2026" in Events with `new Date().getFullYear()`. | Jobs.tsx, Events.tsx | **P1 HIGH** | 2 |
| **W12-36** | Animated Counter Component | New component | Scroll-triggered count-up animation for all platform stats. Input: target number + label + trend direction. Uses IntersectionObserver. Eases from 0 → target over 1.5s. | New: `src/components/public/AnimatedCounter.tsx` | **P1 HIGH** | 1 |
| **W12-37** | Brands Freshness Signal | Query fix | Add `updated_at` to brands query. Display "Updated X days ago" on brand cards. Remove fake "Added by X spas" claim. | Brands.tsx | **P2 MED** | 1 |
| **W12-38** | index.css Dead Code Cleanup | CSS cleanup | Remove Warm Cocoa vars (`--color-primary-cocoa`, etc.), dead `font-serif` utilities from `:root`. | index.css | **P2 MED** | 1 |
| **W12-39** | Video Poster Frames | Asset pipeline | Generate poster JPGs for all 6 videos via FFmpeg. Add `poster` attribute to all `<video>` tags. | public/videos/, all pages with video | **P2 MED** | 6+ |

---

## EXECUTION ORDER (recommended)

```
WAVE A — STOP THE BLEEDING (blocks everything)
  W12-29  EvidenceStrip CSS Fix           ← currently renders garbage
  W12-28  Home Warm Cocoa Purge           ← FAIL 3 violation

WAVE B — LIVE DATA (the product)
  W12-31  usePlatformStats() Hook         ← enables all stats
  W12-30  Home Signals Live Wire          ← Home becomes live
  W12-32  Platform Stats Wiring           ← Home + Professionals + Jobs become live

WAVE C — VISUAL RHYTHM
  W12-33  Brands + Events Video Heroes    ← 2 pages get video anchors
  W12-35  Jobs Hero Video + Live Count    ← Jobs gets video + live count
  W12-36  Animated Counter Component      ← all stats animate

WAVE D — POLISH
  W12-34  useSignalCategories() Hook      ← Intelligence categories go live
  W12-37  Brands Freshness Signal         ← trust signal
  W12-38  index.css Dead Code Cleanup     ← housekeeping
  W12-39  Video Poster Frames             ← performance
```

---

## THE STANDARD

> This platform has hundreds of integrated APIs. The intelligence layer is the product.
> The UI exists to make live data beautiful, credible, and scannable.
> A page full of hardcoded numbers connected to a live API infrastructure is a prototype dressed as a product.
> Every number must be alive. Every visual must have weight. Every section must earn its place.
> Vogue Business x Bloomberg Terminal x Net-a-Porter.

**Current state: 28% live. 1/6 pages pass rhythm. 1 component renders garbage. This is not the standard.**

---

*AUDIT COMPLETE — NO CODE CHANGES MADE — Awaiting owner GO for execution*
