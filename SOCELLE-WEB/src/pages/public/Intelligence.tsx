/* ═══════════════════════════════════════════════════════════════
   Intelligence — WO-OVERHAUL-03 Phase 3: Crown Jewel Page
   LIVE surface: market_signals via useIntelligence() hook
   PREVIEW banner when live feeds are not yet populated
   Pearl Mineral V2 tokens only — no hardcoded hex, no pro-*
   ═══════════════════════════════════════════════════════════════ */
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import MainNav from '../../components/MainNav';
import JsonLd from '../../components/seo/JsonLd';
import {
  DEFAULT_OG_IMAGE,
  buildWebPageSchema,
  buildCanonical,
} from '../../lib/seo';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Filter,
  BarChart3,
  Shield,
  Clock,
  Beaker,
} from 'lucide-react';
import HeroMediaRail from '../../components/public/HeroMediaRail';
import { NewsTicker } from '../../components/modules/NewsTicker';
import { BigStatBanner } from '../../components/modules/BigStatBanner';
import { KPIStrip } from '../../components/modules/KPIStrip';
import { EditorialScroll } from '../../components/modules/EditorialScroll';
import { SpotlightPanel } from '../../components/modules/SpotlightPanel';
import { SignalTable } from '../../components/modules/SignalTable';
import { ImageMosaic } from '../../components/modules/ImageMosaic';
import { CTASection } from '../../components/modules/CTASection';
import { StickyConversionBar } from '../../components/modules/StickyConversionBar';
import SiteFooter from '../../components/sections/SiteFooter';
import { useIntelligence } from '../../lib/intelligence/useIntelligence';
import { useDataFeedStats } from '../../lib/intelligence/useDataFeedStats';
import { useStories } from '../../lib/editorial/useStories';
import { useAuth } from '../../lib/auth';
import { trackSignalViewed, trackSignalClicked } from '../../lib/analytics/funnelEvents';

/* ─── Brand Media ─────────────────────────────────────────────── */
const HERO_VIDEO = '/videos/brand/air bubbles.mp4';
const HERO_POSTER = '/images/brand/photos/1.svg';
const LAB_IMAGE = '/images/brand/photos/3.svg';

const MOSAIC_IMAGES = [
  '/images/brand/photos/5.svg',
  '/images/brand/photos/7.svg',
  '/images/brand/photos/9.svg',
  '/images/brand/photos/11.svg',
  '/images/brand/photos/13.svg',
  '/images/brand/photos/15.svg',
];

const SWATCH_IMAGES = [
  '/images/brand/swatches/1.svg',
  '/images/brand/swatches/2.svg',
  '/images/brand/swatches/3.svg',
  '/images/brand/swatches/4.svg',
  '/images/brand/swatches/5.svg',
  '/images/brand/swatches/6.svg',
];

const EDITORIAL_FALLBACK_IMAGES = [
  '/images/brand/photos/2.svg',
  '/images/brand/photos/4.svg',
  '/images/brand/photos/6.svg',
  '/images/brand/photos/8.svg',
];

/* ─── Category Filter Config ──────────────────────────────────── */
const SIGNAL_CATEGORIES = [
  { key: 'all', label: 'All Signals', icon: BarChart3 },
  { key: 'regulatory', label: 'Regulatory', icon: Shield },
  { key: 'ingredient-science', label: 'Ingredient Science', icon: Beaker },
  { key: 'market-trend', label: 'Market Trends', icon: TrendingUp },
  { key: 'consumer-sentiment', label: 'Consumer Sentiment', icon: Filter },
  { key: 'clinical', label: 'Clinical', icon: Clock },
] as const;

/* ─── Ingredient Trend Mock (DEMO) ────────────────────────────── */
const INGREDIENT_TRENDS: Array<{
  swatch: string;
  name: string;
  shift: string;
  direction: 'up' | 'down' | 'stable';
}> = [
  { swatch: SWATCH_IMAGES[0], name: 'Bakuchiol', shift: '+34%', direction: 'up' as const },
  { swatch: SWATCH_IMAGES[1], name: 'Niacinamide 10%', shift: '+28%', direction: 'up' as const },
  { swatch: SWATCH_IMAGES[2], name: 'Peptide Stacks', shift: '+22%', direction: 'up' as const },
  { swatch: SWATCH_IMAGES[3], name: 'LED 633nm', shift: '+18%', direction: 'up' as const },
  { swatch: SWATCH_IMAGES[4], name: 'Tranexamic Acid', shift: '+15%', direction: 'up' as const },
  { swatch: SWATCH_IMAGES[5], name: 'Exosome Therapy', shift: 'New', direction: 'stable' as const },
];

