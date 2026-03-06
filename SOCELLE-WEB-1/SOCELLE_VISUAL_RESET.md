SOCELLE
Visual System Reset
Direction Change Notice  ·  Full Source-of-Truth Replacement
REPLACES
- SOCELLE_COLOR_SYSTEM.docx (all three options — retired)
- SOCELLE_DESIGN_SYSTEM.docx — visual direction sections
- SOCELLE_PLAYBOOK.md — Sections D, E, G, H, I, J, K, N (color / typography / homepage / tone)
- PHASE2_WORK_ORDER.md — Phase 0 decisions D1–D5, Agent 1 brief, globals.css spec
CONTENTS
- A — Conflict Audit: Specific elements that must change
- B — New Parent-Brand Visual Thesis
- C — New Color System: 3 Options + Final Recommendation
- D — New Typography Direction: 3 Options + Recommendation
- E — Revised Homepage Visual Language & Tone
- F — Revised Playbook Visual Direction (replacement text)
- G — Revised Phase 2 Pre-Flight Decisions
- H — Downstream Replacement Map
- I — New Source-of-Truth Stack
# A — Conflict Audit
Severity key: C = Critical (blocks correct build immediately), H = High (produces wrong visual output), M = Medium (creates inconsistency over time).

|  | DOCUMENT / LOCATION | CONFLICTING ELEMENT | ACTION REQUIRED |
| --- | --- | --- | --- |
| C | PHASE2_WORK_ORDER.md Line 17 | D1: sage (#2D5A4E) + brass (#C4956A) | Phase 0 decision hardcodes beauty-coded palette into all downstream agents. Agent 1 will implement the wrong color system. Replace with Mineral Clinical slate system. |
| C | PHASE2_WORK_ORDER.md Lines 468–488 | CSS token block: --accent #2D5A4E, --accent-warm #C4956A, --dark-accent #C4956A | This is the live implementation spec. Any agent using this block will build sage/brass into globals.css. Replace entire token block with new slate system. |
| C | PHASE2_WORK_ORDER.md Lines 304–334 | Full animated gradient-bg class with radial sage/brass gradients | Animated gradient mesh is category-signaling (beauty editorial). Remove. Hero uses static mineral background with no animated gradients. |
| C | PHASE2_WORK_ORDER.md Line 34 | D5: Instrument Serif + Satoshi confirmed | Instrument Serif is editorial/romantic — designed for magazine headlines. Replace with Inter + DM Serif Display (restrained) per new direction. |
| C | SOCELLE_PLAYBOOK.md Line 1085 | Explicit: "deep sage / warm brass … stronger platform-level choice" | This is the single most dangerous document element — it gives agents a rationale to preserve sage/brass. Overwrite this section with new visual thesis. |
| C | SOCELLE_PLAYBOOK.md Lines 1104–1131 | CSS token spec: --accent #2D5A4E, --warm #C4956A, --beauty-accent #D4A44C | Live token spec in playbook conflicts with new direction. Supersede with Part C of this document. |
| H | SOCELLE_PLAYBOOK.md Line 1188 | Homepage: "Use abstract gradient mesh backgrounds (per CURSORRULES)" | Gradient mesh backgrounds are lifestyle/editorial signals. Remove. Replace with static mineral surface + restrained typographic hero. |
| H | SOCELLE_PLAYBOOK.md Line 1191 | "editorial, high-contrast, treatment-room context" photography | Treatment-room photography is category-specific (beauty/spa). Platform photography should show professional commerce, not treatments. |
| H | SOCELLE_PLAYBOOK.md Lines 1152–1156 | Instrument Serif type scale spec (72–96px display) | Full display type spec using romantic editorial serif. Replace with Inter-based scale plus DM Serif Display for hero only. |
| H | tailwind.config.js | pro.navy: #8C6B6E (rosewood), pro.gold: #D4A44C | Both tokens are beauty-coded. Delete both. Replace with stone neutral scale + slate accent only. |
| H | src/index.css Line 2 | @import Playfair Display + Inter | Playfair Display is a heavily beauty-coded serif — one of the most overused fonts in the DTC beauty space. Remove. Replace with Inter + DM Serif Display. |
| H | SOCELLE_PLAYBOOK.md Line 1326 | "SOCELLE wordmark on dark background, warm brass period" | Brand mark spec uses warm brass as brand signature. The new parent-brand mark should use slate or graphite — no decorative accent color in the wordmark. |
| M | SOCELLE_PLAYBOOK.md Lines 1083–1087 | Rosewood preserved as "beauty vertical accent" | Creates two competing brand systems. Platform must have one neutral identity. Remove vertical-specific palettes until verticals are built. |
| M | PHASE2_WORK_ORDER.md Lines 538–546 | Tailwind config: accent-warm, display font Instrument Serif | Tailwind config spec inherits beauty palette. Update per Part H (Replacement Map). |
| M | CURSORRULES / PHASE2 Agent briefs | Scroll-driven storytelling, pinned scroll sections, oversized serif hero | Scroll storytelling pattern is editorial/consumer. B2B platform home can use reveals but not content-pin cinematic scroll. Simplify animations. |

→ C = Critical. These seven items will cause agent builds to implement the wrong system if not overridden. Address before any new agent is briefed.
# B — New Parent-Brand Visual Thesis
## The Platform Is Not A Brand
SOCELLE's visual identity has one job: to disappear. The moment a buyer sees SOCELLE branding competing with a merchant's brand identity, trust in the platform is undermined. The visual system must be premium infrastructure — present, precise, and invisible enough that the merchant brands feel at home.
This is not a compromise. The most valuable commerce platforms in the world operate this way: Shopify does not have a "personality palette." Stripe does not have a "brand color story." Their identity is in the quality of the grid, the precision of the typography, and the restraint of the color. SOCELLE must operate the same way.
### The Five Platform Principles
- 1. Neutral is not boring — it is credible: A neutral system signals that the platform is not competing with its merchants. It signals security, restraint, and confidence. It says: we are so confident in our infrastructure that we do not need expressive branding.
- 2. Color must be functional, not expressive: The platform's accent color does one job: it identifies interactive elements. It is not the brand personality. It is a functional signal. When you see jade or sage on a UI, you think "skincare brand." When you see slate, you think "precision tool."
- 3. Typography and spacing carry the premium signal: Premium does not require color. The most expensive restaurants have the most negative space on the menu. The most credible financial reports use tight, precise type and clean white backgrounds. SOCELLE's premium signal lives in its spacing, its type scale, and its restraint.
- 4. Merchant brands must feel visually compatible: If SOCELLE's UI has a strong warm green or brass identity, every merchant brand with blue, red, or cool-toned packaging will look discordant. A mineral-neutral platform gives every merchant brand the equivalent of a gallery-white wall.
- 5. Multi-category compatibility is non-negotiable: SOCELLE must serve beauty, wellness, medspa, hospitality, and adjacent categories. Sage signals "clean beauty." Brass signals "artisan consumer." Mineral slate signals "professional trade environment" across all categories.
### What SOCELLE IS

| SOCELLE IS | DEFINITION |
| --- | --- |
| Premium operating layer | The platform that professional buyers and verified brands work within. Like Bloomberg for beauty commerce — the infrastructure has no personality; the data does. |
| Trusted trade environment | A credible, neutral space where serious purchasing decisions are made. Visually comparable to a premium commodity exchange — calm, precise, data-forward. |
| Commerce infrastructure | A shell that enables other brands to shine. The platform's job is to be reliable, readable, and invisible enough that the merchant brands lead visually. |
| Clinical luxury (the right kind) | Luxury through precision: tight grids, excellent typography, generous whitespace, premium materials. Not "luxury" through gold accents and decorative gradients. |

### What SOCELLE Is NOT

| SOCELLE IS NOT | WHY THIS FAILS |
| --- | --- |
| A beauty brand | Does not have a "brand color story." Does not signal a single category. Does not use the visual language of consumer DTC brands. |
| A lifestyle editorial platform | Magazines use oversized serif type, gradient meshes, and scroll-cinematic storytelling. SOCELLE is a professional tool — its homepage is a business case, not an editorial statement. |
| Color-forward | Expressive brand palettes (sage, brass, rosewood, jade) compete with merchant brand identities. The platform's visual confidence comes from restraint, not from having a strong accent color. |
| A boutique spa | Warmth-coded design (warm ivory, brass highlights, editorial serif, treatment photography) signals "consumer wellness destination." This is incompatible with medspa, professional hospitality, and serious B2B buyers. |

# C — New Color System
Three options follow, all built on the same design principle: neutral backgrounds, quiet surfaces, one functional accent. The options differ in warmth temperature, dark range depth, and accent character. A final recommendation follows the three options.
## C.1  Option A — Mineral Clinical
RECOMMENDED
Stone-mineral neutrals, barely perceptible warmth (enough to avoid sterile hospital-cold), graphite text, and one slate-blue accent that functions as the single interactive signal. This palette works across every vertical SOCELLE may enter. It is visually compatible with 99% of brand identities. Comparable platforms: Shopify (commerce infrastructure), Stripe (payment infrastructure), Linear (developer tools).
### Neutral Scale — Stone Mineral (Option A)

|  | TOKEN | HEX | NAME | USAGE |
| --- | --- | --- | --- | --- |
|  | --n-0 | #FFFFFF | Pure white | Modal backgrounds, elevated cards only |
|  | --n-25 | #FAFAF9 | Near-white | Hover tints, selection backgrounds |
|  | --n-50 | #F5F4F2 | Porcelain | Page background (replaces warm ivory) |
|  | --n-100 | #ECEAE7 | Light stone | Card surface, panel background |
|  | --n-150 | #E2E0DC | Stone alt | Section alternation, table stripes |
|  | --n-200 | #D5D2CD | Stone | Input backgrounds |
|  | --n-300 | #C0BCBA | Stone border | Default dividers, card borders |
|  | --n-400 | #A8A49F | Gray stone | Focused borders, strong dividers |
|  | --n-500 | #8B8782 | Warm gray | Disabled text, placeholder (by exception) |
|  | --n-600 | #6E6A65 | Gray text | Muted / metadata text — 4.95:1 vs n-50 ✓ |
|  | --n-700 | #504C48 | Dark gray | Secondary text — 8.1:1 vs n-50 ✓✓ |
|  | --n-800 | #302E2B | Near-black | Subheadings on light sections |
|  | --n-900 | #181614 | Graphite ink | Primary text — 17.0:1 vs n-50 ✓✓ AAA |

### Accent — Slate (Option A)
One accent hue. Used exclusively for interactive elements: CTAs, links, focus rings, selected states. No decorative use. No eyebrow labels, no dividers, no background tints.

|  | TOKEN | HEX | NAME | USAGE |
| --- | --- | --- | --- | --- |
|  | --a-50 | #EEF1F5 | Slate tint | Focus ring background, input focus shadow |
|  | --a-100 | #C4CDD8 | Light slate | Hover state background on ghost elements |
|  | --a-200 | #8A99AC | Medium slate | Placeholder icons, decorative dividers (minimal) |
|  | --a-400 | #3E4C5E | Slate primary | Primary CTA, links, focus ring — 6.82:1 ✓✓ |
|  | --a-600 | #2D3748 | Deep slate | CTA hover/pressed — 11.2:1 vs n-50 ✓✓ AAA |
|  | --a-800 | #1A202C | Near-black slate | Dark context accent |

### Semantic Mapping — Option A

| CSS VARIABLE | VALUE | ROLE |
| --- | --- | --- |
| --bg | #F5F4F2 | Page background. Replace all warm ivory (--color-ivory, --n-50 old). |
| --bg-subtle | #ECEAE7 | Card/panel bg on page. For cards that sit on --bg. |
| --bg-muted | #E2E0DC | Section alternation. Never three consecutive --bg sections. |
| --bg-dark | #181614 | Dark sections. At most once per page (CTA band or hero variant). |
| --surface | #FFFFFF | Pure white — elevated modals and cards on --bg-subtle context only. |
| --text | #181614 | Primary text. All body copy and headings. |
| --text-secondary | #504C48 | Supporting copy, captions, form labels. |
| --text-muted | #6E6A65 | Metadata, timestamps, eyebrow text. 4.95:1 vs bg ✓ |
| --text-disabled | #8B8782 | Disabled states only. Not for content. |
| --text-on-dark | #F5F4F2 | Text on --bg-dark sections. |
| --border | #C0BCBA | Default borders — inputs, card edges. |
| --border-strong | #A8A49F | Active/focused borders, table rules. |
| --cta | #3E4C5E | Primary CTA fill. White text: 6.82:1 ✓✓ |
| --cta-hover | #2D3748 | Primary CTA hover. White text: 11.2:1 ✓✓ |
| --cta-text | #FFFFFF | Text on --cta. Always white, never tinted. |
| --link | #3E4C5E | Inline links — 6.82:1 vs white, 6.24:1 vs bg ✓✓ |
| --link-hover | #2D3748 | Link hover — underline + color shift. |
| --focus | #3E4C5E | Focus ring. box-shadow: 0 0 0 3px rgba(62,76,94,0.35) |
| --success | #2E6E4A | Success states. 5.07:1 vs white ✓ |
| --warning-bg | #F7F0E4 | Warning banner background. |
| --warning-text | #6B4A1A | Warning copy on --warning-bg. 7.4:1 ✓✓ |
| --error | #A32828 | Error text, validation messages. 6.5:1 vs white ✓✓ |

### CSS Variables — Option A (Recommended)

| :root { |
| --- |
| /* ── Neutral — Stone Mineral ─────────────── */ |
| --n-0:   #FFFFFF;   --n-25:  #FAFAF9; |
| --n-50:  #F5F4F2;   --n-100: #ECEAE7; |
| --n-150: #E2E0DC;   --n-200: #D5D2CD; |
| --n-300: #C0BCBA;   --n-400: #A8A49F; |
| --n-500: #8B8782;   --n-600: #6E6A65; |
| --n-700: #504C48;   --n-800: #302E2B; |
| --n-900: #181614; |
|  |
| /* ── Accent — Slate ──────────────────────── */ |
| --a-50:  #EEF1F5;   --a-100: #C4CDD8; |
| --a-200: #8A99AC;   --a-400: #3E4C5E; |
| --a-600: #2D3748;   --a-800: #1A202C; |
|  |
| /* ── Semantic ────────────────────────────── */ |
| --bg:              var(--n-50); |
| --bg-subtle:       var(--n-100); |
| --bg-muted:        var(--n-150); |
| --bg-dark:         var(--n-900); |
| --surface:         var(--n-0); |
|  |
| --text:            var(--n-900); |
| --text-secondary:  var(--n-700); |
| --text-muted:      var(--n-600); |
| --text-disabled:   var(--n-500); |
| --text-on-dark:    var(--n-25); |
|  |
| --border:          var(--n-300); |
| --border-strong:   var(--n-400); |
|  |
| --cta:             var(--a-400); |
| --cta-hover:       var(--a-600); |
| --cta-text:        #FFFFFF; |
| --link:            var(--a-400); |
| --link-hover:      var(--a-600); |
| --focus:           var(--a-400); |
|  |
| --success:         #2E6E4A; |
| --warning-bg:      #F7F0E4; |
| --warning-text:    #6B4A1A; |
| --error:           #A32828; |
|  |
| /* ── Shadows (cool-neutral) ──────────────── */ |
| --shadow-sm:    0 1px 2px rgba(24,22,20,0.04); |
| --shadow-card:  0 1px 3px rgba(24,22,20,0.05), 0 1px 2px rgba(24,22,20,0.03); |
| --shadow-hover: 0 4px 16px rgba(24,22,20,0.08), 0 2px 4px rgba(24,22,20,0.04); |
| --shadow-modal: 0 20px 60px rgba(24,22,20,0.14), 0 4px 16px rgba(24,22,20,0.06); |
| } |

## C.2  Option B — Soft Lab Luxury
Chalk-putty neutrals with slightly more warmth than Option A — just enough to feel expensive and human without signaling beauty editorial. Muted slate-teal accent. Comparable: high-end dermatology clinic, fine art gallery, architectural firm. Better than the warm options for businesses that need one degree more approachability than pure clinical.
### Neutral Scale — Chalk/Putty (Option B)

|  | TOKEN | HEX | NAME | USAGE |
| --- | --- | --- | --- | --- |
|  | --n-50 | #F8F6F4 | Chalk | Page background |
|  | --n-100 | #EDEBE7 | Warm putty | Card surface |
|  | --n-200 | #E1DDD8 | Putty | Section alt, inputs |
|  | --n-300 | #C8C2BC | Warm stone | Borders |
|  | --n-400 | #ACA69F | Warm gray | Strong borders |
|  | --n-600 | #6E6760 | Taupe text | Muted text — 5.2:1 ✓ |
|  | --n-700 | #504840 | Dark taupe | Secondary text |
|  | --n-900 | #1C1812 | Deep ink | Primary text — 16.3:1 ✓✓ |

### Accent — Muted Slate-Teal (Option B)

|  | TOKEN | HEX | NAME | USAGE |
| --- | --- | --- | --- | --- |
|  | --b-50 | #EAF3F4 | Teal tint | Focus background |
|  | --b-200 | #90BCC4 | Light teal | Decorative icon fills |
|  | --b-400 | #3D5A62 | Slate-teal | CTA, links — 6.91:1 vs white ✓✓ |
|  | --b-600 | #2A3F45 | Deep slate-teal | Hover — 10.2:1 ✓✓ |

| :root { |
| --- |
| /* ── Neutral — Chalk/Putty ───────────── */ |
| --n-50:  #F8F6F4;   --n-100: #EDEBE7; |
| --n-200: #E1DDD8;   --n-300: #C8C2BC; |
| --n-400: #ACA69F;   --n-600: #6E6760; |
| --n-700: #504840;   --n-900: #1C1812; |
|  |
| /* ── Accent — Muted Slate-Teal ───────── */ |
| --b-50:  #EAF3F4;   --b-200: #90BCC4; |
| --b-400: #3D5A62;   --b-600: #2A3F45; |
|  |
| /* ── Semantic (same structure as A) ─── */ |
| --bg: var(--n-50);   --text: var(--n-900); |
| --cta: var(--b-400); --cta-hover: var(--b-600); |
| --link: var(--b-400); --focus: var(--b-400); |
| } |

## C.3  Option C — Dark Infrastructure Premium
A dark-first system where the platform leads with depth. Rich neutral-carbon surfaces, bone/ash light elements, restrained cerulean accent. For SOCELLE's eventual "Pro" tier or enterprise positioning. Requires more design discipline — dark backgrounds reveal layout weaknesses immediately.
### Dark Surface Scale (Option C)

|  | TOKEN | HEX | NAME | USAGE |
| --- | --- | --- | --- | --- |
|  | --d-900 | #0D0D0F | Deepest dark | Footer, absolute depth |
|  | --d-800 | #141417 | Near-black | Primary dark section bg |
|  | --d-700 | #1F1F23 | Carbon | Section dark bg |
|  | --d-600 | #2B2B30 | Carbon alt | Card on dark |
|  | --d-500 | #3D3D44 | Border strong | Borders on dark |
|  | --d-400 | #555560 | Border | Default borders on dark |
|  | --ld-900 | #F2F2F0 | Ash white | Primary text on dark — 14.8:1 ✓✓ |
|  | --ld-700 | #BEBEBE | Light gray | Secondary text on dark — 8.6:1 ✓✓ |
|  | --ld-500 | #8A8A8A | Mid gray | Muted text on dark — 4.6:1 ✓ |

### Cerulean Accent (Option C) — dual-mode

|  | TOKEN | HEX | NAME | USAGE |
| --- | --- | --- | --- | --- |
|  | --c-50 | #E8F4F8 | Cerulean tint | Focus bg on light sections |
|  | --c-600 | #276278 | Dark cerulean | Links on light sections — 6.65:1 ✓✓ |
|  | --c-300 | #7EC4D8 | Luminous cerulean | CTA on dark sections — 8.72:1 ✓✓ |

| :root { |
| --- |
| /* ── Light context ───────────────────── */ |
| --bg: #F5F4F2;  --text: #181614; |
| --cta: #141417; --cta-text: #F2F2F0;  /* dark button on light */ |
| --link: #276278; --link-hover: #1A404E; |
| --focus: #276278; |
|  |
| /* ── Dark context ────────────────────── */ |
| --bg-dark: #1F1F23;  --surface-dark: #2B2B30; |
| --text-on-dark: #F2F2F0; |
| --cta-on-dark: #7EC4D8;      /* luminous cerulean */ |
| --cta-on-dark-text: #0D0D0F; /* must use dark text on CTA */ |
| --link-on-dark: #7EC4D8; |
| --focus-on-dark: #7EC4D8; |
| } |

## C.4  Final Recommendation

| DECISION | RATIONALE |
| --- | --- |
| Selected Option | A — Mineral Clinical |
| Primary accent | --a-400 Slate #3E4C5E (6.82:1 vs page bg ✓✓) |
| Page background | --n-50 Porcelain #F5F4F2 |
| Text primary | --n-900 Graphite #181614 (17:1 vs bg ✓✓) |
| Why not Option B | Option B's chalk-putty warmth, while subtle, still reads as "elevated spa" in context. The difference between Option A and B is 2% warmth at the neutral level — but in a UI next to diverse merchant brand identities, that 2% risks accumulating into a "beauty platform" read. |
| Why not Option C | Option C is architecturally correct for a "Pro/Enterprise" tier but too high-maintenance for a public marketplace homepage. Dark backgrounds require excellent photography and visual assets that SOCELLE does not yet have. Revisit for v2 or Pro tier. |
| Future consideration | Option C may be applied to SOCELLE's authenticated "Buyer Portal" dashboard context — where the dark interface signals premium professional environment to logged-in buyers making purchasing decisions. |

# D — New Typography Direction
Three directions follow. Each is assessed against: platform-grade feel, category neutrality, B2B buyer trust, accessibility at small sizes, and Google Fonts availability (required for no-cost implementation).
## D.1  Direction 1 — Inter + DM Serif Display
RECOMMENDED
- Body & UI: Inter — the de facto standard for premium digital platforms (GitHub, Figma, Linear, Stripe, Notion). Weight range 100–900. Optimised for screens. Extremely neutral — signals "precision tool," not "brand personality."
- Display (hero only): DM Serif Display — italic only, high contrast, optically elegant. Used for exactly one to two headline moments per page. Never for section headers or body copy. Provides editorial punctuation without committing to an editorial identity.
- Data / Mono: JetBrains Mono — for price display, SKU codes, statistics, order numbers. Reinforces the "professional tool" signal when buyers see pricing tables.
- Character: Precision instrument with one beautiful moment. Bloomberg Terminal had a type upgrade — there is one serif moment at the top, then pure function below.
## D.2  Direction 2 — Plus Jakarta Sans + Cormorant Garamond
- Body & UI: Plus Jakarta Sans — geometric modern, slightly warmer than Inter, still very neutral. Better for a platform positioning slightly toward "premium boutique operator" over "pure infrastructure."
- Display: Cormorant Garamond — extreme optical elegance. Ultra-thin strokes, high contrast. Used for hero headline only, 60px+, never below 40px (too low contrast at small sizes). Risk: feels precious at scale.
- Character: "Fine trade house with heritage." Think premium commodities exchange. More personality than Direction 1, risks feeling dated by 2028 as variable serifs become overused.
## D.3  Direction 3 — DM Sans (Single Typeface)
- Body, UI & Display: DM Sans — one family, differentiated by weight (300 through 700) and size only. No serif. No display typeface. Complete restraint.
- Character: "Radical restraint." The typeface IS the identity — spacing and proportion carry all the premium signal. Used by Notion, Linear, Vercel. Risk: requires exceptional layout discipline to avoid feeling generic SaaS.
## D.4  Recommendation: Direction 1
Inter as the platform standard. DM Serif Display as the single editorial punctuation point — used for hero headline ONLY. This gives SOCELLE a functional platform voice with a moment of premium craft that signals "we are not a commodity SaaS."

| /* ── Typography — Inter + DM Serif Display ───────────────── */ |
| --- |
| @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=DM+Serif+Display:ital@1&family=JetBrains+Mono:wght@400;500&display=swap'); |
|  |
| :root { |
| --font-sans:    'Inter', system-ui, -apple-system, sans-serif; |
| --font-display: 'DM Serif Display', Georgia, serif;  /* italic only */ |
| --font-mono:    'JetBrains Mono', 'Courier New', monospace; |
| } |
|  |
| /* Type Scale */ |
| /* Display: DM Serif Display italic, hero headline ONLY */ |
| .type-display { |
| font-family: var(--font-display); |
| font-style: italic; |
| font-size: clamp(2.75rem, 5.5vw, 4.5rem); |
| line-height: 1.05; |
| letter-spacing: -0.02em; |
| font-weight: 400;  /* DM Serif Display has one weight */ |
| } |
|  |
| /* All other type: Inter */ |
| .type-h1    { font: 600 2.25rem/1.15 var(--font-sans); letter-spacing: -0.025em; } |
| .type-h2    { font: 600 1.75rem/1.2  var(--font-sans); letter-spacing: -0.02em;  } |
| .type-h3    { font: 600 1.25rem/1.3  var(--font-sans); letter-spacing: -0.01em;  } |
| .type-h4    { font: 500 1rem/1.4     var(--font-sans); letter-spacing: 0;        } |
| .type-body  { font: 400 1rem/1.6     var(--font-sans); letter-spacing: 0;        } |
| .type-sm    { font: 400 0.875rem/1.5 var(--font-sans); letter-spacing: 0;        } |
| .type-label { font: 600 0.6875rem/1  var(--font-sans); letter-spacing: 0.07em; |
| text-transform: uppercase; } |
| .type-mono  { font: 400 0.875rem/1.5 var(--font-mono); } |
|  |
| /* DM Serif Display: ONE use per page max */ |
| /* On the homepage: the hero headline */ |
| /* On interior pages: optional pull quote */ |
| /* NEVER: section headers, nav, body copy, CTAs */ |

# E — Homepage Visual Language & Tone
## E.1  Hero Section
The hero communicates the platform's value proposition in one clear sentence, supported by two CTAs and a trust signal. It does not tell a brand story. It does not have a character. It has a purpose.

| ELEMENT | SPECIFICATION |
| --- | --- |
| Background | --bg (#F5F4F2) — flat, no gradient. Potential: a very subtle radial tint in one corner at 4% opacity (n-150). Not animated. Not a gradient mesh. |
| Headline | Inter 600, 56–72px. Maximum 8 words. Direct and functional. One line if possible. |
| Hero subhead | Inter 400, 18–20px, --text-muted. Maximum 2 lines. Commercially precise. |
| CTA 1 | Filled slate (#3E4C5E). White text. "Apply as a brand" or equivalent. Max 4 words. |
| CTA 2 | Outline slate (border: --cta, text: --cta, bg: transparent). "Start buying" or equivalent. |
| Trust signal | Logos of 8–12 onboarded brands as a static grid (no carousel, no animation on load). These logos ARE the expressive color on the page — the platform is the neutral container. |
| DM Serif Display | Optional: if used at all, a single italic subheadline line in DM Serif Display, 28–36px, gray (#6E6A65), BELOW the Inter headline. Provides one editorial punctuation without committing to editorial identity. |

## E.2  Tone — Old vs New
The tone shift is from lifestyle-editorial warmth to calm commercial authority. Below: direct replacements for current playbook copy examples.

| COPY PATTERN | REPLACEMENT |
| --- | --- |
| OLD HEADLINE: "Your story, discovered" | NEW: "Professional beauty commerce, simplified" — functional, platform-grade, credible |
| OLD HEADLINE: "Where great brands meet great buyers" | NEW: "The trade layer for modern beauty" — infrastructure-coded, not editorial |
| OLD SUBHEAD: "Curated brands, seamless ordering" | NEW: "Verified brands. Direct terms. One platform." — B2B buyer language, not consumer DTC |
| OLD CTA: "Join the community" | NEW: "Apply as a brand" — precise, transactional, not social |
| OLD STAT: "Brands that tell a story" | NEW: "340+ verified professional brands" — data, not lifestyle narrative |
| OLD SECTION: "Your journey starts here" | NEW: "How it works" — functional header, no narrative warmth |
| OLD PHOTOGRAPHY DIRECTION: "treatment-room context, editorial" | NEW: "professional commercial environment, clean product presentation, buyer at desk or trade show context" |

## E.3  Section Design Patterns

| PATTERN | SPECIFICATION |
| --- | --- |
| Background alternation | --bg → --bg-subtle → --bg → --bg-dark (once). Never three consecutive identical backgrounds. |
| Section spacing | padding: clamp(4rem, 8vw, 7rem) 0. Generous but not cinematic. Not clamp(8rem, 14vw, 12rem) — that scale signals lifestyle editorial. |
| Dark sections | --bg-dark (graphite) used ONCE per page — for the primary CTA band. White text + ghost CTA button on dark. No animated gradient overlay. |
| Card design | --surface (#FFFFFF) on --bg-subtle background. box-shadow: --shadow-card. border: 1px solid --border. border-radius: 10px. No 3D tilt. No spring animation. Hover: translateY(-4px), shadow increases. Transition: 200ms ease. |
| Grid density | Professional B2B: denser information. 3-column above 1024px for brand cards. 4-column for stat/feature grids. Not 2-column editorial spreads. |
| No pinned scroll | Remove all GSAP pinned scroll sections. Replace with standard scroll reveals (opacity + Y: 20px, duration 0.6s, no blur filter — blur is a consumer/lifestyle signal). |
| Logo marquee | Verified brands as a static or slow-scrolling (paused on hover) logo row. NO gradient fade edges on the marquee — that is an over-styled consumer pattern. |

# F — Revised Playbook Visual Direction
The following text replaces the conflicting sections of SOCELLE_PLAYBOOK.md. These are the authoritative versions. The old text at the referenced lines is retired.
### F.1  Replace: PLAYBOOK Lines 1083–1092 (Color Decision)
OLD TEXT retired. New authoritative text:
The parent-brand visual system must be neutral enough to host many different brand identities. It must not have a "brand color story" in the consumer-DTC sense. The platform's identity is expressed through the quality of its type, the precision of its spacing, and the restraint of its color — not through an expressive accent hue.
The platform color system: stone-mineral neutral backgrounds (#F5F4F2 base), graphite text (#181614), and a single slate accent (#3E4C5E) for interactive elements only. No expressive brand hue. No warm gradient system. No beauty-coded warm color.
### F.2  Replace: PLAYBOOK Lines 1139–1156 (Typography)
Platform typography: Inter (Google Fonts, free) for all UI, body copy, headings, and labels. DM Serif Display italic (Google Fonts, free) for hero headlines only — maximum two uses per page, never in navigation, UI chrome, or body copy. JetBrains Mono for price display, SKU codes, and data values.
### F.3  Replace: PLAYBOOK Line 1188 (Hero Background)
Hero background: --bg (#F5F4F2) flat. No gradient mesh. Optional: a single very subtle radial tint at 4% opacity maximum from one corner. Not animated. The hero visual energy comes from the type hierarchy and the brand logo grid — not from background effects.
### F.4  Replace: PLAYBOOK Line 1191 (Photography)
Photography direction: professional commerce environment. Buyers at trade events, buyers reviewing product samples in a professional retail/medspa context, clean product-on-neutral-surface presentation. NOT treatment rooms. NOT lifestyle editorial. NOT beauty marketing photography. The platform is where business happens — the photography shows business happening.
# G — Revised Phase 2 Pre-Flight Decisions
These replace the five Phase 0 decisions in PHASE2_WORK_ORDER.md. Agent 1 and all downstream agents must reference these, not the originals.

| DECISION | RESOLUTION |
| --- | --- |
| D1 — Color system | RESOLVED: Mineral Clinical. Base: --n-50 #F5F4F2. Accent: --a-400 #3E4C5E (slate). One accent color. No warm palette. No sage, brass, cocoa, jade, or rosewood anywhere in the build. See Part C of this document for full token spec. |
| D2 — Architecture | RESOLVED (unchanged): Next.js 14 App Router + Tailwind + shadcn/ui base. Supabase backend. Stripe Connect. React Query. No changes to technical architecture from original D2. |
| D3 — CTA destination | RESOLVED: "Apply as a brand" → /onboarding/brand (multi-step form). "Start buying" → /onboarding/buyer. Both destinations are separate flows. Authenticated state → respective dashboard. |
| D4 — Email provider | RESOLVED (unchanged): Resend + react-email. Use SOCELLE's own verified domain. No changes from original D4. |
| D5 — Typography | RESOLVED: Inter (all UI, body, headings) + DM Serif Display italic (hero headline only, maximum 2 uses per page). Google Fonts. JetBrains Mono for price and code display. Remove Instrument Serif, Satoshi, and Playfair Display from all agent briefs and CSS preload statements. |

### Agent 1 Brief Update (CSS/Token Agent)
Agent 1 must implement the following globals.css. Replace the existing agent brief's CSS block entirely:

| /* globals.css — AUTHORITATIVE REPLACEMENT ───────────────────── |
| --- |
| Replaces the sage/brass token block in PHASE2_WORK_ORDER.md |
| ──────────────────────────────────────────────────────────── */ |
|  |
| @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=DM+Serif+Display:ital@1&family=JetBrains+Mono:wght@400;500&display=swap'); |
|  |
| @tailwind base; |
| @tailwind components; |
| @tailwind utilities; |
|  |
| :root { |
| /* Neutral */ |
| --n-0: #FFFFFF;    --n-25: #FAFAF9;   --n-50: #F5F4F2; |
| --n-100: #ECEAE7;  --n-150: #E2E0DC;  --n-200: #D5D2CD; |
| --n-300: #C0BCBA;  --n-400: #A8A49F;  --n-500: #8B8782; |
| --n-600: #6E6A65;  --n-700: #504C48;  --n-800: #302E2B; |
| --n-900: #181614; |
|  |
| /* Slate Accent */ |
| --a-50: #EEF1F5;   --a-100: #C4CDD8;  --a-200: #8A99AC; |
| --a-400: #3E4C5E;  --a-600: #2D3748;  --a-800: #1A202C; |
|  |
| /* Semantic */ |
| --bg: var(--n-50);           --bg-subtle: var(--n-100); |
| --bg-muted: var(--n-150);    --bg-dark: var(--n-900); |
| --surface: var(--n-0); |
|  |
| --text: var(--n-900);        --text-secondary: var(--n-700); |
| --text-muted: var(--n-600);  --text-disabled: var(--n-500); |
| --text-on-dark: var(--n-25); |
|  |
| --border: var(--n-300);      --border-strong: var(--n-400); |
|  |
| --cta: var(--a-400);         --cta-hover: var(--a-600); |
| --cta-text: #FFFFFF; |
| --link: var(--a-400);        --link-hover: var(--a-600); |
| --focus: var(--a-400); |
|  |
| --success: #2E6E4A;          --warning-bg: #F7F0E4; |
| --warning-text: #6B4A1A;     --error: #A32828; |
|  |
| /* Typography */ |
| --font-sans:    'Inter', system-ui, sans-serif; |
| --font-display: 'DM Serif Display', Georgia, serif; |
| --font-mono:    'JetBrains Mono', monospace; |
|  |
| /* Shadows */ |
| --shadow-sm:    0 1px 2px rgba(24,22,20,0.04); |
| --shadow-card:  0 1px 3px rgba(24,22,20,0.05), 0 1px 2px rgba(24,22,20,0.03); |
| --shadow-hover: 0 4px 16px rgba(24,22,20,0.08), 0 2px 4px rgba(24,22,20,0.04); |
| } |
|  |
| @layer base { |
| html { -webkit-font-smoothing: antialiased; } |
| body { @apply bg-[#F5F4F2] text-[#181614] font-sans; } |
| *:focus-visible { |
| outline: none; |
| box-shadow: 0 0 0 2px var(--bg), 0 0 0 5px var(--focus); |
| border-radius: inherit; |
| } |
| } |
|  |
| /* REMOVED: gradient-bg, gradient-bg-dark, gradientShift animation */ |
| /* REMOVED: Playfair Display, Instrument Serif, Satoshi imports */ |
| /* REMOVED: --accent (sage), --accent-warm (brass), --dark-accent, --glow */ |

# H — Downstream Replacement Map
Every file that must be updated, and the specific token/class replacements. Run in the order listed — globals.css must be updated before any component agents run.

| FILE / LOCATION | REPLACEMENT ACTION |
| --- | --- |
| src/index.css (globals.css) | REPLACE ENTIRELY with agent brief CSS from Part G. Remove Playfair Display import. Remove gradient-bg classes. Remove all warm palette tokens. |
| tailwind.config.js / .ts | DELETE: pro.navy (#8C6B6E), pro.gold (#D4A44C), pro.navy-dark, pro.navy-light, pro.gold-light, pro.gold-pale, brand.accent, brand.accent-dark, brand.gold, natura.* (all). REPLACE WITH: stone.* (n-* scale), slate.* (a-* scale), plus semantic aliases. See tailwind block below. |
| PHASE2_WORK_ORDER.md Lines 17, 34 | Update Phase 0 checkboxes: D1 = Mineral Clinical confirmed. D5 = Inter + DM Serif Display confirmed. |
| PHASE2_WORK_ORDER.md Lines 304–334 | DELETE gradient-bg and gradient-bg-dark class definitions entirely. Remove gradientShift animation. |
| PHASE2_WORK_ORDER.md Lines 468–546 | REPLACE CSS token block and Tailwind config block with versions from Parts C and G of this document. |
| PHASE2_WORK_ORDER.md Line 101 | UPDATE: "Preload Instrument Serif, swap Satoshi" → "Preload Inter (wght 400,500,600), preload DM Serif Display (ital 400)" |
| SOCELLE_PLAYBOOK.md Lines 1083–1092 | REPLACE with F.1 text from Part F of this document. |
| SOCELLE_PLAYBOOK.md Lines 1104–1131 | REPLACE CSS token block with Option A spec from Part C. |
| SOCELLE_PLAYBOOK.md Lines 1139–1156 | REPLACE with F.2 text from Part F. |
| SOCELLE_PLAYBOOK.md Lines 1188, 1191 | REPLACE with F.3 and F.4 text from Part F. |
| SOCELLE_PLAYBOOK.md Line 1326 | UPDATE wordmark spec: "SOCELLE wordmark, graphite (#181614) on --bg (#F5F4F2). No decorative accent color in the wordmark." |
| SOCELLE_COLOR_SYSTEM.docx | RETIRED. Do not reference. Part C of this document is the color authority. |
| SOCELLE_DESIGN_SYSTEM.docx | RETIRE visual direction sections. Typography, component styles, and color tokens are superseded. Design system document can remain for component spec if updated with new tokens. |

### Tailwind Config Replacement Block

| // tailwind.config.ts — REPLACEMENT SECTION |
| --- |
| // Delete all existing color entries in theme.extend.colors |
| // Replace with: |
| colors: { |
| stone: { |
| 0:   '#FFFFFF',   25:  '#FAFAF9',  50:  '#F5F4F2', |
| 100: '#ECEAE7',   150: '#E2E0DC',  200: '#D5D2CD', |
| 300: '#C0BCBA',   400: '#A8A49F',  500: '#8B8782', |
| 600: '#6E6A65',   700: '#504C48',  800: '#302E2B', |
| 900: '#181614', |
| }, |
| slate: { |
| 50:  '#EEF1F5',   100: '#C4CDD8',  200: '#8A99AC', |
| 400: '#3E4C5E',   600: '#2D3748',  800: '#1A202C', |
| }, |
| // Semantic aliases |
| bg:       '#F5F4F2',  surface:     '#FFFFFF', |
| border:   '#C0BCBA',  'border-strong': '#A8A49F', |
| text:     '#181614',  'text-secondary': '#504C48', |
| 'text-muted': '#6E6A65', |
| cta:      '#3E4C5E',  'cta-hover':  '#2D3748', |
| success:  '#2E6E4A',  error:        '#A32828', |
| // DELETED: pro.navy, pro.gold, brand.accent, natura.* |
| // DELETED: any warm palette references |
| }, |
| fontFamily: { |
| sans:    ['Inter', 'system-ui', 'sans-serif'], |
| display: ['DM Serif Display', 'Georgia', 'serif'], |
| mono:    ['JetBrains Mono', 'Courier New', 'monospace'], |
| // DELETED: serif (Playfair Display), display (Instrument Serif), Satoshi |
| }, |

# I — New Source-of-Truth Stack
The definitive hierarchy of what agents should reference. In all conflicts, documents higher in this list take precedence.

| DOCUMENT STATUS | WHAT THIS MEANS FOR AGENTS |
| --- | --- |
| TIER 1 — ACTIVE (this document) | SOCELLE_VISUAL_RESET.docx — Supersedes all prior visual direction. Final authority on color, typography, tone, and homepage visual language. Date: March 2026. |
| TIER 1 — ACTIVE | PHASE2_WORK_ORDER.md — Technical build spec. Visual sections updated per Part G of this document. Architecture sections (D2, D3, D4) unchanged. |
| TIER 2 — PARTIAL ACTIVE | SOCELLE_PLAYBOOK.md — Sections A–C (platform strategy, ICP, brand positioning) remain valid. Sections D (visual), E (typography), G (UI patterns), H (homepage design), I (tone), J (copy), N (technical stack CSS) must be updated with replacement text from Part F of this document. |
| TIER 3 — RETIRED (visual) | SOCELLE_COLOR_SYSTEM.docx — All three options retired. Color authority is Part C of this document. |
| TIER 3 — RETIRED (visual) | SOCELLE_DESIGN_SYSTEM.docx — Typography spec, component visual styles, and color tokens retired. Component anatomy (what components exist) may be referenced; all style specifications superseded. |
| TIER 4 — LEGACY (live code) | tailwind.config.js + src/index.css — Contains old warm palette. Must be updated per Part H before any new agent build. After update, becomes the authoritative implementation reference. |
| TIER 4 — LEGACY (live code) | .cursorrules — Contains gradient-bg guidance, Instrument Serif references, warm palette. Update the CSS/token and typography sections. Animation guidelines (GSAP/Framer) and architecture rules remain valid. |

ONE-SENTENCE BRIEF FOR ANY NEW AGENT
SOCELLE is a neutral premium infrastructure platform. Color is functional only. One accent (slate #3E4C5E). Stone mineral neutrals (#F5F4F2 base). Inter for all type. DM Serif Display italic for hero headlines only. No warm palette. No beauty branding. The brands are expressive — the platform is not.
