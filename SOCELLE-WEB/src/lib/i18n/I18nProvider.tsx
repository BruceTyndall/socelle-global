// ── i18n Context Provider ─────────────────────────────────────────
// WO-23: International Expansion Infrastructure
// Lightweight context-based i18n — no external dependencies.

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { SupportedLocale, SupportedCurrency, I18nContextValue, TranslationDictionary } from './types';
import { formatCurrency as formatCurrencyUtil } from './currency';

// ── Translation imports ───────────────────────────────────────────
import en from './translations/en';
import fr from './translations/fr';
import es from './translations/es';

const TRANSLATION_MAP: Record<SupportedLocale, TranslationDictionary> = {
  en,
  fr,
  es,
  // Stubs — fall back to English until translations ship
  de: en,
  ja: en,
  ko: en,
};

// ── localStorage keys ─────────────────────────────────────────────
const LOCALE_KEY = 'socelle_locale';
const CURRENCY_KEY = 'socelle_currency';

function readStored<T extends string>(key: string, fallback: T, valid: readonly string[]): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw && valid.includes(raw)) return raw as T;
  } catch {
    // SSR / private-browsing guard
  }
  return fallback;
}

// ── Context ───────────────────────────────────────────────────────
const I18nContext = createContext<I18nContextValue | null>(null);

const VALID_LOCALES: SupportedLocale[] = ['en', 'fr', 'es', 'de', 'ja', 'ko'];
const VALID_CURRENCIES: SupportedCurrency[] = ['USD', 'EUR', 'GBP', 'JPY', 'KRW', 'CAD'];

interface I18nProviderProps {
  children: ReactNode;
  defaultLocale?: SupportedLocale;
  defaultCurrency?: SupportedCurrency;
}

export function I18nProvider({
  children,
  defaultLocale = 'en',
  defaultCurrency = 'USD',
}: I18nProviderProps) {
  const [locale, setLocaleState] = useState<SupportedLocale>(
    () => readStored(LOCALE_KEY, defaultLocale, VALID_LOCALES),
  );
  const [currency, setCurrencyState] = useState<SupportedCurrency>(
    () => readStored(CURRENCY_KEY, defaultCurrency, VALID_CURRENCIES),
  );

  const setLocale = useCallback((next: SupportedLocale) => {
    setLocaleState(next);
    try { localStorage.setItem(LOCALE_KEY, next); } catch { /* noop */ }
  }, []);

  const setCurrency = useCallback((next: SupportedCurrency) => {
    setCurrencyState(next);
    try { localStorage.setItem(CURRENCY_KEY, next); } catch { /* noop */ }
  }, []);

  /** Translate a dot-notation key. Falls back to English, then to the key itself. */
  const t = useCallback(
    (key: string, fallback?: string): string => {
      const dict = TRANSLATION_MAP[locale] ?? TRANSLATION_MAP.en;
      return dict[key] ?? TRANSLATION_MAP.en[key] ?? fallback ?? key;
    },
    [locale],
  );

  /** Format a number as currency. Uses provider currency if none specified. */
  const formatCurrency = useCallback(
    (amount: number, cur?: SupportedCurrency) => formatCurrencyUtil(amount, cur ?? currency),
    [currency],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ locale, currency, setLocale, setCurrency, t, formatCurrency }),
    [locale, currency, setLocale, setCurrency, t, formatCurrency],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Hook to access i18n context.
 * Returns context value or a safe fallback if used outside the provider.
 */
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (ctx) return ctx;

  // Graceful fallback — allows components to work even without the provider
  return {
    locale: 'en',
    currency: 'USD',
    setLocale: () => {},
    setCurrency: () => {},
    t: (key: string, fallback?: string) => TRANSLATION_MAP.en[key] ?? fallback ?? key,
    formatCurrency: (amount: number, cur?: SupportedCurrency) =>
      formatCurrencyUtil(amount, cur ?? 'USD'),
  };
}

export default I18nProvider;
