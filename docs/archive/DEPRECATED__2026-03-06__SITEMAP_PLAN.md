> **DEPRECATED — 2026-03-06**
> This file is no longer authoritative. Replaced by:
> - `docs/command/SITE_MAP.md` + `docs/command/GLOBAL_SITE_MAP.md`
>
> Do not reference this file as authority. See `/.claude/CLAUDE.md` §B FAIL 1.

---

# SITEMAP_PLAN.md — Dynamic Sitemap Strategy for SOCELLE

**Current Status:** Static XML sitemap (7 URLs)  
**Target State:** Auto-generated from Supabase data, 25+ core URLs + dynamic brand/protocol URLs  
**Timeline:** P0 (Week 1 = core URLs), P1 (Week 2 = dynamic setup)

---

## Current Sitemap Analysis

**File:** `/sessions/affectionate-hopeful-mccarthy/mnt/SOCELLE-WEB/public/sitemap.xml`

### What's In It (7 URLs)
```xml
/                    priority 1.0
/brands              priority 0.9
/pricing             priority 0.8
/about               priority 0.7
/insights → /intelligence  (redirect, 0.7)
/privacy             priority 0.3
/terms               priority 0.3
```

### What's Missing (Critical)
1. `/intelligence` (primary product page, should be 0.9)
2. `/for-buyers` (conversion funnel, 0.8)
3. `/for-brands` (conversion funnel, 0.8)
4. `/for-medspas` (vertical landing, 0.7)
5. `/for-salons` (vertical landing, 0.7)
6. `/how-it-works` (onboarding, 0.7)
7. `/education` (authority, 0.8)
8. `/protocols` (authority + collection, 0.8)
9. `/request-access` (CTA page, 0.7)
10. `/faq` (support, 0.6)
11. `/api/docs` (developer, 0.7)
12. `/api/pricing` (developer funnel, 0.6)
13. `/brands/[slug]` (100+ brand storefronts, 0.6 each)
14. `/protocols/[slug]` (8+ protocol detail pages, 0.6 each)

---

## Sitemap Priority Scale

**Standard Web Sitemap Priority Values:**

| Priority | Usage | Typical Pages |
|----------|-------|---|
| **1.0** | Homepage only | `/` |
| **0.9** | Core product pages | `/intelligence`, `/brands` |
| **0.8** | High-value content | `/for-buyers`, `/for-brands`, `/education`, `/protocols` |
| **0.7** | Secondary content | `/for-medspas`, `/for-salons`, `/how-it-works`, `/about`, `/request-access` |
| **0.6** | Tertiary + dynamic | `/faq`, Brand storefronts, Protocol details |
| **0.5** | Support/legal | (not needed for Socelle) |
| **0.3** | Legal/footer | `/privacy`, `/terms` |

---

## Phase 1 — Static Core URLs (Week 1)

Replace current `sitemap.xml` with expanded static version:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage: highest priority -->
  <url>
    <loc>https://socelle.com/</loc>
    <lastmod>2026-03-05</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Core Product Pages (0.9) -->
  <url>
    <loc>https://socelle.com/intelligence</loc>
    <lastmod>2026-03-05</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://socelle.com/brands</loc>
    <lastmod>2026-03-05</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Conversion Funnels (0.8) -->
  <url>
    <loc>https://socelle.com/for-buyers</loc>
    <lastmod>2026-03-05</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://socelle.com/for-brands</loc>
    <lastmod>2026-03-05</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://socelle.com/education</loc>
    <lastmod>2026-03-05</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://socelle.com/protocols</loc>
    <lastmod>2026-03-05</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://socelle.com/pricing</loc>
    <lastmod>2026-03-05</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Vertical Landing Pages (0.7) -->
  <url>
    <loc>https://socelle.com/for-medspas</loc>
    <lastmod>2026-03-05</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://socelle.com/for-salons</loc>
    <lastmod>2026-03-05</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://socelle.com/how-it-works</loc>
    <lastmod>2026-03-05</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://socelle.com/about</loc>
    <lastmod>2026-03-05</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://socelle.com/request-access</loc>
    <lastmod>2026-03-05</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Developer Pages (0.7 & 0.6) -->
  <url>
    <loc>https://socelle.com/api/docs</loc>
    <lastmod>2026-03-05</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://socelle.com/api/pricing</loc>
    <lastmod>2026-03-05</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <!-- Support & FAQ (0.6) -->
  <url>
    <loc>https://socelle.com/faq</loc>
    <lastmod>2026-03-05</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <!-- Legal (0.3) -->
  <url>
    <loc>https://socelle.com/privacy</loc>
    <lastmod>2026-03-05</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://socelle.com/terms</loc>
    <lastmod>2026-03-05</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>
