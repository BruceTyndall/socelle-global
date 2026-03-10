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
import HeroMediaRail from '../../components/public/HeroMediaRail';
import { NewsTicker } from '../../components/modules/NewsTicker';
import { BigStatBanner } from '../../components/modules/BigStatBanner';
import { KPIStrip } from '../../components/modules/KPIStrip';
import { EditorialScroll } from '../../components/modules/EditorialScroll';
import { SpotlightPanel } from '../../components/modules/SpotlightPanel';
import { ImageMosaic } from '../../components/modules/ImageMosaic';
import { CTASection } from '../../components/modules/CTASection';
import { StickyConversionBar } from '../../components/modules/StickyConversionBar';
import IntelligenceFeedSection, { FEED_FILTERS } from '../../components/intelligence/IntelligenceFeedSection';
import ApiStatusRibbon from '../../components/intelligence/ApiStatusRibbon';
import SiteFooter from '../../components/sections/SiteFooter';
import { useIntelligence } from '../../lib/intelligence/useIntelligence';
import type { SignalType } from '../../lib/intelligence/types';
import { useDataFeedStats } from '../../lib/intelligence/useDataFeedStats';
import { useStories } from '../../lib/editorial/useStories';
import { useAuth } from '../../lib/auth';
import { trackSignalViewed } from '../../lib/analytics/funnelEvents';

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

const EDITORIAL_FALLBACK_IMAGES = [
  '/images/brand/photos/2.svg',
  '/images/brand/photos/4.svg',
  '/images/brand/photos/6.svg',
  '/images/brand/photos/8.svg',
];

/* ─── Utils ───────────────────────────────────────────────────── */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/* ═══════════════════════════════════════════════════════════════ */
type VerticalFilter = 'all' | 'medspa' | 'salon' | 'beauty_brand';

const VERTICAL_TABS: { key: VerticalFilter; label: string }[] = [
  { key: 'all',          label: 'All Signals' },
  { key: 'medspa',       label: 'Medspa' },
  { key: 'salon',        label: 'Salon' },
  { key: 'beauty_brand', label: 'Brands' },
];

export default function Intelligence() {
  const [activeVertical, setActiveVertical] = useState<VerticalFilter>('all');
  // INTEL-UI-REMEDIATION-01: lifted filter state — controls server-side signal_type filter
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Derive signalTypes from activeFilter to pass as server-side DB filter
  const activeSignalTypes = useMemo<SignalType[] | undefined>(() => {
    const def = FEED_FILTERS.find((f) => f.key === activeFilter);
    return def?.types && def.types.length > 0 ? def.types : undefined;
  }, [activeFilter]);

  const { signals, isLive, loading, marketPulse } = useIntelligence({
    ...(activeVertical !== 'all' ? { vertical: activeVertical as 'medspa' | 'salon' | 'beauty_brand' } : {}),
    ...(activeSignalTypes ? { signalTypes: activeSignalTypes } : {}),
  });
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

  /* W15-08: Track signal_viewed when signals load */
  useEffect(() => {
    if (!loading && signals.length > 0) {
      trackSignalViewed(signals.length);
    }
  }, [loading, signals.length]);

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
      { id: 'ik4', value: feedsLive ? enabledFeeds : '--', label: 'Active Feeds' },
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

  const spotlightTrends = useMemo(() => {
    if (signals.length === 0) {
      return [{ label: 'No live trend data', value: '--', trend: 'stable' as const }];
    }
    return signals.slice(0, 5).map((signal) => ({
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

      <main id="main-content">
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

      {/* ═══ API SOURCE RIBBON (live only) ════════════════════════ */}
      {isLive && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ApiStatusRibbon showDetailed={false} />
        </div>
      )}

      {/* ═══ VERTICAL TOGGLE ══════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav
          className="flex items-end gap-0 border-b border-graphite/8 overflow-x-auto"
          role="tablist"
          aria-label="Filter signals by vertical"
        >
          {VERTICAL_TABS.map((tab) => {
            const isActive = tab.key === activeVertical;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveVertical(tab.key)}
                className={[
                  'px-5 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200',
                  'border-b-2 -mb-px',
                  isActive
                    ? 'text-graphite border-graphite'
                    : 'text-graphite/40 border-transparent hover:text-graphite/65 hover:border-graphite/20',
                ].join(' ')}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ═══ EDITORIAL SIGNAL FEED ════════════════════════════════ */}
      <IntelligenceFeedSection
        signals={signals}
        loading={loading}
        isLive={isLive}
        marketPulse={marketPulse}
        avgConfidence={avgConfidence}
        lastRunAt={lastOrchestratorRun}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

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

      </main>

      {/* ═══ SITE FOOTER ═════════════════════════════════════════ */}
      <SiteFooter />
    </>
  );
}
