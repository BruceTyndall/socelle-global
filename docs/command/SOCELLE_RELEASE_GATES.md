> Updated to align with V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md on 2026-03-08.
> If this file conflicts with V1, the V1 file wins.

# SOCELLE RELEASE GATES
**Version:** 1.2
**Effective:** March 8, 2026
**Authority:** SOCELLE Command Center — Q1 QA & Governance Enforcer
**Scope:** All code changes, all platforms (React+Vite web, Tauri desktop, Flutter mobile), all 15 hubs

---

## 1. PRE-MERGE CHECKLIST

Every pull request must pass **all items** before merge. No exceptions. No "we'll fix it later."

### Build & Type Safety

- [ ] `npx tsc --noEmit` — zero TypeScript errors (web)
- [ ] `dart analyze` — zero errors, zero warnings (mobile)
- [ ] `npm run build` — production build succeeds without errors (web)
- [ ] `flutter build apk --debug` — debug build succeeds (mobile)
- [ ] No `// @ts-ignore` or `// @ts-expect-error` introduced without documented justification
- [ ] No `any` type introduced without documented justification

### Design System Compliance

- [ ] All colors reference design tokens (no hardcoded hex in JSX/TSX/Dart)
- [ ] `graphite` token = `#141418` (not `#1E252B` or any other value)
- [ ] `mn.bg` / `--bg` = `#F6F3EF` (not `#F6F4F1`)
- [ ] No `font-serif` class on any public page component
- [ ] No `pro-*` color tokens on public pages
- [ ] General Sans loading from Fontshare CDN (not removed from `index.html`)
- [ ] Glass system values match canonical spec (blur/saturate/brightness/shadows)
- [ ] All interactive elements have `min-height: 44px` touch target

### Copy & Voice

- [ ] No banned SaaS phrases introduced (see Canonical Doctrine §9)
- [ ] No hedging language ("we believe," "we aim to," "we hope")
- [ ] Hero headlines ≤ 8 words
- [ ] Subheadlines ≤ 20 words
- [ ] Body paragraphs ≤ 50 words
- [ ] CTAs use approved intelligence-framed language

### Live Data Integrity

- [ ] All "live" claims are DB-connected or labeled PREVIEW/DEMO
- [ ] No hardcoded "Updated X ago" timestamps (must derive from `updated_at`)
- [ ] No fake signal counts or inflated metrics
- [ ] Preview/fallback data is obviously example content
- [ ] Confidence tiers are derived from scoring algorithm, not arbitrary

### Code Quality

- [ ] No `console.log()` statements in production code
- [ ] No unused imports
- [ ] No debug code or commented-out blocks
- [ ] No TODO comments without linked issue (format: `// TODO(SOCELLE-123): description`)
- [ ] New files placed in correct directory (`/ui` for primitives, `/components` for features)
- [ ] Component props have TypeScript/Dart type definitions

### Routing & Navigation

- [ ] All new pages have routes in `App.tsx` (web) or router config (mobile)
- [ ] No orphaned components (files without routes)
- [ ] MainNav links correspond to real, functional routes
- [ ] Auth-aware portal links work correctly for each role
- [ ] Deep links / URL sharing works for all new routes

### Database & Backend

- [ ] No existing Supabase migrations modified (ADD ONLY)
- [ ] New migrations include clear comments explaining schema changes
- [ ] RLS policies enabled on all new tables
- [ ] Edge functions include error handling and timeout guards
- [ ] Database types regenerated if schema changed (`database.types.ts`)

### Protected Zones (No Touch Without Explicit WO Scope)

- [ ] Business Portal (`/portal/*`) routes untouched (unless scope says otherwise)
- [ ] Brand Portal (`/brand/*`) routes untouched (unless scope says otherwise)
- [ ] Admin Portal (`/admin/*`) routes untouched (unless scope says otherwise)
- [ ] Auth system (`ProtectedRoute`, `AuthProvider`) untouched
- [ ] Commerce flow (cart, orders, checkout) untouched

---

## 2. PRE-DEPLOY CHECKLIST

After merge, before production deployment:

### Performance

