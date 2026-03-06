# SOCELLE Design Plans — Saved Reference

**Purpose:** Single index of all design-related plans and specs. Use this to find what’s been decided and where to implement.

---

## 1. Design system (source of truth)

| Item | Location | Notes |
|------|----------|--------|
| **Colors** | `tailwind.config.js` → `theme.extend.colors.pro` and `brand` | pro-navy `#8C6B6E`, pro-gold `#D4A44C`, pro-ivory, pro-cream, pro-charcoal, pro-warm-gray, etc. |
| **CSS variables** | `src/index.css` → `:root` | `--color-navy`, `--color-gold`, `--font-serif`, `--font-sans`, `--radius-*`, `--shadow-*` |
| **Typography** | `tailwind.config.js` + `index.css` | Playfair Display (serif), Inter (sans); display/metric/headline/body/label scales |
| **Components** | `src/index.css` (`.btn-*`, `.card`, etc.) + `src/components/ui/` | Button, Card, Badge, Input, Modal, Tabs, Table, EmptyState |

**Design debt:** `BrandStorefront.tsx` uses a local `C` palette instead of tokens → migrate to `pro-*` (see UI/UX deep dive + Figma audit P0).

---

## 2. Design docs (read order for new work)

| Doc | Purpose |
|-----|--------|
| **[/docs/platform/UI_UX_SITE_DESIGN_DEEP_DIVE.md](/docs/platform/UI_UX_SITE_DESIGN_DEEP_DIVE.md)** | Research + audit: immersive, high-end, “superior to single brand.” Principles, page-by-page snapshot, P0–P3 recommendations (tokens, hero, motion, editorial). |
| **[/docs/platform/SOCELLE_FIGMA_DESIGN_BRIEF.md](/docs/platform/SOCELLE_FIGMA_DESIGN_BRIEF.md)** | Build the design in Figma from scratch: color variables (hex), typography, spacing/radius/shadows, Button/Card/Input/Badge/BrandCard, and frame-by-frame specs (Main Nav, Home hero/stats/strip/value/comparison/testimonials, Brand Discovery, Brand Storefront hero/stats/press/products, portal sidebar, empty state). |
| **[/docs/platform/FIGMA_AUDIT_AND_ACTION_PLAN.md](/docs/platform/FIGMA_AUDIT_AND_ACTION_PLAN.md)** | When Figma has designs: audit checklist, prioritized action list (P0 token alignment, P1 hero/nav, P2 components, P3 discovery/empty states), handoff format (paste frame URLs), implementation rules. Linked Figma Make file: `HHIoE4828c5y9L6tAI7MVL`. |

---

## 3. Design plans summary

### 3.1 Principles (from UI/UX deep dive)

- **One house, many rooms** — SOCELLE is the house; each brand is a room (consistent frame, distinct tone).
- **Editorial rhythm** — Large type, asymmetric grids, clear sections, whitespace.
- **Calm over noise** — One primary CTA per section; refined hover/focus.
- **Motion with purpose** — Scroll reveals, subtle parallax, micro-interactions.
- **Trust visible and refined** — Verified/pro badges feel premium.
- **Mobile first-class** — Same premium feel, thumb-zone CTAs.

### 3.2 Prioritized actions (from Figma audit)

- **P0:** Replace BrandStorefront `C` with `pro-*` tokens; optionally sync tokens with Figma variables.
- **P1:** Home hero, Brand storefront hero, MainNav from Figma (if frames exist).
- **P2:** Button/Card variants, trust badges, BrandCard featured variant from Figma.
- **P3:** Discovery “above the grid,” Brief tab, empty states from Figma.

### 3.3 Implementation rules (when building from Figma)

- Prefer existing components; extend with variants if Figma differs.
- Use design tokens only; no new hardcoded palettes.
- Don’t rebuild logic — Figma drives layout/styling; data and routing stay as-is.
- If Figma has mobile variants, implement responsive behavior.

### 3.4 Master Brain (AI & 2026 mobile-web — mandatory)

- **AI:** All AI flows go through **ai-orchestrator**; no prompt logic in frontend. Credits via **deduct_credits()** only. See `/docs/MASTER_BRAIN_ARCHITECTURE.md`.
- **Mobile-native:** Min **44×44px** touch targets (`min-h-touch min-w-touch`, `.touch-target`); **safe-area** insets; **WCAG 2.2 AA** contrast; **skeleton** placeholders for AI content (CLS < 0.1). Tokens in `index.css` and `tailwind.config.js`.

---

## 4. Figma links (saved)

| File | URL | fileKey | Type |
|------|-----|--------|------|
| **SOCELLE (yours)** | https://www.figma.com/make/HHIoE4828c5y9L6tAI7MVL/SOCELLE | `HHIoE4828c5y9L6tAI7MVL` | Figma Make |

To implement from Figma: paste frame URLs with `node-id` (right-click frame → Copy link to selection), then use Figma MCP `get_design_context` or follow FIGMA_AUDIT_AND_ACTION_PLAN.

---

## 5. Where design is referenced in the build

- **Master Prompt:** Section 25 reference files (UI_UX deep dive, FIGMA_AUDIT, SOCELLE_FIGMA_DESIGN_BRIEF, **MASTER_BRAIN_ARCHITECTURE**); Section 24 checklist (read UI/UX when touching UI; read Master Brain when touching AI/mobile/credits); Section 27 UI/UX spec; Section 22 Master Brain note; Section 23 "When Building AI, Credit Billing, or Mobile-Native UX."
- **Build tracker:** PLATFORM SPECS table lists UI_UX_SITE_DESIGN_DEEP_DIVE, FIGMA_AUDIT_AND_ACTION_PLAN, SOCELLE_FIGMA_DESIGN_BRIEF, **MASTER_BRAIN_ARCHITECTURE**; weekly review step 3 includes design/community deep dives and Master Brain alignment for AI/mobile/credits work.

---

**Summary:** All design plans are saved in `docs/platform/`: **UI_UX_SITE_DESIGN_DEEP_DIVE.md** (principles + audit), **SOCELLE_FIGMA_DESIGN_BRIEF.md** (build in Figma), **FIGMA_AUDIT_AND_ACTION_PLAN.md** (action from Figma). This file (**DESIGN_PLANS.md**) is the index. Use it to find and apply the design plans.
