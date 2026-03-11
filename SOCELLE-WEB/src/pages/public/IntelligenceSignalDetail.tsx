// ── IntelligenceSignalDetail — /intelligence/signals/:id ─────────────
// Fetches a single market_signal by UUID and renders full detail view.
// Pearl Mineral V2 tokens only. TanStack Query. Error/loading/404 states.

import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  AlertTriangle,
  FlaskConical,
  BarChart3,
  Clock,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { supabase } from '../../lib/supabase';
import { getSignalImage } from '../../lib/intelligence/useSignalImage';
import type { IntelligenceSignal, SignalDirection, SignalType } from '../../lib/intelligence/types';
import { buildCanonical } from '../../lib/seo';
import SignalDetailSkeleton from '../../components/intelligence/SignalDetailSkeleton';
import SignalErrorState from '../../components/intelligence/SignalErrorState';

// ── Helpers ─────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

const TYPE_LABELS: Partial<Record<SignalType, string>> = {
  product_velocity:    'Product Velocity',
  treatment_trend:     'Treatment Trend',
  ingredient_momentum: 'Ingredient Science',
  ingredient_trend:    'Ingredient Science',
  brand_adoption:      'Brand Adoption',
  brand_update:        'Brand Update',
  regional:            'Regional Markets',
  regional_market:     'Regional Markets',
  pricing_benchmark:   'Pricing Intelligence',
  regulatory_alert:    'Regulatory Alert',
  education:           'Education',
  industry_news:       'Industry',
  press_release:       'Press',
  social_trend:        'Social Trend',
  job_market:          'Workforce',
  event_signal:        'Events',
  research_insight:    'Research Insight',
  market_data:         'Market Data',
  supply_chain:        'Supply Chain',
};

function directionColor(dir: SignalDirection, type: SignalType): string {
  if (type === 'regulatory_alert') return 'text-signal-warn';
  if (dir === 'up')   return 'text-signal-up';
  if (dir === 'down') return 'text-signal-down';
  return 'text-graphite/40';
}

function barColor(dir: SignalDirection, type: SignalType): string {
  if (type === 'regulatory_alert') return 'bg-signal-warn';
  if (dir === 'up')   return 'bg-signal-up';
  if (dir === 'down') return 'bg-signal-down';
  return 'bg-accent';
}

function borderColor(dir: SignalDirection, type: SignalType): string {
  if (type === 'regulatory_alert') return 'border-l-signal-warn';
  if (dir === 'up')   return 'border-l-signal-up';
  if (dir === 'down') return 'border-l-signal-down';
  return 'border-l-accent';
}

const TYPE_ICONS: Partial<Record<SignalType, React.ElementType>> = {
  regulatory_alert:    AlertTriangle,
  ingredient_momentum: FlaskConical,
  ingredient_trend:    FlaskConical,
  treatment_trend:     TrendingUp,
  product_velocity:    BarChart3,
};

// ── Data fetcher ────────────────────────────────────────────────────

async function fetchSignal(id: string): Promise<IntelligenceSignal> {
  const { data, error } = await supabase
    .from('market_signals')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Signal not found');
  // Map DB row → IntelligenceSignal
  return {
    id:               data.id,
    signal_type:      data.signal_type,
    signal_key:       data.signal_key ?? data.id,
    title:            data.title,
    description:      data.summary ?? data.description ?? '',
    magnitude:        data.magnitude ?? 0,
    direction:        data.direction ?? 'stable',
    region:           data.geo_region ?? undefined,
    category:         data.category ?? undefined,
    related_brands:   data.related_brands ?? undefined,
    related_products: data.related_products ?? undefined,
    updated_at:       data.updated_at,
    source:           data.source_name ?? data.source ?? undefined,
    source_url:       data.source_url ?? undefined,
    source_name:      data.source_name ?? undefined,
    confidence_score: data.confidence_score ?? undefined,
    tier_visibility:  data.tier_visibility ?? undefined,
    image_url:        data.image_url ?? undefined,
    impact_score:     data.impact_score ?? undefined,
    vertical:         data.vertical ?? undefined,
    topic:            data.topic ?? undefined,
    tier_min:         data.tier_min ?? undefined,
  };
}

// ── Loading + Error states use shared components ─────────────────────

// ── Main component ───────────────────────────────────────────────────