- [ ] Lighthouse Performance score ≥ 85 (desktop)
- [ ] Lighthouse Performance score ≥ 70 (mobile)
- [ ] Largest Contentful Paint < 2.5s
- [ ] First Input Delay < 100ms
- [ ] Cumulative Layout Shift < 0.1
- [ ] Total page weight < 2MB (excluding video)
- [ ] Hero video < 2MB, ambient video < 1MB
- [ ] Images served as AVIF/WebP with appropriate srcset

### SEO

- [ ] Every public page has `<title>` tag (unique, ≤ 60 chars)
- [ ] Every public page has `<meta name="description">` (120–155 chars)
- [ ] Every public page has canonical URL
- [ ] OG tags present (title, description, image)
- [ ] Sitemap.xml updated with all public routes
- [ ] `robots.txt` allows crawling of public routes
- [ ] No duplicate title tags across pages
- [ ] H1 present on every page (one per page)

### Accessibility

- [ ] All images have `alt` text
- [ ] Form inputs have associated labels
- [ ] Color contrast ratio ≥ 4.5:1 for body text
- [ ] Color contrast ratio ≥ 3:1 for large text
- [ ] Focus indicators visible on all interactive elements
- [ ] `@media (prefers-reduced-motion: reduce)` respects user preference
- [ ] Keyboard navigation works for all interactive flows

### Cross-Browser & Device

- [ ] Chrome (latest) — functional + visual
- [ ] Safari (latest, macOS + iOS) — functional + visual (glass rendering critical)
- [ ] Firefox (latest) — functional
- [ ] Edge (latest) — functional
- [ ] iOS Safari (latest 2 versions) — mobile touch + glass
- [ ] Android Chrome (latest 2 versions) — mobile touch

### Smoke Tests

- [ ] Homepage loads in < 3s on 3G throttle
- [ ] Navigation works (all public links)
- [ ] Auth flow works (sign up → verify → login → dashboard)
- [ ] RequestAccess form submits successfully to Supabase
- [ ] Intelligence Hub shows data or preview label (never empty blank)
- [ ] Job listings render with filters functional
- [ ] Brand directory renders with search functional
- [ ] Events calendar renders with category filters

---

## 3. SCHEMA VALIDATION CHECKLIST

### JobPosting Schema (Google for Jobs)

```json
{
  "@context": "https://schema.org",
  "@type": "JobPosting"
}
```

| Field | Required | Status Check |
|---|---|---|
| `title` | ✅ | Non-empty, specific role title |
| `description` | ✅ | ≥ 100 characters, no HTML injection |
| `datePosted` | ✅ | ISO 8601 format |
| `validThrough` | Recommended | ISO 8601, in the future |
| `hiringOrganization.name` | ✅ | Real company name |
| `hiringOrganization.sameAs` | Recommended | Company URL |
| `jobLocation` | ✅ | `addressLocality` + `addressRegion` + `addressCountry` |
| `employmentType` | Recommended | FULL_TIME, PART_TIME, CONTRACT, etc. |
| `baseSalary` | Recommended | `value`, `unitText`, `currency` |
| `identifier` | Recommended | Unique job ID |

**Validation:** Run [Google Rich Results Test](https://search.google.com/test/rich-results) on every job detail page.

### Event Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Event"
}
```

| Field | Required | Status Check |
|---|---|---|
| `name` | ✅ | Event title |
| `startDate` | ✅ | ISO 8601 |
| `endDate` | Recommended | ISO 8601 |
| `location` | ✅ | `Place` with `name` + `address`, or `VirtualLocation` |
| `description` | ✅ | ≥ 50 characters |
| `organizer` | Recommended | `Organization` or `Person` |
| `image` | Recommended | URL to event image |
| `offers` | Recommended | Ticket info if applicable |
| `eventStatus` | Required if changed | `EventScheduled`, `EventCancelled`, etc. |
| `eventAttendanceMode` | Recommended | `OfflineEventAttendanceMode`, `OnlineEventAttendanceMode`, `MixedEventAttendanceMode` |

### FAQPage Schema

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage"
}
```

| Field | Required | Status Check |
|---|---|---|
| `mainEntity[].@type` | ✅ | `Question` |
| `mainEntity[].name` | ✅ | The question text |
| `mainEntity[].acceptedAnswer.@type` | ✅ | `Answer` |
| `mainEntity[].acceptedAnswer.text` | ✅ | The answer text (no HTML) |

