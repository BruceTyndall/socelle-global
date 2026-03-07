import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, ChevronRight, ShieldCheck, Sparkles, ChevronDown } from 'lucide-react';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import WordReveal from '../../components/motion/WordReveal';
import SiteFooter from '../../components/sections/SiteFooter';
import DevOnlyMasterLinks from '../../components/DevOnlyMasterLinks';
import EvidenceStrip from '../../components/public/EvidenceStrip';
import SplitFeature from '../../components/public/SplitFeature';
import { useIntelligence } from '../../lib/intelligence/useIntelligence';

/* ━━ 4. UI Engineer (Liquid Glass Specialist) ━━━━━━━━━━━━━━━━━
   Primitive components for the Liquid Glass look */
const GlassChip = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-3 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-xs font-medium tracking-wide flex items-center gap-2 ${className}`}>
    {children}
  </div>
);

const GlassCard = ({ children, className = '', tone = 'light' }: { children: React.ReactNode; className?: string; tone?: 'light' | 'dark' }) => (
  <div className={`relative overflow-hidden rounded-[32px] p-8 md:p-12 transition-all duration-700 ease-cinematic group ${tone === 'dark'
      ? 'bg-mn-dark/90 border-white/10 text-white'
      : 'bg-white/60 border-white text-graphite'
    } border shadow-glass hover:shadow-glass-hover backdrop-blur-glass ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-overlay" />
    <div className="relative z-10">{children}</div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   HOME PAGE — Pearl Mineral V2 & Liquid Glass (W12-23)
   ═══════════════════════════════════════════════════════════════ */
