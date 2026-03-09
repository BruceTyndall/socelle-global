# MEDIA PLACEMENT MAP — W15-07
**Audit Date:** 2026-03-06
**Authority:** `build_tracker.md` WO W15-07
**Scope:** All image/video surfaces across public pages + shared components
**Status:** Audit only — no code changes

---

## 1. LOCAL VIDEO ASSETS (Owner-Provided)

All videos are in `public/videos/` with corresponding poster frames in `public/videos/posters/`.

| Asset | File | Poster | Size | Used On |
|---|---|---|---|---|
| Foundation pour | `foundation.mp4` | `foundation-poster.jpg` | Video | `/for-salons` (HeroMediaRail), `/brands` (HeroMediaRail) |
| Air bubbles | `air-bubbles.mp4` | `air-bubbles-poster.jpg` | Video | `/for-medspas` (HeroMediaRail) |
| Yellow drops | `yellow-drops.mp4` | `yellow-drops-poster.jpg` | Video | `/how-it-works` (SplitFeature) |
| Blue drops | `blue-drops.mp4` | `blue-drops-poster.jpg` | Video | **Unused** — available for future placement |
| Dropper | `dropper.mp4` | `dropper-poster.jpg` | Video | **Unused** — available for future placement |
| Tube | `tube.mp4` | `tube-poster.jpg` | Video | **Unused** — available for future placement |

**Verdict:** All 6 videos are owner-provided product footage. No Figma placeholders. No stock video. 3 unused videos available for future pages.

---

## 2. LOCAL IMAGE ASSETS (Owner-Provided)

| Asset | Path | Format | Used On |
|---|---|---|---|
| `photo-1.svg` through `photo-7.svg` | `public/images/photo-*.svg` | SVG | Not directly referenced in public pages — legacy or unused |
| Swatch 1–12 | `public/images/swatches/*.svg` | SVG | Not directly referenced — decorative palette swatches |
| Favicon | `public/favicon.ico`, `public/favicon.svg` | ICO/SVG | Browser tab |
| OG Image | `public/og-image.svg` | SVG | Default OpenGraph image (fallback for social sharing) |
| Vite logo | `public/vite.svg` | SVG | Vite default — can be removed |

**Verdict:** SVG photos and swatches are local. No Figma export artifacts detected. `vite.svg` is framework default — not user-facing.

---

## 3. UNSPLASH STOCK IMAGES (External — Hardcoded)

### 3a. Unique Unsplash Photo IDs in Use

| Photo ID | Subject (Visual) | Pages Using It |
|---|---|---|
| `photo-1714648775477` | Hero — beauty/aesthetics | Home (HERO_IMAGE) |
| `photo-1762279388988` | Hero — lab/science | Intelligence (HERO_IMAGE) |
| `photo-1598214173466` | Hero — beauty professional | ForBrands (HERO_IMAGE) |
| `photo-1601839777132` | Hero — treatment room | Professionals (HERO_IMAGE) |
| `photo-1736939666660` | Hero — team/workspace | Jobs (HERO_IMAGE) |
| `photo-1610207928705` | Hero — event/conference | Events (HERO_IMAGE) |
| `photo-1532187863486` | Lab environment | Intelligence (LAB_IMAGE → BigStatBanner) |
| `photo-1556228578` | Clinical skincare | Home, Intelligence, ForBrands, Professionals (FeaturedCardGrid, SpotlightPanel, TrendCarousel, EditorialScroll fallback) |
| `photo-1598440947619` | LED therapy | Home, Intelligence, ForBrands, Professionals (FeaturedCardGrid, TrendCarousel) |
| `photo-1571019613454` | Injectable aesthetics | Home, Intelligence, ForBrands, Professionals (FeaturedCardGrid, TrendCarousel) |
| `photo-1540555700478` | Body contouring | Home, Intelligence, Professionals (TrendCarousel) |
| `photo-1570172619644` | Beauty/skincare | Home, ForBrands (Mosaic, SplitFeature) |
| `photo-1616394584738` | Product/beauty | Home, ForBrands (Mosaic) |
| `photo-1512290923902` | Skincare/beauty | Home, Intelligence, ForBrands (Mosaic) |
| `photo-1596755389378` | Portrait/beauty | Home, Intelligence, ForBrands, Professionals (Mosaic) |
| `photo-1487412720507` | Portrait/beauty | Home, Intelligence (Mosaic) |
| `photo-1559599101` | Professional treatment | Home, Intelligence, ForBrands, Professionals (Mosaic, SplitFeature) |
| `photo-1576091160550` | Lab/research | Intelligence, Professionals (Mosaic, SplitFeature) |
| `photo-1573461160327` | Beauty treatment | Intelligence (Mosaic) |
| `photo-1540575467063` | Conference/event | Events (SplitFeature) |
| `photo-1522071820081` | Team/collaboration | Jobs (SplitFeature) |