### Organization Schema (Homepage)

| Field | Required | Status Check |
|---|---|---|
| `name` | ✅ | "SOCELLE" |
| `url` | ✅ | Canonical URL |
| `logo` | ✅ | Logo URL |
| `sameAs` | Recommended | Social profiles array |
| `description` | Recommended | Company description |
| `contactPoint` | Recommended | Support contact |

### Schema Validation Protocol

1. After every deploy, run Google Rich Results Test on:
   - `/` (Organization)
   - `/faq` (FAQPage)
   - `/jobs/:slug` (JobPosting) — test 3 random listings
   - `/events/:slug` (Event) — test 3 random events
   - `/brands` (CollectionPage)
2. All schemas must return "Valid" with zero errors.
3. Warnings are acceptable but should be addressed within 1 sprint.

---

## 4. "NO FAKE LIVE" VALIDATION

### Automated Check Script

```bash
#!/bin/bash
# Run as part of CI/CD pipeline

echo "=== No Fake Live Data Validation ==="

# Check for hardcoded "Updated X ago" strings
echo "Checking for hardcoded freshness claims..."
HARDCODED=$(grep -rn "Updated .* ago" src/pages/ --include="*.tsx" --include="*.ts" \
  | grep -v "formatFreshness\|formatRelativeTime\|updated_at\|updatedAt")
if [ -n "$HARDCODED" ]; then
  echo "❌ FAIL: Hardcoded freshness claims found:"
  echo "$HARDCODED"
  exit 1
fi

# Check for hardcoded signal counts
echo "Checking for hardcoded signal counts..."
FAKE_COUNTS=$(grep -rn "130+ sources\|500+ brands\|12,500 professionals" src/pages/ \
  --include="*.tsx" --include="*.ts" | grep -v "DEMO\|preview\|fallback")
if [ -n "$FAKE_COUNTS" ]; then
  echo "❌ FAIL: Hardcoded metric claims found:"
  echo "$FAKE_COUNTS"
  exit 1
fi

# Check for "every 5 minutes" claims without cron
echo "Checking for update frequency claims..."
FREQ_CLAIMS=$(grep -rn "every .* minutes\|real.time\|live feed" src/pages/ \
  --include="*.tsx" --include="*.ts" | grep -vi "preview\|demo\|will\|at launch")
if [ -n "$FREQ_CLAIMS" ]; then
  echo "⚠️ WARNING: Update frequency claims found — verify backend exists:"
  echo "$FREQ_CLAIMS"
fi

echo "✅ No fake live data violations detected"
```

### Manual Audit (Weekly)

- [ ] Visit every page that displays data
- [ ] Verify every "Updated X ago" timestamp changes on refresh
- [ ] Verify signal counts match database `COUNT(*)`
- [ ] Verify confidence tiers render correctly
- [ ] Verify empty states show "Preview Mode" not blank grids
- [ ] Verify error states show "Data temporarily unavailable" not silent failure

---

## 5. PERFORMANCE BUDGETS

### Page Load Budgets

| Page | Max Total Size | Max JS Bundle | Max LCP | Max FID | Max CLS |
|---|---|---|---|---|---|
| Homepage | 2.5MB | 350KB (gzipped) | 2.5s | 100ms | 0.1 |
| Intelligence Hub | 2.0MB | 400KB (gzipped) | 2.5s | 100ms | 0.1 |
| Jobs Index | 1.5MB | 300KB (gzipped) | 2.0s | 100ms | 0.05 |
| Job Detail | 1.0MB | 250KB (gzipped) | 1.5s | 100ms | 0.05 |
| Brands Directory | 2.0MB | 300KB (gzipped) | 2.5s | 100ms | 0.1 |
| Events Calendar | 1.5MB | 300KB (gzipped) | 2.0s | 100ms | 0.05 |
| Studio Workspace | 3.0MB | 500KB (gzipped) | 3.0s | 150ms | 0.1 |

### Asset Budgets

