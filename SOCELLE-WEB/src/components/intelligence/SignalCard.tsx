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

// ── Content segment badge colors (INTEL-PREMIUM-01) ─────────────────
const SEGMENT_COLORS: Record<string, string> = {
  breaking: 'bg-red-100 text-red-700',
  research: 'bg-blue-100 text-blue-700',
  trend_report: 'bg-teal-100 text-teal-700',
  regulatory_update: 'bg-amber-100 text-amber-700',
  product_launch: 'bg-purple-100 text-purple-700',
  deep_dive: 'bg-indigo-100 text-indigo-700',
  social_pulse: 'bg-pink-100 text-pink-700',
  opinion: 'bg-orange-100 text-orange-700',
  how_to: 'bg-cyan-100 text-cyan-700',
  event_coverage: 'bg-emerald-100 text-emerald-700',
  market_data: 'bg-slate-100 text-slate-700',
};

function humanizeSegment(segment: string): string {
  return segment.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

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
  const hasHeroImage = !!signal.hero_image_url;

  return (
    <article className="group relative bg-mn-card rounded-xl border border-graphite/8 overflow-hidden transition-all duration-200 hover:border-graphite/16 hover:shadow-soft hover:-translate-y-0.5">
      {/* Hero image (INTEL-PREMIUM-01) */}
      {hasHeroImage && (
        <div className="w-full aspect-[16/9] overflow-hidden">
          <img
            src={signal.hero_image_url}
            alt=""
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
          />
        </div>
      )}

      <div className={hasHeroImage ? 'px-5 sm:px-6 pt-4 pb-5 sm:pb-6' : 'p-5 sm:p-6'}>
        {/* Top row: icon + type label + segment badge + trend indicator */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-graphite/[0.05]">
              <Icon className="w-4 h-4 text-accent" />
            </div>
            <span className="text-[10px] font-sans font-semibold tracking-[0.12em] uppercase text-graphite/40">
              {typeLabel}
            </span>
            {signal.content_segment && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-medium ${SEGMENT_COLORS[signal.content_segment] ?? 'bg-gray-100 text-gray-600'}`}>
                {humanizeSegment(signal.content_segment)}
              </span>
            )}
          </div>
          <TrendIndicator direction={signal.direction} magnitude={signal.magnitude} />
        </div>

        {/* Title */}
        <h3 className="font-sans text-lg text-graphite leading-snug mb-2">
          {signal.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-graphite/55 font-sans font-light leading-relaxed mb-4">
          {signal.description}
        </p>

        {/* Category pill + source */}
        <div className="flex items-center flex-wrap gap-2 mb-3">
          {signal.category && (
            <span className="px-2.5 py-0.5 rounded-full bg-graphite/[0.05] text-graphite/50 text-[11px] font-sans font-medium">
              {signal.category}
            </span>
          )}
          {signal.region && (
            <span className="px-2.5 py-0.5 rounded-full bg-graphite/[0.05] text-graphite/50 text-[11px] font-sans font-medium">
              {signal.region}
            </span>
          )}
          {signal.source && (
            <span className="text-graphite/30 text-[11px] font-sans">
              {signal.source}
            </span>
          )}
        </div>

        {/* Topic tags (INTEL-PREMIUM-01) */}
        {signal.topic_tags && signal.topic_tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {signal.topic_tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-graphite/[0.04] text-graphite/45 text-[10px] font-sans">
                {tag.replace(/-/g, ' ')}
              </span>
            ))}
          </div>
        )}

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

        {/* Reading time + author + quality (INTEL-PREMIUM-01) */}
        <div className="flex items-center gap-3 text-xs text-graphite/40 mb-2">
          {signal.reading_time_minutes != null && signal.reading_time_minutes > 0 && (
            <span>{signal.reading_time_minutes} min read</span>
          )}
          {signal.author && (
            <span className="truncate max-w-[120px]">by {signal.author}</span>
          )}
          {signal.quality_score != null && signal.quality_score > 70 && (
            <span className="ml-auto flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5F8A72]" />
              Premium
            </span>
          )}
        </div>

        {/* Freshness */}
        <FreshnessLabel updatedAt={signal.updated_at} />
      </div>
    </article>
  );
}
