import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, ChevronRight, Activity, ShieldCheck, Sparkles, TrendingUp, ChevronDown } from 'lucide-react';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import WordReveal from '../../components/motion/WordReveal';
import SiteFooter from '../../components/sections/SiteFooter';
import DevOnlyMasterLinks from '../../components/DevOnlyMasterLinks';
import { supabase } from '../../lib/supabase';

/* ━━ DEMO FALLBACK — market_signals fetch fallback (W10-07 complete) ━━━━━━━━
   STATUS: Live data fetched from market_signals table.
   These values display while loading or when DB is unavailable. */
const INTELLIGENCE_SIGNALS = [
  { id: '1', label: 'Polynucleotides', value: '+42%', trend: 'up', confidence: 'High', updated: 'Demo', insight: 'Overtaking exosome demand in Tier 1 cities.' },
  { id: '2', label: 'Average Cart Value', value: '$1,294', trend: 'up', confidence: 'Verified', updated: 'Demo', insight: 'Top quartile operators up 18% YoY.' },
  { id: '3', label: 'Aggressive Peels', value: '-12%', trend: 'down', confidence: 'Moderate', updated: 'Demo', insight: 'Shifting towards energy-based devices.' },
  { id: '4', label: 'Barrier Repair', value: '+88%', trend: 'up', confidence: 'High', updated: 'Demo', insight: 'Dominating post-treatment protocols.' },
];

/* ━━ 4. UI Engineer (Liquid Glass Specialist) ━━━━━━━━━━━━━━━━━
   Primitive components for the Liquid Glass look */
const GlassChip = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-3 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-xs font-medium tracking-wide flex items-center gap-2 ${className}`}>
    {children}
  </div>
);

const GlassCard = ({ children, className = '', tone = 'light' }: { children: React.ReactNode; className?: string; tone?: 'light' | 'dark' }) => (
  <div className={`relative overflow-hidden rounded-[32px] p-8 md:p-12 transition-all duration-700 ease-cinematic group ${tone === 'dark'
      ? 'bg-[#29120f]/90 border-[#f8f6f2]/10 text-[#f8f6f2]'
      : 'bg-white/60 border-white text-[#47201c]'
    } border shadow-glass hover:shadow-glass-hover backdrop-blur-glass ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-overlay" />
    <div className="relative z-10">{children}</div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   HOME PAGE — Warm Cocoa & Liquid Glass Redesign
   ═══════════════════════════════════════════════════════════════ */