| Asset Type | Max Size | Format |
|---|---|---|
| Hero video | 2MB | MP4 (H.264) |
| Ambient video | 1MB | MP4 (H.264) |
| Hero image | 200KB | AVIF |
| Card image | 80KB | AVIF/WebP |
| Thumbnail | 30KB | AVIF/WebP |
| Icon | 2KB | Inline SVG |
| Font file | 100KB per weight | WOFF2 |

### Bundle Monitoring

```bash
# Add to CI/CD
npx vite-bundle-analyzer
# Or
npx source-map-explorer dist/assets/*.js
```

Alert if any single chunk exceeds 150KB gzipped.

---

## 6. BROKEN LINKS CHECK

### Automated Check

```bash
# Run weekly via CI/CD
npx broken-link-checker https://socelle.com \
  --recursive \
  --exclude-external \
  --filter-level 3 \
  --verbose
```

### Link Categories to Check

| Category | Check Frequency | Tools |
|---|---|---|
| Internal navigation links | Every deploy | Playwright E2E |
| Footer links | Every deploy | Playwright E2E |
| Sitemap URLs | Weekly | `npx sitemap-check` |
| External links (social, docs) | Monthly | Broken link checker |
| Deep links / shared URLs | Every deploy | Smoke test |
| API documentation links | Monthly | Manual |

### E2E Link Validation

```typescript
// playwright test
test('all nav links resolve', async ({ page }) => {
  await page.goto('/');
  const links = await page.$$eval('nav a[href]', els => 
    els.map(el => el.getAttribute('href'))
  );
  for (const link of links) {
    if (link.startsWith('/')) {
      const response = await page.goto(link);
      expect(response?.status()).toBeLessThan(400);
    }
  }
});
```

---

## 7. ROLLBACK PROTOCOL

### Decision Matrix

| Severity | Indicator | Action | Timeline |
|---|---|---|---|
| **P0 Critical** | Auth broken, data loss, payment failure, security breach | Immediate rollback | < 5 minutes |
| **P0 Visual** | Design system completely wrong, all pages broken | Immediate rollback | < 5 minutes |
| **P1 Functional** | Feature broken but workaround exists | Hotfix PR | < 1 hour |
| **P1 Data** | Fake live data on production | Hotfix PR | < 1 hour |
| **P2 Cosmetic** | Minor visual regression, copy error | Next deploy | < 24 hours |

### Rollback Procedure

```bash
# 1. Identify the bad deploy
git log --oneline -10

# 2. Revert to last known good
git revert HEAD          # If single commit
git revert HEAD~N..HEAD  # If multiple commits

# 3. Push revert
git push origin main

# 4. Trigger deploy (Cloudflare Pages auto-deploys on push)
# Or manual: Cloudflare Dashboard → Pages → Deployments → Rollback to last good

# 5. Verify rollback
curl -s -o /dev/null -w "%{http_code}" https://socelle.com  # Should be 200
```

### Post-Rollback Checklist

- [ ] Verify site is accessible (200 response)
- [ ] Verify homepage renders correctly
- [ ] Verify auth flow works
- [ ] Verify no data was lost (check Supabase)
- [ ] Notify team of rollback reason
- [ ] Create incident report within 24 hours
- [ ] Root cause analysis within 48 hours
- [ ] Prevention measures documented in this file

### Rollback-Safe Practices

| Practice | Why |
|---|---|
| Database migrations are additive only | Rollback doesn't need to undo schema changes |
| Feature flags for major features | Can disable feature without rollback |
| Blue-green deploys when possible | Instant switch to previous version |
| Separate data deploys from code deploys | Data changes don't break on code rollback |
| Never delete columns in the same PR as removing code | Code can roll back and still find the column |

---

## 8. CONTINUOUS MONITORING

### Health Checks (Automated)

| Check | Frequency | Tool | Alert Threshold |
|---|---|---|---|
| Site uptime | Every 1 min | UptimeRobot / Better Uptime | < 99.9% monthly |
| Response time | Every 5 min | Synthetic monitoring | > 3s average |
| Build status | Every push | GitHub Actions | Any failure |
| TypeScript types | Every push | `tsc --noEmit` in CI | Any error |
| Bundle size | Every push | Size limit check | > 10% increase |
| Lighthouse score | Weekly | Lighthouse CI | Score drop > 5 points |
| Schema validation | Weekly | Google Rich Results Test | Any error |
| Broken links | Weekly | Link checker | Any 404 |

