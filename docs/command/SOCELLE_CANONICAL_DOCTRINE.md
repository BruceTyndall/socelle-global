# SOCELLE CANONICAL DOCTRINE
**Version:** 1.0  
**Effective:** March 5, 2026  
**Authority:** SOCELLE Command Center  
**Scope:** All agents, all surfaces, all platforms (web + mobile + studios + admin)

---

## 1. PLATFORM THESIS

SOCELLE is an **intelligence-first subscription platform** for the professional beauty industry. The marketplace is the business model beneath the intelligence layer — not the other way around.

### Hierarchy of Value

```
Intelligence → Trust → Transaction → Retention
```

1. **Intelligence leads.** The first thing any visitor sees is market intelligence — signals, trends, benchmarks, category movements. This is the hook.
2. **Trust follows.** Intelligence proves domain authority. Every data point is attributed, timestamped, and confidence-scored. No assertions without evidence.
3. **Transaction earns.** Commerce exists because intelligence earned the operator's trust. The marketplace serves intelligence, never competes with it.
4. **Retention deepens.** Studios (Social, CRM, Sales, Marketing, Education) extend the value so operators never need another tool. Each studio is a sellable module.

### Mini-App Architecture

SOCELLE ships as **modular mini-apps** sharing a common core. Each mini-app is independently shippable, independently sellable, and independently upgradeable. The core provides auth, entitlements, data, design system, copy voice, analytics, commerce primitives, and governance. No mini-app may bypass the core.

---

## 2. DUAL REQUIREMENT DOCTRINE (NON-NEGOTIABLE)

Every surface — every page, every screen, every card, every modal — must satisfy **both** requirements simultaneously. A page that passes one and fails the other is not shippable.

### Requirement 1: Intelligence Density

| Dimension | Standard |
|---|---|
| **Real data** | Every number, timestamp, trend, and benchmark connects to a verifiable data source or is clearly labeled PREVIEW/DEMO. |
| **Freshness** | Every data element displays `updated_at` as "Updated Xm ago". No static timestamps pretending to be live. |
| **Confidence** | Every signal displays a confidence tier: `High` / `Med` / `Low`. This is rendered, not hidden in metadata. |
| **Segmentation** | Intelligence is segmented by role (operator/provider/brand), vertical, geography, and category. Generic "insights" fail. |
| **Usefulness** | Every data card offers an action: save, follow, compare, share, export, deep-dive. Data without action is decoration. |

### Requirement 2: Page Artistry

| Dimension | Standard |
|---|---|
| **Hierarchy** | Clear information hierarchy: entrance → tension → proof → conversion close. No page is a flat list. |
| **Rhythm** | Visual rhythm alternates: light/dark, dense/spacious, text/media. Never two heavy sections adjacent. |
| **Composition** | Every section has intentional negative space. 120–160px vertical padding between sections at desktop. |
| **Premium feel** | The page must feel expensive. Pearl glass, not frosted boxes. Real imagery, not gradient placeholders. Mineral tones, not SaaS blue. |
| **Conversion close** | Every page ends with a clear conversion action. The CTA language is intelligence-framed, not generic. |

---

## 3. STYLE LOCK — COLORS

### Brand-Safe Pearl Mineral Palette

