import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_monthly: number;
  price_annual: number;
  modules_included: string[];
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  trial_days: number;
  features: Record<string, boolean | string> | null;
  created_at: string;
}

export interface PlansResult {
  /** All active subscription plans, sorted by sort_order */
  plans: Plan[];
  /** Whether plans are still loading */
  isLoading: boolean;
}

interface SubscriptionPlanRow {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  interval: string | null;
  is_active: boolean | null;
  features: unknown;
  created_at: string | null;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toFeatureObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function readBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

/**
 * Fetch all active subscription plans from the subscription_plans table.
 * Used by the pricing page and upgrade modals.
 * Migrated to TanStack Query v5 (V2-TECH-04).
 */
export function useSubscriptionPlans(): PlansResult {
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['subscription_plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('id, name, description, price_cents, interval, is_active, features, created_at')
        .eq('is_active', true)
        .order('price_cents', { ascending: true });

      if (error) {
        console.warn('[useSubscriptionPlans] fetch error:', error.message);
        return [];
      }

      const rows = (data ?? []) as SubscriptionPlanRow[];
      const grouped = new Map<
        string,
        {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          is_active: boolean;
          features: Record<string, unknown> | null;
          monthly: number | null;
          annual: number | null;
          sortHint: number | null;
        }
      >();

      for (const row of rows) {
        const key = row.name.toLowerCase().trim() || row.id;
        const featureObject = toFeatureObject(row.features);
        const existing = grouped.get(key) ?? {
          id: row.id,
          name: row.name,
          description: row.description,
          created_at: row.created_at ?? new Date().toISOString(),
          is_active: row.is_active ?? true,
          features: featureObject,
          monthly: null,
          annual: null,
          sortHint: featureObject ? readNumber(featureObject.sort_order, 0) : null,
        };

        const price = readNumber(row.price_cents, 0) / 100;
        const interval = (row.interval ?? '').toLowerCase();
        const isAnnualInterval = interval.includes('year') || interval.includes('annual');

        if (isAnnualInterval) existing.annual = price;
        else existing.monthly = price;

        grouped.set(key, existing);
      }

      const mapped = Array.from(grouped.values()).map((entry, idx) => {
        const monthly =
          entry.monthly ??
          (entry.annual !== null ? Number((entry.annual / 12).toFixed(2)) : 0);
        const annual =
          entry.annual ??
          (entry.monthly !== null ? Number((entry.monthly * 12 * 0.85).toFixed(2)) : 0);
        const features = entry.features;

        const modulesRaw = features?.modules_included;
        const modulesIncluded = Array.isArray(modulesRaw)
          ? modulesRaw.filter((v): v is string => typeof v === 'string')
          : [];

        return {
          id: entry.id,
          name: entry.name,
          slug: slugify(entry.name),
          description: entry.description,
          price_monthly: monthly,
          price_annual: annual,
          modules_included: modulesIncluded,
          is_featured: readBoolean(features?.is_featured, false),
          is_active: entry.is_active,
          sort_order: entry.sortHint ?? idx,
          trial_days: readNumber(features?.trial_days, 0),
          features: features as Record<string, boolean | string> | null,
          created_at: entry.created_at,
        } satisfies Plan;
      });

      mapped.sort((a, b) => a.sort_order - b.sort_order || a.price_monthly - b.price_monthly);
      return mapped;
    },
  });

  return { plans, isLoading };
}
