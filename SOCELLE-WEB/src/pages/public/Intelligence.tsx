import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ComponentType, SVGProps } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Clock3,
  FlaskConical,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Waves,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import JsonLd from '../../components/seo/JsonLd';
import {
  DEFAULT_OG_IMAGE,
  buildCanonical,
  buildWebPageSchema,
} from '../../lib/seo';
import IntelligenceFeedSection, { FEED_FILTERS } from '../../components/intelligence/IntelligenceFeedSection';
import SiteFooter from '../../components/sections/SiteFooter';
import { useIntelligence } from '../../lib/intelligence/useIntelligence';
import type { IntelligenceSignal, SignalDirection, SignalType } from '../../lib/intelligence/types';
import { useDataFeedStats } from '../../lib/intelligence/useDataFeedStats';
import { useStories } from '../../lib/editorial/useStories';
import { useContentPlacements } from '../../lib/cms/useContentPlacements';
import { useAuth } from '../../lib/auth';
import { trackSignalViewed } from '../../lib/analytics/funnelEvents';

type VerticalFilter = 'all' | 'medspa' | 'salon' | 'beauty_brand';
type MetricTone = 'up' | 'down' | 'stable';
type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

interface HeroStat {
  label: string;
  value: string;
  detail: string;
}

interface MetricCardData {
  label: string;
  value: string;
  detail: string;
  note: string;
  tone: MetricTone;
  bars: number[];
  icon: IconComponent;
}

interface BoardRowData {
  id: string;
  title: string;
  category: string;
  source: string;
  confidence: string;
  freshness: string;
  direction: SignalDirection;
  strength: number;
}

interface EditorialNote {
  title: string;
  eyebrow: string;
  detail: string;
}

const VERTICAL_TABS: { key: VerticalFilter; label: string; summary: string }[] = [
  { key: 'all', label: 'Cross-Market', summary: 'Full health intelligence surface' },
  { key: 'medspa', label: 'Medspa', summary: 'Clinical demand and treatment movement' },
  { key: 'salon', label: 'Salon', summary: 'Service, ingredient, and retail momentum' },
  { key: 'beauty_brand', label: 'Brands', summary: 'Market adoption and pricing pressure' },
];

const FALLBACK_EDITORIAL_IMAGE = '/images/brand/photos/10.svg';

const PAGE_BACKGROUND: CSSProperties = {
  backgroundImage: [
    'radial-gradient(circle at 18% 16%, rgba(110, 135, 155, 0.18), transparent 24%)',
    'radial-gradient(circle at 82% 12%, rgba(20, 20, 24, 0.08), transparent 18%)',
    'linear-gradient(180deg, rgba(255, 255, 255, 0.72) 0%, rgba(246, 243, 239, 0.96) 24%, #F6F3EF 100%)',
  ].join(', '),
};

const GRID_OVERLAY: CSSProperties = {
  backgroundImage: [
    'linear-gradient(rgba(20, 20, 24, 0.055) 1px, transparent 1px)',
    'linear-gradient(90deg, rgba(20, 20, 24, 0.055) 1px, transparent 1px)',
  ].join(', '),
  backgroundSize: '72px 72px',
  maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0))',
  WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0))',
};

