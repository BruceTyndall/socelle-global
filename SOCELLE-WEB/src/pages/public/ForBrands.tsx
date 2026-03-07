import HeroMediaRail from '../../components/public/HeroMediaRail';
import { BigStatBanner } from '../../components/modules/BigStatBanner';
import { SpotlightPanel } from '../../components/modules/SpotlightPanel';
import { FeaturedCardGrid } from '../../components/modules/FeaturedCardGrid';
import { ImageMosaic } from '../../components/modules/ImageMosaic';
import { CTASection } from '../../components/modules/CTASection';
import { StickyConversionBar } from '../../components/modules/StickyConversionBar';
import { usePlatformStats } from '../../lib/usePlatformStats';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1598214173466-82d8411951b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';

const MOSAIC_IMAGES = [
  'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600',
  'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600',
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600',
  'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600',
  'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600',
  'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600',
];

export default function ForBrands() {
  const { brandsCount, operatorsCount, loading: statsLoading } = usePlatformStats();

  return (
    <>
      <HeroMediaRail
        image={HERO_IMAGE}
        eyebrow="Brand Intelligence"
        headline="Verified Brands. Clinical Proof. Live Adoption Data."
        subtitle="Every brand profiled with adoption curves, clinical validation, and practitioner sentiment — updated continuously."
        primaryCTA={{ label: 'Explore the Directory', href: '/brands' }}
        secondaryCTA={{ label: 'Apply as a Brand', href: '/request-access' }}
        overlayMetric={{ value: statsLoading ? '2,847' : brandsCount.toLocaleString(), label: 'Verified Brands' }}
      />

      <BigStatBanner
        backgroundImage="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1080"
        eyebrow="Brand Network — Live"
        stats={[
          { value: statsLoading ? '2,847' : brandsCount.toLocaleString(), label: 'Brands Verified' },
          { value: '87%', label: 'Avg Practitioner Retention' },
          { value: '94%', label: 'Re-Order Rate (Top Decile)' },
          { value: '24', label: 'New This Month' },
        ]}
      />

      <SpotlightPanel
        image="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800"
        imagePosition="right"
        eyebrow="For Brand Partners"
        headline="Reach Practitioners Who Buy on Evidence"
        metric={{ value: statsLoading ? '18,423' : operatorsCount.toLocaleString(), label: 'Active Practitioners' }}
        bullets={[
          'Brand profile with clinical validation, adoption curves, and practitioner sentiment',
          'Wholesale pricing intelligence — see competitive positioning in real time',
          'Direct demand signals from practitioners actively searching your category',
        ]}
        cta={{ label: 'Apply as a Brand', href: '/request-access' }}
      />

      <SpotlightPanel
        image="https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800"
        imagePosition="left"
        eyebrow="Intelligence Dashboard"
        headline="Your Brand, Through the Lens of Data"
        metric={{ value: '94%', label: 'Re-Order Rate (Top Decile)' }}
        bullets={[
          'Real-time adoption data: see which practitioners stock your products and their re-order patterns',
          'Competitive intelligence: how your brand compares on price, efficacy perception, and market share',
          'Custom reports delivered monthly with actionable insights for your category',
        ]}
        cta={{ label: 'See a Sample Report', href: '/intelligence' }}
      />

      <FeaturedCardGrid
        eyebrow="Brand Categories"
        headline="Intelligence by Vertical"
        columns={3}
        cards={[
          { id: 'b1', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', eyebrow: 'Clinical Skincare', title: 'Medical-Grade Formulations', subtitle: 'Professional-only active concentrations with clinical backing and efficacy data', metric: { value: '#1', label: 'category' }, href: '/brands' },
          { id: 'b2', image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400', eyebrow: 'Devices & Equipment', title: 'Professional Treatment Devices', subtitle: 'LED panels, RF devices, laser systems — compared by clinical outcomes', metric: { value: '40+', label: 'devices profiled' }, href: '/brands' },
          { id: 'b3', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', eyebrow: 'Injectables', title: 'Neurotoxin & Dermal Fillers', subtitle: 'Practitioner sentiment, pricing intelligence, and brand switching data', metric: { value: '+18%', label: 'market growth' }, href: '/brands' },
        ]}
      />

      <ImageMosaic
        images={MOSAIC_IMAGES}
        eyebrow="The Socelle Network"
        headline="Where Brands Meet Evidence"
      />

      <CTASection
        eyebrow="Partner With Us"
        headline="Put Your Brand in Front of Evidence-Driven Buyers"
        subtitle="Join the intelligence network where practitioners discover, evaluate, and purchase based on data — not marketing."
        primaryCTA={{ label: 'Apply as a Brand Partner', href: '/request-access' }}
      />

      <StickyConversionBar />
    </>
  );
}