/* ─── Utils ───────────────────────────────────────────────────── */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function DirectionIcon({ dir }: { dir: string }) {
  if (dir === 'up') return <TrendingUp className="w-4 h-4 text-signal-up" />;
  if (dir === 'down') return <TrendingDown className="w-4 h-4 text-signal-down" />;
  return <Minus className="w-4 h-4 text-graphite/40" />;
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Intelligence() {
  const { signals, isLive, loading } = useIntelligence();
  const {
    totalFeeds,
    totalSignals,
    enabledFeeds,
    avgConfidence,
    lastOrchestratorRun,
    isLive: feedsLive,
  } = useDataFeedStats();
  const { stories: editorialStories } = useStories({ limit: 6 });
  const { user } = useAuth();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  /* W15-08: Track signal_viewed when signals load */
  useEffect(() => {
    if (!loading && signals.length > 0) {
      trackSignalViewed(signals.length);
    }
  }, [loading, signals.length]);

  /* ── Category-filtered signals ──────────────────────────────── */
  const filteredSignals = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    let result = signals;

    if (activeCategory !== 'all') {
      result = result.filter(
        (s) =>
          s.category?.toLowerCase().replace(/\s+/g, '-') === activeCategory ||
          s.signal_type?.toLowerCase().replace(/\s+/g, '-') === activeCategory
      );
    }

    if (!normalizedQuery) {
      return result;
    }

    return result.filter((signal) => {
      const fields = [
        signal.title,
        signal.signal_type,
        signal.source,
        signal.source_name,
        ...(signal.related_brands ?? []),
        ...(signal.related_products ?? []),
      ];

      return fields.some((field) =>
        typeof field === 'string' && field.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [signals, activeCategory, searchQuery]);

  /* ── Editorial items (LIVE from stories table) ──────────────── */
  const editorialItems = useMemo(() => {
    if (editorialStories.length > 0) {
      return editorialStories.map((s) => ({
        image: s.hero_image_url || '/images/brand/photos/10.svg',
        label: s.title,
        value: s.category ?? undefined,
      }));
    }
    /* Fallback: DEMO editorial items using brand photos */
    return [
      { image: EDITORIAL_FALLBACK_IMAGES[0], label: 'Bakuchiol adoption acceleration — clinical validation driving demand', value: '+34%' },
      { image: EDITORIAL_FALLBACK_IMAGES[1], label: 'Niacinamide formulation pivot — concentration standardization underway', value: '+28%' },
      { image: EDITORIAL_FALLBACK_IMAGES[2], label: 'Peptide complexity index rising — multi-peptide stacks trending', value: '+22%' },
      { image: EDITORIAL_FALLBACK_IMAGES[3], label: 'Exosome therapy monitoring — early clinical signals emerging', value: 'New' },
    ];
  }, [editorialStories]);

  const confidenceDisplay = avgConfidence === null ? '--' : `${Math.round(avgConfidence)}%`;

  /* ── KPIs ───────────────────────────────────────────────────── */
  const kpis = useMemo(
    () => [
      { id: 'ik1', value: feedsLive ? totalSignals : '--', label: 'Signals Ingested' },
      { id: 'ik2', value: feedsLive ? totalFeeds : '--', label: 'Verified Sources' },
      { id: 'ik3', value: confidenceDisplay, label: 'Avg Confidence' },
      { id: 'ik4', value: feedsLive ? enabledFeeds : '--', label: 'Enabled Feeds' },
    ],
    [feedsLive, totalSignals, totalFeeds, enabledFeeds, confidenceDisplay]
  );

  /* ── Ticker items ───────────────────────────────────────────── */
  const tickerItems = useMemo(
    () =>
      signals.slice(0, 8).map((s) => ({
        tag: s.category || s.signal_type || 'Signal',
        headline: s.title,
        timestamp: timeAgo(s.updated_at),
      })),
    [signals]
  );

  /* ── Table signals ──────────────────────────────────────────── */
  const tableSignals = useMemo(
    () =>
      filteredSignals.slice(0, 15).map((s) => ({
        id: s.id,
        signal_type: s.signal_type,
        title: s.title,
        magnitude: s.magnitude,
        direction: s.direction as 'up' | 'down' | 'stable',
        category: s.category || 'General',
        source: s.source_name || s.source || 'Unknown source',
        updated_at: s.updated_at,
      })),
    [filteredSignals]
  );

  const spotlightTrends = useMemo(() => {
    if (signals.length === 0) {
      return [{ label: 'No live trend data', value: '--', trend: 'stable' as const }];
    }
    return signals.slice(0, 3).map((signal) => ({
      label: signal.title.length > 26 ? `${signal.title.slice(0, 26)}...` : signal.title,
      value: signal.direction === 'stable' ? '0%' : `${signal.direction === 'up' ? '+' : '-'}${Math.abs(signal.magnitude)}%`,
      trend: signal.direction as 'up' | 'down' | 'stable',
    }));
  }, [signals]);

  /* ── Auth-aware CTA targets ─────────────────────────────────── */
  const dashboardHref = user ? '/portal/intelligence' : '/request-access';
  const dashboardLabel = user ? 'Open Intelligence Dashboard' : 'Get Intelligence Access';

  return (
    <>
      <Helmet>
        <title>Beauty Industry Intelligence | Socelle</title>
        <meta
          name="description"
          content="Market signals, ingredient science, clinical citations, and regulatory changes for professional beauty operators. Verified. Timestamped. Scored."
        />
        <meta property="og:title" content="Beauty Industry Intelligence | Socelle" />
        <meta
          property="og:description"
          content="Market signals, ingredient demand, and regulatory changes for professional beauty operators."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={buildCanonical('/intelligence')} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={buildCanonical('/intelligence')} />
      </Helmet>
      <JsonLd data={buildWebPageSchema({
        name: 'Beauty Industry Intelligence',
        description: 'Market signals, ingredient science, clinical citations, and regulatory changes for professional beauty operators.',
        url: buildCanonical('/intelligence'),
      })} />
      <MainNav noSpacer />

      {/* ═══ HERO: Video background with glass overlay ═══════════ */}
      <HeroMediaRail
        videoSrc={HERO_VIDEO}
        poster={HERO_POSTER}
        overlay="dark"
        eyebrow="Beauty Industry Intelligence"
        headline="Every Signal. Verified. Scored. Delivered."
        subtitle="Ingredient demand shifts, clinical citation velocity, regulatory changes, and pricing signals — distilled from verified sources into one feed."
        primaryCTA={{ label: 'Read the Feed', href: '#signal-feed' }}
        secondaryCTA={{ label: dashboardLabel, href: dashboardHref }}
        overlayMetric={{
          value: feedsLive ? totalSignals.toLocaleString() : '--',
          label: 'Signals Ingested Today',
        }}
      />

      {/* ═══ NEWS TICKER ══════════════════════════════════════════ */}
      <NewsTicker
        items={
          tickerItems.length > 0
            ? tickerItems
            : [
                { tag: 'Feed Status', headline: 'No live signal headlines available yet', timestamp: 'now' },
              ]
        }
        speed={35}
      />

      {/* ═══ PREVIEW BANNER (when not live) ═══════════════════════ */}
      {!isLive && (
        <div className="bg-signal-warn/10 text-signal-warn text-xs font-medium px-4 py-2 text-center">
          PREVIEW — Live intelligence appears once feeds are enabled and market signals are ingested.
        </div>
      )}

      {/* ═══ KPI STRIP ════════════════════════════════════════════ */}
      <KPIStrip kpis={kpis} title="Pulse — Real Time" />

      {/* ═══ SIGNAL INFRASTRUCTURE STATS ══════════════════════════ */}
      <BigStatBanner
        backgroundImage={LAB_IMAGE}
        eyebrow="Signal Infrastructure"
        stats={[
          { value: feedsLive ? totalSignals.toLocaleString() : '--', label: 'Daily Signals' },
          { value: feedsLive ? totalFeeds.toString() : '--', label: 'Verified Sources' },
          { value: confidenceDisplay, label: 'Avg Confidence Score' },
          { value: lastOrchestratorRun ? timeAgo(lastOrchestratorRun) : '--', label: 'Last Feed Run' },
        ]}
      />

      {/* ═══ CATEGORY FILTER PILLS ════════════════════════════════ */}
      <section id="signal-feed" className="bg-mn-bg pt-14 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-eyebrow text-accent mb-3 block">Live Signal Feed</span>
            <h2 className="text-section text-graphite">Active Market Signals</h2>
            {!isLive && (
              <span className="inline-block mt-2 text-xs font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">
                DEMO
              </span>
            )}
          </div>

          <div className="max-w-xl mx-auto mb-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/35" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, type, brands, ingredients, or source..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-graphite/12 bg-white text-sm font-sans text-graphite placeholder:text-graphite/40 focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {SIGNAL_CATEGORIES.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                  ${
                    activeCategory === key
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-white text-graphite/70 hover:bg-mn-surface hover:text-graphite border border-graphite/10'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Signal count */}
          <p className="text-center text-graphite/50 text-sm mb-2">
            {loading
              ? 'Loading signals\u2026'
              : `${filteredSignals.length} signal${filteredSignals.length !== 1 ? 's' : ''} ${
                  searchQuery.trim()
                    ? `matching "${searchQuery.trim()}"`
                    : activeCategory !== 'all'
                      ? `in ${SIGNAL_CATEGORIES.find((c) => c.key === activeCategory)?.label ?? activeCategory}`
                      : 'active'
                }`}
          </p>
        </div>
      </section>

      {/* ═══ SIGNAL TABLE ═════════════════════════════════════════ */}
      {!loading && (
        <SignalTable
          signals={tableSignals}
          title="Active Signals"
          onClickRow={(s) => trackSignalClicked(s.id, s.signal_type)}
        />
      )}

      {/* ═══ INGREDIENT TREND VISUALIZATION (DEMO) ════════════════ */}
      <section className="bg-mn-bg py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-eyebrow text-accent mb-3 block">Ingredient Intelligence</span>
            <h2 className="text-section text-graphite mb-2">Demand Shift Signals</h2>
            <p className="text-graphite/60 max-w-xl mx-auto text-sm">
              Category-level demand signals across professional formulations, clinical protocols,
              and consumer search trends.
            </p>
            <span className="inline-block mt-2 text-xs font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">
              DEMO
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {INGREDIENT_TRENDS.map((trend) => (
              <div
                key={trend.name}
                className="bg-white rounded-2xl border border-graphite/5 p-4 text-center hover:shadow-sm transition-shadow duration-300 group"
              >
                <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-mn-surface">
                  <img
                    src={trend.swatch}
                    alt={trend.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-sm font-medium text-graphite mb-1">{trend.name}</h3>
                <div className="flex items-center justify-center gap-1">
                  <DirectionIcon dir={trend.direction} />
                  <span
                    className={`text-sm font-mono font-medium ${
                      trend.direction === 'up'
                        ? 'text-signal-up'
                        : trend.direction === 'down'
                          ? 'text-signal-down'
                          : 'text-graphite/50'
                    }`}
                  >
                    {trend.shift}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ EDITORIAL SCROLL ═════════════════════════════════════ */}
      <EditorialScroll
        eyebrow={editorialStories.length > 0 ? 'Editorial Intelligence' : 'Ingredient Momentum'}
        headline={editorialStories.length > 0 ? 'Latest Stories' : 'Active Demand Curves'}
        items={editorialItems}
      />

      {/* ═══ PROVENANCE SPOTLIGHT ═════════════════════════════════ */}
      <SpotlightPanel
        image="/images/brand/photos/17.svg"
        imagePosition="left"
        eyebrow="The Feed"
        headline="Every Signal Has a Source. Every Source Has a Score."
        metric={{
          value: confidenceDisplay,
          label: 'Average Confidence',
        }}
        bullets={[
          'Every signal traces to a named, timestamped source',
          'Confidence scores are deterministic — no black-box AI ranking',
          'Provenance tiers: Tier 1 (direct), Tier 2 (public/structured), Tier 3 (aggregated)',
        ]}
        cta={{ label: 'Explore Sources', href: dashboardHref }}
        trending={spotlightTrends}
      />

      {/* ═══ IMAGE MOSAIC ═════════════════════════════════════════ */}
      <ImageMosaic
        images={MOSAIC_IMAGES}
        eyebrow="Intelligence at Scale"
        headline="The Data Behind Every Decision"
        dark
      />

      {/* ═══ CTA SECTION ══════════════════════════════════════════ */}
      <CTASection
        eyebrow="Join the Intelligence Network"
        headline="Access the Full Feed"
        subtitle="Clinical data, market signals, and brand intelligence — structured for professionals who refuse to buy blind."
        primaryCTA={{ label: dashboardLabel, href: dashboardHref }}
      />

      {/* ═══ STICKY CONVERSION BAR ════════════════════════════════ */}
      <StickyConversionBar />

      {/* ═══ SITE FOOTER ═════════════════════════════════════════ */}
      <SiteFooter />
    </>
  );
}
