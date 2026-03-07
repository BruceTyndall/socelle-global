# SOCELLE ASSET MANIFEST
**Date:** 2026-03-06
**Status:** Owner assets organized — awaiting visual review for final page assignments

---

## VIDEO ASSETS (`public/videos/`)

| File | Size | Budget | Role | Page Assignment |
|------|------|--------|------|----------------|
| `dropper.mp4` | **1.6MB** | PASS (<2MB) | **HERO VIDEO** (primary) | Home hero (all pages can share as fallback) |
| `foundation.mp4` | **1.3MB** | PASS | Section / secondary hero | ForBrands, Brands, ForSalons |
| `tube.mp4` | **1.1MB** | PASS | Section / secondary hero | Intelligence hero |
| `air-bubbles.mp4` | **496KB** | PASS | Section / secondary hero | Events, ForMedspas |
| `blue-drops.mp4` | **5.5MB** | OVER (needs further compression or section-only use) | Section / ambient | Professionals, section backgrounds |
| `yellow-drops.mp4` | **3.1MB** | OVER (needs further compression or section-only use) | Section / ambient | Jobs, HowItWorks |

### Video Encoding Recommendation (per owner)
- **Primary:** H.264 at CRF 23-26, capped at 1080p
- **Progressive:** AV1 or VP9 with H.264 fallback via `<source>` tags
- **Implementation pattern:**
```html
<video autoplay muted loop playsinline poster="/videos/posters/dropper-poster.jpg">
  <source src="/videos/dropper.av1.mp4" type="video/mp4; codecs=av01.0.05M.08">
  <source src="/videos/dropper.mp4" type="video/mp4">
</video>
```
- **Resolution:** Cap at 1080p — 4K unnecessary for web ambient loops
- **Over-budget videos** (`blue-drops`, `yellow-drops`): Re-encode at CRF 26 or downscale to 720p for hero use

### Hero Video Assignment (per owner: "dropper should be hero video")

| Page | Video | Fallback |
|------|-------|----------|
| **Home** | `dropper.mp4` (1.6MB) | poster frame |
| **Intelligence** | `tube.mp4` (1.1MB) | poster frame |
| **Professionals** | `dropper.mp4` (shared from Home) | poster frame |
| **ForBrands** | `foundation.mp4` (1.3MB) | poster frame |
| **Events** | `air-bubbles.mp4` (496KB) | poster frame |
| **Jobs** | `yellow-drops.mp4` (3.1MB — needs compression) | poster frame |
| **Stories** | `dropper.mp4` (shared) | poster frame |
| **HowItWorks** | `yellow-drops.mp4` (already assigned) | poster frame |
| **ForSalons** | `foundation.mp4` (already assigned) | poster frame |
| **ForMedspas** | `air-bubbles.mp4` (already assigned) | poster frame |

---

## SVG IMAGE ASSETS

### Heroes — Widescreen (`public/images/brand/heroes/`)
Dimensions: 1024.5 x 576 (16:9 widescreen) — Figma exports with embedded raster

| File | Original | Size | Intended Page |
|------|----------|------|--------------|
| `hero-home-primary.svg` | 1 copy.svg | 3.4MB | Home — hero overlay or fallback |
| `hero-intelligence-primary.svg` | 2 copy.svg | 430KB | Intelligence |
| `hero-professionals-primary.svg` | 3 copy.svg | 13.0MB | Professionals |
| `hero-brands-primary.svg` | 4 copy.svg | 2.6MB | ForBrands |
| `hero-events-primary.svg` | 5 copy.svg | 8.3MB | Events |
| `hero-jobs-primary.svg` | 6 copy.svg | 5.6MB | Jobs |
| `hero-stories-primary.svg` | 7 copy.svg | 4.9MB | Stories |
| `hero-request-access-primary.svg` | 8 copy.svg | 9.0MB | Request Access |
| `hero-how-it-works-primary.svg` | 9 copy.svg | 3.0MB | How It Works |
| `hero-education-primary.svg` | 10 copy.svg | 8.9MB | Education |
| `hero-protocols-primary.svg` | 11 copy.svg | 1.0MB | Protocols |
| `hero-about-primary.svg` | 12 copy.svg | 4.2MB | About |

