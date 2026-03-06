# SCHEMA_TEMPLATES.md — JSON-LD Schema Templates for SOCELLE

**Purpose:** Ready-to-use JSON-LD schema templates for all public pages.  
**Format:** Copy-paste into `<Helmet>` component via `<script type="application/ld+json">`  
**Testing:** Use [Google's Rich Results Test](https://search.google.com/test/rich-results)

---

## A. Organization Schema (Company-Level)

**Used on:** Home, About  
**Purpose:** Global company identity, social links, contact info  
**Priority:** HIGH (improves Knowledge Panel)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Socelle",
  "url": "https://socelle.com",
  "logo": "https://socelle.com/favicon.svg",
  "description": "The intelligence platform for professional beauty. Real-time market signals, competitive benchmarks, and procurement marketplace for salons, spas, and medspas.",
  "foundingDate": "2025",
  "foundingLocation": {
    "@type": "Place",
    "name": "United States"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Support",
    "email": "support@socelle.com",
    "url": "https://socelle.com/request-access"
  },
  "sameAs": [
    "https://linkedin.com/company/socelle",
    "https://twitter.com/socelle"
  ]
}
```

**Integration:**
```tsx
<Helmet>
  <script type="application/ld+json">{JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Socelle",
    "url": "https://socelle.com",
    "logo": "https://socelle.com/favicon.svg",
    "description": "The intelligence platform for professional beauty..."
  })}</script>
</Helmet>
```

---

## B. WebSite + SearchAction Schema

**Used on:** Home page  
**Purpose:** Enable sitelinks search box in SERPs  
**Priority:** MEDIUM (improves visual real estate)

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Socelle",
  "url": "https://socelle.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://socelle.com/brands?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

**Implementation Note:**
- Keep existing on Home page
- `target` = Brands search (primary user intent)
- Update query param if search backend changes

---

## C. WebPage Schema (Generic)

**Used on:** Intelligence Hub, ForBuyers, ForBrands, ForMedspas, ForSalons, Education Hub, etc.  
**Purpose:** Declare page type, primary topic, publisher  
**Priority:** HIGH (helps Google understand content)

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Intelligence Hub | Socelle Market Signals",
  "description": "Live intelligence from professional treatment rooms. See trending products, protocols, ingredients, and brand adoption signals updated weekly.",
  "url": "https://socelle.com/intelligence",
  "image": "https://socelle.com/og-image.svg",
  "publisher": {
    "@type": "Organization",
    "name": "Socelle",
    "url": "https://socelle.com",
    "logo": "https://socelle.com/favicon.svg"
  },
  "datePublished": "2026-03-03",
  "dateModified": "2026-03-04"
}
```

**Variables:**
- `name` = Page title
- `description` = Meta description
- `url` = Canonical URL
- `image` = og:image URL (or page-specific image)
- `datePublished` = First publish date
- `dateModified` = Last update date

**Pages to Add:**
1. `/how-it-works`
2. `/pricing`
3. `/faq`
4. `/api/docs`
5. `/api/pricing`

---

## D. CollectionPage Schema

**Used on:** /brands, /protocols  
**Purpose:** Signal multi-item collection, enable filtering/faceting  
**Priority:** HIGH (improves rich results visibility)

### D1. Brands Collection Page

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Brands | Socelle",
  "description": "Browse 120+ professional beauty brands authorized on Socelle. Filter by category, view market adoption signals, and purchase in one marketplace.",
  "url": "https://socelle.com/brands",
  "publisher": {
    "@type": "Organization",
    "name": "Socelle",
    "url": "https://socelle.com"
  },
  "mainEntity": {
    "@type": "ItemList",
    "name": "Authorized Beauty Brands",
    "numberOfItems": 120,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Skinceuticals",
        "url": "https://socelle.com/brands/skinceuticals"
      }
    ]
  }
}
```

### D2. Protocols Collection Page

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Treatment Protocols | Socelle",
  "description": "Evidence-based treatment protocols for professional estheticians, spa operators, and medspa clinicians. Step-by-step procedures with product recommendations and CE credit eligibility.",
  "url": "https://socelle.com/protocols",
  "publisher": {
    "@type": "Organization",
    "name": "Socelle",
    "url": "https://socelle.com"
  },
  "mainEntity": {
    "@type": "ItemList",
    "name": "Treatment Protocols",
    "numberOfItems": 8,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Advanced Chemical Peel",
        "url": "https://socelle.com/protocols/advanced-chemical-peel"
      }
    ]
  }
}
```

---

## E. BreadcrumbList Schema

