import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight,
  Lock,
  GraduationCap,
  Search,
  Clock,
  Users,
  Beaker,
  Heart,
  Sparkles,
  Activity,
  Ribbon,
  ChevronDown,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import WordReveal from '../../components/motion/WordReveal';
import SiteFooter from '../../components/sections/SiteFooter';
import { useProtocols, CATEGORY_LABELS, SKILL_LABELS } from '../../lib/protocols/useProtocols';
import type { ProtocolCategory, SkillLevel } from '../../lib/protocols/types';

// ── Category styling (mineral palette) ──────────────────────────────

const CATEGORY_ACCENT: Record<ProtocolCategory, string> = {
  facial:   'text-signal-warn',
  body:     'text-accent',
  wellness: 'text-signal-up',
  clinical: 'text-accent',
  oncology: 'text-signal-down',
};

const SKILL_BADGE: Record<SkillLevel, string> = {
  beginner:     'bg-signal-up/10 text-signal-up',
  intermediate: 'bg-signal-warn/10 text-signal-warn',
  advanced:     'bg-signal-down/10 text-signal-down',
};

const CATEGORY_ICONS: Record<ProtocolCategory, React.ElementType> = {
  facial: Sparkles,
  body: Heart,
  wellness: Activity,
  clinical: Beaker,
  oncology: Ribbon,
};

const CATEGORY_KEYS: (ProtocolCategory | 'all')[] = ['all', 'facial', 'body', 'wellness', 'clinical', 'oncology'];

// ── JSON-LD ─────────────────────────────────────────────────────────

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Treatment Protocols | Socelle',
  description:
    'Evidence-based treatment protocols for professional estheticians, spa operators, and medspa clinicians. Step-by-step procedures with product recommendations and CE credit eligibility.',
  url: 'https://socelle.com/protocols',
  publisher: {
    '@type': 'Organization',
    name: 'Socelle',
    url: 'https://socelle.com',
  },
};

// ── Component ───────────────────────────────────────────────────────

