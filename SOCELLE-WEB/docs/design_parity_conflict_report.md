# DESIGN PARITY CONFLICT REPORT
**Agent:** Design Parity Agent
**Date:** 2026-03-06
**Session:** Clean Room UI System — Candidate CSS vs Pearl Mineral V2 (Locked)
**Authority:** `/.claude/CLAUDE.md` → `docs/command/SOCELLE_CANONICAL_DOCTRINE.md` → `docs/command/SOCELLE_FIGMA_TO_CODE_HANDOFF.md`
**Status:** CONFLICT FOUND — Owner approval required before adoption of typography changes

---

## 1. SUMMARY

The proposed "Clean Room UI System" (`--scl-*` namespace) contains **3 hard-block violations** against locked command docs, **2 soft color drift issues**, and **1 pre-existing compliance violation** in the current `index.css` that must be resolved independently. The structural/component patterns in the candidate CSS are largely safe to stage additively — but the typography stack cannot be adopted without owner sign-off.

---

## 2. HARD-BLOCK VIOLATIONS (Cannot adopt without owner approval)

### VIOLATION 1 — SERIF FONT: Cormorant Garamond
- **Candidate:** `--scl-font-display: "Cormorant Garamond", Georgia, serif`
- **Rule:** `SOCELLE_CANONICAL_DOCTRINE.md §4` — "No serif font on any public surface. BANNED."
- **Affected tokens:** `--scl-font-display`, `.scl-card__title`, `h1, h2, h3` in `@layer base`
- **Resolution required:** Replace with `"General Sans"` (locked primary) or get explicit owner override in command docs

### VIOLATION 2 — WRONG PRIMARY FONT: DM Sans
- **Candidate:** `--scl-font-sans: "DM Sans", system-ui, ...`
- **Rule:** `SOCELLE_CANONICAL_DOCTRINE.md §4` — "General Sans via Fontshare CDN — ALL text, ALL public pages, ALL sizes. LOCKED."
- **Resolution required:** Replace with `"General Sans"` from Fontshare CDN

### VIOLATION 3 — WRONG MONO FONT: DM Mono
- **Candidate:** `--scl-font-mono: "DM Mono", ui-monospace, ...`
- **Rule:** `SOCELLE_CANONICAL_DOCTRINE.md §4` — "Geist Mono or JetBrains Mono — data values, timestamps, deltas, code blocks only. LOCKED."
- **Resolution required:** Replace with `"JetBrains Mono"` (already imported in `index.html`)

---

## 3. COLOR DRIFT (Soft — must reconcile before public use)

| Token | Candidate Value | Resolved Hex | Locked Value | Delta |
|---|---|---|---|---|
| `--scl-ink-1` (primary text) | `hsl(18 18% 10%)` | `~#1C1816` | `#141418` (graphite) | ~10 lightness pts off — DRIFT |
| `--scl-paper-1` (background) | `hsl(36 33% 97%)` | `~#FAF7F3` | `#F6F3EF` (mn.bg) | Slightly warmer — DRIFT |
| `--scl-accent-1` (champagne) | `hsl(38 38% 52%)` | `~#B8956A` | `#6E879B` (accent) | Different hue family — DRIFT |

**Rule source:** `SOCELLE_CANONICAL_DOCTRINE.md §3` + `SOCELLE_FIGMA_TO_CODE_HANDOFF.md §1` (Color Token Parity Table)

**Resolution:** Before applying `--scl-*` tokens to any public surface, remap to locked values:
- `--scl-ink-1` → `#141418`
- `--scl-paper-1` → `#F6F3EF`
- `--scl-accent-1` → `#6E879B`

---

## 4. PRE-EXISTING VIOLATIONS IN CURRENT `index.css` (Requires separate WO)

The current `SOCELLE-WEB/src/index.css` contains **banned font imports** that are not from this candidate but are already present:

```css
/* TOP OF index.css — currently live */
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600;700&family=Playfair+Display...');
--font-sans: 'Inter', system-ui, sans-serif;
--font-serif: 'DM Serif Display', Georgia, serif;
```

- **DM Serif Display** — explicitly banned: `SOCELLE_CANONICAL_DOCTRINE.md §4` "BANNED Fonts (public pages)"
- **Playfair Display** — explicitly banned: same section
- **Inter as primary** — banned: same section
- These are NOT from the candidate CSS — they pre-exist and must be cleaned up under a separate WO