export default function PublicHome() {
  const [signals, setSignals] = useState(INTELLIGENCE_SIGNALS);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function fetchSignals() {
      const { data, error } = await supabase
        .from('market_signals')
        .select('id, title, description, magnitude, direction, source, updated_at')
        .order('updated_at', { ascending: false })
        .limit(4);

      if (!error && data && data.length >= 4) {
        setSignals(
          data.map((row, i) => ({
            id: row.id ?? String(i + 1),
            label: row.title,
            value: `${row.direction === 'down' ? '-' : '+'}${Math.abs(row.magnitude)}%`,
            trend: (row.direction === 'stable' ? 'up' : row.direction) as 'up' | 'down',
            confidence: row.source ?? 'Verified',
            updated: new Date(row.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            insight: row.description,
          }))
        );
        setIsLive(true);
      }
    }
    void fetchSignals();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-page-main)] font-sans antialiased selection:bg-[#47201c] selection:text-[#f8f6f2]">
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
        <div className="absolute inset-0 w-full h-full bg-[#29120f]">
          <video
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity scale-105 animate-ken-burns"
            src="/videos/dropper.mp4"
            poster="/images/hero-poster.webp"
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          />
          {/* Aesthetic grading gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-page-main)] via-[var(--bg-page-main)]/80 to-transparent" />
        </div>

        <div className="relative z-10 section-container w-full flex flex-col items-center text-center px-4">
          <BlockReveal className="mb-8 delay-100">
            {/* 7. Copy Director: Intelligence-first framing */}
            <GlassChip className="text-[var(--color-primary-cocoa)] border-[var(--color-primary-cocoa)]/20 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Intelligence Platform 2.0
            </GlassChip>
          </BlockReveal>

          <WordReveal
            text="Market Truth for Aesthetic Leaders."
            as="h1"
            className="max-w-4xl mb-6 justify-center"
            wordClassName="font-serif font-light text-hero text-[var(--color-primary-cocoa)] tracking-tight leading-[1.05]"
          />

          <BlockReveal delay={400} className="max-w-2xl mb-12">
            <p className="text-xl md:text-2xl text-[var(--color-primary-cocoa)]/70 font-sans font-light leading-relaxed">
              Stop guessing. Procure, prescribe, and scale backed by real-time clinical data and verified purchasing intelligence.
            </p>
          </BlockReveal>

          <BlockReveal delay={600}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                className="btn group"
                data-variant="primary"
                data-tone="light"
                data-size="large"
                onClick={() => window.location.href = '/intelligence'}
              >
                <span className="btn-inner">
                  <span className="btn-pill font-medium tracking-wide">Enter the Platform</span>
                </span>
              </button>

              <Link to="/request-access" className="px-8 py-[18px] rounded-[30px] border border-[var(--color-primary-cocoa)]/20 text-[var(--color-primary-cocoa)] font-medium bg-transparent hover:bg-[var(--color-primary-cocoa)]/5 transition-all duration-300">
                Request Access
              </Link>
            </div>
          </BlockReveal>
        </div>

        {/* 2. Motion Designer: Subtle scroll cue */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
          <span className="text-[10px] uppercase tracking-widest font-medium text-[var(--color-primary-cocoa)]">Scroll</span>
          <ChevronDown className="w-4 h-4 text-[var(--color-primary-cocoa)] animate-bounce" />
        </div>
      </section>

      {/* ━━ 5. Page Composition: TENSION (Live Data Integration) ━━━━━━━━ */}
      <section className="relative py-24 lg:py-32 bg-[var(--bg-page-main)]">
        <div className="section-container">
          <BlockReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div className="max-w-xl">
                <h2 className="font-serif font-light text-4xl md:text-5xl text-[var(--color-primary-cocoa)] leading-tight mb-4">
                  The pulse of professional beauty.
                </h2>
                <p className="text-lg text-[var(--color-primary-cocoa)]/60 font-light">
                  Direct signals pulled from verified wholesale transactions. Not surveys. Not marketing hype.
                </p>
              </div>
              {isLive ? (
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
                  <span className="inline-flex rounded-full h-2 w-2 bg-emerald-400 animate-pulse"></span>
                  Live Intelligence
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm font-medium text-amber-700 bg-amber-50 px-4 py-2 rounded-full border border-amber-200">
                  <span className="inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                  Demo Data — Preview Only
                </div>
              )}
            </div>
          </BlockReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {signals.map((signal, idx) => (
              <BlockReveal key={signal.id} delay={idx * 150}>
                <div className="group bg-white rounded-3xl p-6 border border-[var(--color-primary-cocoa)]/5 shadow-sm hover:shadow-panel transition-all duration-500 hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-cocoa)]/40">
                      {signal.label}
                    </span>
                    <TrendingUp className={`w-4 h-4 ${signal.trend === 'up' ? 'text-emerald-500' : 'text-rose-400'} opacity-80 group-hover:opacity-100 transition-opacity`} />
                  </div>

                  <div className="mb-4">
                    <span className="font-mono text-3xl font-semibold tracking-tight text-[var(--color-primary-cocoa)]">
                      {signal.value}
                    </span>
                  </div>

                  <p className="text-sm text-[var(--color-primary-cocoa)]/70 leading-relaxed mb-6 font-light">
                    {signal.insight}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-[var(--color-primary-cocoa)]/5">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-primary-cocoa)]/40" />
                      <span className="text-[10px] uppercase font-medium tracking-wide text-[var(--color-primary-cocoa)]/40">{signal.confidence}</span>
                    </div>
                    <span className="text-[10px] uppercase font-medium tracking-wide text-[var(--color-primary-cocoa)]/40">{signal.updated}</span>
                  </div>
                </div>
              </BlockReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ 5. Page Composition: PROOF & CAPABILITY ━━━━━━━━━━━━━ */}
      <section className="py-24 lg:py-32 bg-[var(--bg-page-near-white)]">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            {/* Visual Column */}
            <BlockReveal className="order-2 lg:order-1">
              <div className="relative aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl z-10 group">
                {/* 3. Asset Integrator: Premium Cropping & Grading */}
                <img
                  src="/images/platform-preview.webp"
                  alt="Socelle Interface Preview"
                  className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[1.5s] ease-cinematic"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-[#47201c]/10 mix-blend-multiply" />

                {/* 4. UI Engineer: Floating Glass Card */}
                <div className="absolute bottom-6 left-6 right-6">
                  <GlassCard className="!p-6 !rounded-[24px]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[var(--color-primary-cocoa)] flex items-center justify-center">
                        <Activity className="w-5 h-5 text-[#f8f6f2]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold tracking-wide text-[#47201c]">Anomaly Detected</p>
                        <p className="text-xs text-[#47201c]/70 mt-0.5">Exosome reorder velocity +40% in your tier.</p>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </div>
            </BlockReveal>

            {/* Copy Column */}
            <div className="order-1 lg:order-2">
              <BlockReveal>
                <h2 className="font-serif font-light text-4xl md:text-6xl text-[var(--color-primary-cocoa)] leading-[1.1] mb-8">
                  Engineered for the business of aesthetics.
                </h2>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-medium text-[var(--color-primary-cocoa)] mb-2">Peer Benchmarking</h3>
                    <p className="text-[var(--color-primary-cocoa)]/60 font-light leading-relaxed">
                      Compare your menu mix, equipment ROI, and backbar spend against top-performing practices in identical zip code tiers.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-[var(--color-primary-cocoa)] mb-2">Verified Commerce</h3>
                    <p className="text-[var(--color-primary-cocoa)]/60 font-light leading-relaxed">
                      A single intelligent cart for all your brand partners. Transparent pricing, allocation alerts, and data-backed product discovery.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-[var(--color-primary-cocoa)] mb-2">Clinical Protocol Ledger</h3>
                    <p className="text-[var(--color-primary-cocoa)]/60 font-light leading-relaxed">
                      Stop cobbling together treatments. Access our evidence-backed protocol library, mapped to the SKUs you already carry.
                    </p>
                  </div>
                </div>

                <div className="mt-12">
                  <Link to="/how-it-works" className="inline-flex items-center gap-2 text-[var(--color-primary-cocoa)] font-medium hover:opacity-70 transition-opacity">
                    <span className="border-b border-[var(--color-primary-cocoa)] pb-0.5">Explore platform architecture</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </BlockReveal>
            </div>

          </div>
        </div>
      </section>

      {/* ━━ 5. Page Composition: CONVERSION CLOSE ━━━━━━━━━━━━━━━ */}
      <section className="py-24 lg:py-32 px-4">
        <div className="max-w-[1200px] mx-auto">
          <BlockReveal>
            <GlassCard tone="dark" className="text-center !py-24 !px-6 md:!px-16 relative overflow-hidden">
              {/* Subtle background texture pattern */}
              <div
                className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #f8f6f2 1px, transparent 0)', backgroundSize: '32px 32px' }}
              />

              <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
                <ShieldCheck className="w-10 h-10 text-[#f8f6f2]/50 mb-6" />
                <h2 className="font-serif font-light text-4xl md:text-5xl text-[#f8f6f2] mb-6 leading-tight">
                  Join the cohort defining the future of aesthetics.
                </h2>
                <p className="text-lg text-[#f8f6f2]/70 font-light mb-10 max-w-lg mx-auto">
                  Access is currently restricted to licensed medical directors, validated medspa operators, and credentialed aestheticians.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
                  <button
                    className="btn group"
                    data-variant="primary"
                    data-tone="dark"
                    data-size="large"
                    onClick={() => window.location.href = '/request-access'}
                  >
                    <span className="btn-inner bg-[#f8f6f2] text-[#29120f]">
                      <span className="btn-pill font-medium tracking-wide flex items-center gap-2">
                        Apply for Access
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </span>
                  </button>
                  <Link to="/brands" className="px-8 py-4 text-sm font-medium text-[#f8f6f2]/70 hover:text-[#f8f6f2] transition-colors">
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
