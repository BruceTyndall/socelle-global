# Figma Audit & Action Plan — Minimize Build, Enhance Webapp

**Purpose:** Use existing Figma designs to **reduce net new build** and **elevate** the SOCELLE webapp. This doc is a **checklist and prioritization** so you (or a Figma-connected session) can audit Figma, then action the highest-impact screens and components.

**Note:** Direct Figma file browse is not available in all Cursor sessions. If you have Figma files: **paste Figma file URL(s) and frame URLs** in chat, or use a session with Figma MCP / Dev Mode connected so designs can be read. This doc tells you **what to look for** and **what to action first**.

### Linked Figma file (Figma Make)

| Item | Value |
|------|--------|
| **URL** | https://www.figma.com/make/HHIoE4828c5y9L6tAI7MVL/SOCELLE |
| **Type** | Figma Make |
| **fileKey** | `HHIoE4828c5y9L6tAI7MVL` |
| **Status** | Connected via Figma MCP; `get_design_context` returns screenshot + context for a given node. |

To pull **specific screens**, use URLs that include a **node-id** (e.g. right‑click a frame in Figma → **Copy link to selection**). Example: `https://www.figma.com/make/HHIoE4828c5y9L6tAI7MVL/SOCELLE?node-id=123-456`. Then we can run the audit per frame and implement from design context.

### Building designs from scratch (blank Figma)

If the Figma file is **blank**, use **[/docs/platform/SOCELLE_FIGMA_DESIGN_BRIEF.md](/docs/platform/SOCELLE_FIGMA_DESIGN_BRIEF.md)** to build the design system and key screens in Figma. The brief includes: color variables (pro-* hex), typography (Playfair + Inter), spacing/radius/shadows, Button/Card/Input/Badge/BrandCard components, and frame-by-frame specs for Main Nav, Home (hero, stats, strip, value split, comparison, testimonials), Brand Discovery, Brand Storefront (hero, stats, press, products), and optional Reseller portal sidebar and empty state. After building, share frame links so we can implement or refine the webapp from Figma.

---

## 1. What We Already Have (Codebase)

Use this so we **don’t rebuild** — we **align to Figma** only where it gives a clear upgrade.

| Area | Current implementation | File(s) | Design system |
|------|------------------------|---------|----------------|
| **Public home** | Hero (2-col), stats, editorial strip, value split, comparison, testimonials | `Home.tsx` | `pro-*` tokens, section-container |
| **Main nav** | Sticky bar, logo, Brands/Pricing/About, Sign in / Apply as brand | `MainNav.tsx` | `pro-*`, border-b |
| **Brand discovery** | Grid, category chips, sort, BrandCard (hero img + logo + body) | `Brands.tsx`, `BrandCard.tsx` | `pro-*`, card hover |
| **Brand storefront** | Trust banner, hero (logo + tagline + pills), stats bar, press, products, verified extras | `BrandStorefront.tsx` | **Local `C` palette** — not tokens |
| **Reseller portal** | Sidebar (Dashboard, Browse Brands, Orders, Messages, Account), MainNav | `BusinessLayout.tsx` | `pro-*` |
| **Brand portal** | Tabs (Profile, Products, Protocols, Education, Orders, Retailers, Analytics, Settings) | `BrandHub.tsx`, tab content | `pro-*` (hub tabs often mocked) |
| **UI primitives** | Button, Card, Badge, Input, Modal, Tabs, Table, EmptyState, Skeleton | `src/components/ui/` | `tailwind.config.js`, `index.css` |
| **Cart** | Drawer, line items, per-brand, checkout CTA | `CartDrawer.tsx`, `useCart.ts` | `pro-*` |

**Design debt (from UI/UX deep dive):** BrandStorefront uses its own `C` colors; no full-bleed hero option; motion/scroll reveals underused; nav and discovery could feel more premium.

---

## 2. Figma Audit Checklist

When you open your Figma file(s), check for the following. **Tick what exists** so we know what we can action.

### 2.1 Design system in Figma

- [ ] **Color tokens** — Styles or variables for primary, gold, ivory, cream, charcoal, warm gray (or equivalent). If they match our `pro-*` hex values, we can sync; if not, we can adopt Figma as source of truth.
- [ ] **Typography** — Playfair Display (or serif) + sans (Inter or other). Text styles for display, headline, body, label/caption.
- [ ] **Components** — Button (primary, outline, gold), Card, Input, Badge. If these exist and look more refined than our current UI, we implement from Figma to replace or extend `src/components/ui/`.
- [ ] **Spacing / radius** — 4–20px radius, section padding, container max-width. If documented, we align Tailwind to match.

### 2.2 Key screens / frames to find

- [ ] **Home** — Hero (full-bleed or two-col?), stats, value prop, CTA. If Figma has a stronger hero (e.g. full-bleed image, larger type), we action that.
- [ ] **Brand storefront** — Hero (logo + tagline), trust banner, stats bar, product grid, press section. If Figma has full-bleed hero or “ritual” sections, we prioritize those.
- [ ] **Brand discovery** — Grid of brand cards, filters, possible “featured” or editorial block above grid.
- [ ] **Main nav** — Desktop and mobile. If Figma has backdrop blur, primary CTA style for “Browse brands,” or refined hover, we adopt.
- [ ] **Reseller portal** — Sidebar, dashboard cards, “Brief” or “Intelligence” tab if designed.
- [ ] **Brand portal** — Hub tabs, any “Demand pulse” or analytics layout.
- [ ] **Cart / checkout** — Drawer or inline cart, checkout CTA. Reduces guesswork if we have a spec.

### 2.3 Components that minimize build