| Token | Value | CSS Variable | Usage |
|---|---|---|---|
| BG | `#F6F3EF` | `--bg` | Page background (pearl mineral) |
| Alt surface | `#EEEAE6` | `--surface-alt` | Alternate section backgrounds |
| Card | `#FFFFFF` | `--card` | Card / elevated surfaces |
| Dark panel | `#1F2428` | `--panel-dark` | Dark contrast panels (max 1 per page) |
| Footer | `#15191D` | `--footer` | Footer background only |
| Ink (primary) | `#141418` | `--ink` | Primary text — NOT `#1E252B` |
| Ink secondary | `rgba(20,20,24,0.62)` | `--ink-sec` | Secondary text |
| Ink muted | `rgba(20,20,24,0.42)` | `--ink-muted` | Hints, captions, timestamps |
| On dark | `#F7F5F2` | `--on-dark` | Text on dark backgrounds |
| On dark secondary | `rgba(247,245,242,0.72)` | `--on-dark-sec` | Secondary text on dark |
| Accent | `#6E879B` | `--accent` | CTAs, links, interactive (ONE accent only) |
| Accent hover | `#5E7588` | `--accent-hover` | Hover state |
| Accent tint | `rgba(110,135,155,0.10)` | `--accent-tint` | Light background tint |
| Accent focus | `rgba(110,135,155,0.35)` | `--accent-focus` | Focus ring |
| Signal up | `#5F8A72` | `--signal-up` | Growth/positive — sparingly |
| Signal warn | `#A97A4C` | `--signal-warn` | Watch/caution — sparingly |
| Signal down | `#8E6464` | `--signal-down` | Decline/negative — sparingly |

### BANNED Colors

The following colors are **permanently banned** from all surfaces:

- Peach, blush, burgundy, terracotta
- Sage, brass, gold-led UI chrome
- Bright SaaS blues (`#3B82F6` and family on public pages)
- `#0A0A0C` (jet black — too harsh)
- `#1E252B` (old wrong graphite)
- `#3E4C5E`, `#2D3748`, `#181614` (legacy warm grays)
- Any `pro-*` prefixed token on public pages (portal-only legacy)

---

## 4. STYLE LOCK — TYPOGRAPHY

### Base System — Tailwind / Non-SCL Surfaces (LOCKED)

| Tier | Font | Source | Usage | Status |
|---|---|---|---|---|
| **Primary** | General Sans | Fontshare CDN | ALL text, ALL public pages using Tailwind `font-sans` | LOCKED |
| **Mono** | JetBrains Mono | Google Fonts | Data values, timestamps, deltas, code blocks — Tailwind `font-mono` | LOCKED |
| **Serif** | None | — | **BANNED** on base system. `font-serif` class is never used on public pages. | LOCKED |

### Clean Room UI System — `--scl-font-*` Namespace (APPROVED 2026-03-06)

Owner-approved override for the `--scl-*` CSS variable namespace only. Does NOT affect Tailwind `font-sans`, `font-mono`, or any non-SCL component.

| Tier | Font | Source | CSS Variable | Usage |
|---|---|---|---|---|
| **Display** | Cormorant Garamond | Google Fonts | `--scl-font-display` | SCL hero headings, editorial display text |
| **Sans** | DM Sans | Google Fonts | `--scl-font-sans` | SCL body text, UI labels, buttons |
| **Mono** | DM Mono | Google Fonts | `--scl-font-mono` | SCL data values, kicker labels, badges |

**Scope:** `--scl-font-*` variables apply only to components using the `.scl-*` class system (`src/styles/socelle-cleanroom.css`). Public pages using Tailwind classes are unaffected. Base system fonts (General Sans, JetBrains Mono) remain authoritative for all non-SCL surfaces.

### Typography Scale

| Token | Size | Line Height | Letter Spacing | Weight |
|---|---|---|---|---|
| `hero` | `clamp(3.5rem, 5.5vw, 5.25rem)` | 1.04 | -0.025em | 400 |
| `section` | `clamp(2.5rem, 3.5vw, 3.5rem)` | 1.1 | -0.02em | 400 |
| `subsection` | `clamp(1.75rem, 2.5vw, 2.25rem)` | 1.15 | -0.015em | 500 |
| `body-lg` | 1.25rem | 1.65 | — | 400 |
| `body` | 1.125rem | 1.65 | — | 400 |
| `eyebrow` | 0.8125rem | 1.2 | 0.12em (caps) | 500 |
| `label` | 0.6875rem | 1.2 | 0.06em | 600 |

### BANNED Fonts (public pages — base system)