export default function Protocols() {
  const {
    protocols,
    allProtocols,
    filters,
    setCategory,
    setSkillLevel,
    toggleCEEligible,
    setSearch,
  } = useProtocols();

  const totalCE = allProtocols
    .filter((p) => p.ceEligible && p.ceCredits)
    .reduce((sum, p) => sum + (p.ceCredits ?? 0), 0);

  const uniqueCategories = new Set(allProtocols.map((p) => p.category));

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>Treatment Protocols | Socelle</title>
        <meta
          name="description"
          content="Evidence-based treatment protocols for professional estheticians, spa operators, and medspa clinicians. Step-by-step procedures with CE credit eligibility."
        />
        <link rel="canonical" href="https://socelle.com/protocols" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <MainNav />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="section-container">
          <div className="max-w-3xl">
            <BlockReveal>
              <p className="mn-eyebrow mb-5">Protocol Library</p>
            </BlockReveal>
            <WordReveal
              text="Protocol Marketplace"
              as="h1"
              className="font-sans font-semibold text-hero text-graphite leading-tight mb-6"
            />
            <BlockReveal delay={200}>
              <p className="text-graphite/60 font-sans text-body-lg leading-relaxed max-w-2xl">
                Evidence-based, step-by-step treatment protocols built by industry clinicians.
                Each protocol includes product recommendations, timing guides, contraindication
                notes, and CE credit eligibility for continuing education tracking.
              </p>
            </BlockReveal>
          </div>

          {/* Stats bar */}
          <BlockReveal delay={300}>
            <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-[rgba(30,37,43,0.08)]">
              <div>
                <span className="text-metric-md font-sans text-graphite">{allProtocols.length}</span>
                <p className="text-graphite/40 font-sans text-sm mt-0.5">Protocols</p>
              </div>
              <div>
                <span className="text-metric-md font-sans text-accent">{totalCE}</span>
                <p className="text-graphite/40 font-sans text-sm mt-0.5">CE Credits Available</p>
              </div>
              <div>
                <span className="text-metric-md font-sans text-graphite">{uniqueCategories.size}</span>
                <p className="text-graphite/40 font-sans text-sm mt-0.5">Categories</p>
              </div>
            </div>
          </BlockReveal>
        </div>
      </section>

      {/* ── Filter Bar ────────────────────────────────────────────── */}
      <section className="sticky top-14 z-40 bg-white/80 backdrop-blur-lg border-b border-[rgba(30,37,43,0.08)]">
        <div className="section-container py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              {CATEGORY_KEYS.map((cat) => {
                const active = filters.category === cat;
                const Icon = cat !== 'all' ? CATEGORY_ICONS[cat] : undefined;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-sans font-medium transition-all ${
                      active
                        ? 'bg-[#1F2428] text-[#F7F5F2]'
                        : 'bg-mn-surface text-[rgba(30,37,43,0.62)] hover:bg-[rgba(30,37,43,0.08)] hover:text-graphite'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:ml-auto">
              {/* Skill level dropdown */}
              <div className="relative">
                <select
                  value={filters.skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value as SkillLevel | 'all')}
                  className="appearance-none bg-white border border-[rgba(30,37,43,0.12)] rounded-full px-4 py-2 pr-8 text-sm font-sans text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[rgba(30,37,43,0.42)] pointer-events-none" />
              </div>

              {/* CE toggle */}
              <button
                onClick={toggleCEEligible}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-sans font-medium border transition-all ${
                  filters.ceEligible
                    ? 'bg-accent/10 border-accent text-graphite'
                    : 'bg-white border-[rgba(30,37,43,0.12)] text-[rgba(30,37,43,0.62)] hover:border-accent/50'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                CE Eligible
              </button>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(30,37,43,0.42)]" />
                <input
                  type="text"
                  placeholder="Search protocols..."
                  value={filters.search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white border border-[rgba(30,37,43,0.12)] rounded-full text-sm font-sans text-graphite placeholder:text-[rgba(30,37,43,0.35)] focus:outline-none focus:ring-2 focus:ring-accent/30 w-56"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Protocol Grid ─────────────────────────────────────────── */}
      <section className="py-12 lg:py-16">
        <div className="section-container">
          {protocols.length === 0 ? (
            <div className="text-center py-16">
              <Beaker className="w-10 h-10 text-[rgba(30,37,43,0.22)] mx-auto mb-4" />
              <p className="text-[rgba(30,37,43,0.62)] font-sans text-lg">
                No protocols match your current filters.
              </p>
              <p className="text-[rgba(30,37,43,0.42)] font-sans text-sm mt-1">
                Try adjusting your category, skill level, or search terms.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {protocols.map((protocol) => {
                const catAccent = CATEGORY_ACCENT[protocol.category];
                const skillBadge = SKILL_BADGE[protocol.skillLevel];
                const CatIcon = CATEGORY_ICONS[protocol.category];

                return (
                  <Link
                    key={protocol.id}
                    to={`/protocols/${protocol.slug}`}
                    className="group bg-white/60 backdrop-blur-[12px] border border-white/30 rounded-2xl overflow-hidden hover:shadow-panel transition-all duration-200"
                  >
                    {/* Category header */}
                    <div className="px-6 pt-5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CatIcon className={`w-4 h-4 ${catAccent}`} />
                        <span className={`text-xs font-sans font-semibold uppercase tracking-wide ${catAccent}`}>
                          {CATEGORY_LABELS[protocol.category]}
                        </span>
                      </div>
                      {protocol.subcategory && (
                        <span className="text-xs font-sans text-[rgba(30,37,43,0.42)]">
                          {protocol.subcategory}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-6 pt-3">
                      <h3 className="font-sans text-lg font-semibold text-graphite group-hover:text-accent transition-colors leading-snug mb-3">
                        {protocol.title}
                      </h3>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 text-xs font-sans font-medium text-[rgba(30,37,43,0.62)] bg-mn-surface rounded-full px-2.5 py-1">
                          <Clock className="w-3 h-3" />
                          {protocol.durationMinutes} min
                        </span>
                        <span className={`inline-flex items-center text-xs font-sans font-medium rounded-full px-2.5 py-1 ${skillBadge}`}>
                          {SKILL_LABELS[protocol.skillLevel]}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm font-sans text-[rgba(30,37,43,0.62)] leading-relaxed line-clamp-2 mb-4">
                        {protocol.description}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-[rgba(30,37,43,0.06)]">
                        {protocol.ceEligible && protocol.ceCredits ? (
                          <div className="flex items-center gap-1.5 text-accent">
                            <GraduationCap className="w-4 h-4" />
                            <span className="text-sm font-sans font-semibold">
                              {protocol.ceCredits} CE
                            </span>
                          </div>
                        ) : (
                          <span />
                        )}
                        <div className="flex items-center gap-1 text-xs font-sans text-[rgba(30,37,43,0.42)]">
                          <Users className="w-3 h-3" />
                          {protocol.adoptionCount.toLocaleString()} professionals
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Gated CTA ─────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="section-container">
          <BlockReveal>
            <div className="relative bg-mn-dark rounded-section p-10 sm:p-14 text-center overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-accent/[0.06] rounded-bl-[80px]" />
              <div className="relative">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/[0.08] mx-auto mb-6">
                  <Lock className="w-5 h-5 text-accent" />
                </div>
                <h2 className="font-sans font-semibold text-subsection text-[#F7F5F2] mb-4">
                  Access the full protocol library with a professional account
                </h2>
                <p className="text-[rgba(247,245,242,0.55)] font-sans text-base max-w-xl mx-auto mb-8 leading-relaxed">
                  Professional accounts access step-by-step protocols, CE credit tracking,
                  product ordering directly from protocol pages, and personalized protocol
                  recommendations based on your treatment room.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/portal/signup" className="btn-mineral-dark">
                    Request Professional Access
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/brand/apply"
                    className="inline-flex items-center gap-2 rounded-full h-[52px] px-7 bg-white/[0.08] text-[#F7F5F2] font-sans font-medium text-sm border border-white/[0.12] transition-colors hover:bg-white/[0.14]"
                  >
                    Brand Partner Application
                  </Link>
                </div>
              </div>
            </div>
          </BlockReveal>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <SiteFooter />
    </div>
  );
}