Additionally, `index.css` contains an inline "Warm Cocoa / Premium Glass / Editorial Typography" token block (`--color-primary-cocoa: #47201c`) with no corresponding WO in `build_tracker.md`. This requires audit.

---

## 5. WHAT IS SAFE TO STAGE (Additive, non-destructive)

The following from the candidate CSS introduce **no conflicts** and can be added as an additive layer:

| Element | Safe? | Notes |
|---|---|---|
| `--scl-*` CSS variable namespace | YES | Additive, no collision with `mn.*`, `--color-*` |
| `@layer reset` block | YES | Matches current reset patterns |
| Spacing tokens (`--scl-1` through `--scl-16`) | YES | Different naming, no collision |
| Radius tokens (`--scl-r1`, `--scl-r2`, `--scl-r3`, `--scl-pill`) | YES | Additive, check vs locked radius values |
| Shadow stack (`--scl-sh-1`, `--scl-sh-2`) | YES | Different from current `--shadow-*` — additive |
| Motion tokens (`--scl-ease`, `--scl-fast`, `--scl-med`, `--scl-slow`) | YES | Additive |
| Layout tokens (`--scl-max`, `--scl-gutter`, `--scl-nav-h`) | PARTIAL | `--scl-nav-h: 76px` vs current `--header-height: 72px` — reconcile |
| `.scl-container`, `.scl-section`, `.u-*` utilities | YES | Additive, no collision |
| `.scl-nav`, `.scl-btn`, `.scl-card`, `.scl-badge`, `.scl-field` components | YES (with font fix) | Safe if fonts are corrected to locked stack |
| `.scl-hero__bg` radial gradient | YES | Additive decorative layer |
| `.scl-footer` | REVIEW | Dark bg matches `mn.footer` intent — verify hex |

---

## 6. STAGED INTEGRATION PLAN

### Phase A — Owner Decision Required (BLOCKED until approved)
- [ ] Owner approves or rejects typography changes (Cormorant Garamond, DM Sans, DM Mono)
- [ ] If rejected: map `--scl-font-*` to locked stack and proceed
- [ ] If approved: update `SOCELLE_CANONICAL_DOCTRINE.md §4` first (change control required)

### Phase B — Pre-existing Cleanup (Separate WO needed)
- [ ] Remove banned font imports (`DM Serif Display`, `Playfair Display`, `Inter`) from `index.css`
- [ ] Audit "Warm Cocoa" token block in `index.css` — confirm WO or remove
- [ ] Requires new WO in `build_tracker.md`

### Phase C — Safe Additive Staging (Can proceed now)
- [ ] Add `--scl-*` token block to `index.css` with fonts corrected to locked stack
- [ ] Remap color tokens to Pearl Mineral V2 values (see §3 above)
- [ ] Add utility classes (`.scl-container`, `.u-*`) to a new `src/styles/scl-utils.css`
- [ ] Add component classes (`.scl-btn`, `.scl-card`, etc.) to `src/styles/scl-components.css`
- [ ] Import both via `index.css` — do NOT replace existing CSS
- [ ] Reconcile `--scl-nav-h` vs `--header-height` (72px vs 76px)

### Phase D — Validation
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `npm run build` — no build errors
- [ ] No `font-serif` on public pages
- [ ] `graphite` = `#141418` on all public text
- [ ] Background = `#F6F3EF` on all public pages
- [ ] No `pro-*` tokens in `src/pages/public/`

---

## 7. DOC GATE STATUS

| Check | Result |
|---|---|
| FAIL 1 (external doc authority) | PASS |
| FAIL 2 (new WO doc invented) | PASS — this is an analysis report, not a WO |
| FAIL 3 (contradiction with command docs — typography) | **BLOCK** — candidate violates §4 (serif/font lock) |
| FAIL 3 (contradiction — colors) | PARTIAL — drift found, remapping required |
| FAIL 4 (fake-live) | N/A |
| FAIL 5 (omitted routes) | N/A |
| FAIL 6 (ecommerce elevated) | PASS |
| FAIL 7 (outreach) | PASS |

**Overall:** BLOCKED on Phase A (typography). Phase C safe to proceed.

---

*Design Parity Agent — Analysis complete. Awaiting owner decision on typography before any public-surface adoption.*