DM Serif Display, Playfair Display, Inter (as primary), PPNeueMontreal (unlicensed), SimplonBPMono (unlicensed), any Google Serif font used outside the `--scl-font-display` variable.

> **Note:** Cormorant Garamond, DM Sans, DM Mono are permitted within the `--scl-font-*` namespace only (SCL components). They remain banned as direct Tailwind class overrides on public page markup.

---

## 5. STYLE LOCK — GLASS SYSTEM

### Pearl Glass (canonical spec)

```css
.pearl-glass {
  background: rgba(255, 255, 255, 0.76);
  backdrop-filter: blur(24px) saturate(1.5) brightness(1.03);
  -webkit-backdrop-filter: blur(24px) saturate(1.5) brightness(1.03);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.92),
    inset 0 -1px 0 rgba(200, 196, 190, 0.22),
    0 8px 32px rgba(20, 20, 24, 0.08);
}
```

### Nav Glass Pill

```css
/* Default (not scrolled) */
background: rgba(255, 255, 255, 0.55);
backdrop-filter: blur(6px);
border: 1px solid rgba(255, 255, 255, 0.30);
border-radius: 9999px;

/* Scrolled */
background: rgba(255, 255, 255, 0.80);
backdrop-filter: blur(14px);
border: 1px solid rgba(255, 255, 255, 0.45);
box-shadow: 0 4px 24px rgba(19, 24, 29, 0.08);

/* Transition */
transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
```

### Dark Glass

```css
.glass-dark {
  background: rgba(31, 36, 40, 0.60);
  border: 1px solid rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(12px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}
```

### Glass Rules

- Glass is **pearl diffusion** — not generic frosted blur boxes.
- `brightness(1.03)` creates the luminous pearl quality. This is non-negotiable.
- Highlight edge (inset top shadow) and warm bottom edge are required.
- Glass values are approved for Apple Silicon + Safari rendering. Do not modify.
- `@media (prefers-reduced-motion: reduce)` disables all glass transitions.

---

## 6. "NO FAKE LIVE DATA" RULE (NON-NEGOTIABLE)

Any surface that displays or implies real-time or periodically refreshed data must comply:

| Element | Requirement |
|---|---|
| "Updated X ago" | Must derive from `updated_at` column in the database. Never hardcoded. |
| "Live signals" | Must connect to a real data source with verifiable `fetched_at` timestamp. |
| "Market pulse" | Must aggregate from ingested data with `source_url` and `published_at` attribution. |
| Confidence scores | Must derive from a scoring algorithm with documented methodology, not arbitrary assignment. |
| Trend directions (↑/↓/—) | Must be computed from time-series comparison, not assigned for aesthetics. |
| Signal counts | Must be `COUNT(*)` from a real table, not a hardcoded number. |

### When Data Is Not Yet Available

If the backend infrastructure for a data surface does not exist yet:

1. **MUST** display a clear "Preview Mode" or "Demo Data" label.
2. **MUST NOT** show "Updated X ago" with fictional timestamps.
3. **MUST** use fallback data that is obviously example content.
4. **MUST** include a CTA to subscribe for access when live data launches.
5. **MUST NOT** animate counters that count to zero without explanation.

---

## 7. "BEAUTY IS VISUAL" RULE (NON-NEGOTIABLE)

| Principle | Standard |
|---|---|
| **Video leads** | Every viewport-height section that could have a video, has one. Video is the brand, not decoration. |
| **Real imagery** | Use real images/video assets from the repository. Generate or license new assets as needed. |
| **No gradient content** | Gradients may serve as atmospheric `body::before` layers. They may never substitute for imagery in content sections. |
| **Photo context for data** | Signal cards and intelligence surfaces include photo thumbnails. Numbers without visual context are naked assertions. |
| **Composition, not density** | Generous negative space (120px+ section padding). Beauty is restraint, not compression. |
| **Reduced motion** | `@media (prefers-reduced-motion: reduce)` disables all animations and transitions. No exceptions. |

---

## 8. PAGE FLOW PRINCIPLES

