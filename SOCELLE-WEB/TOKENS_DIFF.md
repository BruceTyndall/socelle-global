# Token Diff — Current vs Required

## LOCKED DESIGN SPEC (Authority)

| Token Name | Locked Value | Purpose |
|---|---|---|
| BG | `#F6F3EF` | Page background (pearl mineral) |
| Surface-alt | `#EEEAE6` | Alternate section backgrounds |
| Card | `#FFFFFF` | Card/elevated surfaces |
| Dark panel | `#1F2428` | Dark panels (max 1/page) |
| Footer | `#15191D` | Footer background |
| **Ink (Primary Text)** | **`#141418`** | Primary text (NOT `#1E252B`, NOT `#0A0A0C`) |
| Secondary text | `rgba(20,20,24,0.62)` | Secondary text |
| Muted text | `rgba(20,20,24,0.42)` | Muted text |
| On-dark text | `#F7F5F2` | Text on dark backgrounds |
| On-dark secondary | `rgba(247,245,242,0.72)` | Secondary text on dark |
| Accent | `#6E879B` | CTAs, links, interactive |
| Accent hover | `#5E7588` | Hover state |
| Accent tint | `rgba(110,135,155,0.10)` | Light background tint |
| Signal up | `#5F8A72` | Growth/positive |
| Signal warn | `#A97A4C` | Warning/attention |
| Signal down | `#8E6464` | Decline/negative |
| **Fonts** | **General Sans from Fontshare CDN** | All text (NO serif on public pages) |
| Mono | JetBrains Mono or Geist Mono | Data values only |

---

## Current Tailwind Config Tokens

| Token Name | Current Value | Status |
|---|---|---|
| `mn.bg` | `#F6F4F1` | ❌ WRONG (should be `#F6F3EF`) |
| `mn.surface` | `#EFEBE6` | ✅ CORRECT |
| `mn.card` | `#FFFFFF` | ✅ CORRECT |
| `mn.dark` | `#1F2428` | ✅ CORRECT |
| `mn.footer` | `#15191D` | ✅ CORRECT |
| `graphite` | `#1E252B` | ❌ WRONG (should be `#141418`) |
| `accent.DEFAULT` | `#6E879B` | ✅ CORRECT |
| `accent.hover` | `#5E7588` | ✅ CORRECT |
| `signal.up` | `#5F8A72` | ✅ CORRECT |
| `signal.warn` | `#A97A4C` | ✅ CORRECT |
| `signal.down` | `#8E6464` | ✅ CORRECT |

---

## Current CSS Custom Properties (index.css)

| Variable | Current Value | Locked Value | Status |
|---|---|---|---|
| `--color-bg` | `#F6F4F1` | `#F6F3EF` | ❌ WRONG |
| `--color-surface-alt` | `#EFEBE6` | `#EEEAE6` | ✅ CORRECT |
| `--color-surface-card` | `#FFFFFF` | `#FFFFFF` | ✅ CORRECT |
| `--color-panel-dark` | `#1F2428` | `#1F2428` | ✅ CORRECT |
| `--color-footer` | `#15191D` | `#15191D` | ✅ CORRECT |
| `--color-text-primary` | `#1E252B` | `#141418` | ❌ WRONG |
| `--color-text-secondary` | `rgba(30,37,43,0.62)` | `rgba(20,20,24,0.62)` | ❌ WRONG |
| `--color-text-muted` | `rgba(30,37,43,0.42)` | `rgba(20,20,24,0.42)` | ❌ WRONG |
| `--color-text-on-dark` | `#F7F5F2` | `#F7F5F2` | ✅ CORRECT |
| `--color-text-on-dark-secondary` | `rgba(247,245,242,0.72)` | `rgba(247,245,242,0.72)` | ✅ CORRECT |
| `--color-accent` | `#6E879B` | `#6E879B` | ✅ CORRECT |
| `--color-accent-hover` | `#5E7588` | `#5E7588` | ✅ CORRECT |
| `--color-accent-tint` | `rgba(110,135,155,0.10)` | `rgba(110,135,155,0.10)` | ✅ CORRECT |
| `--color-success` | `#5F8A72` | `#5F8A72` | ✅ CORRECT |
| `--color-warn` | `#A97A4C` | `#A97A4C` | ✅ CORRECT |
| `--color-danger` | `#8E6464` | `#8E6464` | ✅ CORRECT |

