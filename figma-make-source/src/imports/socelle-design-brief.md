# SOCELLE — PUBLIC PAGES FIGMA DESIGN BRIEF

**Fashion Intelligence × Professional Beauty × Live Market Data**

| | |
|---|---|
| **Version** | 1.0 — March 2026 |
| **Status** | Approved for Design |
| **Scope** | 6 Public Pages + Design System |
| **Standard** | Vogue Business × Bloomberg Terminal × Net-a-Porter |
| **Platform** | Web (Desktop Primary, Mobile Responsive) |

---

## 01. Brief Overview

### The Product

Socelle is a premium B2B marketplace connecting independent skincare and beauty brands with medspa buyers and professional estheticians. It is not a consumer app. It is not a startup landing page. It is a platform that sits at the intersection of clinical science and high-end fashion — where purchasing decisions are driven by intelligence, not impulse.

### The Standard

Every page must pass this test: could this have been published by Vogue Business, built by Bloomberg, or sold by Net-a-Porter? If the answer is no, it is not finished.

> **Luxury editorial — not SaaS. Data-driven — not decorative. Live — not static.**

### The Three Core Failures This Brief Exists to Fix

- **FAILURE 1 — Visual laziness:** Pages are text-heavy with insufficient media. Every section needs visual weight.
- **FAILURE 2 — Dead data:** Numbers are hardcoded or static. Every metric must be a live feed from the API layer.
- **FAILURE 3 — Cheap layout patterns:** Small card grids read like generic SaaS. Replace with editorial modules.

### Pages In Scope

- `Home.tsx` — Primary brand entry point
- `Intelligence.tsx` (`/intelligence`) — Live market signals and trend data
- `Professionals.tsx` — Value proposition for medspa and esthetician buyers
- `Brands.tsx` — Brand discovery and directory
- `Events.tsx` — Industry events, activations, education
- `Jobs.tsx` — Career opportunities in professional beauty

---

## 02. Design Language

### Aesthetic Direction

The visual language is clinical precision meeting editorial luxury. Think the restraint of a high-end fragrance brand combined with the data density of a financial terminal. Dark, authoritative backgrounds. Gold and mineral accents. Typography that commands. Data that breathes.

### What Good Looks Like ✦

- Full-bleed video sections with minimal text overlay in glass/blur panels
- Oversized kinetic counters for key metrics — animate on scroll
- Editorial split-screens: image or video left, live data right
- Signal tables with sort controls, confidence badges, freshness timestamps
- Dark sections with bright accent data create hierarchy and luxury feel
- Generous white space in light sections; maximum contrast in dark sections
- Noise/grain overlay on hero sections for texture and depth
- Horizontal scroll editorial strips for brand and product imagery

### What Is Absolutely Banned ✗

- 3–4 column card grids with small thumbnails (the "feature grid" pattern)
- Icon + headline + body text cards on white backgrounds
- Text-only hero sections — every hero needs a video or full-bleed image
- Pastel backgrounds with rounded cards (too consumer/VC pitch deck)
- Static placeholder numbers displayed as if live
- Any section that could belong on a generic SaaS landing page
- More than 1 consecutive text-only section without a visual anchor

---

### Section Rhythm Rules

Every page must follow a visual rhythm. No two design decisions are more important than these:

| Rule | Requirement |
|---|---|
| Rule 1 | Every page must OPEN with a video or full-bleed image. Never text. Never a gradient alone. |
| Rule 2 | No more than 1 consecutive text-only section at any point in the page. |
| Rule 3 | Minimum 40% of sections must have a visual anchor (video, image, data viz, or split-screen). |
| Rule 4 | Every page must contain at least one cinematic data visualization section. |
| Rule 5 | Every number on the page must have a visible timestamp and confidence indicator. |

---

## 03. Token System

### Color Tokens — Pearl Mineral System

These are the **ONLY** colors permitted. No hardcoded hex values. No legacy Warm Cocoa palette. No one-off values.