```

**Action:**
1. Replace `/public/sitemap.xml` with above content
2. Update `lastmod` dates to current
3. Test in Google Search Console
4. No code changes needed

---

## Phase 2 — Dynamic Brand Sitemaps (Week 2)

When brand data lives in Supabase, auto-generate brand storefront URLs.

### Implementation: Sitemap-Brands.ts (New Service)

**File:** `/src/lib/sitemaps/sitemap-brands.ts`

```typescript
import { supabase } from '../supabase';

export async function generateBrandSitemapXML(): Promise<string> {
  const { data: brands, error } = await supabase
    .from('brands')
    .select('id, slug, updated_at')
    .eq('status', 'active');

  if (error || !brands) {
    console.error('Brands sitemap generation failed:', error);
    return ''; // fallback to empty
  }

  const urlEntries = brands.map(brand => `
  <url>
    <loc>https://socelle.com/brands/${brand.slug}</loc>
    <lastmod>${brand.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}
```

### Implementation: Sitemap-Protocols.ts (New Service)

**File:** `/src/lib/sitemaps/sitemap-protocols.ts`

```typescript
import { supabase } from '../supabase';

export async function generateProtocolSitemapXML(): Promise<string> {
  const { data: protocols, error } = await supabase
    .from('protocols')
    .select('id, slug, updated_at')
    .eq('status', 'active');

  if (error || !protocols) {
    console.error('Protocols sitemap generation failed:', error);
    return '';
  }

  const urlEntries = protocols.map(protocol => `
  <url>
    <loc>https://socelle.com/protocols/${protocol.slug}</loc>
    <lastmod>${protocol.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}
```

### API Routes to Expose Sitemaps

**New Routes in Vite:**
```typescript
// src/api/sitemaps.ts

import { generateBrandSitemapXML } from '../lib/sitemaps/sitemap-brands';
import { generateProtocolSitemapXML } from '../lib/sitemaps/sitemap-protocols';

export default {
  // Endpoint: GET /api/sitemap-brands.xml
  '/api/sitemap-brands.xml': async () => {
    const xml = await generateBrandSitemapXML();
    return new Response(xml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  },

  // Endpoint: GET /api/sitemap-protocols.xml
  '/api/sitemap-protocols.xml': async () => {
    const xml = await generateProtocolSitemapXML();
    return new Response(xml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  },
};
```

Or use Cloudflare Workers / edge functions (recommended for performance).

---

## Phase 3 — Sitemap Index (Week 2)

Create a sitemap index that references all sitemaps.

**File:** `/public/sitemap-index.xml` OR `/api/sitemap-index.xml` (dynamic)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Core static pages -->
  <sitemap>
    <loc>https://socelle.com/sitemap.xml</loc>
    <lastmod>2026-03-05</lastmod>
  </sitemap>

  <!-- Dynamic brand pages -->
  <sitemap>
    <loc>https://socelle.com/api/sitemap-brands.xml</loc>
    <lastmod>2026-03-05</lastmod>
  </sitemap>

  <!-- Dynamic protocol pages -->
  <sitemap>
    <loc>https://socelle.com/api/sitemap-protocols.xml</loc>
    <lastmod>2026-03-05</lastmod>
  </sitemap>
</sitemapindex>
```

**Action:**
1. Update `robots.txt` to point to sitemap-index instead:
   ```
   Sitemap: https://socelle.com/sitemap-index.xml
   ```

2. Test in Google Search Console:
   - Go to Search Console → Sitemaps
   - Submit `https://socelle.com/sitemap-index.xml`
   - Wait 24-48 hours for Google to fetch + process

---

## Phase 4 — Monitoring & Maintenance

### Google Search Console Setup

1. **Verify Ownership:**
   - Add DNS CNAME or HTML tag verification
   - Or use Google Analytics 4 verification

2. **Submit Sitemaps:**
   - https://socelle.com/sitemap-index.xml

3. **Monitor:**
   - Coverage report (indexed vs errors)
   - Click metrics (impressions, CTR)
   - Core Web Vitals
   - Mobile usability

### Weekly Tasks

- Check GSC for crawl errors
- Update `lastmod` timestamps when pages change
- Monitor brands/protocols added (ensure they appear in sitemap within 24h)

### Update Schedule

| Event | Action |
|---|---|
| Brand added to Socelle | Auto-included in next `sitemap-brands.xml` gen (hourly) |
| Protocol added | Auto-included in next `sitemap-protocols.xml` gen (hourly) |
| Page meta changed | Update `lastmod` in core `sitemap.xml` |
| Brand deleted | Remove from active query (already filtered by status=active) |

---

## Changefreq & Priority Summary

### Changefreq Logic
- **hourly** = Real-time data (Intelligence signals — not in sitemap, too volatile)
- **daily** = Intelligence Hub (signals update daily)
- **weekly** = Brands, Protocols, Education (content updates, new items)
- **monthly** = Conversion funnels, verticals, About (change rarely)
- **yearly** = Legal (change rarely)

### Priority Logic
- **1.0** = Homepage (importance anchor)
- **0.9** = Core product (Intelligence, Brands)
- **0.8** = High-intent pages (education, protocols, pricing, funnels)
- **0.7** = Vertical pages, onboarding
- **0.6** = Detail pages, support, dev pages
- **0.3** = Legal

---

## URLs to EXCLUDE from Sitemap

**These should NOT be in sitemap (blocked by robots.txt):**
- `/portal/*` (business portal)
- `/brand/*` (brand portal)
- `/admin/*` (admin portal)
- `/forgot-password`
- `/reset-password`
- `/claim/*` (claim flows)

**Current robots.txt already handles this. No changes needed.**

---

## Validation Checklist

### Before Submitting to Google Search Console

- [ ] All 17+ core URLs included with correct priorities
- [ ] No duplicate URLs
- [ ] All URLs return HTTP 200 (not 301/302)
- [ ] No noindex meta tags on these URLs
- [ ] XML validates: `xmllint sitemap.xml` or [W3C XML Validator](https://www.w3.org/2001/03/webdata/xsv)
- [ ] URL structure is canonical (no session IDs, tracking params, duplicates)
- [ ] lastmod dates are accurate and ISO 8601 formatted (YYYY-MM-DD)

### Tools for Validation

1. **XML Validation:** [xmllint](https://linux.die.net/man/1/xmllint) or online validator
2. **Google Rich Results:** [search.google.com/test/rich-results](https://search.google.com/test/rich-results)
3. **Search Console:** Submit sitemap, monitor coverage

---

## FAQ

**Q: Should I include URLs that require login?**  
A: No. Only public pages. Portal and admin pages are blocked by robots.txt.

**Q: How often does Google check my sitemap?**  
A: Google typically recrawls sitemaps every 1-7 days based on update frequency.

**Q: Do I need both static and dynamic sitemaps?**  
A: Yes. Use static for stable core pages, dynamic for fast-changing data (brands/protocols).

**Q: What if I have 100,000 URLs?**  
A: Split into multiple sitemaps (50K each max) and use sitemap index. Socelle won't hit this limit soon.

**Q: When should I update lastmod?**  
A: Only when content actually changes. Don't auto-update every day — Google penalizes artificial updates.

**Q: Can I include images/news in sitemap?**  
A: Yes, using `<image>` tags, but Socelle doesn't use these yet. Future phase.

---

## Timeline

| Phase | Timeline | Tasks | Owner |
|---|---|---|---|
| **Phase 1** | Week 1 (immediate) | Add 17 core URLs to static sitemap | Agent 6 |
| **Phase 2** | Week 2 | Build brand + protocol sitemap services | Backend/API |
| **Phase 3** | Week 2 | Deploy API endpoints + sitemap index | DevOps |
| **Phase 4** | Week 3+ | Submit to GSC, monitor, maintain | Operations |

---

## Code References

- **React Router:** `/src/App.tsx` (routes source of truth)
- **Supabase tables:** brands, protocols (data source)
- **Helmet:** react-helmet-async (canonical tags)
- **robots.txt:** `/public/robots.txt` (already correct)

---

## Next Steps

1. **THIS WEEK:** Update `/public/sitemap.xml` with 17+ core URLs
2. **NEXT WEEK:** Build dynamic sitemap services, deploy endpoints
3. **WEEK 3:** Submit sitemap-index.xml to Google Search Console
4. **ONGOING:** Monitor GSC coverage, update lastmod as needed

**Estimated effort:** 8 hours total (Phase 1 = 1h, Phase 2 = 4h, Phase 3 = 2h, Phase 4 = 1h/month).

---

