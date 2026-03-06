// ── i18n Type Definitions ─────────────────────────────────────────
// WO-23: International Expansion Infrastructure

/** Supported platform locales */
export type SupportedLocale = 'en' | 'fr' | 'es' | 'de' | 'ja' | 'ko';

/** Supported display currencies */
export type SupportedCurrency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'KRW' | 'CAD';

/** Flat dot-notation translation key */
export type TranslationKey = string;

/** Translation dictionary — flat key-value map */
export type TranslationDictionary = Record<TranslationKey, string>;

/** Locale metadata */
export interface LocaleInfo {
  code: SupportedLocale;
  label: string;
  nativeLabel: string;
  direction: 'ltr' | 'rtl';
  defaultCurrency: SupportedCurrency;
}

/** Currency metadata */
export interface CurrencyInfo {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  decimals: number;
  symbolPosition: 'prefix' | 'suffix';
}

/** Regional compliance rule */
export interface ComplianceRule {
  id: string;
  title: string;
  description: string;
  authority: string;
  url?: string;
  severity: 'info' | 'warning' | 'critical';
}

/** Compliance info for a country/region */
export interface ComplianceInfo {
  country: string;
  countryCode: string;
  region: string;
  rules: ComplianceRule[];
  lastUpdated: string;
}

/** Region stats for admin dashboard */
export interface RegionStats {
  countryCode: string;
  country: string;
  locale: SupportedLocale;
  currency: SupportedCurrency;
  userPercentage: number;
  activeBusinesses: number;
  activeBrands: number;
  complianceStatus: 'compliant' | 'review' | 'pending';
}

/** i18n context value exposed to consumers */
export interface I18nContextValue {
  locale: SupportedLocale;
  currency: SupportedCurrency;
  setLocale: (locale: SupportedLocale) => void;
  setCurrency: (currency: SupportedCurrency) => void;
  t: (key: TranslationKey, fallback?: string) => string;
  formatCurrency: (amount: number, currency?: SupportedCurrency) => string;
}