---

## 9. DOC GATE (QA ENFORCEMENT)

Per `/.claude/CLAUDE.md` §2, every agent output must pass the Doc Gate.

### FAIL Conditions

| # | Condition | Example |
|---|---|---|
| FAIL 1 | Output treats a doc outside `/docs/command/` as authoritative | "Per `GOVERNANCE.md`..." |
| FAIL 2 | New "work order" or "master plan" doc created outside `/docs/command/` | Creating `PHASE_3_WORK_ORDER.md` |
| FAIL 3 | Contradiction with `/docs/command/` doctrine, entitlements, provenance, or design locks | Using `#1E252B` for primary text |
| FAIL 4 | Fake "live" claims not tied to real endpoints or labeled DEMO/PREVIEW | Hardcoded `"Updated 3 min ago"` |
| FAIL 5 | Audit/spec omits routes or screens discovered in repo inventory | Spec covers 20 of 26 routes |

### PASS Requirements

| Requirement | Standard |
|---|---|
| **Cite file paths** | Every recommendation maps to a specific file path, route, endpoint, table, or component. |
| **Provide diffs/patch lists** | Any proposed change includes a diff or patch list. |
| **Mark DEMO vs LIVE** | Every data surface explicitly labeled. No ambiguity. |
| **Reference command docs** | Cite specific command doc + section for governance rules applied. |
| **Complete coverage** | No page, route, screen, or surface omitted. |

---

## 10. SEO ENFORCEMENT (Absorbed from legacy SEO_GUIDELINES.md — 2026-03-06)

### Technical Foundations

- [ ] The web app is a **React + Vite SPA** (per V1 §E). Next.js is NOT the primary runtime. For SEO on public pages, use pre-rendering (e.g., `vite-plugin-ssr`, `@vitejs/plugin-react` with SSG, or a dedicated sitemap/meta-tag strategy). Client-rendered pages must still have proper `<title>`, `<meta>`, and OG tags injected at build time or via a pre-rendering step.
- [ ] Every indexable page requires a `<link rel="canonical">` pointing to its exact URL.
- [ ] `sitemap.xml` must be updated with every new template. `lastModified` must use real DB `updated_at` timestamps.
- [ ] `robots.txt` must block `/portal/`, `/admin/`, `/api/`.

### Structured Data — Required per Page Type

| Page type | Required schema |
|---|---|
| `/jobs/[slug]` | `JobPosting` |
| `/events/[slug]` | `Event` |
| `/brands/[slug]` | `Product` or `Organization` |
| Any FAQ section | `FAQPage` |
| All detail pages | `BreadcrumbList` |
| Site-wide | `Organization` + `WebSite` + `SearchAction` |

**Rules:**
- Schema must use **real data from DB**, never hardcoded placeholders.
- `datePosted` and `validThrough` are required on `JobPosting`.
- `startDate` and `location` are required on `Event`.

**Note:** Detailed field-level schema validation for JobPosting, Event, FAQPage, and Organization is in §3 above. This table adds the page-type → schema mapping and BreadcrumbList/WebSite+SearchAction requirements.

### Programmatic SEO — Content Thresholds

Pages are only indexable if they meet **minimum content thresholds**:

| Template | Minimum required |
|---|---|
| `/brands/[slug]` | Name + description + at least 1 signal or product |
| `/jobs/[slug]` | Title + company + location + description + posted date |
| `/events/[slug]` | Name + date + location + description |
| `/intelligence/[cat]` | At least 3 signals in the category |

**If below threshold → add `noindex` meta tag. Do not publish empty shells.**

```tsx
// Pattern for conditional noindex (React+Vite with react-helmet-async or similar):
function PageHead({ data }: { data: PageData | null }) {
  if (!data || data.signalCount < 3) {
    return <Helmet><meta name="robots" content="noindex" /></Helmet>;
  }
  return (
    <Helmet>
      <title>{data.title} | SOCELLE</title>
      <meta name="description" content={data.description} />
    </Helmet>
  );
}
```

### Internal Linking (Hub-and-Spoke)

