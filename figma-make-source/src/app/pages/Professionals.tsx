import { HeroMediaRail } from '../components/modules/HeroMediaRail';
import { SpotlightPanel } from '../components/modules/SpotlightPanel';
import { KPIStrip } from '../components/modules/KPIStrip';
import { CTASection } from '../components/modules/CTASection';
import { BigStatBanner } from '../components/modules/BigStatBanner';
import { FeaturedCardGrid } from '../components/modules/FeaturedCardGrid';
import { EditorialScroll } from '../components/modules/EditorialScroll';
import { IMAGES } from '../data/images';

const ago = (minutes: number) => new Date(Date.now() - minutes * 60 * 1000);

const proKPIs = [
  { id: 'pk1', value: 18423, unit: '', label: 'Active Practitioners', delta: 8.7, confidence: 94, updatedAt: ago(5) },
  { id: 'pk2', value: 23, unit: '%', label: 'Avg Cost Reduction', delta: 3.2, confidence: 91, updatedAt: ago(12) },
  { id: 'pk3', value: 4.8, unit: '/5', label: 'Practitioner Satisfaction', delta: 0.3, confidence: 96, updatedAt: ago(8) },
  { id: 'pk4', value: 342, unit: '', label: 'Data Sources', delta: 5.2, confidence: 93, updatedAt: ago(15) },
];

export function Professionals() {
  return (
    <>
      <HeroMediaRail
        image={IMAGES.heroProfessionals}
        eyebrow="For Practitioners"
        headline="Know What to Buy. Know When. Know Why."
        subtitle="Ingredient demand data, clinical adoption curves, and competitive pricing — structured for medspa owners and estheticians who refuse to buy blind."
        primaryCTA={{ label: 'Request Practitioner Access', href: '#' }}
        secondaryCTA={{ label: 'Watch the Walkthrough', href: '#' }}
        overlayMetric={{ value: '18.4K', label: 'Practitioners Inside' }}
      />

      {/* Giant impact stats */}
      <BigStatBanner
        backgroundImage={IMAGES.spaInterior}
        eyebrow="Practitioner Outcomes"
        stats={[
          { value: '23%', label: 'Avg Cost Reduction' },
          { value: '4.8', label: 'Practitioner Satisfaction' },
          { value: '<48h', label: 'Avg Fulfillment Time' },
          { value: '99.7%', label: 'Order Accuracy' },
        ]}
      />

      <SpotlightPanel
        image={IMAGES.flatlay}
        imagePosition="right"
        eyebrow="Discovery & Evaluation"
        headline="Every SKU, Clinically Profiled"
        metric={{ value: '2,847', label: 'Verified Brands' }}
        bullets={[
          'Search by active, indication, or protocol — every product carries efficacy ratings and clinical citations',
          'Adoption data by region: see what comparable medspas are stocking and re-ordering',
          'Price-drop and supply-constraint alerts, delivered the moment data shifts',
        ]}
        cta={{ label: 'Browse Verified Brands', href: '/brands' }}
      />

      {/* What pros are buying — editorial scroll */}
      <EditorialScroll
        eyebrow="Practitioner Purchasing — This Month"
        headline="Category Rankings by Order Volume"
        items={[
          { image: IMAGES.brandDermatica, label: 'Clinical Skincare — Medical-grade formulations', value: '#1' },
          { image: IMAGES.ledTherapy, label: 'Professional Devices — LED & RF technology', value: '#2' },
          { image: IMAGES.brandPeptideVault, label: 'Peptide Treatments — Anti-aging protocols', value: '#3' },
          { image: IMAGES.brandLumiere, label: 'Botanical Actives — Plant-derived science', value: '#4' },
          { image: IMAGES.retinolSerum, label: 'Retinol Systems — Reformulated delivery', value: '#5' },
          { image: IMAGES.creamMacro, label: 'Sun Protection — Medical-grade SPF', value: '#6' },
        ]}
      />

      <KPIStrip kpis={proKPIs} title="Practitioner Outcomes" />

      <SpotlightPanel
        image={IMAGES.clinicReception}
        imagePosition="left"
        eyebrow="Signal Access"
        headline="The Signal Advantage: See Movement First"
        metric={{ value: '847K', label: 'Signals per Day' }}
        bullets={[
          'Ingredient demand forecasting derived from order patterns, clinical publications, and search velocity',
          'Competitive positioning: what top-performing clinics in your tier are re-ordering this quarter',
          'Custom alerts — price movements, new brand launches, supply disruptions — on your schedule',
        ]}
        cta={{ label: 'Open the Signal Feed', href: '/intelligence' }}
      />

      {/* Success stories — card grid */}
      <FeaturedCardGrid
        eyebrow="Case Studies"
        headline="Outcomes, Documented"
        columns={3}
        cards={[
          {
            id: 'ps1',
            image: IMAGES.spaInterior,
            eyebrow: 'Case Study',
            title: 'Radiance MedSpa — 31% Cost Reduction in 90 Days',
            subtitle: 'Replaced legacy distributor relationships with verified-brand sourcing; timed bulk orders to supply surplus windows.',
            metric: { value: '-31%', label: 'Cost Reduction' },
          },
          {
            id: 'ps2',
            image: IMAGES.executiveWoman,
            eyebrow: 'Case Study',
            title: 'Glow Aesthetics — Treatment Revenue Doubled',
            subtitle: 'Read the peptide demand signal early, launched new protocols 60 days ahead of market, captured first-mover margin.',
            metric: { value: '2x', label: 'Revenue Growth' },
          },
          {
            id: 'ps3',
            image: IMAGES.clinicReception,
            eyebrow: 'Case Study',
            title: 'Pure Skin Clinic — 94% Client Retention',
            subtitle: 'Curated a retention-optimized product portfolio using adoption and re-booking data across 340 comparable clinics.',
            metric: { value: '94%', label: 'Retention' },
          },
        ]}
      />

      <CTASection
        eyebrow="Practitioner Access"
        headline="18,000 Practitioners Are Already Inside."
        subtitle="Applications reviewed weekly. Priority access for medspas with three or more treatment rooms."
        primaryCTA={{ label: 'Request Access', href: '#' }}
        secondaryCTA={{ label: 'See a Walkthrough', href: '#' }}
      />
    </>
  );
}