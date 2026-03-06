// ── Currency Utilities ────────────────────────────────────────────
// WO-23: International Expansion Infrastructure
// Mock exchange rates (USD base). Replace with live API in production.

import type { SupportedCurrency, CurrencyInfo } from './types';

/** Mock exchange rates relative to USD */
const EXCHANGE_RATES: Record<SupportedCurrency, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  KRW: 1320,
  CAD: 1.36,
};

/** Currency metadata */
export const CURRENCY_INFO: Record<SupportedCurrency, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2, symbolPosition: 'prefix' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2, symbolPosition: 'prefix' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2, symbolPosition: 'prefix' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimals: 0, symbolPosition: 'prefix' },
  KRW: { code: 'KRW', symbol: '₩', name: 'Korean Won', decimals: 0, symbolPosition: 'prefix' },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', decimals: 2, symbolPosition: 'prefix' },
};

/**
 * Convert an amount between two currencies using mock rates.
 * @param amount  Source amount
 * @param from    Source currency (default USD)
 * @param to      Target currency
 * @returns       Converted amount (unrounded)
 */
export function convertCurrency(
  amount: number,
  from: SupportedCurrency = 'USD',
  to: SupportedCurrency = 'USD',
): number {
  if (from === to) return amount;
  // Convert to USD first, then to target
  const usdAmount = amount / EXCHANGE_RATES[from];
  return usdAmount * EXCHANGE_RATES[to];
}

/**
 * Format a monetary value with the correct symbol and decimal precision.
 * @param amount    Value to format
 * @param currency  Target currency (default USD)
 * @returns         Formatted string, e.g. "$1,234.56" or "¥149,500"
 */
export function formatCurrency(
  amount: number,
  currency: SupportedCurrency = 'USD',
): string {
  const info = CURRENCY_INFO[currency];
  const rounded = Number(amount.toFixed(info.decimals));

  // Use Intl.NumberFormat for locale-aware grouping
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: info.decimals,
    maximumFractionDigits: info.decimals,
  }).format(rounded);

  return info.symbolPosition === 'prefix'
    ? `${info.symbol}${formatted}`
    : `${formatted}${info.symbol}`;
}

/** All supported currencies as an array */
export const SUPPORTED_CURRENCIES: SupportedCurrency[] = ['USD', 'EUR', 'GBP', 'JPY', 'KRW', 'CAD'];
