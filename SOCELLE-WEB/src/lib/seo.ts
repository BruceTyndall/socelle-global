/**
 * seo.ts — SOCELLE SEO utility helpers
 *
 * Central place for URL construction, schema builders, and shared defaults.
 * Import from here rather than hard-coding strings across pages.
 */

export const SITE_URL = 'https://socelle.com';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.svg`;
export const SITE_NAME = 'Socelle';
export const TWITTER_HANDLE = '@socelleapp';

// ── Title builder ─────────────────────────────────────────────────────────────

/**
 * Build a page title in canonical Socelle format.
 * Example: buildTitle('Brand Directory') → "Brand Directory | Socelle"
 */
export function buildTitle(page: string): string {
  return `${page} | ${SITE_NAME}`;
}

// ── Canonical URL ─────────────────────────────────────────────────────────────

export function buildCanonical(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

// ── Breadcrumb schema ─────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

// ── Organization schema (sitewide) ───────────────────────────────────────────

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    description:
      'Socelle is the intelligence platform for professional beauty. Market signals, benchmarks, and commerce for salons, spas, and medspas.',
    sameAs: [
      'https://www.linkedin.com/company/socelle',
    ],
  };
}

// ── WebSite + SearchAction schema ─────────────────────────────────────────────

export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/brands?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// ── WebPage schema ────────────────────────────────────────────────────────────

export function buildWebPageSchema({
  name,
  description,
  url,
  breadcrumb,
}: {
  name: string;
  description: string;
  url: string;
  breadcrumb?: BreadcrumbItem[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url,
    isPartOf: { '@type': 'WebSite', url: SITE_URL, name: SITE_NAME },
    ...(breadcrumb && { breadcrumb: buildBreadcrumbSchema(breadcrumb) }),
  };
}

// ── CollectionPage schema ─────────────────────────────────────────────────────

export function buildCollectionPageSchema({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    isPartOf: { '@type': 'WebSite', url: SITE_URL, name: SITE_NAME },
  };
}

// ── Brand schema ──────────────────────────────────────────────────────────────

export function buildBrandSchema({
  name,
  description,
  slug,
  logoUrl,
  website,
  instagramHandle,
}: {
  name: string;
  description: string | null;
  slug: string;
  logoUrl?: string | null;
  website?: string | null;
  instagramHandle?: string | null;
}) {
  const sameAs: string[] = [];
  if (website) sameAs.push(website);
  if (instagramHandle) {
    const handle = instagramHandle.replace('@', '');
    sameAs.push(`https://instagram.com/${handle}`);
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    name,
    description: description ?? undefined,
    url: `${SITE_URL}/brands/${slug}`,
    ...(logoUrl && { logo: logoUrl }),
    ...(sameAs.length > 0 && { sameAs }),
  };
}

// ── FAQPage schema ────────────────────────────────────────────────────────────

export interface FaqItem {
  question: string;
  answer: string;
}

export function buildFaqSchema(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

// ── Event schema ──────────────────────────────────────────────────────────────

export function buildEventSchema({
  name,
  description,
  startDate,
  endDate,
  locationName,
  locationAddress,
  url,
  organizer,
}: {
  name: string;
  description: string;
  startDate: string; // ISO 8601
  endDate?: string;
  locationName?: string;
  locationAddress?: string;
  url: string;
  organizer?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name,
    description,
    startDate,
    ...(endDate && { endDate }),
    ...(locationName && {
      location: {
        '@type': 'Place',
        name: locationName,
        ...(locationAddress && {
          address: { '@type': 'PostalAddress', streetAddress: locationAddress },
        }),
      },
    }),
    url,
    ...(organizer && {
      organizer: { '@type': 'Organization', name: organizer },
    }),
  };
}

// ── JobPosting schema ─────────────────────────────────────────────────────────

export function buildJobPostingSchema({
  title,
  description,
  company,
  location,
  employmentType,
  salaryMin,
  salaryMax,
  salaryCurrency = 'USD',
  salaryUnit = 'YEAR',
  datePosted,
  url,
}: {
  title: string;
  description: string;
  company: string;
  location: string;
  employmentType?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryUnit?: string;
  datePosted: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title,
    description,
    datePosted,
    hiringOrganization: {
      '@type': 'Organization',
      name: company,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: location,
      },
    },
    url,
    ...(employmentType && { employmentType }),
    ...((salaryMin || salaryMax) && {
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: salaryCurrency,
        value: {
          '@type': 'QuantitativeValue',
          ...(salaryMin && salaryMax
            ? { minValue: salaryMin, maxValue: salaryMax }
            : salaryMin
              ? { value: salaryMin }
              : { value: salaryMax }),
          unitText: salaryUnit,
        },
      },
    }),
  };
}

// ── Course schema ─────────────────────────────────────────────────────────────

export function buildCourseSchema({
  name,
  description,
  provider,
  url,
}: {
  name: string;
  description: string;
  provider?: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    url,
    provider: {
      '@type': 'Organization',
      name: provider || SITE_NAME,
      url: SITE_URL,
    },
  };
}

// ── HowTo schema (for protocols) ─────────────────────────────────────────────

export function buildHowToSchema({
  name,
  description,
  steps,
  url,
}: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string }>;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    url,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

// ── Article schema (for blog/editorial) ──────────────────────────────────────

export function buildArticleSchema({
  headline,
  description,
  imageUrl,
  datePublished,
  dateModified,
  authorName,
  url,
}: {
  headline: string;
  description?: string;
  imageUrl?: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    ...(description && { description }),
    ...(imageUrl && { image: imageUrl }),
    datePublished,
    dateModified: dateModified || datePublished,
    ...(authorName && {
      author: [
        {
          '@type': 'Person',
          name: authorName,
        },
      ],
    }),
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/favicon.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
}

// ── Robots meta helpers ───────────────────────────────────────────────────────

/**
 * Returns the appropriate robots meta content.
 * Pages that are "thin" (no data to index) or expired should be noindexed.
 */
export function robotsContent({
  noindex = false,
  nofollow = false,
}: {
  noindex?: boolean;
  nofollow?: boolean;
} = {}): string {
  const index = noindex ? 'noindex' : 'index';
  const follow = nofollow ? 'nofollow' : 'follow';
  return `${index}, ${follow}`;
}