Every detail page must link out to related hubs using **descriptive anchor text** (never "learn more").

| Detail page | Must link to |
|---|---|
| Brand profile | Category intel page, related treatments, relevant events |
| Job listing | Role hub, city hub, vertical hub, employer brand page |
| Event | Vertical hub, related education, relevant brands |
| Treatment page | Brands commonly used, education items, market data |

### E-E-A-T Compliance (Health-Adjacent Content)

- [ ] Add an **"About our methodology"** block to any benchmark or intelligence page.
- [ ] Add **"Not medical advice"** disclaimer to any protocol or clinical content.
- [ ] Create an `/editorial-policy` page documenting signal sources and computation methodology.
- [ ] All news/event sources must be visibly attributed.

### Image SEO

- [ ] Every `<Image>` must have descriptive `alt` text (never empty, never "image").
- [ ] Every `<Image>` must have explicit `width` and `height`.
- [ ] Below-fold images must use `loading="lazy"`.
- [ ] Image file names must be descriptive (`microneedling-protocol-cover.jpg`, not `img-012.jpg`).

**Note:** Alt text presence is also checked in §2 Accessibility. This section adds SEO-specific requirements (descriptive alt, file naming, explicit dimensions).

### International SEO (Phased)

- [ ] Add `hreflang` tags for `en-US`, `en-GB`, `en-IE`, `en-AU` when country hubs launch.
- [ ] Country-specific pages must have unique intros — no duplicate content across regions.

### Data Quality Controls

- [ ] Never publish a page with an empty state as indexable.
- [ ] Remove expired jobs within 24h of expiry (`validThrough` enforcement).
- [ ] Deduplicate brand profiles and job listings before indexing.

**Note:** "No invented statistics" is already enforced by §4 "No Fake Live" validation and Canonical Doctrine §6. Not duplicated here.

**Discarded:** SEO_GUIDELINES.md §5 (Freshness) — duplicates RELEASE_GATES §4 + CANONICAL_DOCTRINE §6 "No Fake Live Data" rule. Discarded due to conflict/overlap with `docs/command/SOCELLE_RELEASE_GATES.md §4` and `docs/command/SOCELLE_CANONICAL_DOCTRINE.md §6`.

**Discarded:** SEO_GUIDELINES.md §9 (Data Quality Controls) partial — "No invented statistics" already covered by `docs/command/SOCELLE_CANONICAL_DOCTRINE.md §6`. Only net-new rules (empty state noindex, expired job removal, deduplication) absorbed above.

### Search Console & Tracking Setup

- [ ] Google Search Console verified for `socelle.com`.
- [ ] Bing Webmaster Tools verified.
- [ ] Track impressions by template type, rich result errors, query → landing page mapping.

---

## 11. V1 LAUNCH NON-NEGOTIABLES (from V1 §J)

These gates must ALL pass before the first paying subscriber. They supplement the checks above:

- [ ] `/` routes to Intelligence home (not prelaunch quiz or a shell)
- [ ] Sentry active (web + edge)
- [ ] TanStack Query used for all data fetching (no raw `useEffect` + fetch for server data)
- [ ] PAYMENT_BYPASS = false in production
- [ ] Stripe webhooks work (subscription state changes in DB)
- [ ] Signals fresh: `market_signals` has >= 5 rows with `fetched_at` < 24h
- [ ] AI briefs: 10 test briefs with 0 hallucinations and correct citations
- [ ] `database.types.ts` matches migrations
- [ ] Credits deduct correctly on every AI action
- [ ] Affiliate links show proper FTC badges and tracked redirects
- [ ] Playwright smoke tests (routes + auth + paywall) pass

### Anti-Shell Gate

No hub may ship if it fails the V1 anti-shell checklist (V1 §D): Create, Library, Detail, Edit+Delete, Permissions, Intelligence input, Proof/metrics, Export, Error/empty/loading, Observability.

---

*SOCELLE RELEASE GATES v1.2 — March 8, 2026 — Command Center Authority*
*§10 absorbed from legacy SEO_GUIDELINES.md — see docs/archive/DEPRECATED__2026-03-06__SEO_GUIDELINES.md*
*§11 added from V1 §J launch non-negotiables*
*Aligned to V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md*
