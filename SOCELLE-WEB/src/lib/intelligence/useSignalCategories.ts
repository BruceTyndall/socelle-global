import { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  FlaskConical,
  Building2,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import type { IntelligenceSignal, SignalType } from './types';

// ── useSignalCategories — W12-34 ─────────────────────────────────────
// Derives per-category stats from the live signal array returned by
// useIntelligence(). Enriches static category metadata (icon, title,
// description) with live counts and dominant direction.
//
// Usage:
//   const { signals, isLive } = useIntelligence();
//   const categories = useSignalCategories(signals);

export interface SignalCategory {
  signal_type: SignalType;
  icon: React.ElementType;
  title: string;
  description: string;
  count: number;
  direction: 'up' | 'down' | 'stable';
}

// ── Static metadata per signal_type ──────────────────────────────────
const CATEGORY_META: Record<
  SignalType,
  { icon: React.ElementType; title: string; description: string }
> = {
  product_velocity: {
    icon: BarChart3,
    title: 'Product Velocity',
    description:
      'Real-time reorder rates, first-time adoption trends, and SKU-level purchasing patterns across professional accounts.',
  },
  treatment_trend: {
    icon: TrendingUp,
    title: 'Treatment Trends',
    description:
      'Protocol adoption rates, emerging service formats, and treatment-room innovations gaining traction with top operators.',
  },
  ingredient_momentum: {
    icon: FlaskConical,
    title: 'Ingredient Momentum',
    description:
      'Formulation trends, emerging actives gaining clinical traction, and ingredient shifts across professional-grade product lines.',
  },
  brand_adoption: {
    icon: Building2,
    title: 'Brand Adoption',
    description:
      'New brand launches, professional account growth rates, and channel expansion patterns across the wholesale landscape.',
  },
  regional: {
    icon: MapPin,
    title: 'Regional Signals',
    description:
      'Geographic demand patterns, regional category preferences, and location-specific purchasing behavior across markets.',
  },
  regulatory_alert: {
    icon: AlertTriangle,
    title: 'Regulatory Alerts',
    description:
      'Compliance requirements, ingredient regulation changes, and policy shifts affecting professional beauty purchasing.',
  },
  pricing_benchmark: {
    icon: BarChart3,
    title: 'Pricing Benchmarks',
    description:
      'Wholesale pricing shifts, cost-per-use trends, and competitive pricing signals across product categories.',
  },
  education: {
    icon: TrendingUp,
    title: 'Education Signals',
    description:
      'Training adoption, certification trends, and continuing education patterns across the professional beauty channel.',
  },
};

// The six primary display categories (matches Intelligence page order)
const DISPLAY_TYPES: SignalType[] = [
  'product_velocity',
  'treatment_trend',
  'ingredient_momentum',
  'brand_adoption',
  'regional',
  'regulatory_alert',
];

export function useSignalCategories(
  signals: IntelligenceSignal[],
): SignalCategory[] {
  return useMemo(() => {
    // Count signals per type and determine dominant direction
    const stats = signals.reduce<
      Record<string, { count: number; up: number; down: number; stable: number }>
    >((acc, s) => {
      if (!acc[s.signal_type]) {
        acc[s.signal_type] = { count: 0, up: 0, down: 0, stable: 0 };
      }
      acc[s.signal_type].count += 1;
      acc[s.signal_type][s.direction] += 1;
      return acc;
    }, {});

    return DISPLAY_TYPES.map((type) => {
      const meta = CATEGORY_META[type];
      const s = stats[type] ?? { count: 0, up: 0, down: 0, stable: 0 };

      // Dominant direction: whichever has the most signals
      let direction: 'up' | 'down' | 'stable' = 'stable';
      if (s.up >= s.down && s.up > s.stable) direction = 'up';
      else if (s.down > s.up && s.down > s.stable) direction = 'down';

      return {
        signal_type: type,
        icon: meta.icon,
        title: meta.title,
        description: meta.description,
        count: s.count,
        direction,
      };
    });
  }, [signals]);
}
