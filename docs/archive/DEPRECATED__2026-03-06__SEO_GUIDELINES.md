> **DEPRECATED — 2026-03-06**
> This file is no longer authoritative. All valid rules have been absorbed into:
> - `docs/command/SOCELLE_RELEASE_GATES.md` §10 — "SEO ENFORCEMENT"
>
> Discarded sections (conflicts with existing canonical docs):
> - §5 (Freshness) — duplicates RELEASE_GATES §4 + CANONICAL_DOCTRINE §6
> - §9 partial (no invented statistics) — already covered by CANONICAL_DOCTRINE §6
>
> Do not reference this file as authority. See `/.claude/CLAUDE.md` §B FAIL 1.

---

# SEO Enforcement Guidelines — Socelle

> These rules apply to every agent and developer working on the `apps/marketing-site` and any public-facing page. Non-compliance blocks launch.

---

## 1. Technical Foundations

- [ ] All public pages must be **server-rendered (SSR) or statically generated (SSG)** in Next.js. No client-only rendering for indexable content.
- [ ] Every indexable page requires a `<link rel="canonical">` pointing to its exact URL.
- [ ] `sitemap.ts` must be updated with every new template. `lastModified` must use real DB `updated_at` timestamps.
- [ ] `robots.ts` must block `/portal/`, `/admin/`, `/api/`.

---

## 2. Structured Data (JSON-LD) — Required per Page Type

| Page type       | Required schema                          |
|-----------------|------------------------------------------|
| `/jobs/[slug]`  | `JobPosting`                             |
| `/events/[slug]`| `Event`                                  |
| `/brands/[slug]`| `Product` or `Organization`             |
| Any FAQ section | `FAQPage`                                |
| All detail pages| `BreadcrumbList`                         |
| Site-wide       | `Organization` + `WebSite` + `SearchAction` |

**Rules:**
- Schema must use **real data from DB**, never hardcoded placeholders.
- `datePosted` and `validThrough` are required on `JobPosting`.
- `startDate` and `location` are required on `Event`.

---

## 3. Programmatic SEO — Content Requirements

Pages are only indexable if they meet **minimum content thresholds**:

| Template              | Minimum required                                      |
|-----------------------|-------------------------------------------------------|
| `/brands/[slug]`      | Name + description + at least 1 signal or product     |
| `/jobs/[slug]`        | Title + company + location + description + posted date|
| `/events/[slug]`      | Name + date + location + description                  |
| `/intelligence/[cat]` | At least 3 signals in the category                    |

**If below threshold → add `noindex` meta tag. Do not publish empty shells.**

```tsx
// Pattern for conditional noindex:
export async function generateMetadata({ params }) {
  const data = await fetchData(params.slug);
  if (!data || data.signalCount < 3) {
    return { robots: { index: false } };
  }
  // ... normal metadata
}
```

---

## 4. Internal Linking (Hub-and-Spoke)

Every detail page must link out to related hubs using **descriptive anchor text** (never "learn more").

| Detail page     | Must link to                                              |
|-----------------|-----------------------------------------------------------|
| Brand profile   | Category intel page, related treatments, relevant events  |
| Job listing     | Role hub, city hub, vertical hub, employer brand page     |
| Event           | Vertical hub, related education, relevant brands          |
| Treatment page  | Brands commonly used, education items, market data        |

---

## 5. Freshness — Required Everywhere Signals Appear

- Every signal card must display: **"Updated Xm ago"** using a real `updated_at` or `source_verified_at` timestamp.
- Sitemap `<lastmod>` must reflect the real DB `updated_at`, not build time.
- Build a `/weekly-briefing` page (or `/intelligence/weekly`) that links to all updated hubs — this is a crawl accelerator.

---

## 6. E-E-A-T & Compliance (Health-Adjacent Content)

- Add an **"About our methodology"** block to any benchmark or intelligence page.
- Add **"Not medical advice"** disclaimer to any protocol or clinical content.
- Create an `/editorial-policy` page documenting signal sources and computation methodology.
- All news/event sources must be visibly attributed.

---

## 7. Image SEO

Every `<Image>` must have:
- Descriptive `alt` text (never empty, never "image")
- Explicit `width` and `height`
- `loading="lazy"` on below-fold images
- Descriptive file names (`microneedling-protocol-cover.jpg`, not `img-012.jpg`)

---

## 8. International (English-first, phased)

- Add `hreflang` tags for `en-US`, `en-GB`, `en-IE`, `en-AU` when country hubs launch.
- Country-specific pages must have unique intros — no duplicate content across regions.

---

## 9. Data Quality Controls

- Never publish a page with an empty state as indexable.
- Remove expired jobs within 24h of expiry (`validThrough` enforcement).
- Deduplicate brand profiles and job listings before indexing.
- No invented statistics anywhere on the platform.

---

## 10. Tracking

Set up in Week 1:
- Google Search Console (verify `socelle.com`)
- Bing Webmaster Tools
- Track impressions by template type, rich result errors, query → landing page mapping.
