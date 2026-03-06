> **DEPRECATED — 2026-03-06**
> This file is no longer authoritative. Replaced by:
> - `docs/command/SOCELLE_RELEASE_GATES.md` (pre-merge + pre-deploy checklists)
>
> Do not reference this file as authority. See `/.claude/CLAUDE.md` §B FAIL 1.

---

# SOCELLE NO-REGRESSION ENFORCEMENT CHECKLIST
**Authority:** Agent 9 — Regression & Governance Agent  
**Effective:** March 5, 2026  
**Scope:** Every agent must complete all items before marking work complete

---

## PRE-DEPLOYMENT VERIFICATION CHECKLIST (15 Required Items)

Use this checklist for EVERY pull request. If all 15 items are not checked, the PR is not ready to merge.

### 1. TypeScript Build Success
- [ ] Run `npx tsc --noEmit` in repo root
- [ ] Expected result: Zero errors, zero warnings
- [ ] If fails: Fix all TypeScript errors before proceeding
- [ ] Evidence: Paste terminal output in PR comment

**Why it matters:** Broken builds break CI/CD. Catches type safety violations early.

---

### 2. Color Token Compliance (Design System Lock)
- [ ] All NEW components use mineral tokens (not `pro-*` prefixed)
- [ ] Public pages NEVER import or use Button component with `pro-*` colors
- [ ] Check for hardcoded color values (e.g., `#3E4C5E`, `#2D3748`, `#181614`) — these are BANNED
- [ ] Verify no new instances of old color names (warm gray, charcoal, old black)
- [ ] If adding new colors: add them as new tokens in tailwind.config.js, don't replace existing ones

**How to verify:**
```bash
# Search for banned colors
grep -r "#3E4C5E\|#2D3748\|#181614\|pro-navy\|pro-gold" src/pages/public src/components/ui

# Should return zero results
# If it finds anything in public pages, fix it
```

**Why it matters:** Color consistency is critical for premium brand perception. Mineral system is locked.

---

### 3. Primary Text Color — Lock Verification
- [ ] Confirm no NEW uses of `#1E252B` (WRONG) text color
- [ ] Verify primary text color is `#141418` (LOCKED SPEC)
- [ ] Check tailwind.config.js graphite token = `#141418`
- [ ] Check src/index.css custom properties use correct graphite hex
- [ ] No hardcoded `rgba(30,37,43,...)` color codes (should be `rgba(20,20,24,...)`)

**How to verify:**
```bash
# Search for wrong hex
grep -r "1E252B\|30,37,43" src/ tailwind.config.js src/index.css

# Should return zero results
```

**Why it matters:** This is the most critical color regression. Affects 400+ instances.

---

### 4. No New SaaS Clichés or Banned Phrases
- [ ] Copy does NOT contain: "unlock growth", "leverage", "seamless", "empower", "synergy", "all-in-one"
- [ ] Copy does NOT contain: "powerful platform", "next-generation", "cutting-edge", "disruptive"
- [ ] Copy does NOT contain: "robust", "state-of-the-art", "game-changer", "revolutionary", "end-to-end"
- [ ] Copy does NOT contain: "streamline", "optimize", "scalable solutions"
- [ ] Instead uses: operator-native vocabulary (treatment room, reseller, market intelligence, signals, etc.)

**How to verify:**
```bash
# Search for banned phrases in NEW pages only
grep -r "unlock growth\|leverage\|seamless\|empower\|synergy" src/pages/public src/components
```

**Why it matters:** SaaS clichés undermine the intelligence-first thesis. Platform must sound professional, not generic.

---

