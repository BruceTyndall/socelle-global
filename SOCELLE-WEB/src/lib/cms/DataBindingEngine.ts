// ── DataBindingEngine — AUTH-CORE-05 ──────────────────────────────────
// Resolves {{variable_name}} placeholders in CMS block content with live data.
// Supports market_signals, data_feeds, user_profiles, and custom sources.
// Pure async utility — no React hooks, safe to call from anywhere.

import { supabase } from '../supabase';

// ── Types ──────────────────────────────────────────────────────────────

export type DataSource = 'market_signals' | 'data_feeds' | 'user_profiles' | 'custom';

export interface DataBinding {
  /** Template variable, e.g. "signal_delta" — matched as {{signal_delta}} */
  variable: string;
  source: DataSource;
  /** Dot-path into the fetched row, e.g. "magnitude" or "properties.delta_percent" */
  fieldPath: string;
  /** Pre-resolved value — set externally when calling resolveBindings with known values */
  value?: string | number;
}

// ── Internal: resolve a single binding from DB ─────────────────────────

async function fetchValue(binding: DataBinding): Promise<string | number | null> {
  // If caller already supplied a value, skip DB fetch
  if (binding.value !== undefined) return binding.value;

  const tableMap: Record<DataSource, string | null> = {
    market_signals: 'market_signals',
    data_feeds: 'data_feeds',
    user_profiles: 'user_profiles',
    custom: null,
  };

  const table = tableMap[binding.source];
  if (!table) return null;

  // fieldPath may be a dot-path like "properties.key"; we fetch the top-level field
  // and resolve nested access ourselves so the select is always valid SQL.
  const topField = binding.fieldPath.split('.')[0];

  const { data, error } = await supabase
    .from(table)
    .select(topField)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  // Walk nested path
  const parts = binding.fieldPath.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = data;
  for (const part of parts) {
    if (current === null || current === undefined) return null;
    current = current[part];
  }

  if (typeof current === 'number' || typeof current === 'string') return current;
  if (current !== null && current !== undefined) return String(current);
  return null;
}

// ── Public API ─────────────────────────────────────────────────────────

/**
 * Replace all {{variable_name}} placeholders in `content` with resolved values.
 *
 * - If a binding is found and resolves to a value, the placeholder is replaced.
 * - If no binding is found for a placeholder, the placeholder is left as-is.
 * - Resolution is done in parallel for all bindings.
 *
 * @example
 * const html = await resolveBindings(
 *   'Current trend magnitude: {{signal_delta}}%',
 *   [{ variable: 'signal_delta', source: 'market_signals', fieldPath: 'magnitude' }]
 * );
 * // → 'Current trend magnitude: 12%'
 */
export async function resolveBindings(
  content: string,
  bindings: DataBinding[],
): Promise<string> {
  if (!content || bindings.length === 0) return content;

  // Resolve all bindings in parallel
  const resolved = await Promise.all(
    bindings.map(async (b) => {
      const value = await fetchValue(b);
      return { variable: b.variable, value };
    }),
  );

  // Build lookup map
  const valueMap = new Map<string, string | number | null>();
  for (const { variable, value } of resolved) {
    valueMap.set(variable, value);
  }

  // Replace all {{variable}} occurrences
  return content.replace(/\{\{(\w+)\}\}/g, (match, varName: string) => {
    const val = valueMap.get(varName);
    if (val === null || val === undefined) return match; // keep original placeholder
    return String(val);
  });
}

/**
 * Resolve bindings from a pre-built values map (no DB fetch).
 * Useful when caller already has the data in memory.
 *
 * @example
 * const html = resolveBindingsSync(
 *   'Trend: {{category}}',
 *   new Map([['category', 'Skincare']])
 * );
 */
export function resolveBindingsSync(
  content: string,
  values: Map<string, string | number>,
): string {
  if (!content || values.size === 0) return content;

  return content.replace(/\{\{(\w+)\}\}/g, (match, varName: string) => {
    const val = values.get(varName);
    if (val === undefined) return match;
    return String(val);
  });
}
