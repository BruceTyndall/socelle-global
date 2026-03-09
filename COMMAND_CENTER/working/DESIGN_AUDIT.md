# SOCELLE DESIGN SYSTEMS AUDIT
**Date:** 2026-03-06
**Mode:** AUDIT ONLY — no code changes
**Authority:** `SOCELLE_CANONICAL_DOCTRINE.md` §3–§8 + `SOCELLE_FIGMA_TO_CODE_HANDOFF.md` §1–§5
**Scope:** 6 public pages (Home, Intelligence, Professionals, ForBrands, Events, Jobs) + shared modules

---

## A) SCOREBOARD

| Page | Typography | Buttons | Spacing | Data Viz | Media | Token Compliance | Overall |
|------|-----------|---------|---------|----------|-------|-----------------|---------|
| **Home** | NEEDS WORK — custom sizes mixed with tokens | NEEDS WORK — no direct buttons (delegated to modules) | NEEDS WORK — varies across modules | NEEDS WORK — FeaturedCardGrid reads cheap at 3-col | FAIL — Unsplash hero + 14 stock images, no video | NEEDS WORK — modules use hardcoded hex | **NEEDS WORK** |
| **Intelligence** | PASS — uses text-hero, text-section, text-eyebrow | PASS — delegated to HeroMediaRail + modules | NEEDS WORK — mixed py-20/py-28/py-24 | PASS — SignalTable is proper editorial data viz | FAIL — Unsplash hero, no video | NEEDS WORK — modules contain hex | **NEEDS WORK** |
| **Professionals** | NEEDS WORK — text-[0.8125rem] custom eyebrow size | NEEDS WORK — inline hex buttons in hero | NEEDS WORK — mixed section padding | NEEDS WORK — FeaturedCardGrid reads cheap | FAIL — Unsplash hero, no video, all card images stock | NEEDS WORK — hardcoded hex in page | **NEEDS WORK** |
| **ForBrands** | NEEDS WORK — custom eyebrow text-[0.8125rem] | NEEDS WORK — inline hex buttons | NEEDS WORK — varies | NEEDS WORK — BigStatBanner has hardcoded stats | FAIL — Unsplash hero + all section images stock | NEEDS WORK — hardcoded hex | **NEEDS WORK** |
| **Events** | NEEDS WORK — text-[10px] badges, custom sizes | NEEDS WORK — mixed EventTypeBadge inline classes | NEEDS WORK — mixed | FAIL — event cards are generic, no signal data | FAIL — Unsplash hero + SpotlightPanel stock | NEEDS WORK — inline hex in badges | **FAIL** |
| **Jobs** | NEEDS WORK — text-[10px], text-[13px] custom sizes | NEEDS WORK — inline hex bg-[#1F2428] | NEEDS WORK — mixed | NEEDS WORK — job cards are generic list items | FAIL — Unsplash hero, no video | NEEDS WORK — hardcoded hex | **NEEDS WORK** |

**Summary:** 0 PASS / 5 NEEDS WORK / 1 FAIL. Zero pages achieve full token compliance. Zero pages use owner video as hero. Every page has hardcoded hex violations.

---

## TASK 1 — BUTTON + TYPOGRAPHY DRIFT

### 1A. BUTTON DRIFT TABLE

| Pattern | Count | Files | Canonical? |
|---------|-------|-------|-----------|
| `bg-[#1F2428] text-[#F7F5F2] rounded-full` (inline dark CTA) | 8+ | MainNav, Jobs, Events, HeroMediaRail | NO — should use `btn-mineral-primary` token |
| `bg-[#1F2428] text-[#F7F5F2] h-[36px] px-5 text-sm font-semibold rounded-full` | 1 | MainNav (Request Access desktop) | NO — hardcoded sizing + hex |
| `bg-[#1F2428] text-[#F7F5F2] h-12 w-full rounded-full text-[15px] font-semibold` | 3 | MainNav (mobile portal links) | NO — custom 15px size + hex |
| `btn-mineral-primary` (Tailwind @apply class) | 1 | RequestAccess (submit) | YES — canonical |
| `bg-accent text-mn-bg rounded-full font-semibold` (accent CTA) | 2+ | HeroMediaRail secondary, SpotlightPanel | PARTIAL — uses tokens but inconsistent sizing |
| `bg-mn-dark text-[#F7F5F2] rounded-pill` (dark pill badge) | 3+ | Brands, BrandStorefront | NO — hardcoded `#F7F5F2` |
| `bg-[#E8F5ED] text-signal-up` (signal badge) | 1 | BrandStorefront:477 | NO — `#E8F5ED` is hardcoded, not a token |
| `bg-[#1F2428] text-[#F7F5F2] rounded-lg` (product CTA) | 1 | BrandStorefront:483 | NO — rounded-lg instead of rounded-full |
| EmailCapture inline button (inside CTASection/StickyBar) | 6+ | Every page via CTASection | UNKNOWN — delegated to EmailCapture component |

**Finding:** The platform has no centralized `<Button>` component. Buttons are inline Tailwind strings with 5+ unique sizing/color combinations. The Figma-to-Code handoff specifies `<Button variant="primary" size="lg" />` but this component does not appear to exist in the shared components.

### 1B. TYPOGRAPHY DRIFT TABLE

| Pattern | Token? | Count | Files |
|---------|--------|-------|-------|
| `text-hero` (Display/Hero) | YES | 6+ | Home, Intelligence, Professionals, ForBrands, Events, Jobs |
| `text-section` (Display/Section) | YES | 10+ | All pages (section headings) |
| `text-eyebrow` (Label/Eyebrow) | YES | 6+ | Via HeroMediaRail + module eyebrow props |
| `text-body-lg` (Body/Large) | YES | 4+ | RequestAccess, Professionals |
| `text-body` (Body/Regular) | YES | 3+ | ForSalons, Professionals |
| `text-[0.8125rem]` (13px — custom eyebrow) | NO | 6+ | ForSalons, ForMedspas, HowItWorks, RequestAccess, Professionals, ForBrands |
| `text-[10px]` (custom micro) | NO | 5+ | Events:EventTypeBadge, Brands:badges, BrandStorefront |
| `text-[11px]` (custom) | NO | 2+ | KPIStrip, NewsTicker |
| `text-[13px]` (custom) | NO | 3+ | Jobs, Events |
| `text-[15px]` (custom) | NO | 3 | MainNav mobile buttons |
| `text-xs` (Tailwind 12px) | PARTIAL | 15+ | Across all pages — sometimes should be `text-label` |
| `text-sm` (Tailwind 14px) | PARTIAL | 20+ | Across all pages |
| `text-lg` (Tailwind 18px) | PARTIAL | 5+ | CTASection subtitle, Events empty state |
| `text-xl` / `text-2xl` / `text-3xl` | NO | scattered | Should use `text-subsection` or `text-section` |
| `tracking-[0.12em]` (custom letter-spacing) | NO | 6+ | Eyebrow patterns — should be baked into `text-eyebrow` token |
| `tracking-widest` | PARTIAL | 3+ | Badges |
| `font-semibold` | YES (weight) | 20+ | All pages |
| `font-medium` | YES (weight) | 15+ | All pages |
| `font-bold` | CAUTION | 5+ | Should prefer `font-semibold` for consistency |
| `leading-[1.06]` (custom line-height) | NO | 2+ | RequestAccess, HeroMediaRail |

**Finding:** The type scale has 9 canonical tokens (text-hero through text-metric-lg) but pages use 6+ hardcoded arbitrary sizes (`text-[Xpx]`). The `text-[0.8125rem]` eyebrow pattern appears on 6 pages — it should be absorbed into `text-eyebrow`. Custom tracking values should be baked into token definitions.

### 1C. CANONICAL BUTTON SPEC (PROPOSED)

```
btn-mineral-primary:
  h-[44px] px-7 bg-mn-dark text-mn-bg text-sm font-sans font-semibold
  rounded-full transition-all duration-200
  hover:bg-graphite hover:shadow-[0_4px_16px_rgba(31,36,40,0.25)]
  hover:-translate-y-[1px] active:translate-y-0
  inline-flex items-center justify-center gap-2

btn-mineral-secondary:
  h-[44px] px-7 bg-transparent text-graphite text-sm font-sans font-semibold
  rounded-full border border-graphite/15 transition-all duration-200
  hover:bg-black/[0.03] hover:-translate-y-[1px]
  inline-flex items-center justify-center gap-2

btn-mineral-accent:
  h-[44px] px-7 bg-accent text-mn-bg text-sm font-sans font-semibold
  rounded-full transition-all duration-200
  hover:bg-accent-hover hover:shadow-[0_4px_16px_rgba(110,135,155,0.3)]
  inline-flex items-center justify-center gap-2

btn-mineral-ghost:
  h-auto px-3 py-2 text-sm font-sans font-medium text-graphite/60
  rounded-full transition-colors duration-150
  hover:text-graphite hover:bg-black/[0.03]
  inline-flex items-center gap-1.5
```

**Sizes:** `sm` = h-[36px] px-5 text-xs | `md` = h-[44px] px-7 text-sm (default) | `lg` = h-[52px] px-9 text-base

### 1D. CANONICAL TYPOGRAPHY SPEC (PROPOSED)

```
text-hero:      font-sans font-semibold text-[clamp(2rem,5vw,3.5rem)] leading-[1.06] tracking-[-0.025em]
text-section:   font-sans font-semibold text-[clamp(1.5rem,3.5vw,2.25rem)] leading-[1.15] tracking-[-0.02em]
text-subsection: font-sans font-semibold text-xl leading-[1.25] tracking-[-0.01em]
text-body-lg:   font-sans font-normal text-lg leading-[1.6] text-graphite/60
text-body:      font-sans font-normal text-base leading-[1.6] text-graphite/60
text-eyebrow:   font-sans font-medium text-[0.8125rem] tracking-[0.12em] uppercase text-graphite/40
text-label:     font-sans font-medium text-xs tracking-[0.06em] uppercase
text-metric-xl: font-mono font-bold text-[clamp(2.5rem,6vw,4rem)] leading-[1] tracking-[-0.02em]
text-metric-lg: font-mono font-semibold text-2xl leading-[1] tracking-[-0.01em]
text-caption:   font-sans font-normal text-[11px] text-graphite/40 leading-[1.4]
```

---

## TASK 2 — DATA VIZ + LAYOUT MODULES

### 2A. CURRENT DATA DISPLAY MODULES

| Module | Used On | Rating | Why It Reads Cheap |
|--------|---------|--------|--------------------|
| **FeaturedCardGrid** (3-col) | Home, Professionals, ForBrands | CHEAP | Small card images (400px Unsplash), tight grid, generic card anatomy (thumbnail + eyebrow + title + subtitle), no data density, looks like a blog grid not an intelligence surface |
| **EditorialScroll** (horizontal) | Home, Professionals, Intelligence | ACCEPTABLE | Horizontal scroll is editorial-feeling but items lack data richness — just image + label + rank number |
| **NewsTicker** (marquee) | Home, Intelligence | ACCEPTABLE | Feels live and editorial, but hardcoded fake data on Home violates "no fake live" rule |
| **KPIStrip** (4 KPIs) | Home, Intelligence, Professionals | GOOD | Large metrics with delta badges, pulsing live indicator — premium pattern |
| **BigStatBanner** (full-width stats) | Intelligence, Professionals, ForBrands, Events | GOOD | Full-bleed background image + large stat overlay — high-end editorial feeling |
| **SpotlightPanel** (split image+text) | Home, Intelligence, Professionals, ForBrands, Events | GOOD | Full editorial pattern: image + metric + 3 bullets + CTA. Premium. |
| **SignalTable** (sortable data table) | Intelligence | BEST | Editorial table with confidence scores, timestamps, source labels, tier gating — this is the gold standard |
| **ImageMosaic** (6-image grid) | Home, ForBrands | CHEAP | Pure Unsplash stock grid with no data overlay. Feels like a lifestyle blog, not intelligence |
| **SocialProof** (avatar strip) | Used in EmailCapture | BROKEN | References `/images/avatars/avatar-{1-4}.jpg` — files don't exist |

### 2B. PROPOSED REPLACEMENT MODULES

| Current (Cheap) | Replace With | Why |
|-----------------|-------------|-----|
| FeaturedCardGrid (3 small cards) | **Signal Spotlight Trio** — 3 large cards (1 featured 2/3 width + 2 stacked 1/3) with sparkline + delta + source label + confidence bar | Cards should contain real signal data, not generic thumbnails. Larger format = premium. |
| ImageMosaic (6 stock photos) | **Proof Rail** — horizontal scroll of owner video thumbnails with hover-play + metric overlay (similar to Apple TV row) | Stock photo grids are anti-premium. Video thumbnails with data overlays signal sophistication. |
| EditorialScroll items (image + label) | **Trend Stack** — each item gets: sparkline + delta + source count + category badge instead of static rank number | Adds data density to what's currently a flat list. |
| SocialProof (broken avatars) | **Trust Indicators** — "2,847 verified practitioners" + metric strip (no fake avatars) | Remove broken asset dependency, replace with verifiable platform stat. |
| NewsTicker (hardcoded fake signals on Home) | **Live Signal Ticker** — wire to actual `market_signals` table via `useIntelligence()` or show DEMO badge | Currently violates "no fake live" rule (CANONICAL_DOCTRINE §6) |

### 2C. PAGE-BY-PAGE NEW LAYOUT SKELETON

**HOME (proposed section order):**
1. HeroMediaRail — owner video hero (replace Unsplash)
2. Live Signal Ticker — wired to market_signals or DEMO-badged
3. KPIStrip — "Market Pulse" (keep, already good)
4. SpotlightPanel — "How It Works" (keep, replace Unsplash image with owner video still)
5. Signal Spotlight Trio — replace FeaturedCardGrid (3 real signal cards with sparklines)
6. BigStatBanner — full-bleed stat section (add if missing)
7. Proof Rail — replace ImageMosaic (owner video thumbnails with metric overlays)
8. EditorialScroll — "Category Rankings" (keep, add trend data to items)
9. CTASection — (keep)
10. StickyConversionBar — (keep)

**INTELLIGENCE (proposed):**
1. HeroMediaRail — owner video hero (replace Unsplash)
2. Live Signal Ticker — LIVE from market_signals (already wired)
3. BigStatBanner — "Signal Infrastructure" (keep)
4. KPIStrip — "Pulse — Real Time" (keep)
5. SignalTable — sortable editorial table (keep — gold standard)
6. EditorialScroll — stories from useStories (keep — already LIVE)
7. SpotlightPanel (keep, replace Unsplash)
8. Proof Rail — replace ImageMosaic
9. CTASection (keep)
10. StickyConversionBar (keep)

**PROFESSIONALS (proposed):**
1. HeroMediaRail — owner video hero
2. KPIStrip (keep)
3. SpotlightPanel (keep, replace Unsplash)
4. BigStatBanner (keep)
5. Signal Spotlight Trio — replace FeaturedCardGrid
6. Trend Stack — replace EditorialScroll items
7. CTASection (keep)
8. StickyConversionBar (keep)

**FOR BRANDS (proposed):**
1. HeroMediaRail — owner video hero
2. BigStatBanner — "Brand Network" (keep, wire LIVE or DEMO badge)
3. SpotlightPanel (keep, replace Unsplash)
4. Signal Spotlight Trio — replace FeaturedCardGrid
5. Proof Rail — replace ImageMosaic
6. CTASection (keep)
7. StickyConversionBar (keep)

**EVENTS (proposed):**
1. HeroMediaRail — owner video hero
2. BigStatBanner — "Events Network" (keep, wire LIVE counts)
3. Featured Event (keep — add richer card with venue image)
4. Event Grid — improve card anatomy (add attendee count, category badge)
5. SpotlightPanel — "Host With Us" (keep, replace Unsplash)
6. CTASection (keep)
7. StickyConversionBar (keep)

**JOBS (proposed):**
1. HeroMediaRail — owner video hero
2. BigStatBanner (keep)
3. Featured Role — larger hero card format
4. Search + Filter Bar (keep)
5. Job Listings — improve card anatomy (add salary range, company logo, signal badges)
6. SpotlightPanel — "Why Socelle" (keep, replace Unsplash)
7. CTASection (keep)
8. StickyConversionBar (keep)

---

## TASK 3 — MEDIA AUDIT

### 3A. MEDIA COMPLIANCE TABLE

| Page | Section | Current Asset | Source | Owner? | Required Action |
|------|---------|--------------|--------|--------|----------------|
| **Home** | Hero | `photo-1714648775477` | Unsplash | NO | Replace with owner video (`blue-drops.mp4` or `dropper.mp4`) |
| Home | SpotlightPanel | `photo-1556228578` | Unsplash | NO | Replace with owner video still or new asset |
| Home | ImageMosaic | 6x Unsplash URLs | Unsplash | NO | Replace all 6 with owner content or remove module |
| Home | FeaturedCardGrid | 3x Unsplash URLs | Unsplash | NO | Replace with data-driven cards (no thumbnail needed) or owner assets |
| Home | EditorialScroll | 4x Unsplash URLs | Unsplash | NO | Replace with owner assets or category icons |
| **Intelligence** | Hero | `photo-1762279388988` | Unsplash | NO | Replace with owner video (`tube.mp4`) |
| Intelligence | SpotlightPanel | Unsplash | Unsplash | NO | Replace with owner asset |
| Intelligence | ImageMosaic | 6x Unsplash URLs | Unsplash | NO | Replace or remove module |
| **Professionals** | Hero | `photo-1601839777132` | Unsplash | NO | Replace with owner video (`dropper.mp4`) |
| Professionals | SpotlightPanel | Unsplash | Unsplash | NO | Replace with owner asset |
| Professionals | FeaturedCardGrid | 3x Unsplash URLs | Unsplash | NO | Replace with data cards or owner assets |
| Professionals | EditorialScroll | 4x Unsplash URLs | Unsplash | NO | Replace with owner assets |
| **ForBrands** | Hero | `photo-1598214173466` | Unsplash | NO | Replace with owner video (`foundation.mp4` — already used on Brands) |
| ForBrands | BigStatBanner bg | `photo-1556228578` | Unsplash | NO | Replace with owner asset |
| ForBrands | SpotlightPanel | `photo-1570172619644` | Unsplash | NO | Replace with owner asset |
| ForBrands | FeaturedCardGrid | 3x Unsplash URLs | Unsplash | NO | Replace |
| ForBrands | ImageMosaic | 6x Unsplash URLs | Unsplash | NO | Replace or remove |
| **Events** | Hero | `photo-1610207928705` | Unsplash | NO | Replace with owner video |
| Events | SpotlightPanel | `photo-1540575467063` | Unsplash | NO | Replace with owner asset |
| **Jobs** | Hero | Unsplash | Unsplash | NO | Replace with owner video |

**Total Unsplash references across 6 pages: 50+**
**Owner videos available but unused on core pages: 3** (`blue-drops.mp4`, `dropper.mp4`, `tube.mp4`)
**Owner videos already used (non-core pages only):** `foundation.mp4` (ForSalons, Brands), `air-bubbles.mp4` (ForMedspas), `yellow-drops.mp4` (HowItWorks)

### 3B. PLACEMENT MAP — MISSING MEDIA

| Page | Section | Media Type Needed | Component Suggestion |
|------|---------|-------------------|---------------------|
| Home | Hero | Owner hero video (ambient loop, 8-15s) | HeroMediaRail with `video` prop |
| Home | ImageMosaic slot | Owner brand/product video stills or remove | Proof Rail (video thumbnail carousel) |
| Intelligence | Hero | Owner hero video | HeroMediaRail with `video` prop |
| Professionals | Hero | Owner hero video | HeroMediaRail with `video` prop |
| ForBrands | Hero | Owner hero video | HeroMediaRail with `video` prop |
| Events | Hero | Owner event/venue video or branded visual | HeroMediaRail with `video` prop |
| Jobs | Hero | Owner team/culture video or branded visual | HeroMediaRail with `video` prop |
| ALL | SocialProof avatars | Real practitioner photos or remove | Trust Indicators (stat-based, no photos) |

**Needs asset pipeline WO:** Owner needs to produce 3-4 additional hero videos (Events, Jobs, Intelligence, Home) or repurpose existing unused videos. Current 3 unused videos (`blue-drops`, `dropper`, `tube`) can cover some gaps.

### 3C. OWNER VIDEO ASSIGNMENT (PROPOSED)

| Video | Current Usage | Proposed Assignment |
|-------|--------------|-------------------|
| `blue-drops.mp4` (10.2MB) | UNUSED | **Home hero** — NOTE: exceeds 2MB hero budget per Figma Handoff §4, needs compression |
| `dropper.mp4` (3.4MB) | UNUSED | **Professionals hero** — needs compression to <2MB |
| `tube.mp4` (2.2MB) | UNUSED | **Intelligence hero** — needs compression to <2MB |
| `foundation.mp4` (2.7MB) | ForSalons, Brands | **ForBrands hero** (share with Brands page) — needs compression |
| `air-bubbles.mp4` (1.3MB) | ForMedspas | Could share to **Events** hero (within budget) |
| `yellow-drops.mp4` (5.7MB) | HowItWorks | **Jobs** hero candidate — needs heavy compression |

**Needs asset creation outside repo:** Ideally 6 unique hero videos, <2MB each, 1080p, 8-15s ambient loop, no audio.

---

## TASK 4 — TOKEN + CSS VIOLATIONS

### 4A. VIOLATIONS TABLE

| File | Line Pattern (grep-able) | Violation | Rule |
|------|-------------------------|-----------|------|
| MainNav.tsx | `bg-[#1F2428]` | Hardcoded hex instead of `bg-mn-dark` | Figma Handoff §5: no hardcoded hex |
| MainNav.tsx | `text-[#F7F5F2]` | Hardcoded hex instead of `text-mn-bg` | Figma Handoff §5 |
| MainNav.tsx | `hover:bg-[#2a3038]` | Orphan hex — no token for this color | Doctrine §3: only palette colors |
| MainNav.tsx | `text-[15px]` | Custom font size — not in type scale | Figma Handoff §1: Typography Token Parity |
| MainNav.tsx | `h-[36px]` | Hardcoded button height — should be size token | Figma Handoff §2: Variant Prop Mapping |
| SiteFooter.tsx | `text-[rgba(247,245,242,0.55)]` | Inline rgba instead of `text-mn-bg/55` or token | Figma Handoff §5 |
| SiteFooter.tsx | `text-[rgba(247,245,242,0.4)]` | Inline rgba | Figma Handoff §5 |
| SiteFooter.tsx | `text-[rgba(247,245,242,0.65)]` | Inline rgba | Figma Handoff §5 |
| SiteFooter.tsx | `text-[rgba(247,245,242,0.35)]` | Inline rgba | Figma Handoff §5 |
| SiteFooter.tsx | `border-[rgba(247,245,242,0.08)]` | Inline rgba | Figma Handoff §5 |
| CTASection.tsx:17 | `style={{ background: 'radial-gradient(circle, #6E879B 0%, transparent 70%)' }}` | Inline style with hardcoded hex | Doctrine §3 + Figma Handoff §5 |
| Events.tsx | `text-[10px]` in EventTypeBadge | Custom micro size — not in type scale | Figma Handoff §1 |
| Events.tsx | `bg-blue-500/15` | Tailwind blue-500 — not in Pearl Mineral palette | Doctrine §3: BANNED "bright SaaS blues" |
| Events.tsx | `bg-purple-500/15` | Tailwind purple-500 — not in Pearl Mineral palette | Doctrine §3 |
| Jobs.tsx | `bg-[#1F2428]` | Hardcoded hex | Figma Handoff §5 |
| Jobs.tsx | `text-[#F7F5F2]` | Hardcoded hex | Figma Handoff §5 |
| Jobs.tsx | `text-[10px]`, `text-[13px]` | Custom sizes | Figma Handoff §1 |
| Brands.tsx:349 | `text-[#F7F5F2]` | Hardcoded hex | Figma Handoff §5 |
| Brands.tsx:365 | `border-[rgba(247,245,242,0.15)]` | Inline rgba | Figma Handoff §5 |
| Brands.tsx:412 | `accent-[#1F2428]` | Hardcoded hex on checkbox accent | Figma Handoff §5 |
| BrandStorefront.tsx:405-409 | `linear-gradient(145deg, #F0EDE8, #E8E3DC)` (x5) | 10 orphan hex values in gradient array | Doctrine §3: no gradient content |
| BrandStorefront.tsx:443 | `text-[#F7F5F2]` | Hardcoded hex | Figma Handoff §5 |
| BrandStorefront.tsx:477 | `bg-[#E8F5ED]` | Orphan hex — not in palette | Doctrine §3 |
| BrandStorefront.tsx:483 | `bg-[#1F2428] text-[#F7F5F2]` | Double hardcoded hex | Figma Handoff §5 |
| BrandStorefront.tsx:574 | `bg-[#1F2428] text-[#F7F5F2]` | Double hardcoded hex | Figma Handoff §5 |
| RequestAccess.tsx | `text-[0.8125rem]` | Custom size — should be `text-eyebrow` | Figma Handoff §1 |
| SpotlightPanel.tsx | `bg-[#1F2428]` (likely) | Module-level hardcoded hex | Figma Handoff §5 |
| HeroMediaRail.tsx | `style={{ minHeight }}` | Inline style — could use Tailwind min-h | Minor |
| SocialProof.tsx | `/images/avatars/avatar-{1-4}.jpg` | References non-existent files | BROKEN ASSET |
| Home.tsx:51 | `brandsCount.toLocaleString()` | Runtime crash — undefined when loading | BUG (not token, but critical) |

### 4B. FORBIDDEN TOKEN NAMESPACE CHECK

| Namespace | Found On Public Pages? | Status |
|-----------|----------------------|--------|
| `pro-*` | NO | PASS — correctly scoped to portals |
| `cocoa-*` | NO | PASS — correctly scoped to `.portal-context` |
| `font-serif` | NO on public pages | PASS — banned, not used |
| `blue-500` | YES — Events.tsx EventTypeBadge | FAIL — SaaS blue on public page |
| `purple-500` | YES — Events.tsx EventTypeBadge | FAIL — not in palette |

### 4C. RADIUS CONSISTENCY CHECK

| Pattern | Canonical Token | Found | Status |
|---------|----------------|-------|--------|
| `rounded-full` (pill) | `--radius-pill: 9999px` | Buttons, badges, avatars | CORRECT |
| `rounded-card` | `--radius-card: 28px` | StoryDetail, some modules | CORRECT |
| `rounded-[28px]` | Should be `rounded-card` | RequestAccess glass card | VIOLATION — use token |
| `rounded-section` | `--radius-section: 32px` | ForSalons dark panel, footer | CORRECT |
| `rounded-[32px]` | Should be `rounded-section` | If found | VIOLATION — use token |
| `rounded-2xl` (16px) | No canonical token | ForSalons feature cards | DRIFT — not in canonical spec |
| `rounded-xl` (12px) | No canonical token | RequestAccess icon containers | DRIFT — not in canonical spec |
| `rounded-lg` (8px) | `--radius: 8px` (legacy) | BrandStorefront product CTA | ACCEPTABLE for small elements |

### 4D. GUARDRAIL RECOMMENDATIONS (grep patterns to lint)

```bash
# 1. Hardcoded hex in JSX/TSX (should be tokens)
grep -rn '#[0-9A-Fa-f]\{6\}' src/pages/public/ src/components/ --include='*.tsx' | grep -v unsplash | grep -v node_modules

# 2. Inline style with color/background (should be Tailwind)
grep -rn 'style={{.*\(color\|background\|#\)' src/pages/public/ src/components/ --include='*.tsx'

# 3. Custom text sizes outside type scale (drift detection)
grep -rn 'text-\[.*px\]\|text-\[.*rem\]' src/pages/public/ src/components/ --include='*.tsx'

# 4. Banned SaaS blue/purple on public pages
grep -rn 'blue-[3-6]00\|purple-[3-6]00\|indigo-' src/pages/public/ --include='*.tsx'

# 5. Orphan rounded values (should use radius tokens)
grep -rn 'rounded-\[' src/pages/public/ src/components/ --include='*.tsx' | grep -v 'rounded-\[28px\]\|rounded-\[32px\]'
```

---

## B) TOP 20 FIXES (ranked by visual impact)

| # | File | Pattern (grep-able) | What to Change | Why (design principle) | Risk |
|---|------|-------------------|----------------|----------------------|------|
| 1 | Home.tsx:13 | `unsplash.com/photo-1714648775477` | Replace Unsplash hero with owner video via HeroMediaRail `video` prop | Doctrine §7: "Video leads — every viewport-height section that could have a video, has one" | LOW |
| 2 | Intelligence.tsx hero | `unsplash.com/photo-1762279388988` | Replace with owner video (`tube.mp4`) | Doctrine §7: "Real imagery" | LOW |
| 3 | Professionals.tsx hero | `unsplash.com/photo-1601839777132` | Replace with owner video (`dropper.mp4`) | Doctrine §7 | LOW |
| 4 | ForBrands.tsx hero | `unsplash.com/photo-1598214173466` | Replace with owner video (`foundation.mp4`) | Doctrine §7 | LOW |
| 5 | Events.tsx hero | `unsplash.com/photo-1610207928705` | Replace with owner video (`air-bubbles.mp4`) | Doctrine §7 | LOW |
| 6 | Jobs.tsx hero | Unsplash hero image | Replace with owner video | Doctrine §7 | LOW |
| 7 | Home.tsx:51 | `brandsCount.toLocaleString()` | Guard against undefined: `(brandsCount ?? 0).toLocaleString()` | Runtime crash — page won't render | LOW |
| 8 | Home.tsx:54-62 | `NewsTicker items={[...hardcoded...]}` | Wire to `useIntelligence()` or add DEMO badge | Doctrine §6: "No fake live data" | MED |
| 9 | SiteFooter.tsx:7 | `label: 'Marketplace'` | Rename to "Brand Directory" or "Brands" | CLAUDE.md §E: FAIL 6 — ecommerce term in nav | LOW |
| 10 | MainNav.tsx | `bg-[#1F2428] text-[#F7F5F2]` (8 instances) | Replace with `bg-mn-dark text-mn-bg` token classes | Figma Handoff §5: no hardcoded hex | LOW |
| 11 | Events.tsx:EventTypeBadge | `bg-blue-500/15`, `bg-purple-500/15` | Replace with `bg-accent/15 text-accent` or signal tokens | Doctrine §3: SaaS blues banned | LOW |
| 12 | SiteFooter.tsx | `rgba(247,245,242,0.*)` (5 instances) | Replace with `text-mn-bg/55`, `text-mn-bg/40`, etc. | Figma Handoff §5: no inline rgba | LOW |
| 13 | Home.tsx MOSAIC_IMAGES | 6x Unsplash URLs | Replace with owner assets or redesign as Proof Rail | Doctrine §7: "Real imagery" | MED |
| 14 | Home.tsx FeaturedCardGrid | 3x small Unsplash cards | Replace with Signal Spotlight Trio (larger format, data-rich) | Doctrine §2 Req 2: "Page Artistry" — small cards read cheap | MED |
| 15 | RequestAccess.tsx | `text-[0.8125rem] tracking-[0.12em]` | Use `text-eyebrow` token (bake tracking into token definition) | Figma Handoff §1: Typography Token Parity | LOW |
| 16 | SocialProof.tsx | `/images/avatars/avatar-{1-4}.jpg` | Remove broken avatar refs; replace with stat-based trust strip | BROKEN ASSET — 404s | LOW |
| 17 | CTASection.tsx:17 | `style={{ background: 'radial-gradient(circle, #6E879B...' }}` | Move to Tailwind utility or CSS class using `--color-accent` token | Figma Handoff §5: no inline style colors | LOW |
| 18 | BrandStorefront.tsx:405-409 | `PRODUCT_GRADIENTS` array (5 inline gradients with orphan hex) | Define as CSS classes using palette tokens | Doctrine §3 + §7: no gradient content | LOW |
| 19 | Professionals/ForBrands FeaturedCardGrid | 3x small Unsplash card grids | Replace with Signal Spotlight Trio or editorial data cards | Doctrine §2 Req 2: card grids read cheap for intelligence platform | MED |
| 20 | ALL pages | Mixed section padding: `py-14`, `py-20`, `py-24`, `py-28`, `py-32` | Standardize: sections use `py-16 lg:py-24` (light) or `py-20 lg:py-28` (heavy) — 2 tiers only | Figma Handoff §3: Section Spacing should be 64px/96px/120-160px | LOW |

---

## C) CANONICAL COMPONENT SPEC

### C1. Button Variants

| Variant | Tailwind Classes | Usage |
|---------|-----------------|-------|
| **primary** | `inline-flex items-center justify-center gap-2 h-[44px] px-7 bg-mn-dark text-mn-bg text-sm font-sans font-semibold rounded-full transition-all duration-200 hover:bg-graphite hover:shadow-soft hover:-translate-y-[1px] active:translate-y-0` | Primary CTAs: "Request Access", "Read the Feed" |
| **secondary** | `inline-flex items-center justify-center gap-2 h-[44px] px-7 bg-transparent text-graphite text-sm font-sans font-semibold rounded-full border border-graphite/15 transition-all duration-200 hover:bg-black/[0.03] hover:-translate-y-[1px]` | Secondary actions: "See How It Works", "See Verified Brands" |
| **accent** | `inline-flex items-center justify-center gap-2 h-[44px] px-7 bg-accent text-mn-bg text-sm font-sans font-semibold rounded-full transition-all duration-200 hover:bg-accent-hover hover:shadow-soft` | Accent CTAs on light backgrounds |
| **ghost** | `inline-flex items-center gap-1.5 px-3 py-2 text-sm font-sans font-medium text-graphite/60 rounded-full transition-colors duration-150 hover:text-graphite hover:bg-black/[0.03]` | Sign In, minor actions |
| **on-dark** | `inline-flex items-center justify-center gap-2 h-[44px] px-7 bg-mn-bg/10 text-mn-bg text-sm font-sans font-semibold rounded-full border border-mn-bg/15 backdrop-blur-sm transition-all duration-200 hover:bg-mn-bg/20` | CTAs on dark panels |

### C2. Card/Section Spacing Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `py-16 lg:py-24` | 64px / 96px | Standard section padding |
| `py-20 lg:py-28` | 80px / 112px | Heavy section padding (CTA, BigStatBanner) |
| `gap-6` | 24px | Card grid gap (desktop) |
| `gap-4` | 16px | Card grid gap (mobile) |
| `p-8 lg:p-10` | 32px / 40px | Card internal padding |
| `mb-4` | 16px | Eyebrow to heading |
| `mb-6` | 24px | Heading to body text |
| `mb-10` | 40px | Body text to CTA |
| `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` | — | Content container (all pages) |

### C3. Data Module Anatomy

**KPIStrip** (KEEP — gold standard)
```
Container: bg-mn-bg py-6 border-y border-graphite/8
Grid: grid-cols-2 lg:grid-cols-4 gap-6
Each KPI:
  - Value: text-metric-lg font-mono text-graphite
  - Label: text-caption text-graphite/40 uppercase tracking-wide
  - Delta: text-xs font-mono text-signal-up/warn/down
  - Live dot: w-2 h-2 rounded-full bg-signal-up animate-pulse (when isLive)
```

**SignalTable** (KEEP — gold standard)
```
Container: bg-white rounded-card p-6 shadow-soft
Header: grid with sortable column headers (text-label)
Row: grid items with:
  - Signal name: text-sm font-semibold text-graphite
  - Category badge: text-eyebrow bg-accent/10 rounded-full px-2
  - Confidence: progress bar + percentage (text-mono)
  - Source: text-caption text-graphite/40
  - Timestamp: text-caption text-graphite/40 + relative time
  - Tier gate: UpgradeGate blur for free users
```

**SpotlightPanel** (KEEP — gold standard)
```
Container: py-16 lg:py-24
Layout: grid lg:grid-cols-2 gap-12 items-center
Image side: rounded-card overflow-hidden aspect-[4/3]
Content side:
  - Eyebrow: text-eyebrow
  - Headline: text-section
  - Metric: text-metric-lg font-mono + text-caption label
  - Bullets: space-y-3, each with accent check icon + text-body
  - CTA: btn-mineral-primary
```

**Signal Spotlight Trio** (NEW — replace FeaturedCardGrid)
```
Container: py-16 lg:py-24
Layout: grid lg:grid-cols-3 gap-6 (or 2/3 + 1/3 featured split)
Each card:
  - Container: bg-white rounded-card p-6 shadow-soft hover:shadow-panel transition-shadow
  - Eyebrow: text-eyebrow text-accent
  - Title: text-subsection font-semibold
  - Sparkline: 80px wide SVG trend line (signal-up/warn/down colored)
  - Delta: text-metric-lg font-mono (e.g., "+28%")
  - Source label: text-caption text-graphite/40 ("12 verified sources")
  - Confidence bar: h-1 bg-accent/20 with fill
  - CTA: text-sm text-accent hover:text-accent-hover + arrow
```

**Proof Rail** (NEW — replace ImageMosaic)
```
Container: py-16 lg:py-24 overflow-hidden
Eyebrow + Headline centered
Layout: horizontal scroll (scroll-snap-type: x mandatory)
Each item:
  - Container: w-[280px] flex-shrink-0 rounded-card overflow-hidden
  - Video thumbnail: aspect-[16/9] with play button overlay
  - Metric overlay: absolute bottom, glass background, metric + label
  - Hover: scale-[1.02] transition, play icon pulse
```

---

## D) READY-TO-ASSIGN PATCH LIST

### PATCH 1: Replace MainNav hardcoded hex
- **File:** `src/components/MainNav.tsx`
- **Find:** `bg-[#1F2428]` (all instances)
- **Replace:** `bg-mn-dark`
- **Find:** `text-[#F7F5F2]` (all instances)
- **Replace:** `text-mn-bg`
- **Find:** `hover:bg-[#2a3038]`
- **Replace:** `hover:bg-graphite`
- **Validation:** Visual diff — buttons should look identical

### PATCH 2: Replace SiteFooter inline rgba
- **File:** `src/components/sections/SiteFooter.tsx`
- **Find:** `text-[rgba(247,245,242,0.55)]`
- **Replace:** `text-mn-bg/55`
- **Find:** `text-[rgba(247,245,242,0.4)]`
- **Replace:** `text-mn-bg/40`
- **Find:** `text-[rgba(247,245,242,0.65)]`
- **Replace:** `text-mn-bg/65`
- **Find:** `text-[rgba(247,245,242,0.35)]`
- **Replace:** `text-mn-bg/35`
- **Find:** `border-[rgba(247,245,242,0.08)]`
- **Replace:** `border-mn-bg/8`
- **Validation:** Footer text colors unchanged

### PATCH 3: Fix Footer "Marketplace" label
- **File:** `src/components/sections/SiteFooter.tsx`
- **Find:** `{ to: '/brands', label: 'Marketplace' }`
- **Replace:** `{ to: '/brands', label: 'Brand Directory' }`
- **Validation:** Footer "Platform" column shows "Brand Directory" not "Marketplace"

### PATCH 4: Fix Home.tsx crash
- **File:** `src/pages/public/Home.tsx`
- **Find:** `brandsCount.toLocaleString()`
- **Replace:** `(brandsCount ?? 0).toLocaleString()`
- **Validation:** Home page renders without crash when stats loading

### PATCH 5: Fix Events.tsx banned SaaS colors
- **File:** `src/pages/public/Events.tsx` (EventTypeBadge)
- **Find:** `'bg-blue-500/15 text-blue-500'`
- **Replace:** `'bg-accent/15 text-accent'`
- **Find:** `'bg-purple-500/15 text-purple-500'`
- **Replace:** `'bg-signal-warn/15 text-signal-warn'`
- **Validation:** Event type badges use palette colors only

### PATCH 6: Fix CTASection inline gradient
- **File:** `src/components/modules/CTASection.tsx`
- **Find:** `style={{ background: 'radial-gradient(circle, #6E879B 0%, transparent 70%)' }}`
- **Replace:** `className="bg-[radial-gradient(circle,_var(--color-accent)_0%,_transparent_70%)]"`
- **Validation:** Accent glow renders identically using token

### PATCH 7: Normalize eyebrow pattern
- **Files:** RequestAccess.tsx, ForSalons.tsx, ForMedspas.tsx, HowItWorks.tsx, Professionals.tsx, ForBrands.tsx
- **Find:** `text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40`
- **Replace:** `text-eyebrow`
- **Prereq:** Verify `text-eyebrow` Tailwind plugin includes `tracking-[0.12em]` in definition
- **Validation:** Eyebrow text identical in all pages

### PATCH 8: Replace Home hero with owner video
- **File:** `src/pages/public/Home.tsx`
- **Find:** `image={HERO_IMAGE}` (line 45)
- **Replace:** `video="/videos/blue-drops.mp4" poster="/videos/posters/blue-drops-poster.jpg"`
- **Prereq:** Compress `blue-drops.mp4` to <2MB; verify HeroMediaRail supports `video` prop
- **Validation:** Home hero plays ambient video loop

### PATCH 9: Replace Intelligence hero with owner video
- **File:** `src/pages/public/Intelligence.tsx`
- **Find:** `image={HERO_IMAGE}`
- **Replace:** `video="/videos/tube.mp4" poster="/videos/posters/tube-poster.jpg"`
- **Prereq:** Compress `tube.mp4` to <2MB
- **Validation:** Intelligence hero plays ambient video loop

### PATCH 10: Replace Professionals hero with owner video
- **File:** `src/pages/public/Professionals.tsx`
- **Find:** `image={HERO_IMAGE}`
- **Replace:** `video="/videos/dropper.mp4" poster="/videos/posters/dropper-poster.jpg"`
- **Prereq:** Compress `dropper.mp4` to <2MB
- **Validation:** Professionals hero plays ambient video loop

### PATCH 11: Standardize section padding (2-tier system)
- **Files:** All public pages + modules
- **Find:** `py-14 lg:py-20` (light sections)
- **Replace:** `py-16 lg:py-24`
- **Find:** `py-24 lg:py-32` (heavy sections)
- **Replace:** `py-20 lg:py-28`
- **Validation:** Consistent vertical rhythm across all pages

### PATCH 12: Remove SocialProof broken avatars
- **File:** `src/components/modules/SocialProof.tsx`
- **Find:** avatar image references to `/images/avatars/`
- **Replace:** Stat-based trust strip ("2,847 verified practitioners" text with accent underline)
- **Validation:** No 404 requests for avatar images

---

## E) PROPOSED WO BREAKDOWN

### WO GROUP 1: Token Compliance (LOW RISK, HIGH IMPACT)
**Scope:** Patches 1, 2, 3, 5, 6, 7, 15
**Files:** MainNav, SiteFooter, Events, CTASection, RequestAccess + 5 more pages
**Effort:** ~2 hours
**Dependencies:** None
**Description:** Replace all hardcoded hex, inline rgba, banned SaaS colors, and custom eyebrow sizes with canonical design tokens. Pure find-and-replace, no layout changes.

### WO GROUP 2: Critical Bug + Data Integrity
**Scope:** Patches 4, 8 (Home crash + Home fake-live ticker)
**Files:** Home.tsx
**Effort:** ~30 min (crash fix) + ~1 hour (ticker wiring)
**Dependencies:** Ticker wiring needs `useIntelligence()` integration or DEMO badge
**Description:** Fix the Home.tsx runtime crash (undefined guard) and address fake-live NewsTicker violation.

### WO GROUP 3: Hero Video Replacement (NEEDS ASSETS)
**Scope:** Patches 8, 9, 10 + Events + Jobs + ForBrands heroes
**Files:** Home, Intelligence, Professionals, ForBrands, Events, Jobs
**Effort:** ~1 hour code changes + asset compression pipeline
**Dependencies:**
- **Needs asset creation outside repo:** Video compression to <2MB per Figma Handoff §4
- **Needs infra change:** Verify HeroMediaRail `video` prop works (may already exist — check component)
**Description:** Replace all 6 Unsplash hero images with owner video assets. Requires video compression pipeline first.

### WO GROUP 4: Module Upgrades (NEEDS NEW DATA WIRING)
**Scope:** Replace FeaturedCardGrid with Signal Spotlight Trio, replace ImageMosaic with Proof Rail
**Files:** Home, Professionals, ForBrands + new module components
**Effort:** ~4-6 hours
**Dependencies:**
- **Needs Web Agent build WO:** Signal Spotlight Trio component (new)
- **Needs Web Agent build WO:** Proof Rail component (new)
- **Needs new data wiring:** Signal cards require real data from `market_signals` or mock with DEMO badge
**Description:** Replace cheap-feeling card grids and stock photo mosaics with data-rich editorial modules.

### WO GROUP 5: Spacing + Radius Normalization
**Scope:** Patches 11 + radius token cleanup
**Files:** All public pages + modules
**Effort:** ~1-2 hours
**Dependencies:** None
**Description:** Standardize section padding to 2-tier system and replace hardcoded radius values with `rounded-card` / `rounded-section` tokens.

### WO GROUP 6: Button Component System
**Scope:** Create `<Button>` component per Figma Handoff §2, migrate all inline button classes
**Files:** New `src/components/ui/Button.tsx` + all pages
**Effort:** ~3-4 hours
**Dependencies:**
- **Needs Web Agent build WO:** Button component with variant/size props
**Description:** The platform has no centralized Button component. 5+ unique inline button patterns exist. Create the canonical component and migrate all usages.

### WO GROUP 7: Broken Asset Cleanup
**Scope:** Patch 12 (SocialProof) + remove all Unsplash dependencies from inline section images
**Files:** SocialProof, Home (mosaic + cards), Professionals (cards), ForBrands (cards + mosaic)
**Effort:** ~2-3 hours
**Dependencies:**
- **Needs asset creation outside repo:** Owner product/brand photography for card thumbnails
- Or: Redesign cards to be data-only (no thumbnail required)
**Description:** Remove all broken avatar references and replace remaining Unsplash inline images with owner assets or data-driven layouts.

---

*END OF AUDIT — No code was modified. All findings reference canonical authority docs.*
*Authority: SOCELLE_CANONICAL_DOCTRINE.md + SOCELLE_FIGMA_TO_CODE_HANDOFF.md*