| TOKEN | CLASS | HEX | USAGE |
|---|---|---|---|
| `mn-dark` | `bg-mn-dark` | `#141418` | Primary dark background |
| `graphite` | `text-graphite` | `#1E252B` | Primary text on light |
| `mn-onDark` | `text-mn-onDark` | `#F7F5F2` | Primary text on dark |
| `accent` | `bg-accent / text-accent` | `#C8A96E` | Gold — brand emphasis only |
| `accent-hover` | `hover:bg-accent-hover` | `#B8975E` | Accent hover state |
| `pearl` | `bg-pearl` | `#FAF9F7` | Off-white page background |
| `rgba dark glass` | `bg-[rgba(20,20,24,0.35)]` | — | Glass panels on dark |
| `rgba light glass` | `bg-[rgba(255,255,255,0.45)]` | — | Glass panels on light |

> **BANNED:** `#29120f` (Warm Cocoa dark), `#47201c` (Warm Cocoa mid), any `pro-` or `cocoa-` namespace tokens

---

### Typography Scale

| ROLE | SIZE | WEIGHT | USAGE |
|---|---|---|---|
| Display / Hero | 72–96px | 700 | Page heroes, cinematic KPIs |
| Heading 1 | 48–56px | 700 | Section titles |
| Heading 2 | 32–40px | 600 | Sub-section titles |
| Heading 3 | 24–28px | 600 | Module headers |
| Body Large | 18–20px | 400 | Lead paragraphs, card summaries |
| Body | 15–16px | 400 | Standard body, table cells |
| Label / Caption | 11–13px | 600 | Eyebrows, badges, timestamps — ALL CAPS |
| Mono Data | 13–15px | 400–500 | Numbers, codes, confidence scores |

---

### Spacing Tokens

- **Section vertical padding:** `py-20 lg:py-28` (80px / 112px)
- **Section container:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Card padding:** `p-6` → `p-7` → `p-8 lg:p-10` (24 / 28 / 32–40px)
- **Card gap:** `gap-6` minimum, `gap-8` preferred (24 / 32px)
- **Card border radius:** `rounded-2xl` (16px)
- **Section radius:** `rounded-section` (custom token — do not override)

---

## 04. Button System

All buttons use the `btn-mineral` system. No inline styles. No `data-variant` attributes. No one-off sizing.

| VARIANT | CLASS | USE WHEN |
|---|---|---|
| Primary | `btn-mineral-primary` | Main CTA on light backgrounds |
| Secondary | `btn-mineral-secondary` | Supporting CTA on light backgrounds |
| Accent | `btn-mineral-accent` | Brand-accent emphasis, promotions |
| Dark | `btn-mineral-dark` | CTA placed on dark section panels |
| Glass | `btn-mineral-glass` | CTA on glassmorphism surfaces |
| Ghost | `btn-mineral-ghost` | Secondary CTA on dark backgrounds |
| Small | `+ btn-mineral-sm` | Compact UI, table actions, tags |
| Large | `+ btn-mineral-lg` | Hero sections, primary page CTA only |

> Base height: 52px. SM: 40px. LG: 56px. Pill radius on all variants. Icon gap: 8px.

---

## 05. Module Library

These are the approved layout modules. They **replace all card grid patterns.** Design each as a Figma component with defined props and states.

---

### HeroMediaRail

Full-bleed autoplay looping video with glass overlay panel containing eyebrow, headline, subtitle, and CTA. **Required on every page as the opening section.**

- **Video:** WebM + MP4 fallback, muted, autoplay, loop, `object-fit: cover`
- **Overlay:** glassmorphism panel — `backdrop-blur(16px)` + `bg-white/10` or `bg-black/30`
- **Typography:** eyebrow in accent ALL CAPS label, headline in Display weight, subtitle in Body Large
- **CTA:** `btn-mineral-glass` (primary) + `btn-mineral-ghost` (secondary)
- **Poster frame** required for video — shown during load

> **Figma states:** loading (poster visible) / playing (video) / reduced-motion (static poster)

---

### Hero KPI Strip

Horizontal row of 3–6 oversized metrics. Replaces any static number grid. Animates on scroll (count-up). **Required on Intelligence page, recommended on Home.**