function timeAgo(dateStr?: string | null): string {
  if (!dateStr) return 'Awaiting refresh';
  const diff = Date.now() - new Date(dateStr).getTime();
  if (!Number.isFinite(diff) || diff < 0) return 'Just refreshed';
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just refreshed';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'Pending';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(dateStr));
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: value < 100 ? 1 : 0,
  }).format(value);
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function humanizeToken(value?: string | null): string {
  if (!value) return 'Monitoring';
  return value
    .split('_')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function buildBars(signals: IntelligenceSignal[]): number[] {
  const raw = signals.slice(0, 8).map((signal) => signal.impact_score ?? Math.abs(signal.magnitude) * 3 + (signal.confidence_score ?? 42) * 0.8);
  if (raw.length === 0) return [28, 36, 34, 48, 56, 52, 62, 74];
  const maxValue = Math.max(...raw, 1);
  return raw.map((value) => Math.max(18, Math.round((value / maxValue) * 100)));
}

function getMomentum(signals: IntelligenceSignal[]): number {
  return average(
    signals.map((signal) => {
      if (signal.direction === 'up') return Math.abs(signal.magnitude);
      if (signal.direction === 'down') return -Math.abs(signal.magnitude);
      return 0;
    }),
  );
}

function getScore(signals: IntelligenceSignal[]): number {
  if (signals.length === 0) return 0;
  const blended = signals.map((signal) => {
    const impact = signal.impact_score ?? Math.abs(signal.magnitude) * 3.2;
    const confidence = signal.confidence_score ?? 46;
    return impact * 0.65 + confidence * 0.35;
  });
  return Math.round(Math.min(99, average(blended)));
}

function formatDelta(momentum: number): string {
  if (Math.abs(momentum) < 1) return 'Stable';
  return `${momentum > 0 ? '+' : ''}${Math.round(momentum)}%`;
}

function toneFromMomentum(momentum: number): MetricTone {
  if (momentum > 1) return 'up';
  if (momentum < -1) return 'down';
  return 'stable';
}

function toneClasses(tone: MetricTone): string {
  if (tone === 'up') return 'text-accent';
  if (tone === 'down') return 'text-signal-down';
  return 'text-graphite/50';
}

function barClasses(tone: MetricTone): string {
  if (tone === 'up') return 'bg-accent';
  if (tone === 'down') return 'bg-signal-down';
  return 'bg-graphite/30';
}

function MetricCard({ card }: { card: MetricCardData }) {
  const Icon = card.icon;

  return (
    <article className="group rounded-card border border-graphite/10 bg-white/72 p-5 shadow-soft backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-graphite/10 bg-background text-graphite">
          <Icon className="h-5 w-5" />
        </div>
        <div className={`rounded-pill border border-current/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.24em] ${toneClasses(card.tone)}`}>
          {card.detail}
        </div>
      </div>
      <div className="mt-8">
        <p className="text-[11px] uppercase tracking-[0.22em] text-graphite/42">{card.label}</p>
        <div className="mt-3 flex items-end justify-between gap-3">
          <p className="font-mono text-[2rem] leading-none text-graphite sm:text-[2.3rem]">{card.value}</p>
          <p className={`pb-1 font-mono text-xs ${toneClasses(card.tone)}`}>{card.detail}</p>
        </div>
        <p className="mt-3 max-w-sm text-sm leading-6 text-graphite/62">{card.note}</p>
      </div>
      <div className="mt-6 flex h-14 items-end gap-1.5">
        {card.bars.map((bar, index) => (
          <div
            key={`${card.label}-${index}`}
            className={`flex-1 rounded-t-full ${barClasses(card.tone)}`}
            style={{ height: `${bar}%`, opacity: 0.26 + index * 0.08 }}
          />
        ))}
      </div>
    </article>
  );
}

function HeroStatCard({ stat }: { stat: HeroStat }) {
  return (
    <div className="rounded-[24px] border border-graphite/10 bg-white/64 p-4 shadow-soft backdrop-blur-sm">
      <p className="text-[11px] uppercase tracking-[0.22em] text-graphite/42">{stat.label}</p>
      <p className="mt-3 text-lg font-medium leading-tight text-graphite sm:text-xl">{stat.value}</p>
      <p className="mt-2 text-sm leading-6 text-graphite/58">{stat.detail}</p>
    </div>
  );
}

function BoardRow({ row }: { row: BoardRowData }) {
  const tone = row.direction === 'up' ? 'up' : row.direction === 'down' ? 'down' : 'stable';

  return (
    <div className="grid gap-4 border-t border-graphite/8 py-4 md:grid-cols-[minmax(0,1.55fr)_minmax(0,0.9fr)_80px_90px] md:items-center">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-graphite">{row.title}</p>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.18em] text-graphite/42">
          <span>{row.category}</span>
          <span>{row.source}</span>
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-graphite/42">
          <span>Signal strength</span>
          <span className={`font-mono ${toneClasses(tone)}`}>{row.confidence}</span>
        </div>
        <div className="h-2 rounded-full bg-graphite/8">
          <div className={`h-2 rounded-full ${barClasses(tone)}`} style={{ width: `${row.strength}%` }} />
        </div>
      </div>
      <p className="font-mono text-sm text-graphite">{row.confidence}</p>
      <p className="font-mono text-sm text-graphite/56">{row.freshness}</p>
    </div>
  );
}

export default function Intelligence() {
  const [activeVertical, setActiveVertical] = useState<VerticalFilter>('all');
  const [activeFilter, setActiveFilter] = useState('all');

  const activeSignalTypes = useMemo<SignalType[] | undefined>(() => {
    const filter = FEED_FILTERS.find((item) => item.key === activeFilter);
    return filter?.types && filter.types.length > 0 ? filter.types : undefined;
  }, [activeFilter]);

  const { signals, isLive, loading, marketPulse } = useIntelligence({
    ...(activeVertical !== 'all' ? { vertical: activeVertical as 'medspa' | 'salon' | 'beauty_brand' } : {}),
    ...(activeSignalTypes ? { signalTypes: activeSignalTypes } : {}),
  });
  const deferredSignals = useDeferredValue(signals);
  const {
    totalFeeds,
    totalSignals,
    enabledFeeds,
    avgConfidence,
    lastOrchestratorRun,
  } = useDataFeedStats();

  const { placements } = useContentPlacements({ placementKey: 'intel_hub_editorial_rail', isActive: true });
  const { stories: fallbackStories } = useStories({ limit: 4 });
  
  const editorialStories = placements.length > 0 
    ? placements.filter(p => p.post).map(p => ({
        title: p.post.title,
        hero_image_url: p.post.hero_image,
        category: p.post.category,
        reading_time_minutes: 5,
        published_at: p.post.published_at,
      }))
    : fallbackStories;

  const { user } = useAuth();

  useEffect(() => {
    if (!loading && deferredSignals.length > 0) {
      trackSignalViewed(deferredSignals.length);
    }
  }, [deferredSignals.length, loading]);

  const dashboardHref = user ? '/portal/intelligence' : '/request-access';
  const dashboardLabel = user ? 'Open Intelligence Dashboard' : 'Get Intelligence Access';
  const confidenceDisplay = avgConfidence === null ? '--' : `${Math.round(avgConfidence)}%`;
  const heroSignal = deferredSignals[0] ?? null;
  const heroImage = editorialStories[0]?.hero_image_url || heroSignal?.image_url || FALLBACK_EDITORIAL_IMAGE;
  const currentVerticalSummary = VERTICAL_TABS.find((tab) => tab.key === activeVertical)?.summary ?? 'Full health intelligence surface';

  const heroStats = useMemo<HeroStat[]>(() => {
    return [
      {
        label: 'Signals online',
        value: totalSignals > 0 ? formatCompactNumber(totalSignals) : '--',
        detail: isLive ? `${marketPulse.signals_this_week} signals surfaced in the last 7 days` : 'Preview mode until the signal feed is populated',
      },
      {
        label: 'Verified sources',
        value: totalFeeds > 0 ? formatCompactNumber(totalFeeds) : '--',
        detail: enabledFeeds > 0 ? `${enabledFeeds} active feeds monitored in the current stack` : 'Source stack initializing',
      },
      {
        label: 'Confidence average',
        value: confidenceDisplay,
        detail: lastOrchestratorRun ? `Last refresh ${timeAgo(lastOrchestratorRun)}` : 'Awaiting first orchestrator refresh',
      },
      {
        label: 'Focus mode',
        value: activeVertical === 'all' ? 'Cross-Market' : humanizeToken(activeVertical),
        detail: isLive ? `${humanizeToken(marketPulse.trending_category)} is leading the current cycle` : currentVerticalSummary,
      },
    ];
  }, [activeVertical, confidenceDisplay, currentVerticalSummary, enabledFeeds, isLive, lastOrchestratorRun, marketPulse.signals_this_week, marketPulse.trending_category, totalFeeds, totalSignals]);

  const metricCards = useMemo<MetricCardData[]>(() => {
    const clinicalSignals = deferredSignals.filter((signal) =>
      ['treatment_trend', 'education', 'research_insight'].includes(signal.signal_type),
    );
    const ingredientSignals = deferredSignals.filter((signal) =>
      ['ingredient_momentum', 'ingredient_trend', 'product_velocity'].includes(signal.signal_type),
    );
    const regulatorySignals = deferredSignals.filter((signal) => signal.signal_type === 'regulatory_alert');
    const pricingSignals = deferredSignals.filter((signal) =>
      ['pricing_benchmark', 'market_data', 'regional_market'].includes(signal.signal_type),
    );

    const clinicalMomentum = getMomentum(clinicalSignals);
    const ingredientMomentum = getMomentum(ingredientSignals);
    const regulatoryMomentum = getMomentum(regulatorySignals);
    const pricingMomentum = getMomentum(pricingSignals);

    return [
      {
        label: 'Clinical demand index',
        value: clinicalSignals.length > 0 ? `${getScore(clinicalSignals)}/100` : '--',
        detail: formatDelta(clinicalMomentum),
        note: clinicalSignals.length > 0 ? `${clinicalSignals.length} treatment, protocol, and research signals currently active` : 'Waiting on treatment and protocol movement in the live feed',
        tone: toneFromMomentum(clinicalMomentum),
        bars: buildBars(clinicalSignals),
        icon: Activity,
      },
      {
        label: 'Ingredient momentum',
        value: ingredientSignals.length > 0 ? `${getScore(ingredientSignals)}/100` : '--',
        detail: formatDelta(ingredientMomentum),
        note: ingredientSignals.length > 0 ? `${ingredientSignals.length} formulation and ingredient signals are shaping the current stack` : 'Ingredient and formulation momentum will appear once related feeds publish',
        tone: toneFromMomentum(ingredientMomentum),
        bars: buildBars(ingredientSignals),
        icon: FlaskConical,
      },
      {
        label: 'Safety watch',
        value: regulatorySignals.length > 0 ? regulatorySignals.length.toString().padStart(2, '0') : '--',
        detail: regulatorySignals[0]?.updated_at ? timeAgo(regulatorySignals[0].updated_at) : 'Monitoring',
        note: regulatorySignals[0]?.title ?? 'Regulatory and safety alerts will appear here the moment they clear ingest',
        tone: toneFromMomentum(regulatoryMomentum),
        bars: buildBars(regulatorySignals),
        icon: ShieldCheck,
      },
      {
        label: 'Pricing resilience',
        value: pricingSignals.length > 0 ? `${getScore(pricingSignals)}/100` : '--',
        detail: formatDelta(pricingMomentum),
        note: pricingSignals.length > 0 ? `${pricingSignals.length} pricing, market, and regional benchmarks are informing this cycle` : 'Pricing intelligence will populate when benchmark feeds are active',
        tone: toneFromMomentum(pricingMomentum),
        bars: buildBars(pricingSignals),
        icon: TrendingUp,
      },
    ];
  }, [deferredSignals]);

  const boardRows = useMemo<BoardRowData[]>(() => {
    return deferredSignals.slice(0, 6).map((signal) => ({
      id: signal.id,
      title: signal.title,
      category: humanizeToken(signal.category || signal.signal_type),
      source: signal.source_name || signal.source || 'Direct feed',
      confidence: signal.confidence_score ? `${Math.round(signal.confidence_score)}%` : '--',
      freshness: timeAgo(signal.updated_at),
      direction: signal.direction,
      strength: Math.max(18, Math.min(100, Math.round((signal.impact_score ?? Math.abs(signal.magnitude) * 4) || 22))),
    }));
  }, [deferredSignals]);

  const coverageRows = useMemo(() => {
    const rows = [
      {
        label: 'Clinical and protocol',
        count: deferredSignals.filter((signal) => ['treatment_trend', 'education', 'research_insight'].includes(signal.signal_type)).length,
      },
      {
        label: 'Ingredient and formulation',
        count: deferredSignals.filter((signal) => ['ingredient_momentum', 'ingredient_trend', 'product_velocity'].includes(signal.signal_type)).length,
      },
      {
        label: 'Pricing and market',
        count: deferredSignals.filter((signal) => ['pricing_benchmark', 'market_data', 'regional_market'].includes(signal.signal_type)).length,
      },
      {
        label: 'Regulatory and safety',
        count: deferredSignals.filter((signal) => signal.signal_type === 'regulatory_alert').length,
      },
    ];

    const maxCount = Math.max(...rows.map((row) => row.count), 1);

    return rows.map((row) => ({
      ...row,
      percent: Math.max(10, Math.round((row.count / maxCount) * 100)),
    }));
  }, [deferredSignals]);

  const editorialNotes = useMemo<EditorialNote[]>(() => {
    if (editorialStories.length > 0) {
      return editorialStories.map((story) => ({
        title: story.title,
        eyebrow: story.category ? humanizeToken(story.category) : 'Editorial brief',
        detail: `${story.reading_time_minutes ?? 5} min read | ${formatDate(story.published_at)}`,
      }));
    }

    if (deferredSignals.length > 0) {
      return deferredSignals.slice(0, 4).map((signal) => ({
        title: signal.title,
        eyebrow: humanizeToken(signal.category || signal.signal_type),
        detail: `${timeAgo(signal.updated_at)} | ${signal.source_name || signal.source || 'Live market signal'}`,
      }));
    }

    return [
      { title: 'Editorial brief queue is waiting for the first published issue', eyebrow: 'Health journal', detail: 'Connect the CMS or wait for the next signal batch' },
      { title: 'Premium operator notes will appear here once the feed goes live', eyebrow: 'Field notes', detail: 'The journal rail shares the same live data foundation' },
    ];
  }, [deferredSignals, editorialStories]);

  const handleVerticalChange = (next: VerticalFilter) => {
    startTransition(() => {
      setActiveVertical(next);
    });
  };

  const handleFeedFilterChange = (next: string) => {
    startTransition(() => {
      setActiveFilter(next);
    });
  };

  return (
    <>
      <Helmet>
        <title>Socelle Intelligence Hub | Premium Health Signals</title>
        <meta
          name="description"
          content="Socelle Intelligence Hub blends editorial beauty intelligence with live market movement, brand momentum, treatment shifts, and operator-ready insight."
        />
        <meta property="og:title" content="Socelle Intelligence Hub | Beauty Signals And Market Movement" />
        <meta
          property="og:description"
          content="A live beauty intelligence landing page for treatment demand, brand movement, ingredients, regulation, and consumer shifts."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={buildCanonical('/intelligence')} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={buildCanonical('/intelligence')} />
      </Helmet>
      <JsonLd
        data={buildWebPageSchema({
          name: 'Socelle Intelligence Hub',
          description: 'Live beauty intelligence with scored signals, editorial market coverage, and operator-ready context.',
          url: buildCanonical('/intelligence'),
        })}
      />
      <MainNav noSpacer />

      <main id="main-content" className="relative overflow-hidden bg-background text-graphite" style={PAGE_BACKGROUND}>
        <div className="pointer-events-none absolute inset-0 opacity-50" style={GRID_OVERLAY} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-gradient-to-b from-white/55 to-transparent" />

        <section className="relative pt-24 sm:pt-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {!isLive && (
              <div className="mb-6 flex items-center justify-between gap-4 rounded-[22px] border border-signal-warn/20 bg-white/70 px-4 py-3 text-sm text-graphite/72 shadow-soft backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-signal-warn" />
                  <span>Preview mode. Live intelligence appears automatically as feeds publish into the market signal stack.</span>
                </div>
                <span className="hidden font-mono text-[11px] uppercase tracking-[0.24em] text-graphite/42 sm:inline">Awaiting ingest</span>
              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-10">
              <div className="relative">
                <div className="inline-flex items-center gap-3 rounded-pill border border-graphite/10 bg-white/68 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-graphite/54 shadow-soft backdrop-blur-sm">
                  <span className={`h-2 w-2 rounded-full ${isLive ? 'bg-accent animate-pulse-subtle' : 'bg-signal-warn'}`} />
                  <span>{isLive ? 'Live Beauty Intelligence' : 'Preview Feed'}</span>
                  <span className="hidden text-graphite/34 sm:inline">TanStack Query + Supabase</span>
                </div>

                <div className="mt-8 max-w-3xl">
                  <p className="text-[11px] uppercase tracking-[0.26em] text-accent">Socelle Intelligence Hub</p>
                  <h1 className="mt-5 max-w-4xl text-[clamp(3.2rem,7vw,6rem)] font-light leading-[0.94] tracking-[-0.05em] text-graphite">
                    Beauty intelligence people actually want to read.
                  </h1>
                  <p className="mt-6 max-w-2xl text-lg leading-8 text-graphite/66 sm:text-xl">
                    Follow the treatments, brands, ingredients, consumer shifts, and market moves shaping beauty right now. The free surface should feel broad and useful before anyone ever needs the deeper paid layer.
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="#signal-feed"
                    className="inline-flex items-center gap-2 rounded-pill bg-graphite px-5 py-3 text-sm font-medium text-white shadow-soft transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    Read the live feed
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to={dashboardHref}
                    className="inline-flex items-center gap-2 rounded-pill border border-graphite/10 bg-white/72 px-5 py-3 text-sm font-medium text-graphite shadow-soft backdrop-blur-sm transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    {dashboardLabel}
                    <Sparkles className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-10 flex flex-wrap gap-2">
                  {VERTICAL_TABS.map((tab) => {
                    const isActive = tab.key === activeVertical;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => handleVerticalChange(tab.key)}
                        className={[
                          'rounded-pill border px-4 py-2 text-sm transition-all duration-200',
                          isActive
                            ? 'border-graphite bg-graphite text-white shadow-soft'
                            : 'border-graphite/10 bg-white/68 text-graphite/70 backdrop-blur-sm hover:border-graphite/24 hover:text-graphite',
                        ].join(' ')}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-4 max-w-xl text-sm leading-6 text-graphite/54">{currentVerticalSummary}</p>

                <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {heroStats.map((stat) => (
                    <HeroStatCard key={stat.label} stat={stat} />
                  ))}
                </div>
              </div>

              <aside className="relative">
                <div className="overflow-hidden rounded-section border border-graphite/10 bg-white/76 p-5 shadow-panel backdrop-blur-md sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-graphite/42">Live Health Terminal</p>
                      <h2 className="mt-2 text-2xl font-medium tracking-[-0.03em] text-graphite">Current signal board</h2>
                    </div>
                    <div className="rounded-pill border border-graphite/10 bg-background px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em] text-graphite/48">
                      {lastOrchestratorRun ? timeAgo(lastOrchestratorRun) : 'Pending'}
                    </div>
                  </div>

                  <div className="relative mt-6 overflow-hidden rounded-[26px] border border-graphite/10 bg-[#141418] p-5 text-white">
                    <img
                      src={heroImage}
                      alt="Intelligence journal artwork"
                      className="absolute inset-0 h-full w-full object-cover opacity-12"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,20,24,0.15),rgba(20,20,24,0.92))]" />
                    <div className="relative">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/55">Signal focus</p>
                          <p className="mt-2 max-w-sm text-lg font-medium leading-tight text-white">
                            {heroSignal?.title ?? 'Monitoring the next live health signal'}
                          </p>
                        </div>
                        <Waves className="h-8 w-8 text-white/45" />
                      </div>

                      <div className="mt-6 grid grid-cols-3 gap-3">
                        <div className="rounded-2xl border border-white/10 bg-white/6 p-3">
                          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">Confidence</p>
                          <p className="mt-2 font-mono text-xl text-white">
                            {heroSignal?.confidence_score ? `${Math.round(heroSignal.confidence_score)}%` : confidenceDisplay}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/6 p-3">
                          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">Category</p>
                          <p className="mt-2 text-sm text-white/88">{humanizeToken(heroSignal?.category || heroSignal?.signal_type)}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/6 p-3">
                          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">Freshness</p>
                          <p className="mt-2 text-sm text-white/88">{heroSignal?.updated_at ? timeAgo(heroSignal.updated_at) : 'Waiting'}</p>
                        </div>
                      </div>

                      <div className="mt-6 flex h-24 items-end gap-2">
                        {buildBars(deferredSignals).map((bar, index) => (
                          <div
                            key={`hero-bar-${index}`}
                            className="flex-1 rounded-t-full bg-accent"
                            style={{ height: `${bar}%`, opacity: 0.28 + index * 0.07 }}
                          />
                        ))}
                      </div>

                      <div className="mt-6 grid gap-3">
                        {boardRows.slice(0, 3).map((row) => (
                          <div key={row.id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm text-white">{row.title}</p>
                              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">{row.category}</p>
                            </div>
                            <p className={`font-mono text-xs ${toneClasses(row.direction === 'up' ? 'up' : row.direction === 'down' ? 'down' : 'stable')}`}>
                              {row.freshness}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="relative pb-10 pt-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_minmax(320px,0.82fr)]">
              <div className="grid gap-4 sm:grid-cols-2">
                {metricCards.map((card) => (
                  <MetricCard key={card.label} card={card} />
                ))}
              </div>

              <article className="overflow-hidden rounded-section border border-graphite/10 bg-white/76 shadow-soft backdrop-blur-md">
                <div className="relative h-52 overflow-hidden border-b border-graphite/10">
                  <img src={heroImage} alt="Editorial signal cover" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,20,24,0.08),rgba(20,20,24,0.72))]" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/58">Journal notes</p>
                    <h2 className="mt-2 max-w-md text-2xl font-medium tracking-[-0.03em]">
                      The editorial rail stays tied to the live feed, not a static placeholder.
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {editorialNotes.map((note) => (
                      <div key={`${note.eyebrow}-${note.title}`} className="rounded-[22px] border border-graphite/8 bg-background/80 p-4">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-accent">{note.eyebrow}</p>
                        <p className="mt-2 text-base leading-7 text-graphite">{note.title}</p>
                        <p className="mt-2 font-mono text-xs text-graphite/46">{note.detail}</p>
                      </div>
                    ))}
                  </div>
                  <Link
                    to="/intelligence/briefs"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-graphite transition-colors hover:text-accent"
                  >
                    Open intelligence briefs
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="relative pb-14 pt-4">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)] lg:px-8">
            <article className="rounded-section border border-graphite/10 bg-white/76 p-5 shadow-soft backdrop-blur-md sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-accent">Terminal ledger</p>
                  <h2 className="mt-2 text-2xl font-medium tracking-[-0.03em] text-graphite">High-priority health metrics</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-pill border border-graphite/10 bg-background px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-graphite/48">
                  <Clock3 className="h-3.5 w-3.5" />
                  {lastOrchestratorRun ? `Refreshed ${timeAgo(lastOrchestratorRun)}` : 'Refresh pending'}
                </div>
              </div>

              <div className="mt-6 grid gap-2">
                {boardRows.length > 0 ? (
                  boardRows.map((row) => <BoardRow key={row.id} row={row} />)
                ) : (
                  <div className="rounded-[24px] border border-dashed border-graphite/12 bg-background/80 px-5 py-10 text-center">
                    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-graphite/42">Terminal idle</p>
                    <p className="mt-3 text-base text-graphite/62">The ledger will populate as soon as live signals are available for this view.</p>
                  </div>
                )}
              </div>
            </article>

            <div className="space-y-6">
              <article className="rounded-section border border-graphite/10 bg-white/76 p-5 shadow-soft backdrop-blur-md sm:p-6">
                <p className="text-[11px] uppercase tracking-[0.22em] text-accent">Source mix</p>
                <h2 className="mt-2 text-2xl font-medium tracking-[-0.03em] text-graphite">Coverage across the feed</h2>
                <div className="mt-6 space-y-4">
                  {coverageRows.map((row) => (
                    <div key={row.label}>
                      <div className="mb-2 flex items-center justify-between gap-4">
                        <p className="text-sm text-graphite/72">{row.label}</p>
                        <p className="font-mono text-sm text-graphite">{row.count}</p>
                      </div>
                      <div className="h-2 rounded-full bg-graphite/8">
                        <div className="h-2 rounded-full bg-accent" style={{ width: `${row.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-section border border-graphite/10 bg-[#141418] p-6 text-white shadow-panel">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/52">Conversion rail</p>
                <h2 className="mt-3 text-3xl font-medium tracking-[-0.04em]">Move from signal reading to action.</h2>
                <p className="mt-4 text-base leading-7 text-white/72">
                  Route the same live feed into planning, team workflows, and operator dashboards without leaving the Intelligence Hub.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to={dashboardHref}
                    className="inline-flex items-center gap-2 rounded-pill bg-white px-5 py-3 text-sm font-medium text-graphite transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    {dashboardLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/request-access"
                    className="inline-flex items-center gap-2 rounded-pill border border-white/14 px-5 py-3 text-sm font-medium text-white/84 transition-colors duration-300 hover:border-white/28 hover:text-white"
                  >
                    Request operator access
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </section>

        <IntelligenceFeedSection
          signals={signals}
          loading={loading}
          isLive={isLive}
          marketPulse={marketPulse}
          avgConfidence={avgConfidence}
          lastRunAt={lastOrchestratorRun}
          activeFilter={activeFilter}
          onFilterChange={handleFeedFilterChange}
        />
      </main>

      <SiteFooter />
    </>
  );
}