export default function PublicHome() {
  /* W12-30: Live wire — canonical useIntelligence() replaces inline fetch */
  const { signals, isLive } = useIntelligence();

  return (
    <div className="min-h-screen bg-mn-bg font-sans antialiased selection:bg-graphite selection:text-white">
      {/* ━━ 8. SEO + Structured Data Engineer ━━━━━━━━━━━━━━━━━━━ */}
      <Helmet>
        <title>Socelle — Professional Beauty Intelligence</title>
        <meta name="description" content="Market truth for aesthetic leaders. Scale your clinic or brand with real-time purchasing intelligence, clinical data, and verified insights." />
        <meta property="og:title" content="Socelle — Professional Beauty Intelligence" />
        <meta property="og:description" content="Stop guessing. Procure, prescribe, and scale backed by clinical data and market intelligence." />
        <link rel="canonical" href="https://socelle.com/" />
        {/* Organization JSON-LD */}
        <script type="application/ld+json">{`{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Socelle",
          "url": "https://socelle.com",
          "logo": "https://socelle.com/favicon.svg",
          "sameAs": [
            "https://www.linkedin.com/company/socelle"
          ],
          "description": "The intelligence layer for professional beauty operators and leading aesthetic brands."
        }`}</script>
        {/* SoftwareApplication JSON-LD to declare the platform */}
        <script type="application/ld+json">{`{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Socelle Intelligence Platform",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        }`}</script>
      </Helmet>

      <MainNav />

      {/* ━━ 5. Page Composition: ENTRANCE ━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden pt-20">
        {/* 3. Visual/Art Direction: Responsive Hero Video */}
        <div className="absolute inset-0 w-full h-full bg-mn-dark">
          <video
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity scale-105 animate-ken-burns"
            src="/videos/dropper.mp4"
            poster="/videos/posters/dropper-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          />
          {/* Aesthetic grading gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-mn-bg via-mn-bg/80 to-transparent" />
        </div>

        <div className="relative z-10 section-container w-full flex flex-col items-center text-center px-4">
          <BlockReveal className="mb-8 delay-100">
            {/* 7. Copy Director: Intelligence-first framing */}
            <GlassChip className="text-[#141418] border-[#141418]/20 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Intelligence Platform 2.0
            </GlassChip>
          </BlockReveal>

          <WordReveal
            text="Market Truth for Aesthetic Leaders."
            as="h1"
            className="max-w-4xl mb-6 justify-center"
            wordClassName="font-sans font-light text-hero text-[#141418] tracking-tight leading-[1.05]"
          />

          <BlockReveal delay={400} className="max-w-2xl mb-12">
            <p className="text-xl md:text-2xl text-[#141418]/70 font-sans font-light leading-relaxed">
              Stop guessing. Procure, prescribe, and scale backed by real-time clinical data and verified purchasing intelligence.
            </p>
          </BlockReveal>

          <BlockReveal delay={600}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/intelligence" className="btn-mineral-primary btn-mineral-lg">
                Enter the Platform
              </Link>

              <Link to="/request-access" className="btn-mineral-secondary btn-mineral-lg">
                Request Access
              </Link>
            </div>
          </BlockReveal>
        </div>

        {/* 2. Motion Designer: Subtle scroll cue */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
          <span className="text-[10px] uppercase tracking-widest font-medium text-[#141418]">Scroll</span>
          <ChevronDown className="w-4 h-4 text-[#141418] animate-bounce" />
        </div>
      </section>

      {/* ━━ 5. Page Composition: TENSION (Live Data — Evidence Strip) ━━━━━━━━ */}
      <BlockReveal>
        <section className="relative bg-mn-bg">
          <div className="section-container pt-24 lg:pt-32 pb-8">
            <h2 className="font-sans font-light text-4xl md:text-5xl text-graphite leading-tight mb-4 max-w-xl">
              The pulse of professional beauty.
            </h2>
            <p className="text-lg text-graphite/60 font-light max-w-xl">
              Direct signals pulled from verified wholesale transactions. Not surveys. Not marketing hype.
            </p>
          </div>
        </section>
      </BlockReveal>

      <EvidenceStrip
        title="Market Signals"
        isLive={isLive}
        bg="dark"
        items={signals.slice(0, 4).map(s => ({
          label: s.title,
          value: `${s.direction === 'down' ? '−' : '+'}${Math.abs(s.magnitude)}%`,
          trend: (s.direction === 'stable' ? 'up' : s.direction) as 'up' | 'down',
          source: s.source ?? 'Verified',
        }))}
      />

      {/* ━━ 5. Page Composition: PROOF & CAPABILITY (SplitFeature) ━━━━━━━━━━━━━ */}
      <SplitFeature
        videoSrc="/videos/foundation.mp4"
        poster="/videos/posters/foundation-poster.jpg"
        mediaPosition="left"
        bg="surface"
      >
        <BlockReveal>
          <h2 className="font-sans font-light text-4xl md:text-6xl text-graphite leading-[1.1] mb-8">
            Engineered for the business of aesthetics.
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-medium text-graphite mb-2">Peer Benchmarking</h3>
              <p className="text-graphite/60 font-light leading-relaxed">
                Compare your menu mix, equipment ROI, and backbar spend against top-performing practices in identical zip code tiers.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium text-graphite mb-2">Verified Commerce</h3>
              <p className="text-graphite/60 font-light leading-relaxed">
                A single intelligent cart for all your brand partners. Transparent pricing, allocation alerts, and data-backed product discovery.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium text-graphite mb-2">Clinical Protocol Ledger</h3>
              <p className="text-graphite/60 font-light leading-relaxed">
                Stop cobbling together treatments. Access our evidence-backed protocol library, mapped to the SKUs you already carry.
              </p>
            </div>
          </div>

          <div className="mt-12">
            <Link to="/how-it-works" className="inline-flex items-center gap-2 text-graphite font-medium hover:opacity-70 transition-opacity">
              <span className="border-b border-graphite pb-0.5">Explore platform architecture</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </BlockReveal>
      </SplitFeature>

      {/* ━━ 5. Page Composition: CONVERSION CLOSE ━━━━━━━━━━━━━━━ */}
      <section className="py-24 lg:py-32 px-4">
        <div className="max-w-[1200px] mx-auto">
          <BlockReveal>
            <GlassCard tone="dark" className="text-center !py-24 !px-6 md:!px-16 relative overflow-hidden">
              {/* Subtle background texture pattern */}
              <div
                className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.7) 1px, transparent 0)', backgroundSize: '32px 32px' }}
              />

              <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
                <ShieldCheck className="w-10 h-10 text-white/50 mb-6" />
                <h2 className="font-sans font-light text-4xl md:text-5xl text-white mb-6 leading-tight">
                  Join the cohort defining the future of aesthetics.
                </h2>
                <p className="text-lg text-white/70 font-light mb-10 max-w-lg mx-auto">
                  Access is currently restricted to licensed medical directors, validated medspa operators, and credentialed aestheticians.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
                  <Link to="/request-access" className="btn-mineral-dark btn-mineral-lg inline-flex items-center gap-2">
                    Apply for Access
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <Link to="/brands" className="btn-mineral-ghost">
                    Are you a brand?
                  </Link>
                </div>
              </div>
            </GlassCard>
          </BlockReveal>
        </div>
      </section>

      {/* ━━ 9. QA / Governance: Footers & Dev Tools ━━━━━━━━━━━━ */}
      <SiteFooter />
      <DevOnlyMasterLinks />
    </div>
  );
}
