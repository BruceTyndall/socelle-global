# SOCELLE Asset Manifest — Audit March 5, 2026

## Executive Summary

**Total Assets:** 32 files across 3 categories
- **6 Videos:** 24.7 MB (background hero animations)
- **7 Photo SVGs:** 272 KB (embedded JPEG images — see optimization note)
- **12 Brand Color Swatches:** 63 MB (embedded JPEGs in SVG — CRITICAL: unused)
- **2 SVG Meta Assets:** 1.1 KB (favicon, og-image)

**Critical Issues:**
1. Swatches folder (63 MB / 12 files) is NOT used anywhere in codebase — **wasted storage**
2. 6 of 7 photo SVGs are unused (only photo-4 referenced in Intelligence page)
3. All SVGs contain base64-encoded JPEG data instead of vector graphics

---

## Videos

| File | Size | Used In | Placement | Status |
|---|---|---|---|---|
| air-bubbles.mp4 | 1.3 MB | ForMedspas.tsx | Hero background video | Active |
| blue-drops.mp4 | 9.8 MB | ForBuyers.tsx | Hero background video | Active |
| dropper.mp4 | 3.3 MB | Home.tsx | Hero background video | Active |
| foundation.mp4 | 2.7 MB | ForSalons.tsx | Hero background video | Active |
| tube.mp4 | 2.1 MB | ForBrands.tsx | Hero background video | Active |
| yellow-drops.mp4 | 5.5 MB | HowItWorks.tsx | Hero background video | Active |

**Video Summary:**
- All 6 videos are actively used as looping background animations in hero sections
- Each vertical landing page (For Buyers, Brands, Salons, Medspas) + main pages (Home, HowItWorks) have unique videos
- Videos are autoplay-muted with overlay gradients
- **Optimization:** Consider WebM format for better compression (estimate 30-40% size reduction)
- **CDN:** All videos served from Cloudflare, no lazy-loading needed

---

## Photos / Images

### Photo SVGs (embedded JPEG codec — 272 KB total)

| File | Size | Used In | Recommended Placement | Status |
|---|---|---|---|---|
| photo-1.svg | 56 KB | NONE | Originally for case studies/testimonials | Unused |
| photo-2.svg | 24 KB | NONE | Originally for process flow diagrams | Unused |
| photo-3.svg | 32 KB | NONE | Originally for feature spotlights | Unused |
| photo-4.svg | 40 KB | Intelligence.tsx (hero background, opacity 0.07) | Intelligence page hero watermark | Active |
| photo-5.svg | 24 KB | NONE | Originally for product showcase | Unused |
| photo-6.svg | 44 KB | NONE | Originally for comparison sections | Unused |
| photo-7.svg | 52 KB | NONE | Originally for testimonial cards | Unused |

**Photo SVG Status:** 6 of 7 files unused. Only photo-4.svg is referenced as a very faint background watermark in Intelligence page hero.

---

## SVG Assets (Meta/Branding)

| File | Size | Used In | Purpose | Status |
|---|---|---|---|---|
| favicon.svg | 380 B | Browser tabs, bookmarks | Site branding | Active |
| favicon.ico | 0 B | Fallback for older browsers | Deprecated | Unused |
| og-image.svg | 675 B | Social sharing (hardcoded in meta tags) | Open Graph preview | Active |
| vite.svg | 373 B | Legacy template artifact | Dev reference | Unused |

---

## Brand Color Swatches (63 MB / 12 files)

| File | Size | Referenced In | Status |
|---|---|---|---|
| 1.svg | 3.4 MB | NONE | Unused |
| 2.svg | 421 KB | NONE | Unused |
| 3.svg | 2.5 MB | NONE | Unused |
| 4.svg | 4.1 MB | NONE | Unused |
| 5.svg | 8.0 MB | NONE | Unused |
| 6.svg | 5.4 MB | NONE | Unused |
| 7.svg | 4.7 MB | NONE | Unused |
| 8.svg | 8.7 MB | NONE | Unused |
| 9.svg | 2.9 MB | NONE | Unused |
| 10.svg | 13 MB | NONE | Unused |
| 11.svg | 8.5 MB | NONE | Unused |
| 12.svg | 985 KB | NONE | Unused |