**Used on:** Dynamic detail pages (/brands/[slug], /protocols/[slug])  
**Purpose:** Show navigation path in SERPs, improve site structure clarity  
**Priority:** HIGH (improves CTR + crawlability)

### E1. Brand Storefront Breadcrumb

```tsx
// For: /brands/[slug]
// Example: /brands/skinceuticals

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Socelle",
      "item": "https://socelle.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Brands",
      "item": "https://socelle.com/brands"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Skinceuticals",  // ← Dynamic: brand.name
      "item": "https://socelle.com/brands/skinceuticals"  // ← Dynamic: brand.slug
    }
  ]
}
```

### E2. Protocol Detail Breadcrumb

```tsx
// For: /protocols/[slug]
// Example: /protocols/advanced-chemical-peel

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Socelle",
      "item": "https://socelle.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Protocols",
      "item": "https://socelle.com/protocols"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Advanced Chemical Peel",  // ← Dynamic: protocol.name
      "item": "https://socelle.com/protocols/advanced-chemical-peel"  // ← Dynamic: protocol.slug
    }
  ]
}
```

**Implementation:** Build dynamically on component:
```tsx
// BrandStorefront.tsx or ProtocolDetail.tsx
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Socelle", "item": "https://socelle.com" },
    { "@type": "ListItem", "position": 2, "name": "Brands", "item": "https://socelle.com/brands" },
    { "@type": "ListItem", "position": 3, "name": brand.name, "item": `https://socelle.com/brands/${brand.slug}` }
  ]
}
```

---

## F. LocalBusiness / ProfessionalService Schema

**Used on:** Brand Storefront (/brands/[slug])  
**Purpose:** Enrich brand profile, show business info in SERPs  
**Priority:** MEDIUM (nice-to-have for brand discovery)

```json
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Skinceuticals",
  "url": "https://socelle.com/brands/skinceuticals",
  "logo": "https://[brand-logo-url]",
  "description": "Professional-grade skincare brand available through Socelle marketplace.",
  "areaServed": {
    "@type": "Country",
    "name": "US"
  },
  "image": "https://[brand-hero-image-url]",
  "sameAs": [
    "https://skinceuticals.com",
    "https://instagram.com/skinceuticals"
  ]
}
```

**Variables:**
- `name` = brand.name
- `url` = Dynamic: `https://socelle.com/brands/${slug}`
- `logo` = brand.logo_url
- `description` = brand.short_description
- `image` = brand.hero_image_url
- `sameAs` = External brand URLs (website, social)

---

## G. FAQPage Schema

