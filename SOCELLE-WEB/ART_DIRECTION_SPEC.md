# SOCELLE Art Direction Spec — Soft Beauty Intelligence
Version: 2.0 | Approved direction after critique of v2

---

## The Problem With v2

v2 was a dark SaaS page with gradients. It had:
- Gradient blocks (.art-1–.art-6) pretending to be imagery
- #0A0A0C ink — jet black, too harsh, no warmth
- Glass that looked like frosted boxes, not pearl
- Hardcoded signal data — not believable
- No video, no photography — purely illustrative

---

## What "Soft Beauty Intelligence" Means

### The Axis

Beauty without intelligence = editorial lifestyle (Goop, Tatcha, La Mer)
Intelligence without beauty = SaaS dashboard (Tableau, Salesforce, generic)
**SOCELLE = the intersection**: warm tactile sensoriality + credible data precision

### The Feel

SOCELLE is:
> Pearl + precision. Sensorial diffusion + data clarity.

Not "dark mode tech." Not "spa editorial." Something rarer:
a professional intelligence platform that feels expensive and sensory.

---

## 10 Non-Negotiable Principles

1. **Video leads.** Every viewport-height section that could have a video, has one. The dropper hero is not decorative — it is the brand.
2. **Pearl over graphite.** The background is pearl mineral (#F6F3EF), not flat white, not dark. Sections alternate: pearl / void / pearl. Never two darks in a row.
3. **Glass is diffusion, not blur.** Pearl glass = `backdrop-filter: blur(26px) saturate(1.5) brightness(1.04)`. The 4% brightness bump creates luminosity. This is not a blur box.
4. **Data has photos.** Every signal card has a photo thumbnail. Numbers without context are assertions. Numbers on imagery are evidence.
5. **Freshness is visible.** "Updated 4m ago" appears on every live data element. No number is asserted without a timestamp.
6. **Confidence tiers are rendered.** Every signal shows High / Med / Low confidence. This makes intelligence feel curated, not scraped.
7. **Typography breathes.** Hero headline at clamp(42px, 6vw, 78px). Sections have 120–160px vertical padding. No "density for density's sake."
8. **Signal colors in data context only.** Green/amber/red for delta values and KPI directions. Never as decorative chrome, borders, or backgrounds.
9. **Gradients are atmosphere, not content.** `body::before` holds the atmospheric gradient. Art blocks (.art-1 etc.) are removed. Imagery is imagery.
10. **Reduced motion is a first-class requirement.** `@media (prefers-reduced-motion: reduce)` disables all animations. No exceptions.

---

## 5 Do / Don't Rules

| Do | Don't |
|---|---|
| Use dropper.mp4 as full-bleed hero | Put any video in an auto-playing modal |
| Show "Updated Xm ago" on all signal data | Assert numbers without timestamps |
| Use pearl glass (`brightness(1.04)` + inset highlights) | Use flat white rgba(255,255,255,0.7) blur boxes |
| Use photo thumbnails on signal cards | Use gradient placeholders (.art-1 etc.) as image proxies |
| Keep negative space generous (120px+ section padding) | Compress sections to feel "content-dense" |

---

## Token Diff (v1 → v2 Softness Pass)

| Token | v1 (harsh) | v2 (soft) | Reason |
|---|---|---|---|
| --ink | #0A0A0C | #141418 | Graphite vs. jet black |
| --ash | #F1F1EF | #F6F3EF | Pearl mineral vs. neutral grey |
| --ash-alt | #E9E9E7 | #EEEAE6 | Warmer parchment |
| --border | rgba(10,10,12,0.09) | rgba(20,20,24,0.07) | Lighter, softer |
| --glass-bg | rgba(255,255,255,0.72) | rgba(255,255,255,0.78) | More opacity |
| glass blur | blur(22px) saturate(1.7) | blur(26px) saturate(1.5) brightness(1.04) | Pearl luminosity |

---

## Glass Refinement

### Generic Glass (what v2 had)
```css
.glass {
  background: rgba(255,255,255,0.72);
  backdrop-filter: blur(22px) saturate(1.7);
  border: 1px solid rgba(255,255,255,0.88);
}
```

### Pearl Glass (v3 — what this page uses)
```css
.pearl-glass {
  background: rgba(255,255,255,0.78);
  backdrop-filter: blur(26px) saturate(1.5) brightness(1.04);
  -webkit-backdrop-filter: blur(26px) saturate(1.5) brightness(1.04);
  border: 1px solid rgba(255,255,255,0.70);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.95),
    inset 0 -1px 0 rgba(200,195,190,0.25),
    0 4px 24px rgba(20,20,28,0.10),
    0 1px 4px rgba(20,20,28,0.06);
}
```

The difference: `brightness(1.04)` creates luminous pearl quality. The inset shadows add depth — a top highlight and a subtle warm bottom edge. Together this reads "expensive" not "frosted glass."

---

## Live Data Definition

### What "Live" Means

| Element | Update Frequency | UI Label |
|---|---|---|
| Market Pulse signals | Daily (6am EST) | "Updated Xh ago" |
| Delta/direction values | Daily | Shown as +X.X% with arrow |
| Total signals tracked | Daily | "X signals tracked today" |
| Trend timeline | Weekly | "Week of [date]" |
| Confidence scores | Updated per refresh cycle | "High / Med / Low" |

### What "Live" Does NOT Mean
- Real-time tick-by-tick (this is not a stock ticker)
- User-specific data on public page (this is aggregate market intelligence)
- Predictions (all signals are retrospective, not forward-looking)

### Sample vs. Production
In the prototype, data comes from `/api/intelligence/market-pulse` with a demo fallback.
The UI renders a "Demo data — sign in for live signals" banner when using fallback.
This is honest and positions the product correctly.

---

## Section-by-Section Art Direction

### Hero
- dropper.mp4 full bleed (cover, center center)
- Dark overlay: rgba(8,8,12,0.45) — enough to read text, not enough to kill the video
- Pearl glass card (not pill): 600px max-width, centered or left-aligned
- Headline: clamp(42px, 6vw, 78px), weight 600, tracking -0.03em, color #FFFFFF
- Live badge (bottom right of hero card): pulsing dot + live signal count from API

### Market Pulse
- Pearl mineral background (#F6F3EF)
- Three pearl-glass signal cards in a horizontal tray
- Each card: photo thumbnail (4:5) left, content right
- Freshness stamp ("Updated 4m ago") bottom of each card
- Confidence pill (High/Med/Low) top of each card
- Loading state: skeleton animation (pearl shimmer)

### How It Works
- foundation.mp4 left panel (50% width, clipped)
- Three step-cards on right (pearl glass, numbered)
- Dark void section background for contrast break

### Before/After
- Full-width scrubber
- photo-4.svg = BEFORE state
- photo-5.svg = AFTER state
- Drag handle = pearl glass circle with ←→ icon

### Brands
- yellow-drops.mp4 ambient intro header
- Swatch grid below (swatches/1.svg – 8.svg)
- Each swatch in pearl glass card, 1:1 crop

### CTA
- air-bubbles.mp4 full bleed ambient
- Dark overlay 55%
- Email input on pearl glass tray