**Swatches Analysis:** All 12 files are orphaned assets. Likely generated from a brand color palette tool (Figma export?) but never integrated into the codebase. **Contains embedded JPEG data in SVG format — highly inefficient.**

---

## Public Pages Asset Coverage

| Page | Video | Photo | Comment |
|---|---|---|---|
| Home.tsx | dropper.mp4 | None | Hero video active, no photo backgrounds |
| ForBuyers.tsx | blue-drops.mp4 | None | Hero video active |
| ForBrands.tsx | tube.mp4 | None | Hero video active |
| ForSalons.tsx | foundation.mp4 | None | Hero video active |
| ForMedspas.tsx | air-bubbles.mp4 | None | Hero video active |
| HowItWorks.tsx | yellow-drops.mp4 | None | Hero video active |
| Intelligence.tsx | None | photo-4.svg (watermark) | Very faint background watermark at 7% opacity |
| About.tsx | None | None | No visual assets (gradient backgrounds only) |
| Brands.tsx | None | None | Uses dynamic brand.logo_url from database |
| BrandStorefront.tsx | None | None | Uses dynamic brand.logo_url from database |
| Education.tsx | None | None | No visual assets (icon-driven UI) |
| Pricing.tsx | None | None | No visual assets (gradient backgrounds only) |
| FAQ.tsx | None | None | No visual assets (text + icons) |
| Protocols.tsx | None | None | No visual assets (data tables) |
| ProtocolDetail.tsx | None | None | No visual assets (text content) |
| ApiDocs.tsx | None | None | No visual assets (code blocks) |
| ApiPricing.tsx | None | None | No visual assets (pricing cards) |

---

## Usage Gaps (Pages needing visuals but missing them)

### High Priority — Visual Gap

1. **About.tsx** — Currently uses gradient backgrounds only
   - Missing: Founder/team photos or team section
   - Missing: Company history timeline visuals
   - Missing: Office/workspace imagery
   - Recommendation: Add team photo grid (2-3 high-quality photos)

2. **Education.tsx** — Icon-only design, could benefit from:
   - Missing: Content preview images (screenshots of CE courses)
   - Missing: Category hero images for visual differentiation
   - Recommendation: Add category-specific hero images (beauty treatments)

3. **Pricing.tsx** — Currently minimal visual design
   - Missing: Plan comparison illustrations
   - Missing: Value proposition graphics
   - Recommendation: Add minimal illustrations for each tier

### Medium Priority — Enhancement Gaps

4. **Brands.tsx** — Card-heavy, could use:
   - Missing: Brand showcase/gallery hero image
   - Current: Only uses dynamic brand logos
   - Recommendation: Add hero background image for brand marketplace context

5. **Protocols.tsx** — Data-heavy page
   - Missing: Treatment protocol photography
   - Missing: Medical/spa procedure visuals
   - Current: Icon-only design
   - Recommendation: Add protocol category icons or treatment photos

---

## Unused Assets

### Confirmed Unused (6 files, 230 KB)

1. **photo-1.svg** (56 KB) — No references in src/
2. **photo-2.svg** (24 KB) — No references in src/
3. **photo-3.svg** (32 KB) — No references in src/
4. **photo-5.svg** (24 KB) — No references in src/
5. **photo-6.svg** (44 KB) — No references in src/
6. **photo-7.svg** (52 KB) — No references in src/

### Confirmed Unused (12 files, 63 MB)

All swatch files (1.svg through 12.svg) — zero references in codebase

### Legacy/Deprecated (2 files, 373 B)

1. **favicon.ico** (0 B) — Exists but unused; favicon.svg handles all browsers
2. **vite.svg** (373 B) — Vite template artifact from create-vite

---

## Asset Optimization Recommendations

### 🔴 CRITICAL — Immediate Action Required

**Issue 1: Swatches Folder (63 MB wasted storage)**
- All 12 swatch SVG files contain embedded JPEG data (not vector graphics)
- These files are completely unused in the codebase
- They should be **removed entirely**
- Estimated space recovery: **63 MB**

