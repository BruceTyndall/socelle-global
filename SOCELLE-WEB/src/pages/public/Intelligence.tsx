import { useEffect } from 'react';
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
import { useIntelligence } from '../../lib/intelligence/useIntelligence';
import { useDataFeedStats } from '../../lib/intelligence/useDataFeedStats';
import { useStories } from '../../lib/editorial/useStories';
import { trackSignalViewed, trackSignalClicked } from '../../lib/analytics/funnelEvents';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1762279388988-3f8abcc7dca2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';
const LAB_IMAGE = 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1080';

const MOSAIC_IMAGES = [
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600',
  'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600',
  'https://images.unsplash.com/photo-1573461160327-b450ce3d8e7f?w=600',
  'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600',
  'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600',
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function Intelligence() {
  const { signals, isLive, loading } = useIntelligence();
  const { totalFeeds, totalSignals, avgConfidence, isLive: feedsLive } = useDataFeedStats();
  const { stories: editorialStories } = useStories({ limit: 6 });

  // W15-08: Track signal_viewed when signals load
  useEffect(() => {
    if (!loading && signals.length > 0) {
      trackSignalViewed(signals.length);
    }
  }, [loading, signals.length]);

  // W15-05: Map published stories to EditorialScroll items (LIVE from stories table)
  const editorialItems = editorialStories.length > 0
    ? editorialStories.map((s) => ({
        image: s.hero_image_url || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
        label: s.title,
        value: s.category ?? undefined,
        href: `/stories/${s.slug}`,
      }))
    : undefined; // undefined = fall back to hardcoded below

  const kpis = [
    { id: 'ik1', value: feedsLive ? totalSignals : 847000, label: 'Daily Signals', delta: 12.3, isLive: feedsLive },
    { id: 'ik2', value: feedsLive ? totalFeeds : 342, label: 'Verified Sources', delta: 5.2, isLive: feedsLive },
    { id: 'ik3', value: feedsLive ? Math.round(avgConfidence) : 96, label: 'Avg Confidence %', delta: 0.8, isLive: feedsLive },
    { id: 'ik4', value: 3, label: 'Latency (min)', delta: -0.5, isLive: feedsLive },
  ];

  const tickerItems = signals.slice(0, 8).map((s) => ({
    tag: s.category || s.signal_type || 'Signal',
    headline: s.title,
    timestamp: timeAgo(s.updated_at),
  }));

  const tableSignals = signals.slice(0, 15).map((s) => ({
    id: s.id,
    signal_type: s.signal_type,
    title: s.title,
    magnitude: s.magnitude,
    direction: s.direction as 'up' | 'down' | 'stable',
    category: s.category || 'General',
    source: s.source || 'Socelle Intelligence',
    updated_at: s.updated_at,
  }));

  return (
    <>
      <HeroMediaRail
        image={HERO_IMAGE}
        eyebrow="Live Intelligence"
        headline="847K Signals. Every Day. Interpreted."
        subtitle="Ingredient demand surges, pricing shifts, clinical citation velocity — distilled from verified sources into one feed."
        primaryCTA={{ label: 'Read the Feed', href: '/intelligence' }}
        secondaryCTA={{ label: 'Set Up Alerts', href: '/request-access' }}
        overlayMetric={{ value: feedsLive ? totalSignals.toLocaleString() : '847K', label: 'Signals Ingested Today' }}
      />

      <NewsTicker
        items={tickerItems.length > 0 ? tickerItems : [
          { tag: 'Market Signal', headline: 'Retinol alternative demand surges 34% in Q1', timestamp: '3m' },
          { tag: 'Clinical', headline: 'LED panel efficacy meta-analysis published', timestamp: '14m' },
          { tag: 'Pricing', headline: 'HA filler wholesale cost adjusts across distributors', timestamp: '19m' },
        ]}
        speed={35}
      />

      <BigStatBanner
        backgroundImage={LAB_IMAGE}
        eyebrow="Signal Infrastructure"
        stats={[
          { value: feedsLive ? totalSignals.toLocaleString() : '847K', label: 'Daily Signals' },
          { value: feedsLive ? totalFeeds.toString() : '342', label: 'Verified Sources' },
          { value: feedsLive ? `${Math.round(avgConfidence)}%` : '96%', label: 'Avg Confidence Score' },
          { value: '<3m', label: 'Latency' },
        ]}
      />

      <KPIStrip kpis={kpis} title="Pulse — Real Time" />

      <EditorialScroll
        eyebrow={editorialItems ? 'Editorial Intelligence' : 'Ingredient Momentum'}
        headline={editorialItems ? 'Latest Stories' : 'Active Demand Curves'}
        items={editorialItems ?? [
          { image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', label: 'Bakuchiol adoption acceleration — clinical validation driving demand', value: '+34%' },
          { image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400', label: 'Niacinamide formulation pivot — concentration standardization underway', value: '+28%' },
          { image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', label: 'Peptide complexity index rising — multi-peptide stacks trending', value: '+22%' },
          { image: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=400', label: 'Exosome therapy monitoring — early clinical signals emerging', value: 'New' },
        ]}
      />

      <SpotlightPanel
        image="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800"
        imagePosition="left"
        eyebrow="The Feed"
        headline="Every Signal Has a Source. Every Source Has a Score."
        metric={{ value: feedsLive ? `${Math.round(avgConfidence)}%` : '96%', label: 'Average Confidence' }}
        bullets={[
          'Every signal traces to a named, timestamped source',
          'Confidence scores are deterministic — no black-box AI ranking',
          'Provenance tiers: Tier 1 (direct), Tier 2 (public/structured), Tier 3 (aggregated)',
        ]}
        cta={{ label: 'Explore Sources', href: '/request-access' }}
        trending={[
          { label: 'Bakuchiol', delta: '+34%' },
          { label: 'LED 633nm', delta: '+22%' },
          { label: 'Peptide stacks', delta: '+18%' },
        ]}
      />

      {!loading && (
        <SignalTable
          signals={tableSignals}
          title="Active Signals"
          isLive={isLive}
          onClickRow={(s) => trackSignalClicked(s.id, s.signal_type)}
        />
      )}

      <ImageMosaic
        images={MOSAIC_IMAGES}
        eyebrow="Intelligence at Scale"
        headline="The Data Behind Every Decision"
        dark
      />

      <CTASection
        eyebrow="Join the Intelligence Network"
        headline="Access the Full Feed"
        subtitle="Clinical data, market signals, and brand intelligence — structured for professionals who refuse to buy blind."
        primaryCTA={{ label: 'Request Access', href: '/request-access' }}
      />

      <StickyConversionBar />
    </>
  );
}