- Each KPI: large display number + unit + label + delta arrow + confidence badge + `updated_at` timestamp
- Dark background section with accent-colored numbers
- Confidence badge: small pill — e.g. "94% confidence" in mono font
- Timestamp: "Updated 3m ago" in label/caption scale, muted color
- Animation: count-up from 0 on scroll trigger, 800ms ease-out

> **Figma variants:** 3-KPI / 4-KPI / 6-KPI  
> **States:** loading skeleton / live / stale (timestamp > 1hr)

---

### Signal Table Row

Sortable editorial table for intelligence signals, brand data, or event listings. **Replaces all equal-weight card grids.**

- Columns: Signal/Name | Category | Trend indicator | Confidence | Updated
- Row hover: subtle highlight + reveal action button
- Trend indicator: directional arrow + sparkline inline
- Sort controls: column headers clickable with directional indicator
- Freshness: color-coded timestamp — green (<1hr), amber (1–24hr), red (>24hr)

> **Figma variants:** default / hover / expanded / loading skeleton row

---

### Spotlight Panel

Full-bleed editorial feature: large image or video one side, structured content the other. For featured brands, featured events, or editorial callouts.

- 50/50 or 60/40 split — image/video left or right (alternates)
- Content side: eyebrow + headline + 1 featured metric + 3 bullet points + CTA
- Image: `object-fit: cover`, zoom on hover (`scale-[1.03]`, `transition-400ms`)
- Video: same autoplay rules as HeroMediaRail

> **Figma variants:** image-left / image-right / video-left / video-right / dark-bg / light-bg

---

### Trend Stack

Compact data row combining sparkline + delta indicator + source label. Used within Signal Tables or as standalone data feed rows.

- Sparkline: 40px wide, 24px tall, accent color fill below line
- Delta: percentage change with directional color — green up, red down, neutral gray
- Source label: data provenance in caption scale

---

### EvidenceStrip

Horizontal scrolling row of 3–6 metrics or trust indicators. Used for social proof, platform stats, or key numbers. **Already exists in codebase — standardize in Figma.**

- Each cell: large number + label + optional LIVE or DEMO badge
- LIVE badge: green dot + "LIVE" in accent — only when data is from live API
- DEMO badge: amber — only during beta/demo mode, never on production

---

### SplitFeature

Narrative split section: text/content one side, video proof the other. **Already exists in codebase — standardize in Figma.**

- Used for product explanations, how-it-works flows, testimonial + video pairs
- Alternates media position per instance to avoid monotony

---

## 06. Live Data Requirements

### The Rule

Socelle connects to hundreds of integrated APIs. The intelligence layer **is** the product. Every metric, signal, stat, and data point visible on any public page must pull from a live endpoint. Static numbers are prototypes. We are not shipping prototypes.

### Required on Every Live Number

| Indicator | Spec |
|---|---|
| Timestamp | "Updated X ago" — shown in caption scale beneath or beside the number |
| Confidence score | Badge — "94% confidence" — required for signal/trend data |
| Freshness state | Visual treatment changes based on data age (green / amber / red) |
| LIVE badge | Green dot indicator on EvidenceStrip cells and KPI strips |
| Loading skeleton | Shown while data is fetching — never an empty space or zero |

### Four States — Design All of These

Every data module needs all four states in Figma:

- **Loading** — skeleton animation, correct dimensions, no layout shift
- **Populated** — live data showing, all indicators visible
- **Stale** — data older than threshold, amber timestamp, soft warning
- **Error** — graceful failure, no broken UI, retry option

> Loading skeletons must match the exact dimensions of the populated state to prevent layout shift.

---

## 07. Media Requirements

### Non-Negotiable Per Page

Every page must have **ALL** of the following before it is considered shippable:

- ✦ At least **ONE** autoplay looping hero video — WebM + MP4 fallback
- ✦ At least **ONE** full-bleed editorial image section (not a card thumbnail)
- ✦ At least **ONE** cinematic data visualization section
- ✦ **NO** section longer than two viewport heights without a visual anchor

### Video Technical Spec

