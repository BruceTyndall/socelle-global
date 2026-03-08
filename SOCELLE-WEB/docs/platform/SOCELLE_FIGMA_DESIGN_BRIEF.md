> Updated to align with V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md on 2026-03-08.
> If this file conflicts with V1 or docs/command/SOCELLE_FIGMA_DESIGN_BRIEF.md, those files win.
> Canonical Figma brief is now at: docs/command/SOCELLE_FIGMA_DESIGN_BRIEF.md

# SOCELLE Figma Design Brief — Build This in Figma

**Purpose:** Your Figma file is blank; this doc is the **single source of truth** to build the SOCELLE design system and key screens in Figma. Use it to create variables, components, and frames so the webapp and Figma stay aligned.

**Design goal:** SOCELLE should feel **superior to working with a single professional beauty brand** — curated, immersive, high-end, calm. One house (SOCELLE), many rooms (brand storefronts).

---

## 1. Design System — Create These in Figma First

### 1.1 Color variables (use these exact hex values)

Create **Figma variables** (or color styles) with these names and values. These match the live app (`tailwind.config.js` + `index.css`).

| Name | Hex | Usage |
|------|-----|--------|
| **pro-navy** | `#8C6B6E` | Primary brand (rosewood), buttons, accents |
| **pro-navy-dark** | `#6E5254` | Hover / pressed states |
| **pro-navy-light** | `#A8888B` | Lighter accent |
| **pro-gold** | `#D4A44C` | Premium accent, logo dot, CTAs |
| **pro-gold-light** | `#E0BA72` | Gold hover |
| **pro-gold-pale** | `#F5EDE0` | Amber tint backgrounds |
| **pro-ivory** | `#F5F3F0` | Page background (DEBVAI Stone) |
| **pro-cream** | `#EDEDE5` | Card / surface (DEBVAI Parchment) |
| **pro-stone** | `#D6D1C9` | Dividers, borders |
| **pro-charcoal** | `#1A1714` | Primary text, dark buttons |
| **pro-warm-gray** | `#6B6560` | Muted text, secondary links |
| **pro-light-gray** | `#5C5652` | Placeholder, disabled (WCAG AA) |
| **white** | `#FFFFFF` | Nav bar, cards, inputs |

**Semantic (optional but useful):**

- **brand-bg** = pro-ivory  
- **brand-surface** = white  
- **brand-border** = pro-stone  
- **brand-text** = pro-charcoal  
- **brand-text-muted** = pro-warm-gray  
- **brand-accent** = pro-navy  
- **brand-gold** = pro-gold  

### 1.2 Typography

| Style name | Font | Size | Weight | Line height | Use |
|------------|------|------|--------|-------------|-----|
| **Display XL** | Playfair Display | 72px | 400 | 1.05 | Hero headline |
| **Display LG** | Playfair Display | 60px | 400 | 1.1 | Section titles |
| **Display MD** | Playfair Display | 48px | 400 | 1.15 | Subsection |
| **Display SM** | Playfair Display | 36px | 400 | 1.2 | Card titles |
| **Headline** | Inter | 20px | 600 | 1.3 | UI headings |
| **Body** | Inter | 16px | 400 | 1.5 | Body copy |
| **Body small** | Inter | 14px | 400 | 1.5 | Secondary text |
| **Label** | Inter | 11px | 600 | 1.2 | Uppercase 0.06em | Labels, overlines |
| **Metric XL** | Inter | 64px | 700 | 1 | Big numbers |
| **Metric LG** | Inter | 48px | 700 | 1 | Stats |

**Fonts:** Playfair Display (serif), Inter (sans). Load from Google Fonts if needed.

### 1.3 Spacing & radius

- **Radius:** 4px (sm), 6px (default), 8px (md), 10px (lg), 12px (xl), 16px (2xl), 20px (3xl).
- **Section padding:** 80px vertical on desktop; 48px on mobile.
- **Container max-width:** 1280px (7xl), centered, horizontal padding 32px (lg) / 24px (md) / 16px (sm).
- **Gap between elements:** 8, 12, 16, 24, 32, 48.

### 1.4 Shadows (for cards, nav, modals)

- **card:** `0 1px 2px 0 rgba(26,23,20,0.04)`
- **card-hover:** `0 2px 8px 0 rgba(26,23,20,0.06), 0 1px 2px 0 rgba(26,23,20,0.03)`
- **panel:** `0 1px 3px 0 rgba(26,23,20,0.05), 0 0 0 1px rgba(214,209,201,0.5)`
- **elevated:** `0 4px 16px 0 rgba(26,23,20,0.08), 0 1px 3px 0 rgba(26,23,20,0.04)`
- **navy (button):** `0 4px 14px 0 rgba(140,107,110,0.15)`