**Total unique photos:** 21
**Total Unsplash references in code:** ~60+ (many reused across pages)

### 3b. Pages With Unsplash Dependencies

| Page | Component | # of Unsplash refs | Placement |
|---|---|---|---|
| `/` (Home) | HeroMediaRail, SpotlightPanel, ImageMosaic, FeaturedCardGrid, TrendCarousel | ~15 | Hero, split feature, mosaic, cards |
| `/intelligence` | HeroMediaRail, BigStatBanner, SpotlightPanel, ImageMosaic, TrendCarousel, EditorialScroll | ~14 | Hero, stat banner, split, mosaic, cards, editorial |
| `/for-brands` | HeroMediaRail, BigStatBanner, SpotlightPanel, ImageMosaic, FeaturedCardGrid | ~13 | Hero, stat banner, splits, mosaic, cards |
| `/professionals` | HeroMediaRail, SpotlightPanel, FeaturedCardGrid, TrendCarousel | ~12 | Hero, splits, cards, carousel |
| `/events` | HeroMediaRail, SplitFeature | 2 | Hero, split feature |
| `/jobs` | HeroMediaRail, SplitFeature | 2 | Hero, split feature |
| `/for-salons` | HeroMediaRail (video) | 0 | Uses local video |
| `/for-medspas` | HeroMediaRail (video) | 0 | Uses local video |
| `/brands` | HeroMediaRail (video) | 0 | Uses local video |
| `/how-it-works` | SplitFeature (video) | 0 | Uses local video |
| `/stories` | (none — uses DB images) | 0 | LIVE from stories.hero_image_url |
| `/stories/:slug` | (none — uses DB images) | 0 | LIVE from stories.hero_image_url |
| `/education` | (none — gradient thumbnails) | 0 | CSS gradients per category |
| `/protocols` | (none — text only) | 0 | No image surfaces |

---

## 4. DATABASE-DRIVEN IMAGES (LIVE)

These images are sourced from Supabase tables at runtime — no hardcoded URLs.

| DB Column | Table | Used By | Status |
|---|---|---|---|
| `logo_url` | `brands` | BrandCard, BrandStorefront | LIVE |
| `hero_image_url` | `brands` | BrandCard, BrandStorefront, BrandPageRenderer | LIVE |
| `image_url` | `brand_products` / `brand_retail_products` | BrandStorefront product cards, ProductCard | LIVE |
| `hero_image_url` | `stories` | StoriesIndex, StoryDetail | LIVE |
| `image_url` | `events` | Events page cards | LIVE (when events table populated) |
| `image_url` | `market_signals` (via `image_url` column) | SpotlightPanel (via useSignalModules) | LIVE |
| `background_image` | brand page config (JSON) | BrandPageRenderer hero | LIVE |

**Verdict:** All DB-driven image surfaces are correctly wired. No Figma placeholders in DB columns.

---

## 5. COMPONENT MEDIA INVENTORY

### Section Primitives (reusable across pages)