**Used on:** /faq  
**Purpose:** Enable FAQ snippet rich results in SERPs (accordion format)  
**Priority:** HIGH (improves click-through + positions FAQ as authoritative)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Socelle?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Socelle is a professional beauty intelligence platform paired with a verified wholesale marketplace. We surface real signals from treatment rooms -- trending products, protocol adoption, ingredient momentum -- and let you act on those signals with consolidated multi-brand purchasing."
      }
    },
    {
      "@type": "Question",
      "name": "Who can access Socelle?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Licensed professionals only. We verify credentials for every operator account. This includes licensed estheticians, cosmetologists, spa owners, and medspa operators with valid professional credentials."
      }
    },
    {
      "@type": "Question",
      "name": "Can I order from multiple brands?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. One cart, multiple brands, single checkout. No more logging into separate brand portals or managing fragmented orders. Every authorized brand ships from their own inventory."
      }
    }
  ]
}
```

**Implementation:** Map FAQ_DATA array:
```tsx
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": FAQ_DATA.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
}
```

---

## H. AggregateRating / Review Schema (Future)

**Used on:** Brand Storefront (when reviews exist)  
**Purpose:** Show star ratings + review count in SERPs  
**Priority:** LOW (future phase, depends on reviews feature)

```json
{
  "@context": "https://schema.org",
  "@type": "Brand",
  "name": "Skinceuticals",
  "url": "https://socelle.com/brands/skinceuticals",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.7,
    "reviewCount": 142,
    "ratingCount": 156,
    "bestRating": 5,
    "worstRating": 1
  }
}
```

---

## I. Thing/EducationalOccupationalCredential (Education Hub - Future)

**Used on:** /education (when courses become CE-tracked)  
**Purpose:** Mark CE-eligible courses, enable rich results  
**Priority:** LOW (future — when CE tracking is live)

```json
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "Chemical Peel Safety & Application",
  "description": "Learn proper technique, contraindications, and post-care protocols for professional chemical peels.",
  "provider": {
    "@type": "Organization",
    "name": "Socelle",
    "url": "https://socelle.com"
  },
  "educationalCredentialAwarded": {
    "@type": "EducationalOccupationalCredential",
    "name": "CE Credits",
    "credentialCategory": "ContinuingEducation"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.8,
    "reviewCount": 24
  }
}
```

---

## J. JobPosting Schema (Future)

**Used on:** /jobs/[slug] (when careers page exists)  
**Purpose:** Structured job postings, career page indexing  
**Priority:** LOW (future — when /jobs routes exist)

```json
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "Senior Product Manager, Intelligence",
  "description": "Lead the evolution of Socelle's intelligence platform. You'll own the roadmap for market signal generation, competitor benchmarking, and data quality.",
  "datePosted": "2026-03-01",
  "validThrough": "2026-04-01",
  "employmentType": "FULL_TIME",
  "hiringOrganization": {
    "@type": "Organization",
    "name": "Socelle",
    "url": "https://socelle.com",
    "logo": "https://socelle.com/favicon.svg",
    "sameAs": ["https://linkedin.com/company/socelle"]
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    }
  },
  "baseSalary": {
    "@type": "PriceSpecification",
    "priceCurrency": "USD",
    "price": "140000"
  }
}
```

---

## K. Event Schema (Future)

**Used on:** /events/[slug] (when Socelle hosts events)  
**Purpose:** Structured event listings, event discovery  
**Priority:** LOW (future — when /events routes exist)

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Socelle Industry Summit 2026",
  "description": "Annual conference for professional beauty operators, brands, and educators. Learn market intelligence, network with peers, and discover emerging trends.",
  "startDate": "2026-06-15T09:00:00-04:00",
  "endDate": "2026-06-17T17:00:00-04:00",
  "url": "https://socelle.com/events/summit-2026",
  "location": {
    "@type": "Place",
    "name": "Marriott Downtown",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Main St",
      "addressLocality": "New York",
      "addressRegion": "NY",
      "postalCode": "10001",
      "addressCountry": "US"
    }
  },
  "image": "https://socelle.com/images/summit-2026-hero.jpg",
  "organizer": {
    "@type": "Organization",
    "name": "Socelle",
    "url": "https://socelle.com"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://socelle.com/events/summit-2026/register",
    "price": "199",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "validFrom": "2026-03-15"
  }
}
```

---

## Implementation Checklist

### Week 1 — P0 Critical
- [ ] Add Organization schema to Home + About
- [ ] Add WebSite + SearchAction to Home
- [ ] Add WebPage schema to 5 missing pages (HowItWorks, Pricing, FAQ, Education, ApiDocs)
- [ ] Add BreadcrumbList to BrandStorefront.tsx (dynamic)
- [ ] Add BreadcrumbList to ProtocolDetail.tsx (dynamic)

### Week 2 — P1 High
- [ ] Add CollectionPage to Brands.tsx
- [ ] Add CollectionPage to Protocols.tsx
- [ ] Add FAQPage schema to FAQ.tsx
- [ ] Add ProfessionalService to BrandStorefront.tsx (optional, low-effort)
- [ ] Test all schemas with Google Rich Results Test

### Wave 9 — Future (International)
- [ ] Add hreflang tags to all pages
- [ ] Create /en, /fr, /es variants of core pages
- [ ] Update schema to reflect alternate language versions

---

## Testing & Validation

### Google Rich Results Test
1. Go to [search.google.com/test/rich-results](https://search.google.com/test/rich-results)
2. Paste full URL of page
3. Verify schema sections light up (green checkmarks)
4. Note any warnings or errors

### Schema.org Validator
1. Go to [validator.schema.org](https://validator.schema.org)
2. Paste page URL or JSON
3. Check for warnings (most warnings are non-blocking)

### Tools Used by This Platform
- **Helmet** = react-helmet-async (meta management)
- **JSON.stringify()** = Encode objects as JSON safely in JSX
- **Canonical** = Already implemented on all pages
- **OG tags** = Mostly implemented, extend with og:image

---

## Notes

- **Keep JSON in Helmet:** All schema should live in Helmet component, not in `<head>` of HTML
- **Use JSON.stringify():** For safety, use `{JSON.stringify(schemaObject)}` instead of backticks
- **Dynamic Pages:** For brand + protocol detail pages, build schema objects dynamically from page data
- **Multiple Schemas:** A page can have multiple `<script type="application/ld+json">` tags (e.g., Organization + WebPage on Home)
- **Canonical + Schema:** Both should coexist. Canonical = prevent duplicates, Schema = semantic markup

---