### Homepage Flow

```
Hero (video + glass card) → Market Pulse (3 signal cards) →
How It Works (video + step cards) → Brand Discovery (grid) →
Social Proof (testimonials/metrics) → Conversion Close (CTA + ambient video)
```

### Intelligence Hub Flow

```
Briefing Header (today's top signals) → Category Filters →
Signal Grid (cards with freshness + confidence) → Trend Charts →
Deep Dive CTAs → "Upgrade for full access" gate
```

### Jobs Flow

```
Search Bar + Filters → Job Cards (salary + location + vertical) →
Job Detail (schema-compliant) → Apply CTA → Related Jobs
```

### Brands Flow

```
Category Filter → Brand Grid (logo + category + signal badge) →
Brand Profile (about + products + signals + protocols) →
"Express Interest" or "Shop Wholesale" CTA
```

### Events Flow

```
Time + Category Filters → Event Cards (date + location + type) →
Event Detail (schema-compliant) → "Save to Calendar" + Related Events
```

### Studio Flow (all studios)

```
Dashboard Overview → Workspace (builder/editor/calendar) →
Templates/Presets → Export/Publish → Tutoring Sidebar
```

---

## 9. BANNED SaaS LANGUAGE LIST

The following words and phrases are **banned from all public-facing copy**. Replacements are provided.

| BANNED | REPLACEMENT |
|---|---|
| Get started | Request access / Begin your briefing |
| Learn more | See the data / View intelligence |
| Unlock | Access / Open |
| Empower | Equip / Enable |
| Seamless | Direct / Integrated |
| Leverage | Use / Apply |
| Streamline | Simplify / Reduce steps |
| Optimize | Refine / Improve |
| Synergy | Coordination / Alignment |
| Best-in-class | Industry-leading / Top-performing |
| Next-level | Advanced / Professional-grade |
| Game-changing | Transformative (sparingly) |
| Cutting-edge | Current / Modern |
| Revolutionary | New / Novel |
| Disruptive | Alternative / Different approach |
| Scalable | Extensible / Grows with you |
| Ecosystem | Platform / Network |
| Solutions | Tools / Services / Products |
| Frictionless | Direct / Simple |
| Seamlessly | Directly / Cleanly |
| End-to-end | Complete / Full-spectrum |
| One-stop shop | Complete platform |
| Turnkey | Ready-to-use |
| Robust | Strong / Comprehensive |
| Holistic | Complete / Full-picture |
| Actionable insights | Specific intelligence / Named data |
| Data-driven | Intelligence-informed |
| World-class | (Remove entirely — unverifiable) |
| State-of-the-art | Current / Modern |
| Cutting-edge technology | Current methods / Modern infrastructure |
| Innovative | (Remove — overused, means nothing) |
| Paradigm shift | Change / Evolution |
| Thought leadership | (Remove entirely) |
| Deep dive | Detail / Breakdown / Closer look |
| Low-hanging fruit | Priority opportunity |
| Move the needle | Improve / Change measurably |
| Circle back | Follow up / Return to |
| Take it offline | Discuss separately |
| Bandwidth | Capacity / Availability |
| Pivot | Adjust / Change direction |
| Drill down | Examine / Inspect |
| Value proposition | Value / Offer / Benefit |
| Pain point | Problem / Challenge / Need |
| Stakeholder | Team / Decision-maker / Partner |
| Best practice | Standard / Recommended approach |
| Core competency | Specialty / Strength |
| Synergize | Coordinate / Combine |
| Operationalize | Implement / Execute |
| Ideate | Plan / Design / Create |
| Iterate | Refine / Improve / Adjust |
| Touch base | Connect / Check in |
| Democratize | Make accessible |
| At scale | At volume / Across the platform |
| 360-degree view | Complete view / Full picture |
| Single source of truth | Canonical record / Central record |
| Value-add | Benefit / Addition |
| Onboard | Set up / Welcome / Register |
| Offboard | Remove / Transition out |
| Rightsizing | Adjusting / Scaling |
| Hyperscale | (Remove — meaningless in beauty context) |
| Mission-critical | Essential / Core |
| Greenfield | New / From scratch |
| Net-new | New (just say new) |
| Table stakes | Basic requirement / Minimum standard |
| North star | Goal / Guiding metric |
| Boil the ocean | (Remove — idiom) |
| Full-stack | Complete / End-to-end (if needed) |
| Headless | API-first (if needed, technical context only) |