export default function IntelligenceSignalDetail() {
  const { id } = useParams<{ id: string }>();

  const {
    data: signal,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['signal', id],
    queryFn:  () => fetchSignal(id!),
    enabled:  !!id,
    staleTime: 5 * 60 * 1000,
  });

  const image = signal ? getSignalImage(signal) : null;

  return (
    <>
      <Helmet>
        <title>
          {signal ? `${signal.title} | Intelligence | Socelle` : 'Signal Detail | Socelle'}
        </title>
        {signal && (
          <>
            <meta name="description" content={signal.description?.slice(0, 160)} />
            <link rel="canonical" href={buildCanonical(`/intelligence/signals/${id}`)} />
          </>
        )}
      </Helmet>

      <MainNav noSpacer />

      <main id="main-content" className="min-h-[60vh] bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Back nav */}
          <Link
            to="/intelligence"
            className="inline-flex items-center gap-1.5 text-sm text-graphite/40 hover:text-graphite/70 transition-colors mb-10"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
            Intelligence Feed
          </Link>

          {/* Loading */}
          {isLoading && <SignalDetailSkeleton />}

          {/* Error */}
          {error && !isLoading && (
            <SignalErrorState
              variant="load-failed"
              message={(error as Error).message}
              onRetry={refetch}
            />
          )}

          {/* Signal detail */}
          {signal && !isLoading && (
            <article>
              {/* Hero image */}
              {image && (
                <div className="w-full aspect-[16/7] overflow-hidden rounded-xl mb-8 bg-graphite/5">
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
              )}

              {/* Type label + direction */}
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2.5">
                  {(() => {
                    const Icon = TYPE_ICONS[signal.signal_type] ?? BarChart3;
                    return (
                      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-graphite/6">
                        <Icon className="w-3.5 h-3.5 text-accent" aria-hidden />
                      </div>
                    );
                  })()}
                  <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-accent/75">
                    {TYPE_LABELS[signal.signal_type] ?? signal.signal_type}
                  </span>
                  {signal.category && (
                    <>
                      <span className="text-graphite/20 text-xs" aria-hidden>·</span>
                      <span className="text-[11px] text-graphite/35 uppercase tracking-wide">
                        {signal.category}
                      </span>
                    </>
                  )}
                </div>

                {signal.magnitude !== 0 && (
                  <div className={`flex items-center gap-1.5 ${directionColor(signal.direction, signal.signal_type)}`}>
                    {signal.direction === 'up'   && <TrendingUp   className="w-4 h-4" aria-hidden />}
                    {signal.direction === 'down' && <TrendingDown className="w-4 h-4" aria-hidden />}
                    {signal.direction === 'stable' && <Minus className="w-4 h-4" aria-hidden />}
                    <span className="font-mono font-semibold tabular-nums">
                      {signal.direction === 'up' ? '+' : signal.direction === 'down' ? '−' : ''}
                      {Math.abs(signal.magnitude)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Left-border card */}
              <div className={`border-l-[3px] ${borderColor(signal.direction, signal.signal_type)} pl-5 mb-8`}>
                <h1 className="text-2xl sm:text-3xl font-semibold text-graphite leading-tight tracking-tight mb-4">
                  {signal.title}
                </h1>
                {signal.description && (
                  <p className="text-base text-graphite/60 leading-relaxed">
                    {signal.description}
                  </p>
                )}
              </div>

              {/* Metadata strip */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-8 text-[12px] text-graphite/35 font-sans">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" aria-hidden />
                  <span>{timeAgo(signal.updated_at)}</span>
                </div>
                <span className="text-graphite/15">·</span>
                <span>{formatDate(signal.updated_at)}</span>
                {signal.vertical && (
                  <>
                    <span className="text-graphite/15">·</span>
                    <span className="capitalize">{signal.vertical.replace(/_/g, ' ')}</span>
                  </>
                )}
                {signal.region && (
                  <>
                    <span className="text-graphite/15">·</span>
                    <span>{signal.region}</span>
                  </>
                )}
              </div>

              {/* Confidence + impact */}
              {(signal.confidence_score != null || signal.impact_score != null) && (
                <div className="flex items-center gap-6 mb-8 p-4 bg-graphite/[0.03] rounded-lg border border-graphite/6">
                  {signal.confidence_score != null && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-graphite/30 mb-1.5">
                        Confidence
                      </p>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-20 h-1.5 bg-graphite/8 rounded-full overflow-hidden"
                          role="meter"
                          aria-valuenow={signal.confidence_score}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`Confidence ${Math.round(signal.confidence_score)}%`}
                        >
                          <div
                            className={`h-full rounded-full ${barColor(signal.direction, signal.signal_type)} opacity-70`}
                            style={{ width: `${signal.confidence_score}%` }}
                          />
                        </div>
                        <span className="font-mono text-sm font-semibold text-graphite/60 tabular-nums">
                          {Math.round(signal.confidence_score)}%
                        </span>
                      </div>
                    </div>
                  )}
                  {signal.impact_score != null && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-graphite/30 mb-1.5">
                        Impact Score
                      </p>
                      <span className="font-mono text-sm font-semibold text-graphite/60 tabular-nums">
                        {signal.impact_score}
                      </span>
                    </div>
                  )}
                  {signal.tier_min && (
                    <div className="ml-auto">
                      <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-full bg-accent/10 text-accent">
                        {signal.tier_min}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Related brands */}
              {signal.related_brands && signal.related_brands.length > 0 && (
                <div className="mb-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-graphite/30 mb-2">
                    Related Brands
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {signal.related_brands.map((b) => (
                      <span
                        key={b}
                        className="px-2.5 py-0.5 rounded-full bg-accent/8 text-accent text-[11px] font-medium"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Topic */}
              {signal.topic && (
                <div className="mb-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-graphite/30 mb-2">
                    Topic
                  </p>
                  <span className="px-2.5 py-0.5 rounded-full bg-graphite/6 text-graphite/50 text-[11px]">
                    {signal.topic}
                  </span>
                </div>
              )}

              {/* Source */}
              {(signal.source_name ?? signal.source) && (
                <div className="border-t border-graphite/6 pt-5 mt-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-graphite/30 mb-2">
                    Source
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-graphite/50">
                      {signal.source_name ?? signal.source}
                    </span>
                    {signal.source_url && (
                      <a
                        href={signal.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-accent text-xs hover:underline"
                        aria-label={`View source: ${signal.source_name ?? signal.source}`}
                      >
                        <ExternalLink className="w-3 h-3" aria-hidden />
                        View source
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* AI provenance label */}
              <div className="mt-8 pt-5 border-t border-graphite/6">
                <p className="text-[11px] text-graphite/28 leading-relaxed">
                  Signal data is sourced from verified industry publications, regulatory feeds, and structured trade data. Confidence scores are deterministic — not AI-ranked.
                </p>
              </div>

            </article>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