### 1.5 Components to build in Figma

Create these as **components** (with variants where noted):

| Component | Variants | Spec |
|-----------|----------|------|
| **Button** | Primary (charcoal), Accent (navy), Gold, Outline | 44px min height, 24px horizontal padding, 12px vertical, radius 8px (lg). Font: Inter 14px semibold. |
| **Button large** | Same variants | 56px height, 32px horizontal, radius 12px, 16px font. |
| **Card** | Default, Hover | White bg, border pro-stone, radius 12px, shadow-card; hover: shadow-card-hover, -2px translate Y. |
| **Input** | Default, Focus, Error | Border pro-stone, radius 8px, 44px height, 12px padding. Focus: 2px outline pro-gold. |
| **Badge** | Verified (green), Unverified (gray), Under review (amber) | Small pill, 11px label, 4px vertical 8px horizontal padding. |
| **BrandCard** | Default, Featured (optional) | See Section 2.3. |
| **Logo** | — | Wordmark “socelle” Playfair Display, “.” in pro-gold. |

---

## 2. Key Screens — Frames to Build

Build these **frames** (artboards) in Figma. Dimensions: **1440×900** (desktop) or **375×812** (mobile) as needed.

### 2.1 Main Nav (chrome for all public pages)

- **Height:** 56px.
- **Background:** white, border-bottom 1px pro-stone.
- **Layout:** Max-width 1280px centered, flex space-between.
- **Left:** Logo (“socelle.”) + links: Brands, Pricing, About (Inter 14px medium, pro-warm-gray; active/hover pro-charcoal).
- **Right (logged out):** “Sign in” (text link) + “Apply as brand” (primary button: navy bg, white text, arrow icon).
- **Right (logged in):** User name (truncated) + “Dashboard” (or “Orders”) + Sign out.
- **Optional:** Subtle backdrop blur on scroll (e.g. background white/80) for “premium” feel.

### 2.2 Home — Hero

- **Background:** pro-ivory.
- **Layout:** Two columns (60/40 or 50/50). Left: copy; right: visual (gradient blocks or placeholder for hero image).
- **Left column:**
  - Eyebrow: Label, uppercase, pro-gold or pro-warm-gray — e.g. “Professional beauty marketplace”.
  - Headline: Display LG or XL — “One platform. Every professional brand.”
  - Subhead: Body, pro-warm-gray — one line value prop.
  - CTA: “Browse brands” (gold or navy button, large).
  - Optional: 2–3 micro trust lines (e.g. “500+ brands”, “$0 to join”).
- **Right column:** Abstract shapes, gradient (pro-navy/10 to pro-gold/10), or hero image placeholder.
- **Section padding:** 80px vertical.

### 2.3 Home — Stats bar

- **Background:** white or pro-cream; full width; border-top/bottom 1px pro-stone.
- **Layout:** 4 columns, centered, max-width 1280px.
- **Content:** Big number (Metric LG or XL, pro-charcoal) + label (Body small, pro-warm-gray).  
  Example: **500+** Professional brands | **12k+** Licensed businesses | **8%** Commission only | **$0** Reseller fee.

### 2.4 Home — Editorial strip (“Featuring”)

- **Background:** pro-ivory.
- **Title:** “Featuring” or “Trusted by” — Headline, centered or left.
- **Content:** Horizontal scroll or grid of brand logos (placeholders: colored rectangles with initial letter). Names: Naturopathica, Phyto Active, Luminos Pro, Botanica Labs, Environ, Eminence Organics.

### 2.5 Home — Value split (two columns)

- **Left:** “For brands” — bullet list (checkmarks) of value props. Headline: Display SM.
- **Right:** “For resellers” — same. Use pro-gold or pro-navy for checkmark/icon.
- **Background:** white or alternating pro-cream.

### 2.6 Home — Comparison table

- **3 columns:** “General wholesale”, “Brand portals”, “SOCELLE”.
- **Rows:** Short comparison items (e.g. “Beauty-specific”, “Multi-brand checkout”). SOCELLE column highlighted (pro-gold-pale or light border).
- **Style:** Clean table or card row; Headline for column titles.

### 2.7 Home — Testimonials

