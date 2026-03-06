// ── Region & Compliance Data ──────────────────────────────────────
// WO-23: International Expansion Infrastructure
// Regional regulatory context for professional beauty / cosmetics.

import type { ComplianceInfo, RegionStats, LocaleInfo, SupportedLocale } from './types';

/** Supported locale metadata */
export const LOCALE_INFO: Record<SupportedLocale, LocaleInfo> = {
  en: { code: 'en', label: 'English', nativeLabel: 'English', direction: 'ltr', defaultCurrency: 'USD' },
  fr: { code: 'fr', label: 'French', nativeLabel: 'Français', direction: 'ltr', defaultCurrency: 'EUR' },
  es: { code: 'es', label: 'Spanish', nativeLabel: 'Español', direction: 'ltr', defaultCurrency: 'EUR' },
  de: { code: 'de', label: 'German', nativeLabel: 'Deutsch', direction: 'ltr', defaultCurrency: 'EUR' },
  ja: { code: 'ja', label: 'Japanese', nativeLabel: '日本語', direction: 'ltr', defaultCurrency: 'JPY' },
  ko: { code: 'ko', label: 'Korean', nativeLabel: '한국어', direction: 'ltr', defaultCurrency: 'KRW' },
};

/** All supported locales */
export const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'fr', 'es', 'de', 'ja', 'ko'];

/** Regional compliance database (mock) */
const COMPLIANCE_DATABASE: ComplianceInfo[] = [
  {
    country: 'United States',
    countryCode: 'US',
    region: 'North America',
    lastUpdated: '2026-01-15',
    rules: [
      {
        id: 'us-fda-cosmetics',
        title: 'FDA Cosmetics Regulation (MoCRA)',
        description: 'Modernization of Cosmetics Regulation Act — facility registration, adverse event reporting, product listing, safety substantiation required for all cosmetic products.',
        authority: 'U.S. Food & Drug Administration (FDA)',
        url: 'https://www.fda.gov/cosmetics',
        severity: 'critical',
      },
      {
        id: 'us-state-licensing',
        title: 'State Esthetician / Cosmetology Licensing',
        description: 'Each state mandates individual licensing requirements for estheticians, cosmetologists, and spa operators. Requirements vary by state — hours, exams, and CE credits differ.',
        authority: 'State Boards of Cosmetology',
        severity: 'critical',
      },
      {
        id: 'us-ftc-claims',
        title: 'FTC Advertising & Claims Compliance',
        description: 'Marketing claims for professional beauty products must be truthful, non-deceptive, and substantiated. Anti-aging and efficacy claims require scientific evidence.',
        authority: 'Federal Trade Commission (FTC)',
        url: 'https://www.ftc.gov',
        severity: 'warning',
      },
      {
        id: 'us-osha-salon',
        title: 'OSHA Salon & Spa Safety Standards',
        description: 'Occupational safety requirements for professional beauty establishments including chemical handling, ventilation, and ergonomic standards.',
        authority: 'Occupational Safety & Health Administration (OSHA)',
        severity: 'info',
      },
    ],
  },
  {
    country: 'European Union',
    countryCode: 'EU',
    region: 'Europe',
    lastUpdated: '2026-02-01',
    rules: [
      {
        id: 'eu-cosmetics-reg',
        title: 'EU Cosmetics Regulation (EC 1223/2009)',
        description: 'Comprehensive regulation governing all cosmetic products sold in the EU. Requires safety assessments, Responsible Person designation, CPNP notification, and GMP compliance.',
        authority: 'European Commission',
        url: 'https://ec.europa.eu/growth/sectors/cosmetics_en',
        severity: 'critical',
      },
      {
        id: 'eu-cpnp',
        title: 'CPNP Product Notification',
        description: 'All cosmetic products must be notified through the Cosmetic Products Notification Portal (CPNP) before being placed on the EU market.',
        authority: 'European Commission — CPNP',
        severity: 'critical',
      },
      {
        id: 'eu-reach',
        title: 'REACH Chemical Registration',
        description: 'Registration, Evaluation, Authorisation, and Restriction of Chemicals. Ingredients used in cosmetics must comply with REACH requirements.',
        authority: 'European Chemicals Agency (ECHA)',
        severity: 'warning',
      },
      {
        id: 'eu-gdpr-data',
        title: 'GDPR Data Protection',
        description: 'Customer data collected through the platform must comply with GDPR. Consent management, data portability, and right to erasure requirements.',
        authority: 'European Data Protection Board',
        severity: 'critical',
      },
    ],
  },
  {
    country: 'Canada',
    countryCode: 'CA',
    region: 'North America',
    lastUpdated: '2026-01-20',
    rules: [
      {
        id: 'ca-nhp',
        title: 'Natural Health Products Regulations',
        description: 'Products classified as natural health products require a Natural Product Number (NPN) or Drug Identification Number (DIN-HM) before sale.',
        authority: 'Health Canada',
        url: 'https://www.canada.ca/en/health-canada/services/drugs-health-products/natural-non-prescription.html',
        severity: 'critical',
      },
      {
        id: 'ca-cosmetics-reg',
        title: 'Cosmetic Regulations (C.R.C., c. 869)',
        description: 'Cosmetics sold in Canada must comply with the Food and Drugs Act and Cosmetic Regulations. Mandatory notification, ingredient disclosure, and labelling requirements.',
        authority: 'Health Canada',
        severity: 'critical',
      },
      {
        id: 'ca-bilingual',
        title: 'Bilingual Labelling (English/French)',
        description: 'All product labels and consumer-facing materials must be in both English and French under the Consumer Packaging and Labelling Act.',
        authority: 'Canadian Food Inspection Agency',
        severity: 'warning',
      },
    ],
  },
  {
    country: 'Japan',
    countryCode: 'JP',
    region: 'Asia-Pacific',
    lastUpdated: '2026-01-10',
    rules: [
      {
        id: 'jp-pmda',
        title: 'PMDA — Pharmaceutical & Medical Device Act',
        description: 'Cosmetics and quasi-drugs must be registered with PMDA. Quasi-drug classification applies to products with active ingredients claiming specific efficacy.',
        authority: 'Pharmaceuticals & Medical Devices Agency (PMDA)',
        url: 'https://www.pmda.go.jp/english/',
        severity: 'critical',
      },
      {
        id: 'jp-ingredient-standards',
        title: 'Japan Cosmetic Ingredient Standards',
        description: 'Positive list of approved cosmetic ingredients. Ingredients not on the list require separate approval. Strict limits on preservatives and UV filters.',
        authority: 'Ministry of Health, Labour & Welfare (MHLW)',
        severity: 'critical',
      },
      {
        id: 'jp-labelling',
        title: 'Japanese Labelling Standards',
        description: 'Full ingredient listing in Japanese required. Product name, usage instructions, and warnings must be in Japanese. Import notification required.',
        authority: 'MHLW / Consumer Affairs Agency',
        severity: 'warning',
      },
    ],
  },
  {
    country: 'South Korea',
    countryCode: 'KR',
    region: 'Asia-Pacific',
    lastUpdated: '2026-01-12',
    rules: [
      {
        id: 'kr-mfds',
        title: 'MFDS Cosmetics Act',
        description: 'All cosmetics must be registered with the Ministry of Food and Drug Safety. Functional cosmetics (whitening, anti-aging, sunscreen) require additional review and approval.',
        authority: 'Ministry of Food & Drug Safety (MFDS)',
        url: 'https://www.mfds.go.kr/eng/',
        severity: 'critical',
      },
      {
        id: 'kr-k-beauty-standards',
        title: 'K-Beauty Regulatory Framework',
        description: 'Korea has specific standards for functional cosmetics including efficacy testing requirements. Animal testing alternatives are mandatory.',
        authority: 'MFDS',
        severity: 'critical',
      },
      {
        id: 'kr-labelling',
        title: 'Korean Labelling Requirements',
        description: 'Product labels must include full INCI ingredient listing in Korean, manufacturer details, usage precautions, and expiration dating.',
        authority: 'MFDS',
        severity: 'warning',
      },
    ],
  },
];