**NOTE:** These SVGs contain embedded rasters at 3-13MB each. For production web use, extract the embedded images as WebP/AVIF at 80% quality — target <200KB per hero image. SVG wrapper adds no value for raster content.

### Sections — Near-Square (`public/images/brand/sections/`)
Dimensions: 705 x 591 (~6:5 ratio) — Figma exports with embedded raster

| File | Original | Size | Intended Use |
|------|----------|------|-------------|
| `home-spotlight-01.svg` | 1.svg | 1.8MB | Home SpotlightPanel image |
| `home-card-01.svg` | 2.svg | 888KB | Home FeaturedCardGrid card 1 |
| `home-card-02.svg` | 3.svg | 10.4MB | Home FeaturedCardGrid card 2 |
| `home-card-03.svg` | 4.svg | 1.1MB | Home FeaturedCardGrid card 3 |
| `intelligence-spotlight-01.svg` | 5.svg | 1.5MB | Intelligence SpotlightPanel |
| `intelligence-card-01.svg` | 6.svg | 6.2MB | Intelligence section image |
| `intelligence-card-02.svg` | 7.svg | 3.3MB | Intelligence section image |
| `professionals-spotlight-01.svg` | 8.svg | 3.4MB | Professionals SpotlightPanel |
| `professionals-card-01.svg` | 9.svg | 14.0MB | Professionals card 1 |
| `professionals-card-02.svg` | 10.svg | 7.0MB | Professionals card 2 |
| `brands-spotlight-01.svg` | 11.svg | 3.3MB | ForBrands SpotlightPanel |
| `brands-card-01.svg` | 12.svg | 936KB | ForBrands card 1 |
| `brands-card-02.svg` | 13.svg | 2.7MB | ForBrands card 2 |
| `events-spotlight-01.svg` | 14.svg | 5.0MB | Events SpotlightPanel |
| `events-card-01.svg` | 15.svg | 3.1MB | Events section image |
| `jobs-spotlight-01.svg` | 16.svg | 1.1MB | Jobs SpotlightPanel |
| `jobs-card-01.svg` | 17.svg | 2.0MB | Jobs section image |
| `stories-spotlight-01.svg` | 18.svg | 6.5MB | Stories featured image |
| `how-it-works-feature-01.svg` | 19.svg | 1.5MB | HowItWorks feature section |
| `how-it-works-feature-02.svg` | 20.svg | 1.4MB | HowItWorks feature section |
| `education-spotlight-01.svg` | 21.svg | 5.1MB | Education SpotlightPanel |
| `shared-mosaic-01.svg` | 22.svg | 3.3MB | Shared across ImageMosaic modules |
| `shared-mosaic-02.svg` | 23.svg | 2.5MB | Shared across ImageMosaic modules |

---

## OWNER REVIEW NEEDED

1. **Visual page assignment verification** — The numbering-to-page mapping above is a best guess. Owner should visually review each image and confirm or reassign pages.
2. **SVG → WebP conversion** — These SVGs wrap raster images at 1-14MB each. For web, extract as WebP/AVIF at 80% quality to hit <200KB per image. The SVG wrapper adds zero value for embedded rasters.
3. **Over-budget videos** — `blue-drops.mp4` (5.5MB) and `yellow-drops.mp4` (3.1MB) exceed the 2MB hero budget. Re-encode at CRF 26 or use only in non-hero sections.
4. **Poster frames** — Each video needs a matching poster JPG in `public/videos/posters/` for pre-load and `prefers-reduced-motion` fallback.

---

## REPLACES (from DESIGN_AUDIT.md)

These owner assets replace the **50+ Unsplash stock references** identified in the design audit:
- 6 hero images (one per core page) → replaced by owner hero SVGs + video
- 14+ SpotlightPanel/FeaturedCardGrid Unsplash URLs → replaced by section SVGs
- 6x ImageMosaic Unsplash grids → replaced by section SVGs + mosaic files
- 4x EditorialScroll Unsplash thumbnails → replaced by section SVGs
- SocialProof broken avatars → to be replaced with stat-based trust strip (no image needed)

---

*Generated 2026-03-06 — SOCELLE Asset Pipeline*