---

## 10. CONVERSION LADDER LANGUAGE

### Intelligence-Framed CTAs (Approved)

**Discovery tier:**
- "Get Intelligence Access"
- "View Today's Briefing"
- "See Market Pulse"
- "Explore Signal Feed"
- "See What's Moving"
- "Check Category Trends"
- "View Adoption Data"

**Proof tier:**
- "Benchmark Your Market"
- "See Peer Comparison"
- "Check Your Category Position"
- "View Industry Benchmarks"

**Access tier:**
- "Request Platform Access"
- "Claim Your Intelligence Seat"
- "Apply as a Brand Partner"
- "Claim Your Brand Profile"

**Commerce tier:**
- "Browse Verified Brands"
- "Shop Wholesale"
- "View Brand Protocols"

**Studio tier:**
- "Open Your Studio"
- "Start Building"
- "Launch Your Campaign"
- "Build Your Deck"

### BANNED CTAs

Get Started, Learn More, Unlock Growth, Discover More, Sign Up Today, Join Now (without context), Try Free, See Demo (implies SaaS trial), Book a Demo, Schedule a Call.

---

## 11. VOICE GUIDELINES

### The SOCELLE Voice

**Tagline formula:** "Skincare tech but sexy" — premium, clinically credible, slightly provocative.

| Dimension | Standard |
|---|---|
| **Tone** | Confident declarative. States, never explains why it's being confident. |
| **Register** | Professional beauty insider. Not consumer beauty blog. Not enterprise SaaS. |
| **Authority** | Every claim is defensible. No hedging ("we believe," "we aim to," "we hope"). |
| **Specificity** | Every abstract benefit maps to a concrete data type or specific outcome. |
| **Economy** | Hero: 8 words max. Subheadline: 20 words max. Body paragraph: 50 words max. |
| **Global English** | No idioms, no US-only references. Economist-grade clarity that survives translation. |

### Controlled Vocabulary

| Canonical Term | NEVER Use Instead |
|---|---|
| Professional beauty brands | Beauty companies, cosmetic labels, product lines |
| Licensed professionals / operators | Beauty professionals, resellers, buyers, clients |
| Wholesale pricing tiers | Discount levels, tier pricing, membership levels |
| Verified brands | Approved brands, certified brands, vetted brands |
| Commission-only | Success fee, revenue share, take rate |
| Multi-brand single checkout | Unified cart, combined checkout, one cart |
| Intelligence Hub | Analytics dashboard, intelligence platform, data center |
| Purchasing benchmarks | Buying data, purchase analytics, spend data |
| Market signals | Notifications, alerts (unless specifically alert context) |

---

## 12. ENFORCEMENT

This document is the **single authority** for all style, tone, voice, data integrity, and visual direction decisions across the SOCELLE platform. All agents, all surfaces, all platforms must comply.

**Contradiction resolution:** If any other document contradicts this doctrine, this doctrine wins. Update the contradicting document.

**Review cadence:** First Wednesday of each month. Governance agent reviews all work merged in the prior month against this doctrine.

**Violation severity:**
- Style lock violation (wrong color/font/glass) → P0, blocks deploy
- Fake live data violation → P0, blocks deploy
- Banned language violation → P1, fix within 1 week
- Visual rule violation (gradient as content, missing imagery) → P1, fix within 1 week
- Voice/tone drift → P2, fix within 1 month

---

*SOCELLE CANONICAL DOCTRINE v1.0 — March 5, 2026 — Command Center Authority*
