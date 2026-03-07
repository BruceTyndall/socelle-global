import HeroMediaRail from '../../components/public/HeroMediaRail';
import { NewsTicker } from '../../components/modules/NewsTicker';
import { SpotlightPanel } from '../../components/modules/SpotlightPanel';
import { ImageMosaic } from '../../components/modules/ImageMosaic';
import { KPIStrip } from '../../components/modules/KPIStrip';
import { FeaturedCardGrid } from '../../components/modules/FeaturedCardGrid';
import { EditorialScroll } from '../../components/modules/EditorialScroll';
import { CTASection } from '../../components/modules/CTASection';
import { StickyConversionBar } from '../../components/modules/StickyConversionBar';
import { usePlatformStats } from '../../lib/usePlatformStats';
import { useDataFeedStats } from '../../lib/intelligence/useDataFeedStats';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1714648775477-a15cc5aed21f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';

const MOSAIC_IMAGES = [
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600',
  'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600',
  'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600',
  'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600',
  'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600',
];

const EDITORIAL_ITEMS = [
  { image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', label: 'Clinical Skincare — Medical-grade formulations', value: '#1' },
  { image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400', label: 'LED Therapy — Light-based treatment protocols', value: '#2' },
  { image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', label: 'Injectable Aesthetics — Neurotoxin & filler trends', value: '#3' },
  { image: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=400', label: 'Body Contouring — Non-invasive sculpting demand', value: '#4' },
];

export default function Home() {
  const { brandsCount, signalsCount, loading: statsLoading } = usePlatformStats();
  const { totalFeeds, totalSignals, avgConfidence, isLive: feedsLive } = useDataFeedStats();

  const kpis = [
    { id: 'k1', value: feedsLive ? totalSignals : 847000, label: 'Signals Tracked', delta: 12.3, isLive: feedsLive },
    { id: 'k2', value: feedsLive ? totalFeeds : 342, label: 'Data Sources', delta: 5.2, isLive: feedsLive },
    { id: 'k3', value: feedsLive ? Math.round(avgConfidence) : 96, label: 'Avg Confidence %', delta: 0.8, isLive: feedsLive },
    { id: 'k4', value: statsLoading ? 2847 : brandsCount, label: 'Verified Brands', delta: 3.1, isLive: !statsLoading },
  ];

  return (
    <>
      <HeroMediaRail
        image={HERO_IMAGE}
        eyebrow="Editorial Intelligence"
        headline="The New Authority in Professional Aesthetics"
        subtitle="Clinical data. Curated brands. Market signals updated every three minutes — for the professionals who shape modern aesthetics."
        primaryCTA={{ label: 'Request Early Access', href: '/request-access' }}
        secondaryCTA={{ label: 'See How It Works', href: '/professionals' }}
        overlayMetric={{ value: statsLoading ? '2,847' : brandsCount.toLocaleString(), label: 'Verified Brands' }}
      />

      <NewsTicker
        items={[
          { tag: 'Market Signal', headline: 'Retinol alternative demand surges 34% in Q1 — bakuchiol leads', timestamp: '3m' },
          { tag: 'Brand Intel', headline: 'SkinCeuticals reformulates C E Ferulic — practitioners report texture shift', timestamp: '8m' },
          { tag: 'Clinical', headline: 'LED panel efficacy meta-analysis: 633nm up 22% vs baseline', timestamp: '14m' },
          { tag: 'Pricing', headline: 'Hyaluronic acid filler wholesale cost down 8% — three distributors adjust', timestamp: '19m' },
          { tag: 'Regulatory', headline: 'California AB-1742 tightens nurse injector supervision ratios', timestamp: '31m' },
          { tag: 'Event', headline: 'Socelle Intelligence Summit Miami — early-bird registration now open', timestamp: '45m' },
        ]}
      />

      <SpotlightPanel
        image="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800"
        imagePosition="right"
        eyebrow="How It Works"
        headline="Clinical Signals, Translated for Buying Decisions"
        metric={{ value: feedsLive ? totalFeeds.toString() + '+' : '342+', label: 'Integrated Data Sources' }}
        bullets={[
          'Integrated data feeds — ingredient demand, pricing shifts, clinical trial citations — refreshed continuously',
          'Every brand profiled with adoption curves, efficacy validation, and practitioner sentiment',
          'Transparent landed pricing with full compliance provenance on every SKU',
        ]}
        cta={{ label: 'See the Method', href: '/professionals' }}
      />

      <ImageMosaic
        images={MOSAIC_IMAGES}
        eyebrow="The World We Serve"
        headline="Where Science Becomes Ritual"
      />

      <KPIStrip kpis={kpis} title="Market Pulse" />

      <FeaturedCardGrid
        eyebrow="Featured Intelligence"
        headline="This Week's Highlights"
        columns={3}
        cards={[
          { id: 'f1', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', eyebrow: 'Ingredient Intel', title: 'Peptide Innovation Wave', subtitle: 'Clinical-grade peptide adoption up 28% across independent medspas', metric: { value: '+28%', label: 'YoY adoption' }, href: '/intelligence' },
          { id: 'f2', image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400', eyebrow: 'Market Signal', title: 'LED Protocol Expansion', subtitle: 'Near-infrared wavelength demand growing faster than visible spectrum devices', metric: { value: '+41%', label: 'demand growth' }, href: '/intelligence' },
          { id: 'f3', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', eyebrow: 'Brand Watch', title: 'Clean Beauty Certification', subtitle: 'Third-party validation now required by 67% of buyers before first order', badge: 'Trending', href: '/brands' },
        ]}
      />

      <EditorialScroll
        eyebrow="Category Rankings"
        headline="What Professionals Are Buying"
        items={EDITORIAL_ITEMS}
      />

      <CTASection
        eyebrow="Join the Intelligence Network"
        headline="See What Others Can't"
        subtitle="Access the signals, data, and brand intelligence that top practitioners use to make better buying decisions."
        primaryCTA={{ label: 'Request Access', href: '/request-access' }}
      />

      <StickyConversionBar />
    </>
  );
}