| Requirement | Spec |
|---|---|
| Format | WebM primary, MP4 fallback — both required |
| Playback | `muted`, `loop`, `playsinline` — no controls shown |
| Poster frame | Required — shown on load and for reduced-motion users |
| Fit | `object-fit: cover` — fills container at all breakpoints |
| Duration | 15–45 seconds preferred for loops |
| Reduced motion | `@media (prefers-reduced-motion)` shows static poster |

### Visual Tone

All media must feel cohesive. The Socelle visual world is:

- **Clinical precision:** clean surfaces, sterile environments, professional tools
- **Warm professional light:** not cold/blue, not garish — editorial warmth
- **Hands over faces:** product, craft, and process — not stock-photo-smiling-people
- **Controlled slow motion:** intentional pace, not fast-cut social content
- **Monochrome + accent:** dark/neutral backgrounds let the accent color and data pop

---

## 08. Page-by-Page Layout Briefs

### Home.tsx — Brand Entry Point

**Target rhythm:** `[V] → [S] → [D] → [S] → [D] → [I] → [T]`

| SECTION | VISUAL ANCHOR | DATA TREATMENT | NOTES |
|---|---|---|---|
| Hero | HeroMediaRail — full-bleed video | Tagline + 2 live platform KPIs | Video: clinical medspa setup, 20s loop |
| Platform intro | SplitFeature — video right | None — narrative copy | Explain what Socelle does in 2 sentences |
| Intelligence strip | Hero KPI Strip — dark bg | 6 live signals from API | Animated on scroll, confidence badges |
| For Professionals | SplitFeature — image left | 1 featured metric | Link to /professionals |
| Evidence / Trust | EvidenceStrip | Live brand/pro counts | LIVE badges on all cells |
| For Brands | SplitFeature — video right | 1 featured metric | Link to /brands |
| Final CTA | Dark panel + btn-mineral-lg | None | Join waitlist or sign up |

---

### Intelligence.tsx — Live Market Signals

**Target rhythm:** `[V] → [D] → [D] → [S] → [D]`

| SECTION | VISUAL ANCHOR | DATA TREATMENT | NOTES |
|---|---|---|---|
| Hero | HeroMediaRail — abstract data video | Live signal count in overlay | Video: data visualization, abstract |
| KPI Strip | Hero KPI Strip — dark | Top 3–6 live market KPIs | **CRITICAL: must be live feed, not static** |
| Signal Feed | Signal Table Row — full width | All signals, sortable | Replace current card grid entirely |
| Trend detail | SplitFeature — chart left | Trend Stack per signal | Expand selected signal |
| Intelligence CTA | Dark panel | None | Upgrade / subscribe prompt |

---

### Professionals.tsx — For Buyers

**Target rhythm:** `[V] → [S] → [D] → [S] → [T] → [I]`

Current state is strong — SplitFeature and EvidenceStrip already in use. Key gaps: hero video confirmation, data freshness indicators, Spotlight Panel for featured case study.

---

### Brands.tsx — Brand Discovery

**Target rhythm:** `[V] → [D] → [I] → [D] → [T]`

| SECTION | VISUAL ANCHOR | DATA TREATMENT | NOTES |
|---|---|---|---|
| Hero | HeroMediaRail — brand showcase | Live brand count in overlay | Video: product texture, hands, clinical |
| Featured Brand | Spotlight Panel | Brand metrics + adoption stats | Needs `is_featured` flag from DB |
| Brand grid | Signal Table Row or card grid | Adoption badge + new indicator | Cards acceptable if full-width rows |
| Category strip | Horizontal scroll filter row | Category counts live | Filter interaction |

---

### Events.tsx — Industry Events

**Target rhythm:** `[V] → [I] → [D] → [T]`

> ⚠️ **CRITICAL FAILURE:** Currently has ZERO media. This page has the worst visual debt of all 6 pages.