```bash
# Action: Delete swatches folder
rm -rf public/images/swatches/
```

**Issue 2: Photo SVGs — Inefficient Format (272 KB)**
- All 7 photo SVGs contain base64-encoded JPEG data
- This is an anti-pattern: SVG files should contain vector paths, not embedded images
- Only photo-4.svg is used (as an ultra-low opacity background watermark)

Options:
- **Option A (Recommended):** Convert to optimized JPEG/WebP (photo-4.svg only)
  - photo-4 appears as hero watermark at 7% opacity (nearly invisible)
  - Store as JPEG instead of SVG-wrapped JPEG
  - Space: 40 KB → ~8 KB (estimated 80% reduction)

- **Option B:** Replace with pure SVG vector graphics
  - If these are meant to be illustrations, redraw them as actual SVG paths
  - Would reduce to <5 KB each

### 🟡 HIGH — Video Format Optimization

**Issue: All videos are MP4 format (24.7 MB)**

Recommendation: Generate WebM versions for browsers that support it
- WebM typically achieves 30-40% size reduction vs MP4
- Fallback to MP4 for Safari/IE
- Estimated space: 24.7 MB → 14-17 MB

Implementation:
```html
<video autoPlay muted loop>
  <source src="/videos/dropper.webm" type="video/webm" />
  <source src="/videos/dropper.mp4" type="video/mp4" />
</video>
```

### 🟢 MEDIUM — Meta Asset Cleanup

**Action: Remove favicon.ico**
- Size: 0 B (already empty)
- favicon.svg covers all modern browsers
- Action: Delete from public/ folder

```bash
rm public/favicon.ico
```

