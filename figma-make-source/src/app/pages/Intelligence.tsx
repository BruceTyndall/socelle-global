import { HeroMediaRail } from '../components/modules/HeroMediaRail';
import { KPIStrip } from '../components/modules/KPIStrip';
import { SignalTable } from '../components/modules/SignalTable';
import { SpotlightPanel } from '../components/modules/SpotlightPanel';
import { CTASection } from '../components/modules/CTASection';
import { BigStatBanner } from '../components/modules/BigStatBanner';
import { EditorialScroll } from '../components/modules/EditorialScroll';
import { ImageMosaic } from '../components/modules/ImageMosaic';
import { IMAGES, MOSAIC_SETS } from '../data/images';
import { platformKPIs, signals } from '../data/mock';
import { NewsTicker } from '../components/modules/NewsTicker';
import { articles } from '../data/articles';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function Intelligence() {
  return (
    <>
      {/* Hero */}
      <HeroMediaRail
        image={IMAGES.heroIntelligence}
        eyebrow="Live Intelligence"
        headline="847K Signals. Every Day. Interpreted."
        subtitle="Ingredient demand surges, pricing shifts, clinical citation velocity, and competitive re-positioning — distilled from 342 verified sources into one feed."
        primaryCTA={{ label: 'Read the Feed', href: '/intelligence/feed' }}
        secondaryCTA={{ label: 'Set Up Alerts', href: '#' }}
        overlayMetric={{ value: '847K', label: 'Signals Ingested Today' }}
      />

      {/* Live ticker from article data */}
      <NewsTicker
        items={articles.slice(0, 8).map((a) => ({
          tag: a.category,
          headline: a.title,
          timestamp: timeAgo(a.publishedAt),
        }))}
        speed={35}
      />

      {/* Giant stats */}
      <BigStatBanner
        backgroundImage={IMAGES.lab}
        eyebrow="Signal Infrastructure"
        stats={[
          { value: '847K', label: 'Daily Signals' },
          { value: '342', label: 'Verified Sources' },
          { value: '96%', label: 'Avg Confidence Score' },
          { value: '<3m', label: 'Latency' },
        ]}
      />

      {/* KPI Strip */}
      <KPIStrip kpis={platformKPIs} title="Pulse — Real Time" />

      {/* Top trending ingredients — editorial scroll */}
      <EditorialScroll
        eyebrow="Ingredient Momentum"
        headline="Active Demand Curves — This Week"
        items={[
          { image: IMAGES.brandPeptideVault, label: 'Peptide Complexes — 34% demand acceleration across practitioner orders', value: '+34.2%' },
          { image: IMAGES.retinolSerum, label: 'Retinol Reformulations — new encapsulation tech driving clinic adoption', value: '+18.7%' },
          { image: IMAGES.brandLumiere, label: 'Botanical Actives — K-beauty protocol integration accelerating', value: '+27.4%' },
          { image: IMAGES.creamMacro, label: 'Medical-Grade SPF — migration from consumer to professional channels', value: '+15.3%' },
          { image: IMAGES.ledTherapy, label: 'LED Therapy — device spend up 41% across all clinic tiers', value: '+41.6%' },
          { image: IMAGES.brandAura, label: 'Exosome Therapy — emerging category with 67% interest spike', value: '+67.3%' },
        ]}
      />

      {/* Signal Feed */}
      <SignalTable signals={signals} title="Active Signals" />

      {/* Intelligence mosaic */}
      <ImageMosaic
        images={MOSAIC_SETS.intelligence}
        eyebrow="Research & Provenance"
        headline="Where Clinical Evidence Meets Market Behavior"
      />

      {/* Trend Detail — Spotlight */}
      <SpotlightPanel
        image={IMAGES.lab}
        imagePosition="left"
        eyebrow="Signal Deep Dive"
        headline="Peptide Complexes: The Inflection Is Here"
        metric={{ value: '+34.2%', label: '30d Demand Δ' }}
        bullets={[
          'Peptide serums — 34% order volume increase across verified medspas in 30 days',
          'Leading the category: Dermatica Pro, PeptideVault, Aura Clinical',
          'Projected to become the #1 active ingredient category by Q3 2026',
        ]}
        cta={{ label: 'Read the Analysis', href: '#' }}
      />

      {/* CTA */}
      <CTASection
        eyebrow="Go Deeper"
        headline="Read the Market Before It Reads You."
        subtitle="Unlimited signal access, custom threshold alerts, and API integration — for practitioners and brands who need the full picture."
        primaryCTA={{ label: 'Unlock Full Access', href: '#' }}
        secondaryCTA={{ label: "See What's Included", href: '#' }}
      />
    </>
  );
}