### 5. Font Classes Used Correctly
- [ ] `font-serif` used ONLY on h1, h2, h3 tags or heading-like divs
- [ ] `font-serif` NEVER used on body copy, paragraphs, or body text
- [ ] No new `font-display` classes (doesn't exist; use `font-serif`)
- [ ] Body copy uses default font (Inter fallback) or explicitly `font-sans`

**How to verify:**
```bash
# Find all font-serif uses
grep -rn "font-serif" src/pages/public src/components | head -10

# Manually verify each is on a heading tag, not body copy
```

**Example violations:**
```tsx
// ❌ WRONG
<p className="font-serif">This is body copy</p>

// ✅ CORRECT
<h1 className="font-serif">This is a heading</h1>
```

**Why it matters:** DM Serif Display is expensive to render. Should only be used for headlines.

---

### 6. Glass System Integrity
- [ ] Nav glass pill blur: 6px (default) → 14px (scrolled) ✅
- [ ] Nav glass pill opacity: 55% (default) → 80% (scrolled) ✅
- [ ] Nav glass pill border: white/30% (default) → white/45% (scrolled) ✅
- [ ] No changes to `.glass-surface` blur values (should be 12px)
- [ ] No changes to `.glass-surface-strong` blur values (should be 14px)
- [ ] No changes to `.glass-dark` blur values (should be 12px)
- [ ] Transition timing remains smooth (cubic-bezier values unchanged)

**How to verify:**
```bash
# Check glass system in index.css
grep -A 5 "glass-nav-child\|glass-surface\|glass-dark" src/index.css

# Verify blur values: should see only 6px, 12px, or 14px
# Verify opacity: should see 0.55, 0.60, 0.80 (not other values)
```

**Why it matters:** Glass system is optimized for Apple Silicon + Safari. Changing blur/opacity breaks visual polish.

---

### 7. Live Data Disclaimer on New Intelligence Pages
- [ ] Any new page claiming "live", "real-time", or "updated X minutes ago" has a disclaimer
- [ ] Disclaimer displays when Supabase is unconfigured
- [ ] Disclaimer uses template:
  ```tsx
  {!isSupabaseConfigured && (
    <div className="p-4 bg-amber-50 border border-amber-300 rounded">
      Preview Mode: Live intelligence data will display here after launch.
    </div>
  )}
  ```
- [ ] No fake timestamps (e.g., "Updated 3 minutes ago") without disclaimer

**How to verify:**
```bash
# Search for "Updated" or "live" claims
grep -rn "Updated.*ago\|live.*data\|real-time" src/pages/public

# For each match, verify there's an isSupabaseConfigured check nearby
```

**Why it matters:** Users need to know if data is real or preview. Prevents frustration from zero data display.

---

### 8. No Hardcoded Placeholder Copy
- [ ] No "TODO:", "FIXME:", or "XXX:" comments in production code
- [ ] No mock data labeled as real (e.g., "Updated 3 min ago" when it's fake)
- [ ] No placeholder text like "Lorem ipsum", "sample data", "mock content" on public pages
- [ ] Admin/portal pages may have placeholders if clearly labeled as [PREVIEW] or [MOCK]

**How to verify:**
```bash
# Search for TODO markers
grep -r "TODO\|FIXME\|XXX" src/pages/public src/components/ui

# Search for lorem ipsum
grep -ri "lorem\|ipsum" src/pages/public

# Should return zero results for public pages
```

**Why it matters:** Placeholder copy undermines professionalism. Users need real, finished content.

---

### 9. Route Mapping Verified
- [ ] All new pages have corresponding routes in `src/App.tsx`
- [ ] No orphaned page files (pages that exist but aren't routed)
- [ ] No 404 routes (routes that exist but pages don't)
- [ ] All routes use correct component imports
- [ ] Route paths match component file locations

**How to verify:**
```bash
# List all pages created
ls -la src/pages/public/*.tsx | awk '{print $NF}'

# Check that each is imported and routed in App.tsx
grep "import.*from.*src/pages" src/App.tsx
```

**Why it matters:** Orphaned routes cause broken navigation and 404 errors. Confuses users and reduces engagement.

---

### 10. Navigation Consistency
- [ ] All navigation links in `MainNav.tsx` point to real routes
- [ ] No broken links in footer navigation
- [ ] No routes in App.tsx that aren't mentioned in any navigation
- [ ] MainNav clearly distinguishes between public, portal, brand, and admin sections
- [ ] No duplicate navigation items

**How to verify:**
```bash
# Extract all links from MainNav
grep -o 'href="[^"]*"\|to="[^"]*"' src/components/MainNav.tsx

# Verify each route exists in App.tsx
```

**Why it matters:** Broken nav kills user trust. Navigation must be clear and functional.

---

### 11. Supabase Migration Documented
- [ ] Any new database schema changes include a migration file
- [ ] Migration file has clear comments explaining the change
- [ ] Migration follows naming convention: `YYYYMMDDHHMMSS_description.sql`
- [ ] Migration is in `supabase/migrations/` directory
- [ ] Migration includes both up and down logic (if applicable)
- [ ] No modifications to existing migrations (add only)

**How to verify:**
```bash
# List all migrations
ls -la supabase/migrations/ | tail -5

# Check new migration has clear comments
head -20 supabase/migrations/[LATEST].sql
```

**Why it matters:** Migrations are source of truth for schema. Production data depends on immutability.

---

### 12. Component Scope Clear
- [ ] UI primitives (Button, Card, Badge, etc.) live in `src/components/ui/`
- [ ] Feature-specific components live in `src/components/`
- [ ] Page-specific components live in their respective page directories
- [ ] No orphaned components (components that exist but aren't imported anywhere)
- [ ] Component names are clear and descriptive

**How to verify:**
```bash
# Find components not imported
grep -l "^export" src/components/*.tsx | while read f; do
  component=$(basename "$f" .tsx)
  grep -q "import.*$component" src/pages src/components || echo "Orphaned: $component"
done
```

**Why it matters:** Clear component organization prevents duplicate code and makes maintenance easier.

---

### 13. Meta Tags Present and Complete
- [ ] All pages have `<Helmet>` wrapper
- [ ] All pages have `<title>` tag (max 60 characters, includes primary keyword)
- [ ] All pages have `<meta name="description">` (max 160 characters)
- [ ] All pages have `<link rel="canonical">` pointing to self
- [ ] Public pages have og:* tags (og:title, og:description, og:image)
- [ ] No duplicate meta tags or conflicting values

**How to verify:**
```bash
# Check a page has Helmet
grep -n "Helmet\|<title>\|<meta.*description" src/pages/public/[YourNewPage].tsx

# Should see 3+ Helmet-wrapped tags
```

**Meta Tag Template:**
```tsx
<Helmet>
  <title>Page Title — SOCELLE</title>
  <meta name="description" content="Clear description under 160 chars" />
  <link rel="canonical" href="https://socelle.com/page-path" />
  <meta property="og:title" content="Page Title" />
  <meta property="og:description" content="Clear description" />
  <meta property="og:image" content="https://..." />
</Helmet>
```

**Why it matters:** Meta tags are critical for SEO. Missing tags = lower search rankings.

---

### 14. Import Cleanup
- [ ] No unused imports
- [ ] No `console.log()` statements in production code
- [ ] No debug code (e.g., `debugger`, `alert()` calls)
- [ ] No commented-out code blocks (delete instead of commenting)
- [ ] All imports are in proper order (React, third-party, local, types)

**How to verify:**
```bash
# Check for console.log
grep -n "console.log\|debugger\|alert(" src/pages/public/[YourNewPage].tsx

# Should return zero results

# Check for unused imports (use IDE or manual review)
```

**Why it matters:** Clean code is maintainable code. Debug code left behind wastes token budget and confuses future agents.

---

### 15. Design System Extension Only (No Replacement)
- [ ] No color tokens deleted from tailwind.config.js
- [ ] No font definitions removed
- [ ] No shadow or spacing tokens removed
- [ ] New tokens added with clear naming (e.g., `signal-critical` if needed)
- [ ] Old tokens kept even if deprecated (for backward compat)
- [ ] If correction needed, create new token with v2 suffix (e.g., `graphite-v2`)

**How to verify:**
```bash
# Check tailwind.config.js for structure
git diff tailwind.config.js | grep "^-.*:" | head -10

# If you see deletions, verify they're not color/font/spacing tokens
# Only deletions should be in comments or configuration blocks
```

**Why it matters:** Existing code depends on current token values. Removing them breaks production pages.

---

## ADVANCED CHECKS (Optional but Recommended)

These are extra checks that go beyond the 15 required items. Do these if you want to be extra sure.

### A. Accessibility Audit
- [ ] All images have alt text (if applicable)
- [ ] All buttons have visible labels
- [ ] All form inputs have associated labels
- [ ] Color contrast meets WCAG AA standards (4.5:1 for text)
- [ ] No keyboard traps; tab order is logical
- [ ] Screen reader can navigate page (test with NVDA/JAWS if possible)

### B. Mobile Responsive Check
- [ ] Test on mobile viewport (375px width)
- [ ] Glass nav dialog appears correctly on mobile
- [ ] No horizontal scroll on mobile
- [ ] Touch targets are at least 44x44px
- [ ] Text is readable without zooming

### C. Performance Check
- [ ] Page load time < 3 seconds (Lighthouse)
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] No unused CSS
- [ ] No unused JavaScript

### D. Security Check
- [ ] No hardcoded API keys or secrets
- [ ] No sensitive data logged to console
- [ ] All external links use `target="_blank"` with `rel="noopener noreferrer"`
- [ ] No inline JavaScript (all scripts in separate files)
- [ ] CORS headers correct for API calls

---

## FAILURE SCENARIOS

If you fail any of the 15 required checks, here's what to do:

### If TypeScript build fails:
```bash
# Fix TypeScript errors
npx tsc --noEmit

# Address each error until build passes
# Commit: Fix TypeScript errors before proceeding
```

### If color tokens are wrong:
```bash
# Revert color changes to locked values
# Check GOVERNANCE.md for correct hex values
# Re-apply only mineral tokens
```

### If routes are missing:
```bash
# Add missing routes to src/App.tsx
# Verify each route has corresponding page component
# Test navigation in browser
```

### If copy contains SaaS clichés:
```bash
# Rewrite copy using COPY_AUDIT.md as reference
# Replace banned phrases with operator-native vocabulary
# Get copy approved by agent before commit
```

---

## CHECKLIST TEMPLATE FOR PR

Copy this into your PR description:

```markdown
## Pre-Deployment Verification

- [ ] 1. TypeScript build succeeds (`npx tsc --noEmit`)
- [ ] 2. Color tokens use mineral system (no `pro-*` on public pages)
- [ ] 3. Primary text color locked at #141418 (not #1E252B)
- [ ] 4. No SaaS clichés in copy
- [ ] 5. Font classes used correctly (serif on headings only)
- [ ] 6. Glass system blur values correct (6px/14px, not modified)
- [ ] 7. Live data pages have preview disclaimer
- [ ] 8. No placeholder copy or TODO comments
- [ ] 9. All routes mapped in App.tsx
- [ ] 10. Navigation links work (no 404s)
- [ ] 11. Database migrations documented and in place
- [ ] 12. Component scope clear (ui/ vs components/ vs pages/)
- [ ] 13. Meta tags complete on all pages
- [ ] 14. No unused imports, console.log, or debug code
- [ ] 15. Design tokens extended, never replaced

**All 15 items must be checked before merge.**
```

---

## MONTHLY GOVERNANCE REVIEW

The governance agent will review the NO_REGRESSION_CHECKLIST monthly:
- **First Wednesday of each month:** Review all PRs merged in prior month
- **Check:** Are agents following the 15-item checklist?
- **Output:** Updated NO_REGRESSION_CHECKLIST.md with any new rules

---

**Document Version:** 1.0  
**Last Updated:** March 5, 2026  
**Authority:** Agent 9 — Regression & Governance Agent  
**Questions:** Comment on this document or create an issue in the repo

