# ASSET MANIFEST — SOCELLE GLOBAL
**Generated:** March 5, 2026 — Phase 1 Full Audit  
**Authority:** `docs/command/SOCELLE_CANONICAL_DOCTRINE.md` §7  
**Rule:** No gradient art blocks as content. Use repo visuals first.

---

## DEPLOYED VIDEOS (6 files)

Location: `SOCELLE-WEB/public/videos/`

| File | Size | Currently Used On | Recommended Placements |
|---|---|---|---|
| `dropper.mp4` | 3.4MB | Homepage hero ✅ | Intelligence hero |
| `blue-drops.mp4` | 10.2MB | — | ForMedspas hero, Education hero |
| `tube.mp4` | 2.2MB | — | ForBrands hero, BrandStorefront |
| `foundation.mp4` | 2.7MB | — | ForSalons hero, Professionals hero |
| `air-bubbles.mp4` | 1.3MB | — | About hero, RequestAccess hero |
| `yellow-drops.mp4` | 5.7MB | — | HowItWorks hero, Events hero |

### Video Coverage: 1 of 14 applicable pages ❌

---

## RAW SOURCE VIDEOS (6 files)

Location: `SOCELLE-WEB/Images and videos/`

| File | Size | Notes |
|---|---|---|
| `air bubbles.mp4` | 1.3MB | Source copy of `public/videos/air-bubbles.mp4` |
| `blue drops.mp4` | 10.2MB | Source copy of `public/videos/blue-drops.mp4` |
| `dropper.mp4` | 3.4MB | Source copy of `public/videos/dropper.mp4` |
| `foundation.mp4` | 2.7MB | Source copy of `public/videos/foundation.mp4` |
| `tube.mp4` | 2.2MB | Source copy of `public/videos/tube.mp4` |
| `yellow drops.mp4` | 5.7MB | Source copy of `public/videos/yellow-drops.mp4` |

---

## DEPLOYED PHOTOS (7 files)

Location: `SOCELLE-WEB/public/images/`

| File | Format | Recommended Placements |
|---|---|---|
| `photo-1.svg` | SVG (base64 JPEG) | Intelligence cards, About |
| `photo-2.svg` | SVG (base64 JPEG) | Brands directory, ForBrands |
| `photo-3.svg` | SVG (base64 JPEG) | Education, Protocol detail |
| `photo-4.svg` | SVG (base64 JPEG) | Jobs cards, Professionals |
| `photo-5.svg` | SVG (base64 JPEG) | ForMedspas, ForSalons |
| `photo-6.svg` | SVG (base64 JPEG) | BrandStorefront, Plans |
| `photo-7.svg` | SVG (base64 JPEG) | Intelligence Hub, Events |

---

## DEPLOYED SWATCHES (12 files)

Location: `SOCELLE-WEB/public/images/swatches/`

| Files | Use |
|---|---|
| `1.svg` – `12.svg` | Category icons, filter pills, product cards |

---

## RAW INGREDIENT SWATCH PHOTOS — WEB (23 files)

Location: `SOCELLE-WEB/Images and videos/`

| Files | Format | Size Range |
|---|---|---|
| `1.svg` – `23.svg` | SVG (base64 JPEG) | 0.9MB – 14.3MB |

**Recommended:** Product cards, ingredient detail, education. Extract and convert to AVIF/WebP for production.

---

## RAW PHOTO SWATCHES — WEB (12 files)

Location: `SOCELLE-WEB/Images and videos/Photo Skincare Swatches/`

| Files | Format | Size Range |
|---|---|---|
| `1.svg` – `12.svg` | SVG (base64 JPEG) | 0.4MB – 13.6MB |

**Recommended:** Signal cards, intelligence thumbnails, protocol illustrations, social studio templates.

---

## RAW INGREDIENT SWATCH PHOTOS — MOBILE (23 files, DUPLICATE)

Location: `SOCELLE-MOBILE-main/Images Skincare Ingredient Swatches Square/`

| Files | Format | Size Range |
|---|---|---|
| `1.svg` – `23.svg` | SVG (base64 JPEG) | 0.9MB – 14.3MB |

**Note:** These appear to be **duplicates** of the Web copy. Consolidate to single source in monorepo.

---

## RAW PHOTO SWATCHES — MOBILE (12 files, DUPLICATE)

Location: `SOCELLE-MOBILE-main/Photo Skincare Swatches/`

| Files | Format | Size Range |
|---|---|---|
| `1.svg` – `12.svg` | SVG (base64 JPEG) | 0.4MB – 13.6MB |

**Note:** **Duplicate** of Web copy. Consolidate.

---

## OTHER ASSETS

| File | Location | Notes |
|---|---|---|
| `favicon.ico` | `SOCELLE-WEB/public/` | Browser favicon |
| `favicon.svg` | `SOCELLE-WEB/public/` | SVG favicon |
| `og-image.svg` | `SOCELLE-WEB/public/` | OpenGraph share image |
| `vite.svg` | `SOCELLE-WEB/public/` | DELETE — Vite default |
| `_headers` | `SOCELLE-WEB/public/` | Cloudflare headers |
| `_redirects` | `SOCELLE-WEB/public/` | Cloudflare redirects |
| `robots.txt` | `SOCELLE-WEB/public/` | Robots config |
| `sitemap.xml` | `SOCELLE-WEB/public/` | Static sitemap |
| `sitemap-static.xml` | `SOCELLE-WEB/public/` | Static sitemap fragment |

---

## ASSET INVENTORY TOTALS

| Category | Count | Deployed | Raw/Source |
|---|---|---|---|
| Videos | 6 unique | 6 (in `public/`) | 6 (in `Images and videos/`) |
| Photos | 7 | 7 (in `public/images/`) | — |
| Swatches (deployed) | 12 | 12 (in `public/images/swatches/`) | — |
| Ingredient Swatches (raw) | 23 unique | — | 23 Web + 23 Mobile (DUPLICATE) |
| Photo Swatches (raw) | 12 unique | — | 12 Web + 12 Mobile (DUPLICATE) |
| **TOTAL unique assets** | **60** | **25** | **41** |

---

## ASSET GAPS

| Asset Needed | Type | Priority |
|---|---|---|
| Hero poster frames (WebP/AVIF static fallbacks) | Image | P0 |
| Brand logos for directory cards | PNG/SVG | P1 |
| Signal card thumbnails | AVIF/WebP | P1 |
| Event cover images | AVIF/WebP | P1 |
| Job company logos | PNG/SVG | P2 |

---

*Per `docs/command/SOCELLE_FIGMA_TO_CODE_HANDOFF.md` §4: AVIF primary, WebP fallback, JPEG legacy.*
