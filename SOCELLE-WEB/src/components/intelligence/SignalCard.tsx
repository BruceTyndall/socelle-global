import {
  TrendingUp,
  BarChart3,
  FlaskConical,
  Building2,
  MapPin,
  DollarSign,
  AlertTriangle,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Layers,
  Lock,
} from 'lucide-react';
import { useState } from 'react';
import type { IntelligenceSignal, SignalType } from '../../lib/intelligence/types';
import TrendIndicator from './TrendIndicator';
import FreshnessLabel from './FreshnessLabel';
import ImpactBadge from './ImpactBadge';
import { CrossHubActionDispatcher } from '../CrossHubActionDispatcher';

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
  const [isExpanded, setIsExpanded] = useState(false);
  
  const Icon = SIGNAL_ICONS[signal.signal_type] ?? BarChart3;
  const typeLabel = SIGNAL_LABELS[signal.signal_type] ?? humanizeSignalType(signal.signal_type);
  const hasHeroImage = !!signal.hero_image_url;
  const similarCount = signal.similar_signals?.length ?? 0;

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
            {signal.impact_score != null && (
              <ImpactBadge score={signal.impact_score} />
            )}
          </div>
          <TrendIndicator direction={signal.direction} magnitude={signal.magnitude} />
        </div>

        {/* Title */}
        <h3 className="font-sans text-lg text-graphite leading-snug mb-2">
          {signal.title}
        </h3>

        {/* Description / Premium Data Gate */}
        {signal.requires_credit ? (
          <div className="bg-graphite/[0.03] border border-graphite/[0.08] rounded-lg p-5 mb-4 text-center">
             <div className="bg-graphite/[0.05] w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3">
               <Lock className="w-4 h-4 text-graphite/60" />
             </div>
             <p className="text-sm font-semibold text-graphite mb-1">Premium Historical Data</p>
             <p className="text-xs text-graphite/60 mb-3 max-w-xs mx-auto">This high-magnitude historical signal is archived. Unlock full context & analytics for 50 Credits.</p>
             <button className="px-4 py-2 bg-accent text-white rounded-lg text-xs font-semibold hover:bg-accent/90 transition-colors">
               Unlock Signal (50 Credits)
             </button>
          </div>
        ) : (
          <p className="text-sm text-graphite/55 font-sans font-light leading-relaxed mb-4">
            {signal.description}
          </p>
        )}

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
            signal.source_url ? (
               <a href={signal.source_url} target="_blank" rel="noopener noreferrer" className="text-accent underline hover:text-accent/80 text-[11px] font-sans">
                 {signal.source}
               </a>
            ) : (
               <span className="text-graphite/30 text-[11px] font-sans">
                 {signal.source}
               </span>
            )
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

        {/* Footer: Freshness & Actions */}
        <div className="flex items-center justify-between border-t border-graphite/8 pt-3 mt-3">
          <FreshnessLabel updatedAt={signal.updated_at} />
          
          <div className="flex items-center gap-2">
            <CrossHubActionDispatcher 
              compact 
              signal={{
                id: signal.id,
                title: signal.title,
                category: signal.category ?? signal.signal_type,
                delta: signal.magnitude,
                confidence: signal.confidence_score ?? 0,
                source: signal.source_name ?? signal.source ?? 'market_signals',
              }}
            />

            {similarCount > 0 && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium font-sans transition-colors ${
                  isExpanded
                    ? 'bg-accent/10 text-accent'
                    : 'bg-graphite/[0.05] text-graphite/60 hover:bg-graphite/[0.08]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                {similarCount} similar source{similarCount === 1 ? '' : 's'}
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* Expanded Similar Signals */}
        {isExpanded && similarCount > 0 && (
          <div className="mt-4 pt-4 border-t border-graphite/8 space-y-3">
            {signal.similar_signals!.map((sim) => (
              <a
                key={sim.id}
                href={`/intelligence/signals/${sim.id}`}
                className="block group/sim hover:bg-graphite/[0.02] -mx-2 px-2 py-2 rounded-lg transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h4 className="text-sm font-sans font-medium text-graphite/80 group-hover/sim:text-accent transition-colors line-clamp-1">
                    {sim.title}
                  </h4>
                  <span className="shrink-0 text-[10px] text-graphite/40 font-sans mt-0.5">
                    {new Date(sim.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-sans text-graphite/50">
                  {sim.source && <span>{sim.source}</span>}
                  {sim.provenance_tier && (
                    <span className="px-1.5 py-0.5 rounded bg-graphite/[0.06] text-graphite/60 font-medium">
                      Tier {sim.provenance_tier}
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
