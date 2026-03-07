import { HeroMediaRail } from '../components/modules/HeroMediaRail';
import { KPIStrip } from '../components/modules/KPIStrip';
import { SpotlightPanel } from '../components/modules/SpotlightPanel';
import { CTASection } from '../components/modules/CTASection';
import { FeaturedCardGrid } from '../components/modules/FeaturedCardGrid';
import { ImageMosaic } from '../components/modules/ImageMosaic';
import { EditorialScroll } from '../components/modules/EditorialScroll';
import { NewsTicker } from '../components/modules/NewsTicker';
import { IMAGES, MOSAIC_SETS } from '../data/images';
import { platformKPIs } from '../data/mock';

export function Home() {
  return (
    <>
      {/* Hero — HeroMediaRail */}
      <HeroMediaRail
        image={IMAGES.heroHome}
        eyebrow="Editorial Intelligence"
        headline="The New Authority in Professional Aesthetics"
        subtitle="Clinical data. Curated brands. Market signals updated every three minutes — for the professionals who shape modern aesthetics."
        primaryCTA={{ label: 'Request Early Access', href: '#' }}
        secondaryCTA={{ label: 'See How It Works', href: '/professionals' }}
        overlayMetric={{ value: '2,847', label: 'Verified Brands' }}
      />

      {/* Live intelligence wire */}
      <NewsTicker
        items={[
          { tag: 'Market Signal', headline: 'Neurotoxin demand surges 23% in Q1 — driven by Gen Z micro-dosing protocols', timestamp: '2m' },
          { tag: 'Brand Intel', headline: 'Revance expands DTC partnerships with 12 new medspa networks across the Southeast', timestamp: '8m' },
          { tag: 'Clinical Data', headline: 'FDA clears next-gen biostimulator collagen pathway — Phase III data exceeds endpoints', timestamp: '14m' },
          { tag: 'Trending', headline: 'Prejuvenation spending by patients under 30 up 41% year-over-year', timestamp: '22m' },
          { tag: 'Breaking', headline: 'Allergan Aesthetics announces reformulated hyaluronic acid filler line for 2026', timestamp: '31m' },
          { tag: 'Regulatory', headline: 'California AB-1742 tightens nurse injector supervision ratios — effective July 1', timestamp: '45m' },
          { tag: 'Event', headline: 'Socelle Intelligence Summit Miami — early-bird registration closes March 28', timestamp: '1h' },
          { tag: 'Market Signal', headline: 'GLP-1 body contouring adjacency drives 18% lift in combination protocol bookings', timestamp: '1h' },
          { tag: 'Brand Intel', headline: 'Korean skincare conglomerate Amorepacific enters professional channel with clinical SKUs', timestamp: '2h' },
          { tag: 'Clinical Data', headline: 'Exosome therapy meta-analysis shows 2.4x improvement in skin quality metrics vs. PRP', timestamp: '3h' },
        ]}
      />

      {/* Platform Intro — SplitFeature */}
      <SpotlightPanel
        image={IMAGES.serum}
        imagePosition="right"
        eyebrow="How It Works"
        headline="Clinical Signals, Translated for Buying Decisions"
        metric={{ value: '342+', label: 'Integrated Data Sources' }}
        bullets={[
          '342 integrated data feeds — ingredient demand, pricing shifts, clinical trial citations — refreshed continuously',
          'Every brand profiled with adoption curves, efficacy validation, and practitioner sentiment',
          'Transparent landed pricing with full compliance provenance on every SKU',
        ]}
        cta={{ label: 'See the Method', href: '/professionals' }}
      />

      {/* Visual mosaic — editorial imagery */}
      <ImageMosaic
        images={MOSAIC_SETS.home}
        eyebrow="The World We Serve"
        headline="Where Science Becomes Ritual"
      />

      {/* Intelligence Strip — Hero KPI Strip */}
      <KPIStrip kpis={platformKPIs} title="Market Pulse" />

      {/* For Professionals — SplitFeature */}
      <SpotlightPanel
        image={IMAGES.injectable}
        imagePosition="left"
        eyebrow="For Practitioners"
        headline="Buy with Conviction. Every Product, Clinically Mapped."
        metric={{ value: '18,423', label: 'Practitioner Buyers' }}
        bullets={[
          'Product-to-protocol matching — surfaced from treatment outcome data, not algorithms guessing',
          'Landed pricing across distributors, updated in real time, with supply status flagged',
          'Efficacy ratings, compliance status, and contraindication data attached to every listing',
        ]}
        cta={{ label: 'The Practitioner View', href: '/professionals' }}
      />

      {/* Trending categories — editorial scroll */}
      <EditorialScroll
        eyebrow="Market Momentum"
        headline="Where Demand Is Heading"
        items={[
          { image: IMAGES.brandPeptideVault, label: 'Peptide Complexes', value: '+34.2%' },
          { image: IMAGES.retinolSerum, label: 'Retinol Reformulations', value: '+18.7%' },
          { image: IMAGES.ledTherapy, label: 'LED Therapy Devices', value: '+41.6%' },
          { image: IMAGES.brandLumiere, label: 'Botanical Science', value: '+27.4%' },
          { image: IMAGES.creamMacro, label: 'Medical-Grade SPF', value: '+15.3%' },
          { image: IMAGES.brandAura, label: 'Exosome Therapy', value: '+67.3%' },
        ]}
      />

      {/* For Brands — SplitFeature */}
      <SpotlightPanel
        image={IMAGES.shelfDisplay}
        imagePosition="right"
        eyebrow="For Brands"
        headline="The Practitioners Are Watching. Be Worth Discovering."
        metric={{ value: '87%', label: 'Avg Practitioner Retention' }}
        bullets={[
          'Direct visibility to 18K+ verified medspa and esthetician buyers — no distributor intermediary',
          'Live adoption curves and competitive positioning, updated as practitioners re-order',
          'Your clinical narrative — efficacy data, trial results, protocol fit — told with editorial precision',
        ]}
        cta={{ label: 'The Brand View', href: '/brands' }}
      />

      {/* Featured brands — card grid */}
      <FeaturedCardGrid
        eyebrow="Editors' Selection"
        headline="Brands Worth Knowing This Month"
        columns={3}
        cards={[
          {
            id: 'fc1',
            image: IMAGES.brandDermatica,
            eyebrow: 'Clinical Skincare',
            title: 'Dermatica Pro',
            subtitle: 'Medical-grade formulations — 87% adoption across verified medspas',
            metric: { value: '87%', label: 'Adoption Rate' },
            badge: "Editor's Pick",
          },
          {
            id: 'fc2',
            image: IMAGES.brandLumiere,
            eyebrow: 'Botanical Science',
            title: 'Lumière Botanicals',
            subtitle: 'Plant-derived actives, clinically validated across 18 treatment protocols',
            metric: { value: '+27%', label: '30d Growth' },
            badge: 'New to Network',
          },
          {
            id: 'fc3',
            image: IMAGES.brandVeridian,
            eyebrow: 'Professional Devices',
            title: 'Veridian Aesthetics',
            subtitle: 'LED and RF devices deployed in 91% of top-tier medspa environments',
            metric: { value: '91%', label: 'Adoption Rate' },
          },
        ]}
      />

      {/* Final CTA */}
      <CTASection
        eyebrow="Early Access"
        headline="The Market Is Moving. Move With It."
        subtitle="2,847 brands and 18,423 practitioners are already inside. Applications reviewed weekly."
        primaryCTA={{ label: 'Request Early Access', href: '#' }}
        secondaryCTA={{ label: 'See How It Works', href: '/professionals' }}
      />
    </>
  );
}