- [ ] **BrandCard** — If Figma has a “featured” or “editorial” variant (large card, quote, stat), we add one variant to `BrandCard.tsx` instead of designing from scratch.
- [ ] **Trust / status badges** — Verified, Unverified, “Under review.” If styled in Figma, we replace inline styles in BrandStorefront with tokens + a small Badge variant.
- [ ] **Product card** — Grid item (image, name, price, CTA). If Figma has a clear spec, we align `ProductCard` or BrandShop product list to it.
- [ ] **Empty states** — Illustration + copy. If Figma has these, we plug into `EmptyState` and avoid custom illustration work.
- [ ] **Forms** — Login, signup, apply (brand/reseller). If Figma has form layout and field styling, we align inputs and layout to that.

---

## 3. Prioritized Action List (Minimize Build, Maximize Impact)

Order by **impact vs effort**: use Figma where it gives the biggest visual or UX upgrade with the least new code.

### P0 — Align design system (no new screens)

| Action | What to do | Why |
|--------|------------|-----|
| **Replace BrandStorefront `C` with tokens** | Swap local `C` object for `pro-*` (and semantic tokens) in `BrandStorefront.tsx`; use Tailwind/classes. | Single design language; matches UI/UX deep dive P0. **No Figma required** — we already have tokens. |
| **Sync tokens with Figma (if you have variables)** | If Figma has color/type variables, export or list them; we add any missing tokens to `tailwind.config.js` and CSS. | One source of truth; future screens stay in sync. |

### P1 — One or two high-impact screens from Figma

| Action | What to do | Why |
|--------|------------|-----|
| **Home hero from Figma** | If Figma has a full-bleed or stronger hero: implement that layout and styling; keep our copy and CTAs. | Big “premium” lift; we don’t redesign from scratch. |
| **Brand storefront hero from Figma** | If Figma has full-bleed brand hero or clearer hierarchy: implement in `BrandStorefront.tsx` using **tokens** (no new `C`). | Storefront feels like a “brand world”; fixes drift. |
| **MainNav from Figma** | If Figma has nav with blur, primary CTA, or refined hover: implement. | Chrome feels premium; small surface area. |

### P2 — Components and variants

| Action | What to do | Why |
|--------|------------|-----|
| **Button/Card from Figma** | If Figma has a “premium” or “hero” button/card: add as variant to `Button.tsx` / `.card` and use on Home and storefront. | Reusable; consistent. |
| **Trust badges from Figma** | If Figma has Verified/Unverified/Review badges: implement as Badge (or small component) and use in BrandStorefront + elsewhere. | Removes inline styles; one component. |
| **BrandCard featured variant** | If Figma has a large or “featured” brand card: add variant to `BrandCard.tsx` and use on discovery or home. | Editorial feel with minimal new code. |

### P3 — Nice-to-have from Figma

| Action | What to do | Why |
|--------|------------|-----|
| **Discovery “above the grid”** | If Figma has a hero or editorial block above the brand grid: add to `Brands.tsx`. | Curated feel. |
| **Portal sidebar / Brief tab** | If Figma has reseller “Brief” or “Intelligence” layout: use as reference when we build Phase 3 Brief. | Less back-and-forth later. |
| **Empty states** | If Figma has empty-state art + copy: plug into `EmptyState` for cart, inbox, lists. | Polish without new flows. |

---

## 4. How to Hand Off (So We Can Action)

When you have Figma links, paste them in one of these forms so any session (or Figma MCP) can implement.

### 4.1 Single file

```
Figma file: [paste URL]
Frames to implement (in order):
1. [frame name or URL] — e.g. Home / Hero
2. [frame name or URL] — e.g. Brand Storefront / Hero
3. [frame name or URL] — e.g. Main Nav / Desktop
```

### 4.2 Per screen

```
Home: [Figma frame URL]
Brand Storefront: [Figma frame URL]
Brand Discovery: [Figma frame URL]
Main Nav: [Figma frame URL]
Design system (colors/type): [Figma page or link]
```

### 4.3 Design system only

```
Colors: [Figma variables page or list hex + name]
Typography: [Figma text styles or list]
Components: [Figma components page or list]
```

Then say: “Implement [frame names] using our existing components and tokens where possible; only add new components where Figma clearly differs.”

---

## 5. Implementation Rules (When Acting on Figma)

- **Prefer existing components.** If we have `Button`, `Card`, `Badge`, use them; extend with variants if Figma shows a different style.
- **Use design tokens.** All new or updated UI must use `pro-*` / `brand-*` (or tokens added from Figma). No new hardcoded color objects like BrandStorefront’s `C`.
- **Don’t rebuild logic.** Figma gives layout and styling. Data fetching, routing, and state stay as-is (e.g. BrandStorefront still loads brand from Supabase; we only change markup and styles to match Figma).
- **Mobile:** If Figma has mobile variants, implement responsive behavior; if not, keep our current breakpoints and only adjust where Figma is clearly better.

---

## 6. Summary

| Step | Who | Action |
|------|-----|--------|
| 1 | You (or Figma MCP session) | Open Figma; run **Section 2 checklist**; note which frames and components exist. |
| 2 | You | Paste **file + frame URLs** (Section 4) in chat or in this doc. |
| 3 | Dev / Cursor | **P0:** Remove BrandStorefront `C`, use tokens. **P1:** Implement 1–2 key screens (e.g. Home hero, Storefront hero, Nav) from Figma. **P2:** Add component variants (button, card, badges) from Figma. |
| 4 | Dev / Cursor | Follow **Section 5** rules so we minimize new code and keep one design system. |

**Result:** We use Figma to **minimize build** (reuse components, align to existing tokens, implement only what’s in Figma) and **enhance** the webapp (stronger hero, nav, storefront, and trust components) without redesigning everything from scratch.
