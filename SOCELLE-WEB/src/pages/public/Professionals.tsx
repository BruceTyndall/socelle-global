import HeroMediaRail from '../../components/public/HeroMediaRail';
import { KPIStrip } from '../../components/modules/KPIStrip';
import { SpotlightPanel } from '../../components/modules/SpotlightPanel';
import { BigStatBanner } from '../../components/modules/BigStatBanner';
import { FeaturedCardGrid } from '../../components/modules/FeaturedCardGrid';
import { EditorialScroll } from '../../components/modules/EditorialScroll';
import { CTASection } from '../../components/modules/CTASection';
import { StickyConversionBar } from '../../components/modules/StickyConversionBar';
import { usePlatformStats } from '../../lib/usePlatformStats';
import { useDataFeedStats } from '../../lib/intelligence/useDataFeedStats';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1601839777132-b3f4e455c369?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';

export default function Professionals() {
  const { operatorsCount, signalsCount, protocolsCount, loading: statsLoading } = usePlatformStats();
  const { totalFeeds, avgConfidence, isLive: feedsLive } = useDataFeedStats();

  const proKPIs = [
    { id: 'pk1', value: statsLoading ? 18423 : operatorsCount, label: 'Active Practitioners', delta: 8.7, isLive: !statsLoading },
    { id: 'pk2', value: 23, label: 'Avg Cost Reduction %', delta: 3.2, isLive: false },
    { id: 'pk3', value: 4.8, label: 'Practitioner Satisfaction', delta: 0.3, isLive: false },
    { id: 'pk4', value: feedsLive ? totalFeeds : 342, label: 'Data Sources', delta: 5.2, isLive: feedsLive },
  ];

  return (
    <>
      <HeroMediaRail
        image={HERO_IMAGE}
        eyebrow="For Practitioners"
        headline="Know What to Buy. Know When. Know Why."
        subtitle="Ingredient demand data, clinical adoption curves, and competitive pricing — structured for medspa owners and estheticians who refuse to buy blind."
        primaryCTA={{ label: 'Request Practitioner Access', href: '/request-access' }}
        secondaryCTA={{ label: 'View Intelligence', href: '/intelligence' }}
        overlayMetric={{ value: statsLoading ? '18,423' : operatorsCount.toLocaleString(), label: 'Active Practitioners' }}
      />

      <KPIStrip kpis={proKPIs} title="Practitioner Network — Live" />

      <SpotlightPanel
        image="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800"
        imagePosition="right"
        eyebrow="Intelligence Layer"
        headline="Your Buying Decisions, Backed by Data"
        metric={{ value: feedsLive ? totalFeeds.toString() + '+' : '342+', label: 'Active Data Feeds' }}
        bullets={[
          'Ingredient demand signals refreshed continuously from verified clinical and market sources',
          'Brand adoption data by region: see what comparable medspas are stocking and re-ordering',
          'Price-drop and supply-constraint alerts, delivered the moment data shifts',
        ]}
        cta={{ label: 'Browse Verified Brands', href: '/brands' }}
      />

      <SpotlightPanel
        image="https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800"
        imagePosition="left"
        eyebrow="Protocols"
        headline="Evidence-Based Treatment Protocols"
        metric={{ value: statsLoading ? '47' : protocolsCount.toString(), label: 'Active Protocols' }}
        bullets={[
          'Step-by-step treatment protocols validated by clinical evidence and peer outcomes',
          'Adoption tracking shows which protocols are gaining traction in your region',
          'Product pairing intelligence links protocols to the highest-performing SKUs',
        ]}
        cta={{ label: 'Explore Protocols', href: '/protocols' }}
      />

      <BigStatBanner
        eyebrow="Network Scale"
        stats={[
          { value: statsLoading ? '18,423' : operatorsCount.toLocaleString(), label: 'Active Practitioners' },
          { value: feedsLive ? `${Math.round(avgConfidence)}%` : '96%', label: 'Signal Confidence' },
          { value: '23%', label: 'Avg Cost Reduction' },
          { value: '<3m', label: 'Data Latency' },
        ]}
      />

      <FeaturedCardGrid
        eyebrow="Popular With Practitioners"
        headline="What Your Peers Are Exploring"
        columns={3}
        cards={[
          { id: 'p1', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', eyebrow: 'Clinical Skincare', title: 'Medical-Grade Formulations', subtitle: 'Professional-only active concentrations with clinical backing', metric: { value: '#1', label: 'category' }, href: '/brands' },
          { id: 'p2', image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400', eyebrow: 'Device Intelligence', title: 'LED & Light Therapy', subtitle: 'Wavelength comparison data across 40+ professional devices', metric: { value: '+41%', label: 'demand' }, href: '/intelligence' },
          { id: 'p3', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', eyebrow: 'Injectable Trends', title: 'Neurotoxin & Filler Signals', subtitle: 'Practitioner sentiment, pricing shifts, and brand adoption curves', metric: { value: '+18%', label: 'volume' }, href: '/intelligence' },
        ]}
      />

      <EditorialScroll
        eyebrow="Practitioner Purchasing — This Month"
        headline="Category Rankings by Order Volume"
        items={[
          { image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', label: 'Clinical Skincare — Medical-grade formulations', value: '#1' },
          { image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400', label: 'LED Therapy — Light-based treatment devices', value: '#2' },
          { image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', label: 'Injectable Aesthetics — Neurotoxin & filler', value: '#3' },
          { image: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=400', label: 'Body Contouring — Non-invasive sculpting', value: '#4' },
        ]}
      />

      <CTASection
        eyebrow="Built for Practitioners"
        headline="Stop Buying Blind"
        subtitle="Access the signals and data that top practitioners use to make better purchasing decisions."
        primaryCTA={{ label: 'Request Access', href: '/request-access' }}
      />

      <StickyConversionBar />
    </>
  );
}
