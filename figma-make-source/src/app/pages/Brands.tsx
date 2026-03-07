import { useState } from 'react';
import { ChevronRight, TrendingUp, Sparkles } from 'lucide-react';
import { HeroMediaRail } from '../components/modules/HeroMediaRail';
import { SpotlightPanel } from '../components/modules/SpotlightPanel';
import { CTASection } from '../components/modules/CTASection';
import { BigStatBanner } from '../components/modules/BigStatBanner';
import { FeaturedCardGrid } from '../components/modules/FeaturedCardGrid';
import { ImageMosaic } from '../components/modules/ImageMosaic';
import { IMAGES, BRAND_IMAGES, MOSAIC_SETS } from '../data/images';
import { brands, formatTimeAgo, getFreshnessColor } from '../data/mock';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

const CATEGORIES = ['All', 'Clinical Skincare', 'Botanical Science', 'R&D Platform', 'Professional Devices', 'Treatment Systems', 'Ingredients'];

export function Brands() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? brands
    : brands.filter(b => b.category === activeCategory);

  return (
    <>
      <HeroMediaRail
        image={IMAGES.heroBrands}
        eyebrow="Brand Intelligence"
        headline="Verified Brands. Clinical Proof. Live Adoption Data."
        subtitle="Every brand profiled with adoption curves, clinical validation, and practitioner sentiment — updated continuously."
        primaryCTA={{ label: 'Explore the Directory', href: '#brands' }}
        secondaryCTA={{ label: 'Apply as a Brand', href: '#' }}
        overlayMetric={{ value: '2,847', label: 'Verified Brands' }}
      />

      {/* Giant brand stats */}
      <BigStatBanner
        backgroundImage={IMAGES.shelfDisplay}
        eyebrow="Brand Network — Live"
        stats={[
          { value: '2,847', label: 'Brands Verified' },
          { value: '87%', label: 'Avg Practitioner Retention' },
          { value: '94%', label: 'Re-Order Rate (Top Decile)' },
          { value: '24', label: 'New This Month' },
        ]}
      />

      {/* Featured Brands — rich card grid */}
      <FeaturedCardGrid
        eyebrow="Editors' Selection"
        headline="This Month's Selections"
        columns={3}
        cards={[
          {
            id: 'fb1',
            image: IMAGES.brandDermatica,
            eyebrow: 'Clinical Skincare',
            title: 'Dermatica Pro',
            subtitle: 'Medical-grade formulations — 87% adoption across verified medspas',
            metric: { value: '87%', label: 'Adoption Rate' },
            badge: "Editor's Pick",
          },
          {
            id: 'fb2',
            image: IMAGES.brandLumiere,
            eyebrow: 'Botanical Science',
            title: 'Lumière Botanicals',
            subtitle: 'Plant-derived actives, clinically validated across 18 treatment protocols',
            metric: { value: '72%', label: 'Adoption Rate' },
            badge: 'New to Network',
          },
          {
            id: 'fb3',
            image: IMAGES.brandVeridian,
            eyebrow: 'Professional Devices',
            title: 'Veridian Aesthetics',
            subtitle: 'LED and RF devices deployed in 91% of top-tier medspa environments',
            metric: { value: '91%', label: 'Adoption Rate' },
          },
        ]}
      />

      {/* Featured Brand — Spotlight */}
      <SpotlightPanel
        image={IMAGES.brandPackaging}
        imagePosition="left"
        eyebrow="Brand Spotlight"
        headline="Dermatica Pro — Medical-Grade, Practitioner-Proven"
        metric={{ value: '87%', label: 'Medspa Adoption Rate' }}
        bullets={[
          '24 active market signals across peptides, retinoids, and SPF',
          'Top 3 in clinical efficacy ratings for anti-aging treatment lines',
          'Average buyer re-order rate of 94% — highest in category',
        ]}
        cta={{ label: 'Full Brand Profile', href: '#' }}
      />

      {/* Visual brand mosaic */}
      <ImageMosaic
        images={MOSAIC_SETS.brands}
        eyebrow="Visual Index"
        headline="The Products Shaping Practice Today"
      />

      {/* Category Filter + Brand Directory */}
      <section id="brands" className="bg-[#FAF9F7] py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="eyebrow text-[#141418]/50 mb-3 block">Full Directory</span>
            <h2 className="text-[#141418] text-2xl lg:text-3xl mb-8">All Verified Brands</h2>

            {/* Category scroll strip */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-[#3F5465] text-[#F7F5F2]'
                      : 'bg-[#141418]/5 text-[#141418]/60 hover:bg-[#141418]/10 hover:text-[#141418]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Brand cards — large visual grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((brand) => (
              <div
                key={brand.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#141418]/5 hover:border-[#3F5465]/30 transition-all duration-500 group cursor-pointer shadow-sm"
              >
                {/* Brand image */}
                <div className="aspect-[16/10] relative overflow-hidden">
                  <ImageWithFallback
                    src={BRAND_IMAGES[brand.id] || IMAGES.creamTexture}
                    alt={brand.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1F2428]/70 via-transparent to-transparent" />
                  {brand.isNew && (
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-[#3F5465]/90 text-[#F7F5F2] text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-full">
                      <Sparkles className="w-3 h-3" /> New
                    </div>
                  )}
                  {/* Adoption metric overlay */}
                  <div className="absolute bottom-4 left-4">
                    <div className="glass-panel rounded-xl px-4 py-3">
                      <div className="text-[#F7F5F2] text-2xl" style={{ fontFamily: 'var(--font-mono)' }}>
                        {brand.adoption}%
                      </div>
                      <div className="text-[#F7F5F2]/60 text-[10px] tracking-widest uppercase">Adoption Rate</div>
                    </div>
                  </div>
                </div>
                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#141418] text-base">{brand.name}</span>
                    <div className="flex items-center gap-1.5 text-[#5F8A72]">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-xs" style={{ fontFamily: 'var(--font-mono)' }}>{brand.signals}</span>
                    </div>
                  </div>
                  <div className="text-[#141418]/40 text-xs mb-3">{brand.category}</div>
                  <p className="text-[#141418]/50 text-sm mb-3 line-clamp-2">{brand.description}</p>
                  <div className="flex items-center justify-between">
                    <div className={`text-[10px] ${getFreshnessColor(brand.updatedAt)}`} style={{ fontFamily: 'var(--font-mono)' }}>
                      Updated {formatTimeAgo(brand.updatedAt)}
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#141418]/20 group-hover:text-[#141418]/60 transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Brand Applications"
        headline="18,000 Practitioners. One Verified Network."
        subtitle="Verified brands receive live adoption analytics, competitive positioning data, and direct practitioner visibility. Applications reviewed weekly."
        primaryCTA={{ label: 'Submit Application', href: '#' }}
        secondaryCTA={{ label: 'Brand Guidelines', href: '#' }}
      />
    </>
  );
}