- **Layout:** 2 or 3 columns of quote cards.
- **Card:** White or pro-cream, radius 12px, padding 24px. Quote (Body, italic or serif), name (Headline small), title (Body small, pro-warm-gray).

### 2.8 Brand Discovery (Brands page)

- **Nav:** Same Main Nav.
- **Above grid (optional):** Short headline “Discover professional beauty brands” + subhead; filters (chips: category, sort).
- **Grid:** Cards in 3–4 columns. Each card = **BrandCard**:
  - **Image area:** 144px height, pro-cream or hero image, gradient overlay bottom for logo.
  - **Badge:** “Top shop” or “Verified” (small badge top-right).
  - **Logo:** Centered on image or below (48px).
  - **Brand name:** Headline, centered.
  - **Category or key stat:** Body small, pro-warm-gray.
  - **Hover:** Card lift (shadow-card-hover), image slight zoom.

### 2.9 Brand Storefront — Hero

- **Trust banner (top):** Full width, thin bar — e.g. “Verified brand” + checkmark; background pro-gold-pale or white, border-bottom pro-stone.
- **Hero block:**
  - **Left:** Logo (120×120 or similar), brand name (Display SM), tagline (Body, pro-warm-gray), category pills (rounded, pro-stone border or pro-cream bg).
  - **Right (optional):** Hero image or gradient.
- **Background:** white or pro-cream; avoid a second palette (in code we will remove the storefront-only `C` and use pro-* tokens here).

### 2.10 Brand Storefront — Stats bar + Press

- **Stats:** 4 columns (e.g. “Years in pro beauty”, “Products”, “Markets”, “Retailers”). Same style as Home stats — number + label.
- **Press:** “As seen in” — logos or text list in a row; cards optional.

### 2.11 Brand Storefront — Product grid

- **Section title:** “Professional products” or “Shop”.
- **Grid:** Product cards — image (square or 4:3), name, price (wholesale or “From $X”), CTA “Add to cart”. Use Card component; radius 8px.

### 2.12 Reseller portal — Sidebar (optional for Figma)

- **Sidebar:** ~240px; bg pro-ivory or white; border-right pro-stone.
- **Nav items:** Dashboard, Browse brands, Orders, Messages, Account. Icon + label; active state pro-navy or pro-charcoal.
- **Header:** Logo + “Back to home” link.

### 2.13 Empty state (component)

- **Use everywhere:** Cart empty, no search results, no orders.
- **Layout:** Centered; illustration or icon (simple); Headline “No [items] yet”; Body “When you [action], they’ll show here”; one CTA button.

---

## 3. What to Do in Figma (Checklist)

1. **Variables / styles:** Create all **color variables** (Section 1.1) and **text styles** (Section 1.2).
2. **Components:** Build **Button**, **Card**, **Input**, **Badge**, **Logo**, **BrandCard** (Section 1.5).
3. **Frames:** Create one frame per screen above (Main Nav as top of each, or one “Chrome” frame + content frames).
4. **Desktop first:** 1440×900; then duplicate and adapt for 375px width for mobile if needed.
5. **Naming:** Use clear names (e.g. “Home – Hero”, “Brand Storefront – Hero”, “Main Nav – Desktop”) so we can reference them later for implementation.

---

## 4. After You Build in Figma

- **Copy link to selection** for each key frame (Home hero, Brand Storefront hero, Main Nav, Brand discovery).
- Paste those links in the project (e.g. in `FIGMA_AUDIT_AND_ACTION_PLAN.md` or in chat). Then we can run **get_design_context** on each and implement (or refine) the webapp from Figma.
- **Single source of truth:** New UI in the app should use the tokens and components defined here (and in code). No new hardcoded palettes (e.g. we will remove the storefront `C` object and use pro-* everywhere).

---

## 5. Optional: Populate Figma from the Live App

If you prefer to **start from the current app** instead of drawing from scratch:

1. Open a **Figma Design** file (not only Make) where you have edit access.
2. Run the SOCELLE webapp locally (`npm run dev`).
3. Use the Figma MCP **generate_figma_design** flow: “Capture the UI of my app at http://localhost:5173 into [Figma Design file URL].”  
   That will capture the current Home, Nav, etc. into Figma. You can then refine layouts and styles in Figma and we re-implement from there.

(Note: generate_figma_design targets **Figma Design** files; Figma Make may behave differently. Prefer a Design file for capture.)

---

**Summary:** Build the design system (colors, type, components) and key screens (Nav, Home, Brand discovery, Brand storefront) in Figma using this brief. Once frames exist, share their links so we can align the webapp and keep one source of truth.