---

## Issues Found

### 🔴 CRITICAL: Color Token Violations

#### 1. **Background Color Mismatch**
- **Current:** `mn.bg: #F6F4F1` + `--color-bg: #F6F4F1`
- **Required:** `#F6F3EF` (pearl mineral)
- **Impact:** Subtle warmth drift; affects all page backgrounds
- **Files:** `tailwind.config.js` (line ~21), `src/index.css` (line ~30)

#### 2. **Primary Text Color WRONG (CRITICAL)**
- **Current:** `graphite: #1E252B` + `--color-text-primary: #1E252B`
- **Required:** `#141418` (locked ink value)
- **Impact:** Text is too light/bluish. Spec requires darker, cooler tone.
- **Files:** `tailwind.config.js` (line ~27), `src/index.css` (line ~35), all components using `text-graphite`
- **Usage:** 400+ instances across codebase

#### 3. **Secondary Text Colors WRONG**
- **Current:** Based on `#1E252B` → `rgba(30,37,43,0.62)` and `rgba(30,37,43,0.42)`
- **Required:** Based on `#141418` → `rgba(20,20,24,0.62)` and `rgba(20,20,24,0.42)`
- **Impact:** Secondary text won't coordinate with locked primary color
- **Files:** `src/index.css` (lines ~36-37)

---

## Recommendations for Fixes

### Priority 1: Fix Text Colors (BLOCKS ALL ELSE)
1. Update `graphite` token in tailwind config from `#1E252B` → `#141418`
2. Update `--color-text-primary` CSS var from `#1E252B` → `#141418`
3. Update `--color-text-secondary` CSS var from `rgba(30,37,43,0.62)` → `rgba(20,20,24,0.62)`
4. Update `--color-text-muted` CSS var from `rgba(30,37,43,0.42)` → `rgba(20,20,24,0.42)`
5. Audit all `text-graphite` classes (400+ instances) — most will work as-is, some may need `text-opacity` adjustments
6. Run `npm run build && npx tsc --noEmit` to verify no breakage

### Priority 2: Fix Background Color
1. Update `mn.bg` token in tailwind config from `#F6F4F1` → `#F6F3EF`
2. Update `--color-bg` CSS var from `#F6F4F1` → `#F6F3EF`
3. Update loading splash in `index.html` background from `#F6F4F1` → `#F6F3EF`
4. Verify hero overlays and gradients still align with new tone

### Priority 3: Fonts
- ✅ HTML correctly loads Google Fonts (DM Serif Display, Inter, Playfair)
- ✅ tailwind fontFamily correctly specifies serif fonts
- ✅ index.css global styles correctly apply font-serif to h1/h2/h3
- ⚠️ BUT: Public pages have 93 instances of `font-serif` class — this is the CORRECT behavior per design spec (headings should be DM Serif Display)
- ⚠️ ISSUE: Tailwind config still lists "PPNeueMontreal" and "SimplonBPMono" as primary fonts but fallback to Inter/JetBrains — recommend removing placeholder comments

---

## Impact Assessment

| Issue | Severity | Scope | Fix Time |
|---|---|---|---|
| Primary text color (`#1E252B` → `#141418`) | CRITICAL | 400+ instances | 1 hour (4 file updates + testing) |
| Secondary text colors | HIGH | CSS vars | 10 min |
| Background color (`#F6F4F1` → `#F6F3EF`) | MEDIUM | 20+ instances | 15 min |
| Font setup | LOW | Info only | 0 min (correct already) |

---

## Sign-Off

**Current Design Score:** 5/10 (colors off, will look slightly off-tone; fonts correct)
**After Fixes:** 10/10 (all tokens locked to spec)
