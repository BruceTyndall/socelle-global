import {
  TrendingUp,
  BarChart3,
  FlaskConical,
  Building2,
  MapPin,
  DollarSign,
  AlertTriangle,
  GraduationCap,
} from 'lucide-react';
import type { IntelligenceSignal, SignalType } from '../../lib/intelligence/types';
import TrendIndicator from './TrendIndicator';
import FreshnessLabel from './FreshnessLabel';

// ── Icon map ────────────────────────────────────────────────────────
const SIGNAL_ICONS: Partial<Record<SignalType, React.ElementType>> = {
  product_velocity: BarChart3,
  treatment_trend: TrendingUp,
  ingredient_momentum: FlaskConical,
  brand_adoption: Building2,
  regional: MapPin,
  pricing_benchmark: DollarSign,
  regulatory_alert: AlertTriangle,
  education: GraduationCap,
};

const SIGNAL_LABELS: Partial<Record<SignalType, string>> = {
  product_velocity: 'Product Velocity',
  treatment_trend: 'Treatment Trend',
  ingredient_momentum: 'Ingredient Momentum',
  brand_adoption: 'Brand Adoption',
  regional: 'Regional Signal',
  pricing_benchmark: 'Pricing Benchmark',
  regulatory_alert: 'Regulatory Alert',
  education: 'Education',
};

function humanizeSignalType(type: SignalType): string {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface SignalCardProps {
  signal: IntelligenceSignal;
}

export default function SignalCard({ signal }: SignalCardProps) {
  const Icon = SIGNAL_ICONS[signal.signal_type] ?? BarChart3;
  const typeLabel = SIGNAL_LABELS[signal.signal_type] ?? humanizeSignalType(signal.signal_type);

  return (
    <article className="group relative bg-graphite rounded-xl border border-white/[0.06] p-5 sm:p-6 transition-all duration-200 hover:border-white/[0.12] hover:shadow-[0_4px_20px_rgba(212,164,76,0.06)] hover:-translate-y-0.5">
      {/* Top row: icon + type label + trend indicator */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.06]">
            <Icon className="w-4 h-4 text-accent" />
          </div>
          <span className="text-[10px] font-sans font-semibold tracking-[0.12em] uppercase text-white/40">
            {typeLabel}
          </span>
        </div>
        <TrendIndicator direction={signal.direction} magnitude={signal.magnitude} />
      </div>

      {/* Title */}
      <h3 className="font-sans text-lg text-white leading-snug mb-2">
        {signal.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-white/60 font-sans font-light leading-relaxed mb-4">
        {signal.description}
      </p>

      {/* Category pill + source */}
      <div className="flex items-center flex-wrap gap-2 mb-3">
        {signal.category && (
          <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] text-white/50 text-[11px] font-sans font-medium">
            {signal.category}
          </span>
        )}
        {signal.region && (
          <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] text-white/50 text-[11px] font-sans font-medium">
            {signal.region}
          </span>
        )}
        {signal.source && (
          <span className="text-white/30 text-[11px] font-sans">
            {signal.source}
          </span>
        )}
      </div>

      {/* Related brands */}
      {signal.related_brands && signal.related_brands.length > 0 && (
        <div className="flex items-center flex-wrap gap-1.5 mb-3">
          {signal.related_brands.map((brand) => (
            <span
              key={brand}
              className="px-2 py-0.5 rounded bg-accent/10 text-accent text-[10px] font-sans font-medium"
            >
              {brand}
            </span>
          ))}
        </div>
      )}

      {/* Freshness */}
      <FreshnessLabel updatedAt={signal.updated_at} />
    </article>
  );
}