| SECTION | VISUAL ANCHOR | DATA TREATMENT | NOTES |
|---|---|---|---|
| Hero | HeroMediaRail — events/education | Live upcoming event count | Video: medspa education, masterclass |
| Featured Event | Spotlight Panel — image left | Attendee count + date | Needs `is_featured` flag or sort logic |
| Event list | Signal Table Row | Type + date + location | Replaces current flat list |
| Past events | Horizontal scroll strip | None | Thumbnail + title + date |

---

### Jobs.tsx — Career Opportunities

**Target rhythm:** `[V] → [T] → [D] → [T]`

> ⚠️ **CRITICAL FAILURE:** Currently has ZERO media and 2 non-standard inline buttons.

| SECTION | VISUAL ANCHOR | DATA TREATMENT | NOTES |
|---|---|---|---|
| Hero | HeroMediaRail — career/aspiration | Live job count in overlay | Video: professional in medspa, slow-mo |
| Featured role | Spotlight Panel | Salary range + dept | Pin 1 featured role above list |
| Job list | Editorial list rows | Dept + location + type badge | Already editorial — keep and refine |
| Company culture | SplitFeature — image right | None — narrative | Why work at a Socelle brand |

---

## 09. Figma File Structure

### Required Pages

| PAGE | CONTENT |
|---|---|
| `00` | Cover + Changelog |
| `01` | Design Tokens (colors, typography, spacing, radius, shadow) |
| `02` | Foundations (grid, breakpoints, motion curves) |
| `03` | Components (all modules from Section 05, all button variants) |
| `04` | Page: Home |
| `05` | Page: Intelligence |
| `06` | Page: Professionals |
| `07` | Page: Brands |
| `08` | Page: Events |
| `09` | Page: Jobs |
| `10` | States + Edge Cases (loading, error, empty, stale) |
| `11` | Mobile Responsive Layouts (375px and 768px breakpoints) |

### Component Naming Convention

- **Components:** `[ModuleName]` (e.g., `HeroMediaRail`, `SignalTableRow`)
- **Variants:** Use Figma variant properties — not separate components per state
- **Tokens:** Match exact Tailwind class names where possible (e.g., `accent`, `graphite`)
- **Auto-layout:** All components must use Figma Auto Layout — no fixed-position layers

### Handoff Requirements

- Every component must have Dev Mode annotations enabled
- Spacing values must match the canonical token table in Section 03
- Color styles must be named to match CSS token names (`mn-dark`, `accent`, `graphite`, etc.)
- Every interactive state (hover, focus, active, loading, error) must be designed
- Responsive breakpoints: 1440px (desktop), 1024px (tablet), 375px (mobile)

> Do not use Figma's built-in grid presets. Use the Socelle spacing token system exclusively.

---

## 10. Delivery + Acceptance Criteria

### Acceptance Checklist — Per Page

A page design is **NOT** approved for handoff to code until all of these pass:

| CRITERION | STATUS |
|---|---|
| Page opens with video or full-bleed image hero | ☐ |
| No more than 1 consecutive text-only section | ☐ |
| Minimum 40% of sections have visual anchor | ☐ |
| All data points show timestamp + confidence indicator | ☐ |
| All data points marked as LIVE or have skeleton state | ☐ |
| No hardcoded hex colors — all Pearl Mineral tokens | ☐ |
| All buttons use btn-mineral system — no inline styles | ☐ |
| Loading, error, stale, and empty states designed | ☐ |
| Mobile layout (375px) designed for all sections | ☐ |
| Dev Mode annotations complete for all components | ☐ |
| No card grid patterns — replaced with editorial modules | ☐ |
| Video poster frames provided for all video sections | ☐ |

### Review Process

- Designer submits Figma link when ALL 12 criteria are checked for a page
- Review against this brief — any criterion not met returns the page to designer
- Approved pages are handed to Web Agent for implementation against W12-28 through W12-34 WOs
- No page goes to code until its Figma acceptance criteria are 100% green

---

> **The standard is non-negotiable.**
>
> This platform has the infrastructure of hundreds of live APIs, a vetted brand network, and a product that genuinely serves a premium market. The design must reflect that. Vague, generic, or lazy work will be returned. Every frame should look like it belongs on the cover of Vogue Business.

*Socelle — March 2026*