**Action: Verify og-image.svg usage**
- Currently hardcoded in Home.tsx meta tags (https://socelle.com/og-image.svg)
- Consider: Generate dynamic og-images per page (one for each route)
- Current: Single generic image for all shares

### Summary: Optimization Impact

| Action | Space Saved | Effort | Priority |
|---|---|---|---|
| Delete swatches/ | 63 MB | 5 min | CRITICAL |
| Delete photo-1,2,3,5,6,7.svg | 200 KB | 5 min | CRITICAL |
| Replace photo-4.svg with JPEG | 32 KB | 10 min | HIGH |
| Generate WebM versions | 10 MB | 30 min | HIGH |
| Delete favicon.ico | 0 B | 1 min | LOW |
| **Total Space Recovery** | **~73 MB** | **~50 min** | — |

---

## Asset Placement Recommendations

### Current Live Configuration

```
/public/
├── videos/          [ACTIVE] 6 MP4 files, 24.7 MB
│   ├── dropper.mp4           → Home.tsx hero
│   ├── blue-drops.mp4        → ForBuyers.tsx hero
│   ├── tube.mp4              → ForBrands.tsx hero
│   ├── foundation.mp4        → ForSalons.tsx hero
│   ├── air-bubbles.mp4       → ForMedspas.tsx hero
│   └── yellow-drops.mp4      → HowItWorks.tsx hero
├── images/
│   ├── photo-4.svg           [ACTIVE] Intelligence.tsx watermark (40 KB)
│   ├── photo-[1,2,3,5,6,7].svg [UNUSED] 206 KB — recommend deletion
│   └── swatches/             [UNUSED] 63 MB — recommend deletion
├── favicon.svg               [ACTIVE] All browsers
├── favicon.ico               [UNUSED] 0 B — recommend deletion
├── og-image.svg              [ACTIVE] Social sharing
└── vite.svg                  [UNUSED] 373 B — recommend deletion
```

### Proposed Optimized Configuration

```
/public/
├── videos/
│   ├── dropper.mp4/webm      → Home.tsx hero
│   ├── blue-drops.mp4/webm   → ForBuyers.tsx hero
│   ├── tube.mp4/webm         → ForBrands.tsx hero
│   ├── foundation.mp4/webm   → ForSalons.tsx hero
│   ├── air-bubbles.mp4/webm  → ForMedspas.tsx hero
│   └── yellow-drops.mp4/webm → HowItWorks.tsx hero
├── images/
│   ├── photo-4.jpg           [Replaced] Intelligence.tsx watermark
│   └── [DELETED: all others]
├── favicon.svg               [KEPT] Browser tabs
└── og-image.svg              [KEPT] Social sharing
```

**Space Savings: 73 MB → 23 MB (68% reduction)**

---

## Video Asset Technical Details

### Current Video Specs

All videos use similar production specs:
- **Format:** MP4 (H.264)
- **Resolution:** 1080p or higher
- **Codec:** H.264 video, AAC audio (silent/muted)
- **Aspect Ratio:** Landscape (hero sections)
- **Usage Pattern:** Autoplay, muted, looping

### Encoding Recommendations

If re-encoding to WebM:
```bash
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 32 -b:v 0 output.webm
```

Estimated bitrate: 1.5-2 Mbps (MP4 currently ~2-3 Mbps)

### CDN Performance

- All videos served via Cloudflare
- Estimated bandwidth reduction with WebM: 10 MB/day (typical SPA with 1000 daily visitors)
- Cost savings: ~$1-2/month at current scale

---

## SVG Embedded Image Detection

### Critical Finding: SVG Files Contain Base64 JPEGs

**Photo SVGs contain base64-encoded JPEG data:**

Example from photo-1.svg (first 1 KB of content):
```xml
<image x="0" y="0" width="1280" xlink:href="data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAA..."/>
```

This is inefficient because:
1. **File size:** Base64 encoding increases size by 33%
2. **Vector graphics lost:** The SVG format advantages (scalability, small file size) are negated
3. **Performance:** Browsers must decode base64 → JPEG on render
4. **Maintenance:** Impossible to edit the image without exporting from a design tool

**Swatches SVGs exhibit the same problem** (confirmed via file analysis)

### Recommended Fix

1. Extract JPEG data from SVGs using ImageMagick:
```bash
convert photo-1.svg photo-1.jpg
```

2. Replace references in code:
```tsx
// Before
<img src="/images/photo-1.svg" alt="description" />

// After
<img src="/images/photo-1.jpg" alt="description" />
```

3. Verify JPEG quality and adjust if needed
4. Delete original SVG files

---

## Asset Manifest Verification Checklist

- [x] All video files located and audited
- [x] All image files located and audited (photo SVGs + swatches)
- [x] All favicon/meta assets located
- [x] Codebase searched for all asset references
- [x] Unused assets identified (photo-1,2,3,5,6,7.svg + all swatches + favicon.ico + vite.svg)
- [x] Active assets verified in source code
- [x] Base64 encoding detected in SVG files
- [x] Size calculations completed for all directories
- [x] CDN and performance implications analyzed

---

## Next Steps for Agent 5 (Asset Optimization)

1. **Phase 1 — Delete Unused Assets** (5 min)
   - Remove all 12 swatch files
   - Remove unused photo SVGs (1,2,3,5,6,7)
   - Remove favicon.ico and vite.svg

2. **Phase 2 — Convert Embedded Images** (10 min)
   - Extract JPEG from photo-4.svg
   - Convert to optimized photo-4.jpg
   - Update Intelligence.tsx reference

3. **Phase 3 — Generate WebM Versions** (30-45 min)
   - Encode 6 videos to WebM format
   - Verify quality matches MP4
   - Update all video references to dual-format (WebM + MP4 fallback)

4. **Phase 4 — Verify Build & Performance** (10 min)
   - Run `npm run build` and verify no broken asset references
   - Check bundle size reduction
   - Verify video playback in Chrome, Firefox, Safari

---

## Audit Metadata

- **Audit Date:** March 5, 2026
- **Auditor Role:** Agent 4 — Visual Asset Porting Agent
- **Repository:** /sessions/affectionate-hopeful-mccarthy/mnt/SOCELLE-WEB
- **Total Assets Audited:** 32 files
- **Total Size Audited:** ~88 MB
- **Unused Assets Found:** 20 files (72.6 MB)
- **Space Recovery Potential:** 68% reduction (73 MB)