| Component | Path | Media Props | Source Type |
|---|---|---|---|
| **HeroMediaRail** | `src/components/public/HeroMediaRail.tsx` | `videoSrc`, `poster`, `image`/`imageSrc` | Props (caller provides URL) |
| **SplitFeature** | `src/components/public/SplitFeature.tsx` | `videoSrc`, `poster`, `imageSrc` | Props (caller provides URL) |
| **SpotlightPanel** | `src/components/modules/SpotlightPanel.tsx` | `image` | Props (caller provides URL) |
| **BigStatBanner** | `src/components/modules/BigStatBanner.tsx` | `backgroundImage` | Props (caller provides URL) |
| **FeaturedCardGrid** | `src/components/modules/FeaturedCardGrid.tsx` | `cards[].image` | Props (array items) |
| **EditorialScroll** | `src/components/modules/EditorialScroll.tsx` | `items[].image` | Props (array items — LIVE from stories or fallback) |
| **ImageMosaic** | `src/components/modules/ImageMosaic.tsx` | `images[]` | Props (string array) |
| **SocialProof** | `src/components/modules/SocialProof.tsx` | Hardcoded `AVATARS` | `/images/avatars/avatar-{1-4}.jpg` — **MISSING from public/** |
| **TrendCarousel** | (inline in pages) | `items[].image` | Unsplash URLs hardcoded per page |

### Brand-Specific Components

| Component | Path | Media Props | Source Type |
|---|---|---|---|
| **BrandCard** | `src/components/BrandCard.tsx` | `logoUrl`, `heroImageUrl` | DB-driven (brands table) |
| **BrandPageRenderer** | `src/components/BrandPageRenderer.tsx` | `hero_image_url`, `background_image`, gallery images, `product.image_url` | DB-driven (brands + products tables) |
| **ProductCard** | `src/components/ProductCard.tsx` | `imageUrl` | DB-driven (brand_products table) |

### Education Component

| Component | Path | Media Props | Source Type |
|---|---|---|---|
| **EducationCard** | `src/components/education/EducationCard.tsx` | None (CSS gradient thumbnails) | Pure CSS — no image dependency |

---

## 6. OG / SEO IMAGE INVENTORY

| Surface | OG Image Source | Status |
|---|---|---|
| Default (all pages) | `public/og-image.svg` via `seo.ts` | Owner-provided SVG |
| `/stories/:slug` | `stories.hero_image_url` (DB) | LIVE — dynamic per story |
| `/brands/:slug` | `brands.logo_url` or `hero_image_url` (DB) → fallback `og-image.svg` | LIVE with fallback |
| `/how-it-works` | Hardcoded `https://socelle.com/og-image.svg` | Static |
| `/jobs/:id` | Hardcoded `https://socelle.com/og-image.svg` | Static |
| `/faq` | Hardcoded `https://socelle.com/og-image.svg` | Static |

---

## 7. FLAGS & ACTION ITEMS

### Issues Found

| # | Issue | Severity | Location | Action Required |
|---|---|---|---|---|
| **F-1** | SocialProof references `/images/avatars/avatar-{1-4}.jpg` but files do NOT exist in `public/images/avatars/` | HIGH | `SocialProof.tsx:4-7` | Add avatar images or replace with CSS initials |
| **F-2** | 21 unique Unsplash photos hardcoded across 6 pages (~60 refs) | MEDIUM | Home, Intelligence, ForBrands, Professionals, Events, Jobs | Replace with owner photography or licensed stock → self-host in Supabase Storage |
| **F-3** | `public/images/photo-{1-7}.svg` appear unused | LOW | `public/images/` | Verify usage or remove to reduce bundle |
| **F-4** | `public/vite.svg` is Vite framework default | LOW | `public/` | Remove before production |
| **F-5** | 3 videos unused (blue-drops, dropper, tube) | INFO | `public/videos/` | Available for future page heroes |

### No Figma Placeholders Found

Verified: Zero references to Figma export URLs, `figma.com` image paths, or placeholder.com / placehold.it / via.placeholder services anywhere in the codebase.

### Media Gating Rules

1. **Hero images**: All public page heroes MUST use either owner-provided video (preferred) or properly licensed stock photography.
2. **DB-driven images**: Brand logos, product images, and story hero images come from the respective DB tables. No hardcoding allowed for DB-entity images.
3. **Editorial images**: Stories use `hero_image_url` from the stories table. Fallback for EditorialScroll items uses Unsplash (acceptable for DEMO, must be replaced for LIVE).
4. **Signal images**: `market_signals.image_url` provides per-signal imagery. Null signals show text-only layout.
5. **Avatars**: SocialProof avatars must be real practitioner photos or replaced with CSS avatar initials.

### Recommended Storage Structure

```
supabase-storage/
  media/
    heroes/           # Page hero images (self-hosted replacements for Unsplash)
    editorial/        # Story hero images
    brands/
      logos/           # Brand logo uploads
      heroes/          # Brand hero images
      products/        # Product catalog images
      galleries/       # Brand page gallery images
    avatars/           # Practitioner/social proof avatars
    events/            # Event promotional images
    videos/            # If migrating from public/ to CDN
```

---

## 8. SUMMARY

| Category | Count | Status |
|---|---|---|
| Owner-provided videos | 6 (3 used, 3 available) | CLEAN |
| Owner-provided images | 19 SVGs + favicon + og-image | CLEAN |
| Unsplash stock photos | 21 unique (60+ refs) | NEEDS REPLACEMENT for production |
| DB-driven image surfaces | 7 columns across 4+ tables | LIVE — correctly wired |
| Missing assets | 4 avatar images (SocialProof) | NEEDS FIX |
| Figma placeholder images | 0 | CLEAN |
| Placeholder service URLs | 0 | CLEAN |

**Data Label:** AUDIT ARTIFACT — no LIVE/DEMO label required (documentation only)

---

*W15-07 Media Placement Map — March 6, 2026 — Web Agent Audit*