/**
 * Look up compliance information for a given country.
 * @param country  Country name or ISO code
 * @returns        Array of ComplianceInfo matching the query
 */
export function getRegionalCompliance(country: string): ComplianceInfo[] {
  const normalized = country.toLowerCase().trim();
  return COMPLIANCE_DATABASE.filter(
    (c) =>
      c.country.toLowerCase() === normalized ||
      c.countryCode.toLowerCase() === normalized,
  );
}

/**
 * Get all compliance data.
 */
export function getAllCompliance(): ComplianceInfo[] {
  return COMPLIANCE_DATABASE;
}

/**
 * Mock region stats for admin dashboard.
 */
export function getRegionStats(): RegionStats[] {
  return [
    {
      countryCode: 'US',
      country: 'United States',
      locale: 'en',
      currency: 'USD',
      userPercentage: 85,
      activeBusinesses: 2340,
      activeBrands: 187,
      complianceStatus: 'compliant',
    },
    {
      countryCode: 'EU',
      country: 'European Union',
      locale: 'fr',
      currency: 'EUR',
      userPercentage: 8,
      activeBusinesses: 220,
      activeBrands: 45,
      complianceStatus: 'compliant',
    },
    {
      countryCode: 'CA',
      country: 'Canada',
      locale: 'en',
      currency: 'CAD',
      userPercentage: 4,
      activeBusinesses: 110,
      activeBrands: 22,
      complianceStatus: 'review',
    },
    {
      countryCode: 'JP',
      country: 'Japan',
      locale: 'ja',
      currency: 'JPY',
      userPercentage: 1.5,
      activeBusinesses: 41,
      activeBrands: 12,
      complianceStatus: 'pending',
    },
    {
      countryCode: 'KR',
      country: 'South Korea',
      locale: 'ko',
      currency: 'KRW',
      userPercentage: 1.5,
      activeBusinesses: 38,
      activeBrands: 15,
      complianceStatus: 'pending',
    },
  ];
}
